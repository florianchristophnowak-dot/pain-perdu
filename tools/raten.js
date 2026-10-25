const { chromium } = require('playwright');
/* Rate-Test: spielt wie jemand ohne Französisch, der nur klickt und rät, und prüft die Bremsen gegen Raten und Durchklicken.
   Voraussetzungen wie bei tools/playthrough.js (lokaler Server auf Port 8765).
   Aufruf: node tools/raten.js            (Umgebung: URL=... ohne Parameter, CHROMIUM=Pfad, optional)
           node tools/raten.js de         prüft die deutsche Fassung (de/index.html) */
const DE = process.argv[2] === 'de';
const BASE = process.env.URL || 'http://127.0.0.1:8765/' + (DE ? 'de/' : '');
const T = DE
  ? { start: 'Los geht', valider: 'Prüfen', cont: 'Weiter', count: 'Richtig:', all: 'überall', lang: 'Bitte auf Deutsch', topic: 'Worum geht es', paste: 'Kein Kopieren', listen: null, foreign: 'Le mime avait un sac brun. Il a pris notre sac par erreur et il a trouvé nos affaires. On va à la librairie pour lire son message, avec Marie.', offTopic: 'Ich heiße Max und ich bin fünfzehn Jahre alt. Am Wochenende spiele ich gern Fußball mit meinen Freunden, und abends sehe ich oft fern oder lese ein Buch.' }
  : { start: 'Commencer', valider: 'Valider', cont: 'Continuer', count: 'Juste :', all: 'partout', lang: 'En français', topic: 'de quoi tu parles', paste: 'copier-coller', listen: 'Écoute jusqu', foreign: 'Der Pantomime hatte einen braunen Rucksack wie wir. Er hat unseren Rucksack aus Versehen genommen und wir gehen jetzt in die Buchhandlung, um seine Nachricht zu lesen.', offTopic: "Je m'appelle Max et j'ai quinze ans. Le week-end, je joue au foot avec mes amis et le soir, je regarde la télé ou je lis un livre dans ma chambre." };
let fails = 0;
const check = (ok, what) => { console.log((ok ? 'ok    ' : 'FEHLER ') + what); if (!ok) fails++; };

(async () => {
  const browser = await chromium.launch(Object.assign({ headless: true }, process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}));
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const modalText = async () => (await page.locator('#modal-body').innerText()).replace(/\s+/g, ' ');
  const fbText = async () => (await page.locator('#modal-body .feedback').innerText()).replace(/\s+/g, ' ');
  const jump = async (scene, node) => { await page.evaluate(([s, n]) => { PP.enterScene(s, false); PP.goNode(n); }, [scene, node]); await page.waitForTimeout(250); };
  const valider = () => page.locator('#modal-body button', { hasText: T.valider }).first();

  await page.goto(BASE + 'index.html?intro=0&test=1&listen=1');
  await page.fill('#p1', 'Rateria');
  await page.locator('#btn-start').click(); await page.waitForTimeout(300);

  /* 1. Antworten im Dialog stehen jedes Mal anders */
  const orders = new Set();
  for (let i = 0; i < 6; i++) {
    await page.evaluate(() => { document.getElementById('modal').hidden = true; document.getElementById('dialogue').classList.remove('muted'); PP.enterScene('montmartre', false); PP.goNode('M03'); });
    await page.waitForTimeout(150);
    await page.locator('#dialogue button', { hasText: T.cont }).first().click(); await page.waitForTimeout(120);
    orders.add((await page.locator('#dialogue .choice').allInnerTexts()).join(' | '));
  }
  check(orders.size > 1, 'Dialogantworten werden gemischt (' + orders.size + ' verschiedene Reihenfolgen in 6 Runden)');

  /* 2. Hörtext: weiter erst nach dem Anhören (nur französische Fassung) */
  if (T.listen) {
    await jump('montmartre', 'M03a');
    const cont = page.locator('#modal-body .bar button', { hasText: T.cont });
    check(await cont.isDisabled(), 'Hörtext: „Continuer“ ist gesperrt, bis die Aufnahme ganz gelaufen ist');
    check((await modalText()).includes(T.listen), 'Hörtext: Hinweis „' + T.listen + '…“ steht da');
  }

  /* 3. Lückentext raten: nur „wie viele richtig“, nach drei Fehlversuchen Pause, auch nach Neuladen */
  await jump('montmartre', 'M04b');
  const sels = page.locator('.gaptext select');
  const n = await sels.count();
  await valider().click(); await page.waitForTimeout(100);
  check((await fbText()).includes(T.all), 'Leere Lücken zählen nicht als Versuch, Marie bittet um Antworten überall');
  const bad = async () => { for (let i = 0; i < n; i++) { const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean)); const ans = await sels.nth(i).evaluate(s => s.dataset.answer); await sels.nth(i).selectOption(opts.find(o => o !== ans)); } };
  await bad();
  for (let k = 1; k <= 3; k++) {
    await valider().click(); await page.waitForTimeout(150);
    if (k === 1) {
      check((await fbText()).includes(T.count), 'Rückmeldung nennt nur die Anzahl: ' + (await fbText()).slice(0, 90));
      check(await page.locator('.gaptext select.bad, .gaptext select.good').count() === 0, 'Keine Lücke wird einzeln als richtig/falsch markiert');
    }
  }
  check(await valider().isDisabled(), 'Nach dem dritten Fehlversuch ist „' + T.valider + '“ gesperrt');
  check(await page.locator('.feedback .countdown').isVisible(), 'Countdown läuft: ' + (await page.locator('.feedback .countdown').innerText()));
  check(await page.locator('#modal-body .aide').count() === 1, 'Hilfe-Knopf bleibt in der Pause da');
  await page.evaluate(() => document.getElementById('btn-map').click()); await page.waitForTimeout(150);
  check(await page.locator('#modal').evaluate(m => m.classList.contains('task')), 'Karte lässt sich während der Aufgabe nicht öffnen (auch nicht per Tastatur)');
  await page.reload(); await page.waitForTimeout(400);
  await page.locator('#btn-resume').click(); await page.waitForTimeout(400);
  check(await valider().isDisabled() && await page.locator('.feedback .countdown').isVisible(), 'Pause gilt auch nach Neuladen weiter');
  await page.evaluate(() => { const S = PP.S; Object.keys(S.pause).forEach(k => { S.pause[k] = Date.now() - 1; }); PP.save(); });
  await page.waitForTimeout(1300);
  check(await valider().isEnabled(), 'Nach der Pause geht es weiter');
  await bad();
  for (let k = 0; k < 3; k++) { await valider().click(); await page.waitForTimeout(120); }
  const left2 = await page.evaluate(() => Math.round((Math.max(...Object.values(PP.S.pause)) - Date.now()) / 1000));
  check(left2 > 100, 'Zweite Pause dauert zwei Minuten (' + left2 + ' s)');

  /* 4. Hilfe Stufe 4 verrät die Zuordnung nicht mehr */
  const help4 = await page.evaluate(() => [window.GAME.help.M04[3], window.GAME.help.P04[3]].join(' / '));
  check(!/Morgen Père-Lachaise|Nachmittag Marais|Kreuzung, dann links/.test(help4), 'Hilfe 4 (M04, P04) erklärt statt zu lösen');

  /* 5. Aushang: richtiger Aushang muss mit zwei Belegen begründet werden */
  await page.evaluate(() => { const S = PP.S; S.tries = {}; S.pause = {}; S.pauses = {}; PP.save(); });
  await jump('librairie', 'L02');
  await page.locator('.poster').nth(2).locator('button').click(); await page.waitForTimeout(150);
  check(await page.locator('.proof').isVisible(), 'Nach dem richtigen Aushang fragt Lenoir nach zwei Belegen');
  const opt = re => page.locator('.proof .opt').filter({ hasText: re });
  await opt(/Blanchard/).click(); await opt(/17/).click();
  await page.locator('.proof button', { hasText: T.valider }).click(); await page.waitForTimeout(150);
  check((await fbText()).includes('17') && !(await page.locator('#modal-body .bar button', { hasText: T.cont }).count()), 'Beleg „17 h“ zählt nicht (steht auf allen drei): ' + (await fbText()).slice(0, 70));
  await opt(/17/).click(); await opt(/corrig|korrigiert/).click();
  await page.locator('.proof button', { hasText: T.valider }).click(); await page.waitForTimeout(150);
  check(await page.locator('#modal-body .bar button', { hasText: T.cont }).count() === 1, 'Name + Fassung: Aushang gilt als begründet');

  /* 6. Kevins SMS lässt sich nicht wegklicken (sonst fiele die Nachricht an Nowak weg) */
  await page.evaluate(() => { const S = PP.S; S.tries = {}; S.pause = {}; S.pauses = {}; PP.save(); });
  await jump('marais', 'B05');
  check(await page.locator('#modal').evaluate(m => m.classList.contains('nocl')) && !(await page.locator('#modal-close').isVisible()), 'SMS-Fenster vor der Nachricht an Nowak hat kein ×');

  /* 7. Freier Text: andere Sprache, falsches Thema, Einfügen */
  await jump('marais', 'B06');
  const ta = page.locator('#modal-body textarea');
  await ta.fill(T.foreign); await valider().click(); await page.waitForTimeout(120);
  check((await fbText()).includes(T.lang), 'Text in der anderen Sprache wird abgelehnt: ' + (await fbText()).slice(0, 70));
  await ta.fill(T.offTopic); await valider().click(); await page.waitForTimeout(120);
  check((await fbText()).includes(T.topic), 'Text ohne Bezug zur Geschichte wird abgelehnt: ' + (await fbText()).slice(0, 70));
  await ta.fill('');
  await ta.evaluate(t => { const dt = new DataTransfer(); dt.setData('text/plain', 'copié depuis un traducteur'); t.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })); });
  await page.waitForTimeout(100);
  check((await ta.inputValue()) === '' && (await fbText()).includes(T.paste), 'Einfügen ist gesperrt: ' + (await fbText()).slice(0, 60));

  check(!errors.length, 'keine Skriptfehler ' + errors.join(' | '));
  console.log(fails ? fails + ' Prüfung(en) fehlgeschlagen' : 'Alle Prüfungen bestanden');
  await browser.close();
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('FAILED', e.message); process.exit(1); });
