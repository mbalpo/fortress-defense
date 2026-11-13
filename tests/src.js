// Sorgente del gioco per i test: app/index.html con app/draw.js incorporato al posto di <script src="draw.js">
// (jsdom non carica i file esterni). Le sostituzioni di stringhe dei test valgono quindi anche per il codice di disegno.
const fs = require("fs"), path = require("path");
const APP = path.join(__dirname, "..", "app");
const TAG = '<script src="draw.js"></script>';
function gameHtml(file) {
  const html = fs.readFileSync(file || path.join(APP, "index.html"), "utf8");
  if (!html.includes(TAG)) throw new Error("index.html: manca " + TAG);
  const draw = fs.readFileSync(path.join(APP, "draw.js"), "utf8");
  return html.replace(TAG, () => "<script>\n" + draw + "</script>");
}
module.exports = { gameHtml, APP };
