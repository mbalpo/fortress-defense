"use strict";
/* =====================================================================
   FORTRESS DEFENSE · DISEGNO · PROPOSTA HD-2D (fase 1)
   Copia di app/draw.js con un altro aspetto: pixel art con luci moderne, cielo stellato fino all’orizzonte, ombre a terra. NON è usata dal gioco:
   la carica solo il catalogo alternativo (npm run catalog-hd2d → docs/catalogo-grafico-alternativo.html) e tests/tools/hd2d-shots.js.
   Fase 1: campo di battaglia, Sky Guard, Laser, Gravity Vortex Gun, guardiano, navicella, asteroide, meteora, frammento roccioso,
   missili, Area infuocata, varchi, raggi laser, esplosioni, colpi del guardiano. Fase 2: le altre 8 torrette, cristallo-cometa, nave aliena e nave madre.
   Il resto (effetti delle fasi 3-4, stati, HUD, schermate) è ancora il disegno di app/draw.js.
   Tutto quello che si vede sul canvas: primitive (testi, pulsanti, forme), torrette (TURRET_ART), guardiano,
   nemici e indicatori di stato, proiettili ed effetti (FX), HUD, avvisi e schermate (menu, carte, pausa, vittoria, sconfitta).
   Lo usano il gioco (app/index.html) e il catalogo grafico (docs/catalogo-grafico.html, npm run catalog).

   Come si collega: FORTRESS_DRAW non si chiama da sola. Chi la usa ne valuta il testo dentro il proprio ambito
     const DRAW = eval("(" + FORTRESS_DRAW + ")")();
   così le funzioni qui sotto leggono lo stato del gioco (state, slots, enemies, player, clock…) e i dati (TYPES, W, H…)
   come se fossero scritte lì, senza passarli a mano. Di conseguenza: qui solo disegno, nessuna regola di gioco;
   i nomi definiti qui non devono ripetere quelli del gioco; per un elemento nuovo, aggiungilo anche al catalogo.
   Canvas logico 360×640; colore = tipo di danno (TYPES); nessuno sprite, solo forme.
   ===================================================================== */
function FORTRESS_DRAW() {

/* ---------- PRIMITIVE ---------- */
function glow(x1, y1, x2, y2, color, w, a) {
  ctx.lineCap = "round"; ctx.strokeStyle = color;
  ctx.globalAlpha = 0.25 * a; ctx.lineWidth = w * 2.4; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.globalAlpha = 0.95 * a; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.globalAlpha = 1;
}
function disc(x, y, r, color, a) { ctx.globalAlpha = a == null ? 1 : a; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fillStyle = color; ctx.fill(); ctx.globalAlpha = 1; }
function rr(x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function txt(s, x, y, size, color, align, weight) {
  ctx.font = (weight || "600") + " " + size + "px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  ctx.fillStyle = color || "#e8eefc"; ctx.textAlign = align || "left"; ctx.textBaseline = "middle";
  ctx.fillText(s, x, y);
}
// testo che deve stare in maxW: se è più largo il corpo scende fino a 9 px (rete di sicurezza; tests/testi.js controlla i testi delle carte)
function fitTxt(s, x, y, maxW, size, color, align, weight) {
  let z = size; while (z > 9 && tw(s, z, weight) > maxW) z -= 0.5;
  txt(s, x, y, z, color, align, weight);
}
function button(x, y, w, h, label, onTap, opts) {
  opts = opts || {};
  buttons.push({ x, y, w, h, onTap, release: !!opts.release });   // release: si attiva al rilascio sullo stesso pulsante (carte)
  rr(x, y, w, h, 8); ctx.fillStyle = opts.fill || "rgba(18,30,58,0.92)"; ctx.fill();
  ctx.lineWidth = 1.5; ctx.strokeStyle = opts.stroke || "#2c4272"; ctx.stroke();
  if (label) txt(label, x + w / 2, y + h / 2 + 1, opts.size || 13, opts.color || "#e8eefc", "center");
}

function drawDomeFill() {
  const frac = clamp(domeHp / domeMax, 0, 1);
  const g = ctx.createRadialGradient(DOME.cx, DOME.cy, 20, DOME.cx, DOME.cy, DOME.ry);
  g.addColorStop(0, "rgba(63,224,255,0.02)");
  g.addColorStop(1, "rgba(63,224,255," + (0.05 + 0.13 * frac + domeFlash * 0.5) + ")");
  ctx.beginPath(); ctx.ellipse(DOME.cx, DOME.cy, DOME.rx, DOME.ry, 0, Math.PI, Math.PI * 2); ctx.closePath();
  ctx.fillStyle = g; ctx.fill();
}
function drawDomeEdge() {
  const frac = clamp(domeHp / domeMax, 0, 1);
  ctx.beginPath(); ctx.ellipse(DOME.cx, DOME.cy, DOME.rx, DOME.ry, 0, Math.PI, Math.PI * 2);
  ctx.lineWidth = 2 + domeFlash * 8;
  ctx.strokeStyle = frac > 0.35 ? "rgba(127,232,255," + (0.35 + 0.4 * frac + domeFlash) + ")" : "rgba(255,110,110," + (0.5 + domeFlash) + ")";
  ctx.stroke();
  if (AB.gasT > 0) FX.domeGas(AB.gasH, AB.gasT);
  // abilità attive: bordo colorato (riflettente argento, ustionante arancione, potenziante oro, rigenerazione verde)
  const tint = AB.reflectT > 0 ? "#e8eefc" : AB.burnT > 0 ? "#ff8a3d" : AB.powerT > 0 ? "#ffd166" : AB.regenT > 0 ? "#3fe0a0" : null;
  if (tint) FX.domeAura(tint);
}
function drawGround() {                          // HD-2D: piattaforma di lastre metalliche con rivetti e lampade
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
}
// lingua di fuoco: base in (x, y), alta h, larga 2w; arancione fuori, giallo dentro; a = trasparenza
function flame(x, y, h, w, a) {
  const tongue = (hh, ww, c) => { ctx.beginPath(); ctx.moveTo(x - ww, y); ctx.quadraticCurveTo(x - ww * 0.7, y - hh * 0.55, x, y - hh); ctx.quadraticCurveTo(x + ww * 0.7, y - hh * 0.55, x + ww, y);
    ctx.quadraticCurveTo(x, y + ww * 0.8, x - ww, y); ctx.fillStyle = c; ctx.fill(); };
  ctx.globalAlpha = 0.85 * a; tongue(h, w, "#ff6a2a"); ctx.globalAlpha = 0.9 * a; tongue(h * 0.6, w * 0.55, "#ffd166"); ctx.globalAlpha = 1;
}
function poly(pts, fill, stroke, lw) {
  ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1.2; ctx.stroke(); }
}

/* ---------- HD-2D (proposta): pixel art a PX px logici, luci additive, ombre a terra, foschia all’orizzonte ----------
   Gli sprite sono griglie di caratteri (una lettera = un colore della tavolozza) o generati da una funzione (rocce, navicelle);
   si disegnano una volta in un canvas piccolo e poi si ingrandiscono senza smussare. Le luci si raccolgono mentre si disegna il mondo
   e si stendono tutte insieme alla fine (somma additiva); fuori dal mondo (tessere del catalogo) si stendono subito. */
const PX = 2;
const HD = { lights: null, bg: null };
function mkCanvas(w, h) { const c = document.createElement("canvas"); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }
function hexRgb(h) { const n = parseInt(h.slice(1), 16); return h.length === 4 ? [((n >> 8) & 15) * 17, ((n >> 4) & 15) * 17, (n & 15) * 17] : [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function mix(a, b, t) { const A = hexRgb(a), B = hexRgb(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join(""); }
function rgba(h, a) { const c = hexRgb(h); return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")"; }
// rampa di 6 toni dal colore base: ombre fredde (blu-viola), luci calde (crema), come nelle scene HD-2D
function ramp(c) { return [mix(c, "#0c0820", 0.78), mix(c, "#171338", 0.52), mix(c, "#262052", 0.24), c, mix(c, "#fff1d0", 0.38), mix(c, "#fffbea", 0.72)]; }
const OUTLINE = "#0a0716";
const METAL = { a: "#1b2036", b: "#2e3a58", c: "#475a80", d: "#7488ad", e: "#b4c4e0" };
const SPR = new Map();
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
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];            // retino ordinato 4×4 per sfumare tra due toni
const dith = (i, j, v, n) => Math.min(n - 1, Math.floor(v * n + (BAYER[(j & 3) * 4 + (i & 3)] + 0.5) / 16 - 0.5 + 0.5));
const hash2 = (i, j) => { const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return s - Math.floor(s); };
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

/* ---------- fondo: cielo stellato fino all’orizzonte, basso dietro la cupola (disegnato una volta) ----------
   il giocatore guarda l’orizzonte: i nemici precipitano dal cielo verso la fortezza; lontano, creste e piana velate dalla foschia */
const HORIZON = 562;
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

/* ---------- sprite dei nemici: rocce (frammento, asteroide, meteora) e navicella ---------- */
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

/* ---------- sprite a griglia: le 11 torrette e il guardiano ---------- */
// lettere: k contorno · a-e metallo dal più scuro · 1-5 colore del tipo (rampa, 3 = base) · w bianco caldo · y luce gialla · v vuoto · o arancione · n elastico
function turretPal(c) { const P = ramp(c); return Object.assign({ k: OUTLINE, w: "#fffbea", y: "#ffd27a", v: "#0a0418", o: "#ff9a4a", n: "#c9b28a" }, METAL, { 1: P[1], 2: P[2], 3: P[3], 4: P[4], 5: P[5] }); }
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
  aero: [                        // mortaio: canna corta che si allarga in alto, bordo nel colore del tipo
    "................",
    "................",
    "................",
    "kkkkkkkkkkkkkkkk",
    "k54444444443332k",
    "kkkkkkkkkkkkkkkk",
    ".kedddcccccbbbk.",
    ".kedddcccccbbbk.",
    "..kedcccccbbak..",
    "..kedcccccbbak..",
    "...kdccccbbak...",
    "...kkkkkkkkkk...",
    "..kcyccccccybk..",
    ".kdccccccccccbk.",
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
function turretSprite(id, c) { return gridSprite("t:" + id + ":" + c, TURRET_GRID[id], turretPal(c)); }
function hdTurret(id, x, g, c) {
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
  } else hdTurretExtra(id, x, g, c, a);
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
const DISR_DRONE = ["...k...", "..k5k..", ".k453k.", "k45332k", ".k322k.", "..k2k..", "...k..."];
// parti animate delle torrette della fase 2 (droni, sfere, fiamme, api, cariche) e le loro luci
function hdTurretExtra(id, x, g, c, a) {
  if (id === "disr") {
    for (const s of [-1, 1]) {
      const dy = Math.sin(clock * 2.6 + s) * 1.6;
      blit(gridSprite("disrDrone:" + c, DISR_DRONE, turretPal(c)), x + s * 8, g - 21 + dy, 3.5, 3.5);
      light(x + s * 8, g - 21 + dy, 14, c, 0.6 * a);
    }
    light(x, g - 15, 10, c, 0.5 * a);
  } else if (id === "aero") { light(x - 9, g - 7, 8, "#ffd27a", 0.6 * a); light(x + 9, g - 7, 8, "#ffd27a", 0.6 * a); light(x, g - 22, 18, c, 0.3 * a); }
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

/* ---------- nemici della fase 2: cristallo-cometa, nave aliena (mini-boss), nave madre (boss finale) ---------- */
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
function guardPal(f) {
  return f ? { k: OUTLINE, s: "#4a2620", S: "#7a3f2c", H: "#b0643c", t: "#ffb36a", T: "#8a4a32", V: "#ffd166", m: "#3a2a2a", M: "#8c6a5a", G: "#fff6d0", g: "#ffb347", b: "#24141a", L: "#ffd166" }
           : { k: OUTLINE, s: "#1d2a52", S: "#2f4785", H: "#4f6fb8", t: "#d5dce8", T: "#3d5a9a", V: "#7fe8ff", m: "#252c44", M: "#6f7fa6", G: "#ffffff", g: "#7fe8ff", b: "#141a30", L: "#7fe8ff" };
}

// una forma diversa per ogni torretta (x = centro, g = suolo, c = colore del tipo di danno)
const BODY = "#2b3a66", BODY2 = "#44598f", DARK = "#070b16";
const TURRET_ART = {
  sky(x, g, c) { hdTurret("sky", x, g, c); },   // HD-2D: sprite in TURRET_GRID
  laser(x, g, c) { hdTurret("laser", x, g, c); },   // HD-2D: sprite in TURRET_GRID
  disr(x, g, c) { hdTurret("disr", x, g, c); },   // HD-2D: sprite in TURRET_GRID
  aero(x, g, c) { hdTurret("aero", x, g, c); },   // HD-2D: sprite in TURRET_GRID
  thunder(x, g, c) { hdTurret("thunder", x, g, c); },   // HD-2D: sprite in TURRET_GRID
  beam(x, g, c) { hdTurret("beam", x, g, c); },   // HD-2D: sprite in TURRET_GRID
  wheel(x, g, c) { hdTurret("wheel", x, g, c); },   // HD-2D: sprite in TURRET_GRID
  hive(x, g, c) { hdTurret("hive", x, g, c); },   // HD-2D: sprite in TURRET_GRID
  rail(x, g, c) { hdTurret("rail", x, g, c); },   // HD-2D: sprite in TURRET_GRID
  tesla(x, g, c) { hdTurret("tesla", x, g, c); },   // HD-2D: sprite in TURRET_GRID
  vortex(x, g, c) { hdTurret("vortex", x, g, c); },   // HD-2D: sprite in TURRET_GRID
};
function drawTurret(s) {
  TURRET_ART[s.id](s.x, GROUND_Y, TYPES[s.def.type].color);
  txt("L" + s.level + (s.done ? " ★" : " " + s.used + "/3"), s.x, GROUND_Y + 18, 9, s.done ? "#ffd166" : "#9fb4d9", "center", "700");
  const b = BEHAV[s.id]; if (b.draw) b.draw(s);
}
function drawPlayer() {
  if (comboOn(player, "kHive")) { ctx.globalAlpha = 0.45; guardianShape(W - player.x, true); ctx.globalAlpha = 1; }   // Clone speculare (specchiato)
  guardianShape(player.x);
  // livello e carte sotto il guardiano, come per le torrette: segue il guardiano, una riga più in alto delle torrette e nel suo colore
  const p = player;
  txt("L" + p.level + (p.done ? " ★" : " " + p.used + "/3"), clamp(p.x, 16, W - 16), GROUND_Y + 8, 9, p.done ? "#ffd166" : "#e8eefc", "center", "800");
}
// guardiano: soldato futuristico visto di spalle (guarda i nemici), elmetto integrale e tuta spaziale; braccio destro alzato e teso
// che finisce in un cannone cibernetico (la bocca è GUN, da lì partono i colpi), il sinistro piegato che lo afferra. mirror: clone specchiato
function guardianShape(x, mirror) {               // HD-2D: sprite GUARD_GRID (tavolozza blu, arancione in frenesia)
  const f = frenzyOn(player), a = ctx.globalAlpha, d = mirror ? -1 : 1;
  if (!mirror) groundShadow(x + 3, GROUND_Y - 1, 13, 0.45 * a);
  blit(gridSprite("guard:" + (f ? 1 : 0), GUARD_GRID, guardPal(f)), x, GROUND_Y, 9.5, 30, mirror);
  const glowC = f ? "#ffb347" : "#7fe8ff";
  light(x + d * GUN.dx, GROUND_Y + GUN.dy + 1, 16 + 3 * Math.sin(clock * 9), glowC, 0.8 * a);
  light(x, GROUND_Y - 20, 10, glowC, 0.5 * a);
}
// indicatori sopra il nemico: rallentamento, paralisi, indebolimento, vulnerabilità, bruciatura
const STATUS_ICONS = [
  ["slow", (e) => e.slowT > 0, "#b07cff"], ["para", (e) => e.paraT > 0, "#ffe14d"], ["weak", (e) => e.weakT > 0, "#8aa0c8"],
  ["destr", (e) => e.destrN > 0 && e.destrT > 0, "#8aa0c8"],
  ["vuln", (e) => e.vulnT > 0, "#ff4d6d"], ["burn", (e) => e.burnT > 0, "#ff7a3d"],
];
function statusIcon(kind, x, y, c, e) {
  disc(x, y, kind === "destr" ? 7.5 : 6.5, "rgba(7,11,22,0.78)");
  ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = 1.7; ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.beginPath();
  if (kind === "slow") { ctx.moveTo(x - 3.5, y - 2); ctx.lineTo(x, y + 2.5); ctx.lineTo(x + 3.5, y - 2); ctx.stroke(); }
  else if (kind === "para") { ctx.moveTo(x + 1.5, y - 4.5); ctx.lineTo(x - 2.5, y + 0.5); ctx.lineTo(x + 0.5, y + 0.5); ctx.lineTo(x - 1.5, y + 4.5); ctx.lineTo(x + 2.5, y - 0.5); ctx.lineTo(x - 0.5, y - 0.5); ctx.closePath(); ctx.fill(); }
  else if (kind === "weak") { ctx.arc(x, y, 3.8, 0, 6.2832); ctx.moveTo(x - 2, y); ctx.lineTo(x + 2, y); ctx.stroke(); }
  else if (kind === "vuln") { ctx.arc(x, y, 3.2, 0, 6.2832); ctx.moveTo(x, y - 5); ctx.lineTo(x, y + 5); ctx.moveTo(x - 5, y); ctx.lineTo(x + 5, y); ctx.stroke(); }
  else if (kind === "destr") {                   // distruzione: una linea ondulata per pila (fino a 5)
    const n = Math.min(5, e.destrN), sp = n > 3 ? 2.3 : 2.9, y0 = y - (n - 1) * sp / 2;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < n; i++) { const yy = y0 + i * sp; ctx.moveTo(x - 5, yy); for (let k = 1; k <= 8; k++) ctx.lineTo(x - 5 + k * 1.25, yy + Math.sin(k * 1.25) * 1.3); }
    ctx.stroke();
  }
  else { ctx.moveTo(x, y - 4.8); ctx.quadraticCurveTo(x + 4.6, y, x, y + 4.6); ctx.quadraticCurveTo(x - 4.6, y, x, y - 4.8); ctx.fill(); }
}
function drawStatus(e) {
  const act = STATUS_ICONS.filter((t) => t[1](e)); if (!act.length) return;
  const gap = 14, x0 = e.x - (act.length - 1) * gap / 2, y = e.y - e.def.r - 17;
  act.forEach((t, i) => statusIcon(t[0], x0 + i * gap, y, t[2], e));
}
// HD-2D: rocce che ruotano (16 pose, luce fissa), navicella con le luci a turno; la meteora ha la coda di fiamme a pixel
const HD_SHAPE_ID = new WeakMap();
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
// nemici a tema spaziale: il colore resta quello del tipo di danno (serve per le resistenze), cambia la forma
function rockPath(e, r) {
  ctx.beginPath(); const n = e.shape.length;
  for (let i = 0; i < n; i++) { const a = e.rot + i / n * 6.2832, q = r * e.shape[i], px = e.x + Math.cos(a) * q, py = e.y + Math.sin(a) * q; if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
  ctx.closePath();
}
function tail(e, r, len, col) {            // scia dietro al nemico (sopra, perché scende)
  const g = ctx.createLinearGradient(e.x, e.y - r * len, e.x, e.y);
  g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(1, col);
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(e.x - r * 0.75, e.y); ctx.lineTo(e.x, e.y - r * len); ctx.lineTo(e.x + r * 0.75, e.y); ctx.closePath(); ctx.fill();
}
function drawEnemy(e) {
  const c = e.flash > 0 ? "#ffffff" : TYPES[e.def.type].color, r = e.def.r, look = e.def.look || "rock", x = e.x, y = e.y, shade = "rgba(7,11,22,0.38)";
  if (look === "rock" || look === "asteroid" || look === "meteor" || look === "saucer") hdEnemy(e, c, look);   // HD-2D: sprite
  else if (look === "shard" || look === "ship" || look === "mothership") hdEnemy2(e, c, look);
  else if (false) {
    if (look === "meteor") tail(e, r, 2.6, "rgba(255,180,90,0.7)");
    rockPath(e, r); ctx.fillStyle = c; ctx.fill(); ctx.lineWidth = 1.4; ctx.strokeStyle = "rgba(7,11,22,0.6)"; ctx.stroke();
    const cr = look === "asteroid" ? [[-0.3, -0.2, 0.26], [0.34, 0.14, 0.2], [-0.05, 0.42, 0.15]] : [[-0.25, -0.15, 0.24], [0.3, 0.26, 0.16]];
    for (const q of cr) disc(x + q[0] * r, y + q[1] * r, q[2] * r, shade);
  } else if (look === "shard") {               // cristallo-cometa
    tail(e, r, 2.2, "rgba(120,235,255,0.55)");
    poly([[x, y + r * 1.25], [x + r * 0.78, y - r * 0.1], [x, y - r * 1.05], [x - r * 0.78, y - r * 0.1]], c, "rgba(7,11,22,0.6)", 1.3);
    ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y - r * 1.05); ctx.lineTo(x, y + r * 1.25); ctx.moveTo(x - r * 0.78, y - r * 0.1); ctx.lineTo(x + r * 0.78, y - r * 0.1); ctx.stroke();
  } else if (look === "saucer") {              // navicella
    ctx.beginPath(); ctx.ellipse(x, y - r * 0.2, r * 0.6, r * 0.62, 0, Math.PI, 6.2832); ctx.fillStyle = "rgba(223,233,255,0.9)"; ctx.fill();
    ctx.beginPath(); ctx.ellipse(x, y, r * 1.15, r * 0.48, 0, 0, 6.2832); ctx.fillStyle = c; ctx.fill(); ctx.lineWidth = 1.3; ctx.strokeStyle = "rgba(7,11,22,0.6)"; ctx.stroke();
    for (const dx of [-0.6, 0, 0.6]) disc(x + dx * r, y + r * 0.1, r * 0.13, shade);
  } else {                                     // nave aliena (mini-boss) e nave madre (boss finale): contorno dorato
    const w = look === "mothership" ? 1.2 : 1.05;
    if (look === "mothership") for (const sgn of [-1, 1]) poly([[x + sgn * r * 0.9, y - r * 0.35], [x + sgn * r * 1.55, y - r * 0.75], [x + sgn * r * 1.2, y + r * 0.1]], c, "#ffd166", 2);
    poly([[x, y + r], [x + r * w, y - r * 0.15], [x + r * 0.55, y - r * 0.85], [x - r * 0.55, y - r * 0.85], [x - r * w, y - r * 0.15]], c, "#ffd166", 2.6);
    disc(x, y + r * 0.1, r * 0.3, "rgba(7,11,22,0.6)"); disc(x, y + r * 0.1, r * 0.14, "#fff6b0", 0.9);
    for (const dx of [-0.3, 0.3]) disc(x + dx * r, y - r * 0.85, r * 0.13, "#ffd18a");
    for (const dx of [-0.55, 0.55]) disc(x + dx * r, y - r * 0.25, r * 0.1, shade);
  }
  if (e.hp < e.maxHp || e.boss) {
    const w = r * 2, by = y - r * (look === "shard" ? 1.05 : 1) - 8;
    ctx.fillStyle = "rgba(7,11,22,0.8)"; ctx.fillRect(x - r, by, w, 3);
    ctx.fillStyle = TYPES[e.def.type].color; ctx.fillRect(x - r, by, w * clamp(e.hp / e.maxHp, 0, 1), 3);
  }
  drawStatus(e);
}
function drawHud() {
  button(8, 10, 196, 32, "Bersaglio: " + TARGET_LABEL[settings.targeting], toggleTargeting);
  if (state === "play") {
    button(210, 10, 38, 32, "", pauseGame);
    ctx.fillStyle = "#e8eefc"; ctx.fillRect(222, 18, 4, 16); ctx.fillRect(232, 18, 4, 16);
  }
  txt("Ondata " + wave + "/" + N_WAVES, W - 10, 26, 14, "#e8eefc", "right", "700");
  txt("Nemici: " + (queue.length + enemies.length) + "", 10, 62, 12, "#9fb4d9", "left", "500");
  txt("Liv " + campLevel + " · " + MODES[mode].label + (mode === "epic" ? " (diff " + curDiff() + ")" : ""), W - 10, 62, 12, mode === "epic" ? "#ff7a3d" : "#9fb4d9", "right", "600");
  const fb = enemies.find((e) => e.final && !e.dead);
  if (fb) {                                          // boss finale: barra della vita grande, sempre visibile
    txt("BOSS FINALE", W / 2, 94, 11, "#ffd166", "center", "800");
    rr(30, 100, 300, 12, 6); ctx.fillStyle = "rgba(7,11,22,0.85)"; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = "#ffd166"; ctx.stroke();
    const k = clamp(fb.hp / fb.maxHp, 0, 1);
    if (k > 0) { rr(32, 102, 296 * k, 8, 4); ctx.fillStyle = TYPES[fb.def.type].color; ctx.fill(); }
  } else if (enemies.some((e) => e.boss && !e.dead)) txt("MINI-BOSS", W / 2, 62, 12, "#ffd166", "center", "800");
  if (has(player, "frenzy1")) {
    const f = frenzyOn(player), k = f ? clamp(player.st.frenzyT / frenzyDur(player), 0, 1) : (player.st.charge || 0);
    ctx.fillStyle = "rgba(7,11,22,0.8)"; ctx.fillRect(10, 76, 110, 6);
    ctx.fillStyle = f ? "#ff9a5a" : "#7fa0e0"; ctx.fillRect(10, 76, 110 * k, 6);
    txt(f ? (player.st.paused ? "Frenesia in pausa" : "Frenesia!") : (k >= 1 ? "Frenesia pronta" : "Frenesia"), 126, 79, 10, f ? "#ff9a5a" : "#6f82ad", "left", "600");
  }
}
function drawFortress() {
  const y = H - FORT_H;
  ctx.fillStyle = "#101a33"; ctx.fillRect(0, y, W, FORT_H);
  const frac = clamp(domeHp / domeMax, 0, 1);
  ctx.fillStyle = frac > 0.35 ? "#3fe0a0" : "#ff5a5a"; ctx.fillRect(10, y + 9, (W - 20) * frac, 8);
  ctx.strokeStyle = "#2c4272"; ctx.lineWidth = 1; ctx.strokeRect(10, y + 9, W - 20, 8);
  txt("Cupola " + Math.ceil(domeHp) + "/" + domeMax, W / 2, y + 13, 10, "#e8eefc", "center", "700");
  if (domeShield > 0) FX.shieldCount(W - 30, y + 13, domeShield);                // immunità accumulate (Impenetrabile)
}
function dim(a) { ctx.fillStyle = "rgba(7,11,22," + a + ")"; ctx.fillRect(0, 0, W, H); }

/* ---------- PAUSA: riepilogo nemici e costruzione ---------- */
const ENEMY_NAME = { saucer: "Navicella", shard: "Cristallo-cometa", meteor: "Meteora", rock: "Frammento roccioso", asteroid: "Asteroide", ship: "Nave aliena", mothership: "Nave madre" };
const MUTED = "#8a9ac0";
function setFont(size, weight) { ctx.font = (weight || "600") + " " + size + "px system-ui, -apple-system, Segoe UI, Roboto, sans-serif"; }
function tw(str, size, weight) { setFont(size, weight); const m = ctx.measureText(str); return m && typeof m.width === "number" ? m.width : str.length * size * 0.56; }
// testo a pezzi di colori diversi sulla stessa riga: [[testo, colore, dimensione?, peso?], ...]
function segs(parts, x, y, size) {
  for (const [t, c, sz, wt] of parts) { txt(t, x, y, sz || size, c, "left", wt || "600"); x += tw(t, sz || size, wt || "600"); }
}
function wrap(str, maxW, size) {
  const out = []; let line = "";
  for (const w of str.split(" ")) { const t = line ? line + " " + w : w; if (tw(t, size, "500") > maxW && line) { out.push(line); line = w; } else line = t; }
  if (line) out.push(line); return out;
}
const resOf = (type) => ({ res: TYPE_KEYS.filter((t) => RESIST[type][t] < 1), weak: TYPE_KEYS.filter((t) => RESIST[type][t] > 1) });
const typeList = (ts) => ts.flatMap((t, i) => (i ? [[", ", MUTED], [TYPES[t].name, TYPES[t].color]] : [[TYPES[t].name, TYPES[t].color]]));
const ICON_SHAPE = [0.9, 1.0, 0.82, 0.98, 0.88, 1.02, 0.86, 0.95, 0.92];
function enemyIcon(def, x, y, size) {           // disegna il nemico in piccolo, con la stessa grafica del campo
  const e = { def, x: 0, y: 0, hp: 1, maxHp: 1, flash: 0, shape: ICON_SHAPE, rot: 0.4, boss: false };
  const k = size / (def.r * (def.look === "mothership" ? 1.6 : 1.3));
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); drawEnemy(e); ctx.restore();
}
function levelEnemies() {                       // chi arriva davvero in questo livello: ricavato dalle ondate
  const D = curDiff(), kinds = new Map();
  for (let n = 1; n <= N_WAVES; n++)
    for (const g of waveSpec(n, D).groups) if (g.count > 0) { const w = kinds.get(g.enemy) || []; if (!w.includes(n)) w.push(n); kinds.set(g.enemy, w); }
  return {
    kinds: [...kinds.entries()].sort((a, b) => a[1][0] - b[1][0]),
    bosses: hasMiniBosses() ? CAMPAIGN.bossWaves.map((n) => ({ n, def: bossDef(campLevel, n) })) : [],
    fin: hasFinalBoss() ? finalBossDef(campLevel) : null,
  };
}
function unknownRow(y, title, sub) {             // riga "incognita" per chi non hai ancora incontrato
  disc(34, y + 12, 13, "rgba(138,154,192,0.16)");
  ctx.strokeStyle = "#5f7299"; ctx.lineWidth = 1.2; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.arc(34, y + 12, 13, 0, 6.2832); ctx.stroke(); ctx.setLineDash([]);
  txt("?", 34, y + 13, 15, "#8a9ac0", "center", "800");
  txt(title, 62, y + 4, 13, "#8a9ac0", "left", "700");
  txt(sub, 62, y + 21, 10, "#6f82ad", "left", "500");
}
function pauseEnemies() {
  const { kinds, bosses, fin } = levelEnemies(), seen = (key) => progress.seen.includes(key);
  const bossTypes = [...new Set(bosses.map((b) => b.def.type))];           // ogni tipo di mini-boss si scopre a parte
  const all = kinds.length + bossTypes.length + (fin ? 1 : 0);
  const known = kinds.filter(([k]) => seen(ENEMY_DEFS[k].look)).length + bossTypes.filter((t) => seen("ship:" + t)).length + (fin && seen("mothership:" + fin.type) ? 1 : 0);
  let y = 106;
  txt("Livello " + campLevel + " · " + MODES[mode].label + " · difficoltà " + curDiff() + " · scoperti " + known + " su " + all, 16, y, 11, "#9fb4d9", "left", "600"); y += 14;
  txt("Il colore indica il tipo di danno: resiste ×0,5, debole ×1,5", 16, y, 10, "#6f82ad", "left", "500"); y += 18;
  for (const [k, waves] of kinds) {
    const d = ENEMY_DEFS[k], r = resOf(d.type);
    if (!seen(d.look)) { unknownRow(y, "Nemico sconosciuto", "Lo scoprirai quando entra in campo (dalla " + waves[0] + "ª ondata)"); y += 40; continue; }
    enemyIcon(d, 34, y + 18, 15);
    segs([[ENEMY_NAME[d.look] + "  ", "#e8eefc", 13, "700"], [TYPES[d.type].name, TYPES[d.type].color, 11, "700"]], 62, y + 4, 13);
    segs([["Resiste a ", MUTED], ...typeList(r.res), ["  ·  Debole a ", MUTED], ...typeList(r.weak)], 62, y + 21, 11);
    txt("In " + waves.length + " ondate su " + N_WAVES + ", dalla " + waves[0] + "ª", 62, y + 36, 10, "#6f82ad", "left", "500");
    y += 47;
  }
  const bossLine = (n, d, yy) => {             // due righe corte: tipo e debolezza, poi resistenze
    const r = resOf(d.type);
    segs([[(n ? "Ondata " + n + ": " : ""), MUTED], [TYPES[d.type].name, TYPES[d.type].color, 11, "700"], ["  ·  debole a ", MUTED], ...typeList(r.weak)], 62, yy, 11);
    segs([["Resiste a ", "#6f82ad"], ...typeList(r.res), [" · spinte " + Math.round(d.kbRes * 100) + "% · stati " + Math.round(d.statRes * 100) + "%", "#6f82ad"]], 62, yy + 14, 10);
  };
  const knownBoss = bosses.find((b) => seen("ship:" + b.def.type));
  if (bosses.length && !knownBoss) { y += 4; unknownRow(y, "Mini-boss sconosciuti", "Ondate " + CAMPAIGN.bossWaves.join(", ") + " · li scoprirai quando entrano in campo"); y += 40; }
  else if (bosses.length) {
    y += 4; enemyIcon(knownBoss.def, 34, y + 14, 16);
    txt("Mini-boss · nave aliena", 62, y + 4, 13, "#ffd166", "left", "700"); y += 20;
    for (const b of bosses) {
      if (seen("ship:" + b.def.type)) { bossLine(b.n, b.def, y); y += 30; }
      else { segs([["Ondata " + b.n + ": ", MUTED], ["tipo sconosciuto", "#8a9ac0", 11, "700"]], 62, y, 11); y += 18; }
    }
    txt("Immuni a paralisi, attrazione e teletrasporto", 62, y, 10, "#ffd166", "left", "500"); y += 18;
  }
  if (fin && !seen("mothership:" + fin.type)) unknownRow(y, "Boss finale sconosciuto", "Ondata " + N_WAVES + " · lo scoprirai quando entra in campo");
  else if (fin) {
    enemyIcon(fin, 34, y + 14, 16);
    txt("Boss finale · nave madre (ondata " + N_WAVES + ")", 62, y + 4, 13, "#ffd166", "left", "700"); y += 20;
    bossLine(0, fin, y); y += 30;
    txt("Immune a paralisi, attrazione e teletrasporto", 62, y, 10, "#ffd166", "left", "500");
  }
}
function drawAlert() {                           // avviso "nuovo nemico" sotto la barra in alto
  const a = alerts[0]; if (!a) return;
  const x = 16, y = 120, w = W - 32, h = 56, d = a.def, r = resOf(d.type), c = TYPES[d.type].color;
  rr(x, y, w, h, 10); ctx.fillStyle = "rgba(10,16,32,0.95)"; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = "#ffd166"; ctx.stroke();
  enemyIcon(d, x + 26, y + h / 2, 16);
  segs([["Nuovo nemico: ", "#ffd166", 12, "800"], [ENEMY_NAME[d.look] + (d.final ? " (boss finale)" : d.boss ? " (mini-boss)" : ""), "#e8eefc", 12, "800"]], x + 52, y + 15, 12);
  segs([[TYPES[d.type].name, c, 11, "700"], ["  ·  debole a ", MUTED], ...typeList(r.weak)], x + 52, y + 31, 11);
  segs([["Resiste a ", "#6f82ad"], ...typeList(r.res), [" · dettagli nella pausa", "#6f82ad"]], x + 52, y + 46, 10);
}
function upText(s) {
  const parts = [];
  for (const u of s.def.ups) {
    const n = N(s, u.id); if (!n) continue;
    parts.push(u.name + (n > 1 ? " ×" + n : "") + (u.cat === "chain" ? " (chain lv" + u.lv + ")" : u.cat === "lu" ? " (level up)" : u.cat === "combo" ? " (combo)" : ""));
  }
  return parts.length ? parts.join(", ") : "nessun potenziamento";
}
function pauseBuild() {
  let y = 106;
  txt("Ondata " + wave + "/" + N_WAVES + " · Cupola " + Math.ceil(domeHp) + "/" + domeMax + " · torri fino al lv " + towerCap(), 16, y, 11, "#9fb4d9", "left", "600"); y += 14;
  txt("Bersaglio: " + TARGET_LABEL[settings.targeting], 16, y, 11, "#9fb4d9", "left", "600"); y += 20;
  const list = [player, ...slots.filter(Boolean)];
  let size = 11, rows;
  for (size of [11, 10, 9]) {                    // se non ci sta, rimpicciolisce il testo
    rows = list.map((s) => wrap(upText(s), W - 40, size));
    if (rows.reduce((a, r) => a + 22 + r.length * (size + 3) + 6, 0) <= 560 - y) break;
  }
  list.forEach((s, i) => {
    const c = TYPES[s.def.type].color;
    segs([[s.def.name, c, 13, "700"], ["   " + (s.done ? "★ al massimo" : "livello " + s.level + " · " + s.used + "/3"), s.done ? "#ffd166" : MUTED, 11, "600"]], 20, y + 4, 13);
    y += 20;
    rows[i].forEach((l) => { txt(l, 20, y, size, "#b9c8e6", "left", "500"); y += size + 3; });
    y += 8;
  });
  const free = slots.filter((t) => !t).length;
  txt(free ? "Slot liberi: " + free + " di 4" : "Tutti e 4 gli slot sono occupati", 20, y + 2, 11, "#6f82ad", "left", "500");
}
function pauseScreen() {
  buttons = [];                                  // in pausa i pulsanti del campo di battaglia non sono attivi
  dim(0.92);
  txt("PAUSA", W / 2, 32, 20, "#e8eefc", "center", "800");
  [["enemies", "Nemici del livello"], ["build", "Torri e potenziamenti"]].forEach(([id, label], i) => {
    const on = pauseTab === id;
    button(16 + i * 168, 52, 160, 34, label, () => { pauseTab = id; pauseQuit = false; },
      { size: 12, fill: on ? "rgba(63,224,160,0.18)" : "rgba(18,30,58,0.92)", stroke: on ? "#3fe0a0" : "#2c4272", color: on ? "#e8eefc" : "#9fb4d9" });
  });
  if (pauseTab === "enemies") pauseEnemies(); else pauseBuild();
  button(16, 584, 208, 44, "Riprendi", resumeGame, { size: 16, stroke: "#3fe0a0" });
  button(232, 584, 112, 44, pauseQuit ? "Tocca di nuovo" : "Abbandona", () => { if (pauseQuit) toMenu(); else pauseQuit = true; },
    { size: pauseQuit ? 11 : 13, stroke: "#ff7a3d" });
}

function overlay(title, lines, color, y0) {
  dim(0.78);
  txt(title, W / 2, y0 || 190, 30, color || "#e8eefc", "center", "800");
  lines.forEach((l, i) => txt(l, W / 2, (y0 || 190) + 48 + i * 22, 14, "#9fb4d9", "center", "500"));
}
function menuScreen() {
  dim(0.8);
  txt("FORTRESS DEFENSE", W / 2, 70, 28, "#e8eefc", "center", "800");
  txt("Livelli completati: " + progress.cleared + " · torri fino al lv " + towerCap(), W / 2, 104, 12, "#9fb4d9", "center", "500");
  button(36, 130, 56, 56, "−", () => { selLevel = Math.max(1, selLevel - 1); }, { size: 26 });
  button(268, 130, 56, 56, "+", () => { selLevel = Math.min(maxSelectable(), selLevel + 1); }, { size: 26 });
  button(100, 128, 160, 60, "", openLevels, { fill: "rgba(18,30,58,0.6)", stroke: "#2c4272" });   // tocco: griglia dei livelli (1.12.3)
  txt("Livello " + selLevel + " ▦", W / 2, 150, 22, "#e8eefc", "center", "800");
  txt("difficoltà " + diffOf(selLevel, false) + (epicUnlocked() ? " · Epica " + diffOf(selLevel, true) : ""), W / 2, 176, 11, "#6f82ad", "center", "500");
  txt("Il guardiano spara da solo. Tenendo premuto segue il dito:", W / 2, 208, 11, "#6f82ad", "center", "500");
  txt("colpisce il nemico nel mirino, altrimenti spara in alto", W / 2, 224, 11, "#6f82ad", "center", "500");
  button(60, 254, 240, 46, "Standard", () => startRun("standard"), { size: 16, stroke: "#3fe0a0" });
  const eu = epicUnlocked();
  button(60, 306, 240, 46, eu ? "Epica (difficoltà +" + CAMPAIGN.epicOffset + ")" : "Epica · si sblocca al livello " + CAMPAIGN.epicUnlock,
    () => { if (eu) startRun("epic"); }, { size: eu ? 16 : 12, stroke: eu ? "#ff7a3d" : "#2c3a5f", color: eu ? "#e8eefc" : "#6f82ad" });
  const to = treeOpen(), go = gearOpen();
  button(60, 358, 116, 36, to ? "Albero " + progress.seals + "◆" + (progress.majors ? " " + progress.majors + "✦" : "") : "Albero · liv " + CAMPAIGN.sealsFrom, openTree,
    { size: to ? 13 : 12, stroke: to ? "#c9a2ff" : "#2c3a5f", color: to ? "#e8eefc" : "#6f82ad" });
  button(184, 358, 116, 36, go ? "Equipaggiamento" : "Equip. · liv " + CAMPAIGN.equipUnlock, openGear,
    { size: go ? 11 : 12, stroke: go ? "#7fa0e0" : "#2c3a5f", color: go ? "#e8eefc" : "#6f82ad" });
  const rows = [["Torri e guardiano al livello 2", 10], ["Torri e guardiano al livello 3", 20], ["Equipaggiamento del guardiano", CAMPAIGN.equipUnlock],
    ["Sigilli e albero dei potenziamenti", CAMPAIGN.sealsFrom], ["Abilità della barriera", CAMPAIGN.barrierUnlock], ["Modalità Epica", CAMPAIGN.epicUnlock]];
  txt("Sblocchi (a fine livello)", 36, 412, 12, "#9fb4d9", "left", "700");
  rows.forEach(([t, n], i) => txt((progress.cleared >= n ? "✓ " : "· ") + "Liv " + n + " — " + t, 36, 430 + i * 17, 12, progress.cleared >= n ? "#3fe0a0" : "#6f82ad", "left", "500"));
  txt("Mini-boss: ondate 5, 10, 15 dal livello 11 (Epica: sempre)", 36, 532, 10, "#ffd166", "left", "500");
  txt("Boss finale all’ondata 20 dei livelli 10, 20, 30…", 36, 546, 10, "#ffd166", "left", "500");
  button(60, 562, 154, 36, "Salvataggio", openSave, { size: 13, stroke: "#7fa0e0" });
  button(220, 562, 80, 36, "Guida", openGuide, { size: 13, stroke: "#3fe0a0" });
  txt("Invio = Standard · E = Epica · ←/→ = livello", W / 2, 614, 11, "#5f7299", "center", "500");
  txt("v" + APP_VERSION, W - 8, 632, 9, "#3a4a70", "right", "500");
}
// riga dei Sigilli nella schermata di vittoria (sealGain lo calcola winLevel)
function sealLines() {
  const mj = majorGain ? ["+" + majorGain + (majorGain === 1 ? " Sigillo maggiore ✦" : " Sigilli maggiori ✦") + " dai boss (" + progress.majors + ")"] : [];
  return [...mj, ...sealLines0()];
}
function sealLines0() {
  const g = sealGain; if (!g || g.why === "none") return [];
  const one = (n) => n + (n === 1 ? " Sigillo" : " Sigilli");
  if (g.why === "first") return ["+" + one(g.got) + " ◆ (" + one(progress.seals) + ")", g.next ? "Rigiocalo con la cupola al 100%: +" + one(g.got) : ""].filter(Boolean);
  if (g.why === "full") return ["Cupola al 100%: +" + one(g.got) + " ◆ (" + one(progress.seals) + ")"];
  if (g.why === "needFull") return ["Sigilli già riscossi: rigiocalo con la cupola al 100%"];
  return ["Sigilli di questo livello già riscossi"];
}
function wonScreen() {
  const sl = sealLines();
  overlay("LIVELLO SUPERATO", ["Livello " + campLevel + " completato" + (mode === "epic" ? " (Epica)" : ""), "Cupola: " + Math.ceil(domeHp) + "/" + domeMax], "#3fe0a0");
  sl.forEach((l, i) => txt(l, W / 2, 282 + i * 18, i ? 11 : 13, i ? "#9fb4d9" : "#c9a2ff", "center", i ? "500" : "700"));
  const gy = 282 + sl.length * 18 - (sl.length ? 6 : 12);                // equipaggiamento preso, sotto i Sigilli
  const dy = (sl.length ? 18 * sl.length + 8 : 0) + gearChips(gy);       // i pulsanti scendono sotto Sigilli e oggetti
  const more = mode === "standard" && campLevel < CAMPAIGN.maxLevel;
  button(60, 300 + dy, 240, 48, more ? "Livello " + (campLevel + 1) : "Rigioca", nextOrRetry, { size: 16, stroke: "#3fe0a0" });
  if (more) button(60, 360 + dy, 240, 48, "Rigioca il livello " + campLevel, retry, { size: 14 });
  button(60, (more ? 420 : 360) + dy, 240, 48, "Menu", toMenu, { size: 14 });
}
function lostScreen() {
  overlay("CUPOLA DISTRUTTA", ["Livello " + campLevel + " · ondata " + wave + " di " + N_WAVES], "#ff5a5a");
  button(60, 300, 240, 48, "Riprova", retry, { size: 16, stroke: "#ff7a3d" });
  button(60, 360, 240, 48, "Menu", toMenu, { size: 14 });
}
function rewardScreen() {
  txt("Ricompensa mini-boss", W / 2, 86, 24, "#ffd166", "center", "800");
  txt("Hai ottenuto " + rewards.length + " potenziamenti", W / 2, 116, 13, "#9fb4d9", "center", "500");
  rewards.forEach((o, i) => {
    const x = 20, y = 140 + i * 122, w = 320, h = 110, c = TYPES[o.type].color;
    rr(x, y, w, h, 8); ctx.fillStyle = "rgba(18,30,58,0.92)"; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = c; ctx.stroke();
    disc(x + 26, y + h / 2, 13, c);
    txt("✓", x + 26, y + h / 2 + 1, 14, "#070b16", "center", "800");
    txt(o.head, x + 52, y + 22, 11, c, "left", "700");
    fitTxt(o.title, x + 52, y + 46, 260, 16, "#e8eefc", "left", "700");
    fitTxt(o.desc, x + 52, y + 70, 260, 12, "#b9c8e6", "left", "500");
    fitTxt(o.note, x + 52, y + 92, 260, 10, "#6f82ad", "left", "500");
  });
  button(60, 140 + rewards.length * 122 + 4, 240, 48, "Continua", () => pick(0), { size: 16, stroke: "#ffd166", release: true });
  button(90, 140 + rewards.length * 122 + 60, 180, 32, "Potenziamenti presi", () => { upBuild = true; cardsShown(); }, { size: 12, stroke: "#9fb4d9", release: true });
}
// potenziamenti presi, aperti dalla scelta delle carte o dalla ricompensa (1.12.3): stessa vista della pausa, poi si torna alle carte
function upBuildScreen() {
  dim(0.94);
  txt("Potenziamenti presi", W / 2, 70, 20, "#e8eefc", "center", "800");
  pauseBuild();
  button(16, 584, 328, 44, "Torna alle carte", () => { upBuild = false; cardsShown(); }, { size: 15, stroke: "#3fe0a0", release: true });   // al rilascio, come le carte (1.12.3)
}
function upgradeScreen() {
  dim(0.84);
  if (upBuild) { upBuildScreen(); return; }
  if (rewards) { rewardScreen(); return; }
  txt(bonusMode ? "Ricompensa mini-boss" : "Ondata " + wave + " superata", W / 2, 86, 24, bonusMode ? "#ffd166" : "#3fe0a0", "center", "800");
  txt("Scegli un potenziamento", W / 2, 116, 13, "#9fb4d9", "center", "500");
  const four = options.length > 3, step = four ? 100 : 122, h = four ? 92 : 110, k = h / 110;   // con 4 carte (Modulo 22) sono più basse
  options.forEach((opt, i) => {
    const x = 20, y = 140 + i * step, w = 320, o = describe(opt), c = TYPES[o.type].color;
    button(x, y, w, h, "", () => pick(i), { stroke: c, release: true });
    disc(x + 26, y + h / 2, 13, c);
    txt(String(i + 1), x + 26, y + h / 2 + 1, 13, "#070b16", "center", "800");
    txt(o.head, x + 52, y + 22 * k, 11, c, "left", "700");
    fitTxt(o.title, x + 52, y + 46 * k, 260, 16, "#e8eefc", "left", "700");
    fitTxt(o.desc, x + 52, y + 70 * k, 260, 12, "#b9c8e6", "left", "500");
    fitTxt(o.note, x + 52, y + 92 * k, 260, 10, "#6f82ad", "left", "500");
  });
  const yb = 140 + options.length * step;
  txt("Torri fino al lv " + towerCap(), W / 2, yb + 12, 11, "#6f82ad", "center", "500");
  const rf = refreshLeft > 0 && !bonusMode;      // Modulo 21: rinnovo; accanto, i potenziamenti presi
  button(rf ? 20 : 90, yb + 26, rf ? 156 : 180, 32, "Potenziamenti presi", () => { upBuild = true; cardsShown(); }, { size: 12, stroke: "#9fb4d9", release: true });
  if (rf) button(184, yb + 26, 156, 32, "Rinnova le carte (" + refreshLeft + ")", refreshCards, { size: 12, stroke: "#7fa0e0", release: true });
}

/* ---------- ALBERO DEI SIGILLI ---------- */
const TREE_TABS = [["player", "Guardiano"], ["turrets", "Torrette"], ["barrier", "Barriera"]];
// costo del prossimo livello: Sigilli maggiori (✦) e normali (◆)
const costLabel = (n) => { const m = nodeMCost(n), c = nodeCost(n); return (m ? m + " ✦" : "") + (m && c ? " + " : "") + (c || !m ? c + " ◆" : ""); };
function treeNodeRow(n, y, x0, w0) {
  const X = x0 || 16, Wd = w0 || 328, R = X + Wd;      // posizione e larghezza della riga
  const st = nodeState(n), L = nodeLv(n), armed = treeArm === n.id, eq = n.kind === "perm" && progress.loadout.includes(n.who);
  const full = st === "max", stroke = full ? (eq ? "#c9a2ff" : "#3fe0a0") : armed ? "#ffd166" : st === "ready" ? "#7fa0e0" : "#2c3a5f";
  button(X, y, Wd, 40, "", () => tapNode(n), { stroke, fill: full ? "rgba(63,224,160,0.10)" : L ? "rgba(63,224,160,0.05)" : "rgba(18,30,58,0.92)" });
  txt(n.name, X + 10, y + 13, 12, st === "req" && !L ? "#6f82ad" : "#e8eefc", "left", "700");
  let sub = n.sub, subC = "#6f82ad";
  if (n.kind === "level" || n.kind === "ability") { sub = !L ? "Livello 1: " + n.fx(1) : n.fx(L) + (full ? "" : " → " + n.fx(L + 1)); subC = L ? "#9fb4d9" : "#6f82ad"; }
  if (armed) { sub = "Tocca di nuovo per spendere " + costLabel(n); subC = "#ffd166"; }
  else if (st === "req") sub = n.kind === "perm" ? "Prima tutti gli sblocchi della torretta" : n.kind === "level" || n.kind === "ability" ? "Prima il nodo “" + TREE_NODE[n.req[0]].name + "” al livello " + (L + 1) : "Prima il nodo sopra";
  else if (full && n.kind === "perm") { sub = eq ? "In campo dall’ondata 1 · tocca per togliere" : "Tocca per equipaggiare (" + progress.loadout.length + "/4)"; subC = eq ? "#c9a2ff" : "#9fb4d9"; }
  fitTxt(sub, X + 10, y + 29, Wd - 20 - tw(costLabel(n), 12, "700") - 8, 10, subC, "left", "500");
  if (n.max > 1) txt(L + "/" + n.max, R - 44, y + 13, 10, L ? "#3fe0a0" : "#6f82ad", "right", "700");
  if (full) txt("✓", R - 12, y + 20, 15, "#3fe0a0", "right", "800");
  else txt(costLabel(n), R - 10, y + (n.max > 1 ? 29 : 20), 12, st === "poor" ? "#ff7a7a" : st === "req" ? "#6f82ad" : nodeMCost(n) ? "#ffd166" : "#c9a2ff", "right", "700");
}
function treeScreen() {
  dim(0.92);
  button(8, 8, 62, 30, "‹ Menu", closeTree, { size: 12 });
  txt("ALBERO DEI SIGILLI", W / 2 + 22, 18, 16, "#e8eefc", "center", "800");
  txt("◆ " + progress.seals + (progress.seals === 1 ? " Sigillo" : " Sigilli") + " · ✦ " + progress.majors + (progress.majors === 1 ? " maggiore" : " maggiori") + " da spendere", W / 2 + 22, 36, 11, "#c9a2ff", "center", "700");
  TREE_TABS.forEach(([id, label], i) => {
    const on = treeTab === id;
    button(16 + i * 112, 50, 104, 30, label, () => { treeTab = id; treeArm = null; },
      { size: 12, fill: on ? "rgba(201,162,255,0.18)" : "rgba(18,30,58,0.92)", stroke: on ? "#c9a2ff" : "#2c4272", color: on ? "#e8eefc" : "#9fb4d9" });
  });
  // righe alte 40 a passo 45; se non stanno nello schermo (10 nodi per torretta) il passo si stringe fino a far finire l’ultima a 636
  const rows = (list, y0) => { const step = Math.min(45, (636 - 40 - y0) / Math.max(1, list.length - 1)); list.forEach((n, i) => treeNodeRow(n, y0 + i * step)); };
  if (treeTab === "player") {
    txt("Guardiano · sblocchi e carte standard", 16, 98, 12, "#9fb4d9", "left", "700");
    rows(TREE.player, 112);
  } else if (treeTab === "turrets") {
    [...TURRET_ORDER, "types"].forEach((id, i) => {
      const x = 12 + (i % 6) * 56, y = 88 + Math.floor(i / 6) * 48, on = treeSel === id, nodes = TREE[id];
      const c = id === "types" ? "#c9a2ff" : TYPES[TURRETS[id].type].color, own = nodes.reduce((a, n) => a + nodeLv(n), 0), all = nodes.reduce((a, n) => a + n.max, 0);
      button(x, y, 52, 44, "", () => { treeSel = id; treeArm = null; }, { stroke: on ? c : "#2c4272", fill: on ? "rgba(201,162,255,0.12)" : "rgba(18,30,58,0.92)" });
      if (id === "types") txt("Tipi", x + 26, y + 17, 12, "#c9a2ff", "center", "800");
      else { ctx.save(); ctx.beginPath(); ctx.rect(x + 2, y + 2, 48, 32); ctx.clip(); TURRET_ART[id](x + 26, y + 32, c); ctx.restore(); }
      txt(progress.loadout.includes(id) ? "in campo" : own + "/" + all, x + 26, y + 38, 9, progress.loadout.includes(id) ? "#c9a2ff" : own ? "#e8eefc" : "#6f82ad", "center", "700");
    });
    if (treeSel === "types") { txt("Sezione condivisa · solo torrette", 16, 198, 13, "#c9a2ff", "left", "800"); rows(TREE.types, 212); }
    else {
      const d = TURRETS[treeSel];
      txt(d.name, 16, 198, 13, TYPES[d.type].color, "left", "800");
      txt("Equipaggiate " + progress.loadout.length + "/4", 344, 198, 11, "#9fb4d9", "right", "600");
      rows(TREE[treeSel], 212);
    }
  } else {
    [["nodes", "Potenziamenti"], ["abilities", "Abilità"]].forEach(([id, label], i) => {
      const on = barrierTab === id;
      button(16 + i * 168, 88, 160, 26, label, () => { barrierTab = id; treeArm = null; },
        { size: 11, fill: on ? "rgba(201,162,255,0.14)" : "rgba(18,30,58,0.92)", stroke: on ? "#c9a2ff" : "#2c4272", color: on ? "#e8eefc" : "#9fb4d9" });
    });
    if (barrierTab === "nodes") {
      txt("Vita % → Riduzione danno → rami", 16, 128, 12, "#9fb4d9", "left", "700");
      rows(TREE.barrier, 140);
      txt("Tetti sul totale: danno subito −" + pctS(TREE_CAP.red) + ", cooldown −" + pctS(TREE_CAP.abCd) + ".", 16, 140 + TREE.barrier.length * 45 + 8, 10, "#6f82ad", "left", "500");
    } else treeAbilities();
  }
}
// abilità della barriera: tre gruppi, un pallino per equipaggiare (una per gruppo), la riga per comprare i livelli
function treeAbilities() {
  const open = abilitiesOpen(), eq = equippedAbilities();
  txt(open ? "Una abilità per gruppo · tocca il pallino per equipaggiarla" : "Si equipaggiano completando il livello " + CAMPAIGN.barrierUnlock, 16, 128, 11, open ? "#9fb4d9" : "#ff9a5a", "left", "600");
  let y = 140;
  AB_GROUPS.forEach(([g, label, ids]) => {
    txt(label, 16, y + 8, 12, "#c9a2ff", "left", "800"); y += 18;
    ids.forEach((id) => {
      const n = TREE_NODE["ab:" + id], on = eq[g] === id, can = open && nodeLv(n) > 0;
      button(16, y, 30, 40, "", () => { if (can) equipAbility(id); treeArm = null; }, { stroke: on ? "#c9a2ff" : "#2c4272" });
      disc(31, y + 20, 7, on ? "#c9a2ff" : can ? "#2c4272" : "#18233f");
      if (on) disc(31, y + 20, 3.5, "#070b16");
      treeNodeRow(n, y, 50, 294);
      y += 44;
    });
    y += 4;
  });
}

/* ---------- EQUIPAGGIAMENTO ---------- */
// colore della rarità: pieno, l’ancestrale iridescente (la tinta gira col tempo)
const rarColor = (r) => r === 4 ? "hsl(" + Math.round((clock * 90) % 360) + ",85%,70%)" : RARITY[r].color;
const RAR_SHORT = ["Comune", "Raro", "Epico", "Legg.", "Ancest."];
// icone dei pezzi (disegno originale, sagome semplici): centro (x, y), lato s, colore c della rarità
const PIECE_ART = {
  arma(x, y, s, c) {               // cannone del guardiano: canna obliqua, bocca luminosa, impugnatura
    const k = s / 20;
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.7);
    rr(-9 * k, -2.6 * k, 16 * k, 5.2 * k, 2 * k); ctx.fillStyle = BODY2; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = c; ctx.stroke();
    disc(8 * k, 0, 2.6 * k, c);
    rr(-6 * k, 1.5 * k, 4 * k, 6 * k, 1.5 * k); ctx.fillStyle = BODY; ctx.fill(); ctx.stroke();
    ctx.restore();
  },
  guanti(x, y, s, c) {             // guanto: palmo, quattro dita, pollice
    const k = s / 20;
    for (let i = 0; i < 4; i++) { rr(x + (-6 + i * 3.2) * k, y - 9 * k, 2.6 * k, 7 * k, 1.2 * k); ctx.fillStyle = BODY2; ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = c; ctx.stroke(); }
    rr(x - 6.5 * k, y - 3 * k, 12.5 * k, 10 * k, 3 * k); ctx.fillStyle = BODY2; ctx.fill(); ctx.lineWidth = 1.2; ctx.stroke();
    poly([[x + 6 * k, y - 1 * k], [x + 9.5 * k, y - 4 * k], [x + 10 * k, y - 1 * k], [x + 6 * k, y + 3 * k]], BODY2, c, 1);
    ctx.fillStyle = c; ctx.fillRect(x - 6.5 * k, y + 4 * k, 12.5 * k, 1.6 * k);
  },
  testa(x, y, s, c) {              // elmetto integrale con visore e antenna
    const k = s / 20;
    ctx.beginPath(); ctx.arc(x, y + 2 * k, 9 * k, Math.PI, 0); ctx.lineTo(x + 9 * k, y + 6 * k); ctx.lineTo(x - 9 * k, y + 6 * k); ctx.closePath();
    ctx.fillStyle = BODY2; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = c; ctx.stroke();
    rr(x - 6.5 * k, y - 1 * k, 13 * k, 3.6 * k, 1.8 * k); ctx.fillStyle = c; ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 4 * k, y - 6 * k); ctx.lineTo(x + 6.5 * k, y - 10 * k); ctx.lineWidth = 1; ctx.stroke(); disc(x + 6.5 * k, y - 10 * k, 1.2 * k, c);
  },
  armatura(x, y, s, c) {           // corazza: piastra a scudo con spalle e linea centrale
    const k = s / 20;
    poly([[x - 9 * k, y - 7 * k], [x - 3 * k, y - 9 * k], [x, y - 6 * k], [x + 3 * k, y - 9 * k], [x + 9 * k, y - 7 * k], [x + 7 * k, y + 3 * k], [x, y + 9 * k], [x - 7 * k, y + 3 * k]], BODY2, c, 1.2);
    ctx.beginPath(); ctx.moveTo(x, y - 5 * k); ctx.lineTo(x, y + 7 * k); ctx.lineWidth = 1; ctx.strokeStyle = c; ctx.stroke();
    disc(x, y - 1 * k, 2 * k, c);
  },
  stivali(x, y, s, c) {            // stivale: gambale, piede, suola
    const k = s / 20;
    poly([[x - 5 * k, y - 9 * k], [x + 2 * k, y - 9 * k], [x + 2 * k, y + 1 * k], [x + 9 * k, y + 3 * k], [x + 9 * k, y + 7 * k], [x - 5 * k, y + 7 * k]], BODY2, c, 1.2);
    ctx.fillStyle = c; ctx.fillRect(x - 5 * k, y + 7 * k, 14 * k, 2 * k); ctx.fillRect(x - 5 * k, y - 5 * k, 7 * k, 1.4 * k);
  },
  nucleo(x, y, s, c) {             // nucleo: esagono con sfera di energia
    const k = s / 20, pts = [];
    for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3; pts.push([x + Math.cos(a) * 9 * k, y + Math.sin(a) * 9 * k]); }
    poly(pts, BODY, c, 1.2);
    disc(x, y, 5 * k, c, 0.35); disc(x, y, 3 * k, c);
  },
};
function pieceIcon(id, x, y, s, c) { PIECE_ART[id](x, y, s, c); }
// icona del Modulo: chip quadrato con i piedini e il nucleo del colore della rarità; la lettera dice il pezzo
function modIcon(pc, x, y, s, c) {
  const k = s / 20;
  ctx.fillStyle = "#7f8ba3";
  for (let i = -1; i <= 1; i++) { ctx.fillRect(x + i * 4 * k - 0.8 * k, y - 9.5 * k, 1.6 * k, 3 * k); ctx.fillRect(x + i * 4 * k - 0.8 * k, y + 6.5 * k, 1.6 * k, 3 * k);
    ctx.fillRect(x - 9.5 * k, y + i * 4 * k - 0.8 * k, 3 * k, 1.6 * k); ctx.fillRect(x + 6.5 * k, y + i * 4 * k - 0.8 * k, 3 * k, 1.6 * k); }
  rr(x - 7 * k, y - 7 * k, 14 * k, 14 * k, 2.5 * k); ctx.fillStyle = BODY; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = c; ctx.stroke();
  rr(x - 4 * k, y - 4 * k, 8 * k, 8 * k, 1.5 * k); ctx.fillStyle = c; ctx.fill();
  if (pc && s >= 14) txt(PIECES[pc].name[0], x, y + 0.5 * k, 6.5 * k, "#070b16", "center", "800");
}
function gearHeader() {
  const s = gearStats(progress.gear), p = (x) => "+" + fmt(x * 100) + "%";
  return "Guardiano " + p(s.pdmg) + " · barriera " + p(s.hp) + " · torri " + p(s.tdmg);
}
function gearScreen() {
  dim(0.92);
  const g = progress.gear, pc = gearSel, e = g.eq[pc], P = PIECES[pc];
  button(8, 8, 62, 30, "‹ Menu", closeGear, { size: 12 });
  txt("EQUIPAGGIAMENTO", W / 2 + 22, 18, 16, "#e8eefc", "center", "800");
  txt(gearHeader(), W / 2 + 34, 36, 9, "#9fb4d9", "center", "600");
  // i 6 pezzi
  PIECE_IDS.forEach((id, i) => {
    const x = 12 + (i % 3) * 114, y = 48 + Math.floor(i / 3) * 50, q = g.eq[id], on = gearSel === id;
    button(x, y, 108, 44, "", () => gearPick(id), { stroke: q ? rarColor(q.r) : on ? "#7fa0e0" : "#2c4272", fill: on ? "rgba(127,160,224,0.18)" : "rgba(18,30,58,0.92)" });
    pieceIcon(id, x + 19, y + 22, 24, q ? rarColor(q.r) : "#4a5a80");
    txt(PIECES[id].name, x + 66, y + 14, 12, on ? "#e8eefc" : "#b9c8e6", "center", "700");
    if (q) fitTxt(RARITY[q.r].name + " " + q.m.length + "/" + (q.r + 1), x + 66, y + 31, 70, 10, rarColor(q.r), "center", "700");
    else txt(gearCount(g, "pcs", id) ? "da equipaggiare" : "vuoto", x + 66, y + 31, 10, "#6f82ad", "center", "500");
  });
  // pezzo scelto: statistica base e slot dei Moduli
  let y = 160;
  if (e) {
    pieceIcon(pc, 28, y + 10, 26, rarColor(e.r));
    txt(P.name, 48, y + 2, 14, "#e8eefc", "left", "800");
    txt(RARITY[e.r].name, 48 + tw(P.name, 14, "800") + 8, y + 2, 12, rarColor(e.r), "left", "700");
    txt(STAT_TXT[P.stat] + " +" + fmt(P.base[e.r]) + "%", 48, y + 18, 11, "#9fb4d9", "left", "500");
    const arm = gearArm === "u";
    button(252, y - 8, 96, 26, arm ? "Tocca ancora" : "Togli", tapUnequip, { size: 11, stroke: arm ? "#ffd166" : "#2c4272", color: arm ? "#ffd166" : "#9fb4d9" });
    for (let i = 0; i <= e.r; i++) {
      const yy = y + 30 + i * 26, m = e.m[i];
      if (m) {
        const armed = gearArm === "s" + i;
        button(12, yy, 336, 24, "", () => tapSlot(i), { stroke: armed ? "#ffd166" : rarColor(m[1]) });
        modIcon(pc, 25, yy + 12, 16, rarColor(m[1]));
        txt(armed ? "Tocca di nuovo per togliere il Modulo" : modText(m[0], m[1]), 36, yy + 12, 11, armed ? "#ffd166" : "#e8eefc", "left", "600");
      } else {
        rr(12, yy, 336, 24, 8); ctx.lineWidth = 1; ctx.strokeStyle = "#24345a"; ctx.stroke();
        txt("Slot libero · Moduli: " + P.name.toLowerCase(), 24, yy + 12, 10, "#5f7299", "left", "500");
      }
    }
  } else {
    txt(P.name + " · nessun pezzo equipaggiato", 16, y + 2, 14, "#e8eefc", "left", "800");
    txt("Statistica base: " + STAT_TXT[P.stat] + ".", 16, y + 20, 11, "#9fb4d9", "left", "500");
    txt("Slot dei Moduli: da 1 (comune) a 5 (ancestrale).", 16, y + 36, 11, "#9fb4d9", "left", "500");
    txt("Equipaggia un pezzo dall’inventario qui sotto.", 16, y + 52, 11, "#6f82ad", "left", "500");
  }
  // inventario del pezzo scelto
  y = 330;
  const np = gearCount(g, "pcs", pc), nm = gearCount(g, "mods", pc);
  [["pcs", "Pezzi (" + np + ")"], ["mods", "Moduli (" + nm + ")"]].forEach(([id, label], i) => {
    const on = gearTab === id;
    button(12 + i * 172, y, 164, 26, label, () => gearSetTab(id), { size: 12, fill: on ? "rgba(127,160,224,0.18)" : "rgba(18,30,58,0.92)", stroke: on ? "#7fa0e0" : "#2c4272", color: on ? "#e8eefc" : "#9fb4d9" });
  });
  const fc = fuseCount(), ready = gearTab === "mods" && gearMode === "fuse" && fc === 5;
  [["use", gearTab === "pcs" ? "Equipaggia" : "Installa"], ["fuse", gearTab === "mods" && gearMode === "fuse" ? (ready ? "Fondi ora" : "Fondi " + fc + "/5") : "Fondi"], ["drop", "Scarta"]].forEach(([id, label], i) => {
    const on = gearMode === id;
    button(12 + i * 114, y + 32, 108, 24, label, () => gearSetMode(id),
      { size: 11, fill: on ? "rgba(201,162,255,0.16)" : "rgba(18,30,58,0.92)", stroke: ready && id === "fuse" ? "#ffd166" : on ? "#c9a2ff" : "#2c4272", color: on ? "#e8eefc" : "#9fb4d9" });
  });
  y += 64;
  if (gearTab === "pcs") {
    for (let r = 0; r < 5; r++) {
      const n = qty(g.pcs, pcKey(pc, r)), yy = y + r * 40, armed = gearArm === "p" + r;
      let sub = "";
      if (gearMode === "use") sub = n ? (e && e.r === r ? "Uguale a quello equipaggiato" : "Tocca per equipaggiare (" + (r + 1) + (r ? " slot)" : " slot)")) : "";
      else if (gearMode === "fuse") sub = r >= 4 ? "Rarità massima" : n >= 5 ? (armed ? "Tocca di nuovo: 5 → 1 " + RARITY[r + 1].name.toLowerCase() : "5 → 1 " + RARITY[r + 1].name.toLowerCase()) : "Servono 5 pezzi uguali";
      else sub = n ? (armed ? "Tocca di nuovo per scartarne uno" : "Tocca per scartarne uno") : "";
      button(12, yy, 336, 36, "", () => tapPiece(r), { stroke: armed ? "#ffd166" : n ? rarColor(r) : "#24345a", fill: n ? "rgba(18,30,58,0.92)" : "rgba(10,16,32,0.6)" });
      pieceIcon(pc, 32, yy + 18, 22, n ? rarColor(r) : "#3a4a70");
      txt(RARITY[r].name, 52, yy + 12, 12, n ? rarColor(r) : "#4a5a80", "left", "700");
      txt("×" + n, 338, yy + 12, 12, n ? "#e8eefc" : "#4a5a80", "right", "700");
      if (sub) txt(sub, 52, yy + 27, 10, armed ? "#ffd166" : "#8a9ac0", "left", "500");
    }
  } else {
    for (let r = 0; r < 5; r++) {
      const on = gearRar === r, n = Object.entries(g.mods).reduce((a, [k, v]) => a + (k.startsWith(pc + ":" + r + ":") ? v : 0), 0);
      button(12 + r * 68, y, 64, 22, "", () => gearSetRar(r), { stroke: on ? rarColor(r) : "#2c4272", fill: on ? "rgba(127,160,224,0.14)" : "rgba(18,30,58,0.92)" });
      txt(RAR_SHORT[r] + " " + n, 44 + r * 68, y + 12, 10, n || on ? rarColor(r) : "#4a5a80", "center", "700");
    }
    const list = P.pool.filter((fx) => qty(g.mods, modKey(pc, gearRar, fx)) > 0);
    if (!list.length) txt("Nessun Modulo " + RARITY[gearRar].name.toLowerCase() + " per questo pezzo", W / 2, y + 50, 11, "#6f82ad", "center", "500");
    list.forEach((fx, i) => {
      const yy = y + 28 + i * 23, n = qty(g.mods, modKey(pc, gearRar, fx)), armed = gearArm === "m" + fx, sel = gearFuse[fx] || 0;
      button(12, yy, 336, 21, "", () => tapMod(fx), { stroke: armed ? "#ffd166" : sel ? "#c9a2ff" : "#2c4272" });
      modIcon(null, 22, yy + 10.5, 13, rarColor(gearRar));
      txt(armed ? "Tocca di nuovo per scartarne uno" : modText(fx, gearRar), 34, yy + 11, 10, armed ? "#ffd166" : "#e8eefc", "left", "600");
      txt((sel ? sel + " scelti · " : "") + "×" + n, 338, yy + 11, 10, sel ? "#c9a2ff" : "#9fb4d9", "right", "700");
    });
  }
  if (gearMsg) txt(gearMsg, W / 2, 630, 10, "#ffd166", "center", "600");
  else if (gearTab === "mods" && gearMode === "fuse") txt(gearRar >= 4 ? "Rarità massima: niente fusione" : "Scegli 5 Moduli (anche diversi), poi “Fondi ora”", W / 2, 630, 10, "#8a9ac0", "center", "500");
}
// oggetti presi a fine livello (schermata di vittoria): tasselli colorati per rarità, al massimo 3 per riga
function gearChips(y) {
  const list = gearGain || [];
  list.forEach((o, i) => {
    const x = 18 + (i % 3) * 110, yy = y + Math.floor(i / 3) * 30;
    rr(x, yy, 104, 26, 6); ctx.fillStyle = "rgba(18,30,58,0.95)"; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = rarColor(o.r); ctx.stroke();
    if (o.kind === "mods") modIcon(o.pc, x + 14, yy + 13, 16, rarColor(o.r)); else pieceIcon(o.pc, x + 14, yy + 13, 18, rarColor(o.r));
    fitTxt(o.kind === "mods" ? "Modulo " + PIECES[o.pc].name.toLowerCase() : PIECES[o.pc].name, x + 60, yy + 13, 80, 10, rarColor(o.r), "center", "700");
  });
  return list.length ? Math.ceil(list.length / 3) * 30 + 18 : 0;
}

/* ---------- GRIGLIA DEI LIVELLI (1.12.3) ---------- */
function sealGem(x, y, r, got) {                 // rombo del Sigillo: pieno se preso, vuoto se da prendere
  const pts = [[x, y - r], [x + r, y], [x, y + r], [x - r, y]];
  if (got) poly(pts, "#c9a2ff"); else poly(pts, "rgba(201,162,255,0.08)", "#c9a2ff", 1.2);
}
function levelsScreen() {
  dim(0.92);
  button(8, 8, 62, 30, "‹ Menu", closeLevels, { size: 12 });
  txt("LIVELLI", W / 2 + 22, 22, 18, "#e8eefc", "center", "800");
  const eu = epicUnlocked();
  [["standard", "Standard", "#3fe0a0"], ["epic", eu ? "Epica (difficoltà +" + CAMPAIGN.epicOffset + ")" : "Epica · dal livello " + CAMPAIGN.epicUnlock, "#ff7a3d"]].forEach(([id, label, c], i) => {
    const on = lvMode === id, off = id === "epic" && !eu;
    button(16 + i * 168, 46, 160, 30, label, () => { if (!off) lvMode = id; },
      { size: 12, fill: on ? "rgba(63,224,160,0.12)" : "rgba(18,30,58,0.92)", stroke: on ? c : "#2c4272", color: off ? "#5f7299" : on ? "#e8eefc" : "#9fb4d9" });
  });
  const pages = Math.ceil(CAMPAIGN.maxLevel / 50);
  for (let i = 0; i < pages; i++) {
    const on = lvPage === i, open = i * 50 + 1 <= maxSelectable();
    button(16 + i * 84, 82, 80, 26, (i * 50 + 1) + "-" + Math.min(CAMPAIGN.maxLevel, i * 50 + 50), () => { lvPage = i; },
      { size: 11, fill: on ? "rgba(127,160,224,0.18)" : "rgba(18,30,58,0.92)", stroke: on ? "#7fa0e0" : "#2c4272", color: open ? (on ? "#e8eefc" : "#9fb4d9") : "#5f7299" });
  }
  button(16, 114, 328, 24, (lvFilter ? "☑" : "☐") + " Solo i livelli con Sigilli da prendere", () => { lvFilter = !lvFilter; },
    { size: 11, stroke: lvFilter ? "#c9a2ff" : "#2c4272", color: lvFilter ? "#e8eefc" : "#9fb4d9" });
  for (let i = 0; i < 50; i++) {
    const lv = lvPage * 50 + i + 1; if (lv > CAMPAIGN.maxLevel) break;
    const x = 12 + (i % 5) * 68, y = 144 + Math.floor(i / 5) * 43;
    const open = lv <= maxSelectable(), done = lvMode === "epic" ? progress.claims.includes("e" + lv) : lv <= progress.cleared;
    const st = sealStatus(lvMode, lv), dimmed = !open || (lvFilter && !sealsOpen(lvMode, lv)), sel = lv === lvSel;
    button(x, y, 64, 40, "", () => pickLevel(lv), { stroke: sel ? "#ffd166" : !open ? "#1c2a4a" : done ? "#3fe0a0" : "#7fa0e0",
      fill: sel ? "rgba(255,209,102,0.16)" : dimmed ? "rgba(10,16,32,0.6)" : "rgba(18,30,58,0.92)" });
    txt(String(lv), x + 32, y + 14, 13, dimmed ? "#4a5a80" : lv % 10 === 0 ? "#ffd166" : "#e8eefc", "center", "800");   // muri in giallo
    if (!open) continue;
    if (st.first !== "no") { ctx.globalAlpha = dimmed ? 0.4 : 1; sealGem(x + 24, y + 29, 4.5, st.first === "got"); sealGem(x + 40, y + 29, 4.5, st.full === "got"); ctx.globalAlpha = 1; }
    else if (done) txt("✓", x + 32, y + 29, 11, "#3fe0a0", "center", "800");
  }
  fitTxt("◆ preso · ◇ da prendere (1° completamento, cupola al 100%) · giallo: muro", W / 2, 579, 336, 10, "#8a9ac0", "center", "500");
  const can = lvSel <= maxSelectable() && (lvMode === "standard" || eu);
  button(16, 590, 328, 40, "Gioca il livello " + lvSel + " · " + (lvMode === "epic" ? "Epica" : "Standard"), playLevel,
    { size: 14, stroke: can ? (lvMode === "epic" ? "#ff7a3d" : "#3fe0a0") : "#2c3a5f", color: can ? "#e8eefc" : "#6f82ad" });
}

/* ---------- GUIDA: stati e carte (1.12.3) ---------- */
const STATUS_INFO = [
  ["slow", "Rallentamento", "Il nemico avanza alla metà della velocità."],
  ["para", "Paralisi", "Il nemico è fermo e non attacca la cupola. Mini-boss e boss non si paralizzano."],
  ["weak", "Indebolimento", "I colpi del nemico alla cupola fanno il 35% di danno in meno (la Barriera congelante di più)."],
  ["destr", "Distruzione", "Ogni pila toglie il 10% al danno del nemico; 3 pile (5 con Distruzione estesa), dura 5 s."],
  ["vuln", "Vulnerabilità", "Il nemico subisce il 25% di danno in più (da un tipo o da tutti)."],
  ["burn", "Bruciatura", "Danno da fuoco ogni istante finché dura."],
];
const STATUS_EXTRA = [
  ["Campo destabilizzante", "Nel campo del Disruption Drone il nemico subisce il 25% in più dalle altre torri."],
  ["Scia combustibile", "Nella scia della Firewheel il nemico subisce il 30% in più dal fuoco."],
  ["Scossa continua", "Il Thunderbolt fa danno elettrico ai paralizzati finché dura la paralisi."],
  ["Resistenza dei boss", "Mini-boss e boss subiscono gli stati in parte: dal 25 al 60% in meno."],
];
function guideScreen() {
  dim(0.94);
  button(8, 8, 62, 30, "‹ Menu", closeGuide, { size: 12 });
  txt("GUIDA", W / 2 + 22, 22, 18, "#e8eefc", "center", "800");
  [["status", "Stati dei nemici"], ["cards", "Carte"]].forEach(([id, label], i) => {
    const on = guideTab === id;
    button(16 + i * 168, 46, 160, 30, label, () => { guideTab = id; guideScroll = 0; },
      { size: 12, fill: on ? "rgba(63,224,160,0.12)" : "rgba(18,30,58,0.92)", stroke: on ? "#3fe0a0" : "#2c4272", color: on ? "#e8eefc" : "#9fb4d9" });
  });
  if (guideTab === "status") guideStatus(); else guideCards();
}
function guideStatus() {
  let y = 96;
  for (const [k, name, desc] of STATUS_INFO) {
    const c = STATUS_ICONS.find((s) => s[0] === k)[2];
    disc(28, y + 8, 11, "rgba(18,30,58,0.95)"); statusIcon(k, 28, y + 8, c, { destrN: 2 });
    txt(name, 48, y + 2, 13, c, "left", "700");
    wrap(desc, W - 64, 11).forEach((l, i) => txt(l, 48, y + 18 + i * 14, 11, "#b9c8e6", "left", "500"));
    y += 22 + wrap(desc, W - 64, 11).length * 14 + 6;
  }
  y += 4; txt("Altri effetti (senza icona)", 16, y, 12, "#9fb4d9", "left", "700"); y += 18;
  for (const [name, desc] of STATUS_EXTRA) {
    txt(name, 16, y, 12, "#e8eefc", "left", "700");
    wrap(desc, W - 32, 11).forEach((l, i) => txt(l, 16, y + 15 + i * 13, 11, "#b9c8e6", "left", "500"));
    y += 18 + wrap(desc, W - 32, 11).length * 13 + 4;
  }
}
// riga di una carta nella guida: nome, categoria e stato nell’albero, descrizione; carte standard con l’effetto per pila (con i nodi dell’albero)
function guideCardLines(def, u) {
  const who = def.id, cat = u.cat === "std" ? "Standard · fino a 3 pile" : u.cat === "chain" ? "Chain " + def.ups.find((v) => v.chain === u.chain && v.lv === 1).name + " · lv " + u.lv
    : u.cat === "lu" ? "Level up · lv " + u.lv : "Combo con " + TURRETS[u.needs].name + (typeof u.cond === "number" ? " al lv " + u.cond : " (" + TURRETS[u.needs].ups.find((v) => v.id === u.cond).name + ")");
  const lockedNow = locked(who, u.id), inTree = (TREE_LOCKS[who] || []).includes(u.id);
  const lock = inTree ? (lockedNow ? "bloccata (albero)" : "sbloccata (albero)") : "";
  let extra = "";
  if (u.cat === "std") { const k = stdKind(who, u.id); if (k) { const L = treeLv(who + ":std:" + u.id); extra = "Per pila: " + stdFx(k[0], k[1], L) + (L ? " (nodo dell’albero al " + L + ")" : ""); } }
  return { cat, lock, lockedNow, desc: [u.desc, extra].filter(Boolean) };
}
function guideCards() {
  const ids = ["player", ...TURRET_ORDER];
  ids.forEach((id, i) => {
    const x = 12 + (i % 6) * 56, y = 84 + Math.floor(i / 6) * 46, on = guideSel === id, def = id === "player" ? PLAYER_DEF : TURRETS[id], c = TYPES[def.type].color;
    button(x, y, 52, 42, "", () => { guideSel = id; guideScroll = 0; }, { stroke: on ? c : "#2c4272", fill: on ? "rgba(201,162,255,0.12)" : "rgba(18,30,58,0.92)" });
    if (id === "player") txt("Guard.", x + 26, y + 21, 11, c, "center", "800");
    else { ctx.save(); ctx.beginPath(); ctx.rect(x + 2, y + 2, 48, 38); ctx.clip(); TURRET_ART[id](x + 26, y + 36, c); ctx.restore(); }
  });
  const def = guideSel === "player" ? PLAYER_DEF : TURRETS[guideSel], c = TYPES[def.type].color, top = 182, bottom = 624;
  // contenuto (scorre): intestazione con le statistiche, poi le carte
  ctx.save(); ctx.beginPath(); ctx.rect(0, top, W, bottom - top); ctx.clip();
  let y = top + 14 - guideScroll;
  txt(def.name || "Guardiano", 16, y, 15, c, "left", "800");
  txt(TYPES[def.type].name, W - 16, y, 11, c, "right", "700"); y += 18;
  const stat = guideSel === "player" ? "Danno " + PLAYER.dmg + " per colpo, una salva ogni " + fmt(PLAYER.interval) + " s, portata totale."
    : (def.blurb + ". Portata " + def.range + " px, ricarica " + fmt(def.reload) + " s.");
  wrap(stat, W - 32, 11).forEach((l) => { txt(l, 16, y, 11, "#9fb4d9", "left", "500"); y += 14; });
  y += 6;
  for (const u of def.ups) {
    const L = guideCardLines(def, u), rows = L.desc.flatMap((d) => wrap(d, W - 40, 11)), h = 36 + rows.length * 14;
    rr(12, y - 8, W - 24, h, 8); ctx.fillStyle = L.lockedNow ? "rgba(10,16,32,0.7)" : "rgba(18,30,58,0.92)"; ctx.fill();
    ctx.lineWidth = 1; ctx.strokeStyle = L.lockedNow ? "#4a3a70" : "#24345a"; ctx.stroke();
    txt(u.name, 22, y + 4, 13, L.lockedNow ? "#8a7ab8" : "#e8eefc", "left", "700");
    fitTxt(L.cat + (L.lock ? " · " + L.lock : ""), 22, y + 19, W - 44, 10, L.lockedNow ? "#c9a2ff" : "#7fa0e0", "left", "600");
    rows.forEach((l, i) => txt(l, 22, y + 34 + i * 14, 11, "#b9c8e6", "left", "500"));
    y += h + 6;
  }
  ctx.restore();
  const content = y + guideScroll - top;              // altezza del contenuto: lo scorrimento non va oltre la fine
  guideScroll = clamp(guideScroll, 0, Math.max(0, content - (bottom - top) + 10));
  if (content > bottom - top) txt(guideScroll > 0 ? "▲ ▼ trascina per scorrere" : "▼ trascina in su per vedere le altre carte", W / 2, 633, 10, "#8a9ac0", "center", "500");
}

function drawCrosshair(x, y, locked) {         // mirino nel punto premuto; giallo quando c’è un nemico agganciato
  ctx.strokeStyle = locked ? "#ffd166" : "#e8eefc"; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.85;
  ctx.beginPath(); ctx.arc(x, y, 12, 0, 6.2832); ctx.moveTo(x - 18, y); ctx.lineTo(x - 6, y); ctx.moveTo(x + 6, y); ctx.lineTo(x + 18, y);
  ctx.moveTo(x, y - 18); ctx.lineTo(x, y - 6); ctx.moveTo(x, y + 6); ctx.lineTo(x, y + 18); ctx.stroke(); ctx.globalAlpha = 1;
}
function unlockScreen() {                       // avviso di sblocco sopra la schermata di vittoria: si chiude solo con “Ho capito” (o Invio)
  buttons.length = 0;                            // i pulsanti della vittoria sotto non rispondono finché l’avviso è aperto
  dim(0.82);
  const n = unlockNotes.length, h = 96 + n * 22 + unlockNotes.reduce((a, u) => a + 30 + u.lines.length * 17, 0), y0 = Math.max(70, 330 - h / 2);
  rr(16, y0, 328, h, 10); ctx.fillStyle = "rgba(14,24,48,0.97)"; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = "#ffd166"; ctx.stroke();
  txt(n > 1 ? "Nuovi sblocchi" : "Nuovo sblocco", W / 2, y0 + 30, 20, "#ffd166", "center", "800");
  let y = y0 + 66;
  for (const u of unlockNotes) {
    txt(u.title, W / 2, y, 15, "#e8eefc", "center", "700"); y += 24;
    for (const l of u.lines) { txt(l, W / 2, y, 12, "#b9c8e6", "center", "500"); y += 17; }
    y += 22;
  }
  button(90, y0 + h - 60, 180, 44, "Ho capito", closeUnlocks, { size: 15, stroke: "#ffd166" });
}
function drawFloater(f) {                       // numero del danno che sale e svanisce (il colore lo sceglie popup() nella logica)
  ctx.globalAlpha = clamp(f.life / 0.7, 0, 1); txt(f.txt, f.x, f.y, 12, f.color, "center", "700");
}
function draw() {
  buttons = [];
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#0a1020"); g.addColorStop(1, "#16254a");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#9fb4d9";
  for (const s of stars) { ctx.globalAlpha = s.a; ctx.fillRect(s.x, (s.y + clock * s.v) % H, s.s, s.s); }
  ctx.globalAlpha = 1;

  if (state !== "menu" && state !== "save" && state !== "tree" && state !== "gear" && state !== "levels" && state !== "guide") {
    // HD-2D: cielo fino all’orizzonte, terreno, effetti a terra, poi sprite; luci tutte insieme; atmosfera
    HD.lights = [];
    blit(hdBackground(), 0, 0, 0, 0);
    for (let k = 0; k < 30; k++) {                 // stelle che brillano
      const tw = Math.sin(clock * (1.5 + hash2(k, 21) * 2) + k * 1.7); if (tw < 0.4) continue;
      ctx.fillStyle = rgba("#e8f0ff", (tw - 0.4) * 1.6); ctx.fillRect(Math.round(hash2(k, 22) * W / PX) * PX, Math.round(hash2(k, 23) * (HORIZON - 60) / PX) * PX, PX, PX);
    }
    drawGround();
    for (const o of ents) if (o.under) o.draw();   // aree a terra (Area infuocata, varchi) sotto i nemici
    drawDomeFill();
    slots.forEach((s) => { if (s) drawTurret(s); });
    drawPlayer();
    if (pressing && state === "play") drawCrosshair(press.x, press.y, !!nearestTo(press.x, press.y, PRESS_PICK));
    enemies.forEach(drawEnemy);
    for (const o of ents) if (!o.under) o.draw();
    drawDomeEdge();
    ctx.fillStyle = "rgba(12,8,34,0.16)"; ctx.fillRect(0, 0, W, GROUND_Y + GROUND_H);   // penombra: le luci risaltano
    const L = HD.lights; HD.lights = null; drawLights(L);
    grade(); motes();
    drawFortress();
    for (const f of floaters) drawFloater(f);
    ctx.globalAlpha = 1;
    drawHud();
    if (state === "play") drawAlert();
    if (state === "play" && waveTime < 0) {
      ctx.globalAlpha = clamp(-waveTime / 0.6, 0, 1);
      txt("ONDATA " + wave, W / 2, 230, 30, "#e8eefc", "center", "800");
      if (wave === N_WAVES && hasFinalBoss()) txt("Boss finale in arrivo", W / 2, 262, 14, "#ffd166", "center", "700");
      else if (hasMiniBosses() && CAMPAIGN.bossWaves.includes(wave)) txt("Mini-boss in arrivo", W / 2, 262, 14, "#ffd166", "center", "700");
      ctx.globalAlpha = 1;
    }
  }
  if (state === "menu" || state === "save") menuScreen();          // il pannello del salvataggio sta sopra al menu
  else if (state === "upgrade") upgradeScreen();
  else if (state === "won") { wonScreen(); if (unlockNotes.length) unlockScreen(); }
  else if (state === "lost") lostScreen();
  else if (state === "pause") pauseScreen();
  else if (state === "tree") treeScreen();
  else if (state === "gear") gearScreen();
  else if (state === "levels") levelsScreen();
  else if (state === "guide") guideScreen();
}

/* ---------- TORRETTE CON DISEGNO PROPRIO, PROIETTILI ED EFFETTI ---------- */
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
function ballLightning(x, y, r, age) {
  const fl = 0.75 + 0.25 * Math.sin(age * 43) * Math.sin(age * 17 + 1);
  disc(x, y, r * 2.3, TYPES.electric.color, 0.10 * fl);
  disc(x, y, r * 1.5, TYPES.electric.color, 0.28 * fl);
  ctx.strokeStyle = "#fff6b0"; ctx.lineWidth = 1.2; ctx.lineCap = "round";
  for (let k = 0; k < 4; k++) {
    const a0 = age * (k % 2 ? 5 : -4) + k * 1.571, len = r * (1.5 + 0.7 * Math.sin(age * 29 + k * 3));
    ctx.globalAlpha = 0.5 + 0.5 * Math.abs(Math.sin(age * 23 + k));
    ctx.beginPath(); ctx.moveTo(x + Math.cos(a0) * r * 0.6, y + Math.sin(a0) * r * 0.6);
    for (let i = 1; i <= 3; i++) {
      const rr = r * 0.6 + (len - r * 0.6) * i / 3, aa = a0 + 0.35 * Math.sin(age * 61 + i * 2.3 + k);
      ctx.lineTo(x + Math.cos(aa) * rr, y + Math.sin(aa) * rr);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  disc(x, y, r * 0.95, "#fff6b0", 0.9); disc(x, y, r * 0.5, "#ffffff");
}
function thunderDraw(s) {
  for (const o of s.st.sph || []) { disc(o.x, o.y, 9, TYPES.electric.color, 0.25); disc(o.x, o.y, 5, "#fff6b0"); }
}
function teslaDraw(s) {
  if (s.st.charge > 0) { const k = 1 - s.st.charge / (s.st.chargeT || 0.7); ballLightning(s.x, s.y - 20, 2 + 4 * k, s.st.charge * 3); }
}
// disegni delle entità temporanee (proiettili ed effetti): la logica crea l’entità e nel suo draw() chiama FX.<nome>(this, …)
// o = l’entità; gli altri argomenti sono i valori che l’entità non tiene in sé (posizione fissa, colore, durata…)
const FX = {
  ring(o, x, y, r1, color, life) {               // anello che si stringe e svanisce (esplosioni, impatti); HD-2D: lampo e schegge a pixel
    const k = clamp(o.t / life, 0, 1); ctx.globalAlpha = k; ctx.strokeStyle = color; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(x, y, r1 * (1 - k * 0.9), 0, 6.2832); ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const a = i * 0.785 + x * 0.1, d = r1 * (0.3 + (1 - k) * 0.9);
      ctx.fillStyle = i % 2 ? color : "#fff3c0"; ctx.fillRect(Math.round((x + Math.cos(a) * d) / PX) * PX, Math.round((y + Math.sin(a) * d) / PX) * PX, PX, PX);
    }
    ctx.globalAlpha = 1; light(x, y, r1 * 1.8, color, k * k);
  },
  bolt(o, pts, color, life, w) {                 // fulmine a zig-zag
    ctx.globalAlpha = clamp(o.t / life, 0, 1); ctx.strokeStyle = color; ctx.lineWidth = w || 2; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke(); ctx.globalAlpha = 1;
  },
  teslaOrb(o) {                                  // Teslacoil · Sfera statica: fulmine globulare grande quanto l’area, trasparente (non copre i nemici)
    const k = Math.min(1, o.t / 0.5), age = o.age, r = o.r, x = o.x, y = o.y, c = TYPES.electric.color;
    const fl = 0.75 + 0.25 * Math.sin(age * 43) * Math.sin(age * 17 + 1);
    disc(x, y, r, c, 0.07 * fl * k);                                     // alone tremolante, appena velato
    disc(x, y, r * 0.55, c, 0.06 * fl * k);
    ctx.globalAlpha = 0.45 * fl * k; ctx.strokeStyle = c; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.stroke();
    ctx.strokeStyle = "#fff6b0"; ctx.lineWidth = 1.2; ctx.lineCap = "round";
    for (let j = 0; j < 6; j++) {                                        // archi dal nucleo verso il bordo, che girano e tremano
      const a0 = age * (j % 2 ? 3 : -2.5) + j * 1.047, len = r * (0.75 + 0.25 * Math.sin(age * 29 + j * 3));
      ctx.globalAlpha = (0.35 + 0.45 * Math.abs(Math.sin(age * 23 + j))) * k;
      ctx.beginPath(); ctx.moveTo(x + Math.cos(a0) * 4, y + Math.sin(a0) * 4);
      for (let i = 1; i <= 4; i++) {
        const rr = 4 + (len - 4) * i / 4, aa = a0 + 0.3 * Math.sin(age * 61 + i * 2.3 + j);
        ctx.lineTo(x + Math.cos(aa) * rr, y + Math.sin(aa) * rr);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    disc(x, y, 4, "#fff6b0", 0.55 * k); disc(x, y, 2, "#ffffff", 0.8 * k);   // nucleo piccolo e semitrasparente
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
  hiveShot(o) {                                  // Hive · colpo del drone: lv1 punto viola, lv2 rombo più grande e chiaro, lv3 stella rosa con alone
    const c = ["#b07cff", "#d9a4ff", "#ff9be6"][o.lvl - 1], r = [3.2, 4, 4.8][o.lvl - 1];
    glow(o.px, o.py, o.x, o.y, c, r * 0.9, 0.7);
    if (o.lvl === 1) disc(o.x, o.y, r, c);
    else if (o.lvl === 2) poly([[o.x, o.y - r * 1.3], [o.x + r, o.y], [o.x, o.y + r * 1.3], [o.x - r, o.y]], c, "#ffffff", 1);
    else { disc(o.x, o.y, r * 1.8, c, 0.3); const pts = []; for (let i = 0; i < 10; i++) { const a = i * 0.6283 - 1.5708, rr2 = i % 2 ? r * 0.5 : r * 1.3; pts.push([o.x + Math.cos(a) * rr2, o.y + Math.sin(a) * rr2]); } poly(pts, c, "#ffffff", 1); }
  },
  zone(o, color) {                               // area a terra che dura
    ctx.globalAlpha = 0.22 * Math.min(1, o.t / 0.5); ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, 6.2832); ctx.fill();
    ctx.globalAlpha = 0.6 * Math.min(1, o.t / 0.5); ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke(); ctx.globalAlpha = 1;
  },
  missile(o, mini) {                             // Sky Guard · missile; HD-2D: sprite a pixel, scia di fumo, fiamma in coda che illumina
    const ca = Math.cos(o.a), sa = Math.sin(o.a), L = mini ? 5 : 8;
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
    const sp = gridSprite("missile", [".kk.......", "kdckkkkkk.", "kddeeeee4k", "kdckkkkkk.", ".kk......."], turretPal(TYPES.fire.color));
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
  disrField(o, x0, y0, hh) {                     // Disruption Drone · due droni volano ai lati e tra loro si forma il campo
    const k = clamp(o.age / 0.4, 0, 1), a = clamp(o.t / 0.6, 0, 1);
    if (k >= 1) {
      const f = clamp((o.age - 0.4) / 0.2, 0, 1) * a;
      ctx.globalAlpha = 0.2 * f; ctx.fillStyle = TYPES.force.color; ctx.fillRect(0, o.y - hh, W, hh * 2);
      ctx.globalAlpha = 0.8 * f; ctx.strokeStyle = TYPES.force.color; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0, o.y - hh); ctx.lineTo(W, o.y - hh); ctx.moveTo(0, o.y + hh); ctx.lineTo(W, o.y + hh); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    for (const tx of [14, W - 14]) {
      const px = x0 + (tx - x0) * k, py = y0 + (o.y - y0) * k;
      ctx.globalAlpha = k >= 1 ? a : 1;
      ctx.beginPath(); ctx.moveTo(px, py - 7); ctx.lineTo(px + 7, py); ctx.lineTo(px, py + 7); ctx.lineTo(px - 7, py); ctx.closePath();
      ctx.fillStyle = TYPES.force.color; ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 1; ctx.stroke();
      ctx.globalAlpha = 1;
    }
  },
  disrBlast(o, y, hh) {                          // Disruption Drone · Esplosione finale: lampo su tutto il campo
    ctx.globalAlpha = 0.5 * clamp(o.t / 0.35, 0, 1); ctx.fillStyle = "#e6d4ff"; ctx.fillRect(0, y - hh, W, hh * 2); ctx.globalAlpha = 1;
  },
  aeroBomb(o) {                                  // Aeroblast · bomba
    disc(o.x, o.y, 4.6, "#c7d1e6"); ctx.fillStyle = "#26345c"; ctx.fillRect(o.x - 4.6, o.y - 1, 9.2, 2); disc(o.x, o.y - 5.4, 1.4, "#ffb347");
  },
  aeroShard(o) {                                 // Aeroblast · scheggia della salva
    poly([[o.x, o.y - 3], [o.x + 2.4, o.y + 2], [o.x - 2.4, o.y + 2]], TYPES.physical.color);
  },
  aeroMine(o) {                                  // Aeroblast · mina con le punte
    ctx.strokeStyle = "#8a97b8"; ctx.lineWidth = 1.4; ctx.beginPath();
    for (let i = 0; i < 4; i++) { const a = i * 0.7854; ctx.moveTo(o.x - Math.cos(a) * 12, o.y - Math.sin(a) * 12); ctx.lineTo(o.x + Math.cos(a) * 12, o.y + Math.sin(a) * 12); }
    ctx.lineWidth = 2.2; ctx.stroke(); disc(o.x, o.y, 8, "#26345c"); disc(o.x, o.y, 4.4, TYPES.physical.color, 0.6 + 0.4 * Math.sin(o.age * 6));   // doppia dalla 1.12.0
  },
  fieldOrb(o) {                                  // Thunderbolt · sfera del campo elettrico
    disc(o.x, o.y, 6, TYPES.electric.color, 0.9); ring(o.x, o.y, 0, "#fff", 0.001);
  },
  beamLinks(o, pos) {                            // Beam · raggio continuo e ramificazioni
    for (const [a, b] of o.links) glow(a.x, a.y - (a === pos ? 0 : 0), b.x, b.y, TYPES.energy.color, 2.6, 1);
  },
  wheelDrone(o, opt, trailT) {                   // Firewheel Drone · ruota di fuoco con la scia
    for (const p of o.trail) {                   // scia di fuoco (1.12.2): brace e due lingue che tremolano e si spengono
      const q = clamp(p.t / trailT, 0, 1), f = 0.5 + 0.5 * Math.sin(clock * 10 + p.x * 0.37 + p.y * 0.21);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 14);
      g.addColorStop(0, "rgba(255,170,60," + (0.5 * q) + ")"); g.addColorStop(1, "rgba(255,80,30,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, 14, 0, 6.2832); ctx.fill();
      flame(p.x - 6, p.y + 5, (9 + 6 * f) * q + 3, 4, q);
      flame(p.x + 1, p.y + 6, (13 + 6 * (1 - f)) * q + 3, 4.5, q);
      flame(p.x + 7, p.y + 4, (8 + 5 * f) * q + 3, 3.5, q);
    }
    ctx.globalAlpha = 0.18; ctx.fillStyle = TYPES.fire.color; ctx.beginPath(); ctx.arc(o.x, o.y, opt.rad, 0, 6.2832); ctx.fill(); ctx.globalAlpha = 1;
    for (let k = 0; k < 3; k++) { const aa = o.rot + k * 2.0944; glow(o.x, o.y, o.x + Math.cos(aa) * opt.rad, o.y + Math.sin(aa) * opt.rad, "#ffb347", 2, 0.8); }
    disc(o.x, o.y, opt.mini ? 3 : 5, "#ffe0b0");
  },
  hiveWave(o, x, y, ang, len) {                  // Hive · onda d’urto a ventaglio
    const k = 1 - clamp(o.t / 0.35, 0, 1);
    for (let i = 0; i < 3; i++) {
      const r = len * clamp(k * 1.2 - i * 0.12, 0, 1); if (r <= 0) continue;
      ctx.globalAlpha = (1 - k) * 0.9; ctx.strokeStyle = TYPES.force.color; ctx.lineWidth = 2.6 - i * 0.7;
      ctx.beginPath(); ctx.arc(x, y, r, ang - HIVE_HALF, ang + HIVE_HALF); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  },
  hiveDrone(o) {                                 // Hive · drone esagonale (arancione quando è kamikaze)
    const r = 4.5 + o.lvl * 1.5, pts = [];
    for (let i = 0; i < 6; i++) pts.push([o.x + Math.cos(i * 1.0472 + 0.5236) * r, o.y + Math.sin(i * 1.0472 + 0.5236) * r]);
    poly(pts, o.kami > 0 ? "#ff7a3d" : TYPES.force.color, "#ffffff", 1); disc(o.x, o.y, r * 0.35, "#070b16");
  },
  railShot(o, a) {                               // Railgun · proiettile a punta con una scia corta (non una linea)
    const ca = Math.cos(a), sa = Math.sin(a), x = o.x, y = o.y;
    ctx.globalAlpha = 0.35; ctx.strokeStyle = TYPES.physical.color; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - ca * 18, y - sa * 18); ctx.lineTo(x - ca * 6, y - sa * 6); ctx.stroke(); ctx.globalAlpha = 1;
    poly([[x + ca * 7, y + sa * 7], [x - ca * 5 - sa * 3, y - sa * 5 + ca * 3], [x - ca * 5 + sa * 3, y - sa * 5 - ca * 3]], "#f4f7ff", TYPES.physical.color, 1);
  },
  teslaBall(o) { ballLightning(o.x, o.y, 6, o.age); },   // Teslacoil · fulmine globulare in volo
  vortex(o, R) {                                 // Gravity Vortex Gun · buco nero con le spirali
    disc(o.x, o.y, R, "#1a0b3a", 0.35);
    ctx.strokeStyle = TYPES.force.color; ctx.lineWidth = 2; ctx.globalAlpha = 0.9;
    ctx.beginPath(); ctx.arc(o.x, o.y, R * 0.6, o.spin, o.spin + 4.2); ctx.stroke();
    ctx.beginPath(); ctx.arc(o.x, o.y, R * 0.3, -o.spin, -o.spin + 4.2); ctx.stroke(); ctx.globalAlpha = 1;
    disc(o.x, o.y, 6, "#000");
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
  domeWave(o) {                                  // barriera · Repulsiva: onda d’urto su metà cupola (o.side −1 sinistra, 1 destra), si allarga e svanisce
    const k = 1 - o.t / 0.6, a0 = o.side < 0 ? Math.PI : Math.PI * 1.5;
    ctx.globalAlpha = clamp(o.t / 0.6, 0, 1); ctx.strokeStyle = "#b07cff"; ctx.lineWidth = 6 - 3 * k;
    ctx.beginPath(); ctx.ellipse(DOME.cx, DOME.cy, DOME.rx + 6 + 60 * k, DOME.ry + 6 + 60 * k, 0, a0, a0 + Math.PI / 2); ctx.stroke();
    ctx.globalAlpha = 1;
  },
  domeGas(h, t) {                                // barriera · Congelante: fascia di gas alta h sopra il bordo, svanisce nell’ultimo secondo
    ctx.globalAlpha = 0.22 * clamp(t, 0, 1);
    ctx.beginPath(); ctx.ellipse(DOME.cx, DOME.cy, DOME.rx + h, DOME.ry + h, 0, Math.PI, Math.PI * 2); ctx.ellipse(DOME.cx, DOME.cy, DOME.rx, DOME.ry, 0, Math.PI * 2, Math.PI, true);
    ctx.fillStyle = "#9fe8ff"; ctx.fill();
    ctx.globalAlpha = 0.5 * clamp(t, 0, 1);
    for (let i = 0; i < 18; i++) {               // fiocchi che salgono piano
      const a = Math.PI * (1.04 + 0.92 * ((i * 0.37) % 1)), r = (((i * 0.61) + clock * 0.15) % 1) * h;
      disc(DOME.cx + (DOME.rx + r) * Math.cos(a), DOME.cy + (DOME.ry + r) * Math.sin(a), 1.6, "#e8f8ff");
    }
    ctx.globalAlpha = 1;
  },
  domeAura(color) {                              // barriera · bordo di un’abilità attiva (Riflettente, Ustionante, Potenziante, Rigenerazione)
    ctx.beginPath(); ctx.ellipse(DOME.cx, DOME.cy, DOME.rx + 3, DOME.ry + 3, 0, Math.PI, Math.PI * 2);
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.globalAlpha = 0.45 + 0.25 * Math.sin(clock * 8); ctx.stroke(); ctx.globalAlpha = 1;
  },
  shieldCount(x, y, n) {                         // barriera · immunità accumulate: scudo con il numero
    poly([[x - 7, y - 8], [x + 7, y - 8], [x + 7, y], [x, y + 8], [x - 7, y]], "#e8eefc", "#7fe8ff", 1.2);
    txt(String(n), x, y - 1, 9, "#070b16", "center", "800");
  },
};

// quello che serve fuori: il gioco usa draw, FX, thunderDraw e teslaDraw; il catalogo anche il resto
return { draw, FX, thunderDraw, teslaDraw, TURRET_ART, BODY, BODY2, DARK, STATUS_ICONS, statusIcon, drawStatus, drawEnemy, enemyIcon,
  drawTurret, drawPlayer, guardianShape, drawCrosshair, unlockScreen, drawFloater, ICON_SHAPE, drawDomeFill, drawDomeEdge, drawGround, drawFortress, drawHud, drawAlert, ballLightning,
  menuScreen, upgradeScreen, rewardScreen, pauseScreen, wonScreen, lostScreen, ENEMY_NAME, txt, segs, rr, disc, glow, poly, button };
}
