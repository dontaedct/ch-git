/**
 * Preview Harness UI
 *
 * Main preview interface for rendering manifests with viewport controls,
 * error handling, and real-time updates. Supports both template and form previews.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ManifestRenderer } from '../../lib/renderer/ManifestRenderer';
import { ThemeProvider } from '../../lib/renderer/ThemeProvider';
import { TemplateManifest, FormManifest } from '../../types/componentContracts';

export interface PreviewHarnessProps {
  manifest?: TemplateManifest | FormManifest;
  initialViewport?: 'desktop' | 'tablet' | 'mobile';
  showControls?: boolean;
  autoRefresh?: boolean;
  onError?: (error: Error) => void;
  onInteraction?: (componentId: string, action: string, data?: any) => void;
  className?: string;
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

interface ViewportConfig {
  width: number;
  height: number;
  label: string;
  icon: string;
}

const viewportConfigs: Record<ViewportSize, ViewportConfig> = {
  desktop: { width: 1200, height: 800, label: 'Desktop', icon: '🖥️' },
  tablet: { width: 768, height: 1024, label: 'Tablet', icon: '📱' },
  mobile: { width: 375, height: 667, label: 'Mobile', icon: '📱' }
};

export const PreviewHarness: React.FC<PreviewHarnessProps> = ({
  manifest,
  initialViewport = 'desktop',
  showControls = true,
  autoRefresh = true,
  onError,
  onInteraction,
  className = ''
}) => {
  const [viewport, setViewport] = useState<ViewportSize>(initialViewport);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [scale, setScale] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showRulers, setShowRulers] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const previewFrameRef = useRef<HTMLDivElement>(null);

  // Calculate scale to fit viewport
  const calculateScale = useCallback(() => {
    if (!previewContainerRef.current) return 1;

    const container = previewContainerRef.current;
    const containerWidth = container.clientWidth - 40; // Account for padding
    const containerHeight = container.clientHeight - 40;

    const viewportConfig = viewportConfigs[viewport];
    const scaleX = containerWidth / viewportConfig.width;
    const scaleY = containerHeight / viewportConfig.height;

    return Math.min(scaleX, scaleY, 1); // Don't scale up beyond 100%
  }, [viewport]);

  // Update scale when viewport or container size changes
  useEffect(() => {
    const updateScale = () => {
      const newScale = calculateScale();
      setScale(newScale);
    };

    updateScale();

    const resizeObserver = new ResizeObserver(updateScale);
    if (previewContainerRef.current) {
      resizeObserver.observe(previewContainerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [calculateScale]);

  // Handle manifest changes
  useEffect(() => {
    if (manifest && autoRefresh) {
      handleRefresh();
    }
  }, [manifest, autoRefresh]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (!manifest) return;

    setIsRefreshing(true);
    setError(null);

    try {
      // Simulate API call to validate manifest
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate thumbnail if needed
      if (typeof onInteraction === 'function') {
        onInteraction('preview_refresh', { viewport, timestamp: Date.now() });
      }
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
    } finally {
      setIsRefreshing(false);
    }
  }, [manifest, viewport, onInteraction, onError]);

  // Handle viewport change
  const handleViewportChange = (newViewport: ViewportSize) => {
    setViewport(newViewport);
    onInteraction?.('viewport_change', { from: viewport, to: newViewport });
  };

  // Handle component interactions
  const handleComponentInteraction = (componentId: string, action: string, data?: any) => {
    setInteractionCount(prev => prev + 1);
    onInteraction?.(componentId, action, data);
  };

  // Handle error boundary
  const handleError = (error: Error) => {
    setError(error);
    onError?.(error);
  };

  // Render viewport controls
  const renderViewportControls = () => (
    <div className="preview-controls bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Viewport selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Viewport:</span>
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            {Object.entries(viewportConfigs).map(([key, config]) => (
              <button
                key={key}
                onClick={() => handleViewportChange(key as ViewportSize)}
                className={`
                  flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-all
                  ${viewport === key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
                aria-label={`Switch to ${config.label} viewport`}
              >
                <span>{config.icon}</span>
                <span>{config.label}</span>
                <span className="text-xs text-gray-500">
                  {config.width}×{config.height}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3">
          {/* Scale indicator */}
          <div className="text-sm text-gray-600">
            Scale: {Math.round(scale * 100)}%
          </div>

          {/* Grid toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`
              p-2 rounded-md text-sm transition-all
              ${showGrid
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }
            `}
            aria-label="Toggle grid overlay"
            title="Toggle grid overlay"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Rulers toggle */}
          <button
            onClick={() => setShowRulers(!showRulers)}
            className={`
              p-2 rounded-md text-sm transition-all
              ${showRulers
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }
            `}
            aria-label="Toggle rulers"
            title="Toggle rulers"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
            </svg>
          </button>

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="
              flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md
              hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
              transition-all text-sm font-medium
            "
            aria-label="Refresh preview"
          >
            <svg
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <span>Interactions: {interactionCount}</span>
          {manifest && (
            <>
              <span>Type: {'components' in manifest ? 'Template' : 'Form'}</span>
              <span>ID: {manifest.id}</span>
            </>
          )}
        </div>

        {error && (
          <div className="flex items-center space-x-1 text-red-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Preview error</span>
          </div>
        )}
      </div>
    </div>
  );

  // Render grid overlay
  const renderGridOverlay = () => {
    if (!showGrid) return null;

    const config = viewportConfigs[viewport];
    const gridSize = 20;
    const cols = Math.ceil(config.width / gridSize);
    const rows = Math.ceil(config.height / gridSize);

    return (
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px`
        }}
      />
    );
  };

  // Render rulers
  const renderRulers = () => {
    if (!showRulers) return null;

    const config = viewportConfigs[viewport];

    return (
      <>
        {/* Horizontal ruler */}
        <div className="absolute -top-6 left-0 right-0 h-6 bg-gray-100 border-b border-gray-300 flex items-end">
          {Array.from({ length: Math.ceil(config.width / 50) }, (_, i) => (
            <div
              key={i}
              className="flex-shrink-0 h-full border-r border-gray-300 flex items-end justify-center"
              style={{ width: '50px' }}
            >
              <span className="text-xs text-gray-600 mb-1">{i * 50}</span>
            </div>
          ))}
        </div>

        {/* Vertical ruler */}
        <div className="absolute -left-6 top-0 bottom-0 w-6 bg-gray-100 border-r border-gray-300">
          {Array.from({ length: Math.ceil(config.height / 50) }, (_, i) => (
            <div
              key={i}
              className="border-b border-gray-300 flex items-center justify-center"
              style={{ height: '50px' }}
            >
              <span
                className="text-xs text-gray-600 transform -rotate-90"
                style={{ writingMode: 'vertical-rl' }}
              >
                {i * 50}
              </span>
            </div>
          ))}
        </div>
      </>
    );
  };

  const currentViewportConfig = viewportConfigs[viewport];

  return (
    <div className={`preview-harness flex flex-col h-full bg-gray-50 ${className}`}>
      {/* Controls */}
      {showControls && renderViewportControls()}

      {/* Preview container */}
      <div
        ref={previewContainerRef}
        className="flex-1 relative p-4 overflow-auto"
        style={{ minHeight: showControls ? 'calc(100vh - 120px)' : '100vh' }}
      >
        {showRulers && renderRulers()}

        {/* Preview frame */}
        <div
          className="mx-auto relative bg-white shadow-lg rounded-lg overflow-hidden"
          style={{
            width: currentViewportConfig.width * scale,
            height: currentViewportConfig.height * scale,
            transform: `scale(${scale})`,
            transformOrigin: 'top center'
          }}
        >
          {renderGridOverlay()}

          {/* Content */}
          <div
            ref={previewFrameRef}
            className="w-full h-full overflow-auto"
            style={{
              width: currentViewportConfig.width,
              height: currentViewportConfig.height
            }}
          >
            {error ? (
              <div className="flex items-center justify-center h-full bg-red-50">
                <div className="text-center p-8">
                  <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-red-900 mb-2">Preview Error</h3>
                  <p className="text-red-700 mb-4">{error.message}</p>
                  <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : !manifest ? (
              <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="text-center p-8">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Preview Available</h3>
                  <p className="text-gray-600">Provide a manifest to see the preview</p>
                </div>
              </div>
            ) : (
              <ThemeProvider theme={manifest.theme}>
                <ManifestRenderer
                  manifest={manifest}
                  mode="preview"
                  viewport={viewport}
                  onComponentInteraction={handleComponentInteraction}
                  analytics={false}
                />
              </ThemeProvider>
            )}
          </div>
        </div>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
            <div className="text-center">
              <svg className="animate-spin w-8 h-8 text-blue-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-gray-600">Loading preview...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewHarness;