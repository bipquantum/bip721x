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
    onError: (error) => {
      console.error("Error saving chat history:", error);
    },
  });

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Ref to always have the latest messages value (avoids stale closure)
  const messagesRef = useRef<Messages>(messages);
  // Track when history was last loaded to prevent immediate save
  const historyLoadedAtRef = useRef<number>(0);

  // Keep ref in sync with messages
  useEffect(() => {
    // If switching from isHistory: false -> true, record the timestamp
    if (!messagesRef.current.isHistory && messages.isHistory) {
      historyLoadedAtRef.current = Date.now();
    }
    messagesRef.current = messages;
  }, [messages]);

  // Reset the history loaded timestamp when chatId changes
  useEffect(() => {
    historyLoadedAtRef.current = 0;
  }, [chatId]);

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
      return;
    }

    // Skip saving if history was loaded within the last 3 seconds
    const timeSinceHistoryLoad = Date.now() - historyLoadedAtRef.current;
    if (historyLoadedAtRef.current > 0 && timeSinceHistoryLoad < 3000) {
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
        return;
      }

      // Double-check time since history load
      const timeSinceHistoryLoad = Date.now() - historyLoadedAtRef.current;
      if (historyLoadedAtRef.current > 0 && timeSinceHistoryLoad < 3000) {
        return;
      }

      // Read from ref to get the LATEST messages value
      const currentMessages = messagesRef.current.messages;

      // Check if there are any streaming messages
      const hasStreamingMessage = Array.from(currentMessages.values()).some(msg => msg.isStreaming);

      if (chatId && currentMessages.size > 0 && !hasStreamingMessage) {
        const historyJson = toHistory(currentMessages);
        saveMessages([{ id: chatId, events: historyJson, aiPrompts: "" }]);
      }
    }, 1000);
  }, [chatId, toHistory]);

  return debouncedSave;
}
