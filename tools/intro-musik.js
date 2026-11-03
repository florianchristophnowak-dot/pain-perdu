const { chromium } = require('playwright');
/* Test für den Schalter „Musique“ im Intro (js/game.js, playIntro) in der französischen und der deutschen Fassung:
   Schalter im Intro und im Startmenü, Einstellung bleibt auf dem Gerät (pp_intro_music), Teil 1 und 2 ohne Musik stumm,
   Teil 3 ohne Musik mit der Fassung intro_teil3_ohne_musik.mp4 (Wechsel mitten im Video an derselben Stelle),
   gesperrter Ton (Browser ohne vorherigen Klick), fehlende Fassung ohne Musik, Darstellung auf Computer und Handy.
   Startet selbst einen kleinen Server mit Range-Anfragen (sonst springt das Video beim Wechsel an den Anfang).
   Aufruf: node tools/intro-musik.js   (Umgebung, optional: URL=... statt des eigenen Servers, z. B. file:///…/pain-perdu/ für das
   entpackte Offline-Paket; DE_URL=... für die deutsche Fassung, Standard URL + de/, für ihr Offline-Paket file:///…/pain-perdu-deutsch/;
   SHOT_DIR=..., CHROMIUM=Pfad). Bildschirmfotos in test-shots/intro-musik/. */
const fs = require('fs');
const path = require('path');
const http = require('http');
const SHOT = (process.env.SHOT_DIR || 'test-shots') + '/intro-musik/';
fs.mkdirSync(SHOT, { recursive: true });
let fails = 0;
const check = (ok, what) => { console.log((ok ? 'ok    ' : 'FEHLER ') + what); if (!ok) fails++; };

/* kleiner Server für den Hauptordner, mit Range-Anfragen wie GitHub Pages */
function serve(root) {
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.mp4': 'video/mp4', '.mp3': 'audio/mpeg', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.webmanifest': 'application/manifest+json' };
  const srv = http.createServer((req, res) => {
    const file = path.join(root, decodeURIComponent(req.url.split(/[?#]/)[0]));
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    const size = fs.statSync(file).size, type = types[path.extname(file)] || 'application/octet-stream';
    const m = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
    if (m) {
      const a = m[1] ? +m[1] : size - +m[2], b = m[1] && m[2] ? +m[2] : size - 1;
      res.writeHead(206, { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Content-Range': 'bytes ' + a + '-' + b + '/' + size, 'Content-Length': b - a + 1 });
      fs.createReadStream(file, { start: a, end: b }).pipe(res);
    } else {
      res.writeHead(200, { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Content-Length': size });
      fs.createReadStream(file).pipe(res);
    }
  });
  return new Promise(ok => srv.listen(0, '127.0.0.1', () => ok(srv)));
}

(async () => {
  const srv = process.env.URL ? null : await serve(path.join(__dirname, '..'));
  const BASE = process.env.URL || 'http://127.0.0.1:' + srv.address().port + '/';
  const DE = process.env.DE_URL || BASE + 'de/';
  const launch = gesture => chromium.launch(Object.assign({ headless: true, args: ['--autoplay-policy=' + (gesture ? 'user-gesture-required' : 'no-user-gesture-required')] }, process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}));
  const errors = [];
  const watch = p => p.on('pageerror', e => errors.push(e.message));
  const vid = p => p.evaluate(() => { const v = document.querySelector('.introvid video'); return v ? { src: (v.currentSrc || v.src).split('/').pop(), muted: v.muted, paused: v.paused, t: v.currentTime } : null; });
  const sw = p => p.locator('.introvid .musicsw');
  const on = l => l.getAttribute('aria-checked').then(a => a === 'true');
  const waitFor = async (p, fn, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await fn()) return true; await p.waitForTimeout(100); } return false; };
  const playing = (p, ms = 4000) => waitFor(p, async () => { const v = await vid(p); return v && !v.paused && v.t > 0.3; }, ms);
  const store = p => p.evaluate(() => localStorage.getItem('pp_intro_music'));

  /* ---------- Ton erlaubt (wie nach einem Klick auf der Seite) ---------- */
  let browser = await launch(false);
  let ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  let page = await ctx.newPage(); watch(page);

  console.log('== Teil 1, Ton erlaubt');
  await page.goto(BASE + 'index.html');
  check(await playing(page), 'Intro von Teil 1 läuft');
  let v = await vid(page);
  check(v.src === 'intro.mp4' && !v.muted, 'mit Musik und Ton: ' + JSON.stringify(v));
  check(await sw(page).isVisible() && await on(sw(page)), 'Schalter „Musique“ im Intro sichtbar und an');
  check((await sw(page).innerText()).trim() === 'Musique', 'Beschriftung: ' + (await sw(page).innerText()).trim());
  check(await page.locator('.introvid .snd').isHidden(), 'ohne Sperre kein Knopf „Son“');
  await page.screenshot({ path: SHOT + '01_teil1_mit_musik.png' });
  await sw(page).click(); await page.waitForTimeout(200);
  v = await vid(page);
  check(v.muted && !v.paused, 'Musik aus: Teil 1 läuft stumm weiter');
  check(!(await on(sw(page))) && await store(page) === '0', 'Schalter aus, gemerkt (pp_intro_music = 0)');
  check(await page.locator('.introvid .snd').isHidden(), 'ohne Musik kein Knopf „Son“ (Teil 1 hat sonst keinen Ton)');
  await page.screenshot({ path: SHOT + '02_teil1_ohne_musik.png' });
  await sw(page).click(); await page.waitForTimeout(200);
  v = await vid(page);
  check(!v.muted && await on(sw(page)) && await store(page) === '1', 'wieder an: Musik zu hören');
  await sw(page).click(); await page.waitForTimeout(100);
  await page.click('.introvid .skip'); await page.waitForTimeout(1100);
  check(await page.locator('.introvid').count() === 0 && await page.locator('#start').isVisible(), '„Passer l\'intro“ führt ins Startmenü');
  check(!(await on(page.locator('#btn-music'))), 'Startmenü: Schalter zeigt „aus“');
  await page.screenshot({ path: SHOT + '03_startmenue_aus.png' });

  console.log('== Einstellung bleibt beim nächsten Laden');
  await page.reload();
  check(await playing(page), 'Intro läuft wieder');
  v = await vid(page);
  check(v.muted && !(await on(sw(page))), 'von Anfang an ohne Musik: ' + JSON.stringify(v));
  await page.click('.introvid .skip'); await page.waitForTimeout(1100);
  await page.click('#btn-music'); await page.waitForTimeout(100);
  check(await on(page.locator('#btn-music')) && await store(page) === '1', 'Startmenü: Schalter wieder an');
  await page.click('#btn-intro');
  check(await playing(page), '„Revoir l\'intro“ spielt das Intro');
  v = await vid(page);
  check(!v.muted && await on(sw(page)), '… mit Musik');
  await page.click('.introvid .skip'); await page.waitForTimeout(1100);

  console.log('== Teil 2');
  await page.evaluate(() => { localStorage.setItem('pp_partie2', '1'); localStorage.setItem('pp_intro_music', '0'); });
  await page.reload();
  check(await playing(page), 'Intro von Teil 2 läuft');
  v = await vid(page);
  check(v.src === 'intro_teil2.mp4' && v.muted, 'Teil 2 ohne Musik stumm: ' + JSON.stringify(v));
  await sw(page).click(); await page.waitForTimeout(200);
  v = await vid(page);
  check(!v.muted && v.src === 'intro_teil2.mp4', 'Teil 2 mit Musik');
  await page.click('.introvid .skip'); await page.waitForTimeout(1100);

  console.log('== Teil 3: Fassung ohne Musik mit Nowaks Stimme');
  await page.evaluate(() => { localStorage.setItem('pp_partie3', '1'); localStorage.setItem('pp_intro_music', '1'); });
  await page.reload();
  check(await playing(page), 'Intro von Teil 3 läuft');
  v = await vid(page);
  check(v.src === 'intro_teil3.mp4' && !v.muted, 'Teil 3 mit Musik: ' + JSON.stringify(v));
  await waitFor(page, async () => (await vid(page)).t > 2.2, 4000);
  const t0 = (await vid(page)).t;
  await sw(page).click();
  const held = await page.locator('.introvid .ihold').count();
  check(held === 1, 'beim Wechsel: Standbild über dem Video');
  check(await playing(page) && await waitFor(page, async () => (await vid(page)).src === 'intro_teil3_ohne_musik.mp4', 2000), 'wechselt auf intro_teil3_ohne_musik.mp4');
  await page.waitForTimeout(250);
  v = await vid(page);
  check(!v.muted && !v.paused, 'ohne Musik mit Ton (Stimme), läuft weiter');
  check(Math.abs(v.t - t0) < 1.2 && v.t >= t0 - 0.1, 'an derselben Stelle weiter: vorher ' + t0.toFixed(2) + ' s, jetzt ' + v.t.toFixed(2) + ' s');
  check(await waitFor(page, async () => await page.locator('.introvid .ihold').count() === 0, 2000), 'Standbild wieder weg');
  await page.screenshot({ path: SHOT + '04_teil3_ohne_musik.png' });
  const t1 = (await vid(page)).t;
  await sw(page).click(); await page.waitForTimeout(400);
  v = await vid(page);
  check(v.src === 'intro_teil3.mp4' && !v.muted && !v.paused && v.t >= t1 - 0.1, 'wieder an: zurück auf die Fassung mit Musik, bei ' + v.t.toFixed(2) + ' s');
  await sw(page).click(); await page.waitForTimeout(100);
  check(await waitFor(page, () => page.locator('.introvid.titled').count().then(n => n === 1), 12000), 'Video endet, der Titel erscheint');
  check(await page.locator('.introvid .ictl').isHidden(), 'unter dem Titel keine Schalter');
  await page.waitForTimeout(4500);
  await page.reload();
  check(await playing(page), 'nächstes Laden: Intro von Teil 3 läuft');
  v = await vid(page);
  check(v.src === 'intro_teil3_ohne_musik.mp4' && !v.muted, 'gleich mit der Fassung ohne Musik: ' + JSON.stringify(v));
  await page.click('.introvid .skip'); await page.waitForTimeout(1100);

  if (!BASE.startsWith('file:')) {   // Dateien lassen sich nur über einen Server abfangen
    console.log('== Teil 3: Fassung ohne Musik fehlt');
    await page.route('**/intro_teil3_ohne_musik.mp4', r => r.fulfill({ status: 404, body: '' }));
    await page.reload();
    check(await playing(page, 5000), 'Intro läuft trotzdem');
    v = await vid(page);
    check(v.src === 'intro_teil3.mp4' && v.muted, 'statt dessen die Fassung mit Musik, stumm: ' + JSON.stringify(v));
    check(await page.locator('.introvid .snd').isHidden(), 'kein Knopf „Son“');
    await page.unroute('**/intro_teil3_ohne_musik.mp4');
    await page.click('.introvid .skip'); await page.waitForTimeout(1100);
  }

  console.log('== Deutsche Fassung');
  await page.goto(DE + 'index.html');
  check(await playing(page), 'Intro der deutschen Fassung läuft');
  v = await vid(page);
  check(v.src === 'intro.mp4' && v.muted && !(await on(sw(page))), 'gleiche Einstellung wie die französische Seite (ohne Musik)');
  check((await sw(page).innerText()).trim() === 'Musik', 'Beschriftung: ' + (await sw(page).innerText()).trim());
  await sw(page).click(); await page.waitForTimeout(200);
  check(!(await vid(page)).muted && await store(page) === '1', 'Musik an');
  await page.click('.introvid .skip'); await page.waitForTimeout(1100);
  check((await page.locator('#btn-music').innerText()).trim() === 'Musik' && await on(page.locator('#btn-music')), 'Startmenü: Schalter „Musik“, an');
  await page.screenshot({ path: SHOT + '05_de_startmenue.png' });
  await browser.close();

  /* ---------- Ton gesperrt (erster Aufruf ohne Klick, wie in echten Browsern) ---------- */
  browser = await launch(true);
  ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  page = await ctx.newPage(); watch(page);
  console.log('== Ton gesperrt: Teil 1');
  await page.goto(BASE + 'index.html');
  check(await playing(page), 'Intro läuft stumm');
  v = await vid(page);
  check(v.muted && await page.locator('.introvid .snd').innerText() === '🔇 Son' && await on(sw(page)), 'Knopf „🔇 Son“, Musik-Schalter an');
  await page.screenshot({ path: SHOT + '06_gesperrt_teil1.png' });
  await page.click('.introvid .snd'); await page.waitForTimeout(200);
  check(!(await vid(page)).muted && await page.locator('.introvid .snd').innerText() === '🔊 Son', '„Son“ schaltet den Ton ein');
  await sw(page).click(); await page.waitForTimeout(200);
  check((await vid(page)).muted && await page.locator('.introvid .snd').isHidden(), 'Musik aus: stumm, „Son“ verschwindet');
  await page.click('.introvid .skip'); await page.waitForTimeout(1100);
  await page.reload();
  check(await playing(page), 'nächstes Laden: Intro läuft');
  check((await vid(page)).muted && await page.locator('.introvid .snd').isHidden() && !(await on(sw(page))), 'ohne Musik: stumm, kein „Son“, Schalter aus');
  await sw(page).click(); await page.waitForTimeout(300);
  v = await vid(page);
  check(!v.muted && !v.paused, 'Schalter an: Musik zu hören (der Klick erlaubt den Ton)');

  console.log('== Ton gesperrt: Teil 3 ohne Musik');
  await page.evaluate(() => { localStorage.setItem('pp_partie3', '1'); localStorage.setItem('pp_intro_music', '0'); });
  await page.reload();
  check(await playing(page), 'Intro von Teil 3 läuft');
  v = await vid(page);
  check(v.src === 'intro_teil3_ohne_musik.mp4' && v.muted, 'Fassung ohne Musik, gesperrt stumm');
  check(await page.locator('.introvid .snd').isVisible(), 'Knopf „Son“ für die Stimme');
  await page.click('.introvid .snd'); await page.waitForTimeout(200);
  v = await vid(page);
  check(!v.muted && v.src === 'intro_teil3_ohne_musik.mp4', '„Son“: Stimme ohne Musik');
  await page.click('.introvid .skip'); await page.waitForTimeout(1100);
  await browser.close();

  /* ---------- Darstellung: Knöpfe überdecken sich nicht ---------- */
  browser = await launch(true);
  const sizes = [['computer', { width: 1280, height: 720 }], ['handy_hoch', { width: 375, height: 667 }, true], ['handy_390', { width: 390, height: 844 }, true], ['handy_412', { width: 412, height: 915 }, true], ['handy_schmal', { width: 320, height: 568 }, true], ['handy_quer', { width: 740, height: 360 }, true]];
  for (const lang of ['', 'de']) for (const [name, vp, mobile] of sizes) {
    ctx = await browser.newContext({ viewport: vp, isMobile: !!mobile, hasTouch: !!mobile, deviceScaleFactor: 1 });
    page = await ctx.newPage(); watch(page);
    await page.goto((lang ? DE : BASE) + 'index.html');
    await playing(page);
    const box = s => page.locator(s).boundingBox();
    const a = await box('.introvid .ictl'), b = await box('.introvid .skip');
    const apart = a && b && (a.x + a.width <= b.x || b.y + b.height <= a.y || a.y + a.height <= b.y);
    const inside = a && b && a.x >= 0 && b.x + b.width <= vp.width && a.y + a.height <= vp.height;
    check(apart && inside, (lang ? 'de ' : 'fr ') + name + ': Schalter, „Son“ und „Passer“ nebeneinander im Bild');
    await page.screenshot({ path: SHOT + '07_' + (lang ? 'de_' : 'fr_') + name + '.png' });
    if (name === 'handy_hoch') {
      await page.click('.introvid .skip'); await page.waitForTimeout(1100);
      await page.locator('#btn-music').scrollIntoViewIfNeeded();
      await page.screenshot({ path: SHOT + '08_' + (lang ? 'de_' : 'fr_') + 'startmenue_handy.png', fullPage: true });
    }
    await ctx.close();
  }
  await browser.close();
  if (srv) srv.close();

  check(errors.length === 0, 'keine Skriptfehler' + (errors.length ? ': ' + errors.join(' | ') : ''));
  console.log(fails ? fails + ' Fehler' : 'alles in Ordnung');
  process.exit(fails ? 1 : 0);
})();
