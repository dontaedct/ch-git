/**
 * @fileoverview HT-008.5.7: Advanced UX Pattern Components
 * @module components/ui/ux-patterns
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.5.7 - Add micro-interactions and advanced UX patterns
 * Focus: Vercel/Apply-level advanced UX patterns
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (user experience and accessibility)
 */

'use client'

import React, { forwardRef, useState, useRef, useEffect, useCallback } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import {
  useMicroInteraction,
  useScrollAnimation,
  useIntersectionAnimation,
  useGestureInteraction,
  useKeyboardInteraction,
  useRippleEffect,
  useMagneticEffect,
  useParallax,
  useStatusAnimation,
} from '@/lib/motion/interactions'

// HT-008.5.7: Enhanced Advanced UX Pattern Components
// Sophisticated UX patterns following Vercel/Apply design principles

/**
 * Staggered Animation Container
 */
export interface StaggeredContainerProps {
  children: React.ReactNode
  stagger?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  className?: string
}

export const StaggeredContainer = forwardRef<HTMLDivElement, StaggeredContainerProps>(
  ({ children, stagger = 100, direction = 'up', className }, ref) => {
    const { isIntersecting, elementRef } = useIntersectionAnimation()
    const { transition } = useMicroInteraction()
    
    const getTransform = (index: number) => {
      if (!isIntersecting) {
        switch (direction) {
          case 'up':
            return 'translateY(20px)'
          case 'down':
            return 'translateY(-20px)'
          case 'left':
            return 'translateX(20px)'
          case 'right':
            return 'translateX(-20px)'
          default:
            return 'translateY(20px)'
        }
      }
      return 'none'
    }
    
    return (
      <div
        ref={(node) => {
          if (ref) {
            if (typeof ref === 'function') ref(node)
            else ref.current = node
          }
          elementRef.current = node
        }}
        className={cn("space-y-4", className)}
      >
        {React.Children.map(children, (child, index) => (
          <div
            key={index}
            className="transition-all duration-500 ease-out"
            style={{
              opacity: isIntersecting ? 1 : 0,
              transform: getTransform(index),
              transitionDelay: `${index * stagger}ms`,
              transition: transition.enter,
            }}
          >
            {child}
          </div>
        ))}
      </div>
    )
  }
)
StaggeredContainer.displayName = "StaggeredContainer"

/**
 * Parallax Section
 */
export interface ParallaxSectionProps {
  children: React.ReactNode
  speed?: number
  className?: string
}

export const ParallaxSection = forwardRef<HTMLDivElement, ParallaxSectionProps>(
  ({ children, speed = 0.5, className }, ref) => {
    const offset = useParallax(speed)
    
    return (
      <div
        ref={ref}
        className={cn("relative", className)}
        style={{
          transform: `translateY(${offset}px)`,
        }}
      >
        {children}
      </div>
    )
  }
)
ParallaxSection.displayName = "ParallaxSection"

/**
 * Reveal Animation Component
 */
export interface RevealAnimationProps {
  children: React.ReactNode
  animation?: 'fade' | 'slide' | 'scale' | 'rotate' | 'blur'
  direction?: 'up' | 'down' | 'left' | 'right'
  delay?: number
  duration?: number
  className?: string
}

export const RevealAnimation = forwardRef<HTMLDivElement, RevealAnimationProps>(
  ({ children, animation = 'fade', direction = 'up', delay = 0, duration = 500, className }, ref) => {
    const { isIntersecting, elementRef } = useIntersectionAnimation()
    const { transition } = useMicroInteraction()
    
    const getInitialTransform = () => {
      if (isIntersecting) return 'none'
      
      switch (animation) {
        case 'fade':
          return 'none'
        case 'slide':
          switch (direction) {
            case 'up':
              return 'translateY(30px)'
            case 'down':
              return 'translateY(-30px)'
            case 'left':
              return 'translateX(30px)'
            case 'right':
              return 'translateX(-30px)'
            default:
              return 'translateY(30px)'
          }
        case 'scale':
          return 'scale(0.9)'
        case 'rotate':
          return 'rotate(5deg)'
        case 'blur':
          return 'none'
        default:
          return 'none'
      }
    }
    
    const getInitialOpacity = () => {
      if (isIntersecting) return 1
      return animation === 'fade' || animation === 'blur' ? 0 : 1
    }
    
    const getInitialFilter = () => {
      if (isIntersecting) return 'blur(0px)'
      return animation === 'blur' ? 'blur(10px)' : 'blur(0px)'
    }
    
    return (
      <div
        ref={(node) => {
          if (ref) {
            if (typeof ref === 'function') ref(node)
            else ref.current = node
          }
          elementRef.current = node
        }}
        className={cn("transition-all ease-out", className)}
        style={{
          opacity: getInitialOpacity(),
          transform: getInitialTransform(),
          filter: getInitialFilter(),
          transitionDuration: `${duration}ms`,
          transitionDelay: `${delay}ms`,
          transition: transition.enter,
        }}
      >
        {children}
      </div>
    )
  }
)
RevealAnimation.displayName = "RevealAnimation"

/**
 * Drag and Drop Container
 */
export interface DragDropContainerProps {
  children: React.ReactNode
  onReorder?: (fromIndex: number, toIndex: number) => void
  className?: string
}

export const DragDropContainer = forwardRef<HTMLDivElement, DragDropContainerProps>(
  ({ children, onReorder, className }, ref) => {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
    const { hover } = useMicroInteraction()
    
    const handleDragStart = (index: number) => {
      setDraggedIndex(index)
    }
    
    const handleDragOver = (e: React.DragEvent, index: number) => {
      e.preventDefault()
      setDragOverIndex(index)
    }
    
    const handleDragLeave = () => {
      setDragOverIndex(null)
    }
    
    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault()
      
      if (draggedIndex !== null && draggedIndex !== dropIndex && onReorder) {
        onReorder(draggedIndex, dropIndex)
      }
      
      setDraggedIndex(null)
      setDragOverIndex(null)
    }
    
    return (
      <div ref={ref} className={cn("space-y-2", className)}>
        {React.Children.map(children, (child, index) => (
          <div
            key={index}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            className={cn(
              "transition-all duration-200 cursor-move",
              draggedIndex === index && "opacity-50 scale-95",
              dragOverIndex === index && "scale-105 bg-theme-elevated",
              hover.scale
            )}
          >
            {child}
          </div>
        ))}
      </div>
    )
  }
)
DragDropContainer.displayName = "DragDropContainer"

/**
 * Infinite Scroll Container
 */
export interface InfiniteScrollProps {
  children: React.ReactNode
  hasMore: boolean
  loadMore: () => void
  threshold?: number
  className?: string
}

export const InfiniteScroll = forwardRef<HTMLDivElement, InfiniteScrollProps>(
  ({ children, hasMore, loadMore, threshold = 100, className }, ref) => {
    const [isLoading, setIsLoading] = useState(false)
    const sentinelRef = useRef<HTMLDivElement>(null)
    const { transition } = useMicroInteraction()
    
    useEffect(() => {
      const sentinel = sentinelRef.current
      if (!sentinel || !hasMore) return
      
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !isLoading) {
            setIsLoading(true)
            loadMore()
            setTimeout(() => setIsLoading(false), 1000)
          }
        },
        { rootMargin: `${threshold}px` }
      )
      
      observer.observe(sentinel)
      
      return () => observer.disconnect()
    }, [hasMore, loadMore, threshold, isLoading])
    
    return (
      <div ref={ref} className={cn("space-y-4", className)}>
        {children}
        
        {hasMore && (
          <div
            ref={sentinelRef}
            className="flex justify-center py-8"
            style={{ transition: transition.enter }}
          >
            {isLoading && (
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-theme-primary border-t-transparent" />
                <span className="text-theme-secondary">Loading more...</span>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
)
InfiniteScroll.displayName = "InfiniteScroll"

/**
 * Virtual Scrolling Container
 */
export interface VirtualScrollProps {
  items: any[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: any, index: number) => React.ReactNode
  className?: string
}

export const VirtualScroll = forwardRef<HTMLDivElement, VirtualScrollProps>(
  ({ items, itemHeight, containerHeight, renderItem, className }, ref) => {
    const [scrollTop, setScrollTop] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)
    
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    )
    
    const visibleItems = items.slice(startIndex, endIndex)
    const offsetY = startIndex * itemHeight
    
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop)
    }, [])
    
    return (
      <div
        ref={(node) => {
          if (ref) {
            if (typeof ref === 'function') ref(node)
            else ref.current = node
          }
          containerRef.current = node
        }}
        className={cn("overflow-auto", className)}
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        <div style={{ height: items.length * itemHeight, position: 'relative' }}>
          <div
            style={{
              transform: `translateY(${offsetY}px)`,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
            }}
          >
            {visibleItems.map((item, index) => (
              <div
                key={startIndex + index}
                style={{ height: itemHeight }}
              >
                {renderItem(item, startIndex + index)}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
)
VirtualScroll.displayName = "VirtualScroll"

/**
 * Morphing Button
 */
export interface MorphingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  morphTo?: React.ReactNode
  duration?: number
  className?: string
}

export const MorphingButton = forwardRef<HTMLButtonElement, MorphingButtonProps>(
  ({ children, morphTo, duration = 300, className, ...props }, ref) => {
    const [isMorphed, setIsMorphed] = useState(false)
    const { hover, active } = useMicroInteraction()
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (morphTo) {
        setIsMorphed(!isMorphed)
      }
      props.onClick?.(e)
    }
    
    return (
      <button
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-lg px-4 py-2 font-medium transition-all duration-300",
          "bg-theme-primary text-theme-inverse hover:bg-theme-primary-hover",
          "focus:outline-none focus:ring-2 focus:ring-theme-primary focus:ring-offset-2",
          hover.scale,
          className
        )}
        onClick={handleClick}
        {...props}
      >
        <div
          className="flex items-center justify-center transition-all duration-300"
          style={{
            transform: isMorphed ? 'translateY(-100%)' : 'translateY(0)',
            transitionDuration: `${duration}ms`,
          }}
        >
          {children}
        </div>
        
        {morphTo && (
          <div
            className="absolute inset-0 flex items-center justify-center transition-all duration-300"
            style={{
              transform: isMorphed ? 'translateY(0)' : 'translateY(100%)',
              transitionDuration: `${duration}ms`,
            }}
          >
            {morphTo}
          </div>
        )}
      </button>
    )
  }
)
MorphingButton.displayName = "MorphingButton"

/**
 * Status Toast with Animations
 */
export interface StatusToastProps {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  onClose?: () => void
  className?: string
}

export const StatusToast = forwardRef<HTMLDivElement, StatusToastProps>(
  ({ message, type = 'info', duration = 3000, onClose, className }, ref) => {
    const [isVisible, setIsVisible] = useState(true)
    const { status, showSuccess, showError, hideStatus } = useStatusAnimation()
    const { transition } = useMicroInteraction()
    
    useEffect(() => {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onClose?.(), 300)
      }, duration)
      
      return () => clearTimeout(timer)
    }, [duration, onClose])
    
    const typeClasses = {
      success: 'bg-green-500 text-white',
      error: 'bg-red-500 text-white',
      warning: 'bg-yellow-500 text-black',
      info: 'bg-blue-500 text-white',
    }
    
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          "fixed top-4 right-4 z-50 flex items-center space-x-2 rounded-lg px-4 py-3 shadow-lg",
          typeClasses[type],
          className
        )}
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
          transition: transition.enter,
        }}
      >
        <span className="text-lg">{icons[type]}</span>
        <span className="font-medium">{message}</span>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(() => onClose?.(), 300)
          }}
          className="ml-2 text-current opacity-70 hover:opacity-100"
        >
          ✕
        </button>
      </div>
    )
  }
)
StatusToast.displayName = "StatusToast"

/**
 * Gesture Recognition Container
 */
export interface GestureContainerProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onPinch?: (scale: number) => void
  className?: string
}

export const GestureContainer = forwardRef<HTMLDivElement, GestureContainerProps>(
  ({ children, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onPinch, className }, ref) => {
    const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
    const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)
    const { hover } = useMicroInteraction()
    
    const minSwipeDistance = 50
    
    const handleTouchStart = (e: React.TouchEvent) => {
      setTouchEnd(null)
      setTouchStart({
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY,
      })
    }
    
    const handleTouchMove = (e: React.TouchEvent) => {
      setTouchEnd({
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY,
      })
    }
    
    const handleTouchEnd = () => {
      if (!touchStart || !touchEnd) return
      
      const distanceX = touchStart.x - touchEnd.x
      const distanceY = touchStart.y - touchEnd.y
      const isLeftSwipe = distanceX > minSwipeDistance
      const isRightSwipe = distanceX < -minSwipeDistance
      const isUpSwipe = distanceY > minSwipeDistance
      const isDownSwipe = distanceY < -minSwipeDistance
      
      if (isLeftSwipe) onSwipeLeft?.()
      if (isRightSwipe) onSwipeRight?.()
      if (isUpSwipe) onSwipeUp?.()
      if (isDownSwipe) onSwipeDown?.()
    }
    
    return (
      <div
        ref={ref}
        className={cn("touch-none", className)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transition: hover.scale }}
      >
        {children}
      </div>
    )
  }
)
GestureContainer.displayName = "GestureContainer"

export {
  StaggeredContainer,
  ParallaxSection,
  RevealAnimation,
  DragDropContainer,
  InfiniteScroll,
  VirtualScroll,
  MorphingButton,
  StatusToast,
  GestureContainer,
}
