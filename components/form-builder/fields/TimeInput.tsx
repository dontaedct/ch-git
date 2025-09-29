"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimeInputProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export function TimeInput({
  value = "",
  onChange,
  placeholder = "Select time",
  required = false,
  disabled = false,
  className
}: TimeInputProps) {
  return (
    <div className="relative">
      <Input
        type="time"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={cn("pr-10", className)}
      />
      <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
    </div>
  )
}

export default TimeInput
