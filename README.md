# L'affaire du pain perdu

Ein Point-and-Click-Abenteuer auf Französisch (Niveau A2) für die Klasse 10: Eine Klasse aus Erfurt sucht in Paris den Klassenrucksack „Bernd“, den ein Pantomime versehentlich mitgenommen hat. Lino ermittelt zusammen mit Marie, einer guten Freundin aus Paris (befreundet, kein Paar; die beiden kennen sich aus einem deutsch-französischen Ferienlager). Marie kennt sich in ihrer Stadt aus und gibt die Hilfen. Das Spiel prüft Hör- und Leseverstehen, den Wechsel von imparfait und passé composé sowie kommunikative Grammatik (passende Fragen, höfliche Reparatur, Wegbeschreibung).

**Spielen:** https://florianchristophnowak-dot.github.io/pain-perdu/
**Lehrkraft-Ansicht:** https://florianchristophnowak-dot.github.io/pain-perdu/?mode=prof (fragt nach dem Code der Lehrkraft)
**Teil 2 « Le guide fantôme » und Teil 3 « Le voyageur de 1900 »:** starten aus demselben Startmenü, sobald der Teil davor geschafft ist oder das Schlüsselwort eingegeben wurde (siehe [Drei Teile und Schlüsselwörter](#drei-teile-und-schlüsselwörter), [Teil 2](#teil-2-le-guide-fantôme) und [Teil 3](#teil-3-le-voyageur-de-1900)). Die alten Links `…/guide-fantome/` und `…/voyageur/` führen ins Startmenü.

## Aufbau

| Datei | Inhalt |
| --- | --- |
| `index.html` | Oberfläche (Startbildschirm, Bühne, Fenster) |
| `css/style.css` | Gestaltung |
| `js/data.js` | Alle Texte und Spieldaten: Szenen, Hotspots, Dialogknoten (S02 … V06), Aufgaben, Hilfestufen, Glossar. Kennungen wie im Drehbuch. |
| `js/game.js` | Spiel-Engine: Szenen, Dialoge, Aufgabentypen, Carnet, Karte, Inventar, Hilfe, Speichern, Export, Lehrkraft-Ansicht |
| `js/prof.js` | Code-Abfrage für Lehrkraft-Ansicht und Quiz-Lösungen (im Quelltext steht nur eine Prüfsumme) |
| `js/audioplayer.js` | Audioplayer der Hörtexte für alle Teile: Pause, 5 s zurück und vor, Tempo bis 80 % (siehe [Hörtexte: Audioplayer](#hörtexte-audioplayer)) |
| `assets/img/` | Hintergründe, Zwischensequenzen, Porträts |
| `assets/audio/` | Hörtexte (MP3) |

Kein Build, kein Server nötig: `index.html` lässt sich auch direkt im Browser öffnen. GitHub Pages veröffentlicht den Stand von `main` automatisch (Workflow in `.github/workflows/pages.yml`). Voraussetzung: In den Repository-Einstellungen ist unter „Pages“ die Quelle „GitHub Actions“ gewählt; jeder Push auf `main` löst dann die Veröffentlichung aus.

## Bilder und Aufnahmen ergänzen

Die Platzhalter werden ersetzt, sobald eine Datei mit dem passenden Namen liegt. Hintergründe und Zwischensequenzen sucht das Spiel zuerst als `.jpg`, dann als `.png` (Gegenstände umgekehrt); fehlt ein Porträt, zeigt es Initialen; fehlt eine Aufnahme, liest der Browser den Text vor.

| Typ | Dateien (in `assets/img/` bzw. `assets/audio/`) |
| --- | --- |
| Hintergründe | `bg_montmartre`, `bg_pere_lachaise`, `bg_boulangerie`, `bg_librairie`, `bg_louvre_cour`; Phase 2: `bg_catacombes`, `bg_lampes` |
| Zwischensequenzen | `cut_confusion`, `cut_final` |
| Porträts (quadratisch, PNG) | `pt_lino`, `pt_marie`, `pt_kiosque`, `pt_gardien`, `pt_chloe`, `pt_nora`, `pt_lenoir`, `pt_marcel`, `pt_assistante` |
| Aufnahmen (MP3) | `au_kiosque.mp3`, `au_gardien.mp3`, `au_marcel.mp3`; Phase 2: `au_assistante.mp3`, `au_chloe.mp3` |

Die Hotspot-Positionen stehen in `js/data.js` (`scenes`, Angaben in Prozent des Bildes) und werden nach dem Bildtausch angepasst.

## Lehrkraft-Ansicht und Export

- `?mode=prof` fragt einmal pro Browser-Tab nach dem Code der Lehrkraft und zeigt dann Sprungmarken zu jedem Knoten, Lösungen, Mustertexte zu den Schreibaufgaben, Transkripte, „Tout débloquer“ und die Ergebnisse auf diesem Gerät. Ohne Code startet das normale Spiel. Der Code steht nicht im Repository, nur seine Prüfsumme in `js/prof.js`; einen neuen Code setzt man, indem man in der Browser-Konsole `ppProf.hash("neuer code")` eingibt und das Ergebnis dort bei `HASH` einträgt.
- Die Lernenden exportieren am Ende (oder jederzeit aus dem Carnet) zwei Dateien: JSON (alles) und CSV (eine Zeile je Aufgabe und Person: Ergebnis, Versuche, Hilfestufe, Wiederholungen, Transkript, Dauer, Text).
- Der Spielstand liegt im `localStorage` des Browsers; „Continuer la partie“ nimmt ihn wieder auf. Der Knopf „Menu“ oben links (Haus-Symbol, auch auf dem Endbildschirm) führt zurück zum Startmenü, der Stand bleibt dabei gespeichert. Wer dort eine neue Partie beginnt, behält die alte in den Ergebnissen auf diesem Gerät.
- Der Testzugang `window.PP` (Sprünge, Flags) existiert nur in der Lehrkraft-Ansicht oder mit `?test=1` für die automatischen Tests; `?test=1` wirkt nur auf dem eigenen Rechner (localhost), nicht auf der veröffentlichten Seite.

## Merken statt notieren: Abfragen im Spiel

Das Spiel gibt keine Notier-Hinweise und speichert keine Hinweise für die Schüler. Was wichtig ist, merken sie sich oder schreiben es auf ein Blatt (`zettel.html`, Modell zum Ausdrucken, auch als `druck/Fiche_enquete.pdf`). An sechs späteren Stellen fragt das Spiel die Informationen ab; die Antworten werden getippt (Knotentyp `task`, `kind: "recall"`, Felder `fields` oder Lücken `parts`, Prüfung ohne Groß-/Kleinschreibung und Akzente, `answers`, `keywords` (zählen nur am Wortanfang: « sac » trifft « sacs », nicht « ressac »), `number` oder `digits`). Wer es nicht weiß, kann „Revenir plus tard“ wählen und nachsehen; nach dem zweiten Fehlversuch nennt die Figur den Ort, an dem die Information steht. Nach drei falschen Versuchen ist die Abfrage eine Minute gesperrt, ab der zweiten Sperre zwei Minuten (auch nach „Revenir plus tard“ und nach Neuladen), damit Raten nicht schneller ist als Nachsehen. Dieselbe Sperre gilt für alle Aufgaben (siehe „Gegen Raten und Durchklicken“). Ein einzelner Tippfehler in Wörtern ab fünf Buchstaben ohne Ziffern zählt als richtig; Lesefallen wie „Duval“ bleiben falsch.

Die freien Texte (`kind: "write"`: Nachricht an M. Nowak `B06`, Abschlussbericht `V05`) zählen nur echte Wörter: mindestens ein Vokal, kein Buchstabe dreimal hintereinander, einzelne Buchstaben nur à/a/y (Zahlen, Uhrzeiten wie 17 h, M. und Abkürzungen wie SMS zählen). Ein Satzanfang mit „...“ muss mit eigenen Wörtern weitergeführt werden, „...“ mitten im Satzanfang muss ersetzt sein. Ab drei Nicht-Wörtern oder bei ständig denselben Wörtern lehnt Marie den Text ab. Die eigenen Wörter (ohne die eingefügten Satzanfänge) müssen außerdem französisch sein und von der Geschichte erzählen; Einfügen ist gesperrt (siehe „Gegen Raten und Durchklicken“). Die Rückmeldungen stehen in `G.ui.write`.

| Stelle | Wer fragt | Abgefragt | Quelle im Spiel |
|---|---|---|---|
| `L02q` Librairie, vor den Aushängen | M. Lenoir | Nachname des Pantomimen (zwei Marcel spielen das Stück) | Wärter auf dem Père-Lachaise (Hörtext) |
| `V01q` Louvre | die Assistentin | vollständiger Name, Uhrzeit | Aushang C (`L02r`, am Panneau nachlesbar) |
| `V03q` Finale | Marcel | Inhalt des Rucksacks mit Orten (devant, bleue, Kevin, rouge, billets) | `M00` am Anfang, Kevins SMS (Telefon im Inventar), Notfall: Nachricht an Nowak (Telefon, ab `L05`) |
| `X01t` Place des Vosges | der Musiker | neuer Spielort (Louvre) | Aushang C |
| `C02t` Catacombes | die Angestellte | Tag und Uhrzeit des Treffens | Karte „demain“ im Inventar |
| `C02n` Anruf | Marie | Chloés Telefonnummer | Karte „demain“ im Inventar |

Das Carnet zeigt nur die Mission, die vier Fragen (mit „réglé“, sobald die passende Abfrage bestanden ist) und die eigenen Texte. Das Inventar enthält nur Gegenstände mit kurzer Beschreibung; die Aushänge bleiben am Panneau in der Buchhandlung. Die Diagnose-Kennungen der Abfragen: `D_L02q`, `D_V01q`, `D_V03q`, `D_X01`, `D_C02`, `D_C02n`; `D_NOWAK` zählt, wie oft Nowak nach dem Inhalt gefragt wurde. In der Lehrkraft-Ansicht listet „Abfragen im Spiel“ alle Fragen mit Antwort und Fundort.

Druckvorlagen (auch aus der Lehrkraft-Ansicht verlinkt):

| Datei | Inhalt |
|---|---|
| `zettel.html` | Notizblatt für die Schüler (Q1–Q4 + Sonstiges) |
| `quiz.html` | optionales Quiz für die Folgestunde, 20 Punkte + Bonus; `quiz.html?prof=1` hängt nach Eingabe des Lehrkraft-Codes das Lösungsblatt an |

Fertige PDFs (A4) liegen im Ordner `druck/`: `Fiche_enquete.pdf`, `Quiz_eleves.pdf`, `Quiz_mit_Loesungen.pdf`. Das Lösungs-PDF liegt nur im Repository; beim Veröffentlichen lässt der Workflow es (und `tools/`) weg. Sie sind aus den beiden HTML-Seiten erzeugt; nach Textänderungen genügt auch „Drucken → als PDF speichern“ im Browser. Der Abspann steht in `G.credits`.

## Auf dem Smartphone

Das Spiel läuft auch auf Handys, am besten im Querformat: Dann füllt das Bild den Bildschirm, und der Dialog liegt unten auf dem Bild. Im Hochformat steht das Bild oben und der Dialog darunter; ein Hinweis (einmal wegtippen) schlägt vor, das Telefon zu drehen.

- Kopfzeile: eine Zeile mit Symbolen (Carnet, Carte, Inventaire, Glossaire, Lino FR/DE), im Querformat mit kurzer Beschriftung. Auf Android und Tablets gibt es zusätzlich „Plein écran“.
- Bühne: Im Hochformat stehen die Beschriftungen erst im Menü, das beim Antippen erscheint („la dame du kiosque · Parler · Montrer“). Das Menü bleibt immer ganz im Bild, kleine Hotspots haben eine Tippfläche von mindestens 44 px.
- Fenster nutzen fast den ganzen Bildschirm; Zwischensequenzen stehen im Querformat neben dem Text, die Karte links neben dem Titel.
- Hörtexte: Handys spielen Ton erst nach Antippen ab. Startet die Aufnahme nicht von selbst, wartet der Knopf „Écouter“; die Computerstimme springt nur ein, wenn die Datei fehlt. Der Player steht auf dem Handy in drei Zeilen (Knöpfe, Balken, Tempo); auf sehr schmalen Geräten zeigt der Abspielknopf nur das Symbol.
- Abfragen: keine Autokorrektur, für die Telefonnummer das Ziffernfeld; die Tastatur öffnet sich erst, wenn man ins Feld tippt.
- Export: Auf Handy und Tablet öffnet „Exporter le carnet“ das Teilen-Menü mit beiden Dateien (Mail, AirDrop, Teams …); geht das nicht, werden die Dateien heruntergeladen.
- Zum Home-Bildschirm hinzufügen (Safari: Teilen → „Zum Home-Bildschirm“, Chrome: Menü → „App installieren“) startet das Spiel ohne Browserleiste, mit Bernd als Symbol (`manifest.webmanifest`, `assets/icons/`). Achtung iPhone: Die Home-Bildschirm-Version hat einen eigenen Spielstand, getrennt von Safari.

## Hörtexte: Audioplayer

Alle Hörtexte in Teil 1, 2 und 3 laufen über denselben Player (`js/audioplayer.js`, Stile in `css/style.css` unter „Audioplayer“): im Hörtext-Fenster (startet von selbst), in den Aufgaben zum Hörtext (startet erst auf Antippen) und in der Hilfe « Écoute encore … » (spielt den Player der Aufgabe von vorn).

- **Abspielen und Pause:** Der große Knopf wechselt zwischen « Écouter », « Pause », « Reprendre » und am Ende « Rejouer » (von vorn). Liest der Browser vor (Aufnahme fehlt), gibt es auf Android keine Pause: Dort bricht `speechSynthesis.pause()` das Vorlesen ab, ohne weiterzumachen oder ein Ende zu melden. Der Knopf ruht dann, bis der Text zu Ende ist.
- **5 Sekunden zurück und vor:** zwei Knöpfe neben dem Balken; den Balken kann man auch ziehen oder antippen. Am Ende spielt « 5 s zurück » das letzte Stück gleich noch einmal.
- **Tempo:** « Vitesse » 100 %, 95 %, 90 %, 85 % oder 80 %; die Tonhöhe bleibt gleich. Das Tempo gilt für alle Hörtexte und alle drei Teile auf diesem Gerät (`localStorage` `pp_audio_rate`). Liest der Browser vor (Aufnahme fehlt), gilt das Tempo ab dem nächsten Start.
- **Erst ganz hören:** „Continuer“ im Hörtext-Fenster und die Antworten bei `listenFirst` gehen erst auf, wenn mindestens 90 % der Aufnahme wirklich gelaufen sind (`S.heard`). Wer vorspult und das Ende erreicht, bekommt den Hinweis « Tu as sauté un passage. Écoute-le aussi. » (Teil 3: « Vous avez … », `G.ui.player`).
- **Begrenztes Hören:** Beim Telefonat in Teil 2 (`E03`, `maxPlays: 2`) gibt es Pause und Tempo, aber kein Spulen, sonst wäre die Grenze wirkungslos; « Encore 1 fois » zählt nur neue Durchgänge von vorn. In `E04` (`noReplay`) bringt Linos Hilfe « Écoute encore le téléphone » einen eigenen Player ohne Spulen mit.
- **Zählung im Export:** „Wiederholungen“ (`S.replays`) zählt wie bisher jeden Start von vorn, nicht Pausen oder Sprünge.
- **Server ohne Teilstücke:** Manche Server (z. B. `python3 -m http.server`) liefern keine Range-Anfragen; dann springt der Browser beim Spulen an den Anfang. Der Player lädt die Datei in diesem Fall einmal ganz (Blob) und springt dann richtig. GitHub Pages und das Offline-Paket (Datei direkt geöffnet) brauchen das nicht.
- Texte der Knöpfe: Standard in `js/audioplayer.js` (`L0`), einzelne Texte lassen sich je Teil über `G.ui.player` ersetzen. Die deutsche Fassung zeigt die Hörtexte weiter als Lesetexte, ohne Player.
- **Test:** `node tools/hoeren.js` (lokaler Server wie unter „Test“, Bildschirmfotos in `test-shots/hoeren/`) prüft Pause, Spulen, Tempo, die 90-%-Regel, die Grenze beim Telefonat, die Hilfe und die Darstellung auf Computer und Handy (hoch, quer, 320 px).

## Herunterladen und offline spielen

Auf GitHub „Code → Download ZIP“ wählen, entpacken und `index.html` im Browser öffnen. Alle Bilder, Hörtexte und die Titelschrift liegen im Ordner und brauchen keine Internetverbindung; der Spielstand wird im Browser gespeichert. Teil 2 liegt im Ordner `guide-fantome/`, Teil 3 im Ordner `voyageur/`; beide starten ebenfalls aus `index.html`.

Die früheren Kennungen `D_M02`, `D_P03` und `D_B05` (Zuordnungsaufgaben) gibt es nicht mehr. Der Abspann steht in `G.credits`.

## Gegen Raten und Durchklicken

Wer kein Französisch kann und nur klickt, soll nicht durchkommen. Auswahlaufgaben lassen sich nie ganz gegen Raten schützen; das Spiel sorgt deshalb dafür, dass Raten langsamer ist als Lesen und Zuhören, und dass die Stellen, an denen es weitergeht, Französisch verlangen:

- **Gemischte Antworten:** Dialogantworten mit einer falschen Option (z. B. `M03`, `P05`, `B02`, Finale `V03`) und die Optionen in Auswahl-, Zuordnungs-, Lücken- und Wegaufgaben stehen jedes Mal in neuer Reihenfolge. Die richtige Antwort steht also nicht mehr meist oben.
- **Pause nach Fehlversuchen:** In jeder Aufgabe (Zuordnen, Lücken, Auswahl, Weg, Aushang, Stempel, Abfrage) sperrt jeder dritte Fehlversuch die Aufgabe für eine Minute, danach für zwei. Marie sagt: „Là, tu devines.“ Hören, Transkript und Hilfe bleiben in der Pause nutzbar, die Sperre übersteht Neuladen. Leere Lücken zählen nicht als Versuch. Konstanten: `GUESS_TRIES`, `GUESS_PAUSE` in `js/game.js`, Texte in `G.ui.guess`.
- **Nur die Anzahl:** Bei Lücken und Zuordnungen (`M04`, `M04b`, `C03`, `V02b`) sagt das Spiel nach einem Fehlversuch nur noch „Juste : 2 sur 4.“ und markiert keine einzelne Lücke mehr. Sonst wäre Durchprobieren in zwei Klicks erledigt.
- **Aushang begründen:** Nach dem richtigen Aushang (`L02`) fragt Lenoir nach zwei Belegen (Name und Fassung, `task.proof`), wie im Konzept vorgesehen („den aktuellen Eintrag mit zwei Belegen begründen“). „17 h“, der Titel und „eine Cour“ zählen nicht, weil sie auf mehreren Aushängen stehen.
- **Freie Texte:** Die eigenen Wörter müssen französisch sein (`G.writeLang`: mindestens 20 % häufige französische Wörter, ab drei deutschen oder englischen Wörtern lehnt Marie ab) und mindestens zwei (`B06`) bzw. drei (`V05`) Wörter zur Geschichte enthalten (`task.topic`, Wortanfänge). Einfügen (etwa aus einem Übersetzer) ist gesperrt.
- **Hörtexte nicht wegklicken:** Beim ersten Mal geht „Continuer“ erst, wenn die Aufnahme ganz gelaufen ist (`S.heard`; mindestens 90 % wirklich gehört, Vorspulen zählt nicht, siehe [Audioplayer](#hörtexte-audioplayer)). In der deutschen Fassung gilt stattdessen eine Mindest-Lesezeit, und die freien Texte müssen deutsch sein.
- **Hilfe ohne fertige Lösung:** Die deutsche Stufe 4 erklärt bei `M04` und `P04`, worauf man im Transkript achten muss, statt die Zuordnung zu verraten; Stufe 3 bei `M03` zitiert die richtige Frage nicht mehr.
- **Keine Abkürzungen:** Fenster, nach denen es weitergeht (z. B. Kevins SMS vor der Nachricht an Nowak), haben kein ×, und Carnet, Karte, Inventar und Glossar öffnen sich nicht, solange eine Aufgabe offen ist (auch nicht per Tastatur).

Was bleibt: Wer die Lösungen von Mitschülern oder aus der deutschen Testfassung kennt, kann Namen und Orte übertragen; die deutsche Fassung deshalb nicht an Lernende weitergeben. Die Ergebnisse zeigen Raten trotzdem: Spalte „Versuche“ im Export, im JSON zusätzlich `pauses` (wie oft eine Aufgabe gesperrt war).

## Reihenfolge und Sperren

Damit niemand Stationen überspringt, geht jede erst auf, wenn die Information dafür im Spiel gefallen ist:

- Père-Lachaise und Marais öffnen sich auf der Karte erst nach dem Sack (`M02`) und der Aussage der Kioskfrau (`M04b`). Vorher sagt Marie, warum.
- Die Buchhandlung erscheint erst nach Marcels Nachricht bei Nora (`B03`); die Tür im Marais bleibt bis dahin nur eine Tür.
- Lenoir zeigt die Aushänge erst nach dem Nachnamen, der Stempeltisch kommt nach dem richtigen Aushang, Marcels Karte nach dem Stempel.
- Die Assistentin am Louvre lässt erst nach dem richtigen Aushang durch und fragt Name und Uhrzeit ab; Marcel fragt am Ende den Inhalt des Rucksacks ab.
- Solange nach einer gelösten Aufgabe der Nachspann läuft (die Zeilen unter `after`), öffnen weder Hotspots noch die Karte etwas; Marie sagt « Doucement. Lis d'abord. ». Die Effekte gelten dann schon, die Kette dahinter aber noch nicht: Früher endete das Spiel nach einem Klick im Nachspann von `V03q` ohne Finale und Rapport, und nach `B04` kam man ohne Kevins SMS und ohne Nachricht an Nowak in die Buchhandlung. Wer schon so festsaß, kommt über Marcel zum Rapport (`V05`) und danach zur Schlussszene (`V04`). Dieselbe Sperre gilt in Teil 2 und 3.
- Plan, Bank und Noras Telefon starten gelöste Aufgaben nicht neu: der Plan sagt nur noch den Weg (`P04r`), die Bank führt zu Chloés Angebot (`P06c`, nach der Probe `P05r`), das Telefon spielt nur die Nachricht (`B03r`).
- **Freie Stationen** (Teil 2 und 3, `free: true` an der Szene): Nach der Ankunft beginnt kein Abschnitt von selbst, die Spieler suchen über die Hotspots, womit es weitergeht. Angefangenes geht vor: Solange ein Abschnitt offen ist (`S.at`), führt kein anderer Hotspot daran vorbei; läuft er gerade im Dialogfeld, sagt die Hilfefigur « D'abord, on finit ça. », sonst geht es dort weiter, wo er stand. Kurze Bemerkungen (`amb`) gehen im leeren Dialogfeld trotzdem. Jeder Abschnitt endet mit `doneAt`, erledigte Hotspots tragen ein Häkchen (`doneIf`). Im leeren Dialogfeld steht die Szenenhilfe (`help` an der Szene, vier Stufen wie bei den Aufgaben und sofort zu haben; Stufe 2 lässt die noch offenen Hotspots leuchten, `openIf` nimmt Hotspots aus, die erst später dran sind; die Diagnose führt die höchste Stufe). Schmale Hotspots am Bildrand schreiben ihren Namen nach innen (`lab: "r"` bzw. `"l"`). Ältere Spielstände passt `G.migrate` in `data.js` beim Laden an.

Frage 3 im Carnet („Voleur ou erreur ?“) gilt als geklärt, sobald Chloés Foto (`P06`) und Marcels Nachricht (`B04`) verstanden sind.

## Phase 2

Die Nebenwege aus Abschnitt 10 des Drehbuchs sind eingebaut und freiwillig: die Karte „demain“ (C01) schaltet die Catacombes frei (C02, Anruf bei Chloé → C03 mit Hörtext `au_chloe`; wer Chloé noch nicht am Père-Lachaise getroffen hat, `P05`, hört am Telefon eine eigene Begrüßung statt « Ah, c'est vous ! »: `task.success` darf eine Liste von Zeilen sein, es gilt die erste, deren `if` zutrifft), Aushang A schaltet die place des Vosges frei (X01), Gaston (P07) ist nach dem Gespräch mit dem Wärter erreichbar, und die Assistentin bietet vor dem Finale das Brotschatten-Rätsel an (V02b, Hörtext `au_assistante`). Der Abspann steht in `js/data.js` unter `credits`; dort trägst du die Namen ein.

## Test

`tools/playthrough.js` spielt beide Phasen automatisch durch (Playwright, Chromium) und meldet am Ende die Diagnosezeilen. Vorher `npm i -D playwright` und einen lokalen Server starten (`npx http-server -p 8765 .`), dann `node tools/playthrough.js` (öffnet `index.html?intro=0&test=1`). Nach Änderungen an Texten oder Code zeigt ein fehlgeschlagener Durchlauf schnell, wo etwas klemmt. `node tools/raten.js` (bzw. `node tools/raten.js de`) spielt wie jemand, der nur rät, und prüft die Bremsen aus „Gegen Raten und Durchklicken“. `node tools/sackgassen.js` prüft in allen drei Teilen die früheren Sackgassen und Abkürzungen: Klicks im Nachspann einer Aufgabe, ein unterbrochenes Gespräch (Teil 3, `P02`), die Wiederholungen an Plan, Bank und Telefon, die Fiche de signalement in Teil 2 und alte Spielstände an Stellen, deren Reihenfolge sich seit November 2026 geändert hat, dazu die freien Stationen in Teil 2 und 3 (ein angefangener Abschnitt geht vor, Unterbrechen über die Karte, Neuladen, ältere Spielstände mitten in einer früheren Kette) und den Nebenweg in Teil 3 (vor dem Tipp nicht auf der Karte, in älteren Spielständen mit erledigtem Pont schon). `node tools/teile.js` prüft das gemeinsame Startmenü mit den drei Teilen, die Schlüsselwörter und die Wege zwischen den Teilen (siehe [Drei Teile und Schlüsselwörter](#drei-teile-und-schlüsselwörter)). `node tools/intro-musik.js` prüft den Schalter für die Musik im Intro (siehe [Introvideo](#introvideo)).

## Schrift

Der Titel (Startbildschirm, Kopfzeile, Abspann) nutzt die Schrift Limelight aus `assets/fonts/` (SIL Open Font License, Lizenztext liegt daneben). Alles andere nutzt Systemschriften.

## Introvideo

Beim Laden der Seite läuft das Introvideo des gewählten Teils (1280 × 720, mit Ton), am Ende erscheint der Titel groß in der Plakatschrift des Spiels, danach das Startmenü:

- Teil 1: `assets/video/intro.mp4` (8 Sekunden): die Klasse vor dem Sacré-Cœur, Marcel kommt dazu.
- Teil 2: `assets/video/intro_teil2.mp4` (8,5 Sekunden): Herr Nowak zählt die Klasse vor Notre-Dame durch, M. Beaumont mit dem roten Schirm kommt dazu. Das gelieferte Video war 10 Sekunden lang; die letzten, ruhigen anderthalb Sekunden sind abgeschnitten, damit Bild und Musik zusammen enden.
- Teil 3: `assets/video/intro_teil3.mp4` (10 Sekunden): Herr Nowak zählt die Klasse vor dem Musée d'Orsay durch, rechts schlägt Victor Delmas sein Fotoalbum auf. Zu hören ist wie in Teil 1 und 2 nur „Waltz du Café“, ohne den Originalton des Videos: Nowaks Stimme (« vingt, vingt et un, vingt-deux ») ist seit November 2026 herausgenommen. Weil die Musikdatei bei 8,4 Sekunden mitten im Schlussakkord abbricht, springt die Musik bei 7,96 Sekunden fünf Takte (4,944 Sekunden) zurück an eine Stelle mit derselben Harmonie (40 ms Überblendung) und wird in der letzten Sekunde ausgeblendet; der Pegel ist wie in Teil 2 um 1 dB abgesenkt. Prompt, Startbild und die früheren Fassungen mit Originalton liegen im Projektordner unter `pain-perdu/intro_teil3/`.
- Teil 1 und 2 haben als Tonspur nur die Musik „Waltz du Café“ (8,4 Sekunden); in Teil 1 läuft sie knapp 2 % schneller, damit sie mit dem Bild endet.

„Passer l'intro“ überspringt das Video, „Revoir l'intro“ im Startmenü zeigt es noch einmal, `index.html?intro=0` lässt es ganz aus (etwa für Tests). Ohne vorherigen Klick spielen Browser nur stumm ab; der Knopf « Son » links unten schaltet den Ton dann ein. Fehlt die Datei oder kann der Browser sie nicht abspielen, erscheint sofort das Startmenü. `intro_poster.jpg`, `intro_teil2_poster.jpg` und `intro_teil3_poster.jpg` sind die ersten Bilder der Videos und werden gezeigt, solange das Video lädt.

**Musik abschalten:** Der Schalter « Musique » (deutsche Fassung „Musik“) steht im Intro links unten und im Startmenü neben „Revoir l'intro“. Er schaltet die Musik in allen Intros ab, auch mitten im Video, und das Gerät merkt sich die Einstellung für alle drei Teile und beide Sprachen (`localStorage` `pp_intro_music`, `0` = ohne Musik). Alle drei Intros haben als Ton nur die Musik und laufen ohne sie stumm; der Knopf « Son » erscheint dann nicht. Wer die Musik wieder einschaltet, hört sie sofort, auch wenn der Browser den Ton vorher gesperrt hatte (der Klick erlaubt ihn). Test: `node tools/intro-musik.js` (startet selbst einen Server, Bildschirmfotos in `test-shots/intro-musik/`).

## Drei Teile und Schlüsselwörter

Alle drei Teile laufen über ein gemeinsames Startmenü (`index.html`, mit dem Introvideo des gewählten Teils):

- Unter dem Titel stehen die Teile untereinander zur Auswahl: « Partie 1 · L'affaire du pain perdu », « Partie 2 · Le guide fantôme » und « Partie 3 · Le voyageur de 1900 ». Beim ersten Mal sind Teil 2 und 3 gesperrt (gestrichelt, Schloss rechts); wer einen davon antippt, bekommt das Feld für sein Schlüsselwort („La partie 3 s'ouvre à la fin de la partie 2 …“).
- Am Ende von Teil 1 zeigt der Endbildschirm das Schlüsselwort **Notre Dame**, am Ende von Teil 2 das Schlüsselwort **Orsay**. Der nächste Teil ist damit auf diesem Gerät offen; „Jouer la partie 2“ bzw. „Jouer la partie 3“ zeigt sein Intro und danach das Startmenü mit diesem Teil.
- Mit dem Schlüsselwort lässt sich ein Teil auch ohne den Teil davor öffnen, etwa auf einem anderen Gerät. Groß- und Kleinschreibung, Leerzeichen, Bindestrich und Akzente sind egal („notre-dame“, „NOTREDAME“, „Notre-Dâme“, „ORSAY“). Gibt jemand im Feld das Schlüsselwort des anderen gesperrten Teils ein, öffnet sich dieser.
- Beim nächsten Laden ist der neueste offene Teil vorgewählt, und sein Intro läuft. „Revoir l'intro“ zeigt das Intro des gewählten Teils. Die anderen offenen Teile bleiben wählbar. Titel, Untertitel und die Sprachwahl für Lino (nur Teil 1) wechseln mit der Auswahl.
- Die Freischaltung steht im Browser (`pp_partie2`, `pp_partie3`), unabhängig von den Spielständen: „Nouvelle partie“ sperrt nichts wieder. Wer Teil 1 bzw. Teil 2 schon beendet hat, bevor der nächste Teil dazukam, hat ihn ebenfalls offen (für Teil 3 zählen Spielstand und Ergebnisse von Teil 2, `G.part3.after`). In der Lehrkraft-Ansicht (`?mode=prof`) sind alle Teile wählbar, und „Teil 2 wieder sperren“ bzw. „Teil 3 wieder sperren“ nimmt die Freischaltung auf diesem Gerät zurück.
- Die Spielstände bleiben getrennt (Teil 1 `pp_save_v1`, Teil 2 `pg_save_v1`, Teil 3 `pv_save_v1`); „Continuer la partie“ gilt für den gewählten Teil. Teil 2 und 3 bekommen die Namen beim Start über die Adresse (`guide-fantome/index.html?go=new&p1=…` bzw. `voyageur/index.html?go=new&p1=…`, bei „Continuer“ `?go=resume`), die gleich danach wieder aus der Adresszeile verschwinden. „Menu“ und „Nouvelle partie“ in Teil 2 und 3 führen zurück ins gemeinsame Startmenü (ohne Intro, der Teil gewählt). Wer `guide-fantome/` oder `voyageur/` direkt aufruft, landet im Startmenü, außer es gibt auf dem Gerät schon einen Spielstand dieses Teils.
- Das Wechseln zwischen den Teilen lädt eine neue Seite. Auf Android endet dabei der Vollbildmodus; der Knopf „Plein écran“ steht in Teil 2 und 3 ebenfalls oben rechts.
- Die Schlüsselwörter sind eine Sperre für den Unterricht, kein echter Schutz: Wer die Adresse mit `?go=new` kennt, kommt auch so in Teil 2 oder 3.
- Schlüsselwörter, Titel und Texte: `G.part2`, `G.part3` und `G.ui.parts` in `js/data.js`; was der Endbildschirm von Teil 2 zeigt, steht in `G.next` in `guide-fantome/js/data.js` (Schlüsselwort wie `G.part3.key`). Test: `node tools/teile.js` (lokaler Server wie unter „Test“, Bildschirmfotos in `test-shots/teile/`).

## Deutsche Fassung

Eine deutsche Testfassung (etwa für jüngere Testspieler ohne Französisch) liegt im Ordner `de/`: https://florianchristophnowak-dot.github.io/pain-perdu/de/ – sie ist von der französischen Seite aus nicht verlinkt.

- Alle Texte sind übersetzt; die Hörtexte erscheinen als Lesetexte („Text noch mal lesen“ in den Aufgaben, Maries Hilfe zeigt den Text). Die Grammatikaufgaben (imparfait/passé composé) sind dort Verständnisfragen, das Glossar ist ein kleines Paris-Lexikon.
- Bilder, Video, Schrift, `css/style.css` und `js/prof.js` kommen aus dem Hauptordner; eigene Dateien: `de/index.html`, `de/js/data.js` (alle Spieltexte), `de/css/de.css`, `de/zettel.html`, `de/manifest.webmanifest`. Eigener Spielstand (`pp_de_save_v1`), getrennt vom französischen.
- `de/js/game.js` wird nicht von Hand geändert: `node tools/build_de.js` erzeugt es aus `js/game.js` und übersetzt die festen Texte. Nach Änderungen an `js/game.js` das Skript erneut ausführen; passt ein Ersatz nicht mehr, nennt es die Stelle. Neue Spieltexte in `js/data.js` müssen von Hand in `de/js/data.js` übernommen werden.
- `node tools/build_de.js --zip pain-perdu_deutsch_offline.zip` baut ein Offline-Paket (ein Ordner, `index.html` öffnen). Test: `node tools/playthrough_de.js`.
- Die deutsche Fassung hat nur Teil 1, ohne Auswahl im Startmenü und ohne Schlüsselwort. Der Code dafür kommt beim Erzeugen zwar mit nach `de/js/game.js`, bleibt dort aber ohne Wirkung, weil `G.part2` und `G.part3` in `de/js/data.js` fehlen. Eine deutsche Fassung von Teil 2 und 3 gibt es nicht.

## Texte ändern

Alle Spieltexte liegen in `js/data.js`. Figurentexte sind `fr`, Linos umschaltbare Kommentare zusätzlich `de`. Die Kennungen (M03, P04, …) verbinden Drehbuch, Code und Diagnose.

Verzweigungen in Teil 1 funktionieren wie in Teil 2 und 3: `next` ist eine Kennung oder eine Liste `[{ if: "Flag", node: "…" }, { node: "…" }]`, der erste passende Eintrag gilt (`!Flag` heißt „nicht gesetzt“). Dialogoptionen können `onlyIf` tragen und erscheinen nur, wenn die Bedingung stimmt. `firstOnly: true` an einem Gesprächsknoten spricht dessen Zeilen nur beim ersten Mal; nach einer falschen Antwort stehen nur noch die Optionen da.

Lino und Marie in beiden Teilen: Lino ist in der 10b in Erfurt, Marie wohnt in Paris und verbringt die Tage mit der Klasse. Die beiden sind befreundet, aber kein Paar; sie kennen sich aus einem deutsch-französischen Ferienlager. Deshalb heißt es im Französischen « une amie de Lino », nie « sa copine » oder « sa petite amie » (das wäre die feste Freundin), und im Deutschen „eine Freundin von Lino“ statt „seine Freundin“. Was Marie über Pariser Orte erzählt, kommt aus ihrer Ortskenntnis (« Je connais bien Montmartre », « C'est ma ville »).

Sprachniveau A2 in allen drei Teilen:

- Fragen mit « est-ce que » oder nur mit der Stimme, keine Inversion (« Où est-ce qu'il va ? », nicht « Où va-t-il ? »).
- Kein Futur antérieur, kein Conditionnel passé, kein Passiv. Für die Zukunft « aller + Infinitiv ». Feste Wendungen wie « je voudrais » und « on pourrait » sind erlaubt.
- Anrede: Marie und Lino duzen die Spieler, also auch in den Pausen- und Hilfetexten (`G.ui.recall`, `G.ui.guess`). Die anderen Figuren siezen die Gruppe. M. Nowak duzt einen einzelnen Schüler und sagt « vous », wenn er mehrere anspricht. Die Systemtexte von Teil 3 siezen die Spieler (« Cliquez … », « Vous avez sauté un passage »).
- Wörter über A2, die öfter vorkommen oder für eine Aufgabe wichtig sind, stehen im Glossar des jeweiligen Teils (`G.glossary`).
- Die Hörtext-Skripte (`G.audio`) entsprechen den Aufnahmen Wort für Wort. Wer ein Skript ändert, muss die Aufnahme neu machen.

Arbeitsaufträge (November 2026 in allen drei Teilen überprüft):

- Ein Suchauftrag nennt nie, was man finden soll. Er gibt einen Anlass oder eine Frage (« Vous connaissez quelqu'un ? », « Qu'est-ce qui ne va pas ? »), die Anzahl steht in der Statuszeile. Auch Titel, Zeilen direkt vor der Aufgabe, Bemerkungen in früheren Aufgaben und Inventartexte verraten das Gesuchte nicht; was man gefunden hat, steht erst danach im Inventar (`desc2`).
- Die Hilfe wird stufenweise genauer: Stufe 1 gibt die Richtung, Stufe 2 zeigt den Bereich, Stufe 3 nennt die Stellen, Stufe 4 die Lösung.
- Steht vor einem Auftrag ein Sprecher (`task.who`), ist der Text ein Satz dieser Figur (« Des questions sur mes photos ? Allez-y. »), keine Systemanweisung, die über sie spricht.
- Falsche Antworten in Auswahlaufgaben gibt es im Bild oder im Text wirklich (`P06`: Halstuch und Mütze auf dem Foto), sie sind keine erfundenen Farben. Eine Auswahl wiederholt nicht wörtlich, was eine Figur gerade gesagt hat.
- Soll man einen Weg aus einer Wegbeschreibung finden, zeigt der Plan das Ziel erst nach der Lösung (`P04`).

## Teil 2: Le guide fantôme

Zweiter Fall, unabhängig von Teil 1 spielbar: Vor Notre-Dame kassiert ein falscher Stadtführer, « M. Beaumont », die Anzahlung der Klasse und verschwindet. Die Lernenden spielen Marie, eine Freundin von Lino aus Paris; Lino begleitet sie und gibt die Hilfe, in vier Stufen und nur auf Französisch (das Glossar bleibt französisch-deutsch). Stationen: Auftakt an Notre-Dame, Galeries Lafayette, Tour Eiffel, freiwillig die Bouquinisten, Finale am Service des retours, nach den Bouquinisten ein kurzes Nachspiel, danach der Rapport und zum Schluss für alle das Bild mit dem roten Regenschirm vor Notre-Dame (`Z03`). Selfie und Personenbeschreibung (`N04b`) kommen erst nach der ersten Station: M. Nowak schreibt, dass die Policière eine Beschreibung braucht (`N07`). Grundlage sind das Spielkonzept und das Drehbuch Teil 2; die Kennungen (N03, G04, E02, R1 …) stimmen mit dem Drehbuch überein.

| Datei | Inhalt |
| --- | --- |
| `guide-fantome/index.html` | Oberfläche (wie Teil 1, ohne Sprachschalter und Intro) |
| `guide-fantome/js/data.js` | Alle Texte und Spieldaten von Teil 2 |
| `guide-fantome/js/game.js` | Engine, abgeleitet von `js/game.js`, mit den neuen Bausteinen |
| `guide-fantome/css/guide.css` | Ergänzungen zu `css/style.css` (Bildlupe, Karte mit Aufkleber, Lino-Farbe) |

Eigener Spielstand (`pg_save_v1`, Ergebnisse `pg_results_v1`), getrennt von Teil 1. Teil 2 startet aus dem gemeinsamen Startmenü (siehe [Drei Teile und Schlüsselwörter](#drei-teile-und-schlüsselwörter)); das eigene Startmenü in `guide-fantome/index.html` erscheint nur noch in der Lehrkraft-Ansicht und mit `?test=1`. Am Ende zeigt der Endbildschirm das Schlüsselwort « Orsay » für Teil 3 (`G.next`). Lehrkraft-Ansicht mit demselben Code: `guide-fantome/?mode=prof`.

**Neue Bausteine:** Bildlupe (`loupe`: zoomen mit + und −, Mausrad oder zwei Fingern, verschieben, Details antippen; die Karte « Visite exclusive » hat einen Aufkleber, den man an der Ecke abzieht, und eine Rückseite), Beobachtung (`observe`: vier Bilder in Schleife, drei Auffälligkeiten finden, das Telefon klingelt erst zum Schluss), Fragen an die Verkäuferin (`ask`: Ja-Nein-Fragen bekommen nur « Oui. », nach der dritten eine Minute Pause), Spalten (`cols`), Ketten mit Lücken (`chain`), Beweise (`proofs`) sowie Inhaltsprüfungen für eigene Fragen, die Nachricht an M. Nowak, die Warnung und den Rapport (imparfait, passé composé, Verneinung, Zeitangabe). Die Personenbeschreibung (`N07b`, « Fiche de signalement ») nimmt zwei kurze Sätze ab sieben Wörtern an, wenn sie ein Verb enthalten, keine Fragen sind und zwei verschiedene Wörter enthalten, die M. Beaumont beschreiben (`task.topic`: vite, lentement, poli, gentil, grand, vieux, gris, moustache, accent …; bis drei Buchstaben zählt nur das ganze Wort). Gezählt werden nur die eigenen Wörter, nicht die angetippten Satzanfänge; Wörter aus dieser Liste zählen bei der Sprachprüfung als französisch. Alle Bremsen aus Teil 1 gelten weiter; neu ist die Tempobremse (drei Fehlversuche hintereinander in weniger als zwei Sekunden: « Doucement. Lis d'abord. », 20 Sekunden; in Bildlupe und Beobachtung nach acht Fehlklicks). Die Abfragen R1 bis R5 sind Tore: Eine Station gilt erst als erledigt, wenn ihre Abfrage gelöst ist; wer sie aufschiebt, wird im leeren Dialogfeld daran erinnert. Jede Abfrage stellt eine Figur, die die Antwort braucht: R1 bis R3b die Policière über M. Nowak (per SMS), R4 Lino bei den Bouquinisten, R5 der Sicherheitsmann im Finale. Das Carnet zeigt die Antwort einer geklärten Frage erst, wenn die Abfrage dazu gelöst ist (`G.questions[…].reveal`: Q1 nach R3, Q2 nach R5, Q3 nach R2 und R3b); sonst ließen sich die Tore aus dem Carnet abschreiben.

**Freie Stationen (Version 2.2):** Notre-Dame, Galeries Lafayette, Tour Eiffel und die Bouquinisten sind freie Stationen wie in Teil 3 (siehe [Reihenfolge und Sperren](#reihenfolge-und-sperren)). An Notre-Dame kommen nach dem Gruppenfoto (`N04a`) M. Nowak (Ausweis, `N05`) und die Klasse (Karten, `N06`) in beliebiger Reihenfolge, dann von allein `N08`. In Lafayette führt nach dem Plan (`G01`) die Vendeuse weiter (`G02` bis `G06`), an der Tour Eiffel nach der Ankunft der Joueur (`E01` bis `E05`). Bei den Bouquinisten kommt erst die Bouquiniste (`B01` bis `B02`), dann das alte Buch (`B03`, `B04`) und das Papier auf den Boîtes (`B05p`, `B05`) in beliebiger Reihenfolge, danach die Abfrage `R4`. Bemerkungen ohne Aufgabe: Kathedrale, Manteaux, Coupole, Souvenirverkäufer, Eiffelturm, Gravures. Die Szenenhilfe gibt Lino (`S_notredame` bis `S_bouquinistes2` in `G.help`). Ältere Spielstände passt `G.migrate` an; Stationen, die nach ihrem Schluss stehen blieben (`B06e`, `N07c`), sind danach wieder frei.

**Bilder und Aufnahmen:** Das Spiel sucht jedes Bild zuerst als `guide-fantome/assets/img/<name>.jpg`, dann `.png`; fehlt beides, zeigt es eine Farbfläche (die alten SVG-Platzhalter sind entfernt, alle Bilder sind eingesetzt). Die Namen: Hintergründe `bg_parvis`, `bg_lafayette`, `bg_eiffel`, `bg_quai`, `bg_retours`; Zwischensequenzen `cut_beaumont`, `cut_compte`, `cut_parapluie`; Bildlupe und Beobachtung `doc_photo_groupe`, `doc_selfie`, `obs_bonneteau_1` bis `obs_bonneteau_4`; Porträts (PNG, quadratisch) `pt_lino`, `pt_marie`, `pt_nowak`, `pt_beaumont`, `pt_lucien`, `pt_vendeuse`, `pt_joueur`, `pt_spectateur`, `pt_spectatrice`, `pt_bouquiniste`, `pt_agent`, `pt_policiere`, `pt_touriste`. Hörtexte in `guide-fantome/assets/audio/`: `au_beaumont.mp3`, `au_telephone.mp3`, `au_bouquiniste.mp3` (fehlt eine Datei, liest der Browser vor). Wichtig für die Bildlupe und die Beobachtung: Die Fundpunkte stehen in Prozent des Bildes in `data.js` (`points`); neue Bilder müssen die Details an denselben Stellen zeigen wie die jetzigen, sonst die Werte dort anpassen. Schrift, die man lesen muss (Tüte, Etikett, Preis im Buch, Karte, Ausweis), legt das Spiel selbst über das Bild.

**Fahrten:** Zwischen den Stationen zeigt das Spiel « Métro… »; für einzelne Strecken steht in `G.ui.travelBy` etwas anderes (« À pied… » zwischen Notre-Dame und den Bouquinisten, nichts zwischen den beiden Etagen der Galeries Lafayette).

**Glossar:** Jede Form eines Eintrags in `G.glossary` wird in den Spieltexten markiert und zeigt beim Antippen die Übersetzung. Gleich geschriebene Wörter mit anderer Bedeutung trennt ein dritter Wert am Eintrag: `{ after: [...] }` lässt den Eintrag nur direkt nach diesen Wörtern gelten. So bekommt « une montre dorée » den Tipp „die Armbanduhr“, « il montre son badge » dagegen „montrer: zeigen“.

**Test:** `node tools/playthrough-guide.js` (lokaler Server im Hauptordner, z. B. `python3 -m http.server 8765`) spielt Teil 2 mit zwei Spielenden ganz durch, prüft Fallen, Zählungen, Tore und die freien Stationen (Hotspots, Häkchen, Szenenhilfe, bei den Bouquinisten eine andere Reihenfolge als früher) und macht Bildschirmfotos auf dem Computer und dem Handy (hoch und quer) in `test-shots/guide/`.

**Stand der Bilder:** Eingesetzt sind `bg_parvis`, `bg_lafayette`, `bg_eiffel`, `bg_quai`, `bg_retours`, `cut_beaumont`, `doc_photo_groupe` und die Inventar-Symbole (`it_*.png`, aus einem 3 × 3-Sammelbild geschnitten); zehn Porträts sind aus den Szenenbildern geschnitten und danach in einem 4 × 3-Raster im Stil der Teil-1-Porträts neu gezeichnet (`pt_nowak`, `pt_beaumont`, `pt_lucien`, `pt_vendeuse`, `pt_joueur`, `pt_spectateur`, `pt_spectatrice`, `pt_bouquiniste`, `pt_agent`, `pt_policiere`); die Fundpunkte und Hotspots sind auf diese Bilder eingestellt. Die drei Hörtexte sind aufgenommen und eingesetzt. Die vier Bilder des Hütchenspiels (`obs_bonneteau_1` bis `obs_bonneteau_4`) sind eingesetzt. Das Selfie (`doc_selfie`) und die Zwischenbilder `cut_compte` und `cut_parapluie` sind eingesetzt, damit hat kein Bild mehr einen Platzhalter. `pt_touriste` ist ein eigenes Porträt.

**Offline:** Teil 2 liegt im französischen Offline-Paket mit drin und startet dort aus `index.html` wie online. Eine deutsche Fassung von Teil 2 ist nicht vorgesehen.

## Teil 3: Le voyageur de 1900

Dritter Tag in Paris: An einer Brocante beim Musée d'Orsay verkauft Victor Delmas ein Album mit angeblich echten Fotos von 1900, auf einem davon erkennt Lino den falschen Guide Lucien aus Teil 2. M. Nowak will das Album mit dem Geld der Klasse für die Schule kaufen und um 15 Uhr bezahlen; vorher sollen Lino und Marie die Fotos prüfen. Das tun sie am Pont Alexandre III, bei Marcel an den Invalides und bei Chloé am Stand 6; im Finale zeigen sie mit drei Belegen, dass das Album alt ist, die Fotos aber Chloés Theaterfotos von 2025, und M. Nowak kauft nicht. Zum Schluss macht Chloé ein echtes Klassenfoto. Grundlage ist das Drehbuch Teil 3, Fassung 1.3; die Kennungen (O02, P00, I03, C01, F01, R1 …) stimmen damit überein. Alle Spieltexte halten A2 (nur présent, passé composé, imparfait, futur proche; Fragen ohne Inversion).

| Datei | Inhalt |
| --- | --- |
| `voyageur/index.html` | Oberfläche (wie Teil 2) |
| `voyageur/js/data.js` | Alle Texte und Spieldaten von Teil 3, dazu die Fotos (`G.photos`) und das Album (`G.album`) |
| `voyageur/js/game.js` | Engine, Kopie von `guide-fantome/js/game.js` mit den neuen Bausteinen (Fehlerbehebungen von Hand in beide Ordner) |
| `voyageur/css/voyageur.css` | Kopie von `guide-fantome/css/guide.css` mit den Ergänzungen für Teil 3 |
| `voyageur/assets/img/` | Hintergründe, Fotos, Zwischenbilder, Porträts und Inventarsymbole (Namen unten) |
| `voyageur/assets/audio/` | die drei Hörtexte (Namen unten) |

Eigener Spielstand (`pv_save_v1`, Ergebnisse `pv_results_v1`). Teil 3 startet aus dem gemeinsamen Startmenü hinter dem Schlüsselwort « Orsay » vom Ende von Teil 2 (siehe [Drei Teile und Schlüsselwörter](#drei-teile-und-schlüsselwörter)); das eigene Startmenü in `voyageur/index.html` erscheint nur noch in der Lehrkraft-Ansicht und mit `?test=1` (`G.hub` in `voyageur/js/data.js`). Lehrkraft-Ansicht: `voyageur/?mode=prof`. Wer Teil 2 auf demselben Gerät mit den Bouquinisten gespielt hat, wird von der Bouquiniste wiedererkannt (`G.earlier` liest `B_done` aus `pg_save_v1`).

**Neue Bausteine:** Hilfefigur je Station (`G.helpBy`: an Orsay, den Invalides und im Finale hilft Marie, am Pont und bei Chloé Lino; die Hilfe hat die Farbe der Figur). Albumseite (`render: "album"`: drei alte Seiten mit Fotoecken und der Bildunterschrift des Händlers; die Bildlupe arbeitet darauf). Ausschnitt und Vollbild aus einer Datei (`G.photos`: zu jedem vollständigen Foto P17 bis P19 steht in `crop`, welcher Teil im Album zu sehen ist; die Albumfotos A, B, C schneidet das Spiel selbst aus, so sind sie garantiert dasselbe Bild). Bildlupe mit zwei Bildern (`compare`, P00 und I03: mit `both` zählt ein Detail erst, wenn man es auf beiden Bildern angetippt hat). Zuordnen mit aufklappenden Rändern (`reveal`, C01: erst jedem Albumfoto das vollständige Foto zuordnen, dazu eine Falle P16; dann klappen die Ränder auf und man sucht, was der Händler abgeschnitten hat). Pflichtbeleg bei den Beweisen (`proofs.required`, F01: ohne die Fiche de vente zählt es als Fehlversuch). Fundpunkte auf Fotos stehen immer in Prozent des vollständigen Fotos; das Spiel rechnet sie auf den Ausschnitt und die Albumseite um. Alle Bremsen aus Teil 2 gelten weiter (Pausen nach jedem dritten Fehlversuch, Tempobremse, acht Fehlklicks in der Bildlupe; die braune Farbe auf den Fotos gibt eine Bemerkung, zählt aber als Fehlklick). Die Abfragen R1 und R2 sind Tore wie in Teil 2 (R1 stellt M. Nowak per Nachricht, R2 die Bouquiniste). Ältere Spielstände, die bei einem seit Fassung 1.2 gestrichenen Schritt stehen (`P01b`, `R3`, `F03b`, `R4`), laufen über kurze Weiterleitungen weiter.

**Freie Stationen (Fassung 1.3):** Orsay, Pont, Invalides und Stand 6 sind freie Stationen (siehe [Reihenfolge und Sperren](#reihenfolge-und-sperren)). An Orsay kommt erst das Album (`O02`), danach Händler (`O03`) und Fiche de vente (`O04`) in beliebiger Reihenfolge, dann von allein M. Nowak (`O05`); wer vorher den Händler oder die Fiche antippt, bekommt einen Hinweis statt der Aufgabe. Am Pont erst die Brücke (`P00`, `P01`), dann die Assistentin (`P02` bis `P03b`). An den Invalides Marcel (`I00m` bis `I02`) und die Baguettes auf dem Tisch (`I03p`, `I03`) in beliebiger Reihenfolge, dann die Bouquiniste (`I05`). Am Stand 6 das Dossier (`C01`) und Chloé (`C02l` bis `C02`), dann die Nachricht (`W1`). Dazu kommen Bemerkungen ohne Aufgabe (Horloge, Appareil photo, Cartes postales, Malle, Chapeaux, Chloés Fotos). Die Szenenhilfe gibt die Hilfefigur der Station (`S_orsay1` bis `S_stand6` in `G.help`). Ältere Spielstände mitten in einer früheren Kette bekommen beim Laden die fehlenden Flags (`G.migrate`).

**Nebenweg Petit Palais (Fassung 1.3, freiwillig):** Nach dem Pont gibt die Assistentin einen Tipp (`P04`), danach steht « Petit Palais (facultatif) » auf der Karte (`X_open`; wer den Pont in einem älteren Spielstand schon erledigt hat, bekommt den Ort beim Laden). Dort ermittelt Lino, Marie hilft. Die Vitrine führt zu `X02` und `X03`: Die Spieler vergleichen ein echtes Foto von 1900 mit der Foto B und sehen, dass braune Farbe und Kleidung von 1900 nichts beweisen, viel Betrieb und der Karton aber nur zum echten Foto gehören. Dafür zeigt eine Aufgabe zwei Bilder nebeneinander über den Karten (`task.show: "pair"`, das echte Foto auf einem Karton, die Foto B als Ausschnitt). Das Panneau (`X01`) erklärt die Exposition universelle, dazu kommen Bemerkungen am Fotoapparat und am Fenster. Zum Schluss gibt es die Postkarte `carte_1900`, an die Lino im Schlussbild (`F05`) denkt. Für das Finale braucht man nichts davon; bei jeder Fahrt über die Karte wechselt die Maus, also auch hier.

**Bilder und Aufnahmen:** Das Spiel sucht jedes Bild als `voyageur/assets/img/<name>.jpg`, dann `.png`, dann einen Platzhalter `voyageur/assets/ph/<name>.svg`. Alle Platzhalter sind inzwischen durch echte Bilder ersetzt, zuletzt der Hintergrund des Nebenwegs, `bg_petitpalais` (November 2026; Skizze und Prüfbild liegen in den Projektdateien unter `voyageur-skizzen/`, das Original unter `pain-perdu/teil3_bilder/`). `python3 tools/platzhalter-voyageur.py` erzeugt die Skizzen bei Bedarf neu, mit Bildnamen als Argumenten nur die genannten. Die Namen: Hintergründe `bg_orsay`, `bg_pont`, `bg_invalides` und `bg_stand6` (dieselbe Esplanade mit Chloé am Stand 6), dazu `bg_petitpalais` (Nebenweg); Zwischenbilder `cut_photo_classe`, `cut_dejeuner` (freiwillig); vollständige Fotos `doc_p16` (Falle), `doc_p17`, `doc_p18`, `doc_p19` (Seitenverhältnis 3 : 2; farbig erzeugt und mit `python3 tools/toenen-voyageur.py <farbig.png> voyageur/assets/img/<name>.jpg` braun getönt, ebenso das Klassenfoto; die farbigen Originale liegen unter `pain-perdu/teil3_bilder/`) und heute `doc_pont` (3 : 2) und `doc_baguette` (16 : 9); das echte Foto `doc_1900` (Nebenweg, auch als Bild der Postkarte im Inventar; Quelle unten); neue Porträts `pt_delmas`, `pt_marcel_civil` (Marcel ohne Schminke), `pt_responsable` und `pt_kevin`, 256 × 256 wie in Teil 1 und 2 (fehlt eines, zeigt das Spiel Initialen). Die übrigen Porträts kommen aus Teil 1 und 2. Inventarsymbole `it_<id>.png`, 256 × 256 mit durchsichtigem Hintergrund (die drei Albumfotos braun getönt, `it_telephone` aus Teil 1; für die Postkarte `it_carte_1900` gibt es noch keins, dort steht das Emoji). Hörtexte in `voyageur/assets/audio/`: `au_assistante.mp3` (Stimme „Merisa“), `au_marcel.mp3` („Peter“), `au_chloe.mp3` („Victoria“); fehlt eine Aufnahme, liest der Browser vor. Wichtig: Ein neues Bild braucht neue Werte in `data.js`, wenn Fundpunkte, Ausschnitt (`crop`), Hotspots oder Schilder woanders liegen. Lesbare Schrift (Bildunterschriften, Filmklappe, Schilder, Tafel der Klasse) legt das Spiel selbst über das Bild: Auf leere Schilder im Hintergrund schreibt es direkt (`labels` mit `cls: "paint"`), auf der Filmklappe von P19 schräg (`rot`, `size`), auf der Tafel im Klassenfoto mit Kreide (`signAt`).

**Echtes Foto von 1900 (`doc_1900`):** Neurdein frères (Signatur « ND Phot. »), « Le pont Alexandre III et le Grand Palais », Fotografie, 12 × 18,5 cm, erschienen in « Exposition universelle de 1900, album of 50 fine photographic views », Paris 1900. Vorlage: Brown University Library, digitale ID 1303844742343751, über Wikimedia Commons. Gemeinfrei: Antonin Neurdein ist 1914 gestorben, Étienne Neurdein 1918, und in den USA gilt das Foto als gemeinfrei, weil es vor 1931 erschienen ist; eine originalgetreue Reproduktion begründet keine neuen Rechte (§ 68 UrhG). Für das Spiel ist die gedruckte Bildunterschrift am unteren Rand abgeschnitten, das Bild auf 1536 Pixel Breite verkleinert und mit `tools/toenen-voyageur.py` getönt. Das Original liegt in den Projektdateien unter `pain-perdu/teil3_bilder/doc_1900_original.jpg`.

**Test:** `node tools/playthrough-voyageur.js` (lokaler Server wie bei Teil 2) spielt den Kernpfad mit zwei Spielenden ganz durch, mit Fallen, Toren, den freiwilligen Stellen (auch dem Nebenweg ins Petit Palais) und Bildschirmfotos auf Computer und Handy in `test-shots/voyageur/`. `node tools/raten-voyageur.js` prüft die Bremsen gegen Raten und Durchklicken.

**Offline:** Teil 3 liegt wie Teil 2 im französischen Offline-Paket mit drin und startet dort aus `index.html` wie online. Eine deutsche Fassung von Teil 3 gibt es nicht.
