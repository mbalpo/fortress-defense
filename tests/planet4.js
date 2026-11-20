// Protezione planetaria, fase 4 (DESIGN.md § 17): boss giganti. Dimensioni, ingresso dall’alto (bersagli appena si vedono), collisioni con la sagoma,
// intercettori (fire), alati a 75/55/35% (force), assorbimento con tetto (electric), raggio e fermata al 25% (energy), scissioni (physical), barra, vittoria, HD-2D.
const { makeGame } = require("./bot.js");
const ok = (c) => c ? "✓" : "✗ ERRORE";
const patch = (h) => h.replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();");
const J = (ev, c) => JSON.parse(ev("JSON.stringify(" + c + ")"));
// partita al livello L del tipo t, campo vuoto, il boss già entrato (in alto, bordo inferiore a 0)
function bossGame(t, L, settings) {
  const g = makeGame({ patch, cleared: 60, level: 61, settings, storage: { "fortress-progress-v1": JSON.stringify({ cleared: 60, seen: [], planet: { lv: { [t]: (L || 1) - 1 }, frags: {}, day: { d: "", n: 0 }, eq: [] } }) } });
  g.frame(); const ev = g.win.__ev;
  ev(`openPlanet(); startPlanet("${t}"); queue = []; enemies = []; for (let k = 1; k < 18; k++) pw.clr[k] = true; planetWave(18); queue = queue.filter((q) => q.def); waveTime += 2.05`);
  ev("for (let k = 1; k < 20; k++) pw.clr[k] = true; wave = 20; pw.next = Infinity; pw.choices = []");   // l’ondata 20 è partita e le altre sono ripulite: nessuna scelta in mezzo
  ev("update(0.001); player.cd = 1e9; window.B = () => enemies.find((e) => e.final && !e.dead)");
  return { g, ev };
}
const hold = (ev) => ev("domeHp = domeMax; player.cd = 1e9; if (state === 'upgrade') pick(0)");

console.log("— Dimensioni e ingresso —");
{
  const sz = {};
  for (const t of ["fire", "force", "electric", "energy", "physical"]) { const { ev } = bossGame(t); sz[t] = J(ev, "(() => { const b = B(); return { w: 2 * (b.def.box ? b.def.box[0] : b.def.r), h: 2 * (b.def.box ? b.def.box[1] : b.def.r), bottom: Math.round(bottomOf(b)), name: b.def.name }; })()"); }
  console.log("sagome (larghezza × altezza):", Object.entries(sz).map(([t, s]) => s.name + " " + s.w + "×" + s.h).join(" · "), "| entrano con il bordo inferiore a", sz.fire.bottom,
    ok(sz.energy.w === 180 && sz.energy.h === 384 && sz.physical.w === 360 && sz.force.h === 270 && Object.values(sz).every((s) => Math.abs(s.bottom) <= 1)));
  const { g, ev } = bossGame("fire");
  const t0 = ev("living().includes(B())"); let f = 0; while (!ev("living().includes(B())") && f++ < 400) { hold(ev); g.frame(); }
  console.log("bersaglio appena si vede: all’inizio", t0, "→ dopo", f, "fotogrammi, con il bordo inferiore a", Math.round(ev("bottomOf(B())")), "px (il centro ancora fuori:", ev("B().y < 0") + ")",
    ok(!t0 && ev("living().includes(B())") && ev("B().y") < 0 && ev("pickTargets({ x: 180, y: 554 }, 9999, 1)[0] === B()")));
}

console.log("— Collisioni con la sagoma —");
{
  const { g, ev } = bossGame("fire");
  ev("B().y = 150; B().speed = 0"); const h0 = ev("B().hp");
  ev("playerBullet(player, 290, 500, null, 50, -Math.PI / 2)"); for (let i = 0; i < 40; i++) { hold(ev); g.frame(); }
  const hit = h0 - ev("B().hp");
  console.log("colpo dritto in alto a 110 px dal centro dell’Ammiraglia (larga 260): danno", Math.round(hit), ok(hit > 0));
  ev("playerBullet(player, 20, 500, null, 50, -Math.PI / 2)"); const h1 = ev("B().hp"); for (let i = 0; i < 40; i++) { hold(ev); g.frame(); }
  console.log("a 160 px dal centro (fuori dalla sagoma): danno", Math.round(h1 - ev("B().hp")), ok(h1 === ev("B().hp")));
}

console.log("— Abilità —");
{
  const f = bossGame("fire"); f.ev("B().y = 100; B().speed = 0; B().icd = 0"); hold(f.ev); f.g.frame();
  const n0 = f.ev("ents.filter((o) => o.intercept).length");   // nessun colpo in volo: nessuna salva (1.19.1)
  f.ev("spawnEnt({ x: 100, y: 330, dead: false, proj: true, update() {}, draw() {} }); spawnEnt({ x: 260, y: 600, dead: false, proj: true, update(dt) { this.y -= 300 * dt; }, draw() {} }); B().icd = 0");
  hold(f.ev); f.g.frame(); hold(f.ev); f.g.frame();
  const n = f.ev("ents.filter((o) => o.intercept).length"), two = f.ev("(() => { const m = ents.filter((o) => o.intercept); return m.length === 2 && !!m[0].tg && !!m[1].tg && m[0].tg !== m[1].tg; })()");
  for (let i = 0; i < 60; i++) { hold(f.ev); f.g.frame(); }
  const left = f.ev("ents.filter((o) => o.proj).length");
  console.log("Ammiraglia: senza colpi in volo nessuna salva:", n0, "| salva di", n, "intercettori (livello 1: 2), su due colpi diversi:", two, "| colpi distrutti (uno fermo, uno che sale):", left === 0,
    ok(n0 === 0 && n === 2 && two && left === 0));

  const c = bossGame("force", 4); c.ev("B().speed = 0");
  const at = (b) => { c.ev(`B().y += ${b} - bottomOf(B())`); hold(c.ev); c.g.frame(); return [c.ev("enemies.filter((e) => e.def.look === 'wing').length"), c.ev("!!B().wingsOut")]; };
  const r = [at(150), at(165), at(290), at(420)];
  console.log("Nave madre al livello 4 (7 alati a rilascio): alati e ali a 150 / 165 / 290 / 420 px:", JSON.stringify(r), "| contano per l’ondata 20:", c.ev("enemies.filter((e) => e.def.look === 'wing').every((e) => e.w === 20)"),
    ok(JSON.stringify(r) === "[[0,false],[7,true],[14,true],[21,true]]" && c.ev("enemies.filter((e) => e.def.look === 'wing').every((e) => e.w === 20)")));

  const ab = [1, 6, 12].map((L) => bossGame("electric", L).ev("B().def.absorb"));
  const e = bossGame("electric", 6); e.ev("B().y = 100; B().speed = 0; B().hp = B().maxHp = 1e9; window.__n = 0; for (let i = 0; i < 4000; i++) { const h = B().hp; damage(B(), 1, 'physical', true); if (B().hp === h) window.__n++; }");
  console.log("Disco volante: assorbimento ai livelli 1 / 6 / 12:", ab.join(" / "), "(tetto 0,5) | su 4000 colpi al livello 6 assorbiti", e.ev("window.__n"),
    ok(ab[0] === 0.1 && Math.abs(ab[1] - 0.3) < 1e-9 && ab[2] === 0.5 && Math.abs(e.ev("window.__n") / 4000 - 0.3) < 0.04));

  const p = bossGame("energy"); p.ev("B().y += 477 - bottomOf(B())"); for (let i = 0; i < 120; i++) { hold(p.ev); p.g.frame(); }
  const stop = Math.round(p.ev("bottomOf(B())"));
  p.ev("B().rcd = 0; window.__d0 = domeHp = domeMax; window.__dmg = B().dmg"); p.g.frame(); for (let i = 0; i < 60; i++) p.g.frame();
  const ray = p.ev("window.__d0 - domeHp"), exp = p.ev("window.__dmg * 2 * (1 - domeRed())");
  console.log("Prisma gigante: si ferma con il bordo inferiore a", stop, "px (25% dal basso = 480) | raggio sulla cupola: danno", ray.toFixed(2), "(atteso", exp.toFixed(2) + ")",
    ok(stop === 480 && Math.abs(ray - exp) < 1e-6));

  const m = bossGame("physical", 6); m.ev("B().y = 0; B().speed = 0"); const full = m.ev("B().maxHp");
  m.ev("damage(B(), B().hp * 0.52, 'fire', true)"); const kids = J(m.ev, "enemies.filter((e) => e.final && !e.dead).map((e) => ({ r: e.def.r, hp: Math.round(e.hp), s: e.def.split }))");
  m.ev("const k = B(); damage(k, k.hp * 0.6, 'fire', true); damage(enemies.find((e) => e.final && e.dead), 1e9, 'fire', true)");   // anche un colpo al meteorite già diviso: nessuna scissione in più
  const gen2 = J(m.ev, "enemies.filter((e) => e.final && !e.dead).map((e) => e.def.r)");
  m.g.texts.length = 0; m.g.frame();
  const tot = m.ev("enemies.filter((e) => e.final && !e.dead).reduce((a, e) => a + e.hp, 0) / pw.bossMax");
  console.log("Meteorite al livello 6 (2 scissioni): a metà vita", JSON.stringify(kids), "| un pezzo a metà:", JSON.stringify(gen2), "| barra:", tot.toFixed(3), "| nome in alto:", m.g.texts.includes("METEORITE"),
    ok(kids.length === 2 && kids.every((k) => k.r === 90 && k.s === 1 && Math.abs(k.hp - full * 0.24) < 2) && gen2.sort().join() === "45,45,90" && tot > 0 && tot < 0.48 && m.g.texts.includes("METEORITE")));
  m.ev("queue = []; enemies.filter((e) => e.final && !e.dead).forEach((e) => { e.def = Object.assign({}, e.def, { split: 0 }); damage(e, 1e12, 'fire'); })"); m.g.frame(); m.g.frame();
  console.log("tutti i pezzi sconfitti → vittoria:", m.ev("state"), ok(m.ev("state") === "won"));
}

console.log("— HD-2D —");
{
  const errs = [];
  for (const t of ["fire", "force", "electric", "energy", "physical"]) {
    const { g, ev } = bossGame(t, 6, { graphics: "hd2d" });
    ev("B().y += 300 - bottomOf(B())"); for (let i = 0; i < 90; i++) { hold(ev); g.frame(); }
    errs.push(...g.errors);
  }
  console.log("i cinque boss in HD-2D per 90 fotogrammi, errori JS:", errs[0] || "nessuno", ok(!errs.length));
}
