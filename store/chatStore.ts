import { create } from "zustand";
import { db, ChatMessage } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

type ChatState = {
  messages: ChatMessage[];
  addMessage: (user: string, text: string) => Promise<void>;
  loadMessages: () => Promise<void>;
};

export const useChatStore = create<ChatState>((set) => ({
  messages: [],

  loadMessages: async () => {
    const allMessages = await db.messages.toArray();
    set({ messages: allMessages });
  },

  addMessage: async (user, text) => {
    const newMsg: ChatMessage = {
      id: uuidv4(),
      user,
      text,
      timestamp: Date.now(),
    };
    await db.messages.add(newMsg);
    set((state) => ({ messages: [...state.messages, newMsg] }));
  },
}));
