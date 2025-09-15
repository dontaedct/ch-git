import { FormTemplate, FormField } from "@/components/form-builder/form-builder-engine"
import { ValidationRuleEngine } from "./validation"

export interface DataValidationConfig {
  enableServerSideValidation: boolean
  enableSanitization: boolean
  enableTypeCoercion: boolean
  enableSchemaValidation: boolean
  strictMode: boolean
  customValidators: Record<string, ValidatorFunction>
}

export interface ValidatorFunction {
  (value: any, context: ValidationContext): ValidationResult
}

export interface ValidationContext {
  field: FormField
  formData: Record<string, any>
  template: FormTemplate
  userAgent?: string
  timestamp: number
}

export interface ValidationResult {
  isValid: boolean
  transformedValue?: any
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  code: string
  message: string
  field?: string
  severity: "error" | "critical"
  details?: any
}

export interface ValidationWarning {
  code: string
  message: string
  field?: string
  type: "security" | "performance" | "usability" | "data_quality"
}

export interface SanitizationResult {
  sanitized: any
  changed: boolean
  issues: string[]
}

export interface DataTypeSchema {
  type: "string" | "number" | "boolean" | "array" | "object" | "date" | "email" | "url" | "phone"
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: string
  enum?: any[]
  items?: DataTypeSchema
  properties?: Record<string, DataTypeSchema>
}

export class DataValidationEngine {
  private config: DataValidationConfig
  private typeCoercionMap: Map<string, (value: any) => any> = new Map()
  private sanitizers: Map<string, (value: any) => SanitizationResult> = new Map()

  constructor(config: Partial<DataValidationConfig> = {}) {
    this.config = {
      enableServerSideValidation: true,
      enableSanitization: true,
      enableTypeCoercion: true,
      enableSchemaValidation: true,
      strictMode: false,
      customValidators: {},
      ...config
    }

    this.initializeTypeCoercion()
    this.initializeSanitizers()
  }

  async validateFormData(
    template: FormTemplate,
    formData: Record<string, any>,
    context: Partial<ValidationContext> = {}
  ): Promise<{ isValid: boolean; data: Record<string, any>; errors: ValidationError[]; warnings: ValidationWarning[] }> {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    const validatedData: Record<string, any> = {}

    const validationContext: ValidationContext = {
      template,
      formData,
      timestamp: Date.now(),
      ...context
    } as ValidationContext

    // Validate each field
    for (const field of template.fields) {
      const fieldValue = formData[field.id]
      validationContext.field = field

      try {
        const result = await this.validateField(field, fieldValue, validationContext)

        if (result.isValid) {
          validatedData[field.id] = result.transformedValue !== undefined ? result.transformedValue : fieldValue
        } else {
          errors.push(...result.errors)
        }

        warnings.push(...result.warnings)

      } catch (error) {
        errors.push({
          code: "VALIDATION_ERROR",
          message: `Validation failed for field ${field.id}`,
          field: field.id,
          severity: "error",
          details: error instanceof Error ? error.message : "Unknown error"
        })
      }
    }

    // Cross-field validation
    const crossFieldResult = await this.validateCrossFields(template, validatedData, validationContext)
    errors.push(...crossFieldResult.errors)
    warnings.push(...crossFieldResult.warnings)

    // Schema validation
    if (this.config.enableSchemaValidation) {
      const schemaResult = this.validateSchema(template, validatedData)
      errors.push(...schemaResult.errors)
      warnings.push(...schemaResult.warnings)
    }

    return {
      isValid: errors.length === 0,
      data: validatedData,
      errors,
      warnings
    }
  }

  private async validateField(
    field: FormField,
    value: any,
    context: ValidationContext
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    let transformedValue = value

    // Skip validation for undefined optional fields
    if (value === undefined && !field.required) {
      return { isValid: true, transformedValue: undefined, errors: [], warnings: [] }
    }

    // Type coercion
    if (this.config.enableTypeCoercion) {
      const coercionResult = this.coerceType(field, value)
      transformedValue = coercionResult.value
      if (coercionResult.warnings.length > 0) {
        warnings.push(...coercionResult.warnings.map(w => ({
          code: "TYPE_COERCION",
          message: w,
          field: field.id,
          type: "data_quality" as const
        })))
      }
    }

    // Sanitization
    if (this.config.enableSanitization) {
      const sanitizationResult = this.sanitizeValue(field, transformedValue)
      transformedValue = sanitizationResult.sanitized
      if (sanitizationResult.changed) {
        warnings.push({
          code: "DATA_SANITIZED",
          message: `Data was sanitized: ${sanitizationResult.issues.join(", ")}`,
          field: field.id,
          type: "security"
        })
      }
    }

    // Basic validation rules
    if (field.validation) {
      const ruleValidation = ValidationRuleEngine.validateField(transformedValue, field.validation)
      if (!ruleValidation.isValid) {
        errors.push(...ruleValidation.errors.map(error => ({
          code: "RULE_VALIDATION",
          message: error,
          field: field.id,
          severity: "error" as const
        })))
      }
    }

    // Custom validators
    const customValidator = this.config.customValidators[field.type]
    if (customValidator) {
      const customResult = customValidator(transformedValue, context)
      errors.push(...customResult.errors)
      warnings.push(...customResult.warnings)
      if (customResult.transformedValue !== undefined) {
        transformedValue = customResult.transformedValue
      }
    }

    // Field-specific validation
    const fieldSpecificResult = await this.validateFieldSpecific(field, transformedValue, context)
    errors.push(...fieldSpecificResult.errors)
    warnings.push(...fieldSpecificResult.warnings)
    if (fieldSpecificResult.transformedValue !== undefined) {
      transformedValue = fieldSpecificResult.transformedValue
    }

    return {
      isValid: errors.length === 0,
      transformedValue,
      errors,
      warnings
    }
  }

  private async validateFieldSpecific(
    field: FormField,
    value: any,
    context: ValidationContext
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    let transformedValue = value

    switch (field.type) {
      case "email":
        const emailResult = this.validateEmail(value)
        if (!emailResult.isValid) {
          errors.push(...emailResult.errors)
        }
        warnings.push(...emailResult.warnings)
        break

      case "phone":
        const phoneResult = this.validatePhone(value)
        if (!phoneResult.isValid) {
          errors.push(...phoneResult.errors)
        }
        warnings.push(...phoneResult.warnings)
        transformedValue = phoneResult.transformedValue || value
        break

      case "url":
        const urlResult = this.validateUrl(value)
        if (!urlResult.isValid) {
          errors.push(...urlResult.errors)
        }
        warnings.push(...urlResult.warnings)
        break

      case "date":
        const dateResult = this.validateDate(value)
        if (!dateResult.isValid) {
          errors.push(...dateResult.errors)
        }
        transformedValue = dateResult.transformedValue || value
        break

      case "number":
        const numberResult = this.validateNumber(value, field)
        if (!numberResult.isValid) {
          errors.push(...numberResult.errors)
        }
        transformedValue = numberResult.transformedValue || value
        break

      case "file":
        const fileResult = await this.validateFile(value, field)
        if (!fileResult.isValid) {
          errors.push(...fileResult.errors)
        }
        warnings.push(...fileResult.warnings)
        break
    }

    return { isValid: errors.length === 0, transformedValue, errors, warnings }
  }

  private validateEmail(value: string): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    if (typeof value !== "string") {
      errors.push({
        code: "INVALID_EMAIL_TYPE",
        message: "Email must be a string",
        severity: "error"
      })
      return { isValid: false, errors, warnings }
    }

    // Advanced email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      errors.push({
        code: "INVALID_EMAIL_FORMAT",
        message: "Invalid email format",
        severity: "error"
      })
    }

    // Check for disposable email domains
    const disposableDomains = [
      "10minutemail.com", "tempmail.org", "guerrillamail.com",
      "mailinator.com", "yopmail.com"
    ]
    const domain = value.split("@")[1]?.toLowerCase()
    if (domain && disposableDomains.includes(domain)) {
      warnings.push({
        code: "DISPOSABLE_EMAIL",
        message: "Disposable email address detected",
        type: "data_quality"
      })
    }

    // Check for suspicious patterns
    if (value.includes("..") || value.startsWith(".") || value.endsWith(".")) {
      warnings.push({
        code: "SUSPICIOUS_EMAIL",
        message: "Email contains suspicious patterns",
        type: "data_quality"
      })
    }

    return { isValid: errors.length === 0, errors, warnings }
  }

  private validatePhone(value: string): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    let transformedValue = value

    if (typeof value !== "string") {
      errors.push({
        code: "INVALID_PHONE_TYPE",
        message: "Phone number must be a string",
        severity: "error"
      })
      return { isValid: false, errors, warnings }
    }

    // Remove formatting and validate
    const cleaned = value.replace(/\D/g, "")

    if (cleaned.length < 10) {
      errors.push({
        code: "PHONE_TOO_SHORT",
        message: "Phone number is too short",
        severity: "error"
      })
    } else if (cleaned.length > 15) {
      errors.push({
        code: "PHONE_TOO_LONG",
        message: "Phone number is too long",
        severity: "error"
      })
    }

    // Format phone number
    if (cleaned.length === 10) {
      transformedValue = `+1${cleaned}`
    } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
      transformedValue = `+${cleaned}`
    }

    return { isValid: errors.length === 0, transformedValue, errors, warnings }
  }

  private validateUrl(value: string): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    if (typeof value !== "string") {
      errors.push({
        code: "INVALID_URL_TYPE",
        message: "URL must be a string",
        severity: "error"
      })
      return { isValid: false, errors, warnings }
    }

    try {
      const url = new URL(value)

      // Check for secure protocols
      if (url.protocol !== "https:" && url.protocol !== "http:") {
        warnings.push({
          code: "INSECURE_PROTOCOL",
          message: "URL uses insecure protocol",
          type: "security"
        })
      }

      // Check for suspicious domains
      const suspiciousTlds = [".tk", ".ml", ".ga", ".cf"]
      if (suspiciousTlds.some(tld => url.hostname.endsWith(tld))) {
        warnings.push({
          code: "SUSPICIOUS_DOMAIN",
          message: "URL uses suspicious domain",
          type: "security"
        })
      }

    } catch (error) {
      errors.push({
        code: "INVALID_URL_FORMAT",
        message: "Invalid URL format",
        severity: "error"
      })
    }

    return { isValid: errors.length === 0, errors, warnings }
  }

  private validateDate(value: any): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    let transformedValue = value

    if (typeof value === "string") {
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        errors.push({
          code: "INVALID_DATE_FORMAT",
          message: "Invalid date format",
          severity: "error"
        })
      } else {
        transformedValue = date.toISOString()

        // Check for reasonable date ranges
        const currentYear = new Date().getFullYear()
        const year = date.getFullYear()

        if (year < 1900 || year > currentYear + 10) {
          warnings.push({
            code: "UNUSUAL_DATE_RANGE",
            message: "Date is outside typical range",
            type: "data_quality"
          })
        }
      }
    }

    return { isValid: errors.length === 0, transformedValue, errors, warnings }
  }

  private validateNumber(value: any, field: FormField): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    let transformedValue = value

    const numValue = Number(value)
    if (isNaN(numValue)) {
      errors.push({
        code: "INVALID_NUMBER",
        message: "Value is not a valid number",
        severity: "error"
      })
      return { isValid: false, errors, warnings }
    }

    transformedValue = numValue

    // Check for reasonable ranges based on field context
    const fieldId = field.id.toLowerCase()
    if (fieldId.includes("age")) {
      if (numValue < 0 || numValue > 150) {
        warnings.push({
          code: "UNUSUAL_AGE",
          message: "Age value seems unusual",
          type: "data_quality"
        })
      }
    } else if (fieldId.includes("salary") || fieldId.includes("income")) {
      if (numValue < 0) {
        errors.push({
          code: "NEGATIVE_SALARY",
          message: "Salary cannot be negative",
          severity: "error"
        })
      } else if (numValue > 10000000) {
        warnings.push({
          code: "UNUSUAL_SALARY",
          message: "Salary value seems unusually high",
          type: "data_quality"
        })
      }
    }

    return { isValid: errors.length === 0, transformedValue, errors, warnings }
  }

  private async validateFile(value: File | File[], field: FormField): Promise<ValidationResult> {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    if (!value) {
      return { isValid: true, errors, warnings }
    }

    const files = Array.isArray(value) ? value : [value]

    for (const file of files) {
      if (!(file instanceof File)) {
        errors.push({
          code: "INVALID_FILE_TYPE",
          message: "Invalid file object",
          severity: "error"
        })
        continue
      }

      // Size validation
      const maxSize = 10 * 1024 * 1024 // 10MB default
      if (file.size > maxSize) {
        errors.push({
          code: "FILE_TOO_LARGE",
          message: `File ${file.name} is too large (max ${maxSize / 1024 / 1024}MB)`,
          severity: "error"
        })
      }

      // Type validation
      const allowedTypes = field.options?.[0]?.split(",") || ["*/*"]
      if (!allowedTypes.includes("*/*")) {
        const isAllowed = allowedTypes.some(type => {
          if (type.endsWith("/*")) {
            return file.type.startsWith(type.slice(0, -1))
          }
          return file.type === type
        })

        if (!isAllowed) {
          errors.push({
            code: "INVALID_FILE_FORMAT",
            message: `File type ${file.type} is not allowed`,
            severity: "error"
          })
        }
      }

      // Security checks
      const dangerousExtensions = [".exe", ".scr", ".bat", ".cmd", ".com", ".pif", ".vbs", ".js"]
      const extension = file.name.toLowerCase().substring(file.name.lastIndexOf("."))
      if (dangerousExtensions.includes(extension)) {
        errors.push({
          code: "DANGEROUS_FILE_TYPE",
          message: `File type ${extension} is not allowed for security reasons`,
          severity: "critical"
        })
      }
    }

    return { isValid: errors.length === 0, errors, warnings }
  }

  private async validateCrossFields(
    template: FormTemplate,
    formData: Record<string, any>,
    context: ValidationContext
  ): Promise<{ errors: ValidationError[]; warnings: ValidationWarning[] }> {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Password confirmation validation
    const passwordField = template.fields.find(f => f.type === "password" || f.id.includes("password"))
    const confirmField = template.fields.find(f => f.id.includes("confirm") && f.id.includes("password"))

    if (passwordField && confirmField) {
      const password = formData[passwordField.id]
      const confirm = formData[confirmField.id]

      if (password !== confirm) {
        errors.push({
          code: "PASSWORD_MISMATCH",
          message: "Passwords do not match",
          field: confirmField.id,
          severity: "error"
        })
      }
    }

    // Date range validation
    const startDateField = template.fields.find(f => f.id.includes("start") && f.type === "date")
    const endDateField = template.fields.find(f => f.id.includes("end") && f.type === "date")

    if (startDateField && endDateField) {
      const startDate = new Date(formData[startDateField.id])
      const endDate = new Date(formData[endDateField.id])

      if (startDate > endDate) {
        errors.push({
          code: "INVALID_DATE_RANGE",
          message: "Start date must be before end date",
          field: endDateField.id,
          severity: "error"
        })
      }
    }

    return { errors, warnings }
  }

  private validateSchema(
    template: FormTemplate,
    formData: Record<string, any>
  ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Generate schema from template
    const schema = this.generateSchema(template)

    // Validate against schema
    const result = this.validateAgainstSchema(formData, schema)
    errors.push(...result.errors)
    warnings.push(...result.warnings)

    return { errors, warnings }
  }

  private generateSchema(template: FormTemplate): DataTypeSchema {
    const properties: Record<string, DataTypeSchema> = {}

    template.fields.forEach(field => {
      properties[field.id] = this.fieldToSchema(field)
    })

    return {
      type: "object",
      properties
    }
  }

  private fieldToSchema(field: FormField): DataTypeSchema {
    const schema: DataTypeSchema = {
      type: this.mapFieldTypeToSchemaType(field.type),
      required: field.required
    }

    // Add validation constraints
    if (field.validation) {
      field.validation.forEach(rule => {
        switch (rule.type) {
          case "minLength":
            if (typeof rule.value === "number") schema.minLength = rule.value
            break
          case "maxLength":
            if (typeof rule.value === "number") schema.maxLength = rule.value
            break
          case "pattern":
            if (typeof rule.value === "string") schema.pattern = rule.value
            break
        }
      })
    }

    // Add options as enum
    if (field.options && field.options.length > 0) {
      schema.enum = field.options
    }

    return schema
  }

  private mapFieldTypeToSchemaType(fieldType: string): DataTypeSchema["type"] {
    const typeMap: Record<string, DataTypeSchema["type"]> = {
      "text": "string",
      "textarea": "string",
      "email": "email",
      "phone": "phone",
      "url": "url",
      "number": "number",
      "date": "date",
      "select": "string",
      "radio": "string",
      "checkbox": "array",
      "switch": "boolean",
      "file": "object"
    }

    return typeMap[fieldType] || "string"
  }

  private validateAgainstSchema(
    data: Record<string, any>,
    schema: DataTypeSchema
  ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    if (schema.type === "object" && schema.properties) {
      Object.entries(schema.properties).forEach(([key, fieldSchema]) => {
        const value = data[key]

        if (fieldSchema.required && (value === undefined || value === null)) {
          errors.push({
            code: "SCHEMA_REQUIRED_FIELD",
            message: `Required field ${key} is missing`,
            field: key,
            severity: "error"
          })
        }

        if (value !== undefined && value !== null) {
          const fieldResult = this.validateValueAgainstSchema(value, fieldSchema, key)
          errors.push(...fieldResult.errors)
          warnings.push(...fieldResult.warnings)
        }
      })
    }

    return { errors, warnings }
  }

  private validateValueAgainstSchema(
    value: any,
    schema: DataTypeSchema,
    fieldName: string
  ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Type validation
    if (!this.isValidType(value, schema.type)) {
      errors.push({
        code: "SCHEMA_TYPE_MISMATCH",
        message: `Field ${fieldName} has incorrect type`,
        field: fieldName,
        severity: "error"
      })
    }

    // Length validation for strings
    if (typeof value === "string") {
      if (schema.minLength && value.length < schema.minLength) {
        errors.push({
          code: "SCHEMA_MIN_LENGTH",
          message: `Field ${fieldName} is too short`,
          field: fieldName,
          severity: "error"
        })
      }

      if (schema.maxLength && value.length > schema.maxLength) {
        errors.push({
          code: "SCHEMA_MAX_LENGTH",
          message: `Field ${fieldName} is too long`,
          field: fieldName,
          severity: "error"
        })
      }

      if (schema.pattern) {
        const regex = new RegExp(schema.pattern)
        if (!regex.test(value)) {
          errors.push({
            code: "SCHEMA_PATTERN_MISMATCH",
            message: `Field ${fieldName} does not match required pattern`,
            field: fieldName,
            severity: "error"
          })
        }
      }
    }

    // Range validation for numbers
    if (typeof value === "number") {
      if (schema.min !== undefined && value < schema.min) {
        errors.push({
          code: "SCHEMA_MIN_VALUE",
          message: `Field ${fieldName} is below minimum value`,
          field: fieldName,
          severity: "error"
        })
      }

      if (schema.max !== undefined && value > schema.max) {
        errors.push({
          code: "SCHEMA_MAX_VALUE",
          message: `Field ${fieldName} exceeds maximum value`,
          field: fieldName,
          severity: "error"
        })
      }
    }

    // Enum validation
    if (schema.enum && !schema.enum.includes(value)) {
      errors.push({
        code: "SCHEMA_INVALID_ENUM",
        message: `Field ${fieldName} has invalid value`,
        field: fieldName,
        severity: "error"
      })
    }

    return { errors, warnings }
  }

  private isValidType(value: any, expectedType: DataTypeSchema["type"]): boolean {
    switch (expectedType) {
      case "string":
        return typeof value === "string"
      case "number":
        return typeof value === "number" && !isNaN(value)
      case "boolean":
        return typeof value === "boolean"
      case "array":
        return Array.isArray(value)
      case "object":
        return typeof value === "object" && value !== null
      case "date":
        return !isNaN(new Date(value).getTime())
      case "email":
        return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      case "url":
        try {
          new URL(value)
          return true
        } catch {
          return false
        }
      case "phone":
        return typeof value === "string" && /^\+?[\d\s\-\(\)]{10,}$/.test(value)
      default:
        return true
    }
  }

  private coerceType(field: FormField, value: any): { value: any; warnings: string[] } {
    const warnings: string[] = []
    let coercedValue = value

    switch (field.type) {
      case "number":
        if (typeof value === "string" && value.trim() !== "") {
          const num = Number(value)
          if (!isNaN(num)) {
            coercedValue = num
            warnings.push("String converted to number")
          }
        }
        break

      case "boolean":
      case "switch":
        if (typeof value === "string") {
          const lower = value.toLowerCase()
          if (["true", "yes", "1", "on"].includes(lower)) {
            coercedValue = true
            warnings.push("String converted to boolean")
          } else if (["false", "no", "0", "off"].includes(lower)) {
            coercedValue = false
            warnings.push("String converted to boolean")
          }
        }
        break

      case "date":
        if (typeof value === "string") {
          const date = new Date(value)
          if (!isNaN(date.getTime())) {
            coercedValue = date.toISOString()
            warnings.push("String converted to ISO date")
          }
        }
        break

      case "checkbox":
        if (!Array.isArray(value) && value !== undefined) {
          coercedValue = [value]
          warnings.push("Single value converted to array")
        }
        break
    }

    return { value: coercedValue, warnings }
  }

  private sanitizeValue(field: FormField, value: any): SanitizationResult {
    const issues: string[] = []
    let sanitized = value
    let changed = false

    if (typeof value === "string") {
      // XSS protection
      const xssPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi
      if (xssPattern.test(value)) {
        sanitized = value.replace(xssPattern, "")
        issues.push("Removed script tags")
        changed = true
      }

      // Remove dangerous attributes
      const dangerousAttrs = /on\w+\s*=/gi
      if (dangerousAttrs.test(value)) {
        sanitized = sanitized.replace(dangerousAttrs, "")
        issues.push("Removed dangerous attributes")
        changed = true
      }

      // Trim whitespace
      const trimmed = value.trim()
      if (trimmed !== value) {
        sanitized = trimmed
        issues.push("Trimmed whitespace")
        changed = true
      }

      // Remove null bytes
      if (value.includes("\0")) {
        sanitized = sanitized.replace(/\0/g, "")
        issues.push("Removed null bytes")
        changed = true
      }
    }

    return { sanitized, changed, issues }
  }

  private initializeTypeCoercion(): void {
    this.typeCoercionMap.set("number", (value) => {
      const num = Number(value)
      return isNaN(num) ? value : num
    })

    this.typeCoercionMap.set("boolean", (value) => {
      if (typeof value === "string") {
        const lower = value.toLowerCase()
        if (["true", "yes", "1"].includes(lower)) return true
        if (["false", "no", "0"].includes(lower)) return false
      }
      return Boolean(value)
    })

    this.typeCoercionMap.set("date", (value) => {
      if (typeof value === "string") {
        const date = new Date(value)
        return isNaN(date.getTime()) ? value : date.toISOString()
      }
      return value
    })
  }

  private initializeSanitizers(): void {
    this.sanitizers.set("string", (value) => {
      if (typeof value !== "string") return { sanitized: value, changed: false, issues: [] }

      const issues: string[] = []
      let sanitized = value
      let changed = false

      // Basic HTML sanitization
      const htmlPattern = /<[^>]*>/g
      if (htmlPattern.test(value)) {
        sanitized = value.replace(htmlPattern, "")
        issues.push("Removed HTML tags")
        changed = true
      }

      return { sanitized, changed, issues }
    })
  }

  // Public API methods
  addCustomValidator(fieldType: string, validator: ValidatorFunction): void {
    this.config.customValidators[fieldType] = validator
  }

  removeCustomValidator(fieldType: string): void {
    delete this.config.customValidators[fieldType]
  }

  updateConfig(config: Partial<DataValidationConfig>): void {
    this.config = { ...this.config, ...config }
  }

  getConfig(): DataValidationConfig {
    return { ...this.config }
  }
}

export const defaultDataValidationConfig: DataValidationConfig = {
  enableServerSideValidation: true,
  enableSanitization: true,
  enableTypeCoercion: true,
  enableSchemaValidation: true,
  strictMode: false,
  customValidators: {}
}

export function createDataValidationEngine(config?: Partial<DataValidationConfig>): DataValidationEngine {
  return new DataValidationEngine(config)
}