// Minimal development service worker stub
// Keeps the browser from routing /sw.js to the SPA and avoids dev-time 404s.
self.addEventListener('install', (event) => {
  // Activate immediately
  self.skipWaiting()
})
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})
// No runtime caching rules here — Workbox will replace this in production builds.
self.addEventListener('fetch', (event) => {
  // Passthrough — don't intercept requests during development
})
