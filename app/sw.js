// Planet Defense · service worker
// Strategia: risponde subito dalla cache (il gioco parte anche offline).
// Ad ogni pubblicazione alzare VERSION (uguale ad APP_VERSION in index.html): se sw.js non cambia, il browser
// non vede l’aggiornamento. La versione nuova scarica tutti i file in una cache nuova; la schermata iniziale
// del gioco la attiva e ricarica la pagina. Se cambia l’elenco dei file, aggiornare anche ASSETS.
const VERSION = "1.31.0";
const CACHE = "fortress-" + VERSION;
const ASSETS = ["./", "./index.html", "./draw.js", "./draw-hd2d.js", "./audio.js", "./manifest.json", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./icon-180.png",
  // prova dei campioni (1.31.0, DESIGN.md § 18): solo i file usati da audio.js
  "./suoni/click_002.ogg", "./suoni/click_003.ogg", "./suoni/click_005.ogg", "./suoni/explosionCrunch_000.ogg", "./suoni/explosionCrunch_001.ogg", "./suoni/explosionCrunch_004.ogg", "./suoni/glass_001.ogg", "./suoni/glass_002.ogg", "./suoni/glass_004.ogg", "./suoni/glass_005.ogg", "./suoni/glass_006.ogg", "./suoni/impactMetal_001.ogg", "./suoni/impactMetal_004.ogg", "./suoni/lowFrequency_explosion_001.ogg"];

self.addEventListener("install", (e) => {
  // cache: "reload" salta la cache HTTP del browser: i file arrivano davvero dal sito
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS.map((u) => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting()));
});

// la schermata iniziale chiede di attivare subito una versione rimasta in attesa
self.addEventListener("message", (e) => { if (e.data && e.data.type === "skipWaiting") self.skipWaiting(); });

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
