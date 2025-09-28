"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { 
  FileText, 
  Download, 
  Mail, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Trash2,
  Copy,
  Send
} from 'lucide-react'

interface DocumentTemplate {
  id: string
  name: string
  description: string
  version: string
  placeholders: Array<{
    id: string
    name: string
    type: string
    required: boolean
  }>
}

interface GeneratedDocument {
  id: string
  filename: string
  fileSize: number
  generationTime: number
  template: {
    id: string
    name: string
    version: string
  }
  version?: {
    id: string
    version: number
    createdAt: string
  }
  email?: {
    success: boolean
    messageId: string
    recipientCount: number
  }
  metadata: {
    templateId: string
    generatedAt: string
    dataHash: string
  }
}

interface DocumentGenerationForm {
  templateId: string
  data: Record<string, any>
  options: {
    filename?: string
    format: 'A4' | 'Letter' | 'Legal'
    orientation: 'portrait' | 'landscape'
    quality: 'low' | 'medium' | 'high'
    watermark?: {
      text: string
      opacity: number
      position: 'center' | 'top' | 'bottom'
    }
  }
  email: {
    enabled: boolean
    recipients: string[]
    cc?: string[]
    bcc?: string[]
    subject?: string
  }
  versioning: {
    enabled: boolean
    tags: string[]
    notes: string
  }
}

export default function DocumentsPage() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([])
  const [documents, setDocuments] = useState<GeneratedDocument[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null)
  const [generationForm, setGenerationForm] = useState<DocumentGenerationForm>({
    templateId: '',
    data: {},
    options: {
      format: 'A4',
      orientation: 'portrait',
      quality: 'medium'
    },
    email: {
      enabled: false,
      recipients: []
    },
    versioning: {
      enabled: true,
      tags: [],
      notes: ''
    }
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failed'>('all')
  const [activeTab, setActiveTab] = useState('generate')

  // Load templates on component mount
  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = useCallback(async () => {
    try {
      const response = await fetch('/api/documents/generate?action=templates')
      const result = await response.json()
      
      if (result.success) {
        setTemplates(result.templates)
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
    }
  }, [])

  const handleTemplateSelect = useCallback((templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    setSelectedTemplate(template || null)
    setGenerationForm(prev => ({
      ...prev,
      templateId,
      data: {}
    }))
  }, [templates])

  const handleDataChange = useCallback((fieldName: string, value: any) => {
    setGenerationForm(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [fieldName]: value
      }
    }))
  }, [])

  const handleEmailRecipientsChange = useCallback((value: string) => {
    const recipients = value.split(',').map(email => email.trim()).filter(email => email)
    setGenerationForm(prev => ({
      ...prev,
      email: {
        ...prev.email,
        recipients
      }
    }))
  }, [])

  const handleGenerateDocument = useCallback(async () => {
    if (!selectedTemplate) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(generationForm)
      })

      const result = await response.json()
      
      if (result.success) {
        setDocuments(prev => [result.document, ...prev])
        setIsDialogOpen(false)
        setGenerationForm(prev => ({
          ...prev,
          data: {},
          email: {
            ...prev.email,
            recipients: []
          },
          versioning: {
            ...prev.versioning,
            tags: [],
            notes: ''
          }
        }))
      } else {
        console.error('Document generation failed:', result.error)
      }
    } catch (error) {
      console.error('Failed to generate document:', error)
    } finally {
      setIsGenerating(false)
    }
  }, [selectedTemplate, generationForm])

  const handleDownloadDocument = useCallback(async (documentId: string, filename: string) => {
    try {
      const response = await fetch(`/api/documents/download/${documentId}?download=true`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Download failed:', error)
    }
  }, [])

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.template.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'success' && doc.email?.success !== false) ||
                         (filterStatus === 'failed' && doc.email?.success === false)
    return matchesSearch && matchesFilter
  })

  const renderTemplateForm = () => {
    if (!selectedTemplate) return null

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Template: {selectedTemplate.name}</h3>
          <p className="text-sm text-muted-foreground mb-4">{selectedTemplate.description}</p>
        </div>

        {selectedTemplate.placeholders.map(placeholder => (
          <div key={placeholder.id}>
            <Label htmlFor={placeholder.id}>
              {placeholder.name}
              {placeholder.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {placeholder.type === 'textarea' ? (
              <Textarea
                id={placeholder.id}
                value={generationForm.data[placeholder.name] || ''}
                onChange={(e) => handleDataChange(placeholder.name, e.target.value)}
                placeholder={`Enter ${placeholder.name.toLowerCase()}...`}
                rows={3}
              />
            ) : (
              <Input
                id={placeholder.id}
                type={placeholder.type === 'number' ? 'number' : placeholder.type === 'email' ? 'email' : 'text'}
                value={generationForm.data[placeholder.name] || ''}
                onChange={(e) => handleDataChange(placeholder.name, e.target.value)}
                placeholder={`Enter ${placeholder.name.toLowerCase()}...`}
              />
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Document Generation</h1>
          <p className="text-muted-foreground">Generate and manage PDF documents with templates</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Generate Document
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Select Template</Label>
                  <Select onValueChange={handleTemplateSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name} (v{template.version})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Output Format</Label>
                  <Select 
                    value={generationForm.options.format} 
                    onValueChange={(value: 'A4' | 'Letter' | 'Legal') => 
                      setGenerationForm(prev => ({
                        ...prev,
                        options: { ...prev.options, format: value }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A4">A4</SelectItem>
                      <SelectItem value="Letter">Letter</SelectItem>
                      <SelectItem value="Legal">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Documents</SelectItem>
                <SelectItem value="success">Successful</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map(doc => (
              <Card key={doc.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <CardTitle className="text-sm">{doc.filename}</CardTitle>
                    </div>
                    <Badge variant={doc.email?.success !== false ? 'default' : 'destructive'}>
                      {doc.email?.success !== false ? 'Success' : 'Failed'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(doc.metadata.generatedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{doc.generationTime}ms</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>{(doc.fileSize / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadDocument(doc.id, doc.filename)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <Badge variant="outline">v{template.version}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Required Fields:</h4>
                    <div className="flex flex-wrap gap-1">
                      {template.placeholders
                        .filter(p => p.required)
                        .map(placeholder => (
                          <Badge key={placeholder.id} variant="secondary" className="text-xs">
                            {placeholder.name}
                          </Badge>
                        ))}
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    onClick={() => {
                      handleTemplateSelect(template.id)
                      setIsDialogOpen(true)
                    }}
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Generation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Document</DialogTitle>
            <DialogDescription>
              Fill in the template data and configure generation options
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {renderTemplateForm()}

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Generation Options</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Orientation</Label>
                  <Select 
                    value={generationForm.options.orientation} 
                    onValueChange={(value: 'portrait' | 'landscape') => 
                      setGenerationForm(prev => ({
                        ...prev,
                        options: { ...prev.options, orientation: value }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quality</Label>
                  <Select 
                    value={generationForm.options.quality} 
                    onValueChange={(value: 'low' | 'medium' | 'high') => 
                      setGenerationForm(prev => ({
                        ...prev,
                        options: { ...prev.options, quality: value }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Custom Filename (optional)</Label>
                <Input
                  value={generationForm.options.filename || ''}
                  onChange={(e) => setGenerationForm(prev => ({
                    ...prev,
                    options: { ...prev.options, filename: e.target.value }
                  }))}
                  placeholder="Leave empty for auto-generated name"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="email-enabled"
                  checked={generationForm.email.enabled}
                  onChange={(e) => setGenerationForm(prev => ({
                    ...prev,
                    email: { ...prev.email, enabled: e.target.checked }
                  }))}
                />
                <Label htmlFor="email-enabled">Send via Email</Label>
              </div>

              {generationForm.email.enabled && (
                <div className="space-y-3 pl-6">
                  <div>
                    <Label>Recipients (comma-separated)</Label>
                    <Input
                      value={generationForm.email.recipients.join(', ')}
                      onChange={(e) => handleEmailRecipientsChange(e.target.value)}
                      placeholder="user@example.com, admin@example.com"
                    />
                  </div>
                  <div>
                    <Label>Subject (optional)</Label>
                    <Input
                      value={generationForm.email.subject || ''}
                      onChange={(e) => setGenerationForm(prev => ({
                        ...prev,
                        email: { ...prev.email, subject: e.target.value }
                      }))}
                      placeholder="Leave empty for default subject"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="versioning-enabled"
                  checked={generationForm.versioning.enabled}
                  onChange={(e) => setGenerationForm(prev => ({
                    ...prev,
                    versioning: { ...prev.versioning, enabled: e.target.checked }
                  }))}
                />
                <Label htmlFor="versioning-enabled">Enable Versioning</Label>
              </div>

              {generationForm.versioning.enabled && (
                <div className="space-y-3 pl-6">
                  <div>
                    <Label>Notes (optional)</Label>
                    <Textarea
                      value={generationForm.versioning.notes}
                      onChange={(e) => setGenerationForm(prev => ({
                        ...prev,
                        versioning: { ...prev.versioning, notes: e.target.value }
                      }))}
                      placeholder="Add notes about this document version..."
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateDocument} 
              disabled={isGenerating || !selectedTemplate}
            >
              {isGenerating ? 'Generating...' : 'Generate Document'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}