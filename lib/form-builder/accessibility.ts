import { FormField } from "@/components/form-builder/form-builder-engine"

export interface AccessibilityConfig {
  enableAriaLabels: boolean
  enableLiveRegions: boolean
  enableKeyboardNavigation: boolean
  enableFocusManagement: boolean
  enableScreenReaderSupport: boolean
  colorContrastMode: "normal" | "high" | "custom"
  fontSize: "normal" | "large" | "extra-large"
  animationReducedMotion: boolean
}

export interface AccessibilityAttributes {
  "aria-label"?: string
  "aria-labelledby"?: string
  "aria-describedby"?: string
  "aria-required"?: boolean
  "aria-invalid"?: boolean
  "aria-expanded"?: boolean
  "aria-controls"?: string
  "role"?: string
  "tabIndex"?: number
}

export interface FocusManagementOptions {
  autoFocus?: boolean
  trapFocus?: boolean
  restoreFocus?: boolean
  skipLinks?: boolean
}

export class AccessibilityManager {
  private config: AccessibilityConfig
  private focusHistory: HTMLElement[] = []

  constructor(config: Partial<AccessibilityConfig> = {}) {
    this.config = {
      enableAriaLabels: true,
      enableLiveRegions: true,
      enableKeyboardNavigation: true,
      enableFocusManagement: true,
      enableScreenReaderSupport: true,
      colorContrastMode: "normal",
      fontSize: "normal",
      animationReducedMotion: false,
      ...config
    }
  }

  generateFieldAttributes(field: FormField, hasError: boolean = false): AccessibilityAttributes {
    const attributes: AccessibilityAttributes = {}

    if (this.config.enableAriaLabels) {
      attributes["aria-label"] = field.label
      attributes["aria-required"] = field.required
      attributes["aria-invalid"] = hasError
    }

    if (field.placeholder && this.config.enableScreenReaderSupport) {
      attributes["aria-describedby"] = `${field.id}-description`
    }

    if (field.type === "select" || field.type === "radio" || field.type === "checkbox") {
      attributes["role"] = this.getAriaRole(field.type)
    }

    return attributes
  }

  generateDescriptionId(fieldId: string): string {
    return `${fieldId}-description`
  }

  generateErrorId(fieldId: string): string {
    return `${fieldId}-error`
  }

  generateFormItemId(fieldId: string): string {
    return `${fieldId}-form-item`
  }

  private getAriaRole(fieldType: string): string {
    const roleMap: Record<string, string> = {
      "select": "combobox",
      "radio": "radiogroup",
      "checkbox": "group",
      "rating": "slider",
      "slider": "slider"
    }
    return roleMap[fieldType] || "textbox"
  }

  createLiveRegion(type: "polite" | "assertive" = "polite"): HTMLElement {
    if (!this.config.enableLiveRegions) {
      return document.createElement("div")
    }

    const liveRegion = document.createElement("div")
    liveRegion.setAttribute("aria-live", type)
    liveRegion.setAttribute("aria-atomic", "true")
    liveRegion.className = "sr-only"
    liveRegion.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      border: 0;
    `
    document.body.appendChild(liveRegion)
    return liveRegion
  }

  announceToScreenReader(message: string, priority: "polite" | "assertive" = "polite"): void {
    if (!this.config.enableScreenReaderSupport) return

    const liveRegion = this.createLiveRegion(priority)
    liveRegion.textContent = message

    // Clean up after announcement
    setTimeout(() => {
      if (liveRegion.parentNode) {
        liveRegion.parentNode.removeChild(liveRegion)
      }
    }, 1000)
  }

  manageFocus(element: HTMLElement, options: FocusManagementOptions = {}): void {
    if (!this.config.enableFocusManagement) return

    if (options.autoFocus) {
      element.focus()
    }

    if (options.restoreFocus) {
      this.focusHistory.push(document.activeElement as HTMLElement)
    }
  }

  restorePreviousFocus(): void {
    if (this.focusHistory.length > 0) {
      const previousElement = this.focusHistory.pop()
      if (previousElement && document.contains(previousElement)) {
        previousElement.focus()
      }
    }
  }

  setupKeyboardNavigation(container: HTMLElement): void {
    if (!this.config.enableKeyboardNavigation) return

    container.addEventListener("keydown", (event) => {
      this.handleKeyboardNavigation(event)
    })
  }

  private handleKeyboardNavigation(event: KeyboardEvent): void {
    const { key, target } = event
    const element = target as HTMLElement

    switch (key) {
      case "Tab":
        this.handleTabNavigation(event)
        break
      case "Enter":
      case " ":
        this.handleActivation(event)
        break
      case "Escape":
        this.handleEscape(event)
        break
      case "ArrowUp":
      case "ArrowDown":
        this.handleArrowNavigation(event)
        break
    }
  }

  private handleTabNavigation(event: KeyboardEvent): void {
    const focusableElements = this.getFocusableElements()
    const currentIndex = focusableElements.indexOf(event.target as HTMLElement)

    if (event.shiftKey) {
      // Shift+Tab (backward)
      if (currentIndex === 0) {
        event.preventDefault()
        focusableElements[focusableElements.length - 1].focus()
      }
    } else {
      // Tab (forward)
      if (currentIndex === focusableElements.length - 1) {
        event.preventDefault()
        focusableElements[0].focus()
      }
    }
  }

  private handleActivation(event: KeyboardEvent): void {
    const element = event.target as HTMLElement
    const role = element.getAttribute("role")

    if (role === "button" || element.tagName === "BUTTON") {
      event.preventDefault()
      element.click()
    }
  }

  private handleEscape(event: KeyboardEvent): void {
    // Close modals, dropdowns, etc.
    const modal = document.querySelector('[role="dialog"]:not([aria-hidden="true"])')
    if (modal) {
      const closeButton = modal.querySelector('[data-dismiss="modal"]') as HTMLElement
      if (closeButton) {
        closeButton.click()
      }
    }
  }

  private handleArrowNavigation(event: KeyboardEvent): void {
    const element = event.target as HTMLElement
    const role = element.getAttribute("role")

    if (role === "radiogroup") {
      event.preventDefault()
      const radioButtons = element.querySelectorAll('input[type="radio"]')
      const currentIndex = Array.from(radioButtons).indexOf(event.target as HTMLInputElement)

      let nextIndex: number
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        nextIndex = (currentIndex + 1) % radioButtons.length
      } else {
        nextIndex = (currentIndex - 1 + radioButtons.length) % radioButtons.length
      }

      const nextRadio = radioButtons[nextIndex] as HTMLInputElement
      nextRadio.focus()
      nextRadio.checked = true
      nextRadio.dispatchEvent(new Event("change", { bubbles: true }))
    }
  }

  private getFocusableElements(): HTMLElement[] {
    const selector = `
      button:not([disabled]),
      [href],
      input:not([disabled]),
      select:not([disabled]),
      textarea:not([disabled]),
      [tabindex]:not([tabindex="-1"])
    `
    return Array.from(document.querySelectorAll(selector))
  }

  validateAccessibility(formElement: HTMLElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = []

    // Check for missing labels
    const inputs = formElement.querySelectorAll("input, textarea, select")
    inputs.forEach((input) => {
      const hasLabel = this.hasAssociatedLabel(input as HTMLElement)
      if (!hasLabel) {
        issues.push({
          type: "missing-label",
          element: input as HTMLElement,
          message: "Form control is missing an accessible label",
          severity: "error"
        })
      }
    })

    // Check color contrast
    if (this.config.colorContrastMode !== "normal") {
      const colorIssues = this.checkColorContrast(formElement)
      issues.push(...colorIssues)
    }

    // Check focus indicators
    const focusableElements = formElement.querySelectorAll("button, input, select, textarea, [tabindex]")
    focusableElements.forEach((element) => {
      if (!this.hasFocusIndicator(element as HTMLElement)) {
        issues.push({
          type: "missing-focus-indicator",
          element: element as HTMLElement,
          message: "Element lacks visible focus indicator",
          severity: "warning"
        })
      }
    })

    return issues
  }

  private hasAssociatedLabel(element: HTMLElement): boolean {
    const id = element.id
    const ariaLabel = element.getAttribute("aria-label")
    const ariaLabelledBy = element.getAttribute("aria-labelledby")
    const label = id ? document.querySelector(`label[for="${id}"]`) : null

    return !!(ariaLabel || ariaLabelledBy || label)
  }

  private checkColorContrast(container: HTMLElement): AccessibilityIssue[] {
    // Simplified color contrast checking
    // In a real implementation, you'd use proper color contrast calculation
    const issues: AccessibilityIssue[] = []

    const elements = container.querySelectorAll("*")
    elements.forEach((element) => {
      const styles = window.getComputedStyle(element)
      const color = styles.color
      const backgroundColor = styles.backgroundColor

      // This is a simplified check - real implementation would calculate contrast ratio
      if (color === backgroundColor) {
        issues.push({
          type: "poor-contrast",
          element: element as HTMLElement,
          message: "Text color and background color have insufficient contrast",
          severity: "warning"
        })
      }
    })

    return issues
  }

  private hasFocusIndicator(element: HTMLElement): boolean {
    // Check if element has visible focus styles
    const styles = window.getComputedStyle(element, ":focus")
    const outline = styles.outline
    const boxShadow = styles.boxShadow

    return outline !== "none" || boxShadow !== "none"
  }

  applyAccessibilityEnhancements(formElement: HTMLElement): void {
    // Add skip links
    this.addSkipLinks(formElement)

    // Enhance form structure
    this.enhanceFormStructure(formElement)

    // Setup keyboard navigation
    this.setupKeyboardNavigation(formElement)

    // Add ARIA landmarks
    this.addAriaLandmarks(formElement)
  }

  private addSkipLinks(container: HTMLElement): void {
    const skipLink = document.createElement("a")
    skipLink.href = "#main-content"
    skipLink.textContent = "Skip to main content"
    skipLink.className = "skip-link sr-only focus:not-sr-only"
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: #000;
      color: #fff;
      padding: 8px;
      text-decoration: none;
      z-index: 1000;
    `

    skipLink.addEventListener("focus", () => {
      skipLink.style.top = "6px"
    })

    skipLink.addEventListener("blur", () => {
      skipLink.style.top = "-40px"
    })

    container.insertBefore(skipLink, container.firstChild)
  }

  private enhanceFormStructure(formElement: HTMLElement): void {
    // Add form role if not present
    if (!formElement.getAttribute("role")) {
      formElement.setAttribute("role", "form")
    }

    // Add fieldsets for grouped fields
    const fieldGroups = formElement.querySelectorAll("[data-field-group]")
    fieldGroups.forEach((group) => {
      if (group.tagName !== "FIELDSET") {
        const fieldset = document.createElement("fieldset")
        const legend = document.createElement("legend")
        legend.textContent = group.getAttribute("data-field-group") || "Form Section"
        fieldset.appendChild(legend)

        group.parentNode?.insertBefore(fieldset, group)
        fieldset.appendChild(group)
      }
    })
  }

  private addAriaLandmarks(container: HTMLElement): void {
    const form = container.querySelector("form")
    if (form && !form.getAttribute("aria-label")) {
      const title = container.querySelector("h1, h2, h3")?.textContent
      if (title) {
        form.setAttribute("aria-label", title)
      }
    }
  }
}

export interface AccessibilityIssue {
  type: "missing-label" | "poor-contrast" | "missing-focus-indicator" | "keyboard-trap" | "missing-alt-text"
  element: HTMLElement
  message: string
  severity: "error" | "warning" | "info"
}

export const defaultAccessibilityConfig: AccessibilityConfig = {
  enableAriaLabels: true,
  enableLiveRegions: true,
  enableKeyboardNavigation: true,
  enableFocusManagement: true,
  enableScreenReaderSupport: true,
  colorContrastMode: "normal",
  fontSize: "normal",
  animationReducedMotion: false
}

export function createAccessibilityManager(config?: Partial<AccessibilityConfig>): AccessibilityManager {
  return new AccessibilityManager(config)
}

export function getWCAGLevel(issues: AccessibilityIssue[]): "A" | "AA" | "AAA" | "Non-compliant" {
  const errorCount = issues.filter(issue => issue.severity === "error").length
  const warningCount = issues.filter(issue => issue.severity === "warning").length

  if (errorCount === 0 && warningCount === 0) return "AAA"
  if (errorCount === 0 && warningCount <= 2) return "AA"
  if (errorCount <= 1) return "A"
  return "Non-compliant"
}