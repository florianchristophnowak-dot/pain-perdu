const { chromium } = require('playwright');
/* Automatischer Testdurchlauf durch Teil 3 « Le voyageur de 1900 »: ganzer Kernpfad mit zwei Spielenden, dazu die freiwilligen
   Stellen (Stativfuß, Tempusübung), einige Fehlversuche (Fallen, « Juste : n sur m », Pflichtbeleg), die Tore R1 und R2 und
   danach Bildschirmfotos auf dem Handy (hoch und quer).
   Voraussetzungen: Node, das Paket playwright und ein lokaler Server im Hauptordner, z. B. python3 -m http.server 8765
   Aufruf: node tools/playthrough-voyageur.js   (Umgebung: URL=..., SHOT_DIR=..., CHROMIUM=Pfad zu Chromium, optional) */
const fs = require('fs');
const SHOT = (process.env.SHOT_DIR || 'test-shots/voyageur') + '/';
fs.mkdirSync(SHOT, { recursive: true });
const BASE = process.env.URL || 'http://127.0.0.1:8765/voyageur/index.html';
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
  async function txt() { return (await page.locator((await scope()).trim()).innerText()).replace(/\s+/g, ' ').slice(0, 260); }
  /* Continuer klicken und dabei alles mitlesen, was erscheint (bis ein Fenster ohne Continuer oder der Endbildschirm kommt) */
  async function read(max = 40, onStep) {
    let seen = '';
    for (let i = 0; i < max; i++) {
      const t = (await page.locator((await scope()).trim()).innerText()).replace(/\s+/g, ' ');
      seen += ' ' + t; if (onStep) await onStep(t);
      const loc = page.locator((await scope()) + 'button', { hasText: 'Continuer' }).filter({ visible: true });
      if (!(await loc.count()) || !(await loc.first().isEnabled())) break;
      await loc.first().click(); await page.waitForTimeout(110);
    }
    return seen;
  }
  async function btn(text, opts = {}) {
    const loc = page.locator((await scope()) + 'button', { hasText: text }).filter({ visible: true });
    if (!(await loc.count())) throw new Error('no button: ' + text + ' · ' + (await txt()));
    await loc.nth(opts.nth || 0).click();
    await page.waitForTimeout(opts.wait || 120);
  }
  async function cont(max = 40) {
    for (let i = 0; i < max; i++) {
      const loc = page.locator((await scope()) + 'button', { hasText: 'Continuer' }).filter({ visible: true });
      if (!(await loc.count()) || !(await loc.first().isEnabled())) return;
      await loc.first().click(); await page.waitForTimeout(110);
    }
  }
  async function feedback() { return (await page.locator('#modal-body .feedback').innerText()).replace(/\s+/g, ' '); }
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
  async function recall(...answers) { const ins = page.locator('#modal-body input.rin'); for (let i = 0; i < answers.length; i++) await ins.nth(i).fill(answers[i]); await btn('Vérifier'); }
  async function tapIn(sel, i, x, y) {
    const b = await page.locator('#modal-body ' + sel).nth(i).boundingBox();
    await page.mouse.click(b.x + b.width * x / 100, b.y + b.height * y / 100); await page.waitForTimeout(140);
  }
  const loupeTap = (x, y) => tapIn('.lz', 0, x, y);
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
  async function place(name) { await page.locator('.place', { hasText: name }).first().click(); await page.waitForTimeout(250); await cont(); }
  const S = () => page.evaluate(() => window.PP.S);
  const status = async () => (await page.locator('#modal-body .lstatus').last().innerText()).trim();

  /* Fundpunkte stehen in Koordinaten des vollständigen Fotos: umrechnen wie die Engine (Ausschnitt, Albumseite) */
  await page.goto(URL);
  const GD = await page.evaluate(() => ({ photos: window.GAME.photos, album: window.GAME.album }));
  const cropAr = pid => { const p = GD.photos[pid], c = p.crop; return p.ar * c.w / c.h; };
  const toCrop = (pid, x, y) => { const c = GD.photos[pid].crop; return [(x - c.x) / c.w * 100, (y - c.y) / c.h * 100]; };
  const toSlot = (pid, x, y) => { const s = Object.values(GD.album.slots).find(v => v.photo === pid), h = s.w * GD.album.ar / cropAr(pid), [cx, cy] = toCrop(pid, x, y); return [s.x + cx / 100 * s.w, s.y + cy / 100 * h]; };

  /* Wer Teil 2 mit den Bouquinisten gespielt hat, wird in O05 wiedererkannt */
  await page.evaluate(() => localStorage.setItem('pg_save_v1', JSON.stringify({ v: 1, flags: { B_done: true } })));
  await page.fill('#p1', 'Anna'); await page.fill('#p2', 'Ben');
  await page.screenshot({ path: SHOT + '01_start.png' });
  await page.click('#btn-start'); await page.waitForTimeout(300);

  log('== Auftakt am Musée d\'Orsay (Lino ermittelt, Marie hilft)');
  expect((await txt()).includes('Troisième jour'), 'O00 Zwischenbild');
  await page.screenshot({ path: SHOT + '02_O00.png' });
  await cont();
  expect(await page.locator('#modal-body .album').isVisible(), 'O02 Albumseite in der Bildlupe');
  await page.screenshot({ path: SHOT + '03_album.png' });
  await loupeTap(...toSlot('P17', 20, 84));
  expect((await feedback()).includes('ancienne. Ou ajoutée'), 'O02 braune Farbe: Bemerkung');
  await loupeTap(...toSlot('P18', 52, 26));
  expect((await feedback()).includes('ruban adhésif ? Bizarre'), 'O02 Baguette auf B: nur eine Bemerkung');
  await loupeTap(...toSlot('P17', 43, 26.5));
  expect((await feedback()).includes("On regarde d'abord") && (await status()).includes('1 sur 2'), 'O02 Gesicht gefunden, Lino urteilt nicht mehr vorschnell: ' + await status());
  expect((await page.locator('#modal-body .help-bubble, #modal-body .btn.aide').first().getAttribute('data-who')) === 'marie', 'O02 Hilfe von Marie (Lino ermittelt)');
  await loupeTap(...toSlot('P17', 49, 51.5));
  await cont();
  expect((await S()).inv.includes('photo_a') && (await S()).inv.includes('photo_c'), 'O02 Fotos A, B, C im Inventar');
  await btn("L'album est vieux ?");
  await btn('Vous connaissez cet homme ?');
  { const t = await page.locator('#modal-body .asklog').innerText(); expect(t.includes('allait très bien') && (await feedback()).includes('seulement à ta question'), 'O03 leise Bemerkung von Lino und Hinweis nach zwei Ja-Nein-Fragen'); }
  await btn("Quand est-ce qu'on a pris"); await btn('Quelles photos est-ce que');
  await page.screenshot({ path: SHOT + '04_ask.png' });
  expect((await feedback()).includes('Tout est écrit ici'), 'O03 zwei Informationen, Antwort des Händlers');
  await btn('Continuer');
  expect((await txt()).includes('Photos originales, pas des copies'), 'O04 Fiche de vente als Dokument');
  await cont();
  await pick(['On a pris les photos en 1900', 'La couverture est vieille']);
  { const f = await feedback(); expect(/Juste : 1 sur 2/.test(f) && f.includes('pas les photos'), 'O04 Zählung und Falle « couverture »: ' + f.slice(0, 100)); }
  await pick(['On a pris les photos en 1900', 'photos originales, pas des copies']);
  await btn('Continuer');
  { const seen = await read();   // O05: M. Nowak will kaufen, O05q: die Bouquiniste zweifelt, dann das Programm
    expect(seen.includes('vous vérifiez pour moi') && seen.includes("l'argent de la visite d'hier") && seen.includes('Il voyage beaucoup'), 'O05 M. Nowak will das Album mit dem Geld der Klasse kaufen und schickt die beiden los');
    expect(seen.includes('parapluie rouge'), 'O05q Bouquiniste erkennt die beiden aus Teil 2'); }
  await cont();
  expect((await S()).inv.includes('programme'), 'O05 Programm im Inventar');
  const o6 = { 'existait en 1900': 'Le document dit oui', 'déjà un musée': 'Le document dit non', 'La légende de la photo A': 'Le document dit non', 'photo A en 2025': 'Le document dit non', 'Toutes les photos': 'Le document ne dit rien' };
  for (const [l, c] of Object.entries(o6)) await selectRow('.crow', l, c);
  await btn('Valider');
  { const f = await feedback(); expect(/Juste : 4 sur 5/.test(f) && f.includes('Pas encore la date'), 'O06 Zählung und Falle: ' + f.slice(0, 120)); }
  await selectRow('.crow', 'photo A en 2025', 'Le document ne dit rien'); await btn('Valider'); await cont();
  expect((await S()).flags.O06_done, 'O06 erledigt');
  expect((await txt()).includes('Kevin dit'), 'R1: M. Nowak fragt per SMS, was Kevin behauptet');
  await recall('1900'); expect((await feedback()).includes('prenaient le train'), 'R1 Falle « 1900 »');
  await recall('en 1986'); await cont();
  expect((await S()).flags.R1_done && await page.locator('.modal.map').isVisible(), 'R1 gelöst, Karte offen');
  await page.screenshot({ path: SHOT + '05_map.png' });

  log('== Pont Alexandre III (Marie ermittelt, Lino hilft)');
  await place('Pont Alexandre III');
  expect((await S()).mouse === 1, 'Maus wechselt zu Ben');
  expect(await page.locator('#modal-body .compare').isVisible(), 'P00 Bildlupe mit zwei Bildern');
  await page.screenshot({ path: SHOT + '06_compare_pont.png' });
  await tapIn('.compare .lz', 1, 33, 76);
  expect((await feedback()).includes("seulement sur l'image d'aujourd'hui"), 'P00 Boot: nur heute');
  await tapIn('.compare .lz', 0, ...toCrop('P18', 73, 30));
  expect((await feedback()).includes("l'autre image"), 'P00 Lampadaire auf B: « Et sur l\'autre image ? »');
  await tapIn('.compare .lz', 1, 63.5, 28);
  expect((await feedback()).includes('mêmes lampadaires') && (await status()).includes('1 sur 3'), 'P00 Lampadaires auf beiden Bildern: ' + await status());
  await tapIn('.compare .lz', 0, ...toCrop('P18', 90, 35)); await tapIn('.compare .lz', 1, 86, 32);
  await tapIn('.compare .lz', 0, ...toCrop('P18', 91.5, 7)); await tapIn('.compare .lz', 1, 87.5, 7);
  expect((await feedback()).includes('pas la même année'), 'P00 gelöst: ' + (await feedback()).slice(0, 80));
  await cont();
  expect(await page.locator('#modal-body .lz .crop').isVisible(), 'P01 Bildlupe auf dem Albumfoto B');
  await loupeTap(...toCrop('P18', 45, 28.5)); await loupeTap(...toCrop('P18', 48.5, 27.5));
  expect((await feedback()).includes('trois pansements'), 'P01 Klebeband: Lino und Marie');
  await loupeTap(...toCrop('P18', 14, 90));
  expect((await S()).flags.pied_vu, 'P01 freiwillig: Stativfuß am Rand (pied_vu)');
  await page.screenshot({ path: SHOT + '07_loupe_b.png' });
  await loupeTap(...toCrop('P18', 59.3, 28));
  await cont();
  expect((await S()).resume === 'P02', 'nach P01 direkt zur Assistentin, ohne Auswahlfrage P01b (' + (await S()).resume + ')');
  await btn('Un train pour 1900'); await cont(); await btn('La personne qui a pris la photo'); await cont();
  expect((await page.locator('#dialogue').innerText()).includes('connaît cette baguette'), 'P02 die andere Frage folgt');
  await btn('connaît cette baguette'); await cont();
  await order(['photos en costumes', 'La baguette tombe', 'Marcel ramasse', 'Chloé recommence']); await btn('Valider'); await cont();
  await pick(['les costumes']); expect((await feedback()).includes('elle le raconte'), 'P03b Falle « costumes »');
  await pick(['la date exacte']); await cont();
  expect((await S()).flags.P_done && await page.locator('.modal.map').isVisible(), 'Pont erledigt, Karte offen');

  log('== Invalides (Lino ermittelt, Marie hilft)');
  await place('Invalides');
  expect((await S()).mouse === 0, 'Maus wechselt zurück zu Anna');
  await cont();
  await pick(['Lucien a fait l\'album', 'année dernière']); expect((await feedback()).includes("Marcel n'a pas dit ça"), 'I01 Falle');
  await pick(['acteur sur ces photos', 'année dernière']); await cont();
  const gs = page.locator('#modal-body .gaptext select');
  await gs.nth(0).selectOption({ label: 'hier' }); await gs.nth(1).selectOption({ label: 'La baguette est tombée.' }); await gs.nth(2).selectOption({ label: 'avec trois morceaux de ruban adhésif' });
  await btn('Valider'); expect(/Juste : 2 sur 3/.test(await feedback()), 'I02 Zählung');
  await gs.nth(0).selectOption({ label: "en septembre, l'année dernière" }); await btn('Valider'); await cont();
  expect((await S()).inv.includes('photo_baguette'), 'I02 Foto der Baguette im Inventar');
  await tapIn('.compare .lz', 1, 65, 50); expect((await feedback()).includes('Ça peut changer'), 'I03 Farbe: Falle');
  await tapIn('.compare .lz', 0, ...toCrop('P18', 45, 28.5)); await tapIn('.compare .lz', 1, 11, 50);
  await tapIn('.compare .lz', 0, ...toCrop('P18', 48.5, 27.5));
  await page.screenshot({ path: SHOT + '08_compare_baguette.png' });
  await tapIn('.compare .lz', 1, 28, 50);
  expect((await feedback()).includes("C'est sa baguette"), 'I03 gelöst');
  await cont();
  await btn('Tout est faux'); await cont();
  await btn('La légende de la photo A est fausse'); await cont();
  expect((await txt()).includes('La bouquiniste') && (await txt()).includes('Qui a pris ces photos'), 'R2: die Bouquiniste fragt nach der Fotografin');
  /* R2 aufschieben: das Tor meldet sich im leeren Dialogfeld; dazwischen die freiwillige Tempusübung am Tisch */
  await btn('Revenir plus tard'); await cont(); await page.waitForTimeout(700);
  expect(await page.locator('#dialogue.pending button', { hasText: 'Répondre' }).isVisible() && (await page.locator('#dialogue').innerText()).includes('photographe'), 'R2 wartet im Dialogfeld (die Bouquiniste)');
  await page.locator('.hotspot', { hasText: 'la table' }).click(); await page.waitForTimeout(120); await page.locator('.verbs button').first().click(); await page.waitForTimeout(250);
  const ts = page.locator('#modal-body .gaptext select');
  for (const [i, v] of [[0, 'faisait'], [1, 'tenait'], [2, 'est tombée'], [3, 'a mis']]) await ts.nth(i).selectOption({ label: v });
  await btn('Valider'); await cont(); await page.waitForTimeout(700);
  expect((await S()).flags.Itemps_done && await page.locator('#dialogue.pending button', { hasText: 'Répondre' }).isVisible(), 'Tempusübung erledigt, R2 wartet weiter');
  await btn('Répondre');
  await recall('Marcel', '14 h'); expect((await feedback()).includes('Marcel est sur la photo B'), 'R2 Falle « Marcel »');
  await recall('Chloé', '14 h 45'); expect((await feedback()).includes('plus tôt'), 'R2 Falle « 14 h 45 »');
  await recall('Chloé', 'à 14 h'); await cont();
  expect((await S()).flags.I_done && (await S()).scene === 'stand6', 'Invalides erledigt, Mittag, weiter zu Chloé');

  log('== Stand 6: Chloé (Marie ermittelt, Lino hilft)');
  await cont();
  expect(await page.locator('#modal-body .fulls').isVisible(), 'C01 vollständige Fotos');
  const rows = page.locator('#modal-body .rrow');
  await rows.nth(0).locator('select').selectOption({ label: 'P16' }); await rows.nth(1).locator('select').selectOption({ label: 'P18' }); await rows.nth(2).locator('select').selectOption({ label: 'P19' });
  await page.screenshot({ path: SHOT + '09_reveal_match.png' });
  await btn('Valider');
  { const f = await feedback(); expect(/Juste : 2 sur 3/.test(f) && f.includes("pas à la même place"), 'C01 Falle P16: ' + f.slice(0, 120)); }
  await rows.nth(0).locator('select').selectOption({ label: 'P17' }); await btn('Valider'); await page.waitForTimeout(1600);
  expect(await page.locator('#modal-body .fullgrid').isVisible(), 'C01 Ränder klappen auf');
  await tapIn('.fullgrid .lz', 0, 87, 63);
  expect((await feedback()).includes("c'est l'assistante") && (await feedback()).includes('montre'), 'C01 P17: Assistentin, Chloé zur Uhr');
  await tapIn('.fullgrid .lz', 1, 8, 40);
  expect((await feedback()).includes("C'était le trépied"), 'C01 P18: Stativ, mit pied_vu');
  await page.screenshot({ path: SHOT + '10_reveal_edges.png' });
  await tapIn('.fullgrid .lz', 2, 50, 86); await cont();
  expect((await S()).inv.includes('photos_entieres'), 'C01 photos entières im Inventar');
  await cont();
  for (const [l, o] of [['septembre 2025', 'la date des photos'], ['Paris 1900', 'le titre de la série'], ['180 €', 'le prix des trois copies'], ['18 €', "le prix de l'album"]]) await selectRow('.slot', l === '18 €' ? /^18 €/ : l, o);
  await btn('Valider'); expect(/Juste : 2 sur 4/.test(await feedback()), 'C02 Zählung');
  await selectRow('.slot', '180 €', "le prix de l'album"); await selectRow('.slot', /^18 €/, 'le prix des trois copies'); await btn('Valider'); await cont();
  expect((await txt()).includes('Un message à M. Nowak'), 'nach C02 direkt die Nachricht an M. Nowak (W1 fragt Datum und Titel, R3 entfällt)');
  await write('Chloé a pris les photos.'); expect((await feedback()).includes('Encore'), 'W1 zu kurz');
  await write("Chloé a pris les photos en septembre, avec Marcel et Lucien. « Paris 1900 », c'est le titre de la série. Ce n'est pas une date. Nous avons les photos entières et la fiche de Chloé.");
  expect((await feedback()).includes('Quelle année'), 'W1 Rückfrage « Quelle année ? »');
  await write("Chloé a pris les photos en septembre 2025, avec Marcel et Lucien. « Paris 1900 », c'est le titre de la série, ce n'est pas une date. Nous pouvons montrer les photos entières et la fiche de Chloé.");
  expect((await feedback()).includes('quatorze heures quarante-cinq'), 'W1 angenommen'); await cont();
  expect(await page.locator('.modal.map').isVisible() && await page.locator('.place', { hasText: 'Le stand du vendeur' }).count() === 1 && !(await page.locator('.place', { hasText: "L'album du vendeur" }).count()), 'Karte: an Orsay nur noch der Stand des Händlers');

  log('== Finale am Stand des Händlers (Lino ermittelt, Marie hilft)');
  await place('Le stand du vendeur');
  const prow = page.locator('#modal-body .prow');
  const proof = async (i, item, sent) => { await prow.nth(i).locator('select').nth(0).selectOption({ label: item }); await prow.nth(i).locator('select').nth(1).selectOption({ label: sent }); };
  await proof(0, 'la photo de la baguette', 'La baguette réparée : la photo B est de 2025.');
  await proof(1, 'les photos entières', 'Ce sont les mêmes photos. Le vendeur a coupé les bords.');
  await proof(2, 'la fiche de Chloé', 'Chloé a pris les photos en septembre 2025.');
  await btn('Valider'); expect((await feedback()).includes('sa promesse, elle est sur sa fiche'), 'F01 ohne Fiche de vente: Pflichtbeleg fehlt');
  await proof(0, 'la fiche de vente', 'Le vendeur a écrit : photos de 1900, pas des copies.');
  await proof(1, 'les photos entières', 'Les photos sont brunes. Alors, elles sont vieilles.');
  await btn('Valider'); { const f = await feedback(); expect(/Juste : 2 sur 3/.test(f) && f.includes('Chloé fait des photos brunes'), 'F01 Zählung und Falle « brunes »: ' + f.slice(0, 100)); }
  await proof(1, 'les photos entières', 'Ce sont les mêmes photos. Le vendeur a coupé les bords.');
  await page.screenshot({ path: SHOT + '11_proofs.png' });
  await btn('Valider'); await cont();
  /* F02: Delmas wehrt sich; im Finale bleibt die Karte zu */
  expect((await page.locator('#dialogue').innerText()).includes('je ne savais pas'), 'F02 Einwand des Händlers');
  await page.click('#btn-map'); await page.waitForTimeout(200);
  expect(!(await page.locator('.modal.map').isVisible()) && (await page.locator('#toasts').innerText()).includes("on finit l'enquête"), 'Im Finale ist die Karte gesperrt');
  await btn('Les photos sont brunes'); expect((await page.locator('#dialogue').innerText()).includes("ce qu'il savait"), 'F02 Falle « brunes »'); await cont();
  await btn('Chloé vous a expliqué le titre'); await cont();
  await order(['En septembre 2025', 'Avant-hier', 'coupé les bords', 'collé les photos', 'Sur sa fiche']); await btn('Valider');
  expect((await read()).includes("Je n'achète pas"), 'nach F03: M. Nowak kauft nicht (F03b entfällt)');
  await pick(['Album ancien', 'Photos originales de 1900', 'Série en costumes']); expect(/Juste : 2 sur 3/.test(await feedback()), 'F04 Zählung');
  await pick(['Album ancien', 'Copies de photos', 'Série en costumes']);
  expect((await read()).includes("Notre argent reste dans l'enveloppe") && (await txt()).includes('Le rapport'), 'F04: das Geld bleibt in der Kasse, dann der Bericht W2 (R4 entfällt)');
  const rapportSansPC = "Le vendeur disait : les photos sont de 1900. Mais les photos étaient de Chloé, une série en costumes. L'album était vieux, mais les photos étaient des copies. M. Nowak voulait acheter l'album, et Marcel avait encore sa vieille baguette en plastique.";
  await write(rapportSansPC); expect((await feedback()).includes('Il manque le passé composé'), 'W2 passé composé fehlt');
  const rapport = "Le vendeur disait : « Les photos sont de 1900. » Mais Chloé a pris les photos en septembre 2025. Le vendeur a coupé les bords, et il a mis les photos dans un vieil album. Finalement, M. Nowak n'a pas acheté l'album.";
  await write(rapport); await cont(1);
  await write(rapport.replace('Finalement', 'Alors'));
  { let shot = false;   // Schlussbild nach dem Bericht
    const seen = await read(40, async t => { if (!shot && t.includes('même en brun')) { shot = true; await page.screenshot({ path: SHOT + '12_photo_classe.png' }); } });
    expect(shot, 'F05 Klassenfoto mit Tafel nach dem Bericht');
    expect(seen.includes('Et Lucien, il est où') && seen.includes('vingt-trois') && seen.includes('vrais souvenirs') && seen.includes('Je sais même où'), 'F05: Lucien, Bernd, das Echo auf Delmas und der Weg zum Bahnhof'); }
  expect(await page.locator('.modal.end').isVisible(), 'Endbildschirm');
  await page.screenshot({ path: SHOT + '13_end.png' });
  const st = await S();
  expect(st.diag.length > 20, 'Diagnose: ' + st.diag.length + ' Einträge');
  expect(Object.keys(st.cards).includes('W1') && st.cards.W2 && st.cards.W2.length === 2, 'W1 und W2 (zweimal) im Carnet gespeichert');
  await page.locator('#modal-body button').filter({ hasText: /^Carnet$/ }).click(); await page.waitForTimeout(150); await page.screenshot({ path: SHOT + '14_carnet.png' });
  expect((await page.locator('#modal-body .qbox.proven').count()) === 4, 'Carnet: vier Fragen gelöst');
  expect((await page.locator('#modal-body').innerText()).includes('Avec trois preuves : la fiche de vente'), 'Q4 nennt die gewählten Beweise');

  /* ---------- Handy: hoch und quer ---------- */
  for (const [name, vp] of [['phone', { width: 390, height: 844 }], ['phone_quer', { width: 844, height: 390 }]]) {
    const ctx = await browser.newContext({ viewport: vp, hasTouch: true, isMobile: true });
    const m = await ctx.newPage();
    m.on('pageerror', e => errors.push(name + ' PAGEERROR ' + e.message));
    await m.goto(URL); await m.fill('#p1', 'Clara'); await m.click('#btn-start'); await m.waitForTimeout(300);
    await m.screenshot({ path: SHOT + name + '_01_cut.png' });
    for (const [id, sc] of [['O02', 'orsay'], ['P00t', 'pont'], ['P01', 'pont'], ['I03', 'invalides'], ['C01', 'stand6'], ['F01', 'finale'], ['W1', 'stand6']]) {
      await m.evaluate(([id, sc]) => { const S = window.PP.S; ['photo_a', 'photo_b', 'photo_c', 'fiche_vente', 'fiche_orsay', 'programme', 'photo_baguette', 'photos_entieres', 'fiche_chloe'].forEach(i => S.inv.includes(i) || S.inv.push(i)); document.querySelector('#modal').hidden = true; window.PP.enterScene(sc, false); window.PP.goNode(id); }, [id, sc]);
      await m.waitForTimeout(600);
      await m.screenshot({ path: SHOT + name + '_' + id + '.png' });
    }
    await ctx.close();
  }

  log(errors.length ? 'FEHLER:\n' + errors.join('\n') : 'keine Konsolenfehler');
  log(fails ? fails + ' Prüfungen fehlgeschlagen' : 'alle Prüfungen bestanden');
  await browser.close();
  process.exit(fails || errors.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
