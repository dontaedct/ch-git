'use client'

import { HeroSection } from '../sections/HeroSection'
import { ServicesSection } from '../sections/ServicesSection'
import { PortfolioSection } from '../sections/PortfolioSection'
import { AboutSection } from '../sections/AboutSection'
import { TestimonialsSection } from '../sections/TestimonialsSection'
import { ContactSection } from '../sections/ContactSection'
import { Navigation } from './Navigation'

export function AutomationDCTHomepage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main>
        <HeroSection />
        <ServicesSection />
        <PortfolioSection />
        <AboutSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
    </div>
  )
}
