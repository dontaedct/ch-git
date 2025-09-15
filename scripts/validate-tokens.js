#!/usr/bin/env node

/**
 * Token Validation Script
 * HT-021.3.1 - Design Token Pipeline Implementation
 * 
 * Validates design tokens for:
 * - DTCG format compliance
 * - Reference resolution
 * - Naming conventions
 * - Type consistency
 * - Performance requirements
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const VALIDATION_RULES = {
  maxTokenFileSize: 100 * 1024, // 100KB max per file
  requiredProperties: ['$type', '$value'],
  validTypes: [
    'color', 'dimension', 'fontFamily', 'fontWeight', 
    'number', 'shadow', 'duration', 'cubicBezier'
  ],
  namingPattern: /^[a-z][a-zA-Z0-9]*$/,
  colorFormat: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^rgba?\(/,
};

class TokenValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.stats = {
      filesScanned: 0,
      tokensValidated: 0,
      totalSize: 0
    };
  }

  async validateAll() {
    console.log('🔍 Starting token validation...\n');

    const tokenFiles = await glob('tokens/**/*.json');
    
    if (tokenFiles.length === 0) {
      this.errors.push('No token files found in tokens/ directory');
      return this.report();
    }

    for (const filePath of tokenFiles) {
      await this.validateFile(filePath);
    }

    return this.report();
  }

  async validateFile(filePath) {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const fileSize = Buffer.byteLength(content, 'utf-8');
      
      this.stats.filesScanned++;
      this.stats.totalSize += fileSize;

      // Check file size
      if (fileSize > VALIDATION_RULES.maxTokenFileSize) {
        this.warnings.push(`${filePath}: File size (${fileSize} bytes) exceeds recommended limit`);
      }

      // Parse JSON
      let tokens;
      try {
        tokens = JSON.parse(content);
      } catch (parseError) {
        this.errors.push(`${filePath}: Invalid JSON - ${parseError.message}`);
        return;
      }

      // Validate schema
      if (!tokens.$schema || !tokens.$schema.includes('design-tokens.github.io')) {
        this.warnings.push(`${filePath}: Missing or invalid $schema property`);
      }

      // Validate tokens recursively
      this.validateTokenObject(tokens, filePath, []);

    } catch (error) {
      this.errors.push(`${filePath}: Failed to read file - ${error.message}`);
    }
  }

  validateTokenObject(obj, filePath, path) {
    for (const [key, value] of Object.entries(obj)) {
      // Skip schema and metadata
      if (key.startsWith('$') || key === 'name' || key === 'description') {
        continue;
      }

      const currentPath = [...path, key];
      const pathString = currentPath.join('.');

      // Check naming convention for token keys
      if (!VALIDATION_RULES.namingPattern.test(key)) {
        this.warnings.push(`${filePath}:${pathString}: Key "${key}" doesn't follow camelCase naming convention`);
      }

      if (this.isToken(value)) {
        this.validateToken(value, filePath, pathString);
        this.stats.tokensValidated++;
      } else if (typeof value === 'object' && value !== null) {
        // Recurse into nested objects
        this.validateTokenObject(value, filePath, currentPath);
      }
    }
  }

  isToken(obj) {
    return obj && typeof obj === 'object' && '$value' in obj;
  }

  validateToken(token, filePath, path) {
    // Check required properties
    for (const prop of VALIDATION_RULES.requiredProperties) {
      if (!(prop in token)) {
        this.errors.push(`${filePath}:${path}: Missing required property "${prop}"`);
      }
    }

    // Validate type
    if (token.$type && !VALIDATION_RULES.validTypes.includes(token.$type)) {
      this.errors.push(`${filePath}:${path}: Invalid token type "${token.$type}"`);
    }

    // Type-specific validations
    this.validateTokenValue(token, filePath, path);

    // Check for circular references in token references
    if (typeof token.$value === 'string' && token.$value.startsWith('{') && token.$value.endsWith('}')) {
      const referencePath = token.$value.slice(1, -1);
      if (referencePath === path) {
        this.errors.push(`${filePath}:${path}: Circular reference detected`);
      }
    }
  }

  validateTokenValue(token, filePath, path) {
    const { $type, $value } = token;

    switch ($type) {
      case 'color':
        if (typeof $value === 'string' && !VALIDATION_RULES.colorFormat.test($value) && !$value.startsWith('{')) {
          this.errors.push(`${filePath}:${path}: Invalid color format "${$value}"`);
        }
        break;

      case 'dimension':
        if (typeof $value === 'string' && !$value.match(/^[0-9.]+(?:px|rem|em|%|vh|vw)$/) && !$value.startsWith('{')) {
          this.errors.push(`${filePath}:${path}: Invalid dimension format "${$value}"`);
        }
        break;

      case 'number':
        if (typeof $value !== 'number' && !$value.toString().startsWith('{')) {
          this.errors.push(`${filePath}:${path}: Number tokens must have numeric values`);
        }
        break;

      case 'fontFamily':
        if (!Array.isArray($value) && typeof $value !== 'string' && !$value.toString().startsWith('{')) {
          this.errors.push(`${filePath}:${path}: Font family must be string or array`);
        }
        break;

      case 'shadow':
        if (typeof $value === 'object') {
          const requiredProps = ['offsetX', 'offsetY', 'blur', 'color'];
          const missingProps = requiredProps.filter(prop => !(prop in $value));
          if (missingProps.length > 0) {
            this.errors.push(`${filePath}:${path}: Shadow missing properties: ${missingProps.join(', ')}`);
          }
        }
        break;

      case 'duration':
        if (typeof $value === 'string' && !$value.match(/^[0-9.]+(?:ms|s)$/) && !$value.startsWith('{')) {
          this.errors.push(`${filePath}:${path}: Invalid duration format "${$value}"`);
        }
        break;

      case 'cubicBezier':
        if (!Array.isArray($value) || $value.length !== 4) {
          this.errors.push(`${filePath}:${path}: Cubic bezier must be array of 4 numbers`);
        } else if (!$value.every(n => typeof n === 'number')) {
          this.errors.push(`${filePath}:${path}: All cubic bezier values must be numbers`);
        }
        break;
    }
  }

  report() {
    console.log('📊 Validation Results:');
    console.log(`   Files scanned: ${this.stats.filesScanned}`);
    console.log(`   Tokens validated: ${this.stats.tokensValidated}`);
    console.log(`   Total size: ${Math.round(this.stats.totalSize / 1024)}KB\n`);

    if (this.errors.length > 0) {
      console.log('❌ Errors:', this.errors.length);
      this.errors.forEach(error => console.log(`   ${error}`));
      console.log('');
    }

    if (this.warnings.length > 0) {
      console.log('⚠️  Warnings:', this.warnings.length);
      this.warnings.forEach(warning => console.log(`   ${warning}`));
      console.log('');
    }

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ All tokens are valid!');
    }

    // Performance checks
    if (this.stats.totalSize > 500 * 1024) {
      console.log('🔔 Performance: Token files are quite large. Consider splitting or optimizing.');
    }

    if (this.stats.tokensValidated > 1000) {
      console.log('🔔 Performance: Large number of tokens. Consider token optimization.');
    }

    console.log('');
    return this.errors.length === 0;
  }
}

// Run validation
const validator = new TokenValidator();
const success = await validator.validateAll();

process.exit(success ? 0 : 1);