// 1.23.0 (DESIGN.md § 17 “Mini-boss maggiori”): cinque mini-boss con un’abilità, ognuno in tutti e cinque i tipi.
// Rampa della campagna per difficoltà (Standard 70/85/100 = Epica 40/55/70: ondata 15, poi 10 e 15, poi 5, 10 e 15), Protezione planetaria per livello (3-4, 5-6, da 7);
// scelta deterministica (abilità diverse nello stesso livello, 25 combinazioni nel tempo); Scissione, Adattamento, Incremento, Invisibilità con il raggio, Deviazione;
// ricompensa solo all’ultimo pezzo; scoperte per abilità e tipo, avviso, scheda Nemici, HD-2D.
const { makeGame } = require("./bot.js");
const ok = (c) => c ? "✓" : "✗ ERRORE";
const patch = (h) => h.replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();");
const J = (ev, c) => JSON.parse(ev("JSON.stringify(" + c + ")"));
const errors = [];
function run(mode, lv, settings, seen) {
  const g = makeGame({ patch, seed: 5, settings, storage: { "fortress-progress-v1": JSON.stringify({ cleared: 200, clearedEpic: 200, seen: seen || [] }) } });
  g.frame(); const ev = g.win.__ev;
  ev(`setSel("${mode}", ${lv}); startRun("${mode}")`);
  return { g, ev };
}
function planet(t, L, settings) {
  const g = makeGame({ patch, seed: 5, settings, storage: { "fortress-progress-v1": JSON.stringify({ cleared: 60, seen: [], planet: { lv: { [t]: L - 1 }, frags: {}, day: { d: "", n: 0 }, eq: [] } }) } });
  g.frame(); const ev = g.win.__ev;
  ev(`openPlanet(); startPlanet("${t}")`);
  return { g, ev };
}
// ondate con un mini-boss maggiore (dalle code vere di startWave / planetWave)
const MAJ_WAVES = `(() => { const o = []; for (const n of [5, 10, 15]) { pw ? planetWave(n) : startWave(n); const q = queue.find((q) => q.def && q.def.boss && !q.def.final && (!pw || q.w === n));
  if (q && q.def.major) o.push(n + ":" + q.def.major + ":" + q.def.type); } return o; })()`;
// campo vuoto con un mini-boss dell’abilità ab (tipo t) a metà schermo, fermo
const SOLO = (ab, t, y) => `queue = [{ t: 1e9, enemy: "drone", x: 100 }]; enemies = []; ents = []; floaters = []; waveTime = 0.5; wave = 15;
  { const d = Object.assign(bossDef(campLevel, 15), { type: "${t}" }); const M = MAJOR_DEF["${ab}"]; Object.assign(d, { major: "${ab}", look: M.look, name: M.name, r: M.r, gl: 1, split: "${ab}" === "split" ? MAJ.splits : 0, stopAt: "${ab}" === "invis" ? H * MAJ.stopAt : 0 });
    spawn({ enemy: "boss", def: d, x: 180 }); window.B = enemies[enemies.length - 1]; B.y = ${y || 250}; }`;
const foe = (k, x, y, hp) => `spawn({ enemy: "${k}", x: ${x} }); Object.assign(enemies[enemies.length - 1], { x: ${x}, y: ${y}, speed: 0${hp ? ", hp: enemies[enemies.length - 1].maxHp * " + hp : ""} });`;

console.log("— Rampa della campagna (per difficoltà) —");
{
  const st = [69, 70, 84, 85, 99, 100].map((l) => { const { g, ev } = run("standard", l); errors.push(...g.errors); return J(ev, MAJ_WAVES).map((s) => s.split(":")[0]).join(",") || "-"; });
  const ep = [39, 40, 54, 55, 69, 70].map((l) => { const { g, ev } = run("epic", l); errors.push(...g.errors); return J(ev, MAJ_WAVES).map((s) => s.split(":")[0]).join(",") || "-"; });
  const want = ["-", "15", "15", "10,15", "10,15", "5,10,15"];
  console.log("Standard 69/70/84/85/99/100:", st.join(" | "), ok(st.join("|") === want.join("|")));
  console.log("Epica 39/40/54/55/69/70:", ep.join(" | "), ok(ep.join("|") === want.join("|")));
  const { ev } = run("standard", 120);
  const ship = J(ev, `(() => { startWave(5); const a = queue.find((q) => q.def && q.def.boss).def; return { look: bossDef(campLevel, 5).look, hp: a.hp, sp: a.speed, dmg: a.dmg, maj: a.major }; })()`);
  const sp = J(ev, `(() => { const n0 = enemies.length; startWave(15); const q = queue.find((q) => q.def && q.def.major); spawn(q); const e = enemies[enemies.length - 1];
    const s = bossDef(campLevel, 15); spawn({ enemy: "boss", def: s, x: 180 }); const c = enemies[enemies.length - 1]; return { hp: [e.maxHp, c.maxHp], sp: [e.speed, c.speed], dmg: [e.dmg, c.dmg], boss: e.boss, kb: [e.kbRes, c.kbRes], sr: [e.statRes, c.statRes] }; })()`);
  console.log("livello 120: vita, velocità, danno, spinte e stati del maggiore = nave aliena:", sp.hp.map(Math.round).join("/"), sp.sp.map((v) => v.toFixed(1)).join("/"), sp.dmg.map((v) => v.toFixed(1)).join("/"),
    ok(ship.hp === 480 && ship.sp === 20 && ship.dmg === 9 && Math.abs(sp.hp[0] - sp.hp[1]) < 1e-6 && sp.sp[0] === sp.sp[1] && sp.dmg[0] === sp.dmg[1] && sp.boss && sp.kb[0] === sp.kb[1] && sp.sr[0] === sp.sr[1]));
  const { ev: e11 } = run("standard", 11);
  console.log("Standard 11: mini-boss solo navi aliene:", J(e11, MAJ_WAVES).length === 0, ok(J(e11, MAJ_WAVES).length === 0));
}

console.log("— Protezione planetaria (per livello) —");
{
  const r = [1, 2, 3, 4, 5, 6, 7, 10].map((L) => { const { g, ev } = planet("fire", L); errors.push(...g.errors); const w = J(ev, MAJ_WAVES); return { L, w: w.map((s) => s.split(":")[0]).join(",") || "-", t: w.every((s) => s.endsWith(":fire")) }; });
  const want = ["-", "-", "15", "15", "10,15", "10,15", "5,10,15", "5,10,15"];
  console.log("fire livelli 1-7 e 10:", r.map((x) => x.L + ":" + x.w).join(" | "), "· sempre del tipo del continente:", r.every((x) => x.t), ok(r.map((x) => x.w).join("|") === want.join("|") && r.every((x) => x.t)));
  const abs = new Set(); for (const L of [3, 4, 5, 6, 7]) { const { ev } = planet("energy", L); J(ev, MAJ_WAVES).forEach((s) => abs.add(s.split(":")[1])); }
  console.log("energy livelli 3-7: abilità viste", [...abs].sort().join(" "), ok(abs.size === 5));
}

console.log("— Quale maggiore —");
{
  const { ev } = run("standard", 100);
  const lv = J(ev, `(() => { const o = []; for (let lv = 100; lv < 200; lv++) o.push([5, 10, 15].map((n) => majorOf(lv, n))); return o; })()`);
  console.log("livelli 100-199: tre abilità diverse in ogni livello:", lv.every((a) => new Set(a).size === 3), ok(lv.every((a) => new Set(a).size === 3)));
  const combos = J(ev, `(() => { const s = new Set(); for (let lv = 100; lv < 125; lv++) s.add(majorOf(lv, 15) + ":" + bossDef(lv, 15).type); return s.size; })()`);
  const fixed = J(ev, `(() => { const m = {}; for (let lv = 70; lv < 95; lv++) { const k = majorOf(lv, 15); (m[k] = m[k] || new Set()).add(bossDef(lv, 15).type); } return Object.values(m).map((s) => s.size); })()`);
  console.log("ondata 15, 25 livelli di fila: combinazioni abilità-tipo", combos, "di 25 · tipi per abilità dal 70 al 94:", fixed.join(" "), ok(combos === 25 && fixed.every((n) => n === 5)));
}

console.log("— Scissione (Asteroide maggiore) —");
{
  const { g, ev } = run("standard", 100);
  ev(SOLO("split", "physical") + " bossBonus = 0; window.R0 = B.def.r; window.D0 = B.dmg;");
  const a = J(ev, `(() => { damage(B, B.hp * 0.55, "fire", true); update(0.01); const p = enemies.filter((e) => e.boss && !e.dead);
    return { n: p.length, r: p.map((e) => +(e.def.r / R0).toFixed(2)), d: p.map((e) => +(e.dmg / D0).toFixed(2)), split: p.map((e) => e.def.split), bonus: bossBonus }; })()`);
  console.log("al 50%:", a.n, "pezzi · raggio", a.r.join("/"), "· danno ×" + a.d.join("/"), "· ricompensa", a.bonus, ok(a.n === 2 && a.r.every((v) => v === 0.72) && a.d.every((v) => v === 0.6) && a.split.every((s) => s === 1) && a.bonus === 0));
  const b = J(ev, `(() => { for (const e of enemies.filter((e) => e.boss && !e.dead)) damage(e, 1, "fire", true); update(0.01); const p = enemies.filter((e) => e.boss && !e.dead);
    return { n: p.length, d: p.map((e) => +(e.dmg / D0).toFixed(2)), split: p.map((e) => e.def.split) }; })()`);
  console.log("seconda scissione (come oggi: al primo colpo dopo la prima):", b.n, "pezzi · danno ×" + b.d.join("/"), "· non si dividono più", ok(b.n === 4 && b.d.every((v) => v === 0.36) && b.split.every((s) => s === 0)));
  const c = J(ev, `(() => { const p = enemies.filter((e) => e.boss && !e.dead), o = []; for (const e of p) { damage(e, e.hp + 1, "fire", true); update(0.01); o.push(bossBonus); } return o; })()`);
  console.log("ricompensa dopo ognuno dei 4 pezzi:", c.join(" "), ok(c.join(" ") === "0 0 0 1"));
  const { ev: pe } = planet("physical", 7);
  const m = J(pe, `(() => { ${SOLO("split", "physical")} B.w = 15; pw.mb = 0; pw.choices = []; damage(B, B.hp * 0.55, "fire", true); for (let k = 0; k < 3; k++) { for (const e of enemies.filter((e) => e.boss && !e.dead)) damage(e, 1, "fire", true); }
    const o = []; for (const e of enemies.filter((e) => e.boss && !e.dead)) { damage(e, e.hp + 1, "fire", true); update(0.01); o.push(pw.mb); } return { o, ch: pw.choices.filter((c) => c === "boss").length + (bonusMode ? 1 : 0) }; })()`);
  console.log("Protezione planetaria: mini-boss sconfitti dopo ogni pezzo", m.o.join(" "), "· ricompense in coda", m.ch, ok(m.o.join(" ") === "0 0 0 1" && m.ch === 1));
  errors.push(...g.errors);
}

console.log("— Adattamento (Cristallo maggiore) —");
{
  const { g, ev } = run("standard", 100);
  ev(SOLO("adapt", "fire"));
  const r = J(ev, `(() => { const o = { m0: RESIST.fire.force };
    damage(B, B.maxHp * 0.06, "electric", true); damage(B, B.maxHp * 0.03, "energy", true); o.a = [B.adT || "-", B.adN];
    damage(B, B.maxHp * 0.02, "electric", true); o.b = [B.adT || "-", B.adN];
    let h0 = B.hp; damage(B, 100, "electric", true); o.mElec = +((h0 - B.hp) / 100).toFixed(2); h0 = B.hp; damage(B, 100, "physical", true); o.mPhys = +((h0 - B.hp) / 100).toFixed(2);
    return o; })()`);
  console.log("profilo iniziale del tipo fire (force ×" + r.m0 + ") · al 90% (più danni electric che energy):", r.b.join(" "), "· electric ×" + r.mElec, "physical ×" + r.mPhys,
    ok(r.a[0] === "-" && r.a[1] === 0 && r.b[0] === "electric" && r.b[1] === 1 && r.mElec === 0.5 && r.mPhys === 1.5));
  const m = J(ev, `(() => { for (let i = 0; i < 40 && !B.dead; i++) damage(B, B.maxHp * 0.03, TYPE_KEYS[i % 5], true); return { n: B.adN, dead: B.dead }; })()`);
  console.log("al massimo 9 cambi:", m.n, ok(m.n <= 9));
  ev(SOLO("adapt", "energy")); g.frame();
  const tie = J(ev, `(() => { damage(B, B.maxHp * 0.05, "fire", true); damage(B, B.maxHp * 0.05, "force", true); return [B.adT || "-", B.adN, +(1 - B.hp / B.maxHp).toFixed(3)]; })()`);
  console.log("tipo energy, 5% fire (×1,5) e 5% force contati prima delle resistenze: parità → invariato:", tie.join(" "), ok(tie[0] === "-" && tie[1] === 1));
  errors.push(...g.errors);
}

console.log("— Incremento (Artiglio maggiore) —");
{
  const { g, ev } = run("standard", 100);
  ev(SOLO("regen", "electric", 200) + foe("drone", 200, 230, 0.4) + foe("wisp", 150, 210, 0.4) + foe("spitter", 220, 160, 0.4) + foe("shell", 120, 260, 0.4) + foe("brute", 330, 500, 0.4) + foe("drone", 30, 520, 0.4) + " player.cd = 1e9;");
  const a = J(ev, `(() => { for (const e of enemies) e.speed = 0; update(0.05); return { tg: B.rgTg.map((o) => enemies.indexOf(o)), uniq: new Set(B.rgTg).size }; })()`);
  console.log("bersagli: i 4 più vicini, mai doppi:", a.tg.join(" "), ok(a.tg.length === 4 && a.uniq === 4 && a.tg.every((i) => i >= 1 && i <= 4)));
  const h = J(ev, `(() => { const v = guardDps(player), hp0 = enemies.map((e) => e.hp); for (let i = 0; i < 41; i++) { player.cd = 1e9; for (const e of enemies) e.speed = 0; update(0.05); }
    const d = enemies.map((e, i) => +(e.hp - hp0[i]).toFixed(2)); return { v: +v.toFixed(2), d, plus: floaters.filter((f) => f.txt === "+").length, glow: enemies.filter((e) => e.healT > 0).length }; })()`);
  console.log("dopo 2 s: +" + h.v + " ai 4 bersagli (danno al secondo del guardiano), agli altri 0:", h.d.slice(1).join(" "), "· “+”", h.plus, "· bagliori", h.glow,
    ok(h.d.slice(1, 5).every((x) => Math.abs(x - h.v) < 0.01) && h.d.slice(5).every((x) => x === 0) && h.plus === 4 && h.glow === 4));
  const k = J(ev, `(() => { const t0 = B.rgTg[0]; damage(t0, 1e9, "fire", true); update(0.01); return { has: B.rgTg.includes(t0), n: B.rgTg.length, far: B.rgTg.some((o) => o.y > 400) }; })()`);
  console.log("bersaglio morto: sostituito dal più vicino rimasto:", !k.has, k.n, ok(!k.has && k.n === 4 && k.far));
  const s = J(ev, `(() => { damage(B, 1e9, "fire", true); update(0.01); const hp0 = enemies.map((e) => e.hp); for (let i = 0; i < 50; i++) { player.cd = 1e9; update(0.05); } return enemies.every((e, i) => e.hp === hp0[i]); })()`);
  console.log("sconfitto il mini-boss la rigenerazione si ferma:", s, ok(s));
  errors.push(...g.errors);
}

console.log("— Invisibilità e raggio (Prisma maggiore) —");
{
  const { g, ev } = run("standard", 100);
  ev(SOLO("invis", "energy", 100) + " player.cd = 1e9;");
  const a = J(ev, `(() => { damage(B, B.maxHp * 0.29, "electric", true); const v0 = !!B.invis; damage(B, B.maxHp * 0.02, "electric", true); return { v0, v1: !!B.invis, see: canSee(B), t: B.invisT }; })()`);
  console.log("a −30% di vita diventa invisibile (non a −29%), non è bersaglio, per", a.t, "s:", a.v1, ok(!a.v0 && a.v1 && !a.see && a.t === 10));
  const b = J(ev, `(() => { for (let i = 0; i < 199; i++) { player.cd = 1e9; update(0.05); } const mid = !!B.invis; for (let i = 0; i < 3; i++) update(0.05); return { mid, end: !!B.invis, see: canSee(B) }; })()`);
  console.log("visibile dopo 10 s:", !b.end, ok(b.mid && !b.end && b.see));
  ev(SOLO("invis", "energy", 100) + " player.cd = 1e9;");
  const c = J(ev, `(() => { damage(B, B.maxHp * 0.31, "fire", true); slow(B, 1); reveal(B); return !!B.invis; })()`);
  console.log("con uno stato da una torretta che lo vede torna visibile:", !c, ok(!c));
  ev(SOLO("invis", "fire", 60) + " player.cd = 1e9; domeHp = domeMax = 1e6; B.speed = 200;");
  const d = J(ev, `(() => { let rays = 0, maxB = 0, hits = 0; for (let i = 0; i < 400; i++) { player.cd = 1e9; const h0 = domeHp; update(0.05); if (domeHp < h0) hits++; maxB = Math.max(maxB, bottomOf(B)); rays = Math.max(rays, ents.filter((o) => o.boss === B).length); }
    const lost = domeMax - domeHp; return { maxB: Math.round(maxB), lim: H * 0.75, touch: touchesDome(B), rays, hits, per: +(lost / hits).toFixed(2), dmg: +(B.dmg * 2 * (1 - domeRed())).toFixed(2), every: BOSS_L.rayEvery(B.def.gl) }; })()`);
  console.log("si ferma con il bordo inferiore a", d.maxB, "(25% dal basso:", d.lim + ") senza toccare la barriera · raggi", d.hits, "in 20 s (ogni", d.every, "s) · danno per raggio", d.per, "= danno ×2", d.dmg,
    ok(Math.abs(d.maxB - d.lim) < 6 && !d.touch && d.hits >= 2 && Math.abs(d.per - d.dmg) < 0.01));
  ev(SOLO("invis", "fire", 200) + " player.cd = 1e9; damage(B, B.maxHp * 0.31, 'fire', true); B.rcd = 0.01; update(0.05);");
  const ray = J(ev, "ents.filter((o) => o.boss === B).length");
  console.log("raggio anche da invisibile (l’avviso si disegna come effetto):", ray, ok(ray === 1));
  for (let i = 0; i < 20; i++) g.frame();
  errors.push(...g.errors);
}

console.log("— Deviazione (Riflesso maggiore) —");
{
  const { g, ev } = run("standard", 100);
  ev(SOLO("deflect", "physical") + foe("brute", 90, 200) + foe("drone", 280, 220) + " player.cd = 1e9;");
  const a = J(ev, `(() => { for (const e of enemies) e.speed = 0; const h0 = B.hp; damage(B, 100, "fire", false); return { took: +(h0 - B.hp).toFixed(2), acc: +B.dfAcc.toFixed(2), m: RESIST.physical.fire }; })()`);
  console.log("colpo da 100 fire: subisce", a.took, "e devia", a.acc, "(dopo le resistenze ×" + a.m + ")", ok(a.took === 50 * a.m && a.acc === 50 * a.m));
  const b = J(ev, `(() => { const big = enemies.filter((e) => e !== B).sort((x, y) => y.hp - x.hp)[0], h0 = big.hp, others = enemies.filter((e) => e !== B && e !== big).map((e) => e.hp);
    let orbs = 0; for (let i = 0; i < 30; i++) { player.cd = 1e9; for (const e of enemies) e.speed = 0; update(0.05); orbs = Math.max(orbs, ents.filter((o) => o.tg).length); }
    return { got: +(h0 - big.hp).toFixed(2), want: +(50 * RESIST.physical.fire * RESIST[big.def.type].physical).toFixed(2), look: big.def.look, orbs, rest: enemies.filter((e) => e !== B && e !== big).every((e, i) => e.hp === others[i]) }; })()`);
  console.log("sfera a parabola sul nemico con più vita (" + b.look + "):", b.got, "= deviato × sua resistenza al physical", b.want, ok(b.orbs === 1 && Math.abs(b.got - b.want) < 0.01 && b.rest));
  const c = J(ev, `(() => { for (const e of enemies) if (e !== B) e.hp = -1, e.dead = true; update(0.01); const h0 = B.hp; damage(B, 100, "fire", false); return { took: +(h0 - B.hp).toFixed(2), acc: B.dfAcc }; })()`);
  console.log("senza nemici validi non devia:", c.took, c.acc, ok(c.took === 100 * J(ev, "RESIST.physical.fire") && c.acc === 0));
  errors.push(...g.errors);
}

console.log("— Scoperte, avviso, scheda Nemici —");
{
  const { g, ev } = run("standard", 100);
  const keys = J(ev, `(() => { const s = new Set(); for (const ab of MAJOR_KEYS) for (const t of TYPE_KEYS) s.add(seenKey(Object.assign(bossDef(1, 5), { type: t, major: ab, look: MAJOR_DEF[ab].look }))); return [...s]; })()`);
  const all = J(ev, `(() => { const s = new Set(); for (const k in ENEMY_DEFS) s.add(seenKey(ENEMY_DEFS[k])); for (const t of TYPE_KEYS) { s.add("ship:" + t); s.add("mothership:" + t); s.add(seenKey(Object.assign({}, PLANET_BOSS[t], { type: t, planet: true }))); } s.add("gift"); return s.size; })()`);
  console.log("chiavi delle scoperte dei maggiori:", keys.length, "(es. " + keys[0] + ") · tutte le scoperte possibili", all + keys.length, "entro il tetto di 80", ok(keys.length === 25 && all + keys.length <= 80));
  const imp = J(ev, `(() => { const r = parseSave(JSON.stringify({ game: "fortress-defense", version: SAVE_VERSION, progress: { cleared: 100, seen: ${JSON.stringify(keys)} } })); return r && r.seen ? r.seen.length : -1; })()`);
  console.log("salvataggio: le 25 chiavi si importano tutte:", imp, ok(imp === 25));
  ev("queue = []; enemies = []; alerts = []; startWave(15); const q = queue.find((q) => q.def && q.def.major); spawn(q); enemies[enemies.length - 1].y = 100; update(0.01)");
  g.frame(); const t = g.texts.join("|"), k = J(ev, "seenKey(enemies.find((e) => e.def.major).def)");
  console.log("avviso al primo incontro:", t.includes("Nuovo mini-boss: "), "· scoperta", k, ok(t.includes("Nuovo mini-boss: ") && J(ev, `progress.seen.includes("${k}")`) && t.includes(J(ev, "enemies.find((e) => e.def.major).def.name"))));
  ev("progress.seen = []; queue = []; enemies = []; alerts = []; pauseGame(); pauseTab = 'enemies'; pauseScroll = 5000"); g.frame(); const u = g.texts.join("|");
  const n3 = u.split("Mini-boss maggiore sconosciuto").length - 1;
  ev(`progress.seen = ${JSON.stringify(keys)}; pauseScroll = 5000`); g.frame(); const v = g.texts.join("|");
  const names = J(ev, "[5, 10, 15].map((n) => miniDef(campLevel, n).name)");
  console.log("pausa al 100: 3 maggiori sconosciuti:", n3, "· scoperti:", names.join(", "), ok(n3 === 3 && names.every((x) => v.includes(x)) && !v.includes("Mini-boss · nave aliena")));
  const { g: g2, ev: ev2 } = run("standard", 85, null, keys.concat(["fire", "energy", "electric", "force", "physical"].map((t) => "ship:" + t))); ev2("queue = []; enemies = []; pauseGame(); pauseTab = 'enemies'; pauseScroll = 5000"); g2.frame(); const w = g2.texts.join("|");
  const { g: g3, ev: ev3 } = run("standard", 69, null, keys); ev3("queue = []; enemies = []; pauseGame(); pauseTab = 'enemies'; pauseScroll = 5000"); g3.frame(); const x = g3.texts.join("|");
  const n85 = J(ev2, "[5, 10, 15].map((n) => miniDef(campLevel, n)).filter((d) => d.major).length");
  console.log("pausa all’85: maggiori", n85, "e la nave aliena dell’ondata 5:", w.includes("Mini-boss · nave aliena"), "· al 69 nessun maggiore:", !/maggiore/.test(x),
    ok(n85 === 2 && w.includes("Mini-boss · nave aliena") && !/maggiore/.test(x)));
  errors.push(...g.errors, ...g2.errors, ...g3.errors);
}

console.log("— HD-2D e partite vere —");
{
  const errs = [];
  for (const gfx of ["classic", "hd2d"]) {
    const { g, ev } = run("standard", 100, { graphics: gfx });
    ev("queue = []; enemies = []; " + ["split", "adapt", "regen", "invis", "deflect"].map((ab, i) => `{ const d = miniDef(campLevel, 15); const M = MAJOR_DEF["${ab}"]; Object.assign(d, { major: "${ab}", look: M.look, name: M.name, r: M.r, split: "${ab}" === "split" ? 2 : 0, stopAt: "${ab}" === "invis" ? H * 0.75 : 0 }); spawn({ enemy: "boss", def: d, x: ${40 + i * 70} }); enemies[enemies.length - 1].y = 150; }`).join(" ")
      + foe("drone", 100, 200, 0.5) + foe("brute", 200, 220, 0.5) + " for (const e of enemies) if (e.def.major === 'adapt') { e.adT = 'fire'; e.res = RESIST.fire; } else if (e.def.major === 'invis') { e.rcd = 0.1; damage(e, e.maxHp * 0.31, 'fire', true); }");
    for (let i = 0; i < 120; i++) { ev("domeHp = domeMax; for (const e of enemies) if (e.def.major === 'deflect') damage(e, 20, 'fire')"); g.frame(); }
    errs.push(...g.errors);
  }
  console.log("i cinque maggiori in classica e HD-2D per 120 fotogrammi, errori JS:", errs[0] || "nessuno", ok(!errs.length));
  const res = [];
  for (const [mode, lv] of [["standard", 100], ["epic", 70]]) {
    const g = makeGame({ patch, seed: 11, storage: { "fortress-progress-v1": JSON.stringify({ cleared: 200, clearedEpic: 200, seen: [] }) } }); g.frame(); const ev = g.win.__ev;
    ev(`setSel("${mode}", ${lv}); startRun("${mode}"); startWave(15);`);
    let st = "play";
    for (let i = 0; i < 20000 && st === "play"; i++) { ev("domeHp = domeMax; player.up.dmg = 3; if (state === 'upgrade') pick(0)"); g.frame(); st = ev("wave >= 16 ? 'ok' : state === 'upgrade' ? 'play' : state"); }
    res.push(mode + " " + lv + ": " + st); errors.push(...g.errors);
  }
  console.log("ondata 15 con il maggiore giocata fino in fondo:", res.join(" · "), ok(res.every((r) => r.endsWith("ok"))));
}
console.log("errori JS:", errors[0] || "nessuno", ok(!errors.length));
