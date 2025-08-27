'use client'

import { useState } from 'react';
import Link from 'next/link';

export default function QuestionnairePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({
    name: '',
    email: '',
    consultationType: '',
    experience: '',
    timeline: ''
  });

  const totalSteps = 5;

  const handleInputChange = (field: string, value: string) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Let&apos;s start with your basics</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  What&apos;s your name?
                </label>
                <input
                  type="text"
                  id="name"
                  value={answers.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  What&apos;s your email address?
                </label>
                <input
                  type="email"
                  id="email"
                  value={answers.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">What type of consultation are you looking for?</h2>
            <div className="space-y-3">
              {['Business Strategy', 'Technology Consulting', 'Marketing & Growth', 'Operations', 'Other'].map((option) => (
                <label key={option} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="consultationType"
                    value={option}
                    checked={answers.consultationType === option}
                    onChange={(e) => handleInputChange('consultationType', e.target.value)}
                    className="mr-3 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">What&apos;s your experience level?</h2>
            <div className="space-y-3">
              {['Just getting started', 'Some experience', 'Experienced', 'Expert level'].map((option) => (
                <label key={option} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="experience"
                    value={option}
                    checked={answers.experience === option}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    className="mr-3 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">What&apos;s your timeline?</h2>
            <div className="space-y-3">
              {['ASAP (within a week)', 'Within a month', 'Within 3 months', 'No rush, just exploring'].map((option) => (
                <label key={option} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="timeline"
                    value={option}
                    checked={answers.timeline === option}
                    onChange={(e) => handleInputChange('timeline', e.target.value)}
                    className="mr-3 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Perfect! Let&apos;s schedule your consultation</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-3">Your information:</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p><strong>Name:</strong> {answers.name}</p>
                <p><strong>Email:</strong> {answers.email}</p>
                <p><strong>Consultation type:</strong> {answers.consultationType}</p>
                <p><strong>Experience level:</strong> {answers.experience}</p>
                <p><strong>Timeline:</strong> {answers.timeline}</p>
              </div>
            </div>
            <div className="text-center">
              <Link 
                href="/consultation"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                Schedule consultation
              </Link>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-6">
        <div className="mb-8">
          <Link 
            href="/"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            ← Back to home
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-500">Step {currentStep} of {totalSteps}</span>
              <span className="text-sm font-medium text-gray-500">{Math.round((currentStep / totalSteps) * 100)}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          {renderStep()}

          {currentStep < 5 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="px-6 py-3 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}