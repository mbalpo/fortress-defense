"use strict";
/* =====================================================================
   FORTRESS DEFENSE · DISEGNO
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
function drawGround() {
  ctx.fillStyle = "#14203f"; ctx.fillRect(0, GROUND_Y, W, GROUND_H);
  ctx.fillStyle = "#2c4272"; ctx.fillRect(0, GROUND_Y, W, 2);
  for (let i = 0; i < 4; i++) {
    if (slots[i]) continue;
    ctx.setLineDash([3, 3]); ctx.lineWidth = 1.2; ctx.strokeStyle = "#3a5084";
    ctx.strokeRect(SLOT_X[i] - 9, GROUND_Y - 8, 18, 8); ctx.setLineDash([]);
  }
}
function poly(pts, fill, stroke, lw) {
  ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1.2; ctx.stroke(); }
}
// una forma diversa per ogni torretta (x = centro, g = suolo, c = colore del tipo di danno)
const BODY = "#2b3a66", BODY2 = "#44598f", DARK = "#070b16";
const TURRET_ART = {
  sky(x, g, c) {                 // lanciamissili: due tubi con le punte dei missili
    ctx.fillStyle = BODY; ctx.fillRect(x - 11, g - 8, 22, 8);
    for (const dx of [-5.5, 5.5]) { ctx.fillStyle = BODY2; ctx.fillRect(x + dx - 3.5, g - 22, 7, 15); poly([[x + dx - 3.2, g - 22], [x + dx + 3.2, g - 22], [x + dx, g - 29]], c); }
  },
  laser(x, g, c) {               // emettitore: treppiede, canna sottile, lente
    poly([[x - 10, g], [x + 10, g], [x + 4, g - 9], [x - 4, g - 9]], BODY);
    ctx.fillStyle = BODY2; ctx.fillRect(x - 2.5, g - 24, 5, 16);
    disc(x, g - 25, 4.8, c); disc(x, g - 25, 2, "#ffffff", 0.85);
  },
  disr(x, g, c) {                // piattaforma con due droni
    ctx.fillStyle = BODY; ctx.fillRect(x - 11, g - 5, 22, 5); ctx.fillStyle = BODY2; ctx.fillRect(x - 2, g - 12, 4, 8);
    for (const dx of [-7, 7]) poly([[x + dx, g - 22], [x + dx + 5, g - 16.5], [x + dx, g - 11], [x + dx - 5, g - 16.5]], c, "#ffffff", 0.8);
  },
  aero(x, g, c) {                // mortaio: canna corta e larga
    poly([[x - 6, g], [x + 6, g], [x + 10, g - 17], [x - 10, g - 17]], BODY2);
    ctx.fillStyle = c; ctx.fillRect(x - 10.5, g - 20, 21, 3.5); ctx.fillStyle = BODY; ctx.fillRect(x - 8, g - 9, 16, 3);
  },
  thunder(x, g, c) {             // torre a traliccio con la sfera in cima
    poly([[x - 7, g], [x + 7, g], [x + 2.5, g - 23], [x - 2.5, g - 23]], BODY, BODY2, 1.2);
    ctx.strokeStyle = BODY2; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x - 5.5, g - 6); ctx.lineTo(x + 4, g - 14); ctx.moveTo(x + 5.5, g - 6); ctx.lineTo(x - 4, g - 14); ctx.stroke();
    disc(x, g - 27, 6.5, c, 0.3); disc(x, g - 27, 4.2, c);
  },
  beam(x, g, c) {                // parabola con l’ago
    ctx.fillStyle = BODY; ctx.fillRect(x - 3, g - 10, 6, 10);
    ctx.beginPath(); ctx.arc(x, g - 22, 11, 0.15 * Math.PI, 0.85 * Math.PI); ctx.lineWidth = 3.2; ctx.strokeStyle = BODY2; ctx.stroke();
    ctx.strokeStyle = c; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(x, g - 11); ctx.lineTo(x, g - 26); ctx.stroke(); disc(x, g - 27, 2.6, c);
  },
  wheel(x, g, c) {               // fionda con la palla di fuoco
    ctx.strokeStyle = BODY2; ctx.lineWidth = 3.6; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x, g); ctx.lineTo(x, g - 11); ctx.lineTo(x - 8.5, g - 25); ctx.moveTo(x, g - 11); ctx.lineTo(x + 8.5, g - 25); ctx.stroke();
    ctx.strokeStyle = "#c9b28a"; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(x - 8.5, g - 25); ctx.quadraticCurveTo(x, g - 13, x + 8.5, g - 25); ctx.stroke();
    disc(x, g - 18.5, 3.8, c);
  },
  hive(x, g, c) {                // alveare a fasce
    let y = g;
    [[11, 6], [10, 6], [8, 6], [5, 5]].forEach((row, i) => { rr(x - row[0], y - row[1], row[0] * 2, row[1], 3); ctx.fillStyle = i % 2 ? BODY2 : c; ctx.fill(); y -= row[1] - 0.5; });
    disc(x, g - 5, 2.8, DARK);
  },
  rail(x, g, c) {                // due rotaie parallele
    ctx.fillStyle = BODY; ctx.fillRect(x - 9, g - 8, 18, 8);
    ctx.fillStyle = "#c7d1e6"; ctx.fillRect(x - 5.5, g - 29, 3, 22); ctx.fillRect(x + 2.5, g - 29, 3, 22);
    ctx.fillStyle = c; ctx.fillRect(x - 2.5, g - 13, 5, 4);
  },
  tesla(x, g, c) {               // bobina ad anelli
    ctx.fillStyle = BODY2; ctx.fillRect(x - 1.5, g - 22, 3, 22); ctx.fillStyle = BODY; ctx.fillRect(x - 9, g - 4, 18, 4);
    ctx.strokeStyle = c; ctx.lineWidth = 2;
    [[9, 7], [7, 12], [5, 17]].forEach((q) => { ctx.beginPath(); ctx.ellipse(x, g - q[1], q[0], 2.4, 0, 0, 6.2832); ctx.stroke(); });
    disc(x, g - 24, 3.2, "#fff6b0");
  },
  vortex(x, g, c) {              // cannone ad anello
    ctx.fillStyle = BODY; ctx.fillRect(x - 8, g - 7, 16, 7); ctx.fillStyle = BODY2; ctx.fillRect(x - 3, g - 12, 6, 6);
    disc(x, g - 19, 8.2, DARK); ctx.strokeStyle = c; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.arc(x, g - 19, 7.5, 0, 6.2832); ctx.stroke(); disc(x, g - 19, 2.2, c, 0.75);
  },
};
function drawTurret(s) {
  TURRET_ART[s.id](s.x, GROUND_Y, TYPES[s.def.type].color);
  txt("L" + s.level + (s.done ? " ★" : " " + s.used + "/3"), s.x, GROUND_Y + 18, 9, s.done ? "#ffd166" : "#9fb4d9", "center", "700");
  const b = BEHAV[s.id]; if (b.draw) b.draw(s);
}
function drawPlayer() {
  if (comboOn(player, "kHive")) { ctx.globalAlpha = 0.45; guardianShape(W - player.x); ctx.globalAlpha = 1; }   // Clone speculare
  guardianShape(player.x);
}
function guardianShape(x) {
  const y = GROUND_Y, f = frenzyOn(player);
  ctx.beginPath(); ctx.moveTo(x, y - 34); ctx.lineTo(x + 14, y - 2); ctx.lineTo(x, y - 8); ctx.lineTo(x - 14, y - 2); ctx.closePath();
  ctx.fillStyle = f ? "#6a3a2a" : "#2a3f6e"; ctx.fill();
  ctx.lineWidth = 1.5; ctx.strokeStyle = f ? "#ff9a5a" : TYPES.physical.color; ctx.stroke();
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
  if (look === "rock" || look === "asteroid" || look === "meteor") {
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
  txt("Livello " + selLevel, W / 2, 150, 24, "#e8eefc", "center", "800");
  txt("difficoltà " + diffOf(selLevel, false) + (epicUnlocked() ? " · Epica " + diffOf(selLevel, true) : ""), W / 2, 176, 11, "#6f82ad", "center", "500");
  txt("Il guardiano spara da solo; tenendo premuto segue il dito", W / 2, 208, 11, "#6f82ad", "center", "500");
  txt("e spara in verticale", W / 2, 224, 11, "#6f82ad", "center", "500");
  button(60, 254, 240, 46, "Standard", () => startRun("standard"), { size: 16, stroke: "#3fe0a0" });
  const eu = epicUnlocked();
  button(60, 306, 240, 46, eu ? "Epica (difficoltà +" + CAMPAIGN.epicOffset + ")" : "Epica · si sblocca al livello " + CAMPAIGN.epicUnlock,
    () => { if (eu) startRun("epic"); }, { size: eu ? 16 : 12, stroke: eu ? "#ff7a3d" : "#2c3a5f", color: eu ? "#e8eefc" : "#6f82ad" });
  const to = treeOpen();
  button(60, 358, 240, 36, to ? "Albero dei Sigilli · " + progress.seals + " ◆" : "Albero dei Sigilli · dal livello " + CAMPAIGN.sealsFrom, openTree,
    { size: to ? 13 : 12, stroke: to ? "#c9a2ff" : "#2c3a5f", color: to ? "#e8eefc" : "#6f82ad" });
  const rows = [["Torri e guardiano al livello 2", 10], ["Torri e guardiano al livello 3", 20], ["Equipaggiamento del guardiano", CAMPAIGN.equipUnlock],
    ["Sigilli e albero dei potenziamenti", CAMPAIGN.sealsFrom], ["Abilità della barriera", CAMPAIGN.barrierUnlock], ["Modalità Epica", CAMPAIGN.epicUnlock]];
  txt("Sblocchi (a fine livello)", 36, 412, 12, "#9fb4d9", "left", "700");
  rows.forEach(([t, n], i) => txt((progress.cleared >= n ? "✓ " : "· ") + "Liv " + n + " — " + t, 36, 430 + i * 17, 12, progress.cleared >= n ? "#3fe0a0" : "#6f82ad", "left", "500"));
  txt("Mini-boss: ondate 5, 10, 15 dal livello 11 (Epica: sempre)", 36, 532, 10, "#ffd166", "left", "500");
  txt("Boss finale all’ondata 20 dei livelli 10, 20, 30…", 36, 546, 10, "#ffd166", "left", "500");
  button(60, 562, 240, 36, "Salvataggio · esporta o importa", openSave, { size: 13, stroke: "#7fa0e0" });
  txt("Invio = Standard · E = Epica · ←/→ = livello", W / 2, 614, 11, "#5f7299", "center", "500");
  txt("v" + APP_VERSION, W - 8, 632, 9, "#3a4a70", "right", "500");
}
// riga dei Sigilli nella schermata di vittoria (sealGain lo calcola winLevel)
function sealLines() {
  const g = sealGain; if (!g || g.why === "none") return [];
  const one = (n) => n + (n === 1 ? " Sigillo" : " Sigilli");
  if (g.why === "first") return ["+" + one(g.got) + " ◆ (" + one(progress.seals) + ")", g.next ? "Rigiocalo con la cupola al 100%: +" + one(g.got) : ""].filter(Boolean);
  if (g.why === "full") return ["Cupola al 100%: +" + one(g.got) + " ◆ (" + one(progress.seals) + ")"];
  if (g.why === "needFull") return ["Sigilli già riscossi: rigiocalo con la cupola al 100%"];
  return ["Sigilli di questo livello già riscossi"];
}
function wonScreen() {
  const sl = sealLines(), dy = sl.length ? 18 * sl.length + 8 : 0;       // i pulsanti scendono sotto le righe dei Sigilli
  overlay("LIVELLO SUPERATO", ["Livello " + campLevel + " completato" + (mode === "epic" ? " (Epica)" : ""), "Cupola: " + Math.ceil(domeHp) + "/" + domeMax], "#3fe0a0");
  sl.forEach((l, i) => txt(l, W / 2, 282 + i * 18, i ? 11 : 13, i ? "#9fb4d9" : "#c9a2ff", "center", i ? "500" : "700"));
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
    txt(o.title, x + 52, y + 46, 16, "#e8eefc", "left", "700");
    txt(o.desc, x + 52, y + 70, 12, "#b9c8e6", "left", "500");
    txt(o.note, x + 52, y + 92, 10, "#6f82ad", "left", "500");
  });
  button(60, 140 + rewards.length * 122 + 4, 240, 48, "Continua", () => pick(0), { size: 16, stroke: "#ffd166", release: true });
}
function upgradeScreen() {
  dim(0.84);
  if (rewards) { rewardScreen(); return; }
  txt(bonusMode ? "Ricompensa mini-boss" : "Ondata " + wave + " superata", W / 2, 86, 24, bonusMode ? "#ffd166" : "#3fe0a0", "center", "800");
  txt("Scegli un potenziamento", W / 2, 116, 13, "#9fb4d9", "center", "500");
  options.forEach((opt, i) => {
    const x = 20, y = 140 + i * 122, w = 320, h = 110, o = describe(opt), c = TYPES[o.type].color;
    button(x, y, w, h, "", () => pick(i), { stroke: c, release: true });
    disc(x + 26, y + h / 2, 13, c);
    txt(String(i + 1), x + 26, y + h / 2 + 1, 13, "#070b16", "center", "800");
    txt(o.head, x + 52, y + 22, 11, c, "left", "700");
    txt(o.title, x + 52, y + 46, 16, "#e8eefc", "left", "700");
    txt(o.desc, x + 52, y + 70, 12, "#b9c8e6", "left", "500");
    txt(o.note, x + 52, y + 92, 10, "#6f82ad", "left", "500");
  });
  txt("Torri fino al lv " + towerCap() + (campLevel >= CAMPAIGN.maxMaxedFrom ? " · al massimo: " + maxedCount() + "/" + CAMPAIGN.maxMaxed : ""), W / 2, 140 + options.length * 122 + 12, 11, "#6f82ad", "center", "500");
}

/* ---------- ALBERO DEI SIGILLI ---------- */
const TREE_TABS = [["player", "Guardiano"], ["turrets", "Torrette"], ["barrier", "Barriera"]];
function treeNodeRow(n, y, x0, w0) {
  const X = x0 || 16, Wd = w0 || 328, R = X + Wd;      // posizione e larghezza della riga
  const st = nodeState(n), L = nodeLv(n), armed = treeArm === n.id, eq = n.kind === "perm" && progress.loadout.includes(n.who);
  const full = st === "max", stroke = full ? (eq ? "#c9a2ff" : "#3fe0a0") : armed ? "#ffd166" : st === "ready" ? "#7fa0e0" : "#2c3a5f";
  button(X, y, Wd, 40, "", () => tapNode(n), { stroke, fill: full ? "rgba(63,224,160,0.10)" : L ? "rgba(63,224,160,0.05)" : "rgba(18,30,58,0.92)" });
  txt(n.name, X + 10, y + 13, 12, st === "req" && !L ? "#6f82ad" : "#e8eefc", "left", "700");
  let sub = n.sub, subC = "#6f82ad";
  if (n.kind === "level" || n.kind === "ability") { sub = !L ? "Livello 1: " + n.fx(1) : n.fx(L) + (full ? "" : " → " + n.fx(L + 1)); subC = L ? "#9fb4d9" : "#6f82ad"; }
  if (armed) { sub = "Tocca di nuovo per spendere " + nodeCost(n) + " ◆"; subC = "#ffd166"; }
  else if (st === "req") sub = n.kind === "perm" ? "Prima tutti gli sblocchi della torretta" : n.kind === "level" || n.kind === "ability" ? "Prima il nodo “" + TREE_NODE[n.req[0]].name + "” al livello " + (L + 1) : "Prima il nodo sopra";
  else if (full && n.kind === "perm") { sub = eq ? "In campo dall’ondata 1 · tocca per togliere" : "Tocca per equipaggiare (" + progress.loadout.length + "/4)"; subC = eq ? "#c9a2ff" : "#9fb4d9"; }
  txt(sub, X + 10, y + 29, 10, subC, "left", "500");
  if (n.max > 1) txt(L + "/" + n.max, R - 44, y + 13, 10, L ? "#3fe0a0" : "#6f82ad", "right", "700");
  if (full) txt("✓", R - 12, y + 20, 15, "#3fe0a0", "right", "800");
  else txt(nodeCost(n) + " ◆", R - 10, y + (n.max > 1 ? 29 : 20), 12, st === "poor" ? "#ff7a7a" : st === "req" ? "#6f82ad" : "#c9a2ff", "right", "700");
}
function treeScreen() {
  dim(0.92);
  button(8, 8, 62, 30, "‹ Menu", closeTree, { size: 12 });
  txt("ALBERO DEI SIGILLI", W / 2 + 22, 18, 16, "#e8eefc", "center", "800");
  txt("◆ " + progress.seals + (progress.seals === 1 ? " Sigillo da spendere" : " Sigilli da spendere"), W / 2 + 22, 36, 11, "#c9a2ff", "center", "700");
  TREE_TABS.forEach(([id, label], i) => {
    const on = treeTab === id;
    button(16 + i * 112, 50, 104, 30, label, () => { treeTab = id; treeArm = null; },
      { size: 12, fill: on ? "rgba(201,162,255,0.18)" : "rgba(18,30,58,0.92)", stroke: on ? "#c9a2ff" : "#2c4272", color: on ? "#e8eefc" : "#9fb4d9" });
  });
  const rows = (list, y0) => list.forEach((n, i) => treeNodeRow(n, y0 + i * 45));
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

  if (state !== "menu" && state !== "save" && state !== "tree") {
    drawDomeFill(); drawGround();
    slots.forEach((s) => { if (s) drawTurret(s); });
    drawPlayer();
    enemies.forEach(drawEnemy);
    for (const o of ents) o.draw();
    drawDomeEdge(); drawFortress();
    for (const f of floaters) drawFloater(f);
    ctx.globalAlpha = 1;
    drawHud();
    if (state === "play") drawAlert();
    if (state === "play" && waveTime < 0) {
      ctx.globalAlpha = clamp(-waveTime / 0.6, 0, 1);
      txt("ONDATA " + wave, W / 2, 230, 30, "#e8eefc", "center", "800");
      if (skipNote) txt("Scelta già usata da una torretta equipaggiata", W / 2, 290, 12, "#c9a2ff", "center", "600");
      if (wave === N_WAVES && hasFinalBoss()) txt("Boss finale in arrivo", W / 2, 262, 14, "#ffd166", "center", "700");
      else if (hasMiniBosses() && CAMPAIGN.bossWaves.includes(wave)) txt("Mini-boss in arrivo", W / 2, 262, 14, "#ffd166", "center", "700");
      ctx.globalAlpha = 1;
    }
  }
  if (state === "menu" || state === "save") menuScreen();          // il pannello del salvataggio sta sopra al menu
  else if (state === "upgrade") upgradeScreen();
  else if (state === "won") wonScreen();
  else if (state === "lost") lostScreen();
  else if (state === "pause") pauseScreen();
  else if (state === "tree") treeScreen();
}

/* ---------- TORRETTE CON DISEGNO PROPRIO, PROIETTILI ED EFFETTI ---------- */
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
  ring(o, x, y, r1, color, life) {               // anello che si stringe e svanisce (esplosioni, impatti)
    const k = clamp(o.t / life, 0, 1); ctx.globalAlpha = k; ctx.strokeStyle = color; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(x, y, r1 * (1 - k * 0.9), 0, 6.2832); ctx.stroke(); ctx.globalAlpha = 1;
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
  zone(o, color) {                               // area a terra che dura
    ctx.globalAlpha = 0.22 * Math.min(1, o.t / 0.5); ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, 6.2832); ctx.fill();
    ctx.globalAlpha = 0.6 * Math.min(1, o.t / 0.5); ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke(); ctx.globalAlpha = 1;
  },
  missile(o, mini) {                             // Sky Guard · missile: corpo, punta e fiamma in coda
    const ca = Math.cos(o.a), sa = Math.sin(o.a), L = mini ? 5 : 8, wd = mini ? 1.6 : 2.5, x = o.x, y = o.y;
    disc(x - ca * (L + 2), y - sa * (L + 2), wd + 0.8, "#ffd18a", 0.85);
    poly([[x + ca * L, y + sa * L], [x - ca * L - sa * wd, y - sa * L + ca * wd], [x - ca * L + sa * wd, y - sa * L - ca * wd]], "#e8eefc", TYPES.fire.color, 1.2);
  },
  laserRays(rays) {                              // Laser · raggio principale e mini-raggi (con i rimbalzi sui bordi)
    for (const r of rays) for (const g of r.segs) glow(g.x1, g.y1, g.x2, g.y2, TYPES.energy.color, r.w * 0.45, 1);
  },
  laserSweep(o, w) {                             // Laser · spazzata
    for (const g of o.segs) glow(g.x1, g.y1, g.x2, g.y2, "#7ff6ff", w * 0.4, 0.9);
  },
  laserSpin(o, rays) {                           // combo Laser del guardiano · laser rotante
    for (const r of rays) for (const g of o.segs(r)) glow(g.x1, g.y1, g.x2, g.y2, TYPES.energy.color, r.w * 0.45, 1);
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
    for (let i = 0; i < 4; i++) { const a = i * 0.7854; ctx.moveTo(o.x - Math.cos(a) * 6, o.y - Math.sin(a) * 6); ctx.lineTo(o.x + Math.cos(a) * 6, o.y + Math.sin(a) * 6); }
    ctx.stroke(); disc(o.x, o.y, 4, "#26345c"); disc(o.x, o.y, 2.2, TYPES.physical.color, 0.6 + 0.4 * Math.sin(o.age * 6));
  },
  fieldOrb(o) {                                  // Thunderbolt · sfera del campo elettrico
    disc(o.x, o.y, 6, TYPES.electric.color, 0.9); ring(o.x, o.y, 0, "#fff", 0.001);
  },
  beamLinks(o, pos) {                            // Beam · raggio continuo e ramificazioni
    for (const [a, b] of o.links) glow(a.x, a.y - (a === pos ? 0 : 0), b.x, b.y, TYPES.energy.color, 2.6, 1);
  },
  wheelDrone(o, opt, trailT) {                   // Firewheel Drone · ruota di fuoco con la scia
    for (const p of o.trail) disc(p.x, p.y, 6, TYPES.fire.color, clamp(p.t / trailT, 0, 1) * 0.5);
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
  portals(o, A, rA, B) {                         // Gravity Vortex Gun · varchi: ingresso azzurro, uscita rosa
    const a = clamp(o.t / 0.6, 0, 1);
    for (const [p, r, c] of [[A, rA, "#7fe8ff"], [B, 18, "#ff9bf0"]]) {
      ctx.globalAlpha = a; ctx.strokeStyle = c; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.2832); ctx.stroke();
      ctx.globalAlpha = 0.25 * a; ctx.fillStyle = c; ctx.fill(); ctx.globalAlpha = 1;
    }
  },
  guardBullet(o, charged, clone, fan, frag) {    // guardiano · tracciante corto (il colpo caricato è più grande, con l’alone elettrico)
    if (charged) disc(o.x, o.y, 6, TYPES.electric.color, 0.35);
    ctx.globalAlpha = clone ? 0.6 : 1;
    ctx.strokeStyle = charged ? "#fff6b0" : TYPES.physical.color; ctx.lineWidth = charged ? 3.4 : fan || frag ? 1.4 : 2.2; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(o.x - o.vx * (charged ? 12 : 7), o.y - o.vy * (charged ? 12 : 7)); ctx.lineTo(o.x, o.y); ctx.stroke();
    ctx.globalAlpha = 1;
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
  drawTurret, drawPlayer, guardianShape, drawFloater, ICON_SHAPE, drawDomeFill, drawDomeEdge, drawGround, drawFortress, drawHud, drawAlert, ballLightning,
  menuScreen, upgradeScreen, rewardScreen, pauseScreen, wonScreen, lostScreen, ENEMY_NAME, txt, segs, rr, disc, glow, poly, button };
}
