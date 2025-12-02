import { useState, useRef, useEffect } from "react";
import { useActors } from "../../common/ActorsContext";
import { useAuth } from "@nfid/identitykit/react";
import Markdown from "react-markdown";
import UserImage from "../../common/UserImage";
import CopyIcon from "../../common/CopyIcon";
import AiBot from "../../../assets/ai-bot.png";
import SpinnerSvg from "../../../assets/spinner.svg";
import { BiMicrophone } from "react-icons/bi";
import { IoArrowUp } from "react-icons/io5";
import AutoResizeTextarea, {
  AutoResizeTextareaHandle,
} from "../../common/AutoResizeTextArea";

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

// Component for gradual text reveal
const TypewriterText = ({ text, isStreaming }: { text: string; isStreaming?: boolean }) => {
  const [displayedText, setDisplayedText] = useState("");
  const displayedLengthRef = useRef(0);

  useEffect(() => {
    // If not streaming anymore, show all remaining text immediately
    if (!isStreaming && displayedText !== text) {
      setDisplayedText(text);
      displayedLengthRef.current = text.length;
      return;
    }

    // If streaming and we have more text to display
    if (isStreaming && displayedLengthRef.current < text.length) {
      const timer = setTimeout(() => {
        displayedLengthRef.current += 1;
        setDisplayedText(text.slice(0, displayedLengthRef.current));
      }, 15); // 15ms per character

      return () => clearTimeout(timer);
    }
  }, [text, displayedText, isStreaming]);

  // Reset when we get a completely new message (text becomes shorter)
  useEffect(() => {
    if (text.length < displayedLengthRef.current) {
      setDisplayedText("");
      displayedLengthRef.current = 0;
    }
  }, [text.length]);

  return (
    <>
      {displayedText}
      {isStreaming && displayedLengthRef.current < text.length && (
        <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-current"></span>
      )}
    </>
  );
};

// Markdown components for consistent styling
const MARKDOWN_COMPONENTS = {
  h1: ({ node, ...props }: any) => (
    <h1 className="text-xl font-bold sm:text-2xl" {...props} />
  ),
  h2: ({ node, ...props }: any) => (
    <h2 className="text-lg font-semibold sm:text-xl" {...props} />
  ),
  h3: ({ node, ...props }: any) => (
    <h3 className="text-md font-medium sm:text-lg" {...props} />
  ),
};

const TestSession = () => {
  const { authenticated } = useActors();
  const { user } = useAuth();
  const [connectionState, setConnectionState] = useState<ConnectionState>({ status: "idle" });
  const [logs, setLogs] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<AutoResizeTextareaHandle>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const addChatMessage = (role: "user" | "assistant" | "system", content: string) => {
    setChatMessages(prev => [...prev, { role, content, timestamp: new Date() }]);
  };

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Auto-connect on mount
  useEffect(() => {
    if (authenticated?.backend && connectionState.status === "idle") {
      initSession();
    }

    // Cleanup on unmount
    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (dataChannelRef.current) {
        dataChannelRef.current.close();
      }
    };
  }, [authenticated?.backend]);

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
      addChatMessage("user", text);

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

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    sendTextMessage(inputMessage);
    inputRef.current?.clear();
    setInputMessage("");
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
      // Create a silent audio track instead of requesting microphone
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
            case "response.text.delta":
              // Append text delta to the current assistant message
              if (data.delta) {
                addLog(`💬 Text delta: "${data.delta.substring(0, 50)}${data.delta.length > 50 ? '...' : ''}"`);
                // Update or add assistant message
                setChatMessages(prev => {
                  const lastMsg = prev[prev.length - 1];
                  if (lastMsg && lastMsg.role === "assistant" &&
                      new Date().getTime() - lastMsg.timestamp.getTime() < 1000) {
                    // Update existing message
                    return [
                      ...prev.slice(0, -1),
                      { ...lastMsg, content: lastMsg.content + data.delta }
                    ];
                  } else {
                    // Create new message
                    return [...prev, {
                      role: "assistant",
                      content: data.delta,
                      timestamp: new Date()
                    }];
                  }
                });
              }
              break;

            case "response.text.done":
              addLog(`✓ Response text complete: "${data.text?.substring(0, 50) || ''}${(data.text?.length || 0) > 50 ? '...' : ''}"`);
              if (data.text) {
                setChatMessages(prev => {
                  const lastMsg = prev[prev.length - 1];
                  if (lastMsg && lastMsg.role === "assistant" &&
                      new Date().getTime() - lastMsg.timestamp.getTime() < 2000) {
                    // Replace with final text
                    return [
                      ...prev.slice(0, -1),
                      { ...lastMsg, content: data.text }
                    ];
                  } else {
                    // Add as new message
                    return [...prev, {
                      role: "assistant",
                      content: data.text,
                      timestamp: new Date()
                    }];
                  }
                });
              }
              break;

            // Handle response.output_item.done which contains the final text
            case "response.output_item.done":
              if (data.item?.content) {
                const textContent = data.item.content.find((c: any) => c.type === 'text');
                if (textContent?.text) {
                  addLog(`✓ Output item text: "${textContent.text.substring(0, 50)}${textContent.text.length > 50 ? '...' : ''}"`);
                  addChatMessage("assistant", textContent.text);
                }
              }
              break;

            // Handle response.content_part.done for streaming
            case "response.content_part.done":
              if (data.part?.text) {
                addLog(`✓ Content part text: "${data.part.text.substring(0, 50)}${data.part.text.length > 50 ? '...' : ''}"`);
                setChatMessages(prev => {
                  const lastMsg = prev[prev.length - 1];
                  if (lastMsg && lastMsg.role === "assistant" &&
                      new Date().getTime() - lastMsg.timestamp.getTime() < 5000) {
                    // Update existing message
                    return [
                      ...prev.slice(0, -1),
                      { ...lastMsg, content: data.part.text }
                    ];
                  } else {
                    // Add as new message
                    return [...prev, {
                      role: "assistant",
                      content: data.part.text,
                      timestamp: new Date()
                    }];
                  }
                });
              }
              break;

            // Handle delta events for streaming text
            case "response.content_part.delta":
              if (data.delta?.text) {
                addLog(`💬 Content delta: "${data.delta.text.substring(0, 50)}${data.delta.text.length > 50 ? '...' : ''}"`);
                setChatMessages(prev => {
                  const lastMsg = prev[prev.length - 1];
                  if (lastMsg && lastMsg.role === "assistant" &&
                      new Date().getTime() - lastMsg.timestamp.getTime() < 1000) {
                    // Append to existing message
                    return [
                      ...prev.slice(0, -1),
                      { ...lastMsg, content: lastMsg.content + data.delta.text }
                    ];
                  } else {
                    // Create new message
                    return [...prev, {
                      role: "assistant",
                      content: data.delta.text,
                      timestamp: new Date()
                    }];
                  }
                });
              }
              break;

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
        throw new Error(result.err);
      }

      addLog("✓ Received SDP answer from backend");

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

  return (
    <div className="flex w-full max-w-6xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-momentum text-3xl font-bold text-black dark:text-white">
          Realtime Chatbot Session Test
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Test the WebRTC connection to OpenAI's realtime chatbot API with text chat
        </p>
      </div>

      {/* Chat and Debug Panel Row */}
      <div className={`grid grid-cols-1 gap-4 ${showDebugPanel ? 'lg:grid-cols-2' : ''}`}>
        {/* Chat Interface */}
        <div className="rounded-lg border border-gray-300 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-black dark:text-white">
            Chat
          </h2>

          {/* Chat Messages */}
          <div className="mb-4 h-96 overflow-y-auto rounded bg-gray-50 p-4 text-sm leading-normal dark:bg-gray-900 sm:text-lg sm:leading-relaxed">
            {chatMessages.filter(msg => msg.role !== "system").length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                Connect to start chatting with the AI...
              </p>
            ) : (
              chatMessages.filter(msg => msg.role !== "system").map((msg, index) => {
                if (msg.role === "user") {
                  // User messages - right aligned with user image and colored background
                  return (
                    <div key={index} className="mb-3 flex flex-row justify-end gap-2 py-2">
                      <span className="flex flex-col px-5"></span>
                      <div className="markdown-link flex items-center rounded-xl bg-gradient-to-t from-primary to-secondary px-3 py-0 text-white sm:px-4 sm:py-2">
                        {msg.content}
                      </div>
                      <UserImage principal={user?.principal} />
                    </div>
                  );
                } else {
                  // Assistant messages - left aligned with AI image and light background
                  return (
                    <div key={index} className="mb-3 flex flex-row gap-2 py-2">
                      <img src={AiBot} className="h-10 rounded-full" alt="AI" />
                      <div className="markdown-link flex flex-col gap-3 rounded-xl bg-gray-200 px-3 py-2 text-gray-900 dark:bg-gray-700 dark:text-gray-100 sm:px-4 sm:py-2">
                        {msg.isStreaming ? (
                          <>
                            <Markdown components={MARKDOWN_COMPONENTS}>
                              {msg.content}
                            </Markdown>
                            <img
                              src={SpinnerSvg}
                              className="h-5 w-5 self-end dark:invert"
                              alt="Typing..."
                            />
                          </>
                        ) : (
                          <>
                            <Markdown components={MARKDOWN_COMPONENTS}>
                              {msg.content}
                            </Markdown>
                            <div
                              className="mb-2 mt-1 h-5 w-5 cursor-pointer self-end sm:mb-1 sm:mt-0 sm:h-6 sm:w-6"
                              onClick={() => navigator.clipboard.writeText(msg.content)}
                            >
                              <CopyIcon className="text-gray-700 dark:text-white hover:text-black" />
                            </div>
                          </>
                        )}
                      </div>
                      <span className="flex flex-col px-5"></span>
                    </div>
                  );
                }
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="flex w-full flex-col gap-2">
            <div className="relative flex w-full flex-row items-center gap-2">
              <div className="flex flex-1 items-center justify-between gap-2 rounded-2xl border bg-white px-3 py-[6px]">
                <AutoResizeTextarea
                  ref={inputRef}
                  placeholder={
                    connectionState.status === "connected"
                      ? "What do you want to protect?"
                      : "Connect to start chatting..."
                  }
                  onChange={(value) => {
                    if (bottomRef.current) {
                      bottomRef.current.scrollIntoView({ behavior: "instant" });
                    }
                    setInputMessage(value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (inputMessage.trim()) {
                        handleSendMessage();
                      }
                    }
                  }}
                  disabled={connectionState.status !== "connected"}
                />
              </div>
              <div className="group flex h-[36px] w-[36px] items-center justify-center self-end rounded-full bg-gray-200 px-1 text-black">
                <BiMicrophone size={35} color="gray" />
                <span className="absolute z-50 hidden w-max items-center rounded bg-black px-2 py-1 text-sm text-white opacity-75 group-hover:flex">
                  Disabled (text-only mode)
                </span>
              </div>
              <button
                onClick={() => {
                  if (inputMessage) handleSendMessage();
                }}
                disabled={connectionState.status !== "connected" || !inputMessage.trim()}
                className="flex h-[36px] w-[36px] items-center justify-center self-end rounded-full bg-gray-200 disabled:opacity-50"
              >
                <IoArrowUp size={30} className="text-black" />
              </button>
            </div>
            <p ref={bottomRef} className="text-sm text-gray-500">
              BIPQuantum AI is here to assist, but always consult an IP lawyer to ensure accuracy.
            </p>
          </div>
        </div>

        {/* Debug Panel - Toggle with Ctrl+Alt+D */}
        {showDebugPanel && (
          <div className="rounded-lg border border-gray-300 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-black dark:text-white">
              Debug Panel
            </h2>

          {/* Connection Status */}
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Connection Status
            </h3>
            <div className={`flex items-center gap-3 text-base font-medium ${getStatusColor()}`}>
              <span className="text-xl">{getStatusIcon()}</span>
              <span>{getStatusText()}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Controls
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={initSession}
                disabled={connectionState.status === "connecting" || connectionState.status === "connected"}
                className="rounded-full bg-gradient-to-t from-primary to-secondary px-3 py-1.5 text-xs font-medium uppercase text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {connectionState.status === "connecting" ? "Connecting..." : "Connect"}
              </button>

              <button
                onClick={disconnect}
                disabled={connectionState.status === "idle"}
                className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium uppercase text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Disconnect
              </button>

              <button
                onClick={clearLogs}
                disabled={logs.length === 0}
                className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium uppercase text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Clear Logs
              </button>
            </div>
          </div>

          {/* Logs */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Logs
            </h3>
            <div className="h-[400px] overflow-y-auto rounded bg-gray-50 p-4 font-mono text-xs dark:bg-gray-900">
              {logs.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No logs yet.</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1 text-gray-800 dark:text-gray-200">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default TestSession;
