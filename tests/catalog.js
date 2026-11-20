// Catalogo grafico (docs/catalogo-grafico.html): non deve essere indietro rispetto ai file del gioco e deve contenere ogni elemento disegnato.
// Le chiavi si leggono dal gioco vero (TURRETS, TURRET_ART, ENEMY_DEFS, STATUS_ICONS, FX); nel catalogo ogni voce ha un segno data-voce="…".
const fs = require("fs"), C = require("./tools/catalog.js");
const ok = (c) => c ? "✓" : "✗ ERRORE";
if (!fs.existsSync(C.OUT)) { console.log("catalogo mancante: " + C.OUT + " ✗ ERRORE (npm run catalog)"); process.exit(1); }
const html = fs.readFileSync(C.OUT, "utf8"), now = C.computeHash().hash, written = C.writtenHash(html);
console.log("hash del catalogo: " + (written || "nessuno").slice(0, 16) + " | file attuali: " + now.slice(0, 16), ok(written === now));
if (written !== now) console.log("  il catalogo è indietro: npm run catalog (o npm test, che lo rigenera prima dei test)");

const { JSDOM } = require("jsdom");
const dom = new JSDOM(C.buildDoc(C.parts(), {}), { runScripts: "dangerously", pretendToBeVisual: true, url: "http://localhost/" });
const ev = (c) => dom.window.__ev(c);
const groups = [
  ["torrette (TURRETS)", ev("Object.keys(TURRETS)"), "torretta:"],
  ["disegni (TURRET_ART)", ev("Object.keys(DRAW.TURRET_ART)"), "arte:"],
  ["effetti per torretta", ev("Object.keys(TURRETS)"), "effetti:"],
  ["nemici (ENEMY_DEFS)", ev("Object.keys(ENEMY_DEFS)"), "nemico:"],
  ["stati (STATUS_ICONS)", ev("DRAW.STATUS_ICONS.map((s) => s[0])"), "stato:"],
  ["proiettili ed effetti (FX)", ev("Object.keys(FX)"), "fx:"],
  ["tipi di danno (TYPES)", ev("Object.keys(TYPES)"), "tipo:"],
  ["pezzi dell’equipaggiamento (PIECES)", ev("PIECE_IDS"), "pezzo:"],
  ["Moduli (modIcon)", ev("PIECE_IDS"), "modulo:"],
];
for (const [name, keys, pre] of groups) {
  const miss = keys.filter((k) => !html.includes('data-voce="' + pre + k + '"'));
  console.log(name + ": " + (keys.length - miss.length) + "/" + keys.length + " nel catalogo", ok(keys.length > 0 && !miss.length) + (miss.length ? " mancano: " + miss.join(", ") : ""));
}
const fixed = ["vincoli", "scena:menu", "scena:splash-start", "scena:salvataggio-conferma", "scena:prova", "scena:miniboss", "scena:boss-finale", "guardiano", "base", "icone", "futuro:ranger", "equipaggiamento", "moduli"];
const missF = fixed.filter((v) => !html.includes('data-voce="' + v + '"'));
console.log("sezioni fisse: " + (fixed.length - missF.length) + "/" + fixed.length, ok(!missF.length) + (missF.length ? " mancano: " + missF.join(", ") : ""));
dom.window.close();

// la pagina nel browser: buildDoc e i pezzi del gioco presi dalla pagina stessa (come fa clientRuntime), in entrambi i cataloghi.
// 1.13.1: buildDoc usava ALT, che nel browser non esiste → tutte le scene e le tessere rotte, mentre la verifica in Node passava.
const path = require("path");
for (const file of [C.OUT, path.join(path.dirname(C.OUT), "catalogo-grafico-alternativo.html")]) {
  const name = path.basename(file);
  if (!fs.existsSync(file)) { console.log(name + ": mancante ✗ ERRORE"); continue; }
  const page = fs.readFileSync(file, "utf8"), code = page.match(/const harness = ([\s\S]*?);\nconst buildDoc = ([\s\S]*?);\n\(function clientRuntime/);
  const doc = new JSDOM(page.replace(/<script>\s*"use strict";[\s\S]*?<\/script>\s*<\/body>/, "</body>")).window.document, $ = (q) => doc.querySelector(q);
  let errs = [], gfx = "?";
  try {
    // ambito come nel browser: solo harness accanto a buildDoc, nessuna variabile del generatore
    const buildDoc = new Function("const harness = " + code[1] + "; return (" + code[2] + ");")();
    const P = { css: $("#src-css").textContent, markup: $("#src-markup").textContent, draw: $("#src-draw").textContent, drawHd: $("#src-draw-hd").textContent,
      gfx: JSON.parse($("#data-gfx").textContent), game: $("#src-game").textContent };
    const cfg = JSON.parse($("#data-scenes").textContent).find((s) => s.id === "battaglia").cfg;
    const w = new JSDOM(buildDoc(P, cfg), { runScripts: "dangerously", pretendToBeVisual: true, url: "http://localhost/" }).window;
    w.__cat.step(10); errs = w.__cat.errors; gfx = w.__ev("DRAW.GFX_ON"); w.close();
  } catch (e) { errs = [e.message]; }
  const want = name.includes("alternativo") ? "hd2d" : "classic";
  // 1.19.1: ogni tessera ha davvero un disegno (FX.ranger, FX.prismRay, FX.husk… avevano la tessera vuota)
  const empty = JSON.parse($("#data-tiles").textContent).filter((t) => !String(t.code || "").trim()).map((t) => t.voce || t.key);
  console.log(name + ": tessere senza disegno " + (empty.length ? empty.join(", ") : "nessuna"), ok(!empty.length));
  console.log(name + " nel browser: scena “battaglia” " + (errs.length ? "errori: " + errs.join("; ") : "senza errori") + " | grafica " + gfx, ok(!errs.length && gfx === want));
}
