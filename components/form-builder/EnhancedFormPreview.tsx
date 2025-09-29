"use client"

import React, { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarIcon, Clock, Eye, EyeOff, Play, Square } from "lucide-react"
import { cn } from "@/lib/utils"

// Import all the new field components
import { PasswordInput } from "./fields/PasswordInput"
import { UrlInput } from "./fields/UrlInput"
import { SearchInput } from "./fields/SearchInput"
import { HiddenInput } from "./fields/HiddenInput"
import { RangeInput } from "./fields/RangeInput"
import { RatingInput } from "./fields/RatingInput"
import { SignatureInput } from "./fields/SignatureInput"
import { TimeInput } from "./fields/TimeInput"
import { DateTimeInput } from "./fields/DateTimeInput"
import { ColorInput } from "./fields/ColorInput"
import { AddressInput } from "./fields/AddressInput"

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
  conditional?: {
    rules: Array<{
      fieldId: string
      operator: string
      value: string
      action: string
    }>
    logic: 'AND' | 'OR'
  }
}

interface EnhancedFormPreviewProps {
  fields: FormField[]
  formTitle?: string
  formDescription?: string
  onSubmit?: (data: Record<string, any>) => void
  mode?: "preview" | "live"
  showSubmitButton?: boolean
  className?: string
}

export function EnhancedFormPreview({
  fields,
  formTitle = "Form Preview",
  formDescription,
  onSubmit,
  mode = "preview",
  showSubmitButton = true,
  className
}: EnhancedFormPreviewProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set(fields.map(f => f.id)))
  const [enabledFields, setEnabledFields] = useState<Set<string>>(new Set(fields.map(f => f.id)))
  const [requiredFields, setRequiredFields] = useState<Set<string>>(new Set(fields.filter(f => f.required).map(f => f.id)))

  const form = useForm({
    defaultValues: fields.reduce((acc, field) => {
      acc[field.id] = field.defaultValue || getDefaultValue(field.type)
      return acc
    }, {} as Record<string, any>)
  })

  // Evaluate conditional logic
  useEffect(() => {
    const evaluateConditionalLogic = () => {
      const newVisibleFields = new Set<string>()
      const newEnabledFields = new Set<string>()
      const newRequiredFields = new Set<string>()

      fields.forEach(field => {
        let shouldShow = true
        let shouldEnable = true
        let shouldRequire = field.required || false

        if (field.conditional?.rules.length) {
          const results = field.conditional.rules.map(rule => {
            const targetValue = formData[rule.fieldId]
            let conditionMet = false

            switch (rule.operator) {
              case 'equals':
                conditionMet = targetValue === rule.value
                break
              case 'notEquals':
                conditionMet = targetValue !== rule.value
                break
              case 'contains':
                conditionMet = String(targetValue).includes(rule.value)
                break
              case 'notContains':
                conditionMet = !String(targetValue).includes(rule.value)
                break
              case 'isEmpty':
                conditionMet = !targetValue || targetValue === ''
                break
              case 'isNotEmpty':
                conditionMet = targetValue && targetValue !== ''
                break
              case 'greaterThan':
                conditionMet = Number(targetValue) > Number(rule.value)
                break
              case 'lessThan':
                conditionMet = Number(targetValue) < Number(rule.value)
                break
            }

            return conditionMet
          })

          const logicResult = field.conditional.logic === 'AND' 
            ? results.every(r => r) 
            : results.some(r => r)

          if (logicResult) {
            field.conditional.rules.forEach(rule => {
              switch (rule.action) {
                case 'show':
                  shouldShow = true
                  break
                case 'hide':
                  shouldShow = false
                  break
                case 'enable':
                  shouldEnable = true
                  break
                case 'disable':
                  shouldEnable = false
                  break
                case 'require':
                  shouldRequire = true
                  break
                case 'optional':
                  shouldRequire = false
                  break
              }
            })
          }
        }

        if (shouldShow) newVisibleFields.add(field.id)
        if (shouldEnable) newEnabledFields.add(field.id)
        if (shouldRequire) newRequiredFields.add(field.id)
      })

      setVisibleFields(newVisibleFields)
      setEnabledFields(newEnabledFields)
      setRequiredFields(newRequiredFields)
    }

    evaluateConditionalLogic()
  }, [formData, fields])

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
    form.setValue(fieldId, value)
  }

  const handleSubmit = (data: Record<string, any>) => {
    onSubmit?.(data)
  }

  const renderField = (field: FormField) => {
    if (!visibleFields.has(field.id)) return null

    const isEnabled = enabledFields.has(field.id)
    const isRequired = requiredFields.has(field.id)

    const commonProps = {
      value: formData[field.id] || field.defaultValue || getDefaultValue(field.type),
      onChange: (value: any) => handleFieldChange(field.id, value),
      placeholder: field.placeholder,
      required: isRequired,
      disabled: !isEnabled || mode === "preview"
    }

    switch (field.type) {
      case 'text':
        return <Input {...commonProps} type="text" />
      
      case 'email':
        return <Input {...commonProps} type="email" />
      
      case 'password':
        return <PasswordInput {...commonProps} />
      
      case 'number':
        return <Input {...commonProps} type="number" />
      
      case 'tel':
        return <Input {...commonProps} type="tel" />
      
      case 'url':
        return <UrlInput {...commonProps} />
      
      case 'search':
        return <SearchInput {...commonProps} />
      
      case 'hidden':
        return <HiddenInput {...commonProps} name={field.name} />
      
      case 'textarea':
        return <Textarea {...commonProps} rows={4} />
      
      case 'select':
        return (
          <Select
            value={commonProps.value}
            onValueChange={commonProps.onChange}
            disabled={commonProps.disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      
      case 'radio':
        return (
          <RadioGroup
            value={commonProps.value}
            onValueChange={commonProps.onChange}
            disabled={commonProps.disabled}
          >
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${index}`} />
                <label htmlFor={`${field.id}-${index}`}>{option}</label>
              </div>
            ))}
          </RadioGroup>
        )
      
      case 'checkbox':
        if (field.options) {
          return (
            <div className="space-y-2">
              {field.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}-${index}`}
                    checked={commonProps.value?.includes(option)}
                    onCheckedChange={(checked) => {
                      const currentValue = commonProps.value || []
                      if (checked) {
                        commonProps.onChange([...currentValue, option])
                      } else {
                        commonProps.onChange(currentValue.filter((v: string) => v !== option))
                      }
                    }}
                    disabled={commonProps.disabled}
                  />
                  <label htmlFor={`${field.id}-${index}`}>{option}</label>
                </div>
              ))}
            </div>
          )
        } else {
          return (
            <div className="flex items-center space-x-2">
              <Checkbox
                id={field.id}
                checked={commonProps.value}
                onCheckedChange={commonProps.onChange}
                disabled={commonProps.disabled}
              />
              <label htmlFor={field.id}>{field.label}</label>
            </div>
          )
        }
      
      case 'range':
        return (
          <RangeInput
            {...commonProps}
            min={field.validation?.min || 0}
            max={field.validation?.max || 100}
            showValue={true}
          />
        )
      
      case 'rating':
        return (
          <RatingInput
            {...commonProps}
            maxRating={field.validation?.max || 5}
            showLabels={true}
          />
        )
      
      case 'file':
        return (
          <Input
            type="file"
            onChange={(e) => commonProps.onChange(e.target.files)}
            disabled={commonProps.disabled}
            accept={field.options?.[0] || "*/*"}
          />
        )
      
      case 'signature':
        return <SignatureInput {...commonProps} />
      
      case 'date':
        return (
          <div className="relative">
            <Input
              {...commonProps}
              type="date"
            />
            <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        )
      
      case 'time':
        return <TimeInput {...commonProps} />
      
      case 'datetime':
        return <DateTimeInput {...commonProps} />
      
      case 'color':
        return <ColorInput {...commonProps} />
      
      case 'address':
        return <AddressInput {...commonProps} />
      
      default:
        return (
          <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground">
            Unsupported field type: {field.type}
          </div>
        )
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">{formTitle}</CardTitle>
              {formDescription && (
                <p className="text-muted-foreground mt-1">{formDescription}</p>
              )}
            </div>
            {mode === "preview" && (
              <Badge variant="secondary">Preview Mode</Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {fields.map((field) => (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={field.id}
                  render={({ field: formField, fieldState }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        {field.label}
                        {requiredFields.has(field.id) && <span className="text-destructive">*</span>}
                      </FormLabel>
                      <FormControl>
                        {renderField(field)}
                      </FormControl>
                      {field.description && (
                        <FormDescription>{field.description}</FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              {showSubmitButton && (
                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    disabled={mode === "preview"}
                    className={cn(mode === "preview" && "opacity-50")}
                  >
                    {mode === "preview" ? (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Test Submit (Preview)
                      </>
                    ) : (
                      "Submit Form"
                    )}
                  </Button>
                  {mode === "preview" && (
                    <Button type="button" variant="outline" disabled>
                      <Square className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  )}
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

function getDefaultValue(fieldType: string): any {
  switch (fieldType) {
    case 'checkbox':
      return []
    case 'switch':
      return false
    case 'number':
    case 'rating':
    case 'range':
      return 0
    case 'color':
      return '#000000'
    case 'address':
      return {}
    default:
      return ''
  }
}

export default EnhancedFormPreview
