'use client'

// N8N Event Emission Utility
// This utility provides a standardized way to emit events that n8n workflows can listen to

export interface N8nEventDetail {
  timestamp: string
  source: string
  userId?: string
  sessionId?: string
  [key: string]: unknown
}

export interface ConsultationEmailEvent extends N8nEventDetail {
  type: 'consultation:emailRequest'
  planId: string
  clientName?: string
  clientEmail?: string
  blob: Blob
  size: number
  filename: string
}

export interface ConsultationDownloadEvent extends N8nEventDetail {
  type: 'consultation:pdfDownloaded'
  planId: string
  clientName?: string
  size: number
  filename: string
}

export interface ConsultationBookingEvent extends N8nEventDetail {
  type: 'consultation:bookingRequested'
  planId: string
  clientName?: string
  bookingUrl?: string
}

export type N8nEvent = ConsultationEmailEvent | ConsultationDownloadEvent | ConsultationBookingEvent

class N8nEventEmitter {
  private static instance: N8nEventEmitter
  private sessionId: string
  
  private constructor() {
    this.sessionId = this.generateSessionId()
  }
  
  static getInstance(): N8nEventEmitter {
    if (!N8nEventEmitter.instance) {
      N8nEventEmitter.instance = new N8nEventEmitter()
    }
    return N8nEventEmitter.instance
  }
  
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }
  
  private getBaseEventData(): Omit<N8nEventDetail, 'source'> {
    return {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.getUserId(),
    }
  }
  
  private getUserId(): string | undefined {
    // This would typically get the user ID from auth context or localStorage
    // For now, return undefined or a demo user ID
    return localStorage.getItem('demo_user_id') ?? 'demo_user'
  }
  
  emit<T extends N8nEvent>(eventData: Omit<T, keyof N8nEventDetail> & { source: string; type: T['type'] }): void {
    const fullEvent: N8nEvent = {
      ...this.getBaseEventData(),
      ...eventData,
    } as T
    
    // Emit as custom event for browser-based n8n integrations
    const customEvent = new CustomEvent(eventData.type, {
      detail: fullEvent,
      bubbles: true
    })
    
    window.dispatchEvent(customEvent)
    
    // Also emit a generic n8n event
    const n8nEvent = new CustomEvent('n8n:event', {
      detail: fullEvent,
      bubbles: true
    })
    
    window.dispatchEvent(n8nEvent)
    
    // Log for debugging
    console.log(`[N8N Event] ${eventData.type}:`, fullEvent)
    
    // If running in development, also send to console for easier testing
    if (process.env.NODE_ENV === 'development') {
      console.table({
        'Event Type': eventData.type,
        'Session ID': this.sessionId,
        'Timestamp': fullEvent.timestamp,
        'Source': eventData.source,
        'User ID': fullEvent.userId,
      })
    }
  }
  
  // Convenience methods for specific event types
  emitEmailRequest(data: { source: string; planId: string; clientName?: string; clientEmail?: string; blob: Blob; size: number; filename: string }): void {
    this.emit<ConsultationEmailEvent>({
      ...data,
      type: 'consultation:emailRequest'
    })
  }
  
  emitPdfDownload(data: { source: string; planId: string; clientName?: string; size: number; filename: string }): void {
    this.emit<ConsultationDownloadEvent>({
      ...data,
      type: 'consultation:pdfDownloaded'
    })
  }
  
  emitBookingRequest(data: { source: string; planId: string; clientName?: string; bookingUrl?: string }): void {
    this.emit<ConsultationBookingEvent>({
      ...data,
      type: 'consultation:bookingRequested'
    })
  }
}

// Export singleton instance
export const n8nEvents = N8nEventEmitter.getInstance()

// Utility function to set up n8n event listeners for debugging
export function setupN8nEventListeners() {
  if (typeof window === 'undefined') return
  
  // Generic n8n event listener
  window.addEventListener('n8n:event', (event) => {
    const customEvent = event as CustomEvent
    console.log('[N8N Debug] Event received:', customEvent.detail)
  })
  
  // Specific event listeners
  window.addEventListener('consultation:emailRequest', (event) => {
    const customEvent = event as CustomEvent
    console.log('[N8N Debug] Email request:', customEvent.detail)
  })
  
  window.addEventListener('consultation:pdfDownloaded', (event) => {
    const customEvent = event as CustomEvent
    console.log('[N8N Debug] PDF downloaded:', customEvent.detail)
  })
  
  window.addEventListener('consultation:bookingRequested', (event) => {
    const customEvent = event as CustomEvent
    console.log('[N8N Debug] Booking requested:', customEvent.detail)
  })
}

// Hook for React components
export function useN8nEvents() {
  return n8nEvents
}