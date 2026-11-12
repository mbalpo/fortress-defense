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

- Schermo logico 360×640, sempre in verticale. In basso il suolo, sopra la **cupola** (semi-ellisse larga 344 px, alta 95 px al centro) che protegge
  guardiano e torrette. In fondo la barra della vita della cupola. **[deciso]** (altezza ridotta su richiesta)
- **20 ondate** per livello. Dopo ogni ondata, tranne l’ultima, si sceglie **1 carta tra 3** pescate a caso: **19 scelte per partita**. **[deciso]**
- Si parte **senza torrette**: le torrette escono come carte e vanno nel **primo dei 4 slot fissi** liberi (al massimo 4 torrette). **[deciso]**
- I nemici scendono dall’alto; a contatto con la cupola si fermano e la colpiscono ogni 1,2 s. Cupola a 0 = partita persa. **[Claude]**
- **Guardiano** (prima chiamato “personaggio”): si muove sul suolo trascinando (mira automatica) e spara da solo. **[deciso]**
- **Mira** (scelta nel menu, ricordata): automatica, oppure manuale = il guardiano resta fermo e spara solo mentre si tiene premuto;
  premendo entro 45 px da un nemico i colpi lo inseguono, altrimenti vanno dritti verso il dito. Le torrette sparano sempre da sole. **[deciso]** (45 px **[Claude]**)
- **Bersaglio** (torrette e guardiano): “più vicino” o “vita più alta”. **[deciso]**
- **Frenesia** (chain del guardiano): la barra si carica nel tempo; in automatico parte da sola ma va in pausa se non ci sono nemici a schermo;
  in manuale parte e scorre solo mentre si preme. Una frenesia attiva a fine ondata continua in quella dopo. **[deciso]**
- **Pausa**: pulsante in alto (o Esc/P), si attiva da sola se si cambia app. Due schede: “Nemici del livello” e “Torri e potenziamenti”.
  “Abbandona” chiede un secondo tocco. **[deciso]**
- **Nemici scoperti** (per tutta la campagna, salvati sul dispositivo): nella scheda Nemici solo quelli già incontrati, gli altri “sconosciuto”;
  al primo incontro compare l’avviso “Nuovo nemico” (3,5 s, uno alla volta, si ferma in pausa).
  Mini-boss e boss finale si scoprono **tipo per tipo**. **[deciso]**

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
- **Probabilità** delle carte (pesi): standard 1, chain 0,4, combo 0,4, level up 2, nuova torretta 3 (1,5 con già 2 torrette). **[deciso]** (numeri **[Claude]**)
- Le carte “+1 proiettile/sfera/drone/rimbalzo” tolgono il 15% (o il 20%) di danno per pila. **[deciso]**

## 4. Campagna e progressione

- 50 livelli selezionabili (fino a “completati + 1”). Il livello di difficoltà D è il numero del livello; in **Epica D = livello + 30**. **[deciso]**
- **Tetto di livello** di torri e guardiano, in base ai livelli completati: lv1 fino al 10, **lv2 dopo il 10**, **lv3 dopo il 20**. **[deciso]**
- Sblocchi a fine livello: 10 → lv2, 20 → lv3, **30 → equipaggiamento** (testa, armatura, guanti, stivali, arma, nucleo),
  **40 → abilità della barriera** (fino a 3), **50 → Epica**. Equipaggiamento e abilità della barriera **non sono ancora costruiti**. **[deciso]**
- **Mini-boss** (nave aliena) alle ondate 5, 10, 15: dal livello 11 in Standard, sempre in Epica. Sconfitto, dà **3 carte a caso applicate subito**
  (schermata di riepilogo). Tipo di danno variabile per ondata e livello. **[deciso]**
- **Boss finale** (nave madre) all’ondata 20 dei livelli multipli di 10, con barra della vita grande in alto; il livello finisce quando muore. **[deciso]**
- Boss e mini-boss: **sempre immuni** a paralisi, attrazione e teletrasporto; **resistenza variabile** a knockback e stati
  (riduce l’intensità, non la durata). **[deciso]** (valori **[da rivedere]**, § 10)
- Fino a difficoltà 10 solo nemici “piccoli” (niente asteroidi). **[deciso]**
- Budget di scelte: 19 per partita, **28 dal livello 11** con i 3 mini-boss. Servono 19 scelte per riempire tutto al tetto lv1, 39 al tetto lv2,
  64 al tetto lv3 (4 torrette + guardiano). Massimizzarne 2 richiede almeno 26 scelte, 3 almeno 39: per questo, con 28 scelte,
  **non si possono massimizzare più di 2 tra torri e guardiano** senza bisogno di una regola esplicita. **[deciso]**
- Progressione salvata sul dispositivo: livelli completati e nemici scoperti; impostazioni (bersaglio, mira) a parte. **[deciso]**

## 5. Difficoltà e calibrazione

- Formule (in `app/index.html`, sezione CAMPAGNA):
  - vita dei nemici: `levelHp(D)` = 0,42 + 0,08·(D−1) fino a D=10, poi +0,02 per livello (valori in `LV`);
  - difficoltà effettiva `effD`: piena fino a 20, al **30%** tra 20 e 30 (la potenza del giocatore è ferma fino al boss del 30),
    piena dal 31 *(provvisoria: dal 31 serviranno equipaggiamento, barriera e chip)*;
  - danno, velocità e numero dei nemici salgono piano con `effD`; dentro il livello ogni ondata aggiunge +9% di vita;
  - mini-boss: vita 480, danno 9; boss finale: vita 800 al 10, 2800 al 20, poi +100 ogni 10 livelli, danno 8. **[da rivedere]**
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
- La difficoltà in **mira manuale non è misurata** (i bot giocano solo in automatico).

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
- Formato: `{ game: "fortress-defense", version: 1, appVersion, exportedAt, progress: { cleared, seen }, settings: { targeting, aim } }`.
  Se il formato cambia: alzare `SAVE_VERSION` e gestire la migrazione in `parseSave`. Non salva la partita in corso.
- `localStorage`: `fortress-progress-v1` (livelli, nemici scoperti), `fortress-proto-v1` (impostazioni).
- PWA: `manifest.json`, `sw.js` (risponde dalla cache e aggiorna in background: la versione nuova arriva all’avvio successivo), icone.
  Serve HTTPS. Ad ogni pubblicazione alzare `APP_VERSION` (in index.html); se cambia l’elenco dei file, aggiornare `ASSETS` e `CACHE` in `sw.js`.

## 8. Guardiano e torrette *(generato)*

### Guardiano

Physical. Spara da solo (o solo mentre si preme, in mira manuale), cadenza alta senza ricarica, portata totale, tutti i proiettili di una salva sullo stesso bersaglio.
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
  esplosioni, knockback e combo no; in automatico sceglie il proprio bersaglio dalla posizione specchiata; disegnato trasparente;
  Proiettili frammentati = 10% per proiettile (non Ventaglio), una volta per proiettile: due frammenti al 50% del danno verso i nemici più vicini
  non ancora colpiti (entro 200 px, altrimenti a ±20°), senza perforazione né rimbalzo;
  Colpo caricato = un proiettile in più ogni 40 salve, danno ×2 (×3 in tutto con Colpo pesante, scelta di Marco); eredita i “+1 rimbalzo” della
  Teslacoil (senza il −15%) oltre al Rimbalzo del guardiano; disegnato più grande e giallo  **[da rivedere]**
- Combo del guardiano, nomi delle carte (Marco ha dato solo gli effetti): Proiettili incendiari, Laser rotante, Colpi distruttivi, Posamine,
  Colpi ramificati, Mira amplificata, Mini-drone di scorta, Clone speculare, Proiettili frammentati, Colpo caricato, Proiettili gravitazionali  **[da rivedere]**
- Combo del guardiano, letture di Claude: “torretta di lv2” = basta la torretta al livello 2, il guardiano può essere al livello 1;
  “scelta chain X” = la torretta ha la voce lv1 di quella chain  **[da rivedere]**
- Stati: vulnerabilità +25% danno subito, indebolimento −35% danno inflitto, rallentamento −50%, paralisi = stop, bruciatura nel tempo  **[Claude]**
- Boss: resistenze scelte da Claude, variabili per boss (mini-boss spinte 40-80% e stati 25-55%; finale 85% e 60%); boss finale vita 800 al livello 10, 2800 al 20, 2900 al 30 (oltre il 30 provvisoria), danno alla cupola 8; mini-boss vita 480, danno 9  **[da rivedere]**

Interpretazioni di Claude **confermate**: Disruption Drone lv3 “aumento intervallo del danneggiamento” = danneggia più spesso (ogni 0,6 s);
Gravity Vortex Gun, “75% dello schermo” = 75% dell’altezza (percorso 253 px → 480 px con 3 pile); Hive, un “colpo” è una raffica
(i proiettili per colpo non contano nel limite di 10 colpi); “knockdown” del guardiano = knockback.

## 11. Decisioni aperte

- **Combo tra due torrette**: non ancora definite. Esempio di Marco: Beam + Gravity Vortex Gun (i laser finiscono con un buco nero attrattivo
  con danno ad area). Da decidere anche se contano come scelta di una delle due torri e di quale.
- **Sblocco delle combo**: per quelle del guardiano condizioni di livello e di chain (§ 3); per quelle tra torrette da decidere. Nota: con 4 slot su 11 torrette una coppia precisa capita insieme circa l’11% delle volte se non la si sceglie apposta.
- **Chip a fine livello** (come nel gioco originale): potenziamenti permanenti di torrette e guardiano, sblocco di carte chain/combo/level up,
  rimozione delle penalità delle carte “+1 proiettile/rimbalzo”. Da progettare. Se spendibili fin dall’inizio, la curva dal livello 20 va ricalibrata.
- **Ranger**: sblocco e funzionamento non ancora discussi (aiutanti ai lati del guardiano; nel gioco originale escono dalle uova).
- **Boss finale**: abilità speciali o solo tanta vita? (ora solo tanta vita)
- **Mini-boss dal livello 11** (non dal 21): a tetto lv2 il budget è 28 su 39 necessari, quindi nessun surplus; da confermare.
- **Difficoltà dal livello 31**: riprende a salire piena, ma equipaggiamento, barriera e chip non esistono ancora: da ricalibrare quando arrivano.
- **Resistenze dei nemici normali**: la tabella attuale è un segnaposto di Claude.

## 12. Contenuti mancanti (da definire con Marco)

Obiettivo § 3: per ogni torre e per il guardiano una chain da 1 lv1, 2 lv2, 1 lv3 e una da 1 lv1, 1 lv2, 1 lv3; 2 level up a lv1 e a lv2, almeno 1 a lv3.
**Complete tutte le torri e il guardiano** (revisioni 1 e 2; controllato da `tests/rev2.js`). Nessuna voce provvisoria rimasta.

- **Combo del guardiano**: tutte e 11 definite (`tests/combo.js`).
- **Combo tra due torrette**: nessuna definita (esempio in § 11).

## 13. Da costruire

Ranger · equipaggiamento · più guardiani da scegliere prima del combattimento · abilità della barriera e mine
(rigenerazione e repulsione esistono, oggi impostate a mano in `META`) · schermata degli sblocchi permanenti · chip ·
ricompense e valute fuori dalla battaglia · livelli con un’identità propria (oggi i 50 livelli seguono la stessa regola di ondate) ·
difesa planetaria con aree da sbloccare · livelli a rotazione settimanale · boss a tempo · eventi a roulette/estrazione · uova ·
salvataggio della partita in corso · audio e altre impostazioni · bilanciamento tarato da un giocatore vero.

## 14. Strumenti di lavoro

- **Checklist di revisione** (artefatto su claude.ai, gestita dal progetto): https://claude.ai/artifact/MdJMokJ4LquiwS7M4BViSX
- **Modifiche dal lato codice**: `docs/CHANGELOG.md`, con le voci della checklist da aggiornare.
