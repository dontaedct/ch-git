"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Trash2, Copy, Settings, Eye } from "lucide-react"
import { ConditionalLogicEditor, ConditionalLogic } from "./ConditionalLogicEditor"
import { cn } from "@/lib/utils"

export interface FormField {
  id: string
  name: string
  type: string
  label: string
  placeholder?: string
  description?: string
  required?: boolean
  defaultValue?: any
  options?: string[]
  validation?: {
    min?: number
    max?: number
    minLength?: number
    maxLength?: number
    pattern?: string
    patternMessage?: string
  }
  conditional?: ConditionalLogic
  styling?: {
    width?: 'full' | 'half' | 'third' | 'quarter'
    className?: string
  }
}

interface EnhancedFieldEditorProps {
  field: FormField
  onUpdate: (updates: Partial<FormField>) => void
  onDelete: () => void
  onDuplicate: () => void
  availableFields: Array<{
    id: string
    label: string
    type: string
  }>
  className?: string
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text Input', category: 'Basic' },
  { value: 'email', label: 'Email', category: 'Basic' },
  { value: 'password', label: 'Password', category: 'Basic' },
  { value: 'number', label: 'Number', category: 'Basic' },
  { value: 'tel', label: 'Phone', category: 'Basic' },
  { value: 'url', label: 'URL', category: 'Basic' },
  { value: 'search', label: 'Search', category: 'Basic' },
  { value: 'hidden', label: 'Hidden', category: 'Basic' },
  { value: 'textarea', label: 'Textarea', category: 'Content' },
  { value: 'select', label: 'Select', category: 'Selection' },
  { value: 'radio', label: 'Radio', category: 'Selection' },
  { value: 'checkbox', label: 'Checkbox', category: 'Selection' },
  { value: 'range', label: 'Range', category: 'Advanced' },
  { value: 'rating', label: 'Rating', category: 'Advanced' },
  { value: 'file', label: 'File Upload', category: 'Advanced' },
  { value: 'signature', label: 'Signature', category: 'Advanced' },
  { value: 'date', label: 'Date', category: 'Date/Time' },
  { value: 'time', label: 'Time', category: 'Date/Time' },
  { value: 'datetime', label: 'Date & Time', category: 'Date/Time' },
  { value: 'color', label: 'Color', category: 'Advanced' },
  { value: 'address', label: 'Address', category: 'Advanced' }
]

export function EnhancedFieldEditor({
  field,
  onUpdate,
  onDelete,
  onDuplicate,
  availableFields,
  className
}: EnhancedFieldEditorProps) {
  const [activeTab, setActiveTab] = useState("basic")

  const handleUpdate = (updates: Partial<FormField>) => {
    onUpdate(updates)
  }

  const addOption = () => {
    const newOptions = [...(field.options || []), '']
    handleUpdate({ options: newOptions })
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(field.options || [])]
    newOptions[index] = value
    handleUpdate({ options: newOptions })
  }

  const removeOption = (index: number) => {
    const newOptions = field.options?.filter((_, i) => i !== index) || []
    handleUpdate({ options: newOptions })
  }

  const getFieldTypeInfo = (type: string) => {
    return FIELD_TYPES.find(ft => ft.value === type) || { value: type, label: type, category: 'Other' }
  }

  const needsOptions = ['select', 'radio', 'checkbox'].includes(field.type)
  const needsValidation = ['text', 'email', 'number', 'tel', 'url', 'textarea'].includes(field.type)

  return (
    <div className={cn("space-y-4", className)}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-lg font-medium">
                {getFieldTypeInfo(field.type).label} Properties
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {getFieldTypeInfo(field.type).category}
              </Badge>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onDuplicate}
                title="Duplicate field"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-red-600 hover:text-red-700"
                title="Delete field"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="validation">Validation</TabsTrigger>
              <TabsTrigger value="options">Options</TabsTrigger>
              <TabsTrigger value="conditional">Logic</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="field-type">Field Type</Label>
                  <Select
                    value={field.type}
                    onValueChange={(value) => handleUpdate({ type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(
                        FIELD_TYPES.reduce((acc, type) => {
                          if (!acc[type.category]) acc[type.category] = []
                          acc[type.category].push(type)
                          return acc
                        }, {} as Record<string, typeof FIELD_TYPES>)
                      ).map(([category, types]) => (
                        <div key={category}>
                          <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                            {category}
                          </div>
                          {types.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="field-name">Field Name</Label>
                  <Input
                    id="field-name"
                    value={field.name}
                    onChange={(e) => handleUpdate({ name: e.target.value })}
                    placeholder="field_name"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="field-label">Field Label</Label>
                <Input
                  id="field-label"
                  value={field.label}
                  onChange={(e) => handleUpdate({ label: e.target.value })}
                  placeholder="Enter field label"
                />
              </div>
              
              <div>
                <Label htmlFor="field-placeholder">Placeholder</Label>
                <Input
                  id="field-placeholder"
                  value={field.placeholder || ''}
                  onChange={(e) => handleUpdate({ placeholder: e.target.value })}
                  placeholder="Enter placeholder text"
                />
              </div>
              
              <div>
                <Label htmlFor="field-description">Description</Label>
                <Textarea
                  id="field-description"
                  value={field.description || ''}
                  onChange={(e) => handleUpdate({ description: e.target.value })}
                  placeholder="Enter field description"
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="field-default">Default Value</Label>
                <Input
                  id="field-default"
                  value={field.defaultValue || ''}
                  onChange={(e) => handleUpdate({ defaultValue: e.target.value })}
                  placeholder="Enter default value"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="field-required"
                    checked={field.required || false}
                    onCheckedChange={(checked) => handleUpdate({ required: checked })}
                  />
                  <Label htmlFor="field-required">Required field</Label>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="validation" className="space-y-4 mt-4">
              {needsValidation ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="min-length">Min Length</Label>
                      <Input
                        id="min-length"
                        type="number"
                        value={field.validation?.minLength || ''}
                        onChange={(e) => handleUpdate({
                          validation: {
                            ...field.validation,
                            minLength: e.target.value ? Number(e.target.value) : undefined
                          }
                        })}
                        placeholder="0"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="max-length">Max Length</Label>
                      <Input
                        id="max-length"
                        type="number"
                        value={field.validation?.maxLength || ''}
                        onChange={(e) => handleUpdate({
                          validation: {
                            ...field.validation,
                            maxLength: e.target.value ? Number(e.target.value) : undefined
                          }
                        })}
                        placeholder="1000"
                      />
                    </div>
                  </div>
                  
                  {['number', 'range', 'rating'].includes(field.type) && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="min-value">Min Value</Label>
                        <Input
                          id="min-value"
                          type="number"
                          value={field.validation?.min || ''}
                          onChange={(e) => handleUpdate({
                            validation: {
                              ...field.validation,
                              min: e.target.value ? Number(e.target.value) : undefined
                            }
                          })}
                          placeholder="0"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="max-value">Max Value</Label>
                        <Input
                          id="max-value"
                          type="number"
                          value={field.validation?.max || ''}
                          onChange={(e) => handleUpdate({
                            validation: {
                              ...field.validation,
                              max: e.target.value ? Number(e.target.value) : undefined
                            }
                          })}
                          placeholder="100"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="pattern">Pattern (Regex)</Label>
                    <Input
                      id="pattern"
                      value={field.validation?.pattern || ''}
                      onChange={(e) => handleUpdate({
                        validation: {
                          ...field.validation,
                          pattern: e.target.value
                        }
                      })}
                      placeholder="^[a-zA-Z0-9]+$"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="pattern-message">Pattern Error Message</Label>
                    <Input
                      id="pattern-message"
                      value={field.validation?.patternMessage || ''}
                      onChange={(e) => handleUpdate({
                        validation: {
                          ...field.validation,
                          patternMessage: e.target.value
                        }
                      })}
                      placeholder="Please enter a valid format"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-8 w-8 mx-auto mb-2" />
                  <p>Validation options not available for this field type</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="options" className="space-y-4 mt-4">
              {needsOptions ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Options</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addOption}
                    >
                      Add Option
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {field.options?.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Eye className="h-8 w-8 mx-auto mb-2" />
                  <p>Options not available for this field type</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="conditional" className="space-y-4 mt-4">
              <ConditionalLogicEditor
                conditionalLogic={field.conditional}
                onChange={(logic) => handleUpdate({ conditional: logic })}
                availableFields={availableFields.filter(f => f.id !== field.id)}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default EnhancedFieldEditor
