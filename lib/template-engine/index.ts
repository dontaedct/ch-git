// Core exports
export * from './core/types'
export { TemplateEngine } from './core/template-engine'
export { DocumentTemplateEngine } from './core/document-template-engine'
export { DocumentTemplateManager } from './core/document-template-manager'
export { BrandingManager } from './core/branding-manager'
export { TemplateParser } from './core/parser'
export { TemplateRenderer } from './core/renderer'
export { TemplateValidator } from './core/validator'
export { TemplateComposer } from './core/template-composer'
export { TemplateVersionManager } from './core/template-version-manager'

// Export services
export { HTMLExportService, ExportManager } from './export'
export type {
  HTMLExportOptions,
  ExportOptions,
  ExportResult
} from './export'

// Template Library and Patterns
export {
  TemplateCustomizationService
} from './templates'
export type {
  TemplatePattern
} from './templates'

// Convenience factory class
import { DocumentTemplateEngine } from './core/document-template-engine'
import { DocumentTemplateManager } from './core/document-template-manager'
import { BrandingManager } from './core/branding-manager'
import { TemplateVersionManager } from './core/template-version-manager'
import { TemplateComposer } from './core/template-composer'
import { TemplateParser } from './core/parser'
import { TemplateRenderer } from './core/renderer'
import { TemplateValidator } from './core/validator'

export class TemplateEngineFactory {
  static createDocumentEngine(): DocumentTemplateEngine {
    return new DocumentTemplateEngine()
  }

  static createDocumentManager(): DocumentTemplateManager {
    return new DocumentTemplateManager()
  }

  static createBrandingManager(): BrandingManager {
    return new BrandingManager()
  }

  static createVersionManager(): TemplateVersionManager {
    return new TemplateVersionManager()
  }

  static createFullStack() {
    return {
      engine: new DocumentTemplateEngine(),
      documentManager: new DocumentTemplateManager(),
      brandingManager: new BrandingManager(),
      versionManager: new TemplateVersionManager(),
      composer: new TemplateComposer(),
      parser: new TemplateParser(),
      renderer: new TemplateRenderer(),
      validator: new TemplateValidator()
    }
  }
}

// Default export
export default TemplateEngineFactory