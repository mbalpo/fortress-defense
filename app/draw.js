"use strict";
/* =====================================================================
   PLANET DEFENSE · DISEGNO
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
function drawGround() {
  ctx.fillStyle = "#14203f"; ctx.fillRect(0, GROUND_Y, W, GROUND_H);
  ctx.fillStyle = "#2c4272"; ctx.fillRect(0, GROUND_Y, W, 2);
  for (let i = 0; i < 4; i++) {
    if (slots[i]) continue;
    ctx.setLineDash([3, 3]); ctx.lineWidth = 1.2; ctx.strokeStyle = "#3a5084";
    ctx.strokeRect(SLOT_X[i] - 9, GROUND_Y - 8, 18, 8); ctx.setLineDash([]);
  }
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
  TURRET_ART[s.id](s.x, GROUND_Y, TYPES[s.def.type].color, s);   // s: la torretta (la grafica HD-2D orienta la canna dell’Aeroblast)
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
function guardianShape(x, mirror) {
  const g = GROUND_Y, f = frenzyOn(player), d = mirror ? -1 : 1, X = (v) => x + d * v;
  const suit = f ? "#5a3426" : "#2a3f6e", suit2 = f ? "#80492f" : "#3d5a9a", trim = f ? "#ff9a5a" : TYPES.physical.color, dark = "#0d1530";
  const glowC = f ? "#ffb347" : "#7fe8ff";
  const limb = (pts, w) => {                     // arto: contorno scuro e colore della tuta
    for (const [c, lw] of [[dark, w + 2], [suit2, w]]) {
      ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.beginPath(); pts.forEach(([a, b], k) => k ? ctx.lineTo(X(a), g + b) : ctx.moveTo(X(a), g + b)); ctx.stroke();
    }
  };
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  // gambe e stivali
  limb([[-3, -13], [-4, -4]], 4.2); limb([[3, -13], [4, -4]], 4.2);
  ctx.fillStyle = dark; rr(x - 8, g - 4, 7, 4, 1.5); ctx.fill(); rr(x + 1, g - 4, 7, 4, 1.5); ctx.fill();
  // zaino e busto
  ctx.fillStyle = dark; rr(x - 8, g - 27, 16, 12, 3); ctx.fill();
  ctx.fillStyle = suit2; rr(x - 6.5, g - 27, 13, 15, 4); ctx.fill(); ctx.strokeStyle = trim; ctx.lineWidth = 1.1; ctx.stroke();
  ctx.fillStyle = trim; ctx.fillRect(x - 5.5, g - 14.5, 11, 1.5);                      // cintura
  ctx.fillStyle = dark; rr(x - 3.5, g - 24, 7, 7, 1.5); ctx.fill();                     // zaino
  disc(x, g - 20.5, 1.5, glowC, 0.95);
  // elmetto integrale visto da dietro: calotta, visore che si intravede ai lati, antenna
  disc(x, g - 31, 5.2, suit2); ctx.strokeStyle = trim; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.arc(x, g - 31, 5.2, 0, 6.2832); ctx.stroke();
  ctx.strokeStyle = glowC; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(x, g - 31.5, 5.2, -0.45, 0.25); ctx.stroke(); ctx.beginPath(); ctx.arc(x, g - 31.5, 5.2, Math.PI - 0.25, Math.PI + 0.45); ctx.stroke();
  ctx.strokeStyle = trim; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(X(-2.5), g - 35.5); ctx.lineTo(X(-4.5), g - 40); ctx.stroke();
  disc(X(-4.5), g - 40, 1, f ? "#ffd166" : "#ff7a3d");
  // braccio destro alzato e teso: finisce nel cannone cibernetico (la bocca è GUN, da lì partono i colpi)
  const gx = X(GUN.dx), gy = g + GUN.dy;
  limb([[6, -25], [GUN.dx + 0.5, -40]], 4.4);
  ctx.fillStyle = dark; rr(gx - 4, g - 47, 8, 8, 2); ctx.fill();                       // attacco del cannone
  ctx.strokeStyle = trim; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = suit2; rr(gx - 2.6, gy + 1, 5.2, 9, 1.5); ctx.fill(); ctx.stroke();   // canna
  ctx.strokeStyle = glowC; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy + 3); ctx.lineTo(gx, g - 41); ctx.stroke();   // linea di energia
  disc(gx, gy + 0.5, 2.3, glowC, 0.95); disc(gx, gy + 0.5, 1, "#ffffff");               // bocca
  // braccio sinistro piegato: gomito verso l’esterno, la mano afferra l’attacco del cannone
  limb([[-6, -25], [-11, -36], [GUN.dx - 4, -44]], 4);
  disc(X(GUN.dx - 4), g - 44, 2.5, suit); ctx.strokeStyle = dark; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(X(GUN.dx - 4), g - 44, 2.5, 0, 6.2832); ctx.stroke();
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
  const c = e.flash > 0 ? "#ffffff" : TYPES[e.def.type].color, look = e.def.look || "rock";
  enemyBody(e, c, look);
  if (e.hp < e.maxHp || e.boss) enemyBar(e, look);
  drawStatus(e);
}
// corpo del nemico (c = colore del tipo, bianco nel lampo del colpo) e barra della vita: punti di aggancio della grafica HD-2D
function enemyBody(e, c, look) {
  const r = e.def.r, x = e.x, y = e.y, shade = "rgba(7,11,22,0.38)";
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
}
function enemyBar(e, look) {
  const r = e.def.r, x = e.x, w = r * 2, by = e.y - r * (look === "shard" ? 1.05 : 1) - 8;
  ctx.fillStyle = "rgba(7,11,22,0.8)"; ctx.fillRect(x - r, by, w, 3);
  ctx.fillStyle = TYPES[e.def.type].color; ctx.fillRect(x - r, by, w * clamp(e.hp / e.maxHp, 0, 1), 3);
}
function drawHud() {
  button(8, 10, 196, 32, "Bersaglio: " + TARGET_LABEL[settings.targeting], toggleTargeting);
  if (state === "play") {
    button(210, 10, 38, 32, "", pauseGame);
    ctx.fillStyle = "#e8eefc"; ctx.fillRect(222, 18, 4, 16); ctx.fillRect(232, 18, 4, 16);
  }
  txt("Ondata " + wave + "/" + N_WAVES, W - 10, 26, 14, "#e8eefc", "right", "700");
  if (state === "play") {                          // velocità della partita (1.14.1): tasto semitrasparente prima di “Nemici”
    ctx.save(); ctx.globalAlpha = settings.speed === 1 ? 0.55 : 0.85;
    button(8, 51, 38, 22, String(settings.speed).replace(".", ",") + "x", cycleSpeed, { size: 11, stroke: settings.speed === 1 ? "#2c4272" : "#3fe0a0" });
    ctx.restore();
  }
  txt("Nemici: " + (queue.length + enemies.length) + "", 52, 62, 12, "#9fb4d9", "left", "500");
  txt("Liv " + campLevel + " · " + MODES[mode].label + (mode === "epic" ? " (diff " + curDiff() + ")" : ""), W - 10, 62, 12, mode === "epic" ? "#ff7a3d" : "#9fb4d9", "right", "600");
  const fb = enemies.find((e) => e.final && !e.dead);
  if (fb) {                                          // boss finale: barra della vita grande, sempre visibile
    txt("BOSS FINALE", W / 2, 94, 11, "#ffd166", "center", "800");
    bossBar(fb.hp / fb.maxHp, TYPES[fb.def.type].color);
  } else if (enemies.some((e) => e.boss && !e.dead)) txt("MINI-BOSS", W / 2, 62, 12, "#ffd166", "center", "800");
  if (has(player, "frenzy1")) {
    const f = frenzyOn(player), k = f ? clamp(player.st.frenzyT / frenzyDur(player), 0, 1) : (player.st.charge || 0);
    frenzyBar(k, f);
    txt(f ? (player.st.paused ? "Frenesia in pausa" : "Frenesia!") : (k >= 1 ? "Frenesia pronta" : "Frenesia"), 126, 79, 10, f ? "#ff9a5a" : "#6f82ad", "left", "600");
  }
}
// contatore dei fotogrammi al secondo (1.13.0), acceso e spento toccando la versione nel menu: per provare la fluidità sul telefono
const FPS = { t: 0, n: 0, v: 0 };
function drawFps() {
  const now = performance.now();
  FPS.n++; if (now - FPS.t >= 500) { FPS.v = Math.round(FPS.n * 1000 / (now - FPS.t)); FPS.t = now; FPS.n = 0; }
  if (!settings.fps) return;
  txt(FPS.v + " fps", W - 10, 80, 10, FPS.v >= 50 ? "#3fe0a0" : FPS.v >= 30 ? "#ffd166" : "#ff5a5a", "right", "700");
}
// barre dell’HUD: vita del boss finale (k da 0 a 1) e carica della frenesia (f = in frenesia); punti di aggancio della grafica HD-2D
function bossBar(k, col) {
  rr(30, 100, 300, 12, 6); ctx.fillStyle = "rgba(7,11,22,0.85)"; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = "#ffd166"; ctx.stroke();
  k = clamp(k, 0, 1);
  if (k > 0) { rr(32, 102, 296 * k, 8, 4); ctx.fillStyle = col; ctx.fill(); }
}
function frenzyBar(k, f) {
  ctx.fillStyle = "rgba(7,11,22,0.8)"; ctx.fillRect(10, 76, 110, 6);
  ctx.fillStyle = f ? "#ff9a5a" : "#7fa0e0"; ctx.fillRect(10, 76, 110 * k, 6);
}
function drawFortress() {
  const y = H - FORT_H;
  ctx.fillStyle = "#101a33"; ctx.fillRect(0, y, W, FORT_H);
  const frac = clamp(domeHp / domeMax, 0, 1);
  ctx.fillStyle = frac > 0.35 ? "#3fe0a0" : "#ff5a5a"; ctx.fillRect(10, y + 9, (W - 20) * frac, 8);
  ctx.strokeStyle = "#2c4272"; ctx.lineWidth = 1; ctx.strokeRect(10, y + 9, W - 20, 8);
  // scritta bianca col contorno scuro: si legge anche sulla barra verde (1.12.5)
  ctx.font = "800 10px system-ui, -apple-system, Segoe UI, Roboto, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.lineJoin = "round"; ctx.lineWidth = 3; ctx.strokeStyle = "#070b16"; ctx.strokeText("Cupola " + Math.ceil(domeHp) + "/" + domeMax, W / 2, y + 13);
  ctx.fillStyle = "#ffffff"; ctx.fillText("Cupola " + Math.ceil(domeHp) + "/" + domeMax, W / 2, y + 13);
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
// pallino della carta col numero o la spunta, e il segno delle chain e dei level up sopra (aggancio HD-2D)
function cardBadge(o, cx, cy, c, label) {
  cardMark(o, cx, cy - 16, c);
  disc(cx, cy, 13, c);
  txt(label, cx, cy + 1, label === "✓" ? 14 : 13, "#070b16", "center", "800");
}
// segno sopra il pallino della carta (1.12.5): chain = catene verticali affiancate (una per livello della chain),
// level up = frecce ^ una sotto l’altra (una per livello); cx = centro del pallino, bot = sopra il pallino, c = colore del tipo
function cardMark(o, cx, bot, c) {
  const n = o.lv || 0; if (!n || (o.cat !== "chain" && o.cat !== "lu")) return;
  ctx.strokeStyle = c; ctx.lineCap = "round"; ctx.lineJoin = "round";
  if (o.cat === "chain") {
    for (let i = 0; i < n; i++) {
      const x = cx + (i - (n - 1) / 2) * 7;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(x, bot - 3.6, 2.2, 3.4, 0, 0, 6.2832); ctx.stroke();       // anello di fronte
      ctx.beginPath(); ctx.ellipse(x, bot - 14.4, 2.2, 3.4, 0, 0, 6.2832); ctx.stroke();
      ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(x, bot - 6.6); ctx.lineTo(x, bot - 11.4); ctx.stroke();   // anello di taglio tra i due
    }
  } else {
    ctx.lineWidth = 2;
    for (let i = 0; i < n; i++) { const y = bot - 1.5 - i * 5.5; ctx.beginPath(); ctx.moveTo(cx - 5, y); ctx.lineTo(cx, y - 4); ctx.lineTo(cx + 5, y); ctx.stroke(); }
  }
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
function menuTitle() { dim(0.8); txt("PLANET DEFENSE", W / 2, 70, 28, "#e8eefc", "center", "800"); }   // velo e titolo (aggancio HD-2D)
function menuScreen() {
  menuTitle();
  const eu = epicUnlocked(), mm = eu ? menuMode : "standard", ml = selOf(mm);   // selettore della modalità attiva (Epica: numerazione propria, 1.14.2)
  txt("Livelli completati: " + progress.cleared + (eu ? " · Epica " + progress.clearedEpic : "") + " · torri fino al lv " + towerCap(), W / 2, 104, 12, "#9fb4d9", "center", "500");
  button(36, 130, 56, 56, "−", () => setSel(mm, ml - 1), { size: 26 });
  button(268, 130, 56, 56, "+", () => setSel(mm, ml + 1), { size: 26 });
  if (eu) {                                      // striscia in basso: Standard ⇄ Epica (prima del riquadro, così vince il tocco)
    button(100, 166, 160, 22, "", () => { menuMode = mm === "epic" ? "standard" : "epic"; }, { fill: "rgba(0,0,0,0)", stroke: "rgba(0,0,0,0)" });
    button(100, 128, 160, 60, "", openLevels, { fill: "rgba(18,30,58,0.6)", stroke: mm === "epic" ? "#ff7a3d" : "#2c4272" });
    txt("Livello " + ml + " ▦", W / 2, 148, 22, "#e8eefc", "center", "800");
    txt((mm === "epic" ? "Epica" : "Standard") + " · difficoltà " + diffOf(ml, mm === "epic") + "  ⇄", W / 2, 177, 11, mm === "epic" ? "#ff9a66" : "#9fb4d9", "center", "600");
  } else {
    button(100, 128, 160, 60, "", openLevels, { fill: "rgba(18,30,58,0.6)", stroke: "#2c4272" });   // tocco: griglia dei livelli (1.12.3)
    txt("Livello " + ml + " ▦", W / 2, 150, 22, "#e8eefc", "center", "800");
    txt("difficoltà " + diffOf(ml, false), W / 2, 176, 11, "#6f82ad", "center", "500");
  }
  const r = suspended;
  if (r) {                                       // partita in sospeso (1.14.0): Continua sopra “Standard”, al posto delle istruzioni
    button(60, 196, 240, 50, "", continueRun, { stroke: "#ffd166", fill: "rgba(255,209,102,0.12)" });
    txt("Continua", W / 2, 212, 16, "#ffd166", "center", "800");
    txt("Livello " + r.lv + " · " + (r.mode === "epic" ? "Epica" : "Standard") + " · ondata " + r.wave + "/" + N_WAVES, W / 2, 233, 11, "#e8eefc", "center", "600");
  } else {
    txt("Il guardiano spara da solo. Tenendo premuto segue il dito:", W / 2, 208, 11, "#6f82ad", "center", "500");
    txt("colpisce il nemico nel mirino, altrimenti spara in alto", W / 2, 224, 11, "#6f82ad", "center", "500");
  }
  const ask = (m) => r && runArm === m;          // secondo tocco: sostituisce la partita in sospeso
  button(60, 254, 240, 46, ask("standard") ? "Sostituire la partita in sospeso?" : eu ? "Standard · livello " + selLevel : "Standard", () => startOrArm("standard"),
    { size: ask("standard") ? 13 : 16, stroke: ask("standard") ? "#ffd166" : "#3fe0a0", color: ask("standard") ? "#ffd166" : "#e8eefc" });
  button(60, 306, 240, 46, ask("epic") ? "Sostituire la partita in sospeso?" : eu ? "Epica · livello " + selEpic + " (diff. " + diffOf(selEpic, true) + ")" : "Epica · si sblocca al livello " + CAMPAIGN.epicUnlock,
    () => { if (eu) startOrArm("epic"); }, { size: ask("epic") ? 13 : eu ? 16 : 12, stroke: ask("epic") ? "#ffd166" : eu ? "#ff7a3d" : "#2c3a5f", color: ask("epic") ? "#ffd166" : eu ? "#e8eefc" : "#6f82ad" });
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
  // grafica (1.13.0): solo qui nel menu principale, perché vale dal caricamento successivo (la pagina si ricarica da sola)
  button(60, 603, 240, 22, "Grafica: " + (GFX_ON === "hd2d" ? "HD-2D" : "Classica") + "  ⇄", toggleGraphics, { size: 11, stroke: "#c9a2ff" });
  txt("Invio = Standard · E = Epica · ←/→ = livello", W / 2, 634, 10, "#5f7299", "center", "500");
  txt("v" + APP_VERSION + (LAUNCH ? " · " + LAUNCH : "") + (settings.fps ? " · fps" : ""), W - 8, 634, 9, settings.fps ? "#3fe0a0" : "#3a4a70", "right", "500");   // LAUNCH: tipo di avvio
  buttons.push({ x: W - 50, y: 626, w: 50, h: 14, onTap: toggleFps });   // tocco sulla versione: contatore dei fotogrammi al secondo
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
  if (g.why === "both") return ["+" + one(g.got) + " ◆ (" + one(progress.seals) + ")", "Primo completamento e cupola al 100%"];
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
  const more = campLevel < CAMPAIGN.maxLevel;     // anche in Epica, con il suo contatore (1.14.2)
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
    cardBadge(o, x + 26, y + h / 2, c, "✓");
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
    cardBadge(o, x + 26, y + h / 2, c, String(i + 1));
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
  const name = (ny) => txt(n.name, X + 10, ny, 12, st === "req" && !L ? "#6f82ad" : "#e8eefc", "left", "700");
  let sub = n.sub, subC = "#6f82ad";
  if (n.kind === "level" || n.kind === "ability") { sub = !L ? "Livello 1: " + n.fx(1) : n.fx(L) + (full ? "" : " → " + n.fx(L + 1)); subC = L ? "#9fb4d9" : "#6f82ad"; }
  if (armed) { sub = "Tocca di nuovo per spendere " + costLabel(n); subC = "#ffd166"; }
  else if (st === "req") sub = n.kind === "perm" ? "Prima tutti gli sblocchi della torretta" : n.kind === "level" || n.kind === "ability" ? "Prima il nodo “" + TREE_NODE[n.req[0]].name + "” al livello " + (L + 1) : "Prima il nodo sopra";
  else if (full && n.kind === "perm") { sub = eq ? "In campo dall’ondata 1 · tocca per togliere" : "Tocca per equipaggiare (" + progress.loadout.length + "/4)"; subC = eq ? "#c9a2ff" : "#9fb4d9"; }
  // descrizione su una riga o, se non ci sta, su due (1.14.2): a capo prima di “→ livello successivo”, altrimenti tra le parole
  const sw = Wd - 20 - tw(costLabel(n), 12, "700") - 8;
  if (tw(sub, 10, "500") <= sw) { name(y + 13); txt(sub, X + 10, y + 29, 10, subC, "left", "500"); }
  else {
    const k = sub.indexOf(" → "), two = k > 0 ? [sub.slice(0, k), sub.slice(k + 1)] : wrap(sub, sw, 9.5);
    name(y + 10); fitTxt(two[0], X + 10, y + 23, sw, 9.5, subC, "left", "500"); fitTxt(two.slice(1).join(" "), X + 10, y + 33, sw, 9.5, subC, "left", "500");
  }
  if (n.max > 1) txt(L + "/" + n.max, R - 44, y + 13, 10, L ? "#3fe0a0" : "#6f82ad", "right", "700");
  if (full) txt("✓", R - 12, y + 20, 15, "#3fe0a0", "right", "800");
  else txt(costLabel(n), R - 10, y + (n.max > 1 ? 29 : 20), 12, st === "poor" ? "#ff7a7a" : st === "req" ? "#6f82ad" : nodeMCost(n) ? "#ffd166" : "#c9a2ff", "right", "700");
}
function treeScreen() {
  dim(0.92);
  button(8, 8, 62, 30, "‹ Menu", closeTree, { size: 12 });
  txt("ALBERO DEI SIGILLI", W / 2 + 6, 18, 16, "#e8eefc", "center", "800");
  const rf = sectionRefund(treeSection()), armR = treeArm === "reset";
  if (runPending()) txt(SUSPENDED_MSG, W / 2 + 32, 36, 9, "#ffd166", "center", "600");   // sola lettura
  else if (armR) txt("Rimborso: " + rf.seals + " ◆ e " + rf.majors + " ✦ · tocca di nuovo “Azzera”", W / 2 + 22, 36, 10, "#ffd166", "center", "700");
  else txt("◆ " + progress.seals + (progress.seals === 1 ? " Sigillo" : " Sigilli") + " · ✦ " + progress.majors + (progress.majors === 1 ? " maggiore" : " maggiori") + " da spendere", W / 2 + 22, 36, 11, "#c9a2ff", "center", "700");
  if (!runPending() && rf.nodes)                 // azzeramento della sezione aperta: due tocchi
    button(292, 6, 60, 24, armR ? "Sicuro?" : "Azzera", tapReset, { size: 11, stroke: armR ? "#ffd166" : "#ff7a3d", color: armR ? "#ffd166" : "#e8eefc" });
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
  const open = abilitiesOpen(), eq = equippedAbilities(), nb = buttons.length;
  txt(open ? "Una abilità per gruppo · tocca il pallino per equipaggiarla" : "Si sbloccano completando il livello " + CAMPAIGN.barrierUnlock, 16, 128, 11, open ? "#9fb4d9" : "#ff9a5a", "left", "600");
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
  if (!open) {                                   // bloccata fino al 40 (1.14.0): overlay sopra le righe, che non rispondono ai tocchi
    buttons.length = nb;
    ctx.fillStyle = "rgba(7,11,22,0.78)"; ctx.fillRect(8, 136, W - 16, y - 136);
    const cy = 136 + (y - 136) / 2;
    rr(40, cy - 56, W - 80, 112, 12); ctx.fillStyle = "rgba(18,30,58,0.97)"; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = "#ff9a5a"; ctx.stroke();
    lockIcon(W / 2, cy - 30, 22, true, "#ff9a5a");
    txt("Abilità bloccate", W / 2, cy - 2, 15, "#e8eefc", "center", "800");
    txt("Si sbloccano completando il livello " + CAMPAIGN.barrierUnlock, W / 2, cy + 20, 11, "#9fb4d9", "center", "600");
    txt("Livelli completati: " + progress.cleared + "/" + CAMPAIGN.barrierUnlock, W / 2, cy + 38, 11, "#ffd166", "center", "700");
  }
}
// lucchetto (1.14.0): centro (x, y), altezza s; chiuso o aperto
function lockIcon(x, y, s, closed, c) {
  const k = s / 20;
  ctx.beginPath(); ctx.arc(x, y - 2 * k, 5 * k, Math.PI, closed ? 0 : -0.35 * Math.PI); if (closed) ctx.lineTo(x + 5 * k, y + 1 * k);
  ctx.moveTo(x - 5 * k, y - 2 * k); ctx.lineTo(x - 5 * k, y + 1 * k);
  ctx.lineWidth = 2 * k; ctx.strokeStyle = c; ctx.stroke();
  rr(x - 7.5 * k, y, 15 * k, 10 * k, 2 * k); ctx.fillStyle = closed ? c : "rgba(0,0,0,0)"; ctx.fill(); ctx.lineWidth = 1.4 * k; ctx.stroke();
  disc(x, y + 5 * k, 1.6 * k, closed ? "#070b16" : c);
}
// pulsante del lucchetto: 28×h, a destra delle righe
function lockButton(x, y, h, closed, onTap) {
  button(x, y, 28, h, "", onTap, { stroke: closed ? "#ffd166" : "#2c4272", fill: closed ? "rgba(255,209,102,0.12)" : "rgba(18,30,58,0.92)" });
  lockIcon(x + 14, y + h / 2 - 1, Math.min(18, h - 4), closed, closed ? "#ffd166" : "#6f82ad");
}

/* ---------- EQUIPAGGIAMENTO ---------- */
// colore della rarità: pieno, l’ancestrale iridescente (la tinta gira col tempo)
const rarColor = (r) => r === 4 ? "hsl(" + Math.round((clock * 90) % 360) + ",85%,70%)" : RARITY[r].color;
const RAR_SHORT = ["Comune", "Raro", "Epico", "Legg.", "Ancest."];
const rarArt = (r) => ["il comune", "il raro", "l’epico", "il leggendario", "l’ancestrale"][r];   // rarità con l’articolo (“sostituisce l’epico”)
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
    lockButton(220, y - 8, 26, !!e.lk, tapLockEq);
    button(252, y - 8, 96, 26, arm ? "Tocca ancora" : "Togli", tapUnequip, { size: 11, stroke: arm ? "#ffd166" : "#2c4272", color: arm ? "#ffd166" : "#9fb4d9" });
    for (let i = 0; i <= e.r; i++) {
      const yy = y + 30 + i * 26, m = e.m[i];
      if (m) {
        const armed = gearArm === "s" + i;
        lockButton(320, yy, 24, !!m[2], () => tapLockSlot(i));
        button(12, yy, 304, 24, "", () => tapSlot(i), { stroke: armed ? "#ffd166" : rarColor(m[1]) });
        modIcon(pc, 25, yy + 12, 16, rarColor(m[1]));
        fitTxt(armed ? "Tocca di nuovo per togliere il Modulo" : modText(m[0], m[1]), 36, yy + 12, 274, 11, armed ? "#ffd166" : "#e8eefc", "left", "600");
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
    // righe per rarità; gli esemplari bloccati hanno una riga a parte (1.14.0), che non si scarta e non si fonde
    const rows = [];
    for (let r = 0; r < 5; r++) {
      const k = pcKey(pc, r), u = freeN(g, "pcs", k), l = lockN(g, k);
      if (u || !l) rows.push({ r, lk: false, n: u }); if (l) rows.push({ r, lk: true, n: l });
    }
    const step = Math.min(40, 226 / rows.length), h = step - 4, compact = h < 30;
    rows.forEach(({ r, lk, n }, i) => {
      const yy = y + i * step, armed = gearArm === "p" + r + (lk ? "L" : ""), k = pcKey(pc, r);
      let sub = "";
      if (gearMode === "use") {
        const pv = equipPreview(pc, r);
        sub = !n ? "" : pv.same ? "Uguale a quello equipaggiato" : armed ? "Tocca di nuovo: " + STAT_TXT[P.stat] + " +" + fmt(pv.from) + "% → +" + fmt(pv.to) + "%"
          + (pv.back ? " · " + pv.back + (pv.back === 1 ? " Modulo torna" : " Moduli tornano") + " in inventario" : "") : "Tocca per equipaggiare (" + (r + 1) + " slot)";
      } else if (lk) sub = n ? "Bloccati: togli il lucchetto per " + (gearMode === "fuse" ? "fonderli" : "scartarli") : "";
      else if (gearMode === "fuse") sub = r >= 4 ? "Rarità massima" : n >= 5 ? (armed ? "Tocca di nuovo: 5 → 1 " + RARITY[r + 1].name.toLowerCase() : "5 → 1 " + RARITY[r + 1].name.toLowerCase()) : "Servono 5 pezzi uguali non bloccati";
      else sub = n ? (armed ? "Tocca di nuovo per scartarne uno" : "Tocca per scartarne uno") : "";
      if (n) lockButton(320, yy, h, lk, () => tapLock("pcs", k, lk));
      button(12, yy, n ? 304 : 336, h, "", () => tapPiece(r, lk), { stroke: armed ? "#ffd166" : n ? rarColor(r) : "#24345a", fill: n ? "rgba(18,30,58,0.92)" : "rgba(10,16,32,0.6)" });
      pieceIcon(pc, 32, yy + h / 2, Math.min(22, h - 4), n ? rarColor(r) : "#3a4a70");
      txt("×" + n, n ? 308 : 338, yy + (compact ? h / 2 : 12), compact ? 10 : 12, n ? "#e8eefc" : "#4a5a80", "right", "700");
      if (compact) {
        txt(RAR_SHORT[r], 52, yy + h / 2, 10, n ? rarColor(r) : "#4a5a80", "left", "700");
        if (sub) fitTxt(sub, 104, yy + h / 2, 170, 9, armed ? "#ffd166" : "#8a9ac0", "left", "500");
      } else {
        txt(RARITY[r].name, 52, yy + 12, 12, n ? rarColor(r) : "#4a5a80", "left", "700");
        if (sub) fitTxt(sub, 52, yy + 27, 254, 10, armed ? "#ffd166" : "#8a9ac0", "left", "500");
      }
    });
  } else {
    for (let r = 0; r < 5; r++) {
      const on = gearRar === r, n = Object.entries(g.mods).reduce((a, [k, v]) => a + (k.startsWith(pc + ":" + r + ":") ? v : 0), 0);
      button(12 + r * 68, y, 64, 22, "", () => gearSetRar(r), { stroke: on ? rarColor(r) : "#2c4272", fill: on ? "rgba(127,160,224,0.14)" : "rgba(18,30,58,0.92)" });
      txt(RAR_SHORT[r] + " " + n, 44 + r * 68, y + 12, 10, n || on ? rarColor(r) : "#4a5a80", "center", "700");
    }
    const rows = [];
    for (const fx of P.pool) {
      const k = modKey(pc, gearRar, fx), u = freeN(g, "mods", k), l = lockN(g, k);
      if (u) rows.push({ fx, lk: false, n: u }); if (l) rows.push({ fx, lk: true, n: l });
    }
    if (!rows.length) txt("Nessun Modulo " + RARITY[gearRar].name.toLowerCase() + " per questo pezzo", W / 2, y + 50, 11, "#6f82ad", "center", "500");
    const step = Math.min(23, 196 / Math.max(1, rows.length)), h = step - 2, fs = step < 18 ? 9 : 10;
    rows.forEach(({ fx, lk, n }, i) => {
      const yy = y + 28 + i * step, armed = gearArm === "m" + fx + (lk ? "L" : ""), sel = lk ? 0 : gearFuse[fx] || 0, k = modKey(pc, gearRar, fx);
      let label = modText(fx, gearRar);
      if (armed && gearMode === "use") {
        const old = (progress.gear.eq[pc] || { m: [] }).m.find((x) => x[0] === fx);
        label = old ? "Tocca di nuovo: sostituisce " + rarArt(old[1]) : "Tocca di nuovo per installarlo";
      } else if (armed) label = "Tocca di nuovo per scartarne uno";
      lockButton(320, yy, h, lk, () => tapLock("mods", k, lk));
      button(12, yy, 304, h, "", () => tapMod(fx, lk), { stroke: armed ? "#ffd166" : sel ? "#c9a2ff" : lk ? "#6b5a2a" : "#2c4272" });
      modIcon(null, 22, yy + h / 2, Math.min(13, h - 4), rarColor(gearRar));
      const right = (sel ? sel + " scelti · " : "") + "×" + n;
      fitTxt(label, 34, yy + h / 2, 266 - tw(right, fs, "700"), fs, armed ? "#ffd166" : "#e8eefc", "left", "600");
      txt(right, 308, yy + h / 2, fs, sel ? "#c9a2ff" : "#9fb4d9", "right", "700");
    });
  }
  if (gearMsg) fitTxt(gearMsg, W / 2, 630, 340, 10, "#ffd166", "center", "600");
  else if (runPending()) txt(SUSPENDED_MSG, W / 2, 630, 10, "#ffd166", "center", "600");   // sola lettura (i lucchetti restano usabili)
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
    button(16 + i * 168, 46, 160, 30, label, () => { if (!off && lvMode !== id) lvTab(id); },
      { size: 12, fill: on ? "rgba(63,224,160,0.12)" : "rgba(18,30,58,0.92)", stroke: on ? c : "#2c4272", color: off ? "#5f7299" : on ? "#e8eefc" : "#9fb4d9" });
  });
  const pages = Math.ceil(CAMPAIGN.maxLevel / 50);
  for (let i = 0; i < pages; i++) {
    const on = lvPage === i, open = i * 50 + 1 <= maxSelectable(lvMode);
    button(16 + i * 84, 82, 80, 26, (i * 50 + 1) + "-" + Math.min(CAMPAIGN.maxLevel, i * 50 + 50), () => { lvPage = i; },
      { size: 11, fill: on ? "rgba(127,160,224,0.18)" : "rgba(18,30,58,0.92)", stroke: on ? "#7fa0e0" : "#2c4272", color: open ? (on ? "#e8eefc" : "#9fb4d9") : "#5f7299" });
  }
  button(16, 114, 328, 24, (lvFilter ? "☑" : "☐") + " Solo i livelli con Sigilli da prendere", () => { lvFilter = !lvFilter; },
    { size: 11, stroke: lvFilter ? "#c9a2ff" : "#2c4272", color: lvFilter ? "#e8eefc" : "#9fb4d9" });
  for (let i = 0; i < 50; i++) {
    const lv = lvPage * 50 + i + 1; if (lv > CAMPAIGN.maxLevel) break;
    const x = 12 + (i % 5) * 68, y = 144 + Math.floor(i / 5) * 43;
    const open = lv <= maxSelectable(lvMode), done = lv <= (lvMode === "epic" ? progress.clearedEpic : progress.cleared);
    const st = sealStatus(lvMode, lv), dimmed = !open || (lvFilter && !sealsOpen(lvMode, lv)), sel = lv === lvSel;
    button(x, y, 64, 40, "", () => pickLevel(lv), { stroke: sel ? "#ffd166" : !open ? "#1c2a4a" : done ? "#3fe0a0" : "#7fa0e0",
      fill: sel ? "rgba(255,209,102,0.16)" : dimmed ? "rgba(10,16,32,0.6)" : "rgba(18,30,58,0.92)" });
    txt(String(lv), x + 32, y + 14, 13, dimmed ? "#4a5a80" : lv % 10 === 0 ? "#ffd166" : "#e8eefc", "center", "800");   // muri in giallo
    if (!open) continue;
    if (st.first !== "no") { ctx.globalAlpha = dimmed ? 0.4 : 1; sealGem(x + 24, y + 29, 4.5, st.first === "got"); sealGem(x + 40, y + 29, 4.5, st.full === "got"); ctx.globalAlpha = 1; }
    else if (done) txt("✓", x + 32, y + 29, 11, "#3fe0a0", "center", "800");
  }
  fitTxt("◆ preso · ◇ da prendere (1° completamento, cupola al 100%) · giallo: muro", W / 2, 579, 336, 10, "#8a9ac0", "center", "500");
  const can = lvSel <= maxSelectable(lvMode) && (lvMode === "standard" || eu);
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
  ctx.globalAlpha = clamp(f.life / (f.max || 0.7), 0, 1); txt(f.txt, f.x, f.y, f.size || 12, f.color, "center", "700");   // contrattacco: più grande (1.14.2)
}
// punti di aggancio della grafica HD-2D (app/draw-hd2d.js li sostituisce): cielo, mondo della battaglia, fondo dei menu
function drawSky() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#0a1020"); g.addColorStop(1, "#16254a");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#9fb4d9";
  for (const s of stars) { ctx.globalAlpha = s.a; ctx.fillRect(s.x, (s.y + clock * s.v) % H, s.s, s.s); }
  ctx.globalAlpha = 1;
}
function drawWorld() {
  drawDomeFill(); drawGround();
  slots.forEach((s) => { if (s) drawTurret(s); });
  drawPlayer();
  if (pressing && state === "play") drawCrosshair(press.x, press.y, !!nearestTo(press.x, press.y, PRESS_PICK));
  for (const o of ents) if (o.under) o.draw();   // aree a terra (Area infuocata) sotto i nemici
  enemies.forEach(drawEnemy);
  for (const o of ents) if (!o.under) o.draw();
  drawDomeEdge(); drawFortress();
}
function drawMenuBack() {}
const MENU_STATES = ["menu", "save", "tree", "gear", "levels", "guide"];
function draw() {
  buttons = [];
  drawSky();
  if (!MENU_STATES.includes(state)) {
    drawWorld();
    for (const f of floaters) drawFloater(f);
    ctx.globalAlpha = 1;
    drawHud();
    drawFps();
    if (state === "play") drawAlert();
    if (state === "play" && waveTime < 0) {
      ctx.globalAlpha = clamp(-waveTime / 0.6, 0, 1);
      txt("ONDATA " + wave, W / 2, 230, 30, "#e8eefc", "center", "800");
      if (wave === N_WAVES && hasFinalBoss()) txt("Boss finale in arrivo", W / 2, 262, 14, "#ffd166", "center", "700");
      else if (hasMiniBosses() && CAMPAIGN.bossWaves.includes(wave)) txt("Mini-boss in arrivo", W / 2, 262, 14, "#ffd166", "center", "700");
      ctx.globalAlpha = 1;
    }
  }
  else drawMenuBack();
  if (state === "menu" || state === "save") menuScreen();          // il pannello del salvataggio sta sopra al menu
  else if (state === "upgrade") upgradeScreen();
  else if (state === "won") { wonScreen(); if (unlockNotes.length) unlockScreen(); }
  else if (state === "lost") lostScreen();
  else if (state === "pause") pauseScreen();
  else if (state === "tree") treeScreen();
  else if (state === "gear") gearScreen();
  else if (state === "levels") levelsScreen();
  else if (state === "guide") guideScreen();
  if (rangeShow && (state === "play" || state === "pause")) drawRange();   // raggio d’azione al tocco: sopra tutto, anche in pausa
}
// raggio d’azione di una torretta toccata (1.14.2): arco centrato dove parte il guardiano (come la portata nella logica), rosso come il profilo della barriera, trasparente alla base e più visibile in cima;
// oltre 500 px niente arco, solo un velo rosso su tutto lo schermo con la stessa sfumatura. Entra in 0,15 s ed esce in 0,3 s.
function drawRange() {
  const q = rangeShow, s = slots[q.i]; if (!s) return;
  const age = rtime - q.t0, a = clamp(Math.min(age / 150, (RANGE_TAP.show - age) / 300), 0, 1); if (a <= 0) return;
  const x = RANGE_FROM.x, y = RANGE_FROM.y, r = rangeReach(s), top = Math.max(0, y - r);   // portata misurata dal punto di partenza del guardiano
  const grad = (k) => { const g = ctx.createLinearGradient(0, y, 0, top); g.addColorStop(0, "rgba(255,72,72,0)"); g.addColorStop(1, "rgba(255,72,72," + k + ")"); return g; };
  ctx.save(); ctx.globalAlpha = a;
  if (r > RANGE_TAP.veil) { ctx.fillStyle = grad(0.32); ctx.fillRect(0, 0, W, y); }
  else {
    ctx.beginPath(); ctx.rect(0, 0, W, y); ctx.clip();                    // solo sopra la torretta, tagliato ai bordi dello schermo
    ctx.beginPath(); ctx.arc(x, y, r, Math.PI, Math.PI * 2); ctx.closePath(); ctx.fillStyle = grad(0.14); ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, r, Math.PI, Math.PI * 2); ctx.lineWidth = 2.5; ctx.strokeStyle = grad(0.6); ctx.stroke();
  }
  ctx.restore();
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
  fireField(o) {                                 // Sky Guard · Area infuocata: disco di brace con lingue di fuoco che tremolano e scintille
    const fade = Math.min(1, o.t / 0.5, o.age / 0.15), r = o.r, x = o.x, y = o.y;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(255,200,90,0.45)"); g.addColorStop(0.6, "rgba(255,110,40,0.3)"); g.addColorStop(1, "rgba(200,40,20,0.06)");
    ctx.globalAlpha = fade; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
    const n = Math.max(8, Math.round(r / 4));
    for (let k = 0; k < n; k++) {                // lingue sul bordo, dal basso verso l’alto
      const a = k * 6.2832 / n, f = 0.5 + 0.5 * Math.sin(o.age * 9 + k * 1.7);
      flame(x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8, 9 + 9 * f, 4.5, fade);
    }
    for (let k = 0; k < 6; k++) {                // lingue interne e scintille che salgono
      const a = k * 1.9 + 0.6, d = r * (0.1 + 0.1 * k), f = 0.5 + 0.5 * Math.sin(o.age * 11 + k * 2.3);
      flame(x + Math.cos(a) * d, y + Math.sin(a) * d, 12 + 10 * f, 5.5, fade);
      const sy = (o.age * 26 + k * 9) % 22;
      disc(x + Math.cos(a * 2) * d * 0.8, y - sy, 1.2, "#ffe0b0", fade * (1 - sy / 22));
    }
    ctx.globalAlpha = 1;
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
  missile(o, mini) {                             // Sky Guard · missile: corpo, punta e fiamma in coda (combo Missili sovraccarichi: alone elettrico che crepita)
    const ca = Math.cos(o.a), sa = Math.sin(o.a), L = mini ? 5 : 8, wd = mini ? 1.6 : 2.5, x = o.x, y = o.y;
    if (o.charged) { disc(x, y, 9, TYPES.electric.color, 0.25 + 0.15 * Math.sin(o.age * 40)); disc(x, y, 5, "#fff6b0", 0.35); }
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
    FX.fireTrail(o.trail, trailT);
    ctx.globalAlpha = 0.18; ctx.fillStyle = TYPES.fire.color; ctx.beginPath(); ctx.arc(o.x, o.y, opt.rad, 0, 6.2832); ctx.fill(); ctx.globalAlpha = 1;
    for (let k = 0; k < 3; k++) { const aa = o.rot + k * 2.0944; glow(o.x, o.y, o.x + Math.cos(aa) * opt.rad, o.y + Math.sin(aa) * opt.rad, "#ffb347", 2, 0.8); }
    disc(o.x, o.y, opt.mini ? 3 : 5, "#ffe0b0");
  },
  fireTrail(pts, trailT) {                       // Firewheel Drone · scia di fuoco (anche delle combo Droni incendiari e Fulmini di fuoco)
    for (const p of pts) {                       // scia di fuoco (1.12.2): brace e due lingue che tremolano e si spengono
      const q = clamp(p.t / trailT, 0, 1), f = 0.5 + 0.5 * Math.sin(clock * 10 + p.x * 0.37 + p.y * 0.21);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 14);
      g.addColorStop(0, "rgba(255,170,60," + (0.5 * q) + ")"); g.addColorStop(1, "rgba(255,80,30,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, 14, 0, 6.2832); ctx.fill();
      flame(p.x - 6, p.y + 5, (9 + 6 * f) * q + 3, 4, q);
      flame(p.x + 1, p.y + 6, (13 + 6 * (1 - f)) * q + 3, 4.5, q);
      flame(p.x + 7, p.y + 4, (8 + 5 * f) * q + 3, 3.5, q);
    }
    ctx.globalAlpha = 1;
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
  hiveBeam(o, e) {                               // combo Droni a raggio (Hive + Beam) · raggio dal drone al bersaglio, nel colore del livello del drone
    const c = ["#b07cff", "#d9a4ff", "#ff9be6"][o.lvl - 1], k = clamp(o.ray.t / 0.3, 0, 1);
    glow(o.x, o.y, e.x, e.y, c, 1.6 + o.lvl * 0.6, k); disc(e.x, e.y, 4 + o.lvl, c, 0.5 * k);
  },
  hiveSparks(o) {                                // combo Droni statici (Hive + Teslacoil) · scintille elettriche attorno al drone
    const t = typeof clock === "number" ? clock : 0;
    ctx.strokeStyle = "#fff6b0"; ctx.lineWidth = 1.1; ctx.lineCap = "round";
    for (let j = 0; j < 4; j++) {
      const a = t * (j % 2 ? 7 : -6) + j * 1.57, r1 = 7 + o.lvl, r2 = r1 + 6 + 3 * Math.sin(t * 31 + j * 2);
      ctx.globalAlpha = 0.4 + 0.5 * Math.abs(Math.sin(t * 23 + j));
      ctx.beginPath(); ctx.moveTo(o.x + Math.cos(a) * r1, o.y + Math.sin(a) * r1);
      ctx.lineTo(o.x + Math.cos(a + 0.35) * (r1 + r2) / 2, o.y + Math.sin(a + 0.35) * (r1 + r2) / 2); ctx.lineTo(o.x + Math.cos(a - 0.1) * r2, o.y + Math.sin(a - 0.1) * r2); ctx.stroke();
    }
    ctx.globalAlpha = 1;
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
      ctx.globalAlpha = 1;
    }
  },
  guardBullet(o, charged, clone, fan, frag, tint) {   // guardiano · tracciante corto (il colpo caricato è più grande, con l’alone elettrico; tint = colore del tipo con le combo fuoco/force)
    if (charged) disc(o.x, o.y, 6, TYPES.electric.color, 0.35);
    ctx.globalAlpha = clone ? 0.6 : 1;
    ctx.strokeStyle = charged ? "#fff6b0" : tint || TYPES.physical.color; ctx.lineWidth = charged ? 3.4 : fan || frag ? 1.4 : 2.2; ctx.lineCap = "round";
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

// grafica HD-2D (1.13.0): app/draw-hd2d.js definisce FORTRESS_DRAW_HD, che si innesta qui (valutata in questo ambito, sostituisce funzioni
// e aggiunge voci a TURRET_ART e FX) se la grafica scelta nel menu è "hd2d". Le impostazioni del gioco qui non esistono ancora:
// si leggono dal localStorage (stessa chiave di SETTINGS_KEY); window.FORTRESS_GFX la impone (catalogo alternativo, test)
const GFX = (() => {
  try { return window.FORTRESS_GFX || (JSON.parse(localStorage.getItem("fortress-proto-v1") || "null") || {}).graphics || "classic"; } catch (e) { return "classic"; }
})();
const GFX_ON = GFX === "hd2d" && typeof FORTRESS_DRAW_HD === "function" ? "hd2d" : "classic";
let GFX_INFO = null;                             // la grafica HD-2D ci mette le sue informazioni per i test (dimensione della cache degli sprite)
if (GFX_ON === "hd2d") eval("(" + FORTRESS_DRAW_HD + ")")();

// quello che serve fuori: il gioco usa draw, FX, thunderDraw e teslaDraw; il catalogo anche il resto
return { draw, FX, thunderDraw, teslaDraw, TURRET_ART, BODY, BODY2, DARK, STATUS_ICONS, statusIcon, drawStatus, drawEnemy, enemyIcon,
  drawTurret, drawPlayer, guardianShape, drawCrosshair, unlockScreen, drawFloater, ICON_SHAPE, drawDomeFill, drawDomeEdge, drawGround, drawFortress, drawHud, drawAlert, ballLightning,
  menuScreen, upgradeScreen, rewardScreen, pauseScreen, wonScreen, lostScreen, ENEMY_NAME, txt, segs, rr, disc, glow, poly, button,
  PIECE_ART, pieceIcon, modIcon, rarColor, cardMark, GFX_ON, GFX_INFO };
}
