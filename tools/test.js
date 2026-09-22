const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', 'www');
const srv = http.createServer((req, res) => {
  let p = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (p.endsWith(path.sep) || p.endsWith('/')) p += 'index.html';
  fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); } else { const ext = path.extname(p); res.writeHead(200, { 'Content-Type': { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css' }[ext] || 'application/octet-stream' }); res.end(d); } });
}).listen(5173);
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message)); page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.goto('http://localhost:5173/'); await page.waitForTimeout(500);
  const n = await page.evaluate(() => Games.list.length); console.log('games:', n);
  fs.mkdirSync(path.join(__dirname, 'shots'), { recursive: true });
  await page.screenshot({ path: 'tools/shots/hub.png' });
  for (let i = 0; i < n; i++) {
    const id = await page.evaluate(i => { Games.open(Games.list[i]); return Games.list[i].id; }, i);
    await page.waitForTimeout(700);
    // dismiss difficulty modals by picking first option
    const btn = await page.$('#modal-root .modal .row .btn.primary, #modal-root .modal .btn');
    if (btn) { await btn.click(); await page.waitForTimeout(500); }
    await page.mouse.click(206, 500); await page.waitForTimeout(300);
    await page.screenshot({ path: `tools/shots/${id}.png` });
    console.log(id, errs.length ? errs.join(' | ') : 'ok'); errs.length = 0;
  }
  await b.close(); srv.close();
})();
