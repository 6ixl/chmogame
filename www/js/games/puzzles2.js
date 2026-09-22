/* Дополнительные головоломки, часть 1 */
(function () {
  const gridEl = (h, n, size, cls) => h('div', { class: 'pz-grid ' + (cls || ''), style: `grid-template-columns:repeat(${n},${size}px);grid-auto-rows:${size}px` });
  const cellSize = (screen, n, max) => Math.floor(Math.min(screen.clientWidth - 30, max || 420) / n) - 3;

  /* ---------- Нонограмма ---------- */
  Games.register({
    id: 'nonogram', title: 'Нонограмма', icon: '▦', cat: 'puzzle', desc: 'Закрась клетки по числам-подсказкам', progress: api => 'Уровень ' + (api.level('nonogram').lvl + 1),
    mount(screen, api) {
      const { h } = api; const L = api.level('nonogram'); let N, sol, st, rowsC, colsC, mode = 1, cells;
      const clues = arr => { const out = []; let c = 0; for (const v of arr) { if (v) c++; else if (c) { out.push(c); c = 0; } } if (c) out.push(c); return out.length ? out : [0]; };
      function gen() {
        N = 5 + Math.min(5, Math.floor(L.lvl / 8)); sol = Array.from({ length: N * N }, () => Math.random() < 0.55 ? 1 : 0); st = Array(N * N).fill(0);
        rowsC = []; colsC = []; for (let i = 0; i < N; i++) { rowsC.push(clues(sol.slice(i * N, i * N + N))); colsC.push(clues(Array.from({ length: N }, (_, j) => sol[j * N + i]))); }
      }
      function render() {
        screen.innerHTML = '';
        const modeBtn = h('button', { class: 'btn small ' + (mode === 1 ? 'primary' : ''), onclick: () => { mode = mode === 1 ? 2 : 1; render(); } }, mode === 1 ? '■ Закрасить' : '✕ Пусто');
        api.header(screen, [{ label: 'Уровень', value: L.lvl + 1 }, { label: '', value: N + '×' + N }]); screen.querySelector('.game-top').append(modeBtn, h('button', { class: 'btn small gold', onclick: hint }, '💡 20'));
        const size = cellSize(screen, N + 3, 440); const maxC = Math.max(...rowsC.map(r => r.length), ...colsC.map(c => c.length));
        const g = h('div', { style: `display:grid;grid-template-columns:${size * 1.8}px repeat(${N},${size}px);gap:2px;touch-action:none` });
        g.append(h('div'));
        colsC.forEach(c => g.append(h('div', { style: 'display:flex;flex-direction:column;justify-content:flex-end;align-items:center;font-size:12px;font-weight:700;color:var(--muted);line-height:1.1' }, c.map(v => h('span', null, v)))));
        cells = [];
        for (let r = 0; r < N; r++) {
          g.append(h('div', { style: 'display:flex;justify-content:flex-end;align-items:center;gap:4px;font-size:12px;font-weight:700;color:var(--muted);padding-right:4px' }, rowsC[r].map(v => h('span', null, v))));
          for (let c = 0; c < N; c++) { const i = r * N + c; const el = h('div', { class: 'pz-cell', 'data-i': i, style: `height:${size}px` }); cells.push(el); g.append(el); }
        }
        let drag = false, val;
        g.addEventListener('pointerdown', e => { const el = e.target.closest('.pz-cell'); if (!el) return; drag = true; g.setPointerCapture(e.pointerId); const i = +el.dataset.i; val = st[i] === mode ? 0 : mode; set(i, val); });
        g.addEventListener('pointermove', e => { if (!drag) return; const el = document.elementFromPoint(e.clientX, e.clientY); if (el && el.classList.contains('pz-cell')) set(+el.dataset.i, val); });
        g.addEventListener('pointerup', () => { drag = false; check(); });
        screen.append(h('div', { class: 'game-area', style: 'overflow:auto' }, g));
        paint();
      }
      function set(i, v) { if (st[i] === v) return; st[i] = v; api.sound('tap'); paint(); }
      function paint() { cells.forEach((el, i) => { el.className = 'pz-cell ' + (st[i] === 1 ? 'on' : st[i] === 2 ? 'x' : ''); el.textContent = st[i] === 2 ? '✕' : ''; }); }
      function check() { if (st.every((v, i) => (v === 1) === (sol[i] === 1))) { L.done(); api.end({ title: 'Картинка собрана!', reward: 10 + N * 2, again: 'Дальше', onAgain: () => { gen(); render(); } }); } }
      function hint() { const wrong = st.map((v, i) => (v === 1) !== (sol[i] === 1) ? i : -1).filter(i => i >= 0); if (!wrong.length || !api.spend(20)) return; const i = wrong[api.rand(0, wrong.length - 1)]; st[i] = sol[i] ? 1 : 2; paint(); check(); }
      gen(); render();
    }
  });

  /* ---------- Лампочки ---------- */
  Games.register({
    id: 'lightsout', title: 'Лампочки', icon: '💡', cat: 'puzzle', desc: 'Выключи все лампочки', progress: api => 'Уровень ' + (api.level('lightsout').lvl + 1),
    mount(screen, api) {
      const { h } = api; const L = api.level('lightsout'); let N, st, moves, cells, hdr;
      function toggle(i) { const r = Math.floor(i / N), c = i % N; [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => { const rr = r + dr, cc = c + dc; if (rr >= 0 && cc >= 0 && rr < N && cc < N) st[rr * N + cc] ^= 1; }); }
      function gen() { N = 3 + Math.min(4, Math.floor(L.lvl / 10)); st = Array(N * N).fill(0); const k = 3 + Math.floor(L.lvl / 3); for (let i = 0; i < k; i++) toggle(api.rand(0, N * N - 1)); if (!st.some(Boolean)) toggle(0); moves = 0; }
      function render() {
        screen.innerHTML = ''; hdr = api.header(screen, [{ label: 'Уровень', value: L.lvl + 1 }, { label: 'Ходы', value: moves }, { btn: '↻', onClick: () => { gen(); render(); } }]);
        const size = cellSize(screen, N, 360); const g = gridEl(h, N, size); cells = [];
        for (let i = 0; i < N * N; i++) { const el = h('div', { class: 'pz-cell round', onclick: () => { toggle(i); moves++; hdr.set(1, moves); api.sound('tap'); api.vibrate(6); paint(); if (!st.some(Boolean)) { L.done(); api.end({ title: 'Все выключены!', reward: 8 + N * 2, again: 'Дальше', onAgain: () => { gen(); render(); } }); } } }); cells.push(el); g.append(el); }
        screen.append(h('div', { class: 'game-area' }, g)); paint();
      }
      function paint() { cells.forEach((el, i) => el.classList.toggle('lit', !!st[i])); }
      gen(); render();
    }
  });

  /* ---------- Соедини трубы (Flow) ---------- */
  Games.register({
    id: 'flow', title: 'Потоки', icon: '🔗', cat: 'puzzle', desc: 'Соедини точки одного цвета, заполнив всё поле', progress: api => 'Уровень ' + (api.level('flow').lvl + 1),
    mount(screen, api) {
      const { h } = api; const L = api.level('flow'); const COLORS = ['#f87171', '#34d399', '#60a5fa', '#fbbf24', '#c084fc', '#22d3ee', '#fb923c', '#f472b6', '#a3e635'];
      let N, paths, owner, ends, cells, cur = null, drawing = false;
      function partition() {
        for (let att = 0; att < 300; att++) {
          const own = Array(N * N).fill(-1); const ps = []; let ok = true;
          while (own.includes(-1)) {
            const start = own.indexOf(-1); const rem = own.filter(v => v < 0).length;
            const minL = Math.max(3, Math.ceil(N * N / 9)); const lens = [0, 1, 2, 3, 4].map(k => minL + k).filter(l => l <= rem && (rem - l === 0 || rem - l >= minL)); if (!lens.length) { ok = false; break; }
            const len = lens[api.rand(0, lens.length - 1)]; const p = [start]; const used = new Set([start]);
            const dfs = () => { if (p.length === len) return true; const c = p[p.length - 1]; const r = Math.floor(c / N), cc = c % N; for (const [rr, c2] of api.shuffle([[r - 1, cc], [r + 1, cc], [r, cc - 1], [r, cc + 1]])) { if (rr < 0 || c2 < 0 || rr >= N || c2 >= N) continue; const i = rr * N + c2; if (own[i] >= 0 || used.has(i)) continue; p.push(i); used.add(i); if (dfs()) return true; p.pop(); used.delete(i); } return false; };
            if (!dfs()) { ok = false; break; }
            p.forEach(i => own[i] = ps.length); ps.push(p);
          }
          if (ok && ps.length <= COLORS.length) return ps;
        }
        return null;
      }
      function gen() { N = 5 + Math.min(4, Math.floor(L.lvl / 8)); let ps; while (!(ps = partition())) N = Math.max(4, N - 1); ends = ps.map(p => [p[0], p[p.length - 1]]); paths = ends.map(() => []); owner = Array(N * N).fill(-1); }
      function render() {
        screen.innerHTML = ''; api.header(screen, [{ label: 'Уровень', value: L.lvl + 1 }, { label: '', value: N + '×' + N }, { btn: '↻', onClick: () => { paths = ends.map(() => []); owner.fill(-1); paint(); } }]);
        const size = cellSize(screen, N, 420); const g = gridEl(h, N, size, 'flow'); cells = [];
        for (let i = 0; i < N * N; i++) { const el = h('div', { class: 'pz-cell', 'data-i': i }); const e = ends.findIndex(x => x.includes(i)); if (e >= 0) el.append(h('div', { class: 'flow-dot', style: 'background:' + COLORS[e] })); cells.push(el); g.append(el); }
        g.addEventListener('pointerdown', e => { const i = at(e); if (i < 0) return; const c = ends.findIndex(x => x.includes(i)); let col = c >= 0 ? c : owner[i]; if (col < 0) return; drawing = true; g.setPointerCapture(e.pointerId); cur = col; if (c >= 0) { clear(col); paths[col] = [i]; owner[i] = col; } else { const k = paths[col].indexOf(i); paths[col].slice(k + 1).forEach(j => owner[j] = -1); paths[col] = paths[col].slice(0, k + 1); } paint(); });
        g.addEventListener('pointermove', e => { if (!drawing) return; const i = at(e); if (i < 0) return; const p = paths[cur]; const last = p[p.length - 1]; if (i === last) return; const adj = Math.abs(i - last) === N || (Math.abs(i - last) === 1 && Math.floor(i / N) === Math.floor(last / N)); if (!adj) return; if (p.includes(i)) { const k = p.indexOf(i); p.slice(k + 1).forEach(j => owner[j] = -1); paths[cur] = p.slice(0, k + 1); paint(); return; } const e2 = ends.findIndex(x => x.includes(i)); if (e2 >= 0 && e2 !== cur) return; if (ends[cur].includes(last) && p.length > 1) return; if (owner[i] >= 0 && owner[i] !== cur) clear(owner[i]); p.push(i); owner[i] = cur; api.sound('select'); paint(); });
        const up = () => { drawing = false; check(); }; g.addEventListener('pointerup', up); g.addEventListener('pointercancel', up);
        screen.append(h('div', { class: 'game-area' }, g)); paint();
      }
      const at = e => { const el = document.elementFromPoint(e.clientX, e.clientY); const c = el && el.closest('.pz-cell'); return c ? +c.dataset.i : -1; };
      function clear(col) { paths[col].forEach(i => { if (owner[i] === col) owner[i] = -1; }); paths[col] = []; }
      function paint() { cells.forEach((el, i) => { el.style.background = owner[i] >= 0 ? COLORS[owner[i]] + '55' : ''; }); }
      function check() { const full = owner.every(v => v >= 0) && paths.every((p, c) => p.length > 1 && ends[c].includes(p[0]) && ends[c].includes(p[p.length - 1])); if (full) { L.done(); api.end({ title: 'Потоки соединены!', reward: 10 + N * 2, again: 'Дальше', onAgain: () => { gen(); render(); } }); } }
      gen(); render();
    }
  });

  /* ---------- Ханойские башни ---------- */
  Games.register({
    id: 'hanoi', title: 'Ханойские башни', icon: '🗼', cat: 'puzzle', desc: 'Перенеси всю башню на другой стержень', progress: api => 'Уровень ' + (api.level('hanoi').lvl + 1),
    mount(screen, api) {
      const { h } = api; const L = api.level('hanoi'); let n, pegs, sel = -1, moves, hdr;
      function gen() { n = 3 + Math.min(5, Math.floor(L.lvl / 3)); pegs = [[...Array(n).keys()].map(i => n - i), [], []]; moves = 0; sel = -1; }
      function render() {
        screen.innerHTML = ''; hdr = api.header(screen, [{ label: 'Уровень', value: L.lvl + 1 }, { label: 'Ходы', value: moves }, { label: 'Мин.', value: Math.pow(2, n) - 1 }]);
        const W = Math.min(screen.clientWidth - 20, 420); const area = h('div', { style: `display:flex;gap:6px;width:${W}px;height:300px;align-items:flex-end` });
        pegs.forEach((p, pi) => {
          const peg = h('div', { class: 'peg' + (sel === pi ? ' sel' : ''), onclick: () => tap(pi) });
          peg.append(h('div', { class: 'peg-rod' }));
          p.forEach((d, i) => peg.append(h('div', { class: 'disk', style: `width:${30 + d * (W / 3 - 40) / n}px;background:hsl(${d * 40},70%,60%);bottom:${8 + i * 24}px` })));
          area.append(peg);
        });
        screen.append(h('div', { class: 'game-area' }, area, h('div', { class: 'hint-text' }, 'Тап по стержню: взять / положить')));
      }
      function tap(pi) {
        if (sel < 0) { if (pegs[pi].length) { sel = pi; api.sound('tap'); } render(); return; }
        if (sel === pi) { sel = -1; render(); return; }
        const d = pegs[sel][pegs[sel].length - 1]; const top = pegs[pi][pegs[pi].length - 1];
        if (top && top < d) { api.sound('bad'); api.vibrate(30); sel = -1; render(); return; }
        pegs[pi].push(pegs[sel].pop()); sel = -1; moves++; api.sound('select'); render();
        if (pegs[2].length === n || pegs[1].length === n) { L.done(); api.end({ title: 'Башня перенесена!', reward: 10 + n * 3 + (moves === Math.pow(2, n) - 1 ? 10 : 0), text: moves + ' ходов', again: 'Дальше', onAgain: () => { gen(); render(); } }); }
      }
      gen(); render();
    }
  });

  /* ---------- Мастермайнд ---------- */
  Games.register({
    id: 'mastermind', title: 'Мастермайнд', icon: '🎨', cat: 'puzzle', desc: 'Угадай код из цветов за 10 попыток', bestLabel: 'Побед',
    mount(screen, api) {
      const { h } = api; const COLORS = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#c084fc', '#22d3ee']; let code, rows, cur, wins = api.load('mm_w', 0);
      function start() { code = Array.from({ length: 4 }, () => api.rand(0, 5)); rows = []; cur = []; render(); }
      function render() {
        screen.innerHTML = ''; api.header(screen, [{ label: 'Попытка', value: (rows.length + 1) + '/10' }, { label: 'Побед', value: wins }, { btn: '⌫', onClick: () => { cur.pop(); render(); } }]);
        const list = h('div', { style: 'display:flex;flex-direction:column;gap:6px;width:100%;max-width:340px' });
        rows.forEach(r => list.append(h('div', { class: 'mm-row' }, r.g.map(c => h('div', { class: 'mm-peg', style: 'background:' + COLORS[c] })), h('div', { class: 'mm-fb' }, '⚫'.repeat(r.b) + '⚪'.repeat(r.w)))));
        list.append(h('div', { class: 'mm-row cur' }, [0, 1, 2, 3].map(i => h('div', { class: 'mm-peg', style: 'background:' + (cur[i] != null ? COLORS[cur[i]] : 'var(--card2)') }))));
        screen.append(h('div', { class: 'game-area', style: 'justify-content:flex-start;overflow:auto' }, list, h('div', { class: 'hint-text' }, '⚫ — верный цвет на месте, ⚪ — цвет есть, но не там')));
        screen.append(h('div', { class: 'bottom-bar row' }, COLORS.map((c, i) => h('div', { class: 'mm-peg big', style: 'background:' + c, onclick: () => { if (cur.length < 4) { cur.push(i); api.sound('tap'); if (cur.length === 4) submit(); else render(); } } }))));
      }
      function submit() {
        let b = 0, w = 0; const cc = code.slice(), gg = cur.slice();
        for (let i = 0; i < 4; i++) if (gg[i] === cc[i]) { b++; cc[i] = gg[i] = -1; }
        for (let i = 0; i < 4; i++) if (gg[i] >= 0) { const k = cc.indexOf(gg[i]); if (k >= 0) { w++; cc[k] = -1; } }
        rows.push({ g: cur, b, w }); cur = [];
        if (b === 4) { wins++; api.store('mm_w', wins); api.best('mastermind', wins); api.end({ title: 'Код взломан!', reward: 5 + (10 - rows.length) * 3, text: 'Попыток: ' + rows.length, onAgain: start }); }
        else if (rows.length >= 10) api.end({ win: false, title: 'Попытки кончились', onAgain: start });
        else api.sound('select');
        render();
      }
      start();
    }
  });

  /* ---------- Быки и коровы ---------- */
  Games.register({
    id: 'bulls', title: 'Быки и коровы', icon: '🐂', cat: 'puzzle', desc: 'Угадай 4-значное число с разными цифрами', bestLabel: 'Побед',
    mount(screen, api) {
      const { h } = api; let code, rows, cur, wins = api.load('bulls_w', 0), listEl, curEl;
      function start() { code = api.shuffle('0123456789'.split('')).slice(0, 4).join(''); rows = []; cur = ''; render(); }
      function render() {
        screen.innerHTML = ''; api.header(screen, [{ label: 'Попыток', value: rows.length }, { label: 'Побед', value: wins }]);
        listEl = h('div', { style: 'display:flex;flex-direction:column;gap:6px;width:100%;max-width:300px' }, rows.map(r => h('div', { class: 'mm-row' }, h('b', { style: 'font-size:22px;letter-spacing:.2em' }, r.g), h('span', { style: 'margin-left:auto' }, `🐂 ${r.b}  🐄 ${r.c}`))));
        curEl = h('div', { class: 'wow-current' }, cur);
        screen.append(h('div', { class: 'game-area', style: 'justify-content:flex-start;overflow:auto;gap:8px' }, listEl, curEl, h('div', { class: 'hint-text' }, 'Бык — цифра на своём месте, корова — есть, но не там')));
        const pad = h('div', { class: 'numpad', style: 'width:100%' }); '1234567890'.split('').forEach(d => pad.append(h('button', { class: 'btn', onclick: () => { if (cur.length < 4 && !cur.includes(d)) { cur += d; curEl.textContent = cur; api.sound('tap'); if (cur.length === 4) submit(); } } }, d)));
        pad.append(h('button', { class: 'btn', onclick: () => { cur = cur.slice(0, -1); curEl.textContent = cur; } }, '⌫'));
        screen.append(h('div', { class: 'bottom-bar' }, pad));
      }
      function submit() {
        let b = 0, c = 0; for (let i = 0; i < 4; i++) { if (cur[i] === code[i]) b++; else if (code.includes(cur[i])) c++; }
        rows.push({ g: cur, b, c }); cur = '';
        if (b === 4) { wins++; api.store('bulls_w', wins); api.best('bulls', wins); api.end({ title: 'Число ' + code + ' угадано!', reward: Math.max(5, 30 - rows.length * 2), text: 'Попыток: ' + rows.length, onAgain: start }); }
        render();
      }
      start();
    }
  });

  /* ---------- Лабиринт ---------- */
  Games.register({
    id: 'maze', title: 'Лабиринт', icon: '🌀', cat: 'puzzle', desc: 'Найди выход: свайп двигает шарик', progress: api => 'Уровень ' + (api.level('maze').lvl + 1),
    mount(screen, api) {
      const { h } = api; const L = api.level('maze'); let N, walls, px, py, cv, ctx, moves, hdr;
      function gen() {
        N = 7 + Math.min(12, Math.floor(L.lvl / 4)); if (N % 2 === 0) N++;
        walls = Array.from({ length: N }, () => Array(N).fill(1));
        const carve = (x, y) => { walls[y][x] = 0; for (const [dx, dy] of api.shuffle([[2, 0], [-2, 0], [0, 2], [0, -2]])) { const nx = x + dx, ny = y + dy; if (nx > 0 && ny > 0 && nx < N - 1 && ny < N - 1 && walls[ny][nx]) { walls[y + dy / 2][x + dx / 2] = 0; carve(nx, ny); } } };
        carve(1, 1); px = 1; py = 1; moves = 0;
      }
      function render() {
        screen.innerHTML = ''; hdr = api.header(screen, [{ label: 'Уровень', value: L.lvl + 1 }, { label: 'Ходы', value: moves }]);
        const area = h('div', { class: 'game-area' }); screen.append(area, h('div', { class: 'hint-text' }, 'Свайп — движение до стены'));
        const S = 400; cv = api.canvas(area, S, S); ctx = cv.ctx; api.swipe(cv.canvas, move); draw();
      }
      function draw() {
        const cs = 400 / N; ctx.fillStyle = '#171728'; ctx.fillRect(0, 0, 400, 400); ctx.fillStyle = '#3b3b6b';
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (walls[y][x]) ctx.fillRect(x * cs, y * cs, cs + .5, cs + .5);
        ctx.fillStyle = '#34d399'; ctx.fillRect((N - 2) * cs + 2, (N - 2) * cs + 2, cs - 4, cs - 4);
        ctx.fillStyle = '#22d3ee'; ctx.beginPath(); ctx.arc(px * cs + cs / 2, py * cs + cs / 2, cs / 2 - 2, 0, 7); ctx.fill();
      }
      function move(d) {
        const [dx, dy] = { l: [-1, 0], r: [1, 0], u: [0, -1], d: [0, 1] }[d] || [0, 0]; if (!dx && !dy) return;
        let n = 0; while (!walls[py + dy][px + dx]) { px += dx; py += dy; n++; if (px === N - 2 && py === N - 2) break; }
        if (n) { moves++; hdr.set(1, moves); api.sound('tap'); api.vibrate(5); } draw();
        if (px === N - 2 && py === N - 2) { L.done(); api.end({ title: 'Выход найден!', reward: 8 + N, text: moves + ' ходов', again: 'Дальше', onAgain: () => { gen(); render(); } }); }
      }
      gen(); render();
    }
  });

  /* ---------- Саймон ---------- */
  Games.register({
    id: 'simon', title: 'Саймон', icon: '🎵', cat: 'brain', desc: 'Повторяй всё более длинную последовательность', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; const COLORS = ['#f87171', '#34d399', '#60a5fa', '#fbbf24']; const NOTES = [330, 392, 494, 587]; let seq, pos, playing, pads, hdr, timers = [];
      function start() { seq = []; next(); }
      function next() { seq.push(api.rand(0, 3)); pos = 0; playing = true; hdr.set(0, seq.length); seq.forEach((c, i) => timers.push(setTimeout(() => flash(c), 500 + i * 550))); timers.push(setTimeout(() => playing = false, 500 + seq.length * 550)); }
      function flash(c) { pads[c].style.opacity = 1; beep(c); setTimeout(() => pads[c].style.opacity = .35, 300); }
      function beep(c) { try { const a = new (window.AudioContext || window.webkitAudioContext)(); const o = a.createOscillator(), g = a.createGain(); o.frequency.value = NOTES[c]; g.gain.value = 0.1; o.connect(g).connect(a.destination); o.start(); o.stop(a.currentTime + 0.25); } catch (e) {} }
      screen.innerHTML = ''; hdr = api.header(screen, [{ label: 'Длина', value: 0 }, { label: 'Рекорд', value: api.bestOf('simon') || 0 }]);
      const g = h('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:10px;width:min(90vw,340px);aspect-ratio:1' }); pads = [];
      COLORS.forEach((c, i) => { const p = h('div', { style: `background:${c};opacity:.35;border-radius:18px`, onpointerdown: () => press(i) }); pads.push(p); g.append(p); });
      screen.append(h('div', { class: 'game-area' }, g, h('div', { class: 'hint-text' }, 'Смотри, запоминай, повторяй')));
      function press(i) {
        if (playing) return; flash(i); api.vibrate(8);
        if (seq[pos] !== i) { const n = seq.length - 1; api.best('simon', n); api.end({ win: false, title: 'Ошибка!', reward: Math.floor(n / 2), text: 'Длина: ' + n, onAgain: start }); playing = true; return; }
        pos++; if (pos === seq.length) { if (seq.length % 5 === 0) api.addCoins(5); setTimeout(next, 600); playing = true; }
      }
      this.unmount = () => timers.forEach(clearTimeout);
      start();
    }
  });

  /* ---------- Найди лишнее ---------- */
  Games.register({
    id: 'oddone', title: 'Найди лишнее', icon: '👀', cat: 'brain', desc: 'Один символ отличается — найди его быстрее', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; const PAIRS = [['😀', '😃'], ['🐶', '🐕'], ['🍎', '🍏'], ['⭐', '🌟'], ['🔵', '🟦'], ['🐱', '🐈'], ['❤️', '🧡'], ['🌙', '🌛'], ['🍋', '🍊'], ['🚗', '🚙'], ['🌲', '🌳'], ['🐸', '🦎'], ['🧀', '🍕'], ['🔒', '🔓'], ['⬆️', '⬇️'], ['🕐', '🕑']];
      let round, score, timeLeft, timer, hdr;
      function start() { round = 0; score = 0; timeLeft = 45; clearInterval(timer); timer = setInterval(() => { timeLeft--; hdr.set(1, timeLeft); if (timeLeft <= 0) finish(); }, 1000); next(); }
      function next() {
        round++; const n = 3 + Math.min(5, Math.floor(round / 3)); const [a, b] = PAIRS[api.rand(0, PAIRS.length - 1)]; const odd = api.rand(0, n * n - 1);
        screen.innerHTML = ''; hdr = api.header(screen, [{ label: 'Счёт', value: score }, { label: '⏱', value: timeLeft }]);
        const g = gridEl(h, n, cellSize(screen, n, 400)); for (let i = 0; i < n * n; i++) g.append(h('div', { class: 'pz-cell', style: 'font-size:' + Math.round(300 / n) + 'px;background:transparent', onclick: () => { if (i === odd) { score++; api.sound('good'); if (score % 10 === 0) api.addCoins(5); } else { api.sound('bad'); api.vibrate(40); timeLeft = Math.max(0, timeLeft - 3); } next(); } }, i === odd ? b : a));
        screen.append(h('div', { class: 'game-area' }, g));
      }
      function finish() { clearInterval(timer); api.best('oddone', score); api.end({ title: 'Время вышло', reward: Math.floor(score / 2), text: 'Найдено: ' + score, onAgain: start }); }
      this.unmount = () => clearInterval(timer);
      start();
    }
  });

  /* ---------- Таблица Шульте ---------- */
  Games.register({
    id: 'schulte', title: 'Таблица Шульте', icon: '🔢', cat: 'brain', desc: 'Нажимай числа от 1 до 25 по порядку', bestLabel: 'Лучшее время',
    mount(screen, api) {
      const { h } = api; let nums, next, t0, timer, hdr;
      function start() { nums = api.shuffle([...Array(25).keys()].map(i => i + 1)); next = 1; t0 = null; clearInterval(timer); render(); }
      function render() {
        screen.innerHTML = ''; hdr = api.header(screen, [{ label: 'Следующее', value: next }, { label: '⏱', value: '0.0' }, { label: 'Рекорд', value: api.bestOf('schulte') != null ? api.bestOf('schulte') + 'с' : '—' }]);
        const g = gridEl(h, 5, cellSize(screen, 5, 380));
        nums.forEach(n => g.append(h('div', { class: 'pz-cell num', onclick: e => tap(n, e.currentTarget) }, n)));
        screen.append(h('div', { class: 'game-area' }, g));
      }
      function tap(n, el) {
        if (!t0) { t0 = Date.now(); timer = setInterval(() => hdr.set(1, ((Date.now() - t0) / 1000).toFixed(1)), 100); }
        if (n !== next) { api.sound('bad'); api.vibrate(30); return; }
        el.classList.add('on'); next++; hdr.set(0, next); api.sound('tap');
        if (next > 25) { clearInterval(timer); const s = +((Date.now() - t0) / 1000).toFixed(1); const isBest = api.best('schulte', s, true); api.end({ title: s + ' секунд', reward: s < 30 ? 15 : s < 45 ? 10 : 5, text: isBest ? 'Новый рекорд!' : '', onAgain: start }); }
      }
      this.unmount = () => clearInterval(timer);
      start();
    }
  });
})();
