/**
 * @fileoverview HT-008.5.7: Micro-Interactions and Advanced UX Patterns
 * @module lib/motion/interactions
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.5.7 - Add micro-interactions and advanced UX patterns
 * Focus: Vercel/Apply-level micro-interactions with sophisticated animations
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (user experience and accessibility)
 */

'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { useReducedMotion } from '@/hooks/use-motion-preference'
import { cn } from '@/lib/utils'

// HT-008.5.7: Enhanced Micro-Interactions and Advanced UX Patterns
// Comprehensive motion system following Vercel/Apply design principles

/**
 * Motion Configuration Interface
 */
export interface MotionConfig {
  duration?: number
  delay?: number
  easing?: string
  spring?: {
    stiffness?: number
    damping?: number
    mass?: number
  }
  stagger?: number
  direction?: 'forward' | 'reverse' | 'alternate'
}

/**
 * Interaction Types
 */
export type InteractionType = 
  | 'hover'
  | 'focus'
  | 'active'
  | 'tap'
  | 'drag'
  | 'scroll'
  | 'load'
  | 'enter'
  | 'exit'
  | 'complete'
  | 'error'
  | 'success'

/**
 * Animation Presets
 */
export const ANIMATION_PRESETS = {
  // Micro-interactions
  micro: {
    duration: 80,
    easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  },
  microFast: {
    duration: 120,
    easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  },
  microSlow: {
    duration: 180,
    easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  },
  
  // Standard interactions
  fast: {
    duration: 150,
    easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  },
  normal: {
    duration: 200,
    easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  },
  slow: {
    duration: 300,
    easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  },
  
  // Spring animations
  spring: {
    duration: 400,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    spring: {
      stiffness: 300,
      damping: 30,
      mass: 1,
    },
  },
  
  // Bounce animations
  bounce: {
    duration: 600,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // Elastic animations
  elastic: {
    duration: 800,
    easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
} as const

/**
 * Motion Context
 */
interface MotionContextValue {
  reducedMotion: boolean
  getAnimation: (preset: keyof typeof ANIMATION_PRESETS, config?: MotionConfig) => string
  getTransition: (preset: keyof typeof ANIMATION_PRESETS, config?: MotionConfig) => string
  getStaggerDelay: (index: number, stagger?: number) => number
}

const MotionContext = createContext<MotionContextValue | undefined>(undefined)

/**
 * Motion Provider
 */
interface MotionProviderProps {
  children: React.ReactNode
}

export function MotionProvider({ children }: MotionProviderProps) {
  const reducedMotion = useReducedMotion()
  
  const getAnimation = useCallback((preset: keyof typeof ANIMATION_PRESETS, config?: MotionConfig) => {
    if (reducedMotion) return 'none'
    
    const basePreset = ANIMATION_PRESETS[preset]
    const duration = config?.duration || basePreset.duration
    const easing = config?.easing || basePreset.easing
    
    return `${duration}ms ${easing}`
  }, [reducedMotion])
  
  const getTransition = useCallback((preset: keyof typeof ANIMATION_PRESETS, config?: MotionConfig) => {
    if (reducedMotion) return 'none'
    
    const basePreset = ANIMATION_PRESETS[preset]
    const duration = config?.duration || basePreset.duration
    const easing = config?.easing || basePreset.easing
    const delay = config?.delay ? `${config.delay}ms` : ''
    
    return `all ${duration}ms ${easing} ${delay}`.trim()
  }, [reducedMotion])
  
  const getStaggerDelay = useCallback((index: number, stagger: number = 50) => {
    if (reducedMotion) return 0
    return index * stagger
  }, [reducedMotion])
  
  const contextValue: MotionContextValue = {
    reducedMotion,
    getAnimation,
    getTransition,
    getStaggerDelay,
  }
  
  return (
    <MotionContext.Provider value={contextValue}>
      {children}
    </MotionContext.Provider>
  )
}

/**
 * Hook to use motion context
 */
export function useMotion(): MotionContextValue {
  const context = useContext(MotionContext)
  if (context === undefined) {
    throw new Error('useMotion must be used within a MotionProvider')
  }
  return context
}

/**
 * Hook for micro-interactions
 */
export function useMicroInteraction() {
  const { getAnimation, getTransition } = useMotion()
  
  return {
    // Hover interactions
    hover: {
      scale: getTransition('micro'),
      lift: getTransition('microFast'),
      glow: getTransition('microSlow'),
    },
    
    // Focus interactions
    focus: {
      ring: getTransition('micro'),
      outline: getTransition('microFast'),
    },
    
    // Active interactions
    active: {
      press: getTransition('micro'),
      tap: getAnimation('micro'),
    },
    
    // Loading interactions
    loading: {
      spin: getAnimation('normal'),
      pulse: getAnimation('slow'),
      shimmer: getAnimation('slow'),
    },
    
    // Transition interactions
    transition: {
      enter: getTransition('normal'),
      exit: getTransition('fast'),
      page: getTransition('slow'),
    },
  }
}

/**
 * Hook for scroll-triggered animations
 */
export function useScrollAnimation() {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const elementRef = useRef<HTMLElement>(null)
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
      
      if (elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect()
        const isInViewport = rect.top < window.innerHeight && rect.bottom > 0
        setIsVisible(isInViewport)
      }
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return {
    isVisible,
    scrollY,
    elementRef,
  }
}

/**
 * Hook for intersection observer animations
 */
export function useIntersectionAnimation(options?: IntersectionObserverInit) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const elementRef = useRef<HTMLElement>(null)
  
  useEffect(() => {
    const element = elementRef.current
    if (!element) return
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
        ...options,
      }
    )
    
    observer.observe(element)
    
    return () => observer.unobserve(element)
  }, [options])
  
  return {
    isIntersecting,
    elementRef,
  }
}

/**
 * Hook for gesture interactions
 */
export function useGestureInteraction() {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 })
  
  const handleDragStart = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true)
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
    setStartPosition({ x: clientX, y: clientY })
  }, [])
  
  const handleDragMove = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return
    
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
    
    setDragOffset({
      x: clientX - startPosition.x,
      y: clientY - startPosition.y,
    })
  }, [isDragging, startPosition])
  
  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
    setDragOffset({ x: 0, y: 0 })
  }, [])
  
  return {
    isDragging,
    dragOffset,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  }
}

/**
 * Hook for keyboard interactions
 */
export function useKeyboardInteraction() {
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null)
  const [isKeyboardUser, setIsKeyboardUser] = useState(false)
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setIsKeyboardUser(true)
      }
    }
    
    const handleMouseDown = () => {
      setIsKeyboardUser(false)
    }
    
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])
  
  return {
    focusedElement,
    isKeyboardUser,
    setFocusedElement,
  }
}

/**
 * Hook for page transitions
 */
export function usePageTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward')
  
  const startTransition = useCallback((direction: 'forward' | 'backward' = 'forward') => {
    setTransitionDirection(direction)
    setIsTransitioning(true)
    
    // Simulate transition duration
    setTimeout(() => {
      setIsTransitioning(false)
    }, 300)
  }, [])
  
  return {
    isTransitioning,
    transitionDirection,
    startTransition,
  }
}

/**
 * Hook for loading states with animations
 */
export function useLoadingAnimation() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const { getAnimation } = useMotion()
  
  const startLoading = useCallback(() => {
    setIsLoading(true)
    setProgress(0)
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsLoading(false)
          return 100
        }
        return prev + Math.random() * 10
      })
    }, 100)
    
    return () => clearInterval(interval)
  }, [])
  
  return {
    isLoading,
    progress,
    startLoading,
    animationDuration: getAnimation('normal'),
  }
}

/**
 * Hook for success/error animations
 */
export function useStatusAnimation() {
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle')
  const { getAnimation } = useMotion()
  
  const showSuccess = useCallback(() => {
    setStatus('success')
    setTimeout(() => setStatus('idle'), 2000)
  }, [])
  
  const showError = useCallback(() => {
    setStatus('error')
    setTimeout(() => setStatus('idle'), 3000)
  }, [])
  
  const showLoading = useCallback(() => {
    setStatus('loading')
  }, [])
  
  const hideStatus = useCallback(() => {
    setStatus('idle')
  }, [])
  
  return {
    status,
    showSuccess,
    showError,
    showLoading,
    hideStatus,
    animationDuration: getAnimation('normal'),
  }
}

/**
 * Hook for parallax effects
 */
export function useParallax(speed: number = 0.5) {
  const [offset, setOffset] = useState(0)
  
  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.scrollY * speed)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])
  
  return offset
}

/**
 * Hook for magnetic effects
 */
export function useMagneticEffect(strength: number = 0.3) {
  const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 })
  const elementRef = useRef<HTMLElement>(null)
  
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!elementRef.current) return
    
    const rect = elementRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const deltaX = (event.clientX - centerX) * strength
    const deltaY = (event.clientY - centerY) * strength
    
    setMagneticOffset({ x: deltaX, y: deltaY })
  }, [strength])
  
  const handleMouseLeave = useCallback(() => {
    setMagneticOffset({ x: 0, y: 0 })
  }, [])
  
  useEffect(() => {
    const element = elementRef.current
    if (!element) return
    
    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)
    
    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [handleMouseMove, handleMouseLeave])
  
  return {
    magneticOffset,
    elementRef,
  }
}

/**
 * Hook for ripple effects
 */
export function useRippleEffect() {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])
  
  const createRipple = useCallback((event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    const newRipple = {
      id: Date.now(),
      x,
      y,
    }
    
    setRipples(prev => [...prev, newRipple])
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
    }, 600)
  }, [])
  
  return {
    ripples,
    createRipple,
  }
}

export default MotionProvider
