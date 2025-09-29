'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Play,
  Pause,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  Award,
  AlertTriangle,
  BookOpen,
  Video,
  FileText,
  Star,
  Calendar
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'document' | 'interactive' | 'task' | 'assessment';
  estimatedTime: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  score?: number;
  startedAt?: Date;
  completedAt?: Date;
}

interface OnboardingProgress {
  userId: string;
  programId: string;
  overallStatus: 'not_started' | 'in_progress' | 'completed' | 'paused';
  completionPercentage: number;
  totalTimeSpent: number;
  currentStep: number;
  steps: OnboardingStep[];
  achievements: string[];
  engagementScore: number;
}

interface OnboardingAlert {
  id: string;
  type: 'stalled' | 'behind_schedule' | 'low_engagement' | 'milestone_reached';
  severity: 'low' | 'medium' | 'high';
  message: string;
  triggeredAt: Date;
  acknowledged: boolean;
}

interface OnboardingDashboardProps {
  userId: string;
  programId: string;
  onStepComplete?: (stepId: string, score?: number) => void;
  onProgramPause?: () => void;
  onProgramResume?: () => void;
}

export default function OnboardingDashboard({
  userId,
  programId,
  onStepComplete,
  onProgramPause,
  onProgramResume
}: OnboardingDashboardProps) {
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [alerts, setAlerts] = useState<OnboardingAlert[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data
  useEffect(() => {
    const mockProgress: OnboardingProgress = {
      userId,
      programId,
      overallStatus: 'in_progress',
      completionPercentage: 60,
      totalTimeSpent: 3600, // 1 hour in seconds
      currentStep: 3,
      engagementScore: 85,
      achievements: ['fast_learner', 'consistent_learner'],
      steps: [
        {
          id: 'welcome',
          title: 'Welcome & Overview',
          description: 'Introduction to your new application',
          type: 'video',
          estimatedTime: 10,
          status: 'completed',
          score: 95,
          startedAt: new Date('2024-01-15T09:00:00'),
          completedAt: new Date('2024-01-15T09:10:00')
        },
        {
          id: 'admin_access',
          title: 'Admin Access Setup',
          description: 'Set up your administrator account',
          type: 'interactive',
          estimatedTime: 15,
          status: 'completed',
          score: 88,
          startedAt: new Date('2024-01-15T09:15:00'),
          completedAt: new Date('2024-01-15T09:30:00')
        },
        {
          id: 'basic_config',
          title: 'Basic Configuration',
          description: 'Configure basic settings and preferences',
          type: 'task',
          estimatedTime: 20,
          status: 'completed',
          score: 92,
          startedAt: new Date('2024-01-15T10:00:00'),
          completedAt: new Date('2024-01-15T10:20:00')
        },
        {
          id: 'feature_training',
          title: 'Core Features Training',
          description: 'Learn how to use the main features',
          type: 'interactive',
          estimatedTime: 30,
          status: 'in_progress',
          startedAt: new Date('2024-01-15T11:00:00')
        },
        {
          id: 'customization',
          title: 'Customization Guide',
          description: 'Learn how to customize your application',
          type: 'video',
          estimatedTime: 25,
          status: 'not_started'
        },
        {
          id: 'support_resources',
          title: 'Support & Resources',
          description: 'Learn about available support channels',
          type: 'document',
          estimatedTime: 10,
          status: 'not_started'
        },
        {
          id: 'final_assessment',
          title: 'Knowledge Assessment',
          description: 'Complete final assessment',
          type: 'assessment',
          estimatedTime: 20,
          status: 'not_started'
        }
      ]
    };

    const mockAlerts: OnboardingAlert[] = [
      {
        id: 'alert_1',
        type: 'milestone_reached',
        severity: 'low',
        message: 'Congratulations! You\'ve reached 50% completion.',
        triggeredAt: new Date('2024-01-15T10:30:00'),
        acknowledged: true
      }
    ];

    setProgress(mockProgress);
    setAlerts(mockAlerts);
    setIsLoading(false);
  }, [userId, programId]);

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      case 'interactive': return <Play className="h-4 w-4" />;
      case 'task': return <CheckCircle className="h-4 w-4" />;
      case 'assessment': return <Award className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'skipped': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'milestone_reached': return <Award className="h-4 w-4" />;
      case 'stalled': return <Clock className="h-4 w-4" />;
      case 'behind_schedule': return <AlertTriangle className="h-4 w-4" />;
      case 'low_engagement': return <TrendingUp className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const handleStepAction = (step: OnboardingStep, action: 'start' | 'complete' | 'skip') => {
    if (!progress) return;

    const updatedSteps = progress.steps.map(s => {
      if (s.id === step.id) {
        switch (action) {
          case 'start':
            return { ...s, status: 'in_progress' as const, startedAt: new Date() };
          case 'complete':
            const score = Math.floor(Math.random() * 20) + 80; // Mock score 80-100
            onStepComplete?.(step.id, score);
            return {
              ...s,
              status: 'completed' as const,
              score,
              completedAt: new Date()
            };
          case 'skip':
            return { ...s, status: 'skipped' as const };
        }
      }
      return s;
    });

    const completedSteps = updatedSteps.filter(s => s.status === 'completed' || s.status === 'skipped').length;
    const newCompletionPercentage = (completedSteps / updatedSteps.length) * 100;

    setProgress(prev => prev ? {
      ...prev,
      steps: updatedSteps,
      completionPercentage: newCompletionPercentage,
      currentStep: completedSteps
    } : null);
  };

  if (isLoading || !progress) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your Onboarding Progress</h2>
          <p className="text-muted-foreground">
            Complete your onboarding to get the most out of your application
          </p>
        </div>
        <div className="flex space-x-2">
          {progress.overallStatus === 'in_progress' && (
            <Button variant="outline" onClick={onProgramPause}>
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </Button>
          )}
          {progress.overallStatus === 'paused' && (
            <Button onClick={onProgramResume}>
              <Play className="mr-2 h-4 w-4" />
              Resume
            </Button>
          )}
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.completionPercentage.toFixed(0)}%</div>
            <Progress value={progress.completionPercentage} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(progress.totalTimeSpent)}</div>
            <p className="text-xs text-muted-foreground">
              Learning time invested
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.engagementScore}/100</div>
            <p className="text-xs text-muted-foreground">
              Keep up the great work!
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.achievements.length}</div>
            <p className="text-xs text-muted-foreground">
              Badges earned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg ${
                    alert.acknowledged ? 'bg-gray-50' : 'bg-blue-50'
                  }`}
                >
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {alert.triggeredAt.toLocaleString()}
                    </p>
                  </div>
                  <Badge
                    variant={alert.severity === 'high' ? 'destructive' : 'secondary'}
                  >
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Steps Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Steps</CardTitle>
              <CardDescription>
                Complete each step to finish your onboarding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progress.steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center space-x-4 p-4 rounded-lg border ${
                      step.status === 'completed' ? 'bg-green-50 border-green-200' :
                      step.status === 'in_progress' ? 'bg-blue-50 border-blue-200' :
                      'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.status === 'completed' ? 'bg-green-500 text-white' :
                      step.status === 'in_progress' ? 'bg-blue-500 text-white' :
                      'bg-gray-300 text-gray-600'
                    }`}>
                      {step.status === 'completed' ? '✓' : index + 1}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        {getStepIcon(step.type)}
                        <h4 className="font-medium">{step.title}</h4>
                        <Badge className={getStatusColor(step.status)}>
                          {step.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {step.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {step.estimatedTime}m
                        </span>
                        {step.score && (
                          <span className="flex items-center">
                            <Star className="mr-1 h-3 w-3" />
                            {step.score}%
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {step.status === 'not_started' && (
                        <Button
                          size="sm"
                          onClick={() => handleStepAction(step, 'start')}
                        >
                          Start
                        </Button>
                      )}
                      {step.status === 'in_progress' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStepAction(step, 'complete')}
                          >
                            Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStepAction(step, 'skip')}
                          >
                            Skip
                          </Button>
                        </>
                      )}
                      {step.status === 'completed' && (
                        <Button size="sm" variant="outline" disabled>
                          Completed
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Achievements</CardTitle>
              <CardDescription>
                Badges and achievements earned during onboarding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {progress.achievements.map((achievement) => (
                  <div
                    key={achievement}
                    className="flex items-center space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                  >
                    <Award className="h-8 w-8 text-yellow-600" />
                    <div>
                      <h4 className="font-medium text-yellow-800">
                        {achievement.replace('_', ' ').toUpperCase()}
                      </h4>
                      <p className="text-sm text-yellow-600">
                        Achievement unlocked!
                      </p>
                    </div>
                  </div>
                ))}

                {/* Placeholder for potential achievements */}
                <div className="flex items-center space-x-3 p-4 bg-gray-50 border border-gray-200 rounded-lg opacity-50">
                  <Award className="h-8 w-8 text-gray-400" />
                  <div>
                    <h4 className="font-medium text-gray-500">PERFECTIONIST</h4>
                    <p className="text-sm text-gray-400">
                      Complete all steps with 95%+ score
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Schedule</CardTitle>
              <CardDescription>
                Suggested timeline for completing your onboarding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progress.steps.map((step, index) => (
                  <div key={step.id} className="flex items-center space-x-4">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{step.title}</span>
                        <span className="text-sm text-muted-foreground">
                          Day {index + 1}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Estimated time: {step.estimatedTime} minutes
                      </p>
                    </div>
                    <Badge className={getStatusColor(step.status)}>
                      {step.status === 'completed' ? 'Done' :
                       step.status === 'in_progress' ? 'Active' : 'Upcoming'}
                    </Badge>
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