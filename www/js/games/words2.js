/* Дополнительные словесные игры */
(function () {
  const D = window.DICT;
  const pickWord = (min, max) => { const pool = D.all.filter(w => w.length >= min && w.length <= max); return pool[Math.floor(Math.random() * pool.length)]; };
  const pickCore = (min, max) => { const pool = D.fil.concat(D.five).filter(w => w.length >= min && w.length <= max); return pool[Math.floor(Math.random() * pool.length)]; };
  const wordBox = (h, word, cls) => h('div', { class: 'wd-row', style: 'justify-content:center;flex-wrap:wrap' }, word.split('').map(c => h('div', { class: 'wd-cell ' + (cls || ''), style: 'width:44px;height:44px;font-size:22px' }, c)));

  /* ---------- Анаграммы ---------- */
  Games.register({
    id: 'anagram', title: 'Анаграммы', icon: '🔀', cat: 'words', desc: 'Собери слово из перемешанных букв', progress: api => 'Уровень ' + (api.level('anagram').lvl + 1),
    mount(screen, api) {
      const { h } = api; const L = api.level('anagram'); let word, letters, cur, streakHint;
      function start() {
        const len = 4 + Math.min(3, Math.floor(L.lvl / 15)); word = pickCore(len, len); cur = [];
        do { letters = api.shuffle(word.split('').map((c, i) => ({ c, i, used: false }))); } while (letters.map(l => l.c).join('') === word);
        render();
      }
      function render() {
        screen.innerHTML = '';
        api.header(screen, [{ label: 'Уровень', value: L.lvl + 1 }, { btn: '💡 15', cls: 'gold', onClick: hint }, { btn: '⌫', onClick: () => { const l = cur.pop(); if (l) { l.used = false; render(); } } }]);
        const top = h('div', { class: 'wd-row', style: 'justify-content:center;min-height:56px' }, word.split('').map((_, i) => h('div', { class: 'wd-cell ' + (cur[i] ? 'g' : ''), style: 'width:44px;height:44px;font-size:22px' }, cur[i] ? cur[i].c : '')));
        const bottom = h('div', { class: 'wd-row', style: 'justify-content:center;flex-wrap:wrap' }, letters.map(l => h('div', { class: 'wd-cell', style: 'width:48px;height:48px;font-size:24px;' + (l.used ? 'opacity:.2' : ''), onclick: () => { if (l.used) return; l.used = true; cur.push(l); api.sound('tap'); check(); } }, l.c)));
        screen.append(h('div', { class: 'game-area', style: 'gap:30px' }, top, bottom));
      }
      function check() {
        if (cur.length < word.length) { render(); return; }
        const s = cur.map(l => l.c).join('');
        if (s === word || D.all.includes(s)) { L.done(); api.end({ title: 'Верно: ' + s.toUpperCase(), reward: 5 + word.length * 2, again: 'Дальше', onAgain: start }); }
        else { api.sound('bad'); api.vibrate(40); cur.forEach(l => l.used = false); cur = []; render(); api.toast('Не то слово'); }
      }
      function hint() { if (!api.spend(15)) return; const next = word[cur.length]; const l = letters.find(x => !x.used && x.c === next); if (l) { l.used = true; cur.push(l); } check(); }
      start();
    }
  });

  /* ---------- Виселица ---------- */
  Games.register({
    id: 'hangman', title: 'Виселица', icon: '🪢', cat: 'words', desc: 'Угадай слово по буквам', bestLabel: 'Побед',
    mount(screen, api) {
      const { h } = api; let word, guessed, wrong, wins = api.load('hangman_w', 0);
      const PARTS = ['😶', '😐', '😕', '😟', '😧', '😰', '💀'];
      function start() { word = pickCore(5, 8); guessed = new Set(); wrong = 0; render(); }
      function render() {
        screen.innerHTML = '';
        api.header(screen, [{ label: 'Ошибки', value: wrong + '/6' }, { label: 'Побед', value: wins }, { btn: '💡 20', cls: 'gold', onClick: () => { if (!api.spend(20)) return; const c = word.split('').find(c => !guessed.has(c)); if (c) press(c); } }]);
        const face = h('div', { style: 'font-size:80px;text-align:center' }, PARTS[wrong]);
        screen.append(h('div', { class: 'game-area', style: 'gap:24px' }, face, wordBox(h, word.split('').map(c => guessed.has(c) ? c : '_').join(''))));
        const kb = api.keyboard(press, { plain: true }); guessed.forEach(c => kb.mark(c, word.includes(c) ? 'g' : 'b'));
        screen.append(h('div', { class: 'bottom-bar' }, kb));
      }
      function press(c) {
        if (guessed.has(c)) return; guessed.add(c);
        if (!word.includes(c)) { wrong++; api.sound('bad'); api.vibrate(30); if (wrong >= 6) { api.end({ win: false, title: 'Проигрыш', text: 'Слово: ' + word.toUpperCase(), onAgain: start }); render(); return; } }
        else api.sound('good');
        render();
        if (word.split('').every(ch => guessed.has(ch))) { wins++; api.store('hangman_w', wins); api.best('hangman', wins); api.end({ title: 'Угадано: ' + word.toUpperCase(), reward: 10 + (6 - wrong) * 3, onAgain: start }); }
      }
      start();
    }
  });

  /* ---------- Пропущенная буква ---------- */
  Games.register({
    id: 'missing', title: 'Пропущенная буква', icon: '❓', cat: 'words', desc: 'Какой буквы не хватает? 20 вопросов', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; let q, score, word, pos, opts, streak;
      const ALPHA = 'абвгдежзийклмнопрстуфхцчшщыэюя';
      function start() { q = 0; score = 0; streak = 0; next(); }
      function next() {
        if (q >= 20) { api.best('missing', score); api.end({ title: 'Итог: ' + score + '/20', reward: score * 2, onAgain: start }); return; }
        q++; word = pickCore(5, 8); pos = api.rand(1, word.length - 2);
        const wrong = api.shuffle(ALPHA.split('').filter(c => c !== word[pos] && !D.all.includes(word.slice(0, pos) + c + word.slice(pos + 1)))).slice(0, 3);
        opts = api.shuffle([word[pos], ...wrong]); render();
      }
      function render() {
        screen.innerHTML = '';
        api.header(screen, [{ label: 'Вопрос', value: q + '/20' }, { label: 'Верно', value: score }, { label: 'Серия', value: streak }]);
        screen.append(h('div', { class: 'game-area', style: 'gap:30px' }, wordBox(h, word.slice(0, pos) + '_' + word.slice(pos + 1)),
          h('div', { class: 'row' }, opts.map(c => h('button', { class: 'btn', style: 'width:64px;height:64px;font-size:26px', onclick: () => pick(c) }, c.toUpperCase())))));
      }
      function pick(c) { if (c === word[pos]) { score++; streak++; api.sound('good'); if (streak % 5 === 0) api.addCoins(3); } else { streak = 0; api.sound('bad'); api.vibrate(40); api.toast('Правильно: ' + word.toUpperCase()); } next(); }
      start();
    }
  });

  /* ---------- Поиск слов ---------- */
  Games.register({
    id: 'wordsearch', title: 'Поиск слов', icon: '🔍', cat: 'words', desc: 'Слова по прямой в любом направлении', progress: api => 'Уровень ' + (api.level('wordsearch').lvl + 1),
    mount(screen, api) {
      const { h } = api; const L = api.level('wordsearch'); let N, grid, words, cells, sel = [], dragging = false, start0;
      const DIRS = [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]];
      function gen() {
        N = 7 + Math.min(4, Math.floor(L.lvl / 10)); const nw = 5 + Math.min(5, Math.floor(L.lvl / 5));
        for (let att = 0; att < 50; att++) {
          grid = Array(N * N).fill(''); words = [];
          const pool = api.shuffle(D.fil.filter(w => w.length <= N - 1)).slice(0, 80);
          for (const w of pool) {
            if (words.length >= nw) break;
            let placed = false;
            for (let t = 0; t < 40 && !placed; t++) {
              const [dr, dc] = DIRS[api.rand(0, L.lvl < 5 ? 1 : 7)]; const r = api.rand(0, N - 1), c = api.rand(0, N - 1);
              const er = r + dr * (w.length - 1), ec = c + dc * (w.length - 1); if (er < 0 || ec < 0 || er >= N || ec >= N) continue;
              let ok = true; for (let i = 0; i < w.length; i++) { const g = grid[(r + dr * i) * N + c + dc * i]; if (g && g !== w[i]) { ok = false; break; } }
              if (!ok) continue;
              const path = []; for (let i = 0; i < w.length; i++) { const k = (r + dr * i) * N + c + dc * i; grid[k] = w[i]; path.push(k); }
              words.push({ w, path, done: false }); placed = true;
            }
          }
          if (words.length >= nw) break;
        }
        const A = 'абвгдеиклмнопрстув'; grid = grid.map(c => c || A[api.rand(0, A.length - 1)]);
      }
      function render() {
        screen.innerHTML = '';
        api.header(screen, [{ label: 'Уровень', value: L.lvl + 1 }, { label: 'Найдено', value: words.filter(w => w.done).length + '/' + words.length }, { btn: '💡 20', cls: 'gold', onClick: hint }]);
        const size = Math.floor(Math.min(screen.clientWidth - 24, 420) / N) - 4;
        const g = h('div', { class: 'fil-grid', style: `grid-template-columns:repeat(${N},${size}px);grid-auto-rows:${size}px;font-size:${Math.round(size * .5)}px` }); cells = [];
        for (let i = 0; i < N * N; i++) { const done = words.find(w => w.done && w.path.includes(i)); const el = h('div', { class: 'fil-cell c' + (i % 6) + (done ? ' done' : ''), 'data-i': i }, grid[i]); cells.push(el); g.append(el); }
        g.addEventListener('pointerdown', e => { dragging = true; g.setPointerCapture(e.pointerId); const el = document.elementFromPoint(e.clientX, e.clientY); if (el && el.dataset.i) { start0 = +el.dataset.i; setSel([start0]); } });
        g.addEventListener('pointermove', e => { if (!dragging) return; const el = document.elementFromPoint(e.clientX, e.clientY); if (!el || !el.dataset.i) return; const t = +el.dataset.i; const r0 = Math.floor(start0 / N), c0 = start0 % N, r1 = Math.floor(t / N), c1 = t % N; const dr = Math.sign(r1 - r0), dc = Math.sign(c1 - c0); if (!(dr === 0 || dc === 0 || Math.abs(r1 - r0) === Math.abs(c1 - c0))) return; const n = Math.max(Math.abs(r1 - r0), Math.abs(c1 - c0)); const s = []; for (let i = 0; i <= n; i++) s.push((r0 + dr * i) * N + c0 + dc * i); setSel(s); });
        const up = () => { if (!dragging) return; dragging = false; check(); }; g.addEventListener('pointerup', up); g.addEventListener('pointercancel', up);
        screen.append(h('div', { class: 'game-area', style: 'justify-content:flex-start;overflow:auto' }, g, h('div', { class: 'fil-words' }, words.map(w => h('span', { class: 'fil-word ' + (w.done ? 'done' : '') }, w.w)))));
      }
      function setSel(s) { sel.forEach(i => cells[i].classList.remove('sel')); sel = s; sel.forEach(i => cells[i].classList.add('sel')); }
      function check() {
        const s = sel.map(i => grid[i]).join(''); const rs = s.split('').reverse().join('');
        const w = words.find(x => !x.done && (x.w === s || x.w === rs)); setSel([]);
        if (w) { w.done = true; api.sound('good'); api.vibrate([10, 30, 10]); if (words.every(x => x.done)) { L.done(); api.end({ title: 'Все слова найдены!', reward: 10 + N, again: 'Дальше', onAgain: () => { gen(); render(); } }); } render(); }
      }
      function hint() { const left = words.filter(w => !w.done); if (!left.length || !api.spend(20)) return; const w = left[0]; setSel([w.path[0]]); setTimeout(() => setSel([]), 1200); }
      gen(); render();
    }
  });

  /* ---------- Наборщик ---------- */
  Games.register({
    id: 'longword', title: 'Наборщик', icon: '⏱', cat: 'words', desc: 'За 90 секунд составь как можно больше слов', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; let base, found, cur, timeLeft, timer, hdr, kb, listEl, curEl;
      function start() {
        const pool = D.all.filter(w => w.length >= 8 && w.length <= 10); base = pool[api.rand(0, pool.length - 1)];
        found = []; cur = ''; timeLeft = 90; clearInterval(timer); timer = setInterval(() => { timeLeft--; hdr.set(1, timeLeft); if (timeLeft <= 0) finish(); }, 1000); render();
      }
      function render() {
        screen.innerHTML = '';
        hdr = api.header(screen, [{ label: 'Слов', value: found.length }, { label: '⏱', value: timeLeft }, { btn: 'Стоп', onClick: finish }]);
        curEl = h('div', { class: 'wow-current' }, cur);
        listEl = h('div', { class: 'fil-words' }, found.map(w => h('span', { class: 'fil-word' }, w)));
        screen.append(h('div', { class: 'game-area', style: 'justify-content:flex-start;gap:10px;overflow:auto' }, h('div', { style: 'font-size:28px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;padding:10px' }, base), curEl, listEl));
        kb = api.keyboard(press); screen.append(h('div', { class: 'bottom-bar' }, kb));
      }
      function press(k) {
        if (k === '⌫') cur = cur.slice(0, -1);
        else if (k === '⏎') submit();
        else if (cur.length < 10) cur += k;
        curEl.textContent = cur;
      }
      function submit() {
        const w = cur; cur = '';
        if (w.length < 3) return;
        const cnt = {}; for (const c of base) cnt[c] = (cnt[c] || 0) + 1; for (const c of w) { if (!cnt[c]) { api.toast('Таких букв нет'); api.sound('bad'); return; } cnt[c]--; }
        if (w === base) { api.toast('Это исходное слово'); return; }
        if (found.includes(w)) { api.toast('Уже есть'); return; }
        if (!D.all.includes(w)) { api.toast('Нет в словаре'); api.sound('bad'); api.vibrate(30); return; }
        found.push(w); api.sound('good'); hdr.set(0, found.length); listEl.prepend(h('span', { class: 'fil-word' }, w));
      }
      function finish() { clearInterval(timer); const score = found.reduce((s, w) => s + w.length, 0); api.best('longword', score); api.end({ title: 'Время вышло', reward: Math.floor(score / 2), text: `Слов: ${found.length}, очков: ${score}`, onAgain: start }); }
      this.unmount = () => clearInterval(timer);
      start();
    }
  });

  /* ---------- Буквенный дождь ---------- */
  Games.register({
    id: 'letterrain', title: 'Буквенный дождь', icon: '🌧', cat: 'words', desc: 'Лови падающие буквы в правильном порядке', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; const W = 360, H = 560; let cv, ctx, target, idx, drops, score, lives, raf, last, hdr, spawnT, alive, speed;
      screen.innerHTML = ''; hdr = api.header(screen, [{ label: 'Слово', value: '' }, { label: 'Счёт', value: 0 }, { label: '❤', value: 3 }]);
      const area = h('div', { class: 'game-area' }); screen.append(area); cv = api.canvas(area, W, H); ctx = cv.ctx;
      const A = 'абвгдеиклмнопрстув';
      function newWord() { target = pickCore(4, 6); idx = 0; drops = []; hdr.set(0, target.toUpperCase()); }
      function reset() { score = 0; lives = 3; alive = true; speed = 70; spawnT = 0; newWord(); hdr.set(1, 0); hdr.set(2, 3); }
      function update(dt) {
        spawnT -= dt; if (spawnT <= 0) { spawnT = 0.7; const need = Math.random() < 0.45; drops.push({ c: need ? target[idx] : A[api.rand(0, A.length - 1)], x: api.rand(30, W - 30), y: -20 }); }
        for (const d of drops) d.y += speed * dt;
        for (const d of drops) if (d.y > H + 20 && d.c === target[idx] && !d.gone) { d.gone = true; }
        drops = drops.filter(d => d.y < H + 30);
      }
      function draw() {
        ctx.fillStyle = '#171728'; ctx.fillRect(0, 0, W, H);
        ctx.font = 'bold 28px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        for (const d of drops) { ctx.fillStyle = '#26264a'; ctx.beginPath(); ctx.arc(d.x, d.y, 24, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillText(d.c.toUpperCase(), d.x, d.y + 2); }
        ctx.fillStyle = '#22d3ee'; ctx.font = 'bold 30px sans-serif'; ctx.fillText(target.slice(0, idx).toUpperCase() + '·'.repeat(target.length - idx), W / 2, H - 40);
      }
      function loop(t) { raf = requestAnimationFrame(loop); const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t; if (alive) { update(dt); draw(); } }
      cv.canvas.addEventListener('pointerdown', e => {
        if (!alive) return; const r = cv.canvas.getBoundingClientRect(); const x = (e.clientX - r.left) * W / r.width, y = (e.clientY - r.top) * H / r.height;
        let hit = null, bd = 34; for (const d of drops) { const dd = Math.hypot(d.x - x, d.y - y); if (dd < bd) { bd = dd; hit = d; } }
        if (!hit) return;
        if (hit.c === target[idx]) { drops = drops.filter(d => d !== hit); idx++; score += 5; api.sound('good'); api.vibrate(8); if (idx === target.length) { score += 20; speed += 12; api.addCoins(3); newWord(); } hdr.set(1, score); }
        else { lives--; hdr.set(2, lives); api.sound('bad'); api.vibrate(40); drops = drops.filter(d => d !== hit); if (lives <= 0) { alive = false; api.best('letterrain', score); api.end({ win: false, title: 'Игра окончена', reward: Math.floor(score / 20), text: 'Счёт: ' + score, onAgain: reset }); } }
      });
      this.unmount = () => { cancelAnimationFrame(raf); cv.destroy(); };
      reset(); raf = requestAnimationFrame(loop);
    }
  });

  /* ---------- Шифр Цезаря ---------- */
  Games.register({
    id: 'caesar', title: 'Шифровка', icon: '🔐', cat: 'words', desc: 'Расшифруй слово: буквы сдвинуты по алфавиту', progress: api => 'Уровень ' + (api.level('caesar').lvl + 1),
    mount(screen, api) {
      const { h } = api; const L = api.level('caesar'); const A = 'абвгдежзийклмнопрстуфхцчшщъыьэюя'; let word, shift, enc, cur, curEl;
      function start() { const len = 4 + Math.min(3, Math.floor(L.lvl / 20)); word = pickCore(len, len + 1); shift = api.rand(1, 5 + Math.min(20, L.lvl)); enc = word.split('').map(c => A[(A.indexOf(c) + shift) % A.length]).join(''); cur = ''; render(); }
      function render() {
        screen.innerHTML = '';
        api.header(screen, [{ label: 'Уровень', value: L.lvl + 1 }, { label: 'Сдвиг', value: L.lvl < 10 ? shift : '?' }, { btn: '💡 15', cls: 'gold', onClick: () => { if (api.spend(15)) api.toast('Сдвиг: ' + shift + ', первая буква: ' + word[0].toUpperCase()); } }]);
        curEl = h('div', { class: 'wow-current' }, cur);
        screen.append(h('div', { class: 'game-area', style: 'gap:20px' }, h('div', { class: 'hint-text' }, 'Зашифровано:'), wordBox(h, enc, 'y'), h('div', { class: 'hint-text' }, 'Ваш ответ:'), curEl));
        screen.append(h('div', { class: 'bottom-bar' }, api.keyboard(k => { if (k === '⌫') cur = cur.slice(0, -1); else if (k === '⏎') check(); else if (cur.length < 12) cur += k; curEl.textContent = cur; })));
      }
      function check() { if (cur === word) { L.done(); api.end({ title: 'Верно: ' + word.toUpperCase(), reward: 8 + shift, again: 'Дальше', onAgain: start }); } else { api.sound('bad'); api.vibrate(40); api.toast('Неверно'); cur = ''; curEl.textContent = ''; } }
      start();
    }
  });

  /* ---------- Быстрое чтение ---------- */
  Games.register({
    id: 'flash', title: 'Быстрое чтение', icon: '⚡', cat: 'brain', desc: 'Слово мелькает на миг — какое было?', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; let word, opts, q, score, showT, wordEl, timer;
      function start() { q = 0; score = 0; showT = 600; next(); }
      function next() {
        if (q >= 15) { api.best('flash', score); api.end({ title: 'Итог: ' + score + '/15', reward: score * 2, onAgain: start }); return; }
        q++; word = pickCore(5, 7);
        const sim = api.shuffle(D.all.filter(w => w.length === word.length && w !== word && w[0] === word[0])).slice(0, 3);
        while (sim.length < 3) sim.push(pickCore(word.length, word.length));
        opts = api.shuffle([word, ...sim]); render();
      }
      function render() {
        screen.innerHTML = '';
        api.header(screen, [{ label: 'Вопрос', value: q + '/15' }, { label: 'Верно', value: score }, { label: 'мс', value: showT }]);
        wordEl = h('div', { style: 'font-size:34px;font-weight:800;text-transform:uppercase;height:60px;letter-spacing:.08em' }, word);
        const btns = h('div', { class: 'row', style: 'flex-direction:column;width:100%;visibility:hidden' }, opts.map(o => h('button', { class: 'btn', style: 'width:80%', onclick: () => pick(o) }, o.toUpperCase())));
        screen.append(h('div', { class: 'game-area', style: 'gap:30px' }, wordEl, btns));
        clearTimeout(timer); timer = setTimeout(() => { wordEl.textContent = '•••'; btns.style.visibility = 'visible'; }, showT);
      }
      function pick(o) { if (o === word) { score++; api.sound('good'); showT = Math.max(150, showT - 40); } else { api.sound('bad'); api.vibrate(40); api.toast('Было: ' + word.toUpperCase()); showT = Math.min(800, showT + 60); } next(); }
      this.unmount = () => clearTimeout(timer);
      start();
    }
  });
})();
