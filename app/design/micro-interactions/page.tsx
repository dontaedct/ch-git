"use client";

/**
 * @fileoverview HT-008.5.7: Micro-Interactions and UX Patterns Demo
 * @module app/design/micro-interactions/page
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.5.7 - Add micro-interactions and advanced UX patterns
 * Focus: Vercel/Apply-level micro-interactions demonstration
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (user experience and accessibility)
 */

import React, { useState } from "react"
import {
  DisplayLG,
  HeadingXL,
  HeadingLG,
  HeadingMD,
  BodyMD,
  BodySM,
  LabelMD,
  CaptionMD,
  CodeMD,
  Lead,
  Muted,
  TypographyContainer,
} from "@/components/ui/typography"
import {
  Padding,
  PaddingX,
  PaddingY,
  Margin,
  MarginY,
  Space,
  SpaceY,
} from "@/components/ui/spacing"
import {
  InteractiveButton,
  InteractiveHoverCard,
  AnimatedCard,
  InteractiveInput,
  LoadingSpinner,
  ProgressBar,
  FloatingActionButton,
} from "@/components/ui/micro-interactions"
import {
  StaggeredContainer,
  ParallaxSection,
  RevealAnimation,
  DragDropContainer,
  InfiniteScroll,
  MorphingButton,
  StatusToast,
  GestureContainer,
} from "@/components/ui/ux-patterns"
import { MotionProvider } from "@/lib/motion/interactions"

// HT-008.5.7: Enhanced Micro-Interactions and UX Patterns Demo
// Comprehensive showcase of our advanced interaction system

export default function MicroInteractionsPage() {
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: 'success' | 'error' | 'warning' | 'info' }>>([])
  const [items, setItems] = useState([
    { id: 1, title: "Item 1", content: "First item content" },
    { id: 2, title: "Item 2", content: "Second item content" },
    { id: 3, title: "Item 3", content: "Third item content" },
    { id: 4, title: "Item 4", content: "Fourth item content" },
  ])
  
  const handleProgressUpdate = () => {
    setProgress(0)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + Math.random() * 10
      })
    }, 100)
  }
  
  const handleLoading = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
  }
  
  const addToast = (type: 'success' | 'error' | 'warning' | 'info') => {
    const messages = {
      success: "Operation completed successfully!",
      error: "Something went wrong. Please try again.",
      warning: "Please review this information.",
      info: "Here's some helpful information.",
    }
    
    const newToast = {
      id: Date.now(),
      message: messages[type],
      type,
    }
    
    setToasts(prev => [...prev, newToast])
  }
  
  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }
  
  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newItems = [...items]
    const [movedItem] = newItems.splice(fromIndex, 1)
    newItems.splice(toIndex, 0, movedItem)
    setItems(newItems)
  }
  
  return (
    <MotionProvider>
      <div className="min-h-screen bg-theme text-theme theme-transition">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-12">
            <DisplayLG className="text-theme mb-4">Micro-Interactions & UX Patterns</DisplayLG>
            <Lead className="text-theme-secondary mb-6">
              Comprehensive demonstration of our advanced micro-interactions and UX patterns,
              featuring sophisticated animations, gestures, and user experience enhancements.
            </Lead>
            <BodyMD className="text-theme-muted">
              This page showcases all micro-interactions and advanced UX patterns implemented
              as part of HT-008.5.7, including hover effects, scroll animations, and gesture recognition.
            </BodyMD>
          </div>

          {/* Interactive Buttons */}
          <section className="mb-16">
            <HeadingXL className="text-theme mb-8">Interactive Buttons</HeadingXL>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card-theme rounded-lg p-6">
                <HeadingMD className="text-theme mb-4">Lift Effect</HeadingMD>
                <InteractiveButton variant="primary" interaction="lift">
                  Hover to Lift
                </InteractiveButton>
                <BodySM className="text-theme-secondary mt-2">
                  Subtle elevation on hover
                </BodySM>
              </div>
              
              <div className="card-theme rounded-lg p-6">
                <HeadingMD className="text-theme mb-4">Scale Effect</HeadingMD>
                <InteractiveButton variant="secondary" interaction="scale">
                  Hover to Scale
                </InteractiveButton>
                <BodySM className="text-theme-secondary mt-2">
                  Smooth scaling animation
                </BodySM>
              </div>
              
              <div className="card-theme rounded-lg p-6">
                <HeadingMD className="text-theme mb-4">Glow Effect</HeadingMD>
                <InteractiveButton variant="ghost" interaction="glow">
                  Hover to Glow
                </InteractiveButton>
                <BodySM className="text-theme-secondary mt-2">
                  Glowing shadow effect
                </BodySM>
              </div>
              
              <div className="card-theme rounded-lg p-6">
                <HeadingMD className="text-theme mb-4">Magnetic Effect</HeadingMD>
                <InteractiveButton variant="primary" interaction="magnetic">
                  Magnetic Pull
                </InteractiveButton>
                <BodySM className="text-theme-secondary mt-2">
                  Follows mouse movement
                </BodySM>
              </div>
            </div>
          </section>

          {/* Hover Cards */}
          <section className="mb-16">
            <HeadingXL className="text-theme mb-8">Hover Cards</HeadingXL>
            
            <div className="flex flex-wrap gap-6">
              <InteractiveHoverCard
                content={
                  <div>
                    <HeadingMD className="text-theme mb-2">Hover Card</HeadingMD>
                    <BodySM className="text-theme-secondary">
                      This card appears on hover with smooth animations.
                    </BodySM>
                  </div>
                }
              >
                <InteractiveButton variant="secondary">
                  Hover Me
                </InteractiveButton>
              </InteractiveHoverCard>
              
              <InteractiveHoverCard
                side="top"
                content={
                  <div>
                    <HeadingMD className="text-theme mb-2">Top Position</HeadingMD>
                    <BodySM className="text-theme-secondary">
                      Card appears above the trigger.
                    </BodySM>
                  </div>
                }
              >
                <InteractiveButton variant="secondary">
                  Top Card
                </InteractiveButton>
              </InteractiveHoverCard>
              
              <InteractiveHoverCard
                side="right"
                content={
                  <div>
                    <HeadingMD className="text-theme mb-2">Right Position</HeadingMD>
                    <BodySM className="text-theme-secondary">
                      Card appears to the right.
                    </BodySM>
                  </div>
                }
              >
                <InteractiveButton variant="secondary">
                  Right Card
                </InteractiveButton>
              </InteractiveHoverCard>
            </div>
          </section>

          {/* Animated Cards */}
          <section className="mb-16">
            <HeadingXL className="text-theme mb-8">Scroll Animations</HeadingXL>
            
            <div className="space-y-8">
              <AnimatedCard animation="fade" delay={0}>
                <div className="card-theme rounded-lg p-6">
                  <HeadingMD className="text-theme mb-2">Fade Animation</HeadingMD>
                  <BodySM className="text-theme-secondary">
                    This card fades in as you scroll down the page.
                  </BodySM>
                </div>
              </AnimatedCard>
              
              <AnimatedCard animation="slide" delay={100}>
                <div className="card-theme rounded-lg p-6">
                  <HeadingMD className="text-theme mb-2">Slide Animation</HeadingMD>
                  <BodySM className="text-theme-secondary">
                    This card slides up from below as it comes into view.
                  </BodySM>
                </div>
              </AnimatedCard>
              
              <AnimatedCard animation="scale" delay={200}>
                <div className="card-theme rounded-lg p-6">
                  <HeadingMD className="text-theme mb-2">Scale Animation</HeadingMD>
                  <BodySM className="text-theme-secondary">
                    This card scales up from 95% to 100% when visible.
                  </BodySM>
                </div>
              </AnimatedCard>
            </div>
          </section>

          {/* Interactive Inputs */}
          <section className="mb-16">
            <HeadingXL className="text-theme mb-8">Interactive Inputs</HeadingXL>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card-theme rounded-lg p-6">
                <HeadingMD className="text-theme mb-4">Floating Label</HeadingMD>
                <InteractiveInput
                  label="Email Address"
                  placeholder=""
                  type="email"
                />
                <BodySM className="text-theme-secondary mt-2">
                  Label floats up when focused or has content
                </BodySM>
              </div>
              
              <div className="card-theme rounded-lg p-6">
                <HeadingMD className="text-theme mb-4">Loading State</HeadingMD>
                <InteractiveInput
                  label="Processing"
                  placeholder=""
                  loading={isLoading}
                />
                <BodySM className="text-theme-secondary mt-2">
                  Shows loading spinner when processing
                </BodySM>
              </div>
            </div>
          </section>

          {/* Loading States */}
          <section className="mb-16">
            <HeadingXL className="text-theme mb-8">Loading States</HeadingXL>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card-theme rounded-lg p-6 text-center">
                <HeadingMD className="text-theme mb-4">Spinner</HeadingMD>
                <LoadingSpinner variant="spinner" size="lg" />
                <BodySM className="text-theme-secondary mt-2">
                  Classic spinning loader
                </BodySM>
              </div>
              
              <div className="card-theme rounded-lg p-6 text-center">
                <HeadingMD className="text-theme mb-4">Dots</HeadingMD>
                <LoadingSpinner variant="dots" size="lg" />
                <BodySM className="text-theme-secondary mt-2">
                  Animated dots sequence
                </BodySM>
              </div>
              
              <div className="card-theme rounded-lg p-6 text-center">
                <HeadingMD className="text-theme mb-4">Pulse</HeadingMD>
                <LoadingSpinner variant="pulse" size="lg" />
                <BodySM className="text-theme-secondary mt-2">
                  Pulsing animation
                </BodySM>
              </div>
              
              <div className="card-theme rounded-lg p-6 text-center">
                <HeadingMD className="text-theme mb-4">Shimmer</HeadingMD>
                <LoadingSpinner variant="shimmer" size="lg" />
                <BodySM className="text-theme-secondary mt-2">
                  Shimmer effect loader
                </BodySM>
              </div>
            </div>
          </section>

          {/* Progress Indicators */}
          <section className="mb-16">
            <HeadingXL className="text-theme mb-8">Progress Indicators</HeadingXL>
            
            <div className="space-y-6">
              <div className="card-theme rounded-lg p-6">
                <HeadingMD className="text-theme mb-4">Animated Progress</HeadingMD>
                <ProgressBar value={progress} animated />
                <div className="mt-4">
                  <InteractiveButton onClick={handleProgressUpdate}>
                    Start Progress
                  </InteractiveButton>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card-theme rounded-lg p-4">
                  <HeadingMD className="text-theme mb-2">Success</HeadingMD>
                  <ProgressBar value={100} variant="success" />
                </div>
                <div className="card-theme rounded-lg p-4">
                  <HeadingMD className="text-theme mb-2">Warning</HeadingMD>
                  <ProgressBar value={60} variant="warning" />
                </div>
                <div className="card-theme rounded-lg p-4">
                  <HeadingMD className="text-theme mb-2">Error</HeadingMD>
                  <ProgressBar value={30} variant="error" />
                </div>
              </div>
            </div>
          </section>

          {/* Staggered Animations */}
          <section className="mb-16">
            <HeadingXL className="text-theme mb-8">Staggered Animations</HeadingXL>
            
            <StaggeredContainer stagger={150} direction="up">
              <div className="card-theme rounded-lg p-6">
                <HeadingMD className="text-theme mb-2">First Item</HeadingMD>
                <BodySM className="text-theme-secondary">Animates in first</BodySM>
              </div>
              <div className="card-theme rounded-lg p-6">
                <HeadingMD className="text-theme mb-2">Second Item</HeadingMD>
                <BodySM className="text-theme-secondary">Animates in second</BodySM>
              </div>
              <div className="card-theme rounded-lg p-6">
                <HeadingMD className="text-theme mb-2">Third Item</HeadingMD>
                <BodySM className="text-theme-secondary">Animates in third</BodySM>
              </div>
              <div className="card-theme rounded-lg p-6">
                <HeadingMD className="text-theme mb-2">Fourth Item</HeadingMD>
                <BodySM className="text-theme-secondary">Animates in fourth</BodySM>
              </div>
            </StaggeredContainer>
          </section>

          {/* Drag and Drop */}
          <section className="mb-16">
            <HeadingXL className="text-theme mb-8">Drag and Drop</HeadingXL>
            
            <div className="card-theme rounded-lg p-6">
              <HeadingMD className="text-theme mb-4">Reorderable Items</HeadingMD>
              <BodySM className="text-theme-secondary mb-4">
                Drag items to reorder them. Items will animate smoothly during the process.
              </BodySM>
              
              <DragDropContainer onReorder={handleReorder}>
                {items.map((item) => (
                  <div key={item.id} className="card-theme-elevated rounded-lg p-4">
                    <HeadingMD className="text-theme mb-1">{item.title}</HeadingMD>
                    <BodySM className="text-theme-secondary">{item.content}</BodySM>
                  </div>
                ))}
              </DragDropContainer>
            </div>
          </section>

          {/* Morphing Button */}
          <section className="mb-16">
            <HeadingXL className="text-theme mb-8">Morphing Button</HeadingXL>
            
            <div className="card-theme rounded-lg p-6 text-center">
              <HeadingMD className="text-theme mb-4">State Morphing</HeadingMD>
              <MorphingButton morphTo="✓ Complete">
                Start Process
              </MorphingButton>
              <BodySM className="text-theme-secondary mt-2">
                Button morphs to show completion state
              </BodySM>
            </div>
          </section>

          {/* Status Toasts */}
          <section className="mb-16">
            <HeadingXL className="text-theme mb-8">Status Toasts</HeadingXL>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <InteractiveButton onClick={() => addToast('success')}>
                Success Toast
              </InteractiveButton>
              <InteractiveButton onClick={() => addToast('error')}>
                Error Toast
              </InteractiveButton>
              <InteractiveButton onClick={() => addToast('warning')}>
                Warning Toast
              </InteractiveButton>
              <InteractiveButton onClick={() => addToast('info')}>
                Info Toast
              </InteractiveButton>
            </div>
          </section>

          {/* Gesture Recognition */}
          <section className="mb-16">
            <HeadingXL className="text-theme mb-8">Gesture Recognition</HeadingXL>
            
            <GestureContainer
              onSwipeLeft={() => addToast('info')}
              onSwipeRight={() => addToast('success')}
              onSwipeUp={() => addToast('warning')}
              onSwipeDown={() => addToast('error')}
            >
              <div className="card-theme rounded-lg p-8 text-center">
                <HeadingMD className="text-theme mb-4">Swipe Gestures</HeadingMD>
                <BodySM className="text-theme-secondary mb-4">
                  Swipe in different directions to trigger actions
                </BodySM>
                <div className="text-4xl">👆</div>
              </div>
            </GestureContainer>
          </section>

          {/* Floating Action Button */}
          <FloatingActionButton
            icon="+"
            tooltip="Add new item"
            onClick={() => addToast('success')}
          />

          {/* Toast Container */}
          <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map((toast) => (
              <StatusToast
                key={toast.id}
                message={toast.message}
                type={toast.type}
                onClose={() => removeToast(toast.id)}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-theme pt-8">
            <BodySM className="text-theme-muted text-center">
              HT-008.5.7: Micro-Interactions and Advanced UX Patterns Implementation Complete
            </BodySM>
          </div>
        </div>
      </div>
    </MotionProvider>
  )
}
