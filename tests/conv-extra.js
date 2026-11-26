// Conversione e danni extra (DESIGN.md § 17 “Conversione e danni extra”, decisioni di Marco del 26/11/2026):
// l’extra di Proiettili incendiari / gravitazionali resta fuori dalla conversione e non vale sugli invisibili;
// l’esplosione dei Colpi esplosivi segue il tipo con la quota maggiore del colpo (a 50/50 vince physical).
const { makeGame } = require("./bot.js");
const P = (h, ...pairs) => pairs.reduce((a, [x, y]) => { if (!a.includes(x)) throw new Error("manca: " + x.slice(0, 60)); return a.replace(x, y); }, h);
const patch = (h) => P(h,
  ["domeHp: 100,", "domeHp: 1000000,"], ["options = rollOptions();", "options = [];"],
  ["function damage(e, base, type, quiet, src, ignore) {", "function damage(e, base, type, quiet, src, ignore) { window.__log.push({ e, base, type, src });"],
  // l’esplosione dei Colpi esplosivi si riconosce nel registro dalla sorgente “boom” (solo nel test)
  ['xt, false, "player");   // Modulo 19', 'xt, false, "boom");   // Modulo 19'],
  ["requestAnimationFrame(frame);\n})();", `requestAnimationFrame(frame);
window.__x = { spawn, enemies: () => enemies, makeShooter, TURRETS, GROUND_Y, SLOT_X, player: () => player, slots: () => slots,
  setRG: (conv, ign) => { RG.conv = conv; RG.ign = ign || 0; }, hold: () => { queue = []; enemies.length = 0; } };
})();`]);
const ok = (c) => c ? "✓" : "✗ ERRORE";
const near = (a, b) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b));
const TYPE = { prometeo: "fire", mnemosine: "force", ceo: "electric", iperione: "energy" };

// partita vuota: il guardiano spara solo dopo place(); conv = [ranger, livello] di conversione, atl = livello di Atlante
function setup(conv, atl) {
  const g = makeGame({ seed: 5, patch }); g.key("Enter"); g.frame(); const X = g.win.__x; X.hold();
  g.win.__log = [];
  X.setRG(conv ? { type: TYPE[conv[0]], k: 0.1 * conv[1] } : null, atl ? 0.1 * atl : 0);
  const mk = (x, y) => { X.spawn({ enemy: "brute", x }); const e = X.enemies().slice(-1)[0]; e.x = x; e.y = y; e.speed = 0; e.hp = e.maxHp = 1e9; return e; };
  mk(180, -500);
  const p = X.player();
  const tower = (id) => { const i = X.slots().indexOf(null); const s = X.makeShooter(X.TURRETS[id], X.SLOT_X[i], X.GROUND_Y - 14); s.level = 2; X.slots()[i] = s; };
  const run = (sec) => { for (let i = 0; i < Math.round(sec * 60); i++) g.frame(); };
  const place = (x) => { p.x = p.targetX = x; p.cd = 0.3; };
  p.cd = 1e9;
  return { g, X, p, mk, tower, run, place, log: () => g.win.__log };
}
const types = (L) => [...new Set(L.map((x) => x.type))].sort().join("+");

console.log("— Invisibili: con Iperione solo la quota energy, nessun extra —");
for (const [cid, tid, lv] of [["kSky", "sky", 5], ["kVortex", "vortex", 5], ["kSky", "sky", 10], ["kVortex", "vortex", 10]]) {
  const { p, mk, tower, run, place, log } = setup(["iperione", lv]); tower(tid); Object.assign(p.up, { [cid]: 1 }); p.level = 2; place(180);
  const e = mk(180, 300); e.invis = true; run(3);
  const L = log().filter((x) => x.e === e && x.src === "player");   // solo il guardiano (la torretta della combo spara per conto suo)
  console.log(`Iperione ${lv} + ${cid} contro un invisibile: colpi ${L.length}, tipi ${types(L) || "-"}`, ok(L.length > 10 && types(L) === "energy"));
}

console.log("— Prometeo al 10 + Proiettili incendiari —");
{
  const { p, mk, tower, run, place, log } = setup(["prometeo", 10]); tower("sky"); Object.assign(p.up, { kSky: 1 }); p.level = 2; place(180);
  const e = mk(180, 300); run(3);
  const L = log().filter((x) => x.e === e && x.src === "player"), fire = L.filter((x) => x.type === "fire" && x.src === "player");
  // per proiettile: prima il colpo convertito (100% fire), poi l’extra (20% fire, calcolato sul colpo intero)
  const pairs = []; for (let i = 0; i + 1 < fire.length; i += 2) pairs.push(fire[i + 1].base / fire[i].base);
  console.log(`colpi ${L.length}, tipi ${types(L)}, rapporto extra/colpo ${pairs.length ? pairs[0].toFixed(2) : "-"} su ${pairs.length} proiettili`,
    ok(L.length > 20 && types(L) === "fire" && fire.length % 2 === 0 && pairs.every((r) => near(r, 0.2))));
}

console.log("— Esplosione dei Colpi esplosivi: tipo con la quota maggiore —");
for (const [name, conv, atl, want] of [["senza ranger", null, 0, "physical"], ["Atlante al 10", null, 10, "physical"],
  ["Prometeo al 4", ["prometeo", 4], 0, "physical"], ["Prometeo al 5 (50/50)", ["prometeo", 5], 0, "physical"], ["Prometeo al 6", ["prometeo", 6], 0, "fire"],
  ["Mnemosine al 6", ["mnemosine", 6], 0, "force"], ["Ceo al 10", ["ceo", 10], 0, "electric"], ["Iperione al 7", ["iperione", 7], 0, "energy"]]) {
  const { p, mk, run, place, log } = setup(conv, atl); Object.assign(p.up, { boom1: 1, boomP: 1, boom3: 1 }); place(180);
  const e = mk(180, 300), f = mk(205, 290); run(8);
  const boom = log().filter((x) => x.src === "boom"), direct = log().filter((x) => x.e === e && x.src === "player");
  // l’esplosione è il 70% del colpo intero (somma delle quote del primo colpo), in un solo tipo
  const shot = direct.length ? direct.filter((x) => x.e === e).slice(0, conv ? (conv[1] < 10 ? 2 : 1) : 1).reduce((a, x) => a + x.base, 0) : 0;
  console.log(`${name.padEnd(22)} esplosioni ${boom.length}, tipo ${types(boom) || "-"} (atteso ${want}), 70% del colpo: ${boom.length && near(boom[0].base, 0.7 * shot)}`,
    ok(boom.length > 3 && types(boom) === want && boom.every((x) => x.e !== e) && near(boom[0].base, 0.7 * shot)));
}
