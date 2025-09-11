'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { accessibilityUtils } from '@/lib/accessibility/accessibility-system'

interface ChipOption {
  id: string
  label: string
  value: string
  disabled?: boolean
}

interface ChipGroupProps {
  options: ChipOption[]
  value?: string | string[]
  defaultValue?: string | string[]
  onValueChange?: (value: string | string[]) => void
  multiple?: boolean
  allowCustom?: boolean
  customPlaceholder?: string
  className?: string
  disabled?: boolean
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  'aria-required'?: boolean
}

const ChipGroup = React.forwardRef<HTMLDivElement, ChipGroupProps>(
  (
    {
      options,
      value,
      defaultValue,
      onValueChange,
      multiple = false,
      allowCustom = false,
      customPlaceholder = 'Add custom...',
      className,
      disabled = false,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid = false,
      'aria-required': ariaRequired = false,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState<string | string[]>(
      defaultValue ?? (multiple ? [] : '')
    )
    const [isAddingCustom, setIsAddingCustom] = React.useState(false)
    const [customValue, setCustomValue] = React.useState('')
    const [focusedIndex, setFocusedIndex] = React.useState(0)
    
    // Generate unique IDs for accessibility
    const groupId = React.useMemo(() => accessibilityUtils.generateId('chip-group'), [])
    const liveRegionId = React.useMemo(() => accessibilityUtils.generateId('chip-live'), [])
    
    // Screen reader announcements
    const [announcement, setAnnouncement] = React.useState('')
    
    const announce = React.useCallback((message: string) => {
      setAnnouncement(message)
      // Clear announcement after a short delay
      setTimeout(() => setAnnouncement(''), 1000)
    }, [])
    
    const isControlled = value !== undefined
    const currentValue = isControlled ? value : internalValue
    
    const customInputRef = React.useRef<HTMLInputElement>(null)
    const chipRefs = React.useRef<(HTMLButtonElement | null)[]>([])
    const addButtonRef = React.useRef<HTMLButtonElement>(null)

    // All available chips including custom ones
    const allOptions = React.useMemo(() => {
      const customOptions: ChipOption[] = []
      if (Array.isArray(currentValue)) {
        currentValue.forEach(val => {
          if (!options.some(opt => opt.value === val)) {
            customOptions.push({
              id: `custom-${val}`,
              label: val,
              value: val,
            })
          }
        })
      } else if (typeof currentValue === 'string' && currentValue && !options.some(opt => opt.value === currentValue)) {
        customOptions.push({
          id: `custom-${currentValue}`,
          label: currentValue,
          value: currentValue,
        })
      }
      return [...options, ...customOptions]
    }, [options, currentValue])

    const totalChipCount = allOptions.length + (allowCustom ? 1 : 0)

    const handleValueChange = React.useCallback((newValue: string | string[]) => {
      if (!isControlled) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)
    }, [isControlled, onValueChange])

    const toggleChip = React.useCallback((chipValue: string) => {
      if (disabled) return

      if (multiple) {
        const currentArray = Array.isArray(currentValue) ? currentValue : []
        const newValue = currentArray.includes(chipValue)
          ? currentArray.filter(v => v !== chipValue)
          : [...currentArray, chipValue]
        handleValueChange(newValue)
      } else {
        const newValue = currentValue === chipValue ? '' : chipValue
        handleValueChange(newValue)
      }
    }, [disabled, multiple, currentValue, handleValueChange])

    const isSelected = React.useCallback((chipValue: string) => {
      if (multiple) {
        return Array.isArray(currentValue) && currentValue.includes(chipValue)
      }
      return currentValue === chipValue
    }, [multiple, currentValue])

    const handleAddCustom = React.useCallback(() => {
      if (customValue.trim() && !allOptions.some(opt => opt.value === customValue.trim())) {
        toggleChip(customValue.trim())
        setCustomValue('')
        setIsAddingCustom(false)
      }
    }, [customValue, allOptions, toggleChip])

    const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
      if (disabled) return

      const { key } = event
      
      switch (key) {
        case 'ArrowRight':
          event.preventDefault()
          setFocusedIndex(prev => Math.min(prev + 1, totalChipCount - 1))
          announce(`Moved to option ${focusedIndex + 2} of ${totalChipCount}`)
          break
        case 'ArrowLeft':
          event.preventDefault()
          setFocusedIndex(prev => Math.max(prev - 1, 0))
          announce(`Moved to option ${focusedIndex} of ${totalChipCount}`)
          break
        case 'Enter':
        case ' ':
          event.preventDefault()
          if (focusedIndex < allOptions.length) {
            const chip = allOptions[focusedIndex]
            if (!chip.disabled) {
              toggleChip(chip.value)
              const isSelected = isSelectedChip(chip.value)
              announce(`${chip.label} ${isSelected ? 'selected' : 'deselected'}`)
            }
          } else if (allowCustom && focusedIndex === allOptions.length) {
            setIsAddingCustom(true)
            announce('Adding custom option')
          }
          break
        case 'Escape':
          if (isAddingCustom) {
            event.preventDefault()
            setIsAddingCustom(false)
            setCustomValue('')
            announce('Cancelled adding custom option')
          }
          break
        case 'Home':
          event.preventDefault()
          setFocusedIndex(0)
          announce('Moved to first option')
          break
        case 'End':
          event.preventDefault()
          setFocusedIndex(totalChipCount - 1)
          announce('Moved to last option')
          break
      }
    }, [disabled, focusedIndex, totalChipCount, allOptions, allowCustom, isAddingCustom, toggleChip, announce])

    // Focus management
    React.useEffect(() => {
      const currentRef = focusedIndex < allOptions.length
        ? chipRefs.current[focusedIndex]
        : addButtonRef.current

      currentRef?.focus()
    }, [focusedIndex, allOptions.length])

    // Auto-focus custom input when adding
    React.useEffect(() => {
      if (isAddingCustom && customInputRef.current) {
        customInputRef.current.focus()
      }
    }, [isAddingCustom])

    return (
      <div
        ref={ref}
        className={cn('flex flex-wrap gap-1.5 md:gap-2', className)}
        role="group"
        aria-label={ariaLabel || 'Select options'}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        aria-required={ariaRequired}
        aria-labelledby={groupId}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        style={{
          '--chip-height': '2rem',
          '--chip-padding': '0.5rem 0.75rem',
          '--chip-font-size': '0.875rem',
          '--chip-border-radius': '0.5rem',
        } as React.CSSProperties}
        {...props}
      >
        {/* Screen reader live region for announcements */}
        <div
          id={liveRegionId}
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {announcement}
        </div>
        
        {/* Hidden label for screen readers */}
        <div id={groupId} className="sr-only">
          {ariaLabel || 'Select options'} {ariaRequired ? '(required)' : ''}
        </div>
        {allOptions.map((option, index) => (
          <button
            key={option.id}
            ref={el => {
              chipRefs.current[index] = el
            }}
            type="button"
            disabled={disabled || option.disabled}
            tabIndex={focusedIndex === index ? 0 : -1}
            className={cn(
              'inline-flex items-center gap-1.5 h-[var(--chip-height)] px-[var(--chip-padding)]',
              'text-[var(--chip-font-size)] font-medium rounded-[var(--chip-border-radius)]',
              'border motion-chip-idle motion-chip-hover transition-chip-hover focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-ring focus-visible:ring-offset-1',
              'disabled:pointer-events-none disabled:opacity-50',
              isSelected(option.value)
                ? 'bg-primary text-primary-foreground border-primary shadow-sm motion-chip-selected transition-chip-select'
                : 'bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20'
            )}
            onClick={() => toggleChip(option.value)}
            aria-pressed={isSelected(option.value)}
            aria-disabled={disabled || option.disabled}
          >
            {option.label}
            {multiple && isSelected(option.value) && (
              <svg
                className="w-3 h-3 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
            )}
            {!multiple && isSelected(option.value) && (
              <div className="w-2 h-2 bg-current rounded-full flex-shrink-0" aria-hidden="true" />
            )}
          </button>
        ))}
        
        {allowCustom && (
          <>
            {isAddingCustom ? (
              <div className="inline-flex items-center gap-1">
                <input
                  ref={customInputRef}
                  type="text"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  onKeyDown={(e) => {
                    e.stopPropagation()
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddCustom()
                    } else if (e.key === 'Escape') {
                      e.preventDefault()
                      setIsAddingCustom(false)
                      setCustomValue('')
                    }
                  }}
                  className={cn(
                    'h-[var(--chip-height)] px-[var(--chip-padding)]',
                    'text-[var(--chip-font-size)] rounded-[var(--chip-border-radius)]',
                    'border border-border bg-background text-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
                    'min-w-20 transition-all duration-150'
                  )}
                  placeholder={customPlaceholder}
                />
                <button
                  type="button"
                  onClick={handleAddCustom}
                  className="inline-flex items-center justify-center h-5 w-5 rounded text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-150 hover:scale-110"
                  aria-label="Add custom option"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingCustom(false)
                    setCustomValue('')
                  }}
                  className="inline-flex items-center justify-center h-5 w-5 rounded text-xs bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all duration-150 hover:scale-110"
                  aria-label="Cancel"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                ref={addButtonRef}
                type="button"
                disabled={disabled}
                tabIndex={focusedIndex === allOptions.length ? 0 : -1}
                className={cn(
                  'inline-flex items-center gap-1.5 h-[var(--chip-height)] px-[var(--chip-padding)]',
                  'text-[var(--chip-font-size)] font-medium rounded-[var(--chip-border-radius)]',
                  'border-dashed border-2 border-border text-muted-foreground',
                  'hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-150',
                  'focus-visible:outline-none focus-visible:ring-2',
                  'focus-visible:ring-ring focus-visible:ring-offset-1',
                  'disabled:pointer-events-none disabled:opacity-50',
                  'hover:scale-[1.02] active:scale-[0.98]'
                )}
                onClick={() => setIsAddingCustom(true)}
                aria-label="Add custom option"
              >
                <svg
                  className="w-3 h-3 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                Add
              </button>
            )}
          </>
        )}
      </div>
    )
  }
)

ChipGroup.displayName = 'ChipGroup'

export { ChipGroup }
export type { ChipGroupProps, ChipOption }