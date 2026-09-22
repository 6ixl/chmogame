/* Словесные игры, часть 3 */
(function () {
  const D = window.DICT; const ALL = new Set(D.all);
  const pick = (min, max) => { const pool = D.fil.concat(D.five).filter(w => w.length >= min && w.length <= max); return pool[Math.floor(Math.random() * pool.length)]; };
  const pickAll = (min, max) => { const pool = D.all.filter(w => w.length >= min && w.length <= max); return pool[Math.floor(Math.random() * pool.length)]; };
  const box = (h, word, cls, size) => h('div', { class: 'wd-row', style: 'justify-content:center;flex-wrap:wrap' }, word.split('').map(c => h('div', { class: 'wd-cell ' + (cls || ''), style: `width:${size || 44}px;height:${size || 44}px;font-size:${Math.round((size || 44) / 2)}px` }, c)));
  const timed = (api, screen, secs, onTick, onEnd) => { let t = secs; const id = setInterval(() => { t--; onTick(t); if (t <= 0) { clearInterval(id); onEnd(); } }, 1000); return () => clearInterval(id); };

  /* Наоборот */
  Games.register({ id: 'backwards', title: 'Наоборот', icon: '🔁', cat: 'words', desc: 'Слово показано задом наперёд — напиши правильно', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; let word, cur, score, timeLeft = 60, stop, hdr, curEl;
      function next() { word = pick(4, 4 + Math.min(3, Math.floor(score / 4))); cur = ''; render(); }
      function render() { screen.innerHTML = ''; hdr = api.header(screen, [{ label: 'Счёт', value: score }, { label: '⏱', value: timeLeft }]); curEl = h('div', { class: 'wow-current' }, cur); screen.append(h('div', { class: 'game-area', style: 'gap:20px' }, box(h, word.split('').reverse().join(''), 'y'), curEl)); screen.append(h('div', { class: 'bottom-bar' }, api.keyboard(k => { if (k === '⌫') cur = cur.slice(0, -1); else if (k === '⏎') check(); else if (cur.length < 10) cur += k; curEl.textContent = cur; if (cur.length === word.length) check(); }))); }
      function check() { if (cur === word) { score++; api.sound('good'); next(); } else { api.sound('bad'); api.vibrate(40); cur = ''; curEl.textContent = ''; } }
      function finish() { api.best('backwards', score); api.end({ title: 'Время вышло', reward: score * 2, text: 'Слов: ' + score, onAgain: start }); }
      function start() { score = 0; timeLeft = 60; if (stop) stop(); stop = timed(api, screen, 60, t => { timeLeft = t; hdr.set(1, t); }, finish); next(); }
      this.unmount = () => stop && stop(); start();
    } });

  /* Гласные */
  Games.register({ id: 'vowels', title: 'Сколько гласных', icon: '🅰', cat: 'words', desc: 'Быстро сосчитай гласные в слове', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; const V = 'аеиоуыэюя'; let word, score, timeLeft, stop, hdr;
      function next() { word = pickAll(5, 9); const n = word.split('').filter(c => V.includes(c)).length; const opts = api.shuffle([...new Set([n, Math.max(1, n - 1), n + 1, n + 2])]).slice(0, 4);
        screen.innerHTML = ''; hdr = api.header(screen, [{ label: 'Счёт', value: score }, { label: '⏱', value: timeLeft }]);
        screen.append(h('div', { class: 'game-area', style: 'gap:30px' }, h('div', { style: 'font-size:34px;font-weight:800;text-transform:uppercase' }, word), h('div', { class: 'row' }, opts.map(o => h('button', { class: 'btn', style: 'width:64px;height:64px;font-size:26px', onclick: () => { if (o === n) { score++; api.sound('good'); } else { api.sound('bad'); api.vibrate(40); } next(); } }, o))))); }
      function start() { score = 0; timeLeft = 45; if (stop) stop(); stop = timed(api, screen, 45, t => { timeLeft = t; hdr.set(1, t); }, () => { api.best('vowels', score); api.end({ title: 'Время вышло', reward: Math.floor(score / 2), text: 'Верно: ' + score, onAgain: start }); }); next(); }
      this.unmount = () => stop && stop(); start();
    } });

  /* Скорость печати */
  Games.register({ id: 'typing', title: 'Скорость печати', icon: '⌨️', cat: 'words', desc: 'Набирай слова на экранной клавиатуре, 45 секунд', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; let word, cur, score, chars, timeLeft, stop, hdr, curEl, wordEl;
      function next() { word = pick(3, 7); cur = ''; wordEl.innerHTML = ''; wordEl.append(box(h, word)); curEl.textContent = ''; }
      function start() {
        score = 0; chars = 0; timeLeft = 45; screen.innerHTML = ''; hdr = api.header(screen, [{ label: 'Слов', value: 0 }, { label: '⏱', value: 45 }, { label: 'Букв', value: 0 }]);
        wordEl = h('div'); curEl = h('div', { class: 'wow-current' }); screen.append(h('div', { class: 'game-area', style: 'gap:20px' }, wordEl, curEl));
        screen.append(h('div', { class: 'bottom-bar' }, api.keyboard(k => { if (k === '⌫') cur = cur.slice(0, -1); else if (k !== '⏎') cur += k; curEl.textContent = cur; if (cur === word) { score++; chars += word.length; hdr.set(0, score); hdr.set(2, chars); api.sound('good'); next(); } else if (!word.startsWith(cur)) { api.sound('bad'); cur = ''; curEl.textContent = ''; } })));
        if (stop) stop(); stop = timed(api, screen, 45, t => hdr.set(1, t), () => { api.best('typing', chars); api.end({ title: chars + ' букв за 45 с', reward: Math.floor(chars / 6), text: 'Слов: ' + score, onAgain: start }); }); next();
      }
      this.unmount = () => stop && stop(); start();
    } });

  /* Цепочка слов */
  Games.register({ id: 'wordchain', title: 'Цепочка слов', icon: '⛓', cat: 'words', desc: 'Следующее слово — на последнюю букву предыдущего', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; let chain, used, cur, curEl, listEl, hdr, need;
      const lastLetter = w => { let i = w.length - 1; while (i > 0 && 'ьъы'.includes(w[i])) i--; return w[i]; };
      function start() { used = new Set(); chain = []; const w = pick(4, 7); chain.push(w); used.add(w); need = lastLetter(w); cur = ''; render(); }
      function render() {
        screen.innerHTML = ''; hdr = api.header(screen, [{ label: 'Цепочка', value: chain.length }, { label: 'На букву', value: need.toUpperCase() }, { btn: '💡 15', cls: 'gold', onClick: () => { if (!api.spend(15)) return; const w = D.all.find(x => x[0] === need && !used.has(x) && x.length >= 3); if (w) api.toast('Например: ' + w.toUpperCase()); } }]);
        listEl = h('div', { class: 'fil-words' }, chain.slice(-8).map((w, i) => h('span', { class: 'fil-word', style: (chain.length - 8 + i) % 2 === 0 || (chain.length <= 8 && i % 2 === 0) ? '' : 'background:var(--card2)' }, w)));
        curEl = h('div', { class: 'wow-current' }, cur);
        screen.append(h('div', { class: 'game-area', style: 'justify-content:flex-start;gap:12px;overflow:auto' }, h('div', { class: 'hint-text' }, 'Вы и компьютер по очереди. Слово должно начинаться на ' + need.toUpperCase()), listEl, curEl));
        screen.append(h('div', { class: 'bottom-bar' }, api.keyboard(k => { if (k === '⌫') cur = cur.slice(0, -1); else if (k === '⏎') submit(); else if (cur.length < 12) cur += k; curEl.textContent = cur; })));
      }
      function submit() {
        const w = cur; cur = '';
        if (w[0] !== need) { api.toast('Нужна буква ' + need.toUpperCase()); api.sound('bad'); curEl.textContent = ''; return; }
        if (used.has(w)) { api.toast('Уже было'); curEl.textContent = ''; return; }
        if (!ALL.has(w)) { api.toast('Нет в словаре'); api.sound('bad'); api.vibrate(40); curEl.textContent = ''; return; }
        chain.push(w); used.add(w); need = lastLetter(w); api.sound('good'); if (chain.length % 6 === 0) api.addCoins(5);
        const ai = D.all.filter(x => x[0] === need && !used.has(x) && x.length >= 3);
        if (!ai.length) { api.best('wordchain', chain.length); api.end({ title: 'Компьютер сдался!', reward: 20, text: 'Цепочка: ' + chain.length, onAgain: start }); return; }
        const a = ai[api.rand(0, Math.min(ai.length - 1, 40))]; chain.push(a); used.add(a); need = lastLetter(a); api.best('wordchain', chain.length); render();
      }
      start();
    } });

  /* Слоги */
  Games.register({ id: 'chunks', title: 'Собери из кусочков', icon: '🧩', cat: 'words', desc: 'Слово разрезано на части — собери его', progress: api => 'Уровень ' + (api.level('chunks').lvl + 1),
    mount(screen, api) {
      const { h } = api; const L = api.level('chunks'); let word, parts, cur;
      function start() {
        word = pick(6, 6 + Math.min(3, Math.floor(L.lvl / 10))); const n = 3 + Math.min(2, Math.floor(L.lvl / 15)); parts = [];
        let rest = word; while (rest.length) { const len = parts.length === n - 1 ? rest.length : Math.max(1, Math.min(rest.length - (n - 1 - parts.length), api.rand(1, 3))); parts.push(rest.slice(0, len)); rest = rest.slice(len); }
        parts = parts.map((p, i) => ({ p, i, used: false })); do { api.shuffle(parts); } while (parts.map(x => x.p).join('') === word); cur = []; render();
      }
      function render() {
        screen.innerHTML = ''; api.header(screen, [{ label: 'Уровень', value: L.lvl + 1 }, { btn: '⌫', onClick: () => { const p = cur.pop(); if (p) { p.used = false; render(); } } }, { btn: '💡 10', cls: 'gold', onClick: () => { if (!api.spend(10)) return; api.toast('Начинается с: ' + word.slice(0, 2).toUpperCase()); } }]);
        screen.append(h('div', { class: 'game-area', style: 'gap:30px' }, h('div', { class: 'wow-current', style: 'font-size:28px' }, cur.map(x => x.p).join('') || '…'),
          h('div', { class: 'row' }, parts.map(x => h('button', { class: 'btn', style: 'font-size:22px;text-transform:uppercase;' + (x.used ? 'opacity:.2' : ''), onclick: () => { if (x.used) return; x.used = true; cur.push(x); api.sound('tap'); if (cur.length === parts.length) check(); else render(); } }, x.p)))));
      }
      function check() { const s = cur.map(x => x.p).join(''); if (s === word) { L.done(); api.end({ title: 'Верно: ' + word.toUpperCase(), reward: 6 + parts.length * 2, again: 'Дальше', onAgain: start }); } else { api.sound('bad'); api.vibrate(40); parts.forEach(x => x.used = false); cur = []; render(); } }
      start();
    } });

  /* Спрятанное слово */
  Games.register({ id: 'hidden', title: 'Спрятанное слово', icon: '🕵️', cat: 'words', desc: 'Найди слово внутри строки букв', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; const A = 'абвгдежзиклмнопрстуфхцчшщыэюя'; let word, str, pos, score, timeLeft, stop, hdr;
      function next() { word = pick(4, 6); const before = api.rand(2, 5), after = api.rand(2, 5); const rnd = n => Array.from({ length: n }, () => A[api.rand(0, A.length - 1)]).join(''); str = rnd(before) + word + rnd(after); pos = before;
        screen.innerHTML = ''; hdr = api.header(screen, [{ label: 'Счёт', value: score }, { label: '⏱', value: timeLeft }, { label: 'Ищем', value: word.toUpperCase() }]);
        screen.append(h('div', { class: 'game-area', style: 'gap:20px' }, h('div', { class: 'hint-text' }, 'Нажми на первую букву слова'), h('div', { class: 'wd-row', style: 'flex-wrap:wrap;justify-content:center' }, str.split('').map((c, i) => h('div', { class: 'wd-cell', style: 'width:38px;height:44px;font-size:20px', onclick: () => { if (i === pos) { score++; api.sound('good'); } else { api.sound('bad'); api.vibrate(40); } next(); } }, c))))); }
      function start() { score = 0; timeLeft = 45; if (stop) stop(); stop = timed(api, screen, 45, t => { timeLeft = t; hdr.set(1, t); }, () => { api.best('hidden', score); api.end({ title: 'Время вышло', reward: score, text: 'Найдено: ' + score, onAgain: start }); }); next(); }
      this.unmount = () => stop && stop(); start();
    } });

  /* По алфавиту */
  Games.register({ id: 'alphabet', title: 'По алфавиту', icon: '🔠', cat: 'words', desc: 'Нажимай слова в алфавитном порядке', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; let words, next, score, round, timeLeft, stop, hdr;
      function gen() { const set = new Set(); while (set.size < 5) set.add(pick(4, 7)); words = api.shuffle([...set]); next = words.slice().sort()[0];
        screen.innerHTML = ''; hdr = api.header(screen, [{ label: 'Счёт', value: score }, { label: '⏱', value: timeLeft }, { label: 'Раунд', value: round }]);
        const els = words.map(w => h('button', { class: 'btn', style: 'width:80%;font-size:20px;text-transform:uppercase', onclick: e => tap(w, e.currentTarget) }, w)); screen.append(h('div', { class: 'game-area', style: 'gap:8px' }, els)); }
      function tap(w, el) { if (el.disabled) return; const sorted = words.slice().sort(); if (w === sorted[0]) { el.disabled = true; el.style.opacity = .2; words.splice(words.indexOf(w), 1); score++; hdr.set(0, score); api.sound('good'); if (!words.length) { round++; gen(); } } else { api.sound('bad'); api.vibrate(40); timeLeft = Math.max(1, timeLeft - 3); hdr.set(1, timeLeft); } }
      function start() { score = 0; round = 1; timeLeft = 60; if (stop) stop(); stop = timed(api, screen, 60, t => { timeLeft = t; hdr.set(1, t); }, () => { api.best('alphabet', score); api.end({ title: 'Время вышло', reward: Math.floor(score / 2), text: 'Слов: ' + score, onAgain: start }); }); gen(); }
      this.unmount = () => stop && stop(); start();
    } });

  /* 4 буквы и 6 букв (варианты Wordle) */
  function wordleVariant(id, title, len, tries) {
    Games.register({ id, title, icon: len === 4 ? '4️⃣' : '6️⃣', cat: 'words', desc: `Угадай слово из ${len} букв за ${tries} попыток`, bestLabel: 'Побед подряд',
      mount(screen, api) {
        const { h } = api; const POOL = D.fil.filter(w => w.length === len); const VALID = new Set(D.all.filter(w => w.length === len)); let answer, rows, cur, done, keyState, rowEls, prog = api.load(id, { streak: 0 });
        function start() { answer = POOL[api.rand(0, POOL.length - 1)]; rows = []; cur = ''; done = false; keyState = {}; render(); }
        function render() {
          screen.innerHTML = ''; api.header(screen, [{ label: 'Серия', value: prog.streak }, { label: 'Попытка', value: Math.min(rows.length + 1, tries) + '/' + tries }]);
          const bx = h('div', { class: 'wd-rows' }); rowEls = []; const cs = len > 5 ? 46 : 56;
          for (let r = 0; r < tries; r++) { const row = h('div', { class: 'wd-row' }); for (let c = 0; c < len; c++) { let ch = '', cls = ''; if (r < rows.length) { ch = rows[r].w[c]; cls = rows[r].m[c]; } else if (r === rows.length) ch = cur[c] || ''; row.append(h('div', { class: 'wd-cell ' + cls, style: `width:${cs}px;height:${cs}px` }, ch)); } bx.append(row); rowEls.push(row); }
          screen.append(h('div', { class: 'game-area' }, bx));
          const kb = api.keyboard(press); Object.keys(keyState).forEach(k => kb.mark(k, keyState[k])); screen.append(h('div', { class: 'bottom-bar' }, kb));
        }
        function press(k) { if (done) return; if (k === '⌫') cur = cur.slice(0, -1); else if (k === '⏎') { submit(); return; } else if (cur.length < len) cur += k; const row = rowEls[rows.length]; if (row) [...row.children].forEach((c, i) => c.textContent = cur[i] || ''); }
        function submit() {
          if (cur.length < len) { api.toast('Нужно ' + len + ' букв'); return; } if (!VALID.has(cur)) { api.toast('Нет такого слова'); api.sound('bad'); return; }
          const m = Array(len).fill('b'); const left = {}; for (let i = 0; i < len; i++) { if (cur[i] === answer[i]) m[i] = 'g'; else left[answer[i]] = (left[answer[i]] || 0) + 1; } for (let i = 0; i < len; i++) if (m[i] !== 'g' && left[cur[i]]) { m[i] = 'y'; left[cur[i]]--; }
          const rank = { g: 3, y: 2, b: 1 }; for (let i = 0; i < len; i++) if ((rank[keyState[cur[i]]] || 0) < rank[m[i]]) keyState[cur[i]] = m[i];
          rows.push({ w: cur, m }); const g = cur; cur = '';
          if (g === answer) { done = true; prog.streak++; api.store(id, prog); api.best(id, prog.streak); render(); api.end({ title: 'Верно: ' + answer.toUpperCase(), reward: Math.max(8, 40 - rows.length * 5), onAgain: start }); }
          else if (rows.length >= tries) { done = true; prog.streak = 0; api.store(id, prog); render(); api.end({ win: false, title: 'Не угадали', text: 'Слово: ' + answer.toUpperCase(), onAgain: start }); }
          else { api.sound('select'); render(); }
        }
        start();
      } });
  }
  wordleVariant('wordle4', '4 буквы', 4, 5); wordleVariant('wordle6', '6 букв', 6, 7);

  /* Боггл */
  Games.register({ id: 'boggle', title: 'Боггл', icon: '🎲', cat: 'words', desc: 'Соседние буквы 4×4 — собери слова за 90 секунд', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; const N = 4; let grid, sel = [], found, score, cells, hdr, stop, drag = false, curEl, listEl;
      const FREQ = 'ооооеееаааиииннтттссрррвввллкккммдддппуууяыьгзбчйхжшюцщэф';
      function gen() { grid = Array.from({ length: 16 }, () => FREQ[api.rand(0, FREQ.length - 1)]); }
      function start() { gen(); found = []; score = 0; sel = []; render(); if (stop) stop(); stop = timed(api, screen, 90, t => hdr.set(1, t), finish); }
      function render() {
        screen.innerHTML = ''; hdr = api.header(screen, [{ label: 'Очки', value: score }, { label: '⏱', value: 90 }, { label: 'Слов', value: found.length }]);
        const size = Math.floor(Math.min(screen.clientWidth - 30, 340) / N) - 4; const g = h('div', { class: 'fil-grid', style: `grid-template-columns:repeat(${N},${size}px);grid-auto-rows:${size}px;font-size:${Math.round(size * .5)}px` }); cells = [];
        grid.forEach((c, i) => { const el = h('div', { class: 'fil-cell', 'data-i': i }, c); cells.push(el); g.append(el); });
        g.addEventListener('pointerdown', e => { drag = true; g.setPointerCapture(e.pointerId); sel = []; pickC(e); }); g.addEventListener('pointermove', e => drag && pickC(e)); const up = () => { if (!drag) return; drag = false; submit(); }; g.addEventListener('pointerup', up); g.addEventListener('pointercancel', up);
        curEl = h('div', { class: 'wow-current' }); listEl = h('div', { class: 'fil-words' }, found.map(w => h('span', { class: 'fil-word' }, w)));
        screen.append(h('div', { class: 'game-area', style: 'justify-content:flex-start;gap:8px;overflow:auto' }, g, curEl, listEl));
      }
      function pickC(e) { const el = document.elementFromPoint(e.clientX, e.clientY); if (!el || !el.dataset.i) return; const i = +el.dataset.i; if (sel.includes(i)) return; if (sel.length) { const p = sel[sel.length - 1]; if (Math.abs(Math.floor(p / N) - Math.floor(i / N)) > 1 || Math.abs(p % N - i % N) > 1) return; } sel.push(i); cells[i].classList.add('sel'); curEl.textContent = sel.map(k => grid[k]).join(''); api.sound('select'); }
      function submit() { const w = sel.map(k => grid[k]).join(''); sel.forEach(k => cells[k].classList.remove('sel')); sel = []; curEl.textContent = ''; if (w.length < 3) return; if (found.includes(w)) { api.toast('Уже есть'); return; } if (!ALL.has(w)) { api.sound('bad'); return; } found.push(w); score += [0, 0, 0, 1, 2, 4, 7, 11, 16][Math.min(8, w.length)]; hdr.set(0, score); hdr.set(2, found.length); api.sound('good'); listEl.prepend(h('span', { class: 'fil-word' }, w)); }
      function finish() { api.best('boggle', score); api.end({ title: 'Время вышло', reward: score, text: `Слов: ${found.length}, очков: ${score}`, onAgain: start }); }
      this.unmount = () => stop && stop(); start();
    } });
})();
