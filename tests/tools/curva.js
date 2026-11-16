// Curva della campagna oltre il 30 con l'albero dei Sigilli: per ogni livello i bot partono con l'albero "atteso",
// cioè con i Sigilli presi fino a lì (in Standard: 1 per livello dal 31 più, in media, metà dei premi della cupola al 100%)
// spesi da una strategia semplice (prima i nodi condivisi, poi danno e barriera, poi il resto); dal 40 i bot usano le tre abilità d’ingresso.
// Uso: node tests/tools/curva.js <livelli> [partite per bot, default 20] [primo seme, default 1] [Sigilli per livello, default 1.5] [sostituzioni JSON]
// Con EQUIP=<vittorie per livello> (es. EQUIP=1.5) i bot hanno anche l’equipaggiamento atteso (tests/tools/equip-atteso.js), uguale per tutte le partite del livello.
const { play, makeGame } = require("../bot.js");
const { gearFor } = require("./equip-atteso.js");
const EQUIP = +(process.env.EQUIP || 0);
const LVS = process.argv[2].split(",").map(Number), N = +(process.argv[3] || 20), S0 = +(process.argv[4] || 1), PER = +(process.argv[5] || 1.5);
const reps = JSON.parse(process.argv[6] || "[]");
const patch = (h) => reps.reduce((a, [x, y]) => { if (!a.includes(x)) throw new Error("manca " + x); return a.replace(x, y); }, h);
const EV = (h) => patch(h).replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();");

// Sigilli attesi prima di giocare il livello L (presi completando i livelli dal 31 a L − 1)
// dalla 1.12.0, con EPICA (default 0,5): dal 50 il giocatore completa anche EPICA livelli di Epica per ogni livello di Standard; ogni livello di Epica dà 3 Sigilli
// e i Sigilli maggiori dei boss (mini-boss: 1 − 0,9³ ≈ 0,27 per livello; boss finale: 1 ogni 10 livelli)
const EPICA = process.env.EPICA === undefined ? 0.5 : +process.env.EPICA;
const epicAt = (L) => Math.floor(EPICA * Math.max(0, L - 51));
const sealsAt = (L) => Math.floor(PER * Math.max(0, L - 31)) + 3 * epicAt(L);
const majorsAt = (L) => Math.floor(epicAt(L) * (1 - 0.9 ** 3) + Math.floor(epicAt(L) / 10));
// strategia di spesa: costo del prossimo livello × peso; vince il più basso (pari: ordine dell'albero)
const SPEND = `(() => {
  const W = (n) => n.kind === "perm" ? 99 : n.id === "types:all" || n.id === "player:std:dmg" || n.id === "barrier:cards" ? 1 : n.id === "barrier:hp" || n.id === "barrier:red" ? 1.3
    : n.id.startsWith("types:dmg") ? 2.5 : /:std:dmg$/.test(n.id) ? 4 : n.kind === "ability" ? (!n.req.length ? 3 : 99) : n.kind === "level" ? 6 : 3;
  // un Sigillo maggiore vale come 5 normali nella scelta (i bot non equipaggiano torrette: lo Sblocco permanente non serve)
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
  const g = makeGame({ patch: EV, cleared: L - 1, level: L, storage: { "fortress-progress-v1": JSON.stringify({ cleared: L - 1, seen: [], seals: sealsAt(L), majors: majorsAt(L), tree: grandfather(L) }) } });
  return JSON.parse(g.win.__ev(SPEND));
}
for (const L of LVS) {
  const tree = treeFor(L), gear = EQUIP ? gearFor(L, EQUIP, 1, epicAt(L)) : undefined, storage = { "fortress-progress-v1": JSON.stringify({ cleared: L - 1, seen: [], tree, gear }) };
  const row = [];
  for (const pol of ["random", "smart"]) {
    let w = 0, s = 0;
    for (let seed = S0; seed < S0 + N; seed++) { const r = play({ seed, patch, cleared: L - 1, level: L, storage }, pol, "Enter"); if (r.result === "VINTO") w++; s += r.wave; }
    row.push(`${pol}: ${w}/${N} (ondata media ${(s / N).toFixed(1)})`);
  }
  console.log("livello", String(L).padStart(3), "| Sigilli", String(sealsAt(L)).padStart(3), "| maggiori", String(majorsAt(L)).padStart(2), "|", row.join(" | "));
}
