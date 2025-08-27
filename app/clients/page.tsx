import { getClientsWithFullName } from "@/app/adapters/clientService";

export default async function ClientsPage() {
  const clients = await getClientsWithFullName();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-600 mt-2">Manage your clients and their information</p>
        </div>
        
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">All Clients</h2>
            <p className="text-sm text-gray-600">Total: {clients.length} clients</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {clients.map((client) => (
              <div key={client.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{client.fullName}</h3>
                    <p className="text-sm text-gray-600">{client.email}</p>
                    {client.phone && (
                      <p className="text-sm text-gray-500">{client.phone}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Member since</p>
                    <p className="font-medium">
                      {new Date(client.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {client.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-700">{client.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
