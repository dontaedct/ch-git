'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Download,
  Eye,
  Edit,
  Share2,
  Copy,
  ExternalLink,
  BookOpen,
  Users,
  Shield,
  Code,
  Briefcase,
  Layout,
  Zap,
  CheckCircle,
  Clock,
  RefreshCw,
  Settings
} from 'lucide-react';

interface DocumentationPreviewProps {
  documentId?: string;
  clientConfig?: {
    clientId: string;
    businessName: string;
    domain?: string;
    branding?: {
      primaryColor?: string;
      secondaryColor?: string;
      logo?: string;
      theme?: string;
    };
    enabledFeatures?: string[];
    integrations?: Array<{
      name: string;
      description: string;
      status: string;
      type?: string;
    }>;
  };
  onEdit?: (documentId: string) => void;
  onDownload?: (documentId: string) => void;
  onShare?: (documentId: string) => void;
}

interface DocumentSection {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  status: 'complete' | 'generating' | 'error';
}

interface DocumentPreview {
  id: string;
  title: string;
  type: string;
  icon: React.ReactNode;
  generatedAt: Date;
  wordCount: number;
  pageCount: number;
  status: 'complete' | 'generating' | 'error';
  sections: DocumentSection[];
  metadata: {
    version: string;
    template: string;
    targetAudience: string;
    estimatedReadTime: string;
    lastUpdated: Date;
  };
}

export default function DocumentationPreview({
  documentId,
  clientConfig,
  onEdit,
  onDownload,
  onShare
}: DocumentationPreviewProps) {
  const [document, setDocument] = useState<DocumentPreview | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState<'formatted' | 'markdown' | 'html'>('formatted');

  // Sample document data
  useEffect(() => {
    const loadDocument = async () => {
      setIsLoading(true);

      // Simulate API call
      setTimeout(() => {
        const sampleDoc: DocumentPreview = {
          id: documentId || '1',
          title: `User Guide - ${clientConfig?.businessName || 'Sample Client'}`,
          type: 'user-guide',
          icon: <BookOpen className="h-5 w-5" />,
          generatedAt: new Date(),
          wordCount: 3247,
          pageCount: 12,
          status: 'complete',
          sections: [
            {
              id: 'introduction',
              title: 'Introduction',
              content: `# Welcome to ${clientConfig?.businessName || 'Your Business'}

Welcome to your custom application platform built specifically for ${clientConfig?.businessName || 'your business'}. This application has been designed and configured to meet your unique business requirements and branding guidelines.

## About Your Application

Your application includes:
- Custom branding with your company colors and logo
- Tailored features for your business needs
- Secure user management and access controls
- Professional interface designed for your workflow
- Integration with your existing systems

## Getting Help

If you need assistance, you can:
- Refer to this user guide for common tasks
- Contact your administrator for account-related issues
- Reach out to technical support for system issues`,
              wordCount: 127,
              status: 'complete'
            },
            {
              id: 'getting-started',
              title: 'Getting Started',
              content: `# Getting Started

## First Login

1. Navigate to your application URL: \`${clientConfig?.domain || 'your-app-domain.com'}\`
2. Enter your username and password provided by your administrator
3. Complete any required profile setup steps
4. Review the dashboard and main navigation

## Dashboard Overview

Your dashboard provides:
- Quick access to main features
- Recent activity summary
- Important notifications
- Key performance metrics

## Main Navigation

The application is organized into several main sections:
${clientConfig?.enabledFeatures?.map(feature => `- **${feature.charAt(0).toUpperCase() + feature.slice(1)}**: ${getFeatureDescription(feature)}`).join('\n') || '- Feature sections customized for your business'}`,
              wordCount: 156,
              status: 'complete'
            },
            {
              id: 'features',
              title: 'Features Overview',
              content: `# Features Overview

Your ${clientConfig?.businessName || 'application'} includes the following key features:

## User Management
Comprehensive user account and permission management with role-based access control.

## Dashboard Analytics
Interactive dashboard with real-time metrics and customizable widgets.

## Reporting System
Advanced reporting capabilities with export options and scheduled reports.

## Integration Hub
Seamless integration with your existing business systems and third-party services.`,
              wordCount: 89,
              status: 'complete'
            },
            {
              id: 'troubleshooting',
              title: 'Troubleshooting',
              content: `# Troubleshooting

## Common Issues

### Login Problems
**Issue**: Cannot log in to the application
**Solutions**:
- Verify your username and password
- Check caps lock status
- Clear browser cache and cookies
- Try a different browser
- Contact your administrator for password reset

### Performance Issues
**Issue**: Application is slow or unresponsive
**Solutions**:
- Check your internet connection
- Close unnecessary browser tabs
- Clear browser cache
- Disable browser extensions temporarily
- Try using a different browser

## Getting Support

For additional help:
- Contact your system administrator
- Email: support@${clientConfig?.domain || 'your-domain.com'}
- Include error messages and screenshots`,
              wordCount: 134,
              status: 'complete'
            }
          ],
          metadata: {
            version: '1.0.0',
            template: 'user-guide',
            targetAudience: 'All Users',
            estimatedReadTime: '12-15 minutes',
            lastUpdated: new Date()
          }
        };

        setDocument(sampleDoc);
        setSelectedSection(sampleDoc.sections[0]?.id || '');
        setIsLoading(false);
      }, 1000);
    };

    loadDocument();
  }, [documentId, clientConfig]);

  const getFeatureDescription = (feature: string): string => {
    const descriptions: Record<string, string> = {
      'user-management': 'Comprehensive user account and permission management',
      'dashboard': 'Interactive dashboard with key metrics and quick actions',
      'reporting': 'Advanced reporting and analytics capabilities',
      'notifications': 'Real-time notifications and alert system',
      'file-management': 'Secure file upload, storage, and sharing'
    };
    return descriptions[feature] || 'Custom business feature';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800';
      case 'generating':
        return 'bg-blue-100 text-blue-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'generating':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error':
        return <RefreshCw className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const renderContent = (content: string, mode: string) => {
    switch (mode) {
      case 'markdown':
        return (
          <pre className="whitespace-pre-wrap text-sm font-mono bg-gray-50 p-4 rounded-lg overflow-auto">
            {content}
          </pre>
        );
      case 'html':
        return (
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{
              __html: content.replace(/\n/g, '<br>').replace(/#{1,6}\s(.+)/g, '<h3>$1</h3>')
            }}
          />
        );
      default:
        return (
          <div className="prose prose-sm max-w-none">
            {content.split('\n').map((line, index) => {
              if (line.startsWith('#')) {
                const level = line.match(/^#+/)?.[0].length || 1;
                const text = line.replace(/^#+\s/, '');
                const HeadingTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
                return (
                  <HeadingTag key={index} className="font-semibold mt-4 mb-2">
                    {text}
                  </HeadingTag>
                );
              } else if (line.startsWith('-')) {
                return (
                  <li key={index} className="ml-4">
                    {line.replace(/^-\s/, '')}
                  </li>
                );
              } else if (line.includes('`')) {
                return (
                  <p key={index} className="my-2">
                    {line.split('`').map((part, i) =>
                      i % 2 === 1 ? (
                        <code key={i} className="bg-gray-100 px-1 py-0.5 rounded text-sm">
                          {part}
                        </code>
                      ) : part
                    )}
                  </p>
                );
              } else if (line.trim()) {
                return (
                  <p key={index} className="my-2">
                    {line}
                  </p>
                );
              }
              return <br key={index} />;
            })}
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <div className="text-center space-y-4">
              <Clock className="h-8 w-8 animate-spin mx-auto text-blue-500" />
              <p className="text-muted-foreground">Loading documentation preview...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center p-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Document not found</h3>
            <p className="text-muted-foreground">
              The requested documentation could not be loaded.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedSectionData = document.sections.find(s => s.id === selectedSection);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            {document.icon}
            <h1 className="text-3xl font-bold tracking-tight">{document.title}</h1>
            <Badge className={getStatusColor(document.status)}>
              <span className="flex items-center">
                {getStatusIcon(document.status)}
                <span className="ml-1 capitalize">{document.status}</span>
              </span>
            </Badge>
          </div>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>{document.wordCount.toLocaleString()} words</span>
            <span>{document.pageCount} pages</span>
            <span>{document.metadata.estimatedReadTime}</span>
            <span>Generated {document.generatedAt.toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => onEdit?.(document.id)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => onShare?.(document.id)}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button size="sm" onClick={() => onDownload?.(document.id)}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar - Sections */}
        <div className="col-span-3">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Document Sections</CardTitle>
              <CardDescription>
                Navigate through the documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {document.sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setSelectedSection(section.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedSection === section.id
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{section.title}</h4>
                          {getStatusIcon(section.status)}
                        </div>
                        <p className="text-xs opacity-75">
                          {section.wordCount} words
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="col-span-9">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    {selectedSectionData && (
                      <>
                        {getStatusIcon(selectedSectionData.status)}
                        <span className="ml-2">{selectedSectionData.title}</span>
                      </>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {selectedSectionData && `${selectedSectionData.wordCount} words`}
                  </CardDescription>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant={previewMode === 'formatted' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setPreviewMode('formatted')}
                      className="rounded-r-none"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Formatted
                    </Button>
                    <Button
                      variant={previewMode === 'markdown' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setPreviewMode('markdown')}
                      className="rounded-none border-x"
                    >
                      <Code className="h-4 w-4 mr-1" />
                      Markdown
                    </Button>
                    <Button
                      variant={previewMode === 'html' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setPreviewMode('html')}
                      className="rounded-l-none"
                    >
                      <Layout className="h-4 w-4 mr-1" />
                      HTML
                    </Button>
                  </div>

                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="p-4">
                  {selectedSectionData && renderContent(selectedSectionData.content, previewMode)}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Document Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Version</p>
              <p className="text-sm">{document.metadata.version}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Template</p>
              <p className="text-sm capitalize">{document.metadata.template}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Target Audience</p>
              <p className="text-sm">{document.metadata.targetAudience}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
              <p className="text-sm">{document.metadata.lastUpdated.toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}