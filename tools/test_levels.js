const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', 'www');
const srv = http.createServer((req, res) => { let p = path.join(root, decodeURIComponent(req.url.split('?')[0])); if (p.endsWith('/') || p.endsWith(path.sep)) p += 'index.html'; fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); } else { res.writeHead(200, { 'Content-Type': { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css' }[path.extname(p)] || 'text/plain' }); res.end(d); } }); }).listen(5174);
(async () => {
  const b = await chromium.launch(); const page = await (await b.newContext({ viewport: { width: 412, height: 915 }, hasTouch: true, isMobile: true })).newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('http://localhost:5174/'); await page.waitForTimeout(300);
  const ids = await page.evaluate(() => Games.list.filter(g => g.progress).map(g => g.id));
  for (const lvl of [40, 120]) {
    await page.evaluate(lvl => { const st = Games.state(); for (const g of Games.list) st.games[g.id + '_lvl'] = lvl; st.games.filword = { lvl }; st.games.memory_lvl = lvl; st.games.wow = { lvl: Math.min(lvl, 419), done: [] }; }, lvl);
    for (const id of ids) {
      const t0 = Date.now();
      await page.evaluate(id => Games.open(Games.list.find(g => g.id === id)), id);
      await page.waitForTimeout(100);
      const ms = Date.now() - t0; const info = await page.evaluate(() => document.querySelector('#screen .stat')?.textContent);
      if (ms > 400 || errs.length || !info) console.log(`lvl ${lvl} ${id}: ${ms}ms ${info || 'NO-STAT'} ${errs.length ? 'ERR ' + errs.join('|') : ''}`); errs.length = 0;
    }
  }
  await page.evaluate(() => { Games.open(Games.list.find(g => g.id === 'wow')); }); await page.waitForTimeout(200);
  await page.screenshot({ path: 'tools/shots/hub2.png', fullPage: false });
  await b.close(); srv.close();
})();
