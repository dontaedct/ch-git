/**
 * Enhanced PDF Generation for Consultations
 *
 * Specialized PDF generation system for consultation reports with
 * professional formatting, custom branding, and optimized rendering.
 */

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { ConsultationReport } from '@/lib/consultation/report-generator';

export interface PDFGenerationOptions {
  format?: 'A4' | 'Letter' | 'Legal';
  orientation?: 'portrait' | 'landscape';
  quality?: number;
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  watermark?: string;
  password?: string;
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string;
  };
}

export interface PDFGenerationResult {
  success: boolean;
  blob?: Blob;
  url?: string;
  filename: string;
  size?: number;
  pages?: number;
  error?: string;
}

/**
 * Enhanced PDF generator for consultation reports
 */
export class ConsultationPDFGenerator {
  private readonly defaultOptions: PDFGenerationOptions = {
    format: 'A4',
    orientation: 'portrait',
    quality: 2,
    margins: {
      top: 20,
      right: 15,
      bottom: 20,
      left: 15
    }
  };

  /**
   * Generate PDF from consultation report
   */
  async generateFromReport(
    report: ConsultationReport,
    elementId: string = 'consultation-report-content',
    options: Partial<PDFGenerationOptions> = {}
  ): Promise<PDFGenerationResult> {
    const config = { ...this.defaultOptions, ...options };

    try {
      // Validate element exists
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with ID "${elementId}" not found`);
      }

      // Generate filename
      const filename = this.generateFilename(report);

      // Prepare element for PDF generation
      await this.prepareElementForPDF(element);

      // Generate high-quality canvas
      const canvas = await this.generateCanvas(element, config);

      // Create PDF document
      const pdf = await this.createPDFDocument(canvas, config, report);

      // Add metadata
      this.addPDFMetadata(pdf, report, config.metadata);

      // Generate blob
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);

      return {
        success: true,
        blob,
        url,
        filename,
        size: blob.size,
        pages: pdf.getNumberOfPages()
      };
    } catch (error) {
      console.error('PDF generation failed:', error);
      return {
        success: false,
        filename: this.generateFilename(report),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate PDF from HTML element
   */
  async generateFromElement(
    elementId: string,
    filename: string,
    options: Partial<PDFGenerationOptions> = {}
  ): Promise<PDFGenerationResult> {
    const config = { ...this.defaultOptions, ...options };

    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with ID "${elementId}" not found`);
      }

      await this.prepareElementForPDF(element);
      const canvas = await this.generateCanvas(element, config);
      const pdf = await this.createPDFDocument(canvas, config);

      if (config.metadata) {
        this.addPDFMetadata(pdf, null, config.metadata);
      }

      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);

      return {
        success: true,
        blob,
        url,
        filename,
        size: blob.size,
        pages: pdf.getNumberOfPages()
      };
    } catch (error) {
      console.error('PDF generation failed:', error);
      return {
        success: false,
        filename,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate filename for consultation report
   */
  private generateFilename(report: ConsultationReport): string {
    const clientName = report.client_info.name
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase();

    const date = new Date(report.client_info.generated_date)
      .toISOString()
      .split('T')[0];

    return `consultation-report-${clientName}-${date}.pdf`;
  }

  /**
   * Prepare DOM element for optimal PDF rendering
   */
  private async prepareElementForPDF(element: HTMLElement): Promise<void> {
    // Wait for fonts to load
    await document.fonts.ready;

    // Wait for images to load
    const images = element.querySelectorAll('img');
    await Promise.all(Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = img.onerror = resolve;
      });
    }));

    // Apply print-specific styles
    element.classList.add('pdf-rendering');

    // Ensure all text is properly rendered
    const textElements = element.querySelectorAll('*');
    textElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      const computedStyle = window.getComputedStyle(el);

      // Fix font rendering
      if (!htmlEl.style.fontFamily) {
        htmlEl.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      }

      // Fix hairline borders
      if (computedStyle.borderWidth && computedStyle.borderWidth.includes('0.5px')) {
        htmlEl.style.borderWidth = '1px';
      }

      // Ensure proper color contrast
      if (computedStyle.color === 'rgb(0, 0, 0)' && computedStyle.backgroundColor === 'rgba(0, 0, 0, 0)') {
        htmlEl.style.color = '#111111';
      }
    });

    // Remove any print-hidden elements
    const hiddenElements = element.querySelectorAll('.print-hidden');
    hiddenElements.forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });

    // Ensure page breaks are respected
    const pageBreaks = element.querySelectorAll('.print-keep-together');
    pageBreaks.forEach(el => {
      (el as HTMLElement).style.pageBreakInside = 'avoid';
    });
  }

  /**
   * Generate high-quality canvas from element
   */
  private async generateCanvas(
    element: HTMLElement,
    options: PDFGenerationOptions
  ): Promise<HTMLCanvasElement> {
    const canvas = await html2canvas(element, {
      scale: options.quality || 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(element.id);
        if (clonedElement) {
          // Apply consistent font family
          clonedElement.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          clonedElement.style.fontSize = '16px';
          clonedElement.style.lineHeight = '1.5';

          // Fix all text elements
          const allElements = clonedElement.querySelectorAll('*');
          allElements.forEach(el => {
            const htmlEl = el as HTMLElement;
            const computedStyle = window.getComputedStyle(el);

            if (!htmlEl.style.fontFamily) {
              htmlEl.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            }

            // Enhance border visibility
            if (computedStyle.borderWidth && computedStyle.borderWidth.includes('0.5px')) {
              htmlEl.style.borderWidth = '1px';
            }

            // Improve text contrast
            if (computedStyle.color === 'rgb(0, 0, 0)' && computedStyle.backgroundColor === 'rgba(0, 0, 0, 0)') {
              htmlEl.style.color = '#111111';
            }
          });
        }
      }
    });

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error('Failed to generate canvas from element');
    }

    return canvas;
  }

  /**
   * Create PDF document from canvas
   */
  private async createPDFDocument(
    canvas: HTMLCanvasElement,
    options: PDFGenerationOptions,
    report?: ConsultationReport | null
  ): Promise<jsPDF> {
    // Calculate dimensions based on format
    const dimensions = this.getFormatDimensions(options.format!);
    const margins = options.margins!;

    const pageWidth = dimensions.width;
    const pageHeight = dimensions.height;
    const contentWidth = pageWidth - margins.left - margins.right;
    const contentHeight = pageHeight - margins.top - margins.bottom;

    // Calculate image dimensions
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    // Create PDF
    const pdf = new jsPDF({
      orientation: options.orientation || 'portrait',
      unit: 'mm',
      format: options.format === 'A4' ? 'a4' :
              options.format === 'Letter' ? 'letter' : 'legal'
    });

    // Add pages
    let position = margins.top;
    let pageNumber = 1;

    // First page
    pdf.addImage(
      canvas.toDataURL('image/png'),
      'PNG',
      margins.left,
      position,
      imgWidth,
      Math.min(imgHeight, contentHeight)
    );

    heightLeft -= contentHeight;

    // Additional pages if needed
    while (heightLeft > 0) {
      pdf.addPage();
      pageNumber++;

      position = -(contentHeight * (pageNumber - 1)) + margins.top;

      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        margins.left,
        position,
        imgWidth,
        Math.min(heightLeft, contentHeight)
      );

      heightLeft -= contentHeight;
    }

    // Add watermark if specified
    if (options.watermark) {
      this.addWatermark(pdf, options.watermark, report?.customization.theme.primary_color);
    }

    // Add header/footer if report is provided
    if (report) {
      this.addHeaderFooter(pdf, report, pageNumber);
    }

    return pdf;
  }

  /**
   * Get format dimensions in mm
   */
  private getFormatDimensions(format: string): { width: number; height: number } {
    switch (format) {
      case 'A4':
        return { width: 210, height: 297 };
      case 'Letter':
        return { width: 216, height: 279 };
      case 'Legal':
        return { width: 216, height: 356 };
      default:
        return { width: 210, height: 297 };
    }
  }

  /**
   * Add PDF metadata
   */
  private addPDFMetadata(
    pdf: jsPDF,
    report: ConsultationReport | null,
    metadata?: PDFGenerationOptions['metadata']
  ): void {
    const title = metadata?.title ||
                 report?.title ||
                 'Business Consultation Report';

    const author = metadata?.author ||
                  'AI Consultation Engine';

    const subject = metadata?.subject ||
                   `Consultation report for ${report?.client_info.name || 'client'}`;

    const keywords = metadata?.keywords ||
                    'consultation, business, recommendations, strategy';

    pdf.setProperties({
      title,
      author,
      subject,
      keywords,
      creator: 'Consultation Platform',
      producer: 'AI-Powered Business Consultation System'
    });
  }

  /**
   * Add watermark to PDF pages
   */
  private addWatermark(pdf: jsPDF, watermark: string, color?: string): void {
    const pageCount = pdf.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setTextColor(color || '#E5E7EB');
      pdf.setFontSize(60);
      pdf.setFont('helvetica', 'bold');

      // Calculate center position
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      const textWidth = pdf.getTextWidth(watermark);

      // Add rotated watermark
      pdf.text(
        watermark,
        pageWidth / 2 - textWidth / 4,
        pageHeight / 2,
        {
          angle: -45,
          align: 'center'
        }
      );
    }
  }

  /**
   * Add header and footer to PDF pages
   */
  private addHeaderFooter(pdf: jsPDF, report: ConsultationReport, totalPages: number): void {
    const pageCount = pdf.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor('#6B7280');

      // Left footer - report info
      pdf.text(
        `${report.title} | ${report.client_info.name}`,
        15,
        pdf.internal.pageSize.height - 10
      );

      // Right footer - page number
      pdf.text(
        `Page ${i} of ${pageCount}`,
        pdf.internal.pageSize.width - 15,
        pdf.internal.pageSize.height - 10,
        { align: 'right' }
      );

      // Center footer - generation date
      pdf.text(
        new Date(report.client_info.generated_date).toLocaleDateString(),
        pdf.internal.pageSize.width / 2,
        pdf.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
  }

  /**
   * Cleanup after PDF generation
   */
  cleanup(element?: HTMLElement): void {
    if (element) {
      element.classList.remove('pdf-rendering');

      // Restore print-hidden elements
      const hiddenElements = element.querySelectorAll('.print-hidden');
      hiddenElements.forEach(el => {
        (el as HTMLElement).style.display = '';
      });
    }
  }
}

/**
 * Default PDF generator instance
 */
export const consultationPDFGenerator = new ConsultationPDFGenerator();

/**
 * Convenience functions for PDF generation
 */
export const consultationPDF = {
  /**
   * Generate PDF from consultation report
   */
  fromReport: (
    report: ConsultationReport,
    elementId?: string,
    options?: Partial<PDFGenerationOptions>
  ) => consultationPDFGenerator.generateFromReport(report, elementId, options),

  /**
   * Generate PDF from HTML element
   */
  fromElement: (
    elementId: string,
    filename: string,
    options?: Partial<PDFGenerationOptions>
  ) => consultationPDFGenerator.generateFromElement(elementId, filename, options),

  /**
   * Download PDF directly
   */
  download: async (
    report: ConsultationReport,
    elementId?: string,
    options?: Partial<PDFGenerationOptions>
  ) => {
    const result = await consultationPDFGenerator.generateFromReport(report, elementId, options);

    if (result.success && result.url) {
      const link = document.createElement('a');
      link.href = result.url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(result.url);
    }

    return result;
  },

  /**
   * Generate PDF for email attachment
   */
  forEmail: async (
    report: ConsultationReport,
    elementId?: string,
    options?: Partial<PDFGenerationOptions>
  ) => {
    const result = await consultationPDFGenerator.generateFromReport(report, elementId, {
      ...options,
      metadata: {
        title: `Consultation Report - ${report.client_info.name}`,
        author: 'Business Consultation Platform',
        subject: 'Personalized Business Consultation Report',
        ...options?.metadata
      }
    });

    return result;
  }
};