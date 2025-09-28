/**
 * @fileoverview Accessibility Audit Component for Real-time WCAG Compliance
 * @module components/ui/accessibility-audit
 * @version 1.0.0
 *
 * HT-034.7.4: Real-time accessibility monitoring and WCAG 2.1 compliance validation
 */

"use client";

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Accessibility,
  Eye,
  Keyboard,
  MousePointer,
  Volume2,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { audit, contrast, aria, keyboard as keyboardHelper } from '@/lib/ui/accessibility-helpers';

interface AccessibilityIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: 'keyboard' | 'screen-reader' | 'visual' | 'structure' | 'forms';
  title: string;
  description: string;
  element?: HTMLElement;
  wcagCriterion: string;
  level: 'A' | 'AA' | 'AAA';
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  fix?: string;
}

interface AuditResult {
  score: number;
  totalIssues: number;
  criticalIssues: number;
  seriousIssues: number;
  moderateIssues: number;
  minorIssues: number;
  wcagLevel: 'A' | 'AA' | 'AAA' | 'Failed';
  categories: {
    keyboard: number;
    screenReader: number;
    visual: number;
    structure: number;
    forms: number;
  };
  issues: AccessibilityIssue[];
}

export function AccessibilityAudit() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [autoMode, setAutoMode] = useState(false);
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null);
  const auditRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoMode) {
      const interval = setInterval(() => {
        runAudit();
      }, 30000); // Run every 30 seconds in auto mode

      return () => clearInterval(interval);
    }
  }, [autoMode]);

  useEffect(() => {
    // Track focus for keyboard navigation audit
    const handleFocus = (e: FocusEvent) => {
      setFocusedElement(e.target as HTMLElement);
    };

    document.addEventListener('focusin', handleFocus);
    return () => document.removeEventListener('focusin', handleFocus);
  }, []);

  const runAudit = async () => {
    setIsRunning(true);

    // Wait for DOM to settle
    await new Promise(resolve => setTimeout(resolve, 1000));

    const issues: AccessibilityIssue[] = [];

    // 1. Check heading structure
    const headingIssues = checkHeadingStructure();
    issues.push(...headingIssues);

    // 2. Check images for alt text
    const imageIssues = checkImageAltText();
    issues.push(...imageIssues);

    // 3. Check form accessibility
    const formIssues = checkFormAccessibility();
    issues.push(...formIssues);

    // 4. Check keyboard navigation
    const keyboardIssues = checkKeyboardAccessibility();
    issues.push(...keyboardIssues);

    // 5. Check color contrast
    const contrastIssues = await checkColorContrast();
    issues.push(...contrastIssues);

    // 6. Check ARIA usage
    const ariaIssues = checkAriaUsage();
    issues.push(...ariaIssues);

    // 7. Check focus management
    const focusIssues = checkFocusManagement();
    issues.push(...focusIssues);

    // Calculate score and categorize issues
    const result = calculateAuditResult(issues);
    setResult(result);
    setIsRunning(false);
  };

  const checkHeadingStructure = (): AccessibilityIssue[] => {
    const issues: AccessibilityIssue[] = [];
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));

    if (headings.length === 0) {
      issues.push({
        id: 'no-headings',
        type: 'error',
        category: 'structure',
        title: 'No headings found',
        description: 'Page should have a proper heading structure starting with h1',
        wcagCriterion: '1.3.1',
        level: 'A',
        impact: 'serious',
        fix: 'Add semantic heading elements (h1, h2, h3, etc.) to create a logical document structure'
      });
      return issues;
    }

    // Check for h1
    const h1Elements = headings.filter(h => h.tagName === 'H1');
    if (h1Elements.length === 0) {
      issues.push({
        id: 'no-h1',
        type: 'error',
        category: 'structure',
        title: 'Missing h1 element',
        description: 'Page should have exactly one h1 element',
        wcagCriterion: '1.3.1',
        level: 'A',
        impact: 'serious',
        fix: 'Add a single h1 element that describes the main content of the page'
      });
    } else if (h1Elements.length > 1) {
      issues.push({
        id: 'multiple-h1',
        type: 'warning',
        category: 'structure',
        title: 'Multiple h1 elements',
        description: 'Page should have only one h1 element',
        wcagCriterion: '1.3.1',
        level: 'A',
        impact: 'moderate',
        fix: 'Use only one h1 element per page and use h2-h6 for subsections'
      });
    }

    // Check heading sequence
    let currentLevel = 0;
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));

      if (index === 0 && level !== 1) {
        issues.push({
          id: 'heading-start-level',
          type: 'warning',
          category: 'structure',
          title: 'Heading structure should start with h1',
          description: 'First heading should be h1',
          element: heading as HTMLElement,
          wcagCriterion: '1.3.1',
          level: 'A',
          impact: 'moderate',
          fix: 'Start heading structure with h1 element'
        });
      }

      if (level > currentLevel + 1) {
        issues.push({
          id: `heading-skip-${index}`,
          type: 'warning',
          category: 'structure',
          title: 'Heading level skipped',
          description: `Heading jumps from h${currentLevel} to h${level}`,
          element: heading as HTMLElement,
          wcagCriterion: '1.3.1',
          level: 'A',
          impact: 'moderate',
          fix: 'Use sequential heading levels (h1, h2, h3, etc.) without skipping levels'
        });
      }

      currentLevel = Math.max(currentLevel, level);
    });

    return issues;
  };

  const checkImageAltText = (): AccessibilityIssue[] => {
    const issues: AccessibilityIssue[] = [];
    const images = Array.from(document.querySelectorAll('img'));

    images.forEach((img, index) => {
      const alt = img.getAttribute('alt');
      const src = img.getAttribute('src');

      if (alt === null) {
        issues.push({
          id: `img-no-alt-${index}`,
          type: 'error',
          category: 'visual',
          title: 'Image missing alt attribute',
          description: `Image "${src}" has no alt attribute`,
          element: img,
          wcagCriterion: '1.1.1',
          level: 'A',
          impact: 'critical',
          fix: 'Add descriptive alt text or alt="" for decorative images'
        });
      } else if (alt === '' && !img.hasAttribute('role')) {
        // Empty alt is ok for decorative images, but check if it might need description
        const isDecorative = img.closest('[role="img"]') === null &&
                           !img.closest('figure') &&
                           !img.closest('a');

        if (!isDecorative) {
          issues.push({
            id: `img-empty-alt-${index}`,
            type: 'warning',
            category: 'visual',
            title: 'Image with empty alt text',
            description: 'Verify if this image is truly decorative',
            element: img,
            wcagCriterion: '1.1.1',
            level: 'A',
            impact: 'moderate',
            fix: 'Add descriptive alt text if image conveys information, or use alt="" only for purely decorative images'
          });
        }
      } else if (alt && alt.length > 125) {
        issues.push({
          id: `img-long-alt-${index}`,
          type: 'warning',
          category: 'visual',
          title: 'Alt text too long',
          description: 'Alt text should be concise (under 125 characters)',
          element: img,
          wcagCriterion: '1.1.1',
          level: 'A',
          impact: 'minor',
          fix: 'Shorten alt text to be more concise, or use longdesc for detailed descriptions'
        });
      }
    });

    return issues;
  };

  const checkFormAccessibility = (): AccessibilityIssue[] => {
    const issues: AccessibilityIssue[] = [];
    const formControls = Array.from(document.querySelectorAll('input, select, textarea'));

    formControls.forEach((control, index) => {
      const id = control.getAttribute('id');
      const type = control.getAttribute('type');

      // Check for labels
      const label = id ? document.querySelector(`label[for="${id}"]`) : null;
      const ariaLabel = control.getAttribute('aria-label');
      const ariaLabelledby = control.getAttribute('aria-labelledby');

      if (!label && !ariaLabel && !ariaLabelledby) {
        issues.push({
          id: `form-no-label-${index}`,
          type: 'error',
          category: 'forms',
          title: 'Form control missing label',
          description: `${control.tagName.toLowerCase()}${type ? `[type="${type}"]` : ''} has no associated label`,
          element: control as HTMLElement,
          wcagCriterion: '1.3.1',
          level: 'A',
          impact: 'critical',
          fix: 'Add a label element, aria-label, or aria-labelledby attribute'
        });
      }

      // Check required fields
      const isRequired = control.hasAttribute('required');
      const ariaRequired = control.getAttribute('aria-required') === 'true';

      if (isRequired && !ariaRequired) {
        issues.push({
          id: `form-required-aria-${index}`,
          type: 'warning',
          category: 'forms',
          title: 'Required field missing aria-required',
          description: 'Required fields should have aria-required="true"',
          element: control as HTMLElement,
          wcagCriterion: '3.3.2',
          level: 'A',
          impact: 'moderate',
          fix: 'Add aria-required="true" to required form fields'
        });
      }

      // Check error messages
      const ariaInvalid = control.getAttribute('aria-invalid');
      const ariaDescribedby = control.getAttribute('aria-describedby');

      if (ariaInvalid === 'true' && !ariaDescribedby) {
        issues.push({
          id: `form-error-description-${index}`,
          type: 'error',
          category: 'forms',
          title: 'Invalid field missing error description',
          description: 'Fields with aria-invalid="true" should reference error messages',
          element: control as HTMLElement,
          wcagCriterion: '3.3.1',
          level: 'A',
          impact: 'serious',
          fix: 'Add aria-describedby pointing to error message element'
        });
      }
    });

    return issues;
  };

  const checkKeyboardAccessibility = (): AccessibilityIssue[] => {
    const issues: AccessibilityIssue[] = [];
    const interactiveElements = Array.from(document.querySelectorAll(
      'button, a, input, select, textarea, [tabindex], [role="button"], [role="link"]'
    ));

    interactiveElements.forEach((element, index) => {
      const tabIndex = element.getAttribute('tabindex');

      // Check for positive tabindex (anti-pattern)
      if (tabIndex && parseInt(tabIndex) > 0) {
        issues.push({
          id: `tabindex-positive-${index}`,
          type: 'warning',
          category: 'keyboard',
          title: 'Positive tabindex detected',
          description: 'Positive tabindex values can create confusing tab order',
          element: element as HTMLElement,
          wcagCriterion: '2.4.3',
          level: 'A',
          impact: 'moderate',
          fix: 'Use tabindex="0" or remove tabindex and rely on natural tab order'
        });
      }

      // Check if focusable elements have focus indicators
      const computedStyle = window.getComputedStyle(element);
      const hasCustomFocus = element.classList.toString().includes('focus:') ||
                           computedStyle.outlineStyle !== 'none' ||
                           computedStyle.borderStyle !== 'none';

      if (!hasCustomFocus) {
        issues.push({
          id: `focus-indicator-${index}`,
          type: 'warning',
          category: 'keyboard',
          title: 'Missing focus indicator',
          description: 'Interactive elements should have visible focus indicators',
          element: element as HTMLElement,
          wcagCriterion: '2.4.7',
          level: 'AA',
          impact: 'serious',
          fix: 'Add CSS focus styles or use focus: classes for visible focus indicators'
        });
      }

      // Check for click handlers without keyboard support
      if (element.tagName === 'DIV' || element.tagName === 'SPAN') {
        const hasClickHandler = element.hasAttribute('onclick') ||
                              element.addEventListener;
        const hasRole = element.hasAttribute('role');
        const hasTabindex = element.hasAttribute('tabindex');

        if (hasClickHandler && (!hasRole || !hasTabindex)) {
          issues.push({
            id: `click-no-keyboard-${index}`,
            type: 'error',
            category: 'keyboard',
            title: 'Click handler without keyboard support',
            description: 'Elements with click handlers need keyboard accessibility',
            element: element as HTMLElement,
            wcagCriterion: '2.1.1',
            level: 'A',
            impact: 'critical',
            fix: 'Add role="button" and tabindex="0", or use a proper button element'
          });
        }
      }
    });

    return issues;
  };

  const checkColorContrast = async (): Promise<AccessibilityIssue[]> => {
    const issues: AccessibilityIssue[] = [];
    const textElements = Array.from(document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button, label'));

    // Note: This is a simplified contrast check
    // In a real implementation, you'd use a more sophisticated color extraction method
    textElements.slice(0, 20).forEach((element, index) => { // Limit to first 20 for performance
      const computedStyle = window.getComputedStyle(element);
      const color = computedStyle.color;
      const backgroundColor = computedStyle.backgroundColor;

      // Simple heuristic for low contrast (would need proper color analysis)
      if (color.includes('rgb') && backgroundColor.includes('rgb')) {
        // Extract RGB values and check contrast
        const textRgb = color.match(/\d+/g)?.map(Number) as [number, number, number];
        const bgRgb = backgroundColor.match(/\d+/g)?.map(Number) as [number, number, number];

        if (textRgb && bgRgb) {
          const contrastRatio = contrast.getContrastRatio(textRgb, bgRgb);
          const fontSize = parseFloat(computedStyle.fontSize);
          const fontWeight = computedStyle.fontWeight;
          const isLargeText = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));

          if (!contrast.meetsWCAG(contrastRatio, 'AA', isLargeText)) {
            issues.push({
              id: `contrast-low-${index}`,
              type: 'error',
              category: 'visual',
              title: 'Insufficient color contrast',
              description: `Contrast ratio ${contrastRatio.toFixed(2)}:1 does not meet WCAG AA requirements`,
              element: element as HTMLElement,
              wcagCriterion: '1.4.3',
              level: 'AA',
              impact: 'serious',
              fix: `Increase contrast ratio to at least ${isLargeText ? '3:1' : '4.5:1'} for WCAG AA compliance`
            });
          }
        }
      }
    });

    return issues;
  };

  const checkAriaUsage = (): AccessibilityIssue[] => {
    const issues: AccessibilityIssue[] = [];
    const elementsWithAria = Array.from(document.querySelectorAll('[aria-labelledby], [aria-describedby]'));

    elementsWithAria.forEach((element, index) => {
      const labelledby = element.getAttribute('aria-labelledby');
      const describedby = element.getAttribute('aria-describedby');

      if (labelledby) {
        const labelElement = document.getElementById(labelledby);
        if (!labelElement) {
          issues.push({
            id: `aria-labelledby-missing-${index}`,
            type: 'error',
            category: 'screen-reader',
            title: 'aria-labelledby references missing element',
            description: `Element references "${labelledby}" which does not exist`,
            element: element as HTMLElement,
            wcagCriterion: '1.3.1',
            level: 'A',
            impact: 'serious',
            fix: 'Ensure the referenced element exists or remove the aria-labelledby attribute'
          });
        }
      }

      if (describedby) {
        const descriptionElement = document.getElementById(describedby);
        if (!descriptionElement) {
          issues.push({
            id: `aria-describedby-missing-${index}`,
            type: 'error',
            category: 'screen-reader',
            title: 'aria-describedby references missing element',
            description: `Element references "${describedby}" which does not exist`,
            element: element as HTMLElement,
            wcagCriterion: '1.3.1',
            level: 'A',
            impact: 'serious',
            fix: 'Ensure the referenced element exists or remove the aria-describedby attribute'
          });
        }
      }
    });

    return issues;
  };

  const checkFocusManagement = (): AccessibilityIssue[] => {
    const issues: AccessibilityIssue[] = [];

    // Check for focus traps in modals
    const modals = Array.from(document.querySelectorAll('[role="dialog"], [role="alertdialog"]'));

    modals.forEach((modal, index) => {
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) {
        issues.push({
          id: `modal-no-focusable-${index}`,
          type: 'error',
          category: 'keyboard',
          title: 'Modal without focusable elements',
          description: 'Modal dialogs should contain focusable elements',
          element: modal as HTMLElement,
          wcagCriterion: '2.1.2',
          level: 'A',
          impact: 'critical',
          fix: 'Add focusable elements like buttons or form controls to the modal'
        });
      }

      // Check if modal has proper focus management
      const hasAutoFocus = modal.querySelector('[autofocus]');
      if (!hasAutoFocus && focusableElements.length > 0) {
        issues.push({
          id: `modal-no-autofocus-${index}`,
          type: 'warning',
          category: 'keyboard',
          title: 'Modal without initial focus',
          description: 'Modal should automatically focus on an element when opened',
          element: modal as HTMLElement,
          wcagCriterion: '2.4.3',
          level: 'A',
          impact: 'moderate',
          fix: 'Add autofocus attribute or programmatically focus the first interactive element'
        });
      }
    });

    return issues;
  };

  const calculateAuditResult = (issues: AccessibilityIssue[]): AuditResult => {
    const criticalIssues = issues.filter(issue => issue.impact === 'critical').length;
    const seriousIssues = issues.filter(issue => issue.impact === 'serious').length;
    const moderateIssues = issues.filter(issue => issue.impact === 'moderate').length;
    const minorIssues = issues.filter(issue => issue.impact === 'minor').length;

    // Calculate score (100 - weighted penalties)
    const score = Math.max(0, 100 - (
      criticalIssues * 20 +
      seriousIssues * 10 +
      moderateIssues * 5 +
      minorIssues * 2
    ));

    // Determine WCAG level
    let wcagLevel: 'A' | 'AA' | 'AAA' | 'Failed' = 'Failed';
    const levelAIssues = issues.filter(issue => issue.level === 'A' && issue.type === 'error').length;
    const levelAAIssues = issues.filter(issue => issue.level === 'AA' && issue.type === 'error').length;
    const levelAAAIssues = issues.filter(issue => issue.level === 'AAA' && issue.type === 'error').length;

    if (levelAIssues === 0) {
      if (levelAAIssues === 0) {
        if (levelAAAIssues === 0) {
          wcagLevel = 'AAA';
        } else {
          wcagLevel = 'AA';
        }
      } else {
        wcagLevel = 'A';
      }
    }

    // Categorize issues
    const categories = {
      keyboard: issues.filter(issue => issue.category === 'keyboard').length,
      screenReader: issues.filter(issue => issue.category === 'screen-reader').length,
      visual: issues.filter(issue => issue.category === 'visual').length,
      structure: issues.filter(issue => issue.category === 'structure').length,
      forms: issues.filter(issue => issue.category === 'forms').length
    };

    return {
      score,
      totalIssues: issues.length,
      criticalIssues,
      seriousIssues,
      moderateIssues,
      minorIssues,
      wcagLevel,
      categories,
      issues
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getIssueIcon = (type: 'error' | 'warning' | 'info') => {
    switch (type) {
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info': return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const filteredIssues = result?.issues.filter(issue =>
    selectedCategory === 'all' || issue.category === selectedCategory
  ) || [];

  return (
    <div ref={auditRef} className="space-y-6">
      {/* Audit Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Accessibility className="w-5 h-5" />
              <CardTitle>Accessibility Audit</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoMode(!autoMode)}
                className={cn(autoMode && "bg-blue-100 dark:bg-blue-900")}
              >
                {autoMode ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {autoMode ? 'Stop Auto' : 'Auto Mode'}
              </Button>
              <Button
                onClick={runAudit}
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                <RotateCcw className={cn("w-4 h-4", isRunning && "animate-spin")} />
                {isRunning ? 'Auditing...' : 'Run Audit'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Audit Results Summary */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className={cn("text-3xl font-bold mb-2", getScoreColor(result.score))}>
                  {result.score}%
                </div>
                <p className="text-sm text-muted-foreground">Accessibility Score</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">
                  {result.wcagLevel}
                </div>
                <p className="text-sm text-muted-foreground">WCAG Level</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold mb-2 text-red-600 dark:text-red-400">
                  {result.criticalIssues}
                </div>
                <p className="text-sm text-muted-foreground">Critical Issues</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">
                  {result.totalIssues}
                </div>
                <p className="text-sm text-muted-foreground">Total Issues</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Issue Categories */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Issues by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                All ({result.totalIssues})
              </Button>
              {Object.entries(result.categories).map(([category, count]) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  disabled={count === 0}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)} ({count})
                </Button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="p-4 border rounded-lg space-y-2"
                >
                  <div className="flex items-start gap-3">
                    {getIssueIcon(issue.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{issue.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          WCAG {issue.wcagCriterion} ({issue.level})
                        </Badge>
                        <Badge
                          variant={
                            issue.impact === 'critical' ? 'destructive' :
                            issue.impact === 'serious' ? 'destructive' :
                            issue.impact === 'moderate' ? 'secondary' : 'outline'
                          }
                          className="text-xs"
                        >
                          {issue.impact}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {issue.description}
                      </p>
                      {issue.fix && (
                        <div className="text-xs bg-blue-50 dark:bg-blue-950/20 p-2 rounded">
                          <strong>Fix:</strong> {issue.fix}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AccessibilityAudit;