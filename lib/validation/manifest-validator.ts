/**
 * TypeScript wrapper for manifest-validator
 * Provides type-safe access to validation functions
 */

// Import the CommonJS module
const manifestValidator = require('../../tools/manifest-validator');

export const validateTemplate = manifestValidator.validateTemplate;
export const validateForm = manifestValidator.validateForm;
export const validateManifest = manifestValidator.validateManifest;
export const formatError = manifestValidator.formatError;
export const generateWarnings = manifestValidator.generateWarnings;
export const calculateComplexity = manifestValidator.calculateComplexity;

export default manifestValidator;