const { makeGame, seeded } = require("../bot.js");
const P = (h, ...pairs) => pairs.reduce((a, [x, y]) => { if (!a.includes(x)) throw new Error("manca: " + x.slice(0, 50)); return a.replace(x, y); }, h);
const ids = ["sky","laser","disr","aero","thunder","beam","wheel","hive","rail","tesla","vortex"];
function measure(id, extra) {
  const patch = (h) => {
    let x = P(h, ["startTurrets: [],", `startTurrets: ["${id}"],`], ["domeHp: 100,", "domeHp: 1000000,"], ["options = rollOptions();", "options = [];"], ["p.cd = 0.4 * (f ? 0.55 : 1);", "p.cd = 99999;"]);
    for (const [a, b] of extra || []) x = P(x, [a, b]);
    return x;
  };
  const g = makeGame({ seed: 11, patch, cleared: 9, level: 10 }); g.key("Enter"); g.frame();
  const r = seeded(2); let wave = 1;
  for (let f = 0; f < 18000; f++) {            // 5 minuti
    if (f % 90 === 0) g.tap(30 + r() * 300, 400);
    g.frame();
    for (const s of g.texts) { const m = /^Ondata (\d+)\/20$/.exec(s); if (m) wave = Math.max(wave, +m[1]); }
    if (g.texts.includes("LIVELLO SUPERATO")) { wave = 21; break; }
    g.texts.length = 0;
  }
  return wave;
}
console.log("ondata raggiunta in 5 min, torretta da sola senza potenziamenti, livello 10 (21 = livello superato)");
for (const id of ids) console.log(id.padEnd(8), measure(id));
console.log("— Disruption Drone con danno base ridotto —");
for (const d of [14, 10, 8, 6, 4]) console.log("danno", String(d).padStart(2), "→ ondata", measure("disr", [["dmg = 14 * dmgM(s)", `dmg = ${d} * dmgM(s)`]]));
