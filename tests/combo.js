// Combo del guardiano con le torrette: condizioni di sblocco e effetti (DESIGN.md § 3 e § 10).
const { makeGame } = require("./bot.js");
const P = (h, ...pairs) => pairs.reduce((a, [x, y]) => { if (!a.includes(x)) throw new Error("manca: " + x.slice(0, 60)); return a.replace(x, y); }, h);
const patch = (h) => P(h,
  ["domeHp: 100,", "domeHp: 1000000,"], ["options = rollOptions();", "options = [];"],
  // registro dei danni (valore prima delle resistenze) e delle combo scattate
  ["function damage(e, base, type, quiet, src, ignore) {", "function damage(e, base, type, quiet, src, ignore) { window.__log.push({ e, base, type, src });"],
  ["function guardProc(p, proc, e) {", "function guardProc(p, proc, e) { for (const k in proc) if (proc[k]) window.__proc[k] = (window.__proc[k] || 0) + 1;"],
  ["function thunderZap(s, e, dmg) {", "function thunderZap(s, e, dmg) { window.__zap = (window.__zap || 0) + 1;"],
  ["function teleportRoll(s, e) {", "function teleportRoll(s, e) { window.__tp = (window.__tp || 0) + 1;"],
    ["function guardFrag(p, b, dmg) {", "function guardFrag(p, b, dmg) { window.__frag = (window.__frag || 0) + 1;"],
  ["requestAnimationFrame(frame);\n})();", `requestAnimationFrame(frame);
window.__x = { spawn, enemies: () => enemies, ents: () => ents, makeShooter, TURRETS, PLAYER_DEF, GROUND_Y, SLOT_X, eligible, describe, applyUp, rollOptions,
  guardProc, guardWheel, comboOn, META, TREE_LOCKS, player: () => player, slots: () => slots, setPressing: (v) => { pressing = v; },
  kOn, skyFire, skyImpact, skyStats, cdOf, laserFire, disrFire, aeroBoom, thunderBolt, beamFire, wheelDrone, hiveDrone, railShot, teslaBoom, vortex,
  kDrone, kMini, kHole, kOrb, kPortals, kSpin, kTrail, K_CAP, railDmg, thunderDmg, aeroStats, vortexStats, living,
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
  const { X, p, mk, tower, guard, run, log, place } = setup(); tower("hive", {}, 2); guard({ kHive: 1, pierce: 1 }); place(100); X.setPressing(true);
  const C = mk(260, 300), D = mk(100, 300), E = mk(180, 200);       // E non è sulla verticale di nessuno dei due
  run(2);
  const hits = (q) => byType(log(), "physical", "player").filter((x) => x.e === q);
  const onC = hits(C), onD = hits(D), onE = hits(E);
  console.log("tiro verticale (si preme, guardiano a x 100): colpi del clone sulla verticale specchiata (260):", onC.length, "| del guardiano sulla sua (100):", onD.length,
    "| sul nemico fuori dalle due verticali:", onE.length, "| danno clone/guardiano:", onC.length && onD.length ? (onC[0].base / onD[0].base).toFixed(2) : "-",
    ok(onC.length > 5 && onD.length > 5 && onE.length === 0 && near(onC[0].base / onD[0].base, 0.5, 1e-3)));
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

/* ===================== COMBO TRA DUE TORRETTE (DESIGN.md § 3 e § 10) ===================== */
const PAIRS = [];   // [principale, id, secondaria, voce chain, livello, nome]
{ const { X } = setup(); for (const [tid, d] of Object.entries(X.TURRETS)) for (const u of d.ups) if (u.cat === "combo") PAIRS.push([tid, u.id, u.needs, u.cond, u.lv, u.name]); }

console.log("— Combo tra due torrette: sblocco —");
{
  const k = setup(), { X } = k, bad = [];
  const fresh = () => { X.slots().fill(null); X.META.unlocked = {}; };
  for (const [tid, id, sid, cond] of PAIRS) {
    const offered = (plv, chain, o) => {
      o = o || {}; fresh();
      if (!o.keepLock) X.META.unlocked[sid] = [cond];              // chain della secondaria sbloccata con i Sigilli (se è bloccata)
      const s = k.tower(tid, {}, plv); s.used = o.used || 0;
      if (!o.noSec) k.tower(sid, chain ? { [cond]: 1 } : {}, 1);
      return X.eligible(s).some((v) => v.id === id);
    };
    const lockedCond = X.TREE_LOCKS[sid].includes(cond);
    const cases = [
      ["condizione soddisfatta", offered(2, true), true], ["principale lv3", offered(3, true), true], ["principale lv1", offered(1, true), false],
      ["senza secondaria", offered(2, true, { noSec: true }), false], ["secondaria senza la voce chain", offered(2, false), false],
      ["chain non sbloccata", offered(2, true, { keepLock: true }), !lockedCond], ["in attesa di level up", offered(2, true, { used: 3 }), false],
    ];
    const b = cases.filter(([, got, exp]) => got !== exp);
    if (b.length) bad.push(tid + "." + id + " (" + b.map((x) => x[0]).join(", ") + ")");
  }
  fresh();
  const asP = {}, all = {}; for (const [tid, , sid] of PAIRS) { asP[tid] = (asP[tid] || 0) + 1; all[tid] = (all[tid] || 0) + 1; all[sid] = (all[sid] || 0) + 1; }
  const same = PAIRS.filter(([t, , s]) => X.TURRETS[t].type === X.TURRETS[s].type).length, inv = PAIRS.filter(([t, , s]) => PAIRS.some(([t2, , s2]) => t2 === s && s2 === t)).length;
  const p3 = Object.keys(X.TURRETS).every((t) => asP[t] === 3), a6 = Object.keys(X.TURRETS).every((t) => all[t] === 6), lv2 = PAIRS.every((p) => p[4] === 2);
  console.log("combo tra torrette:", PAIRS.length, "| ognuna principale in 3:", p3, "| 6 volte in tutto:", a6, "| coppie dello stesso tipo:", same, "| coppie invertite:", inv, "| principale al lv 2:", lv2,
    ok(PAIRS.length === 33 && p3 && a6 && !same && !inv && lv2));
  console.log("condizioni di sblocco su", PAIRS.length, "combo (principale lv2, secondaria con la voce lv1, chain sbloccata, niente level up in attesa):", bad.length ? "✗ " + bad.join(" · ") : "tutte ✓");
  const lockedN = PAIRS.filter(([, , sid, cond]) => X.TREE_LOCKS[sid].includes(cond)).length;
  console.log("combo tra torrette con chain bloccata dall’albero:", lockedN, "· libere fino al livello 30:", PAIRS.length - lockedN, ok(lockedN === 18));
  const s = k.tower("sky", {}, 2), d0 = k.tower("disr", { tp1: 1 }, 1); X.META.unlocked.disr = ["tp1"];
  const u = X.TURRETS.sky.ups.find((v) => v.id === "kDisr"), d = X.describe({ kind: "up", who: s, up: u }); X.applyUp(s, u);
  console.log("carta tra torrette:", d.head, "|", d.title, "|", d.note, "| scelte della Sky Guard:", s.used, "| del Disruption:", d0.used, "| attiva:", !!X.kOn(s, "kDisr"),
    ok(s.used === 1 && d0.used === 0 && d.head === "Sky Guard · Combo" && /Disruption Drone/.test(d.note) && X.kOn(s, "kDisr") === d0));
}

console.log("— Combo tra due torrette: effetti —");
// principale (lv 2) e secondaria (lv 3) in campo, ferme: gli effetti si provocano a mano
const T2 = (k, pid, pup, sid, sup) => { const sec = k.tower(sid, sup || {}, 3), pr = k.tower(pid, pup, 2); pr.cd = sec.cd = 1e9; return [pr, sec]; };
const alive = (k, f) => k.X.ents().filter((o) => !o.dead && f(o));
const tagged = (k, tag) => alive(k, (o) => o.kc === tag).length;
const killEnts = (k) => k.X.ents().forEach((o) => { o.dead = true; });
const src = (k, s, e) => k.log().filter((x) => x.src === s && (!e || x.e === e));
const within = (n, N, p) => Math.abs(n - N * p) < 4 * Math.sqrt(N * p * (1 - p));
const frames = (k, n) => { for (let i = 0; i < n; i++) k.g.frame(); };
const line = (n, label, ...rest) => console.log(String(n).padStart(2), label.padEnd(26), "|", ...rest);

{ // 1
  const k = setup(), [s] = T2(k, "sky", { kDisr: 1 }, "disr", { tp1: 1 }), e = k.mk(180, 300), N = 2000; let moved = 0;
  for (let i = 0; i < N; i++) { e.y = 300; k.X.skyImpact(s, 180, 300, false); if (e.y < 300) moved++; }
  const rolls = k.g.win.__tp; k.X.skyImpact(s, 180, 300, true);
  line(1, "Missili teletrasportanti", "impatti", N, "| tiri", rolls, "| teletrasportati", moved, "(attesi " + N * 0.05 + ") | mini-missili senza tiri:", k.g.win.__tp === rolls,
    ok(rolls === N && within(moved, N, 0.05) && k.g.win.__tp === rolls));
}
for (const sup of [{ salvo1: 1 }, { salvo1: 1, salvoK: 1, salvo2: 1 }]) { // 2
  const k = setup(); const [s] = T2(k, "sky", { kAero: 1 }, "aero", sup), e = k.mk(180, 200);
  k.X.skyImpact(s, 180, 300, false); const n0 = alive(k, (o) => o.mini === true).length; k.run(2);
  const h = src(k, "aero", e), exp = sup.salvo2 ? 10 : 5;
  line(2, "Missili a schegge" + (sup.salvo2 ? " (lv3)" : ""), "mini-missili subito", n0, "| schegge a segno", h.length, "(attese " + exp + ") | danno", h.length ? h[0].base.toFixed(1) : "-", "(24 × 0,3) | spinta", (200 - e.y).toFixed(0), "px",
    ok(n0 === 5 && h.length === exp && h.every((x) => near(x.base, 7.2) && x.type === "physical") && near(200 - e.y, sup.salvoK ? 10 * exp : 0)));
}
{ // 3
  const k = setup(), rows = [];
  for (const sup of [{}, { over1: 1 }, { over1: 1, over2: 1 }, { over1: 1, over2: 1, over3: 1 }]) {
    k.X.slots().fill(null); const [s] = T2(k, "sky", sup.over1 ? { kTesla: 1 } : {}, "tesla", Object.keys(sup).length ? sup : { over1: 1 });
    const st = k.X.skyStats(s); rows.push([st.rad, st.dmg, k.X.cdOf(s)].map((v) => +v.toFixed(2)));
  }
  k.X.slots().fill(null); const [s] = T2(k, "sky", { kTesla: 1 }, "tesla", { over1: 1 }); k.mk(180, 300); k.X.skyFire(s);
  const ch = alive(k, (o) => o.mini === false).every((o) => o.charged);
  const exp = [[30, 24, 3], [39, 24, 3.5], [48, 38.4, 4], [66, 52.8, 5]];
  line(3, "Missili sovraccarichi", "raggio/danno/ricarica senza, lv1, lv2, lv3:", rows.map((r) => r.join("/")).join(" · "), "| missili caricati:", ch,
    ok(ch && rows.every((r, i) => r.every((v, j) => near(v, exp[i][j], 1e-3)))));
}
{ // 4
  const k = setup(), [s, d] = T2(k, "wheel", { kDisr: 1 }, "disr", { dst1: 1 });
  const e1 = k.mk(180, 300), e2 = k.mk(180, 150), e3 = k.mk(60, 200);
  const o = (mini, free) => ({ mini, dur: 0.5, rad: mini ? 28 : 55, dps: 1, launch: { hit: new Set() }, free });
  k.X.wheelDrone(s, 180, 300, 0, o(false)); k.X.wheelDrone(s, 180, 150, 0, o(true)); k.X.wheelDrone(s, 60, 200, 0, o(true, true)); k.run(0.7);
  line(4, "Droni distruttivi", "stack: drone (un passaggio)", e1.destrN, "| mini-drone", e2.destrN, "| mini-drone di un’altra combo", e3.destrN, ok(e1.destrN === 1 && e2.destrN === 1 && e3.destrN === 0));
}
{ // 5
  const k = setup(), [s] = T2(k, "wheel", { kVortex: 1 }, "vortex", { stat1: 1 }), e = k.mk(250, 300);
  const o = (mini) => ({ mini, dur: 0.5, rad: 10, dps: 0, launch: { hit: new Set() } });
  k.X.wheelDrone(s, 180, 300, 0, o(false)); k.run(0.55); const h0 = alive(k, (x) => x.kc === "wheel:kVortex")[0];
  k.run(0.5); const pulled = src(k, "vortex", e).length;
  killEnts(k); k.g.frame(); s.busy = 0;
  for (let i = 0; i < 8; i++) k.X.wheelDrone(s, 60 + i * 30, 200, 0, o(false));
  k.run(0.6); const cap = tagged(k, "wheel:kVortex");
  killEnts(k); k.g.frame(); s.busy = 0; let minis = 0; const N = 300;
  for (let i = 0; i < N; i++) { k.X.wheelDrone(s, 100, 200, 0, Object.assign(o(true), { dur: 0.01 })); frames(k, 2); minis += tagged(k, "wheel:kVortex"); killEnts(k); k.g.frame(); }
  line(5, "Drone collassante", "buco nero a fine durata:", !!h0, "a x", h0 ? h0.x.toFixed(0) : "-", "| colpi sul nemico", pulled, "| 8 droni → buchi neri", cap, "| mini-droni:", minis, "su", N, "(25%)",
    ok(h0 && Math.abs(h0.x - 250) < 10 && pulled > 10 && cap === 5 && within(minis, N, 0.25)));
}
{ // 6
  const k = setup(), [s] = T2(k, "wheel", { kTesla: 1 }, "tesla", { orb: 1 }); for (let i = 0; i < 8; i++) k.mk(40 + i * 40, 300);
  k.X.wheelDrone(s, 20, 300, 0, { mini: false, dur: 2.2, rad: 6, dps: 0, launch: { hit: new Set() } }); let mx = 0, made = 0;
  for (let i = 0; i < 140; i++) { k.g.frame(); const n = tagged(k, "wheel:kTesla"); mx = Math.max(mx, n); }
  made = src(k, "tesla").length;
  line(6, "Drone elettrostatico", "sfere statiche a schermo al massimo:", mx, "| danni elettrici delle sfere:", made > 0, ok(mx === 5 && made > 0));
}
{ // 7
  const k = setup(), [s, sky] = T2(k, "laser", { kSky: 1, multi1: 1 }, "sky", { burn1: 1 }), py = s.y - 8;
  const main = k.mk(s.x, py - 200), side = k.mk(s.x + Math.sin(0.17) * 300, py - Math.cos(0.17) * 300);
  k.X.laserFire(s); k.run(0.3);
  line(7, "Raggi incendiari", "raggio principale: brucia", main.burnT > 0 && main.skyBurnS === sky, "| mini-raggio: colpito", side.hp < side.maxHp, "brucia", side.burnT > 0,
    ok(main.burnT > 0 && main.skyBurnS === sky && side.hp < side.maxHp && side.burnT === 0));
}
{ // 8
  const k = setup(), [s, h] = T2(k, "laser", { kHive: 1 }, "hive", { seed1: 1, seed2: 1 }); for (let i = 0; i < 10; i++) k.mk(s.x, s.y - 108 - i * 40);
  let n = 0; const lv = new Set(), N = 40;
  for (let i = 0; i < N; i++) { k.X.laserFire(s); frames(k, 3); for (const d of alive(k, (o) => o.kc === "laser:kHive")) { n++; lv.add(d.lvl); } killEnts(k); k.g.frame(); s.busy = 0; s.cd = 1e9; }
  line(8, "Raggi a sciame", "droni nati:", n, "su", N * 10, "colpiti (10%) | livelli dei droni:", [...lv].sort().join(","), ok(within(n, N * 10, 0.1) && lv.has(2) && !lv.has(3)));
}
for (const sup of [{ boom1: 1 }, { boom1: 1, boomD: 1 }, { boom1: 1, boomD: 1, boom3: 1 }]) { // 9
  const k = setup(), [s] = T2(k, "laser", { kRail: 1 }, "rail", sup), es = [0, 1, 2].map((i) => k.mk(s.x, s.y - 130 - i * 90));
  k.X.laserFire(s); k.run(1.5);
  const per = es.map((e) => src(k, "rail", e).length), b = src(k, "rail")[0], f = sup.boom3 ? 0.8 : sup.boomD ? 0.65 : 0.5;
  line(9, "Raggi esplosivi " + Object.keys(sup).length, "esplosioni per colpito:", per.join(","), "| danno", b ? b.base.toFixed(1) : "-", "(32 × " + f + ")", ok(per.every((n) => n === 1) && near(b.base, 32 * f)));
}
for (const sup of [{ split1: 1 }, { split1: 1, split2: 1 }]) { // 10
  const k = setup(), [s] = T2(k, "beam", { kSky: 1 }, "sky", sup); k.mk(s.x, s.y - 160);
  // i mini-missili partono dal colpito e, con lui solo in campo, lo colpiscono subito: si contano gli impatti dei mini-missili (35% del danno della Sky Guard)
  k.X.beamFire(s); frames(k, 2); const n1 = src(k, "sky").length; k.run(1); const h = src(k, "sky");
  line(10, "Raggio frammentante" + (sup.split2 ? " (lv2)" : ""), "mini-missili al primo contatto:", n1, "| in 1 s (una volta per bersaglio):", h.length, "| danno", h.length ? h[0].base.toFixed(1) : "-", "(24 × 0,35)",
    ok(n1 === (sup.split2 ? 6 : 3) && h.length === n1 && h.every((x) => near(x.base, 8.4))));
}
for (const sup of [{ split1: 1 }, { split1: 1, split2: 1 }, { split1: 1, mass: 1 }]) { // 11
  const k = setup(), [s] = T2(k, "beam", { kRail: 1 }, "rail", sup), A = k.mk(s.x, s.y - 150), B = k.mk(s.x + 60, s.y - 150), C = k.mk(s.x + 120, s.y - 150);
  k.X.beamFire(s); k.g.frame(); const bm = alive(k, (o) => o.links)[0], hit = new Set(bm.links.map((l) => l[1]));
  const dA = src(k, "beam", A)[0].base, dB = src(k, "beam", B)[0].base;
  const expHit = sup.split2 ? 3 : 2, r = dB / dA;
  line(11, "Raggio diviso " + Object.keys(sup).join("+"), "bersagli:", hit.size, "(attesi " + expHit + ", senza combo 1) | danno ramificato/principale ×" + r.toFixed(2),
    ok(hit.size === expHit && hit.has(B) && hit.has(C) === !!sup.split2 && near(r, sup.mass ? 1.15 : 1, 1e-6)));
}
for (const sup of [{ fork1: 1 }, { fork1: 1, fork2: 1, forkW: 1 }]) { // 12
  const k = setup(), [s, t] = T2(k, "beam", { kThunder: 1 }, "thunder", sup); frames(k, 2);
  const A = k.mk(s.x, s.y - 150); k.X.beamFire(s); k.run(0.4);
  const h = src(k, "thunder", A), f = sup.forkW ? 0.75 : 0.5;
  line(12, "Raggio fulminante" + (sup.fork2 ? " (lv3)" : ""), "fulmini sul bersaglio:", h.length, "| danno", h.length ? h[0].base.toFixed(1) : "-", "(16 × " + f + ") | indebolito", A.weakT > 0, "| sfere:", (t.st.sph || []).length,
    ok(h.length === (sup.fork2 ? 2 : 1) && near(h[0].base, 16 * f) && (A.weakT > 0) === !!sup.forkW && t.st.sph.length > 0));
}
{ // 13
  const res = [];
  for (const sup of [{ sweep1: 1 }, { sweep1: 1, sweep3: 1 }, { sweep1: 1, sweep2: 1 }]) {
    const k = setup(), [s] = T2(k, "disr", { kLaser: 1 }, "laser", sup), E = k.mk(180, 300), O = k.mk(180, 274);
    k.X.disrFire(s); k.run(1.4);
    res.push({ d: src(k, "laser", E).reduce((a, x) => a + x.base, 0), off: src(k, "laser", O).length, slow: E.slowT });
  }
  line(13, "Campo laser", "danno in 1 s:", res[0].d.toFixed(1), "(18/s) | con Doppia spazzata ×" + (res[1].d / res[0].d).toFixed(2), "| nel campo fuori dal laser:", res[0].off, "| rallentato con Spazzata rallentante:", res[2].slow.toFixed(2), "s",
    ok(Math.abs(res[0].d - 18) < 0.8 && near(res[1].d / res[0].d, 2, 1e-6) && res[0].off === 0 && res[2].slow > 1.3 && res[0].slow < 0.5));
}
{ // 14
  const res = [];
  for (const sup of [{ amp1: 1 }, { amp1: 1, amp2: 1 }, { amp1: 1, amp2: 1, amp3: 1 }]) {
    const k = setup(), [s] = T2(k, "disr", { kBeam: 1 }, "beam", sup), E = k.mk(180, 300);
    k.X.disrFire(s); k.run(6.5); const b = src(k, "disr", E).map((x) => x.base);
    res.push({ first: b[0] / 8, max: Math.max(...b) / 8, up: b.every((v, i) => !i || v >= b[i - 1] - 1e-9) });
  }
  line(14, "Campo amplificato", "primo colpo ×" + res[0].first.toFixed(2), "| massimo ×" + res.map((r) => r.max.toFixed(2)).join(" / ×"), "(200%, 300%, 400%)",
    ok(Math.abs(res[0].first - 1.7) < 0.03 && res.every((r, i) => near(r.max, [2, 3, 4][i], 1e-6) && r.up)));
}
for (const sup of [{ salvo1: 1 }, { salvo1: 1, salvo2: 1 }]) { // 15
  const k = setup(), [s] = T2(k, "disr", { kAero: 1 }, "aero", sup), L = k.mk(60, 300), R = k.mk(300, 300);
  k.X.disrFire(s); k.run(2.5);
  const hl = src(k, "aero", L), hr = src(k, "aero", R), exp = sup.salvo2 ? 10 : 5;
  line(15, "Campo a schegge" + (sup.salvo2 ? " (lv3)" : ""), "schegge a segno da sinistra e da destra:", hl.length, hr.length, "(attese " + exp + " per lato) | danno", hl.length ? hl[0].base.toFixed(1) : "-",
    ok(hl.length === exp && hr.length === exp && [...hl, ...hr].every((x) => near(x.base, 7.2))));
}
{ // 16
  const k = setup(), [s, w] = T2(k, "hive", { kWheel: 1 }, "wheel", { trail1: 1, trailR: 1 }); k.mk(180, 200);
  k.X.hiveDrone(s, 180, 470, 1, 0); k.run(1.2); const tr = alive(k, (o) => o.kc === "hive:kWheel")[0];
  const p = tr && tr.pts[0], v = p ? k.mk(p.x, p.y) : null; k.run(0.1);
  killEnts(k); k.g.frame(); for (let i = 0; i < 8; i++) k.X.hiveDrone(s, 40 + i * 40, 470, 1, 0); k.run(1.2);
  line(16, "Droni incendiari", "scia del drone:", tr ? tr.pts.length + " punti" : "nessuna", "| nemico sulla scia: brucia", !!v && v.burnT > 0, "combustibile", !!v && v.fireVulnT > 0, "| 8 droni → scie", tagged(k, "hive:kWheel"),
    ok(tr && tr.pts.length > 3 && v.burnT > 0 && v.fireVulnT > 0 && tagged(k, "hive:kWheel") === 5));
}
for (const lvl of [1, 2]) { // 17
  const k = setup(), [s] = T2(k, "hive", { kBeam: 1 }, "beam", { amp1: 1 }), E = k.mk(180, 300);
  const d = k.X.hiveDrone(s, 180, 350, lvl, 0); k.run(0.7); const ray = !!d.ray; k.run(3.4);
  const b = src(k, "hive", E).map((x) => x.base / (12 * [1, 2][lvl - 1])), exp = [1, 1.7, 2, 2];
  line(17, "Droni a raggio lv" + lvl, "colpi del raggio:", b.length, "| danno ×" + b.map((v) => v.toFixed(2)).join(" ×"), "(un colpo × proiettili, +70% al secondo, max 200%) | raggio disegnato:", ray,
    ok(ray && b.length === 4 && b.every((v, i) => Math.abs(v - exp[i]) < 0.03)));
}
{ // 18
  const res = [];
  for (const sup of [{ orb: 1 }, { orb: 1, orbD: 1 }, { orb: 1, orbD: 1, orbDur: 1 }, { orb: 1, orbSlow: 1 }]) {
    const k = setup(), [s] = T2(k, "hive", { kTesla: 1 }, "tesla", sup), E = k.mk(180, 310), F = k.mk(300, 150);
    const d = k.X.hiveDrone(s, 180, 350, 1, 0); k.run(1);
    res.push({ d: src(k, "tesla", E).reduce((a, x) => a + x.base, 0), far: src(k, "tesla", F).length, slow: E.slowT > 0, spark: d.spark });
  }
  line(18, "Droni statici", "danno a contatto in 1 s:", res.slice(0, 3).map((r) => r.d.toFixed(1)).join(" / "), "(12, ×1,6, ×1,75) | lontano:", res[0].far, "| rallenta:", res[3].slow, res[0].slow, "| scintille:", res[0].spark,
    ok(Math.abs(res[0].d - 12) < 0.5 && Math.abs(res[1].d - 19.2) < 0.8 && Math.abs(res[2].d - 33.6) < 1.4 && !res[0].far && res[3].slow && !res[0].slow && res[0].spark));
}
{ // 19
  const k = setup(), [s, sky] = T2(k, "vortex", { kSky: 1 }, "sky", { burn1: 1 }), E = k.mk(180, 400);
  k.X.vortex(s, { x: 180, y: 500 }, -Math.PI / 2, null); k.run(1.2);
  line(19, "Buco nero incendiario", "il nemico attraversato brucia:", E.burnT > 0 && E.skyBurnS === sky, ok(E.burnT > 0 && E.skyBurnS === sky));
}
for (const sup of [{ fork1: 1 }, { fork1: 1, forkN: 1 }, { fork1: 1, forkX: 1 }]) { // 20
  const k = setup(), [s] = T2(k, "vortex", { kBeam: 1 }, "beam", sup);
  const A = k.mk(180, 420), B = k.mk(240, 380), C = k.mk(120, 300), D = k.mk(180, 470), F = k.mk(300, 150);
  k.X.vortex(s, { x: 180, y: 500 }, -Math.PI / 2, A); const v = alive(k, (o) => o.done)[0]; let y = v.y, down = 0;
  for (let i = 0; i < 300 && !v.dead; i++) { k.g.frame(); if (v.y > y + 1e-6) down++; y = v.y; }
  const order = [A, B, C, F].filter((e) => v.done.has(e)).length, booms = src(k, "beam").length;
  const exp = sup.forkN ? 4 : 3;
  line(20, "Buco nero ramificato " + Object.keys(sup).join("+"), "bersagli raggiunti:", v.done.size, "(attesi " + exp + ") | quello in basso:", v.done.has(D), "| passi verso il basso:", down, "| esplosioni:", booms,
    ok(v.done.size === exp && order === exp && !v.done.has(D) && down === 0 && (sup.forkX ? booms >= 3 && near(src(k, "beam")[0].base, 12) : booms === 0)));
}
{ // 21
  const res = [];
  for (const sup of [{ para1: 1 }, { para1: 1, para3: 1 }]) {
    const k = setup(), [s] = T2(k, "vortex", { kThunder: 1 }, "thunder", sup); for (let i = 0; i < 10; i++) k.mk(150 + (i % 5) * 15, 300 + Math.floor(i / 5) * 25);
    k.X.vortex(s, { x: 180, y: 500 }, -Math.PI / 2, null); k.run(3);
    const v = src(k, "vortex"); res.push({ zaps: k.g.win.__zap || 0, touched: new Set(v.map((x) => x.e)).size, first: v[0].base });
  }
  line(21, "Buco nero paralizzante", "tiri di paralisi:", res[0].zaps, "| nemici toccati:", res[0].touched, "| danno con Paralisi totale ×" + (res[1].first / res[0].first).toFixed(2),
    ok(res[0].zaps === res[0].touched && res[0].touched >= 8 && near(res[1].first / res[0].first, 1.3, 1e-6)));
}
for (const sup of [{ multi1: 1 }, { multi1: 1, multiD: 1, multi3: 1, multiW: 1 }]) { // 22
  const k = setup(), [s] = T2(k, "aero", { kLaser: 1 }, "laser", sup), E = k.mk(180, 300), N = 400; let n = 0, sp = null;
  for (let i = 0; i < N; i++) { E.y = 300; k.X.aeroBoom(s, 180, 300, false); const l = alive(k, (o) => o.kc === "aero:kLaser"); if (l.length) { n++; sp = sp || l[0]; } killEnts(k); }
  for (let i = 0; i < 50; i++) k.X.aeroBoom(s, 30, 100, false); const empty = tagged(k, "aero:kLaser");
  const nr = sp ? sp.rays.length : 0, dps = sp ? sp.rays[0].dps : 0;
  line(22, "Esplosioni a raggi" + (sup.multi3 ? " (lv3)" : ""), "laser rotanti:", n, "su", N, "colpi (10%) | raggi:", nr, "| danno/s", dps.toFixed(1), "| colpi a vuoto:", empty,
    ok(within(n, N, 0.1) && nr === (sup.multi3 ? 3 : 2) && near(dps, 20 * (sup.multiD ? 0.7 : 0.4)) && empty === 0));
}
{ // 23
  const k = setup(), [s] = T2(k, "aero", { kVortex: 1 }, "vortex", { stat1: 1, stat2: 1 }), E = k.mk(180, 300), N = 400; let n = 0, h = null;
  for (let i = 0; i < N; i++) { E.y = 300; k.X.aeroBoom(s, 180, 300, false); const l = alive(k, (o) => o.kc === "aero:kVortex"); if (l.length) { n++; h = h || l[0]; } killEnts(k); }
  for (let i = 0; i < 50; i++) k.X.aeroBoom(s, 30, 100, false);
  line(23, "Colpi singolari", "buchi neri statici:", n, "su", N, "colpi (10%) | durata", h ? h.t.toFixed(1) : "-", "s (Statico prolungato) | colpi a vuoto:", tagged(k, "aero:kVortex"),
    ok(within(n, N, 0.1) && h && near(h.t, 3) && tagged(k, "aero:kVortex") === 0));
}
for (const sup of [{ fork1: 1 }, { fork1: 1, fork2: 1 }]) { // 24
  const k = setup(), [s] = T2(k, "aero", { kThunder: 1 }, "thunder", sup); frames(k, 2); const es = [k.mk(180, 300), k.mk(200, 300), k.mk(160, 300)];
  k.X.aeroBoom(s, 180, 300, false); k.run(0.3); const h = src(k, "thunder");
  line(24, "Colpi fulminanti" + (sup.fork2 ? " (lv2)" : ""), "fulmini sui 3 colpiti:", h.length, "| per nemico:", es.map((e) => src(k, "thunder", e).length).join(","), ok(h.length === (sup.fork2 ? 6 : 3) && es.every((e) => src(k, "thunder", e).length === (sup.fork2 ? 2 : 1))));
}
{ // 25 e 26
  for (const [id, sid, sup, tag, label, n0] of [["kWheel", "wheel", { mini1: 1 }, "rail:kWheel", "Proiettili a mini-droni", 25], ["kHive", "hive", { seed1: 1 }, "rail:kHive", "Proiettili a sciame", 26]]) {
    const k = setup(), [s, w] = T2(k, "rail", { [id]: 1 }, sid, sup); for (let i = 0; i < 20; i++) k.mk(180, 500 - i * 20);
    let n = 0; const N = 20;
    for (let i = 0; i < N; i++) { k.X.railShot(s, 180, 540, -Math.PI / 2, { pierce: 1e9, hits: 0, child: false }); k.run(0.6); n += tagged(k, tag); killEnts(k); k.g.frame(); }
    line(n0, label, "nati:", n, "su", N * 20, "colpiti (10%) | torretta libera:", (w.busy || 0) === 0, ok(within(n, N * 20, 0.1) && (w.busy || 0) === 0));
  }
}
{ // 27
  const k = setup(), [s] = T2(k, "rail", { kVortex: 1 }, "vortex", { wh1: 1 }); const es = [480, 390, 300].map((y) => k.mk(180, y)); let n = 0, P = null; const N = 300;
  for (let i = 0; i < N; i++) { k.X.railShot(s, 180, 540, -Math.PI / 2, { pierce: 1e9, hits: 0, child: false }); k.run(0.6); const l = alive(k, (o) => o.kc === "rail:kVortex"); if (l.length) { n++; P = P || l[0]; } killEnts(k); k.g.frame(); }
  es.forEach((e) => { e.dead = true; }); k.mk(180, 400); let one = 0;
  for (let i = 0; i < 100; i++) { k.X.railShot(s, 180, 540, -Math.PI / 2, { pierce: 1e9, hits: 0, child: false }); k.run(0.6); one += tagged(k, "rail:kVortex"); killEnts(k); k.g.frame(); }
  line(27, "Proiettili a wormhole", "wormhole:", n, "su", N, "proiettili (10%) | ingresso y", P ? P.A.y.toFixed(0) : "-", "uscita y", P ? P.B.y.toFixed(0) : "-", "| con un solo colpito:", one,
    ok(within(n, N, 0.1) && P && P.A.y === 480 && P.B.y === 300 && one === 0));
}
{ // 28
  const k = setup(), [s] = T2(k, "thunder", { kWheel: 1 }, "wheel", { trail1: 1, trail3: 1 }); frames(k, 2); const E = k.mk(180, 250);
  k.X.thunderBolt(s, 180, 450, false, null); const tr = alive(k, (o) => o.kc === "thunder:kWheel")[0]; const t0 = tr ? tr.pts[0].t : 0; k.run(0.1);
  for (let i = 0; i < 8; i++) k.X.thunderBolt(s, 40 + i * 30, 450, false, null);
  line(28, "Fulmini di fuoco", "scia lungo il fulmine:", tr ? tr.pts.length + " punti" : "nessuna", "| durata", t0, "s (Scia persistente) | brucia:", E.burnT > 0, "| 9 fulmini → scie", tagged(k, "thunder:kWheel"),
    ok(tr && tr.pts.length >= 20 && t0 === 4 && E.burnT > 0 && tagged(k, "thunder:kWheel") === 5));
}
{ // 29
  const res = [];
  for (const sup of [{ wave1: 1 }, { wave1: 1, waveR: 1 }, { wave1: 1, wave3: 1 }, { wave1: 1, wave2: 1 }]) {
    const k = setup(), [s] = T2(k, "thunder", { kHive: 1 }, "hive", sup); const A = k.mk(180, 300), B = k.mk(280, 300), C = k.mk(340, 300);
    k.X.thunderBolt(s, 180, 450, false, null); res.push([300 - A.y, 300 - B.y, 300 - C.y, B.slowT > 0].map((v) => typeof v === "number" ? +v.toFixed(1) : v));
  }
  line(29, "Fulmini d’urto", "spinta colpito/a 100 px/a 160 px (base, Onda ampia, Onda finale):", res.slice(0, 3).map((r) => r.slice(0, 3).join("/")).join(" · "), "| rallenta con Onda rallentante:", res[3][3], res[0][3],
    ok(res[0].join() === "16,16,0,false" && res[1].join() === "16,16,16,false" && res[2].join() === "20.8,20.8,0,false" && res[3][3] === true));
}
for (const sup of [{ boom1: 1 }, { boom1: 1, boomD: 1 }]) { // 30
  const k = setup(), [s] = T2(k, "thunder", { kRail: 1 }, "rail", sup); const A = k.mk(180, 300), B = k.mk(180, 200);
  k.X.thunderBolt(s, 180, 450, false, null); const h = src(k, "rail");
  line(30, "Fulmini esplosivi" + (sup.boomD ? " (lv2)" : ""), "esplosioni:", h.length, "su A e B:", src(k, "rail", A).length, src(k, "rail", B).length, "| danno", h.length ? h[0].base.toFixed(1) : "-",
    ok(h.length === 2 && near(h[0].base, 32 * (sup.boomD ? 0.65 : 0.5))));
}
{ // 31
  const k = setup(), [s] = T2(k, "tesla", { kLaser: 1 }, "laser", { multi1: 1 }), E = k.mk(180, 300), N = 400; let n = 0;
  for (let i = 0; i < N; i++) { k.X.teslaBoom(s, 180, 300, 0, new Set()); n += tagged(k, "tesla:kLaser"); killEnts(k); }
  for (let i = 0; i < 50; i++) k.X.teslaBoom(s, 30, 100, 0, new Set());
  line(31, "Sfere a raggi", "laser rotanti:", n, "su", N, "esplosioni (10%) | a vuoto:", tagged(k, "tesla:kLaser"), ok(within(n, N, 0.1) && tagged(k, "tesla:kLaser") === 0));
}
{ // 32
  const k = setup(), [s] = T2(k, "tesla", { kDisr: 1 }, "disr", { tp1: 1 }), e = k.mk(180, 300), N = 2000; let moved = 0;
  for (let i = 0; i < N; i++) { e.y = 300; k.X.teslaBoom(s, 180, 300, 0, new Set()); if (e.y < 300) moved++; }
  line(32, "Sfere teletrasportanti", "esplosioni", N, "| tiri", k.g.win.__tp, "| teletrasportati", moved, "(attesi " + N * 0.05 + ")", ok(k.g.win.__tp === N && within(moved, N, 0.05)));
}
for (const sup of [{ mine1: 1 }, { mine1: 1, mine2: 1 }]) { // 33
  const k = setup(), [s] = T2(k, "tesla", { kAero: 1 }, "aero", sup);
  k.X.teslaBoom(s, 180, 300, 0, new Set()); const n1 = alive(k, (o) => o.mine).length;
  for (let i = 0; i < 30; i++) k.X.teslaBoom(s, 20 + i * 10, 200, 0, new Set());
  line(33, "Sfere minate" + (sup.mine2 ? " (lv2)" : ""), "mine per esplosione:", n1, "| dopo 31 esplosioni:", alive(k, (o) => o.mine).length, "(tetto 25)", ok(n1 === (sup.mine2 ? 2 : 1) && alive(k, (o) => o.mine).length === 25));
}

console.log("— Combo tra due torrette: tetti a schermo —");
{
  const k = setup(), v = k.tower("vortex", { stat1: 1, wh1: 1 }, 2), h = k.tower("hive", { seed1: 1 }, 2), w = k.tower("wheel", { mini1: 1, trail1: 1 }, 2), L = k.tower("laser", { multi1: 1 }, 2);
  [v, h, w, L].forEach((s) => { s.cd = 1e9; }); const e = k.mk(180, 300);
  const rows = [["buchi neri", (t) => k.X.kHole(t, v, 180, 300)], ["droni dell’Hive", (t) => k.X.kDrone(t, h, 180, 300)], ["mini-droni", (t) => k.X.kMini(t, w, 180, 300)],
    ["wormhole", (t) => k.X.kPortals(t, v, { x: 100, y: 300 }, { x: 200, y: 100 })], ["laser rotanti", (t) => k.X.kSpin(t, L, e)], ["scie di fuoco", (t) => k.X.kTrail(t, w)]];
  const out = rows.map(([name, fn]) => { for (let i = 0; i < 8; i++) fn("a:x"); fn("b:y"); const r = [name, tagged(k, "a:x"), tagged(k, "b:y")]; killEnts(k); k.g.frame(); return r; });
  console.log("8 richieste per combo → a schermo:", out.map((r) => r[0] + " " + r[1]).join(" · "), "| un’altra combo non ne risente:", out.every((r) => r[2] === 1), ok(out.every((r) => r[1] === k.X.K_CAP && r[2] === 1) && k.X.K_CAP === 5));
}
