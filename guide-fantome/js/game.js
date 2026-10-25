/* Le guide fantôme (Pain perdu, Teil 2) – Spiel-Engine (vanilla JS, ohne Build)
   Grundlage ist die Engine von Teil 1 (js/game.js). Neu: Lino gibt die Hilfe (nur auf Französisch), Bildlupe mit
   abziehbarem Aufkleber (loupe), Beobachtungsszene (observe), Fragenliste mit Ja-Nein-Sperre (ask), Spaltensortierung
   (cols), Ketten mit Lücken (chain), Beweise (proofs), Tempobremse, Tore (Abfragen) mit Erinnerung. */
(function () {
  "use strict";
  const G = window.GAME;
  const $ = (sel, el) => (el || document).querySelector(sel);
  const $$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));
  const QS = new URLSearchParams(location.search);
  const PROF = QS.get("mode") === "prof" && !!(window.ppProf && window.ppProf.ask("Lehrkraft-Ansicht: Code eingeben"));
  const TEST = QS.get("test") === "1" && /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);   // nur für die automatischen Testdurchläufe, nur auf dem eigenen Rechner
  const TOUCH = window.matchMedia && matchMedia("(pointer: coarse)").matches;   // Handy oder Tablet
  const SAVE_KEY = "pg_save_v1", RESULTS_KEY = "pg_results_v1";   // eigener Spielstand, getrennt von Teil 1 (pp_…)
  const IMG = "assets/img/", PH = "assets/ph/", AUD = "assets/audio/";
  /* Teil 2 startet aus dem gemeinsamen Startmenü von Teil 1 (../index.html): ?go=new&p1=…&p2=… oder ?go=resume, dazu
     home = Adresse dieses Startmenüs. „Menu“ und „Nouvelle partie“ führen dorthin zurück (?menu=2). Das eigene Startmenü
     gibt es nur noch in der Lehrkraft-Ansicht und für die automatischen Tests. */
  const HUB = !PROF && !TEST;

  /* ---------- Zustand ---------- */
  let S = null;
  function freshState() {
    return {
      v: 1, players: ["", ""], mouse: 0, scene: null, from: null, resume: G.start,
      flags: {}, inv: [], diag: [], helpUsed: {}, replays: {}, transcripts: {}, heard: {}, tries: {}, pause: {}, pauses: {}, tempo: {},
      at: {}, proofs: [], travel: 0, started: Date.now(), visited: [], cards: {}, finished: false
    };
  }
  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* privat */ } }
  function loadSave() { try { const s = localStorage.getItem(SAVE_KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
  function flag(f) { return !!S.flags[f]; }
  function setFlag(f) { S.flags[f] = true; save(); }
  /* Bedingung: Flag, "!Flag" (nicht gesetzt) oder Liste (alle) */
  function cond(c) {
    if (!c || c === "always") return true;
    if (Array.isArray(c)) return c.every(cond);
    if (c[0] === "!") return !flag(c.slice(1));
    return flag(c);
  }
  function twoPlayers() { return !!(S.players[1] && S.players[1].trim()); }
  function pname(i) { return S.players[i] && S.players[i].trim() ? S.players[i].trim() : (i === 0 ? "Joueur 1" : "Joueur 2"); }
  function secs(t0) { return Math.round((Date.now() - t0) / 1000); }

  /* ---------- Hilfen ---------- */
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
  function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function fmtTpl(t, map) { return t.replace(/\{(\w+)\}/g, (m, k) => map[k] !== undefined ? map[k] : m); }
  /* Antworten in neuer Reihenfolge: wer rät, kann sich nicht „immer die erste“ merken */
  function shuffled(a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
  /* Freitext: Wörter zerlegen (auch l’ vom iPhone und œ) und nur echte Wörter zählen, kein Tastengeklimper */
  function tokens(t) {
    t = t.replace(/(\d)\s*h\b/gi, "$1h").replace(/\bM\./g, "Monsieur").replace(/-t-/gi, " ");   // 13 h, M. Nowak, a-t-il
    return t.match(/[A-Za-zÀ-ÿŒœÆæ0-9'’]+/g) || [];
  }
  function realWord(w) {
    if (/\d/.test(w) || /^[A-Za-zÀ-ÿ]{1,2}['’]$/.test(w)) return true;     // Zahlen und Uhrzeiten (13h, 10b); l' d' qu' allein
    const x = w.replace(/^['’]+|['’]+$/g, "");
    if (x.length === 1) return /^[aàyAÀY]$/.test(x);                       // à, a, y; sonst kein Wort aus einem Buchstaben
    if (/^[A-ZÄÖÜ]{2,4}$/.test(x) || /^(mme|mlle|dr|st|sms|hm+)$/i.test(x)) return true;   // Abkürzungen wie SMS, Mme
    return /[aeiouyäöüàâæéèêëîïôœùûÿ]/i.test(x) && !/(.)\1\1/i.test(x);       // mindestens ein Vokal, kein Buchstabe dreimal hintereinander
  }
  function words(t) { return tokens(t).filter(realWord).length; }
  /* Kleinbuchstaben ohne Akzente und Satzzeichen (für Abfragen und Inhaltsprüfungen) */
  function normAns(v) { return String(v || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’']/g, " ").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim(); }
  /* Enthält der Text das Wort (oder den Wortanfang) k? Nur am Wortanfang, damit „va rapporter“ nicht „a rapporte“ enthält */
  function hasWord(v, k) { return (" " + v + " ").includes(" " + normAns(k)); }

  /* Glossar: alle Formen eines Eintrags werden in den Spieltexten markiert, ein Tipp zeigt die Übersetzung */
  const GL = (function () {
    const forms = [];
    G.glossary.forEach((e, i) => {
      e[0].split(",").forEach(f => {
        const s = f.trim().replace(/\((m|f)\)/g, "").replace(/^(le |la |les |l'|l’)/, "").trim();
        if (s.length > 2) forms.push({ s, i });
      });
    });
    forms.sort((a, b) => b.s.length - a.s.length);
    const rx = new RegExp("(?<![A-Za-zÀ-ÿ])(" + forms.map(f => f.s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")(s|es|x)?(?![A-Za-zÀ-ÿ])", "gi");
    const idx = {}; forms.forEach(f => { idx[f.s.toLowerCase()] = f.i; });
    return { mark(text) { return esc(text).replace(rx, (m, w) => { const i = idx[w.toLowerCase()]; return i === undefined ? m : '<span class="gl" data-i="' + i + '">' + m + "</span>"; }); } };
  })();
  function gl(text) { return GL.mark(text); }
  document.addEventListener("click", e => {
    const t = e.target.closest(".gl");
    const tip = $("#gltip");
    if (!t) { tip.hidden = true; return; }
    const entry = G.glossary[+t.dataset.i];
    tip.innerHTML = "<b>" + esc(entry[0]) + "</b><br>" + esc(entry[1]);
    tip.hidden = false;
    const r = t.getBoundingClientRect();
    tip.style.left = Math.max(8, Math.min(r.left, window.innerWidth - tip.offsetWidth - 8)) + "px";
    tip.style.top = (r.bottom + 6 + window.scrollY) + "px";
  });
  document.addEventListener("scroll", () => { $("#gltip").hidden = true; }, true);

  /* ---------- Bilder: erst das echte Bild (jpg, png), dann der Platzhalter (assets/ph/*.svg), dann eine Farbfläche ---------- */
  function srcs(name) { return [IMG + name + ".jpg", IMG + name + ".png", PH + name + ".svg"]; }
  function loadFirst(list, ok, fail) {
    let i = 0;
    const next = () => { if (i >= list.length) { if (fail) fail(); return; } const src = list[i++]; const im = new Image(); im.onload = () => ok(src, im); im.onerror = next; im.src = src; };
    next();
  }
  function setBg(node, name) {
    node.style.backgroundImage = "";
    node.dataset.img = name;
    loadFirst(srcs(name), (src, im) => {
      if (node.dataset.img !== name) return;
      node.style.backgroundImage = "url(" + src + ")";
      node.style.aspectRatio = (im.naturalWidth / im.naturalHeight).toFixed(4);
    }, () => {
      if (node.dataset.img !== name) return;
      node.style.backgroundImage = "linear-gradient(160deg,#5b4636,#2d2420)";
      if (node.id === "stage") { node.style.aspectRatio = "16 / 9"; node.appendChild(el("div", "nobg", esc(S && S.scene ? G.scenes[S.scene].name : ""))); }
    });
  }
  /* Dokumentbild; onSize(Seitenverhältnis), sobald es geladen ist */
  function docImg(name, onSize) {
    const im = el("img", "docimg"); im.alt = ""; im.draggable = false;
    const list = srcs(name); let i = 0;
    im.onload = () => { if (onSize && im.naturalWidth) onSize(im.naturalWidth / im.naturalHeight); };
    im.onerror = () => { if (i < list.length) im.src = list[i++]; else im.remove(); };
    im.src = list[i++];
    return im;
  }
  function portrait(who) {
    const c = G.chars[who] || { name: who, initials: "?", color: "#777" };
    const p = el("div", "pt");
    p.style.backgroundColor = c.color;
    p.textContent = c.initials;
    if (c.pt) { const im = new Image(); im.onload = () => { p.textContent = ""; p.style.backgroundImage = "url(" + im.src + ")"; p.style.backgroundSize = "cover"; p.style.backgroundPosition = "center"; }; im.src = IMG + c.pt + ".png"; }
    return p;
  }

  /* ---------- Audio mit Sprachsynthese-Fallback ---------- */
  let currentAudio = null, frVoice = null;
  function pickVoice() { const vs = speechSynthesis.getVoices(); frVoice = vs.find(v => /^fr[-_]FR/i.test(v.lang)) || vs.find(v => /^fr/i.test(v.lang)) || null; }
  if ("speechSynthesis" in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  function stopAudio() { if (currentAudio) { currentAudio.pause(); currentAudio = null; } if ("speechSynthesis" in window) speechSynthesis.cancel(); $$(".playing").forEach(e => e.classList.remove("playing")); }
  /* onEnded: die Aufnahme ist einmal ganz gelaufen (oder kann gar nicht laufen) */
  function playAudio(id, btn, onBlocked, onEnded) {
    stopAudio();
    const a = G.audio[id];
    if (!a) return;
    S.replays[id] = (S.replays[id] || 0) + 1; save();
    if (btn) btn.classList.add("playing");
    const done = () => { if (btn) btn.classList.remove("playing"); };
    const ended = () => { done(); S.heard[id] = true; save(); if (onEnded) onEnded(); };
    const tts = () => {
      if (!("speechSynthesis" in window)) { ended(); return; }
      const u = new SpeechSynthesisUtterance(a.text.replace(/[«»]/g, ""));
      u.lang = "fr-FR"; u.rate = 0.88; if (frVoice) u.voice = frVoice;
      u.onend = ended; u.onerror = e => { if (e && (e.error === "interrupted" || e.error === "canceled")) done(); else ended(); };
      speechSynthesis.speak(u);
    };
    const au = new Audio(AUD + id + ".mp3");
    currentAudio = au;
    au.onended = ended;
    au.onerror = () => { if (currentAudio === au) { currentAudio = null; tts(); } };
    au.play().catch(err => {
      if (currentAudio !== au) return;
      currentAudio = null;
      // Handy-Browser spielen ohne Antippen nichts ab: dann wartet der Knopf, statt die Computerstimme zu starten
      if (err && err.name === "NotAllowedError") { S.replays[id]--; save(); done(); if (onBlocked) onBlocked(); return; }
      tts();
    });
  }

  /* ---------- Wirkungen (Flags, Gegenstände) ---------- */
  function addItem(id) { if (!S.inv.includes(id)) { S.inv.push(id); save(); toast(G.ui.inv.title + " : " + G.items[id].name); } }
  function applyEffects(fx, key) {
    if (!fx) return;
    if (key) { if (S.flags["fx:" + key]) return; S.flags["fx:" + key] = true; }
    if (fx.item) addItem(fx.item);
    if (fx.items) fx.items.forEach(addItem);
    if (fx.removeItem) S.inv = S.inv.filter(i => i !== fx.removeItem);
    if (fx.flag) S.flags[fx.flag] = true;
    if (fx.flags) fx.flags.forEach(f => { S.flags[f] = true; });
    save(); refreshTop();
    if (fx.flag || fx.flags) drawHotspots();
  }

  /* ---------- Oberfläche: Grundelemente ---------- */
  const stage = $("#stage"), dlg = $("#dialogue"), modal = $("#modal"), modalBody = $("#modal-body");
  function toast(msg) { const box = $("#toasts"); while (box.children.length >= 2) box.firstChild.remove(); const t = el("div", "toast", esc(msg)); box.appendChild(t); setTimeout(() => t.remove(), 2600); }
  function solvedCount() { return QIDS.filter(q => cond(G.questions[q].done)).length; }
  function refreshTop() {
    $("#scene-name").textContent = S && S.scene ? G.scenes[S.scene].name : "";
    if (S && S.scene) stage.dataset.name = G.scenes[S.scene].name;   // Hochformat: Ortsname auf dem Bild
    if (S && twoPlayers()) stage.dataset.mouse = G.ui.mouse + " " + pname(S.mouse); else delete stage.dataset.mouse;
    $("#mouse").innerHTML = S && twoPlayers() ? '<span class="ml">' + esc(G.ui.mouse) + "</span> " + esc(pname(S.mouse)) : "";
    const n = S ? solvedCount() : 0;
    $("#carnet-count").textContent = n ? n + "/4" : "";
  }
  function openModal(cls, keepDialogue) {
    modal.className = "modal " + (cls || "");
    modal.hidden = false; modalBody.innerHTML = "";
    modal.querySelector(".modal-inner").scrollTop = 0;
    if (!keepDialogue) dlg.classList.add("muted");
    return modalBody;
  }
  function closeModal() { modal.hidden = true; modalBody.innerHTML = ""; dlg.classList.remove("muted"); stopAudio(); }
  $("#modal-close").addEventListener("click", () => { if (!modal.classList.contains("nocl")) closeModal(); });

  /* Dialogzeilen nacheinander anzeigen. Zeile: { who, fr, onlyIf?, from? (nur wenn man von dort kommt), notFrom?, sms? } */
  function lineOk(l) {
    if (l.onlyIf && !cond(l.onlyIf)) return false;
    if (l.from && ![].concat(l.from).includes(S.from)) return false;
    if (l.notFrom && [].concat(l.notFrom).includes(S.from)) return false;
    return true;
  }
  function showLines(lines, cb, opts) {
    opts = opts || {};
    const ls = (lines || []).filter(lineOk);
    let i = 0;
    const box = opts.box || dlg;
    function step() {
      if (i >= ls.length) { if (opts.keep !== true) { box.innerHTML = ""; box.classList.remove("active"); } else { $$(".bar", box).forEach(b => b.remove()); } if (cb) cb(); return; }
      const l = ls[i++];
      renderLine(box, l, () => step(), G.ui.btn.continuer);
    }
    step();
  }
  function lineText(l) { return fmtTpl(l.fr, { proofs: proofNames() }); }
  function lineEl(l) {
    const c = G.chars[l.who] || { name: l.who };
    const row = el("div", "line " + (l.who === "narrateur" ? "narr" : "") + (l.sms ? " sms" : ""));
    if (l.who !== "narrateur") row.appendChild(portrait(l.who));
    const body = el("div", "body");
    if (c.name) body.appendChild(el("div", "who", esc(c.name) + (l.sms ? ' <span class="smstag">' + esc(G.ui.sms) + "</span>" : "")));
    body.appendChild(el("div", "text", G.formules && l.who === "beaumont" ? markFormules(lineText(l)) : gl(lineText(l))));
    row.appendChild(body);
    return row;
  }
  /* Le français de M. Beaumont: seine Höflichkeitsformeln lassen sich antippen und werden gesammelt */
  const FORM_RX = G.formules ? new RegExp("(" + G.formules.map(f => f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")", "gi") : null;
  function markFormules(text) {
    return text.split(FORM_RX).map((seg, i) => {
      if (i % 2 === 0) return gl(seg);
      const k = G.formules.findIndex(f => f.toLowerCase() === seg.toLowerCase());
      return '<span class="formule" data-f="' + k + '" title="' + esc(G.ui.carnet.formule) + '">' + gl(seg) + "</span>";
    }).join("");
  }
  document.addEventListener("click", e => {
    const f = e.target.closest(".formule"); if (!f || !S) return;
    S.formules = S.formules || {};
    const k = +f.dataset.f, fresh = !S.formules[k];
    S.formules[k] = true; f.classList.add("got"); save();
    const n = Object.keys(S.formules).length;
    if (fresh) toast(G.ui.carnet.formules + " : " + n + "/" + G.formules.length);
    if (n >= G.formules.length) setFlag("formules_5");
  });
  function renderLine(box, l, onNext, label) {
    box.innerHTML = ""; box.classList.add("active"); box.classList.remove("pending");
    box.appendChild(lineEl(l));
    if (onNext) { const b = el("button", "btn primary", esc(label || G.ui.btn.continuer)); b.addEventListener("click", onNext); const bar = el("div", "bar"); bar.appendChild(b); box.appendChild(bar); }
  }
  function renderChoices(box, choices, onPick, extra) {
    const wrap = el("div", "choices");
    choices.forEach((ch, i) => {
      const b = el("button", "btn choice", gl(ch.fr) + (ch.hint ? ' <small>' + esc(ch.hint) + "</small>" : ""));
      b.addEventListener("click", e => { if (e.target.closest(".gl")) return; onPick(ch, i, b); });
      wrap.appendChild(b);
    });
    if (extra) wrap.appendChild(extra);
    box.appendChild(wrap);
  }

  /* ---------- Diagnose ---------- */
  /* Tempobremse für kleine Wahlen: drei falsche Antworten hintereinander, jeweils schneller als zwei Sekunden */
  function tooFast(st) { const now = Date.now(); st.fast = now - (st.last || 0) < FAST_MS ? (st.fast || 0) + 1 : 0; st.last = now; if (st.fast >= FAST_N) { st.fast = 0; return true; } return false; }
  function tempoWait(box, then) {
    renderLine(box, { who: "lino", fr: G.ui.tempo.read });
    const cd = el("div", "countdown"); box.appendChild(cd);
    const end = Date.now() + TEMPO_PAUSE;
    const t = setInterval(() => {
      if (!cd.isConnected) { clearInterval(t); return; }
      const s = Math.ceil((end - Date.now()) / 1000);
      if (s > 0) { cd.textContent = fmtTpl(G.ui.guess.wait, { s }); return; }
      clearInterval(t); then();
    }, 250);
  }
  function classify(wrongs, help) { if (help > 0) return "mit Hilfe"; return wrongs <= 1 ? "selbstständig" : "nach Rückmeldung"; }
  function record(d) {
    const row = Object.assign({ date: new Date().toISOString(), player: pname(d.playerIdx === undefined ? S.mouse : d.playerIdx) }, d);
    delete row.playerIdx;
    S.diag = S.diag.filter(r => !(r.id === row.id && r.player === row.player && !r.count));
    S.diag.push(row); save();
  }

  /* ---------- Hilfe: Lino, vier Stufen, alles auf Französisch, eigene Farbe ---------- */
  function helpCtl(helpId, ctx) {
    // ctx: { wrongs(), audio, showTranscript(), material(), after: Fehlversuche vor Stufe 1 }
    const levels = G.help[helpId]; if (!levels) return null;
    const btn = el("button", "btn aide", esc(G.ui.btn.aide));
    const bubble = el("div", "help-bubble"); bubble.hidden = true;
    let level = S.helpUsed[helpId] || 0;
    const after = ctx.after || 1;
    function update() { const ok = PROF || (ctx.wrongs() >= after + level && level < 4); btn.disabled = !ok || level >= 4; btn.title = ok ? "" : G.ui.lino.helpLater; }
    function show() {
      const L = levels[level - 1]; const txt = typeof L === "string" ? L : L.fr;
      bubble.hidden = false; bubble.innerHTML = "";
      bubble.appendChild(portrait("lino"));
      bubble.appendChild(el("div", "body", '<div class="who">' + esc(G.ui.helpWho) + " · " + level + "/4</div><div class=\"text\">" + gl(txt) + "</div>"));
      return L;
    }
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      level++; S.helpUsed[helpId] = Math.max(S.helpUsed[helpId] || 0, level); save();
      const L = show();
      if (typeof L === "object") {
        if (L.action === "replay" && ctx.audio) playAudio(ctx.audio, null, null, ctx.onHeard);
        if (L.action === "transcript" && ctx.showTranscript) ctx.showTranscript();
        if (L.action === "material" && ctx.material) ctx.material();
      }
      update();
    });
    btn.addEventListener("pointerdown", () => { if (btn.disabled) toast("Lino : " + G.ui.lino.helpLater); });
    if (level > 0) { show(); const L = levels[level - 1]; if (typeof L === "object" && L.action === "material" && ctx.material) setTimeout(ctx.material, 0); }
    update();
    return { btn, bubble, update, level: () => level };
  }

  /* ---------- Knoten ausführen ---------- */
  function goNode(id) {
    if (!id || id === "END") { dlg.innerHTML = ""; dlg.classList.remove("active"); return; }
    if (id === "MAP") { openMap(); return; }
    if (id === "RESUME") { const at = S.at[S.scene]; if (at) goNode(at); else { dlg.innerHTML = ""; dlg.classList.remove("active"); } return; }
    if (id.startsWith("SCENE_")) { enterScene(id.slice(6), true); return; }
    if (id.startsWith("GO_")) { travel(id.slice(3)); return; }
    const n = G.nodes[id];
    if (!n) { console.warn("Knoten fehlt", id); return; }
    if (n.scene && S.scene !== n.scene) enterScene(n.scene, false);
    S.resume = id;
    /* Wo es in einer Station weitergeht, wenn man zwischendurch zur Karte geht (Tore und Nebenbemerkungen ausgenommen,
       und nur in der eigenen Station: eine Nachricht unterwegs verschiebt nichts) */
    const home = homeOf(id);
    if (!n.amb && !n.gate && n.type !== "end" && home && home === S.scene) S.at[home] = id;
    save();
    if (PROF) $("#node-id").textContent = id;
    const finish = () => { S.resume = null; if (n.doneAt && home) delete S.at[home]; save(); };
    switch (n.type) {
      case "cut": return runCut(id, n, finish);
      case "lines": return runLines(id, n, finish);
      case "doc": return runDoc(id, n, finish);
      case "choice": return runChoice(id, n, finish);
      case "audio": return runAudio(id, n, finish);
      case "task": return runTask(id, n, finish);
      case "end": return runEnd(finish);
    }
  }
  function homeOf(id) { return G.homeScene[id] || G.homeScene[id.replace(/\d.*$/, "")] || G.homeScene[id[0]] || null; }
  function resolve(action) {
    if (typeof action === "string") return action;
    if (Array.isArray(action)) { for (const a of action) if (cond(a.if)) return a.node; }
    return null;
  }

  function runCut(id, n, finish) {
    const body = openModal("cut nocl");
    const pic = el("div", "cutpic"); setBg(pic, n.bg); body.appendChild(pic);
    const box = el("div", "cutbox"); body.appendChild(box);
    showLines(n.lines, () => { applyEffects(n.effects, id); closeModal(); finish(); goNode(resolve(n.next)); }, { box });
  }
  function runLines(id, n, finish) {
    if (n.diag && n.count) record({ id: n.diag, result: "gezählt", count: true });
    showLines(n.lines, () => { applyEffects(n.effects, id); finish(); goNode(resolve(n.next)); });
  }

  /* Dokument (Plan, Ausweis, Karte …), auf Wunsch mit Frage und Antworten wie ein Gespräch */
  function runDoc(id, n, finish) {
    const body = openModal("doc" + (n.next || n.choices ? " nocl" : ""));
    if (!n.choices) applyEffects(n.effects, id);
    if (n.diag && n.count) record({ id: n.diag, result: "gelesen", count: true });
    body.appendChild(el("h2", "", esc(n.title)));
    if (n.img) body.appendChild(docImg(n.img));
    if (n.render) body.appendChild(RENDER[n.render]({ doc: true }));
    if (n.doc) body.appendChild(el("div", "paper " + (n.icon || ""), gl(n.doc)));
    (n.docs || []).forEach(d => { const c = el("div", "doccard"); c.appendChild(el("div", "doclabel", esc(d.label))); if (d.text) c.appendChild(el("div", "doctext", gl(d.text))); body.appendChild(c); });
    const box = el("div", "dlg-inline"); body.appendChild(box);
    const st = { wrongs: 0, first: null, t0: Date.now() };
    let hc = null;
    const done = () => { closeModal(); finish(); goNode(resolve(n.next)); };
    function ask() {
      box.innerHTML = ""; box.classList.add("active");
      if (n.question) box.appendChild(el("p", "q", gl(n.question)));
      const avail = n.choices.filter(ch => !ch.onlyIf || cond(ch.onlyIf));
      const list = avail.some(ch => ch.kind !== "ok") ? shuffled(avail) : avail;
      let extra = null;
      if (n.help) {
        if (!hc) hc = helpCtl(n.help, { wrongs: () => st.wrongs, material: () => body.classList.add("material") });
        extra = el("div", "help-row"); extra.appendChild(hc.btn); hc.update();
      }
      renderChoices(box, list, ch => {
        if (st.first === null) st.first = ch.fr;
        if (ch.kind === "ok") {
          const help = hc ? hc.level() : 0;
          if (n.diag) record({ id: n.diag, result: n.store ? "gewählt" : classify(st.wrongs, help), attempts: st.wrongs, help, first: st.first, text: n.store ? ch.fr : undefined, duration: secs(st.t0) });
          applyEffects(ch.effects, id + ":" + ch.fr); applyEffects(n.effects, id);
          showLines(ch.reply, () => { closeModal(); finish(); goNode(resolve(ch.next || n.next)); }, { box });
        } else {
          st.wrongs++; if (hc) hc.update();
          const slow = tooFast(st);
          if (slow) S.tempo[id] = (S.tempo[id] || 0) + 1;
          showLines(ch.reply, slow ? () => tempoWait(box, ask) : ask, { box, keep: true });
        }
      }, extra);
      if (hc) box.appendChild(hc.bubble);
      st.last = Date.now();
    }
    showLines(n.lines, () => {
      if (n.choices) ask();
      else { const b = el("button", "btn primary", n.next ? G.ui.btn.continuer : G.ui.btn.fermer); b.addEventListener("click", done); const bar = el("div", "bar"); bar.appendChild(b); box.appendChild(bar); box.classList.add("active"); }
    }, { box, keep: true });
  }

  function runChoice(id, n, finish) {
    const st = { wrongs: 0, first: null, t0: Date.now() };
    let hc = null, first = true;
    function ask() {
      const lines = first ? n.lines : null; first = false;   // Einleitung nur beim ersten Mal
      showLines(lines, () => {
        dlg.innerHTML = ""; dlg.classList.add("active"); dlg.classList.remove("pending");
        if (n.prompt) dlg.appendChild(lineEl(n.prompt));
        else { const row = el("div", "line"); row.appendChild(portrait(n.who)); row.appendChild(el("div", "body", '<div class="who">' + esc(G.chars[n.who].name) + "</div>")); dlg.appendChild(row); }
        let extra = null;
        if (n.help) {
          if (!hc) hc = helpCtl(n.help, { wrongs: () => st.wrongs, material: () => { $$(".choice", dlg).forEach(b => b.classList.add("hl")); } });
          extra = el("div", "help-row"); extra.appendChild(hc.btn); hc.update();
        }
        const avail = n.choices.filter(ch => !ch.onlyIf || cond(ch.onlyIf));
        const choices = avail.some(ch => ch.kind !== "ok") ? shuffled(avail) : avail;   // gibt es eine falsche Antwort, jedes Mal neu gemischt
        renderChoices(dlg, choices, ch => {
          if (st.first === null) st.first = ch.fr;
          if (ch.kind === "ok") {
            const help = hc ? hc.level() : 0;
            if (n.diag) record({ id: n.diag, result: n.store ? "gewählt" : classify(st.wrongs, help), attempts: st.wrongs, help, first: st.first, text: n.store ? ch.fr : undefined, duration: secs(st.t0) });
            if (help > 0) toast("Lino : " + G.ui.lino.afterHelp);
            applyEffects(ch.effects, id + ":" + ch.fr);
            showLines(ch.reply, () => { applyEffects(n.effects, id); finish(); goNode(resolve(ch.next || n.next)); });
          } else {
            st.wrongs++;
            const slow = tooFast(st);
            if (slow) S.tempo[id] = (S.tempo[id] || 0) + 1;
            showLines(ch.reply, slow ? () => tempoWait(dlg, ask) : ask);
          }
        }, extra);
        if (hc) dlg.appendChild(hc.bubble);
        st.last = Date.now();
      });
    }
    ask();
  }

  function runAudio(id, n, finish) {
    const a = G.audio[n.audio];
    const body = openModal("audio nocl");
    body.appendChild(el("h2", "", esc(n.title || G.chars[a.who].name)));
    if (n.intro) body.appendChild(el("p", "hint", gl(n.intro)));
    const row = el("div", "audio-row"); row.appendChild(portrait(a.who));
    const play = el("button", "btn play", "▶ " + esc(G.ui.btn.ecouter));
    let plays = 0;
    const limit = n.maxPlays && !PROF ? n.maxPlays : 0;
    const left = el("span", "hint");
    const start = onBlocked => {
      if (limit && plays >= limit) return;
      plays++; play.textContent = "▶ " + G.ui.btn.rejouer;
      playAudio(n.audio, play, () => { plays--; if (onBlocked) onBlocked(); }, heard);
      if (limit) { left.textContent = plays >= limit ? G.ui.audioLast : fmtTpl(G.ui.audioLeft, { n: limit - plays }); if (plays >= limit) play.disabled = true; }
    };
    play.addEventListener("click", () => start());
    row.appendChild(play);
    if (limit) row.appendChild(left);
    const tr = el("button", "btn", esc(G.ui.btn.transcription));
    const trBox = el("div", "paper transcript", gl(a.text)); trBox.hidden = true;
    tr.hidden = !(PROF || (n.transcriptHelp && (S.helpUsed[n.transcriptHelp] || 0) >= 3));
    tr.addEventListener("click", () => { trBox.hidden = !trBox.hidden; S.transcripts[n.audio] = true; save(); });
    row.appendChild(tr); body.appendChild(row); body.appendChild(trBox);
    if (!limit) body.appendChild(el("p", "hint", esc(G.ui.listenMore)));
    const bar = el("div", "bar"); const b = el("button", "btn primary", esc(G.ui.btn.continuer));
    b.addEventListener("click", () => { closeModal(); applyEffects(n.effects, id); finish(); goNode(resolve(n.next)); });
    /* Nicht wegklicken: „Continuer“ erst, wenn die Aufnahme einmal ganz gelaufen ist */
    const wait = el("p", "hint wait", esc(G.ui.listen));
    function heard() { b.disabled = false; wait.remove(); }
    if (!S.heard[n.audio] && !PROF && !(TEST && QS.get("listen") !== "1")) { b.disabled = true; body.appendChild(wait); }
    bar.appendChild(b); body.appendChild(bar);
    setTimeout(() => start(() => { play.textContent = "▶ " + G.ui.btn.ecouter; }), 300);
  }

  /* ---------- Aufgaben ---------- */
  function runTask(id, n, finish) {
    const idxs = (n.perPlayer && twoPlayers()) ? [0, 1] : [S.mouse];
    const results = [];
    let k = 0;
    function one() {
      if (k >= idxs.length) {
        applyEffects(n.effects, id);
        if (n.task.kind === "write") { S.cards[id] = results.map(r => ({ player: r.player, text: r.text })); save(); }
        closeModal();
        const after = results.flatMap(r => r.after || []).concat(n.after || []);
        showLines(after, () => { finish(); goNode(resolve(n.next)); });
        return;
      }
      const pi = idxs[k++];
      const intro = idxs.length > 1 ? (k === 1 ? fmtTpl(G.ui.solo, { p1: pname(0), p2: pname(1) }) : fmtTpl(G.ui.soloNow, { p: pname(pi) })) : null;
      taskCard(id, n, pi, intro, res => { results.push(res); one(); });
    }
    one();
  }

  const GUESS_TRIES = 3, GUESS_PAUSE = [60000, 120000];   // jeder dritte Fehlversuch: erst eine, dann zwei Minuten Pause
  const FAST_MS = 2000, FAST_N = 3, TEMPO_PAUSE = 20000;    // Tempobremse: drei schnelle Fehlversuche hintereinander
  const MISS_N = 8;                                          // Bildlupe und Beobachtung: acht Fehlklicks

  function taskCard(id, n, playerIdx, intro, done) {
    const T = n.task;
    const body = openModal("task nocl" + (T.kind === "loupe" || T.kind === "observe" ? " wide" : ""));
    const st = { wrongs: 0, t0: Date.now(), last: Date.now(), fast: 0, miss: 0, misses: 0, transcript: false };
    const replays0 = n.audio ? (S.replays[n.audio] || 0) : 0;
    body.appendChild(el("h2", "", esc(n.title || "")));
    if (intro) body.appendChild(el("div", "solo", esc(intro)));
    const who = T.who ? G.chars[T.who].name : null;
    if (T.img && T.kind !== "loupe") body.appendChild(docImg(T.img));
    if (T.intro) body.appendChild(el("div", "paper intro" + (T.sms ? " sms" : ""), (who ? "<b>" + esc(who) + (T.sms ? " · " + esc(G.ui.sms) : "") + " :</b> " : "") + gl(T.intro)));
    if (T.doc) body.appendChild(el("div", "paper " + (T.docIcon || ""), gl(T.doc)));
    (T.docs || []).forEach(d => { const c = el("div", "doccard" + (d.cls ? " " + d.cls : "")); c.appendChild(el("div", "doclabel", gl(d.label))); if (d.text) c.appendChild(el("div", "doctext", gl(d.text))); body.appendChild(c); });
    const trBox = el("div", "paper transcript"); trBox.hidden = true;
    let hc = null, onHeard = null;
    const tools = el("div", "tools");
    if (n.audio) {
      const a = G.audio[n.audio];
      if (!n.noReplay) {
        const play = el("button", "btn play", "▶ " + esc(G.ui.btn.rejouer));
        play.addEventListener("click", () => playAudio(n.audio, play, null, () => onHeard && onHeard()));
        tools.appendChild(play);
      }
      trBox.innerHTML = gl(a.text);
      const tr = el("button", "btn", esc(G.ui.btn.transcription));
      tr.hidden = !(PROF || (S.helpUsed[n.help] || 0) >= 3);
      tr.addEventListener("click", () => { trBox.hidden = !trBox.hidden; st.transcript = true; S.transcripts[n.audio] = true; save(); if (onHeard) onHeard(); });
      tools.appendChild(tr);
      st.showTranscript = () => { tr.hidden = false; trBox.hidden = false; st.transcript = true; S.transcripts[n.audio] = true; save(); if (onHeard) onHeard(); };
    }
    if (n.help) {
      hc = helpCtl(n.help, { wrongs: () => st.wrongs, audio: n.audio, onHeard: () => onHeard && onHeard(), showTranscript: () => st.showTranscript && st.showTranscript(), material: () => { body.classList.add("material"); if (st.material) st.material(); showMaterial(T, body, area, st); } });
      if (hc) tools.appendChild(hc.btn);
    }
    if (tools.children.length) body.appendChild(tools);
    if (hc) body.appendChild(hc.bubble);
    body.appendChild(trBox);
    const area = el("div", "area"); body.appendChild(area);
    const fb = el("div", "feedback"); body.appendChild(fb);
    /* Erst hören, dann wählen: die Antworten erscheinen erst, wenn der Hörtext einmal ganz gelaufen ist (oder das Transkript offen war) */
    if (n.listenFirst && n.audio && !S.heard[n.audio] && !S.transcripts[n.audio] && !PROF && !(TEST && QS.get("listen") !== "1")) {
      area.hidden = true;
      const w = el("p", "hint wait", esc(G.ui.listen)); body.insertBefore(w, area);
      onHeard = () => { area.hidden = false; w.remove(); onHeard = null; };
    }
    function feedback(line, ok) {
      fb.innerHTML = ""; fb.className = "feedback " + (ok ? "ok" : "no");
      if (line) fb.appendChild(lineEl(line));
    }
    function note(line) { fb.appendChild(lineEl(line)); }
    /* Gegen Raten: Jeder dritte Fehlversuch sperrt die Aufgabe (erst eine, dann zwei Minuten), drei schnelle Fehlversuche
       hintereinander 20 Sekunden. Hilfe, Hören und Transkript bleiben in der Pause nutzbar; die Sperre übersteht Neuladen. */
    const left = () => Math.max(0, Math.ceil(((S.pause[id] || 0) - Date.now()) / 1000));
    let timer = null;
    function lock(line) {
      const frozen = $$("button,select,input,textarea", area).filter(x => !x.disabled && !x.classList.contains("keep"));
      frozen.forEach(x => { x.disabled = true; });
      area.classList.add("locked");
      if (line) note(line);
      const cd = el("div", "countdown"); fb.appendChild(cd);
      clearInterval(timer);
      const tick = () => {
        if (!area.isConnected) { clearInterval(timer); return; }
        const s = left();
        if (s > 0) { cd.textContent = fmtTpl(G.ui.guess.wait, { s }); return; }
        clearInterval(timer); cd.remove(); frozen.forEach(x => { x.disabled = false; }); area.classList.remove("locked");
      };
      tick(); timer = setInterval(tick, 1000);
    }
    function pauseFor(ms, line) { S.pause[id] = Math.max(S.pause[id] || 0, Date.now() + ms); save(); lock(line); }
    function wrong(line) {
      st.wrongs++; if (hc) hc.update();
      const now = Date.now();
      st.fast = now - st.last < FAST_MS ? st.fast + 1 : 0; st.last = now;
      S.tries[id] = (S.tries[id] || 0) + 1;
      feedback(line || T.wrong, false);
      const tempo = st.fast >= FAST_N, tempoLine = { who: "lino", fr: G.ui.tempo.read };
      if (tempo) { st.fast = 0; S.tempo[id] = (S.tempo[id] || 0) + 1; }
      if (S.tries[id] % GUESS_TRIES === 0) {   // die längere Pause gilt; war es zu schnell, sagt Lino das
        const k = S.pauses[id] = (S.pauses[id] || 0) + 1;
        pauseFor(GUESS_PAUSE[Math.min(k, GUESS_PAUSE.length) - 1], tempo ? tempoLine : T.pauseLine || { who: T.kind === "recall" ? (T.who || "lino") : "lino", fr: T.kind === "recall" ? G.ui.recall.pause : G.ui.guess.pause });
      } else if (tempo) pauseFor(TEMPO_PAUSE, tempoLine);
      save();
    }
    /* Ein Fehlgriff, der nicht sperrt (kleine Wahl in der Bildlupe): zählt nur für die Hilfe */
    function soft(line) { st.wrongs++; if (hc) hc.update(); st.last = Date.now(); feedback(line, false); }
    /* Fehlklick in Bildlupe oder Beobachtung: nach acht Fehlklicks „Doucement. Regarde d'abord.“ und 20 Sekunden Pause */
    function miss() {
      st.misses++; st.miss++;
      if (st.miss === 1 || st.miss % 2 === 0) { st.wrongs++; if (hc) hc.update(); }
      if (st.miss >= MISS_N) { st.miss = 0; S.tempo[id] = (S.tempo[id] || 0) + 1; feedback(null, false); pauseFor(TEMPO_PAUSE, { who: "lino", fr: G.ui.tempo.look }); }
    }
    function hit() { st.miss = 0; }
    function complete(extra, line) {
      clearInterval(timer);
      const help = hc ? hc.level() : 0;
      const res = Object.assign({ id: n.diag, result: classify(st.wrongs, help), attempts: st.wrongs, help, replays: n.audio ? (S.replays[n.audio] || 0) - replays0 : undefined, transcript: n.audio ? st.transcript : undefined, duration: secs(st.t0), pauses: S.pauses[id] || undefined, tempo: S.tempo[id] || undefined, misses: st.misses || undefined, playerIdx }, extra || {});
      delete res.after;
      delete S.tries[id]; delete S.pause[id]; delete S.pauses[id]; delete S.tempo[id]; save();
      if (n.diag) record(res);
      feedback(line || T.success || { who: "lino", fr: help > 0 ? G.ui.lino.afterHelp : G.ui.lino.ok }, true);
      if (line && help > 0) note({ who: "lino", fr: G.ui.lino.afterHelp });
      const b = el("button", "btn primary", esc(G.ui.btn.continuer)); b.addEventListener("click", () => done(Object.assign({ player: pname(playerIdx) }, extra || {})));
      const bar = el("div", "bar"); bar.appendChild(b); fb.appendChild(bar);
      $$("button", area).forEach(x => x.disabled = true); $$("select,textarea,input", area).forEach(x => x.disabled = true);
      area.classList.add("solved");
      if (TOUCH) setTimeout(() => b.scrollIntoView({ block: "nearest", behavior: "smooth" }), 50);
    }
    const K = TASKS[T.kind];
    K(T, area, { wrong, soft, miss, hit, complete, feedback, note, lineEl, pauseFor, locked: () => left() > 0, st, id, n, body });
    if (left() > 0) { feedback({ who: "lino", fr: fmtTpl(T.kind === "recall" ? G.ui.recall.paused : G.ui.guess.paused, { s: left() }) }, false); lock(); }
  }

  /* Material der Hilfe (Stufe 2): Bilder, ein Text, die eigene Personenbeschreibung oder die Gegenstände im Inventar */
  function showMaterial(T, body, area, st) {
    if (st.matShown || !(T.matImgs || T.matText || T.matFiche || T.matInv)) return;
    st.matShown = true;
    const box = el("div", "matbox");
    (T.matImgs || []).forEach(i => box.appendChild(docImg(i)));
    if (T.matText) box.appendChild(el("div", "paper small", gl(T.matText)));
    if (T.matFiche) (S.cards.N07b || []).forEach(c => box.appendChild(el("div", "paper small", "<b>" + esc(G.items.fiche.name) + " · " + esc(c.player) + "</b><br>" + esc(c.text))));
    if (T.matInv) box.appendChild(el("div", "paper small", T.matInv.filter(i => S.inv.includes(i)).map(i => "<b>" + esc(G.items[i].name) + "</b> : " + gl(itemDesc(i))).join("<br>")));
    body.insertBefore(box, area);
  }

  const TASKS = {};
  /* Rückmeldung bei Lücken, Zuordnungen und Mehrfachwahlen: nur wie viele stimmen, nicht welche */
  function withCount(line, k, m) { return { who: line.who, fr: line.fr + " " + fmtTpl(G.ui.guess.count, { n: k, m }) }; }
  function selectOf(opts, first) {
    const sel = el("select"); const o0 = el("option", "", esc(first || "…")); o0.value = ""; sel.appendChild(o0);
    opts.forEach(o => { const op = el("option", "", esc(o.label)); op.value = o.id; sel.appendChild(op); });
    return sel;
  }
  const QIDS = ["Q1", "Q2", "Q3", "Q4"];

  /* Zuordnen: jede Zeile (slot) bekommt eine Option; Optionen dürfen mehrfach passen */
  TASKS.sort = function (T, area, api) {
    const sels = {}, opts = shuffled(T.options);
    shuffled(T.slots).forEach(s => {
      const row = el("div", "slot"); row.appendChild(el("label", "", gl(s.label)));
      const sel = selectOf(opts); sels[s.id] = sel; row.appendChild(sel); area.appendChild(row);
    });
    const b = el("button", "btn primary", esc(G.ui.btn.valider));
    b.addEventListener("click", () => {
      if (api.locked()) return;
      if (T.slots.some(s => !sels[s.id].value)) { api.feedback({ who: "lino", fr: G.ui.guess.all }, false); return; }
      const k = T.slots.filter(s => sels[s.id].value === s.answer).length;
      if (k === T.slots.length) { api.complete({ text: T.slots.map(s => s.id + ":" + sels[s.id].value).join(" ") }); return; }
      const trap = T.options.find(o => o.reply && T.slots.some(s => sels[s.id].value === o.id));
      api.wrong(withCount(T.wrong, k, T.slots.length));
      if (trap) api.note(trap.reply);
    });
    area.appendChild(b);
  };

  /* Spalten: jede Karte kommt in eine Spalte; Fallen haben eine eigene Rückmeldung, wenn sie falsch liegen */
  TASKS.cols = function (T, area, api) {
    if (T.legend) area.appendChild(el("div", "legend", T.columns.map(c => "<b>" + esc(c.label) + "</b>" + (c.desc ? " : " + gl(c.desc) : "")).join("<br>")));
    const sels = {}, cards = shuffled(T.cards);
    cards.forEach(c => {
      const row = el("div", "crow"); row.appendChild(el("div", "clabel", gl(c.label)));
      const sel = selectOf(T.columns); sels[c.id] = sel; row.appendChild(sel); area.appendChild(row);
    });
    const b = el("button", "btn primary", esc(G.ui.btn.valider));
    b.addEventListener("click", () => {
      if (api.locked()) return;
      if (T.cards.some(c => !sels[c.id].value)) { api.feedback({ who: "lino", fr: G.ui.guess.all }, false); return; }
      const k = T.cards.filter(c => sels[c.id].value === c.col).length;
      if (k === T.cards.length) { api.complete({ text: T.cards.map(c => c.id + ":" + sels[c.id].value).join(" ") }); return; }
      const trap = cards.find(c => c.trap && sels[c.id].value !== c.col);
      api.wrong(withCount(T.wrong, k, T.cards.length));
      if (trap) api.note(trap.trap);
    });
    area.appendChild(b);
  };

  TASKS.gap = function (T, area, api) {
    const p = el("p", "gaptext"); const sels = [];
    T.parts.forEach(part => {
      if (typeof part === "string") p.appendChild(document.createTextNode(part));
      else { const sel = selectOf(shuffled(part.opts).map(o => ({ id: o, label: o }))); sel.dataset.answer = part.answer; sel.dataset.id = part.id; sels.push(sel); p.appendChild(sel); }
    });
    area.appendChild(p);
    const perGap = {};
    const b = el("button", "btn primary", esc(G.ui.btn.valider));
    b.addEventListener("click", () => {
      if (api.locked()) return;
      if (sels.some(s => !s.value)) { api.feedback({ who: "lino", fr: G.ui.guess.all }, false); return; }
      let k = 0;
      sels.forEach(s => { const good = s.value === s.dataset.answer; if (perGap[s.dataset.id] === undefined) perGap[s.dataset.id] = good; if (good) k++; });
      if (k === sels.length) api.complete({ text: Object.keys(perGap).map(g => g + ":" + (perGap[g] ? "✓" : "✗")).join(" ") });
      else api.wrong(withCount(T.wrong, k, sels.length));
    });
    area.appendChild(b);
  };

  /* Auswahl: n richtige aus mehreren; Rückmeldung als Ganzes, höchstens die Reaktion auf die erste falsche Wahl */
  TASKS.pick = function (T, area, api) {
    if (T.question) area.appendChild(el("p", "q", gl(T.question)));
    const sel = new Set(), opts = shuffled(T.options.filter(o => !o.onlyIf || cond(o.onlyIf)));
    const list = el("div", "picklist");
    opts.forEach(o => {
      const b = el("button", "btn opt", gl(o.label));
      b.addEventListener("click", e => {
        if (e.target.closest(".gl")) return;
        if (sel.has(o.id)) { sel.delete(o.id); b.classList.remove("on"); }
        else { if (T.n === 1) { sel.clear(); $$(".opt", list).forEach(x => x.classList.remove("on")); } if (sel.size < T.n) { sel.add(o.id); b.classList.add("on"); } }
      });
      list.appendChild(b);
    });
    area.appendChild(list);
    const b = el("button", "btn primary", esc(G.ui.btn.valider));
    b.addEventListener("click", () => {
      if (api.locked()) return;
      if (sel.size < T.n) { api.feedback({ who: "lino", fr: fmtTpl(T.n === 1 ? G.ui.guess.chooseOne : G.ui.guess.choose, { n: T.n }) }, false); return; }
      const chosen = opts.filter(o => sel.has(o.id));
      if (opts.every(o => !!o.ok === sel.has(o.id))) { api.complete({ text: chosen.map(o => o.id).join("+") }, T.success); return; }
      const bad = chosen.find(o => !o.ok);
      if (T.n === 1) { api.wrong(bad.reply || T.wrong); return; }
      api.wrong(withCount(T.wrong, chosen.filter(o => o.ok).length, T.n));
      if (bad && bad.reply) api.note(bad.reply);
    });
    area.appendChild(b);
  };

  /* Kette: Sätze in die richtige Reihenfolge bringen (▲ ▼), Lücken mit Kärtchen füllen; geprüft wird alles zusammen */
  TASKS.chain = function (T, area, api) {
    const N = T.items.length;
    let order = shuffled(T.items.map((_, i) => i));
    if (order.every((v, i) => v === i)) order.reverse();
    const sels = {};
    const list = el("ol", "chain");
    function render() {
      list.innerHTML = "";
      order.forEach((ii, pos) => {
        const it = T.items[ii];
        const li = el("li", "citem");
        const txt = el("div", "ctext");
        it.parts.forEach(part => {
          if (typeof part === "string") txt.appendChild(el("span", "", gl(part)));
          else if (part.tw) txt.appendChild(el("span", "tw", gl(part.tw)));
          else { if (!sels[ii]) { sels[ii] = selectOf(shuffled(T.words).map(w => ({ id: w, label: w })), "___"); sels[ii].dataset.answer = part.gap; } txt.appendChild(sels[ii]); }
        });
        const mv = el("div", "cmoves");
        const up = el("button", "btn small cmove", "▲"), dn = el("button", "btn small cmove", "▼");
        up.setAttribute("aria-label", G.ui.chainUp); dn.setAttribute("aria-label", G.ui.chainDown);
        up.disabled = pos === 0 || api.locked(); dn.disabled = pos === N - 1 || api.locked();
        up.addEventListener("click", () => { if (pos > 0) { [order[pos - 1], order[pos]] = [order[pos], order[pos - 1]]; render(); } });
        dn.addEventListener("click", () => { if (pos < N - 1) { [order[pos + 1], order[pos]] = [order[pos], order[pos + 1]]; render(); } });
        mv.appendChild(up); mv.appendChild(dn);
        li.appendChild(mv); li.appendChild(txt);
        list.appendChild(li);
      });
    }
    render();
    area.appendChild(list);
    const b = el("button", "btn primary", esc(G.ui.btn.valider));
    b.addEventListener("click", () => {
      if (api.locked()) return;
      const gaps = Object.values(sels);
      if (gaps.some(s => !s.value)) { api.feedback({ who: "lino", fr: G.ui.guess.all }, false); return; }
      const posOk = order.filter((ii, pos) => ii === pos).length, gapOk = gaps.filter(s => s.value === s.dataset.answer).length;
      const k = posOk + gapOk, m = N + gaps.length;
      if (k === m) { api.complete({ text: order.join(",") + " · " + gaps.map(s => s.value).join(",") }); return; }
      const lines = [];
      if (posOk < N) lines.push(T.wrongOrder || T.wrong);
      if (gapOk < gaps.length) lines.push(T.wrongWords || T.wrong);
      render();   // vor der Rückmeldung: eine Sperre friert die neuen Knöpfe ein
      api.wrong(withCount(lines[0], k, m));
      if (lines[1]) api.note(lines[1]);
    });
    area.appendChild(b);
  };

  /* Beweise: n verschiedene Gegenstände aus dem Inventar, zu jedem ein Satz */
  TASKS.proofs = function (T, area, api) {
    const items = shuffled(T.items.filter(it => S.inv.includes(it.id)));
    const sents = shuffled(T.sentences);
    const rows = [];
    for (let i = 0; i < T.n; i++) {
      const row = el("div", "prow");
      row.appendChild(el("div", "pnum", esc(fmtTpl(G.ui.proof, { n: i + 1 }))));
      const it = selectOf(items.map(x => ({ id: x.id, label: G.items[x.id].name })), G.ui.proofItem);
      const se = selectOf(sents, G.ui.proofSentence);
      row.appendChild(it); row.appendChild(se); area.appendChild(row);
      rows.push({ it, se });
    }
    const b = el("button", "btn primary", esc(G.ui.btn.valider));
    b.addEventListener("click", () => {
      if (api.locked()) return;
      if (rows.some(r => !r.it.value || !r.se.value)) { api.feedback({ who: "lino", fr: G.ui.guess.all }, false); return; }
      const ids = rows.map(r => r.it.value);
      if (new Set(ids).size < ids.length) { api.feedback({ who: "lino", fr: T.distinct }, false); return; }
      const rep = rows.map(r => T.items.find(x => x.id === r.it.value)).find(x => x.repair);
      if (rep) { api.feedback(rep.repair, false); return; }   // zählt nicht als Versuch
      const k = rows.filter(r => T.items.find(x => x.id === r.it.value).sentence === r.se.value).length;
      if (k === T.n) {
        S.proofs = ids; save();
        const after = ids.flatMap(i => T.items.find(x => x.id === i).reply || []);
        api.complete({ text: rows.map(r => r.it.value + "=" + r.se.value).join(" "), after });
        return;
      }
      let trap = null;
      rows.some(r => { const x = T.items.find(y => y.id === r.it.value), s = T.sentences.find(y => y.id === r.se.value); trap = (x && x.trap) || (s && s.trap) || null; return !!trap; });
      api.wrong(withCount(T.wrong, k, T.n));
      if (trap) api.note(trap);
    });
    area.appendChild(b);
  };
  function proofNames() { return (S && S.proofs || []).map(i => G.items[i] ? G.items[i].name : i).join(", "); }

  /* Fragen stellen: Ja-Nein-Fragen bekommen nur « Oui. »; nach der dritten bedient die Verkäuferin eine andere Kundin */
  const QWORDS = /\b(jusqu'à quelle heure|quelles?|quels?|quand|comment|combien|pourquoi|où|qui)\b/gi;
  TASKS.ask = function (T, area, api) {
    const log = el("div", "asklog");
    const prog = el("div", "lstatus");
    const list = el("div", "asklist");
    const known = new Set();
    let yn = 0, ynTotal = 0, ynBefore = 0, wAsked = false;
    const qs = shuffled(T.questions.filter(q => !q.onlyIf || cond(q.onlyIf)));
    function upd() { prog.textContent = fmtTpl(T.progress, { n: known.size, m: T.facts.length }); }
    function say(q) {
      log.appendChild(lineEl({ who: "marie", fr: q.q }));
      log.appendChild(lineEl({ who: T.who, fr: q.a }));
      while (log.children.length > 6) log.firstChild.remove();
      log.scrollTop = log.scrollHeight;
    }
    qs.forEach(q => {
      const b = el("button", "btn opt askq", esc(q.q).replace(QWORDS, m => '<span class="qw">' + m + "</span>"));
      b.addEventListener("click", () => {
        if (api.locked()) return;
        say(q); b.classList.add("asked");
        if (q.yn) {
          yn++; ynTotal++; if (!wAsked) ynBefore++;
          api.soft(null);
          api.feedback(null, true);
          if (yn === 2) api.note(T.ynHint);
          if (yn >= 3) { yn = 0; S.pauses[api.id] = (S.pauses[api.id] || 0) + 1; api.pauseFor(T.ynPauseMs, T.ynPause); }
        } else { wAsked = wAsked || !!q.w; api.feedback(null, true); }
        if (q.fact && !known.has(q.fact)) { known.add(q.fact); upd(); }
        if (T.facts.every(f => known.has(f))) api.complete({ text: "Ja-Nein vor W: " + ynBefore + ", gesamt: " + ynTotal }, T.success);
      });
      list.appendChild(b);
    });
    upd();
    area.appendChild(log); area.appendChild(prog); area.appendChild(list);
  };

  /* Freitext: echte französische Wörter, Satzanfänge fortsetzen, kein Einfügen; dazu Inhaltsprüfungen je Aufgabe */
  TASKS.write = function (T, area, api) {
    const used = new Set();
    const chips = el("div", "chips");
    const ta = el("textarea"); ta.rows = T.rows || 6; ta.placeholder = "…"; ta.spellcheck = false;
    ta.setAttribute("autocorrect", "off"); ta.setAttribute("autocapitalize", "sentences");
    (T.starters || []).forEach(s => { const c = el("button", "btn chip", esc(s)); c.addEventListener("click", () => { used.add(s); ta.value += (ta.value && !/\s$/.test(ta.value) ? " " : "") + s.replace(/\.\.\.$/, " "); ta.focus(); count(); }); chips.appendChild(c); });
    if (T.starters) area.appendChild(chips);
    area.appendChild(ta);
    const cnt = el("div", "count"); area.appendChild(cnt);
    const W = G.ui.write;
    function count() { const w = words(ta.value); cnt.textContent = fmtTpl(W.count, { n: w, min: T.min }); cnt.classList.toggle("ok", w >= T.min); }
    ta.addEventListener("input", count); count();
    /* Selbst schreiben: kein Einfügen (etwa aus einem Übersetzer) */
    ["paste", "drop"].forEach(ev => ta.addEventListener(ev, e => { e.preventDefault(); api.feedback({ who: "lino", fr: W.paste }, false); }));
    const LANG = G.writeLang && { own: new Set(G.writeLang.own.split(" ")), foreign: new Set(G.writeLang.foreign.split(" ")), share: G.writeLang.share };
    function ownWords(text) {
      used.forEach(s => s.split("...").map(x => x.trim()).filter(x => x.length > 2).forEach(x => { text = text.replace(x, " "); }));
      return tokens(text).filter(realWord).map(normAns).join(" ").split(" ").filter(Boolean);
    }
    function problem(text) {
      const marks = [];
      used.forEach(s => { const ins = s.replace(/\.\.\.$/, "").trim(), i = text.indexOf(ins); if (i >= 0) marks.push({ s, ins, i, end: i + ins.length }); });
      marks.sort((a, b) => a.i - b.i);
      for (let k = 0; k < marks.length; k++) {
        const m = marks[k];
        if (m.ins.includes("...")) return fmtTpl(W.dots, { s: m.s });
        if (/\.\.\.$/.test(m.s) && !words(text.slice(m.end, k + 1 < marks.length ? marks[k + 1].i : text.length))) return fmtTpl(W.finish, { s: m.s });
      }
      const toks = tokens(text), junk = toks.filter(t => !realWord(t));
      if (junk.length >= 3) return fmtTpl(W.junk, { w: junk.slice(0, 6).join(" ") });
      const own = ownWords(text);
      if (LANG) {
        const mine = own.filter(x => LANG.own.has(x)).length, other = own.filter(x => LANG.foreign.has(x)).length;
        if ((other >= 3 && other >= own.length * 0.1) || (own.length >= 8 && mine < own.length * LANG.share)) return W.lang;
      }
      const real = toks.filter(realWord).map(t => t.toLowerCase());
      if (real.length >= 15 && new Set(real).size < real.length * 0.4) return W.repeat;
      const w = real.length;
      if (w < T.min) return fmtTpl(W.more, { n: T.min - w });
      if (T.topic && T.topic.filter(k => own.some(x => x.startsWith(k))).length < (T.topicMin || 2)) return T.topicMsg || W.topic;
      if (T.check) return CHECKS[T.check](text, T);
      return null;
    }
    const b = el("button", "btn primary", esc(G.ui.btn.valider));
    b.addEventListener("click", () => {
      const p = problem(ta.value);
      if (p) { api.st.wrongs++; api.feedback({ who: "lino", fr: p }, false); return; }
      api.complete({ text: ta.value.trim(), words: words(ta.value), starters: Array.from(used).join(" | ") }, T.success);
    });
    area.appendChild(b);
  };

  /* Inhaltsprüfungen für freie Texte (Antwort: Linos Hinweis oder null) */
  const AUX = new Set(["ai", "as", "a", "avons", "avez", "ont", "suis", "es", "est", "sommes", "êtes", "sont"]);
  const SKIP = new Set(["pas", "jamais", "rien", "plus", "bien", "déjà", "tout", "toujours", "encore", "vite", "aussi"]);
  const PART = new Set(["pris", "mis", "fait", "dit", "vu", "eu", "été", "venu", "venue", "parti", "partie", "partis", "revenu", "revenue", "devenu", "tenu", "compris", "appris", "ouvert", "écrit", "lu", "pu", "voulu", "su", "rendu", "perdu", "attendu", "entendu", "vendu", "répondu", "couru", "reçu", "cru", "bu", "dû", "suivi", "fini", "choisi", "réussi", "sorti", "dormi", "servi", "menti", "découvert", "offert", "mort", "né"]);
  const NOT_IMPARF = new Set(["mais", "jamais", "fait", "refait", "parfait", "satisfait", "français", "anglais", "palais", "frais", "plait", "plaît", "lait", "souhait", "trait", "portrait", "extrait", "retrait", "distrait", "abstrait", "désormais", "biais", "épais", "marais", "dais"]);
  function frWords(text) { return (text.toLowerCase().replace(/[’']/g, "' ").match(/[a-zàâäçéèêëîïôöùûüÿœæ]+'?/g) || []); }
  function hasNeg(ws) { return ws.some(w => w === "ne" || w === "n'") && ws.some(w => ["pas", "rien", "jamais", "plus", "personne"].includes(w)); }
  function hasImparfait(ws) { return ws.some(w => (["étions", "étiez", "avions", "aviez"].includes(w)) || (w.length >= 4 && /(ais|ait|aient)$/.test(w) && !NOT_IMPARF.has(w))); }
  function hasPasseCompose(ws) {
    for (let i = 0; i < ws.length - 1; i++) {
      if (!AUX.has(ws[i])) continue;
      let j = i + 1; while (j < ws.length && (SKIP.has(ws[j]) || ws[j] === "l'")) j++;
      const p = ws[j]; if (!p) continue;
      if (PART.has(p) || /(é|ée|és|ées)$/.test(p)) return true;
    }
    return false;
  }
  function hasTime(text) { const v = normAns(text); return /\b\d{1,2} ?h\b|\b\d{1,2} ?heures?\b/.test(v) || ["heure", "heures", "midi", "minuit", "matin", "soir", "apres midi", "aujourd hui", "quart", "demie", "minutes"].some(k => (" " + v + " ").includes(" " + k + " ")); }
  const CHECKS = {
    /* G04b: eine echte Frage mit Fragewort am Anfang */
    question(text, T) {
      const t = text.trim(), v = normAns(t), ws = v.split(" ");
      if (/^est ce que\b/.test(v) || /^est ce qu\b/.test(v)) return T.msgs.estce;
      const Q = ["quand", "ou", "pourquoi", "comment", "combien", "qui", "que", "qu", "quoi", "quel", "quelle", "quels", "quelles", "lequel", "laquelle"];
      const PREP = ["a", "de", "jusqu", "avec", "pour", "depuis", "dans", "chez", "en", "par"];
      const okStart = Q.includes(ws[0]) || (PREP.includes(ws[0]) && Q.includes(ws[1])) || (ws[0] === "jusqu" && ws[1] === "a" && Q.includes(ws[2]));
      if (!okStart) return T.msgs.start;
      if (!/\?\s*$/.test(t)) return T.msgs.mark;
      return null;
    },
    /* F06: Ort, Stelle im Kaufhaus und Zeitangabe */
    message(text, T) {
      const v = normAns(text), has = list => list.some(k => (" " + v + " ").includes(" " + normAns(k) + " ") || (" " + v + " ").includes(" " + normAns(k)));
      if (has(["notre dame"]) && !has(T.place)) return T.msgs.notreDame;
      if (!has(T.place)) return T.msgs.place;
      if (!has(T.spot)) return T.msgs.spot;
      if (!has(T.time) && !/\bdans \w+ minutes?\b/.test(v) && !/\b\d{1,2} ?h\b/.test(v)) return T.msgs.time;
      return null;
    },
    /* F09: imparfait, passé composé, Verneinung, Zeitangabe */
    rapport(text, T) {
      const ws = frWords(text);
      if (!hasImparfait(ws)) return T.msgs.imparfait;
      if (!hasPasseCompose(ws)) return T.msgs.pc;
      if (!hasNeg(ws)) return T.msgs.neg;
      if (!hasTime(text)) return T.msgs.time;
      return null;
    },
    /* Z01: Warnung mit Verneinung, zum Thema, an eine Dame mit vous */
    warn(text, T) {
      const ws = frWords(text), v = normAns(text), t = v.split(" ");
      if (!hasNeg(ws)) return T.msgs.neg;
      if (!T.topicWords.some(k => hasWord(v, k))) return T.msgs.topic;
      /* Imperativ mit tu (« ne paie pas ») statt vous; « il ne donne pas » ist kein Imperativ */
      const SUBJ = ["je", "tu", "il", "elle", "on", "qui", "ce", "ca"];
      if (t.some((w, i) => (w === "ne" || w === "n") && ["paie", "paye", "donne", "suis", "ecoute", "crois", "va", "achete"].includes(t[i + 1]) && !SUBJ.includes(t[i - 1]))) return T.msgs.tu;
      return null;
    }
  };

  /* Abfrage: Antworten tippen (aus dem Gedächtnis oder vom eigenen Blatt) */
  function oneEdit(a, b) {   // höchstens ein Buchstabe falsch, zu viel oder zu wenig
    if (a === b) return true;
    if (Math.abs(a.length - b.length) > 1) return false;
    let i = 0, j = 0, d = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { i++; j++; continue; }
      if (++d > 1) return false;
      if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; }
    }
    return d + (a.length - i) + (b.length - j) <= 1;
  }
  function answerOk(f, raw) {
    const v = normAns(raw); if (!v) return false;
    if (f.digits) { const d = v.replace(/\D/g, ""); return (f.answers || []).some(a => String(a).replace(/\D/g, "") === d); }
    if (f.times && /\d/.test(v)) return f.times.includes(v.replace(/\D/g, ""));   // Uhrzeit in Ziffern: 11 h 45, 11:45, 11h45
    if ((f.answers || []).some(a => normAns(a) === v)) return true;
    if ((f.traps || []).some(t => answerOk(t, raw))) return false;   // Fallen vor den Schlüsselwörtern
    if (!/\d/.test(v) && (f.answers || []).some(a => { const na = normAns(a); return na.length >= 5 && !/\d/.test(na) && oneEdit(na, v); })) return true;
    if (f.keywords) return f.keywords.some(g => g.every(k => hasWord(v, k)));
    return false;
  }
  TASKS.recall = function (T, area, api) {
    const inputs = [];
    const mk = f => {
      const inp = el("input", "rin"); inp.type = "text"; inp.autocomplete = "off"; inp.spellcheck = false; inp.size = f.size || 14; inp.placeholder = f.placeholder || "…"; inp.dataset.id = f.id;
      inp.setAttribute("autocorrect", "off"); inp.setAttribute("autocapitalize", "none"); if (f.digits) inp.inputMode = "tel";
      inputs.push({ f, inp, wrongs: 0 }); return inp;
    };
    (T.fields || []).forEach(f => { const row = el("div", "rfield"); row.appendChild(el("label", "", gl(f.label))); row.appendChild(mk(f)); area.appendChild(row); });
    area.appendChild(el("p", "hint", esc(G.ui.recall.intro)));
    const bar = el("div", "bar");
    const b = el("button", "btn primary", esc(G.ui.recall.check));
    b.addEventListener("click", () => {
      if (api.locked()) return;
      if (inputs.some(x => !normAns(x.inp.value))) { api.feedback({ who: "lino", fr: G.ui.recall.empty }, false); return; }
      let ok = true; const hints = []; let trap = null;
      inputs.forEach(x => {
        const good = answerOk(x.f, x.inp.value); x.inp.classList.toggle("bad", !good); x.inp.classList.toggle("good", good);
        if (!good) {
          ok = false; x.wrongs++;
          const tr = (x.f.traps || []).find(t => answerOk(t, x.inp.value)); if (tr && !trap) trap = tr;   // Lesefalle: eigene Antwort der Figur
          if (x.wrongs >= 2 && x.f.where && !hints.includes(x.f.where)) hints.push(x.f.where);
        }
      });
      if (ok) { inputs.forEach(x => x.inp.disabled = true); b.disabled = true; api.complete({ text: inputs.map(x => x.inp.value.trim()).join(" | ") }, T.success); return; }
      api.wrong({ who: (trap && trap.who) || T.who || "lino", fr: (trap ? trap.fr : (T.wrongText || G.ui.recall.wrong)) + (hints.length ? " " + hints.join(" ") : "") });
    });
    bar.appendChild(b);
    if (T.leave !== false) {
      const l = el("button", "btn keep", esc(G.ui.recall.later));   // „keep“: bleibt auch in der Pause nutzbar, zum Nachsehen
      l.addEventListener("click", () => { closeModal(); S.resume = null; save(); showLines(T.leaveLines || [{ who: "lino", fr: G.ui.recall.unknown }]); });
      bar.appendChild(l);
    }
    area.appendChild(bar);
    inputs.forEach(x => x.inp.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); b.click(); } }));
    if (!TOUCH) setTimeout(() => inputs[0] && !inputs[0].inp.disabled && inputs[0].inp.focus(), 50);   // auf dem Handy würde die Tastatur die Frage verdecken
  };

  /* ---------- Bildlupe: zoomen (+/−, Mausrad, zwei Finger), verschieben (ziehen), Details antippen ---------- */
  /* Punkte in % des Bildes: { id, x, y, w, h } oder { id, rects: [...] }; need: gehört zur Lösung; minZoom: erst ab dieser Zoomstufe;
     ok (bei mode "pick"): die richtige Wahl; line: Reaktion; flag: wird gesetzt. side: "front"/"back" bei der Karte. */
  function inRect(r, px, py) { return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h; }
  function rectsOf(p) { return p.rects || [p]; }
  function areaOf(p) { return rectsOf(p).reduce((a, r) => a + r.w * r.h, 0); }
  function zoomView(frame, lz, opts) {
    const MAXZ = opts.max || 4;
    let s = 1, tx = 0, ty = 0;
    const ptrs = new Map(); let start = null, pinch = null, moved = false;
    function clamp() { const w = frame.clientWidth, h = frame.clientHeight; tx = Math.min(0, Math.max(w - w * s, tx)); ty = Math.min(0, Math.max(h - h * s, ty)); }
    function apply() { clamp(); lz.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + s + ")"; if (opts.onZoom) opts.onZoom(s); }
    function zoomAt(ns, cx, cy) { ns = Math.max(1, Math.min(MAXZ, ns)); const k = ns / s; tx = cx - (cx - tx) * k; ty = cy - (cy - ty) * k; s = ns; apply(); }
    function center(ns) { zoomAt(ns, frame.clientWidth / 2, frame.clientHeight / 2); }
    const dist = () => { const p = Array.from(ptrs.values()); return Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) || 1; };
    const mid = () => { const p = Array.from(ptrs.values()), r = frame.getBoundingClientRect(); return { x: (p[0].x + p[1].x) / 2 - r.left, y: (p[0].y + p[1].y) / 2 - r.top }; };
    frame.addEventListener("pointerdown", e => {
      if (e.target.closest(".nozoom")) return;
      try { frame.setPointerCapture(e.pointerId); } catch (x) { /* ältere Browser */ }
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (ptrs.size === 1) { start = { x: e.clientX, y: e.clientY, t: Date.now(), tx, ty }; moved = false; }
      if (ptrs.size === 2) { pinch = { d: dist(), s }; moved = true; }
    });
    frame.addEventListener("pointermove", e => {
      if (!ptrs.has(e.pointerId)) return;
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch && ptrs.size >= 2) { const m = mid(); zoomAt(pinch.s * dist() / pinch.d, m.x, m.y); return; }
      if (start && ptrs.size === 1) {
        const dx = e.clientX - start.x, dy = e.clientY - start.y;
        if (Math.abs(dx) + Math.abs(dy) > 8) moved = true;
        if (moved && s > 1) { tx = start.tx + dx; ty = start.ty + dy; apply(); }
      }
    });
    const up = e => {
      if (!ptrs.has(e.pointerId)) return;
      const wasSingle = ptrs.size === 1;
      ptrs.delete(e.pointerId);
      if (ptrs.size < 2) pinch = null;
      if (wasSingle && start && !moved && Date.now() - start.t < 800 && e.type === "pointerup") {
        const r = frame.getBoundingClientRect();
        const px = ((e.clientX - r.left - tx) / s) / r.width * 100, py = ((e.clientY - r.top - ty) / s) / r.height * 100;
        opts.onTap(px, py, s);
      }
      if (!ptrs.size) start = null;
    };
    frame.addEventListener("pointerup", up); frame.addEventListener("pointercancel", up);
    frame.addEventListener("wheel", e => { e.preventDefault(); const r = frame.getBoundingClientRect(); zoomAt(s * (e.deltaY < 0 ? 1.25 : 0.8), e.clientX - r.left, e.clientY - r.top); }, { passive: false });
    window.addEventListener("resize", apply);
    return { zoomIn: () => center(s * 1.5), zoomOut: () => center(s / 1.5), reset: () => { s = 1; tx = 0; ty = 0; apply(); }, scale: () => s, apply };
  }
  TASKS.loupe = function (T, area, api) {
    const found = new Set();
    const need = T.points.filter(p => p.need);
    const frame = el("div", "loupe"), lz = el("div", "lz");
    frame.appendChild(lz);
    let side = "front";
    if (T.render) {
      frame.style.setProperty("--ar", T.ar || 1.6);
      lz.appendChild(RENDER[T.render]({ loupe: true, onPeel: () => act("peel"), onFlip: f => { side = f ? "back" : "front"; if (f) act("flip"); } }));
    } else {
      frame.style.setProperty("--ar", T.ar || 1.333);
      lz.appendChild(docImg(T.img, ar => frame.style.setProperty("--ar", ar.toFixed(4))));
    }
    const marks = el("div", "lmarks"); lz.appendChild(marks);
    (T.labels || []).forEach(l => {
      const d = el("div", "llabel" + (l.cls ? " " + l.cls : ""), esc(l.text));
      d.style.left = l.x + "%"; d.style.top = l.y + "%"; if (l.size) d.style.fontSize = l.size;
      if (l.minZoom) { d.dataset.minZoom = l.minZoom; d.hidden = true; }
      lz.appendChild(d);
    });
    api.st.material = () => { $$(".lmat", lz).forEach(x => x.remove()); (T.material || []).forEach(r => { const m = el("div", "lmat"); m.style.left = r.x + "%"; m.style.top = r.y + "%"; m.style.width = r.w + "%"; m.style.height = r.h + "%"; lz.appendChild(m); }); };
    const status = el("div", "lstatus");
    const chips = el("div", "lfound");
    function upd() {
      if (T.mode === "pick") { status.textContent = T.status || ""; return; }
      status.textContent = fmtTpl(T.status || G.ui.loupe.found, { n: need.filter(p => found.has(p.id)).length, m: need.length });
      chips.innerHTML = "";
      T.points.filter(p => found.has(p.id) && p.chip).forEach(p => chips.appendChild(el("span", "chip-found" + (p.need ? "" : " extra"), "✓ " + esc(p.chip))));
    }
    function mark(p, good) {
      rectsOf(p).slice(0, 1).forEach(r => { const m = el("div", "lmark" + (good === false ? " no" : "")); m.style.left = (r.x + r.w / 2) + "%"; m.style.top = (r.y + r.h / 2) + "%"; m.style.width = Math.max(4, Math.min(r.w, 14)) + "%"; m.dataset.side = p.side || ""; marks.appendChild(m); });
      syncSide();
    }
    function syncSide() { $$(".lmark", marks).forEach(m => { m.hidden = !!m.dataset.side && m.dataset.side !== side; }); }
    function solved() { return need.every(q => found.has(q.id)); }
    function foundPoint(p) {
      if (p.neutral) { api.hit(); api.feedback(p.line, true); return; }
      if (found.has(p.id)) { api.feedback(p.line, true); return; }
      found.add(p.id); api.hit();
      if (p.flag) setFlag(p.flag);
      if (p.need || p.chip) mark(p);
      (p.also || []).forEach(id => { const q = T.points.find(x => x.id === id); if (q && !found.has(id)) { found.add(id); if (q.need || q.chip) mark(q); } });
      upd();
      if (solved()) api.complete({ text: Array.from(found).join(" ") }, p.line);
      else api.feedback(p.line, true);
    }
    /* Handgriffe an der Karte: Aufkleber abziehen, Karte umdrehen */
    function act(kind) {
      syncSide();
      const p = T.points.find(q => q.action === kind);
      if (p && !api.locked() && !area.classList.contains("solved")) foundPoint(p);
    }
    const zv = zoomView(frame, lz, {
      max: T.maxZoom || 4,
      onZoom: s => {
        $$(".llabel[data-min-zoom]", lz).forEach(d => { d.hidden = s < +d.dataset.minZoom - 0.01; });
        zl.textContent = Math.round(s * 100) + " %";
      },
      onTap: (px, py, s) => {
        if (api.locked() || area.classList.contains("solved")) return;
        const hits = T.points.filter(p => !p.action && (!p.side || p.side === side) && (!p.onlyIf || cond(p.onlyIf)) && (!p.minZoom || s >= p.minZoom - 0.01) && rectsOf(p).some(r => inRect(r, px, py))).sort((a, b) => areaOf(a) - areaOf(b));
        const p = hits[0];
        if (!p) { api.miss(); return; }
        if (T.mode === "pick" && !p.neutral) {
          if (p.ok) { found.add(p.id); mark(p); api.complete({ text: p.id }, p.line); }
          else { mark(p, false); api.soft(p.line); }
          return;
        }
        foundPoint(p);
      }
    });
    const ctl = el("div", "lctl");
    const bOut = el("button", "btn small keep", "−"), bIn = el("button", "btn small keep", "+"), bRe = el("button", "btn small keep", esc(G.ui.loupe.reset));
    const zl = el("span", "lzoom", "100 %");
    bOut.setAttribute("aria-label", G.ui.loupe.out); bIn.setAttribute("aria-label", G.ui.loupe.in);
    bOut.addEventListener("click", zv.zoomOut); bIn.addEventListener("click", zv.zoomIn); bRe.addEventListener("click", zv.reset);
    ctl.appendChild(bOut); ctl.appendChild(zl); ctl.appendChild(bIn); ctl.appendChild(bRe);
    if (T.render === "card") {
      const flip = el("button", "btn small keep", esc(G.ui.card.flip));
      flip.addEventListener("click", () => { const c = $(".gcard", lz); if (c) c.dispatchEvent(new CustomEvent("flip")); });
      ctl.appendChild(flip);
    }
    area.appendChild(el("p", "hint", esc(TOUCH ? G.ui.loupe.hintTouch : G.ui.loupe.hint)));
    area.appendChild(frame); area.appendChild(ctl); area.appendChild(status); area.appendChild(chips);
    upd();
  };

  /* ---------- Beobachtungsszene: Bilder in Schleife, drei Dinge finden, die nicht passen ---------- */
  TASKS.observe = function (T, area, api) {
    const frame = el("div", "observe");
    frame.style.setProperty("--ar", T.ar || 1.7778);
    const imgs = T.frames.map((f, i) => { const im = docImg(f); im.classList.add("oframe"); im.hidden = i > 0; frame.appendChild(im); return im; });
    const bubble = el("div", "obubble"); bubble.hidden = true; frame.appendChild(bubble);
    const ringP = T.points.find(p => p.ring);
    const ring = el("div", "oring", "♪ dring ♪"); ring.hidden = true; frame.appendChild(ring);
    if (ringP) { const r = rectsOf(ringP)[0]; ring.style.left = (r.x + r.w / 2) + "%"; ring.style.top = r.y + "%"; }
    const marks = el("div", "lmarks"); frame.appendChild(marks);
    api.st.material = () => { $$(".lmat", frame).forEach(x => x.remove()); (T.material || []).forEach(r => { const m = el("div", "lmat"); m.style.left = r.x + "%"; m.style.top = r.y + "%"; m.style.width = r.w + "%"; m.style.height = r.h + "%"; frame.appendChild(m); }); };
    const found = new Set(), need = T.points.filter(p => p.need);
    let fi = 0, loops = 0, tFrame = Date.now(), cups = 0, hinted = false;
    const status = el("div", "lstatus");
    const chips = el("div", "lfound");
    function upd() {
      status.textContent = fmtTpl(G.ui.loupe.odd, { n: need.filter(p => found.has(p.id)).length, m: need.length });
      chips.innerHTML = ""; need.filter(p => found.has(p.id)).forEach(p => chips.appendChild(el("span", "chip-found", "✓ " + esc(p.chip))));
    }
    function show(i) {
      imgs.forEach((im, k) => { im.hidden = k !== i; });
      const c = (T.captions || [])[i];
      bubble.hidden = !c; if (c) { bubble.textContent = c.fr; bubble.style.left = c.x + "%"; bubble.style.top = c.y + "%"; }
    }
    const active = p => (!p.after || p.after.every(a => found.has(a))) && (!p.frames || p.frames.includes(fi + 1) || (T.grace && p.frames.includes(((fi + T.frames.length - 1) % T.frames.length) + 1) && Date.now() - tFrame < T.grace));
    function ringing() { ring.hidden = !(ringP && active(ringP) && !found.has(ringP.id)); }
    const timer = setInterval(() => {
      if (!frame.isConnected) { clearInterval(timer); return; }
      if (api.locked() || area.classList.contains("solved")) return;
      fi = (fi + 1) % T.frames.length; tFrame = Date.now();
      if (fi === 0) { loops++; if (loops >= 3 && !hinted && T.loopHint && !found.has(T.loopHint.point)) { hinted = true; api.note(T.loopHint.line); } }
      show(fi);
    }, PROF && QS.get("fast") ? 600 : T.dur);
    frame.addEventListener("pointerup", e => {
      if (api.locked() || area.classList.contains("solved")) return;
      const r = frame.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width * 100, py = (e.clientY - r.top) / r.height * 100;
      const p = T.points.filter(q => active(q) && rectsOf(q).some(x => inRect(x, px, py))).sort((a, b) => areaOf(a) - areaOf(b))[0];
      if (!p) { api.miss(); return; }
      if (p.cups) { api.hit(); api.soft(T.cupsLines[cups++ % T.cupsLines.length]); return; }
      if (p.neutral) { api.hit(); api.feedback(p.line, true); return; }
      if (found.has(p.id)) { api.feedback(p.line, true); return; }
      found.add(p.id); api.hit();
      const m = el("div", "lmark"); const rr = rectsOf(p)[0]; m.style.left = (rr.x + rr.w / 2) + "%"; m.style.top = (rr.y + rr.h / 2) + "%"; m.style.width = Math.min(rr.w, 12) + "%"; marks.appendChild(m);
      upd(); ringing();
      if (need.every(q => found.has(q.id))) { clearInterval(timer); ring.hidden = true; api.complete({ text: Array.from(found).join(" ") }, p.line); }
      else api.feedback(p.line, true);
    });
    const ringT = setInterval(() => { if (frame.isConnected) ringing(); else clearInterval(ringT); }, 500);
    area.appendChild(el("p", "hint", esc(G.ui.loupe.observeHint)));
    area.appendChild(frame); area.appendChild(status); area.appendChild(chips);
    show(0); upd();
  };

  /* ---------- Gezeichnete Dokumente: Ausweis, Karte mit Aufkleber ---------- */
  const RENDER = {
    badge() {
      const B = G.docs.badge;
      const d = el("div", "gbadge");
      d.appendChild(el("div", "gb-head", gl(B.head)));
      d.appendChild(el("div", "gb-sub", gl(B.sub)));
      const row = el("div", "gb-row");
      const ph = el("div", "gb-photo"); ph.appendChild(portrait("beaumont")); row.appendChild(ph);
      const f = el("div", "gb-fields");
      B.fields.forEach((x, i) => f.appendChild(el("div", "gb-f" + (i === B.fields.length - 1 ? " mat" : ""), gl(x))));
      row.appendChild(f); d.appendChild(row);
      return d;
    },
    /* Die „Eintrittskarte“: vorn ein Aufkleber über einem Rabattgutschein, hinten ein Stempel. Den Aufkleber zieht man an der Ecke ab. */
    card(o) {
      o = o || {};
      const C = G.docs.card;
      const peeled = S && flag("carte_peeled");
      const c = el("div", "gcard" + (peeled ? " peeled" : ""));
      c.style.setProperty("--p", peeled ? 100 : 0);
      c.innerHTML =
        '<div class="gc-inner"><div class="gc-front">' +
          '<div class="gc-print"><div class="gc-r1">' + gl(C.under[0]) + '</div><div class="gc-r2">' + gl(C.under[1]) + '</div><div class="gc-r3">' + gl(C.under[2]) + '</div><div class="gc-logo"></div></div>' +
          '<div class="gc-sticker"><svg class="gc-umb" viewBox="0 0 40 40" aria-hidden="true"><path d="M4 20a16 16 0 0 1 32 0z" fill="#c0392b"/><path d="M20 20v12a3 3 0 0 1-6 0" stroke="#5a3a1a" stroke-width="2" fill="none"/></svg>' +
            '<div class="gc-s1">' + esc(C.sticker[0]) + '</div><div class="gc-s2">' + esc(C.sticker[1]) + "</div></div>" +
          '<div class="gc-flap"></div><div class="gc-corner nozoom" title="' + esc(G.ui.card.corner) + '"></div>' +
          '<div class="gc-num">' + esc(C.number) + "</div>" +
        '</div><div class="gc-back"><div class="gc-lines"></div><div class="gc-stamp">' + gl(C.stamp) + "</div></div></div>";
      const corner = $(".gc-corner", c);
      let flipped = false;
      c.addEventListener("flip", () => { flipped = !flipped; c.classList.toggle("flipped", flipped); if (o.onFlip) o.onFlip(flipped); });
      if (!o.loupe) {
        const wrap = el("div", "gcard-wrap"); wrap.appendChild(c);
        const fb = el("button", "btn small", esc(G.ui.card.flip)); fb.addEventListener("click", () => c.dispatchEvent(new CustomEvent("flip")));
        const bar = el("div", "bar"); bar.appendChild(fb); wrap.appendChild(bar);
        return wrap;
      }
      /* Ecke ziehen: der Aufkleber löst sich bis zur Hälfte (Diagonale); loslassen unter der Hälfte → er klebt wieder */
      let drag = null, p = peeled ? 100 : 0;
      const setP = v => { p = Math.max(0, Math.min(100, v)); c.style.setProperty("--p", p); };
      corner.addEventListener("pointerdown", e => {
        if (flag("carte_peeled") || flipped) return;
        e.stopPropagation(); e.preventDefault();
        try { corner.setPointerCapture(e.pointerId); } catch (x) { /* egal */ }
        drag = { x: e.clientX, y: e.clientY, w: c.getBoundingClientRect().width, h: c.getBoundingClientRect().height, moved: false };
        c.classList.add("dragging");
      });
      corner.addEventListener("pointermove", e => {
        if (!drag) return;
        const dx = drag.x - e.clientX, dy = e.clientY - drag.y;
        if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
        setP(((dx / drag.w) + (dy / drag.h)) * 100);
      });
      const end = () => {
        if (!drag) return;
        c.classList.remove("dragging");
        const tapped = !drag.moved; drag = null;
        if (tapped) { setP(14); setTimeout(() => { if (!flag("carte_peeled")) setP(0); }, 500); return; }   // nur angetippt: die Ecke hebt sich kurz
        if (p >= 45) { setP(100); c.classList.add("peeled"); setFlag("carte_peeled"); if (o.onPeel) o.onPeel(); }
        else setP(0);
      };
      corner.addEventListener("pointerup", end); corner.addEventListener("pointercancel", end);
      return c;
    }
  };

  /* ---------- Ende ---------- */
  function runEnd(finish) {
    S.finished = true; setFlag("finished"); finish();
    const body = openModal("end nocl");
    body.appendChild(el("h2", "", esc(G.ui.end)));
    const mins = Math.round((Date.now() - S.started) / 60000);
    const helps = Object.values(S.helpUsed).reduce((a, b) => a + b, 0);
    body.appendChild(el("div", "paper", "<b>" + esc(pname(0)) + (twoPlayers() ? " & " + esc(pname(1)) : "") + "</b><br>" + esc(fmtTpl(G.ui.endStats, { places: S.visited.length, helps, mins, q: solvedCount() }))));
    body.appendChild(el("p", "", esc(G.ui.endExport)));
    if (G.credits) body.appendChild(el("div", "credits", "<b>" + esc(G.credits.title) + "</b><br>" + G.credits.lines.map(esc).join("<br>")));
    const bar = el("div", "bar");
    const ex = el("button", "btn primary", esc(G.ui.btn.exporter)); ex.addEventListener("click", exportAll); bar.appendChild(ex);
    const ca = el("button", "btn", esc(G.ui.btn.carnet)); ca.addEventListener("click", () => openCarnet()); bar.appendChild(ca);
    const mn = el("button", "btn", esc(G.ui.btn.menu)); mn.addEventListener("click", goMenu); bar.appendChild(mn);
    const nw = el("button", "btn", esc(G.ui.btn.nouvelle)); nw.addEventListener("click", () => { if (confirm(G.ui.confirmNew)) { archiveRun(); localStorage.removeItem(SAVE_KEY); if (HUB) location.href = hubUrl("menu=2"); else location.reload(); } }); bar.appendChild(nw);
    body.appendChild(bar);
    archiveRun();
  }
  function archiveRun() {
    try {
      const all = JSON.parse(localStorage.getItem(RESULTS_KEY) || "[]");
      const idx = all.findIndex(r => r.started === S.started);
      const row = { started: S.started, players: S.players, diag: S.diag, finished: S.finished, helpUsed: S.helpUsed };
      if (idx >= 0) all[idx] = row; else all.push(row);
      localStorage.setItem(RESULTS_KEY, JSON.stringify(all));
    } catch (e) { /* ignore */ }
  }

  /* ---------- Export ---------- */
  function download(name, text, type) {
    const blob = new Blob([text], { type: type || "text/plain;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function csvRows(diag) {
    const head = ["Datum", "Joueur", "Kennung", "Aufgabe", "Ergebnis", "Versuche", "Hilfestufe", "Wiederholungen", "Transkript", "Dauer_s", "Pausen", "Tempobremse", "Fehlklicks", "Erstwahl", "Text"];
    const q = v => '"' + String(v === undefined || v === null ? "" : v).replace(/"/g, '""') + '"';
    const rows = diag.map(r => [r.date, r.player, r.id, G.diag[r.id] || "", r.result, r.attempts, r.help, r.replays, r.transcript === undefined ? "" : (r.transcript ? "ja" : "nein"), r.duration, r.pauses, r.tempo, r.misses, r.first, r.text].map(q).join(";"));
    return "﻿" + head.join(";") + "\n" + rows.join("\n");
  }
  function exportAll() {
    const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
    const base = "guide-fantome_" + (pname(0) + (twoPlayers() ? "_" + pname(1) : "")).replace(/[^A-Za-z0-9À-ÿ_-]+/g, "_") + "_" + stamp;
    const json = JSON.stringify(S, null, 2), csv = csvRows(S.diag);
    const both = () => {
      download(base + ".json", json, "application/json");
      setTimeout(() => download(base + ".csv", csv, "text/csv;charset=utf-8"), 400);
      toast("Export : " + base + ".json / .csv");
    };
    // Handy-Browser laden oft nur eine von zwei Dateien herunter; das Teilen-Menü nimmt beide
    let files = null;
    try { files = [new File([json], base + ".json", { type: "application/json" }), new File([csv], base + ".csv", { type: "text/csv" })]; } catch (e) { files = null; }
    if (TOUCH && files && navigator.canShare && navigator.canShare({ files })) {
      navigator.share({ files, title: G.ui.title + " – " + pname(0) }).then(() => toast("Export : " + base)).catch(e => { if (!e || e.name !== "AbortError") both(); });
      return;
    }
    both();
  }

  /* ---------- Carnet: die vier Fragen (mit Antwort, sobald geklärt) und die eigenen Texte ---------- */
  function openCarnet(keep) {
    const body = openModal("carnet", keep);
    body.appendChild(el("h2", "", esc(G.ui.carnet.title)));
    QIDS.forEach(q => {
      const Q = G.questions[q], done = cond(Q.done);
      const box = el("div", "qbox " + (done ? "proven" : ""));
      box.appendChild(el("div", "qtitle", "<b>" + q + "</b> " + gl(Q.title) + ' <span class="status">' + esc(done ? G.ui.carnet.done : G.ui.carnet.open) + "</span>"));
      if (done) box.appendChild(el("div", "qanswer", gl(lineText({ fr: Q.answer }))));
      body.appendChild(box);
    });
    body.appendChild(el("p", "hint", esc(G.ui.carnet.hint)));
    if (G.formules) {
      const got = G.formules.filter((f, k) => S.formules && S.formules[k]);
      const fb = el("div", "qbox formules");
      fb.appendChild(el("div", "qtitle", "<b>" + esc(G.ui.carnet.formules) + "</b> " + got.length + "/" + G.formules.length));
      fb.appendChild(el("div", "qanswer", got.length ? got.map(f => "« " + gl(f) + " »").join(" · ") : esc(G.ui.carnet.formulesHint)));
      body.appendChild(fb);
    }
    const cards = Object.keys(S.cards);
    if (cards.length) {
      body.appendChild(el("h3", "", esc(G.ui.carnet.cards)));
      cards.forEach(cid => { const n = G.nodes[cid]; S.cards[cid].forEach(c => body.appendChild(el("div", "paper small", "<b>" + esc(n.title) + " · " + esc(c.player) + "</b><br>" + esc(c.text)))); });
    }
    const bar = el("div", "bar");
    const ex = el("button", "btn", esc(G.ui.btn.exporter)); ex.addEventListener("click", exportAll); bar.appendChild(ex);
    const cl = el("button", "btn primary", esc(G.ui.btn.fermer)); cl.addEventListener("click", closeModal); bar.appendChild(cl);
    body.appendChild(bar);
  }

  /* ---------- Inventar ---------- */
  function itemPic(id) {
    const it = G.items[id];
    const pic = el("div", "ipic"); pic.textContent = it.emoji || "▪";
    loadFirst([IMG + "it_" + id + ".png", IMG + "it_" + id + ".jpg"], src => { pic.textContent = ""; pic.style.backgroundImage = "url(" + src + ")"; pic.classList.add("img"); });
    return pic;
  }
  function itemDesc(id) {
    const it = G.items[id];
    let d = it.desc2 && cond(it.desc2.if) ? it.desc2.text : it.desc;
    if (it.cards) (S.cards[it.cards] || []).forEach(c => { d += " " + c.text; });
    return d;
  }
  function openInventory() {
    const body = openModal("inv");
    body.appendChild(el("h2", "", esc(G.ui.inv.title)));
    const grid = el("div", "igrid");
    if (!S.inv.length) grid.appendChild(el("p", "", esc(G.ui.inv.empty)));
    const detail = el("div", "idetail"); detail.hidden = true;
    function showDetail(id) {
      const it = G.items[id];
      $$(".item", grid).forEach(t => t.classList.toggle("on", t.dataset.id === id));
      detail.hidden = false; detail.innerHTML = "";
      const head = el("div", "ihead"); head.appendChild(itemPic(id)); head.appendChild(el("div", "", "<b>" + esc(it.name) + "</b><div class=\"idesc\">" + gl(itemDesc(id)) + "</div>")); detail.appendChild(head);
      if (it.img) detail.appendChild(docImg(it.img));
      if (it.render) detail.appendChild(RENDER[it.render]({}));
      if (TOUCH) setTimeout(() => detail.scrollIntoView({ block: "nearest", behavior: "smooth" }), 50);
    }
    S.inv.forEach(id => {
      const it = G.items[id];
      const card = el("button", "item"); card.dataset.id = id;
      card.appendChild(itemPic(id)); card.appendChild(el("span", "iname", esc(it.name)));
      card.addEventListener("click", () => showDetail(id));
      grid.appendChild(card);
    });
    body.appendChild(grid); body.appendChild(detail);
    body.appendChild(el("p", "hint", esc(G.ui.inv.hint)));
    const bar = el("div", "bar"); const cl = el("button", "btn", esc(G.ui.btn.fermer)); cl.addEventListener("click", closeModal); bar.appendChild(cl); body.appendChild(bar);
  }

  /* ---------- Karte ---------- */
  function openMap() {
    const body = openModal("map");
    body.appendChild(el("h2", "", "Paris"));
    const wrap = el("div", "mapwrap");
    wrap.innerHTML = '<svg viewBox="0 0 100 74" class="paris" aria-label="' + esc(G.ui.btn.carte) + '">' +
      '<rect x="0" y="0" width="100" height="74" fill="#eef0e6"/>' +
      '<path d="M18 12 Q 50 2 86 12 Q 97 35 86 60 Q 50 72 16 60 Q 3 35 18 12 Z" fill="none" stroke="#b9b6a5" stroke-width="0.6" stroke-dasharray="1.5 1"/>' +
      '<path d="M0 50 C 10 54, 18 58, 26 52 S 38 40, 48 46 S 62 52, 74 47 S 90 44, 100 48" stroke="#9cc3d8" stroke-width="3.2" fill="none"/>' +
      '<ellipse cx="50" cy="48.5" rx="4.6" ry="1.4" fill="#cfe3d2" stroke="#9cc3d8" stroke-width="0.4"/>' +
      '</svg>';
    const svg = $("svg", wrap);
    G.map.places.forEach(p => {
      if (p.hideUntil && !cond(p.hideUntil)) return;
      const unlocked = cond(p.unlock);
      const done = p.done.every(f => flag(f));
      const pick = p.pick && flag(p.pick) && !S.visited.includes(p.id);   // in N08w gewählter Startort, bis man dort war
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "place " + (unlocked ? "open" : "locked") + (done ? " done" : "") + (S.scene === p.id ? " here" : "") + (p.optional ? " optional" : ""));
      const ly = p.labelAbove ? p.y - 6.4 : p.y + 6.2, qy = p.labelAbove ? p.y - 3.6 : p.y + 9.4;
      g.innerHTML = "<title>" + esc(p.label) + "</title>" + (pick ? '<circle class="pick" cx="' + p.x + '" cy="' + p.y + '" r="4.6"/>' : "") + '<circle cx="' + p.x + '" cy="' + p.y + '" r="3.2"/>' +
        (done ? '<text x="' + p.x + '" y="' + (p.y + 1.1) + '" class="chk" text-anchor="middle">✓</text>' : "") +
        '<text x="' + p.x + '" y="' + ly + '" text-anchor="middle" class="lbl">' + esc(p.short || p.label) + "</text>" +
        '<text x="' + p.x + '" y="' + qy + '" text-anchor="middle" class="q">' + esc(unlocked ? p.q : G.ui.locked) + "</text>";
      g.addEventListener("click", () => {
        if (!unlocked) { const m = [].concat(p.lockedMsg || []).find(x => typeof x === "string" || cond(x.if)); toast("Lino : " + (m ? (m.fr || m) : G.ui.lino.locked)); return; }
        closeModal(); travel(p.id);
      });
      svg.appendChild(g);
    });
    body.appendChild(wrap);
    body.appendChild(el("p", "hint", esc(G.ui.mapHint)));
    const bar = el("div", "bar"); const cl = el("button", "btn", esc(G.ui.btn.fermer)); cl.addEventListener("click", closeModal); bar.appendChild(cl); body.appendChild(bar);
  }

  function travel(sceneId) {
    if (sceneId === S.scene) { enterScene(sceneId, true); return; }
    S.travel++;
    S.from = S.scene;
    const lines = [];
    if (S.travel === 2) lines.push(...G.ui.travel);
    if (twoPlayers()) { S.mouse = 1 - S.mouse; lines.push({ who: "narrateur", fr: fmtTpl(G.ui.partner, { p1: pname(1 - S.mouse), p2: pname(S.mouse) }) }); }
    save();
    const body = openModal("travel nocl");
    body.appendChild(el("div", "metro", "<b>M</b> Métro…"));
    const box = el("div", "dlg-inline"); body.appendChild(box);
    const go = () => { closeModal(); enterScene(sceneId, true); };
    if (lines.length) showLines(lines, go, { box }); else setTimeout(go, 600);
  }

  /* ---------- Szene ---------- */
  function drawHotspots() {
    const sc = S && S.scene && G.scenes[S.scene]; if (!sc) return;
    $$(".hotspot", stage).forEach(h => h.remove());
    sc.hotspots.forEach(h => {
      if ((h.showIf && !cond(h.showIf)) || (h.hideIf && cond(h.hideIf))) return;
      const b = el("button", "hotspot", "<span>" + esc(h.label) + "</span>");
      b.style.left = h.x + "%"; b.style.top = h.y + "%"; b.style.width = h.w + "%"; b.style.height = h.h + "%";
      b.addEventListener("click", e => { e.stopPropagation(); verbMenu(h, b); });
      stage.appendChild(b);
    });
  }
  function enterScene(id, runEnter) {
    const sc = G.scenes[id];
    S.scene = id; if (!S.visited.includes(id)) S.visited.push(id); save();
    $("#start").hidden = true; $("#game").hidden = false;
    setBg(stage, sc.bg);
    $$(".nobg", stage).forEach(h => h.remove());
    drawHotspots();
    refreshTop();
    dlg.innerHTML = ""; dlg.classList.remove("active", "pending");
    if (runEnter) { const at = S.at[id]; goNode(at || resolve(sc.enter)); }
  }
  const ICONS = {
    regarder: '<path d="M2 11s3.5-5.5 9-5.5 9 5.5 9 5.5-3.5 5.5-9 5.5S2 11 2 11z"/><circle cx="11" cy="11" r="2.6"/>',
    parler: '<path d="M2.5 11c2.3-3.4 4.6-5 7-4.3.6.2 1.1.6 1.5 1.1.4-.5.9-.9 1.5-1.1 2.4-.7 4.7.9 7 4.3-2.3 3.2-5.1 4.8-8.5 4.8S4.8 14.2 2.5 11z"/><path d="M2.5 11c2.8.4 5.6.6 8.5.6s5.7-.2 8.5-.6"/>',
    ecouter: '<path d="M6.5 9a5 5 0 0 1 10 0c0 2.6-1.6 3.2-2.4 5-.7 1.6-1.2 3.5-3.4 3.5-1.6 0-2.4-.9-2.6-2"/><path d="M9.5 9a2 2 0 0 1 4 0c0 1.4-1.3 1.8-1.3 3"/>',
    lire: '<path d="M11 6C9 4.5 6 4 2.5 4.5v13C6 17 9 17.5 11 19c2-1.5 5-2 8.5-1.5v-13C16 4 13 4.5 11 6z"/><path d="M11 6v13"/>'
  };
  function verbIcon(v) { const d = ICONS[v]; return d ? '<svg class="vicon" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + "</svg>" : ""; }
  function verbMenu(h, btn) {
    $$(".verbs").forEach(v => v.remove());
    const m = el("div", "verbs");
    m.appendChild(el("div", "vtitle", esc(h.label)));
    m.addEventListener("click", e => e.stopPropagation());
    Object.keys(h.actions).forEach(v => {
      const b = el("button", "btn verb", verbIcon(v) + "<span>" + esc(G.ui.verbs[v] || v) + "</span>");
      b.addEventListener("click", e => { e.stopPropagation(); m.remove(); const node = resolve(h.actions[v]); if (node) goNode(node); });
      m.appendChild(b);
    });
    m.style.left = "0px"; m.style.top = "0px"; m.style.transform = "none";
    stage.appendChild(m);
    const sr = stage.getBoundingClientRect(), br = btn.getBoundingClientRect(), pad = 4;
    const x = br.left - sr.left + br.width / 2 - m.offsetWidth / 2, y = br.top - sr.top + br.height / 2 - m.offsetHeight / 2;
    m.style.left = Math.max(pad, Math.min(x, sr.width - m.offsetWidth - pad)) + "px";
    m.style.top = Math.max(pad, Math.min(y, sr.height - m.offsetHeight - pad)) + "px";
  }
  document.addEventListener("click", () => $$(".verbs").forEach(v => v.remove()));

  /* ---------- Offene Tore: Wer auf eine Antwort wartet, meldet sich im leeren Dialogfeld ---------- */
  function pendingGate() { return (G.pending || []).find(p => cond(p.if) && !flag(p.unless) && (!p.scene || p.scene === S.scene)); }
  let pendingShown = null;
  function checkPending() {
    if (!S || $("#game").hidden || !modal.hidden) return;
    const isPending = dlg.classList.contains("pending");
    if (dlg.classList.contains("active") && !isPending) return;
    const p = pendingGate(), key = p ? p.node : null;
    if (isPending && key === pendingShown) return;
    pendingShown = key;
    if (!p) { if (isPending) { dlg.innerHTML = ""; dlg.classList.remove("active", "pending"); } return; }
    dlg.innerHTML = ""; dlg.classList.add("active", "pending");
    dlg.appendChild(lineEl({ who: p.who, fr: p.fr, sms: p.sms }));
    const b = el("button", "btn primary", esc(G.ui.btn.repondre));
    b.addEventListener("click", () => { dlg.classList.remove("pending"); pendingShown = null; goNode(p.node); });
    const bar = el("div", "bar"); bar.appendChild(b); dlg.appendChild(bar);
  }
  setInterval(checkPending, 400);

  /* ---------- Lehrkraft-Ansicht ---------- */
  function openProf() {
    const body = openModal("prof");
    body.appendChild(el("h2", "", "Lehrkraft-Ansicht"));
    const bar = el("div", "bar");
    const unlock = el("button", "btn", "Tout débloquer"); unlock.addEventListener("click", () => { G.profUnlock.forEach(f => S.flags[f] = true); Object.keys(G.items).forEach(id => { if (!S.inv.includes(id)) S.inv.push(id); }); save(); refreshTop(); drawHotspots(); toast("Alles freigeschaltet"); }); bar.appendChild(unlock);
    const reset = el("button", "btn", "Spielstand löschen"); reset.addEventListener("click", () => { if (confirm("Spielstand auf diesem Gerät löschen?")) { localStorage.removeItem(SAVE_KEY); location.reload(); } }); bar.appendChild(reset);
    const exr = el("button", "btn", "Alle Ergebnisse (CSV)"); exr.addEventListener("click", () => { const all = JSON.parse(localStorage.getItem(RESULTS_KEY) || "[]"); download("guide-fantome_resultats.csv", csvRows(all.flatMap(r => r.diag)), "text/csv;charset=utf-8"); }); bar.appendChild(exr);
    body.appendChild(bar);
    body.appendChild(el("h3", "", "Sprung zu einem Knoten"));
    const jump = el("div", "jumps");
    const sceneOf = homeOf;
    Object.keys(G.nodes).forEach(id => { const n = G.nodes[id]; const b = el("button", "btn small", id + " <small>" + n.type + (n.title ? " · " + esc(n.title) : "") + "</small>"); b.addEventListener("click", () => { closeModal(); const sc = sceneOf(id); if (sc && S.scene !== sc) enterScene(sc, false); goNode(id); }); jump.appendChild(b); });
    body.appendChild(jump);
    body.appendChild(el("h3", "", "Lösungen"));
    body.appendChild(el("div", "paper small", ["<i>Die Antworten stehen im Spiel jedes Mal in anderer Reihenfolge.</i>"].concat(G.profSolutions.map(s => "<b>" + esc(s[0]) + "</b> " + esc(s[1]))).join("<br>")));
    body.appendChild(el("h3", "", "Abfragen im Spiel (Frage → erwartete Antwort · wo nachsehen)"));
    const rec = Object.keys(G.nodes).filter(id => G.nodes[id].type === "task" && G.nodes[id].task.kind === "recall");
    body.appendChild(el("div", "paper small", rec.map(id => {
      const T = G.nodes[id].task;
      return "<b>" + id + " · " + esc(G.nodes[id].title || "") + "</b> (" + esc(G.chars[T.who].name) + ")<br>" + esc(T.intro) + "<br>" + (T.fields || []).map(f => "– " + esc(f.label) + " → <b>" + esc((f.answers || [])[0] || "") + "</b>" + (f.where ? " · <i>" + esc(f.where) + "</i>" : "")).join("<br>");
    }).join("<br><br>")));
    body.appendChild(el("h3", "", "Transkripte"));
    Object.keys(G.audio).forEach(k => body.appendChild(el("div", "paper small", "<b>" + k + ".mp3 · " + esc(G.chars[G.audio[k].who].name) + "</b><br>" + esc(G.audio[k].text))));
    body.appendChild(el("h3", "", "Ergebnisse auf diesem Gerät"));
    body.appendChild(el("p", "hint", "⚡ = in weniger als fünf Sekunden gelöst · Pausen = Sperren nach Fehlversuchen · Tempo = Tempobremse (zu schnelle Fehlversuche oder Fehlklicks)"));
    const all = JSON.parse(localStorage.getItem(RESULTS_KEY) || "[]");
    const rows = all.flatMap(r => r.diag).concat(S.diag.filter(d => !all.some(r => r.started === S.started)));
    const tbl = el("table", "results");
    const v = x => esc(x === undefined || x === null ? "" : x);
    tbl.innerHTML = "<tr><th>Datum</th><th>Joueur</th><th>Kennung</th><th>Ergebnis</th><th>Versuche</th><th>Hilfe</th><th>Pausen</th><th>Tempo</th><th>Dauer</th><th>Text</th></tr>" + rows.map(r => "<tr><td>" + esc(r.date.slice(0, 16).replace("T", " ")) + "</td><td>" + esc(r.player) + "</td><td>" + esc(r.id) + "</td><td>" + esc(r.result) + "</td><td>" + v(r.attempts) + "</td><td>" + v(r.help) + "</td><td>" + v(r.pauses) + "</td><td>" + v(r.tempo) + "</td><td>" + v(r.duration) + (!r.count && r.duration !== undefined && r.duration < 5 ? " ⚡" : "") + "</td><td>" + esc((r.text || r.first || "").slice(0, 80)) + "</td></tr>").join("");
    body.appendChild(tbl);
    const b2 = el("div", "bar"); const cl = el("button", "btn primary", "Fermer"); cl.addEventListener("click", closeModal); b2.appendChild(cl); body.appendChild(b2);
  }

  /* ---------- Glossar-Liste ---------- */
  function openGlossary() {
    const body = openModal("gloss");
    body.appendChild(el("h2", "", esc(G.ui.btn.glossaire)));
    const t = el("table", "gl-table"); t.innerHTML = G.glossary.map(e => "<tr><td>" + esc(e[0]) + "</td><td>" + esc(e[1]) + "</td></tr>").join(""); body.appendChild(t);
    const bar = el("div", "bar"); const cl = el("button", "btn primary", esc(G.ui.btn.fermer)); cl.addEventListener("click", closeModal); bar.appendChild(cl); body.appendChild(bar);
  }

  /* ---------- Start ---------- */
  function hubUrl(q) {
    let h = null; try { h = sessionStorage.getItem("pg_home"); } catch (e) { /* privat */ }
    return (h || "../index.html") + "?" + q;
  }
  /* nur Adressen auf derselben Seite (auch file:// beim Offline-Paket) */
  function sameSite(h) {
    try { const u = new URL(h, location.href); if (u.protocol === location.protocol && u.host === location.host) return u.href.split(/[?#]/)[0]; } catch (e) { /* ungültig */ }
    return null;
  }
  function startNew() {
    if (S && S.diag && S.diag.length) archiveRun();   // alte Partie bleibt in den Ergebnissen auf diesem Gerät
    S = freshState();
    S.players = [$("#p1").value, $("#p2").value];
    save();
    $("#start").hidden = true; $("#game").hidden = false;
    enterScene(G.startScene, false);
    goNode(G.start);
  }
  function refreshResume() {
    const b = $("#btn-resume");
    if (!S) { b.hidden = true; return; }
    b.hidden = false; b.textContent = G.ui.btn.reprendre + " (" + pname(0) + (twoPlayers() ? " & " + pname(1) : "") + ")";
    $("#p1").value = S.players[0] || ""; $("#p2").value = S.players[1] || "";
  }
  function goMenu() {
    if (HUB) { save(); location.href = hubUrl("menu=2"); return; }   // gemeinsames Startmenü, Teil 2 gewählt
    closeModal(); $$(".verbs").forEach(v => v.remove()); $("#gltip").hidden = true;
    dlg.innerHTML = ""; dlg.classList.remove("active", "pending");
    save(); refreshResume();
    $("#game").hidden = true; $("#start").hidden = false;
  }
  function resumeGame() {
    $("#start").hidden = true; $("#game").hidden = false;
    enterScene(S.scene || G.startScene, false);
    if (S.resume) goNode(S.resume);
  }
  /* Vollbild geht auf dem iPhone nicht: dort erklärt der Knopf den Weg über den Home-Bildschirm */
  function showFullHelp() {
    const F = G.ui.full;
    const body = openModal("full");
    body.appendChild(el("h2", "", esc(F.title)));
    const p = el("div", "paper");
    if (/iPhone|iPod/.test(navigator.userAgent)) {
      p.appendChild(el("p", "", esc(F.ios)));
      const ol = el("ol"); F.iosSteps.forEach(s => ol.appendChild(el("li", "", esc(s)))); p.appendChild(ol);
      p.appendChild(el("p", "", esc(F.iosNote)));
    } else p.appendChild(el("p", "", esc(F.other)));
    body.appendChild(p);
    const bar = el("div", "bar"); const b = el("button", "btn primary", esc(G.ui.btn.fermer)); b.addEventListener("click", closeModal); bar.appendChild(b); body.appendChild(bar);
  }
  /* Handy: Vollbild-Knopf in der Kopfleiste und auf dem Startbildschirm (nicht in der installierten App); Hinweis, das Telefon zu drehen */
  function setupMobile() {
    const de = document.documentElement;
    const req = de.requestFullscreen || de.webkitRequestFullscreen;
    const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement;
    const fbs = [$("#btn-full"), $("#btn-full-start")].filter(Boolean);
    const mq = q => !!(window.matchMedia && matchMedia(q).matches);
    const app = navigator.standalone === true || mq("(display-mode: fullscreen)") || mq("(display-mode: standalone)");
    if (TOUCH && !app) {
      const F = G.ui.full, canFs = req && (document.fullscreenEnabled || document.webkitFullscreenEnabled);
      const mark = () => {
        const on = !!fsEl();
        fbs.forEach(fb => {
          fb.classList.toggle("on", on);
          $(".tl", fb).textContent = on ? F.exitShort : F.label;
          fb.title = on ? F.exit : F.label; fb.setAttribute("aria-label", fb.title);
          $("path", fb).setAttribute("d", on ? "M8 3v5H3M14 3v5h5M19 14h-5v5M3 14h5v5" : "M3 8V3h5M14 3h5v5M19 14v5h-5M8 19H3v-5");
        });
      };
      mark();
      document.addEventListener("fullscreenchange", mark); document.addEventListener("webkitfullscreenchange", mark);
      fbs.forEach(fb => {
        fb.hidden = false;
        fb.addEventListener("click", () => {
          if (!canFs) showFullHelp();
          else if (fsEl()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
          else { const r = req.call(de); if (r && r.catch) r.catch(() => {}); }
        });
      });
    }
    const HINT = "pp_rotate_hint";
    let seen = false; try { seen = !!localStorage.getItem(HINT); } catch (e) { /* privat */ }
    const rh = $("#rotate-hint");
    const dismiss = () => { rh.hidden = true; try { localStorage.setItem(HINT, "1"); } catch (e) { /* privat */ } };
    if (TOUCH && !seen) rh.hidden = false;
    $(".x", rh).addEventListener("click", dismiss);
    const land = window.matchMedia && matchMedia("(orientation: landscape)");
    if (land && land.addEventListener) land.addEventListener("change", () => { if (land.matches && !$("#game").hidden) dismiss(); });
  }
  function init() {
    const saved = loadSave();
    if (saved && saved.v === 1) { S = saved; refreshResume(); }
    if (HUB) {
      const home = QS.get("home") && sameSite(QS.get("home"));
      if (home) try { sessionStorage.setItem("pg_home", home); } catch (e) { /* privat */ }
      if (QS.has("go")) try { history.replaceState(null, "", location.pathname); } catch (e) { /* egal */ }
      // ohne Auftrag und ohne Spielstand (etwa ein alter Link): ins Startmenü, dort ist Teil 2 bis zum Schlüsselwort gesperrt
      if (QS.get("go") !== "new" && !S) { $("#start").hidden = true; location.replace(hubUrl("part=2")); return; }
    }
    $("#btn-resume").addEventListener("click", () => { if (S) resumeGame(); });
    $("#btn-menu").addEventListener("click", goMenu);
    $("#btn-start").addEventListener("click", () => { if (!$("#p1").value.trim()) { $("#p1").focus(); $("#p1").classList.add("bad"); return; } if (S && S.diag && S.diag.length && !confirm(G.ui.confirmReplace)) return; startNew(); });
    /* Solange eine Aufgabe, Zwischensequenz oder Fahrt offen ist, führt kein Knopf daran vorbei (auch nicht per Tastatur).
       Carnet und Karte gehen erst nach dem Auftakt auf. */
    const busy = () => !modal.hidden && modal.classList.contains("nocl");
    const opened = () => PROF || cond(G.openAfter);
    const notYet = () => toast("Lino : " + G.ui.lino.locked);
    $("#btn-carnet").addEventListener("click", () => { if (busy()) return; if (!opened()) notYet(); else openCarnet(); });
    $("#btn-map").addEventListener("click", () => { if (busy()) return; if (!opened()) notYet(); else if (!PROF && G.mapLock && cond(G.mapLock)) toast("Lino : " + G.ui.lino.finale); else openMap(); });
    $("#btn-inv").addEventListener("click", () => { if (!busy()) openInventory(); });
    $("#btn-gloss").addEventListener("click", () => { if (!busy()) openGlossary(); });
    setupMobile();
    if (PROF) { $("#btn-prof").hidden = false; $("#btn-prof").addEventListener("click", openProf); $("#node-id").hidden = false; }
    $("#title").textContent = G.ui.title; $("#subtitle").textContent = G.ui.subtitle;
    $("#ver").textContent = "v" + G.version + (PROF ? " · prof" : "");
    if (HUB) {   // Neue Partie mit den Namen aus dem Startmenü, sonst weiterspielen (auch nach Neuladen)
      if (QS.get("go") === "new") { $("#p1").value = QS.get("p1") || ""; $("#p2").value = QS.get("p2") || ""; startNew(); }
      else resumeGame();
    }
  }
  if (PROF || TEST) window.PP = { get S() { return S; }, goNode, enterScene, openMap, openCarnet, exportAll, flag, save, PROF, goMenu, setFlag };
  init();
})();
