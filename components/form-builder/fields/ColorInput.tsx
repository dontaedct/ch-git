"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Palette } from "lucide-react"
import { cn } from "@/lib/utils"

interface ColorInputProps {
  value?: string
  onChange?: (value: string) => void
  required?: boolean
  disabled?: boolean
  showPreview?: boolean
  className?: string
}

export function ColorInput({
  value = "#000000",
  onChange,
  required = false,
  disabled = false,
  showPreview = true,
  className
}: ColorInputProps) {
  const presetColors = [
    "#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF",
    "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500", "#800080",
    "#FFC0CB", "#A52A2A", "#808080", "#000080", "#008000"
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Input
          type="color"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          required={required}
          disabled={disabled}
          className={cn("w-16 h-10 p-1 border rounded cursor-pointer", className)}
        />
        
        {showPreview && (
          <div className="flex items-center space-x-2">
            <div
              className="w-8 h-8 border border-gray-300 rounded"
              style={{ backgroundColor: value }}
            />
            <span className="text-sm font-mono text-muted-foreground">
              {value.toUpperCase()}
            </span>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Quick colors:</div>
        <div className="grid grid-cols-8 gap-1">
          {presetColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange?.(color)}
              disabled={disabled}
              className={cn(
                "w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform",
                value === color && "ring-2 ring-blue-500",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ColorInput
