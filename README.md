# L'affaire du pain perdu

Ein Point-and-Click-Abenteuer auf Französisch (Niveau A2) für die Klasse 10: Eine Klasse aus Ohrdruf sucht in Paris den Klassenrucksack „Bernd“, den ein Pantomime versehentlich mitgenommen hat. Das Spiel prüft Hör- und Leseverstehen, den Wechsel von imparfait und passé composé sowie kommunikative Grammatik (passende Fragen, höfliche Reparatur, Wegbeschreibung).

**Spielen:** https://florianchristophnowak-dot.github.io/pain-perdu/
**Lehrkraft-Ansicht:** https://florianchristophnowak-dot.github.io/pain-perdu/?mode=prof (fragt nach dem Code der Lehrkraft)

## Aufbau

| Datei | Inhalt |
| --- | --- |
| `index.html` | Oberfläche (Startbildschirm, Bühne, Fenster) |
| `css/style.css` | Gestaltung |
| `js/data.js` | Alle Texte und Spieldaten: Szenen, Hotspots, Dialogknoten (S02 … V06), Aufgaben, Hilfestufen, Glossar. Kennungen wie im Drehbuch. |
| `js/game.js` | Spiel-Engine: Szenen, Dialoge, Aufgabentypen, Carnet, Karte, Inventar, Hilfe, Speichern, Export, Lehrkraft-Ansicht |
| `js/prof.js` | Code-Abfrage für Lehrkraft-Ansicht und Quiz-Lösungen (im Quelltext steht nur eine Prüfsumme) |
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

- `?mode=prof` fragt einmal pro Browser-Tab nach dem Code der Lehrkraft und zeigt dann Sprungmarken zu jedem Knoten, Lösungen, Transkripte, „Tout débloquer“ und die Ergebnisse auf diesem Gerät. Ohne Code startet das normale Spiel. Der Code steht nicht im Repository, nur seine Prüfsumme in `js/prof.js`; einen neuen Code setzt man, indem man in der Browser-Konsole `ppProf.hash("neuer code")` eingibt und das Ergebnis dort bei `HASH` einträgt.
- Die Lernenden exportieren am Ende (oder jederzeit aus dem Carnet) zwei Dateien: JSON (alles) und CSV (eine Zeile je Aufgabe und Person: Ergebnis, Versuche, Hilfestufe, Wiederholungen, Transkript, Dauer, Text).
- Der Spielstand liegt im `localStorage` des Browsers; „Continuer la partie“ nimmt ihn wieder auf. Der Knopf „Menu“ oben links (Haus-Symbol, auch auf dem Endbildschirm) führt zurück zum Startmenü, der Stand bleibt dabei gespeichert. Wer dort eine neue Partie beginnt, behält die alte in den Ergebnissen auf diesem Gerät.
- Der Testzugang `window.PP` (Sprünge, Flags) existiert nur in der Lehrkraft-Ansicht oder mit `?test=1` für die automatischen Tests.

## Merken statt notieren: Abfragen im Spiel

Das Spiel gibt keine Notier-Hinweise und speichert keine Hinweise für die Schüler. Was wichtig ist, merken sie sich oder schreiben es auf ein Blatt (`zettel.html`, Modell zum Ausdrucken, auch als `druck/Fiche_enquete.pdf`). An sechs späteren Stellen fragt das Spiel die Informationen ab; die Antworten werden getippt (Knotentyp `task`, `kind: "recall"`, Felder `fields` oder Lücken `parts`, Prüfung ohne Groß-/Kleinschreibung und Akzente, `answers`, `keywords`, `number` oder `digits`). Wer es nicht weiß, kann „Revenir plus tard“ wählen und nachsehen; nach dem zweiten Fehlversuch nennt die Figur den Ort, an dem die Information steht. Nach drei falschen Versuchen ist die Abfrage eine Minute gesperrt (auch nach „Revenir plus tard“), damit Raten nicht schneller ist als Nachsehen. Ein einzelner Tippfehler in Wörtern ab fünf Buchstaben ohne Ziffern zählt als richtig; Lesefallen wie „Duval“ bleiben falsch.

Die freien Texte (`kind: "write"`: Nachricht an M. Nowak `B06`, Abschlussbericht `V05`) zählen nur echte Wörter: mindestens ein Vokal, kein Buchstabe dreimal hintereinander, einzelne Buchstaben nur à/a/y (Zahlen, Uhrzeiten wie 17 h, M. und Abkürzungen wie SMS zählen). Ein Satzanfang mit „...“ muss mit eigenen Wörtern weitergeführt werden, „...“ mitten im Satzanfang muss ersetzt sein. Ab drei Nicht-Wörtern oder bei ständig denselben Wörtern lehnt Marie den Text ab. Die Rückmeldungen stehen in `G.ui.write`.

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
- Hörtexte: Handys spielen Ton erst nach Antippen ab. Startet die Aufnahme nicht von selbst, wartet der Knopf „Écouter“; die Computerstimme springt nur ein, wenn die Datei fehlt.
- Abfragen: keine Autokorrektur, für die Telefonnummer das Ziffernfeld; die Tastatur öffnet sich erst, wenn man ins Feld tippt.
- Export: Auf Handy und Tablet öffnet „Exporter le carnet“ das Teilen-Menü mit beiden Dateien (Mail, AirDrop, Teams …); geht das nicht, werden die Dateien heruntergeladen.
- Zum Home-Bildschirm hinzufügen (Safari: Teilen → „Zum Home-Bildschirm“, Chrome: Menü → „App installieren“) startet das Spiel ohne Browserleiste, mit Bernd als Symbol (`manifest.webmanifest`, `assets/icons/`). Achtung iPhone: Die Home-Bildschirm-Version hat einen eigenen Spielstand, getrennt von Safari.

## Herunterladen und offline spielen

Auf GitHub „Code → Download ZIP“ wählen, entpacken und `index.html` im Browser öffnen. Alle Bilder, Hörtexte und die Titelschrift liegen im Ordner und brauchen keine Internetverbindung; der Spielstand wird im Browser gespeichert.

Die früheren Kennungen `D_M02`, `D_P03` und `D_B05` (Zuordnungsaufgaben) gibt es nicht mehr. Der Abspann steht in `G.credits`.

## Reihenfolge und Sperren

Damit niemand Stationen überspringt, geht jede erst auf, wenn die Information dafür im Spiel gefallen ist:

- Père-Lachaise und Marais öffnen sich auf der Karte erst nach dem Sack (`M02`) und der Aussage der Kioskfrau (`M04b`). Vorher sagt Marie, warum.
- Die Buchhandlung erscheint erst nach Marcels Nachricht bei Nora (`B03`); die Tür im Marais bleibt bis dahin nur eine Tür.
- Lenoir zeigt die Aushänge erst nach dem Nachnamen, der Stempeltisch kommt nach dem richtigen Aushang, Marcels Karte nach dem Stempel.
- Die Assistentin am Louvre lässt erst nach dem richtigen Aushang durch und fragt Name und Uhrzeit ab; Marcel fragt am Ende den Inhalt des Rucksacks ab.

Frage 3 im Carnet („Voleur ou erreur ?“) gilt als geklärt, sobald Chloés Foto (`P06`) und Marcels Nachricht (`B04`) verstanden sind.

## Phase 2

Die Nebenwege aus Abschnitt 10 des Drehbuchs sind eingebaut und freiwillig: die Karte „demain“ (C01) schaltet die Catacombes frei (C02, Anruf bei Chloé → C03 mit Hörtext `au_chloe`), Aushang A schaltet die place des Vosges frei (X01), Gaston (P07) ist nach dem Gespräch mit dem Wärter erreichbar, und die Assistentin bietet vor dem Finale das Brotschatten-Rätsel an (V02b, Hörtext `au_assistante`). Der Abspann steht in `js/data.js` unter `credits`; dort trägst du die Namen ein.

## Test

`tools/playthrough.js` spielt beide Phasen automatisch durch (Playwright, Chromium) und meldet am Ende die Diagnosezeilen. Vorher `npm i -D playwright` und einen lokalen Server starten (`npx http-server -p 8765 .`), dann `node tools/playthrough.js` (öffnet `index.html?intro=0&test=1`). Nach Änderungen an Texten oder Code zeigt ein fehlgeschlagener Durchlauf schnell, wo etwas klemmt.

## Schrift

Der Titel (Startbildschirm, Kopfzeile, Abspann) nutzt die Schrift Limelight aus `assets/fonts/` (SIL Open Font License, Lizenztext liegt daneben). Alles andere nutzt Systemschriften.

## Introvideo

Beim Laden der Seite läuft `assets/video/intro.mp4` (8 Sekunden, 1280 × 720, mit Ton): die Klasse vor dem Sacré-Cœur, Marcel kommt dazu. Am Ende erscheint der Titel groß in der Plakatschrift des Spiels, danach das Startmenü. „Passer l'intro“ überspringt das Video, „Revoir l'intro“ im Startmenü zeigt es noch einmal, `index.html?intro=0` lässt es ganz aus (etwa für Tests). Ohne vorherigen Klick spielen Browser nur stumm ab; der Knopf links unten schaltet den Ton ein. Fehlt die Datei oder kann der Browser sie nicht abspielen, erscheint sofort das Startmenü. `intro_poster.jpg` ist das erste Bild des Videos und wird gezeigt, solange das Video lädt.

## Deutsche Fassung

Eine deutsche Testfassung (etwa für jüngere Testspieler ohne Französisch) liegt im Ordner `de/`: https://florianchristophnowak-dot.github.io/pain-perdu/de/ – sie ist von der französischen Seite aus nicht verlinkt.

- Alle Texte sind übersetzt; die Hörtexte erscheinen als Lesetexte („Text noch mal lesen“ in den Aufgaben, Maries Hilfe zeigt den Text). Die Grammatikaufgaben (imparfait/passé composé) sind dort Verständnisfragen, das Glossar ist ein kleines Paris-Lexikon.
- Bilder, Video, Schrift, `css/style.css` und `js/prof.js` kommen aus dem Hauptordner; eigene Dateien: `de/index.html`, `de/js/data.js` (alle Spieltexte), `de/css/de.css`, `de/zettel.html`, `de/manifest.webmanifest`. Eigener Spielstand (`pp_de_save_v1`), getrennt vom französischen.
- `de/js/game.js` wird nicht von Hand geändert: `node tools/build_de.js` erzeugt es aus `js/game.js` und übersetzt die festen Texte. Nach Änderungen an `js/game.js` das Skript erneut ausführen; passt ein Ersatz nicht mehr, nennt es die Stelle. Neue Spieltexte in `js/data.js` müssen von Hand in `de/js/data.js` übernommen werden.
- `node tools/build_de.js --zip pain-perdu_deutsch_offline.zip` baut ein Offline-Paket (ein Ordner, `index.html` öffnen). Test: `node tools/playthrough_de.js`.

## Texte ändern

Alle Spieltexte liegen in `js/data.js`. Figurentexte sind `fr`, Linos umschaltbare Kommentare zusätzlich `de`. Die Kennungen (M03, P04, …) verbinden Drehbuch, Code und Diagnose.
