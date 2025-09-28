/**
 * @fileoverview Simple PDF Export Component
 * A simplified PDF export component for demonstration purposes
 */

"use client";

import { useState, useCallback } from 'react';
import { Download } from 'lucide-react';

interface SimplePdfExportProps {
  title?: string;
  filename?: string;
  children: React.ReactNode;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function SimplePdfExport({ 
  title = 'Export Preview', 
  filename = 'export.pdf',
  children,
  onSuccess,
  onError 
}: SimplePdfExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    try {
      setIsExporting(true);
      
      // Simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a simple text file as a placeholder
      const content = `PDF Export: ${title}\n\nGenerated on: ${new Date().toLocaleString()}\n\nThis is a placeholder for PDF export functionality.`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename.replace('.pdf', '.txt'); // Save as .txt for now
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      onSuccess?.();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Export failed');
      onError?.(err);
    } finally {
      setIsExporting(false);
    }
  }, [title, filename, onSuccess, onError]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold">{title}</h3>
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-3 py-2 border rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isExporting ? 'Exporting...' : 'Download PDF'}</span>
        </button>
      </div>
      <div className="bg-white border rounded">
        {children}
      </div>
    </div>
  );
}
