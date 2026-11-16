// Proposta grafica HD-2D: schermate di prova con docs/hd2d/draw-hd2d.js al posto di app/draw.js (il gioco non cambia).
// Uso: node tests/tools/hd2d-shots.js [--orig]  → tests/screenshots/hd2d-*.png (con --orig le stesse scene col disegno attuale, per confronto)
const { JSDOM } = require("jsdom"), fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", "..");
const ORIG = process.argv.includes("--orig");
const OUT = path.join(ROOT, "tests", "screenshots"); fs.mkdirSync(OUT, { recursive: true });
const TAG = '<script src="draw.js"></script>';
const html = fs.readFileSync(path.join(ROOT, "app", "index.html"), "utf8");
const draw = fs.readFileSync(path.join(ROOT, ORIG ? "app/draw.js" : "docs/hd2d/draw-hd2d.js"), "utf8");
const HOOK = "requestAnimationFrame(frame);\n})();";
const SRC = html.replace(TAG, () => "<script>\n" + draw + "</script>").replace("domeHp: 100,", "domeHp: 100000,")
  .replace(HOOK, "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();");
const seeded = (seed) => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };

function game() {
  let rafCb = null, t = 0;
  const dom = new JSDOM(SRC, { runScripts: "dangerously", pretendToBeVisual: true, url: "http://localhost/",
    beforeParse(w) {
      w.localStorage.setItem("fortress-progress-v1", JSON.stringify({ cleared: 23, seen: ["saucer", "shard", "meteor", "rock", "asteroid"] }));
      w.requestAnimationFrame = (cb) => { rafCb = cb; return 1; }; w.Math.random = seeded(7);
    } });
  const w = dom.window, cv = w.document.getElementById("c");
  w.document.getElementById("splash").click();
  const g = { w, ev: (c) => w.__ev(c),
    frame: (n = 1) => { for (let i = 0; i < n; i++) { t += 16.7; const cb = rafCb; rafCb = null; cb(t); } if (w.__err) throw w.__err; },
    key: (k) => w.dispatchEvent(new w.KeyboardEvent("keydown", { key: k })),
    save: (name) => { const f = (ORIG ? "hd2d-orig-" : "hd2d-") + name; fs.writeFileSync(path.join(OUT, f), Buffer.from(cv.toDataURL("image/png").split(",")[1], "base64")); console.log("  " + f); } };
  w.addEventListener("error", (e) => { w.__err = e.error || e.message; });
  g.frame(2); return g;
}
console.log("Schermate HD-2D in " + OUT + ":");

// battaglia: Sky Guard (Area infuocata), Laser, Vortex (wormhole), guardiano con le due combo di fuoco e force
function battle(extra) {
  const g = game(); g.key("Enter"); g.frame();
  g.ev(`queue = []; enemies.length = 0; player.level = 2;
    [["sky", { fire: 1, msl: 1, split1: 1 }], ["laser", { multi1: 1 }], ["vortex", { wh1: 1, wh2: 1 }]].forEach(([id, up], i) => {
      const s = makeShooter(TURRETS[id], SLOT_X[i], GROUND_Y - 14); Object.assign(s.up, up); s.level = 2; slots[i] = s; });
    Object.assign(player.up, { kSky: 1, kVortex: 1, proj: 2, fan: 1 }); player.x = player.targetX = 250;
    [["drone", 90, 250], ["brute", 250, 220], ["spitter", 150, 330], ["shell", 290, 380], ["brute", 60, 420], ["drone", 210, 150], ["spitter", 300, 120], ["shell", 120, 170]]
      .forEach(([k, x, y]) => { spawn({ enemy: k, x }); const e = enemies[enemies.length - 1]; Object.assign(e, { x, y, speed: 0, hp: 1e7, maxHp: 1e7 }); });
    alerts.length = 0; ${extra || ""}`);
  return g;
}
{ const g = battle(); g.frame(150); g.ev("alerts.length = 0; portals(slots[2], { x: 110, y: 200 }, { x: 270, y: 70 }); skyImpact(slots[0], 250, 230, false); skyImpact(slots[0], 150, 330, false);");
  g.frame(28); g.ev("laserFire(slots[1]);");
  g.frame(12); g.save("battaglia.png"); g.frame(37); g.save("battaglia-2.png"); }

// tavola degli sprite ingranditi ×3: torrette, guardiano (normale, frenesia, clone), nemici nei 5 tipi
{ const g = battle(); g.frame(30);
  g.ev(`state = "pause"; ctx.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0); ctx.fillStyle = "#1b2238"; ctx.fillRect(0, 0, W, H);
    const Z = 2.2, at = (x, y, fn) => { ctx.save(); ctx.translate(x, y); ctx.scale(Z, Z); fn(); ctx.restore(); };
    ["sky", "laser", "vortex"].forEach((id, i) => at(40 + i * 60, 110, () => DRAW.TURRET_ART[id](0, 0, TYPES[TURRETS[id].def ? TURRETS[id].def.type : TURRETS[id].type].color)));
    at(230, 120, () => { ctx.translate(0, -GROUND_Y); player.st.frenzyT = 0; DRAW.guardianShape(0); });
    at(310, 120, () => { ctx.translate(0, -GROUND_Y); player.st.frenzyT = 5; DRAW.guardianShape(0); player.st.frenzyT = 0; });
    const foe = (def, x, y, extra) => at(x, y, () => DRAW.drawEnemy(Object.assign({ def, x: 0, y: 0, hp: 1, maxHp: 1, flash: 0, shape: DRAW.ICON_SHAPE, rot: 0.4, boss: false }, extra || {})));
    ["drone", "brute", "spitter", "shell", "wisp"].forEach((k, i) => foe(ENEMY_DEFS[k], 36 + i * 70, 230));
    TYPE_KEYS.forEach((t, i) => foe(Object.assign({}, ENEMY_DEFS.brute, { type: t }), 36 + i * 70, 330, { rot: i * 0.9 }));
    TYPE_KEYS.forEach((t, i) => foe(Object.assign({}, ENEMY_DEFS.drone, { type: t }), 36 + i * 70, 420));
    foe(ENEMY_DEFS.spitter, 60, 510, { flash: 0.1 }); foe(ENEMY_DEFS.shell, 160, 510, { hp: 0.5, slowT: 1, burnT: 1 });
    DRAW.FX.portals({ t: 4 }, { x: 260, y: 500 }, 22, { x: 320, y: 560 });`);
  g.save("sprite.png"); }

// fase 2: le 11 torrette, cristallo-cometa, nave aliena e nave madre nei 5 tipi
{ const g = battle(); g.frame(30);
  g.ev(`state = "pause"; ctx.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0); ctx.fillStyle = "#1b2238"; ctx.fillRect(0, 0, W, H);
    const at = (x, y, z, fn) => { ctx.save(); ctx.translate(x, y); ctx.scale(z, z); fn(); ctx.restore(); };
    Object.keys(TURRETS).forEach((id, i) => at(30 + (i % 6) * 60, 80 + Math.floor(i / 6) * 90, 1.8, () => DRAW.TURRET_ART[id](0, 0, TYPES[TURRETS[id].type].color)));
    const foe = (def, x, y, z, extra) => at(x, y, z, () => DRAW.drawEnemy(Object.assign({ def, x: 0, y: 0, hp: 1, maxHp: 1, flash: 0, shape: DRAW.ICON_SHAPE, rot: 0.4, boss: false }, extra || {})));
    TYPE_KEYS.forEach((t, i) => foe(Object.assign({}, ENEMY_DEFS.wisp, { type: t }), 36 + i * 70, 250, 1.8));
    TYPE_KEYS.forEach((t, i) => foe(Object.assign(bossDef(1, 5), { type: t }), 36 + i * 72, 360, 1.1, { boss: true, hp: 0.7 }));
    TYPE_KEYS.slice(0, 3).forEach((t, i) => foe(Object.assign(finalBossDef(10), { type: t }), 60 + i * 120, 520, 1, { boss: true, hp: 0.7 }));`);
  g.save("sprite-2.png"); }
