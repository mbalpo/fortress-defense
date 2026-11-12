const { makeGame } = require("./bot.js");
const P = (h, ...pairs) => pairs.reduce((a, [x, y]) => { if (!a.includes(x)) throw new Error("manca: " + x.slice(0, 60)); return a.replace(x, y); }, h);
for (const ups of [{ dst1: 1 }, { dst1: 1, dst5: 1 }]) {
  const patch = (h) => P(h, ["requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__x = { spawn, enemies: () => enemies, clear: () => { queue = []; } };\n})();"],
    ["domeHp: 100,", "domeHp: 1000000,"], ["startTurrets: [],", 'startTurrets: ["disr"],'],
    ["META.startTurrets.slice(0, 4).forEach((id, i) => { slots[i] = makeShooter(TURRETS[id], SLOT_X[i], GROUND_Y - 14); });", `META.startTurrets.slice(0, 4).forEach((id, i) => { slots[i] = makeShooter(TURRETS[id], SLOT_X[i], GROUND_Y - 14); }); slots.forEach(s => { if (s) Object.assign(s.up, ${JSON.stringify(ups)}); }); player.cd = 1e9;`]);
  const g = makeGame({ seed: 3, patch }); g.key("Enter"); g.frame(); const X = g.win.__x; X.clear();
  X.spawn({ enemy: "shell", x: 180 }); const e = X.enemies().slice(-1)[0]; e.x = 180; e.y = 300; e.speed = 0; e.hp = e.maxHp = 1e9;
  let max = 0; for (let f = 0; f < 900; f++) { g.frame(); g.texts.length = 0; max = Math.max(max, e.destrN); }
  console.log(JSON.stringify(ups).padEnd(24), "pile massime raggiunte:", max, g.errors.length ? g.errors[0] : "");
}
