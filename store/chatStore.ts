import { create } from "zustand";
import { db, ChatMessage } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

type ChatState = {
  messages: ChatMessage[];
  loadMessages: () => Promise<void>;
  addMessage: (user: string, text: string) => Promise<void>;
};

export const useChatStore = create<ChatState>((set) => ({
  messages: [],

  loadMessages: async () => {
    const allMessages = await db.messages.orderBy("timestamp").toArray();
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
