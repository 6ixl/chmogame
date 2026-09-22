/* Пятнашки */
Games.register({
  id: 'fifteen', title: 'Пятнашки', icon: '🔟', cat: 'puzzle', desc: 'Расставь плитки по порядку', bestLabel: 'Меньше ходов',
  mount(screen, api) {
    const { h } = api;
    let b, moves, boardEl, movesEl, secs, timer, timeEl;
    function start() {
      b = [...Array(16).keys()].map(i => (i + 1) % 16);
      // перемешиваем случайными ходами — всегда решаемо
      let blank = 15;
      for (let i = 0; i < 400; i++) {
        const r = Math.floor(blank / 4), c = blank % 4;
        const opts = []; if (r > 0) opts.push(blank - 4); if (r < 3) opts.push(blank + 4); if (c > 0) opts.push(blank - 1); if (c < 3) opts.push(blank + 1);
        const j = opts[Math.floor(Math.random() * opts.length)]; b[blank] = b[j]; b[j] = 0; blank = j;
      }
      moves = 0; secs = 0; clearInterval(timer); timer = setInterval(() => { secs++; timeEl.textContent = secs + 'с'; }, 1000); render();
    }
    function render() {
      screen.innerHTML = '';
      movesEl = h('b', null, moves); timeEl = h('b', null, secs + 'с');
      screen.append(h('div', { class: 'game-top' }, h('div', { class: 'stat' }, 'Ходы ', movesEl), h('div', { class: 'stat' }, '⏱ ', timeEl), h('button', { class: 'btn small', onclick: start }, '↻ Заново')));
      boardEl = h('div', { class: 'f15' });
      screen.append(h('div', { class: 'game-area' }, boardEl)); paint();
    }
    function paint() {
      boardEl.innerHTML = '';
      b.forEach((v, i) => boardEl.append(h('div', { class: 't ' + (v ? '' : 'blank'), onclick: () => tap(i) }, v || '')));
      movesEl.textContent = moves;
    }
    function tap(i) {
      const blank = b.indexOf(0); const r = Math.floor(i / 4), c = i % 4, br = Math.floor(blank / 4), bc = blank % 4;
      if (r === br) { const s = Math.sign(bc - c); for (let k = bc; k !== c; k -= s) b[r * 4 + k] = b[r * 4 + k - s]; }
      else if (c === bc) { const s = Math.sign(br - r); for (let k = br; k !== r; k -= s) b[k * 4 + c] = b[(k - s) * 4 + c]; }
      else return;
      b[i] = 0; moves++; api.sound('tap'); api.vibrate(8); paint();
      if (b.every((v, k) => v === (k + 1) % 16)) {
        clearInterval(timer); const reward = 30 + Math.max(0, 200 - moves) / 5 | 0; const isBest = api.best('fifteen', moves, true);
        api.sound('win'); api.vibrate([30, 50, 30, 50, 60]); api.addCoins(reward);
        api.modal({ title: 'Собрано!', reward, text: moves + ' ходов, ' + secs + ' сек' + (isBest ? ' — рекорд!' : ''), buttons: [{ label: 'В меню', onClick: api.exit }, { label: 'Ещё', cls: 'primary', onClick: start }] });
      }
    }
    this.unmount = () => clearInterval(timer);
    start();
  }
});
