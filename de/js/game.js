/* Automatisch erzeugt von tools/build_de.js aus js/game.js – nicht von Hand ändern. */
/* L'affaire du pain perdu – Spiel-Engine (vanilla JS, ohne Build) */
(function () {
  "use strict";
  const G = window.GAME;
  const $ = (sel, el) => (el || document).querySelector(sel);
  const $$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));
  const QS = new URLSearchParams(location.search);
  const PROF = QS.get("mode") === "prof" && !!(window.ppProf && window.ppProf.ask("Lehrkraft-Ansicht: Code eingeben"));
  const TEST = QS.get("test") === "1";   // nur für die automatischen Testdurchläufe (tools/playthrough.js)
  const TOUCH = window.matchMedia && matchMedia("(pointer: coarse)").matches;   // Handy oder Tablet
  const SAVE_KEY = "pp_de_save_v1", RESULTS_KEY = "pp_de_results_v1";

  /* ---------- Zustand ---------- */
  let S = null;
  function freshState() {
    return {
      v: 1, players: ["", ""], linoLang: "fr", mouse: 0, scene: null, resume: "S02",
      flags: {}, inv: Object.keys(G.items).filter(k => G.items[k].start), mission: "",
      diag: [], helpUsed: {}, replays: {}, transcripts: {}, travel: 0, started: Date.now(), visited: [], cards: {}, finished: false
    };
  }
  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* privat */ } }
  function loadSave() { try { const s = localStorage.getItem(SAVE_KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
  function flag(f) { return !!S.flags[f]; }
  function setFlag(f) { S.flags[f] = true; save(); }
  function cond(c) {
    if (!c || c === "always") return true;
    if (Array.isArray(c)) return c.every(cond);
    return flag(c);
  }
  function twoPlayers() { return !!(S.players[1] && S.players[1].trim()); }
  function pname(i) { return S.players[i] && S.players[i].trim() ? S.players[i].trim() : (i === 0 ? "Spieler 1" : "Spieler 2"); }

  /* ---------- Hilfen ---------- */
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
  function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function fmtTpl(t, map) { return t.replace(/\{(\w+)\}/g, (m, k) => map[k] !== undefined ? map[k] : m); }
  /* Freitext: Wörter zerlegen (auch l’ vom iPhone und œ) und nur echte Wörter zählen, kein Tastengeklimper */
  function tokens(t) {
    t = t.replace(/(\d)\s*h\b/gi, "$1h").replace(/\bM\./g, "Monsieur").replace(/-t-/gi, " ")   // 17 h, M. Nowak, a-t-il
      .replace(/\bz\.\s?B\./g, "zum Beispiel").replace(/\bd\.\s?h\./g, "das heißt");
    return t.match(/[A-Za-zÀ-ÿŒœÆæ0-9'’]+/g) || [];
  }
  function realWord(w) {
    if (/\d/.test(w) || /^[A-Za-zÀ-ÿ]{1,2}['’]$/.test(w)) return true;     // Zahlen und Uhrzeiten (17h, 10b); l' d' qu' allein
    const x = w.replace(/^['’]+|['’]+$/g, "");
    if (x.length === 1) return /^[aàyAÀY]$/.test(x);                       // à, a, y; sonst kein Wort aus einem Buchstaben
    if (/^[A-ZÄÖÜ]{2,4}$/.test(x) || /^(mme|mlle|dr|st|sms|hm+)$/i.test(x)) return true;   // Abkürzungen wie SMS, Mme
    return /[aeiouyäöüàâæéèêëîïôœùûÿ]/i.test(x) && !/(.)\1\1/i.test(x);       // mindestens ein Vokal, kein Buchstabe dreimal hintereinander
  }
  function words(t) { return tokens(t).filter(realWord).length; }

  /* Glossar */
  const GL = (function () {
    const forms = [];
    G.glossary.forEach((e, i) => {
      e[0].split(",").forEach(f => {
        let s = f.trim().replace(/\((m|f|éclair)\)/g, "").replace(/^(le |la |les |l')/, "").trim();
        if (s.length > 2) forms.push({ s, i });
      });
    });
    forms.sort((a, b) => b.s.length - a.s.length);
    const rx = new RegExp("(?<![A-Za-zÀ-ÿ])(" + forms.map(f => f.s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")(s|es)?(?![A-Za-zÀ-ÿ])", "gi");
    const idx = {}; forms.forEach(f => { idx[f.s.toLowerCase()] = f.i; });
    return { mark(text) { return esc(text).replace(rx, (m, w, pl) => { const i = idx[w.toLowerCase()]; return i === undefined ? m : '<span class="gl" data-i="' + i + '">' + m + "</span>"; }); } };
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

  /* Bilder mit Fallback jpg -> png -> Farbe */
  function setBg(node, name) {
    node.style.backgroundImage = "";
    node.dataset.img = name;
    const tryLoad = (ext, next) => {
      const im = new Image();
      im.onload = () => { if (node.dataset.img !== name) return; node.style.backgroundImage = "url(../assets/img/" + name + "." + ext + ")"; node.style.aspectRatio = (im.naturalWidth / im.naturalHeight).toFixed(4); };
      im.onerror = () => next && next();
      im.src = "../assets/img/" + name + "." + ext;
    };
    tryLoad("jpg", () => tryLoad("png", () => { node.style.backgroundImage = "linear-gradient(160deg,#5b4636,#2d2420)"; if (node.id === "stage") { node.style.aspectRatio = "2.12"; const l = el("div", "nobg", esc(S && S.scene ? G.scenes[S.scene].name : "")); node.appendChild(l); } }));
  }
  function docImg(name) {
    const im = el("img", "docimg"); im.alt = ""; im.src = "../assets/img/" + name + ".jpg";
    im.onerror = () => { if (im.src.endsWith(".jpg")) im.src = "../assets/img/" + name + ".png"; else im.remove(); };
    return im;
  }
  function portrait(who) {
    const c = G.chars[who] || { name: who, initials: "?", color: "#777" };
    const p = el("div", "pt");
    p.style.backgroundColor = c.color;
    p.textContent = c.initials;
    if (c.pt) { const im = new Image(); im.onload = () => { p.textContent = ""; p.style.backgroundImage = "url(" + im.src + ")"; p.style.backgroundSize = "cover"; p.style.backgroundPosition = "center"; }; im.src = "../assets/img/" + c.pt + ".png"; }
    return p;
  }

  /* Audio mit Sprachsynthese-Fallback */
  let currentAudio = null, frVoice = null;
  function pickVoice() { const vs = speechSynthesis.getVoices(); frVoice = vs.find(v => /^de[-_]DE/i.test(v.lang)) || vs.find(v => /^de/i.test(v.lang)) || null; }
  if ("speechSynthesis" in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  function stopAudio() { if (currentAudio) { currentAudio.pause(); currentAudio = null; } if ("speechSynthesis" in window) speechSynthesis.cancel(); $$(".playing").forEach(e => e.classList.remove("playing")); }
  function playAudio(id, btn, onBlocked) {
    stopAudio();
    const a = G.audio[id];
    if (!a) return;
    S.replays[id] = (S.replays[id] || 0) + 1; save();
    if (btn) btn.classList.add("playing");
    const done = () => { if (btn) btn.classList.remove("playing"); };
    const tts = () => {
      if (!("speechSynthesis" in window)) { done(); return; }
      const u = new SpeechSynthesisUtterance(a.text);
      u.lang = "de-DE"; u.rate = 0.88; if (frVoice) u.voice = frVoice;
      u.onend = done; u.onerror = done;
      speechSynthesis.speak(u);
    };
    const au = new Audio("../assets/audio/" + id + ".mp3");
    currentAudio = au;
    au.onended = done;
    au.onerror = () => { if (currentAudio === au) { currentAudio = null; tts(); } };
    au.play().catch(err => {
      if (currentAudio !== au) return;
      currentAudio = null;
      // Handy-Browser spielen ohne Antippen nichts ab: dann wartet der Knopf, statt die Computerstimme zu starten
      if (err && err.name === "NotAllowedError") { S.replays[id]--; save(); done(); if (onBlocked) onBlocked(); return; }
      tts();
    });
  }

  /* ---------- Wirkungen (Flags, Gegenstände, Mission) ---------- */
  function addItem(id) { if (!S.inv.includes(id)) { S.inv.push(id); save(); toast("Inventar: " + G.items[id].name); } }
  function applyEffects(fx, key) {
    if (!fx) return;
    if (key) { if (S.flags["fx:" + key]) return; S.flags["fx:" + key] = true; }
    if (fx.item) addItem(fx.item);
    if (fx.items) fx.items.forEach(addItem);
    if (fx.removeItem) S.inv = S.inv.filter(i => i !== fx.removeItem);
    if (fx.flag) S.flags[fx.flag] = true;
    if (fx.flags) fx.flags.forEach(f => { S.flags[f] = true; });
    if (fx.mission) S.mission = fx.mission;
    save(); refreshTop();
    if (fx.flag || fx.flags) drawHotspots();   // z. B. Marcels Karte an der Tür erscheint sofort
  }

  /* ---------- Oberfläche: Grundelemente ---------- */
  const stage = $("#stage"), dlg = $("#dialogue"), modal = $("#modal"), modalBody = $("#modal-body");
  function toast(msg) { const box = $("#toasts"); while (box.children.length >= 2) box.firstChild.remove(); const t = el("div", "toast", esc(msg)); box.appendChild(t); setTimeout(() => t.remove(), 2600); }
  function refreshTop() {
    $("#scene-name").textContent = S && S.scene ? G.scenes[S.scene].name : "";
    if (S && S.scene) stage.dataset.name = G.scenes[S.scene].name;   // Hochformat: Ortsname auf dem Bild
    if (S && twoPlayers()) stage.dataset.mouse = G.ui.mouse + " " + pname(S.mouse); else delete stage.dataset.mouse;   // Hochformat: wer die Maus hat, auch auf dem Bild
    $("#mouse").innerHTML = S && twoPlayers() ? '<span class="ml">' + esc(G.ui.mouse) + "</span> " + esc(pname(S.mouse)) : "";
    $("#carnet-count").textContent = S && S.mission ? "!" : "";
  }
  function openModal(cls, keepDialogue) {
    modal.className = "modal " + (cls || "");
    modal.hidden = false; modalBody.innerHTML = "";
    if (!keepDialogue) dlg.classList.add("muted");
    return modalBody;
  }
  function closeModal() { modal.hidden = true; modalBody.innerHTML = ""; dlg.classList.remove("muted"); stopAudio(); }
  $("#modal-close").addEventListener("click", () => { if (!modal.classList.contains("nocl")) closeModal(); });

  /* Dialogzeilen nacheinander anzeigen */
  function showLines(lines, cb, opts) {
    opts = opts || {};
    const ls = (lines || []).filter(l => !l.onlyIf || flag(l.onlyIf));
    let i = 0;
    const box = opts.box || dlg;
    function step() {
      if (i >= ls.length) { if (opts.keep !== true) { box.innerHTML = ""; box.classList.remove("active"); } else { $$(".bar", box).forEach(b => b.remove()); } cb && cb(); return; }
      const l = ls[i++];
      renderLine(box, l, () => step(), i < ls.length || opts.lastLabel ? (i < ls.length ? G.ui.btn.continuer : opts.lastLabel) : G.ui.btn.continuer);
    }
    step();
  }
  function lineText(l) { return (l.who === "lino" && l.de && S.linoLang === "de") ? l.de : l.fr; }
  function renderLine(box, l, onNext, label) {
    box.innerHTML = ""; box.classList.add("active");
    const c = G.chars[l.who] || { name: l.who };
    const row = el("div", "line " + (l.who === "narrateur" ? "narr" : ""));
    if (l.who !== "narrateur") row.appendChild(portrait(l.who));
    const body = el("div", "body");
    if (c.name) body.appendChild(el("div", "who", esc(c.name)));
    const isDe = l.who === "lino" && l.de && S.linoLang === "de";
    body.appendChild(el("div", "text" + (isDe ? " de" : ""), isDe ? esc(lineText(l)) : gl(lineText(l))));
    row.appendChild(body); box.appendChild(row);
    if (onNext) { const b = el("button", "btn primary", esc(label || G.ui.btn.continuer)); b.addEventListener("click", onNext); const bar = el("div", "bar"); bar.appendChild(b); box.appendChild(bar); }
  }
  function renderChoices(box, choices, onPick, extra) {
    const wrap = el("div", "choices");
    choices.forEach((ch, i) => {
      const b = el("button", "btn choice", esc(ch.fr) + (ch.hint ? ' <small>' + esc(ch.hint) + "</small>" : ""));
      b.addEventListener("click", () => onPick(ch, i, b));
      wrap.appendChild(b);
    });
    if (extra) wrap.appendChild(extra);
    box.appendChild(wrap);
  }

  /* ---------- Diagnose ---------- */
  function classify(wrongs, help) { if (help > 0) return "mit Hilfe"; return wrongs <= 1 ? "selbstständig" : "nach Rückmeldung"; }
  function record(d) {
    const row = Object.assign({ date: new Date().toISOString(), player: pname(d.playerIdx === undefined ? S.mouse : d.playerIdx) }, d);
    delete row.playerIdx;
    S.diag = S.diag.filter(r => !(r.id === row.id && r.player === row.player && !r.count));
    S.diag.push(row); save();
  }

  /* ---------- Hilfe (Marie) ---------- */
  function helpCtl(helpId, ctx) {
    // ctx: { wrongs(), card, audio, transcriptEl, after: optional number of wrongs before level 1 }
    const levels = G.help[helpId]; if (!levels) return null;
    const btn = el("button", "btn aide", G.ui.btn.aide);
    const bubble = el("div", "marie-bubble"); bubble.hidden = true;
    let level = S.helpUsed[helpId] || 0;
    const after = ctx.after || 1;
    function update() { const ok = ctx.wrongs() >= after + level && level < 4; btn.disabled = !ok; btn.title = ok ? "" : G.ui.marie.helpLater; }
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      level++; S.helpUsed[helpId] = Math.max(S.helpUsed[helpId] || 0, level); save();
      const L = levels[level - 1]; const txt = typeof L === "string" ? L : L.fr;
      bubble.hidden = false; bubble.innerHTML = "";
      bubble.appendChild(portrait("marie"));
      bubble.appendChild(el("div", "body", '<div class="who">Marie · ' + level + '/4</div><div class="text">' + gl(txt) + "</div>"));
      if (typeof L === "object") {
        if (L.action === "replay" && ctx.audio) playAudio(ctx.audio, null);
        if (L.action === "transcript" && ctx.showTranscript) ctx.showTranscript();
        if (L.action === "material" && ctx.material) ctx.material();
      }
      update();
    });
    update();
    return { btn, bubble, update, level: () => level };
  }

  /* ---------- Knoten ausführen ---------- */
  function goNode(id) {
    if (!id) { dlg.innerHTML = ""; dlg.classList.remove("active"); return; }
    if (id === "END") { dlg.innerHTML = ""; dlg.classList.remove("active"); return; }
    if (id === "MAP") { openMap(); return; }
    if (id.startsWith("SCENE_")) { enterScene(id.slice(6), true); return; }
    if (id.startsWith("GO_")) { travel(id.slice(3)); return; }
    const n = G.nodes[id];
    if (!n) { console.warn("Knoten fehlt", id); return; }
    S.resume = id; save();
    if (PROF) $("#node-id").textContent = id;
    const finish = () => { S.resume = null; save(); };
    switch (n.type) {
      case "cut": return runCut(id, n, finish);
      case "lines": return runLines(id, n, finish);
      case "doc": return runDoc(id, n, finish);
      case "choice": return runChoice(id, n, finish);
      case "audio": return runAudio(id, n, finish);
      case "task": return runTask(id, n, finish);
      case "convo": return runConvo(id, n, finish);
      case "scene": enterScene(n.scene, false); finish(); return goNode(n.next);
      case "end": return runEnd(finish);
    }
  }

  function runCut(id, n, finish) {
    const body = openModal("cut nocl");
    const pic = el("div", "cutpic"); setBg(pic, n.bg); body.appendChild(pic);
    const box = el("div", "cutbox"); body.appendChild(box);
    showLines(n.lines, () => { applyEffects(n.effects, id); closeModal(); finish(); goNode(n.next); }, { box });
  }
  function runLines(id, n, finish) {
    if (n.once && flag(n.once)) { finish(); return; }
    if (n.once) setFlag(n.once);
    if (n.diag && n.count) record({ id: n.diag, result: "gezählt", count: true });
    showLines(n.lines, () => { applyEffects(n.effects, id); finish(); const nx = resolve(n.next); if (nx) goNode(nx); });
  }
  function runDoc(id, n, finish) {
    const body = openModal("doc");
    applyEffects(n.effects, id);
    if (n.diag && n.count) record({ id: n.diag, result: "gelesen", count: true });
    body.appendChild(el("h2", "", esc(n.title)));
    if (n.img) body.appendChild(docImg(n.img));
    if (n.doc) body.appendChild(el("div", "paper " + (n.icon || ""), gl(n.doc)));
    (n.docs || []).forEach(d => { const c = el("div", "doccard"); c.appendChild(el("div", "doclabel", esc(d.label))); if (d.text) c.appendChild(el("div", "doctext", gl(d.text))); body.appendChild(c); });
    const box = el("div", "dlg-inline"); body.appendChild(box);
    const done = () => { closeModal(); finish(); if (n.next) goNode(n.next); };
    showLines(n.lines, () => {
      if (n.choices) {
        box.innerHTML = ""; box.classList.add("active");
        renderChoices(box, n.choices, ch => {
          if (ch.kind === "ok") { applyEffects(ch.effects, id + ":" + ch.fr); closeModal(); finish(); goNode(ch.next); }
          else showLines(ch.reply, () => runDoc(id, n, finish), { box });
        });
      } else { const b = el("button", "btn primary", n.next ? G.ui.btn.continuer : G.ui.btn.fermer); b.addEventListener("click", done); const bar = el("div", "bar"); bar.appendChild(b); box.appendChild(bar); box.classList.add("active"); }
    }, { box, keep: true });
  }

  function runChoice(id, n, finish) {
    const st = { wrongs: 0, first: null, help: 0, t0: Date.now() };
    const helpAfter = n.helpAfter || 1;
    let hc = null;
    function ask() {
      showLines(n.lines, () => {
        dlg.innerHTML = ""; dlg.classList.add("active");
        const row = el("div", "line"); row.appendChild(portrait(n.who)); row.appendChild(el("div", "body", '<div class="who">' + esc(G.chars[n.who].name) + "</div>")); dlg.appendChild(row);
        let extra = null;
        if (n.help && !n.noDiag) {
          hc = helpCtl(n.help, { wrongs: () => st.wrongs, after: helpAfter, material: () => { $$(".choice", dlg).forEach(b => b.classList.add("hl")); } });
          extra = el("div", "help-row"); extra.appendChild(hc.btn); dlg.appendChild(hc.bubble); hc.update();
        }
        const choices = n.choices.filter(ch => !ch.unless || !flag(ch.unless) || ch.replyIf);
        renderChoices(dlg, choices, ch => {
          if (st.first === null) st.first = ch.fr;
          if (ch.effects) applyEffects(ch.effects, id + ":" + ch.fr);
          let reply = ch.reply;
          if (ch.unless && flag(ch.unless) && ch.replyIf) reply = ch.replyIf;
          if (ch.kind === "ok") {
            if (n.diag && !n.noDiag) {
              const help = hc ? hc.level() : 0;
              record({ id: n.diag, result: n.count ? "ok" : classify(st.wrongs, help), attempts: st.wrongs, help, first: st.first, duration: Math.round((Date.now() - st.t0) / 1000) });
              if (help > 0) toast("Marie: " + G.ui.marie.afterHelp);
            }
            showLines(reply, () => { applyEffects(n.effects, id); if (ch.next === id) ask(); else { finish(); goNode(ch.next); } });
          } else {
            st.wrongs++;
            showLines(reply, () => { if (ch.next === id || !ch.next) ask(); else { finish(); goNode(ch.next); } });
          }
        }, extra);
        if (hc) dlg.appendChild(hc.bubble);
      });
    }
    ask();
  }

  function runAudio(id, n, finish) {
    const a = G.audio[n.audio];
    const body = openModal("audio");
    /* deutsche Fassung: der Hörtext erscheint als Lesetext, das Porträt steht neben dem Namen (auf dem Handy bleibt die volle Breite für den Text) */
    const head = el("h2", "readhead"); head.appendChild(portrait(a.who)); head.appendChild(document.createTextNode(G.chars[a.who].name)); body.appendChild(head);
    body.appendChild(el("div", "paper transcript readtext", gl(a.text)));
    S.transcripts[n.audio] = true; save();
    body.appendChild(el("p", "hint", "Lies genau: Diese Infos brauchst du gleich."));
    const bar = el("div", "bar"); const b = el("button", "btn primary", G.ui.btn.continuer);
    b.addEventListener("click", () => { closeModal(); applyEffects(n.effects, id); finish(); goNode(n.next); });
    bar.appendChild(b); body.appendChild(bar);
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
        showLines(n.after, () => { finish(); goNode(n.next); });
        return;
      }
      const pi = idxs[k++];
      const intro = idxs.length > 1 ? (k === 1 ? fmtTpl(G.ui.solo, { p1: pname(0), p2: pname(1) }) : fmtTpl(G.ui.soloNow, { p: pname(pi) })) : null;
      taskCard(id, n, pi, intro, res => { results.push(res); one(); });
    }
    one();
  }

  function taskCard(id, n, playerIdx, intro, done) {
    const T = n.task;
    const body = openModal("task nocl");
    const st = { wrongs: 0, t0: Date.now(), transcript: false };
    const replays0 = n.audio ? (S.replays[n.audio] || 0) : 0;
    body.appendChild(el("h2", "", esc(n.title || "")));
    if (intro) body.appendChild(el("div", "solo", esc(intro)));
    const who = T.who ? G.chars[T.who].name : null;
    if (T.img) body.appendChild(docImg(T.img));
    if (T.intro) body.appendChild(el("div", "paper intro", (who ? "<b>" + esc(who) + ":</b> " : "") + gl(T.intro)));
    const trBox = el("div", "paper transcript"); trBox.hidden = true;
    let hc = null;
    const tools = el("div", "tools");
    if (n.audio) {
      const a = G.audio[n.audio];
      trBox.innerHTML = "<b>" + esc(G.chars[a.who].name) + ":</b> " + gl(a.text);
      const tr = el("button", "btn read", "📄 " + G.ui.btn.rejouer);
      tr.addEventListener("click", () => { trBox.hidden = !trBox.hidden; if (!trBox.hidden) { S.replays[n.audio] = (S.replays[n.audio] || 0) + 1; st.transcript = true; S.transcripts[n.audio] = true; save(); } });
      tools.appendChild(tr);
      st.showTranscript = () => { if (trBox.hidden) tr.click(); };
    }
    if (n.help) {
      hc = helpCtl(n.help, { wrongs: () => st.wrongs, audio: n.audio, showTranscript: () => st.showTranscript && st.showTranscript(), material: () => body.classList.add("material") });
      tools.appendChild(hc.btn);
    }
    body.appendChild(tools);
    if (hc) body.appendChild(hc.bubble);
    body.appendChild(trBox);
    const area = el("div", "area"); body.appendChild(area);
    const fb = el("div", "feedback"); body.appendChild(fb);
    function feedback(line, ok) {
      fb.innerHTML = ""; fb.className = "feedback " + (ok ? "ok" : "no");
      if (!line) return;
      const row = el("div", "line"); row.appendChild(portrait(line.who)); row.appendChild(el("div", "body", '<div class="who">' + esc(G.chars[line.who].name) + '</div><div class="text">' + gl(line.fr) + "</div>")); fb.appendChild(row);
    }
    function note(line) { const row = el("div", "line"); row.appendChild(portrait(line.who)); row.appendChild(el("div", "body", '<div class="who">' + esc(G.chars[line.who].name) + '</div><div class="text">' + gl(line.fr) + "</div>")); fb.appendChild(row); }
    function wrong(line) { st.wrongs++; feedback(line || T.wrong, false); if (hc) hc.update(); }
    function complete(extra, line) {
      const help = hc ? hc.level() : 0;
      const res = Object.assign({ id: n.diag, result: classify(st.wrongs, help), attempts: st.wrongs, help, replays: n.audio ? (S.replays[n.audio] || 0) - replays0 : undefined, transcript: n.audio ? st.transcript : undefined, duration: Math.round((Date.now() - st.t0) / 1000), playerIdx }, extra || {});
      if (n.diag) record(res);
      feedback(line || { who: "marie", fr: help > 0 ? G.ui.marie.afterHelp : G.ui.marie.ok }, true);
      const b = el("button", "btn primary", G.ui.btn.continuer); b.addEventListener("click", () => done(Object.assign({ player: pname(playerIdx) }, extra || {})));
      const bar = el("div", "bar"); bar.appendChild(b); fb.appendChild(bar);
      $$("button", area).forEach(x => x.disabled = true); $$("select,textarea", area).forEach(x => x.disabled = true);
    }
    const K = TASKS[T.kind];
    K(T, area, { wrong, complete, feedback, note, st, id, n, body });
  }

  const TASKS = {};
  const QIDS = ["Q1", "Q2", "Q3", "Q4"];

  TASKS.sort = function (T, area, api) {
    const sels = {};
    T.slots.forEach(s => {
      const row = el("div", "slot"); row.appendChild(el("label", "", esc(s.label)));
      const sel = el("select"); sel.appendChild(el("option", "", "…")); $$("option", sel)[0].value = "";
      T.options.forEach(o => { const op = el("option", "", esc(o.label)); op.value = o.id; sel.appendChild(op); });
      sels[s.id] = sel; row.appendChild(sel); area.appendChild(row);
    });
    const b = el("button", "btn primary", G.ui.btn.valider);
    b.addEventListener("click", () => {
      let ok = true; T.slots.forEach(s => { const good = sels[s.id].value === s.answer; sels[s.id].classList.toggle("bad", !good); if (!good) ok = false; });
      if (ok) api.complete(); else api.wrong();
    });
    area.appendChild(b);
  };

  TASKS.gap = function (T, area, api) {
    const p = el("p", "gaptext"); const sels = [];
    T.parts.forEach(part => {
      if (typeof part === "string") p.appendChild(document.createTextNode(part));
      else { const sel = el("select"); sel.appendChild(el("option", "", "…")); $$("option", sel)[0].value = ""; part.opts.forEach(o => { const op = el("option", "", o); op.value = o; sel.appendChild(op); }); sel.dataset.answer = part.answer; sel.dataset.id = part.id; sels.push(sel); p.appendChild(sel); }
    });
    area.appendChild(p);
    const perGap = {};
    const b = el("button", "btn primary", G.ui.btn.valider);
    b.addEventListener("click", () => {
      let ok = true;
      sels.forEach(s => { const good = s.value === s.dataset.answer; if (perGap[s.dataset.id] === undefined && s.value) perGap[s.dataset.id] = good; s.classList.toggle("bad", !good); s.classList.toggle("good", good); if (!good) ok = false; });
      if (ok) api.complete({ text: Object.keys(perGap).map(k => k + ":" + (perGap[k] ? "✓" : "✗")).join(" ") }); else api.wrong();
    });
    area.appendChild(b);
  };

  TASKS.pick = function (T, area, api) {
    if (T.question) area.appendChild(el("p", "q", gl(T.question)));
    const sel = new Set();
    const list = el("div", "picklist");
    T.options.forEach(o => {
      const b = el("button", "btn opt", gl(o.label));
      b.addEventListener("click", () => {
        if (sel.has(o.id)) { sel.delete(o.id); b.classList.remove("on"); }
        else { if (T.n === 1) { sel.clear(); $$(".opt", list).forEach(x => x.classList.remove("on")); } if (sel.size < T.n) { sel.add(o.id); b.classList.add("on"); } }
      });
      list.appendChild(b);
    });
    area.appendChild(list);
    const b = el("button", "btn primary", G.ui.btn.valider);
    b.addEventListener("click", () => {
      if (sel.size < T.n) { api.feedback({ who: "marie", fr: "Wähle " + T.n + " Antworten." }, false); return; }
      const ok = T.options.every(o => o.ok === sel.has(o.id));
      if (ok) api.complete(); else api.wrong();
    });
    area.appendChild(b);
  };

  TASKS.write = function (T, area, api) {
    const used = new Set();
    const chips = el("div", "chips");
    const ta = el("textarea"); ta.rows = 6; ta.placeholder = "…";
    T.starters.forEach(s => { const c = el("button", "btn chip", esc(s)); c.addEventListener("click", () => { used.add(s); ta.value += (ta.value && !/\s$/.test(ta.value) ? " " : "") + s.replace(/\.\.\.$/, " ") ; ta.focus(); count(); }); chips.appendChild(c); });
    area.appendChild(chips); area.appendChild(ta);
    const cnt = el("div", "count"); area.appendChild(cnt);
    const W = G.ui.write;
    function count() { const w = words(ta.value); cnt.textContent = fmtTpl(W.count, { n: w, min: T.min }); cnt.classList.toggle("ok", w >= T.min); }
    ta.addEventListener("input", count); count();
    /* Was fehlt noch? Satzanfänge mit „...“ brauchen eigene Wörter dahinter, Punkte im Satzanfang müssen ersetzt sein */
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
      const real = toks.filter(realWord).map(t => t.toLowerCase());
      if (real.length >= 15 && new Set(real).size < real.length * 0.4) return W.repeat;
      const w = real.length;
      if (w < T.min) return fmtTpl(W.more, { n: T.min - w });
      return null;
    }
    const b = el("button", "btn primary", G.ui.btn.valider);
    b.addEventListener("click", () => {
      const p = problem(ta.value);
      if (p) { api.st.wrongs++; api.feedback({ who: "marie", fr: p }, false); return; }
      api.complete({ text: ta.value.trim(), words: words(ta.value), starters: Array.from(used).join(" | ") });
    });
    area.appendChild(b);
  };

  TASKS.route = function (T, area, api) {
    let step = 0; const walked = [];
    const svg = el("div", "plan");
    svg.innerHTML = '<svg viewBox="0 0 400 300" aria-label="Plan">' +
      '<rect x="0" y="0" width="400" height="300" fill="#e9e2cf"/>' +
      '<path id="p_droit" d="M200 280 L200 150" stroke="#8a7f66" stroke-width="22" fill="none" stroke-linecap="round"/>' +
      '<path id="p_descend" d="M200 280 Q300 260 350 230 L380 200" stroke="#8a7f66" stroke-width="22" fill="none" stroke-linecap="round"/>' +
      '<path id="p_gauche" d="M200 150 L70 150" stroke="#8a7f66" stroke-width="22" fill="none" stroke-linecap="round"/>' +
      '<path id="p_droite" d="M200 150 L330 150 L370 110" stroke="#8a7f66" stroke-width="22" fill="none" stroke-linecap="round"/>' +
      '<circle cx="200" cy="150" r="14" fill="#c9bfa6"/>' +
      '<rect x="40" y="135" width="30" height="14" rx="3" fill="#c0392b"/><text x="30" y="180" font-size="13" fill="#555">die rote Bank</text>' +
      '<rect x="365" y="95" width="26" height="26" fill="#777"/><text x="300" y="90" font-size="13" fill="#555">Ausgang</text>' +
      '<text x="300" y="282" font-size="13" fill="#555">Ausgang</text>' +
      '<text x="205" y="110" font-size="13" fill="#555">Kreuzung</text>' +
      '<text x="160" y="290" font-size="13" fill="#555" text-anchor="end">Eingang</text>' +
      '<circle id="pos" cx="200" cy="280" r="10" fill="#2c6fad"/></svg>';
    area.appendChild(svg);
    const prompt = el("p", "q"); area.appendChild(prompt);
    const btns = el("div", "picklist"); area.appendChild(btns);
    const posFor = { droit: [200, 150], gauche: [70, 150] };
    function render() {
      const s = T.steps[step]; prompt.textContent = s.prompt; btns.innerHTML = "";
      s.opts.forEach(o => {
        const b = el("button", "btn opt", esc(o.label));
        const click = () => {
          if (o.ok) {
            walked.push(o.id); const p = $("#p_" + o.id, svg); if (p) p.setAttribute("stroke", "#2c6fad");
            const pos = posFor[o.id]; if (pos) { $("#pos", svg).setAttribute("cx", pos[0]); $("#pos", svg).setAttribute("cy", pos[1]); }
            step++;
            if (step >= T.steps.length) { btns.innerHTML = ""; prompt.textContent = ""; api.complete({ text: walked.join(" → ") }); } else render();
          } else { const p = $("#p_" + o.id, svg); if (p) { p.setAttribute("stroke", "#c0392b"); setTimeout(() => p.setAttribute("stroke", "#8a7f66"), 900); } api.wrong({ who: T.who, fr: o.reply }); }
        };
        b.addEventListener("click", click);
        const p = $("#p_" + o.id, svg); if (p) { p.style.cursor = "pointer"; p.addEventListener("click", click); }
        btns.appendChild(b);
      });
    }
    render();
  };

  TASKS.poster = function (T, area, api) {
    const wall = el("div", "wall");
    T.posters.forEach(p => {
      const card = el("div", "poster");
      card.appendChild(el("div", "pl", esc(p.id)));
      card.appendChild(el("div", "ptext", gl(p.text)));
      const b = el("button", "btn small", "Dieser hier");
      b.addEventListener("click", () => {
        if (p.ok) { card.classList.add("on"); wall.querySelectorAll("button").forEach(x => x.disabled = true); api.complete({ text: p.id }, T.success); }
        else { if (p.flag) setFlag(p.flag); api.wrong(p.reply); }
      });
      card.appendChild(b); wall.appendChild(card);
    });
    area.appendChild(wall);
  };

  /* Abfrage: Antworten tippen (aus dem Gedächtnis oder vom eigenen Blatt) */
  function normAns(v) { return String(v || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[’']/g, " ").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim(); }
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
    if ((f.answers || []).some(a => normAns(a) === v)) return true;
    if ((f.traps || []).some(t => (t.answers || []).some(a => normAns(a) === v))) return false;
    if (!/\d/.test(v) && (f.answers || []).some(a => { const na = normAns(a); return na.length >= 5 && !/\d/.test(na) && oneEdit(na, v); })) return true;
    if (f.number !== undefined) { const m = v.match(/\d+/); if (m && +m[0] === f.number) return true; }
    if (f.keywords) return f.keywords.some(g => g.every(k => v.includes(normAns(k))));
    return false;
  }
  const RECALL_TRIES = 3, RECALL_PAUSE = 60000;
  TASKS.recall = function (T, area, api) {
    const inputs = [];
    const pid = api.id;
    S.recallTries = S.recallTries || {}; S.recallPause = S.recallPause || {};
    const mk = f => {
      const inp = el("input", "rin"); inp.type = "text"; inp.autocomplete = "off"; inp.spellcheck = false; inp.size = f.size || 14; inp.placeholder = f.placeholder || "…"; inp.dataset.id = f.id;
      inp.setAttribute("autocorrect", "off"); inp.setAttribute("autocapitalize", "none"); if (f.digits) inp.inputMode = "tel";
      inputs.push({ f, inp, wrongs: 0 }); return inp;
    };
    if (T.parts) { const p = el("p", "gaptext"); T.parts.forEach(part => { if (typeof part === "string") p.appendChild(document.createTextNode(part)); else p.appendChild(mk(part)); }); area.appendChild(p); }
    (T.fields || []).forEach(f => { const row = el("div", "rfield"); row.appendChild(el("label", "", gl(f.label))); row.appendChild(mk(f)); area.appendChild(row); });
    area.appendChild(el("p", "hint", esc(G.ui.recall.intro)));
    const bar = el("div", "bar");
    const b = el("button", "btn primary", G.ui.recall.check);
    let timer = null;
    const left = () => Math.max(0, Math.ceil(((S.recallPause[pid] || 0) - Date.now()) / 1000));
    function lock() {
      inputs.forEach(x => x.inp.disabled = true); b.disabled = true;
      clearInterval(timer);
      const tick = () => {
        if (!b.isConnected) { clearInterval(timer); return; }
        const s = left();
        if (s > 0) { b.textContent = G.ui.recall.check + " (" + s + " s)"; return; }
        clearInterval(timer); b.textContent = G.ui.recall.check; b.disabled = false; inputs.forEach(x => { x.inp.disabled = false; });
      };
      tick(); timer = setInterval(tick, 1000);
    }
    b.addEventListener("click", () => {
      if (left() > 0) return;
      let ok = true; const hints = []; let trap = null;
      inputs.forEach(x => {
        const good = answerOk(x.f, x.inp.value); x.inp.classList.toggle("bad", !good); x.inp.classList.toggle("good", good);
        if (!good) {
          ok = false; x.wrongs++;
          const tr = (x.f.traps || []).find(t => answerOk(t, x.inp.value)); if (tr && !trap) trap = tr;   // Lesefalle: eigene Antwort der Figur
          if (x.wrongs >= 2 && x.f.where && !hints.includes(x.f.where)) hints.push(x.f.where);
        }
      });
      if (ok) { delete S.recallTries[pid]; delete S.recallPause[pid]; save(); inputs.forEach(x => x.inp.disabled = true); b.disabled = true; api.complete({ text: inputs.map(x => x.inp.value.trim()).join(" | ") }, T.success); return; }
      api.wrong({ who: (trap && trap.who) || T.who || "marie", fr: (trap ? trap.fr : (T.wrongText || G.ui.recall.wrong)) + (hints.length ? " " + hints.join(" ") : "") });
      S.recallTries[pid] = (S.recallTries[pid] || 0) + 1;
      if (S.recallTries[pid] % RECALL_TRIES === 0) { S.recallPause[pid] = Date.now() + RECALL_PAUSE; api.note({ who: "marie", fr: G.ui.recall.pause }); lock(); }
      save();
    });
    bar.appendChild(b);
    if (T.leave !== false) {
      const l = el("button", "btn", G.ui.recall.later);
      l.addEventListener("click", () => { clearInterval(timer); closeModal(); S.resume = null; save(); showLines(T.leaveLines || [{ who: T.who || "marie", fr: G.ui.recall.unknown }]); });
      bar.appendChild(l);
    }
    area.appendChild(bar);
    inputs.forEach(x => x.inp.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); b.click(); } }));
    if (left() > 0) { api.feedback({ who: "marie", fr: fmtTpl(G.ui.recall.paused, { s: left() }) }, false); lock(); }
    else if (!TOUCH) setTimeout(() => inputs[0] && inputs[0].inp.focus(), 50);   // auf dem Handy würde die Tastatur die Frage verdecken
  };

  TASKS.stamp = function (T, area, api) {
    let cur = null; const done = {};
    const stamps = el("div", "stamps");
    T.stamps.forEach(s => { const b = el("button", "btn stamp", esc(s.label)); b.addEventListener("click", () => { cur = s.id; $$(".stamp", stamps).forEach(x => x.classList.toggle("on", x === b)); }); stamps.appendChild(b); });
    area.appendChild(el("p", "q", "1. Wähle einen Stempel. 2. Klicke auf das Blatt."));
    area.appendChild(stamps);
    const sheets = el("div", "sheets");
    T.sheets.forEach(sh => {
      const card = el("button", "sheet");
      card.innerHTML = "<b>" + esc(sh.label) + "</b><div>" + gl(sh.text) + "</div>";
      card.addEventListener("click", () => {
        if (!cur) { api.feedback({ who: "marie", fr: "Wähle zuerst einen Stempel." }, false); return; }
        if (done[sh.id]) return;
        const key = sh.id + ":" + cur;
        if (sh.id === T.goal.sheet && cur === T.goal.stamp) { done[sh.id] = cur; card.classList.add("stamped"); card.appendChild(el("div", "mark", esc(T.stamps.find(s => s.id === cur).label))); api.complete({ text: Object.keys(done).map(k => k + ":" + done[k]).join(" ") }); }
        else if (T.bonus && sh.id === T.bonus.sheet && cur === T.bonus.stamp) { done[sh.id] = cur; card.classList.add("stamped"); card.appendChild(el("div", "mark", esc(T.stamps.find(s => s.id === cur).label))); api.feedback({ who: "lenoir", fr: "Ja, das ist das alte Programm. Und Aushang C?" }, true); }
        else api.wrong({ who: "lenoir", fr: T.replies[key] || T.replies[cur] || "Nein, nicht dieser Stempel." });
      });
      sheets.appendChild(card);
    });
    area.appendChild(sheets);
  };

  /* Finale: Gespräch in drei Schritten */
  function runConvo(id, n, finish) {
    const st = { wrongs: 0, t0: Date.now(), picks: [] };
    let si = 0, hc = null;
    function stepUI() {
      const step = n.steps[si];
      showLines(step.lines, () => {
        dlg.innerHTML = ""; dlg.classList.add("active");
        const row = el("div", "line"); row.appendChild(portrait(n.who)); row.appendChild(el("div", "body", '<div class="who">' + esc(G.chars[n.who].name) + " · " + (si + 1) + "/" + n.steps.length + "</div>")); dlg.appendChild(row);
        if (!hc) hc = helpCtl(n.help, { wrongs: () => st.wrongs, material: () => { $$(".choice", dlg).forEach(b => b.classList.add("hl")); } });
        const extra = el("div", "help-row"); extra.appendChild(hc.btn);
        const picked = new Set();
        renderChoices(dlg, step.choices, (ch, i, b) => {
          st.picks.push((si + 1) + ":" + ch.fr.slice(0, 30));
          if (ch.flag) setFlag(ch.flag);
          if (ch.kind === "ok") {
            if (step.pick) {
              picked.add(i); b.classList.add("on"); b.disabled = true;
              if (picked.size < step.pick) { return; }
            }
            showLines(step.after, () => { si++; if (si >= n.steps.length) { const help = hc.level(); record({ id: n.diag, result: classify(st.wrongs, help), attempts: st.wrongs, help, text: st.picks.join(" | "), duration: Math.round((Date.now() - st.t0) / 1000) }); applyEffects(n.effects, id); finish(); goNode(n.next); } else stepUI(); });
          } else { st.wrongs++; showLines(ch.reply, () => stepUI()); }
        }, extra);
        dlg.appendChild(hc.bubble); hc.update();
      });
    }
    stepUI();
  }

  /* ---------- Ende ---------- */
  function runEnd(finish) {
    S.finished = true; setFlag("finished"); finish();
    const body = openModal("end nocl");
    body.appendChild(el("h2", "", esc(G.ui.end)));
    const mins = Math.round((Date.now() - S.started) / 60000);
    const helps = Object.values(S.helpUsed).reduce((a, b) => a + b, 0);
    body.appendChild(el("div", "paper", "<b>" + esc(pname(0)) + (twoPlayers() ? " & " + esc(pname(1)) : "") + "</b><br>Besuchte Orte: " + S.visited.length + " · Hilfen von Marie: " + helps + " · Dauer: " + mins + " Min. · Geklärte Fragen: " + QIDS.filter(q => cond(G.questions[q].done)).length + "/4"));
    body.appendChild(el("p", "", "Jetzt kannst du die Fallakte exportieren (zwei Dateien)."));
    if (G.credits) body.appendChild(el("div", "credits", "<b>" + esc(G.credits.title) + "</b><br>" + G.credits.lines.map(esc).join("<br>")));
    const bar = el("div", "bar");
    const ex = el("button", "btn primary", G.ui.btn.exporter); ex.addEventListener("click", exportAll); bar.appendChild(ex);
    const ca = el("button", "btn", G.ui.btn.carnet); ca.addEventListener("click", () => openCarnet()); bar.appendChild(ca);
    const mn = el("button", "btn", G.ui.btn.menu); mn.addEventListener("click", goMenu); bar.appendChild(mn);
    const nw = el("button", "btn", G.ui.btn.nouvelle); nw.addEventListener("click", () => { if (confirm("Neues Spiel? Das jetzige Spiel bleibt im Export erhalten.")) { archiveRun(); localStorage.removeItem(SAVE_KEY); location.reload(); } }); bar.appendChild(nw);
    body.appendChild(bar);
    archiveRun();
  }
  function archiveRun() {
    try {
      const all = JSON.parse(localStorage.getItem(RESULTS_KEY) || "[]");
      const key = S.started;
      const idx = all.findIndex(r => r.started === key);
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
    const head = ["Datum", "Spieler", "Kennung", "Aufgabe", "Ergebnis", "Versuche", "Hilfestufe", "Wiederholungen", "Transkript", "Dauer_s", "Erstwahl", "Text"];
    const q = v => '"' + String(v === undefined || v === null ? "" : v).replace(/"/g, '""') + '"';
    const rows = diag.map(r => [r.date, r.player, r.id, G.diag[r.id] || "", r.result, r.attempts, r.help, r.replays, r.transcript === undefined ? "" : (r.transcript ? "ja" : "nein"), r.duration, r.first, r.text].map(q).join(";"));
    return "﻿" + head.join(";") + "\n" + rows.join("\n");
  }
  function exportAll() {
    const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
    const base = "pain-perdu_" + (pname(0) + (twoPlayers() ? "_" + pname(1) : "")).replace(/[^A-Za-z0-9À-ÿ_-]+/g, "_") + "_" + stamp;
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
      navigator.share({ files, title: "L'affaire du pain perdu – " + pname(0) }).then(() => toast("Export : " + base)).catch(e => { if (!e || e.name !== "AbortError") both(); });
      return;
    }
    both();
  }

  /* ---------- Carnet: Mission, die vier Fragen, eigene Texte. Keine automatisch gespeicherten Hinweise. ---------- */
  function openCarnet(keep) {
    const body = openModal("carnet", keep);
    body.appendChild(el("h2", "", esc(G.ui.carnet.title)));
    if (S.mission) body.appendChild(el("div", "mission", "<b>" + esc(G.ui.carnet.mission) + ":</b> " + gl(S.mission)));
    body.appendChild(el("h3", "", esc(G.ui.carnet.questions)));
    QIDS.forEach(q => {
      const done = cond(G.questions[q].done);
      const box = el("div", "qbox " + (done ? "proven" : ""));
      box.appendChild(el("div", "qtitle", "<b>" + q + "</b> " + esc(G.questions[q].title) + ' <span class="status">' + esc(done ? G.ui.carnet.done : G.ui.carnet.open) + "</span>"));
      body.appendChild(box);
    });
    body.appendChild(el("p", "hint", esc(G.ui.carnet.hint)));
    const cards = Object.keys(S.cards);
    if (cards.length) {
      body.appendChild(el("h3", "", esc(G.ui.carnet.cards)));
      cards.forEach(cid => { const n = G.nodes[cid]; S.cards[cid].forEach(c => body.appendChild(el("div", "paper small", "<b>" + esc(n.title) + " · " + esc(c.player) + "</b><br>" + esc(c.text)))); });
    }
    const bar = el("div", "bar");
    const ex = el("button", "btn", G.ui.btn.exporter); ex.addEventListener("click", exportAll); bar.appendChild(ex);
    const cl = el("button", "btn primary", G.ui.btn.fermer); cl.addEventListener("click", closeModal); bar.appendChild(cl);
    body.appendChild(bar);
  }

  /* ---------- Inventar ---------- */
  /* Bildkachel eines Gegenstands: assets/img/it_<id>.png, sonst Platzhalter-Symbol */
  function itemPic(id) {
    const it = G.items[id];
    const pic = el("div", "ipic"); pic.textContent = it.emoji || "▪";
    const im = new Image();
    im.onload = () => { pic.textContent = ""; pic.style.backgroundImage = "url(" + im.src + ")"; pic.classList.add("img"); };
    im.onerror = () => { if (im.src.endsWith(".png")) im.src = "../assets/img/it_" + id + ".jpg"; };
    im.src = "../assets/img/it_" + id + ".png";
    return pic;
  }
  function openInventory(pickCb) {
    const body = openModal("inv", !!pickCb);
    body.appendChild(el("h2", "", esc(pickCb ? fmtTpl(G.ui.inv.showTo, { to: pickCb.to || pickCb.name }) : G.ui.inv.title)));
    const grid = el("div", "igrid");
    if (!S.inv.length) grid.appendChild(el("p", "", esc(G.ui.inv.empty)));
    const detail = el("div", "idetail"); detail.hidden = true;
    let openId = null;
    function showDetail(id) {
      const it = G.items[id]; openId = id;
      $$(".item", grid).forEach(t => t.classList.toggle("on", t.dataset.id === id));
      detail.hidden = false; detail.innerHTML = "";
      const head = el("div", "ihead"); head.appendChild(itemPic(id)); head.appendChild(el("div", "", "<b>" + esc(it.name) + "</b><div class=\"idesc\">" + gl(it.desc) + "</div>")); detail.appendChild(head);
      if (it.img) detail.appendChild(docImg(it.img));
      const acts = (it.actions || []).filter(a => !a.if || flag(a.if));
      if (acts.length) {
        const row = el("div", "tools"); const out = el("div", "");
        acts.forEach(a => {
          const b = el("button", "btn small", esc(a.label));
          b.addEventListener("click", () => { out.innerHTML = ""; out.appendChild(el("div", "paper " + (a.icon || ""), gl(a.text))); if (a.flag) setFlag(a.flag); if (a.diag) record({ id: a.diag, result: "gezählt", count: true }); });
          row.appendChild(b);
        });
        detail.appendChild(row); detail.appendChild(out);
      }
    }
    S.inv.forEach(id => {
      const it = G.items[id];
      const card = el("button", "item"); card.dataset.id = id;
      card.appendChild(itemPic(id)); card.appendChild(el("span", "iname", esc(it.name)));
      card.addEventListener("click", () => { if (pickCb) { closeModal(); pickCb.fn(id); } else showDetail(id); });
      grid.appendChild(card);
    });
    body.appendChild(grid); body.appendChild(detail);
    if (!pickCb) body.appendChild(el("p", "hint", esc(G.ui.inv.hint || "")));
    const bar = el("div", "bar"); const cl = el("button", "btn", pickCb ? G.ui.btn.annuler : G.ui.btn.fermer); cl.addEventListener("click", closeModal); bar.appendChild(cl); body.appendChild(bar);
  }

  /* ---------- Karte ---------- */
  function openMap() {
    const body = openModal("map");
    body.appendChild(el("h2", "", "Paris"));
    const wrap = el("div", "mapwrap");
    wrap.innerHTML = '<svg viewBox="0 0 100 74" class="paris" aria-label="Stadtplan von Paris">' +
      '<rect x="0" y="0" width="100" height="74" fill="#eef0e6"/>' +
      '<path d="M0 44 C 15 40, 25 52, 40 50 S 60 44, 75 50 S 90 60, 100 58" stroke="#9cc3d8" stroke-width="3.5" fill="none"/>' +
      '<ellipse cx="46" cy="49.5" rx="6" ry="1.6" fill="#cfe3d2" stroke="#9cc3d8" stroke-width="0.4"/>' +
      '<path d="M18 12 Q 50 2 86 12 Q 97 35 86 60 Q 50 72 16 60 Q 3 35 18 12 Z" fill="none" stroke="#b9b6a5" stroke-width="0.6" stroke-dasharray="1.5 1"/>' +
      '</svg>';
    const svg = $("svg", wrap);
    G.map.places.forEach(p => {
      if (p.hideUntil && !flag(p.hideUntil)) return;
      const unlocked = cond(p.unlock);
      const done = p.done.every(f => flag(f));
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "place " + (unlocked ? "open" : "locked") + (done ? " done" : "") + (S.scene === p.id ? " here" : ""));
      g.innerHTML = "<title>" + esc(p.label) + "</title>" + '<circle cx="' + p.x + '" cy="' + p.y + '" r="3.2"/>' +
        (done ? '<text x="' + p.x + '" y="' + (p.y + 1.1) + '" class="chk" text-anchor="middle">✓</text>' : "") +
        '<text x="' + p.x + '" y="' + (p.y + 6.2) + '" text-anchor="middle" class="lbl">' + esc(p.short || p.label) + "</text>" +
        '<text x="' + p.x + '" y="' + (p.y + 9.4) + '" text-anchor="middle" class="q">' + esc(unlocked ? p.q : G.ui.locked) + "</text>";
      g.addEventListener("click", () => {
        if (!unlocked) { toast("Marie: " + (p.lockedMsg && cond(p.lockedMsg.if) ? p.lockedMsg.fr : G.ui.marie.locked)); return; }
        closeModal(); travel(p.id);
      });
      svg.appendChild(g);
    });
    body.appendChild(wrap);
    body.appendChild(el("p", "hint", "✓ = Aufgaben erledigt"));
    const bar = el("div", "bar"); const cl = el("button", "btn", G.ui.btn.fermer); cl.addEventListener("click", closeModal); bar.appendChild(cl); body.appendChild(bar);
  }

  function travel(sceneId) {
    if (sceneId === S.scene) { enterScene(sceneId, false); return; }
    S.travel++;
    const lines = [];
    if (S.travel === 1 || S.travel % 3 === 0) lines.push(G.ui.travel);
    if (twoPlayers()) { S.mouse = 1 - S.mouse; lines.push({ who: "narrateur", fr: fmtTpl(G.ui.partner, { p1: pname(1 - S.mouse), p2: pname(S.mouse) }) }); }
    save();
    const body = openModal("travel nocl");
    body.appendChild(el("div", "metro", "<b>M</b> Métro…"));
    const box = el("div", "dlg-inline"); body.appendChild(box);
    const go = () => { closeModal(); enterScene(sceneId, true); };
    if (lines.length) showLines(lines, go, { box }); else setTimeout(go, 600);
  }

  /* ---------- Szene ---------- */
  /* Klickflächen der aktuellen Szene (neu gezeichnet, sobald sich Flags ändern) */
  function drawHotspots() {
    const sc = S && S.scene && G.scenes[S.scene]; if (!sc) return;
    $$(".hotspot", stage).forEach(h => h.remove());
    sc.hotspots.forEach(h => {
      if (h.hideIf && flag(h.hideIf)) return;
      if (h.showIf && !cond(h.showIf)) return;
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
    dlg.innerHTML = ""; dlg.classList.remove("active");
    if (runEnter && sc.enter) goNode(sc.enter);
  }
  function resolve(action) {
    if (typeof action === "string") return action;
    if (Array.isArray(action)) { for (const a of action) if (cond(a.if)) return a.node; }
    return null;
  }
  /* Symbole für die Aktionen (Strichzeichnungen, passend zum Comic-Stil) */
  const ICONS = {
    regarder: '<path d="M2 11s3.5-5.5 9-5.5 9 5.5 9 5.5-3.5 5.5-9 5.5S2 11 2 11z"/><circle cx="11" cy="11" r="2.6"/>',
    parler: '<path d="M2.5 11c2.3-3.4 4.6-5 7-4.3.6.2 1.1.6 1.5 1.1.4-.5.9-.9 1.5-1.1 2.4-.7 4.7.9 7 4.3-2.3 3.2-5.1 4.8-8.5 4.8S4.8 14.2 2.5 11z"/><path d="M2.5 11c2.8.4 5.6.6 8.5.6s5.7-.2 8.5-.6"/>',
    montrer: '<path d="M8 12V5.2a1.5 1.5 0 0 1 3 0V11M11 11V4a1.5 1.5 0 0 1 3 0v7M14 11V5.5a1.5 1.5 0 0 1 3 0V13c0 4-2.6 7-6.3 7-3 0-4.6-1.4-6-3.6L3 13.2a1.5 1.5 0 0 1 2.5-1.6L8 14"/>',
    ecouter: '<path d="M6.5 9a5 5 0 0 1 10 0c0 2.6-1.6 3.2-2.4 5-.7 1.6-1.2 3.5-3.4 3.5-1.6 0-2.4-.9-2.6-2"/><path d="M9.5 9a2 2 0 0 1 4 0c0 1.4-1.3 1.8-1.3 3"/>',
    comparer: '<circle cx="9" cy="9" r="5.5"/><path d="M13 13l6 6"/>',
    courir: '<circle cx="13.5" cy="3.8" r="1.8"/><path d="M8.5 19.5l2.2-5 2.8 1.6L14 19.5M5.5 12.5l3.2-4.3 3.4-1 2.6 3.1 3.3 1.2M9 8l-2.4 1-1.3 3.2"/>'
  };
  function verbIcon(v) { const d = ICONS[v]; return d ? '<svg class="vicon" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + "</svg>" : ""; }
  function verbMenu(h, btn) {
    $$(".verbs").forEach(v => v.remove());
    const m = el("div", "verbs");
    m.appendChild(el("div", "vtitle", esc(h.label)));
    m.addEventListener("click", e => e.stopPropagation());
    Object.keys(h.actions).forEach(v => {
      const b = el("button", "btn verb", verbIcon(v) + "<span>" + esc(G.ui.verbs[v] || v) + "</span>");
      b.addEventListener("click", e => {
        e.stopPropagation(); m.remove();
        if (v === "montrer") {
          openInventory({ name: h.label, to: h.to, fn: item => { const node = resolve(h.actions.montrer[item]); if (node) goNode(node); else showLines([G.ui.inv.nothing]); } });
        } else { const node = resolve(h.actions[v]); if (node) goNode(node); }
      });
      m.appendChild(b);
    });
    m.style.left = "0px"; m.style.top = "0px"; m.style.transform = "none";
    stage.appendChild(m);
    // über der Mitte des Hotspots, aber ganz im Bild (am Rand sonst abgeschnitten)
    const sr = stage.getBoundingClientRect(), br = btn.getBoundingClientRect(), pad = 4;
    const x = br.left - sr.left + br.width / 2 - m.offsetWidth / 2, y = br.top - sr.top + br.height / 2 - m.offsetHeight / 2;
    m.style.left = Math.max(pad, Math.min(x, sr.width - m.offsetWidth - pad)) + "px";
    m.style.top = Math.max(pad, Math.min(y, sr.height - m.offsetHeight - pad)) + "px";
  }
  document.addEventListener("click", () => $$(".verbs").forEach(v => v.remove()));

  /* ---------- Lehrkraft-Ansicht ---------- */
  function openProf() {
    const body = openModal("prof");
    body.appendChild(el("h2", "", "Lehrkraft-Ansicht"));
    const bar = el("div", "bar");
    const unlock = el("button", "btn", "Alles freischalten"); unlock.addEventListener("click", () => { ["M00_done", "M02_done", "M03_done", "M04b_done", "P02_done", "P03_done", "P04_done", "P05_done", "P06_done", "B01a_done", "B03_open", "B04_done", "B05_done", "B06_done", "L02_C", "L02_done", "L02q_done", "L04_done", "L05_done", "C01_found", "vosges_seen", "V01q_done"].forEach(f => S.flags[f] = true); Object.keys(G.items).forEach(id => { if (!S.inv.includes(id)) S.inv.push(id); }); save(); refreshTop(); toast("Alles freigeschaltet"); }); bar.appendChild(unlock);
    const reset = el("button", "btn", "Spielstand löschen"); reset.addEventListener("click", () => { if (confirm("Spielstand auf diesem Gerät löschen?")) { localStorage.removeItem(SAVE_KEY); location.reload(); } }); bar.appendChild(reset);
    const exr = el("button", "btn", "Alle Ergebnisse (CSV)"); exr.addEventListener("click", () => { const all = JSON.parse(localStorage.getItem(RESULTS_KEY) || "[]"); download("pain-perdu_resultats.csv", csvRows(all.flatMap(r => r.diag)), "text/csv;charset=utf-8"); }); bar.appendChild(exr);
    const pz = el("a", "btn", "Notizblatt (Druck)"); pz.href = "zettel.html"; pz.target = "_blank"; bar.appendChild(pz);
    body.appendChild(bar);
    body.appendChild(el("h3", "", "Sprung zu einem Knoten"));
    const jump = el("div", "jumps");
    const sceneOf = id => ({ S: "montmartre", M: "montmartre", P: "pere_lachaise", B: "marais", L: "librairie", V: "louvre", X: "vosges", C: "catacombes" })[id[0]];
    Object.keys(G.nodes).forEach(id => { const n = G.nodes[id]; const b = el("button", "btn small", id + " <small>" + n.type + (n.title ? " · " + esc(n.title) : "") + "</small>"); b.addEventListener("click", () => { closeModal(); const sc = sceneOf(id); if (sc && S.scene !== sc) enterScene(sc, false); if (!S.scene) enterScene(sc, false); goNode(id); }); jump.appendChild(b); });
    body.appendChild(jump);
    body.appendChild(el("h3", "", "Lösungen"));
    const sol = el("div", "paper small");
    sol.innerHTML = [
      "<b>M03</b> Haben Sie diesen Mann gesehen?", "<b>M04</b> heute Morgen = Père-Lachaise · heute Nachmittag = Le Marais · heute Abend = weiß man nicht",
      "<b>M04b</b> einen gestreiften Pullover · das Foto anschauten · die Tasche an der Treppe · zur Métro", "<b>P02</b> A (oder das Foto zeigen)", "<b>P04</b> geradeaus → links", "<b>P06</b> roter Reißverschluss + gelber Aufkleber",
      "<b>B02</b> B oder C (A = Umweg)", "<b>B02b</b> A", "<b>B04</b> a, c, e", "<b>L02</b> C", "<b>L04</b> ÄNDERUNG auf C (Zusatz: ALTES PROGRAMM auf A)",
      "<b>V03</b> Schritt 1: A/B · Schritt 2: A/B", "<b>C03</b> die alten Schilder · aus Pappe · seine braune Tasche", "<b>V02b</b> rechts · hinter · aus · an"
    ].join("<br>");
    body.appendChild(sol);
    body.appendChild(el("h3", "", "Abfragen im Spiel (Frage → erwartete Antwort · wo nachsehen)"));
    const rec = Object.keys(G.nodes).filter(id => G.nodes[id].type === "task" && G.nodes[id].task.kind === "recall");
    body.appendChild(el("div", "paper small", rec.map(id => {
      const T = G.nodes[id].task; const fs = (T.fields || []).concat((T.parts || []).filter(x => typeof x === "object"));
      return "<b>" + id + " · " + esc(G.nodes[id].title || "") + "</b> (" + esc(G.chars[T.who].name) + ")<br>" + fs.map(f => "– " + esc(f.label || "Lücke " + f.id) + " → <b>" + esc((f.answers || [])[0] || (f.keywords ? f.keywords.map(g => g.join(" + ")).join(" / ") : "")) + "</b>" + (f.where ? " · <i>" + esc(f.where) + "</i>" : "")).join("<br>");
    }).join("<br><br>")));
    body.appendChild(el("h3", "", "Lesetexte (statt Hörtexte)"));
    Object.keys(G.audio).forEach(k => body.appendChild(el("div", "paper small", "<b>" + k + " · " + esc(G.chars[G.audio[k].who].name) + "</b><br>" + esc(G.audio[k].text))));
    body.appendChild(el("h3", "", "Ergebnisse auf diesem Gerät"));
    const all = JSON.parse(localStorage.getItem(RESULTS_KEY) || "[]");
    const rows = all.flatMap(r => r.diag).concat(S.diag.filter(d => !all.some(r => r.started === S.started)));
    const tbl = el("table", "results");
    tbl.innerHTML = "<tr><th>Datum</th><th>Spieler</th><th>Kennung</th><th>Ergebnis</th><th>Versuche</th><th>Hilfe</th><th>Wdh.</th><th>Text</th></tr>" + rows.map(r => "<tr><td>" + esc(r.date.slice(0, 16).replace("T", " ")) + "</td><td>" + esc(r.player) + "</td><td>" + esc(r.id) + "</td><td>" + esc(r.result) + "</td><td>" + esc(r.attempts === undefined ? "" : r.attempts) + "</td><td>" + esc(r.help === undefined ? "" : r.help) + "</td><td>" + esc(r.replays === undefined ? "" : r.replays) + "</td><td>" + esc((r.text || r.first || "").slice(0, 80)) + "</td></tr>").join("");
    body.appendChild(tbl);
    const b2 = el("div", "bar"); const cl = el("button", "btn primary", G.ui.btn.fermer); cl.addEventListener("click", closeModal); b2.appendChild(cl); body.appendChild(b2);
  }

  /* ---------- Glossar-Liste ---------- */
  function openGlossary() {
    const body = openModal("gloss");
    body.appendChild(el("h2", "", esc(G.ui.btn.glossaire)));
    const t = el("table", "gl-table"); t.innerHTML = G.glossary.map(e => "<tr><td>" + esc(e[0]) + "</td><td>" + esc(e[1]) + "</td></tr>").join(""); body.appendChild(t);
    const bar = el("div", "bar"); const cl = el("button", "btn primary", G.ui.btn.fermer); cl.addEventListener("click", closeModal); bar.appendChild(cl); body.appendChild(bar);
  }

  /* ---------- Start ---------- */
  /* Introvideo beim Laden der Seite (../assets/video/intro.mp4): Video, dann großer Titel, dann Startmenü.
     ?intro=0 überspringt es. Fehlt die Datei oder spielt der Browser sie nicht, erscheint sofort das Startmenü.
     Ohne Klick erlauben Browser nur stummes Abspielen: dann gibt es einen Knopf für den Ton. */
  function playIntro(cb) {
    const box = el("div", "introvid");
    const v = document.createElement("video");
    v.src = "../assets/video/intro.mp4"; v.poster = "../assets/video/intro_poster.jpg";
    v.playsInline = true; v.setAttribute("playsinline", ""); v.preload = "auto";
    const title = el("div", "ititle");
    title.innerHTML = "<h1>" + esc($("#title").textContent) + "</h1><p>" + esc($("#subtitle").textContent) + "</p>";
    const snd = el("button", "btn snd", "🔇 Ton"); snd.hidden = true;
    const skip = el("button", "btn skip", "Intro überspringen ▸");
    const big = el("button", "bigplay", "▶"); big.hidden = true; big.setAttribute("aria-label", "Intro starten");
    let done = false, timer = null;
    const end = () => { if (done) return; done = true; clearTimeout(timer); box.classList.add("out"); setTimeout(() => { box.remove(); cb(); }, 900); };
    const showTitle = () => { if (done || box.classList.contains("titled")) return; box.classList.add("titled"); skip.hidden = true; snd.hidden = true; big.hidden = true; timer = setTimeout(end, 3400); };
    skip.addEventListener("click", end);
    title.addEventListener("click", end);
    v.addEventListener("ended", showTitle);
    v.addEventListener("error", () => { if (!box.classList.contains("titled")) end(); });
    snd.addEventListener("click", () => { v.muted = !v.muted; snd.textContent = v.muted ? "🔇 Ton" : "🔊 Ton"; });
    big.addEventListener("click", () => { big.hidden = true; v.muted = false; v.play().catch(() => { v.muted = true; v.play().catch(end); }); });
    v.play().catch(() => {
      if (v.error || done) return;
      v.muted = true; snd.hidden = false;
      v.play().catch(() => { if (!v.error && !done) big.hidden = false; });
    });
    box.appendChild(v); box.appendChild(title); box.appendChild(snd); box.appendChild(skip); box.appendChild(big);
    document.body.appendChild(box);
  }
  function startNew() {
    if (S && S.diag && S.diag.length) archiveRun();   // alte Partie bleibt in den Ergebnissen auf diesem Gerät
    S = freshState();
    S.players = [$("#p1").value, $("#p2").value];
    S.linoLang = $("input[name=lino]:checked").value;
    save();
    $("#start").hidden = true; $("#game").hidden = false;
    S.scene = "montmartre"; enterScene("montmartre", false);
    goNode("S02");
  }
  /* Zurück zum Startmenü: der Spielstand ist gespeichert, „Continuer la partie" macht dort weiter */
  function refreshResume() {
    const b = $("#btn-resume");
    if (!S) { b.hidden = true; return; }
    b.hidden = false; b.textContent = G.ui.btn.reprendre + " (" + pname(0) + (twoPlayers() ? " & " + pname(1) : "") + ")";
    $("#p1").value = S.players[0] || ""; $("#p2").value = S.players[1] || "";
    const r = $("input[name=lino][value=" + (S.linoLang === "de" ? "de" : "fr") + "]"); if (r) r.checked = true;
  }
  function goMenu() {
    closeModal(); $$(".verbs").forEach(v => v.remove()); $("#gltip").hidden = true;
    dlg.innerHTML = ""; dlg.classList.remove("active");
    save(); refreshResume();
    $("#game").hidden = true; $("#start").hidden = false;
  }
  function resumeGame() {
    $("#start").hidden = true; $("#game").hidden = false;
    enterScene(S.scene || "montmartre", false);
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
    const bar = el("div", "bar"); const b = el("button", "btn primary", G.ui.btn.fermer); b.addEventListener("click", closeModal); bar.appendChild(b); body.appendChild(bar);
  }
  /* Handy: Vollbild-Knopf in der Kopfleiste und auf dem Startbildschirm, auf jedem Handy (nicht in der installierten App, die ist schon Vollbild); Hinweis, das Telefon zu drehen */
  function setupMobile() {
    const de = document.documentElement;
    const req = de.requestFullscreen || de.webkitRequestFullscreen;
    const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement;
    const fbs = [$("#btn-full"), $("#btn-full-start")].filter(Boolean);
    const mq = q => !!(window.matchMedia && matchMedia(q).matches);
    const app = navigator.standalone === true || mq("(display-mode: fullscreen)") || mq("(display-mode: standalone)");
    if (TOUCH && !app) {
      const F = G.ui.full, canFs = req && (document.fullscreenEnabled || document.webkitFullscreenEnabled);
      // Beschriftung und Symbol zeigen, was ein Tipp bewirkt
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
    // einmal gedreht: Hinweis nicht mehr nötig
    const land = window.matchMedia && matchMedia("(orientation: landscape)");
    if (land && land.addEventListener) land.addEventListener("change", () => { if (land.matches && !$("#game").hidden) dismiss(); });
  }
  function init() {
    const saved = loadSave();
    if (saved && saved.v === 1) {
      S = saved;
      refreshResume();
    }
    $("#btn-resume").addEventListener("click", () => { if (S) resumeGame(); });
    $("#btn-menu").addEventListener("click", goMenu);
    $("#btn-start").addEventListener("click", () => { if (!$("#p1").value.trim()) { $("#p1").focus(); $("#p1").classList.add("bad"); return; } if (S && S.diag && S.diag.length && !confirm("Neues Spiel? Das alte Spiel wird ersetzt.")) return; startNew(); });
    $("#btn-carnet").addEventListener("click", () => openCarnet());
    $("#btn-map").addEventListener("click", () => openMap());
    $("#btn-inv").addEventListener("click", () => openInventory());
    $("#btn-gloss").addEventListener("click", openGlossary);
    $("#btn-lang").addEventListener("click", () => { S.linoLang = S.linoLang === "fr" ? "de" : "fr"; save(); toast("Lino : " + (S.linoLang === "fr" ? G.ui.start.fr : G.ui.start.de)); });
    setupMobile();
    $("#btn-intro").addEventListener("click", e => { e.preventDefault(); playIntro(() => {}); });
    if (QS.get("intro") !== "0") playIntro(() => {});
    if (PROF) { $("#btn-prof").hidden = false; $("#btn-prof").addEventListener("click", openProf); $("#node-id").hidden = false; }
    $("#title").textContent = G.ui.title; $("#subtitle").textContent = G.ui.subtitle;
    $("#ver").textContent = "v" + G.version + (PROF ? " · prof" : "");
  }
  if (PROF || TEST) window.PP = { get S() { return S; }, goNode, enterScene, openMap, openCarnet, exportAll, flag, save, PROF, goMenu };
  init();
})();
