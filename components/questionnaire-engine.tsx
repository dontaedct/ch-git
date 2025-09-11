'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ChipGroup } from '@/components/ui/chip-group'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { emitLeadStartedQuestionnaire, emitLeadCompletedQuestionnaire } from '@/lib/webhooks/emitter'
import { OptimizedMotion, OptimizedAnimatePresence, OptimizedStagger } from '@/lib/performance/optimized-motion'
import { toast } from 'sonner'
import { 
  useAccessibility, 
  SkipLink, 
  LiveRegion,
  accessibilityUtils 
} from '@/lib/accessibility/accessibility-system'

interface QuestionOption {
  value: string
  label: string
}

interface Question {
  id: string
  text: string
  type: string // Allow any string type from JSON
  required: boolean
  options?: QuestionOption[]
  allowCustom?: boolean
  placeholder?: string
  visibleIf?: {
    questionId: string
    value: string | string[] | boolean
  }
}

interface Step {
  id: string
  title: string
  questions: Question[]
}

interface QuestionnaireConfig {
  id: string
  title: string
  description: string
  steps: Step[]
  progress: {
    style: string
    showNumbers: boolean
    showTitles: boolean
  }
  navigation: {
    previousLabel: string
    nextLabel: string
    submitLabel: string
  }
}

interface QuestionnaireEngineProps {
  config: QuestionnaireConfig
  onComplete?: (answers: Record<string, unknown>) => void
  onAnalyticsEvent?: (event: string, data: Record<string, unknown>) => void
}

interface ValidationError {
  questionId: string
  message: string
}

const QUESTIONS_PER_VIEW = 3
const STORAGE_KEY = 'questionnaire-answers'

export function QuestionnaireEngine({ config, onComplete, onAnalyticsEvent }: QuestionnaireEngineProps) {
  const [currentViewIndex, setCurrentViewIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [_lastSaveTime, setLastSaveTime] = useState<Date | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const ariaLiveRef = useRef<HTMLDivElement>(null)
  const questionRefs = useRef<Record<string, HTMLElement | null>>({})
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Accessibility features
  const { 
    prefersReducedMotion, 
    announce, 
    ScreenReaderAnnouncer,
    createAriaProps,
    createKeyboardHandlers 
  } = useAccessibility()
  
  // Generate unique IDs for accessibility
  const questionnaireId = useMemo(() => accessibilityUtils.generateId('questionnaire'), [])
  const progressId = useMemo(() => accessibilityUtils.generateId('progress'), [])
  const navigationId = useMemo(() => accessibilityUtils.generateId('navigation'), [])
  
  // Get all questions from all steps
  const allQuestions = config.steps.flatMap(step => step.questions)
  
  // Filter questions based on visibleIf conditions with memoization
  const visibleQuestions = useMemo(() => {
    return allQuestions.filter(question => {
      if (!question.visibleIf) return true
      
      const { questionId, value: expectedValue } = question.visibleIf
      const currentValue = answers[questionId]
      
      if (Array.isArray(expectedValue)) {
        return expectedValue.includes(currentValue as string)
      }
      return currentValue === expectedValue
    })
  }, [allQuestions, answers])
  
  // Track previous visible questions count to handle smooth transitions
  const prevVisibleQuestionsRef = useRef(visibleQuestions.length)
  
  useEffect(() => {
    const currentCount = visibleQuestions.length
    const prevCount = prevVisibleQuestionsRef.current
    
    // If questions became visible/invisible, adjust current view if needed
    if (currentCount !== prevCount) {
      // Delay this check until questionViews is updated
      setTimeout(() => {
        setCurrentViewIndex(prev => {
          const maxViews = Math.ceil(visibleQuestions.length / QUESTIONS_PER_VIEW)
          return Math.min(prev, Math.max(0, maxViews - 1))
        })
      }, 0)
    }
    
    prevVisibleQuestionsRef.current = currentCount
  }, [visibleQuestions.length]) // Removed currentViewIndex to prevent infinite loop
  
  
  // Create views with 2-3 questions each
  const questionViews = useMemo(() => {
    const views = []
    for (let i = 0; i < visibleQuestions.length; i += QUESTIONS_PER_VIEW) {
      views.push(visibleQuestions.slice(i, i + QUESTIONS_PER_VIEW))
    }
    return views
  }, [visibleQuestions])
  
  const totalViews = questionViews.length
  const currentQuestions = useMemo(() => questionViews[currentViewIndex] ?? [], [questionViews, currentViewIndex])
  const canGoNext = currentViewIndex < totalViews
  const canGoBack = currentViewIndex > 0
  
  // Calculate progress
  const answeredQuestions = visibleQuestions.filter(q => {
    const answer = answers[q.id]
    return answer !== undefined && answer !== '' && (Array.isArray(answer) ? answer.length > 0 : true)
  }).length
  const progressPercent = Math.round((answeredQuestions / visibleQuestions.length) * 100)
  
  // Load saved answers from localStorage
  useEffect(() => {
    const savedAnswers = localStorage.getItem(STORAGE_KEY)
    if (savedAnswers) {
      try {
        const parsed = JSON.parse(savedAnswers)
        setAnswers(parsed)
        
        // Emit recovery event
        onAnalyticsEvent?.('questionnaire_recovered', {
          questionnaireId: config.id,
          answersCount: Object.keys(parsed).length
        })
      } catch (error) {
        console.warn('Failed to load saved answers:', error)
      }
    }
    
    // Emit start event
    onAnalyticsEvent?.('questionnaire_started', {
      questionnaireId: config.id,
      totalQuestions: allQuestions.length
    })
    
    // Emit webhook event for lead started questionnaire
    emitLeadStartedQuestionnaire({
      questionnaireId: config.id,
      source: 'questionnaire-engine',
      userId: 'demo-user' // TODO: Get from auth context
    }).catch(error => {
      console.warn('Failed to emit lead started questionnaire event:', error)
    })
  }, [config.id, allQuestions.length, onAnalyticsEvent])
  
  // Optimistic autosave with debouncing
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      setSaveStatus('saving')
      
      // Clear any existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      
      // Debounced save
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(answers))
          setLastSaveTime(new Date())
          setSaveStatus('saved')
          
          onAnalyticsEvent?.('questionnaire_autosaved', {
            questionnaireId: config.id,
            answersCount: Object.keys(answers).length,
            progress: progressPercent
          })
          
          // Reset status after showing saved state
          setTimeout(() => setSaveStatus('idle'), 2000)
        } catch (error) {
          console.warn('Failed to save answers:', error)
          setSaveStatus('error')
          toast.error('Failed to save your progress. Please check your connection.')
          setTimeout(() => setSaveStatus('idle'), 3000)
        }
      }, 800)
    }
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [answers, config.id, progressPercent, onAnalyticsEvent])
  
  // Update aria-live region for progress updates
  useEffect(() => {
    if (ariaLiveRef.current) {
      ariaLiveRef.current.textContent = `Progress: ${progressPercent}% complete, ${answeredQuestions} of ${visibleQuestions.length} questions answered. View ${currentViewIndex + 1} of ${totalViews}`
    }
  }, [progressPercent, answeredQuestions, visibleQuestions.length, currentViewIndex, totalViews])
  
  // Focus management for view changes
  useEffect(() => {
    // When view changes, focus first question
    if (currentQuestions.length > 0 && !isTransitioning) {
      const firstQuestionId = currentQuestions[0].id
      const questionElement = questionRefs.current[firstQuestionId]
      if (questionElement) {
        // Small delay to allow animation to complete
        setTimeout(() => {
          const focusableElement = questionElement.querySelector('input, select, textarea, button[role="radio"], button[role="checkbox"]') as HTMLElement
          focusableElement?.focus()
        }, 350)
      }
    }
  }, [currentViewIndex, currentQuestions, isTransitioning])
  
  const updateAnswer = useCallback((questionId: string, value: unknown) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
    
    // Clear validation error for this question
    setValidationErrors(prev => prev.filter(error => error.questionId !== questionId))
    
    onAnalyticsEvent?.('question_answered', {
      questionnaireId: config.id,
      questionId,
      questionType: allQuestions.find(q => q.id === questionId)?.type,
      value
    })
  }, [config.id, allQuestions, onAnalyticsEvent])
  
  const validateCurrentView = useCallback(() => {
    const errors: ValidationError[] = []
    
    currentQuestions.forEach(question => {
      if (question.required) {
        const answer = answers[question.id]
        const isEmpty = answer === undefined || 
          answer === '' || 
          (Array.isArray(answer) && answer.length === 0)
        
        if (isEmpty) {
          errors.push({
            questionId: question.id,
            message: 'This field is required'
          })
        }
      }
    })
    
    setValidationErrors(errors)
    return errors.length === 0
  }, [currentQuestions, answers])
  
  const handleNext = useCallback(async () => {
    if (!validateCurrentView()) {
      // Focus first error field
      const firstError = validationErrors[0]
      if (firstError) {
        const errorElement = questionRefs.current[firstError.questionId]
        if (errorElement) {
          const focusableElement = errorElement.querySelector('input, select, textarea, button') as HTMLElement
          focusableElement?.focus()
        }
      }
      
      onAnalyticsEvent?.('validation_failed', {
        questionnaireId: config.id,
        viewIndex: currentViewIndex,
        errors: validationErrors.length
      })
      return
    }
    
    setIsLoading(true)
    setIsTransitioning(true)
    setDirection('forward')
    
    // Add slight delay for smooth transition
    await new Promise(resolve => setTimeout(resolve, 150))
    
    if (currentViewIndex < totalViews - 1) {
      setCurrentViewIndex(prev => prev + 1)
      onAnalyticsEvent?.('view_advanced', {
        questionnaireId: config.id,
        fromView: currentViewIndex,
        toView: currentViewIndex + 1
      })
    } else {
      // Complete questionnaire
      const normalizedAnswers = { ...answers }
      
      localStorage.removeItem(STORAGE_KEY)
      
      onAnalyticsEvent?.('questionnaire_completed', {
        questionnaireId: config.id,
        totalQuestions: visibleQuestions.length,
        answeredQuestions: answeredQuestions,
        completionRate: progressPercent
      })
      
      // Emit webhook event for lead completed questionnaire
      emitLeadCompletedQuestionnaire({
        questionnaireId: config.id,
        answers: normalizedAnswers,
        source: 'questionnaire-engine',
        userId: 'demo-user' // TODO: Get from auth context
      }).catch(error => {
        console.warn('Failed to emit lead completed questionnaire event:', error)
      })
      
      onComplete?.(normalizedAnswers)
    }
    
    setIsLoading(false)
    setIsTransitioning(false)
  }, [validateCurrentView, currentViewIndex, totalViews, answers, config.id, visibleQuestions.length, answeredQuestions, progressPercent, validationErrors, onAnalyticsEvent, onComplete])
  
  const handlePrevious = useCallback(async () => {
    if (currentViewIndex > 0) {
      setIsTransitioning(true)
      setDirection('backward')
      
      // Add slight delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 150))
      
      setCurrentViewIndex(prev => prev - 1)
      onAnalyticsEvent?.('view_back', {
        questionnaireId: config.id,
        fromView: currentViewIndex,
        toView: currentViewIndex - 1
      })
      
      setIsTransitioning(false)
    }
  }, [currentViewIndex, config.id, onAnalyticsEvent])
  
  // Enhanced keyboard navigation with accessibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle if not in an input field
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement ||
          event.target instanceof HTMLSelectElement) {
        return
      }
      
      const isMetaOrCtrl = event.metaKey || event.ctrlKey
      
      if (isMetaOrCtrl) {
        switch (event.key) {
          case 'ArrowLeft':
            event.preventDefault()
            if (canGoBack && !isLoading && !isTransitioning) {
              announce(`Going back to previous questions`)
              handlePrevious()
            }
            break
          case 'ArrowRight':
            event.preventDefault()
            if (canGoNext && !isLoading && !isTransitioning) {
              announce(`Going to next questions`)
              handleNext()
            }
            break
          case 's':
            event.preventDefault()
            // Manual save trigger (though it's already auto-saving)
            if (Object.keys(answers).length > 0) {
              setSaveStatus('saving')
              announce('Saving your progress')
              localStorage.setItem(STORAGE_KEY, JSON.stringify(answers))
              setSaveStatus('saved')
              announce('Progress saved successfully')
              setTimeout(() => setSaveStatus('idle'), 1500)
            }
            break
          case 'h':
            event.preventDefault()
            // Show help
            announce('Keyboard shortcuts: Ctrl+Left/Right to navigate, Ctrl+S to save, Ctrl+H for help')
            break
        }
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [canGoBack, canGoNext, isLoading, isTransitioning, handleNext, handlePrevious, answers, announce])

  // Announce progress changes
  useEffect(() => {
    const currentStep = Math.floor(currentViewIndex / QUESTIONS_PER_VIEW) + 1
    const totalSteps = Math.ceil(visibleQuestions.length / QUESTIONS_PER_VIEW)
    const progressPercentage = Math.round((currentViewIndex / Math.max(visibleQuestions.length - 1, 1)) * 100)
    
    announce(`Step ${currentStep} of ${totalSteps}, ${progressPercentage}% complete`)
  }, [currentViewIndex, visibleQuestions.length, announce])
  
  const renderQuestion = (question: Question) => {
    const answer = answers[question.id]
    const error = validationErrors.find(e => e.questionId === question.id)
    const hasError = !!error
    
    // Generate unique IDs for accessibility
    const questionId = accessibilityUtils.generateId(`question-${question.id}`)
    const errorId = `${questionId}-error`
    const descriptionId = `${questionId}-description`
    
    const commonProps = {
      'aria-invalid': hasError,
      'aria-describedby': hasError ? errorId : undefined,
      'aria-required': question.required,
      ref: (el: HTMLElement | null) => {
        questionRefs.current[question.id] = el
      }
    }
    
    switch (question.type) {
      case 'chips':
        return (
          <fieldset key={question.id} className="space-y-3">
            <legend className={cn('text-base font-medium', hasError && 'text-destructive')}>
              {question.text}
              {question.required && <span className="text-destructive ml-1" aria-label="required">*</span>}
            </legend>
            <ChipGroup
              options={question.options?.map(opt => ({
                id: opt.value,
                label: opt.label,
                value: opt.value
              })) ?? []}
              value={(answer as string) ?? ''}
              onValueChange={(value) => updateAnswer(question.id, value)}
              allowCustom={question.allowCustom}
              {...commonProps}
              aria-label={question.text}
            />
            {hasError && (
              <p id={errorId} className="text-sm text-destructive" role="alert" aria-live="polite">
                {error.message}
              </p>
            )}
          </fieldset>
        )
      
      case 'chips-multi':
        return (
          <div key={question.id} className="space-y-3">
            <Label className={cn('text-base font-medium', hasError && 'text-destructive')}>
              {question.text}
              {question.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <ChipGroup
              options={question.options?.map(opt => ({
                id: opt.value,
                label: opt.label,
                value: opt.value
              })) ?? []}
              value={(answer as string[]) ?? []}
              onValueChange={(value) => updateAnswer(question.id, value)}
              multiple={true}
              allowCustom={question.allowCustom}
              {...commonProps}
            />
            {hasError && (
              <p id={`${question.id}-error`} className="text-sm text-destructive">
                {error.message}
              </p>
            )}
          </div>
        )
      
      case 'select':
        return (
          <div key={question.id} className="space-y-3">
            <Label className={cn('text-base font-medium', hasError && 'text-destructive')}>
              {question.text}
              {question.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Select
              value={(answer as string) ?? ''}
              onValueChange={(value) => updateAnswer(question.id, value)}
              {...commonProps}
            >
              <SelectTrigger className={cn(hasError && 'border-destructive')}>
                <SelectValue placeholder="Select an option..." />
              </SelectTrigger>
              <SelectContent>
                {question.options?.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasError && (
              <p id={`${question.id}-error`} className="text-sm text-destructive">
                {error.message}
              </p>
            )}
          </div>
        )
      
      case 'toggle':
        return (
          <div key={question.id} className="space-y-3">
            <div className="flex items-center space-x-3">
              <Switch
                checked={(answer as boolean) ?? false}
                onCheckedChange={(checked) => updateAnswer(question.id, checked)}
                {...commonProps}
              />
              <Label className={cn('text-base font-medium', hasError && 'text-destructive')}>
                {question.text}
                {question.required && <span className="text-destructive ml-1">*</span>}
              </Label>
            </div>
            {hasError && (
              <p id={`${question.id}-error`} className="text-sm text-destructive">
                {error.message}
              </p>
            )}
          </div>
        )
      
      case 'long-text':
        return (
          <div key={question.id} className="space-y-3">
            <Label className={cn('text-base font-medium', hasError && 'text-destructive')}>
              {question.text}
              {question.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Textarea
              value={(answer as string) ?? ''}
              onChange={(e) => updateAnswer(question.id, e.target.value)}
              placeholder={question.placeholder}
              className={cn(hasError && 'border-destructive')}
              rows={4}
              {...commonProps}
            />
            {hasError && (
              <p id={`${question.id}-error`} className="text-sm text-destructive">
                {error.message}
              </p>
            )}
          </div>
        )
      
      case 'text':
      default:
        return (
          <div key={question.id} className="space-y-3">
            <Label className={cn('text-base font-medium', hasError && 'text-destructive')}>
              {question.text}
              {question.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              value={(answer as string) ?? ''}
              onChange={(e) => updateAnswer(question.id, e.target.value)}
              placeholder={question.placeholder}
              className={cn(hasError && 'border-destructive')}
              {...commonProps}
            />
            {hasError && (
              <p id={`${question.id}-error`} className="text-sm text-destructive">
                {error.message}
              </p>
            )}
          </div>
        )
    }
  }
  
  const isLastView = currentViewIndex === totalViews - 1
  
  // Check if minimum required questions are answered for current view
  const currentRequiredQuestions = currentQuestions.filter(q => q.required)
  const currentAnsweredRequired = currentRequiredQuestions.filter(q => {
    const answer = answers[q.id]
    return answer !== undefined && answer !== '' && (Array.isArray(answer) ? answer.length > 0 : true)
  })
  const hasMinRequiredAnswers = currentAnsweredRequired.length >= Math.min(currentRequiredQuestions.length, 1)
  
  // Animation variants
  const containerVariants = {
    enter: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: 'forward' | 'backward') => ({
      zIndex: 0,
      x: direction === 'forward' ? -300 : 300,
      opacity: 0
    })
  }
  
  const transition = {
    type: "tween" as const,
    ease: [0.2, 0.8, 0.2, 1] as const,
    duration: 0.3
  }
  
  return (
    <div 
      className="max-w-2xl mx-auto p-4 md:p-6"
      {...createAriaProps({
        role: 'main',
        label: config.title,
        description: config.description
      })}
    >
      {/* Skip Links */}
      <SkipLink href="#questions">Skip to questions</SkipLink>
      <SkipLink href="#navigation">Skip to navigation</SkipLink>
      
      {/* Screen Reader Announcer */}
      {ScreenReaderAnnouncer}
      
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{config.title}</h1>
        <p className="text-sm md:text-base text-muted-foreground mb-3">{config.description}</p>
        <div className="hidden md:block text-xs text-muted-foreground/70">
          Use Ctrl+← and Ctrl+→ to navigate, Ctrl+S to save, Ctrl+H for help
        </div>
      </div>
      
      {/* Progress Bar */}
      <section 
        className="mb-6 md:mb-8"
        {...createAriaProps({
          role: 'region',
          label: 'Questionnaire progress'
        })}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2">
          {config.progress.showNumbers && (
            <span 
              className="text-xs md:text-sm font-medium text-muted-foreground"
              aria-live="polite"
            >
              Question {currentViewIndex * QUESTIONS_PER_VIEW + 1}-{Math.min((currentViewIndex + 1) * QUESTIONS_PER_VIEW, visibleQuestions.length)} of {visibleQuestions.length}
            </span>
          )}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Save Status Indicator */}
            <AnimatePresence>
              {saveStatus !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1 text-xs text-muted-foreground"
                  aria-live="polite"
                  aria-label={`Save status: ${saveStatus}`}
                >
                  {saveStatus === 'saving' && (
                    <>
                      <div className="w-3 h-3 border border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                      <span className="hidden sm:inline">Saving...</span>
                    </>
                  )}
                  {saveStatus === 'saved' && (
                    <>
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span className="text-green-600 hidden sm:inline">Saved</span>
                    </>
                  )}
                  {saveStatus === 'error' && (
                    <>
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      <span className="text-red-600 hidden sm:inline">Save failed</span>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <span 
              className="text-xs md:text-sm font-medium text-muted-foreground"
              aria-live="polite"
            >
              {progressPercent}% complete
            </span>
          </div>
        </div>
        <Progress 
          value={progressPercent} 
          className="h-2"
          aria-label={`Progress: ${progressPercent}% complete`}
        />
      </section>
      
      {/* Questions with Animation */}
      <section 
        id="questions"
        className="relative overflow-hidden mb-6 md:mb-8"
        {...createAriaProps({
          role: 'region',
          label: 'Questionnaire questions'
        })}
      >
        <OptimizedAnimatePresence custom={direction}>
          {currentQuestions.map((question, index) => (
            <OptimizedMotion
              key={`${currentViewIndex}-${question.id}`}
              custom={direction}
              variants={containerVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
              className="space-y-6 md:space-y-8"
            >
              <OptimizedMotion
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: index * 0.1, duration: 0.3 }
                }}
                className="bg-card/50 p-4 md:p-6 rounded-lg border border-border/50 backdrop-blur-sm"
                {...createAriaProps({
                  role: 'group',
                  label: `Question ${currentViewIndex * QUESTIONS_PER_VIEW + index + 1}`
                })}
              >
                {renderQuestion(question)}
              </OptimizedMotion>
            </OptimizedMotion>
          ))}
        </OptimizedAnimatePresence>
      </section>
      
      {/* Navigation */}
      <nav 
        id="navigation"
        className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4 md:pt-6 border-t border-border"
        {...createAriaProps({
          role: 'navigation',
          label: 'Questionnaire navigation'
        })}
      >
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={!canGoBack || isLoading || isTransitioning}
          className="min-w-[100px] order-2 sm:order-1"
          size="lg"
          {...createAriaProps({
            label: `Go to previous questions${!canGoBack ? ' (disabled)' : ''}`
          })}
        >
          {config.navigation.previousLabel}
        </Button>
        
        {/* Helper text for validation */}
        {!hasMinRequiredAnswers && currentRequiredQuestions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs md:text-sm text-muted-foreground text-center px-4 order-3 sm:order-2 sm:absolute sm:left-1/2 sm:transform sm:-translate-x-1/2"
            role="alert"
            aria-live="polite"
          >
            Please answer all required questions to continue
          </motion.div>
        )}
        
        <Button
          onClick={handleNext}
          disabled={!hasMinRequiredAnswers || isLoading || isTransitioning || !canGoNext}
          className="min-w-[140px] order-1 sm:order-3"
          size="lg"
          {...createAriaProps({
            label: `${isLastView ? 'Submit' : 'Go to next questions'}${(!hasMinRequiredAnswers || isLoading || isTransitioning || !canGoNext) ? ' (disabled)' : ''}`
          })}
        >
          {isLoading || isTransitioning ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            isLastView ? config.navigation.submitLabel : config.navigation.nextLabel
          )}
        </Button>
      </nav>
    </div>
  )
}