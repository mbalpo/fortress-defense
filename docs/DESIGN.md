# Planet Defense — documento di design

Fonte di verità per tutte le decisioni sul gioco. Va aggiornato **ogni volta** che una decisione cambia,
sia in Claude Code (insieme al codice) sia nel progetto su claude.ai (che prepara le modifiche da riportare qui).

Le sezioni marcate *(generato)* si rigenerano dal codice con `node tests/tools/design-lists.js`:
se codice e documento divergono, prima si capisce quale dei due è giusto, poi si allinea l’altro.

Legenda: **[deciso]** scelto da Marco · **[Claude]** valore scelto da Claude, accettato · **[da rivedere]** valore di Claude ancora aperto ·
**[provvisorio]** contenuto inventato per non lasciare buchi, da sostituire.

---

## 1. Visione

- Clone personale, solo offline, di *Galaxy Defense: Fortress TD* (CyberJoy Games): solo le parti che piacciono, niente funzioni online,
  niente clan, niente attività obbligatorie. Tema: difesa della Terra dallo spazio. Grafica, nomi e testi sono originali. **[deciso]**
- Gioco a livelli di campagna: si superano livelli da 20 ondate, in modalità Standard o Epica. **[deciso]**
- Piattaforma: PWA installabile sul telefono, gioco in verticale, offline. **[deciso]**

## 2. La partita

- Schermo logico 360×640, sempre in verticale. In basso il suolo, sopra la **cupola** (semi-ellisse con raggio orizzontale 215 px, più larga dello schermo: esce di 35 px per lato e la sua partenza non si vede; alta 95 px al centro e circa 52 px ai bordi dello schermo) che protegge
  guardiano e torrette. In fondo la barra della vita della cupola. **[deciso]** (altezza ridotta su richiesta; allargata perché i nemici laterali non arrivino al suolo) · 215 px **[Claude]**
- **20 ondate** per livello. Dopo ogni ondata, tranne l’ultima, si sceglie **1 carta tra 3** pescate a caso: **19 scelte per partita**. **[deciso]**
- Si parte **senza torrette**: le torrette escono come carte e vanno nel **primo dei 4 slot fissi** liberi (al massimo 4 torrette). Dal livello 31, le torrette sbloccate con i Sigilli si possono equipaggiare prima dell’ondata 1 (§ 16). **[deciso]**
- I nemici scendono dall’alto; a contatto con la cupola si fermano e la colpiscono ogni 1,2 s. Cupola a 0 = partita persa. **[Claude]**
- **Guardiano** (prima chiamato “personaggio”): si muove sul suolo trascinando e spara da solo. Mentre si tiene premuto in un punto qualsiasi dello schermo (esclusi i pulsanti in alto, pausa e bersaglio) segue il dito in orizzontale; nel punto premuto c’è un **mirino**: se un nemico è entro 45 px dal mirino i colpi lo inseguono (è il bersaglio, quindi valgono anche le combo legate al bersaglio, come la Mira amplificata), altrimenti vanno **dritti in alto**. Al rilascio torna la mira automatica. **[deciso]** (mirino che assegna un bersaglio, rev. 4) · 45 px e comportamento “insegue se vicino” **[deciso]** (scelto da Marco tra le proposte di Claude) Il mirino può assegnare come bersaglio anche il **pacco regalo** (§ 17), l’unico nemico che solo il guardiano in manuale può colpire. **[deciso]**
- **Mira**: nel menu non c’è più la scelta; senza premere è automatica, premendo vale il mirino (punto sopra). Il mirino è tornato anche perché il cambio di modalità sia evidente. Le torrette sparano sempre da sole. **[deciso]**
- **Bersaglio** (torrette e guardiano): “più vicino” o “vita più alta”; il guardiano lo usa quando non si preme. **[deciso]**
- **Portata delle torrette** **[deciso]** (Marco, 1.14.2): si misura sempre dal **centro in basso**, dove parte il guardiano (x 180, y = suolo − 30), anche per le torrette
  laterali; prima era un cerchio intorno a ogni torretta. I colpi partono comunque dalla torretta e “più vicino” resta la distanza dalla torretta **[Claude]**.
- **Raggio d’azione al tocco** **[deciso]** (Marco): un tocco su una torretta mostra per 2 s il suo raggio come una curva rossa semitrasparente, come il profilo della barriera
  (alla base trasparente, in cima più visibile). Un solo raggio alla volta (un nuovo tocco sostituisce il precedente). Un tocco rapido (sotto 0,3 s, meno di 10 px di movimento)
  su una torretta non muove il guardiano; la pressione lunga resta come oggi. Vale durante l’ondata e in pausa, non durante la scelta delle carte.
  Portata oltre lo schermo (Sky Guard, Thunderbolt, Laser): niente curva, solo la sfumatura (velo rosso su tutto lo schermo). Gravity Vortex Gun: il raggio mostrato è quello reale
  di partenza, max(portata 260 px, percorso), che cresce con le pile di “Percorso più lungo”. **[deciso]** (Marco)
  Dettagli **[Claude]**: “oltre lo schermo” = raggio effettivo oltre 500 px (con i bonus di portata); sfumatura trasparente in basso e più visibile in alto;
  dissolvenza breve in entrata e in uscita; timer in tempo reale. Costruito nella 1.14.2: tocco valido entro 28 px dal riquadro della torretta; arco con alfa da 0 a 0,6
  (riempimento fino a 0,14), velo fino a 0,32; l’arco è centrato dove parte il guardiano, come la portata; in pausa il raggio si disegna sopra la schermata della pausa.
- **Frenesia** (chain del guardiano): la barra si carica nel tempo e parte da sola; va in pausa se non ci sono nemici a schermo e nessun dito premuto, cioè scorre anche mentre si preme. Una frenesia attiva a fine ondata continua in quella dopo. **[deciso]** (lettura della pressione **[Claude]**)
- **Pausa**: pulsante in alto (o Esc/P), si attiva da sola se si cambia app. Due schede: “Nemici del livello” e “Torri e potenziamenti”.
  “Abbandona” chiede un secondo tocco. **[deciso]**
- **Velocità della partita** (1.14.1) **[deciso]** (Marco): tasto semitrasparente prima del contatore “Nemici”, solo durante l’ondata: **1x → 1,5x → 2x → 1x** a ogni tocco.
  La scelta resta per le ondate e le partite seguenti (impostazioni, `fortress-proto-v1`, campo `speed`). Dettagli **[Claude]**: la logica avanza in passi da al massimo 0,05 s,
  come a 1x, quindi danni, collisioni, cooldown e bilanciamento non cambiano (cambia solo quanto tempo di gioco passa per fotogramma); anche le animazioni accelerano;
  a 1x il tasto è più trasparente, a 1,5x e 2x ha il bordo verde. A 2x il telefono fa il doppio dei calcoli: se scende di fotogrammi, controllare con il contatore fps (tocco sulla versione nel menu).
- **Partita in sospeso e Continua** **[deciso]** (Marco): a ogni inizio ondata (e all’inizio del livello) la partita si salva in una chiave separata del localStorage (`fortress-run-v1`);
  se il sistema scarta l’app in background, il menu mostra **Continua** sopra “Standard”, con livello, modalità e ondata. Il salvataggio contiene livello, modalità, ondata,
  carte prese (anche quelle dei mini-boss), vita della cupola, frenesia, contatori e flag “una volta per partita” (Backup, Modulo 14, Sigillo maggiore già preso dai boss).
  Continua rigioca le carte e riparte dall’inizio dell’ondata interrotta, in pausa: al massimo si perde un’ondata. Si cancella con vittoria, sconfitta e “Abbandona”,
  all’avvio di un’altra partita (avviso a due tocchi “sostituirla?”), con un salvataggio importato e con un `APP_VERSION` diverso. I premi già riscossi non si riscuotono due volte.
  Albero e equipaggiamento sono bloccati finché c’è una partita in sospeso (§ 15, § 16). Scelte di Claude **[Claude] [deciso]**: albero ed equipaggiamento si possono aprire
  in sola lettura, con il messaggio “Partita in sospeso: continua o abbandona per modificare”; i lucchetti restano usabili; le carte dopo l’ondata si estraggono di nuovo, senza salvare il seme.
  Costruita nella 1.14.0. Dettagli **[Claude]**: pulsante “Continua” (con “Livello N · modalità · ondata X/20”) al posto delle due righe di istruzioni; tasto C; il primo tocco
  su Standard/Epica (o Invio/E, o un livello dalla griglia) cambia il pulsante in “Sostituire la partita in sospeso?”, il secondo avvia la nuova partita, un tocco altrove annulla;
  salvati anche i tiri dei Moduli 29 e 30 (guardiano e torrette dal livello 2) e lo stato delle abilità della barriera; il Sigillo maggiore del boss finale vale una volta per partita
  e si scrive subito nel salvataggio, così rigiocando l’ondata non si riprende. Nel menu, accanto alla versione, il tipo di avvio della pagina (“nuova”, “ricaricata”, “indietro”,
  “scartata” se il browser segnala `document.wasDiscarded`) **[Claude]**, per confermare quando il sistema scarta l’app.
- **Nemici scoperti** (per tutta la campagna, salvati sul dispositivo): nella scheda Nemici solo quelli già incontrati, gli altri “sconosciuto”;
  al primo incontro compare l’avviso “Nuovo nemico” (3,5 s, uno alla volta, si ferma in pausa).
  Mini-boss e boss finale si scoprono **tipo per tipo**. **[deciso]**
- **Scelta delle carte**: una carta (o “Continua” della ricompensa) si sceglie rilasciando il dito sulla stessa carta su cui si è premuto; scorrere fuori annulla. Per circa 0,6 s dopo la comparsa della schermata i tocchi sono ignorati (i tasti 1/2/3 restano immediati). **[deciso]** (azione al rilascio e blocco) · 0,6 s **[Claude]**

## 3. Sistema di potenziamenti

- Categorie: **standard**, **chain**, **combo**, **level up**. **[deciso]**
- Ogni torre e il guardiano partono al **livello 1**: 3 potenziamenti (standard, chain o combo), poi serve un **level up** per salire.
  **Livello massimo 3 = 12 potenziamenti** (3 + level up, per 3 livelli). **[deciso]**
- Un level up di livello inferiore resta disponibile ai livelli successivi. **[deciso]**
- **Un level up per entità in ogni offerta**: nella stessa scelta di carte non compaiono due level up della stessa torretta (o del guardiano); level up di entità diverse possono uscire insieme. **[deciso]** (Marco) · estesa al guardiano **[Claude]**
- **Standard**: massimo 3 pile per voce (per torre, non per partita). **[deciso]**
- **Chain**: la voce di livello N richiede una voce di livello N−1 della stessa catena **e la torre al livello N**. **[deciso]**
- Obiettivo di contenuto per ogni torre e per il guardiano: **2 chain**, una da **1 voce lv1, 2 lv2, 1 lv3** e una da **1 lv1, 1 lv2, 1 lv3**;
  **2 level up a lv1 e a lv2** (lv3 almeno 1). **[deciso]** (rivisto: prima entrambe le chain avevano 2 voci lv2)
- Comportamento base confermato: la **Sky Guard non brucia** senza potenziamenti (la bruciatura arriva dalla chain Bruciatura e dai level up);
  il **campo del Disruption Drone rallenta** di base. **[deciso]**
- **Combo**: una sola carta per coppia. È una carta da scegliere e costa una scelta. **[deciso]**
- **Combo del guardiano**: una per torretta (11), definite da Marco. Contano come **scelte del guardiano**. La carta esce solo se la torretta
  è in campo e la condizione è soddisfatta: **torretta al livello 2** oppure **chain della torretta scelta** (la voce lv1) **con il guardiano al livello 2**.
  “Colpo” = una salva del guardiano (un tiro di probabilità per salva, così “+1 proiettile” e Ventaglio non moltiplicano l’effetto);
  “proiettile” = ogni singolo proiettile. Elenco in § 8. **[deciso]** (valori **[da rivedere]**, § 10)
- **Combo tra due torrette** (33): coppie, effetti e condizioni **[deciso]** (Marco; coppie proposte da Claude e accettate). Ogni torretta è “principale” in 3 combo
  e compare 6 volte in tutto (3 da principale e 3 da secondaria); nessuna coppia dello stesso tipo, nessuna coppia invertita. Elenco e valori in § 10 (e in § 8, generato). Regole:
  - **Condizione**: la principale deve essere almeno al livello 2; la secondaria deve essere in campo e avere la voce lv1 della chain indicata. Le voci successive di quella
    chain valgono per la combo se la secondaria le ha prese. **[deciso]**
  - **Danno**: dove non specificato, quello della torretta secondaria. **[deciso]** (il tipo di danno segue la secondaria **[Claude] [da rivedere]**)
  - **Frequenza** delle armi continue (Laser, Beam, Firewheel, campo del Disruption Drone): un solo tiro di probabilità per bersaglio, per raggio, per passaggio del drone o per campo. **[deciso]**
  - **Tetti**: al massimo 5 a schermo per buchi neri, droni dell’Hive, mini-droni, wormhole e laser rotanti. **[deciso]** (ogni tetto vale per la sua combo, senza condividerlo con
    la torretta o con altre combo **[Claude] [da rivedere]**)
  - **Scelta**: la combo conta come scelta della torretta principale. **[deciso]** (Marco)
- **Combo e carte bloccate**: le combo del guardiano che richiedono la voce lv1 di una chain (Thunderbolt, Beam, Firewheel Drone, Teslacoil) possono uscire solo dopo che quella chain è stata sbloccata con i Sigilli (§ 16). Disruption Drone e Aeroblast usano una chain che resta libera. **[deciso]** La stessa regola vale per le combo tra due torrette: la carta esce solo se la chain della secondaria è sbloccata. 18 combo su 33 usano una chain bloccata, quindi fino al livello 30
  (pool libero) sono raggiungibili solo le altre 15. **[deciso]** (Marco)
- **Segno delle carte chain e level up** (1.12.5) **[deciso]** (Marco): sopra il pallino col numero (o la spunta della ricompensa), nel colore del tipo:
  chain = una catena verticale per livello della chain (due affiancate al lv2, tre al lv3); level up = una freccia ^ per livello, una sotto l’altra.
  Standard, combo e nuova torretta senza segno. Disegno **[Claude]**.
- **Probabilità** delle carte (pesi): standard 1, chain 0,4, combo 0,4, level up 2, nuova torretta 3 (1,5 con già 2 torrette). **[deciso]** (numeri **[Claude]**)
- Le carte “+1 proiettile/sfera/drone/rimbalzo” tolgono il 15% (o il 20%) di danno per pila. **[deciso]**

## 4. Campagna e progressione

- La campagna arriva **almeno al livello 200** (Marco; oggi `CAMPAIGN.maxLevel` = 200, si può allungare); si selezionano i livelli fino a “completati + 1”. Il livello di difficoltà D è il numero del livello in Standard. **Epica**: numerazione e avanzamento propri, indipendenti da Standard. Si apre dopo il 50 di Standard;
  il **livello 1 di Epica ha difficoltà 31** (D = livello di Epica + 30) e si selezionano i livelli di Epica fino a “Epica completati + 1”. **[deciso]** (Marco)
  Salvataggio: nuovo campo `clearedEpic`, `SAVE_VERSION` +1; in migrazione, i livelli di Epica già fatti si ricavano dalle chiavi `e…` dei premi riscossi. **[Claude]**
  Menu (1.14.2) **[Claude]**: il selettore (−/+, frecce, griglia) vale per la **modalità attiva**, che si cambia con la striscia “Standard ⇄ Epica” in fondo al riquadro del livello
  (dal 50), con la scheda della griglia o giocando; i pulsanti “Standard · livello N” ed “Epica · livello M (diff. D)” avviano ciascuno il proprio livello; dopo una vittoria in Epica c’è “Livello M+1”.
- **Tetto di livello** di torri e guardiano, in base ai livelli completati: lv1 fino al 10, **lv2 dopo il 10**, **lv3 dopo il 20**. **[deciso]**
- Sblocchi a fine livello: 10 → lv2, 20 → lv3, **30 → equipaggiamento** (testa, armatura, guanti, stivali, arma, nucleo),
  **31 → cominciano a cadere i Sigilli e si apre l’albero dei potenziamenti** (§ 16), **40 → abilità della barriera** (fino a 3; ramo abilità dell’albero, con la scheda Abilità bloccata da un overlay fino a quel livello),
  **50 → Epica**, **60 → Ranger e Protezione planetaria** (§ 17) **[deciso]**. **Pacco regalo** da **Standard 61 ed Epica 31** (§ 17) **[deciso]**. Equipaggiamento (1.10.0, § 15), albero e abilità della barriera (fasi 1-3, § 16) sono costruiti. **[deciso]**
- **Avviso di sblocco**: al primo completamento in Standard dei livelli 10, 20, 30, 31, 40 e 50 compare, sopra la schermata di vittoria, un avviso con ciò che si è sbloccato;
  si chiude solo a mano (“Ho capito”, Invio o Esc) e finché è aperto i pulsanti della vittoria non rispondono. Al 30 l’avviso spiega che l’equipaggiamento cade a ogni vittoria. **[deciso]** · testi degli avvisi **[Claude]**
- **Mini-boss** (nave aliena) alle ondate 5, 10, 15: dal livello 11 in Standard, sempre in Epica. Sconfitto, dà **3 carte a caso applicate subito**
  (schermata di riepilogo). Tipo di danno variabile per ondata e livello. **[deciso]**
- **Boss finale** (nave madre) all’ondata 20 dei livelli multipli di 10, con barra della vita grande in alto; il livello finisce quando muore. **[deciso]**
- Boss e mini-boss: **sempre immuni** a paralisi, attrazione e teletrasporto; **resistenza variabile** a knockback e stati
  (riduce l’intensità, non la durata). **[deciso]** (valori **[da rivedere]**, § 10)
- Fino a difficoltà 10 solo nemici “piccoli” (niente asteroidi). **[deciso]**
- Budget di scelte: 19 per partita, **28 dal livello 11** con i 3 mini-boss. Servono 19 scelte per riempire tutto al tetto lv1, 39 al tetto lv2,
  64 al tetto lv3 (4 torrette + guardiano). Massimizzarne 2 richiede almeno 26 scelte, 3 almeno 39. **[deciso]**
  **Nessun limite di torri al livello 3** (1.10.1, Marco): tolta la regola “al massimo 2 tra torri e guardiano al massimo” (era già spenta nel codice) e le scelte saltate
  per le torrette equipaggiate: le carte si scelgono dopo ogni ondata anche con torrette equipaggiate, che quindi si aggiungono al budget. **[deciso]**
- Progressione salvata sul dispositivo: livelli completati, nemici scoperti, Sigilli (saldo, livelli dei nodi, premi già riscossi per livello e modalità); impostazioni (bersaglio) a parte. Il formato cambia: alzare `SAVE_VERSION` e gestire la migrazione (§ 7). **[deciso]**

## 5. Difficoltà e calibrazione

- Formule (in `app/index.html`, sezione CAMPAGNA):
  - vita dei nemici: `levelHp(D)` = 0,42 + 0,08·(D−1) fino a D=10, poi +0,02 per livello (valori in `LV`);
  - difficoltà effettiva `effD`: piena fino a 20, al **30%** tra 20 e 30 (la potenza del giocatore è ferma fino al boss del 30),
    dal 31 sale di **1,2 per livello con uno scalino di 3** (`EFF_SLOPE_31`, `EFF_JUMP_31`, dalla 1.12.1; al 200 effD = 230; 1.11.0: 0,8 e 2, effD 161; prima 0,2 senza scalino, effD 57). Prima era piena dal 31: con l’albero dei Sigilli che dà 1-2 Sigilli per livello
    i bot vincevano il 3% al 40. Tarata con `tests/tools/curva.js` (vedi sotto) **[Claude]**;
  - danno, velocità e numero dei nemici salgono piano con `effD`; dentro il livello ogni ondata aggiunge +9% di vita;
  - mini-boss: vita 480, danno 9; boss finale: vita base 400 al 10, 2250 al 20, 1450 al 30; dal 40 1450 × (1 + 1,5 · n^0,35) con n = decine dopo il 40 (1450 al 40, 3625 al 50, 5522 al 100, 7190 al 200; coefficiente 1,1 nella 1.7.0, 1,5 dalla 1.8.0 con le abilità), per un fattore del singolo muro (`FINAL_BOSS_K`, dalla 1.12.1: 40 ×1,2, 60 ×0,6, 80 ×1,3, 90 ×0,6, 100 ×0,65 (dalla 1.14.2; era ×0,75), 120 ×1,15, 130 ×1,15, 170 ×1,5, 190 ×0,75) **[Claude] [provvisorio]**, danno 8 (`FINAL_BOSS_HP`, `finalBossHp`);
    al livello 10 anche i nemici normali hanno il 93% della vita (`WALL_ENEMY_HP`); al 50, dalla 1.14.0, l’85% e il boss finale ×0,6 (`FINAL_BOSS_K`, § 16) **[deciso]** (Marco). Tarati sul pool libero (vedi sotto). **[Claude]** (obiettivo del 30% **[deciso]**)
- Metodo: bot che giocano partite intere (`tests/tools/calib2.js`, `l30.js`), con scelte casuali o con una strategia semplice.
  Con meno di 60 partite per livello il rumore è di circa ±7 punti: usare campioni grandi prima di cambiare i numeri.
- Esito attuale (vittorie dei bot): livelli 1-5 100% · 8 circa 40-60% · **10 circa 25-30% (muro)** · 11-15 circa 60-80% (sollievo dopo lo sblocco) ·
  **20 circa 32-37%** · 25 circa 40-50% · **30 circa 23-25%**. Muri ai multipli di 10, respiro in mezzo. **[deciso]**
- Dopo la revisione torri 1 (stessi bot, 120 partite per livello; 800 al 10 e al 30): 1 100% · 5 96% · 8 61% · **10 13,8%** (prima 14,0%) · 11 91% ·
  15 84% · **20 40%** · 25 61% · **30 17,9%** (prima 20,5%: lieve calo, al limite del rumore). Nessun numero della difficoltà cambiato.
  Nota: con questi bot il livello 10 misura circa 14%, sotto il 25-30% indicato sopra (misura più vecchia, campione più piccolo).
- Dopo la revisione torri 2 (stessi bot): 1 100% · 5 96% · 11 89% · 20 37% (120 partite) · **10 11,9%** e **30 21,4%** (800 partite).
  Confronto diretto con la versione precedente sugli stessi 400 semi: livello 8 dal 61,8% al 57,5%, 15 dall’80,5% al 79,8%, 25 dal 59,5% al 59,0%:
  differenze dentro il rumore. Nessun numero della difficoltà cambiato.
- Dopo le combo del guardiano, confronto diretto con la versione precedente sugli stessi 200 semi (100 per bot): livello 15 dal 76,5% al 77,5%,
  25 dal 55,0% al 58,5%, 30 dal 23,5% al 23,0%: dentro il rumore. I bot scelgono le carte a caso o con regole semplici, e le combo escono di rado
  (peso 0,4 e condizioni), quindi la misura dice poco sulla loro forza vera. Nessun numero della difficoltà cambiato.
- La difficoltà con il tiro verticale (tenendo premuto) **non è misurata**: i bot giocano solo con la mira automatica.
- Le carte bloccate dall’albero (§ 16) valgono dal livello 1: tutte le misure sopra sono state fatte con il pool completo. Vanno rifatte con il **pool libero** (muri al 10, 20 e 30) prima di cambiare i numeri della difficoltà. **[da misurare]**
- Prima misura con il pool libero (1.4.0; stessi bot e stessi semi, pool libero → pool completo; 120 partite per livello, 800 sui muri):
  1 100% → 100% · 5 95,0% → 95,8% · 8 49,2% → 51,7% · **10 9,9% → 11,9%** · 11 83,3% → 89,2% · 15 76,7% → 76,7% · **20 18,1% → 37,1%** ·
  25 50,8% → 55,8% · **30 4,9% → 22,3%**. Al 10 il calo è vicino al rumore; al **20 e al 30 la vittoria si dimezza o crolla**, mentre l’ondata media
  resta quasi uguale (20: 16,9 e 16,9; 30: 15,7 e 16,0): i bot arrivano all’ondata 20 (469 su 800 al 20, 404 al 30) ma non battono il boss finale
  (vincono 145 e 39). Il muro dei boss finali, a tetto lv2 e lv3, dipende dalle carte bloccate. Nessun numero della difficoltà cambiato: decisione aperta (§ 11).
- **Muri al 30%** **[deciso]** (Marco: con il pool libero erano troppo punitivi): i livelli 10, 20 e 30 si devono superare in circa il **30%** delle partite.
  Leve scelte da Claude: vita del boss finale (al 10 ×0,5, al 20 ×0,8, al 30 ×0,5 rispetto a prima) e, solo al 10, vita dei nemici normali ×0,93,
  perché lì si muore anche prima del boss (con il solo boss più debole il 10 restava sotto il 20%). Misura 1.4.1 (pool libero, 800 partite, stessi semi di sopra):
  **10 33,0%** · **20 28,0%** · **30 31,3%** (prima 9,9%, 18,1%, 4,9%); arrivano all’ondata 20: 446, 469, 404 su 800. Il livello 9 misura circa 36% (200 partite):
  il 10 resta un gradino, non un muro più alto. Gli altri livelli non cambiano. In Epica valgono gli stessi numeri per livello (non misurato).
- Dopo la cupola larga e i cristalli più lenti: da rimisurare con gli stessi bot e gli stessi semi i livelli 10, 20 e 30 (800 partite; riferimento 1.4.1: 33,0% · 28,0% · 31,3%), i livelli 8, 15 e 25 (stessi semi dei confronti precedenti) e i muri dal 40 al 200 con `tests/tools/curva.js` (200 partite per muro; riferimento 1.8.0: media 31,1%). L’obiettivo del 30% per i muri è **[deciso]**: se la misura se ne allontana, decide Marco prima di cambiare i numeri. Esiti (1.9.0, stessi bot e stessi semi, confronto diretto con la 1.8.0 → 1.9.0): **10 32,0% → 32,6%** · **20 28,9% → 29,9%** · **30 31,8% → 29,0%** (800 partite; semi 1-400 per bot);
  8 56,0% → 59,8% · 15 78,8% → 75,2% · 25 55,8% → 54,8% (400 partite; semi 1-200 per bot); muri dal 40 al 200 (200 partite per muro, semi 1-100) media **30,9% → 32,1%**,
  da 15,5% (140) a 49,0% (120); differenza più grande al 70 (33,5% → 41,0%). Tutte le differenze sono dentro o vicine al rumore (±5-7 punti con 200-400 partite):
  i muri restano intorno al 30%. Nessun numero della difficoltà cambiato. **[Claude]** (misura)
- Dopo il disegno nuovo del guardiano (1.9.3: i colpi partono dalla bocca del cannone, 26 px più in alto e 7 px a destra; anche il clone specchia le salve dalla 1.9.2), stessi semi: **10 35,8%** · **20 27,5%** · **30 32,9%** (800 partite; 1.9.0: 32,6% · 29,9% · 29,0%). Scarti di 2-4 punti, al limite del rumore; muri ancora intorno al 30%. Nessun numero della difficoltà cambiato.
- Con un level up lv1 bloccato in più per torretta (1.9.4), stessi semi: **10 35,8%** · **20 33,0%** · **30 34,9%** (800 partite). Nessun numero della difficoltà cambiato.

## 6. Nemici, stati e interfaccia dei nemici

- Aspetto a tema spaziale; il colore indica il tipo di danno (serve per leggere resistenze e debolezze). **[deciso]**
- Stati: rallentamento −50% velocità · bruciatura (danno nel tempo) · vulnerabilità +25% danno subito (a volte solo fisico) ·
  indebolimento −35% danno inflitto · paralisi (fermo) · distruzione −10% danno inflitto per pila (3 pile, 5 con la chain; 5 s). **[Claude]**
- Indicatori sopra i nemici: freccia viola = rallentamento, fulmine giallo = paralisi, cerchio con meno = indebolimento,
  mirino rosso = vulnerabilità, fiamma arancione = bruciatura, linee ondulate (una per pila) = distruzione. **[deciso]**
- La tabella delle resistenze (× 0,5 al proprio tipo, ×1,5 a un altro) è un **segnaposto** di Claude: **da decidere** (§ 11).

- **Griglia dei livelli** (1.12.3) **[deciso]** (Marco: griglia, Standard/Epica, Sigilli presi; impaginazione **[Claude]**): toccando “Livello N” nel menu si apre una griglia
  di 50 livelli per pagina (1-50, 51-100, …), con Standard/Epica in alto; ogni livello mostra due rombi (Sigillo del primo completamento e premio della cupola al 100%; pieno = preso),
  i muri in giallo, i livelli non ancora giocabili spenti; il filtro “Solo i livelli con Sigilli da prendere” spegne gli altri. Un tocco sceglie, un secondo tocco (o “Gioca”) parte.
- **Guida** (1.12.3, menu → “Guida”) **[deciso]** (le pagine) · contenuti **[Claude]**: scheda “Stati dei nemici” (icone, effetti e valori, altri effetti senza icona, resistenza dei boss);
  scheda “Carte”: guardiano e 11 torrette, con statistiche di base e tutte le carte (categoria, blocco nell’albero, descrizione, effetto per pila delle standard con il nodo dell’albero).
  L’elenco scorre trascinando il dito. Descrizioni estese delle carte: per ora quelle brevi del gioco più i valori; testi più lunghi da scrivere con Marco.
- **Potenziamenti presi dalla scelta delle carte** (1.12.3) **[deciso]**: pulsante “Potenziamenti presi” sotto le carte e nella ricompensa del mini-boss (tasto B): la vista
  “Torri e potenziamenti” della pausa, poi “Torna alle carte”. Questi pulsanti e “Rinnova le carte” si attivano al rilascio, come le carte.

- **Grafica: Classica o HD-2D** (1.13.0) **[deciso]** (Marco): pulsante “Grafica: … ⇄” nel **menu principale** (non durante le ondate): la scelta si salva
  nelle impostazioni e la pagina si ricarica da sola, perché il disegno si sceglie al caricamento. Di base la classica. HD-2D: pixel art a 2 px logici con luci
  additive, cielo stellato fino all’orizzonte, sprite generati dal codice; testi nello stesso carattere (leggibilità). Aspetto **[Claude]** (proposta approvata
  da Marco a fasi, catalogo `docs/catalogo-grafico-alternativo.html`). Fluidità sul telefono da provare: contatore dei fotogrammi al secondo sotto “Liv…”
  nell’HUD, acceso e spento toccando la versione in basso a destra nel menu. **[da provare]**

## 7. Salvataggio e PWA

- Menu → “Salvataggio · esporta o importa”: file JSON (sul telefono si apre la condivisione) o codice `FD1:…` (base64 del JSON).
  Import da file o codice incollato, con riepilogo e conferma prima di sostituire. Dati non validi rifiutati senza toccare i progressi. **[deciso]**
- Formato (versione 2, dalla 1.5.0): `{ game: "fortress-defense", version: 2, appVersion, exportedAt, progress: { cleared, seen, seals, claims, tree, loadout }, settings: { targeting } }`.
  `seals` = Sigilli da spendere; `claims` = premi riscossi (`s31` primo completamento Standard del 31, `s31p` premio della cupola al 100%, `e5`… Epica);
  `tree` = nodi comprati (`{ "sky:burn1": 1 }`); `loadout` = torrette equipaggiate. Un salvataggio della versione 1 si importa con Sigilli e albero vuoti;
  valori non validi (nodi sconosciuti, torrette equipaggiate senza sblocco, più di 4) vengono scartati. **[Claude]**
  Versione 4 (1.12.0): in più `majors` (Sigilli maggiori); un salvataggio senza `majors` (versioni 1-3) con almeno 40 livelli completati riceve le abilità d’ingresso della barriera, che dalla 1.12.0 costano 1 Sigillo.
  Versione 3 (1.10.0): in più `progress.gear` = `{ pcs: { "arma:2": n }, mods: { "arma:2:17": n }, eq: { arma: { r, m: [[effetto, rarità], …] } } }` (inventario e pezzi equipaggiati).
  Versione 5: in più `progress.gear.lock` = `{ "arma:2": n, "arma:2:17": n }` (quanti esemplari di ogni riga sono bloccati) e il blocco dei pezzi equipaggiati e dei Moduli installati;
  un salvataggio precedente si importa senza blocchi, e un numero di bloccati superiore a quelli posseduti viene ridotto. **[Claude]**
  Versione 7 (1.16.0): in più `progress.planet` = `{ lv: { fire: n, … }, frags: { alfa: n, … }, day: { d: "AAAA-MM-GG", n } }` (Protezione planetaria, § 17: livelli completati per tipo,
  frammenti dei ranger, partite del giorno); le versioni 1-6 si importano con la Protezione planetaria da zero; tipi, ranger e date non validi vengono scartati. **[Claude]**
  Versione 8 (1.17.0): in più `progress.planet.eq` (ranger equipaggiati, al massimo 2 e un solo ranger di conversione); la versione 7 si importa senza ranger equipaggiati. **[Claude]**
  Le versioni 1 e 2 si importano con l’inventario vuoto; pezzi, Moduli e installazioni non validi (tipi o effetti sconosciuti, doppioni, più Moduli degli slot) vengono scartati. **[Claude]**
  Se il formato cambia: alzare `SAVE_VERSION` e gestire la migrazione in `parseSave`. Non esporta la partita in sospeso (§ 2). L’import accetta anche file con `aim` (versioni precedenti) e lo ignora; la versione del formato non cambia. **[Claude]**
- `localStorage`: `fortress-progress-v1` (livelli, nemici scoperti, Sigilli e albero, equipaggiamento; la chiave non cambia, i campi nuovi mancanti valgono zero), `fortress-proto-v1` (impostazioni).
  `fortress-run-v1`: partita in sospeso (§ 2); la chiave non cambia con i rinominamenti del gioco. Nella Protezione planetaria salva anche continente (`pt`), mini-boss sconfitti (`mb`)
  e scelte in coda (`pq`), e `wave` è la prima ondata non ripulita.
- PWA: `manifest.json`, `sw.js`, icone. Schermata iniziale (nome del gioco in alto, icona ingrandita sotto): all’avvio, se online, controlla se c’è un nuovo `sw.js` (attesa massima 3 s). Se c’è, mostra “Aggiornamento in corso…”, scarica, attiva e ricarica la pagina. A controllo concluso (nessun aggiornamento, offline, tempo scaduto o ricarico già fatto) compare la scritta “Start” e si entra nel gioco con un tocco. Il ricarico avviene solo in questa schermata, mai durante una partita. **[deciso]**
  Serve HTTPS. Ad ogni pubblicazione alzare `APP_VERSION` (in index.html) e la versione dentro `sw.js`. `sw.js` deve cambiare ad ogni pubblicazione, altrimenti il browser non rileva l’aggiornamento. Se cambia l’elenco dei file, aggiornare anche `ASSETS`.
- **Schermo sempre acceso**: finché il gioco è aperto in primo piano lo schermo non si spegne, anche in automatico senza tocchi (Screen Wake Lock, richiesto dopo il tocco su “Start”, rilasciato in secondo piano e richiesto di nuovo al ritorno; se il browser non lo supporta il gioco funziona lo stesso). **[deciso]** (il comportamento) · modalità **[Claude]**

## 8. Guardiano e torrette *(generato)*

### Guardiano

Physical. Spara da solo, cadenza alta senza ricarica, portata totale, tutti i proiettili di una salva sullo stesso bersaglio; mentre si tiene premuto insegue il nemico nel mirino (entro 45 px) o spara in verticale.
- **Standard** (max 3 pile): +1 perforazione (I colpi trapassano un nemico in più); Danno maggiorato (Danno +25%); +1 proiettile (+1 proiettile, danno −15%).
- **Chain · Frenesia** — lv1 Frenesia: Ogni 30 s: 8 s di fuoco ×1,8, danno ×1,35 · lv2 Carica rapida: Carica in 25 s invece di 30 · lv2 Frenesia furiosa: Cadenza in frenesia ×2 (da ×1,8) · lv3 Frenesia prolungata: La frenesia dura 12 s invece di 8
- **Chain · Colpi esplosivi** — lv1 Colpi esplosivi: 10% di esplosione ad area sul colpo · lv2 Più esplosioni: Probabilità di esplosione: dal 10% al 20% · lv3 Esplosioni potenziate: Esplosione al 30% e raggio +30%
- **Level up** — lv1 Ventaglio: 4 proiettili a ventaglio al 30% del danno · lv1 Colpo pesante: Danno +60%, lieve knockback · lv2 Perforazione II: +2 perforazione · lv2 Rimbalzo: I proiettili rimbalzano sui bordi · lv3 Cadenza maggiorata: Cadenza di fuoco base +20%
- id nel codice: pierce, dmg, proj, frenzy1, fill, fspd, fdur, boom1, boomP, boom3, fan, punch, pen2, ricochet, rate3
- **Combo** (contano come scelte del guardiano): Sky Guard (torretta lv2) → Proiettili incendiari: Proiettili: +20% di danno extra da fuoco · Laser (torretta lv2) → Laser rotante: 3%: laser rotante sul bersaglio per 3 s · Disruption Drone (chain Distruzione, guardiano lv2) → Colpi distruttivi: 10%: il colpo dà uno stack di distruzione · Aeroblast (chain Mine, guardiano lv2) → Posamine: 5%: una mina dove colpisce (max 5) · Thunderbolt (chain Fulmini ramificati, guardiano lv2) → Colpi ramificati: 5%: il colpo si ramifica come il fulmine · Beam (chain Raggio amplificato, guardiano lv2) → Mira amplificata: Stesso bersaglio: danno +50% in 2 s · Firewheel Drone (chain Mini-droni, guardiano lv2) → Mini-drone di scorta: 3%: genera un mini-drone (max 3) · Hive (torretta lv2) → Clone speculare: Clone specchiato al 50% del danno · Railgun (torretta lv2) → Proiettili frammentati: 10%: il proiettile si divide in 2 · Teslacoil (chain Sovraccarico, guardiano lv2) → Colpo caricato: Ogni 40 colpi: un colpo a danno doppio · Gravity Vortex Gun (torretta lv2) → Proiettili gravitazionali: Proiettili: +20% di danno extra force

### Sky Guard (`sky`)

Fire · Missili a ricerca casuale, lungo raggio. Portata 520 px, ricarica 3,0 s.
- **Standard** (max 3 pile): Danno maggiorato (Danno +25%); +1 missile (+1 missile, danno −15%); Raggio d’impatto (Raggio d’impatto +30%).
- **Chain · Frammentazione** — lv1 Frammentazione: All’impatto: 3 mini-missili · lv2 Frammentazione II: I mini-missili diventano 6 · lv2 Mini-missili esplosivi: 50%: i mini-missili esplodono ad area · lv3 Frammentazione III: I mini-missili diventano 9
- **Chain · Missili incendiari** — lv1 Missili incendiari: I missili bruciano i colpiti per 3 s · lv2 Bruciatura intensa: Danno da bruciatura +60% · lv3 Combustione: Chi muore bruciato esplode al 60%
- **Level up** — lv1 Area infuocata: L’impatto brucia l’area per 5 s · lv1 Impatto devastante: Danno da impatto +80% · lv2 Scia incendiaria: I missili bruciano per 3 s chi attraversano · lv2 Doppio impatto: Dopo 0,5 s seconda esplosione al 60% · lv3 Salva potenziata: +2 missili per lancio
- id nel codice: dmg, msl, rad, split1, split2, splitB, split3, burn1, burn2, burn3, fire, impact, pass, again, plus2
- **Combo tra due torrette** (da principale al lv 2, contano come scelte di questa torretta): + Disruption Drone (chain Teletrasporto) → Missili teletrasportanti: I missili possono teletrasportare i colpiti · + Aeroblast (chain Salva di schegge) → Missili a schegge: All’impatto: 5 mini-missili a schegge · + Teslacoil (chain Sovraccarico) → Missili sovraccarichi: Missili caricati: raggio e danno maggiori

### Laser (`laser`)

Energy · Raggi fissi che trapassano tutto. Portata 900 px, ricarica 5,0 s.
- **Standard** (max 3 pile): Danno maggiorato (Danno +25%); +1 rimbalzo (Raggio principale: rimbalzo, danno −20%); Durata maggiorata (Durata dei raggi +30%).
- **Chain · Raggi multipli** — lv1 Raggi multipli: +2 mini-raggi fissi al 40% del danno · lv2 Raggi debilitanti: Raggi: i colpiti infliggono −35% per 2,5 s · lv2 Mini-raggi potenziati: Mini-raggi dal 40% al 70% del danno · lv3 Mini-raggi rimbalzanti: Anche i mini-raggi rimbalzano
- **Chain · Raggio spazzante** — lv1 Raggio spazzante: Un raggio spazza lo schermo in 3 s · lv2 Spazzata rallentante: La spazzata rallenta del 50% per 1,5 s · lv3 Doppia spazzata: Seconda spazzata in senso opposto
- **Level up** — lv1 Raggio largo: Larghezza dei raggi +100% · lv1 Raggio persistente: Durata dei raggi +70% · lv2 Sfruttare i debuff: +50% di danno a chi ha un debuff · lv2 Raggi penetranti: 30%: ignora le resistenze del nemico · lv3 Debuff prolungati: I debuff dei raggi durano +50%
- id nel codice: dmg, bounce, dur, multi1, multiW, multiD, multi3, sweep1, sweep2, sweep3, wide, longer, exploit, ignore, debuffdur
- **Combo tra due torrette** (da principale al lv 2, contano come scelte di questa torretta): + Sky Guard (chain Missili incendiari) → Raggi incendiari: Il raggio principale brucia i colpiti · + Hive (chain Sciame) → Raggi a sciame: 10%: il colpito genera un drone dell’Hive · + Railgun (chain Proiettile esplosivo) → Raggi esplosivi: I colpiti dal laser esplodono al 50%

### Disruption Drone (`disr`)

Force · Due droni e un campo di forza largo. Portata 380 px, ricarica 8,0 s.
- **Standard** (max 3 pile): Danno maggiorato (Danno +25%); Campo più alto (Altezza del campo +30%); Campo più duraturo (Durata del campo +30%).
- **Chain · Teletrasporto** — lv1 Teletrasporto: 5%: il colpito torna indietro di 90 px · lv2 Salto al bordo: 2,5%: teletrasporto al bordo superiore · lv3 Teletrasporto letale: Teletrasportato: −20% della vita attuale
- **Chain · Distruzione** — lv1 Distruzione: Stack: i nemici infliggono −10% danno · lv2 Scarica distruttiva: A stack massimo: scarica ×3 del danno · lv2 Distruzione estesa: Stack massimo da 3 a 5 · lv3 Doppia scarica: Una seconda scarica a stack massimo
- **Level up** — lv1 Ricarica rapida: Ricarica −15% · lv1 Esplosione finale: A fine durata esplode: danno ×3 · lv2 Campo destabilizzante: Nel campo: +25% danni dalle altre torri · lv2 Pulsazione rapida: Il campo colpisce ogni 0,6 s invece di 1 · lv3 Campo attrattivo: Danno +40%, attira verso il centro
- id nel codice: dmg, height, dur, tp1, tp2, tp3, dst1, dstB, dst5, dst3, reload, blast, amp, tick, grip
- **Combo tra due torrette** (da principale al lv 2, contano come scelte di questa torretta): + Laser (chain Raggio spazzante) → Campo laser: I droni sono uniti da un laser orizzontale · + Beam (chain Raggio amplificato) → Campo amplificato: Il danno del campo sale fino al 200% · + Aeroblast (chain Salva di schegge) → Campo a schegge: I droni sparano schegge verso l’interno

### Aeroblast (`aero`)

Physical · Esplosioni con knockback, corto raggio. Portata 260 px, ricarica 2,6 s.
- **Standard** (max 3 pile): Danno maggiorato (Danno +25%); +1 proiettile (+1 proiettile, danno −15%); Più rapido (Danno +10%, ricarica −10%).
- **Chain · Salva di schegge** — lv1 Salva di schegge: Dopo il colpo: 5 proiettili minori · lv2 Schegge d’urto: Le schegge spingono indietro di 10 px · lv3 Doppia salva: Le schegge partono due volte
- **Chain · Mine** — lv1 Mine: Ogni colpo rilascia una mina · lv2 Più mine: 2 mine per colpo · lv2 Mine d’urto: Le mine spingono indietro di 14 px · lv3 Mine potenziate: Le mine fanno +60% di danno
- **Level up** — lv1 Spinta maggiore: Knockback da 14 a 30 px · lv1 Esplosioni ampie: Raggio d’esplosione dei colpi +40% · lv2 Gittata estesa: Raggio d’azione +30% · lv2 Doppia esplosione: I colpi esplodono ancora dopo 1 s · lv3 Gittata massima: Raggio d’azione: altro +30%
- id nel codice: dmg, proj, fast, salvo1, salvoK, salvo2, mine1, mine2, mineK, mineD, knock, blast, reach, echo, reach2
- **Combo tra due torrette** (da principale al lv 2, contano come scelte di questa torretta): + Laser (chain Raggi multipli) → Esplosioni a raggi: 10%: il colpo genera un laser rotante · + Gravity Vortex Gun (chain Buco nero statico) → Colpi singolari: 10%: il colpo lascia un buco nero statico · + Thunderbolt (chain Fulmini ramificati) → Colpi fulminanti: I colpiti attirano un fulmine ramificato

### Thunderbolt (`thunder`)

Electric · Sfere sulla barriera, fulmini ovunque. Portata 700 px, ricarica 1,6 s.
- **Standard** (max 3 pile): Danno maggiorato (Danno +25%); +1 sfera (+1 sfera, danno −15%); Più rapido (Danno +10%, ricarica −10%).
- **Chain · Fulmini ramificati** — lv1 Fulmini ramificati: I fulmini si ramificano 4 volte · lv2 Ramificazione II: Fino a 6 ramificazioni · lv3 Ramificazioni debilitanti: Ramificazioni al 75%, indeboliscono 3 s
- **Chain · Fulmini paralizzanti** — lv1 Fulmini paralizzanti: 30%: il fulmine paralizza i colpiti · lv2 Paralisi prolungata: La paralisi dura 1,5 s invece di 1 · lv2 Scossa continua: Paralizzati: 25% del danno ogni 0,3 s · lv3 Paralisi totale: Ramificazioni paralizzanti, danno +30%
- **Level up** — lv1 Fulmini larghi: Larghezza dei fulmini +80% · lv1 Sfera sul campo: 30%: il fulmine crea una sfera per 4 s · lv2 Doppio fulmine: 50%: il fulmine colpisce ancora · lv2 Fulmini corrosivi: Fulmini: +25% danni subiti per 2,5 s · lv3 Sfere pungenti: Danni ogni 0,6 s entro 60 px dalle sfere
- id nel codice: dmg, sph, fast, fork1, fork2, forkW, para1, paraT, paraD, para3, wide, orb, twice, vuln, aura
- **Combo tra due torrette** (da principale al lv 2, contano come scelte di questa torretta): + Firewheel Drone (chain Scia di fuoco) → Fulmini di fuoco: I fulmini lasciano una scia di fuoco · + Hive (chain Onda iniziale) → Fulmini d’urto: I fulmini respingono i nemici vicini · + Railgun (chain Proiettile esplosivo) → Fulmini esplosivi: I colpiti dai fulmini esplodono al 50%

### Beam (`beam`)

Energy · Raggio continuo su un bersaglio. Portata 380 px, ricarica 3,4 s.
- **Standard** (max 3 pile): Danno maggiorato (Danno +25%); Durata estesa (Durata del raggio +30%); Ricarica ridotta (Ricarica −12%).
- **Chain · Raggio ramificato** — lv1 Raggio ramificato: Colpisce 2 bersagli in più · lv2 Attrazione: Ramificati attratti verso il primo · lv2 Ramificazione estesa: Colpisce un bersaglio in più · lv3 Base esplosiva: Ogni 0,5 s esplosione sul primo bersaglio
- **Chain · Raggio amplificato** — lv1 Raggio amplificato: Il danno sul bersaglio sale fino al 200% · lv2 Amplificazione continua: Cambiando bersaglio non si azzera · lv3 Amplificazione massima: Il danno sale fino al 400%
- **Level up** — lv1 Vulnerabilità: Bersagli: +25% danni subiti per 2 s · lv1 Ritmo accelerato: Danno del raggio +40% · lv2 Raggio vorace: Ogni uccisione lo allunga (fino a ×2) · lv2 Cacciatore di boss: +50% di danno a mini-boss e boss · lv3 Secondo laser: Genera un secondo laser
- id nel codice: dmg, dur, cd, fork1, pull, forkN, forkX, amp1, amp2, amp3, vuln, pace, feed, boss, second
- **Combo tra due torrette** (da principale al lv 2, contano come scelte di questa torretta): + Sky Guard (chain Frammentazione) → Raggio frammentante: Ogni colpito dal raggio lancia mini-missili · + Railgun (chain Proiettile diviso) → Raggio diviso: Il raggio si ramifica ancora · + Thunderbolt (chain Fulmini ramificati) → Raggio fulminante: Ogni colpito attira un fulmine ramificato

### Firewheel Drone (`wheel`)

Fire · Drone lanciafiamme che rimbalza. Portata 380 px, ricarica 6,5 s.
- **Standard** (max 3 pile): Danno maggiorato (Danno +25%); Durata estesa (Durata +30%); Fiamme più ampie (Raggio del lanciafiamme +30%).
- **Chain · Mini-droni** — lv1 Mini-droni: Genera 2 mini-droni rimbalzanti · lv2 Mini-droni incendiari: I mini-droni bruciano i nemici per 2 s · lv3 Mini-droni potenziati: Mini-droni: danno +60%
- **Chain · Scia di fuoco** — lv1 Scia di fuoco: Lascia una scia di 2 s che brucia · lv2 Scia combustibile: Nella scia: +30% danni da fuoco subiti · lv2 Fiamme intense: Bruciatura di questa torre +60% · lv3 Scia persistente: La scia dura 4 s invece di 2
- **Level up** — lv1 Scatto: Velocità ×1,8 quando non colpisce · lv1 Fiamme roventi: Danno del lanciafiamme +60% · lv2 Presidio: Resta fermo 2,5 s a fine durata · lv2 Fiamma crescente: Ogni colpito: danno +10% (fino a ×2) · lv3 Raffreddamento: Ogni colpito: ricarica −5% (fino a −50%)
- id nel codice: dmg, dur, rad, mini1, miniB, miniD, trail1, trailR, trailB, trail3, dash, heat, stay, stoke, cool
- **Combo tra due torrette** (da principale al lv 2, contano come scelte di questa torretta): + Disruption Drone (chain Distruzione) → Droni distruttivi: Drone e mini-droni danno distruzione · + Gravity Vortex Gun (chain Buco nero statico) → Drone collassante: A fine durata lascia un buco nero statico · + Teslacoil (chain Sfera statica) → Drone elettrostatico: Colpendo genera sfere statiche (max 5)

### Hive (`hive`)

Force · Sciame di droni a ricerca. Portata 380 px, ricarica 7,0 s.
- **Standard** (max 3 pile): Danno maggiorato (Danno +25%); +1 drone (+1 drone, danno −15%); Più colpi (I droni sparano 2 volte in più).
- **Chain · Onda iniziale** — lv1 Onda iniziale: 1° colpo: onda d’urto in avanti al 90% · lv2 Onda ampia: L’onda arriva il 40% più lontano · lv2 Onda rallentante: L’onda rallenta del 50% per 2 s · lv3 Onda finale: Anche l’ultimo colpo è un’onda
- **Chain · Sciame** — lv1 Sciame: 35%: a fine vita lancia un nuovo drone · lv2 Sciame II: Il nuovo drone può essere di lv 2 · lv3 Sciame III: Il nuovo drone può essere di lv 3
- **Level up** — lv1 Evoluzione I: Dopo 3 colpi: +1 proiettile · lv1 Colpi di forza: I colpi spingono indietro di 8 px · lv2 Evoluzione II: Dopo altri 3 colpi: +2 proiettili · lv2 Droni kamikaze: Finiti i colpi, si lancia: esplosione ×2 · lv3 Resistenza: 30%: finiti i colpi, il drone ricarica
- id nel codice: dmg, drone, hits, wave1, waveR, wave2, wave3, seed1, seed2, seed3, evo1, push, evo2, kami, stay
- **Combo tra due torrette** (da principale al lv 2, contano come scelte di questa torretta): + Firewheel Drone (chain Scia di fuoco) → Droni incendiari: I droni lasciano una scia di fuoco · + Beam (chain Raggio amplificato) → Droni a raggio: I droni sparano un raggio che si amplifica · + Teslacoil (chain Sfera statica) → Droni statici: Chi tocca i droni subisce la sfera statica

### Railgun (`rail`)

Physical · Colpi perforanti a cadenza media. Portata 380 px, ricarica 1,5 s.
- **Standard** (max 3 pile): Danno maggiorato (Danno +25%); Ricarica ridotta (Ricarica −12%); +1 perforazione (Perfora un nemico in più).
- **Chain · Proiettile diviso** — lv1 Proiettile diviso: Dopo il 1° bersaglio si divide in 2 · lv2 Doppia divisione: Si divide ancora dopo il 2° · lv3 Slancio: +15% di danno per nemico attraversato
- **Chain · Proiettile esplosivo** — lv1 Proiettile esplosivo: Il primo impatto esplode al 50% del danno · lv2 Carica esplosiva: Esplosione +15% per perforazione rimasta · lv2 Deflagrazione: Raggio +10% per perforazione rimasta · lv3 Esplosioni a catena: Esplodono anche i successivi: 80%, 60%…
- **Level up** — lv1 Impatto: Danno +50%, knockback 14 px · lv1 Penetrazione: +2 perforazioni, knockback 28 px · lv2 Vulnerabilità fisica: Colpiti: +25% danni fisici per 3 s · lv2 Impatto stordente: Paralizza i colpiti per 0,8 s · lv3 Colpo critico: 30%: danno +50%
- id nel codice: dmg, cd, pierce, split1, split2, mass, boom1, boomD, boomR, boom3, punch, pen, vulnP, stun, crit
- **Combo tra due torrette** (da principale al lv 2, contano come scelte di questa torretta): + Firewheel Drone (chain Mini-droni) → Proiettili a mini-droni: 10%: ogni colpito genera un mini-drone · + Hive (chain Sciame) → Proiettili a sciame: 10%: il colpito genera un drone dell’Hive · + Gravity Vortex Gun (chain Wormhole) → Proiettili a wormhole: 10%: wormhole dal 1° all’ultimo colpito

### Teslacoil (`tesla`)

Electric · Sfera elettrica che esplode al contatto. Portata 380 px, ricarica 2,2 s.
- **Standard** (max 3 pile): Danno maggiorato (Danno +25%); Ricarica ridotta (Ricarica −12%); +1 rimbalzo (+1 rimbalzo, danno −15%).
- **Chain · Sfera statica** — lv1 Sfera statica: Resta attiva 2 s dopo l’esplosione · lv2 Sfera rallentante: La sfera rallenta del 50% · lv2 Sfera carica: Danno della sfera +60% · lv3 Sfera persistente: La sfera dura 3,5 s invece di 2
- **Chain · Sovraccarico** — lv1 Sovraccarico: Carica +0,5 s, raggio esplosione +30% · lv2 Carica potenziata: Carica +0,5 s: danno e raggio +60% · lv3 Carica massima: Carica +1 s: danno e raggio +120%
- **Level up** — lv1 Esplosione a catena: Colpisce 5 nemici vicini al 40% del danno · lv1 Esplosione ampia: Raggio dell’esplosione +40% · lv2 Ricarica rapida: Ricarica −20% · lv2 Esplosioni paralizzanti: 30%: l’esplosione paralizza i colpiti · lv3 Campo di carica: Mentre carica: 15 danni/s a chi è sopra
- id nel codice: dmg, cd, bounce, orb, orbSlow, orbD, orbDur, over1, over2, over3, chain, big, quick, stun, charge
- **Combo tra due torrette** (da principale al lv 2, contano come scelte di questa torretta): + Laser (chain Raggi multipli) → Sfere a raggi: 10%: l’esplosione genera un laser rotante · + Disruption Drone (chain Teletrasporto) → Sfere teletrasportanti: L’esplosione può teletrasportare i colpiti · + Aeroblast (chain Mine) → Sfere minate: Ogni esplosione rilascia una mina

### Gravity Vortex Gun (`vortex`)

Force · Buco nero che attrae e danneggia. Portata 260 px, ricarica 5,5 s.
- **Standard** (max 3 pile): Danno maggiorato (Danno +25%); Percorso più lungo (Lunghezza percorsa +20%); Raggio maggiore (Raggio del buco nero +25%).
- **Chain · Wormhole** — lv1 Wormhole: Due varchi: si riemerge dal secondo · lv2 Varco ampio: Ingresso del wormhole +60% · lv2 Varchi stabili: I wormhole durano 6 s invece di 4 · lv3 Uscita rallentante: Uscita: rallentati del 50% per 2 s
- **Chain · Buco nero statico** — lv1 Buco nero statico: A fine percorso resta fermo 2 s e attrae · lv2 Statico prolungato: Il buco nero statico dura 3 s invece di 2 · lv3 Statico potente: Danno del buco nero statico +60%
- **Level up** — lv1 Attrazione forte: Attrazione +60% (da 80 a 128 px/s) · lv1 Buco nero iperdenso: Danno dei buchi neri +50% · lv2 Secondo buco nero: Genera un secondo buco nero · lv2 Buco nero lento: Velocità da 130 a 80 px/s: resta di più · lv3 Collasso crescente: Danno e attrazione fino a ×2 col percorso
- id nel codice: dmg, len, rad, wh1, wh2, whT, wh3, stat1, stat2, stat3, pull, power, twin, lazy, grow
- **Combo tra due torrette** (da principale al lv 2, contano come scelte di questa torretta): + Sky Guard (chain Missili incendiari) → Buco nero incendiario: Il buco nero brucia i nemici · + Beam (chain Raggio ramificato) → Buco nero ramificato: Il buco nero insegue altri 2 bersagli · + Thunderbolt (chain Fulmini paralizzanti) → Buco nero paralizzante: 30%: il buco nero paralizza i colpiti

## 9. Nemici e resistenze *(generato)*

### Nemici

- `drone` — navicella, Electric: vita 30, velocità 50, raggio 11, danno alla cupola 2
- `wisp` — cristallo-cometa, Energy: vita 22, velocità 60, raggio 9, danno alla cupola 1,5
- `brute` — asteroide, Force: vita 140, velocità 28, raggio 16, danno alla cupola 6
- `spitter` — meteora infuocata, Fire: vita 60, velocità 42, raggio 13, danno alla cupola 3
- `shell` — frammento roccioso, Physical: vita 60, velocità 34, raggio 14, danno alla cupola 4

### Resistenze (×0,5 resiste, ×1,5 debole) — segnaposto

- Nemico Force: resiste a Force, debole a Electric
- Nemico Energy: resiste a Energy, debole a Fire
- Nemico Electric: resiste a Electric, debole a Physical
- Nemico Fire: resiste a Fire, debole a Force
- Nemico Physical: resiste a Physical, debole a Energy

## 10. Valori scelti da Claude

Accettati: tutti tranne quelli segnati **[da rivedere]**.

- Sky Guard: 3 mini-missili al lv1 (dove la descrizione diceva “X”), bruciatura 3 s, area infuocata 5 s  **[Claude]**
- **Grafica del fuoco** (1.12.2) **[deciso]** (Marco): l’Area infuocata della Sky Guard è un disco di brace con lingue di fuoco che tremolano e scintille (prima un cerchio); anche la scia della Firewheel è fatta di lingue di fuoco e bagliore che si spengono. Solo disegno. **[Claude]** (aspetto)
- **Area infuocata, limite e livello** (1.12.4) **[deciso]** (Marco): le aree in fiamme si disegnano sotto i nemici e ogni Sky Guard ne ha al massimo tante a schermo
  quanti sono i missili della sua salva (2 + “+1 missile” + 2 con Salva potenziata); oltre, l’impatto non accende l’area (come le mine). Non misurato con i bot. **[Claude]** (non misurato)
- **Varchi del wormhole ovali** (1.12.4) **[deciso]** (Marco): ingresso e uscita sono ovali (altezza 0,42 della larghezza), come buchi nel pavimento e nel soffitto visti di sbieco,
  con il fondo scuro e anelli che scendono (salgono nell’uscita); disegnati sotto i nemici. L’ingresso cattura chi tocca l’ovale: stessa larghezza di prima,
  meno profondo lungo il cammino. **[Claude]** (aspetto, presa ovale)
- **Colori dei colpi del guardiano** (1.12.4) **[deciso]** (Marco): con Proiettili incendiari e/o Proiettili gravitazionali i colpi si alternano nei colori dei tipi attivi
  (fisico bianco, fuoco arancione, force viola), uno per colpo in ordine; il Clone speculare (che non ha queste combo) resta bianco, il Colpo caricato giallo. Solo disegno.
- Sky Guard (revisione 1): mini-missile esplosivo = area piena del missile principale (30 px, cresce con “Raggio d’impatto”) al 35% del danno;
  Missili incendiari = bruciatura 3 s a 6 al secondo su chi è colpito dall’impatto; Bruciatura intensa = +60% su tutte le bruciature della Sky Guard
  (anche area infuocata e scia); Combustione = esplosione di 40 px al 60% del danno del missile, solo per chi muore con una bruciatura **della Sky Guard**
  (scelta di Marco), può fare esplodere a catena altri bruciati; Doppio impatto = seconda esplosione dopo 0,5 s al 60%, senza mini-missili né area infuocata  **[da rivedere]**
- Laser: spazzata di **3 s** su 180° **[deciso]**; mini-raggi sfalsati di circa 10°, larghi il 60%, danno 40% del raggio principale (70% con la chain lv2),
  indebolimento 2,5 s dai raggi fissi (non dalla spazzata). I rimbalzi valgono solo per il raggio principale **[deciso]**; i mini-raggi li usano
  dal lv3 della chain e solo allora pagano il −20% per pila  **[da rivedere]**
- Laser (revisione 3): un raggio che rimbalza non attraversa la cupola: quando, dopo un rimbalzo, la rientra, si ferma sul suo bordo e non rimbalza più. Il primo tratto, che parte da dentro la cupola, esce normalmente. Vale per il raggio principale e per i mini-raggi con la chain lv3. **[deciso]** (la regola) · tracciamento **[Claude]**
- Disruption Drone: campo 6 s, ricarica 8 s da quando finisce, danno 8 per colpo, colpo ogni 1 s (0,6 s con il lv3), altezza base ±16 px, arretramento 90 px  **[Claude]**
- Disruption Drone: teletrasporto lv3 = 20% della vita attuale; scarica = 3× danno del campo, seconda dopo 0,4 s, stack azzerati dopo la scarica  **[Claude]**
- Disruption Drone (revisione 1): Esplosione finale = 3× il danno di un colpo del campo su tutta la fascia; Campo attrattivo = danno +40% e a ogni colpo
  il nemico fa metà della strada verso la linea centrale del campo (anche verso il basso; non i boss)  **[da rivedere]**
- Aeroblast: schegge al 30% del danno, seconda salva dopo 0,5 s, mine di 25 s, doppia esplosione al 60% dopo 1 s  **[Claude]**
- **Mine** (Aeroblast, combo del guardiano, Barriera minata; 1.12.0) **[deciso]** (Marco): disegno grande il doppio e contatto a 16 px dal centro (prima 8), esplosione sempre di 34 px; **al massimo 25 mine a schermo** (oltre, la nuova non nasce). Nessuna nuova taratura per questo.
- Aeroblast (revisione 1): Esplosioni ampie = raggio 40 → 56 px; Gittata massima = altri +30% della portata base, che si somma a Gittata estesa (260 → 338 → 416 px)  **[da rivedere]**
- Thunderbolt: fulmine ogni 1,6 s, ramificazioni al 50%, sfera sul campo 30% per 4 s  **[Claude]**
- **Thunderbolt, grafica** **[deciso]** (Marco): quando parte il fulmine verticale, la sfera da cui esce si ferma e riprende subito la corsa sulla barriera, così sfera e fulmine sono una cosa sola.
  Durata del fermo **[Claude]**: quella del fulmine (0,18 s); con il Doppio fulmine fino al secondo (0,38 s). Nessun effetto sul danno; l’aura delle Sfere pungenti continua. Vale per entrambe le grafiche.
- Thunderbolt (revisione 1): paralisi della chain **30% per 1 s** (1,5 s al lv2) **[deciso]**; Scossa continua = un colpo ogni 0,3 s al 25% del danno del fulmine
  finché dura la paralisi; Ramificazioni debilitanti = ramificazioni al 75% invece del 50%; Paralisi totale = +30% di danno a fulmine e ramificazioni;
  Doppio fulmine = 50% di un secondo fulmine dopo 0,2 s nello stesso punto; Fulmini corrosivi = vulnerabilità 2,5 s a tutti i danni dal fulmine principale  **[da rivedere]**
- Beam: durata 1,8 s, ramificazioni entro 220 px  **[Claude]**
- Beam (revisione 1): Attrazione = le ramificazioni sono tirate verso il bersaglio principale da cui partono; Base esplosiva = esplosione di 40 px ogni 0,5 s
  sul bersaglio principale, al 50% del danno al secondo; Raggio amplificato = +70% al secondo sul solo bersaglio principale (al 200% in circa 1,4 s,
  al 400% in circa 4,3 s), si riparte da 100% a ogni attivazione; Raggio vorace = +25% della durata per uccisione del bersaglio principale, fino al doppio;
  Cacciatore di boss = +50% di danno a mini-boss e boss  **[da rivedere]**
- Firewheel: durata 5 s, 2 mini-droni, sosta 2,5 s, scia 2 s (4 s con la chain lv3 **[deciso]**)  **[Claude]**
- Firewheel (revisione 2): Scia combustibile = chi tocca la scia subisce +30% da tutti i danni da fuoco per 2 s; Fiamme intense = +60% sulle bruciature
  di questa torre (scia e mini-droni); Fiamme roventi = danno del lanciafiamme +60% (anche mini-droni); Fiamma crescente = +10% per ogni nemico diverso
  toccato dal drone, fino a ×2 (vale per ogni drone, si riparte a ogni lancio); Raffreddamento = −5% della ricarica successiva per ogni nemico diverso
  colpito dal lancio, fino a −50% (ricarica 6,5 s → 3,25 s)  **[Claude]**
- Hive: 3 droni base, 4 colpi base (+2 per pila), droni che sparano entro **62 px** (prima 125) **[deciso]** e si avvicinano fino a 45 px, onda 130 px circa ±35° (182 px con Onda ampia), evoluzione 1→2→4 proiettili. Sciame 35% = probabilità che a fine vita un drone ne lanci uno nuovo; resistenza 30% = probabilità che un drone, finiti i colpi, ne riceva altrettanti  **[Claude]**
- **Hive, evoluzioni** (1.12.2) **[deciso]** (Marco): dopo l’evoluzione al lv2 il drone spara ancora **almeno 2 colpi**, al lv3 **almeno 3** (se gliene restano di più, restano quelli). **Colpi visibili**: ogni proiettile vola in 0,14 s dal drone al nemico (il danno resta immediato), a ventaglio se sono più di uno; lv1 punto viola, lv2 rombo lilla più grande, lv3 stella rosa con alone **[Claude]** (aspetto).
- Hive (revisione 2): i droni **non hanno una durata**, restano finché non hanno sparato tutti i colpi **[deciso]** (spariscono comunque a fine ondata);
  Colpi di forza = knockback di 8 px per colpo; Droni kamikaze = finiti i colpi il drone vola verso il nemico più vicino (260 px/s, al massimo 3 s)
  ed esplode in un raggio di 40 px al doppio del danno di un colpo; con Resistenza si tira prima Resistenza  **[Claude]**
- Railgun: perforazione base 3, divisione a ±20°, Slancio +15% per nemico  **[Claude]**
- Railgun (revisione 2): esplosione base 30 px al 50% del danno del colpo; Carica esplosiva = +15% di danno per ogni perforazione ancora disponibile
  al momento dell’impatto; Deflagrazione = +10% di raggio per perforazione disponibile; Esplosioni a catena: il k-esimo colpito esplode con probabilità
  100% − 20% × (k − 1) (80%, 60%, 40%, 20%, poi più nulla); vale anche per i proiettili divisi; Impatto stordente = paralisi 0,8 s;
  Colpo critico = 30% per ogni nemico colpito, danno del colpo ×1,5 (non dell’esplosione)  **[Claude]**
- Teslacoil: carica 0,7 s, sfera statica 2 s (3,5 s al lv3), esplosione a catena su 5 nemici al 40%  **[Claude]**
- Teslacoil (revisione 2): il “tempo di ricarica” della chain Sovraccarico è letto come la **carica** prima del tiro (0,7 → 1,2 → 1,7 → 2,7 s), durante la
  quale la sfera cresce sulla bobina; per ogni 0,5 s di carica in più: raggio +30% (dal lv1) e danno +30% (dal lv2), quindi al lv3 raggio ×2,2 e danno ×2,2.
  Sfera carica = danno della sfera ×1,6; Esplosione ampia = raggio +40%; Esplosioni paralizzanti = 30% per 1 s, come il Thunderbolt **[deciso]**.
  Proiettile disegnato come un fulmine globulare (alone tremolante e archi)  **[Claude]**
- Teslacoil (revisione 3): la Sfera statica è disegnata come il proiettile (fulmine globulare con alone tremolante e archi), alla dimensione della sua area, senza coprire i nemici; danno e area invariati. **[deciso]** (lo stile) · dettagli **[Claude]**
- Gravity Vortex Gun: wormhole 4 s (6 s con Varchi stabili)  **[Claude]**
- Gravity Vortex Gun (revisione 2): Buco nero iperdenso = danno +50%; Buco nero lento = avanza a 80 px/s invece di 130 (stesso percorso, più tempo sui nemici);
  Collasso crescente = danno e attrazione crescono con la strada fatta, fino a ×2 a fine percorso (e da fermo)  **[Claude]**
- Gravity Vortex Gun (revisione 3): Percorso più lungo = +20% per pila (prima +30%), base 253 px invariata (3 pile = 405 px, prima 480).
  Il potenziamento di questa carta dall’albero (§ 16) non allunga più il percorso: dà +2% di danno dei buchi neri per pila e per livello del nodo (max +30%).
  Il Vortex parte con nemici entro max(portata 260 px, percorso): comportamento invariato. **[deciso]** (Marco) · valori **[Claude] [da rivedere]** (da misurare con i bot)
- Laser (revisione 2): Raggi penetranti = a ogni attivazione, ogni nemico toccato ha il 30% di subire tutto il danno del laser senza resistenze
  (anche dalla spazzata); senza resistenza non cambia nulla  **[Claude]**
- Beam (revisione 2): Ramificazione estesa = 3 ramificazioni invece di 2  **[Claude]**
- Guardiano: intervallo 0,15 s e danno 7 per colpo; ventaglio 4 proiettili al 30%, esplosioni al 70% raggio 30 (39 con la chain lv3; tolta “Esplosioni ampie”), rimbalzo sui bordi (sotto), colpo pesante ×1,6 con knockback 1,5 px per colpo (4,5 in frenesia)  **[da rivedere]**
- Combo del guardiano (Marco ha deciso effetti e condizioni; numeri e dettagli di Claude):
  Proiettili incendiari e Proiettili gravitazionali = ogni proiettile (anche del Ventaglio) fa in più il 20% del suo danno come fuoco / force, senza bruciatura;
  Laser rotante = 3% per salva; segmento di 110 px centrato sul bersaglio colpito, che lo segue finché vive; 2 giri in 3 s; uno alla volta;
  danno, larghezza, Raggi debilitanti, Sfruttare i debuff, Debuff prolungati e Raggi penetranti come la torretta; con Raggi multipli 2 mini-raggi
  a ±60° (danno dei mini-raggi della torretta); niente rimbalzi né spazzata;
  Colpi distruttivi = 10% per salva, uno stack sul nemico colpito, con la scarica della torretta se c’è (danno della scarica = quello della torretta);
  Posamine = 5% per salva, mina della torretta (danno, Mine d’urto, Mine potenziate) dove colpisce il primo proiettile; al massimo 5 mine del guardiano insieme;
  Colpi ramificati = 5% per salva; dal nemico colpito partono le ramificazioni della torretta: 4 (6 con Ramificazione II) entro 130 px, stesso danno
  ed effetti (Ramificazioni debilitanti, Paralisi totale);
  Mira amplificata = +25% al secondo sullo stesso bersaglio, fino a +50% in 2 s, si azzera cambiando bersaglio (vale anche per il Ventaglio);
  Mini-drone di scorta = 3% per salva; mini-drone della torretta (durata, danno, Mini-droni incendiari e potenziati, Fiamme roventi) che parte dal guardiano;
  al massimo 3 insieme; non ferma la ricarica della torretta e non conta per Raffreddamento;
  Clone speculare (revisione 4) = specchia ogni salva del guardiano: posizione e direzione riflesse rispetto al centro, senza un bersaglio proprio e senza seguire l’impostazione del bersaglio,
  anche se da quel lato non ci sono nemici (premendo specchia allo stesso modo). Stessa cadenza e stessi proiettili, 50% del danno; replica Ventaglio, chain e level up del guardiano
  (perforazione, Rimbalzo, esplosioni, Colpo pesante con il suo knockback, frenesia), **non le combo** **[deciso]**; disegnato trasparente;
  Proiettili frammentati = 10% per proiettile (non Ventaglio), una volta per proiettile: due frammenti al 50% del danno verso i nemici più vicini
  non ancora colpiti (entro 200 px, altrimenti a ±20°), senza perforazione né rimbalzo;
  Colpo caricato = un proiettile in più ogni 40 salve, danno ×2 (×3 in tutto con Colpo pesante, scelta di Marco); eredita i “+1 rimbalzo” della
  Teslacoil (senza il −15%), di nemico in nemico (dalla 1.14.4 il Rimbalzo del guardiano è sui bordi e vale anche per lui); disegnato più grande e giallo  **[da rivedere]**
- Tiro premendo (revisione 4, prima “tiro verticale”): se il mirino aggancia un nemico entro 45 px i proiettili lo inseguono, altrimenti partono in verticale e proseguono fino al bordo dello schermo; il mirino diventa giallo quando aggancia. Ventaglio e combo come in automatico (il Ventaglio si apre attorno alla direzione della salva). Il Clone speculare specchia la salva. **[deciso]** · colore del mirino **[Claude]**
- **Rimbalzo del guardiano e del Clone (1.14.4)** **[deciso]** (Marco): come il raggio del Laser, un proiettile che tocca un bordo dello schermo (lati e alto) rimbalza indietro
  con la traiettoria riflessa (angolo di uscita uguale a quello di entrata, come `trace()`), senza limite di rimbalzi, e prosegue finché non esaurisce le perforazioni
  (con 0 perforazioni si ferma al primo nemico colpito). Dopo un rimbalzo smette di inseguire il bersaglio. Non vale per Ventaglio e frammenti.
  Prima (fino alla 1.14.3) il Rimbalzo cercava, finite le perforazioni, un altro nemico entro 180 px (una volta).
  Revisione 4, invariata: un proiettile che, dopo un rimbalzo, rientra nella cupola si ferma sul bordo (sparisce al passaggio); quindi un colpo che rimbalza in alto
  e torna giù senza colpire nessuno sparisce sulla cupola. Vale anche per il Colpo caricato. Misura leggera (60 partite per bot, random / smart): muro 20 30 / 43%, muro 50 58 / 50%.
- Guardiano (disegno, revisione 4): soldato futuristico visto di spalle, elmetto integrale con antenna e visore che si intravede ai lati, tuta spaziale con zaino; braccio destro alzato e teso che finisce in un cannone cibernetico con linea di energia (la bocca, `GUN` = 7 px a destra e 56 px sopra i piedi, è il punto da cui partono i colpi), braccio sinistro piegato con il gomito in fuori che afferra l’attacco del cannone. In frenesia la tuta diventa arancione. Il Clone speculare è lo stesso disegno specchiato e trasparente. Sotto i piedi livello e carte (“L2 1/3”, “★” al massimo), come per le torrette ma in bianco, una riga più in alto delle etichette delle torrette, e **segue il guardiano** (resta dentro lo schermo). **[deciso]** (la figura, descritta da Marco) · disegno, posizione e colore dell’etichetta **[Claude]**
- Combo del guardiano, nomi delle carte (Marco ha dato solo gli effetti): Proiettili incendiari, Laser rotante, Colpi distruttivi, Posamine,
  Colpi ramificati, Mira amplificata, Mini-drone di scorta, Clone speculare, Proiettili frammentati, Colpo caricato, Proiettili gravitazionali  **[da rivedere]**
- Combo del guardiano, letture di Claude: “torretta di lv2” = basta la torretta al livello 2, il guardiano può essere al livello 1;
  “scelta chain X” = la torretta ha la voce lv1 di quella chain  **[da rivedere]**
- **Combo tra due torrette** (principale + secondaria, chain richiesta). Effetti **[deciso]** (Marco); nomi delle carte **[Claude] [da rivedere]**.
  Dove non c’è un numero valgono quelli della chain della secondaria.
  1. Sky Guard + Disruption Drone (Teletrasporto) · *Missili teletrasportanti*: i missili possono teletrasportare i bersagli.
  2. Sky Guard + Aeroblast (Salva di schegge) · *Missili a schegge*: partono anche mini-missili che seguono la chain.
  3. Sky Guard + Teslacoil (Sovraccarico) · *Missili sovraccarichi*: missili caricati e potenziati; la carica allunga il ciclo di sparo (voluto).
  4. Firewheel Drone + Disruption Drone (Distruzione) · *Droni distruttivi*: drone e mini-droni causano distruzione.
  5. Firewheel Drone + Gravity Vortex Gun (Buco nero statico) · *Drone collassante*: a fine durata lascia un buco nero statico nella posizione finale; con mini-droni, probabilità che ne lascino uno anche loro.
  6. Firewheel Drone + Teslacoil (Sfera statica) · *Drone elettrostatico*: genera sfere statiche quando colpisce i nemici (max 5).
  7. Laser + Sky Guard (Missili incendiari) · *Raggi incendiari*: il laser principale e i suoi rimbalzi bruciano i colpiti.
  8. Laser + Hive (Sciame) · *Raggi a sciame*: i bersagli colpiti dal laser possono generare un drone.
  9. Laser + Railgun (Proiettile esplosivo) · *Raggi esplosivi*: tutti i bersagli colpiti dal laser esplodono al 50% del danno; Carica esplosiva 65%; Deflagrazione +10% di raggio; Esplosioni a catena 80% (percentuali del danno della Railgun, la secondaria).
  10. Beam + Sky Guard (Frammentazione) · *Raggio frammentante*: il raggio genera mini-missili che seguono la chain.
  11. Beam + Railgun (Proiettile diviso) · *Raggio diviso*: il raggio si ramifica ulteriormente (con più raggi, tutti); Slancio: più danno per ogni bersaglio già colpito dal raggio.
  12. Beam + Thunderbolt (Fulmini ramificati) · *Raggio fulminante*: ogni bersaglio colpito dal raggio attira un fulmine ramificato che parte dalla sfera più vicina (anche obliquo); colpisce 1 volta, 2 con Ramificazione II; Ramificazioni debilitanti indeboliscono.
  13. Disruption Drone + Laser (Raggio spazzante) · *Campo laser*: i droni a bordo schermo emettono un laser orizzontale che li collega; Spazzata rallentante rallenta ulteriormente; Doppia spazzata: danno doppio.
  14. Disruption Drone + Beam (Raggio amplificato) · *Campo amplificato*: il danno del campo cresce nel tempo fino al 200%; Amplificazione continua: tetto 300%; Amplificazione massima: 400%.
  15. Disruption Drone + Aeroblast (Salva di schegge) · *Campo a schegge*: i droni a bordo schermo sparano una salva di schegge verso l’interno.
  16. Hive + Firewheel Drone (Scia di fuoco) · *Droni incendiari*: i droni lasciano una scia di fuoco che segue la chain.
  17. Hive + Beam (Raggio amplificato) · *Droni a raggio*: i droni emettono un raggio che segue la chain, danno Force; danno di partenza = un colpo del drone (× numero di proiettili); i colpi del drone diventano i colpi del raggio (drone da 6 colpi = il raggio colpisce 6 volte); disegnato come raggio nel colore del livello del drone.
  18. Hive + Teslacoil (Sfera statica) · *Droni statici*: i nemici a contatto con i droni subiscono il danno di una sfera statica (scintille dai droni); danno nel tempo, maggiore con Sfera carica e ancora con Sfera persistente; Sfera rallentante rallenta chi è a contatto.
  19. Gravity Vortex Gun + Sky Guard (Missili incendiari) · *Buco nero incendiario*: il buco nero brucia, come la chain.
  20. Gravity Vortex Gun + Beam (Raggio ramificato) · *Buco nero ramificato*: dopo il suo bersaglio il buco nero ne colpisce altri, anche fuori traiettoria ma solo verso l'alto o ravvicinati, mai verso il basso; Attrazione: più potere attrattivo; Ramificazione estesa: un bersaglio in più; Base esplosiva: esplosioni sui colpiti.
  21. Gravity Vortex Gun + Thunderbolt (Fulmini paralizzanti) · *Buco nero paralizzante*: i nemici colpiti possono restare paralizzati; Paralisi prolungata e Scossa continua come la chain; Paralisi totale dà solo danno +30%.
  22. Aeroblast + Laser (Raggi multipli) · *Esplosioni a raggi*: i proiettili possono generare un laser rotante (come quello del guardiano) con 2 raggi che ereditano il danno dalla chain; Raggi debilitanti indeboliscono; Mini-raggi rimbalzanti aggiunge un raggio.
  23. Aeroblast + Gravity Vortex Gun (Buco nero statico) · *Colpi singolari*: genera buchi neri statici quando colpisce i nemici.
  24. Aeroblast + Thunderbolt (Fulmini ramificati) · *Colpi fulminanti*: come la 12, per i bersagli colpiti dai proiettili.
  25. Railgun + Firewheel Drone (Mini-droni) · *Proiettili a mini-droni*: i bersagli colpiti possono generare 1 mini-drone rimbalzante per nemico colpito.
  26. Railgun + Hive (Sciame) · *Proiettili a sciame*: i bersagli colpiti possono generare un drone.
  27. Railgun + Gravity Vortex Gun (Wormhole) · *Proiettili a wormhole*: possono aprire un wormhole sul primo nemico colpito e uno in uscita sull’ultimo.
  28. Thunderbolt + Firewheel Drone (Scia di fuoco) · *Fulmini di fuoco*: i fulmini lasciano una scia di fuoco.
  29. Thunderbolt + Hive (Onda iniziale) · *Fulmini d’urto*: i fulmini causano knockback; Onda ampia e Onda finale lo aumentano; Onda rallentante rallenta.
  30. Thunderbolt + Railgun (Proiettile esplosivo) · *Fulmini esplosivi*: tutti i nemici colpiti dai fulmini esplodono, valori come la 9.
  31. Teslacoil + Laser (Raggi multipli) · *Sfere a raggi*: come la 22, con i proiettili elettrici.
  32. Teslacoil + Disruption Drone (Teletrasporto) · *Sfere teletrasportanti*: i proiettili elettrici possono teletrasportare.
  33. Teslacoil + Aeroblast (Mine) · *Sfere minate*: i proiettili elettrici generano una mina (scala con la chain; vale il tetto di 25 mine).
- **Combo tra due torrette, numeri provvisori** **[Claude] [provvisorio]** (da misurare con i bot): probabilità del 10% per bersaglio colpito nei n. 8 e 26, per colpo nei n. 22, 23 e 31, per proiettile nel n. 27 (serve almeno 2 nemici colpiti), 10% anche nel n. 25;
  25% per i mini-droni del n. 5. Rampa del n. 14: +70% al secondo, come il Beam. Nel n. 20: 2 bersagli in più (3 con Ramificazione estesa), “ravvicinati” = entro 130 px. Knockback del n. 29: raggio dell'onda dell’Hive
  (130 px, 182 con Onda ampia), Onda finale +30%. Le scie dei n. 16 e 28: al massimo 5 a schermo per combo.
- **Combo tra due torrette, letture di Claude nel codice** (1.15.0) **[Claude] [da rivedere]**:
  danno e tipo della secondaria per tutto ciò che la combo genera (esplosioni, bruciature, fulmini, schegge, mine, sfere, buchi neri, droni, scie); il proiettile della principale
  tiene il suo (n. 20 e 21: danno del buco nero). Tetto di 5 a schermo anche per le sfere statiche del n. 6. Nel codice: carte `K` nella lista `ups` della principale
  (livello 2, condizione = voce chain della secondaria), effetti con `kOn(s, id)`, che restituisce la secondaria.
  1 e 32: un tiro di teletrasporto per colpito dall’impatto del missile principale (non mini-missili né Doppio impatto) o dall’esplosione della sfera (anche dopo un rimbalzo).
  2: 5 mini-missili per impatto, danno delle schegge (30% dell’Aeroblast, fisico), Schegge d’urto 10 px, Doppia salva dopo 0,5 s.
  3: per ogni 0,5 s di carica in più della Teslacoil raggio +30% (×1,3 · ×1,6 · ×2,2) e, con Carica potenziata, danno +30%; la carica si aggiunge alla ricarica (3 s → 3,5 · 4 · 5 s); missili con alone elettrico.
  4 e 6: a ogni passaggio (quando il drone torna a toccare un nemico) 1 stack o 1 sfera statica (raggio dell’esplosione della Teslacoil); solo i droni lanciati dalla torretta,
  non i mini-droni del guardiano o del n. 25. 5: buco nero fermo con durata e danno della chain, raggio e attrazione della Vortex. 7 e 19: bruciatura della Sky Guard (3 s, 6/s, Bruciatura intensa, Combustione).
  8 e 26: drone di livello a caso fino a quello permesso da Sciame II / III, che non lancia altri droni.
  9 e 30: esplosione di 30 px (+10% con Deflagrazione, fisso perché non ci sono perforazioni); nel n. 9 per ogni raggio (principale e mini-raggi), una volta per bersaglio e per attivazione;
  nel n. 30 su chi è colpito dal fulmine e dalle ramificazioni.
  10: alla prima volta che il raggio tocca un bersaglio (per attivazione) partono da lui 3 / 6 / 9 mini-missili della Sky Guard (35%, Mini-missili esplosivi).
  11: una ramificazione in più da ogni bersaglio principale (anche senza Raggio ramificato); con Doppia divisione si divide ancora ogni primo ramificato; Slancio +15% per passo (×1,15 · ×1,3).
  12 e 24: il fulmine è una ramificazione del Thunderbolt (50%, 75% e indebolimento con Ramificazioni debilitanti, paralisi con Paralisi totale), uno per bersaglio a ogni attivazione (12)
  o a ogni colpo (24); il secondo colpo dopo 0,15 s; senza sfere parte dall’alto.
  13: laser largo come quello del Laser (8 px, 16 con Raggio largo), 18 danni al secondo come la spazzata (×2 con Doppia spazzata); “rallenta ulteriormente” letto come rallentamento
  di 1,5 s che resta anche fuori dal campo (il rallentamento non si somma). 14: la rampa parte quando i droni arrivano ai lati.
  15: una salva di 5 schegge per lato quando i droni arrivano ai lati (di nuovo dopo 0,5 s con Doppia salva), verso i nemici da quella parte.
  16: un punto di scia ogni 22 px di strada del drone. 17: amplificazione per drone (+70% al secondo tra un colpo e l’altro, tetto 200%, 400% con Amplificazione massima;
  Amplificazione continua: non si azzera cambiando bersaglio); le onde di Onda iniziale e Onda finale restano onde.
  18: contatto = entro 45 px dal drone (la distanza a cui si ferma) più il raggio del nemico; 12 danni al secondo, ×1,6 con Sfera carica, ×1,75 con Sfera persistente (rapporto 3,5 / 2 delle durate).
  20: il buco nero va verso il suo bersaglio; raggiunto, passa al più vicino entro 130 px non più in basso, altrimenti al più vicino più in alto; il percorso si allunga quanto serve;
  Attrazione = attrazione ×1,5; Base esplosiva = esplosione di 40 px al 50% del danno al secondo del Beam su ogni bersaglio raggiunto. 21: un tiro di paralisi per nemico e per buco nero.
  22 e 31: laser rotante di 110 px che segue il primo colpito, 2 raggi a croce (3 a 60° con Mini-raggi rimbalzanti) al danno dei mini-raggi; solo se il colpo prende qualcuno. 23: idem.
  25: mini-drone della Firewheel (durata, danno, Mini-droni incendiari e potenziati), che non ferma la torretta. 27: si decide a fine corsa del proiettile; varchi con durata, ingresso e uscita della chain.
  28: scia lungo tutto il fulmine verticale (un punto ogni 22 px), non sulle ramificazioni.
  29: “raggio dell’onda” letto come area: chi è entro 130 px (182 con Onda ampia) da un colpito è spinto indietro di 16 px come dall’onda dell’Hive (20,8 con Onda finale), una volta per fulmine. **[deciso]** (Marco: lettura confermata, non 130 px di spinta)
  33: mine dell’Aeroblast a ogni esplosione della sfera (2 con Più mine), anche senza colpiti.
- Stati: vulnerabilità +25% danno subito, indebolimento −35% danno inflitto, rallentamento −50%, paralisi = stop, bruciatura nel tempo  **[Claude]**
- Boss: resistenze scelte da Claude, variabili per boss (mini-boss spinte 40-80% e stati 25-55%; finale 85% e 60%); boss finale vita base 400 al livello 10, 2250 al 20, 1450 al 30, dal 40 con la formula del § 5, danno alla cupola 8; mini-boss vita 480, danno 9  **[da rivedere]**
- Cupola larga (revisione 3): il profilo di collisione ha raggio orizzontale 215 px (prima 172), altezza invariata. Vale per il contatto dei nemici (ai bordi ora si fermano a circa y 517 invece di 550), per il bordo contro cui si fermano i rimbalzi del laser e per il punto in cui nascono le mine. **[Claude]** (da rivedere dopo la misura) Le sfere orbitanti del Thunderbolt seguono il profilo nuovo, ma solo nella parte visibile (da x≈12 a x≈348): l’arco su cui si muovono si accorcia, così non escono dallo schermo. **[deciso]** (seguire il profilo nuovo) · limite all’arco visibile **[Claude]**
- Firewheel Drone (revisione 3): il drone non attraversa la cupola. Parte da dentro (dalla torretta) ed esce; poi il bordo della cupola è un muro e rimbalza, come sui bordi dello schermo. **[deciso]** (il drone) · lo stesso per i mini-droni **[Claude]** (lettura)
- Cristalli (`wisp`): velocità base da 72 a 60 px/s (restano il nemico più veloce; a ondata 20 circa 77 px/s invece di 92). Vita, danno e numero invariati. **[deciso]** (la riduzione) · 60 **[Claude]** (da misurare con i bot)

Interpretazioni di Claude **confermate**: Disruption Drone lv3 “aumento intervallo del danneggiamento” = danneggia più spesso (ogni 0,6 s);
Gravity Vortex Gun, “75% dello schermo” = 75% dell’altezza (percorso 253 px → 480 px con 3 pile); Hive, un “colpo” è una raffica
(i proiettili per colpo non contano nel limite di 10 colpi); “knockdown” del guardiano = knockback.

## 11. Decisioni aperte

- **Combo tra due torrette**: definite in § 3 e § 10. Aperti: nomi delle carte, numeri provvisori (§ 10) e tipo di danno (proposta: della secondaria).
  Da misurare con i bot (carte offerte e prese per partita): con la condizione sulla chain della secondaria è probabile che escano meno di una volta a partita. **[da misurare]**
  Prima misura leggera (1.15.0, 10 partite per bot, random / smart; carte offerte dopo le ondate, prese anche dai mini-boss): livello 15 pool libero 0,3 / 0,1 offerte a partita
  (prese 0,2 / 0,1); livello 25 pool libero 0 / 0; livello 25 pool completo 0,1 / 0,3 (prese 0 / 0,1). Per confronto, combo del guardiano offerte 0,1-0,5 a partita.
  Conferma: escono molto meno di una volta a partita. Nessun valore cambiato; se vanno rese più frequenti, le leve sono il peso delle carte combo (0,4) e le condizioni. **(aperto)**
- **Sigilli**: flusso e albero decisi in § 16. Aperti: costi e livelli massimi dei nodi, valori dei tetti, dettagli dei nodi della barriera (elenco in fondo al § 16). Valori della fase 2 tutti provvisori (§ 16); curva dal 31 tarata con l’albero atteso (§ 5): va rifatta quando arriva l’equipaggiamento. Letture di Claude nella fase 1 da confermare (§ 16): Sblocco permanente dopo tutti gli altri nodi, torrette equipaggiate e carte sbloccate valide in tutti i livelli. **Moduli** (§ 15): vedi sotto.
- **Ranger e Protezione planetaria** (§ 17): sblocco al livello 60 **[deciso]**. Aperti: danni, portate e valori intermedi dei supporti, valore F e sua crescita con la scala, difficoltà dei livelli, numero e valori dei nemici, X e Y delle abilità, formule dei boss per livello, punti vita e velocità dei boss, formula del kamikaze.
- **Pacco regalo** (§ 17): timer, vita, velocità e tabella della ricompensa di equipaggiamento in Epica sono **[Claude]**, accettati e da provare a mano; probabilità 25% e ritmo dei frammenti da misurare con i bot. **(aperto)**
- **Boss finale**: abilità speciali o solo tanta vita? (ora solo tanta vita)
- **Mini-boss dal livello 11** (non dal 21): a tetto lv2 il budget è 28 su 39 necessari, quindi nessun surplus; da confermare.
- **Difficoltà dal livello 31**: ritarata nella 1.12.1 con albero, equipaggiamento e un po’ di Epica attesi (pendenza 1,2, scalino 3, fattori del boss per muro, § 5 e § 16):
  muri dal 40 al 200 in media al 59,3%, dentro la fascia 50-70% (§ 15, **[deciso]**). Nella 1.15.1 (rarità dei drop ridotte) media 50,9%, con 60, 80, 90, 140, 150 e 190 sotto il 50%: lasciati così in attesa dei ranger **[deciso]** (Marco; misura in § 16). Vita, danno, numero e velocità crescono tutti in modo lineare con `effD`: dal 30 al 200
  vita ×2,97, danno ×2,13, numero ×1,62, velocità ×1,26 (prima ×1,49, ×1,28, ×1,15). Senza equipaggiamento i muri dal 40 diventano quasi impossibili (40 17%, 100 3%): **va bene così** **[deciso]** (Marco, dopo la 1.11.0). Indicazione di Marco **[deciso]**: oltre il 30 i nemici devono diventare **sia più numerosi sia più forti di base**,
  con una curva di incremento; forma della curva da decidere con i bot e l’equipaggiamento.
- **Boss Physical**: con l’albero i muri con boss Physical (90, 140, 190) misurano 13-27%, quelli Electric 43-48%: il guardiano è Physical e il boss gli resiste
  (tabella delle resistenze segnaposto, § 6). Da rivedere con le resistenze vere.
- **Resistenze dei nemici normali**: la tabella attuale è un segnaposto di Claude.
- **Idee messe da parte**: Modulo con “+1 vita barriera per nemico ucciso” (rischio di rigenerazione quasi illimitata; da riprendere con un tetto per ondata o per partita).
- **Nomi** definitivi delle due famiglie di chip (provvisori: Sigilli e Moduli).
- **Moduli** (§ 15): valori X per rarità e regole di calcolo proposti da Claude, da confermare e poi misurare con i bot.
- **Equipaggiamento** (§ 15, costruito nella 1.10.0): aperti i valori provvisori (tabella delle rarità, colori), la schermata e le letture degli effetti di Claude (§ 15, “Costruito”), la misura con i bot dell’equipaggiamento atteso (muri al 50%).
- **Guardiano e torrette (grafica)**: il guardiano diventa una figura da personaggio con un’arma puntata verso l’alto, al posto della freccia (non coerente con il resto). Guardiano e torrette hanno parti mobili che seguono la direzione di sparo, invece di figure statiche. **[deciso]** Aperto: quali torrette hanno una direzione (Disruption Drone e Hive non ne hanno una chiara), posa a riposo, velocità di rotazione, parte mobile ruotata o con 8-16 posizioni disegnate. Rotazione solo grafica, senza effetti sul gioco. Si fa con gli sprite (passo 2). **(da decidere)** Stato (1.9.3): il guardiano ha la figura nuova, ancora statica (il cannone punta sempre in alto); parti mobili e torrette restano da decidere. **[Claude]**
- **Barriera minata e cupola larga**: con la cupola larga 215 px il bordo esce dallo schermo, quindi le mine dell’abilità possono nascere fuori vista o in punti bassi ai lati. Proposta di Claude: le mine compaiono solo sulla parte visibile del bordo (x da 0 a 360). **(aperto)**

## 12. Contenuti mancanti (da definire con Marco)

Obiettivo § 3: per ogni torre e per il guardiano una chain da 1 lv1, 2 lv2, 1 lv3 e una da 1 lv1, 1 lv2, 1 lv3; 2 level up a lv1 e a lv2, almeno 1 a lv3.
**Complete tutte le torri e il guardiano** (revisioni 1 e 2; controllato da `tests/rev2.js`). Nessuna voce provvisoria rimasta.

- **Combo del guardiano**: tutte e 11 definite (`tests/combo.js`).
- **Combo tra due torrette**: tutte e 33 definite (§ 10). Costruite nella 1.15.0 con i test in `tests/combo.js`; numeri da misurare con i bot (§ 11).

## 13. Da costruire

Schermata degli sblocchi permanenti ·
ricompense e valute fuori dalla battaglia · livelli con un’identità propria (oggi i 50 livelli seguono la stessa regola di ondate) ·
difesa planetaria con aree da sbloccare · boss a tempo ·
audio e altre impostazioni · bilanciamento tarato da un giocatore vero.

## 14. Strumenti di lavoro

- **Checklist di revisione** (artefatto su claude.ai, aggiornata da Claude Code a fine lavoro, dal 17/11/2026): https://claude.ai/artifact/MdJMokJ4LquiwS7M4BViSX
- **Modifiche dal lato codice**: `docs/CHANGELOG.md`, con le voci della checklist da aggiornare.
- **Catalogo grafico** (`docs/catalogo-grafico.html`): pagina unica con schermate, torrette, guardiano, nemici, proiettili, effetti e animazioni, disegnati dal codice stesso del gioco;
  serve anche da file da passare ad altre IA per migliorare la grafica. Si rigenera con `npm run catalog` (in automatico prima di `npm test`);
  un test fallisce se è indietro rispetto ai file del gioco. Ogni voce del CHANGELOG riporta se è stato rigenerato. **[deciso]**
  (percorso, comando e test **[Claude]**)
  Il disegno sta in `app/draw.js`, modulo condiviso dal gioco e dal catalogo **[Claude]**.

## 15. Equipaggiamento e chip (costruito nella 1.10.0, da tarare)

- **Due famiglie di chip** (nomi provvisori **[da rivedere]**): **Sigilli**, che si spendono nell’albero dei potenziamenti permanenti (§ 16); **Moduli**, che si inseriscono negli slot dell’equipaggiamento. **[deciso]** (la distinzione; i nomi sono di Claude)
- **Equipaggiamento**: 6 pezzi (testa, armatura, guanti, stivali, arma, nucleo). Ogni pezzo dà una statistica base (tipicamente attacco del personaggio) e ha slot per i Moduli. Si trova come drop casuale a fine livello assieme ai chip. **[deciso]**
- **Statistica base per pezzo** **[deciso]** (divisa per ruolo, come i pool dei Moduli): **arma, guanti e testa** → danno del guardiano %; **armatura e stivali** → vita della barriera %;
  **nucleo** → danno di tutte le torrette %. Si somma agli altri bonus dello stesso tipo. Valori per rarità **[Claude] [provvisorio]** (da misurare con i bot):
  arma +6 / +10 / +15 / +21 / +28%; guanti e testa +4 / +7 / +11 / +15 / +20%; armatura e stivali +6 / +10 / +15 / +21 / +28% della vita base; nucleo +4 / +7 / +11 / +15 / +20%
  (comune → ancestrale). Valori accettati da Marco come punto di partenza. Con tutti i pezzi ancestrali: guardiano +68%, barriera +56%, torrette +20%, prima dei Moduli.
- **Drop** **[deciso]**: a **ogni vittoria dal livello 30** in poi (il 30 compreso), anche rigiocando un livello già completato, in Standard ed Epica.
  Quantità per vittoria **[deciso]**: **2 pezzi e da 2 a 3 Moduli** (il terzo al 50% **[Claude]**); in Epica un Modulo in più **[Claude]**.
  Tipo del pezzo e del Modulo a caso, con la stessa probabilità per i 6 tipi **[Claude]**.
- **Rarità dei drop** **[deciso]** (Marco: tabella “avara”, le rarità alte arrivano tardi e conta la fusione). Valori ridotti **[deciso]** (Marco, su proposta di Claude: l’epico usciva troppo spesso, circa uno a vittoria da D 100) · restano **[provvisorio]** fino alla misura con i bot sui muri. Le quantità per vittoria non cambiano.
  Stessa tabella per pezzi e Moduli; D è la difficoltà (in Epica D = livello + 30). Percentuali:

| D | Comune | Raro | Epico | Leggendario | Ancestrale |
|---|---|---|---|---|---|
| 30-59 | 83 | 16 | 1 | – | – |
| 60-99 | 60 | 30 | 9 | 1 | – |
| 100-139 | 42 | 39 | 14 | 4 | 1 |
| 140-179 | 30 | 38 | 20 | 9 | 3 |
| 180 e oltre | 22 | 36 | 24 | 14 | 4 |

- **Colori della rarità** **[deciso]**: ogni rarità ha il suo colore, pieno per pezzi e Moduli, tranne l’**ancestrale, iridescente** (sfumatura che cambia colore).
  Colori **[Claude] [da rivedere]**, scelti per non confondersi con quelli dei tipi di danno: comune grigio `#8e98a4`, raro verde `#46c86e`, epico blu `#3d7bff`,
  leggendario rosso `#ff4d6a`, ancestrale iridescente.
- **Obiettivo di bilanciamento** **[deciso]**: l’equipaggiamento deve essere **premiante** e aiutare a superare i muri: con l’equipaggiamento atteso
  i muri dal 40 in poi passano dal **30% circa al 50-70%** di vittorie dei bot (fascia accettata da Marco nella taratura 1.11.0, per non alzare troppo la difficoltà). Dalla 1.14.2 **[deciso]** conta solo la **soglia minima del 50%**: sopra il 70% va bene (Marco: “non deve essere un sistema punitivo”; chi fa farming e ha equipaggiamento alto prima del tempo deve sentirlo). Le misure con i bot controllano solo che i muri non scendano sotto il 50%, con campioni leggeri. La curva dal 31 (§ 5) quindi non va rialzata fino a riassorbire tutto l’equipaggiamento.
- **Inventario** **[deciso]**: **nessun limite** a pezzi e Moduli (servono per le fusioni); un oggetto si può scartare a mano, senza compenso.
- **Blocco** **[deciso]** (Marco): ogni pezzo e Modulo si blocca **per esemplare** con un lucchetto, per non scartarlo né fonderlo per sbaglio. Gli esemplari uguali restano raggruppati:
  bloccando uno di 5 guanti rari la riga si divide in 1 bloccato + 4; il lucchetto della riga da 4 ne blocca un altro (2 + 3). Il lucchetto di una riga bloccata sblocca un esemplare
  alla volta e lo rimette nella pila dei simili, se c’è. Un esemplare bloccato non si scarta e non entra nelle fusioni: le fusioni usano solo gli esemplari non bloccati.
  Installare, togliere ed equipaggiare restano possibili. Letture **[deciso]**: sui pezzi equipaggiati e sui Moduli installati il lucchetto si vede e si tocca allo stesso modo,
  e il blocco segue l’esemplare quando torna in inventario (cambio di pezzo, sostituzione di un Modulo, “Togli”); toccando una riga si usa l’esemplare di quella riga, bloccato o no.
- **Moduli installati** **[deciso]**: si tolgono **gratis e senza perdite**, tornano in inventario e si possono installare in un altro pezzo dello stesso tipo.
- **Rarità** di equip e Moduli: comune, raro, epico, leggendario, ancestrale. Slot per rarità dell’equip: **1, 2, 3, 4, 5**. **[deciso]** (bonus base per rarità: da definire)
- **Moduli**: stesse 5 rarità; il tipo indica in quale pezzo entrano (6 tipi). Ogni Modulo ha **un effetto**, preso dal pool del suo pezzo
  (catalogo e pool sotto); la rarità decide il valore X. **[deciso]**
- **Fusione**: si fondono sia gli equip sia i Moduli, **per tutte le rarità**, e il risultato è della rarità successiva. **[deciso]**
  - Equip: **5 pezzi uguali** (stesso tipo e rarità).
  - Moduli: **5 Moduli dello stesso pezzo e della stessa rarità**, anche con effetti diversi; l’effetto del risultato si **estrae a caso dal pool
    del pezzo**, con i pesi sotto.
- **Doppioni**: nello stesso pezzo non si installano due Moduli con lo stesso effetto, di qualsiasi rarità; su pezzi diversi gli effetti si sommano
  (probabilità con tetto 100%). **[deciso]** **Sostituzione** **[deciso]** (Marco): un Modulo con lo stesso effetto e rarità maggiore di quello installato lo sostituisce direttamente,
  anche con slot pieni; il vecchio torna in inventario, senza perdite. A rarità uguale o minore l’installazione è rifiutata, con messaggio. Nel codice dalla 1.14.0 (`installCheck`; prima c’era solo il rifiuto dei doppioni); test in `tests/v114.js`.
  Il primo tocco dice “Tocca di nuovo: sostituisce l’epico”, dopo la sostituzione “Il Modulo epico torna in inventario” **[Claude]**.

### Catalogo degli effetti dei Moduli **[deciso]** (valori X: tabella più sotto)

Gli effetti 4, 12 e 17 hanno una parte di danno che parte **negativa nel comune** e diventa **positiva dal leggendario**. Gli effetti 22 e 30
(esclusivi) partono da una probabilità bassa nel comune e arrivano al **100% nell’ancestrale**; il 29, che sta su due pezzi, si ferma al **50%**,
così per renderlo certo servono due Moduli ancestrali. **[deciso]**

| # | Effetto | Peso |
|---|---|---|
| 1 | Probabilità di critico +X% | 3 |
| 2 | Danno del guardiano +X% | 3 |
| 3 | +X% danni per ogni torre piazzata in battaglia | 2 |
| 4 | +1 proiettile del guardiano e −/+X% danni | 1 |
| 5 | +X% danni per ogni nemico vicino alla fortezza | 3 |
| 6 | +X% danni ai nemici con un debuff | 3 |
| 7 | Cadenza di fuoco −X% (intervallo più breve tra una salva e l’altra) | 2 |
| 8 | Le salve del guardiano allungano del X% la durata dei debuff (una sola volta per nemico con uno stato) | 2 |
| 9 | +X% danni per ogni Modulo installato | 2 |
| 10 | Riduzione del X% del danno subito dalla barriera a ogni colpo e contrattacco pari al X% del danno del guardiano per i primi X colpi nemici | 1 |
| 11 | Barriera +X vita e danno subito dalla barriera −X | 3 |
| 12 | Danni −/+X% e +X% danni per ogni carta scelta in battaglia | 2 |
| 13 | +X% danni ai nemici vicini alla barriera | 3 |
| 14 | Immunità per X s quando la vita della barriera scende sotto il 20% | 1 |
| 15 | Cooldown delle abilità della barriera −X% | 2 |
| 16 | Ripristina il X% della vita della fortezza per ogni mini-boss o boss ucciso | 2 |
| 17 | Penetrazione dei proiettili del guardiano +1 e −/+X% danni | 2 |
| 18 | +X% danni ai nemici con più del 70% di vita | 3 |
| 19 | Danno da esplosione del guardiano +X% | 3 |
| 20 | Danno aggiuntivo pari al X% della vita massima del bersaglio (al massimo il doppio del danno del guardiano) | 1 |
| 21 | X refresh delle scelte per battaglia | 1 |
| 22 | X% di probabilità di 4 carte tra cui scegliere invece di 3, a ogni ondata (la scelta resta una) | 1 |
| 23 | Danno force +X% (torrette force) | 3 |
| 24 | Danno physical +X% (torrette physical) | 3 |
| 25 | Danno elettrico +X% (torrette elettriche) | 3 |
| 26 | Danno fuoco +X% (torrette fuoco) | 3 |
| 27 | Danno energy +X% (torrette energy) | 3 |
| 28 | Tutti i danni delle torrette +X% | 1 |
| 29 | X% di probabilità che il guardiano parta dal livello 2 (si scelgono subito anche carte lv2; le lv1 restano) | 1 |
| 30 | X% di probabilità che tutte le torrette della battaglia partano dal livello 2 (come sopra) | 1 |

**Effetti rari** (1.12.0) **[deciso]** (Marco): gli effetti di peso 1 (4, 10, 14, 20, 21, 22, 28, 29, 30) escono insieme con il **5%** nel comune e il **30%** nell’ancestrale
(raro 11%, epico 18%, leggendario 24% **[Claude]**), nei drop e nelle fusioni; dentro il gruppo dei rari e in quello degli altri l’effetto si estrae con i pesi.

**Pesi** **[Claude]** (accettati da Marco): 3 = frequente, 2 = medio, 1 = raro (gli effetti più forti). La probabilità di un effetto è il suo peso diviso
la somma dei pesi del pool (somme: arma 23, guanti 22, stivali 22, armatura 20, testa 18, nucleo 17; in testa e nucleo gli effetti rari pesano di più, perché ne
contengono 4 su 9).

### Pool per pezzo **[deciso]** (la regola) · ripartizione **[Claude]** (accettata da Marco)

Ogni pezzo ha un pool di **9 effetti**: **1 esclusivo** e 8 condivisi con altri pezzi. Con 30 effetti: 6 esclusivi e 24 condivisi, ognuno in 2 pool.

| Pezzo | Esclusivo | Condivisi |
|---|---|---|
| Arma | 4 (+1 proiettile) | 1, 2, 7, 17, 18, 19, 23, 24 |
| Guanti | 20 (% vita massima) | 1, 6, 7, 8, 17, 19, 25, 26 |
| Testa | 22 (4 carte tra cui scegliere) | 2, 3, 9, 12, 18, 21, 27, 29 |
| Nucleo | 30 (torrette dal lv2) | 3, 9, 21, 23, 25, 27, 28, 29 |
| Armatura | 10 (riduzione danni e contrattacco) | 5, 11, 12, 13, 15, 16, 24, 28 |
| Stivali | 14 (immunità sotto il 20%) | 5, 6, 8, 11, 13, 15, 16, 26 |

Criterio: arma e guanti per l’attacco del guardiano, armatura e stivali per barriera e difesa, testa per le carte, nucleo per le torrette.
I 5 tipi di danno e “tutti i danni” sono distribuiti in modo che ogni tipo stia in 2 pezzi.

### Valori X per rarità **[Claude] [da rivedere]**

Valori di partenza, da misurare con i bot quando l’equipaggiamento esiste nel codice. Riferimenti usati: barriera 100 di vita, colpi nemici da
1,5 a 9 (mini-boss 9), guardiano 7 di danno ogni 0,15 s, carte “+1 proiettile” a −15%, repulsione ogni 14 s, fino a 4 torrette, 19-28 carte
per partita, al massimo 30 Moduli installati (6 pezzi ancestrali). Criterio: dal comune all’ancestrale il valore cresce circa di 5 volte,
e anche gli slot passano da 1 a 5, quindi un pezzo ancestrale pieno vale circa 25 comuni (la fusione ne chiede 625: per questo i drop devono
dare direttamente rarità alte).

| # | Effetto (in breve) | Comune | Raro | Epico | Leggendario | Ancestrale |
|---|---|---|---|---|---|---|
| 1 | Probabilità di critico | 3% | 5% | 8% | 11% | 15% |
| 2 | Danno del guardiano | +5% | +9% | +14% | +20% | +28% |
| 3 | Danni per torre piazzata (max 4) | +1,5% | +2,5% | +4% | +5,5% | +7% |
| 4 | +1 proiettile, danno del guardiano | −20% | −12% | −5% | +3% | +10% |
| 5 | Danni per nemico vicino alla fortezza (max 10) | +1% | +1,5% | +2% | +3% | +4% |
| 6 | Danni ai nemici con un debuff | +5% | +9% | +14% | +20% | +28% |
| 7 | Cadenza del guardiano | −3% | −5% | −8% | −11% | −15% |
| 8 | Durata dei debuff | +10% | +18% | +27% | +38% | +50% |
| 9 | Danni per Modulo installato | +0,3% | +0,5% | +0,7% | +0,9% | +1,2% |
| 10 | Riduzione danno per colpo / contrattacco / colpi | 5% / 50% / 3 | 8% / 100% / 4 | 12% / 150% / 5 | 16% / 200% / 6 | 20% / 300% / 8 |
| 11 | Vita barriera (% della base) / danno subito | +8% / −3% | +15% / −5% | +25% / −8% | +35% / −11% | +50% / −15% |
| 12 | Danni / per carta scelta | −10% / +0,4% | −6% / +0,6% | −3% / +0,8% | +2% / +1% | +5% / +1,2% |
| 13 | Danni ai nemici vicini alla barriera | +5% | +9% | +14% | +20% | +28% |
| 14 | Immunità sotto il 20% di vita | 1,5 s | 2 s | 3 s | 4 s | 5 s |
| 15 | Cooldown abilità della barriera | −5% | −9% | −13% | −18% | −25% |
| 16 | Vita ripristinata per mini-boss o boss | 2% | 3% | 5% | 7% | 10% |
| 17 | +1 penetrazione, danno del guardiano | −15% | −9% | −4% | +2% | +8% |
| 18 | Danni ai nemici sopra il 70% di vita | +6% | +11% | +16% | +23% | +32% |
| 19 | Danno da esplosione del guardiano | +8% | +14% | +22% | +30% | +40% |
| 20 | % della vita massima del bersaglio | 0,3% | 0,5% | 0,8% | 1,1% | 1,5% |
| 21 | Refresh delle scelte per battaglia | 1 | 1 | 2 | 2 | 3 |
| 22 | Probabilità di 4 carte | 10% | 25% | 45% | 70% | 100% |
| 23-27 | Danno di un tipo (torrette) | +6% | +11% | +17% | +24% | +32% |
| 28 | Tutti i danni delle torrette | +4% | +7% | +11% | +15% | +20% |
| 29 | Probabilità guardiano dal lv2 | 5% | 12% | 22% | 35% | 50% |
| 30 | Probabilità torrette dal lv2 | 10% | 25% | 45% | 70% | 100% |

Regole di calcolo **[Claude] [da rivedere]**:
- Tutti i “+X% danni” dei Moduli si **sommano in un solo bonus** (non si moltiplicano tra loro), poi moltiplicano il danno.
- Destinatari **[deciso]**: 2-9, 12, 13, 17-20 valgono **solo per il guardiano**; 23-28 solo per le torrette.
- Critico (1): danno ×1,5, come il Colpo critico della Railgun; vale per i proiettili del guardiano.
- Vicino alla fortezza (5) e alla barriera (13): entro 80 px dalla barriera. Il 5 conta al massimo 10 nemici.
- Cadenza (7): riduce l’intervallo tra le salve (0,15 s → 0,1275 s con un ancestrale). Sta su arma e guanti: al massimo −30% con due ancestrali.
- Durata dei debuff (8): un solo allungamento per nemico e per stato, alla prima salva che lo colpisce mentre ha lo stato.
- Riduzione per colpo (10): ogni colpo nemico alla barriera fa X% di danno in meno (si somma alla riduzione di albero, META e Modulo 11, con un **tetto del 50% sul totale**);
  i primi N colpi nemici ricevono il contrattacco, una volta per battaglia. I numeri del contrattacco sono ciano.
  **[deciso]** (Marco: riduzione permanente a ogni colpo, non un pool; tetto 50%) · percentuale al posto del valore fisso, stessi X, tetto condiviso, numeri ciano **[Claude]** (da misurare)
- Barriera (11): vita e riduzione in **percentuale**, così restano utili anche quando i nemici fanno più danno. Sta su armatura e stivali: con
  due ancestrali la vita raddoppia (100 → 200 oggi) e il danno subito scende del 30%. Prima proposta (+5…+30 di vita, −0,1…−0,5 per colpo)
  scartata: al livello 50 un asteroide all’ondata 20 fa circa 15 di danno e −0,5 era quasi nulla.
- Immunità sotto il 20% (14): una volta per battaglia.
- Vita ripristinata (16): al massimo 4 volte per battaglia (3 mini-boss e il boss), quindi il tetto per partita è implicito.
- % della vita massima (20): un tiro per salva, sul primo nemico colpito; al massimo il doppio del danno del guardiano (14 oggi).
- Probabilità (22, 29, 30): si tira una volta a inizio battaglia (22 a ogni ondata); su pezzi diversi le probabilità si sommano fino al 100%.
- **Fusione di un equip con Moduli inseriti**: i Moduli tornano in inventario. **[deciso]**
- **Beneficiari**: equip e Moduli potenziano personaggio e barriera; le torrette beneficiano dei potenziamenti sbloccati con i Sigilli. Anche barriera e guardiano hanno un albero dei Sigilli (§ 16); i nodi “del tipo” valgono solo per le torrette. **[deciso]**
  Eccezione **[deciso]**: gli effetti dei Moduli 23-28 (danni delle torrette) e 30 (torrette dal lv2) valgono per le torrette.
- **Vincoli di design**: nessun effetto dà scelte o carte in più da prendere (il budget di scelte del § 4 resta valido); i bonus dello stesso tipo si sommano; gli effetti sulla vita della barriera hanno un tetto per partita; i bonus al danno sono in percentuale. **[Claude]** (accettati da Marco)
  Eccezione **[deciso]**: sono ammessi gli effetti che cambiano quali carte compaiono o da che livello si parte (21 refresh, 22 quattro carte
  tra cui scegliere, 29 e 30 partenza dal livello 2). Partire dal livello 2 non cambia il numero di potenziamenti (12 per entità) né il numero
  di level up: l’entità resta di lv2 fino al level up successivo, quindi ne ha due di lv2. Le carte di lv2 (level up lv2, combo che richiedono
  il lv2, voci chain lv2) possono comparire fin dalla prima scelta; dopo i primi tre potenziamenti il primo level up può essere sia di lv1 sia
  di lv2. Le regole delle chain restano valide: la voce lv2 si propone solo dopo aver scelto la voce lv1 della stessa chain.
- **Da misurare con i bot** (livelli oltre il 30, equipaggiamento nullo, medio e massimo): tabelle di drop per rarità e difficoltà, statistica base dei pezzi per rarità, bonus per rarità (valori X degli effetti), potenza totale dell’equipaggiamento completo, peso degli effetti 21, 22, 29 e 30 sul budget di scelte. Con fusione 5:1 un ancestrale vale 625 comuni: i drop devono dare direttamente rarità alte.

### Costruito (1.10.0) · scelte di Claude **[Claude] [da rivedere]** dove non indicato
- **Dati e regole** come sopra: 6 pezzi, 5 rarità, 30 effetti con pesi e pool, valori X, statistica base, drop (2 pezzi e 2-3 Moduli, Epica +1), tabella delle rarità,
  fusione 5:1 di pezzi e Moduli, doppioni, scarto, Moduli che si tolgono gratis. Nel codice: `RARITY`, `PIECES`, `MOD`, `DROP`, `DROP_RARITY`; inventario in `progress.gear`.
- **Drop**: a ogni vittoria con difficoltà almeno 30 e livello 30 completato, quindi dal primo completamento del 30 e in **tutti i livelli di Epica** (difficoltà ≥ 31).
  Tipo del pezzo e del Modulo a caso, 6 tipi con la stessa probabilità; l’effetto del Modulo si estrae dal pool con i pesi.
- **Inventario**: pezzi uguali (tipo e rarità) e Moduli uguali (pezzo, rarità, effetto) sono intercambiabili e si contano; solo il pezzo equipaggiato porta Moduli.
  **Cambiando pezzo** i Moduli passano al nuovo finché ci sono slot, gli altri tornano in inventario **[deciso]** (confermato da Marco); “Togli” rimette in inventario pezzo e Moduli.
- **Schermata** “Equipaggiamento” (menu, accanto all’albero, dal livello 30): i 6 pezzi in alto (bordo del colore della rarità, Moduli installati), il pezzo scelto con
  statistica e slot, sotto l’inventario di quel pezzo in due schede (Pezzi, Moduli per rarità) con tre modalità: **Equipaggia/Installa** (due tocchi: il primo seleziona e mostra cosa cambia, il secondo conferma; toccare altro annulla), **Fondi** (pezzi: due tocchi;
  Moduli: si scelgono 5 righe, anche diverse, poi “Fondi ora”), **Scarta** (due tocchi). Un Modulo installato si toglie con due tocchi.
  Lucchetti (1.14.0) **[Claude]**: un pulsante con il lucchetto a destra di ogni riga dell’inventario, di ogni Modulo installato e accanto a “Togli” per il pezzo equipaggiato;
  chiuso e giallo se bloccato. Le righe dei pezzi si stringono se le righe bloccate non ci stanno; al primo tocco di Equipaggia la riga dice cosa cambia
  (“Tocca di nuovo: danno del guardiano +15% → +21%”, più i Moduli che tornano in inventario). Sopra: totale di guardiano, barriera e torri.
- **Icone** (1.11.0) **[Claude]**: sagome dei 6 pezzi (cannone, guanto, elmetto, corazza, stivale, nucleo esagonale) e chip per i Moduli (con l’iniziale del pezzo), del colore della rarità; nei 6 riquadri, nelle righe dell’inventario, negli slot e nella vittoria.
- **Vittoria**: tasselli con gli oggetti presi, del colore della rarità. **Avviso del 30**: “cadono a ogni vittoria. Equipaggiali dal menu.”
- **Letture degli effetti**:
  - Un solo bonus di danno del guardiano: statistica base di arma, guanti e testa + Moduli 2, 3, 4, 5, 6, 9, 12, 13, 17, 18 (i valori negativi di 4, 12 e 17 entrano qui);
    moltiplica il danno insieme agli altri bonus (carte, albero). 6, 13 e 18 si valutano sul nemico colpito, 3, 5 e 12 a ogni salva.
  - 1 critico: per ogni proiettile del guardiano che colpisce (anche ventaglio e clone), danno ×1,5. 3: torrette in campo in quel momento (max 4).
    5 e 13: nemici entro 80 px dal bordo della cupola (5: al massimo 10). 12: “carte scelte” = **tutte** le carte prese nella partita, anche quelle dei mini-boss **[deciso]** (Marco, 1.10.1).
  - 7: intervallo tra le salve × (1 − X). 8: alla prima salva che colpisce un nemico con uno stato (rallentamento, indebolimento, vulnerabilità, bruciatura, paralisi), una volta per stato.
  - 10: ogni colpo alla cupola è ridotto del X%; i primi N colpi nemici ricevono un contrattacco physical pari a X% del danno del guardiano (con i suoi bonus).
    Testo del Modulo (1.14.2) “Barriera: danno −X%, contrattacco Y% ×N” **[Claude]** (la forma del brief, “Danno alla barriera −X% · …”, supera i 46 caratteri dei testi dei Moduli).
    Numeri del contrattacco: ciano #7fe8ff, 16 px invece di 12, durata 1,2 s invece di 0,7 (stesso limite di 60 numeri).
  - 14: una volta per partita, quando la vita scende sotto il 20%. 16: anche il boss finale, al massimo 4 volte.
  - 19: esplosioni dei Colpi esplosivi del guardiano. 20: il primo proiettile di ogni salva, sul primo nemico che colpisce (senza probabilità), al massimo 2× il danno del colpo.
  - 21: pulsante “Rinnova le carte (n)” sotto le carte (o tasto R): nuove carte, stesso numero. 22: a ogni ondata, 4 carte più basse; tasto 4.
  - 29 e 30: un tiro a inizio partita; 30 vale per le torrette equipaggiate e per quelle che arrivano dopo. Senza questi Moduli non si consuma nessun tiro casuale (le misure dei bot restano confrontabili).
  - Riduzione del danno (11) e del cooldown (15) si sommano all’albero, con i tetti del § 16 (40% e 60%).
- **Salvataggio**: versione 3 (§ 7). **Taratura** (1.11.0): muri dal 40 al 200 in media al 59,8% con l’equipaggiamento atteso (numeri in § 16, “Taratura 1.11.0”).

## 16. Sigilli e albero dei potenziamenti (da costruire)

- **Valuta**: i Sigilli (◆) si spendono in tutte le sezioni dell’albero. **[deciso]**
- **Sigilli maggiori** (✦, dalla 1.12.0) **[deciso]** (Marco): seconda valuta, per ora solo dai boss in **Epica**: il **boss finale** e, con bassa probabilità, i **mini-boss**,
  ma mai più di 1 per livello dai mini-boss (a parte il boss finale). Valori **[Claude] [provvisorio]**: boss finale 1 a ogni vittoria su di lui (anche rigiocando),
  mini-boss 10% ciascuno; il maggiore si prende subito alla sconfitta del boss (anche se poi la partita è persa). Mostrato a schermo e nella vittoria.
- **Costi dalla 1.12.0** **[deciso]** (Marco; barriera dalla 1.14.0):
  - sblocco delle carte chain e level up (torrette e guardiano): costo uguale al **livello della carta** (lv1 1, lv2 2, lv3 3 Sigilli);
  - **carte standard potenziabili**: si sbloccano con i maggiori. Nodi da 20 livelli (Danno maggiorato di torrette e guardiano, sezione per tipo): **1 maggiore ai livelli 1, 6, 11, 16**
    (4 in tutto) più i Sigilli normali di sempre; nodi da 5 livelli delle torrette (e Durata degli stati): 1 maggiore allo sblocco; guardiano: **+1 proiettile, Ventaglio potenziato
    e Frenesia potenziata** 1 maggiore **a ogni livello** più i Sigilli normali;
  - **Sblocco permanente** delle torrette: **3 maggiori** (nessun Sigillo normale);
  - **Barriera** **[deciso]** (Marco): ogni nodo di potenziamento costa **1 maggiore allo sblocco**, tranne Vita %: Riduzione danno, Vita fissa, Riduzione cooldown, Ignorare un colpo,
    Più carte più danno. **Vita %** (20 livelli): 1 maggiore ai livelli **6, 11, 16**, il livello 1 no, perché è la radice dell’albero della barriera e senza questa eccezione
    nessun nodo sarebbe acquistabile prima del primo maggiore (Epica). Si pagano anche i Sigilli normali di sempre. Le abilità d’ingresso (Rigenerazione, Repulsiva, Ustionante)
    non sono gratis: **1 Sigillo**. Chi aveva già completato il 40 con un salvataggio precedente le tiene **[deciso]**.
  - Nodi già comprati con i costi vecchi restano. Totale di maggiori per l’albero intero: guardiano 13, ogni torretta 9, sezione per tipo 25, barriera 8 (145 in tutto).
- **Flusso** **[deciso]**: i Sigilli cadono dal **livello 31** (nessuno prima). Standard: **1** per livello; Epica: **2** per livello (2 al primo completamento e 2 al premio della cupola al 100%, 4 in tutto), dal livello 1 di Epica. **[deciso]** (Marco; prima 3 e 3, **[da misurare]**)
  Si riscuotono al primo completamento. Non si riottengono completando di nuovo il livello, tranne **una sola volta per livello e modalità**, completandolo con la
  **barriera al 100% a fine livello** (la vita si misura alla fine: contano anche cure e Backup). Ogni livello e modalità paga quindi al massimo due volte.
  Dalla 1.14.1 **[deciso]** (Marco): se il **primo completamento è già con la cupola al 100%**, i due premi si prendono **subito insieme**, senza rigiocare. Un solo premio ciascuno, della stessa entità.
- **Struttura** **[deciso]**: una schermata con tre sezioni: **Barriera**, **Guardiano**, **Torrette** (con una sezione condivisa per tipo). Regola dei livelli (proposta di Marco): un nodo non supera il livello del nodo da cui dipende.
- **Tetti** **[deciso]** il principio, valori **[Claude] [da rivedere]**: hanno un tetto sul totale (equip + albero) solo la **riduzione del cooldown delle abilità** e la **riduzione del danno subito**.
  Il tetto sta sopra il massimo dell’equipaggiamento (cooldown −50%, danno −30%), così i nodi dell’albero servono anche a chi ha l’equip massimo. Nessuna abilità dura quanto il suo cooldown minimo. Gli altri bonus (danni di tipo, ecc.) non hanno tetto.
  Tetto sul totale della riduzione del danno subito: **50%** **[deciso]** (Marco; prima 40%, `TREE_CAP.red`). Il tetto del cooldown delle abilità resta com’è.

### Barriera
- **Spina** **[deciso]** (schema): Vita % → Riduzione danno. Da lì due rami.
  - **Potenziamenti avanzati**: Vita fissa · Riduzione cooldown abilità · torretta o guardiano con più carte (+cadenza) · ignorare un colpo (nodi 6 e 7 fusi: nemici normali e boss).
  - **Abilità** (fino a 3 equipaggiate dal livello 40; potenziabili nell’albero), in tre gruppi per ruolo, ognuno con un’abilità d’ingresso sempre sceglibile:
    - **Resistere**: Rigenerazione · Barriera di backup · Barriera impenetrabile
    - **Controllo**: Barriera repulsiva · Barriera congelante · Barriera riflettente
    - **Offesa**: Barriera ustionante · Barriera minata · Barriera potenziante
  - **Blocco fino al 40** **[deciso]** (Marco): la scheda Abilità resta bloccata finché non si è completato il livello 40; un overlay lo dice, con i livelli completati finora.
    Finché è bloccata non si comprano, potenziano né equipaggiano abilità. Nodi già comprati prima restano, senza rimborso automatico. Overlay e testo **[deciso]**. Testi **[Claude]**: lucchetto, “Abilità bloccate”, “Si sbloccano completando il livello 40”, “Livelli completati: N/40” (1.14.0).
- Le abilità con cooldown hanno un ciclo base di 40 s (Impenetrabile: minimo 20 s). I numeri per livello sono **[da rivedere]**.
- **Descrizione delle abilità** **[deciso]** (testo di Marco):
  1. **Rigenerazione** (rivista da Marco): rigenera X al secondo per Y secondi, al massimo Z volte; non si riattiva prima di 2·Y secondi dalla fine dell’effetto.
  2. **Barriera repulsiva**: ogni 40 s un’onda d’urto dà knockback ai nemici vicini alla barriera. L’onda è larga metà schermo e parte dal lato, sinistro o destro,
     dove ci sono più nemici; la potenza del knockback cresce con il livello.
  3. **Barriera riflettente**: ogni 40 s, per X secondi, la barriera riflette verso i nemici parte del danno che le stanno facendo; danno riflesso e durata crescono con il livello.
  4. **Barriera ustionante**: ogni 40 s, per X secondi, chi colpisce la barriera brucia; la durata cresce con il livello. L’intensità della bruciatura viene dalle statistiche
     delle torrette di fuoco, se in campo, altrimenti è un valore fisso.
  5. **Barriera minata**: ogni 40 s compaiono mine lungo il bordo della barriera; il numero cresce con il livello. Il danno delle mine viene dalle statistiche dell’Aeroblast,
     se in campo, altrimenti è fisso.
  6. **Barriera congelante**: ogni 40 s la barriera emette un gas refrigerante che indebolisce i nemici che lo toccano; potenza della riduzione ed estensione verticale del gas
     crescono con il livello.
  7. **Barriera di backup**: la prima volta che la vita si esaurisce compare una nuova barriera con il X% della vita originale; X cresce con il livello.
  8. **Barriera potenziante**: ogni 40 s una scarica di energia dà a torrette e guardiano +X% di danno per Y secondi; X e Y crescono con il livello; il bonus è cumulativo con gli altri.
  9. **Barriera impenetrabile**: ogni X secondi la barriera guadagna 1 immunità a un colpo; X scende con il livello, minimo 20 s.

### Torrette
- **Sezione condivisa per tipo** **[deciso]**: danno del tipo, durata degli status, danno di tutte le torrette. Valgono **solo per le torrette** (il guardiano ha già il suo albero e l’equipaggiamento).
- **Nodi per ogni torretta (10)** **[deciso]** (erano 9: il level up lv1 è stato aggiunto nella 1.9.4, Marco):
  - sblocco della chain da 3 voci (3 nodi, in sequenza);
  - sblocco di uno dei due lv2 dell’altra chain (1);
  - sblocco di un level up lv1 (1) e di un level up lv2 (1), come per il guardiano;
  - potenziamento delle 3 carte standard (3 nodi, con più livelli ciascuno): azzerano i malus e aumentano anche di molto i bonus, con l’obiettivo di restare efficaci fino a ~200 livelli di campagna;
  - **sblocco permanente della torretta** (1, nodo finale).
- **Sblocco permanente**: con il nodo acquistato la torretta si può equipaggiare prima dell’ondata 1, fino a 4. Dalla 1.10.1 le torrette equipaggiate **non consumano scelte** (prima le prime N scelte venivano saltate): le carte restano 19 (28 dal livello 11) in più delle torrette equipaggiate. Le torrette già equipaggiate non escono più come carte. **[deciso]**
- **Carte bloccate** (non disponibili fino all’acquisto, dal livello 1; i livelli 1-30 si giocano con il pool libero, vedi § 5) **[Claude] [da rivedere]**.
  Criterio: si blocca la carta che aggiunge una meccanica o il salto di potenza maggiore; restano libere quelle numeriche.
  Level up lv1 **[deciso]** (Marco, 1.9.4; elenco proposto da Claude e accettato): stesso criterio, e non si blocca mai un lv1 da cui dipende un level up successivo
  (Thunderbolt: Sfera sul campo serve a Sfere pungenti; Hive: Evoluzione I serve a Evoluzione II). Restano liberi 1 level up per livello, come per il guardiano.
  Nel codice: tabella `TREE_LOCKS` (anche il guardiano) e sblocchi in `META.unlocked`, per ora a mano; controllo in `tests/rev2.js` (pool libero) e `tests/combo.js` (combo bloccate). **[Claude]**

| Torretta | Chain da 3 voci bloccata | lv2 bloccato dell’altra chain | Level up lv1 bloccato | Level up lv2 bloccato |
|---|---|---|---|---|
| Sky Guard | Missili incendiari | Mini-missili esplosivi | Area infuocata | Doppio impatto |
| Laser | Raggio spazzante | Raggi debilitanti | Raggio persistente | Sfruttare i debuff |
| Disruption Drone | Teletrasporto | Scarica distruttiva | Esplosione finale | Campo destabilizzante |
| Aeroblast | Salva di schegge | Mine d’urto | Esplosioni ampie | Doppia esplosione |
| Thunderbolt | Fulmini ramificati | Scossa continua | Fulmini larghi | Fulmini corrosivi |
| Beam | Raggio amplificato | Attrazione | Vulnerabilità | Raggio vorace |
| Firewheel Drone | Mini-droni | Scia combustibile | Fiamme roventi | Fiamma crescente |
| Hive | Sciame | Onda rallentante | Colpi di forza | Droni kamikaze |
| Railgun | Proiettile diviso | Deflagrazione | Impatto | Impatto stordente |
| Teslacoil | Sovraccarico | Sfera rallentante | Esplosione a catena | Esplosioni paralizzanti |
| Gravity Vortex Gun | Buco nero statico | Varchi stabili | Buco nero iperdenso | Secondo buco nero |

### Guardiano **[deciso]** (10 nodi dalla 1.12.0)
- Sblocco della chain **Colpi esplosivi** (3 nodi, in sequenza); lv2 **Frenesia furiosa**; level up lv1 **Colpo pesante**; level up lv2 **Rimbalzo**.
- Potenziamenti: carta standard **Danno maggiorato**; riduzione del malus di **+1 proiettile**; **Ventaglio potenziato** (1.12.0, prima “ampliato”: non aggiunge proiettili, alza il danno dei secondari dal 30% all’**80%** del principale al livello 3; 47%, 63%, 80%); **Frenesia potenziata** (1.12.0, 3 livelli): danno in frenesia da ×1,35 a ×1,9, ×2,45, **×3** e carica **+2 s per livello** (32, 34, 36 s; con Carica rapida da 25). **[deciso]** (valori intermedi **[Claude]**)
- Restano libere: chain Frenesia (lv1, Carica rapida, lv3), Ventaglio, Perforazione II, Cadenza maggiorata, le tre carte standard.

### Fase 1 costruita (1.5.0)
- **Premi** come sopra. Fino alla 1.14.0 il premio della cupola al 100% si prendeva solo con un completamento **successivo** al primo; dalla 1.14.1 un primo completamento perfetto dà subito tutti e due i premi **[deciso]** (Marco).
- **Nodi** (generati da `TREE_LOCKS`): per ogni torretta 3 nodi della chain in sequenza, 1 per il lv2 dell’altra chain, 1 per il level up lv1, 1 per il level up lv2, e lo **Sblocco permanente** che richiede
  **tutti gli altri nodi della torretta** (lettura di “nodo finale” **[Claude] [da rivedere]**); guardiano: 3 nodi di Colpi esplosivi in sequenza, Frenesia furiosa, Colpo pesante, Rimbalzo.
  Ogni nodo di sblocco ha un solo livello.
- **Costi** (fino alla 1.11.0; dalla 1.12.0 vedi “Costi dalla 1.12.0” sopra): chain 1, 1, 2; altre carte 1; sblocco permanente 3. Una torretta completa costa 10 Sigilli, il guardiano 7, tutto l’albero di fase 1 117 (106 prima della 1.9.4).
  In Standard dal 31 al 50 si prendono al massimo 40 Sigilli (20 livelli × 2 premi), in Epica fino a 200 (50 livelli × 4).
- **Acquisto**: primo tocco sul nodo = selezione, secondo tocco = spesa (come “Abbandona”). 
  **Azzeramento per sezione** **[deciso]** (Marco): ogni sezione dell’albero (Guardiano, Torrette, Barriera) ha un pulsante che azzera i suoi nodi comprati e restituisce tutti i Sigilli
  e i maggiori spesi lì, per riassegnarli; due tocchi, come “Abbandona”. Letture **[Claude] [da confermare]**: Torrette comprende le 11 torrette e la sezione per tipo, e azzerandola
  tornano non equipaggiate le torrette dello Sblocco permanente; Barriera comprende potenziamenti e abilità, e azzerandola tornano non equipaggiate le abilità. I premi già riscossi
  (`claims`) non cambiano. Il rimborso si calcola dai costi attuali (per nodi comprati con costi vecchi può differire di qualche Sigillo). Non disponibile con una partita in sospeso (§ 2).
  Costruito nella 1.14.0: pulsante “Azzera” in alto a destra, vale per la sezione aperta e compare solo se c’è qualcosa da azzerare; al primo tocco diventa “Sicuro?” e la riga sotto il titolo
  mostra il rimborso (“Rimborso: X ◆ e Y ✦”) **[Claude]**.
- **Torrette equipaggiate**: si scelgono toccando lo Sblocco permanente già comprato (al massimo 4); valgono in **tutti i livelli e le modalità**, come le carte sbloccate
  (lettura **[Claude] [da rivedere]**). Ognuna occupa il primo slot libero (dalla 1.10.1 senza saltare scelte). `META.startTurrets` resta lo sblocco a mano per le prove.
- **Schermata**: menu → “Albero dei Sigilli” (si apre completando il 31; il pulsante mostra Sigilli ◆ e maggiori ✦): sezioni Guardiano, Torrette (griglia delle 11 torrette, nodi della torretta scelta), Barriera (solo l’elenco di ciò che arriverà).
  La schermata di vittoria mostra i Sigilli presi e, se resta, il premio della cupola al 100%.

### Fase 2 costruita (1.6.0) · valori **[Claude] [provvisorio]**
- **Nodi a livelli**: livello da 0 a max; il livello L costa 1 + ⌊(L − 1)/5⌋ Sigilli (1 per i livelli 1-5, 2 per i 6-10, 3 per gli 11-15, 4 per i 16-20):
  5 per un nodo da 5 livelli, 50 per uno da 20 (1.7.0; prima L Sigilli per il livello L). Regola dei livelli applicata: un nodo non supera
  il livello dei nodi da cui dipende (es. Riduzione danno al 2 solo con Vita % almeno al 2).
- **Carte standard delle torrette** (3 nodi per torretta: **Danno maggiorato fino al 20**, le altre fino al 5): con il nodo al livello L, per ogni pila della carta:
  bonus in % (danno, raggio, durata, altezza; per la Gravity Vortex Gun “Percorso più lungo” non è moltiplicato: il nodo dà +2% di danno dei buchi neri per pila e livello) ×(1 + 0,4·L), fino a ×3 al 5 e ×9 al 20 (Danno maggiorato da +25% a +75% per pila al 5, +225% al 20);
  ricarica (Ricarica ridotta, la parte “ricarica” di Più rapido) ×(1 + 0,2·L) (−12% → −24% per pila);
  bonus a numero (+1 perforazione della Railgun, Più colpi dell’Hive) ×(1 + 0,4·L) arrotondato (Railgun 1 → 3, Hive 2 → 6);
  malus (+1 missile, sfera, drone, proiettile, rimbalzo) −1/3 per livello: zero al 3, poi diventa bonus (−15% → +10% al 5; Laser −20% → +13,3%).
  Le carte con malus restano “+1” (il numero non cresce).
  **Testo della carta** (1.14.3): nella scelta delle carte, nelle ricompense dei mini-boss e nei potenziamenti presi la descrizione mostra il valore potenziato dal nodo
  (es. Danno maggiorato al 5: “Danno +75%”), uguale all’effetto applicato; il malus è arrotondato all’intero (“danno −13%”) per stare nei 260 px della carta. **[Claude]**
- **Guardiano**: Danno maggiorato come le torrette (20 livelli); +1 proiettile: solo riduzione del malus (3 livelli, zero al 3); Ventaglio ampliato: +1 proiettile secondario
  per livello (3 livelli, da 4 a 7, sempre entro ±0,6 rad). +1 perforazione resta senza nodo.
- **Sezione condivisa “Tipi”** (solo torrette): danno di un tipo +6% per livello (5 nodi, **fino al 20**: +120%), danno di tutte le torrette +3% (**fino al 20**: +60%), **durata degli stati +6%** (fino al 5)
  (un solo nodo globale: la domanda “per tipo o globale” resta aperta). La durata vale per gli stati delle torrette (rallentamento, bruciatura, indebolimento, paralisi,
  vulnerabilità, distruzione, scia combustibile) e quindi anche per le combo del guardiano che usano gli effetti delle torrette.
- **Barriera** (5 livelli, Vita % fino al 20: +200%): Vita % +10% → Riduzione danno −3% → da qui Vita fissa +10, Riduzione cooldown abilità −5% (oggi vale solo per la repulsione segnaposto
  di `META`), Ignorare un colpo 2% per livello (normali e boss insieme, nodi 6 e 7 fusi). Vita della cupola = base × (1 + Vita %) + Vita fissa.
  **Tetti** sul totale: riduzione del danno **40%**, riduzione del cooldown **60%** (sopra i massimi dell’equipaggiamento, −30% e −50%).
  **Più carte, più danno** **[deciso]** (Marco, al posto di “più carte (+cadenza)”): la torretta o il guardiano con più carte scelte nella partita ha danno
  +5/10/15/20/25% (5 livelli, dopo Riduzione danno). Letture **[Claude] [da rivedere]**: “carte” = pile di potenziamenti prese (anche quelle dei mini-boss);
  a parità hanno il bonus tutti quelli in testa; con zero carte nessuno; si ricalcola a ogni carta presa.
- Costo dell’albero intero (1.7.0): sblocchi 117, carte standard 660 (torrette) + 56 (guardiano), Tipi 305, Barriera 75: **1213 Sigilli** (1.9.4: +11 per i level up lv1). In Standard fino al 200
  se ne prendono al massimo 340 (circa 255 con metà dei premi della cupola), in Epica fino a 800 (200 livelli × 4): l’albero dura ben oltre il 200.
- **Misura con i bot** (1.6.0, prima della taratura, curva piena dal 31): livello 40 / 50 senza albero 3,0% / 0,5%; solo sblocchi 9,0% / 2,0%;
  nodi a livelli al 3 63,5% / 42,5%; albero pieno 88,0% / 72,0%.
- **Taratura 1.7.0** (`node tests/tools/curva.js`): i bot partono con l’**albero atteso**, cioè i Sigilli presi dal 31 al livello prima (1,5 per livello:
  il primo completamento e metà dei premi della cupola) spesi da una strategia semplice (prima nodi condivisi e danno, poi barriera, poi il resto).
  Risultati (pendenza 0,2, boss dal 40 con la formula del § 5): **muri dal 40 al 200 in media 32,6%** (200 partite ciascuno: 40 35,5% · 50 25,5% · 60 35,5% · 70 43,5% ·
  80 22,5% · 90 27,0% · 100 49,0% · 110 38,5% · 120 47,5% · 130 35,0% · 140 16,0% · 150 32,5% · 160 33,5% · 170 43,0% · 180 29,0% · 190 13,5% · 200 27,5%);
  livelli tra i muri (80-200 partite): 31 38,5% · 33 45,0% · 37 63,0% · 39 68,5% · 45 73,8% · 55 78,8% · 85 90,0% · 125 75,0% · 175 63,7% · 195 61,3%.
  Con 1 solo Sigillo per livello (nessun premio della cupola, 100 partite): 45 66% · 60 26% · 100 20% · 125 77% · 150 29% · 175 50% · 200 11%.
  Il 31 resta il livello più duro della sua decina (38,5%): non c’è uno sblocco come al 10 e al 20; l’equipaggiamento dovrebbe dare il respiro.
- **Taratura 1.8.0, con le abilità della barriera**: dal 40 completato i bot usano le tre abilità d’ingresso (Rigenerazione, Repulsiva, Ustionante) e ne comprano i livelli.
  Con il boss della 1.7.0 i muri dal 50 al 200 salivano al 39,5% di media (livelli intermedi 45 73% · 85 91% · 125 70,5% · 175 81% · 195 78%): coefficiente del boss
  da 1,1 a 1,3 (35,1%) e poi **1,5**: muri dal 50 al 200 in media **31,1%** (200 partite ciascuno: 50 26,0% · 60 30,5% · 70 34,0% · 80 18,0% · 90 16,5% · 100 41,5% ·
  110 35,5% · 120 41,5% · 130 33,0% · 140 17,0% · 150 34,5% · 160 42,5% · 170 47,0% · 180 36,5% · 190 18,0% · 200 25,5%); il 40 (senza abilità) 35,5%.
- **Mancano** (fase 3): abilità della barriera e i loro numeri; nodo “più carte”.
- **Taratura 1.12.1, con Sigilli maggiori e un po’ di Epica** (`EQUIP=1.5 node tests/tools/curva.js …`, `EPICA` = livelli di Epica per livello di Standard dal 50, default 0,5
  **[Claude] [provvisorio]**, accettato da Marco come “un po’ di Epica”): ogni livello di Epica dà 3 Sigilli (dalla modifica sui premi in Epica: 2 al primo completamento più metà del premio della cupola, 2 + 2 × 0,5 = 3, quindi la calibrazione resta valida con il 50% dei livelli di Epica chiusi al 100% **[Claude]** **[da misurare]**), i maggiori dei boss (≈ 0,27 dai mini-boss, 1 dal boss finale ogni 10)
  e un drop di Epica. Al 100 i bot hanno 175 Sigilli e 8 maggiori, al 200 475 e 27; spendono un maggiore come 5 Sigilli e saltano lo Sblocco permanente.
  Con la curva della 1.11.0 (e i costi della 1.12.0): media **81%** (110-180 tra 90 e 98%). Prove: pendenza 1,0 e scalino 3 → media 68%; **1,2 e scalino 3** → 56,8% (da 27,5 a 78).
  **Finale** (1,2, scalino 3, `FINAL_BOSS_K` del § 5; 200 partite per muro): 40 69,5 · 50 45,0 · 60 45,5 · 70 73,0 · 80 57,0 · 90 41,5 · 100 48,5 · 110 53,5 · 120 74,5 · 130 72,5 ·
  140 45,0 · 150 55,0 · 160 61,5 · 170 73,0 · 180 71,0 · 190 50,5 · 200 71,0: **media 59,3%**. Con le mine nuove (doppie, al massimo 25).
- **Taratura 1.11.0, con l’equipaggiamento atteso** (`EQUIP=1.5 node tests/tools/curva.js …`; equipaggiamento da `tests/tools/equip-atteso.js`: drop veri per 1,5 vittorie
  per livello dal 30, poi fusioni, pezzo più raro e Moduli migliori; al 40 guardiano +29%, al 100 +97%, al 200 +152%). Obiettivo **[deciso]**: muri dal 40 almeno al 50% (fino alla 1.14.1 era “tra il 50 e il 70%”; il tetto è stato tolto, vedi § 15).
  Con la curva della 1.8.0 i muri dal 40 al 200 erano al **93%** (40 82% · 100 99% · 170-200 98-100%). Prove (100 partite per muro, 40/70/100/140/200): pendenza 0,5 →
  71/67/87/45/82 · 0,8 → 73/59/76/16/45 · 1,2 → 60/33/51/4/4; pendenza 0,65 su tutti i muri: media 64%; 0,7 con tre boss corretti: 70,8%.
  **Finale** (pendenza 0,8, scalino 2, `FINAL_BOSS_K`; 200 partite per muro, 400 al 140 e al 150): 40 67,5 · 50 64,0 · 60 71,0 · 70 59,0 · 80 63,0 · 90 55,0 · 100 65,5 ·
  110 59,5 · 120 47,0 · 130 62,5 · 140 53,3 · 150 57,0 · 160 55,5 · 170 60,0 · 180 63,0 · 190 67,0 · 200 46,0: **media 59,8%**. Livelli intermedi: 35 77,5 · 45 93,5 · 75 98,0 ·
  125 84,5 · 175 99,5 (respiro tra i muri). **Senza equipaggiamento** (solo albero atteso): 40 17% · 100 3% · 200 0%: dal 40 l’equipaggiamento diventa necessario.
  Rumore circa ±7 punti per muro con 200 partite.

### Regole generali
- I Sigilli non danno scelte o carte in più: il budget di scelte (§ 4) resta valido. **[deciso]** Eccezione dalla 1.10.1: le torrette equipaggiate non consumano più scelte (§ 4).
- **Da misurare con i bot**: muri 10/20/30 con il pool libero; potenza richiesta fino a 200 livelli (con la formula attuale la vita base dei nemici è ×1,9 al 100 e ×3,2 al 200 rispetto al 30, ma la curva oltre il 30 cambierà);
  costi e livelli dei nodi; valori dei tetti; effetto sulle prime ondate delle torrette in anticipo; effetto dei maggiori sulla barriera: Vita % resta acquistabile fino al livello 5,
  ma Riduzione danno e gli altri 4 nodi richiedono un maggiore e arrivano dopo il primo (Epica); muri 40 e 50.
  **Misura 1.14.0** (`EQUIP=1.5 node tests/tools/curva.js 40,50 100`, 200 partite per muro, stessi semi): 40 **68,5% → 65,5%** · 50 **45,5% → 20,0%** (prima → dopo i maggiori della barriera; al 50 i bot hanno 28 Sigilli e 0 maggiori, quindi la barriera si ferma a Vita % 5).
  Il 50 scendeva sotto la fascia del 50-70% (§ 15). Prove (200 partite ciascuna, muro 50): Riduzione danno senza maggiore 24,0% (40: 75,5%); maggiore dal livello 2 di ogni nodo
  24,5% (40: 71,5%); solo nemici ×0,85 / ×0,75 32,0 / 35,0%; solo boss finale ×0,7 / ×0,55 29,5 / 38,5%; nemici ×0,8 + boss ×0,55 66,5%; **nemici ×0,85 + boss ×0,6 60,0%**.
  **Correzione [deciso]** (Marco, proposta di Claude): costi della barriera invariati, al muro 50 `WALL_ENEMY_HP` 0,85 e `FINAL_BOSS_K` 0,6 → **50 60,0%**, 40 invariato (65,5%).
  **Misura 1.14.2** (portata dal centro in basso, Vortex revisione 3, Modulo 10 in riduzione %, tetto 50%; `EQUIP=1.5 node tests/tools/curva.js L 100`, 100 partite per bot, random / smart, 1.14.1 → 1.14.2):
  40 **64 / 67 → 56 / 62** · 50 **52 / 68 → 55 / 55** · 100 **53 / 60 → 58 / 48**. Il 100 (smart) scendeva sotto la soglia minima del 50%:
  **correzione [deciso]** (Marco: “ritara il 100”), `FINAL_BOSS_K[100]` 0,75 → **0,65** → **58,3 / 53,3%** (60 partite per bot). Equipaggiamento con il Modulo 10 Epico (+12% riduzione, contrattacco 150% ×5):
  50 63 / 64 · 100 61 / 46; senza Modulo 10 e con il tetto al 40% gli stessi numeri del codice nuovo (il bot non ha il Modulo 10 e non arriva al tetto).
  Modulo 10 (60 partite, bot con il Modulo): al 50 riduzione totale media 17,0%, danno risparmiato 12,6%, 6,4 contrattacchi per partita; al 100 43,0%, 17,4%, 8,1.
  Muri 10/20/30 (`calib2.js`, 400 partite per bot, random / smart, 1.14.1 → 1.14.2): 10 **123 / 157 → 133 / 153** · 20 **105 / 158 → 117 / 144** · 30 **126 / 163 → 118 / 164**: intorno al 30-40%, invariati.
  Senza la regola “un level up per entità” stessi numeri, partita per partita: un’entità offre level up solo dopo 3 carte e di solito ne ha uno solo idoneo, quindi la regola scatta di rado.
  **Misura 1.15.1** (Sigilli in Epica 2 + 2 e tabella delle rarità ridotta; `EQUIP=1.5 node tests/tools/curva.js L 100`, 200 partite per muro, semi 1-100; `EPICA100` = quota dei livelli di Epica chiusi al 100%):
  1.15.0 rimisurata con gli stessi semi → 1.15.1 con quota 0,5 (tra parentesi quota 0 / quota 1): 40 58,0 → 57,5 · 50 56,5 → 52,0 · 60 41,5 → 36,0 (29,5 / 35,0) · 70 53,5 → 60,5 ·
  80 21,5 → 25,5 · 90 38,5 → 47,0 (36,5 / 48,0) · 100 57,0 → 53,0 (43,5 / 47,5) · 110 42,5 → 53,5 · 120 65,0 → 63,0 · 130 69,0 → 66,0 · 140 50,0 → 24,0 · 150 50,0 → 45,0 (36,0 / 45,0) ·
  160 65,0 → 51,0 · 170 77,0 → 65,5 · 180 80,5 → 64,5 · 190 51,5 → 48,0 · 200 70,0 → 54,0: **media 55,7% → 50,9%** (quota 0 48,9%, quota 1 51,8%). Il calo viene dalla tabella delle rarità
  (140, 150, 160-200); la quota pesa poco e dal 150 quota 0,5 e 1 danno gli stessi numeri (il limite sono i maggiori). Già la 1.15.0 era sotto il 50% al 60, 80, 90 e 110.
  Muri sotto la soglia: 60, 80, 90, 140, 150, 190. **[deciso]** (Marco): **per ora restano così**, nessuna ritaratura; da rivedere con i ranger in arrivo.
  **Misura 1.20.0** (nemici nuovi nella campagna dal 70, § 17 “Nemici nuovi nella campagna”; stessi semi e strumento della 1.15.1, 200 partite per muro):
  prima → con i nemici nuovi a vita piena → dopo la taratura (vita dei nemici nuovi ×0,7, giganti al 90, 130, 170, 190 ×0,75):
  70 60,5 → 29,0 → **54,5** · 80 25,5 → 15,5 → **21,5** · 90 47,0 → 38,0 → **52,0** · 100 53,0 → 37,0 → **58,0** · 110 53,5 → 49,5 → **55,5** · 120 63,0 → 57,5 → **69,0** ·
  130 66,0 → 56,0 → **56,0** · 140 24,0 → 17,5 → **31,0** · 150 45,0 → 42,0 → **51,0** · 160 51,0 → 50,5 → **53,5** · 170 65,5 → 38,5 → **57,5** · 180 64,5 → 59,0 → **69,5** ·
  190 48,0 → 36,0 → **55,0** · 200 54,0 → 50,0 → **63,5**: media dal 70 **51,5% → 53,4%**. Fuori dai muri: 75 64,0 → 68,0 · 105 83,5 → 86,5 · 145 70,5 → 61,5 (a vita piena).
  Senza gli speciali (prova): 70 50,0 · 100 54,0 · 140 22,0: il calo a vita piena veniva soprattutto dagli speciali. Restano sotto il 50% l’80 e il 140, già sotto prima (decisione della 1.15.1).
- **Risolti dal testo di Marco** (erano aperti): lato della Repulsiva (dove ci sono più nemici); Riflettente solo “parte” del danno (sotto il 100%); valore base di Ustionante
  e Minata (statistiche delle torrette, altrimenti fisso); Backup una sola volta per partita; Congelante usa l’indebolimento (niente stato nuovo per la velocità di attacco).
  Applicati da Claude nella fase 2, da confermare: nodi 6 e 7 fusi in “Ignorare un colpo”; un solo nodo globale per la durata degli stati.
- **Risposte di Marco** **[deciso]**:
  - Rigenerazione: nuova forma (sopra), con l’attesa di 2·Y secondi tra due attivazioni.
  - Ustionante: con torrette di fuoco in campo vale il valore maggiore; senza, valore fisso.
  - Minata: le mine ereditano i potenziamenti dell’Aeroblast, se in campo; minimo 4 mine, il massimo dipende dal tetto dell’abilità (per ora 5 livelli, si potrà alzare).
  - Congelante: indebolimento che cresce col livello, da un minimo di −25%; gas di 8 s, alto da 60 a 140 px.
  - Potenziante: il bonus **si somma** agli altri; X da +15% a +40%, Y da 6 a 10 s.
  - Impenetrabile: le immunità si accumulano, anche con quelle date da equipaggiamento o altri effetti; si vedono come un numero con uno scudo sulla vita della barriera.
  - Cooldown: partono sfalsati e si fermano durante la pausa e la scelta delle carte.
  - Equipaggiamento: **una abilità per gruppo**; ordine dello schema: Resistere Rigenerazione · Backup · Impenetrabile; Controllo Repulsiva · Congelante · Riflettente;
    Offesa Ustionante · Minata · Potenziante (la prima è l’abilità d’ingresso, sempre sceglibile).
  - Repulsiva: solo knockback.
  - Backup: se si attiva, il premio della cupola al 100% non si prende.
- **Letture e valori di Claude** **[Claude] [da rivedere]** (fase 3):
  - Rigenerazione scatta quando la vita scende sotto il 40% (soglia del testo originale); X in % della vita massima al secondo.
  - “Tetto dell’abilità 5” letto come 5 livelli: mine da 4 (livello 1) a 8 (livello 5).
  - Congelante da −25% (livello 1) a −45% (livello 5).
  - 5 livelli per ogni abilità; la prima di ogni gruppo al livello 1 senza spesa (dalla 1.12.0 costa 1 Sigillo), la seconda si sblocca con un nodo, la terza dopo la seconda.
  - Le abilità si equipaggiano dal livello 40 (completato).
  - Partenza sfalsata: la prima abilità con cooldown scatta a 10 s, la seconda a 20, la terza a 30. Le abilità con cooldown aspettano un nemico in campo
    (la Repulsiva un nemico vicino alla barriera) prima di scattare.
  - Costi: sblocco della seconda e della terza abilità di un gruppo 3 Sigilli; livelli 2-5 1 Sigillo ciascuno (come gli altri nodi). La terza non supera il livello della seconda,
    la seconda non supera quello della prima (regola dei livelli).
  - Valori per livello 1 → 5: Rigenerazione 2 → 4% della vita massima al secondo, per 5 → 7 s, 1 → 3 volte · Backup vita 20 → 60% · Impenetrabile un’immunità ogni 40 → 20 s ·
    Repulsiva spinta 50 → 130 px (solo i nemici vicini alla barriera, metà schermo) · Congelante −25 → −45%, gas 8 s alto 60 → 140 px · Riflettente 30 → 70% del danno per 4 → 8 s
    (danno force) · Ustionante 5 → 9 s, bruciatura di 3 s a 6 al secondo o al valore della torretta di fuoco più forte (Sky Guard: Missili incendiari; Firewheel: scia) ·
    Minata 4 → 8 mine sul bordo · Potenziante +15 → +40% per 6 → 10 s. Il nodo Riduzione cooldown e il suo tetto valgono per tutte; Impenetrabile non scende sotto i 20 s.
  - **Testi degli effetti** **[deciso]** (Marco): ogni descrizione che ha un valore, una durata o un cooldown lo riporta. Per le abilità della barriera il testo mostra il **cooldown effettivo**,
    cioè quello base (40 s) con le riduzioni di albero ed equipaggiamento già applicate (“ogni 34 s”). Le descrizioni possono occupare due righe in tutto l’albero e nella guida.
    L’attesa della Rigenerazione (2 × durata) non è ridotta dal nodo cooldown, e il testo mostra il valore reale. **[deciso]** (Marco). Testi delle abilità **[Claude]**:
    “sotto il 40%: 2%/s per 5 s, ×1 · attesa 10 s” · “una volta: la vita torna al 20%” · “scudo ogni 40 s” · “spinta 50 px · ogni 40 s” · “nemici −25% danno, 60 px, 8 s · ogni 40 s” ·
    “30% per 4 s · ogni 40 s” · “brucia 5 s · ogni 40 s” · “4 mine · ogni 40 s” · “+15% per 6 s · ogni 40 s” (livello 1, senza riduzioni). Fuori partita il cooldown si calcola
    dall’equipaggiamento attuale. Nell’albero la descrizione va su due righe solo se non sta in una (a capo prima di “→ livello successivo”). Le descrizioni delle carte senza numero
    sono elencate in `docs/proposte-testi.md`, **da approvare** (non applicate).
  - Il bonus della Potenziante si somma a quelli dell’albero (tipo, tutte le torrette, Più carte): per questo anche “Più carte, più danno” ora si somma invece di moltiplicare.
  - Fase 3 **costruita** nella 1.8.0 (vedi CHANGELOG); i vecchi segnaposto di rigenerazione e repulsione in `META` sono stati tolti (`META.domeAbilities` ora prende gli id delle nuove abilità).

## 17. Ranger e Protezione planetaria (costruiti: 1.16.0-1.21.0)

### Ranger
- Sblocco al completamento del **livello 60** di Standard. **[deciso]**
- **Due ranger per tipo di danno, 10 in tutto** **[deciso]** (Marco): uno di **supporto** (stati o statistiche, effetti sotto, “Nomi e supporti”) e uno di **conversione**. Aiutanti equipaggiabili, **al massimo 2**, ai lati del guardiano, si muovono con lui **[ipotesi di Marco] [da confermare]**; quando il guardiano è vicino al bordo, il ranger che uscirebbe dallo schermo si sposta **davanti al guardiano** (in alternativa accanto al ranger del lato opposto) **[deciso]** (Marco; fattibile, verifica di Claude); **un solo ranger di conversione** alla volta, i supporti anche due insieme (quindi nessun tetto alla conversione) **[deciso]**.
- **Conversione** **[deciso]**: **10% per livello** del danno del guardiano nel proprio tipo (100% al livello 10), come **quota del danno di ogni colpo**. Contro i nemici invisibili conta solo la parte energy. **[deciso]** (approvato da Marco)
- **Physical** **[deciso]**: ignora il X% della resistenza del nemico, X = 10% per livello (100% al livello 10: il ×0,5 diventa ×1,0); le debolezze non cambiano. Lo stesso coefficiente è la **probabilità che i proiettili del guardiano attraversino i gusci** dei nemici physical.
- **Frammenti**: ogni ranger ha i propri, esclusivi; raggiunta la soglia si sblocca e si può equipaggiare; con altri frammenti sale di livello (**livello massimo 10, per ora**). **[deciso]** I frammenti di ogni partita si dividono tra i due ranger del tipo in **proporzioni casuali**, senza scelta del giocatore; proporzione uniforme tra 0 e 100% a ogni partita, e se uno è al livello massimo vanno tutti all’altro. **[deciso]** (approvato da Marco)
- **Aspetto dei frammenti** **[deciso]** (Marco): etichetta con il **nome del ranger** e icona a forma di **pezzo di puzzle**.
- **Costo dei livelli** **[deciso]** (Marco): il numero è il **totale di frammenti per avere quel livello**, non il costo della singola salita. Livello 1 = soglia di sblocco T; livello 2 = 1,5 T in tutto; livello 3 = 2 T; livello 4 = 2,5 T… livello L = T × (1 + 0,5 × (L − 1)), livello 10 = 5,5 T. Ogni salita costa quindi 0,5 T. Con T = 20 F un ranger al 10 richiede 110 F in tutto (90 F oltre lo sblocco). Portare tutti e 10 i ranger al 10 con F costante richiede circa 18 mesi per il giocatore di riferimento **[Claude] [provvisorio]**; crescita di F con la scala e costi: **da misurare con i bot**.
- **Obiettivo** **[deciso]** (Marco): circa **4 mesi** per sbloccarli tutti. Soglia **[Claude] [provvisorio]**: T = 20 F per ranger (200 frammenti con F = 10 al livello 1), per un giocatore che gioca 5 giorni su 7, 2 partite al giorno sul tipo del giorno, con il 70% di ricompensa media: circa 3,6 mesi per un tipo medio e 4,0 per l’ultimo. Da misurare con i bot.

### Nomi e supporti dei ranger
**[deciso]** (Marco). **Per tutti i supporti**: l’effetto si ripete ogni **X secondi**, da **40 s al livello 1 a 20 s al livello 10**; dove non è indicato altro,
i danni sono **del tipo del ranger** e **crescono con il livello**. **Corto raggio** = portata dell’Aeroblast senza potenziamenti, **260 px** **[deciso]** (Marco).
**Bonus** **[deciso]** (Marco): i supporti prendono i bonus dei Moduli e, nell’albero dei Sigilli, solo i nodi del ramo Tipi **specifici del loro tipo** e la **durata degli stati**;
non “di tutte le torrette”, perché i ranger non sono torrette. Dei Moduli contano **solo quelli per tipo di danno**, non il nucleo
né il Modulo 28 (danno delle torrette) **[deciso]** (Marco, su lettura di Claude). Danni di base **leggermente sotto le torrette non potenziate** **[deciso]** (Marco); il livello 10 può arrivare oltre il 200 della campagna.

| Tipo | Supporto | Conversione |
|---|---|---|
| Fire | Alfa | Prometeo |
| Force | Omega | Mnemosine |
| Electric | Sigma | Ceo |
| Energy | Gamma | Iperione |
| Physical | Epsilon | Atlante |

- **Aspetto** **[deciso]** (Marco): i ranger di **conversione** sono **sfere metalliche fluttuanti** del colore del loro tipo; quelli di **supporto** sono **cubi metallici fluttuanti**
  con la propria **lettera greca minuscola** (α Alfa, ω Omega, σ Sigma, γ Gamma, ε Epsilon) sul lato visibile, nel colore del tipo; il colore del cubo può essere diverso. Dalla 1.19.1 ogni cubo ha un metallo scuro di un colore suo (blu Alfa, verde Omega, viola Sigma, bordeaux Gamma, bronzo Epsilon) **[Claude] [da rivedere]** e la lettera è centrata sulla faccia davanti.
  Da disegnare in classica e HD-2D.
- I ranger di **conversione** hanno gli effetti già stabiliti (conversione). Il ranger physical che ignora la resistenza e fa attraversare i gusci è **Atlante** **[deciso]** (Marco).
- **Alfa** (fire): ogni X s una **fiammata a corto raggio** che dura Y s, con danni da fuoco e Z% di probabilità di **bruciatura**. Salendo di livello X cala, Y e Z crescono:
  da **Y = 4 s, Z = 10%** a **Y = 10 s, Z = 100%**; anche il danno cresce. La bruciatura si può riapplicare allo stesso bersaglio quando la precedente è finita.
  Grafica: fiammata. Si possono riusare le fiamme già disegnate (lingue di fuoco, brace e scintille dell’Area infuocata della Sky Guard, `FX.fireField`, e della scia del Firewheel,
  `FX.fireTrail`, in classica e HD-2D) adattandole alla forma della fiammata **[Claude]**.
- **Omega** (force): ogni X s un’**onda a corto raggio** che dà uno stato a caso tra **vulnerabilità, rallentamento e indebolimento**; salendo di livello crescono il danno
  e l’**ampiezza dell’onda**, da **20°** a **120°** al massimo. Grafica: l’onda del drone, con l’ampiezza rivista.
- **Sigma** (electric): ogni X s un **fulmine a ricerca a corto raggio** (dal primo bersaglio) con probabilità di **paralisi**: da **1 bersaglio e 5%** a **5 bersagli e 50%**;
  con meno nemici può colpire più volte lo stesso. Grafica: il fulmine, che curva per raggiungere i bersagli o rimbalza tra loro come una saetta.
- **Gamma** (energy): ogni X s **Y bolle di energia** a corto raggio che **esplodono quando un nemico le tocca** (come mine): **Y da 2 a 12**, raggio dell’esplosione sempre uguale,
  danno che cresce meno degli altri supporti (le bolle sono di più). Grafica nuova: **bolla di sapone** (non le mine).
- **Epsilon** (physical): ogni X s una **raffica di missili a ricerca** a corto raggio: **da 2 a 6 missili** (livello 10); ai livelli intermedi sale il numero, il danno o la portata
  (livelli sotto). Grafica: i mini-missili, nel colore physical.
- **Bolle di Gamma**: restano in campo **15 s** **[deciso]** (Marco: le mine durano 25 s, ma il ciclo arriva a 20 s).
- **Epsilon, livelli** **[deciso]** (Marco): lv2 danno · lv3 missile · lv4 portata · lv5 danno · lv6 missile · lv7 portata · lv8 danno · lv9 missile · lv10 portata e missile (6 in tutto).

**Valori proposti** **[Claude] [provvisorio]** (da misurare con i bot). Danni di base circa l’85% di una torretta non potenziata dello stesso genere;
crescita del danno **+15% del valore base per livello** (×2,35 al 10): dal 60 (difficoltà effettiva circa 69) al 200 (230) la vita dei nemici cresce di circa ×2,4,
quindi un ranger che sale con la campagna resta al passo, prima dei bonus di albero e Moduli. Valori a metà strada: interpolazione lineare tra livello 1 e 10, arrotondata.
- **Alfa**: fiammata 4 danni al secondo a chi ci sta dentro (Area infuocata della Sky Guard 5/s); bruciatura 3 s a 4 al secondo (come quella della Sky Guard, 3 s).
- **Omega**: 20 danni per onda (esplosione dell’Aeroblast 24); stato di 3 s.
- **Sigma**: 14 danni per bersaglio (fulmine del Thunderbolt 16); paralisi come quella del Thunderbolt.
- **Gamma**: 20 danni per esplosione (mina dell’Aeroblast 24), raggio fisso 40 px (esplosione dell’Aeroblast); il danno cresce di **+7%** per livello (×1,63 al 10) invece del 15%.
- **Epsilon**: 20 danni per missile (missile della Sky Guard 24); ai livelli “danno” +30% del valore base (×1,9 dal lv8: con 6 missili, al 10 la raffica vale circa ×11 come i 5 bersagli di Sigma a ×2,35), ai livelli “portata” +15% della portata base (260 → 299 → 338 → 377 px).

| Livello | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| Ciclo X (tutti, s) | 40 | 37,8 | 35,6 | 33,3 | 31,1 | 28,9 | 26,7 | 24,4 | 22,2 | 20 |
| Danno (tutti tranne Gamma ed Epsilon) | ×1 | ×1,15 | ×1,3 | ×1,45 | ×1,6 | ×1,75 | ×1,9 | ×2,05 | ×2,2 | ×2,35 |
| Alfa: durata Y (s) | 4 | 4,7 | 5,3 | 6 | 6,7 | 7,3 | 8 | 8,7 | 9,3 | 10 |
| Alfa: bruciatura Z | 10% | 20% | 30% | 40% | 50% | 60% | 70% | 80% | 90% | 100% |
| Omega: ampiezza | 20° | 31° | 42° | 53° | 64° | 76° | 87° | 98° | 109° | 120° |
| Sigma: bersagli | 1 | 1 | 2 | 2 | 3 | 3 | 4 | 4 | 5 | 5 |
| Sigma: paralisi | 5% | 10% | 15% | 20% | 25% | 30% | 35% | 40% | 45% | 50% |
| Gamma: bolle | 2 | 3 | 4 | 5 | 6 | 8 | 9 | 10 | 11 | 12 |
| Gamma: danno | ×1 | ×1,07 | ×1,14 | ×1,21 | ×1,28 | ×1,35 | ×1,42 | ×1,49 | ×1,56 | ×1,63 |
| Epsilon: missili | 2 | 2 | 3 | 3 | 3 | 4 | 4 | 4 | 5 | 6 |
| Epsilon: danno | ×1 | ×1,3 | ×1,3 | ×1,3 | ×1,6 | ×1,6 | ×1,6 | ×1,9 | ×1,9 | ×1,9 |
| Epsilon: portata (px) | 260 | 260 | 260 | 299 | 299 | 299 | 338 | 338 | 338 | 377 |

Il corto raggio si misura **dal ranger** (non dal centro in basso come per le torrette dalla 1.14.2) **[deciso]** (Marco).

### Protezione planetaria
- Sezione del menu con **5 livelli**, che si apre completando il 60, **a griglia 2 + 2 + 1 centrato**: **Fire: Europa · Force: Africa · Electric: Asia · Energy: Americhe · Physical: Oceania** **[deciso]** (Marco). Ogni livello ha un’icona che ricorda il continente, il nome sotto e una riga descrittiva con **livello e tipo dei nemici** (es. “Livello 3 · nemici fire”). Ordine nella griglia (Europa, Africa / Asia, Americhe / Oceania), badge ×2 sul continente del giorno e partite rimaste del giorno **[deciso]** (approvati da Marco); icone da disegnare (classica e HD-2D).
- Ogni tipo ha la **propria scala di livelli**. **[deciso]**
- Livelli da **20 ondate non separate**: i nemici si accumulano; ogni ondata ha un **tempo stimato di completamento** e allo scadere parte la successiva, anche se i nemici della precedente non sono stati uccisi. Tempi da ricavare con i bot **[da misurare]**. **[deciso]**
- **Scelta delle carte**: quando tutti i nemici di un’ondata sono sconfitti; per un mini-boss (ondate 5, 10, 15) la schermata delle carte vinte compare subito alla sconfitta. Il gioco è in pausa (timer compreso) durante la schermata e le scelte vanno **in coda** se ne scatta più di una. **[deciso]**
- **Budget di scelte** invariato: **19 scelte + 9 carte dai 3 mini-boss**. **[deciso]** Il **boss conta sempre come ondata 20**, anche se compare all’ondata 18: le scelte delle ondate 18 e 19 non aspettano la sua morte. **[deciso]** (Marco)
- **Sistema più punitivo**, accettato da Marco (spirale: meno ondate completate, meno carte, meno potenza); da rivedere dopo le prove. **[deciso]**
- **Avanzamento**: completato un livello si sblocca il superiore, stesse regole e difficoltà maggiore. Livello completato = 20 ondate partite e tutti i nemici uccisi, mini-boss e boss compresi. **[deciso]** (approvato da Marco)
- **Rotazione**: tutti i tipi sempre sbloccati; il tipo del giorno dà un **bonus ×2 alle ricompense** (valore **[provvisorio]**): lunedì physical, martedì force, mercoledì energy, giovedì electric, venerdì fire; sabato e domenica un tipo a caso ciascuno (un solo tipo per giorno, seme legato alla data **[Claude]**). **[deciso]**
- **Ricompense**: frammenti **proporzionali a ondate raggiunte e mini-boss sconfitti**, anche senza completare il livello. **[deciso]** Formula (approvata da Marco, valori **[provvisorio]**): F × (0,7 × ondate raggiunte ÷ 20 + 0,3 × mini-boss sconfitti ÷ 3), ondata raggiunta = ondata partita.
- **Limite**: al massimo **2 partite al giorno** in questa modalità (2 sullo stesso livello e tipo, oppure 1 su due diversi). **[deciso]** Si conta alla partenza, anche se persa o abbandonata; “Continua” non conta due volte; giorno = data locale **[Claude]**.
- **Salvataggio** **[Claude]**: frammenti e livello dei ranger, livelli completati per tipo, data e partite del giorno; `SAVE_VERSION` +1; la partita sospesa (§ 2) salva anche lo stato della modalità. **Autosalvataggio** quando tutti i nemici di un’ondata sono sconfitti; “Continua” riprende dall’ondata successiva. **[deciso]** (Marco)

### Nemici della Protezione planetaria
- Il livello di un tipo è popolato **solo da nemici di quel tipo**, con **resistenza al proprio tipo diversa tra loro**, per **tutti i tipi** (es. fire 1 con resistenza al fuoco 25%, fire 2 con 35%). **[deciso]** (Marco) Tra i nemici nuovi alcuni resistono al proprio tipo più di quelli della campagna (50%) e altri meno, ma **sempre tra il 25% e il 60%**. **[deciso]** (Marco) Numero e valori: aperti (proposta di Claude: 4 per tipo, 3 normali e 1 speciale). La resistenza è propria di questi nemici, il segnaposto del § 6 non cambia per quelli della campagna **[Claude]**.
- **Un nemico speciale per tipo** **[deciso]** (Marco; X e Y aperti):
  - **fire**: kamikaze, se arriva alla cupola infligge danno in proporzione alla vita rimasta (formula aperta);
  - **force**: dopo aver subito X danni diventa **invisibile**; lo colpiscono solo torrette energy (Laser, Beam), Disruption Drone, Gravity Vortex Gun, **Firewheel Drone** ed effetti ad area (esplosioni, campi statici); **non** Thunderbolt e Hive. Una bruciatura già applicata continua a fare danno. **[deciso]** (Marco) Gli altri proiettili passano attraverso e non contano né come perforazione né per attivare effetti sul bersaglio; **guardiano e missili ricercanti non lo considerano come bersaglio**, a meno che il guardiano usi la conversione energy;
  - **electric**: dopo aver subito X danni fa **uno scatto verso il basso, una sola volta**;
  - **energy**: ogni X secondi è **immune ai danni** per Y secondi, **anche a quelli da stato**;
  - **physical**: alla morte lascia un **guscio invincibile** per Y secondi. Non conta come nemico per completare l’ondata, non si sposta con attrazione né teletrasporto, non è un bersaglio. **Blocca** i proiettili di guardiano, Sky Guard, Aeroblast, Railgun e Teslacoil (un colpo che esplode, come Sky Guard e Aeroblast, **esplode sul guscio** **[deciso]**, Marco); **non** blocca Laser, Disruption Drone, Thunderbolt, Beam, Firewheel Drone, Hive e Gravity Vortex Gun. Il ranger physical dà al guardiano una probabilità di attraversarlo (vedi sopra).

### Boss della Protezione planetaria
- Un boss per tipo, con abilità esclusive e **più lenti dei boss attuali**; **più grandi** degli attuali, il loro aspetto deve **incutere timore**, e si mostrano **a poco a poco** mentre scendono dall’alto **[deciso]** (Marco); compaiono in **tutti i livelli, dal livello 1, all’ondata 18**. La velocità è tale che **alla fine dell’ondata 20 il boss sia a metà schermo** (quota del **bordo inferiore** del boss, misurata dal basso; vale per tutte le quote dei boss, anche quelle della nave force) **[deciso]** (Marco); il calcolo con i tempi delle ondate è da misurare **[Claude]**. Le abilità scalano con il livello del proprio tipo:
  - **fire**: ammiraglia spaziale da guerra, lancia missili che intercettano i proiettili delle torrette (più frequenti al crescere del livello fire);
  - **force**: nave madre rettangolare con ali squadrate, lunga il 75% dello schermo; quando la punta raggiunge il **75%, 55% e 35%** di altezza rilascia 6 nemici alati (soglie **[deciso]**, Marco; prima 75%, 50% e 25%, troppo vicino alla cupola). Le ali della nave compaiono solo quando arriva al 75%, quindi il primo rilascio avviene in cima **[deciso]** (Marco) (di più al crescere del livello force);
  - **electric**: disco volante gigante, probabilità di ignorare il danno (effetto grafico di assorbimento), crescente con il livello electric; tetto 50% **[Claude]**;
  - **energy**: prisma gigante (50% dello schermo in larghezza, centrato, 60% in altezza), raggio verticale a distanza (25% dello schermo), sotto la barra della vita come gli altri boss giganti, più frequente al crescere del livello energy; **non scende oltre il 25% dell’altezza** (il bordo inferiore resta sopra il 25%, misurato dal basso), così non copre cupola e torrette. **[deciso]**
  - **physical**: meteorite gigante a tutta larghezza; a metà vita si divide in due meteore (circa metà schermo ciascuna) con la vita rimasta divisa tra loro; più scissioni al crescere del livello physical.
- Aperti: punti vita (§ 5), velocità in px/s, formule per livello, tetti.
- Nota **[Claude]** (schermo 360 × 640): la cima della cupola è a y 489 al centro; con le soglie nuove il rilascio più basso (35% dal basso, y 416) avviene circa 73 px sopra la cupola (prima, al 25%, circa 9 px).
- **Bersaglio**: i boss giganti si possono colpire **appena si vedono** (una parte entrata nello schermo basta), non solo quando il centro è entrato come per i nemici di oggi. **[deciso]** (Marco)
- Nemici e boss nuovi sono **riutilizzabili nelle campagne**.

### Fase 1 costruita (1.16.0)
- **Costruito**: modalità `planet` (§ 4: sblocco al completamento del 60, avviso di sblocco); nel menu, dal 60, il pulsante “Protezione planetaria” (tipo del giorno e partite rimaste)
  al posto dell’elenco degli sblocchi; griglia dei continenti 2 + 2 + 1 con icona, nome, livello e tipo dei nemici, frammenti dei ranger del tipo e badge ×2; ogni tipo con la sua scala;
  tipo del giorno e ×2; limite di 2 partite al giorno (contate alla partenza; “Continua” non conta); ondate sovrapposte con il tempo per ondata; scelte quando un’ondata è ripulita,
  in coda e a gioco fermo; ricompensa del mini-boss subito; boss dall’ondata 18 che conta come ondata 20, con il bordo inferiore a metà schermo alla fine dell’ondata 20;
  autosalvataggio a ondata ripulita; frammenti alla fine (vittoria, sconfitta, abbandono) divisi a caso tra i due ranger del tipo; salvataggio versione 7 (§ 7).
- **Segnaposto e valori della fase 1** **[Claude] [provvisorio]**:
  - **nemici**: le ondate della campagna (`waveSpec`) con al posto di ogni nemico quello della campagna del tipo del continente (fire meteora, force asteroide, electric navicella,
    energy cristallo-cometa, physical frammento roccioso), con la vita e il danno del nemico che sostituisce; mini-boss e boss del tipo del continente (nave aliena e nave madre della campagna);
  - **difficoltà**: livello L = difficoltà 55 + 5 × L (livello 1 = 60, come il muro che apre la modalità); vita del boss come un muro di pari difficoltà (formula del § 5 senza i fattori dei singoli muri);
  - **tempi delle ondate** (s, ondate 1-19): 8 · 11 · 18 · 21 · 23 · 18 · 20 · 23 · 22 · 22 · 22 · 24 · 25 · 24 · 21 · 25 · 27 · 26 · 24 (ondata 20: 24, solo per la velocità del boss):
    mediana del tempo di pulizia di ogni ondata, misurata con i bot con albero ed equipaggiamento attesi della campagna di pari difficoltà, ondate in sequenza
    (`SEQ=1 node tests/tools/planet.js 1,5 30`, 600 partite: 5 tipi, 2 livelli, 2 bot). Il tempo è il “tempo stimato di completamento” del **[deciso]**: un’ondata più lenta della mediana
    si sovrappone alla successiva;
  - **F = 10** (frammenti di una partita piena), costante: la crescita con la scala è da misurare; **×2** nel giorno del tipo;
  - in questa modalità **niente Sigilli, niente equipaggiamento e niente Sigilli maggiori** (non previsti dal § 17); i frammenti di una partita **abbandonata** valgono come una sconfitta
    a quell’ondata; con una partita sospesa, toccare un continente chiede “Sostituire la partita sospesa?” (secondo tocco); il livello giocato è sempre il primo non completato del tipo;
  - icone dei continenti: dalla 1.19.1 globi con i contorni geografici semplificati (proiezione ortografica centrata sul continente, `LANDS` in `draw.js`), mare scuro, ombra della sfera e atmosfera del tipo; in HD-2D globo a pixel con il retino.
- **Misura 1.16.0** (`node tests/tools/planet.js 1,5,10 30`, bot con albero ed equipaggiamento attesi della campagna di pari difficoltà, tempi delle ondate qui sopra;
  60 partite per tipo e livello: vittorie su 30 random / smart e, tra parentesi, ondata media raggiunta):

  | Livello (diff.) | Fire | Force | Electric | Energy | Physical |
  |---|---|---|---|---|---|
  | 1 (60) | 11 / 12 (14) | 23 / 21 (18) | 20 / 19 (18) | 4 / 7 (12) | 1 / 0 (5) |
  | 5 (80) | 19 / 13 (17) | 24 / 24 (19) | 24 / 21 (19) | 8 / 4 (14) | 1 / 0 (6) |
  | 10 (105) | 24 / 23 (19) | 29 / 24 (20) | 27 / 29 (20) | 24 / 14 (18) | 5 / 7 (12) |

  Forte differenza tra i tipi con i nemici segnaposto: **physical** quasi impossibile (il guardiano spara physical e il frammento roccioso gli resiste al 50%; muore
  all’ondata 5-6, circa 0,2 F di frammenti), energy duro (il cristallo-cometa è il nemico più veloce), force ed electric facili. Con le ondate in sequenza le vittorie sono simili:
  la differenza viene dai nemici, non dalla sovrapposizione. Nessun valore ritarato **[da decidere]** (Marco): la difficoltà per tipo dipende dai nemici nuovi (fase 3) e dai ranger
  (Atlante per il physical, fase 2).
- **Mancano** (fasi 2-4): ranger (frammenti solo accumulati: soglie, livelli e schermata nella fase 2), nemici nuovi e speciali, boss nuovi.

### Fase 2 costruita (1.17.0): ranger
- **Costruito**: livelli dai frammenti (soglia T, totale T × (1 + 0,5 × (L − 1)), massimo 10); frammenti tutti all’altro ranger del tipo quando uno è al 10; schermata **Ranger**
  (dal menu, sotto “Protezione planetaria”, e dalla griglia dei continenti): 10 schede con livello, frammenti verso il prossimo, “in campo”; tocco = scelta (sotto l’effetto al livello attuale),
  secondo tocco = equipaggia o toglie, con i messaggi “Servono 200 frammenti…”, “Al massimo 2 ranger…”, “Un solo ranger di conversione…”. In campo ai lati del guardiano (34 px),
  davanti a lui (46 px sopra) quando il lato esce dallo schermo; sfere e cubi con la lettera greca in classica e HD-2D. Conversione (quota del colpo del guardiano, anche esplosioni del colpo e
  Modulo 20), Atlante (quota di resistenza ignorata, debolezze invariate), i 5 supporti con la tabella dei livelli e i bonus decisi (Moduli e nodi Tipi del loro tipo, durata degli stati).
  Salvataggio versione 8 (§ 7).
- **Letture e valori di Claude** **[Claude] [da confermare]**:
  - i ranger equipaggiati valgono **in tutte le modalità** (campagna, Epica, Protezione planetaria);
  - **T = 200** frammenti (20 F); il primo effetto dei supporti arriva dopo 5 s, poi ogni X s, solo con un nemico a portata;
  - **Alfa**: getto dal ranger al nemico più vicino a portata (lo segue per Y s, largo circa 11°); la probabilità di bruciatura si tira una volta al secondo per nemico, bruciatura di 3 s;
  - **Omega**: onda lunga quanto la portata (260 px) verso il nemico più vicino; stato di 3 s;
  - **Sigma**: dal nemico più vicino salta al più vicino non ancora colpito entro 200 px; paralisi di 1 s (come il Thunderbolt);
  - **Gamma**: bolle in punti a caso a portata, sopra la cupola; esplodono quando un nemico le tocca;
  - **Epsilon**: un missile per bersaglio a portata (a turno se sono meno), colpo singolo;
  - nella conversione il numero a schermo è quello della quota più grande.
- **Misura con i bot 1.17.0** (`EQUIP=1.5 RANGERS=… node tests/tools/curva.js L 100`, 200 partite per muro, stessi semi della 1.15.1; senza ranger stessi numeri della 1.15.1, partita per partita):

  | Muro | senza ranger | Atlante 5 + Epsilon 5 | Mnemosine 5 + Sigma 5 | Atlante 10 + Epsilon 10 |
  |---|---|---|---|---|
  | 60 | 36,0 | 45,0 | 43,0 | 49,5 |
  | 80 | 25,5 | 30,0 | 19,5 | 31,5 |
  | 90 | 47,0 | 62,0 | 55,0 | 68,5 |
  | 140 | 24,0 | 40,0 | 38,5 | 53,5 |
  | 150 | 45,0 | 57,0 | 48,0 | 59,0 |
  | 190 | 48,0 | 67,0 | 57,5 | 67,0 |

  Atlante aiuta di più contro i boss physical (90, 140, 190). Con Atlante ed Epsilon al 5 restano sotto il 50% il 60, l’80 e il 140; al 10 il 60 e l’80. Nessun valore ritarato **[da decidere]** (Marco).
- **Tempi di sblocco** (`node tests/tools/ranger-tempi.js`: giocatore di riferimento, 5 giorni su 7, 2 partite al giorno sul tipo del giorno, F = 10, T = 200):
  con il 70% di ricompensa media per tutti i tipi **4,5 mesi** per sbloccarli tutti e 20 per portarli al 10 (in linea con la stima del § 17); con le quote misurate dai bot al livello 1
  (fire 0,69 · force 0,87 · electric 0,90 · energy 0,57 · physical 0,19) fire, force, electric ed energy si sbloccano in 2,9-4,3 mesi, ma i ranger physical in **10,9 mesi**
  (58 per il livello 10): il continente physical con i nemici segnaposto (§ 17, fase 1) allunga tutto **[da decidere]**.
- **Mancano**: nemici nuovi e speciali (fase 3), boss nuovi (fase 4); gli invisibili (solo la parte energy) e i gusci (attraversamento di Atlante) arrivano con i nemici della fase 3.

### Fase 3 costruita (1.18.0): nemici nuovi e speciali
- **Nemici** (proposta di Claude accettata da Marco come punto di partenza, valori **[Claude] [provvisorio]**): quattro per tipo, solo del tipo del continente, con la propria resistenza
  al proprio tipo (le altre resistenze e debolezze come la tabella del § 6 per quel tipo; i nemici della campagna non cambiano):

  | Taglia | Vita | Velocità | Raggio | Danno | Resistenza al proprio tipo | Aspetto |
  |---|---|---|---|---|---|---|
  | leggero | 36 | 60 | 10 | 1,5 | 25% | Dardo |
  | medio | 60 | 42 | 13 | 3 | 40% | Razzo (fino alla 1.19.0 “Gemma”) |
  | pesante | 132 | 28 | 16 | 6 | 60% | Artiglio (fino alla 1.19.0 “Corazzato”) |
  | speciale | 72 | 40 | 14 | 4 | 50% | Kamikaze (fire), Spettro (force), Saetta (electric), Prisma (energy), Carapace (physical) |

  Vita, danno e velocità crescono con la difficoltà e con l’ondata come nella campagna. Ondate: le stesse quantità della campagna, con il nemico del continente della stessa taglia
  (navicella e cristallo-cometa → leggero, meteora e frammento roccioso → medio, asteroide → pesante); gli speciali dall’ondata 3: 1, più uno ogni 5 ondate (2 dall’8, 3 dal 13, 4 dal 18), ogni 3 s.
  Scoperte e avvisi “Nuovo nemico” per aspetto e tipo. Nomi e aspetto **[Claude] [da rivedere]**; disegnati in classica e HD-2D (sprite a pixel dalle stesse sagome).
- **Speciali** (regole **[deciso]**, X e Y **[Claude] [provvisorio]**):
  - **fire, kamikaze**: alla cupola un solo colpo da danno × (1 + 4 × vita rimasta ÷ vita massima), poi muore (×5 a vita piena, ×1 quasi morto);
  - **force, invisibile** dopo aver perso il **30%** della vita: non è bersaglio di guardiano, missili e torrette che non lo vedono; i colpi gli passano attraverso. Lo colpiscono Laser, Beam,
    Disruption Drone, Gravity Vortex Gun, Firewheel Drone (bersagli scelti da loro) e gli effetti ad area (esplosioni, campi, bruciature già applicate); non l’onda dell’Hive. Con Iperione
    il guardiano lo vede e conta solo la parte energy. A schermo resta un riflesso trasparente, senza barra né stati.
    Torna **visibile e bersaglio di tutti** quando **tocca la barriera** o **subisce uno stato da una torretta che lo vede** (rallentamento, indebolimento, vulnerabilità, bruciatura,
    distruzione, anche dalle loro combo), e non ridiventa invisibile **[deciso]** (Marco, 1.18.1: gli invisibili erano troppo forti);
  - **electric, scatto**: dopo aver perso il **40%** della vita scende di **120 px in 0,3 s**, una volta (si ferma sulla cupola);
  - **energy, immunità**: ogni **6 s** è immune per **2 s** a tutti i danni, anche da stato (scudo esagonale); fase a caso all’uscita;
  - **physical, guscio** alla morte: **4 s**, invincibile, non è un nemico né un bersaglio, non conta per l’ondata; blocca i colpi di guardiano, Sky Guard, Aeroblast, Railgun e Teslacoil
    (missili, bombe e sfere esplodono sul guscio, il Railgun si ferma); con Atlante ogni colpo del guardiano ha la probabilità del livello × 10% di attraversarlo (una prova per guscio).
- **Misura 1.18.0** (`node tests/tools/planet.js 1,5,10 30`, come la fase 1; vittorie su 30 random / smart, tra parentesi l’ondata media; prima → dopo i nemici nuovi):

  | Livello | Fire | Force | Electric | Energy | Physical |
  |---|---|---|---|---|---|
  | 1 | 11 / 12 → 13 / 6 (12) | 23 / 21 → **0 / 0** (6) | 20 / 19 → 19 / 17 (18) | 4 / 7 → 9 / 8 (12) | 1 / 0 → 0 / 0 (4) |
  | 5 | 19 / 13 → 16 / 11 (16) | 24 / 24 → **0 / 0** (6) | 24 / 21 → 21 / 25 (19) | 8 / 4 → 8 / 11 (15) | 1 / 0 → 1 / 0 (5) |
  | 10 | 24 / 23 → 21 / 19 (18) | 29 / 24 → **0 / 0** (7) | 27 / 29 → 28 / 25 (20) | 24 / 14 → 21 / 15 (17) | 5 / 7 → 7 / 3 (9) |

  Il **force** diventa impossibile per i bot: gli invisibili arrivano alla cupola e quasi nessuna torretta li vede.
  **Con la regola della 1.18.1** (visibili alla barriera o con uno stato): force 6 / 2 (10) al livello 1, 12 / 9 (15) al 5, 19 / 16 (17) al 10, cioè 13%, 35%, 58%;
  tempi dei ranger con la quota force 0,42: tutti sbloccati sempre in 14,5 mesi per il physical (i due force in 6,5 mesi). Prove al livello 1 / 5 (20 partite per bot): senza invisibilità 23 / 30%,
  senza speciali 53 / 58%. Physical resta il più duro (guardiano physical e pesanti al 60%). **[da decidere]** (Marco): valori degli invisibili (soglia, durata o chi li vede) e difficoltà per tipo.
  Tempi dei ranger con queste quote (`tests/tools/ranger-tempi.js`, fire 0,58 · force 0,23 · electric 0,88 · energy 0,58 · physical 0,16): tutti sbloccati in 14,5 mesi (force 10,2, physical 14,5).
- **Mancano**: i boss nuovi (fase 4); nella fase 4 anche gli alati della nave madre force.

### Fase 4 costruita (1.19.0): boss giganti
- **Boss** (regole **[deciso]**, valori **[Claude] [provvisorio]**, nomi e aspetto **[Claude] [da rivedere]**), uno per continente, dall’ondata 18 (contano come ondata 20), più lenti e grandi,
  entrano dall’alto con il bordo inferiore a 0 e sono **bersagli appena si vedono** (bordo inferiore a 4 px); il bordo inferiore arriva a metà schermo alla fine dell’ondata 20,
  poi continuano a scendere fino alla cupola (il prisma si ferma). Disegnati sotto la barra in alto, che mostra il nome e la vita totale. Vita come il boss segnaposto della fase 1
  (muro di pari difficoltà); danno alla cupola 8, immuni alle spinte, stati al 40%.

  | Tipo | Boss | Sagoma (px) | Abilità e valori per livello L del continente |
  |---|---|---|---|
  | fire | Ammiraglia | 260 × 140 | ogni max(3, 8 − 0,5 (L − 1)) s, 2 + ⌊(L − 1)/4⌋ intercettori, solo se ci sono colpi di torretta in volo (missili, bombe, sfere, proiettili del Railgun): dalla 1.19.1 ognuno prenota un colpo diverso (il più vicino libero), mira al punto d’incontro e lo distrugge |
  | force | Nave madre | 120 × 270 (ali squadrate di 66 px per lato dal 75%) | quando la punta arriva al 75%, 55%, 35% di altezza **[deciso]** rilascia 6 + ⌊(L − 1)/3⌋ alati (vita 30, veloci, resistenza force 30%) |
  | electric | Disco volante | 300 × 110 | assorbe ogni colpo con probabilità 0,1 + 0,04 (L − 1), tetto 50% **[Claude]**; lampo bianco |
  | energy | Prisma gigante | 180 × 384 (50% × 60% dello schermo) **[deciso]** | si ferma con il bordo inferiore al 25% dal basso **[deciso]**; ogni max(3, 9 − 0,5 (L − 1)) s un raggio verticale di 160 px **[deciso]** (avviso 0,7 s): se arriva alla cupola danno × 2 |
  | physical | Meteorite | 360 (tutta la larghezza) | a metà vita si divide in due meteore di metà diametro con la vita rimasta; generazioni min(3, 1 + ⌊(L − 1)/5⌋) |

- **Grafica rivista (1.19.1)** (richieste di Marco **[deciso]**, disegni **[Claude] [da rivedere]**): sagome “a strati” (`FOE_LAYERS`, `GIANT_LAYERS` in `draw.js`: poligoni ed ellissi con un ruolo
  di colore: tipo, metallo, vetro), le stesse in classica e HD-2D (sprite a pixel con il bordo in rilievo). Il colore del tipo non copre più tutta la forma dei boss nuovi.
  - **Nave madre**: scafo d’acciaio a cuneo con ponte rialzato, strisce e prua del tipo; animati motori, torrette che seguono il guardiano, radar, luci della pista, hangar e lampeggiatori;
    dal 75% di altezza le ali escono da sotto lo scafo con i caccia agganciati (uno in meno per lato a ogni rilascio).
  - **Disco volante**: lente d’acciaio scuro, fascia orizzontale con le luci che scorrono (visibili davanti e dietro), cupola di vetro scuro, gradini e antenna sotto con il bagliore del tipo, scariche sul bordo.
  - **Prisma gigante**: anello di energia poco sopra il nucleo che pulsa, con tre luci che girano.
  - **Meteorite**: compare intero; scia di fuoco d’ingresso nell’atmosfera dietro, bordo davanti arroventato, leggero tremolio (solo disegno); anche i pezzi.
  - **Ammiraglia**: forma invariata; intercettori corretti (vedi tabella).
  - **Nemici**: Dardo con dorso, abitacolo, motore e luci; **Razzo** (al posto della Gemma) con punta, alette e fascia del tipo, oblò e fiamma; **Artiglio** (al posto del Corazzato) modulo
    d’assalto con cupola di vetro, anello del tipo con luci e tre artigli; Kamikaze con due alette; **Spettro** ala volante stealth con i bordi del tipo; **Saetta** freccia frastagliata verso il basso;
    **Prisma** come il Prisma gigante in miniatura (spigoli, nucleo, anello); il **guscio** del Carapace è ribaltato, con le zampe in alto.
- **Collisioni**: i giganti hanno una sagoma a rettangolo arrotondato (`def.box`, `edist`) per colpi, aree, laser (nove punti), portata e contatto con la cupola; il meteorite è un cerchio.
- **Misura 1.19.0** (`node tests/tools/planet.js 1,5,10 30`, come le fasi 1 e 3): quasi uguale alla 1.18.1 (es. livello 10: fire 21 / 18, force 16 / 13, electric 26 / 23,
  energy 18 / 12, physical 7 / 3): chi arriva all’ondata 18 di solito batte anche il boss. Physical sempre il più duro. Nessun valore ritarato.

### Nemici nuovi nella campagna (1.20.0)
- **Dalla difficoltà 70** (livello 70 in Standard, 40 in Epica) **[deciso]** (Marco): ogni nemico delle ondate è per **metà** il classico e per metà il nemico della
  Protezione planetaria della **stessa taglia e dello stesso tipo** (navicella → Dardo electric, cristallo-cometa → Dardo energy, meteora → Razzo fire, frammento roccioso → Razzo physical,
  asteroide → Artiglio force), estratto a caso nemico per nemico; gli **speciali** dall’ondata 3 come nei continenti (1, più uno ogni 5 ondate, ogni 3 s), di un tipo a caso.
- **Boss finale alternato** **[deciso]**: ai multipli di 10 gigante alle decine dispari (70, 90, 110…; Epica 40, 60…), nave madre alle pari; il gigante è del tipo che il livello
  avrebbe (`finalBossDef`), entra all’ondata 20 come il boss finale, con la stessa vita e velocità; barra in alto “BOSS FINALE · nome”. Mini-boss classici.
- **Valori [Claude] [provvisorio]**: livello delle abilità del gigante 1 + ⌊(difficoltà − 70) / 10⌋ (1 al 70, 14 al 200; nei continenti è il livello del continente);
  vita dei nemici nuovi e degli speciali nella campagna **×0,7** (`CAMP_NEW.hpK`), giganti al 90, 130, 170, 190 **×0,75** (`CAMP_NEW.giantK`): misura in § 5 (“Misura 1.20.0”).
- **Pausa**: la scheda “Nemici del livello” scorre col dito (dal 70 elenca 15 nemici); le scoperte dei nemici nuovi valgono per tipo, come nei continenti.

### Pacco regalo (campagna e Epica)
- **Dove e quando** **[deciso]** (Marco): in Standard dal **livello 61**, in Epica dal **livello 31** (stessa difficoltà, 61); **non** nella Protezione planetaria.
  Una volta per livello, **probabilità 25% per livello** (uguale in Standard ed Epica); l’ondata si estrae a caso tra la **3 e la 19, escluse 5, 10 e 15**.
  Si tira a inizio livello. Se il pacco è già stato risolto (preso o scaduto), non ricompare rigiocando l’ondata dopo “Continua”. **[Claude]**
- **Nemico speciale** **[deciso]** (Marco): non infligge danni e non arriva alla cupola; **fluttua tra il 25% e il 50% dell’altezza dello schermo** (misurata dal basso, y da 480 a 320),
  ha un **timer**. **Solo il guardiano in modalità manuale può colpirlo**: torrette, ranger e mira automatica non lo considerano bersaglio, e il “Bersaglio” (più vicino / vita più alta) lo ignora.
  Non conta nel contatore “Nemici” né per finire l’ondata, né per la frenesia (come il guscio). Se l’ondata finisce prima del timer, o scade il timer, **se ne va e il premio sfuma**. **[deciso]** (Marco)
- **Ricompensa** **[deciso]** (Marco): **5 frammenti** (Standard) o **10** (Epica) di un **ranger a caso tra quelli non al livello 10** (etichetta col nome e pezzo di puzzle, come i frammenti del § 17).
  Se **tutti i ranger sono al livello 10**: in Standard il pacco **non compare più**; in Epica lascia **un pezzo di equipaggiamento o un Modulo di rarità epica o superiore**.
  Frammenti medi per livello giocato: 1,25 in Standard, 2,5 in Epica.
- **Danni** **[deciso]** (Marco): i colpi del guardiano colpiscono **anche i nemici che trovano lungo la strada**; per raggiungere il pacco serve quindi una traiettoria libera
  oppure abbastanza perforazioni da superare i nemici in mezzo. **[Claude]** (lettura): lo ferisce solo il proiettile diretto del guardiano e del Clone, con resistenze neutre (×1);
  aree, raggi, fulmini, mine, schegge e stati lo attraversano senza contare come perforazione né attivare effetti; è immune a attrazione, spinta e teletrasporto.
  Se pacco e nemico sono entrambi entro 45 px dal mirino, il bersaglio è il più vicino al mirino.
- **Equipaggiamento in Epica con tutti i ranger al 10** **[Claude]**: pezzo o Modulo 50% / 50%, tipo a caso, rarità dalla tabella dei drop del § 15 per la difficoltà, limitata a epico o superiore e riscalata al 100%.
- **Valori** **[Claude]** (accettati da Marco come punto di partenza, da provare a mano): timer **12 s** (fermo in pausa e nella scelta delle carte, scorre con la velocità 1,5x / 2x come la logica);
  vita calcolata all’apparizione come **danno al secondo del guardiano × 5 s di fuoco**; movimento morbido, circa **50 px/s**, con cambi di direzione; entra dall’alto e, alla fine, esce verso l’alto.
- **Salvataggio** **[Claude]**: la partita sospesa (§ 2) salva l’ondata estratta e l’esito del pacco; “Continua” rigioca l’ondata dall’inizio e il pacco ricompare solo se non era già risolto.
  I frammenti si accreditano **subito** alla sconfitta del pacco, anche se il livello poi si perde; vanno in `progress.planet.frags` (nessun campo nuovo di progresso per i frammenti).
- **Grafica e avvisi** **[Claude] [da rivedere]**: pacco regalo con **eliche** (drone-corriere con nastro), colore diverso dai cinque tipi, anello del timer che si svuota; avviso “Nuovo nemico” al primo incontro
  e voce nella scheda “Nemici del livello” con il suggerimento “tieni premuto e mira”. Disegno classico e HD-2D.
- **Da misurare con i bot**: bot che sappia mirare il pacco; effetto sui muri (il guardiano non spara ai nemici mentre lo insegue); tempi di sblocco con `tests/tools/ranger-tempi.js`
  includendo il pacco (stima: +30% di frammenti per 3 livelli al giorno in Standard). Vita e timer li prova Marco a mano.
- **Costruito (1.21.0)** · dettagli **[Claude] [da rivedere]**: il pacco non sta tra i nemici (`gift`, `GIFT` in `index.html`), quindi torrette, ranger, mira automatica, “Bersaglio”, missili, aree e stati
  non lo vedono per costruzione; lo colpiscono solo i proiettili sparati **mentre si preme** (guardiano, Colpo caricato e Clone; non il Ventaglio né i frammenti della combo Railgun), anche se non era il bersaglio,
  dopo i nemici lungo la strada (una perforazione per superarne uno, una per il pacco). Con la mira automatica i colpi gli passano attraverso, così la partita dei bot non cambia.
  Tiro e ondata con un generatore separato (`giftRand`), che non tocca `Math.random`: a parità di semi le calibrazioni danno gli stessi numeri (verificato con `curva.js`, sotto).
  Compare **3 s** dopo l’inizio della sua ondata, entra dall’alto a 140 px/s fino a un punto a caso della fascia, dove parte il timer; scaduto, esce verso l’alto alla stessa velocità.
  Vita: danno di una salva × proiettili ÷ intervallo, con carte, albero ed equipaggiamento del guardiano, senza frenesia, Ventaglio e Clone (base 7 ÷ 0,15 × 5 = 233).
  Sagoma: raggio 15 px; colore rosa `#ff5fa8` con nastro giallo. Nella scheda “Nemici del livello” c’è solo se il pacco è stato estratto per quel livello (con l’ondata e il premio).
  Scoperta: chiave `gift` in `progress.seen` (le scoperte accettano già chiavi nuove: nessun `SAVE_VERSION` nuovo; tetto delle scoperte salvate portato da 50 a 80).
  Avviso del premio per 3,5 s sotto l’avviso dei nemici. In Epica 31 un giocatore che non ha ancora completato il 60 di Standard riceve frammenti di ranger non ancora visibili:
  restano salvati per quando si aprono **[Claude] [da confermare]**.
- **Misura 1.21.0** (bot che ignorano il pacco): `EQUIP=1.5 node tests/tools/curva.js 61,70,100 15` dà **gli stessi numeri** partita per partita sulla 1.20.0 e sulla 1.21.0,
  anche con il pacco forzato in ogni livello (probabilità 100%): 61 8/15 e 5/15, 70 12/15 e 5/15, 100 9/15 e 7/15 (random / smart). L’effetto sui muri di un giocatore che insegue il pacco
  resta da misurare con un bot che lo miri **[da misurare]**.
- **Tempi di sblocco con il pacco** (`PACCO=<livelli di Standard al giorno> PACCO_EPICA=<livelli di Epica al giorno> node tests/tools/ranger-tempi.js`, stessi giorni di gioco, pacco sempre preso;
  quote dei continenti della 1.18.0: fire 0,58 · force 0,23 · electric 0,88 · energy 0,58 · physical 0,16): tutti e 10 sbloccati **14,8 mesi senza pacco → 9,5 con 3 livelli di Standard al giorno
  → 7,3 con 2 di Standard e 2 di Epica (o 3 di Epica)**; tutti al 10: oltre 6 anni → 35,7 → 25,6 mesi. Il pacco va a un ranger qualsiasi non al 10, quindi aiuta soprattutto i tipi più lenti
  (physical da 14,8 a 9,5 mesi, force da 10,1 a 7,4) e poco i veloci (electric da 3,0 a 2,7). Con le quote della 1.16.0: 10,9 → 7,9 mesi. **[Claude]** (misura)
