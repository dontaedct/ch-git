'use client'

import { 
  Workflow, 
  Database, 
  Users, 
  FileText, 
  Mail, 
  BarChart3,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export function ServicesSection() {
  const services = [
    {
      icon: Workflow,
      title: 'Workflow Automation',
      description: 'Streamline repetitive tasks and create efficient business processes that save time and reduce errors.',
      features: ['Process mapping', 'Task automation', 'Approval workflows', 'Notification systems']
    },
    {
      icon: Database,
      title: 'Data Management',
      description: 'Organize and automate your data collection, storage, and reporting for better business insights.',
      features: ['Data collection forms', 'Database integration', 'Report generation', 'Data synchronization']
    },
    {
      icon: Users,
      title: 'Customer Management',
      description: 'Automate customer interactions, lead tracking, and relationship management processes.',
      features: ['Lead capture', 'Customer onboarding', 'Follow-up sequences', 'Support ticketing']
    },
    {
      icon: FileText,
      title: 'Document Automation',
      description: 'Generate, process, and manage documents automatically to reduce manual work.',
      features: ['Document generation', 'Form processing', 'Contract management', 'Invoice automation']
    },
    {
      icon: Mail,
      title: 'Communication Automation',
      description: 'Automate emails, notifications, and communication workflows to stay connected with customers.',
      features: ['Email sequences', 'SMS notifications', 'Appointment reminders', 'Status updates']
    },
    {
      icon: BarChart3,
      title: 'Reporting & Analytics',
      description: 'Create automated reports and dashboards to track your business performance and make data-driven decisions.',
      features: ['Custom dashboards', 'Automated reports', 'Performance tracking', 'Business insights']
    }
  ]

  return (
    <section id="services" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Automation Solutions
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              for Every Business Need
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We specialize in creating custom web app automations that solve real business problems 
            and help small businesses operate more efficiently.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="group p-8 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 bg-white hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <service.icon className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                {service.title}
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {service.description}
              </p>

              <ul className="space-y-2">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Process Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Our 7-Day Process
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From consultation to deployment, we deliver your custom automation solution in just 7 days.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Consultation</h4>
              <p className="text-gray-600 text-sm">We understand your business needs and identify automation opportunities.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Design</h4>
              <p className="text-gray-600 text-sm">We design your custom automation solution with your specific requirements.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Build</h4>
              <p className="text-gray-600 text-sm">We develop your automation using proven technologies and best practices.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Deploy</h4>
              <p className="text-gray-600 text-sm">We deploy your solution and provide training for your team.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <button className="group bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold text-lg flex items-center mx-auto">
            Start Your Automation Project
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </section>
  )
}
