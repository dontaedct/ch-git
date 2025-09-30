'use client'

import { HeroSection } from '../sections/HeroSection'
import { FeaturesSection } from '../sections/FeaturesSection'
import { ModulesSection } from '../sections/ModulesSection'
import { FormsSection } from '../sections/FormsSection'
import { WorkflowSection } from '../sections/WorkflowSection'
import { PricingSection } from '../sections/PricingSection'
import { Navigation } from './Navigation'

export function AgencyToolkitTestPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ModulesSection />
        <FormsSection />
        <WorkflowSection />
        <PricingSection />
      </main>
    </div>
  )
}
