import {
  Template,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  TemplateVariable,
  TemplateSection,
  DocumentTemplate
} from './types'

export class TemplateValidator {
  async validate(template: Template): Promise<ValidationResult> {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Validate basic template structure
    this.validateBasicStructure(template, errors)

    // Validate schema
    this.validateSchema(template, errors, warnings)

    // Validate content
    this.validateContent(template, errors, warnings)

    // Validate metadata
    this.validateMetadata(template, errors, warnings)

    // Validate branding if present
    if (template.branding) {
      this.validateBranding(template, errors, warnings)
    }

    // Validate inheritance if present
    if (template.inheritance) {
      this.validateInheritance(template, errors, warnings)
    }

    // Document-specific validation
    if (template.type === 'document') {
      this.validateDocumentTemplate(template as DocumentTemplate, errors, warnings)
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  private validateBasicStructure(template: Template, errors: ValidationError[]): void {
    // Required fields
    if (!template.id) {
      errors.push({
        path: 'id',
        message: 'Template must have an ID',
        code: 'MISSING_ID',
        severity: 'error'
      })
    }

    if (!template.name) {
      errors.push({
        path: 'name',
        message: 'Template must have a name',
        code: 'MISSING_NAME',
        severity: 'error'
      })
    }

    if (!template.version) {
      errors.push({
        path: 'version',
        message: 'Template must have a version',
        code: 'MISSING_VERSION',
        severity: 'error'
      })
    }

    if (!template.type) {
      errors.push({
        path: 'type',
        message: 'Template must have a type',
        code: 'MISSING_TYPE',
        severity: 'error'
      })
    }

    // Valid types
    const validTypes = ['document', 'page', 'component', 'layout']
    if (template.type && !validTypes.includes(template.type)) {
      errors.push({
        path: 'type',
        message: `Invalid template type: ${template.type}. Must be one of: ${validTypes.join(', ')}`,
        code: 'INVALID_TYPE',
        severity: 'error'
      })
    }

    // Version format validation
    if (template.version && !this.isValidVersion(template.version)) {
      errors.push({
        path: 'version',
        message: 'Version must follow semantic versioning format (e.g., 1.0.0)',
        code: 'INVALID_VERSION_FORMAT',
        severity: 'error'
      })
    }
  }

  private validateSchema(template: Template, errors: ValidationError[], warnings: ValidationWarning[]): void {
    if (!template.schema) {
      errors.push({
        path: 'schema',
        message: 'Template must have a schema',
        code: 'MISSING_SCHEMA',
        severity: 'error'
      })
      return
    }

    // Validate variables
    if (template.schema.variables) {
      template.schema.variables.forEach((variable, index) => {
        this.validateVariable(variable, `schema.variables[${index}]`, errors, warnings)
      })
    }

    // Validate sections
    if (template.schema.sections) {
      template.schema.sections.forEach((section, index) => {
        this.validateSection(section, `schema.sections[${index}]`, errors, warnings)
      })
    }

    // Validate layout
    if (!template.schema.layout) {
      warnings.push({
        path: 'schema.layout',
        message: 'Template should have layout configuration',
        code: 'MISSING_LAYOUT',
        suggestion: 'Add layout configuration for better rendering'
      })
    }

    // Validate styling
    if (!template.schema.styling) {
      warnings.push({
        path: 'schema.styling',
        message: 'Template should have styling configuration',
        code: 'MISSING_STYLING',
        suggestion: 'Add styling configuration for consistent appearance'
      })
    }
  }

  private validateVariable(
    variable: TemplateVariable,
    path: string,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    if (!variable.name) {
      errors.push({
        path: `${path}.name`,
        message: 'Variable must have a name',
        code: 'MISSING_VARIABLE_NAME',
        severity: 'error'
      })
    }

    if (!variable.type) {
      errors.push({
        path: `${path}.type`,
        message: 'Variable must have a type',
        code: 'MISSING_VARIABLE_TYPE',
        severity: 'error'
      })
    }

    const validTypes = ['text', 'number', 'date', 'boolean', 'array', 'object']
    if (variable.type && !validTypes.includes(variable.type)) {
      errors.push({
        path: `${path}.type`,
        message: `Invalid variable type: ${variable.type}. Must be one of: ${validTypes.join(', ')}`,
        code: 'INVALID_VARIABLE_TYPE',
        severity: 'error'
      })
    }

    if (variable.name && !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(variable.name)) {
      errors.push({
        path: `${path}.name`,
        message: 'Variable name must be a valid identifier (letters, numbers, underscore)',
        code: 'INVALID_VARIABLE_NAME',
        severity: 'error'
      })
    }

    if (variable.required && variable.defaultValue === undefined) {
      warnings.push({
        path: `${path}.defaultValue`,
        message: 'Required variable should have a default value',
        code: 'MISSING_DEFAULT_VALUE',
        suggestion: 'Consider providing a default value for better user experience'
      })
    }
  }

  private validateSection(
    section: TemplateSection,
    path: string,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    if (!section.id) {
      errors.push({
        path: `${path}.id`,
        message: 'Section must have an ID',
        code: 'MISSING_SECTION_ID',
        severity: 'error'
      })
    }

    if (!section.name) {
      errors.push({
        path: `${path}.name`,
        message: 'Section must have a name',
        code: 'MISSING_SECTION_NAME',
        severity: 'error'
      })
    }

    const validTypes = ['header', 'content', 'footer', 'sidebar', 'custom']
    if (section.type && !validTypes.includes(section.type)) {
      errors.push({
        path: `${path}.type`,
        message: `Invalid section type: ${section.type}. Must be one of: ${validTypes.join(', ')}`,
        code: 'INVALID_SECTION_TYPE',
        severity: 'error'
      })
    }

    if (!section.content) {
      warnings.push({
        path: `${path}.content`,
        message: 'Section should have content',
        code: 'EMPTY_SECTION',
        suggestion: 'Add content to make the section useful'
      })
    }
  }

  private validateContent(template: Template, errors: ValidationError[], warnings: ValidationWarning[]): void {
    if (!template.content) {
      errors.push({
        path: 'content',
        message: 'Template must have content',
        code: 'MISSING_CONTENT',
        severity: 'error'
      })
      return
    }

    if (!template.content.html) {
      errors.push({
        path: 'content.html',
        message: 'Template must have HTML content',
        code: 'MISSING_HTML_CONTENT',
        severity: 'error'
      })
    }

    // Validate HTML content
    if (template.content.html) {
      this.validateHtmlContent(template.content.html, errors, warnings)
    }

    // Validate CSS if present
    if (template.content.css) {
      this.validateCssContent(template.content.css, errors, warnings)
    }

    // Validate JavaScript if present
    if (template.content.javascript) {
      this.validateJavaScriptContent(template.content.javascript, errors, warnings)
    }

    // Validate assets if present
    if (template.content.assets) {
      template.content.assets.forEach((asset, index) => {
        this.validateAsset(asset, `content.assets[${index}]`, errors, warnings)
      })
    }
  }

  private validateHtmlContent(html: string, errors: ValidationError[], warnings: ValidationWarning[]): void {
    // Check for basic HTML structure
    if (!html.includes('<') || !html.includes('>')) {
      warnings.push({
        path: 'content.html',
        message: 'HTML content appears to be plain text',
        code: 'PLAIN_TEXT_HTML',
        suggestion: 'Consider adding HTML markup for better structure'
      })
    }

    // Check for unclosed tags (basic validation)
    const openTags = html.match(/<[^/][^>]*>/g) || []
    const closeTags = html.match(/<\/[^>]*>/g) || []

    if (openTags.length > closeTags.length + 5) { // Allow for self-closing tags
      warnings.push({
        path: 'content.html',
        message: 'Possible unclosed HTML tags detected',
        code: 'UNCLOSED_TAGS',
        suggestion: 'Check that all HTML tags are properly closed'
      })
    }

    // Check for script tags (security warning)
    if (html.includes('<script')) {
      warnings.push({
        path: 'content.html',
        message: 'Script tags detected in HTML content',
        code: 'SCRIPT_TAGS_PRESENT',
        suggestion: 'Consider moving JavaScript to the javascript field for better security'
      })
    }
  }

  private validateCssContent(css: string, errors: ValidationError[], warnings: ValidationWarning[]): void {
    // Basic CSS validation
    const openBraces = (css.match(/{/g) || []).length
    const closeBraces = (css.match(/}/g) || []).length

    if (openBraces !== closeBraces) {
      errors.push({
        path: 'content.css',
        message: 'CSS has mismatched braces',
        code: 'CSS_SYNTAX_ERROR',
        severity: 'error'
      })
    }
  }

  private validateJavaScriptContent(js: string, errors: ValidationError[], warnings: ValidationWarning[]): void {
    // Basic JavaScript validation
    if (js.includes('eval(')) {
      warnings.push({
        path: 'content.javascript',
        message: 'Use of eval() detected',
        code: 'EVAL_USAGE',
        suggestion: 'Avoid using eval() for security reasons'
      })
    }

    if (js.includes('document.write')) {
      warnings.push({
        path: 'content.javascript',
        message: 'Use of document.write detected',
        code: 'DOCUMENT_WRITE_USAGE',
        suggestion: 'Use modern DOM manipulation methods instead'
      })
    }
  }

  private validateAsset(asset: any, path: string, errors: ValidationError[], warnings: ValidationWarning[]): void {
    if (!asset.id) {
      errors.push({
        path: `${path}.id`,
        message: 'Asset must have an ID',
        code: 'MISSING_ASSET_ID',
        severity: 'error'
      })
    }

    if (!asset.name) {
      errors.push({
        path: `${path}.name`,
        message: 'Asset must have a name',
        code: 'MISSING_ASSET_NAME',
        severity: 'error'
      })
    }

    if (!asset.url) {
      errors.push({
        path: `${path}.url`,
        message: 'Asset must have a URL',
        code: 'MISSING_ASSET_URL',
        severity: 'error'
      })
    }

    const validTypes = ['image', 'font', 'icon', 'document']
    if (asset.type && !validTypes.includes(asset.type)) {
      errors.push({
        path: `${path}.type`,
        message: `Invalid asset type: ${asset.type}. Must be one of: ${validTypes.join(', ')}`,
        code: 'INVALID_ASSET_TYPE',
        severity: 'error'
      })
    }
  }

  private validateMetadata(template: Template, errors: ValidationError[], warnings: ValidationWarning[]): void {
    if (!template.metadata) {
      errors.push({
        path: 'metadata',
        message: 'Template must have metadata',
        code: 'MISSING_METADATA',
        severity: 'error'
      })
      return
    }

    if (!template.metadata.id) {
      errors.push({
        path: 'metadata.id',
        message: 'Metadata must have an ID',
        code: 'MISSING_METADATA_ID',
        severity: 'error'
      })
    }

    if (!template.metadata.name) {
      errors.push({
        path: 'metadata.name',
        message: 'Metadata must have a name',
        code: 'MISSING_METADATA_NAME',
        severity: 'error'
      })
    }

    if (!template.metadata.category) {
      warnings.push({
        path: 'metadata.category',
        message: 'Template should have a category',
        code: 'MISSING_CATEGORY',
        suggestion: 'Add a category for better organization'
      })
    }

    if (!template.metadata.tags || template.metadata.tags.length === 0) {
      warnings.push({
        path: 'metadata.tags',
        message: 'Template should have tags',
        code: 'MISSING_TAGS',
        suggestion: 'Add tags for better discoverability'
      })
    }
  }

  private validateBranding(template: Template, errors: ValidationError[], warnings: ValidationWarning[]): void {
    const branding = template.branding!

    if (!branding.id) {
      errors.push({
        path: 'branding.id',
        message: 'Branding must have an ID',
        code: 'MISSING_BRANDING_ID',
        severity: 'error'
      })
    }

    if (!branding.clientId) {
      errors.push({
        path: 'branding.clientId',
        message: 'Branding must have a client ID',
        code: 'MISSING_CLIENT_ID',
        severity: 'error'
      })
    }

    if (!branding.colorPalette) {
      warnings.push({
        path: 'branding.colorPalette',
        message: 'Branding should have a color palette',
        code: 'MISSING_COLOR_PALETTE',
        suggestion: 'Add colors for consistent branding'
      })
    }
  }

  private validateInheritance(template: Template, errors: ValidationError[], warnings: ValidationWarning[]): void {
    const inheritance = template.inheritance!

    if (!inheritance.parentId) {
      errors.push({
        path: 'inheritance.parentId',
        message: 'Inheritance must have a parent ID',
        code: 'MISSING_PARENT_ID',
        severity: 'error'
      })
    }

    if (!inheritance.overrides) {
      warnings.push({
        path: 'inheritance.overrides',
        message: 'Inheritance should have overrides',
        code: 'MISSING_OVERRIDES',
        suggestion: 'Define what to override from the parent template'
      })
    }
  }

  private validateDocumentTemplate(
    template: DocumentTemplate,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    if (!template.documentType) {
      errors.push({
        path: 'documentType',
        message: 'Document template must have a document type',
        code: 'MISSING_DOCUMENT_TYPE',
        severity: 'error'
      })
    }

    const validDocTypes = ['pdf', 'html', 'docx', 'txt']
    if (template.documentType && !validDocTypes.includes(template.documentType)) {
      errors.push({
        path: 'documentType',
        message: `Invalid document type: ${template.documentType}. Must be one of: ${validDocTypes.join(', ')}`,
        code: 'INVALID_DOCUMENT_TYPE',
        severity: 'error'
      })
    }

    if (!template.pageSettings) {
      warnings.push({
        path: 'pageSettings',
        message: 'Document template should have page settings',
        code: 'MISSING_PAGE_SETTINGS',
        suggestion: 'Add page settings for proper document formatting'
      })
    }
  }

  private isValidVersion(version: string): boolean {
    // Basic semantic versioning check
    return /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$/.test(version)
  }

  // Utility method for validating template variables against data
  validateTemplateData(template: Template, data: any): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    template.schema.variables.forEach(variable => {
      const value = data[variable.name]

      if (variable.required && (value === undefined || value === null || value === '')) {
        errors.push({
          path: `data.${variable.name}`,
          message: `Required variable '${variable.name}' is missing`,
          code: 'MISSING_REQUIRED_VARIABLE',
          severity: 'error'
        })
      }

      if (value !== undefined && value !== null) {
        // Type validation
        const actualType = this.getValueType(value)
        if (variable.type !== actualType && variable.type !== 'text') {
          warnings.push({
            path: `data.${variable.name}`,
            message: `Variable '${variable.name}' expected ${variable.type} but got ${actualType}`,
            code: 'TYPE_MISMATCH',
            suggestion: `Convert value to ${variable.type} type`
          })
        }

        // Custom validation rules
        if (variable.validation) {
          variable.validation.forEach(rule => {
            const validationResult = this.validateValue(value, rule)
            if (!validationResult.valid) {
              errors.push({
                path: `data.${variable.name}`,
                message: rule.message || `Validation failed for ${variable.name}`,
                code: 'VALIDATION_FAILED',
                severity: 'error'
              })
            }
          })
        }
      }
    })

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  private getValueType(value: any): string {
    if (typeof value === 'string') return 'text'
    if (typeof value === 'number') return 'number'
    if (typeof value === 'boolean') return 'boolean'
    if (value instanceof Date) return 'date'
    if (Array.isArray(value)) return 'array'
    if (typeof value === 'object') return 'object'
    return 'text'
  }

  private validateValue(value: any, rule: any): { valid: boolean; message?: string } {
    switch (rule.type) {
      case 'required':
        return { valid: value !== undefined && value !== null && value !== '' }
      case 'minLength':
        return { valid: String(value).length >= rule.value }
      case 'maxLength':
        return { valid: String(value).length <= rule.value }
      case 'pattern':
        return { valid: new RegExp(rule.value).test(String(value)) }
      case 'custom':
        // For custom validation, we'd need to evaluate the rule
        return { valid: true }
      default:
        return { valid: true }
    }
  }
}