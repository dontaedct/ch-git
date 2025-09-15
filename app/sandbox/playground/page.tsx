/**
 * @fileoverview HT-007 Playground Page - Mono-Theme Enhancement
 * @module app/sandbox/playground/page
 * @author OSS Hero System
 * @version 2.0.0
 * 
 * UNIVERSAL HEADER: HT-007 Phase 7 - Playground & Tour Pages Upgrade
 * Purpose: Sophisticated component playground with HT-007 mono-theme system
 * Safety: Sandbox-isolated component experimentation environment
 * Status: HT-007 Phase 7 implementation - High-tech interactive playground
 */

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import { 
  Play, 
  Code, 
  Copy, 
  Download,
  RotateCcw,
  Eye,
  Settings,
  Zap,
  CheckCircle,
  AlertCircle,
  Layers,
  Palette,
  Type,
  Move,
  Sparkles,
  Monitor,
  Smartphone,
  Tablet,
  RefreshCw,
  Save,
  Share2,
  Maximize2,
  Minimize2
} from 'lucide-react'

// HT-007: Enhanced Component Playground with Mono-Theme System
export default function ComponentPlaygroundPage() {
  // HT-007: Enhanced state management
  const [selectedComponent, setSelectedComponent] = useState('button')
  const [componentProps, setComponentProps] = useState<any>({})
  const [generatedCode, setGeneratedCode] = useState('')
  const [copiedCode, setCopiedCode] = useState(false)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [savedConfigurations, setSavedConfigurations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  // HT-007: Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // HT-007: Enhanced components with sophisticated metadata
  const components = [
    {
      id: 'button',
      name: 'Button',
      description: 'Interactive button component with HT-007 mono-theme variants',
      icon: Play,
      category: 'interaction',
      complexity: 'simple',
      popularity: 'high',
      lastUpdated: '2025-01-15',
      props: {
        variant: { type: 'select', options: ['primary', 'secondary', 'ghost', 'link', 'destructive'], default: 'primary' },
        size: { type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
        tone: { type: 'select', options: ['brand', 'neutral', 'success', 'warning', 'danger'], default: 'brand' },
        disabled: { type: 'boolean', default: false },
        loading: { type: 'boolean', default: false },
        fullWidth: { type: 'boolean', default: false },
        children: { type: 'text', default: 'Button' }
      }
    },
    {
      id: 'input',
      name: 'Input',
      description: 'Form input component with HT-007 validation states',
      icon: Settings,
      category: 'form',
      complexity: 'medium',
      popularity: 'high',
      lastUpdated: '2025-01-15',
      props: {
        variant: { type: 'select', options: ['outline', 'filled'], default: 'outline' },
        size: { type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
        type: { type: 'select', options: ['text', 'email', 'password', 'number', 'tel'], default: 'text' },
        placeholder: { type: 'text', default: 'Enter text...' },
        label: { type: 'text', default: 'Label' },
        required: { type: 'boolean', default: false },
        disabled: { type: 'boolean', default: false },
        error: { type: 'text', default: '' },
        success: { type: 'text', default: '' },
        warning: { type: 'text', default: '' }
      }
    },
    {
      id: 'card',
      name: 'Card',
      description: 'Container component with HT-007 elevation variants',
      icon: Layers,
      category: 'layout',
      complexity: 'simple',
      popularity: 'high',
      lastUpdated: '2025-01-15',
      props: {
        variant: { type: 'select', options: ['default', 'outlined', 'filled'], default: 'default' },
        elevation: { type: 'select', options: ['none', 'sm', 'md', 'lg'], default: 'sm' },
        padding: { type: 'select', options: ['none', 'sm', 'md', 'lg'], default: 'md' }
      }
    },
    {
      id: 'badge',
      name: 'Badge',
      description: 'Status indicator with HT-007 semantic tones',
      icon: Zap,
      category: 'display',
      complexity: 'simple',
      popularity: 'medium',
      lastUpdated: '2025-01-15',
      props: {
        variant: { type: 'select', options: ['solid', 'soft', 'outline'], default: 'solid' },
        tone: { type: 'select', options: ['brand', 'neutral', 'success', 'warning', 'danger'], default: 'brand' },
        size: { type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
        children: { type: 'text', default: 'Badge' }
      }
    }
  ]

  const currentComponent = components.find(comp => comp.id === selectedComponent)

  // HT-007: Enhanced utility functions
  const getPreviewDimensions = () => {
    switch (previewMode) {
      case 'mobile': return { width: '375px', height: '667px' }
      case 'tablet': return { width: '768px', height: '1024px' }
      default: return { width: '100%', height: 'auto' }
    }
  }

  const saveConfiguration = () => {
    const config = {
      id: Date.now().toString(),
      name: `${currentComponent?.name} Configuration`,
      component: selectedComponent,
      props: componentProps,
      code: generatedCode,
      timestamp: new Date().toISOString()
    }
    setSavedConfigurations((prev: any[]) => [...prev, config])
  }

  const loadConfiguration = (config: any) => {
    setSelectedComponent(config.component)
    setComponentProps(config.props)
    setGeneratedCode(config.code)
  }

  const generateCode = () => {
    if (!currentComponent) return

    const propsString = Object.entries(componentProps)
      .filter(([key, value]) => {
        const propDef = (currentComponent.props as any)[key]
        return value !== propDef?.default && value !== '' && value !== false
      })
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `${key}="${value}"`
        } else if (typeof value === 'boolean') {
          return value ? key : ''
        } else {
          return `${key}={${JSON.stringify(value)}}`
        }
      })
      .filter(Boolean)
      .join(' ')

    const importStatement = `import { ${currentComponent.name} } from '@/components-sandbox/ui'`
    const componentUsage = `<${currentComponent.name}${propsString ? ` ${propsString}` : ''} />`

    setGeneratedCode(`${importStatement}\n\n${componentUsage}`)
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${selectedComponent}-component.tsx`
    link.click()
    URL.revokeObjectURL(url)
  }

  const resetProps = () => {
    if (!currentComponent) return
    const resetProps: any = {}
    Object.entries(currentComponent.props).forEach(([key, propDef]) => {
      resetProps[key] = propDef.default
    })
    setComponentProps(resetProps)
  }

  // HT-007: Animation variants for motion effects
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: "easeOut" }
  }

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const scaleIn = {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.2, ease: "easeOut" }
  }

  if (!mounted) {
    return <div className="min-h-screen bg-background" />
  }

  const renderComponentPreview = () => {
    if (!currentComponent) return null

    const props = { ...componentProps }
    
    // Remove empty or default values
    Object.entries(currentComponent.props).forEach(([key, propDef]) => {
      if (props[key] === propDef.default || props[key] === '') {
        delete props[key]
      }
    })

    switch (currentComponent.id) {
      case 'button':
        return (
          <div className="space-y-4">
            <Button {...props}>
              {props.children || 'Button'}
            </Button>
            <div className="text-sm text-muted-foreground">
              Click to test interaction states
            </div>
          </div>
        )
      case 'input':
        return (
          <div className="space-y-4">
            <Input {...props} />
            <div className="text-sm text-muted-foreground">
              Try typing to test the input
            </div>
          </div>
        )
      case 'card':
        return (
          <div className="space-y-4">
            <Card {...props}>
              <CardHeader>
                <CardTitle className="text-sm">Sample Card</CardTitle>
                <CardDescription className="text-xs">Card with current props</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This card demonstrates the current configuration.
                </p>
              </CardContent>
            </Card>
          </div>
        )
      case 'badge':
        return (
          <div className="space-y-4">
            <Badge {...props}>
              {props.children || 'Badge'}
            </Badge>
            <div className="text-sm text-muted-foreground">
              Badge with current styling
            </div>
          </div>
        )
      default:
        return <div className="text-muted-foreground">Component preview not available</div>
    }
  }

  const renderPropEditor = () => {
    if (!currentComponent) return null

    return (
      <div className="space-y-4">
        {Object.entries(currentComponent.props).map(([propName, propDef]) => (
          <div key={propName} className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {propName}
              {propDef.type === 'boolean' ? '' : ' *'}
            </label>
            
            {propDef.type === 'select' ? (
              <select
                value={componentProps[propName] || propDef.default}
                onChange={(e) => setComponentProps((prev: any) => ({ ...prev, [propName]: e.target.value }))}
                className="w-full p-2 border border-border rounded-md bg-background text-foreground"
              >
                {propDef.options.map((option: string) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : propDef.type === 'boolean' ? (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={componentProps[propName] || false}
                  onChange={(e) => setComponentProps((prev: any) => ({ ...prev, [propName]: e.target.checked }))}
                  className="rounded border-border"
                />
                <span className="text-sm text-muted-foreground">Enabled</span>
              </div>
            ) : (
              <Input
                value={componentProps[propName] || ''}
                onChange={(e) => setComponentProps((prev: any) => ({ ...prev, [propName]: e.target.value }))}
                placeholder={propDef.default}
                className="w-full"
              />
            )}
            
            <div className="text-xs text-muted-foreground">
              Default: {typeof propDef.default === 'string' ? `"${propDef.default}"` : propDef.default.toString()}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* HT-007: Enhanced Header with Motion Effects */}
      <motion.div 
        className="border-b border-border bg-card"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1 
                className="text-3xl font-bold text-foreground"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                HT-007 Component Playground
              </motion.h1>
              <motion.p 
                className="text-lg text-muted-foreground mt-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Sophisticated component builder with HT-007 mono-theme system and advanced code generation
              </motion.p>
              <div className="flex items-center gap-2 mt-3">
                <span className="mono-badge mono-badge-primary">HT-007 ✅</span>
                <span className="mono-text-xs mono-text-secondary">Mono-theme active</span>
              </div>
            </div>
            <motion.div 
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                variant="outline"
                onClick={resetProps}
                icon={<RotateCcw className="w-4 h-4" />}
              >
                Reset Props
              </Button>
              <Button
                variant="primary"
                onClick={generateCode}
                icon={<Code className="w-4 h-4" />}
              >
                Generate Code
              </Button>
              <Button
                variant="ghost"
                onClick={saveConfiguration}
                icon={<Save className="w-4 h-4" />}
              >
                Save Config
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-8">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-4 gap-8"
          variants={staggerChildren}
          initial="initial"
          animate="animate"
        >
          {/* HT-007: Enhanced Component Selector */}
          <motion.div 
            className="lg:col-span-1"
            variants={fadeInUp}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  HT-007 Components
                </CardTitle>
                <CardDescription>
                  Select a component to customize with HT-007 mono-theme system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <AnimatePresence>
                  {components.map((component, index) => (
                    <motion.button
                      key={component.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => {
                        setSelectedComponent(component.id)
                        // Reset props when switching components
                        const resetProps: any = {}
                        Object.entries(component.props).forEach(([key, propDef]) => {
                          resetProps[key] = propDef.default
                        })
                        setComponentProps(resetProps)
                      }}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedComponent === component.id
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <component.icon className="w-4 h-4" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{component.name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {component.description}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="soft" size="sm" tone="neutral">
                              {component.category}
                            </Badge>
                            <Badge variant="outline" size="sm" tone="neutral">
                              {component.complexity}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* HT-007: Enhanced Component Info */}
            {currentComponent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <currentComponent.icon className="w-5 h-5" />
                      {currentComponent.name} Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <div className="font-medium mb-1">Description</div>
                      <div className="text-muted-foreground">{currentComponent.description}</div>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium mb-1">HT-007 Features</div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        Mono-theme integration
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        Motion effects
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium mb-1">Props Available</div>
                      <div className="text-muted-foreground">
                        {Object.keys(currentComponent.props).length} properties
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium mb-1">Type Safety</div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        TypeScript supported
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* HT-007: Preview Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="w-5 h-5" />
                    Preview Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <div className="font-medium mb-2">Device Preview</div>
                    <div className="flex gap-2">
                      <Button
                        variant={previewMode === 'desktop' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setPreviewMode('desktop')}
                        icon={<Monitor className="w-4 h-4" />}
                      >
                        Desktop
                      </Button>
                      <Button
                        variant={previewMode === 'tablet' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setPreviewMode('tablet')}
                        icon={<Tablet className="w-4 h-4" />}
                      >
                        Tablet
                      </Button>
                      <Button
                        variant={previewMode === 'mobile' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setPreviewMode('mobile')}
                        icon={<Smartphone className="w-4 h-4" />}
                      >
                        Mobile
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium mb-2">Actions</div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        icon={isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                      >
                        {isFullscreen ? 'Exit' : 'Fullscreen'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open('/sandbox/elements', '_blank')}
                        icon={<Share2 className="w-4 h-4" />}
                      >
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* HT-007: Enhanced Main Content */}
          <motion.div 
            className="lg:col-span-3"
            variants={fadeInUp}
          >
            {currentComponent && (
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {/* HT-007: Enhanced Props Editor */}
                <motion.div variants={scaleIn}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        HT-007 Props Configuration
                      </CardTitle>
                      <CardDescription>
                        Customize the {currentComponent.name.toLowerCase()} component with HT-007 mono-theme properties
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {renderPropEditor()}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* HT-007: Enhanced Live Preview with Device Controls */}
                <motion.div variants={scaleIn}>
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Eye className="w-5 h-5" />
                            HT-007 Live Preview
                          </CardTitle>
                          <CardDescription>
                            See your component with current HT-007 configuration
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="soft" tone="brand">
                            {previewMode}
                          </Badge>
                          <span className="mono-text-xs mono-text-secondary">HT-007 active</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div 
                        className={`border border-border rounded-lg p-6 bg-muted/20 transition-all duration-300 ${
                          isFullscreen ? 'fixed inset-4 z-50 bg-background' : ''
                        }`}
                        style={previewMode !== 'desktop' ? getPreviewDimensions() : {}}
                      >
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {renderComponentPreview()}
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* HT-007: Enhanced Generated Code */}
                {generatedCode && (
                  <motion.div 
                    variants={scaleIn}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Code className="w-5 h-5" />
                              HT-007 Generated Code
                            </CardTitle>
                            <CardDescription>
                              Copy this HT-007 mono-theme code to use in your project
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={copyCode}
                              icon={copiedCode ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            >
                              {copiedCode ? 'Copied!' : 'Copy'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={downloadCode}
                              icon={<Download className="w-4 h-4" />}
                            >
                              Download
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={saveConfiguration}
                              icon={<Save className="w-4 h-4" />}
                            >
                              Save Config
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="relative">
                          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                            <code>{generatedCode}</code>
                          </pre>
                          <div className="absolute top-2 right-2">
                            <Badge variant="soft" tone="brand" size="sm">
                              HT-007
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* HT-007: Enhanced Usage Guide */}
                <motion.div variants={scaleIn}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        HT-007 Usage Guide
                      </CardTitle>
                      <CardDescription>
                        How to implement this component with HT-007 mono-theme system
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <h4 className="font-medium">1. Import the Component</h4>
                        <div className="bg-muted p-3 rounded text-sm font-mono">
                          <code>{`import { ${currentComponent.name} } from '@/components-sandbox/ui'`}</code>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium">2. Use with HT-007 Mono-Theme</h4>
                        <div className="bg-muted p-3 rounded text-sm font-mono">
                          <code>{`<${currentComponent.name} variant="primary" size="md" tone="brand">Content</${currentComponent.name}>`}</code>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium">3. HT-007 Available Props</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {Object.entries(currentComponent.props).map(([propName, propDef]) => (
                            <div key={propName} className="p-2 bg-muted rounded text-sm">
                              <div className="font-medium">{propName}</div>
                              <div className="text-xs text-muted-foreground">
                                {propDef.type} • Default: {typeof propDef.default === 'string' ? `"${propDef.default}"` : propDef.default.toString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium">4. HT-007 Integration</h4>
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                          <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                            🎨 HT-007 Mono-Theme Features
                          </h5>
                          <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                            <li>• Sophisticated grayscale color palette</li>
                            <li>• High-tech motion effects and animations</li>
                            <li>• Production-quality layouts and spacing</li>
                            <li>• Enhanced accessibility and responsive design</li>
                            <li>• Seamless integration with HT-006 token system</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* HT-007: Enhanced Best Practices */}
        <motion.div 
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                HT-007 Best Practices
              </CardTitle>
              <CardDescription>
                Guidelines for effective HT-007 mono-theme component usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-green-600 dark:text-green-400">✅ HT-007 Do's</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Use HT-007 mono-theme semantic prop values</li>
                    <li>• Test components across different screen sizes</li>
                    <li>• Leverage HT-007 motion effects for engagement</li>
                    <li>• Provide meaningful labels and accessibility attributes</li>
                    <li>• Use consistent HT-007 spacing and typography</li>
                    <li>• Save configurations for reuse and sharing</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-red-600 dark:text-red-400">❌ HT-007 Don'ts</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Override HT-007 mono-theme with custom colors</li>
                    <li>• Use components outside their intended purpose</li>
                    <li>• Skip accessibility testing with HT-007 features</li>
                    <li>• Ignore loading and error states</li>
                    <li>• Mix HT-007 with non-HT-007 styling approaches</li>
                    <li>• Forget to test motion effects on reduced motion</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  🚀 HT-007 Pro Tips
                </h4>
                <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  <li>• Use the device preview to test responsive behavior</li>
                  <li>• Save configurations to build a component library</li>
                  <li>• Leverage fullscreen mode for detailed component inspection</li>
                  <li>• Share configurations with team members for consistency</li>
                  <li>• Test motion effects with reduced motion preferences</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}