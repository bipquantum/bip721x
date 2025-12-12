import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";
import { backendActor } from "../../actors/BackendActor";
import { useAuth } from "@nfid/identitykit/react";
import { useAuthToken } from "./AuthTokenContext";
import { showCreditsDepletedToast } from "./CreditsDepletedToast";

type ConnectionState =
  | { status: "idle" }
  | { status: "connecting" }
  | { status: "connected" }
  | { status: "ready" }
  | { status: "failed"; error: string }
  | { status: "disconnected" };

interface ChatConnectionContextType {
  connectionState: ConnectionState;
  logs: string[];
  dataChannelRef: React.MutableRefObject<RTCDataChannel | null>;
  sendTextMessage: (text: string) => void;
  restoreConversationContext: (messages: Array<{ role: "user" | "assistant" | "system"; content: string }>) => void;
  initSession: (authToken: string) => Promise<void>;
  disconnect: () => void;
  clearLogs: () => void;
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
  addMessage: (role: "user" | "assistant" | "system", content: string, isStreaming?: boolean) => void;
  updateLastMessage: (content: string, isStreaming?: boolean) => void;
}

export const ChatConnectionProvider: React.FC<ChatConnectionProviderProps> = ({
  children,
  addMessage,
  updateLastMessage,
}) => {
  
  const { invalidateToken } = useAuthToken();
  const [connectionState, setConnectionState] = useState<ConnectionState>({ status: "idle" });
  const [logs, setLogs] = useState<string[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const streamingContentRef = useRef<string>("");

  const { call: consumeAiCredits } = backendActor.authenticated.useUpdateCall({
    functionName: "consume_ai_credits",
  });

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

  const restoreConversationContext = (messages: Array<{ role: "user" | "assistant" | "system"; content: string }>) => {
    if (!dataChannelRef.current || dataChannelRef.current.readyState !== "open") {
      addLog("❌ Data channel not ready for context restoration");
      return;
    }

    try {
      addLog(`🔄 Restoring conversation context with ${messages.length} messages...`);

      // Send each message as a conversation item WITHOUT triggering responses
      for (const msg of messages.filter(m => m.role === "user" || m.role === "assistant")) {
        const event = {
          type: "conversation.item.create",
          item: {
            type: "message",
            role: msg.role,
            content: [
              {
                type: msg.role === "user" ? "input_text" : "text",
                text: msg.content
              }
            ]
          }
        };

        dataChannelRef.current.send(JSON.stringify(event));
      }

      addLog(`✓ Context restored with ${messages.length} messages`);
    } catch (error: any) {
      addLog(`❌ Error restoring context: ${error.message}`);
    }
  };

  const initSession = async (authToken: string) => {

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

      // Text-only mode - create silent audio track without microphone permission
      addLog("🔇 Creating silent audio track (text-only mode)...");
      try {
        // Create a silent audio track using AudioContext
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const destination = audioContext.createMediaStreamDestination();
        oscillator.connect(destination);
        oscillator.start();

        const silentStream = destination.stream;
        silentStream.getAudioTracks().forEach((track: MediaStreamTrack) => {
          pc.addTrack(track, silentStream);
        });

        addLog("✓ Silent audio track added (no microphone needed)");
      } catch (error: any) {
        addLog(`⚠️ Could not create silent audio track: ${error.message}`);
        addLog("ℹ️ Continuing without audio track...");
      }

      // Set up data channel for sending and receiving events
      const dc = pc.createDataChannel("oai-events");
      dataChannelRef.current = dc;
      addLog("✓ Data channel 'oai-events' created");

      dc.onopen = () => {
        addLog("✓ Data channel opened");

        // Update connection state to ready (connection established AND data channel open)
        setConnectionState({ status: "ready" });

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

              // Capture token usage from the response
              if (data.response?.usage) {
                const usage = data.response.usage;
                const totalTokens = usage.total_tokens || 0;
                const inputTokens = usage.input_tokens || 0;
                const outputTokens = usage.output_tokens || 0;

                addLog(`📊 Token usage - Total: ${totalTokens}, Input: ${inputTokens}, Output: ${outputTokens}`);
                console.log("Token usage:", { totalTokens, inputTokens, outputTokens });

                // Consume AI credits based on token usage
                if (totalTokens > 0) {
                  consumeAiCredits([{ tokens: totalTokens }])
                    .then((result) => {
                      if (result && 'ok' in result) {
                        const remainingCredits = result.ok;
                        addLog(`💳 Consumed ${totalTokens} credits (${remainingCredits} remaining)`);

                        // Check if credits are depleted
                        if (remainingCredits <= 0n) {
                          const errorMsg = "You've used all your AI credits for this period.";
                          addLog(`⚠️ ${errorMsg}`);

                          // Show credits depleted toast
                          showCreditsDepletedToast();

                          // Disconnect the session
                          if (peerConnectionRef.current) {
                            peerConnectionRef.current.close();
                            peerConnectionRef.current = null;
                          }
                          if (dataChannelRef.current) {
                            dataChannelRef.current.close();
                            dataChannelRef.current = null;
                          }
                          setConnectionState({ status: "failed", error: errorMsg });
                          invalidateToken();
                          addMessage("system", `${errorMsg} Please upgrade your plan to continue.`);
                        }
                      } else if (result && 'Err' in result) {
                        addLog(`⚠️ Failed to consume credits: ${result.Err}`);
                      }
                    })
                    .catch((error) => {
                      addLog(`⚠️ Failed to consume credits: ${error}`);
                    });
                }
              }
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
            // Peer connection established - data channel onopen will set status to "ready"
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

      addLog("📡 Calling OpenAI Realtime API...");
      const sdpResponse = await fetch("https://api.openai.com/v1/realtime/calls", {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${authToken}`,
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
        return "text-blue-600 dark:text-blue-400";
      case "ready":
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
        return "🟡";
      case "connected":
        return "🔵";
      case "ready":
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
        return "Connected (preparing...)";
      case "ready":
        return "Ready";
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

  const value: ChatConnectionContextType = {
    connectionState,
    logs,
    dataChannelRef,
    sendTextMessage,
    restoreConversationContext,
    initSession,
    disconnect,
    clearLogs,
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
