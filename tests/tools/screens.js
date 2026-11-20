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
{ const g = game({ progress: { cleared: 13, seen: ALL_SEEN } }); g.key("Enter"); g.frame(330);
  const cv = g.w.document.getElementById("c"); const e = new g.w.Event("pointerdown", { bubbles: true, cancelable: true }); e.clientX = 110; e.clientY = 400; cv.dispatchEvent(e); g.frame(40); g.save("09-tiro-verticale.png");
  const m = new g.w.Event("pointermove", { bubbles: true }); m.clientX = 200; m.clientY = 180; cv.dispatchEvent(m); g.frame(30); g.save("09b-mirino.png"); }
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
  // combo tra due torrette (1.15.0): carte (Laser + Hive, Hive + Firewheel, Firewheel + Vortex) e i loro effetti in battaglia
  { const { g, X } = setup(); const [hive, laser, wheel, vortex] = X.slots(); Object.assign(hive.up, { seed1: 1 }); Object.assign(wheel.up, { trail1: 1 }); Object.assign(vortex.up, { stat1: 1 });
    const K = (s, id) => ({ kind: "up", who: s, up: s.def.ups.find((u) => u.id === id) });
    X.setOpts([K(laser, "kHive"), K(hive, "kWheel"), K(wheel, "kVortex")]); g.frame(); g.save("10b-carte-combo-torrette.png"); }
  { const { g, X } = setup(); const [hive, laser, wheel, vortex] = X.slots();
    Object.assign(hive.up, { seed1: 1, kWheel: 1 }); Object.assign(wheel.up, { trail1: 1, kVortex: 1 }); Object.assign(vortex.up, { stat1: 1 }); Object.assign(laser.up, { kHive: 1 }); X.player().cd = Infinity;
    X.clear(); [[90, 260], [250, 230], [150, 330], [290, 380], [60, 400], [200, 160]].forEach(([x, y], i) => {
      X.spawn({ enemy: i % 2 ? "shell" : "brute", x }); const e = X.enemies().slice(-1)[0]; Object.assign(e, { x, y, speed: 0, hp: 1e7, maxHp: 1e7 }); });
    g.frame(400); g.save("11b-combo-torrette-battaglia.png"); }
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
{ // albero dei Sigilli (DESIGN.md § 16): menu con l’albero aperto, le tre sezioni, acquisto in attesa, vittoria con Sigilli
  const src = SRC.replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();");
  const prog = { cleared: 36, seen: ALL_SEEN, seals: 7, claims: ["s31", "s32", "s33", "s34", "s35", "s36", "s31p", "s33p"],
    tree: { "sky:burn1": 1, "sky:burn2": 1, "sky:burn3": 1, "sky:splitB": 1, "sky:fire": 1, "sky:again": 1, "sky:perm": 1, "laser:sweep1": 1, "player:boom1": 1, "player:punch": 1, "sky:std:dmg": 3, "sky:std:msl": 1, "laser:std:dmg": 2, "types:dmg:fire": 2, "types:all": 1, "barrier:hp": 2, "barrier:red": 1, "barrier:flat": 1, "player:std:dmg": 2, "player:fan": 1 }, loadout: ["sky"] };
  { const g = game({ progress: prog, src }); g.save("20-menu-sigilli.png"); g.w.__ev("openTree()"); g.frame(); g.save("21-albero-torrette.png");
    g.w.__ev("treeSel = 'laser'; tapNode(TREE.laser[1])"); g.frame(); g.save("22-albero-acquisto.png");
    g.w.__ev("treeTab = 'player'; treeArm = null"); g.frame(); g.save("23-albero-guardiano.png");
    g.w.__ev("treeTab = 'barrier'"); g.frame(); g.save("24-albero-barriera.png");
    g.w.__ev("treeTab = 'turrets'; treeSel = 'types'"); g.frame(); g.save("26-albero-tipi.png");
    g.w.__ev("treeTab = 'barrier'; barrierTab = 'abilities'"); g.frame(); g.save("27-albero-abilita.png"); }
  { // abilità in battaglia: gas della Congelante, onda della Repulsiva, mine, bordo della Riflettente, immunità accumulate
    const g = game({ progress: { cleared: 45, seen: ALL_SEEN, tree: { "ab:freeze": 2, "ab:reflect": 1, "ab:mines": 1 } }, src }), ev = g.w.__ev;
    ev("selLevel = 45; startRun('standard'); queue = []; enemies.length = 0;");
    ev("for (const [x, y] of [[60, 470], [110, 440], [250, 450], [300, 480], [180, 400], [140, 330]]) { spawn({ enemy: 'shell', x }); Object.assign(enemies[enemies.length - 1], { x, y, speed: 0, hp: 1e7, maxHp: 1e7 }); }");
    ev("fireAbility({ id: 'freeze', v: abVal('freeze', 3) }); fireAbility({ id: 'mines', v: abVal('mines', 3) }); fireAbility({ id: 'reflect', v: abVal('reflect', 1) }); domeShield = 3;");
    g.frame(40); ev("fireAbility({ id: 'repulse', v: abVal('repulse', 3) })"); g.frame(12); g.save("28-abilita-battaglia.png"); }
  { // revisione 3: cupola larga, laser fermato dal bordo, sfera statica del Teslacoil, mine dell’Aeroblast e della Barriera minata
    const g = game({ progress: { cleared: 45, seen: ALL_SEEN }, src }), ev = g.w.__ev;
    ev("selLevel = 45; startRun('standard'); queue = []; enemies.length = 0;");
    ev("for (const [x, y] of [[180, 120], [40, 300], [330, 260]]) { spawn({ enemy: 'shell', x }); Object.assign(enemies[enemies.length - 1], { x, y, speed: 0, spin: 0, hp: 1e7, maxHp: 1e7 }); }");
    ev("const s = makeShooter(TURRETS.laser, SLOT_X[1], GROUND_Y - 14); s.level = 3; Object.assign(s.up, { bounce: 3, multi1: 1, multi3: 1 }); slots[1] = s;");
    g.frame(40); g.save("29-laser-cupola.png"); }
  { const g = game({ progress: { cleared: 45, seen: ALL_SEEN }, src }), ev = g.w.__ev;
    ev("selLevel = 45; startRun('standard'); queue = []; enemies.length = 0;");
    ev("for (const [x, y] of [[120, 300], [150, 320], [250, 260]]) { spawn({ enemy: 'shell', x }); Object.assign(enemies[enemies.length - 1], { x, y, speed: 0, spin: 0, hp: 1e7, maxHp: 1e7 }); }");
    ev("const t = makeShooter(TURRETS.tesla, SLOT_X[0], GROUND_Y - 14); t.level = 3; Object.assign(t.up, { orb: 1, orbDur: 1, big: 1 }); slots[0] = t; teslaBoom(t, 135, 310, 0, new Set());");
    g.frame(30); g.save("30-sfera-statica.png"); }
  { const g = game({ progress: { cleared: 45, seen: ALL_SEEN }, src }), ev = g.w.__ev;
    ev("selLevel = 45; startRun('standard'); queue = []; enemies.length = 0;");
    ev("for (const [x, y] of [[90, 330], [180, 300], [280, 340]]) { spawn({ enemy: 'shell', x }); Object.assign(enemies[enemies.length - 1], { x, y, speed: 0, spin: 0, hp: 1e7, maxHp: 1e7 }); }");
    ev("const a = makeShooter(TURRETS.aero, SLOT_X[2], GROUND_Y - 14); a.level = 3; Object.assign(a.up, { mine1: 1, mine2: 1 }); slots[2] = a;");
    g.frame(150); ev("fireAbility({ id: 'mines', v: abVal('mines', 5) })"); g.frame(10); g.save("31-mine-cupola.png"); }
  for (const [name, sph] of [["32-thunderbolt-1-sfera.png", 0], ["33-thunderbolt-3-sfere.png", 2]]) {   // 1.9.1: sfere sul profilo della cupola, solo sull’arco visibile
    const g = game({ progress: { cleared: 45, seen: ALL_SEEN }, src }), ev = g.w.__ev;
    ev("selLevel = 45; startRun('standard'); queue = []; enemies.length = 0;");
    ev("for (const [x, y] of [[90, 250], [250, 220]]) { spawn({ enemy: 'shell', x }); Object.assign(enemies[enemies.length - 1], { x, y, speed: 0, spin: 0, hp: 1e7, maxHp: 1e7 }); }");
    ev(`const t = makeShooter(TURRETS.thunder, SLOT_X[1], GROUND_Y - 14); t.level = 3; Object.assign(t.up, { sph: ${sph}, aura: 1 }); slots[1] = t;`);
    g.frame(sph ? 200 : 140); g.save(name); }
  { // 1.9.1: Firewheel con le sue chain, il drone rimbalza sul bordo della cupola
    const g = game({ progress: { cleared: 45, seen: ALL_SEEN }, src }), ev = g.w.__ev;
    ev("selLevel = 45; startRun('standard'); queue = []; enemies.length = 0;");
    ev("for (const [x, y] of [[60, 380], [300, 400], [180, 200]]) { spawn({ enemy: 'shell', x }); Object.assign(enemies[enemies.length - 1], { x, y, speed: 0, spin: 0, hp: 1e7, maxHp: 1e7 }); }");
    ev("const w = makeShooter(TURRETS.wheel, SLOT_X[0], GROUND_Y - 14); w.level = 3; Object.assign(w.up, { mini1: 1, miniB: 1, trail1: 1, trail3: 1, dur: 3 }); slots[0] = w;");
    g.frame(230); g.save("34-firewheel-cupola.png"); }
  { const g = game({ progress: { cleared: 39, seen: ALL_SEEN }, src }), ev = g.w.__ev;     // 1.9.2: avviso di sblocco sopra la vittoria
    ev("selLevel = 40; startRun('standard')"); g.frame(60); ev("winLevel()"); g.frame(); g.save("35-avviso-sblocco.png");
    ev("unlockNotes = UNLOCKS.slice(0, 1)"); g.frame(); g.save("36-avviso-sblocco-10.png"); }
  { const g = game({ progress: prog, src }); g.w.__ev("selLevel = 37; startRun('standard')"); g.frame(200); g.w.__ev("winLevel()"); g.frame(); g.save("25-vittoria-sigilli.png"); }
  { const g = game({ progress: prog, src }), ev = g.w.__ev;          // 1.14.1: primo completamento con la cupola al 100% (Epica: 3 + 3) e tasto della velocità a 1,5x
    ev("selEpic = 38; startRun('epic')"); g.frame(200); ev("cycleSpeed()"); g.frame(); g.save("59-velocita-1-5x.png"); ev("cycleSpeed(); cycleSpeed()");
    ev("domeHp = domeMax; winLevel()"); g.frame(); g.save("60-vittoria-due-sigilli.png"); }
  { // 1.12.2: area in fiamme della Sky Guard, scia di fuoco della Firewheel, colpi dell’Hive per livello (fermati a metà volo)
    const g = game({ progress: { cleared: 45, seen: ALL_SEEN }, src }), ev = g.w.__ev;
    ev("selLevel = 45; startRun('standard'); queue = []; enemies.length = 0;");
    ev("for (const [x, y] of [[90, 200], [250, 190], [180, 330]]) { spawn({ enemy: 'shell', x }); Object.assign(enemies[enemies.length - 1], { x, y, speed: 0, spin: 0, hp: 1e9, maxHp: 1e9 }); }");
    ev("zone(90, 200, 40, 5, () => {}, TYPES.fire.color, 'fireField');");
    ev("const w = makeShooter(TURRETS.wheel, SLOT_X[0], GROUND_Y - 14); w.level = 3; Object.assign(w.up, { trail1: 1, trail3: 1, dur: 3 }); slots[0] = w;");
    g.frame(140);
    ev("[[1, 120, 430], [2, 200, 440], [3, 290, 430]].forEach(([l, x, y]) => { for (let k = 0; k < [1, 2, 4][l - 1]; k++) hiveShotFx({ x, y }, enemies[2], l, k, [1, 2, 4][l - 1]); });");
    g.frame(4); g.save("43-fiamme-hive.png"); }
  { // 1.12.3: griglia dei livelli, guida (stati e carte), potenziamenti presi dalla scelta delle carte
    const lp = { cleared: 57, seen: ALL_SEEN, majors: 0, claims: ["s31", "s31p", "s32", "s33", "s33p", "s34", "s35", "s36", "s38p", "s40", "s41", "s42", "s50", "e1", "e2"], tree: { "sky:burn1": 1, "sky:std:dmg": 3 } };
    const g = game({ progress: lp, src }), ev = g.w.__ev;
    ev("openLevels(); lvSel = 45"); g.frame(); g.save("44-livelli.png");
    ev("lvFilter = true"); g.frame(); g.save("45-livelli-filtro.png");
    ev("state = 'menu'; openGuide()"); g.frame(); g.save("46-guida-stati.png");
    ev("guideTab = 'cards'; guideSel = 'sky'"); g.frame(); g.save("47-guida-carte.png");
    ev("guideScroll = 400"); g.frame(); g.save("48-guida-carte-scorrimento.png");
    const c = game({ progress: lp, src }), ec = c.w.__ev;
    ec("selLevel = 12; startRun('standard'); queue = []; enemies.length = 0; const s = makeShooter(TURRETS.sky, SLOT_X[0], GROUND_Y - 14); s.up.dmg = 2; s.up.split1 = 1; slots[0] = s; player.up.dmg = 1; wave = 3; endWave();");
    c.frame(); c.save("49-carte-potenziamenti.png"); ec("upBuild = true"); c.frame(); c.save("50-potenziamenti-presi.png"); }
  { // equipaggiamento (DESIGN.md § 15): menu, pezzi, Moduli in fusione, vittoria con gli oggetti, 4 carte e rinnovo
    const gear = { pcs: { "arma:0": 6, "arma:1": 2, "arma:3": 1, "guanti:2": 1, "nucleo:0": 3 }, mods: { "arma:0:1": 3, "arma:0:2": 1, "arma:0:23": 2, "arma:0:4": 1, "arma:2:17": 1, "arma:4:19": 1 },
      eq: { arma: { r: 4, m: [[2, 4], [4, 3], [1, 2]] }, testa: { r: 2, m: [[22, 1]] }, armatura: { r: 3, m: [[10, 4], [11, 2], [16, 0]] }, stivali: { r: 0, m: [] }, nucleo: { r: 1, m: [[30, 0], [28, 1]] } } };
    const gp = { cleared: 42, seen: ALL_SEEN, seals: 3, gear };
    const g = game({ progress: gp, src }), ev = g.w.__ev;
    g.save("37-menu-equipaggiamento.png");
    ev("openGear()"); g.frame(); g.save("38-equipaggiamento-pezzi.png");
    ev("gearSetTab('mods'); gearSetMode('fuse'); tapMod(1); tapMod(1); tapMod(23)"); g.frame(); g.save("39-equipaggiamento-moduli.png");
    ev("gearPick('guanti'); gearSetTab('pcs'); gearSetMode('use')"); g.frame(); g.save("40-equipaggiamento-vuoto.png");
    const h = game({ progress: gp, src }), eh = h.w.__ev;
    eh("selLevel = 42; startRun('standard')"); h.frame(100); eh("winLevel()"); h.frame(); h.save("41-vittoria-oggetti.png");
    const c = game({ progress: Object.assign({}, gp, { gear: { pcs: {}, mods: {}, eq: { testa: { r: 1, m: [[22, 4], [21, 4]] } } } }), src }), ec = c.w.__ev;
    ec("selLevel = 42; startRun('standard'); queue = []; enemies.length = 0;"); c.frame(80); c.frame(80); c.frame(1);
    ec("wave = 1; endWave()"); c.frame(); c.save("42-carte-4-rinnovo.png"); }
  { // 1.14.0: Continua nel menu, “sostituirla?”, Abilità bloccate, Azzera, lucchetti, due tocchi, sostituzione dei Moduli, albero in sola lettura
    const gear = { pcs: { "arma:0": 6, "arma:1": 2, "arma:3": 1, "guanti:1": 5 }, mods: { "arma:0:1": 3, "arma:0:2": 1, "arma:3:1": 1, "arma:0:4": 1 },
      eq: { arma: { r: 2, m: [[2, 2, 1], [1, 1], [17, 0]], lk: 1 } }, lock: { "arma:0": 2, "arma:0:1": 1 } };
    const gp = { cleared: 42, seen: ALL_SEEN, seals: 9, majors: 2, gear, tree: { "player:boom1": 1, "player:std:dmg": 3 } };
    const g = game({ progress: gp, src }), ev = g.w.__ev;
    ev("selLevel = 38; startRun('epic' === 'x' ? 'epic' : 'standard'); for (let w = 0; w < 6; w++) { endWave(); if (state === 'upgrade') pick(0); } state = 'menu'; selLevel = 42");
    g.frame(); g.save("51-menu-continua.png");
    ev("runArm = 'standard'"); g.frame(); g.save("52-menu-sostituirla.png");
    ev("runArm = null; openTree(); treeTab = 'player'"); g.frame(); g.save("53-albero-sospeso.png");
    ev("closeTree(); openGear()"); g.frame(); g.save("54-equipaggiamento-sospeso.png");
    ev("clearRun(); gearPick('arma'); gearSetTab('pcs'); gearSetMode('use'); tapPiece(3)"); g.frame(); g.save("55-equipaggiamento-lucchetti.png");
    ev("gearArm = null; gearSetTab('mods'); gearRar = 3; tapMod(1)"); g.frame(); g.save("56-equipaggiamento-sostituzione.png");
    ev("closeGear(); openTree(); treeTab = 'player'; tapReset()"); g.frame(); g.save("57-albero-azzera.png");
    const a = game({ progress: { cleared: 36, seen: ALL_SEEN, seals: 4, majors: 0 }, src });
    a.w.__ev("openTree(); treeTab = 'barrier'; barrierTab = 'abilities'"); a.frame(); a.save("58-albero-abilita-bloccate.png"); }
  { // 1.14.2: menu con l’Epica separata, abilità con il cooldown effettivo (due righe), raggio d’azione al tocco, contrattacco del Modulo 10
    const m = game({ progress: { cleared: 50, clearedEpic: 3, seen: ALL_SEEN }, src }), em = m.w.__ev;
    m.save("61-menu-epica-standard.png"); em("menuMode = 'epic'"); m.frame(); m.save("62-menu-epica.png");
    em("openLevels()"); m.frame(); m.save("63-livelli-epica.png");
    const t = game({ progress: { cleared: 45, seen: ALL_SEEN, seals: 40, majors: 2, tree: { "ab:regen": 2, "ab:backup": 1, "ab:impen": 1, "ab:repulse": 3, "ab:freeze": 1, "ab:reflect": 1, "ab:burn": 1, "ab:mines": 5, "ab:power": 1, "barrier:hp": 5, "barrier:red": 2, "barrier:cd": 3 },
      gear: { pcs: {}, mods: {}, eq: { testa: { r: 4, m: [[15, 4]] } } } }, src });
    t.w.__ev("openTree(); treeTab = 'barrier'; barrierTab = 'abilities'"); t.frame(); t.save("64-albero-abilita-cooldown.png");
    t.w.__ev("barrierTab = 'nodes'"); t.frame(); t.save("65-albero-barriera.png");
    t.w.__ev("barrierTab = 'nodes'; treeTab = 'turrets'; treeSel = 'vortex'"); t.frame(); t.save("66-albero-vortex.png");
    const r = game({ progress: { cleared: 45, seen: ALL_SEEN }, src }), er = r.w.__ev;
    er("selLevel = 45; startRun('standard'); queue = []; enemies.length = 0; const v = makeShooter(TURRETS.vortex, SLOT_X[1], GROUND_Y - 14); v.up.len = 2; slots[1] = v; slots[0] = makeShooter(TURRETS.aero, SLOT_X[0], GROUND_Y - 14); slots[2] = makeShooter(TURRETS.sky, SLOT_X[2], GROUND_Y - 14); spawn({ enemy: 'shell', x: 300 }); Object.assign(enemies[0], { x: 300, y: 120, speed: 0, hp: 1e12, maxHp: 1e12 }); for (const s of slots) if (s) s.cd = 1e9;");
    r.frame(60);
    const tapAt = (x, y) => { const cv = r.w.document.getElementById("c"); for (const ty of ["pointerdown", "pointerup"]) { const e = new r.w.Event(ty, { bubbles: true, cancelable: true }); e.clientX = x; e.clientY = y; cv.dispatchEvent(e); } };
    tapAt(144, 570); r.frame(20); r.save("67-raggio-vortex.png");
    tapAt(72, 570); r.frame(20); r.save("68-raggio-aeroblast.png");
    tapAt(216, 570); r.frame(20); r.save("69-raggio-velo.png");
    er("pauseGame()"); tapAt(72, 566); r.frame(20); r.save("70-raggio-in-pausa.png");
    const c = game({ progress: { cleared: 42, seen: ALL_SEEN, gear: { pcs: {}, mods: {}, eq: { armatura: { r: 4, m: [[10, 4]] } } } }, src }), ec = c.w.__ev;
    ec("selLevel = 42; startRun('standard'); queue = []; enemies.length = 0; for (const [x, y] of [[90, 470], [180, 460], [270, 475]]) { spawn({ enemy: 'brute', x }); Object.assign(enemies[enemies.length - 1], { x, y, speed: 0, hp: 1e7, maxHp: 1e7 }); } for (const e of enemies) { domeHit(e); damage(e, 40, 'physical'); }");
    c.frame(8); c.save("71-contrattacco.png"); }
}
{ // 1.16.0: Protezione planetaria (DESIGN.md § 17, fase 1): menu dal 60, griglia dei continenti, battaglia con le ondate sovrapposte, fine partita
  const src = SRC.replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();");
  const prog = { cleared: 64, seen: ALL_SEEN, planet: { lv: { fire: 2, force: 0, electric: 1, energy: 0, physical: 0 }, frags: { alfa: 14, prometeo: 9, sigma: 4, ceo: 7 }, day: { d: "", n: 0 } } };
  const m = game({ progress: prog, src }), em = m.w.__ev;
  m.save("72-menu-planetaria.png");
  em("openPlanet()"); m.frame(); m.save("73-planetaria.png");
  em("startPlanet('fire')"); m.frame(); em("openPlanet(); runArm = null; startPlanet('fire')"); m.frame();
  em("toMenu(); openPlanet(); suspended = { mode: 'planet' }; runArm = 'planet:force'"); m.frame(); m.save("74-planetaria-sostituire.png");
  em("suspended = null; runArm = null; progress.planet.day = { d: '', n: 0 }; startPlanet('fire')");
  for (let i = 0; i < 900; i++) { em("domeHp = domeMax; if (state === 'upgrade') pick(0);"); m.frame(); }
  m.save("75-planetaria-battaglia.png");
  em("wave = 12; pw.mb = 2; domeHp = 0"); m.frame(2); m.save("76-planetaria-sconfitta.png");
}
{ // 1.17.0: ranger (DESIGN.md § 17, fase 2): schermata e supporti in campo
  const src = SRC.replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();");
  const frags = { alfa: 650, prometeo: 400, omega: 220, mnemosine: 0, sigma: 1100, ceo: 260, gamma: 300, iperione: 90, epsilon: 500, atlante: 200 };
  const prog = { cleared: 64, seen: ALL_SEEN, planet: { lv: {}, frags, day: { d: "", n: 0 }, eq: ["sigma", "prometeo"] } };
  const m = game({ progress: prog, src }), em = m.w.__ev;
  m.save("77-menu-ranger.png");
  em("openRangers('menu'); rangerSel = 'alfa'"); m.frame(); m.save("78-ranger.png");
  em("tapRanger('omega'); tapRanger('omega')"); m.frame(); m.save("79-ranger-messaggio.png");
  let n = 80;
  for (const [id, other] of [["alfa", "prometeo"], ["omega", "atlante"], ["sigma", "ceo"], ["gamma", "iperione"], ["epsilon", "mnemosine"]]) {
    const b = game({ progress: Object.assign({}, prog, { planet: { lv: {}, frags: { [id]: 1100, [other]: 1100 }, day: { d: "", n: 0 }, eq: [id, other] } }), src }), eb = b.w.__ev;
    eb("selLevel = 42; startRun('standard'); queue = []; enemies.length = 0; for (const x of [130, 180, 230]) { spawn({ enemy: 'brute', x }); Object.assign(enemies[enemies.length - 1], { y: 360, speed: 0, hp: 1e9, maxHp: 1e9 }); } RG.list[0].t = 0; player.cd = 1e9;");
    for (let i = 0; i < 12; i++) { eb("player.cd = 1e9; domeHp = domeMax"); b.frame(); }
    b.save((n++) + "-ranger-" + id + ".png");
  }
}
{ // 1.18.0: nemici della Protezione planetaria (DESIGN.md § 17, fase 3): le 4 taglie per tipo, invisibile, immune, guscio; classica e HD-2D
  const src = SRC.replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();");
  const SET = "selLevel = 42; startRun('standard'); queue = []; enemies.length = 0; let i = 0;" +
    " for (const t of TYPE_KEYS) { let j = 0; for (const v of ['l', 'm', 'p', 's']) { spawn({ enemy: t + '_' + v, x: 50 + j * 80 }); Object.assign(enemies[enemies.length - 1], { y: 130 + i * 80, speed: 0, hp: 1e9, maxHp: 1e9 }); j++; } i++; }" +
    " enemies[15].invis = true; enemies[7].immT = 1; shells.push({ x: 330, y: 450, r: 17, t: 3, max: 4 }); player.cd = 1e9;";
  for (const [name, settings] of [["85-nemici-planetari.png", null], ["86-nemici-planetari-hd2d.png", { graphics: "hd2d" }]]) {
    const g = game({ progress: { cleared: 64, seen: ALL_SEEN }, settings, src }); g.w.__ev(SET);
    for (let k = 0; k < 6; k++) { g.w.__ev("domeHp = domeMax; player.cd = 1e9"); g.frame(); } g.save(name);
  }
}
{ // 1.19.0: boss giganti della Protezione planetaria (DESIGN.md § 17, fase 4), classica e HD-2D, a metà schermo (bordo inferiore a 320)
  const src = SRC.replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();");
  let n = 87;
  for (const tt of ["fire", "force", "electric", "energy", "physical", "physical-diviso"]) for (const settings of [null, { graphics: "hd2d" }]) {
    const split = tt === "physical-diviso", t = split ? "physical" : tt;
    const g = game({ progress: { cleared: 64, seen: ALL_SEEN, planet: { lv: { [t]: 6 }, frags: {}, day: { d: "", n: 0 }, eq: [] } }, settings, src }), e = g.w.__ev;
    e(`openPlanet(); startPlanet("${t}"); queue = []; enemies = []; for (let k = 1; k < 18; k++) pw.clr[k] = true; planetWave(18); queue = queue.filter((q) => q.def); waveTime += 2.1`);
    e("update(0.01); const b = enemies.find((x) => x.final); b.y += 320 - bottomOf(b); b.speed = 0;" + (split ? " damage(b, b.hp * 0.55, 'fire');" : t === "physical" ? " b.y -= 60;" : "") + (t === "energy" ? " b.rcd = 0;" : "") + (t === "fire" ? " b.icd = 0; slots[0] = makeShooter(TURRETS.sky, SLOT_X[0], GROUND_Y - 14);" : ""));
    for (let k = 0; k < (t === "energy" ? 50 : 20); k++) { e("domeHp = domeMax; if (state === 'upgrade') pick(0); for (const x of enemies) if (x.final) x.speed = 0"); g.frame(); }
    g.save((n++) + "-boss-" + t + (split ? "-diviso" : "") + (settings ? "-hd2d" : "") + ".png");
  }
}
{ // 1.19.1: continenti a pixel e cubi dei ranger in HD-2D
  const PP = { cleared: 64, seen: ALL_SEEN, planet: { lv: { fire: 2, force: 0, electric: 1, energy: 0, physical: 0 }, frags: { alfa: 650, sigma: 1100 }, day: { d: "", n: 0 }, eq: ["sigma"] } };
  const src = SRC.replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();");
  const g = game({ progress: PP, settings: { graphics: "hd2d" }, src }); g.w.__ev("openPlanet()"); g.frame(); g.save("99-planetaria-hd2d.png");
  g.w.__ev("openRangers('planet')"); g.frame(); g.save("100-ranger-hd2d.png");
}
{ // 1.20.0: campagna dal 70 con i nemici nuovi: battaglia e scheda Nemici della pausa (scorre)
  const src = SRC.replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();");
  const g = game({ progress: { cleared: 90, seen: ALL_SEEN }, src }); const e = g.w.__ev;
  e("setSel('standard', 70); startRun('standard'); startWave(9); domeHp = 1e6;");
  for (let k = 0; k < 400; k++) { e("domeHp = 1e6; alerts.length = 0; if (state === 'upgrade') pick(0)"); g.frame(); }
  g.save("101-campagna-70.png");
  e("for (const k of Object.keys(ENEMY_DEFS)) progress.seen.push(seenKey(ENEMY_DEFS[k])); pauseGame(); pauseTab = 'enemies'"); g.frame(); g.save("102-campagna-70-pausa.png");
}
{ // 1.21.0: pacco regalo (DESIGN.md § 17): in campo col mirino agganciato e un nemico in mezzo, avviso “Nuovo nemico”, premio, scheda Nemici; classica e HD-2D
  const src = SRC.replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();");
  const SET = "setSel('standard', 61); startRun('standard'); queue = []; enemies = []; giftPlan = { wave: 4, done: false }; startWave(4); queue = [{ t: 999, enemy: 'drone', x: 10 }]; waveTime = 0.5;" +
    " spawnGift(); giftWait = -1; gift.x = gift.tx = 130; gift.y = gift.ty = 380; gift.phase = 'float'; gift.t = 5; GIFT.speed = 0;" +
    " for (const [k, x, y] of [['brute', 150, 470], ['drone', 260, 250], ['wisp', 70, 200]]) { spawn({ enemy: k, x }); Object.assign(enemies[enemies.length - 1], { y, speed: 0, hp: 1e9, maxHp: 1e9 }); }" +
    " player.x = player.targetX = 160; pressing = true; press.x = 136; press.y = 386;";
  let n = 103;
  for (const settings of [null, { graphics: "hd2d" }]) {
    const hd = settings ? "-hd2d" : "";
    const g = game({ progress: { cleared: 90, seen: ALL_SEEN }, settings, src }), e = g.w.__ev;
    e(SET); for (let k = 0; k < 30; k++) { e("domeHp = domeMax; pressing = true; if (gift) gift.hp = Math.max(gift.hp, gift.maxHp * 0.5)"); g.frame(); }
    g.save((n++) + "-pacco-regalo" + hd + ".png");
    e("pressing = false; enemies[0].dead = true; floaters.length = 0; giftHit(gift.hp + 1); alerts = []"); for (let k = 0; k < 3; k++) g.frame(); g.save((n++) + "-pacco-premio" + hd + ".png");
  }
  const g = game({ progress: { cleared: 90, seen: ALL_SEEN }, src }), e = g.w.__ev;
  e(SET + " gift.y = -2; gift.phase = 'in'; pressing = false;"); for (let k = 0; k < 8; k++) { e("domeHp = domeMax"); g.frame(); } g.save((n++) + "-pacco-avviso.png");
  e("pauseGame(); pauseTab = 'enemies'"); g.frame(); g.save((n++) + "-pacco-pausa.png");
}
{ // 1.22.0: Carta iniziale (riga nell’albero con 11 nodi, finestra di scelta) e Carta extra (riga della barriera, scelta extra dopo l’ondata)
  const src = SRC.replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();");
  const g = game({ progress: { cleared: 90, seen: ALL_SEEN, seals: 40, majors: 12 }, src }), e = g.w.__ev;
  e("for (const w of ['player', 'sky', 'barrier']) for (const n of TREE[w]) progress.tree[n.id] = 1; progress.tree['barrier:extra'] = 2; progress.startCards = { sky: 'burn1' }; state = 'tree'; treeTab = 'turrets'; treeSel = 'sky';");
  g.frame(); g.save("109-albero-carta-iniziale.png");
  e("treePick = 'sky'"); g.frame(); g.save("110-carta-iniziale-scelta.png");
  e("treePick = null; treeTab = 'player'"); g.frame(); g.save("111-albero-guardiano-11-nodi.png");
  e("treeTab = 'barrier'; barrierTab = 'nodes'"); g.frame(); g.save("112-albero-carta-extra.png");
  e("closeTree(); setSel('standard', 12); startRun('standard'); extraWaves = [1]; queue = []; enemies = []; waveTime = 1; update(0.02); pick(0); cardsAt = -9;"); g.frame(); g.save("113-carta-extra.png");
}
