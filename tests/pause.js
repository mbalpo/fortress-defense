const { makeGame, seeded } = require("./bot.js");
const P = (h, ...pairs) => pairs.reduce((a, [x, y]) => { if (!a.includes(x)) throw new Error("manca: " + x.slice(0, 60)); return a.replace(x, y); }, h);
const patch = (h) => P(h, ["requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__x = { state: () => state, waveTime: () => waveTime, enemies: () => enemies, getPlayer: () => player, slots: () => slots, N };\n})();"],
  ["domeHp: 100,", "domeHp: 1000000,"]);
const ok = (c) => c ? "✓" : "✗ ERRORE";
const ALL = ["saucer", "shard", "meteor", "rock", "asteroid", "ship:fire", "ship:energy", "ship:electric", "ship:force", "ship:physical", "mothership:fire", "mothership:energy", "mothership:electric", "mothership:force", "mothership:physical"];
const snap = (g) => { g.texts.length = 0; g.frame(); return [...g.texts]; };

console.log("— la pausa ferma il gioco —");
{
  const g = makeGame({ seed: 3, patch, cleared: 12, level: 13 }); g.key("Enter"); for (let i = 0; i < 300; i++) g.frame();
  const X = g.win.__x;
  g.click(229, 26); const T = snap(g);
  const t0 = X.waveTime(), pos0 = X.enemies().map((e) => e.y + "," + e.x).join("|");
  for (let i = 0; i < 300; i++) g.frame();
  console.log("tocco sul pulsante → stato:", X.state(), "| in 5 s di pausa il tempo e i nemici restano fermi:", X.waveTime() === t0 && X.enemies().map((e) => e.y + "," + e.x).join("|") === pos0, ok(X.state() === "pause" && X.waveTime() === t0));
  console.log("schermata:", ["PAUSA", "Nemici del livello", "Torri e potenziamenti", "Riprendi", "Abbandona"].every((s) => T.includes(s)), ok(["PAUSA", "Riprendi"].every((s) => T.includes(s))));
  g.click(100, 26); console.log("in pausa il pulsante bersaglio sotto non risponde:", snap(g).includes("PAUSA"), ok(X.state() === "pause"));
  g.click(120, 606); g.frame(); const t1 = X.waveTime(); for (let i = 0; i < 60; i++) g.frame();
  console.log("Riprendi → stato:", X.state(), "| il tempo riparte:", X.waveTime() > t1, ok(X.state() === "play" && X.waveTime() > t1));
  g.key("Escape"); g.frame(); const a = X.state(); g.key("Escape"); g.frame(); const b = X.state(); g.key("p"); g.frame(); const c = X.state(); g.key("Enter"); g.frame();
  console.log("tasti: Esc →", a, "| Esc →", b, "| P →", c, "| Invio →", X.state(), ok(a === "pause" && b === "play" && c === "pause" && X.state() === "play"));
  Object.defineProperty(g.win.document, "hidden", { configurable: true, get: () => true }); g.win.document.dispatchEvent(new g.win.Event("visibilitychange")); g.frame();
  console.log("cambio di app (pagina nascosta) → stato:", X.state(), ok(X.state() === "pause"));
  g.click(288, 606); g.frame(); const q1 = X.state(), lab = snap(g).includes("Tocca di nuovo"); g.click(288, 606); g.frame();
  console.log("Abbandona: primo tocco chiede conferma:", q1 === "pause" && lab, "| secondo tocco → stato:", X.state(), ok(q1 === "pause" && lab && X.state() === "menu"));
  console.log("errori JS:", g.errors.length ? g.errors[0] : "nessuno");
}
console.log("— scheda Nemici: contenuto per livello —");
for (const [L, label] of [[5, "livello 5"], [10, "livello 10"], [13, "livello 13"]]) {
  const g = makeGame({ seed: 3, patch, cleared: L - 1, level: L, seen: ALL }); g.key("Enter"); for (let i = 0; i < 80; i++) g.frame();
  g.key("p"); const T = snap(g);
  const names = ["Navicella", "Cristallo-cometa", "Meteora", "Frammento roccioso", "Asteroide"].filter((n) => T.some((t) => t.startsWith(n)));
  const mini = T.includes("Mini-boss · nave aliena"), fin = T.some((t) => t.startsWith("Boss finale")), resist = T.includes("Resiste a ") && T.includes("  ·  Debole a ");
  const expect = L === 5 ? [!mini, !fin, names.length === 4] : L === 10 ? [!mini, fin, !names.includes("Asteroide")] : [mini, !fin, names.includes("Asteroide")];
  console.log(label.padEnd(11), "nemici:", names.join(", "), "| mini-boss:", mini, "| boss finale:", fin, "| resistenze mostrate:", resist, ok(expect.every(Boolean) && resist), g.errors.length ? g.errors[0] : "");
}
console.log("— scheda Torri e potenziamenti —");
{
  const g = makeGame({ seed: 5, patch, cleared: 20, level: 21 }); g.key("Enter"); const r = seeded(2); let picks = 0;
  for (let f = 0; f < 60000 && picks < 8; f++) {
    if (f % 90 === 0) g.click(30 + r() * 300, 300);
    g.frame(); const T = g.texts;
    if (T.includes("Ricompensa mini-boss") && T.includes("Continua")) g.key("1");
    if (T.includes("Scegli un potenziamento")) { g.key("1"); picks++; }
    T.length = 0;
  }
  for (let i = 0; i < 5; i++) g.frame();
  const X = g.win.__x; g.key("p"); g.key("Tab"); const T = snap(g);
  const shooters = [X.getPlayer(), ...X.slots().filter(Boolean)];
  const expected = shooters.flatMap((s) => s.def.ups.filter((u) => X.N(s, u.id) > 0).map((u) => u.name));
  const shown = T.join(" ");
  const missing = expected.filter((n) => !shown.includes(n));
  console.log("torri in campo:", shooters.slice(1).map((s) => s.def.name).join(", ") || "nessuna", "| potenziamenti presi:", expected.length, "| mancanti nel riepilogo:", missing.length ? missing.join(", ") : "nessuno", ok(missing.length === 0 && expected.length > 0));
  console.log("intestazioni mostrate:", shooters.every((s) => T.includes(s.def.name)), ok(shooters.every((s) => T.includes(s.def.name))), "| errori JS:", g.errors.length ? g.errors[0] : "nessuno");
}
