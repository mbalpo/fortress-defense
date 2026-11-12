const { play } = require("../bot.js");
const lv = JSON.parse(process.argv[2]), L = +process.argv[3], N = +(process.argv[4] || 30);
const full = { hp0: 0.35, hpSlope: 0.065, hpSlopeHi: 0.008, dmg: 0.01, speed: 0.002, count: 0.005, ...lv };
const patch = (h) => h.replace(/const LV = \{[^}]+\};/, "const LV = " + JSON.stringify(full) + ";");
let reach = 0, win = 0;
for (const pol of ["random", "smart"]) for (let seed = 1; seed <= N; seed++) { const r = play({ seed, patch, cleared: L - 1, level: L }, pol, "Enter"); if (r.wave >= 20) { reach++; if (r.result === "VINTO") win++; } }
console.log(`${JSON.stringify(lv)} | liv ${L}: vincono ${(win / (2 * N) * 100).toFixed(0)}% (${win}/${2 * N}), arrivano all’ondata 20: ${reach}`);
