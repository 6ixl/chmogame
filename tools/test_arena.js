const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', 'www');
const srv = http.createServer((req, res) => { let p = path.join(root, decodeURIComponent(req.url.split('?')[0])); if (p.endsWith('/') || p.endsWith(path.sep)) p += 'index.html'; fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); } else { res.writeHead(200, { 'Content-Type': { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png' }[path.extname(p)] || 'text/plain' }); res.end(d); } }); }).listen(5181);
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 412, height: 915 } }); const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('http://localhost:5181/'); await page.evaluate(() => Games.open(Games.list.find(g => g.id === 'cardarena'))); await page.waitForTimeout(400);
  await page.click('text=Бой с ботом'); await page.waitForTimeout(300);
  await page.click('#modal-root .btn.primary'); await page.waitForTimeout(800);
  // играем: тапаем карты и ставим юнитов
  for (let i = 0; i < 12; i++) {
    const cards = await page.$$('.ca-card:not(.off)');
    if (cards.length) { await cards[i % cards.length].click(); await page.waitForTimeout(120);
      const box = await page.$('canvas.game-canvas'); const bb = await box.boundingBox();
      await page.mouse.click(bb.x + bb.width * (0.25 + Math.random() * 0.5), bb.y + bb.height * (0.65 + Math.random() * 0.2)); }
    await page.waitForTimeout(1200);
    if (i === 5) await page.screenshot({ path: 'tools/shots/arena.png' });
  }
  console.log('errors:', errs.length ? errs.join(' | ') : 'none'); await b.close(); srv.close();
})();
