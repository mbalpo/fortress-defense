"use strict";
/* =====================================================================
   PLANET DEFENSE · GRAFICA HD-2D (1.13.0)
   Pixel art con luci moderne: sprite generati dal codice (griglie di caratteri o funzioni), ingranditi a 2 px logici senza smussare,
   luci additive raccolte durante il disegno della battaglia e stese alla fine, cielo stellato fino all’orizzonte, ombre a terra.
   Si sceglie nel menu principale (“Grafica: HD-2D”); la scelta vale dal caricamento successivo della pagina.

   Come si collega: questo file contiene SOLO le differenze rispetto a app/draw.js. FORTRESS_DRAW_HD non si chiama da sola:
   app/draw.js, alla fine di FORTRESS_DRAW, la valuta nel proprio ambito (eval) se la grafica scelta è HD-2D; così qui si possono
   sostituire le sue funzioni (assegnandole: disc = function disc…) e aggiungere voci a TURRET_ART e FX (Object.assign), e tutto il resto
   di draw.js (schermate, testi, carte, guida) resta uno solo per le due grafiche. I punti di aggancio di draw.js pensati per questo:
   drawSky, drawWorld, drawMenuBack, enemyBody, enemyBar, bossBar, frenzyBar, menuTitle, cardBadge. Solo disegno, nessuna regola di gioco.
   Catalogo: npm run catalog-hd2d → docs/catalogo-grafico-alternativo.html. Schermate di prova: node tests/tools/hd2d-shots.js.
   ===================================================================== */
function FORTRESS_DRAW_HD() {

/* ---------- costanti e tabelle ---------- */
const PX = 2;
const HD = { lights: null, bg: null };
const OUTLINE = "#0a0716";
const METAL = { a: "#1b2036", b: "#2e3a58", c: "#475a80", d: "#7488ad", e: "#b4c4e0" };
const SPR = new Map();
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];            // retino ordinato 4×4 per sfumare tra due toni
const dith = (i, j, v, n) => Math.min(n - 1, Math.floor(v * n + (BAYER[(j & 3) * 4 + (i & 3)] + 0.5) / 16 - 0.5 + 0.5));
const hash2 = (i, j) => { const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return s - Math.floor(s); };
const HORIZON = 562;
const TURRET_GRID = {
  sky: [                         // lanciamissili: due tubi inclinati con le testate pronte, base con le prese d’aria accese
    "................",
    "...kk......kk...",
    "..k54k....k54k..",
    "..k43k....k43k..",
    "..kedk....kedk..",
    "..kdck....kdck..",
    ".kkcckk..kkcckk.",
    ".kdcbbk..kdcbbk.",
    ".kdcbbk..kdcbbk.",
    ".kdcbbkkkkdcbbk.",
    ".kkkkkcddckkkkk.",
    "..kdddccccbbbk..",
    ".kddcccccccbbbk.",
    ".kcbyk3kk3kybbk.",
    ".kbbbbbbbbbbaak.",
    "kkkkkkkkkkkkkkkk"],
  laser: [                       // emettitore: lente grande sopra un collo sottile, treppiede
    "......kkkk......",
    ".....k5w54k.....",
    "....k45w543k....",
    "....k345432k....",
    ".....k3432k.....",
    "......kddk......",
    ".....kkdckk.....",
    ".....kdccbk.....",
    "......kdbk......",
    "......kdbk......",
    ".....kkdbkk.....",
    "....kdcccbbk....",
    "...kdk.kk.kbk...",
    "..kdk..kk..kbk..",
    ".kdk..kddk..kbk.",
    "kkk...kkkk...kkk"],
  vortex: [                      // cannone ad anello: nel vuoto gira il nucleo
    "....kkkkkkkk....",
    "..kk34444443kk..",
    ".k34kkkkkkkk43k.",
    ".k3kvvvvvvvvk3k.",
    "k32kvvvvvvvvk23k",
    "k32kvvvvvvvvk23k",
    "k32kvvvvvvvvk23k",
    "k32kvvvvvvvvk23k",
    ".k2kvvvvvvvvk2k.",
    ".k22kkkkkkkk22k.",
    "..kk22222222kk..",
    "....kkkddkkk....",
    ".....kdccbk.....",
    "...kkdcccbbkk...",
    "..kdccccccbbbk..",
    "kkkkkkkkkkkkkkkk"],
  disr: [                        // piattaforma con l’antenna; i due droni a rombo si disegnano a parte e ondeggiano
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    ".......kk.......",
    "......k54k......",
    "......k32k......",
    ".......kdk......",
    "......kdcbk.....",
    "..kkkkkdcbkkkk..",
    ".kddccccccccbbk.",
    "kd3ccc3cc3ccc3ak",
    "kkkkkkkkkkkkkkkk"],
  aero: [                       // cannone: qui solo la base girevole; la canna (aeroBarrel) ruota verso il bersaglio
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "....kkkkkkkk....",
    "...kdddcccbbk...",
    "..kdeddccccbbk..",
    "..k3333333332k..",
    ".kddcyccccycbbk.",
    ".kbbbbbbbbbbbak.",
    "kkkkkkkkkkkkkkkk"],
  thunder: [                     // traliccio con le croci; la sfera in cima si disegna a parte e crepita
    "................",
    "................",
    "................",
    "................",
    "................",
    ".......kk.......",
    "......kdbk......",
    "......kdbk......",
    ".....kdkkbk.....",
    ".....kdbdbk.....",
    ".....kkdbkk.....",
    "....kdkbdkbk....",
    "....kdbkkdbk....",
    "...kdkdbbdkbk...",
    "..kdccbkkbbbak..",
    "kkkkkkkkkkkkkkkk"],
  beam: [                        // parabola con l’ago al centro
    "................",
    "................",
    "......kkk.......",
    "......k5k.......",
    "kk....k4k....kk.",
    "kek...kdk...kbk.",
    ".kek..kdk..kbk..",
    ".kddkkkdkkkcbk..",
    "..kddcccccccbk..",
    "...kkdcccbkkk...",
    ".....kkdbkk.....",
    "......kdbk......",
    "......kdbk......",
    "....kkdcbbkk....",
    "...kdccccbbak...",
    "kkkkkkkkkkkkkkkk"],
  wheel: [                       // fionda: forcella a Y con l’elastico; la palla di fuoco si disegna a parte
    "................",
    "................",
    "................",
    ".kk..........kk.",
    "kdck........kcbk",
    "kdck........kcbk",
    ".kdck......kcbk.",
    ".kdcnn....nncbk.",
    "..kdcknnnnkcbk..",
    "...kdcckkccbk...",
    "....kdccccbk....",
    ".....kdccbk.....",
    "......kdbk......",
    "....kkkdbkkk....",
    "...kdcccccbbk...",
    "kkkkkkkkkkkkkkkk"],
  hive: [                        // alveare a fasce, porta scura in basso; le api girano attorno
    "................",
    "................",
    "................",
    "................",
    "......kkkk......",
    ".....k3443k.....",
    "....kkkkkkkk....",
    "....kdccccbk....",
    "...kkkkkkkkkk...",
    "...k23344332k...",
    "..kkkkkkkkkkkk..",
    "..kdcccvvccbbk..",
    ".kkkkkvvvvkkkkk.",
    ".k2334vvvv4332k.",
    ".k223333333322k.",
    "kkkkkkkkkkkkkkkk"],
  rail: [                        // due rotaie alte con le bobine; tra le rotaie corre la carica
    "...kkk....kkk...",
    "...kek....kek...",
    "...kek....kek...",
    "...kdk....kdk...",
    "..kk3kk..kk3kk..",
    "..k343k..k343k..",
    "..kk3kk..kk3kk..",
    "...kdk....kdk...",
    "...kdk....kdk...",
    "..kk3kk..kk3kk..",
    "..k343k..k343k..",
    "..kkkkkkkkkkkk..",
    ".kdcc3cccc3cbbk.",
    ".kdccccccccccbk.",
    "kdccccccccccbbak",
    "kkkkkkkkkkkkkkkk"],
  tesla: [                       // bobina ad anelli con la sfera in cima
    "................",
    ".......kk.......",
    "......kwyk......",
    "......kyok......",
    ".......kk.......",
    ".....kkkkkk.....",
    "....k345543k....",
    ".....kkdbkk.....",
    "....kkkkkkkk....",
    "...k34555432k...",
    "....kkkdbkkk....",
    "..kkkkkkkkkkkk..",
    "..k3455555432k..",
    "...kkkkdbkkkk...",
    "...kdcccccbbak..",
    "kkkkkkkkkkkkkkkk"],
};
const DISR_DRONE = ["...k...", "..k5k..", ".k453k.", "k45332k", ".k322k.", "..k2k..", "...k..."];
// guardiano visto di spalle: cannone alzato a destra, mano sinistra che lo afferra, zaino con la luce
// generata a strati (dal fondo: braccio sinistro, busto, gambe, testa, collo, braccio destro, cannone, mano): l’avambraccio sinistro passa
// dietro la testa e ricompare con la mano sull’attacco del cannone; le due braccia hanno lo stesso spessore; il collo stacca la testa dalle spalle
const GUARD_GRID = [
  "............gg..",
  "...........kGGk.",
  "...........kMmk.",
  "...........kMmk.",
  "...........kMmk.",
  "........kk.kMmk.",
  ".......kHSkmmmmk",
  "......kSSSkmVmmk",
  ".....kSkkkkmmmmk",
  "....kSkTTTkkkkk.",
  "...kHkTHHTTkHSk.",
  "..kHSkVHTTVkHSk.",
  ".kHSkkVTTTVkHSk.",
  ".kHSk.kTTTkkHSk.",
  ".kHSk.kssskkHSk.",
  "..kHSkkssskkHSk.",
  "..kHkHSSSSSkHSk.",
  "...kkHSbbbbSkk..",
  "....kHSbLLbSsk..",
  "....kHSbbbbSsk..",
  "....kHSbbbbSsk..",
  "....kHSSSSSSsk..",
  "....kHSSSSSSsk..",
  "....kttttttttk..",
  ".....kHSkkSsk...",
  ".....kHSkkSsk...",
  ".....kHSkkSsk...",
  ".....kHSkkSsk...",
  "....kbbbkkbbbk..",
  ".....kkk..kkk..."];
// HD-2D: icone a pixel 7×7 su un tondo scuro col contorno; distruzione: una riga ondulata per pila (fino a 5)
const STATUS_GRID = {
  slow: [".......", "w.....w", ".w...w.", "..w.w..", "w..w..w", ".w...w.", "..w.w.."],
  para: ["....ww.", "...ww..", "..ww...", ".wwwww.", "...ww..", "..ww...", ".ww...."],
  weak: ["..www..", ".w...w.", "w.....w", "w.www.w", "w.....w", ".w...w.", "..www.."],
  vuln: ["...w...", "..www..", ".w.w.w.", "wwwwwww", ".w.w.w.", "..www..", "...w..."],
  burn: ["...w...", "..ww...", "..ww.w.", ".wwwww.", ".wwYww.", ".wYYYw.", "..www.."],
};
// HD-2D: simboli dei tipi per il segno delle combo (1.25.1), 7×7 come STATUS_GRID: c colore del tipo, d più scuro, h più chiaro, y cuore della fiamma
const TYPE_GRID = {
  physical: [".hhhc..", "hhhccc.", "hhcccdd", "hcccddd", ".ccdddd", ".cdddd.", "...dd.."],     // roccia sfaccettata e spigolosa: luce in alto a sinistra, ombra in basso a destra
  fire:     ["...c...", "..cc...", "..cc.c.", ".ccycc.", ".cyyyc.", ".cyyyc.", "..ccc.."],     // fiamma col cuore chiaro
  electric: ["....cc.", "...cc..", "..cc...", ".ccccc.", "...cc..", "..cc...", ".cc...."],     // fulmine
  energy:   ["...c...", "..ccd..", ".cccdd.", ".cccdd.", ".cccdd.", "..ccd..", "...c..."],     // cristallo: due facce, la destra più scura
  force:    [".cccc..", "c....c.", "c.cc..c", "c.c.c.c", "c.c..c.", "c..cc..", ".c....."],     // spirale: un tratto, circa 1,6 giri dal centro verso fuori
};
// HD-2D: rocce che ruotano (16 pose, luce fissa), navicella con le luci a turno; la meteora ha la coda di fiamme a pixel
const HD_SHAPE_ID = new WeakMap();

/* ---------- funzioni nuove: motore (sprite, luci, fondo), sprite di torrette, guardiano e nemici, effetti a pixel ---------- */
function mkCanvas(w, h) { const c = document.createElement("canvas"); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }
function hexRgb(h) { const n = parseInt(h.slice(1), 16); return h.length === 4 ? [((n >> 8) & 15) * 17, ((n >> 4) & 15) * 17, (n & 15) * 17] : [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function mix(a, b, t) { const A = hexRgb(a), B = hexRgb(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join(""); }
function rgba(h, a) { const c = hexRgb(h); return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")"; }
// rampa di 6 toni dal colore base: ombre fredde (blu-viola), luci calde (crema), come nelle scene HD-2D
function ramp(c) { return [mix(c, "#0c0820", 0.78), mix(c, "#171338", 0.52), mix(c, "#262052", 0.24), c, mix(c, "#fff1d0", 0.38), mix(c, "#fffbea", 0.72)]; }
// griglia → canvas; pal: carattere → colore ("." trasparente); le righe corte si allungano con "."
function gridSprite(key, rows, pal) {
  let c = SPR.get(key); if (c) return c;
  const w = Math.max(...rows.map((r) => r.length)), h = rows.length; c = mkCanvas(w, h); const g = c.getContext("2d");
  rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const col = pal[r[i]]; if (col) { g.fillStyle = col; g.fillRect(i, j, 1, 1); } } });
  SPR.set(key, c); return c;
}
// funzione → canvas, con il contorno scuro aggiunto da solo attorno ai pixel pieni
function procSprite(key, w, h, fn, outline) {
  let c = SPR.get(key); if (c) return c;
  const px = []; for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px.push(fn(i, j));
  c = mkCanvas(w + 2, h + 2); const g = c.getContext("2d");
  const at = (i, j) => (i < 0 || j < 0 || i >= w || j >= h ? null : px[j * w + i]);
  if (outline !== false) { g.fillStyle = OUTLINE;
    for (let j = -1; j <= h; j++) for (let i = -1; i <= w; i++) if (!at(i, j) && (at(i - 1, j) || at(i + 1, j) || at(i, j - 1) || at(i, j + 1))) g.fillRect(i + 1, j + 1, 1, 1); }
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const col = at(i, j); if (col) { g.fillStyle = col; g.fillRect(i + 1, j + 1, 1, 1); } }
  SPR.set(key, c); return c;
}
// sprite con il punto (ox, oy) del canvas piccolo in (x, y); i pixel si allineano alla griglia di PX
function blit(c, x, y, ox, oy, flip) {
  ctx.imageSmoothingEnabled = false;
  const X = Math.round(x / PX) * PX, Y = Math.round(y / PX) * PX;
  if (flip) { ctx.save(); ctx.translate(X, Y); ctx.scale(-1, 1); ctx.drawImage(c, -ox * PX, -oy * PX, c.width * PX, c.height * PX); ctx.restore(); }
  else ctx.drawImage(c, X - ox * PX, Y - oy * PX, c.width * PX, c.height * PX);
  ctx.imageSmoothingEnabled = true;
}
// luce: alone additivo (nucleo, corona, coda morbida)
function light(x, y, r, color, a) {
  const L = { x, y, r, color, a: a == null ? 1 : a };
  if (HD.lights) HD.lights.push(L); else drawLights([L]);
}
function drawLights(list) {
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  for (const L of list) {
    if (L.a <= 0.01 || L.r <= 0) continue;
    const g = ctx.createRadialGradient(L.x, L.y, 0, L.x, L.y, L.r);
    g.addColorStop(0, rgba(L.color, 0.5 * L.a)); g.addColorStop(0.25, rgba(L.color, 0.24 * L.a)); g.addColorStop(0.6, rgba(L.color, 0.07 * L.a)); g.addColorStop(1, rgba(L.color, 0));
    ctx.fillStyle = g; ctx.fillRect(L.x - L.r, L.y - L.r, L.r * 2, L.r * 2);
  }
  ctx.restore();
}
// ombra a terra di chi poggia sulla piattaforma (torrette, guardiano)
function groundShadow(x, y, rx, a) {
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = "#05030f";
  ctx.beginPath(); ctx.ellipse(x, y, rx, rx * 0.36, 0, 0, 6.2832); ctx.fill(); ctx.restore();
}
function hdBackground() {
  if (HD.bg) return HD.bg;
  const w = W / PX, h = H / PX, c = mkCanvas(w, h), g = c.getContext("2d"), hz = Math.round(HORIZON / PX);
  const put = (i, j, col) => { g.fillStyle = col; g.fillRect(i, j, 1, 1); };
  // cielo: dal blu notte in alto al viola caldo dell’orizzonte, a retino (niente sfumature continue: è pixel art)
  const sky = ["#05041a", "#080724", "#0c0a2e", "#110e38", "#181242", "#21174c", "#2c1d55", "#3a235c", "#4c2c62", "#5e3566"];
  for (let j = 0; j < hz; j++) for (let i = 0; i < w; i++) put(i, j, sky[Math.max(0, dith(i, j, Math.pow(j / hz, 1.6), sky.length))]);
  // via lattea: fascia diagonale di nebulosa a retino, con grumi più chiari
  for (let j = 0; j < hz - 20; j++) for (let i = 0; i < w; i++) {
    const d = Math.abs((j - 40) - (i - 20) * 1.15) / 26, n = Math.sin(i * 0.21 + j * 0.13) * 0.3 + Math.sin(i * 0.07 - j * 0.11 + 2) * 0.3 + hash2(i, j) * 0.5;
    const v = 1 - d + n * 0.5;
    if (v > 0.95 && (i + j) % 2 === 0) put(i, j, "#4a3a86"); else if (v > 0.7 && (i + j) % 2 === 0) put(i, j, "#2e2468"); else if (v > 0.45 && (i * 3 + j) % 4 === 0) put(i, j, "#231c58");
  }
  // stelle: tante piccole, qualcuna a croce
  for (let k = 0; k < 230; k++) {
    const i = Math.floor(hash2(k, 1) * w), j = Math.floor(Math.pow(hash2(k, 2), 1.25) * (hz - 14)), r = hash2(k, 3);
    put(i, j, r > 0.8 ? "#e6ecff" : r > 0.45 ? "#9a9ad0" : "#5c5a98");
    if (r > 0.96) for (const [a, b] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) put(i + a, j + b, "#7f86c8");
  }
  // pianeta ad anelli (alto a destra, sotto l’HUD) e una luna piccola a sinistra
  const planet = (pcx, pcy, pr, cols, ring) => {
    for (let j = -pr; j <= pr; j++) for (let i = -pr; i <= pr; i++) {
      const d = Math.hypot(i, j); if (d > pr) continue;
      const l = (-i * 0.6 - j * 0.5) / pr + 0.35 * Math.sqrt(1 - (d / pr) ** 2), k = l > 0.55 ? 0 : l > 0.25 ? 1 : l > 0 ? 2 : 3;
      put(pcx + i, pcy + j, cols[k]); if (ring && Math.abs(j + i * 0.1 - 2) < 0.6 && l > 0) put(pcx + i, pcy + j, cols[2]);
    }
    if (ring) for (let i = -pr - 7; i <= pr + 7; i++) { const j = Math.round(i * -0.28); if (Math.hypot(i, j) > pr - 1 || j > 0) { put(pcx + i, pcy + j, "#d9c3a0"); if (Math.abs(i) < pr + 5) put(pcx + i, pcy + j + 1, "#8f7a6a"); } }
  };
  planet(138, 72, 11, ["#e9b98a", "#c98a62", "#8d5a4e", "#4a2c3e"], true);
  planet(26, 150, 4, ["#d6dcf0", "#a3a9c8", "#6d6f98", "#3a3a66"], false);
  // creste lontane all’orizzonte, due piani velati dalla foschia (più chiaro = più lontano)
  for (let i = 0; i < w; i++) {
    const m1 = Math.round(hz - 6 - 8 * Math.abs(Math.sin(i * 0.035 + 0.4)) - 4 * hash2(Math.floor(i / 3), 9));
    const m2 = Math.round(hz - 2 - 4 * Math.abs(Math.sin(i * 0.09 + 2)) - hash2(Math.floor(i / 2), 4) * 2);
    for (let j = m1; j < hz; j++) put(i, j, j === m1 ? "#7a5a8c" : "#5d4479");
    for (let j = m2; j < hz; j++) put(i, j, j === m2 ? "#5a4a84" : "#3e3468");
  }
  // bagliore dell’orizzonte e piana vicina (sotto la cupola, fino alla piattaforma)
  for (let i = 0; i < w; i++) if ((i + hz) % 2 === 0) put(i, hz - 1, "#8c5f80");
  const land = ["#3a3166", "#2e2858", "#25214a", "#1d1a3e"];
  for (let j = hz; j < h; j++) for (let i = 0; i < w; i++) put(i, j, land[Math.max(0, dith(i, j, (j - hz) / Math.max(1, (GROUND_Y / PX) - hz), land.length))]);
  for (let j = hz; j < h; j++) for (let i = 0; i < w; i++) if (hash2(i, j) > 0.97) put(i, j, "#4a4280");
  HD.bg = c; return c;
}
// atmosfera: velo freddo in alto, calore in basso, angoli più scuri
function grade() {
  let g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "rgba(40,30,110,0.22)"); g.addColorStop(0.45, "rgba(20,16,60,0)"); g.addColorStop(0.85, "rgba(255,150,80,0.05)"); g.addColorStop(1, "rgba(255,170,90,0.10)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  g = ctx.createRadialGradient(W / 2, H * 0.55, H * 0.3, W / 2, H * 0.55, H * 0.75);
  g.addColorStop(0, "rgba(5,3,15,0)"); g.addColorStop(1, "rgba(5,3,15,0.55)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
// pulviscolo: granelli che salgono piano e qualche grosso cerchio sfocato in primo piano (bokeh)
function motes() {
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  for (let k = 0; k < 26; k++) {
    const x = (hash2(k, 5) * W + clock * (4 + 6 * hash2(k, 6))) % W, y = H - ((hash2(k, 7) * H + clock * (6 + 8 * hash2(k, 8))) % H);
    ctx.fillStyle = rgba(k % 3 ? "#ffd9a0" : "#9fe0ff", 0.25 + 0.25 * Math.sin(clock * 2 + k));
    ctx.fillRect(Math.round(x / PX) * PX, Math.round(y / PX) * PX, PX, PX);
  }
  for (let k = 0; k < 5; k++) {
    const x = (hash2(k, 11) * W + clock * 3) % (W + 80) - 40, y = 470 + hash2(k, 12) * 150, r = 14 + 16 * hash2(k, 13);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, "rgba(255,200,140,0.05)"); g.addColorStop(0.8, "rgba(255,200,140,0.035)"); g.addColorStop(1, "rgba(255,200,140,0)");
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ctx.restore();
}
// roccia girata di rot, luce fissa in alto a sinistra: si vede ruotare il volume, non l’immagine
function rockSprite(e, look, col, frame, nFrames) {
  const R = Math.max(4, Math.round(e.def.r * (look === "asteroid" ? 1.0 : 0.95) / PX)), rot = frame / nFrames * 6.2832, S = e.shape, n = S.length;
  if (!e.__hdId) e.__hdId = (HD.ids = (HD.ids || 0) + 1);
  const key = "rock:" + look + ":" + col + ":" + e.__hdId + ":" + frame, P = ramp(col), size = R * 2 + 1;
  const craters = look === "asteroid" ? [[0.6, 0.45, 0.32], [2.4, 0.35, 0.25], [4.1, 0.6, 0.22], [5.3, 0.15, 0.2]] : look === "rock" ? [[1.2, 0.4, 0.3], [3.8, 0.5, 0.24]] : [[2, 0.4, 0.26]];
  return procSprite(key, size, size, (i, j) => {
    const dx = i - R, dy = j - R, d = Math.hypot(dx, dy), a = Math.atan2(dy, dx) - rot;
    const u = ((a / 6.2832) % 1 + 1) % 1 * n, i0 = Math.floor(u) % n, f = u - Math.floor(u);
    const rr = (S[i0] * (1 - f) + S[(i0 + 1) % n] * f) * R * (1 + 0.09 * Math.sin(a * 5 + e.__hdId) + 0.06 * Math.sin(a * 11 + e.__hdId * 2));   // bitorzoli
    if (d > rr + 0.3) return null;
    const nz = Math.sqrt(Math.max(0, 1 - (d / (R + 0.5)) ** 2)), lam = (-dx * 0.55 - dy * 0.62) / (R + 0.5) + nz * 0.58;
    let k = lam > 0.78 ? 5 : lam > 0.52 ? 4 : lam > 0.22 ? 3 : lam > -0.08 ? 2 : 1;
    for (const [ca, cd, cr] of craters) {                    // crateri che girano con la roccia
      const cx = Math.cos(ca + rot) * cd * R, cy = Math.sin(ca + rot) * cd * R, q = Math.hypot(dx - cx, dy - cy) / (cr * R);
      if (q < 0.75) k = Math.max(1, k - 2); else if (q < 1.05 && (dx - cx) + (dy - cy) > 0) k = Math.min(5, k + 1);
    }
    if (look === "meteor" && hash2(i + frame * 3, j) > 0.86 && lam < 0.45) return "#fff0a8";    // crepe incandescenti
    if (d > rr - 1.2 && dx * 0.6 + dy * 0.7 > R * 0.35) return P[4];                            // controluce sul bordo in basso a destra
    if (hash2(i * 7 + e.__hdId, j * 3) > 0.9 && k > 1) k -= 1;                                   // grana
    return P[k];
  });
}
function saucerSprite(col, blink) {
  const P = ramp(col), w = 13, h = 8;
  return procSprite("saucer:" + col + ":" + blink, w, h, (i, j) => {
    const x = i - 6, y = j - 4.5;
    if (j <= 3) { const d = Math.hypot(x / 3.6, (j - 3.6) / 3.4); if (d <= 1) return d < 0.45 && x < 0 ? "#f4fbff" : x + (j - 3) < -1 ? "#bfe6ff" : x > 1.5 ? "#4c7aa8" : "#86b8e0"; return null; }   // cupola di vetro
    const d = Math.hypot(x / 6.6, (y - 0.3) / 2.6); if (d > 1) return null;
    if (j === 5 && (i === 2 || i === 6 || i === 10)) return (i / 4 + blink) % 2 < 1 ? "#fff6b0" : P[1];            // luci che si accendono a turno
    const lam = -y * 0.5 - x * 0.12;
    return lam > 0.6 ? P[5] : lam > 0.1 ? P[4] : lam > -0.45 ? P[3] : lam > -0.9 ? P[2] : P[1];
  });
}
// lettere: k contorno · a-e metallo dal più scuro · 1-5 colore del tipo (rampa, 3 = base) · w bianco caldo · y luce gialla · v vuoto · o arancione · n elastico
function turretPal(c) { const P = ramp(c); return Object.assign({ k: OUTLINE, w: "#fffbea", y: "#ffd27a", v: "#0a0418", o: "#ff9a4a", n: "#c9b28a" }, METAL, { 1: P[1], 2: P[2], 3: P[3], 4: P[4], 5: P[5] }); }
function turretSprite(id, c) { return gridSprite("t:" + id + ":" + c, TURRET_GRID[id], turretPal(c)); }
function hdTurret(id, x, g, c, s) {
  groundShadow(x + 3, g - 1, 15, 0.45);
  blit(turretSprite(id, c), x, g, 8, 16);
  const a = ctx.globalAlpha;
  if (id === "sky") { light(x - 5, g - 27, 12, "#ffb070", 0.7 * a); light(x + 5, g - 27, 12, "#ffb070", 0.7 * a); light(x, g - 5, 16, "#ffd27a", 0.45 * a); }
  else if (id === "laser") { const f = 0.85 + 0.15 * Math.sin(clock * 5); light(x, g - 26, 34, c, 0.9 * f * a); light(x, g - 27, 9, "#ffffff", 0.6 * a); }
  else if (id === "vortex") {                    // nucleo che gira: pixel che spiraleggiano verso il centro
    for (let k = 0; k < 10; k++) {
      const t = (clock * 0.9 + k / 10) % 1, ang = clock * 4 + k * 2.4 + t * 5, rr = 7 * (1 - t);
      ctx.fillStyle = k % 3 ? c : "#ffe0ff"; ctx.globalAlpha = a * (0.3 + 0.7 * t);
      ctx.fillRect(Math.round((x + Math.cos(ang) * rr) / PX) * PX - 1, Math.round((g - 19 + Math.sin(ang) * rr * 0.9) / PX) * PX - 1, PX, PX);
    }
    ctx.globalAlpha = a; light(x, g - 19, 26, c, 0.7 * a);
  } else hdTurretExtra(id, x, g, c, a, s);
}
// HD-2D: quadratino allineato alla griglia dei pixel
function pxDot(x, y, col, a) { if (a != null) ctx.globalAlpha = a; ctx.fillStyle = col; ctx.fillRect(Math.round(x / PX) * PX, Math.round(y / PX) * PX, PX, PX); }
// sfera di energia a pixel (raggio R in pixel dello sprite) che crepita: bordo che cambia 15 volte al secondo, qualche scintilla fuori
function pixelOrb(x, y, R, col, t) {
  const t0 = Math.floor(t * 15), a = ctx.globalAlpha, bx = Math.round(x / PX) * PX, by = Math.round(y / PX) * PX;
  for (let j = -R - 1; j <= R + 1; j++) for (let i = -R - 1; i <= R + 1; i++) {
    const d = Math.hypot(i, j); if (d > R + 0.4) continue;
    if (d > R - 0.6 && hash2(i + t0, j - t0) > 0.6) continue;
    ctx.fillStyle = d < R * 0.4 ? "#ffffff" : d < R * 0.75 ? "#fff6b0" : col; ctx.fillRect(bx + i * PX, by + j * PX, PX, PX);
  }
  for (let k = 0; k < 3; k++) { const an = hash2(k, t0) * 6.2832, d = (R + 1.5 + hash2(k + 5, t0)) * PX; pxDot(x + Math.cos(an) * d, y + Math.sin(an) * d, "#fff6b0", a * 0.8); }
  ctx.globalAlpha = a;
}
// canna dell’Aeroblast in N direzioni, ridisegnata a pixel per ognuna (non ruotata come immagine): culatta, canna, freno di bocca nel colore del tipo;
// la luce resta fissa in alto a sinistra mentre la canna gira
function aeroBarrel(c, fr, N) {
  const a = fr / N * 6.2832, ca = Math.cos(a), sa = Math.sin(a), P = ramp(c), M = [METAL.a, METAL.b, METAL.c, METAL.d, METAL.e];
  return procSprite("aeroBarrel:" + c + ":" + fr + ":" + N, 35, 35, (i, j) => {
    const dx = i - 17, dy = j - 17, u = dx * ca + dy * sa, v = -dx * sa + dy * ca;
    const hw = u < -3.5 || u > 14.2 ? 0 : u < 1.5 ? 3.4 : u < 11 ? 2.4 : 3.1;
    if (Math.abs(v) > hw) return null;
    if (u > 13.3 && Math.abs(v) < 1.3) return "#0a0418";                         // bocca
    const nx = -sa * v / hw, ny = ca * v / hw, lam = -(nx * 0.6 + ny * 0.8) * 0.75 + 0.15 + (u < 1.2 ? -0.15 : 0);
    const k = lam > 0.55 ? 4 : lam > 0.2 ? 3 : lam > -0.15 ? 2 : lam > -0.5 ? 1 : 0;
    if (u > 11 && u < 12.4) return P[Math.min(5, k + 1)];                          // fascia del freno di bocca
    if (u > 5 && u < 5.8) return M[Math.max(0, k - 1)];                            // anello a metà canna
    return M[k];
  });
}
// parti animate delle torrette della fase 2 (droni, sfere, fiamme, api, cariche) e le loro luci
function hdTurretExtra(id, x, g, c, a, s) {
  if (id === "disr") {
    for (const s of [-1, 1]) {
      const dy = Math.sin(clock * 2.6 + s) * 1.6;
      blit(gridSprite("disrDrone:" + c, DISR_DRONE, turretPal(c)), x + s * 8, g - 21 + dy, 3.5, 3.5);
      light(x + s * 8, g - 21 + dy, 14, c, 0.6 * a);
    }
    light(x, g - 15, 10, c, 0.5 * a);
  } else if (id === "aero") {                  // canna che ruota verso il bersaglio e rincula quando spara
    let ang = -Math.PI / 2 + 0.6 * Math.sin(clock * 0.9), rec = 0;   // nelle tessere del catalogo (senza torretta) la canna oscilla
    if (s) {
      const dt = s.__t == null ? 0 : clamp(clock - s.__t, 0, 0.1); s.__t = clock;
      const t = pickTargets({ x: s.x, y: s.y - 8 }, rangeOf(s), 1)[0];   // lo stesso nemico che il prossimo colpo prende di mira
      const want = t ? clamp(Math.atan2(t.y - (g - 12), t.x - x), -Math.PI + 0.35, -0.35) : s.__aim == null ? -Math.PI / 2 : s.__aim;
      s.__aim = s.__aim == null ? want : s.__aim + (want - s.__aim) * Math.min(1, dt * 8);
      if (s.__cd != null && s.cd > s.__cd + 0.2) s.__rec = 1;            // il tempo di ricarica è risalito: ha appena sparato
      s.__cd = s.cd; s.__rec = Math.max(0, (s.__rec || 0) - dt * 5);
      ang = s.__aim; rec = s.__rec;
    }
    const N = 48, fr = ((Math.round(ang / 6.2832 * N) % N) + N) % N, back = rec * 3;
    blit(aeroBarrel(c, fr, N), x - Math.cos(ang) * back, g - 12 - Math.sin(ang) * back, 17, 17);
    blit(procSprite("aeroCap", 5, 5, (i, j) => { const d = Math.hypot(i - 2, j - 2); return d > 2.4 ? null : i + j < 3 ? METAL.e : i + j < 5 ? METAL.d : METAL.b; }), x, g - 12, 3.5, 3.5);
    if (rec > 0.3) { const mx = x + Math.cos(ang) * 30, my = g - 12 + Math.sin(ang) * 30; pixelOrb(mx, my, 2, "#fff6b0", clock); light(mx, my, 26, "#ffd27a", rec); }
    light(x - 9, g - 5, 8, "#ffd27a", 0.6 * a); light(x + 9, g - 5, 8, "#ffd27a", 0.6 * a);
  }
  else if (id === "thunder") { pixelOrb(x, g - 25, 3, c, clock); light(x, g - 25, 30 + 4 * Math.sin(clock * 23), c, 0.85 * a); }
  else if (id === "beam") { const f = 0.7 + 0.3 * Math.sin(clock * 6); pxDot(x - 1, g - 27, "#ffffff", a); ctx.globalAlpha = a; light(x - 1, g - 26, 22 * f, c, 0.9 * a); }
  else if (id === "wheel") {
    pixelOrb(x, g - 15, 2, "#ff8a3d", clock);
    pixelFlame(x, g - 17, 8 + 3 * Math.sin(clock * 9), 3, a, 7);
    light(x, g - 17, 26, "#ff8a3d", 0.8 * a);
  } else if (id === "hive") {
    for (let k = 0; k < 3; k++) {                // api che girano attorno all’alveare
      const an = clock * (2 + k * 0.4) + k * 2.1, bx = x + Math.cos(an) * (12 + k * 2), by = g - 16 + Math.sin(an) * 6;
      pxDot(bx, by, k % 2 ? c : "#ffe0ff", a);
    }
    ctx.globalAlpha = a; light(x, g - 8, 14, c, 0.5 * a);
  } else if (id === "rail") {                    // carica che sale tra le rotaie
    const t0 = Math.floor(clock * 18);
    for (let k = 0; k < 6; k++) { const yy = g - 8 - ((clock * 40 + k * 4) % 22); if (hash2(k, t0) > 0.25) pxDot(x + (hash2(k + 9, t0) > 0.5 ? 0 : -PX), yy, k % 2 ? "#ffffff" : c, a); }
    ctx.globalAlpha = a; light(x, g - 20, 20, "#bfe6ff", 0.55 * a);
  } else if (id === "tesla") {
    const t0 = Math.floor(clock * 12);
    for (let k = 0; k < 2; k++) { const an = hash2(k, t0) * 6.2832; pxDot(x + Math.cos(an) * 7, g - 27 + Math.sin(an) * 5, "#fff6b0", a); }
    ctx.globalAlpha = a; light(x, g - 27, 20, "#ffe14d", 0.8 * a); light(x, g - 14, 14, c, 0.35 * a);
  }
}
function shardSprite(col) {
  const P = ramp(col);
  return procSprite("shard:" + col, 9, 13, (i, j) => {
    const dx = i - 4, dy = j - 5;
    if (Math.abs(dx) / 4.1 + (dy < 0 ? -dy / 5.2 : dy / 7.2) > 1) return null;
    if (dx === 0 && dy < 3) return "#ffffff";                      // spigolo centrale illuminato
    if (dy === 0) return P[4];
    return dy < 0 ? (dx < 0 ? P[5] : P[3]) : (dx < 0 ? P[3] : P[1]);
  });
}
// nave: scafo a punta verso il basso (scende), bordo dorato, cabina luminosa, motori in alto con le fiamme; la nave madre ha le ali
function shipSprite(col, mother, r) {
  const P = ramp(col), R = r / PX, wf = mother ? 1.2 : 1.05;
  const hull = [[0, 1], [wf, -0.15], [0.55, -0.85], [-0.55, -0.85], [-wf, -0.15]];
  const wings = mother ? [[[0.9, -0.35], [1.55, -0.75], [1.2, 0.1]], [[-0.9, -0.35], [-1.55, -0.75], [-1.2, 0.1]]] : [];
  const inPoly = (pts, x, y) => { let c = false; for (let a = 0, b = pts.length - 1; a < pts.length; b = a++) { const [xa, ya] = pts[a], [xb, yb] = pts[b]; if ((ya > y) !== (yb > y) && x < (xb - xa) * (y - ya) / (yb - ya) + xa) c = !c; } return c; };
  const ext = mother ? 1.6 : 1.1, w = Math.ceil(R * ext) * 2 + 1, top = Math.ceil(R * 0.9), h = top + Math.ceil(R) + 1, cx = (w - 1) / 2;
  const part = (i, j) => { const x = (i - cx) / R, y = (j - top) / R; return inPoly(hull, x, y) ? 1 : wings.some((p) => inPoly(p, x, y)) ? 2 : 0; };
  return procSprite("ship:" + col + ":" + (mother ? 1 : 0), w, h, (i, j) => {
    const p = part(i, j); if (!p) return null;
    const x = (i - cx) / R, y = (j - top) / R;
    if (!part(i - 1, j) || !part(i + 1, j) || !part(i, j - 1) || !part(i, j + 1) || (p === 2 && part(i, j + 1) === 1)) return x < 0.05 ? "#ffd166" : "#b8862a";   // bordo dorato
    if (Math.hypot(x, y - 0.1) < 0.14) return "#fff6b0";            // cabina
    if (Math.hypot(x, y - 0.1) < 0.3) return Math.hypot(x, y - 0.1) < 0.22 ? "#5a3a6a" : "#1a1030";
    for (const d of [-0.3, 0.3]) if (Math.hypot(x - d, y + 0.82) < 0.13) return "#ffd18a";   // motori
    for (const d of [-0.55, 0.55]) if (Math.hypot(x - d, y + 0.25) < 0.1) return "#1a1030";  // oblò
    if (Math.abs(y + 0.45) < 0.035 || (p === 2 && Math.abs(Math.abs(x) - 1.2) < 0.04)) return P[1];   // giunture
    if (Math.abs(x) < 0.04) return P[4];                                                           // costola centrale
    const lam = -x * 0.55 - y * 0.35 + (hash2(i, j) - 0.5) * 0.15;
    return lam > 0.35 ? P[4] : lam > 0 ? P[3] : lam > -0.35 ? P[2] : P[1];
  });
}
function hdEnemy2(e, c, look) {
  const x = e.x, y = e.y, r = e.def.r, a = ctx.globalAlpha;
  if (look === "shard") {
    const t0 = Math.floor(clock * 14);           // coda di scintille sopra (scende)
    for (let k = 0; k < 9; k++) { const q = k / 9; if (hash2(k, t0) < q * 0.8) continue;
      pxDot(x + (hash2(k + 3, t0) - 0.5) * r * (0.5 + q), y - r * 1.1 - k * PX * 1.5, q < 0.3 ? "#ffffff" : "#7ff6ff", a * (1 - q * 0.8)); }
    ctx.globalAlpha = a;
    blit(shardSprite(c), x, y, 5, 6);
    light(x, y - 2, r * 2.6, c, 0.6 * a); light(x, y - 4, r * 0.8, "#ffffff", 0.3 * a);
    return;
  }
  const mother = look === "mothership", sp = shipSprite(c, mother, r), cx = (sp.width - 1) / 2, top = Math.ceil(r / PX * 0.9) + 1;
  for (const d of [-0.3, 0.3]) pixelFlame(x + d * r, y - r * 0.85, (mother ? 14 : 10) + 4 * Math.sin(clock * 11 + d * 7), mother ? 4.5 : 3.5, a, d > 0 ? 3 : 9);
  blit(sp, x, y, cx + 0.5, top + 0.5);
  light(x, y + r * 0.1, r * 1.3, "#fff6b0", 0.5 * a); light(x, y, r * 2.6, c, 0.4 * a);
  for (const d of [-0.3, 0.3]) light(x + d * r, y - r * 0.9, r * 0.9, "#ffb070", 0.6 * a);
}
function guardPal(f) {
  return f ? { k: OUTLINE, s: "#4a2620", S: "#7a3f2c", H: "#b0643c", t: "#ffb36a", T: "#8a4a32", V: "#ffd166", m: "#3a2a2a", M: "#8c6a5a", G: "#fff6d0", g: "#ffb347", b: "#24141a", L: "#ffd166" }
           : { k: OUTLINE, s: "#1d2a52", S: "#2f4785", H: "#4f6fb8", t: "#d5dce8", T: "#3d5a9a", V: "#7fe8ff", m: "#252c44", M: "#6f7fa6", G: "#ffffff", g: "#7fe8ff", b: "#141a30", L: "#7fe8ff" };
}
function hdEnemy(e, c, look) {
  const x = e.x, y = e.y, r = e.def.r, a = ctx.globalAlpha;
  if (look === "saucer") {
    const blink = Math.floor(clock * 3) % 2, s = saucerSprite(c, blink);
    blit(s, x, y + Math.sin(clock * 3 + x) * 1.5, 7.5, 6);
    light(x, y + 6, r * 2.4, c, 0.55 * a); light(x, y + 2, r * 0.9, "#fff6b0", 0.35 * a);
    return;
  }
  if (!HD_SHAPE_ID.has(e.shape)) HD_SHAPE_ID.set(e.shape, (HD.ids = (HD.ids || 0) + 1));
  const id = HD_SHAPE_ID.get(e.shape), N = 16, fr = Math.floor((((e.rot % 6.2832) + 6.2832) % 6.2832) / 6.2832 * N) % N;
  const sp = rockSprite({ def: e.def, shape: e.shape, __hdId: id }, look, c, fr, N), o = (sp.width - 1) / 2;
  if (look === "meteor") {                        // coda di fiamme sopra (la meteora scende): quadratini dal giallo al rosso che tremolano
    const n = Math.round(r * 2.4 / PX), t0 = Math.floor(clock * 14);
    for (let k = 0; k < n; k++) {
      const q = k / n, wd = Math.max(1, Math.round((r * 0.85 / PX) * (1 - q * 0.8))), yy = y - r * 0.5 - k * PX;
      for (let i = -wd; i <= wd; i++) {
        const h = hash2(i + t0, k + t0 * 0.37); if (h > 1 - q * 0.9 + 0.15 || Math.abs(i) > wd * (0.6 + 0.4 * h)) continue;
        const z = q + Math.abs(i) / (wd + 1) * 0.5 + h * 0.2;
        ctx.fillStyle = z < 0.35 ? "#fff3b0" : z < 0.6 ? "#ffc155" : z < 0.85 ? "#ff7a3d" : "#b8384a";
        ctx.globalAlpha = a * (1 - q * 0.7);
        ctx.fillRect(Math.round(x / PX) * PX + i * PX, Math.round(yy / PX) * PX, PX, PX);
      }
    }
    ctx.globalAlpha = a; light(x, y - r * 0.3, r * 3.2, "#ff8a3d", 0.8 * a);
  }
  blit(sp, x, y, o + 0.5, o + 0.5);
  if (look !== "meteor") light(x - r * 0.4, y - r * 0.5, r * 1.2, "#fff1d0", 0.12 * a);   // riflesso della luce ambiente sul lato illuminato
}
// HD-2D: barra a pixel (contorno scuro, fondo, riempimento con la riga chiara in alto, tacche ogni 10%)
function pxBar(x, y, w, h, k, col, notch) {
  x = Math.round(x / PX) * PX; y = Math.round(y / PX) * PX; w = Math.round(w / PX) * PX; h = Math.max(PX * 2, Math.round(h / PX) * PX);
  const fw = Math.round(w * clamp(k, 0, 1) / PX) * PX;
  ctx.fillStyle = OUTLINE; ctx.fillRect(x - PX, y - PX, w + PX * 2, h + PX * 2);
  ctx.fillStyle = "#231c46"; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = mix(col, "#171338", 0.3); ctx.fillRect(x, y, fw, h);
  ctx.fillStyle = col; ctx.fillRect(x, y, fw, h - PX);
  ctx.fillStyle = mix(col, "#fffbea", 0.45); ctx.fillRect(x, y, fw, PX);
  if (notch) { ctx.fillStyle = "rgba(10,7,22,0.45)"; for (let i = 1; i < 10; i++) ctx.fillRect(x + Math.round(w * i / 10 / PX) * PX, y, PX / 2, h); }
}
// HD-2D: fascio di luce, alone largo additivo, nucleo bianco, scintille a pixel lungo il raggio, luce all’impatto
function hdBeam(x1, y1, x2, y2, color, w, a) {
  ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.lineCap = "round"; ctx.strokeStyle = color;
  for (const [lw, al] of [[w * 5, 0.07], [w * 2.6, 0.16], [w * 1.3, 0.5]]) { ctx.globalAlpha = al * a; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
  ctx.restore();
  ctx.globalAlpha = a; ctx.strokeStyle = "#f4ffff"; ctx.lineWidth = Math.max(1, w * 0.45); ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  const len = Math.hypot(x2 - x1, y2 - y1), n = Math.floor(len / 14), t0 = Math.floor(clock * 20);
  for (let i = 0; i < n; i++) {
    if (hash2(i, t0) < 0.55) continue;
    const q = (i + hash2(i, t0 + 1)) / Math.max(1, n), off = (hash2(i, t0 + 2) - 0.5) * w * 3;
    const px = x1 + (x2 - x1) * q - (y2 - y1) / (len || 1) * off, py = y1 + (y2 - y1) * q + (x2 - x1) / (len || 1) * off;
    ctx.fillStyle = hash2(i, t0 + 3) > 0.5 ? "#ffffff" : color; ctx.fillRect(Math.round(px / PX) * PX, Math.round(py / PX) * PX, PX, PX);
  }
  ctx.globalAlpha = 1;
  light(x2, y2, w * 7, color, 0.7 * a); light(x1, y1, w * 5, color, 0.5 * a);
}
// HD-2D: lingua di fuoco a pixel (base in x, y; alta h; larga 2w), forma che cambia 12 volte al secondo
function pixelFlame(x, y, h, w, a, seed) {
  const n = Math.max(2, Math.round(h / PX)), t0 = Math.floor(clock * 12), bx = Math.round(x / PX) * PX, by = Math.round(y / PX) * PX;
  for (let k = 0; k < n; k++) {
    const q = k / n, wd = Math.max(0, Math.round(w / PX * (1 - q) ** 0.8)), sway = Math.round(Math.sin(clock * 7 + seed + q * 3) * q * 1.5);
    for (let i = -wd; i <= wd; i++) {
      const h2 = hash2(i + seed * 13 + t0, k + t0); if (q > 0.55 && h2 > 0.75) continue;
      const z = q * 0.8 + Math.abs(i) / (wd + 1) * 0.45;
      ctx.fillStyle = z < 0.28 ? "#fff6d0" : z < 0.5 ? "#ffd166" : z < 0.75 ? "#ff8a3d" : "#d8443a";
      ctx.globalAlpha = a * (q > 0.8 ? 0.6 : 1);
      ctx.fillRect(bx + (i + sway) * PX, by - k * PX, PX, PX);
    }
  }
  ctx.globalAlpha = 1;
}
// fulmine globulare: alone tremolante, nucleo chiaro e piccoli archi che si staccano dalla superficie (niente Math.random: solo funzione del tempo)
// HD-2D: linea e cerchio fatti di quadratini sulla griglia dei pixel
function pxLine(x1, y1, x2, y2, col, a) {
  const n = Math.max(1, Math.round(Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) / PX));
  if (a != null) ctx.globalAlpha = a; ctx.fillStyle = col;
  for (let i = 0; i <= n; i++) ctx.fillRect(Math.round((x1 + (x2 - x1) * i / n) / PX) * PX, Math.round((y1 + (y2 - y1) * i / n) / PX) * PX, PX, PX);
}
function pxEllipse(x, y, rx, ry, col, a, a0, a1, gap) {
  const n = Math.max(8, Math.round((a1 == null ? 6.2832 : a1 - a0) * Math.max(rx, ry) / PX)), s0 = a0 || 0, span = a1 == null ? 6.2832 : a1 - a0;
  if (a != null) ctx.globalAlpha = a; ctx.fillStyle = col;
  for (let i = 0; i < n; i++) { if (gap && i % gap === 0) continue; const t = s0 + span * i / n; ctx.fillRect(Math.round((x + Math.cos(t) * rx) / PX) * PX, Math.round((y + Math.sin(t) * ry) / PX) * PX, PX, PX); }
}
// alone additivo lungo una spezzata (fulmini, raggi del Beam)
function glowPath(pts, color, w, a) {
  ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = color;
  for (const [lw, al] of [[w * 4, 0.08], [w * 2, 0.2]]) { ctx.globalAlpha = al * a; ctx.lineWidth = lw; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.stroke(); }
  ctx.restore();
}

/* ---------- funzioni di draw.js sostituite ---------- */
// HD-2D: dischi a pixel (cerchio pieno disegnato una volta per raggio e colore), sotto i 2 px un quadratino
disc = function disc(x, y, r, color, a) {
  ctx.globalAlpha = a == null ? 1 : a;
  if (r < PX) { ctx.fillStyle = color; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
  else { const n = Math.max(1, Math.round(r / PX)); blit(procSprite("disc:" + n + ":" + color, n * 2 + 1, n * 2 + 1, (i, j) => (Math.hypot(i - n, j - n) <= n + 0.35 ? color : null), false), x, y, n + 1.5, n + 1.5); }
  ctx.globalAlpha = 1;
};
// HD-2D: rettangoli con gli angoli a gradini (due scalini) invece che arrotondati; sotto i 3 px di raggio, angoli vivi
rr = function rr(x, y, w, h, r) {
  ctx.beginPath();
  if (r < 3 || w < 12 || h < 12) { ctx.rect(x, y, w, h); return; }
  const c = r >= 6 ? 3 : 2;
  ctx.moveTo(x + 2 * c, y); ctx.lineTo(x + w - 2 * c, y); ctx.lineTo(x + w - 2 * c, y + c); ctx.lineTo(x + w - c, y + c); ctx.lineTo(x + w - c, y + 2 * c); ctx.lineTo(x + w, y + 2 * c);
  ctx.lineTo(x + w, y + h - 2 * c); ctx.lineTo(x + w - c, y + h - 2 * c); ctx.lineTo(x + w - c, y + h - c); ctx.lineTo(x + w - 2 * c, y + h - c); ctx.lineTo(x + w - 2 * c, y + h);
  ctx.lineTo(x + 2 * c, y + h); ctx.lineTo(x + 2 * c, y + h - c); ctx.lineTo(x + c, y + h - c); ctx.lineTo(x + c, y + h - 2 * c); ctx.lineTo(x, y + h - 2 * c);
  ctx.lineTo(x, y + 2 * c); ctx.lineTo(x + c, y + 2 * c); ctx.lineTo(x + c, y + c); ctx.lineTo(x + 2 * c, y + c); ctx.closePath();
};
// HD-2D: stesso carattere del gioco (leggibile a 360 px), con un’ombra scura di 1 px; i titoli (da 20 px) hanno anche il contorno
txt = function txt(s, x, y, size, color, align, weight) {
  ctx.font = (weight || "600") + " " + size + "px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  ctx.textAlign = align || "left"; ctx.textBaseline = "middle";
  const a = ctx.globalAlpha;
  if (size >= 20) { ctx.lineJoin = "round"; ctx.lineWidth = 4; ctx.strokeStyle = OUTLINE; ctx.strokeText(s, x, y + 1); }
  if (size >= 24 && color && color[0] === "#") {   // titoli grandi: alone del loro colore
    const w = ctx.measureText(s).width, cx = ctx.textAlign === "center" ? x : ctx.textAlign === "right" ? x - w / 2 : x + w / 2;
    light(cx, y, w * 0.7, color, 0.3 * a);
  }
  ctx.globalAlpha = a * 0.75; ctx.fillStyle = OUTLINE; ctx.fillText(s, x, y + 1); ctx.globalAlpha = a;
  ctx.fillStyle = color || "#e8eefc"; ctx.fillText(s, x, y);
};
button = function button(x, y, w, h, label, onTap, opts) {
  opts = opts || {};
  buttons.push({ x, y, w, h, onTap, release: !!opts.release });   // release: si attiva al rilascio sullo stesso pulsante (carte)
  // HD-2D: pannello a gradini con il contorno scuro, smusso chiaro in alto e ombra in basso, bordo colorato di 2 px
  rr(x - 1, y - 1, w + 2, h + 2, 8); ctx.fillStyle = OUTLINE; ctx.fill();
  rr(x, y, w, h, 8); ctx.fillStyle = opts.fill || "rgba(24,20,56,0.95)"; ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.07)"; ctx.fillRect(x + 6, y + 3, w - 12, PX);
  ctx.fillStyle = "rgba(0,0,0,0.28)"; ctx.fillRect(x + 6, y + h - 5, w - 12, PX);
  rr(x + 1, y + 1, w - 2, h - 2, 8); ctx.lineWidth = 2; ctx.strokeStyle = opts.stroke || "#3a3a78"; ctx.stroke();
  if (label) txt(label, x + w / 2, y + h / 2 + 1, opts.size || 13, opts.color || "#e8eefc", "center");
};
dim = function dim(a) { ctx.fillStyle = "rgba(10,7,28," + a + ")"; ctx.fillRect(0, 0, W, H); }   // HD-2D: velo viola notte;
drawGround = function drawGround() {                          // HD-2D: piattaforma di lastre metalliche con rivetti e lampade
  if (!HD.ground) {
    const w = W / PX, h = GROUND_H / PX, c = mkCanvas(w, h), g = c.getContext("2d");
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const pi = i % 20, pj = j % 8;
      let col = j === 0 ? "#6c7fb0" : j === 1 ? "#3d4b78" : pj === 7 || pi === 19 ? "#121733" : pi === 0 || pj === 0 ? "#3a4673" : hash2(i, j) > 0.92 ? "#2c365c" : "#262f52";
      if ((pi === 2 || pi === 17) && pj === 2) col = "#7d8cb8";
      g.fillStyle = col; g.fillRect(i, j, 1, 1);
    }
    HD.ground = c;
  }
  blit(HD.ground, 0, GROUND_Y, 0, 0);
  for (let i = 0; i < 4; i++) {
    if (slots[i]) continue;
    ctx.fillStyle = "rgba(10,7,22,0.5)"; ctx.fillRect(SLOT_X[i] - 10, GROUND_Y - 4, 20, 4);
    ctx.setLineDash([2, 2]); ctx.lineWidth = 1; ctx.strokeStyle = "#5a6aa0"; ctx.strokeRect(SLOT_X[i] - 10, GROUND_Y - 8, 20, 8); ctx.setLineDash([]);
  }
  for (const x of [8, W - 8]) light(x, GROUND_Y + 4, 26, "#ffb070", 0.5);
};
drawDomeFill = function drawDomeFill() {
  const frac = clamp(domeHp / domeMax, 0, 1);
  const g = ctx.createRadialGradient(DOME.cx, DOME.cy, 20, DOME.cx, DOME.cy, DOME.ry);
  g.addColorStop(0, "rgba(63,224,255,0.02)");
  g.addColorStop(1, "rgba(63,224,255," + (0.05 + 0.13 * frac + domeFlash * 0.5) + ")");
  ctx.beginPath(); ctx.ellipse(DOME.cx, DOME.cy, DOME.rx, DOME.ry, 0, Math.PI, Math.PI * 2); ctx.closePath();
  ctx.fillStyle = g; ctx.fill();
  // HD-2D: celle esagonali appena accennate che si accendono a turno, come una rete di energia
  const t0 = Math.floor(clock * 3), col = frac > 0.35 ? "#7fe8ff" : "#ff8080";
  for (let k = 0; k < 40; k++) {
    const an = Math.PI + hash2(k, 51) * Math.PI, d = 0.35 + 0.6 * hash2(k, 52), on = hash2(k, t0) > 0.82;
    if (!on) continue;
    const hx = DOME.cx + Math.cos(an) * DOME.rx * d, hy = DOME.cy + Math.sin(an) * DOME.ry * d;
    pxEllipse(hx, hy, 4, 3.5, col, 0.07 + 0.08 * frac, 0, null);
  }
  ctx.globalAlpha = 1;
};
drawDomeEdge = function drawDomeEdge() {                         // HD-2D: bordo a pixel doppio, un lampo che lo percorre, luci lungo il bordo
  const frac = clamp(domeHp / domeMax, 0, 1), col = frac > 0.35 ? "#7fe8ff" : "#ff6e6e";
  pxEllipse(DOME.cx, DOME.cy, DOME.rx, DOME.ry, col, Math.min(1, 0.45 + 0.4 * frac + domeFlash), Math.PI, Math.PI * 2);
  pxEllipse(DOME.cx, DOME.cy, DOME.rx - 2, DOME.ry - 2, col, Math.min(1, 0.15 + 0.15 * frac + domeFlash), Math.PI, Math.PI * 2, 2);
  const sweep = Math.PI + ((clock * 0.18) % 1) * Math.PI;
  pxEllipse(DOME.cx, DOME.cy, DOME.rx, DOME.ry, "#ffffff", 0.9, sweep, sweep + 0.12);
  ctx.globalAlpha = 1;
  light(DOME.cx + Math.cos(sweep) * DOME.rx, DOME.cy + Math.sin(sweep) * DOME.ry, 22, col, 0.6);
  for (let i = 1; i < 6; i++) { const t = Math.PI + i * Math.PI / 6; light(DOME.cx + Math.cos(t) * DOME.rx, DOME.cy + Math.sin(t) * DOME.ry, 16 + domeFlash * 40, col, 0.25 + domeFlash); }
  if (AB.gasT > 0) FX.domeGas(AB.gasH, AB.gasT);
  // abilità attive: bordo colorato (riflettente argento, ustionante arancione, potenziante oro, rigenerazione verde)
  const tint = AB.reflectT > 0 ? "#e8eefc" : AB.burnT > 0 ? "#ff8a3d" : AB.powerT > 0 ? "#ffd166" : AB.regenT > 0 ? "#3fe0a0" : null;
  if (tint) FX.domeAura(tint);
};
// guardiano: soldato futuristico visto di spalle (guarda i nemici), elmetto integrale e tuta spaziale; braccio destro alzato e teso
// che finisce in un cannone cibernetico (la bocca è GUN, da lì partono i colpi), il sinistro piegato che lo afferra. mirror: clone specchiato
guardianShape = function guardianShape(x, mirror) {               // HD-2D: sprite GUARD_GRID (tavolozza blu, arancione in frenesia)
  const f = frenzyOn(player), a = ctx.globalAlpha, d = mirror ? -1 : 1;
  if (!mirror) groundShadow(x + 3, GROUND_Y - 1, 13, 0.45 * a);
  blit(gridSprite("guard:" + (f ? 1 : 0), GUARD_GRID, guardPal(f)), x, GROUND_Y, 9.5, 30, mirror);
  const glowC = f ? "#ffb347" : "#7fe8ff";
  light(x + d * GUN.dx, GROUND_Y + GUN.dy + 1, 16 + 3 * Math.sin(clock * 9), glowC, 0.8 * a);
  light(x, GROUND_Y - 20, 10, glowC, 0.5 * a);
};
statusIcon = function statusIcon(kind, x, y, c, e) {
  blit(procSprite("statusBadge:" + (kind === "destr" ? 1 : 0), kind === "destr" ? 11 : 9, kind === "destr" ? 11 : 9, (i, j) => {
    const R = kind === "destr" ? 5 : 4; return Math.hypot(i - R, j - R) <= R + 0.3 ? "#0b0820" : null; }), x, y, kind === "destr" ? 6 : 5, kind === "destr" ? 6 : 5);
  if (kind === "destr") {
    const n = Math.min(5, e.destrN), y0 = y - (n - 1) * PX;
    for (let i = 0; i < n; i++) for (let k = -3; k <= 3; k++) pxDot(x + k * PX - 1, y0 + i * PX * 2 + ((k + i) % 2 ? 0 : -PX * 0.5), c, 1);
    ctx.globalAlpha = 1; return;
  }
  blit(gridSprite("status:" + kind + ":" + c, STATUS_GRID[kind], { w: c, Y: "#fff6b0" }), x, y, 3.5, 3.5);
};
// segno sopra il pallino della carta (1.12.5): chain = catene verticali affiancate (una per livello della chain),
// level up = frecce ^ una sotto l’altra (una per livello); HD-2D: a pixel, con la luce del tipo
// simbolo del tipo a pixel (base in (x, bot)), col contorno scuro come le altre figure HD-2D
typeSymbol = function typeSymbol(type, x, bot, c) {
  const pal = { c, d: mix(c, "#171338", 0.45), h: mix(c, "#fffbea", 0.5), y: "#fff6b0" };
  blit(procSprite("typeSym:" + type + ":" + c, 7, 7, (i, j) => pal[TYPE_GRID[type][j][i]] || null), x, bot - 1, 4.5, 8);
};
// combo (1.25.1): coppia di simboli, a sinistra la principale (o il guardiano) e a destra la secondaria, con le due luci dei tipi
cardMark = function cardMark(o, cx, bot, c) {
  if (o.cat === "combo" && o.type2) {
    const c2 = TYPES[o.type2].color;
    typeSymbol(o.type, cx - 8, bot - 2, c); typeSymbol(o.type2, cx + 8, bot - 2, c2);
    light(cx - 8, bot - 9, 14, c, 0.3); light(cx + 8, bot - 9, 14, c2, 0.3); return;
  }
  const n = o.lv || 0; if (!n || (o.cat !== "chain" && o.cat !== "lu")) return;
  const pal = { c, h: mix(c, "#fffbea", 0.5), d: mix(c, "#171338", 0.45) };
  bot -= 3;
  if (o.cat === "chain") {                        // due anelli di fronte e uno di taglio in mezzo
    const sp = gridSprite("markChain:" + c, [".ccc.", "c...d", ".cdd.", "..h..", "..h..", ".ccc.", "c...d", ".cdd."], pal);
    for (let i = 0; i < n; i++) blit(sp, cx + (i - (n - 1) / 2) * 12, bot, 2.5, 8);
  } else {                                        // frecce ^ una sotto l’altra
    const sp = gridSprite("markUp:" + c, ["...h...", "..ccc..", ".cc.cc.", "cd...dc"], pal);
    for (let i = 0; i < n; i++) blit(sp, cx, bot - i * 7, 3.5, 4);
  }
  ctx.globalAlpha = 1; light(cx, bot - 10, 18, c, 0.35);
};
drawFortress = function drawFortress() {
  const y = H - FORT_H;
  ctx.fillStyle = "#120f2a"; ctx.fillRect(0, y, W, FORT_H); ctx.fillStyle = "#2a2650"; ctx.fillRect(0, y, W, PX);   // HD-2D: zoccolo scuro, barra a pixel con le tacche
  const frac = clamp(domeHp / domeMax, 0, 1);
  pxBar(10, y + 8, W - 20, 10, frac, frac > 0.35 ? "#3fe0a0" : "#ff5a5a", true);
  // scritta bianca col contorno scuro: si legge anche sulla barra verde (1.12.5)
  ctx.font = "800 10px system-ui, -apple-system, Segoe UI, Roboto, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.lineJoin = "round"; ctx.lineWidth = 3; ctx.strokeStyle = "#070b16"; ctx.strokeText("Cupola " + Math.ceil(domeHp) + "/" + domeMax, W / 2, y + 13);
  ctx.fillStyle = "#ffffff"; ctx.fillText("Cupola " + Math.ceil(domeHp) + "/" + domeMax, W / 2, y + 13);
  if (domeShield > 0) FX.shieldCount(W - 30, y + 13, domeShield);                // immunità accumulate (Impenetrabile)
};
drawFloater = function drawFloater(f) {                       // numero del danno che sale e svanisce (il colore lo sceglie popup() nella logica)
  ctx.globalAlpha = clamp(f.life / (f.max || 0.7), 0, 1);                       // HD-2D: cifre col contorno scuro, come nei giochi di ruolo
  ctx.font = "800 " + (f.size || 12) + "px system-ui, -apple-system, Segoe UI, Roboto, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.lineJoin = "round"; ctx.lineWidth = 3; ctx.strokeStyle = OUTLINE; ctx.strokeText(f.txt, f.x, f.y); ctx.fillStyle = f.color; ctx.fillText(f.txt, f.x, f.y);
};
drawCrosshair = function drawCrosshair(x, y, locked) {         // mirino sulla colonna del tiro; giallo quando nella colonna c’è un nemico o il pacco
  const c = locked ? "#ffd166" : "#e8eefc", sp = locked ? 0 : Math.sin(clock * 6);   // HD-2D: anello e tacche a pixel; agganciato si stringe e illumina
  pxEllipse(x, y, 12 - (locked ? 2 : 0), 12 - (locked ? 2 : 0), c, 0.9, clock * (locked ? 2 : 0.5), clock * (locked ? 2 : 0.5) + 6.2832, 4);
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) pxLine(x + dx * (17 + sp), y + dy * (17 + sp), x + dx * 7, y + dy * 7, c, 0.9);
  ctx.globalAlpha = 1; if (locked) light(x, y, 20, c, 0.5);
};
// fulmine globulare a pixel (Teslacoil: proiettile, carica sulla bobina): sfera che crepita e archi a zig-zag che si staccano
ballLightning = function ballLightning(x, y, r, age) {
  const R = Math.max(1, Math.round(r / PX)), a = ctx.globalAlpha, t0 = Math.floor(age * 18);
  pixelOrb(x, y, R, TYPES.electric.color, age);
  for (let k = 0; k < 3; k++) {
    if (hash2(k, t0) < 0.35) continue;
    const an = hash2(k + 4, t0) * 6.2832, l = r * (1.6 + hash2(k + 8, t0)), mx = x + Math.cos(an + 0.4) * l * 0.55, my = y + Math.sin(an + 0.4) * l * 0.55;
    pxLine(x + Math.cos(an) * r, y + Math.sin(an) * r, mx, my, "#fff6b0", a); pxLine(mx, my, x + Math.cos(an) * l, y + Math.sin(an) * l, "#ffe14d", a);
  }
  ctx.globalAlpha = a; light(x, y, r * 4, TYPES.electric.color, 0.8 * a);
};
thunderDraw = function thunderDraw(s) {                         // Thunderbolt · sfere sulla barriera
  for (const o of s.st.sph || []) { pixelOrb(o.x, o.y, 3, TYPES.electric.color, clock + o.x); light(o.x, o.y, 26, TYPES.electric.color, 0.7); }
};

GFX_INFO = { cacheSize: () => SPR.size, cacheMax: 1500 };   // per i test (tests/grafica.js)

/* ---------- punti di aggancio di draw.js ---------- */
// cielo: lo stesso fondo per la battaglia e per i menu, con le stelle che brillano; la cache degli sprite non cresce senza limite
drawSky = function drawSky() {
  if (SPR.size > 1500) SPR.clear();               // sprite che non servono più (rocce dei nemici morti, colori iridescenti): si rifanno quando servono
  blit(hdBackground(), 0, 0, 0, 0);
  for (let k = 0; k < 30; k++) {
    const tw = Math.sin(clock * (1.5 + hash2(k, 21) * 2) + k * 1.7); if (tw < 0.4) continue;
    ctx.fillStyle = rgba("#e8f0ff", (tw - 0.4) * 1.6); ctx.fillRect(Math.round(hash2(k, 22) * W / PX) * PX, Math.round(hash2(k, 23) * (HORIZON - 60) / PX) * PX, PX, PX);
  }
};
// battaglia: terreno, effetti a terra, cupola, sprite; luci tutte insieme sopra una leggera penombra; atmosfera; zoccolo
drawWorld = function drawWorld() {
  HD.lights = [];
  drawGround();
  for (const o of ents) if (o.under) o.draw();   // aree a terra (Area infuocata, varchi) sotto i nemici
  drawDomeFill();
  slots.forEach((s) => { if (s) drawTurret(s); });
  drawPlayer();
  for (const r of RG.list) FX.ranger(r);           // ranger (1.17.0; in HD-2D dalla 1.18.0)
  if (pressing && state === "play") drawCrosshair(player.x + GUN.dx, press.y, !!colTarget());   // mirino sulla colonna del cannone, giallo se c’è qualcosa da colpire (1.24.1)
  for (const h of shells) FX.husk(h);             // gusci (speciale physical), sotto i nemici
  enemies.forEach(drawEnemy);
  if (gift) drawEnemy(gift);                       // pacco regalo (1.21.0)
  for (const o of ents) if (!o.under) o.draw();
  drawDomeEdge();
  ctx.fillStyle = "rgba(12,8,34,0.16)"; ctx.fillRect(0, 0, W, GROUND_Y + GROUND_H);   // penombra: le luci risaltano
  const L = HD.lights; HD.lights = null; drawLights(L);
  grade(); motes();
  drawFortress();
};
drawMenuBack = function drawMenuBack() { drawGround(); grade(); motes(); };   // i menu sul cielo, con la piattaforma
// nemici: tutti e sette gli aspetti come sprite; un aspetto nuovo senza sprite usa il disegno classico
const ROCK_LOOKS = ["rock", "asteroid", "meteor", "saucer"], SHIP_LOOKS = ["shard", "ship", "mothership"], baseEnemyBody = enemyBody;
// continenti (1.19.1): globo a pixel con il retino, mare scuro, continente nella rampa del tipo, luce dall’alto a sinistra, atmosfera a pixel
landIcon = function landIcon(t, x, y, r, dimmed) {
  const c = TYPES[t].color, P = ramp(c), n = Math.round(r * 2 / PX), h = n / 2;
  const sp = procSprite("land:" + t + ":" + n, n, n, (i, j) => {
    const u = (i + 0.5 - h) / h, v = (j + 0.5 - h) / h, d = u * u + v * v; if (d > 1) return null;
    const lit = -u * 0.45 - v * 0.55 + Math.sqrt(1 - d) * 0.75, b = dith(i, j, clamp((lit + 0.25) / 1.25, 0, 0.999), 4);
    return LANDS[t].some((p) => inPoly(p, u, v)) ? P[b + 1] : ["#070c1c", "#0c1630", "#132250", "#1c3170"][b];
  });
  ctx.globalAlpha = dimmed ? 0.5 : 1; blit(sp, x, y, h + 1, h + 1);
  pxEllipse(x, y, r + 1, r + 1, c, dimmed ? 0.35 : 0.85); ctx.globalAlpha = 1;
  if (!dimmed) light(x, y, r * 1.4, c, 0.22);
};
// sagome a strati (1.19.1): uno sprite a pixel per sagoma, colore e misura; luce dall’alto a sinistra, ogni strato con il bordo in rilievo
// (chiaro in alto a sinistra, scuro in basso a destra); gli strati trasparenti si mescolano con quello sotto
function layerBox(layers) {
  if (layers.bb) return layers.bb;
  let u0 = 9, v0 = 9, u1 = -9, v1 = -9;
  for (const L of layers) for (const [u, v] of L.e ? [[L.e[0] - L.e[2], L.e[1] - L.e[3]], [L.e[0] + L.e[2], L.e[1] + L.e[3]]] : L.p) { u0 = Math.min(u0, u); v0 = Math.min(v0, v); u1 = Math.max(u1, u); v1 = Math.max(v1, v); }
  return (layers.bb = [u0, v0, u1, v1]);
}
layerBody = function layerBody(key, layers, x, y, sx, sy, c) {
  const [u0, v0, u1, v1] = layerBox(layers), nx = Math.max(2, Math.round((u1 - u0) * sx / PX)), ny = Math.max(2, Math.round((v1 - v0) * sy / PX));
  const fl = c === "#ffffff", du = (u1 - u0) / nx, dv = (v1 - v0) / ny, cu = (u0 + u1) / 2, cv = (v0 + v1) / 2, hu = (u1 - u0) / 2, hv = (v1 - v0) / 2;
  const sp = procSprite("lay:" + key + ":" + c + ":" + nx + "x" + ny, nx, ny, (i, j) => {
    const u = u0 + (i + 0.5) * du, v = v0 + (j + 0.5) * dv;
    const topAt = (uu, vv, below) => { for (let k = (below == null ? layers.length : below) - 1; k >= 0; k--) if (inLayer(layers[k], uu, vv)) return k; return -1; };
    const colorOf = (k) => {
      const L = layers[k], P = ramp(fl ? "#eef2ff" : roleCol(L.r, c));
      let z = ((u - cu) / hu + (v - cv) / hv) * 0.5 + (L.d || 0) * 1.4;
      if (L.s !== 0) { if (topAt(u - du, v - dv) < k) z -= 0.7; if (topAt(u + du, v + dv) < k) z += 0.7; }
      const col = P[Math.min(L.r === "gd" || L.r === "k" ? 3 : 5, z < -0.45 ? 5 : z < -0.1 ? 4 : z < 0.3 ? 3 : z < 0.6 ? 2 : 1)];   // vetro scuro e nero non schiariscono
      if (L.a == null || L.a >= 1) return col;
      const b = topAt(u, v, k); return b < 0 ? (L.a >= 0.5 ? col : null) : mix(colorOf(b), col, L.a);
    };
    const k = topAt(u, v); return k < 0 ? null : colorOf(k);
  });
  blit(sp, x + u0 * sx, y + v0 * sy, 1, 1);
};
function hdFoe(e, c, look) {
  const r = e.def.r, a = ctx.globalAlpha;
  if (look === "bomb") for (const d of [-0.3, 0.3]) pixelFlame(e.x + d * r, e.y - r * 0.7, 8 + 3 * Math.sin(clock * 11 + d * 7), 3, a, d > 0 ? 5 : 2);
  if (look === "spark") for (let k = 1; k <= 3; k++) pxDot(e.x + (k % 2 ? 2 : -2), e.y - r - k * 5, "#fff6b0", 0.6 * a / k);
  if (look === "mshard") for (let k = 1; k <= 4; k++) pxDot(e.x + (k % 2 ? PX : -PX), e.y - r - k * 6, c, 0.55 * a / k);   // scia del Cristallo maggiore
  ctx.globalAlpha = a;
  layerBody(look, FOE_LAYERS[look], e.x, e.y, r, r, c);
  if (e.def.major) pxEllipse(e.x, e.y, r * 1.3, r * 1.3, "#ffd166", 0.45 * a, 0, 6.2832, 3);   // mini-boss maggiori (1.23.0): alone dorato a pixel
  ctx.globalAlpha = a;
  foeDetails(e, c, look);
  light(e.x, e.y, r * 2.2, c, 0.45 * a);
}
// boss giganti (1.19.0; a strati dalla 1.19.1): sprite a pixel della sagoma, il meteorite con il rumore della roccia; dettagli e luci sopra
const hdRockR = (a) => 0.9 + 0.08 * Math.sin(a * 5) + 0.04 * Math.sin(a * 11);
giantRockPath = function giantRockPath(e) {
  ctx.beginPath(); for (let k = 0; k <= 48; k++) { const a = k / 48 * 6.2832, q = e.def.r * hdRockR(a); if (k) ctx.lineTo(e.x + Math.cos(a) * q, e.y + Math.sin(a) * q); else ctx.moveTo(e.x + q, e.y); } ctx.closePath();
};
function hdGiant(e, c, look) {
  giantBehind(e, c, look);
  if (look === "bigrock") {
    const P2 = ramp(c), n = Math.ceil(e.def.r * 2 / PX);
    const sp = procSprite("giant:bigrock:" + c + ":" + n, n, n, (i, j) => {
      const u = (i + 0.5) / n * 2 - 1, v = (j + 0.5) / n * 2 - 1, a = Math.atan2(v, u);
      if (u * u + v * v > hdRockR(a) ** 2) return null;
      const z = (u + v) * 0.5 + (hash2(i, j) - 0.5) * 0.25;
      return z < -0.5 ? P2[5] : z < -0.15 ? P2[4] : z < 0.25 ? P2[3] : z < 0.6 ? P2[2] : P2[1];
    });
    blit(sp, e.x, e.y, n / 2 + 1, n / 2 + 1);
  } else layerBody("giant:" + look, GIANT_LAYERS[look], e.x, e.y, e.def.box[0], e.def.box[1], c);
  giantDetails(e, c, look);
  const box = e.def.box || [e.def.r, e.def.r];
  light(e.x, e.y, Math.max(box[0], box[1]) * 1.3, c, 0.35 * ctx.globalAlpha);
  if (look === "bigrock") light(e.x, e.y + e.def.r * 0.8, e.def.r * 0.9, "#ff8a3d", 0.5);
}
const baseGiantBehind = giantBehind;
giantBehind = function giantBehind(e, c, look) {   // HD-2D: scia del meteorite a pixel (lingue di fuoco e luce calda), il resto come la classica
  if (look !== "bigrock") { baseGiantBehind(e, c, look); return; }
  const r = e.def.r, a = ctx.globalAlpha;
  for (let k = 0; k < 11; k++) {
    const an = Math.PI + 0.25 + k / 10 * (Math.PI - 0.5), f = 0.75 + 0.35 * Math.sin(clock * 13 + k * 1.7);
    pixelFlame(e.x + Math.cos(an) * r * 0.82, e.y + Math.sin(an) * r * 0.82, r * (0.35 + 0.3 * Math.abs(Math.sin(an))) * f, r * 0.08, a, k);
  }
  ctx.globalAlpha = a; light(e.x, e.y - r, r * 1.3, "#ff8a3d", 0.6);
};
orbitRing = function orbitRing(x, y, rx, ry, c, t) {   // HD-2D: anello a pixel, metà dietro tenue, luci che girano
  pxEllipse(x, y, rx, ry, c, 0.35, Math.PI, 6.2832); pxEllipse(x, y, rx, ry, c, 0.9, 0, Math.PI);
  for (let k = 0; k < 3; k++) { const an = t * 2.2 + k * 2.0944, s = Math.sin(an); pxDot(x + Math.cos(an) * rx, y + s * ry, s > 0 ? "#ffffff" : c, s > 0 ? 1 : 0.5); }
  ctx.globalAlpha = 1; light(x, y, rx * 0.6, c, 0.25);
};
enemyBody = function enemyBody(e, c, look) {
  if (e.def.giant) { hdGiant(e, c, look); return; }
  if (ROCK_LOOKS.includes(look)) hdEnemy(e, c, look); else if (SHIP_LOOKS.includes(look)) hdEnemy2(e, c, look);
  else if (FOE_LAYERS[look]) hdFoe(e, c, look); else baseEnemyBody(e, c, look);
};
// barra della vita a pixel con il contorno, il fondo scuro e la riga chiara in alto
enemyBar = function enemyBar(e, look) {
  const r = e.def.r, x = e.x, w = r * 2, by = e.y - r * (look === "shard" ? 1.05 : 1) - 8;
  const bx = Math.round((x - r) / PX) * PX, bw = Math.round(w / PX) * PX, bY = Math.round(by / PX) * PX, fw = Math.round(bw * clamp(e.hp / e.maxHp, 0, 1) / PX) * PX, tc = TYPES[e.def.type].color;
  ctx.fillStyle = OUTLINE; ctx.fillRect(bx - 1, bY - 1, bw + 2, PX * 2 + 2);
  ctx.fillStyle = "#2a2040"; ctx.fillRect(bx, bY, bw, PX * 2);
  ctx.fillStyle = mix(tc, "#171338", 0.35); ctx.fillRect(bx, bY, fw, PX * 2);
  ctx.fillStyle = mix(tc, "#fffbea", 0.35); ctx.fillRect(bx, bY, fw, PX);
};
// HUD: cornice dorata e barra a pixel con le tacche per il boss finale; barra della frenesia a pixel che si illumina quando è pronta o attiva
bossBar = function bossBar(k, col) { ctx.fillStyle = "#ffd166"; ctx.fillRect(28, 98, 304, 16); pxBar(32, 102, 296, 8, k, col, true); };
frenzyBar = function frenzyBar(k, f) {
  pxBar(10, 76, 110, 6, k, f ? "#ff9a5a" : "#7fa0e0");
  if (f || k >= 1) light(10 + 110 * k, 79, 14, f ? "#ff9a5a" : "#7fa0e0", 0.5 + 0.3 * Math.sin(clock * 8));
};
// menu: velo più leggero (il cielo si vede) e titolo dorato col contorno e la luce
menuTitle = function menuTitle() {
  dim(0.62);
  ctx.font = "800 28px system-ui, -apple-system, Segoe UI, Roboto, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.lineJoin = "round"; ctx.lineWidth = 6; ctx.strokeStyle = OUTLINE; ctx.strokeText("PLANET DEFENSE", W / 2, 72);
  const tg = ctx.createLinearGradient(0, 58, 0, 84); tg.addColorStop(0, "#fff6d6"); tg.addColorStop(0.5, "#ffd166"); tg.addColorStop(1, "#e08a3a");
  ctx.fillStyle = tg; ctx.fillText("PLANET DEFENSE", W / 2, 70);
  light(W / 2, 70, 120, "#ffb347", 0.35);
};
// carte: il pallino del tipo illumina la carta
const baseCardBadge = cardBadge;
cardBadge = function cardBadge(o, cx, cy, c, label) { light(cx, cy, 40, c, 0.45); baseCardBadge(o, cx, cy, c, label); };

// TURRET_ART: voci della grafica HD-2D (11)
Object.assign(TURRET_ART, {
  sky(x, g, c) { hdTurret("sky", x, g, c); },   // HD-2D: sprite in TURRET_GRID
  laser(x, g, c) { hdTurret("laser", x, g, c); },   // HD-2D: sprite in TURRET_GRID
  disr(x, g, c) { hdTurret("disr", x, g, c); },   // HD-2D: sprite in TURRET_GRID
  aero(x, g, c, s) { hdTurret("aero", x, g, c, s); },   // s: la torretta, per la direzione della canna (assente nelle tessere)   // HD-2D: sprite in TURRET_GRID
  thunder(x, g, c) { hdTurret("thunder", x, g, c); },   // HD-2D: sprite in TURRET_GRID
  beam(x, g, c) { hdTurret("beam", x, g, c); },   // HD-2D: sprite in TURRET_GRID
  wheel(x, g, c) { hdTurret("wheel", x, g, c); },   // HD-2D: sprite in TURRET_GRID
  hive(x, g, c) { hdTurret("hive", x, g, c); },   // HD-2D: sprite in TURRET_GRID
  rail(x, g, c) { hdTurret("rail", x, g, c); },   // HD-2D: sprite in TURRET_GRID
  tesla(x, g, c) { hdTurret("tesla", x, g, c); },   // HD-2D: sprite in TURRET_GRID
  vortex(x, g, c) { hdTurret("vortex", x, g, c); },   // HD-2D: sprite in TURRET_GRID
});

// FX: voci della grafica HD-2D (32)
Object.assign(FX, {
  ring(o, x, y, r1, color, life) {               // anello che si stringe e svanisce (esplosioni, impatti); HD-2D: lampo e schegge a pixel
    const k = clamp(o.t / life, 0, 1), rr = r1 * (1 - k * 0.9);
    pxEllipse(x, y, rr, rr, color, k); if (rr > 6) pxEllipse(x, y, rr - PX, rr - PX, "#fff3c0", k * 0.5, 0, null, 2);
    ctx.globalAlpha = k;
    for (let i = 0; i < 8; i++) {
      const a = i * 0.785 + x * 0.1, d = r1 * (0.3 + (1 - k) * 0.9);
      ctx.fillStyle = i % 2 ? color : "#fff3c0"; ctx.fillRect(Math.round((x + Math.cos(a) * d) / PX) * PX, Math.round((y + Math.sin(a) * d) / PX) * PX, PX, PX);
    }
    ctx.globalAlpha = 1; light(x, y, r1 * 1.8, color, k * k);
  },
  bolt(o, pts, color, life, w) {                 // fulmine a zig-zag; HD-2D: alone additivo, tratto a pixel con il nucleo chiaro, lampo alle estremità
    const a = clamp(o.t / life, 0, 1);
    glowPath(pts, color, (w || 2) * 1.6, a);
    for (let i = 1; i < pts.length; i++) pxLine(pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y, i % 2 ? "#ffffff" : color, a);
    ctx.globalAlpha = 1; light(pts[pts.length - 1].x, pts[pts.length - 1].y, 22, color, a); light(pts[0].x, pts[0].y, 14, color, 0.5 * a);
  },
  teslaOrb(o) {                                  // Teslacoil · Sfera statica: area elettrica trasparente (non copre i nemici); HD-2D: bordo a pixel che pulsa, archi a pixel, nucleo
    const k = Math.min(1, o.t / 0.5), age = o.age, r = o.r, x = o.x, y = o.y, c = TYPES.electric.color, t0 = Math.floor(age * 16);
    const fl = 0.75 + 0.25 * Math.sin(age * 43) * Math.sin(age * 17 + 1);
    disc(x, y, r, c, 0.05 * fl * k);
    pxEllipse(x, y, r, r, c, 0.55 * fl * k, 0, null, 3);
    for (let j = 0; j < 5; j++) {                // archi dal nucleo verso il bordo, che cambiano forma 16 volte al secondo
      const a0 = age * (j % 2 ? 3 : -2.5) + j * 1.257; let px = x + Math.cos(a0) * 4, py = y + Math.sin(a0) * 4;
      for (let i = 1; i <= 4; i++) {
        const rr = 4 + (r * 0.85 - 4) * i / 4, aa = a0 + (hash2(i + j * 5, t0) - 0.5) * 0.6, nx = x + Math.cos(aa) * rr, ny = y + Math.sin(aa) * rr;
        pxLine(px, py, nx, ny, i < 3 ? "#fff6b0" : c, (0.4 + 0.5 * hash2(j, t0)) * k); px = nx; py = ny;
      }
    }
    ctx.globalAlpha = 1; pixelOrb(x, y, 1, "#fff6b0", age);
    light(x, y, r * 1.6, c, 0.45 * k * fl);
  },
  fireField(o) {                                 // Sky Guard · Area infuocata; HD-2D: brace a terra (ovale in prospettiva), lingue di fuoco a pixel, scintille, luce calda
    const fade = Math.min(1, o.t / 0.5, o.age / 0.15), r = o.r, x = o.x, y = o.y, ry = r * 0.62;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(120,30,30,0.55)"); g.addColorStop(0.7, "rgba(70,18,40,0.4)"); g.addColorStop(1, "rgba(40,10,30,0)");
    ctx.save(); ctx.globalAlpha = fade; ctx.translate(x, y); ctx.scale(1, ry / r); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.2832); ctx.fill(); ctx.restore();
    const t0 = Math.floor(o.age * 8);
    for (let k = 0; k < 18; k++) {                // braci che pulsano
      const a = hash2(k, 31) * 6.2832, d = Math.sqrt(hash2(k, 32)) * 0.9, on = hash2(k, t0) > 0.35;
      ctx.globalAlpha = fade * (on ? 1 : 0.5); ctx.fillStyle = on ? "#ffb347" : "#c2433a";
      ctx.fillRect(Math.round((x + Math.cos(a) * d * r) / PX) * PX, Math.round((y + Math.sin(a) * d * ry) / PX) * PX, PX, PX);
    }
    ctx.globalAlpha = 1;
    const n = Math.max(7, Math.round(r / 4.5));
    for (let k = 0; k < n; k++) {                 // lingue sul bordo dell’ovale (prima quelle dietro)
      const a = Math.PI + k * 6.2832 / n, f = 0.5 + 0.5 * Math.sin(o.age * 9 + k * 1.7);
      pixelFlame(x + Math.cos(a) * r * 0.82, y + Math.sin(a) * ry * 0.82, 8 + 8 * f, 3.5, fade, k);
    }
    for (let k = 0; k < 4; k++) {                 // lingue alte al centro
      const a = k * 1.9 + 0.6, d = 0.15 + 0.12 * k, f = 0.5 + 0.5 * Math.sin(o.age * 11 + k * 2.3);
      pixelFlame(x + Math.cos(a) * d * r, y + Math.sin(a) * d * ry, 14 + 10 * f, 5, fade, k + 20);
    }
    for (let k = 0; k < 7; k++) {                 // scintille che salgono
      const sy = (o.age * 30 + k * 11) % 34, sx = x + (hash2(k, 41) - 0.5) * r * 1.4 + Math.sin(o.age * 3 + k) * 3;
      ctx.globalAlpha = fade * (1 - sy / 34); ctx.fillStyle = "#ffe8b0"; ctx.fillRect(Math.round(sx / PX) * PX, Math.round((y - 6 - sy) / PX) * PX, PX, PX);
    }
    ctx.globalAlpha = 1;
    const fl = 0.85 + 0.15 * Math.sin(o.age * 13) * Math.sin(o.age * 7 + 1);
    light(x, y - 4, r * 2.4 * fl, "#ff7a3d", 0.75 * fade); light(x, y - 6, r * 1.1, "#ffd27a", 0.5 * fade * fl);
  },
  hiveShot(o) {                                  // Hive · colpo del drone: lv1 punto viola, lv2 rombo più grande e chiaro, lv3 stella rosa; HD-2D: a pixel con la scia e la luce
    const c = ["#b07cff", "#d9a4ff", "#ff9be6"][o.lvl - 1];
    pxLine(o.px, o.py, o.x, o.y, c, 0.5); ctx.globalAlpha = 1;
    const G = [["kk", "kk"], [".k.", "kwk", ".k."], ["..k..", ".kwk.", "kwwwk", ".kwk.", "..k.."]][o.lvl - 1];
    const sp = gridSprite("hiveShot:" + o.lvl, G, { k: c, w: "#ffffff" });
    blit(sp, o.x, o.y, sp.width / 2, sp.height / 2);
    light(o.x, o.y, 8 + o.lvl * 4, c, 0.8);
  },
  zone(o, color) {                               // area che dura; HD-2D: velo a retino e bordo a pixel che gira
    const a = Math.min(1, o.t / 0.5);
    disc(o.x, o.y, o.r, color, 0.12 * a);
    pxEllipse(o.x, o.y, o.r, o.r, color, 0.7 * a, clock, clock + 6.2832, 4);
    ctx.globalAlpha = 1; light(o.x, o.y, o.r * 1.3, color, 0.35 * a);
  },
  missile(o, mini) {                             // Sky Guard · missile; HD-2D: sprite a pixel, scia di fumo, fiamma in coda che illumina (Missili sovraccarichi: luce elettrica)
    const ca = Math.cos(o.a), sa = Math.sin(o.a), L = mini ? 5 : 8;
    if (o.charged) { light(o.x, o.y, 20, TYPES.electric.color, 0.7 + 0.3 * Math.sin(o.age * 40)); pxEllipse(o.x, o.y, 8, 8, TYPES.electric.color, 0.6, o.age * 9, o.age * 9 + 4); ctx.globalAlpha = 1; }
    if (typeof clock === "number" && o.update) {   // scia: posizioni passate tenute nell’entità (solo per il disegno)
      const tr = o.__tr || (o.__tr = []), last = tr[tr.length - 1];
      if (!last || Math.hypot(last.x - o.x, last.y - o.y) > 4) { tr.push({ x: o.x - ca * L, y: o.y - sa * L, t: clock }); if (tr.length > 12) tr.shift(); }
      for (const p of tr) {
        const age = clock - p.t, k = clamp(1 - age / 0.55, 0, 1); if (k <= 0) continue;
        const z = PX * (age < 0.1 ? 1 : age < 0.3 ? 2 : 3);
        ctx.fillStyle = age < 0.08 ? rgba("#ffd27a", 0.8 * k) : rgba("#9a93c4", 0.45 * k);
        ctx.fillRect(Math.round(p.x / PX) * PX - z / 2, Math.round(p.y / PX) * PX - z / 2, z, z);
      }
    }
    const tc = o.tint || TYPES.fire.color, sp = gridSprite("missile:" + tc, [".kk.......", "kdckkkkkk.", "kddeeeee4k", "kdckkkkkk.", ".kk......."], turretPal(tc));   // tint: missili del ranger Epsilon
    ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.a); ctx.imageSmoothingEnabled = false;
    const z = mini ? 1.3 : PX; ctx.drawImage(sp, -6 * z, -2.5 * z, sp.width * z, sp.height * z); ctx.imageSmoothingEnabled = true; ctx.restore();
    const f = 0.8 + 0.2 * Math.sin((typeof clock === "number" ? clock : 0) * 40 + o.x);
    ctx.fillStyle = "#fff3b0"; ctx.fillRect(Math.round((o.x - ca * (L + 3)) / PX) * PX, Math.round((o.y - sa * (L + 3)) / PX) * PX, PX, PX);
    light(o.x - ca * (L + 2), o.y - sa * (L + 2), (mini ? 14 : 22) * f, "#ff9a4a", 0.9);
  },
  laserRays(rays) {                              // Laser · raggio principale e mini-raggi (con i rimbalzi sui bordi); HD-2D: fascio con alone e scintille
    for (const r of rays) for (const g of r.segs) hdBeam(g.x1, g.y1, g.x2, g.y2, TYPES.energy.color, r.w * 0.45, 1);
  },
  laserSweep(o, w) {                             // Laser · spazzata
    for (const g of o.segs) hdBeam(g.x1, g.y1, g.x2, g.y2, "#7ff6ff", w * 0.4, 0.9);
  },
  laserSpin(o, rays) {                           // combo Laser del guardiano · laser rotante
    for (const r of rays) for (const g of o.segs(r)) hdBeam(g.x1, g.y1, g.x2, g.y2, TYPES.energy.color, r.w * 0.45, 1);
  },
  disrField(o, x0, y0, hh) {                     // Disruption Drone · due droni volano ai lati e tra loro si forma il campo; HD-2D: fascia a righe che scorrono, bordi a pixel
    const k = clamp(o.age / 0.4, 0, 1), a = clamp(o.t / 0.6, 0, 1), c = TYPES.force.color;
    if (k >= 1) {
      const f = clamp((o.age - 0.4) / 0.2, 0, 1) * a, off = Math.floor(o.age * 30) % 6;
      ctx.globalAlpha = 0.12 * f; ctx.fillStyle = c; ctx.fillRect(0, o.y - hh, W, hh * 2);
      ctx.globalAlpha = 0.22 * f;
      for (let yy = o.y - hh + off; yy < o.y + hh; yy += 6) ctx.fillRect(0, Math.round(yy / PX) * PX, W, PX);   // righe che scorrono
      const sh = Math.floor(o.age * 40) % 8;
      for (const yy of [o.y - hh, o.y + hh]) for (let xx = -8 + sh; xx < W; xx += 8) { ctx.globalAlpha = f; ctx.fillStyle = (xx / 8 | 0) % 2 ? "#ffffff" : c; ctx.fillRect(Math.round(xx / PX) * PX, Math.round(yy / PX) * PX, PX * 2, PX); }
      ctx.globalAlpha = 1;
      for (let xx = 30; xx < W; xx += 75) light(xx, o.y, hh * 2.2, c, 0.35 * f);
    }
    for (const tx of [14, W - 14]) {
      const px = x0 + (tx - x0) * k, py = y0 + (o.y - y0) * k;
      ctx.globalAlpha = k >= 1 ? a : 1;
      blit(gridSprite("disrDrone:" + c, DISR_DRONE, turretPal(c)), px, py, 3.5, 3.5);
      ctx.globalAlpha = 1; light(px, py, 16, c, 0.7 * (k >= 1 ? a : 1));
    }
  },
  disrBlast(o, y, hh) {                          // Disruption Drone · Esplosione finale: lampo su tutto il campo; HD-2D: lampo, schegge a pixel e luce
    const a = clamp(o.t / 0.35, 0, 1);
    ctx.globalAlpha = 0.35 * a; ctx.fillStyle = "#e6d4ff"; ctx.fillRect(0, y - hh, W, hh * 2);
    for (let i = 0; i < 30; i++) pxDot(hash2(i, 1) * W, y + (hash2(i, 2) - 0.5) * hh * 2 * (1.6 - a), i % 3 ? "#ffffff" : TYPES.force.color, a);
    ctx.globalAlpha = 1; for (let xx = 40; xx < W; xx += 70) light(xx, y, hh * 3, "#e6d4ff", a);
  },
  aeroBomb(o) {                                  // Aeroblast · bomba; HD-2D: sprite a pixel con la miccia che sfavilla
    blit(procSprite("aeroBomb", 7, 7, (i, j) => { const dx = i - 3, dy = j - 3; if (Math.hypot(dx, dy) > 3.3) return null; if (j === 4) return "#3a4a78";
      const l = -dx * 0.5 - dy * 0.6; return l > 1.2 ? METAL.e : l > 0 ? METAL.d : l > -1.4 ? METAL.c : METAL.b; }), o.x, o.y, 4, 4);
    pxDot(o.x, o.y - 8, Math.floor(clock * 20) % 2 ? "#ffd166" : "#ffffff", 1); ctx.globalAlpha = 1; light(o.x, o.y - 8, 12, "#ffb347", 0.8);
  },
  aeroShard(o) {                                 // Aeroblast · scheggia della salva; HD-2D: triangolino a pixel
    blit(gridSprite("aeroShard", [".k.", "kwk", "kwk"], { k: OUTLINE, w: TYPES.physical.color }), o.x, o.y, 1.5, 1.5);
  },
  aeroMine(o) {                                  // Aeroblast · mina con le punte (doppia dalla 1.12.0); HD-2D: sprite con la spia che lampeggia
    blit(gridSprite("aeroMine", [
      ".....e.....", ".e...c...e.", "..c.kkk.c..", "...kedck...", "..kedddcbk.", "eckddwdcbce", "..kcdddbbk.", "...kccbbk..", "..c.kkk.b..", ".e...b...b.", ".....b....."],
      Object.assign(turretPal(TYPES.physical.color), { w: "#26345c" })), o.x, o.y, 5.5, 5.5);
    const on = Math.sin(o.age * 6) > 0;
    pxDot(o.x, o.y, on ? "#ff5a5a" : "#5a2030", 1); ctx.globalAlpha = 1; if (on) light(o.x, o.y, 14, "#ff5a5a", 0.7);
  },
  fieldOrb(o) {                                  // Thunderbolt · sfera del campo elettrico; HD-2D: sfera a pixel che crepita
    pixelOrb(o.x, o.y, 3, TYPES.electric.color, clock + o.x * 0.1); light(o.x, o.y, 22, TYPES.electric.color, 0.7);
  },
  beamLinks(o, pos) {                            // Beam · raggio continuo e ramificazioni; HD-2D: fascio con alone e scintille
    for (const [a, b] of o.links) hdBeam(a.x, a.y, b.x, b.y, TYPES.energy.color, 2.2, 1);
  },
  fireTrail(pts, trailT) {                       // Firewheel Drone · scia di fuoco (anche delle combo); HD-2D: lingue a pixel e luce calda
    for (const p of pts) {
      const q = clamp(p.t / trailT, 0, 1), f = 0.5 + 0.5 * Math.sin(clock * 10 + p.x * 0.37 + p.y * 0.21), s = Math.floor(p.x * 7 + p.y * 3);
      pixelFlame(p.x - 5, p.y + 4, (7 + 5 * f) * q + 2, 3, q, s);
      pixelFlame(p.x + 4, p.y + 5, (10 + 5 * (1 - f)) * q + 2, 3.5, q, s + 1);
      light(p.x, p.y, 20 * q + 4, "#ff7a3d", 0.45 * q);
    }
    ctx.globalAlpha = 1;
  },
  wheelDrone(o, opt, trailT) {                   // Firewheel Drone · ruota di fuoco con la scia; HD-2D: scia di lingue a pixel, ruota a raggi, luce calda
    FX.fireTrail(o.trail, trailT);
    disc(o.x, o.y, opt.rad, TYPES.fire.color, 0.1);
    pxEllipse(o.x, o.y, opt.rad, opt.rad, "#ff8a3d", 0.6, o.rot, o.rot + 6.2832, 3);
    for (let k = 0; k < 3; k++) { const aa = o.rot + k * 2.0944; pxLine(o.x, o.y, o.x + Math.cos(aa) * opt.rad, o.y + Math.sin(aa) * opt.rad, k ? "#ffb347" : "#fff3b0", 1); }
    ctx.globalAlpha = 1; pixelOrb(o.x, o.y, opt.mini ? 1 : 2, "#ffb347", clock);
    light(o.x, o.y, opt.rad * 1.8, "#ff8a3d", 0.8);
  },
  hiveWave(o, x, y, ang, len, half) {            // Hive · onda d’urto a ventaglio (anche il ranger Omega); HD-2D: archi di pixel che si allargano
    const k = 1 - clamp(o.t / 0.35, 0, 1); half = half || HIVE_HALF;
    for (let i = 0; i < 3; i++) {
      const r = len * clamp(k * 1.2 - i * 0.12, 0, 1); if (r <= 0) continue;
      pxEllipse(x, y, r, r, i ? TYPES.force.color : "#ffe0ff", (1 - k) * (1 - i * 0.25), ang - half, ang + half);
    }
    ctx.globalAlpha = 1; light(x + Math.cos(ang) * len * k, y + Math.sin(ang) * len * k, len * 0.6, TYPES.force.color, (1 - k) * 0.6);
  },
  prismRay(o) {                                  // Prisma gigante · raggio verticale; HD-2D: avviso a pixel tratteggiato, poi fascio con alone e luce
    if (o.y0 === undefined) return;
    const col = TYPES[o.boss ? o.boss.def.type : "energy"].color, w = !o.boss || o.boss.def.giant ? 9 : 6;   // Prisma maggiore (1.23.0): nel colore del suo tipo, più sottile
    if (o.t < BOSS_L.rayWarn) { for (let y = o.y0; y < o.y1; y += PX * 4) pxDot(o.x, y, col, 0.4 + 0.4 * Math.sin(o.t * 30)); ctx.globalAlpha = 1; }
    else { const k = clamp(1 - (o.t - BOSS_L.rayWarn) / 0.4, 0, 1); hdBeam(o.x, o.y0, o.x, o.y1, col, w, k); light(o.x, o.y1, 40, col, k); }
  },
  regenCables(e) {                               // Artiglio maggiore (1.23.0); HD-2D: cavi a pixel con una scintilla che scorre e luce sul bersaglio
    const c = TYPES[e.def.type].color;
    for (const o of e.rgTg) {
      const pts = cablePts(e, o, clock);
      for (let i = 1; i < pts.length; i++) pxLine(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], c, 0.75);
      const q = pts[Math.floor((clock * 1.5 % 1) * (pts.length - 1))]; pxDot(q[0], q[1], "#ffffff", 0.9);
    }
    ctx.globalAlpha = 1;
  },
  healGlow(e) { light(e.x, e.y, e.def.r * 2, e.healC, 0.7 * clamp(e.healT, 0, 1)); ctx.globalAlpha = 1; },   // bagliore della rigenerazione
  deflectOrb(o) {                                // Riflesso maggiore (1.23.0); HD-2D: sfera a pixel con luce
    for (const [dx, dy] of [[0, 0], [PX, 0], [0, PX], [PX, PX], [-PX, 0], [0, -PX]]) pxDot(o.x + dx, o.y + dy, dx || dy ? o.color : "#ffffff", 1);
    ctx.globalAlpha = 1; light(o.x, o.y, 16, o.color, 0.7);
  },
  immune(e) {                                    // speciale energy · scudo dell’immunità; HD-2D: esagono a pixel che pulsa e luce
    const r = e.def.r * 1.45, k = 0.6 + 0.3 * Math.sin(clock * 12);
    for (let i = 0; i < 6; i++) pxLine(e.x + Math.cos(i * 1.0472) * r, e.y + Math.sin(i * 1.0472) * r, e.x + Math.cos((i + 1) * 1.0472) * r, e.y + Math.sin((i + 1) * 1.0472) * r, "#7ff6ff", k);
    light(e.x, e.y, r * 1.6, "#7ff6ff", 0.4 * k); ctx.globalAlpha = 1;
  },
  gift(g) {                                      // pacco regalo (1.21.0); HD-2D: pacco a pixel col nastro, eliche a pixel che girano, anello del timer a pixel, luce
    const age = g.age !== undefined ? g.age : clock, x = Math.round(g.x / PX) * PX, y = Math.round((g.y + Math.sin(age * 3) * 2) / PX) * PX, r = GIFT.r, n = 12, m = n / 2;
    const fl = g.flash > 0, sp = procSprite("gift:" + (fl ? 1 : 0), n, n + 2, (i, j) => {
      if (j < 2) return (i === m - 2 || i === m + 1) && j === 1 || (i === m - 3 || i === m + 2) && j === 0 ? "#ffd166" : null;   // fiocco
      const jj = j - 2; if (fl) return "#ffffff";
      if (i === m - 1 || i === m || jj === m - 1 || jj === m) return jj === 0 || i === 0 ? "#fff0b8" : "#ffd166";               // nastro
      return i === 0 || jj === 0 ? "#ff9cca" : i === n - 1 || jj === n - 1 ? "#a8306e" : GIFT_COLOR;
    });
    blit(sp, x, y, m + 1, m + 2);
    for (const sg of [-1, 1]) {                    // bracci e eliche
      const ax = x + sg * r * 0.95, ay = y - r * 0.95, w = r * 0.62 * (Math.abs(Math.sin(age * 38 + sg)) * 0.85 + 0.15);
      pxLine(x + sg * 7, y - 9, ax, ay, "#8a94ad", 1);
      pxLine(ax - w, ay, ax + w, ay, "#cfe0ff", 0.6); pxDot(ax, ay, "#e8eefc", 1);
    }
    if (g.t !== undefined && g.phase !== "out") {   // anello del timer a pixel: si svuota, verde → giallo → rosso
      const k = clamp(g.t / GIFT.time, 0, 1), c = k > 0.5 ? "#3fe0a0" : k > 0.25 ? "#ffd166" : "#ff5a5a", N = 40, a = k < 0.25 ? 0.6 + 0.4 * Math.sin(age * 14) : 1;
      for (let i = 0; i < N; i++) { const t = -Math.PI / 2 + i / N * 6.2832; pxDot(x + Math.cos(t) * (r + 6), y + Math.sin(t) * (r + 6), i / N < k ? c : "#9fb4d9", i / N < k ? a : 0.55); }
      light(x, y - r - 6, 10, c, 0.5 * a);
    }
    if (g.maxHp && g.hp < g.maxHp) { const w = Math.round(2 * r / PX) * PX; ctx.fillStyle = "rgba(7,11,22,0.8)"; ctx.fillRect(x - r, y + r + 10, w, PX); ctx.fillStyle = GIFT_COLOR; ctx.fillRect(x - r, y + r + 10, Math.round(w * clamp(g.hp / g.maxHp, 0, 1) / PX) * PX, PX); }
    ctx.globalAlpha = 1; light(x, y, 30, GIFT_COLOR, 0.45);
  },
  husk(h) {                                      // speciale physical · guscio vuoto, ribaltato con le zampe in alto; HD-2D: carapace a pixel grigio con la crepa
    const a = Math.min(1, h.t / 0.6), n = Math.ceil(h.r * 2.3 / PX), m = n / 2, sh = FOE_LAYERS.crab[0].p;
    const sp = procSprite("husk:" + h.r, n, n, (i, j) => {
      const u = (i + 0.5 - m) / m * 1.15, v = (j + 0.5 - m) / m * 1.15;
      if (!inPoly(sh, u, -v)) return null;
      return Math.abs(u + 0.1 + v * 0.3) < 0.09 ? "#2a3048" : (u + v) < -0.3 ? "#c9d2e6" : (u + v) < 0.4 ? "#8d96ad" : "#5d6478";
    });
    ctx.globalAlpha = a; blit(sp, h.x, h.y, m + 1, m + 1);
    for (const sg of [-1, 1]) for (const k of [0, 1]) pxLine(h.x + sg * h.r * (0.5 + k * 0.25), h.y - h.r * 0.4, h.x + sg * h.r * (0.8 + k * 0.3), h.y - h.r * 0.85, "#9aa3b8", a);
    ctx.globalAlpha = 1;
  },
  ranger(r) {                                    // ranger: sfera metallica (conversione) o cubo metallico con la lettera greca (supporto); HD-2D: a pixel, con luce del tipo
    const c = TYPES[r.type].color, x = r.x, y = r.y + Math.round(Math.sin(r.bob * 2.4) * 2.5 / PX) * PX;
    groundShadow(x, r.y + 15, 8, 0.35);
    if (r.d.role === "conv") {
      light(x, y, 22, c, 0.5);
      for (let j = -3; j <= 3; j++) for (let i = -3; i <= 3; i++) {          // sfera a pixel: riflesso in alto a sinistra, ombra in basso a destra
        if (i * i + j * j > 11) continue;
        const z = (i + j) / 6; ctx.fillStyle = i === -1 && j === -2 ? "#ffffff" : z < -0.3 ? mix(c, "#ffffff", 0.45) : z < 0.3 ? c : mix(c, "#141030", 0.5);
        ctx.fillRect(Math.round(x / PX) * PX + i * PX - PX / 2, Math.round(y / PX) * PX + j * PX - PX / 2, PX, PX);
      }
    } else {
      const bx = Math.round(x / PX) * PX, by = Math.round(y / PX) * PX, n = 4, [ct, cf, cs] = RANGER_CUBE[r.d.letter] || RANGER_CUBE.α;   // cubo: faccia davanti 8 × 8 pixel, sopra e lato nel colore del ranger (1.19.1)
      for (let j = -n; j < n; j++) for (let i = -n; i < n; i++) { ctx.fillStyle = j === -n || i === -n ? ct : cf; ctx.fillRect(bx + i * PX, by + j * PX, PX, PX); }
      ctx.fillStyle = mix(ct, "#ffffff", 0.25); for (let i = -n + 1; i <= n; i++) ctx.fillRect(bx + i * PX, by - (n + 1) * PX, PX, PX);
      ctx.fillStyle = cs; for (let j = -n; j < n; j++) ctx.fillRect(bx + n * PX, by + j * PX, PX, PX);
      light(x, y, 16, c, 0.35);
      glyph(r.d.letter, bx, by, 13, c);              // lettera al centro della faccia davanti
    }
  },
  bubble(o) {                                    // ranger Gamma · bolla di sapone; HD-2D: cerchio a pixel iridescente, riflesso e luce energy
    const k = Math.min(1, o.age / 0.3, (RV.gammaLife - o.age) / 0.6), r = 9 + Math.sin(o.age * 3 + o.seed) * 0.8, y = o.y + Math.sin(o.age * 1.7 + o.seed) * 2;
    light(o.x, y, 18, TYPES.energy.color, 0.35 * k);
    const cols = ["#7ff6ff", "#ff9be6", "#ffe14d"];
    for (let i = 0; i < 3; i++) pxEllipse(o.x, y, r, r, cols[i], 0.8 * k, o.age + i * 2.1, o.age + i * 2.1 + 2.1);
    pxDot(o.x - r * 0.4, y - r * 0.45, "#ffffff", 0.9 * k); ctx.globalAlpha = 1;
  },
  hiveDrone(o) {                                 // Hive · drone esagonale (arancione quando è kamikaze); HD-2D: sprite che cresce col livello, ali che sbattono
    const c = o.kami > 0 ? "#ff7a3d" : TYPES.force.color, P = ramp(c), n = 3 + o.lvl;
    const sp = procSprite("hiveDrone:" + c + ":" + o.lvl, n * 2 + 1, n * 2 + 1, (i, j) => {
      const dx = i - n, dy = j - n; if (Math.abs(dx) + Math.abs(dy) * 0.6 > n || Math.abs(dy) > n * 0.9) return null;
      if (Math.abs(dx) <= 0.6 && Math.abs(dy) <= 0.6) return "#120c26";
      return dx + dy < -n * 0.4 ? P[5] : dx + dy < 0 ? P[4] : dx + dy < n * 0.5 ? P[3] : P[2];
    });
    if (Math.floor(clock * 20) % 2) { pxDot(o.x - n * PX - PX, o.y - PX, "#e8e0ff", 0.8); pxDot(o.x + n * PX + PX, o.y - PX, "#e8e0ff", 0.8); ctx.globalAlpha = 1; }
    blit(sp, o.x, o.y, n + 1, n + 1);
    light(o.x, o.y, 12 + o.lvl * 3, c, 0.55);
  },
  hiveBeam(o, e) {                               // combo Droni a raggio · raggio nel colore del livello del drone; HD-2D: fascio con alone
    const c = ["#b07cff", "#d9a4ff", "#ff9be6"][o.lvl - 1], k = clamp(o.ray.t / 0.3, 0, 1);
    hdBeam(o.x, o.y, e.x, e.y, c, 1.4 + o.lvl * 0.5, k); light(e.x, e.y, 14 + o.lvl * 3, c, 0.6 * k);
  },
  hiveSparks(o) {                                // combo Droni statici · scintille elettriche; HD-2D: pixel gialli che saltano attorno al drone
    const t = clock, r = 8 + o.lvl;
    for (let j = 0; j < 5; j++) {
      const a = t * (j % 2 ? 7 : -6) + j * 1.26, d = r + 4 * Math.abs(Math.sin(t * 29 + j * 2));
      pxDot(o.x + Math.cos(a) * d, o.y + Math.sin(a) * d, j % 2 ? "#fff6b0" : TYPES.electric.color, 0.5 + 0.5 * Math.abs(Math.sin(t * 23 + j)));
    }
    ctx.globalAlpha = 1; light(o.x, o.y, r * 2, TYPES.electric.color, 0.35);
  },
  railShot(o, a) {                               // Railgun · proiettile a punta con una scia corta; HD-2D: sprite ruotato, scia a pixel, luce fredda
    const ca = Math.cos(a), sa = Math.sin(a), x = o.x, y = o.y;
    for (let i = 1; i <= 4; i++) pxDot(x - ca * (4 + i * 4), y - sa * (4 + i * 4), i < 2 ? "#ffffff" : TYPES.physical.color, 0.7 - i * 0.15);
    ctx.globalAlpha = 1;
    const sp = gridSprite("railShot", ["kkkk...", "kdeeewk", "kkkk..."], turretPal(TYPES.physical.color));
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.imageSmoothingEnabled = false; ctx.drawImage(sp, -5 * PX, -1.5 * PX, sp.width * PX, sp.height * PX); ctx.imageSmoothingEnabled = true; ctx.restore();
    light(x, y, 18, "#bfe6ff", 0.7);
  },
  teslaBall(o) { ballLightning(o.x, o.y, 6, o.age); },   // Teslacoil · fulmine globulare in volo (HD-2D: a pixel)
  vortex(o, R) {                                 // Gravity Vortex Gun · buco nero; HD-2D: nucleo nero, anello di materia a pixel che spiraleggia dentro, luce viola
    const c = TYPES.force.color;
    disc(o.x, o.y, R, "#1a0b3a", 0.3);
    for (let k = 0; k < 26; k++) {
      const t = ((o.spin * 0.12 + k / 26) % 1 + 1) % 1, an = o.spin * (1 + t) + k * 2.4, rr = R * (1 - t * 0.85);
      pxDot(o.x + Math.cos(an) * rr, o.y + Math.sin(an) * rr * 0.9, t > 0.7 ? "#ffffff" : k % 3 ? c : "#ff9be6", 0.35 + 0.65 * t);
    }
    pxEllipse(o.x, o.y, R * 0.42, R * 0.42, "#ffe0ff", 0.8, o.spin * 2, o.spin * 2 + 4.5);
    ctx.globalAlpha = 1;
    blit(procSprite("vortexCore", 7, 7, (i, j) => (Math.hypot(i - 3, j - 3) <= 3.2 ? "#000000" : null), false), o.x, o.y, 3.5, 3.5);
    light(o.x, o.y, R * 2, c, 0.7);
  },
  portals(o, A, rA, B) {                         // Gravity Vortex Gun · varchi ovali: ingresso azzurro (buco nel pavimento), uscita rosa (buco nel soffitto)
    const a = clamp(o.t / 0.6, 0, 1);
    for (const [p, r, c, dir] of [[A, rA, "#7fe8ff", 1], [B, 18, "#ff9bf0", -1]]) {
      const ry = r * PORTAL_FLAT;
      const g = ctx.createRadialGradient(p.x, p.y + dir * ry * 0.3, 0, p.x, p.y, r);   // fondo scuro spostato verso la parete lontana: profondità
      g.addColorStop(0, "#000000"); g.addColorStop(0.7, "#0a0f22"); g.addColorStop(1, c);
      ctx.globalAlpha = 0.85 * a; ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(p.x, p.y, r, ry, 0, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = c; ctx.lineWidth = 1;
      for (let i = 1; i <= 3; i++) {             // anelli interni che scendono nel buco (salgono per l’uscita) e ruotano
        const k = 1 - i * 0.22, ph = (clock * 0.8 + i * 0.33) % 1;
        ctx.globalAlpha = 0.5 * a * (1 - ph * 0.5);
        ctx.beginPath(); ctx.ellipse(p.x, p.y + dir * ry * (1 - k) * 0.9, r * k, ry * k, 0, clock * 3 * dir + i, clock * 3 * dir + i + 4.2); ctx.stroke();
      }
      ctx.globalAlpha = a; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(p.x, p.y, r, ry, 0, 0, 6.2832); ctx.stroke();
      ctx.globalAlpha = 0.35 * a; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(p.x, p.y, r, ry, 0, dir > 0 ? 0 : Math.PI, dir > 0 ? Math.PI : 6.2832); ctx.stroke();   // bordo vicino più spesso
      for (let k = 0; k < 6; k++) {               // HD-2D: scintille a pixel che girano sul bordo e la luce del varco
        const t = clock * 1.6 * dir + k / 6 * 6.2832;
        ctx.globalAlpha = a * (0.5 + 0.5 * Math.sin(t * 3)); ctx.fillStyle = k % 2 ? "#ffffff" : c;
        ctx.fillRect(Math.round((p.x + Math.cos(t) * r * 1.08) / PX) * PX, Math.round((p.y + Math.sin(t) * ry * 1.15 - 2) / PX) * PX, PX, PX);
      }
      ctx.globalAlpha = 1; light(p.x, p.y, r * 2.2, c, 0.6 * a);
    }
  },
  guardBullet(o, charged, clone, fan, frag, tint) {   // guardiano · tracciante corto (il colpo caricato è più grande, con l’alone elettrico; tint = colore del tipo con le combo fuoco/force)
    if (charged) disc(o.x, o.y, 6, TYPES.electric.color, 0.35);
    ctx.globalAlpha = clone ? 0.6 : 1;
    ctx.strokeStyle = charged ? "#fff6b0" : tint || TYPES.physical.color; ctx.lineWidth = charged ? 3.4 : fan || frag ? 1.4 : 2.2; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(o.x - o.vx * (charged ? 12 : 7), o.y - o.vy * (charged ? 12 : 7)); ctx.lineTo(o.x, o.y); ctx.stroke();
    ctx.globalAlpha = 1;
    if (!fan && !frag) light(o.x, o.y, charged ? 20 : 9, charged ? "#fff6b0" : tint || TYPES.physical.color, clone ? 0.25 : 0.45);   // HD-2D: ogni colpo illumina
  },
  domeWave(o) {                                  // barriera · Repulsiva: onda d’urto su metà cupola (o.side −1 sinistra, 1 destra); HD-2D: tre fasce di pixel
    const k = 1 - o.t / 0.6, a0 = o.side < 0 ? Math.PI : Math.PI * 1.5, a = clamp(o.t / 0.6, 0, 1);
    for (let i = 0; i < 3; i++) pxEllipse(DOME.cx, DOME.cy, DOME.rx + 6 + 60 * k - i * 4, DOME.ry + 6 + 60 * k - i * 4, i ? "#b07cff" : "#e6d4ff", a * (1 - i * 0.3), a0, a0 + Math.PI / 2);
    ctx.globalAlpha = 1;
    for (let i = 0; i < 4; i++) { const t = a0 + (i + 0.5) * Math.PI / 8; light(DOME.cx + Math.cos(t) * (DOME.rx + 60 * k), DOME.cy + Math.sin(t) * (DOME.ry + 60 * k), 30, "#b07cff", 0.5 * a); }
  },
  domeGas(h, t) {                                // barriera · Congelante: fascia di gas alta h sopra il bordo; HD-2D: velo a retino e fiocchi a pixel
    const a = clamp(t, 0, 1);
    ctx.globalAlpha = 0.16 * a;
    ctx.beginPath(); ctx.ellipse(DOME.cx, DOME.cy, DOME.rx + h, DOME.ry + h, 0, Math.PI, Math.PI * 2); ctx.ellipse(DOME.cx, DOME.cy, DOME.rx, DOME.ry, 0, Math.PI * 2, Math.PI, true);
    ctx.fillStyle = "#9fe8ff"; ctx.fill();
    for (let i = 0; i < 4; i++) pxEllipse(DOME.cx, DOME.cy, DOME.rx + h * (i + 1) / 5, DOME.ry + h * (i + 1) / 5, "#c8f4ff", 0.22 * a, Math.PI + clock * 0.1 * (i % 2 ? 1 : -1), Math.PI * 2 + clock * 0.1 * (i % 2 ? 1 : -1), 3);
    for (let i = 0; i < 24; i++) {               // fiocchi che salgono piano
      const an = Math.PI * (1.04 + 0.92 * ((i * 0.37) % 1)), r = (((i * 0.61) + clock * 0.15) % 1) * h;
      pxDot(DOME.cx + (DOME.rx + r) * Math.cos(an), DOME.cy + (DOME.ry + r) * Math.sin(an), "#f0fbff", 0.7 * a);
    }
    ctx.globalAlpha = 1;
  },
  domeAura(color) {                              // barriera · bordo di un’abilità attiva; HD-2D: bordo a pixel che pulsa e scintille che corrono
    const p = 0.55 + 0.3 * Math.sin(clock * 8);
    pxEllipse(DOME.cx, DOME.cy, DOME.rx + 3, DOME.ry + 3, color, p, Math.PI, Math.PI * 2);
    for (let i = 0; i < 6; i++) { const t = Math.PI + ((clock * 0.25 + i / 6) % 1) * Math.PI; pxDot(DOME.cx + Math.cos(t) * (DOME.rx + 5), DOME.cy + Math.sin(t) * (DOME.ry + 5), "#ffffff", 0.9); light(DOME.cx + Math.cos(t) * (DOME.rx + 4), DOME.cy + Math.sin(t) * (DOME.ry + 4), 18, color, 0.5); }
    ctx.globalAlpha = 1;
  },
  shieldCount(x, y, n) {                         // barriera · immunità accumulate: scudo con il numero
    blit(gridSprite("shield", ["kkkkkkkkk", "kbwwwwwck", "kbwwwwwck", "kbwwwwwck", "kbwwwwwck", ".kbwwwck.", "..kbwck..", "...kck...", "....k...."],
      { k: OUTLINE, w: "#e8eefc", b: "#ffffff", c: "#7fe8ff" }), x, y, 4.5, 4.5);   // HD-2D: scudo a pixel
    ctx.font = "800 9px system-ui, -apple-system, Segoe UI, Roboto, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#070b16"; ctx.fillText(String(n), x, y - 2);
    light(x, y, 16, "#7fe8ff", 0.4);
  },
});
}
