// Tiro verticale (DESIGN.md § 2 e § 10): mentre si preme il guardiano segue il dito e spara dritto in alto, senza bersaglio;
// al rilascio torna la mira automatica. Vale anche per il Clone speculare. La frenesia scorre anche premendo senza nemici.
const { makeGame } = require("./bot.js");
const P = (h, ...pairs) => pairs.reduce((a, [x, y]) => { if (!a.includes(x)) throw new Error("manca: " + x.slice(0, 60)); return a.replace(x, y); }, h);
const base = (extra) => (h) => { let x = P(h,
  ["requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__x = { getPlayer: () => player, enemies: () => enemies, spawn, slots: () => slots, makeShooter, TURRETS, SLOT_X, GROUND_Y, isPressing: () => pressing, state: () => state, clearAll: () => { enemies = []; queue = []; } };\n})();"],
  ["domeHp: 100,", "domeHp: 1000000,"], ["options = rollOptions();", "options = [];"],
  ["function playerBullet(p, x, y, t, dmg, ang, o) {", "function playerBullet(p, x, y, t, dmg, ang, o) { (window.__b = window.__b || []).push({ t: !!t, tx: t && t.x, ty: t && t.y, x, y, ang, clone: !!(o && o.clone), fan: !!(o && o.fan) });"],
  ["  p.cd += PLAYER.interval /", "  window.__shots = (window.__shots || 0) + 1;\n  p.cd += PLAYER.interval /"]); for (const [a, b] of extra || []) x = P(x, [a, b]); return x; };
const ok = (c) => c ? "✓" : "✗ ERRORE";
const run = (g, n) => { for (let i = 0; i < n; i++) { g.frame(); g.texts.length = 0; } };
const frozen = (g, x, y) => { const X = g.win.__x; X.spawn({ enemy: "shell", x }); const e = X.enemies().slice(-1)[0]; e.x = x; e.y = y; e.speed = 0; e.spin = 0; e.hp = e.maxHp = 1e6; return e; };
const vertical = (b) => Math.abs(Math.cos(b.ang)) < 1e-9 && Math.sin(b.ang) < 0;     // −90° (anche scritto come 270°)

console.log("— tiro verticale —");
{
  const g = makeGame({ seed: 3, patch: base(), settings: { targeting: "closest", aim: "manual" } });   // un vecchio "aim: manual" viene ignorato
  g.key("Enter"); g.frame(); const X = g.win.__x, p = X.getPlayer();
  X.clearAll();
  const s = X.makeShooter(X.TURRETS.hive, X.SLOT_X[0], X.GROUND_Y - 14); s.level = 2; X.slots()[0] = s;     // Clone speculare: Hive al livello 2
  p.up.kHive = 1;
  const E = frozen(g, 300, 150); frozen(g, 40, 250);                // nemici di lato: in automatico il guardiano li punterebbe
  run(g, 60); const auto0 = (g.win.__b || []).filter((b) => !b.clone);
  console.log("senza premere (vecchio aim: manual ignorato) → colpi con bersaglio:", auto0.filter((b) => b.t).length, "di", auto0.length, ok(auto0.length > 3 && auto0.every((b) => b.t)));
  g.win.__b = []; g.click(90, 400); run(g, 90);
  const B = g.win.__b, main = B.filter((b) => !b.clone), cl = B.filter((b) => b.clone);
  console.log("premendo a x 90 → il guardiano va a x", Math.round(p.x), "| colpi del guardiano:", main.length, "tutti a −90° senza bersaglio:", main.every((b) => !b.t && vertical(b)),
    "| del clone:", cl.length, "tutti a −90°:", cl.every((b) => !b.t && vertical(b)), ok(Math.abs(p.x - 90) < 1 && main.length > 5 && cl.length > 5 && main.every((b) => !b.t && vertical(b)) && cl.every((b) => !b.t && vertical(b))));
  // tiro in colonna (1.24.1): anche con il dito vicino a un nemico i colpi vanno dritti in alto, senza bersaglio; il clone specchia la salva
  g.win.__b = []; g.move(250, 165); run(g, 60);
  const M = g.win.__b.filter((b) => !b.clone), C = g.win.__b.filter((b) => b.clone);
  const mirr = C.length === M.length && C.every((c, i) => Math.abs(c.x - (360 - M[i].x)) < 1e-9 && vertical(c));   // una salva del clone per ogni salva del guardiano, in ordine
  const hp0 = E.hp; g.move(293, 165); run(g, 60); const hitCol = E.hp < hp0;
  console.log("dito vicino al nemico (300, 150), guardiano a x 250 → colpi del guardiano in verticale senza bersaglio:", M.every((b) => !b.t && vertical(b)), "di", M.length,
    "| clone specchiato:", mirr, "| guardiano sotto il nemico → colpito:", hitCol, ok(M.length > 5 && M.every((b) => !b.t && vertical(b)) && C.length > 5 && mirr && hitCol));
  g.move(250, 400); run(g, 30);
  console.log("spostando il dito a x 250 → il guardiano va a x", Math.round(p.x), ok(Math.abs(p.x - 250) < 1));
  g.up(250, 400); g.win.__b = []; run(g, 60); const after = g.win.__b.filter((b) => !b.clone);
  console.log("rilasciato → colpi con bersaglio:", after.filter((b) => b.t).length, "di", after.length, "| premuto:", X.isPressing(), ok(after.length > 3 && after.every((b) => b.t) && !X.isPressing()));
  X.clearAll(); frozen(g, 180, -500); g.win.__shots = 0; run(g, 60); const s0 = g.win.__shots;
  g.click(180, 400); run(g, 60); g.up(180, 400); const s1 = g.win.__shots - s0;
  console.log("senza nemici: colpi in 1 s senza premere", s0, "| premendo", s1, ok(s0 === 0 && s1 > 5));
  g.click(100, 26); const tgt = X.isPressing(); g.up(100, 26); g.click(229, 26); const pz = X.isPressing(), st = X.state();
  console.log("tocco su “Bersaglio” e su pausa → non si preme:", !tgt && !pz, "| stato dopo pausa:", st, ok(!tgt && !pz && st === "pause"));
  console.log("errori JS:", g.errors.length ? g.errors[0] : "nessuno");
}
console.log("— Clone speculare: specchia le salve —");
{
  const g = makeGame({ seed: 3, patch: base() }); g.key("Enter"); g.frame(); const X = g.win.__x, p = X.getPlayer();
  X.clearAll();
  const s = X.makeShooter(X.TURRETS.hive, X.SLOT_X[0], X.GROUND_Y - 14); s.level = 2; X.slots()[0] = s;
  Object.assign(p.up, { kHive: 1, fan: 1, boom1: 1, punch: 1 }); p.x = p.targetX = 100;
  frozen(g, 60, 200);                              // nemici solo a sinistra: il clone (a destra) spara lo stesso, specchiato
  g.win.__b = []; run(g, 60);
  const B = g.win.__b, M = B.filter((b) => !b.clone && !b.fan), C = B.filter((b) => b.clone && !b.fan), CF = B.filter((b) => b.clone && b.fan), MF = B.filter((b) => !b.clone && b.fan);
  const right = C.every((b) => Math.cos(b.ang) > 0);
  console.log("automatica, nemici solo a sinistra → salve del guardiano", M.length, "| del clone", C.length, "verso destra (specchiate):", right, "| ventaglio del guardiano", MF.length, "e del clone", CF.length,
    ok(M.length > 3 && C.length === M.length && right && C.every((b) => !b.t) && CF.length === MF.length && CF.length === 4 * M.length));
  console.log("errori JS:", g.errors.length ? g.errors[0] : "nessuno");
}
console.log("— frenesia: scorre anche premendo (carica accorciata a 2 s per il test) —");
{
  const patch = base([["const FRENZY = { fill: [30, 25],", "const FRENZY = { fill: [2, 2],"], ["player.targetX = W / 2; player.cd = 0.3;", "player.targetX = W / 2; player.cd = 0.3; player.up.frenzy1 = 1;"]]);
  const g = makeGame({ seed: 3, patch }); g.key("Enter"); g.frame(); const X = g.win.__x, p = X.getPlayer(); X.clearAll();
  frozen(g, 180, -500);                           // fuori schermo: tiene aperta l’ondata senza nemici a schermo
  run(g, 240);
  console.log("4 s senza nemici e senza premere → barra piena:", (p.st.charge || 0) >= 1, "| frenesia partita:", (p.st.frenzyT || 0) > 0, ok(p.st.charge >= 1 && !(p.st.frenzyT > 0)));
  g.click(180, 400); run(g, 60); const t1 = p.st.frenzyT;
  console.log("premendo senza nemici → frenesia attiva, tempo rimasto:", t1.toFixed(2), "s", ok(t1 > 0 && t1 < 8));
  g.up(180, 400); run(g, 180); const t2 = p.st.frenzyT;
  console.log("rilasciato per 3 s senza nemici → tempo rimasto:", t2.toFixed(2), "s (in pausa)", ok(Math.abs(t2 - t1) < 0.03));
  g.click(180, 400); run(g, 60); g.up(180, 400);
  console.log("premendo ancora 1 s → tempo rimasto:", p.st.frenzyT.toFixed(2), "s", ok(Math.abs((t2 - p.st.frenzyT) - 1) < 0.06));
  console.log("errori JS:", g.errors.length ? g.errors[0] : "nessuno");
}
console.log("— frenesia in automatico —");
{
  const patch = base([["const FRENZY = { fill: [30, 25],", "const FRENZY = { fill: [2, 2],"], ["player.targetX = W / 2; player.cd = 0.3;", "player.targetX = W / 2; player.cd = 0.3; player.up.frenzy1 = 1;"]]);
  const g = makeGame({ seed: 3, patch }); g.key("Enter"); g.frame(); const X = g.win.__x, p = X.getPlayer();
  let withE = 0, withEdrop = 0, noE = 0, noEdrop = 0;
  for (let f = 0; f < 3000; f++) {
    const before = p.st.frenzyT || 0, alive0 = X.enemies().some((e) => !e.dead && e.y >= 0);
    g.frame(); g.texts.length = 0;
    const after = p.st.frenzyT || 0; if (!(before > 0)) continue;
    if (alive0) { withE++; if (after < before) withEdrop++; } else { noE++; if (after < before - 1e-9) noEdrop++; }
  }
  console.log(`con nemici a schermo: il tempo scorre in ${withEdrop}/${withE} fotogrammi | senza nemici: scorre in ${noEdrop}/${noE} fotogrammi`, ok(noE > 0 && noEdrop === 0 && withEdrop > 0));
  console.log("errori JS:", g.errors.length ? g.errors[0] : "nessuno");
}
