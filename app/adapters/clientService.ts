import { Client } from '@/lib/supabase/types'

export type ClientWithFullName = Client & { fullName: string }

export async function listClients(): Promise<ClientWithFullName[]> {
  // This would be replaced with actual Supabase/database calls
  // For now, returning mock data to maintain functionality
  const clients = [
    {
      id: '1',
      coach_id: 'coach-1',
      full_name: 'John Doe',
      email: 'john.doe@example.com',
      first_name: 'John',
      last_name: 'Doe',
      phone: '+1-555-0123',
      notes: 'Prefers morning sessions',
      stripe_customer_id: 'cus_123456789',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      coach_id: 'coach-1',
      full_name: 'Jane Smith',
      email: 'jane.smith@example.com',
      first_name: 'Jane',
      last_name: 'Smith',
      phone: '+1-555-0124',
      notes: 'Focus on strength training',
      stripe_customer_id: 'cus_123456790',
      created_at: '2024-01-16T11:00:00Z',
      updated_at: '2024-01-16T11:00:00Z',
    },
    {
      id: '3',
      coach_id: 'coach-1',
      full_name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      first_name: 'Mike',
      last_name: 'Johnson',
      phone: '+1-555-0125',
      notes: 'Recovery from knee injury',
      stripe_customer_id: 'cus_123456791',
      created_at: '2024-01-17T12:00:00Z',
      updated_at: '2024-01-17T12:00:00Z',
    },
  ]
  
  return clients.map(client => ({
    ...client,
    fullName: `${client.first_name} ${client.last_name}`.trim()
  }))
}

export async function getClientsWithFullName(): Promise<ClientWithFullName[]> {
  return await listClients()
}

export async function getClientById(id: string): Promise<Client | null> {
  const clients = await listClients()
  return clients.find(client => client.id === id) ?? null
}

export async function inviteClient(_payload: {
  sessionId: string
  clientIds: string[]
  message: string
}): Promise<void> {
  "use server"
  
  // This would be replaced with actual Supabase/database calls
  // For now, just handling the invitation data
  
  // In a real implementation, this would:
  // 1. Validate the session and client IDs
  // 2. Create invitation records in the database
  // 3. Send email notifications
  // 4. Handle any errors and return appropriate responses
}
