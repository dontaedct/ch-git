'use client'

import React, { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  Target,
  Clock,
  CheckCircle,
  Zap,
  Award,
  BarChart3,
  Users,
  Lightbulb,
  Rocket
} from 'lucide-react'
import { trackCTAClick, useConversionTracking } from '@/lib/consultation/conversion-tracking'

interface LandingHeroProps {
  onGetStarted: () => void
}

interface StatData {
  number: string
  label: string
  description: string
  icon: React.ReactNode
}

export function LandingHero({ onGetStarted }: LandingHeroProps) {
  const { generateVariant } = useConversionTracking()
  const [heroVariant, setHeroVariant] = useState<'a' | 'b'>('a')
  const [ctaVariant, setCTAVariant] = useState<'primary' | 'urgency'>('primary')

  // A/B testing variants
  useEffect(() => {
    const variant = generateVariant('hero_test', ['a', 'b']) as 'a' | 'b'
    const ctaVar = generateVariant('cta_test', ['primary', 'urgency']) as 'primary' | 'urgency'
    setHeroVariant(variant)
    setCTAVariant(ctaVar)
  }, [generateVariant])

  const handleGetStarted = () => {
    trackCTAClick('hero-cta', getCtaText(), 'hero-section')
    onGetStarted()
  }

  const getCtaText = () => {
    if (ctaVariant === 'urgency') {
      return 'Get My Free Business Analysis'
    }
    return 'Start My Free Consultation'
  }

  const stats: StatData[] = [
    {
      number: '2.8x',
      label: 'Average Revenue Growth',
      description: 'Within 12 months of implementation',
      icon: <TrendingUp className="w-6 h-6 text-green-600" />
    },
    {
      number: '94%',
      label: 'Success Rate',
      description: 'Clients achieve primary goals',
      icon: <Target className="w-6 h-6 text-blue-600" />
    },
    {
      number: '5 min',
      label: 'Assessment Time',
      description: 'Get results in minutes, not months',
      icon: <Clock className="w-6 h-6 text-purple-600" />
    },
    {
      number: '500+',
      label: 'Companies Helped',
      description: 'Across every industry',
      icon: <Award className="w-6 h-6 text-orange-600" />
    }
  ]

  const benefits = [
    {
      icon: <Lightbulb className="w-5 h-5" />,
      title: 'AI-Powered Insights',
      description: 'Advanced analysis reveals hidden opportunities in your business'
    },
    {
      icon: <Rocket className="w-5 h-5" />,
      title: 'Actionable Roadmap',
      description: 'Get specific steps to achieve your growth goals'
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: 'Personalized Strategy',
      description: 'Tailored recommendations based on your unique situation'
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Expert Guidance',
      description: 'Strategies developed by top business consultants'
    }
  ]

  const heroContent = {
    a: {
      headline: 'Transform Your Business with AI-Powered Strategy',
      subheadline: 'Get personalized growth recommendations that drive real results',
      description: 'Our AI consultant analyzes your business and delivers a custom strategy in minutes. Join 500+ companies that have accelerated their growth with our proven methodology.'
    },
    b: {
      headline: 'Unlock Hidden Growth Opportunities in Your Business',
      subheadline: 'Stop guessing. Start growing with data-driven insights.',
      description: 'Discover the specific strategies that will drive your business forward. Our AI-powered assessment reveals opportunities you never knew existed.'
    }
  }

  const content = heroContent[heroVariant]

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {/* Main Hero Content */}
        <div className="text-center space-y-8 mb-16">
          {/* Badge */}
          <div className="flex justify-center">
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium bg-white/80 backdrop-blur-sm border-0 shadow-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Business Consultation
            </Badge>
          </div>

          {/* Headlines */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              {content.headline}
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 font-medium">
              {content.subheadline}
            </p>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {content.description}
            </p>
          </div>

          {/* CTA Section */}
          <div className="space-y-4">
            <Button
              size="xl"
              className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={handleGetStarted}
            >
              {getCtaText()}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>100% Free Assessment</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Results in 5 Minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-600" />
                <span>No Commitment Required</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center border-0 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-3">
                  {stat.icon}
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                  {stat.number}
                </div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-gray-500">
                  {stat.description}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits Grid */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Business Leaders Choose Our AI Consultation
            </h2>
            <p className="text-lg text-gray-600">
              Get the strategic advantage that drives measurable business growth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-0 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 group">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      {React.cloneElement(benefit.icon as React.ReactElement, {
                        className: 'w-5 h-5 text-blue-600'
                      })}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Secondary CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm">
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">
                Ready to accelerate your business growth?
              </p>
              <p className="text-xs text-gray-600">
                Join hundreds of successful companies
              </p>
            </div>
            <Button
              variant="outline"
              className="shrink-0 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold"
              onClick={handleGetStarted}
            >
              Start Assessment
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-500 mb-4">
            Trusted by businesses across every industry
          </p>
          <div className="flex items-center justify-center gap-8 text-gray-400">
            <div className="text-xs font-medium">SAAS</div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="text-xs font-medium">E-COMMERCE</div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="text-xs font-medium">PROFESSIONAL SERVICES</div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="text-xs font-medium">HEALTHCARE</div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="text-xs font-medium">MANUFACTURING</div>
          </div>
        </div>
      </div>
    </section>
  )
}