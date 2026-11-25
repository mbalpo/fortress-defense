// Segno delle carte combo (1.25.1, DESIGN.md § 3): coppia di simboli dei tipi sopra il pallino. Per tutte le 44 combo (11 del guardiano e 33 tra torrette),
// nelle due grafiche e con 3 e 4 carte, la carta si disegna due volte (con e senza segno) e si confrontano i pixel: il segno deve restare dentro la carta,
// non toccare il pallino né il testo, e avere a sinistra il colore della principale e a destra quello della secondaria.
const { JSDOM } = require("jsdom");
const { gameHtml } = require("./src");
const ok = (c) => c ? "✓" : "✗ ERRORE";
const P = (h, a, b) => { if (!h.includes(a)) throw new Error("manca: " + a.slice(0, 60)); return h.replace(a, b); };
const TYPE2 = 'type2: u.cat === "combo" ? TURRETS[u.needs].type : undefined };';

function game(gfx) {
  let src = gameHtml(null, gfx || undefined);
  src = P(src, TYPE2, 'type2: u.cat === "combo" && !window.__noMark ? TURRETS[u.needs].type : undefined };');
  src = P(src, "requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();");
  const errors = [];
  const dom = new JSDOM(src, { runScripts: "dangerously", pretendToBeVisual: true, url: "http://localhost/",
    beforeParse(w) { w.requestAnimationFrame = () => 1; w.localStorage.setItem("fortress-progress-v1", JSON.stringify({ cleared: 23, seen: [] })); w.addEventListener("error", (e) => errors.push(e.message)); } });
  const w = dom.window; w.document.getElementById("splash").click();
  return { w, errors, cv: w.document.getElementById("c") };
}
const hex = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const near = (p, c) => Math.abs(p[0] - c[0]) + Math.abs(p[1] - c[1]) + Math.abs(p[2] - c[2]);

for (const gfx of ["", "hd2d"]) {
  const G = game(gfx), ev = G.w.__ev, x2d = G.cv.getContext("2d");
  const k = G.cv.width / 360;                                  // pixel del canvas per pixel logico
  G.w.dispatchEvent(new G.w.KeyboardEvent("keydown", { key: "Enter" })); ev("state = 'upgrade';");   // partita avviata dal menu, poi la schermata delle carte
  const combos = ev(`[PLAYER_DEF, ...Object.values(TURRETS)].flatMap((d) => d.ups.filter((u) => u.cat === "combo").map((u) => [d === PLAYER_DEF ? "player" : Object.keys(TURRETS).find((id) => TURRETS[id] === d), u.id]))`);
  const TY = ev("TYPES"), bad = [], types = new Set();
  let checked = 0, minGap = 99, maxW = 0, maxH = 0;
  for (const four of [false, true]) {
    for (const [who, id] of combos) {
      ev(`(() => { const s = ${JSON.stringify(who)} === "player" ? player : makeShooter(TURRETS[${JSON.stringify(who)}], SLOT_X[0], GROUND_Y - 14);
        const o = { kind: "up", who: s, up: s.def.ups.find((u) => u.id === ${JSON.stringify(id)}) }; options = ${four ? "[o, o, o, o]" : "[o, o, o]"}; rewards = null; upBuild = false; })()`);
      const shot = (no) => { G.w.__noMark = no; ev("draw()"); return x2d.getImageData(0, 0, G.cv.width, G.cv.height).data; };
      const a = shot(false), b = shot(true);
      G.w.__noMark = false; const o = ev("describe(options[0])"); types.add(o.type); types.add(o.type2);
      const step = four ? 100 : 122, h = four ? 92 : 110;
      for (let i = 0; i < (four ? 4 : 3); i++) {
        const y = 140 + i * step, cx = 46, cy = y + h / 2;
        // pixel cambiati in modo netto (la luce HD-2D, debole, non conta), in coordinate logiche
        let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, inDisc = 0, inText = 0, left = [0, 0], right = [0, 0];
        const cl = hex(TY[o.type].color), cr = hex(TY[o.type2].color);
        for (let py = Math.floor((y - 6) * k); py < Math.ceil((y + h + 6) * k); py++) for (let px = 0; px < Math.ceil(120 * k); px++) {
          const j = (py * G.cv.width + px) * 4, d = Math.abs(a[j] - b[j]) + Math.abs(a[j + 1] - b[j + 1]) + Math.abs(a[j + 2] - b[j + 2]);
          if (d < 90) continue;
          const lx = px / k, ly = py / k;
          x0 = Math.min(x0, lx); x1 = Math.max(x1, lx); y0 = Math.min(y0, ly); y1 = Math.max(y1, ly);
          if (Math.hypot(lx - cx, ly - cy) <= 13.5) inDisc++;
          if (lx >= 20 + 50) inText++;
          const p = [a[j], a[j + 1], a[j + 2]], dl = near(p, cl), dr = near(p, cr);   // pixel più vicino al colore della principale o della secondaria
          if (dl !== dr) (lx < cx ? left : right)[dl < dr ? 0 : 1]++;
        }
        checked++;
        const inCard = x0 >= 21 && x1 <= 339 && y0 >= y + 1 && y1 <= y + h - 1;
        const gap = cy - 13 - y1; minGap = Math.min(minGap, gap); maxW = Math.max(maxW, x1 - x0); maxH = Math.max(maxH, y1 - y0);
        // a sinistra del centro la maggioranza dei pixel netti ha il colore della principale, a destra quello della secondaria (con due tipi uguali non si controlla)
        const colOk = o.type === o.type2 || (left[0] > left[1] && right[1] > right[0]);
        if (!(x1 > x0) || !inCard || inDisc || inText || !colOk)
          bad.push(`${who}/${id} carta ${i + 1}${four ? " (4 carte)" : ""}: ${x1 > x0 ? `riquadro ${x0.toFixed(1)},${y0.toFixed(1)}–${x1.toFixed(1)},${y1.toFixed(1)} (carta ${y}–${y + h})` : "segno assente"}` +
            (inDisc ? " · sul pallino " + inDisc : "") + (inText ? " · sul testo " + inText : "") + (colOk ? "" : " · colori scambiati"));
      }
    }
  }
  console.log((gfx || "classica") + ": combo " + combos.length + " (guardiano " + combos.filter((c) => c[0] === "player").length + "), carte controllate " + checked +
    " | tipi " + [...types].sort().join(" ") + " | segno largo " + maxW.toFixed(1) + " px, alto " + maxH.toFixed(1) + " px, distanza minima dal pallino " + minGap.toFixed(1) + " px",
    "| fuori posto:", bad.length ? bad.slice(0, 3).join("; ") : "nessuna", ok(combos.length === 44 && !bad.length && types.size === 5 && maxW <= 32 && maxH <= 16));
  console.log("errori JS (" + (gfx || "classica") + "):", G.errors.length ? G.errors[0] : "nessuno", ok(!G.errors.length));
}
