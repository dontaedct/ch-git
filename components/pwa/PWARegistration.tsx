/**
 * @fileoverview PWA Service Worker Registration Component
 * @module components/pwa/PWARegistration
 * @author Hero Tasks System
 * @version 1.0.0
 * 
 * Handles service worker registration and PWA installation prompts
 */

'use client';

import { useEffect, useState } from 'react';
import { Button } from '@ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card';
import { Download, X, Wifi, WifiOff } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWARegistration() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered:', registration);
          setSwRegistration(registration);
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error);
        });
    }

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial online status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt');
      } else {
        console.log('[PWA] User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('[PWA] Error during installation:', error);
    }
  };

  const handleDismissInstall = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
  };

  const handleUpdateServiceWorker = () => {
    if (swRegistration?.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  if (isInstalled) {
    return null; // Don't show anything if already installed
  }

  return (
    <>
      {/* Install Prompt */}
      {showInstallPrompt && (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
          <Card className="border-2 border-blue-500 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Download className="h-5 w-5 text-blue-500" />
                  Install Hero Tasks
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismissInstall}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="mb-4">
                Install Hero Tasks for quick access and offline functionality. Get a native app-like experience on your device.
              </CardDescription>
              <div className="flex gap-2">
                <Button onClick={handleInstallClick} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Install App
                </Button>
                <Button variant="outline" onClick={handleDismissInstall}>
                  Not Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
          <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950">
            <CardContent className="flex items-center gap-3 py-3">
              <WifiOff className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  You're offline
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-300">
                  Some features may be limited
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Service Worker Update Available */}
      {swRegistration?.waiting && (
        <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
          <Card className="border-green-500 bg-green-50 dark:bg-green-950">
            <CardContent className="flex items-center gap-3 py-3">
              <Wifi className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Update Available
                </p>
                <p className="text-xs text-green-600 dark:text-green-300">
                  New features and improvements ready
                </p>
              </div>
              <Button
                size="sm"
                onClick={handleUpdateServiceWorker}
                className="bg-green-600 hover:bg-green-700"
              >
                Update
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

export default PWARegistration;

