// Planet Defense · SONORO (1.25.0, DESIGN.md § 18)
// Un solo modulo per tutti i suoni. Il gioco chiede solo EVENTI ("guardiano", "sparo.sky", "esplosione.grande", "cupola"…) con play(nome, peso):
// qui si decidono timbro, volume, priorità e raggruppamenti. Nessuna chiamata a Web Audio fuori da questo file.
// Suoni generati dal codice (oscillatori e rumore), nessun file. Per passare a file audio basta cambiare voice() per gli eventi interessati
// (e aggiungere i file ad ASSETS in sw.js).
// Regole: nessun uso di Math.random (le variazioni usano un generatore proprio) e nessun valore di gioco letto o scritto: calibrazioni e bot non cambiano.
// Senza AudioContext (test in Node, browser vecchi) ogni funzione non fa nulla e non dà errori.
// Timbri, volumi, voci e soglie [Claude, da rivedere]: da provare a mano su Android, a 2x e con molte esplosioni a catena.
(function (root) {
  "use strict";

  // ---- strati di un suono ----
  // o: forma d’onda ("sine", "square", "sawtooth", "triangle") o "noise"; f: [frequenza iniziale, finale] (Hz; per il rumore è il filtro);
  // d: durata (s); a: attacco (s); g: volume; flt: [tipo di filtro, frequenza, q] (per il rumore il tipo, la frequenza la dà f); at: ritardo (s)
  const L = (o, f0, f1, d, g, extra) => Object.assign({ o, f: [f0, f1 == null ? f0 : f1], d, g, a: 0.004, at: 0 }, extra || {});

  // ---- famiglie delle torrette (tipo di danno) e le loro varianti ----
  const FAMILY = {
    fire: (k) => [L("noise", 700 * k, 2600 * k, 0.26, 0.55, { flt: ["bandpass", 0, 1.2], a: 0.02 }), L("sine", 190 * k, 85 * k, 0.14, 0.45)],
    energy: (k) => [L("sawtooth", 1700 * k, 480 * k, 0.17, 0.22, { flt: ["lowpass", 3800, 1] }), L("sine", 900 * k, 1800 * k, 0.12, 0.18)],
    electric: (k) => [L("noise", 3200 * k, 2200 * k, 0.13, 0.5, { flt: ["bandpass", 0, 2.5] }), L("square", 130 * k, 60 * k, 0.14, 0.16, { flt: ["lowpass", 1400, 1] })],
    force: (k) => [L("sine", 320 * k, 75 * k, 0.24, 0.6), L("noise", 600 * k, 250 * k, 0.15, 0.3, { flt: ["lowpass", 0, 0.8] })],
    physical: (k) => [L("sine", 150 * k, 48 * k, 0.17, 0.75), L("noise", 1600 * k, 600 * k, 0.07, 0.45, { flt: ["lowpass", 0, 0.7] })],
  };
  // ogni torretta: famiglia, intonazione (k) e uno strato proprio che la distingue dalle altre dello stesso tipo
  const TURRET = {
    sky: ["fire", 1, [L("noise", 3000, 1200, 0.18, 0.2, { flt: ["highpass", 0, 0.7], at: 0.03 })]],              // lancio dei missili
    wheel: ["fire", 0.8, [L("triangle", 220, 340, 0.2, 0.2)]],                                                     // ruota che parte girando
    laser: ["energy", 1, []],
    beam: ["energy", 0.7, [L("square", 1150, 1150, 0.22, 0.07, { flt: ["bandpass", 1150, 6] })]],                   // raggio che resta acceso
    thunder: ["electric", 1, [L("noise", 900, 300, 0.22, 0.25, { flt: ["lowpass", 0, 0.7], at: 0.02 })]],          // tuono
    tesla: ["electric", 1.25, [L("sawtooth", 220, 460, 0.18, 0.1, { flt: ["bandpass", 1500, 2] })]],              // carica che sale
    disr: ["force", 1.2, []],
    hive: ["force", 1.6, [L("triangle", 520, 260, 0.12, 0.18)]],                                                    // droni in uscita
    vortex: ["force", 0.65, [L("sawtooth", 110, 55, 0.35, 0.12, { flt: ["lowpass", 420, 1] })]],                    // buco nero
    aero: ["physical", 1, [L("noise", 400, 200, 0.12, 0.25, { flt: ["lowpass", 0, 0.7] })]],                       // bomba in partenza
    rail: ["physical", 1.4, [L("square", 2600, 320, 0.08, 0.14, { flt: ["lowpass", 5000, 1] }), L("noise", 2500, 1500, 0.12, 0.3, { flt: ["highpass", 0, 0.7] })]],   // colpo secco
  };

  // ---- eventi ----
  // cat = categoria per il limite di voci (max); prio: 4 boss e pacco · 3 cupola, esplosioni grandi e abilità · 2 torrette ed esplosioni piccole · 1 guardiano;
  // gain: volume dell’evento; gap: soglia minima tra due suoni uguali (ms); group: raggruppa gli eventi di quella finestra (ms) in un solo suono
  // con il peso più alto; vary: variazione d’intonazione (±); make(peso) → strati
  const EVENTS = {};
  const ev = (name, o) => { EVENTS[name] = Object.assign({ cat: name, max: 1, prio: 2, gain: 0.5, gap: 60, vary: 0 }, o); };

  ev("guardiano", { cat: "guardiano", max: 2, prio: 1, gain: 0.16, gap: 55, vary: 0.06,
    make: () => [L("square", 1500, 700, 0.045, 0.35, { flt: ["bandpass", 1900, 1.5], a: 0.002 }), L("noise", 4500, 3000, 0.03, 0.35, { flt: ["highpass", 0, 0.7], a: 0.002 })] });
  for (const id in TURRET) {
    const [fam, k, own] = TURRET[id];
    ev("sparo." + id, { prio: 2, gain: 0.3, gap: 80, vary: 0.04, family: fam, make: () => FAMILY[fam](k).concat(own) });
  }
  ev("esplosione.piccola", { prio: 2, max: 3, gain: 0.32, group: 50, gap: 70, vary: 0.08,
    make: () => [L("noise", 1800, 280, 0.26, 0.8, { flt: ["lowpass", 0, 0.8] }), L("sine", 120, 45, 0.2, 0.55)] });
  ev("esplosione.grande", { prio: 3, max: 2, gain: 0.55, group: 60, gap: 110, vary: 0.05,
    make: () => [L("noise", 2600, 140, 0.7, 0.9, { flt: ["lowpass", 0, 0.9] }), L("sine", 85, 28, 0.6, 0.9), L("noise", 420, 300, 0.9, 0.35, { flt: ["bandpass", 0, 0.8], a: 0.05 })] });
  // colpo alla cupola: peso 1 leggero (nemici normali), 2 medio (kamikaze), 3 pesante (boss): più grave, lungo e forte
  ev("cupola", { prio: 3, max: 1, gain: 0.42, group: 90, gap: 90,
    make: (w) => { const k = [1, 0.8, 0.62][w - 1] || 1, d = [1, 1.3, 1.7][w - 1] || 1;
      return [L("sine", 520 * k, 470 * k, 0.24 * d, 0.35), L("sine", 780 * k, 700 * k, 0.18 * d, 0.2), L("triangle", 210 * k, 110 * k, 0.16 * d, 0.6),
        L("noise", 900 * k, 300 * k, 0.1 * d, 0.4, { flt: ["lowpass", 0, 0.7] })]; },
    level: (w) => [0.6, 0.85, 1][w - 1] || 0.6 });
  ev("pacco.arrivo", { cat: "pacco", prio: 4, gain: 0.4, gap: 500,
    make: () => [L("sine", 880, 880, 0.16, 0.6), L("triangle", 1320, 1320, 0.3, 0.45, { at: 0.12 }), L("sine", 1760, 1760, 0.3, 0.2, { at: 0.12 })] });
  ev("pacco.premio", { cat: "pacco", prio: 4, gain: 0.42, gap: 500,
    make: () => [660, 880, 1100, 1320].map((f, i) => L("triangle", f, f, 0.26, 0.5, { at: i * 0.07 })).concat([L("sine", 2640, 2640, 0.4, 0.12, { at: 0.21 })]) });
  ev("miniboss.arrivo", { cat: "boss", max: 2, prio: 4, gain: 0.32, gap: 400,
    make: () => [0, 0.22].map((t) => L("square", 220, 196, 0.18, 0.45, { at: t, flt: ["lowpass", 1100, 1], a: 0.01 })) });
  ev("boss.arrivo", { cat: "boss", max: 2, prio: 4, gain: 0.5, gap: 1500,
    make: () => [L("sawtooth", 55, 46, 2.3, 0.5, { flt: ["lowpass", 420, 2], a: 0.25 }), L("sine", 110, 92, 2.1, 0.45, { a: 0.4 })]
      .concat([0, 0.7, 1.4].map((t) => L("square", 82, 78, 0.45, 0.25, { at: t, flt: ["lowpass", 600, 1], a: 0.02 }))) });
  // abilità dei mini-boss maggiori
  ev("maggiore.scissione", { cat: "abilita", max: 2, prio: 3, gain: 0.42, gap: 150,
    make: () => [L("noise", 950, 200, 0.4, 0.7, { flt: ["lowpass", 0, 1] }), L("sine", 170, 60, 0.35, 0.6), L("square", 320, 110, 0.1, 0.15)] });
  ev("maggiore.adattamento", { cat: "abilita", max: 2, prio: 3, gain: 0.3, gap: 200,
    make: () => [L("sine", 400, 820, 0.26, 0.45), L("triangle", 600, 1240, 0.22, 0.3, { at: 0.05 })] });
  ev("maggiore.incremento", { cat: "abilita", max: 2, prio: 3, gain: 0.26, gap: 300,
    make: () => [L("sine", 300, 620, 0.42, 0.55, { a: 0.12 }), L("sine", 450, 930, 0.36, 0.2, { a: 0.12, at: 0.04 })] });
  ev("maggiore.invisibile", { cat: "abilita", max: 2, prio: 3, gain: 0.32, gap: 300,
    make: () => [L("sine", 950, 200, 0.5, 0.5), L("noise", 3000, 400, 0.45, 0.25, { flt: ["bandpass", 0, 1.5], a: 0.05 })] });
  ev("maggiore.visibile", { cat: "abilita", max: 2, prio: 3, gain: 0.32, gap: 300,
    make: () => [L("sine", 200, 950, 0.4, 0.5), L("noise", 400, 3000, 0.35, 0.22, { flt: ["bandpass", 0, 1.5], a: 0.05 })] });
  const rayWarn = (f) => () => [0, 0.22, 0.44].map((t) => L("square", f, f, 0.08, 0.35, { at: t, flt: ["lowpass", 2400, 1] }));
  const rayShot = (f) => () => [L("sawtooth", 170 * f, 120 * f, 0.45, 0.45, { flt: ["lowpass", 1400, 1] }), L("noise", 1300 * f, 900 * f, 0.4, 0.4, { flt: ["bandpass", 0, 1.2] })];
  ev("maggiore.raggio.avviso", { cat: "abilita", max: 2, prio: 3, gain: 0.24, gap: 300, make: rayWarn(1180) });
  ev("maggiore.raggio", { cat: "abilita", max: 2, prio: 3, gain: 0.36, gap: 300, make: rayShot(1.2) });
  ev("maggiore.deviazione", { cat: "abilita", max: 2, prio: 3, gain: 0.28, gap: 200,
    make: () => [L("triangle", 600, 1000, 0.2, 0.5), L("sine", 1200, 1650, 0.16, 0.25, { at: 0.05 })] });
  // abilità dei boss giganti
  ev("gigante.intercettori", { cat: "gigante", max: 2, prio: 3, gain: 0.32, gap: 300,
    make: () => [L("square", 380, 900, 0.16, 0.25, { flt: ["lowpass", 2500, 1] }), L("noise", 2200, 1200, 0.22, 0.4, { flt: ["bandpass", 0, 1] })] });
  ev("gigante.intercetta", { cat: "gigante.colpo", max: 2, prio: 3, gain: 0.22, gap: 70, vary: 0.06,
    make: () => [L("square", 1500, 750, 0.06, 0.3, { flt: ["lowpass", 3500, 1] }), L("noise", 3500, 2500, 0.08, 0.4, { flt: ["highpass", 0, 0.7] })] });
  ev("gigante.alati", { cat: "gigante", max: 2, prio: 3, gain: 0.36, gap: 400,
    make: () => [L("sawtooth", 140, 300, 0.55, 0.4, { flt: ["lowpass", 900, 1], a: 0.05 }), L("noise", 700, 500, 0.5, 0.35, { flt: ["lowpass", 0, 0.8] })] });
  ev("gigante.assorbe", { cat: "gigante.colpo", max: 2, prio: 3, gain: 0.2, gap: 150, vary: 0.05,
    make: () => [L("sine", 300, 950, 0.18, 0.5), L("sine", 1500, 1500, 0.12, 0.2, { at: 0.04 })] });
  ev("gigante.raggio.avviso", { cat: "gigante", max: 2, prio: 3, gain: 0.3, gap: 300, make: rayWarn(760) });
  ev("gigante.raggio", { cat: "gigante", max: 2, prio: 3, gain: 0.45, gap: 300, make: rayShot(0.8) });
  ev("gigante.scissione", { cat: "gigante", max: 2, prio: 3, gain: 0.6, gap: 200,
    make: () => [L("noise", 1300, 90, 1.0, 0.9, { flt: ["lowpass", 0, 1] }), L("sine", 62, 24, 0.9, 1), L("square", 240, 80, 0.15, 0.2)] });

  const MIX = {
    maxVoices: 14,        // voci contemporanee in tutto: oltre si toglie la più vecchia di priorità più bassa (o si rinuncia al suono nuovo)
    duck: 0.5,            // le priorità 3 e 4 abbassano spari (priorità 1-2) a questo volume…
    duckT: 0.3,           // …per questi secondi, così le minacce alla cupola si sentono sempre sopra gli spari
  };

  // generatore proprio per l’intonazione (mai Math.random)
  function prng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

  function createSound(opts) {
    opts = opts || {};
    const AC = "AudioContext" in opts ? opts.AudioContext : (root.AudioContext || root.webkitAudioContext);
    const now = opts.now || (() => (root.performance && root.performance.now ? root.performance.now() : Date.now()));   // ms, tempo reale
    const timer = opts.setTimer || ((fn, ms) => setTimeout(fn, ms));
    const rand = prng(opts.seed || 0x5eed);
    let ctx = null, master = null, low = null, high = null, noise = null;
    let volume = 0.7, active = false;
    const lastAt = {}, groups = {}, voices = [];        // voices: { name, cat, prio, end (ms), nodes }
    const stats = { played: {}, dropped: {}, grouped: {} };
    const count = (o, k) => { o[k] = (o[k] || 0) + 1; };

    function setup() {
      if (ctx || !AC) return;
      try {
        ctx = new AC();
        master = ctx.createGain(); master.gain.value = volume * volume; master.connect(ctx.destination);   // curva quadratica: 70% → 0,49
        low = ctx.createGain(); low.connect(master);    // spari (priorità 1-2)
        high = ctx.createGain(); high.connect(master);  // minacce, boss e pacco (priorità 3-4)
        const n = Math.floor((ctx.sampleRate || 44100) * 1), buf = ctx.createBuffer(1, n, ctx.sampleRate || 44100), ch = buf.getChannelData(0), r = prng(0xabc);
        for (let i = 0; i < n; i++) ch[i] = r() * 2 - 1;
        noise = buf;
      } catch (e) { ctx = null; }
    }
    function sync() {                                  // sospeso fuori dall’ondata e in secondo piano
      if (!ctx) return;
      try { if (active && ctx.state !== "running") ctx.resume(); else if (!active && ctx.state === "running") ctx.suspend(); } catch (e) {}
    }
    // strati → nodi Web Audio; restituisce le sorgenti (per fermarle) e la durata
    function voice(def, w, bus, gainMul) {
      const t0 = ctx.currentTime + 0.005, pitch = def.vary ? 1 + (rand() * 2 - 1) * def.vary : 1, srcs = [];
      let dur = 0;
      const out = ctx.createGain(); out.gain.value = def.gain * gainMul; out.connect(bus);
      for (const l of def.make(w)) {
        const t = t0 + l.at, f0 = l.f[0] * pitch, f1 = l.f[1] * pitch;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, t); env.gain.linearRampToValueAtTime(l.g, t + l.a); env.gain.exponentialRampToValueAtTime(0.0001, t + l.d);
        let src, node;
        if (l.o === "noise") {
          src = ctx.createBufferSource(); src.buffer = noise; src.loop = true;
          node = ctx.createBiquadFilter(); node.type = (l.flt && l.flt[0]) || "lowpass"; node.Q.value = (l.flt && l.flt[2]) || 0.7;
          node.frequency.setValueAtTime(f0, t); node.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + l.d);
          src.connect(node); node.connect(env);
        } else {
          src = ctx.createOscillator(); src.type = l.o;
          src.frequency.setValueAtTime(f0, t); src.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + l.d);
          if (l.flt) { node = ctx.createBiquadFilter(); node.type = l.flt[0]; node.frequency.value = l.flt[1]; node.Q.value = l.flt[2]; src.connect(node); node.connect(env); }
          else src.connect(env);
        }
        env.connect(out);
        src.start(t); src.stop(t + l.d + 0.02); srcs.push(src);
        dur = Math.max(dur, l.at + l.d + 0.02);
      }
      return { srcs, dur };
    }
    function duck() {
      if (!low) return;
      try { const t = ctx.currentTime; low.gain.cancelScheduledValues(t); low.gain.setValueAtTime(MIX.duck, t); low.gain.linearRampToValueAtTime(1, t + MIX.duckT); } catch (e) {}
    }
    // suona subito (dopo soglia e raggruppamento): limite di voci per categoria e in tutto, con priorità
    function start(name, def, w) {
      const t = now();
      for (let i = voices.length - 1; i >= 0; i--) if (voices[i].end <= t) voices.splice(i, 1);
      const same = voices.filter((v) => v.cat === def.cat);
      if (same.length >= def.max) { count(stats.dropped, name); return false; }
      if (voices.length >= MIX.maxVoices) {             // pieno: si toglie la più vecchia tra quelle di priorità più bassa, se è sotto la nuova
        let victim = null;
        for (const v of voices) if (v.prio < def.prio && (!victim || v.prio < victim.prio)) victim = v;
        if (!victim) { count(stats.dropped, name); return false; }
        voices.splice(voices.indexOf(victim), 1);
        for (const s of victim.srcs) try { s.stop(); } catch (e) {}
      }
      lastAt[name] = t; count(stats.played, name);
      let srcs = [], dur = 0.3;
      if (ctx) {
        try {
          if (def.prio >= 3) duck();
          const lv = def.level ? def.level(w) : 1;
          ({ srcs, dur } = voice(def, w, def.prio >= 3 ? high : low, lv));
        } catch (e) { /* un suono non riuscito non ferma il gioco */ }
      }
      voices.push({ name, cat: def.cat, prio: def.prio, end: t + dur * 1000, srcs });
      return true;
    }

    const api = {
      EVENTS: Object.keys(EVENTS), MIX, stats,
      def: (name) => EVENTS[name],
      // al tocco su “Start” (e a ogni tocco sul gioco, per i browser che chiedono un gesto anche dopo): crea e sblocca l’AudioContext
      unlock() { setup(); sync(); },
      // il gioco lo chiama a ogni fotogramma: suoni solo durante l’ondata e con la pagina in primo piano
      setActive(on) { on = !!on; if (on === active) return; active = on; sync(); },
      setVolume(v) {
        volume = Math.max(0, Math.min(1, +v || 0));
        if (master) try { master.gain.setValueAtTime(volume * volume, ctx.currentTime); } catch (e) {}
      },
      volume: () => volume,
      active: () => active,
      ready: () => !!ctx,
      // evento del gioco; w = peso (cupola: 1 leggero, 2 medio, 3 pesante)
      play(name, w) {
        const def = EVENTS[name];
        if (!def) return false;
        if (!active || volume <= 0) return false;
        w = w || 1;
        const t = now();
        if (def.group) {                                // raggruppamento: un suono per finestra, con il peso più alto
          const g = groups[name];
          if (g && t - g.t < def.group * 4) { g.w = Math.max(g.w, w); g.n++; count(stats.grouped, name); return true; }   // (un timer mai arrivato non blocca l’evento)
          if (lastAt[name] != null && t - lastAt[name] < def.gap) { count(stats.dropped, name); return false; }
          const mine = groups[name] = { w, n: 1, t };
          timer(() => { if (groups[name] !== mine) return; delete groups[name]; if (active) start(name, def, mine.w); }, def.group);
          return true;
        }
        if (lastAt[name] != null && t - lastAt[name] < def.gap) { count(stats.dropped, name); return false; }
        return start(name, def, w);
      },
    };
    return api;
  }

  root.FORTRESS_SOUND_CREATE = createSound;
  root.FORTRESS_SOUND = createSound();
})(typeof window !== "undefined" ? window : globalThis);
