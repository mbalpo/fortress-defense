// Curva della campagna oltre il 30 con l'albero dei Sigilli: per ogni livello i bot partono con l'albero "atteso",
// cioè con i Sigilli presi fino a lì (in Standard: 1 per livello dal 31 più, in media, metà dei premi della cupola al 100%)
// spesi da una strategia semplice (prima i nodi condivisi, poi danno e barriera, poi il resto); dal 40 i bot usano le tre abilità d’ingresso.
// Uso: node tests/tools/curva.js <livelli> [partite per bot, default 20] [primo seme, default 1] [Sigilli per livello, default 1.5] [sostituzioni JSON]
// Con EQUIP=<vittorie per livello> (es. EQUIP=1.5) i bot hanno anche l’equipaggiamento atteso (tests/tools/equip-atteso.js), uguale per tutte le partite del livello.
// Con RANGERS=<id:livello,…> (es. RANGERS=atlante:5,epsilon:5) i bot hanno quei ranger equipaggiati (DESIGN.md § 17, 1.17.0).
// Profilo “tutto al massimo” (26/11/2026, § 16 “Campagna a 400 livelli”), solo nelle misure (sostituzioni nel sorgente, il gioco non cambia):
//   MASSIMO=<N> → albero pieno, nodi finali (danno di guardiano e torrette ×1,83), tetto della riduzione del danno al 65%, equipaggiamento ancestrale+N
//   con i Moduli ancestrali migliori (6, 7, 8 slot a +1, +5, +10), ranger al “20” (default RANGERS=atlante:10,epsilon:10 con supporti ×3,85 / 2,35 e +50% al danno del guardiano).
//   PENDENZA=<s> → pendenza della difficoltà oltre il 200 (fino al 200 resta 1,2). Livelli oltre il 200: CAMPAIGN.maxLevel portato a 400.
const { play, makeGame } = require("../bot.js");
const { gearFor, gearMax, patchAncestrale, slotsAt } = require("./equip-atteso.js");
const EQUIP = +(process.env.EQUIP || 0);
const LVS = process.argv[2].split(",").map(Number), N = +(process.argv[3] || 20), S0 = +(process.argv[4] || 1), PER = +(process.argv[5] || 1.5);
const reps = JSON.parse(process.argv[6] || "[]");
const MASSIMO = process.env.MASSIMO === undefined ? null : +process.env.MASSIMO, PEND = process.env.PENDENZA === undefined ? null : +process.env.PENDENZA;
if (MASSIMO !== null && !process.env.RANGERS) process.env.RANGERS = "atlante:10,epsilon:10";
const sub = (h, x, y) => { if (!h.includes(x)) throw new Error("manca " + x); return h.replace(x, y); };
function extra(h) {
  if (MASSIMO !== null || LVS.some((L) => L > 200)) h = sub(h, "maxLevel: 200,", "maxLevel: 400,");
  if (PEND !== null) h = sub(h, ": 23 + EFF_JUMP_31 + EFF_SLOPE_31 * (D - 30);", `: 23 + EFF_JUMP_31 + EFF_SLOPE_31 * (Math.min(D, 200) - 30) + ${PEND} * Math.max(0, D - 200);`);
  if (MASSIMO === null) return h;
  h = patchAncestrale(h, MASSIMO);
  h = sub(h, "const TREE_CAP = { red: 0.5,", "const TREE_CAP = { red: 0.65,");
  h = sub(h, "let d = base * mult;", "let d = base * mult * (src === \"ranger\" || src === \"deflect\" ? 1 : 1 + 5 / 6);");
  h = sub(h, "const rangerBonus = (t) => 1 + TREE_VAL.typeDmg * treeLv(\"types:dmg:\" + t) + (GEAR.type[t] || 0);",
    "const rangerBonus = (t) => (1 + 0.15 * 19) / (1 + 0.15 * 9) * (1 + TREE_VAL.typeDmg * treeLv(\"types:dmg:\" + t) + (GEAR.type[t] || 0));");
  return sub(h, "function guardHit(e, dmg, quiet) {", "function guardHit(e, dmg, quiet) { dmg *= 1.5;");
}
const patch = (h) => extra(reps.reduce((a, [x, y]) => { if (!a.includes(x)) throw new Error("manca " + x); return a.replace(x, y); }, h));
const EV = (h) => patch(h).replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();");

// Sigilli attesi prima di giocare il livello L (presi completando i livelli dal 31 a L − 1)
// dalla 1.12.0, con EPICA (default 0,5): dal 50 il giocatore completa anche EPICA livelli di Epica per ogni livello di Standard
// e prende i Sigilli maggiori dei boss (mini-boss: 1 − 0,9³ ≈ 0,27 per livello; boss finale: 1 ogni 10 livelli).
// Dalla 1.15.1 ogni livello di Epica dà 2 Sigilli al primo completamento e 2 al premio della cupola al 100% (CAMPAIGN.sealsEpic):
// EPICA100 = quota dei livelli di Epica chiusi al 100% (default 0,5 [Claude, provvisorio]) → 2 + 2 × EPICA100 per livello (3 con 0,5, come la taratura 1.12.1)
const EPICA = process.env.EPICA === undefined ? 0.5 : +process.env.EPICA;
const EPICA100 = process.env.EPICA100 === undefined ? 0.5 : +process.env.EPICA100;
const epicAt = (L) => Math.floor(EPICA * Math.max(0, L - 51));
const sealsAt = (L) => Math.floor(PER * Math.max(0, L - 31) + (2 + 2 * EPICA100) * epicAt(L));
const majorsAt = (L) => Math.floor(epicAt(L) * (1 - 0.9 ** 3) + Math.floor(epicAt(L) / 10));
// strategia di spesa: costo del prossimo livello × peso; vince il più basso (pari: ordine dell'albero)
const SPEND = `(() => {
  const W = (n) => n.kind === "perm" || n.kind === "start" ? 99 : n.id === "types:all" || n.id === "player:std:dmg" || n.id === "barrier:cards" ? 1 : n.id === "barrier:hp" || n.id === "barrier:red" ? 1.3
    : n.id.startsWith("types:dmg") ? 2.5 : /:std:dmg$/.test(n.id) ? 4 : n.kind === "ability" ? (!n.req.length ? 3 : 99) : n.kind === "level" ? 6 : 3;
  // un Sigillo maggiore vale come 5 normali nella scelta (i bot non equipaggiano torrette: lo Sblocco permanente non serve; non scelgono la Carta iniziale, 1.22.0)
  for (;;) {
    let best = null, bw = Infinity;
    for (const n of Object.values(TREE_NODE)) if (nodeState(n) === "ready") { const w = (nodeCost(n) + 5 * nodeMCost(n)) * W(n); if (w < bw) { bw = w; best = n; } }
    if (!best) break; buyNode(best);
  }
  return JSON.stringify(progress.tree);
})()`;
// abilità d’ingresso: dal 40 completato i bot le hanno, come nella taratura 1.8.0 (dalla 1.12.0 costano 1 Sigillo: le diamo senza spesa)
const grandfather = (L) => L - 1 >= 40 ? { "ab:regen": 1, "ab:repulse": 1, "ab:burn": 1 } : {};
function treeFor(L) {
  const seals = MASSIMO !== null ? 1e5 : sealsAt(L), majors = MASSIMO !== null ? 1e4 : majorsAt(L);   // profilo al massimo: albero pieno
  const g = makeGame({ patch: EV, cleared: L - 1, level: L, storage: { "fortress-progress-v1": JSON.stringify({ cleared: L - 1, seen: [], seals, majors, tree: grandfather(L) }) } });
  return JSON.parse(g.win.__ev(SPEND));
}
for (const L of LVS) {
  const tree = treeFor(L), gear = MASSIMO !== null ? gearMax(slotsAt(MASSIMO)) : EQUIP ? gearFor(L, EQUIP, 1, epicAt(L)) : undefined;
  const rg = (process.env.RANGERS || "").split(",").filter(Boolean).map((x) => x.split(":")), frags = {};
  for (const [id, lv] of rg) frags[id] = 200 * (1 + 0.5 * (+lv - 1));
  const planet = rg.length ? { lv: {}, frags, day: { d: "", n: 0 }, eq: rg.map((x) => x[0]) } : undefined;
  const storage = { "fortress-progress-v1": JSON.stringify({ cleared: L - 1, seen: [], tree, gear, planet }) };
  const row = [];
  for (const pol of ["random", "smart"]) {
    let w = 0, s = 0;
    for (let seed = S0; seed < S0 + N; seed++) { const r = play({ seed, patch, cleared: L - 1, level: L, storage }, pol, "Enter"); if (r.result === "VINTO") w++; s += r.wave; }
    row.push(`${pol}: ${w}/${N} (ondata media ${(s / N).toFixed(1)})`);
  }
  console.log("livello", String(L).padStart(3), "| Sigilli", String(sealsAt(L)).padStart(3), "| maggiori", String(majorsAt(L)).padStart(2), "|", row.join(" | "));
}
