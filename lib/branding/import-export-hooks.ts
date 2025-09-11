/**
 * @fileoverview HT-011.1.7: Brand Import/Export React Hooks
 * @module lib/branding/import-export-hooks
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-011.1.7 - Implement Brand Import/Export System
 * Focus: React hooks for brand import/export functionality
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: LOW (branding system enhancement)
 */

import { useState, useCallback, useRef } from 'react';
import { 
  BrandImportExportManager, 
  BrandExportData, 
  BrandImportOptions, 
  BrandExportOptions, 
  BrandImportResult 
} from './import-export-manager';
import { DynamicBrandConfig } from './logo-manager';
import { BrandPreset } from './preset-manager';
import { BrandImportExportUtils } from './import-export-manager';

/**
 * Hook for brand configuration export
 */
export function useBrandExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [lastExportData, setLastExportData] = useState<string | null>(null);

  const exportBrandConfig = useCallback(async (
    config: DynamicBrandConfig,
    options: BrandExportOptions = { format: 'json', includeAssets: true, includeValidation: true }
  ) => {
    setIsExporting(true);
    setExportError(null);

    try {
      const exportData = await BrandImportExportManager.prototype.exportBrandConfig(config, options);
      setLastExportData(exportData);
      return exportData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      setExportError(errorMessage);
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, []);

  const exportBrandPreset = useCallback(async (
    preset: BrandPreset,
    options: BrandExportOptions = { format: 'json', includeAssets: true, includeValidation: true }
  ) => {
    setIsExporting(true);
    setExportError(null);

    try {
      const exportData = await BrandImportExportManager.prototype.exportBrandPreset(preset, options);
      setLastExportData(exportData);
      return exportData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      setExportError(errorMessage);
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, []);

  const exportFullBranding = useCallback(async (
    config: DynamicBrandConfig,
    preset?: BrandPreset,
    palette?: any,
    options: BrandExportOptions = { format: 'json', includeAssets: true, includeValidation: true }
  ) => {
    setIsExporting(true);
    setExportError(null);

    try {
      const exportData = await BrandImportExportManager.prototype.exportFullBranding(config, preset, palette, options);
      setLastExportData(exportData);
      return exportData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      setExportError(errorMessage);
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, []);

  const downloadExport = useCallback((data: string, filename?: string) => {
    const finalFilename = filename || BrandImportExportUtils.generateFilename('brand-config');
    return BrandImportExportUtils.downloadExport(data, finalFilename);
  }, []);

  const clearError = useCallback(() => {
    setExportError(null);
  }, []);

  return {
    isExporting,
    exportError,
    lastExportData,
    exportBrandConfig,
    exportBrandPreset,
    exportFullBranding,
    downloadExport,
    clearError
  };
}

/**
 * Hook for brand configuration import
 */
export function useBrandImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<BrandImportResult | null>(null);
  const [importHistory, setImportHistory] = useState<BrandImportResult[]>([]);

  const importBrandConfig = useCallback(async (
    importData: string,
    options: BrandImportOptions = { validate: true, overwrite: false, createBackup: true }
  ) => {
    setIsImporting(true);
    setImportError(null);

    try {
      const manager = new BrandImportExportManager();
      const result = await manager.importBrandConfig(importData, options);
      
      setImportResult(result);
      setImportHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 imports
      
      if (!result.success) {
        setImportError(result.errors.join(', '));
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Import failed';
      setImportError(errorMessage);
      const failedResult: BrandImportResult = {
        success: false,
        errors: [errorMessage],
        warnings: []
      };
      setImportResult(failedResult);
      setImportHistory(prev => [failedResult, ...prev.slice(0, 9)]);
      throw error;
    } finally {
      setIsImporting(false);
    }
  }, []);

  const importBrandPreset = useCallback(async (
    importData: string,
    options: BrandImportOptions = { validate: true, overwrite: false, createBackup: true }
  ) => {
    setIsImporting(true);
    setImportError(null);

    try {
      const manager = new BrandImportExportManager();
      const result = await manager.importBrandPreset(importData, options);
      
      setImportResult(result);
      setImportHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 imports
      
      if (!result.success) {
        setImportError(result.errors.join(', '));
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Import failed';
      setImportError(errorMessage);
      const failedResult: BrandImportResult = {
        success: false,
        errors: [errorMessage],
        warnings: []
      };
      setImportResult(failedResult);
      setImportHistory(prev => [failedResult, ...prev.slice(0, 9)]);
      throw error;
    } finally {
      setIsImporting(false);
    }
  }, []);

  const importFromFile = useCallback(async (
    file: File,
    options: BrandImportOptions = { validate: true, overwrite: false, createBackup: true }
  ) => {
    if (!BrandImportExportUtils.validateFileType(file)) {
      const error = 'Invalid file type. Please select a JSON or YAML file.';
      setImportError(error);
      throw new Error(error);
    }

    try {
      const fileContent = await BrandImportExportUtils.readFile(file);
      return await importBrandConfig(fileContent, options);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'File import failed';
      setImportError(errorMessage);
      throw error;
    }
  }, [importBrandConfig]);

  const clearError = useCallback(() => {
    setImportError(null);
  }, []);

  const clearHistory = useCallback(() => {
    setImportHistory([]);
  }, []);

  return {
    isImporting,
    importError,
    importResult,
    importHistory,
    importBrandConfig,
    importBrandPreset,
    importFromFile,
    clearError,
    clearHistory
  };
}

/**
 * Hook for file upload handling
 */
export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((callback: (file: File) => void) => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>, callback: (file: File) => void) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setUploadError(null);

      try {
        if (!BrandImportExportUtils.validateFileType(file)) {
          throw new Error('Invalid file type. Please select a JSON or YAML file.');
        }

        callback(file);
        setUploadedFiles(prev => [file, ...prev.slice(0, 9)]); // Keep last 10 files
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'File upload failed';
        setUploadError(errorMessage);
      } finally {
        setIsUploading(false);
        // Reset input
        if (event.target) {
          event.target.value = '';
        }
      }
    }
  }, []);

  const clearError = useCallback(() => {
    setUploadError(null);
  }, []);

  const clearFiles = useCallback(() => {
    setUploadedFiles([]);
  }, []);

  return {
    isUploading,
    uploadError,
    uploadedFiles,
    fileInputRef,
    handleFileSelect,
    handleFileChange,
    clearError,
    clearFiles
  };
}

/**
 * Hook for import/export validation
 */
export function useBrandValidation() {
  const [validationResults, setValidationResults] = useState<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null);

  const validateExportData = useCallback((data: BrandExportData) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate metadata
    if (!data.metadata.version) {
      errors.push('Export metadata version is required');
    }

    if (!data.metadata.exportDate) {
      errors.push('Export metadata date is required');
    }

    if (!data.metadata.exportType) {
      errors.push('Export metadata type is required');
    }

    // Validate based on export type
    if (data.metadata.exportType === 'brand-config' && !data.brandConfig) {
      errors.push('Brand configuration is required for brand-config export');
    }

    if (data.metadata.exportType === 'preset' && !data.preset) {
      errors.push('Brand preset is required for preset export');
    }

    // Add warnings
    if (data.metadata.exportType === 'full-branding' && !data.assets) {
      warnings.push('No assets included in full branding export');
    }

    const result = {
      isValid: errors.length === 0,
      errors,
      warnings
    };

    setValidationResults(result);
    return result;
  }, []);

  const validateImportData = useCallback((data: string) => {
    try {
      const parsed = JSON.parse(data) as BrandExportData;
      return validateExportData(parsed);
    } catch (error) {
      const result = {
        isValid: false,
        errors: ['Invalid JSON format'],
        warnings: []
      };
      setValidationResults(result);
      return result;
    }
  }, [validateExportData]);

  const clearValidation = useCallback(() => {
    setValidationResults(null);
  }, []);

  return {
    validationResults,
    validateExportData,
    validateImportData,
    clearValidation
  };
}

/**
 * Hook for import/export analytics
 */
export function useBrandAnalytics() {
  const [analytics, setAnalytics] = useState({
    totalExports: 0,
    totalImports: 0,
    successfulExports: 0,
    successfulImports: 0,
    failedExports: 0,
    failedImports: 0,
    exportTypes: {} as Record<string, number>,
    importTypes: {} as Record<string, number>,
    lastExportDate: null as Date | null,
    lastImportDate: null as Date | null
  });

  const trackExport = useCallback((type: string, success: boolean) => {
    setAnalytics(prev => ({
      ...prev,
      totalExports: prev.totalExports + 1,
      successfulExports: success ? prev.successfulExports + 1 : prev.successfulExports,
      failedExports: success ? prev.failedExports : prev.failedExports + 1,
      exportTypes: {
        ...prev.exportTypes,
        [type]: (prev.exportTypes[type] || 0) + 1
      },
      lastExportDate: new Date()
    }));
  }, []);

  const trackImport = useCallback((type: string, success: boolean) => {
    setAnalytics(prev => ({
      ...prev,
      totalImports: prev.totalImports + 1,
      successfulImports: success ? prev.successfulImports + 1 : prev.successfulImports,
      failedImports: success ? prev.failedImports : prev.failedImports + 1,
      importTypes: {
        ...prev.importTypes,
        [type]: (prev.importTypes[type] || 0) + 1
      },
      lastImportDate: new Date()
    }));
  }, []);

  const resetAnalytics = useCallback(() => {
    setAnalytics({
      totalExports: 0,
      totalImports: 0,
      successfulExports: 0,
      successfulImports: 0,
      failedExports: 0,
      failedImports: 0,
      exportTypes: {},
      importTypes: {},
      lastExportDate: null,
      lastImportDate: null
    });
  }, []);

  return {
    analytics,
    trackExport,
    trackImport,
    resetAnalytics
  };
}

/**
 * Comprehensive hook combining all import/export functionality
 */
export function useBrandImportExport() {
  const exportHook = useBrandExport();
  const importHook = useBrandImport();
  const fileUploadHook = useFileUpload();
  const validationHook = useBrandValidation();
  const analyticsHook = useBrandAnalytics();

  const exportAndDownload = useCallback(async (
    config: DynamicBrandConfig,
    options: BrandExportOptions = { format: 'json', includeAssets: true, includeValidation: true }
  ) => {
    try {
      const exportData = await exportHook.exportBrandConfig(config, options);
      const success = exportHook.downloadExport(exportData);
      
      analyticsHook.trackExport('brand-config', success);
      
      if (!success) {
        throw new Error('Download failed');
      }
      
      return { success: true, data: exportData };
    } catch (error) {
      analyticsHook.trackExport('brand-config', false);
      throw error;
    }
  }, [exportHook, analyticsHook]);

  const importFromFileAndApply = useCallback(async (
    file: File,
    options: BrandImportOptions = { validate: true, overwrite: false, createBackup: true }
  ) => {
    try {
      const result = await importHook.importFromFile(file, options);
      
      analyticsHook.trackImport('file', result.success);
      
      return result;
    } catch (error) {
      analyticsHook.trackImport('file', false);
      throw error;
    }
  }, [importHook, analyticsHook]);

  return {
    // Export functionality
    ...exportHook,
    exportAndDownload,
    
    // Import functionality
    ...importHook,
    importFromFileAndApply,
    
    // File upload functionality
    ...fileUploadHook,
    
    // Validation functionality
    ...validationHook,
    
    // Analytics functionality
    ...analyticsHook
  };
}
