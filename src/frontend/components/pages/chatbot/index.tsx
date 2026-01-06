import { useParams, useLocation, useNavigate } from "react-router-dom";
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
import { useChatHistory as useChatHistoryContext } from "../../layout/ChatHistoryContext";
import { backendActor } from "../../actors/BackendActor";

export type Messages = {
  isHistory: boolean;
  order: string[];
  messages: Map<string, ChatMessage>;
}

const ChatBot = () => {
  const { chatId: routeChatId } = useParams<{ chatId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { addChat } = useChatHistoryContext();

  // Local message state that persists when navigating from Welcome -> Conversation
  const [messages, setMessages] = useState<Messages>({ isHistory: false, order: [], messages: new Map() });

  // Generate a NEW UUID each time we're on the welcome page (no routeChatId)
  // This ensures each visit to /chat generates a fresh connection
  const chatId = useMemo(() => {
    if (routeChatId) {
      return routeChatId;
    }
    // Generate new UUID for welcome page - changes on every navigation to /chat
    return uuidv4();
  }, [routeChatId, location.pathname]);

  // Clear messages when chatId changes (switching between different chats)
  useEffect(() => {
    setMessages({ isHistory: false, order: [], messages: new Map() });
  }, [chatId]);

  // Auto-save hook
  const debouncedSave = useChatAutoSave(chatId, messages);

  const setMessage = useCallback((id: string, role: "user" | "assistant" | "system", content: string) => {
    setMessages(prev => {
      const map = new Map(prev.messages);
      map.set(id, { id, role, content, timestamp: new Date() });
      const order = prev.order.includes(id) ? prev.order : [...prev.order, id];
      return { isHistory: false, order, messages: map };
    });
  }, []);

  const upsertMessage = useCallback((id: string, role: "user" | "assistant" | "system", delta: string) => {
    setMessages(prev => {
      const map = new Map(prev.messages);
      const existing = map.get(id);

      map.set(id, {
        id,
        role,
        content: existing ? existing.content + delta : delta,
        timestamp: existing?.timestamp ?? new Date(),
      });

      const order = prev.order.filter(k => k !== id);
      order.push(id);

      return { isHistory: false, order, messages: map };
    });
  }, []);

  useEffect(() => {
  debouncedSave();
}, [messages]);

  // Load chat history and populate messages
  const chatHistoryMessages = useChatHistory(chatId, (loadedMessages) => {
    setMessages(() => {
      const map = new Map();
      loadedMessages.forEach(msg => map.set(msg.id, msg));
      const order = loadedMessages.map(msg => msg.id);
      return { isHistory: true, order, messages: map };
    });
  });

  const { call: createChatHistory } = backendActor.authenticated.useUpdateCall({
    functionName: "create_chat_history",
  });

  // Callback for when voice transcription completes on welcome page
  const handleVoiceTranscriptionComplete = useCallback(() => {
    if (!routeChatId) {
      // We're on the welcome page, so create history and navigate
      createChatHistory([{
        id: chatId,
        version: "1.0",
        name: new Date().toLocaleString()
      }]).catch((error) => {
        console.error("Chat history may already exist:", error);
      });

      addChat({ id: chatId, name: new Date().toLocaleString() });
      navigate(`/chat/${chatId}`);
    }
  }, [routeChatId, chatId, createChatHistory, addChat, navigate]);

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
          onVoiceTranscriptionComplete={!routeChatId ? handleVoiceTranscriptionComplete : undefined}
        >
          {routeChatId ? (
            <ChatConversation chatId={chatId} messages={messages} chatHistoryMessages={chatHistoryMessages}/>
          ) : (
            <ChatWelcome chatId={chatId} />
          )}
        </ChatConnectionProvider>
      </AuthTokenProvider>
    </div>
  );
};

export default ChatBot;
