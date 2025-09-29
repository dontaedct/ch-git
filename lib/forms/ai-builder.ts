/**
 * @fileoverview AI-Powered Form Building Library - HT-031.1.3
 * @module lib/forms/ai-builder
 * @author Hero Tasks System
 * @version 1.0.0
 */

import { z } from 'zod'

export interface FormContext {
  name: string
  title: string
  description: string
  fields: Array<{
    id: string
    name: string
    label: string
    type: string
    required: boolean
    placeholder?: string
    description?: string
    options?: string[]
  }>
}

export interface AIFormSuggestion {
  id: string
  type: 'field' | 'validation' | 'layout' | 'optimization'
  title: string
  description: string
  confidence: number
  impact: 'low' | 'medium' | 'high'
  implementation: {
    action: string
    details: string
    code?: string
  }
}

export interface FormAnalysis {
  completeness: number
  usability: number
  accessibility: number
  performance: number
  suggestions: AIFormSuggestion[]
  recommendations: string[]
}

export interface FieldTypeRecommendation {
  fieldName: string
  currentType: string
  suggestedType: string
  reason: string
  confidence: number
}

export class AIFormBuilder {
  private context: FormContext
  private analysisCache: Map<string, FormAnalysis> = new Map()

  constructor(context: FormContext) {
    this.context = context
  }

  /**
   * Analyze the current form and provide intelligent suggestions
   */
  async analyzeForm(): Promise<FormAnalysis> {
    const cacheKey = this.generateCacheKey()
    
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey)!
    }

    const analysis: FormAnalysis = {
      completeness: this.calculateCompleteness(),
      usability: this.calculateUsability(),
      accessibility: this.calculateAccessibility(),
      performance: this.calculatePerformance(),
      suggestions: await this.generateSuggestions(),
      recommendations: this.generateRecommendations()
    }

    this.analysisCache.set(cacheKey, analysis)
    return analysis
  }

  /**
   * Generate field type recommendations based on field names and context
   */
  async getFieldTypeRecommendations(): Promise<FieldTypeRecommendation[]> {
    const recommendations: FieldTypeRecommendation[] = []

    for (const field of this.context.fields) {
      const recommendation = this.analyzeFieldType(field)
      if (recommendation) {
        recommendations.push(recommendation)
      }
    }

    return recommendations
  }

  /**
   * Generate AI-powered form suggestions based on context
   */
  async generateFormSuggestions(): Promise<AIFormSuggestion[]> {
    const suggestions: AIFormSuggestion[] = []

    // Analyze form context and generate contextual suggestions
    if (this.context.title.toLowerCase().includes('contact')) {
      suggestions.push(...this.getContactFormSuggestions())
    }

    if (this.context.title.toLowerCase().includes('registration')) {
      suggestions.push(...this.getRegistrationFormSuggestions())
    }

    if (this.context.title.toLowerCase().includes('feedback')) {
      suggestions.push(...this.getFeedbackFormSuggestions())
    }

    // General form improvement suggestions
    suggestions.push(...this.getGeneralImprovementSuggestions())

    return suggestions.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Suggest optimal field ordering based on UX best practices
   */
  async optimizeFieldOrder(): Promise<string[]> {
    const fieldImportance = new Map<string, number>()
    
    // Calculate importance scores based on field types and names
    for (const field of this.context.fields) {
      let score = 0
      
      // Higher score for required fields
      if (field.required) score += 10
      
      // Higher score for critical fields
      if (field.name.toLowerCase().includes('email')) score += 8
      if (field.name.toLowerCase().includes('name')) score += 7
      if (field.name.toLowerCase().includes('phone')) score += 6
      
      // Lower score for optional fields at the end
      if (field.name.toLowerCase().includes('message') || 
          field.name.toLowerCase().includes('comment')) score += 2
      
      fieldImportance.set(field.id, score)
    }

    // Sort fields by importance (descending)
    return this.context.fields
      .sort((a, b) => (fieldImportance.get(b.id) || 0) - (fieldImportance.get(a.id) || 0))
      .map(field => field.id)
  }

  /**
   * Generate validation rules based on field types and context
   */
  async generateValidationRules(): Promise<Record<string, any>> {
    const rules: Record<string, any> = {}

    for (const field of this.context.fields) {
      switch (field.type) {
        case 'email':
          rules[field.name] = z.string().email('Please enter a valid email address')
          break
        case 'tel':
          rules[field.name] = z.string().regex(
            /^[\+]?[1-9][\d]{0,15}$/,
            'Please enter a valid phone number'
          )
          break
        case 'number':
          rules[field.name] = z.number().min(0, 'Number must be positive')
          break
        case 'date':
          rules[field.name] = z.string().refine(
            (date) => !isNaN(Date.parse(date)),
            'Please enter a valid date'
          )
          break
        default:
          if (field.required) {
            rules[field.name] = z.string().min(1, `${field.label} is required`)
          }
      }
    }

    return rules
  }

  /**
   * Suggest accessibility improvements
   */
  async getAccessibilitySuggestions(): Promise<AIFormSuggestion[]> {
    const suggestions: AIFormSuggestion[] = []

    // Check for missing labels
    const fieldsWithoutLabels = this.context.fields.filter(field => !field.label)
    if (fieldsWithoutLabels.length > 0) {
      suggestions.push({
        id: 'missing-labels',
        type: 'accessibility',
        title: 'Add Field Labels',
        description: `${fieldsWithoutLabels.length} fields are missing labels`,
        confidence: 0.95,
        impact: 'high',
        implementation: {
          action: 'Add descriptive labels to all form fields',
          details: 'Labels improve accessibility for screen readers'
        }
      })
    }

    // Check for required field indicators
    const requiredFields = this.context.fields.filter(field => field.required)
    if (requiredFields.length > 0) {
      suggestions.push({
        id: 'required-indicators',
        type: 'accessibility',
        title: 'Add Required Field Indicators',
        description: 'Add visual indicators for required fields',
        confidence: 0.9,
        impact: 'medium',
        implementation: {
          action: 'Add asterisk (*) or "required" text to required fields',
          details: 'Helps users understand which fields are mandatory'
        }
      })
    }

    return suggestions
  }

  private calculateCompleteness(): number {
    const totalFields = this.context.fields.length
    if (totalFields === 0) return 0

    const completeFields = this.context.fields.filter(field => 
      field.name && field.label && field.type
    ).length

    return Math.round((completeFields / totalFields) * 100)
  }

  private calculateUsability(): number {
    let score = 0
    const totalFields = this.context.fields.length

    // Check for logical field ordering
    const hasEmail = this.context.fields.some(f => f.name.toLowerCase().includes('email'))
    const hasName = this.context.fields.some(f => f.name.toLowerCase().includes('name'))
    
    if (hasEmail && hasName) score += 20
    
    // Check for appropriate field types
    const appropriateTypes = this.context.fields.filter(field => {
      const name = field.name.toLowerCase()
      if (name.includes('email') && field.type === 'email') return true
      if (name.includes('phone') && field.type === 'tel') return true
      if (name.includes('date') && field.type === 'date') return true
      return false
    }).length

    score += Math.round((appropriateTypes / totalFields) * 40)

    // Check for required field balance
    const requiredCount = this.context.fields.filter(f => f.required).length
    const requiredRatio = requiredCount / totalFields
    if (requiredRatio > 0.3 && requiredRatio < 0.7) score += 20

    // Check for descriptions
    const fieldsWithDescriptions = this.context.fields.filter(f => f.description).length
    score += Math.round((fieldsWithDescriptions / totalFields) * 20)

    return Math.min(score, 100)
  }

  private calculateAccessibility(): number {
    let score = 0
    const totalFields = this.context.fields.length

    // Check for labels
    const fieldsWithLabels = this.context.fields.filter(f => f.label).length
    score += Math.round((fieldsWithLabels / totalFields) * 50)

    // Check for placeholders
    const fieldsWithPlaceholders = this.context.fields.filter(f => f.placeholder).length
    score += Math.round((fieldsWithPlaceholders / totalFields) * 30)

    // Check for descriptions
    const fieldsWithDescriptions = this.context.fields.filter(f => f.description).length
    score += Math.round((fieldsWithDescriptions / totalFields) * 20)

    return Math.min(score, 100)
  }

  private calculatePerformance(): number {
    // Simple performance calculation based on form complexity
    const totalFields = this.context.fields.length
    const complexFields = this.context.fields.filter(f => 
      ['multiselect', 'textarea'].includes(f.type)
    ).length

    let score = 100
    if (totalFields > 10) score -= 20
    if (complexFields > 3) score -= 15
    if (totalFields > 20) score -= 25

    return Math.max(score, 0)
  }

  private async generateSuggestions(): Promise<AIFormSuggestion[]> {
    const suggestions: AIFormSuggestion[] = []

    // Generate contextual suggestions based on form type
    const formSuggestions = await this.generateFormSuggestions()
    suggestions.push(...formSuggestions)

    // Add accessibility suggestions
    const accessibilitySuggestions = await this.getAccessibilitySuggestions()
    suggestions.push(...accessibilitySuggestions)

    return suggestions
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = []

    if (this.context.fields.length === 0) {
      recommendations.push('Add at least one field to create a functional form')
    }

    if (!this.context.fields.some(f => f.type === 'email')) {
      recommendations.push('Consider adding an email field for contact forms')
    }

    if (this.context.fields.filter(f => f.required).length === 0) {
      recommendations.push('Consider marking some fields as required')
    }

    if (this.context.fields.length > 15) {
      recommendations.push('Consider splitting this into multiple forms or using a multi-step approach')
    }

    return recommendations
  }

  private getContactFormSuggestions(): AIFormSuggestion[] {
    return [
      {
        id: 'contact-phone',
        type: 'field',
        title: 'Add Phone Number Field',
        description: 'Phone numbers are commonly requested in contact forms',
        confidence: 0.85,
        impact: 'medium',
        implementation: {
          action: 'Add phone number field with validation',
          details: 'Include international phone number formatting'
        }
      },
      {
        id: 'contact-consent',
        type: 'field',
        title: 'Add Consent Checkbox',
        description: 'GDPR compliance requires explicit consent',
        confidence: 0.95,
        impact: 'high',
        implementation: {
          action: 'Add required consent checkbox',
          details: 'Include clear consent text and make it required'
        }
      }
    ]
  }

  private getRegistrationFormSuggestions(): AIFormSuggestion[] {
    return [
      {
        id: 'registration-password',
        type: 'field',
        title: 'Add Password Field',
        description: 'Registration forms typically require password creation',
        confidence: 0.9,
        impact: 'high',
        implementation: {
          action: 'Add password field with strength validation',
          details: 'Include password confirmation and strength requirements'
        }
      },
      {
        id: 'registration-terms',
        type: 'field',
        title: 'Add Terms Acceptance',
        description: 'Users should accept terms and conditions',
        confidence: 0.85,
        impact: 'medium',
        implementation: {
          action: 'Add terms and conditions checkbox',
          details: 'Link to terms page and make acceptance required'
        }
      }
    ]
  }

  private getFeedbackFormSuggestions(): AIFormSuggestion[] {
    return [
      {
        id: 'feedback-rating',
        type: 'field',
        title: 'Add Rating System',
        description: 'Rating fields help quantify feedback',
        confidence: 0.8,
        impact: 'medium',
        implementation: {
          action: 'Add star rating or number scale',
          details: 'Use radio buttons or number input for ratings'
        }
      },
      {
        id: 'feedback-category',
        type: 'field',
        title: 'Add Category Selection',
        description: 'Categorize feedback for better organization',
        confidence: 0.75,
        impact: 'medium',
        implementation: {
          action: 'Add dropdown for feedback categories',
          details: 'Include options like Bug Report, Feature Request, General'
        }
      }
    ]
  }

  private getGeneralImprovementSuggestions(): AIFormSuggestion[] {
    return [
      {
        id: 'form-validation',
        type: 'validation',
        title: 'Enhance Form Validation',
        description: 'Add real-time validation for better user experience',
        confidence: 0.9,
        impact: 'high',
        implementation: {
          action: 'Implement client-side validation',
          details: 'Add validation on blur and real-time feedback'
        }
      },
      {
        id: 'form-progress',
        type: 'layout',
        title: 'Add Progress Indicator',
        description: 'Show progress for long forms',
        confidence: 0.7,
        impact: 'medium',
        implementation: {
          action: 'Add progress bar or step indicator',
          details: 'Help users understand form completion status'
        }
      }
    ]
  }

  private analyzeFieldType(field: FormContext['fields'][0]): FieldTypeRecommendation | null {
    const name = field.name.toLowerCase()
    const currentType = field.type

    // Email field recommendations
    if (name.includes('email') && currentType !== 'email') {
      return {
        fieldName: field.name,
        currentType,
        suggestedType: 'email',
        reason: 'Email fields should use email input type for better validation and mobile keyboard',
        confidence: 0.95
      }
    }

    // Phone field recommendations
    if (name.includes('phone') && currentType !== 'tel') {
      return {
        fieldName: field.name,
        currentType,
        suggestedType: 'tel',
        reason: 'Phone fields should use tel input type for better mobile experience',
        confidence: 0.9
      }
    }

    // Date field recommendations
    if (name.includes('date') && !['date', 'datetime-local'].includes(currentType)) {
      return {
        fieldName: field.name,
        currentType,
        suggestedType: 'date',
        reason: 'Date fields should use date input type for better UX',
        confidence: 0.85
      }
    }

    // Number field recommendations
    if (name.includes('age') || name.includes('quantity') || name.includes('amount')) {
      if (currentType !== 'number') {
        return {
          fieldName: field.name,
          currentType,
          suggestedType: 'number',
          reason: 'Numeric fields should use number input type',
          confidence: 0.8
        }
      }
    }

    return null
  }

  private generateCacheKey(): string {
    const fieldsHash = this.context.fields
      .map(f => `${f.name}-${f.type}-${f.required}`)
      .join('|')
    return `${this.context.name}-${fieldsHash}`
  }
}

/**
 * Utility functions for AI form building
 */
export const AIFormUtils = {
  /**
   * Generate a form based on a description
   */
  async generateFormFromDescription(description: string): Promise<Partial<FormContext>> {
    // This would typically call an AI service
    // For now, we'll return a basic structure based on keywords
    
    const context: Partial<FormContext> = {
      title: 'Generated Form',
      description,
      fields: []
    }

    // Simple keyword-based field generation
    if (description.toLowerCase().includes('contact')) {
      context.fields = [
        { id: '1', name: 'name', label: 'Full Name', type: 'text', required: true },
        { id: '2', name: 'email', label: 'Email Address', type: 'email', required: true },
        { id: '3', name: 'phone', label: 'Phone Number', type: 'tel', required: false },
        { id: '4', name: 'message', label: 'Message', type: 'textarea', required: true }
      ]
    }

    return context
  },

  /**
   * Validate form configuration
   */
  validateFormConfig(context: FormContext): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!context.name) errors.push('Form name is required')
    if (!context.title) errors.push('Form title is required')
    if (context.fields.length === 0) errors.push('At least one field is required')

    // Validate field names are unique
    const fieldNames = context.fields.map(f => f.name)
    const uniqueNames = new Set(fieldNames)
    if (fieldNames.length !== uniqueNames.size) {
      errors.push('Field names must be unique')
    }

    // Validate required fields have labels
    const requiredFieldsWithoutLabels = context.fields.filter(f => f.required && !f.label)
    if (requiredFieldsWithoutLabels.length > 0) {
      errors.push('Required fields must have labels')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}
