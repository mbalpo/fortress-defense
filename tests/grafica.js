// Grafica classica o HD-2D (1.13.0): scelta nel menu principale, letta da draw.js al caricamento, innesto di app/draw-hd2d.js,
// partite intere in HD-2D senza errori, cache degli sprite limitata, contatore dei fotogrammi.
const { makeGame } = require("./bot.js");
const P = (h, ...pairs) => pairs.reduce((a, [x, y]) => { if (!a.includes(x)) throw new Error("manca: " + x.slice(0, 60)); return a.replace(x, y); }, h);
const ok = (c) => c ? "✓" : "✗ ERRORE";
const patch = (h) => P(h,
  ["domeHp: 100,", "domeHp: 1000000,"],
  ["const reloadPage = () => location.reload();", "const reloadPage = () => { window.__reloads = (window.__reloads || 0) + 1; };"],
  ["requestAnimationFrame(frame);\n})();", `requestAnimationFrame(frame);
window.__x = { DRAW, settings, state: () => state, toggleGraphics, toggleFps, startRun, slots, makeShooter, TURRETS, SLOT_X, GROUND_Y, applyUp, player: () => player, enemies: () => enemies };
})();`]);
const saved = (g) => JSON.parse(g.win.localStorage.getItem("fortress-proto-v1") || "{}");

console.log("— Scelta della grafica —");
{
  const g = makeGame({ patch }), X = g.win.__x;
  console.log("di base: grafica", X.DRAW.GFX_ON, "| impostazione", X.settings.graphics, ok(X.DRAW.GFX_ON === "classic" && X.settings.graphics === "classic"));
  X.toggleGraphics();
  console.log("tocco su “Grafica” nel menu → salvata", saved(g).graphics, "| pagina ricaricata", g.win.__reloads || 0, ok(saved(g).graphics === "hd2d" && g.win.__reloads === 1));
  const before = g.win.__reloads; g.key("Enter"); g.frame(); X.toggleGraphics();
  console.log("durante l’ondata (stato " + X.state() + ") il cambio non vale: ricariche", g.win.__reloads, ok(g.win.__reloads === before && saved(g).graphics === "hd2d"));
}
{
  const g = makeGame({ patch, settings: { targeting: "closest", graphics: "hd2d" } }), X = g.win.__x;
  console.log("con l’impostazione salvata “hd2d” al caricamento: grafica", X.DRAW.GFX_ON, "| sostituite enemyBody e TURRET_ART.sky:",
    /hdEnemy/.test(String(X.DRAW.drawEnemy)) || /hdEnemy/.test(X.DRAW.TURRET_ART.sky.toString()) || /hdTurret/.test(X.DRAW.TURRET_ART.sky.toString()), ok(X.DRAW.GFX_ON === "hd2d" && /hdTurret/.test(X.DRAW.TURRET_ART.sky.toString())));
  const s0 = X.settings.fps; X.toggleFps();
  console.log("tocco sulla versione nel menu: contatore fps", s0, "→", X.settings.fps, "| salvato", saved(g).fps, ok(s0 === false && X.settings.fps === true && saved(g).fps === true));
}
{
  const g = makeGame({ patch, settings: { graphics: "nonsense", fps: "si" } }), X = g.win.__x;
  console.log("impostazioni non valide ignorate: grafica", X.DRAW.GFX_ON, "| fps", X.settings.fps, ok(X.DRAW.GFX_ON === "classic" && X.settings.fps === false));
}

console.log("— Partita intera in HD-2D —");
// il secondo giro abbassa il tetto della cache a 300 per vedere che venga davvero svuotata
for (const [lv, seed, cap] of [[10, 3, 0], [30, 5, 300]]) {
  const pc = cap ? (h) => P(patch(h), ["if (SPR.size > 1500) SPR.clear();", "if (SPR.size > " + cap + ") SPR.clear();"], ["cacheMax: 1500", "cacheMax: " + cap]) : patch;
  const g = makeGame({ patch: pc, seed, cleared: 60, level: lv, settings: { graphics: "hd2d", fps: true } }), X = g.win.__x;
  g.key("Enter"); g.frame();
  // tutte le torrette in campo, a turno, con potenziamenti che accendono gli effetti
  const ids = Object.keys(X.TURRETS); let maxCache = 0, frames = 0;
  for (let round = 0; round < 3; round++) {
    ids.slice(round * 4, round * 4 + 4).forEach((id, i) => { const s = X.makeShooter(X.TURRETS[id], X.SLOT_X[i], X.GROUND_Y - 14); s.level = 3;
      for (const u of s.def.ups) if (u.cat !== "combo") s.up[u.id] = u.cat === "std" ? 2 : 1; X.slots[i] = s; });
    for (let f = 0; f < 3600 && X.state() !== "won" && X.state() !== "lost"; f++) {
      if (X.state() === "upgrade") g.key("1");
      g.frame(); frames++; g.texts.length = 0;
      const info = X.DRAW.GFX_INFO; if (info) maxCache = Math.max(maxCache, info.cacheSize());
    }
  }
  console.log("livello " + lv + ": " + frames + " fotogrammi in HD-2D, stato " + X.state() + ", errori " + g.errors.length + (g.errors[0] ? " (" + g.errors[0] + ")" : ""),
    "| cache degli sprite al massimo", maxCache, "(tetto " + X.DRAW.GFX_INFO.cacheMax + ")", ok(!g.errors.length && maxCache > 0 && maxCache <= X.DRAW.GFX_INFO.cacheMax + 150 && (!cap || maxCache > cap)));
}
