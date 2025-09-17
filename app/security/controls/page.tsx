'use client'

import { useState } from 'react'
import { Shield, Key, Lock, User, Clock, Smartphone, Eye, Settings, CheckCircle, AlertTriangle, Info, Users } from 'lucide-react'
import Link from 'next/link'

export default function SecurityControls() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedAuthMethod, setSelectedAuthMethod] = useState('mfa')

  const authenticationMethods = {
    'password': {
      title: 'Password Authentication',
      description: 'Traditional username and password authentication',
      status: 'implemented',
      security: 'basic',
      features: [
        'Password complexity requirements',
        'Password history enforcement',
        'Account lockout protection',
        'Password expiration policies',
        'Breach password detection'
      ],
      requirements: {
        minLength: 12,
        complexity: 'Upper, lower, numbers, symbols',
        expiry: '90 days',
        history: '12 passwords',
        lockout: '5 failed attempts'
      }
    },
    'mfa': {
      title: 'Multi-Factor Authentication',
      description: 'Enhanced security with multiple authentication factors',
      status: 'implemented',
      security: 'high',
      features: [
        'TOTP authenticator apps (Google, Authy)',
        'SMS verification codes',
        'Email verification links',
        'Hardware security keys (FIDO2)',
        'Biometric authentication'
      ],
      requirements: {
        factors: 'Knowledge + Possession + Inherence',
        backup: 'Recovery codes provided',
        timeout: '30 seconds',
        fallback: 'Admin override available',
        enrollment: 'Mandatory for privileged users'
      }
    },
    'sso': {
      title: 'Single Sign-On (SSO)',
      description: 'Centralized authentication through identity providers',
      status: 'implemented',
      security: 'high',
      features: [
        'SAML 2.0 integration',
        'OAuth 2.0 / OpenID Connect',
        'Active Directory integration',
        'Just-in-time provisioning',
        'Automatic user deprovisioning'
      ],
      requirements: {
        protocols: 'SAML 2.0, OIDC',
        providers: 'Azure AD, Okta, Auth0',
        provisioning: 'Automated',
        deprovisioning: 'Real-time',
        mapping: 'Attribute-based roles'
      }
    }
  }

  const sessionManagement = {
    'session-security': {
      title: 'Session Security',
      description: 'Secure session handling and management',
      controls: [
        'Secure session token generation',
        'HTTP-only and Secure cookie flags',
        'CSRF protection tokens',
        'Session fixation protection',
        'Concurrent session limits'
      ]
    },
    'session-lifecycle': {
      title: 'Session Lifecycle',
      description: 'Complete session lifecycle management',
      controls: [
        'Automatic session timeout (30 minutes)',
        'Idle timeout detection (15 minutes)',
        'Explicit logout functionality',
        'Session termination on privilege change',
        'Force logout on security events'
      ]
    },
    'session-monitoring': {
      title: 'Session Monitoring',
      description: 'Real-time session activity monitoring',
      controls: [
        'Active session tracking',
        'Anomalous activity detection',
        'Geographic location monitoring',
        'Device fingerprinting',
        'Session hijacking detection'
      ]
    }
  }

  const authorizationMechanisms = {
    'rbac': {
      title: 'Role-Based Access Control',
      description: 'Permission assignment through user roles',
      status: 'implemented',
      features: [
        'Predefined security roles',
        'Role hierarchy and inheritance',
        'Principle of least privilege',
        'Role assignment workflows',
        'Regular access reviews'
      ],
      roles: [
        { name: 'Administrator', permissions: 'Full system access', users: 3 },
        { name: 'Security Officer', permissions: 'Security management', users: 2 },
        { name: 'Manager', permissions: 'Team and data access', users: 8 },
        { name: 'User', permissions: 'Basic application access', users: 45 },
        { name: 'Guest', permissions: 'Read-only access', users: 12 }
      ]
    },
    'abac': {
      title: 'Attribute-Based Access Control',
      description: 'Dynamic permissions based on attributes',
      status: 'implemented',
      features: [
        'Dynamic policy evaluation',
        'Context-aware permissions',
        'Fine-grained access control',
        'Attribute-based decisions',
        'Policy conflict resolution'
      ],
      attributes: [
        { type: 'User', examples: 'Department, clearance level, location' },
        { type: 'Resource', examples: 'Classification, owner, sensitivity' },
        { type: 'Environment', examples: 'Time, location, device type' },
        { type: 'Action', examples: 'Read, write, delete, share' }
      ]
    }
  }

  const securityMetrics = {
    authSuccess: '99.7%',
    authFailures: '127 (last 24h)',
    activeSessions: '58',
    mfaAdoption: '94%',
    passwordCompliance: '98%',
    privilegedUsers: '13'
  }

  const getSecurityLevel = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'basic':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'implemented':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'in-progress':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/security" className="text-blue-600 hover:text-blue-800">
              <Shield className="w-6 h-6" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Security Controls & Authentication</h1>
          </div>
          <p className="text-gray-600">
            Comprehensive authentication, session management, and authorization controls
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Controls Overview', icon: Shield },
                { id: 'authentication', label: 'Authentication', icon: Key },
                { id: 'sessions', label: 'Session Management', icon: Clock },
                { id: 'authorization', label: 'Authorization', icon: Users },
                { id: 'monitoring', label: 'Security Monitoring', icon: Eye }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Security Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {Object.entries(securityMetrics).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-600 mb-1">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </h4>
                      <p className="text-lg font-semibold text-gray-900">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Security Controls Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Key className="w-6 h-6 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Authentication</h3>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Multi-factor authentication enabled</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>SSO integration active</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Password policies enforced</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Biometric authentication supported</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Clock className="w-6 h-6 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Session Management</h3>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Secure session handling</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Automatic timeout controls</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Session monitoring active</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Concurrent session limits</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Users className="w-6 h-6 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Authorization</h3>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Role-based access control</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Attribute-based permissions</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Principle of least privilege</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Dynamic policy evaluation</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'authentication' && (
              <div className="space-y-6">
                {/* Authentication Method Selector */}
                <div className="flex gap-4">
                  {Object.entries(authenticationMethods).map(([methodId, method]) => (
                    <button
                      key={methodId}
                      onClick={() => setSelectedAuthMethod(methodId)}
                      className={`px-4 py-2 rounded-lg border ${
                        selectedAuthMethod === methodId
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {method.title}
                    </button>
                  ))}
                </div>

                {/* Selected Authentication Method Details */}
                {selectedAuthMethod && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Method Overview */}
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <Key className="w-6 h-6 text-blue-600" />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {authenticationMethods[selectedAuthMethod].title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              {getStatusIcon(authenticationMethods[selectedAuthMethod].status)}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSecurityLevel(authenticationMethods[selectedAuthMethod].security)}`}>
                                {authenticationMethods[selectedAuthMethod].security} security
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-4">{authenticationMethods[selectedAuthMethod].description}</p>

                        <h4 className="font-medium text-gray-900 mb-2">Features:</h4>
                        <ul className="space-y-2">
                          {authenticationMethods[selectedAuthMethod].features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Requirements */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-4">Requirements & Configuration:</h4>
                        <div className="space-y-3">
                          {Object.entries(authenticationMethods[selectedAuthMethod].requirements).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-600">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                              </span>
                              <span className="font-medium text-right max-w-xs">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'sessions' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Session Management Controls</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {Object.entries(sessionManagement).map(([key, session]) => (
                    <div key={key} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <h4 className="font-semibold text-gray-900">{session.title}</h4>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{session.description}</p>
                      <ul className="space-y-2">
                        {session.controls.map((control, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            {control}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'authorization' && (
              <div className="space-y-8">
                {/* RBAC Section */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="w-6 h-6 text-blue-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{authorizationMechanisms.rbac.title}</h3>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {authorizationMechanisms.rbac.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-6">{authorizationMechanisms.rbac.description}</p>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Features:</h4>
                      <ul className="space-y-2">
                        {authorizationMechanisms.rbac.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Active Roles:</h4>
                      <div className="space-y-3">
                        {authorizationMechanisms.rbac.roles.map((role, index) => (
                          <div key={index} className="bg-white rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-medium text-gray-900">{role.name}</h5>
                                <p className="text-sm text-gray-600">{role.permissions}</p>
                              </div>
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                {role.users} users
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ABAC Section */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Settings className="w-6 h-6 text-blue-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{authorizationMechanisms.abac.title}</h3>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {authorizationMechanisms.abac.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-6">{authorizationMechanisms.abac.description}</p>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Features:</h4>
                      <ul className="space-y-2">
                        {authorizationMechanisms.abac.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Attribute Types:</h4>
                      <div className="space-y-3">
                        {authorizationMechanisms.abac.attributes.map((attr, index) => (
                          <div key={index} className="bg-white rounded-lg p-3">
                            <h5 className="font-medium text-gray-900">{attr.type}</h5>
                            <p className="text-sm text-gray-600">{attr.examples}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'monitoring' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Security Monitoring</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Eye className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">Real-time Monitoring</h4>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Authentication attempt monitoring</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Session activity tracking</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Privilege escalation detection</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Anomaly detection algorithms</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertTriangle className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">Security Alerts</h4>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Failed authentication alerts</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Unusual access pattern detection</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Geographic anomaly alerts</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Automated incident response</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}