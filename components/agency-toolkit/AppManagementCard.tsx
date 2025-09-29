/**
 * @fileoverview App Management Card - Individual app card with management actions
 */

"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ExternalLink, 
  Copy, 
  Power, 
  PowerOff, 
  Settings, 
  Trash2, 
  MoreVertical,
  Calendar,
  Users,
  FileText,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TenantApp, APP_STATUS_CONFIG, ENVIRONMENT_CONFIG } from '@/types/tenant-apps';

interface AppManagementCardProps {
  app: TenantApp;
  onOpenAdmin: (app: TenantApp) => void;
  onDisableApp: (app: TenantApp) => void;
  onEnableApp: (app: TenantApp) => void;
  onDuplicateApp: (app: TenantApp) => void;
  onDeleteApp: (app: TenantApp) => void;
  loading?: boolean;
}

export function AppManagementCard({ 
  app, 
  onOpenAdmin, 
  onDisableApp, 
  onEnableApp, 
  onDuplicateApp, 
  onDeleteApp,
  loading = false 
}: AppManagementCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const statusConfig = APP_STATUS_CONFIG[app.status];
  const environmentConfig = ENVIRONMENT_CONFIG[app.environment];

  const handleAction = (action: string) => {
    setShowActions(false);
    
    switch (action) {
      case 'open-admin':
        onOpenAdmin(app);
        break;
      case 'disable':
        onDisableApp(app);
        break;
      case 'enable':
        onEnableApp(app);
        break;
      case 'duplicate':
        onDuplicateApp(app);
        break;
      case 'delete':
        onDeleteApp(app);
        break;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sandbox': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300';
      case 'production': return 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-300';
      case 'disabled': return 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/60 dark:text-gray-300';
    }
  };

  const getEnvironmentColor = (environment: string) => {
    switch (environment) {
      case 'development': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-300';
      case 'staging': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-300';
      case 'production': return 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/60 dark:text-gray-300';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={cn(
        "relative bg-white dark:bg-gray-800 rounded-lg border-2 transition-all duration-200",
        "hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600",
        isHovered && "shadow-md",
        loading && "opacity-50 pointer-events-none"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {app.name}
              </h3>
              <span className={cn(
                "px-2 py-1 text-xs font-medium rounded-full",
                getStatusColor(app.status)
              )}>
                {statusConfig.icon} {statusConfig.label}
              </span>
              <span className={cn(
                "px-2 py-1 text-xs font-medium rounded-full",
                getEnvironmentColor(app.environment)
              )}>
                {environmentConfig.icon} {environmentConfig.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {app.admin_email}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Created {formatDate(app.created_at)}
            </p>
          </div>
          
          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
            
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-10 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10"
              >
                <div className="py-1">
                  <button
                    onClick={() => handleAction('open-admin')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open App Admin</span>
                  </button>
                  
                  {app.status === 'disabled' ? (
                    <button
                      onClick={() => handleAction('enable')}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <Power className="w-4 h-4" />
                      <span>Enable App</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAction('disable')}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <PowerOff className="w-4 h-4" />
                      <span>Disable App</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleAction('duplicate')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Duplicate App</span>
                  </button>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                  
                  <button
                    onClick={() => handleAction('delete')}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/60 flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete App</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {app.submissions_count}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
              <FileText className="w-3 h-3 mr-1" />
              Submissions
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {app.documents_count}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
              <FileText className="w-3 h-3 mr-1" />
              Documents
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {app.last_activity_at ? 'Active' : 'Inactive'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
              <Activity className="w-3 h-3 mr-1" />
              Status
            </div>
          </div>
        </div>

        {/* URLs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Admin URL:</span>
            <a
              href={app.admin_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center space-x-1"
            >
              <span>Open Admin</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Public URL:</span>
            <a
              href={app.public_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center space-x-1"
            >
              <span>View Public</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Last Activity */}
        {app.last_activity_at && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="w-3 h-3 mr-1" />
              Last activity: {formatDate(app.last_activity_at)}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/80 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <button
            onClick={() => handleAction('open-admin')}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Admin</span>
          </button>
          
          <div className="flex items-center space-x-2">
            {app.status === 'disabled' ? (
              <button
                onClick={() => handleAction('enable')}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
              >
                <Power className="w-4 h-4" />
                <span>Enable</span>
              </button>
            ) : (
              <button
                onClick={() => handleAction('disable')}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              >
                <PowerOff className="w-4 h-4" />
                <span>Disable</span>
              </button>
            )}
            
            <button
              onClick={() => handleAction('duplicate')}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <Copy className="w-4 h-4" />
              <span>Duplicate</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}


