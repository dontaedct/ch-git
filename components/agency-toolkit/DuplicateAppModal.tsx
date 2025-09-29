/**
 * @fileoverview Duplicate App Modal - Modal for duplicating existing tenant applications
 */

"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TenantApp } from '@/types/tenant-apps';

interface DuplicateAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDuplicateApp: (sourceApp: TenantApp, newName: string, newAdminEmail: string) => Promise<void>;
  sourceApp: TenantApp | null;
  loading?: boolean;
}

export function DuplicateAppModal({ 
  isOpen, 
  onClose, 
  onDuplicateApp, 
  sourceApp, 
  loading = false 
}: DuplicateAppModalProps) {
  const [formData, setFormData] = useState({
    new_name: '',
    new_admin_email: ''
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.new_name.trim()) {
      newErrors.new_name = 'App name is required';
    } else if (formData.new_name.length < 3) {
      newErrors.new_name = 'App name must be at least 3 characters';
    } else if (formData.new_name.length > 100) {
      newErrors.new_name = 'App name must be less than 100 characters';
    }

    if (!formData.new_admin_email.trim()) {
      newErrors.new_admin_email = 'Admin email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.new_admin_email)) {
      newErrors.new_admin_email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !sourceApp) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onDuplicateApp(sourceApp, formData.new_name, formData.new_admin_email);
      onClose();
      // Reset form
      setFormData({ new_name: '', new_admin_email: '' });
      setErrors({});
    } catch (error) {
      console.error('Error duplicating app:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setFormData({ new_name: '', new_admin_email: '' });
    setErrors({});
  };

  if (!sourceApp) return null;

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
            onClick={handleClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Duplicate App
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Create a copy of "{sourceApp.name}"
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Source App Info */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Source App
                </h3>
                <div className="space-y-1">
                  <p className="text-sm text-gray-900 dark:text-white font-medium">
                    {sourceApp.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {sourceApp.admin_email}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={cn(
                      "px-2 py-1 text-xs font-medium rounded-full",
                      sourceApp.status === 'sandbox' && "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
                      sourceApp.status === 'production' && "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
                      sourceApp.status === 'disabled' && "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                    )}>
                      {sourceApp.status}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {sourceApp.submissions_count} submissions, {sourceApp.documents_count} documents
                    </span>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New App Name *
                  </label>
                  <input
                    type="text"
                    value={formData.new_name}
                    onChange={(e) => handleInputChange('new_name', e.target.value)}
                    placeholder="e.g., Test Client – Lead Capture (Copy)"
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                      "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                      "border-gray-300 dark:border-gray-600",
                      errors.new_name && "border-red-500 focus:ring-red-500"
                    )}
                  />
                  {errors.new_name && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.new_name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Admin Email *
                  </label>
                  <input
                    type="email"
                    value={formData.new_admin_email}
                    onChange={(e) => handleInputChange('new_admin_email', e.target.value)}
                    placeholder="new-admin@client.com"
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                      "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                      "border-gray-300 dark:border-gray-600",
                      errors.new_admin_email && "border-red-500 focus:ring-red-500"
                    )}
                  />
                  {errors.new_admin_email && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.new_admin_email}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    This email will be used for admin access and notifications for the new app.
                  </p>
                </div>
              </div>

              {/* What will be copied */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                  What will be copied:
                </h4>
                <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
                  <li className="flex items-center">
                    <Check className="w-3 h-3 mr-2" />
                    App configuration and settings
                  </li>
                  <li className="flex items-center">
                    <Check className="w-3 h-3 mr-2" />
                    Theme customization
                  </li>
                  <li className="flex items-center">
                    <Check className="w-3 h-3 mr-2" />
                    Template structure
                  </li>
                  <li className="flex items-center">
                    <Check className="w-3 h-3 mr-2" />
                    Form configurations
                  </li>
                </ul>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-2">
                  Note: Submissions and documents will not be copied to the new app.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Duplicating...</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Duplicate App</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}


