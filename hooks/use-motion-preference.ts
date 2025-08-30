'use client'

import { useEffect, useState } from 'react'

export type MotionPreference = 'no-preference' | 'reduce'

export function useMotionPreference(): MotionPreference {
  const [preference, setPreference] = useState<MotionPreference>('no-preference')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    const updatePreference = () => {
      setPreference(mediaQuery.matches ? 'reduce' : 'no-preference')
    }

    // Set initial value
    updatePreference()

    // Listen for changes
    mediaQuery.addEventListener('change', updatePreference)

    return () => {
      mediaQuery.removeEventListener('change', updatePreference)
    }
  }, [])

  return preference
}

export function useReducedMotion(): boolean {
  const preference = useMotionPreference()
  return preference === 'reduce'
}

export function useMotionConfig() {
  const reducedMotion = useReducedMotion()

  return {
    shouldReduceMotion: reducedMotion,
    getTransition: (transition: string) => reducedMotion ? 'none' : transition,
    getAnimation: (animation: string) => reducedMotion ? 'none' : animation,
    getDuration: (duration: string) => reducedMotion ? '0.01ms' : duration,
  }
}