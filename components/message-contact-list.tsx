import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import { cn } from "@/lib/utils";
import type { MessageContact } from "@/lib/types";

export function MessageContactList({
  contacts,
  activeContactId,
  basePath
}: {
  contacts: MessageContact[];
  activeContactId?: string;
  basePath: "/patient/messages" | "/doctor/messages";
}) {
  return (
    <div className="surface-panel rounded-[2rem] p-4">
      <div className="mb-4 px-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Conversations
        </p>
      </div>
      <div className="space-y-2">
        {contacts.map((contact) => {
          const active = contact.id === activeContactId;

          return (
            <Link
              key={contact.id}
              href={`${basePath}?contact=${contact.id}`}
              className={cn(
                "block rounded-[1.35rem] border px-4 py-3 transition-colors",
                active
                  ? "border-primary/20 bg-primary/10"
                  : "border-transparent bg-white/60 hover:border-border/70 hover:bg-white/80"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold">{contact.full_name}</p>
                    {contact.unread_count ? (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                        {contact.unread_count}
                      </span>
                    ) : null}
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {contact.specialization ?? contact.email}
                  </p>
                  {contact.last_message_preview ? (
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {contact.last_message_preview}
                    </p>
                  ) : null}
                </div>
                {contact.last_message_at ? (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(contact.last_message_at), {
                      addSuffix: true
                    })}
                  </span>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
