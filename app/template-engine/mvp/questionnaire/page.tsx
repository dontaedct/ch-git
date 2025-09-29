/**
 * @fileoverview MVP Questionnaire Flow Template
 * Questionnaire flow template for consultation workflow
 * HT-029.3.1 Implementation
 */
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  ArrowRight,
  User,
  Building,
  Target,
  DollarSign,
  Calendar,
  Mail,
  Phone,
  MapPin
} from "lucide-react";

interface QuestionOption {
  id: string;
  text: string;
  value: string;
  followUp?: string[];
}

interface Question {
  id: string;
  type: 'multiple-choice' | 'text' | 'number' | 'email' | 'phone' | 'select' | 'textarea';
  category: 'business' | 'goals' | 'challenges' | 'contact' | 'timeline';
  title: string;
  description?: string;
  required: boolean;
  options?: QuestionOption[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  placeholder?: string;
}

interface QuestionnaireResponse {
  questionId: string;
  value: string | string[];
  timestamp: Date;
}

interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  role: string;
}

export default function MVPQuestionnaireTemplate() {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    role: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const questions: Question[] = [
    // Contact Information
    {
      id: 'contact-name',
      type: 'text',
      category: 'contact',
      title: "What's your name?",
      description: "We'd love to know who we're speaking with",
      required: true,
      placeholder: "Enter your full name"
    },
    {
      id: 'contact-email',
      type: 'email',
      category: 'contact',
      title: "What's your email address?",
      description: "We'll send your consultation report here",
      required: true,
      placeholder: "your@email.com"
    },
    {
      id: 'contact-company',
      type: 'text',
      category: 'contact',
      title: "What's your company name?",
      description: "Tell us about your business",
      required: true,
      placeholder: "Your Company Name"
    },
    {
      id: 'contact-role',
      type: 'select',
      category: 'contact',
      title: "What's your role in the company?",
      required: true,
      options: [
        { id: 'founder', text: 'Founder/CEO', value: 'founder' },
        { id: 'executive', text: 'Executive/VP', value: 'executive' },
        { id: 'manager', text: 'Manager/Director', value: 'manager' },
        { id: 'employee', text: 'Employee', value: 'employee' },
        { id: 'consultant', text: 'Consultant', value: 'consultant' },
        { id: 'other', text: 'Other', value: 'other' }
      ]
    },
    // Business Information
    {
      id: 'business-stage',
      type: 'multiple-choice',
      category: 'business',
      title: "What stage is your business in?",
      description: "This helps us tailor our recommendations",
      required: true,
      options: [
        { id: 'startup', text: 'Startup (0-2 years)', value: 'startup' },
        { id: 'growth', text: 'Growth stage (2-5 years)', value: 'growth' },
        { id: 'established', text: 'Established (5+ years)', value: 'established' },
        { id: 'enterprise', text: 'Enterprise (large corporation)', value: 'enterprise' }
      ]
    },
    {
      id: 'business-size',
      type: 'multiple-choice',
      category: 'business',
      title: "How many employees do you have?",
      required: true,
      options: [
        { id: 'solo', text: 'Just me', value: '1' },
        { id: 'small', text: '2-10 employees', value: '2-10' },
        { id: 'medium', text: '11-50 employees', value: '11-50' },
        { id: 'large', text: '51-200 employees', value: '51-200' },
        { id: 'enterprise', text: '200+ employees', value: '200+' }
      ]
    },
    {
      id: 'business-revenue',
      type: 'multiple-choice',
      category: 'business',
      title: "What's your annual revenue range?",
      description: "This information is confidential and helps us understand your scale",
      required: true,
      options: [
        { id: 'pre-revenue', text: 'Pre-revenue', value: '0' },
        { id: 'under-100k', text: 'Under $100K', value: '<100k' },
        { id: '100k-500k', text: '$100K - $500K', value: '100k-500k' },
        { id: '500k-1m', text: '$500K - $1M', value: '500k-1m' },
        { id: '1m-5m', text: '$1M - $5M', value: '1m-5m' },
        { id: '5m-plus', text: '$5M+', value: '5m+' }
      ]
    },
    // Goals and Challenges
    {
      id: 'primary-goal',
      type: 'multiple-choice',
      category: 'goals',
      title: "What's your primary business goal right now?",
      description: "Select the most important objective",
      required: true,
      options: [
        { id: 'increase-revenue', text: 'Increase revenue', value: 'revenue' },
        { id: 'reduce-costs', text: 'Reduce costs', value: 'costs' },
        { id: 'improve-efficiency', text: 'Improve operational efficiency', value: 'efficiency' },
        { id: 'expand-market', text: 'Expand to new markets', value: 'expansion' },
        { id: 'digital-transform', text: 'Digital transformation', value: 'digital' },
        { id: 'team-growth', text: 'Build and grow team', value: 'team' }
      ]
    },
    {
      id: 'biggest-challenge',
      type: 'multiple-choice',
      category: 'challenges',
      title: "What's your biggest business challenge?",
      description: "We'll focus our consultation on addressing this",
      required: true,
      options: [
        { id: 'lead-generation', text: 'Generating quality leads', value: 'leads' },
        { id: 'sales-conversion', text: 'Converting leads to sales', value: 'conversion' },
        { id: 'customer-retention', text: 'Retaining customers', value: 'retention' },
        { id: 'operational-efficiency', text: 'Operational inefficiencies', value: 'operations' },
        { id: 'team-management', text: 'Team management', value: 'team' },
        { id: 'cash-flow', text: 'Cash flow management', value: 'cashflow' },
        { id: 'competition', text: 'Increasing competition', value: 'competition' },
        { id: 'technology', text: 'Technology and automation', value: 'technology' }
      ]
    },
    {
      id: 'timeline',
      type: 'multiple-choice',
      category: 'timeline',
      title: "When do you want to see results?",
      description: "This helps us prioritize recommendations",
      required: true,
      options: [
        { id: 'immediate', text: 'Immediately (within 30 days)', value: '30days' },
        { id: 'short-term', text: 'Short term (1-3 months)', value: '1-3months' },
        { id: 'medium-term', text: 'Medium term (3-6 months)', value: '3-6months' },
        { id: 'long-term', text: 'Long term (6+ months)', value: '6months+' }
      ]
    },
    {
      id: 'budget',
      type: 'multiple-choice',
      category: 'goals',
      title: "What's your budget for business improvements?",
      description: "This helps us recommend appropriate solutions",
      required: true,
      options: [
        { id: 'under-5k', text: 'Under $5,000', value: '<5k' },
        { id: '5k-15k', text: '$5,000 - $15,000', value: '5k-15k' },
        { id: '15k-50k', text: '$15,000 - $50,000', value: '15k-50k' },
        { id: '50k-100k', text: '$50,000 - $100,000', value: '50k-100k' },
        { id: '100k-plus', text: '$100,000+', value: '100k+' },
        { id: 'flexible', text: 'Flexible based on ROI', value: 'flexible' }
      ]
    },
    {
      id: 'additional-info',
      type: 'textarea',
      category: 'goals',
      title: "Anything else you'd like us to know?",
      description: "Share any specific challenges, goals, or context that would help us prepare",
      required: false,
      placeholder: "Optional: Tell us more about your specific situation..."
    }
  ];

  const totalSteps = questions.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleResponse = (questionId: string, value: string | string[]) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Simulate API submission
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsCompleted(true);
  };

  const isCurrentStepValid = () => {
    const currentQuestion = questions[currentStep];
    const response = responses[currentQuestion.id];

    if (currentQuestion.required) {
      return response && response !== '';
    }
    return true;
  };

  const renderQuestion = (question: Question) => {
    const response = responses[question.id];

    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <motion.div
                key={option.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    response === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleResponse(question.id, option.value)}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        response === option.value
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {response === option.value && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                      )}
                    </div>
                    <span className="font-medium text-gray-900">{option.text}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 'select':
        return (
          <select
            value={response as string || ''}
            onChange={(e) => handleResponse(question.id, e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
          >
            <option value="">Select an option...</option>
            {question.options?.map((option) => (
              <option key={option.id} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            value={response as string || ''}
            onChange={(e) => handleResponse(question.id, e.target.value)}
            placeholder={question.placeholder}
            rows={4}
            className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
          />
        );

      default:
        return (
          <input
            type={question.type}
            value={response as string || ''}
            onChange={(e) => handleResponse(question.id, e.target.value)}
            placeholder={question.placeholder}
            className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        );
    }
  };

  const getCategoryIcon = (category: string) => {
    const iconMap = {
      contact: <User className="h-5 w-5" />,
      business: <Building className="h-5 w-5" />,
      goals: <Target className="h-5 w-5" />,
      challenges: <DollarSign className="h-5 w-5" />,
      timeline: <Calendar className="h-5 w-5" />
    };
    return iconMap[category as keyof typeof iconMap] || <CheckCircle className="h-5 w-5" />;
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl w-full"
        >
          <Card className="text-center">
            <CardContent className="p-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="h-10 w-10 text-green-600" />
              </motion.div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Thank You!
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Your consultation request has been submitted successfully. We'll analyze your responses and send you a personalized strategy report within 24 hours.
              </p>
              <div className="bg-blue-50 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
                <div className="space-y-2 text-left">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-sm text-blue-800">We'll review your responses and prepare a custom analysis</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-sm text-blue-800">You'll receive a detailed strategy report within 24 hours</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-sm text-blue-800">We'll schedule a follow-up call to discuss your options</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <Link href="/template-engine/mvp/results">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    View Sample Report
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/template-engine/mvp/landing">
                  <Button variant="outline" className="w-full">
                    Back to Landing Page
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (isEditing) {
    // Questionnaire Configuration Mode
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">MVP Questionnaire Template</h1>
              <p className="text-gray-600 mt-2">
                Configure your consultation questionnaire flow
              </p>
            </div>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Preview Mode
              </Button>
              <Link href="/template-engine">
                <Button variant="outline">Back to Engine</Button>
              </Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Questionnaire Configuration</CardTitle>
                <CardDescription>
                  Customize the questions and flow for your consultation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4">Question Categories</h3>
                    <div className="space-y-3">
                      {['contact', 'business', 'goals', 'challenges', 'timeline'].map((category) => (
                        <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getCategoryIcon(category)}
                            <span className="font-medium capitalize">{category}</span>
                          </div>
                          <Badge variant="secondary">
                            {questions.filter(q => q.category === category).length} questions
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Template Status</CardTitle>
                <CardDescription>
                  Current questionnaire configuration and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Questions</span>
                    <Badge variant="secondary">{questions.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Estimated Time</span>
                    <Badge variant="secondary">5-7 minutes</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Completion Rate</span>
                    <Badge className="bg-green-100 text-green-800">87%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Mobile Optimized</span>
                    <Badge className="bg-green-100 text-green-800">Yes</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/template-engine/mvp/landing" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Landing</span>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Edit Template
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mx-auto max-w-2xl">
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      {getCategoryIcon(questions[currentStep].category)}
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {questions[currentStep].category}
                    </Badge>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {questions[currentStep].title}
                  </h1>
                  {questions[currentStep].description && (
                    <p className="text-gray-600">
                      {questions[currentStep].description}
                    </p>
                  )}
                </div>

                <div className="mb-8">
                  {renderQuestion(questions[currentStep])}
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  <Button
                    onClick={handleNext}
                    disabled={!isCurrentStepValid() || isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : currentStep === totalSteps - 1 ? (
                      <>
                        Submit
                        <CheckCircle className="h-4 w-4 ml-2" />
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}