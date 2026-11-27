// Sonoro (1.25.0, DESIGN.md § 18): modulo app/audio.js da solo (eventi, voci, soglie, raggruppamenti, priorità, nessun errore senza AudioContext)
// e dentro il gioco (eventi emessi, sospensione fuori dall’ondata, cursore del volume, nessun effetto sulla logica).
// Prova dei campioni (1.31.0): sintetico identico alla 1.25.1, campioni per guardiano, esplosione grande e cupola, ripiego se un file manca, campo “suoni”.
// Suoni continui (1.33.0): Laser, Beam e Disruption finché il raggio o il campo è acceso, colpi dei droni dell’Hive (solo campioni), Vortex di 2 s.
// Ingressi e fiamme (1.34.0): boss e mini-boss con spaceEngine, Sky Guard e Firewheel con thrusterFire, Firewheel con il suono continuo; aree in fiamme (1.35.0).
const fs = require("fs"), path = require("path"), vm = require("vm");
const { makeGame, play } = require("./bot.js");
const ok = (c) => c ? "✓" : "✗ ERRORE";
const SRC = fs.readFileSync(path.join(__dirname, "..", "app", "audio.js"), "utf8");
const GAME = fs.readFileSync(path.join(__dirname, "..", "app", "index.html"), "utf8");

// AudioContext finto: controlla le rampe (un valore ≤ 0 in una rampa esponenziale è un errore in Web Audio) e conta i suoni avviati
// globalThis.__trace (se c’è) riceve ogni nodo creato e ogni valore programmato: serve a confrontare il sintetico con la 1.25.1
// decodeAudioData: buffer finto di 0,5 s con tanti canali quanti byte ha il file (il fetch finto dà 2 byte al file stereo)
const FAKE = `(function () {
  const tr = (...a) => { if (globalThis.__trace) globalThis.__trace.push(a.join(" ")); };
  function param(n) { return { value: 0, setValueAtTime(v, t) { tr(n, "set", v, t); }, linearRampToValueAtTime(v, t) { tr(n, "lin", v, t); }, cancelScheduledValues() {},
    exponentialRampToValueAtTime(v, t) { tr(n, "exp", v, t); if (!(v > 0)) throw new Error("rampa esponenziale a " + v); } }; }
  function node() { return { connect() {}, disconnect() {} }; }
  function buffer(c, n, sr) { const d = Array.from({ length: c }, () => new Float32Array(n)); return { numberOfChannels: c, length: n, sampleRate: sr, duration: n / sr, getChannelData(i) { return d[i]; } }; }
  class FakeAC {
    constructor() { this.currentTime = 0; this.sampleRate = 8000; this.state = "suspended"; this.destination = node(); this.log = { started: 0, resumes: 0, suspends: 0, samples: 0, comp: 0, conv: 0, decoded: 0, loops: 0, stops: 0 }; (globalThis.__acs = globalThis.__acs || []).push(this); }
    createDynamicsCompressor() { this.log.comp++; const p = param; return Object.assign(node(), { threshold: p("c"), knee: p("c"), ratio: p("c"), attack: p("c"), release: p("c") }); }
    createConvolver() { this.log.conv++; return Object.assign(node(), { buffer: null }); }
    decodeAudioData(ab) { this.log.decoded++; return Promise.resolve(buffer(ab.byteLength, 4000, 8000)); }
    resume() { this.state = "running"; this.log.resumes++; return Promise.resolve(); }
    suspend() { this.state = "suspended"; this.log.suspends++; return Promise.resolve(); }
    createGain() { tr("gain"); return Object.assign(node(), { gain: param("g") }); }
    createBiquadFilter() { tr("filtro"); return Object.assign(node(), { type: "", frequency: param("f"), Q: param("q"), gain: param("fg") }); }
    createOscillator() { const ac = this; tr("osc"); return Object.assign(node(), { type: "", frequency: param("o"), start(t) { tr("start", t); ac.log.started++; }, stop() {} }); }
    createWaveShaper() { tr("sat"); return Object.assign(node(), { curve: null }); }
    createBufferSource() { const ac = this; tr("buf"); return Object.assign(node(), { buffer: null, loop: false, playbackRate: param("r"), start(t, o) { tr("start", t, o); ac.log.started++; if (this.buffer && this.buffer.sample) ac.log.samples++; if (this.loop && this.buffer && this.buffer.length !== ac.sampleRate) ac.log.loops++; }, stop() { ac.log.stops++; } }); }
    createBuffer(c, n, sr) { const b = buffer(c, n, sr); b.sample = c === 1 && n === 4000; return b; }
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
  "gigante.intercettori", "gigante.intercetta", "gigante.alati", "gigante.assorbe", "gigante.raggio.avviso", "gigante.raggio", "gigante.scissione",
  "colpo.hive", "pacco.perso"];   // colpi dei droni dell’Hive (1.33.0) e pacco perso (1.36.0): solo con i campioni
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
  const synthEv = S.EVENTS.filter((n) => !S.def(n).only);   // gli eventi solo con i campioni (colpo.hive) nel modo “sintetici” tacciono
  console.log("tutti gli eventi con Web Audio (finto, pesi 1-3): errori", err || "nessuno", "| suoni non costruiti:", failed.join(", ") || "nessuno",
    "| suonati", Object.keys(S.stats.played).length + "/" + synthEv.length, "(solo campioni: " + S.EVENTS.filter((n) => S.def(n).only).join(", ") + ") | sorgenti avviate", ac.log.started,
    ok(!err && !failed.length && Object.keys(S.stats.played).length === synthEv.length && synthEv.every((n) => S.stats.played[n]) && ac.log.started > synthEv.length));
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

console.log("— Prova dei campioni —");
// fetch finto: registra gli indirizzi; i file in “missing” mancano (404); il file stereo ha 2 byte, gli altri 1 (vedi decodeAudioData del finto)
const fakeFetch = (log, missing) => (url) => { log.push(url); const miss = (missing || []).some((m) => url.includes(m));
  return Promise.resolve(miss ? { ok: false } : { ok: true, arrayBuffer: () => Promise.resolve(new ArrayBuffer(/lowFrequency/.test(url) ? 2 : 1)) }); };
// traccia Web Audio del giro di eventi sintetici con la 1.25.1 (audio.js invariato fino alla 1.30.0), calcolata con questo AudioContext finto
const TRACE_1251 = "195aba5";
const settle = () => new Promise((r) => setTimeout(r, 0));
// eventi con i campioni: i tre della prova (1.31.0) e sette torrette (1.32.0); Sky Guard, Firewheel, Thunderbolt e Teslacoil restano sintetiche
const TURRETS7 = ["laser", "beam", "disr", "hive", "vortex", "aero", "rail"].map((id) => "sparo." + id);
const ALL3 = ["guardiano", "esplosione.grande", "cupola"].concat(TURRETS7);
const ALLS = ALL3.concat(["colpo.hive", "sparo.sky", "sparo.wheel", "miniboss.arrivo", "boss.arrivo", "pacco.arrivo", "pacco.premio", "pacco.perso"]);   // colpi dei droni dell’Hive (1.33.0, solo campioni); fuoco e ingressi (1.34.0)
(async () => {
  {
    // sintetico identico alla 1.25.1: firma degli strati di tutti gli eventi (pesi 1-3) e traccia dei nodi Web Audio di un giro di eventi
    const sb = loadModule(false), S = sb.FORTRESS_SOUND, parts = [];
    for (const n of S.EVENTS.filter((x) => !S.def(x).only)) { const d = S.def(n); for (const w of [1, 2, 3]) { let x = 7; const r = () => (x = (x * 48271) % 2147483647) / 2147483647;
      parts.push(n + "|" + w + "|" + JSON.stringify([d.cat, d.max, d.prio, d.gain, d.gap, d.group, d.vary, d.family, d.level ? d.level(w) : 1, d.make(w, r)])); } }
    const fnv = (str) => { let h = 0x811c9dc5; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16); };
    const sig = fnv(parts.join("\n"));
    // traccia: dopo lo sblocco (la catena dei campioni si crea allo sblocco e non suona), un evento alla volta con i pesi 1-3, in modo “sintetici”
    let t = 0; const q = [], sb2 = loadModule(true), fl = [];
    const S2 = sb2.FORTRESS_SOUND_CREATE({ AudioContext: sb2.AudioContext, now: () => t, setTimer: (fn, ms) => q.push({ at: t + ms, fn }), fetch: fakeFetch(fl) });
    S2.unlock(); S2.setActive(true); sb2.__trace = [];
    for (const n of S2.EVENTS) for (const w of [1, 2, 3]) { t += 5000; S2.play(n, w); t += 200; q.sort((a, b) => a.at - b.at); while (q.length && q[0].at <= t) q.shift().fn(); }
    const tsig = fnv(sb2.__trace.join("\n"));
    console.log("sintetici: firma degli strati", sig, "(1.25.1: da469a69) · traccia Web Audio", tsig, "(1.25.1: " + TRACE_1251 + ") · file chiesti", fl.length, "· suoni con campioni", Object.keys(S2.stats.sampled).length,
      ok(sig === "da469a69" && tsig === TRACE_1251 && !fl.length && !Object.keys(S2.stats.sampled).length));
  }
  {
    // campioni: i file si decodificano una volta sola al primo sblocco; i tre eventi usano i file, gli altri restano sintetici
    let t = 0; const q = [], sb = loadModule(true), fl = [];
    const S = sb.FORTRESS_SOUND_CREATE({ AudioContext: sb.AudioContext, now: () => t, setTimer: (fn, ms) => q.push({ at: t + ms, fn }), fetch: fakeFetch(fl) });
    const flush = () => { q.sort((a, b) => a.at - b.at); while (q.length && q[0].at <= t) q.shift().fn(); };
    S.setMode("campioni"); const before = fl.length;
    S.unlock(); S.setActive(true); S.unlock(); S.setMode("sintetici"); S.setMode("campioni"); await settle(); await settle();
    const ac = sb.__acs[0], files = S.files();
    console.log("campioni: file chiesti prima dello sblocco", before, "· dopo", fl.length, "(file della prova " + files.length + ", indirizzi " + (fl[0] || "").replace(/[^/]*$/, "") + "…) · decodificati", ac.log.decoded,
      "· catena comune: compressore", ac.log.comp, "riverbero", ac.log.conv, ok(before === 0 && fl.length === files.length && new Set(fl).size === files.length && ac.log.decoded === files.length && ac.log.comp === 1 && ac.log.conv === 1));
    for (const n of S.EVENTS) for (const w of [1, 2, 3]) { t += 5000; S.play(n, w); t += 200; flush(); }
    const sampled = Object.keys(S.stats.sampled).sort();
    console.log("campioni: eventi suonati con i file", sampled.join(", "), "· sorgenti dei file avviate", ac.log.samples, "· suoni non costruiti", Object.keys(S.stats.failed).join(", ") || "nessuno",
      ok(sampled.join() === ALLS.slice().sort().join() && ac.log.samples > 0 && !Object.keys(S.stats.failed).length));
    const vars = ALL3.map((n) => n + " " + S.variants(n, 1).length).concat(["cupola peso 3 " + S.variants("cupola", 3).length]);
    console.log("varianti pronte:", vars.join(" · "), "· tutte decodificate", ALL3.every((n) => S.variants(n, 1).every((v) => v.ok)), ok(ALL3.every((n) => S.variants(n, 1).length >= 2 && S.variants(n, 1).every((v) => v.ok)) && S.variants("cupola", 3).length >= 1));
    // scelte di Marco dopo la prova sul telefono (1.31.1): esplosione 1-2 per la Sky Guard e 3 per i kamikaze (peso 2); cupola come campo di forza, senza vetro
    const ex = (w) => S.variants("esplosione.grande", w).map((v) => v.files[0]).join(" "), cv = [1, 2, 3].flatMap((w) => S.variants("cupola", w));
    const field = cv.every((v) => v.files.includes("forceField_001") && v.files.some((f) => /^impactMetal_/.test(f))), noGlass = !S.files().some((f) => /glass/.test(f));
    const kami = (GAME.match(/sfx\("esplosione\.grande", 2\)/g) || []).length, kSites = [GAME.indexOf("boom() {"), GAME.indexOf("function kamikaze(e)")].map((p) => /sfx\("esplosione\.grande", 2\)/.test(GAME.slice(p, p + 400)));
    console.log("1.31.1: esplosione peso 1 →", ex(1), "· peso 2 (kamikaze) →", ex(2), "· cupola: colpo metallico + campo di forza in tutte le", cv.length, "varianti:", field, "· niente vetro:", noGlass,
      "· nel gioco peso 2 ai Droni kamikaze e al kamikaze:", kSites.join(" "), "(" + kami + " chiamate)", ok(ex(1) === "explosionCrunch_000 explosionCrunch_001" && ex(2) === "explosionCrunch_004" && field && noGlass && kami === 2 && kSites.every(Boolean)));
    // sette torrette (1.32.0): almeno 2 varianti ciascuna, le altre quattro senza campioni; Laser e Beam (energy) con lo stesso tipo di file (laserLarge), il Beam più grave
    const tv = TURRETS7.map((n) => S.variants(n, 1)), others = ["thunder", "tesla"].filter((id) => S.variants("sparo." + id, 1).length).length;
    const energy = ["sparo.laser", "sparo.beam"].every((n) => S.variants(n, 1).every((v) => /^laserLarge_/.test(v.files[0])));
    console.log("1.32.0: torrette con i campioni", TURRETS7.map((n, k) => n.slice(6) + " " + tv[k].length).join(" · "), "· Thunderbolt e Teslacoil con campioni:", others, "· Laser e Beam con laserLarge:", energy,
      ok(tv.every((v) => v.length >= 2 && v.every((x) => x.ok)) && others === 0 && energy && S.SAMPLED_EVENTS.length === 18));
    // 1.36.0 (Marco): pacco regalo con i campioni; il pacco perso (timer scaduto) solo con i campioni
    const pk = ["pacco.arrivo", "pacco.premio", "pacco.perso"].map((n) => S.variants(n, 1).map((v) => v.files.join("+")).join()).join(" · ");
    t += 5000; S.setMode("sintetici"); const st2 = ac.log.started, pq = S.play("pacco.perso"), pSilent = !pq && ac.log.started === st2; S.setMode("campioni");
    const gSite = GAME.slice(GAME.indexOf("if (g.t <= 0) { g.phase = \"out\""), GAME.indexOf("if (g.t <= 0) { g.phase = \"out\"") + 120);
    console.log("1.36.0: pacco regalo", pk, "· pacco perso muto con i sintetici:", pSilent, "· nel gioco allo scadere del timer:", /sfx\("pacco\.perso"\)/.test(gSite),
      ok(pk === "question_003 · maximize_007 · minimize_007" && pSilent && /sfx\("pacco\.perso"\)/.test(gSite)));
    // 1.34.0 (Marco): ingressi con spaceEngine (boss 000, mini-boss 003), fiamme con thrusterFire per Sky Guard e Firewheel
    const fv = (n) => S.variants(n, 1), bossF = fv("boss.arrivo").map((v) => v.files[0]).join(), miniF = fv("miniboss.arrivo").map((v) => v.files[0]).join();
    const fire = ["sparo.sky", "sparo.wheel"].every((n) => fv(n).length >= 2 && fv(n).every((v) => v.ok && /^thrusterFire_/.test(v.files[0])));
    const impact = fv("boss.arrivo").every((v) => v.files.includes("lowFrequency_explosion_000")) && fv("miniboss.arrivo").every((v) => v.files.includes("lowFrequency_explosion_001"));
    console.log("1.34.0: ingresso del boss", bossF, "· del mini-boss", miniF, "· colpo profondo alla fine:", impact, "· Sky Guard e Firewheel con thrusterFire:", fire, "· suono continuo della Firewheel:", S.HOLD_TURRETS.includes("wheel"),
      ok(bossF === "spaceEngine_000" && miniF === "spaceEngine_003" && impact && fire && S.HOLD_TURRETS.includes("wheel")));
    // 1.35.0 (Marco): aree in fiamme della Sky Guard con un suono continuo; le bruciature senza suono
    t += 5000; const fOn = S.hold("fiamme", true), fHeld = S.holding().includes("fiamme"), fOff = S.hold("fiamme", false), fGone = !S.holding().includes("fiamme");
    const burnSfx = /sfx\(/.test(GAME.slice(GAME.indexOf("function skyBurn"), GAME.indexOf("function skyBurn") + 300)) || /sfx\(/.test(GAME.slice(GAME.indexOf("const burn = "), GAME.indexOf("\n", GAME.indexOf("const burn = "))));
    console.log("1.35.0: aree in fiamme: acceso", fOn && fHeld, "· spento", !fOff && fGone, "· file", S.variants ? "thrusterFire_001" : "", "· bruciature senza suono:", !burnSfx,
      ok(fOn && fHeld && !fOff && fGone && !burnSfx));
    // 1.33.0 (Marco dopo la prova sul telefono): suoni continui per Laser, Beam e Disruption; colpi dei droni dell’Hive; Vortex più forte e di 2 s
    t += 5000; const lp0 = ac.log.loops, st0 = ac.log.stops;
    const h1 = S.hold("laser", true), h2 = S.hold("laser", true), h3 = S.hold("beam", true), h4 = S.hold("disr", true), lpOn = ac.log.loops - lp0, held = S.holding().join(" ");
    const h5 = S.hold("laser", false), after = S.holding().join(" "), stopped = ac.log.stops > st0;
    S.setActive(false); const paused = S.holding().length; S.setActive(true);
    S.hold("beam", true); S.setMode("sintetici"); const synthOff = S.holding().length, synthOn = S.hold("beam", true); S.setMode("campioni");
    const bad = S.hold("sky", true) === false && S.hold("inesistente", true) === false;
    console.log("1.33.0: suoni continui", S.HOLD_TURRETS.join(" "), "· accesi", held, "(ripetizioni avviate " + lpOn + ", acceso due volte = uno solo:", h1 && h2, ") · spento il Laser →", after || "nessuno", "con dissolvenza:", stopped,
      "· in pausa accesi", paused, "· sintetici: spenti", synthOff === 0, "e non si accendono", !synthOn, "· altre torrette no:", bad,
      ok(S.HOLD_TURRETS.join() === "laser,beam,disr,wheel,fiamme" && h1 && h2 && h3 && h4 && !h5 && held === "laser beam disr" && lpOn >= 4 && after === "beam disr" && stopped && paused === 0 && synthOff === 0 && !synthOn && bad));
    const hv = S.variants("colpo.hive", 1), vx = S.variants("sparo.vortex", 1), sm0 = S.stats.sampled["colpo.hive"] || 0;
    t += 5000; const hp = S.play("colpo.hive"); t += 5000; S.setMode("sintetici"); const st1 = ac.log.started, hq = S.play("colpo.hive"), silent = ac.log.started === st1; S.setMode("campioni");
    console.log("1.33.0: colpi dei droni", hv.length, "varianti (" + [...new Set(hv.map((v) => v.files[0].replace(/_\d+$/, "")))].join() + ") · con i campioni suona", hp, "con i file", (S.stats.sampled["colpo.hive"] || 0) - sm0,
      "· nel modo sintetici tace:", !hq && silent, "· Vortex: rombo intero e ronzio del campo in tutte le", vx.length, "varianti:", vx.every((v) => v.files.includes("lowFrequency_explosion_000") && v.files.some((f) => /^forceField_/.test(f))),
      ok(hv.length >= 2 && hv.every((v) => /^laserSmall_/.test(v.files[0])) && hp && (S.stats.sampled["colpo.hive"] || 0) - sm0 === 1 && !hq && silent && vx.length >= 2 && vx.every((v) => v.files.includes("lowFrequency_explosion_000") && v.files.some((f) => /^forceField_/.test(f)))));
    // il catalogo può chiedere il sintetico o una variante precisa
    t += 5000; const s0 = ac.log.samples; S.preview("guardiano", 1, "sintetico"); t += 5000; const s1 = ac.log.samples; S.preview("guardiano", 1, 2); const s2 = ac.log.samples;
    S.setMode("boh");
    console.log("catalogo: sintetico senza file", s1 === s0, "· variante 3 con i file", s2 > s1, "· modo non valido →", S.mode(), ok(s1 === s0 && s2 > s1 && S.mode() === "sintetici"));
  }
  {
    // ripiego: mancano i tre clic del guardiano e un colpo della cupola → il guardiano torna sintetico, la cupola usa le altre varianti; i file mancanti sono contati
    let t = 0; const q = [], sb = loadModule(true), fl = [];
    const S = sb.FORTRESS_SOUND_CREATE({ AudioContext: sb.AudioContext, now: () => t, setTimer: (fn, ms) => q.push({ at: t + ms, fn }), fetch: fakeFetch(fl, ["click_", "impactMetal_000"]) });
    const flush = () => { q.sort((a, b) => a.at - b.at); while (q.length && q[0].at <= t) q.shift().fn(); };
    S.setMode("campioni"); S.unlock(); S.setActive(true); await settle(); await settle();
    const st0 = sb.__acs[0].log.started;
    for (let i = 0; i < 6; i++) { t += 5000; S.play("guardiano"); S.play("cupola", 1); t += 200; flush(); }
    const g = S.stats.sampled.guardiano || 0, c = S.stats.sampled.cupola || 0, failed = Object.keys(S.stats.failed);
    console.log("file mancanti: guardiano con i file", g, "su 6 (sintetico, sorgenti avviate " + (sb.__acs[0].log.started - st0) + ") · cupola con i file", c, "su 6 · contati in stats.failed:", failed.join(", "),
      ok(g === 0 && c === 6 && sb.__acs[0].log.started > st0 && failed.length === 4 && failed.every((k) => /^suoni\/(click_00[235]|impactMetal_000)\.ogg$/.test(k))));
    // senza fetch (o file non decodificabile) nessun errore: tutto sintetico
    const sb2 = loadModule(true), S2 = sb2.FORTRESS_SOUND_CREATE({ AudioContext: sb2.AudioContext, fetch: null });
    let err = null; try { S2.setMode("campioni"); S2.unlock(); S2.setActive(true); for (const n of ALL3) S2.play(n, 3); } catch (e) { err = e.message; }
    console.log("senza fetch: errori", err || "nessuno", "· file contati come mancanti", Object.keys(S2.stats.failed).length, ok(!err && Object.keys(S2.stats.failed).length === S2.files().length));
  }
  await game();
})().catch((e) => { console.log("✗ ERRORE", e.stack); });

async function game() {
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
  g.click(154 + 6 + 0.3 * 72, 614); g.frame(); const mid = X.settings.volume, savedMid = JSON.parse(g.win.localStorage.getItem("fortress-proto-v1") || "{}").volume;
  g.move(154 + 80, 614); g.frame(); g.up(154 + 80, 614); const saved = JSON.parse(g.win.localStorage.getItem("fortress-proto-v1")).volume;
  console.log("cursore nel menu (“" + T.find((s) => /^Volume/.test(s)) + "”): tocco al 30% →", mid, "(non ancora salvato:", savedMid === undefined, ") · trascinato in fondo →", X.settings.volume, "salvato", saved, "· modulo", S.volume(),
    ok(mid === 30 && savedMid === undefined && X.settings.volume === 100 && saved === 100 && S.volume() === 1));
  g.click(154 + 3, 614); g.up(154 + 3, 614); g.texts.length = 0; g.frame(); const T2 = g.texts.slice();
  console.log("tocco a sinistra → 0:", X.settings.volume, T2.find((s) => /^Volume/.test(s)), ok(X.settings.volume === 0 && T2.includes("Volume: muto")));
  console.log("volume fuori dall’esportazione:", JSON.stringify(X.makeSave().settings), ok(!("volume" in X.makeSave().settings)));
  // prova dei campioni: campo “suoni” e tasto accanto al cursore
  const mode = (st) => { const g2 = makeGame({ patch: hook, settings: st }); return g2.win.__x.settings.suoni + "/" + g2.win.FORTRESS_SOUND.mode(); };
  const m = [mode(null), mode({ suoni: "campioni" }), mode({ suoni: "boh" }), mode({ suoni: 1 })];
  console.log("suoni letti (impostazione/modulo): di base", m[0], "· campioni →", m[1], "· \"boh\" →", m[2], "· 1 →", m[3], ok(m.join() === "sintetici/sintetici,campioni/campioni,sintetici/sintetici,sintetici/sintetici"));
  g.texts.length = 0; g.frame(); const b0 = g.texts.includes("Sintetici");
  g.click(272, 614); g.up(272, 614); g.texts.length = 0; g.frame();
  const sv = JSON.parse(g.win.localStorage.getItem("fortress-proto-v1")).suoni, b1 = g.texts.includes("Campioni");
  console.log("tasto “Sintetici” nel menu → “Campioni”:", b0 && b1, "· salvato", sv, "· modulo", S.mode(), "· fuori dall’esportazione:", !("suoni" in X.makeSave().settings),
    ok(b0 && b1 && sv === "campioni" && S.mode() === "campioni" && !("suoni" in X.makeSave().settings)));
  g.click(272, 614); g.up(272, 614);
  console.log("di nuovo → sintetici:", X.settings.suoni, S.mode(), ok(X.settings.suoni === "sintetici" && S.mode() === "sintetici"));
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
  // con i campioni (fetch finto nella pagina): stessi esiti; i tre eventi suonano con i file
  const injectFetch = (h) => h.replace('<canvas id="c"', "<script>window.fetch = (u) => Promise.resolve({ ok: true, arrayBuffer: () => Promise.resolve(new ArrayBuffer(/lowFrequency/.test(u) ? 2 : 1)) });</script>\n<canvas id=\"c\"");
  const o4 = { seed: 4, cleared: L - 1, level: L, settings: { suoni: "campioni" }, patch: (h) => hook(injectAC(injectFetch(h))) };
  o4.game = makeGame(o4); await settle(); await settle(); await settle();   // il tocco su “Start” ha avviato la decodifica: si aspetta che finisca
  const cs = play(o4, "smart");
  const cn = play({ seed: 4, cleared: L - 1, level: L, patch: hook }, "smart");
  out.push({ seed: 4, same: cs.result === cn.result && cs.wave === cn.wave && cs.picks.join("|") === cn.picks.join("|"), a: cs.result[0] + cs.wave, b: cn.result[0] + cn.wave, err: cs.errors.concat(cn.errors) });
  const CS = cs.g.win.FORTRESS_SOUND, smp = Object.keys(CS.stats.sampled).sort().join(", ");
  console.log("livello " + L + " con i campioni (seme 4): " + out[3].a + "/" + out[3].b, "· stesso esito e stesse carte:", out[3].same, "· eventi suonati con i file (solo della prova):", smp, "· file non riusciti:", Object.keys(CS.stats.failed).length,
    ok(out[3].same && /guardiano/.test(smp) && smp.split(", ").every((n) => ALLS.includes(n)) && !Object.keys(CS.stats.failed).length));
  // suoni continui nel gioco (1.33.0): accesi dalle torrette occupate (raggio o campo), chiamati dopo gli effetti a ogni fotogramma
  const heldG = Object.keys(CS.stats.held).sort().join(" "), upd = GAME.slice(GAME.indexOf("function update(dt)"), GAME.indexOf("function update(dt)") + 1500);
  const wired = /for \(const o of ents\) o\.update\(dt\);\n  holdSounds\(\);/.test(upd) && /const HOLD_SOUNDS = \["laser", "beam", "disr", "wheel"\];/.test(GAME) && /s\.busy > 0/.test(GAME.slice(GAME.indexOf("function holdSounds"), GAME.indexOf("function holdSounds") + 300))
    && /SOUND\.hold\("fiamme", ents\.some\(\(o\) => o\.fireField && !o\.dead\)\);/.test(GAME);
  const hiveShot = /this\.shots\+\+; this\.cd = 1\.0; sfx\("colpo\.hive"\);/.test(GAME);
  console.log("1.33.0 nel gioco: suoni continui accesi nella partita con i campioni:", heldG || "nessuno", "· collegati alle torrette occupate:", wired, "· colpo dei droni dell’Hive a ogni sparo:", hiveShot,
    ok(/laser/.test(heldG) && wired && hiveShot));
  // (cupola ed esplosione grande sono raggruppate con un timer che qui scatta solo a partita finita: i tre eventi li controlla la prova del modulo)
  console.log("livello " + L + ", 3 semi, con e senza audio:", out.slice(0, 3).map((o) => o.a + "/" + o.b).join(" "), "| stessi esiti e stesse carte:", out.every((o) => o.same), ok(out.every((o) => o.same)));
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
  const btn = [...d.window.document.querySelectorAll(".grid:not(.cmp) button")], S = d.window.FORTRESS_SOUND;
  const evs = S.EVENTS.filter((n) => !S.def(n).only);   // gli eventi solo con i campioni stanno nella prova dei campioni
  const covered = evs.every((n) => btn.some((b) => b.textContent.includes(n) || (n.startsWith("sparo.") && b.textContent.includes(n))));
  console.log("usa app/audio.js:", usesFile, "· tasti", btn.length, "(attesi " + (evs.length + 2) + ") · ogni evento ha il suo tasto:", covered,
    ok(usesFile && btn.length === evs.length + 2 && covered));
  // prova dei campioni: per guardiano, esplosione grande e cupola (pesi 1-3) un tasto sintetico e uno per variante; dati dei campioni al passo con app/suoni/
  const cmp = [...d.window.document.querySelectorAll(".grid.cmp button")], want = S.SAMPLED_EVENTS.flatMap((n) => (n === "cupola" ? [1, 2, 3] : n === "esplosione.grande" ? [1, 2] : [1]).map((w) => (S.def(n).only ? 0 : 1) + S.variants(n, w).length)).reduce((a, b) => a + b, 0) + S.HOLD_TURRETS.length;
  const synth = cmp.filter((b) => b.className === "synth").length, data = require("./tools/sonoro-campioni.js"), fresh = fs.existsSync(data.OUT) && fs.readFileSync(data.OUT, "utf8") === data.build();
  const onDisk = fs.readdirSync(path.join(__dirname, "..", "app", "suoni")).filter((f) => f.endsWith(".ogg")).map((f) => f.slice(0, -4)).sort().join();
  console.log("campioni nel catalogo: tasti", cmp.length, "(attesi " + want + ", sintetici " + synth + ") · usa catalogo-sonoro-campioni.js:", html.includes("<script src=\"catalogo-sonoro-campioni.js\"></script>"), "· dati al passo con app/suoni/:", fresh,
    "· file in app/suoni/ = file del modulo:", onDisk === S.files().slice().sort().join(), ok(cmp.length === want && synth === 19 && cmp.filter((b) => b.className === "hold").length === 5 && fresh && onDisk === S.files().slice().sort().join() && html.includes("<script src=\"catalogo-sonoro-campioni.js\"></script>")));
}
}
