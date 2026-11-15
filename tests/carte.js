// Schermata delle carte (DESIGN.md § 2): la carta (o “Continua” della ricompensa) si sceglie al rilascio sulla stessa carta su cui si è premuto;
// scorrere fuori annulla; per 0,6 s dalla comparsa i tocchi sono ignorati; i tasti 1/2/3 restano immediati. Menu, albero e pausa non cambiano.
const { makeGame, seeded } = require("./bot.js");
const P = (h, ...pairs) => pairs.reduce((a, [x, y]) => { if (!a.includes(x)) throw new Error("manca: " + x.slice(0, 60)); return a.replace(x, y); }, h);
const expose = ["requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__x = { state: () => state, wave: () => wave, rewards: () => rewards, selLevel: () => selLevel };\n})();"];
const ok = (c) => c ? "✓" : "✗ ERRORE";
const card = (i) => [180, 140 + i * 122 + 55];                // centro della carta i (0, 1, 2)
function toCards(g, X) {                                       // gioca fino alla schermata delle carte
  const r = seeded(9);
  for (let f = 0; f < 20000 && X.state() !== "upgrade"; f++) { if (f % 90 === 0) g.tap(30 + r() * 300, 300); g.frame(); g.texts.length = 0; }
  return X.state() === "upgrade";
}
const frames = (g, n) => { for (let i = 0; i < n; i++) { g.frame(); g.texts.length = 0; } };

{
  const g = makeGame({ seed: 4, level: 3, patch: (h) => P(h, expose) }); g.key("Enter"); g.frame(); const X = g.win.__x;
  console.log("schermata delle carte raggiunta:", toCards(g, X), "| ondata", X.wave(), ok(X.state() === "upgrade"));
  const [cx, cy] = card(1);
  g.click(cx, cy); g.up(cx, cy); frames(g, 18); g.click(cx, cy); g.up(cx, cy);
  console.log("tocchi subito e dopo 0,3 s → ignorati:", X.state() === "upgrade", ok(X.state() === "upgrade"));
  frames(g, 22);                                               // oltre 0,6 s dalla comparsa
  g.click(cx, cy); frames(g, 10);
  console.log("dopo 0,6 s: solo premere sulla carta non sceglie:", X.state() === "upgrade", ok(X.state() === "upgrade"));
  g.move(cx, 40); g.up(cx, 40);
  console.log("premere sulla carta 2 e rilasciare fuori → annullato:", X.state() === "upgrade", ok(X.state() === "upgrade"));
  const [ax, ay] = card(0); g.click(ax, ay); g.up(cx, cy);
  console.log("premere sulla carta 1 e rilasciare sulla 2 → annullato:", X.state() === "upgrade", ok(X.state() === "upgrade"));
  g.up(cx, cy);
  console.log("rilascio senza pressione → nulla:", X.state() === "upgrade", ok(X.state() === "upgrade"));
  g.click(cx, cy); g.up(cx + 60, cy + 20);
  console.log("premere e rilasciare sulla stessa carta → scelta, ondata", X.wave(), "| stato", X.state(), ok(X.state() === "play" && X.wave() === 2));
  console.log("schermata delle carte di nuovo:", toCards(g, X), ok(X.state() === "upgrade"));
  g.key("3");
  console.log("tasto 3 appena comparsa → scelta subito:", X.state() === "play", "| ondata", X.wave(), ok(X.state() === "play" && X.wave() === 3));
  console.log("errori JS:", g.errors.length ? g.errors[0] : "nessuno");
}
{ // ricompensa del mini-boss: “Continua” con le stesse regole
  const g = makeGame({ seed: 4, level: 3, patch: (h) => P(h, expose, ["bonusLeft = bossBonus; bossBonus = 0;", "bonusLeft = 1; bossBonus = 0;"]) }); g.key("Enter"); g.frame(); const X = g.win.__x;
  toCards(g, X); frames(g, 40); g.key("1");
  const cont = [180, 140 + (X.rewards() || []).length * 122 + 4 + 24];
  console.log("dopo la carta: ricompensa con", (X.rewards() || []).length, "carte", ok(X.state() === "upgrade" && X.rewards() && X.rewards().length > 0));
  g.click(...cont); g.up(...cont);
  console.log("“Continua” toccato subito → ignorato:", X.state() === "upgrade" && !!X.rewards(), ok(X.state() === "upgrade" && !!X.rewards()));
  frames(g, 40); g.click(...cont); g.move(180, 60); g.up(180, 60);
  console.log("“Continua” premuto e rilasciato fuori → annullato:", X.state() === "upgrade" && !!X.rewards(), ok(X.state() === "upgrade" && !!X.rewards()));
  g.click(...cont); g.up(...cont);
  console.log("“Continua” premuto e rilasciato sopra → ondata", X.wave(), ok(X.state() === "play" && X.wave() === 2));
  console.log("errori JS:", g.errors.length ? g.errors[0] : "nessuno");
}
{ // menu, albero e pausa: si attivano ancora alla pressione
  const g = makeGame({ seed: 4, cleared: 40, level: 20, patch: (h) => P(h, expose) }); const X = g.win.__x;
  const l0 = X.selLevel(); g.click(296, 158); const l1 = X.selLevel();
  g.click(118, 376); const st = X.state();
  console.log("menu: “+” alla pressione → livello", l0, "→", l1, "| albero aperto alla pressione:", st, ok(l1 === l0 + 1 && st === "tree"));
  g.key("Escape"); g.frame(); g.click(180, 277); const s2 = X.state(); g.frame(); g.click(229, 26); const s3 = X.state();
  console.log("Standard e pausa alla pressione → stati:", s2, s3, ok(s2 === "play" && s3 === "pause"));
  console.log("errori JS:", g.errors.length ? g.errors[0] : "nessuno");
}
