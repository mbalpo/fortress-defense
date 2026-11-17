// Equipaggiamento e Moduli (DESIGN.md § 15): inventario, salvataggio versione 3, drop a fine livello, equipaggiare, installare,
// fondere, scartare, statistiche, effetti in battaglia e schermata.
const { makeGame } = require("./bot.js");
const ok = (c) => c ? "✓" : "✗ ERRORE";
const patch = (h) => h.replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();");
const fresh = (cleared, extra) => {
  const prog = Object.assign({ cleared, seen: [] }, extra || {});
  const g = makeGame({ patch, cleared, storage: { "fortress-progress-v1": JSON.stringify(prog) } }); g.frame();
  return { g, ev: g.win.__ev, stored: () => JSON.parse(g.win.localStorage.getItem("fortress-progress-v1")) };
};
const J = (ev, code) => JSON.parse(ev("JSON.stringify(" + code + ")"));

console.log("— Dati —");
{
  const { ev } = fresh(30);
  const pools = J(ev, "PIECE_IDS.map((p) => [p, PIECES[p].pool.length, PIECES[p].pool.reduce((a, fx) => a + MOD[fx].w, 0)])");
  console.log("pool (pezzo, effetti, pesi):", pools.map((x) => x.join(" ")).join(" · "),
    ok(pools.every((x) => x[1] === 9) && pools.map((x) => x[2]).join() === "23,22,18,20,22,17"));
  const all = J(ev, "[...new Set(PIECE_IDS.flatMap((p) => PIECES[p].pool))].sort((a, b) => a - b)"), excl = J(ev, "PIECE_IDS.map((p) => PIECES[p].pool[0])");
  const shared = J(ev, "Object.keys(MOD).map(Number).filter((fx) => PIECE_IDS.filter((p) => PIECES[p].pool.includes(fx)).length === 2).length");
  console.log("effetti nei pool:", all.length, "| esclusivi:", excl.join(" "), "| condivisi da 2 pezzi:", shared, ok(all.length === 30 && excl.join() === "4,20,22,10,14,30" && shared === 24));
  const long = J(ev, "Object.keys(MOD).flatMap((fx) => [0, 4].map((r) => modText(+fx, r))).filter((t) => t.length > 46)");
  console.log("testi dei Moduli oltre 46 caratteri:", long.length ? long.join(" | ") : "nessuno", ok(!long.length));
}

console.log("— Inventario e salvataggio versione 3 —");
{
  const bad = { pcs: { "arma:2": 3, "spada:1": 2, "testa:9": 1, "guanti:0": -4 }, mods: { "arma:1:17": 2, "arma:1:20": 1, "nucleo:4:30": 1 },
    eq: { arma: { r: 1, m: [[17, 0], [17, 3], [2, 1], [1, 1]] }, testa: { r: 7, m: [] }, stivali: { r: 0, m: [[99, 0]] } } };
  const { ev, stored } = fresh(35, { gear: bad });
  const g = J(ev, "progress.gear");
  console.log("ripulito: pezzi", JSON.stringify(g.pcs), "| Moduli", JSON.stringify(g.mods), "| arma", JSON.stringify(g.eq.arma), "| testa", !!g.eq.testa,
    ok(JSON.stringify(g.pcs) === '{"arma:2":3}' && JSON.stringify(g.mods) === '{"arma:1:17":2,"nucleo:4:30":1}' && JSON.stringify(g.eq.arma) === '{"r":1,"m":[[17,0],[2,1]]}'
      && !g.eq.testa && JSON.stringify(g.eq.stivali) === '{"r":0,"m":[]}'));
  const save = J(ev, "makeSave()");
  console.log("esportato: versione", save.version, "| equipaggiamento", !!save.progress.gear, ok(save.version === 5 && save.progress.gear.pcs["arma:2"] === 3));
  const code = ev("makeCode()"); ev("progress.gear = emptyGear()"); ev(`applySave(parseSave(${JSON.stringify(code)}))`);
  console.log("codice andata e ritorno: arma", JSON.stringify(J(ev, "progress.gear.eq.arma")), "| salvato:", !!stored().gear.eq.arma, ok(J(ev, "progress.gear.eq.arma").m.length === 2 && stored().gear.pcs["arma:2"] === 3));
  const v2 = JSON.stringify({ game: "fortress-defense", version: 2, progress: { cleared: 40, seen: [], seals: 3, claims: [], tree: {}, loadout: [] }, settings: {} });
  const d2 = JSON.parse(ev(`JSON.stringify(parseSave(${JSON.stringify(v2)}))`));
  console.log("versione 2 importata: Sigilli", d2.seals, "| inventario vuoto", JSON.stringify(d2.gear), ok(d2.seals === 3 && JSON.stringify(d2.gear) === '{"pcs":{},"mods":{},"eq":{},"lock":{}}'));
  const old = fresh(32); console.log("memoria senza equipaggiamento: inventario", JSON.stringify(old.ev("progress.gear")), "| errori:", old.g.errors.length, ok(!old.g.errors.length && old.ev("gearItems(progress.gear)") === 0));
}

console.log("— Drop a fine livello —");
{
  const { ev, stored } = fresh(28);
  const win = (m, lv) => J(ev, `(() => { mode = "${m}"; campLevel = ${lv}; domeMax = 100; domeHp = 100; winLevel(); return gearGain; })()`);
  const d29 = win("standard", 29), d30 = win("standard", 30), d30b = win("standard", 30);
  const kinds = (d) => d ? d.filter((o) => o.kind === "pcs").length + "+" + d.filter((o) => o.kind === "mods").length : "nessuno";
  console.log("livello 29:", kinds(d29), "| primo 30:", kinds(d30), "| 30 rigiocato:", kinds(d30b),
    ok(!d29 && /^2\+[23]$/.test(kinds(d30)) && /^2\+[23]$/.test(kinds(d30b))));
  const e1 = win("epic", 1);
  console.log("Epica 1 (difficoltà 31):", kinds(e1), ok(/^2\+[34]$/.test(kinds(e1))));
  console.log("salvati in inventario:", ev("gearItems(progress.gear)"), ok(J(ev, "gearItems(progress.gear)") === d30.length + d30b.length + e1.length && stored().gear && Object.keys(stored().gear.pcs).length > 0));
  const hist = (D) => J(ev, `(() => { const h = [0, 0, 0, 0, 0]; for (let i = 0; i < 4000; i++) h[rollRarity(${D})]++; return h.map((n) => Math.round(n / 40)); })()`);
  const h30 = hist(30), h100 = hist(100), h200 = hist(200);
  console.log("rarità (%) D 30:", h30.join("/"), "| D 100:", h100.join("/"), "| D 200:", h200.join("/"),
    ok(h30[3] === 0 && h30[4] === 0 && Math.abs(h30[0] - 80) <= 4 && h100[4] <= 3 && h100[3] > 2 && Math.abs(h200[4] - 6) <= 3));
  const fxs = J(ev, `(() => { const c = {}; for (let i = 0; i < 6000; i++) { const fx = rollModFx("arma"); c[fx] = (c[fx] || 0) + 1; } return c; })()`);
  const rareShare = (pc, r) => J(ev, `(() => { let n = 0; for (let i = 0; i < 8000; i++) if (MOD[rollModFx("${pc}", ${r})].w === 1) n++; return Math.round(n / 80); })()`);
  const rs = [0, 1, 2, 3, 4].map((r) => rareShare("nucleo", r));
  console.log("effetti rari estratti (nucleo, % per rarità):", rs.join("/"), "| testa comune", rareShare("testa", 0), "| arma ancestrale", rareShare("arma", 4),
    ok(Math.abs(rs[0] - 5) <= 2 && Math.abs(rs[2] - 18) <= 3 && Math.abs(rs[4] - 30) <= 3 && Math.abs(rareShare("arma", 4) - 30) <= 3));
  console.log("effetti estratti per l’arma (6000):", JSON.stringify(fxs), ok(Object.keys(fxs).length === 9 && fxs[4] < fxs[1] && Math.abs(fxs[1] / 6000 - 3 / 23) < 0.03));
}

console.log("— Equipaggiare, installare, fondere, scartare —");
{
  const { ev } = fresh(30, { gear: { pcs: { "arma:0": 6, "arma:2": 1 }, mods: { "arma:0:1": 2, "arma:0:2": 2, "arma:1:17": 1, "arma:3:7": 1 }, eq: {} } });
  const G = () => J(ev, "progress.gear");
  ev("equipPiece('arma', 2)");
  ev("installMod('arma', 0, 1); installMod('arma', 0, 2); installMod('arma', 1, 17)");
  const dup = ev("installMod('arma', 0, 1)"), full = ev("installMod('arma', 3, 7)");
  console.log("arma epica, 3 slot:", JSON.stringify(G().eq.arma.m), "| stesso effetto:", dup, "| quarto Modulo:", full,
    ok(G().eq.arma.m.length === 3 && !dup && !full && G().mods["arma:0:1"] === 1));
  ev("equipPiece('arma', 0)");
  console.log("cambio con l’arma comune (1 slot): Moduli rimasti", JSON.stringify(G().eq.arma.m), "| tornati:", G().mods["arma:0:2"], G().mods["arma:1:17"], "| arma epica in inventario:", G().pcs["arma:2"],
    ok(JSON.stringify(G().eq.arma.m) === "[[1,0]]" && G().mods["arma:0:2"] === 2 && G().mods["arma:1:17"] === 1 && G().pcs["arma:2"] === 1 && G().pcs["arma:0"] === 5));
  ev("removeMod('arma', 0)");
  console.log("Modulo tolto: torna in inventario", G().mods["arma:0:1"], ok(G().mods["arma:0:1"] === 2 && G().eq.arma.m.length === 0));
  const f1 = ev("fusePieces('arma', 0)"), f2 = ev("fusePieces('arma', 0)");
  console.log("fusione di 5 armi comuni:", f1, "→ rare", G().pcs["arma:1"], "| di nuovo (ne restano 0):", f2, ok(f1 && !f2 && G().pcs["arma:1"] === 1 && !G().pcs["arma:0"]));
  const bad = ev("fuseMods('arma', 0, { 1: 2, 2: 2 })"), fx = ev("fuseMods('arma', 0, { 1: 2, 2: 2, 17: 1 })"), fx2 = ev("(() => { progress.gear.mods['arma:0:1'] = 2; progress.gear.mods['arma:0:2'] = 3; return fuseMods('arma', 0, { 1: 2, 2: 3 }); })()");
  console.log("fusione di Moduli: 4 →", bad, "| 5 con un raro in mezzo →", fx, "| 5 comuni diversi → effetto", fx2, "raro", ok(bad === null && fx === null && fx2 > 0 && G().mods["arma:1:" + fx2] >= 1 && !G().mods["arma:0:1"]));
  const d = ev("discard('pcs', 'arma:1')"), d0 = ev("discard('pcs', 'arma:0')");
  console.log("scarto:", d, "| di un pezzo che non c’è:", d0, ok(d && !d0 && !G().pcs["arma:1"]));
  ev("equipPiece('arma', 2); unequipPiece('arma')");
  console.log("togli il pezzo: torna in inventario", G().pcs["arma:2"], ok(G().pcs["arma:2"] === 1 && !G().eq.arma));
  const closed = fresh(29, { gear: { pcs: { "arma:0": 1 }, mods: {}, eq: {} } });
  console.log("prima del 30: equipaggiare", closed.ev("equipPiece('arma', 0)"), "| schermata", (closed.ev("openGear()"), closed.ev("state")), ok(!closed.ev("equipPiece('arma', 0)") && closed.ev("state") === "menu"));
}

console.log("— Statistiche —");
{
  const eq = { arma: { r: 4, m: [[2, 4], [4, 0], [1, 4], [17, 4], [18, 0]] }, guanti: { r: 1, m: [[1, 4], [20, 2]] }, testa: { r: 0, m: [[22, 4]] },
    armatura: { r: 2, m: [[11, 4], [10, 0]] }, stivali: { r: 0, m: [[11, 0]] }, nucleo: { r: 3, m: [[23, 1], [28, 2], [30, 4], [9, 4]] } };
  const { ev } = fresh(40, { gear: { pcs: {}, mods: {}, eq } });
  const s = J(ev, "gearStats(progress.gear)");
  const r2 = (x) => Math.round(x * 1000) / 1000;
  console.log("guardiano:", r2(s.pdmg), "| barriera vita", r2(s.hp), "danno subito −" + r2(s.red), "| torrette", r2(s.tdmg), "Force +" + r2(s.type.force),
    "| critico", r2(s.crit), "| proiettili", s.proj, "perforazione", s.pierce, "| 4 carte", s.four, "torrette lv2", s.t2, "| Moduli", s.mods);
  // pdmg: arma 28 + guanti 7 + testa 4 + Modulo 2 (28) + Modulo 4 (−20) + Modulo 17 (+8) + 15 Moduli × 1,2 (Modulo 9) = 73%
  console.log("conti attesi", ok(r2(s.pdmg) === 0.73 && r2(s.hp) === 0.79 && r2(s.red) === 0.18 && r2(s.tdmg) === 0.26 && r2(s.type.force) === 0.11
    && s.crit === 0.3 && s.proj === 1 && s.pierce === 1 && s.four === 1 && s.t2 === 1 && s.mods === 15 && s.absorb === 5 && s.counterN === 3 && r2(s.maxHp) === 0.008));
  ev("selLevel = 40; startRun('standard')");
  console.log("in partita: cupola", ev("domeMax"), "(100 × 1,79) | danno subito −" + ev("domeRed()"), "| Sky Guard tb", r2(ev("newTurret('sky', 0).tb")), "(1 + 0,26 + 0 Fire)",
    "| Hive tb", r2(ev("newTurret('hive', 1).tb")), "(+ Force 0,11) | torrette dal lv2:", ev("newTurret('sky', 0).level"),
    ok(ev("domeMax") === 179 && r2(ev("domeRed()")) === 0.18 && r2(ev("newTurret('sky', 0).tb")) === 1.26 && r2(ev("newTurret('hive', 1).tb")) === 1.37 && ev("newTurret('sky', 0).level") === 2));
  const capped = fresh(40, { gear: { pcs: {}, mods: {}, eq: { armatura: { r: 4, m: [[11, 4]] }, stivali: { r: 4, m: [[11, 4]] } } }, tree: { "barrier:hp": 1, "barrier:red": 5 } });
  capped.ev("startRun('standard')");
  console.log("tetto della riduzione del danno: albero 15% + Moduli 30% →", capped.ev("domeRed()"), ok(capped.ev("domeRed()") === 0.4));
}

console.log("— Effetti in battaglia —");
{
  const eqOf = (eq) => fresh(40, { gear: { pcs: {}, mods: {}, eq } });
  // danno del guardiano: un colpo su un nemico fermo, con e senza arma ancestrale (+28%)
  const shot = (eq, setup) => {
    const { ev } = eqOf(eq);
    return ev(`(() => { startRun('standard'); enemies = []; queue = []; ${setup || ""}
      spawn({ enemy: "brute", x: 180 }); const e = enemies[0]; e.y = 200; e.hp = e.maxHp = 1e6; e.speed = 0;
      player.cd = 0; playerTick(player, 0.001); for (let i = 0; i < 60; i++) for (const o of ents) o.update(1 / 60);
      return 1e6 - e.hp; })()`);
  };
  const base = shot({}), arma = shot({ arma: { r: 4, m: [] } }), high = shot({ arma: { r: 0, m: [[18, 4]] } }), crit = shot({ guanti: { r: 0, m: [[1, 4]] } }, "GEAR.crit = 1;");
  const pr = (x) => Math.round(x * 100) / 100;
  console.log("colpo del guardiano: base", pr(base), "| arma ancestrale", pr(arma / base), "× | sopra il 70% di vita (+32%) con arma comune (+6%)", pr(high / base), "× | critico certo con guanti comuni (+4%)", pr(crit / base), "×",
    ok(pr(arma / base) === 1.28 && pr(high / base) === 1.38 && pr(crit / base) === 1.56));
  const { ev } = eqOf({ arma: { r: 0, m: [[4, 0]] }, guanti: { r: 0, m: [[7, 4]] }, testa: { r: 0, m: [[21, 4]] } });
  ev("startRun('standard'); enemies = []; queue = []; spawn({ enemy: 'brute', x: 180 }); enemies[0].y = 200; enemies[0].hp = 1e9;");
  ev("window.__b = 0; const pb = playerBullet; playerBullet = function () { window.__b++; return pb.apply(this, arguments); }; player.cd = 0; playerTick(player, 0.001);");
  console.log("Modulo 4: proiettili per salva", ev("window.__b"), "| Modulo 7: intervallo", pr(ev("player.cd")), "s (0,15 → 0,1275) | Modulo 21: rinnovi", ev("refreshLeft"),
    ok(ev("window.__b") === 2 && Math.abs(ev("player.cd") - 0.1275) < 0.002 && ev("refreshLeft") === 3));
  ev("endWave = endWave; wave = 1; endWave(); window.__o1 = options.map((o) => o.kind + (o.id || o.up.id)).join();");
  const ref = ev("refreshCards()"), left = ev("refreshLeft");
  console.log("rinnovo delle carte:", ref, "| rimasti", left, "| carte", ev("options.length"), ok(ref && left === 2 && ev("options.length") === 3 && ev("state") === "upgrade"));
  ev("runPicks = 0; pick(0); bonusLeft = 1; giveBossRewards();");
  console.log("Modulo 12: carte contate, 1 scelta + 3 del mini-boss =", ev("runPicks"), ok(ev("runPicks") === 4));
  // Modulo 22 (ancestrale: sempre 4 carte) e Modulo 29 (ancestrale 50%, qui forzato)
  const four = eqOf({ testa: { r: 0, m: [[22, 4]] } }).ev;
  four("startRun('standard'); enemies = []; queue = []; wave = 1; endWave();");
  console.log("Modulo 22 ancestrale: carte offerte", four("options.length"), ok(four("options.length") === 4));
  const lv2 = eqOf({ testa: { r: 0, m: [[29, 4]] } }).ev;
  const seq = lv2(`(() => { GEAR = gearStats(progress.gear); const p = fromLv2(makeShooter(PLAYER_DEF, 0, 0)); const out = [p.level];
    let lu = 0, ups = 0, guard = 0; while (!p.done && guard++ < 50) { const opts = eligible(p); if (!opts.length) break; const u = opts.find((v) => v.cat === "lu") || opts[0]; applyUp(p, u); ups++; if (u.cat === "lu") { lu++; out.push(p.level); } }
    return { start: out[0], levels: out.slice(1), lu, ups, done: p.done }; })()`);
  console.log("guardiano dal livello 2: parte", seq.start, "| livello dopo ogni level up", seq.levels.join(" → "), "| level up", seq.lu, "potenziamenti", seq.ups,
    ok(seq.start === 2 && seq.levels.join() === "2,3,3" && seq.lu === 3 && seq.ups === 12 && seq.done));
  // barriera: Modulo 10 (primi 20 danni ignorati), 14 (immunità sotto il 20%), 16 (cura per boss)
  const dome = eqOf({ armatura: { r: 0, m: [[10, 4]] }, stivali: { r: 1, m: [[14, 4], [16, 4]] } }).ev;
  dome("startRun('standard'); enemies = []; queue = []; spawn({ enemy: 'brute', x: 180 }); window.__e = enemies[0]; __e.dmg = 15; __e.hp = 1e9;");
  const h0 = dome("domeHp"); dome("domeHit(__e)"); const h1 = dome("domeHp"); dome("domeHit(__e)"); const h2 = dome("domeHp");
  console.log("Modulo 10: vita", h0, "→", h1, "→", h2, "(primi 20 danni ignorati) | contrattacchi rimasti", dome("counterLeft"), ok(h1 === h0 && h2 === h0 - 10 && dome("counterLeft") === 6));
  dome("domeHp = domeMax * 0.25; domeHit(__e)"); const imm = dome("domeImmT"), hImm = dome("domeHp"); dome("domeHit(__e)");
  console.log("Modulo 14: sotto il 20% → immune per", imm, "s | colpo durante l’immunità: vita", hImm, "→", dome("domeHp"), ok(imm === 5 && dome("domeHp") === hImm));
  dome("domeImmT = 0; domeHp = 50; spawn({ enemy: 'boss', def: bossDef(40, 5), x: 180 }); const b = enemies[enemies.length - 1]; b.dead = true; update(0.001);");
  console.log("Modulo 16: boss ucciso, vita 50 →", Math.round(dome("domeHp")), "(+10% di", dome("domeMax") + ")", ok(Math.round(dome("domeHp")) === 50 + Math.round(dome("domeMax") * 0.1)));
}

console.log("— Schermata —");
{
  const { g, ev } = fresh(30, { gear: { pcs: { "arma:0": 5, "arma:4": 1 }, mods: { "arma:0:1": 3, "arma:0:2": 2 }, eq: {} } });
  g.frame(); const M = g.texts.join("|");
  console.log("menu: pulsante Equipaggiamento", /Equipaggiamento/.test(M), ok(/Equipaggiamento/.test(M)));
  g.click(242, 376); g.frame();
  const T = g.texts.join("|");
  console.log("aperta dal menu:", ev("state"), "| testi:", /EQUIPAGGIAMENTO/.test(T), /Tocca per equipaggiare/.test(T), ok(ev("state") === "gear" && /Tocca per equipaggiare/.test(T) && !g.errors.length));
  ev("tapPiece(4)"); g.frame(); const P1 = g.texts.join("|"), a0 = ev("gearArm"), eq0 = ev("!!progress.gear.eq.arma");
  ev("tapPiece(4)"); g.frame();
  console.log("equipaggia l’arma ancestrale in due tocchi (1.14.0): primo → in attesa", a0, "equipaggiata", eq0, "| mostra cosa cambia", /Tocca di nuovo: danno del guardiano \+0% → \+28%/.test(P1),
    "| secondo → slot", ev("progress.gear.eq.arma.r + 1"), ok(a0 === "p4" && !eq0 && /Tocca di nuovo: danno del guardiano \+0% → \+28%/.test(P1) && ev("progress.gear.eq.arma.r") === 4));
  ev("tapPiece(4)"); ev("tapPiece(0)"); const a2 = ev("gearArm"); ev("gearArm = null"); g.frame();
  console.log("toccare un’altra riga annulla: in attesa", a2, "| arma ancora ancestrale", ev("progress.gear.eq.arma.r"), ok(a2 === "p0" && ev("progress.gear.eq.arma.r") === 4));
  ev("gearSetMode('fuse'); tapPiece(0)"); const armed = ev("gearArm"); ev("tapPiece(0)");
  console.log("fusione dei pezzi in due tocchi: in attesa", armed, "→ armi rare", ev("progress.gear.pcs['arma:1']"), ok(armed === "p0" && ev("progress.gear.pcs['arma:1']") === 1));
  ev("gearSetTab('mods'); gearSetMode('use'); tapMod(1)"); const m1 = J(ev, "progress.gear.eq.arma.m").length; ev("tapMod(1); tapMod(2); tapMod(2)"); g.frame();
  console.log("primo tocco su un Modulo: installati", m1, ok(m1 === 0));
  console.log("installati con due tocchi:", JSON.stringify(J(ev, "progress.gear.eq.arma.m")), ok(J(ev, "progress.gear.eq.arma.m").length === 2));
  ev("gearSetMode('fuse'); tapMod(1); tapMod(1); tapMod(2)"); g.frame(); const F = g.texts.join("|");
  console.log("fusione dei Moduli: scelti", ev("fuseCount()"), "(ne restano 2 + 1) | pulsante", /Fondi 3\/5/.test(F), ok(ev("fuseCount()") === 3 && /Fondi 3\/5/.test(F)));
  ev("tapSlot(0)"); const a1 = ev("gearArm"); ev("tapSlot(0)");
  console.log("Modulo tolto in due tocchi:", a1, "→ installati", ev("progress.gear.eq.arma.m.length"), ok(a1 === "s0" && ev("progress.gear.eq.arma.m.length") === 1));
  for (const pc of ["guanti", "testa", "armatura", "stivali", "nucleo"]) { ev(`gearPick("${pc}")`); g.frame(); }
  g.key("Escape"); console.log("Esc → stato", ev("state"), "| errori JS:", g.errors.length ? g.errors[0] : "nessuno", ok(ev("state") === "menu" && !g.errors.length));
  const v = fresh(29); v.ev("mode = 'standard'; campLevel = 30; domeMax = 100; domeHp = 100; winLevel()"); v.g.frame(); const V = v.g.texts.join("|");
  console.log("vittoria al 30: avviso", /cadono a ogni vittoria/.test(V), "| tasselli degli oggetti:", (V.match(/Modulo |Arma|Guanti|Testa|Armatura|Stivali|Nucleo/g) || []).length >= 4,
    ok(/cadono a ogni vittoria/.test(V) && !v.g.errors.length));
}
