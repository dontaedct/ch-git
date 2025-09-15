/**
 * @fileoverview Redesigned Home Page - Design System Compliant
 * Matching original visual style while using design system components
 * 
 * PRD Key Requirements:
 * - One primary CTA per public page
 * - Clear, brief microcopy for forms
 * - Minimal fields with recommended defaults
 * - Consistent patterns and neutral theming
 * - Accessibility baseline and responsive layouts
 * - Light/dark neutral theming
 */
"use client";

import { motion, useScroll, useTransform, useMotionValue, useSpring, useAnimation } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
// Note: Using standard HTML elements with Tailwind classes instead of Typography components
// Note: Removed design system hooks to avoid provider context issues
import { cn } from "@/lib/utils";
import { 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Zap, 
  Users, 
  FileText, 
  BarChart3,
  Star,
  Play
} from "lucide-react";

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
    }
  ];

  const cardWidth = isMobile ? 280 : 384;
  const gap = isMobile ? 20 : 32;
  const scrollStep = cardWidth + gap;
  const cardsToShow = isMobile ? 1 : 3;

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
            ? "bg-gradient-to-r from-background via-background/80 to-transparent"
            : "bg-gradient-to-r from-background via-background/80 to-transparent"
        )} />
        <div className={cn(
          "absolute top-0 right-0 w-20 h-full z-10 pointer-events-none",
          isDark 
            ? "bg-gradient-to-l from-background via-background/80 to-transparent"
            : "bg-gradient-to-l from-background via-background/80 to-transparent"
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
                  ? "bg-background/60 border-border hover:border-primary/50" 
                  : "bg-background/80 border-border hover:border-primary/50"
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
                    ? "bg-primary/10 border-primary/30 text-primary" 
                    : "bg-primary/10 border-primary/30 text-primary"
                )}>
                  <motion.div 
                    className={cn(
                      "w-2 h-2 rounded-full",
                      "bg-primary"
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
                "text-foreground"
              )}>
                {demo.title}
              </h3>

              {/* Description */}
              <p className={cn(
                "text-sm mb-6 leading-relaxed",
                "text-muted-foreground"
              )}>
                {demo.description}
              </p>
              
              {/* Tier Badge */}
              <div className={cn(
                "mb-4 inline-flex items-center px-3 py-1 rounded-none border text-xs font-bold tracking-wider uppercase",
                demo.tier === 'Core' 
                  ? "bg-green-500/20 border-green-500/40 text-green-600"
                  : demo.tier === 'Mid-tier'
                  ? "bg-blue-500/20 border-blue-500/40 text-blue-600"
                  : "bg-purple-500/20 border-purple-500/40 text-purple-600"
              )}>
                {demo.tier}
              </div>

              {/* Features List */}
              <div className="mb-6 space-y-2">
                {demo.features.map((feature, idx) => (
                  <div key={idx} className={cn(
                    "flex items-center gap-2 text-xs",
                    "text-muted-foreground"
                  )}>
                    <div className={cn(
                      "w-1 h-1 rounded-full flex-shrink-0",
                      "bg-primary/60"
                    )} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Preview Flow */}
              <div className={cn(
                "mb-6 p-3 rounded-none border text-xs leading-relaxed",
                isDark 
                  ? "bg-muted/50 border-border text-muted-foreground" 
                  : "bg-muted/50 border-border text-muted-foreground"
              )}>
                <div className="font-medium mb-1 uppercase tracking-wide">WORKFLOW:</div>
                <div className="font-mono text-xs">{demo.preview}</div>
              </div>

              {/* CTA Button */}
              <Button
                variant="outline"
                className="w-full"
              >
                LAUNCH DEMO
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Navigation Arrows */}
      <div className="flex items-center justify-center gap-6 mt-8">
        <Button
          variant="outline"
          onClick={() => navigateCarousel('left')}
          className="p-4"
          aria-label="Previous (Scroll Left)"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>
        
        <Button
          variant="outline"
          onClick={() => navigateCarousel('right')}
          className="p-4"
          aria-label="Next (Scroll Right)"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
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
    }
  ];

  const cardWidth = isMobile ? 280 : 400;
  const gap = isMobile ? 20 : 32;
  const scrollStep = cardWidth + gap;
  const cardsToShow = isMobile ? 1 : 3;

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
            ? "bg-gradient-to-r from-background via-background/80 to-transparent"
            : "bg-gradient-to-r from-background via-background/80 to-transparent"
        )} />
        <div className={cn(
          "absolute top-0 right-0 w-20 h-full z-10 pointer-events-none",
          isDark 
            ? "bg-gradient-to-l from-background via-background/80 to-transparent"
            : "bg-gradient-to-l from-background via-background/80 to-transparent"
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
                  ? "bg-background/60 border-border hover:border-primary/50" 
                  : "bg-background/80 border-border hover:border-primary/50"
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
                    ? "bg-primary/10 border-primary/30" 
                    : "bg-primary/10 border-primary/30"
                )}>
                  <span className={cn(
                    "font-bold text-xl",
                    "text-primary"
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
                "text-foreground"
              )}>
                "{testimonial.quote}"
              </blockquote>
              
              {/* Author Info */}
              <div className="text-center">
                <div className={cn(
                  "text-base font-bold tracking-wide uppercase mb-1",
                  "text-foreground"
                )}>
                  {testimonial.name}
                </div>
                <div className={cn(
                  "text-sm",
                  "text-muted-foreground"
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
        <Button
          variant="outline"
          onClick={() => navigateCarousel('left')}
          className="p-4"
          aria-label="Previous Testimonial"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>
        
        <Button
          variant="outline"
          onClick={() => navigateCarousel('right')}
          className="p-4"
          aria-label="Next Testimonial"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
}

// Demo data following PRD requirements
const coreModules = [
  {
    title: "Lead Capture System",
    description: "Intelligent lead capture with auto-qualification and CRM routing",
    icon: "🎯",
    tier: "Core",
    features: ["Smart Form Builder", "Auto Enrichment", "Lead Scoring", "Real-time Routing"],
    workflow: "Public landing → Structured capture → Auto-qualification → CRM routing"
  },
  {
    title: "Document Generator", 
    description: "Template-based document automation with intelligent formatting",
    icon: "📄",
    tier: "Core",
    features: ["Dynamic Templates", "Multi-format Export", "Email Integration", "Version Control"],
    workflow: "Input data → Template processing → PDF/HTML output → Email delivery"
  },
  {
    title: "Automation Engine",
    description: "Multi-step workflow orchestration with intelligent triggers", 
    icon: "⚡",
    tier: "Core",
    features: ["Webhook System", "Flow Builder", "Alert Manager", "Audit Logger"],
    workflow: "Trigger events → Workflow execution → Multi-step automation → Notifications"
  },
  {
    title: "CRM Pipeline",
    description: "Customer relationship management with pipeline analytics",
    icon: "👥", 
    tier: "Mid-tier",
    features: ["Contact Manager", "Pipeline Tracker", "Activity Monitor", "Reports Dashboard"],
    workflow: "Contact management → Opportunity pipeline → Activity tracking → Reporting"
  },
  {
    title: "AI Extraction Suite",
    description: "Advanced AI-powered document and media processing system",
    icon: "🧠",
    tier: "Premium", 
    features: ["Multimodal Parser", "Neural Networks", "Data Extraction", "API Gateway"],
    workflow: "Upload files → AI extraction → Structured data → Workflow integration"
  },
  {
    title: "Approval Workflows",
    description: "Enterprise approval system with role-based routing",
    icon: "✅",
    tier: "Premium",
    features: ["Role Engine", "Approval Chain", "Audit System", "Notification Hub"], 
    workflow: "Submit request → Route to approvers → Track progress → Complete workflow"
  }
];

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
  }
];

const keyMetrics = [
  { label: "Time to Production", value: "≤ 7 days", icon: Clock },
  { label: "Build Effort", value: "≤ 12 hours", icon: Zap },
  { label: "Module Onboarding", value: "≤ 4 hours", icon: Users },
  { label: "Workflow Success", value: "≥ 98%", icon: CheckCircle }
];

export default function RedesignedHomePage() {
  console.log("🚀 RedesignedHomePage is being rendered! (Updated)");
  const { scrollYProgress } = useScroll();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Note: Using standard Tailwind classes instead of design system hooks
  // to avoid provider context issues

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <main className={cn(
      "min-h-screen transition-all duration-500 ease-out relative",
      isDark 
        ? "bg-background text-foreground" 
        : "bg-background text-foreground"
    )}>
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
                  isDark ? "bg-foreground/20" : "bg-foreground/35"
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

      {/* Header */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 backdrop-blur-xl border-b",
        isDark 
          ? "bg-background/70 border-border shadow-foreground/5" 
          : "bg-background/70 border-border shadow-foreground/5"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={cn(
                "w-8 h-8 sm:w-10 sm:h-10 rounded-none border-2 flex items-center justify-center transition-colors duration-500",
                isDark 
                  ? "bg-primary/10 border-primary/30" 
                  : "bg-primary/10 border-primary/30"
              )}>
                <span className={cn(
                  "font-bold text-sm sm:text-lg transition-colors duration-500",
                  "text-primary"
                )}>ADT</span>
              </div>
              <div className={cn(
                "text-lg sm:text-xl font-bold transition-colors duration-500 tracking-wide",
                "text-foreground"
              )}>
                <span className="hidden sm:inline">Automation DCT</span>
                <span className="sm:hidden">Auto DCT</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              <a href="#solutions" className={cn(
                "text-sm font-medium transition-colors duration-500 hover:opacity-70",
                "text-muted-foreground"
              )}>
                Solutions
              </a>
              <a href="#about" className={cn(
                "text-sm font-medium transition-colors duration-500 hover:opacity-70",
                "text-muted-foreground"
              )}>
                About
              </a>
              <a href="#contact" className={cn(
                "text-sm font-medium transition-colors duration-500 hover:opacity-70",
                "text-muted-foreground"
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
                    ? "bg-background/60 border-border hover:border-primary/40 hover:bg-primary/5" 
                    : "bg-background/60 border-border hover:border-primary/40 hover:bg-primary/5"
                )}
              />
              
              <button className="md:hidden p-2 touch-manipulation" aria-label="Open menu">
                <div className={cn(
                  "w-6 h-6 flex flex-col justify-center gap-1",
                  "text-foreground"
                )}>
                  <div className={cn(
                    "w-full h-0.5 transition-colors duration-500",
                    "bg-foreground"
                  )} />
                  <div className={cn(
                    "w-full h-0.5 transition-colors duration-500",
                    "bg-foreground"
                  )} />
                  <div className={cn(
                    "w-full h-0.5 transition-colors duration-500",
                    "bg-foreground"
                  )} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Improved Layout */}
      <section className="relative min-h-screen flex items-center justify-center z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="max-w-6xl mx-auto text-center space-y-6 sm:space-y-8 lg:space-y-10">

            {/* Main Headline */}
            <div className="space-y-4 sm:space-y-6">
              <h1 className={cn(
                "text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight uppercase leading-none",
                "text-foreground"
              )}>
                Custom Web Apps
              </h1>
              <div className={cn(
                "w-24 sm:w-32 lg:w-40 h-1 mx-auto",
                "bg-primary"
              )} />
            </div>

            {/* Tagline */}
            <div>
              <p className={cn(
                "text-sm sm:text-base lg:text-lg font-bold tracking-widest uppercase",
                "text-foreground"
              )}>
                delivered in a week
              </p>
            </div>

            {/* Description */}
            <div className="max-w-4xl mx-auto">
              <p className={cn(
                "text-sm sm:text-base lg:text-lg font-light leading-relaxed px-4",
                "text-muted-foreground"
              )}>
                Automated micro-applications that execute with precision. 
                Self-optimizing systems deployed in 7 days, engineered for autonomous operations. 
                Zero-maintenance architecture.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 max-w-lg mx-auto">
              <Button
                className={cn(
                  "w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 font-bold text-sm sm:text-base rounded-lg border-2 transition-all duration-300 tracking-wide uppercase touch-manipulation",
                  "bg-primary text-primary-foreground border-primary hover:bg-primary/90 active:scale-95"
                )}
              >
                <span className="hidden sm:inline">INITIATE AUTOMATION</span>
                <span className="sm:hidden">START</span>
              </Button>
              
              <Button
                variant="outline"
                className={cn(
                  "w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 font-bold text-sm sm:text-base rounded-lg border-2 transition-all duration-300 tracking-wide uppercase touch-manipulation",
                  "bg-transparent text-foreground border-border hover:border-primary hover:bg-primary/5 active:scale-95"
                )}
              >
                <span className="hidden sm:inline">VIEW SYSTEMS</span>
                <span className="sm:hidden">VIEW</span>
              </Button>
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
              "text-foreground"
            )}>
              LIVE DEMOS
            </h2>
            <p className={cn(
              "text-sm sm:text-base max-w-2xl mx-auto font-normal transition-colors duration-500",
              "text-muted-foreground"
            )}>
              See our micro-applications in action
            </p>
          </motion.div>
        </div>

        {/* Enhanced Auto-Scrolling Carousel - Full Width */}
        <EnhancedCarousel isDark={isDark} isMobile={isMobile} />
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
              "text-foreground"
            )}>
              CLIENT TESTIMONIALS
            </h2>
            <p className={cn(
              "text-sm sm:text-base max-w-2xl mx-auto font-normal transition-colors duration-500",
              "text-muted-foreground"
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
              "text-foreground"
            )}>
              READY TO GET STARTED?
            </h2>
            
            <p className={cn(
              "text-sm sm:text-base font-normal max-w-2xl mx-auto",
              "text-muted-foreground"
            )}>
              Let's discuss how our micro-applications can transform your business operations.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 max-w-lg mx-auto">
              <motion.button
                className={cn(
                  "w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 font-bold text-sm sm:text-base rounded-lg transition-all duration-300 border-2 tracking-wide uppercase touch-manipulation",
                  "bg-primary text-primary-foreground border-primary hover:bg-primary/90 active:scale-95"
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
                  "border-border text-foreground hover:border-primary hover:bg-primary/5 active:scale-95"
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
          ? "bg-background/70 border-border" 
          : "bg-background/70 border-border"
      )}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Company Info */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                <div className={cn(
                  "w-10 h-10 rounded-none border-2 flex items-center justify-center",
                  isDark 
                    ? "bg-primary/10 border-primary/30" 
                    : "bg-primary/10 border-primary/30"
                )}>
                  <span className={cn(
                    "font-bold text-lg",
                    "text-primary"
                  )}>ADT</span>
                </div>
                <div className={cn(
                  "text-xl font-bold tracking-wide",
                  "text-foreground"
                )}>
                  Automation DCT
                </div>
              </div>
              <p className={cn(
                "text-sm font-light leading-relaxed",
                "text-muted-foreground"
              )}>
                Precision-engineered micro-applications for critical business operations.
              </p>
            </div>

            {/* Quick Links */}
            <div className="text-center">
              <h3 className={cn(
                "text-sm font-bold mb-4 tracking-wide uppercase",
                "text-foreground"
              )}>
                QUICK LINKS
              </h3>
              <ul className="space-y-2">
                {['Solutions', 'About', 'Contact'].map((item) => (
                  <li key={item}>
                    <a href="#" className={cn(
                      "text-sm font-medium transition-colors duration-500 hover:opacity-70",
                      "text-muted-foreground"
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
                "text-foreground"
              )}>
                CONTACT
              </h3>
              <div className="space-y-2 text-sm">
                <div className={cn(
                  "transition-colors duration-500",
                  "text-muted-foreground"
                )}>
                  hello@automationdct.com
                </div>
                <div className={cn(
                  "transition-colors duration-500",
                  "text-muted-foreground"
                )}>
                  San Francisco, CA
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className={cn(
            "pt-6 border-t text-center transition-colors duration-500",
            "border-border"
          )}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className={cn(
                "text-sm transition-colors duration-500",
                "text-muted-foreground"
              )}>
                © 2024 Automation DCT. All rights reserved.
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className={cn(
                  "w-2 h-2 rounded-full transition-colors duration-500",
                  "bg-green-500"
                )} />
                <span className={cn(
                  "transition-colors duration-500",
                  "text-muted-foreground"
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
