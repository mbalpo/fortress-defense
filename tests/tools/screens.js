// Genera le schermate principali in tests/screenshots/ (serve @napi-rs/canvas). Uso: npm run screenshots
const { JSDOM } = require("jsdom"), fs = require("fs"), path = require("path");
const SRC = fs.readFileSync(path.join(__dirname, "..", "..", "app", "index.html"), "utf8");
const OUT = path.join(__dirname, "..", "screenshots"); fs.mkdirSync(OUT, { recursive: true });
const seeded = (seed) => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
const BUILD = "META.startTurrets.slice(0, 4).forEach((id, i) => { slots[i] = makeShooter(TURRETS[id], SLOT_X[i], GROUND_Y - 14); });";
function game({ progress, settings, src }) {
  let rafCb = null, t = 0; const texts = [];
  const dom = new JSDOM(src || SRC, { runScripts: "dangerously", pretendToBeVisual: true, url: "http://localhost/",
    beforeParse(w) {
      w.localStorage.setItem("fortress-progress-v1", JSON.stringify(progress || { cleared: 0, seen: [] }));
      if (settings) w.localStorage.setItem("fortress-proto-v1", JSON.stringify(settings));
      w.requestAnimationFrame = (cb) => { rafCb = cb; return 1; }; w.Math.random = seeded(7);
      const orig = w.HTMLCanvasElement.prototype.getContext;
      w.HTMLCanvasElement.prototype.getContext = function (...a) { const c = orig.apply(this, a); if (c && !c.__w) { const f = c.fillText.bind(c); c.fillText = (s, ...r) => { texts.push(String(s)); return f(s, ...r); }; c.__w = true; } return c; };
    } });
  const w = dom.window, cv = w.document.getElementById("c");
  const g = { w, texts,
    frame: (n = 1) => { for (let i = 0; i < n; i++) { texts.length = 0; t += 16.7; const cb = rafCb; rafCb = null; cb(t); } },
    key: (k) => w.dispatchEvent(new w.KeyboardEvent("keydown", { key: k })),
    save: (name) => { fs.writeFileSync(path.join(OUT, name), Buffer.from(cv.toDataURL("image/png").split(",")[1], "base64")); console.log("  " + name); } };
  g.frame(2); return g;
}
const ALL_SEEN = ["saucer", "shard", "meteor", "rock", "asteroid", "ship:fire", "ship:energy", "ship:electric", "ship:force", "ship:physical", "mothership:energy", "mothership:electric"];
const strong = SRC.replace("domeHp: 100,", "domeHp: 100000,").replace("startTurrets: [],", 'startTurrets: ["sky", "laser", "hive", "rail"],')
  .replace(BUILD, BUILD + " const giveAll = (s, ids) => ids.forEach((id) => applyUp(s, s.def.ups.find((v) => v.id === id))); giveAll(slots[0], ['dmg','split1','fire']); giveAll(slots[2], ['hits','wave1','drone','evo1']); giveAll(player, ['dmg','frenzy1','fan']);");
console.log("Schermate in " + OUT + ":");
{ const g = game({ progress: { cleared: 23, seen: ALL_SEEN } }); g.save("01-menu.png"); }
{ const g = game({ progress: { cleared: 19, seen: ALL_SEEN }, src: strong }); g.key("Enter"); g.frame(330); g.save("02-battaglia.png");
  for (let i = 0; i < 20000 && !g.texts.includes("Scegli un potenziamento"); i++) g.frame(); g.save("03-carte.png"); g.key("1"); g.frame(60);
  g.key("p"); g.frame(); g.save("04-pausa-nemici.png"); g.key("Tab"); g.frame(); g.save("05-pausa-torri.png"); }
{ const g = game({ progress: { cleared: 0, seen: [] } }); g.key("Enter"); for (let i = 0; i < 2000 && !g.texts.some((s) => s.startsWith("Nuovo nemico")); i++) g.frame(); g.frame(20); g.save("06-avviso-nuovo-nemico.png"); }
{ const g = game({ progress: { cleared: 12, seen: ["saucer", "rock"] } }); g.key("Enter"); g.frame(); g.key("p"); g.frame(); g.save("07-pausa-sconosciuti.png"); }
{ const src = SRC.replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__x = { spawn, enemies: () => enemies, clear: () => { queue = []; } };\n})();");
  const g = game({ progress: { cleared: 50, seen: ALL_SEEN }, src }); g.key("Enter"); g.frame(); const X = g.w.__x; X.clear();
  const put = (x, y, st) => { X.spawn({ enemy: "shell", x }); const e = X.enemies().slice(-1)[0]; Object.assign(e, { x, y, speed: 0, spin: 0, hp: 1e7, maxHp: 1e7 }, st); };
  [{ slowT: 99 }, { paraT: 99 }, { weakT: 99 }, { vulnT: 99 }, { burnT: 99, burnDps: 0 }].forEach((st, i) => put(44 + i * 68, 200, st));
  [1, 3, 5].forEach((n, i) => put(90 + i * 90, 330, { destrN: n, destrT: 99 }));
  g.frame(130); g.save("08-indicatori-stato.png"); }
{ const g = game({ progress: { cleared: 13, seen: ALL_SEEN }, settings: { targeting: "closest", aim: "manual" } }); g.key("Enter"); g.frame(330);
  const cv = g.w.document.getElementById("c"); const e = new g.w.Event("pointerdown", { bubbles: true, cancelable: true }); e.clientX = 110; e.clientY = 170; cv.dispatchEvent(e); g.frame(40); g.save("09-mira-manuale.png"); }
