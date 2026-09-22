const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', 'www');
const srv = http.createServer((req, res) => { let p = path.join(root, decodeURIComponent(req.url.split('?')[0])); if (p.endsWith('/') || p.endsWith(path.sep)) p += 'index.html'; fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); } else { res.writeHead(200, { 'Content-Type': { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png' }[path.extname(p)] || 'text/plain' }); res.end(d); } }); }).listen(5180);
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 412, height: 915 } }); const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('http://localhost:5180/'); await page.evaluate(() => Games.open(Games.list.find(g => g.id === 'chmodash'))); await page.waitForTimeout(300);
  await page.click('#modal-root .btn.primary'); await page.waitForTimeout(300);
  // "играем": случайные прыжки 15 секунд
  for (let i = 0; i < 40; i++) { await page.keyboard.down(' '); await page.waitForTimeout(120 + Math.random() * 200); await page.keyboard.up(' '); await page.waitForTimeout(100 + Math.random() * 300); if (i === 6) await page.screenshot({ path: 'tools/shots/dash.png' }); }
  console.log(JSON.stringify(await page.evaluate(() => window.__dash())));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none'); await b.close(); srv.close();
})();
