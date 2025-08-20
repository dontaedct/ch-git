'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        // Use window.location for client-side navigation
        window.location.href = '/'
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        setError('Check your email for the confirmation link!')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-6">
            <div className="w-8 h-8 bg-gray-400 rounded"></div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back
          </h1>
          <p className="text-base text-gray-600 mb-8">
            Don't have an account? <Link href="/intake" className="text-blue-600 hover:text-blue-700 font-medium">Sign up here</Link>
          </p>
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Home
          </Link>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">
                  {error}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                onClick={handleSignIn}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
              
              <button
                type="submit"
                onClick={handleSignUp}
                disabled={loading}
                className="flex-1 border border-blue-600 text-blue-600 py-3 px-6 rounded-lg font-medium hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Signing up...
                  </div>
                ) : (
                  'Sign Up'
                )}
              </button>
            </div>
          </form>

          {/* Footer Note */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              Your account is secure and protected with industry-standard encryption.
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link 
            href="/" 
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors inline-flex items-center gap-1"
          >
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
