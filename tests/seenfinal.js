const { makeGame, seeded } = require("./bot.js");
const P = (h, ...pairs) => pairs.reduce((a, [x, y]) => { if (!a.includes(x)) throw new Error("manca: " + x.slice(0, 60)); return a.replace(x, y); }, h);
const NORMAL = ["saucer", "shard", "meteor", "rock", "asteroid", "ship:fire", "ship:energy", "ship:electric", "ship:force", "ship:physical"];
const ok = (c) => c ? "✓" : "✗ ERRORE";
const snap = (g) => { g.texts.length = 0; g.frame(); return [...g.texts]; };
console.log("— scheda Nemici: boss finale per tipo (livello 10 = Energy, livello 20 = Electric) —");
for (const [L, seen, expectKnown, label] of [[10, [...NORMAL, "mothership:energy"], true, "livello 10, visto il boss Energy"], [20, [...NORMAL, "mothership:energy"], false, "livello 20, visto solo il boss Energy"], [10, [...NORMAL, "mothership"], false, "salvataggio vecchio con “mothership”"]]) {
  const g = makeGame({ seed: 3, cleared: L - 1, level: L, seen }); g.key("Enter"); g.frame(); g.key("p"); const T = snap(g);
  const known = T.some((s) => s.startsWith("Boss finale · nave madre")), unk = T.includes("Boss finale sconosciuto");
  console.log(label.padEnd(38), "| dettagli:", known, "| sconosciuto:", unk, ok(expectKnown ? known && !unk : unk && !known), g.errors.length ? g.errors[0] : "");
}
console.log("— avviso per il boss finale di tipo nuovo —");
const strong = (h) => P(h, ["domeHp: 100,", "domeHp: 1000000,"], ["startTurrets: [],", 'startTurrets: ["rail","beam","hive","tesla"],'],
  ["META.startTurrets.slice(0, 4).forEach((id, i) => { slots[i] = makeShooter(TURRETS[id], SLOT_X[i], GROUND_Y - 14); });", "META.startTurrets.slice(0, 4).forEach((id, i) => { slots[i] = makeShooter(TURRETS[id], SLOT_X[i], GROUND_Y - 14); }); slots.forEach(s => { s.up.dmg = 3; });"]);
function alerts(L, seen) {
  const g = makeGame({ seed: 6, patch: strong, cleared: L - 1, level: L, seen }); g.key("Enter"); const r = seeded(2); const got = [];
  for (let f = 0; f < 200000; f++) {
    if (f % 90 === 0) g.click(30 + r() * 300, 120);
    g.frame(); const T = g.texts; const i = T.indexOf("Nuovo nemico: ");
    if (i >= 0) { const k = T[i + 1] + " " + T[i + 2]; if (!got.includes(k)) got.push(k); }
    if (T.includes("Ricompensa mini-boss") && T.includes("Continua")) g.key("1");
    if (T.includes("Scegli un potenziamento")) g.key("1");
    const done = T.includes("LIVELLO SUPERATO") || T.includes("CUPOLA DISTRUTTA"); T.length = 0; if (done) break;
  }
  return { got, saved: JSON.parse(g.win.localStorage.getItem("fortress-progress-v1")).seen.filter((k) => k.startsWith("mothership")), errors: g.errors };
}
const a = alerts(20, [...NORMAL, "mothership:energy"]);
console.log("livello 20 con il boss Energy già visto → avvisi:", a.got.join(" | ") || "nessuno", "| salvati:", a.saved.join(", "), ok(a.got.length === 1 && a.got[0].includes("Nave madre") && a.got[0].includes("Electric")));
const b = alerts(10, [...NORMAL, "mothership:energy"]);
console.log("livello 10 con il boss Energy già visto → avvisi:", b.got.join(" | ") || "nessuno", ok(b.got.length === 0));
console.log("errori JS:", [...a.errors, ...b.errors].length ? [...a.errors, ...b.errors][0] : "nessuno");
