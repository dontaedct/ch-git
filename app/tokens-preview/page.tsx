'use client'

/**
 * Design Tokens Preview Page
 * 
 * Hidden route for previewing design tokens and their usage across
 * different components. Demonstrates brandless theming approach.
 * 
 * Universal Header: @app/tokens-preview/page
 */

import { useTokens, useSemanticColors } from '@/lib/design-tokens/provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor } from 'lucide-react';

export default function TokensPreviewPage() {
  const { tokens } = useTokens();
  const semanticColors = useSemanticColors();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Design Tokens Preview</h1>
            <p className="text-muted-foreground">
              Comprehensive preview of the token-driven theming system
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="spacing">Spacing</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
          </TabsList>

          {/* Colors Tab */}
          <TabsContent value="colors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Semantic Colors</CardTitle>
                <CardDescription>Current theme-aware semantic color values</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries(semanticColors).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <div 
                        className="w-full h-16 rounded-lg border"
                        style={{ backgroundColor: value }}
                      />
                      <div>
                        <p className="text-sm font-medium">{key}</p>
                        <p className="text-xs text-muted-foreground font-mono">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Neutral Scale</CardTitle>
                <CardDescription>Brandless neutral color palette</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 md:grid-cols-11 gap-2">
                  {Object.entries(tokens.neutral).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <div 
                        className="w-full h-12 rounded border"
                        style={{ backgroundColor: value }}
                      />
                      <div className="text-center">
                        <p className="text-xs font-medium">{key}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Accent Scale</CardTitle>
                <CardDescription>Single accent color scale</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 md:grid-cols-11 gap-2">
                  {Object.entries(tokens.accent).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <div 
                        className="w-full h-12 rounded border"
                        style={{ backgroundColor: value }}
                      />
                      <div className="text-center">
                        <p className="text-xs font-medium">{key}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Typography Tab */}
          <TabsContent value="typography" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Font Sizes</CardTitle>
                <CardDescription>Typography scale from design tokens</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(tokens.typography.fontSize).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between border-b pb-2">
                    <div style={{ fontSize: value }}>
                      The quick brown fox jumps over the lazy dog
                    </div>
                    <Badge variant="outline">{key} ({value})</Badge>
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
                  <div key={key} className="flex items-center justify-between border-b pb-2">
                    <div style={{ fontWeight: value }} className="text-lg">
                      Design tokens make theming consistent
                    </div>
                    <Badge variant="outline">{key} ({value})</Badge>
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
                <CardDescription>Consistent spacing tokens</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(tokens.spacing).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-4">
                      <div className="w-20 text-sm font-mono">{key}</div>
                      <div 
                        className="bg-primary/20 border"
                        style={{ width: value, height: '1rem' }}
                      />
                      <div className="text-sm text-muted-foreground font-mono">{value}</div>
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
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                  {Object.entries(tokens.borderRadius).map(([key, value]) => (
                    <div key={key} className="text-center space-y-2">
                      <div 
                        className="w-16 h-16 mx-auto bg-primary/20 border-2 border-primary/40"
                        style={{ borderRadius: value }}
                      />
                      <div>
                        <p className="text-sm font-medium">{key}</p>
                        <p className="text-xs text-muted-foreground font-mono">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Components Tab */}
          <TabsContent value="components" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Buttons</CardTitle>
                <CardDescription>Button variants using design tokens</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button>Primary Button</Button>
                  <Button variant="secondary">Secondary Button</Button>
                  <Button variant="outline">Outline Button</Button>
                  <Button variant="ghost">Ghost Button</Button>
                  <Button variant="destructive">Destructive Button</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm">Small Button</Button>
                  <Button size="default">Default Button</Button>
                  <Button size="lg">Large Button</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Badges & Chips</CardTitle>
                <CardDescription>Chip-like components using design tokens</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cards</CardTitle>
                <CardDescription>Card components using design tokens</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Example Card</CardTitle>
                      <CardDescription>This card uses design tokens for consistent styling</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Card content goes here with proper token-based styling.</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Another Card</CardTitle>
                      <CardDescription>All cards use the same design token values</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Consistent padding, border radius, and colors across all cards.</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>How to Use Tokens</CardTitle>
                <CardDescription>Examples of using design tokens in your components</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">1. Via Tailwind CSS classes:</h4>
                  <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`<div className="bg-primary text-primary-foreground">
  Primary colored element
</div>`}
                  </pre>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">2. Via design token CSS variables:</h4>
                  <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`<div style={{ 
  backgroundColor: 'var(--color-primary)',
  padding: 'var(--spacing-md)'
}}>
  Direct CSS variable usage
</div>`}
                  </pre>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">3. Via React hooks:</h4>
                  <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`const { tokens } = useTokens();
const semanticColors = useSemanticColors();

// Use in component
<div style={{ color: semanticColors.primary }}>
  Themed text
</div>`}
                  </pre>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">4. Component token classes:</h4>
                  <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`<button className="h-[var(--button-height-md)] px-[var(--spacing-md)]">
  Button with token-based sizing
</button>`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Token Mapping</CardTitle>
                <CardDescription>How tokens map to component styles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">Buttons:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Height: <code>--button-height-*</code></li>
                      <li>• Padding: <code>--button-padding-*</code></li>
                      <li>• Border radius: <code>--button-border-radius</code></li>
                      <li>• Font size: <code>--button-font-size-*</code></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Cards:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Border radius: <code>--card-border-radius</code></li>
                      <li>• Padding: <code>--card-padding</code></li>
                      <li>• Shadow: <code>--card-shadow</code></li>
                      <li>• Border: <code>--card-border-width</code></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Chips:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Height: <code>--chip-height</code></li>
                      <li>• Padding: <code>--chip-padding</code></li>
                      <li>• Border radius: <code>--chip-border-radius</code></li>
                      <li>• Font size: <code>--chip-font-size</code></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Tabs:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Height: <code>--tabs-height</code></li>
                      <li>• Border radius: <code>--tabs-border-radius</code></li>
                      <li>• Padding: <code>--tabs-padding</code></li>
                    </ul>
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