import { useParams, useLocation } from "react-router-dom";
import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { ChatConnectionProvider } from "./ChatConnectionContext";
import { ChatMessage } from "../../layout/ChatHistoryContext";
import ChatWelcome from "./ChatWelcome";
import ChatConversation from "./ChatConversation";
import { AuthTokenProvider } from "./AuthTokenContext";
import { v4 as uuidv4 } from "uuid";
import ChatHistoryBar from "../../layout/ChatHistoryBar";
import { useChatAutoSave } from "./useChatAutoSave";
import { useChatHistory } from "./useChatHistory";

export type Messages = {
  isHistory: boolean;
  messages: Map<string, ChatMessage>;
}

const ChatBot = () => {
  const { chatId: routeChatId } = useParams<{ chatId?: string }>();
  const location = useLocation();

  // Local message state that persists when navigating from Welcome -> Conversation
  const [messages, setMessages] = useState<Messages>({ isHistory: false, messages: new Map() });

  // Generate a NEW UUID each time we're on the welcome page (no routeChatId)
  // This ensures each visit to /chat generates a fresh connection
  const chatId = useMemo(() => {
    if (routeChatId) {
      return routeChatId;
    }
    // Reset messages when navigating to welcome page
    setMessages({ isHistory: false, messages: new Map() });
    // Generate new UUID for welcome page - changes on every navigation to /chat
    return uuidv4();
  }, [routeChatId, location.pathname]);

  // Clear messages when chatId changes (switching between different chats)
  useEffect(() => {
    setMessages({ isHistory: false, messages: new Map() });
  }, [chatId]);

  // Auto-save hook
  const debouncedSave = useChatAutoSave(chatId, messages);

  const setMessage = useCallback((id: string, role: "user" | "assistant" | "system", content: string) => {
    setMessages(prev => {
      const map = new Map(prev.messages);
      map.set(id, { id, role, content, timestamp: new Date() });
      return { isHistory: false, messages: map };
    });
    debouncedSave();
  }, [debouncedSave]);

  const upsertMessage = useCallback((id: string, role: "user" | "assistant" | "system", delta: string) => {
    setMessages(prev => {
      const map = new Map(prev.messages);
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
      return { isHistory: false, messages: map };
    });
    debouncedSave();
  }, [debouncedSave]);

  const messageList = useMemo(
    () => Array.from(messages.messages.values()),
    [messages]
  );

  // Load chat history and populate messages
  const chatHistoryMessages = useChatHistory(chatId, (loadedMessages) => {
    setMessages(() => {
      const map = new Map();
      loadedMessages.forEach(msg => map.set(msg.id, msg));
      return { isHistory: true, messages: map };
    });
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
            <ChatConversation chatId={chatId} messages={messageList} chatHistoryMessages={chatHistoryMessages}/>
          ) : (
            <ChatWelcome chatId={chatId} />
          )}
        </ChatConnectionProvider>
      </AuthTokenProvider>
    </div>
  );
};

export default ChatBot;
