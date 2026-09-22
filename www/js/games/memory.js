/* Найди пару */
Games.register({
  id: 'memory', title: 'Найди пару', icon: '🃏', cat: 'puzzle', desc: 'Открывай карточки, запоминай пары', bestLabel: 'Меньше ходов',
  mount(screen, api) {
    const { h } = api;
    const EMOJI = '🍎🍌🍇🍓🍒🥝🍍🥑🌽🥕🍔🍕🍩🍪🎈🎁⚽🏀🎸🎲🚗✈️🚀🐶🐱🦊🐼🐸🦋🌙⭐🔥🐙🦄🍉🍋🎯🎹🛸⛵'.match(/\p{Extended_Pictographic}️?/gu);
    let cards, openIdx, lock, moves, matched, cols, rows, els, movesEl, level = api.load('memory_lvl', 0);
    function start() {
      [cols, rows] = [[4, 3], [4, 4], [4, 5], [5, 6], [6, 6], [6, 7], [6, 8]][Math.min(level, 6)];
      const n = cols * rows / 2;
      const pick = api.shuffle(EMOJI.slice()).slice(0, n);
      cards = api.shuffle([...pick, ...pick]); openIdx = []; lock = false; moves = 0; matched = 0; render();
    }
    function render() {
      screen.innerHTML = ''; movesEl = h('b', null, moves);
      screen.append(h('div', { class: 'game-top' }, h('div', { class: 'stat' }, 'Уровень ', h('b', null, level + 1)), h('div', { class: 'stat' }, 'Ходы ', movesEl), h('button', { class: 'btn small', onclick: start }, '↻')));
      const g = h('div', { class: 'mem', style: `grid-template-columns:repeat(${cols},1fr)` }); els = [];
      cards.forEach((c, i) => { const el = h('div', { class: 'mcard hid', onclick: () => flip(i) }, c); els.push(el); g.append(el); });
      screen.append(h('div', { class: 'game-area' }, g));
    }
    function flip(i) {
      if (lock || openIdx.includes(i) || els[i].classList.contains('done')) return;
      els[i].classList.remove('hid'); els[i].classList.add('open'); openIdx.push(i); api.sound('tap'); api.vibrate(8);
      if (openIdx.length === 2) {
        moves++; movesEl.textContent = moves; const [a, b] = openIdx;
        if (cards[a] === cards[b]) {
          els[a].classList.add('done'); els[b].classList.add('done'); els[a].classList.remove('open'); els[b].classList.remove('open'); openIdx = []; matched++; api.sound('good');
          if (matched === cards.length / 2) setTimeout(win, 300);
        } else { lock = true; setTimeout(() => { [a, b].forEach(k => { els[k].classList.add('hid'); els[k].classList.remove('open'); }); openIdx = []; lock = false; }, 700); }
      }
    }
    function win() {
      const reward = 15 + Math.min(level, 6) * 8 + Math.max(0, cards.length - moves);
      const isBest = api.best('memory', moves, true); level++; api.store('memory_lvl', level);
      api.sound('win'); api.vibrate([30, 50, 30, 50, 60]); api.addCoins(reward);
      api.modal({ title: 'Все пары найдены!', reward, text: moves + ' ходов' + (isBest ? ' — рекорд!' : ''), buttons: [{ label: 'В меню', onClick: api.exit }, { label: 'Дальше', cls: 'primary', onClick: start }] });
    }
    start();
  }
});
