"use client"

import React from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface RatingInputProps {
  value?: number
  onChange?: (value: number) => void
  maxRating?: number
  required?: boolean
  disabled?: boolean
  size?: "sm" | "md" | "lg"
  allowHalf?: boolean
  showLabels?: boolean
  className?: string
}

export function RatingInput({
  value = 0,
  onChange,
  maxRating = 5,
  required = false,
  disabled = false,
  size = "md",
  allowHalf = false,
  showLabels = true,
  className
}: RatingInputProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  }

  const handleClick = (rating: number) => {
    if (disabled) return
    onChange?.(rating)
  }

  const handleMouseEnter = (rating: number) => {
    // Could add hover effects here
  }

  const getLabel = (rating: number) => {
    const labels = {
      1: "Poor",
      2: "Fair", 
      3: "Good",
      4: "Very Good",
      5: "Excellent"
    }
    return labels[rating as keyof typeof labels] || ""
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-1">
        {Array.from({ length: maxRating }, (_, index) => {
          const rating = index + 1
          const isFilled = rating <= value
          const isHalfFilled = allowHalf && rating - 0.5 <= value && value < rating
          
          return (
            <button
              key={rating}
              type="button"
              onClick={() => handleClick(rating)}
              onMouseEnter={() => handleMouseEnter(rating)}
              disabled={disabled}
              className={cn(
                "transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded",
                disabled && "cursor-not-allowed",
                !disabled && "cursor-pointer hover:scale-110"
              )}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  isFilled ? "text-yellow-400 fill-current" : 
                  isHalfFilled ? "text-yellow-400 fill-current opacity-50" :
                  "text-gray-300"
                )}
              />
            </button>
          )
        })}
      </div>
      
      {showLabels && value > 0 && (
        <div className="text-sm text-muted-foreground">
          {getLabel(value)} ({value}/{maxRating})
        </div>
      )}
      
      {required && value === 0 && (
        <p className="text-xs text-red-600">
          Please select a rating
        </p>
      )}
    </div>
  )
}

export default RatingInput
