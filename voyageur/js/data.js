/* Le voyageur de 1900 (Pain perdu, Teil 3) – Spieldaten
   Quelle: Drehbuch Teil 3, Fassung 1.1 (29. Oktober 2026). Kennungen wie im Drehbuch: O = Musée d'Orsay, P = Pont Alexandre III,
   I = Invalides (Marcel), C = Chloé am Stand 6, F = Finale am Stand des Händlers, R = Abfragen, W = Schreibaufträge.
   Alle Spieltexte sind französisch und halten A2 (Drehbuch, Abschnitt 2): nur présent, passé composé, imparfait und futur proche;
   Fragen mit est-ce que oder Intonation; Aufgaben für beide mit vous, Schreibaufträge und Hilfen für eine Person mit tu.
   Die Hilfe gibt an jeder Station die Figur, die dort nicht ermittelt (G.helpBy). Nur das Glossar ist französisch-deutsch. */
window.GAME = (function () {
  const G = {};

  G.version = "3.0.0";

  /* ---------- Figuren (Porträts mit Pfad kommen aus Teil 1 und Teil 2) ---------- */
  const T1 = "../assets/img/", T2 = "../guide-fantome/assets/img/";
  G.chars = {
    narrateur: { name: "", initials: "", color: "#8b7355" },
    lino: { name: "Lino", pt: T2 + "pt_lino", initials: "L", color: "#3b4a6b" },
    marie: { name: "Marie", pt: T2 + "pt_marie", initials: "M", color: "#8a3b3b" },
    nowak: { name: "M. Nowak", pt: T2 + "pt_nowak", initials: "N", color: "#5a5a5a" },
    kevin: { name: "Kevin", initials: "Kv", color: "#3a7ab0" },
    delmas: { name: "Victor Delmas", pt: "pt_delmas", initials: "VD", color: "#6b4a2a" },
    bouquiniste: { name: "La bouquiniste", pt: T2 + "pt_bouquiniste", initials: "Bq", color: "#3f6b3f" },
    assistante: { name: "L'assistante", pt: T1 + "pt_assistante", initials: "A", color: "#4a4a6b" },
    marcel: { name: "Marcel", pt: T1 + "pt_marcel", initials: "Mb", color: "#333" },
    chloe: { name: "Chloé", pt: T1 + "pt_chloe", initials: "C", color: "#b04a3a" },
    responsable: { name: "Le responsable", pt: "pt_responsable", initials: "R", color: "#2f4b5a" },
    lucien: { name: "Lucien", pt: T2 + "pt_lucien", initials: "Lu", color: "#7a5a3a" }
  };
  /* Wer an einer Station nicht ermittelt, gibt dort die Hilfe (Drehbuch, Abschnitt 2) */
  G.helpBy = { orsay: "marie", pont: "lino", invalides: "marie", stand6: "lino", finale: "marie" };
  G.helpDefault = "marie";
  /* Wer in Teil 2 bei den Bouquinisten war, wird in O05 wiedererkannt */
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
      pause: "Là, vous devinez. Allez vérifier, puis revenez après la pause.",
      paused: "Pas maintenant. Vérifiez d'abord, puis revenez dans {s} secondes.",
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
      helpLater: "Essaie encore une fois. Après, je t'aide."
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
    Q3: { title: "Quand est-ce qu'on a pris les photos ?", done: "R3_done", answer: "En septembre 2025. « Paris 1900 », c'est le titre de la série. Ce n'est pas une date." },
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
    P17: { img: "doc_p17", ar: 1.5, label: "P17", crop: { x: 14, y: 8, w: 58, h: 84 }, legend: "Visite du musée d'Orsay, 1900" },
    P18: { img: "doc_p18", ar: 1.5, label: "P18", crop: { x: 16, y: 6, w: 62, h: 88 }, legend: "Le pont Alexandre III, 1900" },
    P19: { img: "doc_p19", ar: 1.5, label: "P19", crop: { x: 20, y: 4, w: 60, h: 70 }, legend: "Les Invalides, 1900",
      labels: [{ x: 50, y: 86.5, text: "PARIS 1900\nSEPTEMBRE 2025\nCHLOÉ", cls: "clap" }] }
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
    fiche_orsay: { emoji: "📄", name: "la fiche sur Orsay", desc: "La gare d'Orsay. En 1900, il y avait une grande exposition à Paris : l'Exposition universelle. Pour elle, on a construit une gare. Les gens prenaient le train ici. En 1986, la gare est devenue un musée : le musée d'Orsay. Aujourd'hui, on regarde des tableaux ici. Le bâtiment est vieux, mais ce n'est plus une gare." },
    programme: { emoji: "📋", name: "le programme", desc: "Les Images de Paris · Aujourd'hui · Pont Alexandre III : information · Esplanade des Invalides : livres et costumes · Marcel Blanchard : accessoires de théâtre, le matin · Chloé : photos, à partir de 14 h, stand 6" },
    photo_baguette: { emoji: "🥖", name: "la photo de la baguette", desc: "La baguette de Marcel aujourd'hui : le bout cassé et trois morceaux de ruban adhésif.", img: "doc_baguette" },
    photos_entieres: { emoji: "📁", name: "les photos entières", desc: "Les photos de Chloé : P17, P18 et P19. On voit aussi les bords.", render: "fulls", photos: ["P17", "P18", "P19"] },
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
  G.scenes = {
    orsay: {
      name: "Musée d'Orsay · la brocante du quai", bg: "bg_orsay", enter: [{ if: "O06_done", node: "Or" }, { node: "O00" }],
      labels: [{ x: 62, y: 30, text: "Brocante du quai" }],
      hotspots: [
        { id: "album", label: "l'album", x: 44, y: 56, w: 14, h: 16, actions: { regarder: "Oa" }, showIf: "O06_done" },
        { id: "delmas", label: "le vendeur", x: 60, y: 34, w: 12, h: 56, actions: { parler: "Or" }, showIf: "O06_done" },
        { id: "fiche", label: "la fiche de vente", x: 32, y: 60, w: 10, h: 12, actions: { lire: "Of" }, showIf: "O06_done" },
        { id: "brocante", label: "la brocante", x: 50, y: 24, w: 24, h: 10, actions: { regarder: "Ob" }, showIf: "O06_done" },
        { id: "responsable", label: "le monsieur", x: 84, y: 36, w: 10, h: 50, actions: { regarder: "Orp" }, showIf: "O06_done" }
      ]
    },
    pont: {
      name: "Pont Alexandre III", bg: "bg_pont", enter: [{ if: "P_done", node: "Pr" }, { node: "P00" }],
      labels: [{ x: 80, y: 46, text: "Information" }],
      hotspots: [
        { id: "assistante", label: "l'assistante", x: 72, y: 50, w: 12, h: 44, actions: { parler: "Pr" }, showIf: "P_done" },
        { id: "pont", label: "le pont", x: 4, y: 6, w: 60, h: 50, actions: { regarder: "Pp" }, showIf: "P_done" }
      ]
    },
    invalides: {
      name: "Les Invalides · l'esplanade", bg: "bg_invalides", enter: [{ if: "I_done", node: "Ir" }, { if: "R2_done", node: "I05" }, { if: "I03_done", node: "R2" }, { node: "I00" }],
      labels: [{ x: 50, y: 40, text: "Les Images de Paris" }],
      hotspots: [
        { id: "marcel", label: "Marcel", x: 44, y: 44, w: 12, h: 50, actions: { parler: "Ir" }, showIf: "I_done" },
        { id: "bouquiniste", label: "la bouquiniste", x: 8, y: 46, w: 13, h: 48, actions: { parler: "Ib" }, showIf: "I_done" },
        { id: "table", label: "la table des accessoires", x: 58, y: 62, w: 20, h: 18, actions: { regarder: "Itemps" }, showIf: "I02_done", hideIf: "Itemps_done" }
      ]
    },
    stand6: {
      name: "Les Invalides · stand 6", bg: "bg_invalides", enter: [{ if: "W1_done", node: "Cr" }, { if: "R3_done", node: "W1" }, { if: "C02_done", node: "R3" }, { node: "C00" }],
      labels: [{ x: 84, y: 44, text: "Stand 6" }],
      hotspots: [
        { id: "chloe", label: "Chloé", x: 78, y: 48, w: 12, h: 46, actions: { parler: "Cr" }, showIf: "W1_done" }
      ]
    },
    finale: {
      name: "Musée d'Orsay · le stand du vendeur", bg: "bg_orsay", enter: [{ if: "finished", node: "Fr" }, { if: "R4_done", node: "F05" }, { if: "F04_done", node: "R4" }, { node: "F00" }],
      labels: [{ x: 62, y: 30, text: "Brocante du quai" }],
      hotspots: [
        { id: "delmas", label: "le vendeur", x: 60, y: 34, w: 12, h: 56, actions: { parler: "Fr" }, showIf: "finished" }
      ]
    }
  };
  /* Station je Knoten (für „hier geht es weiter“ und die Lehrkraftansicht) */
  G.homeScene = { O: "orsay", P: "pont", I: "invalides", C: "stand6", W1: "stand6", F: "finale", W2: "finale", R1: "orsay", R2: "invalides", R3: "stand6", R4: "finale" };
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
      '<text x="88" y="21" font-size="2.6" fill="#6f8ea0" font-style="italic">la Seine</text>',
    places: [
      { id: "orsay", label: "Musée d'Orsay · la brocante du quai", short: "Orsay", q: "L'album du vendeur", x: 72, y: 37, unlock: "always", done: ["R1_done"], hideIf: "W1_done" },
      { id: "pont", label: "Pont Alexandre III", short: "Pont Alexandre III", q: "Le même endroit ?", x: 30, y: 23, labelAbove: true, unlock: "R1_done", lockedMsg: [{ if: "O06_done", fr: "D'abord, réponds à Marie." }], done: ["P_done"] },
      { id: "invalides", label: "Les Invalides · l'esplanade", short: "Invalides", q: "Les accessoires de Marcel", x: 18, y: 56, unlock: "R1_done", lockedMsg: [{ if: "O06_done", fr: "D'abord, réponds à Marie." }], done: ["I_done"] },
      { id: "stand6", label: "Les Invalides · stand 6", short: "Stand 6", q: "Chloé, à 14 h", x: 42, y: 47, unlock: ["P_done", "I_done"], lockedMsg: "Pas encore. D'abord, le pont et les Invalides.", done: ["W1_done"] },
      { id: "finale", label: "Musée d'Orsay · le stand du vendeur", short: "Le stand du vendeur", q: "Rendez-vous à 14 h 45", x: 72, y: 37, unlock: "W1_done", hideUntil: "W1_done", done: ["F04_done"] }
    ]
  };

  /* ---------- Offene Abfragen: Wer auf eine Antwort wartet, meldet sich im leeren Dialogfeld ---------- */
  G.pending = [
    { if: "O06_done", unless: "R1_done", scene: "orsay", who: "marie", fr: "Attends. J'ai une question.", node: "R1" },
    { if: "I03_done", unless: "R2_done", scene: "invalides", who: "lino", fr: "Attends, Marie. J'ai une question.", node: "R2" },
    { if: "C02_done", unless: "R3_done", scene: "stand6", who: "marie", fr: "Attends. J'ai une question.", node: "R3" },
    { if: "F04_done", unless: "R4_done", scene: "finale", who: "nowak", fr: "Lino, Marie, une dernière question.", node: "R4" }
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
  ], effects: { flag: "O01_done" }, next: "O02" };
  N.O02 = { type: "task", title: "Un visage connu", help: "O02", diag: "D_O02",
    task: { kind: "loupe", render: "album", maxZoom: 5, status: "Sur la photo A : {n} sur {m}",
      intro: "Regardez les trois photos. Sur la photo A, trouvez le visage et la montre du monsieur.",
      points: [
        { id: "visage", need: true, chip: "le visage", photo: "P17", x: 40, y: 28, w: 9, h: 15, lines: [lino("Marie. Le monsieur sur la photo. C'est notre guide !"), marie("Notre faux guide. Lucien.")] },
        { id: "montre", need: true, chip: "la montre", photo: "P17", x: 47.5, y: 60, w: 7, h: 9, line: marie("La même montre, peut-être.") },
        { id: "lucien_c", neutral: true, photo: "P19", x: 30, y: 16, w: 14, h: 40, line: lino("Encore le même monsieur. Mais regarde d'abord la photo A.") },
        { id: "baguette", neutral: true, photo: "P18", x: 34, y: 50, w: 20, h: 13, line: lino("Une baguette avec du ruban adhésif ? Bizarre.") },
        { id: "brun_a", neutral: true, weak: true, photo: "P17", x: 14, y: 8, w: 58, h: 84, line: marie("La couleur peut être ancienne. Ou ajoutée.") },
        { id: "brun_b", neutral: true, weak: true, photo: "P18", x: 16, y: 6, w: 62, h: 88, line: marie("La couleur peut être ancienne. Ou ajoutée.") },
        { id: "brun_c", neutral: true, weak: true, photo: "P19", x: 20, y: 4, w: 60, h: 70, line: marie("La couleur peut être ancienne. Ou ajoutée.") }
      ],
      material: [{ photo: "P17", x: 36, y: 24, w: 22, h: 50 }] },
    after: [
      lino("En 1900, il avait déjà la même moustache."),
      marie("Ça lui ressemble. Mais un visage, ce n'est pas une date."),
      marie("On prend des photos pour comparer ?"),
      L("delmas", "Vous pouvez photographier les trois pages. Sans flash.")
    ],
    effects: { items: ["photo_a", "photo_b", "photo_c"], flag: "O02_done" }, next: "O03" };
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
    next: "O04d" };
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
    effects: { flag: "O04_done" }, next: "O05" };
  N.O05 = { type: "lines", lines: [
    L("bouquiniste", "Tiens ! Les deux jeunes du monsieur au parapluie rouge ! Vous regardez cet album, vous aussi ?", { onlyIf: "t2_B" }),
    L("bouquiniste", "Bonjour ! Vous regardez cet album, vous aussi ?", { onlyIf: "!t2_B" }),
    marie("Vous allez l'acheter ?"),
    L("bouquiniste", "Peut-être. Je reviens à quinze heures pour payer. La couverture est vraiment vieille. Mais les photos… je ne sais pas."),
    L("bouquiniste", "D'habitude, je vends mes livres sur le quai, près de Notre-Dame. Aujourd'hui, j'ai un stand aux Invalides. Il ouvre à onze heures. Après, je ne peux pas quitter mon stand. Vous pouvez vérifier pour moi ?"),
    lino("On a déjà trouvé un monsieur qui était vieux avant de naître."),
    L("bouquiniste", "Alors, vérifiez. Un titre, ce n'est pas une preuve."),
    narr("Elle donne un programme à Marie.")
  ], next: "O05d" };
  N.O05d = { type: "doc", title: "Le programme", icon: "fiche",
    doc: "Les Images de Paris\nAujourd'hui\nPont Alexandre III : information\nEsplanade des Invalides : livres et costumes\nMarcel Blanchard : accessoires de théâtre, le matin\nChloé : photos, à partir de 14 h, stand 6",
    effects: { item: "programme" }, next: "O05b" };
  N.O05b = { type: "lines", lines: [
    marie("Marcel ! Sur la photo B, il y a un boulanger avec une baguette. Et Marcel a des baguettes en plastique."),
    L("marie", "Nous regardons les photos d'un album. Nous suivons la promenade et nous allons aux Invalides.", { sms: true }),
    L("nowak", "D'accord. Regardez aussi la fiche sur Orsay. Je vous l'ai donnée ce matin.", { sms: true })
  ], next: "O06" };
  N.O06 = { type: "task", title: "Une gare avant un musée", help: "O06", diag: "D_O06", doneAt: true,
    task: { kind: "cols", intro: "Lisez la fiche. Rangez les cinq phrases.", docIcon: "fiche",
      doc: "La gare d'Orsay\nEn 1900, il y avait une grande exposition à Paris : l'Exposition universelle. Pour elle, on a construit une gare. Les gens prenaient le train ici. En 1986, la gare est devenue un musée : le musée d'Orsay. Aujourd'hui, on regarde des tableaux ici. Le bâtiment est vieux, mais ce n'est plus une gare.",
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
  N.Or = { type: "lines", amb: true, lines: [L("delmas", "Tout est sur la fiche.")], next: "RESUME" };
  N.Oa = { type: "doc", amb: true, title: "L'album", render: "album", next: "RESUME" };
  N.Of = { type: "doc", amb: true, title: "La fiche de vente", icon: "fiche", doc: "Album Paris 1900\nCouverture et pages anciennes\nTrois photographies prises en 1900\nPhotos originales, pas des copies\nPrix : 180 €\nVendeur : Victor Delmas", next: "RESUME" };
  N.Ob = { type: "lines", amb: true, lines: [lino("Une brocante. On vend des vieilles choses. Des vraies, j'espère.")], next: "RESUME" };
  N.Orp = { type: "lines", amb: true, lines: [marie("C'est le responsable de la brocante. Il regarde tous les stands.")], next: "RESUME" };

  /* ===== 4 Spuren am Pont Alexandre III (Marie ermittelt, Lino hilft) ===== */
  N.P00 = { type: "cut", bg: "bg_pont", lines: [
    narr("Sur le pont Alexandre III, Marie compare la photo B avec le pont."),
    marie("Le pont existait déjà en 1900. Alors, le lieu est peut-être juste."),
    lino("Enfin quelqu'un qui ne ment pas sur son âge. Le pont.")
  ], next: "P00t" };
  N.P00t = { type: "task", title: "Le même endroit", help: "P00", diag: "D_P00",
    task: { kind: "compare", both: true, status: "Sur les deux images : {n} sur {m}",
      intro: "Qu'est-ce que vous voyez sur les deux images ? Choisissez trois choses.",
      images: [{ label: "La photo B", photo: "P18" }, { label: "Le pont aujourd'hui", img: "doc_pont", ar: 1.5 }],
      points: [
        { id: "lampadaires", need: true, chip: "les lampadaires", img: 0, rects: [{ x: 52, y: 18, w: 8, h: 58 }, { x: 21.5, y: 26, w: 7, h: 50 }], line: lino("Les mêmes lampadaires.") },
        { id: "lampadaires", img: 1, rects: [{ x: 46, y: 16, w: 8, h: 58 }, { x: 15.5, y: 24, w: 8, h: 50 }] },
        { id: "colonnes", need: true, chip: "les colonnes", img: 0, x: 64.5, y: 22, w: 11, h: 50, line: lino("Les mêmes colonnes.") },
        { id: "colonnes", img: 1, x: 60.5, y: 18, w: 12, h: 52 },
        { id: "statues", need: true, chip: "les statues", img: 0, x: 63, y: 7, w: 15, h: 15, line: lino("Et les mêmes statues.") },
        { id: "statues", img: 1, x: 59, y: 3, w: 16, h: 15 },
        { id: "bateau", no: true, img: 1, x: 28, y: 74, w: 34, h: 17, line: lino("Ça, c'est seulement sur l'image d'aujourd'hui.") },
        { id: "velo", no: true, img: 1, x: 69, y: 68, w: 18, h: 26, line: lino("Ça, c'est seulement sur l'image d'aujourd'hui.") }
      ],
      material: [{ img: 0, x: 20, y: 6, w: 58, h: 72 }, { img: 1, x: 14, y: 2, w: 62, h: 72 }],
      success: marie("Le même endroit, ce n'est pas la même année.") },
    next: "P01" };
  N.P01 = { type: "task", title: "Le pain qui ne vieillit pas", help: "P01", diag: "D_P01",
    task: { kind: "loupe", render: "crop", photo: "P18", maxZoom: 5, status: "La baguette : {n} sur {m}",
      intro: "Regardez la photo B de près. Trouvez trois détails sur la baguette.",
      points: [
        { id: "bout", need: true, chip: "le bout cassé", photo: "P18", x: 35, y: 52.5, w: 5.5, h: 9, line: marie("Le bout est cassé.") },
        { id: "ruban", need: true, chip: "le ruban adhésif", photo: "P18", x: 40.5, y: 52, w: 7, h: 9, lines: [lino("Regarde ce pain. Il a trois pansements."), marie("Du pain avec du ruban adhésif ?")] },
        { id: "gant", need: true, chip: "le gant blanc", photo: "P18", x: 47.5, y: 54, w: 6.5, h: 9, line: marie("Un gant blanc. Comme au théâtre.") },
        { id: "pied", chip: "le bord", photo: "P18", x: 15.8, y: 79, w: 4.5, h: 16, flag: "pied_vu", line: marie("Qu'est-ce que c'est, au bord ? On ne voit pas tout.") },
        { id: "boulanger", neutral: true, photo: "P18", x: 33, y: 26, w: 19, h: 68, line: lino("Le boulanger. Regarde son pain.") }
      ],
      material: [{ photo: "P18", x: 33, y: 50, w: 22, h: 14 }] },
    after: [lino("Marcel avait des baguettes en plastique. Et des problèmes de sac.")],
    next: "P01b" };
  N.P01b = { type: "task", title: "Le pain qui ne vieillit pas", help: "P01b", diag: "D_P01b",
    task: { kind: "pick", n: 1, question: "La baguette sur la photo B : qu'est-ce qui est vrai ?",
      options: [
        { id: "accessoire", label: "Cette baguette ressemble à un accessoire de théâtre.", ok: true },
        { id: "plastique", label: "Avant, toutes les baguettes étaient en plastique.", reply: lino("On n'a rien lu sur ça.") },
        { id: "vol", label: "Marcel a volé cet album.", reply: lino("Une baguette sur une photo, ce n'est pas une preuve de vol.") }
      ],
      wrong: lino("Pas encore.") },
    next: "P02" };
  N.P02 = { type: "choice", who: "assistante", diag: "D_P02",
    lines: [
      narr("Au point d'information, une femme tient un plan. C'est l'assistante du Louvre. Marie lui montre la photo B."),
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
    effects: { flag: "P_done" }, next: [{ if: "I_done", node: "LUNCH" }, { node: "MAP" }] };
  N.Pr = { type: "lines", amb: true, lines: [L("assistante", "Chloé arrive à quatorze heures.")], next: "RESUME" };
  N.Pp = { type: "lines", amb: true, lines: [marie("Les lampadaires, les colonnes, les statues : tout ça existait déjà en 1900.")], next: "RESUME" };

  /* ===== 5 Marcel an den Invalides (Lino ermittelt, Marie hilft) ===== */
  N.I00 = { type: "cut", bg: "bg_invalides", lines: [
    narr("L'esplanade des Invalides. Il y a des stands : des livres, des costumes, des accessoires."),
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
      marie("On peut la comparer avec notre photo ?"),
      L("marcel", "Oui. Vous pouvez la prendre en photo. Mais elle reste ici : elle travaille cet après-midi.")
    ],
    effects: { item: "photo_baguette", flag: "I02_done" }, next: "I03" };
  N.I03 = { type: "task", title: "La même baguette", help: "I03", diag: "D_I03", doneAt: true,
    task: { kind: "compare", both: true, maxZoom: 5, status: "Pareil sur les deux photos : {n} sur {m}",
      intro: "Comparez la photo B et la photo de la baguette. Trouvez deux détails pareils.",
      images: [{ label: "La photo B", photo: "P18" }, { label: "La photo de la baguette", img: "doc_baguette", ar: 2 }],
      points: [
        { id: "bout", need: true, chip: "le bout cassé", img: 0, x: 35, y: 52.5, w: 5.5, h: 9, line: marie("Oui. Le même bout.") },
        { id: "bout", img: 1, x: 5, y: 34, w: 12, h: 32 },
        { id: "ruban", need: true, chip: "les trois morceaux de ruban adhésif", img: 0, x: 40.5, y: 52, w: 7, h: 9, line: marie("Oui. Le même ruban.") },
        { id: "ruban", img: 1, x: 18, y: 34, w: 20, h: 32 },
        { id: "couleur", no: true, img: 1, x: 38, y: 38, w: 55, h: 24, line: marie("Ça peut changer. Cherche un détail de la baguette.") },
        { id: "fond", neutral: true, weak: true, img: 1, x: 0, y: 0, w: 100, h: 100, line: marie("Ça peut changer. Cherche un détail de la baguette.") }
      ],
      material: [{ img: 0, x: 33, y: 50, w: 16, h: 13 }, { img: 1, x: 3, y: 32, w: 37, h: 36 }],
      success: lino("Le même bout cassé. Les mêmes trois morceaux de ruban. C'est sa baguette.") },
    after: [
      marie("La photo B ne peut pas être plus vieille que la réparation. Pour les deux autres, on doit voir Chloé."),
      lino("Alors, la photo B est de septembre de l'année dernière. Ou plus tard."),
      L("marcel", "Pour faire vieux, un peu de couleur suffit. Pour avoir raison, il faut plus de travail.")
    ],
    effects: { flag: "I03_done" }, next: "R2" };
  N.I05 = { type: "choice", who: "bouquiniste", help: "I05", diag: "D_I05", doneAt: true,
    lines: [narr("Au stand de la bouquiniste.")],
    prompt: L("bouquiniste", "Alors ? Vous avez trouvé quelque chose ?"),
    choices: [
      { fr: "Tout est faux, même la couverture.", kind: "wrong", reply: [L("bouquiniste", "Attention. La couverture, je l'ai regardée. Elle est vraiment vieille.")] },
      { fr: "La légende de la photo A est fausse. Et Marcel reconnaît sa baguette sur la photo B. Maintenant, on attend Chloé.", kind: "ok", reply: [
        L("bouquiniste", "Bien. Je ne paie pas avant de voir ses photos."),
        L("bouquiniste", "Rendez-vous à quatorze heures quarante-cinq, au stand du vendeur. Mon voisin peut garder mon stand un quart d'heure.")
      ] },
      { fr: "Lucien est sur une photo. Alors, le vendeur travaille avec lui.", kind: "wrong", reply: [L("bouquiniste", "Ça, ce n'est pas une preuve.")] }
    ],
    effects: { flag: "I_done" }, next: [{ if: "P_done", node: "LUNCH" }, { node: "MAP" }] };
  /* Freiwillig: die Tempusübung am Tisch mit den Requisiten (öffnet keinen Ort) */
  N.Itemps = { type: "task", amb: true, title: "Marcel raconte", help: "Itemps", diag: "D_Itemps",
    task: { kind: "gap", intro: "Marcel raconte. Choisissez la bonne forme.",
      parts: [
        "Marcel ", { id: "t1", opts: ["faisait", "a fait"], answer: "faisait" }, " le boulanger. Il ", { id: "t2", opts: ["tenait", "a tenu"], answer: "tenait" },
        " une baguette. Tout à coup, elle ", { id: "t3", opts: ["tombait", "est tombée"], answer: "est tombée" }, ". Alors, il ",
        { id: "t4", opts: ["mettait", "a mis"], answer: "a mis" }, " trois morceaux de ruban adhésif."
      ],
      wrong: marie("C'est le décor ou l'action ?") },
    effects: { flag: "Itemps_done" }, next: "RESUME" };
  N.Ir = { type: "lines", amb: true, lines: [L("marcel", "Chloé a les photos entières.")], next: "RESUME" };
  N.Ib = { type: "lines", amb: true, lines: [L("bouquiniste", "Je n'ai encore rien payé.")], next: "RESUME" };

  /* Mittag: sichtbarer Zeitsprung, sobald Pont und Invalides erledigt sind */
  N.LUNCH = { type: "cut", bg: "cut_dejeuner", lines: [
    narr("Midi. La classe mange ensemble sur l'esplanade des Invalides."),
    L("nowak", "Vingt, vingt et un, vingt-deux. Bon appétit !"),
    lino("Une vraie baguette. Sans ruban adhésif."),
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
    marie("Le vendeur dit : elles sont de 1900."),
    L("chloe", "J'ai bien travaillé, alors. Mais pas si bien."),
    L("chloe", "Voilà les photos entières. Ce sont des photos des coulisses. On voit aussi notre travail.")
  ], next: "C01" };
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
        { id: "telephone", chip: "l'assistante avec un smartphone", photo: "P17", x: 79, y: 33, w: 16, h: 61, lines: [
          lino("À droite, avec le téléphone : c'est l'assistante ! Du pont. Et du Louvre."),
          L("chloe", "Et Lucien… il n'a jamais voulu enlever sa montre. En 1900 !")
        ] },
        { id: "lampe", chip: "la lampe LED sur un trépied", photo: "P18", x: 0.5, y: 17, w: 15, h: 79, lines: [
          lino("Une lampe LED sur un trépied."),
          L("marie", "Le pied au bord de la photo B ! C'était le trépied.", { onlyIf: "pied_vu" })
        ] },
        { id: "clap", chip: "le clap", photo: "P19", x: 39, y: 76, w: 22, h: 21, line: marie("Le clap ! « Paris 1900 »… et septembre 2025.") }
      ],
      material: [{ photo: "P16", x: 56, y: 24, w: 18, h: 70 }, { photo: "P17", x: 35, y: 22, w: 22, h: 72 }] },
    after: [lino("Il n'a rien ajouté. Il a seulement coupé ce qui racontait la vérité.")],
    effects: { item: "photos_entieres", flag: "C01_done" }, next: "C02d" };
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
    effects: { flag: "C02_done" }, next: "R3" };
  N.W1 = { type: "task", title: "Un message à la bouquiniste", help: "W1", diag: "D_W1", doneAt: true,
    task: { kind: "write", min: 25, rows: 5, check: "contents", sms: true,
      intro: "Écris un message à la bouquiniste. Trois phrases : donne la vraie date, explique le titre, dis ce que vous pouvez montrer. (au moins 25 mots)",
      starters: ["Chloé a pris...", "« Paris 1900 », c'est...", "Nous avons..."],
      topic: ["photo", "chloe", "2025", "septembre", "titre", "serie", "date", "fiche", "entier", "montr", "vendeur", "1900", "copie", "bouquinist", "album", "bord"], topicMin: 2,
      topicMsg: "Parle des photos : la date, le titre, ce que vous pouvez montrer.",
      need: [
        { any: ["2025", "deux mille vingt-cinq"], msg: "Quelle année ?" },
        { any: ["titre", "serie"], msg: "Le titre ou la date ?" },
        { any: ["entiere", "entier", "fiche", "montr", "preuve", "dossier", "original"], msg: "Qu'est-ce que vous pouvez montrer ?" }
      ],
      success: L("bouquiniste", "Merci ! À quatorze heures quarante-cinq, chez le vendeur.", { sms: true }) },
    effects: { flag: "W1_done" }, next: "MAP" };
  N.Cr = { type: "lines", amb: true, lines: [L("chloe", "Les trois photos sont dans ce dossier.")], next: "RESUME" };

  /* ===== 7 Finale am Stand von Delmas (Lino ermittelt, Marie hilft) ===== */
  N.F00 = { type: "cut", bg: "bg_orsay", lines: [
    deuxVoix,
    narr("Quatorze heures quarante-cinq. Au stand du vendeur. La bouquiniste arrive avec M. Nowak. Chloé est avec Lino et Marie."),
    L("delmas", "Alors, madame ? Cent quatre-vingts euros. C'est un bon prix."),
    L("bouquiniste", "Avant de payer, je veux écouter ces deux jeunes."),
    lino("Le livre est peut-être vieux. Mais les photos ont notre âge. Enfin, non : elles sont plus jeunes."),
    marie("Elles ont un an."),
    L("delmas", "« Paris 1900 », c'est une ambiance. Je n'ai jamais dit : les photos sont de 1900.")
  ], effects: { flag: "F_started" }, next: "F01" };
  N.F01 = { type: "task", title: "Les preuves", help: "F01", diag: "D_F01",
    task: { kind: "proofs", n: 3, intro: "Montrez trois preuves. Pour chaque preuve, dites ce qu'elle montre.",
      distinct: "Trois preuves différentes, s'il vous plaît.",
      required: "fiche_vente", requiredLine: marie("Il dit qu'il n'a rien écrit. Montre ses mots."),
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
    effects: { flag: "F01_done" }, next: "F03" };
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
    next: "F03b" };
  N.F03b = { type: "task", title: "Comment il a fait l'album", help: "F03b", diag: "D_F03b",
    task: { kind: "pick", n: 1, question: "Qu'est-ce qui est vrai ?",
      options: [
        { id: "vrai", label: "L'album est ancien, mais les photos sont récentes. La fiche de vente est fausse.", ok: true },
        { id: "objet", label: "Un objet ancien dit toujours la vérité.", reply: marie("Non. L'album est vieux, mais sa fiche ne dit pas la vérité.") },
        { id: "chere", label: "Une photo chère est toujours une vieille photo.", reply: marie("Non. Le prix ne dit pas la date.") }
      ],
      wrong: marie("Pas encore.") },
    after: [
      L("bouquiniste", "Je voulais des photos de 1900. Ce n'est pas ça. Je n'achète pas."),
      L("nowak", "Bonjour, monsieur. Voici la fiche du vendeur et la fiche de la photographe. Vous pouvez parler avec monsieur Delmas ?"),
      L("responsable", "Bien sûr. Monsieur Delmas, je regarde votre fiche avec vous.")
    ],
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
    after: [narr("Monsieur Delmas donne la nouvelle fiche au responsable.")],
    effects: { flag: "F04_done" }, next: "R4" };
  N.F05 = { type: "cut", bg: "bg_orsay", lines: [
    L("chloe", "Pour vous dire merci, je fais une vraie photo de la classe. Avec les costumes, si vous voulez."),
    L("kevin", "Je peux garder mon téléphone ?"),
    lino("Oui. Dans cent ans, ça va aider quelqu'un."),
    L("nowak", "Vingt, vingt et un, vingt-deux. Vous êtes prêts ?"),
    marie("Attendez. Il manque une chose.")
  ], next: "F05b" };
  /* Die Tafel vor der Klasse: Text vom Spiel, damit er auf dem braunen Bild lesbar bleibt */
  N.F05b = { type: "cut", bg: "cut_photo_classe", sign: "Classe 10b d'Erfurt · Paris · 2026", lines: [
    lino("Maintenant, même en brun, c'est vrai.")
  ], next: "W2" };
  N.W2 = { type: "task", title: "Le rapport", perPlayer: true, help: "W2", diag: "D_W2", doneAt: true,
    task: { kind: "write", min: 40, rows: 8, check: "rapport",
      intro: "Pour le journal de la classe, raconte l'affaire en trois ou quatre phrases (au moins 40 mots). Utilise l'imparfait et le passé composé.",
      starters: ["Le vendeur disait...", "Mais...", "Finalement..."],
      topic: ["vendeur", "album", "photo", "chloe", "1900", "2025", "bouquinist", "baguette", "marcel", "lucien", "legende", "fiche", "copie", "bord"], topicMin: 3,
      topicMsg: "Raconte l'affaire : le vendeur, les photos, Chloé.",
      msgs: {
        imparfait: "Il manque l'imparfait : comment c'était ?",
        pc: "Il manque le passé composé : qu'est-ce qu'il a fait ?"
      } },
    next: "END_SCREEN" };
  N.END_SCREEN = { type: "end" };
  N.Fr = { type: "lines", amb: true, lines: [L("delmas", "Tout est sur la nouvelle fiche.")], next: "RESUME" };

  /* ===== Abfragen unterwegs (Tore): getippt, ohne Auswahl, nur mit Hinweis, wo man nachsehen kann ===== */
  N.R1 = { type: "task", gate: true, title: "Le musée", diag: "D_R1",
    task: { kind: "recall", who: "marie", intro: "Avant de continuer : le musée a ouvert en quelle année ?",
      fields: [{ id: "annee", label: "L'année :", size: 12,
        answers: ["1986", "en 1986", "mille neuf cent quatre-vingt-six", "en mille neuf cent quatre-vingt-six"],
        keywords: [["1986"], ["quatre", "vingt", "six"]],
        traps: [{ answers: ["1900", "en 1900"], keywords: [["1900"]], who: "marie", fr: "En 1900, les gens prenaient le train ici." }],
        where: "C'est sur la fiche de M. Nowak." }],
      wrongText: "Hmm. Je ne crois pas.",
      success: marie("1986. Avant, c'était une gare.") },
    effects: { flag: "R1_done" }, after: [marie("On y va ? La carte est ouverte. Le pont est tout près.")], next: "MAP" };
  N.R2 = { type: "task", gate: true, title: "Les photos de Chloé", diag: "D_R2",
    task: { kind: "recall", who: "lino", intro: "Avant de partir, deux questions.",
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
            { times: ["1445"], keywords: [["quarante", "cinq"]], who: "lino", fr: "Non, plus tôt. Ça, c'est le rendez-vous chez le vendeur." },
            { times: ["11", "1100"], keywords: [["onze"]], who: "lino", fr: "Onze heures, c'est le stand de la bouquiniste." },
            { times: ["15", "1500"], keywords: [["quinze"]], who: "lino", fr: "Quinze heures, c'est quand la bouquiniste veut payer." }
          ],
          where: "C'est sur le programme." }
      ],
      wrongText: "Hmm. Je ne crois pas.",
      success: marie("Chloé, à quatorze heures, au stand 6.") },
    effects: { flag: "R2_done" }, next: "I05" };
  N.R3 = { type: "task", gate: true, title: "La date et le titre", diag: "D_R3",
    task: { kind: "recall", who: "marie", intro: "Alors, deux questions.",
      fields: [
        { id: "quand", label: "Quand est-ce que Chloé a pris les photos ?", size: 18,
          answers: ["en septembre 2025", "septembre 2025", "en 2025", "2025"], keywords: [["2025"], ["vingt", "cinq"]],
          traps: [
            { keywords: [["1900"]], who: "marie", fr: "Non. 1900, c'est sur la fiche du vendeur." },
            { keywords: [["2026"], ["octobre"]], who: "marie", fr: "Non. En octobre, monsieur Delmas a acheté les copies." }
          ],
          where: "Écoute encore Chloé. Et regarde sa fiche." },
        { id: "titre", label: "Et « Paris 1900 », c'est quoi ?", size: 22,
          answers: ["le titre de la série", "le titre", "une série de photos", "c'est le titre de la série", "un titre", "le titre de la série de photos"],
          keywords: [["titre"], ["serie"]],
          traps: [{ answers: ["la date", "une date", "c'est la date", "c'est une date", "la date des photos"], who: "lino", fr: "Non. Ça, c'est l'erreur du vendeur." }],
          where: "Chloé l'a dit. Et c'est sur sa fiche." }
      ],
      wrongText: "Hmm. Je ne crois pas.",
      success: marie("Septembre 2025. Et « Paris 1900 », c'est un titre. Pas une date.") },
    effects: { flag: "R3_done" }, next: "W1" };
  N.R4 = { type: "task", gate: true, title: "Le vrai problème", diag: "D_R4",
    task: { kind: "recall", who: "nowak", intro: "En une phrase : qu'est-ce qui était faux sur la fiche ?",
      /* sinngleich: alles, was die Datierung der Fotos nennt; dazu die zweite falsche Angabe der Fiche (Originale statt Kopien) */
      fields: [{ id: "faux", label: "Sur la fiche, c'était faux :", size: 30,
        answers: ["la date des photos", "la date", "l'année des photos", "les photos ne sont pas de 1900", "il disait : les photos sont de 1900", "les photos sont de 2025"],
        keywords: [["date"], ["annee"], ["1900"], ["2025"], ["age", "photo"], ["recent"], ["copie"], ["original"]],
        traps: [
          { answers: ["la couverture", "la couverture de l'album", "l'album", "le livre", "les pages"], keywords: [["couverture"]], who: "nowak", fr: "Non. La couverture est vraiment vieille." },
          { answers: ["le prix", "180 €", "180 euros"], keywords: [["prix"]], who: "nowak", fr: "Le prix ? C'est cher, oui. Mais ce n'est pas faux." }
        ],
        where: "Relis la fiche de vente : la troisième ligne." }],
      wrongText: "Hmm. Tu peux répéter ?",
      success: L("nowak", "Exactement. La date des photos était fausse.") },
    effects: { flag: "R4_done" }, next: "F05" };

  G.nodes = N;

  /* ---------- Hilfestufen (alles auf Französisch). Es spricht die Hilfefigur der Station: an O, I und F Marie, an P und C Lino.
     Stufe 2 und 3 können eine Aktion auslösen. Bei freien Eingaben nennt die Hilfe den Fundort, nie die Antwort. ---------- */
  G.help = {
    O02: ["Regarde d'abord la photo A. Regarde le monsieur.", { fr: "Regarde son visage et ses mains.", action: "material" }, "Il y a quelque chose sous son nez. Et à son poignet.", "Touche son visage. Et touche sa montre, à son poignet."],
    O03: ["Il répond seulement à ta question. Essaie avec quand ou quel.", { fr: "Regarde les mots en couleur dans les questions.", action: "material" }, "Par exemple : Quand est-ce qu'on a pris les photos ?", "Il dit seulement oui. Alors, on demande : Quand ? Quelles photos ?"],
    O04: ["Il parle du livre ou des photos ?", { fr: "Voici la fiche de vente.", action: "material" }, "Cherche la date et le mot « copies ».", "Deux phrases parlent des photos. La couverture, c'est le livre."],
    O06: ["Avant, c'était une gare.", { fr: "Relis la fiche sur Orsay.", action: "material" }, "Regarde les deux années : 1900 et 1986.", "La légende est fausse. Mais ça ne donne pas la date de la photo."],
    P00: ["Cherche les choses sur les deux images.", { fr: "Regarde le pont sur les deux images.", action: "material" }, "Le bateau et le vélo sont seulement sur l'image d'aujourd'hui.", "Les lampadaires, les colonnes, les statues : trouve-les sur la photo B et sur l'image d'aujourd'hui."],
    P01: ["Regarde le bout du pain.", { fr: "Zoome sur la baguette.", action: "material" }, "Il y a quelque chose au bout, sur le pain et à la main.", "Le bout cassé, le ruban adhésif et le gant blanc."],
    P01b: ["Pourquoi est-ce qu'il y a du ruban adhésif ?", "Un vrai pain, on ne le répare pas.", "C'est peut-être un accessoire réparé. Il faut demander à Marcel.", "Une baguette avec du ruban adhésif, c'est un accessoire de théâtre."],
    P03: ["Écoute les mots : tout à coup, ramassée, recommencé.", { fr: "Écoute encore l'assistante.", action: "replay" }, { fr: "Voici ses mots. Cherche : costumes, tombée, ramassée, recommencé.", action: "transcript" }, "D'abord les costumes. Puis la baguette tombe. Marcel la ramasse. À la fin, Chloé recommence la photo."],
    P03b: ["Écoute la fin.", { fr: "Écoute encore l'assistante.", action: "replay" }, { fr: "Voici ses mots. Lis les deux dernières phrases.", action: "transcript" }, "Elle dit : la date exacte ? Je ne sais pas."],
    I01: ["Qu'est-ce que Marcel a dit ? Pas ce que tu penses.", { fr: "Relis les mots de Marcel.", action: "material" }, "Marcel parle de Lucien et de la séance photo.", "Il a dit : Lucien jouait le voyageur. Et : l'année dernière, il a fait une séance photo avec nous."],
    I02: ["Écoute bien : quand, pourquoi, comment.", { fr: "Écoute encore Marcel.", action: "replay" }, { fr: "Voici ses mots. Cherche : septembre, tombée, ruban adhésif.", action: "transcript" }, "En septembre, l'année dernière. La baguette est tombée. Il a mis trois morceaux de ruban adhésif."],
    Itemps: ["C'est le décor ou l'action ?", "Le décor, c'est comment c'était. L'action, c'est ce qui s'est passé une fois.", "Tout à coup : c'est une action.", "Il faisait le boulanger, il tenait une baguette : c'est le décor, alors l'imparfait. Elle est tombée, il a mis le ruban : ce sont des actions, alors le passé composé."],
    I03: ["Compare les petits détails.", { fr: "Regarde la baguette sur les deux images.", action: "material" }, "Zoome sur le bout de la baguette.", "Le même bout cassé, le même ruban, à la même place : c'est la même baguette."],
    I05: ["Qu'est-ce qu'on sait vraiment ?", "Pense à la légende et à la baguette.", "Lucien sur une photo, ce n'est pas une preuve.", "La légende de la photo A est fausse. Et Marcel reconnaît sa baguette."],
    C01: ["Le vendeur n'a pas montré toute la photo.", { fr: "Regarde les personnes sur les photos entières.", action: "material" }, { fr: "Regarde où est la photo de l'album sur la photo entière.", action: "material" }, "Regarde les personnes : même place, même manteau. Au bord, il y a des choses modernes."],
    C02: ["La date, le titre ou le prix ?", { fr: "Regarde la fiche de Chloé et la fiche de vente.", action: "material" }, { fr: "Voici les mots de Chloé.", action: "transcript" }, "Septembre 2025, c'est la date. « Paris 1900 », c'est le titre. 18 €, ce sont les trois copies. 180 €, c'est l'album."],
    W1: ["Trois phrases : la date, le titre, ce que vous pouvez montrer.", "Chloé a pris les photos quand ? « Paris 1900 », c'est quoi ?", "Tu peux commencer : Chloé a pris les photos en…", "La date et le titre sont sur la fiche de Chloé. Et ce que vous pouvez montrer, c'est dans l'inventaire."],
    F01: ["Il dit : je n'ai rien écrit. Qu'est-ce qu'il a écrit ?", { fr: "Regarde la fiche de vente, les photos entières et la fiche de Chloé.", action: "material" }, "Sa fiche, les mêmes photos, la vraie date.", "Le titre ne montre rien. Compare la fiche de vente et les documents."],
    F03: ["Commence par la séance photo.", "D'abord Chloé, puis le vendeur.", "Après l'achat, il a coupé. Puis il a collé.", "Septembre 2025 : les photos. Avant-hier : les copies. Puis : couper, coller, écrire la fiche."],
    F03b: ["Pense à l'album et aux photos.", "L'album est vieux. Et les photos ?", "Les photos sont de 2025. Et la fiche de vente dit : 1900.", "L'album est ancien, mais les photos sont récentes. Alors, la fiche de vente est fausse."],
    F04: ["Une fiche juste dit la vérité sur l'album et sur les photos.", "L'album est vieux. Les photos sont des copies.", "Les photos sont de 2025. « Paris 1900 », c'est le titre de la série.", "Album ancien. Copies de photos prises en 2025. Série en costumes « Paris 1900 »."],
    W2: ["Raconte dans l'ordre : le vendeur, Chloé, l'album, la fin.", { fr: "Regarde les débuts de phrases.", action: "material" }, "Le décor à l'imparfait : le vendeur disait. L'action au passé composé : Chloé a pris, il a coupé.", "Au moins 40 mots, un imparfait (disait, était), un passé composé (a pris, a coupé), et trois mots de l'affaire : le vendeur, les photos, Chloé…"]
  };

  /* ---------- Diagnose: Beschreibungen für die Lehrkraft ---------- */
  G.diag = {
    D_O02: "Gesicht und Uhr auf dem Albumfoto", D_O03: "W-Fragen statt Ja-Nein-Fragen", D_O04: "Versprechen über die Fotos (nicht über das Buch)",
    D_O06: "Dokument sagt ja, nein, nichts", D_R1: "Abfrage: Eröffnung des Museums",
    D_P00: "Gleiche Dinge auf zwei Bildern", D_P01: "Details der Baguette", D_P01b: "Requisit statt Brot", D_P02: "Wen fragen", D_P03: "Reihenfolge der Erinnerung", D_P03b: "Was die Assistentin nicht weiß",
    D_I01: "Was Marcel weiß (nicht vermutet)", D_I02: "Hören: wann, warum, wie", D_Itemps: "Imparfait und passé composé (freiwillig)", D_I03: "Gleiche Details: dieselbe Baguette",
    D_R2: "Abfrage: Fotografin und Uhrzeit", D_I05: "Was wir wirklich wissen",
    D_C01: "Ausschnitt und Vollbild, abgeschnittene Details", D_C02: "Datum, Titel, Preise", D_R3: "Abfrage: Datum und Titel", D_W1: "Nachricht an die Bouquiniste",
    D_F01: "Beweise mit Pflichtbeleg", D_F03: "Wie das Album entstand", D_F03b: "Altes Album, neue Fotos", D_F04: "Eine richtige Fiche", D_R4: "Abfrage: was falsch war", D_W2: "Rapport"
  };

  /* ---------- Lehrkraft: Lösungen, Freischalten ---------- */
  G.profSolutions = [
    ["O02", "Auf Foto A Luciens Gesicht und die goldene Uhr; die Baguette auf B gibt nur eine Bemerkung"],
    ["O03", "Quand est-ce qu'on a pris les photos ? (F1) · Quelles photos est-ce que vous vendez ? (F2)"],
    ["O04", "On a pris les photos en 1900 · Ce sont des photos originales, pas des copies"],
    ["O06", "oui: Le bâtiment existait en 1900 · non: déjà un musée / légende juste · rien: photo A en 2025 / toutes fausses"],
    ["R1", "1986 (Falle 1900)"],
    ["P00", "Lampadaires, colonnes, statues, jeweils auf beiden Bildern antippen; Boot und Fahrrad nur heute"],
    ["P01", "Bout cassé, ruban adhésif, gant blanc; freiwillig: der Stativfuß am linken Rand (setzt pied_vu)"],
    ["P01b", "Cette baguette ressemble à un accessoire de théâtre"],
    ["P02", "Beide Fragen: Marcel (Invalides), Chloé (14 h, stand 6)"],
    ["P03", "costumes → tombe → ramasse → recommence"], ["P03b", "la date exacte des photos"],
    ["I01", "Lucien était un acteur sur ces photos · La séance photo était l'année dernière"],
    ["I02", "en septembre, l'année dernière · La baguette est tombée · avec trois morceaux de ruban adhésif"],
    ["Itemps", "faisait, tenait, est tombée, a mis (freiwillig, Tisch mit den Requisiten)"],
    ["I03", "Bout cassé und ruban adhésif, jeweils auf beiden Bildern antippen"],
    ["R2", "Chloé · 14 h"], ["I05", "La légende de la photo A est fausse. Et Marcel reconnaît sa baguette…"],
    ["C01", "A → P17, B → P18, C → P19 (Falle P16); dann: Assistentin mit Smartphone (P17), LED-Lampe auf Stativ (P18), Filmklappe (P19)"],
    ["C02", "septembre 2025 = date · Paris 1900 = titre · 18 € = copies · 180 € = album"],
    ["R3", "(en) septembre 2025 · le titre de la série"],
    ["W1", "Mindestens 25 Wörter mit Jahr (2025), Titel oder Serie und etwas zum Zeigen (photos entières, fiche…)"],
    ["F01", "Pflicht: fiche de vente = photos de 1900, pas des copies; dazu zwei aus: photos entières = mêmes photos, bords coupés · fiche de Chloé = septembre 2025 · photo de la baguette = photo B de 2025"],
    ["F03", "séance 2025 → copies → bords coupés → collées → fiche"], ["F03b", "L'album est ancien, mais les photos sont récentes…"],
    ["F04", "Album ancien · Copies de photos prises en 2025 · Série en costumes « Paris 1900 »"],
    ["R4", "la date des photos (auch: pas de 1900, 2025, copies statt originales); Falle: la couverture"],
    ["W2", "Mindestens 40 Wörter, ein imparfait, ein passé composé, drei Themenwörter"]
  ];
  G.profUnlock = ["O01_done", "O02_done", "O04_done", "O06_done", "R1_done", "pied_vu", "p02_marcel", "p02_chloe", "P_done", "I02_done", "I03_done", "R2_done", "I_done", "C01_done", "C02_done", "R3_done", "W1_done"];

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
    ["ramasser, ramasse, ramassé, ramassée", "aufheben (vom Boden)"]
  ];

  return G;
})();
