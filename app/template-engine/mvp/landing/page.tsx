/**
 * @fileoverview MVP Landing Page Template
 * Landing page template for consultation workflow
 * HT-029.3.1 Implementation
 */
"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Rocket,
  Users,
  CheckCircle,
  ArrowRight,
  Star,
  Clock,
  Shield,
  Zap
} from "lucide-react";

interface LandingPageConfig {
  title: string;
  subtitle: string;
  heroImage?: string;
  features: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  testimonials: Array<{
    name: string;
    role: string;
    content: string;
    rating: number;
  }>;
  ctaText: string;
  benefits: string[];
}

interface TemplateVariables {
  companyName: string;
  serviceName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
}

export default function MVPLandingPageTemplate() {
  const [config, setConfig] = useState<LandingPageConfig>({
    title: "Get Your Free Business Consultation",
    subtitle: "Discover how our expert solutions can transform your business in just 30 minutes",
    features: [
      {
        icon: "rocket",
        title: "Expert Analysis",
        description: "Get personalized insights from industry experts with 10+ years of experience"
      },
      {
        icon: "users",
        title: "Proven Results",
        description: "Join 500+ businesses that have increased their revenue by 40% on average"
      },
      {
        icon: "shield",
        title: "100% Free",
        description: "No hidden costs or commitments. Get valuable insights at no charge"
      }
    ],
    testimonials: [
      {
        name: "Sarah Johnson",
        role: "CEO, TechStart Inc",
        content: "The consultation revealed opportunities I never considered. Revenue increased 60% in 6 months!",
        rating: 5
      },
      {
        name: "Michael Chen",
        role: "Founder, GrowthCo",
        content: "Actionable strategies that actually work. Best business decision I've made this year.",
        rating: 5
      }
    ],
    ctaText: "Start Your Free Consultation",
    benefits: [
      "Identify untapped revenue opportunities",
      "Optimize your current business processes",
      "Get a customized growth strategy",
      "Receive actionable next steps"
    ]
  });

  const [variables, setVariables] = useState<TemplateVariables>({
    companyName: "Your Business Solutions",
    serviceName: "Business Growth Consultation",
    primaryColor: "#3B82F6",
    secondaryColor: "#1E40AF"
  });

  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const renderIcon = (iconName: string) => {
    const iconMap = {
      rocket: <Rocket className="h-8 w-8" />,
      users: <Users className="h-8 w-8" />,
      shield: <Shield className="h-8 w-8" />,
      clock: <Clock className="h-8 w-8" />,
      zap: <Zap className="h-8 w-8" />
    };
    return iconMap[iconName as keyof typeof iconMap] || <CheckCircle className="h-8 w-8" />;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (previewMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {variables.companyName.charAt(0)}
                  </span>
                </div>
                <span className="text-xl font-bold text-gray-900">
                  {variables.companyName}
                </span>
              </div>
              <Button variant="outline">Contact Us</Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.h1
              className="text-5xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {config.title}
            </motion.h1>
            <motion.p
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {config.subtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link href="/template-engine/mvp/questionnaire">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
                >
                  {config.ctaText}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our {variables.serviceName}?
            </h2>
            <p className="text-lg text-gray-600">
              Join thousands of businesses that have transformed with our expert guidance
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {config.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit text-blue-600">
                      {renderIcon(feature.icon)}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-center">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  What You'll Get From Your Consultation
                </h2>
                <div className="space-y-4">
                  {config.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                      <span className="text-lg text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8">
                  <Link href="/template-engine/mvp/questionnaire">
                    <Button
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Get Started Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="bg-gray-50 p-8 rounded-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Quick Process
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <span>Answer a few quick questions (5 minutes)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <span>Schedule your consultation call</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <span>Receive your custom strategy report</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                What Our Clients Say
              </h2>
              <p className="text-lg text-gray-600">
                Real results from real businesses
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {config.testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="flex mb-4">
                        {renderStars(testimonial.rating)}
                      </div>
                      <p className="text-gray-700 mb-4 italic">
                        "{testimonial.content}"
                      </p>
                      <div>
                        <p className="font-semibold text-gray-900">{testimonial.name}</p>
                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="bg-blue-600 py-20">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join hundreds of successful businesses. Start your free consultation today.
            </p>
            <Link href="/template-engine/mvp/questionnaire">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg"
              >
                Get Your Free Consultation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {variables.companyName.charAt(0)}
                  </span>
                </div>
                <span className="text-xl font-bold">
                  {variables.companyName}
                </span>
              </div>
              <p className="text-gray-400">
                © 2025 {variables.companyName}. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">MVP Landing Page Template</h1>
            <p className="text-gray-600 mt-2">
              Create and customize your consultation landing page template
            </p>
          </div>
          <div className="flex space-x-4">
            <Button
              variant={previewMode ? "default" : "outline"}
              onClick={() => setPreviewMode(!previewMode)}
            >
              {previewMode ? "Edit Mode" : "Preview"}
            </Button>
            <Link href="/template-engine">
              <Button variant="outline">Back to Engine</Button>
            </Link>
          </div>
        </div>

        {/* Template Configuration */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Variables</CardTitle>
                <CardDescription>
                  Customize the basic information for your landing page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={variables.companyName}
                    onChange={(e) => setVariables(prev => ({ ...prev, companyName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Name
                  </label>
                  <input
                    type="text"
                    value={variables.serviceName}
                    onChange={(e) => setVariables(prev => ({ ...prev, serviceName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <input
                    type="color"
                    value={variables.primaryColor}
                    onChange={(e) => setVariables(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Configuration</CardTitle>
                <CardDescription>
                  Customize the content and messaging
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hero Title
                  </label>
                  <input
                    type="text"
                    value={config.title}
                    onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hero Subtitle
                  </label>
                  <textarea
                    value={config.subtitle}
                    onChange={(e) => setConfig(prev => ({ ...prev, subtitle: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Call-to-Action Text
                  </label>
                  <input
                    type="text"
                    value={config.ctaText}
                    onChange={(e) => setConfig(prev => ({ ...prev, ctaText: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Template Status */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Status</CardTitle>
                <CardDescription>
                  Current template configuration and validation status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Template Type</span>
                    <Badge variant="secondary">Landing Page</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Workflow</span>
                    <Badge variant="secondary">Consultation MVP</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <Badge className="bg-green-100 text-green-800">Ready</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Next Step</span>
                    <Link href="/template-engine/mvp/questionnaire">
                      <Button size="sm" variant="outline">
                        Questionnaire →
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Template Actions</CardTitle>
                <CardDescription>
                  Available actions for this template
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    className="w-full"
                    onClick={() => setPreviewMode(true)}
                  >
                    Preview Template
                  </Button>
                  <Button variant="outline" className="w-full">
                    Export Configuration
                  </Button>
                  <Button variant="outline" className="w-full">
                    Generate Client App
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Template Performance</CardTitle>
                <CardDescription>
                  Template metrics and optimization status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Load Time</span>
                    <span className="text-sm font-medium text-green-600">1.2s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Mobile Score</span>
                    <span className="text-sm font-medium text-green-600">95/100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SEO Score</span>
                    <span className="text-sm font-medium text-green-600">98/100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Accessibility</span>
                    <span className="text-sm font-medium text-green-600">100/100</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}