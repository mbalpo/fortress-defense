const { play } = require("../bot.js");
const orig = "hp: 1500, speed: 14, r: 34, dmg: 14, boss: true, final: true";
const mk = (A, B, C) => `hp: ${A} * (1 + ${B} * (lv / 10 - 1)), speed: 14, r: 34, dmg: ${C}, boss: true, final: true`;
const vars = { "A 800, +150%/10 liv, danno 8": mk(800, 1.5, 8), "A 800, +250%/10 liv, danno 8": mk(800, 2.5, 8) };
const N = 24;
for (const [name, rep] of Object.entries(vars)) {
  const patch = (h) => { if (!h.includes(orig)) throw new Error("manca"); return h.replace(orig, rep); };
  const row = [];
  for (const L of [10, 20, 30]) { let reach = 0, win = 0; for (let seed = 1; seed <= N; seed++) { const r = play({ seed, patch, cleared: L - 1, level: L }, "smart", "Enter"); if (r.wave >= 20) { reach++; if (r.result === "VINTO") win++; } } row.push(`liv ${L}: ${win}/${reach}`); }
  console.log(name.padEnd(32), row.join(" | "));
}
