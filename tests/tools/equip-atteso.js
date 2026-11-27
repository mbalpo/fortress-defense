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
// Equipaggiamento al massimo (26/11/2026, § 15 “Ancestrale+N”): 6 pezzi ancestrali +N (dalla 1.29.0 il +N è nel gioco: gear.eq.<pezzo>.p),
// ciascuno con i Moduli ancestrali più utili del suo pool, tanti quanti gli slot (stessa scala di valori della strategia)
const slotsAt = (N) => 5 + (N >= 1) + (N >= 5) + (N >= 10);
function gearMax(N) {
  const g = makeGame({ patch: EV, cleared: 30, level: 30, storage: { "fortress-progress-v1": JSON.stringify({ cleared: 30, seen: [] }) } });
  return JSON.parse(g.win.__ev(`(() => {
    const PRI = { 2: 9, 1: 8, 7: 8, 18: 7, 6: 6, 13: 6, 3: 6, 20: 6, 9: 5, 5: 5, 8: 3, 19: 2, 11: 7, 10: 4, 14: 4, 16: 4, 15: 3,
      28: 6, 23: 4, 24: 4, 25: 4, 26: 4, 27: 4, 22: 6, 21: 4, 29: 5, 30: 7 };
    const val = (fx) => fx === 4 || fx === 12 || fx === 17 ? 48 : PRI[fx] + 40;
    const eq = {}; for (const pc of PIECE_IDS) eq[pc] = Object.assign({ r: 4, m: [...PIECES[pc].pool].sort((a, b) => val(b) - val(a)).slice(0, ${slotsAt(N)}).map((fx) => [fx, 4]) }, ${N} ? { p: ${N} } : {});
    return JSON.stringify({ pcs: {}, mods: {}, eq, lock: {} });
  })()`));
}
module.exports = { gearFor, gearMax, slotsAt };

// Ancestrale+N (26/11/2026, § 15): vittorie per avere un pezzo (l’arma) e un set di 6 pezzi a +N, con i drop veri (2 pezzi a vittoria, tipo e rarità
// dalla tabella del gioco) e la fusione ideale (5 uguali → rarità successiva appena possibile). Un pezzo +N richiede 1 + N(N+1)/2 ancestrali base del suo tipo.
// Uso: node tests/tools/equip-atteso.js --ancestrale [simulazioni=400]
if (require.main === module && process.argv[2] === "--ancestrale") {
  const RUNS = +(process.argv[3] || 400), g = makeGame({ patch: EV });
  const TAB = JSON.parse(g.win.__ev("JSON.stringify(DROP_RARITY)")), BASE = JSON.parse(g.win.__ev("JSON.stringify(Object.fromEntries(PIECE_IDS.map((p) => [p, [PIECES[p].stat, PIECES[p].base[4]]])))"));
  const NS = [0, 1, 2, 3, 5, 10], need = (N) => 1 + N * (N + 1) / 2, med = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
  const pct = (x) => (Math.round(x * 10) / 10).toString().replace(".", ",") + "%";
  console.log("Potenza della statistica base (set di 6 pezzi allo stesso passo, prima dei Moduli) e slot per i Moduli:");
  for (const N of NS) {
    const tot = { pdmg: 0, hp: 0, tdmg: 0 }; for (const [st, b] of Object.values(BASE)) tot[st] += b * (1 + 0.2 * N);
    console.log(`  ${N ? "+" + N : "ancestrale"}`.padEnd(13), `guardiano +${pct(tot.pdmg)} · barriera +${pct(tot.hp)} · torrette +${pct(tot.tdmg)} · slot ${slotsAt(N)} · ancestrali base per pezzo ${need(N)}`);
  }
  for (const D of [100, 140, 180]) {
    const w = TAB.reduce((a, [d, x]) => D >= d ? x : a, TAB[0][1]), tw = w.reduce((a, b) => a + b, 0);
    const one = Object.fromEntries(NS.map((N) => [N, []])), set = Object.fromEntries(NS.map((N) => [N, []]));
    for (let run = 0; run < RUNS; run++) {
      const c = [...Array(6)].map(() => [0, 0, 0, 0, 0]); let v = 0, done1 = 0, doneS = 0;
      while (doneS < NS.length && v < 20000) {
        v++;
        for (let k = 0; k < 2; k++) {
          const t = Math.floor(Math.random() * 6); let x = Math.random() * tw, r = 0; while ((x -= w[r]) >= 0) r++;
          c[t][r]++; for (let q = 0; q < 4; q++) while (c[t][q] >= 5) { c[t][q] -= 5; c[t][q + 1]++; }
        }
        while (done1 < NS.length && c[0][4] >= need(NS[done1])) { one[NS[done1]].push(v); done1++; }
        while (doneS < NS.length && c.every((x) => x[4] >= need(NS[doneS]))) { set[NS[doneS]].push(v); doneS++; }
      }
    }
    console.log(`Drop alla difficoltà ${D} (tabella ${w.join("/")}), ${RUNS} simulazioni, mediane delle vittorie:`);
    console.log("  un pezzo (arma):", NS.map((N) => (N ? "+" + N : "ancestrale") + " " + med(one[N])).join(" · "));
    console.log("  set di 6 pezzi: ", NS.map((N) => (N ? "+" + N : "ancestrale") + " " + med(set[N])).join(" · "));
  }
}
if (require.main === module && process.argv[2] !== "--ancestrale") {
  const LVS = process.argv[2].split(",").map(Number), VIT = +(process.argv[3] || 1.5);
  for (const L of LVS) {
    const gear = gearFor(L, VIT, 1), g = makeGame({ patch: EV, cleared: L - 1, level: L, storage: { "fortress-progress-v1": JSON.stringify({ cleared: L - 1, seen: [], gear }) } });
    const s = JSON.parse(g.win.__ev("JSON.stringify(gearStats(progress.gear))")), R = ["C", "R", "E", "L", "A"];
    const eq = Object.entries(gear.eq).map(([pc, e]) => pc + " " + R[e.r] + "(" + e.m.map(([fx, r]) => fx + R[r]).join(",") + ")").join(" · ");
    console.log("livello", L, "| guardiano +" + Math.round(s.pdmg * 100) + "% barriera +" + Math.round(s.hp * 100) + "% torri +" + Math.round(s.tdmg * 100) + "% | " + eq);
  }
}
