'use client'

import { Check, X, ArrowRight, Zap, Star } from 'lucide-react'

export function PricingSection() {
  const plans = [
    {
      name: 'Starter',
      price: '$299',
      period: 'per project',
      description: 'Perfect for small agencies and individual developers',
      features: [
        'Up to 5 micro-apps',
        'Basic form builder (10 field types)',
        'Standard modules (15 modules)',
        'Email notifications',
        'Basic workflow automation',
        'Community support',
        '7-day delivery guarantee'
      ],
      limitations: [
        'No custom modules',
        'Limited workflow complexity',
        'Basic analytics'
      ],
      cta: 'Get Started',
      popular: false
    },
    {
      name: 'Professional',
      price: '$799',
      period: 'per project',
      description: 'Best for growing agencies and development teams',
      features: [
        'Unlimited micro-apps',
        'Advanced form builder (21 field types)',
        'All modules (33 modules)',
        'Email & SMS notifications',
        'Advanced workflow automation',
        'Priority support',
        '5-day delivery guarantee',
        'Custom module development',
        'Advanced analytics',
        'White-labeling options'
      ],
      limitations: [],
      cta: 'Start Professional',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us',
      description: 'For large agencies and enterprise clients',
      features: [
        'Everything in Professional',
        'Dedicated infrastructure',
        'Custom integrations',
        '24/7 priority support',
        '3-day delivery guarantee',
        'Custom module development',
        'Advanced security features',
        'SLA guarantees',
        'Training and onboarding',
        'Dedicated account manager'
      ],
      limitations: [],
      cta: 'Contact Sales',
      popular: false
    }
  ]

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that fits your agency's needs. All plans include our 7-day delivery guarantee 
            and enterprise-grade security features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl p-8 border-2 transition-all duration-300 hover:-translate-y-2 ${
                plan.popular
                  ? 'border-purple-500 shadow-xl scale-105'
                  : 'border-gray-200 hover:border-purple-300 hover:shadow-lg'
              }`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period !== 'contact us' && (
                    <span className="text-gray-600 ml-1">/{plan.period}</span>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
                {plan.limitations.map((limitation) => (
                  <div key={limitation} className="flex items-center opacity-60">
                    <X className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-500">{limitation}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center group ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </div>
          ))}
        </div>

        {/* Additional Services */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-12 mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Additional Services
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Enhance your micro-apps with our additional services and support options.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Rush Delivery</h4>
              <p className="text-gray-600 text-sm mb-4">3-day delivery for urgent projects</p>
              <div className="text-2xl font-bold text-purple-600">+50%</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Custom Modules</h4>
              <p className="text-gray-600 text-sm mb-4">Bespoke module development</p>
              <div className="text-2xl font-bold text-blue-600">$199</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Training</h4>
              <p className="text-gray-600 text-sm mb-4">Team training and onboarding</p>
              <div className="text-2xl font-bold text-green-600">$299</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Support</h4>
              <p className="text-gray-600 text-sm mb-4">Extended support hours</p>
              <div className="text-2xl font-bold text-orange-600">$99/mo</div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What's included in the 7-day delivery?</h4>
              <p className="text-gray-600">
                Complete micro-app development, testing, deployment, and basic training. Rush delivery available for 3-day completion.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Can I upgrade my plan later?</h4>
              <p className="text-gray-600">
                Yes, you can upgrade to a higher plan at any time. We'll prorate the difference and migrate your existing apps.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Do you offer custom integrations?</h4>
              <p className="text-gray-600">
                Yes, custom integrations are available in the Professional and Enterprise plans. We support most popular APIs and services.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What happens after delivery?</h4>
              <p className="text-gray-600">
                You receive full source code, documentation, and ongoing support. We also offer maintenance and update services.
              </p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl p-12">
            <h3 className="text-2xl font-bold mb-4">Ready to Build Your First Micro-App?</h3>
            <p className="text-purple-100 mb-8 max-w-2xl mx-auto">
              Join hundreds of agencies already using the DCT Micro-Apps platform to deliver custom solutions in record time.
            </p>
            <button className="bg-white text-purple-600 px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors duration-200 font-semibold text-lg flex items-center mx-auto">
              Start Your Project Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
