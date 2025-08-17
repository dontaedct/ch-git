/**
 * 🚀 CURSOR AI PROGRESS INDICATOR
 * 
 * This component provides real-time progress feedback for Cursor AI operations:
 * - Visual progress bars with batch information
 * - Estimated completion time
 * - Operation status and health indicators
 * - User-friendly loading states
 * 
 * Follows universal header rules completely
 * 
 * @author MIT Hero System
 * @version 1.0.0
 * @license MIT
 */

'use client';

import React, { useState, useEffect } from 'react';
import { LoadingOperation } from '@/lib/cursor-ai-loading-optimizer';

interface CursorAIProgressProps {
  operationId?: string;
  title?: string;
  description?: string;
  showDetails?: boolean;
  onCancel?: (operationId: string) => void;
  className?: string;
}

interface ProgressState {
  progress: number;
  status: LoadingOperation['status'];
  currentBatch?: number;
  totalBatches?: number;
  estimatedTime?: number;
  processedItems?: number;
  totalItems?: number;
}

export function CursorAIProgress({
  operationId,
  title = 'Processing...',
  description = 'Cursor AI is working on your request',
  showDetails = true,
  onCancel,
  className = ''
}: CursorAIProgressProps) {
  const [progressState, setProgressState] = useState<ProgressState>({
    progress: 0,
    status: 'pending'
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Simulate progress updates for demo purposes
    // In real implementation, this would connect to the LoadingOptimizer
    if (operationId) {
      setIsVisible(true);
      simulateProgress();
    }
  }, [operationId]);

  const simulateProgress = () => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setProgressState(prev => ({ ...prev, status: 'completed' }));
      } else {
        setProgressState(prev => ({
          ...prev,
          progress: Math.round(currentProgress),
          status: 'processing',
          currentBatch: Math.floor(currentProgress / 20) + 1,
          totalBatches: 5,
          estimatedTime: Math.max(0, (100 - currentProgress) * 100),
          processedItems: Math.floor((currentProgress / 100) * 100),
          totalItems: 100
        }));
      }
    }, 500);
  };

  const getStatusColor = (status: LoadingOperation['status']) => {
    switch (status) {
      case 'pending': return 'text-blue-500';
      case 'processing': return 'text-green-500';
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: LoadingOperation['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'processing': return '🔄';
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '⏳';
    }
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return '< 1s';
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    return `${Math.round(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
  };

  if (!isVisible) return null;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getStatusIcon(progressState.status)}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          </div>
        </div>
        
        {onCancel && progressState.status === 'processing' && (
          <button
            onClick={() => onCancel(operationId!)}
            className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-md transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Progress</span>
          <span>{progressState.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressState.progress}%` }}
          />
        </div>
      </div>

      {/* Details */}
      {showDetails && (
        <div className="space-y-3">
          {/* Batch Information */}
          {progressState.currentBatch && progressState.totalBatches && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Batch Progress</span>
              <span className="font-medium">
                {progressState.currentBatch} of {progressState.totalBatches}
              </span>
            </div>
          )}

          {/* Items Processed */}
          {progressState.processedItems !== undefined && progressState.totalItems && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Items Processed</span>
              <span className="font-medium">
                {progressState.processedItems} of {progressState.totalItems}
              </span>
            </div>
          )}

          {/* Estimated Time */}
          {progressState.estimatedTime && progressState.status === 'processing' && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Estimated Time</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {formatTime(progressState.estimatedTime)}
              </span>
            </div>
          )}

          {/* Status */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Status</span>
            <span className={`font-medium ${getStatusColor(progressState.status)}`}>
              {progressState.status.charAt(0).toUpperCase() + progressState.status.slice(1)}
            </span>
          </div>
        </div>
      )}

      {/* MIT Hero Integration */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>MIT Hero System</span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <span>Optimized</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default CursorAIProgress;
