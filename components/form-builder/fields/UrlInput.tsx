"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface UrlInputProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export function UrlInput({
  value = "",
  onChange,
  placeholder = "https://example.com",
  required = false,
  disabled = false,
  className
}: UrlInputProps) {
  const isValidUrl = (url: string) => {
    if (!url) return true
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const isInvalid = value && !isValidUrl(value)

  return (
    <div className="space-y-1">
      <Input
        type="url"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={cn(
          isInvalid && "border-red-500 focus:border-red-500 focus:ring-red-500",
          className
        )}
      />
      {isInvalid && (
        <p className="text-xs text-red-600">
          Please enter a valid URL (e.g., https://example.com)
        </p>
      )}
    </div>
  )
}

export default UrlInput
