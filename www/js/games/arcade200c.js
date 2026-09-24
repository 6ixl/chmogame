/* Аркады, часть C (пакет 200+) */
(function () {
  const K = window.Kit; const { rr, circ, text, emoji, bg, over, clamp } = K;

  /* ---------- Пчёлка ---------- */
  Games.register({ id: 'bee', title: 'Пчёлка', icon: '🐝', cat: 'arcade', desc: 'Собирай пыльцу с цветов и неси в улей. Осы опасны!', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 560, HIVE = { x: 40, y: 50 }; let b, flowers, wasps, load, honey, alive, t;
      function reset() { b = { x: W / 2, y: H / 2 }; a.tx = b.x; a.ty = b.y; flowers = []; for (let i = 0; i < 6; i++) flowers.push({ x: api.rand(40, W - 40), y: api.rand(200, H - 30), p: 1 }); wasps = [{ x: W - 40, y: 120, vx: 80, vy: 60 }]; load = 0; honey = 0; alive = true; t = 0; a.hdr.set(0, 0); a.hdr.set(1, '0/5'); }
      const a = { tx: 0, ty: 0 };
      Object.assign(a, api.arcade(screen, { w: W, h: H, stats: [{ label: 'Мёд', value: 0 }, { label: 'Пыльца', value: '0/5' }, { label: 'Рекорд', value: api.bestOf('bee') || 0 }], hint: 'Ведите пальцем. Полная пчёлка медленнее',
        onDown: p => { a.tx = p.x; a.ty = p.y; a.d = true; }, onMove: p => { if (a.d) { a.tx = p.x; a.ty = p.y; } }, onUp: () => a.d = false,
        frame(dt, ctx) {
          if (alive) { t += dt; const sp = 9 - load * 1.1; b.x += (a.tx - b.x) * Math.min(1, dt * sp); b.y += (a.ty - b.y) * Math.min(1, dt * sp); flowers.forEach(f => { f.p = Math.min(1, f.p + dt * 0.15); if (f.p >= 1 && load < 5 && Math.hypot(f.x - b.x, f.y - b.y) < 22) { f.p = 0; load++; api.sound('tap'); a.hdr.set(1, load + '/5'); } }); if (load && Math.hypot(HIVE.x - b.x, HIVE.y - b.y) < 36) { honey += load * load; load = 0; api.sound('coin'); a.hdr.set(0, honey); a.hdr.set(1, '0/5'); if (honey >= 50 * (wasps.length)) { wasps.push({ x: W - 30, y: H - 30, vx: -90, vy: -70 }); api.addCoins(3); } }
            wasps.forEach(w => { const dx = b.x - w.x, dy = b.y - w.y, d = Math.hypot(dx, dy); w.vx += dx / d * 60 * dt; w.vy += dy / d * 60 * dt; const s = Math.hypot(w.vx, w.vy), mx = 110 + t; if (s > mx) { w.vx *= mx / s; w.vy *= mx / s; } w.x += w.vx * dt; w.y += w.vy * dt; if (w.x < 10 || w.x > W - 10) w.vx *= -1; if (w.y < 10 || w.y > H - 10) w.vy *= -1; if (d < 22) { alive = false; api.sound('boom'); over(api, 'bee', honey, 'Ужалила оса!', 5, reset); } if (Math.hypot(w.x - HIVE.x, w.y - HIVE.y) < 50) { w.vx += 40; w.vy += 40; } }); }
          bg(ctx, W, H, '#4d7c0f'); for (let i = 0; i < 40; i++) rr(ctx, (i * 53) % W, (i * 97) % H, 3, 10, 1, '#65a30d'); emoji(ctx, '🍯', HIVE.x, HIVE.y, 48); flowers.forEach(f => { ctx.globalAlpha = 0.4 + f.p * 0.6; emoji(ctx, '🌼', f.x, f.y, 34); ctx.globalAlpha = 1; if (f.p >= 1) circ(ctx, f.x, f.y - 22, 3, '#fde047'); }); wasps.forEach(w => emoji(ctx, '🦟', w.x, w.y, 28)); emoji(ctx, '🐝', b.x, b.y, 30); for (let i = 0; i < load; i++) circ(ctx, b.x - 10 + i * 5, b.y + 18, 2.5, '#fde047');
        } }));
      this.unmount = a.stop; reset();
    } });

  /* ---------- Сквош ---------- */
  Games.register({ id: 'squash', title: 'Сквош', icon: '🎾', cat: 'arcade', desc: 'Мяч отскакивает от трёх стен — не дай ему упасть', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 560, PW = 80; let px, b, score, alive, lives;
      function reset() { px = W / 2; a.tx = px; b = { x: W / 2, y: 200, vx: 170, vy: 220 }; score = 0; lives = 3; alive = true; a.hdr.set(0, 0); a.hdr.set(1, '❤❤❤'); }
      const a = { tx: 0 };
      Object.assign(a, api.arcade(screen, { w: W, h: H, stats: [{ label: 'Удары', value: 0 }, { label: '❤', value: '❤❤❤' }, { label: 'Рекорд', value: api.bestOf('squash') || 0 }], hint: 'Двигайте ракетку пальцем',
        onDown: p => a.tx = p.x, onMove: (p, e) => { if (e.buttons || e.pointerType === 'touch') a.tx = p.x; }, onKey: e => { if (e.key === 'ArrowLeft') a.tx = px - 60; if (e.key === 'ArrowRight') a.tx = px + 60; },
        frame(dt, ctx) {
          if (alive) { px += (clamp(a.tx, PW / 2, W - PW / 2) - px) * Math.min(1, dt * 18); for (let s = 0; s < 2; s++) { const sd = dt / 2; b.x += b.vx * sd; b.y += b.vy * sd; if (b.x < 18) { b.x = 18; b.vx = Math.abs(b.vx); api.sound('tap'); } if (b.x > W - 18) { b.x = W - 18; b.vx = -Math.abs(b.vx); api.sound('tap'); } if (b.y < 18) { b.y = 18; b.vy = Math.abs(b.vy); api.sound('tap'); } if (b.vy > 0 && b.y > H - 52 && b.y < H - 36 && Math.abs(b.x - px) < PW / 2 + 8) { b.vy = -Math.abs(b.vy) * 1.03; b.vx += (b.x - px) * 4; b.vx = clamp(b.vx, -420, 420); score++; a.hdr.set(0, score); api.sound('select'); api.vibrate(8); if (score % 20 === 0) api.addCoins(3); } if (b.y > H + 20) { lives--; a.hdr.set(1, '❤'.repeat(Math.max(0, lives))); api.sound('bad'); if (lives <= 0) { alive = false; over(api, 'squash', score, 'Мяч упал', 4, reset); } else b = { x: W / 2, y: 200, vx: api.rand(0, 1) ? 170 : -170, vy: 220 + score * 3 }; break; } } }
          bg(ctx, W, H, '#1e293b'); rr(ctx, 0, 0, W, 12, 0, '#ef4444'); rr(ctx, 0, 0, 12, H, 0, '#475569'); rr(ctx, W - 12, 0, 12, H, 0, '#475569'); K.line(ctx, 12, 240, W - 12, 240, '#334155', 2); circ(ctx, b.x, b.y, 9, '#fbbf24'); rr(ctx, px - PW / 2, H - 44, PW, 12, 6, '#22d3ee');
        } }));
      this.unmount = a.stop; reset();
    } });

  /* ---------- Палка-мост ---------- */
  Games.register({ id: 'stickhero', title: 'Палка-мост', icon: '🦯', cat: 'arcade', desc: 'Держи палец — палка растёт. Отпусти, чтобы перекинуть мост до следующей колонны', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 520, TOP = 340; let cols, stick, state, hx, score, off, fallA, perfect;
      function reset() { cols = [{ x: 30, w: 70 }]; addCol(); stick = 0; state = 'idle'; hx = 30 + 70 - 16; score = 0; off = 0; fallA = 0; a.hdr.set(0, 0); }
      const addCol = () => { const l = cols[cols.length - 1]; const w = api.rand(Math.max(18, 60 - score * 2), Math.max(30, 90 - score * 2)); cols.push({ x: l.x + l.w + api.rand(40, 170), w }); };
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Колонн', value: 0 }, { label: 'Рекорд', value: api.bestOf('stickhero') || 0 }], hint: 'Держите — растёт, отпустите — падает',
        onDown: () => { if (state === 'idle') { state = 'grow'; stick = 0; } }, onUp: () => { if (state === 'grow') { state = 'rot'; fallA = 0; api.sound('tap'); } },
        frame(dt, ctx) {
          const cur = cols[cols.length - 2], nxt = cols[cols.length - 1]; const base = cur.x + cur.w;
          if (state === 'grow') stick += 260 * dt; if (state === 'rot') { fallA += dt * 5; if (fallA >= Math.PI / 2) { fallA = Math.PI / 2; const end = base + stick; const ok = end >= nxt.x && end <= nxt.x + nxt.w; perfect = ok && Math.abs(end - (nxt.x + nxt.w / 2)) < 6; state = ok ? 'walk' : 'walkfail'; } }
          if (state === 'walk' || state === 'walkfail') { hx += 220 * dt; const target = state === 'walk' ? nxt.x + nxt.w - 16 : base + stick; if (hx >= target) { hx = target; if (state === 'walk') { score += perfect ? 2 : 1; a.hdr.set(0, score); api.sound(perfect ? 'win' : 'good'); if (perfect) api.toast('Идеально! +2'); if (score % 10 === 0) api.addCoins(3); state = 'shift'; } else { state = 'fall'; api.sound('boom'); } } }
          if (state === 'shift') { const dx = Math.min(300 * dt, nxt.x - 30); cols.forEach(c => c.x -= dx); hx -= dx; if (nxt.x <= 30.5) { cols = cols.slice(-1); addCol(); stick = 0; fallA = 0; state = 'idle'; } }
          if (state === 'fall') { off += 500 * dt; if (off > 250) { state = 'dead'; over(api, 'stickhero', score, 'Не дотянулись', 2, reset); } }
          const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#fcd34d'); g.addColorStop(1, '#fb923c'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
          cols.forEach(c => { rr(ctx, c.x, TOP, c.w, H - TOP, 0, '#1c1917'); rr(ctx, c.x + c.w / 2 - 4, TOP, 8, 4, 0, '#ef4444'); });
          if (stick > 0 && state !== 'shift' || state === 'shift') { ctx.save(); ctx.translate(state === 'shift' ? cur.x + cur.w : base, TOP); ctx.rotate(state === 'grow' || state === 'idle' ? -Math.PI / 2 : -Math.PI / 2 + fallA); rr(ctx, 0, -2, stick, 4, 2, '#78350f'); ctx.restore(); }
          emoji(ctx, '🥷', hx, TOP - 14 + off, 28);
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Боксёр ---------- */
  Games.register({ id: 'boxer', title: 'Боксёр', icon: '🥊', cat: 'arcade', desc: 'Уклоняйся от ударов и бей в ответ, когда соперник открылся', bestLabel: 'Побед',
    mount(screen, api) {
      const { h } = api; const W = 360, H = 420; let me, opp, state, tt, dodge, round, st = K.stats(api, 'boxer'), msg, lvl, stun;
      function reset() { me = 100; opp = 100; lvl = 1; next(); msg = 'Соперник замахивается — уклоняйтесь в сторону!'; }
      function next() { state = 'wait'; tt = api.rand(6, 14) / 10 / (1 + lvl * 0.08); dodge = 0; stun = 0; }
      const act = k => { if (k === 'hit') { if (state === 'open') { opp -= 12 + Math.random() * 6; api.sound('good'); api.vibrate(20); msg = 'Попали!'; if (opp <= 0) { st.win(); a.hdr.set(1, st.txt()); state = 'ko'; api.end({ title: 'Нокаут! Победа', reward: 25, onAgain: reset }); return; } } else if (state === 'wind') { me -= 5; msg = 'Нельзя бить в замах — получите встречный!'; api.sound('bad'); } } else dodge = k === 'l' ? -1 : 1; };
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Вы', value: 100 }, { label: 'П · П', value: st.txt() }], hint: 'Тап слева/справа — уклон, по центру — удар',
        onDown: p => { if (p.x < W * 0.3) act('l'); else if (p.x > W * 0.7) act('r'); else act('hit'); }, onKey: e => { if (e.key === 'ArrowLeft') act('l'); if (e.key === 'ArrowRight') act('r'); if (e.key === ' ' || e.key === 'ArrowUp') act('hit'); },
        frame(dt, ctx) {
          if (state !== 'ko' && me > 0) { tt -= dt; if (state === 'wait' && tt <= 0) { state = 'wind'; tt = Math.max(0.35, 0.8 - lvl * 0.04); a._side = Math.random() < 0.5 ? -1 : 1; } else if (state === 'wind' && tt <= 0) { if (dodge === -a._side || (dodge && Math.random() < 0.7)) { state = 'open'; tt = 0.9; msg = 'Уклонились! Бейте!'; api.sound('select'); } else { me -= 14; api.sound('bad'); api.vibrate(60); msg = 'Пропустили удар'; state = 'wait'; tt = 1; if (me <= 0) { st.lose(); a.hdr.set(1, st.txt()); api.end({ win: false, title: 'Нокаут…', onAgain: reset }); } } dodge = 0; } else if (state === 'open' && tt <= 0) { next(); lvl += 0.2; } a.hdr.set(0, Math.max(0, Math.round(me))); }
          bg(ctx, W, H, '#7f1d1d'); rr(ctx, 0, H - 80, W, 80, 0, '#1e3a8a'); for (let i = 0; i < 3; i++) K.line(ctx, 0, 60 + i * 30, W, 60 + i * 30, '#fca5a5', 3);
          const ox = W / 2 + (state === 'wind' ? a._side * 20 : 0); emoji(ctx, state === 'open' ? '😵' : state === 'wind' ? '😤' : '😠', ox, 170, 110); emoji(ctx, '🥊', ox + (state === 'wind' ? a._side * 70 : -60), state === 'wind' ? 220 : 240, 50); if (state !== 'wind') emoji(ctx, '🥊', ox + 60, 240, 50);
          const mx = W / 2 + dodge * 90; emoji(ctx, '🥊', mx - 40, H - 60, 56); emoji(ctx, '🥊', mx + 40, H - 60, 56);
          rr(ctx, 20, 20, 140, 12, 6, '#111'); rr(ctx, 20, 20, 140 * Math.max(0, opp) / 100, 12, 6, '#ef4444'); text(ctx, 'Соперник', 90, 44, 12, '#fff'); rr(ctx, W - 160, 20, 140, 12, 6, '#111'); rr(ctx, W - 160, 20, 140 * Math.max(0, me) / 100, 12, 6, '#22c55e'); text(ctx, 'Вы', W - 90, 44, 12, '#fff'); text(ctx, msg || '', W / 2, H - 100, 14, '#fde68a');
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Ксоникс ---------- */
  K.levelGame({ id: 'xonix', title: 'Ксоникс', icon: '🟦', cat: 'arcade', desc: 'Отрезай куски поля, проводя линии. Захвати 75%, не попавшись шарикам', reward: 8, play(c) {
    const { api, L } = c; const N = 40, M = 56, S = 7, W = N * S, H = M * S; let g, p, dir, trail, balls, lives = 3, acc = 0, hd;
    g = new Uint8Array(N * M); for (let y = 0; y < M; y++) for (let x = 0; x < N; x++) if (x < 2 || y < 2 || x >= N - 2 || y >= M - 2) g[y * N + x] = 1;
    p = { x: N >> 1, y: 0 }; dir = [0, 0]; trail = [];
    balls = [...Array(2 + Math.min(4, Math.floor(L.lvl / 2)))].map(() => ({ x: api.rand(5, N - 6) + .5, y: api.rand(5, M - 6) + .5, vx: Math.random() < .5 ? -1 : 1, vy: Math.random() < .5 ? -1 : 1 }));
    const pct = () => { let f = 0; for (let y = 2; y < M - 2; y++) for (let x = 2; x < N - 2; x++) if (g[y * N + x] === 1) f++; return Math.floor(f / ((N - 4) * (M - 4)) * 100); };
    const fill = () => { const reach = new Uint8Array(N * M); const st = []; balls.forEach(b => { const i = Math.floor(b.y) * N + Math.floor(b.x); if (!g[i]) { reach[i] = 1; st.push(i); } }); while (st.length) { const i = st.pop(); for (const j of [i - 1, i + 1, i - N, i + N]) if (j >= 0 && j < N * M && !g[j] && !reach[j]) { reach[j] = 1; st.push(j); } } for (let i = 0; i < N * M; i++) if (g[i] === 2 || (!g[i] && !reach[i])) g[i] = 1; trail = []; hd.set(1, pct() + '%'); api.sound('good'); if (pct() >= 75) c.win('Захвачено ' + pct() + '%'); };
    const die = () => { trail.forEach(i => g[i] = 0); trail = []; lives--; hd.set(2, '❤'.repeat(Math.max(0, lives))); api.sound('bad'); api.vibrate(60); p = { x: N >> 1, y: 0 }; dir = [0, 0]; if (lives <= 0) c.lose('Шарики победили'); };
    const setDir = d => { dir = d; };
    const a = api.arcade(c.screen, { w: W, h: H, stats: [{ label: 'Ур.', value: L.lvl + 1 }, { label: 'Захват', value: '0%' }, { label: 'Жизни', value: '❤❤❤' }], hint: 'Свайпами задайте направление. Вернитесь на синюю зону, чтобы отрезать кусок',
      onDown: q => a._s = q, onUp: q => { if (!a._s || q.x < 0) return; const dx = q.x - a._s.x, dy = q.y - a._s.y; a._s = null; if (Math.max(Math.abs(dx), Math.abs(dy)) < 12) return; setDir(Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]); }, onKey: e => { const m = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]; if (m) setDir(m); },
      frame(dt, ctx) {
        if (!c.solved) { acc += dt; while (acc > 0.045) { acc -= 0.045; if (dir[0] || dir[1]) { const nx = clamp(p.x + dir[0], 0, N - 1), ny = clamp(p.y + dir[1], 0, M - 1); const i = ny * N + nx; if (g[i] === 2) { die(); break; } p.x = nx; p.y = ny; if (!g[i]) { g[i] = 2; trail.push(i); } else if (trail.length) { fill(); dir = [0, 0]; } } }
          balls.forEach(b => { const sp = (10 + L.lvl) * dt; const tx = Math.floor(b.x + b.vx * sp * 3), ty = Math.floor(b.y); if (g[ty * N + tx] === 1) b.vx *= -1; else if (g[ty * N + tx] === 2) die(); const ux = Math.floor(b.x), uy = Math.floor(b.y + b.vy * sp * 3); if (g[uy * N + ux] === 1) b.vy *= -1; else if (g[uy * N + ux] === 2) die(); b.x += b.vx * sp; b.y += b.vy * sp; }); }
        bg(ctx, W, H, '#0b0b16'); for (let i = 0; i < N * M; i++) if (g[i]) { ctx.fillStyle = g[i] === 1 ? '#1d4ed8' : '#fbbf24'; ctx.fillRect(i % N * S, Math.floor(i / N) * S, S, S); } balls.forEach(b => circ(ctx, b.x * S, b.y * S, S * 0.8, '#f472b6')); rr(ctx, p.x * S - 1, p.y * S - 1, S + 2, S + 2, 2, '#fff');
      } });
    hd = a.hdr; c.unmount = a.stop;
  } });

  /* ---------- Пуё-пуё (Капли) ---------- */
  Games.register({ id: 'puyo', title: 'Капли', icon: '🫧', cat: 'arcade', desc: 'Пары цветных капель падают. 4 одного цвета рядом — лопаются. Цепочки дают бонус', bestLabel: 'Рекорд',
    mount(screen, api) {
      const C = 6, R = 12, S = 30, W = C * S, H = R * S; const COL = ['#ef4444', '#22c55e', '#3b82f6', '#eab308']; let g, pc, score, alive, t, resolving, fast;
      const at = (x, y) => (x < 0 || x >= C || y >= R) ? 9 : y < 0 ? 0 : g[y * C + x];
      function spawn() { pc = { x: 2, y: -1, r: 0, a: api.rand(1, 4), b: api.rand(1, 4) }; if (at(2, 0) || at(2, 1)) { alive = false; over(api, 'puyo', score, 'Поле заполнено', 150, reset); } }
      const cells = q => { const o = [[0, -1], [1, 0], [0, 1], [-1, 0]][q.r]; return [[q.x, q.y, q.a], [q.x + o[0], q.y + o[1], q.b]]; };
      const fits = q => cells(q).every(([x, y]) => !at(x, y));
      function reset() { g = Array(C * R).fill(0); score = 0; alive = true; t = 0; resolving = false; fast = false; spawn(); a.hdr.set(0, 0); }
      const move = (dx, dr) => { if (!alive || resolving) return; const q = Object.assign({}, pc, { x: pc.x + dx, r: (pc.r + dr + 4) % 4 }); if (fits(q)) pc = q; else if (dr) { for (const k of [-1, 1]) { const q2 = Object.assign({}, q, { x: q.x + k }); if (fits(q2)) { pc = q2; break; } } } };
      async function land() { cells(pc).forEach(([x, y, c]) => { if (y >= 0) g[y * C + x] = c; }); pc = null; resolving = true; let chain = 0; while (true) { for (let x = 0; x < C; x++) { const col = []; for (let y = R - 1; y >= 0; y--) if (g[y * C + x]) col.push(g[y * C + x]); for (let y = R - 1, k = 0; y >= 0; y--, k++) g[y * C + x] = col[k] || 0; } const kill = new Set(); const seen = new Set(); for (let i = 0; i < C * R; i++) { if (!g[i] || seen.has(i)) continue; const grp = [i], st = [i]; seen.add(i); while (st.length) { const k = st.pop(); const x = k % C; for (const j of [k - C, k + C, x ? k - 1 : -1, x < C - 1 ? k + 1 : -1]) if (j >= 0 && j < C * R && !seen.has(j) && g[j] === g[i]) { seen.add(j); grp.push(j); st.push(j); } } if (grp.length >= 4) grp.forEach(k => kill.add(k)); } if (!kill.size) break; chain++; await K.sleep(250); kill.forEach(k => g[k] = 0); score += kill.size * 10 * chain; a.hdr.set(0, score); api.sound(chain > 1 ? 'win' : 'good'); if (chain >= 3) api.addCoins(chain); } resolving = false; if (alive) spawn(); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Очки', value: 0 }, { label: 'Рекорд', value: api.bestOf('puyo') || 0 }], hint: 'Тап слева/справа — сдвиг, по центру — поворот, свайп вниз — сбросить',
        onDown: p => a._s = p, onUp: p => { if (!a._s || p.x < 0) return; const s = a._s; a._s = null; if (p.y - s.y > 40) { fast = true; return; } if (s.x < W / 3) move(-1, 0); else if (s.x > W * 2 / 3) move(1, 0); else move(0, 1); }, onKey: e => { if (e.key === 'ArrowLeft') move(-1, 0); if (e.key === 'ArrowRight') move(1, 0); if (e.key === 'ArrowUp') move(0, 1); if (e.key === 'ArrowDown') fast = true; },
        frame(dt, ctx) {
          if (alive && pc && !resolving) { t += dt; const step = fast ? 0.03 : Math.max(0.12, 0.5 - score / 8000); if (t > step) { t = 0; const q = Object.assign({}, pc, { y: pc.y + 1 }); if (fits(q)) pc = q; else { fast = false; land(); } } }
          bg(ctx, W, H, '#1e1b4b'); for (let i = 0; i < C * R; i++) if (g[i]) { circ(ctx, (i % C + .5) * S, (Math.floor(i / C) + .5) * S, S * 0.45, COL[g[i] - 1]); circ(ctx, (i % C + .35) * S, (Math.floor(i / C) + .35) * S, S * 0.1, '#fff8'); }
          if (pc) cells(pc).forEach(([x, y, c]) => { if (y >= 0) { circ(ctx, (x + .5) * S, (y + .5) * S, S * 0.45, COL[c - 1]); circ(ctx, (x + .35) * S, (y + .35) * S, S * 0.1, '#fff8'); } });
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Зума ---------- */
  Games.register({ id: 'zuma', title: 'Зума', icon: '🐸', cat: 'arcade', desc: 'Стреляй шариками в ползущую цепочку: три одного цвета — исчезают', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 560, R = 11, CX = W / 2, CY = H / 2 + 20; const COL = ['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#a855f7']; let path, chain, head, shot, next, cur, score, alive, speed, nCol, spawnLeft, aim = -Math.PI / 2;
      function buildPath() { path = []; for (let t = 0; t < 1; t += 0.0015) { const ang = t * Math.PI * 5.2; const r = 165 - t * 120; path.push([CX + Math.cos(ang) * r, CY + Math.sin(ang) * r * 1.2]); } const L = [0]; for (let i = 1; i < path.length; i++) L.push(L[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1])); path.L = L; }
      const posAt = d => { const L = path.L; if (d <= 0) return path[0]; let lo = 0, hi = L.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (L[m] < d) lo = m + 1; else hi = m; } return path[Math.min(lo, path.length - 1)]; };
      function reset() { buildPath(); chain = []; head = 0; score = 0; alive = true; speed = 30; nCol = 4; spawnLeft = 60; cur = api.rand(0, nCol - 1); next = api.rand(0, nCol - 1); shot = null; a.hdr.set(0, 0); }
      const matchCheck = i => { let l = i, r = i; const c = chain[i].c; while (l > 0 && chain[l - 1].c === c) l--; while (r < chain.length - 1 && chain[r + 1].c === c) r++; if (r - l + 1 >= 3) { chain.splice(l, r - l + 1); score += (r - l + 1) * 10; a.hdr.set(0, score); api.sound('good'); if (l > 0 && l < chain.length && chain[l - 1].c === chain[l].c) setTimeout(() => { if (chain[l]) matchCheck(l); }, 150); return true; } return false; };
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Очки', value: 0 }, { label: 'Рекорд', value: api.bestOf('zuma') || 0 }], hint: 'Тап — выстрел в точку. Тап по лягушке — поменять шарик',
        onDown: p => { if (!alive) return; if (Math.hypot(p.x - CX, p.y - CY) < 28) { [cur, next] = [next, cur]; api.sound('select'); return; } if (shot) return; aim = Math.atan2(p.y - CY, p.x - CX); shot = { x: CX, y: CY, vx: Math.cos(aim) * 700, vy: Math.sin(aim) * 700, c: cur }; cur = next; const present = [...new Set(chain.map(b => b.c))]; next = present.length ? K.pick(present) : api.rand(0, nCol - 1); api.sound('tap'); },
        frame(dt, ctx) {
          if (alive) { if (spawnLeft > 0 && (!chain.length || chain[chain.length - 1].d > R * 2)) { chain.push({ d: 0, c: api.rand(0, nCol - 1) }); spawnLeft--; } const lead = chain.length ? chain[0].d : 0; const sp = lead < 200 ? 90 : speed; if (chain.length) chain[chain.length - 1].d += sp * dt; for (let i = chain.length - 2; i >= 0; i--) { const want = chain[i + 1].d + R * 2; if (chain[i].d < want) chain[i].d = want; else chain[i].d += (want - chain[i].d) * Math.min(1, dt * 6); }
            if (chain.length && chain[0].d >= path.L[path.L.length - 1] - 5) { alive = false; api.sound('boom'); over(api, 'zuma', score, 'Шарики доползли до черепа', 30, reset); }
            if (shot) { shot.x += shot.vx * dt; shot.y += shot.vy * dt; const hit = chain.findIndex(b => { const [x, y] = posAt(b.d); return Math.hypot(x - shot.x, y - shot.y) < R * 2; }); if (hit >= 0) { chain.splice(hit, 0, { d: chain[hit].d + R, c: shot.c }); shot = null; if (!matchCheck(hit)) api.sound('select'); } else if (shot.x < -20 || shot.x > W + 20 || shot.y < -20 || shot.y > H + 20) shot = null; }
            if (!spawnLeft && !chain.length) { api.addCoins(10); api.sound('win'); spawnLeft = 60 + score / 20; speed += 6; nCol = Math.min(5, nCol + 1); } }
          bg(ctx, W, H, '#14532d'); ctx.strokeStyle = '#3f6212'; ctx.lineWidth = R * 2 + 6; ctx.lineCap = 'round'; ctx.beginPath(); path.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); const end = path[path.length - 1]; emoji(ctx, '💀', end[0], end[1], 34);
          chain.forEach(b => { const [x, y] = posAt(b.d); circ(ctx, x, y, R, COL[b.c]); circ(ctx, x - 3, y - 3, 3, '#fff8'); }); if (shot) circ(ctx, shot.x, shot.y, R, COL[shot.c]);
          emoji(ctx, '🐸', CX, CY, 50); circ(ctx, CX + Math.cos(aim) * 22, CY + Math.sin(aim) * 22, R, COL[cur]); circ(ctx, CX, CY + 8, 6, COL[next]);
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Змейка против блоков ---------- */
  Games.register({ id: 'snakeblocks', title: 'Змейка против блоков', icon: '🐍', cat: 'arcade', desc: 'Змейка из шариков пробивает блоки, теряя по шарику за очко блока', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 600, BW = W / 5; let x, len, rows, pickups, speed, score, alive, trail, hit;
      function reset() { x = W / 2; a.tx = x; len = 5; rows = []; pickups = []; speed = 180; score = 0; alive = true; trail = []; hit = 0; for (let y = -200; y > -2000; y -= 240) addRow(y); a.hdr.set(0, 0); }
      const addRow = y => { const blocks = []; const n = Math.random() < 0.4 ? 5 : api.rand(1, 3); const cols = api.shuffle([0, 1, 2, 3, 4]).slice(0, n); cols.forEach(c => blocks.push({ c, v: api.rand(1, Math.max(3, Math.min(50, 3 + score / 4))) })); if (n === 5) blocks[api.rand(0, 4)].v = api.rand(1, Math.max(1, len - 1)); rows.push({ y, blocks }); for (let k = 0; k < 2; k++) pickups.push({ x: api.rand(20, W - 20), y: y - api.rand(60, 180), v: api.rand(1, 5) }); };
      const a = { tx: 0 };
      Object.assign(a, api.arcade(screen, { w: W, h: H, stats: [{ label: 'Очки', value: 0 }, { label: 'Рекорд', value: api.bestOf('snakeblocks') || 0 }], hint: 'Ведите пальцем влево-вправо',
        onDown: p => a.tx = p.x, onMove: (p, e) => { if (e.buttons || e.pointerType === 'touch') a.tx = p.x; }, onKey: e => { if (e.key === 'ArrowLeft') a.tx = x - 50; if (e.key === 'ArrowRight') a.tx = x + 50; },
        frame(dt, ctx) {
          const HY = H - 180; if (alive) { const nx = x + clamp(a.tx - x, -600 * dt, 600 * dt); let blocked = false; for (const r of rows) for (const b of r.blocks) if (b.v > 0 && HY - 14 < r.y + BW && HY + 14 > r.y) { const bx0 = b.c * BW, bx1 = bx0 + BW; if (nx + 12 > bx0 && nx - 12 < bx1 && !(x + 12 > bx0 && x - 12 < bx1)) blocked = true; } if (!blocked) x = clamp(nx, 12, W - 12);
            let front = null; for (const r of rows) for (const b of r.blocks) if (b.v > 0 && x > b.c * BW && x < b.c * BW + BW && r.y + BW > HY - 14 && r.y + BW < HY + 10) front = b; if (front) { hit += dt; if (hit > 0.06) { hit = 0; front.v--; len--; score++; a.hdr.set(0, score); api.sound('tap'); api.vibrate(5); if (len <= 0) { alive = false; api.sound('boom'); over(api, 'snakeblocks', score, 'Змейка закончилась', 10, reset); } } } else { const mv = speed * dt; rows.forEach(r => r.y += mv); pickups.forEach(p => p.y += mv); trail.unshift(x); trail = trail.slice(0, 200); speed += dt * 2; }
            pickups.forEach(p => { if (!p.got && Math.hypot(p.x - x, p.y - HY) < 20) { p.got = true; len += p.v; api.sound('coin'); } }); rows = rows.filter(r => r.y < H + 50); pickups = pickups.filter(p => p.y < H + 20 && !p.got); while (rows.length < 8) addRow(Math.min(...rows.map(r => r.y)) - 240); if (score && score % 100 === 0 && !a._c) { a._c = true; api.addCoins(3); } else if (score % 100) a._c = false; }
          bg(ctx, W, H, '#0f172a'); rows.forEach(r => r.blocks.forEach(b => { if (b.v <= 0) return; rr(ctx, b.c * BW + 3, r.y + 3, BW - 6, BW - 6, 10, `hsl(${Math.max(0, 120 - b.v * 4)},70%,50%)`); text(ctx, b.v, b.c * BW + BW / 2, r.y + BW / 2, 22, '#fff'); })); pickups.forEach(p => { circ(ctx, p.x, p.y, 9, '#fbbf24'); text(ctx, p.v, p.x, p.y - 18, 13, '#fbbf24'); });
          for (let i = Math.min(len, 30) - 1; i >= 0; i--) { const tx = trail[Math.min(trail.length - 1, i * 4)] != null ? trail[Math.min(trail.length - 1, i * 4)] : x; circ(ctx, tx, HY + i * 18, 11, i ? '#22c55e' : '#86efac'); } text(ctx, len, x, HY - 26, 16, '#fff');
        } }));
      this.unmount = a.stop; reset();
    } });

  /* ---------- Бомбардировщик ---------- */
  K.levelGame({ id: 'bomberplane', title: 'Бомбардировщик', icon: '✈️', cat: 'arcade', desc: 'Самолёт снижается над городом. Сноси дома бомбами, чтобы приземлиться', reward: 6, play(c) {
    const { api, L } = c; const W = 360, H = 480, BW = 24; let plane, blds, bombs, alive = true, hd, landed = false;
    blds = []; for (let x = 36; x < W - 36; x += BW) blds.push({ x, h: api.rand(3, 8 + Math.min(8, L.lvl)) * 16 }); plane = { x: -20, y: 40, vx: 110 + L.lvl * 6 }; bombs = [];
    const a = api.arcade(c.screen, { w: W, h: H, stats: [{ label: 'Ур.', value: L.lvl + 1 }, { label: 'Домов', value: blds.filter(b => b.h > 0).length }], hint: 'Тап — сбросить бомбу (одна за раз)',
      onDown: () => { if (alive && !landed && bombs.length < 1 + (L.lvl > 6 ? 1 : 0)) { bombs.push({ x: plane.x, y: plane.y + 10, vy: 60 }); api.sound('tap'); } },
      frame(dt, ctx) {
        if (alive && !landed) { plane.x += plane.vx * dt; if (plane.x > W + 20) { plane.x = -20; plane.y += 16; } const ground = H - 20; const b = blds.find(q => plane.x + 14 > q.x && plane.x - 14 < q.x + BW - 2); if (b && plane.y + 8 > ground - b.h) { alive = false; api.sound('boom'); api.vibrate([60, 40, 120]); c.lose('Врезались в дом'); } if (plane.y > ground - 16 && blds.every(q => q.h <= 0)) { landed = true; c.win('Самолёт приземлился!'); }
          bombs.forEach(bm => { bm.vy += 400 * dt; bm.y += bm.vy * dt; const q = blds.find(q => bm.x > q.x && bm.x < q.x + BW); if (q && q.h > 0 && bm.y > ground - q.h) { q.h = Math.max(0, q.h - 48); bm.dead = true; api.sound('boom'); hd.set(1, blds.filter(b => b.h > 0).length); } if (bm.y > ground) bm.dead = true; }); bombs = bombs.filter(bm => !bm.dead); if (blds.every(q => q.h <= 0) && plane.y < H - 60) plane.y += 60 * dt; }
        const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1e3a8a'); g.addColorStop(1, '#f472b6'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#1f2937'; ctx.fillRect(0, H - 20, W, 20);
        blds.forEach((q, i) => { if (q.h <= 0) return; rr(ctx, q.x, H - 20 - q.h, BW - 2, q.h, 2, `hsl(${(i * 47) % 360},30%,${35 + i % 3 * 8}%)`); for (let y = H - 20 - q.h + 6; y < H - 26; y += 16) { rr(ctx, q.x + 4, y, 5, 6, 1, '#fde68a'); rr(ctx, q.x + 13, y, 5, 6, 1, '#fde68a'); } });
        bombs.forEach(bm => circ(ctx, bm.x, bm.y, 5, '#111')); ctx.save(); ctx.translate(plane.x, plane.y); ctx.scale(-1, 1); emoji(ctx, '✈️', 0, 0, 30); ctx.restore();
      } });
    hd = a.hdr; c.unmount = a.stop;
  } });

  /* ---------- Мини-футбол ---------- */
  Games.register({ id: 'football', title: 'Мини-футбол', icon: '⚽', cat: 'arcade', desc: 'Один на один против бота. Забей 5 голов первым', bestLabel: 'Побед',
    mount(screen, api) {
      const W = 360, H = 560, GW = 110, R = 18, BR = 10; let me, bot, ball, sc, pause, st = K.stats(api, 'football');
      function reset() { sc = [0, 0]; kick(); }
      function kick() { me = { x: W / 2, y: H - 90, vx: 0, vy: 0 }; bot = { x: W / 2, y: 90, vx: 0, vy: 0 }; ball = { x: W / 2, y: H / 2, vx: 0, vy: 0 }; a.tx = me.x; a.ty = me.y; pause = 0.8; a.hdr.set(0, sc.join(' : ')); }
      const a = { tx: 0, ty: 0 };
      const push = (p, tx, ty, sp, dt) => { const dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy); const v = Math.min(sp, d * 8); p.vx = d > 1 ? dx / d * v : 0; p.vy = d > 1 ? dy / d * v : 0; p.x += p.vx * dt; p.y += p.vy * dt; };
      Object.assign(a, api.arcade(screen, { w: W, h: H, stats: [{ label: 'Счёт', value: '0 : 0' }, { label: 'П · П', value: st.txt() }], hint: 'Ведите игрока пальцем, толкайте мяч в ворота сверху',
        onDown: p => { a.tx = p.x; a.ty = p.y; a.d = true; }, onMove: p => { if (a.d) { a.tx = p.x; a.ty = p.y; } }, onUp: () => a.d = false,
        frame(dt, ctx) {
          if (pause > 0) pause -= dt; else { push(me, a.tx, a.ty - 30, 260, dt); me.x = clamp(me.x, R, W - R); me.y = clamp(me.y, H / 2 + R, H - R); const lvl = 1 + sc[0] * 0.08; const tx = ball.y < H / 2 + 60 ? ball.x : W / 2, ty = ball.y < H / 2 + 60 ? ball.y - 20 : 80; push(bot, tx, ty, 210 * lvl, dt); bot.x = clamp(bot.x, R, W - R); bot.y = clamp(bot.y, R, H / 2 - R);
            for (const p of [me, bot]) { const dx = ball.x - p.x, dy = ball.y - p.y, d = Math.hypot(dx, dy); if (d < R + BR) { const nx = dx / d, ny = dy / d; ball.x = p.x + nx * (R + BR); ball.y = p.y + ny * (R + BR); ball.vx = nx * 380 + p.vx * 0.6; ball.vy = ny * 380 + p.vy * 0.6; api.sound('tap'); } }
            ball.x += ball.vx * dt; ball.y += ball.vy * dt; ball.vx *= Math.pow(0.5, dt); ball.vy *= Math.pow(0.5, dt); if (ball.x < BR) { ball.x = BR; ball.vx = Math.abs(ball.vx); } if (ball.x > W - BR) { ball.x = W - BR; ball.vx = -Math.abs(ball.vx); }
            const inGoal = Math.abs(ball.x - W / 2) < GW / 2; if (ball.y < BR) { if (inGoal) goal(0); else { ball.y = BR; ball.vy = Math.abs(ball.vy); } } if (ball.y > H - BR) { if (inGoal) goal(1); else { ball.y = H - BR; ball.vy = -Math.abs(ball.vy); } } }
          bg(ctx, W, H, '#15803d'); for (let y = 0; y < H; y += 70) rr(ctx, 0, y, W, 35, 0, '#16a34a'); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.strokeRect(4, 4, W - 8, H - 8); K.line(ctx, 4, H / 2, W - 4, H / 2, '#fff', 3); K.ring(ctx, W / 2, H / 2, 50, '#fff', 3); rr(ctx, W / 2 - GW / 2, 0, GW, 8, 0, '#e5e7eb'); rr(ctx, W / 2 - GW / 2, H - 8, GW, 8, 0, '#e5e7eb');
          circ(ctx, bot.x, bot.y, R, '#ef4444'); circ(ctx, me.x, me.y, R, '#2563eb'); emoji(ctx, '⚽', ball.x, ball.y, BR * 2.2); if (pause > 0 && pause < 5) text(ctx, sc.join(' : '), W / 2, H / 2 - 80, 36, '#fff');
        } }));
      function goal(who) { sc[who]++; api.sound(who ? 'bad' : 'win'); api.vibrate(40); if (sc[0] === 5 || sc[1] === 5) { const win = sc[0] === 5; win ? st.win() : st.lose(); a.hdr.set(1, st.txt()); pause = 99; api.end({ win, title: win ? 'Победа ' + sc.join(':') : 'Поражение ' + sc.join(':'), reward: win ? 25 : 0, onAgain: reset }); } else kick(); }
      this.unmount = a.stop; reset();
    } });

  /* ---------- Трамплин ---------- */
  Games.register({ id: 'skijump', title: 'Трамплин', icon: '🎿', cat: 'arcade', desc: 'Оттолкнись в конце трамплина и держи равновесие в полёте', bestLabel: 'Рекорд (м)',
    mount(screen, api) {
      const W = 400, H = 300; let st, x, y, vx, vy, ang, pushed, dist, hold, t;
      const ramp = X => X < 150 ? 40 + X * 0.8 : X < 180 ? 160 - (X - 150) * 0.2 : null; const hill = X => 150 + (X - 180) * 0.45 - Math.max(0, (X - 520)) * 0.3;
      function reset() { st = 'ramp'; x = 0; y = 40; vx = 60; vy = 0; ang = 0.4; pushed = 0; dist = 0; hold = 0; t = 0; a.hdr.set(0, '—'); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Прыжок', value: '—' }, { label: 'Рекорд', value: api.bestOf('skijump') ? api.bestOf('skijump') + ' м' : '—' }], hint: 'Тап в конце трамплина — толчок. В полёте держите палец, чтобы наклониться вперёд',
        onDown: () => { if (st === 'ramp') { pushed = x; st = 'fly'; const q = clamp(1 - Math.abs(x - 172) / 40, 0, 1); vy = -120 - q * 140; vx += 30 + q * 50; api.sound('jump'); } hold = 1; }, onUp: () => hold = 0,
        frame(dt, ctx) {
          t += dt; if (st === 'ramp') { vx += 160 * dt; x += vx * dt; y = ramp(x); if (x >= 180) { st = 'fly'; vy = -30; pushed = 0; } }
          else if (st === 'fly') { ang += ((hold ? 0.9 : 0.1) - ang) * dt * 2; const lift = Math.max(0, 1 - Math.abs(ang - 0.6) * 1.6) * 0.55; vy += (500 - lift * 400) * dt; vx -= (Math.abs(ang - 0.6) * 20) * dt; x += vx * dt; y += vy * dt; if (x > 180 && y >= hill(x)) { y = hill(x); const good = Math.abs(ang - Math.atan(0.45)) < 0.55; dist = Math.round((x - 180) / 3 * 10) / 10; st = good ? 'land' : 'fall'; api.sound(good ? 'good' : 'boom'); a.hdr.set(0, dist + ' м'); if (!good) dist = Math.round(dist * 0.5 * 10) / 10; setTimeout(() => { api.best('skijump', dist); api.end({ win: good, title: good ? dist + ' метров!' : 'Падение при приземлении', reward: Math.floor(dist / 10), text: good ? '' : 'Засчитано ' + dist + ' м', onAgain: reset }); }, 900); } }
          else if (st === 'land') { x += vx * dt * 0.5; vx *= 0.97; y = hill(x); }
          const cam = clamp(x - 120, 0, 500); const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#93c5fd'); g.addColorStop(1, '#e0f2fe'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.save(); ctx.translate(-cam, 0);
          ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.moveTo(180, H); for (let X = 180; X < 1000; X += 10) ctx.lineTo(X, hill(X)); ctx.lineTo(1000, H); ctx.fill(); ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 40); for (let X = 0; X <= 180; X += 5) ctx.lineTo(X, ramp(X)); ctx.stroke(); for (let m = 20; m <= 200; m += 20) { const X = 180 + m * 3; K.line(ctx, X, hill(X), X, hill(X) + 14, '#ef4444', 2); text(ctx, m, X, hill(X) + 24, 10, '#475569'); }
          ctx.translate(x, y - 12); ctx.rotate(st === 'ramp' ? 0.6 : st === 'fall' ? 1.6 : ang); rr(ctx, -22, 10, 44, 3, 1, '#1f2937'); emoji(ctx, '⛷', 0, 0, 26); ctx.restore(); if (st === 'ramp' && x > 130) text(ctx, 'ТОЛЧОК!', W / 2, 30, 20, '#dc2626');
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Гравигольф ---------- */
  K.levelGame({ id: 'gravgolf', title: 'Гравигольф', icon: '🪐', cat: 'arcade', desc: 'Запусти мяч так, чтобы гравитация планет привела его в лунку', reward: 6, play(c) {
    const { api, L } = c; const W = 360, H = 520; let ball, planets, hole, drag, shots = 0, hd, moving = false;
    planets = []; for (let k = 0; k < Math.min(5, 1 + Math.floor(L.lvl / 2)); k++) { let p; do { p = { x: api.rand(60, W - 60), y: api.rand(120, H - 160), r: api.rand(18, 34) }; } while (planets.some(q => Math.hypot(q.x - p.x, q.y - p.y) < q.r + p.r + 30)); planets.push(p); }
    hole = { x: api.rand(40, W - 40), y: api.rand(40, 90) }; const home = { x: W / 2, y: H - 50 }; ball = { x: home.x, y: home.y, vx: 0, vy: 0, t: 0 };
    const a = api.arcade(c.screen, { w: W, h: H, stats: [{ label: 'Ур.', value: L.lvl + 1 }, { label: 'Удары', value: 0 }], hint: 'Оттяните от мяча и отпустите',
      onDown: p => { if (!moving) drag = p; }, onMove: p => { if (drag) a._p = p; }, onUp: p => { if (!drag || p.x < 0) { drag = null; return; } const dx = drag.x - p.x, dy = drag.y - p.y; drag = null; a._p = null; if (Math.hypot(dx, dy) < 10) return; ball.vx = dx * 3; ball.vy = dy * 3; moving = true; ball.t = 0; shots++; hd.set(1, shots); api.sound('tap'); },
      frame(dt, ctx) {
        if (moving && !c.solved) { for (let s = 0; s < 4; s++) { const sd = dt / 4; planets.forEach(p => { const dx = p.x - ball.x, dy = p.y - ball.y, d2 = dx * dx + dy * dy, d = Math.sqrt(d2); const f = 90000 * p.r / 30 / Math.max(d2, 400); ball.vx += dx / d * f * sd; ball.vy += dy / d * f * sd; if (d < p.r + 6) { moving = false; } }); ball.x += ball.vx * sd; ball.y += ball.vy * sd; } ball.t += dt; if (Math.hypot(ball.x - hole.x, ball.y - hole.y) < 14) { moving = false; c.win('Ударов: ' + shots); } if (!moving || ball.x < -40 || ball.x > W + 40 || ball.y < -40 || ball.y > H + 40 || ball.t > 8) { if (!c.solved) { moving = false; api.sound('bad'); ball = { x: home.x, y: home.y, vx: 0, vy: 0, t: 0 }; if (shots >= 8) c.lose('8 ударов мимо'); } } }
        bg(ctx, W, H, '#05051a'); for (let i = 0; i < 50; i++) circ(ctx, (i * 71) % W, (i * 113) % H, 1, '#64748b'); planets.forEach((p, i) => { K.ring(ctx, p.x, p.y, p.r * 2.4, 'rgba(167,139,250,.15)', 2); circ(ctx, p.x, p.y, p.r, ['#f97316', '#38bdf8', '#a3e635', '#f472b6', '#facc15'][i % 5]); });
        circ(ctx, hole.x, hole.y, 12, '#111'); K.ring(ctx, hole.x, hole.y, 12, '#fff', 2); emoji(ctx, '⛳', hole.x + 8, hole.y - 14, 18); circ(ctx, ball.x, ball.y, 7, '#fff');
        if (drag && a._p) { let px = ball.x, py = ball.y, vx = (drag.x - a._p.x) * 3, vy = (drag.y - a._p.y) * 3; ctx.fillStyle = '#fbbf24'; for (let k = 0; k < 40; k++) { for (let s = 0; s < 3; s++) { planets.forEach(p => { const dx = p.x - px, dy = p.y - py, d2 = dx * dx + dy * dy, d = Math.sqrt(d2); const f = 90000 * p.r / 30 / Math.max(d2, 400); vx += dx / d * f * 0.01; vy += dy / d * f * 0.01; }); px += vx * 0.01; py += vy * 0.01; } if (k % 2) ctx.fillRect(px - 1.5, py - 1.5, 3, 3); if (k > 14) break; } }
      } });
    hd = a.hdr; c.unmount = a.stop;
  } });

  /* ---------- Эквилибрист ---------- */
  Games.register({ id: 'balance', title: 'Эквилибрист', icon: '🤹', cat: 'arcade', desc: 'Удерживай шест вертикально, двигая ладонь. Ветер мешает', bestLabel: 'Рекорд (с)',
    mount(screen, api) {
      const W = 360, H = 520, LEN = 220; let hx, hv, ang, av, t, alive, wind, target;
      function reset() { hx = W / 2; hv = 0; ang = 0.05 * (Math.random() < 0.5 ? 1 : -1); av = 0; t = 0; alive = true; wind = 0; target = W / 2; a.hdr.set(0, '0.0'); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Время', value: '0.0' }, { label: 'Рекорд', value: api.bestOf('balance') || '—' }], hint: 'Ведите пальцем под падающую сторону шеста',
        onDown: p => target = p.x, onMove: (p, e) => { if (e.buttons || e.pointerType === 'touch') target = p.x; }, onKey: e => { if (e.key === 'ArrowLeft') target = hx - 40; if (e.key === 'ArrowRight') target = hx + 40; },
        frame(dt, ctx) {
          if (alive && dt > 0) { t += dt; a.hdr.set(0, t.toFixed(1)); if (Math.random() < dt * 0.4) wind = (Math.random() - 0.5) * (0.6 + t / 30); const nx = hx + (clamp(target, 30, W - 30) - hx) * Math.min(1, dt * 12); const acc = (nx - hx) / dt - hv; hv = (nx - hx) / dt; hx = nx; av += (Math.sin(ang) * 9.5 - Math.cos(ang) * acc / 120 + wind) * dt; av *= 0.995; ang += av * dt; if (Math.abs(ang) > 1.2) { alive = false; api.sound('boom'); const s = Math.round(t * 10) / 10; api.best('balance', s); api.end({ win: false, title: s + ' секунд', reward: Math.floor(s / 5), onAgain: reset }); } if (Math.floor(t) % 30 === 0 && Math.floor(t) && !a._c) { a._c = true; api.addCoins(3); } else if (Math.floor(t) % 30) a._c = false; }
          bg(ctx, W, H, '#0c4a6e'); for (let i = 0; i < 12; i++) { const y = ((i * 60) + t * wind * 300) % H; K.line(ctx, (i * 67 + t * 200 * Math.sign(wind)) % W, (y + H) % H, (i * 67 + t * 200 * Math.sign(wind)) % W + wind * 60, (y + H) % H, 'rgba(255,255,255,.2)', 2); }
          const by = H - 80, tx = hx + Math.sin(ang) * LEN, ty = by - Math.cos(ang) * LEN; K.line(ctx, hx, by, tx, ty, '#fbbf24', 6); emoji(ctx, '🍽', tx, ty - 10, 30); emoji(ctx, '✋', hx, by + 14, 40); text(ctx, wind > 0.1 ? 'ветер →' : wind < -0.1 ? '← ветер' : '', W / 2, 30, 14, '#bae6fd');
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Цепной взрыв ---------- */
  K.levelGame({ id: 'chainboom', title: 'Цепной взрыв', icon: '💥', cat: 'arcade', desc: 'Один тап — один взрыв. Взорви цепной реакцией нужное число шариков', reward: 6, play(c) {
    const { api, L } = c; const W = 360, H = 520; const n = 20 + L.lvl * 3, need = Math.min(n - 2, Math.floor(n * (0.3 + L.lvl * 0.03))); let dots, booms, used = false, popped = 0, hd, doneT = 0;
    dots = [...Array(n)].map(() => ({ x: api.rand(15, W - 15), y: api.rand(15, H - 15), vx: api.rand(-60, 60), vy: api.rand(-60, 60), c: `hsl(${api.rand(0, 359)},80%,60%)` })); booms = [];
    const a = api.arcade(c.screen, { w: W, h: H, stats: [{ label: 'Ур.', value: L.lvl + 1 }, { label: 'Взорвано', value: '0/' + need }], hint: 'Один тап — одна вспышка. Выберите момент!',
      onDown: p => { if (used) return; used = true; booms.push({ x: p.x, y: p.y, r: 0, t: 0, c: '#fff' }); api.sound('tap'); },
      frame(dt, ctx) {
        dots.forEach(d => { d.x += d.vx * dt; d.y += d.vy * dt; if (d.x < 8 || d.x > W - 8) d.vx *= -1; if (d.y < 8 || d.y > H - 8) d.vy *= -1; });
        booms.forEach(b => { b.t += dt; b.r = b.t < 0.3 ? b.t / 0.3 * 36 : b.t < 1.3 ? 36 : Math.max(0, 36 - (b.t - 1.3) * 120); }); for (const b of booms) if (b.r > 5) dots.forEach(d => { if (!d.dead && Math.hypot(d.x - b.x, d.y - b.y) < b.r + 8) { d.dead = true; popped++; hd.set(1, popped + '/' + need); booms.push({ x: d.x, y: d.y, r: 0, t: 0, c: d.c }); api.sound('select'); } }); dots = dots.filter(d => !d.dead); booms = booms.filter(b => b.t < 1.6);
        if (used && !booms.length && !c.solved) { doneT += dt; if (doneT > 0.3) { if (popped >= need) c.win('Взорвано ' + popped + ' из ' + n); else c.lose('Взорвано ' + popped + ', нужно ' + need); } }
        bg(ctx, W, H, '#0b0b16'); booms.forEach(b => { ctx.globalAlpha = 0.5; circ(ctx, b.x, b.y, b.r, b.c); ctx.globalAlpha = 1; }); dots.forEach(d => circ(ctx, d.x, d.y, 7, d.c));
      } });
    hd = a.hdr; c.unmount = a.stop;
  } });

  /* ---------- Парашютист ---------- */
  Games.register({ id: 'parachute', title: 'Парашютист', icon: '🪂', cat: 'arcade', desc: 'Раскрой парашют вовремя и приземлись точно в центр мишени', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 560; let p, open, wind, round, total, landed;
      function reset() { round = 0; total = 0; next(); }
      function next() { round++; p = { x: api.rand(60, W - 60), y: 20, vx: 0, vy: 40 }; open = false; wind = (Math.random() - 0.5) * (40 + round * 10); landed = false; a.tx = null; a.hdr.set(0, round + '/5'); a.hdr.set(1, total); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Прыжок', value: '1/5' }, { label: 'Очки', value: 0 }, { label: 'Рекорд', value: api.bestOf('parachute') || 0 }], hint: 'Тап — раскрыть парашют. Потом ведите пальцем, чтобы рулить',
        onDown: q => { if (!open && !landed) { open = true; api.sound('select'); } else a.tx = q.x; }, onMove: (q, e) => { if (open && (e.buttons || e.pointerType === 'touch')) a.tx = q.x; }, onUp: () => a.tx = null,
        frame(dt, ctx) {
          const G = H - 40; if (!landed) { if (!open) { p.vy = Math.min(p.vy + 400 * dt, 420); p.vx += (wind - p.vx) * dt * 0.3; } else { p.vy += (55 - p.vy) * Math.min(1, dt * 3); const steer = a.tx != null ? clamp((a.tx - p.x) * 2, -90, 90) : 0; p.vx += (wind + steer - p.vx) * Math.min(1, dt * 2); } p.x = clamp(p.x + p.vx * dt, 10, W - 10); p.y += p.vy * dt;
            if (p.y >= G - 20) { landed = true; const d = Math.abs(p.x - W / 2); const hard = p.vy > 150; const pts = hard ? 0 : Math.max(0, 100 - Math.round(d * 1.4)); total += pts; a.hdr.set(1, total); api.sound(hard ? 'boom' : pts > 70 ? 'good' : 'select'); api.toast(hard ? 'Жёсткая посадка! 0' : '+' + pts); setTimeout(() => { if (round >= 5) { api.best('parachute', total); api.end({ title: 'Итог: ' + total, reward: Math.floor(total / 40), onAgain: reset }); } else next(); }, 1100); } }
          const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0284c7'); g.addColorStop(1, '#bae6fd'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#65a30d'; ctx.fillRect(0, G, W, 40); [[70, '#fff'], [50, '#ef4444'], [30, '#fff'], [12, '#ef4444']].forEach(([r, c]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(W / 2, G + 6, r, r / 5, 0, 0, 7); ctx.fill(); });
          text(ctx, wind > 5 ? 'ветер →' : wind < -5 ? '← ветер' : 'штиль', W / 2, 20, 14, '#fff'); if (open && !landed) { emoji(ctx, '🪂', p.x, p.y - 20, 44); } else emoji(ctx, landed && p.vy > 150 ? '🤕' : '🧍', p.x, p.y, 26); if (!open && !landed) text(ctx, Math.max(0, Math.round((G - p.y) / 3)) + ' м', p.x + 30, p.y, 13, '#fff');
        } });
      this.unmount = a.stop; reset();
    } });
})();
