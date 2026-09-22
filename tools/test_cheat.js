const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', 'www');
const srv = http.createServer((req, res) => { let p = path.join(root, decodeURIComponent(req.url.split('?')[0])); if (p.endsWith('/') || p.endsWith(path.sep)) p += 'index.html'; fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); } else { res.writeHead(200, { 'Content-Type': { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png' }[path.extname(p)] || 'text/plain' }); res.end(d); } }); }).listen(5191);
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 412, height: 915 } }); const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('http://localhost:5191/'); await page.waitForTimeout(300);
  // 1) секретное меню: 10 тапов по счётчику монет
  for (let i = 0; i < 10; i++) { await page.click('#coins'); await page.waitForTimeout(80); }
  await page.waitForTimeout(300);
  console.log('меню:', (await page.$eval('#modal-root', el => el.innerText)).replace(/\n+/g, ' | ').slice(0, 110));
  await page.screenshot({ path: 'tools/shots/cheat.png' });
  const before = await page.evaluate(() => Games.state().coins);
  await page.click('text=+10000'); await page.waitForTimeout(200);
  console.log('монет было', before, 'стало', await page.evaluate(() => Games.state().coins));
  await page.click('text=Закрыть'); await page.waitForTimeout(200);
  // 2) пропуск уровня в игре
  for (const id of ['nonogram', 'wow', 'filword', 'chmodash']) {
    await page.evaluate(i => Games.open(Games.list.find(g => g.id === i)), id); await page.waitForTimeout(500);
    const mb = await page.$('#modal-root .btn.primary'); if (mb) { await mb.click(); await page.waitForTimeout(400); }
    const has = await page.$('.skip-btn');
    if (!has) { console.log(id, '— кнопки пропуска нет'); continue; }
    const lvlBefore = await page.evaluate(i => JSON.stringify({ l: Games.state().games[i + '_lvl'], o: Games.state().games[i], d: Games.state().games.dash_done }), id);
    await page.click('.skip-btn'); await page.waitForTimeout(250);
    await page.click('#modal-root .btn.gold'); await page.waitForTimeout(700);
    const lvlAfter = await page.evaluate(i => JSON.stringify({ l: Games.state().games[i + '_lvl'], o: Games.state().games[i], d: Games.state().games.dash_done }), id);
    console.log(id, 'до:', lvlBefore.slice(0, 60), 'после:', lvlAfter.slice(0, 60), '| монет:', await page.evaluate(() => Games.state().coins));
  }
  await page.screenshot({ path: 'tools/shots/skip.png' });
  console.log('errors:', errs.length ? errs.join(' | ') : 'none'); await b.close(); srv.close();
})();
