import { useCallback, useRef, useEffect, RefObject } from "react";
import { backendActor } from "../../actors/BackendActor";
import { ChatMessage } from "../../layout/ChatHistoryContext";
import { Messages } from ".";

export function useChatAutoSave(
  chatId: string,
  messages: Messages,
) {
  const { call: saveMessages } = backendActor.authenticated.useUpdateCall({
    functionName: "update_chat_history",
    onSuccess: () => {
      console.log("Chat history saved successfully");
    },
    onError: (error) => {
      console.error("Error saving chat history:", error);
    },
  });

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Ref to always have the latest messages value (avoids stale closure)
  const messagesRef = useRef<Messages>(messages);

  // Keep ref in sync with messages
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const toHistory = useCallback((messages: Map<string, ChatMessage>): string => {
    // Filter out system messages and streaming messages
    const messagesToSave = Array.from(messages.values())
      .filter(msg => msg.role !== "system" && !msg.isStreaming)
      .map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp && !isNaN(msg.timestamp.getTime())
          ? msg.timestamp.toISOString()
          : null
      }));

    return JSON.stringify(messagesToSave);
  }, []);

  const debouncedSave = useCallback(() => {
    // Skip saving if we're loading from history
    if (messagesRef.current.isHistory || messagesRef.current.messages.size === 0) {
      console.log("Skipping auto-save: loading from history");
      return;
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout
    saveTimeoutRef.current = setTimeout(() => {
      // Double-check we're not loading from history
      if (messagesRef.current.isHistory || messagesRef.current.messages.size === 0) {
        console.log("Skipping auto-save in timeout: loading from history");
        return;
      }

      // Read from ref to get the LATEST messages value
      const currentMessages = messagesRef.current.messages;

      // Check if there are any streaming messages
      const hasStreamingMessage = Array.from(currentMessages.values()).some(msg => msg.isStreaming);
      console.log("Checking conditions for auto-save:", {
        chatId,
        messageCount: currentMessages.size,
        hasStreamingMessage
      });

      if (chatId && currentMessages.size > 0 && !hasStreamingMessage) {
        console.log("Auto-saving chat history for chatId:", chatId);
        const historyJson = toHistory(currentMessages);
        saveMessages([{ id: chatId, events: historyJson, aiPrompts: "" }]);
      }
    }, 1000);
  }, [chatId, toHistory]);

  return debouncedSave;
}
