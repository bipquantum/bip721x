import React, { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { backendActor } from "../actors/BackendActor";
import { ChatHistory } from "../../../declarations/backend/backend.did";

interface ChatHistoryContextType {
  chatHistories: ChatHistory[];
  addChat: () => string;
  deleteChat: (chatId: string) => void;
}

const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(undefined);

export const ChatHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);

  const { call: fetchChatHistories } = backendActor.useQueryCall({
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

  const { call: deleteChatHistory } = backendActor.useUpdateCall({
    functionName: "delete_chat_history",
    onError: (error) => {
      console.error("Error deleting chat history:", error);
    },
  });

  const { call: createChatHistory } = backendActor.useUpdateCall({
    functionName: "create_chat_history",
    onError: (error) => {
      console.error("Error creating chat history:", error);
    },
  });

  const addChat = (): string => {
    console.log("Adding chat...");
    const newChatId = uuidv4();
    createChatHistory([{ id: newChatId }]).then(() => {
      fetchChatHistories();
    });
    return newChatId;
  };

  const deleteChat = (chatId: string) => {
    deleteChatHistory([{ id: chatId }]).then(() => {
      fetchChatHistories();
    });
  };

  return (
    <ChatHistoryContext.Provider value={{ chatHistories, addChat, deleteChat }}>
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
