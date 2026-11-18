// Revisione torri n. 1: controlla che i nuovi effetti facciano davvero quello che dicono (non solo che non diano errori).
const { makeGame } = require("./bot.js");
const P = (h, ...pairs) => pairs.reduce((a, [x, y]) => { if (!a.includes(x)) throw new Error("manca: " + x.slice(0, 60)); return a.replace(x, y); }, h);
const patch = (h) => P(h,
  ["domeHp: 100,", "domeHp: 1000000,"], ["options = rollOptions();", "options = [];"],
  ["function playerTick(p, dt) {", "function playerTick(p, dt) { return;"],               // il guardiano non spara: si misura solo la torre
  ["  busy(s, 1);\n  // combo: Raggi incendiari", "  window.__rays = rays; busy(s, 1);\n  // combo: Raggi incendiari"],
  ["requestAnimationFrame(frame);\n})();", `requestAnimationFrame(frame);
window.__x = { damage, spawn, enemies: () => enemies, ents: () => ents, makeShooter, TURRETS, GROUND_Y, rangeOf, aeroStats, hiveWave,
  skyBurn, skyImpact, burn, laserFire, disrFire, thunderBolt, beamFire, hold: () => { queue = []; enemies.length = 0; } };
})();`]);
const ok = (c) => c ? "✓" : "✗ ERRORE";

// partita vuota: niente ondate; un nemico fuori schermo tiene aperta l’ondata
function setup() {
  const g = makeGame({ seed: 3, patch }); g.key("Enter"); g.frame(); const X = g.win.__x; X.hold();
  const mk = (x, y, hp) => { X.spawn({ enemy: "drone", x }); const e = X.enemies().slice(-1)[0]; e.x = x; e.y = y; e.speed = 0; e.hp = e.maxHp = hp || 1e6; return e; };
  mk(180, -500);
  const tower = (id, up) => { const s = X.makeShooter(X.TURRETS[id], 180, X.GROUND_Y - 14); Object.assign(s.up, up); return s; };
  const run = (sec) => { for (let i = 0; i < Math.round(sec * 60); i++) g.frame(); };
  return { g, X, mk, tower, run };
}

console.log("— Laser: rimbalzi e mini-raggi —");
for (const [up, mainSegs, miniSegs, label] of [[{ bounce: 2, multi1: 1 }, 2, 1, "2 rimbalzi, mini-raggi lv1"], [{ bounce: 2, multi1: 1, multiW: 1, multi3: 1 }, 2, 3, "2 rimbalzi, mini-raggi lv3"]]) {
  const { g, X, mk, tower } = setup(); mk(180, 250);
  X.laserFire(tower("laser", up)); const R = g.win.__rays;
  console.log(label.padEnd(28), "raggi:", R.length, "| segmenti principale:", R[0].segs.length, "| mini:", R[1].segs.length,
    "| danno mini/principale:", (R[1].dps / R[0].dps).toFixed(2), ok(R.length === 3 && R[0].segs.length === mainSegs && R[1].segs.length === miniSegs));
}
{
  const { g, X, mk, tower, run } = setup(); const e = mk(180, 250);
  X.laserFire(tower("laser", { multi1: 1, multiW: 1 })); run(0.3);
  console.log("Raggi debilitanti: nemico indebolito:", e.weakT > 0, ok(e.weakT > 0), "| errori JS:", g.errors[0] || "nessuno");
}

console.log("— Sky Guard: Combustione e Doppio impatto —");
for (const [up, viaSky, expect, label] of [[{ burn1: 1, burn2: 1, burn3: 1 }, true, true, "con Combustione, bruciato dalla Sky"],
  [{ burn1: 1, burn2: 1 }, true, false, "senza Combustione"], [{ burn1: 1, burn2: 1, burn3: 1 }, false, false, "bruciato da un’altra torre"]]) {
  const { X, mk, tower, run } = setup(); const s = tower("sky", up);
  const A = mk(100, 300, 1), B = mk(125, 300);
  if (viaSky) X.skyBurn(s, A, 3, 5); else X.burn(A, 3, 5);
  X.damage(A, 10, "physical"); run(0.2);
  const hit = B.hp < B.maxHp;
  console.log(label.padEnd(36), "il vicino subisce l’esplosione:", hit, ok(hit === expect));
}
{
  const { X, mk, tower, run } = setup(); const B = mk(180, 300);
  X.skyImpact(tower("sky", {}), 180, 300, false); run(0.8); const one = B.maxHp - B.hp;
  const C = mk(180, 300); X.skyImpact(tower("sky", { again: 1 }), 180, 300, false); run(0.8); const two = C.maxHp - C.hp;
  console.log("Doppio impatto: danno", one.toFixed(1), "→", two.toFixed(1), "(atteso ×1,6)", ok(Math.abs(two / one - 1.6) < 1e-6));
}

console.log("— Disruption Drone: Campo attrattivo ed Esplosione finale —");
{
  const { X, mk, tower, run } = setup(); const T = mk(180, 300), E = mk(60, 322);
  X.disrFire(tower("disr", { grip: 1 })); run(1.5);
  console.log("Campo attrattivo: nemico a 22 px dalla linea centrale → ora a", Math.abs(E.y - 300).toFixed(1), "px", ok(Math.abs(E.y - 300) < 15));
  const loss = (up) => { const k = setup(); const t = k.mk(180, 300); k.X.disrFire(k.tower("disr", up)); k.run(7); return t.maxHp - t.hp; };
  const a = loss({}), b = loss({ blast: 1 });
  console.log("Esplosione finale: danno del campo", a.toFixed(0), "→", b.toFixed(0), "(+3 colpi)", ok(Math.abs(b - a - 24) < 1e-6));
}

console.log("— Aeroblast: gittata e raggio —");
{
  const { X, tower } = setup();
  const r = X.rangeOf(tower("aero", { reach: 1, reach2: 1 })), rad = X.aeroStats(tower("aero", { blast: 1 })).rad;
  console.log("gittata con entrambi i level up:", r.toFixed(0), "px (atteso 416) | raggio esplosione:", rad.toFixed(0), "px (atteso 56)", ok(Math.round(r) === 416 && Math.round(rad) === 56));
}

console.log("— Thunderbolt: scossa continua —");
{
  const { X, mk, tower, run } = setup(); const s = tower("thunder", { para1: 1, paraD: 1, paraT: 1 }), e = mk(180, 300);
  let n = 0; while (!(e.paraT > 0) && n < 40) { X.thunderBolt(s, 180, 500); n++; }
  const dur = e.paraT, hp0 = e.hp; run(0.95);
  console.log("paralizzato dopo", n, "fulmini, per", dur, "s | danno della scossa in 0,95 s:", (hp0 - e.hp).toFixed(1), ok(dur === 1.5 && hp0 - e.hp > 0));
}

console.log("— Beam: Raggio amplificato —");
for (const [up, label, min] of [[{}, "base", 0.9], [{ amp1: 1 }, "amplificato", 1.5]]) {
  const { X, mk, tower, run } = setup(); const e = mk(180, 400);
  X.beamFire(tower("beam", up)); run(0.4); const a = e.maxHp - e.hp; run(1.0); const h1 = e.maxHp - e.hp; run(0.4); const b = e.maxHp - e.hp - h1;
  console.log(label.padEnd(12), "danno nei primi 0,4 s:", a.toFixed(1), "| dopo 1,4 s, in 0,4 s:", b.toFixed(1), "| rapporto ×" + (b / a).toFixed(2), ok(b / a > min && (up.amp1 || b / a < 1.05)));
}

console.log("— Hive: Onda ampia —");
for (const [up, expect] of [[{}, false], [{ waveR: 1 }, true]]) {
  const { X, mk } = setup(); const e = mk(180, 300 - 170);
  X.hiveWave({ up }, { x: 180, y: 300 }, 10, -Math.PI / 2);
  console.log(("onda " + (up.waveR ? "ampia" : "base")).padEnd(12), "nemico a 170 px colpito:", e.hp < e.maxHp, ok((e.hp < e.maxHp) === expect));
}
