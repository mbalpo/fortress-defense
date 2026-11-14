const { makeGame, seeded } = require("./bot.js");
const P = (h, ...pairs) => pairs.reduce((a, [x, y]) => { if (!a.includes(x)) throw new Error("manca: " + x.slice(0, 60)); return a.replace(x, y); }, h);
const expose = (h) => P(h, ["requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__x = { rollOptions, maxedCount, getPlayer: () => player, getSlots: () => slots, state: () => state, towerCap, progress };\n})();"]);
const tank = (h, waves) => P(expose(h), ["domeHp: 100,", "domeHp: 1000000,"], ["const N_WAVES = 20;", `const N_WAVES = ${waves};`]);
const parseCards = (T) => { const ui = T.lastIndexOf("Scegli un potenziamento"); if (ui < 0) return null; const c = []; for (let i = ui + 1; i + 4 < T.length; i += 5) c.push({ head: T[i + 1], title: T[i + 2], note: T[i + 4] }); return c; };

// 1) tetto per livello completato + chain per livello
function capTest(cleared, level, expectPicks, expectMaxChainLv) {
  const patch = (h) => P(tank(h, 80), ["startTurrets: [],", 'startTurrets: ["sky"],']);
  const g = makeGame({ seed: 4, patch, cleared, level }); g.key("Enter"); g.frame(); const r = seeded(3);
  let screens = 0;
  for (let f = 0; f < 700000 && screens < 79; f++) {
    if (f % 90 === 0) g.tap(30 + r() * 300, 120);
    g.frame(); const T = g.texts, cards = parseCards(T);
    if (cards) { screens++; let i = cards.findIndex((c) => c.head.startsWith("Sky Guard")); if (i < 0) i = 0; g.key(String(i + 1)); }
    if (T.includes("Ricompensa mini-boss") && T.includes("Continua")) g.key("1");
    T.length = 0; if (["lost", "won"].includes(g.win.__x.state())) break;
  }
  const X = g.win.__x, s = X.getSlots().find((t) => t && t.id === "sky");
  const total = Object.values(s.up).reduce((a, b) => a + b, 0);
  const chains = s.def.ups.filter((u) => u.cat === "chain" && s.up[u.id]), maxChain = Math.max(0, ...chains.map((u) => u.lv));
  console.log(`livelli completati ${String(cleared).padStart(2)} (tetto ${cleared >= 20 ? 3 : cleared >= 10 ? 2 : 1}) → potenziamenti Sky Guard: ${total} (attesi ${expectPicks}) | livello torre ${s.level} | chain max lv ${maxChain} (≤ livello torre: ${maxChain <= s.level})`, g.errors.length ? g.errors[0] : "");
}
console.log("— tetto delle torri —");
capTest(0, 1, 3, 1); capTest(10, 11, 7, 2); capTest(20, 21, 12, 3);

// 2) mini-boss
function bossTest(level, label) {
  const patch = (h) => P(tank(h, 20), ["startTurrets: [],", 'startTurrets: ["rail","beam","hive","tesla"],'],
    ["META.startTurrets.slice(0, 4).forEach((id, i) => { slots[i] = makeShooter(TURRETS[id], SLOT_X[i], GROUND_Y - 14); });",
     "META.startTurrets.slice(0, 4).forEach((id, i) => { slots[i] = makeShooter(TURRETS[id], SLOT_X[i], GROUND_Y - 14); }); slots.forEach(s => { s.up.dmg = 3; });"]);
  const g = makeGame({ seed: 6, patch, cleared: level - 1, level }); g.key("Enter"); g.frame(); const r = seeded(2);
  let bossWaves = new Set(), bonus = 0, prevBonus = false, wave = 1, rewardWave = [];
  for (let f = 0; f < 200000; f++) {
    if (f % 90 === 0) g.tap(30 + r() * 300, 300);
    g.frame(); const T = g.texts;
    for (const s of T) { const m = /^Ondata (\d+)\/20$/.exec(s); if (m) wave = +m[1]; }
    if (T.includes("MINI-BOSS")) bossWaves.add(wave);
    const isB = T.includes("Ricompensa mini-boss"); if (isB && !prevBonus) { bonus++; rewardWave.push(wave); } prevBonus = isB;
    const cards = parseCards(T); if (cards) g.key("1");
    if (T.includes("Ricompensa mini-boss") && T.includes("Continua")) g.key("1");
    const done = T.includes("LIVELLO SUPERATO") || T.includes("CUPOLA DISTRUTTA"); T.length = 0; if (done) break;
  }
  console.log(label.padEnd(18), "mini-boss visti alle ondate:", [...bossWaves].join(",") || "nessuno", "| schermate ricompensa:", bonus, rewardWave.length ? "(dopo le ondate " + rewardWave.join(",") + ")" : "", g.errors.length ? g.errors[0] : "");
}
console.log("— mini-boss —");
bossTest(10, "livello 10"); bossTest(11, "livello 11"); bossTest(25, "livello 25");

// 3) massimo 2 torri/guardiano dal livello 30
function maxTest(level) {
  const patch = (h) => tank(h, 20);
  const g = makeGame({ seed: 8, patch, cleared: level - 1, level }); g.key("Enter"); g.frame(); const r = seeded(5);
  const cnt = {}; let screens = 0;
  for (let f = 0; f < 900000 && screens < 120; f++) {
    if (f % 90 === 0) g.tap(30 + r() * 300, 300);
    g.frame(); const T = g.texts, cards = parseCards(T);
    if (cards) {
      screens++;
      const sc = (c) => /Level up/.test(c.head) ? 1000 : /Nuova/.test(c.head) ? 900 : (cnt[c.head.split(" · ")[0]] || 0);
      let bi = 0; cards.forEach((c, i) => { if (sc(c) > sc(cards[bi])) bi = i; });
      const k = cards[bi].head.split(" · ")[0]; cnt[k] = (cnt[k] || 0) + 1; g.key(String(bi + 1));
    }
    if (T.includes("Ricompensa mini-boss") && T.includes("Continua")) g.key("1");
    T.length = 0;
    if (["lost", "won"].includes(g.win.__x.state())) break;
  }
  const X = g.win.__x; const endState = X.state();
  console.log(`livello ${level}: torri/guardiano al massimo = ${X.maxedCount()} su ${[X.getPlayer(), ...X.getSlots()].filter(Boolean).length} (schermate di scelta viste: ${screens}, partita ${endState === 'won' ? 'vinta' : endState === 'lost' ? 'persa' : 'in corso'})`, g.errors.length ? g.errors[0] : "");
}
console.log("— massimizzazioni —");
maxTest(21); maxTest(29); maxTest(30);

// 4) probabilità chain/combo vs standard
{
  const g = makeGame({ seed: 9, patch: expose, cleared: 50, level: 10 }); g.key("Enter"); g.frame();
  const X = g.win.__x; let std = 0, chain = 0, lu = 0, nw = 0;
  for (let i = 0; i < 6000; i++) for (const o of X.rollOptions()) { if (o.kind === "new") nw++; else if (o.up.cat === "std") std++; else if (o.up.cat === "chain") chain++; else lu++; }
  console.log("— frequenza delle carte (6000 estrazioni, guardiano senza torri) —");
  console.log(`standard: ${std} · chain: ${chain} · nuova torretta: ${nw}  → per voce disponibile (3 standard, 2 chain lv1): standard ${(std / 3).toFixed(0)} vs chain ${(chain / 2).toFixed(0)} = ${(chain / 2 / (std / 3)).toFixed(2)}× (atteso 0,40×)`);
}
