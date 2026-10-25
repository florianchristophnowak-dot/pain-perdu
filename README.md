# L'affaire du pain perdu

Ein Point-and-Click-Abenteuer auf Französisch (Niveau A2) für die Klasse 10: Eine Klasse aus Ohrdruf sucht in Paris den Klassenrucksack „Bernd“, den ein Pantomime versehentlich mitgenommen hat. Lino ermittelt zusammen mit Marie, seiner französischen Austauschpartnerin; sie gibt die Hilfen. Das Spiel prüft Hör- und Leseverstehen, den Wechsel von imparfait und passé composé sowie kommunikative Grammatik (passende Fragen, höfliche Reparatur, Wegbeschreibung).

**Spielen:** https://florianchristophnowak-dot.github.io/pain-perdu/
**Lehrkraft-Ansicht:** https://florianchristophnowak-dot.github.io/pain-perdu/?mode=prof (fragt nach dem Code der Lehrkraft)
**Teil 2 « Le guide fantôme »:** https://florianchristophnowak-dot.github.io/pain-perdu/guide-fantome/ (siehe Abschnitt [Teil 2](#teil-2-le-guide-fantôme))

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
- Der Testzugang `window.PP` (Sprünge, Flags) existiert nur in der Lehrkraft-Ansicht oder mit `?test=1` für die automatischen Tests; `?test=1` wirkt nur auf dem eigenen Rechner (localhost), nicht auf der veröffentlichten Seite.

## Merken statt notieren: Abfragen im Spiel

Das Spiel gibt keine Notier-Hinweise und speichert keine Hinweise für die Schüler. Was wichtig ist, merken sie sich oder schreiben es auf ein Blatt (`zettel.html`, Modell zum Ausdrucken, auch als `druck/Fiche_enquete.pdf`). An sechs späteren Stellen fragt das Spiel die Informationen ab; die Antworten werden getippt (Knotentyp `task`, `kind: "recall"`, Felder `fields` oder Lücken `parts`, Prüfung ohne Groß-/Kleinschreibung und Akzente, `answers`, `keywords`, `number` oder `digits`). Wer es nicht weiß, kann „Revenir plus tard“ wählen und nachsehen; nach dem zweiten Fehlversuch nennt die Figur den Ort, an dem die Information steht. Nach drei falschen Versuchen ist die Abfrage eine Minute gesperrt, ab der zweiten Sperre zwei Minuten (auch nach „Revenir plus tard“ und nach Neuladen), damit Raten nicht schneller ist als Nachsehen. Dieselbe Sperre gilt für alle Aufgaben (siehe „Gegen Raten und Durchklicken“). Ein einzelner Tippfehler in Wörtern ab fünf Buchstaben ohne Ziffern zählt als richtig; Lesefallen wie „Duval“ bleiben falsch.

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
- Hörtexte: Handys spielen Ton erst nach Antippen ab. Startet die Aufnahme nicht von selbst, wartet der Knopf „Écouter“; die Computerstimme springt nur ein, wenn die Datei fehlt.
- Abfragen: keine Autokorrektur, für die Telefonnummer das Ziffernfeld; die Tastatur öffnet sich erst, wenn man ins Feld tippt.
- Export: Auf Handy und Tablet öffnet „Exporter le carnet“ das Teilen-Menü mit beiden Dateien (Mail, AirDrop, Teams …); geht das nicht, werden die Dateien heruntergeladen.
- Zum Home-Bildschirm hinzufügen (Safari: Teilen → „Zum Home-Bildschirm“, Chrome: Menü → „App installieren“) startet das Spiel ohne Browserleiste, mit Bernd als Symbol (`manifest.webmanifest`, `assets/icons/`). Achtung iPhone: Die Home-Bildschirm-Version hat einen eigenen Spielstand, getrennt von Safari.

## Herunterladen und offline spielen

Auf GitHub „Code → Download ZIP“ wählen, entpacken und `index.html` im Browser öffnen. Alle Bilder, Hörtexte und die Titelschrift liegen im Ordner und brauchen keine Internetverbindung; der Spielstand wird im Browser gespeichert.

Die früheren Kennungen `D_M02`, `D_P03` und `D_B05` (Zuordnungsaufgaben) gibt es nicht mehr. Der Abspann steht in `G.credits`.

## Gegen Raten und Durchklicken

Wer kein Französisch kann und nur klickt, soll nicht durchkommen. Auswahlaufgaben lassen sich nie ganz gegen Raten schützen; das Spiel sorgt deshalb dafür, dass Raten langsamer ist als Lesen und Zuhören, und dass die Stellen, an denen es weitergeht, Französisch verlangen:

- **Gemischte Antworten:** Dialogantworten mit einer falschen Option (z. B. `M03`, `P05`, `B02`, Finale `V03`) und die Optionen in Auswahl-, Zuordnungs-, Lücken- und Wegaufgaben stehen jedes Mal in neuer Reihenfolge. Die richtige Antwort steht also nicht mehr meist oben.
- **Pause nach Fehlversuchen:** In jeder Aufgabe (Zuordnen, Lücken, Auswahl, Weg, Aushang, Stempel, Abfrage) sperrt jeder dritte Fehlversuch die Aufgabe für eine Minute, danach für zwei. Marie sagt: „Là, tu devines.“ Hören, Transkript und Hilfe bleiben in der Pause nutzbar, die Sperre übersteht Neuladen. Leere Lücken zählen nicht als Versuch. Konstanten: `GUESS_TRIES`, `GUESS_PAUSE` in `js/game.js`, Texte in `G.ui.guess`.
- **Nur die Anzahl:** Bei Lücken und Zuordnungen (`M04`, `M04b`, `C03`, `V02b`) sagt das Spiel nach einem Fehlversuch nur noch „Juste : 2 sur 4.“ und markiert keine einzelne Lücke mehr. Sonst wäre Durchprobieren in zwei Klicks erledigt.
- **Aushang begründen:** Nach dem richtigen Aushang (`L02`) fragt Lenoir nach zwei Belegen (Name und Fassung, `task.proof`), wie im Konzept vorgesehen („den aktuellen Eintrag mit zwei Belegen begründen“). „17 h“, der Titel und „eine Cour“ zählen nicht, weil sie auf mehreren Aushängen stehen.
- **Freie Texte:** Die eigenen Wörter müssen französisch sein (`G.writeLang`: mindestens 20 % häufige französische Wörter, ab drei deutschen oder englischen Wörtern lehnt Marie ab) und mindestens zwei (`B06`) bzw. drei (`V05`) Wörter zur Geschichte enthalten (`task.topic`, Wortanfänge). Einfügen (etwa aus einem Übersetzer) ist gesperrt.
- **Hörtexte nicht wegklicken:** Beim ersten Mal geht „Continuer“ erst, wenn die Aufnahme ganz gelaufen ist (`S.heard`). In der deutschen Fassung gilt stattdessen eine Mindest-Lesezeit, und die freien Texte müssen deutsch sein.
- **Hilfe ohne fertige Lösung:** Die deutsche Stufe 4 erklärt bei `M04` und `P04`, worauf man im Transkript achten muss, statt die Zuordnung zu verraten; Stufe 3 bei `M03` zitiert die richtige Frage nicht mehr.
- **Keine Abkürzungen:** Fenster, nach denen es weitergeht (z. B. Kevins SMS vor der Nachricht an Nowak), haben kein ×, und Carnet, Karte, Inventar und Glossar öffnen sich nicht, solange eine Aufgabe offen ist (auch nicht per Tastatur).

Was bleibt: Wer die Lösungen von Mitschülern oder aus der deutschen Testfassung kennt, kann Namen und Orte übertragen; die deutsche Fassung deshalb nicht an Lernende weitergeben. Die Ergebnisse zeigen Raten trotzdem: Spalte „Versuche“ im Export, im JSON zusätzlich `pauses` (wie oft eine Aufgabe gesperrt war).

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

`tools/playthrough.js` spielt beide Phasen automatisch durch (Playwright, Chromium) und meldet am Ende die Diagnosezeilen. Vorher `npm i -D playwright` und einen lokalen Server starten (`npx http-server -p 8765 .`), dann `node tools/playthrough.js` (öffnet `index.html?intro=0&test=1`). Nach Änderungen an Texten oder Code zeigt ein fehlgeschlagener Durchlauf schnell, wo etwas klemmt. `node tools/raten.js` (bzw. `node tools/raten.js de`) spielt wie jemand, der nur rät, und prüft die Bremsen aus „Gegen Raten und Durchklicken“.

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

## Teil 2: Le guide fantôme

Zweiter Fall, unabhängig von Teil 1 spielbar: Vor Notre-Dame kassiert ein falscher Stadtführer, « M. Beaumont », die Anzahlung der Klasse und verschwindet. Die Lernenden spielen Marie; Lino begleitet sie und gibt die Hilfe, in vier Stufen und nur auf Französisch (das Glossar bleibt französisch-deutsch). Stationen: Auftakt an Notre-Dame, Galeries Lafayette, Tour Eiffel, freiwillig die Bouquinisten, Finale am Service des retours, nach den Bouquinisten ein kurzes Nachspiel, zum Schluss der Rapport. Grundlage sind das Spielkonzept und das Drehbuch Teil 2; die Kennungen (N03, G04, E02, R1 …) stimmen mit dem Drehbuch überein.

| Datei | Inhalt |
| --- | --- |
| `guide-fantome/index.html` | Oberfläche (wie Teil 1, ohne Sprachschalter und Intro) |
| `guide-fantome/js/data.js` | Alle Texte und Spieldaten von Teil 2 |
| `guide-fantome/js/game.js` | Engine, abgeleitet von `js/game.js`, mit den neuen Bausteinen |
| `guide-fantome/css/guide.css` | Ergänzungen zu `css/style.css` (Bildlupe, Karte mit Aufkleber, Lino-Farbe) |
| `guide-fantome/assets/ph/` | gezeichnete Platzhalter (SVG), bis die echten Bilder da sind |

Eigener Spielstand (`pg_save_v1`, Ergebnisse `pg_results_v1`), getrennt von Teil 1. Lehrkraft-Ansicht mit demselben Code: `guide-fantome/?mode=prof`.

**Neue Bausteine:** Bildlupe (`loupe`: zoomen mit + und −, Mausrad oder zwei Fingern, verschieben, Details antippen; die Karte « Visite exclusive » hat einen Aufkleber, den man an der Ecke abzieht, und eine Rückseite), Beobachtung (`observe`: vier Bilder in Schleife, drei Auffälligkeiten finden, das Telefon klingelt erst zum Schluss), Fragen an die Verkäuferin (`ask`: Ja-Nein-Fragen bekommen nur « Oui. », nach der dritten eine Minute Pause), Spalten (`cols`), Ketten mit Lücken (`chain`), Beweise (`proofs`) sowie Inhaltsprüfungen für eigene Fragen, die Nachricht an M. Nowak, die Warnung und den Rapport (imparfait, passé composé, Verneinung, Zeitangabe). Alle Bremsen aus Teil 1 gelten weiter; neu ist die Tempobremse (drei Fehlversuche hintereinander in weniger als zwei Sekunden: « Doucement. Lis d'abord. », 20 Sekunden; in Bildlupe und Beobachtung nach acht Fehlklicks). Die Abfragen R1 bis R5 sind Tore: Eine Station gilt erst als erledigt, wenn ihre Abfrage gelöst ist; wer sie aufschiebt, wird im leeren Dialogfeld daran erinnert.

**Bilder und Aufnahmen:** Das Spiel sucht jedes Bild zuerst als `guide-fantome/assets/img/<name>.jpg`, dann `.png`, dann den Platzhalter `assets/ph/<name>.svg`. Die Namen: Hintergründe `bg_parvis`, `bg_lafayette`, `bg_eiffel`, `bg_quai`, `bg_retours`; Zwischensequenzen `cut_beaumont`, `cut_compte`, `cut_parapluie`; Bildlupe und Beobachtung `doc_photo_groupe`, `doc_selfie`, `obs_bonneteau_1` bis `obs_bonneteau_4`; Porträts (PNG, quadratisch) `pt_lino`, `pt_marie`, `pt_nowak`, `pt_beaumont`, `pt_lucien`, `pt_vendeuse`, `pt_joueur`, `pt_spectateur`, `pt_spectatrice`, `pt_bouquiniste`, `pt_agent`, `pt_policiere`, `pt_touriste`. Hörtexte in `guide-fantome/assets/audio/`: `au_beaumont.mp3`, `au_telephone.mp3`, `au_bouquiniste.mp3` (fehlt eine Datei, liest der Browser vor). Wichtig für die Bildlupe und die Beobachtung: Die Fundpunkte stehen in Prozent des Bildes in `data.js` (`points`); neue Bilder müssen die Details an denselben Stellen zeigen wie die Platzhalter, sonst die Werte dort anpassen. Schrift, die man lesen muss (Tüte, Etikett, Preis im Buch, Karte, Ausweis), legt das Spiel selbst über das Bild.

**Test:** `node tools/playthrough-guide.js` (lokaler Server im Hauptordner, z. B. `python3 -m http.server 8765`) spielt Teil 2 mit zwei Spielenden ganz durch, prüft Fallen, Zählungen und Tore und macht Bildschirmfotos auf dem Computer und dem Handy (hoch und quer) in `test-shots/guide/`.

**Stand der Bilder:** Eingesetzt sind `bg_parvis`, `bg_lafayette`, `bg_eiffel`, `bg_quai`, `bg_retours`, `cut_beaumont`, `doc_photo_groupe` und die Inventar-Symbole (`it_*.png`, aus einem 3 × 3-Sammelbild geschnitten); acht Porträts sind vorläufig aus diesen Szenenbildern geschnitten (`pt_nowak`, `pt_beaumont`, `pt_lucien`, `pt_vendeuse`, `pt_joueur`, `pt_spectateur`, `pt_spectatrice`, `pt_bouquiniste`); die Fundpunkte und Hotspots sind auf diese Bilder eingestellt. Die drei Hörtexte sind aufgenommen und eingesetzt. Die vier Bilder des Hütchenspiels (`obs_bonneteau_1` bis `obs_bonneteau_4`) sind eingesetzt. Das Selfie (`doc_selfie`) und die Zwischenbilder `cut_compte` und `cut_parapluie` sind eingesetzt, damit hat kein Bild mehr einen Platzhalter. Die Porträts `pt_agent` und `pt_policiere` sind aus `cut_compte` geschnitten.

**Noch offen (Schritt 2):** das Porträt `pt_touriste` (bis dahin zeigt das Spiel das Kürzel „T“), deutsche Fassung, Offline-Pakete.
