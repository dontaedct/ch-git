'use client'

// Local type definitions to avoid direct supabase imports
export interface Client {
  id: string
  first_name?: string | null
  last_name?: string | null
  full_name?: string | null
  email?: string | null
  created_at?: string | null
}

export interface WeeklyPlan {
  id: string
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

export interface CheckIn {
  id: string
  check_in_date?: string | null
  mood_rating?: number | null
  energy_level?: number | null
  sleep_hours?: number | null
  water_intake_liters?: number | null
  weight_kg?: number | null
  body_fat_percentage?: number | null
  notes?: string | null
}

export interface ProgressMetric {
  id: string
  metric_date?: string | null
  weight_kg?: number | null
  body_fat_percentage?: number | null
}

import { Progress } from '@/components/ui/progress'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

export type ProgressDashboardProps = {
  clientId: string
  client: Client | null
  weeklyPlan: WeeklyPlan | null
  checkIns: CheckIn[]
  progressMetrics: ProgressMetric[]
  loading?: boolean
  onLogProgress?: (data: {
    clientId: string
    moodRating?: number
    energyLevel?: number
    sleepHours?: number
    waterIntakeLiters?: number
    weightKg?: number
    bodyFatPercentage?: number
    notes?: string
  }) => void
}

export default function ProgressDashboard({ 
  client, 
  weeklyPlan, 
  checkIns, 
  progressMetrics, 
  loading = false,
  onLogProgress: _onLogProgress
}: ProgressDashboardProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!client) {
    return <div className="p-8 text-center text-gray-500">Client not found</div>
  }

  // Calculate metrics with proper null checks
  const compliancePercentage = weeklyPlan?.tasks && weeklyPlan.tasks.length > 0
    ? Math.round((weeklyPlan.tasks.filter(t => t.completed).length / weeklyPlan.tasks.length) * 100)
    : 0

  const totalCheckIns = checkIns.length
  const averageMood = checkIns.length > 0 
    ? Math.round(checkIns.reduce((sum, c) => sum + (c.mood_rating ?? 0), 0) / checkIns.length)
    : 0

  // Calculate streak
  const streak = checkIns.length > 0 ? 
    checkIns.filter((checkIn, index) => {
      if (index === 0) return true
      if (index - 1 >= 0 && index - 1 < checkIns.length) {
        const currentDate = new Date(checkIn.check_in_date ?? '')
        const prevCheckIn = checkIns[index - 1]
        if (!prevCheckIn) return false
        const prevDate = new Date(prevCheckIn.check_in_date ?? '')
        const diffDays = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
        return diffDays === 1
      }
      return false
    }).length : 0

  // Prepare chart data with null checks
  const weightChartData = progressMetrics
    .filter(m => m.weight_kg && m.metric_date)
    .map(m => ({
      date: new Date(m.metric_date!).toLocaleDateString(),
      weight: m.weight_kg!,
      bodyFat: m.body_fat_percentage ?? 0
    }))

  const checkInChartData = checkIns
    .filter(c => c.check_in_date && c.mood_rating !== null && c.energy_level !== null)
    .slice(-14) // Last 14 days
    .map(c => ({
      date: new Date(c.check_in_date!).toLocaleDateString(),
      mood: c.mood_rating!,
      energy: c.energy_level!
    }))

  return (
    <div className="space-y-6">
      {/* Client Header */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {client.first_name ?? client.full_name} {client.last_name ?? ''}
            </h2>
            <p className="text-gray-600">{client.email}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              Member since {client.created_at ? new Date(client.created_at).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="card p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Compliance</h3>
          <div className="text-2xl font-bold text-gray-900 mb-2">{compliancePercentage}%</div>
          <Progress value={compliancePercentage} className="h-2" />
        </div>
        
        <div className="card p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Check-ins</h3>
          <div className="text-2xl font-bold text-gray-900">{totalCheckIns}</div>
          <p className="text-sm text-gray-500">Lifetime total</p>
        </div>
        
        <div className="card p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Current Streak</h3>
          <div className="text-2xl font-bold text-gray-900">{streak}</div>
          <p className="text-sm text-gray-500">Days in a row</p>
        </div>
        
        <div className="card p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Avg. Mood</h3>
          <div className="text-2xl font-bold text-gray-900">{averageMood}/5</div>
          <p className="text-sm text-gray-500">Last 30 days</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Weight Progress */}
        {weightChartData.length > 0 && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weight Progress</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Check-in Trends */}
        {checkInChartData.length > 0 && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Check-in Trends</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={checkInChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Bar dataKey="mood" fill="#f59e0b" name="Mood" />
                  <Bar dataKey="energy" fill="#3b82f6" name="Energy" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Weekly Plan Status */}
      {weeklyPlan && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Weekly Plan</h3>
          <div className="space-y-4">
            {/* Goals Section */}
            {weeklyPlan.goals && weeklyPlan.goals.length > 0 ? (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Goals</h4>
                <div className="flex flex-wrap gap-2">
                  {weeklyPlan.goals.map((goal, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {goal.description}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Goals</h4>
                <p className="text-gray-500 text-sm">No goals set for this week</p>
              </div>
            )}
            
            {/* Tasks Section */}
            {weeklyPlan.tasks && weeklyPlan.tasks.length > 0 ? (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Task Completion</h4>
                <div className="space-y-3">
                  {weeklyPlan.tasks.map((task, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${
                        task.completed ? 'bg-green-500 text-white' : 'bg-gray-200'
                      }`}>
                        {task.completed && (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <span className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {task.title}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.category === 'workout' ? 'bg-red-100 text-red-800' :
                        task.category === 'nutrition' ? 'bg-green-100 text-green-800' :
                        task.category === 'mindfulness' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Task Completion</h4>
                <p className="text-gray-500 text-sm">No tasks assigned for this week</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Check-ins */}
      {checkIns.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Check-ins</h3>
          <div className="space-y-4">
            {checkIns.slice(0, 10).map((checkIn) => (
              <div key={checkIn.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">
                    {checkIn.check_in_date ? new Date(checkIn.check_in_date).toLocaleDateString() : 'No date'}
                  </span>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                      Mood: {checkIn.mood_rating ?? 'N/A'}/5
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      Energy: {checkIn.energy_level ?? 'N/A'}/5
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {checkIn.sleep_hours && (
                    <div>
                      <span className="text-gray-600">Sleep:</span>
                      <span className="ml-2 font-medium">{checkIn.sleep_hours}h</span>
                    </div>
                  )}
                  {checkIn.water_intake_liters && (
                    <div>
                      <span className="text-gray-600">Water:</span>
                      <span className="ml-2 font-medium">{checkIn.water_intake_liters}L</span>
                    </div>
                  )}
                  {checkIn.weight_kg && (
                    <div>
                      <span className="text-gray-600">Weight:</span>
                      <span className="ml-2 font-medium">{checkIn.weight_kg}kg</span>
                    </div>
                  )}
                  {checkIn.body_fat_percentage && (
                    <div>
                      <span className="text-gray-600">Body Fat:</span>
                      <span className="ml-2 font-medium">{checkIn.body_fat_percentage}%</span>
                    </div>
                  )}
                </div>
                
                {checkIn.notes && (
                  <p className="text-gray-700 mt-3 pt-3 border-t border-gray-200">
                    {checkIn.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
