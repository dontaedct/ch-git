/**
 * @fileoverview HT-008.2.8: Image Optimization & Lazy Loading System
 * @module lib/performance/image-optimization
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.2.8 - Optimize images and implement lazy loading
 * Focus: Advanced image optimization with intelligent lazy loading
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (performance-critical image management)
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { logger } from '@/lib/observability/logger';
import { useMemoryLeakPrevention } from './memory-leak-detector';

/**
 * Image optimization configuration
 */
interface ImageOptimizationConfig {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  width?: number;
  height?: number;
  placeholder?: 'blur' | 'empty' | 'skeleton';
  lazy?: boolean;
  priority?: boolean;
  sizes?: string;
  loading?: 'lazy' | 'eager';
}

/**
 * Optimized image component
 */
interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  config?: ImageOptimizationConfig;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
  className?: string;
}

export function OptimizedImage({
  src,
  alt,
  config = {},
  fallback,
  onLoad,
  onError,
  className = '',
  ...props
}: OptimizedImageProps) {
  const {
    quality = 80,
    format = 'webp',
    width,
    height,
    placeholder = 'blur',
    lazy = true,
    priority = false,
    sizes,
    loading = 'lazy'
  } = config;

  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const { registerObserver, unregisterObserver } = useMemoryLeakPrevention();

  // Generate optimized image URL
  const optimizedSrc = useMemo(() => {
    if (!src) return '';
    
    // If it's already an optimized URL, return as is
    if (src.includes('_next/image') || src.includes('?')) {
      return src;
    }
    
    // Generate optimized URL with Next.js Image Optimization
    const params = new URLSearchParams();
    
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    if (quality !== 80) params.set('q', quality.toString());
    if (format !== 'webp') params.set('f', format);
    
    const baseUrl = src.startsWith('/') ? src : `/${src}`;
    return `${baseUrl}?${params.toString()}`;
  }, [src, width, height, quality, format]);

  // Generate placeholder
  const placeholderSrc = useMemo(() => {
    if (placeholder === 'blur') {
      return `data:image/svg+xml;base64,${btoa(`
        <svg width="${width || 400}" height="${height || 300}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f3f4f6"/>
          <rect width="100%" height="100%" fill="url(#gradient)"/>
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
            </linearGradient>
          </defs>
        </svg>
      `)}`;
    }
    return '';
  }, [placeholder, width, height]);

  // Intersection observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            if (observerRef.current) {
              observerRef.current.disconnect();
            }
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    if (imgRef.current && observerRef.current) {
      observerRef.current.observe(imgRef.current);
      registerObserver(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        unregisterObserver(observerRef.current);
        observerRef.current.disconnect();
      }
    };
  }, [lazy, priority, isInView, registerObserver, unregisterObserver]);

  // Load image when in view
  useEffect(() => {
    if (isInView && optimizedSrc) {
      setCurrentSrc(optimizedSrc);
    }
  }, [isInView, optimizedSrc]);

  // Handle image load
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setIsError(false);
    onLoad?.();
    
    logger.info('Image loaded successfully', {
      src: optimizedSrc,
      width,
      height,
      format,
      quality
    });
  }, [optimizedSrc, width, height, format, quality, onLoad]);

  // Handle image error
  const handleError = useCallback(() => {
    setIsError(true);
    setIsLoaded(false);
    
    if (fallback) {
      setCurrentSrc(fallback);
    }
    
    onError?.();
    
    logger.warn('Image failed to load', {
      src: optimizedSrc,
      fallback: !!fallback
    });
  }, [optimizedSrc, fallback, onError]);

  // Generate responsive sizes
  const responsiveSizes = useMemo(() => {
    if (sizes) return sizes;
    
    if (width && height) {
      return `(max-width: 768px) ${Math.min(width, 400)}px, ${width}px`;
    }
    
    return '100vw';
  }, [sizes, width, height]);

  return (
    <div
      className={`optimized-image-container ${className}`}
      style={{
        position: 'relative',
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : 'auto',
        overflow: 'hidden'
      }}
    >
      {/* Placeholder */}
      {!isLoaded && placeholderSrc && (
        <img
          src={placeholderSrc}
          alt=""
          className="image-placeholder"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'blur(5px)',
            transform: 'scale(1.1)'
          }}
        />
      )}
      
      {/* Main image */}
      {currentSrc && (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          className={`optimized-image ${isLoaded ? 'loaded' : 'loading'}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out'
          }}
          loading={priority ? 'eager' : loading}
          sizes={responsiveSizes}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}
      
      {/* Loading indicator */}
      {!isLoaded && !isError && (
        <div
          className="image-loading-indicator"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#666',
            fontSize: '14px'
          }}
        >
          Loading...
        </div>
      )}
      
      {/* Error state */}
      {isError && !fallback && (
        <div
          className="image-error-state"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#999',
            fontSize: '14px',
            textAlign: 'center'
          }}
        >
          <div>⚠️</div>
          <div>Image failed to load</div>
        </div>
      )}
    </div>
  );
}

/**
 * Lazy image gallery component
 */
interface LazyImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    width?: number;
    height?: number;
  }>;
  columns?: number;
  gap?: number;
  onImageClick?: (index: number) => void;
}

export function LazyImageGallery({
  images,
  columns = 3,
  gap = 16,
  onImageClick
}: LazyImageGalleryProps) {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const handleImageLoad = useCallback((index: number) => {
    setLoadedImages(prev => new Set([...prev, index]));
  }, []);

  const galleryStyle = useMemo(() => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${gap}px`,
    width: '100%'
  }), [columns, gap]);

  return (
    <div className="lazy-image-gallery" style={galleryStyle}>
      {images.map((image, index) => (
        <OptimizedImage
          key={index}
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          config={{
            lazy: true,
            placeholder: 'blur',
            quality: 85
          }}
          onLoad={() => handleImageLoad(index)}
          onClick={() => onImageClick?.(index)}
          className="gallery-image"
          style={{
            cursor: onImageClick ? 'pointer' : 'default',
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        />
      ))}
    </div>
  );
}

/**
 * Responsive image component
 */
interface ResponsiveImageProps {
  src: string;
  alt: string;
  breakpoints?: Array<{
    width: number;
    height: number;
    media: string;
  }>;
  defaultWidth?: number;
  defaultHeight?: number;
}

export function ResponsiveImage({
  src,
  alt,
  breakpoints = [],
  defaultWidth = 800,
  defaultHeight = 600
}: ResponsiveImageProps) {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<number>(defaultWidth);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const breakpoint = breakpoints.find(bp => 
        window.matchMedia(bp.media).matches
      );
      
      if (breakpoint) {
        setCurrentBreakpoint(breakpoint.width);
      } else {
        setCurrentBreakpoint(defaultWidth);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoints, defaultWidth]);

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={currentBreakpoint}
      height={defaultHeight}
      config={{
        quality: 85,
        format: 'webp',
        lazy: true,
        placeholder: 'blur'
      }}
    />
  );
}

/**
 * Image optimization utilities
 */
export const ImageOptimizationUtils = {
  /**
   * Generate optimized image URL
   */
  generateOptimizedUrl: (
    src: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: string;
    } = {}
  ): string => {
    const { width, height, quality = 80, format = 'webp' } = options;
    
    if (!src) return '';
    
    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    if (quality !== 80) params.set('q', quality.toString());
    if (format !== 'webp') params.set('f', format);
    
    const baseUrl = src.startsWith('/') ? src : `/${src}`;
    return `${baseUrl}?${params.toString()}`;
  },

  /**
   * Generate responsive image sizes
   */
  generateResponsiveSizes: (width: number): string => {
    return `(max-width: 768px) ${Math.min(width, 400)}px, ${width}px`;
  },

  /**
   * Generate blur placeholder
   */
  generateBlurPlaceholder: (width: number, height: number): string => {
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <rect width="100%" height="100%" fill="url(#gradient)"/>
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
          </linearGradient>
        </defs>
      </svg>
    `)}`;
  },

  /**
   * Check if image format is supported
   */
  isFormatSupported: (format: string): boolean => {
    if (typeof window === 'undefined') return false;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    try {
      return canvas.toDataURL(`image/${format}`).indexOf(`image/${format}`) === 5;
    } catch {
      return false;
    }
  },

  /**
   * Get optimal image format
   */
  getOptimalFormat: (): string => {
    if (ImageOptimizationUtils.isFormatSupported('avif')) return 'avif';
    if (ImageOptimizationUtils.isFormatSupported('webp')) return 'webp';
    return 'jpeg';
  },

  /**
   * Calculate optimal image dimensions
   */
  calculateOptimalDimensions: (
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } => {
    const aspectRatio = originalWidth / originalHeight;
    
    let width = originalWidth;
    let height = originalHeight;
    
    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }
    
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
    
    return {
      width: Math.round(width),
      height: Math.round(height)
    };
  }
};

/**
 * Image optimization hook
 */
export function useImageOptimization() {
  const [isWebPSupported, setIsWebPSupported] = useState(false);
  const [isAVIFSupported, setIsAVIFSupported] = useState(false);

  useEffect(() => {
    setIsWebPSupported(ImageOptimizationUtils.isFormatSupported('webp'));
    setIsAVIFSupported(ImageOptimizationUtils.isFormatSupported('avif'));
  }, []);

  const getOptimalFormat = useCallback(() => {
    return ImageOptimizationUtils.getOptimalFormat();
  }, []);

  const generateOptimizedUrl = useCallback((
    src: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: string;
    } = {}
  ) => {
    return ImageOptimizationUtils.generateOptimizedUrl(src, {
      ...options,
      format: options.format || getOptimalFormat()
    });
  }, [getOptimalFormat]);

  return {
    isWebPSupported,
    isAVIFSupported,
    getOptimalFormat,
    generateOptimizedUrl
  };
}

export default OptimizedImage;
