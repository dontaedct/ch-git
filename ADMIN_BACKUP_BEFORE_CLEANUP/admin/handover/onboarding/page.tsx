'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Clock,
  BookOpen,
  Award,
  MessageSquare,
  Settings,
  RefreshCw
} from 'lucide-react';

interface OnboardingProgram {
  id: string;
  clientId: string;
  templateId: string;
  title: string;
  description: string;
  estimatedDuration: number;
  completionRate: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
  startedAt?: Date;
  completedAt?: Date;
  currentStep: number;
  totalSteps: number;
}

interface OnboardingStep {
  id: string;
  title: string;
  type: 'video' | 'document' | 'interactive' | 'task' | 'assessment';
  estimatedTime: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  completionRate: number;
}

interface OnboardingMetrics {
  totalPrograms: number;
  activePrograms: number;
  completedPrograms: number;
  averageCompletionTime: number;
  averageCompletionRate: number;
  engagementScore: number;
}

export default function OnboardingManagementPage() {
  const [programs, setPrograms] = useState<OnboardingProgram[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<OnboardingProgram | null>(null);
  const [metrics, setMetrics] = useState<OnboardingMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  useEffect(() => {
    const mockPrograms: OnboardingProgram[] = [
      {
        id: 'prog_1',
        clientId: 'client_1',
        templateId: 'template_saas',
        title: 'SaaS Dashboard Onboarding',
        description: 'Complete onboarding for SaaS dashboard application',
        estimatedDuration: 120,
        completionRate: 75,
        status: 'in_progress',
        startedAt: new Date('2024-01-15'),
        currentStep: 3,
        totalSteps: 7
      },
      {
        id: 'prog_2',
        clientId: 'client_2',
        templateId: 'template_ecommerce',
        title: 'E-commerce Platform Training',
        description: 'Comprehensive training for e-commerce management',
        estimatedDuration: 180,
        completionRate: 100,
        status: 'completed',
        startedAt: new Date('2024-01-10'),
        completedAt: new Date('2024-01-18'),
        currentStep: 8,
        totalSteps: 8
      },
      {
        id: 'prog_3',
        clientId: 'client_3',
        templateId: 'template_portfolio',
        title: 'Portfolio Website Management',
        description: 'Basic training for portfolio website management',
        estimatedDuration: 60,
        completionRate: 25,
        status: 'paused',
        startedAt: new Date('2024-01-20'),
        currentStep: 1,
        totalSteps: 4
      }
    ];

    const mockMetrics: OnboardingMetrics = {
      totalPrograms: 3,
      activePrograms: 1,
      completedPrograms: 1,
      averageCompletionTime: 4.5,
      averageCompletionRate: 66.7,
      engagementScore: 82
    };

    setPrograms(mockPrograms);
    setMetrics(mockMetrics);
    setSelectedProgram(mockPrograms[0]);
    setIsLoading(false);
  }, []);

  const createNewProgram = () => {
    // Implementation for creating new onboarding program
    console.log('Creating new onboarding program');
  };

  const startProgram = (programId: string) => {
    setPrograms(prev => prev.map(p =>
      p.id === programId
        ? { ...p, status: 'in_progress' as const, startedAt: new Date() }
        : p
    ));
  };

  const pauseProgram = (programId: string) => {
    setPrograms(prev => prev.map(p =>
      p.id === programId
        ? { ...p, status: 'paused' as const }
        : p
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <Play className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Onboarding Management</h1>
          <p className="text-muted-foreground">
            Manage automated onboarding programs and track client progress
          </p>
        </div>
        <Button onClick={createNewProgram}>
          <Users className="mr-2 h-4 w-4" />
          Create Program
        </Button>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalPrograms}</div>
              <p className="text-xs text-muted-foreground">
                Active onboarding programs
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.averageCompletionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Average across all programs
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.averageCompletionTime}d</div>
              <p className="text-xs text-muted-foreground">
                To complete onboarding
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.engagementScore}/100</div>
              <p className="text-xs text-muted-foreground">
                Overall engagement score
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Programs Overview</TabsTrigger>
          <TabsTrigger value="details">Program Details</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Programs</CardTitle>
              <CardDescription>
                Monitor and manage all client onboarding programs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Program</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {programs.map((program) => (
                    <TableRow key={program.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{program.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {program.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{program.clientId}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(program.status)}>
                          {getStatusIcon(program.status)}
                          <span className="ml-1">{program.status.replace('_', ' ')}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Progress value={program.completionRate} className="w-20" />
                          <div className="text-sm text-muted-foreground">
                            {program.currentStep}/{program.totalSteps} steps
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{program.estimatedDuration}m</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {program.status === 'not_started' && (
                            <Button
                              size="sm"
                              onClick={() => startProgram(program.id)}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          {program.status === 'in_progress' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => pauseProgram(program.id)}
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedProgram(program)}
                          >
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {selectedProgram ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Program Details</CardTitle>
                  <CardDescription>
                    {selectedProgram.title}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Client ID</Label>
                      <p className="text-sm text-muted-foreground">{selectedProgram.clientId}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Template</Label>
                      <p className="text-sm text-muted-foreground">{selectedProgram.templateId}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <Badge className={getStatusColor(selectedProgram.status)}>
                        {selectedProgram.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Progress</Label>
                      <div className="space-y-2">
                        <Progress value={selectedProgram.completionRate} />
                        <p className="text-sm text-muted-foreground">
                          {selectedProgram.completionRate}% complete
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedProgram.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Started</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedProgram.startedAt?.toLocaleDateString() || 'Not started'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Estimated Duration</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedProgram.estimatedDuration} minutes
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Step Progress</CardTitle>
                  <CardDescription>
                    Individual step completion status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.from({ length: selectedProgram.totalSteps }, (_, i) => {
                      const stepNumber = i + 1;
                      const isCompleted = stepNumber <= selectedProgram.currentStep;
                      const isCurrent = stepNumber === selectedProgram.currentStep + 1;

                      return (
                        <div
                          key={stepNumber}
                          className={`flex items-center space-x-3 p-2 rounded-lg ${
                            isCompleted ? 'bg-green-50' :
                            isCurrent ? 'bg-blue-50' : 'bg-gray-50'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                            isCompleted ? 'bg-green-500 text-white' :
                            isCurrent ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                          }`}>
                            {isCompleted ? '✓' : stepNumber}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              Step {stepNumber}: Training Module {stepNumber}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {isCompleted ? 'Completed' :
                               isCurrent ? 'In Progress' : 'Pending'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a program to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Analytics</CardTitle>
              <CardDescription>
                Detailed analytics and insights for onboarding programs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Completion Trends</h4>
                  <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Analytics Chart Placeholder</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Engagement Metrics</h4>
                  <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Engagement Chart Placeholder</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Settings</CardTitle>
              <CardDescription>
                Configure onboarding automation and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="defaultDuration">Default Program Duration (minutes)</Label>
                  <Input id="defaultDuration" placeholder="120" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reminderFrequency">Reminder Frequency</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="escalationThreshold">Escalation Threshold (hours)</Label>
                  <Input id="escalationThreshold" placeholder="24" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="completionReward">Completion Reward</Label>
                  <Input id="completionReward" placeholder="Certificate" />
                </div>
              </div>

              <div className="pt-4">
                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}