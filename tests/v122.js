// 1.22.0 (DESIGN.md § 16): Carta iniziale (guardiano e ogni torretta: 3 maggiori, dopo tutti gli altri nodi, una carta standard o chain lv1 dall’inizio della partita,
// anche per le torrette che arrivano dopo come carta; occupa un posto del livello 1) e Carta extra della barriera (5 livelli: 3 maggiori, poi 1 maggiore + 1 Sigillo;
// dopo tutti gli altri potenziamenti della barriera; L scelte in più per livello in L ondate diverse tra la 1 e la 19; in tutte le modalità).
const { makeGame } = require("./bot.js");
const ok = (c) => c ? "✓" : "✗ ERRORE";
const patch = (h) => h.replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();");
const J = (ev, c) => JSON.parse(ev("JSON.stringify(" + c + ")"));
// tutti i nodi di guardiano, Sky Guard, Laser e barriera al livello 1 (tranne i due nuovi), con Sigilli e maggiori da spendere
const ALL = (ids) => `(() => { const t = {}; for (const w of ${JSON.stringify(ids)}) for (const n of TREE[w]) if (n.kind !== "start" && n.id !== "barrier:extra") t[n.id] = 1; return t; })()`;
function game(extra) {
  const g0 = makeGame({ patch, storage: { "fortress-progress-v1": JSON.stringify({ cleared: 200, clearedEpic: 200, seen: [] }) } }); g0.frame();
  const tree = J(g0.win.__ev, ALL(["player", "sky", "laser", "barrier"]));
  const prog = Object.assign({ cleared: 200, clearedEpic: 200, seen: [], seals: 50, majors: 30, tree }, extra || {});
  const g = makeGame({ patch, storage: { "fortress-progress-v1": JSON.stringify(prog) } }); g.frame();
  return { g, ev: g.win.__ev };
}

console.log("— Carta iniziale: nodi, costi, requisiti —");
{
  const { ev } = game();
  const nodes = J(ev, `["player", ...TURRET_ORDER].map((w) => { const n = TREE_NODE[w + ":start"]; return n && [w, n.costs[0], n.mcosts[0], n.max, n.req.length === TREE[w].length - 2 && !n.req.includes(w + ":final"), w === "player" || n.req.includes(w + ":perm")]; })`);
  const good = nodes.every((x) => x && x[1] === 0 && x[2] === 3 && x[3] === 1 && x[4] && x[5]);
  console.log("nodo in guardiano e 11 torrette:", nodes.filter(Boolean).length, "· 3 maggiori, nessun Sigillo, un livello, dopo tutti gli altri nodi tranne la Specializzazione del 200 (torrette: anche lo Sblocco permanente)", ok(nodes.length === 12 && good));
  const st = J(ev, `(() => { const a = nodeState(TREE_NODE["sky:start"]); delete progress.tree["sky:perm"]; const b = nodeState(TREE_NODE["sky:start"]); progress.tree["sky:perm"] = 1;
    delete progress.tree["player:std:dmg"]; const c = nodeState(TREE_NODE["player:start"]); progress.tree["player:std:dmg"] = 1; const d = nodeState(TREE_NODE["beam:start"]); return { a, b, c, d }; })()`);
  console.log("Sky Guard con tutto:", st.a, "· senza Sblocco permanente:", st.b, "· guardiano senza Danno maggiorato:", st.c, "· Beam senza nodi:", st.d, ok(st.a === "ready" && st.b === "req" && st.c === "req" && st.d === "req"));
  const buy = J(ev, `(() => { const m = progress.majors, s = progress.seals; state = "tree"; tapNode(TREE_NODE["sky:start"]); tapNode(TREE_NODE["sky:start"]); return { dm: m - progress.majors, ds: s - progress.seals, pick: treePick, lv: treeLv("sky:start") }; })()`);
  console.log("acquisto con due tocchi: −" + buy.dm + " maggiori, −" + buy.ds + " Sigilli, si apre la scelta della carta:", buy.pick, ok(buy.dm === 3 && buy.ds === 0 && buy.pick === "sky" && buy.lv === 1));
  const opts = J(ev, `startOptions("sky").map((u) => u.cat + (u.lv || "") + ":" + u.id)`);
  const fine = opts.every((o) => /^std:|^chain1:/.test(o)), hasBurn = opts.some((o) => o.endsWith(":burn1"));
  const locked = J(ev, `(() => { delete progress.tree["sky:burn1"]; const r = startOptions("sky").some((u) => u.id === "burn1"); progress.tree["sky:burn1"] = 1; return r; })()`);
  console.log("carte proposte per la Sky Guard:", opts.join(" "), "· solo standard e chain lv1:", fine, "· Missili incendiari bloccati senza il nodo:", !locked, ok(fine && hasBurn && !locked && opts.length >= 4));
}

console.log("— Carta iniziale in partita —");
{
  const { g, ev } = game({ loadout: ["sky"] });
  ev(`for (const w of ["player", "sky", "laser"]) { progress.tree[w + ":start"] = 1; } progress.startCards = { player: "dmg", sky: "burn1", laser: startOptions("laser")[0].id }; saveProgress();`);
  ev(`setSel("standard", 61); startRun("standard");`);
  const r = J(ev, `({ p: player.up, pu: player.used, s: slots[0].up, su: slots[0].used, picks: runPicks, cards: runCards.length })`);
  console.log("guardiano:", JSON.stringify(r.p), "(posti usati", r.pu + ") · Sky Guard equipaggiata:", JSON.stringify(r.s), "(posti", r.su + ") · scelte", r.picks, "· carte della partita", r.cards,
    ok(r.p.dmg === 1 && r.pu === 1 && r.s.burn1 === 1 && r.su === 1 && r.picks === 0 && r.cards === 0));
  const late = J(ev, `(() => { applyOption({ kind: "new", id: "laser" }); const s = slots.find((x) => x && x.id === "laser"); return { up: s.up, used: s.used, want: progress.startCards.laser }; })()`);
  console.log("Laser arrivato dopo come carta: riceve la sua carta iniziale", JSON.stringify(late.up), ok(late.up[late.want] === 1 && late.used === 1));
  const none = J(ev, `(() => { applyOption({ kind: "new", id: "beam" }); return slots.find((x) => x && x.id === "beam").up; })()`);
  console.log("Beam senza nodo: nessuna carta", JSON.stringify(none), ok(Object.keys(none).length === 0));
  const elig = J(ev, `eligible(player).filter((u) => u.id === "dmg").length`);
  console.log("Danno maggiorato ancora sceglibile (1 pila su 3):", elig === 1, ok(elig === 1));
  // Continua: la carta iniziale non si applica due volte
  ev("startWave(3)"); const run = ev("localStorage.getItem(RUN_KEY)");
  const b = makeGame({ patch, storage: { "fortress-progress-v1": ev("localStorage.getItem('fortress-progress-v1')"), "fortress-run-v1": run } }); b.frame();
  b.win.__ev("continueRun()");
  const rr = J(b.win.__ev, `({ p: player.up.dmg, s: slots.find((x) => x.id === "sky").up.burn1, l: slots.find((x) => x.id === "laser").up, wave })`);
  console.log("Continua: guardiano Danno ×" + rr.p + ", Sky Guard Missili incendiari ×" + rr.s + ", ondata", rr.wave, ok(rr.p === 1 && rr.s === 1 && rr.wave === 3));
  const ro = J(b.win.__ev, `(() => { const a = setStartCard("player", "rate"); return { a, c: progress.startCards.player }; })()`);
  console.log("con una partita in sospeso la carta non si cambia:", !ro.a, ok(!ro.a && ro.c === "dmg"));
  // cambio, deselezione, carta non valida
  const ch = J(ev, `(() => { clearRun(); const a = setStartCard("player", "dmg"); const c1 = progress.startCards.player || null; const b = setStartCard("player", "dmg"); const c2 = progress.startCards.player; const z = setStartCard("player", "frenzy2"); return { a, c1, b, c2, z }; })()`);
  console.log("di nuovo sulla carta scelta: nessuna carta", ch.c1 === null, "· di nuovo: Danno", ch.c2, "· carta lv2 rifiutata", !ch.z, ok(ch.c1 === null && ch.c2 === "dmg" && !ch.z));
  const rs = J(ev, `(() => { const m = progress.majors; resetSection("player"); return { dm: progress.majors - m, c: progress.startCards.player || null }; })()`);
  console.log("“Azzera” del guardiano: rimborso dei maggiori (", rs.dm, ") e carta tolta", ok(rs.dm >= 3 + 1 && rs.c === null));
}

console.log("— Salvataggio versione 9 —");
{
  const { ev } = game();
  ev(`progress.tree["sky:start"] = 1; progress.startCards = { sky: "burn1" }; saveProgress();`);
  const save = J(ev, "makeSave()");
  const back = J(ev, `parseSave(${JSON.stringify(JSON.stringify(save))}).startCards`);
  const bad = J(ev, `parseSave(${JSON.stringify(JSON.stringify(Object.assign({}, save, { progress: Object.assign({}, save.progress, { startCards: { sky: "burn2", laser: "dmg", nope: "x", player: "dmg" } }) })))}).startCards`);
  const v8 = J(ev, `parseSave(${JSON.stringify(JSON.stringify(Object.assign({}, save, { version: 8, progress: Object.assign({}, save.progress, { startCards: undefined }) })))}).startCards`);
  console.log("esportato: versione", save.version, JSON.stringify(save.progress.startCards), "· reimportato", JSON.stringify(back), "· non validi tolti", JSON.stringify(bad), "· versione 8:", JSON.stringify(v8),
    ok(save.version === 10 && back.sky === "burn1" && JSON.stringify(bad) === "{}" && JSON.stringify(v8) === "{}"));
}

console.log("— Carta extra: nodo e costi —");
{
  const { ev } = game();
  const n = J(ev, `(() => { const n = TREE_NODE["barrier:extra"]; return { c: n.costs, m: n.mcosts, max: n.max, req: n.req.length, st: nodeState(n) }; })()`);
  console.log("costi Sigilli", n.c.join(" "), "· maggiori", n.m.join(" "), "· requisiti", n.req, "· stato con tutto al livello 1:", n.st, ok(n.c.join() === "0,1,1,1,1" && n.m.join() === "3,1,1,1,1" && n.max === 5 && n.req === 6 && n.st === "ready"));
  const lv = J(ev, `(() => { const n = TREE_NODE["barrier:extra"]; for (let i = 0; i < 5; i++) buyNode(n); const a = treeLv("barrier:extra"); delete progress.tree["barrier:cards"]; progress.tree["barrier:extra"] = 0; const b = nodeState(n); return { a, b }; })()`);
  console.log("livello 5 con gli altri nodi al livello 1 (la regola dei livelli non vale):", lv.a, "· senza “Più carte, più danno”:", lv.b, ok(lv.a === 5 && lv.b === "req"));
}

console.log("— Carta extra in partita —");
{
  const { ev } = game();
  const roll = J(ev, `(() => { const out = []; for (const L of [0, 1, 3, 5]) { progress.tree["barrier:extra"] = L; let okk = true; for (let i = 0; i < 300; i++) { const w = extraRoll(); if (w.length !== L || new Set(w).size !== L || w.some((n) => n < 1 || n > 19)) okk = false; } out.push(okk); }
    progress.tree["barrier:extra"] = 0; const R = Math.random; let k = 0; Math.random = () => { k++; return R(); }; extraRoll(); Math.random = R; return { out, k }; })()`);
  console.log("ondate estratte (livelli 0, 1, 3, 5): diverse e tra la 1 e la 19", roll.out.join(" "), "· senza il nodo nessuna chiamata a Math.random:", roll.k === 0, ok(roll.out.every(Boolean) && roll.k === 0));
  const flow = J(ev, `(() => { progress.tree["barrier:extra"] = 1; setSel("standard", 5); startRun("standard"); extraWaves = [1]; queue = []; enemies = []; waveTime = 1; update(0.02);
    const s1 = state, m1 = extraMode; pick(0); const s2 = state, m2 = extraMode, n2 = options.length; pick(0); return { s1, m1, s2, m2, n2, s3: state, wave, picks: runPicks }; })()`);
  console.log("ondata 1 estratta: carte", flow.s1, "→ scelta extra", flow.s2, "(" + flow.n2 + " carte, extra", flow.m2 + ") → ondata", flow.wave, "· scelte", flow.picks,
    ok(flow.s1 === "upgrade" && !flow.m1 && flow.s2 === "upgrade" && flow.m2 && flow.n2 === 3 && flow.s3 === "play" && flow.wave === 2 && flow.picks === 2));
  const boss = J(ev, `(() => { setSel("standard", 15); startRun("standard"); extraWaves = [5]; startWave(5); queue = []; enemies = []; bossBonus = 1; waveTime = 1; update(0.02);
    const seq = [extraMode ? "extra" : "carte"]; pick(0); seq.push(rewards ? "ricompensa" : extraMode ? "extra" : state); pick(0); seq.push(rewards ? "ricompensa" : extraMode ? "extra" : state + " " + wave); pick(0); seq.push(state + " " + wave); return seq; })()`);
  console.log("ondata 5 con mini-boss:", boss.join(" → "), ok(boss.join(",") === "carte,extra,ricompensa,play 6"));
  const pl = J(ev, `(() => { clearRun(); progress.tree["barrier:extra"] = 2; openPlanet(); startPlanet("fire"); extraWaves = [2]; queue = []; enemies = []; for (let k = 1; k < 2; k++) pw.clr[k] = true; wave = 2; pw.next = 1e9; waveTime = 1; update(0.02);
    const q = { st: state, extra: extraMode }; pick(0); const q2 = { st: state, extra: extraMode }; pick(0); return { q, q2, after: state, xw: JSON.parse(localStorage.getItem(RUN_KEY)).xw }; })()`);
  console.log("Protezione planetaria, ondata 2 ripulita: carte", pl.q.st, "→ extra", pl.q2.extra, "→", pl.after, "· salvato xw", JSON.stringify(pl.xw), ok(pl.q.st === "upgrade" && !pl.q.extra && pl.q2.st === "upgrade" && pl.q2.extra && pl.after === "play" && JSON.stringify(pl.xw) === "[2]"));
  const res = J(ev, `(() => { const r = JSON.parse(localStorage.getItem(RUN_KEY)); r.pq = ["cards", "extra"]; localStorage.setItem(RUN_KEY, JSON.stringify(r)); return !!loadRun(); })()`);
  console.log("partita sospesa con una scelta extra in coda: valida", res, ok(res));
}

console.log("— Partite vere e schermate —");
{
  const { g, ev } = game();
  ev(`progress.tree["barrier:extra"] = 5; progress.tree["player:start"] = 1; progress.startCards.player = "dmg"; setSel("standard", 5); startRun("standard");`);
  let shown = 0;
  for (let i = 0; i < 6000 && ev("state") !== "won" && ev("state") !== "lost"; i++) {
    ev("if (state === 'upgrade') pick(0); domeHp = domeMax; if (wave < 20 && state === 'play' && waveTime > 1) { queue = []; for (const e of enemies) e.dead = true; }");
    g.texts.length = 0; g.frame(); if (g.texts.includes("Carta extra")) shown++;
  }
  const r = J(ev, "({ st: state, cards: runCards.length, xw: extraWaves })");
  console.log("livello 5 con Carta extra al 5:", r.st, "· carte prese", r.cards, "(19 + 5) · ondate", r.xw.join(","), "· titolo “Carta extra” visto", shown > 0, ok(r.st === "won" && r.cards === 24 && shown > 0));
  ev(`state = "tree"; treeTab = "turrets"; treeSel = "sky"; progress.tree["sky:start"] = 1; progress.startCards.sky = "burn1"; treePick = null;`); g.texts.length = 0; g.frame(); const t1 = g.texts.join("|");
  ev(`treePick = "sky"`); g.texts.length = 0; g.frame(); const t2 = g.texts.join("|");
  ev(`treeTab = "barrier"; barrierTab = "nodes"; treePick = null;`); g.texts.length = 0; g.frame(); const t3 = g.texts.join("|");
  console.log("albero: riga “Carta iniziale”", t1.includes("Carta: Missili incendiari · tocca per cambiarla"), "· finestra di scelta", t2.includes("Carta iniziale · Sky Guard") && t2.includes("Fatto"), "· “Carta extra” nella barriera", t3.includes("Carta extra"),
    "· errori JS:", g.errors.length ? g.errors.join("; ") : "nessuno", ok(t1.includes("Carta: Missili incendiari · tocca per cambiarla") && t2.includes("Carta iniziale · Sky Guard") && t3.includes("5 scelte in più per livello, in ondate a caso") && !g.errors.length));
}
