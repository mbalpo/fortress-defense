# Fortress Defense — istruzioni per Claude Code

Tower defense personale di Marco, PWA offline ispirata a *Galaxy Defense: Fortress TD* (grafica e testi originali).
**Lingua: italiano** per tutto: testi del gioco, commenti, messaggi, documenti, commit.

## Prima di tutto
- Leggi `docs/DESIGN.md`: è la fonte di verità delle decisioni. Non contraddirlo. Se una richiesta cambia una decisione, aggiorna DESIGN.md nello stesso lavoro.
- Non inventare contenuti di design (potenziamenti, nemici, regole) senza chiedere. Se servono per non lasciare buchi, segnali come provvisori
  (flag `prov` nei level up, “provvisorio” nei testi) e scrivilo in DESIGN.md e nel changelog.
- Le decisioni di design si prendono anche nel progetto su claude.ai: Marco può portarti testo pronto da inserire in DESIGN.md.

## Struttura
- `app/` — cartella da pubblicare: `index.html` (il gioco, nessuna dipendenza), `draw.js` (il disegno), `draw-hd2d.js` (la grafica HD-2D, solo le differenze), `manifest.json`, `sw.js`, icone.
- `docs/` — `DESIGN.md`, `CHANGELOG.md`, `DEPLOY.md`, `PROGETTO-claude-ai.md`, `catalogo-grafico.html` (generato: `npm run catalog`).
- `tests/` — test automatici (jsdom) e `run.js`; `tests/src.js` dà ai test `index.html` con `draw.js` e `draw-hd2d.js` incorporati (`gameHtml(file, "hd2d")` impone la grafica HD-2D);
  `tests/tools/` — calibrazione, screenshot, catalogo grafico, generatore degli elenchi di DESIGN.md.

## Architettura di `app/index.html` (in ordine)
Subito dopo `ctx`: `const DRAW = eval("(" + FORTRESS_DRAW + ")")()` innesta `draw.js` nell’ambito del gioco (le sue funzioni vedono lo stato senza riceverlo).
DATI (`TYPES`, `RESIST`, `ENEMY_DEFS`, `waveSpec`, `CAMPAIGN`, `LV`/`effD`, `bossDef`, `finalBossHp`, `META`) → POTENZIAMENTI (`S`/`C`/`L`/`K`, `PLAYER_DEF` con le combo,
`TURRETS` con `ups`) → STATO → STATI E DANNO → TORRETTE (una funzione per torretta, tabella `BEHAV`) → GUARDIANO (`PLAYER`, `FRENZY`, `playerTick`, `playerBullet`; combo con `comboOn`, `guardProc`) →
MOTORE DEI POTENZIAMENTI (`eligible`, `rollOptions`, `describe`, `pick`) → LOGICA (`startRun`, `startWave`, `spawn`, `update`, `endWave`) →
INPUT → SALVATAGGIO → avvio.
`app/draw.js` (DISEGNO): primitive (`txt`, `segs`, `button`, `disc`, `glow`, `poly`), `TURRET_ART`, `drawTurret`, guardiano, `drawEnemy`, `STATUS_ICONS`,
proiettili ed effetti in `FX` (le entità della logica chiamano `FX.<nome>(this, …)` nel loro `draw()`), HUD, avvisi, schermate. Solo disegno, nessuna regola. Schermata iniziale (controllo aggiornamenti, “Start”) e registrazione del service worker stanno in un secondo `<script>`.
- Canvas logico 360×640. Testi con `txt()`, testi a colori con `segs()`, pulsanti del canvas con `button()` (si attivano su `pointerdown`).
- Due grafiche (1.13.0): `draw.js` è la classica e contiene tutto; `draw-hd2d.js` (`FORTRESS_DRAW_HD`) contiene solo le differenze HD-2D e alla fine di
  `FORTRESS_DRAW` viene valutata nello stesso ambito se nel menu è scelta “Grafica: HD-2D” (sostituisce funzioni assegnandole, aggiunge voci a `TURRET_ART`/`FX`).
  Punti di aggancio in draw.js: `drawSky`, `drawWorld`, `drawMenuBack`, `enemyBody`, `enemyBar`, `bossBar`, `frenzyBar`, `menuTitle`, `cardBadge`.
  Schermate, testi e carte si scrivono una volta sola in draw.js; un disegno nuovo (torretta, nemico, effetto) va fatto anche in draw-hd2d.js,
  altrimenti in HD-2D si vede quello classico. Catalogo HD-2D: `npm run catalog-hd2d`; schermate di prova: `node tests/tools/hd2d-shots.js`.
- Nuova torretta: voce in `TURRETS`, funzione di tiro in `BEHAV`, disegno in `TURRET_ART` (draw.js e draw-hd2d.js), proiettili in `FX`; poi DESIGN.md (`npm run design-lists`)
  e, se serve, potenziamenti da mostrare nella sua scena del catalogo (`FX_UPS` in `tests/tools/catalog.js`).
- Nuovo potenziamento: voce `S`/`C`/`L` nella lista `ups` (`C` con catena e livello, `L` con livello) e uso con `has(s, id)` / `N(s, id)`.
- Nuova combo del guardiano: voce `K` in `PLAYER_DEF.ups` (torretta, condizione: livello o voce chain, livello del guardiano) e uso con `comboOn(p, id)`.
- Comandi che aprono file, condivisione o appunti: usare elementi HTML veri (come il pannello Salvataggio): su touch `pointerdown` non vale come gesto dell’utente.

## Regole di lavoro
1. Prima di consegnare: `npm test`, tutti verdi. I test modificano il sorgente con sostituzioni di stringhe: se cambi un frammento usato da un test,
   aggiorna il test. Mai togliere o indebolire un controllo per farlo passare: se un test fallisce, prima capisci se è un bug.
2. Interfaccia: `npm run screenshots` e guarda le immagini in `tests/screenshots/` (testi fuori dai bordi, sovrapposizioni).
3. Bilanciamento: misura con `node tests/tools/calib2.js <livelli>` o `node tests/tools/l30.js <livello>` su campioni grandi
   (almeno 60 partite per livello: con meno il rumore è circa ±7 punti). Riporta i numeri in DESIGN.md § 5.
4. Testi del gioco: apostrofo tipografico ’ e virgolette “ ”; decimali con la virgola; controlla che stiano nei 360 px.
5. Salvataggio: non rompere la compatibilità. Se cambia il formato alza `SAVE_VERSION` e gestisci la migrazione in `parseSave`.
6. Ogni lavoro finisce con una voce in `docs/CHANGELOG.md`: cosa è cambiato, test eseguiti, e “Checklist”: voci da aggiungere o togliere
   nella checklist su claude.ai (Marco la porta al progetto).
7. Pubblicazione: alza `APP_VERSION` e `VERSION` in `sw.js` (stesso numero, `swtest.js` lo controlla); se cambia l’elenco dei file in `app/`, aggiorna `ASSETS`. Vedi `docs/DEPLOY.md`.
8. Git: un commit per lavoro, messaggio in italiano.
9. Quando aggiungi o cambi una torretta, un nemico, uno stato, un effetto o una schermata: controlla che compaia nel catalogo e fai girare `npm run catalog`
   e `npm run catalog-hd2d`.
   Nel CHANGELOG scrivi “Catalogo grafico: rigenerato → docs/catalogo-grafico.html” oppure “Catalogo grafico: non cambiato”.
