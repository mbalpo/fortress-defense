// Revisione 3 (DESIGN.md § 10): cupola larga 215 px, laser che non rientra nella cupola, cristalli più lenti,
// sfere del Thunderbolt sul profilo di prima, mine della Barriera minata solo sulla parte visibile del bordo.
const { makeGame } = require("./bot.js");
const P = (h, ...pairs) => pairs.reduce((a, [x, y]) => { if (!a.includes(x)) throw new Error("manca: " + x.slice(0, 60)); return a.replace(x, y); }, h);
const patch = (h) => P(h,
  ["domeHp: 100,", "domeHp: 1000000,"], ["options = rollOptions();", "options = [];"],
  ["function playerTick(p, dt) {", "function playerTick(p, dt) { return;"],
  ["  busy(s, 1);\n  // combo: Raggi incendiari", "  window.__rays = rays; busy(s, 1);\n  // combo: Raggi incendiari"],
  ["requestAnimationFrame(frame);\n})();", `requestAnimationFrame(frame);
window.__x = { spawn, enemies: () => enemies, ents: () => ents, makeShooter, TURRETS, ENEMY_DEFS, GROUND_Y, DOME, W, SLOT_X, trace, laserFire, wheelFire, playerBullet, player: () => player, slots: () => slots,
  thunderTick: BEHAV.thunder.tick, fireAbility, ABILITIES, abVal, hold: () => { queue = []; enemies.length = 0; } };
})();`]);
const ok = (c) => c ? "✓" : "✗ ERRORE";
function setup() {
  const g = makeGame({ seed: 3, patch }); g.key("Enter"); g.frame(); const X = g.win.__x; X.hold();
  const mk = (kind, x, y) => { X.spawn({ enemy: kind, x }); const e = X.enemies().slice(-1)[0]; e.x = x; e.y = y; e.hp = e.maxHp = 1e9; return e; };
  mk("drone", 180, -500).speed = 0;               // fuori schermo: tiene aperta l’ondata
  const run = (n) => { for (let i = 0; i < n; i++) { g.frame(); g.texts.length = 0; } };
  return { g, X, mk, run };
}
const inDomePad = (X, x, y, p) => ((x - X.DOME.cx) / (X.DOME.rx + p)) ** 2 + ((y - X.DOME.cy) / (X.DOME.ry + p)) ** 2;
const inDome = (X, x, y) => ((x - X.DOME.cx) / X.DOME.rx) ** 2 + ((y - X.DOME.cy) / X.DOME.ry) ** 2;

console.log("— cupola larga —");
{
  const { g, X, mk, run } = setup();
  console.log("profilo: rx", X.DOME.rx, "ry", X.DOME.ry, "| un solo profilo (niente ORB_RX):", !("ORB_RX" in X), ok(X.DOME.rx === 215 && X.DOME.ry === 95 && !("ORB_RX" in X)));
  const e = mk("wisp", 9, 400); e.speed = 60; let y0 = -1;
  for (let i = 0; i < 600 && e.y !== y0; i++) { y0 = e.y; e.x = 9; run(1); }
  console.log("nemico a x 9 (r 9) che scende → si ferma a y", e.y.toFixed(1), "(suolo a", X.GROUND_Y + ") | tocca la cupola prima del suolo:", e.y + 9 < X.GROUND_Y,
    ok(Math.abs(e.y - 517) < 2.5 && e.y + 9 < X.GROUND_Y));
  const f = mk("shell", 180, 300); f.speed = 50; y0 = -1;
  for (let i = 0; i < 600 && f.y !== y0; i++) { y0 = f.y; f.x = 180; run(1); }
  console.log("al centro (r 14) si ferma a y", f.y.toFixed(1), "(prima come ora: 584 − 95 − 14 = 475)", ok(Math.abs(f.y - 475) < 2.5));
  console.log("errori JS:", g.errors[0] || "nessuno");
}
console.log("— cristalli —");
{
  const { X } = setup();
  console.log("velocità base dei cristalli (wisp):", X.ENEMY_DEFS.wisp.speed, "| vita", X.ENEMY_DEFS.wisp.hp, "| danno", X.ENEMY_DEFS.wisp.dmg, ok(X.ENEMY_DEFS.wisp.speed === 60 && X.ENEMY_DEFS.wisp.hp === 22 && X.ENEMY_DEFS.wisp.dmg === 1.5));
}
console.log("— laser e cupola —");
{
  const { g, X, mk } = setup(); mk("drone", 180, 250).speed = 0;
  const s = X.makeShooter(X.TURRETS.laser, 180, X.GROUND_Y - 14); s.up.bounce = 3; X.laserFire(s);
  // 1.25.3: la cupola è un muro come i bordi dello schermo: su, giù sulla cupola, di nuovo su (normale verticale), giù sulla cupola
  const R = g.win.__rays[0].segs, last = R[R.length - 1], onDome = (q) => Math.abs(inDome(X, q.x2, q.y2) - 1) < 1e-6;
  console.log("laser al centro verso l’alto con 3 rimbalzi → tratti:", R.length, "| il secondo e il quarto finiscono sul bordo della cupola a y", R[1].y2.toFixed(1), last.y2.toFixed(1),
    "(atteso", X.GROUND_Y - 95 + ") | il terzo torna su fino a y", R[2].y2.toFixed(0),
    ok(R.length === 4 && onDome(R[1]) && onDome(last) && Math.abs(last.y2 - (X.GROUND_Y - 95)) < 0.5 && R[2].y2 === 0 && R[1].dome && last.dome));
  const first = R[0];
  console.log("il primo tratto parte da dentro la cupola ed esce fino al bordo dello schermo: da y", first.y1.toFixed(0), "a", first.y2.toFixed(0), ok(inDome(X, first.x1, first.y1) < 1 && first.y2 === 0));
  // raggio obliquo: rimbalza sul lato destro, sulla cupola e ancora sui bordi; mai dentro la cupola, angolo di uscita uguale a quello di entrata
  const T = X.trace(180, X.GROUND_Y - 22, -Math.PI / 2 + 0.5, 5);
  const D = T.filter((q) => q.dome), refl = T.every((q, i) => {
    if (!q.dome || !T[i + 1]) return true;
    const n = T[i + 1], nx0 = (q.x2 - X.DOME.cx) / X.DOME.rx ** 2, ny0 = (q.y2 - X.DOME.cy) / X.DOME.ry ** 2, nl = Math.hypot(nx0, ny0), nx = nx0 / nl, ny = ny0 / nl;
    const ix = q.x2 - q.x1, iy = q.y2 - q.y1, il = Math.hypot(ix, iy), ox = n.x2 - n.x1, oy = n.y2 - n.y1, ol = Math.hypot(ox, oy);
    return Math.abs(-(ix * nx + iy * ny) / il - (ox * nx + oy * ny) / ol) < 1e-6 && n.x1 === q.x2 && n.y1 === q.y2;
  });
  console.log("raggio obliquo con 5 rimbalzi → tratti:", T.length, "| rimbalzi sulla cupola:", D.length, "| riflessi sulla normale:", refl, "| nessun tratto dentro la cupola dopo il primo:",
    T.slice(1).every((q) => inDome(X, q.x1, q.y1) >= 1 - 1e-9 && inDome(X, (q.x1 + q.x2) / 2, (q.y1 + q.y2) / 2) > 1),
    ok(T.length === 6 && D.length >= 1 && D.every(onDome) && refl && T.slice(1).every((q) => inDome(X, (q.x1 + q.x2) / 2, (q.y1 + q.y2) / 2) > 1)));
  const s3 = X.makeShooter(X.TURRETS.laser, 180, X.GROUND_Y - 14); Object.assign(s3.up, { bounce: 3, multi1: 1, multi3: 1 }); X.laserFire(s3);
  const M = g.win.__rays.slice(1).map((r) => r.segs);
  console.log("mini-raggi lv3 → tratti:", M.map((q) => q.length).join(", "), "| toccano la cupola e proseguono:", M.every((q) => q.slice(0, -1).some((x) => x.dome)),
    ok(M.every((q) => q.length === 4 && q.slice(0, -1).some((x) => x.dome))));
  const sw = X.trace(180, X.GROUND_Y - 22, -Math.PI, 0);
  console.log("spazzata (nessun rimbalzo) orizzontale da dentro: un tratto fino al bordo dello schermo:", sw.length === 1 && sw[0].x2 === 0, ok(sw.length === 1 && sw[0].x2 === 0));
  console.log("errori JS:", g.errors[0] || "nessuno");
}
console.log("— sfere del Thunderbolt e Barriera minata —");
{
  const { g, X, run } = setup();
  for (const n of [0, 2, 3]) {                  // 1, 3 e 4 sfere: 20 s di movimento, controllo a ogni fotogramma
    const s = X.makeShooter(X.TURRETS.thunder, 180, X.GROUND_Y - 14); s.up.sph = n; X.slots()[0] = s;
    let xmin = 1e9, xmax = -1e9, worst = 0, ends = 0, pairs = Infinity;
    for (let f = 0; f < 1200; f++) {
      run(1); const sp = s.st.sph || [];
      for (const o of sp) { xmin = Math.min(xmin, o.x); xmax = Math.max(xmax, o.x); worst = Math.max(worst, Math.abs(inDome(X, o.x, o.y) - 1)); if (o.x < 13 || o.x > 347) ends++; }
      for (let i = 0; i < sp.length; i++) for (let j = i + 1; j < sp.length; j++) pairs = Math.min(pairs, Math.hypot(sp[i].x - sp[j].x, sp[i].y - sp[j].y));
    }
    const cnt = (s.st.sph || []).length;
    console.log(`sfere: ${cnt} | x da ${xmin.toFixed(1)} a ${xmax.toFixed(1)} | scarto massimo dal profilo 215: ${worst.toExponential(1)} | arrivano ai capi: ${ends > 0}` + (cnt > 1 ? ` | si incrociano (come prima): ${pairs < 6}` : ""),
      ok(cnt === n + 1 && xmin >= 12 - 1e-6 && xmax <= 348 + 1e-6 && worst < 1e-9 && ends > 0));
    X.slots()[0] = null;
  }
  const before = X.ents().length;
  X.fireAbility({ id: "mines", v: X.abVal("mines", 5) });
  const mines = X.ents().slice(before).filter((m) => m.x !== undefined);
  const mx = mines.map((m) => m.x);
  console.log("Barriera minata al 5: mine", mines.length, "| x da", Math.min(...mx).toFixed(0), "a", Math.max(...mx).toFixed(0), "| y da", Math.min(...mines.map((m) => m.y)).toFixed(0), "a", Math.max(...mines.map((m) => m.y)).toFixed(0),
    ok(mines.length >= 4 && Math.min(...mx) >= 0 && Math.max(...mx) <= 360));
  console.log("errori JS:", g.errors[0] || "nessuno");
}
console.log("— Firewheel Drone e cupola —");
{
  for (const [label, up] of [["Durata ×3", { dur: 3 }], ["Mini-droni, Scatto, Durata ×3", { mini1: 1, miniB: 1, dash: 1, dur: 3 }], ["Scia di fuoco, Presidio, Durata ×3", { trail1: 1, trail3: 1, stay: 1, dur: 3 }]]) {
    let out = 0, total = 0, back = 0, bounces = 0, minK = Infinity;
    for (let slot = 0; slot < 4; slot++) for (let seed = 0; seed < 8; seed++) {
      const { g, X, mk, run } = setup(); mk("drone", 180, 150).speed = 0;                 // un nemico a schermo: la torretta lancia
      const s = X.makeShooter(X.TURRETS.wheel, X.SLOT_X[slot], X.GROUND_Y - 14); s.level = 3; Object.assign(s.up, up);
      for (let i = 0; i < seed * 7; i++) g.win.Math.random();          // lanci diversi (angoli casuali del gioco)
      const before = X.ents().length; X.wheelFire(s);
      const D = X.ents().slice(before).filter((o) => o.trail);
      const st = D.map(() => ({ wasOut: false, lastA: null }));
      for (let f = 0; f < 1200 && D.some((d) => !d.dead); f++) {
        run(1);
        D.forEach((d, i) => { if (d.dead) return; const pad = d.trail && i > 0 && up.mini1 ? 3 : 5, k = inDomePad(X, d.x, d.y, pad);
          if (k > 1) st[i].wasOut = true; else if (st[i].wasOut) back++;
          if (st[i].wasOut) minK = Math.min(minK, k);
          if (st[i].lastA !== null && st[i].wasOut && Math.abs(d.a - st[i].lastA) > 1e-9 && k < 1.08 && d.x > 23 && d.x < 337 && d.y > 61) bounces++;
          st[i].lastA = d.a; });
      }
      total += D.length; out += st.filter((x) => x.wasOut).length;
      if (g.errors.length) console.log("errori JS:", g.errors[0]);
    }
    console.log(`Firewheel ${label.padEnd(30)} droni ${total} (4 slot × 8 lanci) | usciti dalla cupola: ${out} | rimbalzi sulla cupola: ${bounces} | rientri: ${back} | minimo fuori: ${minK.toFixed(3)}`,
      ok(total > 0 && out === total && bounces > 0 && back === 0 && minK > 1));
  }
}
console.log("— colpi del guardiano che rimbalzano sui bordi (1.14.4) e cupola —");
for (const clone of [false, true]) {
  // colpo senza bersaglio verso l’alto a sinistra (dx −0,6, dy −0,8) da (60, 300): bordo sinistro a (0, 220), poi verso destra;
  // A (60, 140) e B (120, 60) sono sul tratto dopo il rimbalzo, C (210, 60) dopo il rimbalzo sul bordo alto. Con 1 perforazione: A e B, poi si ferma
  const { g, X, mk, run } = setup(); const p = X.player(); p.up.ricochet = 1; p.up.pierce = 1;
  const A = mk("shell", 60, 140), B = mk("shell", 120, 60), C = mk("shell", 210, 60);
  A.speed = B.speed = C.speed = 0; const h = [A.hp, B.hp, C.hp];
  const before = X.ents().length; X.playerBullet(p, 60, 300, null, 10, Math.atan2(-0.8, -0.6), clone ? { clone: true } : null);
  const b = X.ents()[before];
  for (let i = 0; i < 120 && !b.dead; i++) run(1);
  console.log((clone ? "rimbalzo del clone" : "rimbalzo del guardiano") + " sul bordo sinistro: rimbalzi", b.edges || 0, "| A colpito", A.hp < h[0], "| B colpito", B.hp < h[1],
    "| C (dopo il bordo alto) colpito", C.hp < h[2], "| finito con le perforazioni:", b.dead,
    ok(b.edges === 1 && A.hp < h[0] && B.hp < h[1] && C.hp === h[2] && b.dead));
}
{
  // senza nemici: bordo sinistro, bordo alto, poi scende e rimbalza sulla cupola (1.25.3, prima si fermava); non entra mai nella cupola
  const { g, X, mk, run } = setup(); const p = X.player(); p.up.ricochet = 1;
  const before = X.ents().length; X.playerBullet(p, 60, 300, null, 10, Math.atan2(-0.8, -0.6));
  const b = X.ents()[before]; let inside = 0, after = 0, up = false;
  for (let i = 0; i < 300 && !b.dead; i++) { run(1); if (!b.dead) { if (inDome(X, b.x, b.y) < 1) inside++; if (b.domes) { after++; if (b.vy < 0) up = true; } } }
  console.log("rimbalzo senza nemici: rimbalzi sui bordi", b.edges, "| sulla cupola", b.domes, "| fotogrammi dopo la cupola", after, "| risale:", up, "| fotogrammi visibili dentro:", inside,
    ok(b.edges >= 2 && b.domes >= 1 && after > 10 && up && inside === 0));
}
{
  // senza Rimbalzo lo stesso colpo esce dallo schermo a sinistra
  const { g, X, mk, run } = setup(); const p = X.player(); p.up.pierce = 1;
  const A = mk("shell", 60, 140); A.speed = 0; const h = A.hp;
  const before = X.ents().length; X.playerBullet(p, 60, 300, null, 10, Math.atan2(-0.8, -0.6));
  const b = X.ents()[before]; for (let i = 0; i < 120 && !b.dead; i++) run(1);
  console.log("senza Rimbalzo: esce dallo schermo", b.dead, "| A colpito", A.hp < h, ok(b.dead && A.hp === h && !b.edges));
}
