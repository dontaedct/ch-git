"use client"

import { createClientIntake } from "./actions";
import { useState } from "react";

export default function Page() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      await createClientIntake(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-6">
            <div className="w-8 h-8 bg-gray-400 rounded"></div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            We&apos;re excited to help you start your coaching journey! Please fill out this form to help us understand your goals and preferences.
          </p>
        </div>

        {/* Form Card */}
        <div className="max-w-md mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
            <form action={handleSubmit} className="space-y-6">
              {/* Coach ID Field */}
              <div className="space-y-2">
                <label htmlFor="coach_id" className="text-sm font-medium text-gray-700">
                  Coach ID
                </label>
                <input
                  id="coach_id"
                  name="coach_id"
                  type="text"
                  placeholder="Enter your coach ID"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              {/* Name Field */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone Number <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Consent Checkbox */}
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="consent"
                    className="w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 rounded-lg focus:ring-blue-500 focus:ring-2 mt-1"
                    required
                  />
                  <span className="text-sm text-gray-600 leading-relaxed">
                    I agree to be contacted about my coaching sessions and related information.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Getting Started...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    Get Started
                    <div className="w-5 h-5 bg-white rounded"></div>
                  </div>
                )}
              </button>
            </form>

            {/* Footer Note */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                Your information is secure and will only be used for coaching purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
