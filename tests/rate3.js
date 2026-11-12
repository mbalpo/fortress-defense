const { makeGame } = require("./bot.js");
const P = (h, ...pairs) => pairs.reduce((a, [x, y]) => { if (!a.includes(x)) throw new Error("manca"); return a.replace(x, y); }, h);
function run(label, ups) {
  const patch = (h) => P(h, ["requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__x = { getPlayer: () => player };\n})();"],
    ["domeHp: 100,", "domeHp: 1000000,"], ["options = rollOptions();", "options = [];"],
    ["player.targetX = W / 2; player.cd = 0.3;", `player.targetX = W / 2; player.cd = 0.3; Object.assign(player.up, ${JSON.stringify(ups)});`],
    ["p.cd += PLAYER.interval / (has(p, \"rate3\")", "window.__shots = (window.__shots || 0) + 1; p.cd += PLAYER.interval / (has(p, \"rate3\")"]);
  const g = makeGame({ seed: 5, patch, cleared: 50, level: 10 }); g.key("Enter"); g.frame();
  let prev = 0, last = null; const iv = [];
  for (let f = 0; f < 1500; f++) { g.frame(); g.texts.length = 0; const sh = g.win.__shots || 0; if (sh > prev) { if (last !== null) iv.push(f - last); last = f; prev = sh; } }
  const near = iv.filter((d) => d <= 18), avg = near.reduce((a, b) => a + b, 0) / near.length / 60;   // media degli intervalli tra colpi consecutivi (esclude le pause senza bersagli)
  console.log(label.padEnd(24), "intervallo medio tra colpi:", avg.toFixed(3), "s");
}
run("base", {}); run("Cadenza maggiorata (lv3)", { rate3: 1 });
