// Static homepage - no dynamic features needed

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle, Users, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-background pt-0">
      {/* Hero Section - Balanced typography with subtle background treatment */}
      <section className="relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-muted/30 via-background to-muted/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.05),transparent_50%)]"></div>
        
        <div className="relative section">
          <div className="container-grid">
            <div className="text-center rhythm max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                Get the consultation
                <br className="hidden sm:block" />
                <span className="text-primary">you need</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-12 measure mx-auto leading-relaxed">
                Professional consultation services tailored to your specific needs. 
                Start your journey with a free consultation today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button asChild size="lg" className="text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300">
                  <Link href="/questionnaire">
                    Start free consultation
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4">
                  <Link href="/login">
                    Sign in
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Social Proof Strip - Tasteful monochrome placeholders */}
      <section className="border-t border-border bg-muted/30">
        <div className="container-grid">
          <div className="py-12">
            <p className="text-center text-sm text-muted-foreground mb-8">Trusted by leading organizations</p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity duration-300">
                  <div className="w-24 h-12 bg-gradient-to-r from-muted-foreground/20 to-muted-foreground/10 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-medium text-muted-foreground">Client Logo</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it Works - 3-step process with neutral icons */}
      <section className="section">
        <div className="container-grid">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">How it works</h2>
            <p className="text-xl text-muted-foreground measure mx-auto">
              Three simple steps to get the expert consultation you need
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-16 h-16 mx-auto bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">1</span>
                  </div>
                </div>
                {/* Step connector line */}
                <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-border via-border to-transparent"></div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Share your needs</h3>
              <p className="text-muted-foreground leading-relaxed">
                Complete our brief questionnaire to help us understand your specific requirements and goals.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-16 h-16 mx-auto bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-border via-border to-transparent"></div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Get matched</h3>
              <p className="text-muted-foreground leading-relaxed">
                We connect you with the right expert who has experience in your specific area of need.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-16 h-16 mx-auto bg-success/10 border border-success/20 rounded-2xl flex items-center justify-center group-hover:bg-success/20 transition-colors duration-300">
                  <div className="w-8 h-8 bg-gradient-to-br from-success to-success/80 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Start consulting</h3>
              <p className="text-muted-foreground leading-relaxed">
                Begin your personalized consultation session and get the expert guidance you need.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section - Elegant accordion with accessibility */}
      <section className="section border-t border-border bg-muted/20">
        <div className="container-grid">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-semibold mb-4">Frequently asked questions</h2>
              <p className="text-xl text-muted-foreground">
                Everything you need to know about our consultation services
              </p>
            </div>
            
            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem value="item-1" className="bg-background rounded-lg border border-border px-6 py-2">
                <AccordionTrigger className="text-left font-semibold hover:no-underline">
                  How does the free consultation work?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Our free consultation is a 30-minute session where we discuss your needs, goals, and how we can help. 
                  There&apos;s no obligation, and you&apos;ll get valuable insights regardless of whether you decide to work with us.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2" className="bg-background rounded-lg border border-border px-6 py-2">
                <AccordionTrigger className="text-left font-semibold hover:no-underline">
                  What areas do you provide consultation for?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  We offer expert consultation across multiple domains including business strategy, technology implementation, 
                  marketing, operations, and specialized industry expertise. Our diverse network of consultants ensures we can 
                  match you with the right expert for your specific needs.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3" className="bg-background rounded-lg border border-border px-6 py-2">
                <AccordionTrigger className="text-left font-semibold hover:no-underline">
                  How quickly can I get started?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Most consultations can be scheduled within 24-48 hours of completing your initial questionnaire. 
                  For urgent needs, we offer same-day scheduling based on consultant availability.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4" className="bg-background rounded-lg border border-border px-6 py-2">
                <AccordionTrigger className="text-left font-semibold hover:no-underline">
                  What happens after the consultation?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  After your consultation, you&apos;ll receive a summary of key insights and recommendations. If you choose to 
                  continue working together, we&apos;ll create a customized plan tailored to your specific goals and timeline.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5" className="bg-background rounded-lg border border-border px-6 py-2">
                <AccordionTrigger className="text-left font-semibold hover:no-underline">
                  Are your consultants vetted and qualified?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Yes, all our consultants go through a rigorous vetting process including background checks, 
                  credential verification, and skills assessment. We only work with experienced professionals who 
                  have proven track records in their respective fields.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>
    </main>
  );
}