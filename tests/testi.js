// Testi che devono stare nelle carte e nelle righe dell’equipaggiamento, misurati con lo stesso font del gioco (@napi-rs/canvas).
// Carte: titolo 16 px, descrizione 12 px, nota 10 px, tutti entro 260 px (larghezza della carta meno il pallino). Moduli: righe entro 290 px.
const { createCanvas } = require("@napi-rs/canvas");
const { JSDOM } = require("jsdom");
const ok = (c) => c ? "✓" : "✗ ERRORE";
const SRC = require("./src").gameHtml().replace("requestAnimationFrame(frame);\n})();", "requestAnimationFrame(frame);\nwindow.__ev = (c) => eval(c);\n})();");
const dom = new JSDOM(SRC, { runScripts: "dangerously", url: "http://localhost/", beforeParse(w) { w.requestAnimationFrame = () => 1; } });
const ev = (c) => JSON.parse(dom.window.__ev("JSON.stringify(" + c + ")"));
const c = createCanvas(10, 10).getContext("2d");
const width = (s, size, weight) => { c.font = weight + " " + size + "px system-ui, -apple-system, Segoe UI, Roboto, sans-serif"; return c.measureText(s).width; };
const check = (label, list, size, weight, max) => {
  const over = list.filter((s) => width(s, size, weight) > max);
  console.log(label + ":", list.length, "testi | oltre " + max + " px:", over.length ? over.map((s) => "“" + s + "” (" + Math.round(width(s, size, weight)) + ")").join(", ") : "nessuno", ok(!over.length));
};
const ups = ev("[...Object.values(TURRETS).flatMap((d) => d.ups), ...PLAYER_DEF.ups]");
check("carte, titoli", [...ev("Object.values(TURRETS).map((d) => d.name)"), ...ups.map((u) => u.name)], 16, 700, 260);
check("carte, descrizioni", [...ev("Object.values(TURRETS).map((d) => d.blurb)"), ...ups.map((u) => u.desc)], 12, 500, 260);
check("carte standard potenziate dall’albero (tutti i livelli dei nodi)", ev(`[PLAYER_DEF, ...Object.values(TURRETS)].flatMap((d) => d.ups.filter((u) => u.cat === "std").flatMap((u) =>
  Array.from({ length: (TREE_NODE[d.id + ":std:" + u.id] || { max: 0 }).max }, (_, i) => i + 1).map((L) => { const s = makeShooter(d, 0, 0); s.sb = { [u.id]: L }; return stdDesc(s, u); })))`), 12, 500, 260);
check("carte, note", ev(`[...Object.values(TURRETS).map((d) => describe({ kind: "new", id: d.id }).note),
  ...[PLAYER_DEF, ...Object.values(TURRETS)].flatMap((d) => d.ups.filter((u) => u.cat === "combo").map((u) => describe({ kind: "up", who: Object.assign(makeShooter(d, 0, 0), { level: 3, used: 2 }), up: u }).note))]`), 10, 500, 260);
check("Moduli, righe dell’equipaggiamento", ev("Object.keys(MOD).flatMap((fx) => [0, 1, 2, 3, 4].map((r) => modText(+fx, r)))"), 11, 600, 290);
dom.window.close();
