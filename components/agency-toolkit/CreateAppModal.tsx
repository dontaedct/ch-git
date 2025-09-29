/**
 * @fileoverview Create New App Modal - Modal for creating new tenant applications
 */

"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TenantAppTemplate, TENANT_APP_TEMPLATES } from '@/types/tenant-apps';
import { CreateTenantAppRequest } from '@/types/tenant-apps';

interface CreateAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateApp: (data: CreateTenantAppRequest) => Promise<void>;
  loading?: boolean;
}

export function CreateAppModal({ isOpen, onClose, onCreateApp, loading = false }: CreateAppModalProps) {
  const [step, setStep] = useState<'details' | 'template'>('details');
  const [formData, setFormData] = useState({
    name: '',
    admin_email: '',
    template_id: 'lead-form-pdf'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (stepName: 'details' | 'template'): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepName === 'details') {
      if (!formData.name.trim()) {
        newErrors.name = 'App name is required';
      } else if (formData.name.length < 3) {
        newErrors.name = 'App name must be at least 3 characters';
      } else if (formData.name.length > 100) {
        newErrors.name = 'App name must be less than 100 characters';
      }

      if (!formData.admin_email.trim()) {
        newErrors.admin_email = 'Admin email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.admin_email)) {
        newErrors.admin_email = 'Please enter a valid email address';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 'details' && validateStep('details')) {
      setStep('template');
    }
  };

  const handleBack = () => {
    setStep('details');
  };

  const handleSubmit = async () => {
    if (!validateStep('details')) {
      setStep('details');
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateApp({
        name: formData.name,
        admin_email: formData.admin_email,
        template_id: formData.template_id
      });
      onClose();
      // Reset form
      setFormData({ name: '', admin_email: '', template_id: 'lead-form-pdf' });
      setStep('details');
      setErrors({});
    } catch (error) {
      console.error('Error creating app:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTemplate = TENANT_APP_TEMPLATES.find(t => t.id === formData.template_id);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Create New App
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Step {step === 'details' ? '1' : '2'} of 2
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  step === 'details' ? "bg-blue-500 text-white" : "bg-green-500 text-white"
                )}>
                  {step === 'details' ? '1' : <Check className="w-4 h-4" />}
                </div>
                <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div className={cn(
                    "h-full bg-blue-500 rounded-full transition-all duration-300",
                    step === 'template' ? "w-full" : "w-0"
                  )} />
                </div>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  step === 'template' ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                )}>
                  2
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {step === 'details' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      App Details
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      Provide basic information for your new client application.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        App Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="e.g., Test Client – Lead Capture"
                        className={cn(
                          "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                          "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                          "border-gray-300 dark:border-gray-600",
                          errors.name && "border-red-500 focus:ring-red-500"
                        )}
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-500 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Admin Email *
                      </label>
                      <input
                        type="email"
                        value={formData.admin_email}
                        onChange={(e) => handleInputChange('admin_email', e.target.value)}
                        placeholder="admin@client.com"
                        className={cn(
                          "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                          "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                          "border-gray-300 dark:border-gray-600",
                          errors.admin_email && "border-red-500 focus:ring-red-500"
                        )}
                      />
                      {errors.admin_email && (
                        <p className="mt-1 text-sm text-red-500 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.admin_email}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        This email will be used for admin access and notifications.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 'template' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Choose Template
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      Select a starter template for your application.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {TENANT_APP_TEMPLATES.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => handleInputChange('template_id', template.id)}
                        className={cn(
                          "p-4 border-2 rounded-lg cursor-pointer transition-all duration-200",
                          "hover:shadow-md",
                          formData.template_id === template.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        )}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="text-2xl">{template.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {template.name}
                              </h4>
                              {template.is_premium && (
                                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded">
                                  Premium
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {template.description}
                            </p>
                            <div className="mt-2">
                              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Features:
                              </p>
                              <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                {template.features.slice(0, 3).map((feature, index) => (
                                  <li key={index} className="flex items-center">
                                    <Check className="w-3 h-3 mr-1 text-green-500" />
                                    {feature}
                                  </li>
                                ))}
                                {template.features.length > 3 && (
                                  <li className="text-gray-400">
                                    +{template.features.length - 3} more features
                                  </li>
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center space-x-4">
                {step === 'template' && (
                  <button
                    onClick={handleBack}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Back
                  </button>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                
                {step === 'details' ? (
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <span>Next</span>
                    <Plus className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <span>Create App</span>
                        <Plus className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}


