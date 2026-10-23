# L'affaire du pain perdu

Ein Point-and-Click-Abenteuer auf Französisch (Niveau A2) für die Klasse 10: Eine Klasse aus Erfurt sucht in Paris den Klassenrucksack „Bernd“, den ein Pantomime versehentlich mitgenommen hat. Das Spiel prüft Hör- und Leseverstehen, den Wechsel von imparfait und passé composé sowie kommunikative Grammatik (passende Fragen, höfliche Reparatur, Wegbeschreibung).

**Spielen:** https://florianchristophnowak-dot.github.io/pain-perdu/
**Lehrkraft-Ansicht:** https://florianchristophnowak-dot.github.io/pain-perdu/?mode=prof

## Aufbau

| Datei | Inhalt |
| --- | --- |
| `index.html` | Oberfläche (Startbildschirm, Bühne, Fenster) |
| `css/style.css` | Gestaltung |
| `js/data.js` | Alle Texte und Spieldaten: Szenen, Hotspots, Dialogknoten (S02 … V06), Aufgaben, Hilfestufen, Glossar. Kennungen wie im Drehbuch. |
| `js/game.js` | Spiel-Engine: Szenen, Dialoge, Aufgabentypen, Carnet, Karte, Inventar, Hilfe, Speichern, Export, Lehrkraft-Ansicht |
| `assets/img/` | Hintergründe, Zwischensequenzen, Porträts |
| `assets/audio/` | Hörtexte (MP3) |

Kein Build, kein Server nötig: `index.html` lässt sich auch direkt im Browser öffnen. GitHub Pages veröffentlicht den Stand von `main` automatisch (Workflow in `.github/workflows/pages.yml`). Voraussetzung: In den Repository-Einstellungen ist unter „Pages“ die Quelle „GitHub Actions“ gewählt; jeder Push auf `main` löst dann die Veröffentlichung aus.

## Bilder und Aufnahmen ergänzen

Die Platzhalter werden ersetzt, sobald eine Datei mit dem passenden Namen liegt. Das Spiel sucht zuerst `.png`, dann `.jpg`; fehlt ein Porträt, zeigt es Initialen; fehlt eine Aufnahme, liest der Browser den Text vor.

| Typ | Dateien (in `assets/img/` bzw. `assets/audio/`) |
| --- | --- |
| Hintergründe | `bg_montmartre`, `bg_pere_lachaise`, `bg_boulangerie`, `bg_librairie`, `bg_louvre_cour`; Phase 2: `bg_catacombes`, `bg_lampes` |
| Zwischensequenzen | `cut_confusion`, `cut_final` |
| Porträts (quadratisch, PNG) | `pt_leo`, `pt_marie`, `pt_kiosque`, `pt_gardien`, `pt_chloe`, `pt_nora`, `pt_lenoir`, `pt_marcel`, `pt_assistante` |
| Aufnahmen (MP3) | `au_kiosque.mp3`, `au_gardien.mp3`, `au_marcel.mp3`; Phase 2: `au_assistante.mp3`, `au_chloe.mp3` |

Die Hotspot-Positionen stehen in `js/data.js` (`scenes`, Angaben in Prozent des Bildes) und werden nach dem Bildtausch angepasst.

## Lehrkraft-Ansicht und Export

- `?mode=prof` zeigt Sprungmarken zu jedem Knoten, Lösungen, Transkripte, „Tout débloquer“ und die Ergebnisse auf diesem Gerät.
- Die Lernenden exportieren am Ende (oder jederzeit aus dem Carnet) zwei Dateien: JSON (alles) und CSV (eine Zeile je Aufgabe und Person: Ergebnis, Versuche, Hilfestufe, Wiederholungen, Transkript, Dauer, Text).
- Der Spielstand liegt im `localStorage` des Browsers; „Continuer la partie“ nimmt ihn wieder auf.

## Zettel und Quiz (Papier)

Hinweise werden nicht mehr im Spiel „ins Carnet sortiert“, sondern auf Papier notiert. An zehn Stellen zeigt das Spiel eine Aufforderung **✎ Sur ton Zettel** (Knotentyp `zettel` in `js/data.js`: Felder `items` = was zu notieren ist, optional `doc`/`docOf`/`docs` = Dokument zum Nachlesen, `audio` = Hörtext zum Wiederholen, `q` = betroffene Frage(n), `effects`, `after`, `next`). Das Carnet im Spiel zeigt pro Hinweis nur noch das Stichwort (`label` in `G.proofs`); der Inhalt steht auf dem Zettel der Schüler.

Druckvorlagen (auch aus der Lehrkraft-Ansicht verlinkt):

| Datei | Inhalt |
|---|---|
| `zettel.html` | Zettel d'enquête, ein Blatt pro Schüler (Q1–Q4 + Sonstiges) |
| `quiz.html` | Quiz für die Folgestunde, 20 Punkte + Bonus; `quiz.html?prof=1` hängt das Lösungsblatt an |

Die früheren Kennungen `D_M02`, `D_P03` und `D_B05` (Zuordnungsaufgaben) gibt es nicht mehr.

## Phase 2

Die Nebenwege aus Abschnitt 10 des Drehbuchs sind eingebaut und freiwillig: die Karte „demain“ (C01) schaltet die Catacombes frei (C02, Anruf bei Chloé → C03 mit Hörtext `au_chloe`), Aushang A schaltet die place des Vosges frei (X01), Gaston (P07) ist nach dem Gespräch mit dem Wärter erreichbar, und die Assistentin bietet vor dem Finale das Brotschatten-Rätsel an (V02b, Hörtext `au_assistante`). Der Abspann steht in `js/data.js` unter `credits`; dort trägst du die Namen ein.

## Test

`tools/playthrough.js` spielt beide Phasen automatisch durch (Playwright, Chromium) und meldet am Ende die Diagnosezeilen. Vorher `npm i -D playwright` und einen lokalen Server starten (`npx http-server -p 8765 .`), dann `node tools/playthrough.js`. Nach Änderungen an Texten oder Code zeigt ein fehlgeschlagener Durchlauf schnell, wo etwas klemmt.

## Texte ändern

Alle Spieltexte liegen in `js/data.js`. Figurentexte sind `fr`, Leos umschaltbare Kommentare zusätzlich `de`. Die Kennungen (M03, P04, …) verbinden Drehbuch, Code und Diagnose.
