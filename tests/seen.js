const { makeGame } = require("./bot.js");
const P = (h, ...pairs) => pairs.reduce((a, [x, y]) => { if (!a.includes(x)) throw new Error("manca: " + x.slice(0, 60)); return a.replace(x, y); }, h);
const patch = (h) => P(h, ["requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__x = { state: () => state, alerts: () => alerts, progress, enemies: () => enemies };\n})();"],
  ["domeHp: 100,", "domeHp: 1000000,"], ["options = rollOptions();", "options = [];"]);
const ok = (c) => c ? "✓" : "✗ ERRORE";
const snap = (g) => { g.texts.length = 0; g.frame(); return [...g.texts]; };

console.log("— scheda Nemici con nemici sconosciuti —");
{
  const g = makeGame({ seed: 3, patch, cleared: 12, level: 13, seen: ["rock"] }); g.key("Enter"); g.frame(); g.key("p");
  const T = snap(g);
  const unk = T.filter((s) => s === "Nemico sconosciuto").length, known = ["Navicella", "Cristallo-cometa", "Meteora", "Frammento roccioso", "Asteroide"].filter((n) => T.some((t) => t.startsWith(n)));
  console.log("nemici visibili:", known.join(", "), "| righe sconosciute:", unk, "| mini-boss sconosciuti:", T.includes("Mini-boss sconosciuti"), "| intestazione:", T.find((s) => s.includes("scoperti")), ok(known.join() === "Frammento roccioso" && unk === 4 && T.includes("Mini-boss sconosciuti")));
}
console.log("— avviso al primo incontro —");
{
  const g = makeGame({ seed: 3, patch, cleared: 0, level: 1, seen: [] }); g.key("Enter"); const X = g.win.__x;
  let first = null, f0 = null, frames = 0, seenNames = [];
  for (let f = 0; f < 1800; f++) {
    g.frame(); const T = g.texts;
    const i = T.indexOf("Nuovo nemico: "); if (i >= 0) { if (first === null) { first = T[i + 1]; f0 = f; } if (!seenNames.includes(T[i + 1])) seenNames.push(T[i + 1]); if (T[i + 1] === first) frames++; }
    T.length = 0;
  }
  const visibleWhenAlerted = true;
  console.log("primo avviso:", first, "| durata a schermo:", (frames / 60).toFixed(1), "s | avvisi in 30 s:", seenNames.join(", "), ok(first && Math.abs(frames / 60 - 3.5) < 0.1));
  const stored = JSON.parse(g.win.localStorage.getItem("fortress-progress-v1")).seen;
  console.log("salvati sul dispositivo:", stored.join(", "), ok(stored.length >= 1));
  // nuova partita con lo stesso salvataggio: nessun avviso per gli stessi nemici
  const g2 = makeGame({ seed: 3, patch, storage: { "fortress-progress-v1": g.win.localStorage.getItem("fortress-progress-v1") } }); g2.key("Enter");
  let again = [];
  for (let f = 0; f < 1800; f++) { g2.frame(); const T = g2.texts; const i = T.indexOf("Nuovo nemico: "); if (i >= 0 && seenNames.includes(T[i + 1]) && !again.includes(T[i + 1])) again.push(T[i + 1]); T.length = 0; }
  console.log("seconda partita, avvisi ripetuti per gli stessi nemici:", again.length ? again.join(", ") : "nessuno", ok(again.length === 0));
}
console.log("— l’avviso si ferma in pausa —");
{
  const g = makeGame({ seed: 3, patch, cleared: 0, level: 1, seen: [] }); g.key("Enter"); const X = g.win.__x;
  for (let f = 0; f < 1500 && !X.alerts().length; f++) g.frame();
  for (let i = 0; i < 60; i++) g.frame();
  const t0 = X.alerts()[0].t; g.key("p"); for (let i = 0; i < 300; i++) g.frame(); const t1 = X.alerts()[0].t; g.key("p"); for (let i = 0; i < 60; i++) g.frame();
  console.log("tempo rimasto all’avviso: prima della pausa", t0.toFixed(2), "s, dopo 5 s di pausa", t1.toFixed(2), "s, dopo 1 s di gioco", (X.alerts()[0] ? X.alerts()[0].t : 0).toFixed(2), "s", ok(t0 === t1));
  console.log("errori JS:", g.errors.length ? g.errors[0] : "nessuno");
}
