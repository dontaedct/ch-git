"use client"

import React, { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormTemplate } from "./form-builder-engine"
import { createFormValidationSchema } from "@/lib/form-builder/validation"
import { createUXOptimizer, UXOptimizer } from "@/lib/form-builder/ux-optimization"
import { createUXMetricsTracker, UXMetricsTracker } from "@/lib/form-builder/ux-metrics-tracker"
import { createAccessibilityManager, AccessibilityManager } from "@/lib/form-builder/accessibility"
import { createPerformanceOptimizer, PerformanceOptimizer } from "@/lib/form-builder/performance-optimization"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { CalendarIcon, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormPreviewProps {
  template: FormTemplate
  onSubmit?: (data: Record<string, any>) => void
  showSubmitButton?: boolean
  mode?: "preview" | "live"
  enableUXTracking?: boolean
  enableUXOptimizations?: boolean
  userId?: string
}

export function FormPreview({
  template,
  onSubmit,
  showSubmitButton = true,
  mode = "preview",
  enableUXTracking = true,
  enableUXOptimizations = true,
  userId
}: FormPreviewProps) {
  const uxOptimizer = useRef<UXOptimizer | null>(null)
  const metricsTracker = useRef<UXMetricsTracker | null>(null)
  const accessibilityManager = useRef<AccessibilityManager | null>(null)
  const performanceOptimizer = useRef<PerformanceOptimizer | null>(null)
  const [formProgress, setFormProgress] = useState(0)
  const [uxRecommendations, setUXRecommendations] = useState<any[]>([])
  const [optimizedFields, setOptimizedFields] = useState<any[]>([])
  const [renderStrategy, setRenderStrategy] = useState<"batch" | "lazy" | "virtual">("batch")

  useEffect(() => {
    // Initialize performance optimizer
    performanceOptimizer.current = createPerformanceOptimizer({
      enableLazyLoading: true,
      enableMemoization: true,
      enableVirtualization: template.fields.length > 20,
      enableDebouncing: true
    })

    performanceOptimizer.current.startPerformanceMeasure('form-template-render')

    if (enableUXOptimizations) {
      uxOptimizer.current = createUXOptimizer()
    }

    if (enableUXTracking && mode === "live") {
      metricsTracker.current = createUXMetricsTracker(template.id, userId)
      metricsTracker.current.initializeForm(
        template.fields.map(field => ({
          id: field.id,
          type: field.type,
          required: field.required,
          label: field.label
        }))
      )
    }

    accessibilityManager.current = createAccessibilityManager()

    // Optimize template rendering
    if (performanceOptimizer.current) {
      const optimizationResult = performanceOptimizer.current.optimizeTemplateRendering(template)
      setOptimizedFields(optimizationResult.optimizedFields)
      setRenderStrategy(optimizationResult.renderStrategy)

      console.log(`Template render optimized: ${optimizationResult.renderStrategy} strategy, estimated time: ${optimizationResult.estimatedRenderTime}ms`)
    }

    return () => {
      performanceOptimizer.current?.endPerformanceMeasure('form-template-render')
      performanceOptimizer.current?.cleanup()
      metricsTracker.current?.destroy()
    }
  }, [template.id, enableUXTracking, enableUXOptimizations, mode, userId, template])
  const validationSchema = createFormValidationSchema({
    fields: template.fields.map(field => ({
      id: field.id,
      type: field.type,
      required: field.required,
      validation: field.validation
    }))
  })

  const form = useForm({
    resolver: zodResolver(validationSchema as any),
    defaultValues: template.fields.reduce((acc, field) => {
      acc[field.id] = getDefaultValue(field.type)
      return acc
    }, {} as Record<string, any>)
  })

  const handleSubmit = (data: Record<string, any>) => {
    if (metricsTracker.current) {
      metricsTracker.current.trackFormCompletion(true)
      const recommendations = metricsTracker.current.generateUXRecommendations()
      setUXRecommendations(recommendations)
    }
    onSubmit?.(data)
  }

  const handleFieldFocus = (fieldId: string) => {
    metricsTracker.current?.trackFieldFocus(fieldId)
  }

  const handleFieldBlur = (fieldId: string) => {
    metricsTracker.current?.trackFieldBlur(fieldId)
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    metricsTracker.current?.trackFieldInput(fieldId, value)

    if (uxOptimizer.current) {
      const progress = uxOptimizer.current.calculateFormProgress(template.fields, form.getValues())
      setFormProgress(progress)
    }
  }

  const handleValidationError = (fieldId: string, error: any) => {
    if (metricsTracker.current && error) {
      metricsTracker.current.trackValidationError(fieldId, "validation", error.message || "Validation error")
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{template.name}</h2>
          {mode === "preview" && (
            <Badge variant="secondary">Preview Mode</Badge>
          )}
        </div>
        {template.description && (
          <p className="text-muted-foreground">{template.description}</p>
        )}
        {enableUXOptimizations && mode === "live" && formProgress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{formProgress}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${formProgress}%` }}
              />
            </div>
          </div>
        )}
        <Separator />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {template.fields.map((field) => (
            <FormField
              key={field.id}
              control={form.control}
              name={field.id}
              render={({ field: formField, fieldState }) => {
                const enhancedLabel = uxOptimizer.current?.generateSmartLabels(field)
                const autoCompleteAttrs = uxOptimizer.current?.generateAutoCompleteAttributes(field)
                const accessibilityAttrs = accessibilityManager.current?.generateFieldAttributes(field, !!fieldState.error)

                return (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      {enhancedLabel?.label || field.label}
                      {field.required && <span className="text-destructive">*</span>}
                    </FormLabel>
                    <FormControl>
                      <FieldRenderer
                        field={field}
                        formField={{
                          ...formField,
                          onFocus: () => {
                            handleFieldFocus(field.id)
                          },
                          onBlur: () => {
                            formField.onBlur()
                            handleFieldBlur(field.id)
                          },
                          onChange: (value: any) => {
                            formField.onChange(value)
                            handleFieldChange(field.id, value)
                          }
                        }}
                        disabled={mode === "preview"}
                        autoCompleteAttrs={autoCompleteAttrs || {}}
                        accessibilityAttrs={accessibilityAttrs || {}}
                      />
                    </FormControl>
                    {enhancedLabel?.helpText && (
                      <FormDescription>{enhancedLabel.helpText}</FormDescription>
                    )}
                    <FormMessage onError={(error) => handleValidationError(field.id, error)} />
                  </FormItem>
                )
              }}
            />
          ))}

          {showSubmitButton && (
            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={mode === "preview"}
                className={cn(mode === "preview" && "opacity-50")}
              >
                Submit Form
              </Button>
              {mode === "preview" && (
                <Button type="button" variant="outline" disabled>
                  Reset
                </Button>
              )}
            </div>
          )}
        </form>
      </Form>
    </div>
  )
}

interface FieldRendererProps {
  field: FormTemplate["fields"][0]
  formField: any
  disabled?: boolean
  autoCompleteAttrs?: Record<string, string>
  accessibilityAttrs?: Record<string, any>
}

function FieldRenderer({
  field,
  formField,
  disabled = false,
  autoCompleteAttrs = {},
  accessibilityAttrs = {}
}: FieldRendererProps) {
  switch (field.type) {
    case "text":
      return (
        <Input
          {...formField}
          {...autoCompleteAttrs}
          {...accessibilityAttrs}
          type="text"
          placeholder={field.placeholder}
          disabled={disabled}
        />
      )

    case "email":
      return (
        <Input
          {...formField}
          {...autoCompleteAttrs}
          {...accessibilityAttrs}
          type="email"
          placeholder={field.placeholder}
          disabled={disabled}
        />
      )

    case "number":
      return (
        <Input
          {...formField}
          type="number"
          placeholder={field.placeholder}
          disabled={disabled}
          onChange={(e) => formField.onChange(Number(e.target.value))}
        />
      )

    case "textarea":
      return (
        <Textarea
          {...formField}
          placeholder={field.placeholder}
          disabled={disabled}
          rows={4}
        />
      )

    case "select":
      return (
        <Select
          onValueChange={formField.onChange}
          defaultValue={formField.value}
          disabled={disabled}
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

    case "radio":
      return (
        <RadioGroup
          onValueChange={formField.onChange}
          defaultValue={formField.value}
          disabled={disabled}
        >
          {field.options?.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`${field.id}-${index}`} />
              <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
            </div>
          ))}
        </RadioGroup>
      )

    case "checkbox":
      if (field.options) {
        return (
          <div className="space-y-2">
            {field.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.id}-${index}`}
                  checked={formField.value?.includes(option)}
                  onCheckedChange={(checked) => {
                    const currentValue = formField.value || []
                    if (checked) {
                      formField.onChange([...currentValue, option])
                    } else {
                      formField.onChange(currentValue.filter((v: string) => v !== option))
                    }
                  }}
                  disabled={disabled}
                />
                <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </div>
        )
      } else {
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={formField.value}
              onCheckedChange={formField.onChange}
              disabled={disabled}
            />
            <Label htmlFor={field.id}>{field.label}</Label>
          </div>
        )
      }

    case "switch":
      return (
        <div className="flex items-center space-x-2">
          <Switch
            checked={formField.value}
            onCheckedChange={formField.onChange}
            disabled={disabled}
          />
          <Label>{field.label}</Label>
        </div>
      )

    case "date":
      return (
        <div className="relative">
          <Input
            {...formField}
            type="date"
            placeholder={field.placeholder}
            disabled={disabled}
          />
          <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      )

    case "time":
      return (
        <div className="relative">
          <Input
            {...formField}
            type="time"
            placeholder={field.placeholder}
            disabled={disabled}
          />
          <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      )

    case "phone":
      return (
        <Input
          {...formField}
          type="tel"
          placeholder={field.placeholder}
          disabled={disabled}
        />
      )

    case "url":
      return (
        <Input
          {...formField}
          type="url"
          placeholder={field.placeholder}
          disabled={disabled}
        />
      )

    case "file":
      return (
        <Input
          type="file"
          onChange={(e) => formField.onChange(e.target.files)}
          disabled={disabled}
          accept={field.options?.[0] || "*/*"}
        />
      )

    case "heading":
      const HeadingTag = `h${field.options?.[0] || 2}` as keyof JSX.IntrinsicElements
      return (
        <HeadingTag className="text-lg font-semibold">
          {field.label}
        </HeadingTag>
      )

    case "paragraph":
      return (
        <p className="text-muted-foreground">
          {field.placeholder || field.label}
        </p>
      )

    case "divider":
      return <Separator />

    case "rating":
      const maxRating = Number(field.options?.[0]) || 5
      return (
        <div className="flex gap-1">
          {Array.from({ length: maxRating }, (_, i) => (
            <Button
              key={i}
              type="button"
              variant={formField.value > i ? "default" : "outline"}
              size="sm"
              onClick={() => !disabled && formField.onChange(i + 1)}
              disabled={disabled}
            >
              ⭐
            </Button>
          ))}
        </div>
      )

    case "slider":
      const min = Number(field.options?.[0]) || 0
      const max = Number(field.options?.[1]) || 100
      return (
        <div className="space-y-2">
          <input
            type="range"
            min={min}
            max={max}
            value={formField.value || min}
            onChange={(e) => formField.onChange(Number(e.target.value))}
            disabled={disabled}
            className="w-full"
          />
          <div className="text-sm text-muted-foreground text-center">
            Value: {formField.value || min}
          </div>
        </div>
      )

    default:
      return (
        <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground">
          Unsupported field type: {field.type}
        </div>
      )
  }
}

function getDefaultValue(fieldType: string): any {
  switch (fieldType) {
    case "checkbox":
      return []
    case "switch":
      return false
    case "number":
    case "rating":
    case "slider":
      return 0
    default:
      return ""
  }
}