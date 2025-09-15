import Link from 'next/link'

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
              <span className="text-xl font-semibold text-gray-900">Design System</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                Home
              </Link>
              <Link href="/intake" className="text-gray-600 hover:text-gray-900 transition-colors">
                Intake
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-20 animate-fade-in-up">
          <h1 className="text-display font-bold text-gray-900 mb-6">
            Apple-Inspired Design System
          </h1>
          <p className="text-body text-gray-600 max-w-3xl mx-auto">
            A comprehensive design system built with modern web technologies, featuring Apple&apos;s signature aesthetic 
            with clean typography, subtle shadows, and smooth animations.
          </p>
        </div>

        {/* Typography Section */}
        <section className="mb-20 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <div className="card card-hover p-8">
            <h2 className="text-headline font-semibold text-gray-900 mb-8">Typography</h2>
            <div className="space-y-6">
              <div>
                <h1 className="text-display font-bold text-gray-900 mb-2">Display Heading</h1>
                <p className="text-caption text-gray-500">Large, bold headings for hero sections</p>
              </div>
              <div>
                <h2 className="text-headline font-semibold text-gray-900 mb-2">Headline Text</h2>
                <p className="text-caption text-gray-500">Section headings and important text</p>
              </div>
              <div>
                <p className="text-body text-gray-900 mb-2">Body text for main content and descriptions</p>
                <p className="text-caption text-gray-500">Standard body text with good readability</p>
              </div>
              <div>
                <p className="text-caption text-gray-600 mb-2">Caption text for secondary information</p>
                <p className="text-caption text-gray-500">Smaller text for metadata and notes</p>
              </div>
            </div>
          </div>
        </section>

        {/* Colors Section */}
        <section className="mb-20 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <div className="card card-hover p-8">
            <h2 className="text-headline font-semibold text-gray-900 mb-8">Color Palette</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto mb-3"></div>
                <p className="text-sm font-medium text-gray-900">Primary Blue</p>
                <p className="text-xs text-gray-500">#3B82F6</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-green-600 rounded-2xl mx-auto mb-3"></div>
                <p className="text-sm font-medium text-gray-900">Success Green</p>
                <p className="text-xs text-gray-500">#16A34A</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-red-600 rounded-2xl mx-auto mb-3"></div>
                <p className="text-sm font-medium text-gray-900">Error Red</p>
                <p className="text-xs text-gray-500">#DC2626</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-900 rounded-2xl mx-auto mb-3"></div>
                <p className="text-sm font-medium text-gray-900">Text Dark</p>
                <p className="text-xs text-gray-500">#111827</p>
              </div>
            </div>
          </div>
        </section>

        {/* Components Section */}
        <section className="mb-20 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
          <div className="card card-hover p-8">
            <h2 className="text-headline font-semibold text-gray-900 mb-8">Components</h2>
            <div className="space-y-8">
              {/* Buttons */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Buttons</h3>
                <div className="flex flex-wrap gap-4">
                  <button className="btn">Primary Button</button>
                  <button className="btn-ghost">Ghost Button</button>
                  <button className="btn" disabled>Disabled Button</button>
                </div>
              </div>

              {/* Inputs */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Input Fields</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="your.email@example.com" 
                      className="input w-full focus-ring" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Password</label>
                    <input 
                      type="password" 
                      placeholder="Enter your password" 
                      className="input w-full focus-ring" 
                    />
                  </div>
                </div>
              </div>

              {/* Cards */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cards</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="card card-hover p-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Feature Card</h4>
                    <p className="text-sm text-gray-600">Hover me to see the animation</p>
                  </div>
                  <div className="card p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Static Card</h4>
                    <p className="text-sm text-gray-600">No hover effects on this one</p>
                  </div>
                  <div className="card card-hover p-6 text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Interactive Card</h4>
                    <p className="text-sm text-gray-600">Another hoverable card</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Animations Section */}
        <section className="mb-20 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
          <div className="card card-hover p-8">
            <h2 className="text-headline font-semibold text-gray-900 mb-8">Animations</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Pulse Animation</h4>
                <p className="text-sm text-gray-600">Subtle pulsing effect</p>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Bounce Animation</h4>
                <p className="text-sm text-gray-600">Playful bouncing effect</p>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-spin">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Spin Animation</h4>
                <p className="text-sm text-gray-600">Continuous rotation</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
