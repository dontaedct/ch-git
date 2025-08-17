'use client'

import { useState } from 'react'
import { createClient } from '@lib/supabase/client'
import { Client, WeeklyPlan, CheckIn, ProgressMetric } from '@lib/supabase/types'
import { Progress } from '@ui/progress'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ClientPortalPageContentProps {
  initialData: {
    client: Client;
    weeklyPlan: WeeklyPlan | null;
    checkIns: CheckIn[];
    progressMetrics: ProgressMetric[];
  };
  _clientId: string;
  _coachId: string;
}

export function ClientPortalPageContent({ initialData, _clientId, _coachId }: ClientPortalPageContentProps) {
  const [client] = useState<Client>(initialData.client)
  const [weeklyPlan] = useState<WeeklyPlan | null>(initialData.weeklyPlan)
  const [checkIns] = useState<CheckIn[]>(initialData.checkIns)
  const [progressMetrics] = useState<ProgressMetric[]>(initialData.progressMetrics)
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    // In a real app, you might want to redirect here
    window.location.href = '/login'
  }

  // Calculate compliance percentage
  const compliancePercentage = weeklyPlan?.tasks && weeklyPlan.tasks.length > 0
    ? Math.round((weeklyPlan.tasks.filter(t => t.completed).length / weeklyPlan.tasks.length) * 100)
    : 0

  // Calculate streak
  const streak = checkIns.length > 0 ? 
    checkIns.filter((checkIn, index) => {
      if (index === 0) return true
      if (index - 1 >= 0 && index - 1 < checkIns.length) {
        if (!checkIn.check_in_date) return false
        const currentDate = new Date(checkIn.check_in_date)
        const prevCheckIn = checkIns[index - 1]
        if (!prevCheckIn?.check_in_date) return false
        const prevDate = new Date(prevCheckIn.check_in_date)
        const diffDays = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
        return diffDays === 1
      }
      return false
    }).length : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-lg sm:text-xl font-semibold text-gray-900">Client Portal</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="hidden sm:inline text-gray-600">Welcome, {client?.first_name ?? 'Client'}!</span>
              <button
                onClick={handleSignOut}
                className="btn-ghost px-3 sm:px-4 py-2 text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Progress Widgets */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="card p-4 sm:p-6">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Compliance</h3>
            <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{compliancePercentage}%</div>
            <Progress value={compliancePercentage} className="h-2" />
          </div>
          
          <div className="card p-4 sm:p-6">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Sessions Done</h3>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{checkIns.length}</div>
            <p className="text-xs sm:text-sm text-gray-500">Total check-ins</p>
          </div>
          
          <div className="card p-4 sm:p-6">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Current Streak</h3>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{streak}</div>
            <p className="text-xs sm:text-sm text-gray-500">Days in a row</p>
          </div>
          
          <div className="card p-4 sm:p-6">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Current Weight</h3>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">
              {progressMetrics.length > 0 ? `${progressMetrics[progressMetrics.length - 1]?.weight_kg ?? 'N/A'}kg` : 'N/A'}
            </div>
            <p className="text-xs sm:text-sm text-gray-500">Latest measurement</p>
          </div>
        </div>

        {/* Weight Progress Chart */}
        {progressMetrics.length > 0 && (
          <div className="card p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weight Progress</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressMetrics.filter(m => m.weight_kg)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="metric_date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString()}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value) => [`${value}kg`, 'Weight']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weight_kg" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Weekly Plan */}
        {weeklyPlan && (
          <div className="card p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Weekly Plan</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Goals</h4>
                <div className="flex flex-wrap gap-2">
                  {weeklyPlan.goals?.map((goal, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {goal.title}
                    </span>
                  )) ?? <span className="text-gray-500 text-sm">No goals set</span>}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Tasks</h4>
                <div className="space-y-3">
                  {weeklyPlan.tasks?.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
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
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
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
                  )) ?? <span className="text-gray-500 text-sm">No tasks assigned</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Check-ins */}
        {checkIns.length > 0 && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Check-ins</h3>
            <div className="space-y-4">
              {checkIns.slice(0, 5).map((checkIn) => (
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
      </main>
    </div>
  )
}
