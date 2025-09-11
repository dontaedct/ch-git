/**
 * Animated Typing Dots Component
 * 
 * Provides animated dots to indicate typing activity
 * with smooth CSS animations.
 */

'use client';

import React from 'react';

export interface TypingDotsProps {
  className?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-1 h-1',
  md: 'w-1.5 h-1.5',
  lg: 'w-2 h-2'
};

export function TypingDots({ 
  className = '',
  color = 'text-gray-500',
  size = 'sm'
}: TypingDotsProps) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div 
        className={`${sizeClasses[size]} rounded-full bg-current ${color} animate-pulse`}
        style={{ animationDelay: '0ms', animationDuration: '1.4s' }}
      />
      <div 
        className={`${sizeClasses[size]} rounded-full bg-current ${color} animate-pulse`}
        style={{ animationDelay: '200ms', animationDuration: '1.4s' }}
      />
      <div 
        className={`${sizeClasses[size]} rounded-full bg-current ${color} animate-pulse`}
        style={{ animationDelay: '400ms', animationDuration: '1.4s' }}
      />
    </div>
  );
}

export default TypingDots;
