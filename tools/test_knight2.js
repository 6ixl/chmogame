const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', 'www');
const srv = http.createServer((req, res) => { let p = path.join(root, decodeURIComponent(req.url.split('?')[0])); if (p.endsWith('/') || p.endsWith(path.sep)) p += 'index.html'; fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); } else { res.writeHead(200, { 'Content-Type': { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css' }[path.extname(p)] || 'text/plain' }); res.end(d); } }); }).listen(5178);
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 412, height: 915 } }); const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('http://localhost:5178/'); await page.evaluate(() => Games.open(Games.list.find(g => g.id === 'chmoknight'))); await page.waitForTimeout(400);
  const links = (await page.evaluate(() => window.__ck())).links; await page.evaluate(i => window.__tp(i), links[0]); await page.waitForTimeout(300);
  await page.keyboard.down(' ');
  for (let i = 0; i < 8; i++) { await page.waitForTimeout(1500); const s = await page.evaluate(() => window.__ck()); console.log('t', i, 'bullets', s.b, 'enemies', s.en, 'room', s.room); if (i === 1) await page.screenshot({ path: 'tools/shots/knight3.png' }); }
  console.log(await page.evaluate(() => document.querySelector('#modal-root').innerText.split(String.fromCharCode(10)).join(' | ') || 'alive'));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none'); await b.close(); srv.close();
})();
