import { useParams, useLocation } from "react-router-dom";
import { useMemo, useState, useCallback } from "react";
import { ChatConnectionProvider } from "./ChatConnectionContext";
import { ChatMessage } from "../../../layout/ChatHistoryContext";
import ChatWelcome from "./ChatWelcome";
import ChatConversation from "../ChatConversation";

const ChatBot2 = () => {
  const { chatId: routeChatId } = useParams<{ chatId?: string }>();
  const location = useLocation();

  // Generate a NEW UUID each time we're on the welcome page (no routeChatId)
  // This ensures each visit to /chat generates a fresh connection
  const chatId = useMemo(() => {
    if (routeChatId) {
      return routeChatId;
    }
    // Generate new UUID for welcome page - changes on every navigation to /chat
    return crypto.randomUUID();
  }, [routeChatId, location.pathname]);

  // Local message state that persists when navigating from Welcome -> Conversation
  const [messages, setMessages] = useState<ChatMessage[]>([]);

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
  );
};

export default ChatBot2;
