# Fortress Defense — documento di design

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
- **Guardiano** (prima chiamato “personaggio”): si muove sul suolo trascinando e spara da solo. Mentre si tiene premuto in un punto qualsiasi dello schermo (esclusi i pulsanti in alto, pausa e bersaglio) segue il dito in orizzontale e spara **sempre in verticale**, così si indirizzano i colpi spostandolo; al rilascio torna la mira automatica. **[deciso]**
- **Mira**: solo automatica; non c’è più la mira manuale né il mirino, e nel menu non c’è più la scelta. Tutti i proiettili del guardiano mentre si preme vanno dritti in alto, senza bersaglio. Le torrette sparano sempre da sole. **[deciso]**
- **Bersaglio** (torrette e guardiano): “più vicino” o “vita più alta”; il guardiano lo usa quando non si preme. **[deciso]**
- **Frenesia** (chain del guardiano): la barra si carica nel tempo e parte da sola; va in pausa se non ci sono nemici a schermo e nessun dito premuto, cioè scorre anche mentre si preme. Una frenesia attiva a fine ondata continua in quella dopo. **[deciso]** (lettura della pressione **[Claude]**)
- **Pausa**: pulsante in alto (o Esc/P), si attiva da sola se si cambia app. Due schede: “Nemici del livello” e “Torri e potenziamenti”.
  “Abbandona” chiede un secondo tocco. **[deciso]**
- **Nemici scoperti** (per tutta la campagna, salvati sul dispositivo): nella scheda Nemici solo quelli già incontrati, gli altri “sconosciuto”;
  al primo incontro compare l’avviso “Nuovo nemico” (3,5 s, uno alla volta, si ferma in pausa).
  Mini-boss e boss finale si scoprono **tipo per tipo**. **[deciso]**
- **Scelta delle carte**: una carta (o “Continua” della ricompensa) si sceglie rilasciando il dito sulla stessa carta su cui si è premuto; scorrere fuori annulla. Per circa 0,6 s dopo la comparsa della schermata i tocchi sono ignorati (i tasti 1/2/3 restano immediati). **[deciso]** (azione al rilascio e blocco) · 0,6 s **[Claude]**

## 3. Sistema di potenziamenti

- Categorie: **standard**, **chain**, **combo**, **level up**. **[deciso]**
- Ogni torre e il guardiano partono al **livello 1**: 3 potenziamenti (standard, chain o combo), poi serve un **level up** per salire.
  **Livello massimo 3 = 12 potenziamenti** (3 + level up, per 3 livelli). **[deciso]**
- Un level up di livello inferiore resta disponibile ai livelli successivi. **[deciso]**
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
- **Combo tra due torrette**: nessuna definita. **(aperto, § 11)**
- **Combo e carte bloccate**: le combo del guardiano che richiedono la voce lv1 di una chain (Thunderbolt, Beam, Firewheel Drone, Teslacoil) possono uscire solo dopo che quella chain è stata sbloccata con i Sigilli (§ 16). Disruption Drone e Aeroblast usano una chain che resta libera. **[deciso]**
- **Probabilità** delle carte (pesi): standard 1, chain 0,4, combo 0,4, level up 2, nuova torretta 3 (1,5 con già 2 torrette). **[deciso]** (numeri **[Claude]**)
- Le carte “+1 proiettile/sfera/drone/rimbalzo” tolgono il 15% (o il 20%) di danno per pila. **[deciso]**

## 4. Campagna e progressione

- La campagna arriva **almeno al livello 200** (Marco; oggi `CAMPAIGN.maxLevel` = 200, si può allungare); si selezionano i livelli fino a “completati + 1”. Il livello di difficoltà D è il numero del livello; in **Epica D = livello + 30** (formula da riverificare oltre il 50). **[deciso]**
- **Tetto di livello** di torri e guardiano, in base ai livelli completati: lv1 fino al 10, **lv2 dopo il 10**, **lv3 dopo il 20**. **[deciso]**
- Sblocchi a fine livello: 10 → lv2, 20 → lv3, **30 → equipaggiamento** (testa, armatura, guanti, stivali, arma, nucleo),
  **31 → cominciano a cadere i Sigilli e si apre l’albero dei potenziamenti** (§ 16), **40 → abilità della barriera** (fino a 3; ramo abilità dell’albero),
  **50 → Epica**, **60 → Ranger (ipotesi di Marco) [da rivedere]**. L’equipaggiamento **non è ancora costruito**; albero e abilità della barriera sì (fasi 1-3, § 16). **[deciso]**
- **Mini-boss** (nave aliena) alle ondate 5, 10, 15: dal livello 11 in Standard, sempre in Epica. Sconfitto, dà **3 carte a caso applicate subito**
  (schermata di riepilogo). Tipo di danno variabile per ondata e livello. **[deciso]**
- **Boss finale** (nave madre) all’ondata 20 dei livelli multipli di 10, con barra della vita grande in alto; il livello finisce quando muore. **[deciso]**
- Boss e mini-boss: **sempre immuni** a paralisi, attrazione e teletrasporto; **resistenza variabile** a knockback e stati
  (riduce l’intensità, non la durata). **[deciso]** (valori **[da rivedere]**, § 10)
- Fino a difficoltà 10 solo nemici “piccoli” (niente asteroidi). **[deciso]**
- Budget di scelte: 19 per partita, **28 dal livello 11** con i 3 mini-boss. Servono 19 scelte per riempire tutto al tetto lv1, 39 al tetto lv2,
  64 al tetto lv3 (4 torrette + guardiano). Massimizzarne 2 richiede almeno 26 scelte, 3 almeno 39: per questo, con 28 scelte,
  **non si possono massimizzare più di 2 tra torri e guardiano** senza bisogno di una regola esplicita. **[deciso]**
- Progressione salvata sul dispositivo: livelli completati, nemici scoperti, Sigilli (saldo, livelli dei nodi, premi già riscossi per livello e modalità); impostazioni (bersaglio) a parte. Il formato cambia: alzare `SAVE_VERSION` e gestire la migrazione (§ 7). **[deciso]**

## 5. Difficoltà e calibrazione

- Formule (in `app/index.html`, sezione CAMPAGNA):
  - vita dei nemici: `levelHp(D)` = 0,42 + 0,08·(D−1) fino a D=10, poi +0,02 per livello (valori in `LV`);
  - difficoltà effettiva `effD`: piena fino a 20, al **30%** tra 20 e 30 (la potenza del giocatore è ferma fino al boss del 30),
    dal 31 sale di **0,2 per livello** (`EFF_SLOPE_31`; al 200 effD = 57). Prima era piena dal 31: con l’albero dei Sigilli che dà 1-2 Sigilli per livello
    i bot vincevano il 3% al 40. Tarata con `tests/tools/curva.js` (vedi sotto) **[Claude]**;
  - danno, velocità e numero dei nemici salgono piano con `effD`; dentro il livello ogni ondata aggiunge +9% di vita;
  - mini-boss: vita 480, danno 9; boss finale: vita base 400 al 10, 2250 al 20, 1450 al 30; dal 40 1450 × (1 + 1,5 · n^0,35) con n = decine dopo il 40 (1450 al 40, 3625 al 50, 5522 al 100, 7190 al 200; coefficiente 1,1 nella 1.7.0, 1,5 dalla 1.8.0 con le abilità), danno 8 (`FINAL_BOSS_HP`, `finalBossHp`);
    al livello 10 anche i nemici normali hanno il 93% della vita (`WALL_ENEMY_HP`). Tarati sul pool libero (vedi sotto). **[Claude]** (obiettivo del 30% **[deciso]**)
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

## 6. Nemici, stati e interfaccia dei nemici

- Aspetto a tema spaziale; il colore indica il tipo di danno (serve per leggere resistenze e debolezze). **[deciso]**
- Stati: rallentamento −50% velocità · bruciatura (danno nel tempo) · vulnerabilità +25% danno subito (a volte solo fisico) ·
  indebolimento −35% danno inflitto · paralisi (fermo) · distruzione −10% danno inflitto per pila (3 pile, 5 con la chain; 5 s). **[Claude]**
- Indicatori sopra i nemici: freccia viola = rallentamento, fulmine giallo = paralisi, cerchio con meno = indebolimento,
  mirino rosso = vulnerabilità, fiamma arancione = bruciatura, linee ondulate (una per pila) = distruzione. **[deciso]**
- La tabella delle resistenze (× 0,5 al proprio tipo, ×1,5 a un altro) è un **segnaposto** di Claude: **da decidere** (§ 11).

## 7. Salvataggio e PWA

- Menu → “Salvataggio · esporta o importa”: file JSON (sul telefono si apre la condivisione) o codice `FD1:…` (base64 del JSON).
  Import da file o codice incollato, con riepilogo e conferma prima di sostituire. Dati non validi rifiutati senza toccare i progressi. **[deciso]**
- Formato (versione 2, dalla 1.5.0): `{ game: "fortress-defense", version: 2, appVersion, exportedAt, progress: { cleared, seen, seals, claims, tree, loadout }, settings: { targeting } }`.
  `seals` = Sigilli da spendere; `claims` = premi riscossi (`s31` primo completamento Standard del 31, `s31p` premio della cupola al 100%, `e5`… Epica);
  `tree` = nodi comprati (`{ "sky:burn1": 1 }`); `loadout` = torrette equipaggiate. Un salvataggio della versione 1 si importa con Sigilli e albero vuoti;
  valori non validi (nodi sconosciuti, torrette equipaggiate senza sblocco, più di 4) vengono scartati. **[Claude]**
  Se il formato cambia: alzare `SAVE_VERSION` e gestire la migrazione in `parseSave`. Non salva la partita in corso. L’import accetta anche file con `aim` (versioni precedenti) e lo ignora; la versione del formato non cambia. **[Claude]**
- `localStorage`: `fortress-progress-v1` (livelli, nemici scoperti, Sigilli e albero; la chiave non cambia, i campi nuovi mancanti valgono zero), `fortress-proto-v1` (impostazioni).
- PWA: `manifest.json`, `sw.js`, icone. Schermata iniziale (nome del gioco in alto, icona ingrandita sotto): all’avvio, se online, controlla se c’è un nuovo `sw.js` (attesa massima 3 s). Se c’è, mostra “Aggiornamento in corso…”, scarica, attiva e ricarica la pagina. A controllo concluso (nessun aggiornamento, offline, tempo scaduto o ricarico già fatto) compare la scritta “Start” e si entra nel gioco con un tocco. Il ricarico avviene solo in questa schermata, mai durante una partita. **[deciso]**
  Serve HTTPS. Ad ogni pubblicazione alzare `APP_VERSION` (in index.html) e la versione dentro `sw.js`. `sw.js` deve cambiare ad ogni pubblicazione, altrimenti il browser non rileva l’aggiornamento. Se cambia l’elenco dei file, aggiornare anche `ASSETS`.
- **Schermo sempre acceso**: finché il gioco è aperto in primo piano lo schermo non si spegne, anche in automatico senza tocchi (Screen Wake Lock, richiesto dopo il tocco su “Start”, rilasciato in secondo piano e richiesto di nuovo al ritorno; se il browser non lo supporta il gioco funziona lo stesso). **[deciso]** (il comportamento) · modalità **[Claude]**

## 8. Guardiano e torrette *(generato)*

### Guardiano

Physical. Spara da solo, cadenza alta senza ricarica, portata totale, tutti i proiettili di una salva sullo stesso bersaglio; mentre si tiene premuto spara in verticale, senza bersaglio.
- **Standard** (max 3 pile): +1 perforazione (I colpi trapassano un nemico in più); Danno maggiorato (Danno +25%); +1 proiettile (+1 proiettile, danno −15%).
- **Chain · Frenesia** — lv1 Frenesia: Barra carica → fuoco e danno maggiori · lv2 Carica rapida: Carica in 25 s invece di 30 · lv2 Frenesia furiosa: Cadenza in frenesia ×2 (da ×1,8) · lv3 Frenesia prolungata: La frenesia dura 12 s invece di 8
- **Chain · Colpi esplosivi** — lv1 Colpi esplosivi: 10% di esplosione ad area sul colpo · lv2 Più esplosioni: Probabilità di esplosione maggiore · lv3 Esplosioni potenziate: Più probabilità e più raggio
- **Level up** — lv1 Ventaglio: Proiettili secondari a ventaglio · lv1 Colpo pesante: Molto più danno, lieve knockback · lv2 Perforazione II: +2 perforazione · lv2 Rimbalzo: I proiettili rimbalzano · lv3 Cadenza maggiorata: Cadenza di fuoco base +20%
- id nel codice: pierce, dmg, proj, frenzy1, fill, fspd, fdur, boom1, boomP, boom3, fan, punch, pen2, ricochet, rate3
- **Combo** (contano come scelte del guardiano): Sky Guard (torretta lv2) → Proiettili incendiari: Proiettili: +20% di danno extra da fuoco · Laser (torretta lv2) → Laser rotante: 3%: laser rotante sul bersaglio per 3 s · Disruption Drone (chain Distruzione, guardiano lv2) → Colpi distruttivi: 10%: il colpo dà uno stack di distruzione · Aeroblast (chain Mine, guardiano lv2) → Posamine: 5%: una mina dove colpisce (max 5) · Thunderbolt (chain Fulmini ramificati, guardiano lv2) → Colpi ramificati: 5%: il colpo si ramifica come il fulmine · Beam (chain Raggio amplificato, guardiano lv2) → Mira amplificata: Stesso bersaglio: danno +50% in 2 s · Firewheel Drone (chain Mini-droni, guardiano lv2) → Mini-drone di scorta: 3%: genera un mini-drone (max 3) · Hive (torretta lv2) → Clone speculare: Clone specchiato al 50% del danno · Railgun (torretta lv2) → Proiettili frammentati: 10%: il proiettile si divide in 2 · Teslacoil (chain Sovraccarico, guardiano lv2) → Colpo caricato: Ogni 40 colpi: un colpo a danno doppio · Gravity Vortex Gun (torretta lv2) → Proiettili gravitazionali: Proiettili: +20% di danno extra force

### Sky Guard (`sky`)

Fire · Missili a ricerca casuale, lungo raggio. Portata 520 px, ricarica 3,0 s.
- **Standard** (max 3 pile): Danno maggiorato (Danno +25%); +1 missile (+1 missile, danno −15%); Raggio d’impatto (Raggio d’impatto +30%).
- **Chain · Frammentazione** — lv1 Frammentazione: All’impatto: 3 mini-missili · lv2 Frammentazione II: I mini-missili diventano 6 · lv2 Mini-missili esplosivi: 50%: i mini-missili esplodono ad area · lv3 Frammentazione III: I mini-missili diventano 9
- **Chain · Missili incendiari** — lv1 Missili incendiari: I missili principali bruciano i colpiti · lv2 Bruciatura intensa: Danno da bruciatura +60% · lv3 Combustione: Chi muore bruciato esplode ad area
- **Level up** — lv1 Area infuocata: L’impatto brucia l’area per 5 s · lv1 Impatto devastante: Danno da impatto molto più alto · lv2 Scia incendiaria: I missili bruciano chi attraversano · lv2 Doppio impatto: Seconda esplosione dopo l’impatto · lv3 Salva potenziata: +2 missili per lancio
- id nel codice: dmg, msl, rad, split1, split2, splitB, split3, burn1, burn2, burn3, fire, impact, pass, again, plus2

### Laser (`laser`)

Energy · Raggi fissi che trapassano tutto. Portata 900 px, ricarica 5,0 s.
- **Standard** (max 3 pile): Danno maggiorato (Danno +25%); +1 rimbalzo (Raggio principale: rimbalzo, danno −20%); Durata maggiorata (Durata dei raggi +30%).
- **Chain · Raggi multipli** — lv1 Raggi multipli: +2 mini-raggi fissi, danno minore · lv2 Raggi debilitanti: Raggio e mini-raggi indeboliscono · lv2 Mini-raggi potenziati: Danno dei mini-raggi maggiore · lv3 Mini-raggi rimbalzanti: Anche i mini-raggi rimbalzano
- **Chain · Raggio spazzante** — lv1 Raggio spazzante: Un raggio attraversa lo schermo · lv2 Spazzata rallentante: Il raggio rallenta i colpiti · lv3 Doppia spazzata: Seconda spazzata in senso opposto
- **Level up** — lv1 Raggio largo: Larghezza dei raggi +100% · lv1 Raggio persistente: Durata dei raggi molto maggiore · lv2 Sfruttare i debuff: Più danno a chi ha un debuff · lv2 Raggi penetranti: 30%: ignora le resistenze del nemico · lv3 Debuff prolungati: I debuff durano di più
- id nel codice: dmg, bounce, dur, multi1, multiW, multiD, multi3, sweep1, sweep2, sweep3, wide, longer, exploit, ignore, debuffdur

### Disruption Drone (`disr`)

Force · Due droni creano un campo di forza a tutta larghezza. Portata 380 px, ricarica 8,0 s.
- **Standard** (max 3 pile): Danno maggiorato (Danno +25%); Campo più alto (Altezza del campo +30%); Campo più duraturo (Durata del campo +30%).
- **Chain · Teletrasporto** — lv1 Teletrasporto: 5%: il colpito viene spinto indietro · lv2 Salto al bordo: 2,5%: teletrasporto al bordo superiore · lv3 Teletrasporto letale: Il teletrasporto danneggia in % la vita
- **Chain · Distruzione** — lv1 Distruzione: Stack: i nemici infliggono −10% danno · lv2 Scarica distruttiva: A stack massimo: scarica di danno · lv2 Distruzione estesa: Stack massimo da 3 a 5 · lv3 Doppia scarica: Una seconda scarica a stack massimo
- **Level up** — lv1 Ricarica rapida: Ricarica leggermente ridotta · lv1 Esplosione finale: A fine durata il campo esplode · lv2 Campo destabilizzante: Più danni dalle altre torri nel campo · lv2 Pulsazione rapida: Il campo danneggia più spesso · lv3 Campo attrattivo: Più danno, attira verso il centro
- id nel codice: dmg, height, dur, tp1, tp2, tp3, dst1, dstB, dst5, dst3, reload, blast, amp, tick, grip

### Aeroblast (`aero`)

Physical · Colpi esplosivi con knockback, corto raggio. Portata 260 px, ricarica 2,6 s.
- **Standard** (max 3 pile): Danno maggiorato (Danno +25%); +1 proiettile (+1 proiettile, danno −15%); Più rapido (Danno +10%, ricarica −10%).
- **Chain · Salva di schegge** — lv1 Salva di schegge: Dopo il colpo: 5 proiettili minori · lv2 Schegge d’urto: Le schegge causano knockback · lv3 Doppia salva: Le schegge partono due volte
- **Chain · Mine** — lv1 Mine: Ogni colpo rilascia una mina · lv2 Più mine: 2 mine per colpo · lv2 Mine d’urto: Le mine causano knockback · lv3 Mine potenziate: Le mine fanno più danno
- **Level up** — lv1 Spinta maggiore: Knockback molto più forte · lv1 Esplosioni ampie: Raggio d’esplosione dei colpi +40% · lv2 Gittata estesa: Raggio d’azione +30% · lv2 Doppia esplosione: I colpi esplodono ancora dopo 1 s · lv3 Gittata massima: Raggio d’azione: altro +30%
- id nel codice: dmg, proj, fast, salvo1, salvoK, salvo2, mine1, mine2, mineK, mineD, knock, blast, reach, echo, reach2

### Thunderbolt (`thunder`)

Electric · Sfere sulla barriera, fulmini a tutto schermo. Portata 700 px, ricarica 1,6 s.
- **Standard** (max 3 pile): Danno maggiorato (Danno +25%); +1 sfera (+1 sfera, danno −15%); Più rapido (Danno +10%, ricarica −10%).
- **Chain · Fulmini ramificati** — lv1 Fulmini ramificati: I fulmini si ramificano 4 volte · lv2 Ramificazione II: Fino a 6 ramificazioni · lv3 Ramificazioni debilitanti: Indeboliscono e fanno più danno
- **Chain · Fulmini paralizzanti** — lv1 Fulmini paralizzanti: 30%: il fulmine paralizza i colpiti · lv2 Paralisi prolungata: La paralisi dura 1,5 s invece di 1 · lv2 Scossa continua: Danno elettrico ai paralizzati · lv3 Paralisi totale: Ramificazioni paralizzanti, danno +30%
- **Level up** — lv1 Fulmini larghi: Larghezza dei fulmini maggiore · lv1 Sfera sul campo: I fulmini possono creare una sfera · lv2 Doppio fulmine: 50%: il fulmine colpisce ancora · lv2 Fulmini corrosivi: I fulmini rendono vulnerabili · lv3 Sfere pungenti: Danni a chi è vicino alle sfere
- id nel codice: dmg, sph, fast, fork1, fork2, forkW, para1, paraT, paraD, para3, wide, orb, twice, vuln, aura

### Beam (`beam`)

Energy · Raggio che colpisce il bersaglio per tutta la durata. Portata 380 px, ricarica 3,4 s.
- **Standard** (max 3 pile): Danno maggiorato (Danno +25%); Durata estesa (Durata del raggio +30%); Ricarica ridotta (Ricarica −12%).
- **Chain · Raggio ramificato** — lv1 Raggio ramificato: Colpisce 2 bersagli in più · lv2 Attrazione: I bersagli si avvicinano al primo · lv2 Ramificazione estesa: Colpisce un bersaglio in più · lv3 Base esplosiva: Esplosioni ripetute sul primo bersaglio
- **Chain · Raggio amplificato** — lv1 Raggio amplificato: Il danno sul bersaglio sale fino al 200% · lv2 Amplificazione continua: Cambiando bersaglio non si azzera · lv3 Amplificazione massima: Il danno sale fino al 400%
- **Level up** — lv1 Vulnerabilità: Il raggio rende i nemici vulnerabili · lv1 Ritmo accelerato: Il danno del raggio è più rapido · lv2 Raggio vorace: Ogni uccisione lo allunga (fino a ×2) · lv2 Cacciatore di boss: Più danno a mini-boss e boss · lv3 Secondo laser: Genera un secondo laser
- id nel codice: dmg, dur, cd, fork1, pull, forkN, forkX, amp1, amp2, amp3, vuln, pace, feed, boss, second

### Firewheel Drone (`wheel`)

Fire · Drone lanciafiamme che rimbalza sullo schermo. Portata 380 px, ricarica 6,5 s.
- **Standard** (max 3 pile): Danno maggiorato (Danno +25%); Durata estesa (Durata +30%); Fiamme più ampie (Raggio del lanciafiamme +30%).
- **Chain · Mini-droni** — lv1 Mini-droni: Genera 2 mini-droni rimbalzanti · lv2 Mini-droni incendiari: I mini-droni bruciano i nemici · lv3 Mini-droni potenziati: I mini-droni fanno più danno
- **Chain · Scia di fuoco** — lv1 Scia di fuoco: Lascia una scia di 2 s che brucia · lv2 Scia combustibile: Nella scia: +30% danni da fuoco subiti · lv2 Fiamme intense: Bruciatura di questa torre +60% · lv3 Scia persistente: La scia dura 4 s invece di 2
- **Level up** — lv1 Scatto: Più veloce quando non colpisce · lv1 Fiamme roventi: Danno del lanciafiamme +60% · lv2 Presidio: Resta fermo 2,5 s a fine durata · lv2 Fiamma crescente: Ogni colpito: danno +10% (fino a ×2) · lv3 Raffreddamento: Ogni colpito: ricarica −5% (fino a −50%)
- id nel codice: dmg, dur, rad, mini1, miniB, miniD, trail1, trailR, trailB, trail3, dash, heat, stay, stoke, cool

### Hive (`hive`)

Force · Sciame di droni a ricerca. Portata 380 px, ricarica 7,0 s.
- **Standard** (max 3 pile): Danno maggiorato (Danno +25%); +1 drone (+1 drone, danno −15%); Più colpi (I droni sparano 2 volte in più).
- **Chain · Onda iniziale** — lv1 Onda iniziale: Il primo colpo è un’onda d’urto in avanti · lv2 Onda ampia: L’onda arriva più lontano · lv2 Onda rallentante: L’onda rallenta i nemici · lv3 Onda finale: Anche l’ultimo colpo è un’onda
- **Chain · Sciame** — lv1 Sciame: 35%: a fine vita lancia un nuovo drone · lv2 Sciame II: Il nuovo drone può essere di lv 2 · lv3 Sciame III: Il nuovo drone può essere di lv 3
- **Level up** — lv1 Evoluzione I: Dopo 3 colpi: +1 proiettile · lv1 Colpi di forza: I colpi dei droni spingono indietro · lv2 Evoluzione II: Dopo altri 3 colpi: +2 proiettili · lv2 Droni kamikaze: Finiti i colpi, il drone si lancia ed esplode · lv3 Resistenza: 30%: finiti i colpi, il drone ricarica
- id nel codice: dmg, drone, hits, wave1, waveR, wave2, wave3, seed1, seed2, seed3, evo1, push, evo2, kami, stay

### Railgun (`rail`)

Physical · Colpi perforanti a cadenza media. Portata 380 px, ricarica 1,5 s.
- **Standard** (max 3 pile): Danno maggiorato (Danno +25%); Ricarica ridotta (Ricarica −12%); +1 perforazione (Perfora un nemico in più).
- **Chain · Proiettile diviso** — lv1 Proiettile diviso: Dopo il 1° bersaglio si divide in 2 · lv2 Doppia divisione: Si divide ancora dopo il 2° · lv3 Slancio: Più danno per ogni nemico attraversato
- **Chain · Proiettile esplosivo** — lv1 Proiettile esplosivo: Il primo impatto provoca un’esplosione · lv2 Carica esplosiva: Più perforazioni: esplosione più forte · lv2 Deflagrazione: Più perforazioni: esplosione più ampia · lv3 Esplosioni a catena: Anche i colpiti dopo il primo esplodono
- **Level up** — lv1 Impatto: Danno maggiorato + knockback · lv1 Penetrazione: Più knockback e perforazione · lv2 Vulnerabilità fisica: I colpi rendono vulnerabili al fisico · lv2 Impatto stordente: Paralizza tutti i colpiti · lv3 Colpo critico: 30%: danno +50%
- id nel codice: dmg, cd, pierce, split1, split2, mass, boom1, boomD, boomR, boom3, punch, pen, vulnP, stun, crit

### Teslacoil (`tesla`)

Electric · Sfera elettrica che esplode al contatto. Portata 380 px, ricarica 2,2 s.
- **Standard** (max 3 pile): Danno maggiorato (Danno +25%); Ricarica ridotta (Ricarica −12%); +1 rimbalzo (+1 rimbalzo, danno −15%).
- **Chain · Sfera statica** — lv1 Sfera statica: Resta attiva 2 s dopo l’esplosione · lv2 Sfera rallentante: La sfera rallenta i nemici · lv2 Sfera carica: La sfera fa più danno · lv3 Sfera persistente: La sfera dura più a lungo
- **Chain · Sovraccarico** — lv1 Sovraccarico: Carica +0,5 s, esplosione più ampia · lv2 Carica potenziata: Carica +0,5 s, esplosione più forte · lv3 Carica massima: Carica +1 s: esplosione ancora maggiore
- **Level up** — lv1 Esplosione a catena: Colpisce in parte 5 nemici vicini · lv1 Esplosione ampia: Raggio dell’esplosione +40% · lv2 Ricarica rapida: Ricarica −20% · lv2 Esplosioni paralizzanti: 30%: l’esplosione paralizza i colpiti · lv3 Campo di carica: Mentre carica, colpisce chi è sopra
- id nel codice: dmg, cd, bounce, orb, orbSlow, orbD, orbDur, over1, over2, over3, chain, big, quick, stun, charge

### Gravity Vortex Gun (`vortex`)

Force · Buco nero che attrae e danneggia. Portata 260 px, ricarica 5,5 s.
- **Standard** (max 3 pile): Danno maggiorato (Danno +25%); Percorso più lungo (Lunghezza percorsa +30%); Raggio maggiore (Raggio del buco nero +25%).
- **Chain · Wormhole** — lv1 Wormhole: Due varchi: si riemerge dal secondo · lv2 Varco ampio: L’ingresso del wormhole è più grande · lv2 Varchi stabili: I wormhole durano 6 s invece di 4 · lv3 Uscita rallentante: Chi esce dal 2° varco è rallentato
- **Chain · Buco nero statico** — lv1 Buco nero statico: A fine percorso resta fermo e attrae · lv2 Statico prolungato: Il buco nero statico dura 3 s invece di 2 · lv3 Statico potente: Il buco nero statico fa più danno
- **Level up** — lv1 Attrazione forte: Forza attrattiva molto maggiore · lv1 Buco nero iperdenso: Danno dei buchi neri +50% · lv2 Secondo buco nero: Genera un secondo buco nero · lv2 Buco nero lento: Avanza più piano: resta più sui nemici · lv3 Collasso crescente: Danno e attrazione crescono col percorso
- id nel codice: dmg, len, rad, wh1, wh2, whT, wh3, stat1, stat2, stat3, pull, power, twin, lazy, grow

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
- Aeroblast (revisione 1): Esplosioni ampie = raggio 40 → 56 px; Gittata massima = altri +30% della portata base, che si somma a Gittata estesa (260 → 338 → 416 px)  **[da rivedere]**
- Thunderbolt: fulmine ogni 1,6 s, ramificazioni al 50%, sfera sul campo 30% per 4 s  **[Claude]**
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
- Laser (revisione 2): Raggi penetranti = a ogni attivazione, ogni nemico toccato ha il 30% di subire tutto il danno del laser senza resistenze
  (anche dalla spazzata); senza resistenza non cambia nulla  **[Claude]**
- Beam (revisione 2): Ramificazione estesa = 3 ramificazioni invece di 2  **[Claude]**
- Guardiano: intervallo 0,15 s e danno 7 per colpo; ventaglio 4 proiettili al 30%, esplosioni al 70% raggio 30 (39 con la chain lv3; tolta “Esplosioni ampie”), rimbalzo una volta, colpo pesante ×1,6 con knockback 1,5 px per colpo (4,5 in frenesia)  **[da rivedere]**
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
  Clone speculare = stessa cadenza e stesso numero di proiettili del guardiano (non il Ventaglio), 50% del danno senza combo, perforazione e Rimbalzo sì,
  esplosioni, knockback e combo no; in automatico sceglie il proprio bersaglio dalla posizione specchiata (mentre si preme spara in verticale); disegnato trasparente;
  Proiettili frammentati = 10% per proiettile (non Ventaglio), una volta per proiettile: due frammenti al 50% del danno verso i nemici più vicini
  non ancora colpiti (entro 200 px, altrimenti a ±20°), senza perforazione né rimbalzo;
  Colpo caricato = un proiettile in più ogni 40 salve, danno ×2 (×3 in tutto con Colpo pesante, scelta di Marco); eredita i “+1 rimbalzo” della
  Teslacoil (senza il −15%) oltre al Rimbalzo del guardiano; disegnato più grande e giallo  **[da rivedere]**
- Tiro verticale (revisione 3): mentre si preme il guardiano non sceglie bersagli, tutti i suoi proiettili partono in direzione verticale e proseguono fino al bordo dello schermo. Ventaglio e le altre combo valgono come prima. Il Clone speculare spara in verticale dalla posizione specchiata. **[deciso]** (clone) · dettagli **[Claude]**
- Combo del guardiano, nomi delle carte (Marco ha dato solo gli effetti): Proiettili incendiari, Laser rotante, Colpi distruttivi, Posamine,
  Colpi ramificati, Mira amplificata, Mini-drone di scorta, Clone speculare, Proiettili frammentati, Colpo caricato, Proiettili gravitazionali  **[da rivedere]**
- Combo del guardiano, letture di Claude: “torretta di lv2” = basta la torretta al livello 2, il guardiano può essere al livello 1;
  “scelta chain X” = la torretta ha la voce lv1 di quella chain  **[da rivedere]**
- Stati: vulnerabilità +25% danno subito, indebolimento −35% danno inflitto, rallentamento −50%, paralisi = stop, bruciatura nel tempo  **[Claude]**
- Boss: resistenze scelte da Claude, variabili per boss (mini-boss spinte 40-80% e stati 25-55%; finale 85% e 60%); boss finale vita base 400 al livello 10, 2250 al 20, 1450 al 30, dal 40 con la formula del § 5, danno alla cupola 8; mini-boss vita 480, danno 9  **[da rivedere]**
- Cupola larga (revisione 3): il profilo di collisione ha raggio orizzontale 215 px (prima 172), altezza invariata. Vale per il contatto dei nemici (ai bordi ora si fermano a circa y 517 invece di 550), per il bordo contro cui si fermano i rimbalzi del laser e per il punto in cui nascono le mine. Le sfere orbitanti del Thunderbolt restano sul profilo di prima (raggio 172), così non escono dallo schermo. **[Claude]** (da rivedere dopo la misura)
- Cristalli (`wisp`): velocità base da 72 a 60 px/s (restano il nemico più veloce; a ondata 20 circa 77 px/s invece di 92). Vita, danno e numero invariati. **[deciso]** (la riduzione) · 60 **[Claude]** (da misurare con i bot)

Interpretazioni di Claude **confermate**: Disruption Drone lv3 “aumento intervallo del danneggiamento” = danneggia più spesso (ogni 0,6 s);
Gravity Vortex Gun, “75% dello schermo” = 75% dell’altezza (percorso 253 px → 480 px con 3 pile); Hive, un “colpo” è una raffica
(i proiettili per colpo non contano nel limite di 10 colpi); “knockdown” del guardiano = knockback.

## 11. Decisioni aperte

- **Combo tra due torrette**: non ancora definite. Esempio di Marco: Beam + Gravity Vortex Gun (i laser finiscono con un buco nero attrattivo
  con danno ad area). Da decidere anche se contano come scelta di una delle due torri e di quale.
- **Sblocco delle combo**: per quelle del guardiano condizioni di livello e di chain (§ 3); per quelle tra torrette da decidere. Nota: con 4 slot su 11 torrette una coppia precisa capita insieme circa l’11% delle volte se non la si sceglie apposta.
- **Sigilli**: flusso e albero decisi in § 16. Aperti: costi e livelli massimi dei nodi, valori dei tetti, dettagli dei nodi della barriera (elenco in fondo al § 16), rimborso dei Sigilli (proposta di Claude: totale). Valori della fase 2 tutti provvisori (§ 16); curva dal 31 tarata con l’albero atteso (§ 5): va rifatta quando arriva l’equipaggiamento. Letture di Claude nella fase 1 da confermare (§ 16): premio della cupola solo da un completamento successivo al primo, Sblocco permanente dopo tutti gli altri nodi, torrette equipaggiate e carte sbloccate valide in tutti i livelli. **Moduli** (§ 15): vedi sotto.
- **Ranger**: ipotesi di Marco: sblocco al livello 60. Funzionamento non ancora discusso (aiutanti ai lati del personaggio; nel gioco originale escono dalle uova).
- **Boss finale**: abilità speciali o solo tanta vita? (ora solo tanta vita)
- **Mini-boss dal livello 11** (non dal 21): a tetto lv2 il budget è 28 su 39 necessari, quindi nessun surplus; da confermare.
- **Difficoltà dal livello 31**: tarata nella 1.7.0 con il solo albero dei Sigilli (pendenza 0,2 e boss finali, § 5). Quando arriva l’equipaggiamento
  il giocatore avrà più potenza: la curva andrà rialzata. Oggi vita, danno, numero e velocità crescono tutti in modo lineare con `effD`: dal 30 al 200
  vita ×1,49, danno ×1,28, numero ×1,15. Indicazione di Marco **[deciso]**: oltre il 30 i nemici devono diventare **sia più numerosi sia più forti di base**,
  con una curva di incremento; forma della curva da decidere con i bot e l’equipaggiamento.
- **Boss Physical**: con l’albero i muri con boss Physical (90, 140, 190) misurano 13-27%, quelli Electric 43-48%: il guardiano è Physical e il boss gli resiste
  (tabella delle resistenze segnaposto, § 6). Da rivedere con le resistenze vere.
- **Resistenze dei nemici normali**: la tabella attuale è un segnaposto di Claude.
- **Idee messe da parte**: Modulo con “+1 vita barriera per nemico ucciso” (rischio di rigenerazione quasi illimitata; da riprendere con un tetto per ondata o per partita).
- **Nomi** definitivi delle due famiglie di chip (provvisori: Sigilli e Moduli).
- **Moduli** (§ 15): valori X per rarità e regole di calcolo proposti da Claude, da confermare e poi misurare con i bot.
- **Barriera minata e cupola larga**: con la cupola larga 215 px il bordo esce dallo schermo, quindi le mine dell’abilità possono nascere fuori vista o in punti bassi ai lati. Proposta di Claude: le mine compaiono solo sulla parte visibile del bordo (x da 0 a 360). **(aperto)**

## 12. Contenuti mancanti (da definire con Marco)

Obiettivo § 3: per ogni torre e per il guardiano una chain da 1 lv1, 2 lv2, 1 lv3 e una da 1 lv1, 1 lv2, 1 lv3; 2 level up a lv1 e a lv2, almeno 1 a lv3.
**Complete tutte le torri e il guardiano** (revisioni 1 e 2; controllato da `tests/rev2.js`). Nessuna voce provvisoria rimasta.

- **Combo del guardiano**: tutte e 11 definite (`tests/combo.js`).
- **Combo tra due torrette**: nessuna definita (esempio in § 11).

## 13. Da costruire

Ranger · equipaggiamento e chip (§ 15) · più guardiani da scegliere prima del combattimento · schermata degli sblocchi permanenti ·
ricompense e valute fuori dalla battaglia · livelli con un’identità propria (oggi i 50 livelli seguono la stessa regola di ondate) ·
difesa planetaria con aree da sbloccare · livelli a rotazione settimanale · boss a tempo · eventi a roulette/estrazione · uova ·
salvataggio della partita in corso · audio e altre impostazioni · bilanciamento tarato da un giocatore vero.

## 14. Strumenti di lavoro

- **Checklist di revisione** (artefatto su claude.ai, gestita dal progetto): https://claude.ai/artifact/MdJMokJ4LquiwS7M4BViSX
- **Modifiche dal lato codice**: `docs/CHANGELOG.md`, con le voci della checklist da aggiornare.
- **Catalogo grafico** (`docs/catalogo-grafico.html`): pagina unica con schermate, torrette, guardiano, nemici, proiettili, effetti e animazioni, disegnati dal codice stesso del gioco;
  serve anche da file da passare ad altre IA per migliorare la grafica. Si rigenera con `npm run catalog` (in automatico prima di `npm test`);
  un test fallisce se è indietro rispetto ai file del gioco. Ogni voce del CHANGELOG riporta se è stato rigenerato. **[deciso]**
  (percorso, comando e test **[Claude]**)
  Il disegno sta in `app/draw.js`, modulo condiviso dal gioco e dal catalogo **[Claude]**.

## 15. Equipaggiamento e chip (da costruire)

- **Due famiglie di chip** (nomi provvisori **[da rivedere]**): **Sigilli**, che si spendono nell’albero dei potenziamenti permanenti (§ 16); **Moduli**, che si inseriscono negli slot dell’equipaggiamento. **[deciso]** (la distinzione; i nomi sono di Claude)
- **Equipaggiamento**: 6 pezzi (testa, armatura, guanti, stivali, arma, nucleo). Ogni pezzo dà una statistica base (tipicamente attacco del personaggio) e ha slot per i Moduli. Si trova come drop casuale a fine livello assieme ai chip. **[deciso]**
- **Rarità** di equip e Moduli: comune, raro, epico, leggendario, ancestrale. Slot per rarità dell’equip: **1, 2, 3, 4, 5**. **[deciso]** (bonus base per rarità: da definire)
- **Moduli**: stesse 5 rarità; il tipo indica in quale pezzo entrano (6 tipi). Ogni Modulo ha **un effetto**, preso dal pool del suo pezzo
  (catalogo e pool sotto); la rarità decide il valore X. **[deciso]**
- **Fusione**: si fondono sia gli equip sia i Moduli, **per tutte le rarità**, e il risultato è della rarità successiva. **[deciso]**
  - Equip: **5 pezzi uguali** (stesso tipo e rarità).
  - Moduli: **5 Moduli dello stesso pezzo e della stessa rarità**, anche con effetti diversi; l’effetto del risultato si **estrae a caso dal pool
    del pezzo**, con i pesi sotto.
- **Doppioni**: nello stesso pezzo non si installano due Moduli con lo stesso effetto; su pezzi diversi gli effetti si sommano
  (le probabilità hanno un tetto del 100%). **[deciso]**

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
| 10 | Immunità ai primi X danni e contrattacco pari al X% del danno del guardiano per i primi X colpi nemici | 1 |
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
| Armatura | 10 (immunità e contrattacco) | 5, 11, 12, 13, 15, 16, 24, 28 |
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
| 10 | Immunità ai primi danni / contrattacco / colpi | 5 / 50% / 3 | 8 / 100% / 4 | 12 / 150% / 5 | 16 / 200% / 6 | 20 / 300% / 8 |
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
- Immunità ai primi danni (10): la barriera ignora i primi X danni della battaglia; i primi colpi nemici ricevono il contrattacco, una volta per battaglia.
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
- **Da misurare con i bot** (livelli oltre il 30, equipaggiamento nullo, medio e massimo): tabelle di drop per rarità e difficoltà, bonus per rarità (valori X degli effetti), potenza totale dell’equipaggiamento completo, peso degli effetti 21, 22, 29 e 30 sul budget di scelte. Con fusione 5:1 un ancestrale vale 625 comuni: i drop devono dare direttamente rarità alte.

## 16. Sigilli e albero dei potenziamenti (da costruire)

- **Valuta**: i Sigilli sono una sola valuta, spendibile in tutte le sezioni dell’albero. **[deciso]**
- **Flusso** **[deciso]**: i Sigilli cadono dal **livello 31** (nessuno prima). Standard: **1** per livello; Epica: **3** per livello, dal livello 1 di Epica.
  Si riscuotono al primo completamento. Non si riottengono completando di nuovo il livello, tranne **una sola volta per livello e modalità**, completandolo con la
  **barriera al 100% a fine livello** (la vita si misura alla fine: contano anche cure e Backup). Ogni livello e modalità paga quindi al massimo due volte.
  *(Se il primo completamento è già perfetto, il secondo premio resta riscuotibile con una rigiocata perfetta: lettura da confermare.)* Un solo premio ciascuno, della stessa entità.
- **Struttura** **[deciso]**: una schermata con tre sezioni: **Barriera**, **Guardiano**, **Torrette** (con una sezione condivisa per tipo). Regola dei livelli (proposta di Marco): un nodo non supera il livello del nodo da cui dipende.
- **Tetti** **[deciso]** il principio, valori **[Claude] [da rivedere]**: hanno un tetto sul totale (equip + albero) solo la **riduzione del cooldown delle abilità** e la **riduzione del danno subito**.
  Il tetto sta sopra il massimo dell’equipaggiamento (cooldown −50%, danno −30%), così i nodi dell’albero servono anche a chi ha l’equip massimo. Nessuna abilità dura quanto il suo cooldown minimo. Gli altri bonus (danni di tipo, ecc.) non hanno tetto.

### Barriera
- **Spina** **[deciso]** (schema): Vita % → Riduzione danno. Da lì due rami.
  - **Potenziamenti avanzati**: Vita fissa · Riduzione cooldown abilità · torretta o guardiano con più carte (+cadenza) · ignorare un colpo (nodi 6 e 7 fusi: nemici normali e boss).
  - **Abilità** (fino a 3 equipaggiate dal livello 40; potenziabili nell’albero), in tre gruppi per ruolo, ognuno con un’abilità d’ingresso sempre sceglibile:
    - **Resistere**: Rigenerazione · Barriera di backup · Barriera impenetrabile
    - **Controllo**: Barriera repulsiva · Barriera congelante · Barriera riflettente
    - **Offesa**: Barriera ustionante · Barriera minata · Barriera potenziante
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
- **Nodi per ogni torretta (9)** **[deciso]**:
  - sblocco della chain da 3 voci (3 nodi, in sequenza);
  - sblocco di uno dei due lv2 dell’altra chain (1);
  - sblocco di un level up lv2 (1);
  - potenziamento delle 3 carte standard (3 nodi, con più livelli ciascuno): azzerano i malus e aumentano anche di molto i bonus, con l’obiettivo di restare efficaci fino a ~200 livelli di campagna;
  - **sblocco permanente della torretta** (1, nodo finale).
- **Sblocco permanente**: con il nodo acquistato la torretta si può equipaggiare prima dell’ondata 1, fino a 4. Ogni torretta equipaggiata consuma una scelta: le prime N scelte dopo le ondate vengono saltate,
  così il totale resta 19 (28 dal livello 11) e la regola delle scelte non cambia. Le torrette già equipaggiate non escono più come carte. **[deciso]**
- **Carte bloccate** (non disponibili fino all’acquisto, dal livello 1; i livelli 1-30 si giocano con il pool libero, vedi § 5) **[Claude] [da rivedere]**.
  Criterio: si blocca la carta che aggiunge una meccanica o il salto di potenza maggiore; restano libere quelle numeriche.
  Nel codice: tabella `TREE_LOCKS` (anche il guardiano) e sblocchi in `META.unlocked`, per ora a mano; controllo in `tests/rev2.js` (pool libero) e `tests/combo.js` (combo bloccate). **[Claude]**

| Torretta | Chain da 3 voci bloccata | lv2 bloccato dell’altra chain | Level up lv2 bloccato |
|---|---|---|---|
| Sky Guard | Missili incendiari | Mini-missili esplosivi | Doppio impatto |
| Laser | Raggio spazzante | Raggi debilitanti | Sfruttare i debuff |
| Disruption Drone | Teletrasporto | Scarica distruttiva | Campo destabilizzante |
| Aeroblast | Salva di schegge | Mine d’urto | Doppia esplosione |
| Thunderbolt | Fulmini ramificati | Scossa continua | Fulmini corrosivi |
| Beam | Raggio amplificato | Attrazione | Raggio vorace |
| Firewheel Drone | Mini-droni | Scia combustibile | Fiamma crescente |
| Hive | Sciame | Onda rallentante | Droni kamikaze |
| Railgun | Proiettile diviso | Deflagrazione | Impatto stordente |
| Teslacoil | Sovraccarico | Sfera rallentante | Esplosioni paralizzanti |
| Gravity Vortex Gun | Buco nero statico | Varchi stabili | Secondo buco nero |

### Guardiano **[deciso]** (9 nodi)
- Sblocco della chain **Colpi esplosivi** (3 nodi, in sequenza); lv2 **Frenesia furiosa**; level up lv1 **Colpo pesante**; level up lv2 **Rimbalzo**.
- Potenziamenti: carta standard **Danno maggiorato**; riduzione del malus di **+1 proiettile**; colpi aggiuntivi del **Ventaglio**.
- Restano libere: chain Frenesia (lv1, Carica rapida, lv3), Ventaglio, Perforazione II, Cadenza maggiorata, le tre carte standard.

### Fase 1 costruita (1.5.0)
- **Premi** come sopra. Lettura applicata: il premio della cupola al 100% si prende solo con un completamento **successivo** al primo (anche se il primo era già perfetto). **[da rivedere]** (la lettura era da confermare)
- **Nodi** (generati da `TREE_LOCKS`): per ogni torretta 3 nodi della chain in sequenza, 1 per il lv2 dell’altra chain, 1 per il level up lv2, e lo **Sblocco permanente** che richiede
  **tutti gli altri nodi della torretta** (lettura di “nodo finale” **[Claude] [da rivedere]**); guardiano: 3 nodi di Colpi esplosivi in sequenza, Frenesia furiosa, Colpo pesante, Rimbalzo.
  Ogni nodo di sblocco ha un solo livello.
- **Costi** **[provvisorio]**: chain 1, 1, 2; altre carte 1; sblocco permanente 3. Una torretta completa costa 9 Sigilli, il guardiano 7, tutto l’albero di fase 1 106.
  In Standard dal 31 al 50 si prendono al massimo 40 Sigilli (20 livelli × 2 premi), in Epica fino a 300.
- **Acquisto**: primo tocco sul nodo = selezione, secondo tocco = spesa (come “Abbandona”). Nessun rimborso per ora (proposta di rimborso totale ancora aperta, § 11).
- **Torrette equipaggiate**: si scelgono toccando lo Sblocco permanente già comprato (al massimo 4); valgono in **tutti i livelli e le modalità**, come le carte sbloccate
  (lettura **[Claude] [da rivedere]**). Ognuna occupa il primo slot libero e salta una delle prime scelte dopo le ondate (all’annuncio dell’ondata: “Scelta già usata da una torretta
  equipaggiata”). `META.startTurrets` resta lo sblocco a mano per le prove e non salta scelte.
- **Schermata**: menu → “Albero dei Sigilli” (si apre completando il 31): sezioni Guardiano, Torrette (griglia delle 11 torrette, nodi della torretta scelta), Barriera (solo l’elenco di ciò che arriverà).
  La schermata di vittoria mostra i Sigilli presi e, se resta, il premio della cupola al 100%.

### Fase 2 costruita (1.6.0) · valori **[Claude] [provvisorio]**
- **Nodi a livelli**: livello da 0 a max; il livello L costa 1 + ⌊(L − 1)/5⌋ Sigilli (1 per i livelli 1-5, 2 per i 6-10, 3 per gli 11-15, 4 per i 16-20):
  5 per un nodo da 5 livelli, 50 per uno da 20 (1.7.0; prima L Sigilli per il livello L). Regola dei livelli applicata: un nodo non supera
  il livello dei nodi da cui dipende (es. Riduzione danno al 2 solo con Vita % almeno al 2).
- **Carte standard delle torrette** (3 nodi per torretta: **Danno maggiorato fino al 20**, le altre fino al 5): con il nodo al livello L, per ogni pila della carta:
  bonus in % (danno, raggio, durata, altezza, percorso) ×(1 + 0,4·L), fino a ×3 al 5 e ×9 al 20 (Danno maggiorato da +25% a +75% per pila al 5, +225% al 20);
  ricarica (Ricarica ridotta, la parte “ricarica” di Più rapido) ×(1 + 0,2·L) (−12% → −24% per pila);
  bonus a numero (+1 perforazione della Railgun, Più colpi dell’Hive) ×(1 + 0,4·L) arrotondato (Railgun 1 → 3, Hive 2 → 6);
  malus (+1 missile, sfera, drone, proiettile, rimbalzo) −1/3 per livello: zero al 3, poi diventa bonus (−15% → +10% al 5; Laser −20% → +13,3%).
  Le carte con malus restano “+1” (il numero non cresce).
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
- Costo dell’albero intero (1.7.0): sblocchi 106, carte standard 660 (torrette) + 56 (guardiano), Tipi 305, Barriera 75: **1202 Sigilli**. In Standard fino al 200
  se ne prendono al massimo 340 (circa 255 con metà dei premi della cupola), in Epica fino a 1200: l’albero dura ben oltre il 200.
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

### Regole generali
- I Sigilli non danno scelte o carte in più: il budget di scelte (§ 4) resta valido. **[deciso]**
- **Da misurare con i bot**: muri 10/20/30 con il pool libero; potenza richiesta fino a 200 livelli (con la formula attuale la vita base dei nemici è ×1,9 al 100 e ×3,2 al 200 rispetto al 30, ma la curva oltre il 30 cambierà);
  costi e livelli dei nodi; valori dei tetti; effetto sulle prime ondate delle torrette in anticipo.
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
  - 5 livelli per ogni abilità; la prima di ogni gruppo è al livello 1 senza spesa, la seconda si sblocca con un nodo, la terza dopo la seconda.
  - Le abilità si equipaggiano dal livello 40 (completato).
  - Partenza sfalsata: la prima abilità con cooldown scatta a 10 s, la seconda a 20, la terza a 30. Le abilità con cooldown aspettano un nemico in campo
    (la Repulsiva un nemico vicino alla barriera) prima di scattare.
  - Costi: sblocco della seconda e della terza abilità di un gruppo 3 Sigilli; livelli 2-5 1 Sigillo ciascuno (come gli altri nodi). La terza non supera il livello della seconda,
    la seconda non supera quello della prima (regola dei livelli).
  - Valori per livello 1 → 5: Rigenerazione 2 → 4% della vita massima al secondo, per 5 → 7 s, 1 → 3 volte · Backup vita 20 → 60% · Impenetrabile un’immunità ogni 40 → 20 s ·
    Repulsiva spinta 50 → 130 px (solo i nemici vicini alla barriera, metà schermo) · Congelante −25 → −45%, gas 8 s alto 60 → 140 px · Riflettente 30 → 70% del danno per 4 → 8 s
    (danno force) · Ustionante 5 → 9 s, bruciatura di 3 s a 6 al secondo o al valore della torretta di fuoco più forte (Sky Guard: Missili incendiari; Firewheel: scia) ·
    Minata 4 → 8 mine sul bordo · Potenziante +15 → +40% per 6 → 10 s. Il nodo Riduzione cooldown e il suo tetto valgono per tutte; Impenetrabile non scende sotto i 20 s.
  - Il bonus della Potenziante si somma a quelli dell’albero (tipo, tutte le torrette, Più carte): per questo anche “Più carte, più danno” ora si somma invece di moltiplicare.
  - Fase 3 **costruita** nella 1.8.0 (vedi CHANGELOG); i vecchi segnaposto di rigenerazione e repulsione in `META` sono stati tolti (`META.domeAbilities` ora prende gli id delle nuove abilità).
