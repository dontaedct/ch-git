'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

interface TabsUnderlineListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  children: React.ReactNode
}

const TabsUnderline = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Root
    ref={ref}
    className={cn('flex flex-col gap-0', className)}
    {...props}
  />
))
TabsUnderline.displayName = 'TabsUnderline'

const TabsUnderlineList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsUnderlineListProps
>(({ className, children, ...props }, ref) => {
  const [activeTabRect, setActiveTabRect] = React.useState<DOMRect | null>(null)
  const [listRect, setListRect] = React.useState<DOMRect | null>(null)
  const [listElement, setListElement] = React.useState<HTMLDivElement | null>(null)
  const activeTabRef = React.useRef<HTMLButtonElement | null>(null)

  const updateIndicator = React.useCallback(() => {
    if (!listElement) return

    const activeTab = listElement.querySelector('[data-state="active"]') as HTMLButtonElement
    if (activeTab) {
      const tabRect = activeTab.getBoundingClientRect()
      const listRect = listElement.getBoundingClientRect()
      setActiveTabRect(tabRect)
      setListRect(listRect)
      // Store active tab reference for keyboard navigation
      activeTabRef.current = activeTab
    }
  }, [listElement])

  React.useEffect(() => {
    updateIndicator()
    
    const observer = new MutationObserver(() => {
      requestAnimationFrame(updateIndicator)
    })

    if (listElement) {
      observer.observe(listElement, {
        attributes: true,
        attributeFilter: ['data-state'],
        subtree: true
      })
    }

    const handleResize = () => requestAnimationFrame(updateIndicator)
    window.addEventListener('resize', handleResize)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', handleResize)
    }
  }, [updateIndicator, listElement])

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!listElement) return

    const triggers = Array.from(listElement.querySelectorAll('[role="tab"]')) as HTMLButtonElement[]
    const currentIndex = triggers.findIndex(trigger => trigger === event.target)
    
    if (currentIndex === -1) return

    let newIndex = currentIndex
    
    switch (event.key) {
      case 'Home':
        event.preventDefault()
        newIndex = 0
        break
      case 'End':
        event.preventDefault()
        newIndex = triggers.length - 1
        break
      case 'PageUp':
        event.preventDefault()
        newIndex = Math.max(0, currentIndex - 5)
        break
      case 'PageDown':
        event.preventDefault()
        newIndex = Math.min(triggers.length - 1, currentIndex + 5)
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault()
        newIndex = currentIndex > 0 ? currentIndex - 1 : triggers.length - 1
        break
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault()
        newIndex = currentIndex < triggers.length - 1 ? currentIndex + 1 : 0
        break
      default:
        return
    }

    const nextTrigger = triggers[newIndex]
    if (nextTrigger) {
      nextTrigger.focus()
      nextTrigger.click()
    }
  }

  const indicatorStyle = React.useMemo(() => {
    if (!activeTabRect || !listRect) return { opacity: 0 }
    
    const left = activeTabRect.left - listRect.left
    const width = activeTabRect.width
    
    return {
      opacity: 1,
      transform: `translateX(${left}px)`,
      width: `${width}px`
    }
  }, [activeTabRect, listRect])

  return (
    <TabsPrimitive.List
      ref={(node) => {
        // Forward the ref first
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
        // Update our internal state
        setListElement(node)
      }}
      className={cn(
        'relative inline-flex h-10 items-center justify-start',
        'border-b border-border/50 bg-transparent p-0',
        'text-muted-foreground',
        '[--tabs-padding:1rem]',
        '[--tabs-height:2.5rem]',
        className
      )}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
      <div
        className="absolute bottom-0 h-0.5 bg-primary transition-tab-switch"
        style={indicatorStyle}
        aria-hidden="true"
      />
    </TabsPrimitive.List>
  )
})
TabsUnderlineList.displayName = 'TabsUnderlineList'

const TabsUnderlineTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap',
      'px-[var(--tabs-padding)] py-2 text-sm font-medium',
      'ring-offset-background transition-tab-hover',
      'focus-visible:outline-none focus-visible:ring-2',
      'focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      'relative border-b-2 border-transparent',
      'hover:text-foreground hover:bg-muted/50',
      'data-[state=active]:text-foreground',
      'data-[state=active]:bg-transparent',
      '[&:not(:first-child)]:ml-0',
      className
    )}
    {...props}
  />
))
TabsUnderlineTrigger.displayName = 'TabsUnderlineTrigger'

const TabsUnderlineContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-4 ring-offset-background',
      'focus-visible:outline-none focus-visible:ring-2',
      'focus-visible:ring-ring focus-visible:ring-offset-2',
      className
    )}
    {...props}
  />
))
TabsUnderlineContent.displayName = 'TabsUnderlineContent'

export {
  TabsUnderline,
  TabsUnderlineList,
  TabsUnderlineTrigger,
  TabsUnderlineContent,
}