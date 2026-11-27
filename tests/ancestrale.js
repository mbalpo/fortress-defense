// Ancestrale+N (1.29.0, DESIGN.md § 15 “Ancestrale+N”): l’ancestrale equipaggiato non si toglie e non si cambia, si evolve con la fusione
// (+N = +(N−1) e N ancestrali base dello stesso tipo, non bloccati) fino a +10; statistica +20% a passo; 6, 7, 8 slot a +1, +5, +10; salvataggio versione 10; schermata.
const { makeGame } = require("./bot.js");
const ok = (c) => c ? "✓" : "✗ ERRORE";
const patch = (h) => h.replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();");
const fresh = (gear) => {
  const g = makeGame({ patch, cleared: 100, storage: { "fortress-progress-v1": JSON.stringify({ cleared: 100, seen: [], gear }) } }); g.frame();
  return { g, ev: g.win.__ev };
};
const J = (ev, c) => JSON.parse(ev("JSON.stringify(" + c + ")"));
const r1 = (x) => Math.round(x * 10) / 10;

console.log("— Ancestrale fisso —");
{
  const { ev } = fresh({ pcs: { "arma:4": 3, "arma:2": 1 }, mods: {}, eq: {} });
  const e1 = ev("equipPiece('arma', 4)"), un = ev("unequipPiece('arma')"), sw = ev("equipPiece('arma', 2)");
  ev("openGear(); gearSel = 'arma'; gearMode = 'use'; tapUnequip()"); const m1 = ev("gearMsg");
  ev("gearMsg = ''; tapPiece(2); tapPiece(2)"); const m2 = ev("gearMsg");
  const st = J(ev, "({ r: progress.gear.eq.arma.r, inv: progress.gear.pcs })");
  console.log("equipaggiata:", e1, "| togliere:", un, "| cambiare con un epico:", sw, "| messaggi:", /non si toglie/.test(m1), /non si toglie/.test(m2), "| inventario", JSON.stringify(st.inv),
    ok(e1 && !un && !sw && /non si toglie né si cambia/.test(m1) && /non si toglie né si cambia/.test(m2) && st.r === 4 && st.inv["arma:4"] === 2 && st.inv["arma:2"] === 1));
}

console.log("— Evoluzione fino a +10 —");
{
  const { ev } = fresh({ pcs: { "arma:4": 60, "guanti:4": 1 }, mods: {}, eq: { arma: { r: 4, m: [] } }, lock: { "arma:4": 5 } });
  const st = () => J(ev, "({ p: plusOf(progress.gear.eq.arma), slots: slotsOf(progress.gear.eq.arma), base: pieceBase('arma', progress.gear.eq.arma), free: freeN(progress.gear, 'pcs', 'arma:4') })");
  const s0 = st(), rows = [];
  for (let N = 1; N <= 10; N++) { const okN = ev("fusePlus('arma')"); const s = st(); rows.push([N, okN, s.p, s.slots, r1(s.base), s.free]); }
  const s10 = st(), over = ev("fusePlus('arma')");
  const show = rows.filter(([N]) => [1, 2, 3, 5, 10].includes(N)).map(([N, , p, sl, b, f]) => "+" + p + ": " + sl + " slot, " + b + "%, liberi " + f).join(" · ");
  console.log("partenza: +" + s0.p, s0.slots, "slot", s0.base + "%, 55 liberi |", show, "| oltre il +10:", over,
    ok(s0.p === 0 && s0.slots === 5 && s0.free === 55 && rows.every(([N, o, p]) => o && p === N) && s10.slots === 8 && s10.base === 84 && s10.free === 0 && !over
      && rows[0][3] === 6 && rows[4][3] === 7 && rows[3][3] === 6 && rows[9][3] === 8 && rows[0][4] === 33.6));
  const lockOnly = fresh({ pcs: { "testa:4": 1 }, mods: {}, eq: { testa: { r: 4, m: [] } }, lock: { "testa:4": 1 } });
  const nl = lockOnly.ev("fusePlus('testa')"), noAnc = fresh({ pcs: { "testa:4": 2 }, mods: {}, eq: { testa: { r: 3, m: [] } } }).ev("fusePlus('testa')");
  console.log("solo ancestrali bloccati:", nl, "| equipaggiato leggendario:", noAnc, ok(!nl && !noAnc));
}

console.log("— Statistiche e slot —");
{
  const eq = {}; for (const pc of ["arma", "guanti", "testa", "armatura", "stivali", "nucleo"]) eq[pc] = { r: 4, m: [], p: 10 };
  const { ev } = fresh({ pcs: {}, mods: {}, eq });
  const s = J(ev, "gearStats(progress.gear)");
  console.log("set +10: guardiano +" + r1(s.pdmg * 100) + "% · barriera +" + r1(s.hp * 100) + "% · torrette +" + r1(s.tdmg * 100) + "%", ok(r1(s.pdmg * 100) === 204 && r1(s.hp * 100) === 168 && r1(s.tdmg * 100) === 60));
  const mods = {}; for (const fx of [4, 1, 2, 7, 17, 18, 19, 23, 24]) mods["arma:4:" + fx] = 1;
  const b = fresh({ pcs: {}, mods, eq: { arma: { r: 4, m: [], p: 10 } } });
  const res = [4, 1, 2, 7, 17, 18, 19, 23, 24].map((fx) => b.ev(`installMod('arma', 4, ${fx})`));
  const c5 = fresh({ pcs: {}, mods: { "arma:0:1": 1, "arma:1:2": 1, "arma:2:7": 1, "arma:3:18": 1, "arma:4:19": 1, "arma:0:23": 1, "arma:2:24": 1, "arma:1:17": 1 }, eq: { arma: { r: 4, m: [], p: 5 } } });
  const res5 = [[0, 1], [1, 2], [2, 7], [3, 18], [4, 19], [0, 23], [2, 24], [1, 17]].map(([r, fx]) => c5.ev(`installMod('arma', ${r}, ${fx})`));
  console.log("+10: 8 Moduli installati, il nono", res[8], "| +5: 7 slot con Moduli di ogni rarità, l’ottavo", res5[7],
    ok(res.slice(0, 8).every((x) => x === "ok") && res[8] === false && res5.slice(0, 7).every((x) => x === "ok") && res5[7] === false));
}

console.log("— Salvataggio versione 10 —");
{
  const m8 = [[4, 4], [1, 4], [2, 4], [7, 4], [17, 4], [18, 4], [19, 4], [23, 4], [24, 4]];
  const { ev } = fresh({ pcs: {}, mods: {}, eq: { arma: { r: 4, m: m8, p: 10 }, guanti: { r: 4, m: [], p: 99 }, testa: { r: 2, m: [], p: 5 }, armatura: { r: 4, m: [10, 5, 11, 12, 13, 15, 16].map((fx) => [fx, 4]) } } });
  const g = J(ev, "progress.gear.eq");
  console.log("caricato: arma +" + g.arma.p, g.arma.m.length, "Moduli (9 nel file) · guanti +99 →", g.guanti.p, "· testa epica con p 5 →", g.testa.p === undefined ? "nessun +N" : g.testa.p, "· armatura senza +N:", g.armatura.m.length, "Moduli su 5 slot",
    ok(g.arma.p === 10 && g.arma.m.length === 8 && g.guanti.p === 10 && g.testa.p === undefined && g.armatura.m.length === 5));
  const save = J(ev, "JSON.parse(JSON.stringify(makeSave()))"), back = J(ev, "parseSave(JSON.stringify(makeSave())).gear.eq.arma");
  const v9 = J(ev, `parseSave(JSON.stringify({ game: SAVE_GAME, version: 9, progress: { cleared: 100, gear: { pcs: {}, mods: {}, eq: { arma: { r: 4, m: [[1, 4]] } } } } })).gear.eq.arma`);
  console.log("esportato: versione", save.version, "| reimportato: +" + back.p, back.m.length, "Moduli | versione 9 senza +N:", JSON.stringify(v9),
    ok(save.version === 10 && back.p === 10 && back.m.length === 8 && v9.r === 4 && v9.p === undefined && v9.m.length === 1));
}

console.log("— Schermata —");
{
  const { g, ev } = fresh({ pcs: { "arma:4": 4 }, mods: {}, eq: { arma: { r: 4, m: [[1, 4], [2, 3], [7, 2], [17, 1], [18, 0], [19, 4]], p: 3 } } });
  ev("openGear(); gearSel = 'arma'; gearTab = 'pcs'; gearMode = 'fuse'"); g.texts.length = 0; g.frame(); const t1 = g.texts.join("|");
  ev("tapPiece(4)"); g.texts.length = 0; g.frame(); const t2 = g.texts.join("|"); ev("tapPiece(4)"); const m = ev("gearMsg"), p = ev("plusOf(progress.gear.eq.arma)");
  console.log("nome “ancestrale +3”:", /ancestrale \+3/.test(t1), "· tasto “Fisso”:", t1.includes("Fisso"), "· riga in Fondi:", /4 ancestrali → equipaggiato \+4/.test(t1), "· secondo tocco:", /Tocca di nuovo: 4 ancestrali → \+4/.test(t2),
    "· dopo:", p, m, "| errori JS:", g.errors.length ? g.errors[0] : "nessuno",
    ok(/ancestrale \+3/.test(t1) && t1.includes("Fisso") && /4 ancestrali → equipaggiato \+4/.test(t1) && /Tocca di nuovo: 4 ancestrali → \+4/.test(t2) && p === 4 && /Arma ancestrale \+4: danno del guardiano \+50,4%, 6 slot/.test(m) && !g.errors.length));
}
