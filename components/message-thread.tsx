"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClientSupabaseClient } from "@/lib/supabase/client";
import type { Message } from "@/lib/types";

function sortMessages(messages: Message[]) {
  return [...messages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
}

export function MessageThread({
  initialMessages,
  title,
  currentUser,
  otherUser,
  optimisticMessage,
  onIncomingRead
}: {
  initialMessages: Message[];
  title: string;
  currentUser: {
    id: string;
    full_name: string;
  };
  otherUser: {
    id: string;
    full_name: string;
  };
  optimisticMessage?: Message | null;
  onIncomingRead?: () => void;
}) {
  const [messages, setMessages] = useState(() => sortMessages(initialMessages));
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentUserId = currentUser.id;
  const otherUserId = otherUser.id;
  const displayedMessages = useMemo(() => {
    if (
      optimisticMessage &&
      ((optimisticMessage.sender_id === currentUserId &&
        optimisticMessage.receiver_id === otherUserId) ||
        (optimisticMessage.sender_id === otherUserId &&
          optimisticMessage.receiver_id === currentUserId)) &&
      !messages.some((message) => message.id === optimisticMessage.id)
    ) {
      return sortMessages([...messages, optimisticMessage]);
    }

    return messages;
  }, [currentUserId, messages, optimisticMessage, otherUserId]);

  useEffect(() => {
    const supabase = createClientSupabaseClient();
    const channel = supabase
      .channel(`messages:${currentUserId}:${otherUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages"
        },
        (payload) => {
          const newMessage = payload.new as Message;
          const isRelevant =
            (newMessage.sender_id === currentUserId &&
              newMessage.receiver_id === otherUserId) ||
            (newMessage.sender_id === otherUserId &&
              newMessage.receiver_id === currentUserId);

          if (!isRelevant) {
            return;
          }

          setMessages((existing) => {
            if (existing.some((message) => message.id === newMessage.id)) {
              return existing;
            }

            return sortMessages([...existing, newMessage]);
          });

          if (newMessage.receiver_id === currentUserId) {
            onIncomingRead?.();
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [currentUserId, onIncomingRead, otherUserId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [displayedMessages]);

  return (
    <Card className="surface-panel h-full bg-white/72">
      <CardHeader className="border-b border-border/60">
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div ref={scrollRef} className="flex max-h-[32rem] flex-col gap-4 overflow-y-auto p-6">
          {displayedMessages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No messages yet. Start the conversation with a secure note.
            </p>
          ) : null}
          {displayedMessages.map((message) => {
            const isCurrentUser = message.sender_id === currentUserId;
            const sender = isCurrentUser ? currentUser : otherUser;

            return (
              <div
                key={message.id}
                className={isCurrentUser ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={
                    isCurrentUser
                      ? "flex max-w-[85%] flex-row-reverse gap-3"
                      : "flex max-w-[85%] gap-3"
                  }
                >
                  <Avatar className="mt-1">
                    <AvatarFallback>{sender.full_name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div
                    className={
                      isCurrentUser
                        ? "rounded-[1.5rem] rounded-tr-md bg-primary px-4 py-3 text-primary-foreground"
                        : "rounded-[1.5rem] rounded-tl-md border border-white/70 bg-white/80 px-4 py-3"
                    }
                  >
                    <div className="flex items-center gap-2 text-xs opacity-80">
                      <span className="font-semibold">{sender.full_name}</span>
                      <span>{format(new Date(message.created_at), "MMM d, h:mm a")}</span>
                    </div>
                    <p className={isCurrentUser ? "mt-2 text-sm" : "mt-2 text-sm text-muted-foreground"}>
                      {message.message}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
