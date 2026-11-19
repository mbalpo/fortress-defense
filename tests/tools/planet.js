// Protezione planetaria (DESIGN.md § 17, fase 1): bot con l’albero e l’equipaggiamento attesi di un livello della campagna.
// Uso: node tests/tools/planet.js <livelli planetari> [partite per bot, default 20] [primo seme, default 1] [tipi, default tutti]
//   CAMP=<livello della campagna> (default: la difficoltà del livello planetario) · EQUIP=<vittorie per livello> (default 1,5, come curva.js)
//   SEQ=1: ondate in sequenza (la successiva parte quando la precedente è ripulita) per misurare il tempo di pulizia di ogni ondata
//   K=<fattore>: tempi delle ondate moltiplicati (PLANET.waveK) da provare
const { play, makeGame } = require("../bot.js");
const { gearFor } = require("./equip-atteso.js");
const LVS = process.argv[2].split(",").map(Number), N = +(process.argv[3] || 20), S0 = +(process.argv[4] || 1);
const TYPES = (process.argv[5] || "fire,force,electric,energy,physical").split(",");
const EQUIP = process.env.EQUIP === undefined ? 1.5 : +process.env.EQUIP, SEQ = !!+(process.env.SEQ || 0), K = process.env.K;
const rep = (h, a, b) => { if (!h.includes(a)) throw new Error("manca " + a); return h.replace(a, b); };
function patch(h) {
  h = rep(h, "requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();");
  h = rep(h, "    pw.clr[n] = true;\n", "    pw.clr[n] = true; (window.__clr = window.__clr || []).push([n, waveTime]);\n");
  h = rep(h, "  wave = n; upBuild = false; pw.banner = 2;", "  wave = n; upBuild = false; pw.banner = 2; (window.__start = window.__start || [])[n] = Math.max(0, first ? 0 : waveTime);");
  if (SEQ) h = rep(h, "if (wave < N_WAVES && waveTime >= pw.next)", "if (wave < N_WAVES && pw.clr[wave])");
  if (K !== undefined) h = rep(h, "waveK: 1,", "waveK: " + +K + ",");
  return h;
}
// albero atteso: come curva.js (Sigilli e maggiori attesi, stessa strategia di spesa)
const SPEND = `(() => {
  const W = (n) => n.kind === "perm" ? 99 : n.id === "types:all" || n.id === "player:std:dmg" || n.id === "barrier:cards" ? 1 : n.id === "barrier:hp" || n.id === "barrier:red" ? 1.3
    : n.id.startsWith("types:dmg") ? 2.5 : /:std:dmg$/.test(n.id) ? 4 : n.kind === "ability" ? (!n.req.length ? 3 : 99) : n.kind === "level" ? 6 : 3;
  for (;;) {
    let best = null, bw = Infinity;
    for (const n of Object.values(TREE_NODE)) if (nodeState(n) === "ready") { const w = (nodeCost(n) + 5 * nodeMCost(n)) * W(n); if (w < bw) { bw = w; best = n; } }
    if (!best) break; buyNode(best);
  }
  return JSON.stringify(progress.tree);
})()`;
const epicAt = (L) => Math.floor(0.5 * Math.max(0, L - 51));
const sealsAt = (L) => Math.floor(1.5 * Math.max(0, L - 31) + 3 * epicAt(L));
const majorsAt = (L) => Math.floor(epicAt(L) * (1 - 0.9 ** 3) + Math.floor(epicAt(L) / 10));
function treeFor(L) {
  const g = makeGame({ patch, cleared: L - 1, level: Math.min(L, 200), storage: { "fortress-progress-v1": JSON.stringify({ cleared: L - 1, seen: [], seals: sealsAt(L), majors: majorsAt(L), tree: { "ab:regen": 1, "ab:repulse": 1, "ab:burn": 1 } }) } });
  return JSON.parse(g.win.__ev(SPEND));
}
const pct = (a, q) => { const b = [...a].sort((x, y) => x - y); return b.length ? b[Math.min(b.length - 1, Math.floor(q * b.length))] : NaN; };
for (const PL of LVS) {
  const D = 55 + 5 * PL, C = +(process.env.CAMP || D), tree = treeFor(C), gear = EQUIP ? gearFor(C, EQUIP, 1, epicAt(C)) : undefined;
  for (const t of TYPES) {
    const lv = {}; for (const k of ["fire", "force", "electric", "energy", "physical"]) lv[k] = k === t ? PL - 1 : 0;
    const storage = { "fortress-progress-v1": JSON.stringify({ cleared: Math.max(60, C - 1), seen: [], tree, gear, planet: { lv, frags: {}, day: { d: "", n: 0 } } }) };
    const row = [], clear = Array.from({ length: 21 }, () => []);
    for (const pol of ["random", "smart"]) {
      let w = 0, wv = 0, mb = 0;
      for (let seed = S0; seed < S0 + N; seed++) {
        const r = play({ seed, patch, cleared: Math.max(60, C - 1), level: Math.min(C, 200), storage, start: (g) => g.win.__ev(`openPlanet(); startPlanet("${t}")`) }, pol);
        if (r.errors.length) console.log("ERRORE", r.errors[0]);
        if (r.result === "VINTO") w++; wv += r.wave; mb += +r.g.win.__ev("pw ? pw.mb : 0") || 0;
        const st = r.g.win.__start || [], cl = r.g.win.__clr || [];
        for (const [n, tc] of cl) if (st[n] != null) clear[n].push(tc - st[n]);
      }
      row.push(`${pol}: ${w}/${N} (ondata ${(wv / N).toFixed(1)}, mini-boss ${(mb / N).toFixed(1)})`);
    }
    console.log("planet", PL, "(diff " + D + ", campagna " + C + ")", t.padEnd(8), "|", row.join(" | "));
    if (SEQ) console.log("  pulizia per ondata (mediana / 75%, s):", clear.slice(1, 20).map((a, i) => (i + 1) + ":" + (a.length ? Math.round(pct(a, 0.5)) + "/" + Math.round(pct(a, 0.75)) : "–")).join(" "));
  }
}
