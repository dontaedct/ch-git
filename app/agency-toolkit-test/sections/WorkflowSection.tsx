'use client'

import { 
  Workflow, 
  Zap, 
  Shield, 
  Clock, 
  AlertTriangle, 
  Repeat,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export function WorkflowSection() {
  const workflowTypes = [
    {
      icon: Workflow,
      title: 'Client Onboarding',
      description: 'Automated welcome sequences, account setup, and initial configuration workflows.',
      features: ['Welcome emails', 'Account setup', 'Initial configuration', 'User training']
    },
    {
      icon: Zap,
      title: 'Form Processing',
      description: 'Data validation, routing, and automated processing of form submissions.',
      features: ['Data validation', 'Automatic routing', 'Processing workflows', 'Status updates']
    },
    {
      icon: Clock,
      title: 'Document Generation',
      description: 'Automated report creation, PDF generation, and document workflow management.',
      features: ['Report generation', 'PDF creation', 'Document workflows', 'Template processing']
    },
    {
      icon: Shield,
      title: 'Notification Systems',
      description: 'Email and SMS alerts, system notifications, and communication workflows.',
      features: ['Email alerts', 'SMS notifications', 'System alerts', 'Communication workflows']
    }
  ]

  const reliabilityFeatures = [
    'Retry policies with exponential backoff',
    'Circuit breaker pattern implementation',
    'Rate limiting and burst control',
    'Error handling and recovery',
    'Dead letter queue management',
    'Health check monitoring',
    'Graceful degradation',
    'Audit logging and tracking'
  ]

  return (
    <section id="workflows" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Workflow Automation
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Integrate with n8n for complex business processes, automated workflows, 
            and reliable error handling with enterprise-grade reliability controls.
          </p>
        </div>

        {/* Workflow Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {workflowTypes.map((workflow, index) => (
            <div
              key={workflow.title}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Workflow Icon */}
              <div className="p-8 bg-gradient-to-br from-purple-50 to-blue-50">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <workflow.icon className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Workflow Content */}
              <div className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors duration-300">
                  {workflow.title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {workflow.description}
                </p>

                <ul className="space-y-2">
                  {workflow.features.map((feature) => (
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

        {/* n8n Integration */}
        <div className="bg-white rounded-2xl p-12 shadow-lg mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              n8n Integration
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Seamlessly integrate with n8n for powerful workflow automation and process orchestration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Integration Features */}
            <div>
              <h4 className="text-xl font-semibold text-gray-900 mb-6">Integration Features</h4>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-gray-900">Webhook Endpoints</h5>
                    <p className="text-gray-600 text-sm">Secure webhook integration for real-time data flow</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-gray-900">API Integration</h5>
                    <p className="text-gray-600 text-sm">RESTful API endpoints for seamless data exchange</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-gray-900">Event Triggers</h5>
                    <p className="text-gray-600 text-sm">Event-driven workflows with real-time triggers</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-gray-900">Data Transformation</h5>
                    <p className="text-gray-600 text-sm">Automatic data mapping and transformation</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Workflow Diagram */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-6">Workflow Example</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <div className="flex-1 h-2 bg-gray-200 rounded"></div>
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <div className="flex-1 h-2 bg-gray-200 rounded"></div>
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-2">
                  <div>Form Submission → Data Validation → Processing</div>
                  <div>Email Notification → Database Update → Status Update</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reliability Controls */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-12 mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Enterprise Reliability Controls
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built-in reliability features ensure your workflows run smoothly with automatic error handling and recovery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reliabilityFeatures.map((feature, index) => (
              <div
                key={feature}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Repeat className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-4">Automated Processes</h4>
            <p className="text-gray-600">Reduce manual work with intelligent automation and process optimization.</p>
          </div>
          <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-4">Error Handling</h4>
            <p className="text-gray-600">Comprehensive error handling with automatic recovery and notification systems.</p>
          </div>
          <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-4">Real-time Processing</h4>
            <p className="text-gray-600">Process data and trigger workflows in real-time for maximum efficiency.</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <button className="group bg-purple-600 text-white px-8 py-4 rounded-xl hover:bg-purple-700 transition-all duration-200 font-semibold text-lg flex items-center mx-auto">
            Configure Workflows
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </section>
  )
}
