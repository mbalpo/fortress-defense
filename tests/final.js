const { makeGame, play, seeded } = require("./bot.js");
// 1) sblocchi META: torrette di partenza + cupola con abilità e riduzione danno
const patch = (h) => h.replace("startTurrets: [],", 'startTurrets: ["rail","beam","hive","tesla"],')
  .replace("domeAbilities: [],", 'domeAbilities: ["regen","repulse"],').replace("domeReduction: 0,", "domeReduction: 0.3,");
const res = [], errs = [];
for (let seed = 1; seed <= 4; seed++) { const r = play({ seed, patch }, "smart", "Enter"); res.push(r.result[0] + r.wave); errs.push(...r.errors); }
console.log("con sblocchi META:", res.join(" "), "| errori:", errs.length ? errs : "nessuno");
// 2) tocco sulla carta + toggle bersaglio in pausa
const g = makeGame({ seed: 2 }); g.key("Enter"); g.frame(); const r = seeded(4);
let up = false, tapped = false, ok = false;
for (let f = 0; f < 8000 && !ok; f++) {
  if (f % 90 === 0 && !up) g.tap(30 + r() * 300, 300);
  g.frame(); const T = g.texts;
  if (T.includes("Scegli un potenziamento") && !tapped) {        // carte: si sceglie al rilascio, dopo 0,6 s dalla comparsa
    up = true; g.click(100, 26); for (let i = 0; i < 40; i++) g.frame(); g.click(180, 140 + 122 + 50); g.up(180, 140 + 122 + 50); tapped = true; }
  if (tapped && T.includes("Ondata 2/20")) ok = true;
  T.length = 0;
}
console.log("tocco sulla 2ª carta → parte l’ondata 2:", ok, "| errori:", g.errors.length ? g.errors : "nessuno");
