import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  User,
  Building2,
  Settings,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Target,
  Users,
  Zap
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  required?: boolean;
}

interface UserProfile {
  name: string;
  email: string;
  role: string;
  company: string;
  teamSize: string;
  primaryGoals: string[];
  experience: string;
  preferences: {
    notifications: boolean;
    tutorials: boolean;
    analytics: boolean;
  };
}

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (profile: UserProfile) => void;
  initialData?: Partial<UserProfile>;
}

export function OnboardingWizard({ isOpen, onClose, onComplete, initialData }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    role: '',
    company: '',
    teamSize: '',
    primaryGoals: [],
    experience: '',
    preferences: {
      notifications: true,
      tutorials: true,
      analytics: true
    },
    ...initialData
  });

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Agency Toolkit',
      description: 'Let\'s get you set up for success',
      icon: <Sparkles className="w-6 h-6" />,
      component: (
        <div className="space-y-6 text-center">
          <div className="space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Agency Toolkit!</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Your integrated platform for managing clients, workflows, and project delivery.
                Let's customize your experience in just a few steps.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
            <h4 className="font-semibold text-gray-800 mb-3">What we'll set up:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Your profile & preferences</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Team configuration</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Module selection</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Dashboard customization</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'profile',
      title: 'Your Profile',
      description: 'Tell us about yourself and your role',
      icon: <User className="w-6 h-6" />,
      required: true,
      component: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={profile.name}
                onChange={(e) => updateProfile({ name: e.target.value })}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={profile.email}
                onChange={(e) => updateProfile({ email: e.target.value })}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Your Role *</Label>
            <Select value={profile.role} onValueChange={(value) => updateProfile({ role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select your primary role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agency-owner">Agency Owner</SelectItem>
                <SelectItem value="project-manager">Project Manager</SelectItem>
                <SelectItem value="account-manager">Account Manager</SelectItem>
                <SelectItem value="creative-director">Creative Director</SelectItem>
                <SelectItem value="developer">Developer</SelectItem>
                <SelectItem value="designer">Designer</SelectItem>
                <SelectItem value="consultant">Consultant</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Experience Level</Label>
            <Select value={profile.experience} onValueChange={(value) => updateProfile({ experience: value })}>
              <SelectTrigger>
                <SelectValue placeholder="How experienced are you with agency tools?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">New to agency management</SelectItem>
                <SelectItem value="intermediate">Some experience with tools</SelectItem>
                <SelectItem value="advanced">Very experienced</SelectItem>
                <SelectItem value="expert">Expert level</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    },
    {
      id: 'company',
      title: 'Your Agency',
      description: 'Information about your company and team',
      icon: <Building2 className="w-6 h-6" />,
      component: (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="company">Company/Agency Name</Label>
            <Input
              id="company"
              placeholder="Enter your company name"
              value={profile.company}
              onChange={(e) => updateProfile({ company: e.target.value })}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teamSize">Team Size</Label>
            <Select value={profile.teamSize} onValueChange={(value) => updateProfile({ teamSize: value })}>
              <SelectTrigger>
                <SelectValue placeholder="How many people are on your team?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solo">Just me (Solo)</SelectItem>
                <SelectItem value="small">2-5 people</SelectItem>
                <SelectItem value="medium">6-15 people</SelectItem>
                <SelectItem value="large">16-50 people</SelectItem>
                <SelectItem value="enterprise">50+ people</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Team Benefits</h4>
            <p className="text-sm text-blue-800">
              Based on your team size, we'll recommend the best modules and configurations
              to maximize productivity and collaboration.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'goals',
      title: 'Your Goals',
      description: 'What do you want to achieve with Agency Toolkit?',
      icon: <Target className="w-6 h-6" />,
      component: (
        <div className="space-y-6">
          <div>
            <Label className="text-base font-medium">Primary Goals (Select all that apply)</Label>
            <p className="text-sm text-gray-600 mb-4">Choose your main objectives to help us personalize your experience</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { id: 'streamline-workflows', label: 'Streamline workflows', description: 'Automate repetitive tasks' },
                { id: 'improve-collaboration', label: 'Improve team collaboration', description: 'Better team communication' },
                { id: 'client-management', label: 'Better client management', description: 'Enhance client relationships' },
                { id: 'project-delivery', label: 'Faster project delivery', description: 'Reduce delivery timelines' },
                { id: 'quality-control', label: 'Quality control', description: 'Maintain high standards' },
                { id: 'analytics-reporting', label: 'Analytics & reporting', description: 'Data-driven decisions' },
                { id: 'scale-operations', label: 'Scale operations', description: 'Handle more clients' },
                { id: 'reduce-overhead', label: 'Reduce overhead', description: 'Lower operational costs' }
              ].map((goal) => (
                <div
                  key={goal.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    profile.primaryGoals.includes(goal.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    const newGoals = profile.primaryGoals.includes(goal.id)
                      ? profile.primaryGoals.filter(g => g !== goal.id)
                      : [...profile.primaryGoals, goal.id];
                    updateProfile({ primaryGoals: newGoals });
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={profile.primaryGoals.includes(goal.id)}
                      readOnly
                    />
                    <div>
                      <p className="font-medium text-sm">{goal.label}</p>
                      <p className="text-xs text-gray-600">{goal.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'preferences',
      title: 'Preferences',
      description: 'Customize your experience',
      icon: <Settings className="w-6 h-6" />,
      component: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-medium">Notification Preferences</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">Email Notifications</p>
                  <p className="text-xs text-gray-600">Receive updates about projects and system changes</p>
                </div>
                <Checkbox
                  checked={profile.preferences.notifications}
                  onCheckedChange={(checked) =>
                    updateProfile({
                      preferences: { ...profile.preferences, notifications: checked as boolean }
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">Tutorial Tips</p>
                  <p className="text-xs text-gray-600">Show helpful tips and guided tutorials</p>
                </div>
                <Checkbox
                  checked={profile.preferences.tutorials}
                  onCheckedChange={(checked) =>
                    updateProfile({
                      preferences: { ...profile.preferences, tutorials: checked as boolean }
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">Analytics Tracking</p>
                  <p className="text-xs text-gray-600">Help us improve by sharing anonymous usage data</p>
                </div>
                <Checkbox
                  checked={profile.preferences.analytics}
                  onCheckedChange={(checked) =>
                    updateProfile({
                      preferences: { ...profile.preferences, analytics: checked as boolean }
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">Privacy First</h4>
            <p className="text-sm text-green-800">
              Your data privacy is important to us. You can change these preferences anytime
              in your account settings.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'complete',
      title: 'All Set!',
      description: 'Your Agency Toolkit is ready',
      icon: <CheckCircle className="w-6 h-6" />,
      component: (
        <div className="space-y-6 text-center">
          <div className="space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl mx-auto flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">You're All Set!</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Your Agency Toolkit has been configured based on your preferences.
                Start exploring your personalized dashboard.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl">
            <h4 className="font-semibold text-gray-800 mb-4">What's Next?</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span>Explore your personalized dashboard</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-green-600" />
                <span>Invite team members</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-purple-600" />
                <span>Set up your first project</span>
              </div>
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-orange-600" />
                <span>Configure modules</span>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p>Need help getting started? Check out our interactive tour or browse the help center.</p>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const canProceed = () => {
    const step = steps[currentStep];
    if (!step.required) return true;

    switch (step.id) {
      case 'profile':
        return profile.name && profile.email && profile.role;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (isLastStep) {
      onComplete?.(profile);
      onClose();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                {currentStepData.icon}
              </div>
              <div>
                <CardTitle className="text-lg">{currentStepData.title}</CardTitle>
                <CardDescription className="text-sm">{currentStepData.description}</CardDescription>
              </div>
            </div>
            <Badge variant="outline">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>

          <div className="flex items-center space-x-2 mt-4">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-6">
            {currentStepData.component}

            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={isFirstStep}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>

              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
              >
                <span>{isLastStep ? 'Complete Setup' : 'Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}