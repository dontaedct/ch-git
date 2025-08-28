import { Suspense } from 'react';
import PageBoot from '@/components/ui/skeletons/PageBoot';
import { getPublicEnv } from '@/lib/env';
import { ThemeProvider } from '@/components/theme-provider';
import { TokensProvider } from '@/lib/design-tokens/provider';
import { AuthProvider } from '@/lib/auth/auth-context';
import { GlobalNav } from '@/components/GlobalNav';
import { requireClient } from '@/lib/auth/guard';

// Force fully dynamic rendering in staging to avoid build-time prerender failures.
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'default-no-store';

export const metadata = { title: "Micro App Template", description: "A modern micro web application template" };

const isSafeMode = getPublicEnv().NEXT_PUBLIC_SAFE_MODE === '1';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Try to get client info for navigation
  let client = null;
  
  if (!isSafeMode) {
    try {
      client = await requireClient();
    } catch {
      // No client authenticated, continue without
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ 
        minHeight: '100vh', 
        margin: 0, 
        fontFamily: "system-ui, sans-serif",
        background: '#fff',
        color: '#111'
      }}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TokensProvider>
            <AuthProvider>
              <GlobalNav client={client} isSafeMode={isSafeMode} />
              <Suspense fallback={<PageBoot />}>
                {children}
              </Suspense>
            </AuthProvider>
          </TokensProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
