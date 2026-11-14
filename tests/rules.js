const { makeGame, seeded } = require("./bot.js");
function run(towerHead, turretId, seed) {
  const patch = (h) => h.replace("startTurrets: [],", `startTurrets: ["${turretId}"],`).replace("domeHp: 100,", "domeHp: 1000000,");
  const g = makeGame({ seed, patch }); g.key("Enter"); g.frame();
  const r = seeded(3), seq = [], offers = [];
  let done = false;
  for (let f = 0; f < 400000 && !done; f++) {
    if (f % 90 === 0) g.tap(30 + r() * 300, 300);
    g.frame(); const T = g.texts;
    if (T.includes("LIVELLO SUPERATO")) done = true;
    const ui = T.lastIndexOf("Scegli un potenziamento");
    if (ui >= 0) {
      const cards = []; for (let i = ui + 1; i + 4 < T.length; i += 5) cards.push({ head: T[i + 1], title: T[i + 2], note: T[i + 4] });
      offers.push(cards);
      let idx = cards.findIndex(c => c.head.startsWith(towerHead));
      if (idx < 0) idx = 0;
      if (cards[idx].head.startsWith(towerHead)) seq.push(cards[idx]);
      g.key(String(idx + 1));
    }
    T.length = 0;
  }
  return { seq, offers, errors: g.errors, done };
}
function check(name, towerHead, id, seed) {
  const { seq, offers, errors, done } = run(towerHead, id, seed);
  const kinds = seq.map(c => /Level up/.test(c.head) ? "LU" : /Chain/.test(c.head) ? "C" : "S");
  console.log(name.padEnd(10), "conclusa:", done, "| scelte:", seq.length, "|", kinds.join(" "));
  // regole
  let used = 0, level = 1, ok = true, msg = [];
  const std = {}, lvlTaken = new Set();
  for (const c of seq) {
    const isLU = /Level up/.test(c.head);
    if (isLU) {
      if (used < 3) { ok = false; msg.push("LU prima di 3 potenziamenti: " + c.title); }
      const lv = +/Level up (\d)/.exec(c.head)[1];
      if (lv > level) { ok = false; msg.push("LU di livello " + lv + " al livello " + level); }
      if (level < 3) { level++; used = 0; } else used = 99;
    } else {
      if (used >= 3) { ok = false; msg.push("potenziamento normale dopo 3 senza LU: " + c.title); }
      used++;
      if (!/Chain/.test(c.head)) { std[c.title] = (std[c.title] || 0) + 1; if (std[c.title] > 3) { ok = false; msg.push("standard >3: " + c.title); } }
    }
  }
  // quando serve un LU, le offerte della torre devono essere solo LU
  console.log("          regole rispettate:", ok, msg.slice(0, 3).join(" | "), errors.length ? "ERRORI " + errors[0] : "");
  return seq;
}
const s1 = check("Sky Guard", "Sky Guard", "sky", 3);
console.log("          totale potenziamenti torre:", s1.length, "(atteso 12)");
console.log("          sequenza:", s1.map(c => c.head.split(" · ")[1] + ":" + c.title).join(" → "));
check("Laser", "Laser", "laser", 4);
check("Hive", "Hive", "hive", 5);
console.log("— guardiano —");
const sp = check("Guardiano", "Guardiano", "sky", 6);
console.log("          sequenza:", sp.map(c => c.head.split(" · ")[1] + ":" + c.title).join(" → "));
