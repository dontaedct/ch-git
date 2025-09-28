'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Code2, 
  Rocket, 
  Settings, 
  Eye, 
  Download, 
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Server,
  Database,
  Palette,
  FileText,
  Zap
} from 'lucide-react';

interface ProjectConfig {
  name: string;
  slug: string;
  templateId: string;
  platform: 'vercel' | 'netlify' | 'custom';
  customDomain?: string;
  theme: {
    colors: Record<string, string>;
    typography: Record<string, any>;
    spacing: Record<string, string>;
  };
  components: Array<{
    id: string;
    type: string;
    props: Record<string, any>;
  }>;
  forms: Array<{
    id: string;
    name: string;
    fields: Array<{
      id: string;
      type: string;
      label: string;
      required: boolean;
    }>;
  }>;
}

interface DeploymentStatus {
  id: string;
  status: 'pending' | 'building' | 'deploying' | 'success' | 'failed';
  url?: string;
  logs: string[];
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

export default function CodeGenerationPage() {
  const [activeTab, setActiveTab] = useState('generate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [generatedProject, setGeneratedProject] = useState<any>(null);
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus | null>(null);
  
  const [projectConfig, setProjectConfig] = useState<ProjectConfig>({
    name: '',
    slug: '',
    templateId: 'default',
    platform: 'vercel',
    theme: {
      colors: {
        primary: '#000000',
        secondary: '#ffffff',
        accent: '#3b82f6',
      },
      typography: {},
      spacing: {},
    },
    components: [],
    forms: [],
  });

  const handleGenerateProject = async () => {
    if (!projectConfig.name || !projectConfig.slug) {
      alert('Please fill in project name and slug');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/code-generation/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectConfig),
      });

      const result = await response.json();
      
      if (result.success) {
        setGeneratedProject(result.project);
        setActiveTab('deploy');
      } else {
        alert('Failed to generate project: ' + result.error);
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate project');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeployProject = async () => {
    if (!generatedProject) return;

    setIsDeploying(true);
    try {
      const response = await fetch('/api/code-generation/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: generatedProject.id,
          platform: projectConfig.platform,
          customDomain: projectConfig.customDomain,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setDeploymentStatus(result.deployment);
        setActiveTab('status');
      } else {
        alert('Failed to deploy project: ' + result.error);
      }
    } catch (error) {
      console.error('Deployment error:', error);
      alert('Failed to deploy project');
    } finally {
      setIsDeploying(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
      case 'building':
      case 'deploying':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
      case 'building':
      case 'deploying':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Code Generation & Deployment
          </h1>
          <p className="text-xl text-muted-foreground">
            Generate complete Next.js applications from templates and deploy them to production
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Code2 className="h-4 w-4" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="deploy" className="flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              Deploy
            </TabsTrigger>
            <TabsTrigger value="status" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Status
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Project Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure your project settings and choose a template
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Project Name</Label>
                    <Input
                      id="projectName"
                      placeholder="My Awesome App"
                      value={projectConfig.name}
                      onChange={(e) => setProjectConfig(prev => ({
                        ...prev,
                        name: e.target.value,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-')
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="projectSlug">Project Slug</Label>
                    <Input
                      id="projectSlug"
                      placeholder="my-awesome-app"
                      value={projectConfig.slug}
                      onChange={(e) => setProjectConfig(prev => ({
                        ...prev,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="templateId">Template</Label>
                    <Select
                      value={projectConfig.templateId}
                      onValueChange={(value) => setProjectConfig(prev => ({
                        ...prev,
                        templateId: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default Template</SelectItem>
                        <SelectItem value="landing-page">Landing Page</SelectItem>
                        <SelectItem value="portfolio">Portfolio</SelectItem>
                        <SelectItem value="ecommerce">E-commerce</SelectItem>
                        <SelectItem value="blog">Blog</SelectItem>
                        <SelectItem value="saas">SaaS Dashboard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Theme Configuration
                  </CardTitle>
                  <CardDescription>
                    Customize colors and styling for your application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={projectConfig.theme.colors.primary}
                          onChange={(e) => setProjectConfig(prev => ({
                            ...prev,
                            theme: {
                              ...prev.theme,
                              colors: {
                                ...prev.theme.colors,
                                primary: e.target.value
                              }
                            }
                          }))}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={projectConfig.theme.colors.primary}
                          onChange={(e) => setProjectConfig(prev => ({
                            ...prev,
                            theme: {
                              ...prev.theme,
                              colors: {
                                ...prev.theme.colors,
                                primary: e.target.value
                              }
                            }
                          }))}
                          placeholder="#000000"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor">Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="secondaryColor"
                          type="color"
                          value={projectConfig.theme.colors.secondary}
                          onChange={(e) => setProjectConfig(prev => ({
                            ...prev,
                            theme: {
                              ...prev.theme,
                              colors: {
                                ...prev.theme.colors,
                                secondary: e.target.value
                              }
                            }
                          }))}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={projectConfig.theme.colors.secondary}
                          onChange={(e) => setProjectConfig(prev => ({
                            ...prev,
                            theme: {
                              ...prev.theme,
                              colors: {
                                ...prev.theme.colors,
                                secondary: e.target.value
                              }
                            }
                          }))}
                          placeholder="#ffffff"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accentColor">Accent Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="accentColor"
                        type="color"
                        value={projectConfig.theme.colors.accent}
                        onChange={(e) => setProjectConfig(prev => ({
                          ...prev,
                          theme: {
                            ...prev.theme,
                            colors: {
                              ...prev.theme.colors,
                              accent: e.target.value
                            }
                          }
                        }))}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={projectConfig.theme.colors.accent}
                        onChange={(e) => setProjectConfig(prev => ({
                          ...prev,
                          theme: {
                            ...prev.theme,
                            colors: {
                              ...prev.theme.colors,
                              accent: e.target.value
                            }
                          }
                        }))}
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Generate your project with the current configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Ready to generate your project?</p>
                    <p className="text-sm text-muted-foreground">
                      This will create a complete Next.js application with all the configured settings.
                    </p>
                  </div>
                  <Button 
                    onClick={handleGenerateProject}
                    disabled={isGenerating || !projectConfig.name || !projectConfig.slug}
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Clock className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Code2 className="h-4 w-4" />
                        Generate Project
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deploy" className="space-y-6">
            {generatedProject ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Rocket className="h-5 w-5" />
                      Deployment Configuration
                    </CardTitle>
                    <CardDescription>
                      Configure deployment settings for your generated project
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="platform">Deployment Platform</Label>
                      <Select
                        value={projectConfig.platform}
                        onValueChange={(value: 'vercel' | 'netlify' | 'custom') => setProjectConfig(prev => ({
                          ...prev,
                          platform: value
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vercel">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              Vercel
                            </div>
                          </SelectItem>
                          <SelectItem value="netlify">
                            <div className="flex items-center gap-2">
                              <Server className="h-4 w-4" />
                              Netlify
                            </div>
                          </SelectItem>
                          <SelectItem value="custom">
                            <div className="flex items-center gap-2">
                              <Database className="h-4 w-4" />
                              Custom Server
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customDomain">Custom Domain (Optional)</Label>
                      <Input
                        id="customDomain"
                        placeholder="myapp.com"
                        value={projectConfig.customDomain || ''}
                        onChange={(e) => setProjectConfig(prev => ({
                          ...prev,
                          customDomain: e.target.value
                        }))}
                      />
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Generated Project Details</h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Name:</strong> {generatedProject.name}</p>
                        <p><strong>ID:</strong> {generatedProject.id}</p>
                        <p><strong>Status:</strong> 
                          <Badge className="ml-2" variant="outline">
                            {generatedProject.status}
                          </Badge>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Deployment Actions
                    </CardTitle>
                    <CardDescription>
                      Deploy your project to the selected platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <p className="font-medium">Deploy to {projectConfig.platform}</p>
                          <p className="text-sm text-muted-foreground">
                            Deploy your project to {projectConfig.platform}
                          </p>
                        </div>
                        <Button 
                          onClick={handleDeployProject}
                          disabled={isDeploying}
                          className="flex items-center gap-2"
                        >
                          {isDeploying ? (
                            <>
                              <Clock className="h-4 w-4 animate-spin" />
                              Deploying...
                            </>
                          ) : (
                            <>
                              <Rocket className="h-4 w-4" />
                              Deploy
                            </>
                          )}
                        </Button>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <p className="font-medium">Download Project</p>
                          <p className="text-sm text-muted-foreground">
                            Download the generated project files
                          </p>
                        </div>
                        <Button variant="outline" className="flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center space-y-4">
                    <Code2 className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div>
                      <h3 className="text-lg font-medium">No Project Generated</h3>
                      <p className="text-muted-foreground">
                        Generate a project first to configure deployment settings.
                      </p>
                    </div>
                    <Button onClick={() => setActiveTab('generate')}>
                      Generate Project
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="status" className="space-y-6">
            {deploymentStatus ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(deploymentStatus.status)}
                      Deployment Status
                    </CardTitle>
                    <CardDescription>
                      Current status of your deployment
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Badge className={getStatusColor(deploymentStatus.status)}>
                          {deploymentStatus.status}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <Label>Created</Label>
                        <p className="text-sm">{deploymentStatus.createdAt.toLocaleString()}</p>
                      </div>
                      {deploymentStatus.completedAt && (
                        <div className="space-y-2">
                          <Label>Completed</Label>
                          <p className="text-sm">{deploymentStatus.completedAt.toLocaleString()}</p>
                        </div>
                      )}
                    </div>

                    {deploymentStatus.url && (
                      <div className="space-y-2">
                        <Label>Deployment URL</Label>
                        <div className="flex items-center gap-2">
                          <Input value={deploymentStatus.url} readOnly />
                          <Button size="sm" variant="outline" asChild>
                            <a href={deploymentStatus.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}

                    {deploymentStatus.error && (
                      <div className="space-y-2">
                        <Label>Error</Label>
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-800">{deploymentStatus.error}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Deployment Logs</CardTitle>
                    <CardDescription>
                      Detailed logs from the deployment process
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                      {deploymentStatus.logs.map((log, index) => (
                        <div key={index} className="mb-1">
                          {log}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center space-y-4">
                    <Eye className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div>
                      <h3 className="text-lg font-medium">No Deployment Status</h3>
                      <p className="text-muted-foreground">
                        Deploy a project to see its status and logs.
                      </p>
                    </div>
                    <Button onClick={() => setActiveTab('deploy')}>
                      Deploy Project
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Code Generation Settings</CardTitle>
                <CardDescription>
                  Configure default settings for code generation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Auto-deploy after generation</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically deploy projects after they are generated
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Include TypeScript</Label>
                      <p className="text-sm text-muted-foreground">
                        Generate TypeScript-enabled projects
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Include Tailwind CSS</Label>
                      <p className="text-sm text-muted-foreground">
                        Include Tailwind CSS for styling
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Include ESLint</Label>
                      <p className="text-sm text-muted-foreground">
                        Include ESLint for code quality
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label>Default Environment Variables</Label>
                  <Textarea
                    placeholder="NODE_ENV=production&#10;NEXT_PUBLIC_APP_URL=https://myapp.com"
                    className="min-h-[100px]"
                  />
                  <p className="text-sm text-muted-foreground">
                    Environment variables to include in all generated projects
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}