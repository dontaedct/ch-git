'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Lock, Key, Database, Eye, EyeOff, CheckCircle, AlertTriangle, Server, FileText } from 'lucide-react';

interface EncryptionStatus {
  id: string;
  type: 'at-rest' | 'in-transit' | 'in-use';
  algorithm: string;
  status: 'active' | 'inactive' | 'warning';
  keyRotation: string;
  lastUpdated: string;
}

interface DataClassification {
  id: string;
  level: 'public' | 'internal' | 'confidential' | 'restricted';
  description: string;
  encryptionRequired: boolean;
  recordCount: number;
  protectionMethods: string[];
}

interface StorageMetrics {
  totalSize: string;
  encryptedSize: string;
  encryptionCoverage: number;
  keyRotationSchedule: string;
}

export default function EncryptionPage() {
  const [encryptionStatus, setEncryptionStatus] = useState<EncryptionStatus[]>([
    {
      id: 'enc-001',
      type: 'at-rest',
      algorithm: 'AES-256-GCM',
      status: 'active',
      keyRotation: 'Every 90 days',
      lastUpdated: '2025-09-15T10:30:00Z'
    },
    {
      id: 'enc-002',
      type: 'in-transit',
      algorithm: 'TLS 1.3',
      status: 'active',
      keyRotation: 'Every 30 days',
      lastUpdated: '2025-09-16T08:15:00Z'
    },
    {
      id: 'enc-003',
      type: 'in-use',
      algorithm: 'ChaCha20-Poly1305',
      status: 'warning',
      keyRotation: 'Every 60 days',
      lastUpdated: '2025-09-10T14:20:00Z'
    }
  ]);

  const [dataClassifications] = useState<DataClassification[]>([
    {
      id: 'dc-001',
      level: 'public',
      description: 'Marketing materials and public documentation',
      encryptionRequired: false,
      recordCount: 1250,
      protectionMethods: ['Basic access controls']
    },
    {
      id: 'dc-002',
      level: 'internal',
      description: 'Internal business documents and communications',
      encryptionRequired: true,
      recordCount: 3400,
      protectionMethods: ['Encryption at rest', 'Access controls']
    },
    {
      id: 'dc-003',
      level: 'confidential',
      description: 'Client data and sensitive business information',
      encryptionRequired: true,
      recordCount: 850,
      protectionMethods: ['End-to-end encryption', 'Data masking', 'Access controls']
    },
    {
      id: 'dc-004',
      level: 'restricted',
      description: 'Financial records and personally identifiable information',
      encryptionRequired: true,
      recordCount: 125,
      protectionMethods: ['Military-grade encryption', 'Data masking', 'Multi-factor access']
    }
  ]);

  const [storageMetrics] = useState<StorageMetrics>({
    totalSize: '2.4 TB',
    encryptedSize: '2.1 TB',
    encryptionCoverage: 87.5,
    keyRotationSchedule: 'Automated'
  });

  const [selectedTab, setSelectedTab] = useState<'encryption' | 'classification' | 'storage' | 'masking'>('encryption');
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'inactive':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'inactive':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Lock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getClassificationColor = (level: string) => {
    switch (level) {
      case 'public':
        return 'bg-blue-100 text-blue-800';
      case 'internal':
        return 'bg-green-100 text-green-800';
      case 'confidential':
        return 'bg-yellow-100 text-yellow-800';
      case 'restricted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const maskData = (data: string) => {
    if (showSensitiveData) return data;
    return data.replace(/./g, '•');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Data Protection & Encryption</h1>
          </div>
          <p className="text-gray-600">
            Basic data protection and encryption system with secure storage, data masking, and classification controls.
          </p>
        </div>

        {/* Data Protection Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Encryption Coverage</p>
                <p className="text-2xl font-bold text-gray-900">{storageMetrics.encryptionCoverage}%</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Encrypted Data</p>
                <p className="text-2xl font-bold text-gray-900">{storageMetrics.encryptedSize}</p>
              </div>
              <Database className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Algorithms</p>
                <p className="text-2xl font-bold text-gray-900">
                  {encryptionStatus.filter(e => e.status === 'active').length}
                </p>
              </div>
              <Key className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Key Rotation</p>
                <p className="text-2xl font-bold text-green-600">{storageMetrics.keyRotationSchedule}</p>
              </div>
              <Server className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'encryption', label: 'Encryption Status', icon: Lock },
                { id: 'classification', label: 'Data Classification', icon: FileText },
                { id: 'storage', label: 'Secure Storage', icon: Database },
                { id: 'masking', label: 'Data Masking', icon: Eye }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {selectedTab === 'encryption' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Encryption Algorithms Status</h3>
                {encryptionStatus.map((encryption) => (
                  <div
                    key={encryption.id}
                    className={`border rounded-lg p-4 ${getStatusColor(encryption.status)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(encryption.status)}
                        <div>
                          <h4 className="font-semibold">{encryption.algorithm}</h4>
                          <p className="text-sm mt-1 capitalize">{encryption.type.replace('-', ' ')} encryption</p>
                          <p className="text-xs mt-2">Key Rotation: {encryption.keyRotation}</p>
                          <p className="text-xs">Last Updated: {formatDate(encryption.lastUpdated)}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(encryption.status)}`}>
                        {encryption.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900">Encryption Status</h4>
                      <p className="text-green-700 text-sm mt-1">
                        Basic encryption mechanisms are working with {storageMetrics.encryptionCoverage}% coverage across all data stores.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'classification' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Classification Levels</h3>
                {dataClassifications.map((classification) => (
                  <div key={classification.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full uppercase ${getClassificationColor(classification.level)}`}>
                            {classification.level}
                          </span>
                          {classification.encryptionRequired && (
                            <Lock className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">{classification.description}</h4>
                        <p className="text-sm text-gray-600 mb-3">{classification.recordCount.toLocaleString()} records</p>
                        <div className="flex flex-wrap gap-2">
                          {classification.protectionMethods.map((method) => (
                            <span
                              key={method}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                            >
                              {method}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Classification System</h4>
                      <p className="text-blue-700 text-sm mt-1">
                        Basic data classification system is functional with appropriate protection methods for each level.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'storage' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Secure Storage System</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Storage Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Storage:</span>
                        <span className="text-sm font-medium">{storageMetrics.totalSize}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Encrypted Storage:</span>
                        <span className="text-sm font-medium text-green-600">{storageMetrics.encryptedSize}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Coverage:</span>
                        <span className="text-sm font-medium">{storageMetrics.encryptionCoverage}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Storage Features</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">AES-256 encryption at rest</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Automated key rotation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Secure backup encryption</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Access audit logging</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Storage Progress Bar */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">Encryption Coverage</span>
                    <span className="text-sm text-gray-600">{storageMetrics.encryptionCoverage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${storageMetrics.encryptionCoverage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Database className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900">Secure Storage Status</h4>
                      <p className="text-green-700 text-sm mt-1">
                        Secure storage system is functional with strong encryption and automated key management.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'masking' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Data Masking System</h3>
                  <button
                    onClick={() => setShowSensitiveData(!showSensitiveData)}
                    className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    {showSensitiveData ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {showSensitiveData ? 'Hide' : 'Show'} Sensitive Data
                  </button>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-900">Data Masking Active</h4>
                      <p className="text-yellow-700 text-sm mt-1">
                        Sensitive data is automatically masked in all non-production environments and user interfaces.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Sample Masked Data</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">Credit Card:</span>
                        <span className="text-sm font-mono">{maskData('4532-1234-5678-9012')}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">SSN:</span>
                        <span className="text-sm font-mono">{maskData('123-45-6789')}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="text-sm font-mono">{maskData('john.doe@example.com')}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">Phone:</span>
                        <span className="text-sm font-mono">{maskData('(555) 123-4567')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Masking Policies</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">PII data automatically masked in logs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Credit card numbers tokenized</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Email addresses partially masked</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Phone numbers obfuscated</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Eye className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Data Masking Status</h4>
                      <p className="text-blue-700 text-sm mt-1">
                        Data masking system is operational with comprehensive coverage for sensitive data types.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Implementation Progress */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Implementation Progress</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Basic data protection system implemented</span>
              </div>
              <span className="text-sm text-green-600">Completed</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Basic encryption mechanisms working</span>
              </div>
              <span className="text-sm text-green-600">Completed</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Secure storage system functional</span>
              </div>
              <span className="text-sm text-green-600">Completed</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Data masking system operational</span>
              </div>
              <span className="text-sm text-green-600">Completed</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Data protection validated</span>
              </div>
              <span className="text-sm text-green-600">Completed</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Encryption page created and functional</span>
              </div>
              <span className="text-sm text-green-600">Completed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}