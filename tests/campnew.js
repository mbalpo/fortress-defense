// Nemici nuovi nella campagna (1.20.0, DESIGN.md § 17): dalla difficoltà 70 (livello 70 in Standard, 40 in Epica) metà dei nemici sono quelli della
// Protezione planetaria della stessa taglia e tipo, gli speciali arrivano dall’ondata 3 e il boss finale si alterna con i giganti (decine dispari).
const { makeGame } = require("./bot.js");
const ok = (c) => c ? "✓" : "✗ ERRORE";
const patch = (h) => h.replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();");
const J = (ev, c) => JSON.parse(ev("JSON.stringify(" + c + ")"));
function run(mode, lv, seed) {
  const g = makeGame({ patch, seed: seed || 3, storage: { "fortress-progress-v1": JSON.stringify({ cleared: 200, clearedEpic: 200, seen: [] }) } });
  g.frame(); const ev = g.win.__ev;
  ev(`setSel("${mode}", ${lv}); startRun("${mode}")`);
  return { g, ev };
}
// nemici di tutte le 20 ondate (senza giocarle): classici, nuovi (pianeta), speciali
const count = (ev) => J(ev, `(() => { const o = { classic: 0, nuovi: 0, speciali: 0, per: [] }; for (let n = 1; n <= 20; n++) { startWave(n); let s = 0;
  for (const q of queue) { if (q.def) continue; const d = ENEMY_DEFS[q.enemy]; if (d.special) { o.speciali++; s++; } else if (d.planet) o.nuovi++; else o.classic++; } o.per.push(s); } return o; })()`);

console.log("— Nemici delle ondate —");
{
  const a = count(run("standard", 69).ev), b = count(run("standard", 70).ev), e39 = count(run("epic", 39).ev), e40 = count(run("epic", 40).ev);
  const share = b.nuovi / (b.nuovi + b.classic);
  console.log("livello 69: nuovi", a.nuovi, "speciali", a.speciali, "| livello 70: classici", b.classic, "nuovi", b.nuovi, "(" + Math.round(share * 100) + "%) speciali", b.speciali,
    ok(a.nuovi === 0 && a.speciali === 0 && share > 0.4 && share < 0.6));
  console.log("speciali per ondata al 70:", b.per.join(" "), ok(b.per.join(" ") === "0 0 1 1 1 1 1 2 2 2 2 2 3 3 3 3 3 4 4 4"));
  console.log("Epica 39 (difficoltà 69): nuovi", e39.nuovi, "| Epica 40 (difficoltà 70): nuovi", e40.nuovi, "speciali", e40.speciali, ok(e39.nuovi === 0 && e40.nuovi > 0 && e40.speciali === 42));
  const { ev } = run("standard", 70);
  const same = ev(`(() => { for (const k of ["drone", "wisp", "spitter", "shell", "brute"]) { const n = ENEMY_DEFS[newOf(k)], c = ENEMY_DEFS[k]; if (n.type !== c.type || !n.planet || n.special) return false; } return true; })()`);
  console.log("il nuovo ha lo stesso tipo del classico che sostituisce:", same, ok(same));
}

console.log("— Boss finale —");
{
  const fin = (mode, lv) => { const { ev } = run(mode, lv); return J(ev, "(() => { startWave(20); const q = queue.find((q) => q.def && q.def.final); return q ? { look: q.def.look, giant: !!q.def.giant, gl: q.def.gl || 0, type: q.def.type } : null; })()"); };
  const r = [["standard", 60], ["standard", 70], ["standard", 80], ["standard", 90], ["standard", 200], ["epic", 40], ["epic", 50], ["epic", 60]].map(([m, l]) => [m + " " + l, fin(m, l)]);
  console.log(r.map(([k, f]) => k + ": " + f.look + (f.giant ? " (liv " + f.gl + ")" : "")).join(" · "),
    ok(!r[0][1].giant && r[1][1].giant && r[1][1].look === "disc" && r[1][1].gl === 1 && !r[2][1].giant && r[3][1].giant && r[3][1].look === "bigrock" && !r[4][1].giant
      && r[5][1].giant && !r[6][1].giant && r[7][1].giant));
  const { g, ev } = run("standard", 90);
  ev("queue = []; enemies = []; ents = []; wave = 20; queue.push({ t: 0, enemy: 'boss', def: campFinalDef(campLevel), x: W / 2 }); waveTime = 0.1; update(0.01); window.B = () => enemies.find((e) => e.final && !e.dead)");
  const b0 = J(ev, "({ y: bottomOf(B()), giant: !!B().def.giant, tot: B().totMax })");
  ev("damage(B(), B().hp * 0.55, 'fire', true)"); const parts = ev("enemies.filter((e) => e.final && !e.dead).length");
  g.frame(); const bar = g.texts.some((t) => t === "BOSS FINALE · METEORITE");
  for (let i = 0; i < 40 && ev("state") !== "won"; i++) { ev("for (const e of enemies) if (!e.dead) damage(e, 1e9, 'fire', true); domeHp = domeMax"); g.frame(); }
  const st = ev("state");
  console.log("livello 90: Meteorite gigante entra con il bordo a", Math.round(b0.y), "| diviso in", parts, "| barra “BOSS FINALE · METEORITE”:", bar, "| sconfitti tutti i pezzi →", st,
    ok(b0.giant && Math.abs(b0.y) <= 1 && b0.tot > 0 && parts === 2 && bar && st === "won"));
}

console.log("— Pausa —");
{
  const { g, ev } = run("standard", 70);
  ev("for (const k of Object.keys(ENEMY_DEFS)) progress.seen.push(seenKey(ENEMY_DEFS[k])); progress.seen.push(seenKey(campFinalDef(campLevel))); queue = []; enemies = []; pauseGame(); pauseTab = 'enemies'");
  const L = J(ev, "(() => { const r = DRAW.levelEnemies ? DRAW.levelEnemies() : null; return r && { kinds: r.kinds.map((k) => k[0]), fin: r.fin.look }; })()");
  g.frame(); const t = g.texts.join("|");
  ev("pauseScroll = 5000"); g.frame(); const sc = ev("pauseScroll"), t2 = g.texts.join("|");
  const nInt = L ? L.kinds.filter((k) => k.endsWith("_s")).length : -1;
  console.log("scheda Nemici al 70:", L ? L.kinds.length + " nemici (speciali " + nInt + "), boss finale " + L.fin : "levelEnemies non esposta", "| scorre fino a", Math.round(sc), "px:", t2.includes("Boss finale · disco volante"),
    ok(L && L.kinds.length === 15 && nInt === 5 && L.fin === "disc" && t.includes("trascina in su") && sc > 0 && sc < 5000 && t2.includes("Boss finale · disco volante")));
}

console.log("— Partite vere —");
{
  const errs = [];
  for (const [mode, lv] of [["standard", 70], ["standard", 110], ["epic", 40]]) {
    const { g, ev } = run(mode, lv, 5);
    for (let i = 0; i < 3000 && ev("state") !== "won" && ev("state") !== "lost"; i++) { ev("if (state === 'upgrade') pick(0); domeHp = domeMax; if (wave < 20 && state === 'play' && waveTime > 1) { queue = []; for (const e of enemies) e.dead = true; }"); g.frame(); }
    errs.push(...g.errors);
  }
  console.log("livelli 70, 110 ed Epica 40 giocati fino in fondo, errori JS:", errs.length ? errs.join("; ") : "nessuno", ok(!errs.length));
}
