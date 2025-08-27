'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

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
          break
        case 'ArrowLeft':
          event.preventDefault()
          setFocusedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
        case ' ':
          event.preventDefault()
          if (focusedIndex < allOptions.length) {
            const chip = allOptions[focusedIndex]
            if (!chip.disabled) {
              toggleChip(chip.value)
            }
          } else if (allowCustom && focusedIndex === allOptions.length) {
            setIsAddingCustom(true)
          }
          break
        case 'Escape':
          if (isAddingCustom) {
            event.preventDefault()
            setIsAddingCustom(false)
            setCustomValue('')
          }
          break
      }
    }, [disabled, focusedIndex, totalChipCount, allOptions, allowCustom, isAddingCustom, toggleChip])

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
        className={cn('flex flex-wrap gap-2', className)}
        role="group"
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        onKeyDown={handleKeyDown}
        {...props}
      >
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
              'inline-flex items-center gap-1 h-[var(--chip-height)] px-[var(--chip-padding)]',
              'text-[var(--chip-font-size)] font-medium rounded-[var(--chip-border-radius)]',
              'border transition-colors focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:pointer-events-none disabled:opacity-50',
              isSelected(option.value)
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground'
            )}
            onClick={() => toggleChip(option.value)}
            aria-pressed={isSelected(option.value)}
            aria-disabled={disabled || option.disabled}
          >
            {option.label}
            {isSelected(option.value) && (
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
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
                    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                    'min-w-24'
                  )}
                  placeholder={customPlaceholder}
                />
                <button
                  type="button"
                  onClick={handleAddCustom}
                  className="inline-flex items-center justify-center h-6 w-6 rounded text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                  aria-label="Add custom option"
                >
                  ✓
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingCustom(false)
                    setCustomValue('')
                  }}
                  className="inline-flex items-center justify-center h-6 w-6 rounded text-xs bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  aria-label="Cancel"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                ref={addButtonRef}
                type="button"
                disabled={disabled}
                tabIndex={focusedIndex === allOptions.length ? 0 : -1}
                className={cn(
                  'inline-flex items-center gap-1 h-[var(--chip-height)] px-[var(--chip-padding)]',
                  'text-[var(--chip-font-size)] font-medium rounded-[var(--chip-border-radius)]',
                  'border-dashed border-2 border-border text-muted-foreground',
                  'hover:border-primary hover:text-primary transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2',
                  'focus-visible:ring-ring focus-visible:ring-offset-2',
                  'disabled:pointer-events-none disabled:opacity-50'
                )}
                onClick={() => setIsAddingCustom(true)}
                aria-label="Add custom option"
              >
                <svg
                  className="w-3 h-3"
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