/**
 * Manifest Renderer Core Engine
 *
 * This is the heart of the configuration-first system that takes JSON manifests
 * and renders them into live React components. Supports template and form manifests
 * with full theme customization, conditional logic, and error boundaries.
 */

import React, { Suspense, useMemo } from 'react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { TemplateManifest, FormManifest, BaseComponent, FormField } from '../../types/componentContracts';
import { getComponentRegistry } from './ComponentRegistry';
import { ThemeProvider } from './ThemeProvider';
import { ValidationProvider } from './ValidationProvider';
import { AnalyticsProvider } from './AnalyticsProvider';
import { ConditionalLogicEngine } from './ConditionalLogicEngine';
import designTokens from '../../design-tokens.json';

// Error boundary for individual components
class ComponentErrorBoundary extends React.Component<
  { children: React.ReactNode; componentId?: string; fallback?: React.ComponentType },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component render error:', error, errorInfo);

    // Send to analytics if available
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('Component Render Error', {
        componentId: this.props.componentId,
        error: error.message,
        stack: error.stack
      });
    }
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent componentId={this.props.componentId} error={this.state.error} />;
    }

    return this.props.children;
  }
}

// Default error fallback component
const DefaultErrorFallback: React.FC<{ componentId?: string; error?: Error }> = ({
  componentId,
  error
}) => (
  <div className="component-error-fallback" role="alert">
    <div className="error-icon">⚠️</div>
    <div className="error-content">
      <h3>Component Error</h3>
      <p>Failed to render component {componentId || 'unknown'}</p>
      {process.env.NODE_ENV === 'development' && error && (
        <details className="error-details">
          <summary>Error Details</summary>
          <pre>{error.message}</pre>
        </details>
      )}
    </div>
  </div>
);

// Loading fallback for Suspense
const ComponentLoadingFallback: React.FC<{ componentType?: string }> = ({ componentType }) => (
  <div className="component-loading-fallback">
    <div className="loading-skeleton">
      <div className="skeleton-content">
        <div className="skeleton-line skeleton-title"></div>
        <div className="skeleton-line skeleton-text"></div>
        <div className="skeleton-line skeleton-text short"></div>
      </div>
    </div>
    <span className="sr-only">Loading {componentType || 'component'}...</span>
  </div>
);

// Main renderer interface
export interface RendererProps {
  manifest: TemplateManifest | FormManifest;
  mode?: 'preview' | 'live' | 'edit';
  viewport?: 'desktop' | 'tablet' | 'mobile';
  onComponentInteraction?: (componentId: string, action: string, data?: any) => void;
  onValidationError?: (errors: ValidationError[]) => void;
  customComponents?: Record<string, React.ComponentType<any>>;
  analytics?: boolean;
  className?: string;
}

export interface ValidationError {
  componentId: string;
  fieldId?: string;
  message: string;
  type: 'required' | 'format' | 'custom';
}

// Template Renderer Component
const TemplateRenderer: React.FC<{
  manifest: TemplateManifest;
  props: RendererProps
}> = ({ manifest, props }) => {
  const { mode, viewport, onComponentInteraction, customComponents } = props;
  const componentRegistry = getComponentRegistry();
  const conditionalEngine = useMemo(() => new ConditionalLogicEngine(), []);

  // Merge theme settings
  const themeConfig = useMemo(() => {
    if (manifest.theme?.useSiteDefaults) {
      return designTokens;
    }

    return {
      ...designTokens,
      ...manifest.theme?.overrides
    };
  }, [manifest.theme]);

  // Filter and sort components
  const visibleComponents = useMemo(() => {
    return manifest.components
      .filter(component => {
        // Check conditional logic
        if (component.conditional) {
          return conditionalEngine.evaluateCondition(component.conditional, manifest.components);
        }
        return true;
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [manifest.components, conditionalEngine]);

  // Render individual component
  const renderComponent = (component: BaseComponent) => {
    const ComponentClass = customComponents?.[component.type] ||
                          componentRegistry.getComponent(component.type, component.version);

    if (!ComponentClass) {
      console.warn(`Component type "${component.type}" not found in registry`);
      return (
        <DefaultErrorFallback
          componentId={component.id}
          error={new Error(`Unknown component type: ${component.type}`)}
        />
      );
    }

    const componentProps = {
      ...component.props,
      componentId: component.id,
      mode,
      viewport,
      theme: themeConfig,
      onInteraction: (action: string, data?: any) => {
        onComponentInteraction?.(component.id, action, data);

        // Track analytics if enabled
        if (component.analytics?.enabled && props.analytics) {
          trackComponentInteraction(component.id, action, data);
        }
      }
    };

    return (
      <ComponentErrorBoundary
        key={component.id}
        componentId={component.id}
        fallback={DefaultErrorFallback}
      >
        <Suspense fallback={<ComponentLoadingFallback componentType={component.type} />}>
          <ComponentClass {...componentProps} />
        </Suspense>
      </ComponentErrorBoundary>
    );
  };

  return (
    <div
      className={`template-renderer ${mode} ${viewport}`}
      data-template-id={manifest.id}
      data-template-version={manifest.meta.version}
    >
      {visibleComponents.map(renderComponent)}
    </div>
  );
};

// Form Renderer Component
const FormRenderer: React.FC<{
  manifest: FormManifest;
  props: RendererProps
}> = ({ manifest, props }) => {
  const { mode, viewport, onValidationError, analytics } = props;
  const [formData, setFormData] = React.useState<Record<string, any>>({});
  const [errors, setErrors] = React.useState<ValidationError[]>([]);
  const conditionalEngine = useMemo(() => new ConditionalLogicEngine(), []);

  // Merge theme settings
  const themeConfig = useMemo(() => {
    if (manifest.theme?.useSiteDefaults) {
      return designTokens;
    }

    return {
      ...designTokens,
      ...manifest.theme?.overrides
    };
  }, [manifest.theme]);

  // Filter visible fields based on conditional logic
  const visibleFields = useMemo(() => {
    return manifest.fields
      .filter(field => {
        if (field.conditional) {
          return conditionalEngine.evaluateFieldCondition(field.conditional, formData);
        }
        return true;
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [manifest.fields, formData, conditionalEngine]);

  // Handle field value changes
  const handleFieldChange = (fieldId: string, value: any) => {
    const newFormData = { ...formData, [fieldId]: value };
    setFormData(newFormData);

    // Validate field if real-time validation is enabled
    if (manifest.validation?.realtime) {
      const field = manifest.fields.find(f => f.id === fieldId);
      if (field) {
        const fieldErrors = validateField(field, value, newFormData);
        setErrors(prev => [
          ...prev.filter(e => e.fieldId !== fieldId),
          ...fieldErrors
        ]);
      }
    }

    // Track field interaction
    if (analytics) {
      trackFieldInteraction(fieldId, 'change', value);
    }
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const allErrors: ValidationError[] = [];
    for (const field of visibleFields) {
      const fieldErrors = validateField(field, formData[field.id], formData);
      allErrors.push(...fieldErrors);
    }

    if (allErrors.length > 0) {
      setErrors(allErrors);
      onValidationError?.(allErrors);
      return;
    }

    // Process form submission
    try {
      await processFormSubmission(manifest, formData);

      // Track successful submission
      if (analytics) {
        trackFormSubmission(manifest.id, formData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      // Handle submission error
    }
  };

  // Render form field
  const renderField = (field: FormField) => {
    const fieldComponent = getFieldComponent(field.type);
    const fieldError = errors.find(e => e.fieldId === field.id);

    return (
      <ComponentErrorBoundary key={field.id} componentId={field.id}>
        <div className={`form-field ${field.type} ${fieldError ? 'has-error' : ''}`}>
          {fieldComponent({
            field,
            value: formData[field.id],
            onChange: (value: any) => handleFieldChange(field.id, value),
            error: fieldError,
            theme: themeConfig,
            mode,
            viewport
          })}
        </div>
      </ComponentErrorBoundary>
    );
  };

  return (
    <div
      className={`form-renderer ${mode} ${viewport}`}
      data-form-id={manifest.id}
      data-form-version={manifest.meta.version}
    >
      <form onSubmit={handleSubmit} noValidate>
        {manifest.settings?.title && (
          <div className="form-header">
            <h2 className="form-title">{manifest.settings.title}</h2>
            {manifest.settings.description && (
              <p className="form-description">{manifest.settings.description}</p>
            )}
          </div>
        )}

        <div className="form-fields">
          {visibleFields.map(renderField)}
        </div>

        {manifest.validation?.showErrorSummary && errors.length > 0 && (
          <div className="form-error-summary" role="alert">
            <h3>Please fix the following errors:</h3>
            <ul>
              {errors.map((error, index) => (
                <li key={index}>
                  <a href={`#field-${error.fieldId}`}>{error.message}</a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            className="submit-button"
            disabled={mode === 'preview'}
          >
            {manifest.settings?.submitButtonText || 'Submit'}
          </button>

          {manifest.settings?.showReset && (
            <button
              type="reset"
              className="reset-button"
              onClick={() => setFormData({})}
            >
              {manifest.settings.resetButtonText || 'Reset'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

// Main Manifest Renderer
export const ManifestRenderer: React.FC<RendererProps> = (props) => {
  const { manifest, analytics = true } = props;

  // Determine manifest type
  const isTemplate = 'components' in manifest;
  const isForm = 'fields' in manifest;

  if (!isTemplate && !isForm) {
    throw new Error('Invalid manifest: must contain either "components" or "fields"');
  }

  return (
    <ErrorBoundary fallback={<DefaultErrorFallback />}>
      <ThemeProvider theme={manifest.theme}>
        <ValidationProvider validation={manifest.validation}>
          <AnalyticsProvider enabled={analytics}>
            <div className={`manifest-renderer ${props.className || ''}`}>
              {isTemplate && (
                <TemplateRenderer
                  manifest={manifest as TemplateManifest}
                  props={props}
                />
              )}
              {isForm && (
                <FormRenderer
                  manifest={manifest as FormManifest}
                  props={props}
                />
              )}
            </div>
          </AnalyticsProvider>
        </ValidationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

// Helper functions
function validateField(field: FormField, value: any, formData: Record<string, any>): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required field validation
  if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    errors.push({
      componentId: field.id,
      fieldId: field.id,
      message: `${field.label} is required`,
      type: 'required'
    });
  }

  // Format validation
  if (value && field.validation) {
    if (field.validation.pattern) {
      const regex = new RegExp(field.validation.pattern);
      if (!regex.test(value)) {
        errors.push({
          componentId: field.id,
          fieldId: field.id,
          message: field.validation.patternMessage || 'Invalid format',
          type: 'format'
        });
      }
    }

    if (field.validation.minLength && value.length < field.validation.minLength) {
      errors.push({
        componentId: field.id,
        fieldId: field.id,
        message: `Minimum length is ${field.validation.minLength} characters`,
        type: 'format'
      });
    }

    if (field.validation.maxLength && value.length > field.validation.maxLength) {
      errors.push({
        componentId: field.id,
        fieldId: field.id,
        message: `Maximum length is ${field.validation.maxLength} characters`,
        type: 'format'
      });
    }
  }

  return errors;
}

function getFieldComponent(fieldType: string): React.ComponentType<any> {
  // Return appropriate field component based on type
  // This would be imported from the component registry
  const registry = getComponentRegistry();
  return registry.getFieldComponent(fieldType) || DefaultFieldComponent;
}

const DefaultFieldComponent: React.FC<any> = ({ field, value, onChange, error }) => (
  <div className="default-field">
    <label htmlFor={field.id}>{field.label}</label>
    <input
      id={field.id}
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      aria-invalid={!!error}
      aria-describedby={error ? `${field.id}-error` : undefined}
    />
    {error && (
      <div id={`${field.id}-error`} className="field-error" role="alert">
        {error.message}
      </div>
    )}
  </div>
);

async function processFormSubmission(manifest: FormManifest, data: Record<string, any>) {
  // Handle form submission based on manifest configuration
  if (manifest.submission?.type === 'email') {
    // Send email
    const response = await fetch('/api/forms/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        formId: manifest.id,
        data,
        submission: manifest.submission
      })
    });

    if (!response.ok) {
      throw new Error('Failed to submit form');
    }
  } else if (manifest.submission?.type === 'webhook') {
    // Send to webhook
    const response = await fetch(manifest.submission.target, {
      method: manifest.submission.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...manifest.submission.headers
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Webhook submission failed');
    }
  }
}

function trackComponentInteraction(componentId: string, action: string, data?: any) {
  if (typeof window !== 'undefined' && (window as any).analytics) {
    (window as any).analytics.track('Component Interaction', {
      componentId,
      action,
      data
    });
  }
}

function trackFieldInteraction(fieldId: string, action: string, value?: any) {
  if (typeof window !== 'undefined' && (window as any).analytics) {
    (window as any).analytics.track('Field Interaction', {
      fieldId,
      action,
      value: typeof value === 'string' ? value.substring(0, 100) : value
    });
  }
}

function trackFormSubmission(formId: string, data: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).analytics) {
    (window as any).analytics.track('Form Submission', {
      formId,
      fieldCount: Object.keys(data).length
    });
  }
}

export default ManifestRenderer;