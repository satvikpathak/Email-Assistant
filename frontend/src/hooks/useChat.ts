/**
 * Chat hook with API integration
 */

import { useState, useCallback } from "react";
import { apiClient } from "@/lib/apiClient";
import { useChatStore } from "./useChatStore";

export function useChat() {
  const { user, messages, addMessage, setLoading, setError, isLoading } =
    useChatStore();
  const [isSending, setIsSending] = useState(false);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!user || !content.trim()) {
        return;
      }

      setIsSending(true);
      setError(null);

      // Add user message immediately
      addMessage({ role: "user", content });

      try {
        // Send to backend with full message history including metadata
        const response = await apiClient.sendMessage(
          user.id,
          content,
          messages.map((m) => ({
            role: m.role,
            content: m.content,
            metadata: m.metadata || null,
          }))
        );

        // Add assistant response with metadata
        addMessage({
          role: "assistant",
          content: response.message,
          metadata: response.metadata || {},
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to send message. Please try again.";
        setError(errorMessage);
        addMessage({
          role: "assistant",
          content: `Error: ${errorMessage}`,
        });
      } finally {
        setIsSending(false);
      }
    },
    [user, messages, addMessage, setError]
  );

  const loadHistory = useCallback(async () => {
    if (!user) {
      return;
    }

    setLoading(true);
    try {
      const history = await apiClient.getChatHistory(user.id);
      // History is already in chronological order from backend
      history.forEach((msg) => {
        addMessage({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        });
      });
    } catch (error) {
      console.error("Failed to load chat history:", error);
    } finally {
      setLoading(false);
    }
  }, [user, addMessage, setLoading]);

  return {
    messages,
    sendMessage,
    loadHistory,
    isSending,
    isLoading,
  };
}
