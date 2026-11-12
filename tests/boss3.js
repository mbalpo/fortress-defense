const { makeGame, seeded } = require("./bot.js");
const P = (h, ...pairs) => pairs.reduce((a, [x, y]) => { if (!a.includes(x)) throw new Error("manca: " + x.slice(0, 60)); return a.replace(x, y); }, h);
const patch = (h) => P(h, ["domeHp: 100,", "domeHp: 1000000,"], ["startTurrets: [],", 'startTurrets: ["rail","beam","hive","tesla"],'],
  ["META.startTurrets.slice(0, 4).forEach((id, i) => { slots[i] = makeShooter(TURRETS[id], SLOT_X[i], GROUND_Y - 14); });",
   "META.startTurrets.slice(0, 4).forEach((id, i) => { slots[i] = makeShooter(TURRETS[id], SLOT_X[i], GROUND_Y - 14); }); slots.forEach(s => { s.up.dmg = 3; });"]);
function run(label, cleared, level, key) {
  const g = makeGame({ seed: 6, patch, cleared, level }); g.key(key); g.frame(); const r = seeded(2);
  const mini = new Set(), fin = new Set(), banner = new Set(); let wave = 1, rew = 0, prevR = false, bigBar = false, end = "", maxHpSeen = 0;
  for (let f = 0; f < 260000; f++) {
    if (f % 90 === 0) g.click(30 + r() * 300, 120);
    g.frame(); const T = g.texts;
    for (const s of T) { const m = /^Ondata (\d+)\/20$/.exec(s); if (m) wave = +m[1]; }
    if (T.includes("MINI-BOSS")) mini.add(wave); if (T.includes("BOSS FINALE")) fin.add(wave);
    if (T.includes("Boss finale in arrivo")) banner.add(wave);
    const rr = T.includes("Ricompensa mini-boss"); if (rr && !prevR) rew++; prevR = rr;
    if (T.includes("Ricompensa mini-boss") && T.includes("Continua")) g.key("1");
    const ui = T.lastIndexOf("Scegli un potenziamento"); if (ui >= 0) g.key("1");
    const done = T.includes("LIVELLO SUPERATO") ? "vinto" : T.includes("CUPOLA DISTRUTTA") ? "perso" : ""; T.length = 0; if (done) { end = done; break; }
  }
  console.log(label.padEnd(26), "mini-boss alle ondate:", ([...mini].join(",") || "—").padEnd(9), "| boss finale all’ondata:", ([...fin].join(",") || "—").padEnd(3), "| ricompense:", rew, "|", end, g.errors.length ? g.errors[0] : "");
}
run("livello 9", 8, 9, "Enter");
run("livello 10 (multiplo di 10)", 9, 10, "Enter");
run("livello 11", 10, 11, "Enter");
run("livello 20", 19, 20, "Enter");
run("Epica livello 1", 50, 1, "e");
run("Epica livello 10", 50, 10, "e");
