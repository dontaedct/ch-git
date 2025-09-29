/**
 * @fileoverview Templates Type Definitions
 * @module types/templates
 * @author OSS Hero System
 * @version 1.0.0
 * @created 2025-09-22
 */

// Export all template-related types
export * from './template-config';
export * from './customization';

// Define common template types
export interface TemplateManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: string;
  tags: string[];
  dependencies: string[];
  files: TemplateFile[];
  configuration: TemplateConfiguration;
  metadata: TemplateMetadata;
}

export interface TemplateFile {
  path: string;
  type: 'component' | 'page' | 'layout' | 'api' | 'config' | 'asset';
  content: string;
  encoding?: 'utf8' | 'base64';
  isTemplated: boolean;
  variables?: TemplateVariable[];
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  defaultValue?: any;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    options?: string[];
  };
}

export interface TemplateConfiguration {
  framework: 'nextjs' | 'react' | 'vue' | 'angular' | 'svelte';
  language: 'typescript' | 'javascript';
  styling: 'tailwind' | 'css' | 'scss' | 'styled-components';
  database?: 'supabase' | 'firebase' | 'mongodb' | 'postgresql';
  authentication?: 'supabase' | 'firebase' | 'auth0' | 'clerk';
  deployment: 'vercel' | 'netlify' | 'aws' | 'gcp' | 'azure';
}

export interface TemplateMetadata {
  complexity: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedSetupTime: number; // in minutes
  features: string[];
  screenshots: string[];
  demoUrl?: string;
  documentationUrl?: string;
  supportLevel: 'community' | 'basic' | 'premium' | 'enterprise';
  license: string;
  pricing: {
    type: 'free' | 'one-time' | 'subscription';
    amount?: number;
    currency?: string;
  };
}