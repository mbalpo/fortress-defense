// Carte offerte e prese dai bot (1.24.0, DESIGN.md § 11): chain per offerta e prese per partita, divise per fase (ondate 1-6, 7-13, 14-20),
// chain “alternativa” (lv1 di una chain quando l’entità ha già la lv1 dell’altra), combo offerte e prese, ripetute dopo il rinnovo.
// I bot non hanno il Modulo 21: con FORCE=1 a ogni offerta dopo l’ondata si fa un rinnovo forzato (le carte cambiano, quindi anche la partita).
// Con BEFORE=1 si misura il sorteggio di prima della 1.24.0 (peso 0,4 per tutte le chain, rinnovo che può ripetere le carte).
// Con FULL=1 pool completo (senza carte bloccate dall’albero), altrimenti pool libero del livello.
// Uso: [BEFORE=1] [FORCE=1] [FULL=1] node tests/tools/carte-stat.js <livelli> [partite per bot, default 20] [primo seme, default 1]
const { play } = require("../bot.js");
const LVS = process.argv[2].split(",").map(Number), N = +(process.argv[3] || 20), S0 = +(process.argv[4] || 1);
const reps = [];
if (process.env.FULL) reps.push(["const TREE_LOCKS = {", "const TREE_LOCKS = {}, _TL = {"]);
if (process.env.BEFORE) reps.push(["const CHAIN_ALT = 0.5;", "const CHAIN_ALT = 1;"], ["rollOptions(options.length, options)", "rollOptions(options.length)"]);
reps.push(
  ["function rollOptions(n, excl) {", `function rollOptions(n, excl) { const o = rollOptions0(n, excl); if (window.__hook && !window.__inRef) window.__hook.offer(o, Array.isArray(rewards) && bonusLeft > 0, wave); return o; }
function rollOptions0(n, excl) {`],
  ["function refreshCards() {", `function refreshCards() { window.__inRef = true; const a = options.slice(); const r = refreshCards0(); window.__inRef = false; if (r && window.__hook) window.__hook.refresh(a, options); return r; }
function refreshCards0() {`],
  ["function applyOption(opt) {", `function applyOption(opt) { if (window.__hook) window.__hook.take(opt, wave); applyOption0(opt); }
function applyOption0(opt) {`],
  ["if (!options.length) { bonusLeft = 0; startWave(wave + 1); } else { state = \"upgrade\"; cardsShown(); }", "if (!options.length) { bonusLeft = 0; startWave(wave + 1); } else { state = \"upgrade\"; if (window.__force) { refreshLeft = 1; refreshCards(); } cardsShown(); }"],
);
const patch = (h) => reps.reduce((a, [x, y]) => { if (!a.includes(x)) throw new Error("manca " + x); return a.replace(x, y); }, h);
const phase = (w) => w <= 6 ? 0 : w <= 13 ? 1 : 2;
// la lv1 di una chain quando l’entità ha già la lv1 di un’altra sua chain
const alt = (o) => o.kind === "up" && o.up.cat === "chain" && o.up.lv === 1 && o.who.def.ups.some((v) => v.cat === "chain" && v.lv === 1 && v.chain !== o.up.chain && (o.who.up[v.id] || 0) > 0);
const key = (o) => o.kind === "new" ? "n:" + o.id : o.who.id + ":" + o.up.id;
const pct = (a, b) => b ? (100 * a / b).toFixed(1).replace(".", ",") + "%" : "—";
const f2 = (a, b) => b ? (a / b).toFixed(2).replace(".", ",") : "—";
for (const L of LVS) {
  // per fase: offerte, chain offerte, alternative offerte, combo offerte; prese: chain, alternative, combo
  const off = [0, 1, 2].map(() => ({ n: 0, ch: 0, alt: 0, co: 0 })), tk = [0, 1, 2].map(() => ({ ch: 0, alt: 0, co: 0 }));
  const rf = { n: 0, rep: 0, cards: 0, repCards: 0 }; let games = 0, wins = 0, bossCh = 0, bossN = 0;
  for (const pol of ["random", "smart"])
    for (let seed = S0; seed < S0 + N; seed++) {
      const r = play({ seed, patch, cleared: L - 1, level: L, start(g) {
        const w = g.win; w.__force = !!process.env.FORCE;
        w.__hook = {
          offer(o, boss, W) { if (boss) { bossN++; if (o[0] && o[0].kind === "up" && o[0].up.cat === "chain") bossCh++; return; }
            const p = off[phase(W)]; p.n++; for (const c of o) { if (c.kind !== "up") continue; if (c.up.cat === "chain") p.ch++; if (alt(c)) p.alt++; if (c.up.cat === "combo") p.co++; } },
          take(o, W) { if (o.kind !== "up") return; const p = tk[phase(W)]; if (o.up.cat === "chain") p.ch++; if (alt(o)) p.alt++; if (o.up.cat === "combo") p.co++; },
          refresh(a, b) { const A = a.map(key), d = b.filter((o) => A.includes(key(o))).length; rf.n++; rf.cards += b.length; rf.repCards += d; if (d) rf.rep++; },
        };
        g.key("Enter");
      } }, pol);
      games++; if (r.result === "VINTO") wins++;
    }
  const tot = (k, arr) => arr.reduce((a, p) => a + p[k], 0);
  console.log(`livello ${L}${process.env.FULL ? " (pool completo)" : " (pool libero)"}${process.env.BEFORE ? " PRIMA" : " DOPO"}${process.env.FORCE ? " con rinnovo forzato" : ""} · ${games} partite, vinte ${pct(wins, games)}`);
  console.log("  chain per offerta (fasi 1-6 / 7-13 / 14-20 · tutte):", off.map((p) => f2(p.ch, p.n)).join(" / "), "·", f2(tot("ch", off), tot("n", off)),
    "| di cui lv1 alternativa:", off.map((p) => f2(p.alt, p.n)).join(" / "), "·", f2(tot("alt", off), tot("n", off)));
  console.log("  chain prese per partita (fasi · tutte):", tk.map((p) => f2(p.ch, games)).join(" / "), "·", f2(tot("ch", tk), games),
    "| lv1 alternativa prese:", f2(tot("alt", tk), games));
  console.log("  combo offerte per partita:", f2(tot("co", off), games), "· prese:", f2(tot("co", tk), games), "| mini-boss: carte", bossN, "di cui chain", pct(bossCh, bossN));
  if (rf.n) console.log("  rinnovi:", rf.n, "· con almeno una ripetuta:", pct(rf.rep, rf.n), "· carte ripetute:", pct(rf.repCards, rf.cards));
}
