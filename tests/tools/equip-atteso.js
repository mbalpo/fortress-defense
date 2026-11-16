// Equipaggiamento "atteso" prima di giocare il livello L (DESIGN.md § 15): i drop veri del gioco (rollDrops) per le vittorie dal 30 a L − 1,
// VIT vittorie per livello in media (primo completamento più qualche rigiocata), poi una strategia semplice da giocatore:
// fonde i pezzi uguali, equipaggia il pezzo più raro, installa i Moduli migliori, fonde i Moduli che restano e ripete.
// Uso come modulo: gearFor(L, vit, seed) → oggetto gear da mettere in progress.gear. Da riga di comando: node tests/tools/equip-atteso.js <livelli> [vit]
const { makeGame } = require("../bot.js");
const EV = (h) => h.replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();");

// valore di un Modulo per la strategia (più alto = più utile al bot); 0 = non lo installa
const STRATEGY = `(() => {
  const PRI = { 2: 9, 1: 8, 7: 8, 18: 7, 6: 6, 13: 6, 3: 6, 20: 6, 9: 5, 5: 5, 8: 3, 19: 2, 11: 7, 10: 4, 14: 4, 16: 4, 15: 3,
    28: 6, 23: 4, 24: 4, 25: 4, 26: 4, 27: 4, 22: 6, 21: 4, 29: 5, 30: 7 };
  const val = (fx, r) => { const neg = fx === 4 || fx === 12 || fx === 17; return neg ? (r >= 3 ? 8 + r * 10 : 0) : PRI[fx] + r * 10; };
  const g = progress.gear;
  for (let round = 0; round < 6; round++) {
    for (const pc of PIECE_IDS) {
      for (let r = 0; r < 4; r++) while (fusePieces(pc, r)) {}
      for (let r = 4; r >= 0; r--) if (qty(g.pcs, pcKey(pc, r)) && (!g.eq[pc] || g.eq[pc].r < r)) { equipPiece(pc, r); break; }
      const e = g.eq[pc]; if (!e) continue;
      // installa o sostituisce: per ogni Modulo in inventario, dal più utile, se batte il peggiore installato
      const inv = () => Object.entries(g.mods).filter(([k]) => k.startsWith(pc + ":")).map(([k]) => { const [, r, fx] = k.split(":").map(Number); return { r: +k.split(":")[1], fx: +k.split(":")[2] }; })
        .filter((m) => val(m.fx, m.r) > 0).sort((a, b) => val(b.fx, b.r) - val(a.fx, a.r));
      for (const m of inv()) {
        if (e.m.some((x) => x[0] === m.fx)) {
          const i = e.m.findIndex((x) => x[0] === m.fx); if (e.m[i][1] < m.r) { removeMod(pc, i); installMod(pc, m.r, m.fx); }
          continue;
        }
        if (e.m.length < e.r + 1) { installMod(pc, m.r, m.fx); continue; }
        let wi = 0; e.m.forEach((x, i) => { if (val(x[0], x[1]) < val(e.m[wi][0], e.m[wi][1])) wi = i; });
        if (val(e.m[wi][0], e.m[wi][1]) < val(m.fx, m.r)) { removeMod(pc, wi); installMod(pc, m.r, m.fx); }
      }
      // fonde i Moduli rimasti in inventario, dai meno utili, a gruppi di 5 della stessa rarità
      for (let r = 0; r < 4; r++) for (;;) {
        const list = Object.entries(g.mods).filter(([k]) => k.startsWith(pc + ":" + r + ":")).flatMap(([k, n]) => Array(n).fill(+k.split(":")[2]))
          .sort((a, b) => val(a, r) - val(b, r));
        if (list.length < 5) break;
        const sel = {}; list.slice(0, 5).forEach((fx) => { sel[fx] = (sel[fx] || 0) + 1; }); if (fuseMods(pc, r, sel) == null) break;
      }
    }
  }
  return JSON.stringify(g);
})()`;

function gearFor(L, vit = 1.5, seed = 1, epic = 0) {   // epic = livelli di Epica completati (1.12.0), un drop ciascuno
  const g = makeGame({ patch: EV, seed, cleared: Math.max(30, L - 1), level: Math.max(30, L - 1), storage: { "fortress-progress-v1": JSON.stringify({ cleared: Math.max(30, L - 1), seen: [] }) } });
  const ev = g.win.__ev;
  let acc = 0;
  for (let lv = 30; lv < L; lv++) { acc += vit; while (acc >= 1) { acc -= 1; ev(`rollDrops(diffOf(${lv}, false), false)`); } }
  for (let lv = 1; lv <= epic; lv++) ev(`rollDrops(diffOf(${lv}, true), true)`);
  return JSON.parse(ev(STRATEGY));
}
module.exports = { gearFor };

if (require.main === module) {
  const LVS = process.argv[2].split(",").map(Number), VIT = +(process.argv[3] || 1.5);
  for (const L of LVS) {
    const gear = gearFor(L, VIT, 1), g = makeGame({ patch: EV, cleared: L - 1, level: L, storage: { "fortress-progress-v1": JSON.stringify({ cleared: L - 1, seen: [], gear }) } });
    const s = JSON.parse(g.win.__ev("JSON.stringify(gearStats(progress.gear))")), R = ["C", "R", "E", "L", "A"];
    const eq = Object.entries(gear.eq).map(([pc, e]) => pc + " " + R[e.r] + "(" + e.m.map(([fx, r]) => fx + R[r]).join(",") + ")").join(" · ");
    console.log("livello", L, "| guardiano +" + Math.round(s.pdmg * 100) + "% barriera +" + Math.round(s.hp * 100) + "% torri +" + Math.round(s.tdmg * 100) + "% | " + eq);
  }
}
