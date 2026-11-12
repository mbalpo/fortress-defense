const fs = require("fs"), vm = require("vm");
const code = fs.readFileSync(require("path").join(__dirname, "..", "app", "sw.js"), "utf8");
const ok = (c) => c ? "✓" : "✗ ERRORE";
const BASE = "https://example.com/gioco/";
const norm = (u) => { const x = new URL(typeof u === "string" ? u : u.url, BASE); x.search = ""; return x.href; };
let online = true, server = { "index.html": "versione 1" };
const resp = (body) => ({ ok: true, body, clone() { return resp(body); } });
const net = async (u) => { if (!online) throw new Error("offline"); const path = new URL(norm(u)).pathname.replace("/gioco/", "") || "index.html"; return resp(server[path] !== undefined ? server[path] : "file " + path); };
const store = new Map();
const cacheObj = (m) => ({ addAll: async (urls) => { for (const u of urls) m.set(norm(u), await net(u)); }, put: async (req, res) => { m.set(norm(req), res); }, match: async (req) => m.get(norm(req)) });
const caches = {
  open: async (n) => { if (!store.has(n)) store.set(n, new Map()); return cacheObj(store.get(n)); },
  keys: async () => [...store.keys()], delete: async (n) => store.delete(n),
  match: async (req) => { for (const m of store.values()) { const r = m.get(norm(req)); if (r) return r; } return undefined; },
};
const handlers = {};
const self = { addEventListener: (t, f) => { handlers[t] = f; }, skipWaiting: () => {}, clients: { claim: async () => {} }, location: { origin: "https://example.com" } };
vm.runInNewContext(code, { self, caches, fetch: (r) => net(r), URL, Response: { error: () => ({ ok: false, body: "ERRORE" }) }, Promise, console });
async function fire(type, extra) { const ev = { waits: [], waitUntil(p) { this.waits.push(p); }, respondWith(p) { this.resp = p; }, ...extra }; handlers[type](ev); const r = ev.resp ? await ev.resp : undefined; await Promise.all(ev.waits); return { ev, r }; }
const get = (url, mode) => fire("fetch", { request: { method: "GET", url: new URL(url, BASE).href, mode: mode || "no-cors" } });
(async () => {
  store.set("fortress-0.9.0", new Map());                   // una versione vecchia rimasta in cache
  await fire("install");
  const cached = [...store.get("fortress-1.0.0").keys()].map((u) => u.replace(BASE, "") || "./");
  console.log("installazione → file in cache:", cached.join(", "), ok(cached.length === 7));
  await fire("activate");
  console.log("attivazione → cache rimaste:", [...store.keys()].join(", "), ok(store.size === 1 && store.has("fortress-1.0.0")));
  server["index.html"] = "versione 2";                       // pubblico un aggiornamento
  const a = await get("index.html", "navigate");
  const b = await get("index.html", "navigate");
  console.log("aggiornamento pubblicato → primo avvio:", a.r.body, "| avvio successivo:", b.r.body, ok(a.r.body === "versione 1" && b.r.body === "versione 2"));
  online = false;
  const c = await get("index.html?v=3", "navigate"), d = await get("icon-192.png"), e = await get("livello/qualsiasi", "navigate");
  console.log("offline → gioco:", c.r.body, "| icona:", d.r.ok ? "dalla cache" : "assente", "| pagina sconosciuta:", e.r.body, ok(c.r.body === "versione 2" && d.r.ok && e.r.body === "versione 2"));
  const f = await fire("fetch", { request: { method: "GET", url: "https://altrosito.com/x.js", mode: "no-cors" } });
  const g = await fire("fetch", { request: { method: "POST", url: BASE + "index.html", mode: "cors" } });
  console.log("richieste ad altri siti o non GET: ignorate", ok(!f.ev.resp && !g.ev.resp));
})();
