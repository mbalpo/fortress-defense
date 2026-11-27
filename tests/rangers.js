// Ranger, fase 2 della Protezione planetaria (DESIGN.md § 17): livelli dai frammenti, equipaggiamento (al massimo 2, un solo ranger di conversione),
// frammenti al ranger non al massimo, posizione ai lati e davanti vicino al bordo, conversione, Atlante, i cinque supporti ai livelli 1 e 10,
// bonus di albero e Moduli, salvataggio versione 8, schermata dei ranger, partita in HD-2D.
const { makeGame } = require("./bot.js");
const ok = (c) => c ? "✓" : "✗ ERRORE";
const patch = (h) => h.replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();");
const ALL = ["alfa", "prometeo", "omega", "mnemosine", "sigma", "ceo", "gamma", "iperione", "epsilon", "atlante"];
const fragsAt = (L) => L ? 200 * (1 + 0.5 * (L - 1)) : 0;
function fresh(eq, L, extra, settings) {
  const frags = {}; for (const id of ALL) frags[id] = fragsAt(L == null ? 1 : L);
  const prog = Object.assign({ cleared: 60, seen: [], planet: { lv: {}, frags, day: { d: "", n: 0 }, eq: eq || [] } }, extra || {});
  const g = makeGame({ patch, cleared: 60, level: 30, settings, storage: { "fortress-progress-v1": JSON.stringify(prog) } }); g.frame();
  return { g, ev: g.win.__ev, stored: () => JSON.parse(g.win.localStorage.getItem("fortress-progress-v1")) };
}
const J = (ev, c) => JSON.parse(ev("JSON.stringify(" + c + ")"));

console.log("— Frammenti, livelli, equipaggiamento —");
{
  const { ev } = fresh([], 0);
  const lv = [199, 200, 299, 300, 400, 1099, 1100, 2099, 2100, 5000].map((f) => ev(`progress.planet.frags.alfa = ${f}; rangerLv("alfa")`));
  console.log("livello con 199 · 200 · 299 · 300 · 400 · 1099 · 1100 · 2099 · 2100 · 5000 frammenti:", lv.join(" · "), "| totale per il 10:", ev("rangerTotal(10)"), "· per il 20 (massimo, 1.28.0):", ev("rangerTotal(20)"),
    ok(lv.join() === "0,1,1,2,3,9,10,19,20,20" && ev("rangerTotal(10)") === 1100 && ev("rangerTotal(20)") === 2100));
  ev("progress.planet.frags.alfa = 0"); const locked = ev("toggleRanger('alfa')");
  ev("for (const id of ['alfa', 'prometeo', 'omega', 'ceo', 'sigma']) progress.planet.frags[id] = 200");
  const m = ["alfa", "prometeo", "ceo", "omega"].map((id) => ev(`toggleRanger("${id}")`));
  const eq1 = J(ev, "progress.planet.eq"); ev("toggleRanger('alfa')"); const conv = ev("toggleRanger('ceo')"); ev("toggleRanger('prometeo')"); const swap = ev("toggleRanger('ceo')");
  console.log("bloccato: “" + locked + "” | Alfa, Prometeo:", m[0], "/", m[1], "| terzo: “" + m[2] + "” | dopo aver tolto Alfa, Ceo: “" + conv + "” | tolto Prometeo, Ceo:", swap,
    ok(locked === "Servono 200 frammenti per sbloccarlo" && eq1.join() === "alfa,prometeo" && m[2] === "Al massimo 2 ranger: togline uno"
      && conv === "Un solo ranger di conversione alla volta" && swap === "Ceo equipaggiato" && J(ev, "progress.planet.eq").join() === "ceo"));
  ev("progress.planet.frags.sigma = 2100; progress.planet.frags.ceo = 0; planetType = 'electric'; startRun('planet'); pw.mb = 3; wave = 20; domeHp = 0"); ev("update(0.01)");
  const gain = J(ev, "planetGain");
  console.log("Sigma al livello massimo: frammenti tutti a Ceo", JSON.stringify(gain.parts), ok(gain.parts[0][1] === 0 && gain.parts[1][1] === gain.n && gain.n > 0));
}

console.log("— In campo: posizione, conversione, Atlante —");
{
  const { g, ev } = fresh(["alfa", "prometeo"], 3);
  g.key("Enter"); for (let i = 0; i < 30; i++) g.frame();
  const pos = J(ev, "RG.list.map((r) => [Math.round(r.x - player.x), Math.round(r.y - player.y)])");
  ev("player.x = 26; player.targetX = 26"); for (let i = 0; i < 40; i++) { ev("player.targetX = 26"); g.frame(); }
  const edge = J(ev, "RG.list.map((r) => [Math.round(r.x - player.x), Math.round(r.y - player.y)])");
  console.log("ai lati:", JSON.stringify(pos), "| guardiano al bordo sinistro:", JSON.stringify(edge), "(il sinistro davanti)",
    ok(pos[0][0] === -34 && pos[1][0] === 34 && edge[0][0] === 0 && edge[0][1] === -46 && edge[1][0] === 34));
  ev("queue = []; enemies = []; spawn({ enemy: 'drone', x: 180 }); spawn({ enemy: 'shell', x: 120 }); enemies.forEach((e) => { e.y = 200; e.hp = e.maxHp = 1e6; })");
  const h0 = ev("enemies[0].hp"); ev("guardHit(enemies[0], 100, true)"); const lost = h0 - ev("enemies[0].hp");
  console.log("Prometeo al 3 su una navicella (electric): 70 physical ×1,5 + 30 fire ×1 =", lost, "(attesi 135)", ok(Math.abs(lost - 135) < 1e-6));
  const a = fresh(["atlante"], 5); a.g.key("Enter"); a.g.frame();
  a.ev("queue = []; enemies = []; spawn({ enemy: 'shell', x: 120 }); enemies[0].y = 200; enemies[0].hp = enemies[0].maxHp = 1e6");
  const s0 = a.ev("enemies[0].hp"); a.ev("guardHit(enemies[0], 100, true)"); const ls = s0 - a.ev("enemies[0].hp");
  const b = fresh(["atlante"], 10); b.g.key("Enter"); b.g.frame();
  b.ev("queue = []; enemies = []; spawn({ enemy: 'shell', x: 120 }); spawn({ enemy: 'drone', x: 200 }); enemies.forEach((e) => { e.y = 200; e.hp = e.maxHp = 1e6; })");
  b.ev("guardHit(enemies[0], 100, true); guardHit(enemies[1], 100, true)"); const l10 = J(b.ev, "enemies.map((e) => 1e6 - e.hp)");
  console.log("Atlante al 5 su un frammento roccioso (physical ×0,5): danno", ls, "(×0,75) | al 10:", l10[0], "(×1) | debolezza della navicella (×1,5) invariata:", l10[1],
    ok(Math.abs(ls - 75) < 1e-6 && Math.abs(l10[0] - 100) < 1e-6 && Math.abs(l10[1] - 150) < 1e-6));
}

console.log("— Supporti ai livelli 1 e 10 —");
for (const L of [1, 10]) {
  const r = {};
  for (const id of ["alfa", "omega", "sigma", "gamma", "epsilon"]) {
    const { g, ev } = fresh([id], L);
    g.key("Enter"); g.frame();
    ev("queue = []; enemies = []; for (const x of [120, 180, 240]) { spawn({ enemy: 'brute', x }); const e = enemies[enemies.length - 1]; e.y = 380; e.speed = 0; e.hp = e.maxHp = 1e6; }");
    ev("player.cd = 1e9; RG.list[0].t = 0; window.__hp = enemies.map((e) => e.hp)");   // il guardiano non spara: solo il danno del ranger
    const cd = ev("RV.cd(RG.list[0].L)");
    for (let i = 0; i < 20; i++) g.frame();
    const st = { cd, t: Math.round(ev("RG.list[0].t")), dmg: Math.round(J(ev, "enemies.map((e, i) => window.__hp[i] - e.hp)").reduce((a, b) => a + b, 0)) };
    if (id === "alfa") { for (let i = 0; i < 150; i++) g.frame(); st.burn = ev("enemies.filter((e) => e.burnT > 0).length"); }
    if (id === "omega") st.status = ev("enemies.filter((e) => e.vulnT > 0 || e.slowT > 0 || e.weakT > 0).length");
    if (id === "gamma") { st.bubbles = ev("ents = ents.filter((o) => !o.bubble); enemies.forEach((e) => { e.y0 = e.y; e.y = -50; }); SUPPORT.gamma(RG.list[0]); enemies.forEach((e) => { e.y = e.y0; }); ents.filter((o) => o.bubble).length"); /* nemici fuori: nessuna bolla esplode subito */ const b0 = ev("ents.filter((o) => o.bubble).length"); ev("const b = ents.find((o) => o.bubble); b.x = enemies[0].x; b.y = enemies[0].y"); g.frame(); st.boom = b0 - ev("ents.filter((o) => o.bubble).length"); }
    if (id === "epsilon") { st.missiles = ev("ents.filter((o) => o.tint).length"); for (let i = 0; i < 90; i++) g.frame(); st.dmg = Math.round(J(ev, "enemies.map((e, i) => window.__hp[i] - e.hp)").reduce((a, b) => a + b, 0)); }
    r[id] = st;
  }
  console.log("livello " + L + ":", JSON.stringify(r));
  const exp = L === 1 ? { cd: 40, bubbles: 2, missiles: 2 } : { cd: 20, bubbles: 12, missiles: 6 };
  console.log("livello " + L + " (ciclo " + exp.cd + " s, " + exp.bubbles + " bolle, " + exp.missiles + " missili): tutti fanno danno e ripartono dal ciclo",
    ok(Object.values(r).every((s) => s.cd === exp.cd && Math.abs(s.t - exp.cd) <= 1) && r.alfa.dmg > 0 && r.omega.dmg > 0 && r.omega.status === (L === 1 ? 1 : 3) && r.sigma.dmg > 0
      && r.gamma.bubbles === exp.bubbles && r.gamma.boom >= 1 && r.epsilon.missiles === exp.missiles && r.epsilon.dmg > 0 && (L === 1 || r.alfa.burn >= 1)));
}
{
  const { g, ev } = fresh(["sigma"], 10, { tree: { "types:dmg:electric": 2 }, gear: { pcs: {}, mods: {}, eq: {} } });
  g.key("Enter"); g.frame();
  console.log("bonus dei supporti: nodo Tipi electric al 2 → ×" + ev("rangerBonus('electric')") + ", fire ×" + ev("rangerBonus('fire')"), ok(Math.abs(ev("rangerBonus('electric')") - 1.12) < 1e-9 && ev("rangerBonus('fire')") === 1));
}

console.log("— Salvataggio, schermata, HD-2D —");
{
  const { g, ev } = fresh(["gamma", "atlante"], 2);
  const save = J(ev, "makeSave()");
  const bad = J(ev, `parseSave(JSON.stringify({ game: "fortress-defense", version: 8, progress: { cleared: 70, seen: [], planet: { eq: ["prometeo", "ceo", "alfa", "zzz"] } } })).planet.eq`);
  const v7 = J(ev, `parseSave(JSON.stringify({ game: "fortress-defense", version: 7, progress: { cleared: 70, seen: [], planet: { lv: { fire: 2 } } } })).planet`);
  console.log("esportato: versione", save.version, "| in campo", save.progress.planet.eq.join(","), "| non validi:", JSON.stringify(bad), "| versione 7: in campo", JSON.stringify(v7.eq), "livelli fire", v7.lv.fire,
    ok(save.version === 9 && save.progress.planet.eq.join() === "gamma,atlante" && bad.join() === "prometeo,alfa" && v7.eq.length === 0 && v7.lv.fire === 2));
  ev("openPlanet()"); g.frame(); ev("openRangers('planet')"); g.texts.length = 0; g.frame(); const T = [...g.texts];
  ev("tapRanger('omega')"); const sel = ev("rangerSel"); ev("tapRanger('omega')"); const msg = ev("rangerMsg");
  ev("closeRangers()");
  console.log("schermata: “RANGER” e i dieci nomi", ALL.every((id) => T.includes(ev(`RANGER_NAME["${id}"]`))), "| Supporto · Bolle", T.includes("Supporto · Bolle"), "| tocco su Omega → scelto", sel, "| secondo tocco:", msg, "→ indietro:", ev("state"),
    ok(T.includes("RANGER") && ALL.every((id) => T.includes(ev(`RANGER_NAME["${id}"]`))) && sel === "omega" && msg === "Al massimo 2 ranger: togline uno" && ev("state") === "planet"));
  const h = fresh(["epsilon", "iperione"], 6, null, { graphics: "hd2d" });
  h.g.key("Enter"); for (let i = 0; i < 2400; i++) { h.g.frame(); h.ev("domeHp = domeMax; if (state === 'upgrade') pick(0)"); }
  h.ev("openRangers('menu')"); h.g.frame();
  h.ev("closeRangers(); selLevel = 30; startRun('standard'); window.__rc = 0; const f0 = DRAW.FX.ranger; DRAW.FX.ranger = (r) => { window.__rc++; return f0(r); }"); h.g.frame();
  const drawsR = h.ev("window.__rc") > 0;           // il campo dell’HD-2D disegna i ranger (mancava nella 1.17.0)
  console.log("HD-2D: grafica", h.ev("DRAW.GFX_ON"), "| ranger nel disegno del campo:", drawsR, "| partita con Epsilon e Iperione e schermata dei ranger, errori JS:", h.g.errors[0] || "nessuno",
    ok(h.ev("DRAW.GFX_ON") === "hd2d" && drawsR && !h.g.errors.length && !g.errors.length));
}
