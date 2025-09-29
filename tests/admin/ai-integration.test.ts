/**
 * @fileoverview HT-032.4.2: AI Integration Testing with HT-031 Systems
 * @module tests/admin/ai-integration
 * @author OSS Hero System
 * @version 1.0.0
 * @description Comprehensive testing suite for AI integration between HT-032 modular admin interface
 * and HT-031 AI-powered systems, covering template intelligence, recommendations, and optimization.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AIRecommendations } from '@/components/admin/ai-recommendations';
import { AISettingsAssistant } from '@/components/admin/ai-settings-assistant';
import { SmartConfiguration } from '@/components/admin/smart-configuration';
import { PersonalizedInterface } from '@/components/admin/personalized-interface';
import { IntelligentNavigation } from '@/components/admin/intelligent-navigation';
import { templateDiscovery } from '@/lib/ai/template-discovery';
import { templateRecommendations } from '@/lib/ai/template-recommendations';
import { templateAnalyzer } from '@/lib/ai/template-analyzer';
import { settingsGenerator } from '@/lib/ai/settings-generator';
import { configurationOptimizer } from '@/lib/ai/configuration-optimizer';
import { settingsAnalyzer } from '@/lib/ai/settings-analyzer';
import { userExperienceOptimizer } from '@/lib/ai/user-experience-optimizer';
import { interfacePersonalization } from '@/lib/ai/interface-personalization';
import { userBehaviorAnalyzer } from '@/lib/ai/user-behavior-analyzer';

// Mock HT-031 AI systems
vi.mock('@/lib/ai/template-discovery', () => ({
  templateDiscovery: {
    discoverTemplates: vi.fn(() => Promise.resolve([])),
    analyzeRequirements: vi.fn(() => Promise.resolve({})),
    getRecommendations: vi.fn(() => Promise.resolve([])),
    searchSemantic: vi.fn(() => Promise.resolve([])),
    subscribe: vi.fn(() => vi.fn()),
  },
}));

vi.mock('@/lib/ai/template-recommendations', () => ({
  templateRecommendations: {
    generateRecommendations: vi.fn(() => Promise.resolve([])),
    analyzeUsage: vi.fn(() => Promise.resolve({})),
    getPersonalized: vi.fn(() => Promise.resolve([])),
    updatePreferences: vi.fn(() => Promise.resolve(true)),
    subscribe: vi.fn(() => vi.fn()),
  },
}));

vi.mock('@/lib/ai/template-analyzer', () => ({
  templateAnalyzer: {
    analyze: vi.fn(() => Promise.resolve({})),
    getComplexity: vi.fn(() => Promise.resolve(0.5)),
    getSimilarity: vi.fn(() => Promise.resolve(0.8)),
    getOptimizations: vi.fn(() => Promise.resolve([])),
    subscribe: vi.fn(() => vi.fn()),
  },
}));

vi.mock('@/lib/ai/settings-generator', () => ({
  settingsGenerator: {
    generateSettings: vi.fn(() => Promise.resolve({})),
    optimizeConfiguration: vi.fn(() => Promise.resolve({})),
    validateSettings: vi.fn(() => Promise.resolve({ isValid: true, suggestions: [] })),
    getDefaults: vi.fn(() => Promise.resolve({})),
    subscribe: vi.fn(() => vi.fn()),
  },
}));

vi.mock('@/lib/ai/configuration-optimizer', () => ({
  configurationOptimizer: {
    optimize: vi.fn(() => Promise.resolve({})),
    analyzePerformance: vi.fn(() => Promise.resolve({})),
    getSuggestions: vi.fn(() => Promise.resolve([])),
    applyOptimizations: vi.fn(() => Promise.resolve(true)),
    subscribe: vi.fn(() => vi.fn()),
  },
}));

vi.mock('@/lib/ai/settings-analyzer', () => ({
  settingsAnalyzer: {
    analyze: vi.fn(() => Promise.resolve({})),
    getInsights: vi.fn(() => Promise.resolve([])),
    detectPatterns: vi.fn(() => Promise.resolve([])),
    getRecommendations: vi.fn(() => Promise.resolve([])),
    subscribe: vi.fn(() => vi.fn()),
  },
}));

vi.mock('@/lib/ai/user-experience-optimizer', () => ({
  userExperienceOptimizer: {
    optimize: vi.fn(() => Promise.resolve({})),
    analyzeUserFlow: vi.fn(() => Promise.resolve({})),
    getOptimizations: vi.fn(() => Promise.resolve([])),
    applyOptimizations: vi.fn(() => Promise.resolve(true)),
    subscribe: vi.fn(() => vi.fn()),
  },
}));

vi.mock('@/lib/ai/interface-personalization', () => ({
  interfacePersonalization: {
    personalize: vi.fn(() => Promise.resolve({})),
    getPersonalization: vi.fn(() => Promise.resolve({})),
    updatePreferences: vi.fn(() => Promise.resolve(true)),
    resetPersonalization: vi.fn(() => Promise.resolve(true)),
    subscribe: vi.fn(() => vi.fn()),
  },
}));

vi.mock('@/lib/ai/user-behavior-analyzer', () => ({
  userBehaviorAnalyzer: {
    analyze: vi.fn(() => Promise.resolve({})),
    getPatterns: vi.fn(() => Promise.resolve([])),
    getPredictions: vi.fn(() => Promise.resolve([])),
    trackInteraction: vi.fn(() => Promise.resolve(true)),
    subscribe: vi.fn(() => vi.fn()),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

describe('HT-032.4.2: AI Integration Testing with HT-031 Systems', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('AI-Powered Template Discovery Integration', () => {
    const mockDiscoveredTemplates = [
      {
        id: 'ai-template-1',
        name: 'AI-Recommended E-commerce',
        confidence: 0.92,
        reasoning: 'Matches your business requirements and user patterns',
        features: ['payment-integration', 'inventory-management', 'analytics'],
        compatibility: 0.95,
      },
      {
        id: 'ai-template-2',
        name: 'Smart Blog Template',
        confidence: 0.87,
        reasoning: 'Optimized for your content strategy and SEO needs',
        features: ['seo-optimization', 'content-management', 'social-sharing'],
        compatibility: 0.88,
      },
    ];

    beforeEach(() => {
      (templateDiscovery.discoverTemplates as any).mockResolvedValue(mockDiscoveredTemplates);
      (templateDiscovery.getRecommendations as any).mockResolvedValue(mockDiscoveredTemplates);
    });

    it('should display AI-discovered templates with confidence scores', async () => {
      render(<AIRecommendations userId="test-user" />);

      await waitFor(() => {
        expect(screen.getByText('AI-Recommended E-commerce')).toBeInTheDocument();
        expect(screen.getByText('Smart Blog Template')).toBeInTheDocument();
        expect(screen.getByText('92% confidence')).toBeInTheDocument();
        expect(screen.getByText('87% confidence')).toBeInTheDocument();
      });
    });

    it('should show AI reasoning for template recommendations', async () => {
      render(<AIRecommendations userId="test-user" />);

      await waitFor(() => {
        expect(screen.getByText('Matches your business requirements and user patterns')).toBeInTheDocument();
        expect(screen.getByText('Optimized for your content strategy and SEO needs')).toBeInTheDocument();
      });
    });

    it('should allow semantic search with AI understanding', async () => {
      const user = userEvent.setup();
      const mockSemanticSearch = vi.fn().mockResolvedValue([mockDiscoveredTemplates[0]]);
      (templateDiscovery.searchSemantic as any).mockImplementation(mockSemanticSearch);

      render(<AIRecommendations userId="test-user" />);

      const searchInput = screen.getByPlaceholderText('Describe what you need...');
      await user.type(searchInput, 'I need an online store with payment processing');

      expect(mockSemanticSearch).toHaveBeenCalledWith('I need an online store with payment processing');

      await waitFor(() => {
        expect(screen.getByText('AI-Recommended E-commerce')).toBeInTheDocument();
      });
    });

    it('should analyze user requirements and provide contextual recommendations', async () => {
      const mockAnalysis = {
        businessType: 'e-commerce',
        complexity: 'medium',
        features: ['payments', 'inventory'],
        timeline: 'urgent',
      };
      (templateDiscovery.analyzeRequirements as any).mockResolvedValue(mockAnalysis);

      render(<AIRecommendations userId="test-user" />);

      const analyzeButton = screen.getByRole('button', { name: /analyze requirements/i });
      await fireEvent.click(analyzeButton);

      await waitFor(() => {
        expect(templateDiscovery.analyzeRequirements).toHaveBeenCalled();
        expect(screen.getByText('Business Type: e-commerce')).toBeInTheDocument();
        expect(screen.getByText('Complexity: medium')).toBeInTheDocument();
      });
    });

    it('should update recommendations based on user feedback', async () => {
      const user = userEvent.setup();
      const mockUpdatePreferences = vi.fn().mockResolvedValue(true);
      (templateRecommendations.updatePreferences as any).mockImplementation(mockUpdatePreferences);

      render(<AIRecommendations userId="test-user" />);

      await waitFor(() => {
        const likeButton = screen.getAllByRole('button', { name: /like/i })[0];
        fireEvent.click(likeButton);
      });

      expect(mockUpdatePreferences).toHaveBeenCalledWith('test-user', {
        liked: 'ai-template-1',
        features: ['payment-integration', 'inventory-management', 'analytics'],
      });
    });

    it('should provide real-time AI recommendations as user types', async () => {
      const user = userEvent.setup();
      const mockRealTimeSearch = vi.fn().mockResolvedValue([mockDiscoveredTemplates[1]]);
      (templateDiscovery.searchSemantic as any).mockImplementation(mockRealTimeSearch);

      render(<AIRecommendations userId="test-user" realTime />);

      const searchInput = screen.getByPlaceholderText('Describe what you need...');
      await user.type(searchInput, 'blog');

      // Should trigger real-time search with debouncing
      await waitFor(() => {
        expect(mockRealTimeSearch).toHaveBeenCalledWith('blog');
      }, { timeout: 1000 });
    });
  });

  describe('AI Settings Assistant Integration', () => {
    const mockGeneratedSettings = {
      general: {
        appName: 'AI-Generated App',
        description: 'Optimized description based on your requirements',
      },
      branding: {
        primaryColor: '#007bff',
        secondaryColor: '#6c757d',
        fontFamily: 'Inter, sans-serif',
      },
      features: {
        analytics: true,
        notifications: true,
        darkMode: true,
      },
    };

    beforeEach(() => {
      (settingsGenerator.generateSettings as any).mockResolvedValue(mockGeneratedSettings);
      (settingsGenerator.validateSettings as any).mockResolvedValue({
        isValid: true,
        suggestions: ['Consider enabling caching for better performance'],
      });
    });

    it('should generate intelligent settings based on template analysis', async () => {
      const user = userEvent.setup();

      render(<AISettingsAssistant templateId="test-template" />);

      const generateButton = screen.getByRole('button', { name: /generate settings/i });
      await user.click(generateButton);

      await waitFor(() => {
        expect(settingsGenerator.generateSettings).toHaveBeenCalledWith('test-template');
        expect(screen.getByDisplayValue('AI-Generated App')).toBeInTheDocument();
        expect(screen.getByDisplayValue('#007bff')).toBeInTheDocument();
      });
    });

    it('should provide AI-powered validation and suggestions', async () => {
      render(<AISettingsAssistant templateId="test-template" />);

      await waitFor(() => {
        expect(screen.getByText('Consider enabling caching for better performance')).toBeInTheDocument();
      });
    });

    it('should optimize configuration based on best practices', async () => {
      const user = userEvent.setup();
      const mockOptimizedConfig = {
        ...mockGeneratedSettings,
        performance: {
          caching: true,
          compression: true,
          lazyLoading: true,
        },
      };
      (configurationOptimizer.optimize as any).mockResolvedValue(mockOptimizedConfig);

      render(<AISettingsAssistant templateId="test-template" />);

      const optimizeButton = screen.getByRole('button', { name: /optimize/i });
      await user.click(optimizeButton);

      await waitFor(() => {
        expect(configurationOptimizer.optimize).toHaveBeenCalled();
        expect(screen.getByText('Performance optimizations applied')).toBeInTheDocument();
      });
    });

    it('should provide contextual help and explanations', async () => {
      const user = userEvent.setup();

      render(<AISettingsAssistant templateId="test-template" />);

      const helpButton = screen.getByRole('button', { name: /explain setting/i });
      await user.click(helpButton);

      expect(screen.getByText('AI Explanation')).toBeInTheDocument();
      expect(screen.getByText(/This setting controls/i)).toBeInTheDocument();
    });

    it('should learn from user preferences over time', async () => {
      const user = userEvent.setup();
      const mockAnalyzeUsage = vi.fn().mockResolvedValue({
        preferredColors: ['#007bff', '#28a745'],
        commonFeatures: ['analytics', 'notifications'],
        patterns: ['prefers-dark-mode', 'mobile-first'],
      });
      (templateRecommendations.analyzeUsage as any).mockImplementation(mockAnalyzeUsage);

      render(<AISettingsAssistant templateId="test-template" userId="test-user" />);

      const learnButton = screen.getByRole('button', { name: /learn preferences/i });
      await user.click(learnButton);

      expect(mockAnalyzeUsage).toHaveBeenCalledWith('test-user');

      await waitFor(() => {
        expect(screen.getByText('Learning from your preferences...')).toBeInTheDocument();
      });
    });
  });

  describe('Smart Configuration System', () => {
    const mockSmartConfig = {
      recommendations: [
        {
          type: 'performance',
          title: 'Enable Image Optimization',
          description: 'Reduce bundle size by 30%',
          impact: 'high',
          effort: 'low',
        },
        {
          type: 'security',
          title: 'Update Security Headers',
          description: 'Improve security score',
          impact: 'medium',
          effort: 'low',
        },
      ],
      analysis: {
        performance: 0.85,
        security: 0.92,
        accessibility: 0.88,
        seo: 0.79,
      },
    };

    beforeEach(() => {
      (settingsAnalyzer.analyze as any).mockResolvedValue(mockSmartConfig.analysis);
      (settingsAnalyzer.getRecommendations as any).mockResolvedValue(mockSmartConfig.recommendations);
    });

    it('should provide intelligent configuration recommendations', async () => {
      render(<SmartConfiguration templateId="test-template" />);

      await waitFor(() => {
        expect(screen.getByText('Enable Image Optimization')).toBeInTheDocument();
        expect(screen.getByText('Update Security Headers')).toBeInTheDocument();
        expect(screen.getByText('Reduce bundle size by 30%')).toBeInTheDocument();
      });
    });

    it('should display configuration analysis scores', async () => {
      render(<SmartConfiguration templateId="test-template" />);

      await waitFor(() => {
        expect(screen.getByText('Performance: 85%')).toBeInTheDocument();
        expect(screen.getByText('Security: 92%')).toBeInTheDocument();
        expect(screen.getByText('Accessibility: 88%')).toBeInTheDocument();
        expect(screen.getByText('SEO: 79%')).toBeInTheDocument();
      });
    });

    it('should allow applying recommendations with one click', async () => {
      const user = userEvent.setup();
      const mockApplyOptimizations = vi.fn().mockResolvedValue(true);
      (configurationOptimizer.applyOptimizations as any).mockImplementation(mockApplyOptimizations);

      render(<SmartConfiguration templateId="test-template" />);

      await waitFor(() => {
        const applyButton = screen.getAllByRole('button', { name: /apply/i })[0];
        fireEvent.click(applyButton);
      });

      expect(mockApplyOptimizations).toHaveBeenCalled();
    });

    it('should prioritize recommendations by impact and effort', async () => {
      render(<SmartConfiguration templateId="test-template" />);

      await waitFor(() => {
        const recommendations = screen.getAllByTestId('recommendation-card');
        // High impact, low effort should come first
        expect(within(recommendations[0]).getByText('Enable Image Optimization')).toBeInTheDocument();
      });
    });

    it('should provide detailed explanations for each recommendation', async () => {
      const user = userEvent.setup();

      render(<SmartConfiguration templateId="test-template" />);

      await waitFor(() => {
        const detailsButton = screen.getAllByRole('button', { name: /details/i })[0];
        fireEvent.click(detailsButton);
      });

      expect(screen.getByText('Detailed Explanation')).toBeInTheDocument();
      expect(screen.getByText(/This optimization will/i)).toBeInTheDocument();
    });
  });

  describe('Personalized Interface Integration', () => {
    const mockPersonalization = {
      layout: 'sidebar-left',
      theme: 'dark',
      widgets: ['quick-actions', 'recent-templates', 'ai-suggestions'],
      shortcuts: [
        { key: 'ctrl+n', action: 'new-template' },
        { key: 'ctrl+s', action: 'save-settings' },
      ],
      preferences: {
        showTooltips: true,
        autoSave: true,
        compactMode: false,
      },
    };

    beforeEach(() => {
      (interfacePersonalization.getPersonalization as any).mockResolvedValue(mockPersonalization);
      (userBehaviorAnalyzer.getPatterns as any).mockResolvedValue([
        { pattern: 'frequently-uses-templates', confidence: 0.9 },
        { pattern: 'prefers-keyboard-shortcuts', confidence: 0.85 },
      ]);
    });

    it('should personalize interface based on user behavior', async () => {
      render(<PersonalizedInterface userId="test-user" />);

      await waitFor(() => {
        expect(interfacePersonalization.getPersonalization).toHaveBeenCalledWith('test-user');
        expect(screen.getByTestId('sidebar-left')).toBeInTheDocument();
        expect(screen.getByTestId('dark-theme')).toBeInTheDocument();
      });
    });

    it('should display personalized widgets and shortcuts', async () => {
      render(<PersonalizedInterface userId="test-user" />);

      await waitFor(() => {
        expect(screen.getByText('Quick Actions')).toBeInTheDocument();
        expect(screen.getByText('Recent Templates')).toBeInTheDocument();
        expect(screen.getByText('AI Suggestions')).toBeInTheDocument();
        expect(screen.getByText('Ctrl+N')).toBeInTheDocument();
        expect(screen.getByText('Ctrl+S')).toBeInTheDocument();
      });
    });

    it('should adapt interface based on usage patterns', async () => {
      const user = userEvent.setup();

      render(<PersonalizedInterface userId="test-user" />);

      // Simulate user interaction
      const templateButton = screen.getByRole('button', { name: /templates/i });
      await user.click(templateButton);

      expect(userBehaviorAnalyzer.trackInteraction).toHaveBeenCalledWith('test-user', {
        action: 'click',
        target: 'templates',
        timestamp: expect.any(Number),
      });
    });

    it('should provide interface customization options', async () => {
      const user = userEvent.setup();
      const mockUpdatePreferences = vi.fn().mockResolvedValue(true);
      (interfacePersonalization.updatePreferences as any).mockImplementation(mockUpdatePreferences);

      render(<PersonalizedInterface userId="test-user" />);

      const customizeButton = screen.getByRole('button', { name: /customize/i });
      await user.click(customizeButton);

      const layoutSelect = screen.getByLabelText('Layout');
      await user.selectOptions(layoutSelect, 'sidebar-right');

      const saveButton = screen.getByRole('button', { name: /save customization/i });
      await user.click(saveButton);

      expect(mockUpdatePreferences).toHaveBeenCalledWith('test-user', {
        layout: 'sidebar-right',
      });
    });

    it('should learn from user interactions and improve personalization', async () => {
      const mockAnalyze = vi.fn().mockResolvedValue({
        newPatterns: ['uses-ai-recommendations', 'prefers-visual-mode'],
        confidence: 0.88,
      });
      (userBehaviorAnalyzer.analyze as any).mockImplementation(mockAnalyze);

      render(<PersonalizedInterface userId="test-user" />);

      // Simulate extended usage
      await waitFor(() => {
        expect(mockAnalyze).toHaveBeenCalledWith('test-user');
      });
    });
  });

  describe('Intelligent Navigation System', () => {
    const mockNavigationInsights = {
      frequentPaths: [
        { path: '/admin/templates', frequency: 0.4 },
        { path: '/admin/settings', frequency: 0.3 },
        { path: '/admin/analytics', frequency: 0.2 },
      ],
      suggestedRoutes: [
        { route: '/admin/templates/new', reason: 'Based on your recent activity' },
        { route: '/admin/settings/ai', reason: 'Complete your AI configuration' },
      ],
      shortcuts: [
        { path: '/admin/templates', shortcut: 'T' },
        { path: '/admin/settings', shortcut: 'S' },
      ],
    };

    beforeEach(() => {
      (userBehaviorAnalyzer.getPatterns as any).mockResolvedValue(mockNavigationInsights.frequentPaths);
      (userExperienceOptimizer.getOptimizations as any).mockResolvedValue(mockNavigationInsights.suggestedRoutes);
    });

    it('should provide intelligent navigation suggestions', async () => {
      render(<IntelligentNavigation userId="test-user" />);

      await waitFor(() => {
        expect(screen.getByText('Suggested for you')).toBeInTheDocument();
        expect(screen.getByText('Complete your AI configuration')).toBeInTheDocument();
        expect(screen.getByText('Based on your recent activity')).toBeInTheDocument();
      });
    });

    it('should show frequently used sections prominently', async () => {
      render(<IntelligentNavigation userId="test-user" />);

      await waitFor(() => {
        const templateLink = screen.getByRole('link', { name: /templates/i });
        expect(templateLink).toHaveClass('frequent-item');
      });
    });

    it('should provide contextual navigation shortcuts', async () => {
      render(<IntelligentNavigation userId="test-user" />);

      await waitFor(() => {
        expect(screen.getByText('Press T for Templates')).toBeInTheDocument();
        expect(screen.getByText('Press S for Settings')).toBeInTheDocument();
      });
    });

    it('should adapt navigation based on current context', async () => {
      const mockContextualSuggestions = vi.fn().mockResolvedValue([
        { route: '/admin/templates/edit/123', reason: 'Continue editing template' },
      ]);
      (userExperienceOptimizer.getOptimizations as any).mockImplementation(mockContextualSuggestions);

      render(<IntelligentNavigation userId="test-user" currentPath="/admin/templates" />);

      await waitFor(() => {
        expect(screen.getByText('Continue editing template')).toBeInTheDocument();
      });
    });

    it('should track navigation patterns for continuous improvement', async () => {
      const user = userEvent.setup();

      render(<IntelligentNavigation userId="test-user" />);

      const templateLink = screen.getByRole('link', { name: /templates/i });
      await user.click(templateLink);

      expect(userBehaviorAnalyzer.trackInteraction).toHaveBeenCalledWith('test-user', {
        action: 'navigate',
        target: '/admin/templates',
        timestamp: expect.any(Number),
      });
    });
  });

  describe('AI Integration Performance and Reliability', () => {
    it('should handle AI service failures gracefully', async () => {
      const mockError = new Error('AI service unavailable');
      (templateDiscovery.discoverTemplates as any).mockRejectedValue(mockError);

      render(<AIRecommendations userId="test-user" />);

      await waitFor(() => {
        expect(screen.getByText(/AI recommendations temporarily unavailable/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });
    });

    it('should implement proper caching for AI responses', async () => {
      const mockCachedResponse = [mockDiscoveredTemplates[0]];
      (templateDiscovery.discoverTemplates as any)
        .mockResolvedValueOnce(mockDiscoveredTemplates)
        .mockResolvedValueOnce(mockCachedResponse);

      const { rerender } = render(<AIRecommendations userId="test-user" />);

      await waitFor(() => {
        expect(templateDiscovery.discoverTemplates).toHaveBeenCalledTimes(1);
      });

      rerender(<AIRecommendations userId="test-user" />);

      // Second render should use cached data
      expect(templateDiscovery.discoverTemplates).toHaveBeenCalledTimes(1);
    });

    it('should provide loading states for AI operations', async () => {
      const slowPromise = new Promise(resolve => setTimeout(resolve, 1000));
      (settingsGenerator.generateSettings as any).mockReturnValue(slowPromise);

      render(<AISettingsAssistant templateId="test-template" />);

      const generateButton = screen.getByRole('button', { name: /generate settings/i });
      fireEvent.click(generateButton);

      expect(screen.getByText(/generating settings/i)).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should implement rate limiting for AI requests', async () => {
      const user = userEvent.setup();

      render(<AIRecommendations userId="test-user" />);

      // Rapid successive requests
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);
      await user.click(refreshButton);
      await user.click(refreshButton);

      // Should be rate limited after multiple requests
      expect(screen.getByText(/too many requests/i)).toBeInTheDocument();
    });

    it('should maintain AI service health monitoring', async () => {
      render(<AIRecommendations userId="test-user" />);

      await waitFor(() => {
        expect(screen.getByTestId('ai-service-status')).toBeInTheDocument();
        expect(screen.getByText('AI Services: Online')).toBeInTheDocument();
      });
    });
  });

  describe('AI System Integration Validation', () => {
    it('should validate AI responses for safety and accuracy', async () => {
      const mockUnsafeResponse = {
        settings: {
          script: '<script>alert("xss")</script>',
        },
      };
      (settingsGenerator.generateSettings as any).mockResolvedValue(mockUnsafeResponse);

      render(<AISettingsAssistant templateId="test-template" />);

      const generateButton = screen.getByRole('button', { name: /generate settings/i });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText(/unsafe content detected/i)).toBeInTheDocument();
      });
    });

    it('should provide fallback when AI services are unavailable', async () => {
      (templateDiscovery.discoverTemplates as any).mockRejectedValue(new Error('Service down'));

      render(<AIRecommendations userId="test-user" fallbackMode />);

      await waitFor(() => {
        expect(screen.getByText('Popular Templates')).toBeInTheDocument();
        expect(screen.getByText('Recent Templates')).toBeInTheDocument();
      });
    });

    it('should maintain audit trail for AI decisions', async () => {
      const user = userEvent.setup();
      const mockAuditTrail = vi.fn();

      render(<AISettingsAssistant templateId="test-template" onAudit={mockAuditTrail} />);

      const generateButton = screen.getByRole('button', { name: /generate settings/i });
      await user.click(generateButton);

      expect(mockAuditTrail).toHaveBeenCalledWith({
        action: 'ai_settings_generation',
        templateId: 'test-template',
        timestamp: expect.any(Number),
        aiModel: expect.any(String),
      });
    });

    it('should respect user privacy and data handling preferences', async () => {
      render(<AIRecommendations userId="test-user" privacyMode="strict" />);

      await waitFor(() => {
        expect(templateDiscovery.discoverTemplates).toHaveBeenCalledWith(
          expect.objectContaining({
            privacyMode: 'strict',
            anonymize: true,
          })
        );
      });
    });
  });
});
