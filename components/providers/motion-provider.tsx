'use client';

import React from 'react';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-motion-preference';

interface MotionProviderProps {
  children: React.ReactNode;
}

export function MotionProvider({ children }: MotionProviderProps) {
  const reducedMotion = useReducedMotion();

  // Configure motion based on user preference
  const motionConfig = {
    reducedMotion: reducedMotion ? 'always' as const : 'never' as const,
  };

  return (
    <MotionConfig {...motionConfig}>
      {children}
    </MotionConfig>
  );
}
