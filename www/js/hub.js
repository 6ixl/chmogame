/* Главный экран: каталог игр с поиском */
window.renderHub = function (screen, api, games) {
  const { h } = api;
  const st = window.Games.state();
  // ежедневный бонус
  const today = new Date().toDateString();
  let dailyEl;
  if (st.daily !== today) {
    dailyEl = h('div', { class: 'daily', onclick: () => { st.daily = today; api.addCoins(50); dailyEl.textContent = '✓ Бонус получен'; api.vibrate(30); } }, '🎁 Забрать ежедневный бонус: +50');
  } else dailyEl = h('div', { class: 'daily' }, '✓ Бонус на сегодня получен');

  screen.append(h('div', { class: 'hub-hero' },
    h('h1', null, 'Чмогейм'),
    h('p', null, games.length + ' игр · без интернета · монеты общие для всех игр'),
    dailyEl));

  // поиск
  const input = h('input', { class: 'search', type: 'search', placeholder: '🔍 Поиск игры по названию…', autocomplete: 'off' });
  const clearBtn = h('button', { class: 'icon-btn', style: 'display:none', onclick: () => { input.value = ''; input.dispatchEvent(new Event('input')); } }, '✕');
  screen.append(h('div', { class: 'search-row' }, input, clearBtn));

  const cats = [['words', 'Слова'], ['puzzle', 'Головоломки'], ['brain', 'Мозг и реакция'], ['board', 'Настольные и карточные'], ['luck', 'На удачу'], ['arcade', 'Аркады']];
  const list = h('div');
  screen.append(list);
  const norm = s => (s || '').toLowerCase().replace('ё', 'е');

  function draw(q) {
    list.innerHTML = '';
    q = norm(q).trim();
    let shown = 0;
    for (const [cat, name] of cats) {
      const items = games.filter(g => g.cat === cat && (!q || norm(g.title).includes(q) || norm(g.desc).includes(q) || norm(g.id).includes(q)));
      if (!items.length) continue;
      list.append(h('div', { class: 'section-title' }, name + ' · ' + items.length));
      const grid = h('div', { class: 'grid' });
      for (const g of items) {
        const b = api.bestOf(g.id);
        grid.append(h('div', { class: 'card', onclick: () => { api.sound('tap'); api.vibrate(10); window.Games.open(g); } },
          h('div', { class: 'ico' }, g.icon),
          h('div', { class: 'name' }, g.title),
          h('div', { class: 'desc' }, g.desc),
          h('div', { class: 'best' }, b != null ? (g.bestLabel || 'Рекорд') + ': ' + b : (g.progress ? g.progress(api) : ''))));
        shown++;
      }
      list.append(grid);
    }
    if (!shown) list.append(h('div', { class: 'hint-text', style: 'padding:30px' }, 'Ничего не найдено по запросу «' + q + '»'));
  }
  input.addEventListener('input', () => { clearBtn.style.display = input.value ? '' : 'none'; draw(input.value); });
  draw('');
};
