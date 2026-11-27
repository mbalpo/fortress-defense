// Pacco regalo (1.21.0, DESIGN.md § 17): Standard dal 61, Epica dal 31, non nella Protezione planetaria; 60% per livello (1.27.0, prima 25%), ondata tra la 3 e la 19 (non 5, 10, 15);
// solo il guardiano tenendo premuto lo colpisce (mirino entro 45 px), i nemici in mezzo fermano i colpi; timer fermo in pausa e nelle carte, scorre con la velocità;
// premio a estrazione (1.27.0): 50% frammenti di un ranger non al massimo (5 Standard, 10 Epica, × M), 20% pezzo, 20% Modulo (rarità dalla tabella dei drop), 8% 5 Sigilli, 2% 1 maggiore;
// con tutti i ranger al massimo il pacco compare comunque e la quota dei frammenti va alle altre; partita sospesa e “Continua”.
const { makeGame } = require("./bot.js");
const ok = (c) => c ? "✓" : "✗ ERRORE";
const patch = (h) => h.replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();");
const J = (ev, c) => JSON.parse(ev("JSON.stringify(" + c + ")"));
const IDS = ["alfa", "prometeo", "omega", "mnemosine", "sigma", "ceo", "gamma", "iperione", "epsilon", "atlante"];
const frags = (top) => Object.fromEntries(IDS.map((id) => [id, top.includes(id) ? 2100 : 0]));   // 2100 = livello 20, il massimo dalla 1.28.0 (prima 1100, livello 10)
function game(o) {
  o = o || {};
  const prog = { cleared: 200, clearedEpic: 200, seen: o.seen || ["gift"], planet: { lv: {}, frags: frags(o.max || []), day: { d: "", n: 0 }, eq: o.eq || [] } };
  const storage = Object.assign({ "fortress-progress-v1": JSON.stringify(prog) }, o.storage || {});
  if (o.gfx) storage["fortress-proto-v1"] = JSON.stringify({ targeting: "closest", graphics: o.gfx });
  const g = makeGame({ patch, seed: o.seed || 3, storage }); g.frame();
  return { g, ev: g.win.__ev };
}
// livello avviato con il pacco nell’ondata 4 e campo vuoto; il pacco fermo in (x, y), timer pieno
const START = (mode, lv) => `setSel("${mode}", ${lv}); startRun("${mode}"); queue = []; enemies = [];`;
const READY = (x, y) => `giftPlan = { wave: 4, done: false }; startWave(4); queue = []; enemies = []; ents = []; waveTime = 0.5; spawnGift(); giftWait = -1; gift.x = gift.tx = ${x}; gift.y = gift.ty = ${y}; gift.phase = "float";
  GIFT.speed = 0; queue.push({ t: 999, enemy: "drone", x: 10 });`;   // un nemico in coda lontano: l’ondata non finisce
const foe = (k, x, y) => `spawn({ enemy: "${k}", x: ${x} }); Object.assign(enemies[enemies.length - 1], { x: ${x}, y: ${y}, speed: 0, hp: 1e9, maxHp: 1e9 });`;
const step = (ev, sec) => ev(`for (let i = 0; i < ${Math.round(sec / 0.02)}; i++) { update(0.02); domeHp = domeMax; }`);

console.log("— Dove e quando —");
{
  const { ev } = game();
  const on = (m, lv) => ev(`(() => { ${START(m, lv)} return giftOn(); })()`);
  const r = [["standard", 60], ["standard", 61], ["epic", 30], ["epic", 31]].map(([m, l]) => on(m, l));
  console.log("Standard 60 / 61:", r[0], "/", r[1], "· Epica 30 / 31:", r[2], "/", r[3], ok(!r[0] && r[1] && !r[2] && r[3]));
  const st = J(ev, `(() => { ${START("standard", 61)} let n = 0; const w = {}; for (let i = 0; i < 8000; i++) { giftRoll(); if (giftPlan) { n++; w[giftPlan.wave] = (w[giftPlan.wave] || 0) + 1; } } return { n, w: Object.keys(w).map(Number).sort((a, b) => a - b) }; })()`);
  const allowed = [3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19];
  console.log("8000 tiri al 61: pacco nel", (st.n / 80).toFixed(1) + "% · ondate:", st.w.join(" "), ok(Math.abs(st.n / 8000 - 0.6) < 0.02 && st.w.join(" ") === allowed.join(" ")));
  const ep = ev(`(() => { ${START("epic", 31)} let n = 0; for (let i = 0; i < 8000; i++) { giftRoll(); if (giftPlan) n++; } return n; })()`);
  console.log("8000 tiri in Epica 31: pacco nel", (ep / 80).toFixed(1) + "%", ok(Math.abs(ep / 8000 - 0.6) < 0.02));
  // generatore separato: tiro e scelta dell’ondata non toccano Math.random (le calibrazioni a semi fissi non cambiano)
  const n1 = ev(`(() => { ${START("standard", 61)} const R = Math.random; let n = 0; Math.random = () => { n++; return R(); }; for (let i = 0; i < 500; i++) giftRoll(); Math.random = R; return n; })()`);
  const n2 = ev(`(() => { ${START("standard", 61)} giftPlan = { wave: 3, done: false }; startWave(3); queue = []; enemies = []; waveTime = 3.1; const R = Math.random; let n = 0; Math.random = () => { n++; return R(); }; for (let i = 0; i < 200; i++) giftTick(0.02); Math.random = R; return !!gift && n; })()`);
  console.log("chiamate a Math.random: 500 tiri", n1, "· comparsa e 4 s di volo", n2 === false ? "pacco non comparso" : n2, ok(n1 === 0 && n2 === 0));
  const pl = ev(`(() => { giftRand = () => 0; clearRun(); openPlanet(); startPlanet("fire"); return mode === "planet" && giftPlan === null && !giftOn(); })()`);
  console.log("Protezione planetaria con il tiro sempre favorevole: nessun pacco", pl, ok(pl));
  const w = J(ev, `(() => { giftRand = () => 0.01; ${START("standard", 61)} const p = giftPlan; startWave(p.wave); queue = [{ t: 999, enemy: "drone", x: 10 }]; enemies = []; waveTime = 2.9; update(0.05); const before = !!gift; update(0.2); return { wave: p.wave, before, after: !!gift, y: gift && gift.y, ph: gift && gift.phase }; })()`);
  console.log("pacco dell’ondata", w.wave, "· prima dei 3 s:", w.before, "· dopo: entra dall’alto (y " + Math.round(w.y) + ", " + w.ph + ")", ok(!w.before && w.after && w.ph === "in" && w.y < 30));
}

console.log("— Chi lo colpisce —");
{
  const { ev } = game({ eq: ["epsilon", "sigma"], max: ["epsilon", "sigma"] });
  ev(START("standard", 61) + ` startRangers(); slots[0] = makeShooter(TURRETS.sky, SLOT_X[0], GROUND_Y - 14); slots[1] = makeShooter(TURRETS.laser, SLOT_X[1], GROUND_Y - 14); slots[2] = makeShooter(TURRETS.thunder, SLOT_X[2], GROUND_Y - 14); ` + READY(190, 380));
  ev("for (const r of RG.list) r.t = 0;"); step(ev, 4);
  const r1 = J(ev, "({ hp: gift.hp / gift.maxHp, tgt: pickTargets({ x: 180, y: 600 }, 9999, 9).length, near: !!nearestTo(190, 380, 100), rnd: !!randEnemy() })");
  console.log("torrette (Sky Guard, Laser, Thunderbolt), ranger e mira automatica per 4 s: vita del pacco", Math.round(r1.hp * 100) + "%", "· bersagli trovati", r1.tgt, r1.near, r1.rnd, ok(r1.hp === 1 && !r1.tgt && !r1.near && !r1.rnd));
  ev("settings.targeting = 'highest'"); step(ev, 1);
  console.log("“Bersaglio: vita più alta”: vita del pacco", Math.round(ev("gift.hp / gift.maxHp") * 100) + "%", ok(ev("gift.hp === gift.maxHp")));
  const cnt = J(ev, `(() => { const e = enemies.length, q = queue.length; return { e, living: living().length, engaged: pressing || living().length > 0 }; })()`);
  console.log("non conta tra i nemici: in campo", cnt.e, "· a schermo", cnt.living, "· frenesia ferma (nessun nemico):", !cnt.engaged, ok(cnt.e === 0 && cnt.living === 0 && !cnt.engaged));
}
{
  const { ev } = game();
  // tiro in colonna (1.24.1): conta solo la colonna del cannone (x del guardiano + 7), non il punto premuto
  ev(START("standard", 61) + READY(250, 400) + " player.x = player.targetX = 243; pressing = true; press.x = 243; press.y = 560;");
  step(ev, 1.5);
  const hit = ev("gift ? 1 - gift.hp / gift.maxHp : 1");
  ev(START("standard", 61) + READY(250, 400) + " player.x = player.targetX = 180; pressing = true; press.x = 250; press.y = 400;");
  step(ev, 1.5);
  const miss = ev("1 - gift.hp / gift.maxHp");
  console.log("in manuale, pacco nella colonna del guardiano (dito in basso): vita persa", Math.round(hit * 100) + "% · guardiano 63 px a lato (dito sul pacco):", Math.round(miss * 100) + "%", ok(hit > 0.05 && miss === 0));
  // il caso segnalato da Marco: un nemico vicino al dito non devia più i colpi dal pacco sopra il guardiano
  ev(START("standard", 61) + READY(200, 400) + foe("drone", 230, 540) + " player.x = player.targetX = 193; pressing = true; press.x = 200; press.y = 560;");
  step(ev, 1.5);
  const side = J(ev, "({ g: gift ? 1 - gift.hp / gift.maxHp : 1, e: enemies[0].hp < enemies[0].maxHp })");
  console.log("nemico vicino al dito e fuori dalla colonna: pacco", Math.round(side.g * 100) + "% · nemico colpito", side.e, ok(side.g > 0.05 && !side.e));
  const col = J(ev, `(() => { ${START("standard", 61)} ${READY(200, 400)} ${foe("drone", 200, 300)} player.x = player.targetX = 193; const a = colTarget() === gift;
    enemies[0].y = 480; const b = colTarget() === enemies[0]; player.x = 120; const c = colTarget() === null; return { a, b, c }; })()`);
  console.log("mirino giallo: il primo nella colonna dal basso (pacco sotto il nemico →", col.a, "· nemico sotto il pacco →", col.b, "· colonna vuota →", col.c + ")", ok(col.a && col.b && col.c));
  // mira automatica: anche passando sul pacco, i colpi non lo feriscono
  ev(START("standard", 61) + READY(187, 300) + foe("brute", 187, 120) + " player.x = player.targetX = 180; pressing = false;");
  step(ev, 1.5);
  console.log("mira automatica con il pacco sulla traiettoria verso un nemico: vita del pacco", Math.round(ev("gift.hp / gift.maxHp") * 100) + "%", ok(ev("gift.hp === gift.maxHp")));
}
console.log("— Nemici in mezzo —");
{
  const { ev } = game();
  const run = (pierce) => { ev(START("standard", 61) + READY(187, 330) + foe("brute", 187, 450) + ` player.x = player.targetX = 180; ${pierce ? "player.up.pierce = 1;" : ""} pressing = true; press.x = 187; press.y = 330;`); step(ev, 1);
    return J(ev, "({ g: 1 - gift.hp / gift.maxHp, e: enemies[0].hp < enemies[0].maxHp })"); };
  const a = run(false), b = run(true);
  console.log("asteroide tra guardiano e pacco: pacco", Math.round(a.g * 100) + "%, asteroide colpito", a.e, "· con una perforazione: pacco", Math.round(b.g * 100) + "%", ok(a.g === 0 && a.e && b.g > 0.05));
  const fx = J(ev, `(() => { ${START("standard", 61)} ${READY(187, 330)} player.x = player.targetX = 180; player.up.boom1 = 1; player.up.boomP = 1; player.up.boom3 = 1;
    const hp0 = gift.hp; for (const s of [makeShooter(TURRETS.aero, 187, 330)]) aeroBoom(s, 187, 330); disrBlast(330, 60, 99); return { same: gift.hp === hp0 }; })()`);
  console.log("esplosioni e aree sul pacco: vita invariata", fx.same, ok(fx.same));
}

console.log("— Timer —");
{
  const { g, ev } = game();
  ev(START("standard", 61) + READY(180, 400) + " state = 'play';"); g.frame();
  const t0 = ev("gift.t"); ev("pauseGame()"); for (let i = 0; i < 60; i++) g.frame(); const tp = ev("gift.t");
  ev("state = 'upgrade'"); for (let i = 0; i < 60; i++) g.frame(); const tu = ev("gift.t"); ev("state = 'play'");
  console.log("timer in pausa e nella scelta delle carte (60 fotogrammi ciascuna):", t0.toFixed(2), "→", tp.toFixed(2), "→", tu.toFixed(2), ok(tp === t0 && tu === t0));
  const rate = (sp) => { ev(`settings.speed = ${sp}; gift.t = 12; state = 'play'`); g.frame(); const a = ev("gift.t"); for (let i = 0; i < 30; i++) g.frame(); return a - ev("gift.t"); };
  const r1 = rate(1), r15 = rate(1.5), r2 = rate(2); ev("settings.speed = 1");
  console.log("tempo scalato in 30 fotogrammi: 1x", r1.toFixed(3), "s · 1,5x", r15.toFixed(3), "s · 2x", r2.toFixed(3), "s", ok(Math.abs(r15 / r1 - 1.5) < 0.02 && Math.abs(r2 / r1 - 2) < 0.02));
  ev(START("standard", 61) + READY(180, 400)); const f0 = J(ev, "progress.planet.frags");
  step(ev, 12.2);
  const ex = J(ev, "({ phase: gift && gift.phase, done: giftPlan.done, frags: progress.planet.frags })");
  step(ev, 4);
  console.log("timer scaduto: il pacco", ex.phase === "out" ? "sale ed esce" : ex.phase, "· risolto", ex.done, "· nessun frammento", JSON.stringify(ex.frags) === JSON.stringify(f0), "· poi sparisce", ev("gift === null"),
    ok(ex.phase === "out" && ex.done && JSON.stringify(ex.frags) === JSON.stringify(f0) && ev("gift === null")));
  ev(START("standard", 61) + READY(180, 400) + " queue = []; step = 0;"); ev("update(0.02)");
  const we = J(ev, "({ gift: gift, done: giftPlan.done, state })");
  console.log("ondata finita prima del timer: pacco", we.gift === null ? "andato" : "ancora in campo", "· risolto", we.done, "· carte", we.state, ok(we.gift === null && we.done && we.state === "upgrade"));
  const vita = J(ev, `(() => { ${START("standard", 61)} const a = guardDps(player); player.up.dmg = 3; const b = guardDps(player); ${READY(180, 400)} return { a, b, hp: gift.maxHp }; })()`);
  console.log("vita = danno al secondo del guardiano × 5 s: base", Math.round(vita.a * 5), "· con 3 “Danno” →", Math.round(vita.hp), ok(Math.abs(vita.a * 5 - 7 / 0.15 * 5) < 1 && Math.abs(vita.hp - vita.b * 5) < 1 && vita.b > vita.a));
}

console.log("— Ricompensa —");
{
  const FR = "(() => { const R = giftRand; let f = true; giftRand = () => f ? (f = false, 0.01) : R(); })();";   // il prossimo premio sono frammenti
  const kill = (ev) => J(ev, "(() => { const f0 = JSON.parse(JSON.stringify(progress.planet.frags)), g0 = JSON.parse(JSON.stringify(progress.gear)); giftHit(1e9); return { f0, f1: progress.planet.frags, g0, g1: progress.gear, note: giftNote && giftNote.gain, done: giftPlan.done }; })()");
  const diff = (a, b) => Object.keys(b).filter((k) => b[k] !== a[k]).map((k) => [k, b[k] - a[k]]);
  { const { ev } = game(); ev(START("standard", 61) + READY(180, 400) + FR); const r = kill(ev), d = diff(r.f0, r.f1);
    console.log("Standard: frammenti", JSON.stringify(d), "· avviso:", r.note && r.note.id + " +" + r.note.n, ok(d.length === 1 && d[0][1] === 5 && r.note.n === 5 && r.done)); }
  { const { ev } = game(); ev(START("epic", 31) + READY(180, 400) + FR); const r = kill(ev), d = diff(r.f0, r.f1);
    console.log("Epica: frammenti", JSON.stringify(d), ok(d.length === 1 && d[0][1] === 10)); }
  { const nine = IDS.filter((id) => id !== "ceo"), seen = new Set();
    for (let s = 1; s <= 12; s++) { const { ev } = game({ max: nine, seed: s }); ev(`giftRand = (() => { let x = ${s * 97}; return () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648; })();` + START("standard", 61) + READY(180, 400) + FR); diff(kill(ev).f0, J(ev, "progress.planet.frags")).forEach(([k]) => seen.add(k)); }
    const { ev } = game({ max: nine }); ev(START("standard", 61) + READY(180, 400) + FR); const d = diff(kill(ev).f0, J(ev, "progress.planet.frags"));
    console.log("nove ranger al massimo: frammenti sempre a Ceo", JSON.stringify(d), [...seen].join(","), "(× M 1,9: 5 → 10)", ok(d.length === 1 && d[0][0] === "ceo" && d[0][1] === 10 && [...seen].join(",") === "ceo")); }
  { const { ev } = game({ max: ["alfa", "omega", "sigma", "gamma"] }); ev(START("standard", 61) + READY(180, 400) + FR); const r = kill(ev), d = diff(r.f0, r.f1);
    console.log("quattro ranger al 10 o più: M", ev("fragM()"), "· frammenti", JSON.stringify(d), "(5 × 1,4 = 7)", ok(Math.abs(ev("fragM()") - 1.4) < 1e-9 && d.length === 1 && d[0][1] === 7)); }
  { const { ev } = game(); const k = { frags: 0, pcs: 0, mods: 0, seals: 0, majors: 0 }, rar = [0, 0, 0, 0, 0]; let bad = 0;
    ev("giftRand = (() => { let x = 11; return () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648; })();");   // generatore a seme fisso: estrazione ripetibile
    const s0 = J(ev, "[progress.seals, progress.majors]");
    for (let i = 0; i < 1000; i++) { const n = J(ev, `(() => { ${START("epic", 270)} giftPlan = { wave: 4, done: false }; return giftReward(); })()`); if (!n || !k.hasOwnProperty(n.kind)) { bad++; continue; } k[n.kind]++; if (n.r != null) rar[n.r]++; }
    const s1 = J(ev, "[progress.seals, progress.majors]"), pct = (x) => x / 10;
    console.log("estrazione su 1000 pacchi (Epica 270, difficoltà 300): frammenti", pct(k.frags), "% · pezzi", pct(k.pcs), "% · Moduli", pct(k.mods), "% · Sigilli", pct(k.seals), "% · maggiori", pct(k.majors),
      "% · rarità di pezzi e Moduli", rar.join("/"), "· Sigilli +", s1[0] - s0[0], "maggiori +", s1[1] - s0[1],
      ok(!bad && Math.abs(k.frags - 500) < 50 && Math.abs(k.pcs - 200) < 40 && Math.abs(k.mods - 200) < 40 && Math.abs(k.seals - 80) < 25 && k.majors >= 5 && k.majors <= 40
        && s1[0] - s0[0] === 5 * k.seals && s1[1] - s0[1] === k.majors && rar[0] > 0 && rar[4] > 0)); }
  { const { ev } = game({ max: IDS });
    const st = ev(`(() => { giftRand = Math.random; ${START("standard", 61)} let n = 0; for (let i = 0; i < 500; i++) { giftRoll(); if (giftPlan) n++; } giftPlan = { wave: 4, done: false }; startWave(4); waveTime = 3.5; queue = []; enemies = []; giftTick(0.01); return { n, sp: !!gift }; })()`);
    console.log("tutti i ranger al massimo, Standard: pacco su 500 livelli", st.n, "· comparsa forzata", st.sp, ok(Math.abs(st.n - 300) < 45 && st.sp)); }
  { const { ev } = game({ max: IDS }); const kinds = { pcs: 0, mods: 0, seals: 0, majors: 0 }, rar = new Set(); let bad = 0;
    ev("giftRand = (() => { let x = 23; return () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648; })();");   // seme fisso
    for (const [m, lv] of [["epic", 31], ["epic", 100], ["standard", 170]]) for (let i = 0; i < 100; i++) {
      ev(START(m, lv) + READY(180, 400)); const r = kill(ev), n = r.note;
      if (!n || !kinds.hasOwnProperty(n.kind)) { bad++; continue; }
      kinds[n.kind]++; if (JSON.stringify(r.f0) !== JSON.stringify(r.f1)) bad++;
      if (n.kind !== "pcs" && n.kind !== "mods") continue;
      rar.add(n.r); const k = n.kind === "pcs" ? n.pc + ":" + n.r : n.pc + ":" + n.r + ":" + n.fx; if ((r.g1[n.kind][k] || 0) !== (r.g0[n.kind][k] || 0) + 1) bad++;
    }
    console.log("tutti al massimo (300 pacchi, Standard ed Epica): pezzi", kinds.pcs, "· Moduli", kinds.mods, "· Sigilli", kinds.seals, "· maggiori", kinds.majors, "· nessun frammento · rarità", [...rar].sort().join(","), "· errori", bad,
      ok(!bad && Math.abs(kinds.pcs - 120) < 30 && Math.abs(kinds.mods - 120) < 30 && Math.abs(kinds.seals - 48) < 20 && kinds.majors <= 30 && rar.has(0))); }
  { const { ev } = game(); ev(START("standard", 61) + READY(180, 400) + FR); const r = kill(ev); ev("domeHp = 0; update(0.02)");
    const saved = JSON.parse(ev("localStorage.getItem('fortress-progress-v1')")).planet.frags;
    console.log("frammenti accreditati subito, anche perdendo il livello: stato", ev("state"), "· salvati", JSON.stringify(saved) === JSON.stringify(r.f1), ok(ev("state") === "lost" && JSON.stringify(saved) === JSON.stringify(r.f1))); }
}

console.log("— Partita sospesa e Continua —");
{
  const { ev } = game();
  ev(`giftRand = () => 0.01; ${START("standard", 61)}`);
  const p = J(ev, "giftPlan"); ev(`startWave(${p.wave})`);
  const s1 = J(ev, "JSON.parse(localStorage.getItem(RUN_KEY)).gift");
  const run1 = ev("localStorage.getItem(RUN_KEY)");
  const a = game({ storage: { "fortress-run-v1": run1 } });
  a.ev("giftRand = () => 0.99; continueRun(); state = 'play'; queue = [{ t: 999, enemy: 'drone', x: 10 }]; enemies = [];");
  step(a.ev, 4.5);
  const back = J(a.ev, "({ plan: giftPlan, gift: !!gift, wave })");
  ev("waveTime = 3.5; queue = [{ t: 999, enemy: 'drone', x: 10 }]; enemies = []; giftTick(0.01); gift.y = 400; gift.phase = 'float'; giftHit(1e9);");
  const s2 = J(ev, "JSON.parse(localStorage.getItem(RUN_KEY)).gift");
  const b = game({ storage: { "fortress-run-v1": ev("localStorage.getItem(RUN_KEY)") } });
  b.ev("continueRun(); state = 'play'; queue = [{ t: 999, enemy: 'drone', x: 10 }]; enemies = [];"); step(b.ev, 5);
  const again = J(b.ev, "({ plan: giftPlan, gift: !!gift, wave })");
  console.log("salvato a inizio ondata:", JSON.stringify(s1), "· Continua → ondata", back.wave, "pacco di nuovo in campo", back.gift, ok(s1 && s1.wave === p.wave && !s1.done && back.wave === p.wave && back.gift && back.plan.wave === p.wave));
  console.log("preso: salvato", JSON.stringify(s2), "· Continua → ondata", again.wave, "pacco", again.gift ? "ricompare" : "non ricompare", ok(s2.done && again.wave === p.wave && !again.gift && again.plan.done));
  const c = game({ storage: { "fortress-run-v1": JSON.stringify(Object.assign(JSON.parse(run1), { gift: { wave: 5, done: false } })) } });
  c.ev("continueRun()");
  console.log("ondata non ammessa nel salvataggio (5): pacco scartato", c.ev("giftPlan === null"), ok(c.ev("giftPlan === null")));
}

console.log("— Scoperta e pausa —");
{
  const { g, ev } = game({ seen: [] });
  ev(START("standard", 61) + READY(180, 400) + " gift.y = -5; gift.phase = 'in';"); step(ev, 0.3);
  const al = J(ev, "({ seen: progress.seen.includes('gift'), a: alerts.length && alerts[0].def.gift })");
  ev("state = 'play'"); g.texts.length = 0; g.frame(); const t1 = g.texts.join("|");
  ev("pauseGame(); pauseTab = 'enemies'"); g.texts.length = 0; g.frame(); const t2 = g.texts.join("|");
  console.log("avviso “Nuovo nemico: Pacco regalo”:", al.seen && !!al.a && t1.includes("Pacco regalo") && t1.includes("Solo il guardiano, premendo sotto di lui"), "· scheda Nemici:", t2.includes("Pacco regalo") && t2.includes("Solo il guardiano: tieni premuto sotto il pacco"),
    ok(al.seen && al.a && t1.includes("Pacco regalo") && t1.includes("Solo il guardiano, premendo sotto di lui") && t2.includes("Pacco regalo") && t2.includes("Solo il guardiano: tieni premuto sotto il pacco")));
  ev("state = 'play'; giftRand = () => 0.01; giftHit(1e9); alerts = []"); g.texts.length = 0; g.frame(); const t3 = g.texts.join("|");
  console.log("avviso del premio con il nome del ranger:", t3.includes("Pacco regalo!") && /frammenti/.test(t3), ok(t3.includes("Pacco regalo!") && /(Alfa|Prometeo|Omega|Mnemosine|Sigma|Ceo|Gamma|Iperione|Epsilon|Atlante)  \+5 frammenti/.test(t3)));
  const note = (v) => { ev(`giftNote = null; giftRand = () => ${v}; giftReward && (giftNote = { t: 3.5, gain: giftReward() })`); g.texts.length = 0; g.frame(); return g.texts.join("|"); };
  const t4 = note(0.95), t5 = note(0.995);
  console.log("avviso dei Sigilli:", /\+5 Sigilli ◆/.test(t4), "· del maggiore:", /\+1 Sigillo maggiore ✦/.test(t5), "· Math.random nel premio:", ev("(() => { const R = Math.random; let n = 0; Math.random = () => { n++; return R(); }; giftRand = R; for (let i = 0; i < 200; i++) giftReward(); Math.random = R; return n; })()"),
    ok(/\+5 Sigilli ◆/.test(t4) && /\+1 Sigillo maggiore ✦/.test(t5) && ev("(() => { const R = Math.random; let n = 0; Math.random = () => { n++; return R(); }; const G = giftRand; giftRand = (() => { let x = 7; return () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648; })(); for (let i = 0; i < 200; i++) giftReward(); Math.random = R; giftRand = G; return n; })()") === 0));
}

console.log("— Partite vere —");
{
  const errs = [];
  for (const [mode, lv, gfx] of [["standard", 61, null], ["epic", 31, "hd2d"], ["standard", 120, null]]) {
    const { g, ev } = game({ gfx, seed: 9 });
    ev(`giftRand = () => 0.01; ${START(mode, lv)}`);
    for (let i = 0; i < 2500 && ev("state") !== "won" && ev("state") !== "lost"; i++) {
      ev("if (state === 'upgrade') pick(0); domeHp = domeMax; if (gift) { pressing = true; press.x = gift.x; press.y = gift.y; } else pressing = false; if (wave < 20 && state === 'play' && waveTime > 1 && !(giftPlan && giftPlan.wave === wave && !giftPlan.done)) { queue = []; for (const e of enemies) e.dead = true; }");
      g.frame();
    }
    errs.push(...g.errors.map((e) => mode + " " + lv + ": " + e));
    if (mode === "standard" && lv === 61) console.log("livello 61 giocato premendo sul pacco: preso", ev("giftPlan.done && !!giftNote || giftPlan.done"), ok(ev("giftPlan.done")));
  }
  console.log("livelli 61, Epica 31 (HD-2D) e 120 giocati fino in fondo con il pacco, errori JS:", errs.length ? errs.join("; ") : "nessuno", ok(!errs.length));
}
