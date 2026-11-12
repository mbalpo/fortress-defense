const { makeGame, seeded } = require("../bot.js");
const P = (h, ...pairs) => pairs.reduce((a, [x, y]) => { if (!a.includes(x)) throw new Error("manca: " + x.slice(0, 60)); return a.replace(x, y); }, h);
function run(label, extra, startTurrets, level) {
  const patch = (h) => { let x = P(h, ["requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__x = { slots: () => slots, enemies: () => enemies, state: () => state, rangeOf, dist };\n})();"],
    ["startTurrets: [],", `startTurrets: ${JSON.stringify(startTurrets)},`], ["domeHp: 100,", "domeHp: 1000000,"],
    ["function aeroFire(s) {", "function aeroFire(s) { window.__try = (window.__try || 0) + 1;"],
    ["  for (let k = 0; k < cnt; k++) {\n    const t = list[k % list.length], ft =", "  window.__shots = (window.__shots || 0) + 1;\n  for (let k = 0; k < cnt; k++) {\n    const t = list[k % list.length], ft ="]);
    for (const [a, b] of extra || []) x = P(x, [a, b]); return x; };
  const g = makeGame({ seed: 7, patch, cleared: level - 1, level }); g.key("Enter"); g.frame(); const r = seeded(4), X = g.win.__x;
  let frames = 0, inRange = 0, wave = 1;
  for (let f = 0; f < 60000; f++) {
    if (f % 90 === 0) g.click(30 + r() * 300, 120);
    g.frame(); const T = g.texts;
    for (const s of T) { const m = /^Ondata (\d+)\/20$/.exec(s); if (m) wave = +m[1]; }
    if (X.state() === "play") { frames++; const a = X.slots().find((t) => t && t.id === "aero"); if (a && X.enemies().some((e) => !e.dead && e.y >= 0 && X.dist(e.x, e.y, a.x, a.y) <= X.rangeOf(a) + e.def.r)) inRange++; }
    if (T.includes("Ricompensa mini-boss") && T.includes("Continua")) g.key("1");
    if (T.includes("Scegli un potenziamento")) g.key("1");
    const done = T.includes("LIVELLO SUPERATO") || T.includes("CUPOLA DISTRUTTA"); T.length = 0; if (done) break;
  }
  console.log(label.padEnd(44), `ondata ${wave} | tempo con un nemico a portata: ${(inRange / frames * 100).toFixed(0)}% | salve sparate: ${g.win.__shots || 0}`, g.errors.length ? g.errors[0] : "");
}
run("Aeroblast da sola", null, ["aero"], 10);
run("Aeroblast + Sky Guard, Railgun, Hive", null, ["aero", "sky", "rail", "hive"], 10);
run("Aeroblast + Laser, Beam, Teslacoil", null, ["aero", "laser", "beam", "tesla"], 10);
