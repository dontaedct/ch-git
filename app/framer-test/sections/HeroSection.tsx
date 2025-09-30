'use client'

import { ArrowRight, Play, Sparkles } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4 mr-2" />
            New: Advanced AI Features
          </div>

          {/* Main Headline */}
          <h1 className="hero-title text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight mb-6">
            Design anything.
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Build everything.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="hero-subtitle text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            The modern design tool that brings your ideas to life. Create stunning websites, 
            apps, and prototypes with the power of AI and intuitive design.
          </p>

          {/* CTA Buttons */}
          <div className="cta-buttons flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button className="cta-button group bg-gray-900 text-white px-8 py-4 rounded-xl hover:bg-gray-800 transition-all duration-200 font-semibold text-lg flex items-center">
              Start Designing Free
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
            <button className="cta-button group flex items-center text-gray-700 hover:text-gray-900 transition-colors duration-200 font-semibold text-lg">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-shadow duration-200">
                <Play className="w-5 h-5 text-gray-700" />
              </div>
              Watch Demo
            </button>
          </div>

          {/* Hero Image/Visual */}
          <div className="relative max-w-5xl mx-auto">
            <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-shadow duration-500">
              {/* Mockup/Dashboard Preview */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full hover:bg-red-500 transition-colors duration-200"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full hover:bg-yellow-500 transition-colors duration-200"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full hover:bg-green-500 transition-colors duration-200"></div>
                  </div>
                  <div className="text-sm text-gray-500">MyApp Dashboard</div>
                </div>
                
                {/* Mock Content */}
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 hover:bg-gray-300 transition-colors duration-200"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 hover:bg-gray-300 transition-colors duration-200"></div>
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg hover:from-blue-200 hover:to-blue-300 transition-all duration-300"></div>
                    <div className="h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg hover:from-purple-200 hover:to-purple-300 transition-all duration-300"></div>
                    <div className="h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-lg hover:from-green-200 hover:to-green-300 transition-all duration-300"></div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500 rounded-full opacity-20 animate-pulse hover:opacity-30 transition-opacity duration-300"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-500 rounded-full opacity-20 animate-pulse delay-1000 hover:opacity-30 transition-opacity duration-300"></div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 pt-16 border-t border-gray-200">
            <p className="text-gray-500 text-sm mb-8">Trusted by teams at</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {['Google', 'Microsoft', 'Apple', 'Netflix', 'Spotify', 'Airbnb'].map((company) => (
                <div key={company} className="text-gray-400 font-semibold text-lg">
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
