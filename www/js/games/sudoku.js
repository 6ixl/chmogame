/* Судоку */
Games.register({
  id: 'sudoku', title: 'Судоку', icon: '9️⃣', cat: 'puzzle', desc: 'Классика: заполни сетку 9×9', bestLabel: 'Решено',
  mount(screen, api) {
    const { h } = api;
    let sol, puzzle, board, sel = -1, gridEl, cells, diff, errors, timer, secs, timeEl, solvedCount = api.load('sudoku_count', 0);

    function solveFill(g) {
      const i = g.indexOf(0); if (i < 0) return true;
      const r = Math.floor(i / 9), c = i % 9;
      for (const n of api.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
        if (ok(g, r, c, n)) { g[i] = n; if (solveFill(g)) return true; g[i] = 0; }
      }
      return false;
    }
    function ok(g, r, c, n) {
      for (let k = 0; k < 9; k++) { if (g[r * 9 + k] === n || g[k * 9 + c] === n) return false; }
      const br = r - r % 3, bc = c - c % 3;
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (g[(br + i) * 9 + bc + j] === n) return false;
      return true;
    }
    function countSolutions(g, limit) {
      const i = g.indexOf(0); if (i < 0) return 1;
      const r = Math.floor(i / 9), c = i % 9; let cnt = 0;
      for (let n = 1; n <= 9 && cnt < limit; n++) if (ok(g, r, c, n)) { g[i] = n; cnt += countSolutions(g, limit - cnt); g[i] = 0; }
      return cnt;
    }
    function gen(givens) {
      sol = Array(81).fill(0); solveFill(sol);
      puzzle = sol.slice();
      const order = api.shuffle([...Array(81).keys()]);
      let removed = 0, target = 81 - givens;
      for (const i of order) {
        if (removed >= target) break;
        const v = puzzle[i]; puzzle[i] = 0;
        if (countSolutions(puzzle.slice(), 2) !== 1) puzzle[i] = v; else removed++;
      }
    }
    function pickDiff() {
      const body = h('div', { class: 'row', style: 'flex-direction:column' },
        ['Лёгкий', 'Средний', 'Сложный'].map((n, i) => h('button', { class: 'btn ' + (i === 1 ? 'primary' : ''), style: 'width:100%', onclick: () => { m.close(); start(i); } }, n)));
      const m = api.modal({ title: 'Сложность', body, buttons: [{ label: 'В меню', onClick: api.exit }] });
    }
    function start(d) {
      diff = d; gen([40, 32, 27][d]); board = puzzle.slice(); errors = 0; secs = 0; sel = -1;
      clearInterval(timer); timer = setInterval(() => { secs++; if (timeEl) timeEl.textContent = fmt(secs); }, 1000);
      render();
    }
    const fmt = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    function render() {
      screen.innerHTML = '';
      timeEl = h('b', null, fmt(secs));
      screen.append(h('div', { class: 'game-top' },
        h('div', { class: 'stat' }, ['Лёгкий', 'Средний', 'Сложный'][diff]),
        h('div', { class: 'stat' }, '⏱ ', timeEl),
        h('div', { class: 'stat' }, 'Ошибки ', h('b', null, errors)),
        h('button', { class: 'btn small gold', onclick: hint }, '💡 30')));
      gridEl = h('div', { class: 'sud' }); cells = [];
      for (let i = 0; i < 81; i++) {
        const r = Math.floor(i / 9), c = i % 9;
        const el = h('div', { class: 'sc' + (puzzle[i] ? ' given' : '') + (c % 3 === 2 && c < 8 ? ' br' : '') + (r % 3 === 2 && r < 8 ? ' bb' : ''), onclick: () => select(i) }, board[i] || '');
        cells.push(el); gridEl.append(el);
      }
      const pad = h('div', { class: 'numpad' });
      for (let n = 1; n <= 9; n++) pad.append(h('button', { class: 'btn', onclick: () => put(n) }, n));
      pad.append(h('button', { class: 'btn', onclick: () => put(0) }, '⌫'));
      screen.append(h('div', { class: 'game-area', style: 'overflow:auto;justify-content:flex-start' }, gridEl, pad));
      paint();
    }
    function select(i) { if (puzzle[i]) { sel = i; } else sel = i; api.sound('tap'); paint(); }
    function paint() {
      const v = sel >= 0 ? board[sel] : 0;
      cells.forEach((el, i) => {
        el.classList.toggle('sel', i === sel);
        el.classList.toggle('same', v && board[i] === v && i !== sel);
        el.classList.toggle('err', board[i] && board[i] !== sol[i]);
        el.textContent = board[i] || '';
      });
    }
    function put(n) {
      if (sel < 0 || puzzle[sel]) return;
      board[sel] = n; api.sound('select'); api.vibrate(8);
      if (n && n !== sol[sel]) { errors++; api.sound('bad'); render(); return; }
      paint();
      if (board.every((v, i) => v === sol[i])) win();
    }
    function hint() {
      const empty = board.map((v, i) => v === sol[i] ? -1 : i).filter(i => i >= 0); if (!empty.length) return;
      if (!api.spend(30)) return;
      const i = sel >= 0 && board[sel] !== sol[sel] ? sel : empty[Math.floor(Math.random() * empty.length)];
      board[i] = sol[i]; sel = i; api.sound('coin'); paint();
      if (board.every((v, i) => v === sol[i])) win();
    }
    function win() {
      clearInterval(timer);
      const reward = [40, 70, 110][diff] - Math.min(errors * 5, 20);
      solvedCount++; api.store('sudoku_count', solvedCount); api.best('sudoku', solvedCount);
      api.sound('win'); api.vibrate([30, 50, 30, 50, 60]); api.addCoins(reward);
      api.modal({ title: 'Решено!', reward, text: 'Время ' + fmt(secs) + ', ошибок: ' + errors, buttons: [{ label: 'В меню', onClick: api.exit }, { label: 'Ещё', cls: 'primary', onClick: pickDiff }] });
    }
    this.unmount = () => clearInterval(timer);
    pickDiff();
  }
});
