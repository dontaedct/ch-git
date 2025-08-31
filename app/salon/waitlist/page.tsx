"use client"

import Link from "next/link"
import { Suspense, lazy } from "react"
import salonPreset from "@/packages/templates/presets/salon-waitlist.json"

// Lazy load the QuestionnaireEngine component
const QuestionnaireEngine = lazy(() =>
  import("@/components/questionnaire-engine").then((module) => ({
    default: module.QuestionnaireEngine,
  }))
)

export default function SalonWaitlistPage() {
  const config = salonPreset?.questionnaire

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container-prose">
        <div className="mb-8">
          <Link
            href="/"
            className="text-primary hover:text-primary/80 font-medium text-caption tracking-wide inline-flex items-center gap-2"
          >
            ← Back to home
          </Link>
        </div>

        <div className="bg-card rounded-lg shadow-sm border border-border p-8">
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-caption text-muted-foreground">Loading waitlist…</p>
              </div>
            }
          >
            {config ? (
              <QuestionnaireEngine
                config={config as any}
                onComplete={(answers) => {
                  // For this preset, simply log answers. A real app would submit to backend.
                  console.log("Salon waitlist submitted:", answers)
                }}
                onAnalyticsEvent={(event, data) => {
                  console.log("Salon waitlist analytics:", event, data)
                }}
              />
            ) : (
              <div className="text-sm text-muted-foreground">No preset configuration found.</div>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  )
}

