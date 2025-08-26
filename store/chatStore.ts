import { create } from "zustand";
import { db, ChatMessage } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { PeerConnection } from "@/lib/peerConnection";

type ChatState = {
  messages: ChatMessage[];
  peerConnection: PeerConnection | null;
  addMessage: (user: string, text: string) => Promise<void>;
  loadMessages: () => Promise<void>;
};

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  peerConnection: null,

  loadMessages: async () => {
    const allMessages = await db.messages.toArray();
    set({ messages: allMessages });

    const pc = new PeerConnection({
      initiator: false, // หรือ true สำหรับ peer ตัวแรก
      signalingServerUrl: "ws://localhost:8080",
      onData: (data) => console.log("Peer on data", data),
      onConnect: () => console.log("Connected to peer"),
    });
    console.log("pc", pc)
    set({ peerConnection: pc });
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
