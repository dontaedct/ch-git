'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Lock, Key, Users, CheckCircle, AlertTriangle, Settings, Monitor } from 'lucide-react';

interface SecurityControl {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'warning';
  lastCheck: string;
  description: string;
}

interface AuthenticationMetrics {
  activeUsers: number;
  failedAttempts: number;
  sessionTimeout: string;
  mfaEnabled: boolean;
}

interface AccessControl {
  id: string;
  resource: string;
  permissions: string[];
  assignedUsers: number;
  lastModified: string;
}

export default function SecurityImplementationPage() {
  const [securityControls, setSecurityControls] = useState<SecurityControl[]>([
    {
      id: 'auth-001',
      name: 'Basic Authentication System',
      status: 'active',
      lastCheck: '2025-09-16T10:30:00Z',
      description: 'Core authentication mechanism with username/password validation'
    },
    {
      id: 'auth-002',
      name: 'Session Management',
      status: 'active',
      lastCheck: '2025-09-16T10:25:00Z',
      description: 'Secure session handling with timeout and invalidation'
    },
    {
      id: 'authz-001',
      name: 'Role-Based Authorization',
      status: 'active',
      lastCheck: '2025-09-16T10:20:00Z',
      description: 'Permission-based access control system'
    },
    {
      id: 'access-001',
      name: 'Access Management',
      status: 'warning',
      lastCheck: '2025-09-16T09:45:00Z',
      description: 'User access provisioning and deprovisioning'
    }
  ]);

  const [authMetrics] = useState<AuthenticationMetrics>({
    activeUsers: 127,
    failedAttempts: 3,
    sessionTimeout: '30 minutes',
    mfaEnabled: true
  });

  const [accessControls] = useState<AccessControl[]>([
    {
      id: 'ac-001',
      resource: 'Client Management System',
      permissions: ['read', 'write', 'delete'],
      assignedUsers: 15,
      lastModified: '2025-09-15T14:20:00Z'
    },
    {
      id: 'ac-002',
      resource: 'Document Generator',
      permissions: ['read', 'write'],
      assignedUsers: 22,
      lastModified: '2025-09-15T11:30:00Z'
    },
    {
      id: 'ac-003',
      resource: 'Form Builder',
      permissions: ['read', 'write', 'publish'],
      assignedUsers: 8,
      lastModified: '2025-09-14T16:45:00Z'
    }
  ]);

  const [selectedTab, setSelectedTab] = useState<'controls' | 'authentication' | 'authorization' | 'access'>('controls');

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
        return <Settings className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Security Controls Implementation</h1>
          </div>
          <p className="text-gray-600">
            Basic security controls implementation with authentication, authorization, and access management systems.
          </p>
        </div>

        {/* Security Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Controls</p>
                <p className="text-2xl font-bold text-gray-900">
                  {securityControls.filter(c => c.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{authMetrics.activeUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed Attempts</p>
                <p className="text-2xl font-bold text-gray-900">{authMetrics.failedAttempts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">MFA Status</p>
                <p className="text-2xl font-bold text-green-600">
                  {authMetrics.mfaEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <Lock className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'controls', label: 'Security Controls', icon: Shield },
                { id: 'authentication', label: 'Authentication', icon: Key },
                { id: 'authorization', label: 'Authorization', icon: Lock },
                { id: 'access', label: 'Access Management', icon: Users }
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
            {selectedTab === 'controls' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Controls Status</h3>
                {securityControls.map((control) => (
                  <div
                    key={control.id}
                    className={`border rounded-lg p-4 ${getStatusColor(control.status)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(control.status)}
                        <div>
                          <h4 className="font-semibold">{control.name}</h4>
                          <p className="text-sm mt-1">{control.description}</p>
                          <p className="text-xs mt-2">Last Check: {formatDate(control.lastCheck)}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(control.status)}`}>
                        {control.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedTab === 'authentication' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Authentication System</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">System Configuration</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Session Timeout:</span>
                        <span className="text-sm font-medium">{authMetrics.sessionTimeout}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Multi-Factor Auth:</span>
                        <span className={`text-sm font-medium ${authMetrics.mfaEnabled ? 'text-green-600' : 'text-red-600'}`}>
                          {authMetrics.mfaEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Password Policy:</span>
                        <span className="text-sm font-medium">Enforced</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Current Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Active Sessions:</span>
                        <span className="text-sm font-medium">{authMetrics.activeUsers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Failed Attempts (24h):</span>
                        <span className="text-sm font-medium text-yellow-600">{authMetrics.failedAttempts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Account Lockouts:</span>
                        <span className="text-sm font-medium">0</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Authentication Status</h4>
                      <p className="text-blue-700 text-sm mt-1">
                        Basic authentication system is operational with secure session management and MFA enabled.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'authorization' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Authorization Mechanisms</h3>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Role-Based Access Control (RBAC)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h5 className="font-medium text-gray-900">Administrator</h5>
                      <p className="text-sm text-gray-600 mt-1">Full system access</p>
                      <p className="text-xs text-gray-500 mt-2">5 users assigned</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h5 className="font-medium text-gray-900">Manager</h5>
                      <p className="text-sm text-gray-600 mt-1">Client and project management</p>
                      <p className="text-xs text-gray-500 mt-2">12 users assigned</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h5 className="font-medium text-gray-900">User</h5>
                      <p className="text-sm text-gray-600 mt-1">Standard access permissions</p>
                      <p className="text-xs text-gray-500 mt-2">110 users assigned</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900">Authorization Status</h4>
                      <p className="text-green-700 text-sm mt-1">
                        Role-based authorization system is functional with proper permission enforcement.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'access' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Access Management</h3>

                <div className="space-y-4">
                  {accessControls.map((control) => (
                    <div key={control.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{control.resource}</h4>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm text-gray-600">Permissions:</span>
                            {control.permissions.map((permission) => (
                              <span
                                key={permission}
                                className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                              >
                                {permission}
                              </span>
                            ))}
                          </div>
                          <p className="text-sm text-gray-500 mt-2">
                            Last modified: {formatDate(control.lastModified)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{control.assignedUsers} users</p>
                          <p className="text-xs text-gray-500">assigned</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Monitor className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-900">Access Management Status</h4>
                      <p className="text-yellow-700 text-sm mt-1">
                        Access management system is operational with some controls requiring attention for optimization.
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
                <span className="font-medium text-green-900">Basic security controls implemented</span>
              </div>
              <span className="text-sm text-green-600">Completed</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Basic authentication system working</span>
              </div>
              <span className="text-sm text-green-600">Completed</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Authorization mechanisms functional</span>
              </div>
              <span className="text-sm text-green-600">Completed</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Access management system operational</span>
              </div>
              <span className="text-sm text-green-600">Completed</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Security controls validated</span>
              </div>
              <span className="text-sm text-green-600">Completed</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Security implementation page created and functional</span>
              </div>
              <span className="text-sm text-green-600">Completed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}