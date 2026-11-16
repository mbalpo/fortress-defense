// Esegue tutti i test e controlla l'esito. Uso: npm test   (oppure: node tests/run.js nome1 nome2)
// Ogni test stampa righe leggibili; qui si verifica che compaiano i risultati attesi e nessun errore.
const { spawnSync } = require("child_process"), path = require("path");
const NO_ERR = [/✗/, /errori JS: (?!nessuno)/, /\bERRORI? \S/, /TypeError|ReferenceError|SyntaxError|manca:/];
const T = [
  ["upg.js", "ogni potenziamento di ogni torretta e del guardiano, uno alla volta", [/con errori: 0/]],
  ["rules.js", "regole di progressione: 3 potenziamenti, level up, massimo 12", [/regole rispettate: true/], [/regole rispettate: false/]],
  ["camp.js", "tetti per livello completato, mini-boss, massimizzazioni, probabilità", [/Sky Guard: 3 \(attesi 3\)/, /Sky Guard: 7 \(attesi 7\)/, /Sky Guard: 12 \(attesi 12\)/, /chain max lv \d \(≤ livello torre: true\)/]],
  ["boss2.js", "ricompensa del mini-boss: 3 carte applicate", [/schermate di ricompensa: 3/, /carte mostrate 3, potenziamenti applicati 4/]],
  ["boss3.js", "dove compaiono mini-boss e boss finale", [/livello 10 \(multiplo di 10\) mini-boss alle ondate: —\s+\| boss finale all’ondata: 20/, /livello 11\s+mini-boss alle ondate: 5,10,15\s+\| boss finale all’ondata: —/, /Epica livello 1\s+mini-boss alle ondate: 5,10,15/]],
  ["boss4.js", "immunità e resistenze dei boss", [/paralisi: nemico 2 \| boss 0 ✓/]],
  ["hive.js", "droni dell’Hive: cono dell’onda, portata, bersagli, colpi", [/colpi max per drone: 10/]],
  ["fix2.js", "campo del Disruption Drone e percorso del Gravity Vortex Gun", [/\(4,300\):colpito  \(356,300\):colpito/, /durata del campo base\s+≈ 6\.0 s/, /3 pile \(massimo\)\s+raggio: 56 px \| percorso: 482 px/]],
  ["req.js", "frenesia (carica e durata) e buco nero statico", [/base\s+carica ≈ 30 s \| durata ≈ 8\.0 s/, /prolungata \(lv3\)\s+carica ≈ 25 s \| durata ≈ 12\.0 s/, /statico lv1\s+durata del buco nero fermo: 2 s/, /statico lv2\s+durata del buco nero fermo: 3 s/]],
  ["rate3.js", "level up lv3 del guardiano: cadenza +20%", [/base\s+intervallo medio tra colpi: 0\.15\d s/, /\(lv3\) intervallo medio tra colpi: 0\.12\d s/]],
  ["dst5.js", "pile della distruzione: 3, e 5 con la chain", [/"dst1":1\}\s+pile massime raggiunte: 3/, /"dst5":1\}\s+pile massime raggiunte: 5/]],
  ["newfx.js", "effetti del guardiano e del Disruption Drone", [/pierce=\d+/, /bounce=\d+/, /fan=\d+/, /kb=1\.5/, /kb=4\.5/, /boom=\d+/]],
  ["final.js", "sblocchi META e scelta delle carte col tocco", [/parte l’ondata 2: true/]],
  ["tiro.js", "tiro premendo e mirino, clone che specchia le salve, frenesia, ritorno all’automatico", [/premendo a x 90 .* ✓/, /mirino sul nemico .* ✓/, /automatica, nemici solo a sinistra .* ✓/, /rilasciato → colpi con bersaglio.* ✓/, /premendo senza nemici → frenesia attiva.* ✓/, /tocco su “Bersaglio” .* ✓/]],
  ["pause.js", "pausa e sue due schede", [/stato: pause/]],
  ["seen.js", "nemici scoperti e avviso al primo incontro", [/primo avviso:/]],
  ["seenboss.js", "mini-boss scoperti tipo per tipo", [/livello 14 .* ✓/]],
  ["seenfinal.js", "boss finale scoperto tipo per tipo", [/livello 20 con il boss Energy già visto → avvisi: Nave madre/]],
  ["savetest.js", "salvataggio: esporta, importa, rifiuti", [/Salvataggio importato/, /file con aim: "manual" accettato e aim ignorato: .* ✓/, /esporta file → .* ✓/]],
  ["swtest.js", "service worker (simulato)", [/installazione → file in cache/, /versione in sw\.js: .* ✓/, /messaggio skipWaiting .* ✓/]],
  ["splash.js", "schermata iniziale: controllo aggiornamenti e tocco su “Start”", [/Wake Lock: prima di “Start” .* ✓/, /Wake Lock: in secondo piano → rilasciato: true ✓/, /Wake Lock: di nuovo in primo piano → richiesto di nuovo: true .* ✓/, /Wake Lock assente o rifiutato .* ✓/, /nessun aggiornamento .* ✓/, /aggiornamento pubblicato → durante: Aggiornamento in corso… .* ✓/,
    /versione in attesa .* ✓/, /controllo senza risposta .* ✓/, /aggiornamento arrivato a gioco iniziato .* ✓/, /ricarico già fatto .* ✓/, /offline .* ✓/]],
  ["menu.js", "menu senza la scelta della mira", [/menu senza “Mira” .* ✓/, /impostazioni salvate: .* ✓/]],
  ["rev1.js", "revisione torri 1: Laser, Sky Guard, Disruption, Aeroblast, Thunderbolt, Beam, Hive", [/mini-raggi lv3\s+raggi: 3 .* ✓/, /Doppio impatto: .* ✓/, /Esplosione finale: .* ✓/, /scossa in 0,95 s: .* ✓/, /amplificato .* ✓/, /onda ampia\s+nemico a 170 px colpito: true ✓/]],
  ["rev2.js", "revisione torri 2: regola delle chain, pool libero, Laser, Beam, Hive, Firewheel, Railgun, Teslacoil, Vortex", [/Gravity Vortex Gun\s+chain: 1-1-1 1-2-1 .* ✓/, /Guardiano\s+bloccate: 6 .* 20\/20 ✓/, /Gravity Vortex Gun\s+bloccate: 6 .* 20\/20 ✓/,
    /Raffreddamento, .* ✓/, /Esplosioni a catena, .* ✓/, /Esplosioni paralizzanti: .* ✓/, /Collasso crescente ×.* ✓/, /kamikaze .* ✓/, /Varchi stabili .* ✓/]],
  ["combo.js", "combo del guardiano: sblocco e effetti delle 11 combo", [/kVortex\s+con vortex .* ✓/, /combo con chain bloccata dall’albero: kThunder, kBeam, kWheel, kTesla ✓/, /carta: Guardiano · Combo .* ✓/, /thunder\s+scattate .* ✓/,
    /con mini-raggi e debuff .* ✓/, /con Scarica distruttiva .* ✓/, /mine create .* ✓/, /Ramificazione II .* ✓/, /nuovo bersaglio .* ✓/,
    /mini-droni: 3 .* ✓/, /tiro verticale \(si preme.* ✓/, /frammentazioni: .* ✓/, /con Colpo pesante\s+colpi caricati .* ✓/]],
  ["seals.js", "Sigilli e albero: premi, nodi, torrette equipaggiate, salvataggio v2, nodi a livelli", [/totale 10 Sigilli .* ✓/, /combo Colpi ramificati: .* ✓/,
    /carte scelte in una partita: 19 .* ✓/, /Esc → stato menu .* ✓/, /versione 1 importata: .* ✓/, /codice FD1 andata e ritorno: .* ✓/,
    /costi 111112222233333444440 .* ✓/, /livelli massimi: .* ✓/, /pari \(1 e 1\): .* ✓/, /guardiano davanti .* ✓/, /regola dei livelli .* ✓/, /danno ×2\.0125 .* ✓/, /senza albero: danno ×1\.25 .* ✓/, /cupola: vita 130 .* ✓/, /Ignorare un colpo .* ✓/,
    /Durata degli stati .* ✓/, /Ventaglio potenziato al 3: .* ✓/, /maggiori per livello: .* ✓/, /senza Sigilli maggiori: .* ✓/, /Frenesia potenziata al 3: .* ✓/, /Epica: mini-boss .* ✓/, /Standard: boss finale → maggiori 0 ✓/, /abilità d’ingresso: .* ✓/, /livelli oltre il massimo .* ✓/]],
  ["abilities.js", "abilità della barriera: gruppi, cooldown, le 9 abilità, salvataggio", [/con 40: regen repulse burn ✓/, /dopo 5 s di scelta delle carte .* ✓/,
    /Rigenerazione al 3: .* ✓/, /terza no, massimo 2 .* ✓/, /seconda caduta → stato lost ✓/, /vinto con la cupola piena dopo il Backup: .* ✓/, /Impenetrabile al 3: .* ✓/,
    /Repulsiva al 2, .* ✓/, /al 5: danno alla cupola .* ✓/, /Riflettente al 2: .* ✓/, /con Sky Guard .* ✓/, /con l’Aeroblast in campo: .* ✓/, /al livello 1: mine 4 .* ✓/,
    /Potenziante al 1: .* ✓/, /dal salvataggio: equipaggiate .* ✓/, /schermata Barriera .* ✓/]],
  ["rev3.js", "revisione 3: cupola larga, laser e cupola, cristalli, sfere del Thunderbolt, Barriera minata, Firewheel", [/profilo: rx 215 .* ✓/, /nemico a x 9 \(r 9\) .* ✓/, /velocità base dei cristalli \(wisp\): 60 .* ✓/,
    /laser al centro verso l’alto .* ✓/, /raggio obliquo .* ✓/, /mini-raggi lv3 → .* ✓/, /sfere: 1 \| x da 12\.0 a 348\.0 .* ✓/, /sfere: 4 \| x da 12\.0 a 348\.0 .* ✓/, /Firewheel Durata ×3 .* rientri: 0 .* ✓/, /Firewheel Mini-droni.* rientri: 0 .* ✓/, /Firewheel Scia di fuoco.* rientri: 0 .* ✓/, /rimbalzo del guardiano verso un punto dentro la cupola: .* ✓/, /rimbalzo del clone: .* ✓/, /Barriera minata al 5: .* ✓/]],
  ["carte.js", "carte: scelta al rilascio, blocco di 0,6 s, tasti immediati, menu e pausa invariati", [/tocchi subito e dopo 0,3 s → ignorati: true ✓/, /rilasciare fuori → annullato: true ✓/,
    /premere e rilasciare sulla stessa carta → scelta, ondata 2 .* ✓/, /tasto 3 appena comparsa → scelta subito: true .* ✓/, /“Continua” premuto e rilasciato sopra → ondata 2 ✓/, /Standard e pausa alla pressione .* ✓/]],
  ["sblocchi.js", "avvisi di sblocco a fine livello (10, 20, 30, 31, 40, 50), chiusura a mano", [/livello 10 completato la prima volta → avviso: true .* ✓/, /livello 30 completato .* ✓/, /livello 50 completato .* ✓/,
    /nessun avviso: true ✓/, /“Livello 11” sotto l’avviso → ignorato, stato: won ✓/, /Invio di nuovo → parte il livello 11: play 11 ✓/, /tocco su “Ho capito” → chiuso: true ✓/]],
  ["equip.js", "equipaggiamento: inventario, salvataggio v3, drop, fusione, statistiche, effetti, schermata", [/pool \(pezzo, effetti, pesi\).* ✓/, /effetti nei pool: 30 .* ✓/, /effetti rari estratti .* ✓/,
    /ripulito: .* ✓/, /versione 2 importata: .* ✓/, /livello 29: nessuno .* ✓/, /rarità \(%\) D 30: .* ✓/, /fusione di Moduli: .* ✓/, /conti attesi ✓/,
    /tetto della riduzione del danno: .* ✓/, /colpo del guardiano: .* ✓/, /Modulo 22 ancestrale: carte offerte 4 ✓/, /Modulo 12: carte contate, .* ✓/, /guardiano dal livello 2: .* ✓/,
    /Modulo 10: .* ✓/, /Modulo 14: .* ✓/, /Modulo 16: .* ✓/, /Esc → stato menu .* ✓/, /vittoria al 30: .* ✓/]],
  ["testi.js", "testi delle carte e dei Moduli entro i bordi (font del gioco)", [/carte, titoli: .* ✓/, /carte, descrizioni: .* ✓/, /carte, note: .* ✓/, /Moduli, righe .* ✓/]],
  ["catalog.js", "catalogo grafico: al passo con i file del gioco e completo", [/hash del catalogo: .* ✓/, /torrette \(TURRETS\): \d+\/\d+ nel catalogo ✓/,
    /disegni \(TURRET_ART\): .* ✓/, /effetti per torretta: .* ✓/, /nemici \(ENEMY_DEFS\): .* ✓/, /stati \(STATUS_ICONS\): .* ✓/, /\(FX\): .* ✓/, /tipi di danno .* ✓/, /sezioni fisse: .* ✓/]],
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
