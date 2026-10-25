/* L'affaire du pain perdu – Spieldaten, deutsche Fassung (Testversion für Kinder)
   Übersetzt aus js/data.js (französisches Original). Kennungen wie im Drehbuch: S02, M00 … V06.
   Alle Figuren sprechen Deutsch; die Hörtexte erscheinen als Lesetexte. Die Engine de/js/game.js erzeugt tools/build_de.js. */
window.GAME = (function () {
  const G = {};

  G.version = "0.1.0-de";

  /* ---------- Figuren ---------- */
  G.chars = {
    narrateur: { name: "", initials: "", color: "#8b7355" },
    lino: { name: "Lino", pt: "pt_lino", initials: "L", color: "#3b4a6b" },
    marie: { name: "Marie", pt: "pt_marie", initials: "M", color: "#8a3b3b" },
    kiosque: { name: "Die Kioskfrau", pt: "pt_kiosque", initials: "K", color: "#4a7a4a" },
    gardien: { name: "Der Friedhofswärter", pt: "pt_gardien", initials: "W", color: "#2f4b7a" },
    chloe: { name: "Chloé", pt: "pt_chloe", initials: "C", color: "#b04a3a" },
    nora: { name: "Nora", pt: "pt_nora", initials: "N", color: "#b07a2a" },
    lenoir: { name: "Herr Lenoir", pt: "pt_lenoir", initials: "Le", color: "#6b5a3b" },
    marcel: { name: "Marcel", pt: "pt_marcel", initials: "Mb", color: "#333" },
    assistante: { name: "Die Assistentin", pt: "pt_assistante", initials: "A", color: "#4a4a6b" },
    nowak: { name: "Herr Nowak", pt: "", initials: "N", color: "#5a5a5a" },
    kevin: { name: "Kevin", pt: "", initials: "Kv", color: "#3a7ab0" },
    employee: { name: "Die Angestellte der Katakomben", pt: "pt_catacombes", initials: "A", color: "#555a66" },
    musicien: { name: "Der Musiker", pt: "pt_musicien", initials: "Mu", color: "#7a5a2a" }
  };

  /* ---------- Feste Texte ---------- */
  G.ui = {
    title: "L'affaire du pain perdu",
    subtitle: "Ein Fall der 10b in Paris",
    verbs: { regarder: "Ansehen", parler: "Sprechen", montrer: "Zeigen", ecouter: "Anhören", comparer: "Vergleichen", courir: "Hinterher" },
    btn: {
      carnet: "Fallakte", carte: "Karte", inventaire: "Inventar", aide: "Hilfe", rejouer: "Text noch mal lesen", transcription: "Text",
      noter: "Notieren", continuer: "Weiter", retour: "Zurück", exporter: "Fallakte exportieren", valider: "Prüfen", fermer: "Schließen",
      glossaire: "Lexikon", commencer: "Los geht's", reprendre: "Weiterspielen", nouvelle: "Neues Spiel", lire: "Lesen",
      annuler: "Abbrechen", recommencer: "Neu anfangen", menu: "Menü"
    },
    start: { p1: "Spieler 1:", p2: "Spieler 2:", p2hint: "(freiwillig)", lino: "Linos Kommentare:", fr: "auf Deutsch", de: "auf Deutsch" },
    carnet: {
      title: "Unsere Ermittlung", questions: "Die vier Fragen", done: "geklärt", open: "?",
      cards: "Unsere Texte", mission: "Auftrag",
      hint: "Die Fallakte merkt sich nichts für dich. Namen, Orte, Uhrzeiten: Die merkst du dir, oder du schreibst sie auf dein Blatt."
    },
    recall: { check: "Prüfen", later: "Später wiederkommen", pause: "Jetzt ratet ihr nur. Seht nach und kommt in einer Minute wieder.", paused: "Jetzt nicht. Seht erst nach und kommt in {s} Sekunden wieder.", wrong: "Nein, das stimmt nicht.", unknown: "Du weißt es nicht mehr? Sieh noch mal nach und komm dann wieder.", intro: "Antworte aus dem Gedächtnis oder mit deinem Blatt." },
    inv: { title: "Inventar", empty: "Nichts.", show: "Zeigen", showTo: "Was zeigst du {to}?", hint: "Klicke auf einen Gegenstand, um ihn genau anzusehen.", nothing: { who: "lino", fr: "Nein. Das bringt nichts." } },
    partner: "Wechsel! {p2} übernimmt die Maus, {p1} die Fallakte.",
    solo: "Diese Frage beantwortet jeder allein. Zuerst {p1}, dann {p2}.",
    soloNow: "Jetzt ist {p} dran.",
    travel: { who: "lino", fr: "Schon wieder Métro. Ich kenne Paris von unten." },
    end: "Bravo! Der Fall ist gelöst.",
    mouse: "Maus:",
    write: {
      count: "{n} Wörter (mindestens {min})",
      more: "Noch mindestens {n} Wörter.",
      finish: "Schreib den Satz „{s}“ zu Ende.",
      dots: "In „{s}“ stehen noch „...“. Ersetze sie durch deine Wörter.",
      junk: "Das sind keine Wörter: „{w}“. Schreib echte Sätze.",
      repeat: "Du wiederholst immer dieselben Wörter. Erzähl mit verschiedenen Sätzen."
    },
    full: {
      label: "Vollbild", exit: "Vollbild beenden", exitShort: "Vollbild aus", title: "Vollbild",
      ios: "Auf dem iPhone kann der Browser das Spiel nicht auf Vollbild schalten. Du kannst das Spiel aber auf den Home-Bildschirm legen:",
      iosSteps: ["Tippe auf „Teilen“: das Quadrat mit dem Pfeil (manchmal unter „…“).", "Wähle „Zum Home-Bildschirm“.", "Öffne das Spiel über das neue Symbol: Es läuft dann im Vollbild."],
      iosNote: "Achtung: Dort hat das Spiel einen eigenen Spielstand. Und dreh dein Handy quer: Dann wird das Bild größer.",
      other: "Dein Browser kann das Spiel nicht auf Vollbild schalten. Öffne das Browser-Menü und wähle „Zum Startbildschirm hinzufügen“. Über das neue Symbol startet das Spiel ohne Browserleiste."
    },
    marie: {
      ok: "Ja, genau!",
      locked: "Noch nicht. Wir brauchen erst einen Hinweis, um dorthin zu gehen.",
      afterHelp: "Gut. Nächstes Mal schaffst du es ohne mich!",
      tense: "Was hat sie genau gesagt?",
      witness: "Willst du über jetzt, über später oder über vorhin sprechen?",
      helpLater: "Versuch es noch einmal. Danach helfe ich dir."
    },
    mapQuestion: "Frage vor Ort:",
    locked: "noch zu",
    done: "erledigt"
  };

  /* ---------- Fragen: "geklärt", sobald die passende Abfrage im Spiel bestanden ist ---------- */
  G.questions = {
    Q1: { title: "Wer ist der Pantomime?", done: "L02q_done" },
    Q2: { title: "Wo und wann spielt er heute?", done: "V01q_done" },
    Q3: { title: "Dieb oder Irrtum?", done: ["P06_done", "B04_done"] },
    Q4: { title: "Was ist in unserem Rucksack?", done: "V03q_done" }
  };
  /* ---------- Inventar ---------- */
  G.items = {
    sac_bernd: { emoji: "🎒", name: "der Rucksack Bernd", desc: "Ein großes Brot mit Gesicht ... und zwar kein fröhliches. Unsere Sachen sind drin.", start: true },
    carte_eleve: { emoji: "🪪", name: "der Schülerausweis", desc: "Lino, 10b, Ohrdruf.", start: true },
    nougat: { emoji: "🍫", name: "das Viba-Nougat", desc: "Für Notfälle.", start: true },
    cola: { emoji: "🥤", name: "die Vita Cola", desc: "Eine Flasche aus Thüringen. In Paris kennt die niemand.", start: true },
    telephone: { emoji: "📱", name: "das Handy", desc: "Akku: 23 %.", start: true,
      actions: [
        { if: "B05_done", label: "Kevins SMS noch mal lesen", icon: "sms", text: "Lino!!! Hast du Bernd gefunden??? Meine blaue Dose ist in der Vordertasche!!! Mit meinem Namen drauf: KEVIN, mit K. Da drin ist meine Zahnspange. Ohne die kann ich kein Baguette essen. Finde den Rucksack!!!" },
        { if: "L05_done", label: "Herrn Nowak schreiben: „Was ist alles in Bernd?“", icon: "sms", flag: "nowak_asked", diag: "D_NOWAK", text: "Herr Nowak: „Lino! Kevins blaue Dose ist in der Vordertasche. Mein roter Umschlag liegt unter den Fahrkarten. Und wo seid ihr?! Ich zähle ... 31.“" }
      ] },
    sac_mime: { emoji: "👜", name: "die Tasche des Pantomimen", desc: "Braun, mit rotem Reißverschluss und gelbem Aufkleber. Darin: drei Plastik-Baguettes, ein weißer Handschuh, ein nasses Programmheft (man kann nichts lesen)." },
    carte_chloe: { emoji: "📝", name: "Chloés Karte", desc: "„Père-Lachaise, heute Morgen. Danke für die Texte, Marcel! Chloé“" },
    ticket: { emoji: "🧾", name: "der Kassenbon", desc: "„Bäckerei Nora · Le Marais · Tel. 01 42 72 18 90 · 2 Stück Pain perdu: 5,00 €“" },
    photo_groupe: { emoji: "🖼️", name: "das Gruppenfoto", desc: "Hinter der Klasse sieht man den Pantomimen mit seiner Baskenmütze." },
    flyer: { emoji: "📄", name: "der Flyer", desc: "„Marcel — Le Pain perdu — Pantomime-Show — heute Abend in Paris“" },
    photo_chloe: { emoji: "📷", name: "Chloés Foto", desc: "Heute Morgen auf dem Père-Lachaise: Chloé und Marcel.", img: "doc_photo_chloe" },
    carte_marcel: { emoji: "✉️", name: "Marcels Karte", desc: "„Ich habe in Montmartre die falsche Tasche genommen. Es tut mir leid! … Damit ich sicher bin, dass ihr es seid, frage ich euch, was in eurem Rucksack ist, und wo. — Marcel“" },
    pain_perdu: { emoji: "🍞", name: "ein Stück Pain perdu", desc: "Ein Nachtisch. Kein Rucksack." },
    carte_demain: { emoji: "📇", name: "die Karte „morgen“", desc: "„Morgen, 11 Uhr: Treffen vor dem Eingang der Katakomben. Kulissen mitbringen. — Chloé, 06 12 34 56 78“" }
  };

  /* ---------- Hörtexte: in der deutschen Fassung als Lesetexte ---------- */
  G.audio = {
    au_kiosque: { who: "kiosque", text: "Ja, ich habe den Herrn gesehen. Er trug einen gestreiften Pullover und eine Baskenmütze. Neben ihm standen zwei braune Taschen. Während ihr euer Foto angeschaut habt, hat er die Tasche an der Treppe genommen. Dann ist er zur Métro gegangen. Heute Morgen war er auf dem Friedhof Père-Lachaise. Heute Nachmittag geht er ins Marais. Aber heute Abend? Ich weiß nicht, wo er spielt. Fragt Nora, die Bäckerin." },
    au_gardien: { who: "gardien", text: "Der Pantomime auf eurem Foto? Er heißt Marcel Blanchard. Heute Morgen war er hier, mit einer braunen Tasche. Er hat Chloé Texte gebracht, dann ist er wieder gegangen. Chloé hat vielleicht ein Foto. Geht geradeaus bis zur Kreuzung, dann biegt links ab. Chloé ist bei der roten Bank. Nehmt nicht den Weg, der bergab führt: Der geht zu einem anderen Ausgang." },
    au_chloe: { who: "chloe", text: "Für morgen bereiten wir die Kulissen vor. Die Schädel sind aus Pappe. Nehmt nicht die alten Schilder! Auf das neue Schild schreibt ihr: „Wir suchen Gegenstände, keine Probleme.“ Marcel muss seine braune Tasche mitbringen, die mit dem roten Reißverschluss und dem gelben Aufkleber." },
    au_assistante: { who: "assistante", text: "Kannst du mir helfen? Stell den Spiegel rechts neben die Kiste, dann leg das Plastik-Baguette hinter die Lampe. Mach die rote Lampe nicht an. Mach die blaue Lampe an." },
    au_marcel: { who: "marcel", text: "Hallo Nora, hier ist Marcel. Ich habe meine Tasche aufgemacht und ... Überraschung: Da waren eine blaue Dose und Zugfahrkarten drin! Das gehört nicht mir. In Montmartre standen zwei braune Taschen, und ich hatte es eilig. Ich glaube, ich habe die falsche Tasche genommen. Achtung, für meine Show „Le Pain perdu“ hat sich das Programm geändert. Gib den Leuten nicht das alte Programm. Das korrigierte Programm hängt in der Buchhandlung „Les Mots retrouvés“. Ich hinterlasse dort eine Nachricht für die Leute, die meine Tasche haben." }
  };

  /* ---------- Szenen und Hotspots (Koordinaten in % des Bildes) ---------- */
  G.scenes = {
    montmartre: {
      name: "Montmartre · Sacré-Cœur", bg: "bg_montmartre", enter: "M01",
      hotspots: [
        { id: "sac_brun", label: "die braune Tasche", x: 82, y: 51, w: 10, h: 15, actions: { regarder: "M02" }, hideIf: "M02_done" },
        { id: "kiosque", label: "die Kioskfrau", to: "der Kioskfrau", x: 3, y: 19, w: 15, h: 43, who: "kiosque", actions: { parler: [{ if: "M04b_done", node: "M03r" }, { node: "M03" }], montrer: { photo_groupe: [{ if: "M04b_done", node: "M03r" }, { node: "M03p" }] } } },
        { id: "escalier", label: "die Treppe", x: 26, y: 60, w: 46, h: 34, actions: { regarder: "M01e" } },
        { id: "metro", label: "die Métro", x: 91.5, y: 21, w: 8.5, h: 45, actions: { courir: "M06" } }
      ]
    },
    pere_lachaise: {
      name: "Friedhof Père-Lachaise", bg: "bg_pere_lachaise", enter: "P01",
      hotspots: [
        { id: "gardien", label: "der Wärter", to: "dem Wärter", x: 77, y: 28, w: 20, h: 57, who: "gardien", actions: { parler: [{ if: "P07_done", node: "P02r" }, { if: "P03_done", node: "P07" }, { node: "P02" }], montrer: { photo_groupe: [{ if: "P03_done", node: "P02r" }, { node: "P02m" }], carte_chloe: [{ if: "P03_done", node: "P02r" }, { node: "P02m" }] } } },
        { id: "gaston", label: "Gaston", x: 35, y: 46, w: 21, h: 29, actions: { regarder: [{ if: "P07_done", node: "P07r" }, { if: "P03_done", node: "P07" }, { node: "P01g" }] } },
        { id: "plan", label: "der Plan", x: 1, y: 17, w: 13, h: 34, actions: { regarder: [{ if: "P03_done", node: "P04" }, { node: "P01p" }] } },
        { id: "banc", label: "die rote Bank", x: 15, y: 41, w: 18, h: 19, who: "chloe", actions: { parler: [{ if: "P04_done", node: "P05" }, { node: "P01x" }], regarder: [{ if: "P04_done", node: "P05" }, { node: "P01x" }] } },
        { id: "chemin", label: "der Weg bergab", x: 57, y: 44, w: 15, h: 24, actions: { regarder: "P01x" } }
      ]
    },
    marais: {
      name: "Le Marais · Noras Bäckerei", bg: "bg_boulangerie", enter: "B01",
      hotspots: [
        { id: "nora", label: "Nora", to: "Nora", x: 47, y: 21, w: 13, h: 40, who: "nora", actions: { parler: [{ if: "B04_done", node: "B02r" }, { node: "B02" }], montrer: { ticket: [{ if: "B04_done", node: "B02r" }, { node: "B02t" }], photo_groupe: [{ if: "B04_done", node: "B02r" }, { node: "B02" }], flyer: [{ if: "B04_done", node: "B02r" }, { node: "B02" }] } } },
        { id: "flyer", label: "der Flyer", x: 73.5, y: 36, w: 6, h: 11, actions: { regarder: "B01a" } },
        { id: "panneau", label: "das Schild", x: 64, y: 2, w: 13, h: 34, actions: { regarder: "B01p" } },
        { id: "telephone", label: "Noras Telefon", x: 58, y: 60, w: 6.5, h: 7, actions: { ecouter: "B03" }, showIf: "B03_open" },
        { id: "porte", label: "die Tür der Buchhandlung", x: 83, y: 5, w: 16, h: 80, actions: { regarder: [{ if: "B03_open", node: "GO_librairie" }, { node: "B01l" }] } }
      ]
    },
    librairie: {
      name: "Buchhandlung „Les Mots retrouvés“", bg: "bg_librairie", enter: "L01",
      hotspots: [
        { id: "panneau", label: "die Pinnwand", x: 61, y: 13, w: 9, h: 30, actions: { regarder: [{ if: "L02_done", node: "L02r" }, { if: "L02q_done", node: "L02" }, { node: "L02q" }] } },
        { id: "lenoir", label: "Herr Lenoir", x: 11, y: 18, w: 25, h: 80, who: "lenoir", actions: { parler: "L03" } },
        { id: "table", label: "der Tisch", x: 48, y: 68, w: 45, h: 30, actions: { regarder: [{ if: "L04_done", node: "L04r" }, { if: "L02_done", node: "L04" }, { node: "L04x" }] } },
        { id: "carte_marcel", label: "Marcels Karte", x: 84, y: 36, w: 12, h: 9, actions: { regarder: "L05" }, showIf: "L04_done" }
      ]
    },
    louvre: {
      name: "Innenhof des Louvre", bg: "bg_louvre_cour", enter: "V00",
      hotspots: [
        { id: "assistante", label: "die Assistentin", x: 2, y: 33, w: 17, h: 30, who: "assistante", actions: { parler: [{ if: "V01q_done", node: "V02" }, { if: "L02_done", node: "V01q" }, { node: "V01" }] } },
        { id: "scene", label: "die Bühne", x: 22, y: 10, w: 26, h: 56, actions: { regarder: "V00s" } },
        { id: "marcel", label: "Marcel", x: 49, y: 34, w: 19, h: 56, who: "marcel", actions: { parler: [{ if: "V03_done", node: "V03r" }, { if: "V03_talked", node: "V03q" }, { if: "V02_done", node: "V03" }, { node: "V00m" }] }, showIf: "V01q_done" }
      ]
    },
    /* Phase 2 */
    vosges: {
      name: "Place des Vosges", bg: "bg_vosges", enter: "X01",
      hotspots: [{ id: "musicien", label: "der Musiker", x: 38, y: 42, w: 17, h: 42, who: "musicien", actions: { parler: "X01" } }]
    },
    catacombes: {
      name: "Katakomben · Denfert-Rochereau", bg: "bg_catacombes_entree", enter: "C02",
      hotspots: [
        { id: "employee", label: "die Angestellte", x: 69, y: 34, w: 12, h: 18, who: "employee", actions: { parler: "C02" } },
        { id: "tel", label: "das Telefon", x: 73.5, y: 54, w: 7, h: 6.5, actions: { regarder: "C02c" }, showIf: "C02_done" }
      ]
    },
    repetition: { name: "Katakomben · die Probe", bg: "bg_catacombes", enter: null, hotspots: [] },
    lampes: { name: "Innenhof des Louvre · die Lampen", bg: "bg_lampes", enter: null, hotspots: [] }
  };

  /* ---------- Karte ---------- */
  G.map = {
    places: [
      { id: "montmartre", label: "Montmartre · Sacré-Cœur", short: "Montmartre", q: "Der Ausgangspunkt", x: 46, y: 13, unlock: "always", done: ["M02_done", "M04b_done"] },
      { id: "pere_lachaise", label: "Friedhof Père-Lachaise", short: "Père-Lachaise", q: "Wer kennt den Pantomimen?", x: 84, y: 27, unlock: ["M02_done", "M04b_done"], lockedMsg: { if: "M02_done", fr: "Warte. Zuerst die Kioskfrau: Vielleicht hat sie alles gesehen." }, done: ["P03_done", "P04_done", "P06_done"] },
      { id: "marais", label: "Le Marais · Noras Bäckerei", short: "Le Marais", q: "Was ist seine Show?", x: 62, y: 38, unlock: ["M02_done", "M04b_done"], lockedMsg: { if: "M02_done", fr: "Warte. Zuerst die Kioskfrau: Vielleicht hat sie alles gesehen." }, done: ["B04_done", "B05_done", "B06_done"] },
      { id: "librairie", label: "Buchhandlung „Les Mots retrouvés“", short: "Buchhandlung", q: "Die Programme ändern sich", x: 56, y: 56, unlock: "B03_open", hideUntil: "B03_open", done: ["L02_done", "L04_done"] },
      { id: "louvre", label: "Innenhof des Louvre", short: "Louvre", q: "Treffpunkt um 17 Uhr", x: 30, y: 40, unlock: "always", done: ["V03_done", "V05_done"], finale: true },
      { id: "vosges", label: "Place des Vosges", short: "Place des Vosges", q: "Spielt Marcel hier?", x: 78, y: 52, unlock: "vosges_seen", hideUntil: "vosges_seen", done: ["X01_done"] },
      { id: "catacombes", label: "Katakomben · Denfert-Rochereau", short: "Katakomben", q: "Chloés Verabredung", x: 28, y: 60, unlock: "C01_found", hideUntil: "C01_found", done: ["C02_done"] }
    ]
  };

  /* ---------- Dialogknoten ---------- */
  // Zeile: { who, fr }  (in der deutschen Fassung steht unter "fr" der deutsche Text)
  // Auswahl: { fr, kind: ok|repair|wrong, reply: [Zeilen], next, effects }
  const N = {};

  N.S02 = { type: "cut", bg: "bg_montmartre", lines: [
    { who: "narrateur", fr: "Paris, 13 Uhr. Die Klasse 10b aus Ohrdruf ist in Montmartre. Herr Nowak zählt die Schüler zum fünften Mal. Lino trägt den Klassenrucksack: Bernd, ein großes Brot mit Gesicht ... und zwar kein fröhliches. Neben ihm steht Marie, seine französische Austauschpartnerin." },
    { who: "lino", fr: "Ein Rucksack in Brotform. Sehr unauffällig." },
    { who: "marie", fr: "Hier in Montmartre ist immer viel los. Pass gut auf Bernd auf!" }
  ], next: "M00" };

  N.M00 = { type: "doc", title: "Der Rucksack Bernd", icon: "sac", doc: "Herr Nowak: „Lino, du nimmst Bernd. Da drin sind die Zugfahrkarten für die Rückfahrt. Mein roter Umschlag liegt unter den Fahrkarten: Verlier ihn nicht! Und Kevins blaue Dose ist in der Vordertasche. Mach sie nicht auf. Treffpunkt um 17 Uhr im Innenhof des Louvre!“",
    lines: [{ who: "lino", fr: "Die Fahrkarten, Kevins Dose, Nowaks Umschlag. Alles da. Noch." }],
    effects: { flag: "M00_done" }, next: "M00c" };

  N.M00c = { type: "cut", bg: "cut_confusion", lines: [
    { who: "narrateur", fr: "Gruppenfoto vor der Sacré-Cœur! Lino stellt Bernd an der Treppe ab, neben die braune Tasche eines Pantomimen. „Bitte lächeln!“ Klick. Alle schauen sich das Foto an ... Als Lino sich umdreht, rennt der Pantomime mit einer braunen Tasche zur Métro. An der Treppe steht noch eine braune Tasche. Das ist nicht Bernd." },
    { who: "lino", fr: "He! Der Clown! Mein Rucksack!" },
    { who: "marie", fr: "Warte. Erst schauen wir uns um." }
  ], effects: { item: "photo_groupe", removeItem: "sac_bernd" }, next: "SCENE_montmartre" };

  N.M01 = { type: "lines", once: "M01_seen", lines: [{ who: "marie", fr: "An der Treppe steht noch eine Tasche. Und die Kioskfrau ... vielleicht hat sie alles gesehen." }] };
  N.M01e = { type: "lines", lines: [{ who: "narrateur", fr: "Stufen, welkes Laub und Touristen. Der Pantomime ist weg." }] };

  N.M02 = { type: "doc", title: "Die braune Tasche", icon: "sac", doc: "Das ist nicht Bernd! Eine braune Tasche mit rotem Reißverschluss und gelbem Aufkleber. Darin: drei Plastik-Baguettes, ein weißer Handschuh, ein nasses Programmheft (man kann nichts lesen) ... und Papiere. Eine Karte: „Père-Lachaise, heute Morgen. Danke für die Texte, Marcel! Chloé“ Ein Kassenbon: „Bäckerei Nora · Le Marais · Tel. 01 42 72 18 90 · 2 Stück Pain perdu: 5,00 €“ Und eine zweite Karte: „Morgen, 11 Uhr: Treffen vor dem Eingang der Katakomben. Kulissen mitbringen. — Chloé, 06 12 34 56 78“",
    lines: [
      { who: "lino", fr: "Das Brot hat Nachwuchs bekommen. Das ist kein gutes Zeichen." },
      { who: "marie", fr: "Baguettes, ein weißer Handschuh ... Das ist die Tasche des Pantomimen. Und seine Papiere sind so etwas wie sein Terminkalender." }
    ],
    effects: { items: ["sac_mime", "carte_chloe", "ticket", "carte_demain"], flags: ["C01_found", "M02_done"] },
    next: "SCENE_montmartre" };

  N.M03 = { type: "choice", who: "kiosque", diag: "D_M03", help: "M03", helpAfter: 2,
    lines: [{ who: "kiosque", fr: "Hallo, ihr jungen Leute. Ihr seht ganz verloren aus." }],
    choices: [
      { fr: "Haben Sie diesen Mann gesehen?", kind: "ok", reply: [{ who: "kiosque", fr: "Den Pantomimen? Den kenne ich! Er kauft hier jeden Tag seine Zeitung und erzählt mir seinen ganzen Tag. Für einen Pantomimen redet er ganz schön viel!" }], next: "M03a" },
      { fr: "Suchen Sie diesen Mann?", kind: "wrong", reply: [{ who: "kiosque", fr: "Ich? Nein. Sucht ihr ihn etwa?" }], next: "M03" },
      { fr: "Werden Sie diesen Mann treffen?", kind: "wrong", reply: [{ who: "kiosque", fr: "Später? Keine Ahnung. Wollt ihr wissen, ob ich ihn gesehen habe?" }], next: "M03" }
    ] };
  /* Foto gezeigt statt gefragt: dieselbe Einleitung, dann der Lesetext */
  N.M03p = { type: "lines", lines: [{ who: "kiosque", fr: "Der Pantomime auf eurem Foto? Den kenne ich! Er kauft hier jeden Tag seine Zeitung und erzählt mir seinen ganzen Tag. Für einen Pantomimen redet er ganz schön viel!" }], next: "M03a" };
  N.M03r = { type: "lines", lines: [{ who: "kiosque", fr: "Wegen heute Abend fragt Nora, die Bäckerin im Marais. Sie kennt ihn besser als ich." }] };

  N.M03a = { type: "audio", audio: "au_kiosque", transcriptHelp: "M04", effects: { flag: "M03_done" }, next: "M04" };

  N.M04 = { type: "task", diag: "D_M04", help: "M04", perPlayer: true, audio: "au_kiosque", title: "Die Zeugin am Kiosk",
    task: { kind: "sort", intro: "Wo war der Pantomime? Wohin geht er? Wähle für jede Tageszeit.",
      slots: [{ id: "matin", label: "heute Morgen", answer: "pl" }, { id: "apres", label: "heute Nachmittag", answer: "marais" }, { id: "soir", label: "heute Abend", answer: "nsp" }],
      options: [{ id: "pl", label: "Père-Lachaise" }, { id: "marais", label: "Le Marais" }, { id: "louvre", label: "der Louvre" }, { id: "montmartre", label: "Montmartre" }, { id: "nsp", label: "weiß man nicht" }],
      wrong: { who: "marie", fr: "Lies noch mal genau. Sie spricht von drei Tageszeiten." } },
    next: "M04b" };

  N.M04b = { type: "task", diag: "D_M04b", help: "M04b", audio: "au_kiosque", title: "Zeugenbericht",
    task: { kind: "gap", intro: "Was hat die Kioskfrau gesagt? Wähle das Richtige.",
      parts: ["Der Mann trug ", { id: "g1", opts: ["einen gestreiften Pullover", "einen roten Mantel"], answer: "einen gestreiften Pullover" }, ". Während wir ", { id: "g2", opts: ["das Foto anschauten", "ein Eis aßen"], answer: "das Foto anschauten" }, ", hat er ", { id: "g3", opts: ["die Tasche am Kiosk", "die Tasche an der Treppe"], answer: "die Tasche an der Treppe" }, " genommen. Dann ist er ", { id: "g4", opts: ["in die Kirche", "zur Métro"], answer: "zur Métro" }, " gegangen."],
      wrong: { who: "marie", fr: "Lies noch mal genau. Was hat sie wirklich gesagt?" } },
    effects: { flag: "M04b_done" },
    next: "M05" };

  N.M05 = { type: "lines", lines: [
    { who: "marie", fr: "Also fangen wir mit den Hinweisen an. Père-Lachaise oder das Marais?" },
    { who: "lino", fr: "Paris ist groß. Mein Problem auch." }
  ], next: "MAP" };

  N.M06 = { type: "lines", diag: "D_M06", count: true, lines: [
    { who: "narrateur", fr: "An der Métro gibt es drei Linien und sehr viele Leute. Kein Pantomime." },
    { who: "marie", fr: "Es gibt mehrere Richtungen. Wer kann uns helfen?" }
  ] };

  /* Père-Lachaise */
  N.P01 = { type: "lines", once: "P01_seen", lines: [
    { who: "marie", fr: "Ein Friedhof, Bäume, ein Wärter und ein Hund." },
    { who: "lino", fr: "Und ein Ball. Der Hund guckt nur auf den Ball." }
  ] };
  N.P01g = { type: "lines", lines: [{ who: "narrateur", fr: "Gaston, ein Labrador. Er schaut auf einen Ball unter der Bank. Nur auf den Ball." }] };
  N.P01p = { type: "lines", lines: [{ who: "marie", fr: "Ein Plan vom Friedhof. Viele Wege. Wir wissen noch nicht, wo Chloé ist. Fragen wir den Wärter." }] };
  N.P01x = { type: "lines", lines: [{ who: "marie", fr: "Wir wissen noch nicht, wo Chloé ist. Fragen wir den Wärter." }] };

  N.P02 = { type: "choice", who: "gardien", diag: "D_P02", help: "P02", firstOnly: true,
    lines: [{ who: "gardien", fr: "Guten Tag. Sucht ihr ein Grab? Jim Morrison ist da lang. Alle suchen Jim Morrison." }],
    choices: [
      { fr: "Nein, wir suchen einen Mann. Haben Sie diesen Pantomimen gesehen?", hint: "(zeigt das Gruppenfoto)", kind: "ok", next: "P02m" },
      { fr: "Ja, Jim Morrison, bitte.", kind: "repair", reply: [{ who: "gardien", fr: "Geradeaus, dann rechts. Viel Spaß!" }, { who: "lino", fr: "Marie, wir suchen nicht Jim Morrison." }], next: "P02" },
      { fr: "Kennen Sie Chloé?", kind: "repair", reply: [{ who: "gardien", fr: "Chloé? Ja, die ist da hinten mit ihrer Theatergruppe. Warum?" }], next: "P02" }
    ] };
  /* Der Wärter kennt Marcel: Vorspann vor dem Lesetext */
  N.P02m = { type: "lines", lines: [{ who: "gardien", fr: "Ach, der! Der kommt oft, mit seiner Theatergruppe: Sie machen literarische Spaziergänge zwischen den Gräbern. Und seine Freundin Chloé fotografiert alles. Wirklich alles!" }], next: "P03" };
  N.P02r = { type: "lines", lines: [{ who: "gardien", fr: "Marcel Blanchard. Geradeaus, dann links." }] };

  N.P03 = { type: "audio", audio: "au_gardien", transcriptHelp: "P04", effects: { flags: ["P02_done", "P03_done"] }, next: "P03a" };
  N.P03a = { type: "lines", lines: [{ who: "marie", fr: "Der Wärter redet schnell. Zum Glück gibt es am Eingang einen Plan." }], next: "SCENE_pere_lachaise" };

  N.P04 = { type: "task", diag: "D_P04", help: "P04", audio: "au_gardien", title: "Der Plan: welcher Weg?",
    task: { kind: "route", intro: "Klicke Schritt für Schritt auf Chloés Weg.",
      steps: [
        { id: "s1", prompt: "Vom Eingang aus ...", opts: [{ id: "droit", label: "geradeaus", ok: true }, { id: "descend", label: "der Weg bergab", ok: false, reply: "Nein, nicht da lang! Der führt bergab zum anderen Ausgang." }] },
        { id: "s2", prompt: "An der Kreuzung ...", opts: [{ id: "gauche", label: "links", ok: true }, { id: "droite", label: "rechts", ok: false, reply: "Nein! Rechts geht's zu Jim Morrison. Schon wieder der!" }] }
      ],
      who: "gardien" },
    effects: { flag: "P04_done" },
    after: [{ who: "marie", fr: "Die rote Bank! Da sitzt jemand." }],
    next: "P05" };

  N.P05 = { type: "choice", who: "chloe", diag: "D_P05", count: true,
    lines: [{ who: "chloe", fr: "Hallo! Habt ihr euch verlaufen? Jim Morrison ist auf der anderen Seite." }],
    choices: [
      { fr: "Nein. Marcel hat in Montmartre unseren Rucksack genommen.", kind: "ok", reply: [{ who: "chloe", fr: "Marcel? Euren Rucksack? Das wundert mich. Marcel nimmt nie etwas, nicht mal das letzte Croissant! Hier, das ist er heute Morgen, mit mir." }], next: "P06" },
      { fr: "Wir suchen Marcel. War er heute Morgen hier?", kind: "ok", reply: [{ who: "chloe", fr: "Ja! Er hat die Texte für unseren literarischen Spaziergang gebracht. Hier, ich habe ein Foto von uns beiden gemacht." }], next: "P06" },
      { fr: "Marcel hat heute Morgen in Montmartre unseren Rucksack gestohlen.", kind: "wrong", reply: [{ who: "chloe", fr: "Heute Morgen? Unmöglich: Heute Morgen war er hier, bei mir. Und „gestohlen“ ... seid ihr sicher?" }], next: "P05" },
      { fr: "Haben Sie den Rucksack Bernd?", kind: "repair", reply: [{ who: "chloe", fr: "Ein Rucksack, der Bernd heißt? Äh ... nein. Was sucht ihr denn genau?" }], next: "P05" }
    ],
    effects: { item: "photo_chloe", flag: "P05_done" } };

  N.P06 = { type: "task", diag: "D_P06", help: "P06", title: "Vergleichen: das Foto und die Tasche",
    task: { kind: "pick", img: "doc_photo_chloe", intro: "Foto von heute Morgen: Chloé und Marcel Blanchard. Schau dir seine Tasche genau an ... und die braune Tasche in unserem Inventar.", question: "Welche zwei Details sind auf dem Foto und an der Tasche gleich?", n: 2,
      options: [{ id: "fr", label: "der rote Reißverschluss", ok: true }, { id: "aj", label: "der gelbe Aufkleber", ok: true }, { id: "fb", label: "der blaue Reißverschluss", ok: false }, { id: "av", label: "der grüne Aufkleber", ok: false }, { id: "vp", label: "das Brotgesicht", ok: false }],
      wrong: { who: "marie", fr: "Schau dir die Tasche auf dem Foto genau an. Was siehst du?" } },
    effects: { flag: "P06_done" },
    after: [
      { who: "marie", fr: "Also gehört die braune Tasche ihm. Und Bernd? Hat er ihn ... aus Versehen genommen?" },
      { who: "lino", fr: "Oder er ist ein sehr gut organisierter Dieb." }
    ],
    next: "P06c" };
  N.P06c = { type: "choice", who: "chloe", noDiag: true,
    lines: [{ who: "chloe", fr: "Morgen proben wir in den Katakomben. Willst du hören, was wir proben?" }],
    choices: [
      { fr: "Ja, gern!", kind: "ok", next: "C03s" },
      { fr: "Später, danke. Wir suchen unseren Rucksack.", kind: "ok", reply: [{ who: "chloe", fr: "Okay. Viel Glück!" }], next: "END" }
    ] };

  /* Marais */
  N.B01 = { type: "lines", once: "B01_seen", lines: [
    { who: "narrateur", fr: "Auf dem Schild: „Heute: Pain perdu“" },
    { who: "lino", fr: "„Pain perdu“ heißt „verlorenes Brot“. Endlich ein Laden, der mein Problem verkauft." },
    { who: "marie", fr: "Pain perdu ist ein Nachtisch, Lino. Bei euch heißt das Arme Ritter." }
  ] };
  N.B01p = { type: "doc", title: "Das Schild", icon: "panneau", doc: "Heute: Pain perdu — 2,50 € pro Stück", lines: [{ who: "marie", fr: "Ein Nachtisch: Brot, Milch, Eier, Zucker." }] };
  N.B01a = { type: "doc", title: "Der Flyer", icon: "flyer", diag: "D_B01", count: true, doc: "Marcel — Le Pain perdu — Pantomime-Show — heute Abend in Paris", effects: { item: "flyer", flag: "B01a_done" }, lines: [{ who: "lino", fr: "Marcel. Wie auf Chloés Karte." }] };

  N.B01l = { type: "lines", lines: [{ who: "marie", fr: "Eine Buchhandlung. Wir suchen einen Rucksack, kein Buch." }] };

  N.B02 = { type: "choice", who: "nora", diag: "D_B02", help: "B02", firstOnly: true,
    lines: [{ who: "nora", fr: "Guten Tag! Was darf's sein?" }],
    choices: [
      { fr: "Ich hätte gern Pain perdu.", kind: "repair", reply: [{ who: "nora", fr: "Sehr gern! Ein Stück oder zwei?" }, { who: "nora", fr: "Bitte schön. Sonst noch etwas?" }, { who: "marie", fr: "Lino, wir suchen keinen Nachtisch." }], effects: { item: "pain_perdu" }, next: "B02" },
      { fr: "Ich suche einen Rucksack, der aussieht wie ein Brot.", kind: "ok", reply: [{ who: "nora", fr: "Einen Rucksack ... wie ein Brot? Normalerweise kommt das Brot in die Tasche!" }], next: "B02b" },
      { fr: "Ich suche die Show, die „Le Pain perdu“ heißt.", kind: "ok", reply: [{ who: "nora", fr: "„Le Pain perdu“? Das ist die Show von Marcel, einem Kunden. Wo er heute Abend spielt? Keine Ahnung, sein Programm ändert sich ständig. Aber warum sucht ihr Marcel?" }, { who: "marie", fr: "Er hat unseren Rucksack. Also ... glauben wir." }], next: "B02b" }
    ] };
  N.B02t = { type: "lines", lines: [{ who: "nora", fr: "Ein Kassenbon von mir! Zwei Stück Pain perdu ... das ist Marcel: Der nimmt jeden Tag zwei. Warum habt ihr seinen Kassenbon?" }, { who: "marie", fr: "Er war in einer Tasche. Nicht in unserem Rucksack. Das ist kompliziert." }], next: "B02b" };
  N.B02r = { type: "lines", lines: [{ who: "nora", fr: "Marcels Nachricht? Die ist noch auf meinem Telefon." }] };

  N.B02b = { type: "choice", who: "nora", diag: "D_B02b", count: true,
    lines: [{ who: "nora", fr: "Und wie sieht euer Rucksack aus?" }],
    choices: [
      { fr: "Braun, groß, mit einem Brotgesicht.", kind: "ok", reply: [{ who: "nora", fr: "Ein Rucksack mit Gesicht? Moment ... Marcel hat mir gegen 14 Uhr eine Nachricht aufs Telefon gesprochen. Er klang besorgt, und er redet von einer Tasche. Hier, lest mal mit." }], next: "B03" },
      { fr: "Braun, mit rotem Reißverschluss und gelbem Aufkleber.", kind: "wrong", reply: [{ who: "nora", fr: "Roter Reißverschluss, gelber Aufkleber? Das ist doch Marcels Tasche! Die habt ihr in der Hand!" }, { who: "marie", fr: "Sie hat recht, Lino. Das ist die Tasche des Pantomimen. Wir suchen Bernd." }], next: "B02b" }
    ] };

  N.B03 = { type: "audio", audio: "au_marcel", transcriptHelp: "B04", effects: { flag: "B03_open" }, next: "B04" };

  N.B04 = { type: "task", diag: "D_B04", help: "B04", audio: "au_marcel", title: "Was ist sicher?",
    task: { kind: "pick", intro: "Marcel sagt viele Dinge. Drei Sätze sind sicher.", question: "Wähle die drei sicheren Sätze.", n: 3,
      options: [
        { id: "a", label: "Marcel hat Sachen gefunden, die ihm nicht gehören.", ok: true },
        { id: "b", label: "Marcel will die Tasche behalten.", ok: false },
        { id: "c", label: "Er glaubt, dass er die falsche Tasche genommen hat.", ok: true },
        { id: "d", label: "Die Show ist abgesagt.", ok: false },
        { id: "e", label: "Das Programm seiner Show hat sich geändert.", ok: true },
        { id: "f", label: "Marcel ist noch in der Bäckerei.", ok: false }
      ],
      wrong: { who: "marie", fr: "Lies noch mal genau. Was sagt er wirklich?" } },
    effects: { flag: "B04_done" },
    after: [
      { who: "marie", fr: "Also ... kein Dieb? Ein Irrtum?" },
      { who: "lino", fr: "Schade. Ich mochte meine Diebesgeschichte." }
    ],
    next: "B05" };

  N.B05 = { type: "doc", title: "Kevins SMS", icon: "sms", doc: "Lino!!! Hast du Bernd gefunden??? Meine blaue Dose ist in der Vordertasche!!! Mit meinem Namen drauf: KEVIN, mit K. Da drin ist meine Zahnspange. Ohne die kann ich kein Baguette essen. Finde den Rucksack!!!",
    lines: [{ who: "narrateur", fr: "Linos Handy vibriert." }, { who: "lino", fr: "Kevin und seine Zahnspange. Ganz Frankreich wartet." }],
    effects: { flag: "B05_done" }, next: "B06" };

  N.B06 = { type: "task", diag: "D_B06", help: "B06", title: "Nachricht an Herrn Nowak",
    task: { kind: "write", intro: "Schreib Herrn Nowak: Was ist passiert? Wohin geht ihr? (mindestens 25 Wörter)", min: 25,
      starters: ["Der Pantomime hatte...", "Er hat aus Versehen...", "Wir gehen jetzt zu..."],
      model: "Der Pantomime hatte eine braune Tasche, genau wie wir. Er hat unseren Rucksack aus Versehen genommen und unsere Sachen gefunden. Wir gehen jetzt zur Buchhandlung „Les Mots retrouvés“, um seine Nachricht zu lesen. Marie ist bei mir." },
    effects: { flag: "B06_done" },
    after: [{ who: "nowak", fr: "Danke, Lino. 17 Uhr am Louvre, vergesst das nicht! Ich zähle ... noch mal." }],
    next: "SCENE_marais" };

  /* Buchhandlung */
  N.L01 = { type: "lines", once: "L01_seen", lines: [
    { who: "lenoir", fr: "Vorsicht, die Leiter! Die Bücher bleiben. Die Programme ändern sich." },
    { who: "lino", fr: "Eine zu große Leiter für ein zu kleines Regal. Ich mag diesen Mann." }
  ] };

  /* Abfrage vor den Aushängen: Lenoir will wissen, welcher Marcel gemeint ist (Nachname nur vom Wärter) */
  N.L02q = { type: "task", diag: "D_L02q", help: "L02q", title: "Herr Lenoir",
    task: { kind: "recall", who: "lenoir", intro: "Die Pinnwand von „Le Pain perdu“? Achtung: Zwei Marcels spielen diese Show, und ich habe drei Aushänge. Euer Marcel – wie heißt er weiter?",
      fields: [
        { id: "nom", label: "Der Nachname eures Marcel:", answers: ["Blanchard", "Marcel Blanchard"], size: 18, where: "Der Wärter auf dem Père-Lachaise kennt seinen Namen.",
          traps: [{ answers: ["Duval", "Marcel Duval"], who: "lenoir", fr: "Duval? Seid ihr sicher? Wer hat euch diesen Namen gesagt?" }] }
      ],
      wrongText: "Marcel wie? Den Namen kenne ich nicht.", success: { who: "lenoir", fr: "Marcel Blanchard. Gut. Hier sind die drei Aushänge: Nur einer ist der richtige." },
      leaveLines: [{ who: "lenoir", fr: "Kommt wieder, wenn ihr es wisst. Die Bücher bleiben." }] },
    effects: { flag: "L02q_done" },
    next: "L02" };

  N.L02 = { type: "task", diag: "D_L02", help: "L02", title: "Die Pinnwand: drei Aushänge",
    task: { kind: "poster", intro: "Welches Programm ist das richtige?",
      posters: [
        { id: "A", text: "Marcel Blanchard — Le Pain perdu — heute, 17 Uhr — Place des Vosges. Erste Fassung.", ok: false, reply: { who: "lenoir", fr: "Die erste Fassung? Die ist so alt wie meine Bücher. Die Programme ändern sich, sag ich doch!" }, flag: "vosges_seen" },
        { id: "B", text: "Marcel Duval — Le Pain perdu — heute, 17 Uhr — Hof der Buchhandlung. Korrigierte Fassung.", ok: false, reply: { who: "lenoir", fr: "Duval? Aber ihr sucht doch Blanchard, oder?" } },
        { id: "C", text: "Marcel Blanchard — Le Pain perdu — heute, 17 Uhr — Innenhof des Louvre. Korrigierte Fassung. Dieses Programm ersetzt das alte Programm.", ok: true }
      ],
      success: { who: "lenoir", fr: "Gut gelesen! Die Bücher bleiben, die Programme ändern sich." } },
    effects: { flags: ["L02_C", "L02_done"] },
    after: [{ who: "lino", fr: "Louvre, 17 Uhr? Wie Nowaks Treffpunkt. Paris ist klein." }],
    next: "L04" };
  N.L02r = { type: "doc", title: "Die Pinnwand: drei Aushänge", icon: "flyer",
    docs: [
      { label: "A", text: "Marcel Blanchard — Le Pain perdu — heute, 17 Uhr — Place des Vosges. Erste Fassung." },
      { label: "B", text: "Marcel Duval — Le Pain perdu — heute, 17 Uhr — Hof der Buchhandlung. Korrigierte Fassung." },
      { label: "C", text: "Marcel Blanchard — Le Pain perdu — heute, 17 Uhr — Innenhof des Louvre. Korrigierte Fassung. Dieses Programm ersetzt das alte Programm." }
    ],
    lines: [{ who: "lenoir", fr: "Die Bücher bleiben. Die Programme ändern sich." }] };

  N.L03 = { type: "choice", who: "lenoir", noDiag: true, stay: true,
    lines: [{ who: "lenoir", fr: "Sucht ihr ein Buch? Oder ein Programm?" }],
    choices: [
      { fr: "Warum gibt es zwei Marcels?", kind: "ok", reply: [{ who: "lenoir", fr: "„Le Pain perdu“ ist die Show der Theatergruppe. Zwei Marcels spielen sie, an zwei Orten. Zwei Marcels, drei Aushänge ... und ich habe nur eine Pinnwand." }], next: "L03" },
      { fr: "Hat sich das Programm geändert?", kind: "ok", reply: [{ who: "lenoir", fr: "Ja, heute schon zweimal. Die Bücher bleiben, die Programme ändern sich." }], next: "L03" },
      { fr: "Haben Sie eine Nachricht für uns?", kind: "ok", reply: [{ who: "lenoir", fr: "Eine Nachricht? Ich bekomme viele Nachrichten. Für wen? Sagt mir erst, welchen Marcel ihr sucht." }], next: "END", unless: "L04_done", replyIf: [{ who: "lenoir", fr: "Ja! Marcel hat eine Karte für euch dagelassen. Sie hängt an der Tür." }] },
      { fr: "Danke, auf Wiedersehen.", kind: "ok", next: "END" }
    ] };

  N.L04 = { type: "task", diag: "D_L04", help: "L04", title: "Der richtige Stempel",
    task: { kind: "stamp", intro: "Könnt ihr mir helfen? Ich mache einen Aushang für die Tür. Dafür brauche ich den richtigen Stempel. Blanchards Show ist nicht mehr auf der Place des Vosges, sie ist jetzt am Louvre.", who: "lenoir",
      stamps: [{ id: "ancien", label: "ALTES PROGRAMM" }, { id: "modif", label: "ÄNDERUNG" }, { id: "annule", label: "ABGESAGT" }],
      sheets: [
        { id: "C", label: "Kopie von Aushang C", text: "Marcel Blanchard — 17 Uhr — Innenhof des Louvre. Korrigierte Fassung." },
        { id: "A", label: "Kopie von Aushang A", text: "Marcel Blanchard — 17 Uhr — Place des Vosges. Erste Fassung." }
      ],
      goal: { sheet: "C", stamp: "modif" },
      bonus: { sheet: "A", stamp: "ancien" },
      replies: {
        "annule": "Die Show findet statt. Nur der Ort hat sich geändert.",
        "C:ancien": "Nein, das ist doch das neue Programm!",
        "A:modif": "Hm. Die Place des Vosges ist der alte Ort."
      } },
    effects: { flag: "L04_done" },
    after: [{ who: "lenoir", fr: "Perfekt, danke! Ach, fast hätte ich es vergessen: Marcel war vorhin hier. Er hat eine Karte für euch dagelassen, an der Tür." }],
    next: "L05" };
  N.L04x = { type: "lines", lines: [{ who: "narrateur", fr: "Bücher, Stempel, eine Tasse kalter Kaffee. Nichts über Marcel." }] };
  N.L04r = { type: "lines", lines: [{ who: "lenoir", fr: "Der Aushang hängt an der Tür. Danke noch mal!" }] };

  N.L05 = { type: "doc", title: "Marcels Karte", icon: "carte", doc: "An die jungen Leute, die meine braune Tasche haben: Ich habe in Montmartre die falsche Tasche genommen. Es tut mir leid! Ich dachte, es wäre meine. Euer Rucksack ist bei mir, und alles ist noch drin. Um 17 Uhr bin ich bei meiner Show: Fragt nach Marcel. Aber Achtung: Damit ich sicher bin, dass ihr es seid, frage ich euch, was in eurem Rucksack ist, und wo. — Marcel",
    effects: { item: "carte_marcel", flag: "L05_done", mission: "Um den Rucksack zu bekommen: Marcel sagen, was in unserem Rucksack ist, und wo." },
    lines: [
      { who: "marie", fr: "Er will wissen, was in unserem Rucksack ist, und wo. Weißt du noch alles?" },
      { who: "lino", fr: "Eine normale Tür. Ein normaler Stempel. Dieser Mann ist gefährlich." }
    ] };

  /* Louvre */
  N.V00 = { type: "lines", once: "V00_seen", lines: [{ who: "narrateur", fr: "Der Innenhof des Louvre. Eine kleine Bühne, Lampen, Publikum." }] };
  N.V00s = { type: "lines", lines: [{ who: "narrateur", fr: "Eine kleine Bühne mit einer Mona Lisa aus Pappe." }, { who: "lino", fr: "Sogar die Mona Lisa ist hier eine Kopie." }] };
  N.V00m = { type: "lines", lines: [{ who: "marie", fr: "Reden wir zuerst mit der Assistentin." }] };

  N.V01 = { type: "choice", who: "assistante", noDiag: true,
    lines: [{ who: "assistante", fr: "Guten Abend! Heute Abend treten fünf Künstler hier im Hof auf, und ich habe nur ein einziges Headset. Welche Show sucht ihr? Um wie viel Uhr?" }],
    choices: [
      { fr: "„Le Pain perdu“, um 17 Uhr.", kind: "ok", reply: [{ who: "assistante", fr: "„Le Pain perdu“? Davon gibt es heute Abend zwei, mit zwei Marcels! Und das Programm hat sich schon wieder geändert. Hier gilt nur das korrigierte Programm. Kommt wieder, wenn ihr es gelesen habt." }, { who: "lino", fr: "Zwei Marcels, drei Pantomimen, fünf Künstler. Und ein einziger Rucksack." }], next: "MAP" },
      { fr: "Wir suchen einen Pantomimen mit unserem Rucksack.", kind: "ok", reply: [{ who: "assistante", fr: "Einen Pantomimen? Heute Abend gibt es drei Pantomimen! Kommt mit einem vollständigen Namen und einer Uhrzeit wieder." }, { who: "lino", fr: "Zwei Marcels, drei Pantomimen, fünf Künstler. Und ein einziger Rucksack." }], next: "MAP" }
    ] };

  N.V01q = { type: "task", diag: "D_V01q", help: "V01q", title: "Die Assistentin",
    task: { kind: "recall", who: "assistante", intro: "Heute Abend gibt es zweimal „Le Pain perdu“, mit zwei Marcels. Welchen sucht ihr? Und um wie viel Uhr ist die Show?",
      fields: [
        { id: "nom", label: "Der vollständige Name des Künstlers:", answers: ["Marcel Blanchard", "Blanchard"], size: 20, where: "Der vollständige Name steht auf Aushang C in der Buchhandlung.",
          traps: [{ answers: ["Duval", "Marcel Duval"], who: "assistante", fr: "Marcel Duval? Der spielt im Hof der Buchhandlung. Nicht hier." }] },
        { id: "heure", label: "Die Uhrzeit der Show:", answers: ["17 Uhr", "17", "17 h", "17:00", "17.00", "siebzehn Uhr", "um 17 Uhr", "um siebzehn Uhr", "um 17"], number: 17, size: 12, where: "Die Uhrzeit steht auf Aushang C in der Buchhandlung." }
      ],
      wrongText: "Nein, das habe ich nicht auf meiner Liste.", success: { who: "assistante", fr: "Marcel Blanchard, 17 Uhr, Innenhof des Louvre. Das ist hier! Er beendet gerade seine Nummer." },
      leaveLines: [{ who: "assistante", fr: "Kommt mit dem richtigen Namen und der richtigen Uhrzeit wieder." }] },
    effects: { flag: "V01q_done" },
    next: "V02" };

  N.V02 = { type: "lines", lines: [
    { who: "assistante", fr: "Und diese braune Tasche ... das ist Marcels Tasche! Dann seid ihr die jungen Leute aus Montmartre. Marcel wartet nach seiner Nummer auf euch. Zwei Minuten. Na ja, zwei Pantomimen-Minuten: Das kann dauern." },
    { who: "narrateur", fr: "Marcel beendet seine Nummer: eine unsichtbare Wand, eine unsichtbare Tür ... und ein Rucksack in Brotform, sehr sichtbar. Das Publikum liebt Bernd." }
  ], effects: { flag: "V02_done" }, next: "V02c" };
  N.V02c = { type: "choice", who: "assistante", noDiag: true,
    lines: [{ who: "assistante", fr: "Kannst du mir in der Zwischenzeit kurz helfen? Es geht um den Schatten auf der Leinwand." }],
    choices: [
      { fr: "Ja, klar.", kind: "ok", next: "V02bs" },
      { fr: "Nein, wir warten auf Marcel.", kind: "ok", reply: [{ who: "assistante", fr: "Kein Problem. Er kommt gleich." }], next: "V03" }
    ] };

  N.V03 = { type: "convo", who: "marcel", diag: "D_V03", help: "V03", title: "Das Finale",
    steps: [
      { id: "s1", lines: [{ who: "marcel", fr: "Guten Abend. Sucht ihr ... etwas? Ein Brot mit Gesicht vielleicht?" }],
        choices: [
          { fr: "Entschuldigung, ich glaube, wir haben unsere Taschen vertauscht.", kind: "ok" },
          { fr: "Entschuldigung, Sie haben unseren Rucksack.", kind: "ok" },
          { fr: "Geben Sie mir meinen Rucksack zurück, Sie Dieb!", kind: "wrong", reply: [{ who: "marcel", fr: "Dieb? Ich?" }, { who: "marie", fr: "Lino! Wir haben Beweise: Es war ein Irrtum." }], flag: "V03_voleur" },
          { fr: "Guten Abend, Ihre Show hat mir gefallen.", kind: "repair", reply: [{ who: "marcel", fr: "Danke! Aber ... wolltet ihr noch etwas anderes?" }] }
        ], after: [{ who: "marcel", fr: "Unsere Taschen? Ah ... Erzählt mal." }] },
      { id: "s2", lines: [],
        choices: [
          { fr: "Während wir das Foto angeschaut haben, haben Sie die Tasche an der Treppe genommen. Das ist unser Rucksack.", kind: "ok" },
          { fr: "In Montmartre haben Sie unseren Rucksack genommen.", kind: "ok" },
          { fr: "In Montmartre haben Sie unseren Rucksack genommen, während wir Eis gegessen haben.", kind: "wrong", reply: [{ who: "marcel", fr: "Eis? Davon weiß ich nichts ..." }, { who: "marie", fr: "Lino, wir haben das Foto angeschaut! Bleib bei den Tatsachen." }] },
          { fr: "Sie haben in Montmartre unseren Rucksack gestohlen.", kind: "wrong", reply: [{ who: "marcel", fr: "Gestohlen? Nein!" }, { who: "marie", fr: "Lino ..." }] }
        ], after: [{ who: "marcel", fr: "Die Tasche an der Treppe, ja! Es tut mir leid. Aber heute Abend war euer Rucksack auf der Bühne: Alle haben ihn gesehen! Also, damit ich sicher bin, dass ihr es seid ... Was ist drin? Und wo?" }] }
    ],
    effects: { flag: "V03_talked" },
    next: "V03q" };

  /* Abfrage: der Inhalt des Rucksacks (aus M00 und Kevins SMS), getippt */
  N.V03q = { type: "task", diag: "D_V03q", help: "V03q", title: "Das Finale: unser Rucksack",
    task: { kind: "recall", who: "marcel", intro: "Was ist in eurem Rucksack? Und wo?",
      parts: ["In der ", { id: "g1", answers: ["Vordertasche", "vorderen Tasche", "Tasche vorne", "Tasche vorn", "Fronttasche", "Vordertasche vom Rucksack"], size: 12, where: "Kevin hat eine SMS geschrieben: Sie ist auf deinem Handy." }, " ist eine ", { id: "g2", answers: ["blaue", "blau", "blauen"], size: 8, where: "Kevin hat eine SMS geschrieben: Sie ist auf deinem Handy." }, " Dose. Darauf steht der Name ", { id: "g3", answers: ["Kevin"], size: 8, where: "Kevin hat eine SMS geschrieben: Sie ist auf deinem Handy.", traps: [{ answers: ["Marcel", "Lino", "Bernd"], who: "marcel", fr: "Dieser Name? Auf eurer Dose? Hm, nein." }] }, ". Der ", { id: "g4", answers: ["rote", "rot", "roter"], size: 8, where: "Herr Nowak weiß, wo sein Umschlag ist: Schreib ihm." }, " Umschlag liegt unter den ", { id: "g5", answers: ["Fahrkarten", "Zugfahrkarten", "Tickets", "Zugtickets", "Bahntickets", "Fahrscheinen", "Fahrscheine", "Bahnfahrkarten", "Zugkarten", "Karten", "Fahrkarten für den Zug"], size: 12, where: "Herr Nowak weiß, wo sein Umschlag ist: Schreib ihm.", traps: [{ answers: ["Baguettes", "Baguette", "Plastik-Baguettes", "Plastikbaguettes", "drei Baguettes", "Plastikbaguette"], who: "marcel", fr: "Plastik-Baguettes? Das ist meine Tasche!" }] }, "."],
      wrongText: "Hm, nein. Das stimmt nicht. Seid ihr sicher, dass das euer Rucksack ist?",
      success: { who: "marcel", fr: "Genau. Hier ist euer Rucksack. Und es tut mir leid!" },
      leaveLines: [{ who: "marcel", fr: "Denkt nach. Ich bin hier." }] },
    effects: { flags: ["V03_done", "V03q_done"], removeItem: "sac_mime", item: "sac_bernd" },
    after: [
      { who: "lino", fr: "Hier ist Ihre Tasche. Tauschen wir?" },
      { who: "narrateur", fr: "Marcel sucht lange nach einem unsichtbaren Reißverschluss ... an einer echten Tasche." },
      { who: "lino", fr: "Zu viele unsichtbare Taschen. Das hinterlässt Spuren." }
    ],
    next: "V04" };
  N.V03r = { type: "lines", lines: [{ who: "marcel", fr: "Danke noch mal, und einen schönen Abend!" }] };

  N.V04 = { type: "cut", bg: "cut_final", lines: [
    { who: "marcel", fr: "Eine braune Tasche, ein Rucksack in Brotform ... Für einen Pantomimen ist das fast dasselbe!" },
    { who: "lino", fr: "Für Sie vielleicht. Bernd sieht das anders." },
    { who: "narrateur", fr: "Herr Nowak kommt mit der Klasse. Kevin öffnet seine blaue Dose. Herr Nowak öffnet seinen roten Umschlag: „Plan B: Ruhe bewahren und noch mal zählen.“ Er zählt: 31 ... 32. Er sieht Bernd an." },
    { who: "lino", fr: "Er zählt nicht. Er urteilt." },
    { who: "lino", fr: "Notiz an mich: nicht „Dieb“ rufen ohne Beweise.", onlyIf: "V03_voleur" }
  ], next: "V05" };

  N.V05 = { type: "task", diag: "D_V05", help: "V05", perPlayer: true, title: "Abschlussbericht",
    task: { kind: "write", intro: "Erzähl den Fall in 6 bis 8 Sätzen: Wo wart ihr? Was hat der Pantomime gemacht? Welcher Hinweis hat eure Meinung geändert? Wie habt ihr den Rucksack zurückbekommen?", min: 50,
      starters: ["Wir waren in Montmartre.", "Lino hatte...", "Während wir..., hat der Pantomime...", "Auf dem Père-Lachaise haben wir erfahren...", "Marcel hatte schon...", "Er dachte, dass...", "Am Ende haben wir..."],
      model: "Wir waren in Montmartre für ein Foto. Lino hatte den Rucksack Bernd. Während wir das Foto angeschaut haben, hat der Pantomime unseren Rucksack genommen. Auf dem Père-Lachaise haben wir seinen Namen erfahren: Marcel Blanchard. Auf einem Foto hatte Marcel schon seine braune Tasche. Es war also kein Diebstahl. Er dachte, unser Rucksack wäre seine Tasche. In der Buchhandlung haben wir das richtige Programm gefunden. Am Ende haben wir am Louvre die Taschen getauscht." },
    effects: { flag: "V05_done" },
    next: "V06" };

  N.V06 = { type: "end" };

  /* ---------- Phase 2 ---------- */
  N.P07 = { type: "choice", who: "gardien", diag: "D_P07", count: true,
    lines: [{ who: "gardien", fr: "Könnt ihr Gaston helfen? Gebt ihm den Ball, der unter der Bank liegt, nicht den Ball in meinem Korb." }],
    choices: [
      { fr: "Den Ball unter der Bank geben.", kind: "ok", reply: [
        { who: "narrateur", fr: "Gaston nimmt den Ball und setzt sich ... genau vor die Kamera." },
        { who: "lino", fr: "Sehr professionell. Man sieht nichts mehr." }], next: "END" },
      { fr: "Den Ball aus dem Korb geben.", kind: "wrong", reply: [{ who: "gardien", fr: "Nein, nicht diesen Ball! Der ist für morgen." }], next: "P07" }
    ],
    effects: { flag: "P07_done" } };
  N.P07r = { type: "lines", lines: [{ who: "narrateur", fr: "Gaston schläft. Vor der Kamera." }] };

  N.X01 = { type: "lines", lines: [
    { who: "musicien", fr: "Marcel? Er sollte hier um 17 Uhr spielen, aber er ist nicht gekommen. Ich spiele seit Mittag auf diesem Platz: Ein Pantomime macht zwar keinen Lärm, aber ich hätte ihn gesehen. Man hat mir gesagt, das Programm hat sich geändert. Wisst ihr, wo er jetzt spielt?" }
  ], next: "X01t" };
  N.X01t = { type: "task", diag: "D_X01", title: "Place des Vosges",
    task: { kind: "recall", who: "musicien", intro: "Die Place des Vosges ist der alte Ort. Wo ist der neue Ort?",
      fields: [{ id: "lieu", label: "Marcel spielt jetzt ...", keywords: [["louvre"]], size: 22, placeholder: "im / am / auf dem ...", where: "Seht euch die neue Fassung des Programms in der Buchhandlung „Les Mots retrouvés“ an." }],
      wrongText: "Nein, da ist er nicht.", success: { who: "musicien", fr: "Am Louvre, ja. Um 17 Uhr. Viel Glück!" },
      leaveLines: [{ who: "musicien", fr: "Kommt wieder, wenn ihr es wisst." }] },
    effects: { flag: "X01_done" },
    after: [{ who: "lino", fr: "Ein schöner Platz. Null Pantomime." }],
    next: "MAP" };

  N.C02 = { type: "lines", lines: [
    { who: "employee", fr: "Die Katakomben? Der Eingang ist hier. Sechs Millionen Pariser liegen da unten, und keiner heißt Marcel. Die Theatergruppe? Die probt hier, ja. Aber nicht heute. Habt ihr eine Verabredung mit ihnen? Wann denn?" }
  ], next: [{ if: "C02_done", node: "C02c" }, { node: "C02t" }] };
  N.C02t = { type: "task", diag: "D_C02", title: "Die Katakomben",
    task: { kind: "recall", who: "employee", intro: "Eure Verabredung mit der Theatergruppe: Wann ist die?",
      fields: [
        { id: "jour", label: "An welchem Tag?", answers: ["morgen"], keywords: [["morgen"]], size: 12, where: "Die Karte „morgen“ ist im Inventar.",
          traps: [{ answers: ["heute", "heute Abend", "heute Morgen", "heute Nachmittag", "jetzt", "gleich"], who: "employee", fr: "Heute? Nein, heute ist niemand da. Seht euch eure Karte noch mal an: das erste Wort." }] },
        { id: "heure", label: "Um wie viel Uhr?", answers: ["11 Uhr", "11", "11 h", "11:00", "11.00", "elf Uhr", "um 11 Uhr", "um elf Uhr", "um 11"], number: 11, size: 10, where: "Die Uhrzeit steht auf der Karte „morgen“." }
      ],
      wrongText: "Nein. Seht euch eure Karte an.", success: { who: "employee", fr: "Morgen, 11 Uhr. Also dann, bis morgen!" },
      leaveLines: [{ who: "employee", fr: "Kommt wieder, wenn ihr die Karte gelesen habt." }] },
    effects: { flag: "C02_done" },
    after: [
      { who: "marie", fr: "Morgen. Nicht heute. Wir haben zehn Minuten verloren, mehr nicht." },
      { who: "lino", fr: "Knochen und Touristen. Kein Brot." }
    ],
    next: "C02c" };
  N.C02c = { type: "choice", who: "marie", noDiag: true,
    lines: [{ who: "marie", fr: "Chloés Nummer steht auf der Karte. Rufen wir sie an?" }],
    choices: [
      { fr: "Chloé anrufen.", kind: "ok", next: "C02n" },
      { fr: "Zurück zum Stadtplan.", kind: "ok", next: "MAP" }
    ] };

  N.C02n = { type: "task", diag: "D_C02n", title: "Chloé anrufen",
    task: { kind: "recall", who: "marie", intro: "Wähle Chloés Nummer.",
      fields: [{ id: "num", label: "Die Nummer:", answers: ["06 12 34 56 78"], digits: true, size: 16, placeholder: "06 ..", where: "Die Nummer steht auf der Karte „morgen“ im Inventar.",
        traps: [{ answers: ["01 42 72 18 90"], digits: true, who: "nora", fr: "„Bäckerei Nora, guten Tag! Pain perdu? ... Chloé? Nein, die ist nicht hier.“" }] }],
      wrongText: "„Kein Anschluss unter dieser Nummer.“", success: { who: "chloe", fr: "Hallo? Ach, ihr seid's! Wartet, ich lese euch vor, was wir proben." },
      leaveLines: [{ who: "marie", fr: "Wir rufen sie später an." }] },
    next: "C03s" };
  N.C03s = { type: "scene", scene: "repetition", next: "C03" };
  N.C03 = { type: "audio", audio: "au_chloe", next: "C03t" };
  N.C03t = { type: "task", diag: "D_C03", audio: "au_chloe", title: "Chloés Probe",
    task: { kind: "gap", intro: "Was sagt Chloé? Ergänze.",
      parts: ["Man darf ", { id: "q1", opts: ["die alten Schilder", "die Schädel", "das neue Schild"], answer: "die alten Schilder" }, " nicht nehmen. Die Schädel sind ", { id: "q2", opts: ["aus Pappe", "echt", "aus Plastik"], answer: "aus Pappe" }, ". Marcel muss ", { id: "q3", opts: ["seine braune Tasche", "die Schädel", "ein Brot"], answer: "seine braune Tasche" }, " mitbringen."],
      wrong: { who: "marie", fr: "Lies noch mal genau. Was sagt sie wirklich?" } },
    effects: { flag: "C03_done" },
    after: [{ who: "marie", fr: "Ein roter Reißverschluss, ein gelber Aufkleber ... Das ist die Tasche, die wir haben! Sie gehört also wirklich Marcel." }],
    next: "MAP" };

  N.V02bs = { type: "scene", scene: "lampes", next: "V02b" };
  N.V02b = { type: "audio", audio: "au_assistante", next: "V02bt" };
  N.V02bt = { type: "task", diag: "D_V02b", audio: "au_assistante", title: "Der Schatten auf der Leinwand",
    task: { kind: "gap", intro: "Stell die Sachen so hin, wie die Assistentin es sagt.",
      parts: ["Der Spiegel steht ", { id: "m", opts: ["links", "rechts"], answer: "rechts" }, " neben der Kiste. Das Baguette liegt ", { id: "b", opts: ["vor", "hinter"], answer: "hinter" }, " der Lampe. Die rote Lampe ist ", { id: "r", opts: ["an", "aus"], answer: "aus" }, ". Die blaue Lampe ist ", { id: "bl", opts: ["an", "aus"], answer: "an" }, "."],
      wrong: { who: "assistante", fr: "Hm, der Schatten sieht komisch aus. Lies noch mal genau." } },
    effects: { flag: "V02b_done" },
    after: [
      { who: "narrateur", fr: "Auf der Leinwand: ein riesiger Schatten. Ein Brot. Bernd." },
      { who: "lino", fr: "Endlich. Bernd ist ein Star." }
    ],
    next: "V02bb" };
  N.V02bb = { type: "scene", scene: "louvre", next: "V03" };

  G.nodes = N;

  /* ---------- Abspann ---------- */
  G.credits = {
    title: "L'affaire du pain perdu",
    lines: ["Florian Nowak 2026"]
  };

  /* ---------- Maries Hilfestufen ---------- */
  G.help = {
    M03: ["Willst du über jetzt, über später oder über vorhin sprechen?", { fr: "Schau dir die Verben an: gesehen, suchen, treffen.", action: "material" }, "„Haben Sie ... gesehen?“ fragt nach etwas, das schon passiert ist. Genau das wollen wir wissen.", "Wir wollen wissen, ob sie ihn gesehen hat: „Haben Sie diesen Mann gesehen?“"],
    M04: ["Sie spricht von drei Tageszeiten: heute Morgen, heute Nachmittag, heute Abend.", { fr: "Lies noch mal, was die Kioskfrau gesagt hat. Hier ist ihr Text.", action: "transcript" }, "Such im Text: „Heute Morgen ...“, „Heute Nachmittag ...“, „Aber heute Abend?“", "Heute Morgen Père-Lachaise, heute Nachmittag Marais, heute Abend weiß man nicht."],
    M04b: ["Was hat die Kioskfrau genau gesagt?", { fr: "Lies noch mal, was die Kioskfrau gesagt hat. Hier ist ihr Text.", action: "transcript" }, "Achte auf die Kleidung, auf das Foto, auf die Treppe und auf die Métro.", "Gestreifter Pullover, ihr habt das Foto angeschaut, die Tasche an der Treppe, dann zur Métro."],
    P02: ["Zeig ihm das Foto.", { fr: "Im Inventar: das Gruppenfoto.", action: "material" }, "Du kannst sagen: Haben Sie diesen Pantomimen gesehen?", "Zeig ihm das Gruppenfoto und frag, ob er den Pantomimen gesehen hat."],
    P04: ["Geradeaus, dann ... links oder rechts? Lies noch mal nach.", { fr: "Hier ist noch mal, was der Wärter gesagt hat.", action: "transcript" }, "Im Text stehen drei Hinweise: geradeaus, links, nicht bergab.", "Geradeaus bis zur Kreuzung, dann links. Nicht den Weg, der bergab führt."],
    P06: ["Schau dir die Tasche auf dem Foto genau an. Was siehst du?", { fr: "Achte auf den Reißverschluss und den Aufkleber.", action: "material" }, "Schau dir auch die braune Tasche im Inventar an: den Reißverschluss, den Aufkleber.", "Reißverschluss und Aufkleber: auf dem Foto und an der Tasche im Inventar."],
    B02: ["Lino, wir suchen keinen Nachtisch. Was suchen wir?", { fr: "Schau dir den Flyer an: „Le Pain perdu“ ist eine Show.", action: "material" }, "Sag ihr: Ich suche einen Rucksack ... oder: Ich suche die Show ...", "Sag ihr, was ihr sucht: den Rucksack oder die Show, nicht den Nachtisch."],
    B04: ["Lies noch mal genau. Was sagt er wirklich?", { fr: "Hier ist noch mal Marcels Nachricht.", action: "transcript" }, "Such im Text: „Das gehört nicht mir“, „Ich glaube“, „das Programm hat sich geändert“.", "Sicher ist nur, was er wörtlich sagt. Was er will oder wo er ist, sagt er nicht."],
    B06: ["Drei Dinge: was passiert ist, warum, wohin wir gehen.", { fr: "Schau dir die Satzanfänge an.", action: "material" }, "Du kannst so anfangen: Der Pantomime hatte eine braune Tasche, genau wie wir.", "Schreib, was passiert ist (die Taschen sahen ähnlich aus, er hat unseren Rucksack genommen) und wohin ihr jetzt geht."],
    L02: ["Drei Dinge prüfen: den Namen, die Show, die Fassung.", { fr: "Schau dir die drei Aushänge genau an: den Nachnamen, den Ort, die Fassung.", action: "material" }, "Nur ein Aushang hat den richtigen Nachnamen und „Korrigierte Fassung“.", "Richtiger Nachname (Blanchard) und korrigierte Fassung: Das passt nur bei einem Aushang."],
    L02q: ["Euer Marcel – wie heißt er weiter? Wer hat euch seinen Namen gesagt?", { fr: "Denk an den Père-Lachaise.", action: "material" }, "Der Wärter auf dem Père-Lachaise kennt seinen Namen. Geh noch mal zu ihm.", "Den Nachnamen hat euch der Wärter auf dem Friedhof gesagt."],
    V01q: ["Den vollständigen Namen und die Uhrzeit hast du auf einem Aushang gesehen.", { fr: "Aushang C, in der Buchhandlung.", action: "material" }, "Geh zurück in die Buchhandlung und lies die Pinnwand noch mal.", "Vollständiger Name und Uhrzeit stehen auf Aushang C in der Buchhandlung."],
    V03q: ["Was war in Bernd? Die Dose, der Umschlag ... und wo?", { fr: "Kevin hat eine SMS geschickt. Sie ist auf deinem Handy, im Inventar.", action: "material" }, "Du kannst Herrn Nowak mit dem Handy schreiben: Er weiß, was im Rucksack ist.", "Kevins SMS steht auf dem Handy im Inventar; Herr Nowak weiß, wo der Umschlag liegt."],
    L04: ["Findet die Show statt? Ja. Hat sich der Ort geändert? Ja. Also?", { fr: "Die drei Stempel: altes Programm = von früher, Änderung = etwas ist anders, abgesagt = keine Show.", action: "material" }, "Geändert = ÄNDERUNG. Abgesagt = keine Show.", "Verlegt heißt „Änderung“, nicht „abgesagt“."],
    V03: ["Zwei Schritte: Hallo sagen und das Problem nennen, dann erklären.", { fr: "Bleib höflich: Es war ein Irrtum, kein Diebstahl.", action: "material" }, "Entschuldigung, ich glaube, ... / Während wir ..., haben Sie ...", "Höflich anfangen, dann erklären, was passiert ist: ein Irrtum, kein Diebstahl."],
    V05: ["Erzähl der Reihe nach: Montmartre, die Hinweise, das Ende.", { fr: "Schau dir die Satzanfänge an.", action: "material" }, "Wir waren in Montmartre für ein Foto. Lino hatte den Rucksack Bernd.", "Wie es anfing, was der Pantomime gemacht hat, der entscheidende Hinweis, die Rückgabe."]
  };

  /* ---------- Diagnose: Beschreibungen ---------- */
  G.diag = {
    D_M03: "Passende Frage an die Zeugin", D_M04: "Zeitangaben der Zeugin", D_M04b: "Zeugenbericht, vier Lücken",
    D_M06: "Sackgasse Métro", D_P02: "Weg zum Wärter", D_P04: "Wegbeschreibung auf dem Plan", D_P05: "Gespräch mit Chloé", D_P06: "Zwei Merkmale vergleichen",
    D_B01: "Flyer gelesen", D_B02: "Gesprächsweg bei Nora", D_B02b: "Rucksack beschreiben", D_B04: "Drei gesicherte Aussagen", D_B06: "Nachricht an Nowak",
    D_L02: "Aushang C gewählt", D_L02q: "Abfrage Lenoir: Nachname vor den Aushängen", D_L04: "Stempel", D_V01q: "Abfrage Assistentin: Name + Uhrzeit",
    D_V03: "Finale: Gespräch in zwei Schritten", D_V03q: "Abfrage Finale: Inhalt des Rucksacks", D_V05: "Abschlussbericht",
    D_P07: "Gaston und der Ball", D_X01: "Abfrage Vosges: neuer Ort", D_C02: "Abfrage Katakomben: Tag + Uhrzeit", D_C02n: "Chloés Nummer gewählt", D_C03: "Chloés Probe", D_V02b: "Brotschatten",
    D_NOWAK: "Nowak nach dem Inhalt gefragt (Nachschlagen)"
  };

  /* ---------- Lexikon: Paris-Begriffe (Wörter im Text sind anklickbar) ---------- */
  G.glossary = [
    ["Montmartre", "Hügel im Norden von Paris, früher ein Viertel der Künstler. Oben steht die weiße Kirche Sacré-Cœur."],
    ["Sacré-Cœur", "„Heiliges Herz“: die große weiße Kirche auf dem Montmartre."],
    ["Père-Lachaise", "Der größte Friedhof von Paris. Dort liegen viele berühmte Menschen begraben."],
    ["Jim Morrison", "Amerikanischer Rocksänger (The Doors), 1971 in Paris gestorben. Sein Grab auf dem Père-Lachaise besuchen sehr viele Touristen."],
    ["Marais", "Altes Viertel mitten in Paris, mit kleinen Gassen, Läden und Bäckereien."],
    ["Louvre", "Riesiges Kunstmuseum, früher ein Königsschloss. Im Innenhof steht eine Pyramide aus Glas."],
    ["Mona Lisa", "Das berühmteste Gemälde der Welt (auf Französisch „La Joconde“). Es hängt im Louvre."],
    ["Place des Vosges", "Der älteste Platz von Paris, ringsum Häuser mit Bogengängen."],
    ["Katakomben", "Unterirdische Gänge unter Paris. Dort liegen die Knochen von rund sechs Millionen Menschen."],
    ["Denfert-Rochereau", "Platz und Métro-Station im Süden von Paris, am Eingang der Katakomben."],
    ["Métro", "Die U-Bahn von Paris."],
    ["Pain perdu", "Wörtlich „verlorenes Brot“: altes Brot, in Milch und Ei getaucht und in der Pfanne gebraten. Bei uns heißt das Arme Ritter. „Le Pain perdu“ ist auch der Name von Marcels Show."],
    ["Les Mots retrouvés", "Name der Buchhandlung: „Die wiedergefundenen Wörter“."],
    ["Baguette", "Langes, dünnes französisches Weißbrot."],
    ["Croissant", "Französisches Hörnchen aus Blätterteig, typisch zum Frühstück."],
    ["Pantomime, Pantomimen", "Künstler, der ohne Worte spielt, nur mit Gesten. Oft mit weiß geschminktem Gesicht."],
    ["Baskenmütze", "Flache, runde Mütze, typisch für Frankreich (auf Französisch „le béret“)."],
    ["Ohrdruf", "Kleine Stadt in Thüringen. Dort ist die Schule der Klasse 10b."],
    ["Vita Cola, Viba", "Zwei Marken aus Thüringen: eine Cola und Nougat-Süßigkeiten."]
  ];

  return G;
})();
