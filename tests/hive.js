const { makeGame, seeded } = require("./bot.js");
const P = (h, ...pairs) => pairs.reduce((a, [x, y]) => { if (!a.includes(x)) throw new Error("manca: " + x.slice(0, 60)); return a.replace(x, y); }, h);
const expose = (h) => P(h, ["requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__x = { hiveWave, spawn, enemies: () => enemies, ents: () => ents, slots: () => slots, HIVE_RANGE };\n})();"]);
const withHive = (ups) => (h) => P(expose(h),
  ["domeHp: 100,", "domeHp: 1000000,"], ["options = rollOptions();", "options = [];"],
  ["startTurrets: [],", 'startTurrets: ["hive"],'],
  ["META.startTurrets.slice(0, 4).forEach((id, i) => { slots[i] = makeShooter(TURRETS[id], SLOT_X[i], GROUND_Y - 14); });",
   `META.startTurrets.slice(0, 4).forEach((id, i) => { slots[i] = makeShooter(TURRETS[id], SLOT_X[i], GROUND_Y - 14); }); slots.forEach(s => { if (s) Object.assign(s.up, ${JSON.stringify(ups)}); });`],
  ["const first = this.shots === 0,", "window.__fd = Math.max(window.__fd || 0, dist(tg.x, tg.y, this.x, this.y)); window.__fired = (window.__fired || 0) + 1; const first = this.shots === 0,"],
  ["this.shots++; this.cd = 1.0;", "this.shots++; this.cd = 1.0; window.__ms = Math.max(window.__ms || 0, this.shots);"]);

// 1) cono dell'onda
{
  const g = makeGame({ seed: 1, patch: withHive({ wave1: 1, wave2: 1 }) }); g.key("Enter"); g.frame();
  const X = g.win.__x, s = X.slots()[0];
  const place = (x, y) => { X.spawn({ enemy: "brute", x }); const e = X.enemies().slice(-1)[0]; e.x = x; e.y = y; e.hp = e.maxHp = 1000; return e; };
  const drone = { x: 180, y: 300 }, up = -Math.PI / 2;
  const A = place(180, 240), D = place(205, 235), B = place(180, 360), C = place(250, 300), E = place(180, 100);
  const y0 = { A: A.y, B: B.y };
  X.hiveWave(s, drone, 100, up);
  const hit = (e) => e.hp < 1000;
  console.log("Onda verso l’alto da (180,300):");
  console.log("  davanti (60 px):", hit(A), "| quasi in asse:", hit(D), "| dietro:", hit(B), "| di lato (90°):", hit(C), "| troppo lontano (200 px):", hit(E));
  console.log("  spinta: davanti si è spostato verso l’alto:", A.y < y0.A, "| rallentato (wave2):", A.slowT > 0);
  const F = place(180, 360); const fy = F.y; X.hiveWave(s, { x: 180, y: 300 }, 100, Math.PI / 2);
  console.log("  onda verso il basso: colpisce ma non spinge verso la cupola:", F.hp < 1000, F.y <= fy);
}
// 2-3-4) partita con drone: portata, bersagli, colpi massimi
function run(label, ups, toggle, frames = 6000) {
  const g = makeGame({ seed: 5, patch: withHive(ups) }); g.key("Enter"); g.frame();
  const X = g.win.__x, r = seeded(8); let maxUnique = 0, minUniqueWhenMany = 99, frames2 = 0;
  if (toggle) g.click(100, 26);
  for (let f = 0; f < frames; f++) {
    if (f % 120 === 0) g.tap(30 + r() * 300, 300);
    g.frame(); g.texts.length = 0;
    const ds = X.ents().filter((o) => o.fire && o.t && !o.t.dead);
    if (ds.length >= 2 && X.enemies().filter((e) => !e.dead && e.y >= 0).length >= 2) {
      const u = new Set(ds.map((o) => o.t)).size; maxUnique = Math.max(maxUnique, u); minUniqueWhenMany = Math.min(minUniqueWhenMany, u); frames2++;
    }
  }
  const w = g.win;
  console.log(label.padEnd(28), "colpi sparati:", String(w.__fired || 0).padStart(4), "| distanza max di tiro:", Math.round(w.__fd || 0), "(limite " + X.HIVE_RANGE + ")",
    "| bersagli distinti max/min:", maxUnique + "/" + (minUniqueWhenMany === 99 ? "-" : minUniqueWhenMany), "| colpi max per drone:", w.__ms || 0, g.errors.length ? "ERRORI " + g.errors[0] : "");
}
console.log("\nPartita:");
run("regola 'più vicino'", {});
run("regola 'vita più alta'", {}, true);
run("più colpi ×3 (atteso 10)", { hits: 3 }, false, 12000);
run("più colpi ×1 (atteso 6)", { hits: 1 });
