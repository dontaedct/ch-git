'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Download,
  Share2,
  CheckCircle,
  Clock,
  Film,
  BookOpen,
  Zap,
  Settings,
  Maximize2,
  Volume2,
  VolumeX
} from 'lucide-react';

interface WalkthroughPreviewProps {
  walkthroughId: string;
  mode?: 'preview' | 'fullscreen' | 'embedded';
  onClose?: () => void;
}

interface WalkthroughData {
  id: string;
  metadata: {
    title: string;
    description: string;
    duration: number;
    format: string;
    language: string;
  };
  steps: WalkthroughStep[];
  resources: {
    screenshots: string[];
    videos: string[];
    assets: string[];
  };
}

interface WalkthroughStep {
  id: string;
  title: string;
  content: string;
  type: string;
  order: number;
  estimatedDuration: number;
  required: boolean;
  assets?: {
    screenshots: string[];
    videos: string[];
    annotations: any[];
  };
  interactions?: any;
}

export default function WalkthroughPreview({
  walkthroughId,
  mode = 'preview',
  onClose
}: WalkthroughPreviewProps) {
  const [walkthrough, setWalkthrough] = useState<WalkthroughData | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [viewMode, setViewMode] = useState<'step-by-step' | 'video' | 'interactive'>('step-by-step');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWalkthrough();
  }, [walkthroughId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying && viewMode === 'step-by-step') {
      interval = setInterval(() => {
        const currentStep = walkthrough?.steps[currentStepIndex];
        if (currentStep) {
          const stepDuration = (currentStep.estimatedDuration || 30) * 1000 / playbackSpeed;

          setTimeout(() => {
            nextStep();
          }, stepDuration);
        }
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentStepIndex, playbackSpeed, walkthrough]);

  const loadWalkthrough = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/handover/walkthroughs/${walkthroughId}`);

      if (!response.ok) {
        throw new Error(`Failed to load walkthrough: ${response.statusText}`);
      }

      const data = await response.json();
      setWalkthrough(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (walkthrough && currentStepIndex < walkthrough.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const previousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStepIndex(stepIndex);
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const resetWalkthrough = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const downloadWalkthrough = async (format: string) => {
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

  const shareWalkthrough = async () => {
    const shareUrl = `${window.location.origin}/walkthrough/${walkthroughId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: walkthrough?.metadata.title,
          text: walkthrough?.metadata.description,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Share URL copied to clipboard!');
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const calculateProgress = (): number => {
    if (!walkthrough || walkthrough.steps.length === 0) return 0;
    return ((currentStepIndex + 1) / walkthrough.steps.length) * 100;
  };

  const getCurrentStep = (): WalkthroughStep | null => {
    if (!walkthrough || !walkthrough.steps[currentStepIndex]) return null;
    return walkthrough.steps[currentStepIndex];
  };

  const getStepIcon = (stepType: string) => {
    switch (stepType) {
      case 'video':
        return <Film className="h-4 w-4" />;
      case 'interactive':
        return <Zap className="h-4 w-4" />;
      case 'configuration':
        return <Settings className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getStepTypeBadge = (stepType: string) => {
    const typeConfig = {
      introduction: { label: 'Intro', color: 'bg-blue-100 text-blue-800' },
      navigation: { label: 'Navigation', color: 'bg-green-100 text-green-800' },
      feature: { label: 'Feature', color: 'bg-purple-100 text-purple-800' },
      configuration: { label: 'Config', color: 'bg-orange-100 text-orange-800' },
      completion: { label: 'Complete', color: 'bg-green-100 text-green-800' },
      video: { label: 'Video', color: 'bg-red-100 text-red-800' },
      interactive: { label: 'Interactive', color: 'bg-indigo-100 text-indigo-800' }
    };

    const config = typeConfig[stepType] || typeConfig.feature;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading walkthrough...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 mb-2">⚠️</div>
          <p className="text-red-600">Error loading walkthrough: {error}</p>
          <Button variant="outline" onClick={loadWalkthrough} className="mt-2">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!walkthrough) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Walkthrough not found</p>
      </div>
    );
  }

  const currentStep = getCurrentStep();
  const containerClass = isFullscreen
    ? 'fixed inset-0 z-50 bg-white'
    : mode === 'embedded'
    ? 'w-full h-full'
    : 'container mx-auto p-6';

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold">{walkthrough.metadata.title}</h1>
            <p className="text-gray-600">{walkthrough.metadata.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => shareWalkthrough()}>
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={() => downloadWalkthrough('pdf')}>
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
          {mode !== 'embedded' && (
            <Button variant="outline" size="sm" onClick={toggleFullscreen}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress: {currentStepIndex + 1} of {walkthrough.steps.length}</span>
          <span>{formatDuration(walkthrough.metadata.duration)}</span>
        </div>
        <Progress value={calculateProgress()} className="h-2" />
      </div>

      {/* Control Bar */}
      <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={previousStep}
            disabled={currentStepIndex === 0}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={togglePlayback}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={nextStep}
            disabled={currentStepIndex === walkthrough.steps.length - 1}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={resetWalkthrough}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            className="px-2 py-1 border rounded text-sm"
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setAudioEnabled(!audioEnabled)}
          >
            {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)} className="mb-6">
        <TabsList>
          <TabsTrigger value="step-by-step">Step by Step</TabsTrigger>
          <TabsTrigger value="video">Video</TabsTrigger>
          <TabsTrigger value="interactive">Interactive</TabsTrigger>
        </TabsList>

        <TabsContent value="step-by-step">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Step Content */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStepIcon(currentStep?.type || 'default')}
                      <CardTitle>{currentStep?.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStepTypeBadge(currentStep?.type || 'feature')}
                      {currentStep?.required && (
                        <Badge variant="outline">Required</Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    Step {currentStepIndex + 1} of {walkthrough.steps.length} •
                    {formatDuration(currentStep?.estimatedDuration || 0)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p>{currentStep?.content}</p>
                  </div>

                  {/* Step Assets */}
                  {currentStep?.assets?.screenshots && currentStep.assets.screenshots.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Screenshots</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentStep.assets.screenshots.map((screenshot, index) => (
                          <img
                            key={index}
                            src={screenshot}
                            alt={`Step ${currentStepIndex + 1} Screenshot ${index + 1}`}
                            className="rounded-lg border shadow-sm"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step Videos */}
                  {currentStep?.assets?.videos && currentStep.assets.videos.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Video Guide</h4>
                      {currentStep.assets.videos.map((video, index) => (
                        <video
                          key={index}
                          src={video}
                          controls
                          className="w-full rounded-lg"
                          muted={!audioEnabled}
                        >
                          Your browser does not support the video tag.
                        </video>
                      ))}
                    </div>
                  )}

                  {/* Interactions */}
                  {currentStep?.interactions && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Interactive Elements</h4>
                      <div className="text-blue-700 text-sm space-y-1">
                        {currentStep.interactions.click && (
                          <p>• Click on: {currentStep.interactions.click.selector}</p>
                        )}
                        {currentStep.interactions.form && (
                          <p>• Fill out the form with the provided data</p>
                        )}
                        {currentStep.interactions.navigate && (
                          <p>• Navigate to: {currentStep.interactions.navigate.target}</p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Step Navigation */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {walkthrough.steps.map((step, index) => (
                      <div
                        key={step.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          index === currentStepIndex
                            ? 'bg-blue-100 border-blue-300 border'
                            : index < currentStepIndex
                            ? 'bg-green-50 border-green-200 border'
                            : 'bg-gray-50 border-gray-200 border hover:bg-gray-100'
                        }`}
                        onClick={() => goToStep(index)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {index < currentStepIndex && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                            {index === currentStepIndex && isPlaying && (
                              <div className="h-4 w-4 flex items-center justify-center">
                                <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></div>
                              </div>
                            )}
                            {index === currentStepIndex && !isPlaying && (
                              <Play className="h-4 w-4 text-blue-600" />
                            )}
                            {index > currentStepIndex && (
                              <Clock className="h-4 w-4 text-gray-400" />
                            )}
                            <span className="text-sm font-medium">{step.title}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDuration(step.estimatedDuration || 0)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="video">
          <Card>
            <CardContent className="p-6">
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Film className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600">Video walkthrough</p>
                  <p className="text-sm text-gray-500">Full walkthrough video would play here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interactive">
          <Card>
            <CardContent className="p-6">
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Zap className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600">Interactive tutorial</p>
                  <p className="text-sm text-gray-500">Interactive tutorial interface would load here</p>
                  <Button className="mt-4">
                    <Play className="h-4 w-4 mr-2" />
                    Start Interactive Tutorial
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}