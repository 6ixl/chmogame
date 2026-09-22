const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', 'www');
const srv = http.createServer((req, res) => { let p = path.join(root, decodeURIComponent(req.url.split('?')[0])); if (p.endsWith('/') || p.endsWith(path.sep)) p += 'index.html'; fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); } else { res.writeHead(200, { 'Content-Type': { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png' }[path.extname(p)] || 'text/plain' }); res.end(d); } }); }).listen(5182);
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, permissions: [] });
  const A = await ctx.newPage(), B = await ctx.newPage(); const errs = [];
  [A, B].forEach((p, i) => p.on('pageerror', e => errs.push('p' + i + ': ' + e.message)));
  for (const p of [A, B]) { await p.goto('http://localhost:5182/'); await p.evaluate(() => Games.open(Games.list.find(g => g.id === 'cardarena'))); await p.waitForTimeout(300); }
  await A.click('text=Бой с другом'); await A.waitForTimeout(200); await A.click('text=Создать игру'); await A.waitForTimeout(3200);
  const offer = await A.$eval('#modal-root textarea', el => el.value);
  console.log('offer len', offer.length);
  await B.click('text=Бой с другом'); await B.waitForTimeout(200); await B.click('text=Подключиться'); await B.waitForTimeout(300);
  await B.fill('#modal-root textarea', offer); await B.click('text=Далее'); await B.waitForTimeout(3200);
  const answer = await B.$eval('#modal-root textarea', el => el.value); console.log('answer len', answer.length);
  const tas = await A.$$('#modal-root textarea'); await tas[1].fill(answer); await A.click('text=Подключить'); await A.waitForTimeout(2500);
  const aState = await A.evaluate(() => !!document.querySelector('canvas.game-canvas') && !document.querySelector('#modal-root .modal'));
  const bState = await B.evaluate(() => !!document.querySelector('canvas.game-canvas') && !document.querySelector('#modal-root .modal'));
  console.log('battle started A:', aState, 'B:', bState);
  if (aState && bState) { // хост ставит карту, гость должен увидеть юнит
    const cards = await A.$$('.ca-card:not(.off)'); if (cards.length) { await cards[0].click(); const bb = await (await A.$('canvas.game-canvas')).boundingBox(); await A.mouse.click(bb.x + bb.width * 0.3, bb.y + bb.height * 0.75); }
    await A.waitForTimeout(1500);
    console.log('HOST', JSON.stringify(await A.evaluate(() => window.__ca())));
    console.log('GUEST', JSON.stringify(await B.evaluate(() => window.__ca())));
    // гость ставит карту -> хост должен увидеть
    const gc = await B.$$('.ca-card:not(.off)'); if (gc.length) { await gc[0].click(); const bb2 = await (await B.$('canvas.game-canvas')).boundingBox(); await B.mouse.click(bb2.x + bb2.width * 0.7, bb2.y + bb2.height * 0.8); }
    await B.waitForTimeout(1500);
    console.log('HOST2', JSON.stringify(await A.evaluate(() => window.__ca())));
    console.log('GUEST2', JSON.stringify(await B.evaluate(() => window.__ca())));
    await A.screenshot({ path: 'tools/shots/mp_host.png' }); await B.screenshot({ path: 'tools/shots/mp_guest.png' });
  }
  console.log('errors:', errs.length ? errs.join(' | ') : 'none'); await b.close(); srv.close();
})();
