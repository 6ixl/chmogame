/* 2048 */
Games.register({
  id: '2048', title: '2048', icon: '🔢', cat: 'puzzle', desc: 'Сдвигай плитки, собери 2048', bestLabel: 'Рекорд',
  mount(screen, api) {
    const { h } = api;
    let saved = api.load('2048', null);
    let b, score, over, won, boardEl, scoreEl;
    function init() {
      if (saved && saved.b) { b = saved.b; score = saved.score; won = saved.won; }
      else { b = Array(16).fill(0); score = 0; won = false; add(); add(); }
      over = false; render(true);
    }
    function add() {
      const e = b.map((v, i) => v ? -1 : i).filter(i => i >= 0); if (!e.length) return;
      b[e[Math.floor(Math.random() * e.length)]] = Math.random() < 0.9 ? 2 : 4;
    }
    function render(full) {
      if (full) {
        screen.innerHTML = '';
        scoreEl = h('b', null, score);
        screen.append(h('div', { class: 'game-top' },
          h('div', { class: 'stat' }, 'Счёт ', scoreEl),
          h('div', { class: 'stat' }, 'Рекорд ', h('b', null, api.bestOf('2048') || 0)),
          h('button', { class: 'btn small', onclick: () => { saved = null; init(); } }, '↻ Заново')));
        boardEl = h('div', { class: 'g2048' });
        screen.append(h('div', { class: 'game-area' }, boardEl), h('div', { class: 'hint-text' }, 'Свайпайте в любую сторону'));
        let sx, sy;
        boardEl.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; });
        boardEl.addEventListener('pointerup', e => {
          if (sx == null) return; const dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
          if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
          move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'd' : 'u'));
        });
        keyH = e => { const m = { ArrowLeft: 'l', ArrowRight: 'r', ArrowUp: 'u', ArrowDown: 'd' }[e.key]; if (m) move(m); };
        window.addEventListener('keydown', keyH);
      }
      boardEl.innerHTML = '';
      b.forEach((v, i) => boardEl.append(h('div', { class: 't' + (newIdx.has(i) ? ' n' : ''), 'data-v': v }, v || '')));
      scoreEl.textContent = score;
    }
    let keyH; const newIdx = new Set();
    function move(dir) {
      if (over) return;
      const old = b.slice(); newIdx.clear(); let gained = 0;
      const lines = [];
      for (let i = 0; i < 4; i++) {
        const idx = [];
        for (let j = 0; j < 4; j++) idx.push(dir === 'l' ? i * 4 + j : dir === 'r' ? i * 4 + 3 - j : dir === 'u' ? j * 4 + i : (3 - j) * 4 + i);
        lines.push(idx);
      }
      for (const idx of lines) {
        const vals = idx.map(i => b[i]).filter(v => v); const out = [];
        for (let k = 0; k < vals.length; k++) {
          if (vals[k] === vals[k + 1]) { out.push(vals[k] * 2); gained += vals[k] * 2; if (vals[k] * 2 === 2048 && !won) { won = true; setTimeout(() => api.modal({ title: '2048!', text: 'Вы собрали 2048. Можно продолжать.', buttons: [{ label: 'Продолжить', cls: 'primary' }] }), 200); } k++; }
          else out.push(vals[k]);
        }
        idx.forEach((i, k) => { b[i] = out[k] || 0; if (out[k] && out[k] !== old[i] && vals.length) newIdx.add(i); });
      }
      if (old.every((v, i) => v === b[i])) return;
      score += gained; if (gained) { api.sound('select'); api.vibrate(8); if (gained >= 64) api.addCoins(Math.floor(gained / 64)); }
      add(); render(); api.store('2048', { b, score, won });
      api.best('2048', score);
      if (!canMove()) { over = true; api.sound('lose'); api.store('2048', null); api.modal({ title: 'Игра окончена', text: 'Счёт: ' + score, buttons: [{ label: 'В меню', onClick: api.exit }, { label: 'Заново', cls: 'primary', onClick: () => { saved = null; init(); } }] }); }
    }
    function canMove() {
      for (let i = 0; i < 16; i++) { if (!b[i]) return true; if (i % 4 < 3 && b[i] === b[i + 1]) return true; if (i < 12 && b[i] === b[i + 4]) return true; }
      return false;
    }
    this.unmount = () => window.removeEventListener('keydown', keyH);
    init();
  }
});
