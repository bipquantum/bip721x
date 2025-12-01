import { useParams } from "react-router-dom";
import { ChatConnectionProvider } from "./ChatConnectionContext";
import ChatWelcome from "./ChatWelcome";
import ChatConversation from "./ChatConversation";

const ChatBot2 = () => {
  const { chatId } = useParams<{ chatId?: string }>();

  return (
    <ChatConnectionProvider>
      {chatId ? <ChatConversation chatId={chatId} /> : <ChatWelcome />}
    </ChatConnectionProvider>
  );
};

export default ChatBot2;
