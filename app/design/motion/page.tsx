'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { ChipGroup } from '@/components/ui/chip-group'
import { Stepper } from '@/components/ui/stepper'
import { TabsUnderline, TabsUnderlineList, TabsUnderlineTrigger, TabsUnderlineContent } from '@/components/ui/tabs-underline'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
interface MotionDemoProps {}

const MotionDemo: React.FC<MotionDemoProps> = () => {
  const [reducedMotion, setReducedMotion] = React.useState(false)
  const [selectedChips, setSelectedChips] = React.useState<string[]>(['option1'])
  const [currentStep, setCurrentStep] = React.useState(0)
  const [activeTab, setActiveTab] = React.useState('buttons')

  // Apply reduced motion preference
  React.useEffect(() => {
    if (reducedMotion) {
      document.documentElement.classList.add('no-motion')
    } else {
      document.documentElement.classList.remove('no-motion')
    }
    
    return () => {
      document.documentElement.classList.remove('no-motion')
    }
  }, [reducedMotion])

  const chipOptions = [
    { id: 'option1', label: 'Design', value: 'option1' },
    { id: 'option2', label: 'Development', value: 'option2' },
    { id: 'option3', label: 'Marketing', value: 'option3' },
    { id: 'option4', label: 'Research', value: 'option4' },
  ]

  const getStepStatus = (stepIndex: number): 'complete' | 'current' | 'upcoming' => {
    if (currentStep > stepIndex) return 'complete'
    if (currentStep === stepIndex) return 'current'
    return 'upcoming'
  }

  const stepperSteps = [
    { id: 'step1', label: 'Setup', description: 'Initial configuration', status: getStepStatus(0) },
    { id: 'step2', label: 'Configure', description: 'Set preferences', status: getStepStatus(1) },
    { id: 'step3', label: 'Review', description: 'Check settings', status: getStepStatus(2) },
    { id: 'step4', label: 'Deploy', description: 'Launch application', status: getStepStatus(3) },
  ]

  const handleStepperNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, stepperSteps.length - 1))
  }

  const handleStepperPrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const handleStepperReset = () => {
    setCurrentStep(0)
  }

  return (
    <div className="container-page section">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-display-lg mb-4">Motion & Micro-Interactions</h1>
          <p className="text-body-lg text-muted-foreground mb-6">
            Subtle, fast, and purposeful motion system with 150–200ms durations and cubic-bezier(0.2, 0.8, 0.2, 1) easing.
            Zero bounce animations that respect prefers-reduced-motion preferences.
          </p>
          
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
            <label htmlFor="reduced-motion" className="text-sm font-medium">
              Reduced Motion
            </label>
            <Switch
              id="reduced-motion"
              checked={reducedMotion}
              onCheckedChange={setReducedMotion}
            />
            <p className="text-xs text-muted-foreground">
              Toggle to test accessibility compliance
            </p>
          </div>
        </div>

        <TabsUnderline value={activeTab} onValueChange={setActiveTab}>
          <TabsUnderlineList className="mb-8">
            <TabsUnderlineTrigger value="buttons">Buttons</TabsUnderlineTrigger>
            <TabsUnderlineTrigger value="chips">Chips</TabsUnderlineTrigger>
            <TabsUnderlineTrigger value="steppers">Steppers</TabsUnderlineTrigger>
            <TabsUnderlineTrigger value="animations">Animations</TabsUnderlineTrigger>
          </TabsUnderlineList>

          <TabsUnderlineContent value="buttons">
            <div className="space-y-8">
              <div>
                <h2 className="text-h2 mb-4">Button Interactions</h2>
                <p className="text-body text-muted-foreground mb-6">
                  Hover effects with subtle lift (translateY(-1px)) and shadow enhancement.
                  Press effects with immediate feedback and spring easing.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="p-6">
                    <h3 className="text-h4 mb-4">Solid Buttons</h3>
                    <div className="space-y-3">
                      <Button variant="solid" size="sm">Small Button</Button>
                      <Button variant="solid" size="default">Default Button</Button>
                      <Button variant="solid" size="lg">Large Button</Button>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-h4 mb-4">Ghost Buttons</h3>
                    <div className="space-y-3">
                      <Button variant="ghost" size="sm">Small Ghost</Button>
                      <Button variant="ghost" size="default">Default Ghost</Button>
                      <Button variant="ghost" size="lg">Large Ghost</Button>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-h4 mb-4">Outline Buttons</h3>
                    <div className="space-y-3">
                      <Button variant="outline" size="sm">Small Outline</Button>
                      <Button variant="outline" size="default">Default Outline</Button>
                      <Button variant="outline" size="lg">Large Outline</Button>
                    </div>
                  </Card>
                </div>
              </div>

              <div>
                <h3 className="text-h3 mb-4">Interactive States</h3>
                <div className="flex flex-wrap gap-4">
                  <Button variant="solid">Hover Me</Button>
                  <Button variant="outline">Focus Me (Tab)</Button>
                  <Button variant="ghost">Click Me</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="solid" disabled>Disabled</Button>
                </div>
              </div>
            </div>
          </TabsUnderlineContent>

          <TabsUnderlineContent value="chips">
            <div className="space-y-8">
              <div>
                <h2 className="text-h2 mb-4">Chip Interactions</h2>
                <p className="text-body text-muted-foreground mb-6">
                  Selection animations with scale effects (1.02 on hover) and smooth state transitions.
                  Multiple selection support with visual feedback.
                </p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="text-h4 mb-4">Single Selection</h3>
                    <ChipGroup
                      options={chipOptions}
                      value={selectedChips[0] || ''}
                      onValueChange={(value) => setSelectedChips(typeof value === 'string' ? [value] : [])}
                      multiple={false}
                    />
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-h4 mb-4">Multiple Selection</h3>
                    <ChipGroup
                      options={chipOptions}
                      value={selectedChips}
                      onValueChange={(value) => setSelectedChips(Array.isArray(value) ? value : [value])}
                      multiple={true}
                    />
                  </Card>
                </div>
              </div>

              <div>
                <h3 className="text-h3 mb-4">Custom Chips</h3>
                <ChipGroup
                  options={chipOptions}
                  value={selectedChips}
                  onValueChange={(value) => setSelectedChips(Array.isArray(value) ? value : [value])}
                  multiple={true}
                  allowCustom={true}
                  customPlaceholder="Add skill..."
                />
              </div>
            </div>
          </TabsUnderlineContent>

          <TabsUnderlineContent value="steppers">
            <div className="space-y-8">
              <div>
                <h2 className="text-h2 mb-4">Stepper Interactions</h2>
                <p className="text-body text-muted-foreground mb-6">
                  Step advance/retreat with scale animations and ring indicators.
                  Smooth progress transitions with spring easing.
                </p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="p-6">
                    <h3 className="text-h4 mb-4">Horizontal Stepper</h3>
                    <Stepper
                      steps={stepperSteps}
                      orientation="horizontal"
                      showLabels={true}
                      className="mb-6"
                    />
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleStepperPrev}
                        disabled={currentStep === 0}
                      >
                        Previous
                      </Button>
                      <Button 
                        variant="solid" 
                        size="sm" 
                        onClick={handleStepperNext}
                        disabled={currentStep === stepperSteps.length - 1}
                      >
                        Next
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleStepperReset}
                      >
                        Reset
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-h4 mb-4">Vertical Stepper</h3>
                    <div className="max-w-md">
                      <Stepper
                        steps={stepperSteps}
                        orientation="vertical"
                        showLabels={true}
                        className="mb-6"
                      />
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </TabsUnderlineContent>

          <TabsUnderlineContent value="animations">
            <div className="space-y-8">
              <div>
                <h2 className="text-h2 mb-4">Animation Examples</h2>
                <p className="text-body text-muted-foreground mb-6">
                  Keyframe animations for common UI patterns. All animations respect reduced-motion preferences.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="p-6">
                    <h3 className="text-h4 mb-4">Entrance Animations</h3>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge className="animate-fadeIn">Fade In</Badge>
                        <Badge className="animate-slideInFromTop">Slide Top</Badge>
                        <Badge className="animate-slideInFromLeft">Slide Left</Badge>
                        <Badge className="animate-scaleIn">Scale In</Badge>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-h4 mb-4">Attention Animations</h3>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge className="animate-pulse">Pulse</Badge>
                        <Badge className="animate-bounce">Bounce</Badge>
                        <Badge className="animate-wiggle">Wiggle</Badge>
                        <Badge className="animate-ping">Ping</Badge>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-h4 mb-4">Loading States</h3>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge className="animate-spin">Spin</Badge>
                        <Badge className="animate-shimmer bg-gradient-to-r from-muted via-muted-foreground/20 to-muted bg-size-200">
                          Shimmer
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-h3 mb-4">Motion Guidelines</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h4 className="text-h4 mb-3">Duration Tokens</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Instant:</span>
                        <code className="bg-muted px-2 py-1 rounded">75ms</code>
                      </div>
                      <div className="flex justify-between">
                        <span>Fast:</span>
                        <code className="bg-muted px-2 py-1 rounded">150ms</code>
                      </div>
                      <div className="flex justify-between">
                        <span>Normal:</span>
                        <code className="bg-muted px-2 py-1 rounded">200ms</code>
                      </div>
                      <div className="flex justify-between">
                        <span>Slow:</span>
                        <code className="bg-muted px-2 py-1 rounded">300ms</code>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h4 className="text-h4 mb-3">Easing Curves</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Spring:</span>
                        <code className="bg-muted px-2 py-1 rounded text-xs">cubic-bezier(0.2, 0.8, 0.2, 1)</code>
                      </div>
                      <div className="flex justify-between">
                        <span>Smooth:</span>
                        <code className="bg-muted px-2 py-1 rounded text-xs">cubic-bezier(0.4, 0, 0.2, 1)</code>
                      </div>
                      <div className="flex justify-between">
                        <span>Bounce:</span>
                        <code className="bg-muted px-2 py-1 rounded text-xs">cubic-bezier(0.68, -0.6, 0.32, 1.6)</code>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3">
                  <div className="text-amber-600 dark:text-amber-400 mt-0.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">Accessibility Notice</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      All animations respect the <code className="bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded text-xs">prefers-reduced-motion</code> media query.
                      Users who prefer reduced motion will see instant transitions instead of animations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsUnderlineContent>
        </TabsUnderline>
      </div>
    </div>
  )
}

export default MotionDemo