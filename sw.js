// Enhanced Service Worker for PWA functionality
const CACHE_VERSION = 'v2';
const STATIC_CACHE = `notez-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `notez-dynamic-${CACHE_VERSION}`;
const GITHUB_CACHE = `notez-github-${CACHE_VERSION}`;

// Static resources to cache immediately
const STATIC_RESOURCES = [
    '/',
    '/index.html',
    '/styles.css',
    '/main.js',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png',
    '/apple-touch-icon.png',
    '/favicon.ico',
    '/offline.html'
];

// Install event - cache static resources
self.addEventListener('install', function (event) {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(function (cache) {
                console.log('Caching static resources...');
                return cache.addAll(STATIC_RESOURCES);
            })
            .then(function () {
                console.log('Static resources cached, skipping waiting...');
                return self.skipWaiting();
            })
    );
});

// Activate event - claim clients and clean up old caches
self.addEventListener('activate', function (event) {
    console.log('Service Worker activating...');
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then(function (cacheNames) {
                return Promise.all(
                    cacheNames.map(function (cacheName) {
                        if (cacheName !== STATIC_CACHE && 
                            cacheName !== DYNAMIC_CACHE && 
                            cacheName !== GITHUB_CACHE) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Claim all clients
            self.clients.claim()
        ])
    );
});

// Enhanced fetch event with different caching strategies
self.addEventListener('fetch', function (event) {
    const request = event.request;
    const url = new URL(request.url);

    // Handle different types of requests with appropriate strategies
    if (request.method === 'GET') {
        // HTML/Navigation requests: Network First with offline fallback
        if (request.headers.get('accept').includes('text/html')) {
            event.respondWith(
                networkFirst(request, DYNAMIC_CACHE)
                    .catch(function() {
                        return caches.match('/offline.html');
                    })
            );
        }
        // Static resources: Cache First
        else if (isStaticResource(request)) {
            event.respondWith(cacheFirst(request, STATIC_CACHE));
        }
        // GitHub API: Network First
        else if (url.hostname === 'api.github.com') {
            event.respondWith(networkFirst(request, GITHUB_CACHE));
        }
        // External CDN resources: Stale While Revalidate
        else if (url.hostname === 'cdnjs.cloudflare.com' || url.hostname === 'cdn.jsdelivr.net') {
            event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
        }
        // All other requests: Network First with fallback
        else {
            event.respondWith(networkFirst(request, DYNAMIC_CACHE));
        }
    }
});

// Cache First strategy - for static resources
function cacheFirst(request, cacheName) {
    return caches.open(cacheName)
        .then(function (cache) {
            return cache.match(request)
                .then(function (response) {
                    if (response) {
                        return response;
                    }
                    return fetch(request)
                        .then(function (fetchResponse) {
                            if (fetchResponse.status === 200) {
                                cache.put(request, fetchResponse.clone());
                            }
                            return fetchResponse;
                        });
                });
        });
}

// Network First strategy - for dynamic content
function networkFirst(request, cacheName) {
    return fetch(request)
        .then(function (response) {
            if (response.status === 200) {
                caches.open(cacheName)
                    .then(function (cache) {
                        cache.put(request, response.clone());
                    });
            }
            return response;
        })
        .catch(function () {
            return caches.match(request);
        });
}

// Stale While Revalidate strategy - for external resources
function staleWhileRevalidate(request, cacheName) {
    return caches.open(cacheName)
        .then(function (cache) {
            return cache.match(request)
                .then(function (response) {
                    const fetchPromise = fetch(request)
                        .then(function (fetchResponse) {
                            if (fetchResponse.status === 200) {
                                cache.put(request, fetchResponse.clone());
                            }
                            return fetchResponse;
                        });
                    
                    return response || fetchPromise;
                });
        });
}

// Helper function to determine if a request is for a static resource
function isStaticResource(request) {
    const url = new URL(request.url);
    return STATIC_RESOURCES.some(resource => 
        url.pathname === resource || url.pathname.endsWith(resource)
    );
}

// Background sync for offline operations
self.addEventListener('sync', function (event) {
    if (event.tag === 'github-sync') {
        console.log('Background sync triggered for GitHub operations');
        event.waitUntil(handleBackgroundSync());
    }
});

// Handle background sync operations
function handleBackgroundSync() {
    return self.clients.matchAll()
        .then(function (clients) {
            clients.forEach(function (client) {
                client.postMessage({
                    type: 'BACKGROUND_SYNC',
                    action: 'github-sync'
                });
            });
        });
}

// Handle update notifications
self.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('Received skip waiting message');
        self.skipWaiting();
    }
});
