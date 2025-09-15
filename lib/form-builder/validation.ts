import { z } from "zod"
import { ValidationRule } from "@/components/form-builder/form-builder-engine"

export interface ValidationRuleDefinition {
  type: ValidationRule["type"]
  name: string
  description: string
  hasValue: boolean
  valueType?: "string" | "number" | "boolean"
  defaultValue?: string | number | boolean
  placeholder?: string
  icon?: string
}

export const VALIDATION_RULES: ValidationRuleDefinition[] = [
  {
    type: "required",
    name: "Required",
    description: "Field must be filled out",
    hasValue: false,
    icon: "asterisk"
  },
  {
    type: "minLength",
    name: "Minimum Length",
    description: "Minimum number of characters",
    hasValue: true,
    valueType: "number",
    defaultValue: 1,
    placeholder: "Enter minimum length"
  },
  {
    type: "maxLength",
    name: "Maximum Length",
    description: "Maximum number of characters",
    hasValue: true,
    valueType: "number",
    defaultValue: 255,
    placeholder: "Enter maximum length"
  },
  {
    type: "pattern",
    name: "Pattern",
    description: "Must match regular expression pattern",
    hasValue: true,
    valueType: "string",
    placeholder: "Enter regex pattern"
  },
  {
    type: "email",
    name: "Email Format",
    description: "Must be a valid email address",
    hasValue: false
  },
  {
    type: "number",
    name: "Number Format",
    description: "Must be a valid number",
    hasValue: false
  }
]

export interface ValidationContext {
  fieldType: string
  fieldValue: any
  allFields: Record<string, any>
}

export class ValidationRuleEngine {
  static createValidator(rules: ValidationRule[]): z.ZodSchema<any> {
    let schema = z.string()

    for (const rule of rules) {
      switch (rule.type) {
        case "required":
          schema = schema.min(1, rule.message || "This field is required")
          break

        case "minLength":
          if (typeof rule.value === "number") {
            schema = schema.min(rule.value, rule.message || `Minimum ${rule.value} characters required`)
          }
          break

        case "maxLength":
          if (typeof rule.value === "number") {
            schema = schema.max(rule.value, rule.message || `Maximum ${rule.value} characters allowed`)
          }
          break

        case "pattern":
          if (typeof rule.value === "string") {
            try {
              const regex = new RegExp(rule.value)
              schema = schema.regex(regex, rule.message || "Invalid format")
            } catch (error) {
              console.warn(`Invalid regex pattern: ${rule.value}`)
            }
          }
          break

        case "email":
          schema = schema.email(rule.message || "Invalid email address")
          break

        case "number":
          return z.number({
            required_error: rule.message || "This field is required",
            invalid_type_error: rule.message || "Must be a valid number"
          })
      }
    }

    return schema
  }

  static validateField(value: any, rules: ValidationRule[], context?: ValidationContext): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    for (const rule of rules) {
      const error = this.validateSingleRule(value, rule, context)
      if (error) {
        errors.push(error)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  private static validateSingleRule(
    value: any,
    rule: ValidationRule,
    context?: ValidationContext
  ): string | null {
    switch (rule.type) {
      case "required":
        if (value === null || value === undefined || value === "") {
          return rule.message || "This field is required"
        }
        break

      case "minLength":
        if (typeof rule.value === "number" && typeof value === "string") {
          if (value.length < rule.value) {
            return rule.message || `Minimum ${rule.value} characters required`
          }
        }
        break

      case "maxLength":
        if (typeof rule.value === "number" && typeof value === "string") {
          if (value.length > rule.value) {
            return rule.message || `Maximum ${rule.value} characters allowed`
          }
        }
        break

      case "pattern":
        if (typeof rule.value === "string" && typeof value === "string") {
          try {
            const regex = new RegExp(rule.value)
            if (!regex.test(value)) {
              return rule.message || "Invalid format"
            }
          } catch (error) {
            return "Invalid validation pattern"
          }
        }
        break

      case "email":
        if (typeof value === "string") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(value)) {
            return rule.message || "Invalid email address"
          }
        }
        break

      case "number":
        if (typeof value !== "number" && isNaN(Number(value))) {
          return rule.message || "Must be a valid number"
        }
        break
    }

    return null
  }

  static getDefaultValidationMessage(rule: ValidationRule): string {
    switch (rule.type) {
      case "required":
        return "This field is required"
      case "minLength":
        return `Minimum ${rule.value} characters required`
      case "maxLength":
        return `Maximum ${rule.value} characters allowed`
      case "pattern":
        return "Invalid format"
      case "email":
        return "Invalid email address"
      case "number":
        return "Must be a valid number"
      default:
        return "Invalid value"
    }
  }

  static createValidationSchema(fields: Array<{ id: string; validation?: ValidationRule[] }>): z.ZodSchema<any> {
    const schemaFields: Record<string, z.ZodSchema<any>> = {}

    for (const field of fields) {
      if (field.validation && field.validation.length > 0) {
        schemaFields[field.id] = this.createValidator(field.validation)
      } else {
        schemaFields[field.id] = z.string().optional()
      }
    }

    return z.object(schemaFields)
  }
}

export function getValidationRuleByType(type: ValidationRule["type"]): ValidationRuleDefinition | undefined {
  return VALIDATION_RULES.find(rule => rule.type === type)
}

export function getAllValidationRules(): ValidationRuleDefinition[] {
  return VALIDATION_RULES
}

export function getApplicableValidationRules(fieldType: string): ValidationRuleDefinition[] {
  const commonRules: ValidationRule["type"][] = ["required"]
  const textRules: ValidationRule["type"][] = ["minLength", "maxLength", "pattern"]
  const emailRules: ValidationRule["type"][] = ["email"]
  const numberRules: ValidationRule["type"][] = ["number"]

  let applicableTypes: ValidationRule["type"][] = [...commonRules]

  switch (fieldType) {
    case "text":
    case "textarea":
      applicableTypes.push(...textRules)
      break
    case "email":
      applicableTypes.push(...emailRules)
      break
    case "number":
      applicableTypes.push(...numberRules)
      break
    case "phone":
    case "url":
      applicableTypes.push("pattern" as ValidationRule["type"])
      break
  }

  return VALIDATION_RULES.filter(rule => applicableTypes.includes(rule.type))
}

export function createFormValidationSchema(formData: {
  fields: Array<{
    id: string
    type: string
    required: boolean
    validation?: ValidationRule[]
  }>
}): z.ZodSchema<any> {
  return ValidationRuleEngine.createValidationSchema(formData.fields)
}