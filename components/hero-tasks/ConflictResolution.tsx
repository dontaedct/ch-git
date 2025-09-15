/**
 * Conflict Resolution Component for Optimistic Updates
 * 
 * Handles conflicts when multiple users edit the same task simultaneously
 * with merge strategies and user-friendly conflict resolution UI.
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Merge, 
  Clock,
  User,
  RefreshCw
} from 'lucide-react';

export interface ConflictData {
  field: string;
  localValue: any;
  remoteValue: any;
  localTimestamp: Date;
  remoteTimestamp: Date;
  localUserId: string;
  remoteUserId: string;
}

export interface ConflictResolutionProps {
  conflicts: ConflictData[];
  onResolve: (resolutions: ConflictResolution[]) => void;
  onDismiss: () => void;
  className?: string;
}

export interface ConflictResolution {
  field: string;
  resolution: 'local' | 'remote' | 'merge';
  mergedValue?: any;
}

export function ConflictResolution({ 
  conflicts, 
  onResolve, 
  onDismiss,
  className = ''
}: ConflictResolutionProps) {
  const [resolutions, setResolutions] = useState<ConflictResolution[]>([]);
  const [isResolving, setIsResolving] = useState(false);

  const handleResolution = (field: string, resolution: ConflictResolution['resolution'], mergedValue?: any) => {
    setResolutions(prev => {
      const filtered = prev.filter(r => r.field !== field);
      return [...filtered, { field, resolution, mergedValue }];
    });
  };

  const handleResolveAll = async () => {
    setIsResolving(true);
    try {
      // Ensure all conflicts have resolutions
      const allResolutions = conflicts.map(conflict => {
        const existing = resolutions.find(r => r.field === conflict.field);
        return existing || { field: conflict.field, resolution: 'local' as const };
      });
      
      await onResolve(allResolutions);
    } finally {
      setIsResolving(false);
    }
  };

  const handleDismiss = () => {
    onDismiss();
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString();
  };

  const getFieldDisplayName = (field: string) => {
    return field.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getResolutionStatus = (field: string) => {
    const resolution = resolutions.find(r => r.field === field);
    return resolution?.resolution || null;
  };

  const isAllResolved = conflicts.every(conflict => 
    resolutions.some(r => r.field === conflict.field)
  );

  if (conflicts.length === 0) {
    return null;
  }

  return (
    <Card className={`border-orange-200 bg-orange-50 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertTriangle className="w-5 h-5" />
          Conflict Resolution Required
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Multiple users have edited this task simultaneously. Please choose how to resolve each conflict.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          {conflicts.map((conflict, index) => {
            const resolution = getResolutionStatus(conflict.field);
            
            return (
              <div key={conflict.field} className="border rounded-lg p-3 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    {getFieldDisplayName(conflict.field)}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    Field Conflict
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  {/* Local Version */}
                  <div className="border rounded p-2 bg-blue-50">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-3 h-3 text-blue-600" />
                      <span className="text-xs font-medium text-blue-800">Your Version</span>
                      <Clock className="w-3 h-3 text-blue-600" />
                      <span className="text-xs text-blue-600">
                        {formatTimestamp(conflict.localTimestamp)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 break-words">
                      {typeof conflict.localValue === 'string' 
                        ? conflict.localValue 
                        : JSON.stringify(conflict.localValue)
                      }
                    </div>
                  </div>

                  {/* Remote Version */}
                  <div className="border rounded p-2 bg-green-50">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-3 h-3 text-green-600" />
                      <span className="text-xs font-medium text-green-800">
                        {conflict.remoteUserId}'s Version
                      </span>
                      <Clock className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-green-600">
                        {formatTimestamp(conflict.remoteTimestamp)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 break-words">
                      {typeof conflict.remoteValue === 'string' 
                        ? conflict.remoteValue 
                        : JSON.stringify(conflict.remoteValue)
                      }
                    </div>
                  </div>
                </div>

                {/* Resolution Options */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={resolution === 'local' ? 'default' : 'outline'}
                    onClick={() => handleResolution(conflict.field, 'local')}
                    className="text-xs"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Use Mine
                  </Button>
                  
                  <Button
                    size="sm"
                    variant={resolution === 'remote' ? 'default' : 'outline'}
                    onClick={() => handleResolution(conflict.field, 'remote')}
                    className="text-xs"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Use Theirs
                  </Button>
                  
                  <Button
                    size="sm"
                    variant={resolution === 'merge' ? 'default' : 'outline'}
                    onClick={() => handleResolution(conflict.field, 'merge', conflict.localValue)}
                    className="text-xs"
                  >
                    <Merge className="w-3 h-3 mr-1" />
                    Merge
                  </Button>
                </div>

                {resolution && (
                  <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Resolution: {resolution === 'local' ? 'Using your version' : 
                                resolution === 'remote' ? 'Using their version' : 
                                'Merged values'}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-3 border-t">
          <Button
            variant="outline"
            onClick={handleDismiss}
            disabled={isResolving}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Dismiss Conflicts
          </Button>
          
          <Button
            onClick={handleResolveAll}
            disabled={!isAllResolved || isResolving}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isResolving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Resolving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Resolve All Conflicts
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ConflictResolution;
