const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', 'www');
const srv = http.createServer((req, res) => { let p = path.join(root, decodeURIComponent(req.url.split('?')[0])); if (p.endsWith('/') || p.endsWith(path.sep)) p += 'index.html'; fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); } else { res.writeHead(200, { 'Content-Type': { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png' }[path.extname(p)] || 'text/plain' }); res.end(d); } }); }).listen(5187);
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 412, height: 915 } }); const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('http://localhost:5187/');
  await page.evaluate(() => { const st = Games.state(); st.coins = 900; });
  await page.evaluate(() => Games.open(Games.list.find(g => g.id === 'cardarena'))); await page.waitForTimeout(400);
  // колода
  await page.click('text=Колода'); await page.waitForTimeout(400);
  console.log('карт в колоде-экране:', (await page.$$('.ca-pick')).length);
  await page.screenshot({ path: 'tools/shots/arena_deck.png' });
  await page.click('text=Готово'); await page.waitForTimeout(300);
  // арены + покупка
  await page.click('text=Арены'); await page.waitForTimeout(400);
  await page.screenshot({ path: 'tools/shots/arena_list.png' });
  const locked = await page.$$('.ca-arena.lock'); console.log('закрытых арен:', locked.length);
  if (locked.length) { await locked[0].click(); await page.waitForTimeout(300); await page.click('text=Купить за'); await page.waitForTimeout(500); }
  console.log('монет после покупки:', await page.evaluate(() => Games.state().coins), '| арена:', await page.evaluate(() => Games.state().games.ca_arena));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none'); await b.close(); srv.close();
})();
