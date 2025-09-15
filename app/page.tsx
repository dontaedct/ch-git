/**
 * @fileoverview Test Home Page - Optimized Layout
 * Perfect spacing, responsive design, and performance optimized
 */
"use client";

import { motion, useScroll, useTransform, useMotionValue, useSpring, useAnimation } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

// Enhanced Carousel Component with True Infinite Scrolling
interface EnhancedCarouselProps {
  isDark: boolean;
  isMobile: boolean;
}

// Testimonials Carousel Component
interface TestimonialsCarouselProps {
  isDark: boolean;
  isMobile: boolean;
}

function EnhancedCarousel({ isDark, isMobile }: EnhancedCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const interactionTimeoutRef = useRef<NodeJS.Timeout>();
  const animationRef = useRef<NodeJS.Timeout>();

  const demos = [
    { 
      title: "Lead Capture System", 
      icon: "🎯", 
      status: "Live", 
      description: "Intelligent lead capture system optimizing conversion rates",
      tier: "Core",
      preview: "Public landing page → Structured capture → Auto-qualification → CRM routing",
      features: ["Smart Form Builder", "Auto Enrichment API", "Lead Scoring Engine", "Real-time Routing"]
    },
    { 
      title: "Document Generator", 
      icon: "📄", 
      status: "Live", 
      description: "Template-based document automation with intelligent formatting",
      tier: "Core",
      preview: "Input data → Template processing → PDF/HTML output → Email delivery",
      features: ["Dynamic Templates", "Multi-format Export", "Email Integration", "Version Control"]
    },
    { 
      title: "Automation Engine", 
      icon: "⚡", 
      status: "Live", 
      description: "Multi-step workflow orchestration with intelligent triggers",
      tier: "Core",
      preview: "Trigger events → Workflow execution → Multi-step automation → Notifications",
      features: ["Webhook System", "Flow Builder", "Alert Manager", "Audit Logger"]
    },
    { 
      title: "CRM Pipeline", 
      icon: "👥", 
      status: "Live", 
      description: "Customer relationship management with pipeline analytics",
      tier: "Mid-tier",
      preview: "Contact management → Opportunity pipeline → Activity tracking → Reporting",
      features: ["Contact Manager", "Pipeline Tracker", "Activity Monitor", "Reports Dashboard"]
    },
    { 
      title: "AI Extraction Suite", 
      icon: "🧠", 
      status: "Live", 
      description: "Advanced AI-powered document and media processing system",
      tier: "Premium",
      preview: "Upload files → AI extraction → Structured data → Workflow integration",
      features: ["Multimodal Parser", "Neural Networks", "Data Extraction", "API Gateway"]
    },
    { 
      title: "Approval Workflows", 
      icon: "✅", 
      status: "Live", 
      description: "Enterprise approval system with role-based routing",
      tier: "Premium",
      preview: "Submit request → Route to approvers → Track progress → Complete workflow",
      features: ["Role Engine", "Approval Chain", "Audit System", "Notification Hub"]
    },
    { 
      title: "System Admin", 
      icon: "⚙️", 
      status: "Live", 
      description: "Comprehensive system monitoring and module management",
      tier: "Core",
      preview: "Module dashboard → Enable/disable features → View logs → Monitor health",
      features: ["Module Manager", "Health Monitor", "Log Analyzer", "Metrics Dashboard"]
    },
    { 
      title: "Payment Gateway", 
      icon: "💳", 
      status: "Live", 
      description: "Secure payment processing with automated invoicing",
      tier: "Mid-tier",
      preview: "Create invoice → Process payment → Generate receipt → Link to records",
      features: ["Payment Processor", "Invoice Generator", "Receipt System", "Record Linker"]
    }
  ];

  const cardWidth = isMobile ? 280 : 384;
  const gap = isMobile ? 20 : 32;
  const scrollStep = cardWidth + gap;
  const sidePreview = isMobile ? 40 : 0; // Show part of adjacent cards on mobile
  const cardsToShow = 3; // Number of cards to show on desktop

  // Create enough copies for smooth infinite scroll - start from middle set
  const loopedDemos = [...demos, ...demos, ...demos];
  
  // Initialize position to start from the middle set to allow scrolling both ways
  useEffect(() => {
    x.set(-demos.length * scrollStep);
  }, [demos.length, scrollStep, x]);

  // Auto-scroll animation
  useEffect(() => {
    if (!isUserInteracting && !isHovering) {
      const autoScroll = () => {
        const currentX = x.get();
        const newX = currentX - scrollStep;
        
        // Animate to new position
        const startX = currentX;
        const distance = newX - startX;
        const duration = 400;
        const startTime = Date.now();
        
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3);
          
          x.set(startX + (distance * easeOut));
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            // Check if we need to reposition for infinite scroll
            const finalX = x.get();
            const singleSetWidth = demos.length * scrollStep;
            
            // If we've gone too far right (past second set), jump to first set
            if (finalX <= -singleSetWidth * 2) {
              x.set(finalX + singleSetWidth);
            }
          }
        };
        
        animate();
      };

      const interval = setInterval(autoScroll, 3000);
      animationRef.current = interval;
      return () => clearInterval(interval);
    } else {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    }
  }, [isUserInteracting, isHovering, x, scrollStep, demos.length]);

  // Navigation function for arrow controls
  const navigateCarousel = (direction: 'left' | 'right') => {
    setIsUserInteracting(true);
    
    const currentX = x.get();
    const newX = direction === 'right' ? currentX - scrollStep : currentX + scrollStep;
    
    // Animate to new position
    const startX = currentX;
    const distance = newX - startX;
    const duration = 400;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      x.set(startX + (distance * easeOut));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Check if we need to reposition for infinite scroll
        const finalX = x.get();
        const singleSetWidth = demos.length * scrollStep;
        
        // If we've gone too far right (past second set), jump to first set
        if (finalX <= -singleSetWidth * 2) {
          x.set(finalX + singleSetWidth);
        }
        // If we've gone too far left (before first set), jump to second set
        else if (finalX >= 0) {
          x.set(finalX - singleSetWidth);
        }
      }
    };
    
    animate();
    
    // Resume auto-scroll after delay
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
    interactionTimeoutRef.current = setTimeout(() => {
      setIsUserInteracting(false);
    }, 2000);
  };

  return (
    <div className="relative">
      {/* Auto-Scrolling Carousel Container */}
      <div 
        ref={containerRef}
        className="relative select-none overflow-hidden"
        style={{
          width: isMobile ? '100vw' : `${cardWidth * cardsToShow + gap * (cardsToShow - 1)}px`,
          margin: '0 auto',
          maxWidth: isMobile ? '100vw' : 'none'
        }}
      >
        {/* Gradient overlays for edge fade effect */}
        <div className={cn(
          "absolute top-0 left-0 w-20 h-full z-10 pointer-events-none",
          isDark 
            ? "bg-gradient-to-r from-black via-black/80 to-transparent"
            : "bg-gradient-to-r from-white via-white/80 to-transparent"
        )} />
        <div className={cn(
          "absolute top-0 right-0 w-20 h-full z-10 pointer-events-none",
          isDark 
            ? "bg-gradient-to-l from-black via-black/80 to-transparent"
            : "bg-gradient-to-l from-white via-white/80 to-transparent"
        )} />
        <motion.div
          className="flex"
          style={{ 
            gap: isMobile ? '20px' : '32px',
            width: `${(cardWidth + gap) * loopedDemos.length}px`,
            x: x,
            paddingLeft: isMobile ? `calc(50vw - ${cardWidth/2}px)` : '0px',
            paddingRight: isMobile ? `calc(50vw - ${cardWidth/2}px)` : '0px'
          }}
        >
          {loopedDemos.map((demo, i) => (
            <motion.div
              key={`${demo.title}-${i}`}
              className={cn(
                "flex-shrink-0 p-4 sm:p-8 rounded-none border-2 transition-all duration-300",
                isMobile ? "w-72" : "w-96",
                isDark 
                  ? "bg-black/60 border-white/30 hover:border-white/50" 
                  : "bg-white/80 border-black/30 hover:border-black/50"
              )}
              whileHover={!isMobile ? { scale: 1.02, y: -4 } : {}}
              onHoverStart={() => setIsHovering(true)}
              onHoverEnd={() => setIsHovering(false)}
              style={{ 
                width: `${cardWidth}px`
              }}
            >
              {/* Status and Icon */}
              <div className="flex items-center justify-between mb-6">
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1 rounded-none border text-xs font-medium",
                  isDark 
                    ? "bg-white/10 border-white/30 text-white/90" 
                    : "bg-black/10 border-black/30 text-black/90"
                )}>
                  <motion.div 
                    className={cn(
                      "w-2 h-2 rounded-full",
                      isDark ? "bg-white" : "bg-black"
                    )}
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: i * 0.2
                    }}
                  />
                  {demo.status}
                </div>
                <div className="text-3xl">{demo.icon}</div>
              </div>

              {/* Title */}
              <h3 className={cn(
                "text-lg font-bold mb-3 tracking-wide uppercase",
                isDark ? "text-white" : "text-black"
              )}>
                {demo.title}
              </h3>

              {/* Description */}
              <p className={cn(
                "text-sm mb-6 leading-relaxed",
                isDark ? "text-white/70" : "text-black/70"
              )}>
                {demo.description}
              </p>
              
              {/* Tier Badge */}
              <div className={cn(
                "mb-4 inline-flex items-center px-3 py-1 rounded-none border text-xs font-bold tracking-wider uppercase",
                demo.tier === 'Core' 
                  ? (isDark ? "bg-green-500/20 border-green-500/40 text-green-400" : "bg-green-500/20 border-green-500/40 text-green-600")
                  : demo.tier === 'Mid-tier'
                  ? (isDark ? "bg-blue-500/20 border-blue-500/40 text-blue-400" : "bg-blue-500/20 border-blue-500/40 text-blue-600")
                  : (isDark ? "bg-purple-500/20 border-purple-500/40 text-purple-400" : "bg-purple-500/20 border-purple-500/40 text-purple-600")
              )}>
                {demo.tier}
              </div>

              {/* Features List */}
              <div className="mb-6 space-y-2">
                {demo.features.map((feature, idx) => (
                  <div key={idx} className={cn(
                    "flex items-center gap-2 text-xs",
                    isDark ? "text-white/80" : "text-black/80"
                  )}>
                    <div className={cn(
                      "w-1 h-1 rounded-full flex-shrink-0",
                      isDark ? "bg-white/60" : "bg-black/60"
                    )} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Preview Flow */}
              <div className={cn(
                "mb-6 p-3 rounded-none border text-xs leading-relaxed",
                isDark 
                  ? "bg-white/5 border-white/20 text-white/70" 
                  : "bg-black/5 border-black/20 text-black/70"
              )}>
                <div className="font-medium mb-1 uppercase tracking-wide">WORKFLOW:</div>
                <div className="font-mono text-xs">{demo.preview}</div>
              </div>

              {/* CTA Button */}
              <button
                className={cn(
                  "w-full py-3 border transition-all duration-300 font-medium text-sm tracking-wide uppercase touch-manipulation rounded-lg",
                  isDark
                    ? "border-white/40 text-white hover:border-white hover:bg-white/5 active:scale-95" 
                    : "border-black/40 text-black hover:border-black hover:bg-black/5 active:scale-95"
                )}
              >
                LAUNCH DEMO
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Navigation Arrows */}
      <div className="flex items-center justify-center gap-6 mt-8">
        <button
          onClick={() => navigateCarousel('left')}
          className={cn(
            "p-4 rounded-lg border-2 transition-all duration-300 touch-manipulation",
            isDark
              ? "bg-black/60 border-white/30 text-white hover:border-white/50 hover:bg-white/5 active:scale-95"
              : "bg-white/80 border-black/30 text-black hover:border-black/50 hover:bg-black/5 active:scale-95"
          )}
          aria-label="Previous (Scroll Left)"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          onClick={() => navigateCarousel('right')}
          className={cn(
            "p-4 rounded-lg border-2 transition-all duration-300 touch-manipulation",
            isDark
              ? "bg-black/60 border-white/30 text-white hover:border-white/50 hover:bg-white/5 active:scale-95"
              : "bg-white/80 border-black/30 text-black hover:border-black/50 hover:bg-black/5 active:scale-95"
          )}
          aria-label="Next (Scroll Right)"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

    </div>
  );
}

function TestimonialsCarousel({ isDark, isMobile }: TestimonialsCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const interactionTimeoutRef = useRef<NodeJS.Timeout>();
  const animationRef = useRef<NodeJS.Timeout>();

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "CTO, TechCorp",
      company: "SC",
      quote: "DCT Micro-Apps delivered exactly what we needed. The precision and attention to detail in their solutions is unmatched. Our team's productivity increased by 40% within the first month.",
      rating: 5
    },
    {
      name: "Michael Rodriguez",
      role: "VP Operations, DataFlow Inc",
      company: "MR",
      quote: "The automation systems we implemented have revolutionized our workflow. What used to take hours now happens in minutes. The ROI was evident within weeks.",
      rating: 5
    },
    {
      name: "Emily Watson",
      role: "Founder, StartupXYZ",
      company: "EW",
      quote: "Working with Automation DCT was a game-changer. They understood our vision and delivered beyond expectations. The micro-apps integrate seamlessly with our existing systems.",
      rating: 5
    },
    {
      name: "David Kim",
      role: "IT Director, GlobalCorp",
      company: "DK",
      quote: "The level of technical expertise and attention to detail is exceptional. Our deployment was smooth, and the ongoing support has been outstanding.",
      rating: 5
    },
    {
      name: "Lisa Thompson",
      role: "CEO, InnovateTech",
      company: "LT",
      quote: "We've seen a 60% reduction in manual processes since implementing their solutions. The automation has freed up our team to focus on strategic initiatives.",
      rating: 5
    },
    {
      name: "James Wilson",
      role: "Operations Manager, ScaleUp",
      company: "JW",
      quote: "The custom micro-applications have streamlined our entire operation. The user interface is intuitive, and the performance is consistently excellent.",
      rating: 5
    }
  ];

  const cardWidth = isMobile ? 280 : 400;
  const gap = isMobile ? 20 : 32;
  const scrollStep = cardWidth + gap;
  const sidePreview = isMobile ? 40 : 0; // Show part of adjacent cards on mobile
  const cardsToShow = 3; // Number of cards to show on desktop

  // Create enough copies for smooth infinite scroll - start from middle set
  const loopedTestimonials = [...testimonials, ...testimonials, ...testimonials];
  
  // Initialize position to start from the middle set to allow scrolling both ways
  useEffect(() => {
    x.set(-testimonials.length * scrollStep);
  }, [testimonials.length, scrollStep, x]);

  // Auto-scroll animation
  useEffect(() => {
    if (!isUserInteracting && !isHovering) {
      const autoScroll = () => {
        const currentX = x.get();
        const newX = currentX - scrollStep;
        
        // Animate to new position
        const startX = currentX;
        const distance = newX - startX;
        const duration = 400;
        const startTime = Date.now();
        
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3);
          
          x.set(startX + (distance * easeOut));
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            // Check if we need to reposition for infinite scroll
            const finalX = x.get();
            const singleSetWidth = testimonials.length * scrollStep;
            
            // If we've gone too far right (past second set), jump to first set
            if (finalX <= -singleSetWidth * 2) {
              x.set(finalX + singleSetWidth);
            }
          }
        };
        
        animate();
      };

      const interval = setInterval(autoScroll, 3000);
      animationRef.current = interval;
      return () => clearInterval(interval);
    } else {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    }
  }, [isUserInteracting, isHovering, x, scrollStep, testimonials.length]);

  // Navigation function for arrow controls
  const navigateCarousel = (direction: 'left' | 'right') => {
    setIsUserInteracting(true);
    
    const currentX = x.get();
    const newX = direction === 'right' ? currentX - scrollStep : currentX + scrollStep;
    
    // Animate to new position
    const startX = currentX;
    const distance = newX - startX;
    const duration = 400;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      x.set(startX + (distance * easeOut));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Check if we need to reposition for infinite scroll
        const finalX = x.get();
        const singleSetWidth = testimonials.length * scrollStep;
        
        // If we've gone too far right (past second set), jump to first set
        if (finalX <= -singleSetWidth * 2) {
          x.set(finalX + singleSetWidth);
        }
        // If we've gone too far left (before first set), jump to second set
        else if (finalX >= 0) {
          x.set(finalX - singleSetWidth);
        }
      }
    };
    
    animate();
    
    // Resume auto-scroll after delay
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
    interactionTimeoutRef.current = setTimeout(() => {
      setIsUserInteracting(false);
    }, 2000);
  };

  return (
    <div className="relative">
      {/* Auto-Scrolling Testimonials Container */}
      <div 
        ref={containerRef}
        className="relative select-none overflow-hidden"
        style={{
          width: isMobile ? '100vw' : `${cardWidth * cardsToShow + gap * (cardsToShow - 1)}px`,
          margin: '0 auto',
          maxWidth: isMobile ? '100vw' : 'none'
        }}
      >
        {/* Gradient overlays for edge fade effect */}
        <div className={cn(
          "absolute top-0 left-0 w-20 h-full z-10 pointer-events-none",
          isDark 
            ? "bg-gradient-to-r from-black via-black/80 to-transparent"
            : "bg-gradient-to-r from-white via-white/80 to-transparent"
        )} />
        <div className={cn(
          "absolute top-0 right-0 w-20 h-full z-10 pointer-events-none",
          isDark 
            ? "bg-gradient-to-l from-black via-black/80 to-transparent"
            : "bg-gradient-to-l from-white via-white/80 to-transparent"
        )} />
        <motion.div
          className="flex"
          style={{ 
            gap: isMobile ? '20px' : '32px',
            width: `${(cardWidth + gap) * loopedTestimonials.length}px`,
            x: x,
            paddingLeft: isMobile ? `calc(50vw - ${cardWidth/2}px)` : '0px',
            paddingRight: isMobile ? `calc(50vw - ${cardWidth/2}px)` : '0px'
          }}
        >
          {loopedTestimonials.map((testimonial, i) => (
            <motion.div
              key={`${testimonial.name}-${i}`}
              className={cn(
                "flex-shrink-0 p-4 sm:p-8 rounded-lg border-2 transition-all duration-300",
                isMobile ? "w-72" : "w-96",
                isDark 
                  ? "bg-black/60 border-white/30 hover:border-white/50" 
                  : "bg-white/80 border-black/30 hover:border-black/50"
              )}
              whileHover={!isMobile ? { scale: 1.02, y: -4 } : {}}
              onHoverStart={() => setIsHovering(true)}
              onHoverEnd={() => setIsHovering(false)}
              style={{ 
                width: `${cardWidth}px`
              }}
            >
              {/* Company Logo */}
              <div className="flex items-center justify-center mb-6">
                <div className={cn(
                  "w-16 h-16 rounded-lg border-2 flex items-center justify-center",
                  isDark 
                    ? "bg-white/10 border-white/30" 
                    : "bg-black/10 border-black/30"
                )}>
                  <span className={cn(
                    "font-bold text-xl",
                    isDark ? "text-white" : "text-black"
                  )}>{testimonial.company}</span>
                </div>
              </div>
              
              {/* Rating Stars */}
              <div className="flex justify-center mb-6">
                {[...Array(testimonial.rating)].map((_, idx) => (
                  <svg key={idx} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <blockquote className={cn(
                "text-sm sm:text-base lg:text-lg font-normal mb-8 leading-relaxed text-center",
                isDark ? "text-white/90" : "text-black/90"
              )}>
                "{testimonial.quote}"
              </blockquote>
              
              {/* Author Info */}
              <div className="text-center">
                <div className={cn(
                  "text-base font-bold tracking-wide uppercase mb-1",
                  isDark ? "text-white" : "text-black"
                )}>
                  {testimonial.name}
                </div>
                <div className={cn(
                  "text-sm",
                  isDark ? "text-white/60" : "text-black/60"
                )}>
                  {testimonial.role}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Navigation Arrows */}
      <div className="flex items-center justify-center gap-6 mt-8">
        <button
          onClick={() => navigateCarousel('left')}
          className={cn(
            "p-4 rounded-lg border-2 transition-all duration-300 touch-manipulation",
            isDark
              ? "bg-black/60 border-white/30 text-white hover:border-white/50 hover:bg-white/5 active:scale-95"
              : "bg-white/80 border-black/30 text-black hover:border-black/50 hover:bg-black/5 active:scale-95"
          )}
          aria-label="Previous Testimonial"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          onClick={() => navigateCarousel('right')}
          className={cn(
            "p-4 rounded-lg border-2 transition-all duration-300 touch-manipulation",
            isDark
              ? "bg-black/60 border-white/30 text-white hover:border-white/50 hover:bg-white/5 active:scale-95"
              : "bg-white/80 border-black/30 text-black hover:border-black/50 hover:bg-black/5 active:scale-95"
          )}
          aria-label="Next Testimonial"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

    </div>
  );
}

export default function TestHomePage() {
  console.log("🚀 TestHomePage is being rendered!");
  const { scrollYProgress } = useScroll();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Mouse tracking (desktop only)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 150, damping: 15 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 15 });

  useEffect(() => {
    setMounted(true);
    
    const checkMobile = () => {
      const mobile = window.innerWidth < 768 || 'ontouchstart' in window;
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    if (!isMobile) {
      const handleMouseMove = (e: MouseEvent) => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
      };

      window.addEventListener('mousemove', handleMouseMove);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', checkMobile);
      };
    }
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [mouseX, mouseY, isMobile]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <main className={cn(
      "min-h-screen transition-all duration-500 ease-out relative",
      isDark 
        ? "bg-black text-white" 
        : "bg-white text-black"
    )}>
      {/* Header */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 backdrop-blur-xl border-b",
        isDark 
          ? "bg-black/70 border-white/20 shadow-white/5" 
          : "bg-white/70 border-black/20 shadow-black/5"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={cn(
                "w-8 h-8 sm:w-10 sm:h-10 rounded-none border-2 flex items-center justify-center transition-colors duration-500",
                isDark 
                  ? "bg-white/10 border-white/30" 
                  : "bg-black/10 border-black/30"
              )}>
                <span className={cn(
                  "font-bold text-sm sm:text-lg transition-colors duration-500",
                  isDark ? "text-white" : "text-black"
                )}>ADT</span>
              </div>
              <div className={cn(
                "text-lg sm:text-xl font-bold transition-colors duration-500 tracking-wide",
                isDark ? "text-white" : "text-black"
              )}>
                <span className="hidden sm:inline">Automation DCT</span>
                <span className="sm:hidden">Auto DCT</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              <a href="#solutions" className={cn(
                "text-sm font-medium transition-colors duration-500 hover:opacity-70",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                Solutions
              </a>
              <a href="#about" className={cn(
                "text-sm font-medium transition-colors duration-500 hover:opacity-70",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                About
              </a>
              <a href="#contact" className={cn(
                "text-sm font-medium transition-colors duration-500 hover:opacity-70",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                Contact
              </a>
            </nav>
            
            {/* Mobile Navigation & Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle 
                variant="outline" 
                size="sm"
                className={cn(
                  "backdrop-blur-xl border transition-all duration-500",
                  isDark 
                    ? "bg-black/60 border-white/20 hover:border-white/40 hover:bg-white/5" 
                    : "bg-white/60 border-black/20 hover:border-black/40 hover:bg-black/5"
                )}
              />
              
              <button className="md:hidden p-2 touch-manipulation" aria-label="Open menu">
                <div className={cn(
                  "w-6 h-6 flex flex-col justify-center gap-1",
                  isDark ? "text-white" : "text-black"
                )}>
                  <div className={cn(
                    "w-full h-0.5 transition-colors duration-500",
                    isDark ? "bg-white" : "bg-black"
                  )} />
                  <div className={cn(
                    "w-full h-0.5 transition-colors duration-500",
                    isDark ? "bg-white" : "bg-black"
                  )} />
                  <div className={cn(
                    "w-full h-0.5 transition-colors duration-500",
                    isDark ? "bg-white" : "bg-black"
                  )} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Optimized Automation Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Main Grid System */}
        <div className="absolute inset-0">
          <div 
            className="h-full w-full transition-opacity duration-500"
            style={{
              backgroundImage: `
                linear-gradient(${isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.08)'} 1px, transparent 1px),
                linear-gradient(90deg, ${isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.08)'} 1px, transparent 1px),
                linear-gradient(${isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.04)'} 1px, transparent 1px),
                linear-gradient(90deg, ${isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.04)'} 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px, 40px 40px, 120px 120px, 120px 120px',
              backgroundPosition: '0 0, 0 0, 20px 20px, 20px 20px',
              opacity: isDark ? 0.6 : 0.8
            }}
          />
        </div>

        {/* Automation Nodes */}
        <div className="absolute inset-0">
          {[...Array(isMobile ? 6 : 12)].map((_, i) => {
            const x = 15 + ((i * 13) % 70);
            const y = 15 + ((i * 17) % 70);
            return (
              <motion.div
                key={i}
                className={cn(
                  "absolute rounded-full transition-colors duration-500",
                  isMobile ? "w-1.5 h-1.5" : "w-2 h-2",
                  isDark ? "bg-white/20" : "bg-black/35"
                )}
                style={{
                  top: `${y}%`,
                  left: `${x}%`,
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 3 + (i * 0.2),
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3
                }}
              />
            );
          })}
        </div>

        {/* Flowing Data Streams */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(isMobile ? 3 : 5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-full h-px"
              style={{
                top: `${20 + (i * (isMobile ? 20 : 15))}%`,
                background: isDark 
                  ? `linear-gradient(90deg, transparent, rgba(255,255,255,0.1), rgba(255,255,255,0.03), transparent)`
                  : `linear-gradient(90deg, transparent, rgba(0,0,0,0.2), rgba(0,0,0,0.05), transparent)`
              }}
              animate={{
                x: ["-10%", "110%"],
                opacity: [0, 0.8, 0.2, 0]
              }}
              transition={{
                duration: isMobile ? 5 + (i * 1) : 7 + (i * 1.5),
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 1.5
              }}
            />
          ))}
        </div>

        {/* Interactive Mouse Effect (Desktop Only) */}
        {!isMobile && (
          <motion.div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle 150px at ${springX}px ${springY}px, ${isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.04)'} 0%, transparent 60%)`,
              transform: `translate(${springX.get() * 0.005}px, ${springY.get() * 0.005}px)`,
            }}
          />
        )}
      </div>

      {/* Hero Section - Improved Layout */}
      <section className="relative min-h-screen flex items-center justify-center z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="max-w-6xl mx-auto text-center space-y-6 sm:space-y-8 lg:space-y-10">

            {/* Main Headline */}
            <div className="space-y-4 sm:space-y-6">
              <h1 className={cn(
                "text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight uppercase leading-none",
                isDark ? "text-white" : "text-black"
              )}>
                Custom Web Apps
              </h1>
              <div className={cn(
                "w-24 sm:w-32 lg:w-40 h-1 mx-auto",
                isDark ? "bg-white" : "bg-black"
              )} />
            </div>

            {/* Tagline */}
            <div>
              <p className={cn(
                "text-sm sm:text-base lg:text-lg font-bold tracking-widest uppercase",
                isDark ? "text-white/90" : "text-black/90"
              )}>
                delivered in a week
              </p>
            </div>

            {/* Description */}
            <div className="max-w-4xl mx-auto">
              <p className={cn(
                "text-sm sm:text-base lg:text-lg font-light leading-relaxed px-4",
                isDark ? "text-white/85" : "text-black/85"
              )}>
                Automated micro-applications that execute with precision. 
                Self-optimizing systems deployed in 7 days, engineered for autonomous operations. 
                Zero-maintenance architecture.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 max-w-lg mx-auto">
              <button
                className={cn(
                  "w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 font-bold text-sm sm:text-base rounded-lg border-2 transition-all duration-300 tracking-wide uppercase touch-manipulation",
                  isDark
                    ? "bg-black text-white border-white hover:bg-white hover:text-black active:scale-95" 
                    : "bg-black text-white border-black hover:bg-white hover:text-black active:scale-95"
                )}
              >
                <span className="hidden sm:inline">INITIATE AUTOMATION</span>
                <span className="sm:hidden">START</span>
              </button>
              
              <button
                className={cn(
                  "w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 font-bold text-sm sm:text-base rounded-lg border-2 transition-all duration-300 tracking-wide uppercase touch-manipulation",
                  isDark
                    ? "bg-transparent text-white border-white/60 hover:border-white hover:bg-white/5 active:scale-95" 
                    : "bg-transparent text-black border-black/60 hover:border-black hover:bg-black/5 active:scale-95"
                )}
              >
                <span className="hidden sm:inline">VIEW SYSTEMS</span>
                <span className="sm:hidden">VIEW</span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Carousel Demo Section */}
      <section className="relative py-16 sm:py-20 lg:py-24 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12 sm:mb-16 lg:mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className={cn(
              "text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 transition-colors duration-500 tracking-wide uppercase",
              isDark ? "text-white" : "text-black"
            )}>
              LIVE DEMOS
            </h2>
            <p className={cn(
              "text-sm sm:text-base max-w-2xl mx-auto font-normal transition-colors duration-500",
              isDark ? "text-white/80" : "text-black/80"
            )}>
              See our micro-applications in action
            </p>
          </motion.div>
        </div>

        {/* Enhanced Auto-Scrolling Carousel - Full Width */}
        <EnhancedCarousel isDark={isDark} isMobile={isMobile} />
      </section>

      {/* Solutions Section */}
      <section className={cn(
        "relative py-16 sm:py-20 lg:py-24 z-10 transition-colors duration-500",
        isDark ? "bg-white/5" : "bg-black/5"
      )}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12 sm:mb-16 lg:mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className={cn(
              "text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 transition-colors duration-500 tracking-wide uppercase",
              isDark ? "text-white" : "text-black"
            )}>
              SOLUTIONS
            </h2>
            <p className={cn(
              "text-sm sm:text-base max-w-2xl mx-auto font-normal transition-colors duration-500",
              isDark ? "text-white/80" : "text-black/80"
            )}>
              Comprehensive micro-applications engineered for modern business needs
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {[
              { 
                title: "Analytics Dashboard", 
                description: "Real-time data visualization and business intelligence"
              },
              { 
                title: "User Management", 
                description: "Comprehensive user authentication and authorization"
              },
              { 
                title: "Content Management", 
                description: "Advanced CMS with workflow and publishing tools"
              }
            ].map((solution, i) => (
              <motion.div
                key={solution.title}
                className={cn(
                  "p-6 sm:p-8 rounded-none border-2 transition-all duration-500",
                  isDark 
                    ? "bg-black/40 border-white/20 hover:border-white/40" 
                    : "bg-white/40 border-black/20 hover:border-black/40"
                )}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -4 }}
              >
                <h3 className={cn(
                  "text-lg sm:text-xl font-bold mb-4 tracking-wide uppercase",
                  isDark ? "text-white" : "text-black"
                )}>
                  {solution.title}
                </h3>
                
                <p className={cn(
                  "text-sm sm:text-base font-normal leading-relaxed",
                  isDark ? "text-white/80" : "text-black/80"
                )}>
                  {solution.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-16 sm:py-20 lg:py-24 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12 sm:mb-16 lg:mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className={cn(
              "text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 transition-colors duration-500 tracking-wide uppercase",
                  isDark ? "text-white" : "text-black"
            )}>
              CLIENT TESTIMONIALS
            </h2>
            <p className={cn(
              "text-sm sm:text-base max-w-2xl mx-auto font-normal transition-colors duration-500",
              isDark ? "text-white/80" : "text-black/80"
            )}>
              Hear from our satisfied clients about their success stories
            </p>
          </motion.div>
        </div>

        {/* Scrollable Testimonials Carousel - Full Width */}
        <TestimonialsCarousel isDark={isDark} isMobile={isMobile} />
      </section>

      {/* Final CTA Section */}
      <section className="relative py-16 sm:py-20 lg:py-24 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            className="max-w-4xl mx-auto space-y-6 sm:space-y-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className={cn(
              "text-2xl sm:text-3xl lg:text-4xl font-bold tracking-wide uppercase",
              isDark ? "text-white" : "text-black"
            )}>
              READY TO GET STARTED?
            </h2>
            
            <p className={cn(
              "text-sm sm:text-base font-normal max-w-2xl mx-auto",
              isDark ? "text-white/80" : "text-black/80"
            )}>
              Let's discuss how our micro-applications can transform your business operations.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 max-w-lg mx-auto">
              <motion.button
                className={cn(
                  "w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 font-bold text-sm sm:text-base rounded-lg transition-all duration-300 border-2 tracking-wide uppercase touch-manipulation",
                  isDark
                    ? "bg-black text-white border-white hover:bg-white hover:text-black active:scale-95" 
                    : "bg-black text-white border-black hover:bg-white hover:text-black active:scale-95"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="hidden sm:inline">SCHEDULE CONSULTATION</span>
                <span className="sm:hidden">SCHEDULE</span>
              </motion.button>
              
              <motion.button
                className={cn(
                  "w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 font-bold text-sm sm:text-base rounded-lg transition-all duration-300 tracking-wide uppercase touch-manipulation",
                  isDark
                    ? "border-white/60 text-white hover:border-white hover:bg-white/5 active:scale-95" 
                    : "border-black/60 text-black hover:border-black hover:bg-black/5 active:scale-95"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="hidden sm:inline">VIEW PORTFOLIO</span>
                <span className="sm:hidden">PORTFOLIO</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={cn(
        "relative py-12 sm:py-16 transition-colors duration-500 border-t z-10 backdrop-blur-xl",
        isDark 
          ? "bg-black/70 border-white/10" 
          : "bg-white/70 border-black/10"
      )}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Company Info */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                <div className={cn(
                  "w-10 h-10 rounded-none border-2 flex items-center justify-center",
                  isDark 
                    ? "bg-white/10 border-white/30" 
                    : "bg-black/10 border-black/30"
                )}>
                  <span className={cn(
                    "font-bold text-lg",
                    isDark ? "text-white" : "text-black"
                  )}>ADT</span>
                </div>
                <div className={cn(
                  "text-xl font-bold tracking-wide",
                  isDark ? "text-white" : "text-black"
                )}>
                  Automation DCT
                </div>
              </div>
              <p className={cn(
                "text-sm font-light leading-relaxed",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                Precision-engineered micro-applications for critical business operations.
              </p>
            </div>

            {/* Quick Links */}
            <div className="text-center">
              <h3 className={cn(
                "text-sm font-bold mb-4 tracking-wide uppercase",
                isDark ? "text-white" : "text-black"
              )}>
                QUICK LINKS
              </h3>
              <ul className="space-y-2">
                {['Solutions', 'About', 'Contact'].map((item) => (
                  <li key={item}>
                    <a href="#" className={cn(
                      "text-sm font-medium transition-colors duration-500 hover:opacity-70",
                      isDark ? "text-white/80" : "text-black/80"
                    )}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="text-center md:text-right">
              <h3 className={cn(
                "text-sm font-bold mb-4 tracking-wide uppercase",
                isDark ? "text-white" : "text-black"
              )}>
                CONTACT
              </h3>
              <div className="space-y-2 text-sm">
                <div className={cn(
                  "transition-colors duration-500",
                  isDark ? "text-white/80" : "text-black/80"
                )}>
                  hello@automationdct.com
                </div>
                <div className={cn(
                  "transition-colors duration-500",
                  isDark ? "text-white/80" : "text-black/80"
                )}>
                  San Francisco, CA
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className={cn(
            "pt-6 border-t text-center transition-colors duration-500",
            isDark ? "border-white/10" : "border-black/10"
          )}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className={cn(
                "text-sm transition-colors duration-500",
                isDark ? "text-white/60" : "text-black/60"
              )}>
                © 2024 Automation DCT. All rights reserved.
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className={cn(
                  "w-2 h-2 rounded-full transition-colors duration-500",
                  isDark ? "bg-white/40" : "bg-black/40"
                )} />
                <span className={cn(
                  "transition-colors duration-500",
                  isDark ? "text-white/60" : "text-black/60"
                )}>
                  All systems operational
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}