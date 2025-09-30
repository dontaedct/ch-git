'use client'

import { 
  Zap, 
  Shield, 
  Layers, 
  Users, 
  Clock, 
  Settings,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export function FeaturesSection() {
  const features = [
    {
      icon: Clock,
      title: 'Rapid Development',
      description: 'Build and deploy custom micro-applications in 7 days or less with our streamlined development process.',
      highlights: ['≤7 day delivery', 'AI-assisted development', 'Pre-built templates', 'Automated deployment']
    },
    {
      icon: Shield,
      title: 'Enterprise-Grade Security',
      description: 'Built with security-first architecture including RLS, RBAC, monitoring, and comprehensive error handling.',
      highlights: ['Row Level Security', 'Role-based access control', 'Real-time monitoring', 'Error tracking']
    },
    {
      icon: Layers,
      title: 'Hot-Pluggable Modules',
      description: 'Add features and functionality without downtime using our modular architecture and 33-module template engine.',
      highlights: ['33 pre-built modules', 'Zero-downtime updates', 'Modular architecture', 'Custom extensions']
    },
    {
      icon: Users,
      title: 'Multi-Tenant Architecture',
      description: 'Isolated client environments with complete data separation and scalable resource sharing.',
      highlights: ['Client isolation', 'Data segregation', 'Scalable resources', 'Independent workspaces']
    },
    {
      icon: Settings,
      title: 'Workflow Automation',
      description: 'Integrate with n8n for complex business processes, automated workflows, and reliable error handling.',
      highlights: ['n8n integration', 'Automated workflows', 'Error handling', 'Process optimization']
    },
    {
      icon: Zap,
      title: 'White-Labeling',
      description: 'Complete client branding and customization with theme overrides and custom styling capabilities.',
      highlights: ['Client branding', 'Theme customization', 'Custom styling', 'Brand assets']
    }
  ]

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Enterprise-Grade Features
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              for Rapid Development
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The DCT Micro-Apps platform combines enterprise-grade security, rapid development capabilities, 
            and sophisticated tooling to deliver professional micro-applications at scale.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-8 rounded-2xl border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all duration-300 bg-white hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors duration-300">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {feature.description}
              </p>

              <ul className="space-y-2">
                {feature.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Technology Stack */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Built on Modern Technology
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Leveraging the latest technologies and best practices for optimal performance and developer experience.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Next.js 14</h4>
              <p className="text-gray-600 text-sm">React framework with App Router</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Supabase</h4>
              <p className="text-gray-600 text-sm">PostgreSQL + Auth + Real-time</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">TypeScript</h4>
              <p className="text-gray-600 text-sm">Type-safe development</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Vercel</h4>
              <p className="text-gray-600 text-sm">Deployment and hosting</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <button className="group bg-purple-600 text-white px-8 py-4 rounded-xl hover:bg-purple-700 transition-all duration-200 font-semibold text-lg flex items-center mx-auto">
            Explore the Platform
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </section>
  )
}
