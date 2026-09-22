const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', 'www');
const srv = http.createServer((req, res) => { let p = path.join(root, decodeURIComponent(req.url.split('?')[0])); if (p.endsWith('/') || p.endsWith(path.sep)) p += 'index.html'; fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); } else { res.writeHead(200, { 'Content-Type': { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png' }[path.extname(p)] || 'text/plain' }); res.end(d); } }); }).listen(5188);
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 412, height: 915 } }); const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('http://localhost:5188/'); await page.waitForTimeout(300);
  // ставим ферму, чтобы был доход
  await page.evaluate(() => { const C = window.ClickerCore; C.S.bank = 1e6; C.S.b = { farm: 10 }; C.save(); });
  console.log('доход/с:', await page.evaluate(() => window.ClickerCore.fmt(window.ClickerCore.cps(window.ClickerCore.S))));
  // 1) симулируем, что приложение было закрыто час назад
  await page.evaluate(() => { const C = window.ClickerCore; C.S.bank = 0; C.S.idle = 0; C.save(); C.S.last = Date.now() - 3600 * 1000; });
  await page.evaluate(() => window.ClickerCore.settle());
  console.log('за час в фоне начислено:', await page.evaluate(() => window.ClickerCore.fmt(window.ClickerCore.S.bank)), '(ожидалось ~1.7M)');
  // 2) доход идёт, пока играем в другую игру
  await page.evaluate(() => Games.open(Games.list.find(g => g.id === 'snake')));
  const before = await page.evaluate(() => window.ClickerCore.S.bank);
  await page.evaluate(() => { window.ClickerCore.S.last = Date.now() - 60000; });
  await page.waitForTimeout(300); await page.evaluate(() => window.ClickerCore.settle());
  const after = await page.evaluate(() => window.ClickerCore.S.bank);
  console.log('пока в другой игре, прирост за минуту:', await page.evaluate(v => window.ClickerCore.fmt(v), after - before));
  // 3) хаб показывает доход
  await page.evaluate(() => Games.showHub()); await page.waitForTimeout(300);
  const card = await page.evaluate(() => [...document.querySelectorAll('.card')].find(c => c.textContent.includes('Монетный кликер'))?.textContent.replace(/\s+/g, ' '));
  console.log('карточка в хабе:', card);
  // 4) вход в кликер -> показ накопленного
  await page.evaluate(() => { window.ClickerCore.S.idle = 50000; });
  await page.evaluate(() => Games.open(Games.list.find(g => g.id === 'clicker'))); await page.waitForTimeout(700);
  console.log('модалка:', (await page.$eval('#modal-root', el => el.innerText)).replace(/\n/g, ' | ').slice(0, 120));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none'); await b.close(); srv.close();
})();
