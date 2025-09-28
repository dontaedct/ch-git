/**
 * Status Banner Component
 * Displays system status (Sandbox/Production modes) and important notifications
 * Part of Phase 1.1 Authentication Infrastructure
 */

'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, Info, X, Settings, Globe, Shield } from 'lucide-react'

export type StatusType = 'sandbox' | 'production' | 'maintenance' | 'warning' | 'error' | 'info'

interface StatusBannerProps {
  type?: StatusType
  title?: string
  message?: string
  dismissible?: boolean
  className?: string
  onDismiss?: () => void
}

export function StatusBanner({ 
  type = 'info', 
  title, 
  message, 
  dismissible = true, 
  className = '',
  onDismiss 
}: StatusBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isDismissed, setIsDismissed] = useState(false)

  // Auto-detect environment if not specified
  useEffect(() => {
    if (!type || type === 'info') {
      const env = process.env.NODE_ENV
      if (env === 'development') {
        // Override type to sandbox for development
        type = 'sandbox'
      } else if (env === 'production') {
        type = 'production'
      }
    }
  }, [type])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    onDismiss?.()
  }

  if (!isVisible || isDismissed) {
    return null
  }

  const getStatusConfig = () => {
    switch (type) {
      case 'sandbox':
        return {
          icon: Settings,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800',
          textColor: 'text-yellow-700',
          title: title || 'Sandbox Environment',
          message: message || 'You are currently in sandbox mode. All data is for testing purposes only.',
          iconBg: 'bg-yellow-100'
        }
      case 'production':
        return {
          icon: Globe,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          titleColor: 'text-green-800',
          textColor: 'text-green-700',
          title: title || 'Production Environment',
          message: message || 'You are in the live production environment.',
          iconBg: 'bg-green-100'
        }
      case 'maintenance':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          iconColor: 'text-orange-600',
          titleColor: 'text-orange-800',
          textColor: 'text-orange-700',
          title: title || 'Scheduled Maintenance',
          message: message || 'The system is currently under maintenance. Some features may be unavailable.',
          iconBg: 'bg-orange-100'
        }
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800',
          textColor: 'text-yellow-700',
          title: title || 'Warning',
          message: message || 'Please be aware of the following important information.',
          iconBg: 'bg-yellow-100'
        }
      case 'error':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          textColor: 'text-red-700',
          title: title || 'System Error',
          message: message || 'There is a system error that may affect functionality.',
          iconBg: 'bg-red-100'
        }
      case 'info':
      default:
        return {
          icon: Info,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          textColor: 'text-blue-700',
          title: title || 'Information',
          message: message || 'Important information for your attention.',
          iconBg: 'bg-blue-100'
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className={`${config.iconBg} ${config.iconColor} p-2 rounded-lg flex-shrink-0`}>
          <Icon className="w-4 h-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`${config.titleColor} font-medium text-sm mb-1`}>
            {config.title}
          </h3>
          <p className={`${config.textColor} text-sm leading-relaxed`}>
            {config.message}
          </p>
        </div>

        {dismissible && (
          <button
            onClick={handleDismiss}
            className={`${config.iconColor} hover:opacity-70 transition-opacity flex-shrink-0 p-1`}
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Environment Status Banner
 * Automatically detects and displays current environment status
 */
export function EnvironmentStatusBanner({ className = '' }: { className?: string }) {
  const [envInfo, setEnvInfo] = useState<{
    type: StatusType
    title: string
    message: string
  } | null>(null)

  useEffect(() => {
    const detectEnvironment = () => {
      const nodeEnv = process.env.NODE_ENV
      const vercelEnv = process.env.VERCEL_ENV
      const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost'

      if (isLocal || nodeEnv === 'development') {
        setEnvInfo({
          type: 'sandbox',
          title: 'Development Environment',
          message: 'You are in the development environment. All data is for testing purposes only.'
        })
      } else if (vercelEnv === 'preview' || nodeEnv === 'test') {
        setEnvInfo({
          type: 'sandbox',
          title: 'Preview Environment',
          message: 'You are in the preview environment. Changes here will not affect production.'
        })
      } else if (vercelEnv === 'production' || nodeEnv === 'production') {
        setEnvInfo({
          type: 'production',
          title: 'Production Environment',
          message: 'You are in the live production environment.'
        })
      } else {
        setEnvInfo({
          type: 'info',
          title: 'System Status',
          message: 'Environment status information is not available.'
        })
      }
    }

    detectEnvironment()
  }, [])

  if (!envInfo) {
    return null
  }

  return (
    <StatusBanner
      type={envInfo.type}
      title={envInfo.title}
      message={envInfo.message}
      className={className}
    />
  )
}

/**
 * Security Status Banner
 * Displays security-related information
 */
export function SecurityStatusBanner({ className = '' }: { className?: string }) {
  return (
    <StatusBanner
      type="info"
      title="Security Notice"
      message="This system uses secure magic link authentication. No passwords are stored or transmitted."
      className={className}
      icon={Shield}
    />
  )
}