const { makeGame, seeded } = require("./bot.js");
const P = (h, ...pairs) => pairs.reduce((a, [x, y]) => { if (!a.includes(x)) throw new Error("manca: " + x.slice(0, 60)); return a.replace(x, y); }, h);
const expose = (h) => P(h, ["requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__x = { para, slow, burn, weaken, vuln, knock, damage, spawn, enemies: () => enemies, hiveWave, slots: () => slots };\n})();"]);
const base = (extra) => (h) => { let x = P(expose(h), ["domeHp: 100,", "domeHp: 1000000,"], ["options = rollOptions();", "options = [];"]); for (const [a, b] of extra || []) x = P(x, [a, b]); return x; };
const BOSS = { type: "physical", hp: 1e9, speed: 100, r: 20, dmg: 1, boss: true, kbRes: 0.6, statRes: 0.5 };
function mk(g, def, x, y, spd) { const X = g.win.__x; X.spawn({ enemy: def ? "boss" : "drone", def, x }); const e = X.enemies().slice(-1)[0]; e.x = x; e.y = y; e.speed = spd === undefined ? 100 : spd; e.hp = e.maxHp = 1e9; return e; }
const ok = (c) => c ? "✓" : "✗ ERRORE";

console.log("— stati, knockback, intensità —");
{
  const g = makeGame({ seed: 2, patch: base() }); g.key("Enter"); g.frame(); const X = g.win.__x;
  const n1 = mk(g, null, 100, 300), b1 = mk(g, BOSS, 260, 300);
  X.para(n1, 2); X.para(b1, 2);
  console.log("paralisi: nemico", n1.paraT, "| boss", b1.paraT, ok(n1.paraT === 2 && b1.paraT === 0));
  X.knock(n1, 40); X.knock(b1, 40);
  console.log("knockback 40 px: nemico si sposta di", 300 - n1.y, "| boss di", (300 - b1.y).toFixed(1), "(resiste 60%)", ok(Math.abs(300 - n1.y - 40) < 1e-6 && Math.abs(300 - b1.y - 16) < 1e-6));
  X.burn(n1, 3, 10); X.burn(b1, 3, 10);
  console.log("bruciatura 10 al secondo: nemico", n1.burnDps, "| boss", b1.burnDps, "(resiste 50%)", ok(n1.burnDps === 10 && b1.burnDps === 5));
  const n2 = mk(g, null, 100, 300), b2 = mk(g, { ...BOSS }, 260, 300), n3 = mk(g, null, 100, 330), b3 = mk(g, { ...BOSS }, 260, 330);
  n2.def = { ...n2.def, type: "physical" }; n3.def = { ...n3.def, type: "physical" };
  const loss = (e, vulnerable) => { const hp0 = e.hp; if (vulnerable) X.vuln(e, 5, "all"); X.damage(e, 1000, "physical"); return hp0 - e.hp; };
  const ln = loss(n2, true) / loss(n3, false), lb = loss(b2, true) / loss(b3, false);
  console.log("vulnerabilità: nemico ×" + ln.toFixed(3), "| boss ×" + lb.toFixed(3), "(25% → 12,5%)", ok(Math.abs(ln - 1.25) < 1e-6 && Math.abs(lb - 1.125) < 1e-6));
  const n4 = mk(g, null, 100, 200), b4 = mk(g, { ...BOSS }, 260, 200); X.slow(n4, 5); X.slow(b4, 5);
  g.frame(); g.frame();
  console.log("rallentamento: nemico a", (n4.curSpeed / n4.speed).toFixed(2) + "× velocità | boss a", (b4.curSpeed / b4.speed).toFixed(2) + "×", "(−50% → −25%)", ok(Math.abs(n4.curSpeed / n4.speed - 0.5) < 1e-6 && Math.abs(b4.curSpeed / b4.speed - 0.75) < 1e-6));
  console.log("errori JS:", g.errors.length ? g.errors[0] : "nessuno");
}

console.log("— onda dell’Hive —");
{
  const g = makeGame({ seed: 2, patch: base() }); g.key("Enter"); g.frame(); const X = g.win.__x;
  const n = mk(g, null, 180, 250), b = mk(g, BOSS, 200, 250); const s = { up: {} };
  X.hiveWave(s, { x: 180, y: 300 }, 1, -Math.PI / 2);
  console.log("spinta dell’onda: nemico", (250 - n.y).toFixed(1), "px | boss", (250 - b.y).toFixed(1), "px (resiste 60%)", ok(Math.abs(250 - n.y - 16) < 1e-6 && Math.abs(250 - b.y - 6.4) < 1e-6));
}

console.log("— attrazione (Gravity Vortex Gun) —");
{
  const patch = base([["startTurrets: [],", 'startTurrets: ["vortex"],'],
    ["META.startTurrets.slice(0, 4).forEach((id, i) => { slots[i] = makeShooter(TURRETS[id], SLOT_X[i], GROUND_Y - 14); });", "META.startTurrets.slice(0, 4).forEach((id, i) => { slots[i] = makeShooter(TURRETS[id], SLOT_X[i], GROUND_Y - 14); }); slots.forEach(s => { if (s) s.up.pull = 1; }); player.cd = 1e9;"], ["Math.sin(waveTime * 2 + e.phase) * 12 * dt", "0"]]);
  const g = makeGame({ seed: 3, patch, cleared: 50, level: 10 }); g.key("Enter"); g.frame(); const X = g.win.__x;
  g.click(100, 26);                                  // regola "vita più alta": il buco nero punta sempre il bersaglio con più vita
  const tg = mk(g, null, 72, 340, 0); tg.hp = tg.maxHp = 2e9;
  const n = mk(g, null, 52, 310, 0), b = mk(g, BOSS, 92, 310, 0);
  const x0 = { n: n.x, b: b.x };
  for (let f = 0; f < 600; f++) { g.frame(); g.texts.length = 0; }
  console.log("spostamento orizzontale: nemico", (n.x - x0.n).toFixed(1), "px verso il buco nero | boss", (x0.b - b.x).toFixed(1), "px", ok(Math.abs(n.x - x0.n) > 5 && Math.abs(b.x - x0.b) < 1e-6));
  console.log("errori JS:", g.errors.length ? g.errors[0] : "nessuno");
}

console.log("— teletrasporto (Disruption Drone) —");
{
  const patch = base([["Math.random() < 0.05)", "Math.random() < 1)"], ["startTurrets: [],", 'startTurrets: ["disr"],'],
    ["META.startTurrets.slice(0, 4).forEach((id, i) => { slots[i] = makeShooter(TURRETS[id], SLOT_X[i], GROUND_Y - 14); });", "META.startTurrets.slice(0, 4).forEach((id, i) => { slots[i] = makeShooter(TURRETS[id], SLOT_X[i], GROUND_Y - 14); }); slots.forEach(s => { if (s) s.up.tp1 = 1; }); player.cd = 1e9;"], ["Math.sin(waveTime * 2 + e.phase) * 12 * dt", "0"]]);
  const g = makeGame({ seed: 3, patch, cleared: 50, level: 10 }); g.key("Enter"); g.frame(); const X = g.win.__x;
  const n = mk(g, null, 100, 300, 0), b = mk(g, BOSS, 260, 300, 0);
  for (let f = 0; f < 500; f++) { g.frame(); g.texts.length = 0; }
  console.log("posizione dopo il campo con teletrasporto al 100%: nemico y =", Math.round(n.y), "(spostato) | boss y =", Math.round(b.y), "(fermo)", ok(n.y < 300 && b.y === 300));
  console.log("errori JS:", g.errors.length ? g.errors[0] : "nessuno");
}
