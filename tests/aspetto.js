// 1.12.4: aree in fiamme della Sky Guard (limite = missili per salva, disegnate sotto i nemici), varchi ovali del wormhole,
// colori dei colpi del guardiano con le combo di fuoco e force
const { makeGame } = require("./bot.js");
const fs = require("fs"), path = require("path");
const P = (h, ...pairs) => pairs.reduce((a, [x, y]) => { if (!a.includes(x)) throw new Error("manca: " + x.slice(0, 60)); return a.replace(x, y); }, h);
const patch = (h) => P(h,
  ["domeHp: 100,", "domeHp: 1000000,"], ["options = rollOptions();", "options = [];"],
  ["function playerTick(p, dt) {", "function playerTick(p, dt) { if (window.__noGuard) return;"],
  ["requestAnimationFrame(frame);\n})();", `requestAnimationFrame(frame);
window.__x = { spawn, enemies: () => enemies, ents: () => ents, makeShooter, TURRETS, GROUND_Y, skyImpact, skyCount, portals, playerBullet, PORTAL_FLAT, TYPES, FX,
  player: () => player, slots: () => slots, hold: () => { queue = []; enemies.length = 0; } };
})();`]);
const ok = (c) => c ? "✓" : "✗ ERRORE";
function setup() {
  const g = makeGame({ seed: 3, patch }); g.win.__noGuard = true; g.key("Enter"); g.frame(); const X = g.win.__x; X.hold();
  const mk = (x, y, kind) => { X.spawn({ enemy: kind || "drone", x }); const e = X.enemies().slice(-1)[0]; e.x = x; e.y = y; e.speed = 0; e.hp = e.maxHp = 1e7; return e; };
  mk(180, -500);
  const tower = (id, up) => { const s = X.makeShooter(X.TURRETS[id], 180, X.GROUND_Y - 14); Object.assign(s.up, up); return s; };
  const run = (sec) => { for (let i = 0; i < Math.round(sec * 60); i++) g.frame(); };
  return { g, X, mk, tower, run };
}

console.log("— Sky Guard · Area infuocata —");
for (const up of [{ fire: 1 }, { fire: 1, msl: 2 }, { fire: 1, msl: 1, plus2: 1 }]) {
  const { X, mk, tower } = setup(); const s = tower("sky", up); mk(180, 300);
  for (let k = 0; k < 12; k++) X.skyImpact(s, 40 + k * 25, 300, false);
  const n = X.ents().filter((o) => o.fireField === s && !o.dead).length;
  console.log("aree in fiamme dopo 12 impatti con", JSON.stringify(up).padEnd(30), n, "(limite", X.skyCount(s) + ")", ok(n === X.skyCount(s)));
}
{
  const { X, mk, tower, run } = setup(); const s = tower("sky", { fire: 1 }); mk(180, 300);
  X.skyImpact(s, 100, 300, false); X.skyImpact(s, 140, 300, false); X.skyImpact(s, 180, 300, false);
  const a = X.ents().filter((o) => o.fireField === s && !o.dead).length;
  run(5.2); X.skyImpact(s, 220, 300, false);
  const b = X.ents().filter((o) => o.fireField === s && !o.dead).length;
  console.log("dopo 3 impatti:", a, "aree; spente le prime, nuovo impatto:", b, ok(a === 2 && b === 1));
  const f = X.ents().find((o) => o.fireField === s);
  console.log("area in fiamme disegnata sotto i nemici (under):", !!(f && f.under), ok(f && f.under));
}
{ // ordine di disegno: le entità under prima dei nemici, le altre dopo
  const src = fs.readFileSync(path.join(__dirname, "..", "app", "draw.js"), "utf8");
  const i = src.indexOf("if (o.under) o.draw()"), j = src.indexOf("enemies.forEach(drawEnemy)"), k = src.indexOf("if (!o.under) o.draw()");
  console.log("ordine di disegno: sotto i nemici → nemici → sopra", ok(i > 0 && i < j && j < k));
}

console.log("— Gravity Vortex Gun · varchi ovali —");
{
  const { X, mk, tower, run } = setup(); const s = tower("vortex", { wh1: 1 });
  const A = { x: 180, y: 300 }, B = { x: 180, y: 40 };
  const r = mk(0, 0).def.r, flat = 22 * X.PORTAL_FLAT;
  const side = mk(180 + 22 + r - 2, 300);                        // al lato dell’ovale: dentro (larghezza piena)
  const above = mk(60, 300);                                     // lontano: controllo
  const far = mk(180, 300 - (flat + r) - 4);                     // sopra l’ovale: fuori (sarebbe dentro in un cerchio di raggio 22)
  [side, above, far].forEach((e) => { e.tpCd = 0; });
  X.portals(s, A, B); run(0.05);
  console.log("ovale schiacciato a", X.PORTAL_FLAT, "| al lato entra:", side.y < 100, "| sopra a", (300 - far.y).toFixed(0), "px resta fuori:", far.y > 200,
    ok(side.y < 100 && far.y > 200 && above.y > 200));
}

console.log("— Guardiano · colori dei colpi con le combo —");
for (const [combo, partners, want] of [[{}, [], ["physical"]], [{ kSky: 1 }, ["sky"], ["physical", "fire"]], [{ kVortex: 1 }, ["vortex"], ["physical", "force"]],
  [{ kSky: 1, kVortex: 1 }, ["sky", "vortex"], ["physical", "fire", "force"]]]) {
  const { g, X } = setup(); const p = X.player(); p.level = 2; Object.assign(p.up, combo);
  partners.forEach((id, i) => { X.slots()[i] = X.makeShooter(X.TURRETS[id], 60 + i * 80, X.GROUND_Y - 14); });
  const seen = new Set(); const orig = g.win.__x.ents();
  const before = orig.length;
  for (let k = 0; k < 6; k++) X.playerBullet(p, 180, 500, null, 10, -Math.PI / 2, null);
  // colore usato nel disegno: lo si legge chiamando draw() con FX.guardBullet intercettato
  const FX = X.FX, keep = FX.guardBullet; FX.guardBullet = (o, ch, cl, fa, fr, tint) => seen.add(tint);
  orig.slice(before).forEach((o) => o.draw()); FX.guardBullet = keep;
  const names = [...seen].map((c) => Object.keys(X.TYPES).find((t) => X.TYPES[t].color === c));
  console.log("combo", (Object.keys(combo).join("+") || "nessuna").padEnd(13), "→ colori:", names.join(", "), ok(names.length === want.length && want.every((w) => names.includes(w))));
}
{ // il clone resta bianco anche con le combo
  const { X, g } = setup(); const p = X.player(); p.level = 2; Object.assign(p.up, { kSky: 1 }); X.slots()[0] = X.makeShooter(X.TURRETS.sky, 60, X.GROUND_Y - 14);
  const before = X.ents().length; for (let k = 0; k < 4; k++) X.playerBullet(p, 180, 500, null, 10, -Math.PI / 2, { clone: true });
  const seen = new Set(), FX = X.FX, keep = FX.guardBullet; FX.guardBullet = (o, ch, cl, fa, fr, tint) => seen.add(tint);
  X.ents().slice(before).forEach((o) => o.draw()); FX.guardBullet = keep;
  console.log("clone speculare con Proiettili incendiari: colori", seen.size, ok(seen.size === 1 && seen.has(X.TYPES.physical.color)));
}
