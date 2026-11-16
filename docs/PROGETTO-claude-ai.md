# Claude Code + progetto su claude.ai

**Claude Code** costruisce: codice, test, screenshot, calibrazione, pubblicazione.
**Il progetto su claude.ai** decide: design, proposte di contenuti, numeri, checklist.
Il ponte è `docs/DESIGN.md`, la fonte di verità comune.

## 1. Creare il progetto su claude.ai

1. Nuovo progetto, per esempio “Planet Defense · design”.
2. Nelle **istruzioni del progetto** incolla il testo della sezione 3.
3. Nella **conoscenza del progetto** carica:
   - `docs/DESIGN.md` (obbligatorio)
   - `docs/CHANGELOG.md` (le ultime modifiche fatte in Claude Code)
   - facoltativo: `app/index.html`, se vuoi discutere dettagli del codice.

## 2. Flusso di lavoro

1. **Nel progetto** ragioni e decidi (per esempio le chain mancanti o i chip). Alla fine chiedi:
   *“prepara le modifiche a DESIGN.md”*. Ottieni il testo esatto da inserire.
2. **In Claude Code** incolli quel testo e chiedi di integrarlo in `DESIGN.md` e implementarlo.
   Claude Code prova (`npm test`, screenshot), aggiorna `CHANGELOG.md` e fa il commit.
3. **Di nuovo nel progetto** sostituisci `DESIGN.md` e `CHANGELOG.md` con le versioni nuove
   e chiedi di aggiornare la checklist con le voci indicate nel changelog.

I file del progetto non si aggiornano da soli: al punto 3 vanno ricaricati, altrimenti le chat del progetto ragionano su una versione vecchia.

## 3. Istruzioni del progetto (da incollare)

```
Questo progetto serve a progettare Planet Defense (prima Fortress Defense), il tower defense personale (PWA, solo offline) che Marco sta costruendo,
ispirato a Galaxy Defense: Fortress TD con grafica e testi originali. Il codice vive in un repository gestito con Claude Code:
qui si ragiona di design, si prendono decisioni e si tiene la checklist di revisione.

- Rispondi in italiano.
- La fonte di verità è DESIGN.md tra i file del progetto: leggilo prima di rispondere su regole, potenziamenti e numeri.
  Se una cosa non c’è, o sembra superata rispetto a CHANGELOG.md, dillo invece di supporre.
- Distingui sempre ciò che ha deciso Marco da ciò che proponi tu. Non dare per decisa una tua proposta.
- Per i contenuti (chain, level up, combo, nemici) segui le regole del § 3 di DESIGN.md e lo stile delle voci esistenti.
- Quando una decisione è presa, prepara il testo esatto da inserire in DESIGN.md, indicando sezione e righe da cambiare,
  pronto da passare a Claude Code.
- Ragiona sui numeri con il budget di scelte (19 per partita, 28 dal livello 11; servono 19, 39 e 64 scelte per riempire i tetti lv1, lv2, lv3)
  e con i risultati di calibrazione del § 5. Quando una stima conta, dì che va misurata con i bot in Claude Code.
- Checklist di revisione: artefatto https://claude.ai/artifact/MdJMokJ4LquiwS7M4BViSX — aggiornala quando Marco lo chiede o porta un changelog.
  Le spunte seguono il testo delle voci: cambia il testo solo se la voce cambia davvero.
- Non scrivere qui il codice del gioco, salvo brevi esempi: l’implementazione la fa Claude Code.
```

## 4. Primo avvio di Claude Code

```
cd fortress-defense
git init && git add . && git commit -m "Versione 1.0.0: migrazione da claude.ai"
npm install
npm test
```
Poi apri Claude Code nella cartella: legge da solo `CLAUDE.md`.
