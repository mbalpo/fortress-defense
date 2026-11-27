// Sigilli e albero dei potenziamenti, fase 1 (DESIGN.md § 16): premi a fine livello, acquisto dei nodi, carte sbloccate,
// torrette equipaggiate e scelte saltate, salvataggio versione 2 con migrazione dalla 1.
const { makeGame } = require("./bot.js");
const ok = (c) => c ? "✓" : "✗ ERRORE";
const patch = (h) => h.replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();")
  .replace("function playerBullet(p, x, y, t, dmg, ang, o) {", "function playerBullet(p, x, y, t, dmg, ang, o) { if (o && o.fan) window.__fan = (window.__fan || 0) + 1;");
const fresh = (cleared, extra) => {
  const prog = Object.assign({ cleared, seen: [] }, extra || {});
  const g = makeGame({ patch, cleared, storage: { "fortress-progress-v1": JSON.stringify(prog) } }); g.frame();
  return { g, ev: g.win.__ev, stored: () => JSON.parse(g.win.localStorage.getItem("fortress-progress-v1")) };
};

console.log("— Premi di Sigilli a fine livello —");
{
  const { ev, stored } = fresh(50);
  const win = (m, lv, full) => ev(`mode = "${m}"; campLevel = ${lv}; domeMax = 100; domeHp = ${full ? 100 : 80}; winLevel(); JSON.stringify(sealGain)`);
  const steps = [
    ["Standard 30, primo completamento", win("standard", 30, true), 0],
    ["Standard 31, primo, cupola 80%", win("standard", 31, false), 1],
    ["Standard 31, rigiocato, cupola 80%", win("standard", 31, false), 0],
    ["Standard 31, rigiocato, cupola 100%", win("standard", 31, true), 1],
    ["Standard 31, ancora al 100%", win("standard", 31, true), 0],
    ["Standard 32, primo già al 100%: tutti e due", win("standard", 32, true), 2],
    ["Standard 32, rigiocato al 100%", win("standard", 32, true), 0],
    ["Epica 1, primo", win("epic", 1, false), 2],
    ["Epica 1, rigiocato al 100%", win("epic", 1, true), 2],
    ["Epica 1, ancora", win("epic", 1, true), 0],
    ["Epica 2, primo già al 100%: tutti e due", win("epic", 2, true), 4],
  ];
  for (const [label, res, exp] of steps) { const r = JSON.parse(res); console.log(label.padEnd(46), "→ +" + r.got, "(" + r.why + ")", ok(r.got === exp)); }
  const p = stored();
  console.log("totale", p.seals, "Sigilli | premi:", p.claims.join(" "), ok(p.seals === 12 && p.claims.join() === "s31,s31p,s32,s32p,e1,e1p,e2,e2p"));
}

console.log("— Albero: acquisto dei nodi e carte sbloccate —");
{
  const { ev, stored } = fresh(31, { seals: 7 });
  const offered = (id) => ev(`(() => { const s = makeShooter(TURRETS.sky, 100, 500); return eligible(s).some((u) => u.id === "${id}"); })()`);
  console.log("prima: Missili incendiari offerta:", offered("burn1"), ok(offered("burn1") === false));
  const st = (i) => ev(`nodeState(TREE.sky[${i}])`);
  const ids = "TREE.sky.filter((n) => n.kind !== 'level').map((n) => n.card || n.kind).join(' ')";
  console.log("sblocchi della Sky Guard:", ev(ids), "| costi:", ev("TREE.sky.filter((n) => n.kind !== 'level').map((n) => n.costs[0]).join(' ')"),
    ok(ev(ids) === "burn1 burn2 burn3 splitB fire again perm start" && ev("TREE.sky.filter((n) => n.kind !== 'level').map((n) => n.costs[0]).join(' ')") === "1 2 3 2 1 2 0 0"
      && ev("TREE.sky.filter((n) => n.kind !== 'level').map((n) => n.mcosts[0]).join(' ')") === "0 0 0 0 0 0 3 3"));   // dalla 1.12.0: costo = livello della carta, Sblocco permanente 3 maggiori; dalla 1.22.0 Carta iniziale 3 maggiori
  console.log("stato iniziale: lv1", st(0), "| lv2", st(1), "| finale", st(6), ok(st(0) === "ready" && st(1) === "req" && st(6) === "req"));
  ev("openTree(); treeSel = 'sky'; tapNode(TREE.sky[0])");
  console.log("primo tocco: in attesa, Sigilli", ev("progress.seals"), ok(ev("treeArm") === "sky:burn1" && ev("progress.seals") === 7));
  ev("tapNode(TREE.sky[0])");
  console.log("secondo tocco: comprato, Sigilli", ev("progress.seals"), "| ora offerta:", offered("burn1"), ok(ev("progress.seals") === 6 && offered("burn1") && stored().tree["sky:burn1"] === 1));
  ev("buyNode(TREE.sky[1])"); ev("buyNode(TREE.sky[2])");
  console.log("lv2 e lv3 (costo 2 + 3): Sigilli", ev("progress.seals"), "| carta lv2 dopo (costo 2) con 1 Sigillo:", st(3), ok(ev("progress.seals") === 1 && st(3) === "poor"));
  console.log("comprare un nodo senza Sigilli:", ev("buyNode(TREE.sky[3])"), ok(ev("buyNode(TREE.sky[3])") === false));
  const combo = (seals) => ev(`(() => { progress.seals = ${seals}; slots[0] = makeShooter(TURRETS.thunder, SLOT_X[0], GROUND_Y - 14); slots[0].up.fork1 = 1;
    player.level = 2; player.used = 0; return eligible(player).some((u) => u.id === "kThunder"); })()`);
  ev("startRun('standard')");
  const before = combo(1); ev("buyNode(TREE.thunder[0])"); const after = combo(0);
  console.log("combo Colpi ramificati: prima dello sblocco", before, "| dopo", after, ok(!before && after));
}

console.log("— Sblocco permanente e torrette equipaggiate —");
{
  const all = (id) => Object.fromEntries(["burn1", "burn2", "burn3", "splitB", "fire", "again", "perm"].map((k) => [id + ":" + k, 1]));
  const { ev } = fresh(35, { seals: 50, majors: 3 });
  ev("TREE.rail.slice(0, 6).forEach(buyNode)");
  console.log("Railgun, nodi comprati tranne il finale → finale:", ev("nodeState(TREE.rail[6])"), ok(ev("nodeState(TREE.rail[6])") === "ready"));
  ev("buyNode(TREE.rail[6])");
  console.log("finale comprato, Sigilli rimasti:", ev("progress.seals"), "| maggiori:", ev("progress.majors"), ok(ev("progress.seals") === 39 && ev("progress.majors") === 0));   // 50 − (1+2+3+2+1+2); finale 3 maggiori
  console.log("equipaggia senza sblocco (Laser):", ev("toggleEquip('laser')"), "| Railgun:", ev("toggleEquip('rail')"), ok(!ev("toggleEquip('laser')") && ev("progress.loadout.join()") === "rail"));
  const g2 = fresh(35, { seals: 0, tree: Object.assign(all("sky"), all("rail"), { "tesla:perm": 1, "beam:perm": 1, "hive:perm": 1 }), loadout: ["sky", "rail", "tesla", "beam", "hive", "nope"] });
  console.log("dal salvataggio: equipaggiate", g2.ev("progress.loadout.join()"), "(massimo 4, solo con lo sblocco)", ok(g2.ev("progress.loadout.join()") === "sky,rail,tesla,beam"));
  const g3 = fresh(35, { tree: Object.assign(all("sky"), all("rail")), loadout: ["sky", "rail"] }), e = g3.ev;
  e("startRun('standard')");
  console.log("partita: slot", e("slots.map((s) => s ? s.id : '-').join(' ')"), ok(e("slots.map((s) => s ? s.id : '-').join(' ')") === "sky rail - -"));
  const seq = [];
  for (let i = 0; i < 3; i++) { e("queue = []; enemies.length = 0; endWave()"); seq.push(e("state + ' ' + wave")); e("pick(0)"); }
  console.log("fine delle ondate 1, 2, 3:", seq.join(" · "), ok(seq.join() === "upgrade 1,upgrade 2,upgrade 3"));   // dalla 1.10.1 nessuna scelta saltata
  let offeredOwned = false;
  for (let i = 0; i < 300; i++) if (e("rollOptions().some((o) => o.kind === 'new' && (o.id === 'sky' || o.id === 'rail'))")) offeredOwned = true;
  console.log("le torrette equipaggiate escono come carta:", offeredOwned, ok(!offeredOwned));
  // dalla 1.10.1 le torrette equipaggiate non consumano scelte: 19 carte in una partita
  const g4 = fresh(35, { tree: Object.assign(all("sky"), all("rail")), loadout: ["sky", "rail"] }), f = g4.ev;
  f("startRun('standard')"); let cards = 0;
  for (let w = 1; w < 20; w++) { f("queue = []; enemies.length = 0; endWave()"); if (f("state") === "upgrade") { cards++; f("pick(0)"); } }
  console.log("carte scelte in una partita:", cards, "con 2 equipaggiate", ok(cards === 19));
}

console.log("— Schermata dell’albero —");
{
  const a = fresh(30); a.ev("openTree()");
  console.log("30 livelli completati: albero aperto", a.ev("state") === "tree", ok(a.ev("state") === "menu"));
  const b = fresh(31); b.ev("openTree()"); b.g.frame(); const T = b.g.texts.join("|");
  console.log("31 livelli: aperto", b.ev("state"), "| testi:", /ALBERO DEI SIGILLI/.test(T), /Sblocco permanente/.test(T), ok(b.ev("state") === "tree" && /Sblocco permanente/.test(T) && !b.g.errors.length));
  for (const tab of ["player", "barrier"]) { b.ev(`treeTab = "${tab}"`); b.g.frame(); }
  b.g.key("Escape"); console.log("Esc → stato", b.ev("state"), "| errori JS:", b.g.errors.length ? b.g.errors[0] : "nessuno", ok(b.ev("state") === "menu" && !b.g.errors.length));
}

console.log("— Salvataggio versione 2 —");
{
  const { ev } = fresh(40, { seals: 5, majors: 0, claims: ["s31", "s31p", "bad", 3], tree: { "sky:burn1": 1, "xyz:abc": 1 }, loadout: [] });
  console.log("caricato: Sigilli", ev("progress.seals"), "| premi", ev("progress.claims.join()"), "| nodi", ev("Object.keys(progress.tree).join()"),
    ok(ev("progress.seals") === 5 && ev("progress.claims.join()") === "s31,s31p" && ev("Object.keys(progress.tree).join()") === "sky:burn1"));
  const save = JSON.parse(ev("JSON.stringify(makeSave())"));
  console.log("esportato: versione", save.version, "| Sigilli", save.progress.seals, ok(save.version === 10 && save.progress.seals === 5 && save.progress.tree["sky:burn1"] === 1));
  const v1 = JSON.stringify({ game: "fortress-defense", version: 1, progress: { cleared: 12, seen: [] }, settings: {} });
  const d1 = JSON.parse(ev(`JSON.stringify(parseSave(${JSON.stringify(v1)}))`));
  console.log("versione 1 importata: livelli", d1.cleared, "| Sigilli", d1.seals, "| nodi", Object.keys(d1.tree).length, ok(d1.cleared === 12 && d1.seals === 0 && !Object.keys(d1.tree).length));
  const code = ev("makeCode()"); ev("progress.seals = 0; progress.tree = {}"); ev(`applySave(parseSave(${JSON.stringify(code)}))`);
  console.log("codice FD1 andata e ritorno: Sigilli", ev("progress.seals"), "| nodi", ev("Object.keys(progress.tree).join()"), ok(ev("progress.seals") === 5 && ev("progress.tree['sky:burn1']") === 1));
  const old = fresh(20, {}); console.log("vecchio formato in memoria (senza Sigilli): Sigilli", old.ev("progress.seals"), "| errori:", old.g.errors.length, ok(old.ev("progress.seals") === 0 && !old.g.errors.length));
}

console.log("— Fase 2: nodi a livelli —");
{
  const { ev } = fresh(40, { seals: 100, majors: 10 });
  console.log("nodi: Sky Guard", ev("TREE.sky.length"), "| guardiano", ev("TREE.player.length"), "| tipi", ev("TREE.types.length"), "| barriera", ev("TREE.barrier.length"),
    "| carte standard della Sky Guard:", ev("TREE.sky.filter((n) => n.kind === 'level').map((n) => n.id).join(' ')"),
    ok(ev("TREE.sky.length") === 12 && ev("TREE.player.length") === 12 && ev("TREE.types.length") === 7 && ev("TREE.barrier.length") === 8));   // 1.22.0: Carta iniziale e Carta extra; 1.30.0: Specializzazione e Tetto della riduzione
  const costs = [], mc = []; for (let i = 0; i < 21; i++) { const before = ev("progress.seals"), mb = ev("progress.majors"); ev("buyNode(TREE_NODE['sky:std:dmg'])"); costs.push(before - ev("progress.seals")); mc.push(mb - ev("progress.majors")); }
  console.log("Danno maggiorato della Sky Guard, livelli 1-20 e oltre: costi", costs.join(""), "(totale " + costs.reduce((a, b) => a + b) + ") | maggiori", mc.join(""), "| stato", ev("nodeState(TREE_NODE['sky:std:dmg'])"),
    ok(costs.join("") === "111112222233333444440" && mc.join("") === "100001000010000100000" && ev("nodeState(TREE_NODE['sky:std:dmg'])") === "max"));
  const mOf = (id) => ev(`TREE_NODE['${id}'].mcosts.join('')`);
  console.log("maggiori per livello: +1 missile", mOf("sky:std:msl"), "| guardiano +1 proiettile", mOf("player:std:proj"), "| Ventaglio", mOf("player:fan"), "| Frenesia", mOf("player:frenzy"),
    "| Danno del guardiano", mOf("player:std:dmg").slice(0, 6) + "…", "| Durata degli stati", mOf("types:status"), "| Danno Fire", mOf("types:dmg:fire").slice(0, 6) + "…", "| Vita %", mOf("barrier:hp").slice(0, 6) + "…",
    ok(mOf("sky:std:msl") === "10000" && mOf("player:std:proj") === "111" && mOf("player:fan") === "111" && mOf("player:frenzy") === "111" && mOf("player:std:dmg").startsWith("100001")
      && mOf("types:status") === "10000" && mOf("types:dmg:fire").startsWith("100001") && mOf("barrier:hp") === "00000100001000010000" && mOf("barrier:red") === "10000" && mOf("barrier:cards") === "10000"));   // barriera dalla 1.14.0
  ev("progress.majors = 0"); console.log("senza Sigilli maggiori: Ventaglio", ev("nodeState(TREE_NODE['player:fan'])"), "| Vita % (solo normali)", ev("nodeState(TREE_NODE['barrier:hp'])"),
    ok(ev("nodeState(TREE_NODE['player:fan'])") === "poor" && ev("nodeState(TREE_NODE['barrier:hp'])") === "ready"));
  console.log("livelli massimi: Danno maggiorato", ev("TREE_NODE['sky:std:dmg'].max"), "| +1 missile", ev("TREE_NODE['sky:std:msl'].max"), "| Danno Fire", ev("TREE_NODE['types:dmg:fire'].max"),
    "| tutte", ev("TREE_NODE['types:all'].max"), "| Vita %", ev("TREE_NODE['barrier:hp'].max"), "| Più carte", ev("TREE_NODE['barrier:cards'].max"),
    ok(ev("[TREE_NODE['sky:std:dmg'].max, TREE_NODE['sky:std:msl'].max, TREE_NODE['types:dmg:fire'].max, TREE_NODE['types:all'].max, TREE_NODE['barrier:hp'].max, TREE_NODE['barrier:cards'].max].join()") === "20,5,20,20,20,5"));
  ev("buyNode(TREE_NODE['barrier:hp'])"); console.log("Riduzione danno senza maggiori:", ev("nodeState(TREE_NODE['barrier:red'])"), ok(ev("nodeState(TREE_NODE['barrier:red'])") === "poor"));
  ev("progress.majors = 1"); ev("buyNode(TREE_NODE['barrier:red'])");
  console.log("Riduzione danno oltre il livello di Vita %:", ev("nodeState(TREE_NODE['barrier:red'])"), "| dopo Vita % al 2:", (ev("buyNode(TREE_NODE['barrier:hp'])"), ev("nodeState(TREE_NODE['barrier:red'])")),
    ok(ev("treeLv('barrier:red')") === 1 && ev("nodeState(TREE_NODE['barrier:red'])") === "ready"));
  ev("progress.tree['barrier:hp'] = 1"); console.log("regola dei livelli con Vita % al 1:", ev("nodeState(TREE_NODE['barrier:red'])"), ok(ev("nodeState(TREE_NODE['barrier:red'])") === "req"));
}
{
  const set = (tree) => fresh(40, { tree }).ev;
  const e1 = set({ "sky:std:dmg": 5, "sky:std:msl": 3, "rail:std:pierce": 5, "rail:std:cd": 5, "hive:std:hits": 5, "tesla:std:bounce": 5, "types:dmg:fire": 2, "types:all": 1 });
  const v = (c) => +(+e1(c)).toFixed(4);
  console.log("Sky Guard, 1 pila di Danno al livello 5 + Fire 2 + tutte 1: danno ×" + v("(() => { const s = makeShooter(TURRETS.sky, 0, 0); s.up.dmg = 1; return dmgM(s); })()"),
    "(atteso 1,75 × 1,15 = " + (1.75 * 1.15).toFixed(4) + ")", ok(v("(() => { const s = makeShooter(TURRETS.sky, 0, 0); s.up.dmg = 1; return dmgM(s); })()") === +(1.75 * 1.15).toFixed(4)));
  console.log("+1 missile al livello 3: malus", v("stdM(makeShooter(TURRETS.sky, 0, 0), 'msl', 0.85)"), "| Teslacoil +1 rimbalzo al 5:", v("stdM(makeShooter(TURRETS.tesla, 0, 0), 'bounce', 0.85)"),
    ok(v("stdM(makeShooter(TURRETS.sky, 0, 0), 'msl', 0.85)") === 1 && v("stdM(makeShooter(TURRETS.tesla, 0, 0), 'bounce', 0.85)") === 1.1));
  console.log("Railgun al 5: perforazione per pila", v("stdC(makeShooter(TURRETS.rail, 0, 0), 'pierce', 1)"), "| ricarica per pila", v("stdR(makeShooter(TURRETS.rail, 0, 0), 'cd', 0.88)"),
    "| Hive colpi per pila", v("stdC(makeShooter(TURRETS.hive, 0, 0), 'hits', 2)"),
    ok(v("stdC(makeShooter(TURRETS.rail, 0, 0), 'pierce', 1)") === 3 && v("stdR(makeShooter(TURRETS.rail, 0, 0), 'cd', 0.88)") === 0.76 && v("stdC(makeShooter(TURRETS.hive, 0, 0), 'hits', 2)") === 6));
  console.log("bonus del tipo: Laser (Energy) ×" + v("makeShooter(TURRETS.laser, 0, 0).tb"), "| guardiano ×" + v("makeShooter(PLAYER_DEF, 0, 0).tb"),
    ok(v("makeShooter(TURRETS.laser, 0, 0).tb") === 1.03 && v("makeShooter(PLAYER_DEF, 0, 0).tb") === 1));
  const e0 = set({}); console.log("senza albero: danno ×" + (+e0("(() => { const s = makeShooter(TURRETS.sky, 0, 0); s.up.dmg = 1; return dmgM(s); })()")).toFixed(2), "| malus", e0("stdM(makeShooter(TURRETS.sky, 0, 0), 'msl', 0.85)"),
    ok(+e0("(() => { const s = makeShooter(TURRETS.sky, 0, 0); s.up.dmg = 1; return dmgM(s); })()") === 1.25 && e0("stdM(makeShooter(TURRETS.sky, 0, 0), 'msl', 0.85)") === 0.85));
}
{
  const ev = fresh(40, { tree: { "barrier:hp": 2, "barrier:red": 2, "barrier:flat": 1, "barrier:ignore": 5, "types:status": 5, "player:fan": 3, "player:std:proj": 3 } }).ev;
  ev("startRun('standard'); queue = []; enemies.length = 0; spawn({ enemy: 'drone', x: 180 })");
  console.log("cupola: vita", ev("domeMax"), "(attesa 100 × 1,2 + 10 = 130) | riduzione", ev("domeRed()"), ok(ev("domeMax") === 130 && Math.abs(ev("domeRed()") - 0.06) < 1e-9));
  console.log("con META.domeReduction 0,35: riduzione", ev("META.domeReduction = 0.35; domeRed()"), "| con 0,5:", ev("META.domeReduction = 0.5; domeRed()"), "(tetto 0,5)",
    ok(ev("META.domeReduction = 0.35; domeRed()") === 0.41 && ev("META.domeReduction = 0.5; domeRed()") === 0.5));
  const ign = ev("(() => { META.domeReduction = 0; const e = enemies[0]; e.dmg = 1; let n = 0; for (let i = 0; i < 4000; i++) { const h = domeHp; domeHit(e); if (domeHp === h) n++; domeHp = 1e6; } return n / 4000; })()");
  console.log("Ignorare un colpo al 5: colpi ignorati", (ign * 100).toFixed(1) + "% (atteso 10)", ok(Math.abs(ign - 0.1) < 0.02));
  console.log("Durata degli stati al 5: rallentamento di 1 s →", ev("(() => { const e = enemies[0]; e.slowT = 0; slow(e, 1); return e.slowT; })()"), "s", ok(Math.abs(ev("(() => { const e = enemies[0]; e.slowT = 0; slow(e, 1); return e.slowT; })()") - 1.3) < 1e-9));
  const fan = ev("(() => { window.__fan = 0; player.up.fan = 1; player.cd = 0; enemies[0].y = 300; playerTick(player, 0.016); return window.__fan; })()");
  console.log("Ventaglio potenziato al 3: proiettili secondari per salva", fan, "al", ev("fanK(player.fanX)"), "del danno | malus di +1 proiettile al 3:", ev("stdM(player, 'proj', 0.85)"),
    ok(fan === 4 && Math.abs(ev("fanK(player.fanX)") - 0.8) < 1e-9 && ev("stdM(player, 'proj', 0.85)") === 1));
}
{
  const ev = fresh(40, { majors: 0, tree: { "sky:std:dmg": 25, "barrier:hp": 2.7, "player:fan": 8 } }).ev;
  console.log("livelli oltre il massimo dal salvataggio:", ev("JSON.stringify(progress.tree)"), ok(ev("JSON.stringify(progress.tree)") === '{"sky:std:dmg":20,"barrier:hp":2,"player:fan":3}'));
}

console.log("— 1.12.0: Frenesia potenziata, Sigilli maggiori, abilità d’ingresso —");
{
  const ev = fresh(40, { majors: 0, tree: { "player:frenzy": 3 } }).ev;
  ev("startRun('standard')");
  console.log("Frenesia potenziata al 3: danno ×" + ev("frenzyK(player.frzL)"), "(base ×1,35) | carica", ev("FRENZY.fill[0] + 2 * player.frzL"), "s (base 30)",
    ok(Math.abs(ev("frenzyK(player.frzL)") - 3) < 1e-9 && ev("FRENZY.fill[0] + 2 * player.frzL") === 36));
  const ep = fresh(60, { majors: 0 }).ev;
  ep("mode = 'epic'; campLevel = 10; startRun('epic'); enemies = []; queue = [];");
  const kill = (final) => ep(`(() => { spawn({ enemy: "boss", def: ${final ? "finalBossDef(10)" : "bossDef(10, 5)"}, x: 180 }); const b = enemies[enemies.length - 1]; b.dead = true; update(0.001); return progress.majors; })()`);
  ep("Math.random = () => 0"); const m1 = kill(false), m2 = kill(false), m3 = kill(true);
  console.log("Epica: mini-boss (tiro riuscito) → maggiori", m1, "| secondo mini-boss nello stesso livello", m2, "| boss finale", m3, "| salvati", ep("JSON.parse(localStorage.getItem('fortress-progress-v1')).majors"),
    ok(m1 === 1 && m2 === 1 && m3 === 2 && ep("JSON.parse(localStorage.getItem('fortress-progress-v1')).majors") === 2));
  const st = fresh(60, { majors: 0 }).ev; st("startRun('standard'); enemies = []; queue = []; Math.random = () => 0");
  const ms = st(`(() => { spawn({ enemy: "boss", def: finalBossDef(60), x: 180 }); enemies[enemies.length - 1].dead = true; update(0.001); return progress.majors; })()`);
  console.log("Standard: boss finale → maggiori", ms, ok(ms === 0));
  const old = fresh(45, {}).ev, nu = fresh(45, { majors: 0 }).ev;
  console.log("abilità d’ingresso: salvataggio vecchio (senza majors) al 45 →", old("treeLv('ab:regen')"), "| salvataggio nuovo →", nu("treeLv('ab:regen')"), "costo", nu("nodeCost(TREE_NODE['ab:regen'])"),
    "| in partita senza comprarle:", (nu("startRun('standard')"), nu("AB.list.length")),
    ok(old("treeLv('ab:regen')") === 1 && nu("treeLv('ab:regen')") === 0 && nu("nodeCost(TREE_NODE['ab:regen'])") === 1 && nu("AB.list.length") === 0));
  const mn = fresh(45, { majors: 0 }).ev;
  mn("startRun('standard'); enemies = []; queue = []; ents = []; window.__a = makeShooter(TURRETS.aero, 180, 600);");
  const n = mn("(() => { for (let i = 0; i < 30; i++) mine(__a, 20 + i * 10, 300); return ents.filter((o) => o.mine).length; })()");
  const near = mn(`(() => { ents = []; const m = mine(__a, 180, 300); spawn({ enemy: "drone", x: 180 }); const e = enemies[0]; Object.assign(e, { y: 300 + e.def.r + 15, speed: 0 }); m.update(0.016); const a = m.dead;
    const m2 = mine(__a, 100, 300); Object.assign(e, { x: 100, y: 300 + e.def.r + 17 }); m2.update(0.016); return [a, m2.dead]; })()`);
  const hv = fresh(45, { majors: 0 }).ev;
  const evo = hv(`(() => { startRun('standard'); enemies = []; queue = []; ents = []; const h = makeShooter(TURRETS.hive, 180, 600); h.up.evo1 = 1; h.up.evo2 = 1;
    spawn({ enemy: "brute", x: 180 }); Object.assign(enemies[0], { y: 300, speed: 0, hp: 1e9, maxHp: 1e9 });
    hiveDrone(h, 180, 340, 1, 0); const d = h.st.hive[0]; d.cap = 3; const out = [];
    for (let i = 0; i < 3; i++) d.fire(); out.push(d.lvl, d.cap); for (let i = 0; i < 3; i++) d.fire(); out.push(d.lvl, d.cap);
    const shots = ents.filter((o) => o.lvl && o.px !== undefined).length; return out.concat([shots]); })()`);
  console.log("Hive, drone con 3 colpi: dopo l’evoluzione al lv2 lv/colpi massimi", evo[0] + "/" + evo[1], "| al lv3", evo[2] + "/" + evo[3], "| colpi visibili in volo", evo[4],
    ok(evo[0] === 2 && evo[1] === 5 && evo[2] === 3 && evo[3] === 9 && evo[4] > 0));
  console.log("mine: 30 richieste → a schermo", n, "| nemico a 15 px dal bordo → scoppia", near[0], "| a 17 px →", near[1], ok(n === 25 && near[0] === true && near[1] === false));
}

console.log("— Nodo “Più carte, più danno” —");
{
  const ev = fresh(40, { tree: { "barrier:cards": 3 } }).ev;
  ev("startRun('standard'); slots[0] = makeShooter(TURRETS.sky, SLOT_X[0], GROUND_Y - 14); slots[1] = makeShooter(TURRETS.rail, SLOT_X[1], GROUND_Y - 14); markTop()");
  const m = (w) => +(+ev(`dmgM(${w})`)).toFixed(4);
  console.log("nessuna carta: guardiano ×" + m("player"), "| Sky Guard ×" + m("slots[0]"), ok(m("player") === 1 && m("slots[0]") === 1));
  ev("applyUp(slots[0], TURRETS.sky.ups.find((u) => u.id === 'rad'))");
  console.log("1 carta alla Sky Guard (livello 3: +15%): Sky Guard ×" + m("slots[0]"), "| Railgun ×" + m("slots[1]"), "| guardiano ×" + m("player"), ok(m("slots[0]") === 1.15 && m("slots[1]") === 1 && m("player") === 1));
  ev("applyUp(player, PLAYER_DEF.ups.find((u) => u.id === 'pierce'))");
  console.log("pari (1 e 1): Sky Guard ×" + m("slots[0]"), "| guardiano ×" + m("player"), "| Railgun ×" + m("slots[1]"), ok(m("slots[0]") === 1.15 && m("player") === 1.15 && m("slots[1]") === 1));
  ev("applyUp(player, PLAYER_DEF.ups.find((u) => u.id === 'pierce'))");
  console.log("guardiano davanti (2 contro 1): Sky Guard ×" + m("slots[0]"), "| guardiano ×" + m("player"), ok(m("slots[0]") === 1 && m("player") === 1.15));
  const e0 = fresh(40, {}).ev; e0("startRun('standard'); applyUp(player, PLAYER_DEF.ups.find((u) => u.id === 'pierce'))");
  console.log("senza il nodo: guardiano in testa ×" + (+e0("dmgM(player)")).toFixed(2), ok(+e0("dmgM(player)") === 1));
}
