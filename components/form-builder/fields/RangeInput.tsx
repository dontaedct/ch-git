"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface RangeInputProps {
  value?: number
  onChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  required?: boolean
  disabled?: boolean
  showValue?: boolean
  showLabels?: boolean
  className?: string
}

export function RangeInput({
  value = 0,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  required = false,
  disabled = false,
  showValue = true,
  showLabels = true,
  className
}: RangeInputProps) {
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className="space-y-2">
      {showLabels && (
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      )}
      
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange?.(Number(e.target.value))}
          required={required}
          disabled={disabled}
          className={cn(
            "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`
          }}
        />
      </div>
      
      {showValue && (
        <div className="text-center">
          <span className="text-sm font-medium text-gray-700">
            {value}
          </span>
        </div>
      )}
    </div>
  )
}

export default RangeInput
