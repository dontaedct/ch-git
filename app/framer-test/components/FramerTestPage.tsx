'use client'

import { HeroSection } from '../sections/HeroSection'
import { FeaturesSection } from '../sections/FeaturesSection'
import { ShowcaseSection } from '../sections/ShowcaseSection'
import { TestimonialsSection } from '../sections/TestimonialsSection'
import { PricingSection } from '../sections/PricingSection'
import { FooterSection } from '../sections/FooterSection'
import { Navigation } from './Navigation'
import { FloatingElements } from './FloatingElements'

export function FramerTestPage() {
  return (
    <div className="min-h-screen bg-white relative">
      <Navigation />
      <main className="relative">
        <FloatingElements />
        <HeroSection />
        <FeaturesSection />
        <ShowcaseSection />
        <TestimonialsSection />
        <PricingSection />
      </main>
      <FooterSection />
    </div>
  )
}
