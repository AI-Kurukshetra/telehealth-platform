import { MessageContactList } from "@/components/message-contact-list";
import { MessageWorkspace } from "@/components/message-workspace";
import {
  getCurrentUserContext,
  listConversationMessagesForCurrentUser,
  listMessageContactsForCurrentUser,
  markConversationAsRead
} from "@/lib/data";

export default async function DoctorMessagesPage({
  searchParams
}: {
  searchParams: Promise<{ contact?: string }>;
}) {
  const [{ user }, contacts, params] = await Promise.all([
    getCurrentUserContext(),
    listMessageContactsForCurrentUser(),
    searchParams
  ]);

  const activeContactId = params.contact ?? contacts[0]?.id;
  const activeContact = contacts.find((contact) => contact.id === activeContactId);
  const messages = activeContactId
    ? await (async () => {
        await markConversationAsRead(activeContactId);
        return listConversationMessagesForCurrentUser(activeContactId);
      })()
    : [];

  return (
    <div className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
      <MessageContactList
        contacts={contacts}
        activeContactId={activeContactId}
        basePath="/doctor/messages"
      />
      {activeContact ? (
        <MessageWorkspace
          key={activeContactId ?? "empty"}
          initialMessages={messages}
          title={`Conversation with ${activeContact.full_name}`}
          currentUser={{
            id: user.id,
            full_name: user.full_name
          }}
          otherUser={{
            id: activeContact.id,
            full_name: activeContact.full_name
          }}
        />
      ) : (
        <div className="surface-panel rounded-[2rem] p-8 text-sm text-muted-foreground">
          A patient conversation will appear here once appointments exist.
        </div>
      )}
    </div>
  );
}
