/**
 * Chat state management with Zustand
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  metadata?: {
    emails?: Array<{
      id: string;
      from: string;
      subject: string;
      date: string;
      snippet: string;
      summary: string;
      labels?: string[];
    }>;
    action_taken?: string;
    [key: string]: unknown;
  };
}

export interface User {
  id: string;
  email: string;
  google_id: string;
  created_at: string;
}

interface ChatStore {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;

  // Messages
  messages: Message[];
  addMessage: (message: Message) => void;
  clearMessages: () => void;

  // Loading state
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // Error state
  error: string | null;
  setError: (error: string | null) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      // User
      user: null,
      setUser: (user) => set({ user }),

      // Messages
      messages: [],
      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, { ...message, timestamp: new Date() }],
        })),
      clearMessages: () => set({ messages: [] }),

      // Loading
      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),

      // Error
      error: null,
      setError: (error) => set({ error }),
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({ user: state.user, messages: state.messages }),
    }
  )
);
