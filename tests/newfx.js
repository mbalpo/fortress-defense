const { makeGame, seeded } = require("./bot.js");
const P = (h, ...pairs) => pairs.reduce((a, [x, y]) => { if (!a.includes(x)) throw new Error("manca: " + x.slice(0, 60)); return a.replace(x, y); }, h);
const common = (h) => P(h,
  ["domeHp: 100,", "domeHp: 1000000,"],
  ["options = rollOptions();", "options = [];"],
  ["  o = o || {};", "  o = o || {}; if (o.fan) window.__fan = (window.__fan || 0) + 1;"],
  ["if (pierce > 0) { pierce--; this.t = null; }", "if (pierce > 0) { window.__pierce = (window.__pierce || 0) + 1; pierce--; this.t = null; }"],
  ["if (b) { this.t = null; this.reb = true;", "if (b) { window.__bounce = (window.__bounce || 0) + 1; this.t = null; this.reb = true;"],
  ["if (prob && Math.random() < prob) {", "if (prob && Math.random() < prob) { window.__boom = (window.__boom || 0) + 1;"],
  ["this.hit.add(e); damage(e, dmg, \"physical\", false, \"player\"); knock(e, kb);", "this.hit.add(e); damage(e, dmg, \"physical\", false, \"player\"); knock(e, kb); window.__kb = Math.max(window.__kb || 0, kb);"],
  ["function discharge(e, d) {", "function discharge(e, d) { window.__dis = (window.__dis || 0) + 1;"],
  ["e.destrT = 5 * statDur; e.destrN = Math.min(max, e.destrN + 1);", "e.destrT = 5 * statDur; e.destrN = Math.min(max, e.destrN + 1); window.__stack = Math.max(window.__stack || 0, e.destrN);"],
  ["e.y = 2; moved = true; }", "e.y = 2; moved = true; window.__top = (window.__top || 0) + 1; }"],
  ["if (moved) { ring(", "if (moved) { window.__tp = (window.__tp || 0) + 1; ring("]);
function scenario(name, playerUps, disrUps, frames = 5400, seed = 4) {
  const patch = (h) => {
    let x = common(h);
    x = P(x, ["player.targetX = W / 2; player.cd = 0.3;", `player.targetX = W / 2; player.cd = 0.3; Object.assign(player.up, ${JSON.stringify(playerUps)});`]);
    if (disrUps) x = P(x, ["startTurrets: [],", 'startTurrets: ["disr"],'],
      ["META.startTurrets.slice(0, 4).forEach((id, i) => { slots[i] = makeShooter(TURRETS[id], SLOT_X[i], GROUND_Y - 14); });",
       `META.startTurrets.slice(0, 4).forEach((id, i) => { slots[i] = makeShooter(TURRETS[id], SLOT_X[i], GROUND_Y - 14); }); slots.forEach(s => { if (s) Object.assign(s.up, ${JSON.stringify(disrUps)}); });`]);
    return x;
  };
  const g = makeGame({ seed, patch }); g.key("Enter"); g.frame();
  const r = seeded(6);
  for (let f = 0; f < frames; f++) { if (f % 120 === 0) g.tap(30 + r() * 300, 300); g.frame(); g.texts.length = 0; }
  const w = g.win, o = { fan: w.__fan, pierce: w.__pierce, bounce: w.__bounce, boom: w.__boom, kb: w.__kb, tp: w.__tp, top: w.__top, dis: w.__dis, stack: w.__stack };
  const shown = Object.entries(o).filter(([, v]) => v).map(([k, v]) => k + "=" + v).join(" ");
  console.log(name.padEnd(34), shown || "(nessun effetto)", g.errors.length ? "ERRORI " + g.errors[0] : "");
}
console.log("— guardiano —");
scenario("base (nessun potenziamento)", {});
scenario("+1 perforazione ×2", { pierce: 2 });
scenario("Perforazione II (+2)", { pen2: 1 });
scenario("Rimbalzo", { ricochet: 1 });
scenario("Ventaglio", { fan: 1 });
scenario("Colpo pesante (knockback 4)", { punch: 1 });
scenario("Colpo pesante + frenesia (→ 12)", { punch: 1, frenzy1: 1, fill: 1 }, null, 7200);
scenario("Esplosioni lv1 (10%)", { boom1: 1 });
scenario("Esplosioni al massimo (30%)", { boom1: 1, boomP: 1, boomR: 1, boom3: 1 });
console.log("— Disruption Drone —");
scenario("Teletrasporto lv1", {}, { tp1: 1 });
scenario("Teletrasporto lv1+2 (bordo)", {}, { tp1: 1, tp2: 1 }, 9000);
scenario("Teletrasporto lv3 (danno %)", {}, { tp1: 1, tp2: 1, tp3: 1 });
scenario("Distruzione lv1 (3 stack)", {}, { dst1: 1 });
scenario("Distruzione + scarica", {}, { dst1: 1, dstB: 1 });
scenario("Distruzione + max 5 + scarica", {}, { dst1: 1, dstB: 1, dst5: 1 });
scenario("Distruzione + doppia scarica", {}, { dst1: 1, dstB: 1, dst3: 1 });
