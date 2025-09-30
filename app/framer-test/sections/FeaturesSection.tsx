'use client'

import { 
  Palette, 
  Zap, 
  Users, 
  Code, 
  Smartphone, 
  Globe,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export function FeaturesSection() {
  const features = [
    {
      icon: Palette,
      title: 'Intuitive Design Tools',
      description: 'Create beautiful designs with our powerful yet simple design tools. No coding required.',
      highlights: ['Drag & drop interface', 'Real-time collaboration', 'Advanced typography']
    },
    {
      icon: Zap,
      title: 'AI-Powered Features',
      description: 'Leverage artificial intelligence to speed up your design process and create better results.',
      highlights: ['Smart suggestions', 'Auto-layout', 'Content generation']
    },
    {
      icon: Code,
      title: 'Code Generation',
      description: 'Export your designs to clean, production-ready code for any platform.',
      highlights: ['React components', 'CSS/SCSS', 'Responsive design']
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work together seamlessly with your team in real-time on any project.',
      highlights: ['Live editing', 'Comments & feedback', 'Version control']
    },
    {
      icon: Smartphone,
      title: 'Mobile-First Design',
      description: 'Design for mobile first with our responsive design tools and previews.',
      highlights: ['Device previews', 'Touch interactions', 'Mobile optimization']
    },
    {
      icon: Globe,
      title: 'Publish Anywhere',
      description: 'Deploy your designs to any platform with one-click publishing.',
      highlights: ['Web hosting', 'App stores', 'Custom domains']
    }
  ]

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Everything you need to
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              design and build
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Powerful tools and features that make design accessible to everyone, 
            from beginners to professionals.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="feature-card group p-8 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 bg-white hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
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

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-12">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Ready to get started?
          </h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of designers and developers who are already creating amazing things.
          </p>
          <button className="group bg-gray-900 text-white px-8 py-4 rounded-xl hover:bg-gray-800 transition-all duration-200 font-semibold text-lg flex items-center mx-auto">
            Start Your Free Trial
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </section>
  )
}
