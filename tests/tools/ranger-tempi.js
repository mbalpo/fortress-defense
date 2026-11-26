// Tempi per sbloccare i ranger e portarli al livello 10 (DESIGN.md § 17): calendario simulato del giocatore di riferimento.
// Giocatore: GIORNI giorni su 7 (a caso), 2 partite al giorno sul tipo del giorno (×2); ricompensa media per tipo = quota della partita piena
// (0,7 × ondate ÷ 20 + 0,3 × mini-boss ÷ 3) misurata con i bot (tests/tools/planet.js, livello 1, 1.16.0); frammenti divisi a caso tra i due ranger del tipo,
// tutti all’altro se uno è al 10. Uso: node tests/tools/ranger-tempi.js [F=10] [T=200] [GIORNI=5] [simulazioni=400]
// Pacco regalo (1.21.0, § 17): PACCO=<livelli di Standard al giorno> e PACCO_EPICA=<livelli di Epica al giorno>, negli stessi giorni di gioco: ogni livello al 25%
// un pacco preso (il giocatore lo prende sempre) con 5 frammenti (10 in Epica) a un ranger a caso tra i 10 non al livello 10.
// Regole del 26/11/2026 (§ 17) con NUOVE=1: livello massimo MAX (default 20), M = 1 + 0,1 × ranger al 10 su partite e pacco, bonus di completamento 0,5 × F × M
// con probabilità di vittoria W per tipo (JSON, default: bot al livello 1, misura del 26/11/2026), pacco al 60% con il 50% di frammenti, preso con probabilità PRESA (default 1).
const PACCO = +(process.env.PACCO || 0), PACCO_E = +(process.env.PACCO_EPICA || 0);
const NUOVE = !!+(process.env.NUOVE || 0), MAX = +(process.env.MAX || (NUOVE ? 20 : 10)), PRESA = process.env.PRESA === undefined ? 1 : +process.env.PRESA;
const W = { fire: 0, force: 0, electric: 0, energy: 0, physical: 0 }; if (process.env.W) Object.assign(W, JSON.parse(process.env.W));
const F = +(process.argv[2] || 10), T = +(process.argv[3] || 200), DAYS = +(process.argv[4] || 5), RUNS = +(process.argv[5] || 400);
const Q = { fire: 0.69, force: 0.87, electric: 0.9, energy: 0.57, physical: 0.19 };   // quota media per partita, bot al livello 1 (1.16.0)
if (process.env.Q) Object.assign(Q, JSON.parse(process.env.Q));
const WEEK = [null, "physical", "force", "energy", "electric", "fire", null], TYPES = Object.keys(Q);
const total = (L) => T * (1 + 0.5 * (L - 1)), lvOf = (f) => { let L = 0; while (L < MAX && f >= total(L + 1)) L++; return L; };
const med = (a) => { const b = [...a].sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };
const res = { unlockType: Object.fromEntries(TYPES.map((t) => [t, []])), unlockAll: [], maxAll: [], maxType: Object.fromEntries(TYPES.map((t) => [t, []])), tenAll: [], pacco: [] };
for (let run = 0; run < RUNS; run++) {
  const fr = {}; for (const t of TYPES) fr[t] = [0, 0];
  const got = {}, gotMax = {}; let all = null, allMax = null, allTen = null, fromGift = 0;
  const M = () => NUOVE ? 1 + 0.1 * TYPES.reduce((a, u) => a + fr[u].filter((x) => lvOf(x) >= 10).length, 0) : 1;
  for (let day = 0; day < 365 * 15 && allMax === null; day++) {
    const wd = day % 7;
    if (day % 7 === 0) var playDays = new Set([...Array(7).keys()].sort(() => Math.random() - 0.5).slice(0, DAYS));
    if (!playDays.has(wd)) continue;
    const t = WEEK[wd] || TYPES[Math.floor(Math.random() * 5)];
    for (let g = 0; g < 2; g++) {
      const won = NUOVE && Math.random() < W[t];   // bonus di completamento: la quota resta la media misurata, il bonus va alle partite vinte
      const n = Math.round(F * M() * (Q[t] + (won ? 0.5 : 0)) * 2), a = lvOf(fr[t][0]) >= MAX, b = lvOf(fr[t][1]) >= MAX;
      const na = a && !b ? 0 : b && !a ? n : Math.round(n * Math.random()); fr[t][0] += na; fr[t][1] += n - na;
    }
    for (const [n, k] of [[PACCO, 5], [PACCO_E, 10]]) for (let i = 0; i < n; i++) {   // pacchi regalo dei livelli di campagna del giorno
      if (Math.random() >= (NUOVE ? 0.6 : 0.25)) continue;
      if (NUOVE && (Math.random() >= PRESA || Math.random() >= 0.5)) continue;   // non preso, o premio diverso dai frammenti (50/20/20/8/2)
      const open = TYPES.flatMap((u) => [0, 1].filter((j) => lvOf(fr[u][j]) < MAX).map((j) => [u, j])); if (!open.length) continue;
      const [u, j] = open[Math.floor(Math.random() * open.length)], add = Math.round(k * M()); fr[u][j] += add; fromGift += add;
    }
    for (const u of TYPES) {
      if (got[u] == null && fr[u][0] >= T && fr[u][1] >= T) got[u] = day;
      if (gotMax[u] == null && lvOf(fr[u][0]) >= MAX && lvOf(fr[u][1]) >= MAX) gotMax[u] = day;
    }
    if (all === null && TYPES.every((k) => got[k] != null)) all = day;
    if (allMax === null && TYPES.every((k) => gotMax[k] != null)) allMax = day;
    if (allTen === null && TYPES.every((u) => lvOf(fr[u][0]) >= 10 && lvOf(fr[u][1]) >= 10)) allTen = day;
  }
  res.tenAll.push(allTen ?? 99999); res.pacco.push(fromGift / Math.max(1, TYPES.reduce((a, u) => a + fr[u][0] + fr[u][1], 0)));
  for (const t of TYPES) { res.unlockType[t].push(got[t] ?? 9999); res.maxType[t].push(gotMax[t] ?? 9999); }
  res.unlockAll.push(all ?? 9999); res.maxAll.push(allMax ?? 9999);
}
const mo = (d) => d >= 9999 ? "oltre il limite della simulazione" : (d / 30.4).toFixed(1).replace(".", ",") + " mesi";
console.log(`F = ${F}, T = ${T}, ${DAYS} giorni su 7, 2 partite sul tipo del giorno (×2), ${RUNS} simulazioni (mediane)` + (PACCO || PACCO_E ? `; pacco regalo: ${PACCO} livelli di Standard e ${PACCO_E} di Epica al giorno` : ""));
for (const t of TYPES) console.log("  " + t.padEnd(9), "quota " + String(Q[t]).replace(".", ",").padEnd(5), "| sbloccati tutti e due:", mo(med(res.unlockType[t])).padEnd(10), "| tutti e due al 10:", mo(med(res.maxType[t])));
if (NUOVE) console.log(`  regole del 26/11/2026: massimo ${MAX}, M, bonus di completamento (W ${JSON.stringify(W)}), pacco al 60% preso al ${Math.round(PRESA * 100)}%`);
for (const t of TYPES) res.unlockType[t].forEach((d, i, a) => { if (d === 9999) a[i] = 99999; });
console.log("  tutti e 10 sbloccati:", mo(med(res.unlockAll)), "| tutti e 10 al livello 10:", mo(med(res.tenAll)) + (MAX > 10 ? " | tutti e 10 al livello " + MAX + ": " + mo(med(res.maxAll)) : "")
  + (PACCO || PACCO_E ? " | frammenti dal pacco: " + Math.round(med(res.pacco) * 100) + "%" : ""));
