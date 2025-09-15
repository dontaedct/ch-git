/**
 * @fileoverview FAQ Block View - HT-006 Phase 3
 * @module blocks-sandbox/FAQ/view
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-006 - Token-Driven Design System & Block-Based Architecture
 * Focus: JSON-driven block architecture with Zod validation
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: Medium (new architecture patterns, complex validation)
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FAQBlockContent } from './schema';

/**
 * FAQ Block View Component
 * 
 * Renders FAQ sections with accordion functionality, keyboard navigation,
 * and responsive design using design tokens exclusively.
 * Enhanced with high-tech aesthetic matching the home page design theme.
 */
interface FAQBlockViewProps {
  content: FAQBlockContent;
  className?: string;
}

export function FAQBlockView({ content, className = '' }: FAQBlockViewProps) {
  const { content: faqContent, layout, accessibility, seo } = content;
  const { header, faqs, cta } = faqContent;
  
  // State for accordion functionality
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };

  // Layout configuration with home page theme
  const layoutClasses = {
    alignment: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
    maxWidth: {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      '4xl': 'max-w-4xl',
      '6xl': 'max-w-6xl',
      '7xl': 'max-w-7xl',
      full: 'max-w-full',
    },
    padding: {
      none: 'py-0',
      sm: 'py-8',
      md: 'py-16',
      lg: 'py-32',
      xl: 'py-40',
    },
    background: {
      none: '',
      subtle: 'bg-gray-100 dark:bg-gray-900',
      gradient: 'bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900',
      pattern: 'bg-gray-100 dark:bg-gray-900',
    },
  };

  // Grid configuration
  const gridClasses = {
    '1': 'grid-cols-1',
    '2': 'grid-cols-1 md:grid-cols-2',
  }[layout.columns];

  // Toggle accordion item
  const toggleItem = (itemId: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, itemId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleItem(itemId);
    }
  };

  return (
    <section 
      className={`
        relative overflow-hidden
        ${layoutClasses.background[layout.background]}
        ${layoutClasses.padding[layout.padding]}
        ${className}
      `}
      aria-label={accessibility?.ariaLabel || 'FAQ Section'}
      role={accessibility?.role || 'region'}
    >
      {/* SEO metadata */}
      {seo?.title && <title>{seo.title}</title>}
      {seo?.description && <meta name="description" content={seo.description} />}
      {seo?.keywords && <meta name="keywords" content={seo.keywords.join(', ')} />}

      <div className={`mx-auto ${layoutClasses.maxWidth[layout.maxWidth]} ${layoutClasses.alignment[layout.alignment]} relative z-10`}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {/* Header */}
          <motion.div className="mb-20" variants={itemVariants}>
            <h2 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight tracking-tight text-gray-900 dark:text-gray-100">
              {header.title}
            </h2>
            {header.subtitle && (
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">
                {header.subtitle}
              </p>
            )}
            {header.description && (
              <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
                {header.description}
              </p>
            )}
          </motion.div>

          {/* FAQ Items */}
          <motion.div 
            className={`grid ${gridClasses} gap-6 mb-20`}
            variants={containerVariants}
          >
            {faqs.map((faq) => {
              const isOpen = openItems.has(faq.id);
              
              return (
                <motion.div key={faq.id} variants={itemVariants}>
                  <Card className={`
                    group high-tech-card high-tech-glow high-tech-shimmer high-tech-border rounded-2xl relative overflow-hidden transition-all duration-200
                    ${faq.featured ? 'ring-2 ring-blue-500 shadow-lg' : ''}
                  `}
                  style={{
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                  }}>
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-blue-50/0 to-blue-100/0 group-hover:from-blue-50/20 group-hover:via-blue-50/10 group-hover:to-blue-100/30 transition-all duration-100 ease-out" />
                    
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-100 bg-gradient-to-r from-blue-400/20 via-transparent to-blue-600/20 blur-xl" />
                    
                    <Collapsible open={isOpen} onOpenChange={() => toggleItem(faq.id)}>
                      <CollapsibleTrigger asChild>
                        <CardContent 
                          className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors relative z-10"
                          tabIndex={0}
                          role="button"
                          aria-expanded={isOpen}
                          aria-controls={`faq-${faq.id}`}
                          onKeyDown={(e) => handleKeyDown(e, faq.id)}
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 pr-4 group-hover:text-blue-500 transition-colors duration-100 high-tech-text">
                              {faq.question}
                            </h3>
                            <div className="flex items-center">
                              {faq.featured && (
                                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full mr-2 high-tech-button high-tech-glow">
                                  <span className="high-tech-text">Featured</span>
                                </span>
                              )}
                              <svg
                                className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''} group-hover:text-blue-500 transition-colors duration-100`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </CardContent>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <CardContent className="pt-0 px-6 pb-6 relative z-10">
                          <div 
                            id={`faq-${faq.id}`}
                            className="text-gray-700 dark:text-gray-300 leading-relaxed group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-100 high-tech-text"
                            dangerouslySetInnerHTML={{ 
                              __html: faq.answer.replace(/\n/g, '<br />') 
                            }}
                          />
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Section CTA */}
          {cta && (
            <motion.div 
              className="text-center"
              variants={itemVariants}
            >
              {cta.title && (
                <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  {cta.title}
                </h3>
              )}
              {cta.description && (
                <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                  {cta.description}
                </p>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant={cta.primary.variant}
                  size={cta.primary.size}
                  className="high-tech-button high-tech-glow high-tech-shimmer px-8 py-4 text-lg font-medium bg-gray-900 dark:bg-gray-100 text-white dark:text-black"
                  asChild
                >
                  <a 
                    href={cta.primary.href}
                    target={cta.primary.external ? '_blank' : undefined}
                    rel={cta.primary.external ? 'noopener noreferrer' : undefined}
                  >
                    <span className="high-tech-text">{cta.primary.text}</span>
                  </a>
                </Button>
                
                {cta.secondary && (
                  <Button
                    variant={cta.secondary.variant}
                    size={cta.secondary.size}
                    className="high-tech-button high-tech-glow high-tech-shimmer high-tech-border px-8 py-4 text-lg font-medium border bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                    asChild
                  >
                    <a 
                      href={cta.secondary.href}
                      target={cta.secondary.external ? '_blank' : undefined}
                      rel={cta.secondary.external ? 'noopener noreferrer' : undefined}
                    >
                      <span className="high-tech-text">{cta.secondary.text}</span>
                    </a>
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
