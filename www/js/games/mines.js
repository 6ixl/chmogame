/* Сапёр */
Games.register({
  id: 'mines', title: 'Сапёр', icon: '💣', cat: 'puzzle', desc: 'Открой поле, не задев мины', bestLabel: 'Лучшее время',
  mount(screen, api) {
    const { h } = api;
    let W, H, M, mines, open, flag, started, over, flagMode = false, cells, timer, secs, timeEl, flagEl, diff;
    function pickDiff() {
      const body = h('div', { class: 'row', style: 'flex-direction:column' },
        [['Новичок', '9×9, 10 мин'], ['Любитель', '12×12, 25 мин'], ['Эксперт', '16×16, 45 мин']].map((n, i) => h('button', { class: 'btn ' + (i === 0 ? 'primary' : ''), style: 'width:100%', onclick: () => { m.close(); start(i); } }, n[0] + ' · ' + n[1])));
      const m = api.modal({ title: 'Сложность', body, buttons: [{ label: 'В меню', onClick: api.exit }] });
    }
    function start(d) {
      diff = d; [W, H, M] = [[9, 9, 10], [12, 12, 25], [16, 16, 45]][d];
      mines = Array(W * H).fill(false); open = Array(W * H).fill(false); flag = Array(W * H).fill(false);
      started = false; over = false; secs = 0; clearInterval(timer); render();
    }
    const nb = i => { const r = Math.floor(i / W), c = i % W, out = []; for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { if (!dr && !dc) continue; const rr = r + dr, cc = c + dc; if (rr >= 0 && cc >= 0 && rr < H && cc < W) out.push(rr * W + cc); } return out; };
    const cnt = i => nb(i).filter(j => mines[j]).length;
    function place(safe) {
      const avoid = new Set([safe, ...nb(safe)]);
      const pool = [...Array(W * H).keys()].filter(i => !avoid.has(i)); api.shuffle(pool);
      pool.slice(0, M).forEach(i => mines[i] = true);
      started = true; timer = setInterval(() => { secs++; timeEl.textContent = secs; }, 1000);
    }
    const fmt = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    function render() {
      screen.innerHTML = '';
      timeEl = h('b', null, secs); flagEl = h('b', null, M - flag.filter(Boolean).length);
      const modeBtn = h('button', { class: 'btn small ' + (flagMode ? 'primary' : ''), onclick: () => { flagMode = !flagMode; modeBtn.classList.toggle('primary', flagMode); api.sound('tap'); } }, '🚩 Флаг');
      screen.append(h('div', { class: 'game-top' },
        h('div', { class: 'stat' }, '💣 ', flagEl), h('div', { class: 'stat' }, '⏱ ', timeEl), modeBtn,
        h('button', { class: 'btn small', onclick: pickDiff }, '↻')));
      const size = Math.floor(Math.min(screen.clientWidth - 20, 440) / W) - 3;
      const g = h('div', { class: 'mines', style: `grid-template-columns:repeat(${W},${size}px);font-size:${Math.round(size * .55)}px` });
      cells = [];
      let pressT, pressed = -1, longDone = false;
      for (let i = 0; i < W * H; i++) {
        const el = h('div', { class: 'mc', 'data-i': i }); cells.push(el); g.append(el);
      }
      g.addEventListener('pointerdown', e => {
        const el = e.target.closest('.mc'); if (!el) return; pressed = +el.dataset.i; longDone = false;
        pressT = setTimeout(() => { longDone = true; toggleFlag(pressed); }, 350);
      });
      const end = e => { clearTimeout(pressT); if (pressed < 0) return; const el = e.target.closest('.mc'); if (!longDone && el && +el.dataset.i === pressed) { flagMode ? toggleFlag(pressed) : openCell(pressed); } pressed = -1; };
      g.addEventListener('pointerup', end); g.addEventListener('pointercancel', () => { clearTimeout(pressT); pressed = -1; });
      g.addEventListener('contextmenu', e => e.preventDefault());
      screen.append(h('div', { class: 'game-area', style: 'overflow:auto' }, g), h('div', { class: 'hint-text' }, 'Тап — открыть, удержание — флаг'));
      paint();
    }
    function paint() {
      for (let i = 0; i < W * H; i++) {
        const el = cells[i]; el.className = 'mc'; el.textContent = ''; delete el.dataset.n;
        if (open[i]) { el.classList.add('open'); if (mines[i]) { el.textContent = '💣'; el.classList.add('boom'); } else { const n = cnt(i); if (n) { el.textContent = n; el.dataset.n = n; } } }
        else if (flag[i]) el.textContent = '🚩';
        else if (over && mines[i]) { el.textContent = '💣'; el.classList.add('open'); }
      }
      flagEl.textContent = M - flag.filter(Boolean).length;
    }
    function toggleFlag(i) { if (over || open[i]) return; flag[i] = !flag[i]; api.vibrate(20); api.sound('select'); paint(); }
    function openCell(i) {
      if (over || flag[i]) return;
      if (open[i]) { // chord
        const f = nb(i).filter(j => flag[j]).length; if (f === cnt(i)) nb(i).forEach(j => { if (!open[j] && !flag[j]) reveal(j); }); check(); return;
      }
      if (!started) place(i);
      reveal(i); check();
    }
    function reveal(i) {
      if (open[i] || flag[i]) return; open[i] = true;
      if (mines[i]) { over = true; return; }
      if (cnt(i) === 0) nb(i).forEach(reveal);
    }
    function check() {
      api.sound('tap'); api.vibrate(6);
      if (over) { clearInterval(timer); paint(); api.sound('boom'); api.vibrate([50, 30, 100]); api.modal({ title: 'Бум!', text: 'Вы наткнулись на мину.', buttons: [{ label: 'В меню', onClick: api.exit }, { label: 'Ещё раз', cls: 'primary', onClick: () => start(diff) }] }); return; }
      paint();
      if (open.filter(Boolean).length === W * H - M) {
        over = true; clearInterval(timer);
        const reward = [25, 60, 120][diff]; const isBest = api.best('mines', secs, true);
        api.sound('win'); api.vibrate([30, 50, 30, 50, 60]); api.addCoins(reward);
        api.modal({ title: 'Поле очищено!', reward, text: 'Время: ' + fmt(secs) + (isBest ? ' — новый рекорд!' : ''), buttons: [{ label: 'В меню', onClick: api.exit }, { label: 'Ещё раз', cls: 'primary', onClick: () => start(diff) }] });
      }
    }
    this.unmount = () => clearInterval(timer);
    pickDiff();
  }
});
