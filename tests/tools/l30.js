const { play } = require("../bot.js");
// dove muoiono i bot al livello 30 e quanti arrivano all'ondata 20
let reach = 0, win = 0, below10 = 0, N = 30, waves = [];
for (const pol of ["random", "smart"]) for (let seed = 1; seed <= N; seed++) {
  const L = +(process.argv[2] || 30); const r = play({ seed, cleared: L - 1, level: L }, pol, "Enter"); waves.push(r.wave);
  if (r.wave >= 20) { reach++; if (r.result === "VINTO") win++; } else if (r.wave < 10) below10++;
}
const hist = {}; waves.forEach((w) => { const k = w >= 20 ? "20" : w >= 15 ? "15-19" : w >= 10 ? "10-14" : "<10"; hist[k] = (hist[k] || 0) + 1; });
console.log("livello " + (process.argv[2] || 30) + ", 60 partite → arrivano all’ondata 20:", reach, "| di questi vincono:", win, "| morte per fascia di ondata:", JSON.stringify(hist));
