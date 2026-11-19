// Tempi per sbloccare i ranger e portarli al livello 10 (DESIGN.md § 17): calendario simulato del giocatore di riferimento.
// Giocatore: GIORNI giorni su 7 (a caso), 2 partite al giorno sul tipo del giorno (×2); ricompensa media per tipo = quota della partita piena
// (0,7 × ondate ÷ 20 + 0,3 × mini-boss ÷ 3) misurata con i bot (tests/tools/planet.js, livello 1, 1.16.0); frammenti divisi a caso tra i due ranger del tipo,
// tutti all’altro se uno è al 10. Uso: node tests/tools/ranger-tempi.js [F=10] [T=200] [GIORNI=5] [simulazioni=400]
const F = +(process.argv[2] || 10), T = +(process.argv[3] || 200), DAYS = +(process.argv[4] || 5), RUNS = +(process.argv[5] || 400);
const Q = { fire: 0.69, force: 0.87, electric: 0.9, energy: 0.57, physical: 0.19 };   // quota media per partita, bot al livello 1 (1.16.0)
if (process.env.Q) Object.assign(Q, JSON.parse(process.env.Q));
const WEEK = [null, "physical", "force", "energy", "electric", "fire", null], TYPES = Object.keys(Q);
const total = (L) => T * (1 + 0.5 * (L - 1)), lvOf = (f) => { let L = 0; while (L < 10 && f >= total(L + 1)) L++; return L; };
const med = (a) => { const b = [...a].sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };
const res = { unlockType: Object.fromEntries(TYPES.map((t) => [t, []])), unlockAll: [], maxAll: [], maxType: Object.fromEntries(TYPES.map((t) => [t, []])) };
for (let run = 0; run < RUNS; run++) {
  const fr = {}; for (const t of TYPES) fr[t] = [0, 0];
  const got = {}, gotMax = {}; let all = null, allMax = null;
  for (let day = 0; day < 365 * 6 && allMax === null; day++) {
    const wd = day % 7;
    if (day % 7 === 0) var playDays = new Set([...Array(7).keys()].sort(() => Math.random() - 0.5).slice(0, DAYS));
    if (!playDays.has(wd)) continue;
    const t = WEEK[wd] || TYPES[Math.floor(Math.random() * 5)];
    for (let g = 0; g < 2; g++) {
      const n = Math.round(F * Q[t] * 2), a = lvOf(fr[t][0]) >= 10, b = lvOf(fr[t][1]) >= 10;
      const na = a && !b ? 0 : b && !a ? n : Math.round(n * Math.random()); fr[t][0] += na; fr[t][1] += n - na;
    }
    if (got[t] == null && fr[t][0] >= T && fr[t][1] >= T) got[t] = day;
    if (gotMax[t] == null && lvOf(fr[t][0]) >= 10 && lvOf(fr[t][1]) >= 10) gotMax[t] = day;
    if (all === null && TYPES.every((k) => got[k] != null)) all = day;
    if (allMax === null && TYPES.every((k) => gotMax[k] != null)) allMax = day;
  }
  for (const t of TYPES) { res.unlockType[t].push(got[t] ?? 9999); res.maxType[t].push(gotMax[t] ?? 9999); }
  res.unlockAll.push(all ?? 9999); res.maxAll.push(allMax ?? 9999);
}
const mo = (d) => d >= 9999 ? "oltre 6 anni" : (d / 30.4).toFixed(1).replace(".", ",") + " mesi";
console.log(`F = ${F}, T = ${T}, ${DAYS} giorni su 7, 2 partite sul tipo del giorno (×2), ${RUNS} simulazioni (mediane)`);
for (const t of TYPES) console.log("  " + t.padEnd(9), "quota " + String(Q[t]).replace(".", ",").padEnd(5), "| sbloccati tutti e due:", mo(med(res.unlockType[t])).padEnd(10), "| tutti e due al 10:", mo(med(res.maxType[t])));
console.log("  tutti e 10 sbloccati:", mo(med(res.unlockAll)), "| tutti e 10 al livello 10:", mo(med(res.maxAll)));
