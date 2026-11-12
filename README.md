# Fortress Defense

Tower defense personale in verticale, giocabile offline e installabile sul telefono (PWA).

- `app/` — il gioco da pubblicare (aprire `app/index.html` nel browser per provarlo in locale)
- `docs/DESIGN.md` — tutte le decisioni di design
- `docs/CHANGELOG.md` — cosa è cambiato, versione per versione
- `docs/DEPLOY.md` — pubblicare, installare, aggiornare
- `docs/PROGETTO-claude-ai.md` — come usare insieme Claude Code e il progetto su claude.ai

## Comandi
```
npm install            # una volta: jsdom e canvas per i test
npm test               # tutti i test (circa 2 minuti)
npm test -- camp boss  # solo alcuni test
npm run screenshots    # immagini delle schermate principali in tests/screenshots/
npm run calibrate      # vittorie dei bot ai livelli principali (lento)
npm run design-lists   # rigenera gli elenchi di potenziamenti e nemici per DESIGN.md
```
