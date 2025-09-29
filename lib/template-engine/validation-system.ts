export interface ValidationRule {
  id: string;
  name: string;
  type: 'required' | 'format' | 'range' | 'custom';
  field: string;
  condition: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion: string;
}

export interface TemplateSchema {
  version: string;
  fields: SchemaField[];
  rules: ValidationRule[];
  metadata: SchemaMetadata;
}

export interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  default?: any;
  validation?: FieldValidation;
  description: string;
}

export interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  enum?: any[];
  custom?: string;
}

export interface SchemaMetadata {
  name: string;
  version: string;
  description: string;
  author: string;
  created: string;
  updated: string;
}

export class ConfigurationValidator {
  private rules: ValidationRule[] = [];
  private schemas: Map<string, TemplateSchema> = new Map();

  constructor() {
    this.initializeDefaultRules();
  }

  private initializeDefaultRules(): void {
    this.rules = [
      {
        id: 'required-name',
        name: 'Required Name Field',
        type: 'required',
        field: 'name',
        condition: 'not_empty',
        message: 'Template name is required',
        severity: 'error'
      },
      {
        id: 'valid-version',
        name: 'Valid Version Format',
        type: 'format',
        field: 'version',
        condition: '^\\d+\\.\\d+\\.\\d+$',
        message: 'Version must follow semantic versioning (x.y.z)',
        severity: 'error'
      },
      {
        id: 'description-length',
        name: 'Description Length',
        type: 'range',
        field: 'description',
        condition: 'length:10,500',
        message: 'Description must be between 10 and 500 characters',
        severity: 'warning'
      },
      {
        id: 'valid-component-types',
        name: 'Valid Component Types',
        type: 'format',
        field: 'components.*.type',
        condition: '^(page|component|layout|api)$',
        message: 'Component type must be one of: page, component, layout, api',
        severity: 'error'
      }
    ];
  }

  public validateConfiguration(config: any, schemaId?: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Apply schema validation if schema is specified
    if (schemaId && this.schemas.has(schemaId)) {
      const schema = this.schemas.get(schemaId)!;
      this.validateAgainstSchema(config, schema, errors, warnings);
    }

    // Apply general validation rules
    this.validateWithRules(config, errors, warnings);

    const errorCount = errors.filter(e => e.severity === 'error').length;
    const score = Math.max(0, 100 - (errorCount * 20) - (warnings.length * 5));

    return {
      isValid: errorCount === 0,
      errors,
      warnings,
      score
    };
  }

  private validateAgainstSchema(
    config: any,
    schema: TemplateSchema,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    for (const field of schema.fields) {
      const value = this.getNestedValue(config, field.name);

      // Check required fields
      if (field.required && (value === undefined || value === null || value === '')) {
        errors.push({
          field: field.name,
          message: `Required field '${field.name}' is missing`,
          code: 'REQUIRED_FIELD_MISSING',
          severity: 'error'
        });
        continue;
      }

      // Type validation
      if (value !== undefined && !this.validateType(value, field.type)) {
        errors.push({
          field: field.name,
          message: `Field '${field.name}' must be of type ${field.type}`,
          code: 'INVALID_TYPE',
          severity: 'error'
        });
      }

      // Field-specific validation
      if (value !== undefined && field.validation) {
        this.validateFieldConstraints(field.name, value, field.validation, errors, warnings);
      }
    }
  }

  private validateWithRules(
    config: any,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    for (const rule of this.rules) {
      try {
        const isValid = this.applyRule(config, rule);
        if (!isValid) {
          if (rule.severity === 'error') {
            errors.push({
              field: rule.field,
              message: rule.message,
              code: rule.id.toUpperCase(),
              severity: 'error'
            });
          } else {
            warnings.push({
              field: rule.field,
              message: rule.message,
              suggestion: this.getSuggestion(rule)
            });
          }
        }
      } catch (error) {
        console.warn(`Error applying validation rule ${rule.id}:`, error);
      }
    }
  }

  private applyRule(config: any, rule: ValidationRule): boolean {
    const value = this.getNestedValue(config, rule.field);

    switch (rule.type) {
      case 'required':
        return value !== undefined && value !== null && value !== '';

      case 'format':
        if (value === undefined || value === null) return true;
        const regex = new RegExp(rule.condition);
        return regex.test(String(value));

      case 'range':
        if (value === undefined || value === null) return true;
        return this.validateRange(value, rule.condition);

      case 'custom':
        return this.validateCustom(value, rule.condition);

      default:
        return true;
    }
  }

  private validateType(value: any, type: string): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      default:
        return true;
    }
  }

  private validateFieldConstraints(
    fieldName: string,
    value: any,
    validation: FieldValidation,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    // Min/Max validation for numbers and strings
    if (validation.min !== undefined) {
      const length = typeof value === 'string' ? value.length : value;
      if (length < validation.min) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must be at least ${validation.min}`,
          code: 'MIN_VALUE_ERROR',
          severity: 'error'
        });
      }
    }

    if (validation.max !== undefined) {
      const length = typeof value === 'string' ? value.length : value;
      if (length > validation.max) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must not exceed ${validation.max}`,
          code: 'MAX_VALUE_ERROR',
          severity: 'error'
        });
      }
    }

    // Pattern validation
    if (validation.pattern && typeof value === 'string') {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(value)) {
        errors.push({
          field: fieldName,
          message: `${fieldName} does not match required pattern`,
          code: 'PATTERN_MISMATCH',
          severity: 'error'
        });
      }
    }

    // Enum validation
    if (validation.enum && !validation.enum.includes(value)) {
      errors.push({
        field: fieldName,
        message: `${fieldName} must be one of: ${validation.enum.join(', ')}`,
        code: 'INVALID_ENUM_VALUE',
        severity: 'error'
      });
    }
  }

  private validateRange(value: any, condition: string): boolean {
    const parts = condition.split(':');
    if (parts.length !== 2) return true;

    const [type, range] = parts;
    const [min, max] = range.split(',').map(Number);

    if (type === 'length') {
      const length = typeof value === 'string' ? value.length :
                   Array.isArray(value) ? value.length : 0;
      return length >= min && length <= max;
    }

    if (typeof value === 'number') {
      return value >= min && value <= max;
    }

    return true;
  }

  private validateCustom(value: any, condition: string): boolean {
    // Custom validation logic can be implemented here
    // For now, return true for all custom validations
    return true;
  }

  private getNestedValue(obj: any, path: string): any {
    if (path.includes('*.')) {
      // Handle wildcard paths like 'components.*.type'
      const parts = path.split('*.');
      if (parts.length === 2) {
        const [basePath, subPath] = parts;
        const baseValue = this.getNestedValue(obj, basePath.slice(0, -1));
        if (Array.isArray(baseValue)) {
          return baseValue.some(item => this.getNestedValue(item, subPath) !== undefined);
        }
      }
      return undefined;
    }

    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  private getSuggestion(rule: ValidationRule): string {
    switch (rule.id) {
      case 'description-length':
        return 'Consider adding more detail to help users understand the template purpose';
      case 'valid-version':
        return 'Use semantic versioning format like 1.0.0';
      default:
        return 'Please review the field requirements';
    }
  }

  public addCustomRule(rule: ValidationRule): void {
    this.rules.push(rule);
  }

  public removeRule(ruleId: string): void {
    this.rules = this.rules.filter(rule => rule.id !== ruleId);
  }

  public addSchema(schemaId: string, schema: TemplateSchema): void {
    this.schemas.set(schemaId, schema);
  }

  public getSchema(schemaId: string): TemplateSchema | undefined {
    return this.schemas.get(schemaId);
  }

  public listSchemas(): string[] {
    return Array.from(this.schemas.keys());
  }

  public validateSchema(schema: TemplateSchema): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate schema structure
    if (!schema.version) {
      errors.push({
        field: 'version',
        message: 'Schema version is required',
        code: 'SCHEMA_VERSION_MISSING',
        severity: 'error'
      });
    }

    if (!schema.fields || !Array.isArray(schema.fields)) {
      errors.push({
        field: 'fields',
        message: 'Schema must have a fields array',
        code: 'SCHEMA_FIELDS_MISSING',
        severity: 'error'
      });
    }

    // Validate field definitions
    if (schema.fields) {
      for (const field of schema.fields) {
        if (!field.name) {
          errors.push({
            field: 'fields',
            message: 'All fields must have a name',
            code: 'FIELD_NAME_MISSING',
            severity: 'error'
          });
        }

        if (!field.type) {
          errors.push({
            field: 'fields',
            message: `Field '${field.name}' must have a type`,
            code: 'FIELD_TYPE_MISSING',
            severity: 'error'
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, 100 - (errors.length * 20) - (warnings.length * 5))
    };
  }
}

export const configValidator = new ConfigurationValidator();