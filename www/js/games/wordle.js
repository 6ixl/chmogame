/* 5 букв: угадай слово за 6 попыток */
Games.register({
  id: 'wordle', title: '5 букв', icon: '🟩', cat: 'words', desc: 'Угадай слово за 6 попыток', bestLabel: 'Побед подряд',
  mount(screen, api) {
    const { h } = api;
    const FIVE = window.DICT.five;
    const VALID = new Set(window.DICT.all.filter(w => w.length === 5));
    let prog = api.load('wordle', { streak: 0 });
    let answer, rows, cur, done, keyState, rowEls, kbEl, hintUsed;
    const KB = ['йцукенгшщзхъ', 'фывапролджэ', '⏎ячсмитьбю⌫'];

    function start() {
      answer = FIVE[Math.floor(Math.random() * FIVE.length)];
      rows = []; cur = ''; done = false; keyState = {}; hintUsed = false; render();
    }
    function render() {
      screen.innerHTML = '';
      screen.append(h('div', { class: 'game-top' },
        h('div', { class: 'stat' }, 'Серия ', h('b', null, prog.streak)),
        h('div', { class: 'stat' }, 'Попытка ', h('b', null, Math.min(rows.length + 1, 6) + '/6')),
        h('button', { class: 'btn small gold', onclick: hint }, '💡 40')));
      const box = h('div', { class: 'wd-rows' }); rowEls = [];
      for (let r = 0; r < 6; r++) {
        const row = h('div', { class: 'wd-row' });
        for (let c = 0; c < 5; c++) {
          let ch = '', cls = '';
          if (r < rows.length) { ch = rows[r].w[c]; cls = rows[r].m[c]; }
          else if (r === rows.length) ch = cur[c] || '';
          row.append(h('div', { class: 'wd-cell ' + cls }, ch));
        }
        box.append(row); rowEls.push(row);
      }
      screen.append(h('div', { class: 'game-area' }, box));
      kbEl = h('div', { class: 'kb' });
      for (const line of KB) {
        const kr = h('div', { class: 'kb-row' });
        for (const k of line) {
          const wide = k === '⏎' || k === '⌫';
          kr.append(h('div', { class: 'key ' + (wide ? 'wide ' : '') + (keyState[k] || ''), onpointerdown: e => { e.preventDefault(); press(k); } }, k));
        }
        kbEl.append(kr);
      }
      screen.append(h('div', { class: 'bottom-bar' }, kbEl));
    }
    function press(k) {
      if (done) return;
      api.sound('tap'); api.vibrate(8);
      if (k === '⌫') { cur = cur.slice(0, -1); }
      else if (k === '⏎') { submit(); return; }
      else if (cur.length < 5) cur += k;
      updateCur();
    }
    function updateCur() {
      const row = rowEls[rows.length]; if (!row) return;
      [...row.children].forEach((c, i) => c.textContent = cur[i] || '');
    }
    function submit() {
      if (cur.length < 5) { api.toast('Нужно 5 букв'); return; }
      if (!VALID.has(cur)) { api.toast('Нет такого слова в словаре'); api.sound('bad'); api.vibrate(40); return; }
      const m = Array(5).fill('b'); const left = {};
      for (let i = 0; i < 5; i++) { if (cur[i] === answer[i]) m[i] = 'g'; else left[answer[i]] = (left[answer[i]] || 0) + 1; }
      for (let i = 0; i < 5; i++) if (m[i] !== 'g' && left[cur[i]]) { m[i] = 'y'; left[cur[i]]--; }
      for (let i = 0; i < 5; i++) { const k = cur[i]; const rank = { g: 3, y: 2, b: 1 }; if ((rank[keyState[k]] || 0) < rank[m[i]]) keyState[k] = m[i]; }
      rows.push({ w: cur, m }); const guess = cur; cur = '';
      if (guess === answer) { done = true; win(); }
      else if (rows.length === 6) { done = true; lose(); }
      else { api.sound('select'); render(); }
    }
    function hint() {
      if (done || hintUsed) { api.toast('Одна подсказка за игру'); return; }
      const known = new Set(rows.flatMap(r => r.w.split('').filter((ch, i) => r.m[i] === 'g' && ch === answer[i])));
      const idx = [0, 1, 2, 3, 4].filter(i => !rows.some(r => r.m[i] === 'g'));
      if (!idx.length) return;
      if (!api.spend(40)) return;
      hintUsed = true; const i = idx[Math.floor(Math.random() * idx.length)];
      api.toast('Буква №' + (i + 1) + ': ' + answer[i].toUpperCase()); api.sound('coin');
    }
    function win() {
      prog.streak++; api.store('wordle', prog); api.best('wordle', prog.streak);
      const reward = [60, 45, 35, 25, 20, 15][rows.length - 1];
      api.sound('win'); api.vibrate([30, 50, 30, 50, 60]); render(); api.addCoins(reward);
      api.modal({ title: 'Верно: ' + answer.toUpperCase(), reward, text: 'Угадано с ' + rows.length + '-й попытки', buttons: [{ label: 'В меню', onClick: api.exit }, { label: 'Ещё', cls: 'primary', onClick: start }] });
    }
    function lose() {
      prog.streak = 0; api.store('wordle', prog); api.sound('lose'); api.vibrate(80); render();
      api.modal({ title: 'Не угадали', text: 'Слово было: ' + answer.toUpperCase(), buttons: [{ label: 'В меню', onClick: api.exit }, { label: 'Ещё', cls: 'primary', onClick: start }] });
    }
    start();
  }
});
