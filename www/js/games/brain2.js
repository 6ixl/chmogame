/* Мозг и реакция */
(function () {
  const gridEl = (h, n, size) => h('div', { class: 'pz-grid', style: `grid-template-columns:repeat(${n},${size}px);grid-auto-rows:${size}px` });
  const cellSize = (screen, n, max) => Math.floor(Math.min(screen.clientWidth - 30, max || 420) / n) - 3;
  /* быстрая викторина на время: gen() → {q: element|string, opts: [], ans} */
  function quiz(id, title, icon, desc, secs, gen, rewardDiv) {
    Games.register({ id, title, icon, cat: 'brain', desc, bestLabel: 'Рекорд',
      mount(screen, api) {
        const { h } = api; let score, timeLeft, timer, hdr;
        function next() {
          const { q, opts, ans, big } = gen(api, score); screen.innerHTML = ''; hdr = api.header(screen, [{ label: 'Счёт', value: score }, { label: '⏱', value: timeLeft }]);
          screen.append(h('div', { class: 'game-area', style: 'gap:28px' }, typeof q === 'string' ? h('div', { style: 'font-size:' + (big || 36) + 'px;font-weight:800;text-align:center;line-height:1.3' }, q) : q,
            h('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:10px;width:min(90vw,340px)' }, opts.map(o => h('button', { class: 'btn', style: 'font-size:22px;padding:16px', onclick: () => { if (o === ans) { score++; api.sound('good'); if (score % 10 === 0) api.addCoins(3); } else { api.sound('bad'); api.vibrate(40); timeLeft = Math.max(1, timeLeft - 3); } next(); } }, o)))));
        }
        function start() { score = 0; timeLeft = secs; clearInterval(timer); timer = setInterval(() => { timeLeft--; hdr.set(1, timeLeft); if (timeLeft <= 0) { clearInterval(timer); api.best(id, score); api.end({ title: 'Время вышло', reward: Math.floor(score / (rewardDiv || 2)), text: 'Верно: ' + score, onAgain: start }); } }, 1000); next(); }
        this.unmount = () => clearInterval(timer); start();
      } });
  }
  const shuffleOpts = (api, ans, wrong) => api.shuffle([ans, ...[...new Set(wrong.filter(w => w !== ans))].slice(0, 3)]);

  quiz('sequence', 'Продолжи ряд', '➡️', 'Какое число следующее? Арифметика, геометрия, квадраты', 60, (api, score) => {
    const t = api.rand(0, 3); let seq, ans; const a = api.rand(1, 9), d = api.rand(2, 5 + score);
    if (t === 0) { seq = [0, 1, 2, 3].map(i => a + d * i); ans = a + d * 4; } else if (t === 1) { const r = api.rand(2, 3); seq = [0, 1, 2, 3].map(i => a * r ** i); ans = a * r ** 4; } else if (t === 2) { seq = [1, 2, 3, 4].map(i => (i + a) ** 2); ans = (5 + a) ** 2; } else { seq = [a, a + d, a + 2 * d + 1, a + 3 * d + 3]; ans = a + 4 * d + 6; }
    return { q: seq.join(', ') + ', ?', opts: shuffleOpts(api, ans, [ans + d, ans - d, ans + 1, ans - 2, ans + 3]), ans, big: 30 };
  });
  quiz('roman', 'Римские числа', '🏛', 'Переведи римское число в арабское', 60, (api, score) => {
    const toRoman = n => { const m = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]; let s = ''; for (const [v, r] of m) while (n >= v) { s += r; n -= v; } return s; };
    const n = api.rand(1, 20 + score * 10); return { q: toRoman(n), opts: shuffleOpts(api, n, [n + 1, n - 1, n + 4, n - 5, n + 10, n * 2]), ans: n, big: 44 };
  });
  quiz('binary', 'Двоичный код', '💻', 'Переведи двоичное число в десятичное', 60, (api, score) => { const n = api.rand(1, 7 + Math.min(120, score * 6)); return { q: n.toString(2), opts: shuffleOpts(api, n, [n + 1, n - 1, n + 2, n * 2, n + 4, n - 3].filter(x => x > 0)), ans: n, big: 40 }; });
  quiz('multiply', 'Таблица умножения', '✖️', 'Умножение на скорость', 60, api => { const a = api.rand(2, 9), b = api.rand(2, 9), ans = a * b; return { q: `${a} × ${b}`, opts: shuffleOpts(api, ans, [ans + a, ans - a, ans + b, ans - b, ans + 1, (a + 1) * b]), ans }; });
  quiz('compare', 'Что больше', '⚖️', 'Быстро выбери большее выражение', 45, (api, score) => { const mk = () => { const a = api.rand(1, 20 + score * 2), b = api.rand(1, 12); const t = api.rand(0, 2); return t === 0 ? [`${a} + ${b}`, a + b] : t === 1 ? [`${a} − ${b}`, a - b] : [`${b} × ${Math.max(1, Math.floor(a / 4))}`, b * Math.max(1, Math.floor(a / 4))]; }; let x = mk(), y = mk(); while (x[1] === y[1]) y = mk(); const ans = x[1] > y[1] ? x[0] : y[0]; return { q: 'Что больше?', opts: [x[0], y[0]], ans, big: 26 }; });
  quiz('count', 'Сосчитай', '🔢', 'Сколько нужных предметов на экране?', 60, (api, score) => { const E = ['🍎', '🍋', '🍇', '🥝']; const target = E[api.rand(0, 3)]; const n = api.rand(3, 6 + Math.min(10, score)); const items = Array.from({ length: n }, () => target); const total = n + api.rand(6, 12 + score); while (items.length < total) items.push(E[api.rand(0, 3)]); api.shuffle(items); return { q: window.Games.api.h('div', { style: 'font-size:30px;line-height:1.2;text-align:center;max-width:320px' }, `Сколько ${target}?`, window.Games.api.h('div', null, items.join(''))), opts: shuffleOpts(api, n, [n + 1, n - 1, n + 2, n - 2]), ans: n }; });
  quiz('evenodd', 'Чёт или нечет', '🔀', 'Чётное число или нечётное? Молниеносно', 30, (api, score) => { const n = api.rand(10, 100 + score * 20); const ans = n % 2 ? 'Нечётное' : 'Чётное'; return { q: String(n), opts: ['Чётное', 'Нечётное'], ans, big: 52 }; }, 3);
  quiz('clock', 'Который час', '🕰', 'Определи время по стрелкам', 60, (api, score) => {
    const hr = api.rand(1, 12), mn = score < 5 ? [0, 30][api.rand(0, 1)] : score < 12 ? [0, 15, 30, 45][api.rand(0, 3)] : api.rand(0, 11) * 5;
    const c = document.createElement('canvas'); c.width = c.height = 200; c.style.width = '180px'; const x = c.getContext('2d'); x.fillStyle = '#f1f1f8'; x.beginPath(); x.arc(100, 100, 95, 0, 7); x.fill(); x.fillStyle = '#111'; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; x.beginPath(); x.arc(100 + Math.sin(a) * 80, 100 - Math.cos(a) * 80, i % 3 ? 3 : 6, 0, 7); x.fill(); }
    const hand = (ang, len, w) => { x.strokeStyle = '#111'; x.lineWidth = w; x.lineCap = 'round'; x.beginPath(); x.moveTo(100, 100); x.lineTo(100 + Math.sin(ang) * len, 100 - Math.cos(ang) * len); x.stroke(); }; hand((hr % 12 + mn / 60) * Math.PI / 6, 50, 8); hand(mn * Math.PI / 30, 75, 4);
    const f = (h, m) => `${h}:${String(m).padStart(2, '0')}`; const ans = f(hr, mn); return { q: c, opts: shuffleOpts(api, ans, [f(hr % 12 + 1, mn), f(hr, (mn + 30) % 60), f(hr === 1 ? 12 : hr - 1, mn), f(hr, (mn + 15) % 60)]), ans };
  });

  /* ---------- Напёрстки ---------- */
  Games.register({ id: 'shell', title: 'Напёрстки', icon: '🥛', cat: 'brain', desc: 'Следи за шариком под стаканчиками', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; let cups, ball, streak, busy, cupEls, hdr;
      function start() { streak = 0; round(); }
      async function round() { cups = [0, 1, 2]; ball = api.rand(0, 2); busy = true; render(true); await sleep(900); cupEls.forEach(c => c.textContent = '🥛'); const n = 4 + Math.min(12, streak * 2); const sp = Math.max(180, 450 - streak * 30); for (let i = 0; i < n; i++) { const a = api.rand(0, 2); let b; do { b = api.rand(0, 2); } while (b === a); swapPos(a, b, sp); await sleep(sp + 40); } busy = false; }
      function swapPos(a, b, sp) { const A = cupEls[a], B = cupEls[b]; const ax = A.style.left, bx = B.style.left; A.style.transition = B.style.transition = `left ${sp}ms`; A.style.left = bx; B.style.left = ax; [cupEls[a], cupEls[b]] = [B, A]; if (ball === a) ball = b; else if (ball === b) ball = a; api.sound('select'); }
      function render(showBall) { screen.innerHTML = ''; hdr = api.header(screen, [{ label: 'Серия', value: streak }, { label: 'Рекорд', value: api.bestOf('shell') || 0 }]); const stage = h('div', { style: 'position:relative;width:300px;height:120px' }); cupEls = [0, 1, 2].map(i => h('div', { style: `position:absolute;left:${i * 110}px;top:20px;width:80px;height:80px;font-size:64px;text-align:center;line-height:80px;transition:left .3s`, onclick: () => pick(i) }, showBall && i === ball ? '⚪' : '🥛')); stage.append(...cupEls); screen.append(h('div', { class: 'game-area' }, stage, h('div', { class: 'hint-text' }, 'Запомни, где шарик, и следи за перестановками'))); }
      function pick(i) { if (busy) return; busy = true; const idx = cupEls.indexOf(cupEls.find(c => c === cupEls[i])); const el = cupEls[i]; const hit = i === ball; el.textContent = hit ? '⚪' : '❌'; cupEls[ball].textContent = '⚪'; if (hit) { streak++; api.sound('good'); api.vibrate(10); api.best('shell', streak); if (streak % 5 === 0) api.addCoins(5); setTimeout(round, 800); } else { api.sound('bad'); setTimeout(() => api.end({ win: false, title: 'Мимо!', reward: Math.floor(streak / 2), text: 'Серия: ' + streak, onAgain: start }), 700); } }
      const sleep = ms => new Promise(r => setTimeout(r, ms)); start();
    } });

  /* ---------- Запомни число ---------- */
  Games.register({ id: 'memnum', title: 'Запомни число', icon: '🧠', cat: 'brain', desc: 'Число мелькает — введи его по памяти. Длина растёт', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; let len, num, cur, curEl, timer;
      function start() { len = 3; round(); }
      function round() { num = Array.from({ length: len }, (_, i) => api.rand(i ? 0 : 1, 9)).join(''); cur = ''; screen.innerHTML = ''; api.header(screen, [{ label: 'Цифр', value: len }, { label: 'Рекорд', value: api.bestOf('memnum') || 0 }]); const show = h('div', { style: 'font-size:48px;font-weight:800;letter-spacing:.1em;height:70px' }, num); curEl = h('div', { class: 'wow-current', style: 'font-size:32px' }); screen.append(h('div', { class: 'game-area', style: 'gap:20px' }, show, curEl)); const pad = h('div', { class: 'numpad', style: 'visibility:hidden' }); '1234567890'.split('').forEach(d => pad.append(h('button', { class: 'btn', onclick: () => { cur += d; curEl.textContent = cur; api.sound('tap'); if (cur.length === len) check(); } }, d))); pad.append(h('button', { class: 'btn', onclick: () => { cur = cur.slice(0, -1); curEl.textContent = cur; } }, '⌫')); screen.append(h('div', { class: 'bottom-bar' }, pad)); timer = setTimeout(() => { show.textContent = '•'.repeat(len); pad.style.visibility = 'visible'; }, 800 + len * 350); }
      function check() { if (cur === num) { api.sound('good'); api.best('memnum', len); if (len % 3 === 0) api.addCoins(len); len++; setTimeout(round, 400); } else api.end({ win: false, title: 'Было: ' + num, reward: Math.max(0, len - 4), text: 'Запомнили ' + (len - 1) + ' цифр', onAgain: start }); }
      this.unmount = () => clearTimeout(timer); start();
    } });

  /* ---------- Запомни последовательность ---------- */
  Games.register({ id: 'memseq', title: 'Запомни порядок', icon: '🧩', cat: 'brain', desc: 'Запомни ряд картинок и повтори его', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; const E = ['🍎', '🚗', '⭐', '🐶', '🎈', '🌙', '🍕', '⚽']; let len, seq, cur, timer;
      function start() { len = 3; round(); }
      function round() { seq = Array.from({ length: len }, () => E[api.rand(0, E.length - 1)]); cur = []; screen.innerHTML = ''; api.header(screen, [{ label: 'Длина', value: len }, { label: 'Рекорд', value: api.bestOf('memseq') || 0 }]); const show = h('div', { style: 'font-size:40px;letter-spacing:.1em;min-height:60px;text-align:center' }, seq.join(' ')); const ans = h('div', { style: 'font-size:32px;min-height:50px;color:var(--accent2)' }); const pad = h('div', { class: 'row', style: 'visibility:hidden' }, E.map(e => h('button', { class: 'btn', style: 'font-size:32px;padding:8px 12px', onclick: () => { cur.push(e); ans.textContent = cur.join(' '); api.sound('tap'); if (cur.length === len) check(); } }, e))); screen.append(h('div', { class: 'game-area', style: 'gap:20px' }, show, ans, pad)); timer = setTimeout(() => { show.textContent = '?'.repeat(len).split('').join(' '); pad.style.visibility = 'visible'; }, 1000 + len * 500); }
      function check() { if (cur.join('') === seq.join('')) { api.sound('good'); api.best('memseq', len); if (len % 3 === 0) api.addCoins(len); len++; setTimeout(round, 400); } else api.end({ win: false, title: 'Ошибка', reward: Math.max(0, len - 4), text: 'Было: ' + seq.join(' '), onAgain: start }); }
      this.unmount = () => clearTimeout(timer); start();
    } });

  /* ---------- Запомни позиции ---------- */
  Games.register({ id: 'mempos', title: 'Запомни клетки', icon: '🟪', cat: 'brain', desc: 'Клетки вспыхивают — отметь их по памяти', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; let N, k, set, picked, cells, timer, level;
      function start() { level = 1; round(); }
      function round() { N = 3 + Math.min(3, Math.floor(level / 3)); k = 2 + Math.floor(level / 2); set = new Set(api.shuffle([...Array(N * N).keys()]).slice(0, k)); picked = new Set(); screen.innerHTML = ''; api.header(screen, [{ label: 'Уровень', value: level }, { label: 'Клеток', value: k }, { label: 'Рекорд', value: api.bestOf('mempos') || 0 }]); const size = cellSize(screen, N, 340); const g = gridEl(h, N, size); cells = []; for (let i = 0; i < N * N; i++) { const el = h('div', { class: 'pz-cell' + (set.has(i) ? ' on' : ''), onclick: () => tap(i) }); cells.push(el); g.append(el); } screen.append(h('div', { class: 'game-area' }, g)); cells.busy = true; timer = setTimeout(() => { cells.forEach(c => c.classList.remove('on')); cells.busy = false; }, 900 + k * 250); }
      function tap(i) { if (cells.busy || picked.has(i)) return; picked.add(i); if (set.has(i)) { cells[i].classList.add('on'); api.sound('good'); if (picked.size === k) { api.best('mempos', level); if (level % 4 === 0) api.addCoins(5); level++; setTimeout(round, 500); } } else { cells[i].style.background = 'var(--red)'; cells.busy = true; set.forEach(s => cells[s].classList.add('on')); api.sound('bad'); setTimeout(() => api.end({ win: false, title: 'Не та клетка', reward: Math.floor(level / 2), text: 'Уровень: ' + level, onAgain: start }), 800); } }
      this.unmount = () => clearTimeout(timer); start();
    } });

  /* ---------- Порядок цветов ---------- */
  Games.register({ id: 'colororder', title: 'Порядок цветов', icon: '🌈', cat: 'brain', desc: 'Запомни порядок цветов и повтори его нажатиями', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; const C = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#c084fc', '#22d3ee']; let len, seq, cur, timer;
      function start() { len = 3; round(); }
      function round() { seq = Array.from({ length: len }, () => api.rand(0, 5)); cur = []; screen.innerHTML = ''; api.header(screen, [{ label: 'Длина', value: len }, { label: 'Рекорд', value: api.bestOf('colororder') || 0 }]); const show = h('div', { class: 'row' }, seq.map(c => h('div', { class: 'mm-peg big', style: 'background:' + C[c] }))); const pad = h('div', { class: 'row', style: 'visibility:hidden' }, C.map((c, i) => h('div', { class: 'mm-peg big', style: 'background:' + c + ';width:56px;height:56px', onclick: () => { cur.push(i); api.sound('tap'); if (cur[cur.length - 1] !== seq[cur.length - 1]) { api.end({ win: false, title: 'Ошибка', reward: Math.max(0, len - 4), onAgain: start }); return; } if (cur.length === len) { api.sound('good'); api.best('colororder', len); if (len % 3 === 0) api.addCoins(len); len++; setTimeout(round, 400); } } }))); screen.append(h('div', { class: 'game-area', style: 'gap:30px' }, show, pad)); timer = setTimeout(() => { show.querySelectorAll('.mm-peg').forEach(p => p.style.background = 'var(--card2)'); pad.style.visibility = 'visible'; }, 900 + len * 400); }
      this.unmount = () => clearTimeout(timer); start();
    } });

  /* ---------- Останови на 5.00 ---------- */
  Games.register({ id: 'stopwatch', title: 'Ровно 5 секунд', icon: '⏱', cat: 'brain', desc: 'Останови секундомер как можно ближе к 5.00', bestLabel: 'Точность (мс)',
    mount(screen, api) {
      const { h } = api; let t0, raf, running, disp, hideAfter;
      function render() { screen.innerHTML = ''; api.header(screen, [{ label: 'Рекорд', value: api.bestOf('stopwatch') != null ? api.bestOf('stopwatch') + ' мс' : '—' }]); disp = h('div', { style: 'font-size:64px;font-weight:800;font-variant-numeric:tabular-nums' }, '0.00'); screen.append(h('div', { class: 'game-area', style: 'gap:30px' }, disp, h('div', { class: 'hint-text' }, 'После 2 секунд цифры скрываются'), h('button', { class: 'btn primary', style: 'font-size:22px;padding:18px 40px', onclick: tap }, 'Старт / Стоп'))); running = false; }
      function tick() { const t = (performance.now() - t0) / 1000; disp.textContent = t < 2 ? t.toFixed(2) : '?.??'; raf = requestAnimationFrame(tick); }
      function tap() { if (!running) { running = true; t0 = performance.now(); tick(); api.sound('tap'); return; } cancelAnimationFrame(raf); running = false; const t = (performance.now() - t0) / 1000; const diff = Math.round(Math.abs(t - 5) * 1000); disp.textContent = t.toFixed(2); const isBest = api.best('stopwatch', diff, true); api.end({ win: diff < 300, title: 'Отклонение: ' + diff + ' мс', reward: diff < 50 ? 20 : diff < 150 ? 10 : diff < 300 ? 5 : 0, text: isBest ? 'Новый рекорд!' : '', onAgain: render }); }
      this.unmount = () => cancelAnimationFrame(raf); render();
    } });

  /* ---------- Найди число ---------- */
  Games.register({ id: 'findnum', title: 'Найди число', icon: '🔍', cat: 'brain', desc: 'Найди нужное число среди похожих как можно быстрее', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; let score, timeLeft, timer, hdr;
      function next() { const N = 4 + Math.min(3, Math.floor(score / 4)); const target = api.rand(10, 99); const nums = Array.from({ length: N * N }, () => { let n; do { n = api.rand(10, 99); } while (n === target); return n; }); nums[api.rand(0, N * N - 1)] = target; screen.innerHTML = ''; hdr = api.header(screen, [{ label: 'Найди', value: target }, { label: '⏱', value: timeLeft }, { label: 'Счёт', value: score }]); const size = cellSize(screen, N, 400); const g = gridEl(h, N, size); nums.forEach(n => g.append(h('div', { class: 'pz-cell num', style: 'font-size:' + Math.round(size * .4) + 'px', onclick: () => { if (n === target) { score++; api.sound('good'); next(); } else { api.sound('bad'); api.vibrate(30); timeLeft = Math.max(1, timeLeft - 2); hdr.set(1, timeLeft); } } }, n))); screen.append(h('div', { class: 'game-area' }, g)); }
      function start() { score = 0; timeLeft = 45; clearInterval(timer); timer = setInterval(() => { timeLeft--; hdr.set(1, timeLeft); if (timeLeft <= 0) { clearInterval(timer); api.best('findnum', score); api.end({ title: 'Время вышло', reward: Math.floor(score / 2), text: 'Найдено: ' + score, onAgain: start }); } }, 1000); next(); }
      this.unmount = () => clearInterval(timer); start();
    } });

  /* ---------- Ритм ---------- */
  Games.register({ id: 'rhythm', title: 'Ритм', icon: '🥁', cat: 'brain', desc: 'Тапай в зелёной зоне — бегунок ускоряется', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 200; let x, dir, speed, score, alive, zone;
      function reset() { x = 0; dir = 1; speed = 200; score = 0; alive = true; zone = { x: api.rand(60, 240), w: 80 }; a.hdr.set(0, 0); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Счёт', value: 0 }, { label: 'Рекорд', value: api.bestOf('rhythm') || 0 }], hint: 'Тап, когда бегунок в зелёной зоне',
        onDown: () => { if (!alive) return; if (x > zone.x && x < zone.x + zone.w) { score++; a.hdr.set(0, score); api.sound('good'); api.vibrate(8); speed += 25; zone = { x: api.rand(30, W - 30 - Math.max(30, 80 - score * 3)), w: Math.max(30, 80 - score * 3) }; if (score % 10 === 0) api.addCoins(5); } else { alive = false; api.sound('bad'); api.vibrate(60); api.best('rhythm', score); api.end({ win: false, title: 'Мимо!', reward: Math.floor(score / 3), text: 'Счёт: ' + score, onAgain: reset }); } },
        frame(dt, ctx) { if (alive) { x += dir * speed * dt; if (x > W) { x = W; dir = -1; } if (x < 0) { x = 0; dir = 1; } } ctx.fillStyle = '#171728'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#26264a'; ctx.fillRect(0, 80, W, 40); ctx.fillStyle = '#34d399'; ctx.fillRect(zone.x, 80, zone.w, 40); ctx.fillStyle = '#fff'; ctx.fillRect(x - 3, 60, 6, 80); } });
      this.unmount = a.stop; reset();
    } });
})();
