const { chromium } = require('playwright');
/* Test für den Audioplayer der Hörtexte (js/audioplayer.js) in Teil 1 und Teil 2:
   Pause und Weiter, 5 Sekunden zurück und vor, Tempo 100–80 % (bleibt auf dem Gerät), „gehört“ erst nach ganzem Hören,
   Grenze beim Telefonat (zweimal, ohne Spulen), Hilfe „Écoute encore“, Darstellung auf Computer und Handy.
   Voraussetzungen wie bei tools/playthrough.js (lokaler Server im Hauptordner auf Port 8765).
   Aufruf: node tools/hoeren.js   (Umgebung: URL=... bis einschließlich des Hauptordners, SHOT_DIR=..., CHROMIUM=Pfad, optional)
   Dauer etwa eine Minute, weil die Aufnahmen wirklich laufen. */
const fs = require('fs');
const BASE = process.env.URL || 'http://127.0.0.1:8765/';
const SHOT = (process.env.SHOT_DIR || 'test-shots') + '/hoeren/';
fs.mkdirSync(SHOT, { recursive: true });
let fails = 0;
const check = (ok, what) => { console.log((ok ? 'ok    ' : 'FEHLER ') + what); if (!ok) fails++; };

(async () => {
  const browser = await chromium.launch(Object.assign({ headless: true, args: ['--autoplay-policy=no-user-gesture-required'] }, process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}));
  const errors = [];
  async function open(path, viewport) {
    const page = await browser.newPage({ viewport: viewport || { width: 1200, height: 900 } });
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(BASE + path);
    await page.fill('#p1', 'Ada');
    await page.locator('#btn-start').click(); await page.waitForTimeout(300);
    return page;
  }
  const jump = (page, scene, node) => page.evaluate(([s, n]) => { document.getElementById('modal').hidden = true; document.getElementById('dialogue').classList.remove('muted'); PP.enterScene(s, false); PP.goNode(n); }, [scene, node]);
  const media = (page, prop) => page.evaluate(p => { const a = document.querySelector('#modal-body .ap').ppAudio.media; return a[p]; }, prop);
  const setMedia = (page, prop, v) => page.evaluate(([p, v]) => { document.querySelector('#modal-body .ap').ppAudio.media[p] = v; }, [prop, v]);
  const cont = page => page.locator('#modal-body .bar button.primary');
  const playBtn = page => page.locator('#modal-body .ap-play').first();
  const waitFor = async (page, fn, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await fn()) return true; await page.waitForTimeout(150); } return false; };

  /* ---------- Teil 1: Hörtext der Assistentin (V02b, knapp 10 s) ---------- */
  let page = await open('index.html?intro=0&test=1&listen=1');
  await page.evaluate(() => { try { localStorage.removeItem('pp_audio_rate'); } catch (e) {} PP.S.heard = {}; PP.save(); });
  await jump(page, 'lampes', 'V02b');
  await page.waitForTimeout(150);
  const ap = page.locator('#modal-body .ap');
  check(await ap.count() === 1, 'Hörtext-Fenster hat einen Player');
  check(await page.locator('#modal-body .ap-back').count() === 1 && await page.locator('#modal-body .ap-fwd').count() === 1, 'Knöpfe 5 s zurück und 5 s vor sind da');
  check((await page.locator('#modal-body .ap-rate').allInnerTexts()).join(' ').replace(/\s/g, '') === '100%95%90%85%80%', 'Tempo-Stufen 100/95/90/85/80 %');
  check(await page.locator('#modal-body .ap-rate.on').innerText() === '100 %', 'Tempo steht anfangs auf 100 %');
  check(await cont(page).isDisabled(), '„Continuer“ ist gesperrt, solange nicht gehört');
  check(await waitFor(page, async () => (await ap.getAttribute('class')).includes(' on'), 3000), 'Aufnahme startet von selbst');
  await page.screenshot({ path: SHOT + '01_computer.png' });

  /* Pause und Weiter */
  await playBtn(page).click(); await page.waitForTimeout(100);
  check((await playBtn(page).innerText()).includes('Reprendre'), 'Pause: Knopf heißt jetzt „Reprendre“');
  const t1 = await media(page, 'currentTime'); await page.waitForTimeout(700);
  check(Math.abs(await media(page, 'currentTime') - t1) < 0.05 && await media(page, 'paused'), 'Pause hält die Aufnahme an');
  await playBtn(page).click(); await page.waitForTimeout(700);
  check(await media(page, 'currentTime') > t1 + 0.3, 'Reprendre spielt an derselben Stelle weiter');

  /* Tempo */
  await page.locator('#modal-body .ap-rate', { hasText: '80' }).click(); await page.waitForTimeout(100);
  check(await media(page, 'playbackRate') === 0.8, 'Tempo 80 %: Wiedergabe läuft mit 0,8');
  check(await page.evaluate(() => localStorage.getItem('pp_audio_rate')) === '0.8', 'Tempo wird auf dem Gerät gemerkt');
  check(await media(page, 'preservesPitch') !== false, 'Tonhöhe bleibt gleich (preservesPitch)');
  await page.locator('#modal-body .ap-rate', { hasText: '100' }).click();

  /* Vorspulen bis ans Ende reicht nicht: „Continuer“ bleibt zu, der Player sagt, dass etwas fehlt */
  await playBtn(page).click(); await page.waitForTimeout(100);   // Pause
  await page.evaluate(() => { const p = document.querySelector('#modal-body .ap').ppAudio; p.media.currentTime = 1.2; });   // Stand: 1,2 s gehört
  const before = await media(page, 'currentTime');
  await page.locator('#modal-body .ap-fwd').click(); await page.waitForTimeout(80);
  check(Math.abs(await media(page, 'currentTime') - before - 5) < 0.3, '„5 s vor“ springt 5 Sekunden weiter');
  await page.locator('#modal-body .ap-back').click(); await page.waitForTimeout(80);
  check(Math.abs(await media(page, 'currentTime') - before) < 0.3, '„5 s zurück“ springt 5 Sekunden zurück');
  await page.locator('#modal-body .ap-fwd').click(); await page.waitForTimeout(80);
  await playBtn(page).click();   // weiter ab 6,2 s bis zum Ende
  check(await waitFor(page, async () => await media(page, 'ended'), 8000), 'Aufnahme läuft bis zum Ende');
  await page.waitForTimeout(150);
  check(await cont(page).isDisabled(), 'Nach Vorspulen: „Continuer“ bleibt gesperrt');
  check(await page.locator('#modal-body .ap-note').isVisible(), 'Hinweis: ' + (await page.locator('#modal-body .ap-note').innerText()));
  check((await playBtn(page).innerText()).includes('Rejouer'), 'Am Ende heißt der Knopf „Rejouer“');
  /* Den übersprungenen Teil nachhören: Balken an den Anfang ziehen */
  await page.evaluate(() => { const s = document.querySelector('#modal-body .ap-seek'); s.value = '0'; s.dispatchEvent(new Event('input', { bubbles: true })); s.dispatchEvent(new Event('change', { bubbles: true })); });
  await playBtn(page).click();
  check(await waitFor(page, async () => !(await cont(page).isDisabled()), 9000), 'Übersprungenen Teil nachgehört: „Continuer“ ist frei');
  check(!(await page.locator('#modal-body .ap-note').isVisible()), 'Hinweis ist wieder weg');
  check(await page.evaluate(() => PP.S.heard.au_assistante === true), 'Spielstand: Hörtext gilt als gehört');

  /* Aufgabe danach: Player wartet, Tempo von vorhin gilt */
  await page.locator('#modal-body .ap-rate', { hasText: '85' }).click();
  await cont(page).click(); await page.waitForTimeout(300);
  check(await page.locator('#modal-body .ap').count() === 1, 'Aufgabe V02bt hat den Player');
  check((await playBtn(page).innerText()).includes('Rejouer') && !(await page.locator('#modal-body .ap').getAttribute('class')).includes(' on'), 'In der Aufgabe startet nichts von selbst, Knopf „Rejouer“');
  check((await page.locator('#modal-body .ap-rate.on').innerText()).startsWith('85'), 'Tempo 85 % gilt auch im nächsten Player');
  await page.evaluate(() => document.getElementById('modal-close').click()); await page.waitForTimeout(100);

  /* Hilfe „Écoute encore“ (M04b, Stufe 2) spielt den Player der Aufgabe von vorn */
  await jump(page, 'montmartre', 'M04b'); await page.waitForTimeout(300);
  const sels = page.locator('.gaptext select');
  for (let i = 0; i < await sels.count(); i++) { const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean)); const ans = await sels.nth(i).evaluate(s => s.dataset.answer); await sels.nth(i).selectOption(opts.find(o => o !== ans)); }
  const valider = page.locator('#modal-body button', { hasText: 'Valider' }).first();
  await valider.click(); await page.waitForTimeout(100); await valider.click(); await page.waitForTimeout(100);
  await page.locator('#modal-body .aide').click(); await page.waitForTimeout(100);
  await page.locator('#modal-body .aide').click(); await page.waitForTimeout(400);
  check((await page.locator('#modal-body .ap').getAttribute('class')).includes(' on'), 'Hilfe „Écoute encore“ startet den Player der Aufgabe');
  await page.screenshot({ path: SHOT + '02_aufgabe_hilfe.png' });
  await page.close();

  /* ---------- Handy: hoch und quer ---------- */
  for (const [name, vp] of [['handy_hoch', { width: 390, height: 844 }], ['handy_quer', { width: 844, height: 390 }], ['handy_schmal', { width: 320, height: 640 }]]) {
    page = await open('index.html?intro=0&test=1&listen=1', vp);
    await jump(page, 'lampes', 'V02b'); await page.waitForTimeout(600);
    const box = await page.locator('#modal-body .ap').boundingBox();
    const inner = await page.locator('.modal-inner').boundingBox();
    check(box && inner && box.x >= inner.x - 1 && box.x + box.width <= inner.x + inner.width + 1, name + ': Player passt ins Fenster');
    check(await page.evaluate(() => { const a = document.querySelector('#modal-body .ap'); return a.scrollWidth <= a.clientWidth + 1 && document.documentElement.scrollWidth <= window.innerWidth; }), name + ': nichts ragt seitlich heraus');
    const tap = await page.evaluate(() => Array.from(document.querySelectorAll('#modal-body .ap button')).filter(b => b.offsetParent).map(b => b.getBoundingClientRect()).every(r => r.height >= 36 && r.width >= 36));
    check(tap, name + ': alle Knöpfe mindestens 36 px groß');
    await page.screenshot({ path: SHOT + '03_' + name + '.png' });
    await page.close();
  }

  /* ---------- Teil 2: Telefonat (E03, zweimal hören, ohne Spulen) ---------- */
  page = await open('guide-fantome/index.html?test=1&listen=1');
  await page.evaluate(() => { PP.S.heard = {}; PP.save(); });
  await jump(page, 'eiffel', 'E03'); await page.waitForTimeout(150);
  check(await page.locator('#modal-body .ap-back').count() === 0 && await page.locator('#modal-body .ap-fwd').count() === 0, 'Telefonat: keine Spul-Knöpfe');
  check(await page.locator('#modal-body .ap-seek').isDisabled(), 'Telefonat: Balken zeigt nur den Fortschritt');
  check(await page.locator('#modal-body .ap-rate').count() === 5, 'Telefonat: Tempo lässt sich trotzdem wählen');
  check(await waitFor(page, async () => (await page.locator('#modal-body .ap').getAttribute('class')).includes(' on'), 3000), 'Telefonat startet von selbst');
  await playBtn(page).click(); await page.waitForTimeout(100);
  check((await playBtn(page).innerText()).includes('Reprendre'), 'Telefonat: Pause geht');
  await playBtn(page).click(); await page.waitForTimeout(100);
  await setMedia(page, 'playbackRate', 4);   // nur im Test: schneller durch (Spulen gibt es hier nicht)
  check(await waitFor(page, async () => await media(page, 'ended'), 6000), 'Erstes Hören zu Ende');
  check(!(await playBtn(page).isDisabled()), 'Zweites Hören ist noch frei: ' + (await page.locator('#modal-body .tools .hint').innerText()));
  await playBtn(page).click(); await page.waitForTimeout(200);
  await setMedia(page, 'playbackRate', 4);
  check(await waitFor(page, async () => await media(page, 'ended'), 6000), 'Zweites Hören zu Ende');
  await page.waitForTimeout(100);
  check(await playBtn(page).isDisabled(), 'Nach zweimal ist der Knopf gesperrt: ' + (await page.locator('#modal-body .tools .hint').innerText()));
  await page.screenshot({ path: SHOT + '04_telefonat.png' });
  await page.close();

  /* E04 hat keinen eigenen Player (noReplay): Linos Hilfe « Écoute encore le téléphone » bringt einen mit, ohne Spulen.
     In der Lehrkraft-Ansicht ist die Hilfe sofort offen (Code-Prüfung über die Prüfsumme aus js/prof.js). */
  page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => { try { sessionStorage.setItem('pp_prof', '19b5x18skxu'); } catch (e) {} });
  await page.goto(BASE + 'guide-fantome/index.html?mode=prof&test=1');
  await page.fill('#p1', 'Ada'); await page.locator('#btn-start').click(); await page.waitForTimeout(300);
  await page.evaluate(() => { PP.S.helpUsed = {}; PP.save(); });
  await jump(page, 'eiffel', 'E04'); await page.waitForTimeout(200);
  check(await page.locator('#modal-body .ap').count() === 0, 'E04: kein eigener Player (noReplay)');
  await page.locator('#modal-body .aide').click(); await page.waitForTimeout(100);
  await page.locator('#modal-body .aide').click(); await page.waitForTimeout(500);
  check(await page.locator('#modal-body .help-bubble .ap').count() === 1, 'E04: Hilfe Stufe 2 zeigt einen Player');
  check(await page.locator('#modal-body .help-bubble .ap-back').count() === 0, 'E04: Player in der Hilfe ohne Spulen');
  check((await page.locator('#modal-body .help-bubble .ap').getAttribute('class')).includes(' on'), 'E04: das Telefonat läuft');
  await page.screenshot({ path: SHOT + '04b_hilfe_telefonat.png' });
  await page.locator('#modal-body .aide').click(); await page.waitForTimeout(300);
  check(await page.evaluate(() => !document.querySelector('#modal-body .help-bubble .ap')), 'E04: nächste Hilfestufe ersetzt den Player');
  await page.close();

  /* Teil 3: Player auch dort (ohne Aufnahme liest der Browser vor, dann ohne Balken) */
  page = await open('voyageur/index.html?test=1&listen=1');
  await jump(page, 'pont', 'P03a'); await page.waitForTimeout(800);
  check(await page.locator('#modal-body .ap').count() === 1, 'Teil 3: Hörtext hat den Player' + ((await page.locator('#modal-body .ap').getAttribute('class')).includes('tts') ? ' (ohne Aufnahme: Vorlesen)' : ''));
  check((await page.locator('#modal-body .ap-note').innerText()).startsWith('Vous'), 'Teil 3: Hinweis in der vous-Form');
  await page.screenshot({ path: SHOT + '05_teil3.png' });
  await page.close();

  check(errors.length === 0, 'keine Skriptfehler ' + errors.join(' | '));
  await browser.close();
  console.log(fails ? fails + ' Prüfung(en) fehlgeschlagen' : 'Alle Prüfungen bestanden');
  process.exit(fails ? 1 : 0);
})();
