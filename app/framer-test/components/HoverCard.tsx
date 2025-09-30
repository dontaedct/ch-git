'use client'

import { useState } from 'react'

interface HoverCardProps {
  children: React.ReactNode
  className?: string
  hoverClassName?: string
}

export function HoverCard({ children, className = '', hoverClassName = '' }: HoverCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={`transition-all duration-300 ease-out ${className} ${isHovered ? hoverClassName : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  )
}
