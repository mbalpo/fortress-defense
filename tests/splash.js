// Schermata iniziale: controllo aggiornamenti (service worker simulato) e tocco su “Start”.
const { JSDOM } = require("jsdom"), fs = require("fs"), path = require("path");
const SRC = require("./src").gameHtml().replaceAll("location.reload();", "window.__reload();");   // anche quello del cambio di grafica (1.13.0)
const ok = (c) => c ? "✓" : "✗ ERRORE";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// sc: scenario. sw = false → browser senza service worker. update(reg, mk): cosa succede quando la pagina chiede un aggiornamento.
function page(sc) {
  let rafCb = null, t = 0; const texts = [], errors = [], log = { reloads: 0, updates: 0 };
  const dom = new JSDOM(SRC, { runScripts: "dangerously", pretendToBeVisual: true, url: "https://example.com/gioco/",
    beforeParse(w) {
      w.requestAnimationFrame = (cb) => { rafCb = cb; return 1; };
      const ctxP = new Proxy({}, { get(_, p) { if (p === "fillText") return (s) => texts.push(String(s)); return () => ctxP; }, set() { return true; } });
      w.HTMLCanvasElement.prototype.getContext = () => ctxP;
      w.HTMLCanvasElement.prototype.getBoundingClientRect = () => ({ left: 0, top: 0, width: 360, height: 640 });
      w.addEventListener("error", (e) => errors.push(e.message));
      w.__reload = () => { log.reloads++; };
      if (sc.reloaded) w.sessionStorage.setItem("fortress-update-reload", "1");
      if (sc.wake) {                                 // finto Screen Wake Lock: conta richieste e rilasci
        log.wake = { req: 0, rel: 0, active: 0 };
        const wl = { request: (type) => {
          log.wake.req++;
          if (sc.wake === "deny") return Promise.reject(Object.assign(new Error("negato"), { name: "NotAllowedError" }));
          const l = new w.EventTarget(); l.type = type; l.released = false; log.wake.active++;
          l.release = () => { if (!l.released) { l.released = true; log.wake.rel++; log.wake.active--; l.dispatchEvent(new w.Event("release")); } return Promise.resolve(); };
          return Promise.resolve(l); } };
        Object.defineProperty(w.navigator, "wakeLock", { value: wl, configurable: true });
      }
      let hidden = false;
      Object.defineProperty(w.document, "hidden", { get: () => hidden, configurable: true });
      w.__setHidden = (v) => { hidden = v; w.document.dispatchEvent(new w.Event("visibilitychange")); };
      Object.defineProperty(w.navigator, "onLine", { get: () => sc.online !== false, configurable: true });
      if (sc.sw === false) return;
      const mk = (state) => { const x = new w.EventTarget(); x.state = state; x.posted = [];
        x.postMessage = (m) => { x.posted.push(m); if (m && m.type === "skipWaiting") setTimeout(() => activate(x), 20); };
        x.go = (s) => { x.state = s; x.dispatchEvent(new w.Event("statechange")); }; return x; };
      const sw = new w.EventTarget(); sw.controller = sc.controller === false ? null : {};
      const reg = new w.EventTarget(); reg.installing = null; reg.waiting = sc.waiting ? mk("installed") : null; reg.active = {};
      const activate = (x) => { reg.installing = reg.waiting = null; x.go("activating"); x.go("activated"); sw.controller = x; sw.dispatchEvent(new w.Event("controllerchange")); };
      reg.update = () => { log.updates++; return sc.update ? sc.update(reg, mk, activate) : Promise.resolve(reg); };
      sw.register = () => Promise.resolve(reg);
      Object.defineProperty(w.navigator, "serviceWorker", { value: sw, configurable: true });
      log.reg = reg;
    } });
  const w = dom.window, d = w.document;
  const frame = () => { t += 16.7; const cb = rafCb; rafCb = null; if (cb) cb(t); };
  const sp = d.getElementById("splash");
  return { w, d, log, texts, errors, frame,
    msg: () => d.getElementById("splashMsg").textContent, open: () => !sp.hidden,
    key: (k) => w.dispatchEvent(new w.KeyboardEvent("keydown", { key: k })),
    tapSplash: () => sp.click(), setHidden: (v) => w.__setHidden(v),
    tapCanvas: (x, y) => { const e = new w.Event("pointerdown", { bubbles: true, cancelable: true }); e.clientX = x; e.clientY = y; d.getElementById("c").dispatchEvent(e); },
    inMenu: () => { texts.length = 0; frame(); return texts.includes("PLANET DEFENSE"); },
  };
}

(async () => {
  { // schermo sempre acceso (Screen Wake Lock)
    const g = page({ sw: false, wake: true }); g.frame(); await wait(10);
    const before = g.log.wake.req;
    g.tapSplash(); await wait(10);
    console.log("Wake Lock: prima di “Start” richieste", before, "| dopo il tocco:", g.log.wake.req, "attivo:", g.log.wake.active, ok(before === 0 && g.log.wake.req === 1 && g.log.wake.active === 1));
    g.setHidden(true); await wait(10);
    console.log("Wake Lock: in secondo piano → rilasciato:", g.log.wake.rel === 1 && g.log.wake.active === 0, ok(g.log.wake.rel === 1 && g.log.wake.active === 0));
    g.setHidden(false); await wait(10); g.frame();
    console.log("Wake Lock: di nuovo in primo piano → richiesto di nuovo:", g.log.wake.req === 2 && g.log.wake.active === 1, "| nel menu:", g.inMenu(), ok(g.log.wake.req === 2 && g.log.wake.active === 1));
    g.setHidden(false); await wait(10);
    console.log("Wake Lock: già attivo, nessuna richiesta doppia:", g.log.wake.req === 2, ok(g.log.wake.req === 2));
    const h = page({ sw: false }); h.tapSplash(); h.setHidden(true); h.setHidden(false); await wait(10); h.frame();
    const k = page({ sw: false, wake: "deny" }); k.tapSplash(); await wait(10); k.setHidden(true); k.setHidden(false); await wait(10); k.frame();
    const errs = [...g.errors, ...h.errors, ...k.errors];
    console.log("Wake Lock assente o rifiutato → gioco aperto:", !h.open() && !k.open() && h.inMenu() && k.inMenu(), "| errori JS:", errs.length ? errs[0] : "nessuno", ok(!h.open() && !k.open() && !errs.length));
  }
  { // browser senza service worker (o pagina aperta da file): “Start” subito; i tasti non avviano il gioco finché non si entra
    const g = page({ sw: false });
    console.log("senza service worker → scritta:", g.msg(), ok(g.msg() === "Start"));
    g.key("Enter"); g.frame();
    console.log("Invio sul primo tocco → schermata chiusa:", !g.open(), "| ancora nel menu:", g.inMenu(), ok(!g.open() && g.inMenu()));
    const h = page({ sw: false }); h.key("ArrowLeft"); h.key("e"); h.frame();
    console.log("altri tasti con la schermata aperta → ignorati:", h.inMenu() && h.open(), ok(h.inMenu() && h.open()));
    h.tapSplash(); console.log("tocco sulla schermata → chiusa:", !h.open(), ok(!h.open()));
    console.log("errori JS:", [...g.errors, ...h.errors].length ? [...g.errors, ...h.errors][0] : "nessuno");
  }
  { // online, niente di nuovo
    const g = page({}); const before = g.msg(); await wait(30);
    console.log("nessun aggiornamento → prima:", JSON.stringify(before), "| dopo il controllo:", g.msg(), "| controlli:", g.log.updates, "| ricarichi:", g.log.reloads, ok(before === "" && g.msg() === "Start" && g.log.updates === 1 && g.log.reloads === 0));
  }
  { // offline
    const g = page({ online: false }); await wait(30);
    console.log("offline → scritta:", g.msg(), "| controlli:", g.log.updates, ok(g.msg() === "Start" && g.log.updates === 0));
  }
  { // prima installazione: nessun controller, niente da aggiornare
    const g = page({ controller: false }); await wait(30);
    console.log("prima installazione → scritta:", g.msg(), "| controlli:", g.log.updates, ok(g.msg() === "Start" && g.log.updates === 0));
  }
  { // dopo il ricarico la schermata riparte e non cerca di nuovo
    const g = page({ reloaded: true }); await wait(30);
    console.log("ricarico già fatto → scritta:", g.msg(), "| controlli:", g.log.updates, "| segno cancellato:", g.w.sessionStorage.getItem("fortress-update-reload") === null,
      ok(g.msg() === "Start" && g.log.updates === 0 && g.w.sessionStorage.getItem("fortress-update-reload") === null));
  }
  { // aggiornamento pubblicato: “Aggiornamento in corso…”, attivazione, ricarico
    let worker = null;
    const g = page({ update: (reg, mk, activate) => { worker = mk("installing"); reg.installing = worker; reg.dispatchEvent(new g.w.Event("updatefound"));
      setTimeout(() => { worker.go("installed"); activate(worker); }, 80); return Promise.resolve(reg); } });
    await wait(30); const during = g.msg(); g.key("Enter"); g.frame(); const menuDuring = g.inMenu() && g.open();
    await wait(150);
    console.log("aggiornamento pubblicato → durante:", during, "| ricarichi:", g.log.reloads, "| segno per dopo il ricarico:", g.w.sessionStorage.getItem("fortress-update-reload"), "| Start mostrato:", g.msg() === "Start",
      ok(during === "Aggiornamento in corso…" && g.log.reloads === 1 && g.w.sessionStorage.getItem("fortress-update-reload") === "1" && g.msg() !== "Start"));
    g.tapSplash(); console.log("Invio e tocco durante l’aggiornamento → schermata ancora aperta, gioco fermo nel menu:", menuDuring && g.open(), ok(menuDuring && g.open()));
  }
  { // aggiornamento già scaricato e in attesa: la pagina lo attiva
    const g = page({ waiting: true }); await wait(30);
    const posted = g.log.reg.waiting ? g.log.reg.waiting.posted : null; await wait(60);
    console.log("versione in attesa → scritta:", g.msg(), "| controlli:", g.log.updates, "| ricarichi:", g.log.reloads, ok(g.msg() === "Aggiornamento in corso…" && g.log.updates === 0 && g.log.reloads === 1));
  }
  { // il controllo non risponde: dopo 3 s “Start”; se poi l’aggiornamento arriva, nessun ricarico
    let reg0 = null;
    const g = page({ update: (reg) => { reg0 = reg; return new Promise(() => {}); } });
    await wait(2800); const at28 = g.msg(); await wait(400);
    console.log("controllo senza risposta → a 2,8 s:", JSON.stringify(at28), "| a 3,2 s:", g.msg(), ok(at28 === "" && g.msg() === "Start"));
    g.tapSplash(); g.frame();
    const x = new g.w.EventTarget(); x.state = "installing"; x.postMessage = () => {}; reg0.installing = x; reg0.dispatchEvent(new g.w.Event("updatefound"));
    x.state = "activated"; x.dispatchEvent(new g.w.Event("statechange")); g.w.navigator.serviceWorker.dispatchEvent(new g.w.Event("controllerchange"));
    console.log("aggiornamento arrivato a gioco iniziato → ricarichi:", g.log.reloads, "| scritta:", g.msg(), ok(g.log.reloads === 0 && g.msg() === "Start"));
  }
  { // installazione della versione nuova fallita
    const g = page({ update: (reg, mk) => { const x = mk("installing"); reg.installing = x; reg.dispatchEvent(new g.w.Event("updatefound")); setTimeout(() => x.go("redundant"), 40); return Promise.resolve(reg); } });
    await wait(100);
    console.log("installazione fallita → scritta:", g.msg(), "| ricarichi:", g.log.reloads, ok(g.msg() === "Start" && g.log.reloads === 0));
  }
})();
