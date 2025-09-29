/**
 * Text Content Component
 *
 * Rich text content component with formatting support, typography controls,
 * and responsive design. Supports HTML content with sanitization.
 */

import React from 'react';
import { useTheme, useResponsive } from '../../lib/renderer/ThemeProvider';
import DOMPurify from 'isomorphic-dompurify';

export interface TextContentProps {
  content: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  fontSize?: 'small' | 'medium' | 'large' | 'xl';
  textColor?: string;
  backgroundColor?: string;
  maxWidth?: number;
  customCSS?: string;
  componentId?: string;
  mode?: 'preview' | 'live' | 'edit';
  viewport?: 'desktop' | 'tablet' | 'mobile';
  theme?: any;
  onInteraction?: (action: string, data?: any) => void;
}

const TextContent: React.FC<TextContentProps> = ({
  content,
  alignment = 'left',
  fontSize = 'medium',
  textColor,
  backgroundColor,
  maxWidth,
  customCSS,
  componentId,
  mode = 'live',
  viewport = 'desktop',
  onInteraction
}) => {
  const { theme } = useTheme();
  const { isMobile, isTablet } = useResponsive();

  // Sanitize HTML content to prevent XSS
  const sanitizedContent = React.useMemo(() => {
    if (!content) return '';

    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'mark', 'small', 'del', 'ins', 'sub', 'sup',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'blockquote', 'code', 'pre',
        'a', 'img',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span'
      ],
      ALLOWED_ATTR: [
        'href', 'title', 'target', 'rel',
        'src', 'alt', 'width', 'height',
        'class', 'id',
        'colspan', 'rowspan'
      ],
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|xxx):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
    });
  }, [content]);

  // Handle content interactions
  const handleContentClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // Handle link clicks
    if (target.tagName === 'A') {
      const href = target.getAttribute('href');
      if (mode === 'preview') {
        e.preventDefault();
        onInteraction?.('link_preview_click', { href });
        return;
      }

      onInteraction?.('link_click', { href });

      // Track analytics
      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track('Text Content Link Clicked', {
          componentId,
          href,
          linkText: target.textContent
        });
      }
    }

    // Handle image clicks
    if (target.tagName === 'IMG') {
      const src = target.getAttribute('src');
      onInteraction?.('image_click', { src });

      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track('Text Content Image Clicked', {
          componentId,
          src
        });
      }
    }
  };

  // Get font size classes
  const getFontSizeClasses = () => {
    const baseSizes = {
      small: isMobile ? 'text-sm' : 'text-base',
      medium: isMobile ? 'text-base' : 'text-lg',
      large: isMobile ? 'text-lg' : 'text-xl',
      xl: isMobile ? 'text-xl' : 'text-2xl'
    };

    return baseSizes[fontSize] || baseSizes.medium;
  };

  // Get alignment classes
  const getAlignmentClasses = () => {
    switch (alignment) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      case 'justify': return 'text-justify';
      case 'left':
      default: return 'text-left';
    }
  };

  const containerClasses = `
    text-content
    ${getFontSizeClasses()}
    ${getAlignmentClasses()}
    leading-relaxed
    ${mode === 'preview' ? 'pointer-events-none' : ''}
  `.trim();

  const containerStyles: React.CSSProperties = {
    color: textColor || 'var(--dct-color-text, #111827)',
    backgroundColor: backgroundColor || 'transparent',
    maxWidth: maxWidth ? `${maxWidth}px` : undefined,
    margin: alignment === 'center' ? '0 auto' : undefined,
    ...customCSS ? { '--custom-css': customCSS } : {}
  };

  return (
    <section
      className="text-content-section py-8 px-4"
      data-component-id={componentId}
      data-component-type="text"
    >
      <div
        className={containerClasses}
        style={containerStyles}
        onClick={handleContentClick}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        role="region"
        aria-label="Text content"
      />

      {/* Custom CSS injection */}
      {customCSS && (
        <style dangerouslySetInnerHTML={{ __html: customCSS }} />
      )}

      {/* Typography styles for rich content */}
      <style jsx>{`
        .text-content :global(h1),
        .text-content :global(h2),
        .text-content :global(h3),
        .text-content :global(h4),
        .text-content :global(h5),
        .text-content :global(h6) {
          font-weight: 700;
          line-height: 1.25;
          margin-bottom: 1rem;
          color: var(--dct-color-text, #111827);
        }

        .text-content :global(h1) {
          font-size: ${isMobile ? '2rem' : '2.5rem'};
          margin-bottom: 1.5rem;
        }

        .text-content :global(h2) {
          font-size: ${isMobile ? '1.75rem' : '2rem'};
        }

        .text-content :global(h3) {
          font-size: ${isMobile ? '1.5rem' : '1.75rem'};
        }

        .text-content :global(h4) {
          font-size: ${isMobile ? '1.25rem' : '1.5rem'};
        }

        .text-content :global(h5) {
          font-size: ${isMobile ? '1.125rem' : '1.25rem'};
        }

        .text-content :global(h6) {
          font-size: ${isMobile ? '1rem' : '1.125rem'};
        }

        .text-content :global(p) {
          margin-bottom: 1rem;
          line-height: 1.7;
        }

        .text-content :global(p:last-child) {
          margin-bottom: 0;
        }

        .text-content :global(a) {
          color: var(--dct-color-primary, #3b82f6);
          text-decoration: underline;
          transition: color 0.2s ease;
        }

        .text-content :global(a:hover) {
          color: var(--dct-color-primaryDark, #2563eb);
        }

        .text-content :global(strong),
        .text-content :global(b) {
          font-weight: 600;
        }

        .text-content :global(em),
        .text-content :global(i) {
          font-style: italic;
        }

        .text-content :global(mark) {
          background-color: var(--dct-color-accent, #fbbf24);
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
        }

        .text-content :global(code) {
          background-color: var(--dct-color-surface, #f3f4f6);
          color: var(--dct-color-accent, #d97706);
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-family: 'Courier New', monospace;
          font-size: 0.875em;
        }

        .text-content :global(pre) {
          background-color: var(--dct-color-surface, #1f2937);
          color: var(--dct-color-text, #f9fafb);
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .text-content :global(pre code) {
          background: none;
          color: inherit;
          padding: 0;
        }

        .text-content :global(blockquote) {
          border-left: 4px solid var(--dct-color-primary, #3b82f6);
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: var(--dct-color-textMuted, #6b7280);
        }

        .text-content :global(ul),
        .text-content :global(ol) {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }

        .text-content :global(li) {
          margin-bottom: 0.5rem;
        }

        .text-content :global(li:last-child) {
          margin-bottom: 0;
        }

        .text-content :global(img) {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .text-content :global(table) {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          font-size: 0.875rem;
        }

        .text-content :global(th),
        .text-content :global(td) {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid var(--dct-color-border, #e5e7eb);
        }

        .text-content :global(th) {
          font-weight: 600;
          background-color: var(--dct-color-surface, #f9fafb);
          color: var(--dct-color-text, #111827);
        }

        .text-content :global(tbody tr:hover) {
          background-color: var(--dct-color-surface, #f9fafb);
        }

        /* Dark mode support */
        .dark .text-content :global(h1),
        .dark .text-content :global(h2),
        .dark .text-content :global(h3),
        .dark .text-content :global(h4),
        .dark .text-content :global(h5),
        .dark .text-content :global(h6) {
          color: var(--dct-color-text, #f9fafb);
        }

        .dark .text-content :global(blockquote) {
          color: var(--dct-color-textMuted, #9ca3af);
        }

        .dark .text-content :global(code) {
          background-color: var(--dct-color-surface, #374151);
          color: var(--dct-color-accent, #fbbf24);
        }

        .dark .text-content :global(th) {
          background-color: var(--dct-color-surface, #374151);
          color: var(--dct-color-text, #f9fafb);
        }

        .dark .text-content :global(tbody tr:hover) {
          background-color: var(--dct-color-surface, #374151);
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .text-content :global(table) {
            font-size: 0.75rem;
          }

          .text-content :global(th),
          .text-content :global(td) {
            padding: 0.5rem;
          }

          .text-content :global(pre) {
            font-size: 0.75rem;
            padding: 0.75rem;
          }

          .text-content :global(blockquote) {
            padding-left: 0.75rem;
            margin: 1rem 0;
          }
        }

        /* Print styles */
        @media print {
          .text-content :global(a) {
            color: inherit;
            text-decoration: none;
          }

          .text-content :global(a[href]:after) {
            content: " (" attr(href) ")";
            font-size: 0.8em;
            color: #666;
          }
        }

        /* Accessibility improvements */
        .text-content :global(a:focus) {
          outline: 2px solid var(--dct-color-primary, #3b82f6);
          outline-offset: 2px;
          border-radius: 0.25rem;
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .text-content :global(a) {
            text-decoration: underline;
            text-decoration-thickness: 2px;
          }

          .text-content :global(mark) {
            background-color: yellow;
            color: black;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .text-content :global(a) {
            transition: none;
          }
        }
      `}</style>
    </section>
  );
};

export default TextContent;