'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'
import { useReducedMotion } from '@/hooks/use-motion-preference'

function MotionProvider({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion()

  React.useEffect(() => {
    if (reducedMotion) {
      document.documentElement.classList.add('reduced-motion')
    } else {
      document.documentElement.classList.remove('reduced-motion')
    }
    
    return () => {
      document.documentElement.classList.remove('reduced-motion')
    }
  }, [reducedMotion])

  return children as React.ReactElement
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <MotionProvider>
        {children}
      </MotionProvider>
    </NextThemesProvider>
  )
}
