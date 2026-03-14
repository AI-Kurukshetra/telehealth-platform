import { MessageContactList } from "@/components/message-contact-list";
import { MessageWorkspace } from "@/components/message-workspace";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getCurrentUserContext,
  listConversationMessagesForCurrentUser,
  listMessageContactsForCurrentUser
} from "@/lib/data";

export default async function PatientMessagesPage({
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
    ? await listConversationMessagesForCurrentUser(activeContactId)
    : [];

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr_0.7fr]">
      <MessageContactList
        contacts={contacts}
        activeContactId={activeContactId}
        basePath="/patient/messages"
      />
      <Card className="bg-white/95">
        <CardHeader>
          <CardTitle>
            {activeContact ? `Conversation with ${activeContact.full_name}` : "Conversation with care team"}
          </CardTitle>
        </CardHeader>
        <CardContent>
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
            <p className="text-sm text-muted-foreground">
              Book or complete an appointment first to start a secure conversation.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
