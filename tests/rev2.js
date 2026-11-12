// Revisione torri n. 2: controlla che i nuovi effetti facciano davvero quello che dicono, e la regola delle chain (DESIGN.md § 3).
const { makeGame } = require("./bot.js");
const P = (h, ...pairs) => pairs.reduce((a, [x, y]) => { if (!a.includes(x)) throw new Error("manca: " + x.slice(0, 60)); return a.replace(x, y); }, h);
const patch = (h) => P(h,
  ["domeHp: 100,", "domeHp: 1000000,"], ["options = rollOptions();", "options = [];"],
  ["function playerTick(p, dt) {", "function playerTick(p, dt) { return;"],               // il personaggio non spara: si misura solo la torre
  ["function railBoom(s, x, y, avail, dmg0) {", "function railBoom(s, x, y, avail, dmg0) { (window.__rb = window.__rb || []).push(Math.round(y));"],
  ["requestAnimationFrame(frame);\n})();", `requestAnimationFrame(frame);
window.__x = { damage, spawn, enemies: () => enemies, ents: () => ents, makeShooter, TURRETS, PLAYER_DEF, GROUND_Y, cdOf,
  laserFire, beamFire, wheelFire, hiveDrone, railShot, teslaBoom, teslaChargeT, vortex, hold: () => { queue = []; enemies.length = 0; } };
})();`]);
const ok = (c) => c ? "✓" : "✗ ERRORE";

// partita vuota: niente ondate; un nemico fuori schermo tiene aperta l’ondata
function setup() {
  const g = makeGame({ seed: 3, patch }); g.key("Enter"); g.frame(); const X = g.win.__x; X.hold(); g.win.__rb = [];
  const mk = (x, y, hp, kind) => { X.spawn({ enemy: kind || "drone", x }); const e = X.enemies().slice(-1)[0]; e.x = x; e.y = y; e.speed = 0; e.hp = e.maxHp = hp || 1e6; return e; };
  mk(180, -500);
  const tower = (id, up) => { const s = X.makeShooter(X.TURRETS[id], 180, X.GROUND_Y - 14); Object.assign(s.up, up); return s; };
  const run = (sec) => { for (let i = 0; i < Math.round(sec * 60); i++) g.frame(); };
  const lost = (e) => e.maxHp - e.hp;
  return { g, X, mk, tower, run, lost };
}

console.log("— Regola delle chain e dei level up —");
{
  const { X } = setup();
  for (const d of [X.PLAYER_DEF, ...Object.values(X.TURRETS)]) {
    const chains = {}, lu = [0, 0, 0, 0];
    for (const u of d.ups) { if (u.cat === "chain") (chains[u.chain] = chains[u.chain] || [0, 0, 0, 0])[u.lv]++; if (u.cat === "lu") lu[u.lv]++; }
    const shapes = Object.values(chains).map((c) => c.slice(1).join("-")).sort();
    const good = shapes.join(" ") === "1-1-1 1-2-1" && lu[1] === 2 && lu[2] === 2 && lu[3] >= 1 && !d.ups.some((u) => u.prov);
    console.log((d.name || "").padEnd(20), "chain:", shapes.join(" "), "| level up lv1-2-3:", lu.slice(1).join("-"), ok(good));
  }
}

console.log("— Laser: Raggi penetranti —");
for (const up of [{}, { ignore: 1 }]) {
  const { X, mk, tower, run, lost } = setup(); const es = [];
  for (let i = 0; i < 40; i++) es.push(mk(180, 120 + i * 10, 0, "wisp"));       // nemici di energia: resistono al laser (×0,5)
  X.laserFire(tower("laser", up)); run(1.0);
  const d = es.map(lost), lo = Math.min(...d), full = d.filter((v) => v > lo * 1.5).length;
  console.log((up.ignore ? "con" : "senza").padEnd(6), "nemici che subiscono il danno pieno:", full, "su 40", ok(up.ignore ? full >= 4 && full <= 22 : full === 0));
}

console.log("— Beam: Ramificazione estesa —");
for (const [up, links] of [[{ fork1: 1 }, 3], [{ fork1: 1, forkN: 1 }, 4]]) {
  const { X, mk, tower, run } = setup(); for (let i = 0; i < 6; i++) mk(150 + i * 12, 400);
  X.beamFire(tower("beam", up)); run(0.1); const b = X.ents().find((o) => o.links);
  console.log((up.forkN ? "lv2" : "lv1").padEnd(4), "raggi (principale + ramificazioni):", b.links.length, ok(b.links.length === links));
}

console.log("— Hive: droni senza durata, Colpi di forza, Droni kamikaze —");
{
  const { X, mk, tower, run } = setup(); const s = tower("hive", {});
  X.hiveDrone(s, 180, 200, 1, 0); const d = X.ents().slice(-1)[0]; run(30);
  console.log("dopo 30 s senza nemici il drone è ancora in campo:", !d.dead, ok(!d.dead));
  mk(180, 300); run(8);
  console.log("con un nemico: spara", d.shots, "colpi e poi sparisce:", d.dead, ok(d.shots === 4 && d.dead));
}
{
  const { X, mk, tower, run } = setup(); const A = mk(180, 300); const y0 = A.y;
  X.hiveDrone(tower("hive", { push: 1 }), 180, 200, 1, 0); run(1.6);
  console.log("Colpi di forza: il nemico arretra di", (y0 - A.y).toFixed(1), "px", ok(y0 - A.y > 5));
}
for (const up of [{}, { kami: 1 }]) {
  const { X, mk, tower, run, lost } = setup(); const A = mk(180, 300), B = mk(200, 300);
  X.hiveDrone(tower("hive", up), 180, 200, 1, 0); run(8);
  console.log((up.kami ? "kamikaze" : "normale").padEnd(9), "danno al vicino del bersaglio:", lost(B).toFixed(0), ok(up.kami ? lost(B) > 0 : lost(B) === 0));
}

console.log("— Firewheel Drone —");
{
  const scia = (up) => { const { X, tower, mk, run } = setup(); mk(180, 100); X.wheelFire(tower("wheel", up)); run(1.0);
    const w = X.ents().find((o) => o.trail); return w && w.trail.length ? Math.max(...w.trail.map((p) => p.t)) : 0; };
  const a = scia({ trail1: 1 }), b = scia({ trail1: 1, trail3: 1 });
  console.log("vita residua del tratto più nuovo della scia:", a.toFixed(2), "→", b.toFixed(2), "s", ok(a > 1.9 && a <= 2 && b > 3.9 && b <= 4));
  const { X, mk, tower, run } = setup(); const e = mk(180, 100);
  X.wheelFire(tower("wheel", { trail1: 1, trailR: 1, trailB: 1 })); run(0.6);
  const w = X.ents().find((o) => o.trail), p = w.trail[0]; e.x = p.x; e.y = p.y; run(0.1);
  console.log("nella scia: brucia", e.burnT > 0, "| bruciatura", e.burnDps.toFixed(1), "(attesa 8,0) | vulnerabile al fuoco:", e.fireVulnT > 0,
    ok(e.burnT > 0 && Math.abs(e.burnDps - 8) < 1e-6 && e.fireVulnT > 0));
  const f = mk(60, 100); const h0 = f.hp; X.damage(f, 10, "fire"); const h1 = f.hp; f.fireVulnT = 1; X.damage(f, 10, "fire");
  console.log("danno da fuoco con la scia corrosiva: ×" + ((h1 - f.hp) / (h0 - h1)).toFixed(2), ok(Math.abs((h1 - f.hp) / (h0 - h1) - 1.3) < 1e-6));
}
{
  const tot = (up) => { const { X, mk, tower, run, lost } = setup(); const es = [];
    for (let i = 0; i < 10; i++) es.push(mk(140 + (i % 5) * 20, X.GROUND_Y - 40 - Math.floor(i / 5) * 20));
    const s = tower("wheel", up); X.wheelFire(s); run(0.5); return { d: es.reduce((a, e) => a + lost(e), 0), s, X, run }; };
  const a = tot({}).d, b = tot({ stoke: 1 }).d;
  console.log("Fiamma crescente, 10 nemici in 0,5 s: danno ×" + (b / a).toFixed(2), "(atteso vicino a 2)", ok(b / a > 1.8 && b / a <= 2.001));
  const k = tot({ cool: 1 }); k.run(6);
  console.log("Raffreddamento, 10 nemici colpiti: ricarica", k.s.cd.toFixed(2), "s su", k.X.cdOf(k.s).toFixed(2), ok(Math.abs(k.s.cd / k.X.cdOf(k.s) - 0.5) < 1e-6));
}

console.log("— Railgun —");
for (const [up, bx, pierce, expect, label] of [[{}, 205, 3, false, "senza chain"], [{ boom1: 1 }, 205, 3, true, "lv1, vicino a 25 px"],
  [{ boom1: 1 }, 240, 8, false, "lv1, vicino a 60 px"], [{ boom1: 1, boomR: 1 }, 240, 8, true, "Deflagrazione, 8 perforazioni, 60 px"]]) {
  const { X, mk, tower, run, lost } = setup(); mk(180, 300); const B = mk(bx, 300);
  X.railShot(tower("rail", up), 180, 560, -Math.PI / 2, { pierce, hits: 0, child: false }); run(0.6);
  console.log(label.padEnd(38), "il vicino subisce l’esplosione:", lost(B) > 0, ok((lost(B) > 0) === expect));
}
{
  const dmgOf = (up) => { const { X, mk, tower, run, lost } = setup(); mk(180, 300); const B = mk(205, 300);
    X.railShot(tower("rail", up), 180, 560, -Math.PI / 2, { pierce: 5, hits: 0, child: false }); run(0.6); return lost(B); };
  const a = dmgOf({ boom1: 1 }), b = dmgOf({ boom1: 1, boomD: 1 });
  console.log("Carica esplosiva con 5 perforazioni: ×" + (b / a).toFixed(2), "(atteso 1,75)", ok(Math.abs(b / a - 1.75) < 1e-6));
}
{
  const { g, X, mk, tower, run } = setup(); const s = tower("rail", { boom1: 1, boom3: 1, stun: 1, crit: 1 });
  const line = []; for (let i = 0; i < 6; i++) line.push(mk(180, 450 - i * 50));
  const n = 150, cnt = {}, ds = [];
  for (let k = 0; k < n; k++) {
    g.win.__rb = []; const h0 = line[0].hp;
    X.railShot(s, 180, 560, -Math.PI / 2, { pierce: 8, hits: 0, child: false }); run(0.6);
    for (const y of g.win.__rb) cnt[y] = (cnt[y] || 0) + 1;
    ds.push(h0 - line[0].hp);                            // colpo + esplosione: il critico vale solo sul colpo
  }
  const lo = Math.min(...ds), crits = ds.filter((d) => d > lo * 1.1).length, hits = n;
  const fr = line.map((e) => (cnt[Math.round(e.y)] || 0) / n);
  console.log("Esplosioni a catena, frequenza per colpito:", fr.map((f) => f.toFixed(2)).join(" "), "(attese 1 0,8 0,6 0,4 0,2 0)",
    ok(fr[0] === 1 && Math.abs(fr[1] - 0.8) < 0.12 && Math.abs(fr[3] - 0.4) < 0.13 && fr[5] === 0));
  console.log("Impatto stordente: ultimo colpito paralizzato", line[5].paraT.toFixed(2), "s | critici sul primo:", (crits / hits * 100).toFixed(0) + "% (atteso 30)",
    ok(line[5].paraT > 0 && Math.abs(crits / hits - 0.3) < 0.12));
}

console.log("— Teslacoil —");
{
  const { X, tower } = setup();
  const t = X.teslaChargeT(tower("tesla", { over1: 1, over2: 1, over3: 1 }));
  console.log("carica con tutta la chain:", t.toFixed(1), "s (attesa 2,7)", ok(Math.abs(t - 2.7) < 1e-9));
}
for (const [up, expect, label] of [[{}, false, "base"], [{ over1: 1 }, true, "Carica espansiva"], [{ big: 1 }, true, "Esplosione ampia"]]) {
  const { X, mk, tower, lost } = setup(); const B = mk(230, 300);
  X.teslaBoom(tower("tesla", up), 180, 300, 0, new Set());
  console.log(label.padEnd(18), "nemico a 50 px colpito:", lost(B) > 0, ok((lost(B) > 0) === expect));
}
{
  const hit = (up) => { const { X, mk, tower, lost } = setup(); const A = mk(180, 300); X.teslaBoom(tower("tesla", up), 180, 300, 0, new Set()); return lost(A); };
  const r = hit({ over1: 1, over2: 1 }) / hit({});
  console.log("Carica potenziata (1 s di carica in più): danno ×" + r.toFixed(2), "(atteso 1,6)", ok(Math.abs(r - 1.6) < 1e-6));
  const orb = (up) => { const { X, mk, tower, run, lost } = setup(); const A = mk(180, 300); X.teslaBoom(tower("tesla", up), 180, 300, 0, new Set()); const b = lost(A); run(1); return lost(A) - b; };
  const o = orb({ orb: 1, orbD: 1 }) / orb({ orb: 1 });
  console.log("Sfera carica: danno della sfera ×" + o.toFixed(2), "(atteso 1,6)", ok(Math.abs(o - 1.6) < 0.02));
  const { X, mk, tower } = setup(); const s = tower("tesla", { stun: 1 }), A = mk(180, 300); let p = 0;
  for (let k = 0; k < 300; k++) { A.paraT = 0; X.teslaBoom(s, 180, 300, 0, new Set()); if (A.paraT > 0) p++; }
  console.log("Esplosioni paralizzanti:", (p / 3).toFixed(0) + "% (atteso 30)", ok(Math.abs(p / 300 - 0.3) < 0.07));
}

console.log("— Gravity Vortex Gun —");
for (const up of [{ wh1: 1 }, { wh1: 1, whT: 1 }]) {
  const { X, mk, tower, run } = setup(); mk(180, 520); X.vortex(tower("vortex", up), { x: 180, y: 560 }, -Math.PI / 2); run(2.2);
  const t = Math.max(0, ...X.ents().filter((o) => o.t > 0 && o.x === undefined).map((o) => o.t));
  console.log((up.whT ? "Varchi stabili" : "Wormhole").padEnd(15), "durata residua dei varchi appena aperti:", t.toFixed(1), "s", ok(up.whT ? t > 5.5 && t <= 6 : t > 3.5 && t <= 4));
}
{
  const where = (up) => { const { X, tower, run } = setup(); X.vortex(tower("vortex", up), { x: 180, y: 560 }, -Math.PI / 2); const v = X.ents().slice(-1)[0]; run(1); return 560 - v.y; };
  const a = where({}), b = where({ lazy: 1 });
  console.log("strada fatta in 1 s:", a.toFixed(0), "→", b.toFixed(0), "px con Buco nero lento", ok(Math.abs(a - 130) < 3 && Math.abs(b - 80) < 3));
  const stat = (up) => { const { X, mk, tower, run, lost } = setup(); const e = mk(180, 560 - 252.6);
    X.vortex(tower("vortex", Object.assign({ stat1: 1 }, up)), { x: 180, y: 560 }, -Math.PI / 2); run(2.1); const b = lost(e); run(1); return lost(e) - b; };
  const g = stat({ grow: 1 }) / stat({}), p = stat({ power: 1 }) / stat({});
  console.log("fermo a fine percorso: Collasso crescente ×" + g.toFixed(2), "(atteso 2) | Buco nero denso ×" + p.toFixed(2), "(atteso 1,5)",
    ok(Math.abs(g - 2) < 0.02 && Math.abs(p - 1.5) < 0.02));
}
