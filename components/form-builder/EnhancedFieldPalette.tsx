"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FieldType {
  type: string
  name: string
  description: string
  category: string
  icon: string
  popular?: boolean
}

interface EnhancedFieldPaletteProps {
  onSelectField: (type: string) => void
  onClose: () => void
  className?: string
}

const FIELD_TYPES: FieldType[] = [
  // Basic Fields
  { type: 'text', name: 'Text Input', description: 'Single-line text input', category: 'Basic', icon: '📝', popular: true },
  { type: 'email', name: 'Email', description: 'Email address with validation', category: 'Basic', icon: '📧', popular: true },
  { type: 'password', name: 'Password', description: 'Password with strength indicator', category: 'Basic', icon: '🔒', popular: true },
  { type: 'number', name: 'Number', description: 'Numeric input with validation', category: 'Basic', icon: '🔢', popular: true },
  { type: 'tel', name: 'Phone', description: 'Phone number with formatting', category: 'Basic', icon: '📞', popular: true },
  { type: 'url', name: 'URL', description: 'Website URL with validation', category: 'Basic', icon: '🔗' },
  { type: 'search', name: 'Search', description: 'Search input with icon', category: 'Basic', icon: '🔍' },
  { type: 'hidden', name: 'Hidden', description: 'Hidden field for data', category: 'Basic', icon: '👁️‍🗨️' },
  
  // Content Fields
  { type: 'textarea', name: 'Textarea', description: 'Multi-line text input', category: 'Content', icon: '📄', popular: true },
  { type: 'file', name: 'File Upload', description: 'File upload with restrictions', category: 'Content', icon: '📎', popular: true },
  { type: 'signature', name: 'Signature', description: 'Digital signature capture', category: 'Content', icon: '✍️' },
  
  // Selection Fields
  { type: 'select', name: 'Select', description: 'Dropdown selection', category: 'Selection', icon: '📋', popular: true },
  { type: 'radio', name: 'Radio', description: 'Single choice selection', category: 'Selection', icon: '🔘', popular: true },
  { type: 'checkbox', name: 'Checkbox', description: 'Multiple choice selection', category: 'Selection', icon: '☑️', popular: true },
  
  // Advanced Fields
  { type: 'range', name: 'Range', description: 'Slider input with min/max', category: 'Advanced', icon: '🎚️' },
  { type: 'rating', name: 'Rating', description: 'Star rating input', category: 'Advanced', icon: '⭐' },
  { type: 'color', name: 'Color', description: 'Color picker input', category: 'Advanced', icon: '🎨' },
  { type: 'address', name: 'Address', description: 'Complete address form', category: 'Advanced', icon: '📍' },
  
  // Date/Time Fields
  { type: 'date', name: 'Date', description: 'Date picker input', category: 'Date/Time', icon: '📅', popular: true },
  { type: 'time', name: 'Time', description: 'Time picker input', category: 'Date/Time', icon: '🕐' },
  { type: 'datetime', name: 'Date & Time', description: 'Date and time picker', category: 'Date/Time', icon: '📅🕐' }
]

export function EnhancedFieldPalette({
  onSelectField,
  onClose,
  className
}: EnhancedFieldPaletteProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")

  const categories = [
    { value: "all", label: "All Fields" },
    { value: "Basic", label: "Basic" },
    { value: "Content", label: "Content" },
    { value: "Selection", label: "Selection" },
    { value: "Advanced", label: "Advanced" },
    { value: "Date/Time", label: "Date/Time" }
  ]

  const filteredFields = FIELD_TYPES.filter(field => {
    const matchesSearch = field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         field.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory === "all" || field.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const popularFields = FIELD_TYPES.filter(field => field.popular)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Add Field</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search fields..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="grid w-full grid-cols-6">
              {categories.map((category) => (
                <TabsTrigger key={category.value} value={category.value}>
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value={activeCategory} className="mt-4">
              {activeCategory === "all" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Popular Fields</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {popularFields.map((field) => (
                        <div
                          key={field.type}
                          onClick={() => onSelectField(field.type)}
                          className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="text-2xl">{field.icon}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-gray-900 group-hover:text-blue-700">
                                  {field.name}
                                </h4>
                                <Badge variant="secondary" className="text-xs">
                                  Popular
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {field.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">All Fields</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredFields.map((field) => (
                        <div
                          key={field.type}
                          onClick={() => onSelectField(field.type)}
                          className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="text-2xl">{field.icon}</div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 group-hover:text-blue-700">
                                {field.name}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {field.description}
                              </p>
                              <Badge variant="outline" className="text-xs mt-2">
                                {field.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {activeCategory !== "all" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredFields.map((field) => (
                    <div
                      key={field.type}
                      onClick={() => onSelectField(field.type)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{field.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900 group-hover:text-blue-700">
                              {field.name}
                            </h4>
                            {field.popular && (
                              <Badge variant="secondary" className="text-xs">
                                Popular
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {field.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {filteredFields.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2" />
                  <p>No fields found matching your search</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default EnhancedFieldPalette
