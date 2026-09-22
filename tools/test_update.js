const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', 'www');
const srv = http.createServer((req, res) => { let p = path.join(root, decodeURIComponent(req.url.split('?')[0])); if (p.endsWith('/') || p.endsWith(path.sep)) p += 'index.html'; fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); } else { res.writeHead(200, { 'Content-Type': { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css' }[path.extname(p)] || 'text/plain' }); res.end(d); } }); }).listen(5176);
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await page.goto('http://localhost:5176/'); await page.evaluate(() => { APP.version = '1.2'; });
  await page.click('#btn-settings'); await page.click('text=Проверить обновления'); await page.waitForSelector('#modal-root .modal', { timeout: 15000 });
  console.log(await page.$eval('#modal-root .modal', el => el.innerText.replace(/\n+/g, ' | ')));
  await b.close(); srv.close();
})();
