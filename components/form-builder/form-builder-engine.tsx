"use client"

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createPerformanceOptimizer, PerformanceOptimizer } from "@/lib/form-builder/performance-optimization"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Eye, Code } from "lucide-react"

export interface FormField {
  id: string
  type: "text" | "email" | "number" | "textarea" | "select" | "checkbox" | "radio" | "switch" | "date" | "time" | "phone" | "url" | "file" | "heading" | "paragraph" | "divider" | "rating" | "slider" | "password" | "boolean" | "address"
  label: string
  placeholder?: string
  required: boolean
  validation?: ValidationRule[]
  options?: string[]
}

export interface ValidationRule {
  type: "required" | "minLength" | "maxLength" | "pattern" | "email" | "number"
  value?: string | number
  message?: string
}

export interface FormTemplate {
  id: string
  name: string
  description: string
  fields: FormField[]
  createdAt: Date
  updatedAt: Date
}

const fieldSchema = z.object({
  id: z.string(),
  type: z.enum(["text", "email", "number", "textarea", "select", "checkbox", "radio", "switch", "date", "time", "phone", "url", "file", "heading", "paragraph", "divider", "rating", "slider", "password", "boolean", "address"]),
  label: z.string().min(1, "Label is required"),
  placeholder: z.string().optional(),
  required: z.boolean(),
  validation: z.array(z.object({
    type: z.enum(["required", "minLength", "maxLength", "pattern", "email", "number"]),
    value: z.union([z.string(), z.number()]).optional(),
    message: z.string().optional()
  })).optional(),
  options: z.array(z.string()).optional()
})

const formTemplateSchema = z.object({
  name: z.string().min(1, "Form name is required"),
  description: z.string().optional(),
  fields: z.array(fieldSchema)
})

type FormTemplateData = z.infer<typeof formTemplateSchema>

interface FormBuilderEngineProps {
  onSave?: (template: FormTemplate) => void
  onPreview?: (template: FormTemplate) => void
  initialTemplate?: FormTemplate
}

export function FormBuilderEngine({ onSave, onPreview, initialTemplate }: FormBuilderEngineProps) {
  const [viewMode, setViewMode] = useState<"builder" | "preview" | "code">("builder")
  const performanceOptimizer = useRef<PerformanceOptimizer | null>(null)

  useEffect(() => {
    performanceOptimizer.current = createPerformanceOptimizer({
      enableMemoization: true,
      enableDebouncing: true,
      enableLazyLoading: true
    })

    performanceOptimizer.current.startPerformanceMeasure('form-builder-mount')

    return () => {
      performanceOptimizer.current?.endPerformanceMeasure('form-builder-mount')
      performanceOptimizer.current?.cleanup()
    }
  }, [])

  const form = useForm<FormTemplateData>({
    resolver: zodResolver(formTemplateSchema),
    defaultValues: {
      name: initialTemplate?.name || "",
      description: initialTemplate?.description || "",
      fields: initialTemplate?.fields || []
    }
  })

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "fields"
  })

  const generateFieldId = useCallback(() => {
    return `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }, [])

  const addField = useCallback((type: "text" | "email" | "number" | "textarea" | "select" | "checkbox" | "radio" | "switch" | "date" | "time" | "phone" | "url" | "file" | "heading" | "paragraph" | "divider" | "rating" | "slider" | "password" | "boolean" | "address") => {
    const newField: FormField = {
      id: generateFieldId(),
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      required: false,
      validation: []
    }
    append(newField)
  }, [append, generateFieldId])

  const updateField = useMemo(() => {
    if (performanceOptimizer.current?.getConfig().enableDebouncing) {
      return performanceOptimizer.current.createDebouncedHandler(
        (index: number, updates: Partial<FormField>) => {
          const currentField = fields[index]
          update(index, { ...currentField, ...updates })
        },
        'field-update'
      )
    }
    return (index: number, updates: Partial<FormField>) => {
      const currentField = fields[index]
      update(index, { ...currentField, ...updates })
    }
  }, [fields, update])

  const handleSave = useCallback(() => {
    performanceOptimizer.current?.startPerformanceMeasure('form-submission')

    const data = form.getValues()
    const template: FormTemplate = {
      id: initialTemplate?.id || `template_${Date.now()}`,
      name: data.name,
      description: data.description || "",
      fields: data.fields,
      createdAt: initialTemplate?.createdAt || new Date(),
      updatedAt: new Date()
    }

    // Optimize submission if large form
    if (performanceOptimizer.current && data.fields.length > 20) {
      const optimizationResult = performanceOptimizer.current.optimizeFormSubmission(data)
      console.log(`Form submission optimized: ${optimizationResult.submissionStrategy} strategy, estimated time: ${optimizationResult.estimatedTime}ms`)
    }

    onSave?.(template)
    performanceOptimizer.current?.endPerformanceMeasure('form-submission')
  }, [form, onSave, initialTemplate])

  const handlePreview = useCallback(() => {
    const data = form.getValues()
    const template: FormTemplate = {
      id: initialTemplate?.id || `preview_${Date.now()}`,
      name: data.name,
      description: data.description || "",
      fields: data.fields,
      createdAt: initialTemplate?.createdAt || new Date(),
      updatedAt: new Date()
    }
    onPreview?.(template)
  }, [form, onPreview, initialTemplate])

  const generateFormCode = useMemo(() => {
    if (performanceOptimizer.current?.getConfig().enableMemoization) {
      return performanceOptimizer.current.createMemoizedRenderer(
        (data: any) => JSON.stringify(data, null, 2),
        (data) => `form-code-${JSON.stringify(data).slice(0, 100)}`
      )
    }
    return (data: any) => JSON.stringify(data, null, 2)
  }, [])

  const memoizedGenerateFormCode = useCallback(() => {
    const data = form.getValues()
    return generateFormCode(data)
  }, [form, generateFormCode])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Form Builder Engine</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "builder" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("builder")}
            >
              Builder
            </Button>
            <Button
              variant={viewMode === "preview" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("preview")}
            >
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </Button>
            <Button
              variant={viewMode === "code" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("code")}
            >
              <Code className="w-4 h-4 mr-1" />
              Code
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "builder" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="formName">Form Name</Label>
                  <Input
                    id="formName"
                    {...form.register("name")}
                    placeholder="Enter form name"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="formDescription">Description</Label>
                  <Input
                    id="formDescription"
                    {...form.register("description")}
                    placeholder="Enter form description"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Form Fields</h3>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => addField("text")}>
                      <Plus className="w-4 h-4 mr-1" />
                      Text
                    </Button>
                    <Button size="sm" onClick={() => addField("email")}>
                      <Plus className="w-4 h-4 mr-1" />
                      Email
                    </Button>
                    <Button size="sm" onClick={() => addField("textarea")}>
                      <Plus className="w-4 h-4 mr-1" />
                      Textarea
                    </Button>
                    <Button size="sm" onClick={() => addField("select")}>
                      <Plus className="w-4 h-4 mr-1" />
                      Select
                    </Button>
                  </div>
                </div>

                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary">{field.type}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label>Field Label</Label>
                        <Input
                          value={field.label}
                          onChange={(e) => updateField(index, { label: e.target.value })}
                          placeholder="Enter field label"
                        />
                      </div>
                      <div>
                        <Label>Placeholder</Label>
                        <Input
                          value={field.placeholder || ""}
                          onChange={(e) => updateField(index, { placeholder: e.target.value })}
                          placeholder="Enter placeholder text"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={field.required}
                        onCheckedChange={(checked) => updateField(index, { required: checked })}
                      />
                      <Label>Required field</Label>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave}>Save Form</Button>
                <Button variant="outline" onClick={handlePreview}>
                  Preview Form
                </Button>
              </div>
            </div>
          )}

          {viewMode === "preview" && (
            <FormPreview template={{
              id: "preview",
              name: form.getValues("name") || "Untitled Form",
              description: form.getValues("description") || "",
              fields: form.getValues("fields"),
              createdAt: new Date(),
              updatedAt: new Date()
            }} />
          )}

          {viewMode === "code" && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Generated Form JSON</h3>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
                <code>{memoizedGenerateFormCode()}</code>
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface FormPreviewProps {
  template: FormTemplate
}

function FormPreview({ template }: FormPreviewProps) {
  const previewForm = useForm()

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-bold">{template.name}</h3>
        {template.description && (
          <p className="text-gray-600 mt-1">{template.description}</p>
        )}
      </div>

      <form className="space-y-4">
        {template.fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>

            {field.type === "text" && (
              <Input
                id={field.id}
                placeholder={field.placeholder}
                required={field.required}
              />
            )}

            {field.type === "email" && (
              <Input
                id={field.id}
                type="email"
                placeholder={field.placeholder}
                required={field.required}
              />
            )}

            {field.type === "number" && (
              <Input
                id={field.id}
                type="number"
                placeholder={field.placeholder}
                required={field.required}
              />
            )}

            {field.type === "textarea" && (
              <Textarea
                id={field.id}
                placeholder={field.placeholder}
                required={field.required}
              />
            )}

            {field.type === "select" && (
              <Select>
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
            )}
          </div>
        ))}
      </form>
    </div>
  )
}