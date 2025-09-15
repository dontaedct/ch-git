/**
 * @fileoverview Secure File Download Utilities
 * @module lib/security/file-download
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.1.4 - Fix insecure file download vulnerabilities
 * Focus: Secure file download operations with validation and sanitization
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: CRITICAL (file download security vulnerabilities)
 */

import { z } from 'zod';

/**
 * File download validation schemas
 */
const fileNameSchema = z.string()
  .min(1, 'Filename cannot be empty')
  .max(255, 'Filename too long')
  .regex(/^[a-zA-Z0-9._-]+$/, 'Filename contains invalid characters')
  .refine((name) => !name.includes('..'), 'Path traversal not allowed')
  .refine((name) => !name.startsWith('.'), 'Hidden files not allowed');

const filePathSchema = z.string()
  .min(1, 'Path cannot be empty')
  .max(1000, 'Path too long')
  .refine((path) => !path.includes('..'), 'Path traversal not allowed')
  .refine((path) => !path.includes('<'), 'Invalid characters in path')
  .refine((path) => !path.includes('>'), 'Invalid characters in path')
  .refine((path) => !path.includes('script'), 'Invalid characters in path')
  .refine((path) => !path.includes('javascript:'), 'Invalid characters in path')
  .refine((path) => !path.includes('data:'), 'Invalid characters in path');

const mimeTypeSchema = z.string()
  .min(1, 'MIME type cannot be empty')
  .max(100, 'MIME type too long')
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*$/, 'Invalid MIME type format');

/**
 * Allowed file types for download
 */
const ALLOWED_MIME_TYPES = [
  'application/json',
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/zip',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const;

/**
 * Secure file download utilities
 */
export class SecureFileDownload {
  /**
   * Validate and sanitize filename
   */
  static sanitizeFileName(fileName: string): string {
    try {
      return fileNameSchema.parse(fileName);
    } catch {
      // Fallback to safe filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      return `download-${timestamp}.txt`;
    }
  }

  /**
   * Validate file path
   */
  static validateFilePath(path: string): boolean {
    try {
      filePathSchema.parse(path);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate MIME type
   */
  static validateMimeType(mimeType: string): boolean {
    try {
      mimeTypeSchema.parse(mimeType);
      return ALLOWED_MIME_TYPES.includes(mimeType as any);
    } catch {
      return false;
    }
  }

  /**
   * Securely download a blob as a file
   */
  static downloadBlob(blob: Blob, fileName: string, mimeType?: string): boolean {
    try {
      // Validate inputs
      const sanitizedFileName = this.sanitizeFileName(fileName);
      
      if (mimeType && !this.validateMimeType(mimeType)) {
        throw new Error('Invalid MIME type');
      }

      // Create secure download URL
      const url = URL.createObjectURL(blob);
      
      // Create download link with security attributes
      const link = document.createElement('a');
      link.href = url;
      link.download = sanitizedFileName;
      link.style.display = 'none';
      
      // Add security attributes
      link.setAttribute('rel', 'noopener noreferrer');
      link.setAttribute('target', '_blank');
      
      // Append to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up URL after a delay
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('Secure file download failed:', error);
      return false;
    }
  }

  /**
   * Securely download JSON data as a file
   */
  static downloadJSON(data: any, fileName: string): boolean {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      return this.downloadBlob(blob, fileName, 'application/json');
    } catch (error) {
      console.error('JSON download failed:', error);
      return false;
    }
  }

  /**
   * Securely download text data as a file
   */
  static downloadText(text: string, fileName: string, mimeType: string = 'text/plain'): boolean {
    try {
      if (!this.validateMimeType(mimeType)) {
        throw new Error('Invalid MIME type');
      }

      const blob = new Blob([text], { type: mimeType });
      return this.downloadBlob(blob, fileName, mimeType);
    } catch (error) {
      console.error('Text download failed:', error);
      return false;
    }
  }

  /**
   * Securely download CSV data
   */
  static downloadCSV(csvData: string, fileName: string): boolean {
    try {
      const blob = new Blob([csvData], { type: 'text/csv' });
      return this.downloadBlob(blob, fileName, 'text/csv');
    } catch (error) {
      console.error('CSV download failed:', error);
      return false;
    }
  }

  /**
   * Validate file upload
   */
  static validateFileUpload(file: File): { valid: boolean; error?: string } {
    try {
      // Check file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return { valid: false, error: 'File too large' };
      }

      // Check MIME type
      if (!this.validateMimeType(file.type)) {
        return { valid: false, error: 'Invalid file type' };
      }

      // Check filename
      if (!fileNameSchema.safeParse(file.name).success) {
        return { valid: false, error: 'Invalid filename' };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'File validation failed' };
    }
  }

  /**
   * Generate secure filename with timestamp
   */
  static generateSecureFileName(prefix: string, extension: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const randomId = Math.random().toString(36).substring(2, 8);
    return `${prefix}-${timestamp}-${randomId}.${extension}`;
  }
}

/**
 * React hook for secure file downloads
 */
export function useSecureFileDownload() {
  const downloadBlob = (blob: Blob, fileName: string, mimeType?: string) => {
    return SecureFileDownload.downloadBlob(blob, fileName, mimeType);
  };

  const downloadJSON = (data: any, fileName: string) => {
    return SecureFileDownload.downloadJSON(data, fileName);
  };

  const downloadText = (text: string, fileName: string, mimeType?: string) => {
    return SecureFileDownload.downloadText(text, fileName, mimeType);
  };

  const downloadCSV = (csvData: string, fileName: string) => {
    return SecureFileDownload.downloadCSV(csvData, fileName);
  };

  const generateFileName = (prefix: string, extension: string) => {
    return SecureFileDownload.generateSecureFileName(prefix, extension);
  };

  return {
    downloadBlob,
    downloadJSON,
    downloadText,
    downloadCSV,
    generateFileName,
  };
}

export default SecureFileDownload;
