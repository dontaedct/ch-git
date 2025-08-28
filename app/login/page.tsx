'use client'

import { useState, useEffect } from 'react'
import { AuthService } from '@/lib/auth/auth'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const error = searchParams.get('error')
    if (error === 'auth_callback_error') {
      setError('There was an error with the authentication process. Please try again.')
    }
  }, [searchParams])

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const user = await AuthService.getCurrentUser()
      if (user) {
        const redirectTo = searchParams.get('redirectTo') ?? '/'
        window.location.href = redirectTo
      }
    }
    
    checkAuth()
  }, [searchParams])

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await AuthService.signIn(email.trim())
      
      if (result.success) {
        if (result.user) {
          // User signed in successfully, redirect
          window.location.href = '/'
        } else {
          // Magic link sent
          setSuccess(result.error ?? 'Check your email for a magic link to sign in!')
        }
      } else {
        setError(result.error ?? 'Sign in failed')
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
            Sign in to your account
          </h1>
          <p className="text-base text-gray-600 mb-8">
            Enter your email and we&apos;ll send you a secure link to sign in
          </p>
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Home
          </Link>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          <form className="space-y-6" onSubmit={handleMagicLink}>
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
                autoFocus
              />
            </div>
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">
                  {error}
                </p>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">
                  {success}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending magic link...
                </div>
              ) : (
                'Send magic link'
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              We&apos;ll send you a secure link that signs you in instantly. No passwords required.
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
