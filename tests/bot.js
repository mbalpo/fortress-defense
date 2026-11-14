const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
const APP = path.join(__dirname, "..", "app");
const SRC = require("./src").gameHtml(process.env.GAME_FILE);

function seeded(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

function makeGame({ seed = 1, patch = (h) => h, cleared = 50, level = 10, settings = null, seen = null, storage = null } = {}) {
  const texts = []; let rafCb = null; const errors = [];
  const ctxProxy = new Proxy({}, {
    get(_, p) { if (p === "fillText") return (s) => texts.push(String(s)); return () => ctxProxy; },
    set() { return true; },
  });
  const dom = new JSDOM(patch(SRC), {
    runScripts: "dangerously", pretendToBeVisual: true, url: "http://localhost/",
    beforeParse(w) {
      w.HTMLCanvasElement.prototype.getContext = () => ctxProxy;
      w.HTMLCanvasElement.prototype.getBoundingClientRect = () => ({ left: 0, top: 0, width: 360, height: 640 });
      w.requestAnimationFrame = (cb) => { rafCb = cb; return 1; };
      w.addEventListener("error", (e) => errors.push(e.message));
      w.Math.random = seeded(seed);
      try { if (storage) for (const k in storage) w.localStorage.setItem(k, storage[k]); else w.localStorage.setItem("fortress-progress-v1", JSON.stringify(seen ? { cleared, seen } : { cleared })); if (settings) w.localStorage.setItem("fortress-proto-v1", JSON.stringify(settings)); } catch (e) {}
    },
  });
  const w = dom.window; let t = 0;
  w.document.getElementById("splash").click();   // schermata iniziale: tocco su “Start”
  const g = {
    texts, errors, win: w,
    frame() { t += 16.7; const cb = rafCb; rafCb = null; cb(t); },
    key(k) { w.dispatchEvent(new w.KeyboardEvent("keydown", { key: k })); },
    press(k) { w.dispatchEvent(new w.KeyboardEvent("keydown", { key: k })); w.dispatchEvent(new w.KeyboardEvent("keyup", { key: k })); },
    up(x, y) { const e = new w.Event("pointerup", { bubbles: true }); if (x != null) { e.clientX = x; e.clientY = y; } w.document.getElementById("c").dispatchEvent(e); },
    move(x, y) { const e = new w.Event("pointermove", { bubbles: true }); e.clientX = x; e.clientY = y; w.document.getElementById("c").dispatchEvent(e); },
    click(x, y) { const e = new w.Event("pointerdown", { bubbles: true, cancelable: true }); e.clientX = x; e.clientY = y; w.document.getElementById("c").dispatchEvent(e); },
    tap(x, y) { g.click(x, y); g.up(x, y); },      // tocco breve (sposta il guardiano senza tenere premuto)
  };
  g.frame(); g.frame();
  const start = Math.min(cleared + 1, +/maxLevel: (\d+)/.exec(SRC)[1]);
  for (let i = start; i > level; i--) g.press("ArrowLeft");
  for (let i = start; i < level; i++) g.press("ArrowRight");
  g.frame();
  return g;
}

// policy: "random" | "smart"
function play(opts, policy, startKey = "Enter", maxFrames = 200000) {
  const g = makeGame(opts); const rng = seeded((opts.seed || 1) * 7 + 3);
  g.key(startKey); g.frame();
  let waveSeen = 1, result = null, picks = [];
  for (let f = 0; f < maxFrames && !result; f++) {
    if (f % 90 === 0) g.tap(30 + rng() * 300, 300);
    g.frame();
    const T = g.texts;
    for (const s of T) { const m = /^Ondata (\d+)\/20$/.exec(s); if (m) waveSeen = Math.max(waveSeen, +m[1]); }
    if (T.includes("LIVELLO SUPERATO")) result = "VINTO";
    else if (T.includes("CUPOLA DISTRUTTA")) result = "PERSO";
    if (T.includes("Ricompensa mini-boss") && T.includes("Continua")) g.key("1");
    const ui = T.lastIndexOf("Scegli un potenziamento");
    if (ui >= 0) {
      const cards = []; for (let i = ui + 1; i + 4 < T.length; i += 5) cards.push({ head: T[i + 1], title: T[i + 2] });
      let idx = 0;
      if (policy === "random") idx = Math.floor(rng() * cards.length);
      else {
        const score = (c) => c.head.startsWith("Nuova") ? 4 : /Level up/.test(c.head) ? 3 : /Chain/.test(c.head) ? 2 : 1;
        let best = -1; cards.forEach((c, i) => { if (score(c) > best) { best = score(c); idx = i; } });
      }
      picks.push(cards[idx] && cards[idx].head + " / " + cards[idx].title);
      g.key(String(idx + 1));
    }
    T.length = 0;
  }
  return { result: result || "TIMEOUT", wave: waveSeen, errors: g.errors, picks };
}
module.exports = { makeGame, play, seeded, SRC, APP };

if (require.main === module) {
  for (const mode of [["Standard", "Enter"], ["Epica", "e"]]) {
    for (const pol of ["random", "smart"]) {
      const res = [];
      for (let seed = 1; seed <= 6; seed++) { const r = play({ seed }, pol, mode[1]); res.push(r.result[0] + r.wave); if (r.errors.length) console.log("ERR", r.errors); }
      console.log(mode[0].padEnd(9), pol.padEnd(7), res.join(" "));
    }
  }
}
