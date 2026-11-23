// Service Worker: App-Dateien offline verfügbar machen.
// Erst Netz (damit Updates sofort ankommen), nach 4 s oder offline aus dem Cache.
const CACHE = 'podboard-v3';
const DATEIEN = ['./', 'index.html', 'app.js', 'style.css', 'manifest.json', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(DATEIEN)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  // Nur eigene Dateien; Anfragen an Google/Scryfall laufen normal.
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  // no-cache: beim Server nachfragen statt bis zu 10 Min. alte Browser-Kopie zu nehmen, damit Updates sofort ankommen.
  const netz = fetch(e.request.url, { cache: 'no-cache' }).then(r => {
    if (r.ok) { const kopie = r.clone(); caches.open(CACHE).then(c => c.put(e.request, kopie)); }
    return r;
  });
  const ausCache = () => caches.match(e.request, { ignoreSearch: true });
  const zuLangsam = new Promise(ok => setTimeout(ok, 4000)).then(ausCache);
  e.respondWith(Promise.race([netz, zuLangsam]).then(r => r || netz).catch(() => ausCache()));
});
