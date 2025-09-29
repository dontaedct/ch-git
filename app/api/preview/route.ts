/**
 * Preview API Endpoints
 *
 * Provides API endpoints for generating live previews and thumbnails from manifests.
 * Supports both template and form manifests with caching and error handling.
 */

import { NextRequest, NextResponse } from 'next/server';
import { TemplateManifest, FormManifest } from '../../../types/componentContracts';
import { validateTemplate, validateForm } from '../../../lib/validation/manifest-validator';

// Preview generation endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { manifest, options = {} } = body;

    if (!manifest) {
      return NextResponse.json(
        { error: 'Manifest is required' },
        { status: 400 }
      );
    }

    // Validate manifest
    const validationResult = validateManifest(manifest);
    if (!validationResult.valid) {
      return NextResponse.json(
        {
          error: 'Invalid manifest',
          validationErrors: validationResult.errors
        },
        { status: 400 }
      );
    }

    // Generate preview based on type
    const isTemplate = 'components' in manifest;
    const previewData = isTemplate
      ? await generateTemplatePreview(manifest, options)
      : await generateFormPreview(manifest, options);

    return NextResponse.json({
      success: true,
      preview: previewData,
      cacheKey: generateCacheKey(manifest),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
    });

  } catch (error) {
    console.error('Preview generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 }
    );
  }
}

// Thumbnail generation endpoint
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { manifest, viewport = 'desktop', format = 'png' } = body;

    if (!manifest) {
      return NextResponse.json(
        { error: 'Manifest is required' },
        { status: 400 }
      );
    }

    // Validate manifest
    const validationResult = validateManifest(manifest);
    if (!validationResult.valid) {
      return NextResponse.json(
        {
          error: 'Invalid manifest',
          validationErrors: validationResult.errors
        },
        { status: 400 }
      );
    }

    // Generate thumbnail
    const thumbnailData = await generateThumbnail(manifest, {
      viewport,
      format,
      width: getViewportWidth(viewport),
      height: getViewportHeight(viewport)
    });

    return NextResponse.json({
      success: true,
      thumbnail: thumbnailData,
      cacheKey: generateThumbnailCacheKey(manifest, viewport),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
    });

  } catch (error) {
    console.error('Thumbnail generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate thumbnail' },
      { status: 500 }
    );
  }
}

// Validate manifest endpoint
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { manifest } = body;

    if (!manifest) {
      return NextResponse.json(
        { error: 'Manifest is required' },
        { status: 400 }
      );
    }

    const validationResult = validateManifest(manifest);

    return NextResponse.json({
      valid: validationResult.valid,
      errors: validationResult.errors || [],
      warnings: validationResult.warnings || [],
      manifest_type: validationResult.type
    });

  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 500 }
    );
  }
}

// Helper functions
function validateManifest(manifest: any): {
  valid: boolean;
  errors?: any[];
  warnings?: string[];
  type: 'template' | 'form' | 'unknown';
} {
  try {
    // Determine manifest type
    const isTemplate = 'components' in manifest;
    const isForm = 'fields' in manifest;

    if (!isTemplate && !isForm) {
      return {
        valid: false,
        errors: [{ message: 'Manifest must contain either components or fields' }],
        type: 'unknown'
      };
    }

    // Validate against appropriate schema
    if (isTemplate) {
      const result = validateTemplate(manifest);
      return {
        valid: result,
        errors: result ? [] : [{ message: 'Template validation failed' }],
        type: 'template'
      };
    } else {
      const result = validateForm(manifest);
      return {
        valid: result,
        errors: result ? [] : [{ message: 'Form validation failed' }],
        type: 'form'
      };
    }
  } catch (error) {
    return {
      valid: false,
      errors: [{ message: (error as Error).message }],
      type: 'unknown'
    };
  }
}

async function generateTemplatePreview(manifest: TemplateManifest, options: any) {
  // Generate HTML preview for template
  const components = manifest.components
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map(component => generateComponentHTML(component, manifest.theme));

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Template Preview</title>
      <style>
        ${generateThemeCSS(manifest.theme)}
        ${getBasePreviewCSS()}
      </style>
    </head>
    <body>
      <div class="preview-container" data-template-id="${manifest.id}">
        ${components.join('')}
      </div>
    </body>
    </html>
  `;

  return {
    type: 'template',
    html,
    componentCount: manifest.components.length,
    themeMode: manifest.theme?.useSiteDefaults ? 'default' : 'custom'
  };
}

async function generateFormPreview(manifest: FormManifest, options: any) {
  // Generate HTML preview for form
  const fields = manifest.fields
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map(field => generateFieldHTML(field));

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Form Preview</title>
      <style>
        ${generateThemeCSS(manifest.theme)}
        ${getBasePreviewCSS()}
        ${getFormPreviewCSS()}
      </style>
    </head>
    <body>
      <div class="preview-container" data-form-id="${manifest.id}">
        <form class="form-preview" onsubmit="return false;">
          ${manifest.settings?.title ? `<h2 class="form-title">${manifest.settings.title}</h2>` : ''}
          ${manifest.settings?.description ? `<p class="form-description">${manifest.settings.description}</p>` : ''}
          <div class="form-fields">
            ${fields.join('')}
          </div>
          <div class="form-actions">
            <button type="submit" class="submit-button" disabled>
              ${manifest.settings?.submitButtonText || 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </body>
    </html>
  `;

  return {
    type: 'form',
    html,
    fieldCount: manifest.fields.length,
    layout: manifest.settings?.layout || 'vertical'
  };
}

function generateComponentHTML(component: any, theme?: any): string {
  switch (component.type) {
    case 'hero':
      return `
        <section class="component hero-section" data-component-id="${component.id}">
          <div class="hero-content">
            <h1 class="hero-title">${component.props.title || 'Hero Title'}</h1>
            ${component.props.subtitle ? `<p class="hero-subtitle">${component.props.subtitle}</p>` : ''}
            ${component.props.ctaText ? `
              <a href="${component.props.ctaUrl || '#'}" class="hero-cta">
                ${component.props.ctaText}
              </a>
            ` : ''}
          </div>
          ${component.props.backgroundImage ? `
            <div class="hero-background" style="background-image: url('${component.props.backgroundImage}')"></div>
          ` : ''}
        </section>
      `;

    case 'text':
      return `
        <section class="component text-section" data-component-id="${component.id}">
          <div class="text-content" style="text-align: ${component.props.alignment || 'left'}">
            ${component.props.content || '<p>Text content</p>'}
          </div>
        </section>
      `;

    case 'button':
      return `
        <section class="component button-section" data-component-id="${component.id}">
          <a href="${component.props.url || '#'}"
             class="button button-${component.props.style || 'primary'} button-${component.props.size || 'medium'}"
             ${component.props.openInNewTab ? 'target="_blank"' : ''}>
            ${component.props.text || 'Button'}
          </a>
        </section>
      `;

    case 'image':
      return `
        <section class="component image-section" data-component-id="${component.id}">
          <div class="image-container" style="text-align: ${component.props.alignment || 'center'}">
            <img src="${component.props.src || 'https://via.placeholder.com/600x400'}"
                 alt="${component.props.alt || 'Image'}"
                 class="responsive-image"
                 style="width: ${component.props.width === 'full' ? '100%' : component.props.width + '%'}">
            ${component.props.caption ? `<p class="image-caption">${component.props.caption}</p>` : ''}
          </div>
        </section>
      `;

    case 'form':
      return `
        <section class="component form-section" data-component-id="${component.id}">
          <div class="embedded-form">
            <p class="form-placeholder">📋 Embedded Form: ${component.props.formId || 'Form ID'}</p>
            ${component.props.title ? `<h3>${component.props.title}</h3>` : ''}
          </div>
        </section>
      `;

    default:
      return `
        <section class="component unknown-component" data-component-id="${component.id}">
          <div class="component-placeholder">
            <p>Unknown component: ${component.type}</p>
          </div>
        </section>
      `;
  }
}

function generateFieldHTML(field: any): string {
  const baseClasses = `field field-${field.type} ${field.required ? 'required' : 'optional'}`;

  switch (field.type) {
    case 'text':
    case 'email':
    case 'tel':
      return `
        <div class="${baseClasses}">
          <label for="${field.id}">${field.label}${field.required ? ' *' : ''}</label>
          <input type="${field.type}"
                 id="${field.id}"
                 placeholder="${field.placeholder || ''}"
                 ${field.required ? 'required' : ''}>
          ${field.description ? `<p class="field-description">${field.description}</p>` : ''}
        </div>
      `;

    case 'textarea':
      return `
        <div class="${baseClasses}">
          <label for="${field.id}">${field.label}${field.required ? ' *' : ''}</label>
          <textarea id="${field.id}"
                    placeholder="${field.placeholder || ''}"
                    rows="${field.rows || 4}"
                    ${field.required ? 'required' : ''}></textarea>
          ${field.description ? `<p class="field-description">${field.description}</p>` : ''}
        </div>
      `;

    case 'select':
      const options = (field.options || []).map((opt: any) =>
        `<option value="${opt.value}">${opt.label}</option>`
      ).join('');
      return `
        <div class="${baseClasses}">
          <label for="${field.id}">${field.label}${field.required ? ' *' : ''}</label>
          <select id="${field.id}" ${field.required ? 'required' : ''}>
            <option value="">${field.placeholder || 'Choose an option...'}</option>
            ${options}
          </select>
          ${field.description ? `<p class="field-description">${field.description}</p>` : ''}
        </div>
      `;

    case 'radio':
      const radioOptions = (field.options || []).map((opt: any, index: number) => `
        <label class="radio-option">
          <input type="radio" name="${field.id}" value="${opt.value}" ${opt.selected ? 'checked' : ''}>
          <span>${opt.label}</span>
        </label>
      `).join('');
      return `
        <div class="${baseClasses}">
          <fieldset>
            <legend>${field.label}${field.required ? ' *' : ''}</legend>
            <div class="radio-group">
              ${radioOptions}
            </div>
          </fieldset>
          ${field.description ? `<p class="field-description">${field.description}</p>` : ''}
        </div>
      `;

    case 'checkbox':
      return `
        <div class="${baseClasses}">
          <label class="checkbox-label">
            <input type="checkbox" id="${field.id}" ${field.defaultValue ? 'checked' : ''}>
            <span>${field.label}${field.required ? ' *' : ''}</span>
          </label>
          ${field.description ? `<p class="field-description">${field.description}</p>` : ''}
        </div>
      `;

    default:
      return `
        <div class="${baseClasses}">
          <label>${field.label}${field.required ? ' *' : ''}</label>
          <div class="field-placeholder">
            ${field.type} field (${field.id})
          </div>
        </div>
      `;
  }
}

function generateThemeCSS(theme?: any): string {
  if (!theme || theme.useSiteDefaults) {
    return '/* Using site default theme */';
  }

  let css = ':root {\n';

  if (theme.overrides?.palette) {
    Object.entries(theme.overrides.palette).forEach(([key, value]) => {
      css += `  --color-${key}: ${value};\n`;
    });
  }

  css += '}';
  return css;
}

function getBasePreviewCSS(): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f8fafc;
    }

    .preview-container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      min-height: 100vh;
    }

    .component {
      padding: 2rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .hero-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
      padding: 4rem 2rem;
      position: relative;
      overflow: hidden;
    }

    .hero-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-size: cover;
      background-position: center;
      opacity: 0.3;
    }

    .hero-content {
      position: relative;
      z-index: 1;
    }

    .hero-title {
      font-size: 3rem;
      font-weight: bold;
      margin-bottom: 1rem;
    }

    .hero-subtitle {
      font-size: 1.25rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }

    .hero-cta {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      padding: 0.75rem 2rem;
      border-radius: 0.5rem;
      text-decoration: none;
      font-weight: 600;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      transition: all 0.3s ease;
    }

    .hero-cta:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
    }

    .text-content {
      max-width: 800px;
      margin: 0 auto;
    }

    .text-content h1,
    .text-content h2,
    .text-content h3 {
      margin-bottom: 1rem;
    }

    .text-content p {
      margin-bottom: 1rem;
    }

    .button {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
    }

    .button-primary {
      background: var(--color-primary, #3b82f6);
      color: white;
    }

    .button-secondary {
      background: var(--color-secondary, #6b7280);
      color: white;
    }

    .button-outline {
      background: transparent;
      border: 2px solid var(--color-primary, #3b82f6);
      color: var(--color-primary, #3b82f6);
    }

    .button-small {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }

    .button-large {
      padding: 1rem 2rem;
      font-size: 1.125rem;
    }

    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .image-container {
      margin: 0 auto;
    }

    .responsive-image {
      max-width: 100%;
      height: auto;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .image-caption {
      margin-top: 0.5rem;
      font-style: italic;
      color: #6b7280;
    }

    .embedded-form {
      background: #f8fafc;
      border: 2px dashed #cbd5e1;
      border-radius: 0.5rem;
      padding: 2rem;
      text-align: center;
    }

    .form-placeholder {
      font-size: 1.125rem;
      color: #6b7280;
    }

    .component-placeholder {
      background: #fef2f2;
      border: 2px dashed #fca5a5;
      border-radius: 0.5rem;
      padding: 2rem;
      text-align: center;
      color: #dc2626;
    }

    @media (max-width: 768px) {
      .hero-title {
        font-size: 2rem;
      }

      .hero-subtitle {
        font-size: 1rem;
      }

      .component {
        padding: 1rem;
      }
    }
  `;
}

function getFormPreviewCSS(): string {
  return `
    .form-preview {
      max-width: 600px;
      margin: 0 auto;
      padding: 2rem;
    }

    .form-title {
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
      color: #1f2937;
    }

    .form-description {
      color: #6b7280;
      margin-bottom: 2rem;
    }

    .form-fields {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .field {
      display: flex;
      flex-direction: column;
    }

    .field label,
    .field legend {
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #374151;
    }

    .field input,
    .field textarea,
    .field select {
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 1rem;
      background: white;
    }

    .field input:focus,
    .field textarea:focus,
    .field select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .field-description {
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: #6b7280;
    }

    .required label::after,
    .required legend::after {
      content: ' *';
      color: #ef4444;
    }

    .radio-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .radio-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: normal;
      margin-bottom: 0;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: normal;
      margin-bottom: 0;
    }

    .form-actions {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #e5e7eb;
    }

    .submit-button {
      background: #3b82f6;
      color: white;
      padding: 0.75rem 2rem;
      border: none;
      border-radius: 0.375rem;
      font-weight: 600;
      font-size: 1rem;
      cursor: not-allowed;
      opacity: 0.7;
    }

    .field-placeholder {
      background: #f3f4f6;
      border: 1px dashed #9ca3af;
      border-radius: 0.375rem;
      padding: 1rem;
      text-align: center;
      color: #6b7280;
      font-style: italic;
    }

    @media (max-width: 768px) {
      .form-preview {
        padding: 1rem;
      }
    }
  `;
}

async function generateThumbnail(manifest: any, options: {
  viewport: string;
  format: string;
  width: number;
  height: number;
}) {
  // In a real implementation, this would use a headless browser
  // For now, return a placeholder
  return {
    url: `data:image/svg+xml;base64,${Buffer.from(`
      <svg width="${options.width}" height="${options.height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f8fafc"/>
        <rect x="20" y="20" width="${options.width - 40}" height="60" fill="#3b82f6" rx="8"/>
        <text x="50%" y="60" text-anchor="middle" fill="white" font-family="system-ui" font-size="16" font-weight="600">
          ${manifest.name || 'Preview'}
        </text>
        <rect x="20" y="100" width="${options.width - 40}" height="30" fill="#e5e7eb" rx="4"/>
        <rect x="20" y="150" width="${(options.width - 40) * 0.7}" height="30" fill="#e5e7eb" rx="4"/>
        <rect x="20" y="200" width="${options.width - 40}" height="100" fill="#f3f4f6" rx="8"/>
        <text x="50%" y="260" text-anchor="middle" fill="#6b7280" font-family="system-ui" font-size="14">
          ${manifest.id}
        </text>
      </svg>
    `).toString('base64')}`,
    format: options.format,
    width: options.width,
    height: options.height
  };
}

function generateCacheKey(manifest: any): string {
  const content = JSON.stringify(manifest);
  return Buffer.from(content).toString('base64').substring(0, 32);
}

function generateThumbnailCacheKey(manifest: any, viewport: string): string {
  const content = JSON.stringify({ manifest: manifest.id, viewport });
  return Buffer.from(content).toString('base64').substring(0, 32);
}

function getViewportWidth(viewport: string): number {
  switch (viewport) {
    case 'mobile': return 375;
    case 'tablet': return 768;
    case 'desktop': return 1200;
    default: return 1200;
  }
}

function getViewportHeight(viewport: string): number {
  switch (viewport) {
    case 'mobile': return 667;
    case 'tablet': return 1024;
    case 'desktop': return 800;
    default: return 800;
  }
}