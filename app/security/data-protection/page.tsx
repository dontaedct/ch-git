'use client'

import { useState } from 'react'
import { Shield, Lock, Key, Eye, Database, FileText, Users, Settings, CheckCircle, AlertTriangle, Info, Download } from 'lucide-react'
import Link from 'next/link'

export default function DataProtection() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedDataType, setSelectedDataType] = useState('personal')

  const encryptionStrategies = {
    'at-rest': {
      title: 'Data at Rest Encryption',
      description: 'AES-256 encryption for stored data',
      status: 'implemented',
      algorithm: 'AES-256-GCM',
      keyRotation: '90 days',
      compliance: ['FIPS 140-2', 'Common Criteria']
    },
    'in-transit': {
      title: 'Data in Transit Encryption',
      description: 'TLS 1.3 for data transmission',
      status: 'implemented',
      protocol: 'TLS 1.3',
      cipherSuites: ['TLS_AES_256_GCM_SHA384', 'TLS_CHACHA20_POLY1305_SHA256'],
      compliance: ['NIST SP 800-52']
    },
    'in-use': {
      title: 'Data in Use Protection',
      description: 'Memory encryption and secure enclaves',
      status: 'planned',
      technology: 'Intel SGX / AMD SEV',
      protection: 'Runtime memory encryption',
      compliance: ['FIPS 140-2 Level 3']
    }
  }

  const dataClassificationLevels = {
    'public': {
      level: 'Public',
      color: 'green',
      description: 'Information that can be freely shared',
      examples: ['Marketing materials', 'Public documentation', 'General product info'],
      encryption: 'Optional',
      retention: '7 years',
      access: 'All users'
    },
    'internal': {
      level: 'Internal',
      color: 'blue',
      description: 'Information for internal use only',
      examples: ['Internal processes', 'Employee data', 'Business metrics'],
      encryption: 'Standard',
      retention: '5 years',
      access: 'Authenticated users'
    },
    'confidential': {
      level: 'Confidential',
      color: 'yellow',
      description: 'Sensitive business information',
      examples: ['Client contracts', 'Financial data', 'Strategic plans'],
      encryption: 'Enhanced',
      retention: '7 years',
      access: 'Authorized users only'
    },
    'restricted': {
      level: 'Restricted',
      color: 'red',
      description: 'Highly sensitive or regulated data',
      examples: ['Personal data', 'Payment info', 'Health records'],
      encryption: 'Advanced',
      retention: 'Per regulation',
      access: 'Strictly controlled'
    }
  }

  const privacyControls = {
    'consent-management': {
      title: 'Consent Management',
      description: 'Granular consent collection and management',
      features: [
        'Consent capture and recording',
        'Granular permission controls',
        'Consent withdrawal mechanisms',
        'Audit trail for consent changes',
        'Cookie consent management'
      ],
      status: 'implemented'
    },
    'data-minimization': {
      title: 'Data Minimization',
      description: 'Collect only necessary data',
      features: [
        'Purpose limitation enforcement',
        'Data collection justification',
        'Automated data expiry',
        'Regular data review processes',
        'Minimal data collection forms'
      ],
      status: 'implemented'
    },
    'subject-rights': {
      title: 'Data Subject Rights',
      description: 'GDPR/CCPA data subject rights',
      features: [
        'Right to access (data portability)',
        'Right to rectification (data correction)',
        'Right to erasure (right to be forgotten)',
        'Right to restrict processing',
        'Right to object to processing'
      ],
      status: 'implemented'
    }
  }

  const dataTypeProfiles = {
    'personal': {
      name: 'Personal Data',
      regulations: ['GDPR', 'CCPA', 'PIPEDA'],
      classification: 'restricted',
      encryption: 'AES-256',
      retention: '2 years or per consent',
      backups: 'Encrypted daily',
      anonymization: 'K-anonymity (k=5)'
    },
    'financial': {
      name: 'Financial Data',
      regulations: ['PCI DSS', 'SOX', 'GDPR'],
      classification: 'restricted',
      encryption: 'AES-256 + tokenization',
      retention: '7 years',
      backups: 'Encrypted daily',
      anonymization: 'Pseudonymization'
    },
    'health': {
      name: 'Health Data',
      regulations: ['HIPAA', 'GDPR', 'FDA CFR'],
      classification: 'restricted',
      encryption: 'FIPS 140-2 Level 3',
      retention: 'Per medical regulations',
      backups: 'Encrypted daily',
      anonymization: 'Safe Harbor method'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'implemented':
        return 'text-green-600 bg-green-100'
      case 'in-progress':
        return 'text-yellow-600 bg-yellow-100'
      case 'planned':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getClassificationColor = (level: string) => {
    const colors = {
      green: 'bg-green-100 text-green-800 border-green-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      red: 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[level as keyof typeof colors] || colors.blue
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
            <h1 className="text-3xl font-bold text-gray-900">Data Protection & Privacy Framework</h1>
          </div>
          <p className="text-gray-600">
            Comprehensive data protection with encryption, classification, and privacy controls
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Framework Overview', icon: Shield },
                { id: 'encryption', label: 'Encryption Strategy', icon: Lock },
                { id: 'classification', label: 'Data Classification', icon: Database },
                { id: 'privacy', label: 'Privacy Controls', icon: Eye },
                { id: 'policies', label: 'Data Policies', icon: FileText }
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
                {/* Protection Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Encryption Coverage</h4>
                    <p className="text-2xl font-bold text-gray-900">100%</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Data Classification</h4>
                    <p className="text-2xl font-bold text-gray-900">4 Levels</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Privacy Controls</h4>
                    <p className="text-2xl font-bold text-gray-900">12 Active</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Compliance Score</h4>
                    <p className="text-2xl font-bold text-gray-900">98%</p>
                  </div>
                </div>

                {/* Data Types */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Protected Data Types</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {Object.entries(dataTypeProfiles).map(([type, profile]) => (
                      <div key={type} className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">{profile.name}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Classification:</span>
                            <span className="font-medium capitalize">{profile.classification}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Encryption:</span>
                            <span className="font-medium">{profile.encryption}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Retention:</span>
                            <span className="font-medium">{profile.retention}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 mt-3">
                          {profile.regulations.map((reg, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {reg}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'encryption' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Encryption Strategies</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {Object.entries(encryptionStrategies).map(([key, strategy]) => (
                    <div key={key} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Lock className="w-5 h-5 text-blue-600" />
                        <div>
                          <h4 className="font-semibold text-gray-900">{strategy.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(strategy.status)}`}>
                            {strategy.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{strategy.description}</p>
                      <div className="space-y-2 text-sm">
                        {strategy.algorithm && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Algorithm:</span>
                            <span className="font-medium">{strategy.algorithm}</span>
                          </div>
                        )}
                        {strategy.protocol && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Protocol:</span>
                            <span className="font-medium">{strategy.protocol}</span>
                          </div>
                        )}
                        {strategy.keyRotation && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Key Rotation:</span>
                            <span className="font-medium">{strategy.keyRotation}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4">
                        <span className="text-xs text-gray-600">Compliance:</span>
                        <div className="flex gap-1 mt-1">
                          {strategy.compliance.map((comp, index) => (
                            <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                              {comp}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'classification' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Data Classification Levels</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {Object.entries(dataClassificationLevels).map(([key, level]) => (
                    <div key={key} className={`border-2 rounded-lg p-6 ${getClassificationColor(level.color)}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <Database className="w-5 h-5" />
                        <h4 className="font-semibold text-lg">{level.level}</h4>
                      </div>
                      <p className="mb-4">{level.description}</p>
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <span className="font-medium">Encryption:</span>
                          <p>{level.encryption}</p>
                        </div>
                        <div>
                          <span className="font-medium">Retention:</span>
                          <p>{level.retention}</p>
                        </div>
                        <div>
                          <span className="font-medium">Access:</span>
                          <p>{level.access}</p>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-sm">Examples:</span>
                        <ul className="mt-1 space-y-1">
                          {level.examples.map((example, index) => (
                            <li key={index} className="text-sm">• {example}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Privacy Controls</h3>
                <div className="space-y-6">
                  {Object.entries(privacyControls).map(([key, control]) => (
                    <div key={key} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Eye className="w-5 h-5 text-blue-600" />
                        <div>
                          <h4 className="font-semibold text-gray-900">{control.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(control.status)}`}>
                            {control.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">{control.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {control.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'policies' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Data Protection Policies</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">Data Retention Policy</h4>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Automated data expiry based on classification</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Legal hold management for litigation</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Secure data disposal procedures</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Backup retention alignment</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Key className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">Data Access Policy</h4>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Role-based data access controls</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Data access approval workflows</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Access logging and monitoring</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Regular access reviews and cleanup</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Users className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">Data Sharing Policy</h4>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Data sharing agreements and contracts</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Cross-border transfer protections</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Third-party data processing agreements</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Data minimization in sharing</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Download className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">Data Breach Response</h4>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Incident detection and response</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>72-hour breach notification</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Impact assessment procedures</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Customer and regulator communication</span>
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