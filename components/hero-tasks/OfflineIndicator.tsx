/**
 * Offline Indicator Component for Hero Tasks
 * Created: 2025-09-08T15:40:02.000Z
 * Version: 1.0.0
 */

'use client';

import React from 'react';
import { Card, CardContent } from '@ui/card';
import { Button } from '@ui/button';
import { Badge } from '@ui/badge';
import { 
  WifiOff, 
  Wifi, 
  Sync, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { useOfflineData, OfflineMetadata } from '@/lib/offline/OfflineDataManager';

interface OfflineIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export function OfflineIndicator({ className, showDetails = false }: OfflineIndicatorProps) {
  const { isOnline, metadata, offlineDataManager } = useOfflineData();
  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleManualSync = async () => {
    if (isOnline && !isSyncing) {
      setIsSyncing(true);
      try {
        await offlineDataManager.performSync();
      } catch (error) {
        console.error('Manual sync failed:', error);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const formatLastSync = (timestamp: number): string => {
    if (timestamp === 0) return 'Never';
    
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  if (isOnline && metadata.pendingSyncCount === 0) {
    return null; // Don't show anything when online and synced
  }

  return (
    <div className={className}>
      {/* Offline Status */}
      {!isOnline && (
        <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950 mb-4">
          <CardContent className="flex items-center gap-3 py-3">
            <WifiOff className="h-5 w-5 text-orange-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                You're offline
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-300">
                Working in offline mode - changes will sync when online
              </p>
            </div>
            {metadata.pendingSyncCount > 0 && (
              <Badge variant="secondary" className="bg-orange-200 text-orange-800">
                {metadata.pendingSyncCount} pending
              </Badge>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pending Sync */}
      {isOnline && metadata.pendingSyncCount > 0 && (
        <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950 mb-4">
          <CardContent className="flex items-center gap-3 py-3">
            <Sync className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {isSyncing ? 'Syncing changes...' : 'Pending sync'}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300">
                {metadata.pendingSyncCount} change{metadata.pendingSyncCount !== 1 ? 's' : ''} waiting to sync
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSyncing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Sync className="h-4 w-4" />
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Detailed Status */}
      {showDetails && (
        <Card className="border-gray-200 bg-gray-50 dark:bg-gray-900 mb-4">
          <CardContent className="py-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Offline Status
              </h3>
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <Wifi className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    <WifiOff className="h-3 w-3 mr-1" />
                    Offline
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last sync:
                </span>
                <span>{formatLastSync(metadata.lastSync)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Sync className="h-3 w-3" />
                  Pending changes:
                </span>
                <span>{metadata.pendingSyncCount}</span>
              </div>
              
              {metadata.lastOfflineTime > 0 && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Last offline:
                  </span>
                  <span>{formatLastSync(metadata.lastOfflineTime)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface OfflineTaskBadgeProps {
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
  className?: string;
}

export function OfflineTaskBadge({ syncStatus, className }: OfflineTaskBadgeProps) {
  const getBadgeProps = () => {
    switch (syncStatus) {
      case 'pending':
        return {
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          text: 'Pending'
        };
      case 'syncing':
        return {
          variant: 'secondary' as const,
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Sync,
          text: 'Syncing'
        };
      case 'synced':
        return {
          variant: 'secondary' as const,
          className: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          text: 'Synced'
        };
      case 'failed':
        return {
          variant: 'secondary' as const,
          className: 'bg-red-100 text-red-800 border-red-200',
          icon: AlertTriangle,
          text: 'Failed'
        };
      default:
        return {
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Clock,
          text: 'Unknown'
        };
    }
  };

  const { icon: Icon, text, ...badgeProps } = getBadgeProps();

  return (
    <Badge {...badgeProps} className={`${badgeProps.className} ${className}`}>
      <Icon className="h-3 w-3 mr-1" />
      {text}
    </Badge>
  );
}

interface OfflineSyncButtonProps {
  onSync?: () => void;
  isSyncing?: boolean;
  pendingCount?: number;
  className?: string;
}

export function OfflineSyncButton({ 
  onSync, 
  isSyncing = false, 
  pendingCount = 0,
  className 
}: OfflineSyncButtonProps) {
  if (pendingCount === 0) return null;

  return (
    <Button
      onClick={onSync}
      disabled={isSyncing}
      size="sm"
      className={className}
    >
      {isSyncing ? (
        <>
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          Syncing...
        </>
      ) : (
        <>
          <Sync className="h-4 w-4 mr-2" />
          Sync ({pendingCount})
        </>
      )}
    </Button>
  );
}

export default OfflineIndicator;
