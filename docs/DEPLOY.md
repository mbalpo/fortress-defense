PLANET DEFENSE · app installabile (PWA)
=========================================

CONTENUTO
  app/index.html          il gioco
  app/draw.js             il disegno (grafica del canvas), usato da index.html
  app/draw-hd2d.js        la grafica HD-2D: solo le differenze, innestate su draw.js se scelta nel menu
  app/manifest.json       nome, colori e icone dell'app
  app/sw.js               service worker: fa partire il gioco anche offline
  app/icon-*.png          icone (192, 512, 512 "maskable" per Android, 180 per iPhone)

INDIRIZZO
  https://mbalpo.github.io/fortress-defense/
  GitHub Pages, repository pubblico mbalpo/fortress-defense (Settings → Pages: Source = "GitHub Actions").
  Si pubblica tutto il contenuto di app/ (i file elencati sopra), nient'altro: docs/, tests/ e il
  resto del repository non finiscono sul sito. Il sito sta nel sottopercorso /fortress-defense/:
  in app/ tutti i percorsi devono restare relativi (niente che inizi con "/").

  Il vecchio sito Netlify (netlify.toml, che pubblica app/) resta attivo finché il nuovo indirizzo
  non è stato provato tutto sul telefono: salvataggio portato, PWA reinstallata, aggiornamento visto.

PUBBLICARE (GitHub Actions, .github/workflows/pages.yml)
  1. Alza VERSION in app/sw.js e APP_VERSION in app/index.html, con lo stesso valore.
  2. npm test: tutti verdi (swtest.js controlla che i due numeri coincidano).
  3. Commit e push su main.
  4. Il workflow "Pubblica su GitHub Pages" carica app/ e pubblica da solo, in un paio di minuti
     (avanzamento nella scheda Actions del repository).
  Parte solo se il push tocca app/ o il workflow stesso: un push che cambia soltanto docs/ o tests/
  non pubblica nulla. Per ripubblicare senza modifiche: Actions → "Pubblica su GitHub Pages" →
  "Run workflow".
  GitHub Pages tiene i file in cache per 10 minuti e non si può cambiare: l'aggiornamento può
  arrivare sul telefono qualche minuto dopo la pubblicazione.

  Altrove: va bene qualsiasi sito in HTTPS, anche in una sottocartella, caricando i file di app/
  così come sono. Il service worker funziona solo in HTTPS, oppure su localhost dal computer:
  un sito di test in http non basta per installare il gioco sul telefono.

INSTALLARE SUL TELEFONO
  Android (Chrome): apri l'indirizzo, menu ⋮ → "Installa app" (o "Aggiungi a schermata Home").
  iPhone (Safari):  apri l'indirizzo, pulsante Condividi → "Aggiungi alla schermata Home".
  Dopo il primo avvio con connessione, il gioco funziona anche offline.

AGGIORNARE
  Prima di caricare, alza APP_VERSION in index.html e VERSION in sw.js (stesso numero):
  se sw.js non cambia, il browser non vede l'aggiornamento.
  Pubblica (vedi sopra). Alla prossima apertura con connessione la schermata iniziale
  mostra "Aggiornamento in corso…", scarica la versione nuova e ricarica; poi compare "Start"
  (la versione è scritta in basso nel menu). Offline, o se il controllo supera 3 secondi,
  compare subito "Start" con la versione già installata.
  Se aggiungi o togli file, aggiorna anche l'elenco ASSETS in sw.js.

SALVATAGGIO
  Menu → "Salvataggio · esporta o importa".
  Esporta come file (sul telefono si apre la condivisione: File, Drive, mail…)
  oppure come codice di testo da copiare in una nota o in un messaggio.
  Importa da file o incollando il codice: prima di sostituire i progressi
  chiede conferma e mostra cosa contiene il salvataggio.
  Il salvataggio contiene livelli completati, nemici scoperti, Sigilli e Sigilli
  maggiori, albero dei potenziamenti, abilità della barriera, equipaggiamento (con i
  lucchetti) e impostazioni (bersaglio). Non contiene la partita in sospeso (Continua):
  quella resta solo sul dispositivo, e importando un salvataggio viene cancellata.

  I progressi stanno nel browser del dispositivo: disinstallare l'app o cancellare
  i dati del sito li elimina. Esporta prima di farlo.
  Su iPhone, di solito Safari e l'app installata hanno memorie separate:
  per portare i progressi dall'uno all'altra usa esporta e importa.
