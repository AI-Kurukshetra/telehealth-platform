"use client";

import { useActionState, useEffect, useRef } from "react";

import { sendMessageAction } from "@/app/actions/messages";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Message } from "@/lib/types";

const initialState = { error: "", success: false, data: undefined };

export function MessageComposer({
  receiverId,
  onSent
}: {
  receiverId: string;
  onSent?: (message: Message) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(sendMessageAction, initialState);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  useEffect(() => {
    if (state.success && state.createdMessage) {
      onSent?.(state.createdMessage);
    }
  }, [onSent, state.createdMessage, state.success]);

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <input type="hidden" name="receiverId" value={receiverId} />
      <Textarea name="message" placeholder="Write a secure message..." />
      {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-700">Message sent securely.</p> : null}
      <Button disabled={pending}>{pending ? "Sending..." : "Send message"}</Button>
    </form>
  );
}
