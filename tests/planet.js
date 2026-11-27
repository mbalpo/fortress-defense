// Protezione planetaria, fase 1 (DESIGN.md § 17): apertura dal 60, griglia dei continenti, tipo del giorno, limite di 2 partite,
// ondate sovrapposte con il tempo per ondata, scelte in coda (gioco fermo), ricompensa del mini-boss subito, boss all’ondata 18 che conta come ondata 20,
// frammenti (vittoria, sconfitta, abbandono, ×2), salvataggio versione 7, partita sospesa a ondata ripulita.
const { makeGame } = require("./bot.js");
const ok = (c) => c ? "✓" : "✗ ERRORE";
const patch = (h) => h.replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();");
// giorno fisso: 2026-11-16 è lunedì (physical); il 19 giovedì (electric)
const fresh = (cleared, extra, day) => {
  const prog = Object.assign({ cleared, seen: [] }, extra || {});
  const g = makeGame({ patch, cleared, level: Math.min(cleared + 1, 200), storage: { "fortress-progress-v1": JSON.stringify(prog) } }); g.frame();
  const ev = g.win.__ev; ev(`planetNow = () => new Date(2026, 10, ${day || 19}, 12)`);
  return { g, ev, stored: () => JSON.parse(g.win.localStorage.getItem("fortress-progress-v1")) };
};
const killWave = (ev, n) => ev(`queue = queue.filter((q) => q.w !== ${n}); enemies.filter((e) => e.w === ${n}).forEach((e) => damage(e, 1e9, "physical", true))`);
const tough = (ev) => ev("enemies.forEach((e) => { e.hp = 1e9; e.maxHp = 1e9; e.speed = 0; })");   // nessuno muore e nessuno arriva alla cupola

console.log("— Apertura, griglia e tipo del giorno —");
{
  const a = fresh(59); a.ev("openPlanet()"); a.g.frame();
  const b = fresh(60); b.g.texts.length = 0; b.g.frame(); const menuT = [...b.g.texts];
  b.ev("openPlanet()"); b.g.texts.length = 0; b.g.frame(); const T = [...b.g.texts];
  console.log("prima del 60: stato", a.ev("state"), "| dal 60: menu con “Protezione planetaria”", menuT.includes("Protezione planetaria"), "→ stato", b.ev("state"),
    ok(a.ev("state") === "menu" && menuT.includes("Protezione planetaria") && b.ev("state") === "planet"));
  const lands = ["Europa", "Africa", "Asia", "Americhe", "Oceania"];
  console.log("griglia: continenti", lands.filter((l) => T.includes(l)).join(", "), "| livello e tipo:", T.includes("Livello 1 · nemici fire"), "| ×2:", T.includes("×2"),
    ok(lands.every((l) => T.includes(l)) && T.includes("Livello 1 · nemici fire") && T.includes("×2")));
  const days = [16, 17, 18, 19, 20].map((d) => b.ev(`dayType(new Date(2026, 10, ${d}, 12))`));
  const sat = b.ev("dayType(new Date(2026, 10, 21, 9))"), sat2 = b.ev("dayType(new Date(2026, 10, 21, 22))"), sun = b.ev("dayType(new Date(2026, 10, 22, 12))");
  console.log("tipo del giorno lun-ven:", days.join(" "), "| sabato", sat, "(stesso tipo la sera:", (sat === sat2) + ")", "| domenica", sun,
    ok(days.join(" ") === "physical force energy electric fire" && sat === sat2 && b.ev("PLANET.order").includes(sat) && b.ev("PLANET.order").includes(sun)));
}

console.log("— Limite di 2 partite al giorno —");
{
  const { ev } = fresh(60);
  ev("openPlanet()"); const s1 = ev("startPlanet('fire')"); ev("toMenu(); openPlanet()"); const s2 = ev("startPlanet('force')"); ev("toMenu(); openPlanet()");
  const s3 = ev("startPlanet('asia')"), s4 = ev("startPlanet('electric')");
  console.log("partite: prima", s1, "| seconda", s2, "| terza", s4, "(“" + ev("planetMsg") + "”) | rimaste", ev("gamesLeft()"),
    ok(s1 && s2 && !s3 && !s4 && ev("gamesLeft()") === 0 && ev("planetMsg") === "Partite di oggi finite: torna domani"));
  ev("planetNow = () => new Date(2026, 10, 20, 8)");
  console.log("il giorno dopo: rimaste", ev("gamesLeft()"), ok(ev("gamesLeft()") === 2));
}

console.log("— Partita: nemici del tipo, ondate sovrapposte, scelte in coda —");
{
  const { g, ev } = fresh(60);
  ev("openPlanet(); startPlanet('fire')");
  for (let i = 0; i < 200; i++) g.frame();
  const kinds = ev("[...new Set(enemies.map((e) => e.def.look + ':' + e.def.type))].join()");
  console.log("partita: modalità", ev("mode"), "| livello", ev("campLevel"), "| difficoltà", ev("curDiff()"), "| nemici", kinds,
    ok(ev("mode") === "planet" && ev("campLevel") === 1 && ev("curDiff()") === 60 && kinds.split(",").every((k) => /^(dart|gem|tank|bomb):fire$/.test(k))));   // dalla 1.18.0 i nemici nuovi del tipo
  tough(ev);
  const next = ev("pw.next"); let f = 0;
  while (ev("wave") === 1 && f++ < 3000) { g.frame(); tough(ev); }
  console.log("ondata 2 partita a", ev("waveTime.toFixed(1)"), "s (previsto", next.toFixed(1) + ") con", ev("enemies.filter((e) => e.w === 1).length"), "nemici dell’ondata 1 in campo | stato", ev("state"),
    ok(ev("wave") === 2 && Math.abs(ev("waveTime") - next) < 0.2 && ev("enemies.filter((e) => e.w === 1).length") > 0 && ev("state") === "play"));
  for (let i = 0; i < 60; i++) { g.frame(); tough(ev); }
  killWave(ev, 1); killWave(ev, 2); g.frame();
  const t0 = ev("waveTime"), st = ev("state"), q = ev("pw.choices.length");
  for (let i = 0; i < 30; i++) g.frame();
  console.log("ondate 1 e 2 ripulite insieme: stato", st, "| scelte in coda", q, "| tempo fermo durante le carte:", ev("waveTime") === t0,
    ok(st === "upgrade" && q === 1 && ev("waveTime") === t0 && ev("options.length") >= 1));
  g.key("1"); g.frame(); const st2 = ev("state"); g.key("1"); g.frame();
  console.log("prima scelta → di nuovo le carte:", st2, "| seconda scelta → in battaglia:", ev("state"), "| scelte prese", ev("runPicks"),
    ok(st2 === "upgrade" && ev("state") === "play" && ev("runPicks") === 2));
  const sv = ev("JSON.stringify({ w: suspended.wave, pt: suspended.pt, pq: suspended.pq, cards: suspended.cards.length })");
  console.log("salvata a ondata ripulita:", sv, ok(sv === JSON.stringify({ w: 3, pt: "fire", pq: [], cards: 2 })));
}

console.log("— Mini-boss e boss —");
{
  const { g, ev } = fresh(60);
  ev("openPlanet(); startPlanet('energy')"); g.frame();
  ev("pw.clr = [, true, true, true, true]; queue = []; enemies = []; planetWave(5)");
  let f = 0; while (!ev("enemies.some((e) => e.boss)") && f++ < 600) g.frame();
  tough(ev); const bt = ev("enemies.find((e) => e.boss).def.type");
  ev("enemies.filter((e) => e.boss).forEach((e) => { e.hp = 1; damage(e, 10, 'fire') })"); g.frame();
  console.log("mini-boss (tipo " + bt + ") sconfitto con l’ondata 5 ancora in campo: stato", ev("state"), "| ricompensa", ev("rewards ? rewards.length : 0"), "carte | mini-boss", ev("pw.mb"),
    ok(bt === "energy" && ev("state") === "upgrade" && ev("rewards.length") === 3 && ev("pw.mb") === 1 && ev("enemies.some((e) => e.w === 5 && !e.boss)")));
  g.key("1"); g.frame();
  console.log("Continua → in battaglia:", ev("state"), ok(ev("state") === "play"));
  ev("queue = []; enemies = []; for (let k = 1; k < 18; k++) pw.clr[k] = true; planetWave(18)");
  const bq = ev("JSON.stringify(queue.filter((q) => q.def && q.def.final).map((q) => q.w))");
  f = 0; while (!ev("enemies.some((e) => e.final)") && f++ < 600) g.frame();
  const D = ev("curDiff()"), T = ev(`[18, 19, 20].reduce((a, n) => a + planetWaveT(n, ${D}), 0) - 2`), v = ev("enemies.find((e) => e.final).speed");
  console.log("boss all’ondata 18 con il numero d’ondata", bq, "| bordo inferiore dopo le ondate 18-20:", Math.round(v * T), "px (metà schermo 320)",
    ok(bq === "[20]" && Math.abs(v * T - 320) < 1));
  ev("enemies.filter((e) => e.final).forEach((e) => { e.hp = 1e9; e.maxHp = 1e9; e.speed = 0; })");
  killWave(ev, 18); g.frame();
  console.log("ondata 18 ripulita con il boss vivo: carte", ev("state"), ok(ev("state") === "upgrade" && ev("enemies.some((e) => e.final)")));
}

console.log("— Fine partita e frammenti —");
{
  const { g, ev, stored } = fresh(60);
  ev("openPlanet(); startPlanet('fire')"); g.frame();   // giovedì: tipo del giorno electric, fire senza ×2
  ev("pw.mb = 2; queue = []; enemies = []; for (let k = 1; k < 20; k++) pw.clr[k] = true; planetWave(20); queue = []"); g.frame();
  const gain = JSON.parse(ev("JSON.stringify(planetGain)")), p = stored().planet;
  console.log("vittoria al livello 1:", ev("state"), "| livelli fire", p.lv.fire, "| frammenti", gain.n, "(attesi 10 × (0,7 + 0,2 + 0,5 di completamento, 1.28.0) = 14) divisi", JSON.stringify(gain.parts),
    "| salvati", p.frags.alfa + p.frags.prometeo, ok(ev("state") === "won" && p.lv.fire === 1 && gain.n === 14 && !gain.x2 && p.frags.alfa + p.frags.prometeo === 14));
  g.texts.length = 0; g.frame();
  console.log("schermata:", g.texts.includes("+14 frammenti"), g.texts.includes("Protezione planetaria"), ok(g.texts.includes("+14 frammenti") && g.texts.includes("Protezione planetaria")));
  ev("nextOrRetry()"); ev("startPlanet('fire')");
  console.log("partita successiva: livello", ev("campLevel"), "difficoltà", ev("curDiff()"), ok(ev("campLevel") === 2 && ev("curDiff()") === 65));
  const c = fresh(60); c.ev("openPlanet(); startPlanet('electric')"); c.g.frame();   // tipo del giorno: ×2
  c.ev("pw.mb = 1; wave = 10; domeHp = 0"); c.g.frame();
  const lg = JSON.parse(c.ev("JSON.stringify(planetGain)"));
  console.log("sconfitta all’ondata 10 con 1 mini-boss nel giorno del tipo: frammenti", lg.n, "(10 × (0,35 + 0,1) × 2 = 9)", ok(c.ev("state") === "lost" && lg.n === 9 && lg.x2));
  const d = fresh(60); d.ev("openPlanet(); startPlanet('force')"); d.g.frame(); d.ev("wave = 4; pauseGame(); toMenu()");
  console.log("abbandonata all’ondata 4: frammenti", d.stored().planet.frags.omega + d.stored().planet.frags.mnemosine, "(10 × 0,14 = 1)", ok(d.stored().planet.frags.omega + d.stored().planet.frags.mnemosine === 1));
}

console.log("— Salvataggio e partita sospesa —");
{
  const { g, ev } = fresh(60, { planet: { lv: { fire: 3, force: 1 }, frags: { alfa: 12, ceo: 4, xyz: 9 }, day: { d: "2026-11-19", n: 1 } } });
  const save = JSON.parse(ev("JSON.stringify(makeSave())"));
  console.log("esportato: versione", save.version, "| planet", JSON.stringify(save.progress.planet.lv), "| frammenti Alfa", save.progress.planet.frags.alfa, "| sconosciuti tolti", !("xyz" in save.progress.planet.frags),
    ok(save.version === 9 && save.progress.planet.lv.fire === 3 && save.progress.planet.lv.energy === 0 && save.progress.planet.frags.alfa === 12 && !("xyz" in save.progress.planet.frags)));
  const v6 = JSON.parse(ev(`JSON.stringify(parseSave(JSON.stringify({ game: "fortress-defense", version: 6, progress: { cleared: 70, seen: [] } })))`));
  console.log("versione 6 importata: Protezione planetaria da zero", JSON.stringify(v6.planet.lv), ok(Object.values(v6.planet.lv).every((n) => n === 0) && v6.planet.day.n === 0));
  console.log("partite di oggi dal salvataggio: rimaste", ev("gamesLeft()"), ok(ev("gamesLeft()") === 1));
  ev("openPlanet(); startPlanet('fire')"); g.frame(); tough(ev);
  for (let i = 0; i < 30; i++) g.frame();
  killWave(ev, 1); g.frame();
  const run = g.win.localStorage.getItem("fortress-run-v1");
  const h = makeGame({ patch, cleared: 60, level: 61, storage: { "fortress-progress-v1": g.win.localStorage.getItem("fortress-progress-v1"), "fortress-run-v1": run } }); h.frame();
  const ev2 = h.win.__ev; ev2("planetNow = () => new Date(2026, 10, 19, 13)");
  h.texts.length = 0; h.frame();
  const cont = h.texts.find((t) => /^Europa · livello 4 · ondata 2\/20$/.test(t));
  ev2("continueRun()"); h.frame();
  console.log("ripresa: menu “" + cont + "” → modalità", ev2("mode"), "ondata", ev2("wave"), "| scelte in coda", ev2("pw.choices.length"), "| partite rimaste", ev2("gamesLeft()"), "(Continua non conta)",
    ok(!!cont && ev2("mode") === "planet" && ev2("wave") === 2 && ev2("pw.choices.length") === 1 && ev2("gamesLeft()") === 0));
  console.log("errori JS:", g.errors[0] || h.errors[0] || "nessuno", ok(!g.errors.length && !h.errors.length));
}
