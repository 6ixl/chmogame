p = 'www/js/games/clicker.js'
s = open(p, encoding='utf-8').read()

def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:70], s.count(a))
    s = s.replace(a, b)

# ---------- 1. новые здания ----------
rep("    { id: 'anti', nm: 'Антиматерия', ic: '⚛️', base: 14000000000000, cps: 65000000, d: 'Конденсирует золото из вакуума' }",
"""    { id: 'anti', nm: 'Антиматерия', ic: '⚛️', base: 14000000000000, cps: 65000000, d: 'Конденсирует золото из вакуума' },
    { id: 'quantum', nm: 'Квантовый ПК', ic: '🖥', base: 1.7e14, cps: 4.3e8, d: 'Считает монеты во всех вероятностях' },
    { id: 'hole', nm: 'Чёрная дыра', ic: '🕳', base: 2.1e15, cps: 2.9e9, d: 'Засасывает чужие сбережения' },
    { id: 'forge', nm: 'Звёздная кузница', ic: '⭐', base: 2.6e16, cps: 2.1e10, d: 'Кует монеты из звёздного вещества' },
    { id: 'multi', nm: 'Мультивселенная', ic: '🌌', base: 3.1e17, cps: 1.5e11, d: 'Собирает дань с параллельных миров' },
    { id: 'mint', nm: 'Божественный двор', ic: '👑', base: 3.7e18, cps: 1.1e12, d: 'Чеканит монеты силой мысли' },
    { id: 'singul', nm: 'Сингулярность', ic: '💠', base: 4.4e19, cps: 8e12, d: 'Доход стремится к бесконечности' }""")

# ---------- 2. новые улучшения ----------
rep("    { id: 'crit4', nm: 'Идеальный удар', ic: '🔱', cost: 900000000, d: 'Шанс крита +15%', f: s => s.crit += 0.15 }",
"""    { id: 'crit4', nm: 'Идеальный удар', ic: '🔱', cost: 900000000, d: 'Шанс крита +15%', f: s => s.crit += 0.15 },
    { id: 'c8', nm: 'Длань титана', ic: '🦾', cost: 5e10, d: 'Сила тапа ×8', f: s => s.clickMul *= 8 },
    { id: 'c9', nm: 'Тап вселенной', ic: '🌠', cost: 8e12, d: 'Тап даёт +10% от дохода в секунду', f: s => s.clickCps += 0.1 },
    { id: 'crit5', nm: 'Разрушитель', ic: '☄️', cost: 4e11, d: 'Урон крита ×3 (сильнее)', f: s => s.critMul += 15 },
    { id: 'cb1', nm: 'Ритм', ic: '🥁', cost: 2e6, d: 'Комбо от быстрых тапов растёт до ×3', f: s => s.comboMax += 1 },
    { id: 'cb2', nm: 'Барабанная дробь', ic: '🎶', cost: 3e9, d: 'Комбо растёт до ×5 и держится дольше', f: s => { s.comboMax += 2; s.comboHold += 1; } }""")
rep("    { id: 'b2', nm: 'Удача мира', ic: '🌟', cost: 700000000, d: 'Золотые монеты появляются ещё чаще и живут дольше', f: s => { s.luck += 1; s.goldLife += 6; } }",
"""    { id: 'b2', nm: 'Удача мира', ic: '🌟', cost: 700000000, d: 'Золотые монеты появляются ещё чаще и живут дольше', f: s => { s.luck += 1; s.goldLife += 6; } },
    { id: 'g6', nm: 'Галактический рынок', ic: '🛰', cost: 2e13, d: 'Весь доход ×4', f: s => s.allMul *= 4 },
    { id: 'g7', nm: 'Экономика сингулярности', ic: '💠', cost: 9e15, d: 'Весь доход ×6', f: s => s.allMul *= 6 },
    { id: 'm1', nm: 'Менеджер смены', ic: '👔', cost: 5e7, d: 'Раз в 5 с сам покупает доступное здание', f: s => s.manager += 1 },
    { id: 'm2', nm: 'Совет директоров', ic: '🏢', cost: 4e10, d: 'Автопокупка вдвое быстрее и умнее', f: s => s.manager += 1 },
    { id: 'gm1', nm: 'Магнит удачи', ic: '🧲', cost: 6e8, d: 'Золотые монеты дают вдвое больше', f: s => s.goldMul *= 2 }""")

# ---------- 3. достижения ----------
rep("{ id: 'a26', nm: 'Всё скуплено', d: 'Купи 20 улучшений', c: s => s.u.length >= 20, r: 100 }",
"""{ id: 'a26', nm: 'Всё скуплено', d: 'Купи 20 улучшений', c: s => s.u.length >= 20, r: 100 },
      { id: 'a27', nm: 'Квадриллионер', d: 'Заработай 1 Qa', c: s => s.total >= 1e15, r: 250 },
      { id: 'a28', nm: 'Сингулярность', d: 'Построй Сингулярность', c: s => (s.b.singul || 0) >= 1, r: 300 },
      { id: 'a29', nm: 'Комбо-мастер', d: 'Достигни комбо ×3', c: s => (s.maxCombo || 1) >= 3, r: 60 },
      { id: 'a30', nm: 'Покупатель', d: 'Купи что-нибудь в магазине', c: s => (s.shopBuys || 0) >= 1, r: 20 },
      { id: 'a31', nm: 'Постоянный клиент', d: '10 покупок в магазине', c: s => (s.shopBuys || 0) >= 10, r: 120 },
      { id: 'a32', nm: 'Исполнитель', d: 'Выполни 10 миссий', c: s => (s.missionsDone || 0) >= 10, r: 100 },
      { id: 'a33', nm: 'Трудоголик', d: 'Выполни 50 миссий', c: s => (s.missionsDone || 0) >= 50, r: 300 },
      { id: 'a34', nm: 'Ежедневно', d: 'Забери 7 ежедневных бонусов', c: s => (s.dailyCount || 0) >= 7, r: 150 },
      { id: 'a35', nm: 'Коллекционер скинов', d: 'Открой 3 скина монеты', c: s => (s.skins || []).length >= 3, r: 120 }""")

# ---------- 4. состояние ----------
rep("  const DEF = { bank: 0, total: 0, clicks: 0, crits: 0, golds: 0, b: {}, u: [], ach: [], stars: 0, spent: 0, exchanged: 0, last: Date.now(), idle: 0 };",
"""  const DEF = { bank: 0, total: 0, clicks: 0, crits: 0, golds: 0, b: {}, u: [], ach: [], stars: 0, spent: 0, exchanged: 0, last: Date.now(), idle: 0,
    permInc: 0, permClick: 0, shopBuys: 0, skins: ['coin'], skin: 'coin', missions: null, missionsDone: 0, daily: 0, dailyCount: 0, maxCombo: 1,
    boostUntil: 0, boostMul: 1, autoUntil: 0 };""")
rep("    const m = { clickAdd: 0, clickMul: 1, clickCps: 0, crit: 0.02, critMul: 5, allMul: 1, offlineH: 8, offlineMul: 1, luck: 0, goldLife: 12 };",
"""    const m = { clickAdd: 0, clickMul: 1, clickCps: 0, crit: 0.02, critMul: 5, allMul: 1, offlineH: 8, offlineMul: 1, luck: 0, goldLife: 12,
      comboMax: 0, comboHold: 0, manager: 0, goldMul: 1 };""")
rep("    m.starMul = 1 + s.stars * 0.05;\n    return m;",
"""    m.starMul = 1 + s.stars * 0.05;
    m.allMul *= 1 + (s.permInc || 0) * 0.2;                 // постоянные бонусы из магазина
    m.clickMul *= 1 + (s.permClick || 0) * 0.5;
    m.comboCap = 1 + Math.min(4, m.comboMax);               // максимум комбо (×2 базово, до ×5)
    return m;""")

# постоянный буст из магазина учитывается в доходе
rep("""  function cps(s, boostMul) {
    const m = mods(s);
    return BUILDINGS.reduce((a, b) => a + (s.b[b.id] || 0) * b.cps * (m['mul_' + b.id] || 1), 0) * m.allMul * m.starMul * (boostMul || 1);
  }""",
"""  const shopBoost = s => (s.boostUntil && Date.now() < s.boostUntil) ? (s.boostMul || 1) : 1;
  function cps(s, boostMul) {
    const m = mods(s);
    return BUILDINGS.reduce((a, b) => a + (s.b[b.id] || 0) * b.cps * (m['mul_' + b.id] || 1), 0) * m.allMul * m.starMul * (boostMul || 1) * shopBoost(s);
  }""")
rep("  function clickValue(s, boostMul) { const m = mods(s); return (1 + m.clickAdd) * m.clickMul * m.starMul * m.allMul * (boostMul || 1) + cps(s, boostMul) * m.clickCps; }",
    "  function clickValue(s, boostMul) { const m = mods(s); return ((1 + m.clickAdd) * m.clickMul * m.starMul * m.allMul * (boostMul || 1) * shopBoost(s)) + cps(s, boostMul) * m.clickCps; }")
rep("  return { get S() { return S; }, set S(v) { S = v; }, BUILDINGS, CLICK_UPG, GLOBAL_UPG, ACHIEVEMENTS, DEF, tot, mods, cps, clickValue, price, fmt, save, settle, reset };",
    "  return { get S() { return S; }, set S(v) { S = v; }, BUILDINGS, CLICK_UPG, GLOBAL_UPG, ACHIEVEMENTS, DEF, tot, mods, cps, clickValue, price, fmt, save, settle, reset, shopBoost };")

# ---------- 5. магазин, миссии, комбо, скины в UI ----------
rep("    const { BUILDINGS, CLICK_UPG, GLOBAL_UPG, ACHIEVEMENTS, tot, mods, cps, clickValue, price, fmt, settle, DEF } = window.ClickerCore;",
"""    const { BUILDINGS, CLICK_UPG, GLOBAL_UPG, ACHIEVEMENTS, tot, mods, cps, clickValue, price, fmt, settle, DEF, shopBoost } = window.ClickerCore;
    /* ===== магазин за общие монеты приложения ===== */
    const SKINS = { coin: '🪙', gem: '💎', crown: '👑', star: '🌟', ufo: '🛸', dragon: '🐲' };
    const SHOP = [
      { id: 'boost3', nm: 'Ускоритель ×3', ic: '⚡', cost: 40, d: 'Весь доход ×3 на 1 час', f: () => { S.boostUntil = Date.now() + 3600e3; S.boostMul = 3; } },
      { id: 'boost10', nm: 'Мега-буст ×10', ic: '🔥', cost: 90, d: 'Весь доход ×10 на 15 минут', f: () => { S.boostUntil = Date.now() + 900e3; S.boostMul = 10; } },
      { id: 'bag', nm: 'Мешок монет', ic: '💰', cost: 60, d: 'Мгновенно доход за 4 часа', f: () => { const g = cps(S) * 14400; S.bank += g; S.total += g; api.toast('+' + fmt(g)); } },
      { id: 'auto', nm: 'Автокликер', ic: '🤖', cost: 70, d: '10 тапов в секунду на 1 час', f: () => { S.autoUntil = Date.now() + 3600e3; } },
      { id: 'perm', nm: 'Вечный доход +20%', ic: '📈', cost: 150, d: 'Навсегда, можно покупать много раз', f: () => { S.permInc = (S.permInc || 0) + 1; } },
      { id: 'permc', nm: 'Вечный тап +50%', ic: '👆', cost: 120, d: 'Навсегда, можно покупать много раз', f: () => { S.permClick = (S.permClick || 0) + 1; } },
      { id: 'star', nm: 'Звезда престижа', ic: '⭐', cost: 400, d: '+1 звезда (+5% дохода навсегда)', f: () => { S.stars++; } },
      { id: 'golds', nm: 'Три золотые монеты', ic: '🍀', cost: 50, d: 'Сразу 3 золотые монеты на экран', f: () => { pendingGolds += 3; } },
      { id: 'skin_gem', nm: 'Скин: Самоцвет', ic: '💎', cost: 100, d: 'Внешний вид монеты', skin: 'gem' },
      { id: 'skin_crown', nm: 'Скин: Корона', ic: '👑', cost: 120, d: 'Внешний вид монеты', skin: 'crown' },
      { id: 'skin_star', nm: 'Скин: Звезда', ic: '🌟', cost: 140, d: 'Внешний вид монеты', skin: 'star' },
      { id: 'skin_ufo', nm: 'Скин: НЛО', ic: '🛸', cost: 160, d: 'Внешний вид монеты', skin: 'ufo' },
      { id: 'skin_dragon', nm: 'Скин: Дракон', ic: '🐲', cost: 200, d: 'Внешний вид монеты', skin: 'dragon' }
    ];
    /* ===== миссии ===== */
    const MISSIONS = [
      { id: 'm_tap', nm: 'Сделай {n} тапов', gen: () => ({ n: 100 + api.rand(0, 4) * 100 }), pr: (s, d, st) => s.clicks - st.clicks, r: 15 },
      { id: 'm_build', nm: 'Построй {n} зданий', gen: () => ({ n: 3 + api.rand(0, 7) }), pr: (s, d, st) => tot(s) - st.tot, r: 20 },
      { id: 'm_gold', nm: 'Поймай {n} золотых монет', gen: () => ({ n: 1 + api.rand(0, 2) }), pr: (s, d, st) => s.golds - st.golds, r: 25 },
      { id: 'm_crit', nm: 'Поймай {n} критов', gen: () => ({ n: 10 + api.rand(0, 4) * 5 }), pr: (s, d, st) => s.crits - st.crits, r: 20 },
      { id: 'm_earn', nm: 'Заработай {n} монет', gen: () => ({ n: 0 }), dyn: s => Math.max(1000, cps(s) * 120 + 500), pr: (s, d, st) => s.total - st.total, r: 25 },
      { id: 'm_upg', nm: 'Купи {n} улучшения', gen: () => ({ n: 1 + api.rand(0, 1) }), pr: (s, d, st) => s.u.length - st.u, r: 30 }
    ];
    let pendingGolds = 0, combo = 1, comboT = 0, autoT = 0, mgrT = 0;
    function newMissions() {
      const pool = api.shuffle(MISSIONS.slice()).slice(0, 3);
      S.missions = pool.map(m => { const d = m.gen(); if (m.dyn) d.n = Math.round(m.dyn(S)); return { id: m.id, n: d.n, st: { clicks: S.clicks, tot: tot(S), golds: S.golds, crits: S.crits, total: S.total, u: S.u.length } }; });
      window.ClickerCore.save();
    }
    function missionProgress(ms) { const def = MISSIONS.find(x => x.id === ms.id); return Math.max(0, Math.min(ms.n, def.pr(S, ms, ms.st))); }
    function checkMissions() {
      if (!S.missions) newMissions();
      S.missions.forEach(ms => {
        if (ms.done) return;
        if (missionProgress(ms) >= ms.n) {
          ms.done = true; S.missionsDone = (S.missionsDone || 0) + 1;
          const def = MISSIONS.find(x => x.id === ms.id); api.addCoins(def.r); api.sound('win'); api.toast('✅ Миссия выполнена: +' + def.r + ' монет');
        }
      });
      if (S.missions.every(m => m.done)) newMissions();
    }
    function buyShop(item) {
      if (item.skin && (S.skins || []).includes(item.skin)) { S.skin = item.skin; api.sound('tap'); window.ClickerCore.save(); refresh(); return; }
      if (!api.spend(item.cost)) return;
      S.shopBuys = (S.shopBuys || 0) + 1;
      if (item.skin) { S.skins = (S.skins || ['coin']).concat([item.skin]); S.skin = item.skin; } else item.f();
      api.sound('win'); api.vibrate([15, 25, 15]); window.ClickerCore.save(); checkAch(); refresh();
    }
    function dailyBonus() {
      const today = new Date().toDateString();
      if (S.daily === today) { api.toast('Сегодня уже забрали'); return; }
      S.daily = today; S.dailyCount = (S.dailyCount || 0) + 1;
      const g = cps(S) * 1800 + 500; S.bank += g; S.total += g; pendingGolds += 1; api.addCoins(10);
      api.sound('win'); api.vibrate([20, 40, 20]); checkAch(); window.ClickerCore.save(); refresh();
      api.modal({ title: '🎁 Ежедневный бонус', text: `Получено ${fmt(g)} монет кликера, +10 общих монет и золотая монета. Серия: ${S.dailyCount} дней.`, buttons: [{ label: 'Отлично', cls: 'primary' }] });
    }""")

# ---------- 6. вкладки ----------
rep("""      tabsEl = h('div', { class: 'clk-tabs' }, [['build', '🏗 Здания'], ['upg', '⬆️ Улучшения'], ['ach', '🏅 Награды'], ['stat', '📊 Статистика']].map(([k, n]) =>
        h('button', { class: 'btn small ' + (tab === k ? 'primary' : ''), onclick: () => { tab = k; api.sound('tap'); render(); } }, n)));""",
"""      tabsEl = h('div', { class: 'clk-tabs' }, [['build', '🏗'], ['upg', '⬆️'], ['shop', '🛒'], ['miss', '🎯'], ['ach', '🏅'], ['stat', '📊']].map(([k, n]) =>
        h('button', { class: 'btn small ' + (tab === k ? 'primary' : ''), onclick: () => { tab = k; api.sound('tap'); render(); } }, n)));""")

# ---------- 7. содержимое новых вкладок ----------
rep("      } else if (tab === 'ach') {",
"""      } else if (tab === 'shop') {
        const today = new Date().toDateString();
        listEl.append(h('div', { class: 'clk-item' + (S.daily === today ? ' done' : ''), onclick: dailyBonus }, h('div', { class: 'clk-ic' }, '🎁'),
          h('div', { style: 'flex:1' }, h('b', null, 'Ежедневный бонус'), h('div', { class: 'clk-d' }, S.daily === today ? 'Уже получен сегодня · серия ' + (S.dailyCount || 0) : 'Монеты, золотая монета и +10 общих монет')),
          h('div', { class: 'clk-price' }, S.daily === today ? '✓' : 'бесплатно')));
        if (S.boostUntil && Date.now() < S.boostUntil) listEl.append(h('div', { class: 'clk-row' }, h('span', null, '🔥 Активен буст ×' + S.boostMul), h('b', null, Math.ceil((S.boostUntil - Date.now()) / 60000) + ' мин')));
        if (S.autoUntil && Date.now() < S.autoUntil) listEl.append(h('div', { class: 'clk-row' }, h('span', null, '🤖 Автокликер'), h('b', null, Math.ceil((S.autoUntil - Date.now()) / 60000) + ' мин')));
        listEl.append(h('div', { class: 'hint-text', style: 'text-align:left;padding:4px 6px' }, 'Покупки за общие монеты приложения. Сейчас: ' + api.coins + ' ●'));
        SHOP.forEach(item => {
          const owned = item.skin && (S.skins || []).includes(item.skin);
          const active = item.skin && S.skin === item.skin;
          listEl.append(h('div', { class: 'clk-item' + (owned && active ? ' done' : (api.coins >= item.cost || owned ? '' : ' off')), onclick: () => buyShop(item) },
            h('div', { class: 'clk-ic' }, item.ic),
            h('div', { style: 'flex:1;min-width:0' }, h('b', null, item.nm + (item.id === 'perm' && S.permInc ? ' ×' + S.permInc : item.id === 'permc' && S.permClick ? ' ×' + S.permClick : '')), h('div', { class: 'clk-d' }, item.d)),
            h('div', { class: 'clk-price', style: 'color:' + (owned ? 'var(--green)' : 'var(--gold)') }, owned ? (active ? 'надет' : 'надеть') : item.cost + ' ●')));
        });
      } else if (tab === 'miss') {
        if (!S.missions) newMissions();
        listEl.append(h('div', { class: 'hint-text', style: 'text-align:left;padding:4px 6px' }, 'Выполнено миссий: ' + (S.missionsDone || 0) + ' · награда в общих монетах'));
        S.missions.forEach(ms => {
          const def = MISSIONS.find(x => x.id === ms.id); const pr = missionProgress(ms);
          listEl.append(h('div', { class: 'clk-item' + (ms.done ? ' done' : '') }, h('div', { class: 'clk-ic' }, ms.done ? '✅' : '🎯'),
            h('div', { style: 'flex:1;min-width:0' }, h('b', null, def.nm.replace('{n}', fmt(ms.n))),
              h('div', { class: 'clk-d' }, ms.done ? 'Выполнено' : fmt(pr) + ' / ' + fmt(ms.n)),
              h('div', { style: 'height:5px;background:var(--bg2);border-radius:3px;margin-top:4px;overflow:hidden' }, h('div', { style: 'height:100%;width:' + Math.round(pr / ms.n * 100) + '%;background:var(--accent2)' }))),
            h('div', { class: 'clk-price', style: 'color:var(--gold)' }, '+' + def.r)));
        });
        listEl.append(h('button', { class: 'btn', style: 'width:100%', onclick: () => { newMissions(); api.sound('tap'); fillList(); } }, '🔄 Сменить миссии'));
      } else if (tab === 'ach') {""")

# ---------- 8. статистика ----------
rep("['Фоновый доход', m2.offlineH + ' ч · 100%']];",
"""['Фоновый доход', m2.offlineH + ' ч · 100%'], ['Комбо максимум', '×' + (S.maxCombo || 1).toFixed(1)], ['Покупок в магазине', S.shopBuys || 0], ['Миссий выполнено', S.missionsDone || 0], ['Скинов открыто', (S.skins || []).length], ['Постоянные бонусы', '+' + ((S.permInc || 0) * 20) + '% доход, +' + ((S.permClick || 0) * 50) + '% тап']];""")

# ---------- 9. комбо, автокликер, менеджер, скины ----------
rep("      coinEl = h('div', { class: 'clk-coin', onpointerdown: e => { e.preventDefault(); doClick(e); } }, '🪙');",
    "      coinEl = h('div', { class: 'clk-coin', onpointerdown: e => { e.preventDefault(); doClick(e); } }, SKINS[S.skin] || '🪙');")
rep("""    function doClick(e) {
      const m = mods(S); let v = clickValue(S, boost.mul); let crit = false;""",
"""    function doClick(e) {
      const m = mods(S);
      const now = Date.now();
      if (now - (lastClickAt || 0) < 420 + (m.comboHold || 0) * 200) combo = Math.min(m.comboCap, combo + 0.1); else combo = 1;
      lastClickAt = now; comboT = 1.4 + (m.comboHold || 0) * 0.6;
      if (combo > (S.maxCombo || 1)) S.maxCombo = combo;
      let v = clickValue(S, boost.mul) * combo; let crit = false;""")
rep("    let boost = { mul: 1, left: 0 }, golden = null, goldT = 30 + Math.random() * 40, pops = [], tab = 'build', timer, coinEl, bankEl, cpsEl, tabsEl, listEl, statsEl, shakeT = 0;",
    "    let boost = { mul: 1, left: 0 }, golden = null, goldT = 30 + Math.random() * 40, pops = [], tab = 'build', timer, coinEl, bankEl, cpsEl, tabsEl, listEl, statsEl, shakeT = 0, lastClickAt = 0;")
rep("        else { boost = { mul: 77, left: 12 }; api.toast('⚡ ЯРОСТЬ: доход ×77 на 12 с'); }",
    "        else { boost = { mul: 77, left: 12 }; api.toast('⚡ ЯРОСТЬ: доход ×77 на 12 с'); }\n        S.golds = S.golds; checkMissions();")
rep("        if (kind < 0.5) { boost = { mul: 7, left: 45 }; api.toast('🔥 Золотая монета: доход ×7 на 45 с'); }",
    "        const gm = mods(S).goldMul || 1;\n        if (kind < 0.5) { boost = { mul: 7 * gm, left: 45 }; api.toast('🔥 Золотая монета: доход ×' + (7 * gm) + ' на 45 с'); }")
rep("        else if (kind < 0.8) { const bonus = cps(S, 1) * 900 + clickValue(S, 1) * 50; S.bank += bonus; S.total += bonus; api.toast('💰 Золотая монета: +' + fmt(bonus)); }",
    "        else if (kind < 0.8) { const bonus = (cps(S, 1) * 900 + clickValue(S, 1) * 50) * gm; S.bank += bonus; S.total += bonus; api.toast('💰 Золотая монета: +' + fmt(bonus)); }")

# в игровом цикле: комбо-таймер, автокликер, менеджер, проверка миссий
rep("""      if (acc > 3) { acc = 0; checkAch(); save(); if (tab === 'build' || tab === 'upg') fillList(); }""",
"""      // комбо затухает
      if (comboT > 0) { comboT -= dt; if (comboT <= 0) combo = 1; }
      // автокликер из магазина
      if (S.autoUntil && Date.now() < S.autoUntil) { autoT += dt; while (autoT > 0.1) { autoT -= 0.1; const v = clickValue(S, boost.mul); S.bank += v; S.total += v; S.clicks++; } }
      // менеджер: сам покупает здания
      const mg = mods(S).manager || 0;
      if (mg > 0) { mgrT += dt; if (mgrT > (mg > 1 ? 2.5 : 5)) { mgrT = 0; const aff = BUILDINGS.filter(b => S.bank >= price(b, S.b[b.id] || 0)); if (aff.length) { const pick = mg > 1 ? aff[aff.length - 1] : aff[0]; buy(pick, 1); } } }
      // отложенные золотые монеты из магазина
      if (pendingGolds > 0 && !goldEl) { pendingGolds--; spawnGold(); }
      if (acc > 3) { acc = 0; checkAch(); checkMissions(); save(); if (tab !== 'stat') fillList(); }""")

# комбо в подписи
rep("      const ci = screen.querySelector('.clk-click-info'); if (ci) { const m = mods(S); ci.textContent = 'За тап: ' + fmt(clickValue(S, boost.mul)) + ' · крит ' + Math.round(m.crit * 100) + '% ×' + (1 + m.critMul); }",
    "      const ci = screen.querySelector('.clk-click-info'); if (ci) { const m = mods(S); ci.textContent = 'За тап: ' + fmt(clickValue(S, boost.mul) * combo) + (combo > 1.05 ? ' · комбо ×' + combo.toFixed(1) : '') + ' · крит ' + Math.round(m.crit * 100) + '%'; }")
rep("        const bb = screen.querySelector('.clk-boost'); if (bb) bb.textContent = boost.left > 0 ? '🔥 Буст ×' + boost.mul + ' — ' + Math.ceil(boost.left) + ' с' : '';",
"""        const bb = screen.querySelector('.clk-boost');
        if (bb) { const sb = shopBoost(S); bb.textContent = boost.left > 0 ? '🔥 Буст ×' + boost.mul + ' — ' + Math.ceil(boost.left) + ' с' : sb > 1 ? '⚡ Ускоритель ×' + sb + ' — ' + Math.ceil((S.boostUntil - Date.now()) / 60000) + ' мин' : combo > 1.05 ? '🥁 Комбо ×' + combo.toFixed(1) : ''; }
        const ci2 = screen.querySelector('.clk-click-info'); if (ci2 && combo > 1.05) ci2.textContent = 'За тап: ' + fmt(clickValue(S, boost.mul) * combo) + ' · комбо ×' + combo.toFixed(1);""")

rep("    render(); checkAch();", "    render(); checkAch(); checkMissions();")
open(p, 'w', encoding='utf-8').write(s)
print('clicker upgraded')
