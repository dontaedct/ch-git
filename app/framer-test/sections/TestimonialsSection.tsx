'use client'

import { Star, Quote } from 'lucide-react'

export function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Product Designer',
      company: 'Google',
      avatar: '/api/placeholder/64/64',
      content: 'MyApp has completely transformed how I approach design. The AI features save me hours every week, and the collaboration tools make working with my team seamless.',
      rating: 5
    },
    {
      name: 'Marcus Johnson',
      role: 'Frontend Developer',
      company: 'Netflix',
      avatar: '/api/placeholder/64/64',
      content: 'The code generation feature is incredible. I can go from design to production-ready React components in minutes. It\'s like having a senior developer on my team.',
      rating: 5
    },
    {
      name: 'Elena Rodriguez',
      role: 'UX Designer',
      company: 'Airbnb',
      avatar: '/api/placeholder/64/64',
      content: 'The mobile-first design tools are exactly what I needed. Being able to preview and test interactions across devices has improved our user experience significantly.',
      rating: 5
    },
    {
      name: 'David Kim',
      role: 'Creative Director',
      company: 'Spotify',
      avatar: '/api/placeholder/64/64',
      content: 'MyApp strikes the perfect balance between power and simplicity. Our design team can create stunning work without getting bogged down by complex tools.',
      rating: 5
    },
    {
      name: 'Lisa Wang',
      role: 'Product Manager',
      company: 'Microsoft',
      avatar: '/api/placeholder/64/64',
      content: 'The real-time collaboration features have made our design reviews so much more efficient. We can iterate faster and make better decisions together.',
      rating: 5
    },
    {
      name: 'Alex Thompson',
      role: 'Startup Founder',
      company: 'TechCorp',
      avatar: '/api/placeholder/64/64',
      content: 'As a non-designer, MyApp made it possible for me to create professional-looking designs for my startup. The learning curve was minimal, and the results speak for themselves.',
      rating: 5
    }
  ]

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Loved by designers and developers
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See what our community has to say about their experience with MyApp.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="group relative bg-white p-8 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 w-8 h-8 text-blue-100 group-hover:text-blue-200 transition-colors duration-300">
                <Quote className="w-full h-full" />
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Content */}
              <blockquote className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-4">
                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 pt-20 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-gray-900 mb-2">50K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-900 mb-2">1M+</div>
              <div className="text-gray-600">Projects Created</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-900 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-900 mb-2">4.9/5</div>
              <div className="text-gray-600">User Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
