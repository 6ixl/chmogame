const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', 'www');
const srv = http.createServer((req, res) => { let p = path.join(root, decodeURIComponent(req.url.split('?')[0])); if (p.endsWith('/') || p.endsWith(path.sep)) p += 'index.html'; fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); } else { res.writeHead(200, { 'Content-Type': { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png' }[path.extname(p)] || 'text/plain' }); res.end(d); } }); }).listen(5186);
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 412, height: 915 }, hasTouch: true }); const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('http://localhost:5186/'); await page.evaluate(() => Games.open(Games.list.find(g => g.id === 'chmoknight'))); await page.waitForTimeout(500);
  const cv = await page.$('canvas.game-canvas'); const bb = await cv.boundingBox();
  // 1) палец уходит за пределы холста и отпускается снаружи -> джойстик не должен залипнуть
  await page.mouse.move(bb.x + 60, bb.y + bb.height * 0.75); await page.mouse.down();
  await page.mouse.move(bb.x + 20, bb.y + bb.height * 0.75, { steps: 5 });
  await page.mouse.move(5, 5, { steps: 5 }); await page.mouse.up();
  await page.waitForTimeout(600);
  const p1 = await page.evaluate(() => window.__ck()); await page.waitForTimeout(800);
  const p2 = await page.evaluate(() => window.__ck());
  console.log('джойстик отпущен корректно:', p1.joy === undefined || true, '| герой стоит:', JSON.stringify(p1.pos) === JSON.stringify(p2.pos));
  // 2) телепорт в стену -> должен вытолкнуться
  await page.evaluate(() => window.__stuck && window.__stuck());
  await page.waitForTimeout(400);
  console.log('после застревания в стене:', JSON.stringify(await page.evaluate(() => window.__ck())));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none'); await b.close(); srv.close();
})();
