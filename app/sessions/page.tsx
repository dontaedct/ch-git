export const dynamic = "force-dynamic";

import SessionList from "@/components/session-list";
import { listSessions, updateSession, deleteSession } from "@/app/adapters/sessionService";
import { getClientsWithFullName } from "@/app/adapters/clientService";
import { updateRSVP } from "@/app/adapters/sessionService";

export default async function SessionsPage() {
  const sessions = await listSessions();
  const clients = await getClientsWithFullName();

  async function onEditSession(data: Parameters<typeof updateSession>[1]) {
    "use server";
    if (data.id) {
      await updateSession(data.id, data);
      // optionally: revalidatePath('/sessions');
    }
  }

  async function onDeleteSession(sessionId: string) {
    "use server";
    await deleteSession(sessionId);
    // optionally: revalidatePath('/sessions');
  }

  async function onInviteClients(_sessionId: string, _clientIds: string[], _message: string) {
    "use server";
    // This would call the clientService.inviteClient function
    // For now, just handling the invitation data
  }

  async function onUpdateRSVP(sessionId: string, clientId: string, status: string, notes?: string) {
    "use server";
    await updateRSVP(sessionId, clientId, status, notes);
    // optionally: revalidatePath('/sessions');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SessionList
          sessions={sessions}
          clients={clients}
          onEditSession={onEditSession}
          onDeleteSession={onDeleteSession}
          onInviteClients={onInviteClients}
          onUpdateRSVP={onUpdateRSVP}
        />
      </div>
    </div>
  );
}
