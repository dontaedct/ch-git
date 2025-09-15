/**
 * @fileoverview Blocks Renderer Component - HT-006 Phase 3
 * @module components-sandbox/BlocksRenderer
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-006 - Token-Driven Design System & Block-Based Architecture
 * Focus: JSON-driven block architecture with Zod validation
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: Medium (new architecture patterns, complex validation)
 */

'use client';

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components-sandbox/ui/button';
import { 
  blockRegistry, 
  validateBlockContent, 
  getBlockView, 
  BlockContent,
  BlockTypeValue 
} from '@/blocks-sandbox/registry';

/**
 * Error boundary for individual blocks
 */
class BlockErrorBoundary extends React.Component<
  { children: React.ReactNode; blockId?: string },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; blockId?: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Block ${this.props.blockId || 'unknown'} error:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive" className="my-8 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-red-900 dark:text-red-100">Block Rendering Error</p>
                <p className="text-sm mt-1 text-red-700 dark:text-red-300">
                  Failed to render block {this.props.blockId || 'unknown'}. 
                  {this.state.error && (
                    <span className="block mt-1 text-xs opacity-75 text-red-600 dark:text-red-400">
                      {this.state.error.message}
                    </span>
                  )}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => this.setState({ hasError: false, error: undefined })}
                className="ml-4"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

/**
 * Individual block renderer component
 */
interface BlockRendererProps {
  content: BlockContent;
  className?: string;
}

function BlockRenderer({ content, className = '' }: BlockRendererProps) {
  // Validate the block content
  const validation = validateBlockContent(content);
  
  if (!validation.valid) {
    return (
      <Alert variant="destructive" className="my-8 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
        <AlertDescription className="text-red-800 dark:text-red-200">
          <div>
            <p className="font-semibold text-red-900 dark:text-red-100">Block Validation Error</p>
            <p className="text-sm mt-1 text-red-700 dark:text-red-300">
              Block {content.id || 'unknown'} failed validation: {validation.error}
            </p>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Get the appropriate view component
  const BlockView = getBlockView(content.type);
  
  if (!BlockView) {
    return (
      <Alert variant="destructive" className="my-8 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
        <AlertDescription className="text-red-800 dark:text-red-200">
          <div>
            <p className="font-semibold text-red-900 dark:text-red-100">Unknown Block Type</p>
            <p className="text-sm mt-1 text-red-700 dark:text-red-300">
              No view component found for block type: {content.type}
            </p>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Render the block with error boundary
  return (
    <BlockErrorBoundary blockId={content.id}>
      <BlockView content={validation.data!} className={className} />
    </BlockErrorBoundary>
  );
}

/**
 * Main blocks renderer component
 * 
 * Renders a list of blocks with comprehensive error handling:
 * - Individual block error boundaries
 * - Content validation with Zod schemas
 * - Graceful degradation for invalid blocks
 * - Retry functionality for failed blocks
 */
interface BlocksRendererProps {
  blocks: BlockContent[];
  className?: string;
  fallback?: React.ReactNode;
}

export function BlocksRenderer({ 
  blocks, 
  className = '', 
  fallback 
}: BlocksRendererProps) {
  // Handle empty blocks array
  if (!blocks || blocks.length === 0) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <Alert className="my-8 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <AlertCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        <AlertDescription className="text-gray-800 dark:text-gray-200">
          No blocks to render. Add some blocks to your page content.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`blocks-container ${className}`}>
      {blocks.map((block, index) => (
        <BlockRenderer
          key={block.id || `block-${index}`}
          content={block}
          className={`block-${block.type} block-${block.id}`}
        />
      ))}
    </div>
  );
}

/**
 * Hook for validating page content
 */
export function usePageContentValidation(blocks: BlockContent[]) {
  const [validationResults, setValidationResults] = React.useState<{
    valid: boolean;
    errors: string[];
    validBlocks: BlockContent[];
  }>({
    valid: true,
    errors: [],
    validBlocks: [],
  });

  React.useEffect(() => {
    const errors: string[] = [];
    const validBlocks: BlockContent[] = [];

    blocks.forEach((block, index) => {
      const validation = validateBlockContent(block);
      
      if (!validation.valid) {
        errors.push(`Block ${index + 1} (${block.id || 'unknown'}): ${validation.error}`);
      } else {
        validBlocks.push(validation.data!);
      }
    });

    setValidationResults({
      valid: errors.length === 0,
      errors,
      validBlocks,
    });
  }, [blocks]);

  return validationResults;
}

/**
 * Utility function to create a page from block data
 */
export function createPageFromBlocks(blocks: BlockContent[]): {
  valid: boolean;
  errors: string[];
  page: React.ReactElement;
} {
  const validation = blocks.map(block => validateBlockContent(block));
  const errors = validation
    .filter(v => !v.valid)
    .map(v => v.error!);
  
  const validBlocks = validation
    .filter(v => v.valid)
    .map(v => v.data!);

  const page = (
    <BlocksRenderer 
      blocks={validBlocks}
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <Alert variant="destructive" className="max-w-md bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <div>
                <p className="font-semibold text-red-900 dark:text-red-100">Page Content Error</p>
                <p className="text-sm mt-1 text-red-700 dark:text-red-300">
                  {errors.length > 0 
                    ? `Found ${errors.length} validation errors in page content.`
                    : 'No valid blocks found in page content.'
                  }
                </p>
                {errors.length > 0 && (
                  <ul className="text-xs mt-2 space-y-1 text-red-600 dark:text-red-400">
                    {errors.map((error, index) => (
                      <li key={index} className="opacity-75">• {error}</li>
                    ))}
                  </ul>
                )}
              </div>
            </AlertDescription>
          </Alert>
        </div>
      }
    />
  );

  return {
    valid: errors.length === 0,
    errors,
    page,
  };
}

export default BlocksRenderer;
