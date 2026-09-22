/* Крестики-нолики против компьютера */
Games.register({
  id: 'ttt', title: 'Крестики-нолики', icon: '❌', cat: 'puzzle', desc: 'Против компьютера, три уровня', bestLabel: 'Побед',
  mount(screen, api) {
    const { h } = api;
    const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    let b, over, ai = 1, boardEl, stats = api.load('ttt', { w: 0, l: 0, d: 0 }), statEl, turnHuman;
    function start() { b = Array(9).fill(''); over = false; turnHuman = Math.random() < 0.5; render(); if (!turnHuman) setTimeout(aiMove, 400); }
    function render() {
      screen.innerHTML = ''; statEl = h('div', { class: 'stat' }, `Победы ${stats.w} · Ничьи ${stats.d} · Поражения ${stats.l}`);
      const sel = h('select', { class: 'btn small', onchange: e => { ai = +e.target.value; start(); } },
        ['Легко', 'Средне', 'Сложно'].map((n, i) => h('option', { value: i, ...(i === ai ? { selected: '' } : {}) }, n)));
      screen.append(h('div', { class: 'game-top' }, statEl, sel));
      boardEl = h('div', { class: 'ttt' });
      screen.append(h('div', { class: 'game-area' }, boardEl), h('div', { class: 'hint-text' }, 'Вы — ✕'));
      paint();
    }
    function paint(win) {
      boardEl.innerHTML = '';
      b.forEach((v, i) => boardEl.append(h('div', { class: 't ' + (v === 'X' ? 'x' : v === 'O' ? 'o' : '') + (win && win.includes(i) ? ' win' : ''), onclick: () => tap(i) }, v === 'X' ? '✕' : v === 'O' ? '○' : '')));
    }
    const winner = g => { for (const l of LINES) if (g[l[0]] && g[l[0]] === g[l[1]] && g[l[0]] === g[l[2]]) return l; return null; };
    function tap(i) { if (over || b[i] || !turnHuman) return; b[i] = 'X'; api.sound('tap'); api.vibrate(8); turnHuman = false; paint(); if (!end()) setTimeout(aiMove, 350); }
    function aiMove() {
      if (over) return;
      const empty = b.map((v, i) => v ? -1 : i).filter(i => i >= 0);
      let mv;
      if (ai === 0 || (ai === 1 && Math.random() < 0.35)) mv = empty[Math.floor(Math.random() * empty.length)];
      else { let best = -Infinity; for (const i of empty) { b[i] = 'O'; const s = minimax(false, 0); b[i] = ''; if (s > best) { best = s; mv = i; } } }
      b[mv] = 'O'; api.sound('select'); turnHuman = true; paint(); end();
    }
    function minimax(maxi, d) {
      const w = winner(b); if (w) return b[w[0]] === 'O' ? 10 - d : d - 10;
      if (!b.includes('')) return 0;
      let best = maxi ? -Infinity : Infinity;
      for (let i = 0; i < 9; i++) if (!b[i]) { b[i] = maxi ? 'O' : 'X'; const s = minimax(!maxi, d + 1); b[i] = ''; best = maxi ? Math.max(best, s) : Math.min(best, s); }
      return best;
    }
    function end() {
      const w = winner(b);
      if (w) { over = true; paint(w); const human = b[w[0]] === 'X'; if (human) { stats.w++; api.best('ttt', stats.w); const reward = [5, 10, 25][ai]; api.sound('win'); api.vibrate([30, 50, 30]); api.addCoins(reward); } else { stats.l++; api.sound('lose'); api.vibrate(60); } api.store('ttt', stats); setTimeout(() => api.modal({ title: human ? 'Победа!' : 'Проигрыш', reward: human ? [5, 10, 25][ai] : 0, buttons: [{ label: 'В меню', onClick: api.exit }, { label: 'Ещё', cls: 'primary', onClick: start }] }), 500); return true; }
      if (!b.includes('')) { over = true; stats.d++; api.store('ttt', stats); api.sound('select'); setTimeout(() => api.modal({ title: 'Ничья', buttons: [{ label: 'В меню', onClick: api.exit }, { label: 'Ещё', cls: 'primary', onClick: start }] }), 400); return true; }
      return false;
    }
    start();
  }
});
