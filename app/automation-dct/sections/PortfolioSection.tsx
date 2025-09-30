'use client'

import { ExternalLink, ArrowRight } from 'lucide-react'

export function PortfolioSection() {
  const projects = [
    {
      title: 'E-commerce Order Management',
      description: 'Automated order processing, inventory updates, and customer notifications for a growing online retailer.',
      category: 'E-commerce',
      tags: ['Order Processing', 'Inventory', 'Notifications'],
      link: '#'
    },
    {
      title: 'Healthcare Appointment System',
      description: 'Patient scheduling, reminder automation, and provider coordination for a medical practice.',
      category: 'Healthcare',
      tags: ['Scheduling', 'Reminders', 'Patient Management'],
      link: '#'
    },
    {
      title: 'Real Estate Lead Management',
      description: 'Lead capture, follow-up sequences, and property matching automation for a real estate agency.',
      category: 'Real Estate',
      tags: ['Lead Management', 'CRM', 'Automation'],
      link: '#'
    },
    {
      title: 'Restaurant Inventory System',
      description: 'Automated inventory tracking, supplier ordering, and waste reduction for a restaurant chain.',
      category: 'Food Service',
      tags: ['Inventory', 'Ordering', 'Analytics'],
      link: '#'
    },
    {
      title: 'Professional Services CRM',
      description: 'Client onboarding, project tracking, and billing automation for a consulting firm.',
      category: 'Professional Services',
      tags: ['CRM', 'Project Management', 'Billing'],
      link: '#'
    },
    {
      title: 'Manufacturing Quality Control',
      description: 'Quality inspection workflows, defect tracking, and compliance reporting for a manufacturer.',
      category: 'Manufacturing',
      tags: ['Quality Control', 'Compliance', 'Reporting'],
      link: '#'
    }
  ]

  return (
    <section id="portfolio" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Success Stories
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how we've helped small businesses automate their operations and achieve better results.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {projects.map((project, index) => (
            <div
              key={project.title}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Project Image */}
              <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-200 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-600/20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl font-bold text-blue-300 opacity-50">
                    {index + 1}
                  </div>
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button className="p-3 bg-white/90 rounded-full hover:bg-white transition-colors duration-200">
                    <ExternalLink className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
              </div>

              {/* Project Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {project.category}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200">
                  {project.title}
                </h3>
                
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {project.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* View Project Link */}
                <button className="group/link flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200">
                  View Case Study
                  <ArrowRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform duration-200" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Results Section */}
        <div className="bg-white rounded-2xl p-12 shadow-lg">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Measurable Results
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our automation solutions deliver real, measurable improvements to business operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">75%</div>
              <div className="text-gray-600">Time Saved on Repetitive Tasks</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">90%</div>
              <div className="text-gray-600">Reduction in Manual Errors</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">50%</div>
              <div className="text-gray-600">Faster Process Completion</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-gray-600">Client Satisfaction Rate</div>
            </div>
          </div>
        </div>

        {/* View All Projects CTA */}
        <div className="text-center mt-16">
          <button className="group bg-white text-gray-900 px-8 py-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 font-semibold text-lg flex items-center mx-auto">
            View All Case Studies
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </section>
  )
}
