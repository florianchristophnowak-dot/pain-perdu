/* L'affaire du pain perdu – Spieldaten (Phase 1)
   Quelle: Drehbuch (Konzeptfassung 2.0). Kennungen wie im Drehbuch: S02, M00 … V06.
   Figuren sprechen Französisch; "de" ist Leos umschaltbarer Kommentar. */
window.GAME = (function () {
  const G = {};

  G.version = "0.1.0";

  /* ---------- Figuren ---------- */
  G.chars = {
    narrateur: { name: "", initials: "", color: "#8b7355" },
    leo: { name: "Leo", pt: "pt_leo", initials: "L", color: "#3b4a6b" },
    marie: { name: "Marie", pt: "pt_marie", initials: "M", color: "#8a3b3b" },
    kiosque: { name: "La dame du kiosque", pt: "pt_kiosque", initials: "K", color: "#4a7a4a" },
    gardien: { name: "Le gardien", pt: "pt_gardien", initials: "G", color: "#2f4b7a" },
    chloe: { name: "Chloé", pt: "pt_chloe", initials: "C", color: "#b04a3a" },
    nora: { name: "Nora", pt: "pt_nora", initials: "N", color: "#b07a2a" },
    lenoir: { name: "M. Lenoir", pt: "pt_lenoir", initials: "Le", color: "#6b5a3b" },
    marcel: { name: "Marcel", pt: "pt_marcel", initials: "Mb", color: "#333" },
    assistante: { name: "L'assistante", pt: "pt_assistante", initials: "A", color: "#4a4a6b" },
    nowak: { name: "M. Nowak", pt: "", initials: "N", color: "#5a5a5a" },
    kevin: { name: "Kevin", pt: "", initials: "Kv", color: "#3a7ab0" },
    employee: { name: "L'employée des Catacombes", pt: "pt_catacombes", initials: "E", color: "#555a66" },
    musicien: { name: "Le musicien", pt: "pt_musicien", initials: "Mu", color: "#7a5a2a" }
  };

  /* ---------- Feste Texte ---------- */
  G.ui = {
    title: "L'affaire du pain perdu",
    subtitle: "Une enquête de la 10b à Paris",
    verbs: { regarder: "Regarder", parler: "Parler", montrer: "Montrer", ecouter: "Écouter", comparer: "Comparer", courir: "Courir" },
    btn: {
      carnet: "Carnet", carte: "Carte", inventaire: "Inventaire", aide: "Aide", rejouer: "Rejouer", transcription: "Transcription",
      noter: "Noter", continuer: "Continuer", retour: "Retour", exporter: "Exporter le carnet", valider: "Valider", fermer: "Fermer",
      glossaire: "Glossaire", commencer: "Commencer", reprendre: "Continuer la partie", nouvelle: "Nouvelle partie", lire: "Lire",
      annuler: "Annuler", recommencer: "Recommencer"
    },
    start: { p1: "Joueur 1 :", p2: "Joueur 2 :", p2hint: "(facultatif)", leo: "Commentaires de Leo :", fr: "en français", de: "auf Deutsch" },
    carnet: {
      title: "Notre enquête", proofs: "Preuves", notes: "Mes notes", hyp: "hypothèse", proven: "prouvé",
      cards: "Nos cartes", mission: "Mission"
    },
    inv: { title: "Inventaire", empty: "Rien.", show: "Montrer", showTo: "Montrer à", nothing: { who: "leo", fr: "Non. Ça ne marche pas.", de: "Nein. Das bringt nichts." } },
    partner: "Changement ! {p2} prend la souris, {p1} prend le carnet.",
    solo: "Cette question, chacun répond seul. D'abord {p1}, puis {p2}.",
    soloNow: "C'est à {p} de répondre.",
    travel: { who: "leo", fr: "Encore le métro. Je connais Paris par en dessous.", de: "Schon wieder Métro. Ich kenne Paris von unten." },
    end: "Bravo ! L'affaire est résolue.",
    mouse: "Souris :",
    marie: {
      proofOk: "Oui ! C'est une preuve.",
      proofNo: "Hmm, ça ne répond pas à cette question. Relis.",
      locked: "Pas encore. Il nous faut un indice pour aller là-bas.",
      afterHelp: "Bien. La prochaine fois, sans moi !",
      tense: "C'est le décor ou l'action ?",
      witness: "Tu veux parler de maintenant, de plus tard ou de tout à l'heure ?",
      helpLater: "Essaie encore une fois. Après, je t'aide."
    },
    mapQuestion: "Question sur place :",
    locked: "fermé",
    done: "fait",
    missing: "il manque une preuve pour Q2"
  };

  /* ---------- Fragen und Belege ---------- */
  G.questions = {
    Q1: { title: "Qui est le mime ?", need: 1 },
    Q2: { title: "Où et quand joue-t-il aujourd'hui ?", need: 2, viaL02b: true },
    Q3: { title: "Voleur ou erreur ?", need: 2 },
    Q4: { title: "Qu'est-ce qu'il y a dans notre sac ?", need: 2 }
  };
  // strong: zählt für "prouvé"; sonst nur Hinweis
  G.proofs = {
    pf_note_sac: { q: "Q4", strong: true, text: "Notre sac : la boîte bleue de Kevin est dans la poche de devant, l'enveloppe rouge est sous les billets." },
    pf_carte_chloe: { q: "Q1", strong: false, text: "Carte de Chloé : quelqu'un au Père-Lachaise connaît le mime." },
    pf_ticket: { q: "Q2", strong: false, text: "Ticket de caisse : Nora connaît son spectacle." },
    pf_temoin: { q: "Q3", strong: false, text: "Témoin : il a pris le sac pendant la photo." },
    pf_nom: { q: "Q1", strong: true, text: "Le gardien : le mime s'appelle Marcel Blanchard.", short: "le nom : Marcel Blanchard (gardien)" },
    pf_photo_matin: { q: "Q3", strong: true, text: "Photo du matin : Marcel avait déjà son sac brun." },
    pf_programme: { q: "Q2", strong: true, text: "Message de Marcel : le programme corrigé est à la librairie.", short: "programme corrigé (message de Marcel)" },
    pf_erreur: { q: "Q3", strong: true, text: "Marcel : « Je crois que j'ai pris le mauvais sac. »" },
    pf_sms: { q: "Q4", strong: true, text: "SMS de Kevin : boîte bleue, nom KEVIN, poche de devant." },
    pf_carte_marcel: { q: "Q3", strong: true, text: "Carte de Marcel : « J'ai pris le mauvais sac. Je croyais que c'était mon sac. »" },
    pf_louvre: { q: "Q2", strong: true, text: "Affiche C : aujourd'hui, 17 h, cour du Louvre." },
    pf_chloe_sac: { q: "Q3", strong: true, text: "Chloé (répétition) : le sac brun avec la fermeture rouge et l'autocollant jaune est à Marcel." }
  };

  /* ---------- Inventar ---------- */
  G.items = {
    sac_bernd: { name: "le sac Bernd", desc: "Un grand pain avec un visage... pas content. Dedans : les billets, la boîte bleue de Kevin, l'enveloppe rouge.", start: true },
    carte_eleve: { name: "la carte d'élève", desc: "Leo, 10b, Erfurt.", start: true },
    nougat: { name: "le nougat Viba", desc: "Pour les urgences.", start: true },
    cola: { name: "la Vita Cola", desc: "Une bouteille de Thuringe. Personne à Paris ne connaît ça.", start: true },
    telephone: { name: "le téléphone", desc: "Batterie : 23 %.", start: true },
    sac_mime: { name: "le sac du mime", desc: "Brun, avec une fermeture rouge et un autocollant jaune. Dedans : trois baguettes en plastique, un gant blanc, un programme mouillé." },
    carte_chloe: { name: "la carte de Chloé", desc: "« Père-Lachaise, ce matin. Merci pour les textes ! Chloé »" },
    ticket: { name: "le ticket de caisse", desc: "Boulangerie dans le Marais. Au dos : « Nora connaît mon spectacle. »" },
    photo_groupe: { name: "la photo de groupe", desc: "Derrière la classe, on voit le mime avec son béret." },
    flyer: { name: "le flyer", desc: "« Marcel — Le Pain perdu — spectacle de mime — ce soir dans Paris »" },
    photo_chloe: { name: "la photo de Chloé", desc: "Photo de ce matin : Chloé et Marcel Blanchard. Marcel avait déjà son sac brun. Le sac a une fermeture rouge et un autocollant jaune." },
    affiche_a: { name: "l'affiche A", desc: "Marcel Blanchard — Le Pain perdu — aujourd'hui, 17 h — place des Vosges. Première version." },
    affiche_b: { name: "l'affiche B", desc: "Marcel Duval — Le Pain perdu — aujourd'hui, 17 h — cour de la librairie. Version corrigée." },
    affiche_c: { name: "l'affiche C", desc: "Marcel Blanchard — Le Pain perdu — aujourd'hui, 17 h — cour du Louvre. Version corrigée. Ce programme remplace l'ancien programme." },
    carte_marcel: { name: "la carte de Marcel", desc: "« J'ai pris le mauvais sac à Montmartre. Je suis désolé ! … Pour avoir le sac, dites-moi ce qu'il y a dedans. — Marcel »" },
    pain_perdu: { name: "une part de pain perdu", desc: "Un dessert. Pas un sac." },
    carte_demain: { name: "la carte « demain »", desc: "« Demain, 11 h : rendez-vous devant l'entrée des Catacombes. Apporter les décors. — Chloé, 06 12 34 56 78 »" }
  };

  /* ---------- Hörtexte ---------- */
  G.audio = {
    au_kiosque: { who: "kiosque", text: "Oui, j'ai vu le monsieur. Il portait un pull rayé et il avait un béret. Il y avait deux sacs bruns à côté de lui. Pendant que vous regardiez votre photo, il a pris le sac près de l'escalier. Puis il est parti vers le métro. Ce matin, il était au Père-Lachaise. Cet après-midi, il va dans le Marais. Mais ce soir ? Je ne sais pas où il joue. Demandez à Nora, la boulangère." },
    au_gardien: { who: "gardien", text: "Le mime sur votre photo ? Il s'appelle Marcel Blanchard. Ce matin, il était ici, avec un sac brun. Il a apporté des textes à Chloé, puis il est reparti. Chloé a peut-être une photo. Allez tout droit jusqu'au carrefour, puis tournez à gauche. Chloé est près du banc rouge. Ne prenez pas le chemin qui descend : il va vers une autre sortie." },
    au_chloe: { who: "chloe", text: "Pour demain, on prépare les décors. Les crânes sont en carton. Ne prenez pas les vieux panneaux ! Sur le nouveau panneau, écrivez : « On cherche des objets, pas des problèmes. » Marcel doit apporter son sac brun avec la fermeture rouge et l'autocollant jaune." },
    au_assistante: { who: "assistante", text: "Tu peux m'aider ? Pose le miroir à droite de la boîte, puis mets la baguette en plastique derrière la lampe. N'allume pas la lampe rouge. Allume la lampe bleue." },
    au_marcel: { who: "marcel", text: "Salut Nora, c'est Marcel. J'ai ouvert mon sac et... surprise : il y avait une boîte bleue et des billets de train ! Ce n'est pas à moi. À Montmartre, il y avait deux sacs bruns, et j'étais pressé. Je crois que j'ai pris le mauvais sac. Attention, pour mon spectacle Le Pain perdu, le programme a changé. Ne donne pas l'ancien programme aux gens. Le programme corrigé est à la librairie Les Mots retrouvés. Je vais laisser un message là-bas pour les personnes qui ont mon sac." }
  };

  /* ---------- Szenen und Hotspots (Koordinaten in % des Bildes) ---------- */
  G.scenes = {
    montmartre: {
      name: "Montmartre · Sacré-Cœur", bg: "bg_montmartre", enter: "M01",
      hotspots: [
        { id: "sac_brun", label: "le sac brun", x: 80, y: 58, w: 12, h: 22, actions: { regarder: "M02" }, hideIf: "M02_done" },
        { id: "kiosque", label: "la dame du kiosque", x: 1, y: 30, w: 12, h: 50, who: "kiosque", actions: { parler: [{ if: "M04b_done", node: "M03r" }, { node: "M03" }], montrer: { photo_groupe: "M03a" } } },
        { id: "escalier", label: "l'escalier", x: 44, y: 60, w: 30, h: 36, actions: { regarder: "M01e" } },
        { id: "metro", label: "le métro", x: 92, y: 28, w: 8, h: 45, actions: { courir: "M06" } }
      ]
    },
    pere_lachaise: {
      name: "Cimetière du Père-Lachaise", bg: "bg_pere_lachaise", enter: "P01",
      hotspots: [
        { id: "gardien", label: "le gardien", x: 78, y: 26, w: 18, h: 70, who: "gardien", actions: { parler: [{ if: "P07_done", node: "P02r" }, { if: "P03_done", node: "P07" }, { node: "P02" }], montrer: { photo_groupe: "P03", carte_chloe: "P03" } } },
        { id: "gaston", label: "Gaston", x: 48, y: 55, w: 24, h: 30, actions: { regarder: [{ if: "P07_done", node: "P07r" }, { if: "P03_done", node: "P07" }, { node: "P01g" }] } },
        { id: "plan", label: "le plan", x: 2, y: 4, w: 14, h: 24, actions: { regarder: [{ if: "P03_done", node: "P04" }, { node: "P01p" }] } },
        { id: "banc", label: "le banc rouge", x: 26, y: 38, w: 16, h: 18, who: "chloe", actions: { parler: [{ if: "P04_done", node: "P05" }, { node: "P01x" }], regarder: [{ if: "P04_done", node: "P05" }, { node: "P01x" }] } },
        { id: "chemin", label: "le chemin qui descend", x: 88, y: 72, w: 12, h: 26, actions: { regarder: "P01x" } }
      ]
    },
    marais: {
      name: "Le Marais · boulangerie de Nora", bg: "bg_boulangerie", enter: "B01",
      hotspots: [
        { id: "nora", label: "Nora", x: 51, y: 24, w: 12, h: 36, who: "nora", actions: { parler: [{ if: "B04_done", node: "B02r" }, { node: "B02" }], montrer: { ticket: "B02t", photo_groupe: "B02", flyer: "B02" } } },
        { id: "flyer", label: "le flyer", x: 34, y: 42, w: 7, h: 12, actions: { regarder: "B01a" } },
        { id: "panneau", label: "le panneau", x: 33, y: 10, w: 22, h: 30, actions: { regarder: "B01p" } },
        { id: "telephone", label: "le téléphone de Nora", x: 69, y: 40, w: 7, h: 12, actions: { ecouter: "B03" }, showIf: "B03_open" },
        { id: "porte", label: "la porte de la librairie", x: 90, y: 18, w: 10, h: 62, actions: { regarder: "GO_librairie" } }
      ]
    },
    librairie: {
      name: "Librairie Les Mots retrouvés", bg: "bg_librairie", enter: "L01",
      hotspots: [
        { id: "panneau", label: "le panneau", x: 56, y: 6, w: 18, h: 38, actions: { regarder: "L02" } },
        { id: "lenoir", label: "M. Lenoir", x: 12, y: 18, w: 24, h: 78, who: "lenoir", actions: { parler: "L03" } },
        { id: "table", label: "la table", x: 48, y: 72, w: 40, h: 28, actions: { regarder: [{ if: "L04_done", node: "L04r" }, { node: "L04" }] } },
        { id: "carte_marcel", label: "la carte de Marcel", x: 86, y: 40, w: 12, h: 14, actions: { regarder: "L05" }, showIf: "L04_done" }
      ]
    },
    louvre: {
      name: "Cour du Louvre", bg: "bg_louvre_cour", enter: "V00",
      hotspots: [
        { id: "assistante", label: "l'assistante", x: 1, y: 30, w: 12, h: 60, who: "assistante", actions: { parler: [{ if: "Q2_proven", node: "V02" }, { node: "V01" }] } },
        { id: "scene", label: "la scène", x: 22, y: 8, w: 30, h: 45, actions: { regarder: "V00s" } },
        { id: "marcel", label: "Marcel", x: 62, y: 26, w: 26, h: 72, who: "marcel", actions: { parler: [{ if: "V03_done", node: "V03r" }, { if: "V02_done", node: "V03" }, { node: "V00m" }] }, showIf: "Q2_proven" }
      ]
    },
    /* Phase 2 */
    vosges: {
      name: "Place des Vosges", bg: "bg_vosges", enter: "X01",
      hotspots: [{ id: "musicien", label: "le musicien", x: 40, y: 25, w: 20, h: 60, who: "musicien", actions: { parler: "X01" } }]
    },
    catacombes: {
      name: "Catacombes · Denfert-Rochereau", bg: "bg_catacombes_entree", enter: "C02",
      hotspots: [
        { id: "employee", label: "l'employée", x: 40, y: 25, w: 20, h: 60, who: "employee", actions: { parler: "C02" } },
        { id: "tel", label: "le téléphone", x: 70, y: 60, w: 14, h: 20, actions: { regarder: "C02c" }, showIf: "C02_done" }
      ]
    },
    repetition: { name: "Catacombes · la répétition", bg: "bg_catacombes", enter: null, hotspots: [] },
    lampes: { name: "Cour du Louvre · les lampes", bg: "bg_lampes", enter: null, hotspots: [] }
  };

  /* ---------- Karte ---------- */
  G.map = {
    places: [
      { id: "montmartre", label: "Montmartre · Sacré-Cœur", q: "Le point de départ", x: 46, y: 13, unlock: "always", done: ["M02_done", "M04b_done"] },
      { id: "pere_lachaise", label: "Cimetière du Père-Lachaise", q: "Qui connaît ce mime ?", x: 82, y: 26, unlock: "M02_done", done: ["P03_done", "P04_done", "P06_done"], q2proof: "pf_nom" },
      { id: "marais", label: "Le Marais · boulangerie de Nora", q: "Quel est son spectacle ?", x: 58, y: 36, unlock: "M02_done", done: ["B04_done", "B05_done", "B06_done"], q2proof: "pf_programme" },
      { id: "librairie", label: "Librairie Les Mots retrouvés", q: "Quel programme est le bon ?", x: 52, y: 54, unlock: "M02_done", done: ["L02_done", "L04_done"] },
      { id: "louvre", label: "Cour du Louvre", q: "Rendez-vous à 17 h", x: 30, y: 40, unlock: "always", done: ["V03_done", "V05_done"], finale: true },
      { id: "vosges", label: "Place des Vosges", q: "L'ancien lieu ?", x: 72, y: 46, unlock: "vosges_seen", hideUntil: "vosges_seen", done: ["X01_done"] },
      { id: "catacombes", label: "Catacombes · Denfert-Rochereau", q: "Aujourd'hui ou demain ?", x: 30, y: 58, unlock: "C01_found", hideUntil: "C01_found", done: ["C02_done"] }
    ]
  };

  /* ---------- Dialogknoten ---------- */
  // Zeile: { who, fr, de? }  de = Leos Kommentar in der deutschen Fassung
  // Auswahl: { fr, kind: ok|repair|wrong, reply: [Zeilen], next, effects }
  const N = {};

  N.S02 = { type: "cut", bg: "bg_montmartre", lines: [
    { who: "narrateur", fr: "Paris, 13 heures. La classe 10b d'Erfurt est à Montmartre. Monsieur Nowak compte les élèves pour la cinquième fois. Leo tient le sac de la classe : Bernd, un grand pain avec un visage... pas content." },
    { who: "leo", fr: "Un sac en forme de pain. Très discret.", de: "Ein Rucksack in Brotform. Sehr unauffällig." }
  ], next: "M00" };

  N.M00 = { type: "doc", title: "Le sac Bernd", icon: "sac", doc: "Dans le sac : les billets de train, la boîte bleue de Kevin et l'enveloppe rouge de monsieur Nowak. La boîte bleue est dans la poche de devant. L'enveloppe rouge est sous les billets.",
    lines: [{ who: "marie", fr: "Note ça. On ne sait jamais." }],
    choices: [
      { fr: "Noter", kind: "ok", effects: { proof: "pf_note_sac", flag: "M00_done" }, next: "M00c" },
      { fr: "Fermer le sac", kind: "wrong", reply: [{ who: "marie", fr: "Attends, note d'abord." }], next: "M00" }
    ] };

  N.M00c = { type: "cut", bg: "cut_confusion", lines: [
    { who: "narrateur", fr: "Devant le Sacré-Cœur, un mime fait un mur invisible. Leo pose Bernd à côté du sac du mime. Un coup de vent, des baguettes partout... et le mime part avec le mauvais sac !" },
    { who: "leo", fr: "Hé ! Le clown ! Mon sac !", de: "He! Der Clown! Mein Rucksack!" },
    { who: "marie", fr: "Attends. On regarde d'abord." }
  ], effects: { item: "photo_groupe" }, next: "SCENE_montmartre" };

  N.M01 = { type: "lines", once: "M01_seen", lines: [{ who: "marie", fr: "Il y a un sac sur l'escalier. Et une dame au kiosque." }] };
  N.M01e = { type: "lines", lines: [{ who: "narrateur", fr: "Des marches, des feuilles mortes et des touristes. Le mime n'est plus là." }] };

  N.M02 = { type: "doc", title: "Le sac brun", icon: "sac", doc: "Ce n'est pas mon sac ! Il y a trois baguettes en plastique, un gant blanc et un programme mouillé. Sur une carte, on peut lire : « Père-Lachaise, ce matin. Merci pour les textes ! Chloé » Le ticket de caisse vient d'une boulangerie dans le Marais. Au dos : « Nora connaît mon spectacle. » Il y a aussi une deuxième carte : « Demain, 11 h : rendez-vous devant l'entrée des Catacombes. Apporter les décors. — Chloé, 06 12 34 56 78 »",
    lines: [{ who: "leo", fr: "Le pain a eu des bébés. Ce n'est pas bon signe.", de: "Das Brot hat Nachwuchs bekommen. Das ist kein gutes Zeichen." }],
    effects: { items: ["sac_mime", "carte_chloe", "ticket", "carte_demain"], flag: "C01_found" },
    next: "M02t" };

  N.M02t = { type: "task", diag: "D_M02", help: "M02", title: "Carnet : à quelle question ?",
    task: { kind: "assign", intro: "Chaque document aide pour une question. Choisis la question.",
      docs: [
        { id: "carte_chloe", label: "la carte de Chloé", text: "« Père-Lachaise, ce matin. Merci pour les textes ! Chloé »", answer: "Q1", proof: "pf_carte_chloe", ok: "Quelqu'un au Père-Lachaise connaît le mime." },
        { id: "ticket", label: "le ticket de caisse", text: "Boulangerie dans le Marais. Au dos : « Nora connaît mon spectacle. »", answer: "Q2", proof: "pf_ticket", ok: "Nora connaît son spectacle." }
      ],
      wrong: { who: "marie", fr: "Relis : qui peut nous aider, et pour quelle question ?" } },
    effects: { flag: "M02_done" },
    after: [{ who: "marie", fr: "Deux pistes : le Père-Lachaise et le Marais. On peut y aller avec la carte." }],
    next: "SCENE_montmartre" };

  N.M03 = { type: "choice", who: "kiosque", diag: "D_M03", help: "M03", helpAfter: 2,
    lines: [{ who: "kiosque", fr: "Bonjour, les jeunes. Vous avez l'air perdus." }],
    choices: [
      { fr: "Vous avez vu cet homme ?", kind: "ok", next: "M03a" },
      { fr: "Vous cherchez cet homme ?", kind: "wrong", reply: [{ who: "kiosque", fr: "Moi ? Non. C'est vous qui le cherchez ?" }], next: "M03" },
      { fr: "Vous allez voir cet homme ?", kind: "wrong", reply: [{ who: "kiosque", fr: "Plus tard ? Je ne sais pas. Vous voulez savoir si je l'ai vu ?" }], next: "M03" }
    ] };
  N.M03r = { type: "lines", lines: [{ who: "kiosque", fr: "Nora, la boulangère. Dans le Marais." }] };

  N.M03a = { type: "audio", audio: "au_kiosque", transcriptHelp: "M04", effects: { flag: "M03_done" }, next: "M04" };

  N.M04 = { type: "task", diag: "D_M04", help: "M04", perPlayer: true, audio: "au_kiosque", title: "Témoin du kiosque",
    task: { kind: "sort", intro: "Où était le mime ? Où va-t-il ? Choisis pour chaque moment.",
      slots: [{ id: "matin", label: "ce matin", answer: "pl" }, { id: "apres", label: "cet après-midi", answer: "marais" }, { id: "soir", label: "ce soir", answer: "nsp" }],
      options: [{ id: "pl", label: "Père-Lachaise" }, { id: "marais", label: "le Marais" }, { id: "louvre", label: "le Louvre" }, { id: "montmartre", label: "Montmartre" }, { id: "nsp", label: "on ne sait pas" }],
      wrong: { who: "marie", fr: "Écoute encore. Elle parle de trois moments." } },
    next: "M04b" };

  N.M04b = { type: "task", diag: "D_M04b", help: "M04b", audio: "au_kiosque", title: "Rapport de témoin",
    task: { kind: "gap", intro: "Choisis la forme qui convient.",
      parts: ["Le monsieur ", { id: "g1", opts: ["portait", "a porté"], answer: "portait" }, " un pull rayé. Pendant que nous ", { id: "g2", opts: ["regardions", "avons regardé"], answer: "regardions" }, " la photo, il ", { id: "g3", opts: ["prenait", "a pris"], answer: "a pris" }, " le sac. Puis il ", { id: "g4", opts: ["partait", "est parti"], answer: "est parti" }, " vers le métro."],
      wrong: { who: "marie", fr: "C'est le décor ou l'action ?" } },
    effects: { proof: "pf_temoin", flag: "M04b_done" },
    next: "M05" };

  N.M05 = { type: "lines", lines: [
    { who: "marie", fr: "Alors, on commence par les indices. Père-Lachaise ou le Marais ?" },
    { who: "leo", fr: "Paris est grand. Mon problème aussi.", de: "Paris ist groß. Mein Problem auch." }
  ], next: "MAP" };

  N.M06 = { type: "lines", diag: "D_M06", count: true, lines: [
    { who: "narrateur", fr: "Au métro, il y a trois lignes et beaucoup de gens. Pas de mime." },
    { who: "marie", fr: "Il y a plusieurs directions. Qui peut nous aider ?" }
  ] };

  /* Père-Lachaise */
  N.P01 = { type: "lines", once: "P01_seen", lines: [
    { who: "marie", fr: "Un cimetière, des arbres, un gardien et un chien." },
    { who: "leo", fr: "Et une balle. Le chien ne regarde que la balle.", de: "Und ein Ball. Der Hund guckt nur auf den Ball." }
  ] };
  N.P01g = { type: "lines", lines: [{ who: "narrateur", fr: "Gaston, un labrador. Il regarde une balle sous le banc. Seulement la balle." }] };
  N.P01p = { type: "lines", lines: [{ who: "marie", fr: "Un plan du cimetière. Beaucoup de chemins. On ne sait pas encore où est Chloé. Demandons au gardien." }] };
  N.P01x = { type: "lines", lines: [{ who: "marie", fr: "On ne sait pas encore où est Chloé. Demandons au gardien." }] };

  N.P02 = { type: "choice", who: "gardien", diag: "D_P02", help: "P02", firstOnly: true,
    lines: [{ who: "gardien", fr: "Bonjour. Vous cherchez une tombe ? Jim Morrison, c'est par là." }],
    choices: [
      { fr: "Non, on cherche un homme. Vous avez vu ce mime ?", hint: "(montre la photo de groupe)", kind: "ok", next: "P03" },
      { fr: "Oui, Jim Morrison, s'il vous plaît.", kind: "repair", reply: [{ who: "gardien", fr: "Tout droit, puis à droite. Bonne visite !" }, { who: "leo", fr: "Marie, on ne cherche pas Jim Morrison.", de: "Marie, wir suchen nicht Jim Morrison." }], next: "P02" },
      { fr: "Vous connaissez Chloé ?", kind: "repair", reply: [{ who: "gardien", fr: "Chloé ? Oui, elle est là-bas avec son groupe de théâtre. Pourquoi ?" }], next: "P02" }
    ] };
  N.P02r = { type: "lines", lines: [{ who: "gardien", fr: "Marcel Blanchard. Tout droit, puis à gauche." }] };

  N.P03 = { type: "audio", audio: "au_gardien", transcriptHelp: "P04", effects: { flag: "P02_done" }, next: "P03t" };

  N.P03t = { type: "task", diag: "D_P03", title: "Carnet : le nom",
    task: { kind: "assign", intro: "Le gardien a donné une information importante. Pour quelle question ?",
      docs: [{ id: "nom", label: "« Il s'appelle Marcel Blanchard. »", text: "", answer: "Q1", proof: "pf_nom", ok: "Le mime s'appelle Marcel Blanchard." }],
      wrong: { who: "marie", fr: "Hmm, ça ne répond pas à cette question. Relis." } },
    effects: { flag: "P03_done" },
    after: [{ who: "marie", fr: "Marcel Blanchard. Et Chloé est près du banc rouge : tout droit, puis à gauche. Regarde le plan." }],
    next: "SCENE_pere_lachaise" };

  N.P04 = { type: "task", diag: "D_P04", help: "P04", audio: "au_gardien", title: "Le plan : quel chemin ?",
    task: { kind: "route", intro: "Clique sur le chemin de Chloé, étape par étape.",
      steps: [
        { id: "s1", prompt: "Depuis l'entrée...", opts: [{ id: "droit", label: "tout droit", ok: true }, { id: "descend", label: "le chemin qui descend", ok: false, reply: "Non, pas par là ! Ça descend vers l'autre sortie." }] },
        { id: "s2", prompt: "Au carrefour...", opts: [{ id: "gauche", label: "à gauche", ok: true }, { id: "droite", label: "à droite", ok: false, reply: "Non, pas par là ! Ça descend vers l'autre sortie." }] }
      ],
      who: "gardien" },
    effects: { flag: "P04_done" },
    after: [{ who: "marie", fr: "Le banc rouge ! Il y a quelqu'un." }],
    next: "P05" };

  N.P05 = { type: "choice", who: "chloe", diag: "D_P05", count: true,
    lines: [{ who: "chloe", fr: "Salut ! Vous êtes des amis de Marcel ?" }],
    choices: [
      { fr: "Non. Marcel a pris notre sac à Montmartre.", kind: "ok", reply: [{ who: "chloe", fr: "Marcel ? Il a pris votre sac ? Ça m'étonne... Regardez : ce matin, il avait déjà son sac." }], next: "P06" },
      { fr: "On cherche Marcel. Il était ici ce matin ?", kind: "ok", reply: [{ who: "chloe", fr: "Oui ! Il a apporté les textes pour notre balade littéraire. J'ai une photo de ce matin, regardez." }], next: "P06" },
      { fr: "Vous avez le sac Bernd ?", kind: "repair", reply: [{ who: "chloe", fr: "Un sac... Bernd ? Non, désolée. Mais j'ai une photo de Marcel de ce matin." }], next: "P06" }
    ],
    effects: { item: "photo_chloe", flag: "P05_done" } };

  N.P06 = { type: "task", diag: "D_P06", help: "P06", title: "Comparer : la photo et le sac",
    task: { kind: "pick", intro: "Photo de ce matin : Chloé et Marcel Blanchard. Marcel avait déjà son sac brun. Le sac a une fermeture rouge et un autocollant jaune.", question: "Quels deux détails sont pareils sur la photo et sur le sac ?", n: 2,
      options: [{ id: "fr", label: "la fermeture rouge", ok: true }, { id: "aj", label: "l'autocollant jaune", ok: true }, { id: "fb", label: "la fermeture bleue", ok: false }, { id: "av", label: "l'autocollant vert", ok: false }, { id: "vp", label: "le visage de pain", ok: false }],
      wrong: { who: "marie", fr: "Regarde bien le sac sur la photo. Qu'est-ce que tu vois ?" } },
    effects: { proof: "pf_photo_matin", flag: "P06_done" },
    after: [
      { who: "marie", fr: "Donc le sac brun est à lui. Et Bernd ? Il l'a pris... par erreur ?" },
      { who: "leo", fr: "Ou c'est un voleur très organisé.", de: "Oder ein sehr gut organisierter Dieb." }
    ],
    next: "P06c" };
  N.P06c = { type: "choice", who: "chloe", noDiag: true,
    lines: [{ who: "chloe", fr: "Demain, on répète aux Catacombes. Tu veux écouter notre répétition ?" }],
    choices: [
      { fr: "Oui, avec plaisir !", kind: "ok", next: "C03s" },
      { fr: "Plus tard, merci. On cherche notre sac.", kind: "ok", reply: [{ who: "chloe", fr: "D'accord. Bonne chance !" }], next: "END" }
    ] };

  /* Marais */
  N.B01 = { type: "lines", once: "B01_seen", lines: [
    { who: "narrateur", fr: "Sur le panneau : « Aujourd'hui : pain perdu »" },
    { who: "leo", fr: "Enfin un magasin qui vend mon problème.", de: "Endlich ein Laden, der mein Problem verkauft." },
    { who: "marie", fr: "Le pain perdu, c'est un dessert, Leo." }
  ] };
  N.B01p = { type: "doc", title: "Le panneau", icon: "panneau", doc: "Aujourd'hui : pain perdu — 2,50 € la part", lines: [{ who: "marie", fr: "Un dessert : du pain, du lait, des œufs, du sucre." }] };
  N.B01a = { type: "doc", title: "Le flyer", icon: "flyer", diag: "D_B01", count: true, doc: "Marcel — Le Pain perdu — spectacle de mime — ce soir dans Paris", effects: { item: "flyer", flag: "B01a_done" }, lines: [{ who: "leo", fr: "Marcel. Comme sur la carte de Chloé.", de: "Marcel. Wie auf Chloés Karte." }] };

  N.B02 = { type: "choice", who: "nora", diag: "D_B02", help: "B02", firstOnly: true,
    lines: [{ who: "nora", fr: "Bonjour ! Qu'est-ce que je vous sers ?" }],
    choices: [
      { fr: "Je voudrais du pain perdu.", kind: "repair", reply: [{ who: "nora", fr: "Avec plaisir ! Une part ou deux ?" }, { who: "nora", fr: "Et voilà. Autre chose ?" }, { who: "marie", fr: "Leo, on ne cherche pas un dessert." }], effects: { item: "pain_perdu" }, next: "B02" },
      { fr: "Je cherche un sac qui ressemble à un pain.", kind: "ok", reply: [{ who: "nora", fr: "Un sac... comme un pain ? Il est comment ?" }], next: "B02b" },
      { fr: "Je cherche le spectacle qui s'appelle Le Pain perdu.", kind: "ok", reply: [{ who: "nora", fr: "Le Pain perdu ! C'est le spectacle de Marcel. Il est passé ici à 14 heures et il a laissé un message pour moi. Écoutez." }], next: "B03" }
    ] };
  N.B02t = { type: "lines", lines: [{ who: "nora", fr: "Mon ticket ! Vous l'avez trouvé où ? Un sac... Il est comment ?" }], next: "B02b" };
  N.B02r = { type: "lines", lines: [{ who: "nora", fr: "Le message de Marcel ? Il est encore sur mon téléphone." }] };

  N.B02b = { type: "choice", who: "nora", diag: "D_B02b", count: true,
    lines: [{ who: "nora", fr: "Il est comment, ce sac ?" }],
    choices: [
      { fr: "Brun, grand, avec un visage de pain.", kind: "ok", reply: [{ who: "nora", fr: "Un mime l'a pris ? Ah, Marcel ! Il est passé ici à 14 heures. Il avait l'air inquiet. Il a laissé un message. Écoutez." }], next: "B03" },
      { fr: "Brun, avec une fermeture rouge et un autocollant jaune.", kind: "wrong", reply: [{ who: "nora", fr: "Ça, c'est le sac de Marcel ! Il était là ce matin, avec ce sac." }, { who: "marie", fr: "C'est le sac du mime, Leo. Pas Bernd." }], next: "B02b" }
    ] };

  N.B03 = { type: "audio", audio: "au_marcel", transcriptHelp: "B04", effects: { flag: "B03_open" }, next: "B04" };

  N.B04 = { type: "task", diag: "D_B04", help: "B04", audio: "au_marcel", title: "Qu'est-ce qui est sûr ?",
    task: { kind: "pick", intro: "Marcel dit beaucoup de choses. Trois phrases sont sûres.", question: "Choisis les trois phrases sûres.", n: 3,
      options: [
        { id: "a", label: "Marcel a trouvé des affaires qui ne sont pas à lui.", ok: true },
        { id: "b", label: "Marcel veut garder le sac.", ok: false },
        { id: "c", label: "Il pense qu'il a pris le mauvais sac.", ok: true },
        { id: "d", label: "Le spectacle est annulé.", ok: false },
        { id: "e", label: "Le programme de son spectacle a changé.", ok: true },
        { id: "f", label: "Marcel est encore à la boulangerie.", ok: false }
      ],
      wrong: { who: "marie", fr: "Écoute encore. Qu'est-ce qu'il dit vraiment ?" } },
    effects: { proofs: ["pf_programme", "pf_erreur"], flag: "B04_done" },
    after: [
      { who: "marie", fr: "Donc : pas un voleur. Une erreur." },
      { who: "leo", fr: "Dommage. J'aimais bien mon histoire de voleur.", de: "Schade. Ich mochte meine Diebesgeschichte." }
    ],
    next: "B05" };

  N.B05 = { type: "doc", title: "SMS de Kevin", icon: "sms", doc: "Leo !!! Ma boîte bleue est dans la poche de devant du sac. Dessus, il y a mon nom : KEVIN, avec un K. Dedans, c'est mon appareil dentaire. Sans lui, je ne peux pas manger de baguette. Trouve le sac !!!",
    lines: [{ who: "narrateur", fr: "Le téléphone de Leo vibre." }], next: "B05t" };
  N.B05t = { type: "task", diag: "D_B05", help: "B05", title: "Carnet : le SMS de Kevin",
    task: { kind: "assign", intro: "Pour quelle question le SMS est-il une preuve ?",
      docs: [{ id: "sms", label: "le SMS de Kevin", text: "boîte bleue, nom KEVIN, poche de devant", answer: "Q4", proof: "pf_sms", ok: "Dans notre sac : la boîte bleue de Kevin, dans la poche de devant." }],
      wrong: { who: "marie", fr: "De quoi parle Kevin ? Relis." } },
    effects: { flag: "B05_done" },
    next: "B06" };

  N.B06 = { type: "task", diag: "D_B06", help: "B06", title: "Message à M. Nowak",
    task: { kind: "write", intro: "Écris à monsieur Nowak : qu'est-ce qui s'est passé ? Où allez-vous ? (au moins 25 mots)", min: 25,
      starters: ["Le mime avait...", "Il a pris...", "On va à..."],
      model: "Le mime avait un sac brun, comme nous. Il a pris notre sac par erreur et il a trouvé nos affaires. On va à la librairie Les Mots retrouvés pour lire son message. Marie est avec moi." },
    effects: { flag: "B06_done" },
    after: [{ who: "nowak", fr: "Merci, Leo. 17 heures au Louvre, n'oubliez pas ! Je compte... encore une fois." }],
    next: "SCENE_marais" };

  /* Librairie */
  N.L01 = { type: "lines", once: "L01_seen", lines: [
    { who: "lenoir", fr: "Attention à l'échelle ! Les livres restent. Les programmes changent." },
    { who: "leo", fr: "Une échelle trop grande pour une étagère trop petite. J'aime cet homme.", de: "Eine zu große Leiter für ein zu kleines Regal. Ich mag diesen Mann." }
  ] };

  N.L02 = { type: "task", diag: "D_L02", help: "L02", title: "Le panneau : trois affiches",
    task: { kind: "poster", intro: "Quel programme est le bon ?",
      posters: [
        { id: "A", text: "Marcel Blanchard — Le Pain perdu — aujourd'hui, 17 h — place des Vosges. Première version.", ok: false, reply: { who: "lenoir", fr: "C'est la première version. Regardez : « Version corrigée », c'est une autre affiche." }, flag: "vosges_seen" },
        { id: "B", text: "Marcel Duval — Le Pain perdu — aujourd'hui, 17 h — cour de la librairie. Version corrigée.", ok: false, reply: { who: "lenoir", fr: "Marcel Duval ? Vous êtes sûrs ? Il y a deux Marcel dans la compagnie." } },
        { id: "C", text: "Marcel Blanchard — Le Pain perdu — aujourd'hui, 17 h — cour du Louvre. Version corrigée. Ce programme remplace l'ancien programme.", ok: true }
      ],
      proofsIntro: "Pourquoi C ? Choisis deux preuves dans le carnet.",
      needed: ["pf_nom", "pf_programme"],
      missing: { pf_nom: "Peut-être. Mais il nous manque une preuve : le nom.", pf_programme: "Peut-être. Mais il nous manque une preuve : la bonne version." },
      wrongProofs: { who: "marie", fr: "Ça ne prouve pas le lieu. Qu'est-ce qui dit « Blanchard » ? Qu'est-ce qui dit « corrigé » ?" },
      success: { who: "marie", fr: "Deux preuves. C'est solide. Rendez-vous à 17 h, cour du Louvre." } },
    effects: { items: ["affiche_a", "affiche_b", "affiche_c"] },
    next: "SCENE_librairie" };

  N.L03 = { type: "choice", who: "lenoir", noDiag: true, stay: true,
    lines: [{ who: "lenoir", fr: "Vous cherchez un livre ? Ou un programme ?" }],
    choices: [
      { fr: "Pourquoi il y a deux Marcel ?", kind: "ok", reply: [{ who: "lenoir", fr: "Le Pain perdu, c'est le spectacle de la compagnie. Deux Marcel le jouent, à deux endroits : Blanchard et Duval." }], next: "L03" },
      { fr: "Le programme a changé ?", kind: "ok", reply: [{ who: "lenoir", fr: "Oui, deux fois aujourd'hui. Les livres restent, les programmes changent." }], next: "L03" },
      { fr: "Vous avez un message pour nous ?", kind: "ok", reply: [{ who: "lenoir", fr: "Un message ? Peut-être. Mais d'abord, vous pouvez m'aider ? Regardez la table." }], next: "END", unless: "L04_done", replyIf: [{ who: "lenoir", fr: "Oui ! Marcel a laissé une carte pour vous. Elle est sur la porte." }] },
      { fr: "Merci, au revoir.", kind: "ok", next: "END" }
    ] };

  N.L04 = { type: "task", diag: "D_L04", help: "L04", title: "Le bon tampon",
    task: { kind: "stamp", intro: "Je prépare une affiche pour la porte. Il faut le bon tampon. Le spectacle de Blanchard n'est plus place des Vosges, il est au Louvre.", who: "lenoir",
      stamps: [{ id: "ancien", label: "ANCIEN PROGRAMME" }, { id: "modif", label: "MODIFICATION" }, { id: "annule", label: "ANNULÉ" }],
      sheets: [
        { id: "C", label: "Copie de l'affiche C", text: "Marcel Blanchard — 17 h — cour du Louvre. Version corrigée." },
        { id: "A", label: "Copie de l'affiche A", text: "Marcel Blanchard — 17 h — place des Vosges. Première version." }
      ],
      goal: { sheet: "C", stamp: "modif" },
      bonus: { sheet: "A", stamp: "ancien" },
      replies: {
        "annule": "Le spectacle a lieu. C'est le lieu qui a changé.",
        "C:ancien": "Non, ça, c'est le nouveau programme !",
        "A:modif": "Hmm. La place des Vosges, c'est l'ancien lieu."
      } },
    effects: { flag: "L04_done" },
    after: [{ who: "lenoir", fr: "Parfait. Ah, j'oubliais : Marcel a laissé ça pour vous. Regardez sur la porte." }],
    next: "SCENE_librairie" };
  N.L04r = { type: "lines", lines: [{ who: "lenoir", fr: "L'affiche est sur la porte. Merci encore !" }] };

  N.L05 = { type: "doc", title: "La carte de Marcel", icon: "carte", doc: "J'ai pris le mauvais sac à Montmartre. Je suis désolé ! Je croyais que c'était mon sac. Je garde toutes les affaires ensemble. À 17 heures, je suis à mon spectacle. Demandez Marcel. Pour avoir le sac, dites-moi ce qu'il y a dedans. — Marcel",
    effects: { item: "carte_marcel", proof: "pf_carte_marcel", flag: "L05_done", mission: "Pour avoir le sac : dire ce qu'il y a dedans (Q4)." },
    lines: [
      { who: "marie", fr: "Mission : dire ce qu'il y a dans notre sac. Regarde le carnet, question 4." },
      { who: "leo", fr: "Une porte normale. Un tampon normal. Ce monsieur est dangereux.", de: "Eine normale Tür. Ein normaler Stempel. Dieser Mann ist gefährlich." }
    ] };

  /* Louvre */
  N.V00 = { type: "lines", once: "V00_seen", lines: [{ who: "narrateur", fr: "La cour du Louvre, 17 heures. Une petite scène, des lampes, du public." }] };
  N.V00s = { type: "lines", lines: [{ who: "narrateur", fr: "Une petite scène avec une Joconde en carton." }, { who: "leo", fr: "Même la Joconde est une copie, ici.", de: "Sogar die Mona Lisa ist hier eine Kopie." }] };
  N.V00m = { type: "lines", lines: [{ who: "marie", fr: "Parlons d'abord à l'assistante." }] };

  N.V01 = { type: "choice", who: "assistante", noDiag: true,
    lines: [{ who: "assistante", fr: "Bonsoir ! Ce soir, il y a cinq artistes dans la cour. Vous cherchez quel spectacle ? À quelle heure ?" }],
    choices: [
      { fr: "Le Pain perdu, à 17 heures.", kind: "ok", reply: [{ who: "assistante", fr: "Il y a deux Pain perdu ce soir, avec deux Marcel. Et le programme a changé plusieurs fois. Regardez le programme corrigé à la librairie Les Mots retrouvés." }, { who: "leo", fr: "Même la Joconde est une copie, ici.", de: "Sogar die Mona Lisa ist hier eine Kopie." }], next: "MAP" },
      { fr: "On cherche un mime avec notre sac.", kind: "ok", reply: [{ who: "assistante", fr: "Un mime ? Il y a trois mimes ce soir ! Revenez avec un nom et une heure." }, { who: "leo", fr: "Même la Joconde est une copie, ici.", de: "Sogar die Mona Lisa ist hier eine Kopie." }], next: "MAP" }
    ] };

  N.V02 = { type: "lines", lines: [
    { who: "assistante", fr: "Vous êtes les jeunes au sac Bernd ? Marcel vous attend après son numéro. Deux minutes." },
    { who: "narrateur", fr: "Marcel finit son numéro : un mur invisible, une porte invisible et... un pain invisible. Le public applaudit." }
  ], effects: { flag: "V02_done" }, next: "V02c" };
  N.V02c = { type: "choice", who: "assistante", noDiag: true,
    lines: [{ who: "assistante", fr: "En attendant, tu peux m'aider deux minutes ? C'est pour l'ombre sur l'écran." }],
    choices: [
      { fr: "Oui, bien sûr.", kind: "ok", next: "V02bs" },
      { fr: "Non, on attend Marcel.", kind: "ok", reply: [{ who: "assistante", fr: "Pas de problème. Il arrive." }], next: "V03" }
    ] };

  N.V03 = { type: "convo", who: "marcel", diag: "D_V03", help: "V03", title: "Le finale",
    steps: [
      { id: "s1", lines: [{ who: "marcel", fr: "Bonsoir. Vous... vous cherchez quelque chose ?" }],
        choices: [
          { fr: "Excusez-moi, je crois qu'on a échangé nos sacs.", kind: "ok" },
          { fr: "Excusez-moi, vous avez notre sac.", kind: "ok" },
          { fr: "Rendez-moi mon sac, voleur !", kind: "wrong", reply: [{ who: "marcel", fr: "Voleur ? Moi ?" }, { who: "marie", fr: "Leo ! On a des preuves : c'était une erreur." }], flag: "V03_voleur" },
          { fr: "Bonsoir, j'ai aimé votre spectacle.", kind: "repair", reply: [{ who: "marcel", fr: "Merci ! Mais... vous vouliez autre chose ?" }] }
        ], after: [{ who: "marcel", fr: "Nos sacs ? Ah... Racontez-moi." }] },
      { id: "s2", lines: [],
        choices: [
          { fr: "Pendant qu'on regardait la photo, vous avez pris le sac près de l'escalier. C'est notre sac.", kind: "ok" },
          { fr: "À Montmartre, vous avez pris notre sac.", kind: "ok" },
          { fr: "À Montmartre, vous preniez notre sac pendant qu'on a regardé la photo.", kind: "wrong", reply: [{ who: "marcel", fr: "Pendant que... quoi ?" }, { who: "marie", fr: "Le décor ou l'action ?" }] },
          { fr: "Vous avez volé notre sac à Montmartre.", kind: "wrong", reply: [{ who: "marcel", fr: "Volé ? Non !" }, { who: "marie", fr: "Leo..." }] }
        ], after: [{ who: "marcel", fr: "Le sac sur l'escalier ! Et moi, je croyais que vous aviez mon sac ! Mais attendez : il y a trois sacs bruns dans la compagnie. Qu'est-ce qu'il y a dans votre sac ?" }] },
      { id: "s3", pick: 2, lines: [],
        choices: [
          { fr: "Dans la poche de devant, il y a une boîte bleue avec le nom Kevin.", kind: "ok" },
          { fr: "L'enveloppe rouge est sous les billets de train.", kind: "ok" },
          { fr: "Il y a trois baguettes en plastique.", kind: "wrong", reply: [{ who: "marcel", fr: "Ça, c'est mon sac !" }] },
          { fr: "Il y a un gant blanc.", kind: "wrong", reply: [{ who: "marcel", fr: "Ça aussi, c'est mon sac." }] },
          { fr: "Il y a une bouteille de Vita Cola.", kind: "wrong", reply: [{ who: "marcel", fr: "Une... quoi ?" }, { who: "leo", fr: "Oublie.", de: "Vergiss es." }] }
        ], after: [
          { who: "marcel", fr: "C'est bien ça. Voici votre sac. Et je suis désolé !" },
          { who: "leo", fr: "Voici votre sac. On échange ?" },
          { who: "narrateur", fr: "Marcel cherche longtemps une fermeture éclair invisible... sur un vrai sac." },
          { who: "leo", fr: "Il cherche une fermeture éclair invisible. Sur un vrai sac.", de: "Er sucht einen unsichtbaren Reißverschluss. An einer echten Tasche." }
        ] }
    ],
    effects: { flag: "V03_done", removeItem: "sac_mime", item: "sac_bernd" },
    next: "V04" };
  N.V03r = { type: "lines", lines: [{ who: "marcel", fr: "Merci encore, et bonne soirée !" }] };

  N.V04 = { type: "cut", bg: "cut_final", lines: [
    { who: "marcel", fr: "Et moi, je croyais que vous aviez mon sac !" },
    { who: "leo", fr: "Moi aussi. Enfin... votre sac, mon sac... On a un problème avec les sacs." },
    { who: "narrateur", fr: "Monsieur Nowak arrive avec la classe. Kevin ouvre sa boîte bleue. Marie ouvre l'enveloppe rouge : « Plan B : rester calme et recompter. » Nowak compte : 31... 32. Il regarde Bernd." },
    { who: "leo", fr: "Il ne compte pas. Il juge.", de: "Er zählt nicht. Er beurteilt nur." },
    { who: "leo", fr: "Note pour moi : ne pas crier « voleur » sans preuves.", de: "Notiz an mich: nicht „Dieb“ rufen ohne Beweise.", onlyIf: "V03_voleur" }
  ], next: "V05" };

  N.V05 = { type: "task", diag: "D_V05", help: "V05", perPlayer: true, title: "Rapport final",
    task: { kind: "write", intro: "Raconte l'affaire en 6 à 8 phrases : Où étiez-vous ? Qu'est-ce que le mime a fait ? Quel indice a changé votre idée ? Comment avez-vous récupéré le sac ?", min: 50,
      starters: ["On était à Montmartre.", "Leo tenait...", "Pendant que..., le mime a pris...", "Au Père-Lachaise, on a appris...", "Marcel avait déjà...", "Il croyait que...", "À la fin, on a échangé..."],
      model: "On était à Montmartre pour une photo. Leo tenait le sac Bernd. Pendant que nous regardions la photo, le mime a pris notre sac. Au Père-Lachaise, on a appris son nom : Marcel Blanchard. Sur une photo, Marcel avait déjà son sac brun. Donc ce n'était pas un vol. Il croyait que notre sac était son sac. À la librairie, on a trouvé le bon programme. À la fin, on a échangé les sacs au Louvre." },
    effects: { flag: "V05_done" },
    next: "V06" };

  N.V06 = { type: "end" };

  /* ---------- Phase 2 ---------- */
  N.P07 = { type: "choice", who: "gardien", diag: "D_P07", count: true,
    lines: [{ who: "gardien", fr: "Vous pouvez aider Gaston ? Donnez-lui la balle qui est sous le banc, pas la balle dans mon panier." }],
    choices: [
      { fr: "Donner la balle qui est sous le banc.", kind: "ok", reply: [
        { who: "narrateur", fr: "Gaston prend la balle et se place... exactement devant la caméra." },
        { who: "leo", fr: "Très professionnel. On ne voit plus rien.", de: "Sehr professionell. Man sieht nichts mehr." }], next: "END" },
      { fr: "Donner la balle qui est dans le panier.", kind: "wrong", reply: [{ who: "gardien", fr: "Non, pas cette balle ! Elle est pour demain." }], next: "P07" }
    ],
    effects: { flag: "P07_done" } };
  N.P07r = { type: "lines", lines: [{ who: "narrateur", fr: "Gaston dort. Devant la caméra." }] };

  N.X01 = { type: "lines", lines: [
    { who: "musicien", fr: "Marcel ? Il n'est plus ici. Le programme a changé. Regardez la nouvelle version à la librairie." },
    { who: "musicien", fr: "Maintenant, c'est au Louvre, à 17 heures.", onlyIf: "L04_done" }
  ], next: "X01t" };
  N.X01t = { type: "task", diag: "D_X01", title: "Place des Vosges",
    task: { kind: "pick", intro: "Le musicien : « Marcel ? Il n'est plus ici. Le programme a changé. »", question: "La place des Vosges, c'est...", n: 1,
      options: [{ id: "a", label: "l'ancien lieu", ok: true }, { id: "n", label: "le nouveau lieu", ok: false }],
      wrong: { who: "marie", fr: "Relis : « Il n'est plus ici. » Alors, ancien ou nouveau ?" } },
    effects: { flag: "X01_done" },
    after: [{ who: "leo", fr: "Une belle place. Zéro mime.", de: "Ein schöner Platz. Null Pantomime." }],
    next: "MAP" };

  N.C02 = { type: "lines", lines: [
    { who: "employee", fr: "Les Catacombes ? L'entrée est ici. Mais le rendez-vous de la compagnie, c'est demain, pas aujourd'hui. Vous avez lu la carte ?" }
  ], next: [{ if: "C02_done", node: "C02c" }, { node: "C02t" }] };
  N.C02t = { type: "task", diag: "D_C02", title: "Les Catacombes",
    task: { kind: "pick", intro: "La carte : « Demain, 11 h : rendez-vous devant l'entrée des Catacombes. »", question: "Le rendez-vous est...", n: 1,
      options: [{ id: "auj", label: "aujourd'hui", ok: false }, { id: "dem", label: "demain", ok: true }, { id: "soir", label: "ce soir", ok: false }],
      wrong: { who: "marie", fr: "Relis la carte. Quel jour ?" } },
    effects: { flag: "C02_done" },
    after: [
      { who: "marie", fr: "Demain. Pas aujourd'hui. On a perdu dix minutes, pas plus." },
      { who: "leo", fr: "Des os et des touristes. Pas de pain.", de: "Knochen und Touristen. Kein Brot." }
    ],
    next: "C02c" };
  N.C02c = { type: "choice", who: "marie", noDiag: true,
    lines: [{ who: "marie", fr: "Le numéro de Chloé est sur la carte. On l'appelle ?" }],
    choices: [
      { fr: "Appeler Chloé.", kind: "ok", next: "C03s" },
      { fr: "Retour à la carte.", kind: "ok", next: "MAP" }
    ] };

  N.C03s = { type: "scene", scene: "repetition", next: "C03" };
  N.C03 = { type: "audio", audio: "au_chloe", next: "C03t" };
  N.C03t = { type: "task", diag: "D_C03", audio: "au_chloe", title: "La répétition de Chloé",
    task: { kind: "gap", intro: "Qu'est-ce que Chloé dit ? Complète.",
      parts: ["On ne doit pas prendre ", { id: "q1", opts: ["les vieux panneaux", "les crânes", "le nouveau panneau"], answer: "les vieux panneaux" }, ". Les crânes sont ", { id: "q2", opts: ["en carton", "vrais", "en plastique"], answer: "en carton" }, ". Marcel doit apporter ", { id: "q3", opts: ["son sac brun", "les crânes", "un pain"], answer: "son sac brun" }, "."],
      wrong: { who: "marie", fr: "Écoute encore. Qu'est-ce qu'elle dit vraiment ?" } },
    effects: { proof: "pf_chloe_sac", flag: "C03_done" },
    after: [{ who: "marie", fr: "Le sac brun avec la fermeture rouge et l'autocollant jaune est à Marcel. Encore une preuve." }],
    next: "MAP" };

  N.V02bs = { type: "scene", scene: "lampes", next: "V02b" };
  N.V02b = { type: "audio", audio: "au_assistante", next: "V02bt" };
  N.V02bt = { type: "task", diag: "D_V02b", audio: "au_assistante", title: "L'ombre sur l'écran",
    task: { kind: "gap", intro: "Place les objets comme l'assistante le dit.",
      parts: ["Le miroir est ", { id: "m", opts: ["à gauche", "à droite"], answer: "à droite" }, " de la boîte. La baguette est ", { id: "b", opts: ["devant", "derrière"], answer: "derrière" }, " la lampe. La lampe rouge est ", { id: "r", opts: ["allumée", "éteinte"], answer: "éteinte" }, ". La lampe bleue est ", { id: "bl", opts: ["allumée", "éteinte"], answer: "allumée" }, "."],
      wrong: { who: "assistante", fr: "Hmm, l'ombre est bizarre. Écoute encore." } },
    effects: { flag: "V02b_done" },
    after: [
      { who: "narrateur", fr: "Sur l'écran : une ombre énorme. Un pain. Bernd." },
      { who: "leo", fr: "Enfin. Bernd est une star.", de: "Endlich. Bernd ist ein Star." }
    ],
    next: "V02bb" };
  N.V02bb = { type: "scene", scene: "louvre", next: "V03" };

  G.nodes = N;

  /* ---------- Abspann (Namen trägt die Lehrkraft ein) ---------- */
  G.credits = {
    title: "L'affaire du pain perdu — une enquête de la 10b.",
    lines: ["Textes et jeu : …", "Illustrations : …", "Voix : …", "Bêta-testeurs : …"]
  };

  /* ---------- Maries Hilfestufen ---------- */
  G.help = {
    M02: ["Qui peut nous aider ? Et pour quelle question ?", { fr: "Regarde : la carte et le ticket, à côté des quatre questions.", action: "material" }, "La carte parle d'une personne, Chloé. Le ticket parle de Nora et du spectacle.", "Die Karte nennt eine Person: Frage 1. Der Bon nennt Nora und das Stück: Frage 2."],
    M03: ["Tu veux parler de maintenant, de plus tard ou de tout à l'heure ?", { fr: "Regarde les verbes : avez vu, cherchez, allez voir.", action: "material" }, "« Vous avez vu », c'est le passé. C'est ce qu'on veut savoir.", "Wir wollen wissen, ob sie ihn gesehen hat: eine Frage in der Vergangenheit."],
    M04: ["Elle parle de trois moments : ce matin, cet après-midi, ce soir.", { fr: "Écoute encore. Je te repasse la dame du kiosque.", action: "replay" }, { fr: "Voici la transcription. Regarde les moments.", action: "transcript" }, "Heute Morgen Père-Lachaise, heute Nachmittag Marais, heute Abend unbekannt."],
    M04b: ["C'est le décor ou l'action ?", { fr: "Écoute encore la dame du kiosque.", action: "replay" }, "Le décor, c'est l'imparfait : il portait. L'action, c'est le passé composé : il a pris.", "Hintergrund und Zustand: imparfait. Ereignis: passé composé."],
    P02: ["Montre-lui la photo.", { fr: "Dans l'inventaire : la photo de groupe.", action: "material" }, "Tu peux dire : Vous avez vu ce mime ?", "Zeig ihm das Gruppenfoto und frag, ob er den Pantomimen gesehen hat."],
    P04: ["Tout droit, puis... à gauche ou à droite ? Écoute encore.", { fr: "Écoute encore le gardien.", action: "replay" }, { fr: "Voici la transcription : tout droit, à gauche, ne prenez pas.", action: "transcript" }, "Geradeaus bis zur Kreuzung, dann links. Nicht den Weg, der bergab führt."],
    P06: ["Regarde bien le sac sur la photo. Qu'est-ce que tu vois ?", { fr: "Zoom sur le sac : la fermeture et l'autocollant.", action: "material" }, "La légende dit : fermeture rouge, autocollant jaune.", "Roter Reißverschluss und gelber Aufkleber: auf dem Foto und an der Tasche."],
    B02: ["Leo, on ne cherche pas un dessert. Qu'est-ce qu'on cherche ?", { fr: "Regarde le flyer : Le Pain perdu, c'est un spectacle.", action: "material" }, "Dis-lui : Je cherche un sac... ou Je cherche le spectacle...", "Sag ihr, was ihr sucht: die Tasche oder die Aufführung, nicht das Gericht."],
    B04: ["Écoute encore. Qu'est-ce qu'il dit vraiment ?", { fr: "Écoute encore le message de Marcel.", action: "replay" }, { fr: "Voici la transcription : j'ai trouvé, je crois que, le programme a changé.", action: "transcript" }, "Sicher ist nur, was er wörtlich sagt. Was er will oder wo er ist, sagt er nicht."],
    B05: ["De quoi parle Kevin ?", { fr: "Relis : la boîte bleue.", action: "material" }, "La boîte est dans notre sac. Donc : question 4.", "Kevin beschreibt den Inhalt eures Rucksacks: Frage 4."],
    B06: ["Trois choses : ce qui s'est passé, pourquoi, où on va.", { fr: "Regarde les débuts de phrases.", action: "material" }, "Tu peux commencer : Le mime avait un sac brun, comme nous.", "Was passiert ist (Hintergrund im imparfait, Handlung im passé composé) und wohin ihr geht."],
    L02: ["Trois critères : le nom, le spectacle, la version.", { fr: "Regarde tes preuves Q1 et Q2 dans le carnet.", action: "material" }, "Blanchard + Version corrigée = une seule affiche.", "Richtiger Nachname und „Version corrigée“ treffen nur auf einen Aushang zu."],
    L04: ["Le spectacle a lieu ? Oui. Le lieu a changé ? Oui. Alors ?", { fr: "Les trois tampons : ancien = vieux, modification = changement, annulé = pas de spectacle.", action: "material" }, "Changé = modification. Annulé = pas de spectacle.", "Verlegt heißt „modification“, nicht „annulé“ (abgesagt)."],
    V03: ["Trois étapes : dire bonjour et le problème, expliquer, prouver.", { fr: "Regarde le carnet, question 4.", action: "material" }, "Excusez-moi, je crois que... / Pendant qu'on..., vous avez... / Dans la poche de devant, il y a...", "Höflich anfangen, erklären, was passiert ist, dann den Inhalt nennen."],
    V05: ["Raconte dans l'ordre : Montmartre, les indices, la fin.", { fr: "Regarde les débuts de phrases.", action: "material" }, "On était à Montmartre pour une photo. Leo tenait le sac Bernd.", "Ausgangslage im imparfait, Handlung im passé composé, der entscheidende Hinweis, die Rückgabe."]
  };

  /* ---------- Diagnose: Beschreibungen ---------- */
  G.diag = {
    D_M02: "Dokumente den Fragen zuordnen", D_M03: "Passende Frage an die Zeugin", D_M04: "Zeitangaben der Zeugin", D_M04b: "Rapport de témoin, vier Formen",
    D_M06: "Sackgasse Métro", D_P02: "Weg zum Wärter", D_P03: "Name ins Carnet", D_P04: "Wegbeschreibung auf dem Plan", D_P05: "Gespräch mit Chloé", D_P06: "Zwei Merkmale vergleichen",
    D_B01: "Flyer gelesen", D_B02: "Gesprächsweg bei Nora", D_B02b: "Rucksack beschreiben", D_B04: "Drei gesicherte Aussagen", D_B05: "SMS zu Q4", D_B06: "Nachricht an Nowak",
    D_L02: "Aushang C mit zwei Belegen", D_L04: "Stempel", D_V03: "Finale in drei Schritten", D_V05: "Rapport final",
    D_P07: "Gaston und der Ball", D_X01: "Place des Vosges: alter oder neuer Ort", D_C02: "Catacombes: heute oder morgen", D_C03: "Chloés Probe", D_V02b: "Brotschatten"
  };

  /* ---------- Glossar ---------- */
  G.glossary = [
    ["le sac", "die Tasche, der Rucksack"], ["le mime", "der Pantomime"], ["le kiosque", "der Kiosk"], ["l'escalier (m)", "die Treppe"],
    ["le ticket de caisse", "der Kassenbon"], ["la boulangerie, la boulangère", "die Bäckerei, die Bäckerin"], ["le spectacle", "die Aufführung, die Show"],
    ["le programme", "das Programm"], ["corrigé, corrigée", "korrigiert"], ["ancien, ancienne", "alt, früher"], ["la première version", "die erste Fassung"],
    ["l'affiche (f)", "das Plakat, der Aushang"], ["le tampon", "der Stempel"], ["annulé", "abgesagt"], ["la modification", "die Änderung"],
    ["le lieu, avoir lieu", "der Ort, stattfinden"], ["remplacer", "ersetzen"], ["la fermeture (éclair)", "der Reißverschluss"], ["l'autocollant (m)", "der Aufkleber"],
    ["la poche de devant", "die Vordertasche"], ["l'enveloppe (f)", "der Umschlag"], ["la boîte", "die Dose, die Schachtel"], ["l'appareil dentaire (m)", "die Zahnspange"],
    ["les billets de train", "die Zugfahrkarten"], ["le gardien", "der Wärter, der Aufseher"], ["le cimetière", "der Friedhof"], ["la tombe", "das Grab"],
    ["le carrefour", "die Kreuzung"], ["le banc", "die Bank (zum Sitzen)"], ["le chemin", "der Weg"], ["la sortie", "der Ausgang"], ["descendre", "hinuntergehen"],
    ["tout droit", "geradeaus"], ["tourner à gauche", "links abbiegen"], ["le témoin", "der Zeuge, die Zeugin"], ["le rapport", "der Bericht"], ["l'indice (m)", "der Hinweis"],
    ["la preuve", "der Beweis"], ["le voleur, voler", "der Dieb, stehlen"], ["l'erreur (f), par erreur", "der Irrtum, aus Versehen"], ["le mauvais sac", "die falsche Tasche"],
    ["pressé, pressée", "in Eile"], ["échanger", "tauschen"], ["la compagnie", "die Theatergruppe"], ["la répétition, répéter", "die Probe, proben"], ["le décor", "die Kulisse"],
    ["le crâne", "der Schädel"], ["en carton", "aus Pappe"], ["le panneau", "das Schild"], ["le pain perdu", "Arme Ritter (Süßspeise)"], ["mouillé", "nass"], ["le gant", "der Handschuh"],
    ["rayé", "gestreift"], ["le béret", "die Baskenmütze"], ["tenir", "halten"], ["apporter", "mitbringen"], ["laisser un message", "eine Nachricht hinterlassen"],
    ["les affaires (f)", "die Sachen"], ["dedans", "darin, drinnen"], ["là-bas", "dort"], ["ressembler à", "aussehen wie"], ["la cour", "der Hof"], ["l'entrée (f)", "der Eingang"],
    ["le rendez-vous", "das Treffen, die Verabredung"], ["avoir l'air inquiet", "besorgt aussehen"], ["le numéro", "die Nummer (der Auftritt)"], ["le public", "das Publikum"],
    ["l'ombre (f)", "der Schatten"], ["allumer", "anschalten"], ["le miroir", "der Spiegel"]
  ];

  return G;
})();
