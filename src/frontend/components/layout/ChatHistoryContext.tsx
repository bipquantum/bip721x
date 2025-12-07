import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@nfid/identitykit/react";
import { backendActor } from "../actors/BackendActor";
import { ChatHistory } from "../../../declarations/backend/backend.did";
import { machine } from "../pages/dashboard/botStateMachine";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface ChatHistoryContextType {
  chatHistories: ChatHistory[];
  addChat: ({id, name}: {id: string, name: string}) => void;
  renameChat: (chatId: string, name: string) => void;
  deleteChat: (chatId: string) => void;
}

const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(
  undefined,
);

export const ChatHistoryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const { user } = useAuth();

  const { call: fetchChatHistories } = backendActor.authenticated.useQueryCall({
    functionName: "get_chat_histories",
    args: [],
    onSuccess: (data) => {
      if (data !== undefined) {
        console.log("Fetched chat histories:", data.length);
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

  const addChat = ({id, name}: {id: string, name: string}) => {
    if (machine.version === undefined) {
      throw new Error("Machine version not found");
    }
    createChatHistory([{ id, version: machine.version, name }]).then(
      () => {
        fetchChatHistories();
      },
    );
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

  return (
    <ChatHistoryContext.Provider
      value={{
        chatHistories,
        addChat,
        deleteChat,
        renameChat,
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
