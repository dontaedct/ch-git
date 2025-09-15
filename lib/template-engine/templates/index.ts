// Template Library exports
export { DocumentTemplateLibrary } from './library'
export type {
  TemplatePattern,
  TemplateSection,
  TemplateStyling,
  ClientDeliverable
} from './library'

// Pattern Registry exports
export { TemplatePatternRegistry } from './pattern-registry'
export type {
  PatternSearchFilter,
  PatternUsage,
  CustomPattern,
  PatternCustomization,
  PatternRecommendation
} from './pattern-registry'

// Customization exports
export { TemplateCustomizationService } from './customization'
export type {
  CustomizationOptions,
  CustomizationPreset,
  SectionCustomization,
  VariableCustomization
} from './customization'

// Documentation exports
export { DocumentationGenerator } from './documentation'
export type {
  PatternDocumentation,
  DocumentationExample,
  LibraryDocumentation,
  Tutorial
} from './documentation'

// Convenience factory for template services
import { DocumentTemplateLibrary } from './library'
import { TemplatePatternRegistry } from './pattern-registry'
import { TemplateCustomizationService } from './customization'
import { DocumentationGenerator } from './documentation'

export class TemplateServiceFactory {
  static createLibrary(): DocumentTemplateLibrary {
    return new DocumentTemplateLibrary()
  }

  static createRegistry(): TemplatePatternRegistry {
    return new TemplatePatternRegistry()
  }

  static createCustomizationService(): TemplateCustomizationService {
    return new TemplateCustomizationService()
  }

  static createDocumentationGenerator(): DocumentationGenerator {
    return new DocumentationGenerator()
  }

  static createFullTemplateSystem() {
    return {
      library: new DocumentTemplateLibrary(),
      registry: new TemplatePatternRegistry(),
      customization: new TemplateCustomizationService(),
      documentation: new DocumentationGenerator()
    }
  }
}

// Default export
export default TemplateServiceFactory