/* Дополнительные головоломки, часть 2 */
(function () {
  const gridEl = (h, n, size, cls) => h('div', { class: 'pz-grid ' + (cls || ''), style: `grid-template-columns:repeat(${n},${size}px);grid-auto-rows:${size}px` });
  const cellSize = (screen, n, max) => Math.floor(Math.min(screen.clientWidth - 30, max || 420) / n) - 3;

  /* ---------- Арифметика ---------- */
  Games.register({
    id: 'math', title: 'Арифметика', icon: '➕', cat: 'brain', desc: 'Решай примеры на скорость, 60 секунд', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; let score, timeLeft, timer, hdr, ans, opts, streak;
      function start() { score = 0; streak = 0; timeLeft = 60; clearInterval(timer); timer = setInterval(() => { timeLeft--; hdr.set(1, timeLeft); if (timeLeft <= 0) finish(); }, 1000); next(); }
      function next() {
        const lvl = Math.floor(score / 5); let a, b, op, q;
        const ops = ['+', '-', '×', '÷'].slice(0, 2 + Math.min(2, lvl)); op = ops[api.rand(0, ops.length - 1)]; const mx = 10 + lvl * 8;
        if (op === '+') { a = api.rand(1, mx); b = api.rand(1, mx); ans = a + b; } else if (op === '-') { a = api.rand(1, mx); b = api.rand(1, a); ans = a - b; } else if (op === '×') { a = api.rand(2, 9 + lvl); b = api.rand(2, 9); ans = a * b; } else { b = api.rand(2, 9); ans = api.rand(2, 9 + lvl); a = ans * b; }
        q = `${a} ${op} ${b} = ?`; const set = new Set([ans]); while (set.size < 4) set.add(Math.max(0, ans + api.rand(-10, 10))); opts = api.shuffle([...set]);
        screen.innerHTML = ''; hdr = api.header(screen, [{ label: 'Счёт', value: score }, { label: '⏱', value: timeLeft }, { label: 'Серия', value: streak }]);
        screen.append(h('div', { class: 'game-area', style: 'gap:30px' }, h('div', { style: 'font-size:40px;font-weight:800' }, q), h('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:10px;width:min(90vw,320px)' }, opts.map(o => h('button', { class: 'btn', style: 'font-size:26px;padding:18px', onclick: () => pick(o) }, o)))));
      }
      function pick(o) { if (o === ans) { score++; streak++; api.sound('good'); if (streak % 10 === 0) { api.addCoins(5); timeLeft += 5; } } else { streak = 0; api.sound('bad'); api.vibrate(40); timeLeft = Math.max(1, timeLeft - 3); } next(); }
      function finish() { clearInterval(timer); api.best('math', score); api.end({ title: 'Время вышло', reward: Math.floor(score / 2), text: 'Решено: ' + score, onAgain: start }); }
      this.unmount = () => clearInterval(timer);
      start();
    }
  });

  /* ---------- Реакция ---------- */
  Games.register({
    id: 'reaction', title: 'Реакция', icon: '🟢', cat: 'brain', desc: 'Жми, как только экран станет зелёным', bestLabel: 'Лучшее (мс)',
    mount(screen, api) {
      const { h } = api; let state, t0, timer, results = [], box, txt;
      screen.innerHTML = ''; const hdr = api.header(screen, [{ label: 'Попытка', value: '1/5' }, { label: 'Лучшее', value: api.bestOf('reaction') ? api.bestOf('reaction') + ' мс' : '—' }]);
      box = h('div', { style: 'width:100%;height:100%;border-radius:18px;background:var(--card);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;text-align:center;padding:20px', onpointerdown: tap }); txt = box;
      screen.append(h('div', { class: 'game-area' }, box));
      function wait() { state = 'wait'; box.style.background = '#7f1d1d'; txt.textContent = 'Ждите зелёного…'; timer = setTimeout(() => { state = 'go'; box.style.background = '#15803d'; txt.textContent = 'ЖМИ!'; t0 = performance.now(); }, 1500 + Math.random() * 3000); }
      function tap() {
        if (state === 'idle') { wait(); return; }
        if (state === 'wait') { clearTimeout(timer); box.style.background = '#7f1d1d'; txt.textContent = 'Рано! Тап — заново'; state = 'idle'; api.sound('bad'); api.vibrate(40); return; }
        if (state === 'go') { const ms = Math.round(performance.now() - t0); results.push(ms); api.sound('good'); api.vibrate(10); state = 'idle'; box.style.background = 'var(--card)'; txt.textContent = ms + ' мс · тап — дальше'; hdr.set(0, Math.min(results.length + 1, 5) + '/5');
          if (results.length >= 5) { const avg = Math.round(results.reduce((a, b) => a + b) / 5); const best = Math.min(...results); api.best('reaction', best, true); api.end({ title: 'Среднее: ' + avg + ' мс', reward: avg < 250 ? 15 : avg < 350 ? 10 : 5, text: 'Лучшее: ' + best + ' мс', onAgain: () => { results = []; hdr.set(0, '1/5'); state = 'idle'; txt.textContent = 'Тап — начать'; box.style.background = 'var(--card)'; } }); } }
      }
      state = 'idle'; txt.textContent = 'Тап — начать';
      this.unmount = () => clearTimeout(timer);
    }
  });

  /* ---------- Сортировка шариков ---------- */
  Games.register({
    id: 'ballsort', title: 'Сортировка', icon: '🧪', cat: 'puzzle', desc: 'Разложи шарики по цветам в пробирки', progress: api => 'Уровень ' + (api.level('ballsort').lvl + 1),
    mount(screen, api) {
      const { h } = api; const L = api.level('ballsort'); const COLORS = ['#f87171', '#34d399', '#60a5fa', '#fbbf24', '#c084fc', '#22d3ee', '#fb923c', '#f472b6', '#a3e635', '#e879f9'];
      let tubes, sel = -1, moves, hdr, nc;
      function gen() {
        nc = 3 + Math.min(7, Math.floor(L.lvl / 4)); const balls = []; for (let c = 0; c < nc; c++) for (let i = 0; i < 4; i++) balls.push(c);
        do { api.shuffle(balls); tubes = []; for (let t = 0; t < nc; t++) tubes.push(balls.slice(t * 4, t * 4 + 4)); } while (tubes.some(t => t.every(b => b === t[0])));
        tubes.push([], []); moves = 0; sel = -1;
      }
      function render() {
        screen.innerHTML = ''; hdr = api.header(screen, [{ label: 'Уровень', value: L.lvl + 1 }, { label: 'Ходы', value: moves }, { btn: '↻', onClick: () => { gen(); render(); } }]);
        const wrap = h('div', { style: 'display:flex;flex-wrap:wrap;gap:10px;justify-content:center;max-width:400px' });
        tubes.forEach((t, i) => { const tube = h('div', { class: 'tube' + (sel === i ? ' sel' : ''), onclick: () => tap(i) }); for (let k = 3; k >= 0; k--) tube.append(h('div', { class: 'ball', style: t[k] != null ? 'background:' + COLORS[t[k]] : 'visibility:hidden' })); wrap.append(tube); });
        screen.append(h('div', { class: 'game-area' }, wrap));
      }
      function tap(i) {
        if (sel < 0) { if (tubes[i].length) { sel = i; api.sound('tap'); } render(); return; }
        if (sel === i) { sel = -1; render(); return; }
        const from = tubes[sel], to = tubes[i]; const b = from[from.length - 1];
        if (to.length >= 4 || (to.length && to[to.length - 1] !== b)) { api.sound('bad'); sel = -1; render(); return; }
        while (from.length && from[from.length - 1] === b && to.length < 4) to.push(from.pop());
        moves++; sel = -1; api.sound('select'); api.vibrate(6); render();
        if (tubes.every(t => !t.length || (t.length === 4 && t.every(x => x === t[0])))) { L.done(); api.end({ title: 'Всё отсортировано!', reward: 8 + nc * 3, text: moves + ' ходов', again: 'Дальше', onAgain: () => { gen(); render(); } }); }
      }
      gen(); render();
    }
  });

  /* ---------- Трубопровод ---------- */
  Games.register({
    id: 'pipes', title: 'Трубопровод', icon: '🔧', cat: 'puzzle', desc: 'Поворачивай трубы, чтобы вода дошла до всех', progress: api => 'Уровень ' + (api.level('pipes').lvl + 1),
    mount(screen, api) {
      const { h } = api; const L = api.level('pipes'); let N, conn, rot, cells, src;
      // conn[i] = битмаска направлений (1=up,2=right,4=down,8=left) в решённом состоянии
      function gen() {
        N = 4 + Math.min(5, Math.floor(L.lvl / 6)); conn = Array(N * N).fill(0); const vis = new Set([0]); const frontier = [0]; src = 0;
        while (vis.size < N * N) { // случайное остовное дерево (Prim)
          const i = frontier[api.rand(0, frontier.length - 1)]; const r = Math.floor(i / N), c = i % N;
          const nb = [[r - 1, c, 1, 4], [r, c + 1, 2, 8], [r + 1, c, 4, 1], [r, c - 1, 8, 2]].filter(([rr, cc]) => rr >= 0 && cc >= 0 && rr < N && cc < N && !vis.has(rr * N + cc));
          if (!nb.length) { frontier.splice(frontier.indexOf(i), 1); continue; }
          const [rr, cc, d, back] = nb[api.rand(0, nb.length - 1)]; const j = rr * N + cc; conn[i] |= d; conn[j] |= back; vis.add(j); frontier.push(j);
        }
        rot = conn.map(() => api.rand(0, 3));
      }
      const rotated = (m, r) => { for (let k = 0; k < r; k++) m = ((m << 1) | (m >> 3)) & 15; return m; };
      function reach() { const cur = conn.map((m, i) => rotated(m, rot[i])); const seen = new Set([src]); const st = [src]; while (st.length) { const i = st.pop(); const r = Math.floor(i / N), c = i % N; [[r - 1, c, 1, 4], [r, c + 1, 2, 8], [r + 1, c, 4, 1], [r, c - 1, 8, 2]].forEach(([rr, cc, d, back]) => { if (rr < 0 || cc < 0 || rr >= N || cc >= N) return; const j = rr * N + cc; if ((cur[i] & d) && (cur[j] & back) && !seen.has(j)) { seen.add(j); st.push(j); } }); } return seen; }
      function render() {
        screen.innerHTML = ''; api.header(screen, [{ label: 'Уровень', value: L.lvl + 1 }, { label: '', value: N + '×' + N }]);
        const size = cellSize(screen, N, 400); const g = gridEl(h, N, size); cells = [];
        for (let i = 0; i < N * N; i++) { const el = h('div', { class: 'pz-cell pipe', onclick: () => { rot[i] = (rot[i] + 1) % 4; api.sound('tap'); api.vibrate(5); paint(); check(); } }); const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 40 40'); el.append(s); cells.push(el); g.append(el); }
        screen.append(h('div', { class: 'game-area' }, g)); paint();
      }
      function paint() {
        const seen = reach();
        cells.forEach((el, i) => { const m = rotated(conn[i], rot[i]); const col = seen.has(i) ? '#22d3ee' : '#55557a'; let d = ''; if (m & 1) d += 'M20 20V0 '; if (m & 2) d += 'M20 20H40 '; if (m & 4) d += 'M20 20V40 '; if (m & 8) d += 'M20 20H0 '; el.firstChild.innerHTML = `<path d="${d}" stroke="${col}" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="20" cy="20" r="${i === src ? 9 : 5}" fill="${i === src ? '#fbbf24' : col}"/>`; });
      }
      function check() { if (reach().size === N * N) { L.done(); api.end({ title: 'Вода везде!', reward: 8 + N * 2, again: 'Дальше', onAgain: () => { gen(); render(); } }); } }
      gen(); render();
    }
  });

  /* ---------- Десяточка ---------- */
  Games.register({
    id: 'ten', title: 'Десяточка', icon: '🔟', cat: 'puzzle', desc: 'Выделяй соседние цифры с суммой 10', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; const N = 7; let g, sel = [], score, cells, hdr, drag = false, movesLeft;
      function start() { g = Array.from({ length: N * N }, () => api.rand(1, 9)); score = 0; movesLeft = 40; render(); }
      function render() {
        screen.innerHTML = ''; hdr = api.header(screen, [{ label: 'Счёт', value: score }, { label: 'Ходов', value: movesLeft }, { label: 'Рекорд', value: api.bestOf('ten') || 0 }]);
        const size = cellSize(screen, N, 400); const el = gridEl(h, N, size); cells = [];
        for (let i = 0; i < N * N; i++) { const c = h('div', { class: 'pz-cell num', 'data-i': i, style: 'font-size:' + Math.round(size * .45) + 'px' }, g[i] || ''); cells.push(c); el.append(c); }
        el.addEventListener('pointerdown', e => { drag = true; el.setPointerCapture(e.pointerId); sel = []; pick(e); });
        el.addEventListener('pointermove', e => drag && pick(e));
        const up = () => { if (!drag) return; drag = false; check(); }; el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
        screen.append(h('div', { class: 'game-area' }, el, h('div', { class: 'hint-text' }, 'Проведи по соседним клеткам, чтобы сумма была 10')));
      }
      function pick(e) { const t = document.elementFromPoint(e.clientX, e.clientY); if (!t || !t.dataset.i) return; const i = +t.dataset.i; if (!g[i] || sel.includes(i)) return; if (sel.length) { const p = sel[sel.length - 1]; if (!(Math.abs(p - i) === N || (Math.abs(p - i) === 1 && Math.floor(p / N) === Math.floor(i / N)))) return; } sel.push(i); cells[i].classList.add('on'); api.sound('select'); }
      function check() {
        const sum = sel.reduce((s, i) => s + g[i], 0); const s = sel.slice(); sel.forEach(i => cells[i].classList.remove('on')); sel = [];
        if (s.length < 2) return; movesLeft--; hdr.set(1, movesLeft);
        if (sum === 10) { score += s.length * s.length; s.forEach(i => { g[i] = 0; }); api.sound('good'); api.vibrate([10, 20, 10]); if (s.length >= 3) api.addCoins(s.length - 2); hdr.set(0, score); }
        else { api.sound('bad'); api.vibrate(30); }
        // гравитация
        for (let c = 0; c < N; c++) { const col = []; for (let r = N - 1; r >= 0; r--) if (g[r * N + c]) col.push(g[r * N + c]); for (let r = N - 1; r >= 0; r--) g[r * N + c] = col[N - 1 - r] || 0; }
        cells.forEach((el, i) => el.textContent = g[i] || '');
        if (movesLeft <= 0 || !g.some(Boolean)) { api.best('ten', score); api.end({ title: 'Игра окончена', reward: Math.floor(score / 20), text: 'Счёт: ' + score, onAgain: start }); }
      }
      start();
    }
  });

  /* ---------- Три в ряд ---------- */
  Games.register({
    id: 'match3', title: 'Три в ряд', icon: '💎', cat: 'puzzle', desc: 'Меняй соседние камни, собирай ряды из 3+', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; const N = 8, GEMS = ['🔴', '🟢', '🔵', '🟡', '🟣', '🟠']; let g, cells, score, moves, hdr, sel = -1, busy = false;
      function start() { do { g = Array.from({ length: N * N }, () => api.rand(0, 5)); } while (matches().size); score = 0; moves = 30; render(); }
      function matches() { const m = new Set(); for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) { const i = r * N + c; if (c < N - 2 && g[i] === g[i + 1] && g[i] === g[i + 2] && g[i] >= 0) { m.add(i); m.add(i + 1); m.add(i + 2); } if (r < N - 2 && g[i] === g[i + N] && g[i] === g[i + 2 * N] && g[i] >= 0) { m.add(i); m.add(i + N); m.add(i + 2 * N); } } return m; }
      function render() {
        screen.innerHTML = ''; hdr = api.header(screen, [{ label: 'Счёт', value: score }, { label: 'Ходов', value: moves }, { label: 'Рекорд', value: api.bestOf('match3') || 0 }]);
        const size = cellSize(screen, N, 400); const el = gridEl(h, N, size); cells = [];
        for (let i = 0; i < N * N; i++) { const c = h('div', { class: 'pz-cell', style: 'font-size:' + Math.round(size * .6) + 'px;background:transparent', onclick: () => tap(i) }); cells.push(c); el.append(c); }
        api.swipe(el, (d, e) => { if (d === 'tap') return; const t = document.elementFromPoint(e.clientX, e.clientY); });
        screen.append(h('div', { class: 'game-area' }, el)); paint();
      }
      function paint() { cells.forEach((c, i) => { c.textContent = g[i] >= 0 ? GEMS[g[i]] : ''; c.classList.toggle('on', i === sel); }); }
      async function tap(i) {
        if (busy) return;
        if (sel < 0) { sel = i; paint(); api.sound('tap'); return; }
        const adj = Math.abs(sel - i) === N || (Math.abs(sel - i) === 1 && Math.floor(sel / N) === Math.floor(i / N));
        if (!adj) { sel = i; paint(); return; }
        [g[sel], g[i]] = [g[i], g[sel]]; const a = sel; sel = -1; paint();
        if (!matches().size) { await sleep(150); [g[a], g[i]] = [g[i], g[a]]; paint(); api.sound('bad'); return; }
        moves--; hdr.set(1, moves); busy = true; let combo = 0;
        while (true) { const m = matches(); if (!m.size) break; combo++; score += m.size * 10 * combo; hdr.set(0, score); api.sound('good'); api.vibrate(10); m.forEach(k => cells[k].style.opacity = .2); await sleep(200); m.forEach(k => g[k] = -1); m.forEach(k => cells[k].style.opacity = 1);
          for (let c = 0; c < N; c++) { const col = []; for (let r = N - 1; r >= 0; r--) if (g[r * N + c] >= 0) col.push(g[r * N + c]); for (let r = N - 1; r >= 0; r--) g[r * N + c] = col[N - 1 - r] != null ? col[N - 1 - r] : api.rand(0, 5); }
          paint(); await sleep(150); }
        if (combo >= 2) api.addCoins(combo); busy = false;
        if (moves <= 0) { api.best('match3', score); api.end({ title: 'Ходы закончились', reward: Math.floor(score / 100), text: 'Счёт: ' + score, onAgain: start }); }
      }
      const sleep = ms => new Promise(r => setTimeout(r, ms));
      start();
    }
  });

  /* ---------- Пузыри (SameGame) ---------- */
  Games.register({
    id: 'samegame', title: 'Пузыри', icon: '🫧', cat: 'puzzle', desc: 'Лопай группы одинаковых пузырей', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; const W = 10, H = 12; const COLORS = ['#f87171', '#34d399', '#60a5fa', '#fbbf24', '#c084fc']; let g, cells, score, hdr;
      function start() { g = Array.from({ length: W * H }, () => api.rand(0, 3)); score = 0; render(); }
      function render() {
        screen.innerHTML = ''; hdr = api.header(screen, [{ label: 'Счёт', value: score }, { label: 'Рекорд', value: api.bestOf('samegame') || 0 }, { btn: '↻', onClick: start }]);
        const size = cellSize(screen, W, 380); const el = gridEl(h, W, size); cells = [];
        for (let i = 0; i < W * H; i++) { const c = h('div', { class: 'pz-cell round', onclick: () => tap(i) }); cells.push(c); el.append(c); }
        screen.append(h('div', { class: 'game-area' }, el, h('div', { class: 'hint-text' }, 'Группа из N пузырей даёт (N-1)² очков'))); paint();
      }
      function paint() { cells.forEach((c, i) => { c.style.background = g[i] >= 0 ? COLORS[g[i]] : 'transparent'; }); }
      function group(i) { const col = g[i]; if (col < 0) return []; const seen = new Set([i]); const st = [i]; while (st.length) { const k = st.pop(); const r = Math.floor(k / W), c = k % W; [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].forEach(([rr, cc]) => { if (rr < 0 || cc < 0 || rr >= H || cc >= W) return; const j = rr * W + cc; if (g[j] === col && !seen.has(j)) { seen.add(j); st.push(j); } }); } return [...seen]; }
      function tap(i) {
        const gr = group(i); if (gr.length < 2) { api.sound('bad'); return; }
        gr.forEach(k => g[k] = -1); score += (gr.length - 1) ** 2; hdr.set(0, score); api.sound('good'); api.vibrate(8); if (gr.length >= 8) api.addCoins(2);
        for (let c = 0; c < W; c++) { const col = []; for (let r = H - 1; r >= 0; r--) if (g[r * W + c] >= 0) col.push(g[r * W + c]); for (let r = H - 1; r >= 0; r--) g[r * W + c] = col[H - 1 - r] != null ? col[H - 1 - r] : -1; }
        // сдвиг пустых столбцов влево
        const cols = []; for (let c = 0; c < W; c++) if (g[(H - 1) * W + c] >= 0) cols.push(c);
        const ng = Array(W * H).fill(-1); cols.forEach((c, nc) => { for (let r = 0; r < H; r++) ng[r * W + nc] = g[r * W + c]; }); g = ng; paint();
        const any = g.some((v, k) => v >= 0 && group(k).length >= 2);
        if (!any) { const left = g.filter(v => v >= 0).length; if (!left) score += 500; api.best('samegame', score); api.end({ title: left ? 'Ходов больше нет' : 'Поле очищено!', reward: Math.floor(score / 50), text: 'Счёт: ' + score, onAgain: start }); }
      }
      start();
    }
  });

  /* ---------- Мини-судоку 6×6 ---------- */
  Games.register({
    id: 'sudoku6', title: 'Мини-судоку', icon: '6️⃣', cat: 'puzzle', desc: 'Судоку 6×6 с блоками 2×3', progress: api => 'Уровень ' + (api.level('sudoku6').lvl + 1),
    mount(screen, api) {
      const { h } = api; const L = api.level('sudoku6'); const N = 6; let sol, puz, board, sel = -1, cells;
      const ok = (g, r, c, n) => { for (let k = 0; k < N; k++) if (g[r * N + k] === n || g[k * N + c] === n) return false; const br = r - r % 2, bc = c - c % 3; for (let i = 0; i < 2; i++) for (let j = 0; j < 3; j++) if (g[(br + i) * N + bc + j] === n) return false; return true; };
      const fill = g => { const i = g.indexOf(0); if (i < 0) return true; const r = Math.floor(i / N), c = i % N; for (const n of api.shuffle([1, 2, 3, 4, 5, 6])) if (ok(g, r, c, n)) { g[i] = n; if (fill(g)) return true; g[i] = 0; } return false; };
      const count = (g, lim) => { const i = g.indexOf(0); if (i < 0) return 1; const r = Math.floor(i / N), c = i % N; let cnt = 0; for (let n = 1; n <= N && cnt < lim; n++) if (ok(g, r, c, n)) { g[i] = n; cnt += count(g, lim - cnt); g[i] = 0; } return cnt; };
      function gen() { sol = Array(36).fill(0); fill(sol); puz = sol.slice(); const target = 36 - (18 - Math.min(6, Math.floor(L.lvl / 5))); let removed = 0; for (const i of api.shuffle([...Array(36).keys()])) { if (removed >= target) break; const v = puz[i]; puz[i] = 0; if (count(puz.slice(), 2) !== 1) puz[i] = v; else removed++; } board = puz.slice(); sel = -1; }
      function render() {
        screen.innerHTML = ''; api.header(screen, [{ label: 'Уровень', value: L.lvl + 1 }, { btn: '💡 15', cls: 'gold', onClick: () => { const e = board.map((v, i) => v === sol[i] ? -1 : i).filter(i => i >= 0); if (!e.length || !api.spend(15)) return; const i = sel >= 0 && board[sel] !== sol[sel] ? sel : e[0]; board[i] = sol[i]; paint(); check(); } }]);
        const size = cellSize(screen, N, 360); const g = h('div', { class: 'sud', style: `grid-template-columns:repeat(6,1fr);width:${size * N + 8}px` }); cells = [];
        for (let i = 0; i < 36; i++) { const r = Math.floor(i / N), c = i % N; const el = h('div', { class: 'sc' + (puz[i] ? ' given' : '') + (c === 2 ? ' br' : '') + (r % 2 === 1 && r < 5 ? ' bb' : ''), onclick: () => { sel = i; paint(); } }); cells.push(el); g.append(el); }
        const pad = h('div', { class: 'numpad', style: 'grid-template-columns:repeat(7,1fr)' }); for (let n = 1; n <= 6; n++) pad.append(h('button', { class: 'btn', onclick: () => put(n) }, n)); pad.append(h('button', { class: 'btn', onclick: () => put(0) }, '⌫'));
        screen.append(h('div', { class: 'game-area' }, g, pad)); paint();
      }
      function paint() { cells.forEach((el, i) => { el.textContent = board[i] || ''; el.classList.toggle('sel', i === sel); el.classList.toggle('err', board[i] && board[i] !== sol[i]); }); }
      function put(n) { if (sel < 0 || puz[sel]) return; board[sel] = n; api.sound('tap'); if (n && n !== sol[sel]) { api.sound('bad'); api.vibrate(30); } paint(); check(); }
      function check() { if (board.every((v, i) => v === sol[i])) { L.done(); api.end({ title: 'Решено!', reward: 15, again: 'Дальше', onAgain: () => { gen(); render(); } }); } }
      gen(); render();
    }
  });
})();
