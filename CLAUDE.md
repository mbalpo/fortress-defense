# Fortress Defense — istruzioni per Claude Code

Tower defense personale di Marco, PWA offline ispirata a *Galaxy Defense: Fortress TD* (grafica e testi originali).
**Lingua: italiano** per tutto: testi del gioco, commenti, messaggi, documenti, commit.

## Prima di tutto
- Leggi `docs/DESIGN.md`: è la fonte di verità delle decisioni. Non contraddirlo. Se una richiesta cambia una decisione, aggiorna DESIGN.md nello stesso lavoro.
- Non inventare contenuti di design (potenziamenti, nemici, regole) senza chiedere. Se servono per non lasciare buchi, segnali come provvisori
  (flag `prov` nei level up, “provvisorio” nei testi) e scrivilo in DESIGN.md e nel changelog.
- Le decisioni di design si prendono anche nel progetto su claude.ai: Marco può portarti testo pronto da inserire in DESIGN.md.

## Struttura
- `app/` — cartella da pubblicare: `index.html` (tutto il gioco, nessuna dipendenza), `manifest.json`, `sw.js`, icone.
- `docs/` — `DESIGN.md`, `CHANGELOG.md`, `DEPLOY.md`, `PROGETTO-claude-ai.md`.
- `tests/` — test automatici (jsdom) e `run.js`; `tests/tools/` — calibrazione, screenshot, generatore degli elenchi di DESIGN.md.

## Architettura di `app/index.html` (in ordine)
DATI (`TYPES`, `RESIST`, `ENEMY_DEFS`, `waveSpec`, `CAMPAIGN`, `LV`/`effD`, `bossDef`, `finalBossHp`, `META`) → POTENZIAMENTI (`S`/`C`/`L`/`K`, `PLAYER_DEF` con le combo,
`TURRETS` con `ups`) → STATO → STATI E DANNO → TORRETTE (una funzione per torretta, tabella `BEHAV`) → GUARDIANO (`PLAYER`, `FRENZY`, `playerTick`, `playerBullet`; combo con `comboOn`, `guardProc`) →
MOTORE DEI POTENZIAMENTI (`eligible`, `rollOptions`, `describe`, `pick`) → LOGICA (`startRun`, `startWave`, `spawn`, `update`, `endWave`) →
DISEGNO (`TURRET_ART`, `drawEnemy`, indicatori, HUD, menu, pausa, avvisi) → INPUT → SALVATAGGIO → avvio. Il service worker si registra in un secondo `<script>`.
- Canvas logico 360×640. Testi con `txt()`, testi a colori con `segs()`, pulsanti del canvas con `button()` (si attivano su `pointerdown`).
- Nuova torretta: voce in `TURRETS`, funzione di tiro in `BEHAV`, disegno in `TURRET_ART`; poi DESIGN.md (`npm run design-lists`).
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
7. Pubblicazione: alza `APP_VERSION`; se cambiano i file in `app/`, aggiorna `ASSETS` e `CACHE` in `sw.js`. Vedi `docs/DEPLOY.md`.
8. Git: un commit per lavoro, messaggio in italiano.
