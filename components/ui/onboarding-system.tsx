/**
 * @fileoverview HT-008.5.8: Comprehensive Onboarding System
 * @module components/ui/onboarding-system
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.5.8 - Implement proper empty states and onboarding
 * Focus: Vercel/Apply-level onboarding with sophisticated user guidance
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (user experience and onboarding)
 */

'use client'

import React, { forwardRef, useState, useEffect, useCallback } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
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
  Sort,
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
  FileSpreadsheet,
  FilePdf,
  FileZip,
  Database,
  Server,
  Cloud,
  CloudUpload,
  CloudDownload,
  Wifi,
  WifiOff,
  Signal,
  SignalHigh,
  SignalLow,
  Battery,
  BatteryLow,
  BatteryHigh,
  Power,
  PowerOff,
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
  Desktop,
  Watch,
  Headphones,
  Speaker,
  Printer,
  Scanner,
  HardDrive,
  Cpu,
  MemoryStick,
  HardDriveIcon,
  Disc,
  Cd,
  Dvd,
  BluRay,
  Usb,
  Bluetooth,
  WifiIcon,
  Radio,
  Tv,
  Gamepad2,
  Joystick,
  Mouse,
  Keyboard,
  Touchpad,
  Trackpad,
  MousePointer,
  Hand,
  HandPointer,
  Fingerprint,
  Scan,
  QrCode,
  Barcode,
  CreditCard,
  Wallet,
  Banknote,
  Coins,
  DollarSign,
  Euro,
  PoundSterling,
  Yen,
  Bitcoin,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Pulse,
  Heartbeat,
  Thermometer,
  Gauge,
  Speedometer,
  Timer,
  Stopwatch,
  AlarmClock,
  Hourglass,
  Sandglass,
  CalendarDays,
  CalendarCheck,
  CalendarX,
  CalendarPlus,
  CalendarMinus,
  CalendarRange,
  CalendarSearch,
  CalendarEdit,
  CalendarTrash,
  CalendarClock,
  CalendarHeart,
  CalendarStar,
  CalendarAward,
  CalendarRocket,
  CalendarTarget,
  CalendarZap,
  CalendarShield,
  CalendarKey,
  CalendarLock,
  CalendarUnlock,
  CalendarEye,
  CalendarEyeOff,
  CalendarBell,
  CalendarBellOff,
  CalendarSearch as CalendarSearchIcon,
  CalendarFilter,
  CalendarSort,
  CalendarGrid,
  CalendarList,
  CalendarMore,
  CalendarHome,
  CalendarMenu,
  CalendarNavigation,
  CalendarCompass,
  CalendarMap,
  CalendarLayers,
  CalendarPackage,
  CalendarBox,
  CalendarArchive,
  CalendarFolder,
  CalendarFolderOpen,
  CalendarFile,
  CalendarFileText,
  CalendarFileImage,
  CalendarFileVideo,
  CalendarFileAudio,
  CalendarFileCode,
  CalendarFileSpreadsheet,
  CalendarFilePdf,
  CalendarFileZip,
  CalendarDatabase,
  CalendarServer,
  CalendarCloud,
  CalendarCloudUpload,
  CalendarCloudDownload,
  CalendarWifi,
  CalendarWifiOff,
  CalendarSignal,
  CalendarSignalHigh,
  CalendarSignalLow,
  CalendarBattery,
  CalendarBatteryLow,
  CalendarBatteryHigh,
  CalendarPower,
  CalendarPowerOff,
  CalendarVolume2,
  CalendarVolumeX,
  CalendarVolume1,
  CalendarMic,
  CalendarMicOff,
  CalendarCamera,
  CalendarCameraOff,
  CalendarVideo,
  CalendarVideoOff,
  CalendarMonitor,
  CalendarSmartphone,
  CalendarTablet,
  CalendarLaptop,
  CalendarDesktop,
  CalendarWatch,
  CalendarHeadphones,
  CalendarSpeaker,
  CalendarPrinter,
  CalendarScanner,
  CalendarHardDrive,
  CalendarCpu,
  CalendarMemoryStick,
  CalendarHardDriveIcon,
  CalendarDisc,
  CalendarCd,
  CalendarDvd,
  CalendarBluRay,
  CalendarUsb,
  CalendarBluetooth,
  CalendarWifiIcon,
  CalendarRadio,
  CalendarTv,
  CalendarGamepad2,
  CalendarJoystick,
  CalendarMouse,
  CalendarKeyboard,
  CalendarTouchpad,
  CalendarTrackpad,
  CalendarMousePointer,
  CalendarHand,
  CalendarHandPointer,
  CalendarFingerprint,
  CalendarScan,
  CalendarQrCode,
  CalendarBarcode,
  CalendarCreditCard,
  CalendarWallet,
  CalendarBanknote,
  CalendarCoins,
  CalendarDollarSign,
  CalendarEuro,
  CalendarPoundSterling,
  CalendarYen,
  CalendarBitcoin,
  CalendarTrendingUp,
  CalendarTrendingDown,
  CalendarBarChart3,
  CalendarLineChart,
  CalendarPieChart,
  CalendarActivity,
  CalendarPulse,
  CalendarHeartbeat,
  CalendarThermometer,
  CalendarGauge,
  CalendarSpeedometer,
  CalendarTimer,
  CalendarStopwatch,
  CalendarAlarmClock,
  CalendarHourglass,
  CalendarSandglass,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { InteractiveButton } from '@/components/ui/micro-interactions'
import { RevealAnimation, StaggeredContainer } from '@/components/ui/ux-patterns'
import { OnboardingEmptyState } from '@/components/ui/empty-states-enhanced'

// HT-008.5.8: Enhanced Onboarding System
// Comprehensive onboarding with sophisticated user guidance

/**
 * Onboarding Step Interface
 */
export interface OnboardingStep {
  id: string
  title: string
  description: string
  content: React.ReactNode
  icon?: React.ReactNode
  target?: string // CSS selector for highlighting
  action?: {
    label: string
    onClick: () => void
  }
  validation?: () => boolean
  required?: boolean
  estimatedTime?: number // in seconds
}

/**
 * Onboarding Flow Interface
 */
export interface OnboardingFlow {
  id: string
  title: string
  description: string
  steps: OnboardingStep[]
  estimatedTime?: number
  category?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  prerequisites?: string[]
}

/**
 * Onboarding Provider Context
 */
interface OnboardingContextValue {
  currentFlow: OnboardingFlow | null
  currentStep: number
  completedSteps: string[]
  isActive: boolean
  startFlow: (flow: OnboardingFlow) => void
  nextStep: () => void
  previousStep: () => void
  skipStep: () => void
  completeStep: (stepId: string) => void
  endFlow: () => void
  resetFlow: () => void
}

const OnboardingContext = React.createContext<OnboardingContextValue | undefined>(undefined)

/**
 * Onboarding Provider
 */
interface OnboardingProviderProps {
  children: React.ReactNode
  flows: OnboardingFlow[]
  onFlowComplete?: (flowId: string) => void
  onStepComplete?: (stepId: string) => void
}

export function OnboardingProvider({ 
  children, 
  flows, 
  onFlowComplete, 
  onStepComplete 
}: OnboardingProviderProps) {
  const [currentFlow, setCurrentFlow] = useState<OnboardingFlow | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [isActive, setIsActive] = useState(false)

  const startFlow = useCallback((flow: OnboardingFlow) => {
    setCurrentFlow(flow)
    setCurrentStep(0)
    setCompletedSteps([])
    setIsActive(true)
  }, [])

  const nextStep = useCallback(() => {
    if (!currentFlow) return
    
    const currentStepData = currentFlow.steps[currentStep]
    if (currentStepData) {
      setCompletedSteps(prev => [...prev, currentStepData.id])
      onStepComplete?.(currentStepData.id)
    }
    
    if (currentStep < currentFlow.steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      endFlow()
    }
  }, [currentFlow, currentStep, onStepComplete])

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const skipStep = useCallback(() => {
    if (!currentFlow) return
    
    const currentStepData = currentFlow.steps[currentStep]
    if (currentStepData && !currentStepData.required) {
      nextStep()
    }
  }, [currentFlow, currentStep, nextStep])

  const completeStep = useCallback((stepId: string) => {
    setCompletedSteps(prev => [...prev, stepId])
    onStepComplete?.(stepId)
  }, [onStepComplete])

  const endFlow = useCallback(() => {
    if (currentFlow) {
      onFlowComplete?.(currentFlow.id)
    }
    setCurrentFlow(null)
    setCurrentStep(0)
    setCompletedSteps([])
    setIsActive(false)
  }, [currentFlow, onFlowComplete])

  const resetFlow = useCallback(() => {
    setCurrentStep(0)
    setCompletedSteps([])
  }, [])

  const contextValue: OnboardingContextValue = {
    currentFlow,
    currentStep,
    completedSteps,
    isActive,
    startFlow,
    nextStep,
    previousStep,
    skipStep,
    completeStep,
    endFlow,
    resetFlow,
  }

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  )
}

/**
 * Hook to use onboarding context
 */
export function useOnboarding(): OnboardingContextValue {
  const context = React.useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}

/**
 * Onboarding Flow Selector
 */
export interface OnboardingFlowSelectorProps {
  flows: OnboardingFlow[]
  onSelectFlow?: (flow: OnboardingFlow) => void
  className?: string
}

export const OnboardingFlowSelector = forwardRef<HTMLDivElement, OnboardingFlowSelectorProps>(
  ({ flows, onSelectFlow, className }, ref) => {
    const { startFlow } = useOnboarding()

    const handleSelectFlow = (flow: OnboardingFlow) => {
      startFlow(flow)
      onSelectFlow?.(flow)
    }

    return (
      <div ref={ref} className={cn("space-y-6", className)}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-theme mb-2">Choose Your Onboarding Path</h2>
          <p className="text-theme-secondary">
            Select the flow that best matches your needs and experience level.
          </p>
        </div>

        <StaggeredContainer stagger={100} direction="up">
          {flows.map((flow) => (
            <Card key={flow.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-theme-primary/10 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-theme-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{flow.title}</CardTitle>
                      <CardDescription>{flow.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {flow.difficulty || 'beginner'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-theme-secondary">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{flow.steps.length} steps</span>
                    </div>
                    {flow.estimatedTime && (
                      <div className="flex items-center gap-1">
                        <Timer className="w-4 h-4" />
                        <span>{Math.round(flow.estimatedTime / 60)} min</span>
                      </div>
                    )}
                    {flow.category && (
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        <span>{flow.category}</span>
                      </div>
                    )}
                  </div>

                  {flow.prerequisites && flow.prerequisites.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-theme mb-2">Prerequisites:</h4>
                      <div className="flex flex-wrap gap-1">
                        {flow.prerequisites.map((prereq, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {prereq}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <InteractiveButton
                    variant="primary"
                    onClick={() => handleSelectFlow(flow)}
                    className="w-full"
                  >
                    Start {flow.title}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </InteractiveButton>
                </div>
              </CardContent>
            </Card>
          ))}
        </StaggeredContainer>
      </div>
    )
  }
)
OnboardingFlowSelector.displayName = "OnboardingFlowSelector"

/**
 * Onboarding Step Content
 */
export interface OnboardingStepContentProps {
  step: OnboardingStep
  stepIndex: number
  totalSteps: number
  onNext?: () => void
  onPrevious?: () => void
  onSkip?: () => void
  className?: string
}

export const OnboardingStepContent = forwardRef<HTMLDivElement, OnboardingStepContentProps>(
  ({ step, stepIndex, totalSteps, onNext, onPrevious, onSkip, className }, ref) => {
    const [isValid, setIsValid] = useState(true)
    const [timeRemaining, setTimeRemaining] = useState(step.estimatedTime || 0)

    useEffect(() => {
      if (step.validation) {
        setIsValid(step.validation())
      }
    }, [step])

    useEffect(() => {
      if (step.estimatedTime && step.estimatedTime > 0) {
        const timer = setInterval(() => {
          setTimeRemaining(prev => Math.max(0, prev - 1))
        }, 1000)
        return () => clearInterval(timer)
      }
    }, [step.estimatedTime])

    const progress = ((stepIndex + 1) / totalSteps) * 100

    return (
      <div ref={ref} className={cn("space-y-6", className)}>
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-theme-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            {step.icon || <Target className="w-8 h-8 text-theme-primary" />}
          </div>
          <h2 className="text-2xl font-bold text-theme mb-2">{step.title}</h2>
          <p className="text-theme-secondary max-w-md mx-auto">{step.description}</p>
        </div>

        {/* Progress */}
        <div className="w-full max-w-md mx-auto">
          <div className="flex justify-between text-sm text-theme-secondary mb-2">
            <span>Step {stepIndex + 1} of {totalSteps}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          {step.estimatedTime && (
            <div className="text-xs text-theme-muted mt-1 text-center">
              Estimated time: {Math.ceil(timeRemaining / 60)} min remaining
            </div>
          )}
        </div>

        {/* Content */}
        <RevealAnimation animation="fade" delay={200}>
          <div className="max-w-2xl mx-auto">
            {step.content}
          </div>
        </RevealAnimation>

        {/* Action */}
        {step.action && (
          <div className="text-center">
            <InteractiveButton
              variant="outline"
              onClick={step.action.onClick}
              className="min-w-[200px]"
            >
              {step.action.label}
            </InteractiveButton>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between max-w-md mx-auto">
          <InteractiveButton
            variant="outline"
            onClick={onPrevious}
            disabled={stepIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </InteractiveButton>

          <div className="flex gap-2">
            {!step.required && (
              <InteractiveButton
                variant="ghost"
                onClick={onSkip}
              >
                Skip
              </InteractiveButton>
            )}
            <InteractiveButton
              variant="primary"
              onClick={onNext}
              disabled={!isValid}
            >
              {stepIndex === totalSteps - 1 ? 'Complete' : 'Next'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </InteractiveButton>
          </div>
        </div>
      </div>
    )
  }
)
OnboardingStepContent.displayName = "OnboardingStepContent"

/**
 * Onboarding Progress Tracker
 */
export interface OnboardingProgressTrackerProps {
  steps: OnboardingStep[]
  currentStep: number
  completedSteps: string[]
  className?: string
}

export const OnboardingProgressTracker = forwardRef<HTMLDivElement, OnboardingProgressTrackerProps>(
  ({ steps, currentStep, completedSteps, className }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-4", className)}>
        <h3 className="text-lg font-semibold text-theme">Progress</h3>
        <div className="space-y-3">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id)
            const isCurrent = index === currentStep
            const isUpcoming = index > currentStep

            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-all",
                  isCurrent && "bg-theme-primary/5 border border-theme-primary/20",
                  isCompleted && "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800",
                  isUpcoming && "bg-theme-elevated border border-theme-border"
                )}
              >
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : isCurrent ? (
                    <div className="w-5 h-5 rounded-full bg-theme-primary flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  ) : (
                    <Circle className="w-5 h-5 text-theme-muted" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    "font-medium text-sm",
                    isCompleted && "text-green-700 dark:text-green-300",
                    isCurrent && "text-theme-primary",
                    isUpcoming && "text-theme-secondary"
                  )}>
                    {step.title}
                  </div>
                  <div className="text-xs text-theme-muted truncate">
                    {step.description}
                  </div>
                </div>
                {step.estimatedTime && (
                  <div className="text-xs text-theme-muted">
                    {Math.ceil(step.estimatedTime / 60)}m
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
OnboardingProgressTracker.displayName = "OnboardingProgressTracker"

/**
 * Onboarding Completion Screen
 */
export interface OnboardingCompletionProps {
  flow: OnboardingFlow
  onContinue?: () => void
  onRestart?: () => void
  onExplore?: () => void
  className?: string
}

export const OnboardingCompletion = forwardRef<HTMLDivElement, OnboardingCompletionProps>(
  ({ flow, onContinue, onRestart, onExplore, className }, ref) => {
    return (
      <div ref={ref} className={cn("text-center space-y-8", className)}>
        <RevealAnimation animation="scale" delay={0}>
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
            <Award className="w-10 h-10 text-green-600" />
          </div>
        </RevealAnimation>

        <RevealAnimation animation="fade" delay={200}>
          <div>
            <h2 className="text-3xl font-bold text-theme mb-2">Congratulations!</h2>
            <p className="text-lg text-theme-secondary">
              You've completed the {flow.title} onboarding flow.
            </p>
          </div>
        </RevealAnimation>

        <RevealAnimation animation="slide" delay={400}>
          <div className="max-w-md mx-auto space-y-4">
            <div className="flex items-center justify-between p-4 bg-theme-elevated rounded-lg">
              <span className="text-sm font-medium">Steps Completed</span>
              <span className="text-sm text-theme-secondary">{flow.steps.length}</span>
            </div>
            {flow.estimatedTime && (
              <div className="flex items-center justify-between p-4 bg-theme-elevated rounded-lg">
                <span className="text-sm font-medium">Time Spent</span>
                <span className="text-sm text-theme-secondary">
                  ~{Math.round(flow.estimatedTime / 60)} minutes
                </span>
              </div>
            )}
          </div>
        </RevealAnimation>

        <RevealAnimation animation="fade" delay={600}>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <InteractiveButton
              variant="primary"
              onClick={onContinue}
              className="min-w-[140px]"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </InteractiveButton>
            <InteractiveButton
              variant="outline"
              onClick={onExplore}
              className="min-w-[140px]"
            >
              Explore More
              <Globe className="w-4 h-4 ml-2" />
            </InteractiveButton>
            <InteractiveButton
              variant="ghost"
              onClick={onRestart}
              className="min-w-[140px]"
            >
              Restart
              <RotateCcw className="w-4 h-4 ml-2" />
            </InteractiveButton>
          </div>
        </RevealAnimation>
      </div>
    )
  }
)
OnboardingCompletion.displayName = "OnboardingCompletion"

export {
  OnboardingProvider,
  useOnboarding,
  OnboardingFlowSelector,
  OnboardingStepContent,
  OnboardingProgressTracker,
  OnboardingCompletion,
}
