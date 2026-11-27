// Dati dei campioni per il catalogo sonoro (1.31.0, prova dei campioni, DESIGN.md § 18): docs/catalogo-sonoro-campioni.js contiene i file di app/suoni/
// in base64, perché il catalogo si apre dalla cartella (file://) e lì il browser non lascia leggere i file con fetch. Generato: npm run catalog-sonoro.
// tests/sonoro.js controlla che sia al passo con app/suoni/ (stessi file, stessi byte).
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "..", "app", "suoni"), OUT = path.join(__dirname, "..", "..", "docs", "catalogo-sonoro-campioni.js");
function build() {
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".ogg")).sort();
  const lines = files.map((f) => "  " + JSON.stringify(f.replace(/\.ogg$/, "")) + ": " + JSON.stringify(fs.readFileSync(path.join(DIR, f)).toString("base64")));
  return "// Generato da tests/tools/sonoro-campioni.js (npm run catalog-sonoro): i campioni di app/suoni/ in base64 per il catalogo sonoro. Non modificare a mano.\n" +
    "window.FORTRESS_SAMPLES_DATA = {\n" + lines.join(",\n") + "\n};\n";
}
module.exports = { build, OUT };
if (require.main === module) { const s = build(); fs.writeFileSync(OUT, s); console.log("scritto", path.relative(process.cwd(), OUT), Math.round(s.length / 1024), "KB"); }
