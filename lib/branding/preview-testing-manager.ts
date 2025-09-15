/**
 * @fileoverview HT-011.1.8: Brand Preview and Testing System Implementation
 * @module lib/branding/preview-testing-manager
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-011.1.8 - Implement Brand Preview and Testing System
 * Focus: Create brand preview and testing functionality for real-time brand validation and preview
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: LOW (branding system enhancement)
 */

import { DynamicBrandConfig } from './logo-manager';
import { BrandPreset } from './preset-manager';
import { BrandPalette } from '../design-tokens/multi-brand-generator';
import { ValidationReport, ValidationResult } from './validation-framework';

/**
 * Preview configuration for brand testing
 */
export interface BrandPreviewConfig {
  /** Preview mode type */
  mode: 'live' | 'static' | 'comparison';
  /** Preview dimensions */
  dimensions: {
    width: number;
    height: number;
    device: 'desktop' | 'tablet' | 'mobile';
  };
  /** Preview content to display */
  content: {
    showLogo: boolean;
    showBrandName: boolean;
    showNavigation: boolean;
    showButtons: boolean;
    showCards: boolean;
    showForms: boolean;
    customContent?: string;
  };
  /** Preview settings */
  settings: {
    autoRefresh: boolean;
    showValidation: boolean;
    showMetrics: boolean;
    enableInteraction: boolean;
  };
}

/**
 * Brand testing scenario
 */
export interface BrandTestScenario {
  /** Unique scenario identifier */
  id: string;
  /** Scenario name */
  name: string;
  /** Scenario description */
  description: string;
  /** Test type */
  type: 'accessibility' | 'usability' | 'visual' | 'performance' | 'compatibility';
  /** Test configuration */
  config: {
    viewport: { width: number; height: number };
    device: 'desktop' | 'tablet' | 'mobile';
    browser: 'chrome' | 'firefox' | 'safari' | 'edge';
    theme: 'light' | 'dark' | 'auto';
  };
  /** Test criteria */
  criteria: {
    minScore: number;
    maxLoadTime: number;
    wcagLevel: 'A' | 'AA' | 'AAA';
    colorContrast: number;
  };
  /** Expected results */
  expected: {
    passRate: number;
    warnings: string[];
    errors: string[];
  };
}

/**
 * Brand testing result
 */
export interface BrandTestResult {
  /** Test scenario ID */
  scenarioId: string;
  /** Test execution timestamp */
  timestamp: Date;
  /** Overall test result */
  passed: boolean;
  /** Test score (0-100) */
  score: number;
  /** Detailed results */
  results: {
    accessibility: ValidationResult[];
    usability: ValidationResult[];
    visual: ValidationResult[];
    performance: {
      loadTime: number;
      renderTime: number;
      interactionTime: number;
    };
    compatibility: {
      browserSupport: Record<string, boolean>;
      deviceSupport: Record<string, boolean>;
    };
  };
  /** Test metrics */
  metrics: {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
    warningChecks: number;
  };
  /** Screenshots and recordings */
  artifacts: {
    screenshots: string[];
    recordings?: string[];
    reports: string[];
  };
}

/**
 * Brand preview state
 */
export interface BrandPreviewState {
  /** Current brand configuration */
  brandConfig: DynamicBrandConfig;
  /** Current preview configuration */
  previewConfig: BrandPreviewConfig;
  /** Preview HTML content */
  previewContent: string;
  /** Preview CSS styles */
  previewStyles: string;
  /** Preview validation results */
  validationResults: ValidationReport | null;
  /** Preview metrics */
  metrics: {
    renderTime: number;
    loadTime: number;
    interactionTime: number;
    accessibilityScore: number;
    performanceScore: number;
  };
  /** Preview status */
  status: 'idle' | 'loading' | 'rendering' | 'ready' | 'error';
  /** Error message if any */
  error?: string;
}

/**
 * Brand Preview and Testing Manager Class
 */
export class BrandPreviewTestingManager {
  private previewState: BrandPreviewState;
  private testScenarios: Map<string, BrandTestScenario> = new Map();
  private testResults: BrandTestResult[] = [];
  private previewContainer: HTMLElement | null = null;
  private refreshInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.previewState = this.createInitialState();
    this.initializeTestScenarios();
  }

  /**
   * Create initial preview state
   */
  private createInitialState(): BrandPreviewState {
    return {
      brandConfig: {
        logo: {
          src: '/default-logo.png',
          alt: 'Default Logo',
          width: 28,
          height: 28,
          className: 'rounded-sm',
          showAsImage: true,
          initials: 'DL',
          fallbackBgColor: 'from-blue-600 to-indigo-600'
        },
        brandName: {
          organizationName: 'Default Organization',
          appName: 'Default App',
          fullBrand: 'Default Organization — Default App',
          shortBrand: 'Default App',
          navBrand: 'Default App'
        },
        isCustom: false,
        presetName: 'default'
      },
      previewConfig: {
        mode: 'live',
        dimensions: {
          width: 1200,
          height: 800,
          device: 'desktop'
        },
        content: {
          showLogo: true,
          showBrandName: true,
          showNavigation: true,
          showButtons: true,
          showCards: true,
          showForms: true
        },
        settings: {
          autoRefresh: true,
          showValidation: true,
          showMetrics: true,
          enableInteraction: true
        }
      },
      previewContent: '',
      previewStyles: '',
      validationResults: null,
      metrics: {
        renderTime: 0,
        loadTime: 0,
        interactionTime: 0,
        accessibilityScore: 0,
        performanceScore: 0
      },
      status: 'idle'
    };
  }

  /**
   * Initialize default test scenarios
   */
  private initializeTestScenarios(): void {
    const scenarios: BrandTestScenario[] = [
      {
        id: 'accessibility-desktop',
        name: 'Desktop Accessibility',
        description: 'Test accessibility compliance on desktop viewport',
        type: 'accessibility',
        config: {
          viewport: { width: 1920, height: 1080 },
          device: 'desktop',
          browser: 'chrome',
          theme: 'light'
        },
        criteria: {
          minScore: 90,
          maxLoadTime: 2000,
          wcagLevel: 'AA',
          colorContrast: 4.5
        },
        expected: {
          passRate: 95,
          warnings: [],
          errors: []
        }
      },
      {
        id: 'accessibility-mobile',
        name: 'Mobile Accessibility',
        description: 'Test accessibility compliance on mobile viewport',
        type: 'accessibility',
        config: {
          viewport: { width: 375, height: 667 },
          device: 'mobile',
          browser: 'chrome',
          theme: 'light'
        },
        criteria: {
          minScore: 85,
          maxLoadTime: 3000,
          wcagLevel: 'AA',
          colorContrast: 4.5
        },
        expected: {
          passRate: 90,
          warnings: [],
          errors: []
        }
      },
      {
        id: 'usability-navigation',
        name: 'Navigation Usability',
        description: 'Test navigation usability and user experience',
        type: 'usability',
        config: {
          viewport: { width: 1200, height: 800 },
          device: 'desktop',
          browser: 'chrome',
          theme: 'light'
        },
        criteria: {
          minScore: 80,
          maxLoadTime: 1500,
          wcagLevel: 'A',
          colorContrast: 3.0
        },
        expected: {
          passRate: 85,
          warnings: [],
          errors: []
        }
      },
      {
        id: 'visual-consistency',
        name: 'Visual Consistency',
        description: 'Test visual consistency across components',
        type: 'visual',
        config: {
          viewport: { width: 1920, height: 1080 },
          device: 'desktop',
          browser: 'chrome',
          theme: 'light'
        },
        criteria: {
          minScore: 95,
          maxLoadTime: 2000,
          wcagLevel: 'A',
          colorContrast: 3.0
        },
        expected: {
          passRate: 98,
          warnings: [],
          errors: []
        }
      },
      {
        id: 'performance-core',
        name: 'Core Performance',
        description: 'Test core performance metrics',
        type: 'performance',
        config: {
          viewport: { width: 1920, height: 1080 },
          device: 'desktop',
          browser: 'chrome',
          theme: 'light'
        },
        criteria: {
          minScore: 80,
          maxLoadTime: 1000,
          wcagLevel: 'A',
          colorContrast: 3.0
        },
        expected: {
          passRate: 90,
          warnings: [],
          errors: []
        }
      },
      {
        id: 'compatibility-cross-browser',
        name: 'Cross-Browser Compatibility',
        description: 'Test compatibility across different browsers',
        type: 'compatibility',
        config: {
          viewport: { width: 1920, height: 1080 },
          device: 'desktop',
          browser: 'chrome',
          theme: 'light'
        },
        criteria: {
          minScore: 85,
          maxLoadTime: 2000,
          wcagLevel: 'A',
          colorContrast: 3.0
        },
        expected: {
          passRate: 90,
          warnings: [],
          errors: []
        }
      }
    ];

    scenarios.forEach(scenario => {
      this.testScenarios.set(scenario.id, scenario);
    });
  }

  /**
   * Update brand configuration and refresh preview
   */
  async updateBrandConfig(brandConfig: DynamicBrandConfig): Promise<void> {
    this.previewState.brandConfig = brandConfig;
    this.previewState.status = 'loading';
    
    try {
      await this.generatePreview();
      await this.validatePreview();
      await this.calculateMetrics();
      this.previewState.status = 'ready';
    } catch (error) {
      this.previewState.status = 'error';
      this.previewState.error = error instanceof Error ? error.message : 'Preview generation failed';
    }
  }

  /**
   * Update preview configuration
   */
  async updatePreviewConfig(previewConfig: Partial<BrandPreviewConfig>): Promise<void> {
    this.previewState.previewConfig = {
      ...this.previewState.previewConfig,
      ...previewConfig
    };
    
    if (this.previewState.previewConfig.settings.autoRefresh) {
      await this.refreshPreview();
    }
  }

  /**
   * Generate preview content
   */
  private async generatePreview(): Promise<void> {
    const { brandConfig, previewConfig } = this.previewState;
    
    // Generate HTML content
    this.previewState.previewContent = this.generatePreviewHTML(brandConfig, previewConfig);
    
    // Generate CSS styles
    this.previewState.previewStyles = this.generatePreviewCSS(brandConfig, previewConfig);
    
    // Update preview container if available
    if (this.previewContainer) {
      this.updatePreviewContainer();
    }
  }

  /**
   * Generate preview HTML content
   */
  private generatePreviewHTML(brandConfig: DynamicBrandConfig, previewConfig: BrandPreviewConfig): string {
    const { content } = previewConfig;
    let html = '<div class="brand-preview-container">';
    
    // Header with logo and brand name
    if (content.showLogo || content.showBrandName) {
      html += '<header class="preview-header">';
      
      if (content.showLogo) {
        html += `
          <div class="preview-logo">
            ${brandConfig.logo.showAsImage 
              ? `<img src="${brandConfig.logo.src}" alt="${brandConfig.logo.alt}" width="${brandConfig.logo.width}" height="${brandConfig.logo.height}" />`
              : `<div class="logo-fallback" style="background: linear-gradient(135deg, ${brandConfig.logo.fallbackBgColor.replace('from-', '').replace('to-', '')})">${brandConfig.logo.initials}</div>`
            }
          </div>
        `;
      }
      
      if (content.showBrandName) {
        html += `
          <div class="preview-brand-name">
            <h1 class="brand-title">${brandConfig.brandName.fullBrand}</h1>
            <p class="brand-subtitle">${brandConfig.brandName.appName}</p>
          </div>
        `;
      }
      
      html += '</header>';
    }
    
    // Navigation
    if (content.showNavigation) {
      html += `
        <nav class="preview-navigation">
          <ul class="nav-list">
            <li><a href="#" class="nav-link">Home</a></li>
            <li><a href="#" class="nav-link">Features</a></li>
            <li><a href="#" class="nav-link">About</a></li>
            <li><a href="#" class="nav-link">Contact</a></li>
          </ul>
        </nav>
      `;
    }
    
    // Main content area
    html += '<main class="preview-main">';
    
    // Buttons
    if (content.showButtons) {
      html += `
        <section class="preview-buttons">
          <h2>Buttons</h2>
          <div class="button-group">
            <button class="btn btn-primary">Primary Button</button>
            <button class="btn btn-secondary">Secondary Button</button>
            <button class="btn btn-outline">Outline Button</button>
            <button class="btn btn-ghost">Ghost Button</button>
          </div>
        </section>
      `;
    }
    
    // Cards
    if (content.showCards) {
      html += `
        <section class="preview-cards">
          <h2>Cards</h2>
          <div class="card-grid">
            <div class="card">
              <div class="card-header">
                <h3>Card Title</h3>
              </div>
              <div class="card-content">
                <p>This is a sample card with some content to demonstrate the brand styling.</p>
              </div>
              <div class="card-footer">
                <button class="btn btn-primary">Action</button>
              </div>
            </div>
            <div class="card">
              <div class="card-header">
                <h3>Another Card</h3>
              </div>
              <div class="card-content">
                <p>Another sample card to show consistency across multiple elements.</p>
              </div>
              <div class="card-footer">
                <button class="btn btn-secondary">Action</button>
              </div>
            </div>
          </div>
        </section>
      `;
    }
    
    // Forms
    if (content.showForms) {
      html += `
        <section class="preview-forms">
          <h2>Forms</h2>
          <form class="preview-form">
            <div class="form-group">
              <label for="email">Email Address</label>
              <input type="email" id="email" name="email" placeholder="Enter your email" />
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" placeholder="Enter your password" />
            </div>
            <div class="form-group">
              <label for="message">Message</label>
              <textarea id="message" name="message" placeholder="Enter your message"></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Submit</button>
          </form>
        </section>
      `;
    }
    
    // Custom content
    if (content.customContent) {
      html += `
        <section class="preview-custom">
          <h2>Custom Content</h2>
          <div class="custom-content">${content.customContent}</div>
        </section>
      `;
    }
    
    html += '</main>';
    html += '</div>';
    
    return html;
  }

  /**
   * Generate preview CSS styles
   */
  private generatePreviewCSS(brandConfig: DynamicBrandConfig, previewConfig: BrandPreviewConfig): string {
    const { dimensions } = previewConfig;
    
    return `
      .brand-preview-container {
        width: ${dimensions.width}px;
        height: ${dimensions.height}px;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #ffffff;
        color: #1f2937;
        overflow: auto;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
      
      .preview-header {
        display: flex;
        align-items: center;
        padding: 1rem;
        background: #f9fafb;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .preview-logo {
        margin-right: 1rem;
      }
      
      .preview-logo img {
        border-radius: 4px;
      }
      
      .logo-fallback {
        width: 28px;
        height: 28px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        font-size: 12px;
      }
      
      .preview-brand-name h1 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: #1f2937;
      }
      
      .preview-brand-name p {
        margin: 0;
        font-size: 0.875rem;
        color: #6b7280;
      }
      
      .preview-navigation {
        background: #ffffff;
        border-bottom: 1px solid #e5e7eb;
        padding: 0 1rem;
      }
      
      .nav-list {
        display: flex;
        list-style: none;
        margin: 0;
        padding: 0;
      }
      
      .nav-list li {
        margin-right: 2rem;
      }
      
      .nav-link {
        display: block;
        padding: 1rem 0;
        color: #6b7280;
        text-decoration: none;
        font-weight: 500;
        transition: color 0.2s;
      }
      
      .nav-link:hover {
        color: #1f2937;
      }
      
      .preview-main {
        padding: 2rem;
      }
      
      .preview-main section {
        margin-bottom: 3rem;
      }
      
      .preview-main h2 {
        margin: 0 0 1rem 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #1f2937;
      }
      
      .button-group {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }
      
      .btn {
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-weight: 500;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s;
        border: 1px solid transparent;
      }
      
      .btn-primary {
        background: #3b82f6;
        color: white;
      }
      
      .btn-primary:hover {
        background: #2563eb;
      }
      
      .btn-secondary {
        background: #6b7280;
        color: white;
      }
      
      .btn-secondary:hover {
        background: #4b5563;
      }
      
      .btn-outline {
        background: transparent;
        color: #3b82f6;
        border-color: #3b82f6;
      }
      
      .btn-outline:hover {
        background: #3b82f6;
        color: white;
      }
      
      .btn-ghost {
        background: transparent;
        color: #6b7280;
      }
      
      .btn-ghost:hover {
        background: #f3f4f6;
      }
      
      .card-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1rem;
      }
      
      .card {
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
      }
      
      .card-header {
        padding: 1rem;
        background: #f9fafb;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .card-header h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: #1f2937;
      }
      
      .card-content {
        padding: 1rem;
      }
      
      .card-content p {
        margin: 0;
        color: #6b7280;
        line-height: 1.5;
      }
      
      .card-footer {
        padding: 1rem;
        background: #f9fafb;
        border-top: 1px solid #e5e7eb;
      }
      
      .preview-form {
        max-width: 400px;
      }
      
      .form-group {
        margin-bottom: 1rem;
      }
      
      .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #374151;
      }
      
      .form-group input,
      .form-group textarea {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 0.875rem;
        transition: border-color 0.2s;
      }
      
      .form-group input:focus,
      .form-group textarea:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
      
      .custom-content {
        padding: 1rem;
        background: #f9fafb;
        border-radius: 6px;
        border: 1px solid #e5e7eb;
      }
      
      @media (max-width: 768px) {
        .brand-preview-container {
          width: 100%;
          height: auto;
        }
        
        .preview-header {
          flex-direction: column;
          align-items: flex-start;
        }
        
        .preview-logo {
          margin-right: 0;
          margin-bottom: 0.5rem;
        }
        
        .nav-list {
          flex-direction: column;
        }
        
        .nav-list li {
          margin-right: 0;
        }
        
        .button-group {
          flex-direction: column;
        }
        
        .card-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
  }

  /**
   * Validate preview using brand validation framework
   */
  private async validatePreview(): Promise<void> {
    // This would integrate with the existing validation framework
    // For now, we'll create a mock validation result
    this.previewState.validationResults = {
      isValid: true,
      passedChecks: 8,
      totalChecks: 10,
      failedChecks: 2,
      results: [],
      categorySummary: {
        accessibility: { passed: 5, failed: 1, total: 6 },
        usability: { passed: 2, failed: 1, total: 3 },
        design: { passed: 1, failed: 0, total: 1 },
        branding: { passed: 0, failed: 0, total: 0 }
      },
      timestamp: new Date(),
      wcagCompliance: {
        levelA: { passed: 5, failed: 0, total: 5 },
        levelAA: { passed: 3, failed: 1, total: 4 },
        levelAAA: { passed: 0, failed: 1, total: 1 }
      }
    };
  }

  /**
   * Calculate preview metrics
   */
  private async calculateMetrics(): Promise<void> {
    const startTime = performance.now();
    
    // Simulate metrics calculation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const endTime = performance.now();
    
    this.previewState.metrics = {
      renderTime: endTime - startTime,
      loadTime: Math.random() * 1000 + 500, // Mock load time
      interactionTime: Math.random() * 200 + 100, // Mock interaction time
      accessibilityScore: (this.previewState.validationResults as any)?.summary?.overallScore || 0,
      performanceScore: Math.floor(Math.random() * 20 + 80) // Mock performance score
    };
  }

  /**
   * Update preview container
   */
  private updatePreviewContainer(): void {
    if (!this.previewContainer) return;
    
    this.previewContainer.innerHTML = this.previewState.previewContent;
    
    // Inject styles
    const styleElement = document.createElement('style');
    styleElement.textContent = this.previewState.previewStyles;
    document.head.appendChild(styleElement);
  }

  /**
   * Refresh preview
   */
  async refreshPreview(): Promise<void> {
    if (this.previewState.status === 'loading') return;
    
    this.previewState.status = 'loading';
    
    try {
      await this.generatePreview();
      await this.validatePreview();
      await this.calculateMetrics();
      this.previewState.status = 'ready';
    } catch (error) {
      this.previewState.status = 'error';
      this.previewState.error = error instanceof Error ? error.message : 'Preview refresh failed';
    }
  }

  /**
   * Run brand test scenario
   */
  async runTestScenario(scenarioId: string): Promise<BrandTestResult> {
    const scenario = this.testScenarios.get(scenarioId);
    if (!scenario) {
      throw new Error(`Test scenario '${scenarioId}' not found`);
    }
    
    const startTime = performance.now();
    
    // Simulate test execution
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const endTime = performance.now();
    
    const result: BrandTestResult = {
      scenarioId,
      timestamp: new Date(),
      passed: true, // Mock result
      score: Math.floor(Math.random() * 20 + 80), // Mock score
      results: {
        accessibility: [],
        usability: [],
        visual: [],
        performance: {
          loadTime: endTime - startTime,
          renderTime: Math.random() * 100 + 50,
          interactionTime: Math.random() * 50 + 25
        },
        compatibility: {
          browserSupport: {
            chrome: true,
            firefox: true,
            safari: true,
            edge: true
          },
          deviceSupport: {
            desktop: true,
            tablet: true,
            mobile: true
          }
        }
      },
      metrics: {
        totalChecks: 10,
        passedChecks: 8,
        failedChecks: 2,
        warningChecks: 0
      },
      artifacts: {
        screenshots: [`screenshot-${scenarioId}-${Date.now()}.png`],
        reports: [`report-${scenarioId}-${Date.now()}.json`]
      }
    };
    
    this.testResults.push(result);
    return result;
  }

  /**
   * Run all test scenarios
   */
  async runAllTests(): Promise<BrandTestResult[]> {
    const results: BrandTestResult[] = [];
    
    for (const scenarioId of this.testScenarios.keys()) {
      try {
        const result = await this.runTestScenario(scenarioId);
        results.push(result);
      } catch (error) {
        console.error(`Failed to run test scenario ${scenarioId}:`, error);
      }
    }
    
    return results;
  }

  /**
   * Get preview state
   */
  getPreviewState(): BrandPreviewState {
    return { ...this.previewState };
  }

  /**
   * Get test scenarios
   */
  getTestScenarios(): BrandTestScenario[] {
    return Array.from(this.testScenarios.values());
  }

  /**
   * Get test results
   */
  getTestResults(): BrandTestResult[] {
    return [...this.testResults];
  }

  /**
   * Set preview container
   */
  setPreviewContainer(container: HTMLElement): void {
    this.previewContainer = container;
    this.updatePreviewContainer();
  }

  /**
   * Start auto-refresh
   */
  startAutoRefresh(interval: number = 5000): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    
    this.refreshInterval = setInterval(() => {
      if (this.previewState.previewConfig.settings.autoRefresh) {
        this.refreshPreview();
      }
    }, interval);
  }

  /**
   * Stop auto-refresh
   */
  stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopAutoRefresh();
    this.previewContainer = null;
  }
}

/**
 * Global brand preview and testing manager instance
 */
export const brandPreviewTestingManager = new BrandPreviewTestingManager();

/**
 * Utility functions for brand preview and testing
 */
export const BrandPreviewTestingUtils = {
  /**
   * Generate preview URL
   */
  generatePreviewUrl(brandConfig: DynamicBrandConfig, previewConfig: BrandPreviewConfig): string {
    const params = new URLSearchParams({
      config: JSON.stringify(brandConfig),
      preview: JSON.stringify(previewConfig)
    });
    
    return `/brand-preview?${params.toString()}`;
  },

  /**
   * Export test results
   */
  exportTestResults(results: BrandTestResult[]): string {
    return JSON.stringify(results, null, 2);
  },

  /**
   * Generate test report
   */
  generateTestReport(results: BrandTestResult[]): string {
    const totalTests = results.length;
    const passedTests = results.filter(r => r.passed).length;
    const averageScore = results.reduce((sum, r) => sum + r.score, 0) / totalTests;
    
    return `
# Brand Testing Report

## Summary
- **Total Tests**: ${totalTests}
- **Passed**: ${passedTests}
- **Failed**: ${totalTests - passedTests}
- **Average Score**: ${averageScore.toFixed(1)}%

## Test Results
${results.map(result => `
### ${result.scenarioId}
- **Status**: ${result.passed ? 'PASSED' : 'FAILED'}
- **Score**: ${result.score}%
- **Timestamp**: ${result.timestamp.toISOString()}
`).join('\n')}
    `;
  },

  /**
   * Validate preview configuration
   */
  validatePreviewConfig(config: BrandPreviewConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (config.dimensions.width < 320 || config.dimensions.width > 3840) {
      errors.push('Width must be between 320 and 3840 pixels');
    }
    
    if (config.dimensions.height < 240 || config.dimensions.height > 2160) {
      errors.push('Height must be between 240 and 2160 pixels');
    }
    
    if (!['desktop', 'tablet', 'mobile'].includes(config.dimensions.device)) {
      errors.push('Device must be desktop, tablet, or mobile');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};
