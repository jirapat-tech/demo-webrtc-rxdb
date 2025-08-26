import Dexie from "dexie";

export interface ChatMessage {
  id: string;
  user: string;
  text: string;
  timestamp: number;
}

export class ChatDB extends Dexie {
  messages!: Dexie.Table<ChatMessage, string>;

  constructor() {
    super("chatdb");
    this.version(1).stores({
      messages: "id, user, timestamp", // id เป็น primary key
    });
  }
}

export const db = new ChatDB();
