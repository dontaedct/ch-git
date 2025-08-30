'use client'

/**
 * Design Tokens Preview Route
 * 
 * Main route for previewing design tokens at /design/tokens as requested.
 * Comprehensive demonstration of brandless token system with motion demos.
 * 
 * Universal Header: @app/design/tokens/page
 */

import { useTokens, useSemanticColors } from '@/lib/design-tokens/provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor, Play, Pause } from 'lucide-react';
import { useState } from 'react';

export default function DesignTokensPage() {
  const { tokens } = useTokens();
  const semanticColors = useSemanticColors();
  const { theme, setTheme } = useTheme();
  const [motionDemo, setMotionDemo] = useState<'paused' | 'running'>('paused');

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Design Tokens</h1>
            <p className="text-muted-foreground">
              Comprehensive brandless token system with neutral base + single accent slot
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('light')}
            >
              <Sun className="h-4 w-4" />
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('dark')}
            >
              <Moon className="h-4 w-4" />
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('system')}
            >
              <Monitor className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="colors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="spacing">Spacing</TabsTrigger>
            <TabsTrigger value="shadows">Shadows</TabsTrigger>
            <TabsTrigger value="motion">Motion</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
          </TabsList>

          {/* Colors Tab */}
          <TabsContent value="colors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Semantic Colors</CardTitle>
                <CardDescription>Theme-aware semantic colors that adapt automatically</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries(semanticColors).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <div 
                        className="w-full h-16 rounded-lg border relative group cursor-pointer"
                        style={{ backgroundColor: value }}
                      >
                        <div className="absolute inset-0 bg-black/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <span className="text-xs font-mono text-white bg-black/50 px-2 py-1 rounded">
                            {key}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{key}</p>
                        <p className="text-xs text-muted-foreground font-mono">{value}</p>
                        <p className="text-xs text-muted-foreground">var(--color-{key.replace(/([A-Z])/g, '-$1').toLowerCase()})</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Neutral Scale</CardTitle>
                  <CardDescription>Brandless neutral palette (dark-on-dark safe)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-6 gap-2">
                    {Object.entries(tokens.neutral).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <div 
                          className="w-full h-12 rounded border group cursor-pointer relative"
                          style={{ backgroundColor: value }}
                        >
                          <div className="absolute inset-0 bg-white/20 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                            <span className="text-xs font-bold">{key}</span>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-medium">{key}</p>
                          <p className="text-xs text-muted-foreground font-mono">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Accent Scale</CardTitle>
                  <CardDescription>Single configurable accent color slot</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-6 gap-2">
                    {Object.entries(tokens.accent).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <div 
                          className="w-full h-12 rounded border group cursor-pointer relative"
                          style={{ backgroundColor: value }}
                        >
                          <div className="absolute inset-0 bg-white/20 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{key}</span>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-medium">{key}</p>
                          <p className="text-xs text-muted-foreground font-mono">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Typography Tab */}
          <TabsContent value="typography" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Type Scale</CardTitle>
                <CardDescription>Consistent typography scale from design tokens</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(tokens.typography.fontSize).map(([key, value]) => (
                  <div key={key} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-baseline justify-between mb-2">
                      <div style={{ fontSize: value, lineHeight: '1.2' }} className="text-foreground">
                        The quick brown fox jumps over the lazy dog
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{key}</Badge>
                        <Badge variant="outline">{value}</Badge>
                        <Badge variant="outline">--font-size-{key}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      CSS: <code>font-size: var(--font-size-{key})</code> | 
                      Tailwind: <code>text-token-{key}</code>
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Font Weights</CardTitle>
                <CardDescription>Available font weight tokens</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(tokens.typography.fontWeight).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                    <div style={{ fontWeight: value }} className="text-lg text-foreground">
                      Design tokens make theming consistent and brandless
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{key}</Badge>
                      <Badge variant="outline">{value}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Spacing Tab */}
          <TabsContent value="spacing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Spacing Scale</CardTitle>
                <CardDescription>Consistent spacing tokens for layout and components</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(tokens.spacing).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-6">
                      <div className="w-16 text-sm font-mono font-medium">{key}</div>
                      <div 
                        className="bg-accent-scale-200 border border-accent-scale-300 rounded"
                        style={{ width: value, height: '1.5rem' }}
                      />
                      <div className="text-sm text-muted-foreground font-mono">{value}</div>
                      <div className="text-xs text-muted-foreground">
                        <code>var(--spacing-{key})</code> | <code>p-token-{key}</code>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Border Radius</CardTitle>
                <CardDescription>Available border radius tokens</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {Object.entries(tokens.borderRadius).map(([key, value]) => (
                    <div key={key} className="text-center space-y-3">
                      <div 
                        className="w-20 h-20 mx-auto bg-accent-scale-100 border-2 border-accent-scale-300 flex items-center justify-center"
                        style={{ borderRadius: value }}
                      >
                        <span className="text-xs font-medium text-accent-scale-700">{key}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{key}</p>
                        <p className="text-xs text-muted-foreground font-mono">{value}</p>
                        <p className="text-xs text-muted-foreground">rounded-token-{key}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shadows Tab */}
          <TabsContent value="shadows" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shadow Scale</CardTitle>
                <CardDescription>Consistent shadow tokens for depth and elevation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(tokens.shadows).map(([key, value]) => (
                    <div key={key} className="text-center space-y-3">
                      <div 
                        className="w-24 h-24 mx-auto bg-background border rounded-lg flex items-center justify-center"
                        style={{ boxShadow: value }}
                      >
                        <span className="text-sm font-medium text-muted-foreground">{key}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">shadow-{key}</p>
                        <p className="text-xs text-muted-foreground font-mono break-all">
                          {value}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <code>var(--shadow-{key})</code>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Motion Tab */}
          <TabsContent value="motion" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Motion & Animation</CardTitle>
                    <CardDescription>Duration and easing tokens for consistent motion</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMotionDemo(motionDemo === 'paused' ? 'running' : 'paused')}
                  >
                    {motionDemo === 'paused' ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    {motionDemo === 'paused' ? 'Play' : 'Pause'} Demo
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Duration Tokens</h4>
                    <div className="space-y-3">
                      {[
                        { key: '75', value: '75ms', usage: 'Micro-interactions' },
                        { key: '100', value: '100ms', usage: 'Simple transitions' },
                        { key: '150', value: '150ms', usage: 'Quick feedback' },
                        { key: '200', value: '200ms', usage: 'Standard transitions' },
                        { key: '300', value: '300ms', usage: 'Complex animations' },
                        { key: '500', value: '500ms', usage: 'Dramatic effects' },
                      ].map(({ key, value, usage }) => (
                        <div key={key} className="flex items-center justify-between border rounded-lg p-3">
                          <div>
                            <p className="text-sm font-medium">--motion-duration-{key}</p>
                            <p className="text-xs text-muted-foreground">{usage}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-mono">{value}</p>
                            <div 
                              className={`w-12 h-2 bg-accent-scale-400 rounded-full ${
                                motionDemo === 'running' ? 'animate-pulse' : ''
                              }`}
                              style={{ 
                                animationDuration: motionDemo === 'running' ? value : undefined
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-3">Easing Functions</h4>
                    <div className="space-y-3">
                      {[
                        { key: 'linear', value: 'linear', usage: 'Consistent speed' },
                        { key: 'ease-in', value: 'ease-in', usage: 'Slow start' },
                        { key: 'ease-out', value: 'ease-out', usage: 'Slow end' },
                        { key: 'ease-in-out', value: 'ease-in-out', usage: 'Smooth both ends' },
                        { key: 'bounce', value: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)', usage: 'Playful bounce' },
                        { key: 'smooth', value: 'cubic-bezier(0.4, 0, 0.2, 1)', usage: 'Natural feel' },
                      ].map(({ key, value, usage }) => (
                        <div key={key} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium">--motion-ease-{key}</p>
                            <p className="text-xs text-muted-foreground">{usage}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-mono text-muted-foreground flex-1">{value}</p>
                            <div 
                              className={`w-4 h-4 bg-accent-scale-500 rounded-full transition-transform duration-300 ${
                                motionDemo === 'running' ? 'translate-x-8' : 'translate-x-0'
                              }`}
                              style={{ 
                                transitionTimingFunction: value
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Motion Demo</h4>
                  <div className="border rounded-lg p-6 bg-muted/30">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-2">Fade In</p>
                        <div 
                          className={`w-16 h-16 mx-auto bg-accent-scale-500 rounded-lg transition-opacity duration-300 ${
                            motionDemo === 'running' ? 'opacity-100' : 'opacity-30'
                          }`}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-2">Scale & Rotate</p>
                        <div 
                          className={`w-16 h-16 mx-auto bg-accent-scale-600 rounded-lg transition-transform duration-500 ease-in-out ${
                            motionDemo === 'running' ? 'scale-110 rotate-12' : 'scale-100 rotate-0'
                          }`}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-2">Slide Up</p>
                        <div 
                          className={`w-16 h-16 mx-auto bg-accent-scale-700 rounded-lg transition-transform duration-200 ${
                            motionDemo === 'running' ? 'translate-y-0' : 'translate-y-4'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Examples</CardTitle>
                <CardDescription>How to use design tokens in your components</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">1. Tailwind CSS Classes (Recommended)</h4>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`<div className="bg-primary text-primary-foreground p-token-md rounded-token-lg">
  Semantic colors with token spacing and radius
</div>

<button className="bg-accent-scale-500 text-white px-token-lg py-token-sm 
                   rounded-token-md shadow-token-md transition-all 
                   duration-[--motion-duration-200] ease-[--motion-ease-smooth]">
  Accent button with motion tokens
</button>`}
                  </pre>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium">2. CSS Custom Properties</h4>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`<div style={{ 
  backgroundColor: 'var(--color-primary)',
  color: 'var(--color-primary-foreground)',
  padding: 'var(--spacing-md)',
  borderRadius: 'var(--border-radius-lg)',
  boxShadow: 'var(--shadow-md)',
  transition: 'all var(--motion-duration-200) var(--motion-ease-smooth)'
}}>
  Direct CSS variable usage
</div>`}
                  </pre>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium">3. React Hooks</h4>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`const { tokens } = useTokens();
const semanticColors = useSemanticColors();

return (
  <div style={{ 
    color: semanticColors.primary,
    padding: tokens.spacing.md,
    borderRadius: tokens.borderRadius.lg,
    fontSize: tokens.typography.fontSize.lg
  }}>
    Programmatic token access
  </div>
);`}
                  </pre>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium">4. Component Token Examples</h4>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`{/* Button with component tokens */}
<button className="h-[var(--button-height-md)] 
                   text-[var(--button-font-size-md)]
                   px-[var(--spacing-lg)]
                   rounded-[var(--button-border-radius)]">
  Component-specific tokens
</button>

{/* Card with component tokens */}
<div className="p-[var(--card-padding)] 
                rounded-[var(--card-border-radius)]
                shadow-[var(--card-shadow)]
                border-[var(--card-border-width)]">
  Token-styled card
</div>`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Live Examples</CardTitle>
                <CardDescription>See tokens in action with real components</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-3">Buttons</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button>Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Destructive</Button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Badges</h4>
                  <div className="flex flex-wrap gap-3">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Cards</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Token-styled Card</CardTitle>
                        <CardDescription>Using design tokens for consistency</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">
                          All spacing, colors, and borders use design tokens.
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Another Example</CardTitle>
                        <CardDescription>Same tokens = consistent look</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">
                          Perfect alignment and spacing across all cards.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}