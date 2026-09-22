/* Филворды: найди все слова в сетке (слова змейкой, без диагоналей) */
Games.register({
  id: 'filword', title: 'Филворды', icon: '🧩', cat: 'words', desc: 'Слова спрятаны змейкой в сетке',
  skipLevel: api => { const p = api.load('filword', { lvl: 0 }); p.lvl++; api.store('filword', p); return true; },
  progress: api => 'Уровень ' + (api.load('filword', { lvl: 0 }).lvl + 1),
  mount(screen, api) {
    const { h } = api;
    let prog = api.load('filword', { lvl: 0 });
    const byLen = {};
    for (const w of window.DICT.fil) (byLen[w.length] = byLen[w.length] || []).push(w);
    let N, grid, words, found, sel, cellEls, dragging = false;

    function partition(n) {
      for (let attempt = 0; attempt < 200; attempt++) {
        const owner = Array(n * n).fill(-1); const paths = []; let ok = true;
        while (true) {
          const start = owner.indexOf(-1); if (start < 0) break;
          const remaining = owner.filter(v => v < 0).length;
          let lens = [4, 5, 6, 7].filter(l => l <= remaining && (remaining - l === 0 || remaining - l >= 4));
          if (!lens.length) { ok = false; break; }
          const len = lens[Math.floor(Math.random() * lens.length)];
          const path = walk(owner, n, start, len);
          if (!path) { ok = false; break; }
          path.forEach(i => owner[i] = paths.length); paths.push(path);
        }
        if (ok) return paths;
      }
      return null;
    }
    function walk(owner, n, start, len) {
      const path = [start]; const used = new Set([start]);
      function dfs() {
        if (path.length === len) return true;
        const cur = path[path.length - 1]; const r = Math.floor(cur / n), c = cur % n;
        const nb = api.shuffle([[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]);
        for (const [rr, cc] of nb) {
          if (rr < 0 || cc < 0 || rr >= n || cc >= n) continue;
          const i = rr * n + cc; if (owner[i] >= 0 || used.has(i)) continue;
          path.push(i); used.add(i);
          if (dfs()) return true;
          path.pop(); used.delete(i);
        }
        return false;
      }
      return dfs() ? path : null;
    }
    function newLevel() {
      N = 5 + Math.min(3, Math.floor(prog.lvl / 4));
      let paths; while (!(paths = partition(N)));
      grid = Array(N * N); words = [];
      const usedW = new Set();
      paths.forEach((p, idx) => {
        const pool = byLen[p.length]; let w;
        do { w = pool[Math.floor(Math.random() * pool.length)]; } while (usedW.has(w));
        usedW.add(w); words.push({ w, path: p, color: idx % 6, done: false });
        p.forEach((ci, i) => grid[ci] = w[i]);
      });
      found = 0; sel = []; render();
    }
    function render() {
      screen.innerHTML = '';
      screen.append(h('div', { class: 'game-top' },
        h('div', { class: 'stat' }, 'Уровень ', h('b', null, prog.lvl + 1)),
        h('div', { class: 'stat' }, 'Найдено ', h('b', null, found + '/' + words.length)),
        h('button', { class: 'btn small gold', onclick: hint }, '💡 20')));
      const size = Math.floor(Math.min(screen.clientWidth - 24, 420) / N) - 4;
      const g = h('div', { class: 'fil-grid', style: `grid-template-columns:repeat(${N},${size}px);grid-auto-rows:${size}px;font-size:${Math.round(size * .45)}px` });
      cellEls = [];
      for (let i = 0; i < N * N; i++) {
        const w = words.find(x => x.path.includes(i));
        const el = h('div', { class: 'fil-cell c' + w.color + (w.done ? ' done' : ''), 'data-i': i }, grid[i]);
        g.append(el); cellEls.push(el);
      }
      g.addEventListener('pointerdown', e => { dragging = true; g.setPointerCapture(e.pointerId); sel = []; pick(e); });
      g.addEventListener('pointermove', e => dragging && pick(e));
      const up = () => { if (!dragging) return; dragging = false; check(); };
      g.addEventListener('pointerup', up); g.addEventListener('pointercancel', up);
      const list = h('div', { class: 'fil-words' }, words.map(w => h('span', { class: 'fil-word ' + (w.done ? 'done' : '') }, w.w)));
      screen.append(h('div', { class: 'game-area', style: 'justify-content:flex-start;overflow:auto' }, g, list));
    }
    function pick(e) {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el || !el.classList.contains('fil-cell')) return;
      const i = +el.dataset.i;
      if (sel.includes(i)) { if (sel.length >= 2 && sel[sel.length - 2] === i) { cellEls[sel.pop()].classList.remove('sel'); } return; }
      if (sel.length) { const p = sel[sel.length - 1]; const adj = (Math.abs(p - i) === 1 && Math.floor(p / N) === Math.floor(i / N)) || Math.abs(p - i) === N; if (!adj) return; }
      const w = words.find(x => x.path.includes(i)); if (w.done) return;
      sel.push(i); el.classList.add('sel'); api.sound('select'); api.vibrate(6);
    }
    function check() {
      const s = sel.map(i => grid[i]).join('');
      sel.forEach(i => cellEls[i].classList.remove('sel'));
      const w = words.find(x => !x.done && (x.w === s || x.w === s.split('').reverse().join('')));
      sel = [];
      if (w) {
        w.done = true; found++; api.sound('good'); api.vibrate([10, 30, 10]);
        if (found === words.length) setTimeout(win, 300); else render();
      } else if (s.length >= 2) { api.sound('bad'); }
    }
    function hint() {
      const left = words.filter(w => !w.done); if (!left.length) return;
      if (!api.spend(20)) return;
      const w = left[Math.floor(Math.random() * left.length)];
      cellEls[w.path[0]].classList.add('sel'); api.toast('Слово начинается здесь: ' + w.w[0].toUpperCase());
      setTimeout(() => cellEls[w.path[0]].classList.remove('sel'), 1500);
    }
    function win() {
      const reward = 10 + N * 2;
      prog.lvl++; api.store('filword', prog); api.sound('win'); api.vibrate([30, 50, 30, 50, 60]); api.addCoins(reward);
      api.modal({ title: 'Все слова найдены!', reward, text: 'Уровень ' + prog.lvl + ' пройден', buttons: [{ label: 'В меню', onClick: api.exit }, { label: 'Дальше', cls: 'primary', onClick: newLevel }] });
    }
    newLevel();
  }
});
