'use client'

import { useState } from 'react'
import { Shield, Users, Database, Key, Network, Eye, Lock, Settings, CheckCircle, AlertTriangle, Info } from 'lucide-react'
import Link from 'next/link'

export default function SecurityArchitecture() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedClient, setSelectedClient] = useState('client-a')

  const architectureComponents = {
    clientIsolation: {
      title: 'Client Isolation',
      description: 'Multi-tenant security architecture with complete client data separation',
      status: 'implemented',
      features: [
        'Database-level tenant isolation',
        'Network-level client separation',
        'API endpoint access controls',
        'Session-based tenant validation',
        'Cross-tenant data prevention'
      ]
    },
    accessControls: {
      title: 'Access Controls',
      description: 'Role-based access control system with granular permissions',
      status: 'implemented',
      features: [
        'Role-based permissions (RBAC)',
        'Attribute-based access control (ABAC)',
        'Multi-factor authentication (MFA)',
        'Session management and timeout',
        'API key management'
      ]
    },
    securityBoundaries: {
      title: 'Security Boundaries',
      description: 'Defined security perimeters and boundary controls',
      status: 'implemented',
      features: [
        'Application-level boundaries',
        'Network segmentation',
        'Data flow controls',
        'Service mesh security',
        'Container isolation'
      ]
    }
  }

  const clientSecurityProfiles = {
    'client-a': {
      name: 'Enterprise Client A',
      securityLevel: 'high',
      isolation: 'complete',
      dataClassification: 'confidential',
      complianceRequirements: ['GDPR', 'SOC 2', 'ISO 27001'],
      accessControls: {
        authentication: 'SSO + MFA',
        sessionTimeout: '30 minutes',
        ipRestrictions: 'enabled',
        apiRateLimit: '1000/hour'
      }
    },
    'client-b': {
      name: 'Startup Client B',
      securityLevel: 'standard',
      isolation: 'logical',
      dataClassification: 'internal',
      complianceRequirements: ['GDPR', 'CCPA'],
      accessControls: {
        authentication: 'Username/Password + MFA',
        sessionTimeout: '2 hours',
        ipRestrictions: 'disabled',
        apiRateLimit: '500/hour'
      }
    }
  }

  const securityMetrics = {
    isolationEffectiveness: '99.9%',
    accessControlCoverage: '100%',
    securityIncidents: '0',
    complianceScore: '98%',
    vulnerabilityCount: '2 (Low)',
    lastSecurityAudit: '1 week ago'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'implemented':
      case 'high':
        return 'text-green-600 bg-green-100'
      case 'in-progress':
      case 'standard':
        return 'text-yellow-600 bg-yellow-100'
      case 'planned':
      case 'low':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
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
            <h1 className="text-3xl font-bold text-gray-900">Client Security Architecture</h1>
          </div>
          <p className="text-gray-600">
            Multi-tenant security architecture with client isolation and access controls
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Architecture Overview', icon: Shield },
                { id: 'clients', label: 'Client Profiles', icon: Users },
                { id: 'controls', label: 'Access Controls', icon: Key },
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

                {/* Architecture Components */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {Object.entries(architectureComponents).map(([key, component]) => (
                    <div key={key} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Network className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{component.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusIcon(component.status)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(component.status)}`}>
                              {component.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{component.description}</p>
                      <ul className="space-y-2">
                        {component.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'clients' && (
              <div className="space-y-6">
                {/* Client Selector */}
                <div className="flex gap-4">
                  {Object.entries(clientSecurityProfiles).map(([clientId, client]) => (
                    <button
                      key={clientId}
                      onClick={() => setSelectedClient(clientId)}
                      className={`px-4 py-2 rounded-lg border ${
                        selectedClient === clientId
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {client.name}
                    </button>
                  ))}
                </div>

                {/* Selected Client Details */}
                {selectedClient && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Client Profile */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Profile</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Security Level:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(clientSecurityProfiles[selectedClient].securityLevel)}`}>
                              {clientSecurityProfiles[selectedClient].securityLevel}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Isolation:</span>
                            <span className="font-medium">{clientSecurityProfiles[selectedClient].isolation}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Data Classification:</span>
                            <span className="font-medium">{clientSecurityProfiles[selectedClient].dataClassification}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Compliance Requirements:</span>
                            <div className="flex gap-2 mt-1">
                              {clientSecurityProfiles[selectedClient].complianceRequirements.map((req, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                  {req}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Access Controls */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Access Controls</h3>
                        <div className="space-y-3">
                          {Object.entries(clientSecurityProfiles[selectedClient].accessControls).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-600">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                              </span>
                              <span className="font-medium">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'controls' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Authentication Controls */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Key className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Authentication Controls</h3>
                    </div>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Multi-factor authentication (MFA)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Single sign-on (SSO) integration</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Password policy enforcement</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Session timeout controls</span>
                      </li>
                    </ul>
                  </div>

                  {/* Authorization Controls */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Lock className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Authorization Controls</h3>
                    </div>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Role-based access control (RBAC)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Attribute-based access control (ABAC)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Principle of least privilege</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Dynamic permission evaluation</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'monitoring' && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Eye className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Security Monitoring</h3>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Real-time Monitoring</h4>
                      <p className="text-sm text-gray-600">24/7 security event monitoring with automated threat detection</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Anomaly Detection</h4>
                      <p className="text-sm text-gray-600">AI-powered anomaly detection for unusual access patterns</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Incident Response</h4>
                      <p className="text-sm text-gray-600">Automated incident response with escalation procedures</p>
                    </div>
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