FORTRESS DEFENSE · app installabile (PWA)
=========================================

CONTENUTO
  app/index.html          il gioco
  app/draw.js             il disegno (grafica del canvas), usato da index.html
  app/draw-hd2d.js        la grafica HD-2D: solo le differenze, innestate su draw.js se scelta nel menu
  app/manifest.json       nome, colori e icone dell'app
  app/sw.js               service worker: fa partire il gioco anche offline
  app/icon-*.png          icone (192, 512, 512 "maskable" per Android, 180 per iPhone)

PUBBLICARE
  Carica tutti i file della cartella app/, così come sono, nella stessa cartella di un sito in HTTPS
  (anche una sottocartella va bene, per esempio https://tuosito.it/fortress/).
  Il service worker funziona solo in HTTPS, oppure su localhost dal computer:
  un sito di test in http non basta per installare il gioco sul telefono.

INSTALLARE SUL TELEFONO
  Android (Chrome): apri l'indirizzo, menu ⋮ → "Installa app" (o "Aggiungi a schermata Home").
  iPhone (Safari):  apri l'indirizzo, pulsante Condividi → "Aggiungi alla schermata Home".
  Dopo il primo avvio con connessione, il gioco funziona anche offline.

AGGIORNARE
  Prima di caricare, alza APP_VERSION in index.html e VERSION in sw.js (stesso numero):
  se sw.js non cambia, il browser non vede l'aggiornamento.
  Sostituisci i file sul sito. Alla prossima apertura con connessione la schermata iniziale
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
  Il salvataggio contiene livelli completati, nemici scoperti e impostazioni
  (bersaglio). Non contiene la partita in corso.

  I progressi stanno nel browser del dispositivo: disinstallare l'app o cancellare
  i dati del sito li elimina. Esporta prima di farlo.
  Su iPhone, di solito Safari e l'app installata hanno memorie separate:
  per portare i progressi dall'uno all'altra usa esporta e importa.
