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
  personaggio e torrette. In fondo la barra della vita della cupola. **[deciso]** (altezza ridotta su richiesta)
- **20 ondate** per livello. Dopo ogni ondata, tranne l’ultima, si sceglie **1 carta tra 3** pescate a caso: **19 scelte per partita**. **[deciso]**
- Si parte **senza torrette**: le torrette escono come carte e vanno nel **primo dei 4 slot fissi** liberi (al massimo 4 torrette). **[deciso]**
- I nemici scendono dall’alto; a contatto con la cupola si fermano e la colpiscono ogni 1,2 s. Cupola a 0 = partita persa. **[Claude]**
- **Personaggio**: si muove sul suolo trascinando (mira automatica) e spara da solo. **[deciso]**
- **Mira** (scelta nel menu, ricordata): automatica, oppure manuale = il personaggio resta fermo e spara solo mentre si tiene premuto;
  premendo entro 45 px da un nemico i colpi lo inseguono, altrimenti vanno dritti verso il dito. Le torrette sparano sempre da sole. **[deciso]** (45 px **[Claude]**)
- **Bersaglio** (torrette e personaggio): “più vicino” o “vita più alta”. **[deciso]**
- **Frenesia** (chain del personaggio): la barra si carica nel tempo; in automatico parte da sola ma va in pausa se non ci sono nemici a schermo;
  in manuale parte e scorre solo mentre si preme. Una frenesia attiva a fine ondata continua in quella dopo. **[deciso]**
- **Pausa**: pulsante in alto (o Esc/P), si attiva da sola se si cambia app. Due schede: “Nemici del livello” e “Torri e potenziamenti”.
  “Abbandona” chiede un secondo tocco. **[deciso]**
- **Nemici scoperti** (per tutta la campagna, salvati sul dispositivo): nella scheda Nemici solo quelli già incontrati, gli altri “sconosciuto”;
  al primo incontro compare l’avviso “Nuovo nemico” (3,5 s, uno alla volta, si ferma in pausa).
  Mini-boss e boss finale si scoprono **tipo per tipo**. **[deciso]**

## 3. Sistema di potenziamenti

- Categorie: **standard**, **chain**, **combo**, **level up**. **[deciso]**
- Ogni torre e il personaggio partono al **livello 1**: 3 potenziamenti (standard, chain o combo), poi serve un **level up** per salire.
  **Livello massimo 3 = 12 potenziamenti** (3 + level up, per 3 livelli). **[deciso]**
- Un level up di livello inferiore resta disponibile ai livelli successivi. **[deciso]**
- **Standard**: massimo 3 pile per voce (per torre, non per partita). **[deciso]**
- **Chain**: la voce di livello N richiede una voce di livello N−1 della stessa catena **e la torre al livello N**. **[deciso]**
- Obiettivo di contenuto per ogni torre: **2 chain complete** (1 voce lv1, 2 lv2, 1 lv3) e **2 level up a lv1 e a lv2** (lv3 almeno 1). **[deciso]**
- **Combo**: una sola carta per coppia, anche torretta + personaggio. Compaiono solo con entrambe in campo. Nessuna definita. **(aperto, § 11)**
- **Probabilità** delle carte (pesi): standard 1, chain 0,4, combo 0,4, level up 2, nuova torretta 3 (1,5 con già 2 torrette). **[deciso]** (numeri **[Claude]**)
- Le carte “+1 proiettile/sfera/drone/rimbalzo” tolgono il 15% (o il 20%) di danno per pila. **[deciso]**

## 4. Campagna e progressione

- 50 livelli selezionabili (fino a “completati + 1”). Il livello di difficoltà D è il numero del livello; in **Epica D = livello + 30**. **[deciso]**
- **Tetto di livello** di torri e personaggio, in base ai livelli completati: lv1 fino al 10, **lv2 dopo il 10**, **lv3 dopo il 20**. **[deciso]**
- Sblocchi a fine livello: 10 → lv2, 20 → lv3, **30 → equipaggiamento** (testa, armatura, guanti, stivali, arma, nucleo),
  **40 → abilità della barriera** (fino a 3), **50 → Epica**. Equipaggiamento e abilità della barriera **non sono ancora costruiti**. **[deciso]**
- **Mini-boss** (nave aliena) alle ondate 5, 10, 15: dal livello 11 in Standard, sempre in Epica. Sconfitto, dà **3 carte a caso applicate subito**
  (schermata di riepilogo). Tipo di danno variabile per ondata e livello. **[deciso]**
- **Boss finale** (nave madre) all’ondata 20 dei livelli multipli di 10, con barra della vita grande in alto; il livello finisce quando muore. **[deciso]**
- Boss e mini-boss: **sempre immuni** a paralisi, attrazione e teletrasporto; **resistenza variabile** a knockback e stati
  (riduce l’intensità, non la durata). **[deciso]** (valori **[da rivedere]**, § 10)
- Fino a difficoltà 10 solo nemici “piccoli” (niente asteroidi). **[deciso]**
- Budget di scelte: 19 per partita, **28 dal livello 11** con i 3 mini-boss. Servono 19 scelte per riempire tutto al tetto lv1, 39 al tetto lv2,
  64 al tetto lv3 (4 torrette + personaggio). Massimizzarne 2 richiede almeno 26 scelte, 3 almeno 39: per questo, con 28 scelte,
  **non si possono massimizzare più di 2 tra torri e personaggio** senza bisogno di una regola esplicita. **[deciso]**
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

## 8. Personaggio e torrette *(generato)*

### Personaggio

Physical. Spara da solo (o solo mentre si preme, in mira manuale), cadenza alta senza ricarica, portata totale, tutti i proiettili di una salva sullo stesso bersaglio.
- **Standard** (max 3 pile): +1 perforazione (I colpi trapassano un nemico in più); Danno maggiorato (Danno +25%); +1 proiettile (+1 proiettile, danno −15%).
- **Chain · Frenesia** — lv1 Frenesia: Barra carica → fuoco e danno maggiori · lv2 Carica rapida: Carica in 25 s invece di 30 · lv2 Frenesia furiosa: Cadenza in frenesia ×2 (da ×1,8) · lv3 Frenesia prolungata: La frenesia dura 12 s invece di 8
- **Chain · Colpi esplosivi** — lv1 Colpi esplosivi: 10% di esplosione ad area sul colpo · lv2 Più esplosioni: Probabilità di esplosione maggiore · lv2 Esplosioni ampie: Raggio dell’esplosione maggiore · lv3 Esplosioni potenziate: Più probabilità e più raggio
- **Level up** — lv1 Ventaglio: Proiettili secondari a ventaglio · lv1 Colpo pesante: Molto più danno, lieve knockback · lv2 Perforazione II: +2 perforazione · lv2 Rimbalzo: I proiettili rimbalzano · lv3 Cadenza maggiorata: Cadenza di fuoco base +20%
- id nel codice: pierce, dmg, proj, frenzy1, fill, fspd, fdur, boom1, boomP, boomR, boom3, fan, punch, pen2, ricochet, rate3

### Sky Guard (`sky`)

Fire · Missili a ricerca casuale, lungo raggio. Portata 520 px, ricarica 3,0 s.
- **Standard** (max 3 pile): Danno maggiorato (Danno +25%); +1 missile (+1 missile, danno −15%); Raggio d’impatto (Raggio d’impatto +30%).
- **Chain · Frammentazione** — lv1 Frammentazione: All’impatto: 3 mini-missili · lv2 Frammentazione II: I mini-missili diventano 6 · lv3 Frammentazione III: I mini-missili diventano 9
- **Level up** — lv1 Area infuocata: L’impatto brucia l’area per 5 s · lv1 Impatto devastante: Danno da impatto molto più alto · lv2 Scia incendiaria: I missili bruciano chi attraversano · lv3 Salva potenziata: +2 missili per lancio
- id nel codice: dmg, msl, rad, split1, split2, split3, fire, impact, pass, plus2

### Laser (`laser`)

Energy · Raggi fissi che trapassano tutto. Portata 900 px, ricarica 5,0 s.
- **Standard** (max 3 pile): Danno maggiorato (Danno +25%); +1 rimbalzo (Rimbalzo sui bordi, danno −20%); Durata maggiorata (Durata dei raggi +30%).
- **Chain · Raggi multipli** — lv1 Raggi multipli: +1 raggio fisso · lv2 Raggi multipli II: +2 raggi fissi in totale · lv3 Raggi multipli III: +3 raggi fissi in totale
- **Chain · Raggio spazzante** — lv1 Raggio spazzante: Un raggio attraversa lo schermo · lv2 Spazzata rallentante: Il raggio rallenta i colpiti · lv3 Doppia spazzata: Seconda spazzata in senso opposto
- **Level up** — lv1 Raggio largo: Larghezza dei raggi +100% · lv1 Raggio persistente: Durata dei raggi molto maggiore · lv2 Indebolimento: I nemici colpiti sono indeboliti · lv2 Sfruttare i debuff: Più danno a chi ha un debuff · lv3 Debuff prolungati: I debuff durano di più
- id nel codice: dmg, bounce, dur, multi1, multi2, multi3, sweep1, sweep2, sweep3, wide, longer, weaken, exploit, debuffdur

### Disruption Drone (`disr`)

Force · Due droni creano un campo di forza a tutta larghezza. Portata 380 px, ricarica 8,0 s.
- **Standard** (max 3 pile): Danno maggiorato (Danno +25%); Campo più alto (Altezza del campo +30%); Campo più duraturo (Durata del campo +30%).
- **Chain · Teletrasporto** — lv1 Teletrasporto: 5%: il colpito viene spinto indietro · lv2 Salto al bordo: 2,5%: teletrasporto al bordo superiore · lv3 Teletrasporto letale: Il teletrasporto danneggia in % la vita
- **Chain · Distruzione** — lv1 Distruzione: Stack: i nemici infliggono −10% danno · lv2 Scarica distruttiva: A stack massimo: scarica di danno · lv2 Distruzione estesa: Stack massimo da 3 a 5 · lv3 Doppia scarica: Una seconda scarica a stack massimo
- **Level up** — lv1 Ricarica rapida: Ricarica leggermente ridotta · lv2 Campo destabilizzante: Più danni dalle altre torri nel campo · lv3 Pulsazione rapida: Il campo danneggia più spesso
- id nel codice: dmg, height, dur, tp1, tp2, tp3, dst1, dstB, dst5, dst3, reload, amp, tick

### Aeroblast (`aero`)

Physical · Colpi esplosivi con knockback, corto raggio. Portata 260 px, ricarica 2,6 s.
- **Standard** (max 3 pile): Danno maggiorato (Danno +25%); +1 proiettile (+1 proiettile, danno −15%); Più rapido (Danno +10%, ricarica −10%).
- **Chain · Salva di schegge** — lv1 Salva di schegge: Dopo il colpo: 5 proiettili minori · lv2 Schegge d’urto: Le schegge causano knockback · lv2 Più schegge: Le schegge diventano 7 · lv3 Doppia salva: Le schegge partono due volte
- **Chain · Mine** — lv1 Mine: Ogni colpo rilascia una mina · lv2 Più mine: 2 mine per colpo · lv2 Mine d’urto: Le mine causano knockback · lv3 Mine potenziate: Le mine fanno più danno
- **Level up** — lv1 Spinta maggiore: Knockback molto più forte · lv2 Gittata estesa: Raggio d’azione +30% · lv3 Doppia esplosione: I colpi esplodono ancora dopo 1 s
- id nel codice: dmg, proj, fast, salvo1, salvoK, salvo7, salvo2, mine1, mine2, mineK, mineD, knock, reach, echo

### Thunderbolt (`thunder`)

Electric · Sfere sulla barriera, fulmini a tutto schermo. Portata 700 px, ricarica 1,6 s.
- **Standard** (max 3 pile): Danno maggiorato (Danno +25%); +1 sfera (+1 sfera, danno −15%); Più rapido (Danno +10%, ricarica −10%).
- **Chain · Fulmini ramificati** — lv1 Fulmini ramificati: I fulmini si ramificano 4 volte · lv2 Ramificazione II: Fino a 8 ramificazioni · lv3 Ramificazioni debilitanti: Le ramificazioni indeboliscono
- **Level up** — lv1 Fulmini larghi: Larghezza dei fulmini maggiore · lv2 Sfera sul campo: I fulmini possono creare una sfera · lv2 Paralisi: I fulmini possono paralizzare · lv3 Sfere pungenti: Danni a chi è vicino alle sfere
- id nel codice: dmg, sph, fast, fork1, fork2, forkW, wide, orb, para, aura

### Beam (`beam`)

Energy · Raggio che colpisce il bersaglio per tutta la durata. Portata 380 px, ricarica 3,4 s.
- **Standard** (max 3 pile): Danno maggiorato (Danno +25%); Durata estesa (Durata del raggio +30%); Ricarica ridotta (Ricarica −12%).
- **Chain · Raggio ramificato** — lv1 Raggio ramificato: Colpisce un bersaglio in più · lv2 Doppia ramificazione: Un altro bersaglio in più · lv3 Attrazione: I bersagli si avvicinano tra loro
- **Level up** — lv1 Vulnerabilità: Il raggio rende i nemici vulnerabili · lv2 Ritmo accelerato: Il danno del raggio è più rapido · lv3 Secondo laser: Genera un secondo laser
- id nel codice: dmg, dur, cd, fork1, fork2, pull, vuln, pace, second

### Firewheel Drone (`wheel`)

Fire · Drone lanciafiamme che rimbalza sullo schermo. Portata 380 px, ricarica 6,5 s.
- **Standard** (max 3 pile): Danno maggiorato (Danno +25%); Durata estesa (Durata +30%); Fiamme più ampie (Raggio del lanciafiamme +30%).
- **Chain · Mini-droni** — lv1 Mini-droni: Genera 2 mini-droni rimbalzanti · lv2 Mini-droni incendiari: I mini-droni bruciano i nemici · lv3 Mini-droni potenziati: I mini-droni fanno più danno
- **Level up** — lv1 Scatto: Più veloce quando non colpisce · lv2 Presidio: Resta fermo 2,5 s a fine durata · lv3 Scia infuocata: Lascia una scia che brucia
- id nel codice: dmg, dur, rad, mini1, miniB, miniD, dash, stay, trail

### Hive (`hive`)

Force · Sciame di droni a ricerca. Portata 380 px, ricarica 7,0 s.
- **Standard** (max 3 pile): Danno maggiorato (Danno +25%); +1 drone (+1 drone, danno −15%); Più colpi (I droni sparano 2 volte in più).
- **Chain · Onda iniziale** — lv1 Onda iniziale: Il primo colpo è un’onda d’urto in avanti · lv2 Onda rallentante: L’onda rallenta i nemici · lv3 Onda finale: Anche l’ultimo colpo è un’onda
- **Chain · Sciame** — lv1 Sciame: 35%: a fine vita lancia un nuovo drone · lv2 Sciame II: Il nuovo drone può essere di lv 2 · lv3 Sciame III: Il nuovo drone può essere di lv 3
- **Level up** — lv1 Evoluzione I: Dopo 3 colpi: +1 proiettile · lv2 Evoluzione II: Dopo altri 3 colpi: +2 proiettili · lv3 Resistenza: Ogni drone ha il 30% di restare ancora
- id nel codice: dmg, drone, hits, wave1, wave2, wave3, seed1, seed2, seed3, evo1, evo2, stay

### Railgun (`rail`)

Physical · Colpi perforanti a cadenza media. Portata 380 px, ricarica 1,5 s.
- **Standard** (max 3 pile): Danno maggiorato (Danno +25%); Ricarica ridotta (Ricarica −12%); +1 perforazione (Perfora un nemico in più).
- **Chain · Proiettile diviso** — lv1 Proiettile diviso: Dopo il 1° bersaglio si divide in 2 · lv2 Doppia divisione: Si divide ancora dopo il 2° · lv3 Slancio: Più danno per ogni nemico attraversato
- **Level up** — lv1 Impatto: Danno maggiorato + knockback · lv2 Vulnerabilità fisica: I colpi rendono vulnerabili al fisico · lv3 Penetrazione: Più knockback e perforazione
- id nel codice: dmg, cd, pierce, split1, split2, mass, punch, vulnP, pen

### Teslacoil (`tesla`)

Electric · Sfera elettrica che esplode al contatto. Portata 380 px, ricarica 2,2 s.
- **Standard** (max 3 pile): Danno maggiorato (Danno +25%); Ricarica ridotta (Ricarica −12%); +1 rimbalzo (+1 rimbalzo, danno −15%).
- **Chain · Sfera statica** — lv1 Sfera statica: Resta attiva 2 s dopo l’esplosione · lv2 Sfera rallentante: La sfera rallenta i nemici · lv3 Sfera persistente: La sfera dura più a lungo
- **Level up** — lv1 Esplosione a catena: Colpisce in parte 5 nemici vicini · lv2 Ricarica rapida: Ricarica −20% *(provvisorio)* · lv3 Campo di carica: Mentre carica, colpisce chi è sopra
- id nel codice: dmg, cd, bounce, orb, orbSlow, orbDur, chain, quick, charge

### Gravity Vortex Gun (`vortex`)

Force · Buco nero che attrae e danneggia. Portata 260 px, ricarica 5,5 s.
- **Standard** (max 3 pile): Danno maggiorato (Danno +25%); Percorso più lungo (Lunghezza percorsa +30%); Raggio maggiore (Raggio del buco nero +25%).
- **Chain · Wormhole** — lv1 Wormhole: Due varchi: si riemerge dal secondo · lv2 Varco ampio: L’ingresso del wormhole è più grande · lv3 Uscita rallentante: Chi esce dal 2° varco è rallentato
- **Chain · Buco nero statico** — lv1 Buco nero statico: A fine percorso resta fermo e attrae · lv2 Statico prolungato: Il buco nero statico dura 3 s invece di 2 · lv3 Statico potente: Il buco nero statico fa più danno
- **Level up** — lv1 Attrazione forte: Forza attrattiva molto maggiore · lv2 Secondo buco nero: Genera un secondo buco nero · lv3 Collasso: Danno dei buchi neri +40% *(provvisorio)*
- id nel codice: dmg, len, rad, wh1, wh2, wh3, stat1, stat2, stat3, pull, twin, amp

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
- Laser: spazzata di 1,6 s su 180°, raggi extra sfalsati di circa 10°, indebolimento 2,5 s  **[da rivedere]**
- Disruption Drone: campo 6 s, ricarica 8 s da quando finisce, danno 8 per colpo, colpo ogni 1 s (0,6 s con il lv3), altezza base ±16 px, arretramento 90 px  **[Claude]**
- Disruption Drone: teletrasporto lv3 = 20% della vita attuale; scarica = 3× danno del campo, seconda dopo 0,4 s, stack azzerati dopo la scarica  **[Claude]**
- Aeroblast: schegge al 30% del danno, seconda salva dopo 0,5 s, mine di 25 s, doppia esplosione al 60% dopo 1 s  **[Claude]**
- Thunderbolt: fulmine ogni 1,6 s, ramificazioni al 50%, sfera sul campo 30% per 4 s, paralisi 20% per 1 s  **[Claude]**
- Beam: durata 1,8 s, ramificazioni entro 220 px, attrazione verso il baricentro  **[Claude]**
- Firewheel: durata 5 s, 2 mini-droni, sosta 2,5 s, scia 2 s  **[Claude]**
- Hive: 3 droni base, 4 colpi base (+2 per pila), onda 130 px circa ±35°, evoluzione 1→2→4 proiettili. Sciame 35% = probabilità che a fine vita un drone ne lanci uno nuovo; resistenza 30% = probabilità che ogni drone resti ancora per un’altra durata intera  **[Claude]**
- Railgun: perforazione base 3, divisione a ±20°, Slancio +15% per nemico  **[Claude]**
- Teslacoil: carica 0,7 s, sfera statica 2 s (3,5 s al lv3), esplosione a catena su 5 nemici al 40%  **[Claude]**
- Gravity Vortex Gun: wormhole 4 s  **[Claude]**
- Personaggio: intervallo 0,15 s e danno 7 per colpo; ventaglio 4 proiettili al 30%, esplosioni al 70% raggio 30, rimbalzo una volta, colpo pesante ×1,6 con knockback 1,5 px per colpo (4,5 in frenesia)  **[da rivedere]**
- Stati: vulnerabilità +25% danno subito, indebolimento −35% danno inflitto, rallentamento −50%, paralisi = stop, bruciatura nel tempo  **[Claude]**
- Boss: resistenze scelte da Claude, variabili per boss (mini-boss spinte 40-80% e stati 25-55%; finale 85% e 60%); boss finale vita 800 al livello 10, 2800 al 20, 2900 al 30 (oltre il 30 provvisoria), danno alla cupola 8; mini-boss vita 480, danno 9  **[da rivedere]**

Interpretazioni di Claude **confermate**: Disruption Drone lv3 “aumento intervallo del danneggiamento” = danneggia più spesso (ogni 0,6 s);
Gravity Vortex Gun, “75% dello schermo” = 75% dell’altezza (percorso 253 px → 480 px con 3 pile); Hive, un “colpo” è una raffica
(i proiettili per colpo non contano nel limite di 10 colpi); “knockdown” del personaggio = knockback.

## 11. Decisioni aperte

- **Combo**: una sola carta per coppia (anche torretta + personaggio). Carta da scegliere, che costa una scelta, oppure potenziamento extra gratuito?
  Consiglio di Claude: carta; i “power up extra” arrivano già dalle carte dei mini-boss, che potrebbero includere anche le combo.
  Esempi di Marco: Beam + Gravity Vortex Gun (i laser finiscono con un buco nero attrattivo con danno ad area);
  Personaggio + Hive (clone speculare del personaggio al 50% del danno).
- **Sblocco delle combo**: condizioni (nemici sconfitti, livelli raggiunti con entrambe in campo) oppure chip? Consiglio: condizioni per le combo,
  chip per il resto. Nota: con 4 slot su 11 torrette una coppia precisa capita insieme circa l’11% delle volte se non la si sceglie apposta.
- **Chip a fine livello** (come nel gioco originale): potenziamenti permanenti di torrette e personaggio, sblocco di carte chain/combo/level up,
  rimozione delle penalità delle carte “+1 proiettile/rimbalzo”. Da progettare. Se spendibili fin dall’inizio, la curva dal livello 20 va ricalibrata.
- **Ranger**: sblocco e funzionamento non ancora discussi (aiutanti ai lati del personaggio; nel gioco originale escono dalle uova).
- **Boss finale**: abilità speciali o solo tanta vita? (ora solo tanta vita)
- **Mini-boss dal livello 11** (non dal 21): a tetto lv2 il budget è 28 su 39 necessari, quindi nessun surplus; da confermare.
- **Difficoltà dal livello 31**: riprende a salire piena, ma equipaggiamento, barriera e chip non esistono ancora: da ricalibrare quando arrivano.
- **Resistenze dei nemici normali**: la tabella attuale è un segnaposto di Claude.

## 12. Contenuti mancanti (da definire con Marco)

Obiettivo § 3: 2 chain complete (1 lv1, 2 lv2, 1 lv3) e 2 level up a lv1 e lv2 per ogni torre.

- **Sky Guard**: Frammentazione, seconda voce lv2 · seconda chain intera · level up: 1 voce lv2
- **Laser**: Raggi multipli, seconda voce lv2 · Raggio spazzante, seconda voce lv2
- **Disruption Drone**: Teletrasporto, seconda voce lv2 · level up: 1 lv1, 1 lv2
- **Aeroblast**: level up: 1 lv1, 1 lv2
- **Thunderbolt**: Fulmini ramificati, seconda voce lv2 · seconda chain intera · level up: 1 lv1
- **Beam**: Raggio ramificato, seconda voce lv2 · seconda chain intera · level up: 1 lv1, 1 lv2
- **Firewheel Drone**: Mini-droni, seconda voce lv2 · seconda chain intera · level up: 1 lv1, 1 lv2
- **Hive**: Onda, seconda voce lv2 · Sciame, seconda voce lv2 · level up: 1 lv1, 1 lv2
- **Railgun**: Proiettile diviso, seconda voce lv2 · seconda chain intera · level up: 1 lv1, 1 lv2
- **Teslacoil**: Sfera statica, seconda voce lv2 · seconda chain intera · level up: 1 lv1, 2 lv2 reali (sostituiscono “Ricarica rapida”, provvisoria)
- **Gravity Vortex Gun**: Wormhole, seconda voce lv2 · Buco nero statico, seconda voce lv2 · level up: 1 lv1, 1 lv2, lv3 reale (sostituisce “Collasso”, provvisorio)
- **Combo**: nessuna definita (due esempi in § 11)

## 13. Da costruire

Ranger · equipaggiamento · più personaggi con scelta prima del combattimento · abilità della barriera e mine
(rigenerazione e repulsione esistono, oggi impostate a mano in `META`) · schermata degli sblocchi permanenti · chip ·
ricompense e valute fuori dalla battaglia · livelli con un’identità propria (oggi i 50 livelli seguono la stessa regola di ondate) ·
difesa planetaria con aree da sbloccare · livelli a rotazione settimanale · boss a tempo · eventi a roulette/estrazione · uova ·
salvataggio della partita in corso · audio e altre impostazioni · bilanciamento tarato da un giocatore vero.

## 14. Strumenti di lavoro

- **Checklist di revisione** (artefatto su claude.ai, gestita dal progetto): https://claude.ai/artifact/MdJMokJ4LquiwS7M4BViSX
- **Modifiche dal lato codice**: `docs/CHANGELOG.md`, con le voci della checklist da aggiornare.
