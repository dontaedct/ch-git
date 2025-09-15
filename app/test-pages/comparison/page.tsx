/**
 * @fileoverview HT-012.3.1: Visual Comparison Dashboard
 * @module app/test-pages/comparison/page
 * @author OSS Hero System
 * @version 1.0.0
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@ui/card';
import { Badge } from '@ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/tabs';
import { ArrowLeft, Star, Zap, Smartphone, Eye, CheckCircle, Grid, Table, Menu } from 'lucide-react';
import Link from 'next/link';
import { StyleSwitcher, StylePreview } from '@/components/test-pages/StyleSwitcher';
import { ComparisonMatrix, MetricScore } from '@/components/test-pages/ComparisonMatrix';

interface StyleOption {
  id: string;
  name: string;
  description: string;
  route: string;
  preview: string;
  metrics: StyleMetrics;
  pros: string[];
  cons: string[];
}

interface StyleMetrics {
  loadTime: number;
  visualAppeal: number;
  brandAlignment: number;
  mobileExperience: number;
  accessibility: number;
  modernFeel: number;
  professionalAppearance: number;
}

const styles: StyleOption[] = [
  {
    id: 'neon-cyberpunk',
    name: 'Neon Cyberpunk',
    description: 'Electric blues and purples with neon glows and futuristic typography',
    route: '/test-pages/neon-cyberpunk',
    preview: '/api/placeholder/400/300',
    metrics: {
      loadTime: 850,
      visualAppeal: 9,
      brandAlignment: 7,
      mobileExperience: 8,
      accessibility: 7,
      modernFeel: 10,
      professionalAppearance: 6
    },
    pros: ['Highly modern', 'Eye-catching', 'Unique', 'Tech-focused'],
    cons: ['May be too bold', 'Limited business appeal', 'Accessibility concerns']
  },
  {
    id: 'minimalist-glass',
    name: 'Minimalist Glass',
    description: 'Glass morphism with subtle transparency and clean lines',
    route: '/test-pages/minimalist-glass',
    preview: '/api/placeholder/400/300',
    metrics: {
      loadTime: 720,
      visualAppeal: 8,
      brandAlignment: 9,
      mobileExperience: 9,
      accessibility: 9,
      modernFeel: 8,
      professionalAppearance: 9
    },
    pros: ['Clean design', 'Professional', 'Accessible', 'Mobile-friendly'],
    cons: ['Less distinctive', 'May appear generic', 'Limited visual impact']
  },
  {
    id: 'gradient-futurism',
    name: 'Gradient Futurism',
    description: 'Vibrant gradients with smooth animations and modern shapes',
    route: '/test-pages/gradient-futurism',
    preview: '/api/placeholder/400/300',
    metrics: {
      loadTime: 920,
      visualAppeal: 9,
      brandAlignment: 8,
      mobileExperience: 8,
      accessibility: 8,
      modernFeel: 9,
      professionalAppearance: 7
    },
    pros: ['Modern gradients', 'Smooth animations', 'Visual appeal', 'Contemporary'],
    cons: ['Performance impact', 'May distract', 'Limited contrast']
  },
  {
    id: 'dark-tech-minimalism',
    name: 'Dark Tech Minimalism',
    description: 'Dark theme with subtle accents and clean typography',
    route: '/test-pages/dark-tech-minimalism',
    preview: '/api/placeholder/400/300',
    metrics: {
      loadTime: 680,
      visualAppeal: 8,
      brandAlignment: 9,
      mobileExperience: 8,
      accessibility: 8,
      modernFeel: 8,
      professionalAppearance: 9
    },
    pros: ['Professional', 'Tech-focused', 'Clean', 'Brand aligned'],
    cons: ['Dark theme concerns', 'May feel cold', 'Limited color variety']
  },
  {
    id: 'vibrant-modernism',
    name: 'Vibrant Modernism',
    description: 'Bright colors with playful animations and modern shapes',
    route: '/test-pages/vibrant-modernism',
    preview: '/api/placeholder/400/300',
    metrics: {
      loadTime: 780,
      visualAppeal: 8,
      brandAlignment: 7,
      mobileExperience: 8,
      accessibility: 7,
      modernFeel: 9,
      professionalAppearance: 6
    },
    pros: ['Energetic', 'Playful', 'Modern', 'Engaging'],
    cons: ['May be too playful', 'Business concerns', 'Accessibility issues']
  },
  {
    id: 'premium-luxury',
    name: 'Premium Luxury',
    description: 'Elegant typography with subtle animations and sophisticated colors',
    route: '/test-pages/premium-luxury',
    preview: '/api/placeholder/400/300',
    metrics: {
      loadTime: 750,
      visualAppeal: 9,
      brandAlignment: 8,
      mobileExperience: 9,
      accessibility: 9,
      modernFeel: 7,
      professionalAppearance: 10
    },
    pros: ['Elegant', 'Professional', 'Sophisticated', 'High-end feel'],
    cons: ['May feel expensive', 'Limited modern edge', 'Conservative']
  }
];

const criteria: Array<{
  id: string;
  name: string;
  weight: number;
  description: string;
  icon: React.ReactNode;
}> = [
  { id: 'visualAppeal', name: 'Visual Appeal', weight: 20, description: 'Overall visual appeal and attractiveness', icon: <Eye className="w-4 h-4" /> },
  { id: 'brandAlignment', name: 'Brand Alignment', weight: 25, description: 'How well it aligns with brand identity', icon: <Star className="w-4 h-4" /> },
  { id: 'mobileExperience', name: 'Mobile Experience', weight: 15, description: 'Mobile responsiveness and usability', icon: <Smartphone className="w-4 h-4" /> },
  { id: 'accessibility', name: 'Accessibility', weight: 15, description: 'Accessibility standards compliance', icon: <CheckCircle className="w-4 h-4" /> },
  { id: 'modernFeel', name: 'Modern Feel', weight: 10, description: 'Contemporary design approach', icon: <Zap className="w-4 h-4" /> },
  { id: 'professionalAppearance', name: 'Professional', weight: 15, description: 'Professional appearance and trust', icon: <Star className="w-4 h-4" /> }
];

export default function ComparisonDashboard() {
  const [currentStyle, setCurrentStyle] = useState<string>('neon-cyberpunk');
  const [viewMode, setViewMode] = useState<'grid' | 'matrix' | 'switcher'>('grid');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const calculateOverallScore = (style: StyleOption): number => {
    let totalScore = 0;
    let totalWeight = 0;
    
    criteria.forEach(criterion => {
      const score = style.metrics[criterion.id as keyof StyleMetrics];
      totalScore += score * criterion.weight;
      totalWeight += criterion.weight;
    });
    
    return Math.round(totalScore / totalWeight);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 9) return 'text-green-600 bg-green-50';
    if (score >= 7) return 'text-yellow-600 bg-yellow-50';
    if (score >= 5) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/test-pages">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Test Pages
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Style Comparison Dashboard</h1>
                <p className="text-gray-600 mt-1">Compare and evaluate different design styles for DCT Micro-Apps</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="hidden sm:flex"
              >
                <Grid className="w-4 h-4 mr-1" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'matrix' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('matrix')}
                className="hidden sm:flex"
              >
                <Table className="w-4 h-4 mr-1" />
                Matrix
              </Button>
              <Button
                variant={viewMode === 'switcher' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('switcher')}
                className="hidden sm:flex"
              >
                <Menu className="w-4 h-4 mr-1" />
                Switcher
              </Button>
              
              {/* Mobile dropdown */}
              <div className="sm:hidden">
                <select 
                  value={viewMode} 
                  onChange={(e) => setViewMode(e.target.value as 'grid' | 'matrix' | 'switcher')}
                  className="px-3 py-1 border rounded text-sm"
                >
                  <option value="grid">Grid View</option>
                  <option value="matrix">Matrix View</option>
                  <option value="switcher">Switcher View</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'switcher' ? (
          /* Switcher View */
          <div className="max-w-4xl mx-auto">
            <StyleSwitcher
              styles={styles}
              currentStyle={currentStyle}
              onStyleChange={setCurrentStyle}
              showMetrics={true}
              compact={isMobile}
            />
          </div>
        ) : viewMode === 'matrix' ? (
          /* Matrix View */
          <ComparisonMatrix
            styles={styles}
            criteria={criteria}
            showWeights={!isMobile}
            compact={isMobile}
          />
        ) : (
          /* Grid View */
          <div className="space-y-8">
            {/* Style Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {styles.map((style) => (
                <StylePreview
                  key={style.id}
                  style={style}
                  isActive={currentStyle === style.id}
                  onClick={() => setCurrentStyle(style.id)}
                  showMetrics={true}
                />
              ))}
            </div>

            {/* Detailed Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Comparison</CardTitle>
                <p className="text-sm text-gray-600">In-depth analysis of all design styles</p>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="metrics" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="metrics">Metrics</TabsTrigger>
                    <TabsTrigger value="pros-cons">Pros & Cons</TabsTrigger>
                    <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                    <TabsTrigger value="technical">Technical</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="metrics" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {styles.map((style) => (
                        <div key={style.id} className="space-y-3">
                          <h3 className="font-semibold text-lg">{style.name}</h3>
                          <div className="space-y-2">
                            {criteria.map((criterion) => (
                              <div key={criterion.id} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">{criterion.name}</span>
                                <MetricScore
                                  value={style.metrics[criterion.id as keyof StyleMetrics]}
                                  max={10}
                                  showIcon={false}
                                  size="sm"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="pros-cons" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {styles.map((style) => (
                        <div key={style.id} className="space-y-3">
                          <h3 className="font-semibold text-lg">{style.name}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-green-700 mb-2">Pros</h4>
                              <ul className="space-y-1">
                                {style.pros.map((pro, index) => (
                                  <li key={index} className="text-sm text-gray-600 flex items-center">
                                    <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                                    {pro}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-medium text-red-700 mb-2">Cons</h4>
                              <ul className="space-y-1">
                                {style.cons.map((con, index) => (
                                  <li key={index} className="text-sm text-gray-600 flex items-center">
                                    <div className="w-3 h-3 border border-red-500 rounded-full mr-2"></div>
                                    {con}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="recommendations" className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="font-semibold text-blue-900 mb-3">Recommendation Summary</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white rounded border">
                          <div>
                            <h4 className="font-medium">Best Overall: Minimalist Glass</h4>
                            <p className="text-sm text-gray-600">Highest brand alignment and accessibility</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Recommended</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded border">
                          <div>
                            <h4 className="font-medium">Most Modern: Neon Cyberpunk</h4>
                            <p className="text-sm text-gray-600">Cutting-edge design with high visual appeal</p>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">Alternative</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded border">
                          <div>
                            <h4 className="font-medium">Most Professional: Premium Luxury</h4>
                            <p className="text-sm text-gray-600">Sophisticated and business-appropriate</p>
                          </div>
                          <Badge className="bg-purple-100 text-purple-800">Alternative</Badge>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="technical" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {styles.map((style) => (
                        <div key={style.id} className="space-y-3">
                          <h3 className="font-semibold text-lg">{style.name}</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Load Time:</span>
                              <span className="font-medium">{style.metrics.loadTime}ms</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Bundle Size:</span>
                              <span className="font-medium">~45KB</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Animations:</span>
                              <span className="font-medium">CSS Transforms</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Accessibility:</span>
                              <span className="font-medium">WCAG 2.1 AA</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
