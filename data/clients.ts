import { Client } from '@/lib/types'

export const clients: Client[] = [
  {
    id: '1',
    coach_id: 'coach-1',
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

// Helper function to get full name
export const getClientFullName = (client: Client): string => {
  return `${client.first_name} ${client.last_name}`.trim()
}

// Helper function to get clients with full name
export const getClientsWithFullName = (): (Client & { fullName: string })[] => {
  return clients.map(client => ({
    ...client,
    fullName: getClientFullName(client)
  }))
}
