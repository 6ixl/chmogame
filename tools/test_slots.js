const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', 'www');
const srv = http.createServer((req, res) => { let p = path.join(root, decodeURIComponent(req.url.split('?')[0])); if (p.endsWith('/') || p.endsWith(path.sep)) p += 'index.html'; fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); } else { res.writeHead(200, { 'Content-Type': { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png' }[path.extname(p)] || 'text/plain' }); res.end(d); } }); }).listen(5189);
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 412, height: 915 } }); const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('http://localhost:5189/');
  await page.evaluate(() => { Games.state().coins = 500; Games.open(Games.list.find(g => g.id === 'slots')); }); await page.waitForTimeout(400);
  const cv = await page.$('canvas.game-canvas'); const bb = await cv.boundingBox();
  const spinAt = { x: bb.x + bb.width / 2, y: bb.y + bb.height * (380 / 560) };
  for (let round = 0; round < 3; round++) {
    await page.mouse.click(spinAt.x, spinAt.y);
    for (const t of [900, 1500, 2100, 2700, 3400]) { }
    await page.waitForTimeout(1000); const s1 = await page.evaluate(() => window.__slots && window.__slots());
    await page.waitForTimeout(800); const s2 = await page.evaluate(() => window.__slots && window.__slots());
    await page.waitForTimeout(900); const s3 = await page.evaluate(() => window.__slots && window.__slots());
    await page.waitForTimeout(1200); const s4 = await page.evaluate(() => window.__slots && window.__slots());
    console.log('раунд', round + 1, JSON.stringify(s1), JSON.stringify(s2), JSON.stringify(s3), JSON.stringify(s4));
    if (round === 0) await page.screenshot({ path: 'tools/shots/slots_spin.png' });
    await page.waitForTimeout(400);
  }
  console.log('errors:', errs.length ? errs.join(' | ') : 'none'); await b.close(); srv.close();
})();
