const { chromium } = require('playwright');
/* Test gegen Sackgassen und Abkürzungen: Stellen, an denen man das Spiel früher festfahren oder Pflichtschritte überspringen
   konnte, weil man mitten im Nachspann einer Aufgabe oder mitten in einem Gespräch einen Hotspot oder die Karte antippte.
   Teil 1 (französisch und deutsch), Teil 2 und Teil 3. Dazu die freien Stationen (Teil 2 und 3): ein angefangener Abschnitt
   geht vor, Unterbrechen über die Karte, Neuladen in der freien Station, ältere Spielstände mitten in einer früheren Kette. Voraussetzungen wie bei den anderen Tests (lokaler Server auf Port 8765).
   Aufruf: node tools/sackgassen.js   (Umgebung: URL=... bis einschließlich des Hauptordners, CHROMIUM=Pfad, optional) */
const BASE = process.env.URL || 'http://127.0.0.1:8765/';
let fails = 0;
const check = (ok, what) => { console.log((ok ? 'ok    ' : 'FEHLER ') + what); if (!ok) fails++; };

(async () => {
  const browser = await chromium.launch(Object.assign({ headless: true }, process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}));
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const norm = s => s.replace(/\s+/g, ' ');
  const dlgText = async () => norm(await page.locator('#dialogue').innerText());
  const modalText = async () => norm(await page.locator('#modal-body').innerText());
  const modalOpen = () => page.locator('#modal').isVisible();
  const toasts = async () => norm(await page.locator('#toasts').innerText());
  const node = () => page.evaluate(() => PP.S.resume);
  async function start(url) {
    await page.goto(url); await page.evaluate(() => localStorage.clear()); await page.goto(url);
    await page.fill('#p1', 'Test'); await page.locator('#btn-start').click(); await page.waitForTimeout(300);
  }
  /* Spielstand setzen, in die Szene, optional einen Knoten starten */
  const setup = (flags, scene, id) => page.evaluate(([flags, scene, id]) => {
    const S = PP.S; flags.forEach(f => { S.flags[f] = true; }); if (S.at) S.at = {}; PP.save();
    document.getElementById('modal').hidden = true; document.getElementById('dialogue').classList.remove('muted');
    PP.enterScene(scene, false); if (id) PP.goNode(id);
  }, [flags, scene, id]).then(() => page.waitForTimeout(300));
  async function click(sel, text) { await page.locator(sel, { hasText: text }).filter({ visible: true }).first().click(); await page.waitForTimeout(150); }
  async function cont(label, max = 8) {
    for (let i = 0; i < max; i++) {
      const b = page.locator(((await modalOpen()) ? '#modal-body' : '#dialogue') + ' button', { hasText: label }).filter({ visible: true });
      if (!(await b.count()) || !(await b.first().isEnabled())) return;
      await b.first().click(); await page.waitForTimeout(150);
    }
  }
  /* Im Nachspann: Hotspot und Karte bleiben zu, die Hilfefigur sagt warum */
  async function blocked(hotspot, what) {
    await page.locator('#toasts').evaluate(t => { t.innerHTML = ''; });
    await page.locator('.hotspot', { hasText: hotspot }).first().click(); await page.waitForTimeout(150);
    const menu = await page.locator('.verbs').count();
    await page.locator('#btn-map').click(); await page.waitForTimeout(150);
    check(!menu && !(await modalOpen()) && /d'abord|erst zu Ende/.test(await toasts()), what + ': Hotspot und Karte bleiben im Nachspann zu (' + (await toasts()) + ')');
  }
  async function use(hotspot) { await page.locator('.hotspot', { hasText: hotspot }).first().click(); await page.locator('.verbs .verb').first().click(); await page.waitForTimeout(250); }
  /* Freie Stationen: Hotspot antippen, obwohl gerade ein Abschnitt läuft; Spielstand ändern, neu laden, weiterspielen */
  async function tryUse(hotspot) { await page.locator('#toasts').evaluate(t => { t.innerHTML = ''; }); await use(hotspot); }
  const idleHelp = async () => { await page.waitForTimeout(600); return (await page.locator('#dialogue.idle .btn.aide').count()) === 1; };
  async function reloadWith(change) {
    await page.evaluate(ch => { const S = JSON.parse(JSON.stringify(PP.S)); Object.assign(S, ch); localStorage.setItem(PP.saveKey, JSON.stringify(S)); }, change);
    await page.reload(); await page.waitForTimeout(300);
    await page.locator('#btn-resume').click(); await page.waitForTimeout(400);
  }
  async function travelTo(name) {
    await page.locator('#btn-map').click(); await page.waitForTimeout(200);
    await page.locator('.modal.map g.place', { hasText: name }).first().click(); await page.waitForTimeout(1200);
  }

  /* ===== Teil 1: Finale V03q, französisch und deutsch ===== */
  const T1 = ['M00_done', 'M02_done', 'M03_done', 'M04b_done', 'P02_done', 'P03_done', 'P04_done', 'P05_done', 'P06_done', 'B03_open', 'B04_done', 'B05_done', 'B06_done', 'L02q_done', 'L02_done', 'L04_done', 'L05_done', 'V01q_done', 'V02_done', 'V03_talked'];
  for (const L of [{ dir: '', cont: 'Continuer', check: 'Vérifier', vals: ['devant', 'bleue', 'Kevin', 'rouge', 'billets'], scene: 'la scène', chloeNew: "Oui, c'est Chloé", chloeMet: "Ah, c'est vous" },
                   { dir: 'de/', cont: 'Weiter', check: 'Prüfen', vals: ['Vordertasche', 'blau', 'Kevin', 'rot', 'Fahrkarten'], scene: 'Bühne', chloeNew: 'Ja, hier ist Chloé', chloeMet: "Ach, ihr seid's" }]) {
    const tag = 'Teil 1' + (L.dir ? ' deutsch' : '');
    await start(BASE + L.dir + 'index.html?intro=0&test=1');
    await setup(T1, 'louvre', 'V03q');
    const ins = page.locator('#modal-body input.rin');
    for (let i = 0; i < L.vals.length; i++) await ins.nth(i).fill(L.vals[i]);
    await click('#modal-body button', L.check); await cont(L.cont, 1);
    await blocked(L.scene, tag + ', nach V03q');
    await cont(L.cont, 4);
    check(await node() === 'V05', tag + ': nach dem Nachspann von V03q folgt der Rapport V05, die Schlussszene V04 kommt danach (' + await node() + ')');
    /* alter Spielstand, der schon festsaß: Marcel führt jetzt zum Rapport */
    await page.evaluate(() => { PP.S.resume = null; PP.save(); });
    await setup([], 'louvre', null);
    await use('Marcel');
    check(await node() === 'V05', tag + ': festgefahrener Stand (V03_done ohne Rapport): Marcel führt zu V05 (' + await node() + ')');
    /* Chloé am Telefon: Wer sie am Père-Lachaise noch nicht getroffen hat, hört kein « Ah, c'est vous ! » */
    for (const met of [false, true]) {
      await page.evaluate(() => { PP.S.resume = null; delete PP.S.flags.P05_done; PP.save(); });
      await setup(['C01_found', 'C02_done'].concat(met ? ['P05_done'] : []), 'catacombes', 'C02n');
      await page.locator('#modal-body input.rin').first().fill('06 12 34 56 78');
      await click('#modal-body button', L.check);
      const fb = norm(await page.locator('#modal-body .feedback').last().innerText());
      const want = met ? L.chloeMet : L.chloeNew, not = met ? L.chloeNew : L.chloeMet;
      check(fb.includes(want) && !fb.includes(not), tag + ': Chloé am Telefon ' + (met ? 'nach' : 'vor') + ' dem Treffen am Père-Lachaise (' + fb.slice(0, 70) + ')');
    }
  }

  /* ===== Teil 1: Nachricht von Marcel (B04) und Wiederholungen ===== */
  await start(BASE + 'index.html?intro=0&test=1');
  await setup(['M00_done', 'M02_done', 'M03_done', 'M04b_done', 'B01a_done', 'B03_open'], 'marais', 'B04');
  for (const o of ['Marcel a trouvé des affaires', "Il pense qu'il a pris", 'Le programme de son spectacle']) await click('#modal-body button', o);
  await click('#modal-body button', 'Valider'); await cont('Continuer', 1);
  await blocked('la porte de la librairie', 'Teil 1, nach B04');
  await cont('Continuer', 3);
  check(await node() === 'B05' && (await modalText()).includes('Kevin'), 'Teil 1: nach B04 kommt Kevins SMS (B05), die Buchhandlung lässt sich nicht vorher erreichen (' + await node() + ')');
  await setup(['B05_done', 'B06_done', 'P02_done', 'P03_done', 'P04_done', 'P05_done', 'P06_done'], 'marais', null);
  await use('le téléphone de Nora');
  check(await node() === 'B03r', 'Teil 1: Noras Telefon nach B06 spielt nur die Nachricht (' + await node() + ')');
  await page.evaluate(() => { document.getElementById('modal').hidden = true; PP.S.resume = null; PP.save(); });
  await setup([], 'pere_lachaise', null);
  await use('le plan');
  check(await node() === 'P04r', 'Teil 1: der Plan nach P04 startet die Wegaufgabe nicht neu (' + await node() + ')');
  await cont('Continuer', 2);
  await use('le banc rouge');
  check(await node() === 'P06c', 'Teil 1: die Bank nach P06 führt direkt zu Chloés Angebot (' + await node() + ')');
  await cont('Continuer', 1); await click('#dialogue .choice', 'Plus tard'); await cont('Continuer', 2);
  await setup(['C03_done'], 'pere_lachaise', null);
  await use('le banc rouge');
  check(await node() === 'P05r', 'Teil 1: nach der Probe sagt Chloé nur noch etwas (' + await node() + ')');

  /* ===== Teil 2: die Fiche enthält, was R1 und die Hilfe in F01 dort suchen lassen ===== */
  await start(BASE + 'guide-fantome/index.html?test=1');
  const fiche = await page.evaluate(() => window.GAME.items.fiche.desc);
  check(fiche.includes('midi moins le quart') && fiche.includes('moustache grise'), 'Teil 2: die Fiche de signalement nennt die Uhrzeit und die Merkmale (F01)');
  /* Das Carnet verrät die Antworten der Abfragen R2, R3, R3b und R5 erst, wenn sie beantwortet sind */
  const carnet = async flags => { await page.evaluate(fl => { fl.forEach(f => { PP.S.flags[f] = true; }); PP.save(); PP.openCarnet(); }, flags); await page.waitForTimeout(150); return modalText(); };
  const before = await carnet(['N08_done', 'badge_faux', 'E03_done', 'N06_done', 'G06_done', 'G05_done', 'E04_done', 'R2_done']);
  check(['Lucien', 'bons de réduction', 'rendre le manteau'].every(w => !before.includes(w)) && (before.match(/réglé/g) || []).length >= 3,
    'Teil 2: Q1 bis Q3 sind geklärt, das Carnet zeigt ihre Antworten aber noch nicht vor R3, R3b und R5');
  const after = await carnet(['R3_done', 'R3b_done', 'R5_done']);
  check(['Lucien', 'bons de réduction', 'rendre le manteau'].every(w => after.includes(w)), 'Teil 2: nach den Abfragen stehen die Antworten im Carnet');

  /* Teil 2: R1 kommt jetzt vor der Fiche. Wer die Uhrzeit vergessen hat, hört sie bei der Klasse (Kevin) */
  const linesOf = async (n = 6) => {
    let t = '';
    for (let i = 0; i < n; i++) {
      t += ' ' + await dlgText();
      const b = page.locator('#dialogue button', { hasText: 'Continuer' }).filter({ visible: true });
      if (!(await b.count())) break;
      await b.first().click(); await page.waitForTimeout(150);
    }
    return t;
  };
  await start(BASE + 'guide-fantome/index.html?test=1');
  await setup(['N08_done'], 'notredame', 'Ncl');
  check((await linesOf()).includes('midi moins le quart'), 'Teil 2: vor R1 nennt Lino bei der Klasse die Uhrzeit (Kevin hat auf die Uhr geschaut)');
  await setup(['R1_done'], 'notredame', 'Ncl');
  check(!(await linesOf()).includes('midi moins le quart'), 'Teil 2: nach R1 sagt Lino das bei der Klasse nicht mehr');
  /* Die Personenbeschreibung kommt nach der ersten Station, egal welche: hier die Bouquinisten */
  await setup(['B05_done', 'R4_done', 'B06_done'], 'bouquinistes', 'B06e');
  await cont('Continuer', 8);
  check(await node() === 'N04b', 'Teil 2: nach den Bouquinisten als erster Station fragt M. Nowak nach der Beschreibung, das Selfie folgt (' + await node() + ')');
  /* und falls sie dort fehlt (alter Spielstand), meldet sich M. Nowak im leeren Dialogfeld */
  await page.evaluate(() => { PP.S.resume = null; PP.save(); });
  await setup([], 'lafayette', null); await page.waitForTimeout(600);
  check((await dlgText()).includes('description de M. Beaumont'), 'Teil 2: erste Station ohne Beschreibung: M. Nowak fragt im leeren Dialogfeld (' + (await dlgText()).slice(0, 60) + ')');
  await click('#dialogue button', 'Répondre');
  check(await node() === 'N04b', 'Teil 2: « Répondre » führt zum Selfie (' + await node() + ')');
  /* Finale: R5 erst nach F03. Wer « Revenir plus tard » wählt, bleibt am Schalter, und der Sicherheitsmann fragt noch einmal */
  await page.evaluate(() => { PP.S.resume = null; PP.save(); });
  await setup(['N07_done', 'R2_done', 'R3_done', 'R3b_done', 'F00_done', 'F03_done'], 'retours', 'R5');
  await click('#modal-body button', 'Revenir plus tard'); await cont('Continuer', 2);
  await page.locator('#toasts').evaluate(t => { t.innerHTML = ''; });
  await page.locator('#btn-map').click(); await page.waitForTimeout(700);
  check(!(await page.locator('.modal.map').isVisible()) && /finit l'enquête/.test(await toasts()), 'Teil 2: im Finale bleibt die Karte zu (' + await toasts() + ')');
  check((await dlgText()).includes('Cette carte'), 'Teil 2: nach « Revenir plus tard » fragt der Sicherheitsmann wieder nach der Karte (' + (await dlgText()).slice(0, 60) + ')');
  await click('#dialogue button', 'Répondre');
  check(await node() === 'R5', 'Teil 2: « Répondre » führt zurück zu R5 (' + await node() + ')');
  /* Schlussbild für alle: ohne Bouquinisten mit der Überleitung nach Notre-Dame */
  for (const withB of [false, true]) {
    await page.evaluate(b => { PP.S.resume = null; if (b) PP.S.flags.B_done = true; else delete PP.S.flags.B_done; PP.save(); }, withB);
    await setup(['F09_done'], 'retours', 'Z03');
    const z = await modalText();
    check(z.includes('Plus tard, devant Notre-Dame') === !withB, 'Teil 2: Schlussbild Z03 ' + (withB ? 'nach den Bouquinisten ohne die' : 'ohne Bouquinisten mit der') + ' Überleitung « Plus tard, devant Notre-Dame » (' + z.slice(0, 50) + ')');
  }

  /* ===== Teil 3: P02 unterbrechen, O06 und I02 im Nachspann ===== */
  await start(BASE + 'voyageur/index.html?test=1&listen=1');
  const T3 = ['O01_done', 'O02_done', 'O04_done', 'O06_done', 'R1_done'];
  await setup(T3, 'pont', 'P02');
  await cont('Continuer', 3);
  await click('#dialogue .choice', 'connaît cette baguette');
  await page.locator('#btn-map').click(); await page.waitForTimeout(200);
  check(await page.locator('.modal.map').isVisible(), 'Teil 3: in der Antwort von P02 geht die Karte noch auf (Ausgangslage)');
  await page.locator('.modal.map g.place', { hasText: 'Invalides' }).first().click(); await page.waitForTimeout(1200);
  await cont('Continuer', 10);   // durch den Auftakt der Invalides bis zu Marcels Zeilen (ohne Fenster)
  await page.locator('#btn-map').click(); await page.waitForTimeout(200);
  await page.locator('.modal.map g.place', { hasText: 'Pont' }).first().click(); await page.waitForTimeout(1200);
  await cont('Continuer', 8);   // Sätze unterwegs, dann P02 noch einmal
  await click('#dialogue .choice', 'pris la photo');
  await cont('Continuer', 2);
  check(await node() !== 'P02b' && !(await dlgText()).includes('Et encore une question'), 'Teil 3: nach der Unterbrechung und der anderen Frage geht es nach P02 weiter statt ohne Knopf (' + await node() + ')');

  await setup(['O01_done', 'O02_done', 'O04_done'], 'orsay', 'O06');
  for (const [card, col] of [['Le bâtiment existait', 'dit oui'], ['déjà un musée', 'dit non'], ['légende de la photo A', 'dit non'], ['photo A en 2025', 'ne dit rien'], ['Toutes les photos', 'ne dit rien']]) {
    const sel = page.locator('#modal-body *:has(> select)').filter({ hasText: card }).first().locator('select');
    await sel.selectOption({ label: (await sel.locator('option').allInnerTexts()).find(t => t.includes(col)) });
  }
  await click('#modal-body button', 'Valider'); await cont('Continuer', 1);
  await blocked('le vendeur', 'Teil 3, nach O06');
  await cont('Continuer', 2);
  check(await node() === 'R1', 'Teil 3: nach dem Nachspann von O06 kommt R1, O06 beginnt nicht neu (' + await node() + ')');

  /* Teil 3, Fassung 1.2: P01b, R3, F03b und R4 gibt es nicht mehr. Ältere Spielstände, die dort stehen, laufen weiter */
  for (const [id, scene, clicks, next] of [['P01b', 'pont', 1, 'P02'], ['R3', 'stand6', 1, 'W1'], ['F03b', 'finale', 4, 'F04l'], ['R4', 'finale', 1, 'W2']]) {
    await page.evaluate(() => { PP.S.resume = null; PP.save(); });
    await setup(['C02_done', 'F_started', 'F03_done'], scene, id);
    await cont('Continuer', clicks);
    check(await node() === next, 'Teil 3: alter Spielstand bei ' + id + ' geht weiter zu ' + next + ' (' + await node() + ')');
  }

  /* ===== Teil 2, Version 2.2: freie Stationen ===== */
  await start(BASE + 'guide-fantome/index.html?test=1');
  const T2 = ['N04_done', 'N04a_done', 'N05_done', 'badge_faux', 'N06_done', 'N08_done', 'R1_done'];
  /* Notre-Dame in der anderen Reihenfolge als im Durchlauf: erst die Klasse (hier als Flag), dann M. Nowak; danach von allein N08 */
  await setup(['N04_done', 'N04a_done', 'N06_done'], 'notredame', null);
  check(await idleHelp() && (await page.locator('.hotspot.done', { hasText: 'la classe' }).count()) === 1, 'Teil 2: Notre-Dame frei, Häkchen bei der Klasse, Szenenhilfe im leeren Dialogfeld');
  await use('M. Nowak'); await cont('Continuer', 3);
  await click('#modal-body button', '31 février'); await cont('Continuer', 3);
  check(await node() === 'N08', 'Teil 2: Klasse zuerst, dann der Ausweis: danach kommt von allein N08 (' + await node() + ')');
  /* Bouquinistes: das Papier angefangen, Unterbrechen über die Karte, zurück: es geht beim Papier weiter */
  await page.evaluate(() => { PP.S.resume = null; PP.save(); });
  await setup(T2.concat(['B_arr', 'B02_done']), 'bouquinistes', null);
  check(await idleHelp(), 'Teil 2: Bouquinistes frei nach der Bouquiniste, die Szenenhilfe steht im leeren Dialogfeld');
  await use('les boîtes vertes');
  await tryUse('le vieux livre');
  check(await node() === 'B05p' && /on finit ça/.test(await toasts()), 'Teil 2: Papier angefangen: das alte Buch führt nicht vorbei (' + await node() + ' · ' + await toasts() + ')');
  /* wie eine Fahrt über die Karte (die Métro-Frage unterwegs lässt der Test aus) */
  await page.evaluate(() => PP.enterScene('eiffel', true)); await page.waitForTimeout(300); await cont('Continuer', 6);
  await page.evaluate(() => PP.enterScene('bouquinistes', true)); await page.waitForTimeout(300);
  check(await page.evaluate(() => PP.S.at.bouquinistes) === 'B05p' && (await dlgText()).includes('petit papier'), 'Teil 2: nach der Unterbrechung geht es beim Papier weiter (' + await page.evaluate(() => PP.S.at.bouquinistes) + ')');
  await page.evaluate(() => { document.getElementById('dialogue').innerHTML = ''; document.getElementById('dialogue').classList.remove('active'); });
  await tryUse('le vieux livre');
  check(await node() === 'B05p', 'Teil 2: leeres Dialogfeld, Abschnitt offen: das alte Buch führt zurück zum Papier (' + await node() + ')');
  /* Neuladen in Lafayette nach dem Plan: frei, die Vendeuse ist da, kein Abschnitt beginnt von selbst */
  await page.evaluate(() => { PP.S.resume = null; PP.save(); });
  await setup(T2.concat(['G01_done']), 'lafayette', null);
  await reloadWith({});
  check(!(await modalOpen()) && !(await page.evaluate(() => PP.S.at.lafayette)) && await idleHelp() && (await page.locator('.hotspot', { hasText: 'la vendeuse' }).count()) === 1,
    'Teil 2: Neuladen in Lafayette nach dem Plan: frei, die Vendeuse ist da, Szenenhilfe da');
  /* Ältere Spielstände (bis Version 2.1) mitten in einer Kette */
  await reloadWith({ flags: { N04_done: true, N05_done: true, badge_faux: true }, at: { notredame: 'N06l' }, resume: 'N06l', scene: 'notredame' });
  check(await page.evaluate(() => PP.S.flags.N04a_done) && (await dlgText()).includes('cartes') && (await page.locator('.hotspot', { hasText: 'M. Nowak' }).count()) === 1,
    'Teil 2: alter Spielstand bei N06l: Gruppenfoto nachgetragen, die Karten gehen weiter, M. Nowak ist da');
  await reloadWith({ flags: Object.fromEntries(T2.concat(['B04_done']).map(f => [f, true])), at: { bouquinistes: 'B05' }, resume: 'B05', scene: 'bouquinistes' });
  check(await page.evaluate(() => PP.S.flags.B_arr && PP.S.flags.B02_done) && (await modalText()).includes('Le papier'), 'Teil 2: alter Spielstand bei B05: Ankunft und Bouquiniste nachgetragen, das Papier geht weiter');
  for (const [l, o] of [['p. 12', 'le parvis de Notre-Dame'], ['p. 27', 'la rue Chanoinesse'], ['p. 41', 'le quai aux Fleurs']]) await page.locator('#modal-body .slot', { hasText: l }).first().locator('select').selectOption({ label: o });
  await click('#modal-body button', 'Valider'); await cont('Continuer', 3);
  check(await node() === 'R4', 'Teil 2: alter Spielstand: nach dem Papier kommt R4, das Buch wird nicht noch einmal verlangt (' + await node() + ')');
  await reloadWith({ flags: Object.fromEntries(T2.concat(['E01x']).map(f => [f, true])), at: { eiffel: 'E01' }, resume: 'E01', scene: 'eiffel' });
  check(await page.evaluate(() => PP.S.flags.E_arr) && (await page.locator('.hotspot', { hasText: 'le joueur' }).count()) === 1, 'Teil 2: alter Spielstand bei E01: Ankunft nachgetragen, der Joueur ist da');
  /* Alter fertiger Stand: Früher blieb die Station nach dem Schluss B06e stehen und spielte ihn beim Zurückkommen noch einmal */
  await reloadWith({ flags: Object.fromEntries(T2.concat(['B04_done', 'B05_done', 'R4_done', 'B06_done', 'B_done', 'station1_done', 'N07_done']).map(f => [f, true])), at: { bouquinistes: 'B06e' }, resume: null, scene: 'bouquinistes' });
  await page.evaluate(() => PP.enterScene('bouquinistes', true)); await page.waitForTimeout(300);
  check(!(await page.evaluate(() => PP.S.at.bouquinistes)) && (await dlgText()).includes('Revenez quand vous voulez'), 'Teil 2: alter fertiger Stand bei B06e: zurück an den Bouquinistes nur die Begrüßung, kein Schluss von vorn (' + (await dlgText()).slice(0, 50) + ')');

  /* ===== Teil 3, Fassung 1.3: freie Stationen ===== */
  await start(BASE + 'voyageur/index.html?test=1&listen=1');
  await setup(['O01_done', 'O02_done', 'O03_done', 'O04_done', 'O06_done', 'R1_done', 'I_arr'], 'invalides', null);
  check(await idleHelp(), 'Teil 3: Invalides frei, die Szenenhilfe steht im leeren Dialogfeld');
  await use('Marcel');
  await tryUse('les baguettes');
  check(await node() === 'I00m' && /on finit ça/.test(await toasts()), 'Teil 3: Marcel angefangen: die Baguettes führen nicht vorbei (' + await node() + ' · ' + await toasts() + ')');
  await tryUse('la malle');
  check(await node() === 'I00m' && (await dlgText()).includes('Mes amis'), 'Teil 3: auch eine Bemerkung wartet, bis Marcel fertig ist');
  /* Unterbrechen über die Karte: zurück an den Invalides geht es bei Marcel weiter, die Baguettes führen auch dann zu ihm */
  await travelTo('Pont'); await cont('Continuer', 4);
  await travelTo('Invalides'); await cont('Continuer', 2);
  check(await page.evaluate(() => PP.S.at.invalides) === 'I00m', 'Teil 3: nach der Unterbrechung steht Marcels Abschnitt noch offen (' + await page.evaluate(() => PP.S.at.invalides) + ')');
  await page.evaluate(() => { document.getElementById('dialogue').innerHTML = ''; document.getElementById('dialogue').classList.remove('active'); });
  await tryUse('les baguettes');
  check(await node() === 'I00m' && (await dlgText()).includes('Mes amis'), 'Teil 3: leeres Dialogfeld, Abschnitt offen: die Baguettes führen zurück zu Marcel (' + await node() + ')');
  /* Neuladen in der freien Station: kein Abschnitt beginnt von selbst, Häkchen und Szenenhilfe sind wieder da */
  await reloadWith({ flags: { O01_done: true, O02_done: true }, at: {}, resume: null, scene: 'orsay' });
  check(!(await modalOpen()) && !(await page.evaluate(() => PP.S.at.orsay)) && await idleHelp() && (await page.locator('.hotspot.done', { hasText: "l'album" }).count()) === 1,
    'Teil 3: Neuladen in Orsay nach dem Album: frei, Häkchen am Album, Szenenhilfe da');
  /* Älterer Spielstand (Fassung 1.2) mitten in der Kette: nach dem Händler stand die Fiche an. G.migrate trägt O03_done nach */
  await reloadWith({ flags: { O01_done: true, O02_done: true }, at: { orsay: 'O04d' }, resume: 'O04d', scene: 'orsay' });
  check(await page.evaluate(() => PP.S.flags.O03_done) && (await modalText()).includes('Photos originales'), 'Teil 3: alter Spielstand bei O04d: O03_done nachgetragen, die Fiche geht weiter');
  await cont('Continuer', 1);
  for (const o of ['On a pris les photos en 1900', 'photos originales, pas des copies']) await click('#modal-body .btn.opt', o);
  await click('#modal-body button', 'Valider'); await cont('Continuer', 1);
  check(await node() === 'O05', 'Teil 3: alter Spielstand: nach der Fiche kommt M. Nowak (O05), der Händler wird nicht noch einmal gefragt (' + await node() + ')');
  await reloadWith({ flags: { O01_done: true, O02_done: true, O03_done: true, O04_done: true, O06_done: true, R1_done: true }, at: { pont: 'P02' }, resume: 'P02', scene: 'pont' });
  check(await page.evaluate(() => PP.S.flags.P_arr && PP.S.flags.P01_done) && (await page.locator('.hotspot', { hasText: "l'assistante" }).count()) === 1,
    'Teil 3: alter Spielstand bei P02: Ankunft und Brücke nachgetragen, die Hotspots sind da');
  await reloadWith({ flags: { O01_done: true, O02_done: true, O03_done: true, O04_done: true, O06_done: true, R1_done: true, I02_done: true }, at: { invalides: 'I03' }, resume: 'I03', scene: 'invalides' });
  check(await page.evaluate(() => PP.S.flags.I_arr) && (await page.locator('.hotspot', { hasText: 'Marcel' }).count()) === 1, 'Teil 3: alter Spielstand bei I03: Ankunft nachgetragen, Marcel ist da');

  check(!errors.length, 'keine Skriptfehler ' + errors.join(' | '));
  console.log(fails ? fails + ' Prüfung(en) fehlgeschlagen' : 'Alle Prüfungen bestanden');
  await browser.close();
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('FAILED', e.message); process.exit(1); });
