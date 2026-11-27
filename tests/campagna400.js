// Campagna a 400 livelli (1.26.0, DESIGN.md § 4 e § 16 “Campagna a 400 livelli”): limite dei livelli, salvataggio fino a 400,
// griglia dei livelli a 8 pagine con ‹ ›, tabella dei drop oltre il 180, pendenza 0,8 oltre la difficoltà 200, partite al 400 in Standard ed Epica.
const { makeGame } = require("./bot.js");
const ok = (c) => c ? "✓" : "✗ ERRORE";
const patch = (h) => h.replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();");
const fresh = (prog, level) => {
  const g = makeGame({ patch, cleared: prog.cleared, level, storage: { "fortress-progress-v1": JSON.stringify(Object.assign({ seen: [] }, prog)) } }); g.frame();
  return { g, ev: g.win.__ev, T: () => { g.texts.length = 0; g.frame(); return g.texts.join("|"); } };
};

console.log("— Limite e salvataggio —");
{
  const a = fresh({ cleared: 350, clearedEpic: 380, claims: ["s350", "s350p", "e380"] });
  const b = fresh({ cleared: 999, clearedEpic: 999 });
  const r = [a.ev("CAMPAIGN.maxLevel"), a.ev("progress.cleared"), a.ev("progress.clearedEpic"), a.ev("progress.claims.join()"), b.ev("progress.cleared"), b.ev("progress.clearedEpic")];
  console.log("maxLevel", r[0], "| completati 350 ed Epica 380 conservati:", r[1], r[2], "| premi", r[3], "| 999 → ", r[4], r[5],
    ok(r[0] === 400 && r[1] === 350 && r[2] === 380 && r[3] === "s350,s350p,e380" && r[4] === 400 && r[5] === 400));
  const exp = JSON.parse(a.ev("JSON.stringify(parseSave(JSON.stringify(makeSave())))"));
  console.log("esportato e reimportato: completati", exp.cleared, "Epica", exp.clearedEpic, ok(exp.cleared === 350 && exp.clearedEpic === 380));
}

console.log("— Griglia dei livelli a 8 pagine —");
{
  const { g, ev, T } = fresh({ cleared: 399, clearedEpic: 0 });
  ev("openLevels(); lvMode = 'standard'; lvPage = 0");
  const t0 = T();
  for (let i = 0; i < 9; i++) { g.click(322, 95); g.up(322, 95); }   // ›, una volta di troppo
  const t8 = T(), p8 = ev("lvPage");
  g.key("ArrowLeft"); const p7 = ev("lvPage"); g.key("ArrowRight"); g.key("ArrowRight");
  ev("pickLevel(400)"); const sel = ev("lvSel");
  console.log("pagina 1:", /Livelli 1-50 · pagina 1 di 8/.test(t0), "| › fino in fondo:", /Livelli 351-400 · pagina 8 di 8/.test(t8), p8, "| ← →:", p7, ev("lvPage"), "| livello 400 scelto:", sel,
    ok(/Livelli 1-50 · pagina 1 di 8/.test(t0) && /Livelli 351-400 · pagina 8 di 8/.test(t8) && p8 === 7 && p7 === 6 && ev("lvPage") === 7 && sel === 400));
  ev("setSel('standard', 400); lvPage = 0; lvTab('standard')"); console.log("all’apertura la pagina del livello scelto (400):", ev("lvPage"), ok(ev("lvPage") === 7));
  for (let i = 0; i < 9; i++) { g.click(38, 95); g.up(38, 95); }
  console.log("‹ fino all’inizio:", ev("lvPage"), "| errori JS:", g.errors.length ? g.errors[0] : "nessuno", ok(ev("lvPage") === 0 && !g.errors.length));
}

console.log("— Drop e difficoltà oltre il 200 —");
{
  const { ev } = fresh({ cleared: 60 });
  const rows = JSON.parse(ev("JSON.stringify(DROP_RARITY)"));
  const sums = rows.every(([, w]) => w.reduce((a, b) => a + b, 0) === 100), mono = rows.every(([, w], i) => !i || (w[0] <= rows[i - 1][1][0] && w[4] >= rows[i - 1][1][4]));
  console.log("righe", rows.map(([d]) => d).join(","), "| somme 100:", sums, "| comune giù, ancestrale su:", mono,
    ok(rows.map(([d]) => d).join() === "30,60,100,140,180,220,260,300,340,380" && sums && mono));
  const N = 20000, cnt = (D) => JSON.parse(ev(`(() => { const c = [0, 0, 0, 0, 0]; for (let i = 0; i < ${N}; i++) c[rollRarity(${D})]++; return JSON.stringify(c.map((x) => Math.round(x / ${N} * 1000) / 10)); })()`));
  const d200 = cnt(200), d300 = cnt(300), d430 = cnt(430);
  const near = (a, b) => a.every((x, i) => Math.abs(x - b[i]) < 1.2);
  console.log("rarità estratte al 200", d200.join("/"), "| 300", d300.join("/"), "| 430", d430.join("/"),
    ok(near(d200, [22, 36, 24, 14, 4]) && near(d300, [7, 27, 30, 26, 10]) && near(d430, [2, 21, 30, 33, 14])));
  const e = [200, 300, 400, 430].map((d) => ev(`effD(${d})`));
  console.log("difficoltà effettiva al 200/300/400/430:", e.join(" / "), "(pendenza 0,8 oltre il 200)", ok(e.join() === "230,310,390,414"));
}

console.log("— Partite al 400 —");
for (const [mode, prog] of [["standard", { cleared: 399 }], ["epic", { cleared: 400, clearedEpic: 399 }]]) {
  const { g, ev } = fresh(prog, 400);
  ev(`lvMode = '${mode}'; setSel('${mode}', 400); startRun('${mode}')`);
  for (let i = 0; i < 600; i++) g.frame();
  const st = [ev("state"), ev("mode"), ev("campLevel"), ev("curDiff()"), ev("wave"), ev("enemies.length")];
  ev("wave = 19; queue = []; enemies.length = 0; startWave(20)"); for (let i = 0; i < 300; i++) g.frame();
  const boss = ev("(enemies.find((e) => e.def.boss || e.boss) || {}).def ? 1 : 0");
  console.log(mode, "400: stato", st[0], "| livello", st[2], "difficoltà", st[3], "| ondata", st[4], "nemici", st[5], "| boss finale all’ondata 20:", !!boss, "| errori JS:", g.errors.length ? g.errors[0] : "nessuno",
    ok(st[0] === "play" && st[1] === mode && st[2] === 400 && st[3] === (mode === "epic" ? 430 : 400) && !g.errors.length));
}
