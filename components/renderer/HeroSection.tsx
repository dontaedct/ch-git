/**
 * Hero Section Component
 *
 * Large header section with title, subtitle, and call-to-action button.
 * Supports multiple layouts, background images/videos, and responsive design.
 */

import React from 'react';
import { useTheme, useResponsive } from '../../lib/renderer/ThemeProvider';

export interface HeroSectionProps {
  title: string;
  subtitle?: string;
  ctaText: string;
  ctaUrl: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  layout?: 'centered' | 'left' | 'split';
  height?: 'small' | 'medium' | 'large' | 'fullscreen';
  showVideo?: boolean;
  videoUrl?: string;
  customCSS?: string;
  componentId?: string;
  mode?: 'preview' | 'live' | 'edit';
  viewport?: 'desktop' | 'tablet' | 'mobile';
  theme?: any;
  onInteraction?: (action: string, data?: any) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  ctaText,
  ctaUrl,
  backgroundImage,
  backgroundVideo,
  layout = 'centered',
  height = 'large',
  showVideo = false,
  videoUrl,
  customCSS,
  componentId,
  mode = 'live',
  viewport = 'desktop',
  onInteraction
}) => {
  const { theme } = useTheme();
  const { isMobile, isTablet } = useResponsive();

  // Handle CTA click
  const handleCtaClick = (e: React.MouseEvent) => {
    if (mode === 'preview') {
      e.preventDefault();
      onInteraction?.('cta_preview_click', { ctaText, ctaUrl });
      return;
    }

    onInteraction?.('cta_click', { ctaText, ctaUrl });

    // Track analytics
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('Hero CTA Clicked', {
        componentId,
        ctaText,
        ctaUrl,
        layout
      });
    }
  };

  // Get responsive height class
  const getHeightClass = () => {
    if (isMobile) {
      switch (height) {
        case 'small': return 'h-64';
        case 'medium': return 'h-80';
        case 'large': return 'h-96';
        case 'fullscreen': return 'min-h-screen';
        default: return 'h-96';
      }
    }

    switch (height) {
      case 'small': return 'h-96';
      case 'medium': return 'h-120';
      case 'large': return 'h-144';
      case 'fullscreen': return 'min-h-screen';
      default: return 'h-144';
    }
  };

  // Get layout classes
  const getLayoutClasses = () => {
    const base = 'relative flex items-center';

    switch (layout) {
      case 'left':
        return `${base} justify-start text-left px-8 lg:px-16`;
      case 'split':
        return `${base} justify-between px-8 lg:px-16`;
      case 'centered':
      default:
        return `${base} justify-center text-center px-8`;
    }
  };

  const containerClasses = `
    hero-section
    ${getHeightClass()}
    ${getLayoutClasses()}
    overflow-hidden
    ${mode === 'preview' ? 'pointer-events-none' : ''}
  `.trim();

  return (
    <section
      className={containerClasses}
      data-component-id={componentId}
      data-component-type="hero"
      style={{
        background: backgroundImage || backgroundVideo
          ? 'transparent'
          : 'linear-gradient(135deg, var(--dct-color-primary, #3b82f6) 0%, var(--dct-color-accent, #8b5cf6) 100%)',
        ...customCSS ? { '--custom-css': customCSS } : {}
      }}
    >
      {/* Background Media */}
      {(backgroundImage || (showVideo && videoUrl)) && (
        <div className="absolute inset-0 z-0">
          {showVideo && videoUrl ? (
            <video
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              onError={() => console.warn('Video failed to load:', videoUrl)}
            >
              <source src={videoUrl} type="video/mp4" />
              {backgroundImage && (
                <img
                  src={backgroundImage}
                  alt="Fallback background"
                  className="w-full h-full object-cover"
                />
              )}
            </video>
          ) : backgroundImage ? (
            <img
              src={backgroundImage}
              alt="Hero background"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : null}

          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
      )}

      {/* Content */}
      <div className={`
        hero-content
        relative z-10
        max-w-7xl mx-auto
        ${layout === 'split' ? 'grid grid-cols-1 lg:grid-cols-2 gap-8 items-center w-full' : ''}
      `}>
        <div className={layout === 'split' ? 'space-y-6' : 'space-y-6'}>
          {/* Title */}
          <h1 className={`
            hero-title
            font-bold
            text-white
            leading-tight
            ${isMobile ? 'text-3xl' : isTablet ? 'text-4xl lg:text-5xl' : 'text-5xl lg:text-6xl'}
            ${layout === 'left' ? 'text-left' : layout === 'split' ? 'text-left' : 'text-center'}
          `}>
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p className={`
              hero-subtitle
              text-white text-opacity-90
              ${isMobile ? 'text-lg' : 'text-xl lg:text-2xl'}
              max-w-3xl
              ${layout === 'left' ? 'text-left' : layout === 'split' ? 'text-left' : 'text-center mx-auto'}
            `}>
              {subtitle}
            </p>
          )}

          {/* CTA Button */}
          <div className={`
            hero-cta-container
            ${layout === 'left' ? 'flex justify-start' : layout === 'split' ? 'flex justify-start' : 'flex justify-center'}
          `}>
            <a
              href={mode === 'preview' ? '#' : ctaUrl}
              onClick={handleCtaClick}
              className={`
                hero-cta
                inline-flex items-center justify-center
                px-8 py-4
                bg-white bg-opacity-20
                hover:bg-opacity-30
                text-white font-semibold
                rounded-lg
                backdrop-filter backdrop-blur-sm
                border border-white border-opacity-30
                transition-all duration-300 ease-in-out
                transform hover:scale-105 hover:-translate-y-1
                focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50
                ${isMobile ? 'text-base px-6 py-3' : 'text-lg'}
                ${mode === 'preview' ? 'cursor-default' : 'cursor-pointer'}
              `}
              role="button"
              aria-label={`${ctaText} - ${mode === 'preview' ? 'Preview mode' : 'Navigate to ' + ctaUrl}`}
            >
              {ctaText}

              {/* Arrow icon */}
              <svg
                className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>
          </div>
        </div>

        {/* Split layout - right side content/image */}
        {layout === 'split' && (
          <div className="hidden lg:block">
            <div className="relative">
              {/* Placeholder for additional content in split layout */}
              <div className="aspect-w-16 aspect-h-12 bg-white bg-opacity-10 rounded-lg backdrop-filter backdrop-blur-sm border border-white border-opacity-20">
                <div className="flex items-center justify-center text-white text-opacity-70">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Performance optimization: Preload critical resources */}
      {backgroundImage && (
        <link rel="preload" as="image" href={backgroundImage} />
      )}

      {/* Custom CSS injection */}
      {customCSS && (
        <style dangerouslySetInnerHTML={{ __html: customCSS }} />
      )}

      {/* Schema.org structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPageElement",
            "name": title,
            "description": subtitle,
            "url": ctaUrl
          })
        }}
      />
    </section>
  );
};

export default HeroSection;