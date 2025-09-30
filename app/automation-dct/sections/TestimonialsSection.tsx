'use client'

import { Star, Quote } from 'lucide-react'

export function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Owner',
      company: 'Chen\'s Boutique',
      avatar: '/api/placeholder/64/64',
      content: 'Automation DCT transformed our inventory management. What used to take hours now happens automatically. Our team can focus on serving customers instead of manual data entry.',
      rating: 5
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Practice Manager',
      company: 'Sunrise Medical',
      avatar: '/api/placeholder/64/64',
      content: 'The appointment scheduling system they built for us has reduced no-shows by 40% and freed up our staff to focus on patient care. The ROI was immediate.',
      rating: 5
    },
    {
      name: 'Lisa Thompson',
      role: 'Operations Director',
      company: 'Thompson Realty',
      avatar: '/api/placeholder/64/64',
      content: 'Their lead management automation has been a game-changer. We\'re closing more deals because we never miss a follow-up opportunity. Highly recommend!',
      rating: 5
    },
    {
      name: 'David Kim',
      role: 'General Manager',
      company: 'Bella Vista Restaurant',
      avatar: '/api/placeholder/64/64',
      content: 'The inventory and ordering system they created has reduced our food waste by 30% and saved us thousands in costs. The 7-day delivery promise was kept perfectly.',
      rating: 5
    },
    {
      name: 'Elena Rodriguez',
      role: 'CEO',
      company: 'Rodriguez Consulting',
      avatar: '/api/placeholder/64/64',
      content: 'Automation DCT understood our business needs immediately. The project management and billing automation they built has streamlined our entire operation.',
      rating: 5
    },
    {
      name: 'Alex Thompson',
      role: 'Plant Manager',
      company: 'Precision Manufacturing',
      avatar: '/api/placeholder/64/64',
      content: 'The quality control automation system has improved our defect detection by 90%. We\'re producing higher quality products with less manual inspection.',
      rating: 5
    }
  ]

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            What Our Clients Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it. Here's what small business owners say about their automation experience with us.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="group relative bg-white p-8 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-2"
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
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-4">
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
              <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">Successful Projects</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-gray-600">On-Time Delivery</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">5.0</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">7</div>
              <div className="text-gray-600">Days Average Delivery</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-12 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Join Our Success Stories?
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Let's discuss how we can help automate your business operations and achieve similar results.
            </p>
            <button className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors duration-200 font-semibold text-lg">
              Get Your Free Consultation
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
