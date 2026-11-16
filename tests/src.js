// Sorgente del gioco per i test: app/index.html con app/draw.js e app/draw-hd2d.js incorporati al posto dei loro <script src>
// (jsdom non carica i file esterni). Le sostituzioni di stringhe dei test valgono quindi anche per il codice di disegno.
// gfx: "hd2d" impone la grafica HD-2D (window.FORTRESS_GFX), altrimenti vale quella delle impostazioni (di base la classica).
const fs = require("fs"), path = require("path");
const APP = path.join(__dirname, "..", "app");
const TAG = '<script src="draw.js"></script>', TAG_HD = '<script src="draw-hd2d.js"></script>';
function gameHtml(file, gfx) {
  const html = fs.readFileSync(file || path.join(APP, "index.html"), "utf8");
  if (!html.includes(TAG) || !html.includes(TAG_HD)) throw new Error("index.html: manca " + TAG + " o " + TAG_HD);
  const draw = fs.readFileSync(path.join(APP, "draw.js"), "utf8"), hd = fs.readFileSync(path.join(APP, "draw-hd2d.js"), "utf8");
  return html.replace(TAG_HD, () => (gfx ? "<script>window.FORTRESS_GFX = " + JSON.stringify(gfx) + ";</script>\n" : "") + "<script>\n" + hd + "</script>")
    .replace(TAG, () => "<script>\n" + draw + "</script>");
}
module.exports = { gameHtml, APP };
