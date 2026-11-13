// Combo del guardiano con le torrette: condizioni di sblocco e effetti (DESIGN.md § 3 e § 10).
const { makeGame } = require("./bot.js");
const P = (h, ...pairs) => pairs.reduce((a, [x, y]) => { if (!a.includes(x)) throw new Error("manca: " + x.slice(0, 60)); return a.replace(x, y); }, h);
const patch = (h) => P(h,
  ["domeHp: 100,", "domeHp: 1000000,"], ["options = rollOptions();", "options = [];"],
  // registro dei danni (valore prima delle resistenze) e delle combo scattate
  ["function damage(e, base, type, quiet, src, ignore) {", "function damage(e, base, type, quiet, src, ignore) { window.__log.push({ e, base, type, src });"],
  ["function guardProc(p, proc, e) {", "function guardProc(p, proc, e) { for (const k in proc) if (proc[k]) window.__proc[k] = (window.__proc[k] || 0) + 1;"],
  ["function guardFrag(p, b, dmg) {", "function guardFrag(p, b, dmg) { window.__frag = (window.__frag || 0) + 1;"],
  ["requestAnimationFrame(frame);\n})();", `requestAnimationFrame(frame);
window.__x = { spawn, enemies: () => enemies, ents: () => ents, makeShooter, TURRETS, PLAYER_DEF, GROUND_Y, SLOT_X, eligible, describe, applyUp, rollOptions,
  guardProc, guardWheel, comboOn, META, TREE_LOCKS, player: () => player, slots: () => slots, setManual: (v) => { manual = v; }, aim,
  hold: () => { queue = []; enemies.length = 0; } };
})();`]);
const ok = (c) => c ? "✓" : "✗ ERRORE";
const near = (a, b, tol) => Math.abs(a - b) <= (tol || 1e-6) * Math.max(1, Math.abs(b));

// partita vuota: niente ondate; un nemico fuori schermo tiene aperta l’ondata
function setup() {
  const g = makeGame({ seed: 5, patch }); g.key("Enter"); g.frame(); const X = g.win.__x; X.hold();
  g.win.__log = []; g.win.__proc = {};
  const mk = (x, y, hp) => { X.spawn({ enemy: "brute", x }); const e = X.enemies().slice(-1)[0]; e.x = x; e.y = y; e.speed = 0; e.hp = e.maxHp = hp || 1e9; return e; };
  mk(180, -500);
  const p = X.player();
  const tower = (id, up, level) => { const i = X.slots().indexOf(null); const s = X.makeShooter(X.TURRETS[id], X.SLOT_X[i], X.GROUND_Y - 14); Object.assign(s.up, up || {}); s.level = level || 1; X.slots()[i] = s; return s; };
  const guard = (up, level) => { Object.assign(p.up, up); p.level = level || 1; };
  const run = (sec) => { for (let i = 0; i < Math.round(sec * 60); i++) g.frame(); };
  const log = () => g.win.__log, clear = () => { g.win.__log = []; };
  const place = (x) => { p.x = p.targetX = x; p.cd = 0.3; };
  p.cd = 1e9;                                     // il guardiano spara solo dopo place()
  return { g, X, p, mk, tower, guard, run, log, clear, place };
}
const COMBOS = { kSky: "sky", kLaser: "laser", kDisr: "disr", kAero: "aero", kThunder: "thunder", kBeam: "beam",
  kWheel: "wheel", kHive: "hive", kRail: "rail", kTesla: "tesla", kVortex: "vortex" };

console.log("— Sblocco delle combo —");
{
  const { X } = setup(); let good = true; const msg = [];
  for (const [id, tid] of Object.entries(COMBOS)) {
    const u = X.PLAYER_DEF.ups.find((v) => v.id === id);
    const offered = (glv, tlv, chain, used, keepLock) => {
      const k = setup(); k.guard({}, glv); k.p.used = used || 0;
      if (!keepLock) k.X.META.unlocked[tid] = [u.cond];              // chain sbloccata con i Sigilli (se è bloccata)
      if (tlv) k.tower(tid, chain ? { [u.cond]: 1 } : {}, tlv);
      return k.X.eligible(k.p).some((v) => v.id === id);
    };
    const chain = typeof u.cond === "string";
    const lockedCond = chain && X.TREE_LOCKS[tid].includes(u.cond);
    const cases = [
      ["chain non sbloccata", offered(u.lv, chain ? 1 : 2, chain, 0, true), !lockedCond],
      ["senza torretta", offered(3, 0), false],
      ["condizione non soddisfatta", offered(3, chain ? 3 : 1, false), false],
      ["condizione soddisfatta", offered(u.lv, chain ? 1 : 2, chain), true],
      ["guardiano lv1", offered(1, chain ? 1 : 2, chain), u.lv === 1],
      ["guardiano in attesa di level up", offered(3, chain ? 1 : 2, chain, 3), false],
    ];
    const bad = cases.filter(([, got, exp]) => got !== exp);
    if (bad.length) { good = false; msg.push(id + ": " + bad.map((b) => b[0]).join(", ")); }
    console.log(id.padEnd(9), "con", tid.padEnd(8), "|", (chain ? "chain " + u.cond : "torretta lv" + u.cond).padEnd(15), "| guardiano lv" + u.lv, "|", lockedCond ? "bloccata" : "libera  ", "|", u.name, bad.length ? "✗ " + bad.map((b) => b[0]).join(", ") : "✓");
  }
  // DESIGN.md § 3: bloccate finché la chain non è sbloccata solo le combo di Thunderbolt, Beam, Firewheel Drone e Teslacoil
  const lockedCombos = Object.entries(COMBOS).filter(([id, tid]) => { const u = X.PLAYER_DEF.ups.find((v) => v.id === id); return typeof u.cond === "string" && X.TREE_LOCKS[tid].includes(u.cond); }).map(([id]) => id);
  console.log("combo con chain bloccata dall’albero:", lockedCombos.join(", "), ok(lockedCombos.join() === "kThunder,kBeam,kWheel,kTesla"));
  // la combo conta come scelta del guardiano e la carta dice con quale torretta
  const k = setup(); k.tower("sky", {}, 2); const u = k.X.PLAYER_DEF.ups.find((v) => v.id === "kSky");
  const d = k.X.describe({ kind: "up", who: k.p, up: u }); k.X.applyUp(k.p, u);
  console.log("carta:", d.head, "|", d.title, "|", d.note, "| scelte usate dal guardiano:", k.p.used, ok(good && k.p.used === 1 && /Combo/.test(d.head) && /Sky Guard/.test(d.note)), msg.join(" · "));
}

// danni del guardiano (proiettili principali) per tipo
const byType = (L, type, src) => L.filter((x) => x.type === type && (!src || x.src === src));

console.log("— Sky Guard e Gravity Vortex Gun: danno extra per proiettile —");
for (const [id, tid, type] of [["kSky", "sky", "fire"], ["kVortex", "vortex", "force"]]) {
  const { mk, tower, guard, run, log, place } = setup(); tower(tid, {}, 2); guard({ [id]: 1, fan: 1, proj: 1 }); place(180);
  mk(180, 300); run(3);
  const phys = byType(log(), "physical", "player"), extra = byType(log(), type, "player");
  const ratios = extra.map((x, i) => x.base / phys[i].base);
  console.log(id.padEnd(8), "proiettili a segno:", phys.length, "| colpi extra", type + ":", extra.length, "| rapporto:", ratios.length ? ratios[0].toFixed(2) : "-",
    ok(phys.length > 20 && extra.length === phys.length && ratios.every((r) => near(r, 0.2))));
}

console.log("— Probabilità per colpo (salva) —");
{
  const { g, mk, tower, guard, run, place } = setup();
  for (const id of ["laser", "disr", "aero", "thunder"]) tower(id, { dst1: 1, mine1: 1, fork1: 1 }, 2);
  guard({ kLaser: 1, kDisr: 1, kAero: 1, kThunder: 1, proj: 2 }, 2); place(180);
  mk(180, 200); run(300);
  const salvos = Math.round(300 / 0.15), pr = g.win.__proc;
  const rows = [["laser", 0.03], ["disr", 0.10], ["aero", 0.05], ["thunder", 0.05]];
  for (const [k, pexp] of rows) {
    const n = pr[k] || 0, exp = salvos * pexp, sd = Math.sqrt(exp * (1 - pexp));
    console.log(k.padEnd(8), "scattate", String(n).padStart(4), "su", salvos, "salve | atteso", exp.toFixed(0), "(" + (pexp * 100) + "%, 3 proiettili per salva)", ok(Math.abs(n - exp) < 4 * sd));
  }
}

console.log("— Laser rotante —");
for (const up of [{}, { multi1: 1, multiW: 1 }]) {
  const { X, p, mk, tower, run, log } = setup(); const s = tower("laser", up, 2); guard0(p);
  const c = mk(180, 300), ring = [];
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ring.push(mk(180 + Math.cos(a) * 45, 300 + Math.sin(a) * 45)); }
  const far = mk(180 + 90, 300);
  X.guardProc(p, { laser: true }, c); X.guardProc(p, { laser: true }, c);       // il secondo non parte: uno alla volta
  const spins = () => X.ents().filter((e) => e.segs && !e.dead).length;
  const n0 = spins(); run(1.5); const mid = spins(); run(1.6); const end = spins();
  const hitRing = ring.filter((e) => e.hp < e.maxHp).length, weak = ring.some((e) => e.weakT > 0);
  console.log(up.multi1 ? "con mini-raggi e debuff" : "base".padEnd(23), "| laser attivi:", n0, "→", mid, "→ dopo 3 s:", end, "| colpiti a 45 px:", hitRing + "/12",
    "| a 90 px:", far.hp < far.maxHp, "| indeboliti:", weak,
    ok(n0 === 1 && mid === 1 && end === 0 && hitRing === 12 && far.hp === far.maxHp && weak === !!up.multiW && c.hp < c.maxHp));
}
function guard0(p) { p.up.kLaser = 1; }

console.log("— Disruption Drone: stack di distruzione —");
for (const up of [{ dst1: 1 }, { dst1: 1, dstB: 1 }]) {
  const { X, p, mk, tower, log } = setup(); tower("disr", up, 2); p.up.kDisr = 1;
  const e = mk(180, 300); X.guardProc(p, { disr: true }, e); const one = e.destrN;
  X.guardProc(p, { disr: true }, e); X.guardProc(p, { disr: true }, e);
  const dis = log().filter((x) => x.src === "disr").length;
  console.log(up.dstB ? "con Scarica distruttiva" : "base".padEnd(23), "| stack dopo 1:", one, "| dopo 3:", e.destrN, "| scariche:", dis,
    ok(one === 1 && (up.dstB ? e.destrN === 0 && dis === 1 : e.destrN === 3 && dis === 0)));
}

console.log("— Aeroblast: mine (al massimo 5) —");
{
  const { X, p, mk, tower, run, log, clear } = setup(); tower("aero", { mine1: 1, mineD: 1 }, 3); p.up.kAero = 1;
  for (let i = 0; i < 8; i++) X.guardProc(p, { aero: true }, { x: 60 + i * 30, y: 150 });
  const mines = () => X.ents().filter((m) => !m.dead && m.age != null).length;
  const n = mines(); clear(); const v = mk(60, 150); run(0.1);
  const boom = log().filter((x) => x.src === "aero");
  console.log("mine create con 8 attivazioni:", n, "| esplosione sul nemico, danno", boom.length ? boom[0].base.toFixed(1) : "-", "(atteso 24 × 0,9 × 1,6 = 34,6)",
    ok(n === 5 && boom.length >= 1 && near(boom[0].base, 24 * 0.9 * 1.6, 1e-3)));
}

console.log("— Thunderbolt: ramificazione dal colpo —");
for (const up of [{ fork1: 1 }, { fork1: 1, fork2: 1, forkW: 1 }]) {
  const { X, p, mk, tower } = setup(); tower("thunder", up, 3); p.up.kThunder = 1;
  const c = mk(180, 300), around = []; for (let i = 0; i < 8; i++) around.push(mk(180 + (i - 3.5) * 25, 330));
  X.guardProc(p, { thunder: true }, c);
  const hit = around.filter((e) => e.hp < e.maxHp).length, weak = around.filter((e) => e.weakT > 0).length;
  const exp = up.fork2 ? 6 : 4;
  console.log(up.fork2 ? "Ramificazione II + debilitanti" : "Fulmini ramificati".padEnd(30), "| colpiti:", hit, "(attesi " + exp + ") | indeboliti:", weak,
    ok(hit === exp && weak === (up.forkW ? exp : 0) && c.hp === c.maxHp));
}

console.log("— Beam: Mira amplificata —");
{
  const { mk, tower, guard, run, log, clear, place } = setup(); tower("beam", { amp1: 1 }, 2); guard({ kBeam: 1 }, 2); place(180);
  const a = mk(180, 300); run(1); const b0 = byType(log(), "physical", "player")[0].base;
  run(2); clear(); run(0.3); const b2 = byType(log(), "physical", "player").slice(-1)[0].base;
  const b = mk(90, 450); clear(); run(0.6); const L = byType(log(), "physical", "player").filter((x) => x.e === b); const b3 = L.length ? L[0].base : 0;
  console.log("danno per colpo: primo", b0.toFixed(2), "| dopo oltre 2 s", b2.toFixed(2), "(×" + (b2 / b0).toFixed(2) + ") | nuovo bersaglio", b3.toFixed(2),
    ok(near(b2 / b0, 1.5, 1e-3) && L.length > 0 && b3 / b0 < 1.1));
}

console.log("— Firewheel: mini-droni di scorta (al massimo 3) —");
{
  const { X, p, mk, tower, run, log } = setup(); const s = tower("wheel", { mini1: 1, miniB: 1 }, 2); p.up.kWheel = 1;
  for (let i = 0; i < 5; i++) X.guardWheel(p);
  const minis = () => X.ents().filter((d) => !d.dead && d.trail).length;
  const n = minis(), busy = s.busy; mk(180, 300); mk(100, 200); mk(260, 250); run(5.5);
  const fire = log().filter((x) => x.src === "wheel").length;
  console.log("mini-droni:", n, "| la torretta resta libera:", busy === 0, "| colpi di fuoco:", fire > 0, "| dopo la durata:", minis(),
    ok(n === 3 && busy === 0 && fire > 0 && minis() === 0));
}

console.log("— Hive: Clone speculare —");
{
  const { p, mk, tower, guard, run, log, place } = setup(); tower("hive", {}, 2); guard({ kHive: 1, kSky: 1, boom1: 1, boomP: 1, boom3: 1 }); tower("sky", {}, 2); place(100);
  const A = mk(100, 300), B = mk(260, 300); run(3);
  const pA = byType(log(), "physical", "player").filter((x) => x.e === A), pB = byType(log(), "physical", "player").filter((x) => x.e === B);
  const fireB = byType(log(), "fire", "player").filter((x) => x.e === B).length;
  const ratio = pB.length && pA.length ? pB[0].base / pA[0].base : 0;
  console.log("automatica: il guardiano colpisce A", pA.length, "volte, il clone B", pB.length, "| danno clone/guardiano:", ratio.toFixed(2), "| effetti del clone (fuoco):", fireB,
    ok(pA.length > 10 && pB.length > 10 && near(ratio, 0.5, 1e-3) && fireB === 0));
}
{
  const { X, p, mk, tower, guard, run, log, place } = setup(); tower("hive", {}, 2); guard({ kHive: 1, pierce: 1 }); place(100); X.setManual(true);
  const C = mk(300, 300), D = mk(60, 300);
  X.aim.x = 60; X.aim.y = 300; X.aim.down = true; run(2);
  const onC = byType(log(), "physical", "player").filter((x) => x.e === C), onD = byType(log(), "physical", "player").filter((x) => x.e === D);
  console.log("manuale: mira a sinistra (60, 300) → colpi del clone sul punto specchiato (300, 300):", onC.length, "| del guardiano sul bersaglio:", onD.length,
    "| danno clone/guardiano:", onC.length && onD.length ? (onC[0].base / onD[0].base).toFixed(2) : "-",
    ok(onC.length > 5 && onD.length > 5 && near(onC[0].base / onD[0].base, 0.5, 1e-3)));
}

console.log("— Railgun: proiettili frammentati —");
{
  const { g, mk, tower, guard, run, log, place } = setup(); tower("rail", {}, 2); guard({ kRail: 1 }); place(180);
  const a = mk(180, 300); for (let i = 0; i < 6; i++) mk(120 + i * 25, 260);
  run(150);
  const hits = byType(log(), "physical", "player"), full = hits.filter((x) => x.e === a).length, n = g.win.__frag || 0;
  const halves = hits.filter((x) => x.e !== a), r = halves.length ? halves[0].base / hits.find((x) => x.e === a).base : 0;
  const sd = Math.sqrt(full * 0.1 * 0.9);
  console.log("colpi sul bersaglio:", full, "| frammentazioni:", n, "(attese " + (full * 0.1).toFixed(0) + ") | frammenti a segno:", halves.length, "| danno frammento:", r.toFixed(2),
    ok(Math.abs(n - full * 0.1) < 4 * sd && halves.length > n && halves.length <= 2 * n && near(r, 0.5, 1e-3)));
}

console.log("— Teslacoil: colpo caricato ogni 40 colpi —");
for (const [up, mult, label] of [[{}, 2, "base"], [{ punch: 1 }, 3, "con Colpo pesante"]]) {
  const { mk, tower, guard, run, log, place } = setup(); tower("tesla", { over1: 1, bounce: 2 }, 2); guard(Object.assign({ kTesla: 1 }, up), 2); place(180);
  const a = mk(180, 300), b = mk(215, 300), c = mk(250, 300);
  run(13);                                        // 85 salve: 2 colpi caricati
  const hits = byType(log(), "physical", "player"), norm = hits.find((x) => x.e === a).base;
  const raw = norm / (up.punch ? 1.6 : 1), big = hits.filter((x) => near(x.base, raw * mult, 1e-6));
  console.log(label.padEnd(18), "colpi caricati a segno:", big.length, " (2 colpi caricati × 3 nemici con 2 rimbalzi)",
    "| danno ×" + (big.length ? (big[0].base / raw).toFixed(2) : "-") + " del colpo senza Colpo pesante",
    ok(big.length === 6 && new Set(big.map((x) => x.e)).size === 3));
}
