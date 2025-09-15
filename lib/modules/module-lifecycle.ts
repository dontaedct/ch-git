/**
 * HT-022.3.1: Module Lifecycle Management
 *
 * Simple lifecycle hooks and event system for module activation,
 * deactivation, and state management.
 */

export type ModuleLifecycleEvent =
  | 'beforeActivation'
  | 'afterActivation'
  | 'beforeDeactivation'
  | 'afterDeactivation'
  | 'configChanged'
  | 'dependencyResolved'
  | 'error'

export interface LifecycleEventData {
  moduleId: string
  tenantId: string
  timestamp: Date
  event: ModuleLifecycleEvent
  data?: Record<string, unknown>
  error?: Error
}

export type LifecycleHook = (data: LifecycleEventData) => Promise<void> | void

class ModuleLifecycleManager {
  private hooks: Map<ModuleLifecycleEvent, LifecycleHook[]> = new Map()
  private eventHistory: LifecycleEventData[] = []
  private maxHistorySize = 100

  constructor() {
    // Initialize hook arrays
    const events: ModuleLifecycleEvent[] = [
      'beforeActivation',
      'afterActivation',
      'beforeDeactivation',
      'afterDeactivation',
      'configChanged',
      'dependencyResolved',
      'error'
    ]

    events.forEach(event => {
      this.hooks.set(event, [])
    })
  }

  registerHook(event: ModuleLifecycleEvent, hook: LifecycleHook): void {
    const eventHooks = this.hooks.get(event) || []
    eventHooks.push(hook)
    this.hooks.set(event, eventHooks)
  }

  unregisterHook(event: ModuleLifecycleEvent, hook: LifecycleHook): void {
    const eventHooks = this.hooks.get(event) || []
    const filteredHooks = eventHooks.filter(h => h !== hook)
    this.hooks.set(event, filteredHooks)
  }

  async emit(event: ModuleLifecycleEvent, data: Omit<LifecycleEventData, 'event' | 'timestamp'>): Promise<void> {
    const eventData: LifecycleEventData = {
      ...data,
      event,
      timestamp: new Date()
    }

    // Add to history
    this.eventHistory.push(eventData)
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift()
    }

    // Execute hooks
    const hooks = this.hooks.get(event) || []
    const promises = hooks.map(async hook => {
      try {
        await hook(eventData)
      } catch (error) {
        console.error(`Lifecycle hook error for ${event}:`, error)
        // Emit error event if this wasn't already an error event
        if (event !== 'error') {
          await this.emit('error', {
            moduleId: data.moduleId,
            tenantId: data.tenantId,
            error: error instanceof Error ? error : new Error(String(error))
          })
        }
      }
    })

    await Promise.all(promises)
  }

  getEventHistory(moduleId?: string, event?: ModuleLifecycleEvent): LifecycleEventData[] {
    let filtered = this.eventHistory

    if (moduleId) {
      filtered = filtered.filter(e => e.moduleId === moduleId)
    }

    if (event) {
      filtered = filtered.filter(e => e.event === event)
    }

    return filtered.slice() // Return copy
  }

  clearEventHistory(): void {
    this.eventHistory = []
  }

  getModuleStatus(moduleId: string, tenantId: string): {
    isActive: boolean
    lastActivation?: Date
    lastDeactivation?: Date
    activationCount: number
    errorCount: number
  } {
    const events = this.getEventHistory(moduleId)
    const activations = events.filter(e => e.event === 'afterActivation' && e.tenantId === tenantId)
    const deactivations = events.filter(e => e.event === 'afterDeactivation' && e.tenantId === tenantId)
    const errors = events.filter(e => e.event === 'error' && e.tenantId === tenantId)

    const lastActivation = activations.length > 0 ? activations[activations.length - 1].timestamp : undefined
    const lastDeactivation = deactivations.length > 0 ? deactivations[deactivations.length - 1].timestamp : undefined

    // Determine if module is currently active based on last event
    let isActive = false
    if (lastActivation && (!lastDeactivation || lastActivation > lastDeactivation)) {
      isActive = true
    }

    return {
      isActive,
      lastActivation,
      lastDeactivation,
      activationCount: activations.length,
      errorCount: errors.length
    }
  }
}

// Singleton instance
export const lifecycleManager = new ModuleLifecycleManager()

// Built-in lifecycle hooks for common functionality
export const builtInHooks = {
  // Log all lifecycle events
  logger: (data: LifecycleEventData) => {
    console.log(`[ModuleLifecycle] ${data.event}: ${data.moduleId} (tenant: ${data.tenantId})`, data.data || '')
  },

  // Track module usage metrics
  metricsTracker: (data: LifecycleEventData) => {
    // In a real implementation, this would send metrics to an analytics service
    if (data.event === 'afterActivation') {
      console.debug(`📊 Module ${data.moduleId} activated for tenant ${data.tenantId}`)
    } else if (data.event === 'afterDeactivation') {
      console.debug(`📊 Module ${data.moduleId} deactivated for tenant ${data.tenantId}`)
    }
  },

  // Error reporter
  errorReporter: (data: LifecycleEventData) => {
    if (data.event === 'error' && data.error) {
      console.error(`🚨 Module error in ${data.moduleId}:`, data.error.message)
      // In a real implementation, this would report to an error tracking service
    }
  }
}

// Register built-in hooks by default
lifecycleManager.registerHook('beforeActivation', builtInHooks.logger)
lifecycleManager.registerHook('afterActivation', builtInHooks.logger)
lifecycleManager.registerHook('afterActivation', builtInHooks.metricsTracker)
lifecycleManager.registerHook('beforeDeactivation', builtInHooks.logger)
lifecycleManager.registerHook('afterDeactivation', builtInHooks.logger)
lifecycleManager.registerHook('afterDeactivation', builtInHooks.metricsTracker)
lifecycleManager.registerHook('error', builtInHooks.errorReporter)

// Utility functions
export function onModuleActivation(hook: LifecycleHook): void {
  lifecycleManager.registerHook('afterActivation', hook)
}

export function onModuleDeactivation(hook: LifecycleHook): void {
  lifecycleManager.registerHook('afterDeactivation', hook)
}

export function onModuleError(hook: LifecycleHook): void {
  lifecycleManager.registerHook('error', hook)
}

export function getModuleLifecycleStatus(moduleId: string, tenantId: string) {
  return lifecycleManager.getModuleStatus(moduleId, tenantId)
}