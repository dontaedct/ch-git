"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { CalendarIcon, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface DateTimeInputProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export function DateTimeInput({
  value = "",
  onChange,
  placeholder = "Select date and time",
  required = false,
  disabled = false,
  className
}: DateTimeInputProps) {
  return (
    <div className="relative">
      <Input
        type="datetime-local"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={cn("pr-10", className)}
      />
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        <Clock className="h-3 w-3 text-muted-foreground" />
      </div>
    </div>
  )
}

export default DateTimeInput
