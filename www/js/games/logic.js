/* Логические головоломки, часть 3 */
(function () {
  const gridEl = (h, n, size, cls) => h('div', { class: 'pz-grid ' + (cls || ''), style: `grid-template-columns:repeat(${n},${size}px);grid-auto-rows:${size}px` });
  const cellSize = (screen, n, max) => Math.floor(Math.min(screen.clientWidth - 30, max || 420) / n) - 3;
  const lvlGame = (id, title, icon, desc, build) => Games.register({ id, title, icon, cat: 'puzzle', desc, progress: api => 'Уровень ' + (api.level(id).lvl + 1), mount(screen, api) { const L = api.level(id); const nextLvl = () => { L.done(); }; build.call(this, screen, api, L, nextLvl); } });

  /* ---------- Сокобан ---------- */
  lvlGame('sokoban', 'Сокобан', '📦', 'Затолкай ящики на метки. Свайп — шаг', function (screen, api, L) {
    const { h } = api; let N, walls, boxes, targets, px, py, moves, hdr, cv, ctx;
    function gen() {
      N = 6 + Math.min(3, Math.floor(L.lvl / 10)); const nb = 1 + Math.min(3, Math.floor(L.lvl / 5));
      for (let att = 0; att < 200; att++) {
        walls = new Set(); for (let i = 0; i < N; i++) { walls.add(i); walls.add((N - 1) * N + i); walls.add(i * N); walls.add(i * N + N - 1); }
        for (let k = 0; k < N; k++) { const i = api.rand(N + 1, N * N - N - 2); walls.add(i); }
        // ставим ящики на цели, затем «вытягиваем» их обратными ходами
        const free = [...Array(N * N).keys()].filter(i => !walls.has(i)); api.shuffle(free);
        targets = free.slice(0, nb); boxes = targets.slice(); let p = free[nb]; if (p == null) continue; let ok = true;
        for (let s = 0; s < 30 + L.lvl * 3; s++) {
          const bi = api.rand(0, nb - 1); const b = boxes[bi]; const dirs = api.shuffle([1, -1, N, -N]); let done = false;
          for (const d of dirs) { const from = b - d, to = b + d; if (walls.has(from) || boxes.includes(from) || walls.has(to) || boxes.includes(to) || walls.has(to + d) || boxes.includes(to + d)) continue; if (to + d < 0 || to + d >= N * N) continue; boxes[bi] = to; p = to + d; done = true; break; }
          if (!done) { const d = api.shuffle([1, -1, N, -N]).find(d => !walls.has(p + d) && !boxes.includes(p + d)); if (d) p += d; }
        }
        if (boxes.some((b, i) => targets.includes(b))) continue;
        px = p % N; py = Math.floor(p / N); moves = 0; return;
      }
    }
    function render() { screen.innerHTML = ''; hdr = api.header(screen, [{ label: 'Уровень', value: L.lvl + 1 }, { label: 'Ходы', value: moves }, { btn: '↻', onClick: () => { gen(); render(); } }]); const area = h('div', { class: 'game-area' }); screen.append(area, h('div', { class: 'hint-text' }, 'Свайп — шаг, толкай ящики на метки')); cv = api.canvas(area, 400, 400); ctx = cv.ctx; api.swipe(cv.canvas, move); draw(); }
    function draw() { const cs = 400 / N; ctx.fillStyle = '#171728'; ctx.fillRect(0, 0, 400, 400); for (let i = 0; i < N * N; i++) { const x = (i % N) * cs, y = Math.floor(i / N) * cs; if (walls.has(i)) { ctx.fillStyle = '#3b3b6b'; ctx.fillRect(x, y, cs, cs); } if (targets.includes(i)) { ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(x + cs / 2, y + cs / 2, cs / 6, 0, 7); ctx.fill(); } if (boxes.includes(i)) { ctx.fillStyle = targets.includes(i) ? '#34d399' : '#b45309'; ctx.beginPath(); ctx.roundRect(x + 4, y + 4, cs - 8, cs - 8, 6); ctx.fill(); } } ctx.fillStyle = '#22d3ee'; ctx.beginPath(); ctx.arc(px * cs + cs / 2, py * cs + cs / 2, cs / 2 - 6, 0, 7); ctx.fill(); }
    function move(d) { const [dx, dy] = { l: [-1, 0], r: [1, 0], u: [0, -1], d: [0, 1] }[d] || [0, 0]; if (!dx && !dy) return; const nx = px + dx, ny = py + dy, ni = ny * N + nx; if (walls.has(ni)) return; const bi = boxes.indexOf(ni); if (bi >= 0) { const bn = ni + dy * N + dx; if (walls.has(bn) || boxes.includes(bn)) return; boxes[bi] = bn; } px = nx; py = ny; moves++; hdr.set(1, moves); api.sound('tap'); draw(); if (boxes.every(b => targets.includes(b))) { L.done(); api.end({ title: 'Все ящики на местах!', reward: 10 + boxes.length * 4, text: moves + ' ходов', again: 'Дальше', onAgain: () => { gen(); render(); } }); } }
    gen(); render();
  });

  /* ---------- Блоки 1010 ---------- */
  Games.register({ id: 'blocks', title: 'Блоки 10×10', icon: '🟦', cat: 'puzzle', desc: 'Ставь фигуры, заполняй линии — как тетрис без гравитации', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; const N = 10; const SHAPES = [[[1]], [[1, 1]], [[1], [1]], [[1, 1, 1]], [[1], [1], [1]], [[1, 1], [1, 1]], [[1, 1, 1, 1]], [[1], [1], [1], [1]], [[1, 0], [1, 1]], [[0, 1], [1, 1]], [[1, 1], [1, 0]], [[1, 1], [0, 1]], [[1, 1, 1], [1, 0, 0]], [[1, 0, 0], [1, 1, 1]], [[1, 1, 1], [1, 1, 1], [1, 1, 1]], [[1, 1, 1, 1, 1]], [[1], [1], [1], [1], [1]]];
      const COL = ['#f87171', '#34d399', '#60a5fa', '#fbbf24', '#c084fc', '#22d3ee', '#fb923c'];
      let g, hand, score, cells, hdr, sel = -1, handEl;
      function start() { g = Array(100).fill(null); score = 0; hand = [0, 0, 0].map(newPiece); sel = -1; render(); }
      function newPiece() { const k = api.rand(0, SHAPES.length - 1); return { m: SHAPES[k], c: COL[k % COL.length] }; }
      const fits = (p, r, c) => p.m.every((row, i) => row.every((v, j) => !v || (r + i < N && c + j < N && !g[(r + i) * N + c + j])));
      function render() {
        screen.innerHTML = ''; hdr = api.header(screen, [{ label: 'Счёт', value: score }, { label: 'Рекорд', value: api.bestOf('blocks') || 0 }, { btn: '↻', onClick: start }]);
        const size = cellSize(screen, N, 360); const b = gridEl(h, N, size); cells = [];
        for (let i = 0; i < 100; i++) { const el = h('div', { class: 'pz-cell', onclick: () => place(i) }); cells.push(el); b.append(el); }
        handEl = h('div', { class: 'row', style: 'gap:16px;padding-top:12px;min-height:90px' }); drawHand();
        screen.append(h('div', { class: 'game-area', style: 'justify-content:flex-start' }, b, handEl, h('div', { class: 'hint-text' }, 'Выбери фигуру, затем тап по левому верхнему углу места'))); paint();
      }
      function drawHand() { handEl.innerHTML = ''; hand.forEach((p, k) => { if (!p) { handEl.append(h('div', { style: 'width:70px' })); return; } const w = h('div', { style: 'display:grid;grid-template-columns:repeat(' + p.m[0].length + ',16px);gap:2px;padding:6px;border-radius:10px;' + (sel === k ? 'outline:3px solid var(--accent2)' : ''), onclick: () => { sel = k; drawHand(); api.sound('tap'); } }); p.m.forEach(r => r.forEach(v => w.append(h('div', { style: 'height:16px;border-radius:3px;background:' + (v ? p.c : 'transparent') })))); handEl.append(w); }); }
      function paint() { cells.forEach((el, i) => el.style.background = g[i] || 'var(--card)'); }
      function place(i) {
        if (sel < 0 || !hand[sel]) { api.toast('Сначала выбери фигуру'); return; } const p = hand[sel]; const r = Math.floor(i / N), c = i % N; if (!fits(p, r, c)) { api.sound('bad'); return; }
        p.m.forEach((row, di) => row.forEach((v, dj) => { if (v) g[(r + di) * N + c + dj] = p.c; })); score += p.m.flat().filter(Boolean).length; hand[sel] = null; sel = -1;
        const full = []; for (let k = 0; k < N; k++) { if ([...Array(N).keys()].every(j => g[k * N + j])) full.push(['r', k]); if ([...Array(N).keys()].every(j => g[j * N + k])) full.push(['c', k]); }
        full.forEach(([t, k]) => { for (let j = 0; j < N; j++) g[t === 'r' ? k * N + j : j * N + k] = null; }); if (full.length) { score += full.length * 10 * full.length; api.sound('good'); api.vibrate([10, 20, 10]); api.addCoins(full.length); } else api.sound('tap');
        if (hand.every(x => !x)) hand = [0, 0, 0].map(newPiece); hdr.set(0, score); api.best('blocks', score); paint(); drawHand();
        const canAny = hand.some(p => p && [...Array(100).keys()].some(k => fits(p, Math.floor(k / N), k % N)));
        if (!canAny) api.end({ title: 'Места нет', reward: Math.floor(score / 30), text: 'Счёт: ' + score, onAgain: start });
      }
      start();
    } });

  /* ---------- Бинарная головоломка (Такудзу) ---------- */
  lvlGame('takuzu', 'Бинарная', '🔳', 'В каждой строке поровну 0 и 1, не больше двух подряд', function (screen, api, L) {
    const { h } = api; let N, sol, st, given, cells;
    const okLine = a => { let c0 = 0, c1 = 0; for (let i = 0; i < a.length; i++) { if (a[i] === 0) c0++; else c1++; if (i >= 2 && a[i] === a[i - 1] && a[i] === a[i - 2]) return false; } return c0 === a.length / 2 && c1 === a.length / 2; };
    function solve(g, i) { if (i === N * N) { for (let r = 0; r < N; r++) if (!okLine(g.slice(r * N, r * N + N))) return false; for (let c = 0; c < N; c++) if (!okLine([...Array(N).keys()].map(r => g[r * N + c]))) return false; return true; } if (g[i] >= 0) return solve(g, i + 1); for (const v of api.shuffle([0, 1])) { g[i] = v; const r = Math.floor(i / N), c = i % N; if (c >= 2 && g[i - 1] === v && g[i - 2] === v) { g[i] = -1; continue; } if (r >= 2 && g[i - N] === v && g[i - 2 * N] === v) { g[i] = -1; continue; } const row = g.slice(r * N, r * N + N).filter(x => x === v).length; if (row > N / 2) { g[i] = -1; continue; } let col = 0; for (let k = 0; k <= r; k++) if (g[k * N + c] === v) col++; if (col > N / 2) { g[i] = -1; continue; } if (solve(g, i + 1)) return true; g[i] = -1; } return false; }
    function gen() { N = 6 + 2 * Math.min(2, Math.floor(L.lvl / 12)); sol = Array(N * N).fill(-1); solve(sol, 0); given = sol.map(() => Math.random() < 0.4 - L.lvl * 0.005); st = sol.map((v, i) => given[i] ? v : -1); }
    function render() { screen.innerHTML = ''; api.header(screen, [{ label: 'Уровень', value: L.lvl + 1 }, { label: '', value: N + '×' + N }, { btn: '💡 15', cls: 'gold', onClick: () => { const w = st.map((v, i) => v !== sol[i] ? i : -1).filter(i => i >= 0); if (!w.length || !api.spend(15)) return; const i = w[0]; st[i] = sol[i]; paint(); check(); } }]); const size = cellSize(screen, N, 380); const g = gridEl(h, N, size); cells = []; for (let i = 0; i < N * N; i++) { const el = h('div', { class: 'pz-cell num' + (given[i] ? ' given' : ''), onclick: () => { if (given[i]) return; st[i] = st[i] === -1 ? 0 : st[i] === 0 ? 1 : -1; api.sound('tap'); paint(); check(); } }); cells.push(el); g.append(el); } screen.append(h('div', { class: 'game-area' }, g, h('div', { class: 'hint-text' }, 'Тап: пусто → 0 → 1'))); paint(); }
    function paint() { cells.forEach((el, i) => { el.textContent = st[i] < 0 ? '' : st[i]; el.style.background = st[i] === 1 ? '#3b2f6d' : st[i] === 0 ? '#1f4d5c' : ''; el.style.opacity = given[i] ? .75 : 1; }); }
    function check() { if (st.every((v, i) => v === sol[i])) { L.done(); api.end({ title: 'Решено!', reward: 10 + N, again: 'Дальше', onAgain: () => { gen(); render(); } }); } }
    gen(); render();
  });

  /* ---------- Футошики ---------- */
  lvlGame('futoshiki', 'Футошики', '🔢', 'Латинский квадрат с неравенствами между клетками', function (screen, api, L) {
    const { h } = api; let N, sol, st, given, ineq, cells, sel = -1;
    function gen() { N = 4 + Math.min(2, Math.floor(L.lvl / 15)); const base = [...Array(N).keys()]; const p = api.shuffle(base.slice()), q = api.shuffle(base.slice()); sol = Array.from({ length: N * N }, (_, i) => (p[Math.floor(i / N)] + q[i % N]) % N + 1); given = sol.map(() => Math.random() < 0.25); st = sol.map((v, i) => given[i] ? v : 0); ineq = []; for (let i = 0; i < N * N; i++) { if (i % N < N - 1 && Math.random() < 0.3) ineq.push([i, i + 1]); if (i < N * N - N && Math.random() < 0.3) ineq.push([i, i + N]); } }
    function render() {
      screen.innerHTML = ''; api.header(screen, [{ label: 'Уровень', value: L.lvl + 1 }, { label: '', value: N + '×' + N }]);
      const size = cellSize(screen, N * 2, 400); const g = h('div', { style: `display:grid;grid-template-columns:repeat(${2 * N - 1},${size}px);grid-auto-rows:${size}px;gap:2px` }); cells = [];
      for (let r = 0; r < N; r++) { for (let c = 0; c < N; c++) { const i = r * N + c; const el = h('div', { class: 'pz-cell num', style: 'font-size:' + Math.round(size * .5) + 'px', onclick: () => { if (given[i]) return; sel = i; paint(); } }); cells.push(el); g.append(el); if (c < N - 1) { const q = ineq.find(x => x[0] === i && x[1] === i + 1); g.append(h('div', { class: 'ineq' }, q ? (sol[i] < sol[i + 1] ? '<' : '>') : '')); } } if (r < N - 1) for (let c = 0; c < 2 * N - 1; c++) { if (c % 2) { g.append(h('div')); continue; } const i = r * N + c / 2; const q = ineq.find(x => x[0] === i && x[1] === i + N); g.append(h('div', { class: 'ineq' }, q ? (sol[i] < sol[i + N] ? '∧' : '∨') : '')); } }
      const pad = h('div', { class: 'numpad', style: 'grid-template-columns:repeat(' + (N + 1) + ',1fr)' }); for (let n = 1; n <= N; n++) pad.append(h('button', { class: 'btn', onclick: () => put(n) }, n)); pad.append(h('button', { class: 'btn', onclick: () => put(0) }, '⌫'));
      screen.append(h('div', { class: 'game-area' }, g, pad)); paint();
    }
    function paint() { cells.forEach((el, i) => { el.textContent = st[i] || ''; el.classList.toggle('on', i === sel); el.style.opacity = given[i] ? .7 : 1; el.style.color = st[i] && st[i] !== sol[i] ? 'var(--red)' : ''; }); }
    function put(n) { if (sel < 0 || given[sel]) return; st[sel] = n; api.sound('tap'); paint(); if (st.every((v, i) => v === sol[i])) { L.done(); api.end({ title: 'Решено!', reward: 12 + N * 2, again: 'Дальше', onAgain: () => { gen(); sel = -1; render(); } }); } }
    gen(); render();
  });

  /* ---------- Магический квадрат ---------- */
  lvlGame('magic', 'Магический квадрат', '✨', 'Расставь числа так, чтобы суммы строк, столбцов и диагоналей совпали', function (screen, api, L) {
    const { h } = api; let N, nums, target, cells, sel = -1, sums;
    function gen() { N = 3 + (L.lvl >= 10 ? 1 : 0); const base = [...Array(N * N).keys()].map(i => i + 1); target = N * (N * N + 1) / 2; nums = api.shuffle(base); }
    const lineSums = () => { const out = []; for (let r = 0; r < N; r++) out.push(nums.slice(r * N, r * N + N).reduce((a, b) => a + b, 0)); for (let c = 0; c < N; c++) out.push([...Array(N).keys()].reduce((a, r) => a + nums[r * N + c], 0)); out.push([...Array(N).keys()].reduce((a, k) => a + nums[k * N + k], 0)); out.push([...Array(N).keys()].reduce((a, k) => a + nums[k * N + N - 1 - k], 0)); return out; };
    function render() { screen.innerHTML = ''; api.header(screen, [{ label: 'Уровень', value: L.lvl + 1 }, { label: 'Сумма', value: target }, { btn: '↻', onClick: () => { gen(); render(); } }]); const size = cellSize(screen, N + 1, 360); const g = gridEl(h, N + 1, size); cells = []; for (let r = 0; r < N; r++) { for (let c = 0; c < N; c++) { const i = r * N + c; const el = h('div', { class: 'pz-cell num', style: 'font-size:' + Math.round(size * .45) + 'px', onclick: () => tap(i) }); cells.push(el); g.append(el); } g.append(h('div', { class: 'pz-cell sum', 'data-s': r })); } for (let c = 0; c < N; c++) g.append(h('div', { class: 'pz-cell sum', 'data-s': N + c })); g.append(h('div', { class: 'pz-cell sum', 'data-s': 2 * N })); screen.append(h('div', { class: 'game-area' }, g, h('div', { class: 'hint-text' }, 'Тап по двум клеткам — поменять местами. Серые — текущие суммы'))); paint(); }
    function paint() { const s = lineSums(); cells.forEach((el, i) => { el.textContent = nums[i]; el.classList.toggle('on', i === sel); }); screen.querySelectorAll('.sum').forEach(el => { const k = +el.dataset.s; el.textContent = s[k]; el.style.color = s[k] === target ? 'var(--green)' : 'var(--muted)'; }); }
    function tap(i) { if (sel < 0) { sel = i; api.sound('tap'); paint(); return; } [nums[sel], nums[i]] = [nums[i], nums[sel]]; sel = -1; api.sound('select'); paint(); if (lineSums().every(s => s === target)) { L.done(); api.end({ title: 'Магия!', reward: 15 + (N - 3) * 15, again: 'Дальше', onAgain: () => { gen(); render(); } }); } }
    gen(); render();
  });

  /* ---------- Восемь ферзей ---------- */
  Games.register({ id: 'queens', title: 'Ферзи', icon: '👑', cat: 'puzzle', desc: 'Расставь ферзей так, чтобы никто никого не бил', progress: api => 'Уровень ' + (api.level('queens').lvl + 1),
    mount(screen, api) {
      const { h } = api; const L = api.level('queens'); let N, q, cells;
      function gen() { N = 5 + Math.min(4, Math.floor(L.lvl / 3)); q = new Set(); }
      const attacked = i => { const r = Math.floor(i / N), c = i % N; for (const k of q) { if (k === i) continue; const rr = Math.floor(k / N), cc = k % N; if (rr === r || cc === c || Math.abs(rr - r) === Math.abs(cc - c)) return true; } return false; };
      function render() { screen.innerHTML = ''; api.header(screen, [{ label: 'Уровень', value: L.lvl + 1 }, { label: 'Ферзей', value: q.size + '/' + N }, { btn: '↻', onClick: () => { q.clear(); paint(); } }]); const size = cellSize(screen, N, 400); const g = gridEl(h, N, size); cells = []; for (let i = 0; i < N * N; i++) { const el = h('div', { class: 'pz-cell', style: 'font-size:' + Math.round(size * .6) + 'px;background:' + ((Math.floor(i / N) + i) % 2 ? '#3b2f6d' : '#26264a'), onclick: () => { if (q.has(i)) q.delete(i); else if (q.size < N) q.add(i); api.sound('tap'); paint(); } }); cells.push(el); g.append(el); } screen.append(h('div', { class: 'game-area' }, g)); paint(); }
      function paint() { cells.forEach((el, i) => { el.textContent = q.has(i) ? '👑' : ''; el.style.outline = q.has(i) && attacked(i) ? '3px solid var(--red)' : ''; }); screen.querySelector('.game-top b:nth-of-type(1)'); screen.querySelectorAll('.stat b')[1].textContent = q.size + '/' + N; if (q.size === N && ![...q].some(attacked)) { L.done(); api.end({ title: 'Все ферзи в безопасности!', reward: 5 + N * 2, again: 'Дальше', onAgain: () => { gen(); render(); } }); } }
      gen(); render();
    } });

  /* ---------- Ход конём ---------- */
  Games.register({ id: 'knight', title: 'Ход конём', icon: '🐴', cat: 'puzzle', desc: 'Обойди конём все клетки, не повторяясь', progress: api => 'Уровень ' + (api.level('knight').lvl + 1),
    mount(screen, api) {
      const { h } = api; const L = api.level('knight'); let N, pos, visited, cells;
      function gen() { N = 5 + Math.min(3, Math.floor(L.lvl / 5)); pos = -1; visited = []; }
      const canMove = (a, b) => { const dr = Math.abs(Math.floor(a / N) - Math.floor(b / N)), dc = Math.abs(a % N - b % N); return (dr === 1 && dc === 2) || (dr === 2 && dc === 1); };
      function render() { screen.innerHTML = ''; api.header(screen, [{ label: 'Уровень', value: L.lvl + 1 }, { label: 'Клеток', value: '0/' + N * N }, { btn: '↻', onClick: () => { gen(); render(); } }]); const size = cellSize(screen, N, 400); const g = gridEl(h, N, size); cells = []; for (let i = 0; i < N * N; i++) { const el = h('div', { class: 'pz-cell', style: 'font-size:' + Math.round(size * .4) + 'px;background:' + ((Math.floor(i / N) + i) % 2 ? '#3b2f6d' : '#26264a'), onclick: () => tap(i) }); cells.push(el); g.append(el); } screen.append(h('div', { class: 'game-area' }, g, h('div', { class: 'hint-text' }, 'Подсвечены доступные ходы'))); paint(); }
      function paint() { cells.forEach((el, i) => { const k = visited.indexOf(i); el.textContent = k >= 0 ? (i === pos ? '🐴' : k + 1) : ''; el.style.outline = pos >= 0 && !visited.includes(i) && canMove(pos, i) ? '3px solid var(--accent2)' : ''; }); screen.querySelectorAll('.stat b')[1].textContent = visited.length + '/' + N * N; }
      function tap(i) { if (visited.includes(i)) return; if (pos >= 0 && !canMove(pos, i)) { api.sound('bad'); return; } pos = i; visited.push(i); api.sound('tap'); paint(); if (visited.length === N * N) { L.done(); api.end({ title: 'Обход завершён!', reward: 10 + N * 3, again: 'Дальше', onAgain: () => { gen(); render(); } }); return; } const any = [...Array(N * N).keys()].some(k => !visited.includes(k) && canMove(pos, k)); if (!any) api.end({ win: false, title: 'Тупик', text: 'Пройдено ' + visited.length + ' из ' + N * N, onAgain: () => { gen(); render(); } }); }
      gen(); render();
    } });

  /* ---------- Пег-солитер ---------- */
  Games.register({ id: 'pegs', title: 'Солитер с колышками', icon: '📍', cat: 'puzzle', desc: 'Прыгай через колышек, чтобы его убрать. Оставь один', bestLabel: 'Меньше осталось',
    mount(screen, api) {
      const { h } = api; const N = 7; let b, sel = -1, cells;
      const valid = i => { const r = Math.floor(i / N), c = i % N; return !((r < 2 || r > 4) && (c < 2 || c > 4)); };
      function start() { b = Array(49).fill(0).map((_, i) => valid(i) ? 1 : -1); b[24] = 0; sel = -1; render(); }
      function render() { screen.innerHTML = ''; api.header(screen, [{ label: 'Осталось', value: 32 }, { label: 'Рекорд', value: api.bestOf('pegs') != null ? api.bestOf('pegs') : '—' }, { btn: '↻', onClick: start }]); const size = cellSize(screen, N, 380); const g = gridEl(h, N, size); cells = []; for (let i = 0; i < 49; i++) { const el = h('div', { class: 'pz-cell round', style: valid(i) ? '' : 'visibility:hidden', onclick: () => tap(i) }); cells.push(el); g.append(el); } screen.append(h('div', { class: 'game-area' }, g)); paint(); }
      function paint() { cells.forEach((el, i) => { el.style.background = b[i] === 1 ? '#fbbf24' : b[i] === 0 ? 'var(--bg2)' : ''; el.style.outline = i === sel ? '3px solid var(--accent2)' : ''; }); screen.querySelectorAll('.stat b')[0].textContent = b.filter(v => v === 1).length; }
      function tap(i) { if (b[i] === 1) { sel = i; api.sound('tap'); paint(); return; } if (sel < 0 || b[i] !== 0) return; const mid = (sel + i) / 2; const dr = Math.abs(Math.floor(sel / N) - Math.floor(i / N)), dc = Math.abs(sel % N - i % N); if (!((dr === 2 && dc === 0) || (dr === 0 && dc === 2)) || b[mid] !== 1) { api.sound('bad'); return; } b[sel] = 0; b[mid] = 0; b[i] = 1; sel = -1; api.sound('good'); api.vibrate(8); paint(); const left = b.filter(v => v === 1).length; const any = b.some((v, k) => v === 1 && [1, -1, N, -N].some(d => b[k + d] === 1 && b[k + 2 * d] === 0 && Math.abs((k % N) - ((k + 2 * d) % N)) <= 2)); if (!any) { api.best('pegs', left, true); api.end({ win: left <= 1, title: left === 1 ? 'Идеально!' : 'Осталось: ' + left, reward: left === 1 ? 50 : left <= 3 ? 15 : left <= 6 ? 5 : 0, onAgain: start }); } }
      start();
    } });

  /* ---------- Игра 24 ---------- */
  Games.register({ id: 'game24', title: 'Игра 24', icon: '2️⃣4️⃣', cat: 'puzzle', desc: 'Из четырёх чисел получи 24 с помощью + − × ÷', bestLabel: 'Решено',
    mount(screen, api) {
      const { h } = api; let nums, cur, sel = -1, op = null, solved = api.load('g24', 0), hist;
      function solvable(a) { if (a.length === 1) return Math.abs(a[0] - 24) < 1e-6; for (let i = 0; i < a.length; i++) for (let j = 0; j < a.length; j++) { if (i === j) continue; const rest = a.filter((_, k) => k !== i && k !== j); for (const v of [a[i] + a[j], a[i] - a[j], a[i] * a[j], a[j] ? a[i] / a[j] : NaN]) if (!isNaN(v) && solvable([...rest, v])) return true; } return false; }
      function start() { do { nums = [0, 0, 0, 0].map(() => api.rand(1, 9)); } while (!solvable(nums)); cur = nums.slice(); hist = []; sel = -1; op = null; render(); }
      function render() { screen.innerHTML = ''; api.header(screen, [{ label: 'Решено', value: solved }, { btn: '↶', onClick: () => { if (hist.length) { cur = hist.pop(); sel = -1; op = null; render(); } } }, { btn: '↻', onClick: start }]); screen.append(h('div', { class: 'game-area', style: 'gap:24px' }, h('div', { class: 'hint-text' }, 'Число → операция → число'), h('div', { class: 'row' }, cur.map((v, i) => h('button', { class: 'btn ' + (sel === i ? 'primary' : ''), style: 'width:70px;height:70px;font-size:26px', onclick: () => pickNum(i) }, +v.toFixed(2)))), h('div', { class: 'row' }, ['+', '−', '×', '÷'].map(o => h('button', { class: 'btn ' + (op === o ? 'gold' : ''), style: 'width:56px;height:56px;font-size:24px', onclick: () => { if (sel >= 0) { op = o; api.sound('tap'); render(); } } }, o))))); }
      function pickNum(i) { if (sel < 0 || !op) { sel = i; op = null; api.sound('tap'); render(); return; } if (i === sel) return; const a = cur[sel], b = cur[i]; let v = op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : b ? a / b : NaN; if (isNaN(v)) { api.sound('bad'); return; } hist.push(cur.slice()); cur = cur.filter((_, k) => k !== sel && k !== i).concat([v]); sel = -1; op = null; api.sound('select'); render(); if (cur.length === 1) { if (Math.abs(cur[0] - 24) < 1e-6) { solved++; api.store('g24', solved); api.best('game24', solved); api.end({ title: '24!', reward: 12, again: 'Ещё', onAgain: start }); } else api.end({ win: false, title: 'Получилось ' + (+cur[0].toFixed(2)), text: 'Нужно 24', again: 'Заново', onAgain: () => { cur = nums.slice(); hist = []; render(); } }); } }
      start();
    } });

  /* ---------- Переливание ---------- */
  lvlGame('jugs', 'Переливание', '🫗', 'Отмерь нужный объём двумя сосудами', function (screen, api, L) {
    const { h } = api; let A, B, goal, a, b, moves;
    function gen() { const pairs = [[3, 5, 4], [5, 7, 6], [4, 9, 6], [3, 7, 5], [5, 8, 3], [7, 11, 2], [6, 10, 8], [5, 9, 7], [4, 7, 1], [8, 13, 5]]; [A, B, goal] = pairs[L.lvl % pairs.length]; if (L.lvl >= pairs.length) { const t = api.rand(1, A + B - 1); if (t !== A && t !== B) goal = t; } a = 0; b = 0; moves = 0; }
    function render() { screen.innerHTML = ''; api.header(screen, [{ label: 'Уровень', value: L.lvl + 1 }, { label: 'Нужно', value: goal + ' л' }, { label: 'Ходы', value: moves }]); const jug = (v, cap, name) => h('div', { style: 'display:flex;flex-direction:column;align-items:center;gap:6px' }, h('div', { style: `width:90px;height:${cap * 18 + 20}px;border:3px solid #55557a;border-top:0;border-radius:0 0 16px 16px;display:flex;align-items:flex-end;overflow:hidden` }, h('div', { style: `width:100%;height:${v / cap * 100}%;background:#22d3ee;transition:.3s` })), h('b', null, `${v} / ${cap} л`)); const btn = (t, f) => h('button', { class: 'btn small', onclick: () => { f(); moves++; api.sound('tap'); render(); check(); } }, t); screen.append(h('div', { class: 'game-area', style: 'gap:20px' }, h('div', { class: 'row', style: 'gap:40px;align-items:flex-end' }, jug(a, A, 'A'), jug(b, B, 'B')), h('div', { class: 'row' }, btn('Наполнить A', () => a = A), btn('Наполнить B', () => b = B), btn('Вылить A', () => a = 0), btn('Вылить B', () => b = 0), btn('A → B', () => { const t = Math.min(a, B - b); a -= t; b += t; }), btn('B → A', () => { const t = Math.min(b, A - a); b -= t; a += t; })))); }
    function check() { if (a === goal || b === goal) { L.done(); api.end({ title: 'Отмерено ' + goal + ' л!', reward: 10 + Math.max(0, 10 - moves), text: moves + ' ходов', again: 'Дальше', onAgain: () => { gen(); render(); } }); } }
    gen(); render();
  });

  /* ---------- Волк, коза и капуста ---------- */
  Games.register({ id: 'river', title: 'Волк, коза, капуста', icon: '🐐', cat: 'puzzle', desc: 'Перевези всех, никого не оставив наедине с обедом', bestLabel: 'Меньше рейсов',
    mount(screen, api) {
      const { h } = api; const ITEMS = [['🐺', 'Волк'], ['🐐', 'Коза'], ['🥬', 'Капуста']]; let side, boat, trips;
      function start() { side = [0, 0, 0]; boat = 0; trips = 0; render(); }
      function render() { screen.innerHTML = ''; api.header(screen, [{ label: 'Рейсов', value: trips }, { label: 'Рекорд', value: api.bestOf('river') || '—' }, { btn: '↻', onClick: start }]); const bank = s => h('div', { style: 'flex:1;min-height:120px;background:#166534;border-radius:14px;display:flex;flex-wrap:wrap;gap:8px;padding:10px;justify-content:center;align-content:center' }, ITEMS.map((it, i) => side[i] === s ? h('div', { style: 'font-size:44px', onclick: () => take(i) }, it[0]) : null)); screen.append(h('div', { class: 'game-area', style: 'gap:12px' }, h('div', { class: 'hint-text' }, 'Тап по животному — посадить в лодку (одно за раз). Лодка на ' + (boat ? 'правом' : 'левом') + ' берегу'), h('div', { class: 'row', style: 'width:100%;align-items:stretch' }, bank(0), h('div', { style: 'width:60px;display:flex;align-items:center;justify-content:center;font-size:40px' }, boat ? '➡️' : '⬅️'), bank(1)), h('button', { class: 'btn primary', onclick: () => go(-1) }, '⛵ Плыть пустым'))); }
      function take(i) { if (side[i] !== boat) return; go(i); }
      function go(i) { boat = 1 - boat; if (i >= 0) side[i] = boat; trips++; api.sound('tap'); const left = [0, 1, 2].filter(k => side[k] !== boat); if ((left.includes(0) && left.includes(1)) || (left.includes(1) && left.includes(2))) { render(); api.end({ win: false, title: 'Ой!', text: left.includes(0) && left.includes(1) ? 'Волк съел козу' : 'Коза съела капусту', onAgain: start }); return; } render(); if (side.every(s => s === 1)) { api.best('river', trips, true); api.end({ title: 'Все переправлены!', reward: trips <= 7 ? 20 : 10, text: trips + ' рейсов', onAgain: start }); } }
      start();
    } });

  /* ---------- Хидато ---------- */
  lvlGame('hidato', 'Хидато', '🔗', 'Соедини числа по порядку: каждое следующее — в соседней клетке', function (screen, api, L) {
    const { h } = api; let N, path, st, given, cells, next;
    function gen() { N = 4 + Math.min(3, Math.floor(L.lvl / 8)); let p; do { p = walk(); } while (!p); path = p; given = path.map((_, k) => k === 0 || k === path.length - 1 || Math.random() < 0.35 - L.lvl * 0.004); st = Array(N * N).fill(0); path.forEach((cell, k) => { if (given[k]) st[cell] = k + 1; }); next = 1; while (given[next - 1] && next < path.length) next++; }
    function walk() { const p = [api.rand(0, N * N - 1)]; const used = new Set(p); const dfs = () => { if (p.length === N * N) return true; const c = p[p.length - 1]; const r = Math.floor(c / N), cc = c % N; const nb = []; for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { if (!dr && !dc) continue; const rr = r + dr, c2 = cc + dc; if (rr < 0 || c2 < 0 || rr >= N || c2 >= N) continue; const i = rr * N + c2; if (!used.has(i)) nb.push(i); } for (const i of api.shuffle(nb)) { p.push(i); used.add(i); if (dfs()) return true; p.pop(); used.delete(i); } return false; }; return dfs() ? p : null; }
    function render() { screen.innerHTML = ''; api.header(screen, [{ label: 'Уровень', value: L.lvl + 1 }, { label: 'Следующее', value: next }, { btn: '↻', onClick: () => { gen(); render(); } }]); const size = cellSize(screen, N, 380); const g = gridEl(h, N, size); cells = []; for (let i = 0; i < N * N; i++) { const el = h('div', { class: 'pz-cell num', style: 'font-size:' + Math.round(size * .4) + 'px', onclick: () => tap(i) }); cells.push(el); g.append(el); } screen.append(h('div', { class: 'game-area' }, g, h('div', { class: 'hint-text' }, 'Тап по клетке ставит следующее число (соседство по 8 сторонам)'))); paint(); }
    function paint() { cells.forEach((el, i) => { const k = path.indexOf(i); el.textContent = st[i] || ''; el.style.opacity = st[i] && given[k] ? .7 : 1; el.style.color = st[i] && st[i] !== k + 1 ? 'var(--red)' : ''; }); screen.querySelectorAll('.stat b')[1].textContent = next; }
    function tap(i) { const k = path.indexOf(i); if (st[i] && given[k]) return; if (st[i]) { st[i] = 0; next = 1; while (next <= path.length && (given[next - 1] || st[path[next - 1]] === next) && st[path[next - 1]] === next) next++; api.sound('tap'); paint(); return; } const prev = path[next - 2]; const adj = prev == null || (Math.abs(Math.floor(prev / N) - Math.floor(i / N)) <= 1 && Math.abs(prev % N - i % N) <= 1); if (!adj) { api.sound('bad'); return; } st[i] = next; api.sound('tap'); while (next <= path.length && st[path[next - 1]] === next) next++; paint(); if (path.every((c, k) => st[c] === k + 1)) { L.done(); api.end({ title: 'Цепочка собрана!', reward: 10 + N * 2, again: 'Дальше', onAgain: () => { gen(); render(); } }); } }
    gen(); render();
  });

  /* ---------- Азбука Морзе ---------- */
  lvlGame('morse', 'Азбука Морзе', '📡', 'Расшифруй слово из точек и тире', function (screen, api, L) {
    const { h } = api; const M = { а: '·−', б: '−···', в: '·−−', г: '−−·', д: '−··', е: '·', ж: '···−', з: '−−··', и: '··', й: '·−−−', к: '−·−', л: '·−··', м: '−−', н: '−·', о: '−−−', п: '·−−·', р: '·−·', с: '···', т: '−', у: '··−', ф: '··−·', х: '····', ц: '−·−·', ч: '−−−·', ш: '−−−−', щ: '−−·−', ъ: '−−·−−', ы: '−·−−', ь: '−··−', э: '··−··', ю: '··−−', я: '·−·−' }; let word, cur, curEl;
    function gen() { const pool = window.DICT.fil.filter(w => w.length <= 4 + Math.min(3, Math.floor(L.lvl / 10))); word = pool[api.rand(0, pool.length - 1)]; cur = ''; }
    function render() { screen.innerHTML = ''; api.header(screen, [{ label: 'Уровень', value: L.lvl + 1 }, { btn: '📖 Таблица', onClick: () => api.modal({ title: 'Азбука Морзе', body: h('div', { style: 'columns:3;font-size:13px;text-align:left' }, Object.entries(M).map(([k, v]) => h('div', null, k.toUpperCase() + '  ' + v))) }) }]); curEl = h('div', { class: 'wow-current' }); screen.append(h('div', { class: 'game-area', style: 'gap:24px' }, h('div', { style: 'font-size:26px;letter-spacing:.15em;font-family:monospace;text-align:center;line-height:1.6' }, word.split('').map(c => M[c]).join('   ')), curEl)); screen.append(h('div', { class: 'bottom-bar' }, api.keyboard(k => { if (k === '⌫') cur = cur.slice(0, -1); else if (k === '⏎') check(); else if (cur.length < 10) cur += k; curEl.textContent = cur; }))); }
    function check() { if (cur === word) { L.done(); api.end({ title: 'Верно: ' + word.toUpperCase(), reward: 6 + word.length * 2, again: 'Дальше', onAgain: () => { gen(); render(); } }); } else { api.sound('bad'); api.vibrate(40); cur = ''; curEl.textContent = ''; } }
    gen(); render();
  });

  /* ---------- Судоку 4×4 ---------- */
  Games.register({ id: 'sudoku4', title: 'Судоку 4×4', icon: '4️⃣', cat: 'puzzle', desc: 'Самое маленькое судоку — на скорость', bestLabel: 'Решено',
    mount(screen, api) {
      const { h } = api; const N = 4; let sol, puz, board, sel = -1, cells, cnt = api.load('s4', 0);
      const ok = (g, r, c, n) => { for (let k = 0; k < N; k++) if (g[r * N + k] === n || g[k * N + c] === n) return false; const br = r - r % 2, bc = c - c % 2; for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) if (g[(br + i) * N + bc + j] === n) return false; return true; };
      const fill = g => { const i = g.indexOf(0); if (i < 0) return true; for (const n of api.shuffle([1, 2, 3, 4])) if (ok(g, Math.floor(i / N), i % N, n)) { g[i] = n; if (fill(g)) return true; g[i] = 0; } return false; };
      function start() { sol = Array(16).fill(0); fill(sol); puz = sol.map(v => Math.random() < 0.5 ? v : 0); board = puz.slice(); sel = -1; render(); }
      function render() { screen.innerHTML = ''; api.header(screen, [{ label: 'Решено', value: cnt }]); const size = cellSize(screen, N, 280); const g = h('div', { class: 'sud', style: `grid-template-columns:repeat(4,1fr);width:${size * N + 8}px` }); cells = []; for (let i = 0; i < 16; i++) { const r = Math.floor(i / N), c = i % N; const el = h('div', { class: 'sc' + (puz[i] ? ' given' : '') + (c === 1 ? ' br' : '') + (r === 1 ? ' bb' : ''), style: 'font-size:28px', onclick: () => { sel = i; paint(); } }); cells.push(el); g.append(el); } const pad = h('div', { class: 'numpad', style: 'grid-template-columns:repeat(5,1fr)' }); for (let n = 1; n <= 4; n++) pad.append(h('button', { class: 'btn', onclick: () => put(n) }, n)); pad.append(h('button', { class: 'btn', onclick: () => put(0) }, '⌫')); screen.append(h('div', { class: 'game-area' }, g, pad)); paint(); }
      function paint() { cells.forEach((el, i) => { el.textContent = board[i] || ''; el.classList.toggle('sel', i === sel); el.classList.toggle('err', board[i] && board[i] !== sol[i]); }); }
      function put(n) { if (sel < 0 || puz[sel]) return; board[sel] = n; api.sound('tap'); paint(); if (board.every((v, i) => v === sol[i])) { cnt++; api.store('s4', cnt); api.best('sudoku4', cnt); api.end({ title: 'Решено!', reward: 6, onAgain: start }); } }
      start();
    } });

  /* ---------- Восьмёрка (3×3) ---------- */
  Games.register({ id: 'slide3', title: 'Восьмёрка', icon: '🔳', cat: 'puzzle', desc: 'Пятнашки 3×3 — быстрая разминка', bestLabel: 'Меньше ходов',
    mount(screen, api) {
      const { h } = api; let b, moves, el, mv;
      function start() { b = [1, 2, 3, 4, 5, 6, 7, 8, 0]; let blank = 8; for (let i = 0; i < 200; i++) { const r = Math.floor(blank / 3), c = blank % 3; const o = []; if (r > 0) o.push(blank - 3); if (r < 2) o.push(blank + 3); if (c > 0) o.push(blank - 1); if (c < 2) o.push(blank + 1); const j = o[api.rand(0, o.length - 1)]; b[blank] = b[j]; b[j] = 0; blank = j; } moves = 0; render(); }
      function render() { screen.innerHTML = ''; mv = api.header(screen, [{ label: 'Ходы', value: 0 }, { label: 'Рекорд', value: api.bestOf('slide3') || '—' }, { btn: '↻', onClick: start }]); el = h('div', { class: 'f15', style: 'grid-template-columns:repeat(3,1fr);width:min(80vw,300px)' }); screen.append(h('div', { class: 'game-area' }, el)); paint(); }
      function paint() { el.innerHTML = ''; b.forEach((v, i) => el.append(h('div', { class: 't ' + (v ? '' : 'blank'), style: 'font-size:34px', onclick: () => tap(i) }, v || ''))); mv.set(0, moves); }
      function tap(i) { const bl = b.indexOf(0); if (!(Math.abs(bl - i) === 3 || (Math.abs(bl - i) === 1 && Math.floor(bl / 3) === Math.floor(i / 3)))) return; b[bl] = b[i]; b[i] = 0; moves++; api.sound('tap'); paint(); if (b.every((v, k) => v === (k + 1) % 9)) { api.best('slide3', moves, true); api.end({ title: 'Собрано!', reward: 8, text: moves + ' ходов', onAgain: start }); } }
      start();
    } });

  /* ---------- Пазл (перестановка) ---------- */
  lvlGame('jigsaw', 'Пазл', '🖼', 'Собери картинку, меняя плитки местами', function (screen, api, L) {
    const { h } = api; let N, order, sel = -1, img, cells, moves;
    function makeImage() { const c = document.createElement('canvas'); c.width = c.height = 360; const x = c.getContext('2d'); const g = x.createLinearGradient(0, 0, 360, 360); g.addColorStop(0, `hsl(${api.rand(0, 360)},70%,50%)`); g.addColorStop(1, `hsl(${api.rand(0, 360)},70%,40%)`); x.fillStyle = g; x.fillRect(0, 0, 360, 360); for (let i = 0; i < 12; i++) { x.fillStyle = `hsla(${api.rand(0, 360)},80%,70%,.8)`; x.beginPath(); if (i % 2) x.arc(api.rand(20, 340), api.rand(20, 340), api.rand(20, 70), 0, 7); else x.rect(api.rand(0, 300), api.rand(0, 300), api.rand(30, 100), api.rand(30, 100)); x.fill(); } x.strokeStyle = '#fff'; x.lineWidth = 6; x.beginPath(); x.moveTo(0, api.rand(0, 360)); x.lineTo(360, api.rand(0, 360)); x.stroke(); return c.toDataURL(); }
    function gen() { N = 3 + Math.min(3, Math.floor(L.lvl / 6)); img = makeImage(); do { order = api.shuffle([...Array(N * N).keys()]); } while (order.every((v, i) => v === i)); moves = 0; sel = -1; }
    function render() { screen.innerHTML = ''; api.header(screen, [{ label: 'Уровень', value: L.lvl + 1 }, { label: 'Ходы', value: 0 }, { btn: '👁', onClick: () => api.modal({ title: 'Оригинал', body: h('img', { src: img, style: 'width:100%;border-radius:12px' }) }) }]); const size = cellSize(screen, N, 360); const g = gridEl(h, N, size); cells = []; for (let i = 0; i < N * N; i++) { const el = h('div', { class: 'pz-cell', style: `background-image:url(${img});background-size:${size * N}px ${size * N}px`, onclick: () => tap(i) }); cells.push(el); g.append(el); } screen.append(h('div', { class: 'game-area' }, g)); paint(); }
    function paint() { cells.forEach((el, i) => { const p = order[i]; el.style.backgroundPosition = `-${(p % N) * (cellSize(screen, N, 360))}px -${Math.floor(p / N) * cellSize(screen, N, 360)}px`; el.style.outline = i === sel ? '3px solid var(--accent2)' : order[i] === i ? '2px solid rgba(52,211,153,.6)' : ''; }); screen.querySelectorAll('.stat b')[1].textContent = moves; }
    function tap(i) { if (sel < 0) { sel = i; api.sound('tap'); paint(); return; } [order[sel], order[i]] = [order[i], order[sel]]; sel = -1; moves++; api.sound('select'); paint(); if (order.every((v, k) => v === k)) { L.done(); api.end({ title: 'Картинка собрана!', reward: 8 + N * 3, text: moves + ' ходов', again: 'Дальше', onAgain: () => { gen(); render(); } }); } }
    gen(); render();
  });

  /* ---------- Поверни плитки ---------- */
  lvlGame('rotate', 'Поверни плитки', '🔄', 'Каждая плитка повёрнута — верни картинку', function (screen, api, L) {
    const { h } = api; let N, rot, cells, img;
    function gen() { N = 3 + Math.min(2, Math.floor(L.lvl / 8)); const c = document.createElement('canvas'); c.width = c.height = 360; const x = c.getContext('2d'); x.fillStyle = '#1e1e33'; x.fillRect(0, 0, 360, 360); x.strokeStyle = `hsl(${api.rand(0, 360)},80%,60%)`; x.lineWidth = 14; x.lineCap = 'round'; x.beginPath(); x.moveTo(20, 40); for (let i = 0; i < 6; i++) x.lineTo(api.rand(20, 340), api.rand(20, 340)); x.stroke(); x.fillStyle = `hsl(${api.rand(0, 360)},80%,60%)`; x.beginPath(); x.moveTo(180, 30); x.lineTo(330, 330); x.lineTo(30, 330); x.closePath(); x.globalAlpha = .5; x.fill(); img = c.toDataURL(); do { rot = Array.from({ length: N * N }, () => api.rand(0, 3)); } while (rot.every(r => !r)); }
    function render() { screen.innerHTML = ''; api.header(screen, [{ label: 'Уровень', value: L.lvl + 1 }, { btn: '👁', onClick: () => api.modal({ title: 'Оригинал', body: h('img', { src: img, style: 'width:100%;border-radius:12px' }) }) }]); const size = cellSize(screen, N, 360); const g = gridEl(h, N, size); cells = []; for (let i = 0; i < N * N; i++) { const el = h('div', { class: 'pz-cell', style: `background-image:url(${img});background-size:${size * N}px ${size * N}px;background-position:-${(i % N) * size}px -${Math.floor(i / N) * size}px;transition:transform .15s`, onclick: () => { rot[i] = (rot[i] + 1) % 4; api.sound('tap'); paint(); if (rot.every(r => !r)) { L.done(); api.end({ title: 'Готово!', reward: 6 + N * 2, again: 'Дальше', onAgain: () => { gen(); render(); } }); } } }); cells.push(el); g.append(el); } screen.append(h('div', { class: 'game-area' }, g, h('div', { class: 'hint-text' }, 'Тап — повернуть на 90°'))); paint(); }
    function paint() { cells.forEach((el, i) => el.style.transform = `rotate(${rot[i] * 90}deg)`); }
    gen(); render();
  });

  /* ---------- Раскраска по номерам ---------- */
  lvlGame('pixelart', 'Раскраска по номерам', '🎨', 'Закрась клетки цветом с нужным номером', function (screen, api, L) {
    const { h } = api; const PAL = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#c084fc', '#f472b6']; let N, pic, st, cur = 0, cells, nc;
    function gen() { N = 6 + Math.min(4, Math.floor(L.lvl / 6)); nc = 3 + Math.min(3, Math.floor(L.lvl / 8)); pic = Array(N * N).fill(0); for (let k = 0; k < nc; k++) { const cx = api.rand(1, N - 2), cy = api.rand(1, N - 2), r = api.rand(1, 3); for (let i = 0; i < N * N; i++) if (Math.hypot(i % N - cx, Math.floor(i / N) - cy) <= r) pic[i] = k; } st = Array(N * N).fill(-1); cur = 0; }
    function render() { screen.innerHTML = ''; api.header(screen, [{ label: 'Уровень', value: L.lvl + 1 }, { label: 'Осталось', value: N * N }]); const size = cellSize(screen, N, 380); const g = gridEl(h, N, size); cells = []; for (let i = 0; i < N * N; i++) { const el = h('div', { class: 'pz-cell', style: 'font-size:' + Math.round(size * .4) + 'px' }, pic[i] + 1); cells.push(el); g.append(el); } let drag = false; const paintAt = e => { const t = document.elementFromPoint(e.clientX, e.clientY); const i = cells.indexOf(t); if (i < 0 || st[i] >= 0) return; if (pic[i] === cur) { st[i] = cur; api.sound('select'); } else { api.sound('bad'); } paint(); }; g.addEventListener('pointerdown', e => { drag = true; g.setPointerCapture(e.pointerId); paintAt(e); }); g.addEventListener('pointermove', e => drag && paintAt(e)); g.addEventListener('pointerup', () => drag = false); screen.append(h('div', { class: 'game-area', style: 'justify-content:flex-start' }, g, h('div', { class: 'row', style: 'padding-top:12px' }, PAL.slice(0, nc).map((c, k) => h('div', { class: 'mm-peg big', style: 'background:' + c + ';display:flex;align-items:center;justify-content:center;font-weight:800;color:#111;' + (cur === k ? 'outline:3px solid #fff' : ''), onclick: () => { cur = k; api.sound('tap'); render(); } }, k + 1))))); paint(); }
    function paint() { let left = 0; cells.forEach((el, i) => { if (st[i] >= 0) { el.style.background = PAL[st[i]]; el.textContent = ''; } else left++; }); screen.querySelectorAll('.stat b')[1].textContent = left; if (!left) { L.done(); api.end({ title: 'Раскрашено!', reward: 8 + nc * 2, again: 'Дальше', onAgain: () => { gen(); render(); } }); } }
    gen(); render();
  });

  /* ---------- Найди отличия ---------- */
  Games.register({ id: 'spotdiff', title: 'Найди отличие', icon: '🔎', cat: 'puzzle', desc: 'Две картинки — одна фигура отличается. Найди её', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; let shapes, diffIdx, score, timeLeft, timer, cvA, cvB, hdr;
      function gen() { const n = 6 + Math.min(8, score); shapes = Array.from({ length: n }, () => ({ x: api.rand(20, 280), y: api.rand(20, 200), r: api.rand(10, 22), c: `hsl(${api.rand(0, 360)},70%,60%)`, t: api.rand(0, 2) })); diffIdx = api.rand(0, n - 1); }
      function drawOn(ctx, diff) { ctx.fillStyle = '#1e1e33'; ctx.fillRect(0, 0, 300, 220); shapes.forEach((s, i) => { let { x, y, r, c, t } = s; if (diff && i === diffIdx) { const k = api.rand(0, 2); if (k === 0) c = `hsl(${(parseInt(c.slice(4)) + 120) % 360},70%,60%)`; else if (k === 1) t = (t + 1) % 3; else r = r + 8; } ctx.fillStyle = c; ctx.beginPath(); if (t === 0) ctx.arc(x, y, r, 0, 7); else if (t === 1) ctx.rect(x - r, y - r, r * 2, r * 2); else { ctx.moveTo(x, y - r); ctx.lineTo(x + r, y + r); ctx.lineTo(x - r, y + r); ctx.closePath(); } ctx.fill(); }); }
      function next() { gen(); screen.innerHTML = ''; hdr = api.header(screen, [{ label: 'Найдено', value: score }, { label: '⏱', value: timeLeft }]); const area = h('div', { class: 'game-area', style: 'gap:10px' }); const a = h('div', { style: 'width:100%;max-width:300px' }), b = h('div', { style: 'width:100%;max-width:300px' }); area.append(a, b); screen.append(area, h('div', { class: 'hint-text' }, 'Тап по отличающейся фигуре на любой картинке')); cvA = api.canvas(a, 300, 220); cvB = api.canvas(b, 300, 220); drawOn(cvA.ctx, false); const seed = Math.random; drawOn(cvB.ctx, true); [cvA, cvB].forEach(cv => cv.canvas.addEventListener('pointerdown', e => { const r = cv.canvas.getBoundingClientRect(); const x = (e.clientX - r.left) * 300 / r.width, y = (e.clientY - r.top) * 220 / r.height; const s = shapes[diffIdx]; if (Math.hypot(x - s.x, y - s.y) < s.r + 14) { score++; api.sound('good'); api.vibrate(10); next(); } else { api.sound('bad'); timeLeft = Math.max(1, timeLeft - 3); hdr.set(1, timeLeft); } })); }
      function start() { score = 0; timeLeft = 60; clearInterval(timer); timer = setInterval(() => { timeLeft--; hdr.set(1, timeLeft); if (timeLeft <= 0) { clearInterval(timer); api.best('spotdiff', score); api.end({ title: 'Время вышло', reward: score, text: 'Найдено: ' + score, onAgain: start }); } }, 1000); next(); }
      this.unmount = () => clearInterval(timer); start();
    } });

  /* ---------- Продолжи ряд (фигуры) ---------- */
  Games.register({ id: 'pattern', title: 'Закономерность', icon: '🔺', cat: 'puzzle', desc: 'Какая фигура следующая в ряду?', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; const SH = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠', '⬛', '⬜']; let score, q, timeLeft, timer, hdr;
      function next() { const type = api.rand(0, 2); let seq, ans; const a = api.shuffle(SH.slice()).slice(0, 3); if (type === 0) { seq = [a[0], a[1], a[0], a[1], a[0]]; ans = a[1]; } else if (type === 1) { seq = [a[0], a[1], a[2], a[0], a[1]]; ans = a[2]; } else { seq = [a[0], a[0], a[1], a[0], a[0]]; ans = a[1]; } const opts = api.shuffle([...new Set([ans, ...api.shuffle(SH.slice()).slice(0, 3)])]).slice(0, 4); if (!opts.includes(ans)) opts[0] = ans;
        screen.innerHTML = ''; hdr = api.header(screen, [{ label: 'Счёт', value: score }, { label: '⏱', value: timeLeft }]); screen.append(h('div', { class: 'game-area', style: 'gap:30px' }, h('div', { style: 'font-size:40px;letter-spacing:.1em' }, seq.join(' ') + ' ?'), h('div', { class: 'row' }, opts.map(o => h('button', { class: 'btn', style: 'font-size:36px;padding:10px 16px', onclick: () => { if (o === ans) { score++; api.sound('good'); } else { api.sound('bad'); api.vibrate(40); } next(); } }, o))))); }
      function start() { score = 0; timeLeft = 45; clearInterval(timer); timer = setInterval(() => { timeLeft--; hdr.set(1, timeLeft); if (timeLeft <= 0) { clearInterval(timer); api.best('pattern', score); api.end({ title: 'Время вышло', reward: Math.floor(score / 2), text: 'Верно: ' + score, onAgain: start }); } }, 1000); next(); }
      this.unmount = () => clearInterval(timer); start();
    } });
})();
