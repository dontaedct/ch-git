'use client'

import { Users, Target, Clock, Award } from 'lucide-react'

export function AboutSection() {
  const values = [
    {
      icon: Target,
      title: 'Small Business Focus',
      description: 'We understand the unique challenges and opportunities that small businesses face in today\'s competitive market.'
    },
    {
      icon: Clock,
      title: 'Rapid Delivery',
      description: 'Our streamlined process ensures you get your automation solution in 7 days or less, without compromising quality.'
    },
    {
      icon: Users,
      title: 'Personal Service',
      description: 'As a small team, we provide personalized attention and direct communication throughout your project.'
    },
    {
      icon: Award,
      title: 'Quality First',
      description: 'We use proven technologies and best practices to ensure your automation solution is reliable and scalable.'
    }
  ]

  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            About Automation DCT
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're a small, focused team dedicated to helping small businesses automate their operations 
            and achieve greater efficiency through custom web app solutions.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left Column - Story */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Story</h3>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Automation DCT was founded with a simple mission: to help small businesses compete 
                with larger companies by providing affordable, custom automation solutions.
              </p>
              <p>
                We understand that small businesses often struggle with limited resources and manual 
                processes that eat up valuable time. That's why we've developed a streamlined approach 
                to deliver custom web app automations in just 7 days.
              </p>
              <p>
                Our team combines technical expertise with deep understanding of small business 
                operations, ensuring that every solution we create addresses real business needs 
                and delivers measurable results.
              </p>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="text-sm text-gray-500">Automation DCT Dashboard</div>
                </div>
                
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">Projects</span>
                    </div>
                    <div className="h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 font-semibold text-sm">Clients</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {values.map((value, index) => (
            <div
              key={value.title}
              className="text-center p-6 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <value.icon className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">{value.title}</h4>
              <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>

        {/* Team Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Small team, big impact. We're passionate about helping small businesses succeed through automation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                JD
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">John Doe</h4>
              <p className="text-blue-600 text-sm mb-2">Founder & Lead Developer</p>
              <p className="text-gray-600 text-sm">10+ years in business automation and web development</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                JS
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Jane Smith</h4>
              <p className="text-blue-600 text-sm mb-2">Business Analyst</p>
              <p className="text-gray-600 text-sm">Expert in small business operations and process optimization</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                MJ
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Mike Johnson</h4>
              <p className="text-blue-600 text-sm mb-2">UI/UX Designer</p>
              <p className="text-gray-600 text-sm">Creating intuitive interfaces that users love to work with</p>
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="text-center mt-20">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Mission</h3>
            <p className="text-xl text-gray-600 leading-relaxed">
              "To empower small businesses with custom automation solutions that level the playing field, 
              reduce operational costs, and enable growth through increased efficiency and productivity."
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
