/**
 * @fileoverview Modern Fluid Intake Questionnaire
 * Typeform-inspired multi-step questionnaire with smooth transitions
 * 3 steps, 2-3 questions each, fluid animations
 */
"use client";

import { createClientIntake } from "./actions";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Rocket,
  Clock,
  DollarSign,
  Users,
  Zap,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Building,
  Target,
  Calendar,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function ModernIntakePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    email: '',
    full_name: '',
    industry: '',
    company_size: '',
    primary_challenges: '',
    primary_goals: '',
    budget_range: '',
    timeline: '',
    privacy_consent: false,
    marketing_consent: false
  });

  const totalSteps = 3;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formDataObj = new FormData();

      // Map the form data to match the expected schema
      const mappedData = {
        ...formData,
        name: formData.full_name, // Add name field for backward compatibility
        consent: formData.privacy_consent, // Map privacy_consent to consent
        phone: '', // Add empty phone field since it's optional
      };

      Object.entries(mappedData).forEach(([key, value]) => {
        formDataObj.append(key, value.toString());
      });

      const result = await createClientIntake(formDataObj);

      if (result && 'ok' in result && result.ok) {
        // Success - redirect to success page or show success message
        window.location.href = '/clients';
      } else {
        // Handle error
        console.error('Form submission failed:', result);
        alert('There was an error submitting your form. Please try again.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('There was an error submitting your form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.company_name && formData.full_name && formData.email;
      case 1:
        return formData.industry && formData.company_size && formData.primary_challenges;
      case 2:
        return formData.primary_goals && formData.budget_range && formData.timeline && formData.privacy_consent;
      default:
        return false;
    }
  };

  // Industry options
  const industries = [
    { value: "technology", label: "Technology/Software", icon: "💻" },
    { value: "healthcare", label: "Healthcare", icon: "🏥" },
    { value: "finance", label: "Financial Services", icon: "💰" },
    { value: "retail", label: "Retail/E-commerce", icon: "🛍️" },
    { value: "manufacturing", label: "Manufacturing", icon: "🏭" },
    { value: "consulting", label: "Consulting", icon: "📊" },
    { value: "education", label: "Education", icon: "🎓" },
    { value: "nonprofit", label: "Non-profit", icon: "❤️" },
    { value: "other", label: "Other", icon: "🏢" }
  ];

  // Company sizes
  const companySizes = [
    { value: "solo", label: "Solo (just me)", icon: "👤" },
    { value: "small", label: "Small (2-10 people)", icon: "👥" },
    { value: "medium", label: "Medium (11-50 people)", icon: "👫" },
    { value: "large", label: "Large (51-200 people)", icon: "🏢" },
    { value: "enterprise", label: "Enterprise (200+ people)", icon: "🏛️" }
  ];

  // Challenges
  const challenges = [
    { value: "growth", label: "Scaling & Growth", icon: "📈" },
    { value: "efficiency", label: "Operational Efficiency", icon: "⚡" },
    { value: "technology", label: "Digital Transformation", icon: "🔄" },
    { value: "team", label: "Team Management", icon: "👨‍💼" },
    { value: "marketing", label: "Customer Acquisition", icon: "🎯" },
    { value: "finance", label: "Financial Management", icon: "💹" },
    { value: "compliance", label: "Compliance", icon: "📋" }
  ];

  // Goals
  const goals = [
    { value: "revenue-growth", label: "Revenue Growth", icon: "💰" },
    { value: "cost-reduction", label: "Cost Reduction", icon: "📉" },
    { value: "market-expansion", label: "Market Expansion", icon: "🌍" },
    { value: "product-development", label: "Product Development", icon: "🚀" },
    { value: "automation", label: "Process Automation", icon: "🤖" },
    { value: "customer-satisfaction", label: "Customer Experience", icon: "⭐" }
  ];

  // Pricing tiers
  const pricingTiers = [
    {
      range: 'under-5k',
      label: 'Basic',
      price: '$2,000 - $5,000',
      description: 'Core features, 5-day delivery',
      icon: '🚀'
    },
    {
      range: '5k-15k',
      label: 'Professional',
      price: '$5,000 - $15,000',
      description: 'Advanced features, 4-day delivery',
      icon: '⚡'
    },
    {
      range: '15k-50k',
      label: 'Business',
      price: '$15,000+',
      description: 'Full customization, 3-day delivery',
      icon: '👑'
    }
  ];

  // Timeline options
  const timelines = [
    { value: "immediately", label: "Immediately", icon: "🔥" },
    { value: "within-month", label: "Within 1 month", icon: "📅" },
    { value: "within-quarter", label: "Within 3 months", icon: "🗓️" },
    { value: "planning", label: "Just planning", icon: "💭" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <div className="absolute top-6 left-6 z-10">
        <Button variant="ghost" onClick={() => window.location.href = '/clients'}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Clients
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className="absolute top-6 right-6 z-10">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{currentStep + 1} of {totalSteps}</span>
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  i <= currentStep ? "bg-primary" : "bg-gray-300"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen px-6 py-12">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
              <Rocket className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Start Your Micro-App Project</h1>
            <p className="text-xl text-muted-foreground">
              Quick project scoping for rapid micro-app delivery
            </p>

            {/* Value Props */}
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-sm">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">≤7 Days Delivery</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-sm">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">$2k-5k Projects</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-sm">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">AI-Assisted</span>
              </div>
            </div>
          </motion.div>

          {/* Question Container */}
          <motion.div
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 dark:border-gray-700/50 p-8 md:p-12"
            layout
          >
            <AnimatePresence mode="wait">
              {/* Step 1: Basic Information */}
              {currentStep === 0 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-3">
                      <Users className="w-6 h-6 text-primary" />
                      Tell us about yourself
                    </h2>
                    <p className="text-muted-foreground">Let's start with the basics</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="company_name" className="text-base font-medium">
                        What's your company name? *
                      </Label>
                      <Input
                        id="company_name"
                        placeholder="e.g., Acme Corp"
                        value={formData.company_name}
                        onChange={(e) => updateFormData('company_name', e.target.value)}
                        className="text-lg p-4 h-12 border-2 focus:border-primary transition-colors"
                        autoFocus
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="full_name" className="text-base font-medium">
                        And your name? *
                      </Label>
                      <Input
                        id="full_name"
                        placeholder="e.g., John Smith"
                        value={formData.full_name}
                        onChange={(e) => updateFormData('full_name', e.target.value)}
                        className="text-lg p-4 h-12 border-2 focus:border-primary transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-base font-medium">
                        What's your email address? *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@acme.com"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        className="text-lg p-4 h-12 border-2 focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Business Context */}
              {currentStep === 1 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-3">
                      <Building className="w-6 h-6 text-primary" />
                      About your business
                    </h2>
                    <p className="text-muted-foreground">Help us understand your context</p>
                  </div>

                  <div className="space-y-8">
                    {/* Industry */}
                    <div className="space-y-4">
                      <Label className="text-base font-medium">What industry are you in? *</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {industries.map((industry) => (
                          <button
                            key={industry.value}
                            onClick={() => updateFormData('industry', industry.value)}
                            className={cn(
                              "p-4 rounded-xl border-2 transition-all duration-200 text-left hover:scale-105 hover:shadow-md",
                              formData.industry === industry.value
                                ? "border-primary bg-primary/10 shadow-md"
                                : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                            )}
                          >
                            <div className="text-2xl mb-2">{industry.icon}</div>
                            <div className="font-medium text-sm">{industry.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Company Size */}
                    <div className="space-y-4">
                      <Label className="text-base font-medium">How big is your team? *</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {companySizes.map((size) => (
                          <button
                            key={size.value}
                            onClick={() => updateFormData('company_size', size.value)}
                            className={cn(
                              "p-4 rounded-xl border-2 transition-all duration-200 text-left hover:scale-105 hover:shadow-md flex items-center gap-3",
                              formData.company_size === size.value
                                ? "border-primary bg-primary/10 shadow-md"
                                : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                            )}
                          >
                            <div className="text-2xl">{size.icon}</div>
                            <div className="font-medium">{size.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Primary Challenge */}
                    <div className="space-y-4">
                      <Label className="text-base font-medium">What's your main challenge? *</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {challenges.map((challenge) => (
                          <button
                            key={challenge.value}
                            onClick={() => updateFormData('primary_challenges', challenge.value)}
                            className={cn(
                              "p-4 rounded-xl border-2 transition-all duration-200 text-left hover:scale-105 hover:shadow-md flex items-center gap-3",
                              formData.primary_challenges === challenge.value
                                ? "border-primary bg-primary/10 shadow-md"
                                : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                            )}
                          >
                            <div className="text-2xl">{challenge.icon}</div>
                            <div className="font-medium">{challenge.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Project Details */}
              {currentStep === 2 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-3">
                      <Target className="w-6 h-6 text-primary" />
                      Project details
                    </h2>
                    <p className="text-muted-foreground">Let's plan your micro-app</p>
                  </div>

                  <div className="space-y-8">
                    {/* Primary Goal */}
                    <div className="space-y-4">
                      <Label className="text-base font-medium">What's your primary goal? *</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {goals.map((goal) => (
                          <button
                            key={goal.value}
                            onClick={() => updateFormData('primary_goals', goal.value)}
                            className={cn(
                              "p-4 rounded-xl border-2 transition-all duration-200 text-left hover:scale-105 hover:shadow-md flex items-center gap-3",
                              formData.primary_goals === goal.value
                                ? "border-primary bg-primary/10 shadow-md"
                                : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                            )}
                          >
                            <div className="text-2xl">{goal.icon}</div>
                            <div className="font-medium">{goal.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Budget Range */}
                    <div className="space-y-4">
                      <Label className="text-base font-medium">What's your investment range? *</Label>
                      <div className="grid grid-cols-1 gap-3">
                        {pricingTiers.map((tier) => (
                          <button
                            key={tier.range}
                            onClick={() => updateFormData('budget_range', tier.range)}
                            className={cn(
                              "p-6 rounded-xl border-2 transition-all duration-200 text-left hover:scale-105 hover:shadow-md",
                              formData.budget_range === tier.range
                                ? "border-primary bg-primary/10 shadow-md"
                                : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                            )}
                          >
                            <div className="flex items-center gap-4">
                              <div className="text-3xl">{tier.icon}</div>
                              <div className="flex-1">
                                <div className="font-bold text-lg">{tier.label}</div>
                                <div className="text-primary font-semibold">{tier.price}</div>
                                <div className="text-sm text-muted-foreground">{tier.description}</div>
                              </div>
                              {formData.budget_range === tier.range && (
                                <CheckCircle2 className="w-6 h-6 text-primary" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-4">
                      <Label className="text-base font-medium">When would you like to start? *</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {timelines.map((timeline) => (
                          <button
                            key={timeline.value}
                            onClick={() => updateFormData('timeline', timeline.value)}
                            className={cn(
                              "p-4 rounded-xl border-2 transition-all duration-200 text-center hover:scale-105 hover:shadow-md",
                              formData.timeline === timeline.value
                                ? "border-primary bg-primary/10 shadow-md"
                                : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                            )}
                          >
                            <div className="text-2xl mb-2">{timeline.icon}</div>
                            <div className="font-medium text-sm">{timeline.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Consent */}
                    <div className="space-y-4 pt-6 border-t">
                      <div className="space-y-3">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <Checkbox
                            checked={formData.privacy_consent}
                            onCheckedChange={(checked) => updateFormData('privacy_consent', !!checked)}
                            className="mt-1"
                          />
                          <div className="text-sm">
                            I agree to the{" "}
                            <Link href="/privacy" className="text-primary hover:underline font-medium">
                              Privacy Policy
                            </Link>
                            {" "}and processing of my information for project development. *
                          </div>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer">
                          <Checkbox
                            checked={formData.marketing_consent}
                            onCheckedChange={(checked) => updateFormData('marketing_consent', !!checked)}
                            className="mt-1"
                          />
                          <div className="text-sm text-muted-foreground">
                            Keep me updated on project progress and related services (optional)
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-8 border-t">
              <Button
                variant="ghost"
                onClick={prevStep}
                disabled={currentStep === 0}
                className={cn(
                  "transition-opacity",
                  currentStep === 0 ? "opacity-0 pointer-events-none" : "opacity-100"
                )}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <div className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {totalSteps}
              </div>

              <Button
                onClick={nextStep}
                disabled={!canProceed() || isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Starting...
                  </>
                ) : currentStep === totalSteps - 1 ? (
                  <>
                    <Rocket className="w-4 h-4 mr-2" />
                    Start Project
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}