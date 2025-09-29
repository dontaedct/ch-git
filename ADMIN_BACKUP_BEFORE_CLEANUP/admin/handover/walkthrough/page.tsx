'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Clock, Download, Eye, Film, Play, Settings, Zap } from 'lucide-react';
import { walkthroughGenerator } from '@/lib/handover/walkthrough-generator';
import { videoGenerator } from '@/lib/handover/video-generator';
import { interactiveTutorialEngine } from '@/lib/handover/interactive-tutorials';
import { walkthroughTemplateManager } from '@/lib/handover/walkthrough-templates';

interface WalkthroughGenerationForm {
  clientId: string;
  appId: string;
  templateId: string;
  format: 'interactive' | 'video' | 'pdf' | 'all';
  language: string;
  includeAdvancedFeatures: boolean;
  customizations: Record<string, any>;
}

interface GenerationStatus {
  walkthrough?: any;
  video?: any;
  tutorial?: any;
  progress: number;
  status: 'idle' | 'generating' | 'completed' | 'error';
  error?: string;
}

export default function WalkthroughGenerationPage() {
  const [form, setForm] = useState<WalkthroughGenerationForm>({
    clientId: '',
    appId: '',
    templateId: 'basic-app-intro',
    format: 'all',
    language: 'en',
    includeAdvancedFeatures: false,
    customizations: {}
  });

  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>({
    progress: 0,
    status: 'idle'
  });

  const [clients, setClients] = useState<any[]>([]);
  const [apps, setApps] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [generatedWalkthroughs, setGeneratedWalkthroughs] = useState<any[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [clientsResponse, templatesData] = await Promise.all([
        fetch('/api/clients'),
        walkthroughTemplateManager.getAllTemplates()
      ]);

      if (clientsResponse.ok) {
        const clientsData = await clientsResponse.json();
        setClients(clientsData);
      }

      setTemplates(templatesData);
      loadGeneratedWalkthroughs();
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadAppsForClient = async (clientId: string) => {
    try {
      const response = await fetch(`/api/clients/${clientId}/apps`);
      if (response.ok) {
        const appsData = await response.json();
        setApps(appsData);
      }
    } catch (error) {
      console.error('Error loading apps:', error);
    }
  };

  const loadGeneratedWalkthroughs = async () => {
    try {
      const response = await fetch('/api/handover/walkthroughs');
      if (response.ok) {
        const walkthroughs = await response.json();
        setGeneratedWalkthroughs(walkthroughs);
      }
    } catch (error) {
      console.error('Error loading walkthroughs:', error);
    }
  };

  const handleFormChange = (field: keyof WalkthroughGenerationForm, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'clientId' && value) {
      loadAppsForClient(value);
    }
  };

  const generateWalkthrough = async () => {
    if (!form.clientId || !form.appId || !form.templateId) {
      alert('Please fill in all required fields');
      return;
    }

    setGenerationStatus({
      progress: 0,
      status: 'generating'
    });

    try {
      // Generate walkthrough
      setGenerationStatus(prev => ({ ...prev, progress: 10 }));

      const walkthroughOptions = {
        clientId: form.clientId,
        appId: form.appId,
        templateId: form.templateId,
        customizations: form.customizations,
        includeAdvancedFeatures: form.includeAdvancedFeatures,
        language: form.language,
        format: form.format
      };

      const walkthrough = await walkthroughGenerator.generateWalkthrough(walkthroughOptions);

      setGenerationStatus(prev => ({
        ...prev,
        progress: 30,
        walkthrough
      }));

      let video, tutorial;

      // Generate video if requested
      if (form.format === 'video' || form.format === 'all') {
        setGenerationStatus(prev => ({ ...prev, progress: 40 }));

        const videoOptions = {
          walkthroughId: walkthrough.id,
          steps: walkthrough.steps,
          config: {
            resolution: '1920x1080',
            framerate: 30,
            quality: 'high',
            format: 'mp4'
          },
          voiceover: {
            enabled: true,
            voice: 'professional',
            speed: 1.0,
            language: form.language
          },
          subtitles: {
            enabled: true,
            language: form.language,
            style: {}
          }
        };

        video = await videoGenerator.generateVideo(videoOptions);

        setGenerationStatus(prev => ({
          ...prev,
          progress: 60,
          video
        }));
      }

      // Generate interactive tutorial if requested
      if (form.format === 'interactive' || form.format === 'all') {
        setGenerationStatus(prev => ({ ...prev, progress: 70 }));

        const tutorialOptions = {
          walkthroughId: walkthrough.id,
          clientId: form.clientId,
          appId: form.appId,
          templateId: form.templateId,
          interactivityLevel: form.includeAdvancedFeatures ? 'advanced' : 'basic' as 'basic' | 'advanced' | 'expert',
          adaptiveMode: form.includeAdvancedFeatures,
          progressTracking: true,
          gamification: form.includeAdvancedFeatures
        };

        tutorial = await interactiveTutorialEngine.createInteractiveTutorial(tutorialOptions);

        setGenerationStatus(prev => ({
          ...prev,
          progress: 90,
          tutorial
        }));
      }

      setGenerationStatus({
        progress: 100,
        status: 'completed',
        walkthrough,
        video,
        tutorial
      });

      loadGeneratedWalkthroughs();

    } catch (error) {
      console.error('Error generating walkthrough:', error);
      setGenerationStatus({
        progress: 0,
        status: 'error',
        error: error.message
      });
    }
  };

  const downloadWalkthrough = async (walkthroughId: string, format: string) => {
    try {
      const response = await fetch(`/api/handover/walkthroughs/${walkthroughId}/download?format=${format}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `walkthrough-${walkthroughId}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading walkthrough:', error);
    }
  };

  const previewWalkthrough = (walkthroughId: string) => {
    window.open(`/preview/walkthrough/${walkthroughId}`, '_blank');
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'generating':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getFormatBadge = (format: string) => {
    const formatConfig = {
      interactive: { label: 'Interactive', color: 'bg-blue-100 text-blue-800' },
      video: { label: 'Video', color: 'bg-purple-100 text-purple-800' },
      pdf: { label: 'PDF', color: 'bg-green-100 text-green-800' },
      all: { label: 'All Formats', color: 'bg-orange-100 text-orange-800' }
    };

    const config = formatConfig[format] || formatConfig.interactive;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Walkthrough Generation</h1>
          <p className="text-gray-600 mt-1">
            Create automated walkthroughs and tutorials for client applications
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadGeneratedWalkthroughs}>
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList>
          <TabsTrigger value="generate">Generate Walkthrough</TabsTrigger>
          <TabsTrigger value="library">Walkthrough Library</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Generation Configuration
                </CardTitle>
                <CardDescription>
                  Configure the walkthrough generation settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client">Client</Label>
                    <Select
                      value={form.clientId}
                      onValueChange={(value) => handleFormChange('clientId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="app">Application</Label>
                    <Select
                      value={form.appId}
                      onValueChange={(value) => handleFormChange('appId', value)}
                      disabled={!form.clientId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select application" />
                      </SelectTrigger>
                      <SelectContent>
                        {apps.map((app) => (
                          <SelectItem key={app.id} value={app.id}>
                            {app.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template">Template</Label>
                  <Select
                    value={form.templateId}
                    onValueChange={(value) => handleFormChange('templateId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="format">Output Format</Label>
                    <Select
                      value={form.format}
                      onValueChange={(value) => handleFormChange('format', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="interactive">Interactive Tutorial</SelectItem>
                        <SelectItem value="video">Video Walkthrough</SelectItem>
                        <SelectItem value="pdf">PDF Guide</SelectItem>
                        <SelectItem value="all">All Formats</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={form.language}
                      onValueChange={(value) => handleFormChange('language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="advanced"
                    checked={form.includeAdvancedFeatures}
                    onChange={(e) => handleFormChange('includeAdvancedFeatures', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="advanced">Include Advanced Features</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customizations">Custom Instructions</Label>
                  <Textarea
                    placeholder="Add any specific customization instructions..."
                    value={JSON.stringify(form.customizations, null, 2)}
                    onChange={(e) => {
                      try {
                        const customizations = JSON.parse(e.target.value || '{}');
                        handleFormChange('customizations', customizations);
                      } catch {
                        // Invalid JSON, ignore
                      }
                    }}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={generateWalkthrough}
                  disabled={generationStatus.status === 'generating' || !form.clientId || !form.appId}
                  className="w-full"
                >
                  {generationStatus.status === 'generating' ? 'Generating...' : 'Generate Walkthrough'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Generation Status
                </CardTitle>
                <CardDescription>
                  Track the progress of walkthrough generation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {generationStatus.status !== 'idle' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Generation Progress</span>
                        <span>{generationStatus.progress}%</span>
                      </div>
                      <Progress value={generationStatus.progress} className="h-2" />
                    </div>

                    {generationStatus.status === 'error' && generationStatus.error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex items-center gap-2 text-red-800">
                          <AlertCircle className="h-4 w-4" />
                          <span className="font-medium">Generation Error</span>
                        </div>
                        <p className="text-red-700 text-sm mt-1">{generationStatus.error}</p>
                      </div>
                    )}

                    {generationStatus.walkthrough && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-green-800">
                            <CheckCircle className="h-4 w-4" />
                            <span className="font-medium">Walkthrough Generated</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => previewWalkthrough(generationStatus.walkthrough.id)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Preview
                            </Button>
                          </div>
                        </div>
                        <p className="text-green-700 text-sm mt-1">
                          {generationStatus.walkthrough.steps?.length || 0} steps, {formatDuration(generationStatus.walkthrough.duration || 0)}
                        </p>
                      </div>
                    )}

                    {generationStatus.video && (
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-purple-800">
                            <Film className="h-4 w-4" />
                            <span className="font-medium">Video Generated</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(generationStatus.video.urls?.preview, '_blank')}
                              disabled={!generationStatus.video.urls?.preview}
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Play
                            </Button>
                          </div>
                        </div>
                        <p className="text-purple-700 text-sm mt-1">
                          Status: {generationStatus.video.processing?.status || 'Unknown'}
                        </p>
                      </div>
                    )}

                    {generationStatus.tutorial && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-blue-800">
                            <Zap className="h-4 w-4" />
                            <span className="font-medium">Interactive Tutorial Generated</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`/tutorial/${generationStatus.tutorial.id}`, '_blank')}
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Start
                            </Button>
                          </div>
                        </div>
                        <p className="text-blue-700 text-sm mt-1">
                          {generationStatus.tutorial.steps?.length || 0} interactive steps
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {generationStatus.status === 'idle' && (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Ready to generate walkthrough</p>
                    <p className="text-sm">Fill in the configuration and click generate</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="library">
          <Card>
            <CardHeader>
              <CardTitle>Generated Walkthroughs</CardTitle>
              <CardDescription>
                Browse and manage previously generated walkthroughs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {generatedWalkthroughs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Film className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No walkthroughs generated yet</p>
                    <p className="text-sm">Create your first walkthrough to get started</p>
                  </div>
                ) : (
                  generatedWalkthroughs.map((walkthrough) => (
                    <div
                      key={walkthrough.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        {getStatusIcon(walkthrough.status || 'completed')}
                        <div>
                          <h3 className="font-medium">{walkthrough.metadata?.title || 'Untitled Walkthrough'}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{formatDuration(walkthrough.duration || 0)}</span>
                            <span>•</span>
                            <span>{walkthrough.steps?.length || 0} steps</span>
                            <span>•</span>
                            <span>{new Date(walkthrough.generatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {walkthrough.metadata?.format && getFormatBadge(walkthrough.metadata.format)}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => previewWalkthrough(walkthrough.id)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadWalkthrough(walkthrough.id, 'pdf')}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Walkthrough Templates</CardTitle>
              <CardDescription>
                Manage and customize walkthrough templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleFormChange('templateId', template.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{template.title}</h3>
                      <Badge variant={template.metadata?.isBuiltIn ? "secondary" : "default"}>
                        {template.metadata?.isBuiltIn ? 'Built-in' : 'Custom'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{template.steps?.length || 0} steps</span>
                      <span>{formatDuration(template.metadata?.estimatedDuration || 0)}</span>
                      <Badge variant="outline" className="text-xs">
                        {template.metadata?.difficulty || 'beginner'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}