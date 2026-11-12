// Esegue tutti i test e controlla l'esito. Uso: npm test   (oppure: node tests/run.js nome1 nome2)
// Ogni test stampa righe leggibili; qui si verifica che compaiano i risultati attesi e nessun errore.
const { spawnSync } = require("child_process"), path = require("path");
const NO_ERR = [/✗/, /errori JS: (?!nessuno)/, /\bERRORI? \S/, /TypeError|ReferenceError|SyntaxError|manca:/];
const T = [
  ["upg.js", "ogni potenziamento di ogni torretta e del personaggio, uno alla volta", [/con errori: 0/]],
  ["rules.js", "regole di progressione: 3 potenziamenti, level up, massimo 12", [/regole rispettate: true/], [/regole rispettate: false/]],
  ["camp.js", "tetti per livello completato, mini-boss, massimizzazioni, probabilità", [/Sky Guard: 3 \(attesi 3\)/, /Sky Guard: 7 \(attesi 7\)/, /Sky Guard: 12 \(attesi 12\)/, /chain max lv \d \(≤ livello torre: true\)/]],
  ["boss2.js", "ricompensa del mini-boss: 3 carte applicate", [/schermate di ricompensa: 3/, /carte mostrate 3, potenziamenti applicati 4/]],
  ["boss3.js", "dove compaiono mini-boss e boss finale", [/livello 10 \(multiplo di 10\) mini-boss alle ondate: —\s+\| boss finale all’ondata: 20/, /livello 11\s+mini-boss alle ondate: 5,10,15\s+\| boss finale all’ondata: —/, /Epica livello 1\s+mini-boss alle ondate: 5,10,15/]],
  ["boss4.js", "immunità e resistenze dei boss", [/paralisi: nemico 2 \| boss 0 ✓/]],
  ["hive.js", "droni dell’Hive: cono dell’onda, portata, bersagli, colpi", [/colpi max per drone: 10/]],
  ["fix2.js", "campo del Disruption Drone e percorso del Gravity Vortex Gun", [/\(4,300\):colpito  \(356,300\):colpito/, /durata del campo base\s+≈ 6\.0 s/, /3 pile \(massimo\)\s+raggio: 56 px \| percorso: 482 px/]],
  ["req.js", "frenesia (carica e durata) e buco nero statico", [/base\s+carica ≈ 30 s \| durata ≈ 8\.0 s/, /prolungata \(lv3\)\s+carica ≈ 25 s \| durata ≈ 12\.0 s/, /statico lv1\s+durata del buco nero fermo: 2 s/, /statico lv2\s+durata del buco nero fermo: 3 s/]],
  ["rate3.js", "level up lv3 del personaggio: cadenza +20%", [/base\s+intervallo medio tra colpi: 0\.15\d s/, /\(lv3\) intervallo medio tra colpi: 0\.12\d s/]],
  ["dst5.js", "pile della distruzione: 3, e 5 con la chain", [/"dst1":1\}\s+pile massime raggiunte: 3/, /"dst5":1\}\s+pile massime raggiunte: 5/]],
  ["newfx.js", "effetti del personaggio e del Disruption Drone", [/pierce=\d+/, /bounce=\d+/, /fan=\d+/, /kb=1\.5/, /kb=4\.5/, /boom=\d+/]],
  ["final.js", "sblocchi META e scelta delle carte col tocco", [/parte l’ondata 2: true/]],
  ["manual.js", "mira manuale e pausa della frenesia", [/la partita parte in manuale: true ✓/]],
  ["pause.js", "pausa e sue due schede", [/stato: pause/]],
  ["seen.js", "nemici scoperti e avviso al primo incontro", [/primo avviso:/]],
  ["seenboss.js", "mini-boss scoperti tipo per tipo", [/livello 14 .* ✓/]],
  ["seenfinal.js", "boss finale scoperto tipo per tipo", [/livello 20 con il boss Energy già visto → avvisi: Nave madre/]],
  ["savetest.js", "salvataggio: esporta, importa, rifiuti", [/Salvataggio importato/]],
  ["swtest.js", "service worker (simulato)", [/installazione → file in cache/]],
  ["menu.js", "interruttore della mira nel menu", [/dopo il tocco: Mira: manuale/]],
];
const only = process.argv.slice(2);
let fails = 0; const t0 = Date.now();
for (const [file, what, need, forbid] of T) {
  if (only.length && !only.some((o) => file.startsWith(o))) continue;
  const t = Date.now(), r = spawnSync(process.execPath, [path.join(__dirname, file)], { encoding: "utf8", timeout: 290000 });
  const out = (r.stdout || "") + (r.stderr || "");
  const problems = [];
  if (r.status !== 0) problems.push(r.signal ? "interrotto (" + r.signal + ")" : "uscito con codice " + r.status);
  for (const re of need || []) if (!re.test(out)) problems.push("manca: " + re);
  for (const re of [...NO_ERR, ...(forbid || [])]) { const m = out.match(re); if (m) problems.push("trovato: " + out.split("\n").find((l) => re.test(l)).slice(0, 160)); }
  const sec = ((Date.now() - t) / 1000).toFixed(0) + "s";
  if (problems.length) { fails++; console.log("✗ " + file.padEnd(14) + what + "  (" + sec + ")"); problems.forEach((p) => console.log("    " + p)); }
  else console.log("✓ " + file.padEnd(14) + what + "  (" + sec + ")");
}
console.log((fails ? "\n" + fails + " test falliti" : "\nTutti i test passano") + " · " + ((Date.now() - t0) / 1000).toFixed(0) + "s");
process.exit(fails ? 1 : 0);
