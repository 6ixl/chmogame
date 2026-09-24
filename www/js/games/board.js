/* Настольные и карточные игры против компьютера */
(function () {
  const gridEl = (h, n, size, cls) => h('div', { class: 'pz-grid ' + (cls || ''), style: `grid-template-columns:repeat(${n},${size}px);grid-auto-rows:${size}px` });
  const cellSize = (screen, n, max) => Math.floor(Math.min(screen.clientWidth - 30, max || 420) / n) - 3;
  const stats = (api, id) => { const s = api.load(id + '_st', { w: 0, l: 0 }); return { s, win() { s.w++; api.store(id + '_st', s); api.best(id, s.w); }, lose() { s.l++; api.store(id + '_st', s); }, txt: () => `Победы ${s.w} · Поражения ${s.l}` }; };

  /* ---------- Четыре в ряд ---------- */
  Games.register({
    id: 'connect4', title: 'Четыре в ряд', icon: '🔴', cat: 'board', desc: 'Собери 4 фишки в ряд раньше компьютера', bestLabel: 'Побед',
    mount(screen, api) {
      const { h } = api; const W = 7, H = 6; let b, over, cells, st = stats(api, 'connect4'), diff = 1;
      function start() { b = Array(W * H).fill(0); over = false; render(); }
      function render() {
        screen.innerHTML = ''; api.header(screen, [{ label: '', value: st.txt() }]);
        const size = cellSize(screen, W, 400); const g = gridEl(h, W, size, 'c4'); cells = [];
        for (let i = 0; i < W * H; i++) { const c = h('div', { class: 'pz-cell round', onclick: () => play(i % W) }); cells.push(c); g.append(c); }
        screen.append(h('div', { class: 'game-area' }, g, h('div', { class: 'hint-text' }, 'Вы — красные'))); paint();
      }
      function paint() { cells.forEach((c, i) => c.style.background = b[i] === 1 ? '#f87171' : b[i] === 2 ? '#fbbf24' : 'var(--card)'); }
      function drop(col, p) { for (let r = H - 1; r >= 0; r--) if (!b[r * W + col]) { b[r * W + col] = p; return r * W + col; } return -1; }
      function winner(g) { const L = [[1, 0], [0, 1], [1, 1], [1, -1]]; for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) { const p = g[r * W + c]; if (!p) continue; for (const [dr, dc] of L) { let k = 1; while (k < 4) { const rr = r + dr * k, cc = c + dc * k; if (rr < 0 || cc < 0 || rr >= H || cc >= W || g[rr * W + cc] !== p) break; k++; } if (k === 4) return p; } } return 0; }
      function score(g, p) { let s = 0; const L = [[1, 0], [0, 1], [1, 1], [1, -1]]; for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) for (const [dr, dc] of L) { let mine = 0, theirs = 0; for (let k = 0; k < 4; k++) { const rr = r + dr * k, cc = c + dc * k; if (rr < 0 || cc < 0 || rr >= H || cc >= W) { mine = -1; break; } const v = g[rr * W + cc]; if (v === p) mine++; else if (v) theirs++; } if (mine < 0) continue; if (!theirs) s += [0, 1, 10, 100, 10000][mine]; if (!mine) s -= [0, 1, 10, 120, 10000][theirs]; } return s; }
      function minimax(g, depth, p, alpha, beta) { const w = winner(g); if (w) return w === 2 ? 100000 + depth : -100000 - depth; if (!depth) return score(g, 2); let best = p === 2 ? -Infinity : Infinity; for (const col of [3, 2, 4, 1, 5, 0, 6]) { let r = -1; for (let rr = H - 1; rr >= 0; rr--) if (!g[rr * W + col]) { r = rr; break; } if (r < 0) continue; g[r * W + col] = p; const v = minimax(g, depth - 1, 3 - p, alpha, beta); g[r * W + col] = 0; if (p === 2) { best = Math.max(best, v); alpha = Math.max(alpha, v); } else { best = Math.min(best, v); beta = Math.min(beta, v); } if (beta <= alpha) break; } return best === Infinity || best === -Infinity ? 0 : best; }
      function play(col) {
        if (over || drop(col, 1) < 0) return; api.sound('tap'); api.vibrate(8); paint(); if (end()) return;
        setTimeout(() => { let bestCol = 3, bestV = -Infinity; for (const c of [3, 2, 4, 1, 5, 0, 6]) { let r = -1; for (let rr = H - 1; rr >= 0; rr--) if (!b[rr * W + c]) { r = rr; break; } if (r < 0) continue; b[r * W + c] = 2; const v = minimax(b, [1, 4, 7][diff], 1, -Infinity, Infinity); b[r * W + c] = 0; if (v > bestV) { bestV = v; bestCol = c; } } if (diff === 0 && Math.random() < 0.5) { const free = [0, 1, 2, 3, 4, 5, 6].filter(c => !b[c]); bestCol = free[api.rand(0, free.length - 1)]; } drop(bestCol, 2); api.sound('select'); paint(); end(); }, 300);
      }
      function end() { const w = winner(b); if (w || !b.includes(0)) { over = true; if (w === 1) { st.win(); api.end({ title: 'Победа!', reward: 25, onAgain: start }); } else if (w === 2) { st.lose(); api.end({ win: false, title: 'Компьютер выиграл', onAgain: start }); } else api.end({ title: 'Ничья', reward: 5, onAgain: start }); return true; } return false; }
      api.difficulty('connect4', d => { diff = d; start(); });
    }
  });

  /* ---------- Реверси ---------- */
  Games.register({
    id: 'reversi', title: 'Реверси', icon: '⚫', cat: 'board', desc: 'Захватывай фишки соперника, зажимая их', bestLabel: 'Побед',
    mount(screen, api) {
      const { h } = api; const N = 8; let b, cells, hdr, over, st = stats(api, 'reversi'), diff = 1;
      const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
      function start() { b = Array(64).fill(0); b[27] = b[36] = 2; b[28] = b[35] = 1; over = false; render(); }
      function flips(g, i, p) { const r = Math.floor(i / N), c = i % N; if (g[i]) return []; const out = []; for (const [dr, dc] of DIRS) { const line = []; let rr = r + dr, cc = c + dc; while (rr >= 0 && cc >= 0 && rr < N && cc < N && g[rr * N + cc] === 3 - p) { line.push(rr * N + cc); rr += dr; cc += dc; } if (line.length && rr >= 0 && cc >= 0 && rr < N && cc < N && g[rr * N + cc] === p) out.push(...line); } return out; }
      const moves = (g, p) => [...Array(64).keys()].filter(i => flips(g, i, p).length);
      function render() {
        screen.innerHTML = ''; hdr = api.header(screen, [{ label: '⚫', value: 2 }, { label: '⚪', value: 2 }, { label: '', value: st.txt() }]);
        const size = cellSize(screen, N, 400); const g = gridEl(h, N, size, 'reversi'); cells = [];
        for (let i = 0; i < 64; i++) { const c = h('div', { class: 'pz-cell', style: 'background:#1f5c43', onclick: () => play(i) }); cells.push(c); g.append(c); }
        screen.append(h('div', { class: 'game-area' }, g, h('div', { class: 'hint-text' }, 'Вы — чёрные. Подсвечены доступные ходы'))); paint();
      }
      function paint() { const m = new Set(moves(b, 1)); cells.forEach((c, i) => { c.innerHTML = ''; if (b[i]) c.append(h('div', { class: 'disc', style: 'background:' + (b[i] === 1 ? '#111' : '#eee') })); else if (m.has(i) && !over) c.append(h('div', { class: 'disc', style: 'width:30%;height:30%;background:rgba(255,255,255,.25)' })); }); hdr.set(0, b.filter(v => v === 1).length); hdr.set(1, b.filter(v => v === 2).length); }
      function apply(i, p) { flips(b, i, p).forEach(k => b[k] = p); b[i] = p; }
      function play(i) {
        if (over || !flips(b, i, 1).length) return; apply(i, 1); api.sound('tap'); api.vibrate(8); paint();
        const aiTurn = () => { const m = moves(b, 2); if (!m.length) { if (!moves(b, 1).length) finish(); return; } const CORN = [0, 7, 56, 63], BAD = [1, 8, 9, 6, 14, 15, 48, 49, 57, 54, 55, 62]; const evalB = g => g.reduce((s, v, k) => s + (v ? (v === 2 ? 1 : -1) * (CORN.includes(k) ? 12 : BAD.includes(k) ? -3 : (k % 8 === 0 || k % 8 === 7 || k < 8 || k > 55) ? 3 : 1) : 0), 0); const search = (g, pl, depth) => { const mv = [...Array(64).keys()].filter(i => flips(g, i, pl).length); if (!depth || !mv.length) return evalB(g); let best = pl === 2 ? -Infinity : Infinity; for (const k of mv) { const g2 = g.slice(); flips(g2, k, pl).forEach(x => g2[x] = pl); g2[k] = pl; const v = search(g2, 3 - pl, depth - 1); best = pl === 2 ? Math.max(best, v) : Math.min(best, v); } return best; }; let best = m[0], bv = -Infinity; for (const k of m) { let v; if (diff === 0) v = Math.random(); else if (diff === 1) v = flips(b, k, 2).length + (CORN.includes(k) ? 20 : 0) - (BAD.includes(k) ? 5 : 0); else { const g2 = b.slice(); flips(g2, k, 2).forEach(x => g2[x] = 2); g2[k] = 2; v = search(g2, 1, 3); } if (v > bv) { bv = v; best = k; } } apply(best, 2); api.sound('select'); paint(); if (!moves(b, 1).length) { if (moves(b, 2).length) setTimeout(aiTurn, 400); else finish(); } };
        setTimeout(aiTurn, 400);
      }
      function finish() { over = true; const me = b.filter(v => v === 1).length, ai = b.filter(v => v === 2).length; paint(); if (me > ai) { st.win(); api.end({ title: `Победа ${me}:${ai}!`, reward: 30, onAgain: start }); } else if (ai > me) { st.lose(); api.end({ win: false, title: `Поражение ${me}:${ai}`, onAgain: start }); } else api.end({ title: 'Ничья', reward: 8, onAgain: start }); }
      api.difficulty('reversi', d => { diff = d; start(); });
    }
  });

  /* ---------- Точки и квадраты ---------- */
  Games.register({
    id: 'dots', title: 'Точки и квадраты', icon: '🔲', cat: 'board', desc: 'Замыкай квадраты, ставя стороны', bestLabel: 'Побед',
    mount(screen, api) {
      const { h } = api; const N = 4; let hl, vl, boxes, turn, cv, ctx, over, st = stats(api, 'dots'), hdr, diff = 1;
      function start() { hl = Array(N * (N + 1)).fill(0); vl = Array(N * (N + 1)).fill(0); boxes = Array(N * N).fill(0); turn = 1; over = false; render(); }
      function render() { screen.innerHTML = ''; hdr = api.header(screen, [{ label: 'Вы', value: 0 }, { label: 'ПК', value: 0 }, { label: '', value: st.txt() }]); const area = h('div', { class: 'game-area' }); screen.append(area, h('div', { class: 'hint-text' }, 'Тап по линии между точками')); cv = api.canvas(area, 360, 360); ctx = cv.ctx; cv.canvas.addEventListener('pointerdown', tap); draw(); }
      const P = 40, S = (360 - 2 * P) / N;
      function draw() {
        ctx.fillStyle = '#171728'; ctx.fillRect(0, 0, 360, 360);
        boxes.forEach((o, i) => { if (o) { ctx.fillStyle = o === 1 ? '#22d3ee55' : '#f8717155'; ctx.fillRect(P + (i % N) * S, P + Math.floor(i / N) * S, S, S); } });
        ctx.lineWidth = 6; ctx.lineCap = 'round';
        for (let r = 0; r <= N; r++) for (let c = 0; c < N; c++) { const v = hl[r * N + c]; ctx.strokeStyle = v ? (v === 1 ? '#22d3ee' : '#f87171') : '#2a2a44'; ctx.beginPath(); ctx.moveTo(P + c * S + 8, P + r * S); ctx.lineTo(P + (c + 1) * S - 8, P + r * S); ctx.stroke(); }
        for (let r = 0; r < N; r++) for (let c = 0; c <= N; c++) { const v = vl[r * (N + 1) + c]; ctx.strokeStyle = v ? (v === 1 ? '#22d3ee' : '#f87171') : '#2a2a44'; ctx.beginPath(); ctx.moveTo(P + c * S, P + r * S + 8); ctx.lineTo(P + c * S, P + (r + 1) * S - 8); ctx.stroke(); }
        ctx.fillStyle = '#fff'; for (let r = 0; r <= N; r++) for (let c = 0; c <= N; c++) { ctx.beginPath(); ctx.arc(P + c * S, P + r * S, 6, 0, 7); ctx.fill(); }
        hdr.set(0, boxes.filter(v => v === 1).length); hdr.set(1, boxes.filter(v => v === 2).length);
      }
      function closed(kind, idx, p) { let got = 0; const check = bi => { const r = Math.floor(bi / N), c = bi % N; if (hl[r * N + c] && hl[(r + 1) * N + c] && vl[r * (N + 1) + c] && vl[r * (N + 1) + c + 1] && !boxes[bi]) { boxes[bi] = p; got++; } }; if (kind === 'h') { const r = Math.floor(idx / N), c = idx % N; if (r > 0) check((r - 1) * N + c); if (r < N) check(r * N + c); } else { const r = Math.floor(idx / (N + 1)), c = idx % (N + 1); if (c > 0) check(r * N + c - 1); if (c < N) check(r * N + c); } return got; }
      function tap(e) {
        if (over || turn !== 1) return; const rc = cv.canvas.getBoundingClientRect(); const x = (e.clientX - rc.left) * 360 / rc.width, y = (e.clientY - rc.top) * 360 / rc.height;
        let best = null, bd = 18;
        for (let r = 0; r <= N; r++) for (let c = 0; c < N; c++) { if (hl[r * N + c]) continue; const d = Math.hypot(x - (P + c * S + S / 2), y - (P + r * S)); if (d < bd) { bd = d; best = ['h', r * N + c]; } }
        for (let r = 0; r < N; r++) for (let c = 0; c <= N; c++) { if (vl[r * (N + 1) + c]) continue; const d = Math.hypot(x - (P + c * S), y - (P + r * S + S / 2)); if (d < bd) { bd = d; best = ['v', r * (N + 1) + c]; } }
        if (!best) return; move(best[0], best[1], 1);
      }
      function move(kind, idx, p) {
        (kind === 'h' ? hl : vl)[idx] = p; const got = closed(kind, idx, p); api.sound(got ? 'good' : 'tap'); api.vibrate(6); draw();
        if (!boxes.includes(0)) { finish(); return; }
        if (!got) turn = 3 - p; if (turn === 2) setTimeout(ai, 400);
      }
      function sides(bi) { const r = Math.floor(bi / N), c = bi % N; return [hl[r * N + c], hl[(r + 1) * N + c], vl[r * (N + 1) + c], vl[r * (N + 1) + c + 1]].filter(Boolean).length; }
      function ai() {
        if (over) return; const free = []; hl.forEach((v, i) => !v && free.push(['h', i])); vl.forEach((v, i) => !v && free.push(['v', i]));
        const boxesOf = (k, i) => { const out = []; if (k === 'h') { const r = Math.floor(i / N), c = i % N; if (r > 0) out.push((r - 1) * N + c); if (r < N) out.push(r * N + c); } else { const r = Math.floor(i / (N + 1)), c = i % (N + 1); if (c > 0) out.push(r * N + c - 1); if (c < N) out.push(r * N + c); } return out; };
        let pick = diff === 0 && Math.random() < 0.5 ? null : free.find(([k, i]) => boxesOf(k, i).some(bi => sides(bi) === 3));
        if (!pick) { if (diff === 0) pick = free[api.rand(0, free.length - 1)]; else { const safe = free.filter(([k, i]) => boxesOf(k, i).every(bi => sides(bi) < 2)); if (safe.length) pick = safe[api.rand(0, safe.length - 1)]; else if (diff === 2) { const cost = ([k, i]) => { const arr = k === 'h' ? hl : vl; arr[i] = 2; let got = 0; boxesOf(k, i).forEach(bi => { if (sides(bi) === 3) got++; }); arr[i] = 0; return got; }; pick = free.slice().sort((a2, b2) => cost(a2) - cost(b2))[0]; } else pick = free[api.rand(0, free.length - 1)]; } }
        move(pick[0], pick[1], 2);
      }
      function finish() { over = true; const me = boxes.filter(v => v === 1).length, ai = boxes.filter(v => v === 2).length; if (me > ai) { st.win(); api.end({ title: `Победа ${me}:${ai}!`, reward: 20, onAgain: start }); } else if (ai > me) { st.lose(); api.end({ win: false, title: `Поражение ${me}:${ai}`, onAgain: start }); } else api.end({ title: 'Ничья', reward: 5, onAgain: start }); }
      api.difficulty('dots', d => { diff = d; start(); });
    }
  });

  /* ---------- Морской бой ---------- */
  Games.register({
    id: 'battleship', title: 'Морской бой', icon: '🚢', cat: 'board', desc: 'Потопи флот компьютера первым', bestLabel: 'Побед',
    mount(screen, api) {
      const { h } = api; const N = 10; let my, ai, myShots, aiShots, over, cells, aiCells, st = stats(api, 'battleship'), aiQueue = [], hdr, diff = 1;
      function place() { const g = Array(100).fill(0); for (const len of [4, 3, 3, 2, 2, 2, 1, 1, 1, 1]) { for (let t = 0; t < 500; t++) { const d = Math.random() < .5; const r = api.rand(0, N - (d ? len : 1)), c = api.rand(0, N - (d ? 1 : len)); let ok = true; for (let i = 0; i < len && ok; i++) { const rr = r + (d ? i : 0), cc = c + (d ? 0 : i); for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { const r2 = rr + dr, c2 = cc + dc; if (r2 >= 0 && c2 >= 0 && r2 < N && c2 < N && g[r2 * N + c2]) ok = false; } } if (!ok) continue; for (let i = 0; i < len; i++) g[(r + (d ? i : 0)) * N + c + (d ? 0 : i)] = len; break; } } return g; }
      function start() { my = place(); ai = place(); myShots = Array(100).fill(0); aiShots = Array(100).fill(0); over = false; aiQueue = []; render(); }
      function render() {
        screen.innerHTML = ''; hdr = api.header(screen, [{ label: 'ПК', value: 20 }, { label: 'Вы', value: 20 }, { label: '', value: st.s.w + ' · ' + st.s.l }]);
        const size = cellSize(screen, N, 360); const g = gridEl(h, N, size); cells = [];
        for (let i = 0; i < 100; i++) { const c = h('div', { class: 'pz-cell sea', onclick: () => shoot(i) }); cells.push(c); g.append(c); }
        const size2 = Math.floor(size * 0.55); const g2 = gridEl(h, N, size2); aiCells = [];
        for (let i = 0; i < 100; i++) { const c = h('div', { class: 'pz-cell sea small' }); aiCells.push(c); g2.append(c); }
        screen.append(h('div', { class: 'game-area', style: 'justify-content:flex-start;gap:8px;overflow:auto' }, h('div', { class: 'hint-text' }, 'Поле противника — стреляйте'), g, h('div', { class: 'hint-text' }, 'Ваше поле'), g2)); paint();
      }
      function paint() {
        cells.forEach((c, i) => { c.textContent = myShots[i] ? (ai[i] ? '💥' : '·') : ''; c.classList.toggle('hit', !!(myShots[i] && ai[i])); });
        aiCells.forEach((c, i) => { c.style.background = my[i] ? (aiShots[i] ? '#7f1d1d' : '#3b3b6b') : aiShots[i] ? '#1a1a2e' : ''; c.textContent = aiShots[i] && !my[i] ? '·' : ''; });
        hdr.set(0, ai.filter((v, i) => v && !myShots[i]).length); hdr.set(1, my.filter((v, i) => v && !aiShots[i]).length);
      }
      function shoot(i) {
        if (over || myShots[i]) return; myShots[i] = 1; api.sound(ai[i] ? 'boom' : 'tap'); api.vibrate(ai[i] ? 30 : 6); paint();
        if (!ai.some((v, k) => v && !myShots[k])) { over = true; st.win(); api.end({ title: 'Флот противника потоплен!', reward: 40, onAgain: start }); return; }
        if (!ai[i]) setTimeout(aiTurn, 400);
      }
      function aiTurn() {
        if (over) return; let i; if (aiQueue.length && diff > 0) i = aiQueue.shift(); else { const cand = [...Array(100).keys()].filter(k => !aiShots[k] && (diff < 2 || (Math.floor(k / N) + k % N) % 2 === 0)); const pool = cand.length ? cand : [...Array(100).keys()].filter(k => !aiShots[k]); i = pool[api.rand(0, pool.length - 1)]; }
        if (aiShots[i]) { aiTurn(); return; } aiShots[i] = 1;
        if (my[i]) { const r = Math.floor(i / N), c = i % N; let nb = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]; if (diff === 2) { const hitN = [[r - 1, c], [r + 1, c]].some(([rr, cc]) => rr >= 0 && rr < N && aiShots[rr * N + cc] && my[rr * N + cc]); const hitW = [[r, c - 1], [r, c + 1]].some(([rr, cc]) => cc >= 0 && cc < N && aiShots[rr * N + cc] && my[rr * N + cc]); if (hitN) nb = [[r - 1, c], [r + 1, c]]; else if (hitW) nb = [[r, c - 1], [r, c + 1]]; } nb.forEach(([rr, cc]) => { if (rr >= 0 && cc >= 0 && rr < N && cc < N && !aiShots[rr * N + cc]) aiQueue.unshift(rr * N + cc); }); api.sound('bad'); }
        paint();
        if (!my.some((v, k) => v && !aiShots[k])) { over = true; st.lose(); api.end({ win: false, title: 'Ваш флот потоплен', onAgain: start }); return; }
        if (my[i]) setTimeout(aiTurn, 400);
      }
      api.difficulty('battleship', d => { diff = d; start(); });
    }
  });

  /* ---------- Шашки ---------- */
  Games.register({
    id: 'checkers', title: 'Шашки', icon: '🏁', cat: 'board', desc: 'Русские шашки против компьютера', bestLabel: 'Побед',
    mount(screen, api) {
      const { h } = api; const N = 8; let b, sel = -1, cells, over, st = stats(api, 'checkers'), mustFrom = -1, diff = 1;
      // 1 — игрок (снизу), 2 — ПК; +10 дамка
      function start() { b = Array(64).fill(0); for (let i = 0; i < 64; i++) { const r = Math.floor(i / 8), c = i % 8; if ((r + c) % 2 === 1) { if (r < 3) b[i] = 2; if (r > 4) b[i] = 1; } } sel = -1; over = false; mustFrom = -1; render(); }
      const own = (v, p) => v && v % 10 === p; const king = v => v >= 10;
      function movesFor(g, i, p) { // возвращает [{to, cap}]
        const v = g[i]; if (!own(v, p)) return []; const r = Math.floor(i / 8), c = i % 8; const out = []; const dirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        for (const [dr, dc] of dirs) {
          if (king(v)) { let rr = r + dr, cc = c + dc, seen = -1; while (rr >= 0 && cc >= 0 && rr < 8 && cc < 8) { const k = rr * 8 + cc; if (!g[k]) { out.push({ to: k, cap: seen }); } else if (seen < 0 && own(g[k], 3 - p)) seen = k; else break; rr += dr; cc += dc; } }
          else { const fwd = p === 1 ? -1 : 1; const rr = r + dr, cc = c + dc; if (rr < 0 || cc < 0 || rr > 7 || cc > 7) continue; const k = rr * 8 + cc; if (!g[k] && dr === fwd) out.push({ to: k, cap: -1 }); else if (own(g[k], 3 - p)) { const r2 = rr + dr, c2 = cc + dc; if (r2 >= 0 && c2 >= 0 && r2 < 8 && c2 < 8 && !g[r2 * 8 + c2]) out.push({ to: r2 * 8 + c2, cap: k }); } }
        }
        return out;
      }
      function legal(g, p, from) { let all = []; const src = from >= 0 ? [from] : [...Array(64).keys()]; for (const i of src) movesFor(g, i, p).forEach(m => all.push({ from: i, ...m })); const caps = all.filter(m => m.cap >= 0); return caps.length ? caps : (from >= 0 ? [] : all); }
      function apply(g, m) { const v = g[m.from]; g[m.from] = 0; if (m.cap >= 0) g[m.cap] = 0; const r = Math.floor(m.to / 8); g[m.to] = (!king(v) && ((v === 1 && r === 0) || (v === 2 && r === 7))) ? v + 10 : v; }
      function render() { screen.innerHTML = ''; api.header(screen, [{ label: '', value: st.txt() }, { btn: '↻', onClick: start }]); const size = cellSize(screen, N, 400); const g = gridEl(h, N, size); cells = []; for (let i = 0; i < 64; i++) { const c = h('div', { class: 'pz-cell', style: 'background:' + ((Math.floor(i / 8) + i) % 2 ? '#3b2f6d' : '#c9b8ff'), onclick: () => tap(i) }); cells.push(c); g.append(c); } screen.append(h('div', { class: 'game-area' }, g, h('div', { class: 'hint-text' }, 'Вы — белые. Бить обязательно'))); paint(); }
      function paint() { const lm = over ? [] : legal(b, 1, mustFrom); cells.forEach((c, i) => { c.innerHTML = ''; c.style.outline = i === sel ? '3px solid #22d3ee' : lm.some(m => m.from === sel && m.to === i) ? '3px solid #34d399' : ''; if (b[i]) c.append(h('div', { class: 'disc', style: 'background:' + (b[i] % 10 === 1 ? '#eee' : '#111') + ';color:' + (b[i] % 10 === 1 ? '#111' : '#eee') }, king(b[i]) ? '♛' : '')); }); }
      function tap(i) {
        if (over) return; const lm = legal(b, 1, mustFrom);
        const m = lm.find(x => x.from === sel && x.to === i);
        if (m) { apply(b, m); api.sound('tap'); api.vibrate(8); if (m.cap >= 0 && legal(b, 1, m.to).some(x => x.cap >= 0)) { mustFrom = m.to; sel = m.to; paint(); return; } mustFrom = -1; sel = -1; paint(); if (!end()) setTimeout(aiTurn, 400); return; }
        if (own(b[i], 1) && lm.some(x => x.from === i)) { sel = i; paint(); }
      }
      function aiTurn() {
        if (over) return; let from = -1;
        const evalG = g => g.reduce((s, v) => s + (v ? (v % 10 === 2 ? 1 : -1) * (king(v) ? 3 : 1) : 0), 0); const search = (g, pl, depth) => { const lm = legal(g, pl, -1); if (!depth || !lm.length) return evalG(g) + (lm.length ? 0 : (pl === 2 ? -50 : 50)); let best = pl === 2 ? -Infinity : Infinity; for (const m of lm) { const g2 = g.slice(); apply(g2, m); const v = search(g2, 3 - pl, depth - 1); best = pl === 2 ? Math.max(best, v) : Math.min(best, v); } return best; };
        while (true) { const lm = legal(b, 2, from); if (!lm.length) break; let best = lm[0], bv = -Infinity; for (const m of lm) { const g = b.slice(); apply(g, m); let v; if (diff === 0) v = Math.random() * 10 + (m.cap >= 0 ? 3 : 0); else if (diff === 1) { v = (m.cap >= 0 ? 10 : 0) + Math.random() * 2 + (Math.floor(m.to / 8) === 7 ? 5 : 0); const reply = legal(g, 1, -1).filter(x => x.cap >= 0); v -= reply.length * 6; } else v = search(g, 1, 3) + Math.random() * 0.1; if (v > bv) { bv = v; best = m; } } apply(b, best); if (best.cap >= 0 && legal(b, 2, best.to).some(x => x.cap >= 0)) { from = best.to; continue; } break; }
        api.sound('select'); paint(); end();
      }
      function end() { const me = b.some(v => own(v, 1)), pc = b.some(v => own(v, 2)); const myMoves = legal(b, 1, -1).length; if (!pc || (me && !legal(b, 2, -1).length)) { over = true; st.win(); api.end({ title: 'Победа!', reward: 40, onAgain: start }); return true; } if (!me || !myMoves) { over = true; st.lose(); api.end({ win: false, title: 'Поражение', onAgain: start }); return true; } return false; }
      api.difficulty('checkers', d => { diff = d; start(); });
    }
  });

  /* ---------- Блэкджек (21) ---------- */
  Games.register({
    id: 'blackjack', title: 'Двадцать одно', icon: '🃏', cat: 'board', desc: 'Набери 21 очко, не перебрав', bestLabel: 'Побед',
    mount(screen, api) {
      const { h } = api; const SUITS = ['♠', '♥', '♦', '♣'], R = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']; let deck, me, pc, over, bet, st = stats(api, 'blackjack');
      const val = hand => { let s = 0, a = 0; for (const c of hand) { if (c.r === 'A') { a++; s += 11; } else if ('JQK'.includes(c.r)) s += 10; else s += +c.r; } while (s > 21 && a) { s -= 10; a--; } return s; };
      const card = c => h('div', { class: 'card-face', style: 'color:' + ('♥♦'.includes(c.s) ? '#f87171' : '#fff') }, c.r + c.s);
      function start() { deck = api.shuffle(SUITS.flatMap(s => R.map(r => ({ r, s })))); me = [deck.pop(), deck.pop()]; pc = [deck.pop(), deck.pop()]; over = false; bet = 10; if (api.coins < bet) bet = 0; else api.spend(bet); render(); if (val(me) === 21) stand(); }
      function render() {
        screen.innerHTML = ''; api.header(screen, [{ label: 'Ставка', value: bet }, { label: '', value: st.txt() }]);
        screen.append(h('div', { class: 'game-area', style: 'gap:20px' },
          h('div', { class: 'hint-text' }, 'Дилер: ' + (over ? val(pc) : '?')), h('div', { class: 'row' }, pc.map((c, i) => over || i === 0 ? card(c) : h('div', { class: 'card-face' }, '🂠'))),
          h('div', { class: 'hint-text' }, 'Вы: ' + val(me)), h('div', { class: 'row' }, me.map(card))));
        screen.append(h('div', { class: 'bottom-bar row' }, h('button', { class: 'btn primary', disabled: over ? '' : null, onclick: hit }, 'Ещё карту'), h('button', { class: 'btn', disabled: over ? '' : null, onclick: stand }, 'Хватит')));
        if (over) { screen.querySelectorAll('.bottom-bar .btn').forEach(b => b.disabled = true); }
      }
      function hit() { if (over) return; me.push(deck.pop()); api.sound('tap'); if (val(me) > 21) finish(); else render(); }
      function stand() { if (over) return; while (val(pc) < 17) pc.push(deck.pop()); finish(); }
      function finish() { over = true; render(); const m = val(me), d = val(pc); let title, reward = 0, win = null; if (m > 21) { title = 'Перебор!'; win = false; } else if (d > 21 || m > d) { title = 'Вы выиграли!'; reward = bet * 2 + (m === 21 && me.length === 2 ? 5 : 0); } else if (m === d) { title = 'Ничья'; reward = bet; } else { title = 'Дилер выиграл'; win = false; } if (win === false) st.lose(); else if (reward > bet) st.win(); api.end({ win, title, reward, text: `Вы ${m} — дилер ${d}`, onAgain: start }); }
      start();
    }
  });

  /* ---------- Кости ---------- */
  Games.register({
    id: 'dice', title: 'Кости', icon: '🎲', cat: 'board', desc: 'Три броска, выбирай комбинации и набирай очки', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; const CATS = [['Единицы', d => d.filter(x => x === 1).length * 1], ['Двойки', d => d.filter(x => x === 2).length * 2], ['Тройки', d => d.filter(x => x === 3).length * 3], ['Четвёрки', d => d.filter(x => x === 4).length * 4], ['Пятёрки', d => d.filter(x => x === 5).length * 5], ['Шестёрки', d => d.filter(x => x === 6).length * 6],
        ['Тройка одинаковых', d => cnt(d).some(c => c >= 3) ? sum(d) : 0], ['Каре', d => cnt(d).some(c => c >= 4) ? sum(d) : 0], ['Фулл-хаус', d => { const c = cnt(d).filter(Boolean).sort(); return c.length === 2 && c[0] === 2 ? 25 : 0; }], ['Малый стрит', d => /1234|2345|3456/.test([...new Set(d)].sort().join('')) ? 30 : 0], ['Большой стрит', d => /12345|23456/.test([...new Set(d)].sort().join('')) ? 40 : 0], ['Покер', d => cnt(d).some(c => c === 5) ? 50 : 0], ['Шанс', d => sum(d)]];
      const sum = d => d.reduce((a, b) => a + b, 0); const cnt = d => { const c = Array(7).fill(0); d.forEach(x => c[x]++); return c; };
      let dice, held, rolls, used, total;
      function start() { used = {}; total = 0; newTurn(); }
      function newTurn() { dice = [1, 1, 1, 1, 1].map(() => api.rand(1, 6)); held = [0, 0, 0, 0, 0]; rolls = 1; render(); }
      function render() {
        screen.innerHTML = ''; api.header(screen, [{ label: 'Очки', value: total }, { label: 'Бросок', value: rolls + '/3' }, { label: 'Рекорд', value: api.bestOf('dice') || 0 }]);
        const d = h('div', { class: 'row' }, dice.map((v, i) => h('div', { class: 'die' + (held[i] ? ' held' : ''), onclick: () => { held[i] ^= 1; api.sound('tap'); render(); } }, '⚀⚁⚂⚃⚄⚅'[v - 1])));
        const list = h('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:6px;width:100%' }, CATS.map(([n, f], i) => h('button', { class: 'btn small', style: 'justify-content:space-between;' + (used[i] != null ? 'opacity:.4' : ''), disabled: used[i] != null ? '' : null, onclick: () => choose(i) }, n, h('b', null, used[i] != null ? used[i] : f(dice)))));
        screen.append(h('div', { class: 'game-area', style: 'justify-content:flex-start;gap:10px;overflow:auto' }, d, h('button', { class: 'btn primary', disabled: rolls >= 3 ? '' : null, onclick: roll }, '🎲 Перебросить'), list));
      }
      function roll() { if (rolls >= 3) return; rolls++; dice = dice.map((v, i) => held[i] ? v : api.rand(1, 6)); api.sound('select'); api.vibrate(10); render(); }
      function choose(i) { if (used[i] != null) return; used[i] = CATS[i][1](dice); total += used[i]; api.sound(used[i] ? 'good' : 'bad'); if (Object.keys(used).length === CATS.length) { const upper = [0, 1, 2, 3, 4, 5].reduce((s, k) => s + used[k], 0); if (upper >= 63) total += 35; api.best('dice', total); api.end({ title: 'Итог: ' + total, reward: Math.floor(total / 10), onAgain: start }); return; } newTurn(); }
      start();
    }
  });

  /* ---------- Больше-меньше ---------- */
  Games.register({
    id: 'hilo', title: 'Больше или меньше', icon: '🎴', cat: 'board', desc: 'Угадай, следующая карта выше или ниже', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; const R = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'], S = ['♠', '♥', '♦', '♣']; let deck, cur, streak;
      function start() { deck = api.shuffle(S.flatMap(s => R.map((r, i) => ({ r, s, v: i })))); cur = deck.pop(); streak = 0; render(); }
      function render() { screen.innerHTML = ''; api.header(screen, [{ label: 'Серия', value: streak }, { label: 'Осталось', value: deck.length }, { label: 'Рекорд', value: api.bestOf('hilo') || 0 }]); screen.append(h('div', { class: 'game-area', style: 'gap:24px' }, h('div', { class: 'card-face big', style: 'color:' + ('♥♦'.includes(cur.s) ? '#f87171' : '#fff') }, cur.r + cur.s), h('div', { class: 'row' }, h('button', { class: 'btn primary', style: 'font-size:18px', onclick: () => guess(1) }, '▲ Выше'), h('button', { class: 'btn primary', style: 'font-size:18px', onclick: () => guess(-1) }, '▼ Ниже')), h('button', { class: 'btn gold', onclick: cash }, 'Забрать ' + Math.floor(streak * 1.5) + ' ●'))); }
      function guess(d) { const nx = deck.pop(); const ok = d > 0 ? nx.v > cur.v : nx.v < cur.v; const tie = nx.v === cur.v; cur = nx; if (ok || tie) { streak++; api.sound('good'); api.vibrate(8); api.best('hilo', streak); if (!deck.length) cash(); else render(); } else { api.best('hilo', streak); api.end({ win: false, title: 'Не угадали: ' + nx.r + nx.s, text: 'Серия: ' + streak, onAgain: start }); } }
      function cash() { api.end({ title: 'Серия ' + streak, reward: Math.floor(streak * 1.5), onAgain: start }); }
      start();
    }
  });

  /* ---------- Камень-ножницы-бумага ---------- */
  Games.register({
    id: 'rps', title: 'Камень-ножницы', icon: '✂️', cat: 'board', desc: 'До 5 побед. Компьютер учится на ваших ходах', bestLabel: 'Побед',
    mount(screen, api) {
      const { h } = api; const OPT = ['✊', '✌️', '✋']; let me, pc, hist = [], last = '', st = stats(api, 'rps'), diff = 1;
      function start() { me = 0; pc = 0; hist = []; last = ''; render(); }
      function render() { screen.innerHTML = ''; api.header(screen, [{ label: 'Вы', value: me }, { label: 'ПК', value: pc }, { label: '', value: st.txt() }]); screen.append(h('div', { class: 'game-area', style: 'gap:24px' }, h('div', { style: 'font-size:60px;height:80px' }, last), h('div', { class: 'row' }, OPT.map((o, i) => h('button', { class: 'btn', style: 'font-size:44px;padding:14px 20px', onclick: () => play(i) }, o))))); }
      function play(i) {
        // ПК: предсказывает по частоте прошлых ходов, бьёт самый частый
        let ai; if (diff === 0) { ai = Math.random() < 0.5 ? (i + 1) % 3 : api.rand(0, 2); } else if (hist.length >= (diff === 2 ? 2 : 3) && Math.random() < (diff === 2 ? 0.9 : 0.6)) { const c = [0, 0, 0]; hist.slice(-6).forEach(x => c[x]++); if (diff === 2) c[hist[hist.length - 1]] += 1.5; const likely = c.indexOf(Math.max(...c)); ai = (likely + 2) % 3; } else ai = api.rand(0, 2);
        hist.push(i); const res = (i - ai + 3) % 3; // 0 ничья, 2 победа игрока (камень бьёт ножницы: 0-1=-1→2)
        last = OPT[i] + ' vs ' + OPT[ai]; if (res === 2) { me++; api.sound('good'); } else if (res === 1) { pc++; api.sound('bad'); } else api.sound('tap');
        render(); if (me >= 5) { st.win(); api.end({ title: 'Победа 5:' + pc + '!', reward: 15, onAgain: start }); } else if (pc >= 5) { st.lose(); api.end({ win: false, title: 'Поражение ' + me + ':5', onAgain: start }); }
      }
      api.difficulty('rps', d => { diff = d; start(); });
    }
  });

  /* ---------- Ним ---------- */
  Games.register({
    id: 'nim', title: 'Ним', icon: '🥢', cat: 'board', desc: 'Бери 1–3 палочки. Кто берёт последнюю — проиграл', bestLabel: 'Побед',
    mount(screen, api) {
      const { h } = api; let n, st = stats(api, 'nim'), over, diff = 1, busy;
      function start() { n = api.rand(15, 25); over = false; busy = false; render(); }
      function render() { screen.innerHTML = ''; api.header(screen, [{ label: 'Палочек', value: n }, { label: '', value: st.txt() }]); screen.append(h('div', { class: 'game-area', style: 'gap:24px' }, h('div', { style: 'font-size:28px;letter-spacing:4px;text-align:center;line-height:1.4;max-width:320px' }, '🥢'.repeat(Math.max(0, n))), h('div', { class: 'row' }, [1, 2, 3].map(k => h('button', { class: 'btn primary', style: 'font-size:20px;padding:14px 22px', disabled: k > n || over || busy ? '' : null, onclick: () => take(k) }, 'Взять ' + k))))); }
      function take(k) { if (over || busy || k > n) return; n -= k; api.sound('tap'); if (n <= 0) { over = true; st.lose(); render(); api.end({ win: false, title: 'Вы взяли последнюю', onAgain: start }); return; } busy = true; render(); setTimeout(() => { busy = false; let t = (n - 1) % 4; if (t === 0 || diff === 0 || (diff === 1 && Math.random() < 0.35)) t = api.rand(1, Math.min(3, n)); n -= t; api.sound('select'); if (n <= 0) { over = true; st.win(); render(); api.end({ title: 'Компьютер взял последнюю — победа!', reward: 15, onAgain: start }); } else render(); }, 500); }
      api.difficulty('nim', d => { diff = d; start(); });
    }
  });
})();
