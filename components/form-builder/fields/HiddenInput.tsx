"use client"

import React from "react"
import { Input } from "@/components/ui/input"

interface HiddenInputProps {
  value?: string
  onChange?: (value: string) => void
  name?: string
}

export function HiddenInput({
  value = "",
  onChange,
  name
}: HiddenInputProps) {
  return (
    <Input
      type="hidden"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      name={name}
    />
  )
}

export default HiddenInput
