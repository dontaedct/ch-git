/**
 * @fileoverview HT-006 Token Editor Page
 * @module app/sandbox/token-editor/page
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: HT-006 Phase 6 - Developer Experience Enhancement
 * Purpose: Real-time token editing with live preview capabilities
 * Safety: Sandbox-isolated token experimentation environment
 * Status: Phase 6 implementation - Interactive development tools
 */

'use client'

import React, { useState, useEffect } from 'react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button,
  Badge,
  Input
} from '../../../components-sandbox/ui'
import { BlocksRenderer } from '@/components-sandbox/BlocksRenderer'
import { 
  Palette, 
  Save, 
  RotateCcw, 
  Copy, 
  Download,
  Upload,
  Eye,
  Code,
  Zap,
  CheckCircle,
  AlertCircle,
  Settings,
  Layers,
  Type,
  Move,
  CornerDownRight
} from 'lucide-react'

// Import demo content for preview
import heroDemo from '@/blocks-sandbox/Hero/demo.json'
import featuresDemo from '@/blocks-sandbox/Features/demo.json'

export default function TokenEditorPage() {
  const [activeTab, setActiveTab] = useState<'colors' | 'spacing' | 'typography' | 'shadows'>('colors')
  const [editedTokens, setEditedTokens] = useState<any>({})
  const [previewMode, setPreviewMode] = useState<'components' | 'blocks'>('components')
  const [hasChanges, setHasChanges] = useState(false)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  // Initialize with base tokens
  useEffect(() => {
    // This would normally load from the actual token files
    setEditedTokens({
      colors: {
        'brand-primary': '#3b82f6',
        'brand-secondary': '#6366f1',
        'neutral-50': '#ffffff',
        'neutral-100': '#f8f9fa',
        'neutral-900': '#171717',
        'success-500': '#22c55e',
        'warning-500': '#f59e0b',
        'danger-500': '#ef4444'
      },
      spacing: {
        'xs': '0.5rem',
        'sm': '0.75rem',
        'md': '1rem',
        'lg': '1.5rem',
        'xl': '2rem'
      },
      typography: {
        'font-size-sm': '0.875rem',
        'font-size-base': '1rem',
        'font-size-lg': '1.125rem',
        'font-size-xl': '1.25rem',
        'font-weight-normal': '400',
        'font-weight-medium': '500',
        'font-weight-semibold': '600'
      },
      shadows: {
        'shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      }
    })
  }, [])

  const handleTokenChange = (category: string, tokenName: string, value: string) => {
    setEditedTokens((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [tokenName]: value
      }
    }))
    setHasChanges(true)
  }

  const resetTokens = () => {
    // Reset to original values
    setHasChanges(false)
    // In a real implementation, this would reload from the original token files
  }

  const saveTokens = () => {
    // In a real implementation, this would save to the token files
    setHasChanges(false)
    alert('Tokens saved! (This is a demo - in production this would update the actual token files)')
  }

  const copyTokenValue = async (value: string, tokenName: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedToken(tokenName)
      setTimeout(() => setCopiedToken(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const exportTokens = () => {
    const dataStr = JSON.stringify(editedTokens, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'custom-tokens.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const renderColorEditor = () => (
    <div className="space-y-4">
      {Object.entries(editedTokens.colors || {}).map(([tokenName, value]) => (
        <div key={tokenName} className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg">
          <div 
            className="w-12 h-12 rounded-lg border border-border"
            style={{ backgroundColor: value as string }}
          />
          <div className="flex-1">
            <div className="font-medium text-sm">{tokenName}</div>
            <div className="text-xs text-muted-foreground font-mono">{String(value)}</div>
          </div>
          <Input
            value={value as string}
            onChange={(e) => handleTokenChange('colors', tokenName, e.target.value)}
            className="w-32"
            placeholder="#000000"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyTokenValue(value as string, tokenName)}
            icon={copiedToken === tokenName ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          >
            {copiedToken === tokenName ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      ))}
    </div>
  )

  const renderSpacingEditor = () => (
    <div className="space-y-4">
      {Object.entries(editedTokens.spacing || {}).map(([tokenName, value]) => (
        <div key={tokenName} className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg">
          <div className="flex items-center gap-3">
            <div
              className="bg-blue-500 h-4 border-l-2 border-blue-500"
              style={{ width: value as string }}
            />
            <div className="font-medium text-sm">{tokenName}</div>
          </div>
          <div className="flex-1">
            <div className="text-xs text-muted-foreground font-mono">{String(value)}</div>
          </div>
          <Input
            value={value as string}
            onChange={(e) => handleTokenChange('spacing', tokenName, e.target.value)}
            className="w-24"
            placeholder="1rem"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyTokenValue(value as string, tokenName)}
            icon={<Copy className="w-4 h-4" />}
          />
        </div>
      ))}
    </div>
  )

  const renderTypographyEditor = () => (
    <div className="space-y-4">
      {Object.entries(editedTokens.typography || {}).map(([tokenName, value]) => (
        <div key={tokenName} className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg">
          <div className="flex items-center gap-3">
            <span 
              className="text-foreground"
              style={{ 
                fontSize: tokenName.includes('font-size') ? value as string : '1rem',
                fontWeight: tokenName.includes('font-weight') ? value as string : '400'
              }}
            >
              Aa
            </span>
            <div className="font-medium text-sm">{tokenName}</div>
          </div>
          <div className="flex-1">
            <div className="text-xs text-muted-foreground font-mono">{String(value)}</div>
          </div>
          <Input
            value={value as string}
            onChange={(e) => handleTokenChange('typography', tokenName, e.target.value)}
            className="w-24"
            placeholder="1rem"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyTokenValue(value as string, tokenName)}
            icon={<Copy className="w-4 h-4" />}
          />
        </div>
      ))}
    </div>
  )

  const renderShadowEditor = () => (
    <div className="space-y-4">
      {Object.entries(editedTokens.shadows || {}).map(([tokenName, value]) => (
        <div key={tokenName} className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg">
          <div 
            className="w-16 h-16 bg-card border border-border rounded-lg"
            style={{ boxShadow: value as string }}
          />
          <div className="flex-1">
            <div className="font-medium text-sm">{tokenName}</div>
            <div className="text-xs text-muted-foreground font-mono break-all">{String(value)}</div>
          </div>
          <Input
            value={value as string}
            onChange={(e) => handleTokenChange('shadows', tokenName, e.target.value)}
            className="w-48"
            placeholder="0 1px 2px rgba(0,0,0,0.1)"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyTokenValue(value as string, tokenName)}
            icon={<Copy className="w-4 h-4" />}
          />
        </div>
      ))}
    </div>
  )

  const renderPreview = () => {
    if (previewMode === 'components') {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-card border border-border rounded-lg">
              <h4 className="font-semibold mb-3">Button Preview</h4>
              <div className="space-y-2">
                <Button variant="primary" size="sm">Primary</Button>
                <Button variant="secondary" size="sm">Secondary</Button>
                <Button variant="ghost" size="sm">Ghost</Button>
              </div>
            </div>
            <div className="p-4 bg-card border border-border rounded-lg">
              <h4 className="font-semibold mb-3">Card Preview</h4>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Sample Card</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Card content with current tokens</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className="space-y-4">
          <BlocksRenderer
            blocks={[heroDemo as any]}
            className="block-preview"
            fallback={<div className="p-8 text-center text-muted-foreground">Preview unavailable</div>}
          />
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Token Editor
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Real-time token editing with live preview
              </p>
            </div>
            <div className="flex items-center gap-4">
              {hasChanges && (
                <Badge variant="soft" tone="warning">
                  Unsaved Changes
                </Badge>
              )}
              <Button
                variant="outline"
                onClick={resetTokens}
                icon={<RotateCcw className="w-4 h-4" />}
                disabled={!hasChanges}
              >
                Reset
              </Button>
              <Button
                variant="primary"
                onClick={saveTokens}
                icon={<Save className="w-4 h-4" />}
                disabled={!hasChanges}
              >
                Save Tokens
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Token Editor */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      Token Editor
                    </CardTitle>
                    <CardDescription>
                      Edit design tokens and see changes in real-time
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportTokens}
                      icon={<Download className="w-4 h-4" />}
                    >
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Tab Navigation */}
                <div className="flex gap-2 mb-6">
                  {[
                    { id: 'colors', label: 'Colors', icon: Palette },
                    { id: 'spacing', label: 'Spacing', icon: Move },
                    { id: 'typography', label: 'Typography', icon: Type },
                    { id: 'shadows', label: 'Shadows', icon: Layers }
                  ].map((tab) => (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveTab(tab.id as any)}
                      icon={<tab.icon className="w-4 h-4" />}
                    >
                      {tab.label}
                    </Button>
                  ))}
                </div>

                {/* Token Editor Content */}
                <div className="max-h-96 overflow-y-auto">
                  {activeTab === 'colors' && renderColorEditor()}
                  {activeTab === 'spacing' && renderSpacingEditor()}
                  {activeTab === 'typography' && renderTypographyEditor()}
                  {activeTab === 'shadows' && renderShadowEditor()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Preview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Live Preview
                    </CardTitle>
                    <CardDescription>
                      See your changes in real-time
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={previewMode === 'components' ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setPreviewMode('components')}
                    >
                      Components
                    </Button>
                    <Button
                      variant={previewMode === 'blocks' ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setPreviewMode('blocks')}
                    >
                      Blocks
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto">
                  {renderPreview()}
                </div>
              </CardContent>
            </Card>

            {/* Token Info */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Token Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium mb-1">Current Brand</div>
                  <div className="text-muted-foreground">Default (Tech)</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium mb-1">Token Count</div>
                  <div className="text-muted-foreground">
                    {Object.keys(editedTokens).reduce((acc, category) => 
                      acc + Object.keys(editedTokens[category] || {}).length, 0
                    )} tokens
                  </div>
                </div>
                <div className="text-sm">
                  <div className="font-medium mb-1">Last Modified</div>
                  <div className="text-muted-foreground">
                    {hasChanges ? 'Just now' : 'Never'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Implementation Guide */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Implementation Guide
              </CardTitle>
              <CardDescription>
                How to use your custom tokens in production
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">1. Export Your Tokens</h4>
                  <p className="text-sm text-muted-foreground">
                    Download your custom token configuration as JSON
                  </p>
                  <div className="bg-muted p-3 rounded text-sm font-mono">
                    {`{
  "colors": {
    "brand-primary": "#your-color"
  }
}`}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">2. Apply to Your Project</h4>
                  <p className="text-sm text-muted-foreground">
                    Replace the values in your token files
                  </p>
                  <div className="bg-muted p-3 rounded text-sm font-mono">
                    {`// tokens/brands/custom.json
{
  "color": {
    "brand": {
      "500": { "$value": "#your-color" }
    }
  }
}`}
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  💡 Pro Tip
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Test your tokens across different components and blocks to ensure they work 
                  well together. Consider accessibility and contrast ratios when choosing colors.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
