/* Слова (Words of Wonders): собери слова из букв на колесе */
Games.register({
  id: 'wow', title: 'Слова', icon: '🔤', cat: 'words', desc: 'Кроссворд из букв на колесе. 400 уровней',
  skipLevel: api => { const p = api.load('wow', { lvl: 0, done: [] }); if (!p.done.includes(p.lvl)) p.done.push(p.lvl); p.lvl = Math.min(p.lvl + 1, 419); api.store('wow', p); return true; },
  progress: api => 'Уровень ' + (api.load('wow', { lvl: 0 }).lvl + 1),
  mount(screen, api) {
    const { h } = api;
    const LEVELS = window.WOW_LEVELS;
    const DICT = new Set(window.DICT.all);
    let prog = api.load('wow', { lvl: 0, done: [] });
    let L, found, extraFound, grid, cells, letters, sel, wheelEl, curEl, svg, filled;

    function startLevel(i) {
      prog.lvl = Math.min(i, LEVELS.length - 1); api.store('wow', prog);
      L = LEVELS[prog.lvl]; found = new Set(); extraFound = new Set(); sel = []; filled = {};
      render();
    }
    function render() {
      screen.innerHTML = '';
      const hintBtn = h('button', { class: 'btn small gold', onclick: hint }, '💡 Подсказка · 25');
      screen.append(h('div', { class: 'game-top' },
        h('button', { class: 'btn small', onclick: levelPicker }, '☰ Ур. ' + (prog.lvl + 1)),
        h('div', { class: 'stat' }, 'Слов: ', h('b', null, found.size + '/' + L.g.words.length)),
        hintBtn));
      // grid
      const g = L.g; cells = {};
      const avail = Math.min(screen.clientWidth - 20, 400);
      const cs = Math.floor(Math.min(avail / g.w, 44));
      grid = h('div', { class: 'wow-grid', style: `grid-template-columns:repeat(${g.w},${cs}px);grid-auto-rows:${cs}px;font-size:${Math.round(cs * .55)}px` });
      const occupied = {};
      for (const [w, r, c, d] of g.words) for (let i = 0; i < w.length; i++) occupied[(d ? r + i : r) + ',' + (d ? c : c + i)] = w[i];
      for (let r = 0; r < g.h; r++) for (let c = 0; c < g.w; c++) {
        const k = r + ',' + c;
        const el = h('div', { class: 'wow-cell ' + (occupied[k] ? '' : 'empty') });
        if (occupied[k]) { cells[k] = el; el.dataset.ch = occupied[k]; if (filled[k]) { el.textContent = occupied[k]; el.classList.add(filled[k]); } }
        grid.append(el);
      }
      const area = h('div', { class: 'game-area', style: 'justify-content:flex-start;gap:6px;overflow:auto' }, grid);
      curEl = h('div', { class: 'wow-current' });
      // wheel
      letters = [];
      wheelEl = h('div', { class: 'wow-wheel' });
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 250 250'); wheelEl.append(svg);
      const n = L.l.length, R = 92;
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + i * 2 * Math.PI / n;
        const x = 125 + R * Math.cos(a), y = 125 + R * Math.sin(a);
        const el = h('div', { class: 'wow-letter', style: `left:${x}px;top:${y}px` }, L.l[i]);
        wheelEl.append(el); letters.push({ el, x, y, ch: L.l[i] });
      }
      wheelEl.addEventListener('pointerdown', onDown);
      wheelEl.addEventListener('pointermove', onMove);
      wheelEl.addEventListener('pointerup', onUp);
      wheelEl.addEventListener('pointercancel', onUp);
      const bottom = h('div', { class: 'bottom-bar' }, curEl, wheelEl,
        h('div', { class: 'wow-extra', style: 'padding-top:8px' }, 'Бонусные слова: ' + extraFound.size + ' · ' + (L.x.length ? 'Проведите по буквам' : 'Проведите по буквам')),
        h('div', { class: 'row', style: 'padding-top:8px' }, h('button', { class: 'btn small', onclick: shuffle }, '🔀 Перемешать')));
      screen.append(area, bottom);
    }
    function nearest(e) {
      const rect = wheelEl.getBoundingClientRect();
      const x = (e.clientX - rect.left) * 250 / rect.width, y = (e.clientY - rect.top) * 250 / rect.height;
      let best = null, bd = 34;
      for (const l of letters) { const d = Math.hypot(l.x - x, l.y - y); if (d < bd) { bd = d; best = l; } }
      return best;
    }
    let dragging = false;
    function onDown(e) { dragging = true; wheelEl.setPointerCapture(e.pointerId); sel = []; pick(e); }
    function onMove(e) { if (dragging) pick(e); }
    function pick(e) {
      const l = nearest(e); if (!l) return;
      if (sel.includes(l)) { // move back: remove tail after this letter
        const i = sel.indexOf(l); if (i === sel.length - 2) { sel.pop().el.classList.remove('sel'); }
      } else { sel.push(l); l.el.classList.add('sel'); api.sound('select'); api.vibrate(8); }
      drawLine();
    }
    function drawLine() {
      curEl.textContent = sel.map(s => s.ch).join('');
      svg.innerHTML = '';
      if (sel.length > 1) {
        const p = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        p.setAttribute('points', sel.map(s => s.x + ',' + s.y).join(' '));
        p.setAttribute('stroke', '#8b5cf6'); p.setAttribute('stroke-width', '8'); p.setAttribute('fill', 'none'); p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke-linejoin', 'round');
        svg.append(p);
      }
    }
    function onUp() {
      if (!dragging) return; dragging = false;
      const word = sel.map(s => s.ch).join('');
      sel.forEach(s => s.el.classList.remove('sel')); sel = []; drawLine();
      if (word.length < 3) return;
      submit(word);
    }
    function submit(word) {
      const target = L.g.words.find(w => w[0] === word);
      if (target) {
        if (found.has(word)) { api.toast('Уже найдено'); return; }
        found.add(word); reveal(target, 'filled'); api.sound('good'); api.vibrate([10, 30, 10]);
        if (found.size === L.g.words.length) setTimeout(win, 400); else render();
      } else if (L.x.includes(word) || DICT.has(word)) {
        if (extraFound.has(word)) { api.toast('Уже было'); return; }
        extraFound.add(word); api.addCoins(2); api.toast('Бонусное слово! +2'); render();
      } else { api.sound('bad'); api.vibrate(40); curEl.textContent = '✗ ' + word; setTimeout(() => { if (!dragging) curEl.textContent = ''; }, 500); }
    }
    function reveal(t, cls) {
      const [w, r, c, d] = t;
      for (let i = 0; i < w.length; i++) { const k = (d ? r + i : r) + ',' + (d ? c : c + i); if (!filled[k]) filled[k] = cls; }
    }
    function hint() {
      const empty = Object.keys(cells).filter(k => !filled[k]);
      if (!empty.length) return;
      if (!api.spend(25)) return;
      const k = empty[Math.floor(Math.random() * empty.length)];
      filled[k] = 'hint'; api.sound('coin'); api.vibrate(20);
      // check if any word is fully revealed by hints
      for (const t of L.g.words) {
        if (found.has(t[0])) continue;
        const [w, r, c, d] = t; let all = true;
        for (let i = 0; i < w.length; i++) if (!filled[(d ? r + i : r) + ',' + (d ? c : c + i)]) all = false;
        if (all) found.add(w);
      }
      if (found.size === L.g.words.length) setTimeout(win, 400); else render();
    }
    function shuffle() {
      const ch = L.l.split(''); api.shuffle(ch); L.l = ch.join(''); api.sound('tap'); render();
    }
    function win() {
      const reward = 20 + L.g.words.length * 3;
      if (!prog.done.includes(prog.lvl)) prog.done.push(prog.lvl);
      api.store('wow', prog); api.sound('win'); api.vibrate([30, 50, 30, 50, 60]); api.addCoins(reward);
      const last = prog.lvl >= LEVELS.length - 1;
      api.modal({ title: 'Уровень ' + (prog.lvl + 1) + ' пройден!', reward, text: last ? 'Вы прошли все уровни!' : 'Бонусных слов: ' + extraFound.size,
        buttons: [{ label: 'В меню', onClick: api.exit }, { label: last ? 'Заново' : 'Дальше', cls: 'primary', onClick: () => startLevel(last ? 0 : prog.lvl + 1) }] });
    }
    function levelPicker() {
      const box = h('div', { class: 'levels', style: 'max-height:50vh;overflow:auto' });
      const maxOpen = Math.max(...prog.done, -1) + 1;
      for (let i = 0; i < LEVELS.length; i++) {
        const cls = prog.done.includes(i) ? 'done' : i === prog.lvl ? 'cur' : i > maxOpen ? 'lock' : '';
        box.append(h('div', { class: 'lvl ' + cls, onclick: () => { if (i > maxOpen) { api.toast('Сначала пройдите предыдущие'); return; } m.close(); startLevel(i); } }, i + 1));
      }
      const m = api.modal({ title: 'Уровни', body: box, buttons: [{ label: 'Закрыть' }] });
    }
    startLevel(prog.lvl);
  }
});
