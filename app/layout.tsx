
import { EnhancedThemeProvider } from '../lib/ui-polish-theme-provider';
import { MotionProvider } from '../components/providers/motion-provider';
import NavigationHeaderSimple from '../components/navigation-header-simple';
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
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        
        {/* Preconnect for critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Preload Inter 600 weight for hero headings - critical for LCP */}
        <link 
          rel="preload" 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@600&display=swap" 
          as="style" 
        />
        <noscript>
          <link 
            href="https://fonts.googleapis.com/css2?family=Inter:wght@600&display=swap" 
            rel="stylesheet" 
          />
        </noscript>
        {/* Load other weights asynchronously */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" 
          rel="stylesheet" 
        />
        
        {/* Performance hints */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Additional SEO meta tags */}
        <meta name="theme-color" content="#ffffff" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Micro App Platform" />
        
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
      <body className="min-h-screen m-0 bg-white text-[#111]">
        <EnhancedThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <MotionProvider>
            <NavigationHeaderSimple />
            {children}
          </MotionProvider>
        </EnhancedThemeProvider>
      </body>
    </html>
  );
}
