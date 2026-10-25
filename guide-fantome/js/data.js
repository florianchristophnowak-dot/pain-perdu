/* Le guide fantôme (Pain perdu, Teil 2) – Spieldaten
   Quelle: Drehbuch Teil 2 (25. Oktober 2026). Kennungen wie im Drehbuch: N = Notre-Dame, G = Galeries Lafayette,
   E = Eiffelturm, B = Bouquinisten, F = Finale, Z = Nachspiel, R = Abfragen. Alle Spieltexte sind französisch,
   auch Linos Hilfe; nur das Glossar ist französisch-deutsch. */
window.GAME = (function () {
  const G = {};

  G.version = "2.0.0";

  /* ---------- Figuren ---------- */
  G.chars = {
    narrateur: { name: "", initials: "", color: "#8b7355" },
    marie: { name: "Marie", pt: "pt_marie", initials: "M", color: "#8a3b3b" },
    lino: { name: "Lino", pt: "pt_lino", initials: "L", color: "#3b4a6b" },
    nowak: { name: "M. Nowak", pt: "pt_nowak", initials: "N", color: "#5a5a5a" },
    beaumont: { name: "M. Beaumont", pt: "pt_beaumont", initials: "B", color: "#a0302a" },
    lucien: { name: "Lucien", pt: "pt_lucien", initials: "Lu", color: "#7a5a3a" },
    vendeuse: { name: "La vendeuse", pt: "pt_vendeuse", initials: "V", color: "#2f4b7a" },
    joueur: { name: "Le joueur", pt: "pt_joueur", initials: "J", color: "#4a4a4a" },
    spectateur: { name: "Un spectateur", pt: "pt_spectateur", initials: "S", color: "#6b5a3b" },
    spectatrice: { name: "Une spectatrice", pt: "pt_spectatrice", initials: "S", color: "#7a4a6b" },
    bouquiniste: { name: "La bouquiniste", pt: "pt_bouquiniste", initials: "Bq", color: "#3f6b3f" },
    agent: { name: "L'agent de sécurité", pt: "pt_agent", initials: "A", color: "#2b2b3b" },
    policiere: { name: "La policière", pt: "pt_policiere", initials: "P", color: "#1f3f6b" },
    touriste: { name: "Une touriste", pt: "pt_touriste", initials: "T", color: "#b07a2a" }
  };

  /* ---------- Feste Texte ---------- */
  G.ui = {
    title: "Le guide fantôme",
    subtitle: "Une enquête de Marie à Paris",
    verbs: { regarder: "Regarder", parler: "Parler", ecouter: "Écouter", lire: "Lire" },
    btn: {
      carnet: "Carnet", carte: "Carte", inventaire: "Inventaire", aide: "Aide", rejouer: "Rejouer", ecouter: "Écouter", transcription: "Transcription",
      continuer: "Continuer", exporter: "Exporter le carnet", valider: "Valider", fermer: "Fermer", glossaire: "Glossaire",
      commencer: "Commencer", reprendre: "Continuer la partie", nouvelle: "Nouvelle partie", menu: "Menu", repondre: "Répondre"
    },
    carnet: {
      title: "L'enquête de Marie", done: "réglé", open: "?", cards: "Nos textes",
      hint: "Le carnet ne note rien pour toi. Les noms, les lieux, les heures : tu les retiens, ou tu les écris sur ta feuille.",
      formules: "Le français de M. Beaumont", formule: "Une formule de politesse",
      formulesHint: "M. Beaumont parle très poliment. Touche ses formules de politesse dans ses phrases."
    },
    recall: {
      check: "Vérifier", later: "Revenir plus tard",
      pause: "Là, vous devinez. Allez vérifier, et revenez dans une minute.",
      paused: "Pas maintenant. Vérifiez d'abord, puis revenez dans {s} secondes.",
      wrong: "Non, ce n'est pas ça.", unknown: "Tu ne sais plus ? Va revoir, puis reviens.",
      intro: "Réponds de mémoire ou avec ta feuille.", empty: "Écris d'abord une réponse."
    },
    inv: { title: "Inventaire", empty: "Rien.", hint: "Clique sur un objet pour le regarder de près." },
    partner: "Changement ! {p2} prend la souris, {p1} prend le carnet.",
    solo: "Cette question, chacun répond seul. D'abord {p1}, puis {p2}.",
    soloNow: "C'est à {p} de répondre.",
    travel: [
      { who: "lino", fr: "Encore le métro. Tu connais toutes les lignes ?" },
      { who: "marie", fr: "Toutes. C'est ma ville." }
    ],
    end: "Bravo ! Le faux guide est démasqué.",
    endStats: "{places} lieux · {helps} aides de Lino · {mins} min · {q} questions sur 4",
    endExport: "Exporte le carnet et donne les fichiers à ton professeur.",
    mouse: "Souris :",
    sms: "message",
    helpWho: "Lino",
    lino: {
      ok: "Oui, c'est ça !",
      locked: "Pas encore. On ne sait pas encore où aller.",
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
    listen: "Écoute jusqu'au bout : après, tu peux continuer.",
    listenMore: "Tu peux écouter plusieurs fois.",
    audioLeft: "Encore {n} fois.",
    audioLast: "Tu ne peux plus écouter.",
    loupe: {
      found: "Trouvé : {n} sur {m}",
      odd: "Choses bizarres : {n} sur {m}",
      hint: "Zoome avec + et − ou avec la molette. Déplace l'image avec la souris. Clique sur les détails.",
      hintTouch: "Zoome avec deux doigts ou avec + et −. Déplace l'image avec un doigt. Touche les détails.",
      observeHint: "Regarde la scène. Touche ce qui est bizarre.",
      in: "Zoomer", out: "Dézoomer", reset: "100 %"
    },
    card: { flip: "Retourner la carte", corner: "Le coin se décolle" },
    chainUp: "Monter", chainDown: "Descendre",
    proof: "Preuve {n}", proofItem: "un objet…", proofSentence: "ce qu'il montre…",
    write: {
      count: "{n} mots (minimum {min})",
      more: "Encore {n} mots, au moins.",
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
      ios: "Sur l'iPhone, le navigateur ne peut pas mettre le jeu en plein écran. Mais tu peux mettre le jeu sur l'écran d'accueil :",
      iosSteps: ["Touche « Partager » : le carré avec la flèche (parfois sous « … »).", "Choisis « Sur l'écran d'accueil ».", "Ouvre le jeu avec la nouvelle icône : il est en plein écran."],
      iosNote: "Attention : là, le jeu a sa propre sauvegarde. Et tourne ton téléphone : l'image est plus grande.",
      other: "Ton navigateur ne peut pas mettre le jeu en plein écran. Ouvre le menu du navigateur et choisis « Ajouter à l'écran d'accueil ». Avec la nouvelle icône, le jeu s'ouvre sans la barre du navigateur."
    },
    mapHint: "Touche un lieu pour y aller.",
    locked: "fermé",
    confirmNew: "Commencer une nouvelle partie ? La partie actuelle reste dans les résultats de cet appareil.",
    confirmReplace: "Il y a déjà une partie sur cet appareil. Commencer une nouvelle partie ?"
  };

  /* ---------- Freie Texte: häufige Wörter der Spielsprache (own) und typische Wörter anderer Sprachen (foreign) ---------- */
  G.writeLang = {
    own: "le la les l un une des du de d et est a au aux il elle on nous vous ils elles je j tu ne n pas que qu qui dans sur sous avec pour par en son sa ses notre nos mon ma mes ce cet cette ces c s se y etait etaient avait avaient avons ont sont ai as va vont allons fait puis mais alors donc tres apres avant pendant chez aussi tout tous plus leur leurs lui moi toi comme quand parce ou rien jamais venez payez",
    foreign: "der die das den dem und ist sind war waren hat haben hatte hatten nicht ich wir ihr sie er ein eine einen einem einer mit auf zum zur im ins von vom bei nach aus wo was wie aber auch dann noch schon weil dass oder mein meine unser unsere unseren wurde the and is of to with my we he she they it this that have has had in at our",
    share: 0.2
  };

  /* ---------- Die vier Fragen im Carnet ---------- */
  G.questions = {
    Q1: { title: "Qui est vraiment M. Beaumont ?", done: ["badge_faux", "E03_done"], answer: "Il s'appelle Lucien. Ce n'est pas un guide." },
    Q2: { title: "Qu'est-ce qu'il nous a vendu ?", done: ["N06_done", "G06_done"], answer: "Rien. Les cartes sont des bons de réduction." },
    Q3: { title: "Où et quand est-ce qu'il va revenir ?", done: ["G05_done", "E04_done"], answer: "Aujourd'hui, aux Galeries Lafayette, pour rendre le manteau." },
    Q4: { title: "Comment est-ce qu'on peut le prouver ?", done: "F05_done", answer: "Avec trois preuves : {proofs}." }
  };
  G.openAfter = "N08_done";   // Carnet und Karte öffnen sich nach dem Auftakt

  /* ---------- Höflichkeitsformeln von M. Beaumont (antippbar in N01 und N04) ---------- */
  G.formules = ["Excusez-moi de vous déranger", "Je vous propose", "Avec plaisir", "s'il vous plaît", "Merci beaucoup"];

  /* ---------- Gezeichnete Dokumente ---------- */
  G.docs = {
    badge: { head: "GUIDE OFFICIEL", sub: "Ville de Paris", fields: ["Nom : M. Beaumont", "Carte n° 0715", "Valable jusqu'au 31 février"] },
    card: {
      sticker: ["VISITE EXCLUSIVE", "PARIS SECRET"],
      under: ["RÉDUCTION", "DEUXIÈME ARTICLE", "À MOITIÉ PRIX"],
      number: "N° 042",
      stamp: "Rendez-vous des groupes : 13 h, tour Eiffel, pilier nord"
    }
  };

  /* ---------- Inventar ---------- */
  G.items = {
    photo_groupe: { emoji: "🖼️", name: "la photo de groupe", desc: "La classe devant Notre-Dame. M. Beaumont tient son parapluie rouge devant son visage.", img: "doc_photo_groupe" },
    selfie: { emoji: "🤳", name: "le selfie de Lino", desc: "Lino, Kevin et M. Beaumont, sans parapluie. On voit son visage.", img: "doc_selfie" },
    badge: { emoji: "🪪", name: "la photo du badge", desc: "GUIDE OFFICIEL · Ville de Paris · M. Beaumont · valable jusqu'au 31 février", render: "badge" },
    carte: { emoji: "🎟️", name: "une carte « Visite exclusive »", desc: "N° 042. Un coin de l'autocollant se décolle.", desc2: { if: "carte_peeled", text: "N° 042. Sous l'autocollant : RÉDUCTION – DEUXIÈME ARTICLE À MOITIÉ PRIX." }, render: "card" },
    fiche: { emoji: "📝", name: "la fiche de signalement", desc: "Notre description de M. Beaumont :", cards: "N07b" },
    plan: { emoji: "🗺️", name: "le plan de Paris", desc: "Notre-Dame, les Galeries Lafayette, la tour Eiffel. Et les quais de la Seine." },
    telephone: { emoji: "📱", name: "le téléphone de Marie", desc: "Pour écrire à M. Nowak." },
    page_guide: { emoji: "📖", name: "une page de « Paris insolite »", desc: "Paris insolite, 1958. Page 27 : une petite porte, l'entrée des livraisons. Pas de porte secrète." },
    papier: { emoji: "📄", name: "le papier de M. Beaumont", desc: "1. p. 12 – 2. p. 27 – 3. p. 41 – photo – 15 h : p. 12" }
  };

  /* ---------- Hörtexte ---------- */
  G.audio = {
    au_beaumont: { who: "beaumont", text: "Mesdames, messieurs, bienvenue dans le Paris secret ! Regardez cette petite porte. Au Moyen Âge, c'était une porte secrète. Les rois passaient par là, la nuit. Venez, venez… Ici, il y avait une boulangerie. Le boulanger vendait un pain très léger : il était plein d'air. Un jour, les clients ont compris. Et maintenant, une petite pause photo !" },
    au_telephone: { who: "joueur", text: "Allô ? Lucien ? … Oui. Tu rapportes le manteau maintenant ? … D'accord. Attends, il reste encore des billets… Oui, oui. À tout à l'heure." },
    au_bouquiniste: { who: "bouquiniste", text: "Ah, le monsieur au parapluie rouge ! C'était mon premier client ce matin. D'habitude, j'ouvre plus tard, mais aujourd'hui, j'étais là à dix heures. Il est venu à dix heures et demie. Il avait déjà son beau manteau. Il cherchait un vieux guide de Paris. Il a pris « Paris insolite », une édition de 1958. J'en ai encore un, regardez." }
  };

  /* ---------- Szenen und Hotspots (Koordinaten in % des Bildes) ---------- */
  G.scenes = {
    notredame: {
      name: "Notre-Dame · le parvis", bg: "bg_parvis", enter: [{ if: "N08_done", node: "Nr" }, { node: "N00" }],
      hotspots: [
        { id: "nowak", label: "M. Nowak", x: 23, y: 38, w: 12, h: 60, actions: { parler: "Nr" }, showIf: "N08_done" },
        { id: "classe", label: "la classe", x: 1, y: 40, w: 21, h: 56, actions: { regarder: "Ncl" }, showIf: "N08_done" },
        { id: "cathedrale", label: "Notre-Dame", x: 52, y: 2, w: 33, h: 68, actions: { regarder: "Nc" }, showIf: "N08_done" }
      ]
    },
    lafayette: {
      name: "Galeries Lafayette · 2e étage", bg: "bg_lafayette", enter: [{ if: "G06_done", node: "Gr" }, { node: "G00" }],
      hotspots: [
        { id: "vendeuse", label: "la vendeuse", x: 26, y: 32, w: 15, h: 40, actions: { parler: "Gr" }, showIf: "G06_done" },
        { id: "coupole", label: "la coupole", x: 20, y: 0, w: 78, h: 28, actions: { regarder: "Gc" }, showIf: "G06_done" }
      ]
    },
    eiffel: {
      name: "Tour Eiffel · pilier nord", bg: "bg_eiffel", enter: [{ if: "E05_done", node: "Er" }, { node: "E00" }],
      hotspots: [
        { id: "joueur", label: "le joueur", x: 36, y: 41, w: 13.5, h: 52, actions: { regarder: "Er" }, showIf: "E05_done" },
        { id: "tour", label: "la tour Eiffel", x: 2, y: 0, w: 50, h: 42, actions: { regarder: "Et" }, showIf: "E05_done" }
      ]
    },
    bouquinistes: {
      name: "Les bouquinistes · quai de Montebello", bg: "bg_quai", enter: [{ if: "B06_done", node: "Br" }, { node: "B00" }],
      hotspots: [
        { id: "bouquiniste", label: "la bouquiniste", x: 27, y: 30, w: 15, h: 36, actions: { parler: "Br" }, showIf: "B06_done" },
        { id: "boites", label: "les boîtes vertes", x: 0, y: 66, w: 58, h: 32, actions: { regarder: "Bb" }, showIf: "B06_done" }
      ]
    },
    retours: {
      name: "Galeries Lafayette · service des retours", bg: "bg_retours", enter: [{ if: "finished", node: "Fr" }, { if: "R5_done", node: "F00" }, { node: "R5" }],
      hotspots: []
    }
  };
  /* Station je Knoten (für „hier geht es weiter“ und die Lehrkraftansicht) */
  G.homeScene = { N: "notredame", G: "lafayette", E: "eiffel", B: "bouquinistes", F: "retours", Z: "notredame", R1: "notredame", R2: "lafayette", R3: "eiffel", R3b: "eiffel", R4: "bouquinistes", R5: "retours" };
  G.startScene = "notredame";
  G.start = "N00";

  /* ---------- Karte ---------- */
  G.map = {
    places: [
      { id: "notredame", label: "Notre-Dame · le parvis", short: "Notre-Dame", q: "Le départ de la visite", x: 50, y: 50, unlock: "always", done: ["R1_done"] },
      { id: "lafayette", label: "Galeries Lafayette", short: "Lafayette", q: "D'où vient le manteau ?", x: 47, y: 20, labelAbove: true, unlock: "R1_done", lockedMsg: [{ if: "N08_done", fr: "D'abord, réponds à M. Nowak." }], done: ["R2_done"] },
      { id: "eiffel", label: "Tour Eiffel · pilier nord", short: "Tour Eiffel", q: "Rendez-vous à 13 h", x: 18, y: 50, unlock: "R1_done", lockedMsg: [{ if: "N08_done", fr: "D'abord, réponds à M. Nowak." }], done: ["R3b_done"] },
      { id: "bouquinistes", label: "Les bouquinistes · quai de Montebello", short: "Bouquinistes", q: "Le vieux livre", x: 57, y: 60, unlock: "R1_done", lockedMsg: [{ if: "N08_done", fr: "D'abord, réponds à M. Nowak." }], done: ["R4_done", "B06_done"], optional: true },
      { id: "retours", label: "Galeries Lafayette · service des retours", short: "Service des retours", q: "Il rend le manteau", x: 60, y: 26, unlock: ["R2_done", "R3b_done"], lockedMsg: "Pas encore. On ne sait pas quand il revient.", done: ["F05_done"] }
    ]
  };

  /* ---------- Offene Abfragen: Wer auf eine Antwort wartet, meldet sich im leeren Dialogfeld ---------- */
  G.pending = [
    { if: "N08_done", unless: "R1_done", who: "nowak", sms: true, fr: "Marie ? La police me pose une question.", node: "R1" },
    { if: "G06_done", unless: "R2_done", who: "nowak", sms: true, fr: "Marie, encore une question, s'il te plaît.", node: "R2" },
    { if: "E05_done", unless: "R3_done", who: "nowak", sms: true, fr: "Marie ? La policière a une question.", node: "R3" },
    { if: "R3_done", unless: "R3b_done", who: "lino", fr: "Marie, attends. Et maintenant ?", node: "R3b" },
    { if: "B05_done", unless: "R4_done", scene: "bouquinistes", who: "lino", fr: "Attends, j'ai une question.", node: "R4" },
    { if: ["R2_done", "R3b_done"], unless: "R5_done", scene: "retours", who: "lino", fr: "Avant d'entrer, une question.", node: "R5" }
  ];

  /* ---------- Knoten ---------- */
  // Zeile: { who, fr, sms?, onlyIf?, from?, notFrom? }
  // Auswahl: { fr, kind: ok|repair|wrong, reply: [Zeilen], next, effects }
  const N = {};
  const L = (who, fr, extra) => Object.assign({ who, fr }, extra || {});
  const lino = fr => L("lino", fr), marie = fr => L("marie", fr);

  /* ===== 2 Auftakt an Notre-Dame ===== */
  N.N00 = { type: "cut", bg: "cut_beaumont", lines: [
    L("narrateur", "Paris, le deuxième jour. Il est onze heures moins cinq. La classe 10b d'Ohrdruf attend sur le parvis de Notre-Dame. Marie, la correspondante de Lino, est avec eux."),
    L("nowak", "… dix-neuf, vingt, vingt et un… Il manque quelqu'un ?"),
    marie("Il y a toujours beaucoup de monde ici. Et beaucoup de guides.")
  ], next: "N01" };
  N.N01 = { type: "lines", lines: [
    L("beaumont", "Vingt-deux, monsieur. Avec la jeune fille, là."),
    L("nowak", "Ah… merci."),
    L("beaumont", "Excusez-moi de vous déranger. Je m'appelle Beaumont, je suis guide officiel."),
    L("narrateur", "Il montre son badge."),
    L("beaumont", "Je vous propose une visite exclusive : le Paris que les autres guides ne connaissent pas. Dix euros par personne maintenant, le reste à la fin."),
    lino("Il compte mieux que M. Nowak."),
    L("nowak", "Bon. D'accord."),
    L("beaumont", "Avec plaisir. Suivez le parapluie rouge, s'il vous plaît !")
  ], next: "N02" };
  N.N02 = { type: "audio", audio: "au_beaumont", title: "La visite", intro: "M. Beaumont fait la visite. Écoute bien.", transcriptHelp: "N03", next: "N03" };
  N.N03 = { type: "task", title: "Qu'est-ce qu'il a raconté ?", audio: "au_beaumont", listenFirst: true, help: "N03", diag: "D_N03",
    task: { kind: "pick", n: 3, question: "M. Beaumont a raconté deux histoires. Choisis les trois phrases qu'il a dites.",
      options: [
        { id: "porte", label: "Au Moyen Âge, la petite porte était une porte secrète.", ok: true },
        { id: "rois", label: "Les rois passaient par cette porte, la nuit.", ok: true },
        { id: "pain", label: "Le boulanger vendait un pain plein d'air.", ok: true },
        { id: "boulangerie", label: "Les rois habitaient dans la boulangerie.", reply: lino("Des rois dans une boulangerie ? Il n'a pas dit ça.") },
        { id: "riche", label: "Le boulanger était très riche.", reply: lino("Il n'a pas parlé d'argent. Enfin… pas encore.") },
        { id: "ouverte", label: "Aujourd'hui, la porte est ouverte.", reply: lino("Il a parlé du Moyen Âge, pas d'aujourd'hui.") }
      ],
      wrong: lino("Pas encore. Il a dit trois de ces phrases.") },
    next: "N04" };
  N.N04 = { type: "cut", bg: "doc_photo_groupe", lines: [
    L("narrateur", "Pause photo devant la cathédrale. M. Beaumont se met à côté de la classe, avec son parapluie. Clic. Lino prend aussi un selfie : lui, Kevin… et le guide."),
    L("beaumont", "Et maintenant, l'acompte, s'il vous plaît. Dix euros par personne. Merci beaucoup."),
    L("narrateur", "M. Nowak donne une enveloppe : deux cent vingt euros. M. Beaumont distribue une carte à chaque élève."),
    L("beaumont", "Voici vos cartes. Je vais chercher les billets pour la suite. Je reviens tout de suite !"),
    L("narrateur", "Il est parti à midi moins le quart. Maintenant, il est midi et quart. Le parapluie rouge n'est pas revenu."),
    L("nowak", "… vingt et un, vingt-deux. Tout le monde est là !"),
    marie("Tout le monde, sauf celui qui comptait mieux que vous."),
    lino("On a des cartes. On n'a pas de guide."),
    L("nowak", "Je reste avec la classe et j'appelle la police. Marie, Lino, vous regardez les photos ? Vous êtes mes détectives.")
  ], effects: { items: ["photo_groupe", "selfie", "badge", "carte", "plan", "telephone"], flag: "N04_done" }, next: "N04a" };

  N.N04a = { type: "task", title: "La photo de groupe", help: "N04a", diag: "D_N04a",
    task: { kind: "loupe", img: "doc_photo_groupe", ar: 1.3333, status: "Détails sur M. Beaumont : {n} sur {m}",
      intro: "Regarde la photo de près. Trouve quatre détails sur M. Beaumont.",
      points: [
        { id: "parapluie", need: true, chip: "le parapluie", x: 78.5, y: 32.5, w: 20.8, h: 17.8, line: marie("Le parapluie cache son visage. Pratique.") },
        { id: "etiquette", need: true, chip: "l'étiquette", x: 93.8, y: 59, w: 3.2, h: 5, line: marie("Une étiquette sur la manche. Son manteau est neuf. Très neuf.") },
        { id: "sac", need: true, chip: "le sac", x: 89.5, y: 63, w: 8, h: 11.5, line: lino("Un sac des Galeries Lafayette. Il fait du shopping, notre guide.") },
        { id: "livre", need: true, chip: "le livre", x: 89.8, y: 51.3, w: 5, h: 7.2, line: marie("Un vieux livre. Un guide de Paris, peut-être.") },
        { id: "prix", chip: "le prix", minZoom: 2, x: 90.6, y: 56, w: 2.2, h: 2.6, flag: "prix_vu", also: ["livre"], line: marie("Il y a un prix au crayon : huit euros.") },
        { id: "notre_dame", neutral: true, x: 52, y: 0, w: 40, h: 30, line: lino("Ça, c'est Notre-Dame. Elle n'a rien fait.") },
        { id: "classe", neutral: true, x: 0, y: 38, w: 76, h: 56, line: lino("La classe. Tout le monde sourit. Sauf M. Nowak.") }
      ],
      labels: [
        { x: 93.5, y: 68.8, text: "Galeries\nLafayette", cls: "bag" },
        { x: 95.35, y: 61.6, text: "Galeries\nLafayette", cls: "tag", minZoom: 2.5 },
        { x: 91.6, y: 57.2, text: "8 €", cls: "pencil", minZoom: 2 }
      ],
      material: [{ x: 78, y: 30, w: 21, h: 46 }] },
    next: "N04b" };
  N.N04b = { type: "task", title: "Le selfie de Lino", help: "N04b", diag: "D_N04b",
    task: { kind: "loupe", img: "doc_selfie", ar: 1.3333, status: "Détails sur son visage : {n} sur {m}",
      intro: "Sur le selfie de Lino, on voit le visage de M. Beaumont. Trouve deux détails.",
      points: [
        { id: "moustache", need: true, chip: "la moustache", x: 72, y: 38.5, w: 12, h: 6.5, line: marie("Une moustache grise.") },
        { id: "montre", need: true, chip: "la montre", x: 83, y: 58, w: 9, h: 8, line: marie("Une montre dorée. Elle brille.") },
        { id: "appareil", neutral: true, x: 45, y: 48.5, w: 10, h: 7, line: lino("Ça, c'est l'appareil dentaire de Kevin. Ça ne nous aide pas.") },
        { id: "lino", neutral: true, x: 4, y: 18, w: 32, h: 80, line: lino("Moi. Très photogénique.") },
        { id: "kevin", neutral: true, x: 37, y: 22, w: 26, h: 76, line: lino("Kevin. Il sourit toujours avec son appareil.") },
        { id: "beaumont", neutral: true, x: 64, y: 15, w: 34, h: 83, line: lino("M. Beaumont. Regarde son visage de plus près.") }
      ],
      material: [{ x: 64, y: 15, w: 34, h: 55 }] },
    next: "N05" };
  N.N05 = { type: "doc", title: "Le badge", render: "badge", help: "N05", diag: "D_N05",
    lines: [lino("J'ai aussi une photo de son badge. Il était très fier de son badge.")],
    question: "Qu'est-ce qui ne va pas sur ce badge ?",
    choices: [
      { fr: "La date : le 31 février n'existe pas.", kind: "ok", effects: { flag: "badge_faux" }, reply: [marie("Février a vingt-huit jours. Vingt-neuf, parfois. Jamais trente et un.")] },
      { fr: "Le nom : Beaumont, c'est bizarre.", kind: "wrong", reply: [lino("Beaumont, c'est un vrai nom. Le problème est ailleurs.")] },
      { fr: "La photo : il ne sourit pas.", kind: "wrong", reply: [lino("Sur un badge, personne ne sourit.")] },
      { fr: "Le mot « officiel » est mal écrit.", kind: "wrong", reply: [lino("Non, « officiel », c'est juste. Regarde les chiffres.")] }
    ],
    effects: { flag: "N05_done" }, next: "N06l" };
  N.N06l = { type: "lines", lines: [lino("J'ai le numéro 42. Kevin aussi. Tout le monde.")], next: "N06" };
  N.N06 = { type: "task", title: "Les cartes", help: "N06", diag: "D_N06",
    task: { kind: "loupe", render: "card", ar: 1.6, maxZoom: 3, status: "Trouvé : {n} sur {m}",
      intro: "Regarde la carte de près. Les deux côtés.",
      points: [
        { id: "numero", need: true, chip: "le numéro", side: "front", x: 3, y: 82, w: 26, h: 15, line: marie("Le même numéro sur toutes les cartes. Ce n'est pas normal pour des billets.") },
        { id: "peel", need: true, chip: "l'autocollant", action: "peel", line: lino("Il y a quelque chose dessous ! Lis.") },
        { id: "flip", need: true, chip: "le dos", action: "flip", line: marie("Un rendez-vous. Mais pas pour nous.") },
        { id: "dessous", neutral: true, side: "front", onlyIf: "carte_peeled", x: 48, y: 6, w: 47, h: 42, line: lino("Une réduction ? Pour une visite ?") },
        { id: "sticker", neutral: true, side: "front", x: 5, y: 6, w: 90, h: 72, line: lino("Visite exclusive… Paris secret. Très secret.") },
        { id: "stamp", neutral: true, side: "back", x: 8, y: 50, w: 84, h: 40, line: marie("Treize heures, tour Eiffel, pilier nord.") }
      ],
      material: [{ x: 80, y: 4, w: 17, h: 26 }] },
    after: [lino("C'est une visite ou une promotion ?"), marie("Pour l'instant, surtout une disparition.")],
    effects: { flag: "N06_done" }, next: "N07" };
  N.N07 = { type: "lines", lines: [L("nowak", "Marie, la police veut une description de M. Beaumont. En français, s'il te plaît.", { sms: true })], next: "N07a" };
  N.N07a = { type: "task", title: "La fiche de signalement", help: "N07a", diag: "D_N07a",
    task: { kind: "gap", intro: "Choisis la forme qui convient.",
      parts: [
        "Il ", { id: "g1", opts: ["était", "a été"], answer: "était" }, " grand. Il ", { id: "g2", opts: ["avait", "a eu"], answer: "avait" },
        " une moustache grise. Il ", { id: "g3", opts: ["portait", "a porté"], answer: "portait" }, " un manteau beige et une montre dorée. Il ",
        { id: "g4", opts: ["avait", "a eu"], answer: "avait" }, " un parapluie rouge. À midi moins le quart, il ", { id: "g5", opts: ["partait", "est parti"], answer: "est parti" }, " avec 220 euros."
      ],
      wrong: lino("C'est le décor ou l'action ?") },
    next: "N07b" };
  N.N07b = { type: "task", title: "La fiche de signalement", perPlayer: true, help: "N07b", diag: "D_N07b",
    task: { kind: "write", min: 12, rows: 4, intro: "Ajoute deux phrases. Comment est-ce qu'il parlait ? Comment est-ce qu'il était ?",
      starters: ["Il parlait...", "Il était très...", "Il avait les cheveux..."],
      topic: ["moustache", "manteau", "poli", "parl", "lent", "cheveu", "grand"], topicMin: 2,
      topicMsg: "Parle de M. Beaumont : comment il parlait, comment il était.",
      matImgs: ["doc_selfie"] },
    next: "N07c" };
  N.N07c = { type: "task", title: "La fiche de signalement", help: "N07c", diag: "D_N07c",
    task: { kind: "cols", intro: "Qu'est-ce qu'il peut changer facilement ?",
      columns: [{ id: "facile", label: "Il peut le changer facilement" }, { id: "difficile", label: "C'est plus difficile" }],
      cards: [
        { id: "parapluie", label: "le parapluie rouge", col: "facile" },
        { id: "moustache", label: "la moustache grise", col: "difficile" },
        { id: "manteau", label: "le manteau beige", col: "facile" },
        { id: "voix", label: "sa voix", col: "difficile" },
        { id: "badge", label: "le badge", col: "facile" },
        { id: "taille", label: "sa taille", col: "difficile" }
      ],
      matImgs: ["doc_photo_groupe", "doc_selfie"],
      wrong: lino("Pas encore.") },
    after: [lino("Le parapluie, il peut le fermer. Le manteau, il peut le rendre. La moustache… c'est plus difficile.")],
    effects: { item: "fiche", flag: "N07_done" }, next: "N08" };
  N.N08 = { type: "task", title: "Où est-ce qu'on va ?", help: "N08", diag: "D_N08",
    task: { kind: "sort", intro: "Chaque indice montre un lieu. Où est-ce qu'il mène ?",
      slots: [
        { id: "etiquette", label: "l'étiquette sur la manche", answer: "lafayette" },
        { id: "sac", label: "le sac", answer: "lafayette" },
        { id: "rdv", label: "le rendez-vous sur la carte", answer: "eiffel" },
        { id: "livre", label: "le vieux livre", answer: "bouquinistes" }
      ],
      options: [
        { id: "lafayette", label: "les Galeries Lafayette" },
        { id: "eiffel", label: "la tour Eiffel" },
        { id: "bouquinistes", label: "les bouquinistes" },
        { id: "louvre", label: "le Louvre", reply: lino("Le Louvre ? Il n'y a pas d'indice pour le Louvre.") }
      ],
      matImgs: ["doc_photo_groupe"], matText: "La carte, au dos : « Rendez-vous des groupes : 13 h, tour Eiffel, pilier nord »",
      wrong: lino("Pas encore. Regarde chaque indice.") },
    next: "N08w" };
  N.N08w = { type: "choice", who: "marie", prompt: L("marie", "Par où est-ce qu'on commence ? Et pourquoi ?"), diag: "D_N08w", store: true,
    choices: [
      { fr: "Les Galeries Lafayette, parce qu'il a acheté son manteau là-bas.", kind: "ok", effects: { flag: "way_lafayette" } },
      { fr: "La tour Eiffel, parce qu'il y a un rendez-vous à 13 heures.", kind: "ok", effects: { flag: "way_eiffel" } },
      { fr: "Les bouquinistes, parce qu'il avait un vieux livre.", kind: "ok", effects: { flag: "way_bouquinistes" } }
    ],
    next: "N08e" };
  N.N08e = { type: "lines", doneAt: true, lines: [
    marie("Deux pistes : le magasin et la tour Eiffel. Et les bouquinistes sont juste en face."),
    lino("Paris est petit quand on a un plan.")
  ], effects: { flag: "N08_done" }, next: "R1" };
  /* Nebenbemerkungen nach dem Auftakt */
  N.Nr = { type: "lines", amb: true, lines: [L("nowak", "La police arrive. La classe reste avec moi. Allez-y, mes détectives !")], next: "RESUME" };
  N.Ncl = { type: "lines", amb: true, lines: [lino("Kevin veut savoir si la visite est remboursée."), marie("Pas encore.")], next: "RESUME" };
  N.Nc = { type: "lines", amb: true, lines: [lino("Elle est là depuis huit cents ans. Elle, elle ne part pas avec l'argent.")], next: "RESUME" };

  /* ===== 3 Galeries Lafayette ===== */
  N.G00 = { type: "cut", bg: "bg_lafayette", lines: [
    L("narrateur", "Métro ligne 7, de Pont Neuf à Chaussée d'Antin–La Fayette.", { notFrom: "eiffel" }),
    L("narrateur", "Métro ligne 9, d'Iéna à Chaussée d'Antin–La Fayette.", { from: "eiffel" }),
    L("narrateur", "Les Galeries Lafayette : une grande coupole, des parfums, beaucoup de touristes."),
    lino("C'est un magasin ou une cathédrale ?"),
    marie("Un magasin. Mais aujourd'hui, on ne vient pas pour acheter.")
  ], next: "G01" };
  N.G01 = { type: "doc", title: "Le plan du magasin", help: "G01", diag: "D_G01",
    docs: [
      { label: "Rez-de-chaussée", text: "parfums, accessoires, parapluies · Service des retours (porte 5)" },
      { label: "1er étage", text: "mode femme" },
      { label: "2e étage", text: "mode homme, manteaux" },
      { label: "3e étage", text: "enfants" },
      { label: "4e étage", text: "maison" }
    ],
    question: "Où est-ce qu'il a acheté son manteau ?",
    choices: [
      { fr: "Au 2e étage.", kind: "ok", reply: [marie("Mode homme, manteaux. On monte.")] },
      { fr: "Au rez-de-chaussée.", kind: "wrong", reply: [lino("Des parapluies, oui. Des manteaux, non.")] },
      { fr: "Au 1er étage.", kind: "wrong", reply: [lino("Mode femme. Son manteau est un manteau d'homme.")] },
      { fr: "Au 4e étage.", kind: "wrong", reply: [lino("La maison ? Il n'a pas acheté un canapé.")] }
    ],
    effects: { flag: "G01_done" }, next: "G02" };
  N.G02 = { type: "choice", who: "vendeuse", help: "G02", diag: "D_G02",
    lines: [L("narrateur", "La vendeuse regarde la photo de groupe. Elle regarde seulement le manteau.")],
    prompt: L("vendeuse", "Ah, ce manteau. Vous voulez acheter le manteau ?"),
    choices: [
      { fr: "Non, on cherche l'homme qui le portait.", kind: "ok", reply: [L("vendeuse", "Alors, vous ne cherchez pas un manteau."), marie("Si. Enfin, non. On cherche l'homme dans le manteau."), L("vendeuse", "Montrez-moi.")] },
      { fr: "Oui, il coûte combien ?", kind: "repair", reply: [L("vendeuse", "Trois cent quarante-neuf euros. Le deuxième est à moitié prix."), lino("On en prend zéro.")] },
      { fr: "Vous avez vu un guide ?", kind: "repair", reply: [L("vendeuse", "Ici, on vend des vêtements. Pas des guides.")] }
    ],
    effects: { flag: "G02_done" }, next: "G03" };
  N.G03 = { type: "choice", who: "marie", help: "G03", diag: "D_G03",
    prompt: L("lino", "Qu'est-ce que tu montres à la vendeuse ?"),
    choices: [
      { fr: "L'étiquette sur la manche (sur la photo).", kind: "ok", reply: [L("vendeuse", "Ah. Ça, oui. C'est notre manteau en laine, beige, taille 52."), lino("Son uniforme, quoi."), L("vendeuse", "Ce n'est pas un uniforme. C'est un manteau.")] },
      { fr: "Le parapluie (sur la photo).", kind: "repair", reply: [L("vendeuse", "Ce parapluie-là, on ne le vend pas.")] },
      { fr: "Le badge.", kind: "repair", reply: [L("vendeuse", "Ce badge ne vient pas de chez nous. Et franchement, il ne va pas avec le manteau.")] },
      { fr: "Le selfie de Lino.", kind: "repair", reply: [L("vendeuse", "Un monsieur avec une moustache. Il y en a beaucoup. Ici, on regarde les vêtements, pas les visages.")] }
    ],
    effects: { flag: "G03_done" }, next: "G04" };
  N.G04 = { type: "task", title: "Poser les bonnes questions", help: "G04", diag: "D_G04",
    task: { kind: "ask", who: "vendeuse", intro: "Pose des questions à la vendeuse. Il te faut quatre informations sur ce client.",
      progress: "Informations : {n} sur {m}", facts: ["F1", "F2", "F3", "F4"],
      questions: [
        { q: "Vous l'avez vendu ?", a: "Oui.", yn: true },
        { q: "Vous l'avez vendu quand ?", a: "Ce matin, à l'ouverture. À dix heures. C'était mon premier client.", fact: "F1", w: true },
        { q: "Il a posé des questions ?", a: "Oui.", yn: true },
        { q: "Quelles questions est-ce qu'il a posées ?", a: "Des questions sur les retours. Pendant dix minutes.", fact: "F2", w: true },
        { q: "On peut rendre un manteau ?", a: "Oui.", yn: true },
        { q: "Comment est-ce qu'on peut rendre un manteau ?", a: "Avec le ticket de caisse et l'étiquette. Le jour même.", fact: "F3", w: true },
        { q: "Jusqu'à quelle heure est-ce que le service des retours est ouvert ?", a: "Jusqu'à vingt heures trente. Il m'a posé la même question.", fact: "F4", w: true },
        { q: "Vous connaissez son nom ?", a: "Je ne donne pas le nom des clients.", yn: true },
        { q: "Il va revenir ?", a: "Je ne sais pas.", yn: true },
        { q: "Il était sympa ?", a: "Il était poli. Très poli. Trop poli.", yn: true },
        { q: "Vous connaissez un client qui s'appelle Lucien ?", a: "Je ne donne pas le nom des clients. Mais un client a beaucoup parlé des retours, ce matin.", fact: "F2", onlyIf: "E03_done" }
      ],
      ynHint: lino("Elle répond seulement à ta question."),
      ynPause: L("vendeuse", "Excusez-moi, j'ai une autre cliente. Revenez dans une minute."), ynPauseMs: 60000,
      success: marie("Quatre informations. Merci, madame.") },
    next: "G04b" };
  N.G04b = { type: "task", title: "Encore une question", perPlayer: true, help: "G04b", diag: "D_G04b",
    task: { kind: "write", min: 4, rows: 2, check: "question", intro: "Écris encore une question pour la vendeuse. Commence par un mot interrogatif.",
      msgs: {
        estce: "Sans « est-ce que » au début, s'il te plaît. Commence par quand, où, comment, pourquoi, combien, qui ou quel.",
        start: "Commence par un mot interrogatif : quand, où, comment, pourquoi, combien, qui, quel…",
        mark: "Une question finit par un point d'interrogation : ?"
      },
      success: L("vendeuse", "Bonne question. Mais je vous ai déjà tout dit.") },
    next: "G05" };
  N.G05 = { type: "lines", lines: [
    marie("Il garde l'étiquette parce qu'il veut rendre le manteau. Aujourd'hui."),
    lino("Un manteau pour une matinée. Pratique.")
  ], effects: { flag: "G05_done" }, next: "G06" };
  N.G06 = { type: "choice", who: "marie", diag: "D_G06",
    prompt: marie("On lui montre aussi nos cartes ?"),
    choices: [
      { fr: "Montrer la carte.", kind: "ok", reply: [
        L("vendeuse", "Ça, c'est un de nos bons de réduction. On les distribue à l'entrée. Le numéro, c'est le code de l'offre. Et quelqu'un a collé quelque chose dessus."),
        marie("Alors nos billets… sont des bons de réduction."),
        lino("Le deuxième article à moitié prix… On pourrait acheter un deuxième guide.")
      ] }
    ],
    effects: { flag: "G06_done" }, doneAt: true, next: "R2" };
  N.Gr = { type: "lines", amb: true, lines: [L("vendeuse", "Encore vous ? Je vous ai déjà tout dit.")], next: "RESUME" };
  N.Gc = { type: "lines", amb: true, lines: [lino("Une coupole. Comme une cathédrale. Mais avec des parfums.")], next: "RESUME" };

  /* ===== 4 Tour Eiffel ===== */
  N.E00 = { type: "cut", bg: "bg_eiffel", lines: [
    L("narrateur", "RER C, de Saint-Michel–Notre-Dame à Champ de Mars–Tour Eiffel.", { notFrom: "lafayette" }),
    L("narrateur", "Métro ligne 9, de Chaussée d'Antin–La Fayette à Iéna.", { from: "lafayette" }),
    L("narrateur", "Il est treize heures. Au pilier nord, il y a des touristes, des vendeurs de petites tours Eiffel… et pas de guide."),
    lino("Pas de parapluie rouge."),
    marie("Mais il y a du monde, là-bas. Regarde.")
  ], next: "E01" };
  N.E01 = { type: "lines", lines: [
    L("joueur", "Regardez bien ! Elle est où, la petite balle ?"),
    L("spectateur", "Là ! À gauche !"),
    L("joueur", "Gagné ! Cinquante euros pour monsieur ! Et vous, madame ?"),
    L("spectatrice", "Au milieu ! … Gagné !"),
    lino("Facile ! Elle est à gauche. Je peux essayer ?"),
    marie("Non. Ne regarde pas les mains. Regarde autour.")
  ], next: "E02" };
  N.E02 = { type: "task", title: "Les mains, les gens, le sac", help: "E02", diag: "D_E02",
    task: { kind: "observe", intro: "Trouve trois choses bizarres. Pas sur les gobelets.",
      frames: ["obs_bonneteau_1", "obs_bonneteau_2", "obs_bonneteau_3", "obs_bonneteau_4"], dur: 3000, grace: 1000, ar: 1.7778,
      captions: [
        { fr: "Regardez bien !", x: 36, y: 6 },
        { fr: "Elle est où, la petite balle ?", x: 36, y: 6 },
        { fr: "Là ! À gauche !", x: 14, y: 8 },
        { fr: "Gagné ! Cinquante euros !", x: 36, y: 6 }
      ],
      points: [
        { id: "gobelets", cups: true, x: 43, y: 56, w: 14, h: 10 },
        { id: "gagnants", need: true, chip: "les gagnants", frames: [3], rects: [{ x: 26, y: 25, w: 10, h: 60 }, { x: 64, y: 25, w: 10, h: 60 }], line: marie("Les deux gagnants se connaissent. Ils travaillent avec lui.") },
        { id: "gens", neutral: true, frames: [1, 2, 4], rects: [{ x: 26, y: 25, w: 10, h: 60 }, { x: 64, y: 25, w: 10, h: 60 }], line: lino("Ils regardent les gobelets. Ou pas ?") },
        { id: "sac", need: true, chip: "le sac", x: 77, y: 76, w: 14, h: 20, line: marie("Des cartes. Les mêmes que les nôtres : Visite exclusive, numéro 42.") },
        { id: "telephone", need: true, ring: true, chip: "le téléphone", after: ["gagnants", "sac"], x: 52, y: 46, w: 6, h: 9, line: marie("Son téléphone sonne. Écoute.") },
        { id: "joueur", neutral: true, x: 40, y: 12, w: 20, h: 44, line: lino("Il parle vite. Très vite.") }
      ],
      cupsLines: [lino("À gauche… non, à droite… non…")],
      loopHint: { point: "gagnants", line: lino("Regarde aussi la personne à côté.") },
      material: [{ x: 26, y: 25, w: 10, h: 60 }, { x: 64, y: 25, w: 10, h: 60 }, { x: 77, y: 76, w: 14, h: 20 }] },
    next: "E03" };
  N.E03 = { type: "audio", audio: "au_telephone", title: "Le téléphone", intro: "Le joueur se tourne un peu. Il parle au téléphone. Tu peux écouter deux fois.", maxPlays: 2, transcriptHelp: "E04", effects: { flag: "E03_done" }, next: "E04" };
  N.E04 = { type: "task", title: "Dit, déduit, utile", audio: "au_telephone", noReplay: true, listenFirst: true, help: "E04", diag: "D_E04",
    task: { kind: "cols", legend: true, intro: "Range les phrases. Qu'est-ce qu'il a dit ? Qu'est-ce qu'on peut en déduire ? Qu'est-ce qui nous aide ? Et qu'est-ce qui est faux ?",
      columns: [
        { id: "dit", label: "Ce qui a été dit" }, { id: "deduit", label: "Ce qu'on peut en déduire" },
        { id: "utile", label: "Ce qui nous aide" }, { id: "faux", label: "C'est faux" }
      ],
      cards: [
        { id: "d1", label: "Lucien ?", col: "dit" },
        { id: "d2", label: "Tu rapportes le manteau maintenant ?", col: "dit" },
        { id: "d3", label: "Il reste encore des billets.", col: "dit" },
        { id: "e1", label: "Le faux guide s'appelle Lucien.", col: "deduit" },
        { id: "e2", label: "Lucien va bientôt rendre le manteau.", col: "deduit" },
        { id: "e3", label: "Le joueur et Lucien travaillent ensemble.", col: "deduit" },
        { id: "e4", label: "Les « billets », ce sont les fausses cartes.", col: "deduit" },
        { id: "u1", label: "Aller aux Galeries Lafayette.", col: "utile" },
        { id: "u2", label: "Écrire à M. Nowak.", col: "utile" },
        { id: "u3", label: "Ne pas jouer.", col: "utile" },
        { id: "f1", label: "Lucien a rendu le manteau.", col: "faux", trap: lino("Il pose une question. Lucien n'a pas encore rendu le manteau.") },
        { id: "f2", label: "Le joueur, c'est M. Beaumont.", col: "faux", trap: lino("Il n'a pas de moustache.") },
        { id: "f3", label: "On doit parler au joueur.", col: "faux", trap: lino("Non. Pas ici.") }
      ],
      wrong: lino("Pas encore.") },
    effects: { flag: "E04_done" }, next: "E05" };
  N.E05 = { type: "lines", doneAt: true, lines: [
    marie("On ne lui parle pas. On a ce qu'il nous faut. J'écris à M. Nowak."),
    L("nowak", "Bien. Ne jouez pas, et ne parlez pas à cet homme !", { sms: true }),
    lino("Moi, je savais où était la balle."),
    marie("Il n'y avait pas de balle.")
  ], effects: { flag: "E05_done" }, next: "R3" };
  N.Er = { type: "lines", amb: true, lines: [marie("On ne joue pas. Et on ne lui parle pas.")], next: "RESUME" };
  N.Et = { type: "lines", amb: true, lines: [lino("Trois cent trente mètres. Et pas un seul guide.")], next: "RESUME" };

  /* ===== 5 Bouquinistes (freiwillig) ===== */
  N.B00 = { type: "cut", bg: "bg_quai", lines: [
    L("narrateur", "Quelques pas à pied, de l'autre côté de la Seine.", { from: "notredame" }),
    L("narrateur", "Métro ligne 7, de Chaussée d'Antin–La Fayette à Pont Neuf.", { from: ["lafayette", "retours"] }),
    L("narrateur", "RER C, de Champ de Mars–Tour Eiffel à Saint-Michel–Notre-Dame.", { from: "eiffel" }),
    L("narrateur", "Quai de Montebello, en face de Notre-Dame. Des boîtes vertes pleines de vieux livres, de cartes postales et d'affiches."),
    lino("Des livres dans des boîtes. Comme une bibliothèque, mais dehors.")
  ], next: "B01" };
  N.B01 = { type: "choice", who: "bouquiniste", help: "B01", diag: "D_B01",
    prompt: L("bouquiniste", "Bonjour ! Vous cherchez quelque chose ? Un livre, une affiche ?"),
    choices: [
      { fr: "On cherche un homme. Vous avez vu ce monsieur ? (Marie montre la photo de groupe.)", kind: "ok" },
      { fr: "Vous avez vendu un vieux guide à huit euros ce matin ?", kind: "ok", onlyIf: "prix_vu", reply: [L("bouquiniste", "Huit euros, oui ! Il n'a même pas discuté le prix.")] },
      { fr: "Vous avez des livres sur Paris ?", kind: "repair", reply: [L("bouquiniste", "Sur Paris ? J'en ai trois cents. Vous cherchez lequel ?")] },
      { fr: "Combien coûte ce livre ?", kind: "repair", reply: [L("bouquiniste", "Lequel ? Ici, il y a mille livres.")] }
    ],
    next: "B01a" };
  N.B01a = { type: "audio", audio: "au_bouquiniste", title: "Mon premier client", transcriptHelp: "B02", next: "B02" };
  N.B02 = { type: "task", title: "Dans quel ordre ?", audio: "au_bouquiniste", listenFirst: true, help: "B02", diag: "D_B02",
    task: { kind: "chain", intro: "Ce matin, qu'est-ce que M. Beaumont a fait ? Mets les phrases dans l'ordre.", words: [],
      items: [
        { parts: ["Il a acheté le manteau."] },
        { parts: ["Il est venu chez la bouquiniste."] },
        { parts: ["Il a acheté le guide."] },
        { parts: ["Il a fait la visite avec la classe."] }
      ],
      wrong: lino("Pas encore. Écoute bien les heures.") },
    next: "B03" };
  N.B03 = { type: "task", title: "Mot pour mot ?", audio: "au_beaumont", help: "B03", diag: "D_B03",
    task: { kind: "cols", intro: "La bouquiniste ouvre l'autre livre. Compare avec la visite de M. Beaumont. Range ses phrases.",
      docs: [
        { label: "Paris insolite, page 27 : la rue Chanoinesse", text: "« Regardez cette petite porte. Au Moyen Âge, c'était l'entrée des livraisons. Les marchands passaient par là, la nuit. » (Sous l'image : Entrée de livraison.)", cls: "book" },
        { label: "Paris insolite, page 41 : le quai aux Fleurs", text: "« Ici, il y avait une boulangerie. Le boulanger vendait un pain très léger : il était plein d'air. Un jour, les clients ont compris. »", cls: "book" }
      ],
      columns: [{ id: "mot", label: "Mot pour mot dans le livre" }, { id: "change", label: "Changé" }, { id: "pas", label: "Pas dans le livre" }],
      cards: [
        { id: "c1", label: "« Regardez cette petite porte. »", col: "mot" },
        { id: "c2", label: "« Au Moyen Âge, c'était une porte secrète. »", col: "change" },
        { id: "c3", label: "« Suivez le parapluie rouge ! »", col: "pas" },
        { id: "c4", label: "« Le boulanger vendait un pain très léger : il était plein d'air. »", col: "mot" },
        { id: "c5", label: "« Les rois passaient par là, la nuit. »", col: "change" },
        { id: "c6", label: "« Un jour, les clients ont compris. »", col: "mot" }
      ],
      wrong: lino("Pas encore. Compare mot à mot.") },
    after: [marie("Mot pour mot. Ses histoires viennent de ce livre."), lino("Il n'est pas guide. Il est lecteur.")],
    next: "B04" };
  N.B04 = { type: "task", title: "Qu'est-ce qu'il a changé ?", help: "B04", diag: "D_B04",
    task: { kind: "pick", n: 2, question: "Choisis les deux choses que M. Beaumont a changées.",
      doc: "Paris insolite, page 27 : « Regardez cette petite porte. Au Moyen Âge, c'était l'entrée des livraisons. Les marchands passaient par là, la nuit. »",
      options: [
        { id: "porte", label: "« porte secrète » au lieu de « entrée des livraisons »", ok: true },
        { id: "rois", label: "« les rois » au lieu de « les marchands »", ok: true },
        { id: "nuit", label: "« la nuit » au lieu de « le matin »", reply: lino("Non, la nuit, c'est dans le livre aussi.") },
        { id: "boulanger", label: "« boulanger » au lieu de « pâtissier »", reply: lino("Le boulanger est le même.") },
        { id: "moyenage", label: "« Moyen Âge » au lieu de « Renaissance »", reply: lino("Le Moyen Âge, c'est dans le livre.") }
      ],
      matText: "Sous l'image de la page 27 : « Entrée de livraison ».",
      wrong: lino("Pas encore. Compare avec la page 27."), success: lino("Une porte secrète pour les livraisons. Très secret.") },
    effects: { item: "page_guide", flag: "B04_done" }, next: "B05" };
  N.B05 = { type: "task", title: "Le papier", help: "B05", diag: "D_B05",
    task: { kind: "sort", who: "bouquiniste", intro: "Ah, et il a oublié ça sur ma boîte.",
      docs: [
        { label: "Le papier de M. Beaumont", text: "1. p. 12 – 2. p. 27 – 3. p. 41 – photo – 15 h : p. 12", cls: "hand" },
        { label: "Paris insolite : sommaire", text: "p. 12 Le parvis de Notre-Dame · p. 27 La rue Chanoinesse · p. 41 Le quai aux Fleurs · p. 56 La Sainte-Chapelle", cls: "book sommaire" }
      ],
      slots: [
        { id: "p12", label: "p. 12", answer: "parvis" },
        { id: "p27", label: "p. 27", answer: "chanoinesse" },
        { id: "p41", label: "p. 41", answer: "fleurs" }
      ],
      options: [
        { id: "parvis", label: "le parvis de Notre-Dame" },
        { id: "chanoinesse", label: "la rue Chanoinesse" },
        { id: "fleurs", label: "le quai aux Fleurs" },
        { id: "chapelle", label: "la Sainte-Chapelle" },
        { id: "eiffel", label: "la tour Eiffel", reply: lino("La tour Eiffel ? Elle n'est pas dans le sommaire.") }
      ],
      wrong: lino("Pas encore. Cherche chaque page dans le sommaire.") },
    after: [marie("À 15 heures, page 12. Il recommence au début.")],
    effects: { item: "papier", flag: "B05_done" }, next: "R4" };
  N.B06 = { type: "choice", who: "marie", diag: "D_B06", store: true, doneAt: true,
    prompt: marie("Il y a deux possibilités. Où est-ce qu'on l'attend ?"),
    choices: [
      { fr: "Aux Galeries Lafayette, parce qu'il rend le manteau avant 15 heures.", kind: "ok" },
      { fr: "À Notre-Dame, parce que sa prochaine visite commence à 15 heures.", kind: "ok" }
    ],
    effects: { flag: "B06_done" }, next: "B06e" };
  N.B06e = { type: "lines", lines: [
    marie("D'abord le manteau, après la visite."),
    L("marie", "Mais pour le magasin, il nous manque encore une piste.", { onlyIf: "!R2_done" }),
    L("marie", "Mais pour le magasin, il nous manque encore une piste.", { onlyIf: ["R2_done", "!R3b_done"] })
  ], effects: { flag: "B_done" }, next: "MAP" };
  N.Br = { type: "lines", amb: true, lines: [L("bouquiniste", "Revenez quand vous voulez ! J'ai encore mille livres.")], next: "RESUME" };
  N.Bb = { type: "lines", amb: true, lines: [lino("Des vieux livres, des cartes postales… et pas de parapluie rouge.")], next: "RESUME" };

  /* ===== 6 Finale im Kaufhaus ===== */
  N.F00 = { type: "cut", bg: "bg_retours", lines: [
    L("narrateur", "Métro ligne 9, d'Iéna à Chaussée d'Antin–La Fayette.", { from: "eiffel" }),
    L("narrateur", "Métro ligne 7, de Pont Neuf à Chaussée d'Antin–La Fayette.", { from: ["notredame", "bouquinistes"] }),
    L("narrateur", "Quatorze heures. Rez-de-chaussée, porte 5 : le service des retours."),
    lino("Beaucoup de gens rendent des choses, ici."),
    marie("Et un monsieur va rendre un costume."),
    L("vendeuse", "Encore vous ? L'après-midi, je travaille aux retours.")
  ], next: "F01" };
  N.F01 = { type: "task", title: "Quatre hommes", help: "F01", diag: "D_F01",
    task: { kind: "loupe", mode: "pick", img: "bg_retours", ar: 1.7778, status: "Touche M. Beaumont.",
      intro: "Lequel est M. Beaumont ? Regarde bien.",
      points: [
        { id: "touriste", x: 3, y: 16, w: 14, h: 80, line: lino("Un parapluie rouge, ça ne prouve rien.") },
        { id: "client", x: 20.5, y: 14, w: 12, h: 80, line: L("vendeuse", "C'est notre modèle de l'hiver. On en a vendu beaucoup.") },
        { id: "jeune", x: 33.5, y: 15, w: 11.5, h: 80, line: lino("Une moustache, oui. Mais elle est noire.") },
        { id: "lucien", ok: true, x: 46, y: 15, w: 14, h: 79, line: marie("C'est lui.") },
        { id: "vendeuse", neutral: true, x: 77, y: 18, w: 19, h: 34, line: L("vendeuse", "Le suivant, s'il vous plaît.") }
      ],
      matImgs: ["doc_selfie"], matFiche: true },
    next: "F01b" };
  N.F01b = { type: "task", title: "Pourquoi lui ?", help: "F01b", diag: "D_F01b",
    task: { kind: "pick", n: 2, question: "Pourquoi c'est lui ? Choisis les deux bonnes raisons.",
      options: [
        { id: "moustache", label: "Il a une moustache grise.", ok: true },
        { id: "montre", label: "Il a une montre dorée.", ok: true },
        { id: "parapluie", label: "Il a un parapluie rouge.", reply: lino("Il n'a pas de parapluie. Et un parapluie, ça ne prouve rien.") },
        { id: "manteau", label: "Il porte un manteau beige.", reply: lino("Il ne le porte pas. Il est dans le sac.") },
        { id: "sac", label: "Il a un sac des Galeries Lafayette.", reply: lino("On est aux Galeries Lafayette. Tout le monde a un sac.") },
        { id: "badge", label: "Il a un badge de guide.", reply: lino("Je ne vois pas de badge. Aujourd'hui, il n'est plus guide.") }
      ],
      matImgs: ["doc_selfie"],
      wrong: lino("Pas encore."), success: marie("Sans parapluie et sans manteau. Mais avec sa moustache et sa montre.") },
    next: "F02" };
  N.F02 = { type: "lines", lines: [
    L("lucien", "Bonjour madame. Je voudrais rendre ce manteau, s'il vous plaît."),
    L("vendeuse", "Vous avez le ticket de caisse ?"),
    L("narrateur", "Il cherche dans sa poche. Il donne une carte à la vendeuse."),
    lino("(tout bas) C'est une carte comme les nôtres."),
    L("vendeuse", "Ça, monsieur, ce n'est pas un ticket de caisse."),
    L("lucien", "Pardon… un instant…"),
    marie("Maintenant.")
  ], next: "F03" };
  N.F03 = { type: "choice", who: "marie", help: "F03", diag: "D_F03",
    prompt: L("lino", "Qu'est-ce que tu dis à la vendeuse ?"),
    choices: [
      { fr: "C'est lui. Ce matin, c'était notre guide.", kind: "ok", reply: [
        L("lucien", "Un petit malentendu, madame…"),
        marie("Non, monsieur. Ce n'est pas un malentendu. Ce monsieur n'est pas guide."),
        L("vendeuse", "(au téléphone) La sécurité au service des retours, s'il vous plaît."),
        L("agent", "Bonjour. Qu'est-ce qui se passe ?"),
        L("vendeuse", "Mademoiselle va nous expliquer.")
      ] },
      { fr: "C'est lui. Demain, c'est notre guide.", kind: "wrong", reply: [lino("Demain ? Non. C'était ce matin.")] },
      { fr: "C'est lui. Il est notre guide depuis un an.", kind: "wrong", reply: [lino("Depuis un an ? On le connaît depuis ce matin.")] },
      { fr: "C'est lui. Hier, il était notre guide.", kind: "wrong", reply: [lino("Hier ? Hier, on avait d'autres problèmes.")] }
    ],
    next: "F04" };
  N.F04 = { type: "task", title: "L'explication", help: "F04", diag: "D_F04",
    task: { kind: "chain", intro: "Explique à la vendeuse et au monsieur de la sécurité. Mets les phrases dans l'ordre et complète avec pas, jamais ou rien.",
      words: ["pas", "jamais", "rien"],
      items: [
        { parts: [{ tw: "Ce matin, à dix heures," }, " il a acheté ce manteau pour avoir l'air officiel."] },
        { parts: [{ tw: "À onze heures," }, " il a fait une fausse visite avec notre classe."] },
        { parts: ["Il a pris 220 euros et il nous a donné des cartes. Mais ce ne sont ", { gap: "pas" }, " des billets : ce sont vos bons de réduction."] },
        { parts: [{ tw: "À midi moins le quart," }, " il est parti, et il n'est ", { gap: "jamais" }, " revenu."] },
        { parts: [{ tw: "Maintenant," }, " il rend le manteau. Comme ça, il n'a ", { gap: "rien" }, " payé du tout."] }
      ],
      wrongOrder: L("vendeuse", "Je ne comprends pas. Le manteau, c'est avant ou après ?"),
      wrongWords: L("vendeuse", "Pardon ? Il est revenu ou pas ?"),
      pauseLine: L("agent", "Prenez votre temps, mademoiselle. Ce monsieur reste avec moi.") },
    after: [
      L("vendeuse", "Des bons de réduction… avec un autocollant dessus."),
      L("lucien", "Mademoiselle a beaucoup d'imagination."),
      marie("Non, monsieur. J'ai des preuves.")
    ],
    next: "F05" };
  N.F05 = { type: "task", title: "Les preuves", help: "F05", diag: "D_F05",
    task: { kind: "proofs", n: 3, intro: "Montre trois preuves. Pour chaque preuve, dis ce qu'elle montre.",
      distinct: "Trois preuves différentes, s'il te plaît.",
      items: [
        { id: "carte", sentence: "s_carte", reply: [L("vendeuse", "Oui. Un de nos bons. Je l'ai dit ce matin.")] },
        { id: "badge", sentence: "s_badge", reply: [L("agent", "Le 31 février ?"), L("lucien", "Une petite erreur d'impression."), lino("Trois jours d'erreur. C'est beaucoup, pour un guide.")] },
        { id: "photo_groupe", sentence: "s_photo", reply: [L("vendeuse", "Avec l'étiquette… Il l'a porté toute la matinée.")] },
        { id: "selfie", sentence: "s_selfie", reply: [L("agent", "C'est bien vous, monsieur."), lino("Je suis un très bon photographe.")] },
        { id: "page_guide", sentence: "s_livre", reply: [L("lucien", "Tous les guides lisent des livres, mademoiselle."), marie("Oui. Mais ils ne changent pas les portes.")] },
        { id: "fiche", trap: lino("Notre description ? On l'a écrite nous-mêmes. Ce n'est pas une preuve.") },
        { id: "papier", repair: marie("Ça, c'est pour plus tard. Pour la police.") }
      ],
      sentences: [
        { id: "s_carte", label: "Ce n'est pas un billet. C'est un bon de réduction du magasin." },
        { id: "s_badge", label: "Le 31 février n'existe pas." },
        { id: "s_photo", label: "Ce matin, il portait ce manteau, avec l'étiquette." },
        { id: "s_selfie", label: "On voit son visage : la même moustache, la même montre." },
        { id: "s_livre", label: "Ses histoires viennent d'un vieux livre." },
        { id: "s_trap", label: "Il parle très bien français.", trap: lino("Ça, ce n'est pas une preuve. C'est un compliment.") }
      ],
      matInv: ["carte", "badge", "photo_groupe", "selfie", "page_guide", "fiche"],
      wrong: lino("Pas encore.") },
    effects: { flag: "F05_done" }, next: "F06" };
  N.F06 = { type: "task", title: "Message à M. Nowak", help: "F06", diag: "D_F06",
    task: { kind: "write", min: 8, rows: 3, check: "message", sms: true,
      intro: "Écris à M. Nowak. Où est-ce qu'il doit venir ? Où exactement dans le magasin ? Quand ? (au moins 8 mots)",
      starters: ["Nous sommes...", "Venez..."],
      place: ["galeries lafayette", "lafayette", "le magasin", "boulevard haussmann"],
      spot: ["service des retours", "retours", "porte 5", "rez de chaussee"],
      time: ["tout de suite", "maintenant", "vite", "immediatement", "14 heures", "quatorze heures"],
      msgs: {
        place: "Il ne sait pas dans quel magasin.",
        spot: "Le magasin est très grand. Où exactement ?",
        time: "Il doit venir quand ?",
        notreDame: "Notre-Dame, c'est à 15 heures. Lui, il est ici maintenant."
      },
      success: L("nowak", "J'arrive avec la classe et la police. Ne le laissez pas partir !", { sms: true }) },
    after: [lino("Nous, non. Le monsieur de la sécurité, peut-être.")],
    next: "F07" };
  N.F07 = { type: "lines", lines: [
    L("agent", "Monsieur, vous venez avec moi, s'il vous plaît."),
    L("lucien", "Bien sûr. Avec plaisir."),
    lino("Même maintenant, il est poli."),
    L("lucien", "Mes compliments, mademoiselle. Votre français est excellent."),
    marie("Merci. C'est ma langue."),
    L("marie", "Je vous en prie, monsieur.", { onlyIf: "formules_5" }),
    L("lino", "Ça, c'est sa phrase à lui !", { onlyIf: "formules_5" })
  ], next: "F08" };
  N.F08 = { type: "cut", bg: "cut_compte", lines: [
    L("narrateur", "Quatorze heures trente. M. Nowak arrive avec la classe et une policière. Dans la poche de la veste de Lucien, il y a une enveloppe."),
    L("nowak", "C'est mon enveloppe. Regardez : classe 10b. C'est mon écriture."),
    L("nowak", "Deux cents… deux cent dix… deux cent vingt. Le compte est bon."),
    lino("D'habitude, il compte les élèves."),
    L("policiere", "Mademoiselle, c'est vous, la détective ?"),
    marie("Nous deux."),
    L("vendeuse", "(Elle prend le manteau.) Il est comme neuf."),
    lino("Finalement, elle nous a aidés."),
    marie("Elle a surtout refusé d'aider tout le monde de la même façon.")
  ], next: [{ if: "B_done", node: "Z00" }, { node: "F09" }] };
  N.F09 = { type: "task", title: "Le rapport de Marie", perPlayer: true, help: "F09", diag: "D_F09",
    task: { kind: "write", min: 50, rows: 10, check: "rapport",
      intro: "Pour le journal de ton lycée, raconte l'affaire en 6 à 8 phrases. Comment était le faux guide ? Qu'est-ce qu'il a fait ? Comment est-ce que vous l'avez trouvé ?",
      starters: ["Ce matin, devant Notre-Dame, il y avait...", "Il portait...", "À midi moins le quart, il...", "Aux Galeries Lafayette, on a appris que...", "À la tour Eiffel, ...", "Ce n'était pas...", "Finalement, ..."],
      topic: ["guide", "manteau", "parapluie", "carte", "euro", "lucien", "lafayette", "eiffel", "police", "nowak"], topicMin: 3,
      topicMsg: "Raconte l'affaire : le guide, le manteau, les cartes, les lieux.",
      msgs: {
        imparfait: "Il manque le décor : comment c'était ?",
        pc: "Il manque l'action : qu'est-ce qu'il a fait ?",
        neg: "Il manque un ne… pas.",
        time: "Il manque une heure."
      } },
    next: "END_SCREEN" };
  N.END_SCREEN = { type: "end" };
  N.Fr = { type: "lines", amb: true, lines: [L("vendeuse", "Le service des retours ferme à vingt heures trente. Pour les vrais clients.")], next: "RESUME" };

  /* ===== 7 Nachspiel an Notre-Dame (nur nach den Bouquinisten) ===== */
  N.Z00 = { type: "cut", bg: "bg_parvis", scene: "notredame", lines: [
    L("narrateur", "Métro ligne 7, retour à Pont Neuf. Quinze heures moins cinq, sur le parvis de Notre-Dame. Un groupe de touristes attend."),
    L("touriste", "Excusez-moi, vous connaissez M. Beaumont ? On a rendez-vous avec lui à quinze heures. Une visite exclusive, dix euros par personne."),
    lino("Il a beaucoup de rendez-vous, M. Beaumont.")
  ], next: "Z01" };
  N.Z01 = { type: "task", title: "Prévenir", help: "Z01", diag: "D_Z01",
    task: { kind: "write", min: 5, rows: 3, check: "warn",
      intro: "Préviens la touriste. Qu'est-ce qu'elle ne doit pas faire ? (au moins 5 mots)",
      starters: ["Ne payez...", "Il n'y a..."],
      topicWords: ["pay", "argent", "visite", "guide", "beaumont", "euro"],
      msgs: {
        neg: "Dis-lui ce qu'elle ne doit pas faire.",
        topic: "De quoi est-ce que tu parles ? Elle ne comprend pas.",
        tu: "À une dame, on dit vous."
      } },
    next: "Z02" };
  N.Z02 = { type: "lines", lines: [
    L("touriste", "Pas de visite ? Mais il est où, alors ?"),
    marie("Avec la police. Votre argent reste dans votre poche."),
    L("touriste", "Merci, mademoiselle ! Vous êtes guide ?"),
    marie("Non. Mais je connais bien Paris.")
  ], next: "Z03" };
  N.Z03 = { type: "cut", bg: "cut_parapluie", doneAt: true, lines: [
    L("narrateur", "M. Nowak ouvre un parapluie rouge."),
    lino("Je l'ai acheté au rez-de-chaussée, avec ma carte. Le deuxième parapluie était à moitié prix."),
    marie("Et le premier ?"),
    lino("Il est pour moi. Je suis un vrai touriste, moi."),
    L("nowak", "… dix-neuf, vingt, vingt et un, vingt-deux. Avec la jeune fille. Suivez le parapluie rouge !"),
    lino("Cette fois, le parapluie revient.")
  ], next: "F09" };

  /* ===== 8 Abfragen unterwegs (Tore): getippt, ohne Auswahl, nur mit Hinweis, wo man nachsehen kann ===== */
  N.R1 = { type: "task", gate: true, title: "L'heure du départ", diag: "D_R1",
    task: { kind: "recall", who: "nowak", sms: true, intro: "La police me demande : à quelle heure est-ce qu'il est parti ?",
      fields: [{ id: "heure", label: "L'heure :", size: 18,
        answers: ["midi moins le quart", "à midi moins le quart", "11 h 45", "onze heures quarante-cinq", "onze heures quarante cinq"], times: ["1145"],
        keywords: [["midi", "moins", "quart"], ["onze", "quarante"]],
        traps: [
          { answers: ["midi", "à midi", "12 h", "12h"], times: ["12", "1200"], who: "lino", fr: "Presque. Un quart d'heure avant." },
          { answers: ["midi et quart", "à midi et quart", "midi quinze"], times: ["1215"], keywords: [["midi", "et", "quart"]], who: "lino", fr: "Midi et quart, c'est quand on a compris. Il est parti avant." },
          { answers: ["onze heures", "à onze heures", "11 h"], times: ["11", "1100"], who: "lino", fr: "Onze heures, c'est le début de la visite." }
        ],
        where: "Après la photo, le narrateur l'a dit. Et c'est dans la fiche de signalement." }],
      wrongText: "Tu es sûre ? La police veut l'heure exacte.",
      success: L("nowak", "Midi moins le quart. Merci, Marie.", { sms: true }) },
    effects: { flag: "R1_done" }, after: [lino("Bon. On y va ? La carte est ouverte.")], next: "MAP" };
  N.R2 = { type: "task", gate: true, title: "Le jour même", diag: "D_R2",
    task: { kind: "recall", who: "nowak", sms: true, intro: "Et au magasin ? Quand est-ce qu'on peut rendre un manteau ?",
      fields: [{ id: "quand", label: "Quand :", size: 18,
        answers: ["le jour même", "le même jour", "aujourd'hui", "le jour même de l'achat", "jour même", "même jour"],
        keywords: [["jour", "meme"], ["meme", "jour"], ["aujourd"]],
        traps: [
          { answers: ["demain"], keywords: [["demain"]], who: "lino", fr: "Demain, c'est trop tard." },
          { answers: ["jusqu'à 20 h 30", "vingt heures trente"], times: ["2030"], keywords: [["vingt", "heures"]], who: "lino", fr: "Ça, c'est l'heure. Mais quel jour ?" },
          { answers: ["avec le ticket de caisse"], keywords: [["ticket"], ["etiquette"]], who: "lino", fr: "Ça, c'est comment. Il demande quand." }
        ],
        where: "La vendeuse l'a dit, au deuxième étage." }],
      wrongText: "Je ne comprends pas. Tu peux répéter ?",
      success: L("nowak", "Aujourd'hui… Alors il va revenir aujourd'hui.", { sms: true }) },
    effects: { flag: "R2_done" }, next: "MAP" };
  N.R3 = { type: "task", gate: true, title: "Son vrai nom", diag: "D_R3",
    task: { kind: "recall", who: "nowak", sms: true, intro: "La policière demande son vrai nom.",
      fields: [{ id: "prenom", label: "Le prénom :", size: 14, answers: ["Lucien"],
        traps: [{ answers: ["Beaumont", "M. Beaumont", "Monsieur Beaumont"], keywords: [["beaumont"]], who: "lino", fr: "Ça, c'est le nom sur le badge." }],
        where: "Au téléphone, à la tour Eiffel." }],
      wrongText: "Ce nom, la police ne le connaît pas.",
      success: L("nowak", "Lucien. Je le dis à la policière.", { sms: true }) },
    effects: { flag: "R3_done" }, next: "R3b" };
  N.R3b = { type: "task", gate: true, title: "Et maintenant ?", diag: "D_R3b",
    task: { kind: "recall", who: "lino", intro: "Et maintenant, qu'est-ce que Lucien va faire ?",
      fields: [{ id: "va", label: "Il va…", size: 22,
        answers: ["rendre le manteau", "rapporter le manteau", "il rend le manteau", "il rapporte le manteau", "il va rendre le manteau", "il va rapporter le manteau"],
        keywords: [["rend", "manteau"], ["rapport", "manteau"]],
        traps: [
          { keywords: [["a rendu"], ["a rapporte"], ["avoir rendu"]], who: "lino", fr: "Pas encore. Au téléphone, c'est une question." },
          { keywords: [["jou"]], who: "lino", fr: "Ça, c'est son ami." }
        ],
        where: "Écoute encore la question au téléphone." }],
      wrongText: "Hmm. Je ne crois pas.",
      success: marie("Il rapporte le manteau. Et nous, on va là-bas.") },
    effects: { flag: "R3b_done" }, next: "MAP" };
  N.R4 = { type: "task", gate: true, title: "À quinze heures", diag: "D_R4",
    task: { kind: "recall", who: "lino", intro: "Et à quinze heures ? Où commence sa prochaine visite ?",
      fields: [{ id: "ou", label: "Où :", size: 22,
        answers: ["Notre-Dame", "à Notre-Dame", "devant Notre-Dame", "le parvis", "le parvis de Notre-Dame"],
        keywords: [["notre", "dame"], ["parvis"]],
        traps: [
          { keywords: [["eiffel"]], who: "lino", fr: "Là, il y a son ami. Pas lui." },
          { keywords: [["chanoinesse"]], who: "lino", fr: "Ça, c'est la page 27. Il commence à la page 12." },
          { keywords: [["fleurs"]], who: "lino", fr: "Page 41. C'est la fin de la visite." }
        ],
        where: "Regarde le papier et le sommaire du livre." }],
      wrongText: "Ce lieu n'est pas sur son papier.",
      success: marie("Page 12, le parvis. Il recommence au début.") },
    effects: { flag: "R4_done" }, next: "B06" };
  N.R5 = { type: "task", gate: true, title: "Avant d'entrer", diag: "D_R5",
    task: { kind: "recall", who: "lino", intro: "Avant d'entrer : en vrai, qu'est-ce que c'est, la carte ?",
      fields: [{ id: "carte", label: "C'est…", size: 22,
        answers: ["un bon de réduction", "bon de réduction", "une réduction", "un bon", "un coupon de réduction"],
        keywords: [["bon", "reduc"], ["reduction"], ["coupon"]],
        traps: [
          { answers: ["un billet", "des billets"], keywords: [["billet"]], who: "lino", fr: "Non. Ça, c'est ce qu'il a dit, lui." },
          { answers: ["une visite exclusive"], keywords: [["visite"], ["exclusi"]], who: "lino", fr: "Ça, c'est l'autocollant. Et dessous ?" }
        ],
        where: "La vendeuse l'a dit. Et c'est sous l'autocollant." }],
      wrongText: "Non. Regarde encore la carte.",
      success: lino("Un bon de réduction. Le deuxième article à moitié prix. Je m'en souviens.") },
    effects: { flag: "R5_done" }, next: "F00" };

  G.nodes = N;

  /* ---------- Linos Hilfestufen (alles auf Französisch). Stufe 2 und 3 können eine Aktion auslösen. ---------- */
  G.help = {
    N03: ["On ne cherche pas ce qui est vrai. On cherche ce qu'il a dit.", { fr: "Écoute encore M. Beaumont.", action: "replay" }, { fr: "Voici ce qu'il a dit. Cherche les mots porte, rois et boulanger.", action: "transcript" }, "Prends chaque phrase et cherche-la dans le transcript. Tu ne la trouves pas ? Alors, il ne l'a pas dite."],
    N04a: ["Regarde M. Beaumont de la tête aux pieds.", { fr: "Regarde surtout ses mains et ses bras.", action: "material" }, "Il y a quelque chose devant son visage, sur sa manche, dans sa main et sous son bras.", "Le parapluie devant le visage, l'étiquette sur la manche, le sac à la main, le livre sous le bras."],
    N04b: ["Regarde son visage et ses mains.", { fr: "Zoome sur M. Beaumont, à côté de Kevin.", action: "material" }, "Il y a quelque chose sous son nez et à son poignet.", "Une moustache grise et une montre dorée."],
    N05: ["Lis tout, même les petits chiffres.", { fr: "Regarde la dernière ligne.", action: "material" }, "Combien de jours est-ce qu'il y a en février ?", "Le 31 février n'existe pas. Le badge est faux."],
    N06: ["Une carte a deux côtés. Et ce coin est bizarre.", { fr: "Regarde le coin en haut à droite.", action: "material" }, "Tire sur le coin de l'autocollant. Après, retourne la carte.", "Sous l'autocollant, il y a une réduction. Derrière, il y a un rendez-vous : 13 heures, tour Eiffel."],
    N07a: ["C'est le décor ou l'action ?", "Le décor, c'est comment il était. L'action, c'est ce qu'il a fait.", "Il était, il avait, il portait : c'est le décor. Il est parti : c'est l'action.", "Comment il était, ce qu'il avait, ce qu'il portait : c'est le décor, alors l'imparfait. Ce qu'il a fait une fois, à midi moins le quart : c'est l'action, alors le passé composé."],
    N07b: ["Comment est-ce qu'il parlait ? Vite, lentement, poliment ?", { fr: "Regarde le selfie : ses cheveux, sa moustache.", action: "material" }, "Tu peux écrire : Il parlait lentement.", "Deux phrases : comment il parlait, et comment il était. Par exemple : Il parlait lentement. Il était très poli."],
    N07c: ["Qu'est-ce qu'on peut enlever, fermer ou rendre ?", { fr: "Regarde encore la photo et le selfie.", action: "material" }, "Un parapluie, on le ferme. Une moustache, on la garde.", "Pour chaque chose, demande-toi : est-ce qu'il peut l'enlever, la fermer ou la rendre en une minute ? Si oui, il peut la changer facilement."],
    N08: ["Pour chaque indice : où est-ce qu'on peut le trouver ?", { fr: "Regarde encore le sac et la carte.", action: "material" }, "Le sac et l'étiquette viennent du même magasin.", "Lis ce qui est écrit sur chaque indice. Le sac et l'étiquette viennent d'un magasin, la carte donne un lieu de rendez-vous. Et les vieux livres, on les vend sur les quais."],
    G01: ["Il a acheté un manteau d'homme.", { fr: "Regarde bien chaque étage.", action: "material" }, "Cherche le mot manteaux sur le plan.", "Mode homme, manteaux : c'est au 2e étage."],
    G02: ["Elle pense que tu veux acheter. Dis-lui ce que tu cherches.", { fr: "Regarde la photo : on cherche le manteau ou l'homme ?", action: "material" }, "Tu peux dire : Non, on cherche l'homme qui le portait.", "Réponds non, et dis que tu cherches l'homme."],
    G03: ["Elle vend des manteaux. Montre-lui le manteau.", { fr: "Dans l'inventaire, il y a les détails de la photo.", action: "material" }, "Sur la manche du manteau, il y a quelque chose du magasin.", "Montre l'étiquette sur la manche."],
    G04: ["Elle répond seulement à ta question. Essaie avec quand, quoi ou comment.", { fr: "Regarde la liste. Quels mots commencent une question ?", action: "material" }, "Par exemple : Quelles questions est-ce qu'il a posées ?", "Elle dit seulement oui ou non. Alors, on demande : Quand ? Quelles questions ? Comment ? Jusqu'à quelle heure ?"],
    G04b: ["Commence par un mot interrogatif : quand, où, comment, pourquoi…", "Après le mot interrogatif, tu peux écrire est-ce que.", "Par exemple : Pourquoi est-ce qu'il…", "Un mot interrogatif au début, au moins quatre mots, et un point d'interrogation à la fin."],
    E02: ["Ne regarde pas seulement les gobelets. Regarde les gens.", { fr: "Regarde les deux gagnants et le sac par terre.", action: "material" }, "Les gagnants se regardent. Et dans le sac, il y a des cartes.", "Le clin d'œil des gagnants, les cartes dans le sac, et après, le téléphone."],
    E04: ["Qui a dit ça ? Ou est-ce que c'est une idée à nous ?", { fr: "Écoute encore le téléphone.", action: "replay" }, { fr: "Voici les mots du joueur. Tout le reste, c'est nous qui le pensons.", action: "transcript" }, "Dit : seulement les mots exacts du joueur, compare avec le transcript. Déduit : ce qu'on comprend grâce à ces mots. Utile : ce qu'on fait maintenant. Faux : ce que les mots ne disent pas. Attention : au téléphone, il pose une question."],
    B01: ["On ne cherche pas un livre. On cherche quelqu'un.", { fr: "Dans l'inventaire : la photo de groupe.", action: "material" }, "Tu peux dire : Vous avez vu ce monsieur ?", "Montre la photo et demande si elle a vu le monsieur."],
    B02: ["Elle dit : il avait déjà son manteau. Qu'est-ce que ça veut dire ?", { fr: "Écoute encore la bouquiniste.", action: "replay" }, { fr: "Déjà, ça veut dire : avant. Le manteau, c'était avant le livre.", action: "transcript" }, "Cherche les heures dans le transcript : dix heures et demie, puis la visite à onze heures. Et déjà veut dire : avant ce moment."],
    B03: ["Lis le livre, puis écoute encore M. Beaumont. C'est pareil ou pas ?", { fr: "Écoute encore la visite.", action: "replay" }, "Cherche les mots porte, rois et boulanger dans le livre.", "Mets chaque phrase à côté du livre. Les mêmes mots : mot pour mot. Un mot différent : changé. Rien dans le livre : pas dans le livre."],
    B04: ["Regarde l'image. Qu'est-ce qui est écrit sous la porte ?", { fr: "Regarde la page 27.", action: "material" }, "Dans le livre, ce ne sont pas des rois. Et ce n'est pas une porte secrète.", "Lis la page 27 et la visite, mot à mot. Deux choses ne sont pas les mêmes. Les autres sont dans le livre."],
    B05: ["Les chiffres sur le papier, ce sont des pages.", { fr: "Regarde le sommaire du livre.", action: "material" }, "La page 12, c'est le début de la visite.", "Trouve chaque numéro dans le sommaire. Le lieu est écrit à côté du numéro."],
    F01: ["Moi, je regarde ce qu'il ne peut pas changer.", { fr: "Regarde ta fiche de signalement et le selfie.", action: "material" }, "Le parapluie et le manteau, il peut les changer. La moustache grise et la montre, non.", "C'est l'homme avec la moustache grise et la montre dorée. Son manteau est dans le sac."],
    F01b: ["Qu'est-ce qu'on voit sur le selfie et sur lui maintenant ?", { fr: "Regarde encore le selfie.", action: "material" }, "Une chose est sous son nez. Une chose est à son poignet.", "Il n'a plus de parapluie, plus de manteau, plus de badge. Choisis ce qu'on voit sur le selfie et encore sur lui maintenant."],
    F03: ["Quand est-ce qu'il était notre guide ?", { fr: "La visite, c'était à onze heures. Regarde bien les mots de temps.", action: "material" }, "La visite, c'était aujourd'hui, avant midi.", "Ce matin, c'était notre guide."],
    F04: ["Moi, je cherche d'abord les heures : ce matin, à onze heures, à midi moins le quart, maintenant.", { fr: "Voici les heures en couleur.", action: "material" }, "Les cartes ne sont pas des billets. Il n'est jamais revenu. Il n'a rien payé.", "Suis les heures : ce matin, à onze heures, à midi moins le quart, maintenant. La phrase sans heure parle de l'argent et des cartes : c'est après la visite et avant le départ."],
    F05: ["Moi, je prends seulement ce qu'il ne peut pas expliquer.", { fr: "Regarde l'inventaire.", action: "material" }, "La carte, le badge, la photo et le selfie : chaque objet montre une chose. Notre fiche, on l'a écrite nous-mêmes.", "Lis encore la description de chaque objet. La phrase doit dire la même chose que l'objet."],
    F06: ["Il doit savoir trois choses : où, où exactement, quand.", "Le magasin, l'endroit dans le magasin, et le moment.", "Tu peux commencer : Nous sommes aux Galeries Lafayette…", "Écris le magasin, le service des retours et quand il doit venir : tout de suite, maintenant…"],
    Z01: ["Qu'est-ce qu'elle ne doit pas faire ?", "Avec ne… pas, ne… rien ou il n'y a pas.", "Tu peux commencer : Ne payez…", "Dis-lui avec vous : ne payez pas, ou il n'y a pas de visite."],
    F09: ["Raconte dans l'ordre : le matin, la visite, le départ, l'enquête, la fin.", { fr: "Regarde les débuts de phrases.", action: "material" }, "Le décor à l'imparfait : il portait, il avait. L'action au passé composé : il a pris, il est parti.", "Un décor (il était, il avait), une action (il a pris, il est parti), un ne… pas ou ne… jamais, et une heure, par exemple midi moins le quart."]
  };

  /* ---------- Diagnose: Beschreibungen für die Lehrkraft ---------- */
  G.diag = {
    D_N03: "Führung verstanden (3 aus 6)", D_N04a: "Foto genau angesehen", D_N04b: "Selfie: Gesicht", D_N05: "Falsches Datum erkannt",
    D_N06: "Aufkleber und Rückseite gefunden", D_N07a: "Zeiten in der Beschreibung", D_N07b: "Personenbeschreibung (frei)", D_N07c: "Feste und ablegbare Merkmale",
    D_N08: "Hinweise zu Orten", D_N08w: "Erster Weg (Begründung)", D_R1: "Abfrage: Uhrzeit des Verschwindens",
    D_G01: "Kaufhausplan", D_G02: "Missverständnis geklärt", D_G03: "Passendes Bild gezeigt", D_G04: "W-Fragen statt Ja-Nein-Fragen", D_G04b: "Eigene W-Frage", D_G06: "Karte gezeigt", D_R2: "Abfrage: Rückgabe am selben Tag",
    D_E02: "Aufmerksamkeit verteilt (Beobachtung)", D_E04: "Aussage und Schluss getrennt", D_R3: "Abfrage: Vorname", D_R3b: "Abfrage: was Lucien vorhat",
    D_B01: "Frage an die Bouquiniste", D_B02: "Reihenfolge aus imparfait und déjà", D_B03: "Wörtlich, verändert, erfunden", D_B04: "Zwei Änderungen", D_B05: "Seiten und Orte", D_R4: "Abfrage: Ort um 15 Uhr", D_B06: "Wo warten (Begründung)",
    D_R5: "Abfrage: was die Karte ist", D_F01: "Lucien ohne Mantel erkannt", D_F01b: "Feste Merkmale begründet", D_F03: "Zeitangabe passend", D_F04: "Erklärungskette mit Verneinung",
    D_F05: "Beweise passend begründet", D_F06: "Nachricht an Nowak", D_Z01: "Warnung mit Verneinung", D_F09: "Rapport"
  };

  /* ---------- Lehrkraft: Lösungen, Freischalten ---------- */
  G.profSolutions = [
    ["N03", "Porte secrète au Moyen Âge · les rois passaient par là la nuit · pain plein d'air"],
    ["N04a", "Parapluie, étiquette (manche), sac, livre; Bonus: Preis 8 € im Buch (ab Zoom 2)"],
    ["N04b", "Moustache grise, montre dorée"],
    ["N05", "Le 31 février n'existe pas"],
    ["N06", "Nummer N° 042, Aufkleber an der Ecke oben rechts abziehen, Karte umdrehen"],
    ["N07a", "était, avait, portait, avait, est parti"],
    ["N07c", "facile: parapluie, manteau, badge · difficile: moustache, voix, taille"],
    ["N08", "étiquette → Lafayette, sac → Lafayette, rendez-vous → tour Eiffel, livre → bouquinistes"],
    ["G01", "2e étage"], ["G02", "Non, on cherche l'homme qui le portait"], ["G03", "L'étiquette sur la manche"],
    ["G04", "W-Fragen: vendu quand (F1), quelles questions (F2), comment rendre (F3), jusqu'à quelle heure (F4)"],
    ["E02", "Die zwei Gewinner zwinkern sich in Bild 3 zu, die Tasche mit Karten am Boden, danach das klingelnde Telefon"],
    ["E04", "dit: Lucien ? / Tu rapportes… / Il reste… · déduit: s'appelle Lucien / va rendre / travaillent ensemble / billets = cartes · utile: Lafayette / Nowak / ne pas jouer · faux: a rendu / joueur = Beaumont / parler au joueur"],
    ["B02", "manteau → bouquiniste → guide → visite"],
    ["B03", "mot pour mot: Regardez cette petite porte / Le boulanger… / Un jour… · changé: porte secrète / les rois · pas dans le livre: Suivez le parapluie rouge"],
    ["B04", "porte secrète statt entrée des livraisons; les rois statt les marchands"],
    ["B05", "p. 12 parvis · p. 27 rue Chanoinesse · p. 41 quai aux Fleurs"],
    ["F01", "Der vierte Mann von links (graue Moustache, goldene Uhr, Mantel in der Tüte)"],
    ["F01b", "moustache grise, montre dorée"], ["F03", "Ce matin, c'était notre guide"],
    ["F04", "10 h manteau → 11 h visite → 220 euros/cartes (pas) → midi moins le quart (jamais) → maintenant (rien)"],
    ["F05", "carte = bon de réduction · badge = 31 février · photo = manteau avec étiquette · selfie = moustache et montre · page_guide = vieux livre"]
  ];
  G.profUnlock = ["N04_done", "N05_done", "badge_faux", "N06_done", "carte_peeled", "N07_done", "N08_done", "R1_done", "G01_done", "G02_done", "G03_done", "G05_done", "G06_done", "R2_done", "E03_done", "E04_done", "E05_done", "R3_done", "R3b_done", "B04_done", "B05_done", "R4_done", "B06_done", "B_done", "prix_vu"];

  /* ---------- Abspann ---------- */
  G.credits = {
    title: "Le guide fantôme",
    lines: ["Florian Nowak 2026"]
  };

  /* ---------- Glossar (französisch-deutsch); alle Formen werden in den Spieltexten markiert ---------- */
  G.glossary = [
    ["le parvis", "der Vorplatz"], ["le guide", "der Fremdenführer; auch: der Reiseführer (Buch)"], ["officiel, officielle", "offiziell"], ["déranger", "stören"],
    ["exclusif, exclusive", "exklusiv"], ["la visite", "die Führung, die Besichtigung"], ["avec plaisir", "gern"], ["le parapluie", "der Regenschirm"],
    ["le Moyen Âge", "das Mittelalter"], ["le roi, les rois", "der König, die Könige"], ["le boulanger, la boulangerie", "der Bäcker, die Bäckerei"], ["léger, légère", "leicht"],
    ["plein, pleine", "voll"], ["l'acompte (m)", "die Anzahlung"], ["l'enveloppe (f)", "der Umschlag"], ["tout de suite", "sofort"], ["moins le quart, et quart", "Viertel vor, Viertel nach"],
    ["l'étiquette (f)", "das Etikett"], ["la manche", "der Ärmel"], ["le manteau", "der Mantel"], ["la moustache", "der Schnurrbart"], ["la montre", "die Armbanduhr"],
    ["doré, dorée", "golden"], ["l'appareil dentaire (m)", "die Zahnspange"], ["le badge", "der Ausweis"], ["valable", "gültig"], ["l'autocollant (m)", "der Aufkleber"],
    ["le coin", "die Ecke"], ["se décoller, se décolle", "sich ablösen"], ["le pilier", "der Pfeiler"], ["la fiche de signalement", "die Personenbeschreibung"],
    ["la taille", "die Körpergröße; beim Mantel: die Größe"], ["la voix", "die Stimme"], ["l'indice (m)", "der Hinweis"], ["la piste", "die Spur"],
    ["la coupole", "die Kuppel"], ["le rez-de-chaussée", "das Erdgeschoss"], ["l'étage (m)", "das Stockwerk"], ["le service des retours", "die Warenrückgabe"],
    ["la vendeuse, le vendeur", "die Verkäuferin, der Verkäufer"], ["la laine", "die Wolle"], ["l'ouverture (f)", "die Öffnung; hier: die Ladeneröffnung"],
    ["le client, la cliente", "der Kunde, die Kundin"], ["rendre, rend, rendu", "zurückgeben"], ["le ticket de caisse", "der Kassenbon"], ["le jour même", "am selben Tag"],
    ["poli, polie", "höflich"], ["le bon de réduction, les bons de réduction", "der Rabattgutschein"], ["à moitié prix", "zum halben Preis"], ["le bonneteau", "das Hütchenspiel"],
    ["la balle", "der Ball, die Kugel"], ["gagner, gagné", "gewinnen"], ["le gobelet", "der Becher"], ["le clin d'œil", "das Zwinkern"],
    ["rapporter, rapportes", "zurückbringen"], ["à tout à l'heure", "bis gleich"], ["déduire, déduit", "folgern"], ["le quai", "das Ufer, der Kai"],
    ["le bouquiniste, la bouquiniste", "der Buchhändler, die Buchhändlerin am Seineufer"], ["l'édition (f)", "die Ausgabe (eines Buchs)"], ["insolite", "ungewöhnlich"],
    ["mot pour mot", "Wort für Wort"], ["la livraison, l'entrée des livraisons", "die Lieferung, der Lieferanteneingang"], ["le marchand, les marchands", "der Händler, die Händler"],
    ["le sommaire", "das Inhaltsverzeichnis"], ["oublier, oublié", "vergessen"], ["le malentendu", "das Missverständnis"], ["l'agent de sécurité (m)", "der Sicherheitsmann"],
    ["la preuve", "der Beweis"], ["l'erreur d'impression (f)", "der Druckfehler"], ["je vous en prie", "bitte sehr, gern geschehen"], ["la policière", "die Polizistin"],
    ["le compte est bon", "es ist alles da"], ["le lycée", "die Oberstufe (Schule ab Klasse 10)"], ["le journal", "die Zeitung"], ["prévenir, préviens", "warnen"],
    ["démasquer, démasqué", "entlarven"]
  ];

  return G;
})();
