import React from 'react'

interface SmallLoaderProps {
  className?: string
}

export function SmallLoader({ className = '' }: SmallLoaderProps) {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
}

export default SmallLoader
