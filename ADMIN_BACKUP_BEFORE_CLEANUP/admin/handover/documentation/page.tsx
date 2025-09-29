'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Download,
  Settings,
  Plus,
  Search,
  Filter,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Info,
  BookOpen,
  Users,
  Shield,
  Code,
  Briefcase,
  Layout,
  Zap
} from 'lucide-react';

interface GeneratedDoc {
  id: string;
  title: string;
  type: string;
  status: 'generating' | 'completed' | 'error';
  generatedAt: Date;
  clientName: string;
  size: string;
  downloadUrl?: string;
}

interface DocumentationTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  estimatedTime: string;
  sections: number;
  targetAudience: string;
}

export default function DocumentationGenerationPage() {
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDoc[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [clientName, setClientName] = useState('Sample Client');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const templates: DocumentationTemplate[] = [
    {
      id: 'quick-start',
      name: 'Quick Start Guide',
      description: 'Essential information for immediate productivity',
      icon: <Zap className="h-5 w-5" />,
      estimatedTime: '2-3 minutes',
      sections: 4,
      targetAudience: 'New Users'
    },
    {
      id: 'user-guide',
      name: 'Complete User Guide',
      description: 'Comprehensive documentation covering all features',
      icon: <BookOpen className="h-5 w-5" />,
      estimatedTime: '5-8 minutes',
      sections: 12,
      targetAudience: 'All Users'
    },
    {
      id: 'admin-guide',
      name: 'Administrator Guide',
      description: 'Administrative functions and system management',
      icon: <Shield className="h-5 w-5" />,
      estimatedTime: '4-6 minutes',
      sections: 8,
      targetAudience: 'Administrators'
    },
    {
      id: 'api-docs',
      name: 'API Documentation',
      description: 'Technical documentation for developers',
      icon: <Code className="h-5 w-5" />,
      estimatedTime: '3-5 minutes',
      sections: 7,
      targetAudience: 'Developers'
    },
    {
      id: 'business-process',
      name: 'Business Process Guide',
      description: 'Workflow documentation and business procedures',
      icon: <Briefcase className="h-5 w-5" />,
      estimatedTime: '4-7 minutes',
      sections: 9,
      targetAudience: 'Business Users'
    },
    {
      id: 'training-materials',
      name: 'Training Materials',
      description: 'Structured learning materials for user education',
      icon: <Users className="h-5 w-5" />,
      estimatedTime: '6-10 minutes',
      sections: 15,
      targetAudience: 'Trainees'
    }
  ];

  // Sample generated documents
  useEffect(() => {
    setGeneratedDocs([
      {
        id: '1',
        title: 'Quick Start Guide - Sample Client',
        type: 'quick-start',
        status: 'completed',
        generatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        clientName: 'Sample Client',
        size: '2.3 MB',
        downloadUrl: '/downloads/sample-quick-start.pdf'
      },
      {
        id: '2',
        title: 'User Guide - Sample Client',
        type: 'user-guide',
        status: 'completed',
        generatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        clientName: 'Sample Client',
        size: '8.7 MB',
        downloadUrl: '/downloads/sample-user-guide.pdf'
      },
      {
        id: '3',
        title: 'API Documentation - Sample Client',
        type: 'api-docs',
        status: 'generating',
        generatedAt: new Date(),
        clientName: 'Sample Client',
        size: 'Generating...'
      }
    ]);
  }, []);

  const handleGenerateDocumentation = async () => {
    if (!selectedTemplate) return;

    setIsGenerating(true);

    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;

    const newDoc: GeneratedDoc = {
      id: Date.now().toString(),
      title: `${template.name} - ${clientName}`,
      type: selectedTemplate,
      status: 'generating',
      generatedAt: new Date(),
      clientName,
      size: 'Generating...'
    };

    setGeneratedDocs(prev => [newDoc, ...prev]);

    // Simulate generation process
    setTimeout(() => {
      setGeneratedDocs(prev =>
        prev.map(doc =>
          doc.id === newDoc.id
            ? {
                ...doc,
                status: 'completed' as const,
                size: `${Math.random() * 8 + 2}`.substring(0, 3) + ' MB',
                downloadUrl: `/downloads/${selectedTemplate}-${clientName.toLowerCase().replace(/\s+/g, '-')}.pdf`
              }
            : doc
        )
      );
      setIsGenerating(false);
    }, 3000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'generating':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'generating':
        return 'bg-blue-100 text-blue-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredDocs = generatedDocs.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || doc.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documentation Generation</h1>
          <p className="text-muted-foreground">
            Generate automated client documentation, user guides, and training materials
          </p>
        </div>
        <Button onClick={() => setSelectedTemplate('')} variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">Generate Documentation</TabsTrigger>
          <TabsTrigger value="templates">Template Library</TabsTrigger>
          <TabsTrigger value="history">Generation History</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Create New Documentation
              </CardTitle>
              <CardDescription>
                Generate comprehensive documentation tailored to your client's needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client-name">Client Name</Label>
                  <Input
                    id="client-name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Enter client name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template">Documentation Template</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a documentation template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex items-center">
                            {template.icon}
                            <span className="ml-2">{template.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTemplate && (
                  <Card className="border-dashed">
                    <CardContent className="pt-6">
                      {(() => {
                        const template = templates.find(t => t.id === selectedTemplate);
                        return template ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                {template.icon}
                                <h3 className="ml-2 font-semibold">{template.name}</h3>
                              </div>
                              <Badge variant="outline">{template.estimatedTime}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{template.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Layout className="h-4 w-4 mr-1" />
                                {template.sections} sections
                              </div>
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                {template.targetAudience}
                              </div>
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleGenerateDocumentation}
                  disabled={!selectedTemplate || !clientName.trim() || isGenerating}
                  className="min-w-[150px]"
                >
                  {isGenerating ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Documentation
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    {template.icon}
                    <span className="ml-2">{template.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="outline">{template.estimatedTime}</Badge>
                    <span className="text-muted-foreground">{template.sections} sections</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-4 w-4 mr-1" />
                    {template.targetAudience}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      // Switch to generate tab
                      const generateTab = document.querySelector('[value="generate"]') as HTMLElement;
                      generateTab?.click();
                    }}
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documentation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="generating">Generating</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Badge variant="outline">{filteredDocs.length} documents</Badge>
          </div>

          <div className="space-y-4">
            {filteredDocs.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-semibold">{doc.title}</h3>
                        <Badge className={getStatusColor(doc.status)}>
                          <span className="flex items-center">
                            {getStatusIcon(doc.status)}
                            <span className="ml-1 capitalize">{doc.status}</span>
                          </span>
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {doc.clientName}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {doc.generatedAt.toLocaleDateString()} at {doc.generatedAt.toLocaleTimeString()}
                        </div>
                        <div>Size: {doc.size}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {doc.status === 'completed' && doc.downloadUrl && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredDocs.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No documentation found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || filterStatus !== 'all'
                      ? 'Try adjusting your search or filter criteria'
                      : 'Generate your first documentation to get started'
                    }
                  </p>
                  {!searchTerm && filterStatus === 'all' && (
                    <Button onClick={() => {
                      const generateTab = document.querySelector('[value="generate"]') as HTMLElement;
                      generateTab?.click();
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Generate Documentation
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}