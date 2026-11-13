// Abilità della barriera, fase 3 (DESIGN.md § 16): gruppi ed equipaggiamento, le 9 abilità in battaglia, cooldown sfalsati e fermi fuori dal gioco, salvataggio.
const { makeGame } = require("./bot.js");
const ok = (c) => c ? "✓" : "✗ ERRORE";
const patch = (h) => h.replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();")
  .replace("function mine(s, x, y) {", "function mine(s, x, y) { (window.__mines = window.__mines || []).push(s);");
const fresh = (cleared, extra) => {
  const g = makeGame({ patch, cleared, level: Math.min(cleared + 1, 200), storage: { "fortress-progress-v1": JSON.stringify(Object.assign({ cleared, seen: [] }, extra || {})) } }); g.frame();
  return { g, ev: g.win.__ev };
};
// partita al livello 45, senza ondate; un nemico fuori schermo tiene aperta l’ondata
function battle(extra, ab) {
  const t = fresh(45, extra), ev = t.ev;
  if (ab) ev(`progress.abilities = ${JSON.stringify(ab)}`);
  ev("selLevel = 45; startRun('standard'); queue = []; enemies.length = 0; spawn({ enemy: 'drone', x: 180 }); Object.assign(enemies[0], { y: -400, speed: 0, hp: 1e9, maxHp: 1e9 });");
  t.mk = (x, y) => ev(`(() => { spawn({ enemy: 'shell', x: ${x} }); const e = enemies[enemies.length - 1]; Object.assign(e, { x: ${x}, y: ${y}, speed: 0, hp: 1e7, maxHp: 1e7, dmg: 4 }); return enemies.length - 1; })()`);
  t.run = (sec) => { for (let i = 0; i < Math.round(sec * 60); i++) t.g.frame(); };
  return t;
}

console.log("— Gruppi, sblocchi ed equipaggiamento —");
{
  const { ev } = fresh(45, { seals: 20 });
  console.log("gruppi:", ev("AB_GROUPS.map(([g, , ids]) => g + ' ' + ids.join('/')).join(' · ')"),
    ok(ev("AB_GROUPS.map(([g, , ids]) => ids.join('/')).join(' ')") === "regen/backup/impen repulse/freeze/reflect burn/mines/power"));
  console.log("livelli di partenza: Rigenerazione", ev("treeLv('ab:regen')"), "| Backup", ev("treeLv('ab:backup')"), "| Impenetrabile", ev("nodeState(TREE_NODE['ab:impen'])"),
    "| costo per sbloccare il Backup", ev("nodeCost(TREE_NODE['ab:backup'])"),
    ok(ev("treeLv('ab:regen')") === 1 && ev("treeLv('ab:backup')") === 0 && ev("nodeState(TREE_NODE['ab:impen'])") === "req" && ev("nodeCost(TREE_NODE['ab:backup'])") === 3));
  console.log("equipaggiate senza scelta:", ev("JSON.stringify(equippedAbilities())"), ok(ev("JSON.stringify(equippedAbilities())") === '{"resist":"regen","control":"repulse","offense":"burn"}'));
  console.log("equipaggiare il Backup non sbloccato:", ev("equipAbility('backup')"), ok(ev("equipAbility('backup')") === false));
  ev("buyNode(TREE_NODE['ab:backup'])");
  console.log("sbloccato (3 Sigilli) e equipaggiato:", ev("equipAbility('backup')"), "→", ev("JSON.stringify(equippedAbilities())"), "| Sigilli", ev("progress.seals"),
    ok(ev("equippedAbilities().resist") === "backup" && ev("progress.seals") === 17));
  console.log("Impenetrabile oltre il livello del Backup:", ev("buyNode(TREE_NODE['ab:impen'])"), "| poi", ev("nodeState(TREE_NODE['ab:impen'])"),
    ok(ev("treeLv('ab:impen')") === 1 && ev("nodeState(TREE_NODE['ab:impen'])") === "req"));
  ev("equipAbility('repulse')");
  console.log("tolta la Repulsiva:", ev("JSON.stringify(equippedAbilities())"), ok(ev("JSON.stringify(equippedAbilities())") === '{"resist":"backup","offense":"burn"}'));
  const a = fresh(39); a.ev("selLevel = 39; startRun('standard')");
  const b = fresh(40); b.ev("selLevel = 40; startRun('standard')");
  console.log("abilità in partita con 39 livelli completati:", a.ev("AB.list.length"), "| con 40:", b.ev("AB.list.map((x) => x.id).join(' ')"),
    ok(a.ev("AB.list.length") === 0 && b.ev("AB.list.map((x) => x.id).join(' ')") === "regen repulse burn"));
}

console.log("— Cooldown: partenza sfalsata, fermi in pausa e nella scelta delle carte —");
{
  const t = battle({}, { resist: "regen", control: "freeze", offense: "power" }), ev = t.ev;
  console.log("primo scatto: Congelante", ev("hasAb('freeze').t"), "s | Potenziante", ev("hasAb('power').t"), "s", ok(ev("hasAb('freeze').t") === 10 && ev("hasAb('power').t") === 20));
  t.run(5); const a = +ev("hasAb('freeze').t");
  ev("pauseGame()"); t.run(5); const b = +ev("hasAb('freeze').t"); ev("resumeGame(); state = 'upgrade'"); t.run(5); const c = +ev("hasAb('freeze').t");
  console.log("dopo 5 s di gioco", a.toFixed(2), "| dopo 5 s di pausa", b.toFixed(2), "| dopo 5 s di scelta delle carte", c.toFixed(2), ok(Math.abs(a - 5) < 0.05 && a === b && b === c));
  ev("state = 'play'"); t.mk(180, 300); t.run(5.2);
  console.log("scattata a 10 s: gas attivo", (+ev("AB.gasT")).toFixed(1), "s, ricarica", (+ev("hasAb('freeze').t")).toFixed(1), "s", ok(+ev("AB.gasT") > 7 && +ev("hasAb('freeze').t") > 39));
}

console.log("— Resistere —");
{
  const t = battle({ tree: { "ab:regen": 3 } }), ev = t.ev;   // livello 3: 3%/s per 6 s, 2 volte
  ev("domeHp = 50"); t.run(1); const noHeal = +ev("domeHp");
  ev("domeHp = 30"); t.run(6.1); const healed = +ev("domeHp");
  console.log("Rigenerazione al 3: sopra il 40% non cura (" + noHeal + "); dal 30%, dopo 6 s:", healed.toFixed(1), "(attesi 30 + 3 × 6 = 48)", ok(noHeal === 50 && Math.abs(healed - 48) < 0.6));
  ev("domeHp = 30"); t.run(6); const waiting = +ev("domeHp");
  t.run(13); const second = +ev("domeHp"); t.run(18); ev("domeHp = 30"); t.run(10); const third = +ev("domeHp");
  console.log("subito dopo: ferma per 2 × 6 s (" + waiting + ") | poi seconda cura (" + second.toFixed(1) + ") | terza no, massimo 2 (" + third.toFixed(1) + ")",
    ok(waiting === 30 && second > 40 && third === 30));
}
{
  const t = battle({ tree: { "ab:backup": 2 } }, { resist: "backup" }), ev = t.ev;   // livello 2: 30%
  ev("domeHp = -5"); t.run(0.1);
  console.log("Backup al 2: la cupola cade → vita", ev("domeHp"), "di", ev("domeMax"), "| stato", ev("state"), ok(ev("domeHp") === 30 && ev("state") === "play"));
  ev("domeHp = -5"); t.run(0.1); console.log("seconda caduta → stato", ev("state"), ok(ev("state") === "lost"));
  const w = battle({ tree: { "ab:backup": 1 } }, { resist: "backup" });
  w.ev("domeHp = -1"); w.run(0.1); w.ev("domeHp = domeMax; winLevel()");
  console.log("vinto con la cupola piena dopo il Backup: premio della cupola", w.ev("sealGain.why"), "(il primo completamento sì, quello della cupola no)",
    ok(w.ev("sealGain.why") === "first" && !w.ev("progress.claims.includes('s45p')")));
  w.ev("selLevel = 45; startRun('standard'); domeHp = domeMax; winLevel()");
  console.log("rigiocato senza Backup e al 100%:", w.ev("sealGain.why"), ok(w.ev("sealGain.why") === "full"));
}
{
  const t = battle({ tree: { "ab:backup": 3, "ab:impen": 3 } }, { resist: "impen" }), ev = t.ev;   // livello 3: ogni 30 s
  t.run(91); const n = +ev("domeShield");
  console.log("Impenetrabile al 3: immunità dopo 91 s", n, "(attese 3, si accumulano)", ok(n === 3));
  const i = t.mk(180, 470), h = +ev("domeHp"); ev(`domeHit(enemies[${i}])`);
  console.log("un colpo: vita", ev("domeHp"), "(prima " + h + ") | immunità", ev("domeShield"), ok(+ev("domeHp") === h && +ev("domeShield") === 2));
}

console.log("— Controllo —");
{
  const t = battle({ tree: { "ab:repulse": 2 } }), ev = t.ev;   // 70 px
  const L1 = t.mk(60, 470), L2 = t.mk(100, 460), R1 = t.mk(290, 470);
  const y = (i) => +ev(`enemies[${i}].y`), before = [y(L1), y(L2), y(R1)];
  ev("fireAbility(hasAb('repulse'))");
  console.log("Repulsiva al 2, due nemici a sinistra e uno a destra: spinti di", (before[0] - y(L1)).toFixed(0), (before[1] - y(L2)).toFixed(0), "| a destra", (before[2] - y(R1)).toFixed(0),
    ok(Math.abs(before[0] - y(L1) - 70) < 1 && before[2] === y(R1)));
}
{
  const t = battle({ tree: { "ab:freeze": 3 } }, { control: "freeze" }), ev = t.ev;   // −35%, 100 px
  const near = t.mk(180, 400), far = t.mk(180, 200); ev("fireAbility(hasAb('freeze'))"); t.run(0.2);
  console.log("Congelante al 3: indebolito nel gas", ev(`enemies[${near}].weakT > 0`), "−" + Math.round(ev(`enemies[${near}].weakK`) * 100) + "% | fuori dal gas", ev(`enemies[${far}].weakT > 0`),
    ok(ev(`enemies[${near}].weakT > 0`) && Math.abs(ev(`enemies[${near}].weakK`) - 0.35) < 1e-9 && !ev(`enemies[${far}].weakT > 0`)));
  const f = battle({ tree: { "ab:freeze": 5 } }, { control: "freeze" }), e = f.mk(180, 470);
  f.ev("fireAbility(hasAb('freeze'))"); f.run(0.1); const h = +f.ev("domeHp"); f.ev(`domeHit(enemies[${e}])`);
  const lost = h - f.ev("domeHp"), full = +f.ev(`enemies[${e}].dmg`) * (1 - f.ev("domeRed()"));
  console.log("al 5: danno alla cupola", lost.toFixed(2), "invece di", full.toFixed(2), "(−45%)", ok(Math.abs(lost / full - 0.55) < 0.01));
  f.run(9); console.log("dopo 8 s il gas finisce:", +f.ev("AB.gasT") <= 0, ok(+f.ev("AB.gasT") <= 0));
}
{
  const t = battle({ tree: { "ab:freeze": 2, "ab:reflect": 2 } }, { control: "reflect" }), ev = t.ev;   // 40% per 5 s
  const e = t.mk(180, 470); ev("fireAbility(hasAb('reflect'))");
  const h0 = +ev(`enemies[${e}].hp`); ev(`domeHit(enemies[${e}])`); const got = h0 - ev(`enemies[${e}].hp`);
  console.log("Riflettente al 2: il nemico subisce", got.toFixed(2), "del danno che fa (" + (ev(`enemies[${e}].dmg`) * (1 - ev("domeRed()"))).toFixed(2) + ")", ok(got > 0));
  t.run(5.1); const h1 = +ev(`enemies[${e}].hp`); ev(`domeHit(enemies[${e}])`);
  console.log("dopo 5 s non riflette più:", +ev(`enemies[${e}].hp`) === h1, ok(+ev(`enemies[${e}].hp`) === h1));
}

console.log("— Offesa —");
{
  const t = battle({ tree: { "ab:burn": 2 } }), ev = t.ev;   // 6 s
  const e = t.mk(180, 470); ev("fireAbility(hasAb('burn'))"); ev(`domeHit(enemies[${e}])`);
  console.log("Ustionante senza torrette di fuoco: bruciatura", ev(`enemies[${e}].burnDps`), "al secondo (fissa 6)", ok(ev(`enemies[${e}].burnDps`) === 6));
  ev("slots[0] = makeShooter(TURRETS.sky, SLOT_X[0], GROUND_Y - 14); slots[0].up.dmg = 2; slots[1] = makeShooter(TURRETS.wheel, SLOT_X[1], GROUND_Y - 14)");
  ev("fireAbility(hasAb('burn'))"); const e2 = t.mk(200, 470); ev(`domeHit(enemies[${e2}])`);
  console.log("con Sky Guard (Danno ×2) e Firewheel: bruciatura", (+ev(`enemies[${e2}].burnDps`)).toFixed(1), "(la maggiore: 6 × 1,5 = 9)", ok(Math.abs(ev(`enemies[${e2}].burnDps`) - 9) < 1e-9));
  t.run(6.1); const e3 = t.mk(220, 470); ev(`domeHit(enemies[${e3}])`); console.log("dopo 6 s non brucia più:", !(ev(`enemies[${e3}].burnT`) > 0), ok(!(ev(`enemies[${e3}].burnT`) > 0)));
}
{
  const t = battle({ tree: { "ab:burn": 1, "ab:mines": 3 } }, { offense: "mines" }), ev = t.ev, w = t.g.win;
  w.__mines = []; ev("fireAbility(hasAb('mines'))");
  console.log("Minata al 3 senza Aeroblast: mine", w.__mines.length, "| da una Aeroblast base (senza potenziamenti):", w.__mines.every((s) => !Object.keys(s.up).length && !w.__ev("slots").includes(s)),
    ok(w.__mines.length === 6 && w.__mines.every((s) => !Object.keys(s.up).length)));
  ev("slots[0] = makeShooter(TURRETS.aero, SLOT_X[0], GROUND_Y - 14); slots[0].up.mineK = 1; slots[0].up.mineD = 1"); w.__mines = []; ev("fireAbility(hasAb('mines'))");
  console.log("con l’Aeroblast in campo: le mine sono sue (Mine d’urto e potenziate):", w.__mines.every((s) => s.up.mineD === 1 && s.up.mineK === 1), ok(w.__mines.length === 6 && w.__mines.every((s) => s.up.mineD === 1)));
  const one = battle({ tree: { "ab:burn": 1, "ab:mines": 1 } }, { offense: "mines" }); one.g.win.__mines = []; one.ev("fireAbility(hasAb('mines'))");
  console.log("al livello 1: mine", one.g.win.__mines.length, "(minimo 4)", ok(one.g.win.__mines.length === 4));
}
{
  const t = battle({ tree: { "ab:burn": 1, "ab:mines": 1, "ab:power": 1, "types:dmg:fire": 2, "types:all": 1 } }, { offense: "power" }), ev = t.ev;   // +15% per 6 s
  ev("slots[0] = makeShooter(TURRETS.sky, SLOT_X[0], GROUND_Y - 14)");
  const b0 = +ev("dmgM(slots[0])"), p0 = +ev("dmgM(player)"); ev("fireAbility(hasAb('power'))");
  const b1 = +ev("dmgM(slots[0])"), p1 = +ev("dmgM(player)");
  console.log("Potenziante al 1: Sky Guard", b0.toFixed(2), "→", b1.toFixed(2), "(1,15 + 0,15: si somma) | guardiano", p0.toFixed(2), "→", p1.toFixed(2),
    ok(Math.abs(b1 - 1.3) < 1e-9 && Math.abs(p1 - 1.15) < 1e-9));
  t.mk(180, 300); t.run(6.1); console.log("dopo 6 s:", (+ev("dmgM(player)")).toFixed(2), ok(+ev("dmgM(player)") === 1));
}

console.log("— Salvataggio e schermata —");
{
  const { ev, g } = fresh(45, { tree: { "ab:mines": 1 }, abilities: { resist: "impen", offense: "mines", control: "nope" } });
  console.log("dal salvataggio: equipaggiate", ev("JSON.stringify(equippedAbilities())"), "(Impenetrabile non sbloccata e valori sconosciuti scartati)",
    ok(ev("JSON.stringify(equippedAbilities())") === '{"offense":"mines"}'));
  console.log("esportate:", ev("JSON.stringify(makeSave().progress.abilities)"), ok(ev("JSON.stringify(makeSave().progress.abilities)") === '{"offense":"mines"}'));
  ev("openTree(); treeTab = 'barrier'; barrierTab = 'abilities'"); g.frame(); ev("barrierTab = 'nodes'"); g.frame();
  console.log("schermata Barriera (abilità e potenziamenti): errori JS", g.errors.length ? g.errors[0] : "nessuno", ok(!g.errors.length));
}
