'use client'

import { 
  FileText, 
  Users, 
  BarChart3, 
  Mail, 
  Calendar, 
  Settings,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export function ModulesSection() {
  const modules = [
    {
      icon: FileText,
      title: 'Document Management',
      description: 'Generate, process, and manage documents with PDF generation, HTML templates, and automated workflows.',
      features: ['PDF generation', 'HTML templates', 'Document workflows', 'Multi-format output']
    },
    {
      icon: Users,
      title: 'User Management',
      description: 'Complete user authentication, role-based access control, and user profile management system.',
      features: ['Authentication', 'RBAC system', 'User profiles', 'Access control']
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reporting',
      description: 'Comprehensive analytics dashboard with custom reports, data visualization, and performance metrics.',
      features: ['Custom reports', 'Data visualization', 'Performance metrics', 'Real-time analytics']
    },
    {
      icon: Mail,
      title: 'Communication',
      description: 'Email notifications, SMS alerts, and automated communication workflows with template management.',
      features: ['Email notifications', 'SMS alerts', 'Template management', 'Automated workflows']
    },
    {
      icon: Calendar,
      title: 'Scheduling',
      description: 'Appointment scheduling, calendar integration, and automated reminder systems for better time management.',
      features: ['Appointment scheduling', 'Calendar integration', 'Automated reminders', 'Time management']
    },
    {
      icon: Settings,
      title: 'Configuration',
      description: 'System configuration, feature flags, environment management, and customizable settings.',
      features: ['Feature flags', 'Environment management', 'System configuration', 'Custom settings']
    }
  ]

  const additionalModules = [
    'Form Builder', 'Data Validation', 'File Upload', 'Image Processing',
    'Payment Processing', 'Inventory Management', 'Customer Management',
    'Project Management', 'Task Management', 'Notification System',
    'Audit Logging', 'Backup System', 'API Management', 'Webhook Integration',
    'Search Engine', 'Content Management', 'Blog System', 'E-commerce',
    'CRM Integration', 'ERP Integration', 'Third-party APIs', 'Social Media',
    'Multi-language', 'Localization', 'Theme System', 'Custom CSS',
    'Performance Monitoring', 'Error Tracking', 'Security Scanning'
  ]

  return (
    <section id="modules" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            33-Module Template Engine
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hot-pluggable modules that can be added to any micro-app without downtime. 
            Each module is enterprise-grade and production-ready.
          </p>
        </div>

        {/* Featured Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {modules.map((module, index) => (
            <div
              key={module.title}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Module Icon */}
              <div className="p-8 bg-gradient-to-br from-purple-50 to-blue-50">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <module.icon className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Module Content */}
              <div className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors duration-300">
                  {module.title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {module.description}
                </p>

                <ul className="space-y-2">
                  {module.features.map((feature) => (
                    <li key={feature} className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* All Modules List */}
        <div className="bg-white rounded-2xl p-12 shadow-lg">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Complete Module Library
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              All 33 modules available for instant integration into your micro-applications.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {additionalModules.map((module, index) => (
              <div
                key={module}
                className="p-4 bg-gray-50 rounded-lg hover:bg-purple-50 transition-colors duration-200 text-center"
              >
                <span className="text-sm font-medium text-gray-700">{module}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Module Benefits */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-6">
              <span className="text-white font-bold text-2xl">0</span>
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-4">Zero Downtime</h4>
            <p className="text-gray-600">Add modules without interrupting your application's operation.</p>
          </div>
          <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6">
              <span className="text-white font-bold text-2xl">∞</span>
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-4">Unlimited Scaling</h4>
            <p className="text-gray-600">Scale your application with as many modules as needed.</p>
          </div>
          <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6">
              <span className="text-white font-bold text-2xl">✓</span>
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-4">Production Ready</h4>
            <p className="text-gray-600">All modules are tested and ready for enterprise deployment.</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <button className="group bg-purple-600 text-white px-8 py-4 rounded-xl hover:bg-purple-700 transition-all duration-200 font-semibold text-lg flex items-center mx-auto">
            Browse All Modules
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </section>
  )
}
