/**
 * Button Component
 *
 * Versatile button component with multiple styles, sizes, and interactive states.
 * Supports icons, custom colors, and accessibility features.
 */

import React from 'react';
import { useTheme, useResponsive } from '../../lib/renderer/ThemeProvider';

export interface ButtonProps {
  text: string;
  url: string;
  style?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  openInNewTab?: boolean;
  icon?: string;
  customColor?: string;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  componentId?: string;
  mode?: 'preview' | 'live' | 'edit';
  viewport?: 'desktop' | 'tablet' | 'mobile';
  theme?: any;
  onInteraction?: (action: string, data?: any) => void;
}

const Button: React.FC<ButtonProps> = ({
  text,
  url,
  style = 'primary',
  size = 'medium',
  openInNewTab = false,
  icon,
  customColor,
  disabled = false,
  loading = false,
  fullWidth = false,
  componentId,
  mode = 'live',
  viewport = 'desktop',
  onInteraction
}) => {
  const { theme } = useTheme();
  const { isMobile } = useResponsive();

  // Handle button click
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }

    if (mode === 'preview') {
      e.preventDefault();
      onInteraction?.('button_preview_click', { text, url, style });
      return;
    }

    onInteraction?.('button_click', { text, url, style });

    // Track analytics
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('Button Clicked', {
        componentId,
        text,
        url,
        style,
        size
      });
    }
  };

  // Get base button classes
  const getBaseClasses = () => {
    return `
      inline-flex items-center justify-center
      font-semibold rounded-lg
      transition-all duration-200 ease-in-out
      focus:outline-none focus:ring-4 focus:ring-opacity-50
      disabled:opacity-50 disabled:cursor-not-allowed
      ${fullWidth ? 'w-full' : ''}
      ${disabled || loading ? 'pointer-events-none' : 'transform hover:scale-105 active:scale-95'}
      ${mode === 'preview' ? 'cursor-default' : 'cursor-pointer'}
    `.trim();
  };

  // Get size classes
  const getSizeClasses = () => {
    if (isMobile) {
      switch (size) {
        case 'small': return 'px-3 py-2 text-sm';
        case 'large': return 'px-6 py-4 text-lg';
        case 'medium':
        default: return 'px-4 py-3 text-base';
      }
    }

    switch (size) {
      case 'small': return 'px-4 py-2 text-sm';
      case 'large': return 'px-8 py-4 text-lg';
      case 'medium':
      default: return 'px-6 py-3 text-base';
    }
  };

  // Get style classes
  const getStyleClasses = () => {
    const primaryColor = customColor || 'var(--dct-color-primary, #3b82f6)';
    const primaryDark = customColor ? `color-mix(in srgb, ${customColor} 80%, black)` : 'var(--dct-color-primaryDark, #2563eb)';

    switch (style) {
      case 'primary':
        return {
          classes: 'text-white shadow-lg hover:shadow-xl',
          styles: {
            backgroundColor: primaryColor,
            borderColor: primaryColor,
            '--hover-bg': primaryDark
          }
        };

      case 'secondary':
        return {
          classes: 'text-white shadow-lg hover:shadow-xl',
          styles: {
            backgroundColor: 'var(--dct-color-secondary, #6b7280)',
            borderColor: 'var(--dct-color-secondary, #6b7280)',
            '--hover-bg': 'var(--dct-color-secondaryDark, #4b5563)'
          }
        };

      case 'outline':
        return {
          classes: 'border-2 bg-transparent hover:bg-opacity-10 shadow-sm hover:shadow-md',
          styles: {
            color: primaryColor,
            borderColor: primaryColor,
            '--hover-bg': primaryColor
          }
        };

      case 'ghost':
        return {
          classes: 'bg-transparent hover:bg-opacity-10 border border-transparent',
          styles: {
            color: primaryColor,
            '--hover-bg': primaryColor
          }
        };

      default:
        return {
          classes: 'text-white shadow-lg hover:shadow-xl',
          styles: {
            backgroundColor: primaryColor,
            borderColor: primaryColor,
            '--hover-bg': primaryDark
          }
        };
    }
  };

  // Get icon component
  const getIconComponent = () => {
    if (!icon) return null;

    const iconProps = {
      className: `w-5 h-5 ${text ? 'mr-2' : ''}`,
      'aria-hidden': true
    };

    switch (icon) {
      case 'arrow-right':
        return (
          <svg {...iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        );

      case 'download':
        return (
          <svg {...iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );

      case 'external-link':
        return (
          <svg {...iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        );

      case 'play':
        return (
          <svg {...iconProps} fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        );

      case 'heart':
        return (
          <svg {...iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );

      case 'star':
        return (
          <svg {...iconProps} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );

      default:
        return null;
    }
  };

  // Get loading spinner
  const getLoadingSpinner = () => (
    <svg
      className="animate-spin w-5 h-5 mr-2"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  const { classes: styleClasses, styles } = getStyleClasses();
  const buttonClasses = `${getBaseClasses()} ${getSizeClasses()} ${styleClasses}`;

  return (
    <section
      className="button-section py-4"
      data-component-id={componentId}
      data-component-type="button"
    >
      <div className={fullWidth ? 'w-full' : 'flex justify-center'}>
        <a
          href={mode === 'preview' ? '#' : url}
          onClick={handleClick}
          className={buttonClasses}
          style={styles}
          target={openInNewTab && mode !== 'preview' ? '_blank' : undefined}
          rel={openInNewTab && mode !== 'preview' ? 'noopener noreferrer' : undefined}
          role="button"
          aria-label={`${text}${mode === 'preview' ? ' - Preview mode' : ''}`}
          aria-disabled={disabled || loading}
        >
          {loading ? getLoadingSpinner() : getIconComponent()}
          {text && <span>{text}</span>}

          {/* External link indicator */}
          {openInNewTab && !loading && (
            <svg
              className="w-4 h-4 ml-1 opacity-70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          )}
        </a>
      </div>

      {/* Enhanced hover effects with CSS variables */}
      <style jsx>{`
        .button-section a:hover {
          background-color: var(--hover-bg);
        }

        @media (prefers-reduced-motion: reduce) {
          .button-section a {
            transition: none;
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .button-section a {
            border: 2px solid currentColor;
          }
        }

        /* Focus styles for better accessibility */
        .button-section a:focus {
          ring-color: var(--dct-color-primary, #3b82f6);
        }

        /* Print styles */
        @media print {
          .button-section a {
            color: black !important;
            background: white !important;
            border: 1px solid black !important;
          }

          .button-section a[href]:after {
            content: " (" attr(href) ")";
            font-size: 0.8em;
          }
        }
      `}</style>

      {/* Schema.org structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Action",
            "name": text,
            "target": url,
            "actionStatus": disabled ? "PotentialActionStatus" : "ActiveActionStatus"
          })
        }}
      />
    </section>
  );
};

export default Button;