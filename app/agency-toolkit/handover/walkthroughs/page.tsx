/**
 * @fileoverview Walkthrough Creation Interface
 * @module app/agency-toolkit/handover/walkthroughs
 * @author OSS Hero Development Team
 * @version 1.0.0
 * @since 2025-09-23
 * 
 * HT-035.4.3: Interactive walkthrough creation interface for managing
 * automated video recording sessions and processing workflows.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { 
  Play, 
  Square, 
  Settings, 
  Video, 
  Download, 
  Share2, 
  Eye, 
  Clock, 
  Film, 
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  RotateCcw,
  Upload,
  ExternalLink,
  Copy,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

// Types for the walkthrough system
interface WalkthroughSession {
  sessionId: string;
  status: 'preparing' | 'recording' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: {
    currentStep: number;
    totalSteps: number;
    percentage: number;
    estimatedTimeRemaining: number;
    currentStepName: string;
  };
  scenario: {
    type: string;
    name: string;
    description: string;
    stepCount: number;
  };
  configuration: {
    resolution: { width: number; height: number };
    quality: string;
    duration: { target: number; minimum: number; maximum: number };
    brandingEnabled: boolean;
  };
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  result?: {
    videoAsset: {
      url: string;
      duration: number;
      size: number;
      resolution: { width: number; height: number };
    };
    quality: {
      overallScore: number;
      videoQuality: number;
      audioQuality: number;
    };
    chapters: number;
    annotations: number;
  };
  error?: {
    type: string;
    message: string;
    recoverable: boolean;
  };
  processing?: Array<{
    type: 'video_editing' | 'loom_upload';
    sessionId: string;
    status: string;
    progress: any;
  }>;
}

interface ClientConfig {
  id: string;
  name: string;
  domain: string;
  tier: 'basic' | 'standard' | 'premium' | 'enterprise';
  contactInfo: {
    primaryContact: {
      name: string;
      email: string;
      role: string;
      preferredContactMethod: 'email' | 'phone' | 'slack' | 'teams';
    };
    technicalContact: {
      name: string;
      email: string;
      role: string;
      preferredContactMethod: 'email' | 'phone' | 'slack' | 'teams';
    };
    emergencyContact: {
      name: string;
      email: string;
      phone: string;
      role: string;
      preferredContactMethod: 'email' | 'phone' | 'slack' | 'teams';
    };
  };
  brandingConfig: {
    colors: {
      primary: string;
      secondary: string;
    };
    fonts: {
      primary: string;
    };
  };
  technicalConfig: {
    productionUrl: string;
    adminUrls: {
      main: string;
      diagnostics: string;
      flags: string;
    };
  };
  customizations: Record<string, any>;
}

const SCENARIO_TYPES = [
  { value: 'admin_tour', label: 'Admin Dashboard Tour', description: 'Complete tour of admin features', duration: 120 },
  { value: 'user_onboarding', label: 'User Onboarding', description: 'Step-by-step user setup', duration: 90 },
  { value: 'feature_demo', label: 'Feature Demonstration', description: 'Showcase key features', duration: 150 },
  { value: 'troubleshooting', label: 'Troubleshooting Guide', description: 'Common issues and solutions', duration: 180 }
];

const QUALITY_OPTIONS = [
  { value: 'standard', label: 'Standard (720p)', description: 'Good quality, smaller file size' },
  { value: 'high', label: 'High (1080p)', description: 'Best quality, recommended' },
  { value: 'ultra', label: 'Ultra (4K)', description: 'Maximum quality, large file size' }
];

const PRIVACY_OPTIONS = [
  { value: 'unlisted', label: 'Unlisted', description: 'Only accessible via link' },
  { value: 'private', label: 'Private', description: 'Only accessible by you' },
  { value: 'public', label: 'Public', description: 'Discoverable by anyone' }
];

export default function WalkthroughsPage() {
  // State management
  const [activeSessions, setActiveSessions] = useState<WalkthroughSession[]>([]);
  const [completedSessions, setCompletedSessions] = useState<WalkthroughSession[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [cancelDialogSession, setCancelDialogSession] = useState<string | null>(null);
  
  // Form state
  const [clientConfig, setClientConfig] = useState<Partial<ClientConfig>>({
    name: 'Demo Client',
    domain: 'demo.example.com',
    tier: 'standard',
    contactInfo: {
      primaryContact: {
        name: 'John Doe',
        email: 'john@demo.example.com',
        role: 'Admin',
        preferredContactMethod: 'email'
      },
      technicalContact: {
        name: 'Jane Smith',
        email: 'jane@demo.example.com',
        role: 'Technical Lead',
        preferredContactMethod: 'email'
      },
      emergencyContact: {
        name: 'Emergency Contact',
        email: 'emergency@demo.example.com',
        phone: '+1-555-0123',
        role: 'IT Manager',
        preferredContactMethod: 'phone'
      }
    },
    brandingConfig: {
      colors: {
        primary: '#2563eb',
        secondary: '#64748b'
      },
      fonts: {
        primary: 'Inter'
      }
    },
    technicalConfig: {
      productionUrl: 'https://demo.example.com',
      adminUrls: {
        main: 'https://demo.example.com/admin',
        diagnostics: 'https://demo.example.com/admin/diagnostics',
        flags: 'https://demo.example.com/admin/flags'
      }
    },
    customizations: {}
  });
  
  const [recordingSettings, setRecordingSettings] = useState({
    scenarioType: 'admin_tour' as const,
    quality: 'high' as const,
    duration: { target: 120, minimum: 90, maximum: 180 },
    resolution: { width: 1920, height: 1080 },
    audio: {
      enabled: true,
      voiceover: true,
      systemAudio: false
    },
    branding: {
      enabled: true,
      colors: {}
    },
    output: {
      uploadToLoom: false,
      loomApiKey: '',
      privacy: 'unlisted' as const
    }
  });

  // Load sessions on component mount
  useEffect(() => {
    loadSessions();
    
    // Set up polling for active sessions
    const interval = setInterval(() => {
      if (activeSessions.length > 0) {
        updateActiveSessions();
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [activeSessions.length]);

  const loadSessions = useCallback(async () => {
    try {
      // In a real implementation, this would load from localStorage or API
      const stored = localStorage.getItem('walkthrough-sessions');
      if (stored) {
        const sessions = JSON.parse(stored);
        const active = sessions.filter((s: WalkthroughSession) => 
          ['preparing', 'recording', 'processing'].includes(s.status)
        );
        const completed = sessions.filter((s: WalkthroughSession) => 
          ['completed', 'failed', 'cancelled'].includes(s.status)
        );
        
        setActiveSessions(active);
        setCompletedSessions(completed);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  }, []);

  const updateActiveSessions = useCallback(async () => {
    try {
      const updatedSessions = await Promise.all(
        activeSessions.map(async (session) => {
          try {
            const response = await fetch(`/api/handover/record-walkthrough?sessionId=${session.sessionId}`);
            if (response.ok) {
              const data = await response.json();
              return { ...session, ...data.data };
            }
            return session;
          } catch (error) {
            console.error(`Failed to update session ${session.sessionId}:`, error);
            return session;
          }
        })
      );
      
      setActiveSessions(updatedSessions.filter(s => 
        ['preparing', 'recording', 'processing'].includes(s.status)
      ));
      
      // Move completed sessions
      const newlyCompleted = updatedSessions.filter(s => 
        ['completed', 'failed', 'cancelled'].includes(s.status)
      );
      
      if (newlyCompleted.length > 0) {
        setCompletedSessions(prev => [...newlyCompleted, ...prev]);
        
        // Save to localStorage
        const allSessions = [...newlyCompleted, ...completedSessions];
        localStorage.setItem('walkthrough-sessions', JSON.stringify(allSessions));
        
        // Show completion notifications
        newlyCompleted.forEach(session => {
          if (session.status === 'completed') {
            toast.success(`Walkthrough "${session.scenario.name}" completed successfully!`);
          } else if (session.status === 'failed') {
            toast.error(`Walkthrough "${session.scenario.name}" failed: ${session.error?.message}`);
          }
        });
      }
      
    } catch (error) {
      console.error('Failed to update active sessions:', error);
    }
  }, [activeSessions, completedSessions]);

  const handleStartRecording = async () => {
    if (!clientConfig.name || !clientConfig.domain) {
      toast.error('Please fill in the required client configuration fields');
      return;
    }

    setIsCreating(true);
    
    try {
      const response = await fetch('/api/handover/record-walkthrough', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientConfig: {
            ...clientConfig,
            id: `client-${Date.now()}`
          },
          scenarioType: recordingSettings.scenarioType,
          recordingSettings,
          outputOptions: recordingSettings.output
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to start recording');
      }

      const data = await response.json();
      const newSession: WalkthroughSession = data.data;
      
      setActiveSessions(prev => [newSession, ...prev]);
      toast.success('Walkthrough recording started successfully!');
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start recording');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    try {
      const response = await fetch('/api/handover/record-walkthrough', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          reason: 'User requested cancellation'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to cancel recording');
      }

      // Remove from active sessions
      setActiveSessions(prev => prev.filter(s => s.sessionId !== sessionId));
      toast.success('Recording cancelled successfully');
      
    } catch (error) {
      console.error('Failed to cancel recording:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to cancel recording');
    } finally {
      setCancelDialogSession(null);
    }
  };

  const handleRetrySession = async (sessionId: string) => {
    // In a real implementation, this would retry a failed session
    toast.info('Retry functionality would be implemented here');
  };

  const handleDeleteSession = async (sessionId: string) => {
    setCompletedSessions(prev => prev.filter(s => s.sessionId !== sessionId));
    
    // Update localStorage
    const remainingSessions = completedSessions.filter(s => s.sessionId !== sessionId);
    localStorage.setItem('walkthrough-sessions', JSON.stringify(remainingSessions));
    
    toast.success('Session deleted successfully');
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'preparing':
      case 'recording':
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-yellow-100 text-yellow-800';
      case 'recording':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb < 1024 ? `${mb.toFixed(1)} MB` : `${(mb / 1024).toFixed(1)} GB`;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Walkthrough Videos</h1>
          <p className="text-muted-foreground">
            Create automated walkthrough videos for client handover
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button
            onClick={handleStartRecording}
            disabled={isCreating}
            className="bg-red-600 hover:bg-red-700"
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Start Recording
          </Button>
        </div>
      </div>

      {/* Configuration Panel */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Recording Configuration</CardTitle>
            <CardDescription>
              Configure client information and recording settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="client" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="client">Client Info</TabsTrigger>
                <TabsTrigger value="recording">Recording</TabsTrigger>
                <TabsTrigger value="output">Output</TabsTrigger>
                <TabsTrigger value="branding">Branding</TabsTrigger>
              </TabsList>
              
              <TabsContent value="client" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Client Name *</Label>
                    <Input
                      id="clientName"
                      value={clientConfig.name || ''}
                      onChange={(e) => setClientConfig(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter client name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientDomain">Domain *</Label>
                    <Input
                      id="clientDomain"
                      value={clientConfig.domain || ''}
                      onChange={(e) => setClientConfig(prev => ({ ...prev, domain: e.target.value }))}
                      placeholder="example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientTier">Client Tier</Label>
                    <Select
                      value={clientConfig.tier}
                      onValueChange={(value) => setClientConfig(prev => ({ 
                        ...prev, 
                        tier: value as ClientConfig['tier']
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productionUrl">Production URL</Label>
                    <Input
                      id="productionUrl"
                      value={clientConfig.technicalConfig?.productionUrl || ''}
                      onChange={(e) => setClientConfig(prev => ({
                        ...prev,
                        technicalConfig: {
                          ...prev.technicalConfig,
                          productionUrl: e.target.value,
                          adminUrls: {
                            main: `${e.target.value}/admin`,
                            diagnostics: `${e.target.value}/admin/diagnostics`,
                            flags: `${e.target.value}/admin/flags`
                          }
                        }
                      } as Partial<ClientConfig>))}
                      placeholder="https://client.example.com"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="recording" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scenarioType">Scenario Type</Label>
                    <Select
                      value={recordingSettings.scenarioType}
                      onValueChange={(value) => setRecordingSettings(prev => ({ 
                        ...prev, 
                        scenarioType: value as typeof prev.scenarioType
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SCENARIO_TYPES.map(scenario => (
                          <SelectItem key={scenario.value} value={scenario.value}>
                            <div>
                              <div className="font-medium">{scenario.label}</div>
                              <div className="text-sm text-muted-foreground">
                                {scenario.description} • {scenario.duration}s
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quality">Video Quality</Label>
                    <Select
                      value={recordingSettings.quality}
                      onValueChange={(value) => setRecordingSettings(prev => ({ 
                        ...prev, 
                        quality: value as typeof prev.quality
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {QUALITY_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-sm text-muted-foreground">
                                {option.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetDuration">Target Duration (seconds)</Label>
                    <Input
                      id="targetDuration"
                      type="number"
                      min={90}
                      max={180}
                      value={recordingSettings.duration.target}
                      onChange={(e) => setRecordingSettings(prev => ({
                        ...prev,
                        duration: {
                          ...prev.duration,
                          target: parseInt(e.target.value) || 120
                        }
                      }))}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="voiceover"
                        checked={recordingSettings.audio.voiceover}
                        onCheckedChange={(checked) => setRecordingSettings(prev => ({
                          ...prev,
                          audio: { ...prev.audio, voiceover: checked }
                        }))}
                      />
                      <Label htmlFor="voiceover">Include voiceover narration</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="systemAudio"
                        checked={recordingSettings.audio.systemAudio}
                        onCheckedChange={(checked) => setRecordingSettings(prev => ({
                          ...prev,
                          audio: { ...prev.audio, systemAudio: checked }
                        }))}
                      />
                      <Label htmlFor="systemAudio">Capture system audio</Label>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="output" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="uploadToLoom"
                      checked={recordingSettings.output.uploadToLoom}
                      onCheckedChange={(checked) => setRecordingSettings(prev => ({
                        ...prev,
                        output: { ...prev.output, uploadToLoom: checked }
                      }))}
                    />
                    <Label htmlFor="uploadToLoom">Upload to Loom automatically</Label>
                  </div>
                  
                  {recordingSettings.output.uploadToLoom && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-blue-200">
                      <div className="space-y-2">
                        <Label htmlFor="loomApiKey">Loom API Key</Label>
                        <Input
                          id="loomApiKey"
                          type="password"
                          value={recordingSettings.output.loomApiKey}
                          onChange={(e) => setRecordingSettings(prev => ({
                            ...prev,
                            output: { ...prev.output, loomApiKey: e.target.value }
                          }))}
                          placeholder="Enter your Loom API key"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="privacy">Privacy Setting</Label>
                        <Select
                          value={recordingSettings.output.privacy}
                          onValueChange={(value) => setRecordingSettings(prev => ({
                            ...prev,
                            output: { ...prev.output, privacy: value as typeof prev.output.privacy }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PRIVACY_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                <div>
                                  <div className="font-medium">{option.label}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {option.description}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="branding" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="brandingEnabled"
                      checked={recordingSettings.branding.enabled}
                      onCheckedChange={(checked) => setRecordingSettings(prev => ({
                        ...prev,
                        branding: { ...prev.branding, enabled: checked }
                      }))}
                    />
                    <Label htmlFor="brandingEnabled">Apply client branding</Label>
                  </div>
                  
                  {recordingSettings.branding.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-blue-200">
                      <div className="space-y-2">
                        <Label htmlFor="primaryColor">Primary Color</Label>
                        <Input
                          id="primaryColor"
                          type="color"
                          value={clientConfig.brandingConfig?.colors?.primary || '#2563eb'}
                          onChange={(e) => setClientConfig(prev => ({
                            ...prev,
                            brandingConfig: {
                              ...prev.brandingConfig,
                              colors: {
                                ...prev.brandingConfig?.colors,
                                primary: e.target.value
                              }
                            }
                          } as Partial<ClientConfig>))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="secondaryColor">Secondary Color</Label>
                        <Input
                          id="secondaryColor"
                          type="color"
                          value={clientConfig.brandingConfig?.colors?.secondary || '#64748b'}
                          onChange={(e) => setClientConfig(prev => ({
                            ...prev,
                            brandingConfig: {
                              ...prev.brandingConfig,
                              colors: {
                                ...prev.brandingConfig?.colors,
                                secondary: e.target.value
                              }
                            }
                          } as Partial<ClientConfig>))}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Active Recordings ({activeSessions.length})
            </CardTitle>
            <CardDescription>
              Currently recording or processing walkthrough videos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeSessions.map((session) => (
              <div key={session.sessionId} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(session.status)}
                    <div>
                      <h3 className="font-medium">{session.scenario.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {session.scenario.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(session.status)}>
                      {session.status.replace('_', ' ')}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCancelDialogSession(session.sessionId)}
                    >
                      <Square className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{session.progress.currentStepName}</span>
                    <span>
                      {session.progress.currentStep}/{session.progress.totalSteps} steps
                    </span>
                  </div>
                  <Progress value={session.progress.percentage} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {session.progress.percentage}% complete
                    </span>
                    <span>
                      {session.progress.estimatedTimeRemaining > 0 && 
                        `~${formatDuration(session.progress.estimatedTimeRemaining)} remaining`
                      }
                    </span>
                  </div>
                </div>

                {session.processing && session.processing.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <h4 className="text-sm font-medium mb-2">Post-Processing</h4>
                    <div className="space-y-1">
                      {session.processing.map((job, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            {job.type === 'video_editing' ? (
                              <Film className="h-3 w-3" />
                            ) : (
                              <Upload className="h-3 w-3" />
                            )}
                            {job.type.replace('_', ' ')}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {job.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Completed Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Completed Videos ({completedSessions.length})
          </CardTitle>
          <CardDescription>
            Previously recorded walkthrough videos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {completedSessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No completed recordings yet</p>
              <p className="text-sm">Start your first walkthrough recording above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedSessions.map((session) => (
                <div key={session.sessionId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(session.status)}
                      <div>
                        <h3 className="font-medium">{session.scenario.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Created {new Date(session.startedAt || '').toLocaleDateString()}
                          {session.duration && ` • ${formatDuration(session.duration)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                      {session.status === 'failed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRetrySession(session.sessionId)}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Retry
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSession(session.sessionId)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  {session.status === 'completed' && session.result && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Video Details</p>
                        <p className="text-xs text-muted-foreground">
                          Duration: {formatDuration(session.result.videoAsset.duration)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Size: {formatFileSize(session.result.videoAsset.size)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Quality: {session.result.quality.overallScore}%
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Content</p>
                        <p className="text-xs text-muted-foreground">
                          Chapters: {session.result.chapters}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Annotations: {session.result.annotations}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Actions</p>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(session.result!.videoAsset.url, '_blank')}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyLink(session.result!.videoAsset.url)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(session.result!.videoAsset.url + '/download', '_blank')}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {session.status === 'failed' && session.error && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-red-800">Error Details</p>
                        <p className="text-sm text-red-600 mt-1">{session.error.message}</p>
                        {session.error.recoverable && (
                          <p className="text-xs text-red-500 mt-1">This error can be retried</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={!!cancelDialogSession} onOpenChange={() => setCancelDialogSession(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Recording</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this recording session? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Recording</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelDialogSession && handleCancelSession(cancelDialogSession)}
              className="bg-red-600 hover:bg-red-700"
            >
              Cancel Recording
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
