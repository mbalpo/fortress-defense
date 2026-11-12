// Prova ogni potenziamento di ogni torretta, da solo (con i prerequisiti), per scovare errori.
const { makeGame, seeded, SRC } = require("./bot.js");
const vm = require("vm");
// estrae TURRETS dal sorgente per elencare gli id
const m = SRC.match(/<script>([\s\S]*)<\/script>/)[1];
const ids = {}; 
for (const mm of m.matchAll(/^  (\w+): \{ name: "[^"]+", type: "\w+", (?:range|reload)/gm)) ids[mm[1]] = [];
const tIds = Object.keys(ids);
console.log("torrette trovate:", tIds.length, tIds.join(", "));
const block = (id) => { const a = m.indexOf("  " + id + ": { name:"); const b = m.indexOf("]},", a); return m.slice(a, b); };
let runs = 0, bad = 0;
for (const id of tIds) {
  const b = block(id);
  const ups = [...b.matchAll(/([SCL])\("(\w+)"(?:, "(\w+)")?, (?:(\d+), )?"/g)].map(x => ({ t: x[1], id: x[2], chain: x[1]==="C"? x[3] : null, lv: x[1]==="S"? 0 : +x[4] }));
  for (const u of ups) {
    const need = u.t === "C" ? ups.filter(v => v.t==="C" && v.chain===u.chain && v.lv<u.lv).map(v=>v.id).concat(u.id) : [u.id];
    const give = need.map(n => `s.up["${n}"]=${u.t==="S"?3:1};`).join("");
    const patch = (h) => h.replace('META.startTurrets.slice(0, 4).forEach((id, i) => { slots[i] = makeShooter(TURRETS[id], SLOT_X[i], GROUND_Y - 14); });',
      `META.startTurrets.slice(0, 4).forEach((id, i) => { slots[i] = makeShooter(TURRETS[id], SLOT_X[i], GROUND_Y - 14); }); slots.forEach(s => { if (s) { ${give} } });`)
      .replace("startTurrets: [],", `startTurrets: ["${id}"],`);
    const g = makeGame({ seed: 7, patch }); g.key("Enter"); g.frame();
    const r = seeded(5); let pops = 0;
    for (let f = 0; f < 1800; f++) {
      if (f % 90 === 0) g.click(30 + r() * 300, 300);
      g.frame(); for (const s of g.texts) if (/^\d+!?$/.test(s)) pops++;
      if (g.texts.includes("Scegli un potenziamento")) g.key("1");
      g.texts.length = 0;
    }
    runs++; if (g.errors.length) { bad++; console.log("ERRORE", id, u.id, g.errors[0]); }
  }
}

// personaggio
{
  const a = m.indexOf("const PLAYER_DEF"); const b = m.indexOf("]};", a);
  const blk = m.slice(a, b);
  const ups = [...blk.matchAll(/([SCL])\("(\w+)"(?:, "(\w+)")?, (?:(\d+), )?"/g)].map(x => ({ t: x[1], id: x[2], chain: x[1]==="C"? x[3] : null, lv: x[1]==="S"? 0 : +x[4] }));
  for (const u of ups) {
    const need = u.t === "C" ? ups.filter(v => v.t==="C" && v.chain===u.chain && v.lv<u.lv).map(v=>v.id).concat(u.id) : [u.id];
    const give = need.map(n => `player.up["${n}"]=${u.t==="S"?3:1};`).join("");
    const patch = (h) => h.replace("player.targetX = W / 2; player.cd = 0.3;", "player.targetX = W / 2; player.cd = 0.3; " + give);
    const g = makeGame({ seed: 7, patch }); g.key("Enter"); g.frame(); const r = seeded(5);
    for (let f = 0; f < 1800; f++) { if (f % 90 === 0) g.click(30 + r() * 300, 300); g.frame(); if (g.texts.includes("Scegli un potenziamento")) g.key("1"); g.texts.length = 0; }
    runs++; if (g.errors.length) { bad++; console.log("ERRORE player", u.id, g.errors[0]); }
  }
  console.log("potenziamenti personaggio provati:", ups.length);
}
console.log("prove:", runs, "| con errori:", bad);
