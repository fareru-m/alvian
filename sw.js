// Naikkan nomor versi setiap kali file app diubah (alvian-v1 → alvian-v2, dst.)
const CACHE = "alvian-v8";
const FILES = ["./", "index.html", "config.js", "manifest.json",
               "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512-v2.png",
               "icons/apple-touch-icon.png", "icons/favicon-48.png", "icons/logo.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

// Network-first untuk file app sendiri (selalu coba versi terbaru, pakai cache kalau offline).
// Request ke Apps Script, Google Fonts, dan Chart.js (domain lain) tidak disentuh.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
