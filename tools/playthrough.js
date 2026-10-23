const { chromium } = require('playwright');
/* Automatischer Testdurchlauf durch Phase 1 und Phase 2.
   Voraussetzungen: Node, das Paket playwright (npm i -D playwright) und ein lokaler Server, z. B. npx http-server -p 8765 .
   Aufruf: node tools/playthrough.js   (Umgebung: URL=..., SHOT_DIR=..., CHROMIUM=Pfad zu Chromium, optional) */
const fs = require('fs');
const SHOT = (process.env.SHOT_DIR || 'test-shots') + '/';
fs.mkdirSync(SHOT, { recursive: true });
const URL = process.env.URL || 'http://127.0.0.1:8765/index.html';
(async () => {
  const browser = await chromium.launch(Object.assign({ headless: true }, process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}));
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
  const log = (...a) => console.log(...a);
  const vis = (sel) => page.locator(sel).filter({ visible: true });
  async function btn(text, opts = {}) {
    const inModal = await page.locator('#modal').isVisible();
    const loc = page.locator(inModal ? '#modal-body button' : 'button', { hasText: text }).filter({ visible: true });
    const n = await loc.count();
    if (!n) throw new Error('no button: ' + text);
    await loc.nth(opts.nth || 0).click();
    await page.waitForTimeout(opts.wait || 120);
  }
  async function cont(times = 1) { for (let i = 0; i < times; i++) { try { await btn('Continuer'); } catch (e) { return; } } }
  async function contAll() { for (let i = 0; i < 10; i++) { const inModal = await page.locator('#modal').isVisible(); const loc = page.locator(inModal ? '#modal-body button' : '#dialogue button', { hasText: 'Continuer' }).filter({ visible: true }); if (!(await loc.count())) return; await loc.first().click(); await page.waitForTimeout(120); } }
  async function hotspot(label, verb) {
    await contAll();
    await page.locator('.hotspot', { hasText: label }).first().click();
    await page.waitForTimeout(80);
    await page.locator('.verbs .verb', { hasText: verb }).first().click();
    await page.waitForTimeout(150);
  }
  async function dlgText() { return (await page.locator('#dialogue').innerText()).replace(/\s+/g, ' ').slice(0, 160); }
  async function modalText() { return (await page.locator('#modal-body').innerText()).replace(/\s+/g, ' ').slice(0, 160); }

  await page.goto(URL);
  await page.fill('#p1', 'Anna'); await page.fill('#p2', 'Ben');
  await page.screenshot({ path: SHOT + '01_start.png' });
  await btn('Commencer');
  log('S02:', await modalText());
  await cont(2);                       // S02 two lines
  log('M00:', await modalText());
  await cont(1);                       // Marie line
  await btn('Fermer le sac');          // wrong
  await cont(1);                       // Marie: Attends
  await cont(1);
  await btn('Noter');
  log('M00z:', await modalText()); await btn("C'est noté");
  log('M00c:', await modalText());
  await cont(3);
  log('M01 dialogue:', await dlgText());
  await page.screenshot({ path: SHOT + '02_montmartre.png' });
  await cont(1);
  await hotspot('le sac brun', 'Regarder');
  log('M02:', await modalText());
  await cont(1); await cont(1);
  log('M02t:', await modalText());
  await page.screenshot({ path: SHOT + '03_zettel.png' });
  await btn("C'est noté"); await cont(1);
  log('after M02 dialogue:', await dlgText());
  await hotspot('la dame du kiosque', 'Parler');
  await cont(1);
  await btn('Vous cherchez cet homme');
  await cont(1); await cont(1);
  await btn('Vous allez voir cet homme');
  await cont(1); await cont(1);
  log('help button enabled?', await page.locator('#dialogue .aide').isEnabled());
  await btn('Aide'); log('help:', (await page.locator('.marie-bubble').innerText()).slice(0, 80));
  await btn('Vous avez vu cet homme');
  log('M03a:', await modalText());
  await page.screenshot({ path: SHOT + '04_audio.png' });
  await cont(1);
  log('M04:', await modalText());
  for (const p of [0, 1]) {
    await page.locator('.slot', { hasText: 'ce matin' }).locator('select').selectOption('pl');
    await page.locator('.slot', { hasText: 'cet après-midi' }).locator('select').selectOption('marais');
    await page.locator('.slot', { hasText: 'ce soir' }).locator('select').selectOption(p === 0 ? 'louvre' : 'nsp');
    await btn('Valider');
    if (p === 0) { log('M04 wrong fb:', (await page.locator('.feedback').innerText()).slice(0, 60)); await page.locator('.slot', { hasText: 'ce soir' }).locator('select').selectOption('nsp'); await btn('Valider'); }
    await page.screenshot({ path: SHOT + '05_sort_' + p + '.png' });
    await cont(1);
  }
  log('M04b:', await modalText());
  const sels = page.locator('.gaptext select');
  await sels.nth(0).selectOption('portait'); await sels.nth(1).selectOption('regardions'); await sels.nth(2).selectOption('a pris'); await sels.nth(3).selectOption('partait');
  await btn('Valider'); log('gap fb:', (await page.locator('.feedback').innerText()).slice(0, 60));
  await sels.nth(3).selectOption('est parti'); await btn('Valider');
  await cont(1);
  log('M04z:', await modalText()); await btn("C'est noté");
  log('M05:', await dlgText()); await cont(2);
  log('MAP:', await modalText());
  await page.screenshot({ path: SHOT + '06_map.png' });
  await page.locator('.place', { hasText: 'Louvre' }).click();   // visit Louvre early
  await page.waitForTimeout(200); log('travel:', await modalText());
  await cont(2);
  log('Louvre V00:', await dlgText()); await cont(1);
  await hotspot("l'assistante", 'Parler'); await cont(1);
  await btn('Le Pain perdu, à 17 heures'); await cont(2);
  log('back to map:', await modalText());
  await page.locator('.place', { hasText: 'Père-Lachaise' }).click();
  await page.waitForTimeout(200); await cont(1);
  log('P01:', await dlgText()); await cont(2);
  await hotspot('le banc rouge', 'Parler'); log('banc early:', await dlgText()); await cont(1);
  await hotspot('le gardien', 'Parler'); await cont(1);
  await btn('Jim Morrison'); await cont(2); await cont(1);
  await btn('Non, on cherche un homme');
  log('P03:', await modalText()); await cont(1);
  log('P03t:', await modalText()); await btn("C'est noté"); await cont(1);
  await hotspot('Gaston', 'Regarder'); await contAll();
  log('P07:', await dlgText());
  await btn('dans le panier'); await contAll();
  await btn('sous le banc'); await contAll();
  await hotspot('Gaston', 'Regarder'); log('P07r:', await dlgText()); await contAll();
  await hotspot('le plan', 'Regarder');
  log('P04:', await modalText());
  await btn('le chemin qui descend'); log('route fb:', (await page.locator('.feedback').innerText()).slice(0, 60));
  await btn('tout droit'); await btn('à droite'); await btn('à gauche');
  await page.screenshot({ path: SHOT + '07_route.png' });
  await cont(1); await cont(1);
  log('P05:', await dlgText()); await cont(1);
  await btn('Non. Marcel a pris notre sac'); await cont(1);
  log('P06:', await modalText());
  await btn('la fermeture rouge'); await btn('le visage de pain'); await btn('Valider');
  log('P06 fb:', (await page.locator('.feedback').innerText()).slice(0, 60));
  await btn('le visage de pain'); await btn("l'autocollant jaune"); await btn('Valider');
  await cont(1); await contAll();
  log('P06z:', await modalText()); await btn("C'est noté"); await contAll();
  log('P06c:', await dlgText());
  await btn('Oui, avec plaisir'); await page.waitForTimeout(300);
  log('C03 audio:', await modalText()); await cont(1);
  log('C03t:', await modalText());
  const cs = page.locator('.gaptext select');
  await cs.nth(0).selectOption('les crânes'); await cs.nth(1).selectOption('en carton'); await cs.nth(2).selectOption('son sac brun'); await btn('Valider');
  log('C03 fb:', (await page.locator('.feedback').innerText()).slice(0, 50));
  await cs.nth(0).selectOption('les vieux panneaux'); await btn('Valider'); await cont(1); await contAll();
  log('C03z:', await modalText()); await btn("C'est noté");
  log('after C03 (map?):', (await modalText()).slice(0, 40));
  await page.locator('.place', { hasText: 'Marais' }).click(); await page.waitForTimeout(200); await contAll();
  log('B01:', await dlgText()); await contAll();
  await page.screenshot({ path: SHOT + '08_marais.png' });
  await hotspot('le flyer', 'Regarder'); await cont(1); await btn('Fermer');
  await hotspot('Nora', 'Parler'); await cont(1);
  await btn('Je voudrais du pain perdu'); await cont(3); await cont(1);
  await btn('Je cherche un sac'); await cont(1);
  log('B02b:', await dlgText()); await cont(1);
  await btn('fermeture rouge'); await cont(2); await cont(1);
  await btn('Brun, grand');  await cont(1);
  log('B03:', await modalText()); await cont(1);
  log('B04:', await modalText());
  await btn('Marcel a trouvé des affaires'); await btn("Il pense qu'il a pris"); await btn('Le programme de son spectacle'); await btn('Valider');
  await cont(1); await cont(2);
  log('B04z:', await modalText()); await btn("C'est noté");
  log('B05:', await modalText()); await cont(1); await cont(1);
  log('B05t:', await modalText()); await btn("C'est noté");
  log('B06:', await modalText());
  await btn('Le mime avait'); await page.locator('textarea').fill('Le mime avait un sac brun, comme nous. Il a pris notre sac par erreur et il a trouvé nos affaires. On va à la librairie Les Mots retrouvés pour lire son message. Marie est avec moi.');
  await btn('Valider'); await cont(1);
  log('Nowak:', await dlgText()); await cont(1);
  await hotspot('la porte de la librairie', 'Regarder'); await page.waitForTimeout(300);
  log('travel/L01:', await modalText(), '|', await dlgText());
  await contAll(); await contAll();
  log('L01:', await dlgText());
  await hotspot('le panneau', 'Regarder');
  log('L02:', await modalText());
  await page.locator('.poster', { hasText: 'place des Vosges' }).locator('button').click();
  log('L02 fb:', (await page.locator('.feedback').innerText()).slice(0, 60));
  await page.locator('.poster', { hasText: 'cour du Louvre' }).locator('button').click();
  await page.screenshot({ path: SHOT + '09_posters.png' });
  await page.locator('.proofpick .opt', { hasText: 'le nom du mime' }).first().click();
  await page.locator('.proofpick .opt', { hasText: 'programme corrigé' }).first().click();
  await btn('Valider');
  log('L02 success:', (await page.locator('.feedback').innerText()).slice(0, 80));
  await cont(1);
  log('L02z:', await modalText()); await btn("C'est noté");
  await hotspot('M. Lenoir', 'Parler'); await cont(1); await btn('Pourquoi il y a deux Marcel'); await cont(1); await cont(1); await btn('Merci, au revoir');
  await hotspot('la table', 'Regarder');
  log('L04:', await modalText());
  await btn('ANNULÉ'); await page.locator('.sheet', { hasText: 'affiche C' }).click();
  log('L04 fb:', (await page.locator('.feedback').innerText()).slice(0, 60));
  await btn('ANCIEN PROGRAMME'); await page.locator('.sheet', { hasText: 'affiche A' }).click();
  await btn('MODIFICATION'); await page.locator('.sheet', { hasText: 'affiche C' }).click();
  await page.screenshot({ path: SHOT + '10_stamp.png' });
  await cont(1); await cont(1);
  await hotspot('la carte de Marcel', 'Regarder'); log('L05:', await modalText()); await cont(3);
  log('L05z:', await modalText()); await btn("C'est noté");
  await btn('Carnet'); await page.screenshot({ path: SHOT + '11_carnet.png' }); log('CARNET:', (await modalText()).slice(0, 160)); await btn('Fermer');
  await btn('Carte'); await page.screenshot({ path: SHOT + '13_map2.png' }); await page.locator('.place', { hasText: 'Vosges' }).click(); await page.waitForTimeout(200);
  await contAll(); log('X01:', await dlgText()); await contAll();
  log('X01t:', await modalText());
  await btn('le nouveau lieu'); await btn('Valider'); log('X01 fb:', (await page.locator('.feedback').innerText()).slice(0, 50));
  await btn("l'ancien lieu"); await btn('Valider'); await cont(1); await contAll();
  log('after X01 (map?):', (await modalText()).slice(0, 40));
  await page.locator('.place', { hasText: 'Catacombes' }).click(); await page.waitForTimeout(200);
  await contAll(); log('C02:', await dlgText()); await contAll();
  log('C02t:', await modalText());
  await btn('demain'); await btn('Valider'); await cont(1); await contAll();
  log('C02c:', await dlgText());
  await btn('Retour à la carte'); await page.waitForTimeout(200);
  await page.locator('.place', { hasText: 'Louvre' }).click(); await page.waitForTimeout(200);
  await contAll(); await contAll();
  log('V00:', await dlgText());
  await hotspot("l'assistante", 'Parler'); await contAll();
  log('V02c:', await dlgText());
  await btn('Oui, bien sûr'); await page.waitForTimeout(300);
  log('V02b audio:', await modalText()); await cont(1);
  log('V02bt:', await modalText());
  const vs = page.locator('.gaptext select');
  await vs.nth(0).selectOption('à droite'); await vs.nth(1).selectOption('derrière'); await vs.nth(2).selectOption('éteinte'); await vs.nth(3).selectOption('allumée'); await btn('Valider');
  await page.screenshot({ path: SHOT + '14_lampes.png' });
  await cont(1); await contAll();
  log('V03:', await dlgText());
  await btn('Rendez-moi mon sac'); await contAll();
  await btn("Excusez-moi, je crois qu'on a échangé"); await contAll();
  await btn('vous preniez notre sac'); await contAll();
  await btn("Pendant qu'on regardait la photo"); await contAll();
  await btn('Il y a un gant blanc'); await contAll();
  await btn('Dans la poche de devant'); await btn("L'enveloppe rouge est sous"); await contAll();
  log('V04:', await modalText()); await contAll();
  log('V05:', await modalText());
  for (const p of [0, 1]) { await page.locator('textarea').fill('On était à Montmartre pour une photo. Leo tenait le sac Bernd. Pendant que nous regardions la photo, le mime a pris notre sac. Au Père-Lachaise, on a appris son nom : Marcel Blanchard. Sur une photo, Marcel avait déjà son sac brun. Donc ce n était pas un vol. Il croyait que notre sac était son sac. À la librairie, on a trouvé le bon programme. À la fin, on a échangé les sacs au Louvre.'); await btn('Valider'); await cont(1); }
  log('END:', await modalText());
  await page.screenshot({ path: SHOT + '12_end.png' });
  const diag = await page.evaluate(() => PP.S.diag.map(d => d.id + ':' + d.player + ':' + d.result + ':' + d.attempts + ':' + d.help));
  log('DIAG', diag.join('\n'));
  log('ERRORS', errors.join('\n') || 'none');
  await browser.close();
})().catch(e => { console.error('FAILED', e.message); process.exit(1); });
