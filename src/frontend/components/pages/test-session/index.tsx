import { useState, useRef, useEffect } from "react";
import { useActors } from "../../common/ActorsContext";

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
}

const TestSession = () => {
  const { authenticated } = useActors();
  const [connectionState, setConnectionState] = useState<ConnectionState>({ status: "idle" });
  const [logs, setLogs] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    sendTextMessage(inputMessage);
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

      // Add local audio track for microphone input
      addLog("🎤 Requesting microphone access...");
      const ms = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      addLog("✓ Microphone access granted");

      pc.addTrack(ms.getTracks()[0]);
      addLog("✓ Local audio track added to peer connection");

      // Set up data channel for sending and receiving events
      const dc = pc.createDataChannel("oai-events");
      dataChannelRef.current = dc;
      addLog("✓ Data channel 'oai-events' created");

      dc.onopen = () => {
        addLog("✓ Data channel opened");
        addChatMessage("system", "Connection established. You can now start chatting!");
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

      {/* Status and Controls Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Status Card */}
        <div className="rounded-lg border border-gray-300 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-black dark:text-white">
            Connection Status
          </h2>
          <div className={`flex items-center gap-3 text-lg font-medium ${getStatusColor()}`}>
            <span className="text-2xl">{getStatusIcon()}</span>
            <span>{getStatusText()}</span>
          </div>
        </div>

        {/* Controls Card */}
        <div className="rounded-lg border border-gray-300 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-black dark:text-white">
            Controls
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={initSession}
              disabled={connectionState.status === "connecting" || connectionState.status === "connected"}
              className="rounded-full bg-gradient-to-t from-primary to-secondary px-4 py-2 text-sm font-medium uppercase text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {connectionState.status === "connecting" ? "Connecting..." : "Connect"}
            </button>

            <button
              onClick={disconnect}
              disabled={connectionState.status === "idle"}
              className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium uppercase text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Disconnect
            </button>

            <button
              onClick={clearLogs}
              disabled={logs.length === 0}
              className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium uppercase text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Clear Logs
            </button>
          </div>
        </div>
      </div>

      {/* Chat and Logs Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Chat Interface */}
        <div className="rounded-lg border border-gray-300 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-black dark:text-white">
            Chat
          </h2>

          {/* Chat Messages */}
          <div className="mb-4 h-96 overflow-y-auto rounded bg-gray-50 p-4 dark:bg-gray-900">
            {chatMessages.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                Connect to start chatting with the AI...
              </p>
            ) : (
              chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-3 ${msg.role === "user" ? "text-right" : "text-left"}`}
                >
                  <div
                    className={`inline-block max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-white"
                        : msg.role === "assistant"
                        ? "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                        : "bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100"
                    }`}
                  >
                    {msg.role === "system" && (
                      <span className="mr-2 font-semibold">System:</span>
                    )}
                    {msg.content}
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={connectionState.status !== "connected"}
              placeholder={
                connectionState.status === "connected"
                  ? "Type a message..."
                  : "Connect to start chatting..."
              }
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
            />
            <button
              type="submit"
              disabled={connectionState.status !== "connected" || !inputMessage.trim()}
              className="rounded-lg bg-gradient-to-t from-primary to-secondary px-6 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>

        {/* Logs */}
        <div className="rounded-lg border border-gray-300 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-black dark:text-white">
            Connection Logs
          </h2>
          <div className="h-[500px] overflow-y-auto rounded bg-gray-50 p-4 font-mono text-sm dark:bg-gray-900">
            {logs.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No logs yet. Click "Connect" to start.</p>
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
    </div>
  );
};

export default TestSession;
