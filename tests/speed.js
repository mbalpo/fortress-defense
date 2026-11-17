// 1.14.1 (DESIGN.md § 2): velocità della partita 1x → 1,5x → 2x → 1x con il tasto prima di “Nemici”, tenuta per le ondate e le partite seguenti;
// la logica avanza in passi da al massimo 0,05 s, come a 1x.
const { makeGame } = require("./bot.js");
const ok = (c) => c ? "✓" : "✗ ERRORE";
const patch = (h) => h.replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();")
  .replace("function update(dt) {", "function update(dt) { window.__steps = (window.__steps || []).concat(dt);");
const g = makeGame({ patch, cleared: 5 }), ev = g.win.__ev;
g.key("Enter"); g.frame();
for (let i = 0; i < 400 && ev("state") !== "play"; i++) { if (g.texts.includes("Scegli un potenziamento")) g.key("1"); g.frame(); }
console.log("in partita:", ev("state"), "| velocità iniziale", ev("settings.speed"), ok(ev("state") === "play" && ev("settings.speed") === 1));
g.texts.length = 0; g.frame();
console.log("tasto “1x” nell’HUD:", g.texts.includes("1x"), ok(g.texts.includes("1x")));
const adv = () => { const w0 = ev("waveTime"); for (let i = 0; i < 30; i++) g.frame(); return ev("waveTime") - w0; };
const a1 = adv();
const seq = [];
for (let i = 0; i < 3; i++) { g.tap(27, 62); g.frame(); seq.push(ev("settings.speed")); }
console.log("tre tocchi:", seq.join(" → "), ok(seq.join() === "1.5,2,1"));
g.tap(27, 62); g.frame(); const a15 = adv();
g.tap(27, 62); g.frame(); const a2 = adv();
g.texts.length = 0; g.frame();
console.log("tempo di gioco in 30 fotogrammi: 1x", a1.toFixed(3), "| 1,5x", a15.toFixed(3), "| 2x", a2.toFixed(3), "| etichetta", g.texts.includes("2x"),
  ok(Math.abs(a15 / a1 - 1.5) < 0.01 && Math.abs(a2 / a1 - 2) < 0.01 && g.texts.includes("2x")));
ev("window.__steps = []; last = 1e6; frame(1e6 + 200)");   // fotogramma lento: dt limitato a 0,05 s, a 2x due passi da 0,05
const st = ev("JSON.stringify(window.__steps)");
console.log("fotogramma lento a 2x: passi", st, ok(st === "[0.05,0.05]"));
const saved = JSON.parse(g.win.localStorage.getItem("fortress-proto-v1"));
console.log("impostazione salvata:", saved.speed, ok(saved.speed === 2));
const h = makeGame({ patch, cleared: 5, settings: { speed: 2 } });
console.log("ricaricando: velocità", h.win.__ev("settings.speed"), ok(h.win.__ev("settings.speed") === 2));
const b = makeGame({ patch, cleared: 5, settings: { speed: 3 } });
console.log("valore non valido (3) ignorato:", b.win.__ev("settings.speed"), ok(b.win.__ev("settings.speed") === 1));
console.log("errori JS:", [...g.errors, ...h.errors, ...b.errors].join(" | ") || "nessuno");
