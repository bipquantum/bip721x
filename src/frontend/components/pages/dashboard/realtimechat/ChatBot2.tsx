import { useParams, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { ChatConnectionProvider } from "./ChatConnectionContext";
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

  return (
    <ChatConnectionProvider chatId={chatId} key={chatId}>
      {routeChatId ? <ChatConversation chatId={chatId} /> : <ChatWelcome chatId={chatId} />}
    </ChatConnectionProvider>
  );
};

export default ChatBot2;
