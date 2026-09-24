/* Мозг и реакция (пакет 200+) */
(function () {
  const K = window.Kit;

  /* ---------- N-назад ---------- */
  Games.register({ id: 'nback', title: 'N-назад', icon: '🔁', cat: 'brain', desc: 'Жми, если клетка совпала с той, что была N шагов назад. Лучшая тренировка памяти', bestLabel: 'Рекорд N',
    mount(screen, api) {
      const { h } = api; let n = api.load('nback_n', 1), seq, i, timer, hits, miss, fa, pressed, cells, hdr, total = 24;
      function start() { seq = []; i = -1; hits = 0; miss = 0; fa = 0; screen.innerHTML = ''; hdr = api.header(screen, [{ label: 'N', value: n }, { label: 'Верно', value: 0 }, { label: 'Ошибки', value: 0 }]); const s = K.cellSize(screen, 3, 280); const g = K.gridEl(h, 3, s); cells = []; for (let k = 0; k < 9; k++) { const c = h('div', { class: 'pz-cell' }); cells.push(c); g.append(c); } screen.append(h('div', { class: 'game-area', style: 'gap:18px' }, h('div', { class: 'hint-text' }, 'Совпадает с позицией ' + n + ' шаг(а) назад? Жмите кнопку'), g, h('button', { class: 'btn primary', style: 'font-size:20px;padding:18px 40px', onclick: press }, 'Совпало!'))); clearInterval(timer); timer = setInterval(step, 1900); step(); }
      function step() { if (i >= 0) { const match = i >= n && seq[i] === seq[i - n]; if (match && !pressed) { miss++; hdr.set(2, miss + fa); } } i++; if (i >= total) { clearInterval(timer); const score = Math.max(0, hits * 2 - miss - fa); const up = miss + fa <= 3 && hits >= 4; if (up) { api.best('nback', n); n++; } else if (miss + fa > 7 && n > 1) n--; api.store('nback_n', n); api.end({ win: up, title: up ? 'Отлично! Дальше N=' + n : 'Попробуйте ещё', reward: Math.floor(score / 2) + (up ? n * 3 : 0), text: 'Верно: ' + hits + ', пропущено: ' + miss + ', лишних нажатий: ' + fa, onAgain: start }); return; } let v = api.rand(0, 8); if (i >= n && Math.random() < 0.33) v = seq[i - n]; seq.push(v); pressed = false; cells.forEach((c, k) => c.classList.toggle('on', k === v)); setTimeout(() => cells[v] && cells[v].classList.remove('on'), 900); }
      function press() { if (pressed || i < 0) return; pressed = true; if (i >= n && seq[i] === seq[i - n]) { hits++; api.sound('good'); hdr.set(1, hits); } else { fa++; api.sound('bad'); api.vibrate(30); hdr.set(2, miss + fa); } }
      this.unmount = () => clearInterval(timer); start();
    } });

  /* ---------- Флэш-анзан ---------- */
  Games.register({ id: 'flashsum', title: 'Флэш-анзан', icon: '⚡', cat: 'brain', desc: 'Числа мелькают одно за другим — сложи их в уме', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; let level, nums, t;
      function start() { level = 1; round(); }
      async function round() { const cnt = 3 + Math.floor(level / 2), dig = level < 5 ? 1 : 2, sp = Math.max(350, 1000 - level * 50); nums = Array.from({ length: cnt }, () => api.rand(dig === 1 ? 1 : 10, dig === 1 ? 9 : 99)); screen.innerHTML = ''; api.header(screen, [{ label: 'Уровень', value: level }, { label: 'Рекорд', value: api.bestOf('flashsum') || 0 }]); const d = h('div', { style: 'font-size:90px;font-weight:900;height:120px' }); screen.append(h('div', { class: 'game-area' }, d)); await K.sleep(600); for (const x of nums) { d.textContent = x; api.sound('tap'); await K.sleep(sp); d.textContent = ''; await K.sleep(120); } ask(); }
      function ask() { const ans = nums.reduce((a, b) => a + b); let cur = ''; screen.innerHTML = ''; api.header(screen, [{ label: 'Уровень', value: level }]); const disp = h('div', { class: 'wow-current', style: 'font-size:40px;min-height:50px' }, '?'); screen.append(h('div', { class: 'game-area', style: 'gap:16px' }, h('div', null, 'Сумма?'), disp, h('div', { class: 'numpad' }, [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => h('button', { class: 'btn', onclick: () => { cur = (cur + n).slice(0, 4); disp.textContent = cur; } }, n)).concat([h('button', { class: 'btn', style: 'grid-column:span 2', onclick: () => { cur = cur.slice(0, -1); disp.textContent = cur || '?'; } }, '⌫'), h('button', { class: 'btn primary', style: 'grid-column:span 3', onclick: () => { if (+cur === ans) { api.sound('good'); api.best('flashsum', level); if (level % 3 === 0) api.addCoins(level); level++; round(); } else api.end({ win: false, title: 'Было ' + ans, text: nums.join(' + '), reward: Math.floor(level / 2), onAgain: start }); } }, 'Ответ')])))); }
      start();
    } });

  /* ---------- Меткость ---------- */
  Games.register({ id: 'aimtrainer', title: 'Меткость', icon: '🎯', cat: 'brain', desc: 'Попади по 30 мишеням как можно быстрее. Мишени всё меньше', bestLabel: 'Лучшее время (с)',
    mount(screen, api) {
      const W = 360, H = 500; let tg, hits, t0, done, misses, pops;
      function reset() { hits = 0; misses = 0; done = false; t0 = null; pops = []; place(); a.hdr.set(0, '0/30'); }
      function place() { const r = Math.max(10, 34 - hits * 0.8); tg = { x: api.rand(r + 5, W - r - 5), y: api.rand(r + 5, H - r - 5), r, born: performance.now() }; }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Попаданий', value: '0/30' }, { label: 'Рекорд', value: api.bestOf('aimtrainer') != null ? api.bestOf('aimtrainer') + 'с' : '—' }], hint: 'Тапайте по мишеням',
        onDown: p => { if (done) return; if (Math.hypot(p.x - tg.x, p.y - tg.y) < tg.r + 4) { if (!t0) t0 = performance.now(); hits++; pops.push({ x: tg.x, y: tg.y, t: 0 }); api.sound('tap'); a.hdr.set(0, hits + '/30'); if (hits >= 30) { done = true; const sec = Math.round((performance.now() - t0) / 100 + misses * 5) / 10; api.best('aimtrainer', sec, true); api.end({ title: sec + ' секунд', reward: Math.max(3, Math.floor(40 - sec)), text: 'Промахов: ' + misses + ' (+0.5с за каждый)', onAgain: reset }); } else place(); } else { misses++; api.sound('bad'); } },
        frame(dt, ctx) { K.bg(ctx, W, H, '#101024'); pops = pops.filter(p => (p.t += dt) < 0.3); pops.forEach(p => K.ring(ctx, p.x, p.y, 20 + p.t * 100, `rgba(52,211,153,${1 - p.t / 0.3})`, 3)); if (!done) { [1, 0.66, 0.33].forEach((k, i) => K.circ(ctx, tg.x, tg.y, tg.r * k, i % 2 ? '#fff' : '#ef4444')); } if (t0 && !done) K.text(ctx, ((performance.now() - t0) / 1000).toFixed(1), W / 2, 20, 16, '#9a9ab8'); } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Стоп-сигнал (Go/No-Go) ---------- */
  Games.register({ id: 'gonogo', title: 'Стоп-сигнал', icon: '🚦', cat: 'brain', desc: 'Жми на зелёный, не жми на красный. Всё быстрее', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; let score, cur, timer, lives, box, hdr, waitT, wait;
      function start() { score = 0; lives = 3; wait = 1100; screen.innerHTML = ''; hdr = api.header(screen, [{ label: 'Счёт', value: 0 }, { label: '❤', value: 3 }, { label: 'Рекорд', value: api.bestOf('gonogo') || 0 }]); box = h('div', { style: 'width:220px;height:220px;border-radius:50%;background:var(--card);display:flex;align-items:center;justify-content:center;font-size:90px', onpointerdown: tap }); screen.append(h('div', { class: 'game-area', style: 'gap:20px' }, box, h('div', { class: 'hint-text' }, 'Зелёный — жми, красный — не трогай'))); next(); }
      function next() { clearTimeout(timer); cur = Math.random() < 0.7 ? 'go' : 'no'; box.style.background = cur === 'go' ? '#22c55e' : '#ef4444'; box.textContent = cur === 'go' ? '✋' : '⛔'; waitT = Date.now(); timer = setTimeout(() => { if (cur === 'go') fail('Не успели'); else { score++; hdr.set(0, score); blank(); } }, wait); }
      function blank() { cur = null; box.style.background = 'var(--card)'; box.textContent = ''; timer = setTimeout(next, api.rand(250, 700)); }
      function tap() { if (!cur) return; clearTimeout(timer); if (cur === 'go') { score++; hdr.set(0, score); api.sound('tap'); wait = Math.max(380, wait - 18); if (score % 15 === 0) api.addCoins(3); blank(); } else fail('Это был красный!'); }
      function fail(t) { lives--; hdr.set(1, lives); api.sound('bad'); api.vibrate(60); api.toast(t); if (lives <= 0) { cur = null; api.best('gonogo', score); api.end({ win: false, title: 'Счёт: ' + score, reward: Math.floor(score / 5), onAgain: start }); return; } blank(); }
      this.unmount = () => clearTimeout(timer); start();
    } });

  /* ---------- Быстрый палец ---------- */
  Games.register({ id: 'tapspeed', title: 'Быстрый палец', icon: '👆', cat: 'brain', desc: 'Сколько раз успеешь тапнуть за 10 секунд?', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; let n, t0, timer, btn, running;
      function start() { n = 0; running = false; screen.innerHTML = ''; const hd = api.header(screen, [{ label: 'Тапов', value: 0 }, { label: '⏱', value: '10.0' }, { label: 'Рекорд', value: api.bestOf('tapspeed') || 0 }]); btn = h('button', { class: 'btn primary', style: 'width:240px;height:240px;border-radius:50%;font-size:48px', onpointerdown: e => { e.preventDefault(); if (!running) { running = true; t0 = performance.now(); timer = setInterval(() => { const left = Math.max(0, 10 - (performance.now() - t0) / 1000); hd.set(1, left.toFixed(1)); if (left <= 0) { clearInterval(timer); running = false; btn.disabled = true; api.best('tapspeed', n); api.end({ title: n + ' тапов', reward: Math.floor(n / 10), text: (n / 10).toFixed(1) + ' тапов в секунду', onAgain: start }); } }, 50); } if (!btn.disabled) { n++; hd.set(0, n); api.vibrate(5); btn.textContent = n; } } }, 'ТАП'); screen.append(h('div', { class: 'game-area' }, btn)); }
      this.unmount = () => clearInterval(timer); start();
    } });

  /* ---------- Угадай угол ---------- */
  Games.register({ id: 'angleguess', title: 'Угадай угол', icon: '📐', cat: 'brain', desc: 'Оцени угол на глаз. 10 раундов, чем точнее — тем больше очков', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; let round, total, ang, guess;
      function start() { round = 0; total = 0; next(); }
      function next() { round++; ang = api.rand(5, 175); guess = 90; draw(); }
      function draw(res) { screen.innerHTML = ''; api.header(screen, [{ label: 'Раунд', value: round + '/10' }, { label: 'Очки', value: total }]); const c = document.createElement('canvas'); c.width = 600; c.height = 340; c.style.width = '300px'; const x = c.getContext('2d'); x.lineWidth = 8; x.lineCap = 'round'; x.strokeStyle = '#22d3ee'; x.beginPath(); x.moveTo(40, 300); x.lineTo(560, 300); x.stroke(); x.strokeStyle = '#fbbf24'; x.beginPath(); x.moveTo(300, 300); x.lineTo(300 + Math.cos(-ang * Math.PI / 180) * 260, 300 + Math.sin(-ang * Math.PI / 180) * 260); x.stroke(); x.strokeStyle = '#a78bfa'; x.lineWidth = 3; x.beginPath(); x.arc(300, 300, 50, -ang * Math.PI / 180, 0); x.stroke();
        const val = h('div', { style: 'font-size:40px;font-weight:800' }, guess + '°'); const sl = h('input', { type: 'range', min: 0, max: 180, value: guess, style: 'width:min(90vw,320px)' }); sl.addEventListener('input', () => { guess = +sl.value; val.textContent = guess + '°'; });
        screen.append(h('div', { class: 'game-area', style: 'gap:14px' }, c, res ? h('div', { style: 'font-size:18px' }, res) : val, res ? null : sl, h('button', { class: 'btn primary', onclick: () => { if (res) { if (round >= 10) { api.best('angleguess', total); api.end({ title: 'Итог: ' + total, reward: Math.floor(total / 60), onAgain: start }); } else next(); return; } const d = Math.abs(guess - ang); const pts = Math.max(0, 100 - d * 5); total += pts; api.sound(d <= 5 ? 'good' : d <= 15 ? 'select' : 'bad'); draw('Было ' + ang + '°, вы сказали ' + guess + '° → +' + pts); } }, res ? 'Дальше' : 'Ответ'))); }
      start();
    } });

  /* ---------- Оценка количества ---------- */
  Games.register({ id: 'estimate', title: 'На глазок', icon: '👀', cat: 'brain', desc: 'Сколько точек? Смотри секунду и оценивай. Близкий ответ тоже засчитывается', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; let round, total, n;
      function start() { round = 0; total = 0; next(); }
      function next() { round++; n = api.rand(10, 40 + round * 10); screen.innerHTML = ''; api.header(screen, [{ label: 'Раунд', value: round + '/10' }, { label: 'Очки', value: total }]); const c = document.createElement('canvas'); c.width = c.height = 600; c.style.width = c.style.height = '300px'; const x = c.getContext('2d'); x.fillStyle = '#1e1e33'; x.fillRect(0, 0, 600, 600); for (let i = 0; i < n; i++) { x.fillStyle = ['#fbbf24', '#22d3ee', '#f472b6'][i % 3]; x.beginPath(); x.arc(api.rand(10, 590), api.rand(10, 590), 9, 0, 7); x.fill(); } screen.append(h('div', { class: 'game-area' }, c)); setTimeout(() => { c.style.filter = 'blur(20px)'; ask(); }, 1300); }
      function ask() { let cur = ''; const disp = h('div', { class: 'wow-current', style: 'font-size:34px' }, '?'); screen.append(h('div', { class: 'bottom-bar' }, disp, h('div', { class: 'numpad' }, [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(d => h('button', { class: 'btn', onclick: () => { cur = (cur + d).slice(0, 3); disp.textContent = cur; } }, d)).concat([h('button', { class: 'btn', style: 'grid-column:span 2', onclick: () => { cur = cur.slice(0, -1); disp.textContent = cur || '?'; } }, '⌫'), h('button', { class: 'btn primary', style: 'grid-column:span 3', onclick: () => { if (!cur) return; const g = +cur; const err = Math.abs(g - n) / n; const pts = Math.max(0, Math.round(100 - err * 250)); total += pts; api.sound(err < 0.1 ? 'good' : err < 0.25 ? 'select' : 'bad'); api.toast('Было ' + n + ' → +' + pts); if (round >= 10) { api.best('estimate', total); api.end({ title: 'Итог: ' + total, reward: Math.floor(total / 60), onAgain: start }); } else setTimeout(next, 700); } }, 'Ответ')])))); }
      start();
    } });

  /* ---------- Найди оттенок ---------- */
  Games.register({ id: 'shade', title: 'Найди оттенок', icon: '🟩', cat: 'brain', desc: 'Одна клетка чуть другого цвета. Найди её — поле растёт, разница тает', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; let score, t, timer, hdr;
      function start() { score = 0; t = 60; clearInterval(timer); timer = setInterval(() => { t--; hdr.set(1, t); if (t <= 0) { clearInterval(timer); api.best('shade', score); api.end({ title: 'Время вышло', reward: Math.floor(score / 3), text: 'Найдено: ' + score, onAgain: start }); } }, 1000); next(); }
      function next() { const N = Math.min(9, 2 + Math.floor(score / 3)); const hue = api.rand(0, 359), sat = api.rand(45, 80), lit = api.rand(40, 60); const d = Math.max(3, 22 - score * 0.7); const odd = api.rand(0, N * N - 1); screen.innerHTML = ''; hdr = api.header(screen, [{ label: 'Счёт', value: score }, { label: '⏱', value: t }]); const s = K.cellSize(screen, N, 360); const g = K.gridEl(h, N, s); for (let i = 0; i < N * N; i++) g.append(h('div', { style: `border-radius:6px;background:hsl(${hue},${sat}%,${i === odd ? lit + d : lit}%)`, onclick: () => { if (i === odd) { score++; api.sound('good'); next(); } else { t = Math.max(1, t - 3); hdr.set(1, t); api.sound('bad'); api.vibrate(30); } } })); screen.append(h('div', { class: 'game-area' }, g)); }
      this.unmount = () => clearInterval(timer); start();
    } });

  /* ---------- Числа по порядку ---------- */
  Games.register({ id: 'numorder', title: 'Числа по порядку', icon: '🔢', cat: 'brain', desc: 'Числа разбросаны по полю — тапай от 1 до 25 как можно быстрее', bestLabel: 'Лучшее время (с)',
    mount(screen, api) {
      const { h } = api; let nxt, t0, timer, hd;
      function start() { nxt = 1; t0 = null; screen.innerHTML = ''; hd = api.header(screen, [{ label: 'Следующее', value: 1 }, { label: '⏱', value: '0.0' }, { label: 'Рекорд', value: api.bestOf('numorder') || '—' }]); const field = h('div', { style: 'position:relative;width:min(92vw,360px);height:min(64vh,480px);background:var(--bg2);border-radius:16px' }); const pos = []; for (let n = 1; n <= 25; n++) { let x, y, k = 0; do { x = api.rand(2, 86); y = api.rand(2, 90); k++; } while (k < 80 && pos.some(p => Math.abs(p[0] - x) < 13 && Math.abs(p[1] - y) < 9)); pos.push([x, y]); const sz = api.rand(16, 30); const el = h('div', { style: `position:absolute;left:${x}%;top:${y}%;font-size:${sz}px;font-weight:800;color:hsl(${api.rand(0, 359)},80%,70%);transform:rotate(${api.rand(-30, 30)}deg);padding:4px`, onclick: () => { if (n !== nxt) { api.sound('bad'); return; } if (n === 1) { t0 = performance.now(); timer = setInterval(() => hd.set(1, ((performance.now() - t0) / 1000).toFixed(1)), 100); } el.style.opacity = '.15'; api.sound('tap'); nxt++; hd.set(0, nxt); if (nxt > 25) { clearInterval(timer); const s = Math.round((performance.now() - t0) / 100) / 10; api.best('numorder', s, true); api.end({ title: s + ' секунд', reward: Math.max(3, Math.floor(60 - s)), onAgain: start }); } } }, n); field.append(el); } screen.append(h('div', { class: 'game-area' }, field)); }
      this.unmount = () => clearInterval(timer); start();
    } });

  /* ---------- Что изменилось ---------- */
  Games.register({ id: 'whatchanged', title: 'Что изменилось', icon: '🔄', cat: 'brain', desc: 'Запомни картинки. Одна из них сменится — найди какая', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; const E = ['🍎', '🚗', '⭐', '🐶', '🎈', '🌙', '🍕', '⚽', '🎸', '🌵', '🐙', '🍩', '🚀', '🎩', '🦋', '🔔', '🍓', '🐢', '⚓', '🎲']; let level, lives;
      function start() { level = 1; lives = 3; round(); }
      function round() { const n = Math.min(20, 3 + level); const cols = n <= 6 ? 3 : n <= 12 ? 4 : 5; const items = api.shuffle(E.slice()).slice(0, n); const ch = api.rand(0, n - 1); const pool = E.filter(e => !items.includes(e)); const neu = K.pick(pool); const show = (arr, click) => { screen.innerHTML = ''; api.header(screen, [{ label: 'Уровень', value: level }, { label: '❤', value: lives }, { label: 'Рекорд', value: api.bestOf('whatchanged') || 0 }]); const s = K.cellSize(screen, cols, 330); const g = K.gridEl(h, cols, s); arr.forEach((e, i) => g.append(h('div', { class: 'pz-cell', style: `font-size:${s * .6}px`, onclick: () => click && click(i) }, e))); screen.append(h('div', { class: 'game-area', style: 'gap:10px' }, h('div', { class: 'hint-text' }, click ? 'Что поменялось?' : 'Запоминайте…'), g)); };
        show(items); setTimeout(() => { screen.querySelector('.pz-grid') && screen.querySelectorAll('.pz-cell').forEach(c => c.textContent = ''); setTimeout(() => { const arr = items.slice(); arr[ch] = neu; show(arr, i => { if (i === ch) { api.sound('good'); api.best('whatchanged', level); if (level % 3 === 0) api.addCoins(level); level++; round(); } else { lives--; api.sound('bad'); api.toast('Было: ' + items[ch] + ' → ' + neu); if (lives <= 0) api.end({ win: false, title: 'Уровень ' + level, reward: level, onAgain: start }); else setTimeout(round, 900); } }); }, 600); }, 1500 + n * 250); }
      start();
    } });

  /* ---------- Кто новый ---------- */
  Games.register({ id: 'whosnew', title: 'Кто новенький', icon: '🆕', cat: 'brain', desc: 'Каждый раунд добавляется новый зверь. Тапни того, кого ещё не было', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; const E = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐢', '🐍', '🦎', '🐙', '🦑', '🦀', '🐡', '🐠']; let seen, pool, score;
      function start() { pool = api.shuffle(E.slice()); seen = new Set([pool.pop(), pool.pop()]); score = 0; round(); }
      function round() { if (!pool.length) { api.best('whosnew', score); api.end({ title: 'Все звери найдены!', reward: 30, onAgain: start }); return; } const neu = pool.pop(); const shown = api.shuffle([...api.shuffle([...seen]).slice(0, Math.min(seen.size, 3 + Math.floor(score / 4))), neu]); screen.innerHTML = ''; api.header(screen, [{ label: 'Счёт', value: score }, { label: 'Рекорд', value: api.bestOf('whosnew') || 0 }]); screen.append(h('div', { class: 'game-area', style: 'gap:14px' }, h('div', { class: 'hint-text' }, 'Кого вы видите впервые?'), h('div', { class: 'row', style: 'max-width:340px' }, shown.map(e => h('button', { class: 'btn', style: 'font-size:44px;width:76px;height:76px;padding:0', onclick: () => { if (e === neu) { score++; seen.add(neu); api.sound('good'); if (score % 5 === 0) api.addCoins(3); round(); } else { api.best('whosnew', score); api.end({ win: false, title: e + ' уже был!', reward: Math.floor(score / 3), text: 'Новым был ' + neu + '. Счёт: ' + score, onAgain: start }); } } }, e))))); }
      start();
    } });

  /* ---------- Цепочка вычислений ---------- */
  Games.register({ id: 'chaincalc', title: 'Цепочка вычислений', icon: '⛓', cat: 'brain', desc: 'Операции показываются по одной — держи результат в голове', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; let level, val, ops;
      function start() { level = 1; round(); }
      async function round() { val = api.rand(2, 9); ops = []; let v = val; for (let k = 0; k < 2 + level; k++) { const t = api.rand(0, 3); let op; if (t === 0) { const n = api.rand(1, 9); op = '+ ' + n; v += n; } else if (t === 1 && v > 3) { const n = api.rand(1, Math.min(9, v - 1)); op = '− ' + n; v -= n; } else if (t === 2 && v < 30) { const n = api.rand(2, 3); op = '× ' + n; v *= n; } else if (v % 2 === 0) { op = ': 2'; v /= 2; } else { op = '+ 1'; v += 1; } ops.push(op); } screen.innerHTML = ''; api.header(screen, [{ label: 'Шагов', value: 2 + level }, { label: 'Рекорд', value: api.bestOf('chaincalc') || 0 }]); const d = h('div', { style: 'font-size:64px;font-weight:900;height:90px' }, val); screen.append(h('div', { class: 'game-area' }, h('div', { class: 'hint-text' }, 'Начало'), d)); await K.sleep(1200); for (const op of ops) { d.textContent = op; api.sound('tap'); await K.sleep(Math.max(700, 1300 - level * 60)); } const ans = v; const opts = K.opts(api, ans, [ans + 1, ans - 1, ans + 2, ans - 2, ans * 2, ans + 10]); screen.innerHTML = ''; api.header(screen, [{ label: 'Шагов', value: 2 + level }]); screen.append(h('div', { class: 'game-area', style: 'gap:16px' }, h('div', { style: 'font-size:24px' }, 'Результат?'), h('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:10px;width:min(90vw,320px)' }, opts.map(o => h('button', { class: 'btn', style: 'font-size:26px;padding:16px', onclick: () => { if (o === ans) { api.sound('good'); api.best('chaincalc', level); if (level % 2 === 0) api.addCoins(level); level++; round(); } else api.end({ win: false, title: 'Было ' + ans, text: val + ' ' + ops.join(' '), reward: level, onAgain: start }); } }, o))))); }
      start();
    } });

  /* ---------- Счёт вслепую ---------- */
  Games.register({ id: 'countblind', title: 'Кто в домике', icon: '🏠', cat: 'brain', desc: 'Человечки входят и выходят из домика. Сколько внутри в конце?', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 300; let level, inside, events, ei, anim, state, go;
      function start() { level = 1; round(); }
      function round() { inside = api.rand(0, 3); events = []; let v = inside; for (let k = 0; k < 4 + level * 2; k++) { const out = v > 0 && Math.random() < 0.45; const n = api.rand(1, Math.min(3, out ? v : 3)); events.push({ out, n }); v += out ? -n : n; } go = v; ei = -1; anim = null; state = 'show'; a.hdr.set(0, level); setTimeout(nextEv, 1600); }
      function nextEv() { ei++; if (ei >= events.length) { state = 'ask'; askUI(); return; } const e = events[ei]; anim = { e, t: 0 }; }
      function askUI() { const { h } = api; const opts = K.opts(api, go, [go + 1, go - 1, go + 2, go - 2].filter(x => x >= 0)); const box = h('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:10px;width:min(90vw,320px);padding-top:10px' }, opts.map(o => h('button', { class: 'btn', style: 'font-size:26px', onclick: () => { box.remove(); if (o === go) { api.sound('good'); api.best('countblind', level); if (level % 2 === 0) api.addCoins(level * 2); level++; round(); } else api.end({ win: false, title: 'Внутри было ' + go, reward: level, onAgain: start }); } }, o))); screen.append(box); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Уровень', value: 1 }, { label: 'Рекорд', value: api.bestOf('countblind') || 0 }], hint: 'Считайте в уме: вначале внутри несколько человек',
        frame(dt, ctx) { K.bg(ctx, W, H, '#bae6fd'); ctx.fillStyle = '#65a30d'; ctx.fillRect(0, H - 50, W, 50); K.rr(ctx, 130, 110, 110, 140, 6, '#b45309'); ctx.fillStyle = '#7f1d1d'; ctx.beginPath(); ctx.moveTo(115, 115); ctx.lineTo(185, 50); ctx.lineTo(255, 115); ctx.fill(); K.rr(ctx, 170, 190, 30, 60, 4, '#451a03');
          if (anim) { anim.t += dt * (1 + level * 0.12); const k = Math.min(1, anim.t / 1.1); for (let j = 0; j < anim.e.n; j++) { const x = anim.e.out ? 185 + (k * 180) + j * 22 : 10 + k * 175 - j * 22; K.emoji(ctx, '🧍', x, 225, 34); } if (anim.t > 1.25) { anim = null; setTimeout(nextEv, 150); } }
          if (ei < 0 && state === 'show') { K.text(ctx, 'Внутри: ' + inside, W / 2, 30, 22, '#111'); } } });
      this.unmount = a.stop; start();
    } });

  /* ---------- Ментальное вращение ---------- */
  Games.register({ id: 'rotation', title: 'Ментальное вращение', icon: '🔃', cat: 'brain', desc: 'Это та же фигура, только повёрнутая, или её зеркальная копия?', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; let score, t, timer, hdr;
      const shape = () => { const cells = [[0, 0]]; while (cells.length < 6) { const [x, y] = K.pick(cells); const d = K.pick([[1, 0], [-1, 0], [0, 1], [0, -1]]); const n = [x + d[0], y + d[1]]; if (!cells.some(c => c[0] === n[0] && c[1] === n[1])) cells.push(n); } return cells; };
      const sym = cells => { const key = cs => cs.map(c => c.join(',')).sort().join(';'); const norm = cs => { const mx = Math.min(...cs.map(c => c[0])), my = Math.min(...cs.map(c => c[1])); return cs.map(([x, y]) => [x - mx, y - my]); }; const m = norm(cells.map(([x, y]) => [-x, y])); let r = cells; for (let k = 0; k < 4; k++) { r = norm(r.map(([x, y]) => [-y, x])); if (key(r) === key(m)) return true; } return false; };
      const cv = (cells, rot, mir, col) => { const c = document.createElement('canvas'); c.width = c.height = 240; c.style.width = c.style.height = '130px'; const x = c.getContext('2d'); x.translate(120, 120); x.rotate(rot); if (mir) x.scale(-1, 1); const cxm = cells.reduce((a, b) => a + b[0], 0) / cells.length, cym = cells.reduce((a, b) => a + b[1], 0) / cells.length; cells.forEach(([a, b]) => { x.fillStyle = col; x.fillRect((a - cxm) * 34 - 16, (b - cym) * 34 - 16, 32, 32); }); return c; };
      function start() { score = 0; t = 60; clearInterval(timer); timer = setInterval(() => { t--; if (hdr) hdr.set(1, t); if (t <= 0) { clearInterval(timer); api.best('rotation', score); api.end({ title: 'Время вышло', reward: Math.floor(score / 2), text: 'Верно: ' + score, onAgain: start }); } }, 1000); next(); }
      function next() { let s; do { s = shape(); } while (sym(s)); const mir = Math.random() < 0.5; const rot = api.rand(1, 3) * Math.PI / 2 + (score > 8 ? api.rand(0, 1) * Math.PI / 4 : 0); screen.innerHTML = ''; hdr = api.header(screen, [{ label: 'Счёт', value: score }, { label: '⏱', value: t }]); const ans = b => { if (b === !mir) { score++; api.sound('good'); } else { t = Math.max(1, t - 3); api.sound('bad'); api.vibrate(30); } next(); }; screen.append(h('div', { class: 'game-area', style: 'gap:20px' }, h('div', { class: 'row', style: 'gap:30px' }, cv(s, 0, false, '#22d3ee'), cv(s, rot, mir, '#fbbf24')), h('div', { class: 'row' }, h('button', { class: 'btn primary', style: 'font-size:18px;padding:16px 22px', onclick: () => ans(true) }, '✅ Та же'), h('button', { class: 'btn', style: 'font-size:18px;padding:16px 22px', onclick: () => ans(false) }, '🪞 Зеркальная')))); }
      this.unmount = () => clearInterval(timer); start();
    } });

  /* ---------- Сравни отрезки ---------- */
  K.quiz({ id: 'linelen', title: 'Длиннее или короче', icon: '📏', desc: 'Какой отрезок длиннее? Иллюзии мешают', secs: 45, div: 3, gen: (api, s) => { const base = api.rand(90, 180); const d = Math.max(3, 30 - s); const a = base, b = base + (Math.random() < .5 ? d : -d); const c = document.createElement('canvas'); c.width = 640; c.height = 300; c.style.width = '320px'; const x = c.getContext('2d'); x.lineWidth = 8; x.lineCap = 'round'; const drawL = (y, len, fins) => { const x0 = 320 - len, x1 = 320 + len; x.strokeStyle = '#fbbf24'; x.beginPath(); x.moveTo(x0, y); x.lineTo(x1, y); x.stroke(); if (fins) { x.strokeStyle = '#a78bfa'; const f = fins * 30; x.beginPath(); x.moveTo(x0 + f, y - 30); x.lineTo(x0, y); x.lineTo(x0 + f, y + 30); x.moveTo(x1 - f, y - 30); x.lineTo(x1, y); x.lineTo(x1 - f, y + 30); x.stroke(); } }; const ill = s > 4 ? (Math.random() < .5 ? 1 : -1) : 0; drawL(80, a, ill); drawL(220, b, -ill); return { q: c, opts: ['Верхний', 'Нижний'], ans: a > b ? 'Верхний' : 'Нижний', optSize: 20 }; } });
})();
