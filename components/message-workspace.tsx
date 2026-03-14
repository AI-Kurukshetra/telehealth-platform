"use client";

import { useCallback, useState } from "react";

import { MessageComposer } from "@/components/forms/message-composer";
import { MessageThread } from "@/components/message-thread";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Message } from "@/lib/types";

export function MessageWorkspace({
  initialMessages,
  title,
  currentUser,
  otherUser
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
}) {
  const [optimisticMessage, setOptimisticMessage] = useState<Message | null>(null);
  const [markingRead, setMarkingRead] = useState(false);

  const markRead = useCallback(async () => {
    if (markingRead) {
      return;
    }

    setMarkingRead(true);

    try {
      await fetch("/api/messages/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          otherUserId: otherUser.id
        })
      });
    } finally {
      setMarkingRead(false);
    }
  }, [markingRead, otherUser.id]);

  return (
    <div className="grid gap-4">
      <MessageThread
        initialMessages={initialMessages}
        title={title}
        currentUser={currentUser}
        otherUser={otherUser}
        optimisticMessage={optimisticMessage}
        onIncomingRead={markRead}
      />
      <Card className="bg-white/95">
        <CardHeader>
          <CardTitle className="text-lg">Reply securely</CardTitle>
        </CardHeader>
        <CardContent>
          <MessageComposer
            receiverId={otherUser.id}
            onSent={(message) => setOptimisticMessage(message)}
            onFocus={markRead}
          />
        </CardContent>
      </Card>
    </div>
  );
}
