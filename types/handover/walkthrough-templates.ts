export interface WalkthroughTemplate {
  id: string;
  title: string;
  description: string;
  version: string;
  metadata: TemplateMetadata;
  steps: TemplateStep[];
  customization: TemplateCustomization;
}

export interface TemplateMetadata {
  name: string;
  description: string;
  category: string;
  type: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  tags: string[];
  author: string;
  isBuiltIn: boolean;
  isPublic: boolean;
  isClone?: boolean;
  clonedFrom?: string;
  requiresRole?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateStep {
  id: string;
  title: string;
  content: string;
  type: string;
  order: number;
  estimatedDuration: number;
  required: boolean;
  screenshotConfig?: any[];
  videoConfig?: any[];
  annotations?: any[];
  interactions?: any;
  validation?: any;
  feedback?: any;
}

export interface TemplateCustomization {
  allowStepReordering: boolean;
  allowStepDeletion: boolean;
  allowStepModification: boolean;
  allowBrandingCustomization: boolean;
  allowContentCustomization: boolean;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}