// Genera le schermate principali in tests/screenshots/ (serve @napi-rs/canvas). Uso: npm run screenshots
const { JSDOM } = require("jsdom"), fs = require("fs"), path = require("path");
const SRC = require("../src").gameHtml();
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
  w.document.getElementById("splash").click();   // schermata iniziale: tocco su “Start”
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
{ // combo del guardiano: carte, effetti in battaglia, elenco nella pausa
  const src = SRC.replace("requestAnimationFrame(frame);\n})();", `requestAnimationFrame(frame);
window.__x = { player: () => player, slots: () => slots, makeShooter, TURRETS, SLOT_X, GROUND_Y, PLAYER_DEF, guardProc, guardWheel, living, spawn, enemies: () => enemies,
  clear: () => { queue = []; enemies.length = 0; },
  setOpts: (o) => { options = o; state = "upgrade"; } };
})();`);
  const setup = () => {
    const g = game({ progress: { cleared: 23, seen: ALL_SEEN }, src }); g.key("Enter"); g.frame(); const X = g.w.__x, p = X.player();
    const towers = [["hive", {}, 2], ["laser", { multi1: 1 }, 2], ["wheel", { mini1: 1 }, 2], ["vortex", {}, 2]];
    towers.forEach(([id, up, lv], i) => { const s = X.makeShooter(X.TURRETS[id], X.SLOT_X[i], X.GROUND_Y - 14); Object.assign(s.up, up); s.level = lv; X.slots()[i] = s; });
    p.level = 2; return { g, X, p };
  };
  { const { g, X, p } = setup(); const U = (id) => X.PLAYER_DEF.ups.find((u) => u.id === id);
    X.setOpts(["kVortex", "kBeam", "kWheel"].map((id) => ({ kind: "up", who: p, up: U(id) }))); g.frame(); g.save("10-carte-combo.png"); }
  { const { g, X, p } = setup(); Object.assign(p.up, { kHive: 1, kLaser: 1, kWheel: 1, kVortex: 1, proj: 1 }); p.x = p.targetX = 120;
    X.clear(); [[90, 260], [250, 230], [150, 330], [290, 380], [60, 400], [200, 160]].forEach(([x, y], i) => {
      X.spawn({ enemy: i % 2 ? "shell" : "brute", x }); const e = X.enemies().slice(-1)[0]; Object.assign(e, { x, y, speed: 0, hp: 1e7, maxHp: 1e7 }); });
    g.frame(90); const e = X.living()[2]; if (e) X.guardProc(p, { laser: true }, e); X.guardWheel(p); X.guardWheel(p); g.frame(50); g.save("11-combo-battaglia.png");
    g.key("p"); g.frame(); g.key("Tab"); g.frame(); g.save("12-pausa-combo.png"); }
}
{ // scene aggiunte per il catalogo grafico: 4 torrette e molti nemici, mini-boss, boss finale, carte Standard/Chain/Level up, annuncio, vittoria, sconfitta
  const src = SRC.replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();");
  const setup = (cleared) => { const g = game({ progress: { cleared, seen: ALL_SEEN }, src }); g.key("Enter"); g.frame(); return { g, ev: g.w.__ev }; };
  const towers = (ev, list) => ev(`(${JSON.stringify(list)}).forEach(([id, lv], i) => { const s = makeShooter(TURRETS[id], SLOT_X[i], GROUND_Y - 14); s.level = lv; slots[i] = s; })`);
  const put = (ev, enemy, x, y, extra) => ev(`spawn({ enemy: "${enemy}", x: ${x} }); Object.assign(enemies[enemies.length - 1], { x: ${x}, y: ${y}, speed: 0, spin: 0.6, hp: 1e7, maxHp: 1e7 }, ${JSON.stringify(extra || {})});`);
  { const { g, ev } = setup(23); ev("queue = []; enemies.length = 0;"); towers(ev, [["thunder", 2], ["beam", 2], ["aero", 2], ["tesla", 2]]);
    const kinds = ["drone", "wisp", "brute", "spitter", "shell"];
    for (let i = 0; i < 20; i++) put(ev, kinds[i % 5], 30 + (i * 67) % 300, 150 + Math.floor(i / 5) * 70 + (i % 3) * 12, { hp: 1e7 * (0.4 + 0.15 * (i % 4)) });
    g.frame(150); g.save("13-battaglia-4-torrette.png"); }
  { const { g, ev } = setup(23); ev("queue = []; enemies.length = 0; spawn({ enemy: 'boss', def: bossDef(campLevel, 5), x: 180 }); Object.assign(enemies[0], { y: 230, speed: 0, hp: 6e6, maxHp: 1e7 });");
    g.frame(90); g.save("14-mini-boss.png"); }
  { const { g, ev } = setup(19); ev("queue = []; enemies.length = 0; spawn({ enemy: 'boss', def: finalBossDef(20), x: 180 }); Object.assign(enemies[0], { y: 240, speed: 0, hp: 7e6, maxHp: 1e7 });");
    g.frame(90); g.save("15-boss-finale.png"); }
  { const { g, ev } = setup(23); towers(ev, [["sky", 1], ["rail", 2]]);
    ev(`const sky = slots[0], rail = slots[1], U = (s, id) => s.def.ups.find((u) => u.id === id);
      options = [{ kind: "up", who: sky, up: U(sky, "dmg") }, { kind: "up", who: rail, up: rail.def.ups.find((u) => u.cat === "chain" && u.lv === 1) }, { kind: "up", who: player, up: player.def.ups.find((u) => u.cat === "lu" && u.lv === 2) }]; state = "upgrade";`);
    g.frame(); g.save("16-carte-standard-chain-levelup.png"); }
  { const { g } = setup(23); g.frame(8); g.save("17-annuncio-ondata.png"); }
  { const { g, ev } = setup(23); g.frame(200); ev("state = 'won'"); g.frame(); g.save("18-vittoria.png"); }
  { const { g, ev } = setup(23); g.frame(200); ev("domeHp = 0; state = 'lost'"); g.frame(); g.save("19-sconfitta.png"); }
}
