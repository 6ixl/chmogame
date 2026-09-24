/* Общий набор помощников для игр из пакетов 200+ */
(function () {
  const K = {};
  K.gridEl = (h, n, size, cls, rows) => h('div', { class: 'pz-grid ' + (cls || ''), style: `grid-template-columns:repeat(${n},${size}px);grid-auto-rows:${size}px` });
  K.cellSize = (screen, n, max) => Math.max(18, Math.floor(Math.min(screen.clientWidth - 30, max || 420) / n) - 3);
  K.stats = (api, id) => { const s = api.load(id + '_st', { w: 0, l: 0 }); return { s, win() { s.w++; api.store(id + '_st', s); api.best(id, s.w); }, lose() { s.l++; api.store(id + '_st', s); }, txt: () => `${s.w} · ${s.l}` }; };
  K.SUITS = ['♠', '♥', '♦', '♣']; K.RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  K.deck = (api, from) => api.shuffle(K.SUITS.flatMap(s => K.RANKS.map((r, v) => ({ r, s, v: v + 2 }))).filter(c => c.v >= (from || 2)));
  K.red = c => '♥♦'.includes(c.s);
  K.cardEl = (h, c, o) => { o = o || {}; return h('div', { class: 'card-face ' + (o.cls || ''), style: (c ? 'color:' + (K.red(c) ? '#f87171' : '#fff') + ';' : 'background:linear-gradient(135deg,#6d28d9,#0e7490);') + (o.style || ''), onclick: o.onclick }, c && !o.back ? c.r + c.s : ''); };
  K.pick = arr => arr[Math.floor(Math.random() * arr.length)];
  K.sleep = ms => new Promise(r => setTimeout(r, ms));
  K.norm = s => String(s).toLowerCase().replace(/ё/g, 'е');
  let _words;
  K.words = () => { if (!_words) { const all = (window.DICT && window.DICT.all) || []; _words = all.filter(w => /^[а-яё]+$/.test(w) && w.length >= 3); } return _words; };
  K.wordsLen = (a, b) => K.words().filter(w => w.length >= a && w.length <= (b || a));
  let _set; K.isWord = w => { if (!_set) _set = new Set(K.words().map(K.norm).concat(((window.DICT && window.DICT.fil) || []).map(K.norm))); return _set.has(K.norm(w)); };

  /* ---------- canvas ---------- */
  K.rr = (ctx, x, y, w, h, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); };
  K.circ = (ctx, x, y, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, 7); ctx.fill(); };
  K.ring = (ctx, x, y, r, c, w) => { ctx.strokeStyle = c; ctx.lineWidth = w || 2; ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, 7); ctx.stroke(); };
  K.line = (ctx, x1, y1, x2, y2, c, w) => { ctx.strokeStyle = c; ctx.lineWidth = w || 2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); };
  K.text = (ctx, t, x, y, size, c, align) => { ctx.fillStyle = c || '#fff'; ctx.font = 'bold ' + size + 'px sans-serif'; ctx.textAlign = align || 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t, x, y); };
  K.emoji = (ctx, e, x, y, size) => { ctx.font = size + 'px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(e, x, y); };
  K.bg = (ctx, W, H, c) => { ctx.fillStyle = c || '#171728'; ctx.fillRect(0, 0, W, H); };
  K.over = (api, id, score, title, div, reset, win) => { api.best(id, score); api.end({ win: !!win, title, reward: Math.floor(score / div), text: 'Счёт: ' + score, onAgain: reset }); };
  K.hit = (a, b, r) => Math.hypot(a.x - b.x, a.y - b.y) < r;
  K.clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------- викторина на время: gen(api, score) → {q, opts, ans, big} ---------- */
  K.quiz = function (o) {
    Games.register({ id: o.id, title: o.title, icon: o.icon, cat: o.cat || 'brain', desc: o.desc, bestLabel: 'Рекорд',
      mount(screen, api) {
        const { h } = api; let score, timeLeft, timer, hdr, busy, alive = true;
        function next() {
          if (!alive) return;
          const g = o.gen(api, score); const opts = g.opts; busy = false; screen.innerHTML = '';
          hdr = api.header(screen, [{ label: 'Счёт', value: score }, { label: '⏱', value: timeLeft }, { label: 'Рекорд', value: api.bestOf(o.id) || 0 }]);
          const q = typeof g.q === 'string' ? h('div', { style: 'font-size:' + (g.big || 34) + 'px;font-weight:800;text-align:center;line-height:1.3;max-width:94vw;word-break:break-word' }, g.q) : g.q;
          const cols = g.cols || (opts.length > 4 || opts.some(x => String(x).length > 14) ? 1 : 2);
          const btns = h('div', { style: `display:grid;grid-template-columns:repeat(${cols},1fr);gap:10px;width:min(92vw,360px)` });
          opts.forEach(opt => { const b = h('button', { class: 'btn', style: 'font-size:' + (g.optSize || 20) + 'px;padding:14px 8px', onclick: () => {
            if (busy) return; busy = true;
            if (opt === g.ans) { score++; api.sound('good'); api.vibrate(8); b.style.background = 'var(--green)'; if (score % 10 === 0) api.addCoins(3); setTimeout(next, 180); }
            else { api.sound('bad'); api.vibrate(40); b.style.background = 'var(--red)'; [...btns.children].forEach(x => { if (x.textContent === String(g.ans)) x.style.background = 'var(--green)'; }); timeLeft = Math.max(1, timeLeft - 3); hdr.set(1, timeLeft); setTimeout(next, 650); }
          } }, String(opt)); btns.append(b); });
          screen.append(h('div', { class: 'game-area', style: 'gap:26px' }, g.pre || null, q, btns));
        }
        function start() { score = 0; timeLeft = o.secs || 60; clearInterval(timer); timer = setInterval(() => { timeLeft--; if (hdr) hdr.set(1, Math.max(0, timeLeft)); if (timeLeft <= 0) { clearInterval(timer); api.best(o.id, score); api.end({ title: 'Время вышло', reward: Math.floor(score / (o.div || 2)), text: 'Верно: ' + score, onAgain: start }); } }, 1000); next(); }
        this.unmount = () => { alive = false; clearInterval(timer); }; start();
      } });
  };
  /* варианты ответа: правильный + 3 уникальных неправильных */
  K.opts = (api, ans, wrong, n) => { const w = [...new Set(wrong.filter(x => x !== ans && x != null))]; api.shuffle(w); return api.shuffle([ans, ...w.slice(0, (n || 4) - 1)]); };
  /* викторина по таблице пар [вопрос, ответ] */
  K.pairQuiz = (o) => K.quiz(Object.assign({}, o, { gen: (api) => { const P = o.data; const i = api.rand(0, P.length - 1); const rev = o.both && Math.random() < 0.5; const qa = rev ? 1 : 0, aa = rev ? 0 : 1; return { q: (o.prefix ? (rev ? o.prefixRev || o.prefix : o.prefix) : '') + P[i][qa], opts: K.opts(api, P[i][aa], P.map(p => p[aa])), ans: P[i][aa], big: o.big || 30, optSize: o.optSize }; } }));

  /* ---------- уровневая головоломка на клетках ---------- */
  K.levelGame = function (o) {
    Games.register({ id: o.id, title: o.title, icon: o.icon, cat: o.cat || 'puzzle', desc: o.desc, progress: api => 'Уровень ' + (api.level(o.id).lvl + 1),
      mount(screen, api) {
        const L = api.level(o.id); const self = this; let solved = false, cleanup = null;
        const play = () => { if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; } solved = false; o.play(ctl); };
        const ctl = { L, screen, api, h: api.h, alive: true,
          win(extra) { if (solved) return; solved = true; api.sound('win'); const lv = L.lvl; L.done(); setTimeout(() => ctl.alive && api.end({ title: 'Уровень ' + (lv + 1) + ' пройден!', reward: (o.reward || 6) + Math.floor(lv / 3), text: extra || '', again: 'Дальше', onAgain: play }), 350); },
          lose(t) { if (solved) return; solved = true; api.end({ win: false, title: t || 'Не получилось', onAgain: play }); },
          reset: play,
          top(items) { screen.innerHTML = ''; return api.header(screen, [{ label: 'Ур.', value: L.lvl + 1 }].concat(items || []).concat([{ btn: '↻', onClick: play }])); },
          get solved() { return solved; }, set unmount(f) { cleanup = f; } };
        self.unmount = () => { ctl.alive = false; if (cleanup) { try { cleanup(); } catch (e) {} } }; o.play(ctl);
      } });
  };
  window.Kit = K;
})();
