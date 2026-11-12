const { play } = require("../bot.js");
const reps = JSON.parse(process.argv[3] || "[]");
const patch = (h) => reps.reduce((a, [x, y]) => { if (!a.includes(x)) throw new Error("manca " + x); return a.replace(x, y); }, h);
for (const L of process.argv[2].split(",").map(Number)) {
  const row = [];
  for (const pol of ["random", "smart"]) { let w = 0, s = 0; for (let seed = 1; seed <= 12; seed++) { const r = play({ seed, patch, cleared: L - 1, level: L }, pol, "Enter"); if (r.result === "VINTO") w++; s += r.wave; } row.push(`${pol}: ${w}/12 (ondata media ${(s / 12).toFixed(1)})`); }
  console.log("livello", String(L).padStart(2), "|", row.join(" | "));
}
