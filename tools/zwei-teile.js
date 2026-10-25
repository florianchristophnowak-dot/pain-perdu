const { chromium } = require('playwright');
/* Test für das gemeinsame Startmenü: Teil 2 gesperrt, Schlüsselwort am Ende von Teil 1, Eingabe des Schlüsselworts,
   Wechsel zwischen den Teilen (eigene Spielstände), alter Direktlink auf Teil 2. Bildschirmfotos in test-shots/teile/.
   Voraussetzungen: Node, das Paket playwright und ein lokaler Server im Hauptordner, z. B. python3 -m http.server 8765
   Aufruf: node tools/zwei-teile.js   (Umgebung: URL=..., SHOT_DIR=..., CHROMIUM=Pfad zu Chromium, optional) */
const fs = require('fs');
const SHOT = (process.env.SHOT_DIR || 'test-shots/teile') + '/';
fs.mkdirSync(SHOT, { recursive: true });
const BASE = process.env.URL || 'http://127.0.0.1:8765/';
const log = (...a) => console.log(...a);
let fails = 0;
function expect(cond, msg) { if (!cond) { fails++; log('  ✗ ' + msg); } else log('  ✓ ' + msg); }

(async () => {
  const browser = await chromium.launch(Object.assign({ headless: true }, process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}));
  const errors = [];
  const watch = p => { p.on('pageerror', e => errors.push('PAGEERROR ' + e.message)); };
  const title = p => p.locator('#title').innerText();
  const chosen = p => p.locator('#parts .part.on').getAttribute('data-part');
  const locked = p => p.locator('#parts .part[data-part="2"]').evaluate(b => b.classList.contains('locked'));
  const vsrc = p => p.locator('.introvid video').evaluate(v => v.currentSrc || v.src).catch(() => '');

  log('== Erster Besuch: Teil 1, Teil 2 gesperrt');
  let ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  let page = await ctx.newPage(); watch(page);
  await page.goto(BASE + 'index.html?intro=0&test=1');
  expect((await title(page)).includes('pain perdu'), 'Titel von Teil 1');
  expect(await chosen(page) === '1' && await locked(page), 'Teil 1 gewählt, Teil 2 gesperrt');
  await page.screenshot({ path: SHOT + '01_start.png' });
  await page.click('#parts .part[data-part="2"]');
  expect(await page.locator('#keyrow').isVisible() && await chosen(page) === '1', 'gesperrter Teil 2: Schlüsselwort-Feld, Teil 1 bleibt gewählt');
  await page.fill('#key', 'Notre Dame de Paris'); await page.click('#btn-key');
  expect((await page.locator('#keymsg').innerText()).includes('pas le bon'), 'falsches Schlüsselwort abgelehnt');
  expect(await locked(page), 'Teil 2 bleibt gesperrt');
  await page.screenshot({ path: SHOT + '02_falsch.png' });

  log('== Ende von Teil 1 zeigt das Schlüsselwort');
  await page.click('#parts .part[data-part="1"]');
  expect(await page.locator('#keyrow').isVisible(), 'Feld bleibt offen, bis Teil 2 offen ist');
  await page.fill('#p1', 'Anna'); await page.fill('#p2', 'Ben');
  await page.click('#btn-start'); await page.waitForTimeout(300);
  await page.evaluate(() => PP.goNode('V06')); await page.waitForTimeout(300);
  const end = await page.locator('#modal-body .keybox').innerText();
  expect(/notre dame/i.test(end), 'Schlüsselwort auf dem Endbildschirm: ' + end.replace(/\s+/g, ' ').slice(0, 60));
  expect(await page.evaluate(() => localStorage.getItem('pp_partie2')) === '1', 'Teil 2 auf diesem Gerät freigeschaltet');
  await page.screenshot({ path: SHOT + '03_ende.png' });
  await page.locator('#modal-body .keybox button').click(); await page.waitForTimeout(300);
  expect(await page.locator('#start').isVisible() && (await title(page)).includes('guide fantôme'), 'Knopf führt ins Startmenü mit dem Titel von Teil 2');
  expect(await chosen(page) === '2' && !(await locked(page)), 'Teil 2 gewählt und offen');
  expect(await page.inputValue('#p1') === 'Anna' && await page.inputValue('#p2') === 'Ben', 'Namen bleiben stehen');
  expect(await page.locator('#start fieldset').isHidden(), 'Sprachwahl für Lino nur bei Teil 1');
  await page.screenshot({ path: SHOT + '04_teil2_gewaehlt.png' });

  log('== Teil 2 aus dem Startmenü');
  await page.click('#btn-start'); await page.waitForURL(/guide-fantome/); await page.waitForTimeout(500);
  expect(await page.locator('#game').isVisible(), 'Teil 2 läuft');
  expect(!/[?]/.test(page.url()), 'Adresse ohne Namen: ' + page.url());
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('pg_save_v1')).players.join('&')) === 'Anna&Ben', 'Teil 2 speichert die Namen in seinem eigenen Spielstand');
  await page.reload(); await page.waitForTimeout(500);
  expect(await page.locator('#game').isVisible() && /guide-fantome/.test(page.url()), 'Neuladen: Teil 2 läuft weiter');
  await page.evaluate(() => document.querySelector('#btn-menu').click()); await page.waitForURL(u => !/guide-fantome/.test(u)); await page.waitForTimeout(400);
  expect(await page.locator('#start').isVisible() && !(await page.locator('.introvid').count()), '„Menu“ in Teil 2: gemeinsames Startmenü ohne Intro');
  expect(await chosen(page) === '2' && !/menu=/.test(page.url()), 'Teil 2 gewählt, Adresse bereinigt');
  expect((await page.locator('#btn-resume').innerText()).includes('Anna & Ben'), 'Weiterspielen in Teil 2: ' + await page.locator('#btn-resume').innerText());
  await page.click('#parts .part[data-part="1"]');
  expect((await title(page)).includes('pain perdu') && await page.locator('#btn-resume').isVisible(), 'Teil 1 wählbar, mit eigenem Spielstand');
  await page.click('#parts .part[data-part="2"]');
  await page.click('#btn-resume'); await page.waitForURL(/guide-fantome/); await page.waitForTimeout(500);
  expect(await page.locator('#game').isVisible(), 'Weiterspielen öffnet Teil 2');
  await ctx.close();

  log('== Anderes Gerät: alter Link auf Teil 2, Schlüsselwort eingeben');
  ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  page = await ctx.newPage(); watch(page);
  await page.goto(BASE + 'guide-fantome/index.html');
  await page.waitForURL(u => !/guide-fantome/.test(u)); await page.waitForTimeout(300);
  const intro1 = await page.locator('.introvid h1').innerText().catch(() => '');
  expect(!intro1 || intro1.includes('pain perdu'), 'Intro mit dem Titel von Teil 1' + (intro1 ? '' : ' (Video lief nicht, Startmenü sofort)'));
  expect(!intro1 || /video\/intro\.mp4$/.test(await vsrc(page)), 'Video von Teil 1: ' + await vsrc(page));
  if (await page.locator('.introvid .skip').isVisible().catch(() => false)) await page.click('.introvid .skip');
  await page.waitForTimeout(1100);
  expect(await page.locator('#keyrow').isVisible() && await locked(page), 'Weiterleitung ins Startmenü, Schlüsselwort-Feld offen');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Handy hoch: nichts ragt seitlich heraus');
  await page.screenshot({ path: SHOT + '05_handy_schluessel.png' });
  await page.fill('#key', ' notre-DÂME '); await page.click('#btn-key'); await page.waitForTimeout(400);
  const intro2 = await page.locator('.introvid h1').innerText().catch(() => '');
  expect(!intro2 || intro2.includes('guide fantôme'), 'Intro mit dem Titel von Teil 2' + (intro2 ? '' : ' (Video lief nicht)'));
  expect(!intro2 || /video\/intro_teil2\.mp4$/.test(await vsrc(page)), 'Video von Teil 2: ' + await vsrc(page));
  if (await page.locator('.introvid .skip').isVisible().catch(() => false)) await page.click('.introvid .skip');
  await page.waitForTimeout(1100);
  expect(await chosen(page) === '2' && (await title(page)).includes('guide fantôme'), 'Schlüsselwort (Bindestrich, Akzent, Großbuchstaben) öffnet Teil 2');
  await page.screenshot({ path: SHOT + '06_handy_offen.png' });
  await page.fill('#p1', 'Clara'); await page.click('#btn-start'); await page.waitForURL(/guide-fantome/); await page.waitForTimeout(500);
  expect(await page.locator('#game').isVisible(), 'Teil 2 startet auf dem Handy');
  await page.screenshot({ path: SHOT + '07_handy_teil2.png' });
  await page.goto(BASE + 'index.html'); await page.waitForTimeout(400);
  const intro3 = await page.locator('.introvid h1').innerText().catch(() => '');
  expect(!intro3 || intro3.includes('guide fantôme'), 'nächster Besuch: Intro mit dem Titel von Teil 2');
  expect(!intro3 || /video\/intro_teil2\.mp4$/.test(await vsrc(page)), 'nächster Besuch: Video von Teil 2');
  await ctx.close();

  log('== Teil 1 vor den zwei Teilen geschafft');
  ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true });
  page = await ctx.newPage(); watch(page);
  await page.goto(BASE + 'zettel.html');
  await page.evaluate(() => localStorage.setItem('pp_results_v1', JSON.stringify([{ started: 1, players: ['Dora', ''], diag: [], finished: true, helpUsed: {} }])));
  await page.goto(BASE + 'index.html?intro=0'); await page.waitForTimeout(300);
  expect(await chosen(page) === '2' && !(await locked(page)), 'Teil 2 offen und gewählt');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Handy quer: nichts ragt seitlich heraus');
  await page.screenshot({ path: SHOT + '08_handy_quer.png', fullPage: true });
  await ctx.close();

  log('ERRORS', errors.join('\n') || 'none');
  log(fails ? fails + ' Prüfungen fehlgeschlagen' : 'alle Prüfungen bestanden');
  await browser.close();
  process.exit(fails || errors.length ? 1 : 0);
})().catch(e => { console.error('FAILED', e.message); process.exit(1); });
