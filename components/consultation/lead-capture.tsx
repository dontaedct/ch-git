'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight,
  CheckCircle,
  Lock,
  Clock,
  Star,
  Sparkles,
  TrendingUp,
  Shield,
  Users,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'
import { useConversionTracking } from '@/lib/consultation/conversion-tracking'

interface LeadCaptureFormData {
  name: string
  email: string
  company: string
  phone?: string
}

interface LeadCaptureProps {
  onSubmit: (data: LeadCaptureFormData) => Promise<void>
  isLoading?: boolean
}

interface ValidationErrors {
  name?: string
  email?: string
  company?: string
  phone?: string
}

export function LeadCapture({ onSubmit, isLoading = false }: LeadCaptureProps) {
  const { trackFormStart, trackFormSubmit, trackFormError, generateVariant } = useConversionTracking()

  const [formData, setFormData] = useState<LeadCaptureFormData>({
    name: '',
    email: '',
    company: '',
    phone: ''
  })

  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [formVariant, setFormVariant] = useState<'standard' | 'social-proof'>('standard')
  const [hasStarted, setHasStarted] = useState(false)

  const formRef = useRef<HTMLFormElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  // A/B testing variant
  useEffect(() => {
    const variant = generateVariant('form_test', ['standard', 'social-proof']) as 'standard' | 'social-proof'
    setFormVariant(variant)
  }, [generateVariant])

  // Auto-focus name field after short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      nameInputRef.current?.focus()
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const validateField = (field: keyof LeadCaptureFormData, value: string): string | undefined => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Name is required'
        if (value.trim().length < 2) return 'Name must be at least 2 characters'
        return undefined

      case 'email':
        if (!value.trim()) return 'Email is required'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) return 'Please enter a valid email address'
        return undefined

      case 'company':
        if (!value.trim()) return 'Company name is required'
        if (value.trim().length < 2) return 'Company name must be at least 2 characters'
        return undefined

      case 'phone':
        if (value && value.trim()) {
          const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
          if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
            return 'Please enter a valid phone number'
          }
        }
        return undefined

      default:
        return undefined
    }
  }

  const handleInputChange = (field: keyof LeadCaptureFormData, value: string) => {
    // Track form start on first interaction
    if (!hasStarted) {
      setHasStarted(true)
      trackFormStart('lead-capture-form', { variant: formVariant })
    }

    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }

    // Real-time validation for better UX
    if (touched[field]) {
      const error = validateField(field, value)
      if (error) {
        setErrors(prev => ({ ...prev, [field]: error }))
      }
    }
  }

  const handleBlur = (field: keyof LeadCaptureFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const error = validateField(field, formData[field])
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    // Validate required fields
    const nameError = validateField('name', formData.name)
    if (nameError) newErrors.name = nameError

    const emailError = validateField('email', formData.email)
    if (emailError) newErrors.email = emailError

    const companyError = validateField('company', formData.company)
    if (companyError) newErrors.company = companyError

    // Validate optional phone if provided
    const phoneError = validateField('phone', formData.phone || '')
    if (phoneError) newErrors.phone = phoneError

    setErrors(newErrors)
    setTouched({
      name: true,
      email: true,
      company: true,
      phone: true
    })

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      const errorFields = Object.keys(errors)
      trackFormError('lead-capture-form', errors)
      toast.error('Please fix the errors below')

      // Focus first error field
      if (errorFields.length > 0) {
        const firstErrorField = errorFields[0]
        const errorElement = formRef.current?.querySelector(`[name="${firstErrorField}"]`) as HTMLElement
        errorElement?.focus()
      }
      return
    }

    try {
      trackFormSubmit('lead-capture-form', {
        ...formData,
        variant: formVariant,
        timeToSubmit: Date.now()
      })

      await onSubmit(formData)
      toast.success('Great! Starting your consultation...')
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error('Something went wrong. Please try again.')
    }
  }

  const progressPercentage = () => {
    const fields = ['name', 'email', 'company']
    const completed = fields.filter(field => formData[field as keyof LeadCaptureFormData].trim()).length
    return Math.round((completed / fields.length) * 100)
  }

  const isFormValid = () => {
    return formData.name.trim() && formData.email.trim() && formData.company.trim() && Object.keys(errors).length === 0
  }

  const testimonials = [
    {
      text: "This consultation identified $2M in untapped revenue opportunities.",
      author: "Sarah Chen",
      company: "TechFlow Solutions",
      role: "CEO"
    },
    {
      text: "The AI insights were spot-on. We implemented their recommendations and grew 150%.",
      author: "Marcus Rodriguez",
      company: "Verde Marketing",
      role: "Founder"
    },
    {
      text: "Finally, actionable advice that actually works. Our efficiency improved by 40%.",
      author: "Emily Foster",
      company: "InnovateLab",
      role: "COO"
    }
  ]

  const currentTestimonial = testimonials[Math.floor(Math.random() * testimonials.length)]

  return (
    <section className="py-16 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Form Section */}
          <div className="order-2 lg:order-1">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-4">
                  <Badge variant="secondary" className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-0">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Free Business Assessment
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Get Your Personalized Growth Strategy
                </CardTitle>
                <CardDescription className="text-base text-gray-600">
                  {formVariant === 'social-proof'
                    ? 'Join 500+ companies that have accelerated their growth'
                    : 'Discover opportunities that will transform your business'
                  }
                </CardDescription>

                {/* Progress Bar */}
                {hasStarted && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Assessment Progress</span>
                      <span>{progressPercentage()}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage()}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardHeader>

              <CardContent>
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Full Name *
                    </Label>
                    <Input
                      ref={nameInputRef}
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      onBlur={() => handleBlur('name')}
                      placeholder="John Smith"
                      className={`h-12 text-base ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-blue-500`}
                      disabled={isLoading}
                      autoComplete="name"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <span className="w-4 h-4">⚠️</span>
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Business Email *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      placeholder="john@company.com"
                      className={`h-12 text-base ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-blue-500`}
                      disabled={isLoading}
                      autoComplete="email"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <span className="w-4 h-4">⚠️</span>
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Company Field */}
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-sm font-medium text-gray-700">
                      Company Name *
                    </Label>
                    <Input
                      id="company"
                      name="company"
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      onBlur={() => handleBlur('company')}
                      placeholder="Your Company Inc."
                      className={`h-12 text-base ${errors.company ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-blue-500`}
                      disabled={isLoading}
                      autoComplete="organization"
                    />
                    {errors.company && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <span className="w-4 h-4">⚠️</span>
                        {errors.company}
                      </p>
                    )}
                  </div>

                  {/* Phone Field (Optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      Phone Number (Optional)
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      onBlur={() => handleBlur('phone')}
                      placeholder="+1 (555) 123-4567"
                      className={`h-12 text-base ${errors.phone ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-blue-500`}
                      disabled={isLoading}
                      autoComplete="tel"
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <span className="w-4 h-4">⚠️</span>
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isLoading || !isFormValid()}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Starting Your Assessment...
                      </div>
                    ) : (
                      <>
                        Start My Free Assessment
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>

                  {/* Trust Indicators */}
                  <div className="flex items-center justify-center gap-6 pt-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      <span>100% Secure</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>5 Min Setup</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      <span>Instant Results</span>
                    </div>
                  </div>

                  {/* Privacy Notice */}
                  <p className="text-xs text-gray-500 text-center leading-relaxed">
                    By submitting this form, you agree to receive follow-up communications about your consultation results.
                    We respect your privacy and will never share your information.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Benefits/Social Proof Section */}
          <div className="order-1 lg:order-2 space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                What You'll Discover in Your Assessment
              </h2>

              <div className="space-y-4">
                {[
                  {
                    icon: <TrendingUp className="w-5 h-5 text-green-600" />,
                    title: 'Hidden Revenue Opportunities',
                    description: 'Identify untapped income streams specific to your business model'
                  },
                  {
                    icon: <Target className="w-5 h-5 text-blue-600" />,
                    title: 'Competitive Advantages',
                    description: 'Discover what sets you apart and how to leverage it for growth'
                  },
                  {
                    icon: <Users className="w-5 h-5 text-purple-600" />,
                    title: 'Team & Operations Optimization',
                    description: 'Streamline processes and maximize your team\'s potential'
                  },
                  {
                    icon: <Zap className="w-5 h-5 text-orange-600" />,
                    title: 'Quick-Win Action Items',
                    description: 'Get specific steps you can implement immediately'
                  }
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-white/60 rounded-lg">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonial */}
            {formVariant === 'social-proof' && (
              <Card className="border-0 bg-white/60 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 italic mb-4">
                    "{currentTestimonial.text}"
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {currentTestimonial.author.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {currentTestimonial.author}
                      </p>
                      <p className="text-gray-600 text-xs">
                        {currentTestimonial.role}, {currentTestimonial.company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}