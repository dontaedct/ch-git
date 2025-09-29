/**
 * Responsive Preview Component
 *
 * Enhanced preview component with responsive breakpoint testing,
 * device simulation, and performance monitoring.
 */

import React, { useState, useEffect, useRef } from 'react';
import { PreviewHarness } from './PreviewHarness';
import { TemplateManifest, FormManifest } from '../../types/componentContracts';

export interface ResponsivePreviewProps {
  manifest?: TemplateManifest | FormManifest;
  onError?: (error: Error) => void;
  onInteraction?: (componentId: string, action: string, data?: any) => void;
}

interface DevicePreset {
  name: string;
  width: number;
  height: number;
  pixelRatio: number;
  userAgent: string;
  category: 'phone' | 'tablet' | 'desktop' | 'tv';
  orientation?: 'portrait' | 'landscape';
}

const devicePresets: DevicePreset[] = [
  // Phones
  {
    name: 'iPhone 14 Pro',
    width: 393,
    height: 852,
    pixelRatio: 3,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
    category: 'phone',
    orientation: 'portrait'
  },
  {
    name: 'iPhone 14 Pro Landscape',
    width: 852,
    height: 393,
    pixelRatio: 3,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
    category: 'phone',
    orientation: 'landscape'
  },
  {
    name: 'Samsung Galaxy S23',
    width: 360,
    height: 780,
    pixelRatio: 3,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S911B)',
    category: 'phone',
    orientation: 'portrait'
  },

  // Tablets
  {
    name: 'iPad Pro 12.9"',
    width: 1024,
    height: 1366,
    pixelRatio: 2,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)',
    category: 'tablet',
    orientation: 'portrait'
  },
  {
    name: 'iPad Pro 12.9" Landscape',
    width: 1366,
    height: 1024,
    pixelRatio: 2,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)',
    category: 'tablet',
    orientation: 'landscape'
  },
  {
    name: 'Surface Pro 9',
    width: 912,
    height: 1368,
    pixelRatio: 2,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    category: 'tablet',
    orientation: 'portrait'
  },

  // Desktop
  {
    name: 'MacBook Air',
    width: 1280,
    height: 800,
    pixelRatio: 2,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    category: 'desktop'
  },
  {
    name: 'MacBook Pro 16"',
    width: 1512,
    height: 982,
    pixelRatio: 2,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    category: 'desktop'
  },
  {
    name: 'Desktop 1080p',
    width: 1920,
    height: 1080,
    pixelRatio: 1,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    category: 'desktop'
  },
  {
    name: 'Desktop 4K',
    width: 3840,
    height: 2160,
    pixelRatio: 2,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    category: 'desktop'
  },

  // TV/Large screens
  {
    name: 'Apple TV 4K',
    width: 1920,
    height: 1080,
    pixelRatio: 1,
    userAgent: 'Mozilla/5.0 (Apple TV; CPU OS 15_0 like Mac OS X)',
    category: 'tv'
  }
];

export const ResponsivePreview: React.FC<ResponsivePreviewProps> = ({
  manifest,
  onError,
  onInteraction
}) => {
  const [selectedDevice, setSelectedDevice] = useState<DevicePreset>(devicePresets[0]);
  const [customWidth, setCustomWidth] = useState(1200);
  const [customHeight, setCustomHeight] = useState(800);
  const [useCustomSize, setUseCustomSize] = useState(false);
  const [showDeviceFrame, setShowDeviceFrame] = useState(true);
  const [performanceData, setPerformanceData] = useState<{
    renderTime: number;
    componentCount: number;
    memoryUsage?: number;
  } | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);
  const performanceObserverRef = useRef<PerformanceObserver | null>(null);

  // Monitor performance
  useEffect(() => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      performanceObserverRef.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const renderEntry = entries.find(entry => entry.name.includes('render'));

        if (renderEntry) {
          setPerformanceData(prev => ({
            ...prev,
            renderTime: renderEntry.duration
          }));
        }
      });

      performanceObserverRef.current.observe({ entryTypes: ['measure', 'navigation'] });
    }

    return () => {
      if (performanceObserverRef.current) {
        performanceObserverRef.current.disconnect();
      }
    };
  }, []);

  // Update component count when manifest changes
  useEffect(() => {
    if (manifest) {
      const componentCount = 'components' in manifest
        ? manifest.components.length
        : manifest.fields.length;

      setPerformanceData(prev => ({
        ...prev || { renderTime: 0 },
        componentCount
      }));
    }
  }, [manifest]);

  // Handle device selection
  const handleDeviceChange = (device: DevicePreset) => {
    setSelectedDevice(device);
    setUseCustomSize(false);
  };

  // Handle custom size toggle
  const handleCustomSizeToggle = () => {
    setUseCustomSize(!useCustomSize);
  };

  // Get current viewport dimensions
  const getCurrentDimensions = () => {
    if (useCustomSize) {
      return { width: customWidth, height: customHeight };
    }
    return { width: selectedDevice.width, height: selectedDevice.height };
  };

  // Render device frame
  const renderDeviceFrame = (children: React.ReactNode) => {
    if (!showDeviceFrame || useCustomSize) {
      return children;
    }

    const { category, name, orientation } = selectedDevice;
    const { width, height } = getCurrentDimensions();

    // Device-specific frame styles
    const getFrameStyle = () => {
      switch (category) {
        case 'phone':
          return {
            padding: '60px 20px',
            background: 'linear-gradient(145deg, #2d3748, #1a202c)',
            borderRadius: orientation === 'landscape' ? '40px 20px 20px 40px' : '40px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          };
        case 'tablet':
          return {
            padding: '40px 30px',
            background: 'linear-gradient(145deg, #4a5568, #2d3748)',
            borderRadius: '20px',
            boxShadow: '0 15px 30px rgba(0,0,0,0.2)'
          };
        default:
          return {
            padding: '20px',
            background: 'linear-gradient(145deg, #1a202c, #2d3748)',
            borderRadius: '10px',
            boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
          };
      }
    };

    return (
      <div className="flex items-center justify-center min-h-screen p-8 bg-gray-100">
        <div style={getFrameStyle()}>
          {/* Device label */}
          <div className="text-white text-sm font-medium text-center mb-4">
            {name}
          </div>

          {/* Screen */}
          <div
            className="bg-white rounded-lg overflow-hidden shadow-inner"
            style={{ width, height }}
          >
            {children}
          </div>

          {/* Home indicator for phones */}
          {category === 'phone' && orientation === 'portrait' && (
            <div className="flex justify-center mt-4">
              <div className="w-32 h-1 bg-white bg-opacity-30 rounded-full"></div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render device selector
  const renderDeviceSelector = () => (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Device Preview</h3>

        <div className="flex items-center space-x-4">
          {/* Performance metrics */}
          {performanceData && (
            <div className="text-sm text-gray-600 flex items-center space-x-4">
              <span>Components: {performanceData.componentCount}</span>
              <span>Render: {performanceData.renderTime.toFixed(1)}ms</span>
              {performanceData.memoryUsage && (
                <span>Memory: {(performanceData.memoryUsage / 1024 / 1024).toFixed(1)}MB</span>
              )}
            </div>
          )}

          {/* Device frame toggle */}
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={showDeviceFrame}
              onChange={(e) => setShowDeviceFrame(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span>Show device frame</span>
          </label>
        </div>
      </div>

      {/* Device categories */}
      <div className="flex items-center space-x-6 mb-4">
        {['phone', 'tablet', 'desktop', 'tv'].map(category => (
          <div key={category}>
            <h4 className="text-sm font-medium text-gray-700 mb-2 capitalize">
              {category}
            </h4>
            <div className="flex items-center space-x-2">
              {devicePresets
                .filter(device => device.category === category)
                .map(device => (
                  <button
                    key={`${device.name}-${device.orientation || 'default'}`}
                    onClick={() => handleDeviceChange(device)}
                    className={`
                      px-3 py-2 text-xs rounded-md transition-all
                      ${selectedDevice === device && !useCustomSize
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                    title={`${device.width}×${device.height} @ ${device.pixelRatio}x`}
                  >
                    {device.name}
                    {device.orientation && (
                      <span className="ml-1 opacity-75">
                        ({device.orientation === 'landscape' ? '↔' : '↕'})
                      </span>
                    )}
                  </button>
                ))
              }
            </div>
          </div>
        ))}
      </div>

      {/* Custom size controls */}
      <div className="flex items-center space-x-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={useCustomSize}
            onChange={handleCustomSizeToggle}
            className="rounded border-gray-300"
          />
          <span className="text-sm font-medium">Custom size</span>
        </label>

        {useCustomSize && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Width:</label>
              <input
                type="number"
                value={customWidth}
                onChange={(e) => setCustomWidth(Number(e.target.value))}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                min="320"
                max="4000"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Height:</label>
              <input
                type="number"
                value={customHeight}
                onChange={(e) => setCustomHeight(Number(e.target.value))}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                min="240"
                max="3000"
              />
            </div>
          </div>
        )}

        <div className="text-sm text-gray-500">
          Current: {getCurrentDimensions().width}×{getCurrentDimensions().height}
          {!useCustomSize && (
            <span className="ml-2">@ {selectedDevice.pixelRatio}x DPR</span>
          )}
        </div>
      </div>
    </div>
  );

  const { width, height } = getCurrentDimensions();

  return (
    <div className="responsive-preview flex flex-col h-full">
      {renderDeviceSelector()}

      <div ref={previewRef} className="flex-1 overflow-hidden">
        {showDeviceFrame && !useCustomSize ? (
          renderDeviceFrame(
            <div style={{ width, height }}>
              <PreviewHarness
                manifest={manifest}
                initialViewport={selectedDevice.category === 'phone' ? 'mobile' :
                               selectedDevice.category === 'tablet' ? 'tablet' : 'desktop'}
                showControls={false}
                onError={onError}
                onInteraction={onInteraction}
              />
            </div>
          )
        ) : (
          <div className="w-full h-full" style={{ maxWidth: width, maxHeight: height, margin: '0 auto' }}>
            <PreviewHarness
              manifest={manifest}
              initialViewport={selectedDevice.category === 'phone' ? 'mobile' :
                             selectedDevice.category === 'tablet' ? 'tablet' : 'desktop'}
              showControls={true}
              onError={onError}
              onInteraction={onInteraction}
            />
          </div>
        )}
      </div>

      {/* Device simulation styles */}
      <style jsx>{`
        .responsive-preview {
          /* Simulate device pixel ratio */
          ${!useCustomSize ? `
            transform: scale(${1 / selectedDevice.pixelRatio});
            transform-origin: top left;
          ` : ''}
        }

        @media (max-width: 768px) {
          .responsive-preview {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
};

export default ResponsivePreview;