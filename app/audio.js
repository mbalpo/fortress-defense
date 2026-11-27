// Planet Defense · SONORO (1.25.0, timbri rivisti nella 1.25.1, prova dei campioni nella 1.31.0, suoni continui nella 1.33.0, ingressi e fiamme nella 1.34.0, aree in fiamme nella 1.35.0, pacco regalo nella 1.36.0; DESIGN.md § 18)
// Un solo modulo per tutti i suoni. Il gioco chiede solo EVENTI ("guardiano", "sparo.sky", "esplosione.grande", "cupola"…) con play(nome, peso):
// qui si decidono timbro, volume, priorità e raggruppamenti. Nessuna chiamata a Web Audio fuori da questo file.
// Suoni generati dal codice (oscillatori e rumore). Prova dei campioni (1.31.0): guardiano, esplosione grande e cupola hanno anche una versione
// con file audio (app/suoni/, Kenney CC0, crediti in app/suoni/CREDITI.md); si sceglie con setMode("sintetici" | "campioni"), il sintetico resta com’era.
// Regole: nessun uso di Math.random (le variazioni usano un generatore proprio) e nessun valore di gioco letto o scritto: calibrazioni e bot non cambiano.
// Senza AudioContext (test in Node, browser vecchi) ogni funzione non fa nulla e non dà errori.
// Timbri, volumi, voci e soglie [Claude, da rivedere]: da provare a mano su Android, a 2x e con molte esplosioni a catena.
(function (root) {
  "use strict";

  // ---- strati di un suono ----
  // o: forma d’onda ("sine", "square", "sawtooth", "triangle") o "noise"; f: [frequenza iniziale, finale] (Hz; per il rumore è il filtro);
  // d: durata (s); a: attacco (s); g: volume; flt: [tipo di filtro, frequenza, q] (per il rumore il tipo, la frequenza la dà f); at: ritardo (s)
  // strati nuovi (1.25.1): am: [frequenza (Hz), profondità 0-1] = modulazione d’ampiezza (ronzio); sat: saturazione (1 leggera … 4 forte)
  const L = (o, f0, f1, d, g, extra) => Object.assign({ o, f: [f0, f1 == null ? f0 : f1], d, g, a: 0.004, at: 0 }, extra || {});
  // grani: n colpetti di rumore brevissimi a istanti, durate, frequenze e volumi irregolari (dal generatore r del modulo, mai Math.random)
  // t: [da, a] (s) · fr: [Hz min, max] · d: [s min, max] · g: [min, max] · fade: i volumi calano verso la fine (coda di detriti)
  const span = (r, ab) => ab[0] + r() * (ab[1] - ab[0]);
  const grains = (r, n, o) => Array.from({ length: n }, () => {
    const at = span(r, o.t), f = span(r, o.fr), fade = o.fade ? 1 - 0.75 * (at - o.t[0]) / (o.t[1] - o.t[0] || 1) : 1;
    return L("noise", f, f * 0.85, span(r, o.d), span(r, o.g) * fade, { flt: [o.type || "bandpass", 0, o.q || 1.4], a: 0.001, at });
  });

  // ---- famiglie delle torrette (tipo di danno) e le loro varianti ----
  const FAMILY = {
    // fuoco (1.25.1): “fwoomp” morbido (rumore basso che si apre, attacco lento) e crepitio di grani brevissimi a 1,5-4 kHz
    fire: (k, r) => [L("noise", 260 * k, 900 * k, 0.3, 0.75, { flt: ["lowpass", 0, 0.9], a: 0.06 }), L("sine", 95 * k, 70 * k, 0.22, 0.22, { a: 0.05 })]
      .concat(grains(r, 12, { t: [0.01, 0.3], fr: [1500, 4000], d: [0.003, 0.015], g: [0.15, 0.75] })),
    energy: (k) => [L("sawtooth", 1700 * k, 480 * k, 0.17, 0.22, { flt: ["lowpass", 3800, 1] }), L("sine", 900 * k, 1800 * k, 0.12, 0.18)],
    // elettricità (1.25.1): ronzio grave quasi fisso con armoniche (dente di sega), modulato in ampiezza, e pochi scoppiettii di 5-10 ms a istanti irregolari
    electric: (k, r) => [L("sawtooth", 110 * k, 104 * k, 0.24, 0.42, { flt: ["lowpass", 1600, 1.5], a: 0.01, am: [32, 0.7] }),
      L("square", 220 * k, 208 * k, 0.2, 0.1, { flt: ["bandpass", 900, 2], am: [32, 0.7] })]
      .concat(grains(r, 2 + Math.floor(r() * 3), { t: [0, 0.2], fr: [2500, 6000], d: [0.005, 0.01], g: [0.4, 0.9], type: "highpass", q: 0.7 })),
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

  // guardiano (1.25.1): clic più basso e più lungo (85 ms) con un colpo grave brevissimo sotto (filtrato e piano, perché a 6-7 salve al secondo non si impasti)
  ev("guardiano", { cat: "guardiano", max: 2, prio: 1, gain: 0.16, gap: 55, vary: 0.06,
    make: () => [L("square", 760, 360, 0.085, 0.32, { flt: ["bandpass", 1050, 1.3], a: 0.002 }), L("noise", 2600, 1100, 0.05, 0.3, { flt: ["bandpass", 0, 0.9], a: 0.001 }),
      L("sine", 150, 70, 0.035, 0.28, { flt: ["lowpass", 320, 0.7], a: 0.001 })] });
  for (const id in TURRET) {
    const [fam, k, own] = TURRET[id];
    ev("sparo." + id, { prio: 2, gain: 0.3, gap: 80, vary: 0.04, family: fam, make: (w, r) => FAMILY[fam](k, r).concat(own) });
  }
  // esplosioni (1.25.1): attacco istantaneo, schiocco di rumore a banda larga, corpo saturato e colpo grave più basso e più lungo; la grande con una coda di detriti
  ev("esplosione.piccola", { prio: 2, max: 3, gain: 0.32, group: 50, gap: 70, vary: 0.08,
    make: () => [L("noise", 9000, 2500, 0.05, 0.7, { flt: ["lowpass", 0, 0.5], a: 0.001 }), L("noise", 1500, 180, 0.34, 0.75, { flt: ["lowpass", 0, 0.8], a: 0.001, sat: 2 }),
      L("sine", 78, 30, 0.34, 0.7, { a: 0.001, sat: 1.5 })] });
  ev("esplosione.grande", { prio: 3, max: 2, gain: 0.55, group: 60, gap: 110, vary: 0.05,
    make: (w, r) => [L("noise", 11000, 3000, 0.08, 0.85, { flt: ["lowpass", 0, 0.5], a: 0.001 }), L("noise", 2200, 80, 1.0, 0.9, { flt: ["lowpass", 0, 0.9], a: 0.001, sat: 3 }),
      L("sine", 56, 20, 0.95, 0.95, { a: 0.001, sat: 2 }), L("noise", 380, 160, 1.4, 0.35, { flt: ["lowpass", 0, 0.7], a: 0.06 })]
      .concat(grains(r, 10, { t: [0.15, 1.0], fr: [700, 3000], d: [0.01, 0.04], g: [0.25, 0.6], fade: true })) });
  // bolle di Gamma: il timbro della vecchia esplosione piccola (1.25.0), che “scoppia come una bolla”
  ev("bolla.scoppia", { prio: 2, max: 3, gain: 0.32, group: 50, gap: 70, vary: 0.08,
    make: () => [L("noise", 1800, 280, 0.26, 0.8, { flt: ["lowpass", 0, 0.8] }), L("sine", 120, 45, 0.2, 0.55)] });
  // colpo alla cupola: peso 1 leggero (nemici normali), 2 medio (kamikaze), 3 pesante (boss): più grave, lungo e forte
  ev("cupola", { prio: 3, max: 1, gain: 0.42, group: 90, gap: 90,
    make: (w) => { const k = [1, 0.8, 0.62][w - 1] || 1, d = [1, 1.3, 1.7][w - 1] || 1;
      return [L("sine", 520 * k, 470 * k, 0.24 * d, 0.35), L("sine", 780 * k, 700 * k, 0.18 * d, 0.2), L("triangle", 210 * k, 110 * k, 0.16 * d, 0.6),
        L("noise", 900 * k, 300 * k, 0.1 * d, 0.4, { flt: ["lowpass", 0, 0.7] })]; },
    level: (w) => [0.6, 0.85, 1][w - 1] || 0.6 });
  ev("pacco.arrivo", { cat: "pacco", prio: 4, gain: 0.4, gap: 500,
    make: () => [L("sine", 880, 880, 0.16, 0.6), L("triangle", 1320, 1320, 0.3, 0.45, { at: 0.12 }), L("sine", 1760, 1760, 0.3, 0.2, { at: 0.12 })] });
  // pacco perso (1.36.0, Marco): il timer scade e il pacco se ne va; solo con i campioni (nel modo “sintetici” tace, come prima)
  ev("pacco.perso", { cat: "pacco", prio: 4, gain: 0.4, gap: 500, only: "campioni", make: () => [] });
  ev("pacco.premio", { cat: "pacco", prio: 4, gain: 0.42, gap: 500,
    make: () => [660, 880, 1100, 1320].map((f, i) => L("triangle", f, f, 0.26, 0.5, { at: i * 0.07 })).concat([L("sine", 2640, 2640, 0.4, 0.12, { at: 0.21 })]) });
  // ingressi (1.25.1): niente note né ritmo da notifica; rombo di rumore filtrato in crescendo (il filtro si apre) e un colpo profondo alla fine
  // mini-boss circa 2 s; boss circa 4,5 s, con un sottofondo grave che scivola e un fruscio che sale (entra lento dall’alto)
  const impact = (at, k) => [L("sine", 62 * k, 22 * k, 0.9 * k, 1, { at, a: 0.002, sat: 2 }), L("noise", 1100 * k, 70, 0.8 * k, 0.85, { at, flt: ["lowpass", 0, 0.9], a: 0.002, sat: 3 })];
  ev("miniboss.arrivo", { cat: "boss", max: 2, prio: 4, gain: 0.32, gap: 400,
    make: () => [L("noise", 160, 900, 1.75, 0.75, { flt: ["lowpass", 0, 1.2], a: 1.5 }), L("sine", 52, 38, 1.75, 0.45, { a: 1.3 })].concat(impact(1.5, 0.8)) });
  ev("boss.arrivo", { cat: "boss", max: 2, prio: 4, gain: 0.5, gap: 1500,
    make: () => [L("noise", 110, 750, 4.0, 0.8, { flt: ["lowpass", 0, 1.3], a: 3.5 }), L("noise", 300, 1600, 3.8, 0.22, { flt: ["bandpass", 0, 1.5], a: 3.3 }),
      L("sine", 44, 31, 4.4, 0.55, { a: 2.2, am: [5, 0.35] })].concat(impact(3.5, 1.2)) });
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
  // colpi dei droni dell’Hive (1.33.0, Marco): solo con i campioni (only); nel modo “sintetici” non suona, come prima
  ev("colpo.hive", { cat: "colpo.hive", max: 2, prio: 1, gain: 0.3, gap: 70, vary: 0.06, only: "campioni", make: () => [] });
  ev("gigante.scissione", { cat: "gigante", max: 2, prio: 3, gain: 0.6, gap: 200,
    make: () => [L("noise", 1300, 90, 1.0, 0.9, { flt: ["lowpass", 0, 1] }), L("sine", 62, 24, 0.9, 1), L("square", 240, 80, 0.15, 0.2)] });

  const MIX = {
    maxVoices: 14,        // voci contemporanee in tutto: oltre si toglie la più vecchia di priorità più bassa (o si rinuncia al suono nuovo)
    duck: 0.5,            // le priorità 3 e 4 abbassano spari (priorità 1-2) a questo volume…
    duckT: 0.3,           // …per questi secondi, così le minacce alla cupola si sentono sempre sopra gli spari
  };

  // ---- prova dei campioni (1.31.0, DESIGN.md § 18) · file, varianti e volumi [Claude, da rivedere: scelti dai dati dei file, non ascoltati] ----
  // FILES: volume medio (RMS in dB della parte attiva, misurato sulla decodifica di Chromium) di ogni file usato; il modulo lo porta a SAMPLE_RMS
  // (guadagno per file, al massimo +6 dB). I file sono gli originali Kenney (OGG Vorbis, 44,1 kHz): mono e tagli si fanno qui, alla decodifica e al suono.
  const FILES = { click_002: -14.9, click_003: -14.6, click_005: -11.2, impactMetal_004: -21.2,
    explosionCrunch_000: -13.8, explosionCrunch_001: -12.0, explosionCrunch_004: -14.6, lowFrequency_explosion_001: -15.5,
    impactMetal_000: -20.4, impactMetal_001: -19.8, impactMetal_002: -20.4, impactMetal_003: -19.9, forceField_001: -10.6,
    // torrette (1.32.0)
    laserLarge_000: -17.2, laserLarge_001: -16.6, laserLarge_002: -16.5, laserLarge_003: -17.0, laserLarge_004: -16.9,
    forceField_000: -10.6, forceField_002: -10.6, forceField_004: -10.6, laserSmall_000: -21.6, laserSmall_001: -21.9, laserSmall_002: -22.6, laserSmall_003: -22.1,
    lowFrequency_explosion_000: -18.0, laserRetro_000: -7.4, laserRetro_001: -7.4, laserRetro_003: -7.6,
    // ingressi e fiamme (1.34.0, Marco): loop da 5 s del pacchetto, usati interi (si legge solo una parte con off e d)
    spaceEngine_000: -9.7, spaceEngine_003: -12.1, thrusterFire_001: -17.4,
    // pacco regalo (1.36.0, Marco): Kenney Interface Sounds
    question_003: -9.9, maximize_007: -15.6, minimize_007: -13.4 };
  const SAMPLE_RMS = -18;
  // varianti di un evento: elenchi di strati { f: file, g: volume dopo la normalizzazione, d: taglio (s, con dissolvenza di 15 ms), at: ritardo (s), r: intonazione (velocità di lettura, 1.32.0),
  // off: punto del file da cui si parte (s, 1.34.0) };
  // gain: volume dell’evento con i campioni (al posto di def.gain); vars(peso) → varianti tra cui il modulo sceglie (generatore proprio)
  const S_ = (f, g, extra) => Object.assign({ f, g: g == null ? 1 : g, at: 0 }, extra || {});
  // volumi tarati (1.31.0, cupola 1.31.1) perché ogni evento suoni forte come il suo sintetico (massimo RMS su 100 ms, rendering offline in Chromium, catena compresa)
  // cupola come campo di forza (1.31.1, Marco: niente vetro): colpo metallico con sotto il ronzio del campo di forza (sale in 0,1-0,2 s e si spegne verso 0,6 s)
  // k: volume della variante (colpo e campo insieme, il campo a 0,35 del colpo); pesi 1-2 col campo tagliato a 0,55 s
  const FIELD = (k, d) => S_("forceField_001", 0.35 * k, d ? { d } : null);
  const shield = [["impactMetal_002", 0.41], ["impactMetal_000", 0.39], ["impactMetal_003", 0.31]].map(([f, k]) => [S_(f, k), FIELD(k, 0.55)]);
  const SPARO = {
    laser: ["laserLarge_000", "laserLarge_001", "laserLarge_002"].map((f) => [S_(f)]),
    // 1.33.0: niente più rallentamento a 0,8 (portava laserLarge_003 all’altezza di laserLarge_000: Laser e Beam sembravano uguali); il ronzio è nel suono continuo
    beam: ["laserLarge_003", "laserLarge_004"].map((f) => [S_(f)]),
    disr: ["forceField_000", "forceField_002"].map((f) => [S_(f, 1, { d: 0.8 })]),
    hive: [["laserSmall_000", "laserSmall_001", "laserSmall_003"], ["laserSmall_001", "laserSmall_002", "laserSmall_000"]].map((v) => v.map((f, i) => S_(f, 1, { at: i * 0.07 }))),
    // 1.33.0 (Marco: troppo basso e breve): il rombo intero (2 s) con sotto il ronzio grave del campo di forza tenuto 2 s (il percorso del buco nero dura circa 2 s)
    vortex: [[S_("lowFrequency_explosion_000"), S_("forceField_000", 1.4, { lp: [0.1, 0.3], r: 0.5, d: 2.0, fi: 0.15, fo: 0.7 })],
      [S_("lowFrequency_explosion_000"), S_("forceField_002", 1.4, { lp: [0.1, 0.3], r: 0.45, d: 2.0, fi: 0.15, fo: 0.7 })]],
    // fuoco (1.34.0, Marco: “il rumore delle fiamme da thrusterFire”): Sky Guard = fiammata di propulsore breve alla partenza dei missili (tre punti diversi
    // dello stesso file, accelerato a 1,3); Firewheel = fiammata più lunga e grave al lancio (il fruscio dei droni che girano è nel suono continuo)
    sky: [0.4, 1.9, 3.4].map((off) => [S_("thrusterFire_001", 1, { off, r: 1.3, d: 0.45, fi: 0.02, fo: 0.3 })]),
    wheel: [0.8, 2.6].map((off) => [S_("thrusterFire_001", 1, { off, r: 0.9, d: 0.7, fi: 0.05, fo: 0.4 })]),
    // colpi dei droni dell’Hive (1.33.0): un laserino corto e più acuto, tagliato a 0,12 s
    hivec: [["laserSmall_000", 1], ["laserSmall_001", 1.35], ["laserSmall_002", 1], ["laserSmall_003", 1]].map(([f, g]) => [S_(f, g, { r: 1.25, d: 0.12, fo: 0.04 })]),
    aero: [[S_("lowFrequency_explosion_001", 1, { d: 0.5 }), S_("impactMetal_000", 0.5, { d: 0.25 })],
      [S_("explosionCrunch_001", 1.36, { r: 1.3, d: 0.35 }), S_("lowFrequency_explosion_001", 0.82, { d: 0.5 })]],
    rail: ["laserRetro_000", "laserRetro_001", "laserRetro_003"].map((f) => [S_(f), S_("impactMetal_004", 0.5, { d: 0.15 })]),
  };
  const SAMPLED = {
    // clic brevissimo (7-9 ms) con il colpo metallico grave tagliato a 85 ms sotto
    guardiano: { gain: 0.09, vars: () => ["click_002", "click_003", "click_005"].map((f) => [S_(f, 0.8), S_("impactMetal_004", 0.55, { d: 0.085 })]) },
    // scoppio con il rombo basso sotto (il file basso è stereo: si somma in mono alla decodifica)
    // 1.31.1 (Marco): peso 1 (Sky Guard) explosionCrunch_000 e 001; peso 2 (kamikaze: Droni kamikaze dell’Hive e nemico kamikaze) explosionCrunch_004
    "esplosione.grande": { gain: 1.15, vars: (w) => (w >= 2 ? ["explosionCrunch_004"] : ["explosionCrunch_000", "explosionCrunch_001"]).map((f) => [S_(f), S_("lowFrequency_explosion_001", 0.7)]) },
    // pesi 1 e 2: tre colpi metallici sul campo di forza (il peso cambia solo il volume, def.level); peso 3: il colpo più grave con il campo intero
    cupola: { gain: 0.8, vars: (w) => w >= 3 ? [[S_("impactMetal_001", 0.42), FIELD(0.42)]] : shield },
    // volumi degli eventi tarati sul sintetico (1.32.0, come sopra; il Laser e il Beam sintetici sono i più piani)
    // torrette (1.32.0, Marco: Laser, Beam, Disruption Drone, Hive, Gravity Vortex Gun, Aeroblast, Railgun); timbro di famiglia per tipo di danno come nel sintetico
    // energy: Laser = scarica laserLarge; Beam = gli altri laserLarge più gravi (×0,8) con il ronzio del campo di forza che resta acceso
    "sparo.laser": { gain: 0.03, vars: () => SPARO.laser },
    "sparo.beam": { gain: 0.039, vars: () => SPARO.beam },
    // force: Disruption = campo di forza (più acuti di quello della cupola); Hive = tre laserini in fila (lo sciame che parte); Vortex = rombo profondo del buco nero
    "sparo.disr": { gain: 0.11, vars: () => SPARO.disr },
    "sparo.hive": { gain: 0.15, vars: () => SPARO.hive },
    "sparo.vortex": { gain: 0.135, vars: () => SPARO.vortex },
    // physical: Aeroblast = colpo sordo di mortaio; Railgun = scarica secca (laserRetro) con un colpo metallico sotto
    "sparo.aero": { gain: 0.103, vars: () => SPARO.aero },
    "sparo.rail": { gain: 0.26, vars: () => SPARO.rail },
    "colpo.hive": { gain: 0.115, vars: () => SPARO.hivec },
    "sparo.sky": { gain: 0.134, vars: () => SPARO.sky },
    "sparo.wheel": { gain: 0.137, vars: () => SPARO.wheel },
    // ingressi (1.34.0, Marco): boss = spaceEngine_000 (motore grave che pulsa), mini-boss = spaceEngine_003 (ronzio fermo); come nel sintetico il motore cresce
    // (entrata lenta) e alla fine arriva il colpo profondo (boss a 3,5 s: rombo lowFrequency_explosion_000 e colpo metallico grave; mini-boss a 1,5 s: lowFrequency_explosion_001)
    "boss.arrivo": { gain: 0.55, vars: () => [[S_("spaceEngine_000", 1, { d: 4.6, fi: 3.4, fo: 1.0 }), S_("lowFrequency_explosion_000", 1.2, { at: 3.5 }), S_("impactMetal_001", 0.5, { at: 3.5, r: 0.6 })]] },
    // pacco regalo (1.36.0, Marco): arrivo question_003, premio maximize_007, pacco perso minimize_007 (il suono “al contrario” del premio);
    // arrivo e premio forti come il sintetico, pacco perso 3 dB sotto il premio
    "pacco.arrivo": { gain: 0.185, vars: () => [[S_("question_003")]] },
    "pacco.premio": { gain: 0.43, vars: () => [[S_("maximize_007")]] },
    "pacco.perso": { gain: 0.18, vars: () => [[S_("minimize_007")]] },
    "miniboss.arrivo": { gain: 0.29, vars: () => [[S_("spaceEngine_003", 1, { d: 2.0, fi: 1.4, fo: 0.5 }), S_("lowFrequency_explosion_001", 1.2, { at: 1.5 })]] },
  };
  // ---- suoni continui (1.33.0, Marco): Laser, Beam e Disruption Drone suonano finché il raggio o il campo è acceso, più piano della partenza ----
  // il gioco chiama hold(torretta, acceso) a ogni fotogramma; strati come sopra, con lp: [da, a, piatto] = tratto del file (s) ripetuto senza fine
  // (giunzione incrociata di 40 ms; piatto: volume reso costante, per i laser che calano), am: [Hz, profondità] = pulsazione, fi: entrata (s)
  // Laser: il laser chiaro che ondeggia (tratto di laserLarge_000); Beam: più grave e pulsante (laserLarge_003 a 0,6 e ronzio del campo a 1,5, 7 Hz);
  // Disruption: ronzio di fondo grave e fermo del campo di forza (forceField_000 a 0,6)
  const HOLD = {
    laser: { gain: 0.0225, layers: [S_("laserLarge_000", 1, { lp: [0.05, 0.4, true], fi: 0.12 })] },
    beam: { gain: 0.0325, layers: [S_("laserLarge_003", 0.6, { lp: [0.05, 0.45, true], r: 0.6, fi: 0.1, am: [7, 0.6] }), S_("forceField_004", 1, { lp: [0.1, 0.3], r: 1.5, fi: 0.1, am: [7, 0.6] })] },
    disr: { gain: 0.1, layers: [S_("forceField_000", 1, { lp: [0.1, 0.3], r: 0.6, fi: 0.3, am: [0.8, 0.3] })] },
    // Firewheel (1.34.0): fruscio di fiamma finché i droni girano (thrusterFire_001 da 1 a 3 s), con un’onda di 3 Hz come la ruota che passa
    wheel: { gain: 0.068, layers: [S_("thrusterFire_001", 1, { lp: [1.0, 3.0], fi: 0.4, am: [3, 0.35] })] },
    // aree in fiamme della Sky Guard (1.35.0, Marco): fuoco a terra finché ce n’è almeno una (non per torretta: il gioco chiama hold("fiamme", …));
    // un altro tratto dello stesso file (3-4,8 s), più grave (×0,7) e con un tremolio irregolare di 5 Hz; le bruciature restano senza suono [deciso]
    fiamme: { gain: 0.055, layers: [S_("thrusterFire_001", 1, { lp: [3.0, 4.8], r: 0.7, fi: 0.3, am: [5, 0.4] })] },
  };
  const HOLD_FADE = 0.15;     // dissolvenza in uscita (s) quando il raggio o il campo si spegne
  const SAMPLE_CHAIN = {
    hp: 40,                // passaalto (Hz): toglie il rombo sotto l’udibile
    shelf: [7000, -3],     // attenua gli acuti (Hz, dB), più vicini ai sintetici, quasi tutti filtrati
    comp: { threshold: -16, knee: 8, ratio: 3, attack: 0.003, release: 0.15 },
    verb: [0.35, 0.07, 0.16],   // riverbero breve: durata (s), decadimento (s), volume del riverbero
  };
  const MODES = ["sintetici", "campioni"];

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
    // campioni: modo scelto, bus dei campioni (bassa e alta priorità, verso la catena comune), buffer decodificati (file → AudioBuffer, "attesa" o null se non riuscito)
    let mode = "sintetici", sLow = null, sHigh = null, loading = false;
    const buffers = {}, loops = {}, holds = {};      // loops: tratti ripetibili già costruiti; holds: suoni continui accesi (torretta → { out, srcs })
    const fetchFn = "fetch" in opts ? opts.fetch : (root.fetch ? root.fetch.bind(root) : null);
    const base = opts.base || (() => { try { const s = root.document && root.document.currentScript; return s && s.src ? new URL("suoni/", s.src).href : "suoni/"; } catch (e) { return "suoni/"; } })();
    const lastAt = {}, groups = {}, voices = [];        // voices: { name, cat, prio, end (ms), nodes }
    const stats = { played: {}, dropped: {}, grouped: {}, failed: {}, sampled: {}, held: {} };   // sampled: suoni fatti con i campioni; held: suoni continui accesi
    const curves = {};                                 // curve di saturazione per quantità (tanh normalizzata)
    const curve = (k) => curves[k] || (curves[k] = (() => { const n = 1024, c = new Float32Array(n), m = Math.tanh(k);
      for (let i = 0; i < n; i++) { const x = (i / (n - 1)) * 2 - 1; c[i] = Math.tanh(k * x) / m; } return c; })());
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
      if (ctx) chain();
      if (ctx && mode === "campioni") load();
    }
    // catena comune dei campioni: passaalto e mensola degli acuti, compressore, riverbero breve; poi il master (i sintetici non ci passano)
    function chain() {
      try {
        sLow = ctx.createGain(); sHigh = ctx.createGain();
        const C = SAMPLE_CHAIN, hp = ctx.createBiquadFilter(), sh = ctx.createBiquadFilter();
        hp.type = "highpass"; hp.frequency.value = C.hp; hp.Q.value = 0.7;
        sh.type = "highshelf"; sh.frequency.value = C.shelf[0]; sh.gain.value = C.shelf[1];
        sLow.connect(hp); sHigh.connect(hp); hp.connect(sh);
        let last = sh;
        if (ctx.createDynamicsCompressor) {
          const cp = ctx.createDynamicsCompressor();
          for (const k in C.comp) cp[k].value = C.comp[k];
          last.connect(cp); last = cp;
        }
        last.connect(master);
        if (ctx.createConvolver) {                     // risposta all’impulso generata: rumore che decade (generatore proprio)
          const sr = ctx.sampleRate || 44100, n = Math.floor(sr * C.verb[0]), ir = ctx.createBuffer(1, n, sr), ch = ir.getChannelData(0), r = prng(0x7e3b);
          for (let i = 0; i < n; i++) ch[i] = (r() * 2 - 1) * Math.exp(-i / (sr * C.verb[1]));
          const cv = ctx.createConvolver(), wet = ctx.createGain(); cv.buffer = ir; wet.gain.value = C.verb[2];
          last.connect(cv); cv.connect(wet); wet.connect(master);
        }
      } catch (e) { sLow = sHigh = null; }
    }
    // decodifica dei campioni: una volta sola, al primo sblocco con il modo “campioni” (o al passaggio a “campioni” dopo lo sblocco)
    function load() {
      if (loading || !ctx || !sLow) return;
      loading = true;
      for (const f in FILES) {
        buffers[f] = "attesa";
        const fail = () => { buffers[f] = null; count(stats.failed, "suoni/" + f + ".ogg"); };   // il suono ricade sul sintetico
        try {
          if (!fetchFn) { fail(); continue; }
          Promise.resolve(fetchFn(base + f + ".ogg"))
            .then((r) => { if (!r || !r.ok) throw new Error("file mancante"); return r.arrayBuffer(); })
            .then((ab) => new Promise((ok, ko) => { const p = ctx.decodeAudioData(ab, ok, ko); if (p && p.then) p.then(ok, ko); }))
            .then((b) => { buffers[f] = mono(b, Math.min(2, Math.pow(10, (SAMPLE_RMS - FILES[f]) / 20))); })
            .catch(fail);
        } catch (e) { fail(); }
      }
    }
    // somma dei canali in mono e guadagno del file in un buffer nuovo
    function mono(b, g) {
      const n = b.length, out = ctx.createBuffer(1, n, b.sampleRate), o = out.getChannelData(0), k = b.numberOfChannels || 1;
      for (let c = 0; c < k; c++) { const d = b.getChannelData(c); for (let i = 0; i < n; i++) o[i] += d[i] * g / k; }
      return out;
    }
    // variante da suonare: quella chiesta dal catalogo (numero) o una a caso tra le pronte (tutti i file decodificati); null = sintetico
    const loaded = (v) => v.every((l) => buffers[l.f] && buffers[l.f] !== "attesa");
    function choose(name, w, pick) {
      const sm = SAMPLED[name];
      if (!sm) return null;
      const all = sm.vars(w);
      if (typeof pick === "number") return all[pick] && loaded(all[pick]) ? all[pick] : null;
      const ok = all.filter(loaded);
      return ok.length ? ok[Math.floor(rand() * ok.length)] : null;
    }
    // tratto ripetibile di un file (1.33.0): dal secondo a al secondo b, volume reso costante se piatto (diviso per il volume medio su 30 ms),
    // fine e inizio sovrapposti in 40 ms (dissolvenza a potenza costante) perché la ripetizione non scatti; portato a SAMPLE_RMS; costruito una volta
    function loopBuf(f, a, b, flat) {
      const key = f + ":" + a + ":" + b + ":" + (flat ? 1 : 0);
      if (loops[key]) return loops[key];
      const src = buffers[f], sr = src.sampleRate, x = src.getChannelData(0), k = Math.min(1, src.duration / b);   // file più corto del tratto: tratto in proporzione
      const i0 = Math.floor(a * k * sr), n = Math.min(x.length, Math.floor(b * k * sr)) - i0;
      const seg = new Float32Array(n);
      for (let i = 0; i < n; i++) seg[i] = x[i0 + i];
      if (flat) {
        const w = Math.max(1, Math.floor(0.015 * sr)), sq = new Float64Array(n + 1);
        for (let i = 0; i < n; i++) sq[i + 1] = sq[i] + seg[i] * seg[i];
        const env = new Float32Array(n);
        for (let i = 0; i < n; i++) { const lo = Math.max(0, i - w), hi = Math.min(n, i + w); env[i] = Math.sqrt((sq[hi] - sq[lo]) / (hi - lo)); }
        const ref = Math.sqrt(sq[n] / n);
        for (let i = 0; i < n; i++) seg[i] *= Math.min(8, ref / Math.max(1e-5, env[i]));
      }
      const xf = Math.min(Math.floor(0.04 * sr), Math.floor(n / 3)), m = n - xf, out = ctx.createBuffer(1, m, sr), o = out.getChannelData(0);
      for (let i = 0; i < m; i++) o[i] = seg[i];
      for (let i = 0; i < xf; i++) { const k = (i / xf) * Math.PI / 2; o[i] = seg[i] * Math.sin(k) + seg[m + i] * Math.cos(k); }
      let ss = 0; for (let i = 0; i < m; i++) ss += o[i] * o[i];
      const g = Math.pow(10, SAMPLE_RMS / 20) / Math.max(1e-6, Math.sqrt(ss / m));
      for (let i = 0; i < m; i++) o[i] *= g;
      return (loops[key] = out);
    }
    // uno strato di campione → nodi verso out, dall’istante t; len: durata (s; Infinity = suono continuo, si ferma da fuori)
    // d taglia con una dissolvenza di fo s (15 ms se non detto), fi fa entrare in fi s, am pulsa il volume
    function sampleLayer(l, t, rate, out, srcs) {
      const lr = rate * (l.r || 1), b = l.lp ? loopBuf(l.f, l.lp[0], l.lp[1], l.lp[2]) : buffers[l.f], off = l.lp ? 0 : Math.min(l.off || 0, b.duration);
      const len = l.lp ? (l.d || Infinity) : Math.min((b.duration - off) / lr, l.d || 1e9), fi = l.fi || 0;
      const src = ctx.createBufferSource(), env = ctx.createGain();
      src.buffer = b; src.playbackRate.value = lr; if (l.lp) src.loop = true;
      if (fi) { env.gain.setValueAtTime(0, t); env.gain.linearRampToValueAtTime(l.g, t + fi); } else env.gain.setValueAtTime(l.g, t);
      if (l.d) { env.gain.setValueAtTime(l.g, t + Math.max(fi, len - (l.fo || 0.015))); env.gain.linearRampToValueAtTime(0, t + len); }   // taglio con dissolvenza
      src.connect(env);
      if (l.am) {                                    // pulsazione: un oscillatore lento fa oscillare il volume tra 1 − profondità e 1
        const amg = ctx.createGain(), dep = ctx.createGain(), lfo = ctx.createOscillator();
        amg.gain.value = 1 - l.am[1] / 2; dep.gain.value = l.am[1] / 2; lfo.type = "sine"; lfo.frequency.value = l.am[0];
        lfo.connect(dep); dep.connect(amg.gain); env.connect(amg); amg.connect(out);
        lfo.start(t); if (len < Infinity) lfo.stop(t + len + 0.01); srcs.push(lfo);
      } else env.connect(out);
      src.start(t, off); if (len < Infinity) src.stop(t + len + 0.01); srcs.push(src);
      return len;
    }
    // un campione (variante) → nodi Web Audio
    function sampleVoice(def, sm, v, bus, gainMul) {
      const t0 = ctx.currentTime + 0.005, rate = def.vary ? 1 + (rand() * 2 - 1) * def.vary : 1, srcs = [];
      let dur = 0;
      const out = ctx.createGain(); out.gain.value = sm.gain * gainMul; out.connect(bus);
      for (const l of v) dur = Math.max(dur, l.at + sampleLayer(l, t0 + l.at, rate, out, srcs) + 0.02);
      return { srcs, dur };
    }
    // suoni continui (1.33.0): accesi finché il gioco li tiene (hold), poi spenti con una dissolvenza
    function holdOn(name) {
      const def = HOLD[name], t0 = ctx.currentTime + 0.005, srcs = [];
      const out = ctx.createGain(); out.gain.value = def.gain; out.connect(sLow);
      for (const l of def.layers) sampleLayer(l, t0 + l.at, 1, out, srcs);
      holds[name] = { out, srcs }; count(stats.held, name);
    }
    function holdOff(name) {
      const h = holds[name];
      if (!h) return;
      delete holds[name];
      try {
        const t = ctx.currentTime;
        h.out.gain.cancelScheduledValues(t); h.out.gain.setValueAtTime(h.out.gain.value, t); h.out.gain.linearRampToValueAtTime(0, t + HOLD_FADE);
        for (const s of h.srcs) s.stop(t + HOLD_FADE + 0.02);
      } catch (e) {}
    }
    const holdAllOff = () => { for (const k in holds) holdOff(k); };
    function sync() {                                  // sospeso fuori dall’ondata e in secondo piano
      if (!ctx) return;
      try { if (active && ctx.state !== "running") ctx.resume(); else if (!active && ctx.state === "running") ctx.suspend(); } catch (e) {}
    }
    // strati → nodi Web Audio; restituisce le sorgenti (per fermarle) e la durata
    function voice(def, w, bus, gainMul) {
      const t0 = ctx.currentTime + 0.005, pitch = def.vary ? 1 + (rand() * 2 - 1) * def.vary : 1, srcs = [];
      let dur = 0;
      const out = ctx.createGain(); out.gain.value = def.gain * gainMul; out.connect(bus);
      for (const l of def.make(w, rand)) {
        const t = t0 + l.at, f0 = l.f[0] * pitch, f1 = l.f[1] * pitch;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, t); env.gain.linearRampToValueAtTime(l.g, t + l.a); env.gain.exponentialRampToValueAtTime(0.0001, t + l.d);
        let src, last, off = 0;
        if (l.o === "noise") {
          src = ctx.createBufferSource(); src.buffer = noise; src.loop = true; off = rand() * 0.9;   // punto di partenza diverso nel rumore: i grani non sono tutti uguali
          const node = ctx.createBiquadFilter(); node.type = (l.flt && l.flt[0]) || "lowpass"; node.Q.value = (l.flt && l.flt[2]) || 0.7;
          node.frequency.setValueAtTime(f0, t); node.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + l.d);
          src.connect(node); last = node;
        } else {
          src = ctx.createOscillator(); src.type = l.o;
          src.frequency.setValueAtTime(f0, t); src.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + l.d);
          last = src;
          if (l.flt) { const node = ctx.createBiquadFilter(); node.type = l.flt[0]; node.frequency.value = l.flt[1]; node.Q.value = l.flt[2]; last.connect(node); last = node; }
        }
        if (l.sat && ctx.createWaveShaper) { const sh = ctx.createWaveShaper(); sh.curve = curve(l.sat); last.connect(sh); last = sh; }   // saturazione
        last.connect(env);
        if (l.am) {                                    // modulazione d’ampiezza: un oscillatore lento fa oscillare il volume tra 1 − profondità e 1
          const amg = ctx.createGain(), dep = ctx.createGain(), lfo = ctx.createOscillator();
          amg.gain.value = 1 - l.am[1] / 2; dep.gain.value = l.am[1] / 2; lfo.type = "sine"; lfo.frequency.value = l.am[0];
          lfo.connect(dep); dep.connect(amg.gain); env.connect(amg); amg.connect(out);
          lfo.start(t); lfo.stop(t + l.d + 0.02); srcs.push(lfo);
        } else env.connect(out);
        src.start(t, off); src.stop(t + l.d + 0.02); srcs.push(src);
        dur = Math.max(dur, l.at + l.d + 0.02);
      }
      return { srcs, dur };
    }
    function duck() {
      if (!low) return;
      try { const t = ctx.currentTime; for (const g of sLow && mode === "campioni" ? [low, sLow] : [low]) { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(MIX.duck, t); g.gain.linearRampToValueAtTime(1, t + MIX.duckT); } } catch (e) {}
    }
    // suona subito (dopo soglia e raggruppamento): limite di voci per categoria e in tutto, con priorità
    // pick (solo dal catalogo): "sintetico" o il numero della variante dei campioni
    function start(name, def, w, pick) {
      const t = now();
      if (def.only && (pick === "sintetico" || (pick == null && mode !== def.only))) return false;   // evento solo con i campioni: nel modo “sintetici” tace
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
          // campioni: nel modo “campioni” (o se il catalogo ne chiede uno) e con almeno una variante pronta; altrimenti il sintetico di sempre
          const v = pick === "sintetico" ? null : (mode === "campioni" || pick != null) ? choose(name, w, pick) : null;
          if (v) { ({ srcs, dur } = sampleVoice(def, SAMPLED[name], v, def.prio >= 3 ? sHigh : sLow, lv)); count(stats.sampled, name); }
          else if (!def.only) ({ srcs, dur } = voice(def, w, def.prio >= 3 ? high : low, lv));
        } catch (e) { count(stats.failed, name); /* un suono non riuscito non ferma il gioco */ }
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
      setActive(on) { on = !!on; if (on === active) return; active = on; if (!on) holdAllOff(); sync(); },
      setVolume(v) {
        volume = Math.max(0, Math.min(1, +v || 0));
        if (master) try { master.gain.setValueAtTime(volume * volume, ctx.currentTime); } catch (e) {}
      },
      volume: () => volume,
      // prova dei campioni: "sintetici" (di partenza) o "campioni"; un valore non valido vale "sintetici". I file si decodificano alla prima richiesta.
      setMode(m) { mode = MODES.includes(m) ? m : "sintetici"; if (mode === "campioni") load(); else holdAllOff(); },
      mode: () => mode,
      SAMPLED_EVENTS: Object.keys(SAMPLED),
      // varianti dei campioni di un evento per il catalogo: [{ files, ok }] (ok: tutti i file decodificati)
      variants: (name, w) => SAMPLED[name] ? SAMPLED[name].vars(w || 1).map((v) => ({ files: v.map((l) => l.f), ok: loaded(v) })) : [],
      files: () => Object.keys(FILES),
      HOLD_TURRETS: Object.keys(HOLD),
      // suono continuo di una torretta (1.33.0): il gioco lo chiama a ogni fotogramma con acceso = raggio o campo attivo; solo con i campioni
      // (nel modo “sintetici” non fa nulla). Restituisce true se il suono è acceso.
      hold(name, on, force) {
        if (!HOLD[name]) return false;
        const ok = on && active && volume > 0 && (mode === "campioni" || force) && ctx && sLow && HOLD[name].layers.every((l) => buffers[l.f] && buffers[l.f] !== "attesa");
        if (!ok) { if (holds[name] && ctx) holdOff(name); return false; }
        if (holds[name]) return true;
        try { holdOn(name); } catch (e) { count(stats.failed, "hold." + name); return false; }
        return true;
      },
      holding: () => Object.keys(holds),
      loadSamples() { load(); },
      // catalogo: suona subito la versione chiesta ("sintetico" o il numero della variante), senza soglia né raggruppamento
      preview(name, w, pick) { const def = EVENTS[name]; if (!def || !active || volume <= 0) return false; return start(name, def, w || 1, pick); },
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
