import { useParams, useLocation } from "react-router-dom";
import { useMemo, useState, useCallback, useEffect } from "react";
import { ChatConnectionProvider } from "./ChatConnectionContext";
import { ChatMessage } from "../../layout/ChatHistoryContext";
import ChatWelcome from "./ChatWelcome";
import ChatConversation from "./ChatConversation";
import { AuthTokenProvider } from "./AuthTokenContext";
import { v4 as uuidv4 } from "uuid";
import ChatHistoryBar from "../../layout/ChatHistoryBar";
import { backendActor } from "../../actors/BackendActor";
import { Result_4 } from "../../../../declarations/backend/backend.did";

const ChatBot = () => {
  const { chatId: routeChatId } = useParams<{ chatId?: string }>();
  const location = useLocation();

  // Local message state that persists when navigating from Welcome -> Conversation
  const [messages, setMessages] = useState<Map<string, ChatMessage>>(new Map());

  // Generate a NEW UUID each time we're on the welcome page (no routeChatId)
  // This ensures each visit to /chat generates a fresh connection
  const chatId = useMemo(() => {
    if (routeChatId) {
      return routeChatId;
    }
    // Reset messages when navigating to welcome page
    setMessages(new Map());
    // Generate new UUID for welcome page - changes on every navigation to /chat
    return uuidv4();
  }, [routeChatId, location.pathname]);

  // Clear messages when chatId changes (switching between different chats)
  useEffect(() => {
    setMessages(new Map());
  }, [chatId]);

  const setMessage = useCallback((id: string, role: "user" | "assistant" | "system", content: string) => {
    setMessages(prev => { const map = new Map(prev); map.set(id, { id, role, content, timestamp: new Date() }); return map; });
  }, []);

  const upsertMessage = useCallback((id: string, role: "user" | "assistant" | "system", delta: string) => {
    setMessages(prev => {
      const map = new Map(prev);
      const existing = map.get(id);
      if (existing) {
        // Append delta to existing content
        const updatedMessage = {
          ...existing,
          content: existing.content + delta,
        };
        map.set(id, updatedMessage);
      } else {
        // If message doesn't exist, create a new one with the delta as content
        map.set(id, { id, role: role, content: delta, timestamp: new Date() });
      }
      return map;
    });
  }, []);

  const messageList = useMemo(
    () => Array.from(messages.values()),
    [messages]
  );

  const { data: chatHistory } = backendActor.authenticated.useQueryCall({
    functionName: "get_chat_history",
    args: [{ id: chatId }],
    onSuccess: (data) => {
      const loadedMessages = extractChatHistory(data);
      if (loadedMessages.length > 0) {
        setMessages(prev => {
          const map = new Map();
          loadedMessages.forEach(msg => map.set(msg.id, msg));
          return map;
        });
      }
    },
    onError: (error) => {
      console.error("Error getting chat history:", error);
    },
  });

  return (
    <div className="flex w-full flex-grow flex-row justify-between">
      <AuthTokenProvider>
      <div className={`mx-[20px] hidden sm:block h-[80dvh] w-80 overflow-auto rounded-[40px] bg-white text-black transition-all duration-200 dark:bg-background-dark dark:text-white`}>
        <ChatHistoryBar onChatSelected={() => {}} />
      </div>
        <ChatConnectionProvider
          key={chatId}  // New provider instance per chatId
          setMessage={setMessage}
          upsertMessage={upsertMessage}
        >
          {routeChatId ? (
            <ChatConversation chatId={chatId} messages={messageList} chatHistory={chatHistory}/>
          ) : (
            <ChatWelcome chatId={chatId} />
          )}
        </ChatConnectionProvider>
      </AuthTokenProvider>
    </div>
  );
};

export const extractChatHistory = (result: Result_4 | undefined): ChatMessage[] => {
  if (!result || 'err' in result) {
    console.log("No chat history found or error occurred");
    return [];
  }
  try {
    const messages = JSON.parse(result.ok.events);
    return messages.map((msg: any, index: number) => ({
      id: msg.id || "msg-" + index,
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.timestamp),
      isStreaming: false
    }));
  } catch (error) {
    console.error("Error parsing historyData events:", error);
    return [];
  }
}

export default ChatBot;
