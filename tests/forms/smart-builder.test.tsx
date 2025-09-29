/**
 * @fileoverview Smart Form Builder Tests - HT-031.1.3
 * @module tests/forms/smart-builder
 * @author Hero Tasks System
 * @version 1.0.0
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SmartFormBuilder } from '@/components/forms/smart-builder'
import { AIFormBuilder } from '@/lib/forms/ai-builder'
import { DynamicFormGenerator } from '@/lib/forms/dynamic-generator'

// Mock the AI and dynamic form modules
jest.mock('@/lib/forms/ai-builder')
jest.mock('@/lib/forms/dynamic-generator')

const mockFormContext = {
  name: 'test-form',
  title: 'Test Form',
  description: 'A test form for validation',
  fields: [
    {
      id: '1',
      name: 'name',
      label: 'Full Name',
      type: 'text',
      required: true,
      placeholder: 'Enter your name'
    },
    {
      id: '2',
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      placeholder: 'your@email.com'
    }
  ]
}

const mockAnalysis = {
  completeness: 85,
  usability: 90,
  accessibility: 75,
  performance: 95,
  suggestions: [
    {
      id: 'test-suggestion',
      type: 'accessibility' as const,
      title: 'Add Field Labels',
      description: 'Improve accessibility with better labels',
      confidence: 0.9,
      impact: 'high' as const,
      implementation: {
        action: 'Add descriptive labels',
        details: 'Labels improve screen reader support'
      }
    }
  ],
  recommendations: [
    'Consider adding a phone number field',
    'Add form validation for better UX'
  ]
}

describe('SmartFormBuilder', () => {
  const mockOnSuggestionApply = jest.fn()
  const mockOnFormGenerated = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock AIFormBuilder methods
    ;(AIFormBuilder as jest.MockedClass<typeof AIFormBuilder>).mockImplementation(() => ({
      analyzeForm: jest.fn().mockResolvedValue(mockAnalysis),
      generateFormSuggestions: jest.fn().mockResolvedValue(mockAnalysis.suggestions),
      getFieldTypeRecommendations: jest.fn().mockResolvedValue([]),
      optimizeFieldOrder: jest.fn().mockResolvedValue(['1', '2']),
      generateValidationRules: jest.fn().mockResolvedValue({}),
      getAccessibilitySuggestions: jest.fn().mockResolvedValue([])
    }) as any)
  })

  it('renders the AI Form Assistant interface', () => {
    render(
      <SmartFormBuilder
        formContext={mockFormContext}
        onSuggestionApply={mockOnSuggestionApply}
        onFormGenerated={mockOnFormGenerated}
      />
    )

    expect(screen.getByText('AI Form Assistant')).toBeInTheDocument()
    expect(screen.getByText('Intelligent analysis and suggestions for your form')).toBeInTheDocument()
  })

  it('displays form analysis scores', async () => {
    render(
      <SmartFormBuilder
        formContext={mockFormContext}
        onSuggestionApply={mockOnSuggestionApply}
        onFormGenerated={mockOnFormGenerated}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Completeness')).toBeInTheDocument()
      expect(screen.getByText('85%')).toBeInTheDocument()
      expect(screen.getByText('Usability')).toBeInTheDocument()
      expect(screen.getByText('90%')).toBeInTheDocument()
      expect(screen.getByText('Accessibility')).toBeInTheDocument()
      expect(screen.getByText('75%')).toBeInTheDocument()
      expect(screen.getByText('Performance')).toBeInTheDocument()
      expect(screen.getByText('95%')).toBeInTheDocument()
    })
  })

  it('displays general recommendations', async () => {
    render(
      <SmartFormBuilder
        formContext={mockFormContext}
        onSuggestionApply={mockOnSuggestionApply}
        onFormGenerated={mockOnFormGenerated}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('General Recommendations')).toBeInTheDocument()
      expect(screen.getByText('Consider adding a phone number field')).toBeInTheDocument()
      expect(screen.getByText('Add form validation for better UX')).toBeInTheDocument()
    })
  })

  it('displays categorized suggestions', async () => {
    render(
      <SmartFormBuilder
        formContext={mockFormContext}
        onSuggestionApply={mockOnSuggestionApply}
        onFormGenerated={mockOnFormGenerated}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Smart Suggestions')).toBeInTheDocument()
      expect(screen.getByText('Accessibility')).toBeInTheDocument()
      expect(screen.getByText('Add Field Labels')).toBeInTheDocument()
      expect(screen.getByText('high impact')).toBeInTheDocument()
      expect(screen.getByText('90% confidence')).toBeInTheDocument()
    })
  })

  it('applies suggestions when apply button is clicked', async () => {
    render(
      <SmartFormBuilder
        formContext={mockFormContext}
        onSuggestionApply={mockOnSuggestionApply}
        onFormGenerated={mockOnFormGenerated}
      />
    )

    await waitFor(() => {
      const applyButton = screen.getByText('Apply')
      fireEvent.click(applyButton)
    })

    expect(mockOnSuggestionApply).toHaveBeenCalledWith(mockAnalysis.suggestions[0])
  })

  it('shows applied state after suggestion is applied', async () => {
    render(
      <SmartFormBuilder
        formContext={mockFormContext}
        onSuggestionApply={mockOnSuggestionApply}
        onFormGenerated={mockOnFormGenerated}
      />
    )

    await waitFor(() => {
      const applyButton = screen.getByText('Apply')
      fireEvent.click(applyButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Applied')).toBeInTheDocument()
      expect(screen.queryByText('Apply')).not.toBeInTheDocument()
    })
  })

  it('displays quick templates tab', async () => {
    render(
      <SmartFormBuilder
        formContext={mockFormContext}
        onSuggestionApply={mockOnSuggestionApply}
        onFormGenerated={mockOnFormGenerated}
      />
    )

    await waitFor(() => {
      const templatesTab = screen.getByText('Quick Templates')
      fireEvent.click(templatesTab)
    })

    expect(screen.getByText('Quick Form Templates')).toBeInTheDocument()
    expect(screen.getByText('Contact Form Pattern')).toBeInTheDocument()
    expect(screen.getByText('Registration Pattern')).toBeInTheDocument()
    expect(screen.getByText('Feedback Pattern')).toBeInTheDocument()
    expect(screen.getByText('Survey Pattern')).toBeInTheDocument()
  })

  it('displays optimization tab', async () => {
    render(
      <SmartFormBuilder
        formContext={mockFormContext}
        onSuggestionApply={mockOnSuggestionApply}
        onFormGenerated={mockOnFormGenerated}
      />
    )

    await waitFor(() => {
      const optimizeTab = screen.getByText('Optimize')
      fireEvent.click(optimizeTab)
    })

    expect(screen.getByText('Form Optimization')).toBeInTheDocument()
    expect(screen.getByText('Performance Optimization')).toBeInTheDocument()
    expect(screen.getByText('Accessibility Enhancement')).toBeInTheDocument()
    expect(screen.getByText('UX Optimization')).toBeInTheDocument()
    expect(screen.getByText('Mobile Optimization')).toBeInTheDocument()
  })

  it('shows re-analyze button and handles re-analysis', async () => {
    render(
      <SmartFormBuilder
        formContext={mockFormContext}
        onSuggestionApply={mockOnSuggestionApply}
        onFormGenerated={mockOnFormGenerated}
      />
    )

    await waitFor(() => {
      const reAnalyzeButton = screen.getByText('Re-analyze')
      fireEvent.click(reAnalyzeButton)
    })

    expect(screen.getByText('Analyzing...')).toBeInTheDocument()
  })

  it('handles empty suggestions gracefully', async () => {
    const emptyAnalysis = {
      ...mockAnalysis,
      suggestions: [],
      recommendations: []
    }

    ;(AIFormBuilder as jest.MockedClass<typeof AIFormBuilder>).mockImplementation(() => ({
      analyzeForm: jest.fn().mockResolvedValue(emptyAnalysis),
      generateFormSuggestions: jest.fn().mockResolvedValue([]),
      getFieldTypeRecommendations: jest.fn().mockResolvedValue([]),
      optimizeFieldOrder: jest.fn().mockResolvedValue(['1', '2']),
      generateValidationRules: jest.fn().mockResolvedValue({}),
      getAccessibilitySuggestions: jest.fn().mockResolvedValue([])
    }) as any)

    render(
      <SmartFormBuilder
        formContext={mockFormContext}
        onSuggestionApply={mockOnSuggestionApply}
        onFormGenerated={mockOnFormGenerated}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Great Form!')).toBeInTheDocument()
      expect(screen.getByText('No suggestions available. Your form looks well-optimized!')).toBeInTheDocument()
    })
  })

  it('shows appropriate score colors based on values', async () => {
    render(
      <SmartFormBuilder
        formContext={mockFormContext}
        onSuggestionApply={mockOnSuggestionApply}
        onFormGenerated={mockOnFormGenerated}
      />
    )

    await waitFor(() => {
      // High scores should be green
      const completenessScore = screen.getByText('85%')
      expect(completenessScore).toHaveClass('text-green-600')

      // Low scores should be red
      const accessibilityScore = screen.getByText('75%')
      expect(accessibilityScore).toHaveClass('text-yellow-600')
    })
  })
})

describe('AIFormBuilder Integration', () => {
  it('creates AIFormBuilder with correct context', () => {
    const builder = new AIFormBuilder(mockFormContext)
    expect(builder).toBeInstanceOf(AIFormBuilder)
  })

  it('analyzes form and returns correct structure', async () => {
    const builder = new AIFormBuilder(mockFormContext)
    const analysis = await builder.analyzeForm()

    expect(analysis).toHaveProperty('completeness')
    expect(analysis).toHaveProperty('usability')
    expect(analysis).toHaveProperty('accessibility')
    expect(analysis).toHaveProperty('performance')
    expect(analysis).toHaveProperty('suggestions')
    expect(analysis).toHaveProperty('recommendations')
  })

  it('generates field type recommendations', async () => {
    const builder = new AIFormBuilder(mockFormContext)
    const recommendations = await builder.getFieldTypeRecommendations()

    expect(Array.isArray(recommendations)).toBe(true)
  })

  it('optimizes field ordering', async () => {
    const builder = new AIFormBuilder(mockFormContext)
    const optimizedOrder = await builder.optimizeFieldOrder()

    expect(Array.isArray(optimizedOrder)).toBe(true)
    expect(optimizedOrder).toContain('1')
    expect(optimizedOrder).toContain('2')
  })
})

describe('DynamicFormGenerator Integration', () => {
  const mockConfig = {
    id: 'test-form',
    name: 'test-form',
    title: 'Test Form',
    description: 'A test form',
    fields: [
      {
        id: '1',
        name: 'name',
        label: 'Name',
        type: 'text',
        required: true
      }
    ],
    layout: 'stack' as const,
    validation: 'both' as const,
    submission: { method: 'POST' as const },
    features: {
      autoSave: true,
      progressBar: true,
      realTimeValidation: true
    }
  }

  it('generates form from configuration', async () => {
    const generator = new DynamicFormGenerator(mockConfig)
    const output = await generator.generateForm()

    expect(output).toHaveProperty('schema')
    expect(output).toHaveProperty('component')
    expect(output).toHaveProperty('types')
    expect(output).toHaveProperty('validation')
    expect(output).toHaveProperty('hooks')
    expect(output).toHaveProperty('styles')
    expect(output).toHaveProperty('config')
  })

  it('generates form from template', async () => {
    const output = await DynamicFormGenerator.generateFromTemplate('contact')

    expect(output).toHaveProperty('schema')
    expect(output).toHaveProperty('component')
  })

  it('generates form from description', async () => {
    const output = await DynamicFormGenerator.generateFromDescription('contact form with name and email')

    expect(output).toHaveProperty('schema')
    expect(output).toHaveProperty('component')
  })
})
