// 1.24.0 (DESIGN.md § 3 “Chain alternativa dimezzata”, § 15 Modulo 21): la voce lv1 dell’altra chain pesa 0,2 invece di 0,4 dopo la lv1 di una chain
// (anche dalla Carta iniziale; solo la lv1; nessun dimezzamento se le ha prese entrambe; stesso peso nella ricompensa dei mini-boss);
// il rinnovo delle carte non ripete quelle appena offerte se il pool basta, altrimenti completa con quelle già viste; consumo del rinnovo invariato.
const { makeGame } = require("./bot.js");
const ok = (c) => c ? "✓" : "✗ ERRORE";
const patch = (h) => h.replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();");
const J = (ev, c) => JSON.parse(ev("JSON.stringify(" + c + ")"));
const errors = [];
const ALL = (ids) => `(() => { const t = {}; for (const w of ${JSON.stringify(ids)}) for (const n of TREE[w]) if (n.kind !== "start" && n.id !== "barrier:extra") t[n.id] = 1; return t; })()`;
function game(extra, seed) {
  const g0 = makeGame({ patch, storage: { "fortress-progress-v1": JSON.stringify({ cleared: 200, clearedEpic: 200, seen: [] }) } }); g0.frame();
  const tree = J(g0.win.__ev, ALL(["player", "sky", "laser", "beam", "hive"]));
  const prog = Object.assign({ cleared: 200, clearedEpic: 200, seen: [], seals: 50, majors: 30, tree }, extra || {});
  const g = makeGame({ patch, seed: seed || 3, storage: { "fortress-progress-v1": JSON.stringify(prog) } }); g.frame();
  const ev = g.win.__ev; ev(`setSel("standard", 61); startRun("standard");`);
  return { g, ev };
}
// pesi delle carte chain di un’entità (solo quelle sceglibili ora)
const W = (who) => `Object.fromEntries(eligible(${who}).filter((u) => u.cat === "chain").map((u) => [u.id, upWeight(${who}, u)]))`;
const fmt = (o) => Object.entries(o).map(([k, v]) => k + " " + String(v).replace(".", ",")).join(" · ");

console.log("— Peso della chain alternativa (Sky Guard) —");
{
  const { g, ev } = game();
  ev(`applyOption({ kind: "new", id: "sky" }); window.__s = slots.find((x) => x && x.id === "sky");`);
  const w0 = J(ev, W("__s"));
  console.log("nessuna chain:", fmt(w0), ok(w0.split1 === 0.4 && w0.burn1 === 0.4));
  ev(`applyUp(__s, __s.def.ups.find((u) => u.id === "split1"))`);
  const w1 = J(ev, W("__s"));
  console.log("dopo Frammentazione:", fmt(w1), ok(w1.burn1 === 0.2 && Object.keys(w1).join() === "burn1"));
  ev(`__s.level = 2; __s.used = 0;`);
  const w2 = J(ev, W("__s"));
  console.log("al livello 2, solo la lv1 dell’altra dimezzata:", fmt(w2), ok(w2.burn1 === 0.2 && w2.split2 === 0.4 && w2.splitB === 0.4));
  ev(`applyUp(__s, __s.def.ups.find((u) => u.id === "burn1"))`);
  const w3 = J(ev, W("__s"));
  console.log("prese entrambe le lv1 → nessun dimezzamento:", fmt(w3), ok(w3.burn2 === 0.4 && w3.split2 === 0.4 && Object.values(w3).every((v) => v === 0.4)));
  // standard, level up e combo non cambiano
  const oth = J(ev, `__s.def.ups.filter((u) => u.cat !== "chain").every((u) => upWeight(__s, u) === UP_W[u.cat])`);
  console.log("standard, level up e combo con il peso di sempre:", oth, ok(oth));
  errors.push(...g.errors);
}

console.log("— Peso della chain alternativa (guardiano) —");
{
  const { g, ev } = game();
  const ch = J(ev, `player.def.ups.filter((u) => u.cat === "chain" && u.lv === 1).map((u) => u.id)`);
  ev(`applyUp(player, player.def.ups.find((u) => u.id === "${ch[0]}"))`);
  const w = J(ev, W("player"));
  console.log("chain lv1 del guardiano:", ch.join(" "), "· dopo", ch[0] + ":", fmt(w), ok(ch.length === 2 && w[ch[1]] === 0.2));
  errors.push(...g.errors);
}

console.log("— Carta iniziale —");
{
  const { g, ev } = game({ startCards: { sky: "burn1" }, loadout: ["sky"] });
  ev(`progress.tree["sky:start"] = 1; progress.startCards = { sky: "burn1" }; saveProgress(); setSel("standard", 61); startRun("standard"); window.__s = slots.find((x) => x && x.id === "sky");`);
  const w = J(ev, W("__s")), up = J(ev, "__s.up");
  console.log("Sky Guard con Missili incendiari dalla Carta iniziale", JSON.stringify(up), "→", fmt(w), ok(up.burn1 === 1 && w.split1 === 0.2));
  errors.push(...g.errors);
}

// frequenza attesa di una carta: peso / somma dei pesi delle candidate
const EXPECT = (id) => `(() => { let tot = 0, me = 0; const owned = slots.filter(Boolean);
  if (slots.indexOf(null) >= 0) for (const t of TURRET_ORDER) if (!owned.some((s) => s.id === t)) tot += owned.length < 2 ? 3 : 1.5;
  for (const who of [player, ...owned]) for (const u of eligible(who)) { const w = upWeight(who, u); tot += w; if (who === __s && u.id === "${id}") me = w; }
  return me / tot; })()`;
console.log("— Sorteggio: carte dopo l’ondata e ricompensa del mini-boss —");
{
  const { g, ev } = game();
  ev(`applyOption({ kind: "new", id: "sky" }); window.__s = slots.find((x) => x && x.id === "sky"); applyUp(__s, __s.def.ups.find((u) => u.id === "split1"));`);
  const p = J(ev, EXPECT("burn1"));
  const N = 60000;
  const roll = J(ev, `(() => { let c = 0; for (let i = 0; i < ${N}; i++) { const o = rollOptions(1)[0]; if (o.kind === "up" && o.who === __s && o.up.id === "burn1") c++; } return c / ${N}; })()`);
  // con il peso pieno (0,4) la frequenza sarebbe circa il doppio
  const full = p * 2 / (1 + p);
  const sd = Math.sqrt(p * (1 - p) / N);
  console.log("carte dopo l’ondata: Missili incendiari", (roll * 100).toFixed(2) + "% (atteso " + (p * 100).toFixed(2) + "%, con 0,4 sarebbe " + (full * 100).toFixed(2) + "%)",
    ok(Math.abs(roll - p) < 4 * sd && Math.abs(roll - full) > 8 * sd));
  // ricompensa del mini-boss: una carta per volta, stato ripristinato dopo ogni estrazione
  const boss = J(ev, `(() => { const keep = CAMPAIGN.bossCards; CAMPAIGN.bossCards = 1; let c = 0;
    const snap = () => [player, ...slots].filter(Boolean).map((s) => [s, JSON.stringify(s.up), s.used, s.level, s.done]);
    for (let i = 0; i < ${N}; i++) { const sv = snap(), sl = slots.slice(), rc = runCards.length, rp = runPicks; bonusLeft = 1; giveBossRewards();
      const r = rewards[0]; if (r && r.title === "Missili incendiari") c++;
      for (const [s, up, used, level, done] of sv) Object.assign(s, { up: JSON.parse(up), used, level, done }); slots = sl; runCards.length = rc; runPicks = rp; }
    CAMPAIGN.bossCards = keep; return c / ${N}; })()`);
  console.log("ricompensa del mini-boss: Missili incendiari", (boss * 100).toFixed(2) + "% (atteso " + (p * 100).toFixed(2) + "%)", ok(Math.abs(boss - p) < 4 * sd && Math.abs(boss - full) > 8 * sd));
  errors.push(...g.errors);
}

console.log("— Rinnovo (Modulo 21) —");
{
  const { g, ev } = game();
  const key = `const K = (o) => o.kind === "new" ? "n:" + o.id : o.who.id + ":" + o.up.id;`;
  // pool ampio: nessuna ripetuta in 300 rinnovi, un rinnovo consumato ogni volta
  const big = J(ev, `(() => { ${key} let rep = 0, len = true, used = true, pool = rollOptions(999).length;
    for (let i = 0; i < 300; i++) { state = "upgrade"; rewards = null; options = rollOptions(3); refreshLeft = 2; const a = options.map(K);
      const r = refreshCards(); const b = options.map(K); if (b.some((k) => a.includes(k))) rep++; if (b.length !== 3) len = false; if (!r || refreshLeft !== 1) used = false; }
    return { rep, len, used, pool }; })()`);
  console.log("pool ampio (" + big.pool + " carte): ripetute dopo il rinnovo in 300 prove", big.rep, "· stesso numero", big.len, "· rinnovo consumato", big.used, ok(big.rep === 0 && big.len && big.used && big.pool >= 6));
  // pool esatto: n carte fuori dalle viste → tutte nuove
  const ex = J(ev, `(() => { ${key} const P = rollOptions(999).length, n = Math.floor(P / 2); let bad = 0;
    for (let i = 0; i < 100; i++) { state = "upgrade"; options = rollOptions(n); refreshLeft = 1; const a = options.map(K); refreshCards(); const b = options.map(K);
      if (b.length !== n || b.some((k) => a.includes(k)) || new Set(b).size !== n) bad++; } return { P, n, bad }; })()`);
  console.log("pool di " + ex.P + " con " + ex.n + " carte offerte (restano ≥ n): prove con ripetute", ex.bad, ok(ex.bad === 0));
  // pool piccolo: offerte P−1 carte → nel rinnovo c’è l’unica non vista, completata con P−2 già viste, senza doppioni
  const sm = J(ev, `(() => { ${key} const P = rollOptions(999).length; let bad = 0, left = true;
    for (let i = 0; i < 100; i++) { state = "upgrade"; options = rollOptions(P - 1); refreshLeft = 1; const a = options.map(K); const all = rollOptions(999).map(K); const miss = all.find((k) => !a.includes(k));
      refreshCards(); const b = options.map(K); if (b.length !== P - 1 || !b.includes(miss) || new Set(b).size !== P - 1 || b.filter((k) => a.includes(k)).length !== P - 2) bad++; if (refreshLeft !== 0) left = false; }
    return { P, bad, left }; })()`);
  console.log("pool piccolo (" + sm.P + " carte, " + (sm.P - 1) + " offerte): rinnovo con l’unica nuova più " + (sm.P - 2) + " già viste, prove sbagliate", sm.bad, "· rinnovo consumato", sm.left, ok(sm.bad === 0 && sm.left));
  // a peso anche il completamento: tra le già viste esce più spesso quella che pesa di più
  const wt = J(ev, `(() => { ${key} let hi = 0, lo = 0, k = 0; const pool = []; for (const who of [player, ...slots.filter(Boolean)]) for (const u of eligible(who)) pool.push({ who, u, w: upWeight(who, u) });
    const a = pool.find((p) => p.w === 1), b = pool.find((p) => p.w === 0.4); if (!a || !b) return null;
    const oa = { kind: "up", who: a.who, up: a.u }, ob = { kind: "up", who: b.who, up: b.u };
    for (let i = 0; i < 4000; i++) { const all = rollOptions(999); const ex = all.filter((o) => K(o) !== K(oa) && K(o) !== K(ob));
      const r = rollOptions(ex.length + 1, all).map(K); const extra = r.filter((x) => x === K(oa) || x === K(ob)); if (extra[0] === K(oa)) hi++; else if (extra[0] === K(ob)) lo++; }
    return { hi, lo }; })()`);
  // tutte già viste: rollOptions(P, tutte) — si estrae solo tra le viste, a peso
  const wt2 = J(ev, `(() => { ${key} const all = rollOptions(999); const P = all.length; const r = rollOptions(P, all).map(K); return { P, n: r.length, uniq: new Set(r).size }; })()`);
  console.log("tutte le carte già viste: rinnovo con tutte le " + wt2.n + " di " + wt2.P + ", senza doppioni", ok(wt2.n === wt2.P && wt2.uniq === wt2.P));
  if (wt) console.log("completamento a peso: tra una standard (1) e una chain (0,4) già viste esce prima la standard", wt.hi, "volte su", wt.hi + wt.lo, ok(wt.hi / (wt.hi + wt.lo) > 0.62 && wt.hi / (wt.hi + wt.lo) < 0.8));
  // consumo invariato: a zero non rinnova e lascia le carte
  const z = J(ev, `(() => { ${key} state = "upgrade"; options = rollOptions(3); refreshLeft = 0; const a = options.map(K).join(); const r = refreshCards(); return { r, same: options.map(K).join() === a }; })()`);
  console.log("senza rinnovi: nessun cambio", !z.r && z.same, ok(!z.r && z.same));
  errors.push(...g.errors);
}

console.log("errori JS:", errors.length ? errors.join(" | ") : "nessuno", ok(!errors.length));
