"use client"; 

import Dexie from "dexie";
import "dexie-observable"; // สำหรับ observable changes
import "dexie-syncable";   // สำหรับ syncable

export interface ChatMessage {
  id: string;
  user: string;
  text: string;
  timestamp: number;
}

// สร้าง database
export class ChatDB extends Dexie {
  messages!: Dexie.Table<ChatMessage, string>;

  constructor() {
    super("chatdb");

    // เวอร์ชัน 1
    this.version(1).stores({
      messages: "id, user, timestamp" // id เป็น primary key
    });

    // ทำให้ table syncable
    this.messages.mapToClass(ChatDB); // optional: map class
  }
}

// สร้าง instance
export const db = new ChatDB();

// กำหนด sync protocol
Dexie.Syncable.registerSyncProtocol("webrtc", {
  sync: (changes, lastRevision, partial, onSuccess, onError) => {
    // ส่งข้อมูลไป peer
    peer.send(JSON.stringify(changes));
    onSuccess();
  },
  applyRemoteChanges: (changes, lastRevision, partial, clear, onSuccess, onError) => {
    // รับข้อมูลจาก peer
    peer.on("data", (data) => {
      const remoteChanges = JSON.parse(data);
      db.transaction("rw", db.messages, async () => {
        for (const change of remoteChanges) {
          if (change.type === "add") {
            await db.messages.put(change.obj);
          } else if (change.type === "update") {
            await db.messages.update(change.key, change.obj);
          } else if (change.type === "delete") {
            await db.messages.delete(change.key);
          }
        }
      });
      onSuccess();
    });
  }
});

// ตัวอย่างสร้าง peer (WebRTC)
import SimplePeer from "simple-peer";

const peer = new SimplePeer({ initiator: true });
peer.on("signal", (data) => {
  // ส่ง signal ไป peer อื่น
});
peer.on("connect", () => {
  // เมื่อเชื่อมต่อแล้ว ให้ start sync
  db.syncable.connect("webrtc", "group-chat-room", {});
});
