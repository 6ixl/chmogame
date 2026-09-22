/* Чмога — ядро: сохранения, монеты, звук, вибрация, навигация, реестр игр */
(function () {
  const LS_KEY = 'chmogame.v1';
  const defaults = { coins: 100, sound: true, vibro: true, games: {}, best: {}, daily: null, totalPlays: 0 };
  let state;
  try { state = Object.assign({}, defaults, JSON.parse(localStorage.getItem(LS_KEY) || '{}')); }
  catch (e) { state = Object.assign({}, defaults); }

  function save() { try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {} }

  /* ---------- sound (synth, no files) ---------- */
  let ctx = null;
  function ac() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, dur, type, gain, when) {
    const c = ac(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    const t = c.currentTime + (when || 0);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain || 0.15, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.02);
  }
  const SOUNDS = {
    tap: () => tone(600, 0.06, 'square', 0.05),
    select: () => tone(440, 0.05, 'triangle', 0.08),
    coin: () => { tone(1200, 0.08, 'square', 0.08); tone(1800, 0.12, 'square', 0.08, 0.07); },
    good: () => { tone(523, 0.1, 'triangle', 0.12); tone(659, 0.1, 'triangle', 0.12, 0.1); tone(784, 0.18, 'triangle', 0.12, 0.2); },
    win: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', 0.14, i * 0.12)); },
    bad: () => { tone(220, 0.15, 'sawtooth', 0.08); tone(160, 0.25, 'sawtooth', 0.08, 0.12); },
    lose: () => { [392, 330, 262, 196].forEach((f, i) => tone(f, 0.25, 'sawtooth', 0.08, i * 0.15)); },
    jump: () => { const c = ac(); if (!c) return; const o = c.createOscillator(), g = c.createGain(); o.type = 'square'; o.frequency.setValueAtTime(300, c.currentTime); o.frequency.exponentialRampToValueAtTime(700, c.currentTime + 0.1); g.gain.setValueAtTime(0.06, c.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.15); o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + 0.16); },
    boom: () => { const c = ac(); if (!c) return; const b = c.createBuffer(1, c.sampleRate * 0.3, c.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length); const s = c.createBufferSource(); s.buffer = b; const g = c.createGain(); g.gain.value = 0.2; s.connect(g).connect(c.destination); s.start(); }
  };
  function sound(name) { if (state.sound && SOUNDS[name]) { try { SOUNDS[name](); } catch (e) {} } }
  function vibrate(ms) { if (state.vibro && navigator.vibrate) { try { navigator.vibrate(ms || 15); } catch (e) {} } }
  document.addEventListener('pointerdown', () => { if (state.sound) ac(); }, { once: true });

  /* ---------- UI helpers ---------- */
  const $ = (s, r) => (r || document).querySelector(s);
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === 'class') el.className = attrs[k];
      else if (k === 'style') el.style.cssText = attrs[k];
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), attrs[k]);
      else if (k === 'html') el.innerHTML = attrs[k];
      else if (attrs[k] != null && attrs[k] !== false) el.setAttribute(k, attrs[k]);
    }
    for (const k of kids.flat()) if (k != null) el.append(k.nodeType ? k : document.createTextNode(String(k)));
    return el;
  }
  let toastT;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 1600);
  }
  function modal(opts) {
    const root = $('#modal-root'); root.innerHTML = '';
    const box = h('div', { class: 'modal' });
    if (opts.title) box.append(h('h2', null, opts.title));
    if (opts.reward) box.append(h('div', { class: 'reward' }, '+' + opts.reward + ' ●'));
    if (opts.text) box.append(h('p', null, opts.text));
    if (opts.body) box.append(opts.body);
    const row = h('div', { class: 'row' });
    (opts.buttons || [{ label: 'ОК' }]).forEach(b => {
      row.append(h('button', { class: 'btn ' + (b.cls || ''), onclick: () => { sound('tap'); root.innerHTML = ''; b.onClick && b.onClick(); } }, b.label));
    });
    box.append(row); root.append(box);
    return { close: () => { root.innerHTML = ''; } };
  }

  /* ---------- coins & progress ---------- */
  function setCoins(n) { state.coins = Math.max(0, Math.round(n)); $('#coin-count').textContent = state.coins; save(); }
  function addCoins(n) { if (n > 0) { sound('coin'); } setCoins(state.coins + n); if (n > 0) toast('+' + n + ' монет'); }
  function spend(n) { if (state.coins < n) { toast('Не хватает монет'); sound('bad'); return false; } setCoins(state.coins - n); return true; }
  function best(id, score, lowerIsBetter) {
    const cur = state.best[id];
    const isNew = cur == null || (lowerIsBetter ? score < cur : score > cur);
    if (isNew) { state.best[id] = score; save(); }
    return isNew;
  }

  /* ---------- game registry & router ---------- */
  const games = [];
  let current = null;
  const api = {
    h, $, toast, modal, sound, vibrate, addCoins, spend, best,
    get coins() { return state.coins; },
    bestOf: id => state.best[id],
    load: (id, def) => (state.games[id] != null ? state.games[id] : def),
    store: (id, data) => { state.games[id] = data; save(); },
    exit: () => showHub(),
    rand: (a, b) => a + Math.floor(Math.random() * (b - a + 1)),
    shuffle: arr => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; },
    /* шапка игры: [{label,value}|{btn,onClick,cls}] → {set(i,v), els} */
    header: (screen, items) => {
      const els = []; const bar = h('div', { class: 'game-top' });
      items.forEach(it => {
        if (it.btn != null) { const b = h('button', { class: 'btn small ' + (it.cls || ''), onclick: it.onClick }, it.btn); bar.append(b); els.push(b); }
        else { const v = h('b', null, it.value != null ? it.value : ''); bar.append(h('div', { class: 'stat' }, it.label ? it.label + ' ' : '', v)); els.push(v); }
      });
      screen.append(bar);
      return { set: (i, v) => { els[i].textContent = v; }, els };
    },
    /* финальное окно: победа/поражение с наградой */
    end: (opts) => {
      if (opts.reward) addCoins(opts.reward);
      sound(opts.win === false ? 'lose' : 'win'); vibrate(opts.win === false ? [60, 40, 120] : [30, 50, 30, 50, 60]);
      modal({ title: opts.title, reward: opts.reward, text: opts.text, buttons: [{ label: 'В меню', onClick: () => showHub() }, { label: opts.again || 'Ещё', cls: 'primary', onClick: opts.onAgain }] });
    },
    /* уровневый прогресс: {lvl, done()} */
    level: (id) => {
      const st = state.games[id + '_lvl'] || 0;
      return { get lvl() { return state.games[id + '_lvl'] || 0; }, done: () => { state.games[id + '_lvl'] = (state.games[id + '_lvl'] || 0) + 1; save(); } };
    },
    /* экранная русская клавиатура; onKey получает букву, '⏎' или '⌫' */
    keyboard: (onKey, opts) => {
      const kb = h('div', { class: 'kb' }); const rows = ['йцукенгшщзхъ', 'фывапролджэ', (opts && opts.plain ? '' : '⏎') + 'ячсмитьбю' + (opts && opts.plain ? '' : '⌫')];
      for (const line of rows) {
        const kr = h('div', { class: 'kb-row' });
        for (const k of line) kr.append(h('div', { class: 'key ' + (k === '⏎' || k === '⌫' ? 'wide' : ''), 'data-k': k, onpointerdown: e => { e.preventDefault(); sound('tap'); vibrate(6); onKey(k); } }, k));
        kb.append(kr);
      }
      kb.mark = (k, cls) => { const el = kb.querySelector(`[data-k="${k}"]`); if (el) el.className = 'key ' + cls; };
      return kb;
    },
    /* каркас canvas-игры: шапка, холст, игровой цикл. Возвращает {hdr, cv, ctx, stop, pos(e)} */
    arcade: (screen, o) => {
      screen.innerHTML = '';
      const hdr = api.header(screen, o.stats || []);
      const area = h('div', { class: 'game-area' }); screen.append(area);
      if (o.hint) screen.append(h('div', { class: 'hint-text' }, o.hint));
      const cv = h2canvas(area, o.w, o.h); const ctx = cv.ctx;
      let raf, last = 0, running = true;
      const loop = t => { if (!running) return; raf = requestAnimationFrame(loop); const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t; o.frame(dt, ctx); };
      const pos = e => { const r = cv.canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) * o.w / r.width, y: (e.clientY - r.top) * o.h / r.height }; };
      if (o.onDown) cv.canvas.addEventListener('pointerdown', e => o.onDown(pos(e), e));
      if (o.onMove) cv.canvas.addEventListener('pointermove', e => o.onMove(pos(e), e));
      if (o.onUp) { cv.canvas.addEventListener('pointerup', e => o.onUp(pos(e), e)); cv.canvas.addEventListener('pointercancel', e => o.onUp(pos(e), e)); }
      if (o.onKey) window.addEventListener('keydown', o.onKey);
      raf = requestAnimationFrame(loop);
      return { hdr, cv, ctx, pos, stop: () => { running = false; cancelAnimationFrame(raf); cv.destroy(); if (o.onKey) window.removeEventListener('keydown', o.onKey); } };
    },
    /* выбор сложности бота при запуске: cb(0|1|2). Запоминает последний выбор */
    difficulty: (id, cb) => {
      const last = state.games[id + '_diff'];
      const body = h('div', { class: 'row', style: 'flex-direction:column' }, [['😊 Лёгкий', 'бот поддаётся — легко выиграть'], ['🙂 Средний', 'придётся играть нормально'], ['😈 Сложный', 'бот играет в полную силу']].map(([n, d], i) => h('button', { class: 'btn ' + (i === (last == null ? 1 : last) ? 'primary' : ''), style: 'width:100%;flex-direction:column;gap:2px', onclick: () => { state.games[id + '_diff'] = i; save(); m.close(); sound('tap'); cb(i); } }, h('b', null, n), h('span', { style: 'font-size:11px;opacity:.75' }, d))));
      const m = modal({ title: 'Сложность', body, buttons: [{ label: 'В меню', onClick: () => showHub() }] });
    },
    swipe: (el, fn) => {
      let sx, sy; el.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; });
      el.addEventListener('pointerup', e => { if (sx == null) return; const dx = e.clientX - sx, dy = e.clientY - sy; sx = null; if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) { fn('tap', e); return; } fn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'd' : 'u'), e); });
    },
    /* fits a canvas into the given container keeping aspect ratio; returns {canvas, ctx, w, h, scale} */
    canvas: (container, w, h) => {
      const c = h2canvas(container, w, h); return c;
    }
  };
  function h2canvas(container, w, hh) {
    const cv = h('canvas', { class: 'game-canvas' });
    container.append(cv);
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    function fit() {
      const cw = container.clientWidth, ch = container.clientHeight;
      const s = Math.min(cw / w, ch / hh);
      cv.style.width = Math.floor(w * s) + 'px'; cv.style.height = Math.floor(hh * s) + 'px';
      cv.width = Math.floor(w * dpr); cv.height = Math.floor(hh * dpr);
      const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    fit();
    const ro = new ResizeObserver(fit); ro.observe(container);
    return { canvas: cv, ctx: cv.getContext('2d'), w, h: hh, destroy: () => ro.disconnect() };
  }

  function register(def) { games.push(def); }

  function setTitle(t) { $('#title').textContent = t; }
  function openGame(def) {
    closeCurrent();
    const screen = $('#screen'); screen.innerHTML = ''; screen.className = 'game'; screen.scrollTop = 0;
    $('#btn-back').classList.remove('hidden');
    setTitle(def.title);
    state.totalPlays++; save();
    current = def;
    try { def.mount(screen, api); } catch (e) { console.error(e); toast('Ошибка: ' + e.message); }
  }
  function closeCurrent() {
    if (current && current.unmount) { try { current.unmount(); } catch (e) {} }
    current = null; $('#modal-root').innerHTML = '';
  }
  function showHub() {
    closeCurrent();
    const screen = $('#screen'); screen.innerHTML = ''; screen.className = '';
    $('#btn-back').classList.add('hidden');
    setTitle('Чмога');
    window.renderHub(screen, api, games);
  }
  function showSettings() {
    closeCurrent();
    const screen = $('#screen'); screen.innerHTML = ''; screen.className = '';
    $('#btn-back').classList.remove('hidden');
    setTitle('Настройки');
    const tg = (label, key) => {
      const t = h('div', { class: 'toggle ' + (state[key] ? 'on' : '') });
      return h('div', { class: 'setting', onclick: () => { state[key] = !state[key]; t.classList.toggle('on', state[key]); save(); sound('tap'); vibrate(20); } }, h('span', null, label), t);
    };
    screen.append(
      tg('Звуки', 'sound'), tg('Вибрация', 'vibro'),
      h('div', { class: 'setting' }, h('span', null, 'Монеты'), h('b', null, state.coins + ' ●')),
      h('div', { class: 'setting' }, h('span', null, 'Игр сыграно'), h('b', null, state.totalPlays)),
      h('div', { class: 'section-title' }, 'Обновления'),
      h('div', { class: 'setting' }, h('span', null, 'Версия'), h('b', null, 'v' + APP.version)),
      h('button', { class: 'btn primary', style: 'width:100%;margin-bottom:10px', onclick: () => checkUpdate(true) }, '🔄 Проверить обновления'),
      h('div', { class: 'section-title' }, 'Резервная копия'),
      h('div', { class: 'hint-text', style: 'text-align:left;padding:0 4px 8px' }, 'При обновлении приложения прогресс сохраняется автоматически. Копия нужна только при смене телефона или переустановке.'),
      h('button', { class: 'btn', style: 'width:100%;margin-bottom:10px', onclick: exportBackup }, '📤 Скопировать код бэкапа'),
      h('button', { class: 'btn', style: 'width:100%;margin-bottom:10px', onclick: importBackup }, '📥 Вставить код бэкапа'),
      h('div', { class: 'section-title' }, 'Опасная зона'),
      h('button', { class: 'btn', style: 'width:100%', onclick: () => modal({ title: 'Сбросить прогресс?', text: 'Все уровни, рекорды и монеты будут удалены.', buttons: [{ label: 'Отмена' }, { label: 'Сбросить', cls: 'primary', onClick: () => { state = Object.assign({}, defaults, { games: {}, best: {} }); save(); setCoins(state.coins); showHub(); } }] }) }, 'Сбросить прогресс'),
      h('div', { class: 'hint-text', style: 'margin-top:20px' }, 'Чмога · офлайн-сборник игр · v' + APP.version)
    );
  }

  /* ---------- резервная копия (текстовый код, через буфер обмена) ---------- */
  function exportBackup() {
    const code = 'CHMO1:' + btoa(unescape(encodeURIComponent(JSON.stringify(state))));
    const done = () => modal({ title: 'Код скопирован', text: 'Сохраните его в заметки или отправьте себе в мессенджер. Длина: ' + code.length + ' символов.' });
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(done, () => showCode(code));
    else showCode(code);
  }
  function showCode(code) {
    const ta = h('textarea', { style: 'width:100%;height:120px;font-size:11px;background:var(--bg2);color:var(--text);border:0;border-radius:10px;padding:8px' }); ta.value = code; ta.readOnly = true;
    modal({ title: 'Код бэкапа', body: ta, text: 'Выделите и скопируйте текст' });
  }
  function importBackup() {
    const ta = h('textarea', { placeholder: 'Вставьте код, начинающийся с CHMO1:', style: 'width:100%;height:120px;font-size:11px;background:var(--bg2);color:var(--text);border:0;border-radius:10px;padding:8px' });
    modal({ title: 'Восстановить из кода', body: ta, buttons: [{ label: 'Отмена' }, { label: 'Восстановить', cls: 'primary', onClick: () => {
      try {
        const raw = ta.value.trim(); if (!raw.startsWith('CHMO1:')) throw new Error('Неверный формат');
        const data = JSON.parse(decodeURIComponent(escape(atob(raw.slice(6)))));
        if (typeof data.coins !== 'number' || !data.games) throw new Error('Повреждённые данные');
        state = Object.assign({}, defaults, data); save(); setCoins(state.coins); toast('Прогресс восстановлен'); sound('win'); showHub();
      } catch (e) { modal({ title: 'Не удалось', text: e.message }); }
    } }] });
  }

  /* ---------- проверка обновлений через GitHub Releases ---------- */
  const updater = () => (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Updater) || null;
  /* скачивание APK внутри приложения + запуск установщика */
  async function runUpdate(url, tag) {
    const U = updater();
    if (!U) { const a = h('a', { href: url, target: '_blank' }); document.body.append(a); a.click(); a.remove(); return; }
    try {
      const can = await U.canInstall();
      if (!can.value) {
        modal({ title: 'Нужно разрешение', text: 'Android требует разрешить этому приложению установку обновлений. Откройте настройки и включите переключатель, затем вернитесь и нажмите «Обновить» снова.',
          buttons: [{ label: 'Отмена' }, { label: 'Открыть настройки', cls: 'primary', onClick: () => U.openInstallSettings() }] });
        return;
      }
    } catch (e) {}
    // окно прогресса
    const barFill = h('div', { style: 'height:100%;width:0;background:linear-gradient(90deg,var(--accent),var(--accent2));transition:width .15s' });
    const bar = h('div', { style: 'height:14px;background:var(--bg2);border-radius:7px;overflow:hidden;margin:6px 0' }, barFill);
    const label = h('div', { class: 'hint-text' }, 'Подготовка…');
    const root = $('#modal-root'); root.innerHTML = '';
    const box = h('div', { class: 'modal' }, h('h2', null, 'Обновление ' + tag.replace(/^v/, '')), bar, label);
    root.append(box);
    let sub;
    try {
      sub = await U.addListener('progress', ev => {
        const pct = ev.total > 0 ? Math.round(ev.loaded / ev.total * 100) : 0;
        barFill.style.width = (ev.total > 0 ? pct : 50) + '%';
        label.textContent = (ev.loaded / 1048576).toFixed(1) + ' МБ' + (ev.total > 0 ? ' из ' + (ev.total / 1048576).toFixed(1) + ' МБ · ' + pct + '%' : '');
      });
      await U.download({ url });
      barFill.style.width = '100%'; label.textContent = 'Загружено. Открываю установщик…'; sound('good');
      await U.install();
      setTimeout(() => { root.innerHTML = ''; toast('Подтвердите установку'); }, 1200);
    } catch (e) {
      root.innerHTML = '';
      modal({ title: 'Не удалось обновить', text: (e && e.message) || 'Ошибка загрузки', buttons: [{ label: 'Отмена' }, { label: 'Открыть в браузере', cls: 'primary', onClick: () => { const a = h('a', { href: url, target: '_blank' }); document.body.append(a); a.click(); a.remove(); } }] });
    } finally { if (sub && sub.remove) sub.remove(); }
  }

  const cmpVer = (a, b) => { const pa = String(a).replace(/^v/, '').split('.').map(Number), pb = String(b).replace(/^v/, '').split('.').map(Number); for (let i = 0; i < Math.max(pa.length, pb.length); i++) { const d = (pa[i] || 0) - (pb[i] || 0); if (d) return d; } return 0; };
  async function checkUpdate(manual) {
    if (!APP.repo) { if (manual) modal({ title: 'Обновления', text: 'Репозиторий не настроен в этой сборке.' }); return; }
    if (!navigator.onLine) { if (manual) toast('Нет интернета'); return; }
    if (manual) toast('Проверяю…');
    try {
      const r = await fetch('https://api.github.com/repos/' + APP.repo + '/releases/latest', { headers: { Accept: 'application/vnd.github+json' }, cache: 'no-store' });
      if (!r.ok) throw new Error('GitHub ответил ' + r.status);
      const rel = await r.json(); const tag = rel.tag_name || ''; const apk = (rel.assets || []).find(a => /\.apk$/i.test(a.name));
      state.lastUpdateCheck = Date.now(); save();
      if (cmpVer(tag, APP.version) > 0 && apk) {
        const notes = (rel.body || '').split(String.fromCharCode(10)).slice(0, 8).join(' ');
        const mb = (apk.size / 1048576).toFixed(1);
        modal({ title: 'Доступна версия ' + tag.replace(/^v/, ''), text: (notes || 'Новое обновление.') + ' — размер ' + mb + ' МБ. Прогресс сохранится.',
          buttons: [{ label: 'Позже' }, { label: 'Обновить', cls: 'primary', onClick: () => runUpdate(apk.browser_download_url, tag) }] });
      } else if (manual) modal({ title: 'Обновлений нет', text: 'У вас последняя версия v' + APP.version + '.' });
    } catch (e) { if (manual) modal({ title: 'Не удалось проверить', text: e.message }); }
  }
  // автоматическая проверка раз в сутки при запуске
  setTimeout(() => { if (Date.now() - (state.lastUpdateCheck || 0) > 24 * 3600 * 1000) checkUpdate(false); }, 2500);

  $('#btn-back').addEventListener('click', () => { sound('tap'); showHub(); });
  $('#btn-settings').addEventListener('click', () => { sound('tap'); showSettings(); });
  document.addEventListener('backbutton', () => showHub());
  window.addEventListener('popstate', () => { if (current) { showHub(); history.pushState(null, ''); } });
  history.pushState(null, '');

  window.Games = { register, open: openGame, list: games, api, state: () => state, showHub };
  window.addEventListener('DOMContentLoaded', () => { setCoins(state.coins); showHub(); });
})();
