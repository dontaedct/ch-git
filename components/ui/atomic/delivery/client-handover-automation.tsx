/**
 * @fileoverview HT-022.4.2: Client Handover Automation Component
 * @module components/ui/atomic/delivery
 * @author Agency Component System
 * @version 1.0.0
 *
 * CLIENT HANDOVER AUTOMATION: Streamlined client handover process
 * Features:
 * - Automated documentation generation
 * - Client asset packaging
 * - Deployment instruction creation
 * - Quality assurance reports
 * - Handover checklist automation
 */

'use client';

import React, { useState, useCallback } from 'react';
import { SimpleClientTheme } from '../theming/simple-theme-provider';
import { DeliveryPipelineResult } from '@/lib/delivery/simple-delivery-pipeline';
import { Button, Input, Label } from '../atoms';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../molecules';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../molecules';
import { Badge } from '../atoms';
import {
  FileText,
  Package,
  CheckSquare,
  Download,
  Send,
  User,
  Mail,
  Calendar,
  ExternalLink,
  ClipboardCheck,
  Settings,
  Globe,
  Shield
} from 'lucide-react';

interface HandoverChecklist {
  id: string;
  category: string;
  title: string;
  description: string;
  required: boolean;
  completed: boolean;
  automatable: boolean;
}

interface ClientContact {
  name: string;
  email: string;
  role: string;
  primary: boolean;
}

interface HandoverPackage {
  clientName: string;
  projectName: string;
  theme: SimpleClientTheme;
  deliveryResult: DeliveryPipelineResult;
  contacts: ClientContact[];
  deploymentInstructions: string;
  supportInformation: string;
  checklist: HandoverChecklist[];
  scheduledHandover?: Date;
}

interface ClientHandoverAutomationProps {
  theme: SimpleClientTheme;
  deliveryResult: DeliveryPipelineResult;
  clientName: string;
  onComplete?: (handoverPackage: HandoverPackage) => void;
  className?: string;
}

const DEFAULT_CHECKLIST: Omit<HandoverChecklist, 'id' | 'completed'>[] = [
  {
    category: 'Technical',
    title: 'Theme Configuration Validated',
    description: 'Verify theme configuration is correct and accessible',
    required: true,
    automatable: true
  },
  {
    category: 'Technical',
    title: 'Quality Gates Passed',
    description: 'All automated quality gates have passed validation',
    required: true,
    automatable: true
  },
  {
    category: 'Technical',
    title: 'Performance Benchmarks Met',
    description: 'Performance targets achieved (render time, bundle size)',
    required: true,
    automatable: true
  },
  {
    category: 'Technical',
    title: 'Accessibility Compliance',
    description: 'WCAG 2.1 AA compliance validated',
    required: true,
    automatable: true
  },
  {
    category: 'Documentation',
    title: 'Client Documentation Generated',
    description: 'Complete implementation guide and brand guidelines',
    required: true,
    automatable: true
  },
  {
    category: 'Documentation',
    title: 'Deployment Guide Created',
    description: 'Step-by-step deployment instructions',
    required: true,
    automatable: true
  },
  {
    category: 'Documentation',
    title: 'Support Documentation',
    description: 'Troubleshooting and maintenance guidelines',
    required: true,
    automatable: true
  },
  {
    category: 'Assets',
    title: 'Brand Assets Packaged',
    description: 'Logo files, color palettes, and brand assets',
    required: true,
    automatable: true
  },
  {
    category: 'Assets',
    title: 'Configuration Files',
    description: 'Theme configuration and deployment files',
    required: true,
    automatable: true
  },
  {
    category: 'Assets',
    title: 'Code Examples',
    description: 'Implementation examples and starter templates',
    required: false,
    automatable: true
  },
  {
    category: 'Client',
    title: 'Client Training Scheduled',
    description: 'Training session for client team members',
    required: false,
    automatable: false
  },
  {
    category: 'Client',
    title: 'Support Contacts Provided',
    description: 'Emergency contacts and support procedures',
    required: true,
    automatable: false
  },
  {
    category: 'Client',
    title: 'Feedback Collection Setup',
    description: 'System for collecting client feedback and issues',
    required: false,
    automatable: false
  },
  {
    category: 'Deployment',
    title: 'Staging Environment Verified',
    description: 'Client can access and validate staging deployment',
    required: true,
    automatable: false
  },
  {
    category: 'Deployment',
    title: 'Production Deployment Plan',
    description: 'Deployment timeline and rollback procedures',
    required: true,
    automatable: false
  },
  {
    category: 'Deployment',
    title: 'Domain Configuration',
    description: 'Client domain setup and SSL certificate validation',
    required: false,
    automatable: false
  }
];

export function ClientHandoverAutomation({
  theme,
  deliveryResult,
  clientName,
  onComplete,
  className
}: ClientHandoverAutomationProps) {
  const [handoverPackage, setHandoverPackage] = useState<HandoverPackage>({
    clientName,
    projectName: `${clientName} Brand Implementation`,
    theme,
    deliveryResult,
    contacts: [
      {
        name: '',
        email: '',
        role: 'Project Manager',
        primary: true
      }
    ],
    deploymentInstructions: '',
    supportInformation: '',
    checklist: DEFAULT_CHECKLIST.map((item, index) => ({
      ...item,
      id: `checklist-${index}`,
      completed: item.automatable // Auto-complete automatable items
    }))
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('checklist');

  const updatePackage = useCallback((updates: Partial<HandoverPackage>) => {
    setHandoverPackage(prev => ({ ...prev, ...updates }));
  }, []);

  const updateContact = useCallback((index: number, updates: Partial<ClientContact>) => {
    setHandoverPackage(prev => ({
      ...prev,
      contacts: prev.contacts.map((contact, i) =>
        i === index ? { ...contact, ...updates } : contact
      )
    }));
  }, []);

  const addContact = useCallback(() => {
    setHandoverPackage(prev => ({
      ...prev,
      contacts: [
        ...prev.contacts,
        {
          name: '',
          email: '',
          role: 'Team Member',
          primary: false
        }
      ]
    }));
  }, []);

  const toggleChecklistItem = useCallback((itemId: string) => {
    setHandoverPackage(prev => ({
      ...prev,
      checklist: prev.checklist.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    }));
  }, []);

  const autoCompleteChecklist = useCallback(() => {
    setIsGenerating(true);

    // Simulate automatic completion of automatable tasks
    setTimeout(() => {
      setHandoverPackage(prev => ({
        ...prev,
        checklist: prev.checklist.map(item =>
          item.automatable ? { ...item, completed: true } : item
        ),
        deploymentInstructions: generateDeploymentInstructions(theme, deliveryResult),
        supportInformation: generateSupportInformation(clientName, theme)
      }));
      setIsGenerating(false);
    }, 2000);
  }, [theme, deliveryResult, clientName]);

  const generateHandoverPackage = useCallback(async () => {
    setIsGenerating(true);

    try {
      // Generate complete handover documentation
      const documentation = generateCompleteDocumentation(handoverPackage);

      // Create downloadable package
      const packageData = {
        ...handoverPackage,
        generatedAt: new Date().toISOString(),
        documentation,
        completionStatus: {
          totalTasks: handoverPackage.checklist.length,
          completedTasks: handoverPackage.checklist.filter(item => item.completed).length,
          requiredTasks: handoverPackage.checklist.filter(item => item.required).length,
          completedRequiredTasks: handoverPackage.checklist.filter(item => item.required && item.completed).length
        }
      };

      // Download package
      const blob = new Blob([JSON.stringify(packageData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${clientName.toLowerCase().replace(/\s+/g, '-')}-handover-package.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Also download documentation as markdown
      const docBlob = new Blob([documentation], { type: 'text/markdown' });
      const docUrl = URL.createObjectURL(docBlob);
      const docLink = document.createElement('a');
      docLink.href = docUrl;
      docLink.download = `${clientName.toLowerCase().replace(/\s+/g, '-')}-handover-guide.md`;
      document.body.appendChild(docLink);
      docLink.click();
      document.body.removeChild(docLink);
      URL.revokeObjectURL(docUrl);

      onComplete?.(handoverPackage);

    } catch (error) {
      console.error('Failed to generate handover package:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [handoverPackage, clientName, onComplete]);

  const completionStats = {
    total: handoverPackage.checklist.length,
    completed: handoverPackage.checklist.filter(item => item.completed).length,
    required: handoverPackage.checklist.filter(item => item.required).length,
    completedRequired: handoverPackage.checklist.filter(item => item.required && item.completed).length
  };

  const isReadyForHandover = completionStats.completedRequired === completionStats.required;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Client Handover Automation
            </CardTitle>
            <CardDescription>
              Streamlined handover process for {clientName}
            </CardDescription>
          </div>
          <Badge variant={isReadyForHandover ? "default" : "secondary"}>
            {completionStats.completed}/{completionStats.total} Complete
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="documentation">Documentation</TabsTrigger>
            <TabsTrigger value="package">Package</TabsTrigger>
          </TabsList>

          {/* Handover Checklist */}
          <TabsContent value="checklist" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Handover Checklist</h3>
                <p className="text-sm text-muted-foreground">
                  {completionStats.completedRequired}/{completionStats.required} required tasks completed
                </p>
              </div>
              <Button
                onClick={autoCompleteChecklist}
                disabled={isGenerating}
                variant="outline"
              >
                <Settings className="h-4 w-4 mr-2" />
                Auto Complete
              </Button>
            </div>

            <div className="space-y-3">
              {Object.entries(
                handoverPackage.checklist.reduce((acc, item) => {
                  if (!acc[item.category]) acc[item.category] = [];
                  acc[item.category].push(item);
                  return acc;
                }, {} as Record<string, HandoverChecklist[]>)
              ).map(([category, items]) => (
                <div key={category} className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    {category}
                  </h4>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        item.completed ? 'bg-green-50 border-green-200' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => !item.automatable && toggleChecklistItem(item.id)}
                    >
                      <div className="pt-1">
                        {item.completed ? (
                          <CheckSquare className="h-4 w-4 text-green-600" />
                        ) : (
                          <div className="h-4 w-4 border rounded border-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {item.title}
                          </span>
                          {item.required && (
                            <Badge variant="outline" className="text-xs">Required</Badge>
                          )}
                          {item.automatable && (
                            <Badge variant="secondary" className="text-xs">Auto</Badge>
                          )}
                        </div>
                        <p className={`text-sm mt-1 ${item.completed ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Client Contacts */}
          <TabsContent value="contacts" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Client Contacts</h3>
                <p className="text-sm text-muted-foreground">
                  Key contacts for project handover
                </p>
              </div>
              <Button onClick={addContact} variant="outline">
                <User className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </div>

            <div className="space-y-3">
              {handoverPackage.contacts.map((contact, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {contact.primary && (
                      <Badge variant="default" className="text-xs">Primary</Badge>
                    )}
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={contact.name}
                        onChange={(e) => updateContact(index, { name: e.target.value })}
                        placeholder="Contact name"
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={contact.email}
                        onChange={(e) => updateContact(index, { email: e.target.value })}
                        placeholder="contact@client.com"
                      />
                    </div>
                    <div>
                      <Label>Role</Label>
                      <select
                        value={contact.role}
                        onChange={(e) => updateContact(index, { role: e.target.value })}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      >
                        <option value="Project Manager">Project Manager</option>
                        <option value="Technical Lead">Technical Lead</option>
                        <option value="Designer">Designer</option>
                        <option value="Developer">Developer</option>
                        <option value="Stakeholder">Stakeholder</option>
                        <option value="Team Member">Team Member</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Documentation */}
          <TabsContent value="documentation" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Documentation Generation</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Automated documentation and deployment instructions
              </p>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="deployment-instructions">Deployment Instructions</Label>
                  <textarea
                    id="deployment-instructions"
                    value={handoverPackage.deploymentInstructions}
                    onChange={(e) => updatePackage({ deploymentInstructions: e.target.value })}
                    className="w-full h-32 px-3 py-2 rounded-md border border-input bg-background resize-none"
                    placeholder="Deployment instructions will be generated automatically..."
                  />
                </div>

                <div>
                  <Label htmlFor="support-information">Support Information</Label>
                  <textarea
                    id="support-information"
                    value={handoverPackage.supportInformation}
                    onChange={(e) => updatePackage({ supportInformation: e.target.value })}
                    className="w-full h-32 px-3 py-2 rounded-md border border-input bg-background resize-none"
                    placeholder="Support information will be generated automatically..."
                  />
                </div>

                <div>
                  <Label htmlFor="handover-date">Scheduled Handover Date</Label>
                  <Input
                    id="handover-date"
                    type="datetime-local"
                    value={handoverPackage.scheduledHandover ?
                      handoverPackage.scheduledHandover.toISOString().slice(0, 16) : ''
                    }
                    onChange={(e) => updatePackage({
                      scheduledHandover: e.target.value ? new Date(e.target.value) : undefined
                    })}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Final Package */}
          <TabsContent value="package" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Handover Package</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Generate complete handover package for client delivery
              </p>

              {/* Package Summary */}
              <div className="grid gap-4 md:grid-cols-2 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckSquare className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Completion Status</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round((completionStats.completed / completionStats.total) * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {completionStats.completed}/{completionStats.total} tasks completed
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Ready for Delivery</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {isReadyForHandover ? 'Yes' : 'No'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {completionStats.completedRequired}/{completionStats.required} required tasks
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Package Contents */}
              <div className="space-y-3 mb-6">
                <h4 className="font-medium">Package Contents</h4>
                <div className="grid gap-2">
                  {[
                    { name: 'Client Handover Guide', icon: FileText, type: 'Markdown' },
                    { name: 'Theme Configuration', icon: Package, type: 'JSON' },
                    { name: 'Deployment Instructions', icon: Globe, type: 'Documentation' },
                    { name: 'Quality Assurance Report', icon: Shield, type: 'Report' },
                    { name: 'Contact Information', icon: User, type: 'Directory' },
                    { name: 'Support Documentation', icon: Settings, type: 'Guide' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 border rounded">
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1">{item.name}</span>
                      <Badge variant="outline" className="text-xs">{item.type}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generate Package */}
              <div className="flex gap-2">
                <Button
                  onClick={generateHandoverPackage}
                  disabled={isGenerating || !isReadyForHandover}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <Package className="h-4 w-4 mr-2 animate-pulse" />
                      Generating Package...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Generate Handover Package
                    </>
                  )}
                </Button>
                <Button variant="outline" disabled={!isReadyForHandover}>
                  <Send className="h-4 w-4 mr-2" />
                  Send to Client
                </Button>
              </div>

              {!isReadyForHandover && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Complete all required tasks before generating package
                    </span>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Helper functions for documentation generation
function generateDeploymentInstructions(theme: SimpleClientTheme, deliveryResult: DeliveryPipelineResult): string {
  return `# Deployment Instructions

## 1. Theme Configuration
- Import the provided theme configuration JSON file
- Apply theme using SimpleThemeProvider wrapper
- Verify theme switching functionality

## 2. Environment Setup
- Deploy to staging environment first
- Run quality validation checks
- Test performance benchmarks

## 3. Production Deployment
- Configure domain and SSL certificates
- Deploy theme configuration
- Monitor performance metrics
- Validate accessibility compliance

## 4. Post-Deployment
- Run smoke tests on all components
- Verify mobile responsiveness
- Test theme switching performance
- Validate color contrast ratios

Delivery ID: ${deliveryResult.deliveryId}
Estimated deployment time: 1-2 hours`;
}

function generateSupportInformation(clientName: string, theme: SimpleClientTheme): string {
  return `# Support Information for ${clientName}

## Technical Support
- **Theme ID:** ${theme.id}
- **Primary Color:** ${theme.colors.primary}
- **Font Family:** ${theme.typography.fontFamily}

## Performance Targets
- Component render time: <200ms
- Theme switching: <100ms
- Bundle size impact: <500KB

## Troubleshooting
- Clear browser cache if theme doesn't apply
- Verify theme ID matches configuration
- Check console for JavaScript errors
- Validate color contrast in accessibility tools

## Emergency Contacts
- Development Team: [Contact Information]
- Technical Support: [Support Email]
- Project Manager: [PM Contact]

Generated on: ${new Date().toLocaleString()}`;
}

function generateCompleteDocumentation(handoverPackage: HandoverPackage): string {
  return `# ${handoverPackage.clientName} - Complete Handover Documentation

## Project Summary
- **Client:** ${handoverPackage.clientName}
- **Project:** ${handoverPackage.projectName}
- **Theme:** ${handoverPackage.theme.name}
- **Delivery Status:** ${handoverPackage.deliveryResult.success ? 'SUCCESS' : 'FAILED'}

## Handover Checklist Status
- **Total Tasks:** ${handoverPackage.checklist.length}
- **Completed:** ${handoverPackage.checklist.filter(item => item.completed).length}
- **Required Tasks:** ${handoverPackage.checklist.filter(item => item.required).length}
- **Required Completed:** ${handoverPackage.checklist.filter(item => item.required && item.completed).length}

## Client Contacts
${handoverPackage.contacts.map(contact => `
- **${contact.name}** (${contact.role})${contact.primary ? ' - Primary' : ''}
  - Email: ${contact.email}
`).join('')}

## Deployment Instructions
${handoverPackage.deploymentInstructions}

## Support Information
${handoverPackage.supportInformation}

## Next Steps
1. Complete any remaining checklist items
2. Schedule client training session
3. Deploy to production environment
4. Monitor performance and gather feedback

Generated on: ${new Date().toLocaleString()}
Package ID: handover-${Date.now()}`;
}