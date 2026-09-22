const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', 'www');
const srv = http.createServer((req, res) => { let p = path.join(root, decodeURIComponent(req.url.split('?')[0])); if (p.endsWith('/') || p.endsWith(path.sep)) p += 'index.html'; fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); } else { res.writeHead(200, { 'Content-Type': { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css' }[path.extname(p)] || 'text/plain' }); res.end(d); } }); }).listen(5177);
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 412, height: 915 } }); const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('http://localhost:5177/'); await page.evaluate(() => Games.open(Games.list.find(g => g.id === 'chmoknight'))); await page.waitForTimeout(500);
  // клавиатурой: бегаем по комнатам и стреляем 12 секунд
  for (let i = 0; i < 8; i++) { const k = ['ArrowDown', 'ArrowRight', 'ArrowRight', 'ArrowRight', 'ArrowRight', 'ArrowRight', 'ArrowRight', 'ArrowRight'][i]; await page.keyboard.down(k); await page.keyboard.down(' '); await page.waitForTimeout(i ? 3500 : 1800); console.log(JSON.stringify(await page.evaluate(() => window.__ck()))); if (i === 1) await page.screenshot({ path: 'tools/shots/knight2.png' }); await page.keyboard.up(k); await page.keyboard.up(' '); }
  await page.screenshot({ path: 'tools/shots/knight.png' });
  console.log(await page.evaluate(() => document.querySelector('#modal-root').innerText.split(String.fromCharCode(10)).join(' | ') || 'alive')); console.log('errors:', errs.length ? errs.join(' | ') : 'none'); await b.close(); srv.close();
})();
