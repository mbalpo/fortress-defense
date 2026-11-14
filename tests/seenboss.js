const { makeGame, seeded } = require("./bot.js");
const P = (h, ...pairs) => pairs.reduce((a, [x, y]) => { if (!a.includes(x)) throw new Error("manca: " + x.slice(0, 60)); return a.replace(x, y); }, h);
const NORMAL = ["saucer", "shard", "meteor", "rock", "asteroid"];
const ok = (c) => c ? "✓" : "✗ ERRORE";
const strong = (h) => P(h, ["domeHp: 100,", "domeHp: 1000000,"], ["startTurrets: [],", 'startTurrets: ["rail","beam","hive","tesla"],'],
  ["META.startTurrets.slice(0, 4).forEach((id, i) => { slots[i] = makeShooter(TURRETS[id], SLOT_X[i], GROUND_Y - 14); });", "META.startTurrets.slice(0, 4).forEach((id, i) => { slots[i] = makeShooter(TURRETS[id], SLOT_X[i], GROUND_Y - 14); }); slots.forEach(s => { s.up.dmg = 3; });"]);
const snap = (g) => { g.texts.length = 0; g.frame(); return [...g.texts]; };

console.log("— scheda Nemici, livello 13 (mini-boss Physical, Fire, Energy) —");
for (const [label, seen] of [["visto solo il mini-boss Physical", [...NORMAL, "ship:physical"]], ["salvataggio vecchio con “ship” generico", [...NORMAL, "ship"]]]) {
  const g = makeGame({ seed: 3, cleared: 12, level: 13, seen }); g.key("Enter"); g.frame(); g.key("p"); const T = snap(g);
  const head = T.find((s) => s.includes("scoperti")), unknownLines = T.map((s, i) => s === "tipo sconosciuto" ? T[i - 1] : null).filter(Boolean);
  const detail = T.includes("Ondata 5: "), allUnknown = T.includes("Mini-boss sconosciuti");
  console.log(label.padEnd(40), "|", head.split(" · ").pop(), "| dettagli ondata 5:", detail, "| ondate sconosciute:", unknownLines.map((s) => s.split(":")[0]).join(", ") || "—", "| tutti sconosciuti:", allUnknown,
    ok(seen.includes("ship") ? allUnknown && head.endsWith("5 su 8") : detail && unknownLines.length === 2 && head.endsWith("6 su 8")));
}
console.log("— avvisi per tipo di mini-boss —");
function alertsIn(level, storage) {
  const g = makeGame({ seed: 6, patch: strong, cleared: level - 1, level, storage }); g.key("Enter"); const r = seeded(2); const got = [];
  for (let f = 0; f < 200000; f++) {
    if (f % 90 === 0) g.tap(30 + r() * 300, 120);
    g.frame(); const T = g.texts; const i = T.indexOf("Nuovo nemico: ");
    if (i >= 0) { const k = T[i + 1] + " " + T[i + 2]; if (!got.includes(k)) got.push(k); }
    if (T.includes("Ricompensa mini-boss") && T.includes("Continua")) g.key("1");
    if (T.includes("Scegli un potenziamento")) g.key("1");
    const done = T.includes("LIVELLO SUPERATO") || T.includes("CUPOLA DISTRUTTA"); T.length = 0; if (done) break;
  }
  return { got, store: g.win.localStorage.getItem("fortress-progress-v1"), errors: g.errors };
}
const a = alertsIn(13, { "fortress-progress-v1": JSON.stringify({ cleared: 12, seen: NORMAL }) });
console.log("livello 13 → avvisi:", a.got.join(" | "), ok(a.got.length === 3 && a.got.every((s) => s.startsWith("Nave aliena"))));
console.log("   salvati:", JSON.parse(a.store).seen.filter((k) => k.startsWith("ship")).join(", "));
const b = alertsIn(14, { "fortress-progress-v1": a.store });
console.log("livello 14 (Fire, Energy già visti; Electric nuovo) → avvisi:", b.got.join(" | ") || "nessuno", ok(b.got.length === 1 && b.got[0].includes("Electric")));
console.log("errori JS:", [...a.errors, ...b.errors].length ? [...a.errors, ...b.errors][0] : "nessuno");
