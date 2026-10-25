const { chromium } = require('playwright');
/* Automatischer Testdurchlauf durch Teil 2 « Le guide fantôme »: ganzer Lösungsweg mit zwei Spielenden,
   einige Fehlversuche (Fallen, « Juste : n sur m »), danach Bildschirmfotos auf dem Handy (hoch und quer).
   Voraussetzungen: Node, das Paket playwright und ein lokaler Server im Hauptordner, z. B. python3 -m http.server 8765
   Aufruf: node tools/playthrough-guide.js   (Umgebung: URL=..., SHOT_DIR=..., CHROMIUM=Pfad zu Chromium, optional) */
const fs = require('fs');
const SHOT = (process.env.SHOT_DIR || 'test-shots/guide') + '/';
fs.mkdirSync(SHOT, { recursive: true });
const BASE = process.env.URL || 'http://127.0.0.1:8765/guide-fantome/index.html';
const URL = BASE + '?test=1';
const log = (...a) => console.log(...a);
let fails = 0;
function expect(cond, msg) { if (!cond) { fails++; log('  ✗ ' + msg); } else log('  ✓ ' + msg); }

(async () => {
  const browser = await chromium.launch(Object.assign({ headless: true }, process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}));
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  page.on('console', m => { if ((m.type() === 'error' || m.type() === 'warning') && !/Failed to load resource/.test(m.text())) errors.push(m.type() + ': ' + m.text()); });

  const modalOpen = () => page.locator('#modal').isVisible();
  const scope = async () => (await modalOpen()) ? '#modal-body ' : '#dialogue ';
  async function btn(text, opts = {}) {
    const loc = page.locator((await scope()) + 'button', { hasText: text }).filter({ visible: true });
    if (!(await loc.count())) throw new Error('no button: ' + text + ' · ' + (await txt()));
    await loc.nth(opts.nth || 0).click();
    await page.waitForTimeout(opts.wait || 120);
  }
  async function txt() { return (await page.locator((await scope()).trim()).innerText()).replace(/\s+/g, ' ').slice(0, 220); }
  /* Continuer klicken, solange es geht; vorher die Höflichkeitsformeln von M. Beaumont antippen */
  async function cont(max = 30) {
    for (let i = 0; i < max; i++) {
      const f = page.locator('.formule:not(.got)').filter({ visible: true });
      for (let k = await f.count(); k > 0; k--) { await f.first().click(); await page.waitForTimeout(40); }
      const loc = page.locator((await scope()) + 'button', { hasText: 'Continuer' }).filter({ visible: true });
      if (!(await loc.count()) || !(await loc.first().isEnabled())) return;
      await loc.first().click(); await page.waitForTimeout(110);
    }
  }
  async function feedback() { return (await page.locator('#modal-body .feedback').innerText()).replace(/\s+/g, ' '); }
  async function choose(text) { await btn(text); }
  async function pick(labels) {
    const opts = page.locator('#modal-body .btn.opt').filter({ visible: true });
    for (const pass of [false, true]) {   // erst abwählen, dann wählen (höchstens n gleichzeitig)
      for (let i = 0; i < await opts.count(); i++) {
        const o = opts.nth(i), t = await o.innerText(), on = (await o.getAttribute('class')).includes(' on');
        const want = labels.some(l => t.includes(l));
        if (on !== want && want === pass) await o.click();
      }
    }
    await btn('Valider');
  }
  async function selectRow(rowSel, label, option) {
    const row = page.locator('#modal-body ' + rowSel).filter({ hasText: label }).first();
    await row.locator('select').selectOption({ label: option });
  }
  async function write(text) { await page.fill('#modal-body textarea', text); await btn('Valider'); }
  async function recall(answer) { await page.fill('#modal-body input.rin', answer); await btn('Vérifier'); }
  async function loupeTap(x, y) {
    const b = await page.locator('#modal-body .lz').boundingBox();
    await page.mouse.click(b.x + b.width * x / 100, b.y + b.height * y / 100); await page.waitForTimeout(140);
  }
  async function place(name) { await cont(); await page.click('#btn-map'); await page.waitForTimeout(150); await page.locator('.place', { hasText: name }).first().click(); await page.waitForTimeout(200); }
  const S = () => page.evaluate(() => window.PP.S);
  async function order(texts) {   // Kette: ▲ bis jede Zeile an ihrem Platz ist
    for (let i = 0; i < texts.length; i++) {
      for (let guard = 0; guard < 8; guard++) {
        const items = page.locator('#modal-body .citem');
        let at = -1;
        for (let k = 0; k < await items.count(); k++) if ((await items.nth(k).innerText()).includes(texts[i])) at = k;
        if (at <= i) break;
        await items.nth(at).locator('.cmove').first().click(); await page.waitForTimeout(60);
      }
    }
  }

  await page.goto(URL);
  await page.fill('#p1', 'Anna'); await page.fill('#p2', 'Ben');
  await page.screenshot({ path: SHOT + '01_start.png' });
  await page.click('#btn-start'); await page.waitForTimeout(300);

  log('== Auftakt Notre-Dame');
  await cont();                                     // N00 (Klasse), N01 (Beaumont, mit Formeln), N02
  expect((await txt()).includes('trois phrases'), 'N03 Auswahl nach dem Hörtext');
  await pick(['porte secrète', 'Les rois passaient', 'Le boulanger était très riche']);
  const f3 = await feedback();
  expect(/Juste : 2 sur 3/.test(f3) && f3.includes("parlé d'argent"), 'N03 Zählung und Falle: ' + f3.slice(0, 120));
  await pick(['porte secrète', 'Les rois passaient', 'pain plein']);
  await cont();                                     // N03 → N04
  expect((await S()).inv.length === 6, 'N04 sechs Gegenstände im Inventar');
  await page.screenshot({ path: SHOT + '02_loupe_photo.png' });
  await loupeTap(86, 40); await loupeTap(95.3, 61.5); await loupeTap(93.5, 70);
  expect(/3 sur 4/.test(await page.locator('#modal-body .lstatus').innerText()), 'N04a drei Fundpunkte: ' + await page.locator('#modal-body .lstatus').innerText());
  { const b = await page.locator('#modal-body .lz').boundingBox(); await page.mouse.move(b.x + b.width * .916, b.y + b.height * .572); for (let i = 0; i < 4; i++) { await page.mouse.wheel(0, -120); await page.waitForTimeout(60); } }
  await page.screenshot({ path: SHOT + '03_loupe_zoom.png' });
  await loupeTap(91.6, 57.2);
  expect((await S()).flags.prix_vu, 'N04a Preis im Buch (Zoom) gefunden');
  await cont();
  await loupeTap(73.5, 48); await loupeTap(95, 81);
  { const st = await page.locator('#modal-body .lstatus').innerText(); expect(/Beaumont : 2 sur 2/.test(st) && !/visage/.test(st), 'N04b Selfie: Moustache und Uhr als Details zu M. Beaumont, nicht « visage »: ' + st); }
  await cont();
  log('  N05:', await txt());
  await cont();
  await choose('Beaumont, c\'est bizarre'); await cont();
  await choose('31 février'); await cont();
  expect((await S()).flags.badge_faux, 'N05 Ausweis als falsch erkannt');
  await page.screenshot({ path: SHOT + '04_card.png' });
  await loupeTap(16, 89.5);
  { const c = await page.locator('#modal-body .gc-corner').boundingBox(); const card = await page.locator('#modal-body .gcard').boundingBox();
    await page.mouse.move(c.x + c.width / 2, c.y + c.height / 2); await page.mouse.down();
    for (let i = 1; i <= 8; i++) { await page.mouse.move(c.x + c.width / 2 - card.width * .07 * i, c.y + c.height / 2 + card.height * .07 * i); await page.waitForTimeout(20); }
    await page.mouse.up(); await page.waitForTimeout(150); }
  await page.screenshot({ path: SHOT + '05_card_peeled.png' });
  expect((await S()).flags.carte_peeled, 'N06 Aufkleber abgezogen');
  await btn('Retourner la carte'); await page.waitForTimeout(700);
  await page.screenshot({ path: SHOT + '06_card_back.png' });
  await cont();
  expect((await S()).flags.N06_done, 'N06 erledigt');
  const g = ['a été', 'avait', 'portait', 'avait', 'est parti'];
  for (let i = 0; i < 5; i++) await page.locator('#modal-body .gaptext select').nth(i).selectOption({ label: g[i] });
  await btn('Valider');
  expect(/Juste : 4 sur 5/.test(await feedback()), 'N07a Zählung bei einem Fehler');
  await page.locator('#modal-body .gaptext select').nth(0).selectOption({ label: 'était' });
  await btn('Valider'); await cont(1);
  await write('moustache manteau grand gris vite vieux gentil poli'); expect((await feedback()).includes('pas seulement des mots'), 'N07b Wortliste ohne Verb abgelehnt');
  await write("Comment est-ce qu'il parlait ? Vite, lentement, poliment ?"); expect((await feedback()).includes('des questions'), 'N07b abgetippte Hilfe (Fragen) abgelehnt');
  await write('Il parlait langsam und höflich. Er war sehr nett und alt.'); expect((await feedback()).includes('En français'), 'N07b deutsch abgelehnt');
  /* Satzanfänge antippen und fortsetzen: Die eigenen Wörter « vite » und « gentil » reichen (früher fehlte « parl » aus dem Satzanfang) */
  await page.fill('#modal-body textarea', '');
  for (const [c, t] of [['Il parlait', 'vite. '], ['Il était très', 'gentil.']]) { await page.locator('#modal-body .chips button', { hasText: c }).first().click(); await page.keyboard.type(t); }
  await btn('Valider'); expect((await feedback()).includes("c'est ça"), 'N07b « Il parlait vite. Il était très gentil. » mit Satzanfängen angenommen'); await cont(1);
  await write('Il parlait très lentement et poliment. Il était grand et il avait un manteau beige.'); await cont(1);
  for (const [l, c] of [['parapluie rouge', 'facilement'], ['moustache grise', 'difficile'], ['manteau beige', 'facilement'], ['sa voix', 'difficile'], ['le badge', 'facilement'], ['sa taille', 'difficile']]) await selectRow('.crow', l, c === 'facilement' ? 'Il peut le changer facilement' : "C'est plus difficile");
  await btn('Valider'); await cont();
  for (const [l, o] of [['étiquette', 'les Galeries Lafayette'], ['le sac', 'les Galeries Lafayette'], ['rendez-vous', 'le Louvre'], ['vieux livre', 'les bouquinistes']]) await selectRow('.slot', l, o);
  await btn('Valider');
  expect((await feedback()).includes("pas d'indice pour le Louvre"), 'N08 Louvre-Falle');
  await selectRow('.slot', 'rendez-vous', 'la tour Eiffel'); await btn('Valider'); await cont();
  await choose('La tour Eiffel, parce qu'); await cont();
  log('  R1:', await txt());
  await recall('12 h');
  expect((await feedback()).includes('Un quart d\'heure avant'), 'R1 Falle « 12 h »');
  await recall('à midi moins le quart'); await cont();
  expect((await S()).flags.R1_done && await page.locator('.modal.map').isVisible(), 'R1 gelöst, Karte offen');
  await page.screenshot({ path: SHOT + '07_map.png' });
  expect(Object.keys((await S()).formules || {}).length === 5, 'fünf Höflichkeitsformeln gesammelt');

  log('== Tour Eiffel');
  await page.locator('.place', { hasText: 'Tour Eiffel' }).first().click(); await page.waitForTimeout(200);
  await cont();
  expect((await txt()).includes('trois choses bizarres') || await page.locator('#modal-body .observe').isVisible(), 'E02 Beobachtung offen');
  await page.screenshot({ path: SHOT + '08_observe.png' });
  { const at = async (x, y) => { const box = await page.locator('#modal-body .observe').boundingBox(); await page.mouse.click(box.x + box.width * x / 100, box.y + box.height * y / 100); };
    await at(50, 64); await page.waitForTimeout(100);
    await at(70, 92); await page.waitForTimeout(100);
    for (let i = 0; i < 80; i++) { if (await page.locator('#modal-body .oframe').nth(2).isVisible()) break; await page.waitForTimeout(100); }
    await at(24, 50); await page.waitForTimeout(150);
    await page.screenshot({ path: SHOT + '09_observe_ring.png' });
    expect(await page.locator('#modal-body .oring').isVisible(), 'E02 Telefon klingelt erst nach zwei Funden');
    await at(56.9, 43.2); await page.waitForTimeout(150); }
  await cont();                                     // E02 → E03 Hörtext → E04
  const e4 = { 'Lucien ?': 'Ce qui a été dit', 'Tu rapportes': 'Ce qui a été dit', 'Il reste encore': 'Ce qui a été dit', "s'appelle Lucien": "Ce qu'on peut en déduire", 'va bientôt': "Ce qu'on peut en déduire", 'travaillent ensemble': "Ce qu'on peut en déduire", 'fausses cartes': "Ce qu'on peut en déduire", 'Aller aux': 'Ce qui nous aide', 'Écrire à': 'Ce qui nous aide', 'Ne pas jouer': 'Ce qui nous aide', 'a rendu le manteau': 'Ce qui a été dit', 'Le joueur, c\'est': "C'est faux", 'parler au joueur': "C'est faux" };
  for (const [l, c] of Object.entries(e4)) await selectRow('.crow', l, c);
  await btn('Valider');
  expect(/Juste : 12 sur 13/.test(await feedback()) && (await feedback()).includes('pose une question'), 'E04 Zählung und Falle');
  await selectRow('.crow', 'a rendu le manteau', "C'est faux"); await btn('Valider'); await cont();
  await recall('Beaumont'); expect((await feedback()).includes('nom sur le badge'), 'R3 Falle « Beaumont »');
  await recall('Lucien'); await cont();
  await recall('il a rendu le manteau'); expect((await feedback()).includes("c'est une question"), 'R3b Falle « a rendu »');
  await recall('rendre le manteau'); await cont();
  expect((await S()).flags.R3b_done, 'R3b gelöst');

  log('== Galeries Lafayette');
  await page.locator('.place', { hasText: 'Lafayette' }).first().click(); await page.waitForTimeout(200);
  await cont();
  log('  G00 Metro:', (await S()).from);
  await choose('Au 2e étage'); await cont();
  await choose('il coûte combien'); await cont();
  await choose("l'homme qui le portait"); await cont();
  await choose("L'étiquette sur la manche"); await cont();
  await btn('Vous l\'avez vendu ?'); await btn('Il a posé des questions ?');
  expect((await feedback()).includes('seulement à ta question'), 'G04 Hinweis nach zwei Ja-Nein-Fragen');
  for (const q of ['vendu quand', 'Quelles questions', 'Comment est-ce', 'Jusqu\'à quelle heure', 'Lucien']) { const l = page.locator('#modal-body .askq', { hasText: q }); if (await l.count() && await l.first().isEnabled()) { await l.first().click(); await page.waitForTimeout(100); } }
  await page.screenshot({ path: SHOT + '10_ask.png' });
  await cont(1);
  await write('Est-ce que il était content ?'); expect((await feedback()).includes('est-ce que'), 'G04b « est-ce que » am Anfang abgelehnt');
  await write('Pourquoi est-ce qu\'il a posé des questions ?'); await cont(1);
  await write('Quand est-ce que le magasin ouvre ?'); await cont();
  await choose('Montrer la carte'); await cont();
  await recall('demain'); expect((await feedback()).includes('trop tard'), 'R2 Falle « demain »');
  await recall('le jour même'); await cont();

  log('== Bouquinistes');
  await page.locator('.place', { hasText: 'Bouquinistes' }).first().click(); await page.waitForTimeout(200);
  await cont();
  await choose('huit euros'); await cont();
  await order(['acheté le manteau', 'venu chez', 'acheté le guide', 'fait la visite']); await btn('Valider'); await cont();
  for (const [l, c] of [['cette petite porte', 'Mot pour mot dans le livre'], ['porte secrète', 'Changé'], ['Suivez', 'Pas dans le livre'], ['vendait un pain', 'Mot pour mot dans le livre'], ['Les rois', 'Changé'], ['Un jour', 'Mot pour mot dans le livre']]) await selectRow('.crow', l, c);
  await btn('Valider'); await cont();
  await pick(['porte secrète', 'les rois']); await cont();
  for (const [l, o] of [['p. 12', 'le parvis de Notre-Dame'], ['p. 27', 'la rue Chanoinesse'], ['p. 41', 'le quai aux Fleurs']]) await selectRow('.slot', l, o);
  await btn('Valider'); await cont();
  await recall('tour Eiffel'); expect((await feedback()).includes('son ami'), 'R4 Falle « tour Eiffel »');
  await recall('devant Notre-Dame'); expect((await feedback()).includes('quelle page'), 'R4 Falle « Notre-Dame »');
  await recall('page 12'); await cont();
  await choose('Aux Galeries Lafayette'); await cont();
  expect((await S()).flags.B_done, 'Bouquinisten erledigt');

  log('== Finale');
  await page.locator('.place', { hasText: 'Service des retours' }).first().click(); await page.waitForTimeout(250);
  await cont();
  await recall('des billets'); expect((await feedback()).includes("ce qu'il a dit, lui"), 'R5 Falle « billets »');
  await recall('un bon de réduction'); await cont();
  await page.screenshot({ path: SHOT + '11_retours.png' });
  await loupeTap(26, 50); expect((await feedback()).includes("modèle de l'hiver"), 'F01 falscher Mann: eigene Reaktion');
  await loupeTap(53, 45); await cont();
  await pick(['moustache grise', 'montre dorée']); await cont();
  await choose('Demain, c\'est notre guide'); await cont();
  await choose('Ce matin, c\'était notre guide'); await cont();
  await order(['dix heures', 'onze heures', '220 euros', 'midi moins le quart', 'Maintenant']);
  const gaps = page.locator('#modal-body .ctext select');
  for (let i = 0; i < 3; i++) await gaps.nth(i).selectOption({ label: 'pas' });
  await btn('Valider'); expect(/Juste : 6 sur 8/.test(await feedback()) && (await feedback()).includes('revenu ou pas'), 'F04 Zählung, Rückfrage zu den Wörtern');
  for (let i = 0; i < 3; i++) { const t = await page.locator('#modal-body .citem').nth(i + 2).innerText(); await page.locator('#modal-body .citem').nth(i + 2).locator('select').selectOption({ label: t.includes('revenu') ? 'jamais' : t.includes('payé') ? 'rien' : 'pas' }); }
  await page.screenshot({ path: SHOT + '12_chain.png' });
  await btn('Valider'); await cont();
  const rows = page.locator('#modal-body .prow');
  const proof = async (i, item, sent) => { await rows.nth(i).locator('select').nth(0).selectOption({ label: item }); await rows.nth(i).locator('select').nth(1).selectOption({ label: sent }); };
  await proof(0, 'la fiche de signalement', 'Il parle très bien français.'); await proof(1, 'la photo du badge', 'Le 31 février n\'existe pas.'); await proof(2, 'le selfie de Lino', 'On le reconnaît : la même moustache, la même montre.');
  await btn('Valider'); expect(/Juste : 2 sur 3/.test(await feedback()) && (await feedback()).includes('écrite nous-mêmes'), 'F05 Zählung und Falle « fiche »');
  await proof(0, 'une carte « Visite exclusive »', "Ce n'est pas un billet. C'est un bon de réduction du magasin.");
  await btn('Valider'); await cont();
  await write('Nous sommes à Notre-Dame. Venez vite, s\'il vous plaît.'); expect((await feedback()).includes('15 heures'), 'F06 Notre-Dame statt Kaufhaus');
  await write('Nous sommes aux Galeries Lafayette, au service retour. Venez rapidement !'); expect((await feedback()).includes("J'arrive"), 'F06 « service retour » und « rapidement » angenommen'); await cont();
  expect((await S()).flags.formules_5, 'F07 Formeln gesammelt (Zusatzzeile)');
  await cont();
  await write('Ne paie pas, il n\'y a pas de visite.'); expect((await feedback()).includes('on dit vous'), 'Z01 tu statt vous');
  await write('Ne lui donnez rien, madame. C\'est un escroc !'); await cont();
  const rapport = "Ce matin, devant Notre-Dame, il y avait un guide très poli. Il portait un manteau beige et il avait un parapluie rouge. Il a pris 220 euros et il nous a donné des cartes. À midi moins le quart, il est parti, et il n'est jamais revenu. Aux Galeries Lafayette, on a appris qu'il voulait rendre son manteau le jour même. À la tour Eiffel, on a entendu son vrai nom : Lucien. Ce n'était pas un guide. Finalement, on l'a trouvé au service des retours.";
  await write('Ce matin il y avait un guide. Il portait un manteau et un parapluie. Le guide était poli et la carte était belle. Lucien était aux Galeries Lafayette avec la police et M. Nowak. Tout le monde était content et la visite était longue et belle. Le matin, la classe attendait devant Notre-Dame.');
  expect((await feedback()).includes("Il manque l'action"), 'F09 passé composé fehlt');
  await write(rapport); await cont(1);
  await write(rapport.replace('très poli', 'très gentil')); await cont(1);
  expect(await page.locator('.modal.end').isVisible(), 'Endbildschirm');
  await page.screenshot({ path: SHOT + '13_end.png' });
  const st = await S();
  expect(st.diag.length > 30, 'Diagnose: ' + st.diag.length + ' Einträge');
  await page.locator('#modal-body button').filter({ hasText: /^Carnet$/ }).click(); await page.waitForTimeout(150); await page.screenshot({ path: SHOT + '14_carnet.png' });
  expect((await page.locator('#modal-body .qbox.proven').count()) === 4, 'Carnet: vier Fragen gelöst');
  expect((await page.locator('#modal-body').innerText()).includes('Avec trois preuves : une carte'), 'Q4 nennt die gewählten Beweise');

  /* ---------- Handy: hoch und quer ---------- */
  for (const [name, vp] of [['phone', { width: 390, height: 844 }], ['phone_quer', { width: 844, height: 390 }]]) {
    const ctx = await browser.newContext({ viewport: vp, hasTouch: true, isMobile: true });
    const m = await ctx.newPage();
    m.on('pageerror', e => errors.push(name + ' PAGEERROR ' + e.message));
    await m.goto(URL); await m.fill('#p1', 'Clara'); await m.click('#btn-start'); await m.waitForTimeout(300);
    await m.screenshot({ path: SHOT + name + '_01_cut.png' });
    for (const id of ['N04a', 'N06', 'E02', 'F04', 'F05', 'G04']) {
      await m.evaluate(id => { const S = window.PP.S; ['photo_groupe', 'selfie', 'badge', 'carte', 'fiche', 'page_guide'].forEach(i => S.inv.includes(i) || S.inv.push(i)); document.querySelector('#modal').hidden = true; window.PP.goNode(id); }, id);
      await m.waitForTimeout(500);
      await m.screenshot({ path: SHOT + name + '_' + id + '.png' });
    }
    expect(await m.locator('#btn-full').isVisible() || await m.locator('#btn-full-start').count(), name + ': Vollbild-Knopf vorhanden');
    await ctx.close();
  }

  log(errors.length ? 'FEHLER:\n' + errors.join('\n') : 'keine Konsolenfehler');
  log(fails ? fails + ' Prüfungen fehlgeschlagen' : 'alle Prüfungen bestanden');
  await browser.close();
  process.exit(fails || errors.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
