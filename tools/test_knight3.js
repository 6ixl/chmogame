const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', 'www');
const srv = http.createServer((req, res) => { let p = path.join(root, decodeURIComponent(req.url.split('?')[0])); if (p.endsWith('/') || p.endsWith(path.sep)) p += 'index.html'; fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); } else { res.writeHead(200, { 'Content-Type': { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png' }[path.extname(p)] || 'text/plain' }); res.end(d); } }); }).listen(5179);
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 412, height: 915 } }); const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('http://localhost:5179/'); await page.evaluate(() => { Games.state().games.ck_max = 7; });
  await page.evaluate(() => Games.open(Games.list.find(g => g.id === 'chmoknight'))); await page.waitForTimeout(400);
  console.log('save after start:', !!(await page.evaluate(() => Games.state().games.ck_save)));
  await page.click('#btn-back'); await page.waitForTimeout(200); await page.evaluate(() => Games.open(Games.list.find(g => g.id === 'chmoknight'))); await page.waitForTimeout(400);
  console.log('menu:', (await page.$eval('#modal-root', el => el.innerText)).split('\n').filter(Boolean).join(' | '));
  await page.click('text=Выбор этажа'); await page.waitForTimeout(200); await page.click('.lvl >> nth=5'); await page.waitForTimeout(500);
  const s = await page.evaluate(() => window.__ck()); console.log('floor', s.floor, 'links', s.links);
  await page.evaluate(i => window.__tp(i), s.links[0]); await page.keyboard.down(' '); await page.waitForTimeout(4000);
  console.log(JSON.stringify(await page.evaluate(() => window.__ck()))); await page.screenshot({ path: 'tools/shots/knight4.png' });
  console.log('errors:', errs.length ? errs.join(' | ') : 'none'); await b.close(); srv.close();
})();
