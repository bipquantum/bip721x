import { useState, useRef, useEffect, useMemo } from "react";
import { useChatConnection } from "./ChatConnectionContext";
import { ChatMessage } from "../../layout/ChatHistoryContext";
import ConnectionStatusIndicator from "./ConnectionStatusIndicator";
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
import { backendActor } from "../../actors/BackendActor";
import { useAuthToken } from "./AuthTokenContext";
import { Messages } from ".";

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

interface ChatConversationProps {
  chatId: string;
  chatHistoryMessages: ChatMessage[];
  messages: Messages;
}

const ChatConversation: React.FC<ChatConversationProps> = ({ chatId, chatHistoryMessages, messages }) => {
  const { authToken } = useAuthToken();
  const {
    connectionState,
    logs,
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
  } = useChatConnection();

  const { data: subscription } = backendActor.authenticated.useQueryCall({
    functionName: "get_subscription",
    args: [],
  });

  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<AutoResizeTextareaHandle>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const loadedChatIdRef = useRef<string | null>(null);
  const contextRestoredRef = useRef(false);
  const voiceEnabled = useMemo<boolean>(() => {
    return subscription?.planId !== "free";
  }, [subscription]);

  // Load history when chatId changes
  useEffect(() => {
    if (loadedChatIdRef.current !== chatId) {
      loadedChatIdRef.current = chatId;
      contextRestoredRef.current = false; // Reset context restoration flag for new chat
    }
  }, [chatId]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize connection on mount
  useEffect(() => {
    const initialize = async () => {
      // Initialize connection if not already connected or connecting
      if (connectionState.status === "idle" || connectionState.status === "failed" || connectionState.status === "disconnected") {
        if (authToken) {
          initSession(authToken);
        }
      }
    };

    initialize();
  }, [chatId, authToken]);

  // Restore conversation context to AI when connection is ready and we have messages
  useEffect(() => {
    if (connectionState.status === "ready" && chatHistoryMessages.length > 0 && !contextRestoredRef.current) {
      // Filter out system messages and only send user/assistant messages
      const contextMessages = chatHistoryMessages
        .filter(msg => msg.role !== "system" && !msg.isStreaming)
        .map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content
        }));

      if (contextMessages.length > 0) {
        restoreConversationContext(contextMessages);
        contextRestoredRef.current = true; // Mark as restored
      }
    }
  }, [connectionState.status, chatHistoryMessages, restoreConversationContext]);

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

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || connectionState.status !== "ready") return;

    // Add user message immediately to UI
    const messageToSend = inputMessage;
    inputRef.current?.clear();
    setInputMessage("");

    // Send the message
    sendTextMessage(undefined, messageToSend);
  };

  return (
    <div className="relative flex w-full flex-grow flex-col overflow-hidden">
      <div className={`grid grid-cols-1 gap-4 flex-grow overflow-hidden ${showDebugPanel ? 'lg:grid-cols-2' : ''}`}>
        <div className="flex flex-col overflow-hidden">
          {/* Chat Messages */}
          <ul className="flex-grow overflow-y-auto px-4 py-2 text-sm leading-normal sm:text-lg sm:leading-relaxed">
            {messages.order.map(id => {
              const msg = messages.messages.get(id);
              if (!msg || msg.role === "system") return null;
              if (msg.role === "user") {
                // User messages - right aligned with user image and colored background
                return (
                  <li key={id} className="mb-3 flex flex-row justify-end gap-2 py-2">
                    <span className="flex flex-col px-5"></span>
                    <div className="markdown-link flex items-center rounded-xl bg-gradient-to-t from-primary to-secondary px-3 py-0 text-white sm:px-4 sm:py-2">
                      {msg.content}
                    </div>
                    <UserImage />
                  </li>
                );
              } else {
                // Assistant messages - left aligned with AI image and light background
                return (
                  <li key={id} className="mb-3 flex flex-row gap-2 py-2">
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
                  </li>
                );
              }
            })}
            <div ref={chatEndRef} />
          </ul>

          {/* Chat Input - Sticky Bottom */}
          <div className="flex w-full flex-shrink-0 flex-col gap-2 border-t-[0.25px] dark:border-gray-800 px-2 py-2 items-center">
            <div className="relative flex w-full flex-row items-center gap-2">
              <ConnectionStatusIndicator />
              <div className="flex flex-1 items-center justify-between gap-2 rounded-2xl border bg-white px-3 py-[6px]">
                <AutoResizeTextarea
                  ref={inputRef}
                  placeholder="What do you want to protect?"
                  autoFocus={true}
                  onChange={(value) => {
                    if (bottomRef.current) {
                      bottomRef.current.scrollIntoView({ behavior: "instant" });
                    }
                    setInputMessage(value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (inputMessage.trim() && connectionState.status === "ready") {
                        handleSendMessage();
                      }
                    }
                  }}
                />
              </div>
              <button
                onClick={toggleVoiceMode}
                disabled={connectionState.status !== "ready" || !voiceEnabled}
                className={`group flex h-[36px] w-[36px] items-center justify-center self-end rounded-full px-1 transition-all ${
                  isVoiceMode
                    ? "bg-gradient-to-t from-primary to-secondary text-white"
                    : "bg-gray-200 text-black"
                } 
                disabled:opacity-50 disabled:cursor-not-allowed`}
                title={isVoiceMode ? "Switch to text mode" : "Switch to voice mode"}
              >
                { !voiceEnabled && <span className="absolute z-50 hidden w-max items-center rounded bg-black px-2 py-1 text-sm text-white group-hover:flex">
                  Require premium plan
                </span>}
                <BiMicrophone size={35} className={isVoiceMode ? "text-white" : "text-black"} />
              </button>
              <button
                onClick={() => {
                  if (inputMessage) handleSendMessage();
                }}
                disabled={!inputMessage.trim() || connectionState.status !== "ready"}
                className="flex h-[36px] w-[36px] items-center justify-center self-end rounded-full bg-gray-200 disabled:opacity-50"
              >
                <IoArrowUp size={30} className="text-black" />
              </button>
            </div>
            <p ref={bottomRef} className="text-sm text-gray-500 items-center">
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
                  onClick={() => { if (authToken) { initSession(authToken); } }}
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

export default ChatConversation;
