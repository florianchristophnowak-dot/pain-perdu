/* Deutsche Fassung: erzeugt die Engine de/js/game.js aus js/game.js (feste Texte übersetzt, Hörtexte als Lesetexte).
   Aufruf: node tools/build_de.js              schreibt de/js/game.js; nach jeder Änderung an js/game.js erneut ausführen
           node tools/build_de.js --zip DATEI  baut zusätzlich das Offline-Paket (Ordner pain-perdu-deutsch, braucht das Programm zip)
   Die Spieltexte der deutschen Fassung stehen in de/js/data.js, die Oberfläche in de/index.html.
   Passt ein Ersatz nicht mehr (js/game.js geändert), bricht das Skript mit der betroffenen Stelle ab. */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const R = String.raw;

/* [Original in js/game.js, Ersatz, Anzahl (Standard 1)] */
const PATCHES = [
  [R`const SAVE_KEY = "pp_save_v1", RESULTS_KEY = "pp_results_v1";`, R`const SAVE_KEY = "pp_de_save_v1", RESULTS_KEY = "pp_de_results_v1";`],
  [R`(i === 0 ? "Joueur 1" : "Joueur 2")`, R`(i === 0 ? "Spieler 1" : "Spieler 2")`],
  [R`frVoice = vs.find(v => /^fr[-_]FR/i.test(v.lang)) || vs.find(v => /^fr/i.test(v.lang)) || null;`, R`frVoice = vs.find(v => /^de[-_]DE/i.test(v.lang)) || vs.find(v => /^de/i.test(v.lang)) || null;`],
  [R`u.lang = "fr-FR";`, R`u.lang = "de-DE";`],
  [R`toast("Inventaire : " + G.items[id].name)`, R`toast("Inventar: " + G.items[id].name)`],
  [R`toast("Marie : " + G.ui.marie.afterHelp)`, R`toast("Marie: " + G.ui.marie.afterHelp)`],
  [R`toast("Marie : " + (p.lockedMsg`, R`toast("Marie: " + (p.lockedMsg`],
  [R`'<div class="who">Marie · ' + level + "/4</div><div class=\"text" + (level === 4 ? " de" : "") + '">' + (level === 4 ? esc(txt) : gl(txt)) + "</div>"`, R`'<div class="who">Marie · ' + level + '/4</div><div class="text">' + gl(txt) + "</div>"`],
  [R`    body.appendChild(el("h2", "", esc(G.chars[a.who].name)));
    const row = el("div", "audio-row"); row.appendChild(portrait(a.who));
    const play = el("button", "btn play", "▶ " + G.ui.verbs.ecouter);
    const start = onBlocked => { play.textContent = "▶ " + G.ui.btn.rejouer; playAudio(n.audio, play, onBlocked); };
    play.addEventListener("click", () => start());
    row.appendChild(play);
    const tr = el("button", "btn", G.ui.btn.transcription);
    const trBox = el("div", "paper transcript", gl(a.text)); trBox.hidden = true;
    const canTranscript = PROF || (S.helpUsed[n.transcriptHelp] || 0) >= 3;
    tr.hidden = !canTranscript;
    tr.addEventListener("click", () => { trBox.hidden = !trBox.hidden; S.transcripts[n.audio] = true; save(); });
    row.appendChild(tr); body.appendChild(row); body.appendChild(trBox);
    body.appendChild(el("p", "hint", "Tu peux écouter plusieurs fois."));`, R`    /* deutsche Fassung: der Hörtext erscheint als Lesetext, das Porträt steht neben dem Namen (auf dem Handy bleibt die volle Breite für den Text) */
    const head = el("h2", "readhead"); head.appendChild(portrait(a.who)); head.appendChild(document.createTextNode(G.chars[a.who].name)); body.appendChild(head);
    body.appendChild(el("div", "paper transcript readtext", gl(a.text)));
    S.transcripts[n.audio] = true; save();
    body.appendChild(el("p", "hint", "Lies genau: Diese Infos brauchst du gleich."));`],
  [R`    bar.appendChild(b); body.appendChild(bar);
    setTimeout(() => start(() => { play.textContent = "▶ " + G.ui.verbs.ecouter; }), 300);
  }`, R`    bar.appendChild(b); body.appendChild(bar);
  }`],
  [R`      const play = el("button", "btn play", "▶ " + G.ui.btn.rejouer);
      play.addEventListener("click", () => playAudio(n.audio, play));
      tools.appendChild(play);
      trBox.innerHTML = gl(a.text);
      const tr = el("button", "btn", G.ui.btn.transcription);
      const can = () => PROF || (S.helpUsed[n.help] || 0) >= 3;
      tr.hidden = !can();
      tr.addEventListener("click", () => { trBox.hidden = !trBox.hidden; st.transcript = true; S.transcripts[n.audio] = true; save(); });
      tools.appendChild(tr);
      st.showTranscript = () => { tr.hidden = false; trBox.hidden = false; st.transcript = true; };`, R`      trBox.innerHTML = "<b>" + esc(G.chars[a.who].name) + ":</b> " + gl(a.text);
      const tr = el("button", "btn read", "📄 " + G.ui.btn.rejouer);
      tr.addEventListener("click", () => { trBox.hidden = !trBox.hidden; if (!trBox.hidden) { S.replays[n.audio] = (S.replays[n.audio] || 0) + 1; st.transcript = true; S.transcripts[n.audio] = true; save(); } });
      tools.appendChild(tr);
      st.showTranscript = () => { if (trBox.hidden) tr.click(); };`],
  [R`(who ? "<b>" + esc(who) + " :</b> " : "")`, R`(who ? "<b>" + esc(who) + ":</b> " : "")`],
  [R`api.feedback({ who: "marie", fr: "Choisis " + T.n + " réponses." }, false)`, R`api.feedback({ who: "marie", fr: "Wähle " + T.n + " Antworten." }, false)`],
  [R`cnt.textContent = w + " mots (minimum " + T.min + ")";`, R`cnt.textContent = w + " Wörter (mindestens " + T.min + ")";`],
  [R`fr: "Encore " + (T.min - w) + " mots, au moins." }`, R`fr: "Noch mindestens " + (T.min - w) + " Wörter." }`],
  [R`fill="#555">le banc rouge</text>`, R`fill="#555">die rote Bank</text>`],
  [R`fill="#555">sortie</text>`, R`fill="#555">Ausgang</text>`, 2],
  [R`fill="#555">carrefour</text>`, R`fill="#555">Kreuzung</text>`],
  [R`text-anchor="end">entrée</text>`, R`text-anchor="end">Eingang</text>`],
  [R`el("button", "btn small", "C'est celui-ci")`, R`el("button", "btn small", "Dieser hier")`],
  [R`area.appendChild(el("p", "q", "1. Choisis un tampon. 2. Clique sur la feuille."));`, R`area.appendChild(el("p", "q", "1. Wähle einen Stempel. 2. Klicke auf das Blatt."));`],
  [R`api.feedback({ who: "marie", fr: "Choisis d'abord un tampon." }, false)`, R`api.feedback({ who: "marie", fr: "Wähle zuerst einen Stempel." }, false)`],
  [R`fr: "Oui, ça, c'est l'ancien programme. Et pour l'affiche C ?" }`, R`fr: "Ja, das ist das alte Programm. Und Aushang C?" }`],
  [R`|| "Non, pas ce tampon." }`, R`|| "Nein, nicht dieser Stempel." }`],
  [R`"</b><br>Lieux visités : " + S.visited.length + " · Aides de Marie : " + helps + " · Durée : " + mins + " min · Questions réglées : "`, R`"</b><br>Besuchte Orte: " + S.visited.length + " · Hilfen von Marie: " + helps + " · Dauer: " + mins + " Min. · Geklärte Fragen: "`],
  [R`"Tu peux maintenant exporter le carnet (deux fichiers) et le donner à ton prof."`, R`"Jetzt kannst du die Fallakte exportieren (zwei Dateien)."`],
  [R`confirm("Nouvelle partie ? La partie actuelle reste dans l'export.")`, R`confirm("Neues Spiel? Das jetzige Spiel bleibt im Export erhalten.")`],
  [R`const head = ["Datum", "Joueur",`, R`const head = ["Datum", "Spieler",`],
  [R`esc(G.ui.carnet.mission) + " :</b> "`, R`esc(G.ui.carnet.mission) + ":</b> "`],
  [R`esc(pickCb ? G.ui.inv.showTo + " " + pickCb.name + " :" : G.ui.inv.title)`, R`esc(pickCb ? fmtTpl(G.ui.inv.showTo, { to: pickCb.to || pickCb.name }) : G.ui.inv.title)`],
  [R`openInventory({ name: h.label, fn: item =>`, R`openInventory({ name: h.label, to: h.to, fn: item =>`],
  [R`aria-label="Carte de Paris"`, R`aria-label="Stadtplan von Paris"`],
  [R`el("p", "hint", "✓ = tâches faites")`, R`el("p", "hint", "✓ = Aufgaben erledigt")`],
  [R`el("button", "btn", "Tout débloquer")`, R`el("button", "btn", "Alles freischalten")`],
  [R`    const pq = el("a", "btn", "Quiz + Lösungen (Druck)"); pq.href = "quiz.html?prof=1"; pq.target = "_blank"; bar.appendChild(pq);
`, R``],
  [R`      "<b>M03</b> Vous avez vu cet homme ?", "<b>M04</b> ce matin = Père-Lachaise · cet après-midi = le Marais · ce soir = on ne sait pas",
      "<b>M04b</b> portait · regardions · a pris · est parti", "<b>P02</b> A (ou Montrer la photo)", "<b>P04</b> tout droit → à gauche", "<b>P06</b> fermeture rouge + autocollant jaune",
      "<b>B02</b> B oder C (A = Reparatur)", "<b>B02b</b> A", "<b>B04</b> a, c, e", "<b>L02</b> C", "<b>L04</b> MODIFICATION auf C (Zusatz: ANCIEN PROGRAMME auf A)",
      "<b>V03</b> Schritt 1: A/B · Schritt 2: A/B", "<b>C03</b> les vieux panneaux · en carton · son sac brun", "<b>V02b</b> à droite · derrière · éteinte · allumée"`, R`      "<b>M03</b> Haben Sie diesen Mann gesehen?", "<b>M04</b> heute Morgen = Père-Lachaise · heute Nachmittag = Le Marais · heute Abend = weiß man nicht",
      "<b>M04b</b> einen gestreiften Pullover · das Foto anschauten · die Tasche an der Treppe · zur Métro", "<b>P02</b> A (oder das Foto zeigen)", "<b>P04</b> geradeaus → links", "<b>P06</b> roter Reißverschluss + gelber Aufkleber",
      "<b>B02</b> B oder C (A = Umweg)", "<b>B02b</b> A", "<b>B04</b> a, c, e", "<b>L02</b> C", "<b>L04</b> ÄNDERUNG auf C (Zusatz: ALTES PROGRAMM auf A)",
      "<b>V03</b> Schritt 1: A/B · Schritt 2: A/B", "<b>C03</b> die alten Schilder · aus Pappe · seine braune Tasche", "<b>V02b</b> rechts · hinter · aus · an"`],
  [R`body.appendChild(el("h3", "", "Transkripte"));`, R`body.appendChild(el("h3", "", "Lesetexte (statt Hörtexte)"));`],
  [R`"<b>" + k + ".mp3 · " + esc(G.chars[G.audio[k].who].name)`, R`"<b>" + k + " · " + esc(G.chars[G.audio[k].who].name)`],
  [R`<tr><th>Datum</th><th>Joueur</th>`, R`<tr><th>Datum</th><th>Spieler</th>`],
  [R`el("button", "btn snd", "🔇 Son")`, R`el("button", "btn snd", "🔇 Ton")`],
  [R`snd.textContent = v.muted ? "🔇 Son" : "🔊 Son";`, R`snd.textContent = v.muted ? "🔇 Ton" : "🔊 Ton";`],
  [R`el("button", "btn skip", "Passer l'intro ▸")`, R`el("button", "btn skip", "Intro überspringen ▸")`],
  [R`big.setAttribute("aria-label", "Lancer l'intro")`, R`big.setAttribute("aria-label", "Intro starten")`],
  [R`!confirm("Nouvelle partie ? L'ancienne partie sera remplacée.")`, R`!confirm("Neues Spiel? Das alte Spiel wird ersetzt.")`]
];

function engine(assets) {
  let s = fs.readFileSync(path.join(ROOT, 'js/game.js'), 'utf8');
  for (const [from, to, n = 1] of PATCHES) {
    const got = s.split(from).length - 1;
    if (got !== n) throw new Error('js/game.js: erwartet ' + n + 'x, gefunden ' + got + 'x:\n' + from.slice(0, 200));
    s = s.split(from).join(to);
  }
  s = s.replace(/(["(])assets\//g, '$1' + assets);   // Bilder und Video liegen online eine Ebene höher
  return '/* Automatisch erzeugt von tools/build_de.js aus js/game.js – nicht von Hand ändern. */\n' + s;
}

const LIESMICH = `L'affaire du pain perdu – deutsche Testfassung
==============================================

So geht's:
1. Den ganzen Ordner entpacken (nicht nur index.html herausziehen).
2. index.html doppelklicken. Das Spiel öffnet sich im Browser und
   braucht kein Internet.
3. Der Spielstand wird automatisch im Browser gespeichert.
   „Weiterspielen“ im Startmenü macht dort weiter.

Gut zu wissen:
- Alle Texte sind auf Deutsch. Die Hörtexte der Figuren erscheinen
  als Lesetexte, mit „Text noch mal lesen“ bei den Aufgaben.
- Ein Blatt Papier und ein Stift helfen: Das Spiel schreibt nichts
  für euch auf. Vorlage zum Ausdrucken: zettel.html
- Am besten zu zweit spielen (zwei Vornamen eintragen).
- Auf dem Tablet oder Handy am besten quer halten.
- Das Lexikon (oben rechts) erklärt Pariser Orte und Wörter;
  gepunktet unterstrichene Wörter kann man anklicken.
`;

/* Offline-Paket: alles in einem Ordner, ohne die französischen Aufnahmen */
function offline(zipFile) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pp-de-'));
  const out = path.join(tmp, 'pain-perdu-deutsch');
  fs.cpSync(path.join(ROOT, 'assets'), path.join(out, 'assets'), { recursive: true, filter: src => !src.includes(path.join('assets', 'audio')) });
  fs.mkdirSync(path.join(out, 'css')); fs.mkdirSync(path.join(out, 'js'));
  fs.copyFileSync(path.join(ROOT, 'css/style.css'), path.join(out, 'css/style.css'));
  fs.copyFileSync(path.join(ROOT, 'de/css/de.css'), path.join(out, 'css/de.css'));
  fs.copyFileSync(path.join(ROOT, 'js/prof.js'), path.join(out, 'js/prof.js'));
  fs.copyFileSync(path.join(ROOT, 'de/js/data.js'), path.join(out, 'js/data.js'));
  fs.writeFileSync(path.join(out, 'js/game.js'), engine('assets/'));
  fs.copyFileSync(path.join(ROOT, 'de/zettel.html'), path.join(out, 'zettel.html'));
  for (const f of ['index.html', 'manifest.webmanifest']) fs.writeFileSync(path.join(out, f), fs.readFileSync(path.join(ROOT, 'de', f), 'utf8').replace(/"\.\.\//g, '"'));
  fs.writeFileSync(path.join(out, 'LIESMICH.txt'), LIESMICH);
  const target = path.resolve(zipFile);
  if (fs.existsSync(target)) fs.unlinkSync(target);
  execFileSync('zip', ['-qr', '-X', target, 'pain-perdu-deutsch'], { cwd: tmp });
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('Offline-Paket:', target);
}

fs.writeFileSync(path.join(ROOT, 'de/js/game.js'), engine('../assets/'));
console.log('geschrieben: de/js/game.js');
const zi = process.argv.indexOf('--zip');
if (zi > 0) offline(process.argv[zi + 1] || 'pain-perdu_deutsch_offline.zip');
