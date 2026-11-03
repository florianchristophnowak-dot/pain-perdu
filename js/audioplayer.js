/* Gemeinsamer Audioplayer für die Hörtexte aller Teile (Teil 1, « Le guide fantôme », « Le voyageur de 1900 »).
   Bedienung: Abspielen/Pause, 5 Sekunden zurück und vor, Fortschrittsbalken zum Ziehen, Tempo in Stufen 100/95/90/85/80 %.
   Das gewählte Tempo gilt für alle Hörtexte auf diesem Gerät (localStorage pp_audio_rate), die Tonhöhe bleibt gleich.
   „Gehört“ (onHeard) meldet der Player erst, wenn mindestens 90 % der Aufnahme wirklich gelaufen sind:
   Wer vorspult, muss den übersprungenen Teil noch hören. Fehlt die Aufnahme, liest der Browser den Text vor
   (dann mit Pause und Tempo, aber ohne Spulen).
   Aufruf: const p = PPAudio.create({ src, text, lang, ttsRate, seek, again, labels, canStart, onStart, onBlocked, onHeard, mustHear });
           element p.el einhängen; p.start() spielt von vorn, p.stop() hält an. PPAudio.stopAll() hält alle Player an. */
(function () {
  "use strict";
  const RATES = [1, 0.95, 0.9, 0.85, 0.8];
  const SKIP = 5;          // Sekunden je Sprung
  const HEARD = 0.9;       // Anteil der Aufnahme, der gelaufen sein muss
  const KEY = "pp_audio_rate";
  const L0 = {
    ecouter: "Écouter", rejouer: "Rejouer", pause: "Pause", reprendre: "Reprendre", vitesse: "Vitesse",
    back: "Reculer de 5 secondes", fwd: "Avancer de 5 secondes", pos: "Position",
    skipped: "Tu as sauté un passage. Écoute-le aussi."
  };
  const ARROW = '<path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>';
  const FIVE = '<text x="12" y="16.4" text-anchor="middle" font-size="7.5" font-weight="700" font-family="Arial, sans-serif">5</text>';
  const ICON = {
    play: '<path d="M8 5v14l11-7z"/>',
    pause: '<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>',
    again: ARROW,
    back: ARROW + FIVE,
    fwd: '<g transform="matrix(-1 0 0 1 24 0)">' + ARROW + "</g>" + FIVE
  };
  const svg = k => '<svg class="ap-i" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + ICON[k] + "</svg>";
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmt = t => { t = Math.max(0, Math.floor(t || 0)); return Math.floor(t / 60) + ":" + String(t % 60).padStart(2, "0"); };
  const pct = r => Math.round(r * 100) + " %";
  const hasTts = "speechSynthesis" in window;
  if (hasTts) { try { speechSynthesis.getVoices(); } catch (e) { /* lädt die Stimmen schon einmal */ } }
  function voiceFor(lang) {
    if (!hasTts) return null;
    const vs = speechSynthesis.getVoices(), want = lang.toLowerCase().replace("_", "-"), base = want.slice(0, 2);
    return vs.find(v => v.lang.toLowerCase().replace("_", "-") === want) || vs.find(v => v.lang.toLowerCase().startsWith(base)) || null;
  }

  let rate = 1;
  try { const r = parseFloat(localStorage.getItem(KEY)); if (RATES.includes(r)) rate = r; } catch (e) { /* ohne Speicher: 100 % */ }
  const live = new Set();
  function setRate(r) {
    rate = r;
    try { localStorage.setItem(KEY, String(r)); } catch (e) { /* nur für diese Seite */ }
    live.forEach(p => p.rateChanged());
  }
  /* Alle Player anhalten (except läuft weiter); Player, die nicht mehr auf der Seite sind, werden freigegeben */
  function stopAll(except) {
    live.forEach(p => { if (p === except) return; p.stop(); if (!p.el.isConnected) { p.release(); live.delete(p); } });
    if (!except && hasTts) speechSynthesis.cancel();
  }

  function create(o) {
    o = o || {};
    const L = Object.assign({}, L0, o.labels || {});
    const seekOk = o.seek !== false;
    const wrap = document.createElement("div");
    wrap.className = "ap" + (seekOk ? "" : " noseek");
    wrap.innerHTML =
      '<button type="button" class="btn ap-play"></button>' +
      (seekOk ? '<button type="button" class="btn ap-skip ap-back" title="' + esc(L.back) + '" aria-label="' + esc(L.back) + '">' + svg("back") + "</button>" : "") +
      '<input type="range" class="ap-seek" min="0" max="1000" step="1" value="0" aria-label="' + esc(L.pos) + '"' + (seekOk ? "" : ' tabindex="-1"') + ">" +
      (seekOk ? '<button type="button" class="btn ap-skip ap-fwd" title="' + esc(L.fwd) + '" aria-label="' + esc(L.fwd) + '">' + svg("fwd") + "</button>" : "") +
      '<span class="ap-time"></span>' +
      '<div class="ap-rates"><span class="ap-rl">' + esc(L.vitesse) + '</span><span class="ap-seg" role="group" aria-label="' + esc(L.vitesse) + '">' +
      RATES.map(r => '<button type="button" class="ap-rate" data-r="' + r + '">' + pct(r) + "</button>").join("") + "</span></div>" +
      '<p class="ap-note" hidden>' + esc(L.skipped) + "</p>";
    const q = s => wrap.querySelector(s);
    const playBtn = q(".ap-play"), back = q(".ap-back"), fwd = q(".ap-fwd"), seek = q(".ap-seek"), time = q(".ap-time"), note = q(".ap-note");
    const rateBtns = Array.from(wrap.querySelectorAll(".ap-rate"));

    const au = new Audio();
    au.preload = "metadata";   // Tonhöhe bleibt beim Verlangsamen gleich (preservesPitch ist überall voreingestellt)
    let tts = !o.src;                 // Vorlesen statt Aufnahme
    let state = "idle";               // idle | playing | paused | ended
    let started = false, heard = false, jumped = false, dragging = false, raf = 0, utt = null;
    let prior = [], blob = null, swap = null;   // Server ohne Range-Anfragen: gehörte Stücke vor dem Wechsel, Blob-Adresse, laufender Wechsel

    const dur = () => { const d = au.duration; return isFinite(d) && d > 0 ? d : 0; };
    const ranges = r => { const out = []; for (let i = 0; i < r.length; i++) out.push([r.start(i), r.end(i)]); return out; };
    function covered() {
      const d = dur(); if (!d) return 0;
      let s = 0, end = 0;
      prior.concat(ranges(au.played)).sort((a, b) => a[0] - b[0]).forEach(([a, b]) => { if (b > end) { s += b - Math.max(a, end); end = b; } });
      return s / d;
    }
    const must = () => (typeof o.mustHear === "function" ? o.mustHear() : !!o.mustHear);
    function checkHeard(atEnd) {
      if (heard) return;
      // Ohne Sprünge zählt auch das Ende allein (falls ein Browser „played“ nicht führt)
      if (tts ? atEnd : (covered() >= HEARD || (atEnd && !jumped))) {
        heard = true; note.hidden = true;
        if (o.onHeard) o.onHeard();
      } else if (atEnd && must()) note.hidden = false;
    }

    function paint() {
      const d = dur(), t = au.currentTime || 0, p = d ? Math.min(1, t / d) : 0;
      if (!dragging) seek.value = Math.round(p * 1000);
      seek.style.setProperty("--p", (p * 100).toFixed(2) + "%");
      time.textContent = fmt(t) + " / " + (d ? fmt(d) : "–:––");
      seek.setAttribute("aria-valuetext", time.textContent);
    }
    function render() {
      const playing = state === "playing";
      wrap.classList.toggle("on", playing);
      wrap.classList.toggle("tts", tts);
      const lab = playing ? L.pause : state === "paused" ? L.reprendre : (started || o.again) ? L.rejouer : L.ecouter;
      playBtn.innerHTML = svg(playing ? "pause" : state === "ended" ? "again" : "play") + "<span>" + esc(lab) + "</span>";
      playBtn.setAttribute("aria-label", lab);
      playBtn.disabled = !playing && state !== "paused" && !!o.canStart && !o.canStart();
      const canJump = seekOk && !tts && !!dur() && state !== "idle";
      seek.disabled = !canJump;
      if (back) back.disabled = !canJump;
      if (fwd) fwd.disabled = !canJump;
      rateBtns.forEach(b => { const on = parseFloat(b.dataset.r) === rate; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on ? "true" : "false"); });
      paint();
    }
    function loop() {
      raf = 0; paint();
      if (state !== "playing" || tts) return;
      if (!wrap.isConnected) { stop(); return; }   // Fenster zu oder Hilfe ersetzt: nicht im Hintergrund weiterspielen
      raf = requestAnimationFrame(loop);
    }
    function toTts() { tts = true; try { au.removeAttribute("src"); au.load(); } catch (e) { /* egal */ } }

    function speak() {
      if (!hasTts) { state = "ended"; render(); checkHeard(true); return; }
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(o.text || "");
      utt = u;
      u.lang = o.lang || "fr-FR"; u.rate = (o.ttsRate || 1) * rate;
      const v = voiceFor(u.lang); if (v) u.voice = v;
      u.onend = () => { if (utt !== u) return; utt = null; state = "ended"; render(); checkHeard(true); };
      u.onerror = e => {
        if (utt !== u) return;
        utt = null;
        const err = e && e.error;
        if (err === "interrupted" || err === "canceled") { if (state !== "idle") state = "ended"; render(); return; }
        if (err === "not-allowed") { state = "idle"; started = false; render(); if (o.onBlocked) o.onBlocked(); return; }   // erst nach Antippen
        state = "ended"; render(); checkHeard(true);   // Vorlesen geht gar nicht: niemand bleibt hängen
      };
      state = "playing"; render();
      speechSynthesis.speak(u);
    }

    /* Von vorn (zählt als neues Hören) */
    function start() {
      if (o.canStart && !o.canStart()) return;
      stopAll(api);
      const wasStarted = started;
      started = true; note.hidden = true;
      if (o.onStart) o.onStart();
      if (tts) { speak(); return; }
      if (swap) { swap.t = 0; swap.play = true; }   // Nachladen läuft noch: danach von vorn
      try { au.currentTime = 0; } catch (e) { /* noch keine Daten */ }
      au.defaultPlaybackRate = au.playbackRate = rate;
      state = "playing"; render();
      const pr = au.play();
      if (pr && pr.catch) pr.catch(err => {
        if (state !== "playing" || tts) return;
        const name = err && err.name;
        if (name === "AbortError") return;   // gleich wieder angehalten
        if (name === "NotAllowedError") {    // Handy: Ton erst nach Antippen, der Knopf wartet
          state = wasStarted ? "ended" : "idle"; started = wasStarted; render();
          if (o.onBlocked) o.onBlocked();
          return;
        }
        toTts(); speak();
      });
      if (!raf) raf = requestAnimationFrame(loop);
    }
    function resume() {
      if (tts) { if (hasTts && speechSynthesis.paused) { speechSynthesis.resume(); state = "playing"; render(); } else start(); return; }
      if (au.ended) { start(); return; }
      stopAll(api);
      au.playbackRate = rate;
      state = "playing"; render();
      const pr = au.play();
      if (pr && pr.catch) pr.catch(err => { if (state === "playing" && err && err.name !== "AbortError") { state = "paused"; render(); } });
      if (!raf) raf = requestAnimationFrame(loop);
    }
    function pause() {
      if (state !== "playing") return;
      state = "paused";
      if (tts) { if (hasTts) speechSynthesis.pause(); } else au.pause();
      render(); checkHeard(false);
    }
    function stop() {
      if (utt) { utt = null; if (hasTts) speechSynthesis.cancel(); state = "ended"; render(); return; }
      if (state === "playing") { state = "paused"; au.pause(); render(); }
    }
    /* Springen; andThen: danach abspielen. Gibt false zurück, wenn der Sprung erst nach dem Nachladen klappt. */
    function jumpTo(t, andThen) {
      const d = dur(); if (!d || tts) return false;
      jumped = true;
      t = Math.min(Math.max(0, t), d);
      if (swap) { swap.t = t; swap.play = swap.play || !!andThen; return false; }
      const sk = ranges(au.seekable);
      if (!sk.some(([a, b]) => t >= a - 0.05 && t <= b + 0.05) && /^https?:/.test(au.currentSrc)) { reload(t, andThen); return false; }
      au.currentTime = t;
      paint();
      return true;
    }
    /* Manche Server (z. B. python3 -m http.server) liefern keine Teilstücke: Dann springt der Browser an den Anfang statt an die Stelle.
       Abhilfe: die (kleine) Datei einmal ganz holen und als Blob abspielen; das schon Gehörte zählt weiter. */
    function reload(t, andThen) {
      swap = { t, play: !!andThen || state === "playing" };
      prior = prior.concat(ranges(au.played));
      fetch(au.currentSrc).then(r => (r.ok ? r.blob() : Promise.reject(new Error(r.status)))).then(b => {
        blob = URL.createObjectURL(b);
        au.addEventListener("loadedmetadata", () => {
          const sw = swap; swap = null;
          au.defaultPlaybackRate = au.playbackRate = rate;
          au.currentTime = sw.t;
          if (sw.play && (state === "playing" || state === "ended" || state === "paused" && sw.play === "now")) resume(); else paint();
        }, { once: true });
        au.src = blob;
      }).catch(() => { swap = null; });   // dann eben ohne Springen
    }

    playBtn.addEventListener("click", () => {
      if (state === "playing") pause();
      else if (state === "paused") resume();
      else start();
    });
    function skip(s) {
      if (state === "idle") return;
      const again = state === "ended" && s < 0;   // am Ende: das letzte Stück gleich noch einmal hören
      if (jumpTo((swap ? swap.t : au.currentTime) + s, again && "now") && again) resume();
      else render();
    }
    if (back) back.addEventListener("click", () => skip(-SKIP));
    if (fwd) fwd.addEventListener("click", () => skip(SKIP));
    seek.addEventListener("input", () => {
      if (seek.disabled) return;
      dragging = true;
      jumpTo(seek.value / 1000 * dur());
      if (state === "ended") { state = "paused"; render(); }
    });
    seek.addEventListener("change", () => { dragging = false; paint(); });
    wrap.querySelector(".ap-seg").addEventListener("click", e => {
      const b = e.target.closest(".ap-rate"); if (!b) return;
      setRate(parseFloat(b.dataset.r));
    });

    au.addEventListener("loadedmetadata", render);
    au.addEventListener("durationchange", render);
    au.addEventListener("playing", () => { if (au.playbackRate !== rate) au.playbackRate = rate; });   // manche Browser setzen das Tempo beim Start zurück
    au.addEventListener("timeupdate", () => { if (!raf) paint(); checkHeard(false); });
    au.addEventListener("pause", () => {
      if (au.ended || tts || swap) return;
      if (state === "playing") { state = "paused"; render(); }   // z. B. Anruf oder Kopfhörer gezogen
      checkHeard(false);
    });
    au.addEventListener("ended", () => { if (tts) return; state = "ended"; render(); checkHeard(true); });
    au.addEventListener("error", () => {
      if (tts) return;
      toTts();
      if (state === "playing") speak(); else render();
    });

    const api = {
      el: wrap, media: au,
      start, stop,
      heard: () => heard,
      rateChanged() { if (!tts) au.defaultPlaybackRate = au.playbackRate = rate; render(); },
      release() {
        if (!tts) { tts = true; try { au.removeAttribute("src"); au.load(); } catch (e) { /* egal */ } }
        if (blob) { URL.revokeObjectURL(blob); blob = null; }
      }
    };
    wrap.ppAudio = api;   // für die Tests (tools/hoeren.js)
    live.add(api);
    if (o.src) au.src = o.src;
    render();
    return api;
  }

  window.PPAudio = { create, stopAll, RATES };
})();
