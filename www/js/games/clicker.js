/* Монетный кликер — большое обновление: здания, улучшения, крит, бусты, престиж, достижения, офлайн-доход */
/* ===== ядро кликера: живёт всегда, доход считается по реальному времени ===== */
window.ClickerCore = (function () {
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
    { id: 'anti', nm: 'Антиматерия', ic: '⚛️', base: 14000000000000, cps: 65000000, d: 'Конденсирует золото из вакуума' },
    { id: 'quantum', nm: 'Квантовый ПК', ic: '🖥', base: 1.7e14, cps: 4.3e8, d: 'Считает монеты во всех вероятностях' },
    { id: 'hole', nm: 'Чёрная дыра', ic: '🕳', base: 2.1e15, cps: 2.9e9, d: 'Засасывает чужие сбережения' },
    { id: 'forge', nm: 'Звёздная кузница', ic: '⭐', base: 2.6e16, cps: 2.1e10, d: 'Кует монеты из звёздного вещества' },
    { id: 'multi', nm: 'Мультивселенная', ic: '🌌', base: 3.1e17, cps: 1.5e11, d: 'Собирает дань с параллельных миров' },
    { id: 'mint', nm: 'Божественный двор', ic: '👑', base: 3.7e18, cps: 1.1e12, d: 'Чеканит монеты силой мысли' },
    { id: 'singul', nm: 'Сингулярность', ic: '💠', base: 4.4e19, cps: 8e12, d: 'Доход стремится к бесконечности' }
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
    { id: 'crit4', nm: 'Идеальный удар', ic: '🔱', cost: 900000000, d: 'Шанс крита +15%', f: s => s.crit += 0.15 },
    { id: 'c8', nm: 'Длань титана', ic: '🦾', cost: 5e10, d: 'Сила тапа ×8', f: s => s.clickMul *= 8 },
    { id: 'c9', nm: 'Тап вселенной', ic: '🌠', cost: 8e12, d: 'Тап даёт +10% от дохода в секунду', f: s => s.clickCps += 0.1 },
    { id: 'crit5', nm: 'Разрушитель', ic: '☄️', cost: 4e11, d: 'Урон крита ×3 (сильнее)', f: s => s.critMul += 15 },
    { id: 'cb1', nm: 'Ритм', ic: '🥁', cost: 2e6, d: 'Комбо от быстрых тапов растёт до ×3', f: s => s.comboMax += 1 },
    { id: 'cb2', nm: 'Барабанная дробь', ic: '🎶', cost: 3e9, d: 'Комбо растёт до ×5 и держится дольше', f: s => { s.comboMax += 2; s.comboHold += 1; } }
    ];
  const GLOBAL_UPG = [
    { id: 'g1', nm: 'Смазка конвейера', ic: '🛠', cost: 50000, d: 'Весь доход ×1.25', f: s => s.allMul *= 1.25 },
    { id: 'g2', nm: 'Логистика', ic: '🚚', cost: 2000000, d: 'Весь доход ×1.5', f: s => s.allMul *= 1.5 },
    { id: 'g3', nm: 'Монополия', ic: '🎩', cost: 150000000, d: 'Весь доход ×2', f: s => s.allMul *= 2 },
    { id: 'g4', nm: 'Мировая биржа', ic: '📈', cost: 9000000000, d: 'Весь доход ×2.5', f: s => s.allMul *= 2.5 },
    { id: 'g5', nm: 'Печатный станок', ic: '🖨', cost: 400000000000, d: 'Весь доход ×3', f: s => s.allMul *= 3 },
    { id: 'o1', nm: 'Ночная смена', ic: '🌙', cost: 300000, d: 'Фоновый доход 12 ч вместо 8 ч', f: s => s.offlineH = 12 },
    { id: 'o2', nm: 'Круглосуточно', ic: '🕛', cost: 60000000, d: 'Фоновый доход 24 ч', f: s => s.offlineH = 24 },
    { id: 'o3', nm: 'Вечный двигатель', ic: '♾', cost: 5000000000, d: 'Фоновый доход 48 ч и ×1.5', f: s => { s.offlineH = 48; s.offlineMul = 1.5; } },
    { id: 'b1', nm: 'Золотая жила', ic: '🍀', cost: 1500000, d: 'Золотые монеты появляются чаще', f: s => s.luck += 1 },
    { id: 'b2', nm: 'Удача мира', ic: '🌟', cost: 700000000, d: 'Золотые монеты появляются ещё чаще и живут дольше', f: s => { s.luck += 1; s.goldLife += 6; } },
    { id: 'g6', nm: 'Галактический рынок', ic: '🛰', cost: 2e13, d: 'Весь доход ×4', f: s => s.allMul *= 4 },
    { id: 'g7', nm: 'Экономика сингулярности', ic: '💠', cost: 9e15, d: 'Весь доход ×6', f: s => s.allMul *= 6 },
    { id: 'm1', nm: 'Менеджер смены', ic: '👔', cost: 5e7, d: 'Раз в 5 с сам покупает доступное здание', f: s => s.manager += 1 },
    { id: 'm2', nm: 'Совет директоров', ic: '🏢', cost: 4e10, d: 'Автопокупка вдвое быстрее и умнее', f: s => s.manager += 1 },
    { id: 'gm1', nm: 'Магнит удачи', ic: '🧲', cost: 6e8, d: 'Золотые монеты дают вдвое больше', f: s => s.goldMul *= 2 }
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
    { id: 'a26', nm: 'Всё скуплено', d: 'Купи 20 улучшений', c: s => s.u.length >= 20, r: 100 },
      { id: 'a27', nm: 'Квадриллионер', d: 'Заработай 1 Qa', c: s => s.total >= 1e15, r: 250 },
      { id: 'a28', nm: 'Сингулярность', d: 'Построй Сингулярность', c: s => (s.b.singul || 0) >= 1, r: 300 },
      { id: 'a29', nm: 'Комбо-мастер', d: 'Достигни комбо ×3', c: s => (s.maxCombo || 1) >= 3, r: 60 },
      { id: 'a30', nm: 'Покупатель', d: 'Купи что-нибудь в магазине', c: s => (s.shopBuys || 0) >= 1, r: 20 },
      { id: 'a31', nm: 'Постоянный клиент', d: '10 покупок в магазине', c: s => (s.shopBuys || 0) >= 10, r: 120 },
      { id: 'a32', nm: 'Исполнитель', d: 'Выполни 10 миссий', c: s => (s.missionsDone || 0) >= 10, r: 100 },
      { id: 'a33', nm: 'Трудоголик', d: 'Выполни 50 миссий', c: s => (s.missionsDone || 0) >= 50, r: 300 },
      { id: 'a34', nm: 'Ежедневно', d: 'Забери 7 ежедневных бонусов', c: s => (s.dailyCount || 0) >= 7, r: 150 },
      { id: 'a35', nm: 'Коллекционер скинов', d: 'Открой 3 скина монеты', c: s => (s.skins || []).length >= 3, r: 120 }
    ];
  const tot = s => BUILDINGS.reduce((a, b) => a + (s.b[b.id] || 0), 0);
  const DEF = { bank: 0, total: 0, clicks: 0, crits: 0, golds: 0, b: {}, u: [], ach: [], stars: 0, spent: 0, exchanged: 0, last: Date.now(), idle: 0,
    permInc: 0, permClick: 0, shopBuys: 0, skins: ['coin'], skin: 'coin', missions: null, missionsDone: 0, daily: 0, dailyCount: 0, maxCombo: 1,
    boostUntil: 0, boostMul: 1, autoUntil: 0 };
  function mods(s) {
    const m = { clickAdd: 0, clickMul: 1, clickCps: 0, crit: 0.02, critMul: 5, allMul: 1, offlineH: 8, offlineMul: 1, luck: 0, goldLife: 12,
      comboMax: 1, comboHold: 0, manager: 0, goldMul: 1 };
    [...CLICK_UPG, ...GLOBAL_UPG].forEach(u => { if (s.u.includes(u.id)) u.f(m); });
    BUILDINGS.forEach(b => { const n = s.b[b.id] || 0; m['mul_' + b.id] = Math.pow(2, Math.floor(n / 25)); });
    m.starMul = 1 + s.stars * 0.05;
    m.allMul *= 1 + (s.permInc || 0) * 0.2;                 // постоянные бонусы из магазина
    m.clickMul *= 1 + (s.permClick || 0) * 0.5;
    m.comboCap = 1 + Math.min(4, m.comboMax);               // ×2 базово, с улучшениями до ×5
    return m;
  }
  const shopBoost = s => (s.boostUntil && Date.now() < s.boostUntil) ? (s.boostMul || 1) : 1;
  function cps(s, boostMul) {
    const m = mods(s);
    return BUILDINGS.reduce((a, b) => a + (s.b[b.id] || 0) * b.cps * (m['mul_' + b.id] || 1), 0) * m.allMul * m.starMul * (boostMul || 1) * shopBoost(s);
  }
  function clickValue(s, boostMul) { const m = mods(s); return ((1 + m.clickAdd) * m.clickMul * m.starMul * m.allMul * (boostMul || 1) * shopBoost(s)) + cps(s, boostMul) * m.clickCps; }
  const price = (b, n) => Math.ceil(b.base * Math.pow(1.15, n));
  const SUF = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
  function fmt(n) {
    if (!isFinite(n)) return '∞';
    if (n < 1000) return (Math.round(n * 10) / 10).toString().replace('.0', '');
    let i = 0; while (n >= 1000 && i < SUF.length - 1) { n /= 1000; i++; }
    return (n >= 100 ? n.toFixed(0) : n.toFixed(1)) + SUF[i];
  }
  const KEY = 'chmogame.v1';
  function readAll() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
  let S = (function () {
    const all = readAll(); const g = (all.games || {});
    let s = g.clicker2 || null;
    if (!s) { const old = g.clicker; s = Object.assign({}, DEF, { bank: old ? old.bank || 0 : 0, total: old ? old.total || 0 : 0 }); }
    s = Object.assign({}, DEF, s); s.b = s.b || {}; s.u = s.u || []; s.ach = s.ach || [];
    return s;
  })();
  function save() {
    S.last = Date.now();
    try { const all = readAll(); all.games = all.games || {}; all.games.clicker2 = S; localStorage.setItem(KEY, JSON.stringify(all)); } catch (e) {}
  }
  /* начисление за прошедшее реальное время: работает и в фоне, и в других играх */
  function settle(silent) {
    const now = Date.now(); const m = mods(S);
    const secs = Math.min((now - (S.last || now)) / 1000, m.offlineH * 3600);
    S.last = now;
    if (secs < 1) return 0;
    const earn = cps(S) * secs * m.offlineMul;
    if (earn > 0) { S.bank += earn; S.total += earn; S.idle = (S.idle || 0) + earn; save(); }
    return earn;
  }
  function reset(keep) { S = Object.assign({}, DEF, keep || {}, { b: {}, u: [], last: Date.now() }); save(); return S; }
  /* фоновая работа: пересчитываем при возврате в приложение и периодически */
  document.addEventListener('visibilitychange', () => { if (!document.hidden) settle(); else save(); });
  window.addEventListener('focus', () => settle());
  window.addEventListener('pagehide', save); window.addEventListener('blur', save);
  document.addEventListener('resume', () => settle()); document.addEventListener('pause', save);
  setInterval(() => settle(), 15000);
  return { get S() { return S; }, set S(v) { S = v; }, BUILDINGS, CLICK_UPG, GLOBAL_UPG, ACHIEVEMENTS, DEF, tot, mods, cps, clickValue, price, fmt, save, settle, reset, shopBoost };
})();

Games.register({
  id: 'clicker', title: 'Монетный кликер', icon: '💰', cat: 'arcade', desc: 'Тапай, строй империю: доход идёт в фоне, 12 источников, улучшения, престиж, достижения', bestLabel: 'Всего заработано',
  mount(screen, api) {
    const { h } = api;

    /* ===== данные ===== */
    const { BUILDINGS, CLICK_UPG, GLOBAL_UPG, ACHIEVEMENTS, tot, mods, cps, clickValue, price, fmt, settle, DEF, shopBoost } = window.ClickerCore;
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
    }

    let S = window.ClickerCore.S;
    /* ===== боевые переменные ===== */
    let boost = { mul: 1, left: 0 }, golden = null, goldT = 30 + Math.random() * 40, pops = [], tab = 'build', timer, coinEl, bankEl, cpsEl, tabsEl, listEl, statsEl, shakeT = 0, lastClickAt = 0;

    /* доход, накопленный ядром, пока игра была закрыта или приложение свёрнуто */
    (function idleReport() {
      window.ClickerCore.settle();
      const got = S.idle || 0; S.idle = 0; window.ClickerCore.save();
      if (got > 1) setTimeout(() => api.modal({ title: '💤 Работа в фоне', text: `Империя заработала ${fmt(got)} монет, пока вы были в других играх или приложение было свёрнуто.`, buttons: [{ label: 'Забрать', cls: 'primary' }] }), 400);
    })();

    const save = () => window.ClickerCore.save();
    const starsFor = s => Math.floor(Math.pow((s.total + s.spent) / 1e6, 0.5));
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
        S = window.ClickerCore.reset({ stars, ach, clicks, crits, golds, exchanged: exch });
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
      bankEl = h('b', null, fmt(S.bank)); cpsEl = h('b', null, fmt(cps(S, boost.mul)) + '/с');
      api.header(screen, [{ label: '', value: '' }, { label: '', value: '' }, { btn: '⭐ ' + S.stars, cls: 'gold', onClick: prestige }]);
      const top = screen.querySelector('.game-top'); top.innerHTML = '';
      top.append(h('div', { class: 'stat' }, '💰 ', bankEl), h('div', { class: 'stat' }, '⚡ ', cpsEl), h('button', { class: 'btn small gold', onclick: prestige }, '⭐ ' + S.stars));

      const area = h('div', { class: 'game-area', style: 'justify-content:flex-start;gap:6px;overflow:hidden' });
      // монета
      coinEl = h('div', { class: 'clk-coin', onpointerdown: e => { e.preventDefault(); doClick(e); } }, SKINS[S.skin] || '🪙');
      const clickInfo = h('div', { class: 'hint-text clk-click-info' }, 'За тап: ' + fmt(clickValue(S, boost.mul)) + (m.crit > 0 ? ' · крит ' + Math.round(m.crit * 100) + '% ×' + (1 + m.critMul) : ''));
      const boostBar = h('div', { class: 'hint-text clk-boost', style: 'color:var(--gold);min-height:16px' }, boost.left > 0 ? '🔥 Буст ×' + boost.mul + ' — ' + Math.ceil(boost.left) + ' с' : '');
      area.append(h('div', { class: 'clk-stage' }, coinEl), clickInfo, boostBar);

      // вкладки
      tabsEl = h('div', { class: 'clk-tabs' }, [['build', '🏗'], ['upg', '⬆️'], ['shop', '🛒'], ['miss', '🎯'], ['ach', '🏅'], ['stat', '📊']].map(([k, n]) =>
        h('button', { class: 'btn small ' + (tab === k ? 'primary' : ''), onclick: () => { tab = k; api.sound('tap'); render(); } }, n)));
      listEl = h('div', { class: 'clk-list' });
      area.append(tabsEl, listEl);
      screen.append(area);
      fillList();
    }
    function refresh() {
      if (bankEl) bankEl.textContent = fmt(S.bank);
      if (cpsEl) cpsEl.textContent = fmt(cps(S, boost.mul)) + '/с';
      const ci = screen.querySelector('.clk-click-info'); if (ci) { const m = mods(S); ci.textContent = 'За тап: ' + fmt(clickValue(S, boost.mul) * combo) + (combo > 1.05 ? ' · комбо ×' + combo.toFixed(1) : '') + ' · крит ' + Math.round(m.crit * 100) + '%'; }
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
      } else if (tab === 'shop') {
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
      } else if (tab === 'ach') {
        ACHIEVEMENTS.forEach(a2 => listEl.append(h('div', { class: 'clk-item' + (S.ach.includes(a2.id) ? ' done' : '') },
          h('div', { class: 'clk-ic' }, S.ach.includes(a2.id) ? '🏅' : '🔒'),
          h('div', { style: 'flex:1;min-width:0' }, h('b', null, a2.nm), h('div', { class: 'clk-d' }, a2.d)),
          h('div', { class: 'clk-price', style: 'color:var(--gold)' }, '+' + a2.r))));
      } else {
        const m2 = mods(S);
        const rows = [['Монет сейчас', fmt(S.bank)], ['Заработано всего', fmt(S.total)], ['Потрачено', fmt(S.spent)], ['Доход в секунду', fmt(cps(S))], ['Сила тапа', fmt(clickValue(S))], ['Тапов сделано', S.clicks], ['Критов поймано', S.crits], ['Золотых монет', S.golds], ['Зданий построено', tot(S)], ['Улучшений куплено', S.u.length + ' / ' + (CLICK_UPG.length + GLOBAL_UPG.length)], ['Наград получено', S.ach.length + ' / ' + ACHIEVEMENTS.length], ['Звёзд престижа', S.stars + ' (+' + Math.round(S.stars * 5) + '% дохода)'], ['Следующая звезда', fmt(Math.pow(S.stars + 1, 2) * 1e6) + ' всего'], ['Фоновый доход', m2.offlineH + ' ч · 100%'], ['Комбо максимум', '×' + (S.maxCombo || 1).toFixed(1)], ['Покупок в магазине', S.shopBuys || 0], ['Миссий выполнено', S.missionsDone || 0], ['Скинов открыто', (S.skins || []).length], ['Постоянные бонусы', '+' + ((S.permInc || 0) * 20) + '% доход, +' + ((S.permClick || 0) * 50) + '% тап']];
        rows.forEach(([k, v]) => listEl.append(h('div', { class: 'clk-row' }, h('span', null, k), h('b', null, String(v)))));
        listEl.append(h('button', { class: 'btn', style: 'width:100%;margin-top:8px', onclick: () => api.modal({ title: 'Сбросить кликер?', text: 'Полный сброс: монеты, здания, улучшения, звёзды и награды.', buttons: [{ label: 'Отмена' }, { label: 'Сбросить', cls: 'primary', onClick: () => { S = window.ClickerCore.reset({ stars: 0, ach: [], clicks: 0, crits: 0, golds: 0, exchanged: 0 }); save(); render(); } }] }) }, 'Сбросить кликер'));
      }
    }
    function doClick(e) {
      const m = mods(S);
      const now = Date.now();
      if (now - (lastClickAt || 0) < 420 + (m.comboHold || 0) * 200) combo = Math.min(m.comboCap, combo + 0.12); else combo = 1;
      lastClickAt = now; comboT = 1.4 + (m.comboHold || 0) * 0.6;
      if (combo > (S.maxCombo || 1)) S.maxCombo = combo;
      let v = clickValue(S, boost.mul) * combo; let crit = false;
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
        const gm = mods(S).goldMul || 1;
        if (kind < 0.5) { boost = { mul: 7 * gm, left: 45 }; api.toast('🔥 Золотая монета: доход ×' + (7 * gm) + ' на 45 с'); }
        else if (kind < 0.8) { const bonus = (cps(S, 1) * 900 + clickValue(S, 1) * 50) * gm; S.bank += bonus; S.total += bonus; api.toast('💰 Золотая монета: +' + fmt(bonus)); }
        else { boost = { mul: 77, left: 12 }; api.toast('⚡ ЯРОСТЬ: доход ×77 на 12 с'); }
        S.golds = S.golds; checkMissions();
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
    let acc = 0, uiAcc = 0, last = Date.now();
    timer = setInterval(() => {
      const now = Date.now(); const dt = Math.min(2, (now - last) / 1000); last = now; S.last = now;
      const inc = cps(S, boost.mul) * dt; if (inc > 0) { S.bank += inc; S.total += inc; }
      if (boost.left > 0) { boost.left -= dt; if (boost.left <= 0) boost = { mul: 1, left: 0 }; }
      goldT -= dt; if (goldT <= 0 && !goldEl) spawnGold();
      if (goldEl) { goldTimer -= dt; if (goldTimer <= 0) removeGold(); }
      drawPops(dt);
      uiAcc += dt; acc += dt;
      if (uiAcc > 0.1) { uiAcc = 0; if (bankEl) bankEl.textContent = fmt(S.bank); if (cpsEl) cpsEl.textContent = fmt(cps(S, boost.mul)) + '/с';
        const bb = screen.querySelector('.clk-boost');
        if (bb) { const sb = shopBoost(S); bb.textContent = boost.left > 0 ? '🔥 Буст ×' + boost.mul + ' — ' + Math.ceil(boost.left) + ' с' : sb > 1 ? '⚡ Ускоритель ×' + sb + ' — ' + Math.ceil((S.boostUntil - Date.now()) / 60000) + ' мин' : combo > 1.05 ? '🥁 Комбо ×' + combo.toFixed(1) : ''; }
        const ci2 = screen.querySelector('.clk-click-info'); if (ci2 && combo > 1.05) ci2.textContent = 'За тап: ' + fmt(clickValue(S, boost.mul) * combo) + ' · комбо ×' + combo.toFixed(1);
      }
      // комбо затухает
      if (comboT > 0) { comboT -= dt; if (comboT <= 0) combo = 1; }
      // автокликер из магазина
      if (S.autoUntil && Date.now() < S.autoUntil) { autoT += dt; while (autoT > 0.1) { autoT -= 0.1; const v = clickValue(S, boost.mul); S.bank += v; S.total += v; S.clicks++; } }
      // менеджер: сам покупает здания
      const mg = mods(S).manager || 0;
      if (mg > 0) { mgrT += dt; if (mgrT > (mg > 1 ? 2.5 : 5)) { mgrT = 0; const aff = BUILDINGS.filter(b => S.bank >= price(b, S.b[b.id] || 0)); if (aff.length) { const pick = mg > 1 ? aff[aff.length - 1] : aff[0]; buy(pick, 1); } } }
      // отложенные золотые монеты из магазина
      if (pendingGolds > 0 && !goldEl) { pendingGolds--; spawnGold(); }
      if (acc > 3) { acc = 0; checkAch(); checkMissions(); save(); if (tab !== 'stat') fillList(); }
    }, 50);

    this.unmount = () => { clearInterval(timer); save(); layer.remove(); };
    render(); checkAch(); checkMissions();
  }
});
