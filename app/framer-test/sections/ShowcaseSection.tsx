'use client'

import { ExternalLink, Github, ArrowRight } from 'lucide-react'

export function ShowcaseSection() {
  const projects = [
    {
      title: 'E-commerce Platform',
      description: 'A modern e-commerce platform with advanced filtering and checkout flow.',
      image: '/api/placeholder/600/400',
      category: 'Web App',
      tags: ['React', 'TypeScript', 'Tailwind'],
      link: '#'
    },
    {
      title: 'Mobile Banking App',
      description: 'Secure and intuitive mobile banking experience with biometric authentication.',
      image: '/api/placeholder/600/400',
      category: 'Mobile App',
      tags: ['React Native', 'Node.js', 'PostgreSQL'],
      link: '#'
    },
    {
      title: 'Design System',
      description: 'Comprehensive design system with reusable components and documentation.',
      image: '/api/placeholder/600/400',
      category: 'Design System',
      tags: ['Figma', 'Storybook', 'React'],
      link: '#'
    },
    {
      title: 'Analytics Dashboard',
      description: 'Real-time analytics dashboard with interactive charts and data visualization.',
      image: '/api/placeholder/600/400',
      category: 'Dashboard',
      tags: ['Vue.js', 'D3.js', 'Python'],
      link: '#'
    },
    {
      title: 'Portfolio Website',
      description: 'Creative portfolio website with smooth animations and modern design.',
      image: '/api/placeholder/600/400',
      category: 'Website',
      tags: ['Next.js', 'Framer Motion', 'Vercel'],
      link: '#'
    },
    {
      title: 'SaaS Landing Page',
      description: 'High-converting landing page for a SaaS product with A/B testing.',
      image: '/api/placeholder/600/400',
      category: 'Landing Page',
      tags: ['HTML', 'CSS', 'JavaScript'],
      link: '#'
    }
  ]

  return (
    <section id="showcase" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            See what's possible
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore amazing projects created by our community of designers and developers.
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
              <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl font-bold text-gray-300 opacity-50">
                    {index + 1}
                  </div>
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <button className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors duration-200">
                      <ExternalLink className="w-4 h-4 text-gray-700" />
                    </button>
                    <button className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors duration-200">
                      <Github className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
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
                  View Project
                  <ArrowRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform duration-200" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Projects CTA */}
        <div className="text-center">
          <button className="group bg-white text-gray-900 px-8 py-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 font-semibold text-lg flex items-center mx-auto">
            View All Projects
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </section>
  )
}
