/* L'affaire du pain perdu – Spiel-Engine (vanilla JS, ohne Build) */
(function () {
  "use strict";
  const G = window.GAME;
  const $ = (sel, el) => (el || document).querySelector(sel);
  const $$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));
  const PROF = new URLSearchParams(location.search).get("mode") === "prof";
  const SAVE_KEY = "pp_save_v1", RESULTS_KEY = "pp_results_v1";

  /* ---------- Zustand ---------- */
  let S = null;
  function freshState() {
    return {
      v: 1, players: ["", ""], leoLang: "fr", mouse: 0, scene: null, resume: "S02",
      flags: {}, inv: Object.keys(G.items).filter(k => G.items[k].start), proofs: [], notes: "", mission: "",
      q2noted: false, diag: [], helpUsed: {}, replays: {}, transcripts: {}, travel: 0, started: Date.now(), visited: [], cards: {}, finished: false
    };
  }
  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* privat */ } }
  function loadSave() { try { const s = localStorage.getItem(SAVE_KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
  function flag(f) { return !!S.flags[f]; }
  function setFlag(f) { S.flags[f] = true; save(); }
  function cond(c) {
    if (!c || c === "always") return true;
    if (c === "Q2_proven") return isProven("Q2");
    return flag(c);
  }
  function twoPlayers() { return !!(S.players[1] && S.players[1].trim()); }
  function pname(i) { return S.players[i] && S.players[i].trim() ? S.players[i].trim() : (i === 0 ? "Joueur 1" : "Joueur 2"); }

  /* ---------- Hilfen ---------- */
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
  function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function fmtTpl(t, map) { return t.replace(/\{(\w+)\}/g, (m, k) => map[k] !== undefined ? map[k] : m); }
  function words(t) { return (t.trim().match(/[A-Za-zÀ-ÿ0-9']+/g) || []).length; }

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
    tip.style.left = Math.min(r.left, window.innerWidth - 260) + "px";
    tip.style.top = (r.bottom + 6 + window.scrollY) + "px";
  });

  /* Bilder mit Fallback png -> jpg -> Farbe */
  function setBg(node, name) {
    node.style.backgroundImage = "";
    node.dataset.img = name;
    const tryLoad = (ext, next) => {
      const im = new Image();
      im.onload = () => { if (node.dataset.img !== name) return; node.style.backgroundImage = "url(assets/img/" + name + "." + ext + ")"; if (node.id === "stage") node.style.aspectRatio = (im.naturalWidth / im.naturalHeight).toFixed(4); };
      im.onerror = () => next && next();
      im.src = "assets/img/" + name + "." + ext;
    };
    tryLoad("png", () => tryLoad("jpg", () => { node.style.backgroundImage = "linear-gradient(160deg,#5b4636,#2d2420)"; if (node.id === "stage") { node.style.aspectRatio = "2.12"; const l = el("div", "nobg", esc(S && S.scene ? G.scenes[S.scene].name : "")); node.appendChild(l); } }));
  }
  function portrait(who) {
    const c = G.chars[who] || { name: who, initials: "?", color: "#777" };
    const p = el("div", "pt");
    p.style.background = c.color;
    p.textContent = c.initials;
    if (c.pt) { const im = new Image(); im.onload = () => { p.textContent = ""; p.style.backgroundImage = "url(" + im.src + ")"; }; im.src = "assets/img/" + c.pt + ".png"; }
    return p;
  }

  /* Audio mit Sprachsynthese-Fallback */
  let currentAudio = null, frVoice = null;
  function pickVoice() { const vs = speechSynthesis.getVoices(); frVoice = vs.find(v => /^fr[-_]FR/i.test(v.lang)) || vs.find(v => /^fr/i.test(v.lang)) || null; }
  if ("speechSynthesis" in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  function stopAudio() { if (currentAudio) { currentAudio.pause(); currentAudio = null; } if ("speechSynthesis" in window) speechSynthesis.cancel(); $$(".playing").forEach(e => e.classList.remove("playing")); }
  function playAudio(id, btn) {
    stopAudio();
    const a = G.audio[id];
    if (!a) return;
    S.replays[id] = (S.replays[id] || 0) + 1; save();
    if (btn) btn.classList.add("playing");
    const done = () => { if (btn) btn.classList.remove("playing"); };
    const tts = () => {
      if (!("speechSynthesis" in window)) { done(); return; }
      const u = new SpeechSynthesisUtterance(a.text);
      u.lang = "fr-FR"; u.rate = 0.88; if (frVoice) u.voice = frVoice;
      u.onend = done; u.onerror = done;
      speechSynthesis.speak(u);
    };
    const au = new Audio("assets/audio/" + id + ".mp3");
    currentAudio = au;
    au.onended = done;
    au.onerror = () => { if (currentAudio === au) { currentAudio = null; tts(); } };
    au.play().catch(() => { if (currentAudio === au) { currentAudio = null; tts(); } });
  }

  /* ---------- Carnet-Logik ---------- */
  function addProof(id) { if (!S.proofs.includes(id)) { S.proofs.push(id); save(); return true; } return false; }
  function addItem(id) { if (!S.inv.includes(id)) { S.inv.push(id); save(); toast("Inventaire : " + G.items[id].name); } }
  function isProven(q) {
    if (q === "Q2") return flag("Q2_proven");
    const need = G.questions[q].need;
    return S.proofs.filter(p => G.proofs[p].q === q && G.proofs[p].strong).length >= need;
  }
  function applyEffects(fx, key) {
    if (!fx) return;
    if (key) { if (S.flags["fx:" + key]) return; S.flags["fx:" + key] = true; }
    if (fx.proof) addProof(fx.proof);
    if (fx.proofs) fx.proofs.forEach(addProof);
    if (fx.item) addItem(fx.item);
    if (fx.items) fx.items.forEach(addItem);
    if (fx.removeItem) S.inv = S.inv.filter(i => i !== fx.removeItem);
    if (fx.flag) S.flags[fx.flag] = true;
    if (fx.mission) S.mission = fx.mission;
    save(); refreshTop();
  }

  /* ---------- Oberfläche: Grundelemente ---------- */
  const stage = $("#stage"), dlg = $("#dialogue"), modal = $("#modal"), modalBody = $("#modal-body");
  function toast(msg) { const t = el("div", "toast", esc(msg)); $("#toasts").appendChild(t); setTimeout(() => t.remove(), 2600); }
  function refreshTop() {
    $("#scene-name").textContent = S && S.scene ? G.scenes[S.scene].name : "";
    $("#mouse").textContent = S && twoPlayers() ? G.ui.mouse + " " + pname(S.mouse) : "";
    const n = S ? S.proofs.length : 0; $("#carnet-count").textContent = n ? n : "";
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
  function lineText(l) { return (l.who === "leo" && l.de && S.leoLang === "de") ? l.de : l.fr; }
  function renderLine(box, l, onNext, label) {
    box.innerHTML = ""; box.classList.add("active");
    const c = G.chars[l.who] || { name: l.who };
    const row = el("div", "line " + (l.who === "narrateur" ? "narr" : ""));
    if (l.who !== "narrateur") row.appendChild(portrait(l.who));
    const body = el("div", "body");
    if (c.name) body.appendChild(el("div", "who", esc(c.name)));
    const isDe = l.who === "leo" && l.de && S.leoLang === "de";
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
      bubble.appendChild(el("div", "body", '<div class="who">Marie · ' + level + "/4</div><div class=\"text" + (level === 4 ? " de" : "") + '">' + (level === 4 ? esc(txt) : gl(txt)) + "</div>"));
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
    body.appendChild(el("div", "paper " + (n.icon || ""), gl(n.doc)));
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
              if (help > 0) toast("Marie : " + G.ui.marie.afterHelp);
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
    body.appendChild(el("h2", "", esc(G.chars[a.who].name)));
    const row = el("div", "audio-row"); row.appendChild(portrait(a.who));
    const play = el("button", "btn play", "▶ " + G.ui.verbs.ecouter);
    play.addEventListener("click", () => { playAudio(n.audio, play); play.textContent = "▶ " + G.ui.btn.rejouer; });
    row.appendChild(play);
    const tr = el("button", "btn", G.ui.btn.transcription);
    const trBox = el("div", "paper transcript", gl(a.text)); trBox.hidden = true;
    const canTranscript = PROF || (S.helpUsed[n.transcriptHelp] || 0) >= 3;
    tr.hidden = !canTranscript;
    tr.addEventListener("click", () => { trBox.hidden = !trBox.hidden; S.transcripts[n.audio] = true; save(); });
    row.appendChild(tr); body.appendChild(row); body.appendChild(trBox);
    body.appendChild(el("p", "hint", "Tu peux écouter plusieurs fois."));
    const bar = el("div", "bar"); const b = el("button", "btn primary", G.ui.btn.continuer);
    b.addEventListener("click", () => { closeModal(); applyEffects(n.effects, id); finish(); goNode(n.next); });
    bar.appendChild(b); body.appendChild(bar);
    setTimeout(() => play.click(), 300);
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
    if (T.intro) body.appendChild(el("div", "paper intro", (who ? "<b>" + esc(who) + " :</b> " : "") + gl(T.intro)));
    const trBox = el("div", "paper transcript"); trBox.hidden = true;
    let hc = null;
    const tools = el("div", "tools");
    if (n.audio) {
      const a = G.audio[n.audio];
      const play = el("button", "btn play", "▶ " + G.ui.btn.rejouer);
      play.addEventListener("click", () => playAudio(n.audio, play));
      tools.appendChild(play);
      trBox.innerHTML = gl(a.text);
      const tr = el("button", "btn", G.ui.btn.transcription);
      const can = () => PROF || (S.helpUsed[n.help] || 0) >= 3;
      tr.hidden = !can();
      tr.addEventListener("click", () => { trBox.hidden = !trBox.hidden; st.transcript = true; S.transcripts[n.audio] = true; save(); });
      tools.appendChild(tr);
      st.showTranscript = () => { tr.hidden = false; trBox.hidden = false; st.transcript = true; };
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
    function wrong(line) { st.wrongs++; feedback(line || T.wrong, false); if (hc) hc.update(); }
    function complete(extra, line) {
      const help = hc ? hc.level() : 0;
      const res = Object.assign({ id: n.diag, result: classify(st.wrongs, help), attempts: st.wrongs, help, replays: n.audio ? (S.replays[n.audio] || 0) - replays0 : undefined, transcript: n.audio ? st.transcript : undefined, duration: Math.round((Date.now() - st.t0) / 1000), playerIdx }, extra || {});
      if (n.diag) record(res);
      feedback(line || { who: "marie", fr: help > 0 ? G.ui.marie.afterHelp : G.ui.marie.proofOk }, true);
      const b = el("button", "btn primary", G.ui.btn.continuer); b.addEventListener("click", () => done(Object.assign({ player: pname(playerIdx) }, extra || {})));
      const bar = el("div", "bar"); bar.appendChild(b); fb.appendChild(bar);
      $$("button", area).forEach(x => x.disabled = true); $$("select,textarea", area).forEach(x => x.disabled = true);
    }
    const K = TASKS[T.kind];
    K(T, area, { wrong, complete, feedback, st, id, n, body });
  }

  const TASKS = {};
  const QIDS = ["Q1", "Q2", "Q3", "Q4"];

  TASKS.assign = function (T, area, api) {
    const doneDocs = new Set();
    T.docs.forEach(d => {
      const card = el("div", "doccard");
      card.appendChild(el("div", "doclabel", esc(d.label)));
      if (d.text) card.appendChild(el("div", "doctext", gl(d.text)));
      const qs = el("div", "qbtns");
      QIDS.forEach(q => {
        const b = el("button", "btn small", q + " · " + esc(G.questions[q].title));
        b.addEventListener("click", () => {
          if (doneDocs.has(d.id)) return;
          if (q === d.answer) {
            doneDocs.add(d.id); addProof(d.proof); card.classList.add("done");
            card.appendChild(el("div", "okline", "✓ " + esc(q) + " — " + gl(d.ok)));
            $$("button", qs).forEach(x => x.disabled = true);
            api.feedback({ who: "marie", fr: G.ui.marie.proofOk }, true);
            refreshTop();
            if (doneDocs.size === T.docs.length) api.complete();
          } else api.wrong();
        });
        qs.appendChild(b);
      });
      card.appendChild(qs); area.appendChild(card);
    });
  };

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
      if (sel.size < T.n) { api.feedback({ who: "marie", fr: "Choisis " + T.n + " réponses." }, false); return; }
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
    function count() { const w = words(ta.value); cnt.textContent = w + " mots (minimum " + T.min + ")"; cnt.classList.toggle("ok", w >= T.min); }
    ta.addEventListener("input", count); count();
    const b = el("button", "btn primary", G.ui.btn.valider);
    b.addEventListener("click", () => {
      const w = words(ta.value);
      if (w < T.min) { api.st.wrongs++; api.feedback({ who: "marie", fr: "Encore " + (T.min - w) + " mots, au moins." }, false); return; }
      api.complete({ text: ta.value.trim(), words: w, starters: Array.from(used).join(" | ") });
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
      '<rect x="40" y="135" width="30" height="14" rx="3" fill="#c0392b"/><text x="30" y="180" font-size="13" fill="#555">le banc rouge</text>' +
      '<rect x="365" y="95" width="26" height="26" fill="#777"/><text x="300" y="90" font-size="13" fill="#555">sortie</text>' +
      '<text x="300" y="282" font-size="13" fill="#555">sortie</text>' +
      '<text x="205" y="110" font-size="13" fill="#555">carrefour</text>' +
      '<text x="160" y="290" font-size="13" fill="#555" text-anchor="end">entrée</text>' +
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
    const phase2 = () => {
      wall.querySelectorAll("button").forEach(b => b.disabled = true);
      setFlag("L02_C");
      const pr = el("div", "proofpick");
      pr.appendChild(el("p", "q", esc(T.proofsIntro)));
      const sel = new Set(); const list = el("div", "picklist");
      S.proofs.forEach(pid => {
        const P = G.proofs[pid];
        const b = el("button", "btn opt", "<small>" + P.q + "</small> " + gl(P.text));
        b.addEventListener("click", () => { if (sel.has(pid)) { sel.delete(pid); b.classList.remove("on"); } else if (sel.size < 2) { sel.add(pid); b.classList.add("on"); } });
        list.appendChild(b);
      });
      pr.appendChild(list);
      const v = el("button", "btn primary", G.ui.btn.valider);
      v.addEventListener("click", () => {
        if (sel.size < 2) { api.feedback({ who: "marie", fr: "Choisis deux preuves." }, false); return; }
        const have = T.needed.filter(x => S.proofs.includes(x));
        if (have.length < 2) {
          const miss = T.needed.find(x => !S.proofs.includes(x));
          S.q2noted = true; save();
          api.feedback({ who: "marie", fr: T.missing[miss] }, false);
          api.st.wrongs++;
          const b = el("button", "btn", G.ui.btn.fermer); b.addEventListener("click", () => { closeModal(); S.resume = null; save(); goNode("SCENE_librairie"); });
          const bar = el("div", "bar"); bar.appendChild(b); api.feedback.bar = bar; $(".feedback", api.body).appendChild(bar);
          v.disabled = true;
          return;
        }
        if (T.needed.every(x => sel.has(x))) {
          addProof("pf_louvre"); setFlag("Q2_proven"); setFlag("L02_done"); refreshTop();
          api.complete({ text: "C ; preuves : " + Array.from(sel).join("+") }, T.success);
          v.disabled = true;
        } else { api.wrong(T.wrongProofs); }
      });
      pr.appendChild(v); area.appendChild(pr);
    };
    T.posters.forEach(p => {
      const card = el("div", "poster");
      card.appendChild(el("div", "pl", esc(p.id)));
      card.appendChild(el("div", "ptext", gl(p.text)));
      const b = el("button", "btn small", "C'est celui-ci");
      b.addEventListener("click", () => {
        if (p.ok) { card.classList.add("on"); phase2(); }
        else { if (p.flag) setFlag(p.flag); api.wrong(p.reply); }
      });
      card.appendChild(b); wall.appendChild(card);
    });
    area.appendChild(wall);
    if (flag("L02_C")) { $$(".poster", wall)[2].classList.add("on"); phase2(); }
  };

  TASKS.stamp = function (T, area, api) {
    let cur = null; const done = {};
    const stamps = el("div", "stamps");
    T.stamps.forEach(s => { const b = el("button", "btn stamp", esc(s.label)); b.addEventListener("click", () => { cur = s.id; $$(".stamp", stamps).forEach(x => x.classList.toggle("on", x === b)); }); stamps.appendChild(b); });
    area.appendChild(el("p", "q", "1. Choisis un tampon. 2. Clique sur la feuille."));
    area.appendChild(stamps);
    const sheets = el("div", "sheets");
    T.sheets.forEach(sh => {
      const card = el("button", "sheet");
      card.innerHTML = "<b>" + esc(sh.label) + "</b><div>" + gl(sh.text) + "</div>";
      card.addEventListener("click", () => {
        if (!cur) { api.feedback({ who: "marie", fr: "Choisis d'abord un tampon." }, false); return; }
        if (done[sh.id]) return;
        const key = sh.id + ":" + cur;
        if (sh.id === T.goal.sheet && cur === T.goal.stamp) { done[sh.id] = cur; card.classList.add("stamped"); card.appendChild(el("div", "mark", esc(T.stamps.find(s => s.id === cur).label))); api.complete({ text: Object.keys(done).map(k => k + ":" + done[k]).join(" ") }); }
        else if (T.bonus && sh.id === T.bonus.sheet && cur === T.bonus.stamp) { done[sh.id] = cur; card.classList.add("stamped"); card.appendChild(el("div", "mark", esc(T.stamps.find(s => s.id === cur).label))); api.feedback({ who: "lenoir", fr: "Oui, ça, c'est l'ancien programme. Et pour l'affiche C ?" }, true); }
        else api.wrong({ who: "lenoir", fr: T.replies[key] || T.replies[cur] || "Non, pas ce tampon." });
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
        const row = el("div", "line"); row.appendChild(portrait(n.who)); row.appendChild(el("div", "body", '<div class="who">' + esc(G.chars[n.who].name) + " · " + (si + 1) + "/3</div>")); dlg.appendChild(row);
        if (!hc) hc = helpCtl(n.help, { wrongs: () => st.wrongs, material: () => openCarnet(true) });
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
    body.appendChild(el("div", "paper", "<b>" + esc(pname(0)) + (twoPlayers() ? " & " + esc(pname(1)) : "") + "</b><br>Lieux visités : " + S.visited.length + " · Aides de Marie : " + helps + " · Durée : " + mins + " min · Preuves : " + S.proofs.length));
    body.appendChild(el("p", "", "Tu peux maintenant exporter le carnet (deux fichiers) et le donner à ton prof."));
    if (G.credits) body.appendChild(el("div", "credits", "<b>" + esc(G.credits.title) + "</b><br>" + G.credits.lines.map(esc).join("<br>")));
    const bar = el("div", "bar");
    const ex = el("button", "btn primary", G.ui.btn.exporter); ex.addEventListener("click", exportAll); bar.appendChild(ex);
    const ca = el("button", "btn", G.ui.btn.carnet); ca.addEventListener("click", () => openCarnet()); bar.appendChild(ca);
    const nw = el("button", "btn", G.ui.btn.nouvelle); nw.addEventListener("click", () => { if (confirm("Nouvelle partie ? La partie actuelle reste dans l'export.")) { archiveRun(); localStorage.removeItem(SAVE_KEY); location.reload(); } }); bar.appendChild(nw);
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
    const head = ["Datum", "Joueur", "Kennung", "Aufgabe", "Ergebnis", "Versuche", "Hilfestufe", "Wiederholungen", "Transkript", "Dauer_s", "Erstwahl", "Text"];
    const q = v => '"' + String(v === undefined || v === null ? "" : v).replace(/"/g, '""') + '"';
    const rows = diag.map(r => [r.date, r.player, r.id, G.diag[r.id] || "", r.result, r.attempts, r.help, r.replays, r.transcript === undefined ? "" : (r.transcript ? "ja" : "nein"), r.duration, r.first, r.text].map(q).join(";"));
    return "﻿" + head.join(";") + "\n" + rows.join("\n");
  }
  function exportAll() {
    const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
    const base = "pain-perdu_" + (pname(0) + (twoPlayers() ? "_" + pname(1) : "")).replace(/[^A-Za-z0-9À-ÿ_-]+/g, "_") + "_" + stamp;
    download(base + ".json", JSON.stringify(S, null, 2), "application/json");
    setTimeout(() => download(base + ".csv", csvRows(S.diag), "text/csv;charset=utf-8"), 400);
    toast("Export : " + base + ".json / .csv");
  }

  /* ---------- Carnet ---------- */
  function openCarnet(keep) {
    const body = openModal("carnet", keep);
    body.appendChild(el("h2", "", esc(G.ui.carnet.title)));
    if (S.mission) body.appendChild(el("div", "mission", "<b>" + esc(G.ui.carnet.mission) + " :</b> " + gl(S.mission)));
    QIDS.forEach(q => {
      const proven = isProven(q);
      const box = el("div", "qbox " + (proven ? "proven" : ""));
      box.appendChild(el("div", "qtitle", "<b>" + q + "</b> " + esc(G.questions[q].title) + ' <span class="status">' + (proven ? esc(G.ui.carnet.proven) : esc(G.ui.carnet.hyp) + (q === "Q2" && S.q2noted ? " (affiche C ?)" : "")) + "</span>"));
      const ul = el("ul", "proofs");
      S.proofs.filter(p => G.proofs[p].q === q).forEach(p => ul.appendChild(el("li", G.proofs[p].strong ? "strong" : "", gl(G.proofs[p].text))));
      if (!ul.children.length) ul.appendChild(el("li", "none", "—"));
      box.appendChild(el("div", "plabel", esc(G.ui.carnet.proofs))); box.appendChild(ul);
      body.appendChild(box);
    });
    const cards = Object.keys(S.cards);
    if (cards.length) {
      body.appendChild(el("h3", "", esc(G.ui.carnet.cards)));
      cards.forEach(cid => { const n = G.nodes[cid]; S.cards[cid].forEach(c => body.appendChild(el("div", "paper small", "<b>" + esc(n.title) + " · " + esc(c.player) + "</b><br>" + esc(c.text)))); });
    }
    body.appendChild(el("h3", "", esc(G.ui.carnet.notes)));
    const ta = el("textarea"); ta.rows = 4; ta.value = S.notes; ta.addEventListener("input", () => { S.notes = ta.value; save(); }); body.appendChild(ta);
    const bar = el("div", "bar");
    const ex = el("button", "btn", G.ui.btn.exporter); ex.addEventListener("click", exportAll); bar.appendChild(ex);
    const cl = el("button", "btn primary", G.ui.btn.fermer); cl.addEventListener("click", closeModal); bar.appendChild(cl);
    body.appendChild(bar);
  }

  /* ---------- Inventar ---------- */
  function openInventory(pickCb) {
    const body = openModal("inv", !!pickCb);
    body.appendChild(el("h2", "", esc(pickCb ? G.ui.inv.showTo + " " + pickCb.name + " :" : G.ui.inv.title)));
    const grid = el("div", "grid");
    if (!S.inv.length) grid.appendChild(el("p", "", esc(G.ui.inv.empty)));
    S.inv.forEach(id => {
      const it = G.items[id];
      const card = el("button", "item"); card.innerHTML = "<b>" + esc(it.name) + "</b><div>" + gl(it.desc) + "</div>";
      card.addEventListener("click", () => { if (pickCb) { closeModal(); pickCb.fn(id); } else { card.classList.toggle("open"); } });
      grid.appendChild(card);
    });
    body.appendChild(grid);
    const bar = el("div", "bar"); const cl = el("button", "btn", pickCb ? G.ui.btn.annuler : G.ui.btn.fermer); cl.addEventListener("click", closeModal); bar.appendChild(cl); body.appendChild(bar);
  }

  /* ---------- Karte ---------- */
  function openMap() {
    const body = openModal("map");
    body.appendChild(el("h2", "", "Paris"));
    const wrap = el("div", "mapwrap");
    wrap.innerHTML = '<svg viewBox="0 0 100 74" class="paris" aria-label="Carte de Paris">' +
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
      const missing = p.q2proof && !S.proofs.includes(p.q2proof) && !isProven("Q2");
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "place " + (unlocked ? "open" : "locked") + (done ? " done" : "") + (S.scene === p.id ? " here" : ""));
      g.innerHTML = "<title>" + esc(p.label) + "</title>" + '<circle cx="' + p.x + '" cy="' + p.y + '" r="3.2"/>' +
        (done ? '<text x="' + p.x + '" y="' + (p.y + 1.1) + '" class="chk" text-anchor="middle">✓</text>' : "") +
        (missing && unlocked && !done ? '<circle cx="' + (p.x + 2.6) + '" cy="' + (p.y - 2.6) + '" r="1.2" class="dot"/>' : "") +
        '<text x="' + p.x + '" y="' + (p.y + 6.2) + '" text-anchor="middle" class="lbl">' + esc(p.short || p.label) + "</text>" +
        '<text x="' + p.x + '" y="' + (p.y + 9.4) + '" text-anchor="middle" class="q">' + esc(unlocked ? p.q : G.ui.locked) + "</text>";
      g.addEventListener("click", () => {
        if (!unlocked) { toast("Marie : " + G.ui.marie.locked); return; }
        closeModal(); travel(p.id);
      });
      svg.appendChild(g);
    });
    body.appendChild(wrap);
    body.appendChild(el("p", "hint", "✓ = tâches faites · point rouge = il manque encore une preuve pour Q2"));
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
  function enterScene(id, runEnter) {
    const sc = G.scenes[id];
    S.scene = id; if (!S.visited.includes(id)) S.visited.push(id); save();
    $("#start").hidden = true; $("#game").hidden = false;
    setBg(stage, sc.bg);
    $$(".hotspot, .nobg", stage).forEach(h => h.remove());
    sc.hotspots.forEach(h => {
      if (h.hideIf && flag(h.hideIf)) return;
      if (h.showIf && !cond(h.showIf)) return;
      const b = el("button", "hotspot", "<span>" + esc(h.label) + "</span>");
      b.style.left = h.x + "%"; b.style.top = h.y + "%"; b.style.width = h.w + "%"; b.style.height = h.h + "%";
      b.addEventListener("click", e => { e.stopPropagation(); verbMenu(h, b); });
      stage.appendChild(b);
    });
    refreshTop();
    dlg.innerHTML = ""; dlg.classList.remove("active");
    if (runEnter && sc.enter) goNode(sc.enter);
  }
  function resolve(action) {
    if (typeof action === "string") return action;
    if (Array.isArray(action)) { for (const a of action) if (cond(a.if)) return a.node; }
    return null;
  }
  function verbMenu(h, btn) {
    $$(".verbs").forEach(v => v.remove());
    const m = el("div", "verbs");
    Object.keys(h.actions).forEach(v => {
      const b = el("button", "btn verb", esc(G.ui.verbs[v] || v));
      b.addEventListener("click", e => {
        e.stopPropagation(); m.remove();
        if (v === "montrer") {
          openInventory({ name: h.label, fn: item => { const node = h.actions.montrer[item]; if (node) goNode(node); else showLines([G.ui.inv.nothing]); } });
        } else { const node = resolve(h.actions[v]); if (node) goNode(node); }
      });
      m.appendChild(b);
    });
    btn.appendChild(m);
  }
  document.addEventListener("click", () => $$(".verbs").forEach(v => v.remove()));

  /* ---------- Lehrkraft-Ansicht ---------- */
  function openProf() {
    const body = openModal("prof");
    body.appendChild(el("h2", "", "Lehrkraft-Ansicht"));
    const bar = el("div", "bar");
    const unlock = el("button", "btn", "Tout débloquer"); unlock.addEventListener("click", () => { ["M00_done", "M02_done", "M03_done", "M04b_done", "P02_done", "P03_done", "P04_done", "P05_done", "P06_done", "B01a_done", "B03_open", "B04_done", "B05_done", "B06_done", "L02_C", "L02_done", "Q2_proven", "L04_done", "L05_done", "C01_found", "vosges_seen"].forEach(f => S.flags[f] = true); Object.keys(G.proofs).forEach(addProof); Object.keys(G.items).forEach(id => { if (!S.inv.includes(id)) S.inv.push(id); }); save(); refreshTop(); toast("Alles freigeschaltet"); }); bar.appendChild(unlock);
    const reset = el("button", "btn", "Spielstand löschen"); reset.addEventListener("click", () => { if (confirm("Spielstand auf diesem Gerät löschen?")) { localStorage.removeItem(SAVE_KEY); location.reload(); } }); bar.appendChild(reset);
    const exr = el("button", "btn", "Alle Ergebnisse (CSV)"); exr.addEventListener("click", () => { const all = JSON.parse(localStorage.getItem(RESULTS_KEY) || "[]"); download("pain-perdu_resultats.csv", csvRows(all.flatMap(r => r.diag)), "text/csv;charset=utf-8"); }); bar.appendChild(exr);
    body.appendChild(bar);
    body.appendChild(el("h3", "", "Sprung zu einem Knoten"));
    const jump = el("div", "jumps");
    const sceneOf = id => ({ S: "montmartre", M: "montmartre", P: "pere_lachaise", B: "marais", L: "librairie", V: "louvre", X: "vosges", C: "catacombes" })[id[0]];
    Object.keys(G.nodes).forEach(id => { const n = G.nodes[id]; const b = el("button", "btn small", id + " <small>" + n.type + (n.title ? " · " + esc(n.title) : "") + "</small>"); b.addEventListener("click", () => { closeModal(); const sc = sceneOf(id); if (sc && S.scene !== sc) enterScene(sc, false); if (!S.scene) enterScene(sc, false); goNode(id); }); jump.appendChild(b); });
    body.appendChild(jump);
    body.appendChild(el("h3", "", "Lösungen"));
    const sol = el("div", "paper small");
    sol.innerHTML = [
      "<b>M02</b> carte → Q1, ticket → Q2", "<b>M03</b> Vous avez vu cet homme ?", "<b>M04</b> ce matin = Père-Lachaise · cet après-midi = le Marais · ce soir = on ne sait pas",
      "<b>M04b</b> portait · regardions · a pris · est parti", "<b>P02</b> A (ou Montrer la photo)", "<b>P03</b> → Q1", "<b>P04</b> tout droit → à gauche", "<b>P06</b> fermeture rouge + autocollant jaune",
      "<b>B02</b> B oder C (A = Reparatur)", "<b>B02b</b> A", "<b>B04</b> a, c, e", "<b>B05</b> → Q4", "<b>L02</b> C ; Belege: pf_nom + pf_programme", "<b>L04</b> MODIFICATION auf C (Zusatz: ANCIEN PROGRAMME auf A)",
      "<b>V03</b> Schritt 1: A/B · Schritt 2: A/B · Schritt 3: boîte bleue + enveloppe rouge"
    ].join("<br>");
    body.appendChild(sol);
    body.appendChild(el("h3", "", "Transkripte"));
    Object.keys(G.audio).forEach(k => body.appendChild(el("div", "paper small", "<b>" + k + ".mp3 · " + esc(G.chars[G.audio[k].who].name) + "</b><br>" + esc(G.audio[k].text))));
    body.appendChild(el("h3", "", "Ergebnisse auf diesem Gerät"));
    const all = JSON.parse(localStorage.getItem(RESULTS_KEY) || "[]");
    const rows = all.flatMap(r => r.diag).concat(S.diag.filter(d => !all.some(r => r.started === S.started)));
    const tbl = el("table", "results");
    tbl.innerHTML = "<tr><th>Datum</th><th>Joueur</th><th>Kennung</th><th>Ergebnis</th><th>Versuche</th><th>Hilfe</th><th>Wdh.</th><th>Text</th></tr>" + rows.map(r => "<tr><td>" + esc(r.date.slice(0, 16).replace("T", " ")) + "</td><td>" + esc(r.player) + "</td><td>" + esc(r.id) + "</td><td>" + esc(r.result) + "</td><td>" + esc(r.attempts === undefined ? "" : r.attempts) + "</td><td>" + esc(r.help === undefined ? "" : r.help) + "</td><td>" + esc(r.replays === undefined ? "" : r.replays) + "</td><td>" + esc((r.text || r.first || "").slice(0, 80)) + "</td></tr>").join("");
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
  function startNew() {
    S = freshState();
    S.players = [$("#p1").value, $("#p2").value];
    S.leoLang = $("input[name=leo]:checked").value;
    save();
    $("#start").hidden = true; $("#game").hidden = false;
    S.scene = "montmartre"; enterScene("montmartre", false);
    goNode("S02");
  }
  function resumeGame() {
    $("#start").hidden = true; $("#game").hidden = false;
    enterScene(S.scene || "montmartre", false);
    if (S.resume) goNode(S.resume);
  }
  function init() {
    const saved = loadSave();
    if (saved && saved.v === 1) {
      S = saved;
      const b = $("#btn-resume"); b.hidden = false; b.textContent = G.ui.btn.reprendre + " (" + pname(0) + (saved.players[1] ? " & " + pname(1) : "") + ")";
      b.addEventListener("click", resumeGame);
      $("#p1").value = saved.players[0] || ""; $("#p2").value = saved.players[1] || "";
    }
    $("#btn-start").addEventListener("click", () => { if (!$("#p1").value.trim()) { $("#p1").focus(); $("#p1").classList.add("bad"); return; } if (S && S.diag && S.diag.length && !confirm("Nouvelle partie ? L'ancienne partie sera remplacée.")) return; startNew(); });
    $("#btn-carnet").addEventListener("click", () => openCarnet());
    $("#btn-map").addEventListener("click", () => openMap());
    $("#btn-inv").addEventListener("click", () => openInventory());
    $("#btn-gloss").addEventListener("click", openGlossary);
    $("#btn-lang").addEventListener("click", () => { S.leoLang = S.leoLang === "fr" ? "de" : "fr"; save(); toast("Leo : " + (S.leoLang === "fr" ? G.ui.start.fr : G.ui.start.de)); });
    if (PROF) { $("#btn-prof").hidden = false; $("#btn-prof").addEventListener("click", openProf); $("#node-id").hidden = false; }
    $("#title").textContent = G.ui.title; $("#subtitle").textContent = G.ui.subtitle;
    $("#ver").textContent = "v" + G.version + (PROF ? " · prof" : "");
  }
  window.PP = { get S() { return S; }, goNode, enterScene, openMap, openCarnet, exportAll, flag, save, PROF };
  init();
})();
