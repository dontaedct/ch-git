'use client'

import { useState, Suspense } from 'react'
import { Client, WeeklyPlan, CheckIn, ProgressMetric } from '@/lib/supabase/types'
import { Progress } from '@/components/ui/progress'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import ErrorBoundary from '@/components/ui/error-boundary'
import { SmallLoader } from '@/components/ui/small-loader'

interface ProgressDashboardProps {
  _clientId: string
  initialData: {
    client: Client | null
    weeklyPlan: WeeklyPlan | null
    checkIns: CheckIn[]
    progressMetrics: ProgressMetric[]
  }
}

function ProgressDashboardContent({ _clientId, initialData }: ProgressDashboardProps) {
  const [client] = useState<Client | null>(initialData.client)
  const [weeklyPlan] = useState<WeeklyPlan | null>(initialData.weeklyPlan)
  const [checkIns] = useState<CheckIn[]>(initialData.checkIns)
  const [progressMetrics] = useState<ProgressMetric[]>(initialData.progressMetrics)

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
    <ErrorBoundary>
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
              <p className="text-sm text-gray-500">Member since</p>
              <p className="font-medium">
                {new Date(client.created_at).toLocaleDateString()}
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
          </div>
          
          <div className="card p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Average Mood</h3>
            <div className="text-2xl font-bold text-gray-900">{averageMood}/10</div>
          </div>
          
          <div className="card p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Current Streak</h3>
            <div className="text-2xl font-bold text-gray-900">{streak} days</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Weight Progress Chart */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weight Progress</h3>
            {weightChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weightChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="bodyFat" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No weight data available
              </div>
            )}
          </div>

          {/* Check-in Mood & Energy Chart */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood & Energy Trends</h3>
            {checkInChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={checkInChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Bar dataKey="mood" fill="#3b82f6" name="Mood" />
                  <Bar dataKey="energy" fill="#10b981" name="Energy" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No check-in data available
              </div>
            )}
          </div>
        </div>

        {/* Recent Check-ins */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Check-ins</h3>
          {checkIns.length > 0 ? (
            <div className="space-y-3">
              {checkIns.slice(0, 5).map((checkIn) => (
                <div key={checkIn.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium">
                      {checkIn.check_in_date ? new Date(checkIn.check_in_date).toLocaleDateString() : 'No date'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Mood: {checkIn.mood_rating ?? 'N/A'}/10</span>
                    <span>Energy: {checkIn.energy_level ?? 'N/A'}/10</span>
                    {checkIn.weight_kg && <span>Weight: {checkIn.weight_kg}kg</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No check-ins recorded yet
            </div>
          )}
        </div>

        {/* Weekly Plan Summary */}
        {weeklyPlan && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Weekly Plan</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{weeklyPlan.title}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  weeklyPlan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {weeklyPlan.status}
                </span>
              </div>
              {weeklyPlan.description && (
                <p className="text-gray-600">{weeklyPlan.description}</p>
              )}
              {weeklyPlan.tasks && weeklyPlan.tasks.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Tasks</h4>
                  <div className="space-y-2">
                    {weeklyPlan.tasks.map((task, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          disabled
                          className="w-4 h-4 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className={task.completed ? 'line-through text-gray-500' : 'text-gray-900'}>
                          {task.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export function ProgressDashboard({ _clientId, initialData }: ProgressDashboardProps) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<SmallLoader />}>
        <ProgressDashboardContent _clientId={_clientId} initialData={initialData} />
      </Suspense>
    </ErrorBoundary>
  );
}
