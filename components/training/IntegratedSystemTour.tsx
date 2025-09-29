import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, X, Play, CheckCircle } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  content: React.ReactNode;
  module: 'dashboard' | 'orchestration' | 'modules' | 'marketplace' | 'handover';
  isComplete?: boolean;
}

interface IntegratedSystemTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  startFromStep?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to the Integrated Agency Toolkit',
    description: 'Get started with your unified agency management system',
    target: 'dashboard',
    module: 'dashboard',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Welcome to the fully integrated Agency Toolkit! This tour will guide you through all the key features
          of your unified platform, from project orchestration to client handover.
        </p>
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-blue-900">What you'll learn:</p>
          <ul className="text-sm text-blue-800 mt-2 list-disc list-inside space-y-1">
            <li>Navigate the unified dashboard</li>
            <li>Manage workflow orchestration</li>
            <li>Use the module marketplace</li>
            <li>Automate client handover</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'dashboard-overview',
    title: 'Unified Dashboard Overview',
    description: 'Your central hub for all agency operations',
    target: 'dashboard',
    module: 'dashboard',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          The dashboard provides real-time insights into all your agency operations. Each module card shows
          status, metrics, and quick actions.
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-green-50 p-2 rounded border-l-2 border-green-400">
            <p className="font-medium text-green-900">Orchestration</p>
            <p className="text-green-700">Workflow management</p>
          </div>
          <div className="bg-blue-50 p-2 rounded border-l-2 border-blue-400">
            <p className="font-medium text-blue-900">Modules</p>
            <p className="text-blue-700">System components</p>
          </div>
          <div className="bg-purple-50 p-2 rounded border-l-2 border-purple-400">
            <p className="font-medium text-purple-900">Marketplace</p>
            <p className="text-purple-700">Template library</p>
          </div>
          <div className="bg-orange-50 p-2 rounded border-l-2 border-orange-400">
            <p className="font-medium text-orange-900">Handover</p>
            <p className="text-orange-700">Client delivery</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'orchestration-intro',
    title: 'Workflow Orchestration',
    description: 'Automate and manage your agency workflows',
    target: 'orchestration',
    module: 'orchestration',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          The orchestration system manages your entire workflow from client intake to project delivery.
          Create, monitor, and optimize your agency processes.
        </p>
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-gray-800">Key Features:</p>
          <ul className="text-sm text-gray-700 mt-2 list-disc list-inside space-y-1">
            <li>Visual workflow designer</li>
            <li>Real-time process monitoring</li>
            <li>Automated task assignment</li>
            <li>Performance analytics</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'modules-intro',
    title: 'Module Management',
    description: 'Hot-pluggable system components',
    target: 'modules',
    module: 'modules',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          The module system allows you to extend and customize your agency toolkit with hot-pluggable
          components. Add new capabilities without system downtime.
        </p>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span>Install new modules instantly</span>
          </div>
          <div className="flex items-center text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            <span>Configure module settings</span>
          </div>
          <div className="flex items-center text-sm">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
            <span>Monitor module performance</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'marketplace-intro',
    title: 'Template Marketplace',
    description: 'Discover and install templates',
    target: 'marketplace',
    module: 'marketplace',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Browse, install, and manage templates from our curated marketplace. Find solutions for
          every client need and industry vertical.
        </p>
        <div className="grid grid-cols-1 gap-2">
          <div className="bg-purple-50 p-2 rounded text-xs">
            <p className="font-medium text-purple-900">🎨 Design Templates</p>
            <p className="text-purple-700">Professional layouts and components</p>
          </div>
          <div className="bg-blue-50 p-2 rounded text-xs">
            <p className="font-medium text-blue-900">⚙️ Workflow Templates</p>
            <p className="text-blue-700">Pre-built automation sequences</p>
          </div>
          <div className="bg-green-50 p-2 rounded text-xs">
            <p className="font-medium text-green-900">📊 Analytics Templates</p>
            <p className="text-green-700">Dashboard and reporting solutions</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'handover-intro',
    title: 'Client Handover Automation',
    description: 'Streamline project delivery',
    target: 'handover',
    module: 'handover',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Automate the client handover process with documentation generation, training materials,
          and smooth transition workflows.
        </p>
        <div className="bg-orange-50 p-3 rounded-lg border-l-4 border-orange-400">
          <p className="text-sm font-medium text-orange-900">Automated Handover Process:</p>
          <div className="mt-2 space-y-1 text-sm text-orange-800">
            <div className="flex items-center">
              <CheckCircle className="w-3 h-3 mr-2 text-orange-600" />
              Documentation generation
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-3 h-3 mr-2 text-orange-600" />
              Training material creation
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-3 h-3 mr-2 text-orange-600" />
              Client portal setup
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'integration-benefits',
    title: 'Integration Benefits',
    description: 'Why the unified system matters',
    target: 'dashboard',
    module: 'dashboard',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          The integrated system provides seamless workflow and eliminates data silos between modules.
        </p>
        <div className="space-y-3">
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-green-900">✨ Unified Experience</p>
            <p className="text-xs text-green-700 mt-1">Single interface for all operations</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-blue-900">🔄 Data Synchronization</p>
            <p className="text-xs text-blue-700 mt-1">Real-time sync across all modules</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-purple-900">🚀 Improved Productivity</p>
            <p className="text-xs text-purple-700 mt-1">Streamlined workflows and automation</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'next-steps',
    title: 'Ready to Get Started?',
    description: 'Complete your setup and start exploring',
    target: 'dashboard',
    module: 'dashboard',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          You're all set! Start by exploring each module and customizing your agency toolkit to
          fit your specific needs.
        </p>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-800">Recommended Next Steps:</p>
          <ol className="text-sm text-gray-700 mt-2 list-decimal list-inside space-y-1">
            <li>Set up your first workflow in Orchestration</li>
            <li>Browse and install templates from Marketplace</li>
            <li>Configure modules for your agency needs</li>
            <li>Test the handover process with a sample client</li>
          </ol>
        </div>
      </div>
    )
  }
];

export function IntegratedSystemTour({ isOpen, onClose, onComplete, startFromStep }: IntegratedSystemTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);

  const currentStep = TOUR_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

  useEffect(() => {
    if (startFromStep) {
      const stepIndex = TOUR_STEPS.findIndex(step => step.id === startFromStep);
      if (stepIndex !== -1) {
        setCurrentStepIndex(stepIndex);
      }
    }
  }, [startFromStep]);

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep.id]));

    if (isLastStep) {
      onComplete?.();
      onClose();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleStepJump = (stepIndex: number) => {
    setCurrentStepIndex(stepIndex);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const getModuleColor = (module: string) => {
    const colors = {
      dashboard: 'bg-gray-100 text-gray-800',
      orchestration: 'bg-green-100 text-green-800',
      modules: 'bg-blue-100 text-blue-800',
      marketplace: 'bg-purple-100 text-purple-800',
      handover: 'bg-orange-100 text-orange-800'
    };
    return colors[module as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Badge className={getModuleColor(currentStep.module)}>
                {currentStep.module.charAt(0).toUpperCase() + currentStep.module.slice(1)}
              </Badge>
              <div>
                <CardTitle className="text-lg">{currentStep.title}</CardTitle>
                <CardDescription className="text-sm">{currentStep.description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePlayPause}
                className="text-gray-500"
              >
                <Play className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-500"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2 mt-4">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / TOUR_STEPS.length) * 100}%` }}
              />
            </div>
            <span className="text-sm text-gray-500 font-medium">
              {currentStepIndex + 1} / {TOUR_STEPS.length}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-6">
            {currentStep.content}

            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={isFirstStep}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>

              <div className="flex items-center space-x-1">
                {TOUR_STEPS.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => handleStepJump(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === currentStepIndex
                        ? 'bg-blue-600 scale-125'
                        : completedSteps.has(step.id)
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                    title={step.title}
                  />
                ))}
              </div>

              <Button
                onClick={handleNext}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
              >
                <span>{isLastStep ? 'Complete Tour' : 'Next'}</span>
                {!isLastStep && <ArrowRight className="w-4 h-4" />}
                {isLastStep && <CheckCircle className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}