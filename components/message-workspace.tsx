"use client";

import { useState } from "react";

import { MessageComposer } from "@/components/forms/message-composer";
import { MessageThread } from "@/components/message-thread";
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

  return (
    <>
      <MessageThread
        initialMessages={initialMessages}
        title={title}
        currentUser={currentUser}
        otherUser={otherUser}
        optimisticMessage={optimisticMessage}
      />
      <MessageComposer
        receiverId={otherUser.id}
        onSent={(message) => setOptimisticMessage(message)}
      />
    </>
  );
}
