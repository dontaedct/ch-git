'use client';

import { useState, useEffect } from 'react';
import { Button } from '@ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card';
import { Badge } from '@ui/badge';
import { AlertTriangle, RotateCcw, X, CheckCircle, Clock } from 'lucide-react';
import { autoSaveManager, AutoSaveEntry } from '@lib/auto-save';
import { toast } from '@ui/use-toast';

interface AutoSaveRecoveryProps {
  className?: string;
}

export function AutoSaveRecovery({ className }: AutoSaveRecoveryProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [entries, setEntries] = useState<AutoSaveEntry[]>([]);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    // Check for recovery on mount
    checkForRecovery();

    // Listen for auto-save events
    const handleAutoSave = () => {
      checkForRecovery();
    };

    let routeChangeTimeout: NodeJS.Timeout;
    const handleRouteChange = () => {
      // Clear any existing timeout to prevent memory leaks
      if (routeChangeTimeout) {
        clearTimeout(routeChangeTimeout);
      }
      // Small delay to ensure new page is loaded
      routeChangeTimeout = setTimeout(checkForRecovery, 100);
    };

    window.addEventListener('auto-save', handleAutoSave);
    window.addEventListener('popstate', handleRouteChange);
    
    // Listen for Next.js route changes
    let originalPushState: typeof history.pushState;
    let originalReplaceState: typeof history.replaceState;
    
    if (typeof window !== 'undefined') {
      originalPushState = history.pushState;
      originalReplaceState = history.replaceState;
      
      history.pushState = function(...args) {
        originalPushState.apply(history, args);
        handleRouteChange();
      };
      
      history.replaceState = function(...args) {
        originalReplaceState.apply(history, args);
        handleRouteChange();
      };
    }

    return () => {
      // Clear timeout to prevent memory leaks
      if (routeChangeTimeout) {
        clearTimeout(routeChangeTimeout);
      }
      
      // Restore original history methods
      if (originalPushState) {
        history.pushState = originalPushState;
      }
      if (originalReplaceState) {
        history.replaceState = originalReplaceState;
      }
      
      window.removeEventListener('auto-save', handleAutoSave);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const checkForRecovery = async () => {
    const recoveryEntries = await autoSaveManager.attemptRecovery();
    setEntries(recoveryEntries);
    setIsVisible(recoveryEntries.length > 0);
  };

  const restoreEntry = async (entry: AutoSaveEntry) => {
    setIsRestoring(true);
    
    try {
      // Attempt to restore the entry based on its metadata
      if (entry.metadata?.type === 'form') {
        await restoreFormData(entry);
      } else if (entry.metadata?.type === 'contenteditable') {
        await restoreContentEditable(entry);
      } else {
        await restoreInput(entry);
      }

      // Clear the restored entry
      autoSaveManager.clearEntry(entry.id);
      
      toast({
        title: "Entry restored",
        description: "Your unsaved work has been restored successfully.",
        variant: "default",
      });

      // Recheck for remaining entries
      checkForRecovery();
    } catch (_error) {
      console.error('Failed to restore entry:', _error);
      toast({
        title: "Restore failed",
        description: "Failed to restore the entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const restoreFormData = async (entry: AutoSaveEntry) => {
    try {
      const formData = JSON.parse(entry.content);
      const form = document.querySelector(`form[action="${entry.metadata?.action}"]`) as HTMLFormElement;
      
      if (form) {
        Object.entries(formData).forEach(([key, value]) => {
          const input = form.querySelector(`[name="${key}"]`) as HTMLInputElement | HTMLTextAreaElement;
          if (input) {
            input.value = String(value);
            // Trigger change event
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      }
    } catch {
      throw new Error('Failed to parse form data');
    }
  };

  const restoreContentEditable = async (entry: AutoSaveEntry) => {
    const element = document.getElementById(entry.metadata?.id ?? '') as HTMLElement;
    if (element?.isContentEditable) {
      element.innerHTML = entry.content;
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  const restoreInput = async (entry: AutoSaveEntry) => {
    const element = document.getElementById(entry.metadata?.id ?? '') as HTMLInputElement | HTMLTextAreaElement;
    if (element) {
      element.value = entry.content;
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  const dismissEntry = (entryId: string) => {
    autoSaveManager.clearEntry(entryId);
    checkForRecovery();
  };

  const dismissAll = () => {
    autoSaveManager.clearAllEntries();
    setIsVisible(false);
    setEntries([]);
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getEntryIcon = (entry: AutoSaveEntry) => {
    switch (entry.metadata?.type) {
      case 'form':
        return <CheckCircle className="h-4 w-4" />;
      case 'contenteditable':
        return <RotateCcw className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (!isVisible || entries.length === 0) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md ${className}`}>
      <Card className="border-orange-200 bg-orange-50 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-lg text-orange-800">
                Unsaved Work Detected
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissAll}
              className="h-8 w-8 p-0 text-orange-600 hover:bg-orange-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-orange-700">
            We found {entries.length} unsaved {entries.length === 1 ? 'entry' : 'entries'} from your previous session.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-lg border border-orange-200 bg-white p-3"
            >
              <div className="flex items-center gap-3">
                {getEntryIcon(entry)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {entry.metadata?.type ?? 'input'}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {entry.metadata?.name ?? entry.metadata?.id ?? 'Unknown field'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatTimestamp(entry.timestamp)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => restoreEntry(entry)}
                  disabled={isRestoring}
                  className="h-8 px-3 text-xs bg-orange-600 hover:bg-orange-700"
                >
                  {isRestoring ? 'Restoring...' : 'Restore'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissEntry(entry.id)}
                  className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          <div className="pt-2 border-t border-orange-200">
            <div className="flex items-center justify-between text-xs text-orange-600">
              <span>Auto-save is active and protecting your work</span>
              <Button
                variant="link"
                size="sm"
                onClick={() => autoSaveManager.forceSave()}
                className="h-auto p-0 text-xs text-orange-600 hover:text-orange-800"
              >
                Force Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
