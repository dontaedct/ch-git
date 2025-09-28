'use client'

import { useState, useEffect } from 'react'
import { AuthService } from '@/lib/auth/auth'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Mail, AlertCircle, CheckCircle, Shield, Lock, Zap } from 'lucide-react'
import { SecureNavigation } from '@/lib/security/navigation'
import { PrivacyPolicy } from '@/components/auth/privacy-policy'
import { StatusBanner } from '@/components/ui/status-banner'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [emailFocused, setEmailFocused] = useState(false)
  const [consentAccepted, setConsentAccepted] = useState(false)
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, systemTheme } = useTheme()
  const searchParams = useSearchParams()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark')

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

    if (!consentAccepted) {
      setError('Please accept the privacy policy and terms of service to continue')
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Sophisticated Background System */}
      <div className="absolute inset-0 -z-10">
        {/* Subtle tech grid */}
        <div
          className="absolute inset-0 opacity-[0.02] text-foreground"
          style={{
            backgroundImage: `
              linear-gradient(currentColor 1px, transparent 1px),
              linear-gradient(90deg, currentColor 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />

        {/* Tech accent lines */}
        <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />
        <div className="absolute top-0 bottom-0 left-1/4 w-px bg-gradient-to-b from-transparent via-primary/10 to-transparent" />

        {/* Animated indicators */}
        <div className="absolute top-1/3 right-1/4 w-2 h-2 border border-primary/30 rounded-full animate-pulse"
             style={{ animationDuration: '3s' }} />
        <div className="absolute bottom-1/3 left-1/5 w-1.5 h-1.5 bg-primary/40 rounded-full animate-pulse"
             style={{ animationDuration: '4s', animationDelay: '1s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        {/* Environment Status Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <StatusBanner type="sandbox" />
        </motion.div>

        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center mb-8"
        >
          {/* High-tech status indicator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className={cn(
              "inline-flex items-center gap-3 px-6 py-3 rounded-none border-2 backdrop-blur-sm mb-6 relative",
              isDark
                ? "bg-black/80 border-white/30 shadow-2xl shadow-white/5"
                : "bg-white/80 border-black/30 shadow-2xl shadow-black/5"
            )}
            className=\"rounded-lg\"
          >
            {/* Security indicators */}
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                isDark ? "bg-green-400" : "bg-green-600"
              )}
              style={{ animationDuration: '1.5s' }} />
              <Lock className="w-3 h-3 text-primary" />
              <Zap className="w-3 h-3 text-primary" />
            </div>

            <span className={cn(
              "text-sm font-mono font-bold tracking-wider uppercase",
              isDark ? "text-white/95" : "text-black/95"
            )}>
              SECURE_AUTH_PORTAL
            </span>

          </motion.div>

          {/* Enhanced icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className={cn(
              "inline-flex items-center justify-center w-20 h-20 rounded-xl border-2 mb-6 shadow-xl relative",
              "bg-primary text-primary-foreground border-primary/20 hover:scale-105 transition-transform duration-300"
            )}
          >
            <Shield className="w-8 h-8" />

            {/* Tech corner brackets */}
            <div className={cn(
              "absolute -top-2 -left-2 w-4 h-4 border-l-2 border-t-2 opacity-30",
              isDark ? "border-white" : "border-black"
            )} />
            <div className={cn(
              "absolute -bottom-2 -right-2 w-4 h-4 border-r-2 border-b-2 opacity-30",
              isDark ? "border-white" : "border-black"
            )} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-3xl font-black tracking-tight uppercase text-high-emphasis mb-4 relative"
          >
            Secure Sign In
            {/* Scanning line effect */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-r opacity-0 animate-pulse pointer-events-none",
              isDark
                ? "from-transparent via-white/20 to-transparent"
                : "from-transparent via-black/20 to-transparent"
            )}
            style={{
              animationDuration: '4s',
              animationDelay: '2s'
            }} />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-medium-emphasis text-sm leading-relaxed max-w-sm mx-auto"
          >
            Enter your email and we&apos;ll send you a secure magic link to sign in
          </motion.p>
        </motion.div>

        {/* Enhanced Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className={cn(
            "relative p-8 border-2 backdrop-blur-sm shadow-2xl",
            isDark
              ? "bg-black/80 border-white/30"
              : "bg-white/80 border-black/30"
          )}
          className=\"rounded-lg\"
        >
          {/* Tech corner accent */}
          <div className={cn(
            "absolute top-0 right-0 w-0 h-0 border-l-[20px] border-b-[20px] border-l-transparent opacity-30",
            isDark ? "border-b-white/25" : "border-b-black/25"
          )} />

          <form className="space-y-8" onSubmit={handleMagicLink} onKeyDown={handleKeyDown}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-4 h-4 text-primary" />
                <label htmlFor="email" className="text-sm font-bold tracking-wider uppercase text-high-emphasis">
                  Email Address
                </label>
                <div className="ml-auto w-2 h-2 bg-primary/40 rounded-full animate-pulse" />
              </div>

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
                  className={cn(
                    "w-full px-6 py-4 border-2 transition-all duration-300 outline-none font-medium",
                    "focus:scale-105 hover:scale-[1.02]",
                    emailFocused || email
                      ? isDark
                        ? "bg-black/60 border-white/50 text-white placeholder-white/50"
                        : "bg-white/60 border-black/50 text-black placeholder-black/50"
                      : isDark
                        ? "bg-black/40 border-white/30 text-white placeholder-white/40 hover:border-white/50"
                        : "bg-white/40 border-black/30 text-black placeholder-black/40 hover:border-black/50"
                  )}
                  className=\"rounded-lg\"
                  required
                  autoFocus
                  autoComplete="email"
                  aria-describedby={error ? 'email-error' : success ? 'email-success' : undefined}
                />

                {/* Input accent line */}
                {(emailFocused || email) && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    className="absolute bottom-0 left-0 h-0.5 bg-primary"
                  />
                )}
              </div>
            </motion.div>
            
            {/* Enhanced Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                id="email-error"
                role="alert"
                aria-live="polite"
                className={cn(
                  "flex items-start gap-3 p-4 border-2 backdrop-blur-sm",
                  "bg-red-500/10 border-red-500/30 text-red-400"
                )}
                className=\"rounded-lg\"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium leading-relaxed">
                  {error}
                </p>
              </motion.div>
            )}

            {/* Enhanced Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                id="email-success"
                role="status"
                aria-live="polite"
                className={cn(
                  "flex items-start gap-3 p-4 border-2 backdrop-blur-sm",
                  "bg-green-500/10 border-green-500/30 text-green-400"
                )}
                className=\"rounded-lg\"
              >
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium leading-relaxed">
                  {success}
                </p>
              </motion.div>
            )}

            {/* Enhanced Consent Checkbox */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold tracking-widest uppercase text-high-emphasis">
                  Privacy & Consent
                </span>
                <div className="ml-auto w-1.5 h-1.5 bg-primary/40 rounded-full animate-pulse" />
              </div>

              <div className="flex items-start gap-4">
                <input
                  id="consent"
                  type="checkbox"
                  checked={consentAccepted}
                  onChange={(e) => setConsentAccepted(e.target.checked)}
                  className={cn(
                    "mt-1 w-5 h-5 border-2 rounded transition-all duration-300 focus:scale-110",
                    isDark
                      ? "border-white/30 bg-black/40 text-primary focus:ring-primary"
                      : "border-black/30 bg-white/40 text-primary focus:ring-primary"
                  )}
                  required
                />
                <label htmlFor="consent" className="text-sm text-medium-emphasis leading-relaxed flex-1">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setShowPrivacyPolicy(!showPrivacyPolicy)}
                    className="text-primary underline hover:no-underline font-bold transition-colors duration-300"
                  >
                    Privacy Policy and Terms of Service
                  </button>
                </label>
              </div>
            </motion.div>

            {/* Enhanced Submit Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              type="submit"
              disabled={loading || !email.trim() || !consentAccepted}
              className={cn(
                "group relative w-full py-4 px-8 border-2 font-black text-lg tracking-wider uppercase transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl",
                isDark
                  ? "bg-white text-black hover:bg-white/90 border-white/50 disabled:bg-white/50"
                  : "bg-black text-white hover:bg-black/90 border-black/50 disabled:bg-black/50"
              )}
              className=\"rounded-lg\"
              aria-describedby="submit-help"
            >
              <span className="relative flex items-center justify-center">
                {loading ? (
                  <>
                    <div className={cn(
                      "w-5 h-5 border-2 border-t-transparent rounded-full animate-spin mr-3",
                      isDark ? "border-black/30 border-t-black" : "border-white/30 border-t-white"
                    )}></div>
                    <span>Sending magic link...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:rotate-12" />
                    <span>Send Magic Link</span>
                  </>
                )}
              </span>

            </motion.button>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.6 }}
              id="submit-help"
              className="text-xs text-low-emphasis text-center leading-relaxed font-medium"
            >
              We&apos;ll send you a secure link that signs you in instantly. No passwords required.
            </motion.p>
          </form>
        </motion.div>

        {/* Enhanced Privacy Policy */}
        {showPrivacyPolicy && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-8"
          >
            <div className={cn(
              "p-6 border-2 backdrop-blur-sm",
              isDark
                ? "bg-black/60 border-white/25"
                : "bg-white/60 border-black/25"
            )}
            className=\"rounded-lg\">
              <PrivacyPolicy showFullPolicy={true} />
            </div>
          </motion.div>
        )}

        {/* Enhanced Back to Home */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.8 }}
          className="text-center mt-8"
        >
          <Link
            href="/"
            className={cn(
              "group inline-flex items-center gap-3 px-6 py-3 border-2 font-bold text-sm tracking-wider uppercase transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl",
              isDark
                ? "border-white/30 text-white/80 hover:text-white hover:border-white/50 hover:bg-white/10"
                : "border-black/30 text-black/80 hover:text-black hover:border-black/50 hover:bg-black/10"
            )}
            style={{
              clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 12px 100%)'
            }}
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
            <span>Back to Home</span>

          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
