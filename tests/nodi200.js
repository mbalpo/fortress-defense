// Nodi del livello 200 (1.30.0, DESIGN.md § 16 “Nodi finali” e “Tetti”): Specializzazione in fondo a guardiano e 11 torrette (5 livelli da +1/6 del danno base,
// 10 Sigilli a livello, solo dal 200 completato) e Tetto della riduzione in fondo alla barriera (15 Sigilli, riduzione del danno fino al 65%); avviso di sblocco al 200.
const { makeGame } = require("./bot.js");
const ok = (c) => c ? "✓" : "✗ ERRORE";
const patch = (h) => h.replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();");
const fresh = (cleared, extra, level) => {
  const g = makeGame({ patch, cleared, level, storage: { "fortress-progress-v1": JSON.stringify(Object.assign({ cleared, seen: [] }, extra || {})) } }); g.frame();
  return { g, ev: g.win.__ev };
};
const J = (ev, c) => JSON.parse(ev("JSON.stringify(" + c + ")"));
const WHO = ["player", "sky", "laser", "disr", "aero", "thunder", "beam", "wheel", "hive", "rail", "tesla", "vortex"];

console.log("— Nodi e costi —");
{
  const { ev } = fresh(200, { seals: 1e4, majors: 1e3 });
  const last = J(ev, `${JSON.stringify(WHO)}.map((w) => TREE[w][TREE[w].length - 1].id === w + ":final")`).every(Boolean);
  const fin = J(ev, "TREE_NODE['sky:final']"), cap = J(ev, "TREE_NODE['barrier:cap']"), barLast = ev("TREE.barrier[TREE.barrier.length - 1].id");
  const tot = J(ev, "[Object.values(TREE).flat().reduce((a, n) => a + n.costs.reduce((x, y) => x + y, 0), 0), Object.values(TREE).flat().reduce((a, n) => a + n.mcosts.reduce((x, y) => x + y, 0), 0)]");
  console.log("Specializzazione ultima in 12 rami:", last, "· costi", fin.costs.join("/"), "maggiori", fin.mcosts.join("/"), "· Tetto ultimo della barriera:", barLast, "costo", cap.costs.join(), "· albero intero", tot[0], "◆", tot[1], "✦",
    ok(last && fin.costs.join() === "10,10,10,10,10" && fin.mcosts.every((x) => x === 0) && barLast === "barrier:cap" && cap.costs.join() === "15" && cap.max === 1 && tot[0] === 1907 && tot[1] === 188));
  const fx = J(ev, "[1, 2, 3, 4, 5].map((L) => TREE_NODE['player:final'].fx(L))").join(" · ");
  console.log("testi:", fx, "·", ev("TREE_NODE['barrier:cap'].fx(1)"), ok(/danno base \+16,7%/.test(fx) && /\+83,3%/.test(fx) && /65%/.test(ev("TREE_NODE['barrier:cap'].fx(1)"))));
}
{
  const a = fresh(199, { seals: 1e4, majors: 1e3 }), b = fresh(200, { seals: 1e4, majors: 1e3 });
  const st = (ev) => J(ev, "[nodeState(TREE_NODE['sky:final']), nodeState(TREE_NODE['barrier:cap']), buyNode(TREE_NODE['sky:final']), buyNode(TREE_NODE['barrier:cap'])]");
  const s199 = st(a.ev), s200 = st(b.ev), seals = b.ev("progress.seals");
  console.log("199 completati:", s199.join(" "), "· 200:", s200.join(" "), "· Sigilli spesi", 1e4 - seals, "· nessun nodo richiesto (Riduzione danno a 0):", b.ev("treeLv('barrier:red')"),
    ok(s199.join() === "req,req,false,false" && s200.join() === "ready,ready,true,true" && 1e4 - seals === 25 && b.ev("treeLv('barrier:red')") === 0));
}

console.log("— Effetti —");
{
  const tree = { "player:final": 5, "sky:final": 3, "barrier:cap": 1, "barrier:hp": 1, "barrier:red": 5 };
  const { g, ev } = fresh(200, { tree }); g.key("Enter"); g.frame();
  ev("queue = []; enemies = []; spawn({ enemy: 'brute', x: 180 }); Object.assign(enemies[0], { y: 300, speed: 0, hp: 1e9, maxHp: 1e9 })");
  const hit = (src, type) => ev(`(() => { const e = enemies[0], h = e.hp; damage(e, 100, '${type}', true, '${src}'); return Math.round((h - e.hp) * 1000) / 1000; })()`);
  const ref = { physical: hit("counter", "physical"), fire: hit("counter", "fire") };
  const r = { player: hit("player", "physical") / ref.physical, sky: hit("sky", "fire") / ref.fire, laser: hit("laser", "fire") / ref.fire, ranger: hit("ranger", "fire") / ref.fire };
  const bt = ev("(() => { const e = enemies[0]; e.burnT = 0; e.burnDps = 0; const s = makeShooter(TURRETS.sky, 0, 0); skyBurn(s, e, 2, 10); return e.burnDps; })()");
  const rd = ev("(() => { GEAR.red = 0.5; return domeRed(); })()");
  console.log("guardiano al 5: ×", r.player.toFixed(3), "· Sky Guard al 3: ×", r.sky.toFixed(3), "(bruciatura 10 → " + bt + ") · Laser senza nodo ×", r.laser, "· ranger ×", r.ranger, "· riduzione con equipaggiamento 50% e albero 15%:", rd,
    ok(Math.abs(r.player - 11 / 6) < 1e-4 && Math.abs(r.sky - 1.5) < 1e-4 && r.laser === 1 && r.ranger === 1 && Math.abs(bt - 15 * (1 - (ev("enemies[0].statRes") || 0))) < 1e-6 && Math.abs(rd - 0.65) < 1e-9));
  const n = fresh(200, { tree: { "barrier:hp": 1, "barrier:red": 5 } }); n.g.key("Enter"); n.g.frame();
  console.log("senza il nodo del tetto: riduzione", n.ev("(() => { GEAR.red = 0.5; return domeRed(); })()"), "· senza Specializzazione: nessun moltiplicatore", n.ev("Object.keys(FINAL_M).length"),
    ok(n.ev("(() => { GEAR.red = 0.5; return domeRed(); })()") === 0.5 && n.ev("Object.keys(FINAL_M).length") === 0));
}

console.log("— Avviso al 200 e schermata —");
{
  const w = (cleared) => { const g = makeGame({ seed: 1, cleared, level: 200, patch }); g.key("Enter"); g.frame(); g.win.__ev("winLevel()"); g.texts.length = 0; g.frame(); return { g, T: [...g.texts] }; };
  const a = w(199), b = w(200);
  console.log("200 completato la prima volta → avviso:", a.T.includes("Specializzazione e tetto al 65%"), "· già completato:", b.T.includes("Specializzazione e tetto al 65%"),
    ok(a.T.includes("Nuovo sblocco") && a.T.includes("Specializzazione e tetto al 65%") && !b.T.includes("Specializzazione e tetto al 65%") && !a.g.errors.length));
  const { g, ev } = fresh(150, { seals: 50, majors: 50 });
  ev("openTree(); treeTab = 'barrier'"); g.texts.length = 0; g.frame(); const t1 = g.texts.join("|");
  console.log("albero prima del 200: “Tetto della riduzione”", t1.includes("Tetto della riduzione"), "· “Dal livello 200 completato”", t1.includes("Dal livello 200 completato"), "· errori JS:", g.errors[0] || "nessuno",
    ok(t1.includes("Tetto della riduzione") && t1.includes("Dal livello 200 completato") && !g.errors.length));
}
