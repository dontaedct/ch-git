'use client';

import { useState, useEffect } from 'react';
import { Button } from '@ui/button';
import { Badge } from '@ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@ui/tooltip';
import { 
  Save, 
  CheckCircle, 
  AlertCircle, 
  RotateCcw, 
  Download,
  Upload,
  Trash2
} from 'lucide-react';
import { autoSaveManager } from '@lib/auto-save';
import { storageManager } from '@lib/auto-save/storage';
import { toast } from '@ui/use-toast';

interface AutoSaveStatusProps {
  className?: string;
  showAdvanced?: boolean;
}

export function AutoSaveStatus({ className, showAdvanced = false }: AutoSaveStatusProps) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [unsavedCount, setUnsavedCount] = useState(0);
  const [storageSize, setStorageSize] = useState(0);

  useEffect(() => {
    // Listen for auto-save events
    const handleAutoSave = () => {
      setStatus('saving');
      setTimeout(() => {
        setStatus('saved');
        setLastSaved(new Date());
        updateStats();
      }, 500);
    };

    const handleAutoSaveError = () => {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    };

    window.addEventListener('auto-save', handleAutoSave);
    window.addEventListener('auto-save-error', handleAutoSaveError);

    // Initial stats
    updateStats();

    // Periodic stats update
    const interval = setInterval(updateStats, 10000);

    return () => {
      window.removeEventListener('auto-save', handleAutoSave);
      window.removeEventListener('auto-save-error', handleAutoSaveError);
      clearInterval(interval);
    };
  }, []);

  const updateStats = () => {
    const entries = autoSaveManager.getUnsavedEntries();
    setUnsavedCount(entries.length);
    setStorageSize(storageManager.getStorageSize());
  };

  const forceSave = () => {
    autoSaveManager.forceSave();
    setStatus('saving');
    setTimeout(() => {
      setStatus('saved');
      setLastSaved(new Date());
      updateStats();
      toast({
        title: "Forced save",
        description: "All unsaved changes have been saved.",
        variant: "default",
      });
    }, 500);
  };

  const exportData = () => {
    try {
      const data = storageManager.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `auto-save-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Data exported",
        description: "Auto-save data has been exported successfully.",
        variant: "default",
      });
    } catch {
      toast({
        title: "Export failed",
        description: "Failed to export auto-save data.",
        variant: "destructive",
      });
    }
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            if (storageManager.importData(data)) {
              toast({
                title: "Data imported",
                description: "Auto-save data has been imported successfully.",
                variant: "default",
              });
              updateStats();
            } else {
              throw new Error('Import failed');
            }
          } catch {
            toast({
              title: "Import failed",
              description: "Failed to import auto-save data. Invalid format.",
              variant: "destructive",
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all auto-save data? This cannot be undone.')) {
      autoSaveManager.clearAllEntries();
      storageManager.clear();
      updateStats();
      toast({
        title: "Data cleared",
        description: "All auto-save data has been cleared.",
        variant: "default",
      });
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'saving':
        return <RotateCcw className="h-4 w-4 animate-spin text-blue-600" />;
      case 'saved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Save className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'Saved';
      case 'error':
        return 'Error';
      default:
        return 'Idle';
    }
  };

  const formatStorageSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="text-sm font-medium text-gray-700">
                {getStatusText()}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Auto-save status</p>
            {lastSaved && (
              <p className="text-xs text-gray-500">
                Last saved: {lastSaved.toLocaleTimeString()}
              </p>
            )}
          </TooltipContent>
        </Tooltip>

        {unsavedCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {unsavedCount} unsaved
          </Badge>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={forceSave}
            disabled={status === 'saving'}
            className="h-8 w-8 p-0 text-gray-600 hover:text-gray-800"
          >
            <Save className="h-4 w-4" />
          </Button>

          {showAdvanced && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={exportData}
                    className="h-8 w-8 p-0 text-gray-600 hover:text-gray-800"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export auto-save data</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={importData}
                    className="h-8 w-8 p-0 text-gray-600 hover:text-gray-800"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Import auto-save data</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllData}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clear all auto-save data</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </div>

        <div className="text-xs text-gray-500">
          {formatStorageSize(storageSize)}
        </div>
      </TooltipProvider>
    </div>
  );
}