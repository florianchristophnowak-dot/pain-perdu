const { chromium } = require('playwright');
/* Rate-Test für Teil 3 « Le voyageur de 1900 »: spielt wie jemand ohne Französisch, der nur klickt und rät, und prüft die
   Bremsen gegen Raten und Durchklicken (wie tools/raten.js für Teil 1), dazu die neuen Bausteine von Teil 3.
   Voraussetzungen wie bei tools/playthrough-voyageur.js (lokaler Server auf Port 8765).
   Aufruf: node tools/raten-voyageur.js   (Umgebung: URL=... bis einschließlich voyageur/, CHROMIUM=Pfad, optional) */
const BASE = process.env.URL || 'http://127.0.0.1:8765/voyageur/';
let fails = 0;
const check = (ok, what) => { console.log((ok ? 'ok    ' : 'FEHLER ') + what); if (!ok) fails++; };

(async () => {
  const browser = await chromium.launch(Object.assign({ headless: true }, process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}));
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const modalText = async () => (await page.locator('#modal-body').innerText()).replace(/\s+/g, ' ');
  const fbText = async () => (await page.locator('#modal-body .feedback').innerText()).replace(/\s+/g, ' ');
  const jump = async (scene, node) => { await page.evaluate(([s, n]) => { document.getElementById('modal').hidden = true; document.getElementById('dialogue').classList.remove('muted'); PP.enterScene(s, false); PP.goNode(n); }, [scene, node]); await page.waitForTimeout(300); };
  const reset = () => page.evaluate(() => { const S = PP.S; S.tries = {}; S.pause = {}; S.pauses = {}; S.tempo = {}; PP.save(); });
  const valider = () => page.locator('#modal-body button', { hasText: 'Valider' }).first();
  const locked = async () => (await valider().isDisabled()) && await page.locator('#modal-body .feedback .countdown').isVisible();
  const pauseLeft = () => page.evaluate(() => Math.round((Math.max(0, ...Object.values(PP.S.pause)) - Date.now()) / 1000));
  async function tapIn(sel, i, x, y) { const b = await page.locator('#modal-body ' + sel).nth(i).boundingBox(); await page.mouse.click(b.x + b.width * x / 100, b.y + b.height * y / 100); await page.waitForTimeout(60); }

  await page.goto(BASE + 'index.html?test=1&listen=1');
  await page.fill('#p1', 'Rateria');
  await page.locator('#btn-start').click(); await page.waitForTimeout(300);
  await page.evaluate(() => { const S = PP.S; ['telephone', 'photo_a', 'photo_b', 'photo_c', 'fiche_vente', 'fiche_orsay', 'programme', 'photo_baguette', 'photos_entieres', 'fiche_chloe'].forEach(i => S.inv.includes(i) || S.inv.push(i)); PP.save(); });

  /* 1. Karte erst nach R1 */
  await page.evaluate(() => { document.getElementById('modal').hidden = true; });
  await page.locator('#btn-map').click(); await page.waitForTimeout(150);
  check(!(await page.locator('.modal.map').isVisible()), 'Vor R1 bleibt die Karte zu');

  /* 2. Antworten im Gespräch stehen jedes Mal anders */
  const orders = new Set();
  for (let i = 0; i < 6; i++) {
    await jump('invalides', 'I05');
    await page.locator('#dialogue button', { hasText: 'Continuer' }).first().click(); await page.waitForTimeout(120);
    orders.add((await page.locator('#dialogue .choice').allInnerTexts()).join(' | '));
  }
  check(orders.size > 1, 'Antworten bei der Bouquiniste werden gemischt (' + orders.size + ' Reihenfolgen in 6 Runden)');

  /* 3. Hörtext: weiter erst nach dem Anhören; die Aufgabe danach zeigt die Antworten erst nach dem Hören */
  await jump('pont', 'P03a');
  check(await page.locator('#modal-body .bar button', { hasText: 'Continuer' }).isDisabled(), 'Hörtext der Assistentin: „Continuer“ gesperrt, bis die Aufnahme ganz gelaufen ist');
  await page.evaluate(() => { if ('speechSynthesis' in window) speechSynthesis.cancel(); }); await page.waitForTimeout(500);
  await page.evaluate(() => { PP.S.heard = {}; PP.S.transcripts = {}; PP.save(); });
  await jump('pont', 'P03');
  check(!(await page.locator('#modal-body .area').isVisible()) && (await modalText()).includes("Écoutez jusqu'au bout"), 'P03: die Sätze erscheinen erst nach dem Hören');

  /* 4. Hilfe öffnet erst nach einem ersten Versuch; Lückentext raten: nur die Anzahl, nach drei Fehlversuchen Pause, auch nach Neuladen */
  await page.evaluate(() => { PP.S.heard.au_marcel = true; PP.save(); });
  await jump('invalides', 'I02');
  check(await page.locator('#modal-body .btn.aide').isDisabled(), 'Hilfe ist vor dem ersten Versuch zu');
  const sels = page.locator('#modal-body .gaptext select');
  await valider().click(); await page.waitForTimeout(100);
  check((await fbText()).includes('partout'), 'Leere Auswahl zählt nicht als Versuch');
  const bad = async () => { for (let i = 0; i < await sels.count(); i++) { const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean)); const ans = await sels.nth(i).evaluate(s => s.dataset.answer); await sels.nth(i).selectOption(opts.find(o => o !== ans)); } };
  await bad();
  for (let k = 1; k <= 3; k++) {
    await valider().click(); await page.waitForTimeout(150);
    if (k === 1) {
      check((await fbText()).includes('Juste :'), 'Rückmeldung nennt nur die Anzahl: ' + (await fbText()).slice(0, 80));
      check(await page.locator('#modal-body .btn.aide').isEnabled(), 'Nach dem ersten Versuch hilft Marie');
    }
  }
  check(await locked(), 'Nach dem dritten Fehlversuch: Sperre mit Countdown');
  await page.evaluate(() => document.getElementById('btn-map').click()); await page.waitForTimeout(150);
  check(await page.locator('#modal').evaluate(m => m.classList.contains('task')), 'Karte lässt sich während der Aufgabe nicht öffnen');
  await page.reload(); await page.waitForTimeout(400);
  await page.locator('#btn-resume').click(); await page.waitForTimeout(400);
  check(await locked(), 'Pause gilt auch nach Neuladen weiter');
  await page.evaluate(() => { const S = PP.S; Object.keys(S.pause).forEach(k => { S.pause[k] = Date.now() - 1; }); PP.save(); });
  await page.waitForTimeout(1300);
  check(await valider().isEnabled(), 'Nach der Pause geht es weiter');
  await bad();
  for (let k = 0; k < 3; k++) { await valider().click(); await page.waitForTimeout(120); }
  check(await pauseLeft() > 100, 'Zweite Pause dauert zwei Minuten (' + await pauseLeft() + ' s)');

  /* 5. Tempobremse: drei schnelle Fehlversuche in der Auswahl */
  await reset();
  await jump('orsay', 'O04');
  const opt = t => page.locator('#modal-body .btn.opt', { hasText: t }).first();
  await opt('La couverture est vieille').click(); await opt('Toutes les pages').click();
  await valider().click(); await page.waitForTimeout(50);
  await opt('Toutes les pages').click(); await opt('Lucien a fait').click(); await valider().click(); await page.waitForTimeout(50);
  await opt('Lucien a fait').click(); await opt('Toutes les pages').click(); await valider().click(); await page.waitForTimeout(150);
  check(await locked() && (await fbText()).includes('Lis d\'abord') || (await fbText()).includes('tu devines'), 'Drei schnelle Fehlversuche: Pause (' + (await fbText()).slice(0, 60) + ')');

  /* 6. Ja-Nein-Fragen an den Händler: nach der dritten bedient er einen anderen Kunden */
  await reset();
  await jump('orsay', 'O03');
  for (const q of ["L'album est vieux ?", 'Les photos sont vieilles ?', 'Ce sont des photos originales ?']) { await page.locator('#modal-body .askq', { hasText: q }).click(); await page.waitForTimeout(80); }
  check((await fbText()).includes("j'ai un client") && await pauseLeft() > 50, 'Drei Ja-Nein-Fragen: Delmas macht eine Minute Pause');

  /* 7. Bildlupe mit zwei Bildern: Fehlklicks und der Hintergrund bremsen */
  await reset();
  await jump('invalides', 'I03');
  for (let i = 0; i < 4; i++) await tapIn('.compare .lz', 0, 5 + i * 3, 10);
  for (let i = 0; i < 4; i++) await tapIn('.compare .lz', 1, 70 + i * 5, 85);
  await page.waitForTimeout(150);
  check((await fbText()).includes('Regarde d\'abord') && await pauseLeft() > 10, 'Acht Fehlklicks (auch auf den Tisch): 20 Sekunden Pause');

  /* 8. Ausschnitt und Vollbild: Zuordnungen raten sperrt wie überall */
  await reset();
  await jump('stand6', 'C01');
  const rows = page.locator('#modal-body .rrow select');
  for (let k = 0; k < 3; k++) {
    for (let i = 0; i < 3; i++) await rows.nth(i).selectOption({ label: ['P19', 'P16', 'P17'][(i + k) % 3] });
    await valider().click(); await page.waitForTimeout(150);
  }
  check(await locked(), 'C01: drei falsche Zuordnungen, dann Pause');
  check(!(await page.locator('#modal-body .fullgrid').count()), 'C01: die Ränder bleiben zu, solange die Zuordnung nicht stimmt');

  /* 9. Beweise: ohne die Fiche des Händlers zählt es als Fehlversuch */
  await reset();
  await jump('finale', 'F01');
  const prow = page.locator('#modal-body .prow');
  const proof = async (i, item, sent) => { await prow.nth(i).locator('select').nth(0).selectOption({ label: item }); await prow.nth(i).locator('select').nth(1).selectOption({ label: sent }); };
  await proof(0, 'les photos entières', 'Ce sont les mêmes photos. Le vendeur a coupé les bords.');
  await proof(1, 'la fiche de Chloé', 'Chloé a pris les photos en septembre 2025.');
  await proof(2, 'la photo de la baguette', 'La baguette réparée : la photo B est de 2025.');
  await valider().click(); await page.waitForTimeout(120);
  check((await page.evaluate(() => PP.S.tries.F01)) === 1 && (await fbText()).includes('sa fiche'), 'F01 ohne Fiche de vente: Fehlversuch mit Hinweis auf den Pflichtbeleg');

  /* 10. Freier Text: andere Sprache, falsches Thema, Einfügen */
  await reset();
  await jump('stand6', 'W1');
  const ta = page.locator('#modal-body textarea');
  await ta.fill('Chloé hat die Fotos im September 2025 gemacht. Paris 1900 ist der Titel der Serie und kein Datum. Wir haben die ganzen Fotos und den Zettel von Chloé.'); await valider().click(); await page.waitForTimeout(120);
  check((await fbText()).includes('En français'), 'W1 auf Deutsch wird abgelehnt');
  await ta.fill("Je m'appelle Max et j'ai quinze ans. Le week-end, je joue au foot avec mes amis et le soir, je regarde la télé ou je lis un livre dans ma chambre."); await valider().click(); await page.waitForTimeout(120);
  check((await fbText()).includes('Parle des photos'), 'W1 ohne Bezug zur Geschichte wird abgelehnt');
  await ta.fill('');
  await ta.evaluate(t => { const dt = new DataTransfer(); dt.setData('text/plain', 'copié depuis un traducteur'); t.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })); });
  await page.waitForTimeout(100);
  check((await ta.inputValue()) === '' && (await fbText()).includes('copier-coller'), 'Einfügen ist gesperrt');

  /* 11. Bei den Abfragen nennt der Hinweis den Fundort, nie die Antwort */
  const leaks = await page.evaluate(() => {
    const out = [];
    ['R1', 'R2', 'R3', 'R4'].forEach(id => window.GAME.nodes[id].task.fields.forEach(f => {
      const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      const w = norm(f.where || '');
      f.answers.forEach(a => { const n = norm(a).replace(/^(en|le|la|a|c'est) /, ''); if (n.length > 2 && w.includes(n)) out.push(id + ': ' + a); });
    }));
    return out;
  });
  check(!leaks.length, 'Hinweise der Abfragen verraten keine Antwort ' + leaks.join(', '));

  check(!errors.length, 'keine Skriptfehler ' + errors.join(' | '));
  console.log(fails ? fails + ' Prüfung(en) fehlgeschlagen' : 'Alle Prüfungen bestanden');
  await browser.close();
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('FAILED', e.message); process.exit(1); });
