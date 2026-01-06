import { useMemo } from "react";
import { backendActor } from "../../actors/BackendActor";
import { ChatMessage } from "../../layout/ChatHistoryContext";
import { Result_4 } from "../../../../declarations/backend/backend.did";

const extractChatHistory = (result: Result_4 | undefined): ChatMessage[] => {
  
  if (!result || 'err' in result) {
    return [];
  }

  const events = result.ok.events;
  
  if (!events) {
    return [];
  }

  try {
    const messages = JSON.parse(events);
    if (messages.length === 0) {
      return [];
    }
    return messages.filter((msg: any) => msg.content !== undefined && msg.content.length > 0)
                   .map((msg: any, index: number) => {
      // Parse timestamp safely, fallback to null if invalid
      let validDate: Date | null = null;
      if (msg.timestamp) {
        const parsedDate = new Date(msg.timestamp);
        if (!isNaN(parsedDate.getTime())) {
          validDate = parsedDate;
        }
      }

      return {
        id: msg.id || "msg-" + index,
        role: msg.role,
        content: msg.content,
        timestamp: validDate,
        isStreaming: false
      };
    });
  } catch (error) {
    console.error("Error parsing historyData events:", error);
    return [];
  }
};

export function useChatHistory(chatId: string, onMessagesLoaded?: (messages: ChatMessage[]) => void) {
  const { data: chatHistory } = backendActor.authenticated.useQueryCall({
    functionName: "get_chat_history",
    args: [{ id: chatId }],
    onSuccess: (data) => {
      const loadedMessages = extractChatHistory(data);
      if (loadedMessages.length > 0 && onMessagesLoaded) {
        onMessagesLoaded(loadedMessages);
      }
    },
    onError: (error) => {
      console.error("Error getting chat history:", error);
    },
  });

  const chatHistoryMessages = useMemo(
    () => extractChatHistory(chatHistory),
    [chatHistory]
  );

  return chatHistoryMessages;
}
