// Đổi số phiên bản mỗi khi cập nhật index.html để máy tải bản mới
const CACHE = "ccarp-v3";
const FILES = ["./", "./index.html", "./manifest.json",
  "./icons/icon-180.png", "./icons/icon-192.png", "./icons/icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  const key = e.request.mode === "navigate" ? "./index.html" : e.request;
  e.respondWith(caches.open(CACHE).then(cache =>
    cache.match(key, { ignoreSearch: true }).then(hit => {
      const net = fetch(e.request).then(res => { if (res && res.ok) cache.put(key, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    })
  ));
});
