const { makeGame } = require("./bot.js");
const g = makeGame({ seed: 1, cleared: 12, level: 13 });
g.frame(); const t0 = g.texts.filter((s) => s.startsWith("Mira:")).pop(); g.texts.length = 0;
g.click(180, 213); g.frame(); const t1 = g.texts.filter((s) => s.startsWith("Mira:")).pop(); const hint = g.texts.find((s) => s.startsWith("Fermo")); g.texts.length = 0;
console.log("prima:", t0, "| dopo il tocco:", t1, "| testo di aiuto:", hint);
console.log("salvato sul dispositivo:", g.win.localStorage.getItem("fortress-proto-v1"));
g.key("m"); g.frame(); console.log("tasto M →", g.texts.filter((s) => s.startsWith("Mira:")).pop(), "| errori JS:", g.errors.length ? g.errors[0] : "nessuno");
