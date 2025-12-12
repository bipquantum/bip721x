import { useParams, useLocation } from "react-router-dom";
import { useMemo, useState, useCallback } from "react";
import { ChatConnectionProvider } from "./ChatConnectionContext";
import { ChatMessage } from "../../layout/ChatHistoryContext";
import ChatWelcome from "./ChatWelcome";
import ChatConversation from "./ChatConversation";
import { AuthTokenProvider } from "./AuthTokenContext";
import { v4 as uuidv4 } from "uuid";
import ChatHistoryBar from "../../layout/ChatHistoryBar";

const ChatBot = () => {
  const { chatId: routeChatId } = useParams<{ chatId?: string }>();
  const location = useLocation();

  // Local message state that persists when navigating from Welcome -> Conversation
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Generate a NEW UUID each time we're on the welcome page (no routeChatId)
  // This ensures each visit to /chat generates a fresh connection
  const chatId = useMemo(() => {
    if (routeChatId) {
      return routeChatId;
    }
    // Reset messages when navigating to welcome page
    setMessages([]);
    // Generate new UUID for welcome page - changes on every navigation to /chat
    return uuidv4();
  }, [routeChatId, location.pathname]);

  const addMessage = useCallback((role: "user" | "assistant" | "system", content: string, isStreaming: boolean = false) => {
    setMessages(prev => [...prev, { role, content, timestamp: new Date(), isStreaming }]);
  }, []);

  const updateLastMessage = useCallback((content: string, isStreaming: boolean = false) => {
    setMessages(prev => {
      if (prev.length === 0) return prev;
      const lastMsg = prev[prev.length - 1];
      return [
        ...prev.slice(0, -1),
        { ...lastMsg, content, isStreaming }
      ];
    });
  }, []);

  return (
    <div className="flex w-full flex-grow flex-row justify-between">
      <AuthTokenProvider>
      <div className={`mx-[20px] hidden sm:block h-[80dvh] w-80 overflow-auto rounded-[40px] bg-white text-black transition-all duration-200 dark:bg-background-dark dark:text-white`}>
        <ChatHistoryBar onChatSelected={() => {}} />
      </div>
        <ChatConnectionProvider
          key={chatId}  // New provider instance per chatId
          addMessage={addMessage}
          updateLastMessage={updateLastMessage}
        >
          {routeChatId ? (
            <ChatConversation chatId={chatId} messages={messages} setMessages={setMessages} />
          ) : (
            <ChatWelcome chatId={chatId} />
          )}
        </ChatConnectionProvider>
      </AuthTokenProvider>
    </div>
  );
};

export default ChatBot;
