'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface StepperStep {
  id: string
  label?: string
  description?: string
  status: 'complete' | 'current' | 'upcoming'
}

interface StepperProps {
  steps: StepperStep[]
  className?: string
  showLabels?: boolean
  orientation?: 'horizontal' | 'vertical'
}

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  ({ steps, className, showLabels = false, orientation = 'horizontal', ...props }, ref) => {
    const completedSteps = steps.filter(step => step.status === 'complete').length
    const currentStepIndex = steps.findIndex(step => step.status === 'current')
    const progressPercentage = ((completedSteps + (currentStepIndex >= 0 ? 0.5 : 0)) / steps.length) * 100
    const ariaLiveRef = React.useRef<HTMLDivElement>(null)
    const [prevCurrentStep, setPrevCurrentStep] = React.useState(currentStepIndex)

    // Update aria-live region when current step changes
    React.useEffect(() => {
      if (currentStepIndex !== prevCurrentStep && ariaLiveRef.current) {
        const currentStep = steps[currentStepIndex]
        if (currentStep) {
          const stepLabel = currentStep.label ?? `Step ${currentStepIndex + 1}`
          ariaLiveRef.current.textContent = `Now on ${stepLabel}. ${currentStep.description ?? ''} Step ${currentStepIndex + 1} of ${steps.length}.`
        }
        setPrevCurrentStep(currentStepIndex)
      }
    }, [currentStepIndex, prevCurrentStep, steps])

    return (
      <>
        <div aria-live="polite" aria-atomic="true" className="sr-only" ref={ariaLiveRef} />
        <div
          ref={ref}
          className={cn(
            'stepper',
            orientation === 'horizontal' ? 'flex items-center w-full' : 'flex flex-col h-full',
            className
          )}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={steps.length}
          aria-valuenow={completedSteps}
          aria-valuetext={`Step ${currentStepIndex + 1} of ${steps.length}`}
          {...props}
        >
        {orientation === 'horizontal' ? (
          <>
            {/* Progress bar */}
            <div className="relative flex-1 mx-2">
              <div 
                className="h-[var(--stepper-connector-height)] bg-border rounded-full"
                aria-hidden="true"
              >
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.max(progressPercentage, 2)}%` }}
                />
              </div>
            </div>
            
            {/* Step indicators */}
            <div className="flex items-center justify-between absolute inset-0 px-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    'flex flex-col items-center',
                    showLabels ? 'gap-2' : ''
                  )}
                >
                  <div
                    className={cn(
                      'flex items-center justify-center rounded-full border-[var(--stepper-border-width)]',
                      'w-[var(--stepper-size)] h-[var(--stepper-size)]',
                      'text-sm font-medium transition-colors',
                      step.status === 'complete' && 'bg-primary border-primary text-primary-foreground',
                      step.status === 'current' && 'bg-background border-primary text-primary ring-2 ring-primary ring-offset-2',
                      step.status === 'upcoming' && 'bg-background border-border text-muted-foreground'
                    )}
                    aria-current={step.status === 'current' ? 'step' : undefined}
                  >
                    {step.status === 'complete' ? (
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5"
                        />
                      </svg>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  
                  {showLabels && (
                    <div className="text-center">
                      <div
                        className={cn(
                          'text-sm font-medium',
                          step.status === 'current' ? 'text-foreground' : 'text-muted-foreground'
                        )}
                      >
                        {step.label}
                      </div>
                      {step.description && (
                        <div className="text-xs text-muted-foreground">
                          {step.description}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          // Vertical layout
          <div className="flex flex-col space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'flex items-center justify-center rounded-full border-[var(--stepper-border-width)]',
                      'w-[var(--stepper-size)] h-[var(--stepper-size)]',
                      'text-sm font-medium transition-colors flex-shrink-0',
                      step.status === 'complete' && 'bg-primary border-primary text-primary-foreground',
                      step.status === 'current' && 'bg-background border-primary text-primary ring-2 ring-primary ring-offset-2',
                      step.status === 'upcoming' && 'bg-background border-border text-muted-foreground'
                    )}
                    aria-current={step.status === 'current' ? 'step' : undefined}
                  >
                    {step.status === 'complete' ? (
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5"
                        />
                      </svg>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className="flex-1 border-l border-border ml-[calc(var(--stepper-size)/2-0.5px)] mt-2 h-8" />
                  )}
                </div>
                
                {showLabels && (
                  <div className="flex-1 pb-8">
                    <div
                      className={cn(
                        'text-sm font-medium',
                        step.status === 'current' ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {step.label}
                    </div>
                    {step.description && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {step.description}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        </div>
      </>
    )
  }
)

Stepper.displayName = 'Stepper'

export { Stepper }
export type { StepperProps, StepperStep }