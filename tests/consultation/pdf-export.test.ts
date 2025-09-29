import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

// Mock jsPDF
const mockJsPDF = {
  text: jest.fn(),
  setFontSize: jest.fn(),
  setFont: jest.fn(),
  addPage: jest.fn(),
  save: jest.fn(),
  output: jest.fn(() => 'mock-pdf-content'),
  internal: {
    pageSize: {
      width: 210,
      height: 297
    }
  }
};

jest.mock('jspdf', () => ({
  jsPDF: jest.fn(() => mockJsPDF)
}));

// Mock html2canvas
jest.mock('html2canvas', () => jest.fn(() => Promise.resolve({
  toDataURL: () => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  width: 800,
  height: 600
})));

// Mock file system operations
jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(() => Buffer.from('mock-pdf-content')),
  existsSync: jest.fn(() => true),
  mkdirSync: jest.fn(),
}));

describe('PDF Export Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Consultation Report PDF Generation', () => {
    it('should generate PDF from consultation data', async () => {
      const { generateConsultationPDF } = await import('../../lib/pdf/consultation-pdf');

      const consultationData = {
        id: 'test-consultation-id',
        client: {
          name: 'John Doe',
          email: 'john@example.com',
          company: 'Acme Corp'
        },
        responses: {
          business_type: 'SaaS',
          team_size: '10-50',
          budget: '$10k-50k',
          challenges: ['scaling', 'automation'],
          timeline: '3-6 months'
        },
        analysis: 'Your SaaS business shows strong growth potential with current challenges in scaling and automation.',
        recommendations: [
          {
            title: 'Enterprise Growth Package',
            description: 'Comprehensive solution for scaling SaaS businesses',
            price: '$25,000',
            timeline: '3-4 months',
            features: ['Custom Development', 'Team Training', '24/7 Support']
          }
        ],
        next_steps: [
          'Schedule discovery call',
          'Review technical requirements',
          'Create project timeline'
        ],
        created_at: new Date().toISOString()
      };

      const pdfBuffer = await generateConsultationPDF(consultationData);

      expect(pdfBuffer).toBeDefined();
      expect(mockJsPDF.text).toHaveBeenCalledWith(
        expect.stringContaining('John Doe'),
        expect.any(Number),
        expect.any(Number)
      );
      expect(mockJsPDF.text).toHaveBeenCalledWith(
        expect.stringContaining('Acme Corp'),
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should format PDF with proper structure and styling', async () => {
      const { generateConsultationPDF } = await import('../../lib/pdf/consultation-pdf');

      const consultationData = {
        id: 'test-consultation-id',
        client: { name: 'Test Client', email: 'test@example.com', company: 'Test Corp' },
        responses: { business_type: 'SaaS' },
        analysis: 'Test analysis',
        recommendations: [],
        next_steps: [],
        created_at: new Date().toISOString()
      };

      await generateConsultationPDF(consultationData);

      // Verify proper PDF structure
      expect(mockJsPDF.setFontSize).toHaveBeenCalledWith(20); // Title
      expect(mockJsPDF.setFontSize).toHaveBeenCalledWith(16); // Section headers
      expect(mockJsPDF.setFontSize).toHaveBeenCalledWith(12); // Body text
      expect(mockJsPDF.setFont).toHaveBeenCalledWith('helvetica', 'bold');
      expect(mockJsPDF.setFont).toHaveBeenCalledWith('helvetica', 'normal');
    });

    it('should handle multi-page PDFs correctly', async () => {
      const { generateConsultationPDF } = await import('../../lib/pdf/consultation-pdf');

      const longConsultationData = {
        id: 'test-consultation-id',
        client: { name: 'Test Client', email: 'test@example.com', company: 'Test Corp' },
        responses: { business_type: 'SaaS' },
        analysis: 'This is a very long analysis that should span multiple pages. '.repeat(100),
        recommendations: Array.from({ length: 10 }, (_, i) => ({
          title: `Recommendation ${i + 1}`,
          description: 'This is a detailed recommendation description that is quite long. '.repeat(20),
          price: '$10,000',
          timeline: '2-3 months',
          features: [`Feature ${i + 1}A`, `Feature ${i + 1}B`, `Feature ${i + 1}C`]
        })),
        next_steps: Array.from({ length: 15 }, (_, i) => `Step ${i + 1}: This is a detailed next step`),
        created_at: new Date().toISOString()
      };

      await generateConsultationPDF(longConsultationData);

      expect(mockJsPDF.addPage).toHaveBeenCalled();
    });

    it('should include branding and styling elements', async () => {
      const { generateConsultationPDF } = await import('../../lib/pdf/consultation-pdf');

      const consultationData = {
        id: 'test-consultation-id',
        client: { name: 'Test Client', email: 'test@example.com', company: 'Test Corp' },
        responses: { business_type: 'SaaS' },
        analysis: 'Test analysis',
        recommendations: [],
        next_steps: [],
        created_at: new Date().toISOString(),
        branding: {
          logo_url: 'https://example.com/logo.png',
          primary_color: '#007bff',
          company_name: 'Our Agency'
        }
      };

      await generateConsultationPDF(consultationData);

      // Verify branding elements are included
      expect(mockJsPDF.text).toHaveBeenCalledWith(
        expect.stringContaining('Our Agency'),
        expect.any(Number),
        expect.any(Number)
      );
    });
  });

  describe('PDF Template System', () => {
    it('should use different templates for different business types', async () => {
      const { generateConsultationPDF } = await import('../../lib/pdf/consultation-pdf');

      const saasData = {
        id: 'saas-consultation',
        client: { name: 'SaaS Client', email: 'saas@example.com', company: 'SaaS Corp' },
        responses: { business_type: 'SaaS', industry: 'technology' },
        analysis: 'SaaS-specific analysis',
        recommendations: [],
        next_steps: [],
        created_at: new Date().toISOString()
      };

      await generateConsultationPDF(saasData);

      expect(mockJsPDF.text).toHaveBeenCalledWith(
        expect.stringContaining('SaaS'),
        expect.any(Number),
        expect.any(Number)
      );

      jest.clearAllMocks();

      const ecommerceData = {
        ...saasData,
        responses: { business_type: 'E-commerce', industry: 'retail' },
        analysis: 'E-commerce-specific analysis'
      };

      await generateConsultationPDF(ecommerceData);

      expect(mockJsPDF.text).toHaveBeenCalledWith(
        expect.stringContaining('E-commerce'),
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should customize templates based on service packages', async () => {
      const { generateConsultationPDFWithTemplate } = await import('../../lib/pdf/consultation-pdf');

      const consultationData = {
        id: 'test-consultation-id',
        client: { name: 'Test Client', email: 'test@example.com', company: 'Test Corp' },
        responses: { business_type: 'SaaS' },
        analysis: 'Test analysis',
        recommendations: [
          {
            title: 'Enterprise Package',
            description: 'Enterprise-level solution',
            price: '$50,000',
            timeline: '6 months',
            features: ['Enterprise Feature 1', 'Enterprise Feature 2']
          }
        ],
        next_steps: [],
        created_at: new Date().toISOString()
      };

      const template = 'enterprise';

      await generateConsultationPDFWithTemplate(consultationData, template);

      expect(mockJsPDF.text).toHaveBeenCalledWith(
        expect.stringContaining('Enterprise'),
        expect.any(Number),
        expect.any(Number)
      );
    });
  });

  describe('PDF Quality and Formatting', () => {
    it('should maintain consistent formatting across sections', async () => {
      const { generateConsultationPDF } = await import('../../lib/pdf/consultation-pdf');

      const consultationData = {
        id: 'test-consultation-id',
        client: { name: 'Test Client', email: 'test@example.com', company: 'Test Corp' },
        responses: { business_type: 'SaaS' },
        analysis: 'Test analysis',
        recommendations: [
          {
            title: 'Test Recommendation',
            description: 'Test description',
            price: '$10,000',
            timeline: '2 months',
            features: ['Feature 1', 'Feature 2']
          }
        ],
        next_steps: ['Step 1', 'Step 2'],
        created_at: new Date().toISOString()
      };

      await generateConsultationPDF(consultationData);

      // Verify consistent section headers
      const headerCalls = mockJsPDF.setFontSize.mock.calls.filter(call => call[0] === 16);
      expect(headerCalls.length).toBeGreaterThan(0);

      // Verify consistent body text
      const bodyCalls = mockJsPDF.setFontSize.mock.calls.filter(call => call[0] === 12);
      expect(bodyCalls.length).toBeGreaterThan(0);
    });

    it('should handle special characters and formatting', async () => {
      const { generateConsultationPDF } = await import('../../lib/pdf/consultation-pdf');

      const consultationData = {
        id: 'test-consultation-id',
        client: { name: 'Müller & Co.', email: 'müller@example.com', company: 'Résumé Corp' },
        responses: { business_type: 'SaaS' },
        analysis: 'Analysis with special chars: €, £, ¥, & émojis 🚀',
        recommendations: [],
        next_steps: [],
        created_at: new Date().toISOString()
      };

      await generateConsultationPDF(consultationData);

      expect(mockJsPDF.text).toHaveBeenCalledWith(
        expect.stringContaining('Müller'),
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should optimize PDF size and quality', async () => {
      const { generateConsultationPDF } = await import('../../lib/pdf/consultation-pdf');

      const consultationData = {
        id: 'test-consultation-id',
        client: { name: 'Test Client', email: 'test@example.com', company: 'Test Corp' },
        responses: { business_type: 'SaaS' },
        analysis: 'Test analysis',
        recommendations: [],
        next_steps: [],
        created_at: new Date().toISOString()
      };

      const startTime = Date.now();
      const pdfBuffer = await generateConsultationPDF(consultationData);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(10000); // <10 seconds target
      expect(pdfBuffer).toBeTruthy();
    });
  });

  describe('File Operations', () => {
    it('should save PDF to specified location', async () => {
      const { saveConsultationPDF } = await import('../../lib/pdf/consultation-pdf');

      const consultationData = {
        id: 'test-consultation-id',
        client: { name: 'Test Client', email: 'test@example.com', company: 'Test Corp' },
        responses: { business_type: 'SaaS' },
        analysis: 'Test analysis',
        recommendations: [],
        next_steps: [],
        created_at: new Date().toISOString()
      };

      const filePath = join(tmpdir(), 'consultation-test.pdf');

      await saveConsultationPDF(consultationData, filePath);

      const fs = await import('fs');
      expect(fs.writeFileSync).toHaveBeenCalledWith(filePath, expect.any(Buffer));
    });

    it('should generate unique filenames for consultations', async () => {
      const { generatePDFFilename } = await import('../../lib/pdf/consultation-pdf');

      const consultationData = {
        id: 'test-consultation-id',
        client: { name: 'John Doe', company: 'Acme Corp' },
        created_at: '2025-09-19T12:00:00Z'
      };

      const filename = generatePDFFilename(consultationData);

      expect(filename).toContain('John-Doe');
      expect(filename).toContain('Acme-Corp');
      expect(filename).toContain('2025-09-19');
      expect(filename).toEndWith('.pdf');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing consultation data gracefully', async () => {
      const { generateConsultationPDF } = await import('../../lib/pdf/consultation-pdf');

      const incompleteData = {
        id: 'test-consultation-id',
        // Missing required fields
      };

      await expect(generateConsultationPDF(incompleteData as any)).rejects.toThrow();
    });

    it('should handle PDF generation errors', async () => {
      mockJsPDF.output.mockImplementationOnce(() => {
        throw new Error('PDF generation failed');
      });

      const { generateConsultationPDF } = await import('../../lib/pdf/consultation-pdf');

      const consultationData = {
        id: 'test-consultation-id',
        client: { name: 'Test Client', email: 'test@example.com', company: 'Test Corp' },
        responses: { business_type: 'SaaS' },
        analysis: 'Test analysis',
        recommendations: [],
        next_steps: [],
        created_at: new Date().toISOString()
      };

      await expect(generateConsultationPDF(consultationData)).rejects.toThrow('PDF generation failed');
    });

    it('should provide fallback formatting when styling fails', async () => {
      mockJsPDF.setFont.mockImplementationOnce(() => {
        throw new Error('Font not available');
      });

      const { generateConsultationPDF } = await import('../../lib/pdf/consultation-pdf');

      const consultationData = {
        id: 'test-consultation-id',
        client: { name: 'Test Client', email: 'test@example.com', company: 'Test Corp' },
        responses: { business_type: 'SaaS' },
        analysis: 'Test analysis',
        recommendations: [],
        next_steps: [],
        created_at: new Date().toISOString()
      };

      // Should not throw, should use fallback formatting
      const pdfBuffer = await generateConsultationPDF(consultationData);
      expect(pdfBuffer).toBeDefined();
    });
  });

  describe('Performance Tests', () => {
    it('should generate PDFs within time constraints', async () => {
      const { generateConsultationPDF } = await import('../../lib/pdf/consultation-pdf');

      const consultationData = {
        id: 'performance-test',
        client: { name: 'Performance Test', email: 'test@example.com', company: 'Test Corp' },
        responses: { business_type: 'SaaS' },
        analysis: 'Performance test analysis',
        recommendations: Array.from({ length: 5 }, (_, i) => ({
          title: `Recommendation ${i + 1}`,
          description: 'Test description',
          price: '$10,000',
          timeline: '2 months',
          features: ['Feature 1', 'Feature 2']
        })),
        next_steps: Array.from({ length: 10 }, (_, i) => `Step ${i + 1}`),
        created_at: new Date().toISOString()
      };

      const startTime = Date.now();
      await generateConsultationPDF(consultationData);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(10000); // <10 seconds
    });

    it('should handle concurrent PDF generation requests', async () => {
      const { generateConsultationPDF } = await import('../../lib/pdf/consultation-pdf');

      const consultationData = {
        id: 'concurrent-test',
        client: { name: 'Concurrent Test', email: 'test@example.com', company: 'Test Corp' },
        responses: { business_type: 'SaaS' },
        analysis: 'Concurrent test analysis',
        recommendations: [],
        next_steps: [],
        created_at: new Date().toISOString()
      };

      const requests = Array.from({ length: 3 }, (_, i) =>
        generateConsultationPDF({
          ...consultationData,
          id: `concurrent-test-${i}`
        })
      );

      const results = await Promise.all(requests);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });
  });
});