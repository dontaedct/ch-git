"use client"

import React, { useState, useMemo } from "react"
import { FormTemplate } from "./form-builder-engine"
import {
  TEMPLATE_CATEGORIES,
  FORM_TEMPLATES,
  TemplatePattern,
  getTemplatesByCategory,
  getTemplatesByComplexity,
  searchTemplates,
  convertTemplateToFormTemplate,
  getCategoryById
} from "@/lib/form-builder/templates"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Clock, Star, Users, Zap, FileText, Calendar, ShoppingCart, MessageSquare, UserPlus, HelpCircle, ClipboardCheck } from "lucide-react"

interface TemplateGalleryProps {
  onSelectTemplate?: (template: FormTemplate) => void
  onPreviewTemplate?: (template: TemplatePattern) => void
  showPreview?: boolean
}

export function TemplateGallery({
  onSelectTemplate,
  onPreviewTemplate,
  showPreview = true
}: TemplateGalleryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedComplexity, setSelectedComplexity] = useState("all")
  const [activeTab, setActiveTab] = useState("browse")

  const filteredTemplates = useMemo(() => {
    let templates = FORM_TEMPLATES

    // Apply search filter
    if (searchQuery.trim()) {
      templates = searchTemplates(searchQuery)
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      templates = templates.filter(template => template.categoryId === selectedCategory)
    }

    // Apply complexity filter
    if (selectedComplexity !== "all") {
      templates = templates.filter(template => template.complexity === selectedComplexity)
    }

    return templates
  }, [searchQuery, selectedCategory, selectedComplexity])

  const handleSelectTemplate = (template: TemplatePattern) => {
    const formTemplate = convertTemplateToFormTemplate(template)
    onSelectTemplate?.(formTemplate)
  }

  const getIconForCategory = (categoryId: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      contact: <UserPlus className="w-4 h-4" />,
      feedback: <MessageSquare className="w-4 h-4" />,
      registration: <Users className="w-4 h-4" />,
      booking: <Calendar className="w-4 h-4" />,
      ecommerce: <ShoppingCart className="w-4 h-4" />,
      support: <HelpCircle className="w-4 h-4" />,
      assessment: <ClipboardCheck className="w-4 h-4" />,
      application: <FileText className="w-4 h-4" />
    }
    return iconMap[categoryId] || <FileText className="w-4 h-4" />
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "simple": return "green"
      case "medium": return "yellow"
      case "complex": return "red"
      default: return "gray"
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Form Template Gallery</h2>
        <p className="text-muted-foreground">
          Choose from pre-built templates or browse patterns for common use cases
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Templates</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="patterns">Common Patterns</TabsTrigger>
        </TabsList>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {TEMPLATE_CATEGORIES.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedComplexity} onValueChange={setSelectedComplexity}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Complexity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="simple">Simple</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="complex">Complex</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="browse" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => {
              const category = getCategoryById(template.categoryId)
              return (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getIconForCategory(template.categoryId)}
                        <Badge variant="secondary" className="text-xs">
                          {category?.name}
                        </Badge>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs border-${getComplexityColor(template.complexity)}-500 text-${getComplexityColor(template.complexity)}-700`}
                      >
                        {template.complexity}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {template.estimatedTimeToComplete}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {template.fields.length} fields
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Use Cases:</p>
                      <ul className="text-xs space-y-1">
                        {template.useCases.slice(0, 2).map((useCase, index) => (
                          <li key={index} className="flex items-center gap-1">
                            <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                            {useCase}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleSelectTemplate(template)}
                        className="flex-1"
                        size="sm"
                      >
                        Use Template
                      </Button>
                      {showPreview && (
                        <Button
                          variant="outline"
                          onClick={() => onPreviewTemplate?.(template)}
                          size="sm"
                        >
                          Preview
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No templates found matching your criteria.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("all")
                  setSelectedComplexity("all")
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEMPLATE_CATEGORIES.map((category) => {
              const categoryTemplates = getTemplatesByCategory(category.id)
              return (
                <Card key={category.id} className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        setSelectedCategory(category.id)
                        setActiveTab("browse")
                      }}>
                  <CardHeader className="text-center space-y-2">
                    <div className="mx-auto">
                      {getIconForCategory(category.id)}
                    </div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Badge variant="secondary">
                      {categoryTemplates.length} template{categoryTemplates.length !== 1 ? 's' : ''}
                    </Badge>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                name: "Lead Generation Pattern",
                description: "Capture leads with minimal friction",
                fields: ["Name", "Email", "Company", "Interest Level"],
                complexity: "simple",
                icon: <Zap className="w-5 h-5" />
              },
              {
                name: "Progressive Disclosure",
                description: "Collect information in stages",
                fields: ["Basic Info", "Details", "Preferences", "Confirmation"],
                complexity: "medium",
                icon: <Users className="w-5 h-5" />
              },
              {
                name: "Conditional Logic Pattern",
                description: "Show/hide fields based on responses",
                fields: ["Type Selection", "Conditional Fields", "Dynamic Validation"],
                complexity: "complex",
                icon: <Zap className="w-5 h-5" />
              }
            ].map((pattern, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {pattern.icon}
                    <div>
                      <CardTitle className="text-lg">{pattern.name}</CardTitle>
                      <CardDescription>{pattern.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {pattern.fields.map((field) => (
                        <Badge key={field} variant="outline" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={`text-xs border-${getComplexityColor(pattern.complexity)}-500 text-${getComplexityColor(pattern.complexity)}-700`}
                      >
                        {pattern.complexity}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Learn More
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}