import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";
import { useActors } from "../../../common/ActorsContext";

type ConnectionState =
  | { status: "idle" }
  | { status: "connecting" }
  | { status: "connected" }
  | { status: "failed"; error: string }
  | { status: "disconnected" };

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface ChatConnectionContextType {
  connectionState: ConnectionState;
  logs: string[];
  chatMessages: ChatMessage[];
  showDebugPanel: boolean;
  dataChannelRef: React.MutableRefObject<RTCDataChannel | null>;
  addLog: (message: string) => void;
  addChatMessage: (role: "user" | "assistant" | "system", content: string) => void;
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  sendTextMessage: (text: string) => void;
  initSession: () => Promise<void>;
  disconnect: () => void;
  clearLogs: () => void;
  setShowDebugPanel: React.Dispatch<React.SetStateAction<boolean>>;
  getStatusColor: () => string;
  getStatusIcon: () => string;
  getStatusText: () => string;
}

const ChatConnectionContext = createContext<ChatConnectionContextType | undefined>(undefined);

export const useChatConnection = () => {
  const context = useContext(ChatConnectionContext);
  if (!context) {
    throw new Error("useChatConnection must be used within ChatConnectionProvider");
  }
  return context;
};

interface ChatConnectionProviderProps {
  children: ReactNode;
}

export const ChatConnectionProvider: React.FC<ChatConnectionProviderProps> = ({ children }) => {
  const { authenticated } = useActors();
  const [connectionState, setConnectionState] = useState<ConnectionState>({ status: "idle" });
  const [logs, setLogs] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const addChatMessage = (role: "user" | "assistant" | "system", content: string) => {
    setChatMessages(prev => [...prev, { role, content, timestamp: new Date() }]);
  };

  const sendTextMessage = (text: string) => {
    if (!dataChannelRef.current || dataChannelRef.current.readyState !== "open") {
      addLog("❌ Data channel not ready");
      return;
    }

    try {
      // Create a conversation.item.create event with text content
      const event = {
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [
            {
              type: "input_text",
              text: text
            }
          ]
        }
      };

      dataChannelRef.current.send(JSON.stringify(event));
      addLog(`📤 Sent text message: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);

      // Trigger a response
      const responseEvent = {
        type: "response.create"
      };
      dataChannelRef.current.send(JSON.stringify(responseEvent));
      addLog("📤 Requested response from AI");

    } catch (error: any) {
      addLog(`❌ Error sending message: ${error.message}`);
    }
  };

  const initSession = async () => {
    if (!authenticated?.backend) {
      addLog("❌ Error: Not authenticated");
      setConnectionState({ status: "failed", error: "Not authenticated" });
      return;
    }

    try {
      setConnectionState({ status: "connecting" });
      addLog("🔄 Starting session initialization...");

      // Create a peer connection
      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;
      addLog("✓ RTCPeerConnection created");

      // Set up to play remote audio from the model
      if (!audioElementRef.current) {
        audioElementRef.current = document.createElement("audio");
        audioElementRef.current.autoplay = true;
      }

      pc.ontrack = (e) => {
        addLog(`✓ Received remote track: ${e.track.kind}`);
        if (audioElementRef.current) {
          audioElementRef.current.srcObject = e.streams[0];
        }
      };

      // For text-only mode, we still need a media track for WebRTC
      addLog("🔇 Creating silent audio track (text-only mode)...");
      try {
        const ms = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        addLog("✓ Microphone access granted (will be muted for text-only)");
        pc.addTrack(ms.getTracks()[0]);
        // Mute the track since we're in text-only mode
        ms.getTracks()[0].enabled = false;
        addLog("✓ Audio track added (muted for text-only mode)");
      } catch (error: any) {
        addLog(`⚠️ Could not get microphone: ${error.message}`);
        addLog("ℹ️ Continuing without audio track...");
      }

      // Set up data channel for sending and receiving events
      const dc = pc.createDataChannel("oai-events");
      dataChannelRef.current = dc;
      addLog("✓ Data channel 'oai-events' created");

      dc.onopen = () => {
        addLog("✓ Data channel opened");

        // Configure session for text-only mode
        const sessionConfig = {
          type: "session.update",
          session: {
            type: "realtime",
            model: "gpt-realtime",
            output_modalities: ["text"],
            instructions: "You are an assistant designed to help the user answer questions on intellectual property (IP). Your are embedded in the BIPQuantum website, which is a platform that delivers digital certificate that leverages blockchain technology to provide secure and immutable proof of ownership and authenticity for intellectual properties. You will answer technical questions on IP and guide the user through the process of creating a new IP certificate. You won't answer questions that are not related to IP, blockchain, or the BIPQuantum platform.",
          }
        };

        dc.send(JSON.stringify(sessionConfig));
        addLog("📤 Sent session.update (text-only mode)");
        addChatMessage("system", "Connection established. Text-only mode configured. You can now start chatting!");
      };

      dc.onclose = () => {
        addLog("⚠️ Data channel closed");
      };

      dc.onerror = (error) => {
        addLog(`❌ Data channel error: ${error}`);
      };

      dc.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          addLog(`📩 Received event: ${data.type}`);

          // Debug: Log the full event data for text responses
          if (data.type?.includes('text') || data.type?.includes('content')) {
            console.log('Text event data:', JSON.stringify(data, null, 2));
          }

          // Handle different event types
          switch (data.type) {
            // Handle response.output_text.delta (the actual event from OpenAI)
            case "response.output_text.delta":
              if (data.delta) {
                const deltaText = data.delta;
                addLog(`💬 Output text delta: "${deltaText.substring(0, 30)}${deltaText.length > 30 ? '...' : ''}"`);
                setChatMessages(prev => {
                  const lastMsg = prev[prev.length - 1];
                  if (lastMsg && lastMsg.role === "assistant" &&
                      new Date().getTime() - lastMsg.timestamp.getTime() < 5000) {
                    // Append to existing message
                    return [
                      ...prev.slice(0, -1),
                      { ...lastMsg, content: lastMsg.content + deltaText, isStreaming: true }
                    ];
                  } else {
                    // Create new message
                    return [...prev, {
                      role: "assistant",
                      content: deltaText,
                      timestamp: new Date(),
                      isStreaming: true
                    }];
                  }
                });
              }
              break;

            // Handle response.output_text.done (final text)
            case "response.output_text.done":
              if (data.text) {
                addLog(`✓ Output text done: "${data.text.substring(0, 50)}${data.text.length > 50 ? '...' : ''}"`);
                // Update the last assistant message with final text if available
                setChatMessages(prev => {
                  const lastMsg = prev[prev.length - 1];
                  if (lastMsg && lastMsg.role === "assistant") {
                    // Replace with final text and mark as not streaming
                    if (lastMsg.content !== data.text) {
                      return [
                        ...prev.slice(0, -1),
                        { ...lastMsg, content: data.text, isStreaming: false }
                      ];
                    } else {
                      // Same content, just mark as done streaming
                      return [
                        ...prev.slice(0, -1),
                        { ...lastMsg, isStreaming: false }
                      ];
                    }
                  }
                  return prev;
                });
              }
              break;

            case "response.done":
              addLog("✓ Response complete");
              break;

            case "error":
              addLog(`❌ Error from server: ${data.error?.message || 'Unknown error'}`);
              addChatMessage("system", `Error: ${data.error?.message || 'Unknown error'}`);
              break;

            case "session.created":
              addLog("✓ Session created");
              break;

            case "session.updated":
              addLog("✓ Session updated");
              break;

            case "conversation.item.created":
              addLog(`✓ Conversation item created: ${data.item?.id || 'unknown'}`);
              break;

            default:
              addLog(`📩 Event: ${data.type}`);
          }
        } catch (error) {
          addLog(`⚠️ Error parsing message: ${event.data}`);
        }
      };

      // Monitor connection state changes
      pc.onconnectionstatechange = () => {
        addLog(`🔗 Connection state: ${pc.connectionState}`);

        switch (pc.connectionState) {
          case "connected":
            setConnectionState({ status: "connected" });
            break;
          case "disconnected":
          case "closed":
            setConnectionState({ status: "disconnected" });
            break;
          case "failed":
            setConnectionState({ status: "failed", error: "Connection failed" });
            break;
        }
      };

      pc.oniceconnectionstatechange = () => {
        addLog(`🧊 ICE connection state: ${pc.iceConnectionState}`);
      };

      pc.onicegatheringstatechange = () => {
        addLog(`🧊 ICE gathering state: ${pc.iceGatheringState}`);
      };

      // Create and set local description
      addLog("📝 Creating SDP offer...");
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      addLog("✓ Local description set");

      if (!offer.sdp) {
        throw new Error("SDP offer is empty");
      }

      // Call the backend's init_chatbot_session method
      addLog("📡 Calling init_chatbot_session on backend...");
      const result = await authenticated.backend.init_chatbot_session(offer.sdp);

      if ('err' in result) {
        addLog(`❌ Backend error: ${result.err}`);
        throw new Error(result.err);
      }

      addLog("✓ Received SDP answer from backend");
      console.log("SDP answer:", result.ok.substring(0, 100));

      // Set remote description from the answer
      const answer: RTCSessionDescriptionInit = {
        type: "answer",
        sdp: result.ok,
      };

      await pc.setRemoteDescription(answer);
      addLog("✓ Remote description set");
      addLog("🎉 Session initialization complete!");

    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      addLog(`❌ Error: ${errorMessage}`);
      setConnectionState({ status: "failed", error: errorMessage });
      console.error("Session initialization error:", error);
    }
  };

  const disconnect = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
      addLog("🔌 Disconnected");
    }
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }
    setConnectionState({ status: "idle" });
    setChatMessages([]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getStatusColor = () => {
    switch (connectionState.status) {
      case "idle":
        return "text-gray-600 dark:text-gray-400";
      case "connecting":
        return "text-yellow-600 dark:text-yellow-400";
      case "connected":
        return "text-green-600 dark:text-green-400";
      case "failed":
        return "text-red-600 dark:text-red-400";
      case "disconnected":
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getStatusIcon = () => {
    switch (connectionState.status) {
      case "idle":
        return "⚪";
      case "connecting":
        return "🔄";
      case "connected":
        return "🟢";
      case "failed":
        return "🔴";
      case "disconnected":
        return "⚫";
    }
  };

  const getStatusText = () => {
    switch (connectionState.status) {
      case "idle":
        return "Not connected";
      case "connecting":
        return "Connecting...";
      case "connected":
        return "Connected";
      case "failed":
        return `Failed: ${connectionState.error}`;
      case "disconnected":
        return "Disconnected";
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (dataChannelRef.current) {
        dataChannelRef.current.close();
      }
    };
  }, []);

  // Handle keyboard shortcut Ctrl+Alt+D to toggle debug panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key === 'd') {
        e.preventDefault();
        setShowDebugPanel(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const value: ChatConnectionContextType = {
    connectionState,
    logs,
    chatMessages,
    showDebugPanel,
    dataChannelRef,
    addLog,
    addChatMessage,
    setChatMessages,
    sendTextMessage,
    initSession,
    disconnect,
    clearLogs,
    setShowDebugPanel,
    getStatusColor,
    getStatusIcon,
    getStatusText,
  };

  return (
    <ChatConnectionContext.Provider value={value}>
      {children}
    </ChatConnectionContext.Provider>
  );
};
