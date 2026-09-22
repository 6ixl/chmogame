const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', 'www');
const srv = http.createServer((req, res) => { let p = path.join(root, decodeURIComponent(req.url.split('?')[0])); if (p.endsWith('/') || p.endsWith(path.sep)) p += 'index.html'; fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); } else { res.writeHead(200, { 'Content-Type': { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png' }[path.extname(p)] || 'text/plain' }); res.end(d); } }); }).listen(5190);
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 412, height: 915 } }); const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('http://localhost:5190/');
  await page.evaluate(() => { Games.state().coins = 800; const C = window.ClickerCore; C.S.bank = 1e12; C.S.total = 1e12; C.save(); });
  await page.evaluate(() => Games.open(Games.list.find(g => g.id === 'clicker'))); await page.waitForTimeout(600);
  await page.click('#modal-root .btn.primary').catch(() => {});
  // комбо: быстрые тапы
  for (let i = 0; i < 12; i++) { await page.click('.clk-coin'); await page.waitForTimeout(90); }
  console.log('комбо:', await page.evaluate(() => window.ClickerCore.S.maxCombo.toFixed(2)));
  // магазин
  await page.click('text=🛒'); await page.waitForTimeout(400);
  await page.screenshot({ path: 'tools/shots/clk_shop.png' });
  const items = await page.$$('.clk-item'); console.log('позиций в магазине:', items.length);
  await items[0].click(); await page.waitForTimeout(300);              // ежедневный бонус
  await page.click('#modal-root .btn.primary').catch(() => {});
  const shopItems = await page.$$('.clk-item'); await shopItems[2].click(); await page.waitForTimeout(400);  // ускоритель
  console.log('монет после покупки:', await page.evaluate(() => Games.state().coins), '| буст:', await page.evaluate(() => window.ClickerCore.shopBoost(window.ClickerCore.S)));
  // миссии
  await page.click('text=🎯'); await page.waitForTimeout(400);
  console.log('миссии:', await page.$eval('.clk-list', el => el.innerText.split('\n').slice(0, 6).join(' | ')));
  await page.screenshot({ path: 'tools/shots/clk_miss.png' });
  // здания: новые
  await page.click('text=🏗'); await page.waitForTimeout(400);
  console.log('зданий в списке:', (await page.$$('.clk-item')).length);
  console.log('errors:', errs.length ? errs.join(' | ') : 'none'); await b.close(); srv.close();
})();
