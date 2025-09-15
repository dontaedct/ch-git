"use client"

import React, { useState, useCallback } from "react"
import { FormTemplate, FormField } from "./form-builder-engine"
import { TemplatePattern } from "@/lib/form-builder/templates"
import { ClientTemplatePattern } from "@/lib/form-builder/client-templates"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Palette,
  Settings,
  Eye,
  Save,
  RotateCcw,
  Trash2,
  Plus,
  Move,
  Copy,
  Edit3
} from "lucide-react"

interface TemplateCustomizerProps {
  template: TemplatePattern | ClientTemplatePattern
  onSave?: (customizedTemplate: FormTemplate) => void
  onPreview?: (customizedTemplate: FormTemplate) => void
  allowFieldModification?: boolean
  allowBrandingCustomization?: boolean
}

interface CustomizationSettings {
  name: string
  description: string
  fields: FormField[]
  branding?: {
    primaryColor: string
    secondaryColor: string
    logoUrl: string
    fontFamily: string
  }
  styling?: {
    layout: "single-column" | "two-column" | "cards"
    spacing: "compact" | "normal" | "relaxed"
    fieldSize: "small" | "medium" | "large"
    buttonStyle: "default" | "rounded" | "square"
  }
  behavior?: {
    showProgress: boolean
    allowSave: boolean
    autoValidate: boolean
    showOptionalLabel: boolean
  }
}

export function TemplateCustomizer({
  template,
  onSave,
  onPreview,
  allowFieldModification = true,
  allowBrandingCustomization = true
}: TemplateCustomizerProps) {
  const [settings, setSettings] = useState<CustomizationSettings>({
    name: template.name,
    description: template.description,
    fields: [...template.fields],
    branding: {
      primaryColor: (template as ClientTemplatePattern).branding?.primaryColor || "#2563eb",
      secondaryColor: (template as ClientTemplatePattern).branding?.secondaryColor || "#64748b",
      logoUrl: (template as ClientTemplatePattern).branding?.logoUrl || "",
      fontFamily: (template as ClientTemplatePattern).branding?.fontFamily || "Inter"
    },
    styling: {
      layout: "single-column",
      spacing: "normal",
      fieldSize: "medium",
      buttonStyle: "default"
    },
    behavior: {
      showProgress: false,
      allowSave: true,
      autoValidate: true,
      showOptionalLabel: true
    }
  })

  const [activeField, setActiveField] = useState<string | null>(null)

  const updateSettings = useCallback((updates: Partial<CustomizationSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }))
  }, [])

  const updateBranding = useCallback((updates: Partial<CustomizationSettings["branding"]>) => {
    setSettings(prev => ({
      ...prev,
      branding: { ...prev.branding!, ...updates }
    }))
  }, [])

  const updateStyling = useCallback((updates: Partial<CustomizationSettings["styling"]>) => {
    setSettings(prev => ({
      ...prev,
      styling: { ...prev.styling!, ...updates }
    }))
  }, [])

  const updateBehavior = useCallback((updates: Partial<CustomizationSettings["behavior"]>) => {
    setSettings(prev => ({
      ...prev,
      behavior: { ...prev.behavior!, ...updates }
    }))
  }, [])

  const updateField = useCallback((fieldId: string, updates: Partial<FormField>) => {
    setSettings(prev => ({
      ...prev,
      fields: prev.fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }))
  }, [])

  const removeField = useCallback((fieldId: string) => {
    setSettings(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }))
  }, [])

  const duplicateField = useCallback((fieldId: string) => {
    const field = settings.fields.find(f => f.id === fieldId)
    if (field) {
      const newField: FormField = {
        ...field,
        id: `${field.id}_copy_${Date.now()}`,
        label: `${field.label} (Copy)`
      }
      setSettings(prev => ({
        ...prev,
        fields: [...prev.fields, newField]
      }))
    }
  }, [settings.fields])

  const moveField = useCallback((fieldId: string, direction: "up" | "down") => {
    setSettings(prev => {
      const fields = [...prev.fields]
      const index = fields.findIndex(f => f.id === fieldId)
      if (index === -1) return prev

      const newIndex = direction === "up" ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= fields.length) return prev

      const [field] = fields.splice(index, 1)
      fields.splice(newIndex, 0, field)

      return { ...prev, fields }
    })
  }, [])

  const resetToOriginal = useCallback(() => {
    setSettings({
      name: template.name,
      description: template.description,
      fields: [...template.fields],
      branding: {
        primaryColor: (template as ClientTemplatePattern).branding?.primaryColor || "#2563eb",
        secondaryColor: (template as ClientTemplatePattern).branding?.secondaryColor || "#64748b",
        logoUrl: (template as ClientTemplatePattern).branding?.logoUrl || "",
        fontFamily: (template as ClientTemplatePattern).branding?.fontFamily || "Inter"
      },
      styling: {
        layout: "single-column",
        spacing: "normal",
        fieldSize: "medium",
        buttonStyle: "default"
      },
      behavior: {
        showProgress: false,
        allowSave: true,
        autoValidate: true,
        showOptionalLabel: true
      }
    })
  }, [template])

  const generateCustomizedTemplate = useCallback((): FormTemplate => {
    return {
      id: `customized_${template.id}_${Date.now()}`,
      name: settings.name,
      description: settings.description,
      fields: settings.fields,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }, [template.id, settings])

  const handleSave = useCallback(() => {
    const customizedTemplate = generateCustomizedTemplate()
    onSave?.(customizedTemplate)
  }, [generateCustomizedTemplate, onSave])

  const handlePreview = useCallback(() => {
    const customizedTemplate = generateCustomizedTemplate()
    onPreview?.(customizedTemplate)
  }, [generateCustomizedTemplate, onPreview])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Customize Template</h2>
          <p className="text-muted-foreground">
            Customize "{template.name}" to fit your specific needs
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToOriginal}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="fields">Fields</TabsTrigger>
          <TabsTrigger value="styling">Styling</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Update the form name and description
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="formName">Form Name</Label>
                <Input
                  id="formName"
                  value={settings.name}
                  onChange={(e) => updateSettings({ name: e.target.value })}
                  placeholder="Enter form name"
                />
              </div>
              <div>
                <Label htmlFor="formDescription">Description</Label>
                <Textarea
                  id="formDescription"
                  value={settings.description}
                  onChange={(e) => updateSettings({ description: e.target.value })}
                  placeholder="Enter form description"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {allowBrandingCustomization && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Branding
                </CardTitle>
                <CardDescription>
                  Customize the visual appearance of your form
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={settings.branding?.primaryColor}
                        onChange={(e) => updateBranding({ primaryColor: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={settings.branding?.primaryColor}
                        onChange={(e) => updateBranding({ primaryColor: e.target.value })}
                        placeholder="#2563eb"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={settings.branding?.secondaryColor}
                        onChange={(e) => updateBranding({ secondaryColor: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={settings.branding?.secondaryColor}
                        onChange={(e) => updateBranding({ secondaryColor: e.target.value })}
                        placeholder="#64748b"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    value={settings.branding?.logoUrl}
                    onChange={(e) => updateBranding({ logoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <div>
                  <Label htmlFor="fontFamily">Font Family</Label>
                  <Select
                    value={settings.branding?.fontFamily}
                    onValueChange={(value) => updateBranding({ fontFamily: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                      <SelectItem value="Lato">Lato</SelectItem>
                      <SelectItem value="Source Sans Pro">Source Sans Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="fields" className="space-y-6">
          {allowFieldModification ? (
            <Card>
              <CardHeader>
                <CardTitle>Form Fields</CardTitle>
                <CardDescription>
                  Customize, reorder, or modify form fields
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible value={activeField || undefined} onValueChange={setActiveField}>
                  {settings.fields.map((field, index) => (
                    <AccordionItem key={field.id} value={field.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full mr-4">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{field.type}</Badge>
                            <span className="font-medium">{field.label}</span>
                            {field.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                moveField(field.id, "up")
                              }}
                              disabled={index === 0}
                            >
                              ↑
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                moveField(field.id, "down")
                              }}
                              disabled={index === settings.fields.length - 1}
                            >
                              ↓
                            </Button>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Field Label</Label>
                            <Input
                              value={field.label}
                              onChange={(e) => updateField(field.id, { label: e.target.value })}
                              placeholder="Enter field label"
                            />
                          </div>
                          <div>
                            <Label>Placeholder</Label>
                            <Input
                              value={field.placeholder || ""}
                              onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                              placeholder="Enter placeholder text"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={field.required}
                              onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                            />
                            <Label>Required field</Label>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => duplicateField(field.id)}
                            >
                              <Copy className="w-4 h-4 mr-1" />
                              Duplicate
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeField(field.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Form Fields</CardTitle>
                <CardDescription>
                  View the fields included in this template
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {settings.fields.map((field) => (
                    <div key={field.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{field.type}</Badge>
                        <span className="font-medium">{field.label}</span>
                        {field.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="styling" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Layout & Styling</CardTitle>
              <CardDescription>
                Customize the visual layout and styling of your form
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Layout Style</Label>
                  <Select
                    value={settings.styling?.layout}
                    onValueChange={(value: any) => updateStyling({ layout: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single-column">Single Column</SelectItem>
                      <SelectItem value="two-column">Two Column</SelectItem>
                      <SelectItem value="cards">Card Layout</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Spacing</Label>
                  <Select
                    value={settings.styling?.spacing}
                    onValueChange={(value: any) => updateStyling({ spacing: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="relaxed">Relaxed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Field Size</Label>
                  <Select
                    value={settings.styling?.fieldSize}
                    onValueChange={(value: any) => updateStyling({ fieldSize: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Button Style</Label>
                  <Select
                    value={settings.styling?.buttonStyle}
                    onValueChange={(value: any) => updateStyling({ buttonStyle: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="rounded">Rounded</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Form Behavior</CardTitle>
              <CardDescription>
                Configure how the form behaves and interacts with users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Show Progress Indicator</Label>
                  <p className="text-sm text-muted-foreground">Display form completion progress</p>
                </div>
                <Switch
                  checked={settings.behavior?.showProgress}
                  onCheckedChange={(checked) => updateBehavior({ showProgress: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Allow Save & Resume</Label>
                  <p className="text-sm text-muted-foreground">Let users save progress and continue later</p>
                </div>
                <Switch
                  checked={settings.behavior?.allowSave}
                  onCheckedChange={(checked) => updateBehavior({ allowSave: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Auto-validate Fields</Label>
                  <p className="text-sm text-muted-foreground">Validate fields as users type</p>
                </div>
                <Switch
                  checked={settings.behavior?.autoValidate}
                  onCheckedChange={(checked) => updateBehavior({ autoValidate: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Show Optional Labels</Label>
                  <p className="text-sm text-muted-foreground">Mark optional fields with "(Optional)" text</p>
                </div>
                <Switch
                  checked={settings.behavior?.showOptionalLabel}
                  onCheckedChange={(checked) => updateBehavior({ showOptionalLabel: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}