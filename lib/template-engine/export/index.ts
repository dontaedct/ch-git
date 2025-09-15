// Main export services
export { PDFExportService } from './pdf-service'
export { HTMLExportService } from './html-service'
export { ExportManager } from './export-manager'

// Export types
export type {
  PDFExportOptions,
  PDFRenderResult,
  PDFMetadata
} from './pdf-service'

export type {
  HTMLExportOptions,
  HTMLRenderResult,
  HTMLMetadata,
  HTMLAsset
} from './html-service'

export type {
  ExportOptions,
  ExportResult,
  ClientCustomizationProfile
} from './export-manager'

// Convenience factory for export services
import { PDFExportService } from './pdf-service'
import { HTMLExportService } from './html-service'
import { ExportManager } from './export-manager'

export class ExportServiceFactory {
  static createPDFService(): PDFExportService {
    return new PDFExportService()
  }

  static createHTMLService(): HTMLExportService {
    return new HTMLExportService()
  }

  static createExportManager(): ExportManager {
    return new ExportManager()
  }

  static createFullExportSuite() {
    return {
      pdfService: new PDFExportService(),
      htmlService: new HTMLExportService(),
      exportManager: new ExportManager()
    }
  }
}

// Default export
export default ExportServiceFactory