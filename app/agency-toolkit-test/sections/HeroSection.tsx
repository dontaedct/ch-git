'use client'

import { ArrowRight, Play, Clock, CheckCircle, Zap } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-8">
            <Zap className="w-4 h-4 mr-2" />
            Enterprise-Grade Toolkit for Rapid Development
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight mb-6">
            Build Custom Micro-Apps
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              in 7 Days or Less
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            The DCT Micro-Apps platform is a sophisticated, enterprise-grade toolkit for rapid custom 
            micro-app development with AI-assisted development capabilities and multi-tenant architecture.
          </p>

          {/* Key Benefits */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex items-center text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="font-medium">≤7 Day Delivery</span>
            </div>
            <div className="flex items-center text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="font-medium">33-Module Template Engine</span>
            </div>
            <div className="flex items-center text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="font-medium">Enterprise-Grade Security</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button className="group bg-purple-600 text-white px-8 py-4 rounded-xl hover:bg-purple-700 transition-all duration-200 font-semibold text-lg flex items-center">
              Start Building Now
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
            <button className="group flex items-center text-gray-700 hover:text-gray-900 transition-colors duration-200 font-semibold text-lg">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-shadow duration-200">
                <Play className="w-5 h-5 text-gray-700" />
              </div>
              Watch Demo
            </button>
          </div>

          {/* Hero Image/Visual */}
          <div className="relative max-w-5xl mx-auto">
            <div className="relative bg-white rounded-2xl p-8 shadow-2xl">
              {/* Mockup/Dashboard Preview */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="text-sm text-gray-500">DCT Micro-Apps Platform</div>
                </div>
                
                {/* Mock Content */}
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="grid grid-cols-4 gap-4 mt-6">
                    <div className="h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 font-semibold text-sm">Forms</span>
                    </div>
                    <div className="h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">Modules</span>
                    </div>
                    <div className="h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 font-semibold text-sm">Workflows</span>
                    </div>
                    <div className="h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                      <span className="text-orange-600 font-semibold text-sm">Docs</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-500 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-500 rounded-full opacity-20 animate-pulse delay-1000"></div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 pt-16 border-t border-gray-200">
            <p className="text-gray-500 text-sm mb-8">Trusted by agencies and enterprises</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {['Next.js', 'Supabase', 'Vercel', 'n8n', 'Sentry', 'TypeScript'].map((tech) => (
                <div key={tech} className="text-gray-400 font-semibold text-lg">
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
