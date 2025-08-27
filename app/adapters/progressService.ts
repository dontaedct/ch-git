// Local type definitions to avoid direct supabase imports
interface Client {
  id: string
  first_name?: string | null
  last_name?: string | null
  full_name?: string | null
  email?: string | null
  created_at?: string | null
  coach_id?: string | null
}

interface WeeklyPlan {
  id: string
  coach_id?: string | null
  client_id?: string | null
  week_start_date?: string | null
  status?: string | null
  plan_json?: Record<string, unknown>
  tasks?: Array<{
    id: string
    title: string
    category: string
    frequency: string
    completed: boolean
  }>
  goals?: Array<{
    id: string
    title: string
    description: string
    target: string
  }>
}

interface CheckIn {
  id: string
  coach_id?: string | null
  client_id?: string | null
  check_in_date?: string | null
  mood_rating?: number | null
  energy_level?: number | null
  sleep_hours?: number | null
  water_intake_liters?: number | null
  weight_kg?: number | null
  body_fat_percentage?: number | null
  notes?: string | null
}

interface ProgressMetric {
  id: string
  client_id?: string | null
  coach_id?: string | null
  key?: string | null
  value?: number | null
  label?: string | null
  metric_date?: string | null
  weight_kg?: number | null
  body_fat_percentage?: number | null
}

export async function getProgressSummary(): Promise<{
  client: Client | null
  weeklyPlan: WeeklyPlan | null
  checkIns: CheckIn[]
  progressMetrics: ProgressMetric[]
}> {
  // This would be replaced with actual Supabase/database calls
  // For now, returning mock data to maintain functionality
  
  const clientId = 'client-1' // This would come from auth context
  
  const client: Client = {
    id: clientId,
    coach_id: 'coach-1',
    full_name: 'John Doe',
    email: 'john.doe@example.com',
    first_name: 'John',
    last_name: 'Doe',
    created_at: '2024-01-15T10:00:00Z',
  }

  const weeklyPlan: WeeklyPlan = {
    id: '1',
    coach_id: 'coach-1',
    client_id: clientId,
    week_start_date: '2024-01-15T00:00:00Z',
    status: 'active',
    plan_json: {},
    tasks: [
      { id: '1', title: 'Morning workout', category: 'workout', frequency: 'daily', completed: true },
      { id: '2', title: 'Protein shake', category: 'nutrition', frequency: 'daily', completed: false },
      { id: '3', title: 'Meditation', category: 'mindfulness', frequency: 'daily', completed: true },
    ],
    goals: [
      { id: '1', title: 'Build strength', description: 'Increase bench press by 20lbs', target: 'End of month' },
    ],
  }

  const checkIns: CheckIn[] = [
    {
      id: '1',
      coach_id: 'coach-1',
      client_id: clientId,
      check_in_date: '2024-01-20T08:00:00Z',
      mood_rating: 4,
      energy_level: 3,
      sleep_hours: 7,
      water_intake_liters: 2.5,
      weight_kg: 75,
      body_fat_percentage: 15,
    },
    {
      id: '2',
      coach_id: 'coach-1',
      client_id: clientId,
      check_in_date: '2024-01-19T08:00:00Z',
      mood_rating: 3,
      energy_level: 4,
      sleep_hours: 6,
      water_intake_liters: 2.0,
      weight_kg: 75.2,
      body_fat_percentage: 15.1,
    },
  ]

  const progressMetrics: ProgressMetric[] = [
    {
      id: '1',
      client_id: clientId,
      coach_id: 'coach-1',
      key: 'weight_delta',
      value: -2.5,
      label: 'Weight loss',
      metric_date: '2024-01-20T00:00:00Z',
    },
    {
      id: '2',
      client_id: clientId,
      coach_id: 'coach-1',
      key: 'weight_delta',
      value: -2.0,
      label: 'Weight loss',
      metric_date: '2024-01-19T00:00:00Z',
    },
  ]

  return {
    client,
    weeklyPlan,
    checkIns,
    progressMetrics,
  }
}

export async function getClientProgressData(clientId: string): Promise<{
  client: Client | null
  weeklyPlan: WeeklyPlan | null
  checkIns: CheckIn[]
  progressMetrics: ProgressMetric[]
}> {
  // This would be replaced with actual Supabase/database calls
  // For now, returning mock data to maintain functionality
  
  const client: Client = {
    id: clientId,
    coach_id: 'coach-1',
    full_name: 'John Doe',
    email: 'john.doe@example.com',
    first_name: 'John',
    last_name: 'Doe',
    created_at: '2024-01-15T10:00:00Z',
  }

  const weeklyPlan: WeeklyPlan = {
    id: '1',
    coach_id: 'coach-1',
    client_id: clientId,
    week_start_date: '2024-01-15T00:00:00Z',
    status: 'active',
    plan_json: {},
    tasks: [
      { id: '1', title: 'Morning workout', category: 'workout', frequency: 'daily', completed: true },
      { id: '2', title: 'Protein shake', category: 'nutrition', frequency: 'daily', completed: false },
      { id: '3', title: 'Meditation', category: 'mindfulness', frequency: 'daily', completed: true },
    ],
    goals: [
      { id: '1', title: 'Build strength', description: 'Increase bench press by 20lbs', target: 'End of month' },
    ],
  }

  const checkIns: CheckIn[] = [
    {
      id: '1',
      coach_id: 'coach-1',
      client_id: clientId,
      check_in_date: '2024-01-20T08:00:00Z',
      mood_rating: 4,
      energy_level: 3,
      sleep_hours: 7,
      water_intake_liters: 2.5,
      weight_kg: 75,
      body_fat_percentage: 15,
    },
    {
      id: '2',
      coach_id: 'coach-1',
      client_id: clientId,
      check_in_date: '2024-01-19T08:00:00Z',
      mood_rating: 3,
      energy_level: 4,
      sleep_hours: 6,
      water_intake_liters: 2.0,
      weight_kg: 75.2,
      body_fat_percentage: 15.1,
    },
  ]

  const progressMetrics: ProgressMetric[] = [
    {
      id: '1',
      client_id: clientId,
      coach_id: 'coach-1',
      key: 'weight_delta',
      value: -2.5,
      label: 'Weight loss',
      metric_date: '2024-01-20T00:00:00Z',
    },
    {
      id: '2',
      client_id: clientId,
      coach_id: 'coach-1',
      key: 'weight_delta',
      value: -2.0,
      label: 'Weight loss',
      metric_date: '2024-01-19T00:00:00Z',
    },
  ]

  return {
    client,
    weeklyPlan,
    checkIns,
    progressMetrics,
  }
}

export async function logProgressEntry(_data: {
  clientId: string
  moodRating?: number
  energyLevel?: number
  sleepHours?: number
  waterIntakeLiters?: number
  weightKg?: number
  bodyFatPercentage?: number
  notes?: string
}): Promise<void> {
  "use server"
  
  // This would be replaced with actual Supabase/database calls
  // For now, just handling the progress data
  
  // In a real implementation, this would:
  // 1. Validate the data
  // 2. Insert into the check_ins table
  // 3. Update progress metrics if weight/body fat changed
  // 4. Handle any errors and return appropriate responses
}
