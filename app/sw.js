// Fortress Defense · service worker
// Strategia: risponde subito dalla cache (il gioco parte anche offline) e intanto scarica la versione nuova,
// che verrà usata all'avvio successivo. Cambiare CACHE solo se cambia l'elenco dei file.
const CACHE = "fortress-1.0.0";
const ASSETS = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./icon-180.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  const fresh = fetch(req).then((res) => {
    if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
    return res;
  }).catch(() => null);
  e.waitUntil(fresh.then(() => undefined));
  e.respondWith(caches.match(req, { ignoreSearch: true }).then((hit) => hit || fresh.then((res) =>
    res || (req.mode === "navigate" ? caches.match("./index.html") : Response.error()))));
});
