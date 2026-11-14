// Menu senza la scelta della mira (solo automatica, DESIGN.md § 2): nessun pulsante “Mira”, il tasto M non fa nulla.
const { makeGame } = require("./bot.js");
const ok = (c) => c ? "✓" : "✗ ERRORE";
const g = makeGame({ seed: 1, cleared: 12, level: 13, settings: { targeting: "highest", aim: "manual" } });
g.frame(); const T = [...g.texts]; g.texts.length = 0;
const noAim = !T.some((s) => /Mira|mira|M = /.test(s));
console.log("menu senza “Mira” (né tasto M nell’aiuto):", noAim, "| aiuto:", T.find((s) => s.startsWith("Il guardiano")), ok(noAim));
g.click(180, 213); g.frame(); g.key("m"); g.frame(); const T2 = [...g.texts]; g.texts.length = 0;
console.log("tocco dove c’era il pulsante e tasto M → menu invariato:", T2.includes("FORTRESS DEFENSE") && !T2.some((s) => /Mira/.test(s)), ok(T2.includes("FORTRESS DEFENSE") && !T2.some((s) => /Mira/.test(s))));
g.click(100, 26); g.frame(); g.texts.length = 0;
g.key("Enter"); g.frame(); g.key("t"); g.frame();
const saved = JSON.parse(g.win.localStorage.getItem("fortress-proto-v1"));
console.log("impostazioni salvate:", JSON.stringify(saved), "| senza aim:", !("aim" in saved), ok(!("aim" in saved) && saved.targeting === "closest"));
console.log("errori JS:", g.errors.length ? g.errors[0] : "nessuno");
