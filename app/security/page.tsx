'use client'

import { useState } from 'react'
import { Shield, Lock, Eye, FileText, UserCheck, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'

export default function SecurityDashboard() {
  const [activeMetric, setActiveMetric] = useState('overview')

  const securityMetrics = {
    overview: {
      title: 'Security Overview',
      status: 'operational',
      lastUpdated: new Date().toLocaleString(),
      metrics: [
        { label: 'Security Score', value: '98%', status: 'excellent' },
        { label: 'Active Threats', value: '0', status: 'secure' },
        { label: 'Compliance Status', value: '100%', status: 'compliant' },
        { label: 'Last Security Scan', value: '2 hours ago', status: 'recent' }
      ]
    },
    threats: {
      title: 'Threat Detection',
      status: 'monitoring',
      incidents: [
        { type: 'Failed Login Attempt', severity: 'low', time: '5 minutes ago', status: 'resolved' },
        { type: 'Suspicious API Call', severity: 'medium', time: '1 hour ago', status: 'investigating' }
      ]
    },
    compliance: {
      title: 'Compliance Status',
      frameworks: [
        { name: 'GDPR', status: 'compliant', score: '100%' },
        { name: 'CCPA', status: 'compliant', score: '98%' },
        { name: 'SOC 2', status: 'in-progress', score: '85%' }
      ]
    }
  }

  const securityModules = [
    {
      title: 'Security Architecture',
      description: 'Client security architecture and isolation controls',
      icon: Shield,
      href: '/security/architecture',
      status: 'active',
      color: 'bg-blue-500'
    },
    {
      title: 'Data Protection',
      description: 'Data protection and privacy framework',
      icon: Lock,
      href: '/security/data-protection',
      status: 'active',
      color: 'bg-green-500'
    },
    {
      title: 'Security Controls',
      description: 'Authentication and authorization systems',
      icon: UserCheck,
      href: '/security/controls',
      status: 'active',
      color: 'bg-purple-500'
    },
    {
      title: 'Compliance Framework',
      description: 'Regulatory compliance and audit requirements',
      icon: FileText,
      href: '/security/compliance',
      status: 'active',
      color: 'bg-orange-500'
    },
    {
      title: 'Security Monitoring',
      description: 'Real-time security monitoring and alerts',
      icon: Eye,
      href: '/security/monitoring',
      status: 'monitoring',
      color: 'bg-red-500'
    },
    {
      title: 'Audit Logging',
      description: 'Comprehensive audit trails and logging',
      icon: Clock,
      href: '/security/audit-logging',
      status: 'active',
      color: 'bg-indigo-500'
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
      case 'secure':
      case 'compliant':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'monitoring':
        return <Eye className="w-5 h-5 text-blue-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Security Dashboard</h1>
          </div>
          <p className="text-gray-600">
            Comprehensive security and compliance framework for agency micro-app toolkit
          </p>
        </div>

        {/* Security Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {securityMetrics.overview.metrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">{metric.label}</h3>
                {getStatusIcon(metric.status)}
              </div>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            </div>
          ))}
        </div>

        {/* Security Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {securityModules.map((module, index) => (
            <Link
              key={index}
              href={module.href}
              className="group bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-lg ${module.color}`}>
                    <module.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {module.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(module.status)}
                      <span className="text-sm text-gray-500 capitalize">{module.status}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{module.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Recent Security Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {securityMetrics.threats.incidents.map((incident, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`w-5 h-5 ${
                      incident.severity === 'high' ? 'text-red-500' :
                      incident.severity === 'medium' ? 'text-yellow-500' :
                      'text-blue-500'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">{incident.type}</p>
                      <p className="text-sm text-gray-600">{incident.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      incident.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {incident.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      incident.severity === 'high' ? 'bg-red-100 text-red-800' :
                      incident.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {incident.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}