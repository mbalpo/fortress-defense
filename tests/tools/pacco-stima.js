// Stime della campagna a 400 livelli (DESIGN.md § 16 “Campagna a 400 livelli” e § 17 “Pacco regalo”, decisioni del 26/11/2026): conti attesi, nessuna partita.
// 1. Pacco regalo: Standard dal 61, Epica dal 31, una volta per livello al 60%; premio 50% frammenti (5 Standard, 10 Epica, prima di M) · 20% pezzo · 20% Modulo
//    · 8% 5 ◆ · 2% 1 ✦; ogni livello giocato una volta, pacco preso con probabilità PRESA.
// 2. ✦ attesi in Epica a 400 livelli: boss finale 1 a vittoria (40 boss), mini-boss 10% ciascuno con al massimo 1 per livello dai mini-boss (1 − 0,9³), più il pacco.
// 3. ◆ con la cupola al 100%, 75%, 50%: Standard dal 31 (1 al primo completamento + 1 con la cupola al 100%), Epica 2 + 2 per livello; confronto con l’albero (1907 ◆, 188 ✦).
// Uso: node tests/tools/pacco-stima.js [livelli=400]
const MAXL = +(process.argv[2] || 400), P = 0.6, SHARE = { frag: 0.5, pc: 0.2, mod: 0.2, seal: 0.08, major: 0.02 };
const TREE = { seals: 1907, majors: 188 };
const f1 = (x) => (Math.round(x * 10) / 10).toString().replace(".", ",");
const std = Math.max(0, MAXL - 60), epic = Math.max(0, MAXL - 30);   // livelli con il pacco: Standard 61..MAXL, Epica 31..MAXL
console.log(`Pacco regalo su ${MAXL} livelli (Standard ${std} livelli dal 61, Epica ${epic} dal 31, probabilità ${P * 100}%):`);
const gift = {};
for (const presa of [1, 0.5]) {
  const n = (std + epic) * P * presa, fr = (std * 5 + epic * 10) * P * presa * SHARE.frag;
  gift[presa] = { n, pc: n * SHARE.pc, mod: n * SHARE.mod, seals: n * SHARE.seal * 5, majors: n * SHARE.major, fr, majorsEpic: epic * P * presa * SHARE.major };
  const g = gift[presa];
  console.log(`  presa ${presa * 100}%: pacchi ${f1(g.n)} · pezzi ${f1(g.pc)} · Moduli ${f1(g.mod)} · ◆ ${f1(g.seals)} · ✦ ${f1(g.majors)} (in Epica ${f1(g.majorsEpic)}) · frammenti base ${f1(g.fr)} (prima di M)`);
}
const bosses = Math.floor(MAXL / 10), mini = MAXL * (1 - 0.9 ** 3);
console.log(`✦ in Epica a ${MAXL} livelli, un passaggio: boss finali ${bosses} + mini-boss ${f1(mini)} = ${f1(bosses + mini)}; servono ${TREE.majors} (mancano ${f1(TREE.majors - bosses - mini)})`);
for (const presa of [1, 0.5]) {
  const t = bosses + mini + gift[presa].majors;
  console.log(`  con il pacco (Standard ed Epica) presa ${presa * 100}%: ${f1(t)} (mancano ${f1(Math.max(0, TREE.majors - t))}, circa ${Math.ceil(Math.max(0, TREE.majors - t) / (1 + (1 - 0.9 ** 3)))} rigiocate di un boss finale con i suoi mini-boss)`);
}
console.log(`◆ con la cupola al 100% / 75% / 50% (quota dei livelli chiusi con il premio della cupola), Standard 31-${MAXL} ed Epica 1-${MAXL}:`);
for (const k of [1, 0.75, 0.5]) {
  const s = (MAXL - 30) * (1 + k), e = MAXL * (2 + 2 * k);
  console.log(`  ${k * 100}%: Standard ${f1(s)} + Epica ${f1(e)} = ${f1(s + e)}; con il pacco preso al 100% ${f1(s + e + gift[1].seals)}, al 50% ${f1(s + e + gift[0.5].seals)}; albero ${TREE.seals}: margine senza pacco ${f1(s + e - TREE.seals)}`);
}
