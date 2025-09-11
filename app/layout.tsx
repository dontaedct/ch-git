import { EnhancedThemeProvider } from '../lib/ui-polish-theme-provider';
import { TokensProvider } from '../lib/design-tokens/provider';
import { DarkModeProvider } from '../lib/dark-mode/provider';
import { MotionProvider } from '../lib/motion/interactions';
import { MotionProvider as MotionProviderComponent } from '../components/providers/motion-provider';
import { ModernHeader } from '../components/ModernHeader';
import PWARegistration from '../components/pwa/PWARegistration';
import './globals.css';

// Force fully dynamic rendering in staging to avoid build-time prerender failures.
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'default-no-store';

export const metadata = {
  title: {
    default: "Build Better Products Faster Than Ever | Micro App Platform",
    template: "%s | Micro App Platform"
  },
  description: "Transform your ideas into production-ready applications with our comprehensive development platform. Ship features faster, maintain quality, and scale effortlessly with built-in tools, UI components, database & auth, and one-click deployment.",
  keywords: [
    "web development",
    "application platform",
    "development tools",
    "UI components",
    "database",
    "authentication",
    "deployment",
    "TypeScript",
    "Next.js",
    "React",
    "Supabase",
    "Vercel"
  ],
  authors: [{ name: "Micro App Platform" }],
  creator: "Micro App Platform",
  publisher: "Micro App Platform",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://microapp.example.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://microapp.example.com',
    title: 'Build Better Products Faster Than Ever | Micro App Platform',
    description: 'Transform your ideas into production-ready applications with our comprehensive development platform. Ship features faster, maintain quality, and scale effortlessly.',
    siteName: 'Micro App Platform',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Micro App Platform - Build Better Products Faster Than Ever',
        type: 'image/svg+xml',
      },
      {
        url: '/og-image-square.svg',
        width: 1200,
        height: 1200,
        alt: 'Micro App Platform Logo',
        type: 'image/svg+xml',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Build Better Products Faster Than Ever | Micro App Platform',
    description: 'Transform your ideas into production-ready applications with our comprehensive development platform. Ship features faster, maintain quality, and scale effortlessly.',
    creator: '@microapp',
    site: '@microapp',
    images: ['/og-image.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
};

// Default to safe mode unless explicitly disabled. This avoids SSR auth
// calls that can fail in misconfigured environments while we stabilize.
const isSafeMode = true; // Force safe mode to avoid Supabase connection issues

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Use system fonts instead of Google Fonts to avoid CSP issues */}
        
        {/* Performance hints */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Hero Tasks" />
        <meta name="application-name" content="Hero Tasks" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
        
        {/* PWA Icons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/icons/icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/icons/icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/icons/icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/icons/icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/icons/icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="57x57" href="/icons/icon-57x57.png" />
        
        {/* Additional Open Graph tags */}
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Micro App Platform - Build Better Products Faster Than Ever" />
        <meta property="og:updated_time" content={new Date().toISOString()} />
        
        {/* Twitter Card additional tags */}
        <meta name="twitter:image:alt" content="Micro App Platform - Build Better Products Faster Than Ever" />
        
        {/* Additional meta tags for better SEO */}
        <meta name="language" content="en" />
        <meta name="revisit-after" content="7 days" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        <meta name="referrer" content="no-referrer-when-downgrade" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Micro App Platform",
              "description": "Transform your ideas into production-ready applications with our comprehensive development platform. Ship features faster, maintain quality, and scale effortlessly.",
              "url": "https://microapp.example.com",
              "applicationCategory": "DeveloperApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Organization",
                "name": "Micro App Platform"
              },
              "featureList": [
                "Development Tools",
                "UI Components", 
                "Database & Auth",
                "One-Click Deploy"
              ]
            })
          }}
        />
        <style dangerouslySetInnerHTML={{
          __html: `
            body {
              font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            /* Fallback for preload */
            @font-face {
              font-family: 'Inter';
              font-style: normal;
              font-weight: 600;
              font-display: swap;
              src: local('Inter SemiBold'), local('Inter-SemiBold');
            }
          `
        }} />
      </head>
      <body 
        className="min-h-screen m-0 bg-theme text-theme theme-transition"
        style={{
          minHeight: '100vh'
        }}
      >
        <EnhancedThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <DarkModeProvider defaultTheme="system" enableSystem>
            <MotionProvider>
              <MotionProviderComponent>
                <TokensProvider>
                  <ModernHeader client={null} isSafeMode={isSafeMode} />
                  <main className="min-h-screen">
                    {children}
                  </main>
                  <PWARegistration />
                </TokensProvider>
              </MotionProviderComponent>
            </MotionProvider>
          </DarkModeProvider>
        </EnhancedThemeProvider>
      </body>
    </html>
  );
}