// Icona del gioco (1.25.1, DESIGN.md § 7): meteorite gigante che scende in diagonale verso la barriera, con il lampo del primo contatto e le stelle.
// Disegnata con il codice di disegno del gioco (cielo, cupola e Meteorite gigante di draw.js / draw-hd2d.js) in jsdom, poi ridotta alle misure delle icone.
// Uso:
//   node tests/tools/icona.js               → docs/anteprima-icona.html (due varianti, quattro misure, maskable col ritaglio, lettura a 48 px)
//   node tests/tools/icona.js --usa hd2d    → scrive i quattro PNG di app/ con la variante scelta (classica o hd2d): solo dopo la scelta di Marco
// Composizione [Claude, da rivedere]: meteorite di raggio 120 (unità del gioco) con il centro in (265, 177) in un riquadro di 360 × 360, ruotato di 0,6 rad
// (la scia punta in alto a destra), barriera con il bordo acceso come quando viene colpita e la base appena sotto il bordo dell’icona; maskable: tutto ridotto all’80% attorno al centro.
"use strict";
const fs = require("fs"), path = require("path");
const { JSDOM } = require("jsdom");
const { createCanvas, loadImage } = require("@napi-rs/canvas");
const { gameHtml } = require("../src");
const ROOT = path.join(__dirname, "..", ".."), APP = path.join(ROOT, "app"), OUT = path.join(ROOT, "docs", "anteprima-icona.html");
const DPR = 4.8;                                   // canvas di gioco a 360 × 640 unità → 1728 × 3072 pixel: il riquadro dell’icona è 1728 px di lato
const SIZES = [["icon-512.png", 512, false], ["icon-192.png", 192, false], ["icon-180.png", 180, false], ["icon-maskable-512.png", 512, true]];

// disegna l’icona nel riquadro 360 × 360 in alto a sinistra del canvas del gioco; z = scala del soggetto attorno al centro (maskable 0,8)
const COMPOSE = (z) => `(() => {
  const S = 360, k = ctx.canvas.width / W;
  ctx.setTransform(k, 0, 0, k, 0, 0); ctx.clearRect(0, 0, S, S);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, S, S); ctx.clip();
  clock = 7.3;                                     // istante fisso: stelle, fiamme e tremolio sempre uguali
  ctx.save(); ctx.translate(0, -40); DRAW.drawSky(); ctx.restore();                 // cielo con le stelle (fino al bordo, anche nella maskable)
  ctx.translate(S / 2, S / 2); ctx.scale(${z}, ${z}); ctx.translate(-S / 2, -S / 2);
  // barriera: la cupola del gioco con il bordo acceso dal colpo (domeFlash), con la base sotto il bordo dell’icona
  ctx.save(); ctx.translate(0, 372 - GROUND_Y); domeHp = domeMax; domeFlash = 0.25; DRAW.drawDomeFill(); DRAW.drawDomeEdge(); domeFlash = 0; ctx.restore();
  // Meteorite gigante (lo stesso disegno della Protezione planetaria), ruotato: scende verso il basso a sinistra, la scia va in alto a destra
  // contatto: il punto della barriera più vicino al centro del meteorite; il meteorite si accosta lungo quella direzione finché la tocca appena (0,93 R)
  const R = 120, ANG = 0.6, BY = 372; let MX = 265, MY = 177, best = null;
  for (let t = Math.PI; t <= 2 * Math.PI; t += 0.002) { const px = DOME.cx + DOME.rx * Math.cos(t), py = BY + DOME.ry * Math.sin(t), d = Math.hypot(px - MX, py - MY); if (!best || d < best.d) best = { px, py, d }; }
  const ux = (MX - best.px) / best.d, uy = (MY - best.py) / best.d; MX = best.px + ux * R * 0.93; MY = best.py + uy * R * 0.93;
  const def = { type: "physical", look: "bigrock", name: "Meteorite", r: R, giant: true, boss: true, final: true, planet: true, hp: 1, speed: 0, dmg: 8, kbRes: 1, statRes: 0.6, split: 0 };
  const e = { def, x: 0, y: 0, hp: 1, maxHp: 1, totMax: 1, flash: 0, phase: 0, shape: DRAW.ICON_SHAPE, rot: 0.4, spin: 0, boss: true, final: true, w: 20 };
  ctx.save(); ctx.translate(MX, MY); ctx.rotate(ANG); DRAW.drawEnemy(e); ctx.restore();
  // lampo del primo contatto, dove il bordo davanti del meteorite tocca la barriera
  const fx = best.px, fy = best.py;
  for (const [r, a, c] of [[70, 0.35, "255,170,80"], [34, 0.7, "255,230,170"], [12, 1, "255,255,240"]]) {
    const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, r); g.addColorStop(0, "rgba(" + c + "," + a + ")"); g.addColorStop(1, "rgba(" + c + ",0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(fx, fy, r, 0, 6.2832); ctx.fill();
  }
  ctx.restore(); ctx.setTransform(k, 0, 0, k, 0, 0);
})()`;

// una variante ("" classica, "hd2d"): immagine grande (1728 px) normale e maskable
async function render(gfx) {
  const src = gameHtml(null, gfx || undefined).replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();");
  const errors = [];
  const dom = new JSDOM(src, { runScripts: "dangerously", pretendToBeVisual: true, url: "http://localhost/",
    beforeParse(w) { w.devicePixelRatio = DPR / 1.2; w.requestAnimationFrame = () => 1; w.addEventListener("error", (e) => errors.push(e.message));
      let s = 12345; w.Math.random = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); } });
  const w = dom.window; w.document.getElementById("splash").click();
  const cv = w.document.getElementById("c"), out = {};
  for (const [name, z] of [["normale", 1], ["maskable", 0.8]]) {
    w.__ev(COMPOSE(z));
    if (errors.length) throw new Error((gfx || "classica") + ": " + errors[0]);
    const full = await loadImage(Buffer.from(cv.toDataURL("image/png").split(",")[1], "base64")), side = Math.round(360 * cv.width / 360);
    const c = createCanvas(side, side); c.getContext("2d").drawImage(full, 0, 0, side, side, 0, 0, side, side);
    out[name] = c;
  }
  dom.window.close();
  return out;
}
// riduzione a metà per volta (meno scalettature), poi alla misura esatta
function shrink(src, size) {
  let cur = src;
  while (cur.width / 2 >= size) { const c = createCanvas(Math.round(cur.width / 2), Math.round(cur.height / 2)), x = c.getContext("2d"); x.imageSmoothingQuality = "high"; x.drawImage(cur, 0, 0, c.width, c.height); cur = c; }
  const c = createCanvas(size, size), x = c.getContext("2d"); x.imageSmoothingQuality = "high"; x.drawImage(cur, 0, 0, size, size); return c;
}
const png = (c) => c.toBuffer("image/png"), uri = (c) => "data:image/png;base64," + png(c).toString("base64");

async function main() {
  const use = process.argv.indexOf("--usa") >= 0 ? process.argv[process.argv.indexOf("--usa") + 1] : null;
  if (use) {
    if (!["classica", "hd2d"].includes(use)) throw new Error("--usa classica oppure --usa hd2d");
    const r = await render(use === "hd2d" ? "hd2d" : "");
    for (const [f, n, mask] of SIZES) { fs.writeFileSync(path.join(APP, f), png(shrink(mask ? r.maskable : r.normale, n))); console.log("  app/" + f + " (" + n + " px)"); }
    console.log("Icone sostituite con la variante " + use + ": alza APP_VERSION e la versione di sw.js (DESIGN.md § 7).");
    return;
  }
  const V = {};
  for (const [id, gfx] of [["classica", ""], ["hd2d", "hd2d"]]) {
    const r = await render(gfx);
    const dir = process.argv.indexOf("--png") >= 0 ? process.argv[process.argv.indexOf("--png") + 1] : null;   // copie grandi per guardarle da vicino
    if (dir) for (const k of ["normale", "maskable"]) fs.writeFileSync(path.join(dir, "icona-" + id + "-" + k + ".png"), png(shrink(r[k], 512)));
    V[id] = { s: Object.fromEntries(SIZES.map(([f, n, mask]) => [f, uri(shrink(mask ? r.maskable : r.normale, n))])), s48: uri(shrink(r.normale, 48)), m48: uri(shrink(r.maskable, 48)) };
  }
  const cur = Object.fromEntries(SIZES.map(([f]) => [f, "data:image/png;base64," + fs.readFileSync(path.join(APP, f)).toString("base64")]));
  const col = (title, d, note) => `<section><h2>${title}</h2>${note ? `<p>${note}</p>` : ""}
  <div class="row">${SIZES.filter((s) => !s[2]).map(([f, n]) => `<figure><img src="${d.s[f]}" width="${n}" height="${n}" alt="${f}"><figcaption>${f} · ${n} px</figcaption></figure>`).join("")}</div>
  <div class="row"><figure><img src="${d.s["icon-maskable-512.png"]}" width="256" height="256" alt="maskable"><figcaption>icon-maskable-512.png (a metà)</figcaption></figure>
  <figure class="mask"><span class="safe"><img src="${d.s["icon-maskable-512.png"]}" width="256" height="256" alt="ritaglio"></span><figcaption>ritaglio circolare (cerchio dell’80%)</figcaption></figure>
  <figure class="mask squircle"><span><img src="${d.s["icon-maskable-512.png"]}" width="256" height="256" alt="ritaglio"></span><figcaption>ritaglio arrotondato</figcaption></figure></div>
  ${d.s48 ? `<div class="row home">${["s48", "m48"].map((k) => `<figure><img class="${k === "m48" ? "round" : ""}" src="${d[k]}" width="48" height="48" alt="48 px"><figcaption>${k === "m48" ? "maskable rotonda" : "normale"} · 48 px</figcaption></figure>`).join("")}
  <figure><img src="${d.s["icon-192.png"]}" width="48" height="48" alt="48 px"><figcaption>192 mostrata a 48</figcaption></figure></div>` : ""}</section>`;
  const html = `<!doctype html>
<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Planet Defense · anteprima dell’icona</title>
<style>
  :root { color-scheme: dark; } body { margin: 0; padding: 16px; background: #0b1020; color: #e8ecf8; font: 15px/1.45 system-ui, sans-serif; }
  h1 { font-size: 20px; margin: 0 0 4px; } h2 { font-size: 16px; margin: 26px 0 6px; color: #5fd3ff; } p { color: #95a0c0; max-width: 820px; margin: 4px 0; }
  .row { display: flex; flex-wrap: wrap; gap: 18px; align-items: flex-end; margin: 12px 0; } figure { margin: 0; } figcaption { color: #95a0c0; font-size: 12px; margin-top: 4px; }
  img { display: block; max-width: 100%; height: auto; } .mask span { display: block; width: 256px; height: 256px; overflow: hidden; border-radius: 50%; }
  .mask.squircle span { border-radius: 22%; } .home { background: linear-gradient(135deg, #3b4a6b, #1d2438); padding: 14px; border-radius: 12px; width: max-content; max-width: 100%; }
  .home img { border-radius: 10px; } .home img.round { border-radius: 50%; } .home figcaption { color: #dfe6f5; }
</style></head><body>
<h1>Planet Defense · anteprima dell’icona</h1>
<p>Due varianti dell’icona nuova (DESIGN.md § 7): Meteorite gigante che scende in diagonale verso la barriera, con il lampo del primo contatto. Disegnate con il codice del gioco
(<code>drawSky</code>, <code>drawDomeFill</code>, <code>drawDomeEdge</code>, <code>drawEnemy</code> del Meteorite) da <code>tests/tools/icona.js</code>. I PNG di <code>app/</code> non sono ancora cambiati:
dopo la scelta, <code>node tests/tools/icona.js --usa classica</code> (o <code>--usa hd2d</code>) li sostituisce, e si alza la versione.</p>
${col("Variante classica", V.classica)}
${col("Variante HD-2D", V.hd2d)}
${col("Icona attuale (per confronto)", { s: cur }, "Quella pubblicata oggi.")}
</body></html>
`;
  fs.writeFileSync(OUT, html);
  console.log("Anteprima dell’icona: " + path.relative(ROOT, OUT) + " (" + Math.round(fs.statSync(OUT).size / 1024) + " KB)");
}
main().catch((e) => { console.error(e); process.exit(1); });
