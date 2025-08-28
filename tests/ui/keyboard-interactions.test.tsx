/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ChipGroup, type ChipOption } from '@/components/ui/chip-group'
import { TabsUnderline, TabsUnderlineList, TabsUnderlineTrigger, TabsUnderlineContent } from '@/components/ui/tabs-underline'

// Mock the design tokens CSS variables
beforeEach(() => {
  document.documentElement.style.setProperty('--chip-height', '1.75rem')
  document.documentElement.style.setProperty('--chip-padding', '0.25rem 0.75rem')
  document.documentElement.style.setProperty('--chip-border-radius', '9999px')
  document.documentElement.style.setProperty('--chip-font-size', '0.875rem')
})

describe('ChipGroup Keyboard Interactions', () => {
  const mockOptions: ChipOption[] = [
    { id: '1', label: 'Option 1', value: 'option1' },
    { id: '2', label: 'Option 2', value: 'option2' },
    { id: '3', label: 'Option 3', value: 'option3', disabled: true },
    { id: '4', label: 'Option 4', value: 'option4' },
  ]

  it('should navigate between chips using arrow keys', () => {
    render(
      <ChipGroup
        options={mockOptions}
        aria-label="Test chip group"
      />
    )

    const chipGroup = screen.getByRole('group')
    const chips = screen.getAllByRole('button')

    // Focus first chip initially
    chips[0].focus()
    expect(chips[0]).toHaveFocus()

    // Press ArrowRight to move to next chip
    fireEvent.keyDown(chipGroup, { key: 'ArrowRight' })
    expect(chips[1]).toHaveFocus()

    // Press ArrowRight again
    fireEvent.keyDown(chipGroup, { key: 'ArrowRight' })
    expect(chips[2]).toHaveFocus()

    // Press ArrowLeft to move back
    fireEvent.keyDown(chipGroup, { key: 'ArrowLeft' })
    expect(chips[1]).toHaveFocus()
  })

  it('should handle edge cases in navigation', () => {
    render(
      <ChipGroup
        options={mockOptions}
        aria-label="Test chip group"
      />
    )

    const chipGroup = screen.getByRole('group')
    const chips = screen.getAllByRole('button')

    // Focus first chip
    chips[0].focus()
    
    // Press ArrowLeft at the beginning (should stay at first)
    fireEvent.keyDown(chipGroup, { key: 'ArrowLeft' })
    expect(chips[0]).toHaveFocus()

    // Navigate to last chip
    fireEvent.keyDown(chipGroup, { key: 'ArrowRight' })
    fireEvent.keyDown(chipGroup, { key: 'ArrowRight' })
    fireEvent.keyDown(chipGroup, { key: 'ArrowRight' })
    expect(chips[3]).toHaveFocus()

    // Press ArrowRight at the end (should stay at last)
    fireEvent.keyDown(chipGroup, { key: 'ArrowRight' })
    expect(chips[3]).toHaveFocus()
  })

  it('should select chip with Enter key', () => {
    const onValueChange = jest.fn()
    render(
      <ChipGroup
        options={mockOptions}
        onValueChange={onValueChange}
        aria-label="Test chip group"
      />
    )

    const chipGroup = screen.getByRole('group')
    const firstChip = screen.getAllByRole('button')[0]

    firstChip.focus()
    fireEvent.keyDown(chipGroup, { key: 'Enter' })

    expect(onValueChange).toHaveBeenCalledWith('option1')
  })

  it('should select chip with Space key', () => {
    const onValueChange = jest.fn()
    render(
      <ChipGroup
        options={mockOptions}
        onValueChange={onValueChange}
        aria-label="Test chip group"
      />
    )

    const chipGroup = screen.getByRole('group')
    const firstChip = screen.getAllByRole('button')[0]

    firstChip.focus()
    fireEvent.keyDown(chipGroup, { key: ' ' })

    expect(onValueChange).toHaveBeenCalledWith('option1')
  })

  it('should not select disabled chips', () => {
    const onValueChange = jest.fn()
    render(
      <ChipGroup
        options={mockOptions}
        onValueChange={onValueChange}
        aria-label="Test chip group"
      />
    )

    const chipGroup = screen.getByRole('group')
    const chips = screen.getAllByRole('button')
    
    // Navigate to disabled chip
    chips[2].focus()
    fireEvent.keyDown(chipGroup, { key: 'Enter' })

    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('should handle multiple selection mode', () => {
    const onValueChange = jest.fn()
    render(
      <ChipGroup
        options={mockOptions}
        multiple
        onValueChange={onValueChange}
        aria-label="Test chip group"
      />
    )

    const chipGroup = screen.getByRole('group')
    const firstChip = screen.getAllByRole('button')[0]
    const secondChip = screen.getAllByRole('button')[1]

    // Select first chip
    firstChip.focus()
    fireEvent.keyDown(chipGroup, { key: 'Enter' })
    expect(onValueChange).toHaveBeenCalledWith(['option1'])

    // Navigate and select second chip
    fireEvent.keyDown(chipGroup, { key: 'ArrowRight' })
    fireEvent.keyDown(chipGroup, { key: 'Enter' })
    expect(onValueChange).toHaveBeenCalledWith(['option2'])
  })

  it('should handle allowCustom with keyboard navigation', async () => {
    render(
      <ChipGroup
        options={mockOptions}
        allowCustom
        customPlaceholder="Add custom"
        aria-label="Test chip group"
      />
    )

    const chipGroup = screen.getByRole('group')
    const addButton = screen.getByRole('button', { name: /add custom/i })

    // Navigate to add button
    addButton.focus()
    fireEvent.keyDown(chipGroup, { key: 'Enter' })

    // Should show input
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Add custom')).toBeInTheDocument()
    })
  })

  it('should handle Escape key in custom input', async () => {
    render(
      <ChipGroup
        options={mockOptions}
        allowCustom
        aria-label="Test chip group"
      />
    )

    const addButton = screen.getByRole('button', { name: /add custom/i })
    fireEvent.click(addButton)

    const input = await screen.findByRole('textbox')
    fireEvent.change(input, { target: { value: 'custom value' } })
    fireEvent.keyDown(input, { key: 'Escape' })

    await waitFor(() => {
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })
  })
})

describe('TabsUnderline Keyboard Interactions', () => {
  const TabsComponent = () => (
    <TabsUnderline defaultValue="tab1">
      <TabsUnderlineList>
        <TabsUnderlineTrigger value="tab1">Tab 1</TabsUnderlineTrigger>
        <TabsUnderlineTrigger value="tab2">Tab 2</TabsUnderlineTrigger>
        <TabsUnderlineTrigger value="tab3" disabled>Tab 3</TabsUnderlineTrigger>
        <TabsUnderlineTrigger value="tab4">Tab 4</TabsUnderlineTrigger>
      </TabsUnderlineList>
      <TabsUnderlineContent value="tab1">Content 1</TabsUnderlineContent>
      <TabsUnderlineContent value="tab2">Content 2</TabsUnderlineContent>
      <TabsUnderlineContent value="tab3">Content 3</TabsUnderlineContent>
      <TabsUnderlineContent value="tab4">Content 4</TabsUnderlineContent>
    </TabsUnderline>
  )

  it('should navigate between tabs using arrow keys', () => {
    render(<TabsComponent />)

    const tab1 = screen.getByRole('tab', { name: 'Tab 1' })
    const tab2 = screen.getByRole('tab', { name: 'Tab 2' })
    const tab3 = screen.getByRole('tab', { name: 'Tab 3' })

    // Focus first tab
    tab1.focus()
    expect(tab1).toHaveFocus()

    // Press ArrowRight to navigate to next tab
    fireEvent.keyDown(tab1, { key: 'ArrowRight' })
    expect(tab2).toHaveFocus()

    // Press ArrowRight again to navigate to next tab (even if disabled)
    fireEvent.keyDown(tab2, { key: 'ArrowRight' })
    expect(tab3).toHaveFocus()
  })

  it('should navigate using ArrowLeft', () => {
    render(<TabsComponent />)

    const tab1 = screen.getByRole('tab', { name: 'Tab 1' })
    const tab2 = screen.getByRole('tab', { name: 'Tab 2' })

    // Focus second tab
    tab2.focus()
    expect(tab2).toHaveFocus()

    // Press ArrowLeft to navigate back
    fireEvent.keyDown(tab2, { key: 'ArrowLeft' })
    expect(tab1).toHaveFocus()
  })

  it('should activate tab with Enter key', () => {
    render(<TabsComponent />)

    const tab2 = screen.getByRole('tab', { name: 'Tab 2' })
    
    tab2.focus()
    fireEvent.keyDown(tab2, { key: 'Enter' })

    expect(tab2).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('Content 2')).toBeVisible()
  })

  it('should activate tab with Space key', () => {
    render(<TabsComponent />)

    const tab2 = screen.getByRole('tab', { name: 'Tab 2' })
    
    tab2.focus()
    fireEvent.keyDown(tab2, { key: ' ' })

    expect(tab2).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('Content 2')).toBeVisible()
  })

  it('should handle Home key to navigate to first tab', () => {
    render(<TabsComponent />)

    const tab1 = screen.getByRole('tab', { name: 'Tab 1' })
    const tab4 = screen.getByRole('tab', { name: 'Tab 4' })

    // Focus last tab
    tab4.focus()
    expect(tab4).toHaveFocus()

    // Press Home to navigate to first tab
    fireEvent.keyDown(tab4, { key: 'Home' })
    expect(tab1).toHaveFocus()
  })

  it('should handle End key to navigate to last tab', () => {
    render(<TabsComponent />)

    const tab1 = screen.getByRole('tab', { name: 'Tab 1' })
    const tab4 = screen.getByRole('tab', { name: 'Tab 4' })

    // Focus first tab
    tab1.focus()
    expect(tab1).toHaveFocus()

    // Press End to navigate to last tab
    fireEvent.keyDown(tab1, { key: 'End' })
    expect(tab4).toHaveFocus()
  })

  it('should have proper ARIA attributes', () => {
    render(<TabsComponent />)

    const tab1 = screen.getByRole('tab', { name: 'Tab 1' })
    const tab2 = screen.getByRole('tab', { name: 'Tab 2' })
    const tablist = screen.getByRole('tablist')
    const tabpanel = screen.getByRole('tabpanel')

    expect(tablist).toBeInTheDocument()
    expect(tab1).toHaveAttribute('aria-selected', 'true')
    expect(tab2).toHaveAttribute('aria-selected', 'false')
    expect(tabpanel).toHaveTextContent('Content 1')
  })

  it('should show focus rings when navigating with keyboard', () => {
    render(<TabsComponent />)

    const tab1 = screen.getByRole('tab', { name: 'Tab 1' })
    
    // Simulate keyboard navigation
    tab1.focus()
    fireEvent.keyDown(tab1, { key: 'ArrowRight' })

    const tab2 = screen.getByRole('tab', { name: 'Tab 2' })
    expect(tab2).toHaveFocus()
    expect(tab2).toHaveClass('focus-visible:ring-2')
  })
})

describe('Stepper Keyboard Interactions', () => {
  const mockSteps = [
    { id: '1', label: 'Step 1', description: 'First step', status: 'complete' as const },
    { id: '2', label: 'Step 2', description: 'Second step', status: 'current' as const },
    { id: '3', label: 'Step 3', description: 'Third step', status: 'upcoming' as const },
    { id: '4', label: 'Step 4', description: 'Fourth step', status: 'upcoming' as const },
  ]

  beforeEach(() => {
    document.documentElement.style.setProperty('--stepper-size', '2rem')
    document.documentElement.style.setProperty('--stepper-border-width', '2px')
    document.documentElement.style.setProperty('--stepper-connector-height', '2px')
  })

  it('should have proper ARIA attributes', () => {
    const { Stepper } = require('@/components/ui/stepper')
    
    render(
      <Stepper
        steps={mockSteps}
        showLabels={true}
      />
    )

    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toHaveAttribute('aria-valuemin', '0')
    expect(progressbar).toHaveAttribute('aria-valuemax', '4')
    expect(progressbar).toHaveAttribute('aria-valuenow', '1') // completed steps
    expect(progressbar).toHaveAttribute('aria-valuetext', 'Step 2 of 4')
  })

  it('should mark current step with aria-current', () => {
    const { Stepper } = require('@/components/ui/stepper')
    
    render(
      <Stepper
        steps={mockSteps}
        showLabels={true}
      />
    )

    const stepElements = screen.getByRole('progressbar').querySelectorAll('[aria-current]')
    expect(stepElements).toHaveLength(1)
    expect(stepElements[0]).toHaveAttribute('aria-current', 'step')
  })

  it('should display step progress correctly', () => {
    const { Stepper } = require('@/components/ui/stepper')
    
    render(
      <Stepper
        steps={mockSteps}
        showLabels={true}
      />
    )

    const progressbar = screen.getByRole('progressbar')
    const progressFill = progressbar.querySelector('.bg-primary')
    
    // Should show 37.5% progress (1.5 / 4 steps = 37.5%)
    expect(progressFill).toHaveStyle('width: 37.5%')
  })

  it('should handle steps without labels', () => {
    const { Stepper } = require('@/components/ui/stepper')
    const stepsWithoutLabels = mockSteps.map(step => ({ ...step, label: undefined }))
    
    render(
      <Stepper
        steps={stepsWithoutLabels}
        showLabels={false}
      />
    )

    expect(screen.queryByText('Step 1')).not.toBeInTheDocument()
    expect(screen.queryByText('First step')).not.toBeInTheDocument()
    
    // Should still have the step indicators
    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toBeInTheDocument()
  })

  it('should display vertical layout correctly', () => {
    const { Stepper } = require('@/components/ui/stepper')
    
    render(
      <Stepper
        steps={mockSteps}
        orientation="vertical"
        showLabels={true}
      />
    )

    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toHaveClass('flex-col', 'h-full')
    
    // Should still have proper ARIA attributes
    expect(progressbar).toHaveAttribute('aria-valuetext', 'Step 2 of 4')
  })

  it('should handle all completed steps', () => {
    const { Stepper } = require('@/components/ui/stepper')
    const completedSteps = mockSteps.map(step => ({ ...step, status: 'complete' as const }))
    
    render(
      <Stepper
        steps={completedSteps}
        showLabels={true}
      />
    )

    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toHaveAttribute('aria-valuenow', '4') // all completed
    expect(progressbar).toHaveAttribute('aria-valuetext', 'Step -1 of 4') // no current step
    
    // Progress should be 100%
    const progressFill = progressbar.querySelector('.bg-primary')
    expect(progressFill).toHaveStyle('width: 100%')
  })

  it('should handle no completed steps', () => {
    const { Stepper } = require('@/components/ui/stepper')
    const upcomingSteps = mockSteps.map((step, index) => ({ 
      ...step, 
      status: index === 0 ? 'current' as const : 'upcoming' as const 
    }))
    
    render(
      <Stepper
        steps={upcomingSteps}
        showLabels={true}
      />
    )

    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toHaveAttribute('aria-valuenow', '0') // no completed
    expect(progressbar).toHaveAttribute('aria-valuetext', 'Step 1 of 4')
    
    // Progress should be 12.5% (0.5 / 4 = 12.5%)
    const progressFill = progressbar.querySelector('.bg-primary')
    expect(progressFill).toHaveStyle('width: 12.5%')
  })
})