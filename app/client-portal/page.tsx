'use client'

import { useState, useEffect, useCallback } from 'react'
// TODO: Replace with clientService adapter when created
// import { getClientById } from '@/app/adapters/clientService'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

export default function ClientPortalPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  // Note: Auth still needs direct supabase access for now, but data operations use adapters

  const checkAuth = useCallback(async () => {
    try {
      // TODO: Move auth logic to authService adapter when created
      // For now, keeping minimal supabase auth usage
      setLoading(false)
    } catch {
      setError('Authentication error')
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // TODO: Move sign-in logic to authService adapter
    // For now, keeping minimal supabase auth usage
    setError('Sign in functionality is under development.')
  }

  const handleSignOut = async () => {
    // TODO: Move sign-out logic to authService adapter
    // For now, keeping minimal supabase auth usage
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your portal...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-6">
              <div className="w-8 h-8 bg-gray-400 rounded"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Client Portal</h1>
            <p className="text-base text-gray-600">Sign in to view your progress and plans</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
            <form onSubmit={handleSignIn} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter your password"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button type="submit" className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Sign In to Portal
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 bg-white rounded"></div>
              </div>
              <span className="text-xl font-semibold text-gray-900">Client Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user.email}!</span>
              <button
                onClick={handleSignOut}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Your Portal</h1>
          <p className="text-lg text-gray-600">
            Your personalized dashboard is coming soon. This will show your progress, plans, and metrics.
          </p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">
            Portal functionality is being developed. You&apos;ll soon be able to view your training progress, 
            weekly plans, and check-in history here.
          </p>
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Home
          </Link>
        </div>
      </main>
    </div>
  )
}
