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
];
for (const [name, keys, pre] of groups) {
  const miss = keys.filter((k) => !html.includes('data-voce="' + pre + k + '"'));
  console.log(name + ": " + (keys.length - miss.length) + "/" + keys.length + " nel catalogo", ok(keys.length > 0 && !miss.length) + (miss.length ? " mancano: " + miss.join(", ") : ""));
}
const fixed = ["vincoli", "scena:menu", "scena:splash-start", "scena:salvataggio-conferma", "scena:prova", "scena:miniboss", "scena:boss-finale", "guardiano", "base", "icone", "futuro:ranger", "futuro:equipaggiamento", "futuro:moduli"];
const missF = fixed.filter((v) => !html.includes('data-voce="' + v + '"'));
console.log("sezioni fisse: " + (fixed.length - missF.length) + "/" + fixed.length, ok(!missF.length) + (missF.length ? " mancano: " + missF.join(", ") : ""));
dom.window.close();
