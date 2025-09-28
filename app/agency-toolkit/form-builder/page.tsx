/**
 * @fileoverview Advanced Form Builder Interface - HT-031.1.3
 * @module app/agency-toolkit/form-builder/page
 * @author Hero Tasks System
 * @version 1.0.0
 */

'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SmartFormBuilder } from '@/components/forms/smart-builder'
import { createFormTableCsvSchema, FormTableCsvBlock, type FormTableCsvSchema } from '@dct/form-table-csv'
import { 
  Wand2, 
  Plus, 
  Trash2, 
  Copy, 
  Download, 
  Upload, 
  Eye, 
  Settings,
  Sparkles,
  Code,
  Palette,
  Zap
} from 'lucide-react'

interface FormField {
  id: string
  name: string
  label: string
  type: string
  required: boolean
  placeholder?: string
  description?: string
  options?: string[]
  defaultValue?: any
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text Input', icon: '📝' },
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'tel', label: 'Phone', icon: '📞' },
  { value: 'number', label: 'Number', icon: '🔢' },
  { value: 'date', label: 'Date', icon: '📅' },
  { value: 'datetime-local', label: 'Date & Time', icon: '🕐' },
  { value: 'select', label: 'Dropdown', icon: '📋' },
  { value: 'multiselect', label: 'Multi-Select', icon: '☑️' },
  { value: 'checkbox', label: 'Checkbox', icon: '☑️' },
  { value: 'radio', label: 'Radio Group', icon: '🔘' },
  { value: 'textarea', label: 'Text Area', icon: '📄' }
]

export default function FormBuilderPage() {
  const [formName, setFormName] = useState('')
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [fields, setFields] = useState<FormField[]>([])
  const [selectedField, setSelectedField] = useState<FormField | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [generatedSchema, setGeneratedSchema] = useState<FormTableCsvSchema | null>(null)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])

  const addField = useCallback(() => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      name: '',
      label: '',
      type: 'text',
      required: false,
      placeholder: '',
      description: ''
    }
    setFields(prev => [...prev, newField])
    setSelectedField(newField)
  }, [])

  const updateField = useCallback((fieldId: string, updates: Partial<FormField>) => {
    setFields(prev => prev.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ))
    if (selectedField?.id === fieldId) {
      setSelectedField(prev => prev ? { ...prev, ...updates } : null)
    }
  }, [selectedField])

  const removeField = useCallback((fieldId: string) => {
    setFields(prev => prev.filter(field => field.id !== fieldId))
    if (selectedField?.id === fieldId) {
      setSelectedField(null)
    }
  }, [selectedField])

  const generateSchema = useCallback(() => {
    if (!formName || !formTitle || fields.length === 0) return

    const schema = createFormTableCsvSchema({
      name: formName,
      title: formTitle,
      description: formDescription,
      fields: fields.map(field => ({
        name: field.name,
        label: field.label,
        type: field.type as any,
        required: field.required,
        placeholder: field.placeholder,
        description: field.description,
        options: field.options,
        defaultValue: field.defaultValue
      }))
    })
    
    setGeneratedSchema(schema)
  }, [formName, formTitle, formDescription, fields])

  const exportSchema = useCallback(() => {
    if (!generatedSchema) return
    
    const dataStr = JSON.stringify(generatedSchema, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${formName}-schema.json`
    link.click()
    URL.revokeObjectURL(url)
  }, [generatedSchema, formName])

  const generateAISuggestions = useCallback(async () => {
    // Simulate AI suggestions based on form context
    const suggestions = [
      'Add a phone number field for contact information',
      'Consider adding a consent checkbox for GDPR compliance',
      'Include a dropdown for user type selection',
      'Add validation for email format',
      'Consider adding a file upload field for documents'
    ]
    setAiSuggestions(suggestions)
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Wand2 className="h-8 w-8" />
            Smart Form Builder
          </h1>
          <p className="text-muted-foreground mt-2">
            HT-031.1.3: Create sophisticated forms with AI-powered suggestions and dynamic field generation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">AI-Enhanced</Badge>
          <Badge variant="secondary">11 Field Types</Badge>
        </div>
      </div>

      <Tabs defaultValue="builder" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Builder
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI Assistant
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Configuration */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Form Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="formName">Form Name</Label>
                    <Input
                      id="formName"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="contact-form"
                    />
                  </div>
                  <div>
                    <Label htmlFor="formTitle">Form Title</Label>
                    <Input
                      id="formTitle"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Contact Us"
                    />
                  </div>
                  <div>
                    <Label htmlFor="formDescription">Description</Label>
                    <Textarea
                      id="formDescription"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Get in touch with our team"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Fields ({fields.length})
                    </span>
                    <Button onClick={addField} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Field
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedField?.id === field.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedField(field)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {field.label || `Field ${index + 1}`}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {FIELD_TYPES.find(t => t.value === field.type)?.icon} {field.type}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeField(field.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {fields.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No fields added yet</p>
                        <p className="text-sm">Click "Add Field" to get started</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Field Configuration */}
            <div className="lg:col-span-2">
              {selectedField ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Configure Field
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fieldName">Field Name</Label>
                        <Input
                          id="fieldName"
                          value={selectedField.name}
                          onChange={(e) => updateField(selectedField.id, { name: e.target.value })}
                          placeholder="email_address"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fieldLabel">Field Label</Label>
                        <Input
                          id="fieldLabel"
                          value={selectedField.label}
                          onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                          placeholder="Email Address"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="fieldType">Field Type</Label>
                      <Select
                        value={selectedField.type}
                        onValueChange={(value) => updateField(selectedField.id, { type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FIELD_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <span className="flex items-center gap-2">
                                {type.icon} {type.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="fieldPlaceholder">Placeholder</Label>
                      <Input
                        id="fieldPlaceholder"
                        value={selectedField.placeholder || ''}
                        onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                        placeholder="Enter your email address"
                      />
                    </div>

                    <div>
                      <Label htmlFor="fieldDescription">Description</Label>
                      <Textarea
                        id="fieldDescription"
                        value={selectedField.description || ''}
                        onChange={(e) => updateField(selectedField.id, { description: e.target.value })}
                        placeholder="We'll use this to contact you"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="fieldRequired"
                        checked={selectedField.required}
                        onCheckedChange={(checked) => updateField(selectedField.id, { required: checked })}
                      />
                      <Label htmlFor="fieldRequired">Required field</Label>
                    </div>

                    {(selectedField.type === 'select' || selectedField.type === 'multiselect' || selectedField.type === 'radio') && (
                      <div>
                        <Label htmlFor="fieldOptions">Options (one per line)</Label>
                        <Textarea
                          id="fieldOptions"
                          value={selectedField.options?.join('\n') || ''}
                          onChange={(e) => updateField(selectedField.id, { 
                            options: e.target.value.split('\n').filter(opt => opt.trim()) 
                          })}
                          placeholder="Option 1&#10;Option 2&#10;Option 3"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">Select a Field to Configure</h3>
                      <p className="text-muted-foreground">
                        Choose a field from the list to configure its properties
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <SmartFormBuilder
            formContext={{
              name: formName,
              title: formTitle,
              description: formDescription,
              fields: fields
            }}
            onSuggestionApply={(suggestion) => {
              // Apply AI suggestion to form
              console.log('Applying suggestion:', suggestion)
            }}
          />
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Form Preview</h2>
            <Button onClick={generateSchema} disabled={!formName || !formTitle || fields.length === 0}>
              <Zap className="h-4 w-4 mr-2" />
              Generate Preview
            </Button>
          </div>

          {generatedSchema ? (
            <div className="space-y-6">
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertDescription>
                  Live preview of your form with all configured fields and validation
                </AlertDescription>
              </Alert>
              
              <Card>
                <CardHeader>
                  <CardTitle>{formTitle}</CardTitle>
                  {formDescription && (
                    <CardDescription>{formDescription}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <FormTableCsvBlock
                    config={{
                      schema: generatedSchema,
                      form: {
                        submitText: 'Submit Form',
                        showReset: true,
                        layout: 'stack'
                      },
                      table: {
                        showSearch: true,
                        showPagination: true
                      },
                      csv: {
                        filename: `${formName}-data.csv`
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Preview Available</h3>
                  <p className="text-muted-foreground">
                    Configure your form and click "Generate Preview" to see how it looks
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Export Options</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Schema Export
                  </CardTitle>
                  <CardDescription>
                    Export the form schema as JSON for use in other applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={exportSchema} 
                    disabled={!generatedSchema}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Schema JSON
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    React Component
                  </CardTitle>
                  <CardDescription>
                    Generate React component code for this form
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => {
                      // Generate React component code
                      console.log('Generate React component')
                    }}
                    disabled={!generatedSchema}
                    className="w-full"
                    variant="outline"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Component Code
                  </Button>
                </CardContent>
              </Card>
            </div>

            {generatedSchema && (
              <Card>
                <CardHeader>
                  <CardTitle>Generated Schema</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                    {JSON.stringify(generatedSchema, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
