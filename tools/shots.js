const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', 'www');
const srv = http.createServer((req, res) => { let p = path.join(root, decodeURIComponent(req.url.split('?')[0])); if (p.endsWith('/') || p.endsWith(path.sep)) p += 'index.html'; fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); } else { res.writeHead(200, { 'Content-Type': { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css' }[path.extname(p)] || 'text/plain' }); res.end(d); } }); }).listen(5175);
(async () => {
  const b = await chromium.launch(); const page = await (await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true })).newPage();
  await page.goto('http://localhost:5175/'); await page.waitForTimeout(300);
  const ids = process.argv.slice(2);
  const shots = [];
  for (const id of ids) { await page.evaluate(id => Games.open(Games.list.find(g => g.id === id)), id); await page.waitForTimeout(500); const btn = await page.$('#modal-root .btn.primary'); if (btn) { await btn.click(); await page.waitForTimeout(300); } await page.mouse.click(206, 500); await page.waitForTimeout(200); shots.push(await page.screenshot()); }
  // склеиваем горизонтально через canvas в странице
  const b64 = shots.map(s => s.toString('base64'));
  await page.setContent('<canvas id=c></canvas>'); await page.setViewportSize({ width: 412 * ids.length, height: 915 });
  await page.evaluate(async b64 => { const c = document.getElementById('c'); c.width = 412 * b64.length; c.height = 915; const ctx = c.getContext('2d'); for (let i = 0; i < b64.length; i++) { const img = new Image(); img.src = 'data:image/png;base64,' + b64[i]; await img.decode(); ctx.drawImage(img, i * 412, 0); } }, b64);
  const c = await page.$('#c'); await c.screenshot({ path: 'tools/shots/combo.png' });
  await b.close(); srv.close();
})();
