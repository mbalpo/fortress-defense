// 1.14.3: le carte standard potenziate dall’albero dei Sigilli mostrano nella scelta il valore potenziato (prima il testo restava quello di base),
// e l’effetto applicato corrisponde al numero scritto.
const { makeGame } = require("./bot.js");
const ok = (c) => c ? "✓" : "✗ ERRORE";
const patch = (h) => h.replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();");
const errs = [];
const g = makeGame({ patch, cleared: 45, storage: { "fortress-progress-v1": JSON.stringify({ cleared: 45, seen: [], majors: 0,
  tree: { "player:std:dmg": 5, "player:std:proj": 2, "rail:std:pierce": 3, "rail:std:cd": 2, "hive:std:hits": 1, "vortex:std:len": 2, "laser:std:bounce": 3 } }) } });
g.win.addEventListener("error", (e) => errs.push(e.message)); g.frame();
const ev = g.win.__ev;
ev("startRun('standard')");
const card = (who, id) => ev(`(() => { const s = ${who}; return describe({ kind: "up", who: s, up: s.def.ups.find((u) => u.id === '${id}') }).desc; })()`);
const rail = "makeShooter(TURRETS.rail, SLOT_X[0], GROUND_Y - 14)";

console.log("— Testo delle carte standard con il nodo dell’albero —");
const d = card("player", "dmg");
console.log("guardiano, Danno maggiorato con il nodo al 5: “" + d + "” (base “Danno +25%”)", ok(d === "Danno +75%"));
const pr = card("player", "proj");
console.log("guardiano, +1 proiettile con il nodo al 2: “" + pr + "”", ok(pr === "+1 proiettile, danno −5%"));
const pc = card(rail, "pierce"), cd = card(rail, "cd");
console.log("Railgun: perforazione al 3 “" + pc + "” · ricarica al 2 “" + cd + "”", ok(pc === "Perfora 2 nemici in più" && cd === "Ricarica −16,8%"));
const hi = card("makeShooter(TURRETS.hive, SLOT_X[0], GROUND_Y - 14)", "hits"), le = card("makeShooter(TURRETS.vortex, SLOT_X[0], GROUND_Y - 14)", "len");
const lb = card("makeShooter(TURRETS.laser, SLOT_X[0], GROUND_Y - 14)", "bounce");
console.log("Hive al 1 “" + hi + "” · Vortex al 2 “" + le + "” · Laser rimbalzo al 3 “" + lb + "”",
  ok(hi === "I droni sparano 3 volte in più" && le === "Lunghezza percorsa +20%, danno +4%" && lb === "Raggio principale: rimbalzo, nessun malus"));
const plain = card("makeShooter(TURRETS.beam, SLOT_X[0], GROUND_Y - 14)", "dmg");
console.log("senza nodo resta il testo di base: “" + plain + "”", ok(plain === "Danno +25%"));

console.log("— L’effetto corrisponde al numero scritto —");
// Danno maggiorato con il nodo al 5: ogni pila +75%; 2 pile → ×2,5 sul danno del guardiano
const m0 = ev("dmgM(player)"); ev("player.up.dmg = 2");
const m2 = ev("dmgM(player)");
console.log("danno del guardiano con 2 pile: ×" + (m2 / m0).toFixed(3), "(atteso 2,5 = 1 + 2 × 75%)", ok(Math.abs(m2 / m0 - 2.5) < 1e-9));
console.log("errori JS:", errs.length ? errs.join(" | ") : "nessuno", ok(!errs.length));
