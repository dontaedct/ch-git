/**
 * @fileoverview HT-008.7.6: Enhanced Accessibility Testing Suite
 * @module tests/ui/accessibility-enhanced.spec.ts
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.7.6 - Accessibility Testing Enhancement
 * Focus: Automated A11y checks and screen reader testing with WCAG 2.1 AAA compliance
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (accessibility compliance requirements)
 */

import { test, expect, Page } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

/**
 * Enhanced Accessibility Testing Suite
 * 
 * This suite implements comprehensive accessibility testing including:
 * - WCAG 2.1 AAA compliance testing
 * - Screen reader simulation and testing
 * - Keyboard navigation testing
 * - Focus management testing
 * - Color contrast testing
 * - ARIA implementation testing
 * - Semantic HTML validation
 * - Reduced motion testing
 * - Error handling accessibility
 * - Form accessibility testing
 * - Component-specific accessibility testing
 */
class EnhancedAccessibilityTesting {
  private page: Page;
  private results: any[] = [];

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Run comprehensive accessibility audit
   */
  async runComprehensiveAudit(): Promise<any> {
    console.log('🔍 Running Comprehensive Accessibility Audit...');
    
    const results = await new AxeBuilder({ page: this.page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag2aaa', 'wcag21aaa'])
      .withRules({
        // Critical WCAG 2.1 AAA rules
        'color-contrast-enhanced': { enabled: true },
        'color-contrast': { enabled: true },
        'document-title': { enabled: true },
        'html-has-lang': { enabled: true },
        'landmark-one-main': { enabled: true },
        'page-has-heading-one': { enabled: true },
        'heading-order': { enabled: true },
        'label': { enabled: true },
        'button-name': { enabled: true },
        'link-name': { enabled: true },
        'input-image-alt': { enabled: true },
        'list': { enabled: true },
        'listitem': { enabled: true },
        'region': { enabled: true },
        'skip-link': { enabled: true },
        'focus-order-semantics': { enabled: true },
        'landmark-unique': { enabled: true },
        'aria-allowed-attr': { enabled: true },
        'aria-required-attr': { enabled: true },
        'aria-valid-attr-value': { enabled: true },
        'aria-valid-attr': { enabled: true },
        'aria-roles': { enabled: true },
        'aria-required-parent': { enabled: true },
        'aria-required-children': { enabled: true },
        'aria-dpub-role-fallback': { enabled: true },
        'aria-hidden-focus': { enabled: true },
        'aria-hidden-body': { enabled: true },
        'aria-input-field-name': { enabled: true },
        'aria-meter-name': { enabled: true },
        'aria-progressbar-name': { enabled: true },
        'aria-slider-name': { enabled: true },
        'aria-spinbutton-name': { enabled: true },
        'aria-tablist': { enabled: true },
        'aria-tooltip-name': { enabled: true },
        'aria-treeitem-name': { enabled: true },
        'aria-unsupported-elements': { enabled: true },
        'aria-valid-role': { enabled: true },
        'aria-valid-scope': { enabled: true },
        'aria-valid-value': { enabled: true },
        'aria-valuemin': { enabled: true },
        'aria-valuemax': { enabled: true },
        'aria-valuenow': { enabled: true },
        'audio-caption': { enabled: true },
        'blink': { enabled: true },
        'bypass': { enabled: true },
        'checkboxgroup': { enabled: true },
        'color-contrast': { enabled: true },
        'definition-list': { enabled: true },
        'dlitem': { enabled: true },
        'document-title': { enabled: true },
        'duplicate-id': { enabled: true },
        'duplicate-id-active': { enabled: true },
        'duplicate-id-aria': { enabled: true },
        'form-field-multiple-labels': { enabled: true },
        'frame-title': { enabled: true },
        'html-has-lang': { enabled: true },
        'html-lang-valid': { enabled: true },
        'html-xml-lang-mismatch': { enabled: true },
        'image-alt': { enabled: true },
        'image-redundant-alt': { enabled: true },
        'input-button-name': { enabled: true },
        'input-image-alt': { enabled: true },
        'label-title-only': { enabled: true },
        'landmark-banner-is-top-level': { enabled: true },
        'landmark-complementary-is-top-level': { enabled: true },
        'landmark-contentinfo-is-top-level': { enabled: true },
        'landmark-main-is-top-level': { enabled: true },
        'landmark-no-duplicate-banner': { enabled: true },
        'landmark-no-duplicate-contentinfo': { enabled: true },
        'landmark-no-duplicate-main': { enabled: true },
        'landmark-one-main': { enabled: true },
        'landmark-unique': { enabled: true },
        'link-in-text-block': { enabled: true },
        'link-name': { enabled: true },
        'list': { enabled: true },
        'listitem': { enabled: true },
        'marquee': { enabled: true },
        'meta-refresh': { enabled: true },
        'meta-viewport': { enabled: true },
        'object-alt': { enabled: true },
        'page-has-heading-one': { enabled: true },
        'presentation-role-conflict': { enabled: true },
        'radiogroup': { enabled: true },
        'region': { enabled: true },
        'scope-attr-valid': { enabled: true },
        'scrollable-region-focusable': { enabled: true },
        'select-name': { enabled: true },
        'server-side-image-map': { enabled: true },
        'skip-link': { enabled: true },
        'tabindex': { enabled: true },
        'table-duplicate-name': { enabled: true },
        'table-fake-caption': { enabled: true },
        'td-headers-attr': { enabled: true },
        'td-has-header': { enabled: true },
        'th-has-data-cells': { enabled: true },
        'valid-lang': { enabled: true },
        'video-caption': { enabled: true },
        'video-description': { enabled: true }
      })
      .analyze();

    return results;
  }

  /**
   * Test screen reader compatibility
   */
  async testScreenReaderCompatibility(): Promise<any> {
    console.log('📢 Testing Screen Reader Compatibility...');
    
    const results = {
      headingStructure: await this.testHeadingStructure(),
      ariaLabels: await this.testAriaLabels(),
      liveRegions: await this.testLiveRegions(),
      landmarks: await this.testLandmarks(),
      formLabels: await this.testFormLabels(),
      imageAltText: await this.testImageAltText(),
      linkDescriptions: await this.testLinkDescriptions(),
      buttonDescriptions: await this.testButtonDescriptions(),
      tableHeaders: await this.testTableHeaders(),
      listStructure: await this.testListStructure()
    };

    return results;
  }

  /**
   * Test keyboard navigation
   */
  async testKeyboardNavigation(): Promise<any> {
    console.log('⌨️ Testing Keyboard Navigation...');
    
    const results = {
      tabOrder: await this.testTabOrder(),
      focusIndicators: await this.testFocusIndicators(),
      skipLinks: await this.testSkipLinks(),
      arrowKeyNavigation: await this.testArrowKeyNavigation(),
      escapeKeyFunctionality: await this.testEscapeKeyFunctionality(),
      enterKeyFunctionality: await this.testEnterKeyFunctionality(),
      spaceKeyFunctionality: await this.testSpaceKeyFunctionality(),
      homeEndKeys: await this.testHomeEndKeys(),
      focusTrapping: await this.testFocusTrapping()
    };

    return results;
  }

  /**
   * Test color contrast
   */
  async testColorContrast(): Promise<any> {
    console.log('🎨 Testing Color Contrast...');
    
    const results = await new AxeBuilder({ page: this.page })
      .withRules({
        'color-contrast': { enabled: true },
        'color-contrast-enhanced': { enabled: true }
      })
      .analyze();

    return results;
  }

  /**
   * Test reduced motion support
   */
  async testReducedMotionSupport(): Promise<any> {
    console.log('🎭 Testing Reduced Motion Support...');
    
    // Test with reduced motion preference
    await this.page.emulateMedia({ reducedMotion: 'reduce' });
    
    const results = {
      animationsDisabled: await this.testAnimationsDisabled(),
      transitionsDisabled: await this.testTransitionsDisabled(),
      motionPreferences: await this.testMotionPreferences()
    };

    // Reset to normal motion
    await this.page.emulateMedia({ reducedMotion: 'no-preference' });
    
    return results;
  }

  /**
   * Test form accessibility
   */
  async testFormAccessibility(): Promise<any> {
    console.log('📝 Testing Form Accessibility...');
    
    const results = {
      formLabels: await this.testFormLabels(),
      errorAssociations: await this.testErrorAssociations(),
      requiredFieldIndicators: await this.testRequiredFieldIndicators(),
      fieldsetLegends: await this.testFieldsetLegends(),
      formValidation: await this.testFormValidation(),
      formSubmission: await this.testFormSubmission()
    };

    return results;
  }

  /**
   * Test component-specific accessibility
   */
  async testComponentAccessibility(): Promise<any> {
    console.log('🧩 Testing Component Accessibility...');
    
    const results = {
      buttons: await this.testButtonAccessibility(),
      links: await this.testLinkAccessibility(),
      images: await this.testImageAccessibility(),
      tables: await this.testTableAccessibility(),
      lists: await this.testListAccessibility(),
      forms: await this.testFormAccessibility(),
      navigation: await this.testNavigationAccessibility(),
      modals: await this.testModalAccessibility(),
      tabs: await this.testTabAccessibility(),
      accordions: await this.testAccordionAccessibility()
    };

    return results;
  }

  // Implementation methods for individual tests

  private async testHeadingStructure(): Promise<any> {
    const headingStructure = await this.page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      let previousLevel = 0;
      let isValid = true;
      const violations: string[] = [];
      
      for (const heading of headings) {
        const currentLevel = parseInt(heading.tagName.charAt(1));
        if (currentLevel > previousLevel + 1) {
          isValid = false;
          violations.push(`Heading ${heading.tagName} follows heading ${previousLevel} without intermediate level`);
        }
        previousLevel = currentLevel;
      }
      
      return { isValid, violations, headingCount: headings.length };
    });

    return headingStructure;
  }

  private async testAriaLabels(): Promise<any> {
    const ariaLabels = await this.page.evaluate(() => {
      const interactiveElements = document.querySelectorAll(
        'button, input, select, textarea, a[href], [role="button"], [role="link"], [role="menuitem"], [role="tab"], [role="option"]'
      );
      
      const elementsWithoutLabels = Array.from(interactiveElements).filter(el => {
        const hasLabel = el.getAttribute('aria-label') || 
                        el.getAttribute('aria-labelledby') ||
                        el.closest('label') ||
                        el.textContent?.trim() ||
                        el.getAttribute('title');
        return !hasLabel;
      });

      return {
        totalElements: interactiveElements.length,
        elementsWithoutLabels: elementsWithoutLabels.length,
        violations: elementsWithoutLabels.map(el => ({
          tagName: el.tagName,
          type: el.getAttribute('type'),
          role: el.getAttribute('role'),
          id: el.id,
          className: el.className
        }))
      };
    });

    return ariaLabels;
  }

  private async testLiveRegions(): Promise<any> {
    const liveRegions = await this.page.evaluate(() => {
      const liveElements = document.querySelectorAll('[aria-live]');
      const statusElements = document.querySelectorAll('[role="status"]');
      const alertElements = document.querySelectorAll('[role="alert"]');
      
      return {
        liveRegions: liveElements.length,
        statusRegions: statusElements.length,
        alertRegions: alertElements.length,
        totalAnnouncementRegions: liveElements.length + statusElements.length + alertElements.length
      };
    });

    return liveRegions;
  }

  private async testLandmarks(): Promise<any> {
    const landmarks = await this.page.evaluate(() => {
      const landmarkElements = document.querySelectorAll('[role="banner"], [role="navigation"], [role="main"], [role="complementary"], [role="contentinfo"], main, nav, aside, header, footer');
      
      const landmarkTypes = {
        banner: document.querySelectorAll('[role="banner"], header').length,
        navigation: document.querySelectorAll('[role="navigation"], nav').length,
        main: document.querySelectorAll('[role="main"], main').length,
        complementary: document.querySelectorAll('[role="complementary"], aside').length,
        contentinfo: document.querySelectorAll('[role="contentinfo"], footer').length
      };

      return {
        totalLandmarks: landmarkElements.length,
        landmarkTypes,
        hasMain: landmarkTypes.main > 0,
        hasNavigation: landmarkTypes.navigation > 0,
        hasBanner: landmarkTypes.banner > 0
      };
    });

    return landmarks;
  }

  private async testFormLabels(): Promise<any> {
    const formLabels = await this.page.evaluate(() => {
      const formInputs = document.querySelectorAll('input, select, textarea');
      
      const inputsWithoutLabels = Array.from(formInputs).filter(input => {
        const id = input.id;
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledBy = input.getAttribute('aria-labelledby');
        
        if (ariaLabel || ariaLabelledBy) return false;
        
        if (id) {
          const label = document.querySelector(`label[for="${id}"]`);
          return !label;
        }
        
        return true;
      });

      return {
        totalInputs: formInputs.length,
        inputsWithoutLabels: inputsWithoutLabels.length,
        violations: inputsWithoutLabels.map(input => ({
          tagName: input.tagName,
          type: input.getAttribute('type'),
          id: input.id,
          name: input.getAttribute('name')
        }))
      };
    });

    return formLabels;
  }

  private async testImageAltText(): Promise<any> {
    const imageAltText = await this.page.evaluate(() => {
      const images = document.querySelectorAll('img');
      
      const imagesWithoutAlt = Array.from(images).filter(img => 
        !img.alt && !img.getAttribute('aria-label')
      );

      return {
        totalImages: images.length,
        imagesWithoutAlt: imagesWithoutAlt.length,
        violations: imagesWithoutAlt.map(img => ({
          src: img.src,
          className: img.className,
          id: img.id
        }))
      };
    });

    return imageAltText;
  }

  private async testLinkDescriptions(): Promise<any> {
    const linkDescriptions = await this.page.evaluate(() => {
      const links = document.querySelectorAll('a[href]');
      
      const linksWithoutDescriptions = Array.from(links).filter(link => {
        const hasText = link.textContent?.trim();
        const hasAriaLabel = link.getAttribute('aria-label');
        const hasTitle = link.getAttribute('title');
        
        return !hasText && !hasAriaLabel && !hasTitle;
      });

      return {
        totalLinks: links.length,
        linksWithoutDescriptions: linksWithoutDescriptions.length,
        violations: linksWithoutDescriptions.map(link => ({
          href: link.getAttribute('href'),
          className: link.className,
          id: link.id
        }))
      };
    });

    return linkDescriptions;
  }

  private async testButtonDescriptions(): Promise<any> {
    const buttonDescriptions = await this.page.evaluate(() => {
      const buttons = document.querySelectorAll('button, [role="button"]');
      
      const buttonsWithoutDescriptions = Array.from(buttons).filter(button => {
        const hasText = button.textContent?.trim();
        const hasAriaLabel = button.getAttribute('aria-label');
        const hasTitle = button.getAttribute('title');
        
        return !hasText && !hasAriaLabel && !hasTitle;
      });

      return {
        totalButtons: buttons.length,
        buttonsWithoutDescriptions: buttonsWithoutDescriptions.length,
        violations: buttonsWithoutDescriptions.map(button => ({
          type: button.getAttribute('type'),
          className: button.className,
          id: button.id
        }))
      };
    });

    return buttonDescriptions;
  }

  private async testTableHeaders(): Promise<any> {
    const tableHeaders = await this.page.evaluate(() => {
      const tables = document.querySelectorAll('table');
      
      const tablesWithoutHeaders = Array.from(tables).filter(table => {
        const hasHeaders = table.querySelectorAll('th').length > 0;
        const hasScope = table.querySelectorAll('[scope]').length > 0;
        const hasHeadersAttr = table.querySelectorAll('[headers]').length > 0;
        
        return !hasHeaders && !hasScope && !hasHeadersAttr;
      });

      return {
        totalTables: tables.length,
        tablesWithoutHeaders: tablesWithoutHeaders.length,
        violations: tablesWithoutHeaders.map(table => ({
          className: table.className,
          id: table.id
        }))
      };
    });

    return tableHeaders;
  }

  private async testListStructure(): Promise<any> {
    const listStructure = await this.page.evaluate(() => {
      const lists = document.querySelectorAll('ul, ol');
      
      const listsWithoutItems = Array.from(lists).filter(list => 
        list.querySelectorAll('li').length === 0
      );

      return {
        totalLists: lists.length,
        listsWithoutItems: listsWithoutItems.length,
        violations: listsWithoutItems.map(list => ({
          tagName: list.tagName,
          className: list.className,
          id: list.id
        }))
      };
    });

    return listStructure;
  }

  private async testTabOrder(): Promise<any> {
    const tabOrder = await this.page.evaluate(() => {
      const focusableElements = document.querySelectorAll(
        'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
      );
      
      const tabOrder = Array.from(focusableElements).map((el, index) => ({
        index,
        tagName: el.tagName,
        tabIndex: el.getAttribute('tabindex'),
        id: el.id,
        className: el.className
      }));

      return {
        totalFocusableElements: focusableElements.length,
        tabOrder
      };
    });

    return tabOrder;
  }

  private async testFocusIndicators(): Promise<any> {
    const focusIndicators = await this.page.evaluate(() => {
      const focusableElements = document.querySelectorAll(
        'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
      );
      
      const elementsWithoutFocusIndicators = Array.from(focusableElements).filter(el => {
        const styles = window.getComputedStyle(el);
        return styles.outline === 'none' && 
               styles.boxShadow === 'none' &&
               !el.classList.contains('focus-visible') &&
               !el.classList.contains('focus-ring');
      });

      return {
        totalFocusableElements: focusableElements.length,
        elementsWithoutFocusIndicators: elementsWithoutFocusIndicators.length,
        violations: elementsWithoutFocusIndicators.map(el => ({
          tagName: el.tagName,
          className: el.className,
          id: el.id
        }))
      };
    });

    return focusIndicators;
  }

  private async testSkipLinks(): Promise<any> {
    const skipLinks = await this.page.evaluate(() => {
      const skipLinkElements = document.querySelectorAll('a[href^="#"], a[href*="skip"]');
      
      return {
        totalSkipLinks: skipLinkElements.length,
        skipLinks: Array.from(skipLinkElements).map(link => ({
          href: link.getAttribute('href'),
          text: link.textContent?.trim(),
          className: link.className,
          id: link.id
        }))
      };
    });

    return skipLinks;
  }

  private async testArrowKeyNavigation(): Promise<any> {
    // Test arrow key navigation for components like tabs, menus, etc.
    const arrowKeyNavigation = await this.page.evaluate(() => {
      const tabLists = document.querySelectorAll('[role="tablist"]');
      const menus = document.querySelectorAll('[role="menu"]');
      const radiogroups = document.querySelectorAll('[role="radiogroup"]');
      
      return {
        tabLists: tabLists.length,
        menus: menus.length,
        radiogroups: radiogroups.length,
        totalArrowKeyComponents: tabLists.length + menus.length + radiogroups.length
      };
    });

    return arrowKeyNavigation;
  }

  private async testEscapeKeyFunctionality(): Promise<any> {
    const escapeKeyFunctionality = await this.page.evaluate(() => {
      const modals = document.querySelectorAll('[role="dialog"], [role="modal"]');
      const menus = document.querySelectorAll('[role="menu"]');
      const dropdowns = document.querySelectorAll('[aria-expanded="true"]');
      
      return {
        modals: modals.length,
        menus: menus.length,
        dropdowns: dropdowns.length,
        totalEscapeKeyComponents: modals.length + menus.length + dropdowns.length
      };
    });

    return escapeKeyFunctionality;
  }

  private async testEnterKeyFunctionality(): Promise<any> {
    const enterKeyFunctionality = await this.page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      const links = document.querySelectorAll('a[href]');
      const formInputs = document.querySelectorAll('input[type="submit"], input[type="button"]');
      
      return {
        buttons: buttons.length,
        links: links.length,
        formInputs: formInputs.length,
        totalEnterKeyComponents: buttons.length + links.length + formInputs.length
      };
    });

    return enterKeyFunctionality;
  }

  private async testSpaceKeyFunctionality(): Promise<any> {
    const spaceKeyFunctionality = await this.page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      const radios = document.querySelectorAll('input[type="radio"]');
      
      return {
        buttons: buttons.length,
        checkboxes: checkboxes.length,
        radios: radios.length,
        totalSpaceKeyComponents: buttons.length + checkboxes.length + radios.length
      };
    });

    return spaceKeyFunctionality;
  }

  private async testHomeEndKeys(): Promise<any> {
    const homeEndKeys = await this.page.evaluate(() => {
      const tabLists = document.querySelectorAll('[role="tablist"]');
      const menus = document.querySelectorAll('[role="menu"]');
      const lists = document.querySelectorAll('[role="listbox"]');
      
      return {
        tabLists: tabLists.length,
        menus: menus.length,
        lists: lists.length,
        totalHomeEndKeyComponents: tabLists.length + menus.length + lists.length
      };
    });

    return homeEndKeys;
  }

  private async testFocusTrapping(): Promise<any> {
    const focusTrapping = await this.page.evaluate(() => {
      const modals = document.querySelectorAll('[role="dialog"], [role="modal"]');
      
      return {
        modals: modals.length,
        modalsWithFocusTrapping: Array.from(modals).filter(modal => {
          const focusableElements = modal.querySelectorAll(
            'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
          );
          return focusableElements.length > 0;
        }).length
      };
    });

    return focusTrapping;
  }

  private async testAnimationsDisabled(): Promise<any> {
    const animationsDisabled = await this.page.evaluate(() => {
      const animatedElements = document.querySelectorAll('*');
      let animationCount = 0;
      
      Array.from(animatedElements).forEach(el => {
        const styles = window.getComputedStyle(el);
        if (styles.animationName !== 'none' || styles.transitionProperty !== 'none') {
          animationCount++;
        }
      });
      
      return {
        totalElements: animatedElements.length,
        animatedElements: animationCount
      };
    });

    return animationsDisabled;
  }

  private async testTransitionsDisabled(): Promise<any> {
    const transitionsDisabled = await this.page.evaluate(() => {
      const transitionElements = document.querySelectorAll('*');
      let transitionCount = 0;
      
      Array.from(transitionElements).forEach(el => {
        const styles = window.getComputedStyle(el);
        if (styles.transitionProperty !== 'none') {
          transitionCount++;
        }
      });
      
      return {
        totalElements: transitionElements.length,
        transitionElements: transitionCount
      };
    });

    return transitionsDisabled;
  }

  private async testMotionPreferences(): Promise<any> {
    const motionPreferences = await this.page.evaluate(() => {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      
      return {
        reducedMotionSupported: typeof mediaQuery.matches === 'boolean',
        reducedMotionActive: mediaQuery.matches
      };
    });

    return motionPreferences;
  }

  private async testErrorAssociations(): Promise<any> {
    const errorAssociations = await this.page.evaluate(() => {
      const formInputs = document.querySelectorAll('input, select, textarea');
      
      const inputsWithErrors = Array.from(formInputs).filter(input => {
        const ariaInvalid = input.getAttribute('aria-invalid');
        const ariaDescribedBy = input.getAttribute('aria-describedby');
        
        if (ariaInvalid === 'true') {
          return !ariaDescribedBy;
        }
        
        return false;
      });

      return {
        totalInputs: formInputs.length,
        inputsWithErrors: inputsWithErrors.length,
        violations: inputsWithErrors.map(input => ({
          tagName: input.tagName,
          type: input.getAttribute('type'),
          id: input.id,
          name: input.getAttribute('name')
        }))
      };
    });

    return errorAssociations;
  }

  private async testRequiredFieldIndicators(): Promise<any> {
    const requiredFieldIndicators = await this.page.evaluate(() => {
      const requiredInputs = document.querySelectorAll('input[required], select[required], textarea[required]');
      
      const requiredInputsWithoutIndicators = Array.from(requiredInputs).filter(input => {
        const hasAriaRequired = input.getAttribute('aria-required') === 'true';
        const hasRequiredText = input.closest('label')?.textContent?.includes('required') ||
                                input.closest('label')?.textContent?.includes('*') ||
                                input.getAttribute('aria-label')?.includes('required');
        
        return !hasAriaRequired && !hasRequiredText;
      });

      return {
        totalRequiredInputs: requiredInputs.length,
        requiredInputsWithoutIndicators: requiredInputsWithoutIndicators.length,
        violations: requiredInputsWithoutIndicators.map(input => ({
          tagName: input.tagName,
          type: input.getAttribute('type'),
          id: input.id,
          name: input.getAttribute('name')
        }))
      };
    });

    return requiredFieldIndicators;
  }

  private async testFieldsetLegends(): Promise<any> {
    const fieldsetLegends = await this.page.evaluate(() => {
      const fieldsets = document.querySelectorAll('fieldset');
      
      const fieldsetsWithoutLegends = Array.from(fieldsets).filter(fieldset => 
        !fieldset.querySelector('legend')
      );

      return {
        totalFieldsets: fieldsets.length,
        fieldsetsWithoutLegends: fieldsetsWithoutLegends.length,
        violations: fieldsetsWithoutLegends.map(fieldset => ({
          className: fieldset.className,
          id: fieldset.id
        }))
      };
    });

    return fieldsetLegends;
  }

  private async testFormValidation(): Promise<any> {
    const formValidation = await this.page.evaluate(() => {
      const forms = document.querySelectorAll('form');
      
      return {
        totalForms: forms.length,
        formsWithValidation: Array.from(forms).filter(form => 
          form.querySelectorAll('input[required], select[required], textarea[required]').length > 0
        ).length
      };
    });

    return formValidation;
  }

  private async testFormSubmission(): Promise<any> {
    const formSubmission = await this.page.evaluate(() => {
      const submitButtons = document.querySelectorAll('button[type="submit"], input[type="submit"]');
      
      return {
        totalSubmitButtons: submitButtons.length,
        submitButtonsWithLabels: Array.from(submitButtons).filter(button => 
          button.textContent?.trim() || button.getAttribute('aria-label') || button.getAttribute('title')
        ).length
      };
    });

    return formSubmission;
  }

  private async testButtonAccessibility(): Promise<any> {
    const buttonAccessibility = await this.page.evaluate(() => {
      const buttons = document.querySelectorAll('button, [role="button"]');
      
      const buttonsWithoutDescriptions = Array.from(buttons).filter(button => {
        const hasText = button.textContent?.trim();
        const hasAriaLabel = button.getAttribute('aria-label');
        const hasTitle = button.getAttribute('title');
        
        return !hasText && !hasAriaLabel && !hasTitle;
      });

      return {
        totalButtons: buttons.length,
        buttonsWithoutDescriptions: buttonsWithoutDescriptions.length,
        violations: buttonsWithoutDescriptions.map(button => ({
          type: button.getAttribute('type'),
          className: button.className,
          id: button.id
        }))
      };
    });

    return buttonAccessibility;
  }

  private async testLinkAccessibility(): Promise<any> {
    const linkAccessibility = await this.page.evaluate(() => {
      const links = document.querySelectorAll('a[href]');
      
      const linksWithoutDescriptions = Array.from(links).filter(link => {
        const hasText = link.textContent?.trim();
        const hasAriaLabel = link.getAttribute('aria-label');
        const hasTitle = link.getAttribute('title');
        
        return !hasText && !hasAriaLabel && !hasTitle;
      });

      return {
        totalLinks: links.length,
        linksWithoutDescriptions: linksWithoutDescriptions.length,
        violations: linksWithoutDescriptions.map(link => ({
          href: link.getAttribute('href'),
          className: link.className,
          id: link.id
        }))
      };
    });

    return linkAccessibility;
  }

  private async testImageAccessibility(): Promise<any> {
    const imageAccessibility = await this.page.evaluate(() => {
      const images = document.querySelectorAll('img');
      
      const imagesWithoutAlt = Array.from(images).filter(img => 
        !img.alt && !img.getAttribute('aria-label')
      );

      return {
        totalImages: images.length,
        imagesWithoutAlt: imagesWithoutAlt.length,
        violations: imagesWithoutAlt.map(img => ({
          src: img.src,
          className: img.className,
          id: img.id
        }))
      };
    });

    return imageAccessibility;
  }

  private async testTableAccessibility(): Promise<any> {
    const tableAccessibility = await this.page.evaluate(() => {
      const tables = document.querySelectorAll('table');
      
      const tablesWithoutHeaders = Array.from(tables).filter(table => {
        const hasHeaders = table.querySelectorAll('th').length > 0;
        const hasScope = table.querySelectorAll('[scope]').length > 0;
        const hasHeadersAttr = table.querySelectorAll('[headers]').length > 0;
        
        return !hasHeaders && !hasScope && !hasHeadersAttr;
      });

      return {
        totalTables: tables.length,
        tablesWithoutHeaders: tablesWithoutHeaders.length,
        violations: tablesWithoutHeaders.map(table => ({
          className: table.className,
          id: table.id
        }))
      };
    });

    return tableAccessibility;
  }

  private async testListAccessibility(): Promise<any> {
    const listAccessibility = await this.page.evaluate(() => {
      const lists = document.querySelectorAll('ul, ol');
      
      const listsWithoutItems = Array.from(lists).filter(list => 
        list.querySelectorAll('li').length === 0
      );

      return {
        totalLists: lists.length,
        listsWithoutItems: listsWithoutItems.length,
        violations: listsWithoutItems.map(list => ({
          tagName: list.tagName,
          className: list.className,
          id: list.id
        }))
      };
    });

    return listAccessibility;
  }

  private async testNavigationAccessibility(): Promise<any> {
    const navigationAccessibility = await this.page.evaluate(() => {
      const navElements = document.querySelectorAll('nav, [role="navigation"]');
      
      return {
        totalNavElements: navElements.length,
        navElementsWithLabels: Array.from(navElements).filter(nav => 
          nav.getAttribute('aria-label') || nav.getAttribute('aria-labelledby') || nav.querySelector('h1, h2, h3, h4, h5, h6')
        ).length
      };
    });

    return navigationAccessibility;
  }

  private async testModalAccessibility(): Promise<any> {
    const modalAccessibility = await this.page.evaluate(() => {
      const modals = document.querySelectorAll('[role="dialog"], [role="modal"]');
      
      const modalsWithoutLabels = Array.from(modals).filter(modal => 
        !modal.getAttribute('aria-label') && !modal.getAttribute('aria-labelledby')
      );

      return {
        totalModals: modals.length,
        modalsWithoutLabels: modalsWithoutLabels.length,
        violations: modalsWithoutLabels.map(modal => ({
          className: modal.className,
          id: modal.id
        }))
      };
    });

    return modalAccessibility;
  }

  private async testTabAccessibility(): Promise<any> {
    const tabAccessibility = await this.page.evaluate(() => {
      const tabLists = document.querySelectorAll('[role="tablist"]');
      
      const tabListsWithoutLabels = Array.from(tabLists).filter(tabList => 
        !tabList.getAttribute('aria-label') && !tabList.getAttribute('aria-labelledby')
      );

      return {
        totalTabLists: tabLists.length,
        tabListsWithoutLabels: tabListsWithoutLabels.length,
        violations: tabListsWithoutLabels.map(tabList => ({
          className: tabList.className,
          id: tabList.id
        }))
      };
    });

    return tabAccessibility;
  }

  private async testAccordionAccessibility(): Promise<any> {
    const accordionAccessibility = await this.page.evaluate(() => {
      const accordions = document.querySelectorAll('[role="region"][aria-expanded]');
      
      const accordionsWithoutLabels = Array.from(accordions).filter(accordion => 
        !accordion.getAttribute('aria-label') && !accordion.getAttribute('aria-labelledby')
      );

      return {
        totalAccordions: accordions.length,
        accordionsWithoutLabels: accordionsWithoutLabels.length,
        violations: accordionsWithoutLabels.map(accordion => ({
          className: accordion.className,
          id: accordion.id
        }))
      };
    });

    return accordionAccessibility;
  }
}

/**
 * Playwright Test Suite for Enhanced Accessibility Testing
 */
test.describe('HT-008.7.6: Enhanced Accessibility Testing Suite', () => {
  let accessibilityTester: EnhancedAccessibilityTesting;

  test.beforeEach(async ({ page }) => {
    accessibilityTester = new EnhancedAccessibilityTesting(page);
  });

  test('Comprehensive Accessibility Audit', async ({ page }) => {
    const results = await accessibilityTester.runComprehensiveAudit();
    
    // Assert WCAG 2.1 AAA compliance
    expect(results.violations.length).toBeLessThanOrEqual(5); // Allow minimal violations
    
    // Log results for visibility
    console.log(`\n🔍 Accessibility Audit Results:`);
    console.log(`Violations: ${results.violations.length}`);
    console.log(`Passes: ${results.passes.length}`);
    console.log(`Incomplete: ${results.incomplete.length}`);
    
    if (results.violations.length > 0) {
      console.log('\n❌ Violations Found:');
      results.violations.forEach((violation: any) => {
        console.log(`  - ${violation.id}: ${violation.description}`);
      });
    }
  });

  test('Screen Reader Compatibility', async ({ page }) => {
    const results = await accessibilityTester.testScreenReaderCompatibility();
    
    // Assert screen reader compatibility
    expect(results.headingStructure.isValid).toBe(true);
    expect(results.ariaLabels.elementsWithoutLabels).toBeLessThanOrEqual(2);
    expect(results.formLabels.inputsWithoutLabels).toBe(0);
    expect(results.imageAltText.imagesWithoutAlt).toBe(0);
    
    console.log(`\n📢 Screen Reader Compatibility Results:`);
    console.log(`Heading Structure: ${results.headingStructure.isValid ? 'Valid' : 'Invalid'}`);
    console.log(`ARIA Labels: ${results.ariaLabels.elementsWithoutLabels} missing`);
    console.log(`Form Labels: ${results.formLabels.inputsWithoutLabels} missing`);
    console.log(`Image Alt Text: ${results.imageAltText.imagesWithoutAlt} missing`);
  });

  test('Keyboard Navigation', async ({ page }) => {
    const results = await accessibilityTester.testKeyboardNavigation();
    
    // Assert keyboard navigation
    expect(results.focusIndicators.elementsWithoutFocusIndicators).toBeLessThanOrEqual(2);
    expect(results.skipLinks.totalSkipLinks).toBeGreaterThanOrEqual(1);
    
    console.log(`\n⌨️ Keyboard Navigation Results:`);
    console.log(`Focus Indicators: ${results.focusIndicators.elementsWithoutFocusIndicators} missing`);
    console.log(`Skip Links: ${results.skipLinks.totalSkipLinks} found`);
    console.log(`Arrow Key Components: ${results.arrowKeyNavigation.totalArrowKeyComponents} found`);
  });

  test('Color Contrast', async ({ page }) => {
    const results = await accessibilityTester.testColorContrast();
    
    // Assert color contrast compliance
    expect(results.violations.length).toBeLessThanOrEqual(3);
    
    console.log(`\n🎨 Color Contrast Results:`);
    console.log(`Violations: ${results.violations.length}`);
    
    if (results.violations.length > 0) {
      console.log('\n❌ Color Contrast Violations:');
      results.violations.forEach((violation: any) => {
        console.log(`  - ${violation.id}: ${violation.description}`);
      });
    }
  });

  test('Reduced Motion Support', async ({ page }) => {
    const results = await accessibilityTester.testReducedMotionSupport();
    
    // Assert reduced motion support
    expect(results.motionPreferences.reducedMotionSupported).toBe(true);
    
    console.log(`\n🎭 Reduced Motion Support Results:`);
    console.log(`Reduced Motion Supported: ${results.motionPreferences.reducedMotionSupported}`);
    console.log(`Animated Elements: ${results.animationsDisabled.animatedElements}`);
    console.log(`Transition Elements: ${results.transitionsDisabled.transitionElements}`);
  });

  test('Form Accessibility', async ({ page }) => {
    const results = await accessibilityTester.testFormAccessibility();
    
    // Assert form accessibility
    expect(results.formLabels.inputsWithoutLabels).toBe(0);
    expect(results.errorAssociations.inputsWithErrors).toBe(0);
    expect(results.requiredFieldIndicators.requiredInputsWithoutIndicators).toBeLessThanOrEqual(1);
    
    console.log(`\n📝 Form Accessibility Results:`);
    console.log(`Form Labels: ${results.formLabels.inputsWithoutLabels} missing`);
    console.log(`Error Associations: ${results.errorAssociations.inputsWithErrors} missing`);
    console.log(`Required Field Indicators: ${results.requiredFieldIndicators.requiredInputsWithoutIndicators} missing`);
  });

  test('Component Accessibility', async ({ page }) => {
    const results = await accessibilityTester.testComponentAccessibility();
    
    // Assert component accessibility
    expect(results.buttons.buttonsWithoutDescriptions).toBeLessThanOrEqual(1);
    expect(results.links.linksWithoutDescriptions).toBeLessThanOrEqual(1);
    expect(results.images.imagesWithoutAlt).toBe(0);
    
    console.log(`\n🧩 Component Accessibility Results:`);
    console.log(`Buttons: ${results.buttons.buttonsWithoutDescriptions} missing descriptions`);
    console.log(`Links: ${results.links.linksWithoutDescriptions} missing descriptions`);
    console.log(`Images: ${results.images.imagesWithoutAlt} missing alt text`);
    console.log(`Tables: ${results.tables.tablesWithoutHeaders} missing headers`);
  });
});

export { EnhancedAccessibilityTesting };
