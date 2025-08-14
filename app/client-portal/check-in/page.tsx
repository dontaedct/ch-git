'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Client, CheckInInsert } from '@/lib/supabase/types'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { sanitizeText } from '@/lib/sanitize'
import { getWeekStartDate } from '@/lib/utils'

export default function CheckInPage() {
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const loadClientData = useCallback(async (userId: string) => {
    try {
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('auth_user_id', userId)
        .single()

      if (clientData) {
        setClient(clientData as Client)
      }
    } catch {
      setError('Failed to load client data')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const checkAuth = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await loadClientData(user.id)
      } else {
        router.push('/client-portal')
      }
    } catch {
      setError('Authentication error')
      setLoading(false)
    }
  }, [loadClientData, router, supabase.auth])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])



  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      
      const checkInData: CheckInInsert = {
        client_id: client!.id,
        coach_id: client!.coach_id,
        week_start_date: getWeekStartDate(), // Use utility function for proper week start
        check_in_date: new Date().toISOString(),
        mood_rating: parseInt(formData.get('mood_rating') as string) as 1 | 2 | 3 | 4 | 5,
        energy_level: parseInt(formData.get('energy_level') as string) as 1 | 2 | 3 | 4 | 5,
        sleep_hours: formData.get('sleep_hours') ? parseFloat(formData.get('sleep_hours') as string) : null,
        water_intake_liters: formData.get('water_intake_liters') ? parseFloat(formData.get('water_intake_liters') as string) : null,
        weight_kg: formData.get('weight_kg') ? parseFloat(formData.get('weight_kg') as string) : null,
        body_fat_percentage: formData.get('body_fat_percentage') ? parseFloat(formData.get('body_fat_percentage') as string) : null,
        notes: sanitizeText(formData.get('notes') as string | null),
      }

      const { error: insertError } = await supabase
        .from('check_ins')
        .insert(checkInData)

      if (insertError) {
        throw insertError
      }

      // If weight was provided, also add to progress metrics
      if (checkInData.weight_kg) {
        const { error: metricError } = await supabase
          .from('progress_metrics')
          .insert({
            client_id: client!.id,
            coach_id: client!.coach_id,
            metric_date: checkInData.check_in_date,
            weight_kg: checkInData.weight_kg,
            body_fat_percentage: checkInData.body_fat_percentage,
          })

        if (metricError) {
          if (process.env.NODE_ENV !== "production") {
            console.warn('Failed to save progress metric:', metricError)
          }
        }
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/client-portal')
      }, 2000)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit check-in'
      setError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Client not found</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-3xl mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-headline font-bold text-gray-900 mb-4">Check-in Submitted!</h1>
          <p className="text-body text-gray-600">Redirecting you back to your portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xl font-semibold text-gray-900">Daily Check-in</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/client-portal" className="text-gray-600 hover:text-gray-900 transition-colors">
                Back to Portal
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-display font-bold text-gray-900 mb-4">Daily Check-in</h1>
            <p className="text-body text-gray-600">
              Track your progress and share how you&apos;re feeling today
            </p>
          </div>

          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mood Rating */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">How are you feeling today?</label>
                <div className="grid grid-cols-5 gap-3">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <label key={rating} className="flex flex-col items-center">
                      <input
                        type="radio"
                        name="mood_rating"
                        value={rating}
                        required
                        className="sr-only"
                      />
                      <div className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center cursor-pointer transition-all hover:border-blue-300 peer-checked:border-blue-500 peer-checked:bg-blue-500 peer-checked:text-white">
                        {rating === 1 && '😢'}
                        {rating === 2 && '😕'}
                        {rating === 3 && '😐'}
                        {rating === 4 && '🙂'}
                        {rating === 5 && '😄'}
                      </div>
                      <span className="text-xs text-gray-600 mt-1">{rating}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Energy Level */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Energy level (1-5)</label>
                <div className="grid grid-cols-5 gap-3">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <label key={level} className="flex flex-col items-center">
                      <input
                        type="radio"
                        name="energy_level"
                        value={level}
                        required
                        className="sr-only"
                      />
                      <div className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center cursor-pointer transition-all hover:border-blue-300 peer-checked:border-blue-500 peer-checked:bg-blue-500 peer-checked:text-white">
                        {level === 1 && '🔋'}
                        {level === 2 && '⚡'}
                        {level === 3 && '💪'}
                        {level === 4 && '🚀'}
                        {level === 5 && '🔥'}
                      </div>
                      <span className="text-xs text-gray-600 mt-1">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sleep */}
              <div className="space-y-2">
                <label htmlFor="sleep_hours" className="text-sm font-medium text-gray-700">
                  How many hours did you sleep last night?
                </label>
                <input
                  id="sleep_hours"
                  name="sleep_hours"
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  className="input w-full"
                  placeholder="e.g., 7.5"
                />
              </div>

              {/* Water Intake */}
              <div className="space-y-2">
                <label htmlFor="water_intake_liters" className="text-sm font-medium text-gray-700">
                  Water intake today (liters)
                </label>
                <input
                  id="water_intake_liters"
                  name="water_intake_liters"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  className="input w-full"
                  placeholder="e.g., 2.5"
                />
              </div>

              {/* Weight */}
              <div className="space-y-2">
                <label htmlFor="weight_kg" className="text-sm font-medium text-gray-700">
                  Current weight (kg)
                </label>
                <input
                  id="weight_kg"
                  name="weight_kg"
                  type="number"
                  min="20"
                  max="500"
                  step="0.1"
                  className="input w-full"
                  placeholder="e.g., 75.5"
                />
              </div>

              {/* Body Fat */}
              <div className="space-y-2">
                <label htmlFor="body_fat_percentage" className="text-sm font-medium text-gray-700">
                  Body fat percentage
                </label>
                <input
                  id="body_fat_percentage"
                  name="body_fat_percentage"
                  type="number"
                  min="0"
                  max="50"
                  step="0.1"
                  className="input w-full"
                  placeholder="e.g., 15.2"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium text-gray-700">
                  Additional notes (optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  className="input w-full resize-none"
                  placeholder="How was your workout? Any challenges or wins today?"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => router.push('/client-portal')}
                  className="btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    'Submit Check-in'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
