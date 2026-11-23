// Sorgente del gioco per i test: app/index.html con app/audio.js, app/draw.js e app/draw-hd2d.js incorporati al posto dei loro <script src>
// (jsdom non carica i file esterni). Le sostituzioni di stringhe dei test valgono quindi anche per il codice di disegno.
// gfx: "hd2d" impone la grafica HD-2D (window.FORTRESS_GFX), altrimenti vale quella delle impostazioni (di base la classica).
const fs = require("fs"), path = require("path");
const APP = path.join(__dirname, "..", "app");
const TAG = '<script src="draw.js"></script>', TAG_HD = '<script src="draw-hd2d.js"></script>', TAG_AU = '<script src="audio.js"></script>';
function gameHtml(file, gfx) {
  const html = fs.readFileSync(file || path.join(APP, "index.html"), "utf8");
  if (!html.includes(TAG) || !html.includes(TAG_HD) || !html.includes(TAG_AU)) throw new Error("index.html: manca " + TAG + ", " + TAG_HD + " o " + TAG_AU);
  const draw = fs.readFileSync(path.join(APP, "draw.js"), "utf8"), hd = fs.readFileSync(path.join(APP, "draw-hd2d.js"), "utf8"), au = fs.readFileSync(path.join(APP, "audio.js"), "utf8");
  return html.replace(TAG_HD, () => (gfx ? "<script>window.FORTRESS_GFX = " + JSON.stringify(gfx) + ";</script>\n" : "") + "<script>\n" + hd + "</script>")
    .replace(TAG, () => "<script>\n" + draw + "</script>").replace(TAG_AU, () => "<script>\n" + au + "</script>");
}
module.exports = { gameHtml, APP };
