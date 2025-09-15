/**
 * Hero Tasks - Keyboard Shortcuts Help Component
 * HT-004.1.1: Visual keyboard shortcuts help modal
 * Created: 2025-01-27T15:30:00.000Z
 * Version: 1.0.0
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Keyboard } from 'lucide-react';
import { KeyboardShortcut } from '@/hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  shortcuts: KeyboardShortcut[];
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function KeyboardShortcutsHelp({
  shortcuts,
  isOpen,
  onClose,
  className
}: KeyboardShortcutsHelpProps) {
  if (!isOpen) return null;

  // Group shortcuts by context
  const groupedShortcuts = shortcuts.reduce((groups, shortcut) => {
    const context = getShortcutContext(shortcut);
    if (!groups[context]) {
      groups[context] = [];
    }
    groups[context].push(shortcut);
    return groups;
  }, {} as Record<string, KeyboardShortcut[]>);

  const formatKeyCombo = (shortcut: KeyboardShortcut): string => {
    const parts: string[] = [];
    
    if (shortcut.ctrlKey) parts.push('Ctrl');
    if (shortcut.metaKey) parts.push('Cmd');
    if (shortcut.altKey) parts.push('Alt');
    if (shortcut.shiftKey) parts.push('Shift');
    
    // Format the main key
    let key = shortcut.key;
    if (key === ' ') key = 'Space';
    if (key === 'ArrowUp') key = '↑';
    if (key === 'ArrowDown') key = '↓';
    if (key === 'ArrowLeft') key = '←';
    if (key === 'ArrowRight') key = '→';
    
    parts.push(key);
    return parts.join(' + ');
  };

  const getShortcutContext = (shortcut: KeyboardShortcut): string => {
    // Determine context based on shortcut characteristics
    if (shortcut.key === 'F1') return 'General';
    if (shortcut.key === 'Escape') return 'General';
    if (shortcut.description.includes('task')) return 'Task Management';
    if (shortcut.description.includes('search') || shortcut.description.includes('refresh')) return 'Navigation';
    if (shortcut.description.includes('save') || shortcut.description.includes('cancel')) return 'Form Actions';
    return 'Other';
  };

  const getContextIcon = (context: string): string => {
    switch (context) {
      case 'General': return '⌨️';
      case 'Task Management': return '📋';
      case 'Navigation': return '🧭';
      case 'Form Actions': return '📝';
      default: return '⚡';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className={`w-full max-w-4xl max-h-[80vh] overflow-hidden ${className}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            <CardTitle>Keyboard Shortcuts</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">
            {Object.entries(groupedShortcuts).map(([context, contextShortcuts]) => (
              <div key={context} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getContextIcon(context)}</span>
                  <h3 className="text-lg font-semibold">{context}</h3>
                </div>
                
                <div className="grid gap-2">
                  {contextShortcuts.map((shortcut, index) => (
                    <div
                      key={`${shortcut.key}-${index}`}
                      className="flex items-center justify-between p-3 rounded-lg border bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
                    >
                      <span className="text-sm text-gray-700">
                        {shortcut.description}
                      </span>
                      <Badge variant="outline" className="font-mono text-xs">
                        {formatKeyCombo(shortcut)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                i
              </div>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Pro Tip:</p>
                <p>
                  Press <Badge variant="outline" className="font-mono text-xs">F1</Badge> anytime 
                  to toggle this help panel. All shortcuts work across the entire Hero Tasks system.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default KeyboardShortcutsHelp;
