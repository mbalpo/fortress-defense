// Avvisi di sblocco a fine livello (DESIGN.md § 4): al primo completamento in Standard dei livelli 10, 20, 30, 31, 40, 50 compare un avviso
// sopra la vittoria; si chiude solo a mano (“Ho capito”, Invio, Esc); finché è aperto i pulsanti della vittoria non rispondono.
const { makeGame } = require("./bot.js");
const ok = (c) => c ? "✓" : "✗ ERRORE";
const expose = (h) => h.replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();");
function win(level, cleared, key) {
  const g = makeGame({ seed: 1, cleared, level, patch: expose }); g.key(key || "Enter"); g.frame(); const ev = g.win.__ev;
  ev("winLevel()"); g.texts.length = 0; g.frame();
  return { g, ev, T: [...g.texts] };
}
for (const [L, title] of [[10, "Torri e guardiano al livello 2"], [20, "Torri e guardiano al livello 3"], [30, "Equipaggiamento del guardiano"], [31, "Sigilli e albero dei potenziamenti"], [40, "Abilità della barriera"], [50, "Modalità Epica"]]) {
  const { T, g } = win(L, L - 1);
  console.log(`livello ${L} completato la prima volta → avviso: ${T.includes("Nuovo sblocco") && T.includes(title)} (${title}) | vittoria sotto: ${T.includes("LIVELLO SUPERATO")}`,
    ok(T.includes("Nuovo sblocco") && T.includes(title) && T.includes("LIVELLO SUPERATO")), "| errori JS:", g.errors[0] || "nessuno");
}
{
  const a = win(10, 10), b = win(12, 11), c = win(10, 60, "e");
  console.log("livello 10 già completato, livello 12, Epica → nessun avviso:", !a.T.includes("Nuovo sblocco") && !b.T.includes("Nuovo sblocco") && !c.T.includes("Nuovo sblocco"),
    ok(!a.T.includes("Nuovo sblocco") && !b.T.includes("Nuovo sblocco") && !c.T.includes("Nuovo sblocco")));
}
{
  const { g, ev } = win(10, 9);
  g.click(180, 324); g.up(180, 324); g.frame(); const s1 = ev("state");
  console.log("tocco sul pulsante “Livello 11” sotto l’avviso → ignorato, stato:", s1, ok(s1 === "won" && ev("unlockNotes.length") === 1));
  g.key("Enter"); g.frame(); const s2 = ev("state"), n2 = ev("unlockNotes.length");
  console.log("Invio → avviso chiuso, resta la vittoria:", s2, n2, ok(s2 === "won" && n2 === 0));
  g.key("Enter"); g.frame();
  console.log("Invio di nuovo → parte il livello 11:", ev("state"), ev("campLevel"), ok(ev("state") === "play" && ev("campLevel") === 11));
}
{
  const { g, ev } = win(40, 39); g.texts.length = 0; g.frame();
  const y = ev("(() => { const b = buttons.find((o) => o.onTap === closeUnlocks); return b ? b.y + b.h / 2 : -1; })()");
  g.click(180, y); g.frame();
  console.log("tocco su “Ho capito” → chiuso:", ev("unlockNotes.length") === 0 && ev("state") === "won", ok(y > 0 && ev("unlockNotes.length") === 0 && ev("state") === "won"));
  console.log("errori JS:", g.errors[0] || "nessuno");
}
