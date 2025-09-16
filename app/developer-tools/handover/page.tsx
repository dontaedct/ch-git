'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Package,
  FileText,
  Key,
  Download,
  Send,
  CheckCircle,
  Clock,
  User,
  Mail,
  Server,
  Shield,
  Database,
  Globe,
  Settings,
  BookOpen,
  Zap,
  AlertTriangle
} from 'lucide-react';

interface HandoverPackage {
  id: string;
  clientName: string;
  projectName: string;
  status: 'preparing' | 'ready' | 'delivered' | 'completed';
  createdAt: Date;
  deliveredAt?: Date;
  components: {
    documentation: boolean;
    credentials: boolean;
    codebase: boolean;
    deployment: boolean;
    training: boolean;
  };
  deliveryMethod: 'email' | 'secure-link' | 'portal';
  progress: number;
}

interface ClientCredential {
  id: string;
  type: 'database' | 'api' | 'hosting' | 'domain' | 'email' | 'analytics';
  name: string;
  description: string;
  secured: boolean;
  expiresAt?: Date;
}

interface DocumentationTemplate {
  id: string;
  name: string;
  type: 'setup' | 'user-guide' | 'technical' | 'maintenance';
  status: 'draft' | 'ready' | 'generated';
  lastUpdated: Date;
}

export default function ClientHandoverAutomationPage() {
  const [handoverPackages, setHandoverPackages] = useState<HandoverPackage[]>([
    {
      id: '1',
      clientName: 'Acme Corporation',
      projectName: 'E-commerce Platform',
      status: 'ready',
      createdAt: new Date(Date.now() - 86400000),
      components: {
        documentation: true,
        credentials: true,
        codebase: true,
        deployment: true,
        training: false
      },
      deliveryMethod: 'secure-link',
      progress: 85
    },
    {
      id: '2',
      clientName: 'TechStart Inc',
      projectName: 'Dashboard Analytics',
      status: 'preparing',
      createdAt: new Date(Date.now() - 3600000),
      components: {
        documentation: true,
        credentials: false,
        codebase: true,
        deployment: false,
        training: false
      },
      deliveryMethod: 'portal',
      progress: 45
    }
  ]);

  const [credentials, setCredentials] = useState<ClientCredential[]>([
    {
      id: '1',
      type: 'database',
      name: 'Production Database',
      description: 'PostgreSQL production instance credentials',
      secured: true,
      expiresAt: new Date(Date.now() + 2592000000) // 30 days
    },
    {
      id: '2',
      type: 'hosting',
      name: 'AWS Account Access',
      description: 'IAM user for deployment and management',
      secured: true,
      expiresAt: new Date(Date.now() + 7776000000) // 90 days
    },
    {
      id: '3',
      type: 'domain',
      name: 'Domain Management',
      description: 'DNS and domain registrar access',
      secured: false
    },
    {
      id: '4',
      type: 'api',
      name: 'Third-party APIs',
      description: 'Payment gateway and analytics API keys',
      secured: true
    }
  ]);

  const [documentationTemplates, setDocumentationTemplates] = useState<DocumentationTemplate[]>([
    {
      id: '1',
      name: 'Setup & Installation Guide',
      type: 'setup',
      status: 'ready',
      lastUpdated: new Date(Date.now() - 3600000)
    },
    {
      id: '2',
      name: 'User Manual',
      type: 'user-guide',
      status: 'ready',
      lastUpdated: new Date(Date.now() - 7200000)
    },
    {
      id: '3',
      name: 'Technical Documentation',
      type: 'technical',
      status: 'generated',
      lastUpdated: new Date(Date.now() - 1800000)
    },
    {
      id: '4',
      name: 'Maintenance Guide',
      type: 'maintenance',
      status: 'draft',
      lastUpdated: new Date(Date.now() - 10800000)
    }
  ]);

  const [handoverMetrics, setHandoverMetrics] = useState({
    totalHandovers: 23,
    averagePreparationTime: 4.2,
    clientSatisfactionScore: 4.7,
    documentationAccuracy: 96.5
  });

  const [newHandover, setNewHandover] = useState({
    clientName: '',
    projectName: '',
    clientEmail: '',
    deliveryMethod: 'secure-link' as const,
    includeTraining: false
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'ready':
        return 'bg-blue-500';
      case 'preparing':
        return 'bg-yellow-500';
      case 'delivered':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'ready':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'preparing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'delivered':
        return <Send className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCredentialIcon = (type: string) => {
    switch (type) {
      case 'database':
        return <Database className="h-4 w-4" />;
      case 'hosting':
        return <Server className="h-4 w-4" />;
      case 'domain':
        return <Globe className="h-4 w-4" />;
      case 'api':
        return <Key className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'analytics':
        return <Zap className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getDocumentationIcon = (type: string) => {
    switch (type) {
      case 'setup':
        return <Settings className="h-4 w-4" />;
      case 'user-guide':
        return <User className="h-4 w-4" />;
      case 'technical':
        return <FileText className="h-4 w-4" />;
      case 'maintenance':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const createHandoverPackage = () => {
    if (!newHandover.clientName || !newHandover.projectName) return;

    const handoverPackage: HandoverPackage = {
      id: Date.now().toString(),
      clientName: newHandover.clientName,
      projectName: newHandover.projectName,
      status: 'preparing',
      createdAt: new Date(),
      components: {
        documentation: false,
        credentials: false,
        codebase: false,
        deployment: false,
        training: newHandover.includeTraining
      },
      deliveryMethod: newHandover.deliveryMethod,
      progress: 0
    };

    setHandoverPackages(prev => [handoverPackage, ...prev]);

    // Simulate package preparation
    const preparePackage = () => {
      setHandoverPackages(prev =>
        prev.map(pkg => {
          if (pkg.id === handoverPackage.id && pkg.status === 'preparing') {
            const updatedComponents = { ...pkg.components };
            const currentProgress = pkg.progress;

            if (currentProgress < 25) {
              updatedComponents.documentation = true;
            } else if (currentProgress < 50) {
              updatedComponents.codebase = true;
            } else if (currentProgress < 75) {
              updatedComponents.credentials = true;
            } else if (currentProgress < 90) {
              updatedComponents.deployment = true;
            }

            const newProgress = Math.min(currentProgress + Math.random() * 15 + 5, 100);
            const isReady = newProgress >= 95;

            return {
              ...pkg,
              components: updatedComponents,
              progress: newProgress,
              status: isReady ? 'ready' : 'preparing'
            };
          }
          return pkg;
        })
      );
    };

    const interval = setInterval(() => {
      preparePackage();
    }, 2000);

    setTimeout(() => clearInterval(interval), 20000);

    setNewHandover({
      clientName: '',
      projectName: '',
      clientEmail: '',
      deliveryMethod: 'secure-link',
      includeTraining: false
    });
  };

  const deliverPackage = (packageId: string) => {
    setHandoverPackages(prev =>
      prev.map(pkg =>
        pkg.id === packageId
          ? { ...pkg, status: 'delivered', deliveredAt: new Date() }
          : pkg
      )
    );
  };

  const generateDocumentation = (templateId: string) => {
    setDocumentationTemplates(prev =>
      prev.map(template =>
        template.id === templateId
          ? { ...template, status: 'generated', lastUpdated: new Date() }
          : template
      )
    );
  };

  const secureCredential = (credentialId: string) => {
    setCredentials(prev =>
      prev.map(cred =>
        cred.id === credentialId
          ? { ...cred, secured: true }
          : cred
      )
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8" />
            Client Handover Automation
          </h1>
          <p className="text-gray-600 mt-2">
            Automate client handover with documentation generation, credential management, and delivery packages
          </p>
        </div>
      </div>

      {/* Handover Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Handovers</p>
                <p className="text-2xl font-bold">{handoverMetrics.totalHandovers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Prep Time</p>
                <p className="text-2xl font-bold">{handoverMetrics.averagePreparationTime}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Client Satisfaction</p>
                <p className="text-2xl font-bold">{handoverMetrics.clientSatisfactionScore}/5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Doc Accuracy</p>
                <p className="text-2xl font-bold">{handoverMetrics.documentationAccuracy}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="packages" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="packages">Handover Packages</TabsTrigger>
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="space-y-4">
          <div className="space-y-4">
            {handoverPackages.map((pkg) => (
              <Card key={pkg.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(pkg.status)}
                      <div>
                        <CardTitle className="text-lg">{pkg.projectName}</CardTitle>
                        <CardDescription>{pkg.clientName}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(pkg.status)}>
                        {pkg.status}
                      </Badge>
                      {pkg.status === 'ready' && (
                        <Button
                          size="sm"
                          onClick={() => deliverPackage(pkg.id)}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Deliver
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Package Preparation</span>
                        <span>{Math.round(pkg.progress)}%</span>
                      </div>
                      <Progress value={pkg.progress} className="w-full" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div className={`flex items-center gap-2 p-2 rounded ${pkg.components.documentation ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">Docs</span>
                        {pkg.components.documentation && <CheckCircle className="h-3 w-3" />}
                      </div>
                      <div className={`flex items-center gap-2 p-2 rounded ${pkg.components.credentials ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        <Key className="h-4 w-4" />
                        <span className="text-sm">Creds</span>
                        {pkg.components.credentials && <CheckCircle className="h-3 w-3" />}
                      </div>
                      <div className={`flex items-center gap-2 p-2 rounded ${pkg.components.codebase ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        <Package className="h-4 w-4" />
                        <span className="text-sm">Code</span>
                        {pkg.components.codebase && <CheckCircle className="h-3 w-3" />}
                      </div>
                      <div className={`flex items-center gap-2 p-2 rounded ${pkg.components.deployment ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        <Server className="h-4 w-4" />
                        <span className="text-sm">Deploy</span>
                        {pkg.components.deployment && <CheckCircle className="h-3 w-3" />}
                      </div>
                      <div className={`flex items-center gap-2 p-2 rounded ${pkg.components.training ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        <BookOpen className="h-4 w-4" />
                        <span className="text-sm">Training</span>
                        {pkg.components.training && <CheckCircle className="h-3 w-3" />}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Created</p>
                        <p className="font-medium">{pkg.createdAt.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Delivery Method</p>
                        <p className="font-medium capitalize">{pkg.deliveryMethod.replace('-', ' ')}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="credentials" className="space-y-4">
          <div className="grid gap-4">
            {credentials.map((credential) => (
              <Card key={credential.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getCredentialIcon(credential.type)}
                      <div>
                        <h4 className="font-medium">{credential.name}</h4>
                        <p className="text-sm text-gray-600">{credential.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={credential.secured ? 'default' : 'secondary'}
                        className={credential.secured ? 'bg-green-500' : 'bg-yellow-500'}
                      >
                        {credential.secured ? 'Secured' : 'Pending'}
                      </Badge>
                      {!credential.secured && (
                        <Button
                          size="sm"
                          onClick={() => secureCredential(credential.id)}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Secure
                        </Button>
                      )}
                    </div>
                  </div>
                  {credential.expiresAt && (
                    <div className="mt-2 text-sm text-gray-600">
                      Expires: {credential.expiresAt.toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-4">
          <div className="grid gap-4">
            {documentationTemplates.map((template) => (
              <Card key={template.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getDocumentationIcon(template.type)}
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-gray-600 capitalize">{template.type.replace('-', ' ')} documentation</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={template.status === 'generated' ? 'default' : 'secondary'}
                        className={
                          template.status === 'generated' ? 'bg-green-500' :
                          template.status === 'ready' ? 'bg-blue-500' : 'bg-gray-500'
                        }
                      >
                        {template.status}
                      </Badge>
                      {template.status === 'ready' && (
                        <Button
                          size="sm"
                          onClick={() => generateDocumentation(template.id)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Generate
                        </Button>
                      )}
                      {template.status === 'generated' && (
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Last updated: {template.lastUpdated.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Handover Package</CardTitle>
              <CardDescription>
                Generate automated handover package with documentation, credentials, and delivery components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    value={newHandover.clientName}
                    onChange={(e) => setNewHandover(prev => ({ ...prev, clientName: e.target.value }))}
                    placeholder="Enter client name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input
                    id="projectName"
                    value={newHandover.projectName}
                    onChange={(e) => setNewHandover(prev => ({ ...prev, projectName: e.target.value }))}
                    placeholder="Enter project name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={newHandover.clientEmail}
                  onChange={(e) => setNewHandover(prev => ({ ...prev, clientEmail: e.target.value }))}
                  placeholder="client@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryMethod">Delivery Method</Label>
                <select
                  id="deliveryMethod"
                  value={newHandover.deliveryMethod}
                  onChange={(e) => setNewHandover(prev => ({ ...prev, deliveryMethod: e.target.value as any }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="secure-link">Secure Link</option>
                  <option value="email">Email</option>
                  <option value="portal">Client Portal</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeTraining"
                  checked={newHandover.includeTraining}
                  onChange={(e) => setNewHandover(prev => ({ ...prev, includeTraining: e.target.checked }))}
                />
                <Label htmlFor="includeTraining">Include training materials</Label>
              </div>

              <Alert>
                <Package className="h-4 w-4" />
                <AlertTitle>Automated Package Components</AlertTitle>
                <AlertDescription>
                  The handover package will automatically include documentation generation, credential management,
                  codebase delivery, and deployment instructions. Process streamlined for efficient client handover.
                </AlertDescription>
              </Alert>

              <Button
                onClick={createHandoverPackage}
                disabled={!newHandover.clientName || !newHandover.projectName}
                className="w-full"
              >
                <Package className="h-4 w-4 mr-2" />
                Create Handover Package
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}