"use client"

import Link from "next/link"
import { Suspense, lazy } from "react"
import realtorPreset from "@/packages/templates/presets/realtor-listing-hub.json"

const QuestionnaireEngine = lazy(() =>
  import("@/components/questionnaire-engine").then((m) => ({ default: m.QuestionnaireEngine }))
)

export default function RealtorListingsPage() {
  const config = (realtorPreset as any)?.questionnaire

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
                <p className="text-caption text-muted-foreground">Loading listing preferences…</p>
              </div>
            }
          >
            {config ? (
              <QuestionnaireEngine
                config={config as any}
                onComplete={(answers) => {
                  console.log("Realtor listing hub submitted:", answers)
                }}
                onAnalyticsEvent={(event, data) => {
                  console.log("Realtor listing hub analytics:", event, data)
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

