// Sonoro (1.25.0, DESIGN.md § 18): modulo app/audio.js da solo (eventi, voci, soglie, raggruppamenti, priorità, nessun errore senza AudioContext)
// e dentro il gioco (eventi emessi, sospensione fuori dall’ondata, cursore del volume, nessun effetto sulla logica).
const fs = require("fs"), path = require("path"), vm = require("vm");
const { makeGame, play } = require("./bot.js");
const ok = (c) => c ? "✓" : "✗ ERRORE";
const SRC = fs.readFileSync(path.join(__dirname, "..", "app", "audio.js"), "utf8");
const GAME = fs.readFileSync(path.join(__dirname, "..", "app", "index.html"), "utf8");

// AudioContext finto: controlla le rampe (un valore ≤ 0 in una rampa esponenziale è un errore in Web Audio) e conta i suoni avviati
const FAKE = `(function () {
  function param() { return { value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, cancelScheduledValues() {},
    exponentialRampToValueAtTime(v) { if (!(v > 0)) throw new Error("rampa esponenziale a " + v); } }; }
  function node() { return { connect() {}, disconnect() {} }; }
  class FakeAC {
    constructor() { this.currentTime = 0; this.sampleRate = 8000; this.state = "suspended"; this.destination = node(); this.log = { started: 0, resumes: 0, suspends: 0 }; (globalThis.__acs = globalThis.__acs || []).push(this); }
    resume() { this.state = "running"; this.log.resumes++; return Promise.resolve(); }
    suspend() { this.state = "suspended"; this.log.suspends++; return Promise.resolve(); }
    createGain() { return Object.assign(node(), { gain: param() }); }
    createBiquadFilter() { return Object.assign(node(), { type: "", frequency: param(), Q: param() }); }
    createOscillator() { const ac = this; return Object.assign(node(), { type: "", frequency: param(), start() { ac.log.started++; }, stop() {} }); }
    createWaveShaper() { return Object.assign(node(), { curve: null }); }
    createBufferSource() { const ac = this; return Object.assign(node(), { buffer: null, loop: false, start() { ac.log.started++; }, stop() {} }); }
    createBuffer(c, n) { const d = new Float32Array(n); return { getChannelData() { return d; } }; }
  }
  return FakeAC;
})()`;

// il modulo in un contesto Node senza window
function loadModule(withAC) {
  const sb = { setTimeout, performance: { now: () => 0 }, console };
  sb.globalThis = sb; if (withAC) sb.AudioContext = vm.runInNewContext(FAKE, sb);
  vm.runInNewContext(SRC, sb);
  return sb;
}

console.log("— Modulo da solo —");
const EXPECT = ["guardiano", "sparo.sky", "sparo.wheel", "sparo.laser", "sparo.beam", "sparo.thunder", "sparo.tesla", "sparo.disr", "sparo.hive", "sparo.vortex", "sparo.aero", "sparo.rail",
  "esplosione.piccola", "esplosione.grande", "bolla.scoppia", "cupola", "pacco.arrivo", "pacco.premio", "miniboss.arrivo", "boss.arrivo",
  "maggiore.scissione", "maggiore.adattamento", "maggiore.incremento", "maggiore.invisibile", "maggiore.visibile", "maggiore.raggio.avviso", "maggiore.raggio", "maggiore.deviazione",
  "gigante.intercettori", "gigante.intercetta", "gigante.alati", "gigante.assorbe", "gigante.raggio.avviso", "gigante.raggio", "gigante.scissione"];
{
  const sb = loadModule(false), S = sb.FORTRESS_SOUND;
  const same = EXPECT.length === S.EVENTS.length && EXPECT.every((n) => S.EVENTS.includes(n));
  console.log("eventi del modulo:", S.EVENTS.length, "(attesi " + EXPECT.length + ")", ok(same));
  let err = null;
  try { S.unlock(); S.setActive(true); S.setVolume(0.5); for (const n of S.EVENTS) S.play(n, 2); S.play("inesistente"); S.setActive(false); S.setVolume("boh"); } catch (e) { err = e.message; }
  console.log("senza AudioContext: tutti gli eventi senza errori:", err || "nessuno", "| contesto creato:", S.ready(), ok(!err && !S.ready()));
  console.log("Math.random nel modulo:", /Math\.random\(/.test(SRC) ? "sì" : "mai", ok(!/Math\.random\(/.test(SRC)));
  // ogni sfx("…") del gioco esiste nel modulo; "sparo." + s.id per ogni torretta; "gigante|maggiore" + ".raggio…"
  const names = [...new Set([...GAME.matchAll(/sfx\(([^;]*?)\);/g)].flatMap((m) => [...m[1].replace(/===? "[^"]*"/g, "").matchAll(/"([a-z.]+)"/g)].map((x) => x[1])).filter((n) => !n.endsWith(".") && !n.startsWith(".")))];
  const behav = GAME.slice(GAME.indexOf("const BEHAV = {"), GAME.indexOf("};", GAME.indexOf("const BEHAV = {")));
  const turrets = [...behav.matchAll(/(\w+): \{ fire/g)].map((m) => m[1]);
  const dyn = turrets.map((id) => "sparo." + id).concat(["gigante", "maggiore"].flatMap((w) => [w + ".raggio.avviso", w + ".raggio"]));
  const miss = names.concat(dyn).filter((n) => !S.EVENTS.includes(n));
  const unused = S.EVENTS.filter((n) => !names.includes(n) && !dyn.includes(n));
  console.log("eventi chiamati dal gioco:", names.length, "fissi +", dyn.length, "composti (torrette " + turrets.length + ") | mancanti nel modulo:", miss.join(", ") || "nessuno",
    "| mai chiamati:", unused.join(", ") || "nessuno", ok(!miss.length && !unused.length && turrets.length === 11));
  const gam = GAME.slice(GAME.indexOf("  gamma(r) {"), GAME.indexOf("\n  }", GAME.indexOf("  gamma(r) {")));
  console.log("bolle di Gamma → bolla.scoppia:", /sfx\("bolla\.scoppia"\)/.test(gam) && !/esplosione/.test(gam), ok(/sfx\("bolla\.scoppia"\)/.test(gam) && !/esplosione/.test(gam)));
}
{
  // con AudioContext finto, tempo e timer a mano
  let t = 0; const q = [];
  const sb = loadModule(true);
  const S = sb.FORTRESS_SOUND_CREATE({ AudioContext: sb.AudioContext, now: () => t, setTimer: (fn, ms) => q.push({ at: t + ms, fn }) });
  const flush = () => { q.sort((a, b) => a.at - b.at); while (q.length && q[0].at <= t) q.shift().fn(); };
  console.log("prima di “Start”: suono ignorato:", S.play("guardiano") === false, "| sbloccato e in ondata:", (S.unlock(), S.setActive(true), S.ready()), ok(S.ready()));
  const ac = sb.__acs[0];
  console.log("contesto ripreso entrando in ondata:", ac.state, ok(ac.state === "running"));
  let err = null; try { for (const n of S.EVENTS) for (const w of [1, 2, 3]) { t += 5000; S.play(n, w); t += 200; flush(); } } catch (e) { err = e.message; }
  // stats.failed conta i suoni la cui costruzione ha dato errore (il modulo li ingoia per non fermare il gioco): qui deve restare vuoto
  const failed = Object.keys(S.stats.failed);
  console.log("tutti gli eventi con Web Audio (finto, pesi 1-3): errori", err || "nessuno", "| suoni non costruiti:", failed.join(", ") || "nessuno",
    "| suonati", Object.keys(S.stats.played).length + "/" + S.EVENTS.length, "| sorgenti avviate", ac.log.started,
    ok(!err && !failed.length && Object.keys(S.stats.played).length === S.EVENTS.length && ac.log.started > S.EVENTS.length));
  // timbri rivisti (1.25.1, DESIGN.md § 18): durate e strati nuovi
  const dur = (n) => Math.max(...S.def(n).make(1, () => 0.5).map((l) => l.at + l.d)), layers = (n) => S.def(n).make(1, () => 0.5);
  const gd0 = dur("guardiano"), mb = dur("miniboss.arrivo"), bs = dur("boss.arrivo");
  const amOn = layers("sparo.thunder").some((l) => l.am), grainsF = layers("sparo.sky").filter((l) => l.d <= 0.015).length, satE = layers("esplosione.grande").some((l) => l.sat);
  const noTone = ["miniboss.arrivo", "boss.arrivo"].every((n) => layers(n).every((l) => l.o === "noise" || l.o === "sine"));
  console.log("guardiano", Math.round(gd0 * 1000), "ms · mini-boss", mb.toFixed(1), "s · boss", bs.toFixed(1), "s · ronzio modulato", amOn, "· grani del fuoco", grainsF, "· saturazione", satE, "· ingressi senza onde a note:", noTone,
    ok(gd0 >= 0.08 && gd0 <= 0.09 && mb >= 1.8 && mb <= 2.6 && bs >= 4 && bs <= 5.2 && amOn && grainsF >= 8 && satE && noTone));
  // soglia minima tra due suoni uguali
  t += 5000; const a = S.play("sparo.sky"); t += 40; const b = S.play("sparo.sky"); t += 1000; const c = S.play("sparo.sky");
  console.log("soglia (Sky Guard, " + S.def("sparo.sky").gap + " ms): 0 ms suona", a, "· +40 ms", b, "· +1 s", c, ok(a && !b && c));
  // limite di voci: ogni torretta 1 (suono più lungo della soglia), guardiano 2
  t += 5000; const v1 = S.play("sparo.vortex"); t += 100; const v2 = S.play("sparo.vortex"); t += 1000; const v3 = S.play("sparo.vortex");
  console.log("voci per torretta 1 (Vortex): suona", v1, "· a +100 ms (oltre la soglia, voce ancora occupata)", v2, "· a +1,1 s", v3, ok(v1 && !v2 && v3));
  const gd = S.def("guardiano"), gap0 = gd.gap; gd.gap = 0; t += 5000;
  const gs = [S.play("guardiano"), S.play("guardiano"), S.play("guardiano")]; gd.gap = gap0;
  console.log("voci del guardiano " + gd.max + " (soglia tolta per la prova): tre insieme →", gs.join(" "), ok(gs[0] && gs[1] && !gs[2]));
  // raggruppamento: più contatti con la cupola nella finestra = un solo suono con il peso più alto
  t += 5000; const before = S.stats.played.cupola || 0, starts = ac.log.started;
  S.play("cupola", 1); t += 20; S.play("cupola", 3); t += 20; S.play("cupola", 2); t += 100; flush();
  console.log("cupola: 3 colpi in 40 ms → suoni", (S.stats.played.cupola || 0) - before, "| raggruppati", S.stats.grouped.cupola, "| peso usato 3 (pesante, 4 strati):", ac.log.started - starts === 4, ok((S.stats.played.cupola || 0) - before === 1 && ac.log.started - starts === 4));
  t += 5000; const eb = S.stats.played["esplosione.piccola"] || 0;
  for (let i = 0; i < 8; i++) { S.play("esplosione.piccola"); t += 5; } t += 100; flush();
  console.log("esplosioni a catena: 8 in 40 ms → suoni", (S.stats.played["esplosione.piccola"] || 0) - eb, ok((S.stats.played["esplosione.piccola"] || 0) - eb === 1));
  // priorità: voci piene di spari → il boss toglie uno sparo; uno sparo nuovo non toglie nulla
  t += 5000; const ids = ["sky", "wheel", "laser", "beam", "thunder", "tesla", "disr", "hive", "vortex", "aero", "rail"];
  for (const id of ids) S.play("sparo." + id); S.play("esplosione.piccola"); t += 60; flush(); S.play("guardiano"); S.play("gigante.alati"); S.play("maggiore.incremento");
  const full = S.MIX.maxVoices, bossOk = S.play("boss.arrivo"); t += 1; const gOk = (S.def("guardiano").gap = 0, S.play("guardiano")); S.def("guardiano").gap = gap0;
  console.log("voci piene (" + full + "): boss suona togliendo uno sparo:", bossOk, "· guardiano rinuncia:", !gOk, ok(bossOk && !gOk));
  // sospensione e volume
  S.setActive(false); t += 5000;
  console.log("in pausa: contesto", ac.state, "· suono ignorato:", S.play("boss.arrivo") === false, ok(ac.state === "suspended" && S.play("guardiano") === false));
  S.setActive(true); S.setVolume(0); t += 5000;
  const mute = S.play("boss.arrivo") === false; S.setVolume(1.7);
  console.log("volume 0 (muto): suono ignorato:", mute, "· volume 1,7 →", S.volume(), ok(mute && S.volume() === 1));
}

console.log("— Nel gioco —");
const injectAC = (h) => h.replace('<canvas id="c"', "<script>window.AudioContext = " + FAKE + ";</script>\n<canvas id=\"c\"");
const hook = (h) => h.replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__x = { settings, state: () => state, makeSave };\n})();");
{
  const vol = (s) => { const g = makeGame({ patch: hook, settings: s }); return g.win.__x.settings.volume; };
  const r = [vol(null), vol({ targeting: "closest", volume: 35 }), vol({ volume: 140 }), vol({ volume: "80" }), vol({ volume: 12.5 }), vol({ volume: 0 })];
  console.log("volume letto: di base", r[0], "· 35 →", r[1], "· 140 →", r[2], "· \"80\" →", r[3], "· 12,5 →", r[4], "· 0 →", r[5], ok(r.join() === "70,35,70,70,70,0"));
  const g = makeGame({ patch: (h) => hook(injectAC(h)) }), X = g.win.__x, S = g.win.FORTRESS_SOUND;
  console.log("tocco su “Start” → contesto creato:", S.ready(), "· nel menu sospeso:", g.win.__acs[0].state, "· volume del modulo", S.volume(), ok(S.ready() && g.win.__acs[0].state !== "running" && S.volume() === 0.7));
  g.texts.length = 0; g.frame();
  const T = g.texts.slice();
  g.click(184 + 6 + 0.3 * 104, 614); g.frame(); const mid = X.settings.volume, savedMid = JSON.parse(g.win.localStorage.getItem("fortress-proto-v1") || "{}").volume;
  g.move(184 + 110, 614); g.frame(); g.up(184 + 110, 614); const saved = JSON.parse(g.win.localStorage.getItem("fortress-proto-v1")).volume;
  console.log("cursore nel menu (“" + T.find((s) => /^Volume/.test(s)) + "”): tocco al 30% →", mid, "(non ancora salvato:", savedMid === undefined, ") · trascinato in fondo →", X.settings.volume, "salvato", saved, "· modulo", S.volume(),
    ok(mid === 30 && savedMid === undefined && X.settings.volume === 100 && saved === 100 && S.volume() === 1));
  g.click(184 + 3, 614); g.up(184 + 3, 614); g.texts.length = 0; g.frame(); const T2 = g.texts.slice();
  console.log("tocco a sinistra → 0:", X.settings.volume, T2.find((s) => /^Volume/.test(s)), ok(X.settings.volume === 0 && T2.includes("Volume: muto")));
  console.log("volume fuori dall’esportazione:", JSON.stringify(X.makeSave().settings), ok(!("volume" in X.makeSave().settings)));
}
{
  // partita intera con il contesto finto: eventi emessi, sospensione in pausa e nelle carte; stesso esito senza audio
  const seeds = [1, 2, 3], L = 30, out = [];
  const req = {}, add = (S) => { for (const o of [S.stats.played, S.stats.dropped, S.stats.grouped]) for (const k in o) req[k] = (req[k] || 0) + o[k]; };
  for (const seed of seeds) {
    const a = play({ seed, cleared: L - 1, level: L, patch: (h) => hook(injectAC(h)) }, "smart");
    const b = play({ seed, cleared: L - 1, level: L, patch: hook }, "smart");
    out.push({ seed, same: a.result === b.result && a.wave === b.wave && a.picks.join("|") === b.picks.join("|"), a: a.result[0] + a.wave, b: b.result[0] + b.wave, err: a.errors.concat(b.errors) });
    add(a.g.win.FORTRESS_SOUND);
  }
  console.log("livello " + L + ", 3 semi, con e senza audio:", out.map((o) => o.a + "/" + o.b).join(" "), "| stessi esiti e stesse carte:", out.every((o) => o.same), ok(out.every((o) => o.same)));
  // eventi chiesti dal gioco (suonati, scartati da soglie e voci o raggruppati: qui i fotogrammi corrono molto più del tempo reale)
  const P = req, sh = Object.keys(P).filter((k) => k.startsWith("sparo.")).length;
  console.log("eventi chiesti: guardiano", P.guardiano || 0, "· torrette", sh, "tipi ·", P["sparo.rail"] || 0, "Railgun · cupola", P.cupola || 0, "· boss", P["boss.arrivo"] || 0, "· mini-boss", P["miniboss.arrivo"] || 0,
    ok(P.guardiano > 1000 && sh > 0 && P.cupola > 0 && P["boss.arrivo"] >= 2 && P["miniboss.arrivo"] >= 3));
  const g = makeGame({ patch: (h) => hook(injectAC(h)) }), acg = g.win.__acs[0];
  g.key("Enter"); g.frame(); const inPlay = acg.state; g.key("p"); g.frame(); const inPause = acg.state; g.key("p"); g.frame(); const back = acg.state;
  for (let i = 0; i < 20000 && g.win.__x.state() !== "upgrade"; i++) g.frame();
  g.frame(); const inCards = acg.state; g.key("1"); g.frame(); const after = acg.state;
  console.log("scelta delle carte:", inCards, "→ ondata dopo", after, ok(inCards === "suspended" && after === "running"));
  Object.defineProperty(g.win.document, "hidden", { value: true, configurable: true }); g.win.document.dispatchEvent(new g.win.Event("visibilitychange"));
  console.log("ondata", inPlay, "→ pausa", inPause, "→ ripresa", back, "→ secondo piano", acg.state, ok(inPlay === "running" && inPause === "suspended" && back === "running" && acg.state === "suspended"));
  const errs = out.flatMap((o) => o.err).concat(g.errors);
  console.log("errori JS:", errs.length ? errs[0] : "nessuno", ok(!errs.length));
}

console.log("— Catalogo sonoro —");
{
  // docs/catalogo-sonoro.html carica lo stesso app/audio.js: un tasto per evento, tre per la cupola
  const { JSDOM } = require("jsdom");
  const html = fs.readFileSync(path.join(__dirname, "..", "docs", "catalogo-sonoro.html"), "utf8");
  const usesFile = html.includes('<script src="../app/audio.js"></script>');
  const d = new JSDOM(html.replace('<script src="../app/audio.js"></script>', "<script>" + SRC + "</script>"), { runScripts: "dangerously" });
  const btn = [...d.window.document.querySelectorAll(".grid button")], S = d.window.FORTRESS_SOUND;
  const covered = S.EVENTS.every((n) => btn.some((b) => b.textContent.includes(n) || (n.startsWith("sparo.") && b.textContent.includes(n))));
  console.log("usa app/audio.js:", usesFile, "· tasti", btn.length, "(attesi " + (S.EVENTS.length + 2) + ") · ogni evento ha il suo tasto:", covered,
    ok(usesFile && btn.length === S.EVENTS.length + 2 && covered));
}
