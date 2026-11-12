const { makeGame } = require("./bot.js");
const P = (h, ...pairs) => pairs.reduce((a, [x, y]) => { if (!a.includes(x)) throw new Error("manca: " + x.slice(0, 60)); return a.replace(x, y); }, h);
const base = (extra) => (h) => { let x = P(h, ["requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__x = { getPlayer: () => player, enemies: () => enemies, ents: () => ents, spawn, aim, isManual: () => manual, clearAll: () => { enemies = []; queue = []; } };\n})();"],
  ["domeHp: 100,", "domeHp: 1000000,"], ["options = rollOptions();", "options = [];"],
  ["  p.cd += PLAYER.interval /", "  window.__shots = (window.__shots || 0) + 1;\n  p.cd += PLAYER.interval /"]); for (const [a, b] of extra || []) x = P(x, [a, b]); return x; };
const ok = (c) => c ? "✓" : "✗ ERRORE";
const run = (g, n) => { for (let i = 0; i < n; i++) { g.frame(); g.texts.length = 0; } };
const frozen = (g, x, y) => { const X = g.win.__x; X.spawn({ enemy: "shell", x }); const e = X.enemies().slice(-1)[0]; e.x = x; e.y = y; e.speed = 0; e.spin = 0; e.hp = e.maxHp = 1e6; return e; };

console.log("— modalità manuale —");
{
  const g = makeGame({ seed: 3, patch: base(), settings: { targeting: "closest", aim: "manual" } }); g.key("Enter"); g.frame(); const X = g.win.__x, p = X.getPlayer();
  console.log("la partita parte in manuale:", X.isManual(), ok(X.isManual()));
  run(g, 420); const s0 = g.win.__shots || 0;
  console.log("7 s senza premere → colpi sparati:", s0, ok(s0 === 0));
  g.click(60, 200); run(g, 120); const s1 = (g.win.__shots || 0) - s0;
  const b = X.ents().find((o) => o.hit && o.vx !== undefined);
  console.log("2 s premendo a sinistra → colpi:", s1, "| il guardiano resta a x =", p.x, "| direzione del colpo verso sinistra:", b ? b.vx < 0 : "?", ok(s1 > 5 && p.x === 180 && b && b.vx < 0 && b.vy < 0));
  g.up(); const s2 = g.win.__shots; run(g, 120);
  console.log("rilasciato → nuovi colpi in 2 s:", g.win.__shots - s2, ok(g.win.__shots - s2 === 0));
  X.clearAll(); const e = frozen(g, 300, 150); const hp0 = e.hp; g.click(300, 150); run(g, 90); g.up();
  console.log("premendo su un nemico fermo → vita tolta:", Math.round(hp0 - e.hp), ok(hp0 - e.hp > 20));
  run(g, 120);                                   // lascio arrivare i colpi già in volo
  const hp1 = e.hp; g.click(80, 300); run(g, 90); g.up(); run(g, 120);
  console.log("premendo lontano dal nemico → vita tolta:", Math.round(hp1 - e.hp), "(i colpi vanno dritti verso il punto)", ok(hp1 - e.hp === 0));
  const hp2 = e.hp; g.click(60, 200); g.move(300, 150); run(g, 60); g.up(); run(g, 120);
  console.log("tenendo premuto e spostando il dito sul nemico → vita tolta:", Math.round(hp2 - e.hp), ok(hp2 - e.hp > 10));
  console.log("errori JS:", g.errors.length ? g.errors[0] : "nessuno");
}
console.log("— frenesia in manuale (carica accorciata a 2 s per il test) —");
{
  const patch = base([["const FRENZY = { fill: [30, 25],", "const FRENZY = { fill: [2, 2],"], ["player.targetX = W / 2; player.cd = 0.3;", "player.targetX = W / 2; player.cd = 0.3; player.up.frenzy1 = 1;"]]);
  const g = makeGame({ seed: 3, patch, settings: { targeting: "closest", aim: "manual" } }); g.key("Enter"); g.frame(); const p = g.win.__x.getPlayer();
  run(g, 240);
  console.log("4 s senza premere → barra piena:", (p.st.charge || 0) >= 1, "| frenesia partita:", (p.st.frenzyT || 0) > 0, ok(p.st.charge >= 1 && !(p.st.frenzyT > 0)));
  g.click(180, 200); run(g, 60); const t1 = p.st.frenzyT;
  console.log("premendo → frenesia attiva, tempo rimasto:", t1.toFixed(2), "s", ok(t1 > 0 && t1 < 8));
  g.up(); run(g, 180); const t2 = p.st.frenzyT;
  console.log("rilasciato per 3 s → tempo rimasto:", t2.toFixed(2), "s (in pausa)", ok(Math.abs(t2 - t1) < 0.03));
  g.click(180, 200); run(g, 60); g.up();
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
