/**
 * @fileoverview Brand Switching Transition Components
 * @module components/branding/brand-switching-transitions
 * @author OSS Hero System
 * @version 2.0.0
 * 
 * HT-011.2.2: Smooth transitions and loading states for brand switching
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useRuntimeBrandSwitching, 
  useBrandSwitchingWithTransitions,
  useBrandSwitchingWithLoading,
  useAvailableBrands
} from '@/lib/config/runtime-brand-switching-hooks';
import { BrandSwitchRequest, BrandSwitchOptions } from '@/lib/config/runtime-brand-switching';

// =============================================================================
// TRANSITION COMPONENTS
// =============================================================================

/**
 * Brand switching transition wrapper component
 */
interface BrandTransitionWrapperProps {
  children: React.ReactNode;
  transitionDuration?: number;
  transitionEasing?: string;
  className?: string;
}

export function BrandTransitionWrapper({ 
  children, 
  transitionDuration = 300,
  transitionEasing = 'cubic-bezier(0.4, 0, 0.2, 1)',
  className = ''
}: BrandTransitionWrapperProps) {
  const { switchState } = useRuntimeBrandSwitching();

  return (
    <motion.div
      className={className}
      animate={{
        opacity: switchState.isSwitching ? 0.7 : 1,
        scale: switchState.isSwitching ? 0.98 : 1
      }}
      transition={{
        duration: transitionDuration / 1000,
        ease: transitionEasing as any
      }}
      style={{
        '--brand-transition-duration': `${transitionDuration}ms`,
        '--brand-transition-easing': transitionEasing
      } as React.CSSProperties}
    >
      {children}
    </motion.div>
  );
}

/**
 * Brand switching loading overlay
 */
interface BrandSwitchingLoadingOverlayProps {
  isVisible: boolean;
  progress?: number;
  message?: string;
  estimatedTimeRemaining?: number;
}

export function BrandSwitchingLoadingOverlay({ 
  isVisible, 
  progress = 0, 
  message = 'Switching brand...',
  estimatedTimeRemaining = 0
}: BrandSwitchingLoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl max-w-sm w-full mx-4"
          >
            <div className="text-center">
              {/* Loading Spinner */}
              <motion.div
                className="w-12 h-12 mx-auto mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' as any }}
              >
                <svg className="w-full h-full text-blue-600" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="60"
                    strokeDashoffset="60"
                  />
                </svg>
              </motion.div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                <motion.div
                  className="bg-blue-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Message */}
              <p className="text-gray-700 dark:text-gray-300 mb-2">{message}</p>
              
              {/* Progress Percentage */}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round(progress)}%
              </p>

              {/* Estimated Time */}
              {estimatedTimeRemaining > 0 && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  ~{Math.round(estimatedTimeRemaining / 1000)}s remaining
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Brand switching progress indicator
 */
interface BrandSwitchingProgressProps {
  className?: string;
  showPercentage?: boolean;
  showMessage?: boolean;
}

export function BrandSwitchingProgress({ 
  className = '',
  showPercentage = true,
  showMessage = true
}: BrandSwitchingProgressProps) {
  const { switchState } = useRuntimeBrandSwitching();

  if (!switchState.isSwitching) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 ${className}`}
    >
      <div className="flex items-center space-x-3">
        {/* Spinner */}
        <motion.div
          className="w-5 h-5"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <svg className="w-full h-full text-blue-600" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeDasharray="60"
              strokeDashoffset="60"
            />
          </svg>
        </motion.div>

        {/* Progress Bar */}
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-blue-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${switchState.switchProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Percentage */}
        {showPercentage && (
          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {Math.round(switchState.switchProgress)}%
          </span>
        )}
      </div>

      {/* Message */}
      {showMessage && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Switching to {switchState.activeBrandId}...
        </p>
      )}
    </motion.div>
  );
}

/**
 * Brand switching button with transition
 */
interface BrandSwitchingButtonProps {
  brandId: string;
  brandName: string;
  onSwitch?: (result: any) => void;
  className?: string;
  disabled?: boolean;
  transitionDuration?: number;
}

export function BrandSwitchingButton({ 
  brandId, 
  brandName, 
  onSwitch,
  className = '',
  disabled = false,
  transitionDuration = 300
}: BrandSwitchingButtonProps) {
  const { switchBrand, switchState } = useRuntimeBrandSwitching();
  const [isSwitching, setIsSwitching] = useState(false);

  const handleSwitch = async () => {
    if (disabled || isSwitching) return;

    setIsSwitching(true);
    
    try {
      const result = await switchBrand({
        brandId,
        options: {
          showLoading: true,
          transitionDuration,
          validateBeforeSwitch: true,
          persistSwitch: true,
          notifyComponents: true
        }
      });

      onSwitch?.(result);
    } catch (error) {
      console.error('Brand switch failed:', error);
    } finally {
      setIsSwitching(false);
    }
  };

  const isCurrentlySwitching = switchState.isSwitching && switchState.activeBrandId === brandId;

  return (
    <motion.button
      onClick={handleSwitch}
      disabled={disabled || isSwitching}
      className={`
        relative px-4 py-2 rounded-lg font-medium transition-all duration-200
        ${isCurrentlySwitching 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      animate={{
        opacity: isSwitching ? 0.8 : 1
      }}
    >
      {/* Loading indicator */}
      {isSwitching && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      )}

      {/* Button content */}
      <span className={isSwitching ? 'opacity-0' : 'opacity-100'}>
        {brandName}
      </span>
    </motion.button>
  );
}

/**
 * Brand switching dropdown with transitions
 */
interface BrandSwitchingDropdownProps {
  className?: string;
  onBrandSelect?: (brandId: string, result: any) => void;
}

export function BrandSwitchingDropdown({ 
  className = '',
  onBrandSelect
}: BrandSwitchingDropdownProps) {
  const { brands, loading } = useAvailableBrands();
  const { switchState, switchBrand } = useRuntimeBrandSwitching();
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const handleBrandSelect = async (brandId: string) => {
    setIsSwitching(true);
    setIsOpen(false);
    
    try {
      const result = await switchBrand({
        brandId,
        options: {
          showLoading: true,
          transitionDuration: 300,
          validateBeforeSwitch: true,
          persistSwitch: true,
          notifyComponents: true
        }
      });

      onBrandSelect?.(brandId, result);
    } catch (error) {
      console.error('Brand switch failed:', error);
    } finally {
      setIsSwitching(false);
    }
  };

  if (loading) {
    return (
      <div className={`px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600 dark:text-gray-400">Loading brands...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Dropdown Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitching}
        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <span className="text-gray-700 dark:text-gray-300">
          {brands.find(b => b.id === switchState.activeBrandId)?.name || 'Select Brand'}
        </span>
        
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10"
          >
            {brands.map((brand) => (
              <motion.button
                key={brand.id}
                onClick={() => handleBrandSelect(brand.id)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                disabled={brand.id === switchState.activeBrandId}
              >
                <div className="flex items-center space-x-3">
                  {/* Brand indicator */}
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: brand.config.brandColors.primary }}
                  />
                  
                  <div>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                      {brand.name}
                    </p>
                    {brand.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {brand.description}
                      </p>
                    )}
                  </div>
                  
                  {brand.id === switchState.activeBrandId && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto"
                    >
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Brand switching notification
 */
interface BrandSwitchingNotificationProps {
  result: any;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export function BrandSwitchingNotification({ 
  result, 
  onClose,
  autoClose = true,
  autoCloseDelay = 3000
}: BrandSwitchingNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, onClose]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed top-4 right-4 z-50 max-w-sm"
    >
      <div className={`
        p-4 rounded-lg shadow-lg border
        ${result.success 
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
          : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }
      `}>
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className={`
            w-6 h-6 rounded-full flex items-center justify-center
            ${result.success ? 'bg-green-100 dark:bg-green-800' : 'bg-red-100 dark:bg-red-800'}
          `}>
            {result.success ? (
              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </div>

          {/* Content */}
          <div className="flex-1">
            <p className={`
              font-medium
              ${result.success 
                ? 'text-green-800 dark:text-green-200' 
                : 'text-red-800 dark:text-red-200'
              }
            `}>
              {result.success ? 'Brand switched successfully!' : 'Brand switch failed'}
            </p>
            
            {result.error && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {result.error}
              </p>
            )}
            
            {result.duration && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Completed in {Math.round(result.duration)}ms
              </p>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={() => {
              setIsVisible(false);
              onClose?.();
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  BrandTransitionWrapper,
  BrandSwitchingLoadingOverlay,
  BrandSwitchingProgress,
  BrandSwitchingButton,
  BrandSwitchingDropdown,
  BrandSwitchingNotification
};
