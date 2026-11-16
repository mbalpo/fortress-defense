const { JSDOM } = require("jsdom"); const fs = require("fs");
const SRC = require("./src").gameHtml();
const ok = (c) => c ? "✓" : "✗ ERRORE";
function game(storage) {
  let rafCb = null, t = 0; const texts = [], errors = [], cap = { blob: null, name: null, clip: null };
  const dom = new JSDOM(SRC, { runScripts: "dangerously", pretendToBeVisual: true, url: "http://localhost/",
    beforeParse(w) {
      for (const k in storage || {}) w.localStorage.setItem(k, storage[k]);
      w.requestAnimationFrame = (cb) => { rafCb = cb; return 1; };
      const ctxP = new Proxy({}, { get(_, p) { if (p === "fillText") return (s) => texts.push(String(s)); if (p === "measureText") return () => ({ width: 10 }); return () => ctxP; }, set() { return true; } });
      w.HTMLCanvasElement.prototype.getContext = () => ctxP;
      w.HTMLCanvasElement.prototype.getBoundingClientRect = () => ({ left: 0, top: 0, width: 360, height: 640 });
      w.URL.createObjectURL = (b) => { cap.blob = b; return "blob:test"; }; w.URL.revokeObjectURL = () => {};
      w.HTMLAnchorElement.prototype.click = function () { cap.name = this.download; };
      Object.defineProperty(w.navigator, "clipboard", { value: { writeText: async (s) => { cap.clip = s; } }, configurable: true });
      w.addEventListener("error", (e) => errors.push(e.message));
    } });
  const w = dom.window, d = w.document;
  d.getElementById("splash").click();             // schermata iniziale: tocco su “Start”
  const frame = () => { t += 16.7; const cb = rafCb; rafCb = null; cb(t); };
  const tap = (x, y) => { const e = new w.Event("pointerdown", { bubbles: true, cancelable: true }); e.clientX = x; e.clientY = y; d.getElementById("c").dispatchEvent(e); };
  const click = (id) => d.getElementById(id).click();
  const key = (k) => w.dispatchEvent(new w.KeyboardEvent("keydown", { key: k }));
  frame(); frame();
  return { w, d, frame, tap, click, key, texts, errors, cap, msg: () => d.getElementById("saveMsg").textContent, panelOpen: () => !d.getElementById("savePanel").hidden };
}
const tick = () => new Promise((r) => setTimeout(r, 30));
(async () => {
  const START = { "fortress-progress-v1": JSON.stringify({ cleared: 23, seen: ["saucer", "rock", "ship:fire", "mothership:energy"] }), "fortress-proto-v1": JSON.stringify({ targeting: "highest", aim: "manual" }) };
  // --- esportazione ---
  const g = game(START);
  g.tap(180, 580); g.frame();
  console.log("tocco su “Salvataggio” → pannello aperto:", g.panelOpen(), "|", g.d.getElementById("saveInfo").textContent, ok(g.panelOpen()));
  g.key("Enter"); g.key("e"); g.frame();
  console.log("Invio ed E con il pannello aperto non avviano partite:", g.panelOpen(), ok(g.panelOpen()));
  g.click("btnExport"); await tick();
  const fileText = await g.cap.blob.text(); const fileData = JSON.parse(fileText);
  console.log("esporta file →", g.cap.name, "| livelli", fileData.progress.cleared, "| nemici", fileData.progress.seen.length, "| impostazioni", JSON.stringify(fileData.settings), "(niente aim) |", g.msg(), ok(/^fortress-salvataggio-\d{4}-\d\d-\d\d\.json$/.test(g.cap.name) && fileData.progress.cleared === 23 && !("aim" in fileData.settings) && fileData.settings.targeting === "highest"));
  g.click("btnCopy"); await tick();
  console.log("copia codice →", g.cap.clip.slice(0, 16) + "… (" + g.cap.clip.length + " caratteri) |", g.msg(), ok(g.cap.clip.startsWith("FD1:")));
  g.key("Escape"); g.frame();
  console.log("Esc chiude il pannello:", !g.panelOpen(), ok(!g.panelOpen()));
  console.log("errori JS:", g.errors.length ? g.errors[0] : "nessuno");

  // --- importazione in un dispositivo vuoto ---
  const h = game({});
  h.tap(180, 580); h.frame();
  const before = h.w.localStorage.getItem("fortress-progress-v1");
  for (const [label, text, expect] of [["testo qualsiasi", "ciao", "leggibile"], ["altro gioco", JSON.stringify({ game: "altro", version: 1 }), "Non è un salvataggio di Fortress"], ["codice troncato", g.cap.clip.slice(0, 40), "non è valido"], ["versione futura", JSON.stringify({ game: "fortress-defense", version: 9, progress: { cleared: 3 } }), "non supportata"], ["vuoto", "", "niente da importare"]]) {
    h.d.getElementById("codeBox").value = text; h.click("btnPaste");
    const m = h.msg(), conf = !h.d.getElementById("confirmBox").hidden;
    console.log(("rifiuto: " + label).padEnd(28), "→", m, ok(m.includes(expect) && !conf));
  }
  console.log("progressi intatti dopo i rifiuti:", h.w.localStorage.getItem("fortress-progress-v1") === before, ok(h.w.localStorage.getItem("fortress-progress-v1") === before));
  h.d.getElementById("codeBox").value = g.cap.clip; h.click("btnPaste");
  const confText = h.d.getElementById("confirmText").textContent;
  console.log("codice valido → richiesta di conferma:", confText, ok(!h.d.getElementById("confirmBox").hidden));
  h.click("btnCancel");
  console.log("Annulla → progressi intatti:", h.w.localStorage.getItem("fortress-progress-v1") === before, ok(h.w.localStorage.getItem("fortress-progress-v1") === before));
  h.click("btnPaste"); h.click("btnConfirm");
  const p = JSON.parse(h.w.localStorage.getItem("fortress-progress-v1")), s = JSON.parse(h.w.localStorage.getItem("fortress-proto-v1"));
  console.log("Sostituisci → livelli", p.cleared, "| nemici", p.seen.join(", "), "| impostazioni", JSON.stringify(s), "|", h.msg(), ok(p.cleared === 23 && p.seen.length === 4 && !("aim" in s) && s.targeting === "highest"));
  h.key("Escape"); h.texts.length = 0; h.frame();
  const lvl = h.texts.find((x) => /^Livello \d+ ▦$/.test(x));   // dalla 1.12.3 con il segno della griglia
  console.log("menu dopo l’importazione:", lvl, "|", h.texts.find((x) => x.startsWith("Livelli completati")), ok(lvl === "Livello 24 ▦"));

  // --- importazione da file, con vecchie chiavi generiche dei boss ---
  const k = game({}); k.tap(180, 580); k.frame();
  const old = JSON.stringify({ game: "fortress-defense", version: 1, exportedAt: "2026-11-01T10:00:00Z", progress: { cleared: 7.9, seen: ["saucer", "ship", "mothership", "shard", "shard"] }, settings: { targeting: "boh", aim: "manual" } });
  const input = k.d.getElementById("fileImport"), file = new k.w.File([old], "salvataggio.json", { type: "application/json" });
  Object.defineProperty(input, "files", { value: [file], configurable: true }); input.dispatchEvent(new k.w.Event("change"));
  await new Promise((r) => setTimeout(r, 80));
  console.log("file importato → conferma:", k.d.getElementById("confirmText").textContent, ok(!k.d.getElementById("confirmBox").hidden));
  k.click("btnConfirm");
  const p2 = JSON.parse(k.w.localStorage.getItem("fortress-progress-v1")), s2 = JSON.parse(k.w.localStorage.getItem("fortress-proto-v1"));
  console.log("dati puliti: livelli", p2.cleared, "| nemici", p2.seen.join(", "), "| bersaglio", s2.targeting, ok(p2.cleared === 7 && p2.seen.join() === "saucer,shard" && s2.targeting === "closest"));
  console.log("file con aim: \"manual\" accettato e aim ignorato:", p2.cleared === 7, "| impostazioni:", JSON.stringify(s2), ok(p2.cleared === 7 && !("aim" in s2)));
  console.log("errori JS:", [...h.errors, ...k.errors].length ? [...h.errors, ...k.errors][0] : "nessuno");
})();
