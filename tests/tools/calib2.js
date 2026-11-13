// Uso: node tests/tools/calib2.js <livelli> [sostituzioni JSON] [partite per bot, default 12] [primo seme, default 1]
// Pool completo (senza carte bloccate dall’albero dei Sigilli): sostituzioni '[["const TREE_LOCKS = {","const TREE_LOCKS = {}, _TL = {"]]'
const { play } = require("../bot.js");
const reps = JSON.parse(process.argv[3] || "[]"), N = +(process.argv[4] || 12), S0 = +(process.argv[5] || 1);
const patch = (h) => reps.reduce((a, [x, y]) => { if (!a.includes(x)) throw new Error("manca " + x); return a.replace(x, y); }, h);
for (const L of process.argv[2].split(",").map(Number)) {
  const row = [];
  for (const pol of ["random", "smart"]) { let w = 0, s = 0; for (let seed = S0; seed < S0 + N; seed++) { const r = play({ seed, patch, cleared: L - 1, level: L }, pol, "Enter"); if (r.result === "VINTO") w++; s += r.wave; } row.push(`${pol}: ${w}/${N} (ondata media ${(s / N).toFixed(1)})`); }
  console.log("livello", String(L).padStart(2), "|", row.join(" | "));
}
