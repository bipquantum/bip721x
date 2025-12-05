import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";
import { useActors } from "../../../common/ActorsContext";
import { useChatHistory } from "../../../layout/ChatHistoryContext";

type ConnectionState =
  | { status: "idle" }
  | { status: "connecting" }
  | { status: "connected" }
  | { status: "failed"; error: string }
  | { status: "disconnected" };

interface ChatConnectionContextType {
  connectionState: ConnectionState;
  logs: string[];
  showDebugPanel: boolean;
  dataChannelRef: React.MutableRefObject<RTCDataChannel | null>;
  addLog: (message: string) => void;
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
  chatId: string;
  children: ReactNode;
}

export const ChatConnectionProvider: React.FC<ChatConnectionProviderProps> = ({ chatId, children }) => {
  const { authenticated } = useActors();
  const { messages, addMessage, updateLastMessage, saveMessages } = useChatHistory();
  const [connectionState, setConnectionState] = useState<ConnectionState>({ status: "idle" });
  const [logs, setLogs] = useState<string[]>([]);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const streamingContentRef = useRef<string>("");

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
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
            modalities: ["text"],
            instructions: "You are an assistant designed to help the user answer questions on intellectual property (IP). Your are embedded in the BIPQuantum website, which is a platform that delivers digital certificate that leverages blockchain technology to provide secure and immutable proof of ownership and authenticity for intellectual properties. You will answer technical questions on IP and guide the user through the process of creating a new IP certificate. You won't answer questions that are not related to IP, blockchain, or the BIPQuantum platform.",
            voice: "alloy",
            input_audio_format: "pcm16",
            output_audio_format: "pcm16",
            input_audio_transcription: null,
            turn_detection: null,
            tools: [],
            tool_choice: "auto",
            temperature: 0.8,
            max_response_output_tokens: "inf"
          }
        };

        dc.send(JSON.stringify(sessionConfig));
        addLog("📤 Sent session.update (text-only mode)");
        addMessage("system", "Connection established. Text-only mode configured. You can now start chatting!");
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
            // Handle response.output_text.delta (streaming text chunks)
            case "response.output_text.delta":
              if (data.delta) {
                const deltaText = data.delta;
                addLog(`💬 Text delta: "${deltaText.substring(0, 30)}${deltaText.length > 30 ? '...' : ''}"`);

                if (streamingContentRef.current === "") {
                  // First delta - create new message
                  console.log('Creating new assistant message');
                  streamingContentRef.current = deltaText;
                  addMessage("assistant", deltaText, true);
                } else {
                  // Subsequent deltas - append to existing message
                  console.log('Appending delta to message');
                  streamingContentRef.current += deltaText;
                  updateLastMessage(streamingContentRef.current, true);
                }
              }
              break;

            // Handle response.output_text.done (final complete text)
            case "response.output_text.done":
              if (data.text) {
                addLog(`✓ Text done: "${data.text.substring(0, 50)}${data.text.length > 50 ? '...' : ''}"`);
                // Mark as done streaming (auto-save will trigger)
                if (streamingContentRef.current !== "") {
                  updateLastMessage(streamingContentRef.current, false);
                  streamingContentRef.current = ""; // Reset for next message
                }
              }
              break;

            case "response.done":
              addLog("✓ Response complete");
              break;

            case "error":
              addLog(`❌ Error from server: ${data.error?.message || 'Unknown error'}`);
              addMessage("system", `Error: ${data.error?.message || 'Unknown error'}`);
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

      const authTokenResult = await authenticated.backend.get_chatbot_ephemeral_token();
      if ('err' in authTokenResult) {
        throw new Error(`Failed to get auth token: ${authTokenResult.err}`);
      }
      addLog("✓ Obtained ephemeral auth token response");
      addLog(`Raw token response: ${authTokenResult.ok.substring(0, 200)}...`);

      // Parse the JSON response to extract the token
      let ephemeralToken: string;
      try {
        const tokenData = JSON.parse(authTokenResult.ok);

        // Check if the response contains an error from OpenAI
        if (tokenData.error) {
          addLog(`❌ OpenAI API error: ${JSON.stringify(tokenData.error)}`);
          throw new Error(`OpenAI API error: ${tokenData.error.message || JSON.stringify(tokenData.error)}`);
        }

        // Extract the token
        if (!tokenData.value) {
          addLog(`❌ Invalid token response structure: ${JSON.stringify(tokenData)}`);
          throw new Error("Invalid token response: missing client_secret value");
        }

        ephemeralToken = tokenData.value;
        addLog(`✓ Extracted ephemeral token: ${ephemeralToken.substring(0, 20)}...`);
      } catch (parseError: any) {
        addLog(`❌ Failed to parse token response: ${parseError.message}`);
        addLog(`Full raw response: ${authTokenResult.ok}`);
        throw new Error(`Failed to parse ephemeral token: ${parseError.message}`);
      }

      addLog("📡 Calling OpenAI Realtime API...");
      const sdpResponse = await fetch("https://api.openai.com/v1/realtime/calls", {
        method: "POST",
        body: offer.sdp,
        headers: {
            Authorization: `Bearer ${ephemeralToken}`,
            "Content-Type": "application/sdp",
        },
      });

      if (!sdpResponse.ok) {
        const errorText = await sdpResponse.text();
        addLog(`❌ OpenAI API error (${sdpResponse.status}): ${errorText}`);
        throw new Error(`OpenAI API returned ${sdpResponse.status}: ${errorText}`);
      }

      const answerSdp = await sdpResponse.text();
      addLog(`✓ Received SDP answer from OpenAI (${answerSdp.length} bytes)`);

      const answer : RTCSessionDescriptionInit = {
          type: "answer",
          sdp: answerSdp,
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
    // Note: We don't clear messages here - they're managed by ChatHistoryContext
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
    showDebugPanel,
    dataChannelRef,
    addLog,
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
