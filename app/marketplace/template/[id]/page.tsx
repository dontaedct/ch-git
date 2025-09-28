/**
 * @fileoverview Template Detail Page - HT-032.3.1
 * @module app/marketplace/template/[id]/page
 * @author HT-032.3.1 - Template Marketplace Infrastructure & Discovery Platform
 * @version 1.0.0
 *
 * HT-032.3.1: Template Marketplace Infrastructure & Discovery Platform
 *
 * Individual template detail page showing comprehensive template information,
 * screenshots, features, reviews, installation options, and related templates.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, Download, Star, Eye, Heart, Share2, ExternalLink, 
  Check, X, Calendar, Users, Globe, Code, Palette, Zap,
  ArrowLeft, ChevronLeft, ChevronRight, Play
} from 'lucide-react';
import { DiscoveryPlatform } from '@/lib/marketplace/discovery-platform';
import { getTemplateRegistryManager } from '@/lib/admin/template-registry';
import type { TemplateRegistration } from '@/types/admin/template-registry';

interface TemplateDetail extends TemplateRegistration {
  downloads: number;
  rating: number;
  reviews: TemplateReview[];
  price: number;
  isFree: boolean;
  isPopular: boolean;
  isFeatured: boolean;
  lastUpdated: Date;
  screenshots: string[];
  demoUrl?: string;
  videoUrl?: string;
  changelog: ChangelogEntry[];
  requirements: string[];
  features: TemplateFeature[];
  author: {
    name: string;
    avatar?: string;
    verified: boolean;
    totalTemplates: number;
    bio: string;
    website?: string;
  };
  relatedTemplates: TemplateDetail[];
  compatibilityInfo: {
    nextjs: string;
    react: string;
    typescript: string;
    tailwind: string;
  };
}

interface TemplateReview {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  comment: string;
  date: Date;
  helpful: number;
}

interface ChangelogEntry {
  version: string;
  date: Date;
  changes: string[];
}

interface TemplateFeature {
  name: string;
  description: string;
  icon: string;
  included: boolean;
}

interface TemplateDetailState {
  isLoading: boolean;
  template: TemplateDetail | null;
  error: string | null;
  isInstalling: boolean;
  currentScreenshot: number;
  showVideo: boolean;
}

const initialState: TemplateDetailState = {
  isLoading: true,
  template: null,
  error: null,
  isInstalling: false,
  currentScreenshot: 0,
  showVideo: false
};

export default function TemplateDetailPage() {
  const params = useParams();
  const templateId = params.id as string;
  const [state, setState] = useState<TemplateDetailState>(initialState);

  // Initialize services
  const discoveryPlatform = new DiscoveryPlatform();
  const templateRegistry = getTemplateRegistryManager();

  useEffect(() => {
    if (templateId) {
      loadTemplateDetail();
    }
  }, [templateId]);

  const loadTemplateDetail = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const templateDetail = await discoveryPlatform.getTemplateDetail(templateId);
      
      setState(prev => ({
        ...prev,
        template: templateDetail,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load template details',
        isLoading: false
      }));
    }
  };

  const handleInstall = async () => {
    if (!state.template) return;

    try {
      setState(prev => ({ ...prev, isInstalling: true }));
      await templateRegistry.installTemplate(state.template.metadata.id);
      
      // Show success message
      console.log(`Template ${state.template.metadata.name} installed successfully`);
    } catch (error) {
      console.error(`Failed to install template:`, error);
    } finally {
      setState(prev => ({ ...prev, isInstalling: false }));
    }
  };

  const nextScreenshot = () => {
    if (state.template && state.template.screenshots.length > 0) {
      setState(prev => ({
        ...prev,
        currentScreenshot: (prev.currentScreenshot + 1) % state.template!.screenshots.length
      }));
    }
  };

  const prevScreenshot = () => {
    if (state.template && state.template.screenshots.length > 0) {
      setState(prev => ({
        ...prev,
        currentScreenshot: prev.currentScreenshot === 0 
          ? state.template!.screenshots.length - 1 
          : prev.currentScreenshot - 1
      }));
    }
  };

  const renderScreenshots = () => {
    if (!state.template || !state.template.screenshots.length) return null;

    return (
      <div className="space-y-4">
        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden group">
          {state.showVideo && state.template.videoUrl ? (
            <iframe
              src={state.template.videoUrl}
              className="w-full h-full"
              allowFullScreen
            />
          ) : (
            <>
              <img
                src={state.template.screenshots[state.currentScreenshot]}
                alt={`${state.template.metadata.name} screenshot ${state.currentScreenshot + 1}`}
                className="w-full h-full object-cover"
              />
              
              {state.template.screenshots.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={prevScreenshot}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={nextScreenshot}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}

              {state.template.videoUrl && (
                <Button
                  variant="secondary"
                  className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setState(prev => ({ ...prev, showVideo: true }))}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Watch Demo
                </Button>
              )}
            </>
          )}
        </div>

        {state.template.screenshots.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {state.template.screenshots.map((screenshot, index) => (
              <button
                key={index}
                onClick={() => setState(prev => ({ ...prev, currentScreenshot: index }))}
                className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                  index === state.currentScreenshot ? 'border-blue-500' : 'border-gray-200'
                }`}
              >
                <img
                  src={screenshot}
                  alt={`Screenshot ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderFeatures = () => {
    if (!state.template || !state.template.features.length) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.template.features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
            <div className={`p-1 rounded ${feature.included ? 'text-green-600' : 'text-gray-400'}`}>
              {feature.included ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            </div>
            <div className="flex-1">
              <h4 className="font-medium">{feature.name}</h4>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderReviews = () => {
    if (!state.template || !state.template.reviews.length) return null;

    return (
      <div className="space-y-4">
        {state.template.reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={review.avatar} />
                  <AvatarFallback>{review.author[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{review.author}</span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < review.rating 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {review.date.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{review.comment}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{review.helpful} people found this helpful</span>
                    <Button variant="ghost" size="sm" className="h-6 px-2">
                      Helpful
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderChangelog = () => {
    if (!state.template || !state.template.changelog.length) return null;

    return (
      <div className="space-y-4">
        {state.template.changelog.map((entry, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">v{entry.version}</Badge>
                <span className="text-sm text-muted-foreground">
                  {entry.date.toLocaleDateString()}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-1">
                {entry.changes.map((change, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    {change}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderRelatedTemplates = () => {
    if (!state.template || !state.template.relatedTemplates.length) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.template.relatedTemplates.slice(0, 3).map((template) => (
          <Card key={template.metadata.id} className="hover:shadow-md transition-shadow">
            <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
              {template.screenshots && template.screenshots[0] && (
                <img
                  src={template.screenshots[0]}
                  alt={template.metadata.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-base line-clamp-1">{template.metadata.name}</CardTitle>
              <CardDescription className="line-clamp-2">{template.metadata.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span>{template.rating.toFixed(1)}</span>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <a href={`/marketplace/template/${template.metadata.id}`}>
                    View
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (state.isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center min-h-96">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p>Loading template details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (state.error || !state.template) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 mb-4">
              {state.error || 'Template not found'}
            </p>
            <Button variant="outline" asChild>
              <a href="/marketplace">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Marketplace
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Back Button */}
      <Button variant="ghost" className="mb-6" asChild>
        <a href="/marketplace">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </a>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{state.template.metadata.name}</h1>
                <p className="text-muted-foreground text-lg">{state.template.metadata.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{state.template.rating.toFixed(1)} ({state.template.reviews.length} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <Download className="w-4 h-4" />
                <span>{state.template.downloads.toLocaleString()} downloads</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Updated {state.template.lastUpdated.toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {state.template.metadata.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </div>

          {/* Screenshots */}
          {renderScreenshots()}

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="changelog">Changelog</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About this template</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p>{state.template.metadata.description}</p>
                  
                  {state.template.requirements.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Requirements:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {state.template.requirements.map((req, index) => (
                          <li key={index} className="text-sm">{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {state.template.relatedTemplates.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Related Templates</CardTitle>
                    <CardDescription>Other templates you might like</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderRelatedTemplates()}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="features">
              <Card>
                <CardHeader>
                  <CardTitle>Features & Capabilities</CardTitle>
                  <CardDescription>What's included in this template</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderFeatures()}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle>Reviews & Ratings</CardTitle>
                  <CardDescription>What users are saying</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderReviews()}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="changelog">
              <Card>
                <CardHeader>
                  <CardTitle>Version History</CardTitle>
                  <CardDescription>Recent updates and improvements</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderChangelog()}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Purchase/Install Card */}
          <Card>
            <CardHeader>
              <div className="text-center">
                {state.template.isFree ? (
                  <div>
                    <Badge variant="secondary" className="text-lg px-4 py-1">Free</Badge>
                    <p className="text-sm text-muted-foreground mt-2">No cost to install</p>
                  </div>
                ) : (
                  <div>
                    <div className="text-3xl font-bold">${state.template.price}</div>
                    <p className="text-sm text-muted-foreground">One-time purchase</p>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleInstall}
                disabled={state.isInstalling}
              >
                {state.isInstalling ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                {state.isInstalling ? 'Installing...' : 'Install Template'}
              </Button>
              
              {state.template.demoUrl && (
                <Button variant="outline" className="w-full" asChild>
                  <a href={state.template.demoUrl} target="_blank" rel="noopener noreferrer">
                    <Eye className="w-4 h-4 mr-2" />
                    Live Preview
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Author Info */}
          <Card>
            <CardHeader>
              <CardTitle>Author</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-3">
                <Avatar>
                  <AvatarImage src={state.template.author.avatar} />
                  <AvatarFallback>{state.template.author.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{state.template.author.name}</span>
                    {state.template.author.verified && (
                      <Badge variant="outline" className="text-xs">Verified</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {state.template.author.totalTemplates} templates
                  </p>
                </div>
              </div>
              
              {state.template.author.bio && (
                <p className="text-sm text-muted-foreground mb-3">
                  {state.template.author.bio}
                </p>
              )}
              
              {state.template.author.website && (
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href={state.template.author.website} target="_blank" rel="noopener noreferrer">
                    <Globe className="w-4 h-4 mr-2" />
                    Visit Website
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Compatibility */}
          <Card>
            <CardHeader>
              <CardTitle>Compatibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Next.js</span>
                <Badge variant="outline">{state.template.compatibilityInfo.nextjs}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">React</span>
                <Badge variant="outline">{state.template.compatibilityInfo.react}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">TypeScript</span>
                <Badge variant="outline">{state.template.compatibilityInfo.typescript}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Tailwind CSS</span>
                <Badge variant="outline">{state.template.compatibilityInfo.tailwind}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Template Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Downloads
                </span>
                <span className="font-medium">{state.template.downloads.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Rating
                </span>
                <span className="font-medium">{state.template.rating.toFixed(1)}/5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Reviews
                </span>
                <span className="font-medium">{state.template.reviews.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
