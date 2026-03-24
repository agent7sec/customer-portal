/**
 * Service Worker for Customer Portal
 * 
 * Implements caching strategies for:
 * - Static assets (JS, CSS, images)
 * - API responses with appropriate TTL
 * - Offline fallback support
 */

const CACHE_NAME = 'customer-portal-v1';
const RUNTIME_CACHE = 'customer-portal-runtime-v1';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Cache duration for different resource types (in seconds)
const CACHE_DURATION = {
  static: 7 * 24 * 60 * 60, // 7 days for static assets
  api: 5 * 60, // 5 minutes for API responses
  images: 30 * 24 * 60 * 60, // 30 days for images
};

/**
 * Install event - precache essential assets
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Precaching assets');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('Service Worker: Clearing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

/**
 * Fetch event - implement caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Determine caching strategy based on request type
  if (isStaticAsset(url)) {
    // Cache-first strategy for static assets
    event.respondWith(cacheFirst(request, CACHE_NAME));
  } else if (isApiRequest(url)) {
    // Network-first strategy for API requests
    event.respondWith(networkFirst(request, RUNTIME_CACHE, CACHE_DURATION.api));
  } else if (isImageRequest(url)) {
    // Cache-first strategy for images
    event.respondWith(cacheFirst(request, RUNTIME_CACHE));
  } else {
    // Network-first for everything else
    event.respondWith(networkFirst(request, RUNTIME_CACHE));
  }
});

/**
 * Cache-first strategy
 * Try cache first, fall back to network
 */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('Fetch failed:', error);
    throw error;
  }
}

/**
 * Network-first strategy
 * Try network first, fall back to cache
 */
async function networkFirst(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);
    if (response.ok) {
      // Add timestamp header for cache expiration
      const clonedResponse = response.clone();
      const headers = new Headers(clonedResponse.headers);
      headers.set('sw-cache-timestamp', Date.now().toString());
      
      const responseToCache = new Response(clonedResponse.body, {
        status: clonedResponse.status,
        statusText: clonedResponse.statusText,
        headers: headers,
      });
      
      cache.put(request, responseToCache);
    }
    return response;
  } catch (error) {
    console.log('Network request failed, trying cache:', error);
    const cached = await cache.match(request);

    if (cached) {
      // Check if cache is expired
      if (maxAge) {
        const timestamp = cached.headers.get('sw-cache-timestamp');
        if (timestamp) {
          const age = (Date.now() - parseInt(timestamp)) / 1000;
          if (age > maxAge) {
            console.log('Cache expired, removing entry');
            cache.delete(request);
            throw error;
          }
        }
      }
      return cached;
    }

    throw error;
  }
}

/**
 * Check if request is for a static asset
 */
function isStaticAsset(url) {
  return /\.(js|css|woff2?|ttf|eot)$/.test(url.pathname);
}

/**
 * Check if request is an API call
 */
function isApiRequest(url) {
  return url.pathname.startsWith('/api/');
}

/**
 * Check if request is for an image
 */
function isImageRequest(url) {
  return /\.(png|jpg|jpeg|svg|gif|webp|ico)$/.test(url.pathname);
}

/**
 * Message event - handle messages from clients
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});
