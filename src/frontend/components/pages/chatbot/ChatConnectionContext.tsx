import React, { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from "react";
import { backendActor } from "../../actors/BackendActor";
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
  isVoiceMode: boolean;
  toggleVoiceMode: () => Promise<void>;
  sendTextMessage: (id: string | undefined, text: string) => void;
  restoreConversationContext: (messages: Array<{ id: string, role: "user" | "assistant" | "system"; content: string }>) => void;
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
  setMessage: (id: string, role: "user" | "assistant" | "system", content: string) => void;
  upsertMessage: (id: string, role: "user" | "assistant" | "system", delta: string) => void;
}

export const ChatConnectionProvider: React.FC<ChatConnectionProviderProps> = ({
  children,
  setMessage,
  upsertMessage,
}) => {

  const { invalidateToken } = useAuthToken();
  const [connectionState, setConnectionState] = useState<ConnectionState>({ status: "idle" });
  const [logs, setLogs] = useState<string[]>([]);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const audioTransceiverRef = useRef<RTCRtpTransceiver | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  const { call: consumeAiCredits } = backendActor.authenticated.useUpdateCall({
    functionName: "consume_ai_credits",
  });

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const sendTextMessage = (id: string | undefined, text: string) => {
    if (!dataChannelRef.current || dataChannelRef.current.readyState !== "open") {
      addLog("❌ Data channel not ready");
      return;
    }

    console.log("SEND TEXT MESSAGE:", text);

    try {
      const event = {
        type: "conversation.item.create",
        item: {
          id: id,
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

  const restoreConversationContext = (messages: Array<{ id: string, role: "user" | "assistant" | "system"; content: string }>) => {
    if (!dataChannelRef.current || dataChannelRef.current.readyState !== "open") {
      addLog("❌ Data channel not ready for context restoration");
      return;
    }

    try {
      console.log("RESTORE CONTEXT WITH MESSAGES:", messages);
      addLog(`🔄 Restoring conversation context with ${messages.length} messages...`);

      // Send each message as a conversation item WITHOUT triggering responses
      for (const msg of messages.filter(m => m.role === "user" || m.role === "assistant")) {
        console.log("RESTORING MESSAGE:", msg);
        const event = {
          type: "conversation.item.create",
          item: {
            id: msg.id,
            type: "message",
            role: msg.role,
            content: [
              {
                type: msg.role === "user" ? "input_text" : "output_text",
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

  const toggleVoiceMode = async () => {
    if (!peerConnectionRef.current || !dataChannelRef.current) {
      addLog("❌ Cannot toggle voice mode: no active connection");
      return;
    }

    const newVoiceMode = !isVoiceMode;

    try {
      if (newVoiceMode) {
        // Switching TO voice mode
        addLog("🎤 Requesting microphone access...");
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;

        addLog("✓ Microphone access granted");

        // Add microphone track to peer connection
        const audioTrack = stream.getAudioTracks()[0];
        console.log("MICK TRACK:", {
          enabled: audioTrack.enabled,
          muted: audioTrack.muted,
          readyState: audioTrack.readyState,
          label: audioTrack.label
        });

        const sender = audioTransceiverRef.current?.sender;
        if (!sender) {
          throw("❌ Audio transceiver sender missing");
        } else {
          await sender.replaceTrack(audioTrack);
          addLog("✓ Microphone track attached");
        }

        const senders = peerConnectionRef.current.getSenders();
        console.log(
          senders.map(s => ({
            kind: s.track?.kind,
            enabled: s.track?.enabled,
            muted: s.track?.muted
          }))
        );

        // Update session to voice mode with turn detection
        const sessionUpdate = {
          type: "session.update",
          session: {
            type: "realtime",
            output_modalities: ["audio"],
            audio: {
              input: {
                turn_detection: {
                  type: "server_vad",
                  threshold: 0.5,
                  prefix_padding_ms: 300,
                  silence_duration_ms: 500
                },
                transcription: {
                  model: "gpt-4o-transcribe"
                }
              }
            }
          }
        };
        dataChannelRef.current.send(JSON.stringify(sessionUpdate));
        addLog("📤 Updated session to voice mode with turn detection");

      } else {
        // Switching TO text mode
        addLog("⌨️ Switching to text mode...");

        // Stop microphone
        if (micStreamRef.current) {
          micStreamRef.current.getTracks().forEach(track => track.stop());
          micStreamRef.current = null;
          addLog("✓ Microphone stopped");
        }

        // Update session to text-only mode
        const sessionUpdate = {
          type: "session.update",
          session: {
            type: "realtime",
            output_modalities: ["text"],
          }
        };
        dataChannelRef.current.send(JSON.stringify(sessionUpdate));
        addLog("📤 Updated session to text mode");
      }

      setIsVoiceMode(newVoiceMode);
      addLog(`✓ Switched to ${newVoiceMode ? 'voice' : 'text'} mode`);

    } catch (error: any) {
      addLog(`❌ Failed to toggle voice mode: ${error.message}`);
      console.error("Voice mode toggle error:", error);
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

      // Add audio transceiver - sendrecv to support both listening and speaking
      const audioTransceiver = pc.addTransceiver("audio", { direction: "sendrecv" });
      audioTransceiverRef.current = audioTransceiver;

      // Set up data channel for sending and receiving events
      const dc = pc.createDataChannel("oai-events");
      dataChannelRef.current = dc;
      addLog("✓ Data channel 'oai-events' created");

      dc.onopen = () => {
        addLog("✓ Data channel opened");

        // Update connection state to ready (connection established AND data channel open)
        setConnectionState({ status: "ready" });

        // Configure session - start in text mode, but with transcription enabled for when voice is activated
        const sessionConfig = {
          type: "session.update",
          session: {
            modalities: ["text"],
            instructions: "You are an assistant designed to help the user answer questions on intellectual property (IP). Your are embedded in the BIPQuantum website, which is a platform that delivers digital certificate that leverages blockchain technology to provide secure and immutable proof of ownership and authenticity for intellectual properties. You will answer technical questions on IP and guide the user through the process of creating a new IP certificate. You won't answer questions that are not related to IP, blockchain, or the BIPQuantum platform.",
            voice: "alloy",
            input_audio_format: "pcm16",
            output_audio_format: "pcm16",
            input_audio_transcription: {
              model: "whisper-1"
            },
            turn_detection: null,
            tools: [],
            tool_choice: "auto",
            temperature: 0.8,
            max_response_output_tokens: "inf"
          }
        };

        dc.send(JSON.stringify(sessionConfig));
        addLog("📤 Sent session.update (text-only mode)");
      };

      dc.onclose = () => {
        addLog("⚠️ Data channel closed");
      };

      dc.onerror = (error) => {
        addLog(`❌ Data channel error: ${error}`);
      };

      dc.onmessage = (event : MessageEvent) => {
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
                upsertMessage(data.item_id, "assistant", deltaText);
              }
              break;

            // Handle response.output_text.done (final complete text)
            case "response.output_text.done":
              if (data.text) {
                addLog(`✓ Text done: "${data.text.substring(0, 50)}${data.text.length > 50 ? '...' : ''}"`);
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
              break;

            case "session.created":
              addLog("✓ Session created");
              break;

            case "session.updated":
              addLog("✓ Session updated: " + JSON.stringify(data));
              break;

            case "conversation.item.added":
              console.log("CONVERSATION ITEM ADDED EVENT", data);
              const item = data.item;
              const matchingRole = (item.role === "user" || item.role === "assistant");
              const matchingContent = (item.content.length > 0 && (item.content?.[0]?.type === "input_text" || item.content?.[0]?.type === "output_text"));
              if (matchingRole && matchingContent) {
                setMessage(item.id, item.role, item.content[0].text);
                console.log("CONVERSATION ITEM ADDED:", data.item.content);
              }
              addLog(`✓ Conversation item created: ${item?.id || 'unknown'}`);
              break;

            case "response.output_audio_transcript.delta":
              upsertMessage(data.item_id, "assistant", data.delta);
              break;

            case "response.output_audio_transcript.done":
              if (data.transcript) {
                addLog(`🎤 Assistant said (audio transcription): "${data.transcript.substring(0, 50)}${data.transcript.length > 50 ? '...' : ''}"`);
              }
              break;

            case "conversation.item.input_audio_transcription.delta":
              upsertMessage(data.item_id, "user", data.delta);
              break;

            case "conversation.item.input_audio_transcription.completed":
              if (data.transcript) {
                addLog(`🎤 User said: "${data.transcript.substring(0, 50)}${data.transcript.length > 50 ? '...' : ''}"`);
              }
              break;

            case "input_audio_buffer.speech_started":
              addLog("🎤 User started speaking");
              break;

            case "conversation.input_text.delta":
            case "response.output_text.delta":
              addLog(`IT WORKS! Text delta: "${data.delta}"`);
              break;

            case "input_audio_buffer.speech_stopped":
              addLog("🎤 User stopped speaking");
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
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
      addLog("🎤 Microphone stopped");
    }
    setConnectionState({ status: "idle" });
    setIsVoiceMode(false);
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
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const value: ChatConnectionContextType = {
    connectionState,
    logs,
    dataChannelRef,
    isVoiceMode,
    toggleVoiceMode,
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
