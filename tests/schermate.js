// Schermate della 1.12.3: griglia dei livelli (Standard/Epica, pagine, Sigilli, filtro), guida (stati e carte con scorrimento),
// potenziamenti presi dalla scelta delle carte.
const { makeGame } = require("./bot.js");
const ok = (c) => c ? "✓" : "✗ ERRORE";
const patch = (h) => h.replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();");
const fresh = (cleared, extra) => {
  const prog = Object.assign({ cleared, seen: [], majors: 0 }, extra || {});
  const g = makeGame({ patch, cleared, storage: { "fortress-progress-v1": JSON.stringify(prog) } }); g.frame();
  return { g, ev: g.win.__ev, T: () => { g.texts.length = 0; g.frame(); return g.texts.join("|"); } };
};

console.log("— Griglia dei livelli —");
{
  const { g, ev, T } = fresh(55, { claims: ["s31", "s31p", "s32", "e3"] });
  g.click(180, 158); g.up(180, 158);
  const t = T();
  console.log("tocco su “Livello” nel menu → stato", ev("state"), "| griglia 1-50:", /1-50/.test(t) && /51-100/.test(t), ok(ev("state") === "levels" && /Gioca il livello/.test(t)));
  const s31 = ev("JSON.stringify(sealStatus('standard', 31))"), s32 = ev("JSON.stringify(sealStatus('standard', 32))"), s20 = ev("JSON.stringify(sealStatus('standard', 20))"), e3 = ev("JSON.stringify(sealStatus('epic', 3))");
  console.log("Sigilli: 31", s31, "| 32", s32, "| 20", s20, "| Epica 3", e3,
    ok(s31 === '{"first":"got","full":"got"}' && s32 === '{"first":"got","full":"open"}' && s20 === '{"first":"no","full":"no"}' && e3 === '{"first":"got","full":"open"}'));
  const open = ev("[31, 32, 33, 20].map((l) => sealsOpen('standard', l)).join()");
  console.log("con Sigilli da prendere (31, 32, 33, 20):", open, ok(open === "false,true,true,false"));
  ev("lvPage = 1"); T(); ev("pickLevel(57)"); const sel = ev("lvSel"); ev("pickLevel(52)"); const sel2 = ev("lvSel");
  console.log("livello oltre il massimo (57) → non scelto:", sel !== 57, "| 52 scelto:", sel2, ok(sel !== 57 && sel2 === 52 && ev("state") === "levels"));
  ev("lvMode = 'epic'"); ev("pickLevel(52)");
  console.log("secondo tocco sul 52 in Epica → parte:", ev("state"), ev("mode"), ev("campLevel"), ok(ev("state") === "play" && ev("mode") === "epic" && ev("campLevel") === 52));
  const low = fresh(20); low.ev("openLevels(); lvMode = 'standard'"); const lt = low.T();
  low.g.click(260, 61); low.g.up(260, 61);              // il pulsante Epica non risponde prima del 50
  console.log("prima del 50: tocco su Epica → modalità", low.ev("lvMode"), "| testo", /Epica · dal livello 50/.test(lt), ok(low.ev("lvMode") === "standard" && /Epica · dal livello 50/.test(lt)));
  ev("state = 'menu'; openLevels(); lvFilter = true"); T(); g.key("Escape");
  console.log("filtro e Esc → stato", ev("state"), "| errori JS:", g.errors.length ? g.errors[0] : "nessuno", ok(ev("state") === "menu" && !g.errors.length));
}

console.log("— Guida —");
{
  const { g, ev, T } = fresh(35, { tree: { "sky:burn1": 1, "sky:std:dmg": 3 } });
  g.click(260, 580); g.up(260, 580); const t1 = T();
  console.log("tocco su “Guida” → stato", ev("state"), "| stati:", ["Rallentamento", "Paralisi", "Indebolimento", "Distruzione", "Vulnerabilità", "Bruciatura"].every((n) => t1.includes(n)),
    ok(ev("state") === "guide" && /Bruciatura/.test(t1) && /Scia combustibile/.test(t1)));
  ev("guideTab = 'cards'; guideSel = 'sky'"); const t2 = T();
  console.log("carte della Sky Guard: Missili incendiari sbloccata", /sbloccata \(albero\)/.test(t2), "| Bruciatura intensa bloccata", /· bloccata \(albero\)/.test(t2), "| danno per pila col nodo al 3", /Per pila: \+55% \(nodo dell’albero al 3\)/.test(t2),
    ok(/Missili incendiari/.test(t2) && /sbloccata \(albero\)/.test(t2) && /· bloccata \(albero\)/.test(t2) && /Per pila: \+55%/.test(t2)));
  ev("guideScroll = 99999"); T(); const maxS = ev("guideScroll");
  console.log("scorrimento oltre la fine → fermato a", maxS, ok(maxS > 0 && maxS < 2000));
  ev("guideScroll = 0"); g.click(180, 400); g.move(180, 300); const sc = ev("guideScroll"); g.up(180, 300);
  console.log("trascinare 100 px verso l’alto → scorrimento", sc, ok(sc === 100));
  let errs = 0; for (const id of ["player", "laser", "disr", "aero", "thunder", "beam", "wheel", "hive", "rail", "tesla", "vortex"]) { ev(`guideSel = '${id}'; guideScroll = 0`); T(); ev("guideScroll = 99999"); T(); }
  errs = g.errors.length;
  console.log("tutte le entità, cima e fondo: errori JS", errs, "| combo del guardiano:", (ev("guideSel = 'player'; guideScroll = 0"), /Combo con/.test(T())), ok(!errs));
  g.key("Escape"); console.log("Esc → stato", ev("state"), ok(ev("state") === "menu"));
}

console.log("— Potenziamenti presi dalla scelta delle carte —");
{
  const { g, ev, T } = fresh(12);
  ev("selLevel = 12; startRun('standard'); queue = []; enemies.length = 0; wave = 1; endWave();");
  const t0 = T();
  console.log("scelta delle carte: pulsante", /Potenziamenti presi/.test(t0), ok(ev("state") === "upgrade" && /Potenziamenti presi/.test(t0)));
  g.key("b"); const t1 = T();
  console.log("tasto B → vista dei potenziamenti:", /Torna alle carte/.test(t1), "| carte nascoste:", !/Scegli un potenziamento/.test(t1), ok(/Torna alle carte/.test(t1) && !/Scegli un potenziamento/.test(t1)));
  g.key("1"); console.log("tasto 1 mentre la vista è aperta → nessuna scelta:", ev("state"), ev("wave"), ok(ev("state") === "upgrade" && ev("wave") === 1));
  g.key("Escape"); const t2 = T();
  console.log("Esc → di nuovo le carte:", /Scegli un potenziamento/.test(t2), "| errori JS:", g.errors.length ? g.errors[0] : "nessuno", ok(/Scegli un potenziamento/.test(t2) && !g.errors.length));
}
