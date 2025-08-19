import '@app/globals.tailwind.css';
import { Suspense } from 'react';
import { PageBoot } from '@ui/skeletons/PageBoot';
import { HydrationProbe } from '@app/_debug/HydrationProbe';
import { LoopDetector } from '@app/_debug/LoopDetector';
import { isSafeModeEnabled } from '@lib/env';

export const metadata = { title: "Coach Hub (dev)", description: "Dev shell" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const SAFE_MODE = isSafeModeEnabled();
  const DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG === '1';
  const IS_PROD = process.env.NODE_ENV === 'production';
  
  return (
    <html lang="en">
      <body 
        className="fallback-styles"
        data-safe-mode={SAFE_MODE ? '1' : '0'}
        data-debug-mode={DEBUG_MODE ? '1' : '0'}
      >
        {!IS_PROD && SAFE_MODE && (
          <div style={{
            position: 'fixed', top: 8, right: 8, zIndex: 10000,
            background: '#fde68a', color: '#7c2d12',
            padding: '6px 10px', borderRadius: 8, border: '1px solid #f59e0b',
            fontSize: 12, fontWeight: 700
          }}>
            SAFE MODE
          </div>
        )}
        {DEBUG_MODE && process.env.VERCEL_ENV === 'preview' && <HydrationProbe />}
        {DEBUG_MODE && process.env.VERCEL_ENV === 'preview' && <LoopDetector />}
        <Suspense fallback={<PageBoot />}>
          {children}
        </Suspense>
      </body>
    </html>
  );
}
