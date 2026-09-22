const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', 'www');
const srv = http.createServer((req, res) => { let p = path.join(root, decodeURIComponent(req.url.split('?')[0])); if (p.endsWith('/') || p.endsWith(path.sep)) p += 'index.html'; fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); } else { res.writeHead(200, { 'Content-Type': { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png' }[path.extname(p)] || 'text/plain' }); res.end(d); } }); }).listen(5185);
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 412, height: 915 } }); const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('http://localhost:5185/'); await page.evaluate(() => Games.open(Games.list.find(g => g.id === 'clicker'))); await page.waitForTimeout(400);
  for (let i = 0; i < 25; i++) { await page.click('.clk-coin'); }
  await page.waitForTimeout(300); await page.screenshot({ path: 'tools/shots/clicker1.png' });
  // даём денег и покупаем
  await page.evaluate(() => { const st = Games.state(); st.games.clicker2.bank = 1e9; st.games.clicker2.total = 1e9; });
  await page.click('text=Улучшения'); await page.waitForTimeout(300);
  for (const k of [0,1]) { const ups = await page.$$('.clk-item'); if (ups[k]) await ups[k].click().catch(()=>{}); }
  await page.click('text=Здания'); await page.waitForTimeout(3500);
  for (let i = 0; i < 4; i++) { const items = await page.$$('.clk-item'); if (items[i]) await items[i].click().catch(()=>{}); await page.waitForTimeout(150); }
  await page.waitForTimeout(500); await page.screenshot({ path: 'tools/shots/clicker2.png' });
  await page.click('text=Награды'); await page.waitForTimeout(400); await page.screenshot({ path: 'tools/shots/clicker3.png' });
  await page.click('text=Статистика'); await page.waitForTimeout(400);
  console.log(await page.$eval('.clk-list', el => el.innerText.split('\n').slice(0, 10).join(' | ')));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none'); await b.close(); srv.close();
})();
