'use client'

/**
 * Typography Demo Route
 * 
 * Comprehensive typography demonstration showcasing Apple/Linear-grade type system.
 * Demonstrates headings, body text, measure, leading, and tracking in desktop/mobile.
 * 
 * Universal Header: @app/design/type/page
 */

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Moon, Sun, Ruler } from 'lucide-react';
import { useState } from 'react';

const sampleText = "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet and serves as an excellent test for typography systems.";
const longSampleText = "Design systems are the backbone of consistent user experiences across digital products. They provide a shared language between designers and developers, ensuring that every interface element follows established patterns and principles. A well-crafted typography system forms the foundation of readable, accessible, and aesthetically pleasing content that guides users through their journey.";

export default function TypographyPage() {
  const { theme, setTheme } = useTheme();
  const [showMeasure, setShowMeasure] = useState(false);
  const [currentMeasure, setCurrentMeasure] = useState<'narrow' | 'base' | 'wide'>('base');

  const headingStyles = [
    { class: 'text-display-2xl', name: 'Display 2XL', usage: 'Hero sections, major page titles' },
    { class: 'text-display-xl', name: 'Display XL', usage: 'Large section headers' },
    { class: 'text-display-lg', name: 'Display LG', usage: 'Page titles, major headings' },
    { class: 'text-h1', name: 'Heading 1', usage: 'Primary section titles' },
    { class: 'text-h2', name: 'Heading 2', usage: 'Secondary section titles' },
    { class: 'text-h3', name: 'Heading 3', usage: 'Subsection headings' },
    { class: 'text-h4', name: 'Heading 4', usage: 'Component titles' },
    { class: 'text-h5', name: 'Heading 5', usage: 'Small section headers' },
    { class: 'text-h6', name: 'Heading 6', usage: 'Minor headings, labels' },
  ];

  const bodyStyles = [
    { class: 'text-body-lg', name: 'Body Large', usage: 'Lead paragraphs, introductions' },
    { class: 'text-body', name: 'Body', usage: 'Standard content, default text' },
    { class: 'text-body-sm', name: 'Body Small', usage: 'Secondary content, metadata' },
    { class: 'text-caption', name: 'Caption', usage: 'Image captions, helper text' },
    { class: 'text-caption-sm', name: 'Caption Small', usage: 'Fine print, timestamps' },
    { class: 'text-label', name: 'Label', usage: 'Form labels, UI text' },
  ];

  const measureClasses = {
    narrow: 'measure-narrow',
    base: 'measure',
    wide: 'measure-wide'
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-display-lg mb-2">Typography System</h1>
            <p className="text-caption">
              Apple/Linear-grade typography with proper hierarchy, rhythm, and readability
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={showMeasure ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowMeasure(!showMeasure)}
            >
              <Ruler className="h-4 w-4" />
              {showMeasure ? 'Hide' : 'Show'} Measure
            </Button>
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
          </div>
        </div>

        <Tabs defaultValue="scale" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="scale">Type Scale</TabsTrigger>
            <TabsTrigger value="body">Body Text</TabsTrigger>
            <TabsTrigger value="rhythm">Rhythm</TabsTrigger>
            <TabsTrigger value="measure">Measure</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>

          {/* Type Scale */}
          <TabsContent value="scale" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Display & Heading Scale</CardTitle>
                <CardDescription>Crisp, hierarchical headings with optimal contrast and spacing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {headingStyles.map(({ class: className, name, usage }) => (
                  <div key={className} className="border-b border-border pb-6 last:border-b-0">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                      <div className="lg:col-span-2">
                        <div className={`${className} mb-2`}>
                          {name} Typography
                        </div>
                        <div className={`${className} text-muted-foreground mb-4`}>
                          {sampleText}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline">{name}</Badge>
                          <Badge variant="secondary" className="text-xs">.{className}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{usage}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Body Text */}
          <TabsContent value="body" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Body Text & Content</CardTitle>
                <CardDescription>Readable body text with consistent vertical rhythm</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {bodyStyles.map(({ class: className, name, usage }) => (
                  <div key={className} className="border-b border-border pb-6 last:border-b-0">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                      <div className="lg:col-span-2">
                        <div className={`${className} mb-4`}>
                          {longSampleText}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline">{name}</Badge>
                          <Badge variant="secondary" className="text-xs">.{className}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{usage}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rhythm */}
          <TabsContent value="rhythm" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vertical Rhythm & Spacing</CardTitle>
                <CardDescription>Consistent line height and spacing creates visual harmony</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Leading Examples */}
                  <div>
                    <h4 className="text-h4 mb-4">Line Height (Leading)</h4>
                    <div className="space-y-6">
                      {[
                        { class: 'leading-tight', name: 'Tight (1.25)', usage: 'Headings, compact text' },
                        { class: 'leading-snug', name: 'Snug (1.375)', usage: 'Subheadings' },
                        { class: 'leading-normal', name: 'Normal (1.5)', usage: 'Body text default' },
                        { class: 'leading-relaxed', name: 'Relaxed (1.625)', usage: 'Comfortable reading' },
                      ].map(({ class: leadingClass, name, usage }) => (
                        <div key={leadingClass} className="space-y-2">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">.{leadingClass}</Badge>
                            <span className="text-xs text-muted-foreground">{name}</span>
                          </div>
                          <div className={`text-body ${leadingClass} border-l-2 border-border pl-4`}>
                            This is sample text showing how different line heights affect readability and visual density. Notice how the spacing between lines changes. {usage}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tracking Examples */}
                  <div>
                    <h4 className="text-h4 mb-4">Letter Spacing (Tracking)</h4>
                    <div className="space-y-6">
                      {[
                        { class: 'tracking-tighter', name: 'Tighter (-0.05em)', usage: 'Display text' },
                        { class: 'tracking-tight', name: 'Tight (-0.025em)', usage: 'Headlines' },
                        { class: 'tracking-normal', name: 'Normal (0em)', usage: 'Body text' },
                        { class: 'tracking-wide', name: 'Wide (0.025em)', usage: 'Small caps, labels' },
                      ].map(({ class: trackingClass, name, usage }) => (
                        <div key={trackingClass} className="space-y-2">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">.{trackingClass}</Badge>
                            <span className="text-xs text-muted-foreground">{name}</span>
                          </div>
                          <div className={`text-body ${trackingClass} border-l-2 border-border pl-4`}>
                            LETTER SPACING DEMONSTRATION
                          </div>
                          <div className={`text-caption ${trackingClass}`}>
                            {usage}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Measure */}
          <TabsContent value="measure" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Content Measure (Line Length)</CardTitle>
                    <CardDescription>Optimal character count per line for readability (45-85 characters)</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {(['narrow', 'base', 'wide'] as const).map((measure) => (
                      <Button
                        key={measure}
                        variant={currentMeasure === measure ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentMeasure(measure)}
                      >
                        {measure === 'base' ? 'Base (65ch)' : `${measure} (${measure === 'narrow' ? '45ch' : '80ch'})`}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-6">
                  {/* Measure Examples */}
                  <div>
                    <h4 className="text-h4 mb-4">Current Measure: {currentMeasure}</h4>
                    <div className={`${measureClasses[currentMeasure]} ${showMeasure ? 'border-2 border-dashed border-accent' : ''} p-4 bg-muted/30 rounded-lg space-y-4`}>
                      <h3 className="text-h3">Optimal Reading Experience</h3>
                      <div className="text-body leading-relaxed space-y-4">
                        <p>
                          The measure is the length of a line of type, typically measured in characters per line (CPL). Research shows that the optimal line length for body text is between 45-85 characters, with 65-75 being ideal for most reading contexts.
                        </p>
                        <p>
                          Lines that are too short cause the eye to jump back too often, breaking the reader&apos;s rhythm. Lines that are too long make it difficult for readers to find the beginning of the next line, especially in longer passages of text.
                        </p>
                        <p>
                          This typography system provides three measure options: narrow (45ch) for sidebars or constrained spaces, base (65ch) for optimal body text, and wide (80ch) for data tables or technical content that benefits from longer lines.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* All Measures Side by Side */}
                  <div>
                    <h4 className="text-h4 mb-4">Measure Comparison</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {(['narrow', 'base', 'wide'] as const).map((measure) => (
                        <div key={measure} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{measure}</Badge>
                            <Badge variant="secondary" className="text-xs">
                              .measure-{measure === 'base' ? '' : measure}
                            </Badge>
                          </div>
                          <div className={`${measureClasses[measure]} p-4 bg-muted/20 rounded border text-body-sm leading-relaxed`}>
                            <h5 className="text-h5 mb-2">{measure.charAt(0).toUpperCase() + measure.slice(1)} Measure</h5>
                            <p>
                              Typography systems enable consistent, scalable design across all touchpoints. They establish hierarchy, improve readability, and create visual harmony that guides users through content efficiently and elegantly.
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Examples */}
          <TabsContent value="examples" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Real-World Examples</CardTitle>
                <CardDescription>Typography in action across different content types</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Article Example */}
                <div>
                  <h4 className="text-h4 mb-4">Article Layout</h4>
                  <div className="prose bg-muted/20 p-6 rounded-lg">
                    <h1>The Future of Design Systems</h1>
                    <p className="text-body-lg">
                      Design systems have evolved from simple style guides to comprehensive ecosystems that power entire digital experiences.
                    </p>
                    <h2>Building for Scale</h2>
                    <p>
                      Modern design systems must balance flexibility with consistency, allowing teams to move quickly while maintaining brand coherence across all touchpoints.
                    </p>
                    <h3>Typography as Foundation</h3>
                    <p>
                      A robust typography system forms the backbone of any successful design system, providing clear hierarchy and excellent readability across all devices and contexts.
                    </p>
                    <ul>
                      <li>Consistent type scale with proper modular increments</li>
                      <li>Optimal line length for comfortable reading</li>
                      <li>Appropriate contrast ratios for accessibility</li>
                    </ul>
                    <blockquote>
                      &ldquo;Typography is the craft of endowing human language with a durable visual form.&rdquo; — Robert Bringhurst
                    </blockquote>
                  </div>
                </div>

                {/* Form Example */}
                <div>
                  <h4 className="text-h4 mb-4">Form Layout</h4>
                  <div className="bg-muted/20 p-6 rounded-lg max-w-md">
                    <h3 className="text-h3 mb-4">Create Account</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-label mb-1 block">Full Name</label>
                        <div className="h-10 bg-background border rounded px-3 flex items-center">
                          <span className="text-body text-muted-foreground">Enter your full name</span>
                        </div>
                        <p className="text-caption mt-1">This will be displayed on your profile</p>
                      </div>
                      <div>
                        <label className="text-label mb-1 block">Email Address</label>
                        <div className="h-10 bg-background border rounded px-3 flex items-center">
                          <span className="text-body text-muted-foreground">your@email.com</span>
                        </div>
                      </div>
                      <Button className="w-full">Create Account</Button>
                      <p className="text-caption-sm text-center">
                        By signing up, you agree to our terms of service
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Grid Example */}
                <div>
                  <h4 className="text-h4 mb-4">Card Grid Layout</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i}>
                        <CardHeader>
                          <CardTitle>Typography System {i}</CardTitle>
                          <CardDescription>Consistent hierarchy and spacing</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-body-sm text-muted-foreground mb-4">
                            Each card maintains the same typographic rhythm and spacing, creating visual harmony across the interface.
                          </p>
                          <div className="flex gap-2">
                            <Badge variant="outline">Design</Badge>
                            <Badge variant="outline">System</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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