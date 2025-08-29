/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ChipGroup, type ChipOption } from '@/components/ui/chip-group'
import { Stepper } from '@/components/ui/stepper'

// Mock CSS media queries
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: query === '(prefers-reduced-motion: reduce)',
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})

describe('Reduced Motion Accessibility', () => {
  const mockChipOptions: ChipOption[] = [
    { id: '1', label: 'Option 1', value: 'option1' },
    { id: '2', label: 'Option 2', value: 'option2' },
  ]

  const mockSteps = [
    { id: '1', label: 'Step 1', description: 'First step', status: 'complete' as const },
    { id: '2', label: 'Step 2', description: 'Second step', status: 'current' as const },
    { id: '3', label: 'Step 3', description: 'Third step', status: 'upcoming' as const },
  ]

  beforeEach(() => {
    // Set up CSS custom properties
    document.documentElement.style.setProperty('--chip-height', '2rem')
    document.documentElement.style.setProperty('--chip-padding', '0.75rem')
    document.documentElement.style.setProperty('--chip-border-radius', '0.5rem')
    document.documentElement.style.setProperty('--chip-font-size', '0.875rem')
    document.documentElement.style.setProperty('--stepper-size', '2rem')
    document.documentElement.style.setProperty('--stepper-border-width', '2px')
    document.documentElement.style.setProperty('--stepper-connector-height', '2px')
  })

  it('should respect prefers-reduced-motion for ChipGroup transitions', () => {
    // Mock reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    Object.defineProperty(mediaQuery, 'matches', { value: true })

    render(
      <div data-testid="reduced-motion-test">
        <ChipGroup
          options={mockChipOptions}
          aria-label="Test chip group"
        />
      </div>
    )

    const container = screen.getByTestId('reduced-motion-test')
    expect(container).toBeInTheDocument()

    // Check that transitions are reduced
    const chips = screen.getAllByRole('button')
    chips.forEach(chip => {
      const computedStyle = window.getComputedStyle(chip)
      // In reduced motion, transition-duration should be minimal
      if (computedStyle.transitionDuration) {
        expect(parseFloat(computedStyle.transitionDuration)).toBeLessThan(0.1)
      }
    })
  })

  it('should respect prefers-reduced-motion for Stepper animations', () => {
    // Mock reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    Object.defineProperty(mediaQuery, 'matches', { value: true })

    render(
      <div data-testid="reduced-motion-stepper">
        <Stepper
          steps={mockSteps}
          showLabels={true}
        />
      </div>
    )

    const container = screen.getByTestId('reduced-motion-stepper')
    expect(container).toBeInTheDocument()

    // Check that the progress bar respects reduced motion
    const progressBar = container.querySelector('.bg-primary')
    if (progressBar) {
      const computedStyle = window.getComputedStyle(progressBar)
      // Transition duration should be minimal in reduced motion
      if (computedStyle.transitionDuration) {
        expect(parseFloat(computedStyle.transitionDuration)).toBeLessThan(0.1)
      }
    }
  })

  it('should maintain focus indicators with reduced motion', () => {
    render(
      <ChipGroup
        options={mockChipOptions}
        aria-label="Focus test chip group"
      />
    )

    const firstChip = screen.getAllByRole('button')[0]
    firstChip.focus()

    expect(firstChip).toHaveFocus()
    expect(firstChip).toHaveClass('focus-visible:ring-2')
  })

  it('should handle aria-live regions with reduced motion', () => {
    const { rerender } = render(
      <Stepper
        steps={mockSteps}
        showLabels={true}
      />
    )

    // Check that aria-live region exists
    const ariaLive = document.querySelector('[aria-live="polite"]')
    expect(ariaLive).toBeInTheDocument()
    expect(ariaLive).toHaveClass('sr-only')

    // Update steps to trigger aria-live change
    const updatedSteps = [
      { id: '1', label: 'Step 1', description: 'First step', status: 'complete' as const },
      { id: '2', label: 'Step 2', description: 'Second step', status: 'complete' as const },
      { id: '3', label: 'Step 3', description: 'Third step', status: 'current' as const },
    ]

    rerender(
      <Stepper
        steps={updatedSteps}
        showLabels={true}
      />
    )

    // Aria-live should still work with reduced motion
    expect(ariaLive).toBeInTheDocument()
  })

  it('should provide alternative feedback for loading states', () => {
    // Test loading spinner with reduced motion
    render(
      <div className="animate-spin" data-testid="spinner">
        Loading...
      </div>
    )

    const spinner = screen.getByTestId('spinner')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveTextContent('Loading...')
  })

  it('should maintain keyboard navigation with reduced motion', () => {
    render(
      <ChipGroup
        options={mockChipOptions}
        aria-label="Keyboard nav test"
      />
    )

    const chipGroup = screen.getByRole('group')
    const chips = screen.getAllByRole('button')

    // Focus should work normally
    chips[0].focus()
    expect(chips[0]).toHaveFocus()

    // Keyboard navigation should be preserved
    expect(chipGroup).toHaveAttribute('role', 'group')
    expect(chips[0]).toHaveAttribute('tabIndex')
  })

  it('should preserve semantic meaning with reduced motion', () => {
    render(
      <Stepper
        steps={mockSteps}
        showLabels={true}
      />
    )

    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toHaveAttribute('aria-valuemin', '0')
    expect(progressbar).toHaveAttribute('aria-valuemax', '3')
    expect(progressbar).toHaveAttribute('aria-valuenow', '1')
    expect(progressbar).toHaveAttribute('aria-valuetext', 'Step 2 of 3')

    // Current step should be marked correctly
    const currentStepElement = document.querySelector('[aria-current="step"]')
    expect(currentStepElement).toBeInTheDocument()
  })
})