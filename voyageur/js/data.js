/* Le voyageur de 1900 (Pain perdu, Teil 3) – Spieldaten
   Quelle: Drehbuch Teil 3, Fassung 1.3 (4. November 2026). Kennungen wie im Drehbuch: O = Musée d'Orsay, P = Pont Alexandre III,
   I = Invalides (Marcel), C = Chloé am Stand 6, F = Finale am Stand des Händlers, R = Abfragen, W = Schreibaufträge.
   Alle Spieltexte sind französisch und halten A2 (Drehbuch, Abschnitt 2): nur présent, passé composé, imparfait und futur proche;
   Fragen mit est-ce que oder Intonation; Aufgaben für beide mit vous, Schreibaufträge und Hilfen für eine Person mit tu.
   Die Hilfe gibt an jeder Station die Figur, die dort nicht ermittelt (G.helpBy). Nur das Glossar ist französisch-deutsch.
   Fassung 1.3: freie Stationen und der freiwillige Nebenweg zum Petit Palais (X, nach dem Tipp der Assistentin am Pont). */
window.GAME = (function () {
  const G = {};

  G.version = "3.2.0";
  /* Teil 3 startet aus dem gemeinsamen Startmenü (../index.html, Schlüsselwort « Orsay » am Ende von Teil 2), wie Teil 2.
     Das eigene Startmenü gibt es nur noch in der Lehrkraft-Ansicht und für die automatischen Tests. */
  G.hub = true;

  /* ---------- Figuren (Porträts ohne Pfad liegen in voyageur/assets/img/, mit Pfad kommen sie aus Teil 1 und Teil 2) ---------- */
  const T1 = "../assets/img/", T2 = "../guide-fantome/assets/img/";
  G.chars = {
    narrateur: { name: "", initials: "", color: "#8b7355" },
    lino: { name: "Lino", pt: T2 + "pt_lino", initials: "L", color: "#3b4a6b" },
    marie: { name: "Marie", pt: T2 + "pt_marie", initials: "M", color: "#8a3b3b" },
    nowak: { name: "M. Nowak", pt: T2 + "pt_nowak", initials: "N", color: "#5a5a5a" },
    kevin: { name: "Kevin", pt: "pt_kevin", initials: "Kv", color: "#3a7ab0" },
    delmas: { name: "Victor Delmas", pt: "pt_delmas", initials: "VD", color: "#6b4a2a" },
    bouquiniste: { name: "La bouquiniste", pt: T2 + "pt_bouquiniste", initials: "Bq", color: "#3f6b3f" },
    assistante: { name: "L'assistante", pt: T1 + "pt_assistante", initials: "A", color: "#4a4a6b" },
    marcel: { name: "Marcel", pt: "pt_marcel_civil", initials: "Mb", color: "#333" },   // ohne Schminke (I00); das Porträt aus Teil 1 zeigt den Pantomimen
    chloe: { name: "Chloé", pt: T1 + "pt_chloe", initials: "C", color: "#b04a3a" },
    responsable: { name: "Le responsable", pt: "pt_responsable", initials: "R", color: "#2f4b5a" },
    lucien: { name: "Lucien", pt: T2 + "pt_lucien", initials: "Lu", color: "#7a5a3a" }
  };
  /* Wer an einer Station nicht ermittelt, gibt dort die Hilfe (Drehbuch, Abschnitt 2) */
  G.helpBy = { orsay: "marie", pont: "lino", invalides: "marie", stand6: "lino", petitpalais: "marie", finale: "marie" };
  G.helpDefault = "marie";
  /* Wer in Teil 2 bei den Bouquinisten war, wird in O05q wiedererkannt */
  G.earlier = [{ save: "pg_save_v1", flag: "B_done", as: "t2_B" }];

  /* ---------- Feste Texte ---------- */
  G.ui = {
    title: "Le voyageur de 1900",
    subtitle: "Une enquête de Lino et Marie à Paris",
    verbs: { regarder: "Regarder", parler: "Parler", ecouter: "Écouter", lire: "Lire", montrer: "Montrer" },
    btn: {
      carnet: "Carnet", carte: "Carte", inventaire: "Inventaire", aide: "Aide", rejouer: "Rejouer", ecouter: "Écouter", transcription: "Transcription",
      continuer: "Continuer", exporter: "Exporter le carnet", valider: "Valider", fermer: "Fermer", glossaire: "Glossaire",
      commencer: "Commencer", reprendre: "Continuer la partie", nouvelle: "Nouvelle partie", menu: "Menu", repondre: "Répondre"
    },
    carnet: {
      title: "Notre enquête", done: "réglé", open: "?", cards: "Nos textes",
      hint: "Le carnet ne note rien pour vous. Les noms, les dates, les heures : vous les retenez, ou vous les écrivez sur votre feuille."
    },
    recall: {
      check: "Vérifier", later: "Revenir plus tard",
      pause: "Là, tu devines. Va vérifier, puis reviens après la pause.",
      paused: "Pas maintenant. Vérifie d'abord, puis reviens dans {s} secondes.",
      wrong: "Non, ce n'est pas ça.", unknown: "Tu ne sais plus ? Va revoir, puis reviens.",
      intro: "Réponds de mémoire ou avec ta feuille.", empty: "Écris d'abord une réponse."
    },
    inv: { title: "Inventaire", empty: "Rien.", hint: "Cliquez sur un objet pour le regarder de près." },
    partner: "Changement ! {p2} prend la souris, {p1} prend le carnet.",
    solo: "Cette question, chacun répond seul. D'abord {p1}, puis {p2}.",
    soloNow: "C'est à {p} de répondre.",
    travelLabel: "<b>🚶</b> À pied…",
    travel: [
      { who: "lino", fr: "On marche encore ?" },
      { who: "marie", fr: "C'est une promenade photo. Alors, on marche." }
    ],
    end: "Bravo ! Vous avez trouvé la vraie histoire des photos.",
    endStats: "{places} lieux · {helps} aides · {mins} min · {q} questions sur 4",
    endExport: "Exportez le carnet et donnez les fichiers à votre professeur.",
    mouse: "Souris :",
    sms: "message",
    /* Sätze der Hilfefigur (Marie oder Lino, je nach Station) */
    helper: {
      ok: "Oui, c'est ça !",
      locked: "Pas encore. On ne sait pas encore où aller.",
      finale: "Pas maintenant ! D'abord, on finit l'enquête.",
      afterHelp: "Bien. La prochaine fois, sans moi !",
      helpLater: "Essaie encore une fois. Après, je t'aide.",
      first: "D'abord, on finit ça."   // freie Station: ein Abschnitt läuft noch
    },
    /* gegen Raten: Pause nach jedem dritten Fehlversuch, Rückmeldung „wie viele richtig“, Tempobremse */
    guess: {
      pause: "Là, tu devines. Prends ton temps : relis, réécoute ou demande-moi de l'aide. Après la pause, tu peux réessayer.",
      paused: "Pas encore. Pendant la pause, relis ou réécoute. Encore {s} secondes.",
      wait: "⏳ Encore {s} s",
      count: "Juste : {n} sur {m}.",
      all: "Choisis d'abord une réponse partout.",
      choose: "Choisis {n} réponses.",
      chooseOne: "Choisis une réponse."
    },
    tempo: { read: "Doucement. Lis d'abord.", look: "Doucement. Regarde d'abord." },
    listen: "Écoutez jusqu'au bout : après, vous pouvez continuer.",
    listenMore: "Vous pouvez écouter plusieurs fois.",
    audioLeft: "Encore {n} fois.",
    audioLast: "Vous ne pouvez plus écouter.",
    player: { skipped: "Vous avez sauté un passage. Écoutez-le aussi." },   // Audioplayer (js/audioplayer.js), sonst gelten dessen Standardtexte
    loupe: {
      found: "Trouvé : {n} sur {m}",
      odd: "Choses bizarres : {n} sur {m}",
      hint: "Zoomez avec + et − ou avec la molette. Déplacez l'image avec la souris. Cliquez sur les détails.",
      hintTouch: "Zoomez avec deux doigts ou avec + et −. Déplacez l'image avec un doigt. Touchez les détails.",
      observeHint: "Regardez la scène.",
      in: "Zoomer", out: "Dézoomer", reset: "100 %"
    },
    compare: { other: "Oui. Et sur l'autre image ?" },
    reveal: { photo: "Photo {c} :" },
    chainUp: "Monter", chainDown: "Descendre",
    proof: "Preuve {n}", proofItem: "un objet…", proofSentence: "ce qu'il montre…",
    write: {
      count: "{n} mots (minimum {min})",
      more: "Encore {n} mots, au moins.",
      more1: "Encore un mot, au moins.",
      finish: "Termine la phrase « {s} ».",
      dots: "Il reste des « ... » dans « {s} ». Remplace-les par tes mots.",
      junk: "Ça, ce ne sont pas des mots : « {w} ». Écris de vraies phrases.",
      repeat: "Tu répètes toujours les mêmes mots. Écris des phrases différentes.",
      lang: "En français, s'il te plaît ! Écris tes phrases en français.",
      topic: "Je ne comprends pas : de quoi tu parles ?",
      paste: "Pas de copier-coller : écris avec tes mots."
    },
    full: {
      label: "Plein écran", exit: "Quitter le plein écran", exitShort: "Écran normal", title: "Plein écran",
      ios: "Sur l'iPhone, le navigateur ne peut pas mettre le jeu en plein écran. Mais vous pouvez mettre le jeu sur l'écran d'accueil :",
      iosSteps: ["Touchez « Partager » : le carré avec la flèche (parfois sous « … »).", "Choisissez « Sur l'écran d'accueil ».", "Ouvrez le jeu avec la nouvelle icône : il est en plein écran."],
      iosNote: "Attention : là, le jeu a sa propre sauvegarde. Et tournez votre téléphone : l'image est plus grande.",
      other: "Votre navigateur ne peut pas mettre le jeu en plein écran. Ouvrez le menu du navigateur et choisissez « Ajouter à l'écran d'accueil ». Avec la nouvelle icône, le jeu s'ouvre sans la barre du navigateur."
    },
    mapHint: "Choisissez un lieu pour y aller.",
    locked: "fermé",
    confirmNew: "Commencer une nouvelle partie ? La partie actuelle reste dans les résultats de cet appareil.",
    confirmReplace: "Il y a déjà une partie sur cet appareil. Commencer une nouvelle partie ?"
  };

  /* ---------- Freie Texte: häufige Wörter der Spielsprache (own) und typische Wörter anderer Sprachen (foreign) ---------- */
  G.writeLang = {
    own: "le la les l un une des du de d et est a au aux il elle on nous vous ils elles je j tu ne n pas que qu qui dans sur sous avec pour par en son sa ses notre nos mon ma mes ce cet cette ces c s se y etait etaient avait avaient avons ont sont ai as va vont allons fait puis mais alors donc tres apres avant pendant chez aussi tout tous plus leur leurs lui moi toi comme quand parce ou rien jamais disait voulait pouvait",
    foreign: "der die das den dem und ist sind war waren hat haben hatte hatten nicht ich wir ihr sie er ein eine einen einem einer mit auf zum zur im ins von vom bei nach aus wo was wie aber auch dann noch schon weil dass oder mein meine unser unsere unseren wurde the and is of to with my we he she they it this that have has had in at our",
    share: 0.2
  };

  /* ---------- Die vier Fragen im Carnet ---------- */
  G.questions = {
    Q1: { title: "Qu'est-ce que le vendeur promet ?", done: "O04_done", answer: "Il dit : on a pris les photos en 1900. Et ce sont des photos originales, pas des copies." },
    Q2: { title: "Qu'est-ce qui est vraiment vieux ?", done: ["O06_done", "I03_done"], answer: "Le bâtiment d'Orsay et l'album. Mais sur la photo B, il y a la baguette réparée de Marcel : la photo est de l'année dernière, ou plus tard." },
    Q3: { title: "Quand est-ce qu'on a pris les photos ?", done: "W1_done", answer: "En septembre 2025. « Paris 1900 », c'est le titre de la série. Ce n'est pas une date." },
    Q4: { title: "Comment est-ce qu'on peut le montrer ?", done: "F04_done", answer: "Avec trois preuves : {proofs}." }
  };
  G.openAfter = "O02_done";   // das Carnet öffnet sich, wenn das Album gefunden ist
  G.mapAfter = "R1_done";     // die Karte erst nach R1
  G.mapLock = ["F_started", "!finished"];   // im Finale keine Wege mehr

  /* ---------- Die Fotos ----------
     P17 bis P19 sind Chloés vollständige Fotos; das Spiel schneidet die Albumfotos A, B, C daraus (crop, in % des ganzen Fotos).
     P16 ist eine Falle in Chloés Dossier: dieselbe Fassade, aber die Person steht anders und trägt einen anderen Mantel.
     Lesbarer Text (die Filmklappe) kommt als labels vom Spiel. Fundpunkte stehen bei den Aufgaben, ebenfalls in Fotokoordinaten. */
  G.photos = {
    P16: { img: "doc_p16", ar: 1.5, label: "P16", decoy: true },
    P17: { img: "doc_p17", ar: 1.5, label: "P17", crop: { x: 11, y: 7, w: 64, h: 93 }, legend: "Visite du musée d'Orsay, 1900" },
    P18: { img: "doc_p18", ar: 1.5, label: "P18", crop: { x: 10, y: 0, w: 90, h: 100 }, legend: "Le pont Alexandre III, 1900" },
    P19: { img: "doc_p19", ar: 1.5, label: "P19", crop: { x: 18, y: 0, w: 62, h: 83.8 }, legend: "Les Invalides, 1900",
      labels: [{ x: 49.5, y: 94, rot: -4.5, size: 1.3, text: "PARIS 1900\nSEPTEMBRE 2025\nCHLOÉ", cls: "clap" }] }
  };
  /* Das aufgeschlagene Album: drei Seiten, je ein Foto (x, y, w in % der Ansicht; die Höhe folgt aus dem Ausschnitt) */
  G.album = { ar: 1.9, pages: 3, slots: { A: { x: 3.2, y: 10, w: 27, photo: "P17" }, B: { x: 36.5, y: 10, w: 27, photo: "P18" }, C: { x: 69.8, y: 13, w: 27, photo: "P19" } } };

  /* ---------- Inventar (Kennungen des Drehbuchs: A, B, C, D1 bis D6, T) ---------- */
  G.items = {
    telephone: { emoji: "📱", name: "le téléphone", desc: "Pour écrire à M. Nowak." },
    photo_a: { emoji: "🏛️", name: "la photo d'Orsay", desc: "La photo A de l'album. Légende : « Visite du musée d'Orsay, 1900 ».", render: "crop", photo: "P17" },
    photo_b: { emoji: "🌉", name: "la photo du pont", desc: "La photo B de l'album. Légende : « Le pont Alexandre III, 1900 ».", render: "crop", photo: "P18" },
    photo_c: { emoji: "⛪", name: "la photo des Invalides", desc: "La photo C de l'album. Légende : « Les Invalides, 1900 ».", render: "crop", photo: "P19" },
    fiche_vente: { emoji: "🏷️", name: "la fiche de vente", desc: "Album Paris 1900 · Couverture et pages anciennes · Trois photographies prises en 1900 · Photos originales, pas des copies · Prix : 180 € · Vendeur : Victor Delmas" },
    fiche_orsay: { emoji: "📄", name: "la fiche sur Orsay", desc: "La gare d'Orsay. En 1900, il y avait une grande exposition à Paris : l'Exposition universelle. Pour cette exposition, on a construit une gare. Les gens prenaient le train ici. En 1986, la gare est devenue un musée : le musée d'Orsay. Aujourd'hui, on regarde des tableaux ici. Le bâtiment est vieux, mais ce n'est plus une gare." },
    programme: { emoji: "📋", name: "le programme", desc: "Les Images de Paris · Aujourd'hui · Pont Alexandre III : information · Esplanade des Invalides : livres et costumes · Marcel Blanchard : accessoires de théâtre, le matin · Chloé : photos, à partir de 14 h, stand 6" },
    photo_baguette: { emoji: "🥖", name: "la photo de la baguette", desc: "La baguette de Marcel aujourd'hui : le bout cassé et trois morceaux de ruban adhésif.", img: "doc_baguette" },
    photos_entieres: { emoji: "📁", name: "les photos entières", desc: "Les photos de Chloé : P17, P18 et P19. On voit aussi les bords.", render: "fulls", photos: ["P17", "P18", "P19"] },
    carte_1900: { emoji: "🖼️", name: "la carte postale de 1900", desc: "Une carte postale du Petit Palais, gratuite : une vraie photo de 1900. Le pont Alexandre III pendant l'Exposition universelle, avec beaucoup de monde. Et sans boulanger.", img: "doc_1900" },
    fiche_chloe: { emoji: "📝", name: "la fiche de Chloé", desc: "Compagnie Marcel Blanchard · Série « Paris 1900 » · Séance photo en costumes : septembre 2025 · Photographe : Chloé · P17 Orsay · P18 pont Alexandre III · P19 Invalides — Vente du 12 octobre 2026 · Trois copies, photos des coulisses : P17, P18, P19 · 6 € la photo, total : 18 € · Acheteur : Victor Delmas" }
  };

  /* ---------- Hörtexte (60 bis 70 Wörter). Stimmen für die Aufnahme wie in audio_v1/: Assistentin „Merisa“, Marcel „Peter“,
     Chloé „Victoria“. Bis zur Aufnahme liest der Browser vor. ---------- */
  G.audio = {
    au_assistante: { who: "assistante", text: "Ah oui, je connais ces photos. C'était l'année dernière, avec la compagnie de Marcel. Tout le monde portait des costumes anciens. Moi, j'aidais Chloé. Il y avait beaucoup de vent. Marcel faisait le boulanger. Il tenait une baguette, et tout à coup, elle est tombée. Il l'a ramassée, et Chloé a recommencé la photo. La date exacte ? Je ne sais pas. Demandez à Chloé." },
    au_marcel: { who: "marcel", text: "C'était en septembre, l'année dernière, pendant la séance photo. Il y avait beaucoup de vent. Je faisais le boulanger, avec ma baguette en plastique. Tout à coup, elle est tombée par terre, et le bout s'est cassé. Alors, j'ai mis trois petits morceaux de ruban adhésif. Ensuite, Chloé a recommencé les photos. Regardez : j'ai encore la baguette. Une vraie baguette ne dure pas aussi longtemps." },
    au_chloe: { who: "chloe", text: "J'ai pris ces trois photos en septembre 2025. « Paris 1900 », c'est le titre de notre série. Ce n'est pas une date. Les photos sont brunes pour la série. Avant-hier, après notre balade au Père-Lachaise, Victor Delmas a acheté trois photos des coulisses. Dix-huit euros. Je lui ai expliqué le titre. Il a mis les photos dans un vieux livre. Je ne savais pas." }
  };

  /* ---------- Szenen und Hotspots (Koordinaten in % des Bildes) ---------- */
  /* Fassung 1.3: Orsay, Pont, Invalides und Stand 6 sind freie Stationen (free). Nach der Ankunft wählen die Spieler selbst,
     womit sie anfangen; ein angefangener Abschnitt läuft zu Ende (game.js, openFrom), danach ist die Station wieder frei.
     Erledigtes trägt ein Häkchen (doneIf), die Szenenhilfe (help) hilft beim Suchen und lässt die offenen Hotspots leuchten
     (openIf). Was erst später geht, beantwortet eine kurze Bemerkung. Sind alle Abschnitte erledigt, geht es von allein weiter. */
  G.scenes = {
    orsay: {
      name: "Musée d'Orsay · la brocante du quai", bg: "bg_orsay", free: true,
      enter: [{ if: "O06_done", node: "Or" }, { if: ["O03_done", "O04_done"], node: "O05" }, { if: "O01_done", node: null }, { node: "O00" }],
      help: [{ if: "!O02_done", key: "S_orsay1" }, { if: "!O06_done", key: "S_orsay2" }],
      labels: [{ x: 46, y: 26.5, text: "Brocante du quai", cls: "paint big" }],
      hotspots: [
        { id: "album", label: "l'album", x: 40, y: 70, w: 30, h: 22, actions: { regarder: [{ if: "O02_done", node: "Oa" }, { node: "O02" }] }, showIf: "O01_done", doneIf: "O02_done" },
        { id: "delmas", label: "le vendeur", x: 41, y: 34, w: 28, h: 35.5, actions: { parler: [{ if: "O03_done", node: "Or" }, { if: "O02_done", node: "O03" }, { node: "Ox" }] }, showIf: "O01_done", doneIf: "O03_done", openIf: "O02_done" },
        { id: "fiche", label: "la fiche de vente", x: 21.5, y: 79, w: 9, h: 13.5, actions: { lire: [{ if: "O04_done", node: "Of" }, { if: "O02_done", node: "O04d" }, { node: "Oxf" }] }, showIf: "O01_done", doneIf: "O04_done", openIf: "O02_done" },
        { id: "brocante", label: "la brocante", x: 24, y: 19.5, w: 44, h: 14.5, actions: { regarder: "Ob" }, showIf: "O01_done" },
        { id: "horloge", label: "l'horloge", x: 21, y: 6, w: 8, h: 13, actions: { regarder: "Oh" }, showIf: "O01_done" },
        { id: "responsable", label: "le monsieur", x: 80.5, y: 33, w: 15, h: 44, actions: { regarder: "Orp" }, showIf: "O01_done" },
        { id: "appareil", label: "l'appareil photo", x: 90.5, y: 79, w: 7.5, h: 15, actions: { regarder: "Oc" }, showIf: "O01_done", lab: "r" }
      ]
    },
    pont: {
      name: "Pont Alexandre III", bg: "bg_pont", free: true,
      enter: [{ if: "P_done", node: "Pr" }, { if: "P_arr", node: null }, { node: "Pa" }],
      help: [{ if: "!P01_done", key: "S_pont1" }, { if: "!P_done", key: "S_pont2" }],
      labels: [{ x: 80.3, y: 30.5, text: "Information", cls: "paint mid" }],
      hotspots: [
        { id: "pont", label: "le pont", x: 0, y: 8, w: 62, h: 55, actions: { regarder: [{ if: "P01_done", node: "Pp" }, { node: "P00" }] }, showIf: "P_arr", doneIf: "P01_done" },
        { id: "assistante", label: "l'assistante", x: 75.5, y: 38, w: 16.5, h: 60, actions: { parler: [{ if: "P_done", node: "Pr" }, { if: "P01_done", node: "P02" }, { node: "Px" }] }, showIf: "P_arr", doneIf: "P_done", openIf: "P01_done" },
        { id: "cartes", label: "les cartes postales", x: 92.5, y: 44, w: 7.5, h: 32, actions: { regarder: "Ppc" }, showIf: "P_arr", lab: "r" }
      ]
    },
    invalides: {
      name: "Les Invalides · l'esplanade", bg: "bg_invalides", free: true,
      enter: [{ if: "I_done", node: "Ir" }, { if: "I05_done", node: "R2" }, { if: ["I02_done", "I03_done"], node: "I05" }, { if: "I_arr", node: null }, { node: "I00" }],
      help: [{ if: "!I05_done", key: "S_invalides" }],
      labels: [{ x: 50, y: 36.5, text: "Les Images de Paris", cls: "paint big" }, { x: 88.5, y: 35.8, text: "Stand 6", cls: "paint mid" }],
      hotspots: [
        { id: "marcel", label: "Marcel", x: 35, y: 39, w: 14, h: 60, actions: { parler: [{ if: "I05_done", node: "Ir" }, { if: "I02_done", node: "Ir2" }, { node: "I00m" }] }, showIf: "I_arr", doneIf: "I02_done" },
        { id: "bouquiniste", label: "la bouquiniste", x: 11, y: 41, w: 13, h: 31, actions: { parler: [{ if: "I_done", node: "Ib" }, { if: "I05_done", node: "R2" }, { if: ["I02_done", "I03_done"], node: "I05" }, { node: "Ibx" }] }, showIf: "I_arr", doneIf: "I_done", openIf: ["I02_done", "I03_done"] },
        { id: "table", label: "les baguettes", x: 49.5, y: 72, w: 14, h: 13, actions: { regarder: [{ if: "!I03_done", node: "I03p" }, { if: ["I02_done", "!Itemps_done"], node: "Itemps" }, { node: "It" }] }, showIf: "I_arr", doneIf: "I03_done" },
        { id: "malle", label: "la malle", x: 50.5, y: 63.5, w: 10, h: 8, actions: { regarder: "Im" }, showIf: "I_arr" },
        { id: "chapeaux", label: "les chapeaux", x: 64, y: 66, w: 9, h: 13, actions: { regarder: "Ich" }, showIf: "I_arr" }
      ]
    },
    stand6: {
      name: "Les Invalides · stand 6", bg: "bg_stand6", free: true,
      enter: [{ if: "W1_done", node: "Cr" }, { if: ["C01_done", "C02_done"], node: "W1" }, { if: "C00_done", node: null }, { node: "C00" }],
      help: [{ if: "!W1_done", key: "S_stand6" }],
      labels: [{ x: 50, y: 36.5, text: "Les Images de Paris", cls: "paint big" }, { x: 88.5, y: 35.5, text: "Stand 6", cls: "paint mid" }],
      hotspots: [
        { id: "chloe", label: "Chloé", x: 80.5, y: 43.5, w: 9, h: 15, actions: { parler: [{ if: "C02_done", node: "Cr" }, { node: "C02l" }] }, showIf: "C00_done", doneIf: "C02_done" },
        { id: "photos", label: "les photos", x: 89.5, y: 44.5, w: 9, h: 13, actions: { regarder: "Cph" }, showIf: "C00_done", lab: "r" },
        { id: "dossier", label: "le dossier", x: 81.5, y: 58.5, w: 14, h: 13, actions: { regarder: [{ if: "C01_done", node: "Cd" }, { node: "C01" }] }, showIf: "C00_done", doneIf: "C01_done" }
      ]
    },
    /* Fassung 1.3: freiwilliger Nebenweg nach dem Pont (Tipp der Assistentin, P04). Die Vitrine vergleicht ein echtes Foto von 1900
       mit der Foto B; danach eine Postkarte als Andenken. Für das Finale braucht man nichts davon. */
    petitpalais: {
      name: "Le Petit Palais · « Paris en 1900 »", bg: "bg_petitpalais", free: true,
      enter: [{ if: "X_done", node: "Xr" }, { if: "X_arr", node: null }, { node: "X00" }],
      help: [{ if: "!X_done", key: "S_petitpalais" }],
      labels: [{ x: 15, y: 27.5, text: "Paris en 1900", cls: "paint mid" }],
      hotspots: [
        { id: "vitrine", label: "la vitrine", x: 37, y: 38, w: 25, h: 40, actions: { regarder: [{ if: "X_done", node: "Xv" }, { node: "X02" }] }, showIf: "X_arr", doneIf: "X_done" },
        { id: "panneau", label: "le panneau", x: 6, y: 22, w: 18, h: 40, actions: { lire: "X01" }, showIf: "X_arr", doneIf: "X01_done" },
        { id: "appareil", label: "l'appareil photo", x: 66, y: 40, w: 12, h: 42, actions: { regarder: "Xa" }, showIf: "X_arr" },
        { id: "fenetre", label: "la fenêtre", x: 83, y: 6, w: 16, h: 56, actions: { regarder: "Xf" }, showIf: "X_arr", lab: "r" }
      ]
    },
    finale: {
      name: "Musée d'Orsay · le stand du vendeur", bg: "bg_orsay", enter: [{ if: "finished", node: "Fr" }, { if: "W2_done", node: "F05" }, { if: "F04_done", node: "W2" }, { node: "F00" }],
      labels: [{ x: 46, y: 26.5, text: "Brocante du quai", cls: "paint big" }],
      hotspots: [
        { id: "delmas", label: "le vendeur", x: 41, y: 34, w: 28, h: 35.5, actions: { parler: "Fr" }, showIf: "finished" }
      ]
    }
  };
  /* Station je Knoten (für „hier geht es weiter“ und die Lehrkraftansicht) */
  G.homeScene = { O: "orsay", P: "pont", I: "invalides", C: "stand6", X: "petitpalais", W1: "stand6", F: "finale", W2: "finale", R1: "orsay", R2: "invalides", R3: "stand6", R4: "finale" };
  G.startScene = "orsay";
  G.start = "O00";

  /* ---------- Karte: das linke Seineufer zwischen Orsay und den Invalides ---------- */
  G.map = {
    title: "La promenade photo",
    svg:
      '<rect x="0" y="0" width="100" height="74" fill="#eef0e6"/>' +
      '<path d="M0 22 C 14 19, 26 24, 40 23 S 66 19, 80 24 S 94 30, 100 29" stroke="#9cc3d8" stroke-width="5" fill="none"/>' +
      '<path d="M27.5 15.5 L 31.5 31" stroke="#b9a77d" stroke-width="2.4"/>' +
      '<rect x="23" y="34" width="14" height="22" rx="1" fill="#dfe8d2" stroke="#b9c7a5" stroke-width=".4"/>' +
      '<path d="M22 61 h 10 v -3 a 5 5 0 0 1 10 0 v 3 h 10 v 5 h -30 z" fill="#d8d2bf" stroke="#b9b29b" stroke-width=".4" transform="translate(-12 -2)"/>' +
      '<rect x="64" y="28" width="16" height="7" rx="1" fill="#e2dccb" stroke="#b9b29b" stroke-width=".4"/>' +
      '<path d="M44 33 C 52 36, 58 34, 64 32" stroke="#c9bfa5" stroke-width=".7" stroke-dasharray="1.4 1" fill="none"/>' +
      '<path d="M30 36 C 30 42, 31 48, 31 54" stroke="#c9bfa5" stroke-width=".7" stroke-dasharray="1.4 1" fill="none"/>' +
      '<text x="88" y="21" font-size="2.6" fill="#6f8ea0" font-style="italic">la Seine</text>' +
      '<rect x="34.5" y="8.5" width="11" height="5" rx="1" fill="#e2dccb" stroke="#b9b29b" stroke-width=".4"/>' +   // Petit Palais (rechtes Ufer)
      '<path d="M27.5 15.5 C 30 14.5, 32.5 13, 34.5 12" stroke="#c9bfa5" stroke-width=".7" stroke-dasharray="1.4 1" fill="none"/>',
    places: [
      { id: "orsay", label: "Musée d'Orsay · la brocante du quai", short: "Orsay", q: "L'album du vendeur", x: 72, y: 37, unlock: "always", done: ["R1_done"], hideIf: "W1_done" },
      { id: "pont", label: "Pont Alexandre III", short: "Pont Alexandre III", q: "Le même endroit ?", x: 30, y: 23, labelAbove: true, unlock: "R1_done", lockedMsg: [{ if: "O06_done", fr: "D'abord, réponds à Marie." }], done: ["P_done"] },
      { id: "invalides", label: "Les Invalides · l'esplanade", short: "Invalides", q: "Les accessoires de Marcel", x: 18, y: 56, unlock: "R1_done", lockedMsg: [{ if: "O06_done", fr: "D'abord, réponds à Marie." }], done: ["I_done"] },
      { id: "petitpalais", label: "Le Petit Palais · « Paris en 1900 »", short: "Petit Palais (facultatif)", q: "De vraies photos de 1900", x: 40, y: 11, labelAbove: true, unlock: "X_open", hideUntil: "X_open", done: ["X_done"], optional: true },
      { id: "stand6", label: "Les Invalides · stand 6", short: "Stand 6", q: "Chloé, à 14 h", x: 42, y: 47, unlock: ["P_done", "I_done"], lockedMsg: "Pas encore. D'abord, le pont et les Invalides.", done: ["W1_done"] },
      { id: "finale", label: "Musée d'Orsay · le stand du vendeur", short: "Le stand du vendeur", q: "Rendez-vous à 14 h 45", x: 72, y: 37, unlock: "W1_done", hideUntil: "W1_done", done: ["F04_done"] }
    ]
  };

  /* ---------- Offene Abfragen: Wer auf eine Antwort wartet, meldet sich im leeren Dialogfeld ---------- */
  /* Fassung 1.2: Jede Abfrage stellt eine Figur, die die Antwort braucht (R1 M. Nowak per SMS, R2 die Bouquiniste).
     R3 ist in W1 aufgegangen, R4 entfällt. */
  G.pending = [
    { if: "O06_done", unless: "R1_done", scene: "orsay", who: "nowak", sms: true, fr: "Lino ? Kevin a une question.", node: "R1" },
    { if: "I05_done", unless: "R2_done", scene: "invalides", who: "bouquiniste", fr: "Et la photographe ? Qui est-ce ?", node: "R2" }
  ];

  /* ---------- Knoten ---------- */
  // Zeile: { who, fr, sms?, onlyIf?, from?, notFrom?, duo? (nur zu zweit) }
  // Auswahl: { fr, kind: ok|repair|wrong, reply: [Zeilen], next, effects }
  const N = {};
  const L = (who, fr, extra) => Object.assign({ who, fr }, extra || {});
  const lino = fr => L("lino", fr), marie = fr => L("marie", fr), narr = fr => L("narrateur", fr);
  const deuxVoix = L("narrateur", "Lisez à deux voix.", { duo: true });

  /* ===== 3 Auftakt am Musée d'Orsay (Lino ermittelt, Marie hilft) ===== */
  N.O00 = { type: "cut", bg: "bg_orsay", lines: [
    narr("Troisième jour à Paris. La classe 10b d'Erfurt sort du musée d'Orsay. Il est dix heures quarante-cinq. Aujourd'hui, M. Nowak a préparé une promenade photo."),
    L("nowak", "Vingt, vingt et un, vingt-deux. Tout le monde est là. On regarde les monuments, on prend des photos, et à midi, on mange ensemble aux Invalides. Une journée tranquille."),
    lino("Vous dites ça tous les matins."),
    marie("Aujourd'hui, on choisit nous-mêmes nos histoires."),
    L("nowak", "Très bien. Mais pas de guide avec un parapluie."),
    lino("Même gratuit ?")
  ], effects: { item: "telephone" }, next: "O01" };
  N.O01 = { type: "lines", lines: [
    L("delmas", "Bonjour ! Vous aimez les vieilles photos ? Regardez cet album : Paris en 1900. Les vrais souvenirs restent plus longtemps que les téléphones."),
    marie("On peut regarder ?"),
    L("delmas", "Bien sûr. Mais ne touchez pas les pages, s'il vous plaît."),
    lino("D'accord. Mes mains restent en 2026.")
  ], effects: { flag: "O01_done" }, doneAt: true };   // danach frei: das Album zuerst, dann der Händler und die Fiche
  N.O02 = { type: "task", title: "Un visage connu", help: "O02", diag: "D_O02",
    task: { kind: "loupe", render: "album", maxZoom: 5, status: "Sur la photo A : {n} sur {m}",
      intro: "Regardez les trois photos. Sur la photo A, trouvez le visage et la montre du monsieur.",
      points: [
        { id: "visage", need: true, chip: "le visage", photo: "P17", x: 39, y: 20.5, w: 8, h: 12.5, lines: [lino("Marie ! Le monsieur sur la photo A, c'est Lucien ! Notre voleur… Non. Attends. On regarde d'abord."), marie("C'est ma phrase, ça."), lino("Je l'ai apprise à Montmartre.")] },
        { id: "montre", need: true, chip: "la montre", photo: "P17", x: 42, y: 46.5, w: 9.5, h: 8, line: marie("La même montre, peut-être.") },
        { id: "lucien_c", neutral: true, photo: "P19", x: 22, y: 11, w: 20, h: 72.5, line: lino("Encore le même monsieur. Mais regarde d'abord la photo A.") },
        { id: "baguette", neutral: true, photo: "P18", x: 43.5, y: 21.5, w: 20, h: 11, line: lino("Une baguette avec du ruban adhésif ? Bizarre.") },
        { id: "brun_a", neutral: true, weak: true, photo: "P17", x: 11, y: 7, w: 64, h: 93, line: marie("La couleur peut être ancienne. Ou ajoutée.") },
        { id: "brun_b", neutral: true, weak: true, photo: "P18", x: 10, y: 0, w: 90, h: 100, line: marie("La couleur peut être ancienne. Ou ajoutée.") },
        { id: "brun_c", neutral: true, weak: true, photo: "P19", x: 18, y: 0, w: 62, h: 83.8, line: marie("La couleur peut être ancienne. Ou ajoutée.") }
      ],
      material: [{ photo: "P17", x: 37, y: 19, w: 16, h: 37 }] },
    after: [
      lino("En 1900, il avait déjà la même moustache."),
      marie("Ça lui ressemble. Mais un visage, ce n'est pas une date."),
      marie("On prend des photos pour comparer ?"),
      L("delmas", "Vous pouvez photographier les trois pages. Sans flash.")
    ],
    effects: { items: ["photo_a", "photo_b", "photo_c"], flag: "O02_done" }, doneAt: true };
  N.O03 = { type: "task", title: "Des questions au vendeur", help: "O03", diag: "D_O03",
    task: { kind: "ask", who: "delmas", asker: "lino", intro: "Posez des questions au vendeur. Il vous faut deux informations sur les photos.",
      progress: "Informations : {n} sur {m}", facts: ["F1", "F2"],
      questions: [
        { q: "L'album est vieux ?", a: "Oui.", yn: true },
        { q: "L'album a quel âge ?", a: "Plus de cent ans. Regardez la couverture.", w: true },
        { q: "Les photos sont vieilles ?", a: "Oui.", yn: true },
        { q: "Quand est-ce qu'on a pris les photos ?", a: "En 1900. Les trois.", fact: "F1", w: true },
        { q: "Ce sont des photos originales ?", a: "Oui.", yn: true },
        { q: "Quelles photos est-ce que vous vendez ?", a: "Des photos originales de 1900. Pas des copies.", fact: "F2", w: true },
        { q: "Les photos viennent d'où ?", a: "J'ai acheté beaucoup de vieilles choses. Je ne connais pas l'histoire de chaque objet.", w: true },
        { q: "Vous connaissez cet homme ?", a: "Non. Un voyageur de 1900. Il est mort depuis longtemps, je pense.", yn: true, also: L("lino", "(tout bas) Hier, il allait très bien.") }
      ],
      ynHint: marie("Il répond seulement à ta question."),
      ynPause: L("delmas", "Excusez-moi, j'ai un client. Revenez dans une minute."), ynPauseMs: 60000,
      success: [marie("Alors, vous vendez un vieux livre. Et vous dites aussi : les trois photos sont de 1900."), L("delmas", "Exactement. Tout est écrit ici.")] },
    effects: { flag: "O03_done" }, doneAt: true, next: [{ if: "O04_done", node: "O05" }] };
  N.O04d = { type: "doc", title: "La fiche de vente", icon: "fiche",
    doc: "Album Paris 1900\nCouverture et pages anciennes\nTrois photographies prises en 1900\nPhotos originales, pas des copies\nPrix : 180 €\nVendeur : Victor Delmas",
    effects: { item: "fiche_vente" }, next: "O04" };
  N.O04 = { type: "task", title: "La fiche de vente", help: "O04", diag: "D_O04",
    task: { kind: "pick", n: 2, question: "Qu'est-ce que le vendeur promet sur les photos ? Choisissez deux phrases.",
      options: [
        { id: "date", label: "On a pris les photos en 1900.", ok: true },
        { id: "originales", label: "Ce sont des photos originales, pas des copies.", ok: true },
        { id: "couverture", label: "La couverture est vieille.", reply: marie("C'est écrit. Mais c'est le livre, pas les photos.") },
        { id: "pages", label: "Toutes les pages sont originales.", reply: marie("Les pages, c'est le livre. On parle des photos.") },
        { id: "voyage", label: "Lucien a fait un voyage dans le temps.", reply: lino("C'était une blague. Pas une promesse.") }
      ],
      matText: "La fiche de vente : « Album Paris 1900 · Couverture et pages anciennes · Trois photographies prises en 1900 · Photos originales, pas des copies · Prix : 180 € · Vendeur : Victor Delmas »",
      wrong: marie("Pas encore.") },
    effects: { flag: "O04_done" }, doneAt: true, next: [{ if: "O03_done", node: "O05" }] };
  /* Fassung 1.2: M. Nowak will das Album kaufen, mit dem Geld der Klasse, das Lino und Marie gestern zurückgeholt haben */
  N.O05 = { type: "lines", lines: [
    narr("M. Nowak arrive avec la classe. Il regarde l'album."),
    L("nowak", "Paris en 1900 ! Pour notre école, c'est un beau cadeau. Avec l'argent de la visite d'hier, on peut l'acheter."),
    lino("Hier, notre argent est revenu. Et aujourd'hui, il repart ?"),
    L("delmas", "Cent quatre-vingts euros, monsieur. C'est un bon prix."),
    L("nowak", "Attendez… Ce monsieur, c'est notre guide d'hier !"),
    lino("Oui. Il voyage beaucoup."),
    L("delmas", "Un voyageur de 1900, monsieur. Il ressemble à beaucoup de gens."),
    L("nowak", "Hmm. Je reviens à quinze heures pour payer. Vous gardez l'album pour moi ?"),
    L("delmas", "Bien sûr. Jusqu'à quinze heures."),
    L("nowak", "Lino, Marie : vous vérifiez pour moi ? Vous êtes mes détectives. Moi, je reste avec la classe.")
  ], next: "O05q" };
  /* Die Bouquiniste bleibt als Fachfrau, die an den Fotos zweifelt */
  N.O05q = { type: "lines", lines: [
    L("bouquiniste", "Tiens ! Les deux jeunes du monsieur au parapluie rouge ! Vous regardez cet album, vous aussi ?", { onlyIf: "t2_B" }),
    L("bouquiniste", "Bonjour ! Vous regardez cet album, vous aussi ?", { onlyIf: "!t2_B" }),
    marie("Notre professeur veut l'acheter. Vous connaissez les vieux livres ?"),
    L("bouquiniste", "C'est mon travail. La couverture est vraiment vieille. Mais les photos… je ne sais pas."),
    L("bouquiniste", "D'habitude, je vends mes livres sur le quai, près de Notre-Dame. Aujourd'hui, j'ai un stand aux Invalides. Il ouvre à onze heures. Venez me dire ce que vous trouvez."),
    lino("On a déjà trouvé un monsieur qui était vieux avant de naître."),
    L("bouquiniste", "Alors, vérifiez. Un titre, ce n'est pas une preuve."),
    narr("Elle donne un programme à Marie.")
  ], next: "O05d" };
  N.O05d = { type: "doc", title: "Le programme", icon: "fiche",
    doc: "Les Images de Paris\nAujourd'hui\nPont Alexandre III : information\nEsplanade des Invalides : livres et costumes\nMarcel Blanchard : accessoires de théâtre, le matin\nChloé : photos, à partir de 14 h, stand 6",
    effects: { item: "programme" }, next: "O05b" };
  N.O05b = { type: "lines", lines: [
    marie("Marcel ! Sur la photo B, il y a un boulanger avec une baguette. Et Marcel a des baguettes en plastique."),
    L("marie", "Nous vérifions les photos de l'album. Nous suivons la promenade et nous allons aux Invalides.", { sms: true }),
    L("nowak", "D'accord. Regardez aussi la fiche sur Orsay. Je vous l'ai donnée ce matin.", { sms: true })
  ], next: "O06" };
  N.O06 = { type: "task", title: "Une gare avant un musée", help: "O06", diag: "D_O06", doneAt: true,
    task: { kind: "cols", intro: "Lisez la fiche. Rangez les cinq phrases.", docIcon: "fiche",
      doc: "La gare d'Orsay\nEn 1900, il y avait une grande exposition à Paris : l'Exposition universelle. Pour cette exposition, on a construit une gare. Les gens prenaient le train ici. En 1986, la gare est devenue un musée : le musée d'Orsay. Aujourd'hui, on regarde des tableaux ici. Le bâtiment est vieux, mais ce n'est plus une gare.",
      columns: [{ id: "oui", label: "Le document dit oui" }, { id: "non", label: "Le document dit non" }, { id: "rien", label: "Le document ne dit rien" }],
      cards: [
        { id: "c1", label: "Le bâtiment existait en 1900.", col: "oui" },
        { id: "c2", label: "En 1900, c'était déjà un musée.", col: "non" },
        { id: "c3", label: "La légende de la photo A est juste.", col: "non" },
        { id: "c4", label: "On a pris la photo A en 2025.", col: "rien", trap: marie("On a trouvé une erreur dans la légende. Pas encore la date des photos.") },
        { id: "c5", label: "Toutes les photos de l'album sont fausses.", col: "rien", trap: marie("On a trouvé une erreur dans la légende. Pas encore la date des photos.") }
      ],
      wrong: marie("Pas encore. Relis la fiche.") },
    after: [lino("Le bâtiment est vieux. Mais la légende raconte n'importe quoi.")],
    effects: { item: "fiche_orsay", flag: "O06_done" }, next: "R1" };
  /* Nebenbemerkungen nach dem Auftakt */
  N.Or = { type: "lines", amb: true, lines: [L("delmas", "Tout est sur la fiche. Un vrai trésor !")], next: "RESUME" };
  N.Oa = { type: "doc", amb: true, title: "L'album", render: "album", next: "RESUME" };
  N.Of = { type: "doc", amb: true, title: "La fiche de vente", icon: "fiche", doc: "Album Paris 1900\nCouverture et pages anciennes\nTrois photographies prises en 1900\nPhotos originales, pas des copies\nPrix : 180 €\nVendeur : Victor Delmas", next: "RESUME" };
  N.Ob = { type: "lines", amb: true, lines: [lino("Une brocante. On vend des vieilles choses. Des vraies, j'espère.")], next: "RESUME" };
  N.Orp = { type: "lines", amb: true, lines: [marie("C'est le responsable de la brocante. Il regarde tous les stands.")], next: "RESUME" };
  /* Fassung 1.3: Bemerkungen in der freien Station; der Händler und die Fiche warten auf das Album */
  N.Ox = { type: "lines", amb: true, lines: [L("delmas", "Regardez d'abord l'album. Après, je réponds à vos questions.")], next: "RESUME" };
  N.Oxf = { type: "lines", amb: true, lines: [marie("C'est la fiche de vente de l'album. Regardons d'abord l'album.")], next: "RESUME" };
  N.Oh = { type: "lines", amb: true, lines: [marie("Une horloge de gare. Avant, ici, il y avait des trains.")], next: "RESUME" };
  N.Oc = { type: "lines", amb: true, lines: [lino("Un appareil photo de 1900 ?"), L("delmas", "Presque. De 1950. Mais il est beau.")], next: "RESUME" };

  /* ===== 4 Spuren am Pont Alexandre III (Marie ermittelt, Lino hilft) ===== */
  /* Fassung 1.3: Ankunft, dann frei. Erst der Pont (P00 bis P01), dann die Assistentin (P02 bis P03b) */
  N.Pa = { type: "lines", lines: [
    narr("Le pont Alexandre III. Au point d'information, une femme tient un plan."),
    marie("La photo B, c'est ici. Peut-être.")
  ], effects: { flag: "P_arr" }, doneAt: true };
  N.P00 = { type: "lines", lines: [
    narr("Marie compare la photo B avec le pont."),
    marie("Le pont existait déjà en 1900. Alors, le lieu est peut-être juste."),
    lino("Enfin quelqu'un qui ne ment pas sur son âge. Le pont.")
  ], next: "P00t" };
  N.P00t = { type: "task", title: "Le même endroit", help: "P00", diag: "D_P00",
    task: { kind: "compare", both: true, status: "Sur les deux images : {n} sur {m}",
      intro: "Qu'est-ce que vous voyez sur les deux images ? Choisissez trois choses.",
      images: [{ label: "La photo B", photo: "P18" }, { label: "Le pont aujourd'hui", img: "doc_pont", ar: 1.5 }],
      points: [
        { id: "lampadaires", need: true, chip: "les lampadaires", img: 0, rects: [{ x: 66.5, y: 4.5, w: 14, h: 46 }, { x: 13.5, y: 3.5, w: 14, h: 47 }], line: lino("Les mêmes lampadaires.") },
        { id: "lampadaires", img: 1, rects: [{ x: 58.5, y: 8.5, w: 10.5, h: 32.5 }, { x: 16, y: 10, w: 10, h: 31 }] },
        { id: "colonnes", need: true, chip: "les colonnes", img: 0, x: 82, y: 14, w: 18, h: 40, line: lino("Les mêmes colonnes.") },
        { id: "colonnes", img: 1, x: 78, y: 13.5, w: 17, h: 37.5 },
        { id: "statues", need: true, chip: "les statues", img: 0, x: 86, y: 0.5, w: 11, h: 13.5, line: lino("Et les mêmes statues.") },
        { id: "statues", img: 1, x: 82, y: 0.5, w: 11.5, h: 13.5 },
        { id: "bateau", no: true, img: 1, x: 12, y: 66.5, w: 43.5, h: 18, line: lino("Ça, c'est seulement sur l'image d'aujourd'hui.") },
        { id: "velo", no: true, img: 1, x: 70, y: 65.5, w: 26, h: 27, line: lino("Ça, c'est seulement sur l'image d'aujourd'hui.") }
      ],
      material: [{ img: 0, x: 12, y: 0, w: 88, h: 55 }, { img: 1, x: 14, y: 0, w: 82, h: 52 }],
      success: marie("Le même endroit, ce n'est pas la même année.") },
    next: "P01" };
  N.P01 = { type: "task", title: "Le pain qui ne vieillit pas", help: "P01", diag: "D_P01",
    task: { kind: "loupe", render: "crop", photo: "P18", maxZoom: 5, status: "La baguette : {n} sur {m}",
      intro: "Regardez la photo B de près. Trouvez trois détails sur la baguette.",
      points: [
        { id: "bout", need: true, chip: "le bout cassé", photo: "P18", x: 43.6, y: 25.3, w: 3, h: 6.6, line: marie("Le bout est cassé.") },
        { id: "ruban", need: true, chip: "le ruban adhésif", photo: "P18", x: 46.6, y: 24.2, w: 4, h: 7, lines: [lino("Regarde ce pain. Il a trois pansements."), marie("Du pain avec du ruban adhésif ?")] },
        { id: "gant", need: true, chip: "le gant blanc", photo: "P18", x: 57.2, y: 23, w: 4.3, h: 10.5, line: marie("Un gant blanc. Comme au théâtre.") },
        { id: "pied", chip: "le bord", photo: "P18", x: 10, y: 80, w: 6.8, h: 16, flag: "pied_vu", line: marie("Qu'est-ce que c'est, au bord ? On ne voit pas tout.") },
        { id: "boulanger", neutral: true, photo: "P18", x: 32.5, y: 5.5, w: 28.5, h: 91.5, line: lino("Le boulanger. Regarde son pain.") }
      ],
      material: [{ photo: "P18", x: 43, y: 21, w: 19.5, h: 13 }] },
    after: [marie("Un vrai pain, on ne le répare pas. C'est un accessoire de théâtre."), lino("Marcel avait des baguettes en plastique. Et des problèmes de sac.")],
    effects: { flag: "P01_done" }, doneAt: true };
  N.P02 = { type: "choice", who: "assistante", diag: "D_P02",
    lines: [
      narr("C'est l'assistante du Louvre. Marie lui montre la photo B."),
      L("assistante", "Ah ! Les jeunes de Montmartre ! Vous avez retrouvé votre sac ?"),
      lino("Oui. Il s'appelle Bernd. Il est avec la classe.")
    ],
    prompt: L("assistante", "Et maintenant, vous avez une photo de la compagnie. Vous cherchez qui ?"),
    choices: [
      { fr: "La personne qui connaît cette baguette.", kind: "ok", effects: { flag: "p02_marcel" }, reply: [L("assistante", "Marcel, alors. Il est aux Invalides, avec les accessoires.")] },
      { fr: "La personne qui a pris la photo.", kind: "ok", effects: { flag: "p02_chloe" }, reply: [L("assistante", "Chloé. Elle arrive à quatorze heures, au stand 6. C'est sur le programme.")] },
      { fr: "Un train pour 1900.", kind: "repair", reply: [L("assistante", "Il part tous les cent ans. Vous l'avez manqué.")] }
    ],
    next: "P02b" };
  /* Nach A oder B stellt Marie die andere Frage auch */
  N.P02b = { type: "choice", who: "assistante",
    prompt: marie("Et encore une question :"),
    choices: [
      { fr: "La personne qui connaît cette baguette.", kind: "ok", onlyIf: "!p02_marcel", reply: [L("assistante", "Marcel, alors. Il est aux Invalides, avec les accessoires.")] },
      { fr: "La personne qui a pris la photo.", kind: "ok", onlyIf: "!p02_chloe", reply: [L("assistante", "Chloé. Elle arrive à quatorze heures, au stand 6. C'est sur le programme.")] }
    ],
    next: "P02c" };
  N.P02c = { type: "lines", lines: [marie("L'un connaît l'objet. L'autre connaît la photo. Il nous faut les deux.")], next: "P03a" };
  N.P03a = { type: "audio", audio: "au_assistante", title: "Un souvenir", intro: "L'assistante se souvient. Écoutez bien.", transcriptHelp: "P03", next: "P03" };
  N.P03 = { type: "task", title: "Un souvenir", audio: "au_assistante", listenFirst: true, help: "P03", diag: "D_P03",
    task: { kind: "chain", intro: "Écoutez. Mettez les phrases dans l'ordre.", words: [],
      items: [
        { parts: ["La compagnie fait des photos en costumes."] },
        { parts: ["La baguette tombe."] },
        { parts: ["Marcel ramasse la baguette."] },
        { parts: ["Chloé recommence la photo."] }
      ],
      wrong: lino("Pas encore. Écoute encore.") },
    next: "P03b" };
  N.P03b = { type: "task", title: "Un souvenir", audio: "au_assistante", help: "P03b", diag: "D_P03b", doneAt: true,
    task: { kind: "pick", n: 1, question: "Qu'est-ce que l'assistante ne sait pas ?",
      options: [
        { id: "date", label: "la date exacte des photos", ok: true },
        { id: "costumes", label: "les costumes", reply: lino("Ça, elle le raconte.") },
        { id: "baguette", label: "la baguette qui tombe", reply: lino("Ça, elle le raconte.") }
      ],
      wrong: lino("Pas encore."), success: lino("Elle raconte un souvenir. Et elle dit aussi ce qu'elle ne sait pas.") },
    effects: { flag: "P_done" }, next: "P04" };
  /* Fassung 1.3: Tipp für den freiwilligen Nebenweg zum Petit Palais */
  N.P04 = { type: "lines", doneAt: true, lines: [
    L("assistante", "Vous aimez 1900 ? Le Petit Palais est juste à côté. On l'a construit pour l'Exposition universelle de 1900. Aujourd'hui, il y a une petite exposition : « Paris en 1900 ». Et l'entrée est gratuite."),
    lino("Gratuit ? J'adore 1900."),
    marie("Ce n'est pas obligatoire. Mais là-bas, il y a peut-être de vraies photos de 1900.")
  ], effects: { flag: "X_open" }, next: [{ if: "I_done", node: "LUNCH" }, { node: "MAP" }] };
  N.Pr = { type: "lines", amb: true, lines: [L("assistante", "Chloé arrive à quatorze heures. Elle est toujours à l'heure. Moi, jamais."),
    L("assistante", "Et le Petit Palais, c'est juste à côté.", { onlyIf: ["X_open", "!X_done"] })], next: "RESUME" };
  N.Px = { type: "lines", amb: true, lines: [
    L("assistante", "Un moment, s'il vous plaît !"),
    narr("Elle cherche une rue sur son plan."),
    lino("Elle est occupée. On regarde d'abord la photo B ?")
  ], next: "RESUME" };
  N.Ppc = { type: "lines", amb: true, lines: [lino("Des cartes postales du pont. Sans boulanger.")], next: "RESUME" };
  N.Pp = { type: "lines", amb: true, lines: [marie("Les lampadaires, les colonnes, les statues : tout ça existait déjà en 1900.")], next: "RESUME" };

  /* ===== Nebenweg: das Petit Palais (freiwillig, Lino ermittelt, Marie hilft) ===== */
  N.X00 = { type: "cut", bg: "bg_petitpalais", lines: [
    narr("Le Petit Palais. Un palais de 1900, avec un jardin et beaucoup d'or. Dans une salle, il y a une petite exposition : « Paris en 1900 »."),
    lino("De vraies photos de 1900 ! Enfin."),
    marie("Alors, regarde bien. C'est quoi, une vraie photo de 1900 ?")
  ], effects: { flag: "X_arr" }, doneAt: true };   // danach frei: die Vitrine (X02, X03), dazu Panneau, Appareil photo und Fenster
  N.X01 = { type: "doc", amb: true, title: "Le panneau de l'exposition", icon: "fiche", next: "RESUME",
    doc: "Paris en 1900\nEn 1900, il y avait l'Exposition universelle à Paris. Pendant sept mois, cinquante millions de visiteurs sont venus. Pour l'exposition, on a construit le Grand Palais, le Petit Palais, le pont Alexandre III et la gare d'Orsay.\nLes photographes de 1900 travaillaient avec de grands appareils en bois. Les photos étaient brunes ou grises. Souvent, on les collait sur un carton.",
    effects: { flag: "X01_done" } };
  N.X02 = { type: "lines", lines: [
    narr("Dans la vitrine, il y a une vraie photo de 1900 : le pont Alexandre III pendant l'Exposition universelle."),
    lino("Le même pont que sur la photo B ! On compare ?")
  ], next: "X03" };
  N.X03 = { type: "task", title: "Deux photos du pont", help: "X03", diag: "D_X03", doneAt: true,
    task: { kind: "cols", show: "pair",
      pair: [{ img: "doc_1900", carton: true, caption: "La vraie photo de 1900 (Petit Palais)" }, { photo: "P18", caption: "La photo B de l'album" }],
      intro: "Pour chaque phrase : c'est sur la vraie photo de 1900, sur la photo B ou sur les deux ?",
      columns: [{ id: "vraie", label: "La vraie photo" }, { id: "b", label: "La photo B" }, { id: "deux", label: "Les deux" }],
      cards: [
        { id: "x1", label: "On voit le pont Alexandre III.", col: "deux" },
        { id: "x2", label: "La photo est brune.", col: "deux", trap: lino("Regarde bien : les deux photos sont brunes.") },
        { id: "x3", label: "Les gens portent des vêtements de 1900.", col: "deux", trap: marie("Sur la photo B aussi. Mais ce sont peut-être des costumes.") },
        { id: "x4", label: "Il y a beaucoup de monde.", col: "vraie" },
        { id: "x5", label: "Un boulanger pose avec une baguette.", col: "b" },
        { id: "x6", label: "La photo est collée sur un carton.", col: "vraie" }
      ],
      wrong: marie("Pas encore. Compare les deux photos, phrase par phrase.") },
    after: [
      lino("Brune, avec des vêtements de 1900… Ça, on peut le faire aujourd'hui aussi."),
      marie("Oui. Une vraie photo de 1900, ce n'est pas seulement une photo brune."),
      narr("À la sortie, il y a des cartes postales de l'exposition. Elles sont gratuites."),
      lino("Je prends la vraie photo de 1900. Pour M. Nowak."),
      marie("Bon. Maintenant, on retourne à notre enquête.")
    ],
    effects: { item: "carte_1900", flag: "X_done" }, next: "MAP" };
  N.Xv = { type: "lines", amb: true, lines: [marie("La vraie photo de 1900. Beaucoup de monde, et pas de boulanger.")], next: "RESUME" };
  N.Xa = { type: "lines", amb: true, lines: [lino("Ça, c'est un vrai appareil photo de 1900. Il est en bois, et il est grand comme une valise !"), marie("Et il n'a pas d'écran. On ne voit pas tout de suite la photo.")], next: "RESUME" };
  N.Xf = { type: "lines", amb: true, lines: [lino("D'ici, on voit le pont Alexandre III. Il a cent vingt-six ans, et il va très bien.")], next: "RESUME" };
  N.Xr = { type: "lines", amb: true, lines: [lino("On a déjà notre vraie photo de 1900. On retourne à l'enquête ?")], next: "RESUME" };

  /* ===== 5 Marcel an den Invalides (Lino ermittelt, Marie hilft) ===== */
  /* Fassung 1.3: Ankunft, dann frei: Marcel (I00m bis I02) und der Tisch mit den Requisiten (I03p, I03) in beliebiger Reihenfolge.
     Sind beide erledigt, kommt die Bouquiniste (I05). */
  N.I00 = { type: "lines", lines: [
    narr("L'esplanade des Invalides. Il y a des stands : des livres, des costumes, des accessoires."),
    marie("Ici, il y a la bouquiniste. Et peut-être Marcel.")
  ], effects: { flag: "I_arr" }, doneAt: true };
  N.I00m = { type: "lines", lines: [
    L("marcel", "Mes amis ! Et le sac en forme de pain, il va bien ?"),
    lino("Il préfère rester avec la classe."),
    lino("Sans maquillage, je ne vous reconnais pas."),
    L("marcel", "Moi non plus. Le matin, dans le miroir…"),
    marie("Aujourd'hui, on cherche l'âge d'une photo."),
    L("marcel", "Ça change. Montrez.")
  ], next: "I01" };
  N.I01 = { type: "lines", lines: [
    deuxVoix,
    narr("Marie montre les photos A, B et C."),
    L("marcel", "Ah oui. Lucien. Il jouait le voyageur."),
    lino("Il joue beaucoup de rôles. Hier, il était guide officiel."),
    L("marcel", "Guide officiel ? Lucien ? Ça ne m'étonne pas. Mais ces photos, c'était avant. L'année dernière, il a fait une séance photo avec nous. Chloé a pris les photos."),
    L("marcel", "Et le boulanger, c'est moi. Sans maquillage."),
    marie("Alors, Lucien est sur les photos. Mais ça ne montre pas qu'il travaille avec le vendeur."),
    L("marcel", "Exactement. Et votre vendeur, je ne le connais pas.")
  ], next: "I01t" };
  N.I01t = { type: "task", title: "Le voyageur Lucien", help: "I01", diag: "D_I01",
    task: { kind: "pick", n: 2, question: "Qu'est-ce que Marcel sait ? Choisissez deux phrases.",
      options: [
        { id: "acteur", label: "Lucien était un acteur sur ces photos.", ok: true },
        { id: "seance", label: "La séance photo était l'année dernière.", ok: true },
        { id: "album", label: "Lucien a fait l'album.", reply: marie("Marcel n'a pas dit ça.") },
        { id: "delmas", label: "Victor Delmas travaille avec la compagnie.", reply: marie("Marcel n'a pas dit ça.") },
        { id: "invalides", label: "Lucien travaille aujourd'hui aux Invalides.", reply: marie("Marcel n'a pas dit ça.") }
      ],
      matText: "Marcel : « Ah oui. Lucien. Il jouait le voyageur. » … « L'année dernière, il a fait une séance photo avec nous. Chloé a pris les photos. »",
      wrong: marie("Pas encore.") },
    next: "I02a" };
  N.I02a = { type: "audio", audio: "au_marcel", title: "La baguette cassée", intro: "Marcel raconte. Écoutez bien.", transcriptHelp: "I02", next: "I02" };
  N.I02 = { type: "task", title: "La baguette cassée", audio: "au_marcel", listenFirst: true, help: "I02", diag: "D_I02",
    task: { kind: "gap", intro: "Écoutez. Choisissez une réponse pour chaque question.",
      parts: [
        "Quand est-ce que c'était ? ", { id: "quand", opts: ["en septembre, l'année dernière", "hier", "en 1900"], answer: "en septembre, l'année dernière" }, "\n",
        "Pourquoi est-ce que le bout s'est cassé ? ", { id: "pourquoi", opts: ["La baguette est tombée.", "Lucien a marché dessus.", "Marcel a coupé le bout."], answer: "La baguette est tombée." }, "\n",
        "Comment est-ce que Marcel l'a réparé ? ", { id: "comment", opts: ["avec trois morceaux de ruban adhésif", "avec deux clous", "avec de la colle"], answer: "avec trois morceaux de ruban adhésif" }
      ],
      wrong: marie("Pas encore. Écoute encore.") },
    after: [
      L("marie", "On peut la comparer avec notre photo ?", { onlyIf: "!I03_done" }),
      L("marcel", "Oui. Vous pouvez la prendre en photo. Mais elle reste ici : elle travaille cet après-midi.", { onlyIf: "!I03_done" }),
      // schon verglichen (Tisch zuerst): jetzt kennt man das Datum der Reparatur
      L("lino", "Septembre, l'année dernière : c'est la date de la réparation. Alors, la photo B est de septembre de l'année dernière. Ou plus tard.", { onlyIf: "I03_done" }),
      L("marie", "Pour les deux autres photos, on doit voir la photographe.", { onlyIf: "I03_done" }),
      L("marcel", "Pour faire vieux, un peu de couleur suffit. Pour avoir raison, il faut plus de travail.", { onlyIf: "I03_done" })
    ],
    effects: { item: "photo_baguette", flag: "I02_done" }, doneAt: true, next: [{ if: "I03_done", node: "I05" }] };
  /* Der Tisch mit den Requisiten: vor oder nach Marcel */
  N.I03p = { type: "lines", lines: [
    narr("Sur la table, il y a des accessoires de théâtre : une malle, des chapeaux et des baguettes."),
    L("marie", "Une baguette avec du ruban adhésif ! Comme sur la photo B.", { onlyIf: "!I02_done" }),
    L("lino", "Je la prends en photo. Pour comparer.", { onlyIf: "!I02_done" }),
    L("marie", "Voilà la baguette de Marcel. On compare ?", { onlyIf: "I02_done" })
  ], effects: { item: "photo_baguette" }, next: "I03" };
  N.I03 = { type: "task", title: "La même baguette", help: "I03", diag: "D_I03", doneAt: true,
    task: { kind: "compare", both: true, maxZoom: 5, status: "Pareil sur les deux photos : {n} sur {m}",
      intro: "Comparez la photo B et la photo de la baguette. Trouvez deux détails pareils.",
      images: [{ label: "La photo B", photo: "P18" }, { label: "La photo de la baguette", img: "doc_baguette", ar: 1.7769 }],
      points: [
        { id: "bout", need: true, chip: "le bout cassé", img: 0, x: 43.6, y: 25.3, w: 3, h: 6.6, line: marie("Oui. Le même bout.") },
        { id: "bout", img: 1, x: 5, y: 35, w: 12.5, h: 27 },
        { id: "ruban", need: true, chip: "les trois morceaux de ruban adhésif", img: 0, x: 46.6, y: 24.2, w: 4, h: 7, line: marie("Oui. Le même ruban.") },
        { id: "ruban", img: 1, x: 18.5, y: 34, w: 19, h: 28 },
        { id: "couleur", no: true, img: 1, x: 38, y: 36, w: 57, h: 25, line: marie("Ça peut changer. Cherche un détail de la baguette.") },
        { id: "fond", neutral: true, weak: true, img: 1, x: 0, y: 0, w: 100, h: 100, line: marie("Ça peut changer. Cherche un détail de la baguette.") }
      ],
      material: [{ img: 0, x: 43, y: 22, w: 9, h: 11 }, { img: 1, x: 3, y: 32, w: 36, h: 32 }],
      success: lino("Le même bout cassé. Les mêmes trois morceaux de ruban. C'est sa baguette.") },
    after: [
      L("marie", "La photo B ne peut pas être plus vieille que la réparation. Pour les deux autres, on doit voir la photographe.", { onlyIf: "I02_done" }),
      L("lino", "Alors, la photo B est de septembre de l'année dernière. Ou plus tard.", { onlyIf: "I02_done" }),
      L("marcel", "Pour faire vieux, un peu de couleur suffit. Pour avoir raison, il faut plus de travail.", { onlyIf: "I02_done" }),
      // Tisch vor Marcel: das Datum der Reparatur fehlt noch, die Fotografin kennt man vielleicht noch nicht
      L("marie", "La photo B ne peut pas être plus vieille que la réparation. Pour les deux autres, on doit voir la personne qui a pris les photos.", { onlyIf: "!I02_done" }),
      L("lino", "Et la réparation, c'était quand ? Marcel le sait, peut-être.", { onlyIf: "!I02_done" })
    ],
    effects: { item: "photo_baguette", flag: "I03_done" }, next: [{ if: "I02_done", node: "I05" }] };
  N.I05 = { type: "choice", who: "bouquiniste", help: "I05", diag: "D_I05", doneAt: true,
    lines: [narr("Au stand de la bouquiniste.")],
    prompt: L("bouquiniste", "Alors ? L'album de votre professeur, il est vraiment de 1900 ?"),
    choices: [
      { fr: "Tout est faux, même la couverture.", kind: "wrong", reply: [L("bouquiniste", "Attention. La couverture, je l'ai regardée. Elle est vraiment vieille.")] },
      { fr: "La légende de la photo A est fausse. Et Marcel reconnaît sa baguette sur la photo B. Maintenant, on attend la photographe.", kind: "ok", reply: [
        L("bouquiniste", "Une photographe ? Bien. Je veux savoir qui c'est.")
      ] },
      { fr: "Lucien est sur une photo. Alors, le vendeur travaille avec lui.", kind: "wrong", reply: [L("bouquiniste", "Ça, ce n'est pas une preuve.")] }
    ],
    effects: { flag: "I05_done" }, next: "R2" };
  /* Freiwillig: die Tempusübung am Tisch mit den Requisiten (öffnet keinen Ort) */
  N.Itemps = { type: "task", amb: true, title: "Marcel raconte", help: "Itemps", diag: "D_Itemps",
    task: { kind: "gap", intro: "Marcel raconte. Choisissez la bonne forme.",
      parts: [
        "Marcel ", { id: "t1", opts: ["faisait", "a fait"], answer: "faisait" }, " le boulanger. Il ", { id: "t2", opts: ["tenait", "a tenu"], answer: "tenait" },
        " une baguette. Tout à coup, elle ", { id: "t3", opts: ["tombait", "est tombée"], answer: "est tombée" }, ". Alors, il ",
        { id: "t4", opts: ["mettait", "a mis"], answer: "a mis" }, " trois morceaux de ruban adhésif."
      ],
      wrong: marie("M. Nowak dit toujours : c'est le décor ou l'action ?") },
    effects: { flag: "Itemps_done" }, next: "RESUME" };
  N.Ir = { type: "lines", amb: true, lines: [L("marcel", "Chloé a les photos entières. Moi, j'ai seulement de bons souvenirs.")], next: "RESUME" };
  N.Ib = { type: "lines", amb: true, lines: [L("bouquiniste", "Votre professeur n'a encore rien payé ? Bien. Sans preuves, on ne paie pas.")], next: "RESUME" };
  /* Fassung 1.3: Bemerkungen in der freien Station */
  N.Ir2 = { type: "lines", amb: true, lines: [L("marcel", "Ma baguette est là, sur la table. Elle travaille cet après-midi.")], next: "RESUME" };
  N.Ibx = { type: "lines", amb: true, lines: [L("bouquiniste", "Ah, vous êtes là ! Cherchez d'abord. Après, vous me racontez.")], next: "RESUME" };
  N.It = { type: "lines", amb: true, lines: [lino("Des baguettes en plastique. Elles ne vieillissent jamais.")], next: "RESUME" };
  N.Im = { type: "lines", amb: true, lines: [lino("Une malle de voyage. Pour un voyageur de 1900."), marie("Ou pour un voyageur de théâtre.")], next: "RESUME" };
  N.Ich = { type: "lines", amb: true, lines: [lino("Avec ce chapeau, je suis de 1900 ?"), marie("Non. Tu as ton téléphone dans la main.")], next: "RESUME" };

  /* Mittag: sichtbarer Zeitsprung, sobald Pont und Invalides erledigt sind */
  N.LUNCH = { type: "cut", bg: "cut_dejeuner", lines: [
    narr("Midi. La classe mange ensemble sur l'esplanade des Invalides."),
    L("nowak", "Vingt, vingt et un, vingt-deux. Bon appétit !"),
    lino("Une vraie baguette. Sans ruban adhésif."),
    L("nowak", "Alors, mes détectives ? À quinze heures, je paie ?"),
    marie("Pas encore. D'abord, Chloé, à quatorze heures."),
    narr("Après, il est presque quatorze heures.")
  ], next: "GO_stand6" };

  /* ===== 6 Chloé und die vollständigen Fotos (Marie ermittelt, Lino hilft) ===== */
  N.C00 = { type: "lines", lines: [
    narr("Quatorze heures. Au stand 6, Chloé ouvre un grand dossier noir."),
    L("chloe", "Vous ! Les deux du sac en forme de pain ! Vous cherchez encore Marcel ?"),
    marie("Non. Cette fois, on l'a trouvé avant de commencer."),
    lino("Aujourd'hui, on cherche une date."),
    narr("Chloé regarde les photos A, B et C."),
    L("chloe", "Mais ce sont mes photos ! Pourquoi est-ce qu'elles sont dans cet album ?"),
    marie("Le vendeur dit : elles sont de 1900. Et notre professeur veut acheter l'album."),
    L("chloe", "J'ai bien travaillé, alors. Mais pas si bien."),
    L("chloe", "Voilà les photos entières. Ce sont des photos des coulisses. On voit aussi notre travail.")
  ], effects: { flag: "C00_done" }, doneAt: true };   // danach frei: das Dossier (C01) und Chloé (C02l bis C02)
  N.C01 = { type: "task", title: "Les bords coupés", help: "C01", diag: "D_C01",
    task: { kind: "reveal", status: "Ce que le vendeur a coupé : {n} sur {m}",
      intro: "Trouvez la photo entière pour A, B et C. Pour chaque photo, trouvez ce que le vendeur a coupé.",
      q1: "D'abord : quelle photo entière va avec A, B et C ?",
      q2: "Maintenant, cherchez sur chaque photo : qu'est-ce que le vendeur a coupé ?",
      crops: ["A", "B", "C"], fulls: ["P16", "P17", "P18", "P19"],
      wrong: lino("Pas encore."),
      decoy: lino("Le même monument. Mais la personne n'est pas à la même place. Regarde aussi le manteau."),
      matched: L("chloe", "Oui. Ce sont les mêmes photos. Maintenant, regardez les bords."),
      points: [
        { id: "telephone", chip: "l'assistante avec un smartphone", photo: "P17", x: 79, y: 25, w: 20, h: 75, lines: [
          lino("À droite, avec le téléphone : c'est l'assistante ! Du pont. Et du Louvre."),
          L("chloe", "Et Lucien… il n'a jamais voulu enlever sa montre. En 1900 !")
        ] },
        { id: "lampe", chip: "la lampe LED sur un trépied", photo: "P18", x: 0, y: 13, w: 17, h: 85, lines: [
          lino("Une lampe LED sur un trépied."),
          L("marie", "Le pied au bord de la photo B ! C'était le trépied.", { onlyIf: "pied_vu" })
        ] },
        { id: "clap", chip: "le clap", photo: "P19", x: 41, y: 84.3, w: 16.5, h: 15, line: marie("Le clap ! « Paris 1900 »… et septembre 2025.") }
      ],
      material: [{ photo: "P16", x: 58, y: 19, w: 20, h: 79 }, { photo: "P17", x: 33, y: 19, w: 21, h: 80 }] },
    after: [lino("Il n'a rien ajouté. Il a seulement coupé ce qui racontait la vérité.")],
    effects: { item: "photos_entieres", flag: "C01_done" }, doneAt: true, next: [{ if: "C02_done", node: "W1" }] };
  N.C02l = { type: "lines", lines: [
    marie("Et la date des photos ? Vous la connaissez ?"),
    L("chloe", "Bien sûr. Tout est sur ma fiche. Regardez.")
  ], next: "C02d" };
  N.C02d = { type: "doc", title: "La fiche de Chloé",
    docs: [
      { label: "Compagnie Marcel Blanchard", text: "Série « Paris 1900 »\nSéance photo en costumes : septembre 2025\nPhotographe : Chloé\nP17 Orsay · P18 pont Alexandre III · P19 Invalides", cls: "fiche" },
      { label: "Vente du 12 octobre 2026", text: "Trois copies, photos des coulisses : P17, P18, P19\n6 € la photo, total : 18 €\nAcheteur : Victor Delmas", cls: "fiche" }
    ],
    effects: { item: "fiche_chloe" }, next: "C02a" };
  N.C02a = { type: "audio", audio: "au_chloe", title: "La date et la vente", intro: "Chloé explique. Écoutez bien.", transcriptHelp: "C02", next: "C02" };
  N.C02 = { type: "task", title: "La date et la vente", audio: "au_chloe", listenFirst: true, help: "C02", diag: "D_C02", doneAt: true,
    task: { kind: "sort", intro: "Reliez chaque information à la bonne catégorie.",
      slots: [
        { id: "septembre", label: "septembre 2025", answer: "date" },
        { id: "paris1900", label: "Paris 1900", answer: "titre" },
        { id: "e18", label: "18 €", answer: "copies" },
        { id: "e180", label: "180 €", answer: "album" }
      ],
      options: [
        { id: "date", label: "la date des photos" },
        { id: "titre", label: "le titre de la série" },
        { id: "copies", label: "le prix des trois copies" },
        { id: "album", label: "le prix de l'album" }
      ],
      matInv: ["fiche_chloe", "fiche_vente"],
      wrong: lino("Pas encore.") },
    after: [L("chloe", "Vous pouvez montrer ma fiche et mes photos. Je viens avec vous, si vous voulez.")],
    effects: { flag: "C02_done" }, next: [{ if: "C01_done", node: "W1" }] };
  /* W1 fragt Datum und Titel ab (früher zusätzlich das Tor R3) */
  N.W1 = { type: "task", title: "Un message à M. Nowak", help: "W1", diag: "D_W1", doneAt: true,
    task: { kind: "write", min: 25, rows: 5, check: "contents", sms: true,
      intro: "Écris un message à M. Nowak. Trois phrases : donne la vraie date, explique le titre, dis ce que vous pouvez montrer. (au moins 25 mots)",
      starters: ["Chloé a pris...", "« Paris 1900 », c'est...", "Nous avons..."],
      topic: ["photo", "chloe", "2025", "septembre", "titre", "serie", "date", "fiche", "entier", "montr", "vendeur", "1900", "copie", "bouquinist", "nowak", "album", "bord"], topicMin: 2,
      topicMsg: "Parle des photos : la date, le titre, ce que vous pouvez montrer.",
      need: [
        { any: ["2025", "deux mille vingt-cinq"], msg: "Quelle année ?" },
        { any: ["titre", "serie"], msg: "Le titre ou la date ?" },
        { any: ["entiere", "entier", "fiche", "montr", "preuve", "dossier", "original"], msg: "Qu'est-ce que vous pouvez montrer ?" }
      ],
      success: L("nowak", "Merci ! Alors, je ne paie pas encore. Rendez-vous à quatorze heures quarante-cinq, au stand du vendeur. Avec Chloé, si elle veut.", { sms: true }) },
    effects: { flag: "W1_done" }, next: "MAP" };
  N.Cr = { type: "lines", amb: true, lines: [L("chloe", "Les trois photos sont dans ce dossier. Entières, avec les bords.")], next: "RESUME" };
  N.Cd = { type: "doc", amb: true, title: "Les photos entières", render: "fulls", photos: ["P17", "P18", "P19"], next: "RESUME" };
  N.Cph = { type: "lines", amb: true, lines: [lino("Des photos de la série « Paris 1900 ». Toutes en costumes."), marie("Et toutes brunes. Comme dans l'album.")], next: "RESUME" };

  /* ===== 7 Finale am Stand von Delmas (Lino ermittelt, Marie hilft) ===== */
  /* Nach F03: M. Nowak kauft nicht, der Verantwortliche kommt (früher der Nachspann von F03b) */
  const F03after = [
    L("nowak", "Je voulais des photos de 1900 pour l'école. Ce n'est pas ça. Je n'achète pas."),
    narr("Le responsable de la brocante arrive au stand."),
    L("nowak", "Bonjour, monsieur. Voici la fiche du vendeur et la fiche de la photographe. Vous pouvez parler avec monsieur Delmas ?"),
    L("responsable", "Bien sûr. Monsieur Delmas, je regarde votre fiche avec vous.")
  ];
  N.F00 = { type: "cut", bg: "bg_orsay", lines: [
    deuxVoix,
    narr("Quatorze heures quarante-cinq. Au stand du vendeur. M. Nowak arrive avec la classe. Chloé est avec Lino et Marie."),
    L("delmas", "Ah, monsieur ! Vous êtes en avance. Cent quatre-vingts euros, s'il vous plaît."),
    L("nowak", "Avant de payer, je veux écouter mes détectives."),
    lino("Le livre est peut-être vieux. Mais les photos ont notre âge. Enfin, non : elles sont plus jeunes."),
    marie("Elles ont un an."),
    L("delmas", "« Paris 1900 », c'est une ambiance. Je n'ai jamais écrit : les photos sont de 1900.")
  ], effects: { flag: "F_started" }, next: "F01" };
  N.F01 = { type: "task", title: "Les preuves", help: "F01", diag: "D_F01",
    task: { kind: "proofs", n: 3, intro: "Montrez trois preuves. Pour chaque preuve, dites ce qu'elle montre.",
      distinct: "Trois preuves différentes, s'il vous plaît.",
      required: "fiche_vente", requiredLine: marie("Il dit qu'il n'a jamais écrit ça. Montre ses mots."),
      items: [
        { id: "fiche_vente", sentence: "s_d1", reply: [marie("Vous avez écrit : « Trois photographies prises en 1900. Photos originales, pas des copies. » Ce n'est pas une ambiance."), L("delmas", "Une erreur sur la fiche, alors.")] },
        { id: "photos_entieres", sentence: "s_d5", reply: [L("chloe", "Ce sont mes photos. Ici, on voit le téléphone. Et ici, la date sur le clap.")] },
        { id: "fiche_chloe", sentence: "s_d6", reply: [L("chloe", "Et avant-hier, monsieur a acheté trois copies. Dix-huit euros.")] },
        { id: "photo_baguette", sentence: "s_d4", reply: [lino("La photo B, au moins, n'est pas de 1900.")], noRequired: marie("Ça montre la date de la photo B. Mais sa promesse, elle est sur sa fiche.") },
        { id: "fiche_orsay", trap: marie("Ça, c'est pour la légende de la photo A. Il nous faut la date des photos.") },
        { id: "programme", trap: lino("Le programme dit seulement où est Chloé.") }
      ],
      sentences: [
        { id: "s_d1", label: "Le vendeur a écrit : photos de 1900, pas des copies." },
        { id: "s_d5", label: "Ce sont les mêmes photos. Le vendeur a coupé les bords." },
        { id: "s_d6", label: "Chloé a pris les photos en septembre 2025." },
        { id: "s_d4", label: "La baguette réparée : la photo B est de 2025." },
        { id: "s_brun", label: "Les photos sont brunes. Alors, elles sont vieilles.", trap: lino("Chloé fait des photos brunes. Et elles ont un an.") },
        { id: "s_couv", label: "La couverture est vieille.", trap: marie("Oui. Mais on parle des photos.") },
        { id: "s_lucien", label: "Lucien a fait l'album.", trap: marie("Il est sur les photos. Mais on n'a pas de preuve sur son rôle aujourd'hui.") }
      ],
      matInv: ["fiche_vente", "photos_entieres", "fiche_chloe"],
      wrong: marie("Pas encore.") },
    after: [L("delmas", "Le livre, lui, est vraiment ancien."), lino("Oui. C'est votre meilleure preuve. Pour le livre.")],
    effects: { flag: "F01_done" }, next: "F02" };
  /* Fassung 1.2: Delmas wehrt sich. Die Antwort steht im Hörtext von Chloé (C02a) */
  N.F02 = { type: "choice", who: "delmas", help: "F02", diag: "D_F02",
    prompt: L("delmas", "Moi, je ne savais pas. J'ai acheté ces photos comme ça."),
    choices: [
      { fr: "Chloé vous a expliqué le titre.", kind: "ok", reply: [
        L("chloe", "Oui, monsieur. Je vous l'ai expliqué. « Paris 1900 », c'est le titre de notre série."),
        L("delmas", "Ah… j'ai oublié."),
        lino("Pratique.")
      ] },
      { fr: "Les photos sont brunes.", kind: "wrong", reply: [marie("Brunes, oui. Mais ça ne montre pas ce qu'il savait.")] },
      { fr: "Lucien est sur la photo.", kind: "wrong", reply: [marie("Lucien, oui. Mais ça ne montre pas ce qu'il savait.")] }
    ],
    next: "F03" };
  N.F03 = { type: "task", title: "Comment il a fait l'album", help: "F03", diag: "D_F03",
    task: { kind: "chain", intro: "Comment est-ce que le vendeur a fait l'album ? Mettez les phrases dans l'ordre.", words: [],
      items: [
        { parts: ["En septembre 2025, Chloé a pris des photos avec des costumes anciens."] },
        { parts: ["Avant-hier, Delmas a acheté trois copies."] },
        { parts: ["Il a coupé les bords des photos."] },
        { parts: ["Il a collé les photos dans un vieil album."] },
        { parts: ["Sur sa fiche, il a écrit : photos de 1900."] }
      ],
      wrong: marie("Pas encore. Pense aux dates.") },
    after: F03after,
    next: "F04l" };
  N.F04l = { type: "lines", lines: [
    L("delmas", "D'accord. J'avais un album vide. J'ai mis les photos dedans. Elles allaient bien avec la couverture."),
    L("chloe", "Avec la couverture, oui. Avec votre date, non.")
  ], next: "F04" };
  N.F04 = { type: "task", title: "Une fiche juste", help: "F04", diag: "D_F04", doneAt: true,
    task: { kind: "pick", n: 3, question: "Choisissez trois phrases pour une fiche juste.",
      options: [
        { id: "album", label: "Album ancien", ok: true },
        { id: "copies", label: "Copies de photos prises en 2025", ok: true },
        { id: "serie", label: "Série en costumes « Paris 1900 »", ok: true },
        { id: "originales", label: "Photos originales de 1900", reply: L("chloe", "Non. Ce sont des copies de mes photos.") },
        { id: "gare", label: "Photos trouvées dans une gare en 1900", reply: lino("Une gare en 1900, oui. Des photos de 1900, non.") }
      ],
      wrong: marie("Pas encore.") },
    after: [
      narr("Monsieur Delmas donne la nouvelle fiche au responsable."),
      L("delmas", "Avec la nouvelle fiche, l'album coûte… trente euros. Monsieur ?"),
      L("nowak", "Non, merci. Notre argent reste dans l'enveloppe."),
      lino("Bravo, monsieur. Vous apprenez vite.")
    ],
    effects: { flag: "F04_done" }, next: "W2" };
  /* Fassung 1.2: Schlussbild nach dem Bericht. Statt des Albums bekommt die Schule ein ehrliches Klassenfoto */
  N.F05 = { type: "cut", bg: "bg_orsay", lines: [
    L("chloe", "Pour vous dire merci, je fais une vraie photo de la classe. Avec les costumes, si vous voulez."),
    L("nowak", "Une photo de la classe, pour l'école ? Ça, c'est un vrai souvenir."),
    L("lino", "Et pour l'école, j'ai aussi une vraie photo de 1900. Une carte postale du Petit Palais. Gratuite !", { onlyIf: "X_done" }),
    L("kevin", "Et Lucien, il est où ?"),
    lino("En 1900, peut-être."),
    L("nowak", "Vingt, vingt et un, vingt-deux… vingt-trois ?"),
    lino("Bernd aussi veut être sur la photo."),
    L("kevin", "Je peux garder mon téléphone ?"),
    lino("Oui. Dans cent ans, ça va aider quelqu'un."),
    marie("Attendez. Il manque une chose.")
  ], next: "F05b" };
  /* Die Tafel vor der Klasse: Text vom Spiel, damit er auf dem braunen Bild lesbar bleibt */
  N.F05b = { type: "cut", bg: "cut_photo_classe", sign: "Classe 10b\nd'Erfurt\nParis · 2026", signAt: { x: 43, y: 74.3, w: 9.6, h: 11.1 }, lines: [
    lino("Maintenant, même en brun, c'est vrai."),
    marie("« Les vrais souvenirs restent plus longtemps que les téléphones. » Le vendeur avait raison, finalement."),
    lino("Pour une fois."),
    L("nowak", "Et maintenant, la gare. Les billets sont dans Bernd, et mon enveloppe rouge est dessous."),
    lino("Je sais. Je sais même où.")
  ], next: "END_SCREEN" };
  N.W2 = { type: "task", title: "Le rapport", perPlayer: true, help: "W2", diag: "D_W2", doneAt: true,
    task: { kind: "write", min: 40, rows: 8, check: "rapport",
      intro: "Pour le journal de la classe, raconte l'affaire en trois ou quatre phrases (au moins 40 mots). Utilise l'imparfait et le passé composé.",
      starters: ["Le vendeur disait...", "Mais...", "Finalement..."],
      topic: ["vendeur", "album", "photo", "chloe", "1900", "2025", "bouquinist", "nowak", "professeur", "baguette", "marcel", "lucien", "legende", "fiche", "copie", "bord", "palais"], topicMin: 3,
      topicMsg: "Raconte l'affaire : le vendeur, les photos, Chloé.",
      msgs: {
        imparfait: "Il manque l'imparfait : comment c'était ?",
        pc: "Il manque le passé composé : qu'est-ce qu'il a fait ?"
      } },
    effects: { flag: "W2_done" }, next: "F05" };
  N.END_SCREEN = { type: "end" };
  N.Fr = { type: "lines", amb: true, lines: [L("delmas", "Tout est sur la nouvelle fiche. Cette fois, avec la bonne date.")], next: "RESUME" };

  /* ===== Abfragen unterwegs (Tore): getippt, ohne Auswahl, nur mit Hinweis, wo man nachsehen kann ===== */
  N.R1 = { type: "task", gate: true, title: "Une question de Kevin", diag: "D_R1",
    task: { kind: "recall", who: "nowak", sms: true, intro: "Lino, Kevin dit : le musée a ouvert en 1900. C'est vrai ? Il a ouvert en quelle année ?",
      fields: [{ id: "annee", label: "L'année :", size: 12,
        answers: ["1986", "en 1986", "mille neuf cent quatre-vingt-six", "en mille neuf cent quatre-vingt-six"],
        keywords: [["1986"], ["quatre", "vingt", "six"]],
        traps: [{ answers: ["1900", "en 1900"], keywords: [["1900"]], who: "nowak", fr: "C'est ce que Kevin dit. Mais en 1900, les gens prenaient le train ici, non ?" }],
        where: "C'est sur ma fiche de ce matin." }],
      wrongText: "Tu es sûr ? Kevin, lui, est très sûr.",
      success: L("nowak", "1986. Avant, c'était une gare. Merci, Lino ! Kevin n'est pas content.", { sms: true }) },
    effects: { flag: "R1_done" }, after: [marie("On y va ? La carte est ouverte. Le pont est tout près.")], next: "MAP" };
  N.R2 = { type: "task", gate: true, title: "La photographe", diag: "D_R2",
    task: { kind: "recall", who: "bouquiniste", intro: "Qui a pris ces photos ? Et je peux voir cette personne à quelle heure ?",
      fields: [
        { id: "qui", label: "Qui a pris ces photos ?", size: 14, answers: ["Chloé", "c'est Chloé"], keywords: [["chloe"]],
          traps: [
            { keywords: [["marcel"]], who: "lino", fr: "Non. Marcel est sur la photo B." },
            { keywords: [["lucien"]], who: "lino", fr: "Lucien est sur les photos. Il ne les a pas prises." },
            { keywords: [["delmas"], ["vendeur"]], who: "lino", fr: "Le vendeur vend les photos. Il ne les a pas prises." }
          ],
          where: "Marcel l'a dit. Et c'est sur le programme." },
        { id: "heure", label: "Et elle est là à partir de quelle heure ?", size: 14,
          answers: ["14 h", "14 heures", "quatorze heures", "à quatorze heures", "à partir de quatorze heures"], times: ["14", "1400"],
          keywords: [["quatorze", "heure"]],
          traps: [
            { times: ["1445"], keywords: [["quarante", "cinq"]], who: "lino", fr: "Non, plus tôt." },
            { times: ["11", "1100"], keywords: [["onze"]], who: "lino", fr: "Onze heures, c'est quand son stand ouvre." },
            { times: ["15", "1500"], keywords: [["quinze"]], who: "lino", fr: "Quinze heures, c'est quand M. Nowak veut payer." }
          ],
          where: "C'est sur le programme." }
      ],
      wrongText: "Hmm. Vous êtes sûrs ?",
      success: L("bouquiniste", "Chloé, à quatorze heures, au stand 6. Alors, votre professeur ne doit pas payer avant de voir ses photos.") },
    after: [lino("On lui écrit après Chloé. Promis.")],
    effects: { flags: ["R2_done", "I_done"] }, next: [{ if: "P_done", node: "LUNCH" }, { node: "MAP" }] };
  /* Ältere Spielstände (Fassung 1.1): Diese Knoten gibt es nicht mehr. Wer dort stehen geblieben ist, geht hier weiter. */
  N.P01b = { type: "lines", lines: [marie("Un vrai pain, on ne le répare pas. C'est un accessoire de théâtre.")], next: "P02" };
  N.R3 = { type: "lines", lines: [marie("Alors, on écrit à M. Nowak.")], next: "W1" };
  N.F03b = { type: "lines", lines: F03after, next: "F04l" };
  N.R4 = { type: "lines", lines: [L("nowak", "Bien. Et maintenant, le rapport pour le journal de la classe.")], next: "W2" };

  G.nodes = N;

  /* ---------- Hilfestufen (alles auf Französisch). Es spricht die Hilfefigur der Station: an O, I und F Marie, an P und C Lino.
     Stufe 2 und 3 können eine Aktion auslösen. Bei freien Eingaben nennt die Hilfe den Fundort, nie die Antwort. ---------- */
  G.help = {
    /* Fassung 1.3: Szenenhilfen der freien Stationen (game.js, showIdle). Stufe 2 lässt die offenen Hotspots leuchten. */
    S_orsay1: ["Regarde autour de toi. Qu'est-ce qui est important pour nous ?", { fr: "Regarde ce qui brille.", action: "material" }, "Le vendeur parle d'un album. Il est sur la table.", "Clique sur l'album. Puis : regarder."],
    S_orsay2: ["Les photos sont de 1900 ? Qui peut nous répondre ? Où est-ce que c'est écrit ?", { fr: "Regarde ce qui brille.", action: "material" }, "Le vendeur répond à tes questions. Et il y a une fiche de vente.", "Clique sur le vendeur : parler. Et sur la fiche de vente : lire."],
    S_pont1: ["On a la photo B. Et ici, il y a le vrai pont.", { fr: "Regarde ce qui brille.", action: "material" }, "Compare la photo B avec le pont.", "Clique sur le pont. Puis : regarder."],
    S_pont2: ["Le pain est un accessoire de théâtre. Qui peut nous aider ?", { fr: "Regarde ce qui brille.", action: "material" }, "Au point d'information, il y a quelqu'un. Tu la connais, non ?", "Clique sur l'assistante. Puis : parler."],
    S_invalides: ["Qui connaît les accessoires de la photo B ? Et qu'est-ce qu'on peut comparer ?", { fr: "Regarde ce qui brille.", action: "material" }, "Parle avec Marcel. Et regarde les baguettes sur la table.", "Clique sur Marcel : parler. Et sur les baguettes : regarder."],
    S_petitpalais: ["Une exposition sur 1900. Qu'est-ce qui nous aide pour l'album ?", { fr: "Regarde ce qui brille.", action: "material" }, "Dans la vitrine, il y a une vraie photo de 1900. Compare-la avec la photo B.", "Clique sur la vitrine. Puis : regarder."],
    S_stand6: ["Chloé a des photos. Et elle sait des choses.", { fr: "Regarde ce qui brille.", action: "material" }, "Regarde le dossier de Chloé. Et parle avec elle.", "Clique sur le dossier : regarder. Et sur Chloé : parler."],
    O02: ["Regarde d'abord la photo A. Regarde le monsieur.", { fr: "Regarde son visage et ses mains.", action: "material" }, "Il y a quelque chose sous son nez. Et à son poignet.", "Touche son visage. Et touche sa montre, à son poignet."],
    O03: ["Il répond seulement à ta question. Essaie avec quand ou quel.", { fr: "Regarde les mots en couleur dans les questions.", action: "material" }, "Par exemple : Quand est-ce qu'on a pris les photos ?", "Il dit seulement oui. Alors, on demande : Quand ? Quelles photos ?"],
    O04: ["Il parle du livre ou des photos ?", { fr: "Voici la fiche de vente.", action: "material" }, "Cherche la date et le mot « copies ».", "Deux phrases parlent des photos. La couverture, c'est le livre."],
    O06: ["Avant, c'était une gare.", { fr: "Relis la fiche sur Orsay.", action: "material" }, "Regarde les deux années : 1900 et 1986.", "La légende est fausse. Mais ça ne donne pas la date de la photo."],
    P00: ["Cherche les choses sur les deux images.", { fr: "Regarde le pont sur les deux images.", action: "material" }, "Le bateau et le vélo sont seulement sur l'image d'aujourd'hui.", "Les lampadaires, les colonnes, les statues : trouve-les sur la photo B et sur l'image d'aujourd'hui."],
    P01: ["Regarde le bout du pain.", { fr: "Zoome sur la baguette.", action: "material" }, "Il y a quelque chose au bout, sur le pain et à la main.", "Le bout cassé, le ruban adhésif et le gant blanc."],
    P03: ["Écoute les mots : tout à coup, ramassée, recommencé.", { fr: "Écoute encore l'assistante.", action: "replay" }, { fr: "Voici ses mots. Cherche : costumes, tombée, ramassée, recommencé.", action: "transcript" }, "D'abord les costumes. Puis la baguette tombe. Marcel la ramasse. À la fin, Chloé recommence la photo."],
    P03b: ["Écoute la fin.", { fr: "Écoute encore l'assistante.", action: "replay" }, { fr: "Voici ses mots. Lis les deux dernières phrases.", action: "transcript" }, "Elle dit : la date exacte ? Je ne sais pas."],
    X03: ["Regarde d'abord la vraie photo, puis la photo B.", "Le pont, la couleur, les vêtements : c'est sur une photo ou sur les deux ?", "Les deux photos sont brunes, et les gens portent des vêtements de 1900. Le boulanger est seulement sur la photo B.", "Les deux : le pont, brune, les vêtements. La vraie photo : beaucoup de monde, le carton. La photo B : le boulanger."],
    I01: ["Qu'est-ce que Marcel a dit ? Pas ce que tu penses.", { fr: "Relis les mots de Marcel.", action: "material" }, "Marcel parle de Lucien et de la séance photo.", "Il a dit : Lucien jouait le voyageur. Et : l'année dernière, il a fait une séance photo avec nous."],
    I02: ["Écoute bien : quand, pourquoi, comment.", { fr: "Écoute encore Marcel.", action: "replay" }, { fr: "Voici ses mots. Cherche : septembre, tombée, ruban adhésif.", action: "transcript" }, "En septembre, l'année dernière. La baguette est tombée. Il a mis trois morceaux de ruban adhésif."],
    Itemps: ["M. Nowak dit toujours : c'est le décor ou l'action ?", "Le décor, c'est comment c'était. L'action, c'est ce qui s'est passé une fois.", "Tout à coup : c'est une action.", "Il faisait le boulanger, il tenait une baguette : c'est le décor, alors l'imparfait. Elle est tombée, il a mis le ruban : ce sont des actions, alors le passé composé."],
    I03: ["Compare les petits détails.", { fr: "Regarde la baguette sur les deux images.", action: "material" }, "Zoome sur le bout de la baguette.", "Le même bout cassé, le même ruban, à la même place : c'est la même baguette."],
    I05: ["Qu'est-ce qu'on sait vraiment ?", "Pense à la légende et à la baguette.", "Lucien sur une photo, ce n'est pas une preuve.", "La légende de la photo A est fausse. Et Marcel reconnaît sa baguette."],
    C01: ["Le vendeur n'a pas montré toute la photo.", { fr: "Regarde les personnes sur les photos entières.", action: "material" }, { fr: "Regarde où est la photo de l'album sur la photo entière.", action: "material" }, "Regarde les personnes : même place, même manteau. Au bord, il y a des choses modernes."],
    C02: ["La date, le titre ou le prix ?", { fr: "Regarde la fiche de Chloé et la fiche de vente.", action: "material" }, { fr: "Voici les mots de Chloé.", action: "transcript" }, "Septembre 2025, c'est la date. « Paris 1900 », c'est le titre. 18 €, ce sont les trois copies. 180 €, c'est l'album."],
    W1: ["Trois phrases : la date, le titre, ce que vous pouvez montrer.", "Chloé a pris les photos quand ? « Paris 1900 », c'est quoi ?", "Tu peux commencer : Chloé a pris les photos en…", "La date et le titre sont sur la fiche de Chloé. Et ce que vous pouvez montrer, c'est dans l'inventaire."],
    F01: ["Il dit : je n'ai jamais écrit ça. Qu'est-ce qu'il a écrit ?", { fr: "Regarde la fiche de vente, les photos entières et la fiche de Chloé.", action: "material" }, "Sa fiche, les mêmes photos, la vraie date.", "Le titre ne montre rien. Compare la fiche de vente et les documents."],
    F02: ["Qu'est-ce que Chloé a dit sur la vente ?", "Avant-hier, il a acheté les copies. Et Chloé lui a parlé.", "Chloé a dit : je lui ai expliqué le titre.", "Il savait : Chloé lui a expliqué le titre. Les photos brunes et Lucien ne montrent pas ce qu'il savait."],
    F03: ["Commence par la séance photo.", "D'abord Chloé, puis le vendeur.", "Après l'achat, il a coupé. Puis il a collé.", "Septembre 2025 : les photos. Avant-hier : les copies. Puis : couper, coller, écrire la fiche."],
    F04: ["Une fiche juste dit la vérité sur l'album et sur les photos.", "L'album est vieux. Les photos sont des copies.", "Les photos sont de 2025. « Paris 1900 », c'est le titre de la série.", "Album ancien. Copies de photos prises en 2025. Série en costumes « Paris 1900 »."],
    W2: ["Raconte dans l'ordre : le vendeur, Chloé, l'album, la fin.", { fr: "Regarde les débuts de phrases.", action: "material" }, "Le décor à l'imparfait : le vendeur disait. L'action au passé composé : Chloé a pris, il a coupé.", "Au moins 40 mots, un imparfait (disait, était), un passé composé (a pris, a coupé), et trois mots de l'affaire : le vendeur, les photos, Chloé…"]
  };

  /* ---------- Diagnose: Beschreibungen für die Lehrkraft ---------- */
  G.diag = {
    S_orsay1: "Orsay frei erkunden: das Album finden (Szenenhilfe)", S_orsay2: "Orsay frei erkunden: Händler und Fiche (Szenenhilfe)",
    S_pont1: "Pont frei erkunden: die Brücke (Szenenhilfe)", S_pont2: "Pont frei erkunden: die Assistentin (Szenenhilfe)",
    S_petitpalais: "Petit Palais (freiwillig) frei erkunden: die Vitrine (Szenenhilfe)", D_X03: "Echtes Foto von 1900 und Foto B vergleichen: braun und Kleidung beweisen nichts (freiwillig)",
    S_invalides: "Invalides frei erkunden: Marcel und die Baguettes (Szenenhilfe)", S_stand6: "Stand 6 frei erkunden: Dossier und Chloé (Szenenhilfe)",
    D_O02: "Gesicht und Uhr auf dem Albumfoto", D_O03: "W-Fragen statt Ja-Nein-Fragen", D_O04: "Versprechen über die Fotos (nicht über das Buch)",
    D_O06: "Dokument sagt ja, nein, nichts", D_R1: "Abfrage: Eröffnung des Museums",
    D_P00: "Gleiche Dinge auf zwei Bildern", D_P01: "Details der Baguette", D_P01b: "Requisit statt Brot (bis Fassung 1.1)", D_P02: "Wen fragen", D_P03: "Reihenfolge der Erinnerung", D_P03b: "Was die Assistentin nicht weiß",
    D_I01: "Was Marcel weiß (nicht vermutet)", D_I02: "Hören: wann, warum, wie", D_Itemps: "Imparfait und passé composé (freiwillig)", D_I03: "Gleiche Details: dieselbe Baguette",
    D_R2: "Abfrage: Fotografin und Uhrzeit", D_I05: "Was wir wirklich wissen",
    D_C01: "Ausschnitt und Vollbild, abgeschnittene Details", D_C02: "Datum, Titel, Preise", D_R3: "Abfrage: Datum und Titel (bis Fassung 1.1)", D_W1: "Nachricht an M. Nowak",
    D_F01: "Beweise mit Pflichtbeleg", D_F02: "Einwand des Händlers: was Chloé ihm erklärt hat", D_F03: "Wie das Album entstand", D_F03b: "Altes Album, neue Fotos (bis Fassung 1.1)",
    D_F04: "Eine richtige Fiche", D_R4: "Abfrage: was falsch war (bis Fassung 1.1)", D_W2: "Rapport"
  };

  /* ---------- Lehrkraft: Lösungen, Freischalten ---------- */
  G.profSolutions = [
    ["Orsay (frei)", "Erst das Album (O02), dann Händler (O03) und Fiche (O04) in beliebiger Reihenfolge; danach geht es von allein weiter (O05)"],
    ["O02", "Auf Foto A Luciens Gesicht und die goldene Uhr; die Baguette auf B gibt nur eine Bemerkung"],
    ["O03", "Quand est-ce qu'on a pris les photos ? (F1) · Quelles photos est-ce que vous vendez ? (F2)"],
    ["O04", "On a pris les photos en 1900 · Ce sont des photos originales, pas des copies"],
    ["O06", "oui: Le bâtiment existait en 1900 · non: déjà un musée / légende juste · rien: photo A en 2025 / toutes fausses"],
    ["R1", "1986 (Falle 1900)"],
    ["Pont (frei)", "Erst die Brücke (P00 bis P01), dann die Assistentin (P02 bis P03b); danach der Tipp zum Petit Palais (P04)"],
    ["P00", "Lampadaires, colonnes, statues, jeweils auf beiden Bildern antippen; Boot und Fahrrad nur heute"],
    ["P01", "Bout cassé, ruban adhésif, gant blanc; freiwillig: der Stativfuß am linken Rand (setzt pied_vu)"],
    ["P02", "Beide Fragen: Marcel (Invalides), Chloé (14 h, stand 6)"],
    ["P03", "costumes → tombe → ramasse → recommence"], ["P03b", "la date exacte des photos"],
    ["Petit Palais (freiwillig)", "Nach dem Tipp P04 auf der Karte; die Vitrine (X02, X03), das Panneau (X01) liest man freiwillig; danach die Postkarte (carte_1900)"],
    ["X03", "Beide: pont, brune, vêtements de 1900 · echtes Foto: beaucoup de monde, carton · Foto B: boulanger avec une baguette"],
    ["Invalides (frei)", "Marcel (I00m bis I02) und die Baguettes auf dem Tisch (I03p, I03) in beliebiger Reihenfolge; dann die Bouquiniste (I05)"],
    ["I01", "Lucien était un acteur sur ces photos · La séance photo était l'année dernière"],
    ["I02", "en septembre, l'année dernière · La baguette est tombée · avec trois morceaux de ruban adhésif"],
    ["Itemps", "faisait, tenait, est tombée, a mis (freiwillig, Tisch mit den Requisiten)"],
    ["I03", "Bout cassé und ruban adhésif, jeweils auf beiden Bildern antippen"],
    ["I05", "La légende de la photo A est fausse. Et Marcel reconnaît sa baguette… Maintenant, on attend la photographe."], ["R2", "Chloé · 14 h"],
    ["Stand 6 (frei)", "Dossier (C01) und Chloé (C02l bis C02) in beliebiger Reihenfolge; dann die Nachricht (W1)"],
    ["C01", "A → P17, B → P18, C → P19 (Falle P16); dann: Assistentin mit Smartphone (P17), LED-Lampe auf Stativ (P18), Filmklappe (P19)"],
    ["C02", "septembre 2025 = date · Paris 1900 = titre · 18 € = copies · 180 € = album"],
    ["W1", "Mindestens 25 Wörter mit Jahr (2025), Titel oder Serie und etwas zum Zeigen (photos entières, fiche…)"],
    ["F01", "Pflicht: fiche de vente = photos de 1900, pas des copies; dazu zwei aus: photos entières = mêmes photos, bords coupés · fiche de Chloé = septembre 2025 · photo de la baguette = photo B de 2025"],
    ["F02", "Chloé vous a expliqué le titre (Fallen: brunes, Lucien)"],
    ["F03", "séance 2025 → copies → bords coupés → collées → fiche"],
    ["F04", "Album ancien · Copies de photos prises en 2025 · Série en costumes « Paris 1900 »"],
    ["W2", "Mindestens 40 Wörter, ein imparfait, ein passé composé, drei Themenwörter"]
  ];
  G.profUnlock = ["O01_done", "O02_done", "O03_done", "O04_done", "O06_done", "R1_done", "P_arr", "P01_done", "pied_vu", "p02_marcel", "p02_chloe", "P_done", "X_open", "X_arr", "X01_done", "X_done", "I_arr", "I02_done", "I03_done", "I05_done", "R2_done", "I_done", "C00_done", "C01_done", "C02_done", "W1_done"];

  /* ---------- Ältere Spielstände (bis Fassung 1.2): Die Stationen waren Ketten. Wer dort schon weiter war, bekommt die Flags,
     die es seit Fassung 1.3 dafür gibt; sonst fehlten Hotspots, oder ein Abschnitt käme noch einmal. game.js ruft das beim Laden. */
  G.migrate = function (S) {
    const f = S.flags || (S.flags = {}), at = S.at || (S.at = {});
    const was = (scene, ids) => ids.includes(at[scene]);
    // Orsay: O01 → O02 → O03 → O04d → O04 → O05 … O06
    if (f.O04_done || f.O06_done || was("orsay", ["O04d", "O04", "O05", "O05q", "O05d", "O05b", "O06"])) f.O03_done = true;
    // Pont: P00 → P00t → P01 → P02 … P03b (die Ankunft Pa gab es noch nicht)
    if (at.pont || f.P_done) f.P_arr = true;
    if (f.P_done || was("pont", ["P01b", "P02", "P02b", "P02c", "P03a", "P03", "P03b"])) f.P01_done = true;
    if (f.P_done) f.X_open = true;   // den Tipp zum Petit Palais (P04) gab es noch nicht: der Nebenweg steht trotzdem auf der Karte
    // Invalides: I00 (mit Marcels Begrüßung) → I01 … I02 → I03 → I05 → R2
    if ((at.invalides && at.invalides !== "I00") || f.I02_done || f.I03_done || f.I_done) f.I_arr = true;
    // Stand 6: C00 → C01 → C02d … C02 → W1
    if ((at.stand6 && at.stand6 !== "C00") || f.C01_done || f.C02_done || f.W1_done) f.C00_done = true;
    if (f.C02_done || f.W1_done || was("stand6", ["C02d", "C02a", "C02", "W1"])) f.C01_done = true;
  };

  /* ---------- Abspann ---------- */
  G.credits = {
    title: "Le voyageur de 1900",
    lines: ["Florian Nowak 2026"]
  };

  /* ---------- Glossar (französisch-deutsch): nur Wörter, die in Teil 3 mehrmals vorkommen und in Teil 1 und 2 noch nicht da waren.
     Alle Formen werden in den Spieltexten markiert. ---------- */
  G.glossary = [
    ["l'album (m)", "das Fotoalbum"],
    ["la légende, les légendes", "die Bildunterschrift"],
    ["la copie, les copies", "die Kopie; hier: ein nachgedrucktes Foto"],
    ["la brocante", "der Trödelmarkt"],
    ["les coulisses (f)", "hinter den Kulissen; photos des coulisses: Fotos von der Arbeit am Set"],
    ["le trépied", "das Stativ"],
    ["le lampadaire, les lampadaires", "die Straßenlaterne"],
    ["le maquillage", "die Schminke"],
    ["la séance photo", "der Fototermin"],
    ["l'accessoire (m), les accessoires", "die Requisite"],
    ["le bout", "das Ende (eines Gegenstands)"],
    ["le ruban adhésif", "das Klebeband"],
    ["le clap", "die Filmklappe"],
    ["la couverture", "der Einband (eines Buchs)"],
    ["le bord, les bords", "der Rand, die Ränder"],
    ["ramasser, ramasse, ramassé, ramassée", "aufheben (vom Boden)"],
    ["promettre, promet, la promesse", "versprechen; das Versprechen"],
    ["se souvenir, se souvient, le souvenir", "sich erinnern; die Erinnerung"],
    ["la vérité", "die Wahrheit"],
    ["récent, récente, récentes", "neu, aus jüngster Zeit"],
    ["vieillir, vieillit", "alt werden"],
    ["n'importe quoi", "Unsinn"],
    ["l'ambiance (f)", "die Stimmung"],
    ["le pansement, les pansements", "das Pflaster"],
    // Fassung 1.3: Wörter der freien Stationen
    ["l'horloge (f)", "die (große) Uhr, Bahnhofsuhr"],
    ["la malle", "die Reisetruhe"],
    // Fassung 1.3: Nebenweg Petit Palais
    ["l'Exposition universelle (f)", "die Weltausstellung"],
    ["la vitrine", "die Vitrine"],
    ["le carton", "der Karton, die Pappe"],
    ["gratuit, gratuite", "kostenlos"],
    ["le photographe, la photographe", "der Fotograf, die Fotografin"]
  ];

  return G;
})();
