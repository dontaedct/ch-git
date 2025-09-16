'use client'

import { useState, useEffect } from 'react'
import { AuthService } from '@/lib/auth/auth'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Mail, AlertCircle, CheckCircle } from 'lucide-react'
import { SecureNavigation } from '@/lib/security/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [emailFocused, setEmailFocused] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    const error = searchParams.get('error')
    if (error === 'auth_callback_error') {
      setError('There was an error with the authentication process. Please try again.')
    }
  }, [searchParams])

  useEffect(() => {
    const checkAuth = async () => {
      const user = await AuthService.getCurrentUser()
      if (user) {
        const redirectTo = SecureNavigation.getSafeRedirectUrl(searchParams, '/')
        SecureNavigation.navigateToPath(redirectTo)
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
          SecureNavigation.navigateToPath('/')
        } else {
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleMagicLink(e as unknown as React.FormEvent)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-lg border-2 border-black mb-6">
            <Mail className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-wide uppercase text-black mb-3">
            Sign in to your account
          </h1>
          <p className="text-black/60 text-sm leading-relaxed mb-6">
            Enter your email and we&apos;ll send you a secure link to sign in
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg border-2 border-black/30 p-8">
          <form className="space-y-6" onSubmit={handleMagicLink} onKeyDown={handleKeyDown}>
            <div className="space-y-3">
              <label htmlFor="email" className="block text-sm font-medium text-black">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  className={`w-full px-4 py-3 border-2 rounded-lg bg-white transition-all duration-300 outline-none text-black placeholder-black/40 ${
                    emailFocused || email
                      ? 'border-black'
                      : 'border-black/30 hover:border-black/50'
                  }`}
                  required
                  autoFocus
                  autoComplete="email"
                  aria-describedby={error ? 'email-error' : success ? 'email-success' : undefined}
                />
              </div>
            </div>
            
            {error && (
              <div 
                id="email-error"
                role="alert"
                aria-live="polite"
                className="flex items-start gap-3 p-4 bg-red-50 border border-red-200/80 rounded-xl"
              >
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700 leading-relaxed">
                  {error}
                </p>
              </div>
            )}

            {success && (
              <div 
                id="email-success"
                role="status"
                aria-live="polite"
                className="flex items-start gap-3 p-4 bg-green-50 border border-green-200/80 rounded-xl"
              >
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-green-700 leading-relaxed">
                  {success}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full bg-black text-white py-3 px-6 rounded-lg border-2 border-black font-bold hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              aria-describedby="submit-help"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Sending magic link...</span>
                </div>
              ) : (
                'Send magic link'
              )}
            </button>
            
            <p id="submit-help" className="text-xs text-gray-500 text-center leading-relaxed">
              We&apos;ll send you a secure link that signs you in instantly. No passwords required.
            </p>
          </form>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-black/60 hover:text-black transition-colors duration-300 font-medium px-3 py-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
