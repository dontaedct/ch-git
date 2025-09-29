"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

interface AddressInputProps {
  value?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  onChange?: (value: any) => void
  required?: boolean
  disabled?: boolean
  showCountry?: boolean
  className?: string
}

export function AddressInput({
  value = {},
  onChange,
  required = false,
  disabled = false,
  showCountry = true,
  className
}: AddressInputProps) {
  const [address, setAddress] = useState({
    street: value.street || "",
    city: value.city || "",
    state: value.state || "",
    zipCode: value.zipCode || "",
    country: value.country || "US"
  })

  const handleChange = (field: string, newValue: string) => {
    const updatedAddress = { ...address, [field]: newValue }
    setAddress(updatedAddress)
    onChange?.(updatedAddress)
  }

  const countries = [
    { code: "US", name: "United States" },
    { code: "CA", name: "Canada" },
    { code: "GB", name: "United Kingdom" },
    { code: "AU", name: "Australia" },
    { code: "DE", name: "Germany" },
    { code: "FR", name: "France" },
    { code: "IT", name: "Italy" },
    { code: "ES", name: "Spain" },
    { code: "JP", name: "Japan" },
    { code: "CN", name: "China" }
  ]

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" />
        <span>Address Information</span>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Street Address *
          </label>
          <Textarea
            value={address.street}
            onChange={(e) => handleChange("street", e.target.value)}
            placeholder="123 Main Street, Apt 4B"
            required={required}
            disabled={disabled}
            rows={2}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <Input
              value={address.city}
              onChange={(e) => handleChange("city", e.target.value)}
              placeholder="New York"
              required={required}
              disabled={disabled}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State/Province *
            </label>
            <Input
              value={address.state}
              onChange={(e) => handleChange("state", e.target.value)}
              placeholder="NY"
              required={required}
              disabled={disabled}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ZIP/Postal Code *
            </label>
            <Input
              value={address.zipCode}
              onChange={(e) => handleChange("zipCode", e.target.value)}
              placeholder="10001"
              required={required}
              disabled={disabled}
            />
          </div>
          
          {showCountry && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <select
                value={address.country}
                onChange={(e) => handleChange("country", e.target.value)}
                required={required}
                disabled={disabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AddressInput
