const { makeGame, seeded } = require("./bot.js");
const P = (h, ...pairs) => pairs.reduce((a, [x, y]) => { if (!a.includes(x)) throw new Error("manca: " + x.slice(0, 60)); return a.replace(x, y); }, h);
const expose = (h) => P(h, ["requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__x = { spawn, enemies: () => enemies, slots: () => slots, ents: () => ents };\n})();"]);
const base = (id, ups) => (h) => P(expose(h), ["domeHp: 100,", "domeHp: 1000000,"], ["options = rollOptions();", "options = [];"],
  ["startTurrets: [],", `startTurrets: ["${id}"],`],
  ["META.startTurrets.slice(0, 4).forEach((id, i) => { slots[i] = makeShooter(TURRETS[id], SLOT_X[i], GROUND_Y - 14); });",
   `META.startTurrets.slice(0, 4).forEach((id, i) => { slots[i] = makeShooter(TURRETS[id], SLOT_X[i], GROUND_Y - 14); }); slots.forEach(s => { if (s) Object.assign(s.up, ${JSON.stringify(ups)}); }); player.cd = 1e9;`]);
function place(X, x, y, hp) { X.spawn({ enemy: "drone", x }); const e = X.enemies().slice(-1)[0]; e.x = x; e.y = y; e.speed = 0; e.hp = e.maxHp = hp; return e; }

console.log("— Disruption Drone —");
function disr(ups, spots, label) {
  const g = makeGame({ seed: 3, patch: base("disr", ups) }); g.key("Enter"); g.frame();
  const X = g.win.__x; g.click(100, 26);                    // regola "vita più alta": il campo si forma sul nemico con più vita
  const main = place(X, 180, 300, 1e9), others = spots.map(([x, y]) => place(X, x, y, 1e6));
  const touched = others.map(() => false);
  for (let f = 0; f < 560; f++) {                            // solo il primo campo (la ricarica è 6 s)
    g.frame(); g.texts.length = 0;
    others.forEach((e, i) => { if (e.slowT > 0) touched[i] = true; });
  }
  console.log(label.padEnd(34), spots.map(([x, y], i) => `(${x},${y}):${touched[i] ? "colpito" : "no"}`).join("  "), g.errors.length ? "ERRORI " + g.errors[0] : "");
}
disr({}, [[4, 300], [356, 300], [100, 300]], "tutta la larghezza (y=300)");
disr({}, [[180, 335], [180, 265]], "fuori fascia base (±35 px)");
disr({ height: 2 }, [[180, 335], [180, 265]], "altezza ×2 pile (±35 px)");
disr({ height: 3 }, [[180, 345], [180, 255]], "altezza ×3 pile (±45 px)");
disr({ height: 3 }, [[180, 360], [180, 240]], "altezza ×3 pile (±60 px)");
for (const [ups, lab] of [[{}, "base"], [{ dur: 3 }, "3 pile durata"]]) {
  const g = makeGame({ seed: 3, patch: base("disr", ups) }); g.key("Enter"); g.frame(); const X = g.win.__x;
  place(X, 180, 300, 1e9); let fe = null, f0 = 0, life = null;
  for (let f = 0; f < 1500 && life === null; f++) {
    g.frame(); g.texts.length = 0;
    if (!fe) { fe = X.ents().find((o) => "acc" in o && "age" in o); if (fe) f0 = f; }
    else if (fe.dead) life = (f - f0) / 60;
  }
  console.log("durata del campo", lab.padEnd(14), "≈", life && life.toFixed(1), "s");
}
console.log("— Gravity Vortex Gun —");
function vortex(ups, label) {
  const patch = (h) => P(base("vortex", ups)(h), ["finish() { this.dead = true;", "finish() { window.__len = this.trav; window.__R = R; this.dead = true;"]);
  const g = makeGame({ seed: 3, patch }); g.key("Enter"); g.frame(); const X = g.win.__x;
  place(X, 72, 150, 1e6);                                    // sopra la torretta (x=72), lontano: il buco nero va dritto verso l’alto
  for (let f = 0; f < 900 && g.win.__len === undefined; f++) { g.frame(); g.texts.length = 0; }
  console.log(label.padEnd(22), "raggio:", Math.round(g.win.__R), "px | percorso:", Math.round(g.win.__len), "px =", (g.win.__len / 640 * 100).toFixed(0) + "% dell’altezza", g.errors.length ? "ERRORI " + g.errors[0] : "");
}
vortex({}, "senza potenziamenti");
vortex({ len: 1, rad: 1 }, "1 pila");
vortex({ len: 3, rad: 3 }, "3 pile (massimo)");
