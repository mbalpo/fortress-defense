# Changelog

Ogni voce: cosa è cambiato, test eseguiti, voci della checklist da aggiornare su claude.ai.
Da questa versione ogni voce dice anche se il catalogo grafico è stato rigenerato.

## 1.14.2 — Epica separata, portata dal centro, raggio al tocco, Vortex rev. 3, Modulo 10 in %, testi delle abilità

- **Epica con avanzamento separato** (Marco): nuovo campo `clearedEpic`; il livello 1 di Epica ha difficoltà 31. Selettore e griglia dei livelli separati da Standard
  (striscia “Standard ⇄ Epica” nel menu dal livello 50, schede nella griglia); “Livello successivo” anche dopo una vittoria in Epica; frecce da tastiera sulla modalità del menu.
  `SAVE_VERSION` 6: `clearedEpic` migrato dal livello più alto tra le chiavi `e<N>` dei premi riscossi.
- **Un solo level up per entità in ogni offerta** (`rollOptions`, anche per il guardiano). Con i bot scatta di rado: un’entità offre level up solo dopo 3 carte.
- **Gravity Vortex Gun, revisione 3**: “Percorso più lungo” +20% per pila, base 253 px (`vortexLen`, `vortexReach`); il nodo dell’albero dà danno +2% per pila e per livello
  del nodo invece di allungare il percorso. § 8 rigenerato con `npm run design-lists`.
- **Modulo 10**: riduzione del danno per colpo in % invece del pool di danni ignorati (5/8/12/16/20%, contrattacco 50-300% ×3-8); `TREE_CAP.red` 0,4 → 0,5; tolto `gearAbsorb`.
  Numeri del contrattacco in ciano `#7fe8ff`, più grandi (16) e più lunghi (1,2 s). Testo accorciato in “Barriera: danno −X%, contrattacco Y% ×N” per stare nei 46 caratteri [Claude].
- **Testi delle abilità**: cooldown effettivo (equipaggiamento e albero) nei testi per livello; descrizioni su due righe nell’albero e nella guida.
  Scansione delle descrizioni senza numero: 74 proposte in `docs/proposte-testi.md`, **da approvare** (non applicate).
- **Portata misurata dal centro in basso** **[deciso]** (Marco): tutte le torrette misurano la portata da (180, `GROUND_Y`−30), dove parte il guardiano, anche quelle laterali
  (`RANGE_FROM`, `inReach` in `pickTargets`, Sky Guard e Hive). Tra i nemici in portata ognuna sceglie il più vicino a sé [Claude].
- **Raggio d’azione al tocco**: tocco rapido su una torretta (meno di 0,3 s, meno di 10 px) → arco rosso semitrasparente per 2 s, centrato sul punto di partenza della portata;
  oltre 500 px velo rosso su tutto lo schermo; il Vortex mostra `vortexReach`. Durante l’ondata e in pausa, non nella scelta delle carte; la pressione lunga resta il trascinamento.
- **Muro 100 ritarato** (Marco): con la portata dal centro il bot smart scendeva al 48%; `FINAL_BOSS_K[100]` 0,75 → 0,65 → 58 / 53% (random / smart, 60 partite per bot).
- **Obiettivo di bilanciamento** **[deciso]** (Marco): per i muri dal 40 conta solo la soglia minima del 50%; sopra il 70% va bene (il gioco non deve essere punitivo). Misure più leggere.
- DESIGN.md: § 2 (portata dal centro, raggio al tocco), § 3, § 4 (Epica), § 5 (misure 1.14.2, `FINAL_BOSS_K`), § 8, § 10 (Vortex), § 15 (Modulo 10, soglia minima), § 16 (tetto 50%).

**Test**: `npm test`: tutti verdi. Nuovo `tests/v1142.js` (Vortex, cooldown effettivo, raggio al tocco, portata dal centro); `schermate.js` (Epica, un level up per entità),
`equip.js`, `seals.js`, `v114.js` aggiornati ai nuovi valori e alla versione 6 del salvataggio. `npm run screenshots`: nuove 61-71, testi nei bordi.
**Misure** (§ 5): muri 40/50/100 con l’equipaggiamento atteso, 100 partite per bot: 40 56 / 62 · 50 55 / 55 · 100 58 / 48 → 58 / 53 dopo la correzione;
Modulo 10: al 50 danno risparmiato 12,6% e 6,4 contrattacchi per partita, al 100 17,4% e 8,1; muri 10/20/30 (400 partite per bot) invariati rispetto alla 1.14.1.

Catalogo grafico: rigenerato → docs/catalogo-grafico.html (e alternativo HD-2D; scene nuove: raggio al tocco, velo, contrattacco, menu Epica).

Checklist: aggiornata (versione 24): aggiunte le prove della 1.14.2 (Epica, raggio al tocco, portata dal centro, Vortex rev. 3, Modulo 10, un level up per entità, testi delle abilità, muro 100), le decisioni da prendere (proposte di testo, migrazione dell’Epica, bersaglio con la portata dal centro) e i riferimenti nuovi; tolte le voci sul percorso del Vortex a 480 px; aggiornati Epica, Modulo 10, tetto al 50% e obiettivo dei muri.

## Checklist di revisione aggiornata da Claude Code (solo documenti, gioco invariato: resta 1.14.1)

- La checklist su claude.ai era ferma alla 1.2.5. Aggiornata (versione 22 dell’artefatto) con le voci “Checklist” dalla 1.2.0 alla 1.14.1: due sezioni nuove
  (“Da provare sul telefono”, “Da decidere o confermare”) e tre riferimenti nuovi da DESIGN.md (Equipaggiamento e Moduli con drop e valori X, Sigilli e albero con i maggiori,
  Barriera e abilità); riscritti progressione, sblocchi, boss e difficoltà; aggiunti i nemici mancanti; tolte le voci superate. Le spunte delle voci spostate restano (`RENAMED`).
- Da ora la checklist la aggiorna Claude Code alla fine di ogni lavoro: regola 6 di CLAUDE.md, `docs/PROGETTO-claude-ai.md` (anche le istruzioni da incollare), DESIGN.md § 14.

**Test**: nessun codice del gioco cambiato; checklist provata in jsdom (nessun errore, spunte portate sulle voci spostate).

Catalogo grafico: non cambiato.

Checklist: aggiornata (versione 22). Su claude.ai: incollare di nuovo nelle istruzioni del progetto il testo della sezione 3 di `docs/PROGETTO-claude-ai.md`.

## 1.14.1 — due Sigilli subito con la cupola al 100%, velocità della partita

- **Sigilli** (Marco): se il primo completamento di un livello (dal 31 in Standard, da subito in Epica) finisce con la cupola al 100%, si prendono subito
  tutti e due i premi (primo completamento e cupola), senza rigiocare. Prima il premio della cupola richiedeva un completamento successivo al primo (lettura di Claude, ora superata).
  Il Backup continua a escludere il premio della cupola. Schermata di vittoria: “+2 Sigilli ◆ (…)” e sotto “Primo completamento e cupola al 100%”. Salvataggio invariato (stesse chiavi `s31`/`s31p`).
- **Velocità della partita** (Marco): tasto semitrasparente prima di “Nemici”, solo durante l’ondata: 1x → 1,5x → 2x → 1x. Resta per le ondate e le partite seguenti
  (impostazioni, campo `speed`; valori non validi ignorati). La logica avanza in passi da al massimo 0,05 s come a 1x, quindi il bilanciamento non cambia;
  anche il tempo di `clock` (rampa dell’Amplificatore, animazioni) accelera. Scelte di Claude: posizione e aspetto del tasto (più trasparente a 1x, bordo verde a 1,5x e 2x), `Nemici` spostato a destra.
- DESIGN.md: § 2 (velocità), § 16 (flusso dei Sigilli e fase 1), § 11 (tolta la lettura da confermare sul premio della cupola).

**Test**: `npm test`: tutti verdi. Nuovo `tests/speed.js` (tre tocchi, tempo di gioco ×1,5 e ×2, passi da 0,05 s su un fotogramma lento, impostazione salvata e ricaricata);
`tests/seals.js`: “Standard 32, primo già al 100%” ora dà 2 Sigilli e la rigiocata 0. `npm run screenshots`: nuove `59-velocita-1-5x.png` e `60-vittoria-due-sigilli.png`, testi nei bordi.

Catalogo grafico: rigenerato → docs/catalogo-grafico.html (e alternativo HD-2D; cambia solo la versione).

Checklist: togliere “Premio della cupola solo da un completamento successivo al primo (da confermare)”; aggiungere “Primo completamento con la cupola al 100%: due premi subito”
e “Prova su telefono: velocità 2x con il contatore fps in una battaglia affollata (boss finale), la scelta resta riaprendo l’app”.

## Pubblicazione su GitHub Pages (gioco invariato: resta 1.14.0)

- Nuovo workflow `.github/workflows/pages.yml`: a ogni push su main che tocca `app/` (o il workflow), oppure a mano, pubblica il solo contenuto di `app/`
  su https://mbalpo.github.io/fortress-defense/ (`checkout@v7`, `configure-pages@v6`, `upload-pages-artifact@v5`, `deploy-pages@v5`; nessuna build).
- Percorsi in `app/` già tutti relativi (manifest `start_url`, `scope` e `id` a `./`, `ASSETS` di sw.js con `./`, `index.html` senza percorsi assoluti né URL Netlify):
  nessuna correzione, quindi nessuna versione nuova.
- `netlify.toml` (solo `publish = "app"`, nessun header né redirect) resta: il vecchio sito Netlify rimane attivo fino alla prova sul telefono. Non c’erano `_headers` né `_redirects`.
- DEPLOY.md: indirizzo, file pubblicati, nuova procedura di rilascio, push che non toccano `app/` e non pubblicano, cache di 10 minuti di GitHub Pages.
- Controllo del repository pubblico (cronologia compresa): nessuna chiave, token o password, nessun percorso locale. L’email di lavoro, presente nei metadati di tutti i commit, è stata sostituita nella cronologia con l’indirizzo noreply di GitHub
  (`git filter-repo --mailmap`, contenuti dei commit identici) e impostata per i commit futuri di questo repository.

**Test**: `npm test`: tutti verdi.

Catalogo grafico: non cambiato.

Checklist: aggiungere “Prova su telefono: esportare il salvataggio dal vecchio sito (file o codice FD1:), aprire il nuovo indirizzo, importarlo, reinstallare la PWA;
poi pubblicare una versione B e riaprire l’app per controllare l’aggiornamento.”

## DEPLOY.md: contenuto del salvataggio (solo documenti, gioco invariato: resta 1.14.0)

- La sezione SALVATAGGIO diceva che il salvataggio “non contiene la partita in corso” ed elencava solo livelli, nemici e impostazioni. Ora elenca anche Sigilli e maggiori,
  albero, abilità della barriera, equipaggiamento con i lucchetti, e dice che la partita in sospeso (Continua) non si esporta e viene cancellata importando un salvataggio.

**Test**: nessun codice cambiato; `npm test` non serve.

Catalogo grafico: non cambiato.

Checklist: nessuna voce da cambiare.

## 1.14.0 — muro 50 ritarato (stessa versione, non ancora pubblicata)

Con i maggiori della barriera il muro 50 era sceso al 20% (prima 45,5%): al 50 nessuno ha ancora maggiori. Su proposta di Claude, approvata da Marco, i costi restano e cambia il solo muro 50:
nemici normali all’85% della vita (`WALL_ENEMY_HP[50] = 0.85`) e boss finale ×0,6 (`FINAL_BOSS_K[50] = 0.6`).

**Bot** (`EQUIP=1.5 node tests/tools/curva.js 50 100`, 200 partite per prova, stessi semi): con maggiori 20,0% → Riduzione danno senza maggiore 24,0% · maggiore dal livello 2 24,5% ·
solo nemici ×0,85 32,0% / ×0,75 35,0% · solo boss ×0,7 29,5% / ×0,55 38,5% · nemici ×0,8 + boss ×0,55 66,5% · **nemici ×0,85 + boss ×0,6 60,0%** (scelta). Il 40 non cambia (65,5%).
Le partite dei bot sono deterministiche con gli stessi semi, quindi il 60,0% vale per il codice applicato. Numeri in DESIGN.md § 5 e § 16.

**Test**: `npm test`: tutti verdi.

Catalogo grafico: rigenerato → docs/catalogo-grafico.html e docs/catalogo-grafico-alternativo.html (solo il codice incorporato; disegni invariati).

Checklist: aggiungere “muro 50: si supera circa nel 60% delle partite dei bot; da provare a mano”; togliere “Da decidere: muro 50 al 20% con i maggiori della barriera”.

## 1.14.0 — Continua, lucchetti, azzeramento dell’albero, barriera con maggiori

Implementate le decisioni inserite in DESIGN.md nella voce sotto.

- **Partita in sospeso e Continua** (§ 2): a ogni inizio ondata la partita si salva in `fortress-run-v1` (livello, modalità, ondata, carte prese anche dai mini-boss,
  vita della cupola, frenesia, contatori dei Moduli, tiri dei Moduli 29/30, abilità della barriera, Sigillo maggiore dei boss già preso). Se il sistema scarta l’app, il menu
  mostra **Continua** (livello, modalità, ondata; tasto C): le carte si rigiocano e si riparte dall’inizio dell’ondata, in pausa. Si cancella con vittoria, sconfitta,
  “Abbandona”, salvataggio importato e `APP_VERSION` diverso; un’altra partita chiede prima “Sostituire la partita in sospeso?” (due tocchi). Finché c’è, albero ed
  equipaggiamento si aprono in sola lettura con il messaggio “Partita in sospeso: continua o abbandona per modificare” (i lucchetti restano usabili).
  Il Sigillo maggiore del boss finale vale una volta per partita e si scrive subito, così rigiocando l’ondata non si riprende.
- **Tipo di avvio accanto alla versione** nel menu (“nuova”, “ricaricata”, “indietro”, “scartata” con `document.wasDiscarded`): serve a confermare quando il telefono scarta l’app.
- **Scheda Abilità bloccata fino al 40** (§ 16): overlay con lucchetto e “Livelli completati: N/40”; finché è bloccata non si comprano, potenziano né equipaggiano abilità.
- **Barriera con i maggiori** (§ 16): 1 maggiore allo sblocco di Riduzione danno, Vita fissa, Riduzione cooldown, Ignorare un colpo, Più carte più danno; Vita % ai livelli 6, 11, 16.
  Albero intero: 145 maggiori.
- **Azzeramento per sezione** (§ 16): pulsante “Azzera” in alto a destra nell’albero, per la sezione aperta, due tocchi (“Sicuro?” con il rimborso). Restituisce Sigilli e maggiori
  ai costi attuali; Torrette comprende la sezione per tipo e toglie le torrette equipaggiate; Barriera comprende le abilità e le toglie dall’equipaggiamento; premi riscossi invariati.
- **Equipaggiamento** (§ 15): Equipaggia e Installa a due tocchi (il primo mostra cosa cambia: statistica, Moduli che tornano in inventario o Modulo sostituito; toccare altro annulla).
  **Lucchetti per esemplare** su righe dell’inventario, pezzo equipaggiato e Moduli installati: le righe si dividono in bloccati e non bloccati, i bloccati non si scartano né
  si fondono, il blocco segue l’esemplare. **Sostituzione dei Moduli**: stesso effetto a rarità maggiore sostituisce quello installato anche con slot pieni (il vecchio torna in
  inventario); a rarità uguale o minore rifiuto con messaggio. Prima nel codice c’era solo il rifiuto: la sostituzione è nuova.
- **Thunderbolt** (§ 10): la sfera si ferma mentre parte il suo fulmine (0,18 s; 0,38 s con il Doppio fulmine), in entrambe le grafiche; nessun effetto sul danno.
- **Salvataggio versione 5**: `progress.gear.lock` e blocco di pezzi equipaggiati e Moduli installati; le versioni precedenti si importano senza blocchi, i bloccati in più si riducono.
- `APP_VERSION` e `VERSION` di `sw.js`: 1.14.0 (l’elenco dei file non cambia).

**Test**: nuovo `tests/v114.js` (overlay delle Abilità, maggiori della barriera, azzeramento con controllo del saldo, divisione e unione delle righe bloccate, scarto e fusione
dei bloccati, blocco che segue l’esemplare, sostituzione e doppioni di rarità diverse, salvataggio v5 e import v4, fermo delle sfere, ripristino da checkpoint con le stesse carte,
cupola, frenesia e contatori, sola lettura di albero ed equipaggiamento, Sigillo maggiore non ripreso, cancellazione con vittoria/sconfitta/Abbandona/import/versione, due tocchi
“sostituirla?”). Aggiornati, per le decisioni nuove: `equip.js` (equipaggiare e installare a due tocchi, formato con `lock`, versione 5), `seals.js` (maggiori della barriera, versione 5).
`npm test`: tutti verdi. Schermate nuove 51-58 controllate (menu con Continua e “sostituirla?”, albero ed equipaggiamento in sospeso, lucchetti, sostituzione, Azzera, Abilità bloccate).

**Bot** (muri 40 e 50, `EQUIP=1.5 node tests/tools/curva.js 40,50 100`, 200 partite per muro, stessi semi): 40 **68,5% → 65,5%** · 50 **45,5% → 20,0%** (prima → dopo i maggiori della barriera; al 50 i bot hanno 28 Sigilli e 0 maggiori, quindi la barriera si ferma a Vita % 5). Il 50 scende sotto la fascia decisa del 50-70%: non ho toccato curva né costi, decide Marco (annotato in DESIGN.md § 16).

Catalogo grafico: rigenerato → docs/catalogo-grafico.html e docs/catalogo-grafico-alternativo.html (sfere del Thunderbolt).

Checklist: aggiungere da provare sul telefono: Continua dopo che il telefono scarta l’app (e cosa dice il tipo di avvio accanto alla versione); “Sostituire la partita in sospeso?”;
albero ed equipaggiamento in sola lettura con una partita in sospeso; overlay delle Abilità prima del 40; costi in maggiori della barriera; Azzera per ogni sezione (saldo di Sigilli
e maggiori); lucchetti (divisione e unione delle righe, scarto e fusione rifiutati); Equipaggia/Installa a due tocchi; sostituzione dei Moduli; sfera del Thunderbolt ferma durante il fulmine.
Da confermare (letture di Claude): contenuto delle sezioni Torrette e Barriera nell’azzeramento. Da decidere: muro 50 al 20% con i maggiori della barriera.

## Decisioni di design: Continua, blocchi, azzeramento, barriera con maggiori (solo DESIGN.md, gioco invariato: resta 1.13.1)

Testo di Marco inserito in `docs/DESIGN.md`; **nulla è ancora implementato**.

- § 2: **Partita in sospeso e Continua** (`fortress-run-v1`, ripresa dall’inizio dell’ondata interrotta, albero ed equipaggiamento in sola lettura finché c’è).
  § 7: la chiave `fortress-run-v1`; l’esportazione non include la partita in sospeso; formato **versione 5** con `progress.gear.lock`. § 13: tolto “salvataggio della partita in corso”.
- § 4 e § 16: scheda **Abilità** della barriera bloccata da un overlay fino al completamento del 40.
- § 16: la **barriera** costa maggiori (1 allo sblocco per Riduzione danno, Vita fissa, Riduzione cooldown, Ignorare un colpo, Più carte più danno; Vita % ai livelli 6, 11, 16):
  totale dell’albero 145 maggiori. Aggiunto da misurare con i bot (muri 40 e 50).
- § 16 e § 11: **azzeramento per sezione** con rimborso totale (sostituisce la proposta aperta di rimborso).
- § 15: **Equipaggia/Installa** a due tocchi; **blocco per esemplare** con lucchetto; **sostituzione** di un Modulo con uno dello stesso effetto e rarità maggiore.
- § 10: **Thunderbolt**, la sfera si ferma mentre parte il fulmine (0,18 s; 0,38 s col Doppio fulmine).

**Test**: `npm test`: tutti verdi (nessun codice cambiato).

Catalogo grafico: non cambiato.

Checklist: aggiungere da provare, quando saranno implementati: Continua dopo che il telefono scarta l’app; overlay della scheda Abilità prima del 40; costi in maggiori della barriera;
azzeramento per sezione (saldo di Sigilli e maggiori); lucchetti (divisione e unione delle righe); Equipaggia/Installa a due tocchi; sostituzione dei Moduli; sfera del Thunderbolt ferma durante il fulmine.

## Cataloghi grafici di nuovo funzionanti (solo strumenti, gioco invariato: resta 1.13.1)

Segnalazione di Marco: dalle ultime modifiche il catalogo grafico e quello alternativo non mostrano più scene né tessere (il gioco invece va bene).

- **Causa** (1.13.0): `buildDoc` di `tests/tools/catalog.js` gira anche nel browser (la pagina lo incorpora per costruire le scene e l’atelier delle tessere),
  ma usava `ALT`, che esiste solo nel generatore → nel browser ogni scena e ogni tessera si fermava subito con un errore. In più la pagina non incorporava
  `draw-hd2d.js` e nel catalogo HD-2D il codice incorporato come `draw.js` era in realtà `draw-hd2d.js`.
- **Correzione**: la scelta della grafica (`gfx`) e il codice HD-2D (`drawHd`) viaggiano in `P` come gli altri pezzi; la pagina incorpora a parte
  `draw.js` (`#src-draw`), `draw-hd2d.js` (`#src-draw-hd`, vuoto nel catalogo classico) e la grafica (`#data-gfx`). Il codice mostrato in fondo alla pagina non cambia.

**Test**: `tests/catalog.js` ora costruisce la scena “battaglia” come fa il browser, con `buildDoc` e i pezzi presi dalla pagina generata, per entrambi i
cataloghi, e controlla che non ci siano errori e che la grafica sia quella giusta (classica / HD-2D). Controprova: sulla pagina vecchia il controllo fallisce.
`npm test`: tutti verdi.

Catalogo grafico: rigenerato → docs/catalogo-grafico.html e docs/catalogo-grafico-alternativo.html.

Checklist: nessuna voce da cambiare; aprendo i due cataloghi, scene e tessere devono animarsi.

## 1.13.1 — il gioco si chiama Planet Defense

Richiesta di Marco: rinominare il gioco da Fortress Defense a Planet Defense.

- **Nomi visibili**: titolo della pagina, schermata iniziale, titolo del menu (grafica classica e HD-2D), nome dell’app installata (`manifest.json`: “Planet Defense”,
  nome breve “Planet”; su iPhone “Planet”), titolo della condivisione e nome del file del salvataggio (`planet-defense-salvataggio-AAAA-MM-GG.json`), messaggio
  “Non è un salvataggio di Planet Defense.”, titoli di catalogo, README, CLAUDE.md, DESIGN.md, DEPLOY.md, PROGETTO-claude-ai.md, commenti in testa ai file.
- **Restano col vecchio nome, apposta**: chiavi del localStorage (`fortress-progress-v1`, `fortress-proto-v1`, `fortress-update-reload`), `game: "fortress-defense"` e
  prefisso `FD1:` dei salvataggi, cache del service worker `fortress-…`, `FORTRESS_DRAW`, cartella del progetto e pacchetto npm. Cambiarle farebbe perdere
  i progressi sul telefono e rifiutare i salvataggi già esportati. Le icone non hanno scritte: invariate.
- `APP_VERSION` e `VERSION`: 1.13.1. Sul telefono il nome sotto l’icona si aggiorna da solo (a volte dopo un po’); se no, basta reinstallare l’app.

**Test**: aggiornati i testi attesi in `splash.js`, `menu.js` e `savetest.js` (titolo, messaggio di rifiuto, nome del file). `npm test`: tutti verdi.
Schermata del menu controllata.

Catalogo grafico: rigenerato → docs/catalogo-grafico.html e docs/catalogo-grafico-alternativo.html (titoli).

Checklist: rinominare il progetto su claude.ai in “Planet Defense” e aggiornare il nome nelle istruzioni del progetto; dopo la pubblicazione, controllare il nome
sotto l’icona sul telefono.

## 1.13.0 — grafica HD-2D nel gioco, a scelta nel menu principale

Richiesta di Marco: portare la proposta HD-2D nel gioco con un’opzione per scegliere la grafica, nel menu principale.

- **`app/draw-hd2d.js`** (`FORTRESS_DRAW_HD`, 1.161 righe): solo le differenze HD-2D, ricavate dalla copia completa della proposta (`docs/hd2d/draw-hd2d.js`, tolta).
  Alla fine di `FORTRESS_DRAW`, `draw.js` legge la grafica scelta (dal localStorage: le impostazioni del gioco lì non esistono ancora; `window.FORTRESS_GFX`
  la impone per catalogo e test) e, se è HD-2D, valuta `FORTRESS_DRAW_HD` nel proprio ambito: le funzioni di draw.js si sostituiscono assegnandole,
  `TURRET_ART` (11 voci) e `FX` (29 voci) si completano con `Object.assign`. Schermate, testi, carte e guida restano un solo codice per le due grafiche.
- **`draw.js` riorganizzato senza cambiare l’aspetto** (61 schermate classiche identiche al pixel prima e dopo): nuovi punti di aggancio `drawSky`, `drawWorld`,
  `drawMenuBack`, `enemyBody`, `enemyBar`, `bossBar`, `frenzyBar`, `menuTitle`, `cardBadge`; `drawTurret` passa anche la torretta a `TURRET_ART`.
  La grafica HD-2D dà le stesse immagini della proposta (10 schermate di prova identiche al pixel).
- **Menu principale**: pulsante “Grafica: Classica ⇄” / “Grafica: HD-2D ⇄” sotto Salvataggio e Guida (`toggleGraphics`: vale solo nel menu, salva e ricarica la
  pagina con `reloadPage`); suggerimento dei tasti e versione spostati più in basso. Impostazioni: nuovi campi `graphics` e `fps` (valori non validi ignorati).
- **Contatore dei fotogrammi al secondo** (`drawFps`, entrambe le grafiche): sotto “Liv…” nell’HUD, verde da 50, giallo da 30, rosso sotto; si accende e spegne
  toccando la versione in basso a destra nel menu (che diventa “v… · fps”).
- **Memoria**: la cache degli sprite HD-2D si svuota oltre 1.500 sprite (rocce dei nemici morti, colori iridescenti) e si rifà quando serve.
- **Pubblicazione**: `draw-hd2d.js` in `ASSETS` di `sw.js`; `APP_VERSION` e `VERSION`: 1.13.0. `tests/src.js` incorpora anche `draw-hd2d.js` (`gameHtml(file, gfx)`).
- **Catalogo**: `npm run catalog-hd2d` usa `draw.js` + `draw-hd2d.js` (titolo “grafica HD-2D”); il catalogo principale si chiama “grafica classica”.
- CLAUDE.md (struttura, regola del catalogo), DEPLOY.md, DESIGN.md § 6: aggiornati.

**Test**: nuovo `tests/grafica.js` (grafica di base classica; cambio dal menu salvato con ricarica; nessun cambio durante l’ondata; impostazione “hd2d” letta al
caricamento; contatore fps; impostazioni non valide ignorate; due partite di 3 minuti in HD-2D con tutte le 11 torrette potenziate, senza errori; cache degli sprite
sotto il tetto, anche abbassato a 300 per vederla svuotare). Aggiornati `swtest.js` (9 file in cache) e `splash.js` (sostituisce ogni `location.reload();`).
`npm test`: tutti verdi.

**Misure con i bot**: non servono (solo disegno). **Fluidità sul telefono: da provare** con il contatore.

Catalogo grafico: rigenerato → docs/catalogo-grafico.html e docs/catalogo-grafico-alternativo.html.

Checklist: sostituire “Proposta HD-2D completa: decidere se adottarla” con “Grafica HD-2D: provare la fluidità sul telefono (contatore fps: tocco sulla versione
nel menu), con molti nemici ed effetti”.

## 1.12.5 — segni sulle carte chain e level up, scritta della cupola leggibile, equipaggiamento nel catalogo

Richieste di Marco, applicate al gioco e alla proposta HD-2D.

- **Carte** (`cardMark`, in `upgradeScreen` e `rewardScreen`): sopra il pallino, nel colore del tipo, una catena verticale per livello della chain (affiancate) o una
  freccia ^ per livello del level up (una sotto l’altra). `describe` passa `cat` e `lv` (solo per il disegno). Nella proposta HD-2D gli stessi segni a pixel.
  DESIGN.md § 3: nuova voce.
- **Barra della cupola**: “Cupola 100/100” in bianco col contorno scuro (prima bianco semplice, poco leggibile sul verde), nel gioco e nella proposta.
- **Catalogo grafico**: equipaggiamento e Moduli escono da “8 · Da aggiungere” (resta il Ranger) e hanno la loro parte nel § 2 (“Torrette, guardiano,
  equipaggiamento”): una tessera per pezzo e una per Modulo, ognuna nelle 5 rarità (animate per l’ancestrale iridescente). `draw.js` esporta `PIECE_ART`,
  `pieceIcon`, `modIcon`, `rarColor`, `cardMark`. `tests/catalog.js` controlla anche pezzi e Moduli (6/6).
- `APP_VERSION` e `VERSION` di `sw.js`: 1.12.5.

**Test**: `npm test` tutti verdi (nuovi controlli del catalogo su pezzi e Moduli). Schermate controllate: `16-carte-standard-chain-levelup.png`, `42-carte-4-rinnovo.png`
e `hd2d-(orig-)carte-segni.png` (chain lv2 e lv3, level up lv1 e lv3, con 4 carte: il segno sta nella carta).

**Misure con i bot**: non servono (solo disegno).

Catalogo grafico: rigenerato → docs/catalogo-grafico.html (sezione dell’equipaggiamento, 89 tessere); rigenerato anche docs/catalogo-grafico-alternativo.html.

Checklist: nuova voce “Segni sulle carte chain e level up: da provare sul telefono”; togliere “Equipaggiamento e Moduli nel catalogo”, se c’era.

## Proposta grafica HD-2D, fase 4: HUD e schermate (il gioco non cambia)

Ultima fase. Aspetto **[Claude]**. Come deciso, niente pixel art sui testi: stesso carattere, più leggibile possibile a 360 px.

- **Primitive** (`docs/hd2d/draw-hd2d.js`): `disc` disegna dischi a pixel; `rr` fa angoli a due gradini (tutti i pannelli, le carte, le righe dell’albero e
  dell’equipaggiamento); `txt` aggiunge un’ombra scura di 1 px, il contorno dai 20 px e un alone del colore dai 24 px; `button` è un pannello con il contorno scuro,
  lo smusso chiaro in alto, l’ombra in basso e il bordo colorato di 2 px; `dim` è un velo viola notte; nuova `pxBar` (barra a pixel con le tacche).
- **Fondo**: lo stesso cielo stellato e la piattaforma anche dietro menu, albero, equipaggiamento, griglia dei livelli e guida (prima un gradiente con le stelle).
- **HUD**: barra della frenesia e del boss finale a pixel (cornice dorata, tacche), barra della cupola a pixel con le tacche sullo zoccolo scuro, numeri del danno
  col contorno scuro, mirino a pixel che si stringe e si illumina quando aggancia, scudo dell’Impenetrabile a pixel.
- **Schermate**: titolo del menu dorato col contorno e la luce (velo del menu più leggero: il cielo si vede); nelle carte il pallino del tipo illumina la carta.
- **Cupola**: celle esagonali più discrete (si notavano troppo).
- **Restano come prima**: le icone vettoriali dei pezzi dell’equipaggiamento e dell’albero (con gli angoli a gradini) e la schermata iniziale e il pannello del
  salvataggio, che sono HTML e CSS in `app/index.html`, non disegno del canvas.

**Test**: `npm test` tutti verdi (il gioco non cambia); catalogo alternativo rigenerato; nel browser controllate senza errori menu, battaglia, avviso, mirino,
pausa (due schede), albero (torrette e abilità), equipaggiamento (pezzi e fusione), carte, vittoria, sconfitta, griglia dei livelli, guida, abilità in battaglia.
Prestazioni su telefono **non misurate**: luci, retini e sprite costano più del disegno attuale.

Catalogo grafico: non cambiato; docs/catalogo-grafico-alternativo.html rigenerato (proposta completa).

Checklist: sostituire “Proposta HD-2D: decidere se proseguire” con “Proposta HD-2D completa (docs/catalogo-grafico-alternativo.html): decidere se adottarla
nel gioco (prima: prova di fluidità sul telefono)”.

## Proposta grafica HD-2D, fase 3: effetti e stati (il gioco non cambia)

Fase 3 di 4. Aspetto **[Claude]**.

- **Nuove primitive** in `docs/hd2d/draw-hd2d.js`: `pxLine` e `pxEllipse` (linee e cerchi di quadratini sulla griglia), `glowPath` (alone additivo lungo una spezzata).
- **Effetti rifatti** (stesse firme di `FX`): fulmini (`bolt`: alone, tratto a pixel, lampo agli estremi), Sfera statica, aree (`zone`), colpi dei droni dell’Hive
  (punto, rombo, stella), campo e Esplosione finale della Disruption (fascia a righe che scorrono, bordi tratteggiati in movimento, droni-sprite), bomba, scheggia e
  mina dell’Aeroblast (sprite, miccia e spia che lampeggiano), sfere del Thunderbolt, raggi del Beam (come il Laser), ruota della Firewheel (raggi e bordo a pixel,
  scia di lingue di fuoco a pixel), onda e droni dell’Hive (droni che crescono col livello, ali che sbattono), proiettile della Railgun, fulmine globulare del
  Teslacoil (anche la carica sulla bobina), buco nero del Vortex (materia a pixel che spiraleggia dentro), anelli delle esplosioni.
- **Cupola**: bordo a pixel doppio con un lampo che lo percorre e luci lungo il bordo, celle esagonali appena accennate che si accendono a turno; onda Repulsiva,
  gas Congelante e bordo delle abilità a pixel.
- **Stati**: icone a pixel 7×7 su un tondo scuro (distruzione: una riga per pila); **barra della vita** a pixel con il contorno e la riga chiara.
- Tolta `flame` (sostituita ovunque da `pixelFlame`). `tests/tools/hd2d-shots.js`: tavola `hd2d-effetti.png`.

**Test**: `npm test` tutti verdi (il gioco non cambia); catalogo alternativo rigenerato, tessere ed effetti controllati nel browser senza errori.

Catalogo grafico: non cambiato; docs/catalogo-grafico-alternativo.html rigenerato.

Checklist: nessuna voce nuova (resta la fase 4: HUD, numeri del danno, mirino, schermate).

## Proposta grafica HD-2D, fase 2: Aeroblast a cannone girevole (il gioco non cambia)

Richiesta di Marco: l’Aeroblast più simile a un cannone che ruota secondo la direzione del colpo. Aspetto **[Claude]**.

- Base girevole fissa (`TURRET_GRID.aero`) e canna a parte (`aeroBarrel`): culatta, canna con un anello, freno di bocca nel colore del tipo, bocca scura;
  ridisegnata a pixel in 48 direzioni (non ruotata come immagine), con la luce sempre in alto a sinistra.
- **Direzione**: la logica non la tiene, quindi il disegno chiede a `pickTargets` (solo lettura) lo stesso nemico che il prossimo colpo prende di mira e la canna
  ci gira verso con un po’ di morbidezza (tra 20° e 160° sopra l’orizzonte); senza bersagli resta dov’era. **Rinculo**: quando il tempo di ricarica risale
  la canna arretra di 3 px e dalla bocca esce una vampata con la luce. Lo stato del disegno sta nella torretta in campi `__aim`, `__rec`, `__cd`, `__t`.
- `drawTurret` passa la torretta come quarto argomento di `TURRET_ART` (le altre lo ignorano); nelle tessere del catalogo, senza torretta, la canna oscilla.
- `tests/tools/hd2d-shots.js`: `hd2d-aero-zoom.png` (6 direzioni e il rinculo, ingranditi) e `hd2d-aero-1..3.png` (in battaglia).

**Test**: `npm test` tutti verdi (il gioco non cambia); catalogo alternativo rigenerato senza errori.

Catalogo grafico: non cambiato; docs/catalogo-grafico-alternativo.html rigenerato.

Checklist: nessuna voce nuova.

## Proposta grafica HD-2D, fase 2: torrette e nemici rimasti (il gioco non cambia)

Fase 2 di 4. Aspetto **[Claude]**.

- **Le altre 8 torrette** in `TURRET_GRID` (`docs/hd2d/draw-hd2d.js`), con la sagoma di quelle attuali: Disruption Drone (piattaforma con l’antenna e due droni
  a rombo che ondeggiano), Aeroblast (mortaio che si allarga in alto, lampade sulla base), Thunderbolt (traliccio con le croci e la sfera a pixel che crepita),
  Beam (parabola con l’ago che pulsa), Firewheel (fionda a Y con l’elastico e la palla di fuoco), Hive (alveare a fasce, porta scura, api che girano),
  Railgun (due rotaie con le bobine, carica che sale tra le rotaie), Teslacoil (bobina ad anelli con la sfera e le scintille). Parti animate e luci in `hdTurretExtra`.
- **Nemici**: cristallo-cometa (cristallo a facce con lo spigolo illuminato e coda di scintille), nave aliena e nave madre (scafo a punta generato dal profilo
  attuale, bordo dorato, cabina luminosa, oblò, giunture, motori in alto con le fiamme a pixel; la nave madre con le ali). Nuove primitive `pxDot`, `pixelOrb`.
- `tests/tools/hd2d-shots.js`: nuova tavola `hd2d-sprite-2.png` (11 torrette, cristallo, navi nei 5 tipi).

**Test**: `npm test` tutti verdi (il gioco non cambia); catalogo alternativo rigenerato, tutte le scene senza errori anche nel browser.

Catalogo grafico: non cambiato; docs/catalogo-grafico-alternativo.html rigenerato.

Checklist: nessuna voce nuova (resta “Proposta HD-2D: decidere se proseguire”, ora con le fasi 3-4: effetti e stati, HUD e schermate).

## Proposta grafica HD-2D, fase 1: ritocchi (il gioco non cambia)

Osservazioni di Marco sulla prova di stile.

- **Fondo**: cielo stellato fino alla base della cupola, come guardando l’orizzonte (prima una piana in prospettiva dall’alto dello schermo). Via lattea a retino,
  230 stelle (qualcuna a croce) e 30 che brillano, pianeta ad anelli e una luna piccola; all’orizzonte, dietro la cupola, due piani di creste velate dalla foschia,
  bagliore e un po’ di piana fino alla piattaforma.
- **Niente ombre dei nemici**: precipitano dal cielo, non volano raso terra. Restano le ombre di torrette e guardiano sulla piattaforma.
- **Niente sfocatura in alto** (`tiltShift` tolta): con il cielo la parte lontana è il fondo, già velato; i nemici in arrivo restano nitidi.
- **Guardiano**: griglia rifatta a strati. Il collo stacca la testa dalle spalle; le due braccia hanno lo stesso spessore; l’avambraccio sinistro passa dietro la testa e
  ricompare con la mano sull’attacco del cannone (prima un braccio lungo e sottile sopra la testa).

**Test**: `npm test` tutti verdi (il gioco non cambia); catalogo alternativo rigenerato senza errori; schermate `hd2d-*` controllate.

Catalogo grafico: non cambiato; docs/catalogo-grafico-alternativo.html rigenerato.

Checklist: nessuna voce nuova.

## Proposta grafica HD-2D, fase 1 (il gioco non cambia)

Richiesta di Marco: un reskin in stile HD-2D come proposta, in un catalogo a parte. Fase 1 di 4: prova di stile. Tutto l’aspetto è **[Claude]**.

- **`docs/hd2d/draw-hd2d.js`**: copia di `app/draw.js` con le stesse funzioni e firme, non caricata dal gioco. Motore: sprite a griglia di caratteri o generati
  da funzione (`gridSprite`, `procSprite`, contorno automatico), ingranditi a 2 px logici senza smussare (`blit`); rampe di colore con ombre fredde e luci calde
  (`ramp`); luci additive raccolte durante il disegno del mondo e stese alla fine (`light`, `drawLights`); ombre a terra (`groundShadow`); profondità di campo
  sulla fascia lontana in alto (`tiltShift`, sfocatura per riduzione, senza `ctx.filter`); velo di colore e vignettatura (`grade`); pulviscolo e bokeh (`motes`).
- **Rifatti in fase 1**: fondo a plastico (cielo con pianeta ad anelli, creste all’orizzonte, piana in prospettiva con crateri e massi, retino ordinato 4×4),
  piattaforma di lastre; Sky Guard, Laser e Gravity Vortex Gun; guardiano (normale, frenesia, clone); frammento roccioso, asteroide e meteora (16 pose di rotazione
  con la luce fissa, bitorzoli, crateri, coda di fiamme a pixel), navicella (luci a turno); missili (sprite, scia di fumo), Area infuocata (ovale in prospettiva,
  lingue di fuoco a pixel, braci, scintille), varchi del wormhole (scintille e luce), raggi laser (alone, nucleo bianco, scintille), esplosioni, colpi del guardiano.
  Il resto (altre torrette e nemici, stati, HUD, schermate) è ancora il disegno attuale.
- **Catalogo**: `npm run catalog-hd2d` → `docs/catalogo-grafico-alternativo.html` (stesse scene e tessere, disegno HD-2D). `tests/tools/catalog.js` accetta `--hd2d`.
- **Schermate di prova**: `node tests/tools/hd2d-shots.js` → `tests/screenshots/hd2d-battaglia*.png`, `hd2d-sprite.png` (con `--orig` le stesse col disegno attuale).

**Test**: `npm test` tutti verdi (il gioco non cambia). Catalogo alternativo generato con tutte le scene senza errori (jsdom) e aperto in un browser vero.

**Misure con i bot**: non servono.

Catalogo grafico: rigenerato → docs/catalogo-grafico.html (solo il generatore, nessun disegno cambiato); nuovo docs/catalogo-grafico-alternativo.html.

Checklist: nuova voce “Proposta HD-2D: decidere se proseguire con le fasi 2-4 (torrette e nemici rimasti, effetti e stati, HUD e schermate)”.

## 1.12.4 — colori dei colpi del guardiano, varchi ovali, Area infuocata sotto i nemici e con limite, catalogo completo

Richieste di Marco. Aspetto dei varchi **[Claude]** (DESIGN.md § 10).

- **Guardiano**: con Proiettili incendiari (Sky Guard) e/o Proiettili gravitazionali (Vortex) i colpi si alternano nei colori dei tipi attivi: fisico, fuoco, force
  (`playerBullet` sceglie `tint` con un contatore in `p.st.tintN`; `FX.guardBullet` ha il parametro `tint`). Clone speculare bianco, Colpo caricato giallo. Solo disegno.
- **Wormhole** (`FX.portals`): varchi ovali (`PORTAL_FLAT` = 0,42), fondo scuro sfumato verso la parete lontana, tre anelli che ruotano e scendono nell’ingresso
  (salgono nell’uscita), bordo vicino più spesso. L’ingresso cattura chi tocca l’ovale (prima il cerchio): stessa larghezza, meno profondo. Disegnati sotto i nemici.
- **Area infuocata della Sky Guard**: disegnata sotto i nemici (nuovo campo `under` delle entità: `draw()` disegna prima le entità `under`, poi i nemici, poi il resto);
  al massimo `skyCount(s)` aree a schermo per torretta, cioè i missili della salva (2 + “+1 missile” + 2 con Salva potenziata). Oltre, l’impatto non accende l’area.
  Effetto sul bilanciamento non misurato (riguarda solo chi prende Area infuocata).
- **Catalogo grafico**: aggiunte le tessere di `FX.fireField` (Area infuocata) e `FX.hiveShot` (colpi dei droni dell’Hive, tre livelli) nella sezione 4 “Proiettili ed
  effetti”, che le segnava come mancanti; la tessera di `FX.guardBullet` mostra anche i colpi arancione e viola; descrizione della scena delle combo aggiornata.
- DESIGN.md § 10: tre voci nuove. `APP_VERSION` e `VERSION` di `sw.js`: 1.12.4.

**Test**: nuovo `tests/aspetto.js` (limite delle aree con 2, 4 e 5 missili; aree che si riaccendono dopo lo spegnimento; `under` e ordine di disegno; presa ovale
dell’ingresso: dentro al lato, fuori sopra dove il cerchio prendeva; colori dei colpi senza combo, con una, con entrambe; clone bianco). `npm test`: tutti verdi.
Screenshot rigenerati e controllati; scena di prova con fiamme, varchi e salve colorate controllata a parte.

**Misure con i bot**: non fatte (il limite delle aree riduce un po’ la bruciatura della Sky Guard con Area infuocata).

Catalogo grafico: rigenerato → docs/catalogo-grafico.html (tessere nuove `FX.fireField`, `FX.hiveShot`; `FX.guardBullet` e `FX.portals` aggiornate).

Checklist: nuove voci “Colori dei colpi del guardiano con le combo: da provare sul telefono”, “Varchi ovali del wormhole: da provare sul telefono”,
“Area infuocata con limite = missili per salva: misurare con i bot se pesa sul bilanciamento?”.

## 1.12.3 — griglia dei livelli, guida, potenziamenti presi dalla scelta delle carte

Punti 7, 8 e 9 delle richieste di Marco. Impaginazione e testi della guida **[Claude]** (DESIGN.md § 6).

- **Griglia dei livelli** (`levelsScreen`, stato `levels`): si apre toccando “Livello N” nel menu (ora con ▦). Standard/Epica in alto (Epica spenta prima del 50), pagine
  da 50, filtro “Solo i livelli con Sigilli da prendere”, 50 caselle 5×10 con due rombi per i Sigilli (`sealStatus`, `sealsOpen`; pieno = preso), muri in giallo,
  livelli non giocabili spenti. Un tocco sceglie, il secondo sullo stesso livello o “Gioca” parte; Invio gioca, Esc torna al menu.
- **Guida** (`guideScreen`, stato `guide`, menu → “Guida” accanto a “Salvataggio”): scheda “Stati dei nemici” (6 icone con effetti e valori del codice, 4 effetti senza
  icona) e scheda “Carte” (guardiano e 11 torrette: statistiche di base, tutte le carte con categoria, blocco nell’albero, descrizione ed effetto per pila delle carte
  standard con il nodo dell’albero). L’elenco scorre trascinando il dito (o con la rotella).
- **Potenziamenti presi** (`upBuildScreen`): pulsante sotto le carte e sotto “Continua” della ricompensa del mini-boss, tasto B: la vista della pausa, poi “Torna alle carte”
  (anche Esc o Invio). Mentre è aperta i tasti 1-4 non scelgono. Questi pulsanti e “Rinnova le carte” si attivano al rilascio come le carte: con un tocco subito dopo la
  comparsa della schermata (trovato dal test delle carte) si poteva aprire la vista per sbaglio.
- Menu: “Salvataggio” più corto, nuovo “Guida”; il livello è un pulsante che apre la griglia.
- DESIGN.md § 6: griglia, guida, potenziamenti presi. `APP_VERSION` e `VERSION` di `sw.js`: 1.12.3.

**Test**: nuovo `tests/schermate.js` (apertura dal menu, stato dei Sigilli per livello e modalità, filtro, livello oltre il massimo, partenza in Epica con il secondo tocco,
Epica bloccata prima del 50, guida: stati, carte bloccate e sbloccate, effetto per pila col nodo, scorrimento fino alla fine e col dito, tutte le entità senza errori;
vista dei potenziamenti con il tasto B, tasti bloccati, Esc). Aggiornati `savetest.js` (testo “Livello 24 ▦”). `npm test`: tutti verdi.
Screenshot nuovi 44-50 controllati; corretti la legenda della griglia (usciva dal bordo), la riga del blocco nella guida (troppo lunga) e la scritta dello scorrimento (sopra le icone).

**Misure con i bot**: non servono (solo schermate).

Catalogo grafico: rigenerato → docs/catalogo-grafico.html (nuove scene: griglia dei livelli, guida stati, guida carte, potenziamenti presi; 59 scene).

Checklist: nuove voci “Griglia dei livelli, guida e potenziamenti presi: da provare sul telefono”, “Guida: descrizioni estese delle carte da scrivere?”; togliere le voci dei punti 7, 8 e 9.

## 1.12.2 — fiamme della Sky Guard e della Firewheel, colpi e evoluzioni dell’Hive

Punti 10 e 11 delle richieste di Marco (il 6, mine doppie, è nella 1.12.1).

- **Area infuocata della Sky Guard** (`FX.fireField`, la zona usa l’aspetto “fireField”): disco di brace sfumato, lingue di fuoco sul bordo e all’interno che tremolano, scintille che salgono.
  Nuova primitiva `flame` in draw.js (lingua arancione con cuore giallo).
- **Scia della Firewheel**: ogni tratto è un bagliore sfumato con tre lingue di fuoco che si abbassano e si spengono con la scia (prima dischi trasparenti). Le fiamme si
  muovono con il tempo del gioco, senza tiri casuali.
- **Hive**: dopo un’evoluzione il drone spara ancora almeno 2 colpi (lv2) o 3 (lv3) (`cap` alzato se serve); **colpi visibili** (`hiveShotFx`, `FX.hiveShot`): ogni proiettile vola
  in 0,14 s verso il nemico, a ventaglio se sono più di uno; lv1 punto viola, lv2 rombo lilla, lv3 stella rosa con alone. Il danno resta immediato come prima.
- DESIGN.md § 10: grafica del fuoco, evoluzioni e colpi dell’Hive. `APP_VERSION` e `VERSION` di `sw.js`: 1.12.2.

**Test**: `seals.js`, nuovo controllo dell’Hive (drone con 3 colpi: lv2 con 5 colpi massimi, lv3 con 9; colpi in volo presenti). `npm test`: tutti verdi.
Screenshot: nuovo 43 (area in fiamme, scia della Firewheel, colpi dell’Hive dei tre livelli), controllato e ritoccato (fiamme più grandi, scia con bagliore); 02 e 34 controllati.

**Misure con i bot**: non rifatte. L’unica regola cambiata è il minimo di colpi dopo l’evoluzione dell’Hive (piccolo aumento per l’Hive con le Evoluzioni).

Catalogo grafico: rigenerato → docs/catalogo-grafico.html (nuove tessere degli effetti `fireField` e `hiveShot`; 77 tessere).

Checklist: nuove voci “Fiamme della Sky Guard e della Firewheel: da vedere sul telefono (anche la fluidità)”, “Colpi dell’Hive per livello: da vedere”; togliere le voci dei punti 10 e 11.

## 1.12.1 — taratura con i Sigilli maggiori e un po’ di Epica, mine doppie

- **Bot con un po’ di Epica** (`tests/tools/curva.js`, `equip-atteso.js`): dal 50 il giocatore atteso completa 1 livello di Epica ogni 2 di Standard (`EPICA`, default 0,5):
  Sigilli dell’Epica, Sigilli maggiori dei boss e drop di Epica. La spesa dei bot conta un maggiore come 5 Sigilli, salta lo Sblocco permanente, dà le abilità d’ingresso dal 40.
- **Curva dal 31**: pendenza da 0,8 a **1,2**, scalino da 2 a **3**; `FINAL_BOSS_K` rifatto (40 ×1,2, 60 ×0,6, 80 ×1,3, 90 ×0,6, 100 ×0,75, 120 ×1,15, 130 ×1,15, 170 ×1,5, 190 ×0,75).
- **Mine** (decisione di Marco): disegno doppio, contatto a 16 px (prima 8), esplosione sempre di 34 px, **al massimo 25 a schermo** (`MINE_MAX`); la combo dell’Aeroblast
  accetta che la mina non nasca.
- DESIGN.md: § 5 formule, § 10 mine, § 11 difficoltà, § 16 “Taratura 1.12.1”. `APP_VERSION` e `VERSION` di `sw.js`: 1.12.1.

**Misure con i bot** (equipaggiamento atteso e un po’ di Epica, 200 partite per muro): con la curva della 1.11.0 media 81%; pendenza 1,0 → 68%; 1,2 → 56,8%; **finale 59,3%**
(40 69,5 · 50 45,0 · 60 45,5 · 70 73,0 · 80 57,0 · 90 41,5 · 100 48,5 · 110 53,5 · 120 74,5 · 130 72,5 · 140 45,0 · 150 55,0 · 160 61,5 · 170 73,0 · 180 71,0 · 190 50,5 · 200 71,0).
I muri più lontani dalla fascia (90 41,5, 120 74,5) sono a meno di 10 punti, vicino al rumore (±7).

**Test**: `seals.js`, nuovo controllo delle mine (30 richieste → 25 a schermo; scoppia a 15 px dal bordo del nemico, non a 17). `npm test`: tutti verdi. Screenshot 31 (mine) controllato.

Catalogo grafico: rigenerato → docs/catalogo-grafico.html (mine doppie).

Checklist: aggiornare “Taratura dal 31” (rifatta con maggiori ed Epica, ipotesi 1 livello di Epica ogni 2 di Standard); nuova voce “Mine doppie e limite di 25: da provare”.

## 1.12.0 — Sigilli maggiori, costi nuovi dell’albero, Ventaglio e Frenesia potenziati, Moduli rari

Richieste di Marco, punti 1-5 (i punti 6-11 sono nel prossimo lavoro).

- **Sigilli maggiori** (✦, `progress.majors`): solo in Epica, dal boss finale (1 a ogni vittoria su di lui) e dai mini-boss (10% ciascuno, al massimo 1 per livello);
  si prendono subito alla sconfitta del boss (`majorDrop`), scritta a schermo e riga nella vittoria. Fonte e limite **[deciso]**, numeri **[Claude] [provvisorio]**.
- **Costi dell’albero** (`SEAL_COST`, `mcosts` per livello, `nodeMCost`): carte chain e level up = livello della carta (1, 2, 3); Sblocco permanente 3 maggiori; nodi da 20 livelli
  e sezione per tipo 1 maggiore ai livelli 1, 6, 11, 16; carte standard da 5 livelli delle torrette 1 maggiore allo sblocco; guardiano +1 proiettile, Ventaglio e Frenesia
  potenziati 1 maggiore a ogni livello; barriera senza maggiori. Righe dell’albero con il costo “1 ✦ + 1 ◆”; intestazione e pulsante del menu con i maggiori.
- **Ventaglio potenziato** (prima “ampliato”, stesso nodo `player:fan`): i proiettili secondari restano 4, il loro danno passa dal 30% a 47%, 63%, **80%** del principale.
- **Frenesia potenziata** (nuovo nodo `player:frenzy`, 3 livelli): danno in frenesia ×1,9, ×2,45, **×3** (base ×1,35), carica +2 s per livello.
- **Abilità d’ingresso** della barriera: 1 Sigillo (prima gratis); in partita valgono solo le abilità comprate. Un salvataggio precedente (senza `majors`) con il 40 completato le riceve.
- **Moduli rari** (peso 1: 4, 10, 14, 20, 21, 22, 28, 29, 30): insieme escono con 5 / 11 / 18 / 24 / 30% per rarità (`RARE_CHANCE`), nei drop e nelle fusioni.
- **Salvataggio**: versione 4 con `majors`; pannello con i Sigilli maggiori.
- Righe dell’albero: il testo sotto il nome rimpicciolisce se tocca il costo.
- DESIGN.md: § 16 valuta, Sigilli maggiori, costi, guardiano; § 15 effetti rari; § 7 formato 4. `APP_VERSION` e `VERSION` di `sw.js`: 1.12.0.

**Test**: `seals.js` (costi nuovi, maggiori per livello, nodo senza maggiori, Ventaglio al 3 con 4 secondari all’80%, Frenesia al 3, maggiori in Epica e non in Standard,
abilità d’ingresso per salvataggi vecchi e nuovi, Sblocco permanente con 3 maggiori), `abilities.js` (le abilità equipaggiate dai test ora vanno comprate), `equip.js`
(quota degli effetti rari per rarità, salvataggio versione 4). `npm test`: tutti verdi. Screenshot dell’albero rifatti e controllati.

**Misure con i bot** (equipaggiamento atteso, 100 partite per muro): 40 81,5% · 70 81,0% · 100 38,0% · 150 53,0% · 200 74,0% (1.11.0: 67,5 · 59,0 · 65,5 · 57,0 · 46,0).
I bot giocano in Standard e non hanno maggiori: non comprano più carte standard né sezione per tipo, e spendono i Sigilli nella barriera. **La taratura dal 31 va rifatta**.

Catalogo grafico: rigenerato → docs/catalogo-grafico.html (albero con i costi nuovi).

Checklist: nuove voci “Sigilli maggiori: quantità dai boss di Epica da confermare”, “Taratura dal 31 da rifare dopo i Sigilli maggiori”, “Ventaglio e Frenesia potenziati da provare”;
aggiornare “Costi dell’albero” e “Abilità d’ingresso”.

## Documentazione — equipaggiamento necessario dal 40 (nessuna versione nuova)

- Marco conferma la taratura 1.11.0: che senza equipaggiamento i muri dal 40 siano quasi impossibili (40 17%, 100 3%, 200 0%) **va bene così**. DESIGN.md § 11 aggiornato.

**Test**: nessuno (solo documenti). Catalogo grafico: non cambiato.

Checklist: togliere “Senza equipaggiamento dal 40 i muri sono quasi impossibili: va bene?” (deciso: sì).

## 1.11.0 — taratura con l’equipaggiamento atteso, icone di pezzi e Moduli

Punti “Cosa manca” della 1.10.0. Obiettivo di Marco: muri dal 40 tra il 50 e il 70% di vittorie dei bot con l’equipaggiamento atteso (fascia accettata durante il lavoro,
per non alzare troppo la difficoltà; prima l’indicazione era “circa 50%”).

- **Equipaggiamento atteso dei bot**: nuovo `tests/tools/equip-atteso.js` (drop veri di `rollDrops` per 1,5 vittorie per livello dal 30, poi una strategia da giocatore:
  fonde i pezzi, equipaggia il più raro, installa i Moduli più utili, fonde gli altri). `curva.js` lo usa con `EQUIP=1.5`. Al 40 guardiano +29%, al 100 +97%, al 200 +152%.
- **Misura con la curva della 1.8.0**: muri dal 40 al 200 al **93%** di media (da 81% a 100%): l’equipaggiamento rendeva i muri quasi certi.
- **Curva nuova** (`app/index.html`): `EFF_SLOPE_31` da 0,2 a **0,8**, nuovo scalino `EFF_JUMP_31` = **2** dal livello 31 (i muri vicini al 30 si muovevano poco con la sola
  pendenza), fattori della vita del boss finale per muro `FINAL_BOSS_K` (80 ×1,3, 100 ×1,3, 140 ×0,45, 150 ×1,1, 170 ×1,9) per i muri che uscivano dalla fascia.
  Valori **[Claude] [provvisorio]**. Dal 30 al 200: vita dei nemici ×2,97 (prima ×1,49), danno ×2,13, numero ×1,62, velocità ×1,26.
- **Risultato** (200 partite per muro, 400 al 140 e al 150): 40 67,5 · 50 64,0 · 60 71,0 · 70 59,0 · 80 63,0 · 90 55,0 · 100 65,5 · 110 59,5 · 120 47,0 · 130 62,5 · 140 53,3 ·
  150 57,0 · 160 55,5 · 170 60,0 · 180 63,0 · 190 67,0 · 200 46,0: **media 59,8%**; 120 e 200 poco sotto il 50%, 60 poco sopra il 70%, dentro il rumore (±7).
  Livelli intermedi: 35 77,5 · 45 93,5 · 75 98,0 · 125 84,5 · 175 99,5. **Senza equipaggiamento**: 40 17% · 100 3% · 200 0% (prima circa 31%): dal 40 l’equipaggiamento
  è necessario. Prove intermedie in DESIGN.md § 16 (“Taratura 1.11.0”).
- **Icone** (draw.js): `PIECE_ART` con le sagome dei 6 pezzi (cannone, guanto, elmetto, corazza, stivale, nucleo esagonale) e `modIcon` (chip con piedini, nucleo del colore
  della rarità e iniziale del pezzo); nei 6 riquadri della schermata, nel pezzo scelto, negli slot, nell’inventario e nei tasselli della vittoria.
- DESIGN.md: § 5 formule, § 11 difficoltà dal 31, § 15 obiettivo 50-70%, icone, taratura; § 16 “Taratura 1.11.0” con tutte le prove; § 13.
- `APP_VERSION` e `VERSION` di `sw.js`: 1.11.0.

**Test**: `npm test`, tutti verdi (nessun test dipendeva dalla curva oltre il 30). Screenshot rifatti e controllati (37-42: icone nei riquadri, nelle righe e nella vittoria).
Durante il lavoro: un errore di sintassi nelle note del catalogo (apice inverso in un testo) bloccava `npm run catalog`; corretto.

Catalogo grafico: rigenerato → docs/catalogo-grafico.html (icone nelle scene dell’equipaggiamento e della vittoria; note “futuro” aggiornate).

Checklist: nuove voci “Curva dal 31 ritarata con l’equipaggiamento: provare i muri 40-60 giocando”, “Senza equipaggiamento dal 40 i muri sono quasi impossibili: va bene?”,
“Fattori del boss per muro (80, 100, 140, 150, 170): provvisori”, “Icone di pezzi e Moduli da vedere sul telefono”; togliere “Equipaggiamento: misura con i bot e muri al 50%”, “Icone di pezzi e Moduli”.

## 1.10.1 — carte dopo ogni ondata, Modulo 12 con le carte dei mini-boss, testi delle carte

Risposte di Marco dopo la 1.10.0.

- **Cambio di pezzo**: confermato che i Moduli passano al nuovo finché ci sono slot (DESIGN.md § 15 ora **[deciso]**).
- **Modulo 12**: “carte scelte” conta tutte le carte della partita, anche le 3 dei mini-boss (`giveBossRewards` incrementa `runPicks`).
- **Nessun limite di torri al livello 3**: tolti `CAMPAIGN.maxMaxed`/`maxMaxedFrom` (regola già spenta) e il testo “al massimo” sotto le carte; tolte le **scelte saltate**
  per le torrette equipaggiate (`skipLeft`, `skipNote` e la scritta “Scelta già usata da una torretta equipaggiata”): si sceglie una carta dopo ogni ondata.
  `maxedCount` resta solo come statistica per `tests/camp.js`.
- **Testi delle carte fuori dal bordo**: accorciate le descrizioni di Disruption Drone (“Due droni e un campo di forza largo”), Aeroblast (“Esplosioni con knockback,
  corto raggio”), Thunderbolt (“Sfere sulla barriera, fulmini ovunque”), Beam (“Raggio continuo su un bersaglio”), Firewheel (“Drone lanciafiamme che rimbalza”).
  Rete di sicurezza in draw.js (`fitTxt`): titolo, descrizione e nota delle carte rimpiccioliscono se non stanno in 260 px. La carta del Disruption Drone che usciva era la
  sua carta “Nuova torretta” (descrizione di 323 px).
- DESIGN.md: § 4 budget e nessun limite al livello 3, § 15 letture confermate, § 16 Sblocco permanente e torrette equipaggiate, § 8 rigenerato (`npm run design-lists`).
- `APP_VERSION` e `VERSION` di `sw.js`: 1.10.1.

**Test**: nuovo `tests/testi.js` (misura con @napi-rs/canvas e il font del gioco titoli, descrizioni e note delle 202 carte e i 150 testi dei Moduli; prima della correzione
trovava le 5 descrizioni sopra). `seals.js`: carta dopo ogni ondata con 2 torrette equipaggiate e 19 carte in una partita (prima 17 + 2). `equip.js`: Modulo 12 con le carte del
mini-boss. `npm test`: tutti verdi. Screenshot rifatti; controllato 42 (4 carte con le descrizioni nuove).

**Misure con i bot**: non servono. I bot (`calib2.js`, `curva.js`) non equipaggiano torrette, quindi giocano come prima. Per un giocatore che le equipaggia,
dal 31 le torrette equipaggiate ora si aggiungono alle 19 (28) carte: è più forte di quanto misurano i bot.

Catalogo grafico: rigenerato → docs/catalogo-grafico.html (carte con i testi nuovi).

Checklist: togliere “Descrizione della Beam fuori dalla carta”; aggiornare “Torrette equipaggiate” (non consumano più scelte); confermate le due letture del § 15.

## 1.10.0 — equipaggiamento e Moduli

Prima versione giocabile dell’equipaggiamento (DESIGN.md § 15), con le regole e i valori decisi con Marco; dove serviva una scelta in più l’ha fatta Claude
(segnata **[Claude] [da rivedere]** nel nuovo punto “Costruito (1.10.0)” del § 15).

- **Dati** (`app/index.html`, dopo l’albero): `RARITY` (5 rarità e colori), `PIECES` (statistica base, pool di 9 effetti con l’esclusivo in testa), `MOD` (30 effetti: peso,
  valori per rarità, testo), `DROP` e `DROP_RARITY`.
- **Inventario** in `progress.gear` (pezzi e Moduli contati per tipo e rarità, pezzi equipaggiati con i loro Moduli); funzioni `equipPiece`, `unequipPiece`, `installMod`,
  `removeMod`, `fusePieces`, `fuseMods`, `discard`, `rollDrops`, `gearStats`. Cambiando pezzo i Moduli passano al nuovo finché ci sono slot.
- **Drop**: a ogni vittoria dal livello 30 (e in ogni livello di Epica): 2 pezzi e 2-3 Moduli, +1 Modulo in Epica, rarità dalla tabella “avara”. Tasselli colorati nella vittoria.
- **Effetti in battaglia**: statistica base (danno del guardiano, vita della barriera, danno delle torrette) e tutti i 30 Moduli: un solo bonus di danno del guardiano
  (`gearMul`, più `gearHit` per i bonus sul nemico colpito), critico, +1 proiettile, +1 perforazione, cadenza, debuff allungati, esplosioni, % della vita massima, primi danni
  ignorati e contrattacco, immunità sotto il 20%, cura per boss, riduzione del danno e del cooldown (con i tetti dell’albero), danni delle torrette (tipo e tutte), rinnovo
  delle carte (pulsante e tasto R), 4 carte (tasto 4), guardiano e torrette dal livello 2 (`fromLv2`: il primo level up li lascia al 2).
  Senza equipaggiamento il gioco non consuma tiri casuali in più: le partite dei bot con gli stessi semi restano uguali.
- **Schermata “Equipaggiamento”** (draw.js, `gearScreen`): menu → pulsante accanto all’albero (dal 30). I 6 pezzi, il pezzo scelto con statistica e slot, inventario di quel pezzo
  (schede Pezzi e Moduli per rarità) con le modalità Equipaggia/Installa, Fondi, Scarta. Ancestrale iridescente (`rarColor`). Esc torna al menu.
- **Carte**: con 4 carte le carte sono più basse (92 px invece di 110).
- **Avviso del 30**: non più “in arrivo”, ora “cadono a ogni vittoria. Equipaggiali dal menu.”
- **Salvataggio**: versione 3 con `gear`; le versioni 1 e 2 si importano con l’inventario vuoto; dati non validi scartati (`cleanGear`). Il pannello conta anche gli oggetti.
- **Menu**: “Albero” ed “Equipaggiamento” affiancati (prima un solo pulsante largo).
- DESIGN.md: § 15 “Costruito (1.10.0)” con tutte le letture; § 4, § 7 (formato 3), § 11, § 13.
- `APP_VERSION` e `VERSION` di `sw.js`: 1.10.0 (elenco dei file invariato).

**Test**: nuovo `tests/equip.js` (41 controlli: dati e pool, pulizia e salvataggio v3, migrazione dalla v2, drop per livello e modalità, distribuzione delle rarità e degli effetti,
equipaggiare/installare/fondere/scartare, statistiche e tetti, colpo del guardiano con arma, Modulo 18 e critico, Moduli 4, 7, 10, 14, 16, 21, 22, 29, schermata e vittoria).
Aggiornati `seals.js` (versione 3 del salvataggio) e `carte.js` (posizione del pulsante dell’albero). `npm test`: tutti verdi.
Durante il lavoro: corretto un errore che al caricamento perdeva in silenzio l’equipaggiamento salvato (funzioni usate prima della loro definizione), trovato dal test.

Screenshot: nuovi 37 (menu), 38 (pezzi), 39 (fusione dei Moduli), 40 (pezzo vuoto), 41 (vittoria con gli oggetti), 42 (4 carte e rinnovo); controllati anche 01 e 25.
Nota: nella carta della Beam la descrizione esce dal bordo (anche con 3 carte, già prima di questa versione).

**Misure con i bot**: non fatte. Senza equipaggiamento il gioco è identico per i bot (stessi tiri casuali): verificato con `calib2.js` ai livelli 12 e 35 (6 partite per bot), risultati e ondate medie uguali alla 1.9.4. I muri restano quelli della 1.9.4. Manca la misura con
l’equipaggiamento atteso, e quindi la taratura verso il 50% dei muri dal 40.

Catalogo grafico: rigenerato → docs/catalogo-grafico.html (nuove scene: menu con l’equipaggiamento, pezzi, fusione dei Moduli, vittoria con gli oggetti, 4 carte e rinnovo;
note “futuro” di equipaggiamento e Moduli aggiornate; 55 scene).

Checklist: nuove voci “Equipaggiamento: provare schermata, fusione e drop sul telefono”, “Equipaggiamento: letture di Claude degli effetti (§ 15, Costruito)”,
“Equipaggiamento: misura con i bot e muri al 50%”, “Icone di pezzi e Moduli”, “Descrizione della Beam fuori dalla carta”; togliere “Equipaggiamento da costruire”.

## 1.9.4 — un level up lv1 bloccato per torretta nell’albero dei Sigilli

Correzione chiesta da Marco: ogni torretta deve avere, come il guardiano, anche un level up lv1 bloccato e sbloccabile con i Sigilli (prima ne aveva bloccato solo uno lv2).
Elenco proposto da Claude e accettato da Marco: si blocca la carta che aggiunge una meccanica o dà il salto maggiore, mai un lv1 da cui dipende un level up successivo.

- `TREE_LOCKS`: nuovi blocchi lv1 — Sky Guard Area infuocata · Laser Raggio persistente · Disruption Drone Esplosione finale · Aeroblast Esplosioni ampie ·
  Thunderbolt Fulmini larghi (Sfera sul campo serve a Sfere pungenti) · Beam Vulnerabilità · Firewheel Drone Fiamme roventi · Hive Colpi di forza (Evoluzione I serve
  a Evoluzione II) · Railgun Impatto · Teslacoil Esplosione a catena · Gravity Vortex Gun Buco nero iperdenso. Restano liberi un level up per livello (1-1-1), come per il guardiano.
- Albero: 10 nodi per torretta (nuovo nodo “Level up lv1”, 1 Sigillo, prima del level up lv2); lo Sblocco permanente richiede anche il nodo nuovo
  (chi l’aveva già comprato lo tiene). Torretta completa 10 Sigilli, sblocchi 117, albero intero 1213.
- Schermata dell’albero (draw.js): con 10 nodi l’ultima riga usciva dallo schermo; il passo tra le righe si stringe quanto serve (da 45 a circa 43 px).
- DESIGN.md § 16: nodi per torretta (10), tabella delle carte bloccate con la colonna “Level up lv1”, costi; § 5 misura.
- Test: `rev2.js` (struttura dei blocchi: level up lv1 e lv2 bloccati per tutti, liberi 1-1-1), `seals.js` (ordine dei nodi, Sblocco permanente al 7° posto,
  Sigilli rimasti 40, 10 nodi della Sky Guard), `run.js` (6 carte bloccate). Screenshot dell’albero: aggiunto il nodo nuovo della Sky Guard.
- `APP_VERSION` e `VERSION` di `sw.js`: 1.9.4.

**Misure con i bot** (pool libero, stessi semi della 1.9.3, 800 partite per muro; 20 e 30 misurati con il codice della 1.10.1, che per i bot gioca uguale):
**10 35,8%** · **20 33,0%** · **30 34,9%** (1.9.3: 35,8% · 27,5% · 32,9%). La carta lv1 in meno non abbassa i muri: restano intorno al 30%. Nessun numero della difficoltà cambiato.

**Test**: `npm test`, tutti verdi. Screenshot rifatti e controllati (21, 22 albero delle torrette con 10 nodi; 23, 24, 26, 27 invariati).

Catalogo grafico: rigenerato → docs/catalogo-grafico.html (disegni non cambiati: cambiano versione e hash).

Checklist: nuova voce “Level up lv1 bloccati delle torrette (§ 16): da provare giocando”; aggiornare la voce sui nodi dell’albero (10 per torretta).

## Documentazione — regole dell’equipaggiamento (nessuna versione nuova)

Solo DESIGN.md, nessun cambiamento al gioco.

- **Controllo dei level up lv1** (richiesta di Marco): ogni torretta e il guardiano hanno già 2 level up lv1 nel codice (`tests/rev2.js`).
  La seconda si vede poco per tre motivi: un level up fa salire la torretta, quindi le due lv1 sono in alternativa; fino al livello 10 il tetto è lv1,
  quindi la seconda non può più uscire (dopo il 20 vale come level up lv2 → lv3); le 3 carte si estraggono a caso da tutto il mucchio.
  Il *Colpo pesante* del guardiano è bloccato dall’albero dei Sigilli (§ 16). Nessuna modifica.
- **§ 15 Equipaggiamento**, risposte di Marco: statistica base divisa per ruolo (arma, guanti, testa → danno del guardiano; armatura, stivali → vita della barriera;
  nucleo → danno delle torrette); drop a ogni vittoria dal 30, anche rigiocando; inventario senza limiti, scarto a mano; Moduli rimovibili gratis.
  Statistica base per rarità (proposta di Claude) accettata come punto di partenza.
- **Valori dell’equipaggiamento**, risposte di Marco: 2 pezzi e 2-3 Moduli per vittoria (Epica +1 Modulo); tabella delle rarità “avara” per difficoltà
  (valori di Claude, l’ancestrale compare dal D 100); valori X dei Moduli confermati come partenza, da tarare con i bot; obiettivo: con l’equipaggiamento atteso
  i muri dal 40 passano dal 30% al 50% circa; un colore per rarità, pieno, ancestrale iridescente (colori di Claude: grigio, verde, blu, rosso).
- § 4, § 11: aggiornati i rimandi.

**Test**: `npm test` (solo documenti).

Catalogo grafico: non cambiato.

Checklist: nuove voci “Equipaggiamento: tabella delle rarità e colori da confermare”, “Equipaggiamento: muri al 50% con l’equip atteso, da misurare”; togliere eventuali voci su statistica base, drop, inventario e rimozione dei Moduli.

## 1.9.3 — disegno del guardiano e sua etichetta

Richiesta di Marco: il guardiano come soldato futuristico con elmetto integrale e tuta simil-spaziale, braccia alzate, il sinistro leggermente piegato che afferra il destro,
il destro teso che finisce con un cannone cibernetico da cui partono i colpi; livello e carte sotto di lui come per le torrette (Marco indeciso se farli seguire il guardiano o lasciarli al centro).

- **Disegno** (`guardianShape` in draw.js): soldato visto di spalle (guarda i nemici, quindi il destro è a destra dello schermo), elmetto con antenna e visore luminoso ai lati, tuta con zaino,
  cintura e luce; braccia con contorno scuro; cannone con attacco, canna, linea di energia e bocca luminosa. Frenesia: tuta e luci arancioni. Il Clone speculare usa lo stesso disegno
  specchiato (`guardianShape(x, true)`), trasparente come prima. Statico: il cannone punta sempre in alto (parti mobili ancora da decidere, § 11).
- **Bocca del cannone** (`GUN` = { dx: 7, dy: −56 } in index.html): i colpi del guardiano (anche Ventaglio e Colpo caricato) partono da lì, 26 px più in alto e 7 px a destra di prima;
  quelli del clone dalla bocca specchiata.
- **Etichetta** “L2 1/3” (“★” al massimo) sotto i piedi: **segue il guardiano**, resta dentro lo schermo, in bianco e una riga più in alto delle etichette delle torrette,
  così non si sovrappongono quando passa sopra uno slot. Scelta di Claude: fissa al centro sarebbe stata allineata con le torrette ma staccata dal guardiano, che si sposta
  per tutta la larghezza. Si cambia facilmente se Marco preferisce il centro.
- DESIGN.md: § 10 nuovo punto “Guardiano (disegno, revisione 4)”, § 11 stato del punto sulla grafica, § 5 misura.
- `APP_VERSION` e `VERSION` di `sw.js`: 1.9.3.

**Misure con i bot** (stessi semi della 1.9.0, 800 partite per muro): 10 35,8% · 20 27,5% · 30 32,9% (1.9.0: 32,6% · 29,9% · 29,0%). Scarti di 2-4 punti, al limite del rumore;
comprendono anche il clone della 1.9.2, che i bot prendono di rado. Nessun numero della difficoltà cambiato.

**Test**: nessun test nuovo (solo disegno e punto di partenza dei colpi); i controlli di `tiro.js` sul clone specchiato valgono anche con la bocca del cannone. `npm test`: 31 test, tutti verdi.
Screenshot rifatti e controllati (02 battaglia, 09 e 09b, 11 clone); controllato anche un ingrandimento del guardiano normale, in frenesia e del clone.

Catalogo grafico: rigenerato → docs/catalogo-grafico.html (tessere del guardiano più alte, nuova tessera “Clone speculare”; 50 scene, 75 tessere).

Checklist: nuove voci “Guardiano: disegno nuovo da vedere sul telefono”, “Etichetta del guardiano: che segue il guardiano o fissa al centro?”; aggiornare “Ridisegno di guardiano
e torrette” in “Ridisegno: guardiano fatto (statico); parti mobili e torrette da decidere”.

## 1.9.2 — mirino premendo, clone che specchia le salve, rimbalzi fermati dalla cupola, avvisi di sblocco

Richieste di Marco dopo la 1.9.1; scelte sue tra le proposte di Claude: mirino “insegue se vicino” (45 px), avviso anche al 30, ridisegno di guardiano e torrette rimandato.

- **Mirino**: tornato `drawCrosshair` nel punto premuto (`press`, non più in basso di 50 px sopra il suolo). Premendo, il nemico più vicino al mirino entro 45 px (`PRESS_PICK`)
  è il bersaglio della salva: i colpi lo inseguono e valgono le combo legate al bersaglio (Mira amplificata del Beam); senza, colpi dritti in alto come nella 1.9.0.
  Il mirino diventa giallo quando aggancia (**[Claude]**). Testo di aiuto del menu aggiornato. Le combo di stato (Colpi distruttivi, Posamine, Colpi ramificati, Laser rotante)
  già scattavano anche senza bersaglio, al primo impatto: ora funzionano allo stesso modo con il bersaglio agganciato.
- **Clone speculare**: specchia ogni salva del guardiano (posizione e direzione riflesse), senza un bersaglio proprio e senza l’impostazione del bersaglio, anche se da quel lato
  non ci sono nemici; premendo specchia allo stesso modo. Replica Ventaglio (nuova `fanOffsets`, condivisa con il guardiano), esplosioni dei Colpi esplosivi, knockback del Colpo pesante,
  perforazione, Rimbalzo e frenesia; **niente combo**. Danno 50% come prima.
- **Rimbalzi**: un proiettile del guardiano o del clone che dopo un rimbalzo rientra nella cupola si ferma (sparisce al passaggio del bordo); vale anche per il Colpo caricato.
- **Avvisi di sblocco**: `UNLOCKS` (10, 20, 30, 31, 40, 50) e `unlockNotes`, calcolati in `winLevel` al primo completamento in Standard. `unlockScreen` (draw.js) si disegna sopra la
  vittoria e ne disattiva i pulsanti; si chiude con “Ho capito”, Invio o Esc. Al 30 l’equipaggiamento è “in arrivo in un prossimo aggiornamento” (non è costruito). Testi **[Claude]**.
- DESIGN.md: § 2 (guardiano e mira con il mirino), § 4 (avviso di sblocco), § 8 rigenerato (riga del guardiano), § 10 (Clone speculare rev. 4, tiro premendo rev. 4, rimbalzi del guardiano).
- `APP_VERSION` e `VERSION` di `sw.js`: 1.9.2.
- Ridisegno di guardiano e torrette (§ 11): non toccato, resta da decidere.

**Test** — `tiro.js`: mirino su un nemico → tutti i colpi del guardiano hanno quel bersaglio, quelli del clone nessuno e direzione specchiata salva per salva; clone in automatico con
nemici solo a sinistra → stesse salve del guardiano, verso destra, e 4 colpi di Ventaglio per salva come il guardiano. `rev3.js`: rimbalzo del guardiano e del clone verso un punto dentro
la cupola → si ferma al passaggio del bordo, il nemico finto dentro non viene colpito. Nuovo `sblocchi.js`: avviso giusto ai livelli 10, 20, 30, 31, 40, 50, nessun avviso per un livello
già completato, per il 12 e in Epica; il pulsante sotto non risponde; Invio chiude e poi avvia il livello dopo; “Ho capito” chiude. `npm test`: 31 test, tutti verdi.

Screenshot: nuovi 09b (mirino), 35 (avviso al 40), 36 (avviso al 10); controllati.

Catalogo grafico: rigenerato → docs/catalogo-grafico.html (scena “Tiro premendo, mirino”, nuova scena “Avviso di sblocco”, tessera `drawCrosshair` tornata; 50 scene, 74 tessere).

Checklist: nuove voci “Mirino premendo (aggancio entro 45 px, colore giallo): provare”, “Clone che specchia le salve, con Ventaglio e chain: provare”,
“Rimbalzi del guardiano fermati dalla cupola: provare”, “Avvisi di sblocco ai livelli 10-50: rivedere i testi”, “Ridisegno di guardiano e torrette: decidere i punti aperti del § 11”.

## 1.9.1 — sfere del Thunderbolt sul profilo nuovo, Firewheel che rimbalza sulla cupola

Correzione di Marco dopo la 1.9.0 (testi di DESIGN.md § 10 e § 11 forniti da lui). Nessun numero della difficoltà cambiato.

- **Un solo profilo della cupola**: tolto `ORB_RX`; nuova `domeK(x, y, pad)` (distanza normalizzata dalla cupola allargata di `pad`).
- **Sfere del Thunderbolt**: girano su `DOME` (215 × 95), solo sull’arco visibile: `th` tra `ORB_A` e `ORB_B`, cioè x da 12 a 348 (cos th tra −0,78 e +0,78).
  Stessa velocità (0,55 rad/s) e stesso avanti-indietro; le partenze sfalsate di prima (0,5 + 0,9·k) sono riportate in proporzione sull’arco più corto (`orbStart`), così con 4 sfere
  la quarta non si sovrappone alla terza su un capo. Sfere pungenti (`aura`) e disegno leggono `o.x`/`o.y`: seguono da soli.
- **Firewheel Drone**: il drone parte da dentro la cupola ed esce (`out`); da lì il bordo (allargato del nucleo: 5 px, 3 px per i mini-droni) è un muro: riflessione sulla normale
  dell’ellisse e ritorno all’ultima posizione fuori. Vale per i mini-droni (lettura di Claude) e, poiché usano la stessa funzione, anche per il Mini-drone di scorta della combo del guardiano.
  Scia e danno invariati.
- DESIGN.md § 10: frase sulle sfere sostituita nel punto “Cupola larga (revisione 3)”, nuovo punto “Firewheel Drone (revisione 3)”. § 11: il punto “Guardiano” da sostituire
  **non c’era** (la 1.9.0 non lo aveva aggiunto): il testo “Guardiano e torrette (grafica)” è stato aggiunto come punto nuovo.
- Nota: il Firewheel non ha una carta “+1 rimbalzo” (le sue standard sono Danno, Durata, Fiamme più ampie); i test usano le standard e le chain.
- `APP_VERSION` e `VERSION` di `sw.js`: 1.9.1.

**Controllo: oggetti mobili e cupola** (nessuna modifica, decide Marco). Misurato con tutte le torrette al livello 3 e le combo del guardiano: partite vere al livello 30 (9 partite × 2 min)
e caso peggiore con 11 nemici immortali fermi a contatto con la cupola su tutto l’arco (9 prove × 40 s); “rientri” = oggetti usciti dalla cupola che poi ci rientrano.

| Oggetto | Attraversa la cupola? | Problema visibile? |
|---|---|---|
| Mini-missili della Sky Guard (Frammentazione) | **Sì**: nascono fuori, all’impatto, e inseguono un nemico a caso, anche dall’altra parte (92 rientri su 686 missili nel caso peggiore, 0 nelle partite vere) | Sì, quando i nemici sono sulla cupola |
| Missili principali della Sky Guard | No: partono da dentro ed escono verso il bersaglio | No |
| Droni dell’Hive | No dal fuori, ma **restano dentro**: si fermano a 45 px dal bersaglio, quindi con i nemici sulla cupola volano dentro di essa (196 su 199 non escono mai) | Sì, con i nemici a contatto |
| Mini-drone di scorta (combo Firewheel) | No: dalla 1.9.1 rimbalza come il Firewheel (0 rientri) | No |
| Buco nero del Gravity Vortex Gun | No: percorso dritto da dentro verso fuori (0 rientri) | No |
| Wormhole | No: varchi fermi (ingresso sul primo nemico toccato, uscita a fine percorso) | No |
| Proiettili della Railgun (anche divisi) | No: linee dritte verso l’alto (0 rientri) | No |
| Colpi e schegge dell’Aeroblast | Colpi no; **schegge raramente** (1 rientro su 20 nelle partite vere): partono dall’esplosione in direzioni a ventaglio | Poco |
| Proiettili del guardiano e del Clone | No nelle prove (0 su circa 50.000); possibile in teoria con Rimbalzo, che cerca un nemico entro 180 px e lo raggiunge in linea retta | No |
| Sfera del Teslacoil (rimbalzi) | No nelle prove (0 su 173); possibile in teoria tra due nemici lontani sulla cupola | No |
| Mine (Aeroblast, Posamine, Barriera minata) | No: ferme, nascono fuori (punto d’impatto o bordo + 10 px) | No |

**Test** — `tests/rev3.js`: profilo unico (niente `ORB_RX`); 1, 3 e 4 sfere per 20 s, a ogni fotogramma sul profilo 215 (scarto < 1e−15) con x tra 12,0 e 348,0, arrivano ai capi;
Firewheel lanciato da ognuno dei 4 slot, 8 lanci per slot, con Durata ×3, con Mini-droni e Scatto, con Scia e Presidio: tutti escono, rimbalzano sulla cupola (28-164 rimbalzi), 0 rientri.
Tolto il controllo “sfere sul profilo 172”. `npm test`: 30 test, tutti verdi.

Screenshot: nuovi 32 (Thunderbolt, 1 sfera), 33 (3 sfere), 34 (Firewheel con Mini-droni e Scia); controllati.

Catalogo grafico: rigenerato → docs/catalogo-grafico.html (scene del Thunderbolt e del Firewheel con il comportamento nuovo; 49 scene, 73 tessere).

Checklist: nuove voci “Sfere del Thunderbolt sul nuovo profilo: provare”, “Drone del Firewheel che rimbalza sulla cupola: provare”, “Oggetti che attraversano la cupola: decidere dopo la tabella”.

## 1.9.0 — cupola larga, cristalli più lenti, tiro verticale, carte al rilascio, schermo acceso

Richieste di Marco (testi di DESIGN.md forniti da lui); valori segnati **[Claude]** in DESIGN.md: 60 px/s, 215 px, 0,6 s, modalità del Wake Lock, lettura della frenesia.

- **Cristalli** (`wisp`): velocità base da 72 a 60 px/s. Vita, danno e numero invariati.
- **Cupola larga**: `DOME.rx` da 172 a 215 px (altezza 95 invariata). Vale per il contatto dei nemici (`touchesDome`), `domeNear` (Repulsiva), il bordo del laser,
  le mine della Barriera minata, il gas della Congelante e i disegni (bordo, riempimento, `FX.domeWave`, `FX.domeGas`, `FX.domeAura`), che leggono tutti `DOME`.
  Le sfere del Thunderbolt girano su un valore separato, `ORB_RX` = 172, e restano nello schermo (x da 57 a 337 con 4 sfere). `FX.shieldCount` sta sulla barra della vita
  e l’anello della barriera di Backup ha raggio `DOME.ry`: non cambiano.
- **Barriera minata**: con il bordo largo le mine sarebbero nate da x −45 a 405. Ora nascono solo sulla parte visibile del bordo, da x 10 a 350 (y da circa 480 a 515):
  segnalato in DESIGN.md § 11 come proposta aperta. Le mine dell’Aeroblast nascono dove esplodono i colpi, non sul bordo: invariate. Controllate con lo screenshot 31.
- **Laser**: `trace` ferma un tratto che parte fuori dalla cupola e la rientra sul suo bordo (`domeEntry`, intersezione con l’ellisse), e da lì il raggio non rimbalza più.
  Il primo tratto parte da dentro ed esce normalmente; vale per raggio principale e mini-raggi (lv3). Spazzata e Laser rotante non rimbalzano: invariati.
- **Carte**: i pulsanti delle carte e “Continua” della ricompensa hanno `release` (in `button()`): si sceglie al `pointerup` solo se il dito era partito dalla stessa carta
  e ci finisce sopra; i tocchi entro `CARD_LOCK` = 0,6 s dalla comparsa (`cardsShown()`, chiamata all’apertura delle carte e della ricompensa) sono ignorati. Tasti 1/2/3 immediati;
  menu, albero, pausa, vittoria e sconfitta invariati (alla pressione).
- **Schermo sempre acceso**: Screen Wake Lock nel secondo `<script>` (`keepAwake`), richiesto al tocco su “Start”, rilasciato con `visibilitychange` in secondo piano e richiesto
  di nuovo al ritorno; senza `navigator.wakeLock` o con una richiesta rifiutata non succede nulla.
- **Mira solo automatica**: tolti mira manuale (`manual`, `aim`, `toggleAim`, `AIM_LABEL`), `drawCrosshair`, il pulsante nel menu (al suo posto due righe di aiuto), il tasto M,
  le righe “mira manuale” di HUD e pausa e “mira …” del pannello del salvataggio. Nuovo stato `pressing`: premendo sul campo (non sui pulsanti) il guardiano segue il dito
  e spara a −90° senza bersaglio (anche senza nemici a schermo); al rilascio torna l’automatica. Il Clone speculare spara in verticale dalla posizione specchiata;
  Ventaglio e combo come prima (il Ventaglio si apre attorno alla verticale; la Mira amplificata non cresce mentre si preme, perché non c’è un bersaglio).
  Frenesia: scorre con nemici a schermo **o** dito premuto.
- **Salvataggio**: `settings` esporta solo `targeting`; `parseSave` accetta file con `aim` e lo ignora. `SAVE_VERSION` invariato (2).
- **Teslacoil**: la Sfera statica ha un disegno proprio, `FX.teslaOrb` (alone trasparente tremolante grande quanto l’area, contorno, 6 archi, nucleo piccolo semitrasparente);
  `zone()` accetta un disegno proprio. Danno e area invariati.
- **Generatore di DESIGN.md**: `tests/tools/design-lists.js` trovava solo i nemici con un solo spazio dopo `type: "…",`; corretta l’espressione: ora il § 9 elenca
  `drone`, `wisp`, `brute`, `spitter`, `shell`. Riga del guardiano nel § 8 senza la mira manuale. § 8 e § 9 rigenerati.
- DESIGN.md: testi di Marco in § 2, 4, 5, 7, 10, 11. DEPLOY.md: “impostazioni (bersaglio)”.
- `APP_VERSION` e `VERSION` di `sw.js`: 1.9.0.

**Test** — nuovi: `tests/tiro.js` (sostituisce `manual.js`: colpi del guardiano e del clone a −90° senza bersaglio premendo, il guardiano segue il dito, ritorno all’automatico
al rilascio, colpi anche senza nemici, pulsanti Bersaglio e pausa esclusi, frenesia che scorre premendo senza nemici e si ferma al rilascio, frenesia in automatico),
`tests/rev3.js` (profilo 215/95 e sfere su 172, nemico a x 9 con r 9 fermo a y 517,2 prima del suolo, al centro a 475, `wisp` 60, laser al centro che si ferma sul bordo dopo il primo
rimbalzo, raggio obliquo, mini-raggi lv3, spazzata, sfere del Thunderbolt nello schermo, mine della Barriera minata tra x 10 e 350), `tests/carte.js` (tocchi ignorati subito e a 0,3 s,
solo premere non sceglie, rilascio fuori o su un’altra carta annulla, rilascio sulla stessa carta sceglie, tasto 3 immediato, “Continua” con le stesse regole, menu/albero/pausa alla pressione).
Aggiornati: `splash.js` (Wake Lock con un finto `navigator.wakeLock`: niente prima di “Start”, richiesto dopo, rilasciato in secondo piano, richiesto di nuovo, nessuna richiesta doppia,
nessun errore se manca o è rifiutato), `menu.js` (niente “Mira” né tasto M; impostazioni salvate senza `aim`), `savetest.js` (esportazione senza `aim`, file con `aim: "manual"`
accettato e ignorato), `combo.js` (clone in tiro verticale al posto della mira manuale), `rev1.js` (laser al centro con 2 rimbalzi: il raggio principale ha 2 tratti invece di 3,
perché il secondo si ferma sulla cupola; i mini-raggi lv3 restano a 3 tratti, quindi il controllo dei loro rimbalzi resta), `final.js` (tocco sulla carta dopo 0,6 s con rilascio).
`bot.js`: nuovo `tap()` (pressione e rilascio); i bot e i test che spostavano il guardiano con un tocco ora rilasciano il dito, così giocano in automatico come prima
(stessi numeri casuali: la scelta delle mosse non cambia). `npm test`: 30 test, tutti verdi.

Screenshot: 09 ora “tiro verticale”; nuovi 29 (laser fermato dalla cupola), 30 (Sfera statica), 31 (mine della Barriera minata e dell’Aeroblast). Controllati: menu senza “Mira”,
carte, battaglia con la cupola larga, pausa, abilità.

**Misure con i bot** (stessi bot e stessi semi, 1.8.0 → 1.9.0 sulla stessa macchina; 1.8.0 da una copia di `HEAD`): livelli 10 / 20 / 30 (800 partite) 32,0% → 32,6% ·
28,9% → 29,9% · 31,8% → 29,0%; 8 / 15 / 25 (400 partite) 56,0% → 59,8% · 78,8% → 75,2% · 55,8% → 54,8%; muri dal 40 al 200 con `curva.js` (200 partite per muro) media
30,9% → 32,1% (riferimento nel CHANGELOG 1.8.0: 31,1%), da 15,5% al 140 a 49,0% al 120, scarto più grande al 70 (33,5% → 41,0%). Tutto dentro o vicino al rumore:
nessun numero della difficoltà cambiato. Numeri in DESIGN.md § 5.

Catalogo grafico: rigenerato → docs/catalogo-grafico.html (scena “Mira manuale” sostituita da “Tiro verticale”; tessera `drawCrosshair` tolta, nuova tessera `FX.teslaOrb`; 49 scene, 73 tessere).

Checklist: nuove voci “Cristalli più lenti e cupola larga: provare in gioco e rimisurare i muri”, “Carte: azione al rilascio e blocco di 0,6 s, da provare sul telefono”,
“Schermo sempre acceso: da provare sul telefono (le PWA installate su iOS hanno avuto problemi in alcune versioni)”, “Tiro verticale (clone, frenesia, esclusi pausa e bersaglio): da provare”,
“Barriera minata con la cupola larga: verificare dove compaiono le mine”, “Sfera statica del Teslacoil: nuovo disegno”; togliere le voci sulla mira manuale, se ci sono.

## 1.8.0 — abilità della barriera (fase 3 dell’albero)

Testo e risposte di Marco **[deciso]** nel § 16 di DESIGN.md (Rigenerazione rivista, Ustionante con il valore maggiore, mine dell’Aeroblast, Congelante, Potenziante che si somma,
immunità che si accumulano, cooldown sfalsati e fermi, una abilità per gruppo nell’ordine dello schema, Repulsiva solo knockback, Backup senza premio della cupola).
Valori per livello e letture di Claude, provvisori, nello stesso paragrafo.

- **Dati** (`index.html`): `AB_GROUPS`, `ABILITIES` con i valori per livello, `abVal`; nodi dell’albero `TREE.abilities` (`ab:<id>`, 5 livelli; la prima di ogni gruppo
  parte dal livello 1 senza spesa con il nuovo campo `free`, le altre si sbloccano con 3 Sigilli e seguono la regola dei livelli).
- **Equipaggiamento**: `progress.abilities` { resist, control, offense } (null = le tre d’ingresso), `equipAbility`, `equippedAbilities`; attive in partita solo con il livello 40 completato.
  Salvate nel file e nel codice di esportazione (formato versione 2, campo nuovo opzionale; valori non validi scartati).
- **In battaglia**: `startAbilities`, `abilityTick` (in `update`, quindi ferme in pausa e nella scelta delle carte), `fireAbility`, `tryBackup`.
  Rigenerazione, Backup, Impenetrabile (`domeShield`, immunità accumulate, consumate in `domeHit`), Repulsiva (metà schermo dal lato con più nemici), Congelante
  (gas: `weaken` con intensità `weakK`), Riflettente (danno force al nemico che colpisce), Ustionante (`fireBurnDps`: la torretta di fuoco più forte o 6),
  Minata (mine di `mine()` dell’Aeroblast in campo o di una Aeroblast base), Potenziante (`powerBonus`). Tolti i segnaposto di rigenerazione e repulsione e `repulseCd`.
- **Danno**: in `dmgM` i bonus di tipo e tutte le torrette, “Più carte, più danno” e Potenziante ora si **sommano** (prima Più carte moltiplicava).
- **Disegno** (`draw.js`): nuove `FX.domeWave`, `FX.domeGas`, `FX.domeAura`, `FX.shieldCount` (scudo con il numero sulla barra della cupola); bordo colorato con un’abilità attiva.
  Albero: la sezione Barriera ha due schede, Potenziamenti e Abilità (tre gruppi, pallino per equipaggiare, riga per i livelli); `treeNodeRow` accetta posizione e larghezza.
- **Taratura**: con le abilità i muri dal 50 al 200 salivano al 39,5%; coefficiente del boss finale da 1,1 a 1,5 (3625 al 50, 5522 al 100, 7190 al 200): media **31,1%**
  (200 partite per muro). `tests/tools/curva.js`: i bot comprano i livelli delle abilità d’ingresso. Numeri in DESIGN.md § 5 e § 16.
- `APP_VERSION` e `VERSION` di `sw.js`: 1.8.0.
- **Test**: nuovo `tests/abilities.js` (gruppi e sblocchi, equipaggiamento e regola dei livelli, attive solo dal 40, cooldown sfalsati e fermi in pausa e nella scelta delle carte,
  Rigenerazione con soglia, attesa e massimo di volte, Backup una volta e niente premio della cupola, immunità accumulate e consumate, Repulsiva solo sul lato giusto,
  Congelante −35% e −45% e durata del gas, Riflettente e sua fine, Ustionante fissa e con la torretta più forte, Minata 4 e 6 mine e mine dell’Aeroblast in campo,
  Potenziante che si somma, salvataggio). 28 test, tutti verdi.
- Screenshot: nuovi 27 (albero · abilità) e 28 (abilità in battaglia), controllati; descrizioni dei nodi accorciate per stare nella riga.

Catalogo grafico: rigenerato → docs/catalogo-grafico.html (4 nuove tessere FX, scene “Albero dei Sigilli · Abilità” e “Abilità della barriera in battaglia”; 49 scene, 73 tessere).

Checklist: nuove voci “Abilità della barriera: provarle dal livello 40”, “Valori per livello delle 9 abilità (provvisori) da rivedere”, “Letture: Rigenerazione sotto il 40%,
mine da 4 a 8, Congelante da −25% a −45%, abilità che aspettano un nemico”; togliere “Fase 3, abilità della barriera: rispondere alle domande aperte del § 16”.

## Descrizione delle abilità della barriera (solo documentazione)

Testo di Marco **[deciso]**; nessuna modifica a codice, test o sezioni *(generato)*. Versione del gioco invariata (1.7.0).

- DESIGN.md § 16: inserite le descrizioni delle 9 abilità al posto di “Descrizione di ciascuna come da Marco” (il testo non era nel file).
- Il vecchio elenco “Aperti” diviso in “Risolti dal testo di Marco” (lato della Repulsiva, Riflettente sotto il 100%, valore base di Ustionante e Minata,
  Backup una volta, Congelante con l’indebolimento) e nuovi “Aperti” per la fase 3, scritti come domande.

Test: nessuno (solo documentazione).

Catalogo grafico: non cambiato.

Checklist: nuova voce “Fase 3, abilità della barriera: rispondere alle domande aperte del § 16”; togliere “Descrizioni delle abilità della barriera” se presente.

## 1.7.0 — curva fino al livello 200 e albero sulla lunga durata

Richieste di Marco: i livelli 40 e 50 non devono essere così difficili; la campagna deve arrivare almeno al 200, con un albero che cresca a lungo e tetti più alti
sui nodi del danno; il nodo “più carte (+cadenza)” diventa “chi ha più carte scelte fa +5/10/15/20/25% di danno”. La curva oltre il 30 non era stata alzata:
era la formula provvisoria di prima (piena dal 31), mai tarata con l’albero.

- **Campagna**: `CAMPAIGN.maxLevel` da 50 a 200. `tests/bot.js` legge il massimo dal gioco (prima era scritto 50).
- **Curva dal 31**: `effD` sale di 0,2 per livello (`EFF_SLOPE_31`) invece di 1. **Boss finali dal 40**: 1450 × (1 + 1,1 · n^0,35), n = decine dopo il 40
  (1450 al 40, 3045 al 50, 4436 al 100, 5659 al 200; prima 1550, 1650, 2150, 3150). Livelli 1-30 invariati.
- **Albero**: costo per livello 1 + ⌊(L − 1)/5⌋ (prima L); Danno maggiorato di torrette e guardiano, danno per tipo, danno di tutte le torrette e Vita % fino al
  livello 20 (prima 5). Albero intero 1202 Sigilli.
- **Nodo “Più carte, più danno”** (Barriera, dopo Riduzione danno, 5 livelli, +5% per livello): `markTop` in `applyUp` segna chi ha più pile di potenziamenti (a parità tutti,
  con zero nessuno), `dmgM` moltiplica per `cardsBonus`. Letture di Claude in DESIGN.md § 16. Tolta dalla schermata la riga “Da definire”.
- **Nuovo strumento** `tests/tools/curva.js`: i bot giocano un livello con l’albero atteso (Sigilli dal 31 al livello prima, 1,5 per livello di default, spesi da una
  strategia fissa). Uso: `node tests/tools/curva.js <livelli> [partite per bot] [primo seme] [Sigilli per livello] [sostituzioni]`.
- **Prove** (80-200 partite per caso): pendenza 0,3 / 0,2 / 0,12 → livello 75: 76% / 80% / 91%, livello 200 (muro): 14% / 40% / 73%; boss +30% o +60% per decina
  → muri irregolari e troppo duri verso il 200; boss con √ → media 32,5% ma 40% all’inizio e 10-26% dopo il 130; scelto n^0,35.
- **Misura finale** (200 partite per muro): muri dal 40 al 200 in media **32,6%** (da 13,5% al 190 a 49% al 100); tra i muri 38,5-90%
  (31 38,5%, 45 73,8%, 85 90%, 195 61,3%). Con 1 solo Sigillo per livello i muri scendono (100: 20%, 200: 11%). Tutti i numeri in DESIGN.md § 16.
  Differenza per tipo del boss: Physical 13-27%, Electric 43-48% (il guardiano è Physical; resistenze segnaposto).
- `APP_VERSION` e `VERSION` di `sw.js`: 1.7.0.
- **Test**: `tests/seals.js`: costi 1×5, 2×5, 3×5, 4×5 per un nodo da 20 (totale 50) e stato “max”; livelli massimi (20, 5, 20, 20, 20, 5); nuova parte
  “Più carte, più danno” (nessuna carta, una carta, parità, sorpasso, nodo assente); controllo dei livelli oltre il massimo portato a 25. 27 test, tutti verdi.
- Screenshot: rifatti; controllata la sezione Barriera con 6 nodi.

Catalogo grafico: rigenerato → docs/catalogo-grafico.html (stesse 47 scene; cambiano i testi dell’albero).

Checklist: nuove voci “Curva dal 31 (pendenza 0,2) e boss dal 40: verificare giocando; rifarla con l’equipaggiamento”, “Più carte, più danno: letture
(pile, parità) da confermare”, “Muri con boss Physical più duri (13-27%): rivedere con le resistenze vere”; togliere “Livelli 31-50 quasi impossibili” e
“Nodo più carte (+cadenza): definire”.

## 1.6.0 — albero dei Sigilli, fase 2: nodi a livelli

Richiesta di Marco: fase 2 (nodi numerici e spina della barriera). Struttura dal § 16 di DESIGN.md; tutti i valori sono di Claude, provvisori.

- **Nodi a livelli** (`index.html`): ogni nodo ha `max` e `costs` (livello L+1 = L+1 Sigilli); `progress.tree` ora salva il livello (gli sblocchi restano a 1).
  `nodeLv`, `treeLv`, `nodeCost`; `nodeState` con “max” e la regola dei livelli (un nodo non supera il livello dei nodi da cui dipende). Formato del salvataggio invariato
  (versione 2): i livelli oltre il massimo vengono riportati al massimo.
- **Carte standard**: 3 nodi per torretta (5 livelli) e 3 per il guardiano (Danno maggiorato 5, +1 proiettile 3, Ventaglio ampliato 3). Tabella `STD_KIND` e funzioni
  `stdB` (bonus in %), `stdR` (ricarica), `stdM` (malus), `stdC` (bonus a numero); `makeShooter` legge i livelli in `s.sb` all’inizio della partita.
  Tutte le formule delle 36 carte standard ora passano da queste funzioni; senza albero i valori sono identici a prima (stessi test, stessi numeri).
- **Sezione “Tipi”** (12ª casella della griglia delle torrette): danno per tipo, di tutte le torrette (`s.tb` in `dmgM`, solo torrette), durata degli stati (`statDur`
  in `slow`, `burn`, `weaken`, `para`, `vuln`, distruzione, bruciatura della Sky Guard, scia combustibile).
- **Barriera**: Vita %, Riduzione danno, Vita fissa, Riduzione cooldown abilità, Ignorare un colpo; `domeRed()` e `abCdM()` con i tetti `TREE_CAP` (40% e 60%).
  Il nodo “più carte (+cadenza)” non è costruito (definizione aperta).
- **Schermata**: pulsante “‹ Menu” in alto (spazio per 9 nodi), griglia delle torrette su 2 righe con la casella “Tipi”, righe dei nodi con livello, effetto attuale → successivo e costo;
  sezione Barriera con i 5 nodi, ciò che manca e i tetti.
- `APP_VERSION` e `VERSION` di `sw.js`: 1.6.0.
- **Test**: `tests/seals.js`, nuova parte “Fase 2”: numero di nodi; costi 1-5 e stato “max”; regola dei livelli; danno della Sky Guard (carta al 5, Fire 2, tutte 1 = ×2,0125);
  malus al 3 e al 5; Railgun e Hive al 5; bonus del tipo solo per le torrette; senza albero valori di prima; cupola 130 di vita, riduzione e tetto; 10% di colpi ignorati
  (4000 prove); durata degli stati ×1,3; Ventaglio a 7 proiettili; livelli oltre il massimo. `tests/newfx.js`: aggiornato il frammento della distruzione
  (`e.destrT = 5 * statDur`). 27 test, tutti verdi.
- **Misura con i bot** (200 partite per caso): livello 40 / 50 senza albero 3,0% / 0,5%; solo sblocchi 9,0% / 2,0%; nodi a livelli al 3 63,5% / 42,5%; albero pieno 88,0% / 72,0%.
  L’albero intero costa 808 Sigilli, oggi se ne prendono al massimo 340 (40 in Standard): numeri in DESIGN.md § 16. Nessun numero della difficoltà cambiato.
- Screenshot: rifatti 21-24 e nuovo 26 (sezione Tipi); controllati, testi accorciati per stare nei 360 px.

Catalogo grafico: rigenerato → docs/catalogo-grafico.html (nuova scena “Albero dei Sigilli · Tipi”, scene dell’albero con nodi a livelli; 47 scene).

Checklist: nuove voci “Fase 2 dell’albero: valori provvisori (carte ×1,4 per livello, tipi +6%, barriera) da rivedere”, “Livelli 31-50: con i Sigilli di oggi quasi impossibili
(3% al 40 senza albero): decidere costi, Sigilli o difficoltà”, “Durata degli stati: nodo globale o per tipo?”, “Nodo più carte (+cadenza): definire”.

## 1.5.0 — Sigilli e albero dei potenziamenti, fase 1

Richiesta di Marco: cominciare a costruire Sigilli, barriera e albero; fase 1 = la parte già decisa (Sigilli, salvataggio, nodi di sblocco, torrette equipaggiate).
Costi dei nodi e alcune letture sono di Claude, segnati come provvisori o da rivedere in DESIGN.md § 16.

- **Premi di Sigilli** (`sealReward`, chiamata da `winLevel`): Standard dal livello 31 (`CAMPAIGN.sealsFrom`), 1 per livello; Epica 3, dal livello 1. Primo completamento,
  poi una sola volta con la cupola al 100% a fine livello (`domeHp >= domeMax`), per livello e modalità. Il premio della cupola si prende solo con un completamento successivo al primo
  (lettura da confermare, § 16). Schermata di vittoria: riga dei Sigilli presi e suggerimento per il premio rimasto (`sealLines`).
- **Albero, fase 1**: `TREE` generato da `TREE_LOCKS` (`buildTree`): per torretta chain 3 nodi in sequenza, lv2 dell’altra chain, level up lv2, Sblocco permanente
  (richiede tutti gli altri); guardiano 6 nodi. Costi provvisori `SEAL_COST` (chain 1, 1, 2; altre 1; permanente 3). `nodeState`, `buyNode`; `locked()` ora guarda anche
  i nodi comprati (`progress.tree`), quindi carte e combo bloccate escono dopo l’acquisto.
- **Torrette equipaggiate**: `progress.loadout` (massimo 4, solo con lo Sblocco permanente, `toggleEquip`). In `startRun` vanno nei primi slot liberi dopo `META.startTurrets`
  e ognuna salta una delle prime scelte (`skipLeft` in `endWave`); non escono più come carta (già in campo). La riga di `META.startTurrets` è rimasta identica (la usano 15 test).
- **Schermata dell’albero** (`state = "tree"`, `treeScreen`, `treeNodeRow` in draw.js; `openTree`, `closeTree`, `tapNode` in index.html): sezioni Guardiano, Torrette, Barriera;
  primo tocco seleziona, secondo compra; tocco su uno Sblocco permanente comprato = equipaggia/togli; Esc o “Menu” per uscire. Menu: pulsante “Albero dei Sigilli · N ◆”
  (spento fino al 31), riga “Liv 31 — Sigilli e albero dei potenziamenti” tra gli sblocchi, righe gialle accorciate per farci stare tutto.
- **Salvataggio**: `SAVE_VERSION` 2; `progress` ha anche `seals`, `claims`, `tree`, `loadout` (`cleanSeals` tiene solo i valori validi). Un file o codice della versione 1
  si importa con Sigilli a zero; il riepilogo dell’importazione e il pannello mostrano Sigilli e nodi. Chiave di `localStorage` invariata.
- `APP_VERSION` e `VERSION` di `sw.js`: 1.5.0. `ASSETS` invariato.
- **Test**: nuovo `tests/seals.js`: 10 casi di premio (30 niente; 31 primo, rigiocato, al 100%, ancora; 32 primo già perfetto poi rigiocato; Epica 1); acquisto con due tocchi,
  sequenza della chain, Sigilli insufficienti, carta e combo (Colpi ramificati) offerte solo dopo lo sblocco; Sblocco permanente dopo gli altri nodi; equipaggiamento (limite 4,
  serve lo sblocco); partita con 2 torrette equipaggiate: slot occupati, ondate 1 e 2 senza carte, la 3 con le carte, le torrette non escono come carta, 17 carte + 2 = 19;
  apertura dell’albero solo dal 31, sezioni senza errori, Esc; salvataggio: valori non validi scartati, esportazione v2, importazione v1, codice andata e ritorno, vecchio formato in memoria.
  Totale 27 test, tutti verdi (`npm test`).
- **Screenshot** (`npm run screenshots`, 6 nuovi): 20 menu con l’albero, 21 albero · torrette, 22 acquisto in attesa, 23 guardiano, 24 barriera, 25 vittoria con Sigilli.
  Controllati: testi dentro i 360 px. Corretti in corsa: riga gialla del menu che usciva a destra e righe degli sblocchi sovrapposte.
- Bilanciamento: non cambiato e non rimisurato (i bot partono senza Sigilli, quindi i livelli 1-50 si giocano come prima con il pool libero).

Catalogo grafico: rigenerato → docs/catalogo-grafico.html (6 scene nuove: vittoria con Sigilli, menu con l’albero, albero · torrette, acquisto, guardiano, barriera; 46 scene).

Checklist: nuove voci “Albero dei Sigilli, fase 1: provarlo sul telefono dal livello 31”, “Costi dei nodi (provvisori: 1-1-2, 1, 3) da decidere”,
“Premio della cupola al 100%: confermare la lettura (solo da un completamento successivo al primo)”, “Sblocco permanente: richiede tutti gli altri nodi della torretta? (lettura di Claude)”,
“Torrette equipaggiate e carte sbloccate valgono anche nei livelli 1-30? (lettura di Claude: sì)”; togliere “Sigilli: flusso” se presente come da costruire.

## 1.4.1 — muri 10, 20 e 30 al 30%

Decisione di Marco: con il pool libero i muri erano troppo punitivi; i livelli 10, 20 e 30 si devono superare in circa il 30% delle partite. Leve e valori di Claude.

- `app/index.html`: vita base del boss finale in una tabella `FINAL_BOSS_HP` = { 10: 400, 20: 2250, 30: 1450 } (prima 800, 2800, 2900); oltre il 30
  +100 ogni 10 livelli (provvisoria, ora 1550 al 40 e 1650 al 50 invece di 3000 e 3100). Nuova `WALL_ENEMY_HP` = { 10: 0.93 }: al livello 10 i nemici normali
  hanno il 93% della vita (al 10 solo il 37% dei bot arrivava al boss: abbassare solo il boss non bastava, restava sotto il 20%).
- Prove (pool libero, 200-400 partite per variante, semi diversi da quelli della misura finale): boss ×1 / ×0,7 / ×0,5 / ×0,35 → livello 20: 15% / 35% / 50% / 57%,
  livello 30: 4,5% / 13% / 31% / 44%, livello 10 fermo intorno al 19%; al 10 con boss ×0,5 e nemici ×0,9 33-42%, ×0,93 30%; al 20 boss ×0,8 31%; al 30 boss ×0,55 26%.
- **Misura finale** (800 partite, semi 1-400 per bot, gli stessi della 1.4.0): **10 33,0%** · **20 28,0%** · **30 31,3%** (prima 9,9%, 18,1%, 4,9%).
  `l30.js`: arrivano all’ondata 20 in 446, 469 e 404 su 800. Livello 9 circa 36% (200 partite). Gli altri livelli non cambiano.
- DESIGN.md: § 5 formula del boss e nuova voce “Muri al 30%” con i numeri; § 10 vita del boss finale; § 11 tolta la decisione aperta “Difficoltà con il pool libero”.
- `APP_VERSION` e `VERSION` di `sw.js`: 1.4.1.

Test: `npm test`, 26 test, tutti verdi. Screenshot non rifatti: nessuna schermata cambiata.

Catalogo grafico: rigenerato → docs/catalogo-grafico.html (disegni non cambiati: cambia solo l’hash dei file).

Checklist: togliere “Difficoltà con il pool libero: muri al 20 (18%) e al 30 (5%) da decidere”; nuova voce “Muri 10/20/30 al 30% (§ 5): da verificare giocando,
anche in Epica (non misurata)”.

## 1.4.0 — Sigilli e albero dei potenziamenti: design e carte bloccate

Testo di Marco dal progetto su claude.ai, inserito in DESIGN.md; nel codice solo il blocco delle carte (l’albero, i Sigilli e il loro salvataggio non esistono ancora).

- **DESIGN.md**: le 10 modifiche di Marco (§ 2 torrette equipaggiate dal 31; § 3 combo e carte bloccate; § 4 sblocchi a fine livello e progressione salvata;
  § 5 misure da rifare con il pool libero; § 11 voce Sigilli; § 13 albero dei Sigilli e segnaposto di `META`; § 15 Sigilli e beneficiari; nuovo **§ 16 Sigilli e albero dei potenziamenti**).
  Corretto il refuso “scegliibile” → “sceglibile”. Aggiunti da Claude: § 5 numeri della prima misura con il pool libero; § 11 decisione aperta
  “Difficoltà con il pool libero”; § 16 dove stanno blocchi e controlli nel codice.
- **Carte bloccate dal livello 1** (`app/index.html`): nuova tabella `TREE_LOCKS` (guardiano e 11 torrette, come la tabella del § 16) e funzione `locked`;
  `eligible` non propone le carte bloccate (anche i level up), `comboReady` non accetta una combo la cui voce chain è bloccata
  (Colpi ramificati, Mira amplificata, Mini-drone di scorta, Colpo caricato). Nuovo campo `META.unlocked` (`{ sky: ["burn1", …] }`), dove scriverà l’albero;
  oggi vuoto, quindi **in gioco si usa il pool libero**. Commento di `META.domeAbilities`: rigenerazione e repulsione sono segnaposto diversi dal § 16 (non sostituiti: i numeri delle nuove abilità sono ancora da decidere).
- Salvataggio: **formato invariato** (`SAVE_VERSION` resta 1): i Sigilli non sono ancora salvati. Andrà alzato quando arrivano saldo, nodi e premi riscossi (§ 4).
- `APP_VERSION` e `VERSION` di `sw.js`: 1.4.0. `ASSETS` invariato.
- **Test**: `tests/rev2.js`, nuova parte “Pool libero”: per ogni entità controlla che le voci bloccate esistano; la forma dei blocchi (una chain intera da 3 voci,
  un lv2 dell’altra chain, un level up lv2; il guardiano anche il level up lv1); nessuna carta standard bloccata; ogni voce chain libera di lv N > 1 ha una voce libera di lv N−1
  (quindi ogni lv3 ha un lv2 libero); level up liberi almeno 2-1-1 per le torrette e 1-1-1 per il guardiano (Colpo pesante è bloccato per decisione del § 16);
  che con il solo pool libero si arrivi al lv3 con 12 potenziamenti (20 prove con scelte a caso) e che una carta bloccata non venga mai offerta; che sbloccate in `META.unlocked` tornino disponibili.
  Provato al contrario: con un level up lv1 bloccato al posto del lv2 il controllo fallisce. `tests/combo.js`: nuovo caso “chain non sbloccata” per ogni combo
  e controllo che le combo bloccate siano proprio Thunderbolt, Beam, Firewheel Drone e Teslacoil; gli altri casi ora sbloccano la chain in `META.unlocked`.
- **Strumenti**: `calib2.js` accetta numero di partite per bot e primo seme (`node tests/tools/calib2.js <livelli> [sostituzioni] [partite] [seme]`; nel commento la sostituzione per il pool completo);
  `l30.js` accetta il numero di partite per bot.
- **Bilanciamento** (stessi bot e semi, pool libero → completo; 120 partite, 800 sui muri 10, 20, 30): 1 100% → 100% · 5 95,0% → 95,8% · 8 49,2% → 51,7% ·
  **10 9,9% → 11,9%** · 11 83,3% → 89,2% · 15 76,7% → 76,7% · **20 18,1% → 37,1%** · 25 50,8% → 55,8% · **30 4,9% → 22,3%**.
  `l30.js` (pool libero, 800 partite): al 20 arrivano all’ondata 20 in 469 e vincono 145; al 30 arrivano 404 e vincono 39: il muro è il boss finale.
  Il pool completo al 10 dà di nuovo 11,9%, come la misura della revisione torri 2 (stessi semi). Nessun numero della difficoltà cambiato.

Test: `npm test`, 26 test, tutti verdi. Screenshot non rifatti: nessuna schermata cambiata.

Catalogo grafico: rigenerato → docs/catalogo-grafico.html (disegni non cambiati: si rigenera perché è cambiato l’hash di `index.html` e `sw.js`).

Checklist: nuove voci “Sigilli e albero dei potenziamenti (§ 16): costi, livelli dei nodi, tetti, nodi della barriera, rimborso”, “Carte bloccate (§ 16):
rivedere la tabella di Claude”, “Difficoltà con il pool libero: muri al 20 (18%) e al 30 (5%) da decidere (§ 5, § 11)”; togliere “Da quando cadono i Sigilli”
(deciso: dal livello 31).

## 1.3.0 — catalogo grafico e disegno in un modulo condiviso

Decisioni di Marco: pagina che riusa il codice di disegno, rigenerazione automatica, aggiornamento sempre dichiarato qui.
Percorso, comando e test proposti da Claude e accettati.

- **Disegno estratto in `app/draw.js`**: primitive, `TURRET_ART`, `drawTurret`, guardiano, `drawEnemy`, `STATUS_ICONS`/`statusIcon`/`drawStatus`,
  cupola, suolo, fortezza, HUD, avvisi, schermate (menu, carte, ricompensa, pausa, vittoria, sconfitta), `draw()`. I disegni di proiettili ed effetti,
  prima scritti dentro la logica di ogni torretta, sono ora funzioni di `FX` (22: `ring`, `bolt`, `zone`, `missile`, `laserRays`, …, `guardBullet`);
  l’entità chiama `FX.<nome>(this, …)` nel suo `draw()`. Anche `ballLightning`, `thunderDraw`, `teslaDraw`; nuove funzioni `drawCrosshair` e `drawFloater`
  (stesso disegno di prima, separato per poterlo mostrare da solo).
  Collegamento: `index.html` valuta il testo di `FORTRESS_DRAW` nel proprio ambito (`const DRAW = eval(…)()`), così il codice di disegno è rimasto
  identico riga per riga e legge lo stato del gioco come prima. Nessun cambio di aspetto o di comportamento.
- `sw.js`: `./draw.js` aggiunto ad `ASSETS` (`swtest.js` ora si aspetta 8 file); `APP_VERSION` e `VERSION` 1.3.0. `CACHE` invariata (dipende da `VERSION`).
- **Generatore** `npm run catalog` (`tests/tools/catalog.js`) → `docs/catalogo-grafico.html`, fuori da `app/` (non va nella cache della PWA).
  Pagina unica, nessuna dipendenza: incorpora `draw.js`, lo script del gioco, CSS e markup di schermata iniziale e salvataggio, le 4 icone come data URI.
  Contiene: vincoli per chi propone modifiche; 19 schermate (13 del canvas, 3 stati della schermata iniziale, 3 del salvataggio con confirmBox ed errore);
  11 torrette e guardiano con id, tipo, funzioni, dimensioni misurate e colori; 7 aspetti di nemico, mini-boss e boss finale nei 5 tipi, colpito,
  barra della vita, 6 indicatori e distruzione da 1 a 5 pile; ogni funzione `FX` animata da sola (con chi la usa) e una scena per torretta, guardiano
  e combo; carte Standard, Chain, Level up, Combo, Nuova torretta e ricompensa; scena di prova con 4 torrette e 20 nemici; palette; sezione
  “Da aggiungere” (Ranger, equipaggiamento, Moduli); il codice di `draw.js`; hash, versione e data. Le scene sono il gioco vero in iframe,
  con orologio comune (play/pausa, +1 e +10 fotogrammi, rallentatore, riavvio). Prima di scrivere, il generatore fa girare ogni scena in jsdom
  e si ferma se c’è un errore. Riscrive il file solo se l’hash dei file è cambiato (`--force` per rifarlo comunque).
- **Aggiornamento automatico**: `pretest` lancia il generatore prima di `npm test`; nuovo test `tests/catalog.js`: fallisce se l’hash scritto nel catalogo
  non è quello dei file attuali (tutti i file di `app/` e il generatore) o se manca una voce di `TURRETS`, `TURRET_ART`, `ENEMY_DEFS`, `STATUS_ICONS`,
  `FX`, `TYPES` o la scena degli effetti di una torretta. Provato anche al contrario: con `draw.js` cambiato e con due voci tolte fallisce.
- Test: `tests/src.js` incorpora `draw.js` in `index.html` per jsdom (usato da `bot.js`, `savetest.js`, `splash.js`, `screens.js`).
- `npm run screenshots`: aggiunte 7 schermate (13 battaglia con 4 torrette e 20 nemici, 14 mini-boss, 15 boss finale, 16 carte Standard/Chain/Level up,
  17 annuncio dell’ondata, 18 vittoria, 19 sconfitta).
- DESIGN.md § 13: tolta la voce 'schermata iniziale' (già costruita nella 1.2.0); aggiunta la voce 'catalogo grafico', poi tolta anche questa
  perché il catalogo è completo e il test è verde. § 14: voce “Catalogo grafico”. CLAUDE.md: `draw.js` nella struttura e nell’architettura,
  regola 9 (catalogo da controllare e rigenerare). DEPLOY.md: `draw.js` nell’elenco dei file.

Confronto degli screenshot (seed e orologio fissi): le 19 schermate, prese prima dell’estrazione e rifatte dopo, sono **identiche byte per byte**;
l’unica differenza è `01-menu.png`, per la scritta “v1.3.0” (con la versione riportata a 1.2.0 il file torna identico).

Test: 25 esistenti + `catalog.js`, tutti verdi (`npm test`, 26). Catalogo aperto in un browser: 40 scene e 69 tessere senza errori.

Catalogo grafico: rigenerato → docs/catalogo-grafico.html (versione 1.3.0, hash b7ea2f39b599be21…, 13/11/2026).

Checklist: nuova voce “Catalogo grafico: quando cambia la grafica, controllare la pagina e passarla alle altre IA (§ 14)”;
togliere, se c’è, “Schermata iniziale con controllo aggiornamenti” tra le cose da costruire (§ 13).

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
