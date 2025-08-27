import InvitePanel from "@/components/invite-panel";
import { getClientsWithFullName, inviteClient } from "@/app/adapters/clientService";

export default async function InviteClientsPage() {
  const clients = await getClientsWithFullName();

  async function onInvite(sessionId: string, clientIds: string[], message: string) {
    "use server";
    await inviteClient({ sessionId, clientIds, message });
    // optionally: revalidatePath('/clients/invite');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Invite Clients</h1>
          <p className="text-gray-600 mt-2">Send invitations to your clients for training sessions</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Available Clients</h2>
            <p className="text-sm text-gray-600">
              Select clients to invite to your training sessions. You can send personalized messages with each invitation.
            </p>
          </div>
          
          <InvitePanel
            sessionId="demo-session"
            clients={clients}
            onInvite={onInvite}
          />
        </div>
      </div>
    </div>
  );
}
