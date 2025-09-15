/**
 * @fileoverview HT-008.2.7: Service Worker Implementation
 * @module lib/performance/sw.js
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.2.7 - Add service worker for offline capabilities
 * Focus: Service worker with intelligent caching and offline support
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (performance-critical offline functionality)
 */

const CACHE_NAME = 'oss-hero-cache-v1';
const STATIC_CACHE_NAME = 'oss-hero-static-v1';
const DYNAMIC_CACHE_NAME = 'oss-hero-dynamic-v1';
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/_next/static/css/',
  '/_next/static/js/',
  '/_next/static/media/'
];

// API routes to cache
const API_ROUTES = [
  '/api/health',
  '/api/probe',
  '/api/ping'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker installed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker installation failed:', error);
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated successfully');
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('Service Worker activation failed:', error);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle different types of requests
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isAPIRequest(request)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isPageRequest(request)) {
    event.respondWith(handlePageRequest(request));
  } else {
    event.respondWith(handleDynamicRequest(request));
  }
});

// Message event
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Push event
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      actions: [
        {
          action: 'explore',
          title: 'View',
          icon: '/favicon.ico'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/favicon.ico'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper functions
function isStaticAsset(request) {
  const url = new URL(request.url);
  return STATIC_ASSETS.some(asset => url.pathname.startsWith(asset)) ||
         url.pathname.includes('/_next/static/') ||
         url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
}

function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/');
}

function isPageRequest(request) {
  const url = new URL(request.url);
  return url.pathname === '/' || 
         url.pathname.startsWith('/dashboard') ||
         url.pathname.startsWith('/questionnaire') ||
         url.pathname.startsWith('/consultation');
}

// Handle static assets
async function handleStaticAsset(request) {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const response = await fetch(request);
    
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('Failed to handle static asset:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Handle API requests
async function handleAPIRequest(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    // Return cached response for health checks
    if (API_ROUTES.some(route => request.url.includes(route)) && cachedResponse) {
      return cachedResponse;
    }
    
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache successful API responses
      const responseClone = response.clone();
      responseClone.headers.set('sw-cache-time', Date.now().toString());
      cache.put(request, responseClone);
    }
    
    return response;
  } catch (error) {
    console.error('Failed to handle API request:', error);
    
    // Return cached response if available
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Handle page requests
async function handlePageRequest(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      const responseClone = response.clone();
      responseClone.headers.set('sw-cache-time', Date.now().toString());
      cache.put(request, responseClone);
    }
    
    return response;
  } catch (error) {
    console.error('Failed to handle page request:', error);
    
    // Return cached response if available
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Offline - OSS Hero</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: system-ui, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: #f8f9fa;
            }
            .offline-container {
              text-align: center;
              padding: 2rem;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .offline-icon {
              font-size: 4rem;
              margin-bottom: 1rem;
            }
            .offline-title {
              font-size: 1.5rem;
              font-weight: 600;
              margin-bottom: 0.5rem;
              color: #333;
            }
            .offline-message {
              color: #666;
              margin-bottom: 1.5rem;
            }
            .retry-button {
              background: #007bff;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 4px;
              cursor: pointer;
              font-size: 1rem;
            }
            .retry-button:hover {
              background: #0056b3;
            }
          </style>
        </head>
        <body>
          <div class="offline-container">
            <div class="offline-icon">📡</div>
            <h1 class="offline-title">You're offline</h1>
            <p class="offline-message">
              It looks like you're not connected to the internet. 
              Please check your connection and try again.
            </p>
            <button class="retry-button" onclick="window.location.reload()">
              Try Again
            </button>
          </div>
        </body>
      </html>
    `, {
      status: 200,
      headers: {
        'Content-Type': 'text/html'
      }
    });
  }
}

// Handle dynamic requests
async function handleDynamicRequest(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      const responseClone = response.clone();
      responseClone.headers.set('sw-cache-time', Date.now().toString());
      cache.put(request, responseClone);
    }
    
    return response;
  } catch (error) {
    console.error('Failed to handle dynamic request:', error);
    
    // Return cached response if available
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Background sync
async function doBackgroundSync() {
  console.log('Performing background sync...');
  
  try {
    // Sync offline data
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.method === 'POST' || request.method === 'PUT') {
        try {
          await fetch(request);
          await cache.delete(request);
        } catch (error) {
          console.error('Failed to sync request:', error);
        }
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Cache cleanup
async function cleanupCache() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const requests = await cache.keys();
    
    const now = Date.now();
    const toDelete = [];
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const cacheTime = response.headers.get('sw-cache-time');
        if (cacheTime) {
          const age = now - parseInt(cacheTime);
          if (age > MAX_CACHE_AGE) {
            toDelete.push(request);
          }
        }
      }
    }
    
    await Promise.all(toDelete.map(request => cache.delete(request)));
    
    if (toDelete.length > 0) {
      console.log(`Cleaned up ${toDelete.length} old cache entries`);
    }
  } catch (error) {
    console.error('Cache cleanup failed:', error);
  }
}

// Periodic cache cleanup
setInterval(cleanupCache, 60 * 60 * 1000); // Every hour
