// Genera il catalogo grafico: docs/catalogo-grafico.html (uso: npm run catalog; parte da solo prima di npm test).
// Pagina unica e autosufficiente: incorpora app/draw.js, lo script del gioco, CSS e markup di #splash e #savePanel e le icone (data URI).
// Ogni schermata è il gioco vero in un iframe (srcdoc) con orologio controllato; le tessere piccole (torrette, nemici, stati, effetti)
// le disegna un iframe "atelier" con le funzioni di draw.js. Riscrive il file solo se l’hash dei file è cambiato (--force per rifarlo comunque).
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const ROOT = path.join(__dirname, "..", ".."), APP = path.join(ROOT, "app");
// --hd2d: catalogo della grafica HD-2D (1.13.0): stesse scene e tessere, con app/draw-hd2d.js innestato su app/draw.js
// (window.FORTRESS_GFX = "hd2d"); npm run catalog-hd2d → docs/catalogo-grafico-alternativo.html
const ALT = process.argv.includes("--hd2d");
const DRAW_FILE = ALT ? "app/draw-hd2d.js" : "app/draw.js";
const OUT = path.join(ROOT, "docs", ALT ? "catalogo-grafico-alternativo.html" : "catalogo-grafico.html");
const OUT_REL = "docs/" + path.basename(OUT), TITLE = ALT ? "catalogo grafico · grafica HD-2D" : "catalogo grafico · grafica classica";
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

/* ---------- hash: tutti i file di app/ e questo generatore ---------- */
function hashedFiles() {
  return [...fs.readdirSync(APP).filter((f) => !f.startsWith(".")).sort().map((f) => "app/" + f), "tests/tools/catalog.js"];
}
function computeHash() {
  const all = crypto.createHash("sha256"), each = {};
  for (const rel of hashedFiles()) {
    const buf = fs.readFileSync(path.join(ROOT, rel));
    each[rel] = crypto.createHash("sha256").update(buf).digest("hex").slice(0, 12);
    all.update(rel + "\n").update(buf).update("\n");
  }
  return { hash: all.digest("hex"), each };
}
const writtenHash = (html) => ((html || "").match(/<meta name="catalogo-hash" content="([0-9a-f]+)">/) || [])[1] || null;

/* ---------- pezzi del gioco ---------- */
function parts() {
  const html = read("app/index.html");
  const css = html.match(/<style>([\s\S]*?)<\/style>/)[1];
  const a = html.indexOf('<div id="splash"'), b = html.indexOf("<script>", a);
  if (a < 0 || b < 0) throw new Error("index.html: non trovo #splash o lo script del gioco");
  const icon = (f) => "data:image/png;base64," + fs.readFileSync(path.join(APP, f)).toString("base64");
  const markup = html.slice(a, b).replace('src="icon-512.png"', () => 'src="' + icon("icon-512.png") + '"');
  const HOOK = "requestAnimationFrame(frame);\n})();";
  let game = html.slice(b + 8, html.indexOf("</script>", b));
  if (!game.includes(HOOK)) throw new Error("index.html: manca la fine dello script del gioco (" + JSON.stringify(HOOK) + ")");
  game = game.replace(HOOK, "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);   // aggancio del catalogo: esegue codice nell’ambito del gioco\n})();");
  // gfx e drawHd stanno in P (non in ALT) perché buildDoc gira anche nel browser, dove ALT non esiste
  const draw = read("app/draw.js"), drawHd = ALT ? read("app/draw-hd2d.js") : "", gfx = ALT ? "hd2d" : "";
  for (const [n, t] of Object.entries({ css, markup, draw, drawHd, game })) if (/<\/script|<!--/i.test(t)) throw new Error(n + ": contiene </script o <!-- e non si può incorporare");
  const icons = Object.fromEntries(["icon-180.png", "icon-192.png", "icon-512.png", "icon-maskable-512.png"].map((f) => [f, icon(f)]));
  const version = (html.match(/const APP_VERSION = "([^"]+)"/) || [])[1];
  return { css, markup, draw, drawHd, gfx, game, icons, version, html };
}

/* ---------- dentro ogni iframe (e in jsdom): orologio, casuale fisso, storage finto ---------- */
function harness() {
  const cfg = window.__CFG || {};
  const mem = (init) => { const m = new Map(Object.entries(init)); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: (k) => { m.delete(k); }, clear: () => m.clear(), key: (i) => [...m.keys()][i] || null, get length() { return m.size; } }; };
  const store = { "fortress-progress-v1": JSON.stringify(cfg.progress || { cleared: 23, seen: [] }) };
  if (cfg.settings) store["fortress-proto-v1"] = JSON.stringify(cfg.settings);
  try { Object.defineProperty(window, "localStorage", { configurable: true, value: mem(store) }); } catch (e) {}
  try { Object.defineProperty(window, "sessionStorage", { configurable: true, value: mem({}) }); } catch (e) {}
  try { Object.defineProperty(document, "hidden", { configurable: true, get: () => false }); } catch (e) {}   // la pausa automatica non scatta
  let seed = cfg.seed || 7; Math.random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  let cb = null, t = 0, each = null; const fns = {};
  window.requestAnimationFrame = (f) => { cb = f; return 1; };
  const cat = window.__cat = { frames: 0, errors: [],
    step(n) {                                     // n fotogrammi da 1/60 s
      for (let i = 0; i < (n || 1); i++) {
        const f = cb; cb = null; if (!f) return; t += 1000 / 60;
        try { f(t); if (each) each(); } catch (e) { cat.errors.push(String((e && e.message) || e)); return; }
        cat.frames++;
      }
    },
    boot() {
      const sp = document.getElementById("splash");
      if (cfg.splash) { sp.hidden = false; document.getElementById("splashMsg").textContent = cfg.splash.msg || ""; sp.classList.toggle("ready", !!cfg.splash.ready); }
      else sp.hidden = true;
      try {
        cat.step(2);
        if (cfg.setup) window.__ev(cfg.setup);
        if (cfg.each) each = window.__ev("() => {" + cfg.each + "}");
        cat.step(cfg.frames || 0);
      } catch (e) { cat.errors.push(String((e && e.message) || e)); }
    },
    // tessera: disegna con il codice del gioco in un riquadro box = [x0, y0, w, h] (px logici), k pixel per px logico
    tile(key, code, T, box, k) {
      const f = fns[key] || (fns[key] = window.__ev("(T) => {" + code + "}"));
      const c = document.getElementById("c"), x = c.getContext("2d");
      x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, Math.ceil(box[2] * k) + 2, Math.ceil(box[3] * k) + 2);
      x.setTransform(k, 0, 0, k, -box[0] * k, -box[1] * k);
      try { f(T); } finally { x.restore(); }
      return c;
    } };
  window.addEventListener("error", (e) => cat.errors.push(e.message));
}
// documento di una scena: lo stesso in jsdom (verifica) e nel browser (catalogo)
function buildDoc(P, cfg) {
  return "<!DOCTYPE html><html lang=\"it\"><head><meta charset=\"utf-8\"><style>" + P.css + "\nhtml, body { overflow: hidden; }</style></head><body>\n" +
    "<canvas id=\"c\" aria-label=\"Campo di battaglia\"></canvas>\n" + P.markup +
    "<script>window.__CFG = " + JSON.stringify(cfg).replace(/</g, "\\u003c") + ";(" + harness + ")();<\/script>\n" +
    (P.gfx ? "<script>window.FORTRESS_GFX = " + JSON.stringify(P.gfx) + ";<\/script>\n" : "") + (P.drawHd ? "<script>" + P.drawHd + "<\/script>\n" : "") + "<script>" + P.draw + "<\/script>\n<script>" + P.game + "<\/script>\n<script>__cat.boot();<\/script></body></html>";
}

/* ---------- scene (codice eseguito nell’ambito del gioco) ---------- */
const ALL_SEEN = ["saucer", "shard", "meteor", "rock", "asteroid", "ship:fire", "ship:energy", "ship:electric", "ship:force", "ship:physical",
  "mothership:fire", "mothership:energy", "mothership:electric", "mothership:force", "mothership:physical"];
const START = (lv) => `selLevel = ${lv}; startRun("standard");`;
const CLEAR = "queue = []; enemies.length = 0; ents.length = 0; floaters.length = 0; waveTime = 0;";
const TOWERS = (list) => `(${JSON.stringify(list)}).forEach((t, i) => { if (!t) return; const [id, lv, up, x] = t, s = makeShooter(TURRETS[id], x || SLOT_X[i], GROUND_Y - 14); s.level = lv; Object.assign(s.up, up || {}); s.cd = 0.3; slots[i] = s; });`;
const FOE = (enemy, x, y, extra) => `spawn({ enemy: "${enemy}", x: ${x} }); Object.assign(enemies[enemies.length - 1], { x: ${x}, y: ${y}, speed: 0, hp: 1e7, maxHp: 1e7 }, ${JSON.stringify(extra || {})});`;
const KEEP = "domeHp = domeMax;";
const REPEAT = KEEP + " if (waveTime > 1.5) { enemies.length = 0; ents.length = 0; floaters.length = 0; startWave(wave); }";   // l’annuncio si ripete
const GO_ON = KEEP + " if (state === 'upgrade') pick(0);";   // battaglie vere: a fine ondata si sceglie la prima carta e si continua
const KINDS = ["drone", "wisp", "brute", "spitter", "shell"];
const crowd = (n, y0) => Array.from({ length: n }, (_, i) => FOE(KINDS[i % 5], 30 + (i * 67) % 300, y0 + Math.floor(i / 5) * 62 + (i % 3) * 12, { hp: 1e7 * (0.45 + 0.15 * (i % 4)) })).join(" ");
const P1 = { cleared: 23, seen: ALL_SEEN };
// progressi con Sigilli e nodi dell’albero (DESIGN.md § 16)
const PS = { cleared: 36, seen: ALL_SEEN, seals: 7, claims: ["s31", "s32", "s33", "s34", "s35", "s36", "s31p", "s33p"], loadout: ["sky"],
  tree: { "sky:burn1": 1, "sky:burn2": 1, "sky:burn3": 1, "sky:splitB": 1, "sky:again": 1, "sky:perm": 1, "laser:sweep1": 1, "player:boom1": 1, "player:punch": 1, "sky:std:dmg": 3, "sky:std:msl": 1, "laser:std:dmg": 2, "types:dmg:fire": 2, "types:all": 1, "barrier:hp": 2, "barrier:red": 1, "barrier:flat": 1, "player:std:dmg": 2, "player:fan": 1 } };
// effetti di ogni torretta: potenziamenti accesi per far vedere più disegni (le torrette nuove usano il caso base)
const FX_UPS = {
  sky: { split1: 1, burn1: 1, fire: 1 }, laser: { multi1: 1, sweep1: 1 }, disr: { dst1: 1, blast: 1 }, aero: { salvo1: 1, mine1: 1 },
  thunder: { fork1: 1, orb: 1, sph: 1 }, beam: { fork1: 1, forkX: 1 }, wheel: { mini1: 1, trail1: 1 }, hive: { wave1: 1, drone: 1 },
  rail: { split1: 1, boom1: 1 }, tesla: { orb: 1, chain: 1 }, vortex: { wh1: 1 },
};
const FX_FOES = [["drone", 110, 260], ["brute", 250, 250], ["spitter", 180, 330], ["shell", 80, 380], ["wisp", 290, 390], ["brute", 180, 430]];
function scenes(turretIds) {
  const S = [];
  const add = (sec, id, title, desc, cfg, fns) => S.push({ sec, id, title, desc, cfg, fns: fns || [] });
  // § 1 schermate del canvas
  add(1, "menu", "Menu", "Livello, Standard/Epica, sblocchi, salvataggio, versione.", { progress: P1 }, ["menuScreen", "button", "txt"]);
  add(1, "battaglia", "Battaglia", "Livello 20, quattro torrette potenziate, ondate vere.",
    { progress: P1, setup: START(20) + TOWERS([["sky", 2, { split1: 1, fire: 1 }], ["laser", 2, { multi1: 1 }], ["hive", 2, { wave1: 1 }], ["rail", 2, { split1: 1 }]]) +
      " Object.assign(player.up, { dmg: 1, frenzy1: 1, fan: 1 });", each: GO_ON, frames: 330 }, ["draw", "drawHud", "drawTurret", "drawEnemy", "FX"]);
  add(1, "annuncio", "Annuncio dell’ondata", "Scritta “ONDATA n” che svanisce in 1,2 s.", { progress: P1, setup: START(23), each: REPEAT, frames: 8 }, ["draw"]);
  add(1, "annuncio-boss", "Annuncio con mini-boss", "All’ondata 5, 10, 15 (dal livello 11) compare “Mini-boss in arrivo”.",
    { progress: P1, setup: START(23) + " startWave(5);", each: REPEAT, frames: 8 }, ["draw"]);
  add(1, "avviso", "Avviso “Nuovo nemico”", "Al primo incontro: nome, tipo di danno, debolezze e resistenze.",
    { progress: { cleared: 0, seen: [] }, setup: START(1) + " for (let i = 0; i < 2000 && !alerts.length; i++) __cat.step(1); __cat.step(20);", check: "alerts.length > 0", each: GO_ON }, ["drawAlert", "enemyIcon"]);
  add(1, "tiro-verticale", "Tiro premendo, mirino", "Tenendo premuto il guardiano segue il dito: mirino nel punto premuto (giallo se aggancia un nemico entro 45 px, che diventa il bersaglio), altrimenti colpi dritti in alto.",
    { progress: P1, setup: START(14) + " __cat.step(330); pressing = true; player.targetX = 110; press.x = 110; press.y = 170;", each: GO_ON + " pressing = true; player.targetX = 110;", frames: 40 }, ["drawPlayer", "drawCrosshair"]);
  add(1, "sblocco", "Avviso di sblocco", "A fine livello (primo completamento in Standard dei livelli 10, 20, 30, 31, 40, 50), sopra la vittoria; si chiude solo con “Ho capito”.",
    { progress: { cleared: 39, seen: [] }, setup: START(40) + " __cat.step(60); winLevel();", frames: 1 }, ["unlockScreen"]);
  add(1, "cupola", "Cupola danneggiata", "Sotto il 35% bordo e barra diventano rossi.",
    { progress: P1, setup: START(20), each: "domeHp = 25; if (state === 'upgrade') pick(0);", frames: 240 }, ["drawDomeFill", "drawDomeEdge", "drawFortress"]);
  add(1, "pausa-nemici", "Pausa · Nemici del livello", "Nemici del livello con resistenze, debolezze e ondate.",
    { progress: P1, setup: START(20) + " __cat.step(60); pauseGame(); pauseTab = 'enemies';", frames: 1 }, ["pauseScreen", "pauseEnemies", "enemyIcon"]);
  add(1, "pausa-torri", "Pausa · Torri e potenziamenti", "Torri, livello, scelte fatte.",
    { progress: P1, setup: START(20) + TOWERS([["sky", 2, { dmg: 2, split1: 1, fire: 1 }], ["hive", 3, { hits: 1, wave1: 1, drone: 1, evo1: 1 }]]) +
      " Object.assign(player.up, { dmg: 1, frenzy1: 1, fan: 1 }); __cat.step(60); pauseGame(); pauseTab = 'build';", frames: 1 }, ["pauseScreen", "pauseBuild"]);
  add(1, "pausa-sconosciuti", "Pausa · Nemici sconosciuti", "Chi non è ancora stato incontrato resta un “?”.",
    { progress: { cleared: 12, seen: ["saucer", "rock"] }, setup: START(13) + " __cat.step(2); pauseGame();", frames: 1 }, ["unknownRow"]);
  add(1, "pausa-abbandona", "Pausa · Abbandona", "Primo tocco su “Abbandona”: chiede conferma.",
    { progress: P1, setup: START(20) + " __cat.step(30); pauseGame(); pauseQuit = true;", frames: 1 }, ["pauseScreen"]);
  add(1, "vittoria", "Vittoria", "Livello superato.", { progress: P1, setup: START(23) + " __cat.step(200); state = 'won';", frames: 1 }, ["wonScreen", "overlay"]);
  add(1, "sconfitta", "Sconfitta", "Cupola distrutta.", { progress: P1, setup: START(23) + " __cat.step(200); domeHp = 0; state = 'lost';", frames: 1 }, ["lostScreen", "overlay"]);
  add(1, "vittoria-sigilli", "Vittoria con Sigilli", "Dal livello 31: Sigilli ottenuti e suggerimento per il premio della cupola al 100%.",
    { progress: PS, setup: "selLevel = 37; startRun('standard'); __cat.step(200); winLevel();", frames: 1 }, ["wonScreen", "sealLines"]);
  add(1, "menu-sigilli", "Menu con l’albero aperto", "Pulsante “Albero dei Sigilli” con i Sigilli da spendere (dal livello 31).", { progress: PS }, ["menuScreen"]);
  add(1, "albero-torrette", "Albero dei Sigilli · Torrette", "Griglia delle 11 torrette (nodi comprati, “in campo”) e nodi della torretta scelta.",
    { progress: PS, setup: "openTree();", frames: 1 }, ["treeScreen", "treeNodeRow"]);
  add(1, "albero-acquisto", "Albero dei Sigilli · acquisto", "Primo tocco su un nodo: chiede il secondo tocco per spendere i Sigilli.",
    { progress: PS, setup: "openTree(); treeSel = 'laser'; tapNode(TREE.laser[1]);", frames: 1 }, ["treeScreen", "treeNodeRow"]);
  add(1, "albero-guardiano", "Albero dei Sigilli · Guardiano", "Le 6 carte bloccate del guardiano e i 3 nodi delle sue carte.", { progress: PS, setup: "openTree(); treeTab = 'player';", frames: 1 }, ["treeScreen"]);
  add(1, "albero-barriera", "Albero dei Sigilli · Barriera", "Spina Vita % → Riduzione danno e rami (nodi a livelli); abilità nella fase 3.", { progress: PS, setup: "openTree(); treeTab = 'barrier';", frames: 1 }, ["treeScreen", "treeNodeRow"]);
  add(1, "albero-abilita", "Albero dei Sigilli · Abilità", "Tre gruppi (Resistere, Controllo, Offesa): pallino per equipaggiare una abilità per gruppo, righe per i livelli.",
    { progress: Object.assign({}, PS, { cleared: 45 }), setup: "openTree(); treeTab = 'barrier'; barrierTab = 'abilities';", frames: 1 }, ["treeScreen", "treeAbilities", "treeNodeRow"]);
  add(1, "abilita-battaglia", "Abilità della barriera in battaglia", "Gas della Congelante, mine della Minata, bordo della Riflettente, onda della Repulsiva, immunità accumulate.",
    { progress: { cleared: 45, seen: ALL_SEEN, tree: { "ab:freeze": 2, "ab:reflect": 1, "ab:mines": 1 } },
      setup: START(45) + " queue = []; enemies.length = 0; " + [[60, 470], [110, 440], [250, 450], [300, 480], [180, 400], [140, 330]].map(([x, y]) => FOE("shell", x, y, {})).join(" ") +
        " fireAbility({ id: 'freeze', v: abVal('freeze', 3) }); fireAbility({ id: 'mines', v: abVal('mines', 3) }); fireAbility({ id: 'reflect', v: abVal('reflect', 1) }); domeShield = 3; __cat.step(40); fireAbility({ id: 'repulse', v: abVal('repulse', 3) });",
      each: "if (Math.random() < 0.01) fireAbility({ id: 'repulse', v: abVal('repulse', 3) });", frames: 12 }, ["FX.domeGas", "FX.domeWave", "FX.domeAura", "FX.shieldCount", "FX.aeroMine"]);
  // 1.14.2: raggio d’azione al tocco (arco e velo oltre i 500 px), numeri del contrattacco (Modulo 10), menu con l’Epica separata
  const RANGE = (i) => ` rangeShow = { i: ${i}, t0: rtime - 500 };`, RANGE_EACH = "if (rangeShow) rangeShow.t0 = rtime - 500;";
  add(1, "raggio-tocco", "Raggio d’azione al tocco", "Tocco rapido su una torretta: arco rosso per 2 s, trasparente alla base. Gravity Vortex Gun con 2 pile di “Percorso più lungo”: raggio di partenza 354 px.",
    { progress: P1, setup: START(23) + " " + CLEAR + " " + TOWERS([null, ["vortex", 2, { len: 2 }]]) + RANGE(1), each: RANGE_EACH, frames: 2 }, ["drawRange"]);
  add(1, "raggio-tocco-aero", "Raggio d’azione · Aeroblast", "Portata 260 px: arco intero dentro lo schermo.",
    { progress: P1, setup: START(23) + " " + CLEAR + " " + TOWERS([["aero", 1, {}]]) + RANGE(0), each: RANGE_EACH, frames: 2 }, ["drawRange"]);
  add(1, "raggio-velo", "Raggio d’azione · oltre lo schermo", "Portata oltre 500 px (Sky Guard, Thunderbolt, Laser): niente arco, velo rosso più visibile in alto.",
    { progress: P1, setup: START(23) + " " + CLEAR + " " + TOWERS([null, null, ["sky", 1, {}]]) + RANGE(2), each: RANGE_EACH, frames: 2 }, ["drawRange"]);
  add(1, "contrattacco", "Contrattacco del Modulo 10", "I primi colpi nemici alla barriera ricevono il contrattacco: numeri ciano, più grandi e più lunghi.",
    { progress: Object.assign({}, P1, { cleared: 42, gear: { pcs: {}, mods: {}, eq: { armatura: { r: 4, m: [[10, 4]] } } } }), setup: START(42) + " " + CLEAR + " " +
      [[90, 480], [180, 470], [270, 485]].map(([x, y]) => FOE("brute", x, y, {})).join(" ") + " for (const e of enemies) { domeHit(e); damage(e, 40, 'physical'); }", frames: 6 }, ["drawFloater", "popup"]);
  add(1, "menu-epica", "Menu con l’Epica", "Dal 50: selettore della modalità attiva (striscia “Standard ⇄ Epica”), Epica con numerazione propria (livello 1 = difficoltà 31).",
    { progress: { cleared: 50, clearedEpic: 3, seen: ALL_SEEN }, setup: "menuMode = 'epic';", frames: 1 }, ["menuScreen"]);
  add(1, "albero-tipi", "Albero dei Sigilli · Tipi", "Sezione condivisa delle torrette: danno per tipo, di tutte le torrette, durata degli stati.", { progress: PS, setup: "openTree(); treeSel = 'types';", frames: 1 }, ["treeScreen", "treeNodeRow"]);
  // equipaggiamento (DESIGN.md § 15)
  const PG = Object.assign({}, PS, { cleared: 42, gear: { pcs: { "arma:0": 6, "arma:1": 2, "arma:3": 1, "guanti:2": 1 }, mods: { "arma:0:1": 3, "arma:0:2": 1, "arma:0:23": 2, "arma:4:19": 1 },
    eq: { arma: { r: 4, m: [[2, 4], [4, 3], [1, 2]] }, testa: { r: 2, m: [[22, 1]] }, armatura: { r: 3, m: [[10, 4], [11, 2]] }, stivali: { r: 0, m: [] }, nucleo: { r: 1, m: [[30, 0]] } } } });
  add(1, "menu-equipaggiamento", "Menu con l’equipaggiamento", "Dal livello 30: pulsante “Equipaggiamento” accanto all’albero.", { progress: PG }, ["menuScreen"]);
  add(1, "equipaggiamento-pezzi", "Equipaggiamento · pezzi", "I 6 pezzi con rarità (colore, ancestrale iridescente) e Moduli installati; slot del pezzo scelto; inventario dei pezzi.",
    { progress: PG, setup: "openGear();", each: "", frames: 60 }, ["gearScreen", "rarColor", "gearHeader", "pieceIcon", "modIcon"]);
  add(1, "equipaggiamento-moduli", "Equipaggiamento · fusione dei Moduli", "Moduli del pezzo per rarità; in modalità “Fondi” si scelgono 5 Moduli, anche diversi.",
    { progress: PG, setup: "openGear(); gearSetTab('mods'); gearSetMode('fuse'); tapMod(1); tapMod(1); tapMod(23);", frames: 1 }, ["gearScreen"]);
  add(1, "vittoria-oggetti", "Vittoria con l’equipaggiamento", "Dal livello 30: pezzi e Moduli presi, con il colore della rarità.",
    { progress: PG, setup: "selLevel = 42; startRun('standard'); __cat.step(100); winLevel();", frames: 1 }, ["wonScreen", "gearChips", "pieceIcon", "modIcon"]);
  add(1, "carte-4", "Quattro carte e rinnovo", "Moduli 22 (4 carte tra cui scegliere) e 21 (rinnovo delle carte).",
    { progress: Object.assign({}, PG, { gear: { pcs: {}, mods: {}, eq: { testa: { r: 1, m: [[22, 4], [21, 4]] } } } }), setup: START(42) + " queue = []; enemies.length = 0; wave = 1; endWave();", frames: 1 }, ["upgradeScreen"]);
  // 1.12.3: griglia dei livelli, guida, potenziamenti presi dalla scelta delle carte
  const PL = Object.assign({}, PS, { cleared: 57, majors: 0, claims: ["s31", "s31p", "s32", "s33", "s33p", "s40", "s50", "e1"] });
  add(1, "livelli", "Griglia dei livelli", "Dal menu (tocco su “Livello”): Standard/Epica, pagine da 50, Sigilli presi (◆) e da prendere (◇), filtro, muri in giallo.",
    { progress: PL, setup: "openLevels(); lvSel = 45;", frames: 1 }, ["levelsScreen", "sealGem"]);
  add(1, "guida-stati", "Guida · stati dei nemici", "Legenda delle icone di stato e degli altri effetti.", { progress: PL, setup: "openGuide();", frames: 1 }, ["guideScreen", "guideStatus"]);
  add(1, "guida-carte", "Guida · carte", "Tutte le carte di una torretta o del guardiano, con categoria, blocco dell’albero ed effetto per pila; l’elenco scorre col dito.",
    { progress: PL, setup: "openGuide(); guideTab = 'cards'; guideSel = 'sky';", frames: 1 }, ["guideScreen", "guideCards", "guideCardLines"]);
  add(1, "potenziamenti-presi", "Potenziamenti presi (dalla scelta delle carte)", "Pulsante sotto le carte: la stessa vista della pausa, poi “Torna alle carte”.",
    { progress: PL, setup: START(12) + " queue = []; enemies.length = 0; wave = 3; endWave(); upBuild = true;", frames: 1 }, ["upBuildScreen", "pauseBuild"]);
  // 1.16.0: Protezione planetaria (DESIGN.md § 17, fase 1)
  const PP = Object.assign({}, PL, { cleared: 64, planet: { lv: { fire: 2, force: 0, electric: 1, energy: 0, physical: 0 }, frags: { alfa: 14, prometeo: 9, sigma: 4, ceo: 7 }, day: { d: "", n: 0 } } });
  add(1, "menu-planetaria", "Menu dal livello 60", "Pulsante “Protezione planetaria” con il tipo del giorno e le partite rimaste, al posto dell’elenco degli sblocchi.", { progress: PP }, ["menuScreen"]);
  add(1, "planetaria", "Protezione planetaria · continenti", "Griglia 2 + 2 + 1: icona del continente, livello e tipo dei nemici, frammenti dei ranger, badge ×2 sul tipo del giorno.",
    { progress: PP, setup: "openPlanet();", frames: 1 }, ["planetScreen", "landIcon"]);
  add(1, "planetaria-battaglia", "Protezione planetaria · battaglia", "Ondate sovrapposte: livello e continente, tempo della prossima ondata; nemici solo del tipo del continente.",
    { progress: PP, setup: "openPlanet(); startPlanet('fire');", each: KEEP + " if (state === 'upgrade') pick(0);", frames: 900 }, ["drawHud", "planetWave"]);
  add(1, "planetaria-fine", "Protezione planetaria · fine partita", "Frammenti presi (anche perdendo), divisi tra i due ranger del tipo; ritorno ai continenti.",
    { progress: PP, setup: "openPlanet(); startPlanet('electric'); __cat.step(60); wave = 12; pw.mb = 2; domeHp = 0; __cat.step(1);", frames: 1 }, ["planetEndScreen", "planetLines"]);
  // 1.17.0: ranger (DESIGN.md § 17, fase 2)
  const RF = { alfa: 650, prometeo: 400, omega: 220, mnemosine: 0, sigma: 1100, ceo: 260, gamma: 300, iperione: 90, epsilon: 500, atlante: 200 };
  const PR = Object.assign({}, PP, { planet: Object.assign({}, PP.planet, { frags: RF, eq: ["sigma", "prometeo"] }) });
  add(1, "ranger", "Ranger", "Dieci ranger (sfere = conversione, cubi con la lettera = supporto): livello, frammenti verso il prossimo, “in campo”; sotto l’effetto del ranger scelto.",
    { progress: PR, setup: "openRangers('planet'); rangerSel = 'alfa';", frames: 1 }, ["rangersScreen", "rangerDesc"]);
  for (const [id, other] of [["alfa", "prometeo"], ["omega", "atlante"], ["sigma", "ceo"], ["gamma", "iperione"], ["epsilon", "mnemosine"]])
    add(1, "ranger-" + id, "Ranger in campo · " + id[0].toUpperCase() + id.slice(1), "Ai lati del guardiano; l’effetto del supporto contro tre asteroidi fermi.",
      { progress: Object.assign({}, PR, { planet: Object.assign({}, PR.planet, { frags: { [id]: 1100, [other]: 1100 }, eq: [id, other] }) }),
        setup: START(42) + " queue = []; enemies.length = 0; for (const x of [130, 180, 230]) { spawn({ enemy: 'brute', x }); Object.assign(enemies[enemies.length - 1], { y: 360, speed: 0, hp: 1e9, maxHp: 1e9 }); } RG.list[0].t = 0; player.cd = 1e9;",
        each: KEEP + " player.cd = 1e9; for (const e of enemies) e.hp = 1e9;", frames: 20 }, ["FX.ranger", "SUPPORT." + id]);
  // 1.19.0: boss giganti della Protezione planetaria (DESIGN.md § 17, fase 4), a metà schermo con la loro abilità
  // 1.19.1: Nave madre e Disco volante ridisegnati, anello del Prisma, meteorite intero (scia d’ingresso, tremolio) e poi diviso
  for (const [t, extra, id] of [["fire", " b.icd = 0; slots[0] = makeShooter(TURRETS.sky, SLOT_X[0], GROUND_Y - 14);"], ["force", ""], ["electric", ""], ["energy", " b.rcd = 0;"], ["physical", " b.y -= 60;"],
    ["physical", " damage(b, b.hp * 0.55, 'fire', true);", "boss-physical-diviso"]])
    add(1, id || "boss-" + t, "Boss gigante · " + { fire: "Ammiraglia", force: "Nave madre", electric: "Disco volante", energy: "Prisma gigante", physical: "Meteorite" }[t] + (id ? " (diviso)" : ""),
      id ? "A metà vita si divide in due pezzi con la vita rimasta (anche i pezzi entrano nell’atmosfera)." :
      { fire: "Incrociatore d’acciaio (1.23.2): ali a freccia con strisce del tipo, sovrastruttura e ponte di comando con radar, tre motori, torrette binate che seguono il guardiano, luci di navigazione, baie dei missili; lancia intercettori: ognuno prenota un colpo delle torrette in volo e mira dove sarà.", force: "Scafo d’acciaio con strisce del tipo; motori, torrette che seguono il guardiano, radar, luci della pista; dal 75% di altezza escono le ali con i caccia agganciati, che rilascia come alati.",
        electric: "Lente d’acciaio scuro: fascia con le luci che scorrono (davanti e dietro), cupola di vetro scuro, bagliore e antenna sotto, scariche sul bordo; a volte assorbe il danno (lampi).",
        energy: "Anello di energia che gira poco sopra il nucleo; raggio verticale di 160 px; non scende sotto il 25%.", physical: "Intero, a tutta larghezza: scia di fuoco d’ingresso nell’atmosfera, bordo davanti arroventato, leggero tremolio." }[t],
      { progress: Object.assign({}, PP, { planet: Object.assign({}, PP.planet, { lv: { [t]: 6 } }) }),
        setup: "openPlanet(); startPlanet('" + t + "'); queue = []; enemies = []; for (let k = 1; k < 20; k++) pw.clr[k] = true; planetWave(18); queue = queue.filter((q) => q.def); wave = 20; pw.next = Infinity; pw.choices = []; waveTime += 2.1; update(0.01);" +
          " const b = enemies.find((x) => x.final); b.y += 320 - bottomOf(b); b.speed = 0;" + extra,
        each: KEEP + " for (const x of enemies) if (x.final) x.speed = 0; player.cd = 1e9;", frames: t === "energy" ? 50 : 20 }, ["giantDetails", "giantBehind", "layerBody", "GIANT_LAYERS", "orbitRing", "FX.prismRay"]);
  // 1.23.0: mini-boss maggiori (DESIGN.md § 17) in campo con le abilità accese: Asteroide diviso, Cristallo con la resistenza fire, Artiglio con i cavi,
  // Prisma invisibile con il raggio, Riflesso che manda le sfere
  const MJ = (ab, x, y) => `{ const d = miniDef(campLevel, 15); Object.assign(d, { major: "${ab}", look: MAJOR_DEF["${ab}"].look, name: MAJOR_DEF["${ab}"].name, r: MAJOR_DEF["${ab}"].r, split: ${ab === "split" ? 2 : 0}, stopAt: 0 }); spawn({ enemy: "boss", def: d, x: ${x} }); Object.assign(enemies[enemies.length - 1], { y: ${y}, speed: 0, hp: 1e6, maxHp: 1e6 }); }`;
  add(1, "mini-boss-maggiori", "Mini-boss maggiori", "Dalla difficoltà 70: Asteroide maggiore diviso, Cristallo maggiore con la resistenza fire (colore), Artiglio maggiore con i cavi verso i nemici che rigenera (“+” e bagliore), Prisma maggiore invisibile con il raggio, Riflesso maggiore con le sfere del danno deviato.",
    { progress: Object.assign({}, P1, { cleared: 120 }), setup: START(100) + " " + CLEAR + " " + MJ("split", 60, 190) + MJ("adapt", 300, 190) + MJ("regen", 180, 250) + MJ("invis", 70, 350) + MJ("deflect", 290, 330) +
        " for (const [k, x, y] of [['drone', 130, 160], ['brute', 235, 170], ['spitter', 140, 330], ['shell', 230, 410]]) { spawn({ enemy: k, x }); Object.assign(enemies[enemies.length - 1], { y, speed: 0, hp: 5e5, maxHp: 1e6 }); }" +
        " const by = (ab) => enemies.find((e) => e.def.major === ab); damage(by('split'), 6e5, 'fire', true); const cr = by('adapt'); cr.adT = 'fire'; cr.res = RESIST.fire; const pr = by('invis'); pr.invis = pr.invisUsed = true; pr.invisT = 99; pr.rcd = 0.05; by('regen').rgCd = 0.05; alerts = [];",
      each: KEEP + " for (const e of enemies) { e.speed = 0; if (!e.boss) e.hp = Math.min(e.hp, e.maxHp * 0.6); } const m = enemies.find((e) => e.def.major === 'deflect'); if (m) damage(m, 30, 'fire'); const pr = enemies.find((e) => e.def.major === 'invis'); if (pr && pr.rcd > 1.2) pr.rcd = 1.2; alerts = [];", frames: 40 },
    ["miniTick", "FOE_LAYERS", "foeDetails", "FX.regenCables", "FX.healGlow", "FX.deflectOrb", "FX.prismRay"]);
  // 1.21.0: pacco regalo (DESIGN.md § 17): in campo con il mirino agganciato, e l’avviso del premio
  const PGF = Object.assign({}, PP, { cleared: 70, seen: PP.seen.concat(["gift"]) });
  add(1, "pacco-regalo", "Pacco regalo", "Drone-corriere che fluttua tra il 25% e il 50% dell’altezza con l’anello del timer; solo il guardiano, tenendo premuto con il mirino entro 45 px, lo colpisce.",
    { progress: PGF, setup: START(61) + " queue = []; enemies.length = 0; startWave(4); queue = []; waveTime = 0; spawnGift(); gift.y = gift.ty = 400; gift.x = gift.tx = 120; gift.phase = 'float'; gift.t = 7;" +
        " for (const [k, x, y] of [['drone', 90, 250], ['brute', 260, 300]]) { spawn({ enemy: k, x }); Object.assign(enemies[enemies.length - 1], { y, speed: 0, hp: 1e9, maxHp: 1e9 }); } pressing = true; press.x = 124; press.y = 404; player.targetX = 120;",
      each: KEEP + " pressing = true; press.x = gift ? gift.x + 4 : 124; press.y = gift ? gift.y + 4 : 404; if (gift) gift.hp = Math.max(gift.hp, gift.maxHp * 0.4);", frames: 40 }, ["FX.gift", "giftTick", "drawCrosshair"]);
  add(1, "pacco-premio", "Pacco regalo · premio", "Alla sconfitta: frammenti di un ranger non al livello 10, con l’etichetta col nome del ranger e il pezzo di puzzle (in Epica con tutti i ranger al 10: un pezzo o un Modulo epico o superiore).",
    { progress: PGF, setup: START(61) + " queue = []; enemies.length = 0; startWave(4); queue = []; waveTime = 0; giftRand = () => 0.05; spawnGift(); gift.y = 400; gift.phase = 'float'; giftHit(gift.hp + 1); alerts = [];",
      each: KEEP + " if (giftNote) giftNote.t = 3;", frames: 4 }, ["drawGiftNote", "puzzleIcon", "giftReward"]);
  // schermate HTML (stesso markup e CSS di index.html)
  add(1, "splash-controllo", "Schermata iniziale · controllo", "Appena aperta: controlla gli aggiornamenti (al massimo 3 s), nessuna scritta.", { splash: { msg: "" } }, ["#splash"]);
  add(1, "splash-aggiornamento", "Schermata iniziale · aggiornamento", "C’è una versione nuova: scarica, attiva e ricarica.", { splash: { msg: "Aggiornamento in corso…" } }, ["#splash"]);
  add(1, "splash-start", "Schermata iniziale · Start", "Controllo finito: “Start” pulsa (animazione CSS pulse, 1,6 s).", { splash: { msg: "Start", ready: true } }, ["#splash", "@keyframes pulse"]);
  add(1, "salvataggio", "Salvataggio", "Pannello HTML sopra il menu: esporta e importa.", { progress: P1, setup: "openSave();", frames: 1 }, ["#savePanel"]);
  add(1, "salvataggio-conferma", "Salvataggio · conferma", "Dopo aver incollato un codice valido: riepilogo e conferma (confirmBox).",
    { progress: P1, setup: "openSave(); stageSave(makeCode());", frames: 1 }, ["#savePanel", "#confirmBox"]);
  add(1, "salvataggio-errore", "Salvataggio · errore", "Codice non valido: messaggio rosso, progressi intatti.", { progress: P1, setup: "openSave(); stageSave('ciao');", frames: 1 }, ["#savePanel", ".msg.err"]);
  // § 3 nemici in campo
  add(3, "indicatori", "Indicatori di stato", "Rallentamento, paralisi, indebolimento, vulnerabilità, bruciatura; distruzione con 1, 3 e 5 pile.",
    { progress: { cleared: 50, seen: ALL_SEEN }, setup: START(50) + " " + CLEAR + " " +
      [{ slowT: 99 }, { paraT: 99 }, { weakT: 99 }, { vulnT: 99 }, { burnT: 99, burnDps: 0 }].map((st, i) => FOE("shell", 44 + i * 68, 200, st)).join(" ") + " " +
      [1, 3, 5].map((n, i) => FOE("shell", 90 + i * 90, 330, { destrN: n, destrT: 99 })).join(" ") + " player.cd = Infinity;", each: KEEP, frames: 30 }, ["drawStatus", "statusIcon"]);
  add(3, "miniboss", "Mini-boss in campo", "Nave aliena: contorno dorato, barra della vita sempre visibile, “MINI-BOSS” nell’HUD.",
    { progress: P1, setup: START(23) + " " + CLEAR + " spawn({ enemy: 'boss', def: bossDef(campLevel, 5), x: 180 }); Object.assign(enemies[0], { y: 230, speed: 0, hp: 6e6, maxHp: 1e7 });", each: KEEP, frames: 30 }, ["drawEnemy", "drawHud"]);
  add(3, "boss-finale", "Boss finale in campo", "Nave madre con le ali, barra grande “BOSS FINALE” in alto.",
    { progress: { cleared: 19, seen: ALL_SEEN }, setup: START(20) + " " + CLEAR + " spawn({ enemy: 'boss', def: finalBossDef(20), x: 180 }); Object.assign(enemies[0], { y: 240, speed: 0, hp: 7e6, maxHp: 1e7 });", each: KEEP, frames: 30 }, ["drawEnemy", "drawHud"]);
  // § 4 effetti: una scena per torretta, poi il guardiano
  for (const id of turretIds)
    add(4, "effetti-" + id, null, null, { progress: P1, setup: START(23) + " " + CLEAR + " " + TOWERS([null, [id, 3, FX_UPS[id] || {}, 180]]) + " " +
      FX_FOES.map(([k, x, y]) => FOE(k, x, y)).join(" ") + " player.x = player.targetX = 40; player.cd = Infinity;", each: KEEP + " player.cd = Infinity;", frames: 90 }, [], id);
  add(4, "effetti-guardiano", "Guardiano", "Salve con ventaglio, rimbalzo ed esplosioni; frenesia attiva (sagoma arancione).",
    { progress: P1, setup: START(23) + " " + CLEAR + " " + FX_FOES.map(([k, x, y]) => FOE(k, x, y)).join(" ") +
      " Object.assign(player.up, { proj: 2, fan: 1, ricochet: 1, boom1: 1, boomP: 1, frenzy1: 1 }); player.level = 3; player.st.frenzyT = 1e6;", each: KEEP, frames: 60 }, ["FX.guardBullet", "guardianShape", "FX.ring"]);
  add(4, "effetti-combo", "Combo del guardiano", "Clone speculare (Hive), laser rotante (Laser), mini-drone (Firewheel); con Vortex in campo i colpi si alternano bianco e viola (Proiettili gravitazionali).",
    { progress: P1, setup: START(23) + " " + CLEAR + " " + TOWERS([["hive", 2, {}], ["laser", 2, { multi1: 1 }], ["wheel", 2, { mini1: 1 }], ["vortex", 2, {}]]) +
      " player.level = 2; Object.assign(player.up, { kHive: 1, kLaser: 1, kWheel: 1, kVortex: 1, proj: 1 }); player.x = player.targetX = 120; " +
      [[90, 260], [250, 230], [150, 330], [290, 380], [60, 400], [200, 160]].map(([x, y], i) => FOE(i % 2 ? "shell" : "brute", x, y)).join(" ") +
      " __cat.step(90); const e = living()[2]; if (e) guardProc(player, { laser: true }, e); guardWheel(player); guardWheel(player);", each: KEEP, frames: 50 }, ["drawPlayer", "FX.laserSpin", "FX.wheelDrone"]);
  // combo tra due torrette (1.15.0): disegni nuovi (raggio e scintille dei droni dell’Hive, scie di fuoco, laser del campo, missili caricati)
  const FOES6 = [[90, 260], [250, 230], [150, 330], [290, 380], [60, 400], [200, 160]].map(([x, y], i) => FOE(i % 2 ? "shell" : "brute", x, y)).join(" ");
  add(4, "effetti-combo-hive", "Combo tra torrette · Hive", "Droni a raggio (Beam: raggio nel colore del livello del drone), Droni statici (Teslacoil: scintille), Droni incendiari (Firewheel: scia di fuoco).",
    { progress: P1, setup: START(23) + " " + CLEAR + " " + TOWERS([["hive", 3, { kBeam: 1, kTesla: 1, kWheel: 1, evo1: 1 }], ["beam", 2, { amp1: 1 }], ["tesla", 2, { orb: 1 }], ["wheel", 2, { trail1: 1 }]]) +
      " slots[1].cd = slots[2].cd = slots[3].cd = Infinity; " + FOES6 + " player.cd = Infinity;", each: KEEP + " player.cd = Infinity; slots[1].cd = slots[2].cd = slots[3].cd = Infinity;", frames: 80 },
    ["FX.hiveBeam", "FX.hiveSparks", "FX.fireTrail", "FX.hiveDrone"]);
  add(4, "effetti-combo-campo", "Combo tra torrette · Disruption Drone", "Campo laser (Laser: laser orizzontale tra i due droni) e Campo a schegge (Aeroblast: salve verso l’interno).",
    { progress: P1, setup: START(23) + " " + CLEAR + " " + TOWERS([["disr", 2, { kLaser: 1, kAero: 1 }], ["laser", 2, { sweep1: 1 }], ["aero", 2, { salvo1: 1 }]]) +
      " slots[0].cd = 0; slots[1].cd = slots[2].cd = Infinity; " + FOES6 + " player.cd = Infinity;", each: KEEP + " player.cd = Infinity; slots[1].cd = slots[2].cd = Infinity;", frames: 50 },
    ["FX.disrField", "FX.laserRays", "FX.aeroShard"]);
  add(4, "effetti-combo-fulmini", "Combo tra torrette · Sky Guard e Thunderbolt", "Missili sovraccarichi (Teslacoil: alone elettrico) e Fulmini di fuoco (Firewheel: scia di fuoco lungo il fulmine).",
    { progress: P1, setup: START(23) + " " + CLEAR + " " + TOWERS([["sky", 2, { kTesla: 1 }], ["tesla", 2, { over1: 1 }], ["thunder", 2, { kWheel: 1, sph: 1 }], ["wheel", 2, { trail1: 1 }]]) +
      " slots[1].cd = slots[3].cd = Infinity; " + FOES6 + " player.cd = Infinity;", each: KEEP + " player.cd = Infinity; slots[1].cd = slots[3].cd = Infinity;", frames: 40 },
    ["FX.missile", "FX.fireTrail", "FX.bolt"]);
  // § 5 carte
  const CARDS = (opts) => START(23) + " __cat.step(5); " + opts + " state = 'upgrade';";
  add(5, "carte-std-chain-lu", "Carte · Standard, Chain, Level up", "Il bordo e il pallino hanno il colore del tipo di danno.",
    { progress: P1, setup: CARDS(TOWERS([["sky", 1], ["rail", 2]]) + " const U = (s, f) => s.def.ups.find(f); options = [{ kind: 'up', who: slots[0], up: U(slots[0], (u) => u.id === 'dmg') }, { kind: 'up', who: slots[1], up: U(slots[1], (u) => u.cat === 'chain' && u.lv === 1) }, { kind: 'up', who: player, up: U(player, (u) => u.cat === 'lu' && u.lv === 2) }];"), frames: 1 }, ["upgradeScreen", "button"]);
  add(5, "carte-combo", "Carte · Combo", "Combo del guardiano con una torretta in campo.",
    { progress: P1, setup: CARDS(TOWERS([["hive", 2], ["laser", 2, { multi1: 1 }], ["wheel", 2, { mini1: 1 }], ["vortex", 2]]) + " player.level = 2; options = ['kVortex', 'kBeam', 'kWheel'].map((id) => ({ kind: 'up', who: player, up: player.def.ups.find((u) => u.id === id) }));"), frames: 1 }, ["upgradeScreen"]);
  add(5, "carte-nuova", "Carte · Nuova torretta", "Con slot liberi escono anche le torrette nuove.",
    { progress: P1, setup: CARDS("options = [{ kind: 'new', id: 'tesla' }, { kind: 'new', id: 'beam' }, { kind: 'up', who: player, up: player.def.ups.find((u) => u.id === 'pierce') }];"), frames: 1 }, ["upgradeScreen"]);
  add(5, "ricompensa", "Ricompensa del mini-boss", "Carte estratte e già applicate, poi “Continua”.",
    { progress: P1, setup: CARDS(TOWERS([["sky", 2], ["aero", 2]]) + " rewards = [{ kind: 'up', who: slots[0], up: slots[0].def.ups.find((u) => u.id === 'msl') }, { kind: 'up', who: slots[1], up: slots[1].def.ups.find((u) => u.cat === 'chain' && u.lv === 1) }, { kind: 'up', who: player, up: player.def.ups.find((u) => u.id === 'dmg') }].map(describe);"), frames: 1 }, ["rewardScreen"]);
  // § 6 scena di prova
  add(6, "prova", "Scena di prova", "Quattro torrette e venti nemici insieme, il guardiano spara: per giudicare la leggibilità.",
    { progress: P1, setup: START(23) + " " + CLEAR + " " + TOWERS([["sky", 3, { split1: 1, burn1: 1 }], ["thunder", 3, { fork1: 1, sph: 1 }], ["aero", 3, { salvo1: 1, mine1: 1 }], ["tesla", 3, { orb: 1, chain: 1 }]]) +
      " " + crowd(20, 140) + " Object.assign(player.up, { proj: 1, fan: 1, boom1: 1 });", each: KEEP, frames: 150 }, ["draw"]);
  return S;
}

/* ---------- tessere (codice eseguito nell’atelier; T = secondi del catalogo) ---------- */
function tiles(M) {
  const T = [];
  const add = (voce, label, code, box, zoom, anim, extra) => T.push({ key: "t" + T.length, voce, label, code, box, zoom, anim: !!anim, ...(extra || {}) });
  for (const id of M.turretIds)
    add("arte:" + id, M.turrets[id].name, `ctx.translate(0, -GROUND_Y); DRAW.drawTurret({ id: "${id}", x: 0, level: 2, used: 1, done: false, def: TURRETS["${id}"], st: {}, up: {} });`, [-22, -36, 44, 62], 3);
  add("guardiano", "Guardiano", "ctx.translate(0, -GROUND_Y); player.st.frenzyT = 0; DRAW.guardianShape(0);", [-20, -54, 40, 58], 3);
  add("guardiano-frenesia", "Guardiano in frenesia", "ctx.translate(0, -GROUND_Y); const f = player.st.frenzyT; player.st.frenzyT = 5; DRAW.guardianShape(0); player.st.frenzyT = f;", [-20, -54, 40, 58], 3);
  // equipaggiamento del guardiano: ogni pezzo e il suo Modulo nelle 5 rarità (l’ancestrale cambia colore: tessera animata)
  for (const [id, name] of Object.entries(M.pieces || {})) {
    add("pezzo:" + id, name + " · 5 rarità", `[0, 1, 2, 3, 4].forEach((r) => DRAW.pieceIcon("${id}", -48 + r * 24, 0, 20, DRAW.rarColor(r)));`, [-60, -13, 120, 26], 2.5, true);
    add("modulo:" + id, "Modulo · " + name + " · 5 rarità", `[0, 1, 2, 3, 4].forEach((r) => DRAW.modIcon("${id}", -48 + r * 24, 0, 20, DRAW.rarColor(r)));`, [-60, -13, 120, 26], 2.5, true);
  }
  add("guardiano-clone", "Clone speculare (specchiato, trasparente)", "ctx.translate(0, -GROUND_Y); player.st.frenzyT = 0; ctx.globalAlpha = 0.45; DRAW.guardianShape(0, true); ctx.globalAlpha = 1;", [-20, -54, 40, 58], 3);
  const foe = (def, extra) => `DRAW.drawEnemy(Object.assign({ def: ${def}, x: 0, y: 0, hp: 1, maxHp: 1, flash: 0, shape: DRAW.ICON_SHAPE, rot: 0.4, boss: false }, ${JSON.stringify(extra || {})}));`;
  const ebox = (r, top) => [-(1.7 * r + 4), -(top || 2.8 * r + 6), 2 * (1.7 * r + 4), (top || 2.8 * r + 6) + 1.4 * r + 4];
  for (const k of M.enemyKeys) { const d = M.enemies[k]; add("nemico:" + k, M.lookName[d.look] + " (" + k + ")", foe(`ENEMY_DEFS["${k}"]`), ebox(d.r), 3, false, { look: d.look }); }
  for (const t of M.typeKeys) add("nave:" + t, "Nave aliena · " + M.types[t].name, foe(`Object.assign(bossDef(1, 5), { type: "${t}" })`, { boss: true, hp: 0.7 }), ebox(24, 40), 1.6, false, { look: "ship" });
  for (const t of M.typeKeys) add("madre:" + t, "Nave madre · " + M.types[t].name, foe(`Object.assign(finalBossDef(10), { type: "${t}" })`, { boss: true, hp: 0.7 }), ebox(34, 50), 1.2, false, { look: "mothership" });
  // 1.23.0: mini-boss maggiori, ognuno nei cinque tipi
  for (const ab of M.majorKeys) for (const t of M.typeKeys) add("maggiore:" + ab + ":" + t, M.majors[ab].name + " · " + M.types[t].name,
    foe(`Object.assign(bossDef(1, 5), { type: "${t}", major: "${ab}", look: MAJOR_DEF["${ab}"].look, r: MAJOR_DEF["${ab}"].r })`, { boss: true, hp: 0.7 }), ebox(26, 50), 1.6, false, { look: M.majors[ab].look });
  add("colpito", "Colpito (lampo bianco)", foe('ENEMY_DEFS["shell"]', { flash: 0.1 }), ebox(14), 3);
  add("ferito", "Barra della vita", foe('ENEMY_DEFS["brute"]', { hp: 0.55 }), ebox(16), 3);
  for (const [kind, , color] of M.status) add("stato:" + kind, M.statusName[kind] || kind, `DRAW.statusIcon("${kind}", 0, 0, "${color}", { destrN: 3 });`, [-9, -9, 18, 18], 5);
  for (const n of [1, 2, 3, 4, 5]) add("pile:" + n, "Distruzione · " + n + (n > 1 ? " pile" : " pila"), `DRAW.statusIcon("destr", 0, 0, "#8aa0c8", { destrN: ${n} });`, [-9, -9, 18, 18], 5);
  add("tutti-gli-stati", "Tutti gli stati insieme", foe('ENEMY_DEFS["brute"]', { slowT: 1, paraT: 1, weakT: 1, vulnT: 1, burnT: 1, destrN: 3, destrT: 1 }), [-46, -42, 92, 66], 3);
  // effetti: una tessera per funzione di FX, più le parti delle torrette e dell’HUD
  const CK = "const c0 = clock; clock = T; try { ", CK0 = " } finally { clock = c0; }";
  const FXT = {
    ring: ["const life = 0.35, o = { t: life - (T % 0.6) }; if (o.t > 0) FX.ring(o, 0, 0, 30, TYPES.physical.color, life);", [-36, -36, 72, 72], 2],
    bolt: ["const pts = [{ x: -30, y: -30 }, { x: -12, y: -14 }, { x: -20, y: 2 }, { x: 4, y: 8 }, { x: -2, y: 22 }, { x: 26, y: 30 }], o = { t: 0.15 - (T % 0.4) }; if (o.t > 0) FX.bolt(o, pts, TYPES.electric.color, 0.15, 1.5);", [-36, -36, 72, 72], 2],
    zone: ["const o = { x: 0, y: 0, r: 30, t: 2 - (T % 2.4) }; if (o.t > 0) FX.zone(o, TYPES.electric.color);", [-36, -36, 72, 72], 2],
    teslaOrb: ["const o = { x: 0, y: 0, r: 30, t: 2 - (T % 2.4), age: T }; if (o.t > 0) FX.teslaOrb(o);", [-36, -36, 72, 72], 2],
    missile: ["const a = -Math.PI / 2 + 0.6 * Math.sin(T * 2); FX.missile({ x: -12, y: 0, a }, false); FX.missile({ x: 14, y: 0, a }, true);", [-30, -20, 60, 40], 3],
    laserRays: ["FX.laserRays([{ segs: [{ x1: -40, y1: 30, x2: 40, y2: -30 }], w: 8 }, { segs: [{ x1: -40, y1: 38, x2: 40, y2: -8 }], w: 4.8 }]);", [-44, -36, 88, 80], 2],
    laserSweep: ["const a = -Math.PI + (T % 3) / 3 * Math.PI; FX.laserSweep({ segs: [{ x1: 0, y1: 30, x2: Math.cos(a) * 60, y2: 30 + Math.sin(a) * 60 }] }, 8);", [-64, -34, 128, 72], 1.5],
    laserSpin: ["const o = { x: 0, y: 0, t: T % 3, segs(r) { const a = this.t * 4 * Math.PI / 3 + r.off, c = Math.cos(a) * 34, sn = Math.sin(a) * 34; return [{ x1: -c, y1: -sn, x2: c, y2: sn }]; } }; FX.laserSpin(o, [{ off: 0, w: 8 }, { off: Math.PI / 3, w: 4.8 }, { off: -Math.PI / 3, w: 4.8 }]);", [-40, -40, 80, 80], 2],
    disrField: ["const o = { y: 0, age: T % 3, t: 3 - (T % 3) }; FX.disrField(o, 180, 34, 16);", [0, -40, 360, 80], 1],
    disrBlast: ["const o = { t: 0.35 - (T % 0.8) }; if (o.t > 0) FX.disrBlast(o, 0, 16);", [0, -40, 360, 80], 1],
    aeroBomb: ["FX.aeroBomb({ x: 0, y: 2 });", [-10, -10, 20, 20], 4],
    aeroShard: ["FX.aeroShard({ x: 0, y: 0 });", [-10, -10, 20, 20], 4],
    aeroMine: ["FX.aeroMine({ x: 0, y: 0, age: T });", [-10, -10, 20, 20], 4],
    fireField: ["const o = { x: 0, y: 0, r: 30, t: 5 - (T % 5.4), age: T % 5.4 }; if (o.t > 0) FX.fireField(o);", [-44, -50, 88, 90], 2],
    fieldOrb: ["FX.fieldOrb({ x: 0, y: 0 }); ents.length = 0;", [-10, -10, 20, 20], 4],
    beamLinks: ["const pos = { x: 0, y: 40 }, p = { x: 0, y: -24 }; FX.beamLinks({ links: [[pos, p], [p, { x: -36, y: -6 }], [p, { x: 34, y: -36 }]] }, pos);", [-44, -44, 88, 90], 2],
    wheelDrone: ["FX.wheelDrone({ x: 10, y: 0, rot: T * 8, trail: [{ x: -50, y: 18, t: 0.5 }, { x: -32, y: 10, t: 1.1 }, { x: -12, y: 4, t: 1.7 }] }, { rad: 28, mini: false }, 2);", [-60, -34, 104, 68], 2],
    hiveWave: ["const o = { t: 0.35 - (T % 0.7) }; if (o.t > 0) FX.hiveWave(o, 0, 30, -Math.PI / 2, 60);", [-50, -36, 100, 72], 2],
    hiveShot: ["[1, 2, 3].forEach((lvl, i) => { const q = (T * 1.5 + i * 0.2) % 1, x = -30 + i * 30, y = 20 - q * 40; FX.hiveShot({ lvl, px: x, py: y + 6, x, y }); });", [-44, -26, 88, 52], 3],
    hiveDrone: ["FX.hiveDrone({ x: -14, y: 0, lvl: 1, kami: 0 }); FX.hiveDrone({ x: 14, y: 0, lvl: 2, kami: 1 });", [-28, -14, 56, 28], 3],
    railShot: ["FX.railShot({ x: 6, y: -6 }, -Math.PI / 4);", [-20, -20, 40, 40], 3],
    teslaBall: ["FX.teslaBall({ x: 0, y: 0, age: T });", [-18, -18, 36, 36], 4],
    vortex: ["FX.vortex({ x: 0, y: 0, spin: T * 4 }, 32);", [-36, -36, 72, 72], 2],
    portals: ["FX.portals({ t: 4 }, { x: -34, y: 0 }, 22, { x: 36, y: 0 });", [-60, -28, 120, 56], 2],
    guardBullet: ["[[false, false, false, null], [false, false, true, null], [false, true, false, null], [true, false, false, null], [false, false, false, TYPES.fire.color], [false, false, false, TYPES.force.color]].forEach(([charged, clone, fan, tint], i) => FX.guardBullet({ x: -40 + i * 16, y: 6, vx: 0, vy: -1 }, charged, clone, fan, false, tint));", [-48, -16, 96, 32], 3],
    domeWave: ["const o = { t: 0.6 - (T % 1), side: Math.floor(T) % 2 ? 1 : -1 }; if (o.t > 0) FX.domeWave(o);", [0, 380, 360, 200], 1],
    domeGas: ["FX.domeGas(60 + 80 * ((T * 0.25) % 1), 1);", [0, 330, 360, 250], 1],
    domeAura: ["DRAW.drawDomeEdge(); FX.domeAura(['#e8eefc', '#ff8a3d', '#ffd166', '#3fe0a0'][Math.floor(T) % 4]);", [0, 440, 360, 140], 1],
    shieldCount: ["FX.shieldCount(0, 0, 1 + Math.floor(T) % 5);", [-12, -12, 24, 24], 4],
    // 1.19.1: le tessere che mancavano (ranger, boss giganti, speciali, combo dell’Hive); CK = orologio del gioco portato al tempo del catalogo
    ranger: [CK + "Object.keys(RANGER_DEF).forEach((id, i) => FX.ranger({ x: -88 + (i % 5) * 44, y: Math.floor(i / 5) * 36 - 10, bob: T + i, type: RANGER_DEF[id].type, d: RANGER_DEF[id] }));" + CK0, [-106, -30, 212, 76], 2],
    prismRay: ["FX.prismRay({ x: 0, y0: -60, y1: 60, t: T % 1.6 });", [-20, -64, 40, 128], 1.5],
    immune: [CK + "const e = { x: 0, y: 0, def: { r: 14 } }; FX.immune(e);" + CK0, [-24, -24, 48, 48], 3],
    husk: ["FX.husk({ x: 0, y: 0, r: 17, t: 3 - (T % 3.6) });", [-24, -24, 48, 48], 3],
    // 1.21.0: pacco regalo con il timer pieno, a metà e quasi scaduto (lampeggia), ferito
    gift: [CK + "[[12, 1], [6, 0.6], [2, 0.25]].forEach(([t, h], i) => FX.gift({ x: -48 + i * 48, y: 0, t: GIFT.time - ((GIFT.time - t + T) % GIFT.time), hp: h, maxHp: 1, age: T + i, phase: 'float', flash: 0 }));" + CK0, [-74, -34, 148, 70], 2.5],
    rangerFlame: [CK + "FX.rangerFlame({ len: 110, ang: -Math.PI / 2 + 0.5 * Math.sin(T), t: 0.4 }, { x: 0, y: 60 });" + CK0, [-70, -70, 140, 140], 1.5],
    bubble: ["[0, 1, 2].forEach((k) => FX.bubble({ x: -24 + k * 24, y: 0, age: (T + k * 4) % RV.gammaLife, seed: k * 2 }));", [-40, -18, 80, 36], 3],
    fireTrail: [CK + "FX.fireTrail([0, 1, 2, 3, 4].map((k) => ({ x: -48 + k * 24, y: 8 * Math.sin(k + T), t: 1 - k * 0.18 })), 1);" + CK0, [-64, -34, 128, 56], 2],
    hiveBeam: ["[1, 2, 3].forEach((lvl, i) => { const o = { x: -40 + i * 40, y: 18, lvl, ray: { t: 0.3 } }; FX.hiveDrone(o); FX.hiveBeam(o, { x: -40 + i * 40 + 12 * Math.sin(T * 2 + i), y: -22 }); });", [-60, -34, 120, 66], 2],
    // 1.23.0: mini-boss maggiori · cavi dell’Artiglio, bagliore della rigenerazione, sfere del Riflesso
    regenCables: [CK + "FX.regenCables({ x: -44, y: 0, def: { type: 'electric' }, rgTg: [{ x: 34, y: -26 }, { x: 40, y: 4 }, { x: 26, y: 30 }] });" + CK0, [-54, -40, 108, 80], 2],
    healGlow: [CK + "FX.healGlow({ x: 0, y: 0, def: { r: 14 }, healT: 1 - (T % 1.2), healC: TYPES.electric.color });" + CK0, [-30, -30, 60, 60], 3],
    deflectOrb: ["[0, 1, 2, 3].forEach((i) => { const k = (T * 0.7 + i * 0.25) % 1; FX.deflectOrb({ x: -50 + 100 * k, y: 24 - 200 * k * (1 - k), color: TYPES.physical.color }); });", [-60, -34, 120, 66], 2],
    hiveSparks: [CK + "[1, 2, 3].forEach((lvl, i) => { const o = { x: -36 + i * 36, y: 0, lvl, kami: 0 }; FX.hiveDrone(o); FX.hiveSparks(o); });" + CK0, [-56, -24, 112, 48], 3],
  };
  for (const k of M.fxKeys) { const t = FXT[k] || ["", [-20, -20, 40, 40], 2]; add("fx:" + k, "FX." + k, t[0], t[1], t[2], true, { fx: k, missing: !FXT[k] }); }
  add("parte:thunderDraw", "thunderDraw (sfere del Thunderbolt)", "DRAW.thunderDraw({ st: { sph: [{ x: -14, y: 0 }, { x: 14, y: 0 }] } });", [-28, -14, 56, 28], 3);
  add("parte:teslaDraw", "teslaDraw (carica del Teslacoil)", "DRAW.teslaDraw({ x: 0, y: 20, st: { charge: 0.7 - (T % 0.7), chargeT: 0.7 } });", [-18, -18, 36, 36], 4, true);
  add("parte:ballLightning", "ballLightning (fulmine globulare)", "DRAW.ballLightning(0, 0, 10, T);", [-26, -26, 52, 52], 3, true);
  add("parte:drawCrosshair", "drawCrosshair (mirino: libero e agganciato)", "DRAW.drawCrosshair(-22, 0, false); DRAW.drawCrosshair(22, 0, true);", [-44, -22, 88, 44], 3);
  add("parte:drawFloater", "drawFloater (numeri: normale, debolezza, resistenza)", "floaters.length = 0; const e = { x: 0, y: 10, def: { r: 0 } }; popup(e, 24, 1); popup(e, 36, 1.5); popup(e, 12, 0.5); floaters.forEach((f, i) => { const k = (T + i * 0.25) % 1; f.x = -34 + i * 34; f.y = 8 - k * 24; f.life = 0.7 - k * 0.7; DRAW.drawFloater(f); }); ctx.globalAlpha = 1; floaters.length = 0;", [-50, -24, 100, 40], 2.5, true);
  return T;
}

/* ---------- metadati presi dal gioco (jsdom) ---------- */
function atelier(P) {
  const { JSDOM } = require("jsdom");
  const dom = new JSDOM(buildDoc(P, { progress: P1 }), { runScripts: "dangerously", pretendToBeVisual: true, url: "http://localhost/" });
  const w = dom.window;
  if (w.__cat.errors.length) throw new Error("atelier: " + w.__cat.errors.join("; "));
  return { w, ev: (c) => w.__ev(c), close: () => w.close() };
}
function meta(P) {
  const A = atelier(P), ev = A.ev;
  const M = {
    turretIds: ev("Object.keys(TURRETS)"), artKeys: ev("Object.keys(DRAW.TURRET_ART)"), enemyKeys: ev("Object.keys(ENEMY_DEFS)"),
    fxKeys: ev("Object.keys(FX)"), typeKeys: ev("Object.keys(TYPES)"), status: ev("DRAW.STATUS_ICONS.map((s) => [s[0], null, s[2]])"),
    turrets: ev("Object.fromEntries(Object.entries(TURRETS).map(([k, d]) => [k, { name: d.name, type: d.type, range: d.range, reload: d.reload, blurb: d.blurb }]))"),
    enemies: ev("JSON.parse(JSON.stringify(ENEMY_DEFS))"), types: ev("JSON.parse(JSON.stringify(TYPES))"), lookName: ev("DRAW.ENEMY_NAME"),
    behavDraw: ev("Object.fromEntries(Object.entries(BEHAV).filter(([, b]) => b.draw).map(([k, b]) => [k, b.draw.name]))"),
    base: ev("({ BODY: DRAW.BODY, BODY2: DRAW.BODY2, DARK: DRAW.DARK })"),
    artSrc: ev("Object.fromEntries(Object.entries(DRAW.TURRET_ART).map(([k, f]) => [k, String(f)]))"),
    pieces: ev("Object.fromEntries(PIECE_IDS.map((k) => [k, PIECES[k].name]))"),
    majors: ev("JSON.parse(JSON.stringify(MAJOR_DEF))"), majorKeys: ev("MAJOR_KEYS"), rarity: ev("RARITY.map((r) => r.name)"),
  };
  M.statusName = { slow: "Rallentamento", para: "Paralisi", weak: "Indebolimento", destr: "Distruzione (pile)", vuln: "Vulnerabilità", burn: "Bruciatura" };
  // dimensioni: si disegna ogni tessera ingrandita ×4 su sfondo trasparente e si misura la parte colorata
  ev("document.getElementById('c').width = 1600; document.getElementById('c').height = 1600;");
  const c = A.w.document.getElementById("c"), cx = c.getContext("2d");
  M.size = {};
  for (const t of tiles(M)) {
    if (!/^(arte|guardiano|nemico|nave|madre)/.test(t.voce)) continue;
    const k = 4, big = [t.box[0] - 10, t.box[1] - 10, t.box[2] + 20, t.box[3] + 20];
    A.w.__cat.tile(t.key, t.code.replace(/DRAW\.drawTurret\(\{ id: "(\w+)"[^;]*;/, 'DRAW.TURRET_ART["$1"](0, GROUND_Y, TYPES[TURRETS["$1"].type].color);'), 0, big, k);
    const W = Math.ceil(big[2] * k), H = Math.ceil(big[3] * k), d = cx.getImageData(0, 0, W, H).data;
    let x0 = W, y0 = H, x1 = -1, y1 = -1;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3] > 20) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    M.size[t.voce] = x1 < 0 ? null : { w: Math.round((x1 - x0 + 1) / k), h: Math.round((y1 - y0 + 1) / k) };
  }
  A.close();
  return M;
}
// la torretta (o il guardiano) che usa ogni funzione FX e gli aiuti ring/bolt/zone: dalle sezioni di index.html
function fxUsage(html, M) {
  const lines = html.split("\n"), owner = [];
  let cur = "comune";
  for (const l of lines) {
    const m = /^\/\/ ---------- \d+\. (.+?) \(\w+\) ----------/.exec(l);
    if (m) cur = Object.keys(M.turrets).find((k) => M.turrets[k].name.toUpperCase() === m[1]) || m[1];
    else if (/^const BEHAV = /.test(l)) cur = "comune";
    else if (/^const FRENZY = /.test(l)) cur = "player";
    else if (/MOTORE DEI POTENZIAMENTI/.test(l)) cur = "comune";
    owner.push(cur);
  }
  const use = {};
  const note = (key, i) => { const o = owner[i]; if (o === "comune") return; (use[key] = use[key] || new Set()).add(o); };
  lines.forEach((l, i) => {
    for (const m of l.matchAll(/FX\.(\w+)\(/g)) note(m[1], i);
    for (const m of l.matchAll(/(?<![\w.])(ring|bolt|zone)\(/g)) if (!/^function /.test(l)) note(m[1], i);
  });
  return Object.fromEntries(Object.entries(use).map(([k, s]) => [k, [...s]]));
}

/* ---------- verifica delle scene in jsdom ---------- */
function verify(P, list) {
  const { JSDOM } = require("jsdom"), bad = [];
  for (const sc of list) {
    const dom = new JSDOM(buildDoc(P, sc.cfg), { runScripts: "dangerously", pretendToBeVisual: true, url: "http://localhost/" });
    const w = dom.window, errs = w.__cat.errors.slice();
    if (!errs.length && sc.cfg.check && !w.__ev(sc.cfg.check)) errs.push("controllo fallito: " + sc.cfg.check);
    if (!errs.length && !sc.cfg.splash && w.__cat.frames < 2) errs.push("il gioco non è partito");
    if (errs.length) bad.push(sc.id + ": " + errs.join("; "));
    w.close();
  }
  if (bad.length) throw new Error("scene con errori:\n  " + bad.join("\n  "));
}

/* ---------- la pagina ---------- */
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const lineOf = (src, re) => { const i = src.split("\n").findIndex((l) => re.test(l)); return i < 0 ? null : i + 1; };
function page(P, M, S, T, H) {
  const now = new Date(), pad = (n) => String(n).padStart(2, "0");
  const date = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const typeChip = (t) => `<span class="chip" style="--c:${M.types[t].color}">${esc(M.types[t].name)}</span>`;
  const sw = (c, label) => `<span class="sw" style="--c:${c}" title="${esc(c)}"></span><code>${esc(label || c)}</code>`;
  const dl = (re) => { const n = lineOf(P.draw, re); return n ? `<code>draw.js:${n}</code>` : ""; };
  const tileHtml = (t) => `<figure class="tile" data-voce="${esc(t.voce)}" data-tile="${t.key}"><canvas width="${Math.round(t.box[2] * t.zoom)}" height="${Math.round(t.box[3] * t.zoom)}" style="width:${Math.round(t.box[2] * t.zoom)}px;height:${Math.round(t.box[3] * t.zoom)}px"></canvas><figcaption>${esc(t.label)}${t.anim ? ' <span class="anim">animata</span>' : ""}</figcaption></figure>`;
  const tilesOf = (re) => T.filter((t) => re.test(t.voce)).map(tileHtml).join("");
  const sceneHtml = (s) => `<figure class="scene" data-voce="scena:${esc(s.id)}" data-scene="${esc(s.id)}"><div class="frame"><span class="ph">${esc(s.title)}<br><small>(si accende quando è visibile)</small></span></div>
<figcaption><b>${esc(s.title)}</b> <button class="rs" title="Riavvia la scena">↺</button><br>${esc(s.desc)}${s.fns.length ? "<br>" + s.fns.map((f) => `<code>${esc(f)}</code>`).join(" ") : ""}<span class="err" hidden></span></figcaption></figure>`;
  const scenesOf = (sec) => S.filter((s) => s.sec === sec).map(sceneHtml).join("\n");
  const usage = fxUsage(P.html, M), who = (k) => (usage[k] || []).map((o) => (o === "player" ? "guardiano" : M.turrets[o] ? M.turrets[o].name : o));
  const fxDesc = Object.fromEntries([...P.draw.matchAll(/^  (\w+)\(o[^)]*\) \{\s*(?:.*?\/\/ (.+))?$/gm)].map((m) => [m[1], (m[2] || "").trim()]));
  const fxDesc2 = Object.fromEntries([...P.draw.matchAll(/^  (\w+)\(o\) \{ [^}]*\}\s*,\s*\/\/ (.+)$/gm)].map((m) => [m[1], m[2].trim()]));
  const colorsIn = (src) => [...new Set([...src.matchAll(/#[0-9a-fA-F]{3,6}\b|\b(?:BODY2|BODY|DARK)\b/g)].map((m) => m[0]))];
  const hexCount = {}; for (const m of P.draw.matchAll(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g)) hexCount[m[0].toLowerCase()] = (hexCount[m[0].toLowerCase()] || 0) + 1;
  const sizeTxt = (v) => (M.size[v] ? `${M.size[v].w}×${M.size[v].h} px` : "—");

  // § 2 tabella torrette
  const turretRows = M.turretIds.map((id) => {
    const d = M.turrets[id], extra = M.behavDraw[id] ? ` · <code>${esc(M.behavDraw[id])}</code> ${dl(new RegExp("^function " + M.behavDraw[id] + "\\("))}` : "";
    const fx = M.fxKeys.filter((k) => (usage[k] || []).includes(id));
    const cols = colorsIn(M.artSrc[id]).map((c) => sw(c === "BODY" ? M.base.BODY : c === "BODY2" ? M.base.BODY2 : c === "DARK" ? M.base.DARK : c, c)).join(" ");
    return `<tr data-voce="torretta:${id}"><td><b>${esc(d.name)}</b><br><code>${id}</code></td><td>${typeChip(d.type)}</td>
<td><code>TURRET_ART.${id}</code> ${dl(new RegExp("^  " + id + "\\(x, g, c\\)"))}<br><code>drawTurret</code>${extra}${fx.length ? "<br>effetti: " + fx.map((k) => `<code>FX.${k}</code>`).join(" ") : ""}</td>
<td>${sizeTxt("arte:" + id)}</td><td>${sw(M.types[d.type].color, "c = " + M.types[d.type].color)}<br>${cols}</td></tr>`;
  }).join("\n");
  // § 3 tabella nemici
  const majLook = Object.fromEntries(M.majorKeys.map((k) => [M.majors[k].look, k]));   // 1.23.0: mini-boss maggiori
  const looks = [...new Set([...M.enemyKeys.map((k) => M.enemies[k].look), "ship", "mothership", ...Object.keys(majLook)])];
  const enemyRows = looks.map((look) => {
    const keys = M.enemyKeys.filter((k) => M.enemies[k].look === look), d = keys.length ? M.enemies[keys[0]] : null, mj = majLook[look];
    if (mj) return `<tr data-voce="aspetto:${look}"><td><b>${esc(M.majors[mj].name)}</b><br><code>look: "${look}"</code></td><td><code>miniDef</code> (mini-boss maggiore, ${esc(M.majors[mj].ab)})</td>
<td>tutti e 5, a rotazione</td><td>r = ${M.majors[mj].r} · ${sizeTxt("maggiore:" + mj + ":fire")}</td></tr>`;
    const voce = keys.length ? "nemico:" + keys[0] : look === "ship" ? "nave:fire" : "madre:fire";
    return `<tr data-voce="aspetto:${look}">${keys.map((k) => `<td hidden data-voce="nemico-def:${k}"></td>`).join("")}<td><b>${esc(M.lookName[look] || look)}</b><br><code>look: "${look}"</code></td>
<td>${keys.length ? keys.map((k) => `<code>${k}</code>`).join(" ") : look === "ship" ? "<code>bossDef</code> (mini-boss)" : "<code>finalBossDef</code> (boss finale)"}</td>
<td>${d ? typeChip(d.type) : "tutti e 5, a rotazione"}</td><td>${d ? "r = " + d.r : look === "ship" ? "r = 24" : "r = 34"} · ${sizeTxt(voce)}</td></tr>`;
  }).join("\n");
  const fxRows = M.fxKeys.map((k) => `<tr data-voce="fx-voce:${k}"><td><code>FX.${k}</code> ${dl(new RegExp("^  " + k + "\\(o"))}</td><td>${esc(fxDesc[k] || fxDesc2[k] || "")}</td><td>${esc(who(k).join(", ") || "—")}</td></tr>`).join("\n");
  const palette = M.typeKeys.map((t) => `<tr data-voce="tipo:${t}"><td>${sw(M.types[t].color)}</td><td><b>${esc(M.types[t].name)}</b> <code>${t}</code></td>
<td>${esc(M.turretIds.filter((id) => M.turrets[id].type === t).map((id) => M.turrets[id].name).concat(t === "physical" ? ["guardiano"] : []).join(", "))}</td>
<td>${esc(M.enemyKeys.filter((k) => M.enemies[k].type === t).map((k) => M.lookName[M.enemies[k].look]).join(", ") || "—")}</td></tr>`).join("\n");
  const hexList = Object.entries(hexCount).sort((a, b) => b[1] - a[1]).map(([c, n]) => `<span class="hex">${sw(c)} ×${n}</span>`).join(" ");
  const hashRows = Object.entries(H.each).map(([f, h]) => `<code>${esc(f)}</code> ${h}`).join(" · ");
  const effectScenes = S.filter((s) => s.sec === 4).map((s) => { if (s.fns.length === 0 && !s.title) { const id = s.id.slice(8), d = M.turrets[id];
    s.title = d.name; s.desc = d.blurb + " · in scena al livello 3" + (FX_UPS[id] ? " con " + Object.keys(FX_UPS[id]).join(", ") : "") + ".";
    s.fns = M.fxKeys.filter((k) => (usage[k] || []).includes(id)).map((k) => "FX." + k).concat(M.behavDraw[id] ? [M.behavDraw[id]] : []); }
    return sceneHtml(s).replace('data-voce="scena:', `data-voce="effetti:${s.id.slice(8)}" data-x="scena:`); }).join("\n");

  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="catalogo-hash" content="${H.hash}">
<meta name="catalogo-versione" content="${esc(P.version)}">
<meta name="catalogo-data" content="${now.toISOString()}">
<title>Planet Defense · ${TITLE}</title>
<link rel="icon" type="image/png" href="${P.icons["icon-192.png"]}">
<style>
  :root { color-scheme: dark; --bg: #070b16; --panel: #101a33; --line: #2c4272; --text: #e8eefc; --muted: #9fb4d9; --dim: #6f82ad; --ok: #3fe0a0; --gold: #ffd166; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--text); font: 15px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
  header, main > section { max-width: 1240px; margin: 0 auto; padding: 0 16px; }
  header { padding-top: 24px; }
  h1 { margin: 0 0 4px; font-size: 28px; letter-spacing: .03em; }
  h2 { margin: 40px 0 8px; font-size: 21px; border-bottom: 1px solid var(--line); padding-bottom: 6px; }
  h3 { margin: 24px 0 8px; font-size: 16px; color: var(--muted); }
  p, li { color: #c9d6f0; max-width: 90ch; }
  a { color: #7fe8ff; }
  code { font: 12.5px ui-monospace, Menlo, monospace; color: #bfe9ff; background: rgba(63,224,255,.08); padding: 1px 4px; border-radius: 4px; }
  .facts { display: flex; flex-wrap: wrap; gap: 6px 18px; color: var(--muted); font-size: 13px; }
  .facts b { color: var(--text); }
  .hashes { font-size: 12px; color: var(--dim); }
  nav { display: flex; flex-wrap: wrap; gap: 6px; margin: 14px 0 0; }
  nav a { font-size: 13px; padding: 4px 10px; border: 1px solid var(--line); border-radius: 999px; text-decoration: none; color: var(--muted); }
  .rules { background: var(--panel); border: 1px solid var(--gold); border-radius: 12px; padding: 4px 18px; margin-top: 16px; }
  .rules li { margin: 6px 0; }
  .bar { position: sticky; top: 0; z-index: 9; background: rgba(7,11,22,.94); border-bottom: 1px solid var(--line); backdrop-filter: blur(6px); }
  .bar div { max-width: 1240px; margin: 0 auto; padding: 8px 16px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .bar button { font: 600 13px system-ui, sans-serif; color: var(--text); background: #13213f; border: 1.5px solid var(--line); border-radius: 8px; padding: 6px 12px; cursor: pointer; }
  .bar button.on { border-color: var(--ok); }
  .bar .clock { font: 13px ui-monospace, Menlo, monospace; color: var(--muted); margin-left: auto; }
  .grid { display: flex; flex-wrap: wrap; gap: 18px; align-items: flex-start; }
  .scene { margin: 0; width: 360px; }
  .scene .frame { width: 360px; height: 640px; border: 1px solid var(--line); border-radius: 6px; overflow: hidden; background: #0b1224; position: relative; }
  .scene iframe { width: 360px; height: 640px; border: 0; display: block; }
  .scene .ph { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; text-align: center; color: var(--dim); }
  .scene figcaption { font-size: 13px; color: #c9d6f0; margin-top: 6px; }
  .scene .rs { font-size: 12px; background: none; color: var(--muted); border: 1px solid var(--line); border-radius: 6px; cursor: pointer; padding: 0 6px; }
  .scene .err { display: block; color: #ff8a8a; }
  .tile { margin: 0; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px; background: #0b1224; border: 1px solid var(--line); border-radius: 8px; max-width: 380px; }
  .tile figcaption { font-size: 12px; color: var(--muted); text-align: center; }
  .anim { color: var(--ok); font-size: 11px; }
  table { border-collapse: collapse; width: 100%; font-size: 13.5px; margin: 8px 0; }
  th, td { text-align: left; vertical-align: top; padding: 7px 8px; border-bottom: 1px solid #1a2850; }
  th { color: var(--muted); font-weight: 700; }
  .chip { display: inline-block; padding: 1px 8px; border-radius: 999px; border: 1.5px solid var(--c); color: var(--c); font-weight: 700; font-size: 12px; }
  .sw { display: inline-block; width: 14px; height: 14px; border-radius: 3px; background: var(--c); border: 1px solid rgba(255,255,255,.25); vertical-align: -2px; margin-right: 3px; }
  .hex { display: inline-block; margin: 2px 10px 2px 0; font-size: 12px; color: var(--dim); }
  .todo { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
  .todo div { border: 1.5px dashed var(--line); border-radius: 10px; padding: 12px 14px; min-height: 120px; color: var(--dim); }
  .todo b { color: var(--text); }
  .icons { display: flex; gap: 16px; align-items: flex-end; flex-wrap: wrap; }
  .icons figure { margin: 0; text-align: center; font-size: 12px; color: var(--muted); }
  details pre { max-height: 70vh; overflow: auto; background: #0b1224; border: 1px solid var(--line); border-radius: 8px; padding: 12px; font: 12px/1.45 ui-monospace, Menlo, monospace; color: #c9d6f0; }
  footer { max-width: 1240px; margin: 48px auto 32px; padding: 0 16px; color: var(--dim); font-size: 12px; }
  @media (max-width: 400px) { .scene, .scene .frame, .scene iframe { width: 100%; } }
</style>
</head>
<body>
<header>
  <h1>Planet Defense · ${TITLE}</h1>
  <div class="facts"><span>Versione <b>${esc(P.version)}</b></span><span>Generato il <b>${date}</b></span><span>Hash <b>${H.hash.slice(0, 16)}</b></span><span>File: <code>${OUT_REL}</code> (<code>npm run ${ALT ? "catalog-hd2d" : "catalog"}</code>)</span></div>
  <p class="hashes">Hash completo ${H.hash} · ${hashRows}</p>
  <p>Tutto quello che si vede qui è disegnato dal codice del gioco: il modulo <code>${DRAW_FILE}</code> e lo script di <code>app/index.html</code>, incorporati in questa pagina.
  Ogni schermata è il gioco vero, fermato in uno stato preciso e mosso da un orologio che si controlla dalla barra (play/pausa, un fotogramma alla volta, rallentatore).
  Le tessere piccole usano le stesse funzioni (<code>TURRET_ART</code>, <code>drawEnemy</code>, <code>statusIcon</code>, <code>FX</code>…) con valori di esempio.</p>
  <section class="rules" id="vincoli" data-voce="vincoli">
    <h3>Vincoli per chi propone modifiche</h3>
    <ul>
      <li><b>Canvas 2D</b>, logico 360×640 (si scala allo schermo). Nessuno sprite e nessuna texture: solo forme semplici (rettangoli, cerchi, poligoni, linee, gradienti). Fanno eccezione solo le icone della PWA.</li>
      <li><b>Leggibilità a 360×640 su telefono</b>: nemici, proiettili e indicatori devono capirsi a colpo d’occhio, anche con 4 torrette e molti nemici insieme (§ 6 di questa pagina).</li>
      <li><b>Il colore indica il tipo di danno</b> (Force, Energy, Electric, Fire, Physical): torrette, loro effetti e nemici usano il colore del proprio tipo, perché serve per leggere resistenze e debolezze. Vedi la palette (§ 7).</li>
      <li><b>Grafica e testi originali</b>: il gioco è ispirato a un tower defense esistente ma non ne copia nomi, personaggi, disegni o aspetto.</li>
      <li>Nel gioco il personaggio si chiama <b>“guardiano”</b>. Testi in italiano, apostrofo tipografico ’ e virgolette “ ”.</li>
      <li>Le modifiche si propongono come <b>funzioni di <code>app/draw.js</code></b> con la stessa firma (stessi argomenti, nessun valore di ritorno nuovo); qui solo disegno, nessuna regola di gioco. Per un proiettile nuovo: una voce in <code>FX</code>. Prestazioni: tutto si ridisegna 60 volte al secondo.</li>
    </ul>
  </section>
  <nav><a href="#schermate">1 · Schermate</a><a href="#torrette">2 · Torrette, guardiano, equipaggiamento</a><a href="#nemici">3 · Nemici e stati</a><a href="#effetti">4 · Proiettili ed effetti</a>
  <a href="#carte">5 · Carte</a><a href="#prova">6 · Scena di prova</a><a href="#palette">7 · Palette</a><a href="#codice">Codice</a></nav>
</header>
<div class="bar" id="barra"><div>
  <button id="bPlay" class="on">⏸ Pausa</button><button id="bStep">+1 fotogramma</button><button id="bStep10">+10</button>
  <button id="bSlow">Rallentatore ×¼</button><button id="bReset">↺ Riavvia tutto</button>
  <span class="clock" id="clock">fotogramma 0 · 0,00 s</span>
</div></div>
<main>
<section id="schermate"><h2>1 · Schermate</h2>
<p>Canvas a 360×640 in tutti gli stati, poi le due schermate HTML (iniziale e salvataggio), riprodotte con lo stesso markup e gli stessi CSS di <code>index.html</code>.
Funzioni principali: <code>draw</code> (sfondo, cupola, torrette, nemici, effetti, HUD), <code>menuScreen</code>, <code>upgradeScreen</code>, <code>pauseScreen</code>, <code>wonScreen</code>, <code>lostScreen</code>, <code>drawAlert</code>.</p>
<div class="grid">
${scenesOf(1)}
</div>
<h3>Icone della PWA</h3>
<div class="icons" data-voce="icone">${Object.entries(P.icons).map(([f, u]) => `<figure><img src="${u}" alt="" width="${f.includes("180") ? 90 : f.includes("192") ? 96 : 128}"><figcaption><code>${f}</code></figcaption></figure>`).join("")}</div>
</section>

<section id="torrette"><h2>2 · Torrette, guardiano, equipaggiamento</h2>
<p>Ogni torretta ha una forma propria (<code>TURRET_ART</code>: x = centro, g = suolo, c = colore del tipo) su corpo <code>BODY</code>/<code>BODY2</code>; <code>drawTurret</code> aggiunge sotto il livello (“L2 1/3”, “★” al massimo).
Dimensioni misurate sul disegno (larghezza × altezza in px logici). Proiettili ed effetti di ciascuna: § 4.</p>
<div class="grid">${tilesOf(/^arte:|^guardiano/)}</div>
<table><thead><tr><th>Torretta</th><th>Tipo di danno</th><th>Funzioni che la disegnano</th><th>Dimensioni</th><th>Colori</th></tr></thead><tbody>
${turretRows}
<tr data-voce="torretta:guardiano"><td><b>Guardiano</b><br><code>player</code></td><td>${typeChip("physical")}</td><td><code>drawPlayer</code> · <code>guardianShape</code> ${dl(/^function guardianShape\(/)}<br>effetti: <code>FX.guardBullet</code>${M.fxKeys.includes("laserSpin") ? " <code>FX.laserSpin</code>" : ""} (combo)</td>
<td>${sizeTxt("guardiano")}</td><td>${sw("#2a3f6e")} ${sw(M.types.physical.color)} · in frenesia ${sw("#6a3a2a")} ${sw("#ff9a5a")}</td></tr>
</tbody></table>
<h3 data-voce="equipaggiamento">Equipaggiamento del guardiano</h3>
<p>6 pezzi (${Object.values(M.pieces || {}).join(", ")}) in 5 rarità (${(M.rarity || []).join(", ")}): il colore è quello della rarità (<code>rarColor</code>),
l’ancestrale è iridescente e cambia colore col tempo. Icone dei pezzi <code>PIECE_ART</code> / <code>pieceIcon</code> ${dl(/^function pieceIcon\(/)}, nella schermata
“Equipaggiamento” e nella vittoria (§ 1).</p>
<div class="grid">${tilesOf(/^pezzo:/)}</div>
<h3 data-voce="moduli">Moduli (chip)</h3>
<p>Un tipo per pezzo, stesse 5 rarità. Icona a chip (<code>modIcon</code> ${dl(/^function modIcon\(/)}): piedini, nucleo del colore della rarità e iniziale del pezzo.</p>
<div class="grid">${tilesOf(/^modulo:/)}</div>
</section>

<section id="nemici"><h2>3 · Nemici e stati</h2>
<p>Sette aspetti a tema spaziale (<code>drawEnemy</code> ${dl(/^function drawEnemy\(/)}): il colore è quello del tipo di danno, la forma cambia con <code>look</code>. Mini-boss e boss finale hanno il contorno dorato.
Sopra il nemico: barra della vita (se ferito, sempre per i boss) e indicatori di stato (<code>drawStatus</code>, <code>STATUS_ICONS</code>).</p>
<div class="grid">${tilesOf(/^nemico:|^colpito|^ferito/)}</div>
<h3>Mini-boss (nave aliena) e boss finale (nave madre) nei cinque tipi</h3>
<div class="grid">${tilesOf(/^nave:|^madre:/)}</div>
<table><thead><tr><th>Aspetto</th><th>Nemici (id nel codice)</th><th>Tipo</th><th>Raggio · dimensioni</th></tr></thead><tbody>
${enemyRows}
</tbody></table>
<h3>Indicatori di stato</h3>
<p>Freccia viola = rallentamento, fulmine giallo = paralisi, cerchio con meno = indebolimento, mirino rosso = vulnerabilità, fiamma arancione = bruciatura, linee ondulate (una per pila) = distruzione (DESIGN.md § 6).</p>
<div class="grid">${tilesOf(/^stato:|^pile:|^tutti-gli-stati/)}</div>
<div class="grid" style="margin-top:18px">
${scenesOf(3)}
</div>
</section>

<section id="effetti"><h2>4 · Proiettili ed effetti</h2>
<p>Ogni proiettile o effetto è un’entità temporanea della logica; il suo aspetto sta in <code>FX</code> (draw.js). Qui sotto ogni funzione da sola, animata dall’orologio della barra, poi ogni torretta in azione su nemici fermi e immortali.
I numeri fluttuanti (danno) compaiono in tutte le scene di battaglia.</p>
<div class="grid">${tilesOf(/^fx:|^parte:/)}</div>
<table><thead><tr><th>Funzione</th><th>Cosa disegna</th><th>Usata da</th></tr></thead><tbody>
${fxRows}
</tbody></table>
<div class="grid" style="margin-top:18px">
${effectScenes}
</div>
</section>

<section id="carte"><h2>5 · Carte</h2>
<p>Le carte come le disegna <code>upgradeScreen</code> (e <code>rewardScreen</code> per la ricompensa del mini-boss): Standard, Chain, Level up, Combo, più “Nuova torretta”.</p>
<div class="grid" data-voce="carte:Standard carte:Chain carte:Level up carte:Combo">
${scenesOf(5)}
</div>
</section>

<section id="prova"><h2>6 · Scena di prova</h2>
<div class="grid">
${scenesOf(6)}
</div>
</section>

<section id="palette"><h2>7 · Palette</h2>
<p>Colore = tipo di danno (DESIGN.md § 6). Valori in <code>TYPES</code> (index.html).</p>
<table><thead><tr><th>Colore</th><th>Tipo</th><th>Torrette</th><th>Nemici</th></tr></thead><tbody>
${palette}
</tbody></table>
<h3>Colori base delle torrette</h3>
<p data-voce="base">${sw(M.base.BODY, "BODY " + M.base.BODY)} · ${sw(M.base.BODY2, "BODY2 " + M.base.BODY2)} · ${sw(M.base.DARK, "DARK " + M.base.DARK)}</p>
<h3>Tutti i colori scritti in draw.js (con quante volte compaiono)</h3>
<p>${hexList}</p>
</section>

<section id="codice"><h2>Codice di disegno</h2>
<p>Il modulo completo, così com’è in <code>${DRAW_FILE}</code>. Lo script del gioco (<code>index.html</code>) è incorporato più sotto in forma non visibile e serve alle scene.</p>
<details><summary>${DRAW_FILE} (${(ALT ? P.drawHd : P.draw).split("\n").length} righe)</summary><pre>${esc(ALT ? P.drawHd : P.draw)}</pre></details>
</section>
</main>
<footer>Planet Defense ${esc(P.version)} · catalogo generato da <code>tests/tools/catalog.js</code> · se un file del gioco cambia, <code>npm test</code> lo rigenera e un test controlla che non sia indietro.</footer>
<iframe id="atelier" title="atelier" aria-hidden="true" style="position:absolute;left:-10000px;top:0;width:720px;height:1280px;border:0;visibility:hidden"></iframe>
<script type="text/plain" id="src-css">${P.css}</script>
<script type="text/plain" id="src-markup">${P.markup}</script>
<script type="text/plain" id="src-draw">${P.draw}</script>
<script type="text/plain" id="src-draw-hd">${P.drawHd}</script>
<script type="text/plain" id="src-game">${P.game}</script>
<script type="application/json" id="data-gfx">${JSON.stringify(P.gfx)}</script>
<script type="application/json" id="data-scenes">${JSON.stringify(S.map((s) => ({ id: s.id, cfg: s.cfg }))).replace(/</g, "\\u003c")}</script>
<script type="application/json" id="data-tiles">${JSON.stringify(T.map((t) => ({ key: t.key, voce: t.voce, code: t.code, box: t.box, zoom: t.zoom, anim: t.anim }))).replace(/</g, "\\u003c")}</script>
<script>
"use strict";
const harness = ${harness};
const buildDoc = ${buildDoc};
(${clientRuntime})();
</script>
</body>
</html>
`;
}

/* ---------- nel browser: scene, tessere e orologio ---------- */
function clientRuntime() {
  const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
  const P = { css: $("#src-css").textContent, markup: $("#src-markup").textContent, draw: $("#src-draw").textContent, drawHd: $("#src-draw-hd").textContent,
    gfx: JSON.parse($("#data-gfx").textContent), game: $("#src-game").textContent };
  const CFG = Object.fromEntries(JSON.parse($("#data-scenes").textContent).map((s) => [s.id, s.cfg]));
  const TILES = JSON.parse($("#data-tiles").textContent);
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  let playing = true, slow = false, acc = 0, tick = 0;
  const live = new Map();                         // figura → iframe della scena visibile
  function mount(fig) {
    const fr = document.createElement("iframe"), box = fig.querySelector(".frame");
    fr.title = fig.querySelector("b").textContent; fr.srcdoc = buildDoc(P, CFG[fig.dataset.scene]);
    fr.addEventListener("load", () => { fig.dataset.ready = "1"; report(fig, fr); });
    box.textContent = ""; box.appendChild(fr); fig.dataset.ready = ""; return fr;
  }
  function report(fig, fr) {
    const c = fr.contentWindow && fr.contentWindow.__cat, e = fig.querySelector(".err");
    if (c && c.errors.length) { e.hidden = false; e.textContent = "Errore: " + c.errors.join("; "); }
  }
  const io = new IntersectionObserver((list) => {
    for (const en of list) {
      const fig = en.target;
      if (en.isIntersecting) { if (!fig.querySelector("iframe")) mount(fig); live.set(fig, fig.querySelector("iframe")); }
      else live.delete(fig);
    }
  }, { rootMargin: "300px 0px" });
  $$("figure.scene").forEach((fig) => {
    io.observe(fig);
    fig.querySelector(".rs").addEventListener("click", () => { const fr = mount(fig); if (live.has(fig)) live.set(fig, fr); });
  });
  // tessere: disegnate dall’atelier e copiate
  const at = $("#atelier"); let atReady = false;
  at.srcdoc = buildDoc(P, { progress: { cleared: 23, seen: [] } });
  const tileFig = Object.fromEntries($$("figure.tile").map((f) => [f.dataset.tile, f]));
  const visibleTiles = new Set();
  const tio = new IntersectionObserver((list) => { for (const en of list) (en.isIntersecting ? visibleTiles.add(en.target.dataset.tile) : visibleTiles.delete(en.target.dataset.tile)); });
  Object.values(tileFig).forEach((f) => tio.observe(f));
  function paint(t) {
    const fig = tileFig[t.key]; if (!fig || !atReady) return;
    const cv = fig.querySelector("canvas"), w = Math.round(t.box[2] * t.zoom), h = Math.round(t.box[3] * t.zoom);
    if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    try {
      const src = at.contentWindow.__cat.tile(t.key, t.code, tick / 60, t.box, t.zoom * dpr), x = cv.getContext("2d");
      x.clearRect(0, 0, cv.width, cv.height); x.drawImage(src, 0, 0, cv.width, cv.height, 0, 0, cv.width, cv.height);
    } catch (e) { fig.querySelector("figcaption").textContent += " · errore: " + e.message; t.anim = false; t.broken = true; }
  }
  at.addEventListener("load", () => { atReady = true; TILES.forEach(paint); });
  // orologio
  const clock = $("#clock");
  function advance(n) {
    tick += n;
    for (const [fig, fr] of live) { const c = fr.contentWindow && fr.contentWindow.__cat; if (c && fig.dataset.ready) { const before = c.errors.length; c.step(n); if (c.errors.length !== before) report(fig, fr); } }
    for (const t of TILES) if (t.anim && visibleTiles.has(t.key)) paint(t);
    clock.textContent = "fotogramma " + tick + " · " + (tick / 60).toFixed(2).replace(".", ",") + " s";
  }
  function loop() { requestAnimationFrame(loop); if (!playing) return; acc += slow ? 0.25 : 1; while (acc >= 1) { acc -= 1; advance(1); } }
  requestAnimationFrame(loop);
  const bPlay = $("#bPlay"), bSlow = $("#bSlow");
  bPlay.addEventListener("click", () => { playing = !playing; bPlay.textContent = playing ? "⏸ Pausa" : "▶ Play"; bPlay.classList.toggle("on", playing); });
  $("#bStep").addEventListener("click", () => { playing = false; bPlay.textContent = "▶ Play"; bPlay.classList.remove("on"); advance(1); });
  $("#bStep10").addEventListener("click", () => { playing = false; bPlay.textContent = "▶ Play"; bPlay.classList.remove("on"); advance(10); });
  bSlow.addEventListener("click", () => { slow = !slow; bSlow.classList.toggle("on", slow); });
  $("#bReset").addEventListener("click", () => { tick = 0; $$("figure.scene").forEach((fig) => { if (fig.querySelector("iframe")) { const fr = mount(fig); if (live.has(fig)) live.set(fig, fr); } }); TILES.forEach(paint); });
}

/* ---------- avvio ---------- */
function main() {
  const H = computeHash(), old = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : null;
  if (!process.argv.includes("--force") && writtenHash(old) === H.hash) { console.log("Catalogo grafico: non cambiato (hash " + H.hash.slice(0, 16) + ")"); return; }
  const P = parts(), M = meta(P), S = scenes(M.turretIds), T = tiles(M);
  verify(P, S);
  fs.writeFileSync(OUT, page(P, M, S, T, H));
  console.log("Catalogo grafico" + (ALT ? " alternativo" : "") + ": rigenerato → " + OUT_REL);
  console.log("  versione " + P.version + " · hash " + H.hash + " · " + S.length + " scene · " + T.length + " tessere · " + Math.round(fs.statSync(OUT).size / 1024) + " KB");
}
module.exports = { computeHash, writtenHash, parts, meta, OUT, buildDoc };
if (require.main === module) main();
