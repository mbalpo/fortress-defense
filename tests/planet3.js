// Protezione planetaria, fase 3 (DESIGN.md § 17): nemici nuovi (4 per tipo, resistenza propria), ondate solo del tipo con gli speciali dall’ondata 3,
// kamikaze, scatto, immunità, invisibili (chi li vede e chi no), gusci (blocco, Atlante, esplosione sul guscio, durata), nomi e scoperte per tipo.
const { makeGame } = require("./bot.js");
const ok = (c) => c ? "✓" : "✗ ERRORE";
const patch = (h) => h.replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();");
const J = (ev, c) => JSON.parse(ev("JSON.stringify(" + c + ")"));
function fresh(eq, L) {
  const frags = {}; for (const id of eq || []) frags[id] = 200 * (1 + 0.5 * ((L || 1) - 1));
  const g = makeGame({ patch, cleared: 60, level: 30, storage: { "fortress-progress-v1": JSON.stringify({ cleared: 60, seen: [], planet: { lv: {}, frags, day: { d: "", n: 0 }, eq: eq || [] } }) } });
  g.frame(); g.key("Enter"); g.frame();
  const ev = g.win.__ev; ev("queue = []; enemies = []; player.cd = 1e9");
  return { g, ev };
}
// un nemico fermo a (x, y) con tanta vita (se hp non è dato)
const put = (ev, key, x, y, hp) => ev(`spawn({ enemy: "${key}", x: ${x} }); (() => { const e = enemies[enemies.length - 1]; e.y = ${y}; e.speed = 0; ${hp ? "" : "e.hp = e.maxHp = 1e6;"} return 0; })()`);

console.log("— Nemici e ondate —");
{
  const { ev } = fresh();
  const keys = J(ev, "Object.keys(ENEMY_DEFS).filter((k) => ENEMY_DEFS[k].planet)");
  const res = J(ev, "TYPE_KEYS.map((t) => ['l', 'm', 'p', 's'].map((v) => ENEMY_DEFS[t + '_' + v].selfRes))");
  console.log("nemici nuovi:", keys.length, "| resistenze al proprio tipo (leggero, medio, pesante, speciale):", res[0].join(" "), "| tutte tra 25% e 60%, diverse:",
    res.every((r) => new Set(r).size === 4 && r.every((x) => x >= 0.25 && x <= 0.6)), ok(keys.length === 20 && res.every((r) => new Set(r).size === 4 && r.every((x) => x >= 0.25 && x <= 0.6))));
  ev("clearRun(); openPlanet(); startPlanet('electric'); queue = []; enemies = []; pw.clr = [, true, true, true, true, true, true, true]; planetWave(8)");
  const q = J(ev, "queue.filter((x) => x.w === 8).map((x) => x.enemy)");
  console.log("ondata 8 di Asia:", [...new Set(q)].join(", "), "| speciali", q.filter((k) => k === "electric_s").length, "(1 + uno ogni 5 ondate dalla 3 = 2)",
    ok(q.every((k) => /^electric_[lmps]$/.test(k)) && q.filter((k) => k === "electric_s").length === 2));
  const q2 = (ev("queue = []; planetWave(2)"), J(ev, "queue.filter((x) => x.w === 2 && x.enemy.endsWith('_s')).length"));
  console.log("ondata 2: speciali", q2, ok(q2 === 0));
}

console.log("— Resistenza propria e speciali —");
{
  const { g, ev } = fresh();
  put(ev, "fire_m", 100, 200); put(ev, "fire_p", 180, 200);
  ev("damage(enemies[0], 100, 'fire', true); damage(enemies[0], 100, 'force', true); damage(enemies[1], 100, 'fire', true)");
  const lost = J(ev, "enemies.map((e) => Math.round(1e6 - e.hp))");
  console.log("fuoco su medio fire (40%) e forza (debolezza ×1,5): ", lost[0], "(60 + 150) | fuoco su pesante fire (60%):", lost[1], ok(lost[0] === 210 && lost[1] === 40));
  // kamikaze
  ev("enemies = []"); put(ev, "fire_s", 180, 200, true);
  ev("const k = enemies[0]; k.hp = k.maxHp * 0.5; k.y = GROUND_Y - DOME.ry - 4; window.__d0 = domeHp; window.__dmg = k.dmg");
  g.frame();
  const hit = ev("window.__d0 - domeHp"), exp = ev("window.__dmg * (1 + 4 * 0.5) * (1 - domeRed())");
  console.log("kamikaze a metà vita sulla cupola: danno", hit.toFixed(2), "(atteso", exp.toFixed(2) + ", ×3) | morto:", ev("enemies.length === 0"), ok(Math.abs(hit - exp) < 1e-6 && ev("enemies.length") === 0));
  // scatto
  ev("domeHp = domeMax; enemies = []"); put(ev, "electric_s", 180, 150, true);
  ev("const s = enemies[0]; s.hp = s.maxHp * 0.65"); g.frame(); const y1 = ev("enemies[0].y");
  ev("damage(enemies[0], enemies[0].maxHp * 0.1, 'physical', true)"); for (let i = 0; i < 30; i++) g.frame(); const y2 = ev("enemies[0].y");
  ev("damage(enemies[0], enemies[0].maxHp * 0.1, 'physical', true)"); for (let i = 0; i < 30; i++) g.frame(); const y3 = ev("enemies[0].y");
  console.log("scatto: al 65% fermo (" + Math.round(y1) + "), sotto il 60% giù di", Math.round(y2 - y1), "px, la seconda volta", Math.round(y3 - y2), "px", ok(Math.round(y1) === 150 && Math.abs(y2 - y1 - 120) < 2 && Math.abs(y3 - y2) < 1));
  // immunità
  ev("enemies = []"); put(ev, "energy_s", 180, 150);
  ev("const m = enemies[0]; m.immCd = 0.01; burn(m, 5, 50)"); g.frame(); g.frame();
  const im = ev("enemies[0].immT > 0"), h0 = ev("enemies[0].hp"); ev("damage(enemies[0], 500, 'fire')"); for (let i = 0; i < 30; i++) g.frame();
  const same = ev("enemies[0].hp") === h0;
  for (let i = 0; i < 100; i++) g.frame(); const after = ev("enemies[0].immT") <= 0 && ev("enemies[0].hp") < h0;
  console.log("immune: attiva", im, "| colpi e bruciatura senza effetto per 2 s:", same, "| dopo l’immunità la bruciatura riprende:", after, ok(im && same && after));
}

console.log("— Invisibili —");
{
  const { g, ev } = fresh();
  put(ev, "force_s", 180, 300);
  ev("damage(enemies[0], enemies[0].maxHp * 0.25, 'physical', true)"); const v1 = ev("!!enemies[0].invis");
  ev("damage(enemies[0], enemies[0].maxHp * 0.06, 'physical', true)"); const v2 = ev("!!enemies[0].invis");
  ev("player.cd = 0"); const tg = ev("pickTargets({ x: 180, y: 554 }, 9999, 1).length");
  const h0 = ev("enemies[0].hp"); ev("playerBullet(player, 180, 500, null, 50, -Math.PI / 2)"); for (let i = 0; i < 20; i++) g.frame(); const pass = ev("enemies[0].hp") === h0;
  ev("const L = makeShooter(TURRETS.laser, SLOT_X[0], GROUND_Y - 14); slots[0] = L; seeInvis = true; window.__lt = pickTargets({ x: L.x, y: L.y }, 9999, 1).length; seeInvis = false; slots[0] = null");
  ev("aeroBoom(makeShooter(TURRETS.aero, 90, GROUND_Y - 14), 180, 300, false)"); const area = ev("enemies[0].hp") < h0;
  console.log("invisibile dopo il 30%:", !v1, "→", v2, "| bersaglio del guardiano:", tg, "| colpo che passa attraverso:", pass, "| il Laser lo vede:", ev("window.__lt"), "| esplosione ad area lo colpisce:", area,
    ok(!v1 && v2 && tg === 0 && pass && ev("window.__lt") === 1 && area));
  const c = fresh(["iperione"], 5); put(c.ev, "force_s", 180, 300); c.ev("enemies[0].invis = true");
  const s0 = c.ev("enemies[0].hp"); c.ev("guardHit(enemies[0], 100, true)"); const d = s0 - c.ev("enemies[0].hp");
  c.ev("seeInvis = true; window.__gt = pickTargets({ x: 180, y: 554 }, 9999, 1).length; seeInvis = false");
  console.log("con Iperione al 5 il guardiano lo vede:", c.ev("window.__gt"), "| e conta solo la parte energy: 50 ×", c.ev("RESIST.force.energy"), "=", d, ok(c.ev("window.__gt") === 1 && Math.abs(d - 50) < 1e-6));
  const e2 = fresh(); put(e2.ev, "force_s", 180, 300); put(e2.ev, "force_m", 120, 300); e2.ev("enemies[0].invis = true");
  e2.ev("const S = makeShooter(TURRETS.sky, SLOT_X[0], GROUND_Y - 14); slots[0] = S; S.cd = 0"); for (let i = 0; i < 8; i++) e2.g.frame();
  const tgs = J(e2.ev, "ents.filter((o) => o.t && o.t.def).map((o) => o.t.def.look)");
  console.log("Sky Guard: missili solo sul visibile:", tgs.join(","), ok(tgs.length > 0 && tgs.every((l) => l === "gem")));
}

{ // 1.18.1 (Marco): tornano visibili toccando la barriera o con uno stato di una torretta che li vede; non ridiventano invisibili
  const { g, ev } = fresh();
  put(ev, "force_s", 120, 300); put(ev, "force_s", 240, 300);
  ev("enemies.forEach((e) => damage(e, e.maxHp * 0.35, 'physical', true))");
  ev("slow(enemies[1], 2); para(enemies[1], 1)"); const other = ev("!!enemies[1].invis");   // stato senza una torretta che lo vede: resta invisibile
  ev("destruction(makeShooter(TURRETS.disr, 90, GROUND_Y - 14), enemies[0], 5)"); const st = ev("!enemies[0].invis");
  ev("damage(enemies[0], enemies[0].maxHp * 0.1, 'physical', true)"); const again = ev("!enemies[0].invis");
  ev("enemies[1].y = GROUND_Y - DOME.ry - 4"); g.frame(); const dome = ev("!enemies[1].invis");
  console.log("stato senza torretta che lo vede: resta invisibile", other, "| distruzione del Disruption Drone: visibile", st, "e non torna invisibile", again, "| tocca la barriera: visibile", dome,
    "| ora è un bersaglio del guardiano:", ev("pickTargets({ x: 180, y: 554 }, 9999, 3).length"), ok(other && st && again && dome && ev("pickTargets({ x: 180, y: 554 }, 9999, 3).length") === 2));
}

console.log("— Gusci —");
{
  const { g, ev } = fresh();
  put(ev, "physical_s", 180, 420, true); ev("damage(enemies[0], 1e9, 'fire')"); g.frame();
  console.log("carapace sconfitto: gusci", ev("shells.length"), "| nemici", ev("enemies.length"), "| non è un bersaglio:", ev("pickTargets({ x: 180, y: 554 }, 9999, 3).length") === 0,
    ok(ev("shells.length") === 1 && ev("enemies.length") === 0 && ev("pickTargets({ x: 180, y: 554 }, 9999, 3).length") === 0));
  put(ev, "physical_m", 180, 320); const h0 = ev("enemies[0].hp");
  ev("playerBullet(player, 180, 520, null, 50, -Math.PI / 2)"); for (let i = 0; i < 30; i++) g.frame();
  console.log("colpo del guardiano bloccato dal guscio:", ev("enemies[0].hp") === h0, ok(ev("enemies[0].hp") === h0));
  const fired = ev("aeroFire(makeShooter(TURRETS.aero, 180, GROUND_Y - 14))"); for (let i = 0; i < 40; i++) g.frame();
  console.log("bomba dell’Aeroblast lanciata:", fired, "| esplode sul guscio, il medio dietro resta intatto:", ev("enemies[0].hp") === h0, ok(fired && ev("enemies[0].hp") === h0));
  for (let i = 0; i < 260; i++) g.frame();
  console.log("dopo 4 s il guscio sparisce:", ev("shells.length"), ok(ev("shells.length") === 0));
  const a = fresh(["atlante"], 10); a.ev("shells.push({ x: 180, y: 420, r: 17, t: 4, max: 4 })"); put(a.ev, "physical_m", 180, 320); const a0 = a.ev("enemies[0].hp");
  a.ev("playerBullet(player, 180, 520, null, 50, -Math.PI / 2)"); for (let i = 0; i < 30; i++) a.g.frame();
  console.log("con Atlante al 10 il colpo attraversa il guscio:", a.ev("enemies[0].hp") < a0, ok(a.ev("enemies[0].hp") < a0));
}

console.log("— Scoperte e nomi —");
{
  const { g, ev } = fresh();
  put(ev, "fire_l", 100, 100); put(ev, "energy_l", 200, 100); g.frame();
  const seen = J(ev, "progress.seen"), names = J(ev, "['dart', 'gem', 'tank', 'bomb', 'wraith', 'spark', 'prism', 'crab'].map((l) => DRAW.ENEMY_NAME[l])");
  console.log("scoperte per tipo:", seen.join(", "), "| nomi:", names.join(", "), ok(seen.includes("dart:fire") && seen.includes("dart:energy") && names.every(Boolean)));
  console.log("errori JS:", g.errors[0] || "nessuno", ok(!g.errors.length));
}
