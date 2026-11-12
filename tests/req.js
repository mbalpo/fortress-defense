const { makeGame, seeded } = require("./bot.js");
const P = (h, ...pairs) => pairs.reduce((a, [x, y]) => { if (!a.includes(x)) throw new Error("manca: " + x.slice(0, 60)); return a.replace(x, y); }, h);
const expose = (h) => P(h, ["requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__x = { getPlayer: () => player, state: () => state, spawn, enemies: () => enemies, getSlots: () => slots };\n})();"]);
const base = (extra) => (h) => { let x = P(expose(h), ["domeHp: 100,", "domeHp: 1000000,"], ["options = rollOptions();", "options = [];"]); for (const [a, b] of extra || []) x = P(x, [a, b]); return x; };
const withPlayer = (ups) => ["player.targetX = W / 2; player.cd = 0.3;", `player.targetX = W / 2; player.cd = 0.3; Object.assign(player.up, ${JSON.stringify(ups)});`];

console.log("— Personaggio: frenesia —");
function frenzy(label, ups) {
  const patch = base([withPlayer(ups), ["p.cd += PLAYER.interval / (has(p, \"rate3\") ? 1.2 : 1) / (f ? (has(p, \"fspd\") ? FRENZY.rateFast : FRENZY.rate) : 1);", "p.cd += PLAYER.interval / (has(p, \"rate3\") ? 1.2 : 1) / (f ? (has(p, \"fspd\") ? FRENZY.rateFast : FRENZY.rate) : 1); window.__shots = (window.__shots || 0) + 1;"]]);
  const g = makeGame({ seed: 5, patch, cleared: 50, level: 10 }); g.key("Enter"); g.frame();
  const X = g.win.__x, p = X.getPlayer(); let tStart = null, tEnd = null, prev = 0, lastOn = null, lastOff = null, active = 0, prevT = 0; const onI = [], offI = [];   // active = fotogrammi in cui la frenesia scorre (escluse le pause)
  for (let f = 0; f < 4200 && tEnd === null; f++) {
    g.frame(); g.texts.length = 0;
    const on = (p.st.frenzyT || 0) > 0, sh = g.win.__shots || 0;
    if (prevT > 0 && (p.st.frenzyT || 0) < prevT) active++;
    prevT = p.st.frenzyT || 0;
    if (sh > prev) { if (on) { if (lastOn !== null) onI.push(f - lastOn); lastOn = f; } else { if (lastOff !== null) offI.push(f - lastOff); lastOff = f; } prev = sh; }
    if (on && tStart === null) tStart = f / 60;
    if (!on && tStart !== null) tEnd = f / 60;
  }
  const med = (a) => { const b = [...a].sort((x, y) => x - y); return b[Math.floor(b.length / 2)] / 60; };
  const io = med(offI), ifz = med(onI);
  console.log(label.padEnd(24), "carica ≈", tStart && tStart.toFixed(0), "s | durata ≈", tStart && tEnd && (active / 60).toFixed(1), "s di gioco (" + (tEnd - tStart).toFixed(1) + " s con le pause) | intervallo tra colpi:", io.toFixed(3), "s → in frenesia", ifz.toFixed(3), "s (cadenza ×" + (io / ifz).toFixed(2) + ")", g.errors.length ? g.errors[0] : "");
}
frenzy("base", { frenzy1: 1 });
frenzy("carica rapida", { frenzy1: 1, fill: 1 });
frenzy("cadenza ×2 (furiosa)", { frenzy1: 1, fill: 1, fspd: 1 });
frenzy("prolungata (lv3)", { frenzy1: 1, fill: 1, fspd: 1, fdur: 1 });

console.log("— Gravity Vortex Gun: buco nero statico —");
for (const [label, ups] of [["statico lv1", { stat1: 1 }], ["statico lv2", { stat1: 1, stat2: 1 }]]) {
  const patch = base([["startTurrets: [],", 'startTurrets: ["vortex"],'],
    ["META.startTurrets.slice(0, 4).forEach((id, i) => { slots[i] = makeShooter(TURRETS[id], SLOT_X[i], GROUND_Y - 14); });", `META.startTurrets.slice(0, 4).forEach((id, i) => { slots[i] = makeShooter(TURRETS[id], SLOT_X[i], GROUND_Y - 14); }); slots.forEach(s => { if (s) Object.assign(s.up, ${JSON.stringify(ups)}); }); player.cd = 1e9;`],
    ["if (stat) this.still = statT;", "if (stat) { this.still = statT; window.__st = statT; }"]]);
  const g = makeGame({ seed: 3, patch, cleared: 50, level: 10 }); g.key("Enter"); g.frame(); const X = g.win.__x;
  X.spawn({ enemy: "drone", x: 72 }); const e = X.enemies().slice(-1)[0]; e.x = 72; e.y = 330; e.speed = 0; e.hp = e.maxHp = 1e9;   // a portata (corta) del Vortex
  for (let f = 0; f < 1500 && g.win.__st === undefined; f++) { g.frame(); g.texts.length = 0; }
  console.log(label.padEnd(14), "durata del buco nero fermo:", g.win.__st, "s", g.errors.length ? g.errors[0] : "");
}
