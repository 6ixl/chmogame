const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', 'www');
const srv = http.createServer((req, res) => { let p = path.join(root, decodeURIComponent(req.url.split('?')[0])); if (p.endsWith('/') || p.endsWith(path.sep)) p += 'index.html'; fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); } else { res.writeHead(200, { 'Content-Type': { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png' }[path.extname(p)] || 'text/plain' }); res.end(d); } }); }).listen(5183);
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 412, height: 915 } }); const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('http://localhost:5183/');
  // эмулируем нативный плагин Updater
  await page.evaluate(() => {
    APP.version = '1.0';
    const lis = [];
    window.Capacitor = { Plugins: { Updater: {
      canInstall: async () => ({ value: true }),
      openInstallSettings: async () => {},
      addListener: async (n, cb) => { lis.push(cb); return { remove() {} }; },
      download: async () => { for (let i = 0; i <= 10; i++) { lis.forEach(c => c({ loaded: i * 470000, total: 4700000 })); await new Promise(r => setTimeout(r, 60)); } window.__dl = true; return { path: '/x/update.apk', size: 4700000 }; },
      install: async () => { window.__inst = true; }
    } } };
  });
  await page.click('#btn-settings'); await page.click('text=Проверить обновления'); await page.waitForSelector('#modal-root .modal', { timeout: 15000 });
  console.log('модалка:', (await page.$eval('#modal-root .modal', el => el.innerText)).split('\n').join(' | ').slice(0, 160));
  await page.click('text=Обновить'); await page.waitForTimeout(500);
  await page.screenshot({ path: 'tools/shots/update.png' });
  await page.waitForTimeout(1500);
  console.log('скачано:', await page.evaluate(() => !!window.__dl), 'установщик запущен:', await page.evaluate(() => !!window.__inst));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none'); await b.close(); srv.close();
})();
