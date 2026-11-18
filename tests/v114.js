// 1.14.0 (DESIGN.md § 2, § 10, § 15, § 16): partita in sospeso e Continua, scheda Abilità bloccata fino al 40, maggiori della barriera,
// azzeramento per sezione, blocco per esemplare, sostituzione dei Moduli, Equipaggia/Installa a due tocchi, sfere del Thunderbolt ferme durante il fulmine.
const { makeGame } = require("./bot.js");
const ok = (c) => c ? "✓" : "✗ ERRORE";
const patch = (h) => h.replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();");
const RUN = "fortress-run-v1", PROG = "fortress-progress-v1";
const fresh = (cleared, extra, more) => {
  const storage = Object.assign({ [PROG]: JSON.stringify(Object.assign({ cleared, seen: [] }, extra || {})) }, more || {});
  const g = makeGame({ patch, cleared, storage }); g.frame();
  return { g, ev: g.win.__ev, J: (c) => JSON.parse(g.win.__ev("JSON.stringify(" + c + ")")), stored: () => JSON.parse(g.win.localStorage.getItem(PROG)), run: () => JSON.parse(g.win.localStorage.getItem(RUN)) };
};
const screen = (g) => { g.texts.length = 0; g.frame(); return g.texts.join("|"); };

console.log("— Scheda Abilità bloccata fino al 40 —");
{
  const { g, ev } = fresh(35, { seals: 10 });
  ev("openTree(); treeTab = 'barrier'; barrierTab = 'abilities'"); const T = screen(g);
  console.log("livello 35: overlay", /Abilità bloccate/.test(T), "| livelli completati", /Livelli completati: 35\/40/.test(T), ok(/Abilità bloccate/.test(T) && /Livelli completati: 35\/40/.test(T)));
  ev("tapNode(TREE_NODE['ab:regen']); tapNode(TREE_NODE['ab:regen'])");
  console.log("due tocchi su Rigenerazione: comprata", ev("treeLv('ab:regen')"), "| Sigilli", ev("progress.seals"), "| equipaggiare:", ev("equipAbility('regen')"),
    ok(ev("treeLv('ab:regen')") === 0 && ev("progress.seals") === 10 && ev("equipAbility('regen')") === false));
  const before = ev("buttons.length"); g.click(200, 300); g.frame();
  console.log("tocco sull’overlay: nessun nodo in attesa", ev("treeArm"), ok(ev("treeArm") === null && ev("treeLv('ab:regen')") === 0 && before > 0));
  const o = fresh(40, { seals: 10, majors: 0 }); o.ev("openTree(); treeTab = 'barrier'; barrierTab = 'abilities'"); const T2 = screen(o.g);
  o.ev("tapNode(TREE_NODE['ab:regen']); tapNode(TREE_NODE['ab:regen'])");
  console.log("livello 40: overlay", /Abilità bloccate/.test(T2), "| Rigenerazione comprata", o.ev("treeLv('ab:regen')"), ok(!/Abilità bloccate/.test(T2) && o.ev("treeLv('ab:regen')") === 1));
}

console.log("— Maggiori della barriera —");
{
  const { ev } = fresh(40, { seals: 50, majors: 0 });
  const tot = ev("Object.values(TREE_NODE).reduce((a, n) => a + (n.mcosts || []).reduce((x, y) => x + y, 0), 0)");
  const bar = ev("TREE.barrier.reduce((a, n) => a + n.mcosts.reduce((x, y) => x + y, 0), 0)");
  console.log("maggiori: barriera", bar, "| albero intero", tot, ok(bar === 8 && tot === 145));
  for (let i = 0; i < 5; i++) ev("buyNode(TREE_NODE['barrier:hp'])");
  console.log("Vita % al 5 senza maggiori:", ev("treeLv('barrier:hp')"), "| al 6:", ev("nodeState(TREE_NODE['barrier:hp'])"), "| Riduzione danno:", ev("nodeState(TREE_NODE['barrier:red'])"),
    ok(ev("treeLv('barrier:hp')") === 5 && ev("nodeState(TREE_NODE['barrier:hp'])") === "poor" && ev("nodeState(TREE_NODE['barrier:red'])") === "poor"));
}

console.log("— Azzeramento per sezione —");
{
  const { g, ev, J, stored } = fresh(50, { seals: 200, majors: 40, claims: ["s31", "s31p"] });
  const buy = (ids) => ids.forEach((id) => { for (let k = 0; k < 3; k++) ev(`buyNode(TREE_NODE['${id}'])`); });
  const S0 = J("[progress.seals, progress.majors]");
  buy(["player:boom1", "player:std:dmg", "player:fan"]);
  const S1 = J("[progress.seals, progress.majors]");
  buy(["sky:burn1", "sky:burn2", "sky:burn3", "sky:splitB", "sky:fire", "sky:again", "sky:perm", "sky:std:dmg", "types:all", "types:dmg:fire"]); ev("toggleEquip('sky')");
  const S2 = J("[progress.seals, progress.majors]");
  buy(["barrier:hp", "barrier:red", "ab:regen", "ab:backup"]); ev("equipAbility('backup')");
  const S3 = J("[progress.seals, progress.majors]");
  const rf = J("sectionRefund('turrets')");
  console.log("rimborso Torrette:", JSON.stringify(rf), "| speso", S1[0] - S2[0], "◆", S1[1] - S2[1], "✦", ok(rf.seals === S1[0] - S2[0] && rf.majors === S1[1] - S2[1]));
  ev("openTree(); treeTab = 'turrets'"); ev("tapReset()"); const armed = ev("treeArm"); const T = screen(g);
  console.log("primo tocco su “Azzera”: in attesa", armed, "| rimborso mostrato", /Rimborso: \d+ ◆ e \d+ ✦/.test(T), "| nodi ancora comprati", ev("treeLv('sky:burn1')"),
    ok(armed === "reset" && /Rimborso: \d+ ◆ e \d+ ✦/.test(T) && ev("treeLv('sky:burn1')") === 1));
  ev("tapReset()");
  console.log("secondo tocco: Torrette azzerate, saldo", JSON.stringify(J("[progress.seals, progress.majors]")), "atteso", JSON.stringify([S3[0] + rf.seals, S3[1] + rf.majors]),
    "| equipaggiate", JSON.stringify(stored().loadout), "| guardiano intatto", ev("treeLv('player:boom1')"),
    ok(ev("progress.seals") === S3[0] + rf.seals && ev("progress.majors") === S3[1] + rf.majors && stored().loadout.length === 0 && ev("treeLv('sky:perm')") === 0
      && ev("treeLv('types:all')") === 0 && ev("treeLv('player:boom1')") === 1 && ev("treeLv('barrier:hp')") === 3));
  ev("resetSection('barrier'); resetSection('player')");
  console.log("azzerate anche Barriera e Guardiano: saldo", JSON.stringify(J("[progress.seals, progress.majors]")), "= iniziale", JSON.stringify(S0), "| abilità equipaggiate", JSON.stringify(stored().abilities),
    "| nodi", Object.keys(stored().tree).length, "| premi", stored().claims.join(" "),
    ok(ev("progress.seals") === S0[0] && ev("progress.majors") === S0[1] && JSON.stringify(stored().abilities) === "{}" && Object.keys(stored().tree).length === 0 && stored().claims.join() === "s31,s31p"));
  ev("treeTab = 'player'"); ev("tapReset()");
  console.log("sezione vuota: “Azzera” non si arma", ev("treeArm"), "| pulsante", /Azzera/.test(screen(g)), ok(ev("treeArm") === null && !/Azzera/.test(screen(g))));
}

console.log("— Blocco per esemplare —");
{
  const { g, ev, J, stored } = fresh(40, { gear: { pcs: { "guanti:1": 5, "arma:0": 1 }, mods: { "arma:0:1": 3, "arma:2:1": 1, "arma:1:2": 2 }, eq: {} } });
  ev("gearPick('guanti'); toggleLock('pcs', 'guanti:1', false)");
  const rows = () => J("[freeN(progress.gear, 'pcs', 'guanti:1'), lockN(progress.gear, 'guanti:1')]").join(" + ");
  console.log("5 guanti rari, lucchetto → righe", rows(), ok(rows() === "4 + 1"));
  ev("toggleLock('pcs', 'guanti:1', false)"); console.log("lucchetto della riga da 4 →", rows(), ok(rows() === "3 + 2"));
  ev("toggleLock('pcs', 'guanti:1', true)"); console.log("lucchetto della riga bloccata →", rows(), ok(rows() === "4 + 1"));
  ev("openGear(); gearPick('guanti')"); const T = screen(g);
  console.log("schermata: due righe dei rari (×4 e ×1)", /×4/.test(T) && /×1/.test(T), ok(/×4/.test(T) && /×1/.test(T) && !g.errors.length));
  ev("for (let i = 0; i < 4; i++) toggleLock('pcs', 'guanti:1', false)");
  console.log("tutti bloccati: scarto", ev("discard('pcs', 'guanti:1')"), "| fusione", ev("fusePieces('guanti', 1)"), "| ancora 5", ev("progress.gear.pcs['guanti:1']"),
    ok(ev("discard('pcs', 'guanti:1')") === false && ev("fusePieces('guanti', 1)") === false && ev("progress.gear.pcs['guanti:1']") === 5));
  ev("gearSetMode('drop'); tapPiece(1, true)");
  console.log("scarta sulla riga bloccata: messaggio", ev("gearMsg"), ok(/Bloccato/.test(ev("gearMsg")) && ev("gearArm") === null));
  ev("gearSetMode('use'); tapPiece(1, true); tapPiece(1, true)");
  console.log("equipaggia dalla riga bloccata: pezzo bloccato", ev("progress.gear.eq.guanti.lk"), "| bloccati in inventario", ev("lockN(progress.gear, 'guanti:1')"),
    ok(ev("progress.gear.eq.guanti.lk") === 1 && ev("lockN(progress.gear, 'guanti:1')") === 4 && ev("progress.gear.pcs['guanti:1']") === 4));
  ev("unequipPiece('guanti')"); console.log("“Togli”: il blocco segue l’esemplare →", ev("lockN(progress.gear, 'guanti:1')"), "bloccati su", ev("progress.gear.pcs['guanti:1']"),
    ok(ev("lockN(progress.gear, 'guanti:1')") === 5 && ev("progress.gear.pcs['guanti:1']") === 5));
  // Moduli: blocco di un installato, fusione solo con i non bloccati
  ev("equipPiece('arma', 0); toggleLock('mods', 'arma:0:1', false); installMod('arma', 0, 1, true)");
  console.log("Modulo installato dalla riga bloccata:", JSON.stringify(J("progress.gear.eq.arma.m")), ok(JSON.stringify(J("progress.gear.eq.arma.m")) === "[[1,0,1]]" && ev("lockN(progress.gear, 'arma:0:1')") === 0));
  ev("toggleLock('mods', 'arma:0:1', false)");
  console.log("fusione con 2 Moduli comuni liberi + 1 bloccato (5 chiesti):", ev("fuseMods('arma', 0, { 1: 2, 2: 3 })"), ok(ev("fuseMods('arma', 0, { 1: 2, 2: 3 })") === null));
  ev("removeMod('arma', 0)"); console.log("Modulo bloccato tolto: torna bloccato", ev("lockN(progress.gear, 'arma:0:1')"), ok(ev("lockN(progress.gear, 'arma:0:1')") === 2));
  ev("lockSlot('arma', 0)"); const s = stored().gear;
  console.log("salvato: lock", JSON.stringify(s.lock), ok(s.lock["arma:0:1"] === 2 && !s.lock["guanti:1"] === false));
}

console.log("— Sostituzione dei Moduli e doppioni —");
{
  const { g, ev, J } = fresh(40, { gear: { pcs: {}, mods: { "arma:3:1": 1, "arma:0:1": 1, "arma:2:2": 1, "arma:2:7": 1 }, eq: { arma: { r: 1, m: [[1, 2, 1], [2, 2]] } } } });
  console.log("slot pieni (2/2): stesso effetto, rarità maggiore →", ev("installCheck('arma', 1, 3)"), "| minore →", ev("installCheck('arma', 1, 0)"), "| uguale →", ev("installCheck('arma', 2, 2)"),
    "| altro effetto →", ev("installCheck('arma', 7, 2)"),
    ok(ev("installCheck('arma', 1, 3)") === "replace" && ev("installCheck('arma', 1, 0)") === "dup" && ev("installCheck('arma', 2, 2)") === "dup" && ev("installCheck('arma', 7, 2)") === "full"));
  ev("openGear(); gearPick('arma'); gearSetTab('mods'); gearSetMode('use'); gearRar = 3; tapMod(1)"); const T = screen(g);
  console.log("primo tocco sul leggendario: spiega la sostituzione", /Tocca di nuovo: sostituisce l’epico/.test(T), ok(/Tocca di nuovo: sostituisce l’epico/.test(T)));
  ev("tapMod(1)");
  console.log("secondo tocco: installati", JSON.stringify(J("progress.gear.eq.arma.m")), "| il vecchio torna in inventario (bloccato)", ev("progress.gear.mods['arma:2:1']"), ev("lockN(progress.gear, 'arma:2:1')"),
    ok(JSON.stringify(J("progress.gear.eq.arma.m")) === "[[1,3],[2,2]]" && ev("gearMsg") === "Il Modulo epico torna in inventario" && ev("progress.gear.mods['arma:2:1']") === 1 && ev("lockN(progress.gear, 'arma:2:1')") === 1 && !ev("progress.gear.mods['arma:3:1']")));
  ev("gearRar = 0; tapMod(1)");
  console.log("Modulo comune con lo stesso effetto: rifiutato,", ev("gearMsg"), ok(ev("gearMsg") === "Effetto già installato a rarità uguale o maggiore" && JSON.stringify(J("progress.gear.eq.arma.m")) === "[[1,3],[2,2]]"));
  const c = fresh(40, { gear: { pcs: {}, mods: {}, eq: { arma: { r: 2, m: [[1, 0], [1, 3], [2, 1]] } } } });
  console.log("dal salvataggio due Moduli con lo stesso effetto (rarità diverse): resta il primo", JSON.stringify(c.J("progress.gear.eq.arma.m")), ok(JSON.stringify(c.J("progress.gear.eq.arma.m")) === "[[1,0],[2,1]]"));
}

console.log("— Salvataggio versione 5 —");
{
  const { ev, J } = fresh(40, { gear: { pcs: { "arma:0": 2 }, mods: { "arma:0:1": 1 }, eq: { guanti: { r: 0, m: [[1, 0, 1]], lk: 1 } }, lock: { "arma:0": 5, "arma:0:1": 1, "testa:0": 2 } } });
  console.log("bloccati oltre i posseduti e righe inesistenti: lock", JSON.stringify(J("progress.gear.lock")), "| equipaggiato", JSON.stringify(J("progress.gear.eq.guanti")),
    ok(JSON.stringify(J("progress.gear.lock")) === '{"arma:0":2,"arma:0:1":1}' && JSON.stringify(J("progress.gear.eq.guanti")) === '{"r":0,"m":[[1,0,1]],"lk":1}'));
  const code = ev("makeCode()"), v = J(`makeSave().version`), back = J(`parseSave(${JSON.stringify(code)}).gear`);
  console.log("versione", v, "| codice andata e ritorno: lock", JSON.stringify(back.lock), ok(v >= 5 && JSON.stringify(back.lock) === '{"arma:0":2,"arma:0:1":1}' && back.eq.guanti.lk === 1));
  const old = J(`parseSave(JSON.stringify({ game: "fortress-defense", version: 4, progress: { cleared: 40, gear: { pcs: { "arma:0": 2 }, mods: {}, eq: {} } } })).gear`);
  console.log("versione 4 importata: nessun blocco", JSON.stringify(old.lock), ok(JSON.stringify(old.lock) === "{}" && old.pcs["arma:0"] === 2));
}

console.log("— Thunderbolt: sfera ferma durante il fulmine —");
{
  const { ev } = fresh(40);
  ev("startRun('standard'); slots[0] = newTurret('thunder', 0); enemies = []; spawn({ enemy: 'brute', x: 180 }); enemies[0].y = 200; enemies[0].hp = enemies[0].maxHp = 1e9");
  ev("thunderTick(slots[0], 0.1)"); const th0 = ev("slots[0].st.sph[0].th");
  ev("thunderFire(slots[0])"); const hold = ev("slots[0].st.sph[0].hold");
  ev("thunderTick(slots[0], 0.1)"); const th1 = ev("slots[0].st.sph[0].th");
  ev("thunderTick(slots[0], 0.1)"); const th2 = ev("slots[0].st.sph[0].th");
  ev("thunderTick(slots[0], 0.1)"); const th3 = ev("slots[0].st.sph[0].th");
  console.log("fermo", hold, "s | ferma dopo 0,1 s", th1 === th0, "| a 0,2 s", th2 === th0, "| riparte", th3 !== th2, ok(hold === 0.18 && th1 === th0 && th2 === th0 && th3 !== th2));
  ev("slots[0].up.twice = 1; Math.random = () => 0.1; thunderFire(slots[0])");
  console.log("Doppio fulmine: fermo", ev("slots[0].st.sph[0].hold"), "s", ok(ev("slots[0].st.sph[0].hold") === 0.38));
}

console.log("— Partita in sospeso e Continua —");
{
  const { g, ev, J, run } = fresh(40, { seals: 20, majors: 2, gear: { pcs: { "arma:1": 1 }, mods: {}, eq: {} } });
  ev("selLevel = 34; startRun('standard')");
  const r1 = run();
  console.log("inizio del livello: salvata", !!r1, "| livello", r1.lv, "ondata", r1.wave, "| versione", r1.app, ok(r1 && r1.lv === 34 && r1.wave === 1 && r1.app === ev("APP_VERSION")));
  for (let w = 0; w < 4; w++) { ev("endWave()"); if (ev("state") === "upgrade") ev("pick(0)"); }
  ev("domeHp = 61; player.st.charge = 0.4; healLeft = 2; refreshLeft = 1; miniMajor = true; startWave(wave)");   // stato a inizio ondata
  const W0 = ev("wave"), cards = J("runCards"), ents = J("[player, ...slots].filter(Boolean).map((s) => s.id + ':' + s.level + ':' + JSON.stringify(s.up)).join(' ')");
  const r2 = run();
  console.log("ondata", W0, "salvata:", r2.wave, "| carte", r2.cards.length, "| cupola", r2.dome, ok(r2.wave === W0 && r2.cards.length === cards.length && r2.cards.length >= 4 && r2.dome === 61));
  // l’app viene scartata: si riapre con lo stesso localStorage
  const store = { [PROG]: g.win.localStorage.getItem(PROG), [RUN]: g.win.localStorage.getItem(RUN) };
  const b = makeGame({ patch, cleared: 40, storage: store }); b.frame(); const ev2 = b.win.__ev;
  const M = screen(b);
  console.log("menu: Continua", /Continua/.test(M), "| dettaglio", /Livello 34 · Standard · ondata \d+\/20/.test(M), ok(/Continua/.test(M) && /Livello 34 · Standard · ondata 5\/20/.test(M)));
  // albero ed equipaggiamento in sola lettura
  ev2("openTree(); treeSel = 'sky'; tapNode(TREE.sky[0]); tapNode(TREE.sky[0])"); const TT = screen(b);
  console.log("albero: nodo comprato", ev2("treeLv('sky:burn1')"), "| messaggio", /Partita in sospeso: continua o abbandona per modificare/.test(TT), "| “Azzera”", /Azzera/.test(TT),
    ok(ev2("treeLv('sky:burn1')") === 0 && /Partita in sospeso: continua o abbandona per modificare/.test(TT) && !/Azzera/.test(TT)));
  ev2("closeTree(); openGear(); gearPick('arma'); tapPiece(1); tapPiece(1)"); const GT = screen(b);
  ev2("toggleLock('pcs', 'arma:1', false)");
  console.log("equipaggiamento: equipaggiato", ev2("!!progress.gear.eq.arma"), "| messaggio", /Partita in sospeso/.test(GT), "| lucchetto usabile", ev2("lockN(progress.gear, 'arma:1')"),
    ok(!ev2("progress.gear.eq.arma") && /Partita in sospeso/.test(GT) && ev2("lockN(progress.gear, 'arma:1')") === 1));
  ev2("closeGear()"); b.frame();
  b.click(180, 220); b.frame();
  const ents2 = ev2("[player, ...slots].filter(Boolean).map((s) => s.id + ':' + s.level + ':' + JSON.stringify(s.up)).join(' ')");
  console.log("tocco su Continua → stato", ev2("state"), "| livello", ev2("campLevel"), "ondata", ev2("wave"), "| cupola", ev2("domeHp"), "| frenesia", ev2("player.st.charge"),
    ok(ev2("state") === "pause" && ev2("campLevel") === 34 && ev2("wave") === W0 && ev2("domeHp") === 61 && ev2("player.st.charge") === 0.4));
  console.log("carte rigiocate: uguali", ents2 === ents, "|", ents2, ok(ents2 === ents && ev2("healLeft") === 2 && ev2("refreshLeft") === 1 && ev2("miniMajor") === true));
  ev2("resumeGame()"); ev2("pauseGame(); toMenu()");
  console.log("“Abbandona” → partita cancellata", b.win.localStorage.getItem(RUN) === null, "| Continua nel menu", /Continua/.test(screen(b)), ok(b.win.localStorage.getItem(RUN) === null && !/Continua/.test(screen(b))));
  // Sigillo maggiore del boss finale preso a metà ondata: rigiocando l’ondata non si riprende
  const e = fresh(50, { clearedEpic: 45 }, {}); e.ev("selEpic = 40; startRun('epic'); wave = 20; startWave(20); majorDrop({ final: true, x: 100, y: 100 })");
  const maj1 = e.ev("progress.majors"), st = { [PROG]: e.g.win.localStorage.getItem(PROG), [RUN]: e.g.win.localStorage.getItem(RUN) };
  const e2 = makeGame({ patch, cleared: 50, storage: st }); e2.frame(); e2.win.__ev("continueRun(); majorDrop({ final: true, x: 100, y: 100 })");
  console.log("boss finale: maggiori", maj1, "→ dopo Continua e un’altra vittoria sul boss", e2.win.__ev("progress.majors"), ok(maj1 === 1 && e2.win.__ev("progress.majors") === 1));
}

console.log("— Quando la partita in sospeso si cancella —");
{
  const sto = (f) => { const x = fresh(40); x.ev("selLevel = 34; startRun('standard')"); f(x); return x.g.win.localStorage.getItem(RUN) === null; };
  const won = sto((x) => x.ev("winLevel()")), lost = sto((x) => x.ev("domeHp = 0; AB.list = []; update(0.016)")), quit = sto((x) => x.ev("pauseGame(); toMenu()"));
  const imp = sto((x) => x.ev(`toMenu = () => {}; state = 'menu'; applySave(parseSave(makeCode()))`));
  console.log("vittoria", won, "| sconfitta", lost, "| Abbandona", quit, "| salvataggio importato", imp, ok(won && lost && quit && imp));
  const x = fresh(40); x.ev("selLevel = 34; startRun('standard')");
  const raw = JSON.parse(x.g.win.localStorage.getItem(RUN)); raw.app = "1.0.0";
  const v = makeGame({ patch, cleared: 40, storage: { [PROG]: x.g.win.localStorage.getItem(PROG), [RUN]: JSON.stringify(raw) } }); v.frame();
  console.log("APP_VERSION diverso: scartata", v.win.localStorage.getItem(RUN) === null, "| Continua", /Continua/.test(screen(v)), ok(v.win.localStorage.getItem(RUN) === null && !/Continua/.test(screen(v))));
  // avvio di un’altra partita: due tocchi “sostituirla?”
  const y = fresh(40); y.ev("selLevel = 34; startRun('standard'); state = 'menu'"); y.ev("selLevel = 12");
  y.g.click(180, 276); y.g.frame(); const A = screen(y.g);
  console.log("primo tocco su Standard: chiede", /Sostituire la partita in sospeso\?/.test(A), "| ancora livello 34 salvato", JSON.parse(y.g.win.localStorage.getItem(RUN)).lv,
    ok(/Sostituire la partita in sospeso\?/.test(A) && JSON.parse(y.g.win.localStorage.getItem(RUN)).lv === 34 && y.ev("state") === "menu"));
  y.g.click(180, 276); y.g.frame();
  console.log("secondo tocco: nuova partita al livello", y.ev("campLevel"), "| salvata", JSON.parse(y.g.win.localStorage.getItem(RUN)).lv, ok(y.ev("state") === "play" && y.ev("campLevel") === 12 && JSON.parse(y.g.win.localStorage.getItem(RUN)).lv === 12));
  const z = fresh(40); z.ev("selLevel = 34; startRun('standard'); state = 'menu'"); z.g.click(180, 276); z.g.click(10, 600); z.g.frame();
  console.log("tocco altrove: annullato", z.ev("runArm"), ok(z.ev("runArm") === null && !/Sostituire/.test(screen(z.g))));
  console.log("errori JS:", [x, y, z].some((o) => o.g.errors.length) ? [x, y, z].map((o) => o.g.errors[0]).join(" ") : "nessuno");
}
