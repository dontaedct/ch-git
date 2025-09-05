'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-motion-preference';

export default function ReducedMotionTestPage() {
  const reducedMotion = useReducedMotion();

  const testVariants = {
    hidden: { 
      opacity: 0, 
      y: reducedMotion ? 0 : 20,
      scale: reducedMotion ? 1 : 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: reducedMotion ? 0.01 : 0.5,
        ease: "easeOut" as const
      }
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Reduced Motion Test Page</h1>
      
      <div className="mb-6 p-4 bg-muted/20 rounded-lg">
        <p className="text-sm text-muted-foreground">
          Current motion preference: <strong className="text-foreground">{reducedMotion ? 'Reduced' : 'Normal'}</strong>
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          To test reduced motion: Chrome Settings → Advanced → Accessibility → Prefers reduced motion
        </p>
      </div>

      {/* Test Framer Motion animations */}
      <motion.div
        className="bg-primary/10 p-6 rounded-lg mb-6"
        variants={testVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="font-semibold mb-3 text-lg">Framer Motion Test</h2>
        <p>This element should animate smoothly in normal mode and appear instantly in reduced motion mode.</p>
        <div className="mt-3 text-sm text-muted-foreground">
          Expected behavior: {reducedMotion ? 'No animation, instant appearance' : 'Smooth fade-in with movement'}
        </div>
      </motion.div>

      {/* Test CSS transitions */}
      <div className="bg-secondary/10 p-6 rounded-lg mb-6 transition-all duration-300 hover:bg-secondary/20 hover:scale-105">
        <h2 className="font-semibold mb-3 text-lg">CSS Transition Test</h2>
        <p>Hover over this element. The background and scale should transition smoothly in normal mode and change instantly in reduced motion mode.</p>
        <div className="mt-3 text-sm text-muted-foreground">
          Expected behavior: {reducedMotion ? 'Instant color/scale change on hover' : 'Smooth 300ms transition'}
        </div>
      </div>

      {/* Test CSS animations */}
      <div className="bg-accent/10 p-6 rounded-lg mb-6 animate-pulse">
        <h2 className="font-semibold mb-3 text-lg">CSS Animation Test</h2>
        <p>This element has a pulse animation that should be disabled in reduced motion mode.</p>
        <div className="mt-3 text-sm text-muted-foreground">
          Expected behavior: {reducedMotion ? 'No pulsing animation' : 'Continuous pulse animation'}
        </div>
      </div>

      {/* Test hover effects */}
      <div className="group bg-muted/10 p-6 rounded-lg mb-6">
        <h2 className="font-semibold mb-3 text-lg group-hover:text-primary transition-colors duration-200">
          Hover Effect Test
        </h2>
        <p className="group-hover:scale-105 transition-transform duration-200">
          Hover over this element. The text color and scale should change smoothly in normal mode and instantly in reduced motion mode.
        </p>
        <div className="mt-3 text-sm text-muted-foreground">
          Expected behavior: {reducedMotion ? 'Instant color/scale change' : 'Smooth 200ms transitions'}
        </div>
      </div>

      {/* Test button interactions */}
      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Button Interaction Tests</h2>
        
        <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors duration-200 mr-4">
          Primary Button
        </button>
        
        <button className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg hover:bg-secondary/90 transition-colors duration-200 mr-4">
          Secondary Button
        </button>
        
        <button className="border border-border px-6 py-3 rounded-lg hover:bg-muted transition-colors duration-200">
          Outline Button
        </button>
        
        <div className="mt-3 text-sm text-muted-foreground">
          Expected behavior: {reducedMotion ? 'Instant color changes on hover' : 'Smooth 200ms color transitions'}
        </div>
      </div>

      {/* Test scroll behavior */}
      <div className="mt-8 p-6 bg-muted/20 rounded-lg">
        <h2 className="font-semibold text-lg mb-3">Scroll Behavior Test</h2>
        <p className="mb-4">Scroll to the bottom of this page and click the link below.</p>
        <a 
          href="#top" 
          className="text-primary hover:underline transition-colors duration-200"
        >
          Scroll to top
        </a>
        <div className="mt-3 text-sm text-muted-foreground">
          Expected behavior: {reducedMotion ? 'Instant jump to top' : 'Smooth scroll animation'}
        </div>
      </div>

      {/* Test focus indicators */}
      <div className="mt-8 p-6 bg-muted/20 rounded-lg">
        <h2 className="font-semibold text-lg mb-3">Focus Indicator Test</h2>
        <p className="mb-4">Tab through these elements to test focus indicators.</p>
        <div className="space-x-4">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded focus:outline-2 focus:outline-ring focus:outline-offset-2">
            Focusable Button 1
          </button>
          <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded focus:outline-2 focus:outline-ring focus:outline-offset-2">
            Focusable Button 2
          </button>
          <input 
            type="text" 
            placeholder="Focusable input"
            className="px-4 py-2 border border-border rounded focus:outline-2 focus:outline-ring focus:outline-offset-2"
          />
        </div>
        <div className="mt-3 text-sm text-muted-foreground">
          Expected behavior: Focus indicators should always be visible regardless of motion preference
        </div>
      </div>

      <div id="top" className="mt-16 pt-8 border-t border-border">
        <h2 className="font-semibold text-lg mb-3">Test Summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Framer Motion animations respect reduced motion preference</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>CSS transitions respect reduced motion preference</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>CSS animations are disabled in reduced motion mode</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Hover effects respect reduced motion preference</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Button interactions respect reduced motion preference</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Focus indicators remain visible in all modes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
