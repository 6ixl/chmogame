/* Монетный кликер — большое обновление: здания, улучшения, крит, бусты, престиж, достижения, офлайн-доход */
Games.register({
  id: 'clicker', title: 'Монетный кликер', icon: '💰', cat: 'arcade', desc: 'Тапай, строй империю: 12 источников дохода, улучшения, престиж, достижения', bestLabel: 'Всего заработано',
  mount(screen, api) {
    const { h } = api;

    /* ===== данные ===== */
    const BUILDINGS = [
      { id: 'cursor', nm: 'Курсор', ic: '👆', base: 15, cps: 0.1, d: 'Автоматически тапает за тебя' },
      { id: 'helper', nm: 'Помощник', ic: '🧑‍🌾', base: 100, cps: 1, d: 'Нанимает работника на полставки' },
      { id: 'stand', nm: 'Лоток', ic: '🛒', base: 1100, cps: 8, d: 'Торгует мелочью на рынке' },
      { id: 'farm', nm: 'Ферма', ic: '🚜', base: 12000, cps: 47, d: 'Выращивает денежные деревья' },
      { id: 'mine', nm: 'Шахта', ic: '⛏', base: 130000, cps: 260, d: 'Добывает монеты из недр' },
      { id: 'factory', nm: 'Завод', ic: '🏭', base: 1400000, cps: 1400, d: 'Штампует монеты конвейером' },
      { id: 'bank', nm: 'Банк', ic: '🏦', base: 20000000, cps: 7800, d: 'Проценты работают на тебя' },
      { id: 'temple', nm: 'Храм', ic: '🏛', base: 330000000, cps: 44000, d: 'Пожертвования текут рекой' },
      { id: 'tower', nm: 'Башня магов', ic: '🗼', base: 5100000000, cps: 260000, d: 'Превращает пыль в золото' },
      { id: 'portal', nm: 'Портал', ic: '🌀', base: 75000000000, cps: 1600000, d: 'Импорт монет из других миров' },
      { id: 'time', nm: 'Машина времени', ic: '⏳', base: 1000000000000, cps: 10000000, d: 'Забирает монеты из будущего' },
      { id: 'anti', nm: 'Антиматерия', ic: '⚛️', base: 14000000000000, cps: 65000000, d: 'Конденсирует золото из вакуума' }
    ];
    const CLICK_UPG = [
      { id: 'c1', nm: 'Крепкий палец', ic: '💪', cost: 100, d: '+1 к силе тапа', f: s => s.clickAdd += 1 },
      { id: 'c2', nm: 'Два пальца', ic: '✌️', cost: 1000, d: '+3 к силе тапа', f: s => s.clickAdd += 3 },
      { id: 'c3', nm: 'Ладонь', ic: '🖐', cost: 12000, d: 'Сила тапа ×2', f: s => s.clickMul *= 2 },
      { id: 'c4', nm: 'Золотая перчатка', ic: '🧤', cost: 250000, d: 'Сила тапа ×3', f: s => s.clickMul *= 3 },
      { id: 'c5', nm: 'Тап-мастер', ic: '⚡', cost: 5000000, d: 'Тап даёт +1% от дохода в секунду', f: s => s.clickCps += 0.01 },
      { id: 'c6', nm: 'Гром-кулак', ic: '🌩', cost: 90000000, d: 'Тап даёт +3% от дохода в секунду', f: s => s.clickCps += 0.03 },
      { id: 'c7', nm: 'Рука судьбы', ic: '✨', cost: 2000000000, d: 'Сила тапа ×5', f: s => s.clickMul *= 5 },
      { id: 'crit1', nm: 'Меткий глаз', ic: '🎯', cost: 30000, d: 'Шанс крита +10%', f: s => s.crit += 0.1 },
      { id: 'crit2', nm: 'Острый глаз', ic: '👁', cost: 800000, d: 'Шанс крита +10%', f: s => s.crit += 0.1 },
      { id: 'crit3', nm: 'Критическая масса', ic: '💥', cost: 40000000, d: 'Урон крита ×2 (до ×10)', f: s => s.critMul += 5 },
      { id: 'crit4', nm: 'Идеальный удар', ic: '🔱', cost: 900000000, d: 'Шанс крита +15%', f: s => s.crit += 0.15 }
    ];
    const GLOBAL_UPG = [
      { id: 'g1', nm: 'Смазка конвейера', ic: '🛠', cost: 50000, d: 'Весь доход ×1.25', f: s => s.allMul *= 1.25 },
      { id: 'g2', nm: 'Логистика', ic: '🚚', cost: 2000000, d: 'Весь доход ×1.5', f: s => s.allMul *= 1.5 },
      { id: 'g3', nm: 'Монополия', ic: '🎩', cost: 150000000, d: 'Весь доход ×2', f: s => s.allMul *= 2 },
      { id: 'g4', nm: 'Мировая биржа', ic: '📈', cost: 9000000000, d: 'Весь доход ×2.5', f: s => s.allMul *= 2.5 },
      { id: 'g5', nm: 'Печатный станок', ic: '🖨', cost: 400000000000, d: 'Весь доход ×3', f: s => s.allMul *= 3 },
      { id: 'o1', nm: 'Ночная смена', ic: '🌙', cost: 300000, d: 'Офлайн-доход 4 ч вместо 2 ч', f: s => s.offlineH = 4 },
      { id: 'o2', nm: 'Круглосуточно', ic: '🕛', cost: 60000000, d: 'Офлайн-доход 12 ч', f: s => s.offlineH = 12 },
      { id: 'o3', nm: 'Вечный двигатель', ic: '♾', cost: 5000000000, d: 'Офлайн-доход 24 ч и ×1.5', f: s => { s.offlineH = 24; s.offlineMul = 1.5; } },
      { id: 'b1', nm: 'Золотая жила', ic: '🍀', cost: 1500000, d: 'Золотые монеты появляются чаще', f: s => s.luck += 1 },
      { id: 'b2', nm: 'Удача мира', ic: '🌟', cost: 700000000, d: 'Золотые монеты появляются ещё чаще и живут дольше', f: s => { s.luck += 1; s.goldLife += 6; } }
    ];
    const ACHIEVEMENTS = [
      { id: 'a1', nm: 'Первый тап', d: 'Сделай 1 тап', c: s => s.clicks >= 1, r: 5 },
      { id: 'a2', nm: 'Разминка', d: '100 тапов', c: s => s.clicks >= 100, r: 10 },
      { id: 'a3', nm: 'Мозоли', d: '1 000 тапов', c: s => s.clicks >= 1000, r: 25 },
      { id: 'a4', nm: 'Железный палец', d: '10 000 тапов', c: s => s.clicks >= 10000, r: 60 },
      { id: 'a5', nm: 'Первая тысяча', d: 'Заработай 1 000', c: s => s.total >= 1000, r: 5 },
      { id: 'a6', nm: 'Миллионер', d: 'Заработай 1 000 000', c: s => s.total >= 1e6, r: 25 },
      { id: 'a7', nm: 'Миллиардер', d: 'Заработай 1 000 000 000', c: s => s.total >= 1e9, r: 60 },
      { id: 'a8', nm: 'Триллионер', d: 'Заработай 1 000 000 000 000', c: s => s.total >= 1e12, r: 150 },
      { id: 'a9', nm: 'Начало империи', d: '10 зданий всего', c: s => tot(s) >= 10, r: 10 },
      { id: 'a10', nm: 'Корпорация', d: '100 зданий всего', c: s => tot(s) >= 100, r: 40 },
      { id: 'a11', nm: 'Синдикат', d: '500 зданий всего', c: s => tot(s) >= 500, r: 120 },
      { id: 'a12', nm: 'Курсорная армия', d: '50 курсоров', c: s => (s.b.cursor || 0) >= 50, r: 20 },
      { id: 'a13', nm: 'Агропром', d: '25 ферм', c: s => (s.b.farm || 0) >= 25, r: 30 },
      { id: 'a14', nm: 'Магнат', d: '25 банков', c: s => (s.b.bank || 0) >= 25, r: 60 },
      { id: 'a15', nm: 'Повелитель времени', d: '10 машин времени', c: s => (s.b.time || 0) >= 10, r: 150 },
      { id: 'a16', nm: 'Крит!', d: 'Поймай критический тап', c: s => s.crits >= 1, r: 10 },
      { id: 'a17', nm: 'Критомания', d: '500 критов', c: s => s.crits >= 500, r: 50 },
      { id: 'a18', nm: 'Золотая лихорадка', d: 'Поймай золотую монету', c: s => s.golds >= 1, r: 15 },
      { id: 'a19', nm: 'Коллекционер', d: 'Поймай 25 золотых монет', c: s => s.golds >= 25, r: 80 },
      { id: 'a20', nm: 'Перерождение', d: 'Соверши престиж', c: s => s.stars >= 1, r: 50 },
      { id: 'a21', nm: 'Звёздный путь', d: '10 звёзд престижа', c: s => s.stars >= 10, r: 150 },
      { id: 'a22', nm: 'Сверхновая', d: '50 звёзд престижа', c: s => s.stars >= 50, r: 400 },
      { id: 'a23', nm: 'Скоростной', d: '1 000 в секунду', c: s => cps(s) >= 1000, r: 40 },
      { id: 'a24', nm: 'Потоп монет', d: '1 000 000 в секунду', c: s => cps(s) >= 1e6, r: 120 },
      { id: 'a25', nm: 'Улучшайзер', d: 'Купи 10 улучшений', c: s => s.u.length >= 10, r: 40 },
      { id: 'a26', nm: 'Всё скуплено', d: 'Купи 20 улучшений', c: s => s.u.length >= 20, r: 100 }
    ];
    const tot = s => BUILDINGS.reduce((a, b) => a + (s.b[b.id] || 0), 0);

    /* ===== состояние ===== */
    const DEF = { bank: 0, total: 0, clicks: 0, crits: 0, golds: 0, b: {}, u: [], ach: [], stars: 0, spent: 0, exchanged: 0, last: Date.now() };
    let S = api.load('clicker2', null);
    if (!S) { const old = api.load('clicker', null); S = Object.assign({}, DEF, { bank: old ? old.bank || 0 : 0, total: old ? old.total || 0 : 0 }); }
    S = Object.assign({}, DEF, S); S.b = S.b || {}; S.u = S.u || []; S.ach = S.ach || [];

    /* модификаторы пересчитываются из купленных улучшений */
    function mods(s) {
      const m = { clickAdd: 0, clickMul: 1, clickCps: 0, crit: 0.02, critMul: 5, allMul: 1, offlineH: 2, offlineMul: 1, luck: 0, goldLife: 12 };
      [...CLICK_UPG, ...GLOBAL_UPG].forEach(u => { if (s.u.includes(u.id)) u.f(m); });
      BUILDINGS.forEach(b => { const n = s.b[b.id] || 0; m['mul_' + b.id] = Math.pow(2, Math.floor(n / 25)); });
      m.starMul = 1 + s.stars * 0.05;
      return m;
    }
    function cps(s) { const m = mods(s); return BUILDINGS.reduce((a, b) => a + (s.b[b.id] || 0) * b.cps * (m['mul_' + b.id] || 1), 0) * m.allMul * m.starMul * (boost.mul || 1); }
    function clickValue(s) { const m = mods(s); return (1 + m.clickAdd) * m.clickMul * m.starMul * m.allMul * (boost.mul || 1) + cps(s) * m.clickCps; }
    const price = (b, n) => Math.ceil(b.base * Math.pow(1.15, n));
    const starsFor = s => Math.floor(Math.pow((s.total + s.spent) / 1e6, 0.5));

    /* форматирование больших чисел */
    const SUF = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
    function fmt(n) {
      if (n < 1000) return (Math.round(n * 10) / 10).toString().replace('.0', '');
      let i = 0; while (n >= 1000 && i < SUF.length - 1) { n /= 1000; i++; }
      return (n >= 100 ? n.toFixed(0) : n.toFixed(1)) + SUF[i];
    }

    /* ===== боевые переменные ===== */
    let boost = { mul: 1, left: 0 }, golden = null, goldT = 30 + Math.random() * 40, pops = [], tab = 'build', timer, coinEl, bankEl, cpsEl, tabsEl, listEl, statsEl, shakeT = 0;

    /* офлайн-доход при входе */
    (function offline() {
      const m = mods(S); const dtSec = Math.min((Date.now() - (S.last || Date.now())) / 1000, m.offlineH * 3600);
      if (dtSec > 60) { const earn = cps(S) * dtSec * 0.6 * m.offlineMul; if (earn > 1) { S.bank += earn; S.total += earn; setTimeout(() => api.modal({ title: '💤 Пока вас не было', text: `Ваша империя заработала ${fmt(earn)} монет за ${Math.floor(dtSec / 60)} мин.`, buttons: [{ label: 'Забрать', cls: 'primary' }] }), 400); } }
      S.last = Date.now();
    })();

    function save() { S.last = Date.now(); api.store('clicker2', S); }

    /* ===== покупки ===== */
    function buy(b, count) {
      let n = 0; for (let i = 0; i < count; i++) { const p = price(b, (S.b[b.id] || 0)); if (S.bank < p) break; S.bank -= p; S.spent += p; S.b[b.id] = (S.b[b.id] || 0) + 1; n++; }
      if (n) { api.sound('coin'); api.vibrate(8); refresh(); save(); } else { api.sound('bad'); api.toast('Не хватает монет'); }
    }
    function buyUpg(u) {
      if (S.u.includes(u.id)) return; if (S.bank < u.cost) { api.sound('bad'); api.toast('Не хватает монет'); return; }
      S.bank -= u.cost; S.spent += u.cost; S.u.push(u.id); api.sound('good'); api.vibrate([10, 20, 10]); refresh(); save();
    }
    function checkAch() {
      ACHIEVEMENTS.forEach(a2 => { if (!S.ach.includes(a2.id) && a2.c(S)) { S.ach.push(a2.id); api.addCoins(a2.r); api.sound('win'); api.toast('🏅 ' + a2.nm + ' · +' + a2.r + ' монет'); } });
    }
    function prestige() {
      const gain = starsFor(S) - S.stars;
      if (gain < 1) { api.modal({ title: 'Рано для престижа', text: `Нужно заработать ${fmt(Math.pow(S.stars + 1, 2) * 1e6)} всего. Сейчас: ${fmt(S.total + S.spent)}.`, buttons: [{ label: 'Понятно' }] }); return; }
      api.modal({ title: '⭐ Престиж', text: `Сброс прогресса (здания, улучшения, монеты кликера), но вы получите ${gain} звёзд. Каждая звезда даёт +5% ко всему доходу навсегда. Достижения и звёзды сохраняются.`, buttons: [{ label: 'Отмена' }, { label: 'Переродиться (+' + gain + '⭐)', cls: 'gold', onClick: () => {
        const stars = S.stars + gain, ach = S.ach, clicks = S.clicks, crits = S.crits, golds = S.golds, exch = S.exchanged;
        S = Object.assign({}, DEF, { stars, ach, clicks, crits, golds, exchanged: exch, b: {}, u: [], last: Date.now() });
        boost = { mul: 1, left: 0 }; golden = null; api.sound('win'); api.vibrate([30, 50, 30, 50, 60]); api.addCoins(gain * 10); checkAch(); render(); save();
      } }] });
    }
    function exchange() {
      const rate = 50000 * Math.pow(2, S.exchanged); const reward = 25 + S.exchanged * 10;
      api.modal({ title: '💱 Обмен на монеты Чмоги', text: `Отдать ${fmt(rate)} монет кликера и получить ${reward} общих монет (тратятся во всех играх). Каждый следующий обмен дороже.`, buttons: [{ label: 'Отмена' }, { label: 'Обменять', cls: 'gold', onClick: () => { if (S.bank < rate) { api.toast('Не хватает'); return; } S.bank -= rate; S.exchanged++; api.addCoins(reward); api.sound('win'); render(); save(); } }] });
    }

    /* ===== интерфейс ===== */
    function render() {
      screen.innerHTML = '';
      const m = mods(S);
      bankEl = h('b', null, fmt(S.bank)); cpsEl = h('b', null, fmt(cps(S)) + '/с');
      api.header(screen, [{ label: '', value: '' }, { label: '', value: '' }, { btn: '⭐ ' + S.stars, cls: 'gold', onClick: prestige }]);
      const top = screen.querySelector('.game-top'); top.innerHTML = '';
      top.append(h('div', { class: 'stat' }, '💰 ', bankEl), h('div', { class: 'stat' }, '⚡ ', cpsEl), h('button', { class: 'btn small gold', onclick: prestige }, '⭐ ' + S.stars));

      const area = h('div', { class: 'game-area', style: 'justify-content:flex-start;gap:6px;overflow:hidden' });
      // монета
      coinEl = h('div', { class: 'clk-coin', onpointerdown: e => { e.preventDefault(); doClick(e); } }, '🪙');
      const clickInfo = h('div', { class: 'hint-text clk-click-info' }, 'За тап: ' + fmt(clickValue(S)) + (m.crit > 0 ? ' · крит ' + Math.round(m.crit * 100) + '% ×' + (1 + m.critMul) : ''));
      const boostBar = h('div', { class: 'hint-text clk-boost', style: 'color:var(--gold);min-height:16px' }, boost.left > 0 ? '🔥 Буст ×' + boost.mul + ' — ' + Math.ceil(boost.left) + ' с' : '');
      area.append(h('div', { class: 'clk-stage' }, coinEl), clickInfo, boostBar);

      // вкладки
      tabsEl = h('div', { class: 'clk-tabs' }, [['build', '🏗 Здания'], ['upg', '⬆️ Улучшения'], ['ach', '🏅 Награды'], ['stat', '📊 Статистика']].map(([k, n]) =>
        h('button', { class: 'btn small ' + (tab === k ? 'primary' : ''), onclick: () => { tab = k; api.sound('tap'); render(); } }, n)));
      listEl = h('div', { class: 'clk-list' });
      area.append(tabsEl, listEl);
      screen.append(area);
      fillList();
    }
    function refresh() {
      if (bankEl) bankEl.textContent = fmt(S.bank);
      if (cpsEl) cpsEl.textContent = fmt(cps(S)) + '/с';
      const ci = screen.querySelector('.clk-click-info'); if (ci) { const m = mods(S); ci.textContent = 'За тап: ' + fmt(clickValue(S)) + ' · крит ' + Math.round(m.crit * 100) + '% ×' + (1 + m.critMul); }
      fillList();
    }
    function fillList() {
      listEl.innerHTML = '';
      const m = mods(S);
      if (tab === 'build') {
        BUILDINGS.forEach((b, i) => {
          const n = S.b[b.id] || 0; const p = price(b, n); const locked = i > 0 && !(S.b[BUILDINGS[i - 1].id] || 0) && !n;
          if (locked && !(S.bank >= p * 0.3)) return;
          const inc = b.cps * (m['mul_' + b.id] || 1) * m.allMul * m.starMul;
          listEl.append(h('div', { class: 'clk-item' + (S.bank >= p ? '' : ' off'), onclick: () => buy(b, 1), oncontextmenu: e => { e.preventDefault(); buy(b, 10); } },
            h('div', { class: 'clk-ic' }, b.ic),
            h('div', { style: 'flex:1;min-width:0' }, h('b', null, b.nm + (n ? ' ×' + n : '')), h('div', { class: 'clk-d' }, b.d), h('div', { class: 'clk-d', style: 'color:var(--accent2)' }, '+' + fmt(inc) + '/с каждое' + (n >= 25 ? ' · бонус ×' + m['mul_' + b.id] : ''))),
            h('div', { style: 'text-align:right' }, h('div', { class: 'clk-price' }, fmt(p)), h('button', { class: 'btn small', onclick: e => { e.stopPropagation(); buy(b, 10); } }, '×10'))));
        });
      } else if (tab === 'upg') {
        const all = [...CLICK_UPG, ...GLOBAL_UPG].filter(u => !S.u.includes(u.id)).sort((x, y) => x.cost - y.cost);
        if (!all.length) listEl.append(h('div', { class: 'hint-text', style: 'padding:20px' }, 'Все улучшения куплены! Совершите престиж, чтобы начать заново с бонусом.'));
        all.forEach(u => listEl.append(h('div', { class: 'clk-item' + (S.bank >= u.cost ? '' : ' off'), onclick: () => buyUpg(u) },
          h('div', { class: 'clk-ic' }, u.ic), h('div', { style: 'flex:1;min-width:0' }, h('b', null, u.nm), h('div', { class: 'clk-d' }, u.d)), h('div', { class: 'clk-price' }, fmt(u.cost)))));
        listEl.append(h('div', { class: 'clk-item', onclick: exchange }, h('div', { class: 'clk-ic' }, '💱'), h('div', { style: 'flex:1' }, h('b', null, 'Обмен на общие монеты'), h('div', { class: 'clk-d' }, 'Потратить монеты кликера на валюту Чмоги')), h('div', { class: 'clk-price' }, fmt(50000 * Math.pow(2, S.exchanged)))));
      } else if (tab === 'ach') {
        ACHIEVEMENTS.forEach(a2 => listEl.append(h('div', { class: 'clk-item' + (S.ach.includes(a2.id) ? ' done' : '') },
          h('div', { class: 'clk-ic' }, S.ach.includes(a2.id) ? '🏅' : '🔒'),
          h('div', { style: 'flex:1;min-width:0' }, h('b', null, a2.nm), h('div', { class: 'clk-d' }, a2.d)),
          h('div', { class: 'clk-price', style: 'color:var(--gold)' }, '+' + a2.r))));
      } else {
        const m2 = mods(S);
        const rows = [['Монет сейчас', fmt(S.bank)], ['Заработано всего', fmt(S.total)], ['Потрачено', fmt(S.spent)], ['Доход в секунду', fmt(cps(S))], ['Сила тапа', fmt(clickValue(S))], ['Тапов сделано', S.clicks], ['Критов поймано', S.crits], ['Золотых монет', S.golds], ['Зданий построено', tot(S)], ['Улучшений куплено', S.u.length + ' / ' + (CLICK_UPG.length + GLOBAL_UPG.length)], ['Наград получено', S.ach.length + ' / ' + ACHIEVEMENTS.length], ['Звёзд престижа', S.stars + ' (+' + Math.round(S.stars * 5) + '% дохода)'], ['Следующая звезда', fmt(Math.pow(S.stars + 1, 2) * 1e6) + ' всего'], ['Офлайн-доход', m2.offlineH + ' ч']];
        rows.forEach(([k, v]) => listEl.append(h('div', { class: 'clk-row' }, h('span', null, k), h('b', null, String(v)))));
        listEl.append(h('button', { class: 'btn', style: 'width:100%;margin-top:8px', onclick: () => api.modal({ title: 'Сбросить кликер?', text: 'Полный сброс: монеты, здания, улучшения, звёзды и награды.', buttons: [{ label: 'Отмена' }, { label: 'Сбросить', cls: 'primary', onClick: () => { S = Object.assign({}, DEF, { b: {}, u: [], ach: [] }); save(); render(); } }] }) }, 'Сбросить кликер'));
      }
    }
    function doClick(e) {
      const m = mods(S); let v = clickValue(S); let crit = false;
      if (Math.random() < m.crit) { v *= (1 + m.critMul); crit = true; S.crits++; api.vibrate(20); }
      S.bank += v; S.total += v; S.clicks++;
      coinEl.style.transform = 'scale(.9)'; setTimeout(() => coinEl.style.transform = '', 70);
      const r = coinEl.getBoundingClientRect();
      pops.push({ x: (e.clientX || r.left + r.width / 2), y: (e.clientY || r.top + r.height / 2), v: '+' + fmt(v), crit, life: 1 });
      api.sound(crit ? 'good' : 'tap'); if (!crit) api.vibrate(4);
      bankEl.textContent = fmt(S.bank);
      checkAch();
    }
    /* всплывающие числа */
    const layer = h('div', { style: 'position:fixed;inset:0;pointer-events:none;z-index:40' }); document.body.append(layer);
    function drawPops(dt) {
      layer.innerHTML = '';
      pops.forEach(p => { p.life -= dt * 1.2; p.y -= 60 * dt; });
      pops = pops.filter(p => p.life > 0);
      pops.forEach(p => layer.append(h('div', { style: `position:absolute;left:${p.x}px;top:${p.y}px;transform:translate(-50%,-50%);opacity:${Math.min(1, p.life)};font-weight:800;font-size:${p.crit ? 26 : 18}px;color:${p.crit ? '#fbbf24' : '#fff'};text-shadow:0 2px 6px #000` }, p.v + (p.crit ? ' КРИТ!' : ''))));
    }
    /* золотая монета */
    let goldEl = null;
    function spawnGold() {
      const m = mods(S);
      goldEl = h('div', { class: 'clk-gold', onpointerdown: e => {
        e.preventDefault(); S.golds++; api.sound('win'); api.vibrate([20, 40, 20]);
        const kind = Math.random();
        if (kind < 0.5) { boost = { mul: 7, left: 45 }; api.toast('🔥 Золотая монета: доход ×7 на 45 с'); }
        else if (kind < 0.8) { const bonus = cps(S) * 900 + clickValue(S) * 50; S.bank += bonus; S.total += bonus; api.toast('💰 Золотая монета: +' + fmt(bonus)); }
        else { boost = { mul: 77, left: 12 }; api.toast('⚡ ЯРОСТЬ: доход ×77 на 12 с'); }
        removeGold(); checkAch(); refresh();
      } }, '🪙');
      const pad = 70; goldEl.style.left = (pad + Math.random() * (window.innerWidth - pad * 2)) + 'px';
      goldEl.style.top = (150 + Math.random() * (window.innerHeight - 320)) + 'px';
      layer.append(goldEl); goldEl.style.pointerEvents = 'auto';
      goldTimer = m.goldLife;
    }
    let goldTimer = 0;
    function removeGold() { if (goldEl) { goldEl.remove(); goldEl = null; } const m = mods(S); goldT = (60 + Math.random() * 90) / (1 + m.luck * 0.6); }

    /* ===== цикл ===== */
    let acc = 0, uiAcc = 0, last = performance.now();
    timer = setInterval(() => {
      const now = performance.now(); const dt = Math.min(0.5, (now - last) / 1000); last = now;
      const inc = cps(S) * dt; if (inc > 0) { S.bank += inc; S.total += inc; }
      if (boost.left > 0) { boost.left -= dt; if (boost.left <= 0) boost = { mul: 1, left: 0 }; }
      goldT -= dt; if (goldT <= 0 && !goldEl) spawnGold();
      if (goldEl) { goldTimer -= dt; if (goldTimer <= 0) removeGold(); }
      drawPops(dt);
      uiAcc += dt; acc += dt;
      if (uiAcc > 0.1) { uiAcc = 0; if (bankEl) bankEl.textContent = fmt(S.bank); if (cpsEl) cpsEl.textContent = fmt(cps(S)) + '/с';
        const bb = screen.querySelector('.clk-boost'); if (bb) bb.textContent = boost.left > 0 ? '🔥 Буст ×' + boost.mul + ' — ' + Math.ceil(boost.left) + ' с' : '';
      }
      if (acc > 3) { acc = 0; checkAch(); save(); if (tab === 'build' || tab === 'upg') fillList(); }
    }, 50);

    this.unmount = () => { clearInterval(timer); save(); layer.remove(); };
    render(); checkAch();
  }
});
