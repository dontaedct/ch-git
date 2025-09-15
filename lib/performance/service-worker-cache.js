/**
 * @fileoverview HT-008.9.2: Service Worker Cache Implementation
 * @module lib/performance/service-worker-cache.js
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Performance Optimization System
 * Task: HT-008.9.2 - Add comprehensive caching strategies
 * Focus: Service Worker caching for offline capabilities and performance
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (performance optimization)
 */

// Service Worker Cache Configuration
const CACHE_NAME = 'ht-008-cache-v1';
const STATIC_CACHE_NAME = 'ht-008-static-v1';
const DYNAMIC_CACHE_NAME = 'ht-008-dynamic-v1';
const API_CACHE_NAME = 'ht-008-api-v1';

// Cache strategies
const CACHE_STRATEGIES = {
  STATIC: 'cache-first',
  DYNAMIC: 'stale-while-revalidate',
  API: 'network-first',
  IMAGES: 'cache-first',
};

// Cache TTL settings (in milliseconds)
const CACHE_TTL = {
  STATIC: 7 * 24 * 60 * 60 * 1000, // 7 days
  DYNAMIC: 24 * 60 * 60 * 1000, // 1 day
  API: 5 * 60 * 1000, // 5 minutes
  IMAGES: 30 * 24 * 60 * 60 * 1000, // 30 days
};

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/_next/static/css/',
  '/_next/static/js/',
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/health',
  '/api/status',
  '/api/config',
];

/**
 * Service Worker Installation
 */
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('📦 Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting(),
    ])
  );
});

/**
 * Service Worker Activation
 */
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName !== API_CACHE_NAME
            ) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all clients
      self.clients.claim(),
    ])
  );
});

/**
 * Fetch Event Handler
 */
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
  
  // Route requests based on type
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isAPIRequest(request)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
  } else {
    event.respondWith(handleDynamicRequest(request));
  }
});

/**
 * Handle static asset requests
 */
async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  
  try {
    // Try cache first
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('📦 Serving static asset from cache:', request.url);
      return cachedResponse;
    }
    
    // Fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Static asset fetch failed:', error);
    
    // Return cached version if available
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return new Response('Offline', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/html' },
      });
    }
    
    throw error;
  }
}

/**
 * Handle API requests
 */
async function handleAPIRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful API responses
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
      
      // Set cache expiration
      setTimeout(() => {
        cache.delete(request);
      }, CACHE_TTL.API);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ API request failed:', error);
    
    // Return cached version if available
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('📡 Serving API response from cache:', request.url);
      return cachedResponse;
    }
    
    // Return error response
    return new Response(
      JSON.stringify({ error: 'Network error', offline: true }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Handle image requests
 */
async function handleImageRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  
  try {
    // Try cache first
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('🖼️ Serving image from cache:', request.url);
      return cachedResponse;
    }
    
    // Fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful image responses
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Image fetch failed:', error);
    
    // Return cached version if available
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return placeholder image
    return new Response(
      '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#f0f0f0"/><text x="50" y="50" text-anchor="middle" fill="#999">Image</text></svg>',
      {
        status: 200,
        headers: { 'Content-Type': 'image/svg+xml' },
      }
    );
  }
}

/**
 * Handle dynamic requests
 */
async function handleDynamicRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  
  try {
    // Try cache first
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('🔄 Serving dynamic content from cache:', request.url);
      
      // Revalidate in background
      fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
          cache.put(request, networkResponse.clone());
        }
      }).catch(() => {
        // Ignore background fetch errors
      });
      
      return cachedResponse;
    }
    
    // Fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Dynamic request failed:', error);
    
    // Return cached version if available
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return new Response('Offline', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/html' },
      });
    }
    
    throw error;
  }
}

/**
 * Check if request is for static asset
 */
function isStaticAsset(request) {
  const url = new URL(request.url);
  
  return (
    STATIC_ASSETS.some(asset => url.pathname.startsWith(asset)) ||
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.ttf')
  );
}

/**
 * Check if request is for API
 */
function isAPIRequest(request) {
  const url = new URL(request.url);
  
  return (
    url.pathname.startsWith('/api/') ||
    API_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint))
  );
}

/**
 * Check if request is for image
 */
function isImageRequest(request) {
  const url = new URL(request.url);
  
  return (
    url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i) ||
    request.headers.get('accept')?.includes('image/')
  );
}

console.log('🚀 HT-008 Service Worker loaded successfully');
