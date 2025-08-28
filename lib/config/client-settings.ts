/**
 * Client Settings Management
 * 
 * Handles loading and managing client-specific settings like booking URL and email templates
 */

interface ClientSettings {
  bookingUrl: string
  emailSubjectTemplate: string
}

const DEFAULT_SETTINGS: ClientSettings = {
  bookingUrl: '',
  emailSubjectTemplate: 'Your Consultation Results from {{clientName}}'
}

/**
 * Load client settings from storage (localStorage for now, database in production)
 */
export function getClientSettings(): ClientSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS
  }

  try {
    const saved = localStorage.getItem('client-settings')
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        ...DEFAULT_SETTINGS,
        ...parsed
      }
    }
  } catch (error) {
    console.warn('Failed to load client settings:', error)
  }

  return DEFAULT_SETTINGS
}

/**
 * Save client settings to storage
 */
export function saveClientSettings(settings: Partial<ClientSettings>): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const current = getClientSettings()
    const updated = { ...current, ...settings }
    localStorage.setItem('client-settings', JSON.stringify(updated))
  } catch (error) {
    console.error('Failed to save client settings:', error)
    throw error
  }
}

/**
 * Listen for settings changes
 */
export function onSettingsChange(callback: (settings: ClientSettings) => void): () => void {
  if (typeof window === 'undefined') {
    return () => {}
  }

  const handler = (event: Event) => {
    if (event instanceof CustomEvent && event.type === 'settings-updated') {
      callback(event.detail as ClientSettings)
    }
  }

  window.addEventListener('settings-updated', handler)
  
  return () => {
    window.removeEventListener('settings-updated', handler)
  }
}

/**
 * Apply client settings overrides to a template config
 */
export function applyClientOverrides<T extends { actions?: { bookingUrl?: string } }>(
  template: T,
  settings: ClientSettings
): T {
  if (!template.actions) {
    return template
  }

  return {
    ...template,
    actions: {
      ...template.actions,
      // Override booking URL if configured
      bookingUrl: settings.bookingUrl || template.actions.bookingUrl
    }
  }
}