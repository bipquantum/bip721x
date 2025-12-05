import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@nfid/identitykit/react";
import { backendActor } from "../actors/BackendActor";
import { useActors } from "../common/ActorsContext";
import { ChatHistory } from "../../../declarations/backend/backend.did";
import { machine } from "../pages/dashboard/botStateMachine";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface ChatHistoryContextType {
  // Chat list management
  chatHistories: ChatHistory[];
  addChat: (name: string) => string;
  renameChat: (chatId: string, name: string) => void;
  deleteChat: (chatId: string) => void;

  // Message management for current chat
  currentChatId: string | null;
  messages: ChatMessage[];
  loadMessages: (chatId: string) => Promise<void>;
  addMessage: (role: "user" | "assistant" | "system", content: string, isStreaming?: boolean) => void;
  updateLastMessage: (content: string, isStreaming?: boolean) => void;
  saveMessages: () => Promise<void>;
  clearMessages: () => void;
  setCurrentChatId: (chatId: string | null) => void;
}

const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(
  undefined,
);

export const ChatHistoryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const isSavingRef = useRef(false);
  const { user } = useAuth();
  const { authenticated } = useActors();

  const { call: fetchChatHistories } = backendActor.authenticated.useQueryCall({
    functionName: "get_chat_histories",
    onSuccess: (data) => {
      if (data !== undefined) {
        setChatHistories(data);
      } else {
        console.error("No chat histories returned");
        setChatHistories([]);
      }
    },
    onError: (error) => {
      console.error("Error querying chat history:", error);
    },
  });

  // Fetch chat histories when user changes (login/logout/switch user)
  useEffect(() => {
    if (user) {
      console.log("User changed, fetching chat histories for:", user.principal);
      fetchChatHistories();
    } else {
      // Clear chat histories when user logs out
      console.log("User logged out, clearing chat histories");
      setChatHistories([]);
    }
  }, [user]);

  const { call: deleteChatHistory } = backendActor.authenticated.useUpdateCall({
    functionName: "delete_chat_history",
    onError: (error) => {
      console.error("Error deleting chat history:", error);
    },
  });

  const { call: createChatHistory } = backendActor.authenticated.useUpdateCall({
    functionName: "create_chat_history",
    onError: (error) => {
      console.error("Error creating chat history:", error);
    },
  });

  const { call: renameChatHistory } = backendActor.authenticated.useUpdateCall({
    functionName: "rename_chat_history",
    onError: (error) => {
      console.error("Error renaming chat history:", error);
    },
  });

  const addChat = (name: string): string => {
    if (machine.version === undefined) {
      throw new Error("Machine version not found");
    }

    const newChatId = uuidv4();
    createChatHistory([{ id: newChatId, version: machine.version, name }]).then(
      () => {
        fetchChatHistories();
      },
    );
    return newChatId;
  };

  const deleteChat = (chatId: string) => {
    deleteChatHistory([{ id: chatId }]).then(() => {
      fetchChatHistories();
    });
  };

  const renameChat = (chatId: string, name: string) => {
    renameChatHistory([{ id: chatId, name }]).then(() => {
      fetchChatHistories();
    });
  };

  // Load messages for a specific chat from backend
  const loadMessages = useCallback(async (chatId: string) => {
    if (!authenticated?.backend) {
      console.error("Not authenticated");
      return;
    }

    try {
      console.log(`Loading messages for chat ${chatId}...`);
      const result = await authenticated.backend.get_chat_history({ id: chatId });

      if ('ok' in result) {
        const historyData = result.ok;
        if (historyData.events) {
          const savedMessages = JSON.parse(historyData.events);
          const loadedMessages: ChatMessage[] = savedMessages.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            isStreaming: false
          }));
          setMessages(loadedMessages);
          setCurrentChatId(chatId);
          console.log(`Loaded ${loadedMessages.length} messages`);
        } else {
          console.log("No messages found for this chat");
          setMessages([]);
          setCurrentChatId(chatId);
        }
      } else if ('err' in result) {
        console.log("Chat history doesn't exist yet (new conversation)");
        setMessages([]);
        setCurrentChatId(chatId);
      }
    } catch (error: any) {
      console.error(`Error loading messages: ${error.message}`);
    }
  }, [authenticated]);

  // Add a new message to the current chat
  const addMessage = useCallback((role: "user" | "assistant" | "system", content: string, isStreaming: boolean = false) => {
    setMessages(prev => [...prev, { role, content, timestamp: new Date(), isStreaming }]);
  }, []);

  // Update the last message (useful for streaming)
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

  // Save current messages to backend
  const saveMessages = useCallback(async () => {
    if (!currentChatId || isSavingRef.current) {
      return;
    }

    if (!authenticated?.backend) {
      console.error("Not authenticated");
      return;
    }

    try {
      isSavingRef.current = true;

      // Filter out system messages and streaming messages
      const messagesToSave = messages
        .filter(msg => msg.role !== "system" && !msg.isStreaming)
        .map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp.toISOString()
        }));

      const historyJson = JSON.stringify(messagesToSave);

      const result = await authenticated.backend.update_chat_history({
        id: currentChatId,
        events: historyJson,
        aiPrompts: ""
      });

      if ('err' in result) {
        console.error(`Failed to save messages: ${result.err}`);
      } else {
        console.log("Messages saved to backend");
      }
    } catch (error: any) {
      console.error(`Error saving messages: ${error.message}`);
    } finally {
      isSavingRef.current = false;
    }
  }, [currentChatId, messages, authenticated]);

  // Clear messages (for disconnecting or switching chats)
  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentChatId(null);
  }, []);

  // Auto-save messages when they change (debounced to avoid excessive saves)
  useEffect(() => {
    // Only save if we have messages and none are currently streaming
    const hasStreamingMessage = messages.some(msg => msg.isStreaming);
    if (currentChatId && messages.length > 0 && !hasStreamingMessage && !isSavingRef.current) {
      // Debounce the save to avoid excessive backend calls
      const timeoutId = setTimeout(() => {
        saveMessages();
      }, 1000); // Wait 1 second after last message change

      return () => clearTimeout(timeoutId);
    }
  }, [messages, currentChatId, saveMessages]);

  return (
    <ChatHistoryContext.Provider
      value={{
        chatHistories,
        addChat,
        deleteChat,
        renameChat,
        currentChatId,
        messages,
        loadMessages,
        addMessage,
        updateLastMessage,
        saveMessages,
        clearMessages,
        setCurrentChatId,
      }}
    >
      {children}
    </ChatHistoryContext.Provider>
  );
};

export const useChatHistory = (): ChatHistoryContextType => {
  const context = useContext(ChatHistoryContext);
  if (context === undefined) {
    throw new Error("useChatHistory must be used within a ChatHistoryProvider");
  }
  return context;
};
