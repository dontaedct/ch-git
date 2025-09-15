/**
 * Enhanced Service Worker for Hero Tasks Offline Functionality
 * Created: 2025-09-08T15:40:02.000Z
 * Version: 1.0.0
 */

const CACHE_NAME = 'hero-tasks-cache-v1';
const STATIC_CACHE_NAME = 'hero-tasks-static-v1';
const DYNAMIC_CACHE_NAME = 'hero-tasks-dynamic-v1';
const API_CACHE_NAME = 'hero-tasks-api-v1';
const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/hero-tasks',
  '/manifest.json',
  '/favicon.ico',
  '/offline',
  '/_next/static/css/',
  '/_next/static/js/',
  '/_next/static/media/'
];

// API routes that can be cached
const CACHEABLE_API_ROUTES = [
  '/api/hero-tasks',
  '/api/health',
  '/api/probe',
  '/api/ping'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Hero Tasks Service Worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets...');
        return cache.addAll(STATIC_ASSETS.map(asset => new Request(asset)));
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Hero Tasks Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (![STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME, API_CACHE_NAME].includes(cacheName)) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker activated successfully');
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('[SW] Service Worker activation failed:', error);
      })
  );
});

// Fetch event - handle different types of requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests for caching
  if (request.method !== 'GET') {
    return;
  }

  // Skip non-http requests
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

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'hero-tasks-sync') {
    console.log('[SW] Background sync triggered for Hero Tasks');
    event.waitUntil(performBackgroundSync());
  }
});

// Push notifications for task updates
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'You have a new task update',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/hero-tasks',
        taskId: data.taskId,
        timestamp: Date.now()
      },
      actions: [
        {
          action: 'view',
          title: 'View Task',
          icon: '/icons/icon-72x72.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icons/icon-72x72.png'
        }
      ],
      requireInteraction: data.requireInteraction || false
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Hero Tasks Update', options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/hero-tasks')
    );
  }
});

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'CACHE_TASK_DATA') {
    event.waitUntil(cacheTaskData(event.data.tasks));
  } else if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(clearAllCaches());
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
         url.pathname.startsWith('/hero-tasks') ||
         url.pathname.startsWith('/dashboard');
}

// Handle static assets with cache-first strategy
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
    console.error('[SW] Failed to handle static asset:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Handle API requests with network-first strategy
async function handleAPIRequest(request) {
  try {
    // Try network first
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      const responseClone = response.clone();
      responseClone.headers.set('sw-cache-time', Date.now().toString());
      cache.put(request, responseClone);
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache for API request:', request.url);
    
    // Fallback to cache
    const cache = await caches.open(API_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for Hero Tasks API
    if (request.url.includes('/api/hero-tasks')) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Offline - data will sync when online',
        offline: true
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Handle page requests with network-first strategy
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
    console.log('[SW] Network failed, trying cache for page request:', request.url);
    
    // Fallback to cache
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page
    return new Response(createOfflinePage(), {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
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
    console.log('[SW] Network failed, trying cache for dynamic request:', request.url);
    
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Background sync for offline data
async function performBackgroundSync() {
  console.log('[SW] Performing background sync...');
  
  try {
    // Notify all clients about sync attempt
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_SYNC_START',
        timestamp: Date.now()
      });
    });

    // Perform actual sync (this would be handled by the main thread)
    // The service worker just coordinates the process
    
    // Notify clients about sync completion
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_SYNC_COMPLETE',
        timestamp: Date.now()
      });
    });
    
    console.log('[SW] Background sync completed');
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
    
    // Notify clients about sync failure
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_SYNC_FAILED',
        error: error.message,
        timestamp: Date.now()
      });
    });
  }
}

// Cache task data for offline use
async function cacheTaskData(tasks) {
  try {
    const cache = await caches.open(API_CACHE_NAME);
    const request = new Request('/api/hero-tasks');
    const response = new Response(JSON.stringify({
      success: true,
      data: { tasks },
      offline: true,
      timestamp: Date.now()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    await cache.put(request, response);
    console.log('[SW] Task data cached for offline use');
  } catch (error) {
    console.error('[SW] Failed to cache task data:', error);
  }
}

// Clear all caches
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('[SW] All caches cleared');
  } catch (error) {
    console.error('[SW] Failed to clear caches:', error);
  }
}

// Create offline page HTML
function createOfflinePage() {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Offline - Hero Tasks</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .offline-container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            max-width: 400px;
            margin: 1rem;
          }
          .offline-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
            opacity: 0.8;
          }
          .offline-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
          }
          .offline-message {
            opacity: 0.9;
            margin-bottom: 1.5rem;
            line-height: 1.5;
          }
          .retry-button {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.2s ease;
          }
          .retry-button:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-1px);
          }
          .features {
            margin-top: 2rem;
            text-align: left;
            font-size: 0.9rem;
            opacity: 0.8;
          }
          .features h3 {
            margin-bottom: 0.5rem;
            font-size: 1rem;
          }
          .features ul {
            list-style: none;
            padding: 0;
          }
          .features li {
            margin-bottom: 0.25rem;
            padding-left: 1rem;
            position: relative;
          }
          .features li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #4ade80;
          }
        </style>
      </head>
      <body>
        <div class="offline-container">
          <div class="offline-icon">📱</div>
          <h1 class="offline-title">Hero Tasks Offline</h1>
          <p class="offline-message">
            You're currently offline, but you can still manage your tasks. 
            Changes will sync automatically when you're back online.
          </p>
          <button class="retry-button" onclick="window.location.reload()">
            Try Again
          </button>
          
          <div class="features">
            <h3>Available Offline:</h3>
            <ul>
              <li>View existing tasks</li>
              <li>Create new tasks</li>
              <li>Edit task details</li>
              <li>Update task status</li>
              <li>Add comments and tags</li>
            </ul>
          </div>
        </div>
        
        <script>
          // Check for online status
          function updateOnlineStatus() {
            if (navigator.onLine) {
              window.location.reload();
            }
          }
          
          window.addEventListener('online', updateOnlineStatus);
          
          // Register for background sync
          if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            navigator.serviceWorker.ready.then(registration => {
              return registration.sync.register('hero-tasks-sync');
            }).catch(err => {
              console.log('Background sync registration failed:', err);
            });
          }
        </script>
      </body>
    </html>
  `;
}

// Cache cleanup function
async function cleanupCache() {
  try {
    const cacheNames = [STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME, API_CACHE_NAME];
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
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
        console.log(`[SW] Cleaned up ${toDelete.length} old cache entries from ${cacheName}`);
      }
    }
  } catch (error) {
    console.error('[SW] Cache cleanup failed:', error);
  }
}

// Periodic cache cleanup
setInterval(cleanupCache, 60 * 60 * 1000); // Every hour

console.log('[SW] Hero Tasks Service Worker loaded successfully');
