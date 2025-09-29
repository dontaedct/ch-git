/**
 * Privacy Policy Component
 * Displays privacy policy and terms of service for authentication
 * Part of Phase 1.1 Authentication Infrastructure
 */

'use client'

import { useState } from 'react'
import { ExternalLink, Shield, Lock, Eye, Database, Users } from 'lucide-react'

interface PrivacyPolicyProps {
  className?: string
  showFullPolicy?: boolean
}

export function PrivacyPolicy({ className = '', showFullPolicy = false }: PrivacyPolicyProps) {
  const [showDetails, setShowDetails] = useState(showFullPolicy)

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Privacy Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Privacy & Security</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              We use magic links for secure, passwordless authentication. Your email is only used for 
              authentication and essential service communications.
            </p>
          </div>
        </div>
      </div>

      {/* Key Privacy Points */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Lock className="w-4 h-4 text-green-600" />
          <span>No passwords stored</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Eye className="w-4 h-4 text-green-600" />
          <span>Minimal data collection</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Database className="w-4 h-4 text-green-600" />
          <span>Secure data storage</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4 text-green-600" />
          <span>No data sharing</span>
        </div>
      </div>

      {/* Toggle Details */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
      >
        {showDetails ? 'Hide' : 'Show'} full privacy policy
        <ExternalLink className="w-3 h-3" />
      </button>

      {/* Full Privacy Policy */}
      {showDetails && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 text-sm">
          <h4 className="font-semibold text-gray-900">Privacy Policy</h4>
          
          <div className="space-y-3 text-gray-600">
            <div>
              <h5 className="font-medium text-gray-800 mb-1">Data Collection</h5>
              <p>We collect only the email address you provide for authentication purposes. No additional personal information is required or collected.</p>
            </div>

            <div>
              <h5 className="font-medium text-gray-800 mb-1">Data Usage</h5>
              <p>Your email is used exclusively for:</p>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>Sending secure magic links for authentication</li>
                <li>Essential service notifications</li>
                <li>Account management and security</li>
              </ul>
            </div>

            <div>
              <h5 className="font-medium text-gray-800 mb-1">Data Storage</h5>
              <p>All data is stored securely using industry-standard encryption and security practices. We use Supabase for secure data management.</p>
            </div>

            <div>
              <h5 className="font-medium text-gray-800 mb-1">Data Sharing</h5>
              <p>We do not share, sell, or rent your personal information to third parties. Your data remains private and secure.</p>
            </div>

            <div>
              <h5 className="font-medium text-gray-800 mb-1">Your Rights</h5>
              <p>You have the right to access, update, or delete your account and associated data at any time. Contact us for assistance.</p>
            </div>

            <div>
              <h5 className="font-medium text-gray-800 mb-1">Security</h5>
              <p>We implement comprehensive security measures including encryption, secure authentication, and regular security audits.</p>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Last updated: {new Date().toLocaleDateString()}. By using this service, you agree to our privacy policy and terms of service.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
