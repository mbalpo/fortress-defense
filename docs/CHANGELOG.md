# Changelog

Ogni voce: cosa è cambiato, test eseguiti, voci della checklist da aggiornare su claude.ai.

## 1.2.5 — partenza dal livello 2 (solo documentazione)

DESIGN.md § 15, testo di Marco **[deciso]**; nessuna modifica a codice, test o sezioni *(generato)*.

- Sostituito il paragrafo “Eccezione” dei vincoli di design: partire dal livello 2 (effetti 29 e 30) non cambia il numero di potenziamenti
  (12 per entità) né di level up; l’entità resta di lv2 fino al level up successivo. Le carte di lv2 possono comparire dalla prima scelta,
  il primo level up può essere di lv1 o di lv2, le regole delle chain restano valide. Tolta la nota di Claude sul “level up gratis”.

Test: nessuno (solo documentazione).

Checklist: nessuna voce da aggiungere o togliere.

## 1.2.4 — Moduli: destinatari e barriera (solo documentazione)

DESIGN.md § 15 e § 11; nessuna modifica a codice, test o sezioni *(generato)*.

- Marco approva percentuali, limiti e refresh della tabella dei valori.
- **Destinatari** **[deciso]**: gli effetti 3, 5, 6, 9, 12, 13 e 18 valgono **solo per il guardiano** (prima: guardiano e torrette). Solo 23-28 e
  30 toccano le torrette; l’eccezione ai beneficiari è ristretta di conseguenza.
- **Effetto 11** (barriera) ricalibrato **[Claude] [da rivedere]**: vita da +8% a +50% della base e danno subito da −3% a −15%, al posto di
  +5…+30 di vita e −0,1…−0,5 per colpo (troppo bassi: il danno dei nemici cresce con il livello, una riduzione fissa diventa nulla).
- § 11, difficoltà dal livello 31: riportata la crescita attuale dei nemici (tutto lineare e lento) e l’indicazione di Marco: oltre il 30 nemici
  più numerosi e più forti di base, con una curva di incremento.

Test: nessuno (solo documentazione).

Checklist: nuova voce “Curva dei nemici oltre il 30: più numerosi e più forti di base (§ 11)”.

## 1.2.3 — valori dei Moduli (solo documentazione)

DESIGN.md § 15 e § 11; nessuna modifica a codice, test o sezioni *(generato)*.

- Marco approva pesi e ripartizione dei pool: ora **[Claude]** accettati.
- Risposte di Marco **[deciso]**: l’effetto 30 vale per **tutte le torrette** della battaglia; l’effetto 8 vale per le **salve del guardiano**.
- **Effetto 29** (guardiano dal lv2, su testa e nucleo): nell’ancestrale arriva al **50%**, così servono due Moduli per renderlo certo.
  Gli esclusivi 22 e 30 restano al 100%. **[deciso]**
- Nuova tabella dei **valori X per rarità** dei 30 effetti e **regole di calcolo** (bonus ai danni sommati in un solo bonus, destinatari degli
  effetti generici, critico ×1,5, distanze, limiti per battaglia) **[Claude] [da rivedere]**: valori di partenza da misurare con i bot.
- Beneficiari: aggiunta l’eccezione per gli effetti dei Moduli che valgono per le torrette.

Test: nessuno (solo documentazione).

Checklist: togliere “Moduli: confermare pesi e ripartizione dei pool (§ 15)”; la voce “Moduli: valori X per rarità dei 30 effetti” diventa
“Moduli: confermare valori X e regole di calcolo (§ 15)”.

## 1.2.2 — effetti dei Moduli (solo documentazione)

Decisioni di Marco riportate in DESIGN.md § 15 e § 11; nessuna modifica a codice, test o sezioni *(generato)*.

- **Catalogo di 30 effetti** dei Moduli, definiti da Marco. Gli effetti 4, 12 e 17 hanno una parte di danno negativa nel comune e positiva dal
  leggendario; 22, 29 e 30 una probabilità che arriva al 100% nell’ancestrale. Valori X per rarità da definire.
- **Pool per pezzo**: 9 effetti, 1 esclusivo e 8 condivisi **[deciso]**. Ripartizione proposta da Claude **[da rivedere]**: esclusivi arma 4,
  guanti 20, testa 22, nucleo 30, armatura 10, stivali 14; ogni effetto condiviso sta in 2 pool.
- **Pesi** degli effetti 3/2/1 (rari gli effetti più forti) **[Claude] [da rivedere]**.
- **Fusione dei Moduli**: bastano 5 Moduli dello stesso pezzo e rarità, anche con effetti diversi; l’effetto del risultato si estrae dal pool
  del pezzo con i pesi. La fusione degli equip non cambia.
- **Doppioni**: lo stesso effetto una sola volta per pezzo; su pezzi diversi si sommano, con tetto del 100% per le probabilità.
- **Vincolo** del § 15 allentato: restano vietate scelte o carte in più da prendere, ma sono ammessi refresh, 4 carte tra cui scegliere e
  partenza dal livello 2 (21, 22, 29, 30). Nota: la partenza dal lv2 vale un level up gratis, da misurare sul budget del § 4.
- § 11: nuove domande aperte su valori X, pesi e pool, portata degli effetti 30 (tutte le torrette o una) e 8 (salve di chi).

Test: nessuno (solo documentazione).

Checklist: da aggiungere “Moduli: confermare pesi e ripartizione dei pool (§ 15)” e “Moduli: valori X per rarità dei 30 effetti”.

## 1.2.1 — design di equipaggiamento e chip (solo documentazione)

Decisioni di Marco riportate in DESIGN.md; nessuna modifica a codice, test o sezioni *(generato)* (§ 8, § 9).

- § 4: la campagna **prosegue oltre il livello 50** (lunghezza da definire); formula di Epica (D = livello + 30) da riverificare oltre il 50.
  Sblocchi: aggiunto **60 → Ranger (ipotesi di Marco) [da rivedere]**.
- § 11: la voce “Chip a fine livello” diventa “Chip”: due famiglie, **Sigilli** e **Moduli** (nomi provvisori), da decidere da quando cadono
  i Sigilli. Ranger: ipotesi di sblocco al livello 60, funzionamento da discutere. Nuove voci: idea messa da parte (Modulo “+1 vita barriera per
  nemico ucciso”, da riprendere con un tetto) e nomi definitivi delle famiglie di chip.
- § 13: “equipaggiamento” e “chip” uniti in “equipaggiamento e chip (§ 15)”.
- Nuovo § 15 “Equipaggiamento e chip (da costruire)”: Sigilli e Moduli; 6 pezzi di equipaggiamento con statistica base e slot; 5 rarità
  (comune, raro, epico, leggendario, ancestrale) con slot 1-2-3-4-5; Moduli per tipo di pezzo e loro categorie di bonus; fusione 5 uguali → 1
  della rarità successiva per tutte le rarità, sia equip sia Moduli; i Moduli di un equip fuso tornano in inventario; beneficiari; vincoli di
  design **[Claude]** accettati; cosa misurare con i bot.

Test: nessuno (solo documentazione).

Checklist: già aggiornata su claude.ai, nessuna voce da aggiungere.

## 1.2.0 — schermata iniziale e aggiornamenti

- **Schermata iniziale** (pannello HTML sopra il gioco): “FORTRESS DEFENSE” in alto, icona grande sotto. All’avvio, se online e con l’app già
  installata, chiede al browser se c’è un nuovo `sw.js` (attesa massima 3 s). Se c’è: “Aggiornamento in corso…”, la versione nuova scarica i file,
  si attiva e la pagina si ricarica. Poi, o subito (niente di nuovo, offline, prima installazione, tempo scaduto, ricarico già fatto), compare
  “Start” e si entra con un tocco (o Invio/spazio). Finché la schermata è aperta i tasti non comandano il gioco.
- Casi gestiti: versione già scaricata e in attesa (la pagina le chiede di attivarsi, messaggio `skipWaiting`); installazione fallita (“Start”);
  aggiornamento che arriva dopo “Start” (nessun ricarico: la versione nuova si usa all’avvio successivo). Un segno in `sessionStorage` evita
  ricarichi a catena.
- Valori tecnici **provvisori** scelti da Claude: attesa del controllo 3 s (proposta dal progetto su claude.ai), e 20 s di limite allo
  scaricamento dopo cui si gioca con la versione attuale.
- `sw.js`: nuova costante `VERSION` (uguale ad `APP_VERSION`) e cache `fortress-<versione>`: cambia ad ogni pubblicazione, così il browser vede
  l’aggiornamento; i file si scaricano saltando la cache HTTP (`cache: "reload"`); `CACHE` non va più cambiata a mano.
- `APP_VERSION` 1.1.0 → 1.2.0. DESIGN.md § 7 (testo del progetto) e § 13; DEPLOY.md, sezione “Aggiornare”.
- Nuovo test `tests/splash.js` (service worker simulato: nessun aggiornamento, offline, prima installazione, aggiornamento con ricarico, versione in
  attesa, controllo senza risposta, aggiornamento a gioco iniziato, installazione fallita, ricarico già fatto, tasti bloccati). `swtest.js`
  controlla la versione uguale ad `APP_VERSION`, la cache HTTP saltata e il messaggio `skipWaiting`. `bot.js`, `savetest.js` e `screens.js`
  toccano “Start” prima di giocare.

Test: `npm test`, 25 su 25 verdi; `npm run screenshots` controllato (schermate del canvas invariate). La schermata iniziale è HTML e non compare
negli screenshot; non è stata provata in un browser vero né su telefono.

Prova da fare su telefono (Android e, se possibile, iOS): pubblicare la versione A e installare la PWA; pubblicare la B e riaprire l’app: deve
comparire “Aggiornamento in corso…”, poi il ricarico e “Start”, con la versione nuova nell’angolo del menu; riaprire in modo aereo: “Start” subito.

Checklist: nuova voce in “Da verificare in gioco”: “Schermata iniziale: aggiornamento con ricarico, Start offline (Android e iOS)”.
Nuova voce in “Valori da rivedere”: “attesa del controllo aggiornamenti 3 s e limite di scaricamento 20 s”.

## 1.1.0 — pubblicazione

- `APP_VERSION` 1.0.0 → 1.1.0. Pubblica le revisioni torri 1 e 2 e le combo del guardiano (voci qui sotto).
  Elenco dei file in `app/` invariato: `CACHE` e `ASSETS` in `sw.js` restano uguali.

Test: `npm test`, tutti verdi.

Checklist: nessuna voce da cambiare.

## Combo del guardiano (pubblicata nella 1.1.0)

- Il personaggio ora si chiama **guardiano** (gioco, menu, pausa, documenti, commenti; nel codice restano `player` e `PLAYER_DEF`).
- **11 combo del guardiano**, una per torretta, definite da Marco. Sono carte di categoria Combo, contano come scelte del guardiano e escono solo
  con la torretta in campo e la condizione soddisfatta: torretta al livello 2 (Sky Guard, Laser, Hive, Railgun, Gravity Vortex Gun) oppure chain
  della torretta scelta con il guardiano al livello 2 (Disruption Drone, Aeroblast, Thunderbolt, Beam, Firewheel, Teslacoil). La carta dice con quale
  torretta (“Con Sky Guard · livello 1 (1/3)”). Le probabilità “per colpo” si tirano una volta per salva, quelle “per proiettile” su ogni proiettile.
- Nomi delle carte, numeri e dettagli scelti da Claude (DESIGN.md § 10, **[da rivedere]**): probabilità 3-10%, danno extra 20%, laser rotante
  di 110 px per 3 s, al massimo 5 mine e 3 mini-droni, frammenti al 50%, Mira amplificata +25% al secondo.
- Codice: funzioni condivise con le torrette (`thunderFork`/`forkHit`/`thunderZap`, `disrDmg`, `wheelMini`; `mine` e `wheelDrone` restituiscono
  l’entità; i mini-droni della combo non fermano la ricarica della Firewheel); `playerBullet` prende un oggetto di opzioni.
- DESIGN.md: § 3 regole delle combo, § 5 misure, §§ 8 e 9 rigenerati (con le combo: `design-lists.js` ora le elenca), § 10 valori, §§ 11 e 12
  aggiornati (restano da definire le combo tra due torrette). CLAUDE.md: come aggiungere una combo.
- Nuovo test `tests/combo.js`: condizioni di sblocco di tutte le 11 combo, carta, e ogni effetto misurato (rapporti di danno, frequenze su 2000 salve,
  limiti di mine e mini-droni, clone in automatico e in manuale, colpo caricato ×2 e ×3 con i rimbalzi). Nuove schermate 10-12 (carte, battaglia, pausa).

Bilanciamento, stessi 200 semi prima e dopo: livello 15 dal 76,5% al 77,5%, 25 dal 55,0% al 58,5%, 30 dal 23,5% al 23,0%: dentro il rumore
(i bot prendono le combo di rado). Nessun numero della difficoltà cambiato.

Test: `npm test`, 24 su 24 verdi; `npm run screenshots` controllato.

Checklist (già aggiornata da Claude Code, versione 18 dell’artefatto): “Riferimento · Personaggio” diventa “Riferimento · Guardiano” con il nuovo
gruppo Combo (le spunte vengono portate); nuovo gruppo “Combo del guardiano” in “Da verificare in gioco”; 5 voci nuove in “Valori da rivedere”
(probabilità, quantità, eredità, clone, nomi delle carte) e 2 in “Interpretazioni” (“torretta di lv2”, “scelta chain”); la voce sulle combo
mancanti ora riguarda solo quelle tra due torrette.

## Revisione torri 2: nomi e conferme (pubblicata nella 1.1.0)

- Marco conferma tutti i valori e le interpretazioni della revisione 2 (DESIGN.md § 10: da **[da rivedere]** a **[Claude]**).
- Nomi cambiati: Firewheel “Scia corrosiva” → **“Scia combustibile”**; Gravity Vortex Gun “Buco nero denso” → **“Buco nero iperdenso”**;
  chain del Teslacoil “Carica espansiva” → **“Sovraccarico”** (anche la sua voce lv1).
- DESIGN.md §§ 8 e 9 rigenerati: nella revisione 2 gli elenchi non erano stati reincollati (lo strumento stampa il testo, non scrive il file).

Test: `npm test`, 23 su 23 verdi.

Checklist (già aggiornata da Claude Code, versione 17 dell’artefatto): nuovi nomi; tolta la voce sul nome della chain del Teslacoil;
tolti dai “Valori da rivedere” e dalle “Interpretazioni” i valori della revisione 2 confermati da Marco.

## Revisione torri 2 (pubblicata nella 1.1.0)

Richieste di Marco sulle altre torri e sul personaggio. Con questa revisione **tutte le torri e il personaggio rispettano la regola delle chain**
(DESIGN.md § 3) e non resta nessuna voce provvisoria; manca solo il contenuto delle combo.

- **Hive**: i droni non hanno più una durata, restano finché non hanno sparato tutti i colpi (a fine ondata spariscono comunque).
  Nuovi level up lv1 “Colpi di forza” (i colpi spingono indietro) e lv2 “Droni kamikaze” (finiti i colpi, il drone si lancia sul nemico più vicino ed esplode).
  “Resistenza” ora significa: 30% che il drone, finiti i colpi, ne riceva altrettanti.
- **Beam**: Raggio ramificato, nuova lv2 “Ramificazione estesa” (un bersaglio in più).
- **Laser**: nuovo level up lv2 “Raggi penetranti” (30% di ignorare le resistenze del nemico).
- **Personaggio**: tolta “Esplosioni ampie” dalla chain Colpi esplosivi.
- **Firewheel Drone**: nuova chain Scia di fuoco (scia di 2 s che brucia · Scia corrosiva: +30% dai danni da fuoco · Fiamme intense: bruciature
  della torre +60% · Scia persistente: 4 s). Il level up lv3 “Scia infuocata” è diventato la chain. Nuovi level up lv1 “Fiamme roventi” (+60% di danno),
  lv2 “Fiamma crescente” (+10% per nemico colpito, fino a ×2), lv3 “Raffreddamento” (−5% di ricarica per nemico colpito, fino a −50%).
- **Railgun**: nuova chain Proiettile esplosivo (esplosione al primo impatto · Carica esplosiva e Deflagrazione crescono con le perforazioni disponibili
  · Esplosioni a catena: il k-esimo colpito esplode con probabilità 100% − 20% × (k − 1)). “Penetrazione” passa a lv1; nuovi lv2 “Impatto stordente”
  (paralisi 0,8 s) e lv3 “Colpo critico” (30%, danno +50%).
- **Teslacoil**: il proiettile è disegnato come un fulmine globulare, anche mentre cresce sulla bobina. Sfera statica: nuova lv2 “Sfera carica”.
  Nuova chain “Carica espansiva” (nome provvisorio): la carica passa da 0,7 a 1,2, 1,7 e 2,7 s, e l’esplosione cresce di raggio (lv1) e di danno (lv2).
  Level up: nuovi lv1 “Esplosione ampia” e lv2 “Esplosioni paralizzanti” (30%, 1 s); “Ricarica rapida” confermata (non più provvisoria).
- **Gravity Vortex Gun**: Wormhole, nuova lv2 “Varchi stabili” (6 s). Nuovi level up lv1 “Buco nero denso” (+50%) e lv2 “Buco nero lento”;
  “Collasso” (provvisorio) sostituito da lv3 “Collasso crescente” (danno e attrazione fino a ×2 a fine percorso).
- Codice: `damage()` accetta un sesto argomento per ignorare le resistenze; nuovo stato `fireVulnT` (vulnerabilità al fuoco).
- Valori scelti da Claude segnati **[da rivedere]** in DESIGN.md § 10. DESIGN.md §§ 5, 8, 10 e 12 aggiornati.

Test: `npm test`, 23 su 23 verdi. Nuovo `tests/rev2.js`: controlla la regola delle chain per tutte le torri e il personaggio, e che gli effetti nuovi
facciano quello che dicono (probabilità misurate su centinaia di prove). Larghezza di tutte le descrizioni misurata con il carattere del gioco
(la più larga è 252 px, come quella già accettata del Laser); due descrizioni accorciate. Fulmine globulare controllato negli screenshot.
Bilanciamento: vedi DESIGN.md § 5.

Checklist (già aggiornata da Claude Code su richiesta di Marco, versione 16 dell’artefatto, insieme alle voci della revisione 1 che mancavano):
- “Da verificare in gioco”: aggiunte le voci delle revisioni 1 e 2.
- “Voci provvisorie da sostituire”: tolta (sostituite entrambe).
- “Chain e level up mancanti”: restano solo le combo e il nome della chain del Teslacoil.
- “Valori da rivedere” e “Interpretazioni”: aggiornate con i valori delle revisioni 1 e 2.
- Schede di riferimento di personaggio e torri: rigenerate dalle liste del gioco.

## Revisione torri 1 (pubblicata nella 1.1.0)

Richieste di Marco sulle prime 7 torri, più la nuova regola delle chain (DESIGN.md § 3).

- **Regola delle chain**: per ogni torre e per il personaggio una chain da 1 lv1, 2 lv2, 1 lv3 e una da 1 lv1, 1 lv2, 1 lv3.
- **Hive**: i droni sparano entro 62 px invece di 125 (e si avvicinano fino a 45 px); la portata della torre resta 380 px.
  Chain Onda: nuova lv2 “Onda ampia” (onda da 130 a 182 px).
- **Sky Guard**: confermato che di base non brucia. Frammentazione: nuova lv2 “Mini-missili esplosivi” (50% di esplodere ad area).
  Nuova chain Bruciatura: Missili incendiari, Bruciatura intensa (+60%), Combustione (chi muore bruciato dalla Sky Guard esplode).
  Nuovo level up lv2 “Doppio impatto”.
- **Laser**: i rimbalzi valgono solo per il raggio principale. Tolto il level up “Indebolimento”. Chain Raggi multipli rifatta:
  +2 mini-raggi fissi (danno minore, senza rimbalzi) · Raggi debilitanti · Mini-raggi potenziati · Mini-raggi rimbalzanti. Spazzata da 1,6 a 3 s.
- **Disruption Drone**: confermato il rallentamento di base. Nuovo level up lv1 “Esplosione finale”; “Pulsazione rapida” passa da lv3 a lv2;
  nuovo lv3 “Campo attrattivo” (più danno, attira verso la linea centrale del campo).
- **Aeroblast**: tolta “Più schegge”. Nuovo level up lv1 “Esplosioni ampie”; “Doppia esplosione” passa da lv3 a lv2; nuovo lv3 “Gittata massima”.
- **Thunderbolt**: Ramificazione II = fino a 6; Ramificazioni debilitanti fanno anche più danno. Nuova chain Fulmini paralizzanti (30%, 1 s → 1,5 s,
  scossa continua, Paralisi totale). Level up: “Sfera sul campo” passa a lv1, tolta “Paralisi”, nuovi lv2 “Doppio fulmine” e “Fulmini corrosivi”.
- **Beam**: Raggio ramificato = 2 bersagli in più al lv1, Attrazione a lv2 (verso il bersaglio principale), nuova lv3 “Base esplosiva”.
  Nuova chain Raggio amplificato (fino al 200%, non si azzera, fino al 400%). “Ritmo accelerato” passa a lv1; nuovi lv2 “Raggio vorace” e “Cacciatore di boss”.
- Codice: le morti dei nemici passano tutte da `onDeath` (serve a Combustione); nuovo stato `shock` per la scossa continua.
- Valori scelti da Claude segnati **[da rivedere]** in DESIGN.md § 10. DESIGN.md §§ 3, 5, 8, 10 e 12 aggiornati.

Test: `npm test`, 22 su 22 verdi. Nuovo `tests/rev1.js` (controlla gli effetti nuovi). In `tests/hive.js` la partita con 3 pile di “Più colpi”
dura il doppio: con il raggio dimezzato i droni sparano più lentamente e nessuno arrivava a 10 colpi prima della fine dell’ondata (le ondate azzerano i droni).
Il limite di 10 è invariato e il controllo resta lo stesso. Carte nuove controllate negli screenshot (testi entro i bordi; due descrizioni accorciate).
Bilanciamento: vedi DESIGN.md § 5 (livello 10 invariato, livello 30 dal 20,5% al 17,9%, al limite del rumore).

Checklist:
- aggiungere a “Da verificare in gioco”: Hive (i droni si avvicinano prima di sparare), Laser (mini-raggi, spazzata di 3 s, rimbalzi solo sul raggio
  principale), Sky Guard (Combustione e Doppio impatto), Disruption Drone (Esplosione finale e Campo attrattivo), Thunderbolt (Scossa continua),
  Beam (Raggio amplificato, Base esplosiva, Raggio vorace).
- aggiornare i contenuti mancanti con DESIGN.md § 12: Sky Guard, Disruption Drone, Aeroblast e Thunderbolt completi; mancano 2 level up dell’Hive,
  un lv2 di level up del Laser e una seconda voce lv2 di chain per Beam e personaggio.
- aggiungere alle decisioni: nuova regola delle chain (una 1-2-1 e una 1-1-1).

## 1.0.0 — migrazione in Claude Code

Stato di partenza: tutto quello che è descritto in `DESIGN.md`, costruito nella chat su claude.ai.
Cartella organizzata in `app/` (gioco da pubblicare), `docs/`, `tests/` (21 test automatici con lanciatore `npm test`).

Correzione trovata preparando i test:
- **Frenesia tra un’ondata e l’altra**: un tempo di frenesia ancora attivo veniva azzerato all’inizio dell’ondata successiva,
  in contrasto con la regola “in pausa quando non ci sono nemici”. Ora continua nell’ondata dopo.

Test: `npm test`, 21 su 21 verdi.

Checklist:
- aggiungere a “Da verificare in gioco”: “Frenesia: una frenesia attiva a fine ondata continua nell’ondata successiva (corretto un azzeramento)”.
