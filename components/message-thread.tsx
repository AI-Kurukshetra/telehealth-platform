"use client";

import { useEffect, useState } from "react";
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
  optimisticMessage
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
}) {
  const [messages, setMessages] = useState(() => sortMessages(initialMessages));
  const currentUserId = currentUser.id;
  const otherUserId = otherUser.id;
  const displayedMessages =
    optimisticMessage &&
    ((optimisticMessage.sender_id === currentUserId &&
      optimisticMessage.receiver_id === otherUserId) ||
      (optimisticMessage.sender_id === otherUserId &&
        optimisticMessage.receiver_id === currentUserId)) &&
    !messages.some((message) => message.id === optimisticMessage.id)
      ? sortMessages([...messages, optimisticMessage])
      : messages;

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
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [currentUserId, otherUserId]);

  return (
    <Card className="surface-panel bg-white/72">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayedMessages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No messages yet. Start the conversation with a secure note.
          </p>
        ) : null}
        {displayedMessages.map((message) => {
          const sender =
            message.sender_id === currentUserId ? currentUser : otherUser;

          return (
            <div key={message.id} className="flex gap-3 rounded-[1.5rem] border border-white/60 bg-white/62 p-4">
              <Avatar>
                <AvatarFallback>{sender?.full_name.slice(0, 2) ?? "CB"}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{sender?.full_name}</p>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(message.created_at), "MMM d, h:mm a")}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{message.message}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
