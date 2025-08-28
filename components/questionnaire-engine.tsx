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
    value: string | string[]
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

const QUESTIONS_PER_VIEW = 2
const STORAGE_KEY = 'questionnaire-answers'

export function QuestionnaireEngine({ config, onComplete, onAnalyticsEvent }: QuestionnaireEngineProps) {
  const [currentViewIndex, setCurrentViewIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const ariaLiveRef = useRef<HTMLDivElement>(null)
  
  // Get all questions from all steps
  const allQuestions = config.steps.flatMap(step => step.questions)
  
  // Filter questions based on visibleIf conditions
  const visibleQuestions = allQuestions.filter(question => {
    if (!question.visibleIf) return true
    
    const { questionId, value: expectedValue } = question.visibleIf
    const currentValue = answers[questionId]
    
    if (Array.isArray(expectedValue)) {
      return expectedValue.includes(currentValue as string)
    }
    return currentValue === expectedValue
  })
  
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
  }, [config.id, allQuestions.length, onAnalyticsEvent])
  
  // Auto-save to localStorage
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(answers))
      
      onAnalyticsEvent?.('questionnaire_autosaved', {
        questionnaireId: config.id,
        answersCount: Object.keys(answers).length,
        progress: progressPercent
      })
    }
  }, [answers, config.id, progressPercent, onAnalyticsEvent])
  
  // Update aria-live region for progress updates
  useEffect(() => {
    if (ariaLiveRef.current) {
      ariaLiveRef.current.textContent = `Progress: ${progressPercent}% complete, ${answeredQuestions} of ${visibleQuestions.length} questions answered`
    }
  }, [progressPercent, answeredQuestions, visibleQuestions.length])
  
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
      onAnalyticsEvent?.('validation_failed', {
        questionnaireId: config.id,
        viewIndex: currentViewIndex,
        errors: validationErrors.length
      })
      return
    }
    
    setIsLoading(true)
    
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
      
      onComplete?.(normalizedAnswers)
    }
    
    setIsLoading(false)
  }, [validateCurrentView, currentViewIndex, totalViews, answers, config.id, visibleQuestions.length, answeredQuestions, progressPercent, validationErrors.length, onAnalyticsEvent, onComplete])
  
  const handlePrevious = useCallback(() => {
    if (currentViewIndex > 0) {
      setCurrentViewIndex(prev => prev - 1)
      onAnalyticsEvent?.('view_back', {
        questionnaireId: config.id,
        fromView: currentViewIndex,
        toView: currentViewIndex - 1
      })
    }
  }, [currentViewIndex, config.id, onAnalyticsEvent])
  
  const renderQuestion = (question: Question) => {
    const answer = answers[question.id]
    const error = validationErrors.find(e => e.questionId === question.id)
    const hasError = !!error
    
    const commonProps = {
      'aria-invalid': hasError,
      'aria-describedby': hasError ? `${question.id}-error` : undefined
    }
    
    switch (question.type) {
      case 'chips':
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
              value={(answer as string) ?? ''}
              onValueChange={(value) => updateAnswer(question.id, value)}
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
  const canGoNext = currentViewIndex < totalViews
  const canGoBack = currentViewIndex > 0
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div aria-live="polite" aria-atomic="true" className="sr-only" ref={ariaLiveRef} />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">{config.title}</h1>
        <p className="text-muted-foreground">{config.description}</p>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          {config.progress.showNumbers && (
            <span className="text-sm font-medium text-muted-foreground">
              Question {currentViewIndex * QUESTIONS_PER_VIEW + 1}-{Math.min((currentViewIndex + 1) * QUESTIONS_PER_VIEW, visibleQuestions.length)} of {visibleQuestions.length}
            </span>
          )}
          <span className="text-sm font-medium text-muted-foreground">
            {progressPercent}% complete
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>
      
      {/* Questions */}
      <div className="space-y-8 mb-8">
        {currentQuestions.map(renderQuestion)}
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t border-border">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={!canGoBack || isLoading}
        >
          {config.navigation.previousLabel}
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!canGoNext || isLoading}
        >
          {isLoading ? 'Loading...' : isLastView ? config.navigation.submitLabel : config.navigation.nextLabel}
        </Button>
      </div>
    </div>
  )
}