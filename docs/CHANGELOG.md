# Changelog

Ogni voce: cosa è cambiato, test eseguiti, voci della checklist da aggiornare su claude.ai.
Da questa versione ogni voce dice anche se il catalogo grafico è stato rigenerato.

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
