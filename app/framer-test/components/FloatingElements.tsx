'use client'

import { useEffect, useState } from 'react'

export function FloatingElements() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating circles */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-blue-400 rounded-full opacity-20 animate-bounce-subtle"></div>
      <div className="absolute top-40 right-20 w-6 h-6 bg-purple-400 rounded-full opacity-20 animate-bounce-subtle" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-40 left-20 w-3 h-3 bg-green-400 rounded-full opacity-20 animate-bounce-subtle" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-20 right-10 w-5 h-5 bg-pink-400 rounded-full opacity-20 animate-bounce-subtle" style={{ animationDelay: '0.5s' }}></div>
      
      {/* Floating squares */}
      <div className="absolute top-60 left-1/4 w-2 h-2 bg-yellow-400 opacity-20 animate-bounce-subtle" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute bottom-60 right-1/4 w-3 h-3 bg-indigo-400 opacity-20 animate-bounce-subtle" style={{ animationDelay: '2.5s' }}></div>
    </div>
  )
}
