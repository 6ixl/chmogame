/* Тетрис */
Games.register({
  id: 'tetris', title: 'Тетрис', icon: '🧱', cat: 'arcade', desc: 'Складывай фигуры, собирай линии', bestLabel: 'Рекорд',
  mount(screen, api) {
    const { h } = api;
    const COLS = 10, ROWS = 20, CS = 26;
    const SHAPES = { I: [[1, 1, 1, 1]], O: [[1, 1], [1, 1]], T: [[0, 1, 0], [1, 1, 1]], S: [[0, 1, 1], [1, 1, 0]], Z: [[1, 1, 0], [0, 1, 1]], J: [[1, 0, 0], [1, 1, 1]], L: [[0, 0, 1], [1, 1, 1]] };
    const COLORS = { I: '#22d3ee', O: '#fbbf24', T: '#a855f7', S: '#34d399', Z: '#f87171', J: '#60a5fa', L: '#fb923c' };
    let cv, ctx, board, cur, next, score, lines, level, alive, raf, last, dropT, scoreEl, linesEl, paused = false, bag = [];
    screen.innerHTML = ''; scoreEl = h('b', null, 0); linesEl = h('b', null, 0);
    screen.append(h('div', { class: 'game-top' }, h('div', { class: 'stat' }, 'Счёт ', scoreEl), h('div', { class: 'stat' }, 'Линии ', linesEl), h('div', { class: 'stat' }, 'Рекорд ', h('b', null, api.bestOf('tetris') || 0))));
    const area = h('div', { class: 'game-area' }); screen.append(area);
    cv = api.canvas(area, COLS * CS + 90, ROWS * CS); ctx = cv.ctx;
    const mk = (cls, fn, label) => h('button', { class: 'btn ' + cls, style: 'flex:1;font-size:22px;padding:12px 0', onpointerdown: e => { e.preventDefault(); fn(); } }, label);
    screen.append(h('div', { class: 'bottom-bar row', style: 'flex-wrap:nowrap' }, mk('', () => move(-1), '◀'), mk('', rotate, '⟳'), mk('', () => move(1), '▶'), mk('', softDrop, '▼'), mk('primary', hardDrop, '⤓')));
    function piece() { if (!bag.length) bag = api.shuffle(Object.keys(SHAPES)); const k = bag.pop(); return { k, m: SHAPES[k].map(r => r.slice()), x: Math.floor((COLS - SHAPES[k][0].length) / 2), y: 0 }; }
    function reset() { board = Array.from({ length: ROWS }, () => Array(COLS).fill(null)); score = 0; lines = 0; level = 1; alive = true; bag = []; cur = piece(); next = piece(); dropT = 0; scoreEl.textContent = 0; linesEl.textContent = 0; }
    const fits = (m, x, y) => m.every((r, i) => r.every((v, j) => !v || (y + i >= 0 && y + i < ROWS && x + j >= 0 && x + j < COLS && !board[y + i][x + j])));
    function move(d) { if (!alive) return; if (fits(cur.m, cur.x + d, cur.y)) { cur.x += d; api.vibrate(4); } }
    function rotate() { if (!alive) return; const m = cur.m[0].map((_, j) => cur.m.map(r => r[j]).reverse()); for (const k of [0, -1, 1, -2, 2]) if (fits(m, cur.x + k, cur.y)) { cur.m = m; cur.x += k; api.sound('tap'); return; } }
    function softDrop() { if (!alive) return; if (fits(cur.m, cur.x, cur.y + 1)) { cur.y++; score++; } else lock(); }
    function hardDrop() { if (!alive) return; while (fits(cur.m, cur.x, cur.y + 1)) { cur.y++; score += 2; } lock(); api.vibrate(15); }
    function lock() {
      cur.m.forEach((r, i) => r.forEach((v, j) => { if (v) board[cur.y + i][cur.x + j] = cur.k; }));
      let cleared = 0;
      for (let y = ROWS - 1; y >= 0; y--) if (board[y].every(Boolean)) { board.splice(y, 1); board.unshift(Array(COLS).fill(null)); cleared++; y++; }
      if (cleared) { lines += cleared; score += [0, 100, 300, 500, 800][cleared] * level; level = 1 + Math.floor(lines / 10); api.sound(cleared >= 4 ? 'win' : 'good'); api.vibrate([20, 20, 20]); api.addCoins(cleared * 2); }
      else api.sound('select');
      cur = next; next = piece(); scoreEl.textContent = score; linesEl.textContent = lines;
      if (!fits(cur.m, cur.x, cur.y)) die();
    }
    function die() {
      alive = false; api.sound('lose'); api.vibrate([60, 40, 120]); const isBest = api.best('tetris', score);
      api.modal({ title: 'Игра окончена', text: `Счёт ${score}, линий ${lines}` + (isBest ? ' — новый рекорд!' : ''), buttons: [{ label: 'В меню', onClick: api.exit }, { label: 'Ещё', cls: 'primary', onClick: reset }] });
    }
    function cell(x, y, k, a) { ctx.globalAlpha = a || 1; ctx.fillStyle = COLORS[k]; ctx.beginPath(); ctx.roundRect(x * CS + 1, y * CS + 1, CS - 2, CS - 2, 4); ctx.fill(); ctx.globalAlpha = 1; }
    function draw() {
      ctx.fillStyle = '#171728'; ctx.fillRect(0, 0, cv.w, cv.h); ctx.fillStyle = '#1e1e33'; ctx.fillRect(0, 0, COLS * CS, ROWS * CS);
      board.forEach((r, y) => r.forEach((k, x) => k && cell(x, y, k)));
      if (alive) {
        let gy = cur.y; while (fits(cur.m, cur.x, gy + 1)) gy++;
        cur.m.forEach((r, i) => r.forEach((v, j) => { if (v) { cell(cur.x + j, gy + i, cur.k, 0.25); cell(cur.x + j, cur.y + i, cur.k); } }));
      }
      ctx.fillStyle = '#9a9ab8'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'left'; ctx.fillText('ДАЛЕЕ', COLS * CS + 14, 22); ctx.fillText('УРОВЕНЬ ' + level, COLS * CS + 14, 150);
      next.m.forEach((r, i) => r.forEach((v, j) => { if (v) { ctx.fillStyle = COLORS[next.k]; ctx.beginPath(); ctx.roundRect(COLS * CS + 14 + j * 20, 36 + i * 20, 18, 18, 3); ctx.fill(); } }));
    }
    function loop(t) {
      raf = requestAnimationFrame(loop); const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
      if (alive && !paused) { dropT += dt; const iv = Math.max(0.1, 0.8 - (level - 1) * 0.07); if (dropT > iv) { dropT = 0; if (fits(cur.m, cur.x, cur.y + 1)) cur.y++; else lock(); } }
      draw();
    }
    let sx, sy, st;
    cv.canvas.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; st = Date.now(); });
    cv.canvas.addEventListener('pointerup', e => { const dx = e.clientX - sx, dy = e.clientY - sy; if (Math.abs(dx) < 20 && Math.abs(dy) < 20) rotate(); else if (Math.abs(dx) > Math.abs(dy)) { const n = Math.round(Math.abs(dx) / 30); for (let i = 0; i < n; i++) move(Math.sign(dx)); } else if (dy > 60) hardDrop(); });
    const keyH = e => { ({ ArrowLeft: () => move(-1), ArrowRight: () => move(1), ArrowUp: rotate, ArrowDown: softDrop, ' ': hardDrop }[e.key] || (() => {}))(); };
    window.addEventListener('keydown', keyH);
    this.unmount = () => { cancelAnimationFrame(raf); cv.destroy(); window.removeEventListener('keydown', keyH); };
    reset(); raf = requestAnimationFrame(loop);
  }
});
