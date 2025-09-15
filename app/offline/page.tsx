/**
 * Offline Page Component for Hero Tasks
 * Created: 2025-09-08T15:40:02.000Z
 * Version: 1.0.0
 */

'use client';

import React from 'react';
import { Button } from '@ui/button';
import { Card, CardContent } from '@ui/card';
import { 
  WifiOff, 
  RefreshCw, 
  CheckCircle, 
  Plus, 
  Edit, 
  Eye,
  Tag,
  MessageSquare
} from 'lucide-react';

interface OfflinePageProps {
  className?: string;
}

export function OfflinePage({ className }: OfflinePageProps) {
  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoToTasks = () => {
    window.location.href = '/hero-tasks';
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 ${className}`}>
      <Card className="max-w-md w-full shadow-xl">
        <CardContent className="p-8 text-center">
          {/* Offline Icon */}
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
              <WifiOff className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            You're Offline
          </h1>

          {/* Message */}
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            Don't worry! You can still manage your Hero Tasks offline. 
            All changes will sync automatically when you're back online.
          </p>

          {/* Available Features */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Available Offline:
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Eye className="w-4 h-4 text-green-500" />
                View tasks
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Plus className="w-4 h-4 text-blue-500" />
                Create tasks
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Edit className="w-4 h-4 text-purple-500" />
                Edit tasks
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Tag className="w-4 h-4 text-orange-500" />
                Add tags
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleGoToTasks}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Continue to Tasks
            </Button>
            
            <Button 
              onClick={handleRetry}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>

          {/* Status Indicator */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              Offline Mode Active
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default OfflinePage;