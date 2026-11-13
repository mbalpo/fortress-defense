// Sigilli e albero dei potenziamenti, fase 1 (DESIGN.md § 16): premi a fine livello, acquisto dei nodi, carte sbloccate,
// torrette equipaggiate e scelte saltate, salvataggio versione 2 con migrazione dalla 1.
const { makeGame } = require("./bot.js");
const ok = (c) => c ? "✓" : "✗ ERRORE";
const patch = (h) => h.replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();");
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
    ["Standard 32, primo già al 100%", win("standard", 32, true), 1],
    ["Standard 32, rigiocato al 100%", win("standard", 32, true), 1],
    ["Epica 1, primo", win("epic", 1, false), 3],
    ["Epica 1, rigiocato al 100%", win("epic", 1, true), 3],
    ["Epica 1, ancora", win("epic", 1, true), 0],
  ];
  for (const [label, res, exp] of steps) { const r = JSON.parse(res); console.log(label.padEnd(38), "→ +" + r.got, "(" + r.why + ")", ok(r.got === exp)); }
  const p = stored();
  console.log("totale", p.seals, "Sigilli | premi:", p.claims.join(" "), ok(p.seals === 10 && p.claims.join() === "s31,s31p,s32,s32p,e1,e1p"));
}

console.log("— Albero: acquisto dei nodi e carte sbloccate —");
{
  const { ev, stored } = fresh(31, { seals: 4 });
  const offered = (id) => ev(`(() => { const s = makeShooter(TURRETS.sky, 100, 500); return eligible(s).some((u) => u.id === "${id}"); })()`);
  console.log("prima: Missili incendiari offerta:", offered("burn1"), ok(offered("burn1") === false));
  const st = (i) => ev(`nodeState(TREE.sky[${i}])`);
  console.log("nodi della Sky Guard:", ev("TREE.sky.map((n) => n.card || n.kind).join(' ')"), "| costi:", ev("TREE.sky.map((n) => n.cost).join(' ')"),
    ok(ev("TREE.sky.map((n) => n.card || n.kind).join(' ')") === "burn1 burn2 burn3 splitB again perm"));
  console.log("stato iniziale: lv1", st(0), "| lv2", st(1), "| finale", st(5), ok(st(0) === "ready" && st(1) === "req" && st(5) === "req"));
  ev("openTree(); treeSel = 'sky'; tapNode(TREE.sky[0])");
  console.log("primo tocco: in attesa, Sigilli", ev("progress.seals"), ok(ev("treeArm") === "sky:burn1" && ev("progress.seals") === 4));
  ev("tapNode(TREE.sky[0])");
  console.log("secondo tocco: comprato, Sigilli", ev("progress.seals"), "| ora offerta:", offered("burn1"), ok(ev("progress.seals") === 3 && offered("burn1") && stored().tree["sky:burn1"] === 1));
  ev("buyNode(TREE.sky[1])"); ev("buyNode(TREE.sky[2])");
  console.log("lv2 e lv3 (costo 1 + 2): Sigilli", ev("progress.seals"), "| lv3 senza Sigilli per il successivo:", st(3), ok(ev("progress.seals") === 0 && st(3) === "poor"));
  console.log("comprare un nodo senza Sigilli:", ev("buyNode(TREE.sky[3])"), ok(ev("buyNode(TREE.sky[3])") === false));
  const combo = (seals) => ev(`(() => { progress.seals = ${seals}; slots[0] = makeShooter(TURRETS.thunder, SLOT_X[0], GROUND_Y - 14); slots[0].up.fork1 = 1;
    player.level = 2; player.used = 0; return eligible(player).some((u) => u.id === "kThunder"); })()`);
  ev("startRun('standard')");
  const before = combo(1); ev("buyNode(TREE.thunder[0])"); const after = combo(0);
  console.log("combo Colpi ramificati: prima dello sblocco", before, "| dopo", after, ok(!before && after));
}

console.log("— Sblocco permanente e torrette equipaggiate —");
{
  const all = (id) => Object.fromEntries(["burn1", "burn2", "burn3", "splitB", "again", "perm"].map((k) => [id + ":" + k, 1]));
  const { ev } = fresh(35, { seals: 50 });
  ev("TREE.rail.slice(0, 5).forEach(buyNode)");
  console.log("Railgun, nodi comprati tranne il finale → finale:", ev("nodeState(TREE.rail[5])"), ok(ev("nodeState(TREE.rail[5])") === "ready"));
  ev("buyNode(TREE.rail[5])");
  console.log("finale comprato, Sigilli rimasti:", ev("progress.seals"), ok(ev("progress.seals") === 41));
  console.log("equipaggia senza sblocco (Laser):", ev("toggleEquip('laser')"), "| Railgun:", ev("toggleEquip('rail')"), ok(!ev("toggleEquip('laser')") && ev("progress.loadout.join()") === "rail"));
  const g2 = fresh(35, { seals: 0, tree: Object.assign(all("sky"), all("rail"), { "tesla:perm": 1, "beam:perm": 1, "hive:perm": 1 }), loadout: ["sky", "rail", "tesla", "beam", "hive", "nope"] });
  console.log("dal salvataggio: equipaggiate", g2.ev("progress.loadout.join()"), "(massimo 4, solo con lo sblocco)", ok(g2.ev("progress.loadout.join()") === "sky,rail,tesla,beam"));
  const g3 = fresh(35, { tree: Object.assign(all("sky"), all("rail")), loadout: ["sky", "rail"] }), e = g3.ev;
  e("startRun('standard')");
  console.log("partita: slot", e("slots.map((s) => s ? s.id : '-').join(' ')"), "| scelte da saltare", e("skipLeft"), ok(e("slots.map((s) => s ? s.id : '-').join(' ')") === "sky rail - -" && e("skipLeft") === 2));
  const seq = [];
  for (let i = 0; i < 3; i++) { e("queue = []; enemies.length = 0; endWave()"); seq.push(e("state + ' ' + wave")); }
  console.log("fine delle ondate 1, 2, 3:", seq.join(" · "), ok(seq.join() === "play 2,play 3,upgrade 3"));
  let offeredOwned = false;
  for (let i = 0; i < 300; i++) if (e("rollOptions().some((o) => o.kind === 'new' && (o.id === 'sky' || o.id === 'rail'))")) offeredOwned = true;
  console.log("le torrette equipaggiate escono come carta:", offeredOwned, ok(!offeredOwned));
  // budget: 19 scelte in tutto = 2 torrette equipaggiate + 17 carte
  const g4 = fresh(35, { tree: Object.assign(all("sky"), all("rail")), loadout: ["sky", "rail"] }), f = g4.ev;
  f("startRun('standard')"); let cards = 0;
  for (let w = 1; w < 20; w++) { f("queue = []; enemies.length = 0; endWave()"); if (f("state") === "upgrade") { cards++; f("pick(0)"); } }
  console.log("carte scelte in una partita:", cards, "+ 2 equipaggiate = " + (cards + 2), ok(cards === 17));
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
  const { ev } = fresh(40, { seals: 5, claims: ["s31", "s31p", "bad", 3], tree: { "sky:burn1": 1, "xyz:abc": 1 }, loadout: [] });
  console.log("caricato: Sigilli", ev("progress.seals"), "| premi", ev("progress.claims.join()"), "| nodi", ev("Object.keys(progress.tree).join()"),
    ok(ev("progress.seals") === 5 && ev("progress.claims.join()") === "s31,s31p" && ev("Object.keys(progress.tree).join()") === "sky:burn1"));
  const save = JSON.parse(ev("JSON.stringify(makeSave())"));
  console.log("esportato: versione", save.version, "| Sigilli", save.progress.seals, ok(save.version === 2 && save.progress.seals === 5 && save.progress.tree["sky:burn1"] === 1));
  const v1 = JSON.stringify({ game: "fortress-defense", version: 1, progress: { cleared: 12, seen: [] }, settings: {} });
  const d1 = JSON.parse(ev(`JSON.stringify(parseSave(${JSON.stringify(v1)}))`));
  console.log("versione 1 importata: livelli", d1.cleared, "| Sigilli", d1.seals, "| nodi", Object.keys(d1.tree).length, ok(d1.cleared === 12 && d1.seals === 0 && !Object.keys(d1.tree).length));
  const code = ev("makeCode()"); ev("progress.seals = 0; progress.tree = {}"); ev(`applySave(parseSave(${JSON.stringify(code)}))`);
  console.log("codice FD1 andata e ritorno: Sigilli", ev("progress.seals"), "| nodi", ev("Object.keys(progress.tree).join()"), ok(ev("progress.seals") === 5 && ev("progress.tree['sky:burn1']") === 1));
  const old = fresh(20, {}); console.log("vecchio formato in memoria (senza Sigilli): Sigilli", old.ev("progress.seals"), "| errori:", old.g.errors.length, ok(old.ev("progress.seals") === 0 && !old.g.errors.length));
}
