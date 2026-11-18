// 1.14.2: Gravity Vortex Gun revisione 3, testi delle abilità con il cooldown effettivo, raggio d’azione al tocco su una torretta.
const { makeGame } = require("./bot.js");
const ok = (c) => c ? "✓" : "✗ ERRORE";
const patch = (h) => h.replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();");
const fresh = (cleared, extra) => {
  const prog = Object.assign({ cleared, seen: [], majors: 0 }, extra || {});
  const g = makeGame({ patch, cleared, storage: { "fortress-progress-v1": JSON.stringify(prog) } }); g.frame();
  return { g, ev: g.win.__ev };
};

console.log("— Gravity Vortex Gun, revisione 3 —");
{
  const { ev } = fresh(40, { tree: { "vortex:std:len": 3 } });
  ev("startRun('standard'); window.__v = (n) => { const s = makeShooter(TURRETS.vortex, SLOT_X[0], GROUND_Y - 14); s.up.len = n; return s; }");
  const reach = [0, 1, 2, 3].map((n) => Math.round(ev(`vortexReach(__v(${n}))`)));
  const len3 = Math.round(ev("vortexLen(__v(3))"));
  console.log("portata di partenza con 0-3 pile:", reach.join(" · "), "px | percorso con 3 pile e nodo al 3:", len3, "px (il nodo non allunga)",
    ok(reach.join() === "260,304,354,405" && len3 === 405));
  // danno: +2% per pila e per livello del nodo (nodo al 3, 2 pile → +12%)
  const dps = (n) => ev(`(() => { const s = __v(${n}); slots[0] = s; let d = 0; vortex(s, { x: 72, y: 500 }, -Math.PI / 2); const v = ents[ents.length - 1];
    spawn({ enemy: 'brute', x: 72 }); const e = enemies[enemies.length - 1]; Object.assign(e, { x: v.x, y: v.y, hp: 1e9, maxHp: 1e9, speed: 0 }); const h0 = e.hp;
    v.update(0.05); const r = h0 - e.hp; e.dead = true; v.dead = true; return r; })()`);
  const k = dps(2) / dps(0);
  console.log("danno del buco nero, 2 pile con il nodo al 3: ×" + k.toFixed(3), "(atteso 1,12)", ok(Math.abs(k - 1.12) < 0.005));
  const t = ev("TREE_NODE['vortex:std:len'].fx(3)"), c = ev("TURRETS.vortex.ups.find((u) => u.id === 'len').desc");
  console.log("testi: nodo al 3 “" + t + "” | carta “" + c + "”", ok(t === "percorso +20% e danno +6% per pila" && c === "Lunghezza percorsa +20%"));
}

console.log("— Abilità: cooldown effettivo nei testi —");
{
  const { ev } = fresh(45, { tree: { "barrier:hp": 5, "barrier:red": 1, "barrier:cd": 2, "ab:regen": 1, "ab:repulse": 1, "ab:impen": 1, "ab:backup": 1 },
    gear: { pcs: {}, mods: {}, eq: { armatura: { r: 0, m: [[15, 4]] } } } });
  // fuori partita GEAR è vuoto: il testo usa l’equipaggiamento attuale (Modulo 15 ancestrale −25%) + albero (2 × 5%) = −35% → 26 s
  const rep = ev("TREE_NODE['ab:repulse'].fx(1)"), reg = ev("TREE_NODE['ab:regen'].fx(1)"), imp = ev("TREE_NODE['ab:impen'].fx(1)"), bk = ev("TREE_NODE['ab:backup'].fx(1)");
  console.log("Repulsiva “" + rep + "” | Rigenerazione “" + reg + "” | Impenetrabile “" + imp + "” | Backup “" + bk + "” | GEAR in menu", ev("GEAR.abCd"),
    ok(rep === "spinta 50 px · ogni 26 s" && reg === "sotto il 40%: 2%/s per 5 s, ×1 · attesa 10 s" && imp === "scudo ogni 26 s" && bk === "una volta: la vita torna al 20%" && ev("GEAR.abCd") === 0));
  ev("startRun('standard')");
  const real = ev("AB_CD * abCdM()");
  console.log("in partita il ciclo vero è", real, "s, come nel testo", ok(Math.abs(real - 26) < 1e-9));
}

console.log("— Raggio d’azione al tocco —");
{
  const { g, ev } = fresh(45);
  ev("selLevel = 45; startRun('standard'); queue = []; enemies.length = 0; spawn({ enemy: 'shell', x: 300 }); Object.assign(enemies[0], { y: 100, speed: 0, hp: 1e12, maxHp: 1e12 });" +
    "slots[0] = makeShooter(TURRETS.aero, SLOT_X[0], GROUND_Y - 14); const v = makeShooter(TURRETS.vortex, SLOT_X[1], GROUND_Y - 14); v.up.len = 2; slots[1] = v; slots[2] = makeShooter(TURRETS.sky, SLOT_X[2], GROUND_Y - 14);" +
    "player.x = player.targetX = 300;");
  for (let i = 0; i < 40; i++) g.frame();
  const ty = ev("GROUND_Y - 14");
  g.click(72, ty); g.frame(); g.frame(); g.up(72, ty); g.frame();
  console.log("tocco rapido sull’Aeroblast: raggio sullo slot", ev("rangeShow && rangeShow.i"), "| raggio", ev("rangeReach(slots[0])"), "px | guardiano fermo:", ev("player.targetX"), "| premuto:", ev("pressing"),
    ok(ev("rangeShow && rangeShow.i") === 0 && ev("player.targetX") === 300 && !ev("pressing")));
  g.click(144, ty); g.up(144, ty); g.frame();
  console.log("tocco sul Vortex: sostituisce il precedente → slot", ev("rangeShow.i"), "| raggio reale di partenza", Math.round(ev("rangeReach(slots[1])")), "px", ok(ev("rangeShow.i") === 1 && Math.round(ev("rangeReach(slots[1])")) === 354));
  const sky = ev("rangeReach(slots[2])"), aeroMax = ev("(() => { const s = makeShooter(TURRETS.aero, 0, 0); s.up.reach = 1; s.up.reach2 = 1; return rangeOf(s); })()");
  console.log("velo oltre", ev("RANGE_TAP.veil"), "px: Sky Guard", sky, "→ velo", sky > 500, "| Aeroblast con i due bonus", aeroMax, "→ arco", aeroMax <= 500, ok(sky > 500 && aeroMax <= 500));
  // portata dal punto di partenza del guardiano (centro in basso): Aeroblast nello slot di sinistra, nemico a destra
  const far = ev("(() => { spawn({ enemy: 'shell', x: 300 }); const e = enemies[enemies.length - 1]; Object.assign(e, { x: 300, y: 400, speed: 0, hp: 1e9, maxHp: 1e9 }); const r = [inReach(e, 260), dist(e.x, e.y, SLOT_X[0], GROUND_Y - 14) > 260 + e.def.r, pickTargets({ x: SLOT_X[0], y: GROUND_Y - 22 }, 260, 9).includes(e)]; e.dead = true; return r.join(); })()");
  console.log("portata dal centro in basso: nemico a (300, 400) nel raggio dell’Aeroblast a sinistra", far, "(dentro dal centro, fuori dalla torretta, bersaglio)", ok(far === "true,true,true"));
  for (let i = 0; i < 125; i++) g.frame();
  console.log("dopo 2 s il raggio sparisce:", ev("rangeShow"), ok(ev("rangeShow") === null));
  g.click(216, ty); for (let i = 0; i < 25; i++) g.frame();
  console.log("pressione lunga (0,4 s) sulla torretta: guardiano verso", Math.round(ev("player.targetX")), "| premuto", ev("pressing"), "| niente raggio al rilascio:", (g.up(216, ty), ev("rangeShow")),
    ok(Math.round(ev("player.targetX")) === 216 && ev("rangeShow") === null));
  ev("player.targetX = 300"); g.click(72, ty); g.move(100, ty - 10); const mv = ev("player.targetX"), pr = ev("pressing"); g.up(100, ty - 10);
  console.log("tocco che si sposta di 30 px: guardiano verso", mv, "| premuto", pr, "| raggio", ev("rangeShow"), ok(mv === 100 && pr && ev("rangeShow") === null));
  ev("pauseGame()"); g.click(72, ty - 4); g.up(72, ty - 4); g.frame();
  console.log("in pausa: tocco sull’Aeroblast → raggio slot", ev("rangeShow && rangeShow.i"), "| stato", ev("state"), ok(ev("rangeShow && rangeShow.i") === 0 && ev("state") === "pause"));
  ev("resumeGame(); state = 'upgrade'"); g.frame();
  console.log("scelta delle carte: raggio tolto", ev("rangeShow"), "| tocco sulla torretta senza effetto", (g.click(72, ty), g.up(72, ty), ev("rangeShow")), "| errori JS:", g.errors.length ? g.errors[0] : "nessuno",
    ok(ev("rangeShow") === null && !g.errors.length));
}
