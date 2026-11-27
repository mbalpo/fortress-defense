// Ranger fino al livello 20 (1.28.0, DESIGN.md § 17 “Livello massimo 20”): valori dei supporti dall’11 al 20 (tabella del § 17), conversioni +5% di danno
// del guardiano per livello (anche Atlante), effetti in campo (bruciatura di Alfa, due stati di Omega), frammenti con M e bonus di completamento, schermata.
const { makeGame } = require("./bot.js");
const ok = (c) => c ? "✓" : "✗ ERRORE";
const patch = (h) => h.replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();");
const ALL = ["alfa", "prometeo", "omega", "mnemosine", "sigma", "ceo", "gamma", "iperione", "epsilon", "atlante"];
const at = (L) => 200 * (1 + 0.5 * (L - 1));
function fresh(eq, lv, extra) {
  const frags = {}; for (const id of ALL) frags[id] = (lv && lv[id]) != null ? at(lv[id]) : 0;
  const prog = Object.assign({ cleared: 60, seen: [], planet: { lv: {}, frags, day: { d: "", n: 0 }, eq: eq || [] } }, extra || {});
  const g = makeGame({ patch, cleared: 60, level: 30, storage: { "fortress-progress-v1": JSON.stringify(prog) } }); g.frame();
  return { g, ev: g.win.__ev };
}
const J = (ev, c) => JSON.parse(ev("JSON.stringify(" + c + ")"));
const r2 = (x) => Math.round(x * 100) / 100;

console.log("— Valori dall’11 al 20 —");
{
  const { ev } = fresh();
  const L = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20], row = (f) => L.map((l) => r2(ev(`${f}(${l})`))).join(" ");
  const rows = {
    cd: [row("RV.cd"), "20 20 20 20 20 20 20 20 20 20"],
    dmg: [row("RV.dmg"), "2.5 2.65 2.8 2.95 3.1 3.25 3.4 3.55 3.7 3.85"],
    alfaY: [row("RV.alfaY"), "10 10 10 10 10 10 10 10 10 10"],
    alfaZ: [row("RV.alfaZ"), "1 1 1 1 1 1 1 1 1 1"],
    alfaBurnT: [row("RV.alfaBurnT"), "3.2 3.4 3.6 3.8 4 4.2 4.4 4.6 4.8 5"],
    omegaDeg: [row("RV.omegaDeg"), "120 120 120 120 120 120 120 120 120 120"],
    omegaT: [row("RV.omegaT"), "3.2 3.4 3.6 3.8 4 4.2 4.4 4.6 4.8 5"],
    omegaStates: [row("RV.omegaStates"), "1 1 1 1 2 2 2 2 2 2"],
    sigmaN: [row("RV.sigmaN"), "5 5 5 5 5 5 5 5 5 5"],
    sigmaP: [row("RV.sigmaP"), "0.55 0.6 0.65 0.7 0.75 0.8 0.85 0.9 0.95 1"],
    gammaN: [row("RV.gammaN"), "12 13 13 13 14 14 14 15 15 15"],
    gammaMul: [row("RV.gammaMul"), "1.7 1.77 1.84 1.91 1.98 2.05 2.12 2.19 2.26 2.33"],
    epsMul: [row("RV.epsMul"), "2.05 2.05 2.2 2.2 2.35 2.35 2.5 2.5 2.65 2.65"],
    epsN: [row("RV.epsN"), "6 7 7 7 8 8 8 9 9 9"],
    epsRange: [row("RV.epsRange"), "377 377 377 416 416 455 455 455 455 494"],
    convDmg: [row("RV.convDmg"), "0.05 0.1 0.15 0.2 0.25 0.3 0.35 0.4 0.45 0.5"],
  };
  for (const [k, [got, exp]] of Object.entries(rows)) console.log(k.padEnd(11), got, ok(got === exp));
  const low = [1, 5, 10].map((l) => [ev(`RV.epsN(${l})`), ev(`RV.epsMul(${l})`), ev(`RV.epsRange(${l})`), ev(`RV.gammaN(${l})`), ev(`RV.sigmaN(${l})`), r2(ev(`RV.alfaZ(${l})`))].join("/")).join(" · ");
  console.log("livelli 1 / 5 / 10 come prima (missili, danno, portata di Epsilon, bolle, bersagli, bruciatura):", low, ok(low === "2/1/260/2/1/0.1 · 3/1.6/299/6/3/0.5 · 6/1.9/377/12/5/1"));
}

console.log("— Conversioni dopo il 10 —");
{
  const r = {};
  for (const [id, L] of [["prometeo", 10], ["prometeo", 20], ["atlante", 15], ["atlante", 20], ["iperione", 13]]) {
    const { g, ev } = fresh([id], { [id]: L }); g.key("Enter"); g.frame();
    r[id + L] = J(ev, "({ conv: RG.conv && RG.conv.k, ign: RG.ign, pdmg: r2(RG.pdmg), mul: r2(gearMul()) })".replace(/r2\(/g, "(x => Math.round(x * 100) / 100)("));
  }
  console.log(JSON.stringify(r), ok(r.prometeo10.conv === 1 && r.prometeo10.pdmg === 0 && r.prometeo20.conv === 1 && r.prometeo20.pdmg === 0.5 && r.prometeo20.mul === 1.5
    && r.atlante15.ign === 1 && r.atlante15.pdmg === 0.25 && r.atlante20.mul === 1.5 && r.iperione13.pdmg === 0.15));
  const { g, ev } = fresh(["prometeo"], { prometeo: 20 }); g.key("Enter"); g.frame();
  const d = J(ev, "(() => { const a = guardDps(player); RG.pdmg = 0; const b = guardDps(player); return [a, b]; })()");
  console.log("Prometeo al 20: danno al secondo del guardiano ×", r2(d[0] / d[1]), "(+50%, sommato all’equipaggiamento)", ok(Math.abs(d[0] / d[1] - 1.5) < 1e-9));
}

console.log("— Effetti in campo —");
{
  const { g, ev } = fresh(["alfa"], { alfa: 20 }); g.key("Enter"); g.frame();
  ev("queue = []; enemies = []; spawn({ enemy: 'brute', x: 180 }); Object.assign(enemies[0], { y: 380, speed: 0, hp: 1e6, maxHp: 1e6 }); player.cd = 1e9; RG.list[0].t = 0");
  let burnT = 0; for (let i = 0; i < 20 && !burnT; i++) { g.frame(); burnT = ev("enemies[0].burnT"); }
  console.log("Alfa al 20: bruciatura appena applicata", r2(burnT), "s (attesi 5)", ok(burnT > 4.8 && burnT <= 5));
  const st = (L) => { const { g, ev } = fresh(["omega"], { omega: L }); g.key("Enter"); g.frame();
    ev("queue = []; enemies = []; for (const x of [150, 180, 210]) { spawn({ enemy: 'brute', x }); Object.assign(enemies[enemies.length - 1], { y: 360, speed: 0, hp: 1e6, maxHp: 1e6 }); } player.cd = 1e9; RG.list[0].t = 0");
    for (let i = 0; i < 3; i++) g.frame();
    return J(ev, "enemies.map((e) => [e.vulnT > 0, e.slowT > 0, e.weakT > 0].filter(Boolean).length)").join(","); };
  const s14 = st(14), s15 = st(15);
  console.log("Omega: stati per nemico al 14", s14, "· al 15", s15, ok(s14 === "1,1,1" && s15 === "2,2,2"));
}

console.log("— Frammenti: M e bonus di completamento —");
{
  const run = (lv, won) => { const { ev } = fresh([], lv);
    ev(`planetType = 'electric'; startRun('planet'); pw.mb = 3; wave = 20; ${won ? "winLevel()" : "domeHp = 0; update(0.01)"}`);
    return J(ev, "Object.assign({}, planetGain, { day: dayType() === planetType })"); };
  const a = run({}, false), b = run({}, true), c = run({ alfa: 10, omega: 10, gamma: 12 }, true);
  const x = (g) => g.day ? 2 : 1;
  console.log("persa all’ondata 20 con 3 mini-boss:", a.n, "· vinta:", b.n, "(+0,5 F) · vinta con 3 ranger al 10 o più (M", c.M + "):", c.n,
    ok(a.n === 10 * x(a) && b.n === 15 * x(b) && c.M === 1.3 && c.n === Math.round(10 * 1.3 * 1.5 * x(c)) && b.won && !a.won));
}

console.log("— Schermata —");
{
  const { g, ev } = fresh([], { alfa: 20, sigma: 15, prometeo: 12, atlante: 20 });
  ev("openRangers('menu'); rangerSel = 'alfa'"); g.texts.length = 0; g.frame(); const t1 = g.texts.join("|");
  ev("rangerSel = 'atlante'"); g.texts.length = 0; g.frame(); const t2 = g.texts.join("|");
  console.log("Alfa al 20:", /Liv 20\|/.test(t1 + "|") && /per 5 s/.test(t1), "· Atlante:", /ignora il 100% della resistenza, danno \+50%/.test(t2), "· errori JS:", g.errors.length ? g.errors[0] : "nessuno",
    ok(/Liv 20\|/.test(t1 + "|") && /per 5 s/.test(t1) && /ignora il 100% della resistenza, danno \+50%/.test(t2) && !g.errors.length));
}
