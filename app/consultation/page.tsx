import { Suspense } from 'react'
import { ConsultationPageClient } from './client'

export default function ConsultationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your consultation...</p>
        </div>
      </div>
    }>
      <ConsultationPageClient />
    </Suspense>
  )
}