const { makeGame, seeded } = require("./bot.js");
const P = (h, ...pairs) => pairs.reduce((a, [x, y]) => { if (!a.includes(x)) throw new Error("manca: " + x.slice(0, 60)); return a.replace(x, y); }, h);
const patch = (h) => P(h, ["requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__x = { getPlayer: () => player, getSlots: () => slots, state: () => state };\n})();"],
  ["domeHp: 100,", "domeHp: 1000000,"], ["startTurrets: [],", 'startTurrets: ["rail","beam","hive","tesla"],'],
  ["META.startTurrets.slice(0, 4).forEach((id, i) => { slots[i] = makeShooter(TURRETS[id], SLOT_X[i], GROUND_Y - 14); });",
   "META.startTurrets.slice(0, 4).forEach((id, i) => { slots[i] = makeShooter(TURRETS[id], SLOT_X[i], GROUND_Y - 14); }); slots.forEach(s => { s.up.dmg = 3; });"]);
const g = makeGame({ seed: 6, patch, cleared: 10, level: 11 }); g.key("Enter"); g.frame(); const r = seeded(2);
const X = g.win.__x;
const total = () => [X.getPlayer(), ...X.getSlots()].filter(Boolean).reduce((a, s) => a + Object.values(s.up).reduce((p, q) => p + q, 0) + (s.id === "player" ? 0 : 0), 0) + X.getSlots().filter(Boolean).length;
let before = null, screens = 0, wave = 1; const log = [];
for (let f = 0; f < 200000; f++) {
  if (f % 90 === 0) g.click(30 + r() * 300, 120);
  g.frame(); const T = g.texts;
  for (const s of T) { const m = /^Ondata (\d+)\/20$/.exec(s); if (m) wave = +m[1]; }
  const ui = T.lastIndexOf("Scegli un potenziamento");
  if (ui >= 0) { before = total(); g.key("1"); }
  else if (T.includes("Ricompensa mini-boss") && T.includes("Continua")) {
    const cards = T.filter((x) => x === "✓").length, after = total(); screens++;
    log.push(`ondata ${wave}: carte mostrate ${cards}, potenziamenti applicati ${after - before} (1 scelta + ${after - before - 1} dal boss)`);
    g.key("1");
  }
  const done = T.includes("LIVELLO SUPERATO") || T.includes("CUPOLA DISTRUTTA"); T.length = 0; if (done) break;
}
console.log("schermate di ricompensa:", screens); log.forEach((l) => console.log(" ", l));
console.log("errori JS:", g.errors.length ? g.errors : "nessuno");
