// Genera dal codice del gioco le sezioni elenco di docs/DESIGN.md (potenziamenti, torrette, nemici, resistenze).
// Uso: node tests/tools/design-lists.js > /tmp/liste.md   — poi incollare/aggiornare in DESIGN.md
const fs = require("fs"), path = require("path");
const src = fs.readFileSync(path.join(__dirname, "..", "..", "app", "index.html"), "utf8").match(/<script>([\s\S]*?)<\/script>/)[1];
const TN = { force: "Force", energy: "Energy", electric: "Electric", fire: "Fire", physical: "Physical" };
const block = (mk) => { const a = src.indexOf(mk); return src.slice(a, src.indexOf("]}", a)); };
const parseUps = (b) => [...b.matchAll(/^\s+([SCL])\("(\w+)"(?:, "(\w+)")?, (?:(\d+), )?"([^"]+)", "([^"]+)"(?:, (true))?\)/gm)].map((x) => ({ t: x[1], id: x[2], chain: x[1] === "C" ? x[3] : null, lv: x[1] === "S" ? 0 : +x[4], name: x[5], desc: x[6], prov: !!x[7] }));
const out = [];
function ups(list) {
  const std = list.filter((u) => u.t === "S"), chains = [], lu = list.filter((u) => u.t === "L").sort((a, b) => a.lv - b.lv);
  list.filter((u) => u.t === "C").forEach((u) => { let c = chains.find((x) => x.k === u.chain); if (!c) chains.push(c = { k: u.chain, l: [] }); c.l.push(u); });
  out.push("- **Standard** (max 3 pile): " + std.map((u) => `${u.name} (${u.desc})`).join("; ") + ".");
  chains.forEach((c) => { c.l.sort((a, b) => a.lv - b.lv); out.push(`- **Chain · ${c.l[0].name}** — ` + c.l.map((u) => `lv${u.lv} ${u.name}: ${u.desc}`).join(" · ")); });
  if (!chains.length) out.push("- **Chain**: nessuna.");
  out.push("- **Level up** — " + (lu.length ? lu.map((u) => `lv${u.lv} ${u.name}: ${u.desc}${u.prov ? " *(provvisorio)*" : ""}`).join(" · ") : "nessuno."));
  out.push(`- id nel codice: ${list.map((u) => u.id).join(", ")}`);
}
out.push("### Guardiano", "", "Physical. Spara da solo, cadenza alta senza ricarica, portata totale, tutti i proiettili di una salva sullo stesso bersaglio; mentre si tiene premuto spara in verticale e colpisce chi è nella sua colonna (anche il pacco regalo).");
ups(parseUps(block("const PLAYER_DEF")));
// combo del guardiano: K(id, torretta, condizione, livello del guardiano, nome, descrizione)
const TNAME = Object.fromEntries([...src.matchAll(/^  (\w+): \{ name: "([^"]+)"/gm)].map((x) => [x[1], x[2]]));
const chainName = (tid, id) => { const u = parseUps(block("  " + tid + ": { name:")).find((v) => v.id === id); return u ? u.name : id; };
const parseK = (b) => [...b.matchAll(/^\s+K\("(\w+)", "(\w+)", (\d+|"\w+"), (\d), "([^"]+)", "([^"]+)"\)/gm)];
const combos = parseK(block("const PLAYER_DEF")).map((x) =>
  `${TNAME[x[2]]} (${x[3].startsWith('"') ? "chain " + chainName(x[2], x[3].slice(1, -1)) : "torretta lv" + x[3]}${x[4] > 1 ? ", guardiano lv" + x[4] : ""}) → ${x[5]}: ${x[6]}`);
out.push("- **Combo** (contano come scelte del guardiano): " + (combos.length ? combos.join(" · ") : "nessuna."), "");
const tre = /^  (\w+): \{ name: "([^"]+)", type: "(\w+)", range: (\d+), reload: ([\d.]+), blurb: "([^"]+)", ups: \[/gm; let m;
// combo tra due torrette (DESIGN.md § 3): K(id, secondaria, voce chain della secondaria, livello della principale, nome, descrizione)
const pairCombos = (tid) => parseK(block("  " + tid + ": { name:")).map((x) =>
  `+ ${TNAME[x[2]]} (chain ${chainName(x[2], x[3].slice(1, -1))}) → ${x[5]}: ${x[6]}`);
while ((m = tre.exec(src))) {
  out.push(`### ${m[2]} (\`${m[1]}\`)`, "", `${TN[m[3]]} · ${m[6]}. Portata ${m[4]} px, ricarica ${m[5].replace(".", ",")} s.`); ups(parseUps(block("  " + m[1] + ": { name:")));
  const pc = pairCombos(m[1]); out.push(`- **Combo tra due torrette** (da principale al lv 2, contano come scelte di questa torretta): ${pc.length ? pc.join(" · ") : "nessuna."}`, "");
}
out.push("### Nemici", "");
for (const x of src.matchAll(/^  (\w+):\s+\{ type: "(\w+)",\s+hp: (\d+),\s+speed: (\d+), r: (\d+),\s+dmg: ([\d.]+),\s+look: "(\w+)"\s+\},\s+\/\/ (.+)$/gm)) out.push(`- \`${x[1]}\` — ${x[8]}, ${TN[x[2]]}: vita ${x[3]}, velocità ${x[4]}, raggio ${x[5]}, danno alla cupola ${x[6].replace(".", ",")}`);
const RES = eval("(" + src.match(/const RESIST = (\{[\s\S]*?\n\});/)[1] + ")");
out.push("", "### Resistenze (×0,5 resiste, ×1,5 debole) — segnaposto", "");
for (const [e, r] of Object.entries(RES)) out.push(`- Nemico ${TN[e]}: resiste a ${Object.keys(r).filter((k) => r[k] === 0.5).map((k) => TN[k]).join(", ")}, debole a ${Object.keys(r).filter((k) => r[k] === 1.5).map((k) => TN[k]).join(", ")}`);
console.log(out.join("\n"));
