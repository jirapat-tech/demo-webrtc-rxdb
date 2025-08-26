"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Paperclip,
  Send,
  Image as ImageIcon,
  Phone,
  Video,
  Search,
  MoreVertical,
  Users,
  Hash,
  Mic,
  CheckCheck,
  Check,
  Pin,
} from "lucide-react";

import { useChatStore } from "@/store/chatStore";
import { PeerConnection } from "@/lib/peerConnection";

export default function GroupChat() {
  const { messages, addMessage, loadMessages } = useChatStore();
  const [input, setInput] = useState("");
  const [peerConn, setPeerConn] = useState<PeerConnection | null>(null);

  useEffect(() => {
    const pc = new PeerConnection({
      initiator: false,
      signalingServerUrl: "ws://192.168.1.41:500",
      onData: (data) => console.log("data", data),
      onConnect: () => console.log("Connected to peer"),
    });

    setPeerConn(pc);
    
    loadMessages();
  }, []);


  const handleSend = async () => {
    if (!input.trim()) return;
    peerConn?.send(input);
    await addMessage("me", input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen p-4">
      <div className="flex-1 overflow-y-auto border rounded-lg p-2">
        {messages.map((m) => (
          <div key={m.id} className="p-1">
            <b>{m.user}:</b> {m.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border flex-1 p-2 rounded"
          placeholder="Type message..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-3 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}

function RoomItem({
  name,
  topic,
  count,
  active = false,
}: {
  name: string;
  topic: string;
  count: number;
  active?: boolean;
}) {
  return (
    <button
      className={cn(
        "w-full text-left px-3 py-2 rounded-xl border flex items-center gap-3 transition",
        active ? "bg-indigo-50 border-indigo-200" : "hover:bg-muted"
      )}
    >
      <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{name}</span>
          {count > 0 && <Badge variant="secondary">{count}</Badge>}
        </div>
        <div className="text-xs text-muted-foreground truncate">{topic}</div>
      </div>
    </button>
  );
}

function MessageRow({
  msg,
  self,
  name,
  color,
  onPin,
  onReact,
  reactionBar,
}: {
  msg: any;
  self: boolean;
  name: string;
  color: string;
  onPin: () => void;
  onReact: (emoji: string) => void;
  reactionBar: string[];
}) {
  const time = new Date(msg.ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={cn(
        "flex gap-2 items-end group",
        self ? "flex-row-reverse" : ""
      )}
    >
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className={cn("text-white", color)}>
          {name.slice(0, 2)}
        </AvatarFallback>
      </Avatar>

      <div className={cn("max-w-[70%]", self ? "items-end" : "items-start")}>
        {/* Name + actions */}
        <div
          className={cn(
            "flex items-center text-xs text-muted-foreground mb-1",
            self ? "justify-end" : "justify-start"
          )}
        >
          {!self && (
            <span className="mr-2 font-medium text-foreground">{name}</span>
          )}
          {msg.pinned && (
            <Badge variant="outline" className="gap-1">
              <Pin className="w-3 h-3" /> Pinned
            </Badge>
          )}
        </div>

        {/* Bubble */}
        <div className={cn("relative")}>
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "rounded-2xl px-3 py-2 border shadow-sm",
              self ? "bg-indigo-600 text-white border-indigo-600" : "bg-white"
            )}
          >
            {msg.type === "image" ? (
              <img
                src={msg.imageUrl}
                alt="attachment"
                className="rounded-xl object-cover max-h-72"
              />
            ) : (
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
            )}

            <div
              className={cn(
                "mt-1 text-[10px] flex items-center gap-1",
                self
                  ? "justify-end opacity-80"
                  : "justify-start text-muted-foreground"
              )}
            >
              <span>{time}</span>
              {self &&
                (msg.status === "read" ? (
                  <CheckCheck className="w-3 h-3" />
                ) : msg.status === "sent" ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <span className="italic">กำลังส่ง…</span>
                ))}
            </div>
          </motion.div>

          {/* Hover actions */}
          <div
            className={cn(
              "absolute -top-3 flex gap-1 opacity-0 group-hover:opacity-100 transition",
              self ? "right-0" : "left-0"
            )}
          >
            <EmojiBar onSelect={onReact} items={reactionBar} />
            <Button
              variant="secondary"
              size="sm"
              className="h-6 text-[10px]"
              onClick={onPin}
            >
              Pin
            </Button>
          </div>

          {/* Reactions cloud */}
          {msg.reactions && Object.keys(msg.reactions).length > 0 && (
            <div
              className={cn(
                "mt-1 flex gap-1",
                self ? "justify-end" : "justify-start"
              )}
            >
              {Object.entries(msg.reactions).map(([emoji, users]: any) => (
                <button
                  key={emoji}
                  onClick={() => onReact(emoji)}
                  className={cn(
                    "text-xs border rounded-full px-2 py-0.5",
                    (users as string[]).length ? "bg-muted" : ""
                  )}
                  title={`${users.length} reacted`}
                >
                  {emoji} {users.length}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmojiBar({
  items,
  onSelect,
}: {
  items: string[];
  onSelect: (e: string) => void;
}) {
  return (
    <div className="bg-white border rounded-full shadow-sm px-1 py-0.5 flex items-center gap-1">
      {items.map((e) => (
        <button
          key={e}
          onClick={() => onSelect(e)}
          className="px-2 py-0.5 text-sm rounded-full hover:bg-muted"
        >
          {e}
        </button>
      ))}
    </div>
  );
}
