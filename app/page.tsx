export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container-prose py-16">
        <div className="text-center">
          <h1 className="text-display-lg mb-6">
            Get the consultation you need
          </h1>
          <p className="text-body-lg text-muted-foreground mb-8 measure mx-auto">
            Professional consultation services tailored to your needs. Start your journey with a free consultation today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="text-lg px-8 py-4">
              <Link href="/questionnaire">
                Start free consultation
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4">
              <Link href="/login">
                Sign in
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="mt-16 pt-16 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 bg-primary rounded"></div>
              </div>
              <h3 className="text-h4 mb-2">Expert guidance</h3>
              <p className="text-body-sm text-muted-foreground measure-narrow mx-auto">
                Professional consultation from experienced experts in their field.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 bg-success rounded"></div>
              </div>
              <h3 className="text-h4 mb-2">Personalized approach</h3>
              <p className="text-body-sm text-muted-foreground measure-narrow mx-auto">
                Tailored solutions that match your specific requirements and goals.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 bg-info rounded"></div>
              </div>
              <h3 className="text-h4 mb-2">Results focused</h3>
              <p className="text-body-sm text-muted-foreground measure-narrow mx-auto">
                Proven methodology designed to deliver measurable outcomes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}