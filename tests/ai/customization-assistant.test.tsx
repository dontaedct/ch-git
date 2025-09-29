/**
 * @fileoverview AI Customization Assistant Tests - HT-031.1.4
 * @module tests/ai/customization-assistant
 * @author Hero Tasks System
 * @version 1.0.0
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CustomizationAssistant } from '@/components/ai/customization-assistant'
import { BrandIntelligence } from '@/lib/ai/brand-intelligence'
import { ThemeGenerator } from '@/lib/ai/theme-generator'

// Mock the AI libraries
jest.mock('@/lib/ai/brand-intelligence')
jest.mock('@/lib/ai/theme-generator')

const mockBrandProfile = {
  name: 'TestCorp',
  industry: 'Technology',
  values: ['Innovation', 'Quality', 'Trust'],
  targetAudience: 'Tech professionals and developers',
  personality: ['Modern', 'Professional', 'Friendly'],
  colorPreferences: []
}

const mockCustomizationRequest = {
  type: 'theme' as const,
  description: 'Create a modern, professional theme for our tech company',
  context: 'We want something that appeals to developers and tech professionals'
}

const mockBrandAnalysis = {
  brandStrength: 85,
  marketPosition: 'leader' as const,
  competitiveAdvantage: ['Innovation leadership', 'Professional credibility'],
  weaknesses: ['Limited brand value definition'],
  opportunities: ['Leverage modern design trends', 'Build community-driven experiences'],
  threats: ['Rapid technological change'],
  recommendations: [
    {
      id: 'rec-1',
      type: 'visual' as const,
      title: 'Develop Visual Identity',
      description: 'Create a cohesive visual identity system',
      priority: 'high' as const,
      impact: 'high' as const,
      effort: 'medium' as const,
      reasoning: ['Visual identity improves brand recognition'],
      implementation: ['Design logo', 'Define colors', 'Select typography']
    }
  ],
  customizationInsights: [
    {
      id: 'insight-1',
      category: 'colors' as const,
      insight: 'Blue color palettes work well for tech companies',
      confidence: 0.9,
      reasoning: 'Blue conveys trust and reliability',
      suggestions: ['Use blue as primary color', 'Ensure good contrast ratios']
    }
  ]
}

const mockGeneratedTheme = {
  id: 'theme-1',
  name: 'Modern Tech Theme',
  description: 'A modern theme for technology companies',
  confidence: 0.85,
  colors: {
    primary: {
      base: '#3B82F6',
      50: '#EFF6FF',
      100: '#DBEAFE',
      500: '#3B82F6',
      900: '#1E3A8A'
    },
    secondary: {
      base: '#6B7280',
      50: '#F9FAFB',
      500: '#6B7280',
      900: '#111827'
    },
    accent: {
      base: '#F59E0B'
    },
    neutral: {
      base: '#6B7280'
    },
    semantic: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6'
    },
    background: {
      primary: '#FFFFFF',
      secondary: '#F9FAFB',
      tertiary: '#F3F4F6'
    },
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      tertiary: '#9CA3AF',
      inverse: '#FFFFFF'
    }
  },
  typography: {
    fontFamily: {
      heading: 'Inter, sans-serif',
      body: 'Inter, sans-serif',
      mono: 'JetBrains Mono, monospace'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      normal: 1.5
    },
    letterSpacing: {
      normal: '0em'
    }
  },
  spacing: {
    1: '0.25rem',
    2: '0.5rem',
    4: '1rem',
    8: '2rem'
  },
  borderRadius: {
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem'
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
  },
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms'
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    transitions: {
      all: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)'
    }
  },
  layout: {
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px'
    },
    container: {
      center: true,
      padding: '1rem'
    },
    grid: {
      columns: 12,
      gap: '1rem'
    }
  },
  reasoning: [
    'Blue color palette chosen for trust and innovation',
    'Inter font family for modern, readable typography',
    'Clean design reflects professional brand personality'
  ],
  usage: {
    primary: ['Buttons', 'Links', 'Brand elements'],
    secondary: ['Secondary actions', 'Accent elements'],
    accent: ['Call-to-action buttons'],
    neutral: ['Text', 'Borders', 'Backgrounds'],
    semantic: ['Success messages', 'Warning alerts']
  },
  accessibility: {
    contrastRatios: {
      primary: 4.5,
      secondary: 4.2,
      accent: 4.8,
      text: 7.1
    },
    wcagCompliance: 'AA' as const,
    colorBlindSafe: true,
    recommendations: ['All colors meet WCAG AA standards']
  },
  preview: {
    components: {
      button: {
        styles: {
          primary: 'bg-blue-600 text-white'
        },
        variants: {}
      },
      card: {
        styles: {
          base: 'bg-white rounded-lg shadow-md'
        },
        variants: {}
      },
      input: {
        styles: {
          base: 'border border-gray-300 rounded-md'
        },
        variants: {}
      },
      navigation: {
        styles: {
          base: 'bg-white border-b'
        },
        variants: {}
      }
    },
    layouts: {
      landing: {
        structure: ['Header', 'Hero', 'Features'],
        styles: {}
      },
      dashboard: {
        structure: ['Sidebar', 'Header', 'Main'],
        styles: {}
      },
      form: {
        structure: ['Header', 'Form', 'Footer'],
        styles: {}
      }
    }
  }
}

describe('CustomizationAssistant', () => {
  const mockOnSuggestionApply = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock BrandIntelligence methods
    ;(BrandIntelligence as jest.MockedClass<typeof BrandIntelligence>).mockImplementation(() => ({
      analyzeBrand: jest.fn().mockResolvedValue(mockBrandAnalysis),
      analyzeCompetitors: jest.fn().mockResolvedValue({}),
      getBrandTrends: jest.fn().mockResolvedValue([]),
      generateColorRecommendations: jest.fn().mockResolvedValue([]),
      generateTypographyRecommendations: jest.fn().mockResolvedValue([]),
      generateContentRecommendations: jest.fn().mockResolvedValue([]),
      generateUXRecommendations: jest.fn().mockResolvedValue([])
    }) as any)

    // Mock ThemeGenerator methods
    ;(ThemeGenerator as jest.MockedClass<typeof ThemeGenerator>).mockImplementation(() => ({
      generateTheme: jest.fn().mockResolvedValue(mockGeneratedTheme),
      generateThemeVariations: jest.fn().mockResolvedValue([mockGeneratedTheme]),
      generateFromExistingAssets: jest.fn().mockResolvedValue(mockGeneratedTheme),
      optimizeForUseCase: jest.fn().mockResolvedValue(mockGeneratedTheme),
      generateTokens: jest.fn().mockResolvedValue('{}')
    }) as any)
  })

  it('renders the AI Customization Assistant interface', () => {
    render(
      <CustomizationAssistant
        brandProfile={mockBrandProfile}
        customizationRequest={mockCustomizationRequest}
        onSuggestionApply={mockOnSuggestionApply}
      />
    )

    expect(screen.getByText('AI Customization Assistant')).toBeInTheDocument()
    expect(screen.getByText('Intelligent suggestions and insights for your brand customization')).toBeInTheDocument()
  })

  it('displays brand analysis metrics', async () => {
    render(
      <CustomizationAssistant
        brandProfile={mockBrandProfile}
        customizationRequest={mockCustomizationRequest}
        onSuggestionApply={mockOnSuggestionApply}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Brand Strength')).toBeInTheDocument()
      expect(screen.getByText('85%')).toBeInTheDocument()
      expect(screen.getByText('Market Position')).toBeInTheDocument()
      expect(screen.getByText('Leader')).toBeInTheDocument()
      expect(screen.getByText('Opportunities')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('Recommendations')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })

  it('shows suggestions tab with AI-generated suggestions', async () => {
    render(
      <CustomizationAssistant
        brandProfile={mockBrandProfile}
        customizationRequest={mockCustomizationRequest}
        onSuggestionApply={mockOnSuggestionApply}
      />
    )

    await waitFor(() => {
      const suggestionsTab = screen.getByText('Suggestions')
      fireEvent.click(suggestionsTab)
    })

    await waitFor(() => {
      expect(screen.getByText('Create Brand Assets')).toBeInTheDocument()
      expect(screen.getByText('high impact')).toBeInTheDocument()
      expect(screen.getByText('medium effort')).toBeInTheDocument()
      expect(screen.getByText('90% confidence')).toBeInTheDocument()
    })
  })

  it('applies suggestions when apply button is clicked', async () => {
    render(
      <CustomizationAssistant
        brandProfile={mockBrandProfile}
        customizationRequest={mockCustomizationRequest}
        onSuggestionApply={mockOnSuggestionApply}
      />
    )

    await waitFor(() => {
      const applyButton = screen.getByText('Apply')
      fireEvent.click(applyButton)
    })

    expect(mockOnSuggestionApply).toHaveBeenCalled()
  })

  it('shows applied state after suggestion is applied', async () => {
    render(
      <CustomizationAssistant
        brandProfile={mockBrandProfile}
        customizationRequest={mockCustomizationRequest}
        onSuggestionApply={mockOnSuggestionApply}
      />
    )

    await waitFor(() => {
      const applyButton = screen.getByText('Apply')
      fireEvent.click(applyButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Applied')).toBeInTheDocument()
    })
  })

  it('displays insights tab with AI-generated insights', async () => {
    render(
      <CustomizationAssistant
        brandProfile={mockBrandProfile}
        customizationRequest={mockCustomizationRequest}
        onSuggestionApply={mockOnSuggestionApply}
      />
    )

    await waitFor(() => {
      const insightsTab = screen.getByText('Insights')
      fireEvent.click(insightsTab)
    })

    await waitFor(() => {
      expect(screen.getByText('Technology Industry Trends')).toBeInTheDocument()
      expect(screen.getByText('85% confidence')).toBeInTheDocument()
      expect(screen.getByText('Industry Analysis 2025')).toBeInTheDocument()
    })
  })

  it('displays themes tab with generated theme variations', async () => {
    render(
      <CustomizationAssistant
        brandProfile={mockBrandProfile}
        customizationRequest={mockCustomizationRequest}
        onSuggestionApply={mockOnSuggestionApply}
      />
    )

    await waitFor(() => {
      const themesTab = screen.getByText('Themes')
      fireEvent.click(themesTab)
    })

    await waitFor(() => {
      expect(screen.getByText('Modern Tech Theme')).toBeInTheDocument()
      expect(screen.getByText('85% confidence')).toBeInTheDocument()
      expect(screen.getByText('Inter, sans-serif')).toBeInTheDocument()
    })
  })

  it('displays recommendations tab with brand recommendations', async () => {
    render(
      <CustomizationAssistant
        brandProfile={mockBrandProfile}
        customizationRequest={mockCustomizationRequest}
        onSuggestionApply={mockOnSuggestionApply}
      />
    )

    await waitFor(() => {
      const recommendationsTab = screen.getByText('Recommendations')
      fireEvent.click(recommendationsTab)
    })

    await waitFor(() => {
      expect(screen.getByText('Develop Visual Identity')).toBeInTheDocument()
      expect(screen.getByText('Create a cohesive visual identity system')).toBeInTheDocument()
      expect(screen.getByText('Implement')).toBeInTheDocument()
    })
  })

  it('handles re-analysis when re-analyze button is clicked', async () => {
    render(
      <CustomizationAssistant
        brandProfile={mockBrandProfile}
        customizationRequest={mockCustomizationRequest}
        onSuggestionApply={mockOnSuggestionApply}
      />
    )

    await waitFor(() => {
      const reAnalyzeButton = screen.getByText('Re-analyze')
      fireEvent.click(reAnalyzeButton)
    })

    expect(screen.getByText('Analyzing...')).toBeInTheDocument()
  })

  it('generates theme variations when generate themes button is clicked', async () => {
    render(
      <CustomizationAssistant
        brandProfile={mockBrandProfile}
        customizationRequest={mockCustomizationRequest}
        onSuggestionApply={mockOnSuggestionApply}
      />
    )

    await waitFor(() => {
      const generateButton = screen.getByText('Generate Themes')
      fireEvent.click(generateButton)
    })

    expect(screen.getByText('Generating...')).toBeInTheDocument()
  })

  it('shows appropriate impact and effort colors', async () => {
    render(
      <CustomizationAssistant
        brandProfile={mockBrandProfile}
        customizationRequest={mockCustomizationRequest}
        onSuggestionApply={mockOnSuggestionApply}
      />
    )

    await waitFor(() => {
      // High impact should be red
      const highImpactBadge = screen.getByText('high impact')
      expect(highImpactBadge).toHaveClass('text-red-600')

      // Medium effort should be yellow
      const mediumEffortBadge = screen.getByText('medium effort')
      expect(mediumEffortBadge).toHaveClass('text-yellow-600')
    })
  })

  it('handles empty brand profile gracefully', () => {
    const emptyBrandProfile = {
      name: '',
      industry: '',
      values: [],
      targetAudience: '',
      personality: [],
      colorPreferences: []
    }

    render(
      <CustomizationAssistant
        brandProfile={emptyBrandProfile}
        customizationRequest={mockCustomizationRequest}
        onSuggestionApply={mockOnSuggestionApply}
      />
    )

    expect(screen.getByText('AI Customization Assistant')).toBeInTheDocument()
  })
})

describe('BrandIntelligence Integration', () => {
  it('creates BrandIntelligence with correct brand profile', () => {
    const brandIntelligence = new BrandIntelligence(mockBrandProfile)
    expect(brandIntelligence).toBeInstanceOf(BrandIntelligence)
  })

  it('analyzes brand and returns correct structure', async () => {
    const brandIntelligence = new BrandIntelligence(mockBrandProfile)
    const analysis = await brandIntelligence.analyzeBrand()

    expect(analysis).toHaveProperty('brandStrength')
    expect(analysis).toHaveProperty('marketPosition')
    expect(analysis).toHaveProperty('competitiveAdvantage')
    expect(analysis).toHaveProperty('weaknesses')
    expect(analysis).toHaveProperty('opportunities')
    expect(analysis).toHaveProperty('threats')
    expect(analysis).toHaveProperty('recommendations')
    expect(analysis).toHaveProperty('customizationInsights')
  })

  it('generates color recommendations', async () => {
    const brandIntelligence = new BrandIntelligence(mockBrandProfile)
    const recommendations = await brandIntelligence.generateColorRecommendations()

    expect(Array.isArray(recommendations)).toBe(true)
  })

  it('analyzes competitors', async () => {
    const brandIntelligence = new BrandIntelligence(mockBrandProfile)
    const competitorAnalysis = await brandIntelligence.analyzeCompetitors()

    expect(competitorAnalysis).toHaveProperty('competitors')
    expect(competitorAnalysis).toHaveProperty('marketGaps')
    expect(competitorAnalysis).toHaveProperty('differentiationOpportunities')
    expect(competitorAnalysis).toHaveProperty('benchmarkMetrics')
  })
})

describe('ThemeGenerator Integration', () => {
  const mockThemeRequest: any = {
    brandProfile: mockBrandProfile,
    customizationRequest: mockCustomizationRequest,
    constraints: {
      accessibility: true,
      industryStandards: true
    }
  }

  it('generates theme from request', async () => {
    const themeGenerator = new ThemeGenerator(mockThemeRequest)
    const theme = await themeGenerator.generateTheme()

    expect(theme).toHaveProperty('id')
    expect(theme).toHaveProperty('name')
    expect(theme).toHaveProperty('description')
    expect(theme).toHaveProperty('confidence')
    expect(theme).toHaveProperty('colors')
    expect(theme).toHaveProperty('typography')
    expect(theme).toHaveProperty('reasoning')
    expect(theme).toHaveProperty('accessibility')
  })

  it('generates theme variations', async () => {
    const themeGenerator = new ThemeGenerator(mockThemeRequest)
    const variations = await themeGenerator.generateThemeVariations(3)

    expect(Array.isArray(variations)).toBe(true)
    expect(variations).toHaveLength(3)
  })

  it('generates tokens in different formats', async () => {
    const themeGenerator = new ThemeGenerator(mockThemeRequest)
    
    const cssTokens = await themeGenerator.generateTokens('css')
    const jsonTokens = await themeGenerator.generateTokens('json')
    const jsTokens = await themeGenerator.generateTokens('js')

    expect(typeof cssTokens).toBe('string')
    expect(typeof jsonTokens).toBe('string')
    expect(typeof jsTokens).toBe('string')
  })

  it('optimizes theme for specific use cases', async () => {
    const themeGenerator = new ThemeGenerator(mockThemeRequest)
    
    const mobileTheme = await themeGenerator.optimizeForUseCase('mobile')
    const accessibilityTheme = await themeGenerator.optimizeForUseCase('accessibility')

    expect(mobileTheme).toHaveProperty('spacing')
    expect(accessibilityTheme).toHaveProperty('colors')
  })
})
