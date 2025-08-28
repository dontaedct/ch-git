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
            'stepper w-full',
            '[--stepper-size:1.75rem]',
            '[--stepper-border-width:2px]',
            '[--stepper-connector-height:2px]',
            orientation === 'vertical' && 'h-full',
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
          <div className="relative flex items-center w-full">
            <div className="relative flex-1 mx-3">
              <div 
                className="h-[var(--stepper-connector-height)] bg-muted rounded-full overflow-hidden"
                aria-hidden="true"
              >
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${Math.max(progressPercentage, 2)}%`,
                    transformOrigin: 'left center'
                  }}
                />
              </div>
            </div>
            
            <div className="absolute inset-0 flex items-center justify-between px-0">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    'flex flex-col items-center relative',
                    showLabels ? 'gap-2' : ''
                  )}
                >
                  <div
                    className={cn(
                      'flex items-center justify-center rounded-full border-[var(--stepper-border-width)]',
                      'w-[var(--stepper-size)] h-[var(--stepper-size)] z-10',
                      'text-xs font-semibold transition-all duration-300 ease-out',
                      'bg-background shadow-sm',
                      step.status === 'complete' && [
                        'bg-primary border-primary text-primary-foreground',
                        'scale-100'
                      ],
                      step.status === 'current' && [
                        'bg-background border-primary text-primary',
                        'ring-4 ring-primary/20 ring-offset-0',
                        'scale-110'
                      ],
                      step.status === 'upcoming' && [
                        'bg-background border-muted text-muted-foreground',
                        'scale-100'
                      ]
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
                    <div className="text-center max-w-20">
                      <div
                        className={cn(
                          'text-xs font-medium leading-tight',
                          step.status === 'current' ? 'text-foreground' : 'text-muted-foreground'
                        )}
                      >
                        {step.label}
                      </div>
                      {step.description && (
                        <div className="text-xs text-muted-foreground mt-0.5 leading-tight">
                          {step.description}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'flex items-center justify-center rounded-full border-[var(--stepper-border-width)]',
                      'w-[var(--stepper-size)] h-[var(--stepper-size)] flex-shrink-0',
                      'text-xs font-semibold transition-all duration-300 ease-out',
                      'bg-background shadow-sm',
                      step.status === 'complete' && [
                        'bg-primary border-primary text-primary-foreground'
                      ],
                      step.status === 'current' && [
                        'bg-background border-primary text-primary',
                        'ring-4 ring-primary/20 ring-offset-0',
                        'scale-110'
                      ],
                      step.status === 'upcoming' && [
                        'bg-background border-muted text-muted-foreground'
                      ]
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
                    <div className={cn(
                      "w-[2px] mt-2 transition-colors duration-300",
                      "flex-1 min-h-[1.5rem]",
                      step.status === 'complete' ? 'bg-primary' : 'bg-muted'
                    )} />
                  )}
                </div>
                
                {showLabels && (
                  <div className="flex-1 pb-2 -mt-0.5">
                    <div
                      className={cn(
                        'text-sm font-medium leading-tight',
                        step.status === 'current' ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {step.label}
                    </div>
                    {step.description && (
                      <div className="text-xs text-muted-foreground mt-1 leading-normal">
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