'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LandingHero } from '@/components/consultation/landing-hero'
import { LeadCapture } from '@/components/consultation/lead-capture'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle,
  Star,
  Clock,
  Users,
  TrendingUp,
  Target,
  Award,
  Zap,
  Shield,
  Lightbulb
} from 'lucide-react'
import { toast } from 'sonner'
import { emitLeadCaptured } from '@/lib/webhooks/emitter-client'
import { useConsultationStore } from '@/lib/consultation/state-manager'
import { initializeConversionTracking, trackPageView } from '@/lib/consultation/conversion-tracking'

interface LeadFormData {
  name: string
  email: string
  company: string
  phone?: string
}

export default function ConsultationLanding() {
  const router = useRouter()
  const { createSession } = useConsultationStore()
  const [isLoading, setIsLoading] = useState(false)

  // Initialize conversion tracking
  useEffect(() => {
    initializeConversionTracking()
    trackPageView({
      page: 'consultation-landing',
      source: 'direct'
    })
  }, [])

  const handleGetStarted = () => {
    // Scroll to lead capture form
    const formElement = document.getElementById('lead-capture-form')
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const handleLeadSubmit = async (formData: LeadFormData) => {
    setIsLoading(true)

    try {
      // Create consultation session
      const session = createSession(formData)

      // Emit lead captured event
      await emitLeadCaptured({
        email: formData.email,
        name: formData.name,
        company: formData.company,
        phone: formData.phone,
        source: 'consultation-landing',
        userId: 'demo-user' // TODO: Get from auth context
      })

      console.log('Lead captured and session created:', session.id)

      // Navigate to questionnaire
      router.push('/consultation/questionnaire')
    } catch (error) {
      console.error('Failed to capture lead:', error)
      toast.error('Something went wrong. Please try again.')
      throw error // Re-throw to let LeadCapture handle the error state
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Enhanced Hero Section */}
      <LandingHero onGetStarted={handleGetStarted} />

      {/* Enhanced Lead Capture Form */}
      <div id="lead-capture-form">
        <LeadCapture onSubmit={handleLeadSubmit} isLoading={isLoading} />
      </div>

      {/* Trust & Security Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Trusted by Industry Leaders
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <Shield className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                100% Secure & Confidential
              </h3>
              <p className="text-gray-600 text-sm">
                Enterprise-grade security protects your business information
              </p>
            </div>

            <div className="flex flex-col items-center">
              <Award className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Proven Methodology
              </h3>
              <p className="text-gray-600 text-sm">
                Strategies tested across 500+ successful companies
              </p>
            </div>

            <div className="flex flex-col items-center">
              <Lightbulb className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                AI-Powered Insights
              </h3>
              <p className="text-gray-600 text-sm">
                Advanced algorithms analyze your unique business situation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about your free consultation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                question: "How long does the assessment take?",
                answer: "The assessment takes just 5-10 minutes to complete. You'll get your personalized consultation immediately after."
              },
              {
                question: "Is this really free?",
                answer: "Yes, completely free. No hidden fees, no credit card required. We provide value upfront to build trust."
              },
              {
                question: "What makes this AI-powered?",
                answer: "Our advanced algorithms analyze thousands of business patterns to provide insights tailored specifically to your industry and situation."
              },
              {
                question: "Will I be contacted by salespeople?",
                answer: "We'll only follow up with your consultation results and optional resources. No aggressive sales tactics, ever."
              }
            ].map((faq, index) => (
              <Card key={index} className="border-0 bg-white shadow-sm">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}