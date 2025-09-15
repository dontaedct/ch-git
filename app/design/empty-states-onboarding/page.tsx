"use client";

/**
 * @fileoverview HT-008.5.8: Empty States and Onboarding Demo
 * @module app/design/empty-states-onboarding/page
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.5.8 - Implement proper empty states and onboarding
 * Focus: Vercel/Apply-level empty states and onboarding demonstration
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (user experience and onboarding)
 */

import React, { useState } from "react"
import {
  DisplayLG,
  HeadingXL,
  HeadingLG,
  HeadingMD,
  BodyMD,
  BodySM,
  LabelMD,
  CaptionMD,
  CodeMD,
  Lead,
  Muted,
  TypographyContainer,
} from "@/components/ui/typography"
import {
  Padding,
  PaddingX,
  PaddingY,
  Margin,
  MarginY,
  Space,
  SpaceY,
} from "@/components/ui/spacing"
import {
  EmptyState,
  WelcomeEmptyState,
  OnboardingEmptyState,
  SearchEmptyState,
  ErrorEmptyState,
  LoadingEmptyState,
  PermissionEmptyState,
  CelebrationEmptyState,
  GenericListEmptyState,
} from "@/components/ui/empty-states-enhanced"
import {
  OnboardingProvider,
  OnboardingFlowSelector,
  OnboardingStepContent,
  OnboardingProgressTracker,
  OnboardingCompletion,
  OnboardingFlow,
  OnboardingStep,
} from "@/components/ui/onboarding-system"
import { InteractiveButton } from "@/components/ui/micro-interactions"
import { RevealAnimation, StaggeredContainer } from "@/components/ui/ux-patterns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Circle,
  X,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Target,
  BookOpen,
  Lightbulb,
  Users,
  Settings,
  Shield,
  Zap,
  Star,
  Award,
  Rocket,
  Heart,
  ThumbsUp,
  Eye,
  EyeOff,
  HelpCircle,
  Info,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Globe,
  Download,
  Upload,
  Share2,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Maximize2,
  Minimize2,
  RefreshCw,
  Save,
  Edit,
  Trash2,
  Copy,
  Move,
  Lock,
  Unlock,
  Key,
  User,
  UserPlus,
  UserCheck,
  UserX,
  Bell,
  BellOff,
  Search,
  Filter,
  Grid,
  List,
  MoreHorizontal,
  Home,
  Menu,
  Navigation,
  Compass,
  Map,
  Layers,
  Package,
  Box,
  Archive,
  Folder,
  FolderOpen,
  File,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileCode,
  Database,
  Server,
  Cloud,
  CloudUpload,
  CloudDownload,
  Wifi,
  WifiOff,
  Signal,
  Battery,
  Power,
  Volume2,
  VolumeX,
  Volume1,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Video,
  VideoOff,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Headphones,
  Speaker,
  Printer,
  HardDrive,
  Cpu,
  Disc,
  Usb,
  Bluetooth,
  Radio,
  Tv,
  Gamepad2,
  Mouse,
  Keyboard,
  MousePointer,
  Hand,
  Fingerprint,
  Scan,
  QrCode,
  CreditCard,
  Wallet,
  Coins,
  DollarSign,
  Euro,
  PoundSterling,
  Bitcoin,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Thermometer,
  Gauge,
  Timer,
  AlarmClock,
  CalendarDays,
  CalendarCheck,
  CalendarX,
  CalendarPlus,
  Slack
} from "lucide-react"

// HT-008.5.8: Enhanced Empty States and Onboarding Demo
// Comprehensive showcase of our empty states and onboarding system

// Sample onboarding flows
const sampleFlows: OnboardingFlow[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Learn the basics of our platform and get up and running quickly.",
    category: "Basics",
    difficulty: "beginner",
    estimatedTime: 300, // 5 minutes
    steps: [
      {
        id: "welcome",
        title: "Welcome to Our Platform",
        description: "Let's get you started with a quick overview of what you can do.",
        content: (
          <div className="space-y-4">
            <p className="text-theme-secondary">
              Welcome! We're excited to have you here. This platform helps you manage your projects, 
              collaborate with your team, and achieve your goals more efficiently.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-theme-elevated rounded-lg">
                <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h4 className="font-medium">Team Collaboration</h4>
                <p className="text-sm text-theme-secondary">Work together seamlessly</p>
              </div>
              <div className="text-center p-4 bg-theme-elevated rounded-lg">
                <BarChart3 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h4 className="font-medium">Project Management</h4>
                <p className="text-sm text-theme-secondary">Track progress and milestones</p>
              </div>
              <div className="text-center p-4 bg-theme-elevated rounded-lg">
                <Zap className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <h4 className="font-medium">Automation</h4>
                <p className="text-sm text-theme-secondary">Streamline your workflows</p>
              </div>
            </div>
          </div>
        ),
        icon: <Rocket className="w-6 h-6" />,
        estimatedTime: 60,
      },
      {
        id: "profile-setup",
        title: "Set Up Your Profile",
        description: "Complete your profile to get personalized recommendations.",
        content: (
          <div className="space-y-4">
            <p className="text-theme-secondary">
              Your profile helps us personalize your experience and connect you with the right people and projects.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-theme-elevated rounded-lg">
                <User className="w-5 h-5 text-theme-primary" />
                <div>
                  <div className="font-medium">Add your photo</div>
                  <div className="text-sm text-theme-secondary">Help others recognize you</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-theme-elevated rounded-lg">
                <Mail className="w-5 h-5 text-theme-primary" />
                <div>
                  <div className="font-medium">Verify your email</div>
                  <div className="text-sm text-theme-secondary">Stay updated on important changes</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-theme-elevated rounded-lg">
                <MapPin className="w-5 h-5 text-theme-primary" />
                <div>
                  <div className="font-medium">Add your location</div>
                  <div className="text-sm text-theme-secondary">Find local team members</div>
                </div>
              </div>
            </div>
          </div>
        ),
        icon: <User className="w-6 h-6" />,
        action: {
          label: "Complete Profile",
          onClick: () => console.log("Complete profile clicked"),
        },
        estimatedTime: 120,
      },
      {
        id: "first-project",
        title: "Create Your First Project",
        description: "Start your journey by creating your first project.",
        content: (
          <div className="space-y-4">
            <p className="text-theme-secondary">
              Projects are the foundation of your work. They help you organize tasks, track progress, 
              and collaborate with your team.
            </p>
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                💡 Pro Tip
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Start with a simple project to get familiar with the interface. You can always 
                add more complexity as you become more comfortable.
              </p>
            </div>
          </div>
        ),
        icon: <Package className="w-6 h-6" />,
        action: {
          label: "Create Project",
          onClick: () => console.log("Create project clicked"),
        },
        estimatedTime: 120,
      },
    ],
  },
  {
    id: "advanced-features",
    title: "Advanced Features",
    description: "Explore powerful features to maximize your productivity.",
    category: "Productivity",
    difficulty: "intermediate",
    estimatedTime: 600, // 10 minutes
    prerequisites: ["Basic understanding of the platform"],
    steps: [
      {
        id: "automation",
        title: "Set Up Automation",
        description: "Learn how to automate repetitive tasks and workflows.",
        content: (
          <div className="space-y-4">
            <p className="text-theme-secondary">
              Automation can save you hours of work by handling routine tasks automatically.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Auto-assign tasks based on skills</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Send notifications for deadlines</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Generate reports automatically</span>
              </div>
            </div>
          </div>
        ),
        icon: <Zap className="w-6 h-6" />,
        estimatedTime: 180,
      },
      {
        id: "integrations",
        title: "Connect Integrations",
        description: "Integrate with your favorite tools and services.",
        content: (
          <div className="space-y-4">
            <p className="text-theme-secondary">
              Connect with popular tools to streamline your workflow and keep everything in sync.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-theme-elevated rounded-lg text-center">
                <Mail className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                <div className="text-sm font-medium">Gmail</div>
              </div>
              <div className="p-3 bg-theme-elevated rounded-lg text-center">
                <Calendar className="w-6 h-6 text-green-500 mx-auto mb-1" />
                <div className="text-sm font-medium">Google Calendar</div>
              </div>
              <div className="p-3 bg-theme-elevated rounded-lg text-center">
                <Cloud className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                <div className="text-sm font-medium">Dropbox</div>
              </div>
              <div className="p-3 bg-theme-elevated rounded-lg text-center">
                <Slack className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                <div className="text-sm font-medium">Slack</div>
              </div>
            </div>
          </div>
        ),
        icon: <Globe className="w-6 h-6" />,
        estimatedTime: 240,
      },
    ],
  },
]

export default function EmptyStatesOnboardingPage() {
  const [activeTab, setActiveTab] = useState("empty-states")
  const [selectedFlow, setSelectedFlow] = useState<OnboardingFlow | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [isOnboardingActive, setIsOnboardingActive] = useState(false)

  const handleFlowComplete = (flowId: string) => {
    console.log(`Flow ${flowId} completed`)
    setSelectedFlow(null)
    setCurrentStep(0)
    setCompletedSteps([])
    setIsOnboardingActive(false)
  }

  const handleStepComplete = (stepId: string) => {
    console.log(`Step ${stepId} completed`)
    setCompletedSteps(prev => [...prev, stepId])
  }

  const handleNextStep = () => {
    if (selectedFlow && currentStep < selectedFlow.steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleFlowComplete(selectedFlow!.id)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSkipStep = () => {
    if (selectedFlow && !selectedFlow.steps[currentStep].required) {
      handleNextStep()
    }
  }

  const startOnboarding = (flow: OnboardingFlow) => {
    setSelectedFlow(flow)
    setCurrentStep(0)
    setCompletedSteps([])
    setIsOnboardingActive(true)
  }

  return (
    <OnboardingProvider
      flows={sampleFlows}
      onFlowComplete={handleFlowComplete}
      onStepComplete={handleStepComplete}
    >
      <div className="min-h-screen bg-theme text-theme theme-transition">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-12">
            <DisplayLG className="text-theme mb-4">Empty States & Onboarding</DisplayLG>
            <Lead className="text-theme-secondary mb-6">
              Comprehensive demonstration of our enhanced empty states and sophisticated onboarding system,
              featuring user-friendly guidance and seamless user experiences.
            </Lead>
            <BodyMD className="text-theme-muted">
              This page showcases all empty states and onboarding patterns implemented as part of HT-008.5.8,
              including welcome flows, error handling, and interactive tutorials.
            </BodyMD>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="empty-states">Empty States</TabsTrigger>
              <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
            </TabsList>

            {/* Empty States Tab */}
            <TabsContent value="empty-states" className="space-y-8">
              {/* Welcome Empty State */}
              <section>
                <HeadingXL className="text-theme mb-6">Welcome Empty States</HeadingXL>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Welcome State</CardTitle>
                      <CardDescription>First-time user experience</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <WelcomeEmptyState
                        userName="John"
                        onGetStarted={() => console.log("Get started clicked")}
                        onLearnMore={() => console.log("Learn more clicked")}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Onboarding State</CardTitle>
                      <CardDescription>Step-by-step guidance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <OnboardingEmptyState
                        step={2}
                        totalSteps={5}
                        title="Set Up Your Profile"
                        description="Complete your profile to get personalized recommendations and connect with your team."
                        onNext={() => console.log("Next clicked")}
                        onSkip={() => console.log("Skip clicked")}
                        onPrevious={() => console.log("Previous clicked")}
                      />
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Error and Loading States */}
              <section>
                <HeadingXL className="text-theme mb-6">Error & Loading States</HeadingXL>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Error State</CardTitle>
                      <CardDescription>When something goes wrong</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ErrorEmptyState
                        title="Failed to Load Data"
                        description="We couldn't load your content. Please check your connection and try again."
                        onRetry={() => console.log("Retry clicked")}
                        onReport={() => console.log("Report clicked")}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Loading State</CardTitle>
                      <CardDescription>While content is loading</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <LoadingEmptyState
                        message="Loading your dashboard..."
                        progress={65}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Permission State</CardTitle>
                      <CardDescription>When access is required</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <PermissionEmptyState
                        requiredPermission="Admin access"
                        onRequestAccess={() => console.log("Request access clicked")}
                        onContactAdmin={() => console.log("Contact admin clicked")}
                      />
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Search and Filter States */}
              <section>
                <HeadingXL className="text-theme mb-6">Search & Filter States</HeadingXL>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Search Empty State</CardTitle>
                      <CardDescription>No search results found</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <SearchEmptyState
                        query="react components"
                        onClearSearch={() => console.log("Clear search clicked")}
                        onNewSearch={() => console.log("New search clicked")}
                        suggestions={["react hooks", "react patterns", "react best practices"]}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Generic List State</CardTitle>
                      <CardDescription>Empty list with actions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <GenericListEmptyState
                        itemType="projects"
                        actionLabel="Create Project"
                        actionOnClick={() => console.log("Create project clicked")}
                        suggestions={[
                          {
                            title: "Import from template",
                            description: "Start with a pre-built project template",
                          },
                          {
                            title: "Browse examples",
                            description: "See what others have created",
                          },
                        ]}
                      />
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Celebration State */}
              <section>
                <HeadingXL className="text-theme mb-6">Celebration State</HeadingXL>
                <Card>
                  <CardHeader>
                    <CardTitle>Achievement Unlocked</CardTitle>
                    <CardDescription>Celebrating user accomplishments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CelebrationEmptyState
                      title="Congratulations!"
                      description="You've completed your first project and earned your first achievement badge."
                      achievement="First Project Complete"
                      onContinue={() => console.log("Continue clicked")}
                      onShare={() => console.log("Share clicked")}
                    />
                  </CardContent>
                </Card>
              </section>
            </TabsContent>

            {/* Onboarding Tab */}
            <TabsContent value="onboarding" className="space-y-8">
              {!isOnboardingActive ? (
                <>
                  {/* Flow Selector */}
                  <section>
                    <HeadingXL className="text-theme mb-6">Choose Your Onboarding Path</HeadingXL>
                    <OnboardingFlowSelector
                      flows={sampleFlows}
                      onSelectFlow={startOnboarding}
                    />
                  </section>

                  {/* Onboarding Features */}
                  <section>
                    <HeadingXL className="text-theme mb-6">Onboarding Features</HeadingXL>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-blue-500" />
                            Step-by-Step Guidance
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-theme-secondary">
                            Interactive tutorials that guide users through complex workflows with 
                            clear instructions and progress tracking.
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-green-500" />
                            Time Estimation
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-theme-secondary">
                            Each step includes estimated completion time to help users plan 
                            their onboarding experience.
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-purple-500" />
                            Validation & Prerequisites
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-theme-secondary">
                            Steps can include validation requirements and prerequisite checks 
                            to ensure proper completion.
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-orange-500" />
                            Difficulty Levels
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-theme-secondary">
                            Flows are categorized by difficulty level to help users choose 
                            the appropriate onboarding path.
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-red-500" />
                            Achievement Tracking
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-theme-secondary">
                            Track completion progress and celebrate achievements to motivate 
                            users throughout their journey.
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-500" />
                            Interactive Actions
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-theme-secondary">
                            Steps can include interactive actions that users can perform 
                            directly within the onboarding flow.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </section>
                </>
              ) : (
                <>
                  {/* Active Onboarding */}
                  <section>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                      {/* Progress Tracker */}
                      <div className="lg:col-span-1">
                        <OnboardingProgressTracker
                          steps={selectedFlow!.steps}
                          currentStep={currentStep}
                          completedSteps={completedSteps}
                        />
                      </div>

                      {/* Step Content */}
                      <div className="lg:col-span-3">
                        <Card>
                          <CardContent className="p-8">
                            <OnboardingStepContent
                              step={selectedFlow!.steps[currentStep]}
                              stepIndex={currentStep}
                              totalSteps={selectedFlow!.steps.length}
                              onNext={handleNextStep}
                              onPrevious={handlePreviousStep}
                              onSkip={handleSkipStep}
                            />
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </section>
                </>
              )}
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="border-t border-theme pt-8 mt-12">
            <BodySM className="text-theme-muted text-center">
              HT-008.5.8: Empty States and Onboarding Implementation Complete
            </BodySM>
          </div>
        </div>
      </div>
    </OnboardingProvider>
  )
}
