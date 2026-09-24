/* Аркады, часть B (пакет 200+) */
(function () {
  const K = window.Kit; const { rr, circ, text, emoji, bg, over, clamp } = K;

  /* ---------- Волейбол ---------- */
  Games.register({ id: 'volley', title: 'Волейбол', icon: '🏐', cat: 'arcade', desc: 'Слайм-волейбол против бота до 7 очков', bestLabel: 'Побед',
    mount(screen, api) {
      const W = 400, H = 300, G = 260, NET = 60; let me, bot, ball, sc, hold, st = K.stats(api, 'volley'), serve, pause;
      function reset() { sc = [0, 0]; serve = 0; round(); }
      function round() { me = { x: 100, y: G, vy: 0 }; bot = { x: 300, y: G, vy: 0 }; ball = { x: serve ? 300 : 100, y: 80, vx: 0, vy: 0 }; pause = 0.8; hold = 0; a.hdr.set(0, sc[0] + ' : ' + sc[1]); }
      const jump = s => { if (s.y >= G) { s.vy = -470; } };
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Счёт', value: '0 : 0' }, { label: 'П · П', value: st.txt() }], hint: 'Держите слева/справа — бег, тап по верхней половине — прыжок',
        onDown: p => { if (p.y < H / 2) jump(me); hold = p.x < me.x ? -1 : 1; }, onMove: (p, e) => { if (e.buttons || e.pointerType === 'touch') hold = p.x < me.x - 10 ? -1 : p.x > me.x + 10 ? 1 : 0; }, onUp: () => hold = 0, onKey: e => { if (e.key === 'ArrowLeft') hold = -1; if (e.key === 'ArrowRight') hold = 1; if (e.key === 'ArrowUp' || e.key === ' ') jump(me); },
        frame(dt, ctx) {
          if (pause > 0) pause -= dt; else { for (const s of [me, bot]) { s.vy += 1200 * dt; s.y += s.vy * dt; if (s.y > G) { s.y = G; s.vy = 0; } }
            me.x = clamp(me.x + hold * 260 * dt, 30, W / 2 - 34); const tx = ball.x > W / 2 - 20 ? ball.x + 12 + (ball.vx > 0 ? 8 : 0) : 300; bot.x = clamp(bot.x + clamp(tx - bot.x, -1, 1) * 230 * dt * (Math.abs(tx - bot.x) > 4 ? 1 : 0), W / 2 + 34, W - 30); if (ball.x > W / 2 && ball.y > 120 && ball.y < 200 && Math.abs(ball.x - bot.x) < 40 && ball.vy > 0) jump(bot);
            ball.vy += 520 * dt; ball.x += ball.vx * dt; ball.y += ball.vy * dt; if (ball.x < 10) { ball.x = 10; ball.vx = Math.abs(ball.vx); } if (ball.x > W - 10) { ball.x = W - 10; ball.vx = -Math.abs(ball.vx); } if (ball.y < 10) { ball.y = 10; ball.vy = Math.abs(ball.vy); }
            if (Math.abs(ball.x - W / 2) < 14 && ball.y > G - NET) { if (ball.y < G - NET + 10 && ball.vy > 0) { ball.vy = -Math.abs(ball.vy) * 0.8; } else { ball.vx = (ball.x < W / 2 ? -1 : 1) * Math.abs(ball.vx) * 0.8; ball.x = W / 2 + (ball.x < W / 2 ? -14 : 14); } }
            for (const s of [me, bot]) { const dx = ball.x - s.x, dy = ball.y - s.y; const d = Math.hypot(dx, dy); if (d < 44 && dy < 0) { const nx = dx / d, ny = dy / d; ball.x = s.x + nx * 44; ball.y = s.y + ny * 44; const rv = (ball.vx) * nx + (ball.vy - s.vy) * ny; if (rv < 0) { ball.vx -= 2 * rv * nx; ball.vy -= 2 * rv * ny; } ball.vx += nx * 60; const sp = Math.hypot(ball.vx, ball.vy); if (sp > 560) { ball.vx *= 560 / sp; ball.vy *= 560 / sp; } api.sound('tap'); } }
            if (ball.y > G - 8) { const pt = ball.x < W / 2 ? 1 : 0; sc[pt]++; serve = pt; api.sound(pt ? 'bad' : 'good'); if (sc[0] === 7 || sc[1] === 7) { const win = sc[0] === 7; win ? st.win() : st.lose(); a.hdr.set(1, st.txt()); pause = 99; api.end({ win, title: win ? 'Победа ' + sc.join(':') : 'Поражение ' + sc.join(':'), reward: win ? 20 : 0, onAgain: reset }); } else round(); } }
          const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#38bdf8'); g.addColorStop(1, '#e0f2fe'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#fcd34d'; ctx.fillRect(0, G, W, H - G); rr(ctx, W / 2 - 3, G - NET, 6, NET, 2, '#1e293b');
          for (const [s, c] of [[me, '#22c55e'], [bot, '#ef4444']]) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(s.x, s.y, 34, Math.PI, 0); ctx.fill(); circ(ctx, s.x + (ball.x > s.x ? 12 : -12), s.y - 18, 7, '#fff'); circ(ctx, s.x + (ball.x > s.x ? 14 : -10), s.y - 18, 3.5, '#111'); }
          circ(ctx, ball.x, ball.y, 10, '#fff'); K.ring(ctx, ball.x, ball.y, 10, '#f59e0b', 2); if (pause > 0 && pause < 5) text(ctx, sc[0] + ' : ' + sc[1], W / 2, 60, 30, '#0f172a');
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Сумо ---------- */
  Games.register({ id: 'sumo', title: 'Сумо', icon: '🤼', cat: 'arcade', desc: 'Вытолкни бота с круглого ринга. Рывок — двойной тап', bestLabel: 'Побед',
    mount(screen, api) {
      const W = 360, H = 520, CX = W / 2, CY = H / 2 - 20, RING = 150, R = 26; let me, bot, sc, st = K.stats(api, 'sumo'), pause, lastTap;
      function reset() { sc = [0, 0]; round(); }
      function round() { me = { x: CX - 70, y: CY, vx: 0, vy: 0, cd: 0 }; bot = { x: CX + 70, y: CY, vx: 0, vy: 0, cd: 0 }; a.tx = me.x; a.ty = me.y; pause = 1; a.hdr.set(0, sc.join(' : ')); }
      const a = { tx: 0, ty: 0 };
      const dash = s => { if (s.cd > 0) return; const d = Math.hypot(s.vx, s.vy) || 1; s.vx += s.vx / d * 380; s.vy += s.vy / d * 380; s.cd = 1.2; api.sound('jump'); };
      Object.assign(a, api.arcade(screen, { w: W, h: H, stats: [{ label: 'Раунды', value: '0 : 0' }, { label: 'П · П', value: st.txt() }], hint: 'Ведите пальцем — борец идёт к нему. Двойной тап — рывок',
        onDown: p => { a.tx = p.x; a.ty = p.y; a.down = true; const n = performance.now(); if (n - (lastTap || 0) < 300) dash(me); lastTap = n; }, onMove: p => { if (a.down) { a.tx = p.x; a.ty = p.y; } }, onUp: () => a.down = false,
        frame(dt, ctx) {
          if (pause > 0) pause -= dt; else { for (const s of [me, bot]) s.cd -= dt; const acc = (s, tx, ty, f) => { const dx = tx - s.x, dy = ty - s.y, d = Math.hypot(dx, dy); if (d > 5) { s.vx += dx / d * f * dt; s.vy += dy / d * f * dt; } }; if (a.down) acc(me, a.tx, a.ty, 700);
            const toC = Math.hypot(bot.x - CX, bot.y - CY); const tx = toC > RING * 0.6 ? CX : me.x + (me.x - CX) * 0.2, ty = toC > RING * 0.6 ? CY : me.y + (me.y - CY) * 0.2; acc(bot, tx, ty, 560 + sc[0] * 40); if (Math.hypot(me.x - bot.x, me.y - bot.y) < 110 && Math.random() < dt * 0.8) dash(bot);
            for (const s of [me, bot]) { s.vx *= Math.pow(0.15, dt); s.vy *= Math.pow(0.15, dt); s.x += s.vx * dt; s.y += s.vy * dt; }
            const dx = bot.x - me.x, dy = bot.y - me.y, d = Math.hypot(dx, dy); if (d < 2 * R && d > 0) { const nx = dx / d, ny = dy / d, ov = 2 * R - d; me.x -= nx * ov / 2; me.y -= ny * ov / 2; bot.x += nx * ov / 2; bot.y += ny * ov / 2; const dv = (me.vx - bot.vx) * nx + (me.vy - bot.vy) * ny; if (dv > 0) { me.vx -= dv * nx * 1.1; me.vy -= dv * ny * 1.1; bot.vx += dv * nx * 1.1; bot.vy += dv * ny * 1.1; api.sound('tap'); api.vibrate(10); } }
            const outM = Math.hypot(me.x - CX, me.y - CY) > RING, outB = Math.hypot(bot.x - CX, bot.y - CY) > RING; if (outM || outB) { sc[outM ? 1 : 0]++; api.sound(outM ? 'bad' : 'good'); if (sc[0] === 3 || sc[1] === 3) { const win = sc[0] === 3; win ? st.win() : st.lose(); a.hdr.set(1, st.txt()); pause = 99; api.end({ win, title: win ? 'Ёкодзуна! Победа' : 'Вас вытолкнули', reward: win ? 20 : 0, text: sc.join(' : '), onAgain: reset }); } else round(); } }
          bg(ctx, W, H, '#44403c'); circ(ctx, CX, CY, RING + 10, '#a16207'); circ(ctx, CX, CY, RING, '#fde68a'); K.ring(ctx, CX, CY, RING, '#78350f', 4);
          [[me, '#2563eb', '🙂'], [bot, '#dc2626', '😠']].forEach(([s, c, e]) => { circ(ctx, s.x, s.y, R, c); if (s.cd > 0.9) K.ring(ctx, s.x, s.y, R + 5, '#fff', 3); emoji(ctx, e, s.x, s.y, 30); });
          text(ctx, 'Рывок: ' + (me.cd > 0 ? me.cd.toFixed(1) : 'готов'), W / 2, H - 30, 14, '#e7e5e4'); if (pause > 0 && pause < 5) text(ctx, 'Хаккэёй!', W / 2, 40, 26, '#fbbf24');
        } }));
      this.unmount = a.stop; reset();
    } });

  /* ---------- Холмы ---------- */
  Games.register({ id: 'hillclimb', title: 'Холмы', icon: '🚙', cat: 'arcade', desc: 'Газ и тормоз: проедь по холмам как можно дальше, не перевернувшись', bestLabel: 'Рекорд (м)',
    mount(screen, api) {
      const W = 400, H = 300; let x, v, ang, av, air, y, vy, fuel, alive, gas, brake, cans, coins;
      const hgt = X => 180 + Math.sin(X / 140) * 40 * Math.min(2.2, 1 + X / 3000) + Math.sin(X / 53) * 18 * Math.min(2, 1 + X / 4000) + Math.sin(X / 23) * 4;
      const slope = X => Math.atan2(hgt(X + 4) - hgt(X - 4), 8);
      function reset() { x = 50; v = 0; ang = 0; av = 0; y = hgt(50); vy = 0; air = false; fuel = 100; alive = true; gas = brake = false; cans = new Set(); coins = new Set(); a.hdr.set(0, 0); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Дистанция', value: 0 }, { label: 'Топливо', value: 100 }, { label: 'Рекорд', value: api.bestOf('hillclimb') || 0 }], hint: 'Держите справа — газ, слева — тормоз/назад',
        onDown: p => { if (p.x > W / 2) gas = true; else brake = true; }, onUp: () => { gas = brake = false; }, onKey: e => { if (e.key === 'ArrowRight') { gas = true; setTimeout(() => gas = false, 200); } if (e.key === 'ArrowLeft') { brake = true; setTimeout(() => brake = false, 200); } },
        frame(dt, ctx) {
          if (alive) { const s = slope(x); if (!air) { const acc = (gas && fuel > 0 ? 260 : 0) - (brake ? 260 : 0) - Math.sin(s) * 380; v += acc * dt; v *= Math.pow(0.7, dt); x += v * Math.cos(s) * dt; if (x < 20) { x = 20; v = Math.max(0, v); } const gy = hgt(x); y = gy; const target = slope(x); if (v > 0 && slope(x + 30) - target > 0.25 && v > 260) { air = true; vy = v * Math.sin(target) - 40; } ang += (target - ang) * Math.min(1, dt * 10); if (gas) av = -1.4; else if (brake) av = 1.4; else av = 0; } else { vy += 800 * dt; x += v * dt; y += vy * dt; ang += (gas ? -2.2 : brake ? 2.2 : 0) * dt; if (y >= hgt(x)) { y = hgt(x); air = false; if (Math.abs(ang - slope(x)) > 1.1) { alive = false; } } }
            if (Math.abs(ang) > 1.6) alive = false; if (gas && !air) fuel -= dt * 5; fuel -= dt * 0.8; if (fuel <= 0 && Math.abs(v) < 5) alive = false; const k = Math.floor(x / 700); if (k > 0 && !cans.has(k) && Math.abs(x - k * 700) < 20) { cans.add(k); fuel = 100; api.sound('good'); } const c = Math.floor(x / 150); if (!coins.has(c) && Math.abs(x - c * 150 - 75) < 16) { coins.add(c); api.addCoins(1); } a.hdr.set(0, Math.max(0, Math.floor((x - 50) / 10))); a.hdr.set(1, Math.max(0, Math.floor(fuel)));
            if (!alive) { api.sound('boom'); const m = Math.max(0, Math.floor((x - 50) / 10)); api.best('hillclimb', m); api.end({ win: false, title: fuel <= 0 ? 'Кончилось топливо' : 'Перевернулись!', reward: Math.floor(m / 40), text: m + ' м', onAgain: reset }); } }
          const cam = x - 120; const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#7dd3fc'); g.addColorStop(1, '#fef9c3'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#65a30d'; ctx.beginPath(); ctx.moveTo(0, H); for (let X = 0; X <= W; X += 6) ctx.lineTo(X, hgt(cam + X)); ctx.lineTo(W, H); ctx.fill(); ctx.fillStyle = '#854d0e'; ctx.beginPath(); ctx.moveTo(0, H); for (let X = 0; X <= W; X += 6) ctx.lineTo(X, hgt(cam + X) + 14); ctx.lineTo(W, H); ctx.fill();
          for (let k = Math.floor(cam / 700); k <= Math.floor((cam + W) / 700) + 1; k++) if (k > 0 && !cans.has(k)) emoji(ctx, '⛽', k * 700 - cam, hgt(k * 700) - 20, 22); for (let c = Math.floor(cam / 150); c <= Math.floor((cam + W) / 150); c++) if (!coins.has(c)) circ(ctx, c * 150 + 75 - cam, hgt(c * 150 + 75) - 30, 7, '#fbbf24');
          ctx.save(); ctx.translate(x - cam, y - 16); ctx.rotate(ang); rr(ctx, -28, -16, 56, 18, 5, '#dc2626'); rr(ctx, -10, -30, 24, 16, 4, '#fca5a5'); emoji(ctx, '🧑', 2, -24, 16); circ(ctx, -18, 4, 10, '#111'); circ(ctx, 18, 4, 10, '#111'); circ(ctx, -18, 4, 4, '#9ca3af'); circ(ctx, 18, 4, 4, '#9ca3af'); ctx.restore();
          rr(ctx, 10, 10, 100, 10, 5, '#1f2937'); rr(ctx, 10, 10, Math.max(0, fuel), 10, 5, fuel > 25 ? '#22c55e' : '#ef4444');
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Шарики-кирпичи ---------- */
  Games.register({ id: 'ballz', title: 'Шарики и кирпичи', icon: '🔴', cat: 'arcade', desc: 'Прицелься и выпусти очередь шариков. Кирпичи опускаются каждый ход', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 350, H = 560, C = 50, TOP = 40; let bricks, balls, nBalls, ox, aimP, flying, turn, alive, pickups, firstBack, launched, lt;
      function row() { const cells = api.shuffle([...Array(7).keys()]); const n = api.rand(2, 5); cells.slice(0, n).forEach(c => bricks.push({ c, r: 0, hp: turn * (Math.random() < 0.25 ? 2 : 1) })); pickups.push({ c: cells[n], r: 0 }); }
      function reset() { bricks = []; balls = []; pickups = []; nBalls = 1; ox = W / 2; turn = 1; alive = true; flying = false; row(); a.hdr.set(0, 1); a.hdr.set(1, 1); }
      function nextTurn() { turn++; bricks.forEach(b => b.r++); pickups.forEach(p => p.r++); pickups = pickups.filter(p => p.r < 9); if (bricks.some(b => b.r >= 9)) { alive = false; over(api, 'ballz', turn - 1, 'Кирпичи дошли до низа', 3, reset); return; } row(); a.hdr.set(0, turn); if (turn % 10 === 0) api.addCoins(3); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Ход', value: 1 }, { label: 'Шаров', value: 1 }, { label: 'Рекорд', value: api.bestOf('ballz') || 0 }], hint: 'Ведите палец вверх для прицела, отпустите — выстрел',
        onDown: p => { if (!flying && alive) aimP = p; }, onMove: p => { if (aimP) aimP = p; }, onUp: p => { if (!aimP || flying) return; const dx = aimP.x - ox, dy = aimP.y - (H - 20); aimP = null; if (dy > -20) return; const d = Math.hypot(dx, dy); flying = true; launched = 0; lt = 0; firstBack = null; balls = []; a._dir = [dx / d, dy / d]; },
        frame(dt, ctx) {
          if (flying) { lt -= dt; if (launched < nBalls && lt <= 0) { balls.push({ x: ox, y: H - 20, vx: a._dir[0] * 620, vy: a._dir[1] * 620 }); launched++; lt = 0.07; }
            for (let s = 0; s < 3; s++) { const sd = dt / 3; balls.forEach(b => { if (b.back) return; b.x += b.vx * sd; b.y += b.vy * sd; if (b.x < 6) { b.x = 6; b.vx = Math.abs(b.vx); } if (b.x > W - 6) { b.x = W - 6; b.vx = -Math.abs(b.vx); } if (b.y < TOP + 6) { b.y = TOP + 6; b.vy = Math.abs(b.vy); } if (b.y > H - 20) { b.back = true; if (firstBack == null) firstBack = b.x; } for (const br of bricks) { if (br.hp <= 0) continue; const bx = br.c * C, by = TOP + br.r * C; const cx = clamp(b.x, bx + 2, bx + C - 2), cy = clamp(b.y, by + 2, by + C - 2); const dx = b.x - cx, dy = b.y - cy; if (dx * dx + dy * dy < 36) { if (Math.abs(dx) > Math.abs(dy)) b.vx = Math.sign(dx || 1) * Math.abs(b.vx); else b.vy = Math.sign(dy || 1) * Math.abs(b.vy); br.hp--; api.sound('tap'); } } pickups.forEach(p => { if (!p.got && Math.hypot(b.x - (p.c * C + C / 2), b.y - (TOP + p.r * C + C / 2)) < 16) { p.got = true; nBalls++; a.hdr.set(1, nBalls); api.sound('coin'); } }); }); }
            bricks = bricks.filter(b => b.hp > 0); pickups = pickups.filter(p => !p.got); if (launched >= nBalls && balls.every(b => b.back)) { flying = false; ox = clamp(firstBack != null ? firstBack : ox, 10, W - 10); nextTurn(); } }
          bg(ctx, W, H, '#0f0f1f'); bricks.forEach(b => { const x = b.c * C, y = TOP + b.r * C; rr(ctx, x + 2, y + 2, C - 4, C - 4, 6, `hsl(${(b.hp * 11) % 360},70%,55%)`); text(ctx, b.hp, x + C / 2, y + C / 2, 18, '#fff'); }); pickups.forEach(p => { K.ring(ctx, p.c * C + C / 2, TOP + p.r * C + C / 2, 10, '#22c55e', 3); circ(ctx, p.c * C + C / 2, TOP + p.r * C + C / 2, 5, '#22c55e'); });
          balls.forEach(b => { if (!b.back) circ(ctx, b.x, b.y, 6, '#fff'); }); circ(ctx, ox, H - 20, 7, '#fbbf24'); K.line(ctx, 0, H - 13, W, H - 13, '#334155', 2);
          if (aimP && !flying) { const dx = aimP.x - ox, dy = aimP.y - (H - 20), d = Math.hypot(dx, dy); if (dy < -20) { ctx.setLineDash([4, 6]); K.line(ctx, ox, H - 20, ox + dx / d * 300, H - 20 + dy / d * 300, '#fbbf24', 2); ctx.setLineDash([]); } }
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Шарик в лабиринте ---------- */
  K.levelGame({ id: 'tiltmaze', title: 'Катящийся шарик', icon: '🟡', cat: 'arcade', desc: 'Наклоняй лабиринт пальцем — шарик катится к выходу. Не упади в дыры', reward: 6, play(c) {
    const { api, L } = c; const N = Math.min(11, 5 + Math.floor(L.lvl / 2)), CS = Math.floor(340 / N), W = N * CS, H = N * CS; const w = Array(N * N).fill(15); const seen = new Set([0]), stk = [0]; while (stk.length) { const i = stk[stk.length - 1]; const x = i % N, y = Math.floor(i / N); const o = [[0, -1, 1, 4], [1, 0, 2, 8], [0, 1, 4, 1], [-1, 0, 8, 2]].filter(([dx, dy]) => x + dx >= 0 && y + dy >= 0 && x + dx < N && y + dy < N && !seen.has((y + dy) * N + x + dx)); if (!o.length) { stk.pop(); continue; } const [dx, dy, b1, b2] = K.pick(o); const j = (y + dy) * N + x + dx; w[i] &= ~b1; w[j] &= ~b2; seen.add(j); stk.push(j); }
    for (let k = 0; k < N; k++) { const i = api.rand(0, N * N - 1); const x = i % N; if (x < N - 1) { w[i] &= ~2; w[i + 1] &= ~8; } }
    const holes = []; for (let k = 0; k < Math.floor(L.lvl / 2); k++) { const i = api.rand(N, N * N - 2); holes.push({ x: (i % N + .5) * CS, y: (Math.floor(i / N) + .5) * CS }); }
    let b = { x: CS / 2, y: CS / 2, vx: 0, vy: 0 }, tilt = { x: 0, y: 0 }, t = 0, orig = null;
    let hd; const a = api.arcade(c.screen, { w: W, h: H, stats: [{ label: 'Ур.', value: L.lvl + 1 }, { label: '⏱', value: 0 }], hint: 'Ведите пальцем от центра — туда наклонится поле',
      onDown: p => orig = p, onMove: p => { if (orig) tilt = { x: clamp((p.x - orig.x) / 60, -1, 1), y: clamp((p.y - orig.y) / 60, -1, 1) }; }, onUp: () => { orig = null; tilt = { x: 0, y: 0 }; }, onKey: e => { const m = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]; if (m) { tilt = { x: m[0], y: m[1] }; setTimeout(() => tilt = { x: 0, y: 0 }, 250); } },
      frame(dt, ctx) { if (!c.solved) { t += dt; hd.set(1, t.toFixed(1)); b.vx += tilt.x * 600 * dt; b.vy += tilt.y * 600 * dt; b.vx *= Math.pow(0.4, dt); b.vy *= Math.pow(0.4, dt); const R = CS * 0.28; for (let s = 0; s < 4; s++) { b.x += b.vx * dt / 4; b.y += b.vy * dt / 4; const cx = Math.floor(b.x / CS), cy = Math.floor(b.y / CS); const i = clamp(cy, 0, N - 1) * N + clamp(cx, 0, N - 1); const lx = cx * CS, ly = cy * CS; if (w[i] & 8 && b.x - R < lx) { b.x = lx + R; b.vx = Math.abs(b.vx) * 0.3; } if (w[i] & 2 && b.x + R > lx + CS) { b.x = lx + CS - R; b.vx = -Math.abs(b.vx) * 0.3; } if (w[i] & 1 && b.y - R < ly) { b.y = ly + R; b.vy = Math.abs(b.vy) * 0.3; } if (w[i] & 4 && b.y + R > ly + CS) { b.y = ly + CS - R; b.vy = -Math.abs(b.vy) * 0.3; } b.x = clamp(b.x, R, W - R); b.y = clamp(b.y, R, H - R); }
          if (holes.some(hh => Math.hypot(hh.x - b.x, hh.y - b.y) < CS * 0.3)) { api.sound('bad'); api.vibrate(60); b = { x: CS / 2, y: CS / 2, vx: 0, vy: 0 }; } if (Math.hypot(b.x - (W - CS / 2), b.y - (H - CS / 2)) < CS * 0.35) c.win(t.toFixed(1) + ' с'); }
        ctx.fillStyle = '#d6a55c'; ctx.fillRect(0, 0, W, H); holes.forEach(hh => circ(ctx, hh.x, hh.y, CS * 0.32, '#111')); circ(ctx, W - CS / 2, H - CS / 2, CS * 0.36, '#22c55e'); ctx.strokeStyle = '#5b3a13'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); for (let i = 0; i < N * N; i++) { const x = i % N * CS, y = Math.floor(i / N) * CS; if (w[i] & 1) { ctx.moveTo(x, y); ctx.lineTo(x + CS, y); } if (w[i] & 2) { ctx.moveTo(x + CS, y); ctx.lineTo(x + CS, y + CS); } if (w[i] & 4) { ctx.moveTo(x, y + CS); ctx.lineTo(x + CS, y + CS); } if (w[i] & 8) { ctx.moveTo(x, y); ctx.lineTo(x, y + CS); } } ctx.stroke(); circ(ctx, b.x, b.y, CS * 0.28, '#e5e7eb'); circ(ctx, b.x - 3, b.y - 3, CS * 0.1, '#fff'); if (orig) { K.ring(ctx, W / 2, H / 2, 20, 'rgba(0,0,0,.3)', 2); K.line(ctx, W / 2, H / 2, W / 2 + tilt.x * 40, H / 2 + tilt.y * 40, 'rgba(0,0,0,.5)', 4); } } });
    hd = a.hdr; c.unmount = a.stop;
  } });

  /* ---------- Башенная защита ---------- */
  Games.register({ id: 'towerdef', title: 'Башенная защита', icon: '🏰', cat: 'arcade', desc: 'Строй башни вдоль дороги и не пропусти врагов к замку', bestLabel: 'Рекорд волн',
    mount(screen, api) {
      const W = 360, H = 560, C = 40; const PATH = [[0, 1], [7, 1], [7, 4], [1, 4], [1, 7], [7, 7], [7, 10], [4, 10], [4, 13]]; let pts, towers, foes, shots, gold, lives, wave, spawnLeft, spawnT, alive, sel, between;
      const TT = [{ n: 'Стрелок', e: '🏹', cost: 40, r: 95, rate: 0.6, dmg: 10 }, { n: 'Пушка', e: '💣', cost: 70, r: 80, rate: 1.4, dmg: 28, splash: 40 }, { n: 'Лёд', e: '❄️', cost: 55, r: 85, rate: 1, dmg: 4, slow: 1.5 }];
      const onPath = new Set(); for (let k = 0; k < PATH.length - 1; k++) { const [x1, y1] = PATH[k], [x2, y2] = PATH[k + 1]; for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) onPath.add(x + ',' + y); }
      function reset() { pts = PATH.map(([x, y]) => [x * C + C / 2, y * C + C / 2]); towers = []; foes = []; shots = []; gold = 100; lives = 10; wave = 0; spawnLeft = 0; alive = true; sel = 0; between = 3; hud(); }
      const hud = () => { a.hdr.set(0, wave); a.hdr.set(1, gold); a.hdr.set(2, lives); };
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Волна', value: 0 }, { label: '●', value: 100 }, { label: '❤', value: 10 }], hint: 'Тап по траве — построить выбранную башню. Тап по башне — улучшить',
        onDown: p => { if (!alive) return; if (p.y > H - 60) { const k = Math.floor(p.x / (W / 3)); sel = clamp(k, 0, 2); api.sound('select'); return; } const cx = Math.floor(p.x / C), cy = Math.floor(p.y / C); if (onPath.has(cx + ',' + cy) || cy >= 13) return; const ex = towers.find(t => t.cx === cx && t.cy === cy); if (ex) { const cost = TT[ex.k].cost * ex.lv; if (ex.lv < 3 && gold >= cost) { gold -= cost; ex.lv++; api.sound('coin'); hud(); } else api.toast(ex.lv >= 3 ? 'Максимальный уровень' : 'Нужно ' + cost + ' ●'); return; } const t = TT[sel]; if (gold < t.cost) { api.toast('Не хватает золота'); return; } gold -= t.cost; towers.push({ cx, cy, k: sel, lv: 1, cd: 0 }); api.sound('tap'); hud(); },
        frame(dt, ctx) {
          if (alive) { if (!spawnLeft && !foes.length) { between -= dt; if (between <= 0) { wave++; spawnLeft = 6 + wave * 2; spawnT = 0; between = 4; hud(); if (wave > 1) { gold += 20; api.addCoins(2); } api.best('towerdef', wave - 1); } } if (spawnLeft) { spawnT -= dt; if (spawnT <= 0) { spawnT = Math.max(0.35, 0.9 - wave * 0.03); spawnLeft--; const boss = spawnLeft === 0 && wave % 5 === 0; foes.push({ seg: 0, t: 0, hp: (boss ? 12 : 1) * (18 + wave * 9), max: (boss ? 12 : 1) * (18 + wave * 9), sp: boss ? 35 : 55 + Math.min(40, wave * 2), slow: 0, e: boss ? '👹' : K.pick(['👾', '👻', '🧟']) }); } }
            foes.forEach(f => { const sp = f.sp * (f.slow > 0 ? 0.5 : 1); f.slow -= dt; let move = sp * dt; while (move > 0 && f.seg < pts.length - 1) { const [x1, y1] = pts[f.seg], [x2, y2] = pts[f.seg + 1]; const L = Math.hypot(x2 - x1, y2 - y1); const rem = L * (1 - f.t); if (move >= rem) { move -= rem; f.seg++; f.t = 0; } else { f.t += move / L; move = 0; } } if (f.seg >= pts.length - 1) { f.dead = true; lives--; hud(); api.sound('bad'); if (lives <= 0) { alive = false; api.best('towerdef', wave - 1); api.end({ win: false, title: 'Замок пал на волне ' + wave, reward: wave * 2, onAgain: reset }); } } const [x1, y1] = pts[f.seg], [x2, y2] = pts[Math.min(pts.length - 1, f.seg + 1)]; f.x = x1 + (x2 - x1) * f.t; f.y = y1 + (y2 - y1) * f.t; });
            towers.forEach(t => { const T = TT[t.k]; t.cd -= dt; if (t.cd > 0) return; const tx = t.cx * C + C / 2, ty = t.cy * C + C / 2; const target = foes.filter(f => !f.dead && Math.hypot(f.x - tx, f.y - ty) < T.r * (1 + (t.lv - 1) * 0.15)).sort((p, q) => (q.seg + q.t) - (p.seg + p.t))[0]; if (target) { t.cd = T.rate / (1 + (t.lv - 1) * 0.3); shots.push({ x: tx, y: ty, f: target, k: t.k, dmg: T.dmg * t.lv }); } });
            shots.forEach(s => { const dx = s.f.x - s.x, dy = s.f.y - s.y, d = Math.hypot(dx, dy); if (d < 8 || s.f.dead) { s.done = true; if (s.f.dead) return; const T = TT[s.k]; const hitF = T.splash ? foes.filter(f => Math.hypot(f.x - s.f.x, f.y - s.f.y) < T.splash) : [s.f]; hitF.forEach(f => { f.hp -= s.dmg; if (T.slow) f.slow = T.slow; if (f.hp <= 0 && !f.dead) { f.dead = true; gold += 5 + Math.floor(wave / 2); hud(); } }); return; } s.x += dx / d * 420 * dt; s.y += dy / d * 420 * dt; });
            foes = foes.filter(f => !f.dead); shots = shots.filter(s => !s.done); }
          bg(ctx, W, H, '#3f6212'); for (const k of onPath) { const [x, y] = k.split(',').map(Number); rr(ctx, x * C, y * C, C, C, 0, '#a8a29e'); } emoji(ctx, '🏰', 4 * C + C / 2, 13 * C + 10, 36);
          towers.forEach(t => { rr(ctx, t.cx * C + 3, t.cy * C + 3, C - 6, C - 6, 8, ['#1e3a8a', '#7f1d1d', '#155e75'][t.k]); emoji(ctx, TT[t.k].e, t.cx * C + C / 2, t.cy * C + C / 2, 22); for (let l = 0; l < t.lv; l++) circ(ctx, t.cx * C + 8 + l * 7, t.cy * C + C - 7, 2.5, '#fbbf24'); });
          foes.forEach(f => { emoji(ctx, f.e, f.x, f.y, f.e === '👹' ? 32 : 24); rr(ctx, f.x - 12, f.y - 18, 24, 4, 2, '#111'); rr(ctx, f.x - 12, f.y - 18, 24 * Math.max(0, f.hp / f.max), 4, 2, f.slow > 0 ? '#38bdf8' : '#22c55e'); }); shots.forEach(s => circ(ctx, s.x, s.y, s.k === 1 ? 5 : 3, ['#fde047', '#111', '#bae6fd'][s.k]));
          rr(ctx, 0, H - 60, W, 60, 0, '#1c1917'); TT.forEach((t, i) => { rr(ctx, i * W / 3 + 4, H - 56, W / 3 - 8, 52, 8, sel === i ? '#7c3aed' : '#292524'); emoji(ctx, t.e, i * W / 3 + 26, H - 30, 24); text(ctx, t.n, i * W / 3 + 72, H - 40, 12, '#fff'); text(ctx, t.cost + ' ●', i * W / 3 + 72, H - 20, 12, '#fbbf24'); });
          if (!spawnLeft && !foes.length && alive) text(ctx, 'Волна ' + (wave + 1) + ' через ' + Math.ceil(between), W / 2, 20, 16, '#fff');
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Прыгающий гном (платформер) ---------- */
  K.levelGame({ id: 'platformer', title: 'Прыгающий гном', icon: '🍄', cat: 'arcade', desc: 'Платформер: беги вправо, прыгай, собирай монеты и топчи жуков', reward: 8, play(c) {
    const { api, L } = c; const W = 400, H = 300, T = 25, LEN = 60 + L.lvl * 10; let tiles, coinsL, foes, flagX, p, cam, hold, jumpQ, got, lives = 3;
    function gen() { tiles = new Set(); coinsL = []; foes = []; let gy = 10; for (let x = 0; x < LEN; x++) { if (x > 8 && x < LEN - 8 && Math.random() < 0.12 + L.lvl * 0.01) { x += api.rand(1, 2); continue; } if (x > 5 && Math.random() < 0.15) gy = clamp(gy + api.rand(-2, 2), 7, 11); for (let y = gy; y < 12; y++) tiles.add(x + ',' + y); if (x > 6 && Math.random() < 0.08) { const py = gy - api.rand(3, 4); for (let k = 0; k < 3; k++) tiles.add(x + k + ',' + py); coinsL.push({ x: (x + 1) * T + T / 2, y: (py - 1) * T + T / 2 }); } if (x > 10 && Math.random() < 0.06 + L.lvl * 0.005) foes.push({ x: x * T, y: (gy - 1) * T, vx: -40, dead: false }); if (Math.random() < 0.12) coinsL.push({ x: x * T + T / 2, y: (gy - 2) * T + T / 2 }); } flagX = (LEN - 4) * T; }
    const solid = (x, y) => tiles.has(Math.floor(x / T) + ',' + Math.floor(y / T));
    function spawn() { p = { x: 2 * T, y: 2 * T, vx: 0, vy: 0, g: false }; cam = 0; }
    gen(); spawn(); got = 0; hold = 0; jumpQ = false;
    let hd;
    const die = () => { lives--; hd.set(2, '❤'.repeat(Math.max(0, lives))); api.sound('bad'); api.vibrate(60); if (lives <= 0) c.lose('Гном выбился из сил'); else spawn(); };
    const a = api.arcade(c.screen, { w: W, h: H, stats: [{ label: 'Ур.', value: L.lvl + 1 }, { label: 'Монеты', value: 0 }, { label: 'Жизни', value: '❤❤❤' }], hint: 'Держите слева/справа — бег, тап по верхней половине — прыжок',
      onDown: q => { if (q.y < H * 0.55) jumpQ = true; hold = q.x < W / 2 ? -1 : 1; if (q.y < H * 0.55 && Math.abs(q.x - W / 2) < 60) hold = 0; }, onMove: (q, e) => { if (e.buttons || e.pointerType === 'touch') hold = q.x < W / 2 ? -1 : 1; }, onUp: () => hold = 0, onKey: e => { if (e.key === 'ArrowLeft') { hold = -1; setTimeout(() => hold = 0, 180); } if (e.key === 'ArrowRight') { hold = 1; setTimeout(() => hold = 0, 180); } if (e.key === 'ArrowUp' || e.key === ' ') jumpQ = true; },
      frame(dt, ctx) {
        if (!c.solved) { p.vx += (hold * 170 - p.vx) * Math.min(1, dt * 10); if (jumpQ && p.g) { p.vy = -440; p.g = false; api.sound('jump'); } jumpQ = false; p.vy = Math.min(p.vy + 1200 * dt, 600);
          p.x += p.vx * dt; if (solid(p.x + 9, p.y - 4) || solid(p.x + 9, p.y - 18)) { p.x = Math.floor((p.x + 9) / T) * T - 9.01; p.vx = 0; } if (solid(p.x - 9, p.y - 4) || solid(p.x - 9, p.y - 18)) { p.x = Math.floor((p.x - 9) / T + 1) * T + 9.01; p.vx = 0; } p.x = Math.max(9, p.x);
          p.y += p.vy * dt; p.g = false; if (p.vy >= 0 && (solid(p.x - 7, p.y) || solid(p.x + 7, p.y))) { p.y = Math.floor(p.y / T) * T; p.vy = 0; p.g = true; } if (p.vy < 0 && (solid(p.x - 7, p.y - 22) || solid(p.x + 7, p.y - 22))) { p.y = Math.floor((p.y - 22) / T + 1) * T + 22; p.vy = 0; }
          if (p.y > H + 40) die();
          foes.forEach(f => { if (f.dead) return; f.x += f.vx * dt; if (!solid(f.x + (f.vx > 0 ? 12 : -12), f.y + 4) || solid(f.x + (f.vx > 0 ? 12 : -12), f.y - 8)) f.vx *= -1; if (Math.abs(f.x - p.x) < 18 && Math.abs(f.y - p.y) < 20) { if (p.vy > 0 && p.y < f.y - 4) { f.dead = true; p.vy = -300; api.sound('good'); } else die(); } });
          coinsL.forEach(k => { if (!k.got && Math.abs(k.x - p.x) < 14 && Math.abs(k.y - (p.y - 12)) < 16) { k.got = true; got++; hd.set(1, got); api.sound('coin'); } });
          if (p.x > flagX) { if (got) api.addCoins(Math.floor(got / 2)); c.win('Монет: ' + got); } cam = clamp(p.x - W / 3, 0, LEN * T - W); }
        const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#60a5fa'); g.addColorStop(1, '#bfdbfe'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.save(); ctx.translate(-Math.floor(cam), 0);
        for (const k of tiles) { const [x, y] = k.split(',').map(Number); if (x * T < cam - T || x * T > cam + W) continue; const top = !tiles.has(x + ',' + (y - 1)); rr(ctx, x * T, y * T, T, T, 0, top ? '#16a34a' : '#92400e'); if (top) rr(ctx, x * T, y * T + 6, T, T - 6, 0, '#a16207'); }
        coinsL.forEach(k => { if (!k.got) { circ(ctx, k.x, k.y, 7, '#fbbf24'); circ(ctx, k.x - 2, k.y - 2, 2, '#fff7'); } }); foes.forEach(f => { if (!f.dead) emoji(ctx, '🐞', f.x, f.y - 8, 20); }); emoji(ctx, '🚩', flagX, 6 * T, 40); emoji(ctx, '🧙', p.x, p.y - 12, 26); ctx.restore();
      } });
    hd = a.hdr; c.unmount = a.stop;
  } });

  /* ---------- Золотоискатель ---------- */
  K.levelGame({ id: 'goldminer', title: 'Золотоискатель', icon: '⛏', cat: 'arcade', desc: 'Крюк качается — тап, чтобы забросить. Набери нужную сумму за 60 секунд', reward: 8, play(c) {
    const { api, L } = c; const W = 360, H = 500, OX = W / 2, OY = 70; let items, ang = 0, dir = 1, state = 'swing', len = 30, grab = null, money = 0, time = 60; const goal = 250 + L.lvl * 150;
    items = []; const add = (e, r, v, w) => { let x, y, k = 0; do { x = api.rand(20, W - 20); y = api.rand(160, H - 20); k++; } while (k < 50 && items.some(i => Math.hypot(i.x - x, i.y - y) < i.r + r + 6)); items.push({ x, y, r, e, v, w }); };
    for (let k = 0; k < 4 + L.lvl; k++) add('🪙', 16, 50, 1.4); for (let k = 0; k < 2; k++) add('🥇', 28, 250, 3); for (let k = 0; k < 4; k++) add('🪨', 20, 20, 3.5); for (let k = 0; k < 2 + Math.floor(L.lvl / 2); k++) add('💎', 10, 400, 1); add('💰', 16, api.rand(30, 600), 1.5);
    let hd; const a = api.arcade(c.screen, { w: W, h: H, stats: [{ label: 'Ур.', value: L.lvl + 1 }, { label: '●', value: '0 / ' + goal }, { label: '⏱', value: 60 }], hint: 'Тап — забросить крюк',
      onDown: () => { if (state === 'swing') { state = 'out'; api.sound('tap'); } },
      frame(dt, ctx) {
        if (!c.solved) { time -= dt; hd.set(2, Math.ceil(time)); if (time <= 0) { if (money >= goal) c.win('Собрано ' + money); else c.lose('Не хватило: ' + money + ' из ' + goal); }
          if (state === 'swing') { ang += dir * 1.6 * dt; if (Math.abs(ang) > 1.25) dir *= -1; } const hx = OX + Math.sin(ang) * len, hy = OY + Math.cos(ang) * len;
          if (state === 'out') { len += 320 * dt; const hit = items.find(i => Math.hypot(i.x - hx, i.y - hy) < i.r + 6); if (hit) { grab = hit; items.splice(items.indexOf(hit), 1); state = 'back'; } if (hx < 0 || hx > W || hy > H) state = 'back'; }
          if (state === 'back') { len -= 320 / (grab ? grab.w : 1) * dt; if (grab) { grab.x = hx; grab.y = hy + grab.r * 0.6; } if (len <= 30) { len = 30; if (grab) { money += grab.v; hd.set(1, money + ' / ' + goal); api.sound(grab.v >= 200 ? 'win' : 'coin'); if (money >= goal && !items.some(i => i.v > 30)) c.win('Собрано ' + money); } grab = null; state = 'swing'; } } }
        bg(ctx, W, H, '#78350f'); const g = ctx.createLinearGradient(0, 0, 0, 100); g.addColorStop(0, '#fde68a'); g.addColorStop(1, '#f59e0b'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 100); for (let y = 110; y < H; y += 40) { ctx.fillStyle = y % 80 ? '#92400e' : '#7c2d12'; ctx.fillRect(0, y, W, 40); }
        emoji(ctx, '👷', OX, OY - 30, 36); const hx = OX + Math.sin(ang) * len, hy = OY + Math.cos(ang) * len; K.line(ctx, OX, OY, hx, hy, '#1c1917', 2); ctx.save(); ctx.translate(hx, hy); ctx.rotate(-ang); K.line(ctx, -8, 0, 0, 8, '#e5e7eb', 3); K.line(ctx, 8, 0, 0, 8, '#e5e7eb', 3); ctx.restore();
        items.forEach(i => emoji(ctx, i.e, i.x, i.y, i.r * 2)); if (grab) emoji(ctx, grab.e, grab.x, grab.y, grab.r * 2);
      } });
    hd = a.hdr; c.unmount = a.stop;
  } });

  /* ---------- Кран-машина ---------- */
  Games.register({ id: 'clawmachine', title: 'Кран-машина', icon: '🧸', cat: 'arcade', desc: 'Двигай клешню и хватай игрушки. 5 попыток', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 520, FLOOR = 470; let toys, cx, cy, state, tries, score, held, hold, open;
      const T = ['🧸', '🐰', '🦄', '🐶', '🐱', '🐸', '🦖', '🐙', '⚽', '🎁', '🐧', '🦊'];
      function reset() { toys = []; for (let i = 0; i < 16; i++) toys.push({ x: api.rand(40, W - 40), y: FLOOR - api.rand(0, 40), e: K.pick(T), v: Math.random() < 0.15 ? 3 : 1 }); cx = W / 2; cy = 70; state = 'move'; tries = 5; score = 0; held = null; hold = 0; open = 1; a.hdr.set(0, 5); a.hdr.set(1, 0); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Попыток', value: 5 }, { label: 'Приз', value: 0 }, { label: 'Рекорд', value: api.bestOf('clawmachine') || 0 }], hint: 'Держите слева/справа — двигать. Тап по центру — опустить',
        onDown: p => { if (state !== 'move') return; if (Math.abs(p.x - cx) < 40 && p.y < 200 || Math.abs(p.x - W / 2) < 50 && p.y > 200) { state = 'down'; api.sound('tap'); } else hold = p.x < cx ? -1 : 1; }, onUp: () => hold = 0, onKey: e => { if (e.key === 'ArrowLeft') cx -= 15; if (e.key === 'ArrowRight') cx += 15; if (e.key === ' ' && state === 'move') state = 'down'; },
        frame(dt, ctx) {
          if (state === 'move') cx = clamp(cx + hold * 160 * dt, 30, W - 30);
          if (state === 'down') { cy += 180 * dt; const t = toys.find(t => Math.abs(t.x - cx) < 22 && Math.abs(t.y - (cy + 30)) < 16); if (cy > FLOOR - 40 || t) { state = 'grab'; a._t = 0.35; } }
          if (state === 'grab') { open = Math.max(0, open - dt * 3); a._t -= dt; if (a._t <= 0) { const t = toys.filter(t => Math.abs(t.x - cx) < 26 && Math.abs(t.y - (cy + 30)) < 30).sort((p, q) => Math.abs(p.x - cx) - Math.abs(q.x - cx))[0]; const chance = t ? 0.85 - Math.abs(t.x - cx) / 40 : 0; if (t && Math.random() < chance) { held = t; toys.splice(toys.indexOf(t), 1); } state = 'up'; } }
          if (state === 'up') { cy -= 150 * dt; if (held && Math.random() < dt * 0.25) { held.y = cy + 34; toys.push(held); held = null; api.sound('bad'); } if (cy <= 70) { cy = 70; state = 'home'; } }
          if (state === 'home') { cx -= 180 * dt; if (cx <= 40) { cx = 40; open = 1; if (held) { score += held.v; a.hdr.set(1, score); api.sound('win'); api.addCoins(held.v * 3); held = null; } tries--; a.hdr.set(0, tries); if (tries <= 0) { state = 'over'; api.best('clawmachine', score); api.end({ win: score > 0, title: 'Призов: ' + score, reward: 0, text: 'Монеты за призы уже начислены', onAgain: reset }); } else state = 'move'; } }
          toys.forEach(t => { if (t.y < FLOOR) t.y = Math.min(FLOOR, t.y + 200 * dt); });
          bg(ctx, W, H, '#1e1b4b'); rr(ctx, 0, FLOOR + 16, W, H - FLOOR, 0, '#312e81'); rr(ctx, 6, 100, 60, FLOOR - 84, 6, 'rgba(255,255,255,.08)'); text(ctx, 'ПРИЗ', 36, 90, 12, '#fbbf24'); K.line(ctx, 0, 40, W, 40, '#6366f1', 6);
          toys.forEach(t => { emoji(ctx, t.e, t.x, t.y, 34); if (t.v > 1) text(ctx, '★', t.x + 14, t.y - 14, 12, '#fbbf24'); }); K.line(ctx, cx, 40, cx, cy, '#cbd5e1', 2); rr(ctx, cx - 14, cy - 6, 28, 12, 4, '#94a3b8'); const sp = 10 + open * 12; K.line(ctx, cx - 6, cy + 6, cx - sp, cy + 32, '#e5e7eb', 4); K.line(ctx, cx + 6, cy + 6, cx + sp, cy + 32, '#e5e7eb', 4); if (held) emoji(ctx, held.e, cx, cy + 34, 34);
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Прыжки по стенам ---------- */
  Games.register({ id: 'walljump', title: 'Ниндзя на стенах', icon: '🥷', cat: 'arcade', desc: 'Прыгай между стенами вверх, уворачиваясь от шипов и птиц', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 600; let side, y, jt, score, alive, hz, cam, spd;
      function reset() { side = 0; y = H - 100; jt = 0; score = 0; alive = true; hz = []; cam = 0; spd = 90; a.hdr.set(0, 0); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Высота', value: 0 }, { label: 'Рекорд', value: api.bestOf('walljump') || 0 }], hint: 'Тап — прыжок на другую стену',
        onDown: () => { if (alive && jt <= 0) { jt = 0.32; api.sound('jump'); } }, onKey: e => { if (e.key === ' ' && alive && jt <= 0) jt = 0.32; },
        frame(dt, ctx) {
          const x0 = 36, x1 = W - 36; let px; if (alive) { spd += dt * 2; cam -= spd * dt; y -= spd * dt; score = Math.floor(-cam / 10); a.hdr.set(0, score); if (score && score % 150 === 0 && !a._c) { a._c = true; api.addCoins(3); } else if (score % 150) a._c = false; if (jt > 0) { jt -= dt; y -= 90 * dt; if (jt <= 0) side = 1 - side; }
            const topY = Math.min(cam, ...hz.map(h => h.y)); if (!hz.length || topY > cam - H) { const ny = (hz.length ? Math.min(...hz.map(h => h.y)) : cam) - api.rand(140, 230); hz.push(Math.random() < 0.7 ? { y: ny, side: api.rand(0, 1), k: 'spike' } : { y: ny, k: 'bird', x: W / 2, vx: (Math.random() < 0.5 ? -1 : 1) * 90 }); } }
          const prog = jt > 0 ? 1 - jt / 0.32 : 0; px = side ? x1 - (x1 - x0) * prog : x0 + (x1 - x0) * prog;
          if (alive) hz.forEach(h => { if (h.k === 'bird') { h.x += h.vx * dt; if (h.x < 60 || h.x > W - 60) h.vx *= -1; if (Math.hypot(h.x - px, h.y - y) < 24) alive = false; } else { const sx = h.side ? x1 : x0; if (Math.abs(h.y - y) < 26 && Math.abs(sx - px) < 20) alive = false; } }); hz = hz.filter(h => h.y < cam + H + 60);
          if (!alive && !a._d) { a._d = true; api.sound('boom'); api.vibrate([60, 40, 120]); over(api, 'walljump', score, 'Сбили!', 15, () => { a._d = false; reset(); }); }
          bg(ctx, W, H, '#0f172a'); rr(ctx, 0, 0, 24, H, 0, '#334155'); rr(ctx, W - 24, 0, 24, H, 0, '#334155'); ctx.save(); ctx.translate(0, -cam + 0); for (let yy = Math.floor(cam / 60) * 60; yy < cam + H; yy += 60) { rr(ctx, 0, yy, 24, 2, 0, '#1e293b'); rr(ctx, W - 24, yy, 24, 2, 0, '#1e293b'); }
          hz.forEach(h => { if (h.k === 'bird') emoji(ctx, '🦅', h.x, h.y, 30); else { ctx.fillStyle = '#ef4444'; ctx.beginPath(); const sx = h.side ? W - 24 : 24, d = h.side ? -1 : 1; ctx.moveTo(sx, h.y - 22); ctx.lineTo(sx + d * 26, h.y); ctx.lineTo(sx, h.y + 22); ctx.fill(); } }); emoji(ctx, '🥷', px, y, 32); ctx.restore();
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Паук на нити ---------- */
  Games.register({ id: 'swing', title: 'Паук на нити', icon: '🕷', cat: 'arcade', desc: 'Держи палец — нить цепляется за потолок. Отпусти — лети. Не касайся пола', bestLabel: 'Рекорд (м)',
    mount(screen, api) {
      const W = 400, H = 400; let p, anchor, alive, cam, len, dist;
      function reset() { p = { x: 80, y: 150, vx: 160, vy: 0 }; anchor = null; alive = true; cam = 0; dist = 0; a.hdr.set(0, 0); }
      const ceil = X => 30 + Math.sin(X / 200) * 16 + (Math.sin(X / 71) > 0.85 ? 60 : 0);
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Метры', value: 0 }, { label: 'Рекорд', value: api.bestOf('swing') || 0 }], hint: 'Держите — зацепиться, отпустите — полёт',
        onDown: () => { if (!alive) return; const ax = p.x + 110; anchor = { x: ax, y: ceil(ax) }; len = Math.hypot(p.x - anchor.x, p.y - anchor.y); api.sound('tap'); }, onUp: () => anchor = null, onKey: e => { if (e.key === ' ') { if (anchor) anchor = null; else { const ax = p.x + 110; anchor = { x: ax, y: ceil(ax) }; len = Math.hypot(p.x - anchor.x, p.y - anchor.y); } } },
        frame(dt, ctx) {
          if (alive) for (let s = 0; s < 3; s++) { const sd = dt / 3; p.vy += 700 * sd; p.x += p.vx * sd; p.y += p.vy * sd; if (anchor) { const dx = p.x - anchor.x, dy = p.y - anchor.y, d = Math.hypot(dx, dy); if (d > len) { const nx = dx / d, ny = dy / d; p.x = anchor.x + nx * len; p.y = anchor.y + ny * len; const vn = p.vx * nx + p.vy * ny; if (vn > 0) { p.vx -= vn * nx; p.vy -= vn * ny; } } } p.vx = Math.max(p.vx, 60); if (p.y > H - 20 || p.y < ceil(p.x) + 6) { alive = false; api.sound('boom'); const m = Math.floor(dist); over(api, 'swing', m, p.y > H - 20 ? 'Упали на пол' : 'Врезались в потолок', 20, reset); break; } }
          dist = (p.x - 80) / 10; a.hdr.set(0, Math.floor(dist)); cam = p.x - 120;
          bg(ctx, W, H, '#1f1135'); ctx.fillStyle = '#4c1d95'; ctx.beginPath(); ctx.moveTo(0, 0); for (let X = 0; X <= W; X += 5) ctx.lineTo(X, ceil(cam + X)); ctx.lineTo(W, 0); ctx.fill(); ctx.fillStyle = '#7f1d1d'; ctx.fillRect(0, H - 20, W, 20); for (let X = -((cam) % 20); X < W; X += 20) { ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.moveTo(X, H - 20); ctx.lineTo(X + 10, H - 32); ctx.lineTo(X + 20, H - 20); ctx.fill(); }
          if (anchor) K.line(ctx, anchor.x - cam, anchor.y, p.x - cam, p.y, '#e5e7eb', 2); emoji(ctx, '🕷', p.x - cam, p.y, 26);
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Зомби ---------- */
  Games.register({ id: 'zombies', title: 'Зомби-осада', icon: '🧟', cat: 'arcade', desc: 'Ты в центре, зомби со всех сторон. Тапай — стреляй в ту сторону', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 560; let me, zs, bullets, score, hp, t, alive, ammo, reload, pups;
      function reset() { me = { x: W / 2, y: H / 2 }; zs = []; bullets = []; pups = []; score = 0; hp = 5; t = 0; alive = true; ammo = 12; reload = 0; a.hdr.set(0, 0); a.hdr.set(1, '❤'.repeat(5)); a.hdr.set(2, 12); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Убито', value: 0 }, { label: '❤', value: '❤❤❤❤❤' }, { label: '🔫', value: 12 }], hint: 'Тап — выстрел в направлении тапа. Патроны перезаряжаются сами',
        onDown: p => { if (!alive) return; if (ammo <= 0) { api.sound('bad'); return; } ammo--; a.hdr.set(2, ammo || '…'); const d = Math.hypot(p.x - me.x, p.y - me.y) || 1; bullets.push({ x: me.x, y: me.y, vx: (p.x - me.x) / d * 600, vy: (p.y - me.y) / d * 600 }); api.sound('tap'); a._ang = Math.atan2(p.y - me.y, p.x - me.x); },
        frame(dt, ctx) {
          if (alive) { t += dt; reload += dt; if (reload > 0.45 && ammo < 12) { ammo++; reload = 0; a.hdr.set(2, ammo); } if (Math.random() < dt * (0.8 + t / 20)) { const ang = Math.random() * 6.28; const big = Math.random() < Math.min(0.3, t / 200); zs.push({ x: me.x + Math.cos(ang) * 340, y: me.y + Math.sin(ang) * 340, hp: big ? 4 : 1, sp: big ? 30 : 40 + Math.random() * 30 + t / 5, big }); }
            zs.forEach(z => { const dx = me.x - z.x, dy = me.y - z.y, d = Math.hypot(dx, dy); z.x += dx / d * z.sp * dt; z.y += dy / d * z.sp * dt; if (d < 22) { z.dead = true; hp--; a.hdr.set(1, '❤'.repeat(Math.max(0, hp))); api.sound('bad'); api.vibrate(60); if (hp <= 0) { alive = false; over(api, 'zombies', score, 'Вас съели', 5, reset); } } });
            bullets.forEach(b => { b.x += b.vx * dt; b.y += b.vy * dt; const z = zs.find(z => !z.dead && Math.hypot(z.x - b.x, z.y - b.y) < (z.big ? 22 : 15)); if (z) { b.dead = true; z.hp--; if (z.hp <= 0) { z.dead = true; score++; a.hdr.set(0, score); api.sound('select'); if (score % 25 === 0) api.addCoins(4); if (Math.random() < 0.05) pups.push({ x: z.x, y: z.y, life: 6 }); } } }); pups.forEach(p => { p.life -= dt; if (Math.hypot(p.x - me.x, p.y - me.y) < 200) { p.x += (me.x - p.x) * dt * 2; p.y += (me.y - p.y) * dt * 2; } if (Math.hypot(p.x - me.x, p.y - me.y) < 20) { p.life = 0; hp = Math.min(5, hp + 1); a.hdr.set(1, '❤'.repeat(hp)); api.sound('coin'); } });
            zs = zs.filter(z => !z.dead); bullets = bullets.filter(b => !b.dead && b.x > -10 && b.x < W + 10 && b.y > -10 && b.y < H + 10); pups = pups.filter(p => p.life > 0); }
          bg(ctx, W, H, '#1c1917'); for (let i = 0; i < 20; i++) circ(ctx, (i * 97) % W, (i * 173) % H, 18, '#292524'); pups.forEach(p => emoji(ctx, '🩹', p.x, p.y, 20)); zs.forEach(z => emoji(ctx, z.big ? '🧌' : '🧟', z.x, z.y, z.big ? 40 : 30)); bullets.forEach(b => circ(ctx, b.x, b.y, 3, '#fde047')); emoji(ctx, '🤠', me.x, me.y, 34); if (a._ang != null) { K.line(ctx, me.x, me.y, me.x + Math.cos(a._ang) * 30, me.y + Math.sin(a._ang) * 30, '#9ca3af', 4); }
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Сплав ---------- */
  Games.register({ id: 'rafting', title: 'Сплав', icon: '🛶', cat: 'arcade', desc: 'Правь лодкой по бурной реке, объезжай камни и собирай флажки', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 600; let bx, bvx, banks, rocks, flags, dist, alive, hold, speed, score;
      function reset() { bx = W / 2; bvx = 0; banks = []; let c = W / 2; for (let y = -40; y < H + 40; y += 20) { banks.push({ y, c, w: 220 }); } rocks = []; flags = []; dist = 0; score = 0; alive = true; hold = 0; speed = 150; a.hdr.set(0, 0); }
      const bankAt = y => { const b = banks.reduce((p, q) => Math.abs(q.y - y) < Math.abs(p.y - y) ? q : p); return b; };
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Очки', value: 0 }, { label: 'Рекорд', value: api.bestOf('rafting') || 0 }], hint: 'Держите слева/справа — грести в эту сторону',
        onDown: p => hold = p.x < W / 2 ? -1 : 1, onUp: () => hold = 0, onKey: e => { if (e.key === 'ArrowLeft') { hold = -1; setTimeout(() => hold = 0, 200); } if (e.key === 'ArrowRight') { hold = 1; setTimeout(() => hold = 0, 200); } },
        frame(dt, ctx) {
          if (alive) { speed += dt * 3; dist += speed * dt; banks.forEach(b => b.y += speed * dt); rocks.forEach(r => r.y += speed * dt); flags.forEach(f => f.y += speed * dt); banks = banks.filter(b => b.y < H + 40); while (banks[banks.length - 1].y > -40) { const l = banks[banks.length - 1]; const c = clamp(l.c + api.rand(-14, 14), 110, W - 110); banks.push({ y: l.y - 20, c, w: Math.max(150, 220 - dist / 300) }); if (Math.random() < 0.12 + dist / 40000) rocks.push({ x: c + api.rand(-l.w / 2 + 20, l.w / 2 - 20), y: l.y - 20, r: api.rand(10, 18) }); if (Math.random() < 0.05) flags.push({ x: c + api.rand(-50, 50), y: l.y - 20 }); }
            const b = bankAt(H - 120); const cur = (b.c - bx) * 0.6; bvx += (hold * 220 + cur - bvx) * Math.min(1, dt * 3); bx += bvx * dt; if (bx < b.c - b.w / 2 + 12 || bx > b.c + b.w / 2 - 12) { alive = false; api.sound('boom'); over(api, 'rafting', score, 'Выбросило на берег', 10, reset); } rocks.forEach(r => { if (Math.hypot(r.x - bx, r.y - (H - 120)) < r.r + 12) { alive = false; api.sound('boom'); api.vibrate([60, 40, 120]); } }); if (!alive && !a._o) { a._o = true; over(api, 'rafting', score, 'Разбились о камень', 10, () => { a._o = false; reset(); }); } flags.forEach(f => { if (!f.got && Math.hypot(f.x - bx, f.y - (H - 120)) < 22) { f.got = true; score += 10; api.sound('coin'); } }); score = Math.max(score, 0); a.hdr.set(0, score + Math.floor(dist / 100)); rocks = rocks.filter(r => r.y < H + 30); flags = flags.filter(f => f.y < H + 30 && !f.got); if (!alive) score += Math.floor(dist / 100); }
          bg(ctx, W, H, '#166534'); ctx.fillStyle = '#0ea5e9'; ctx.beginPath(); banks.forEach((b, i) => i ? ctx.lineTo(b.c - b.w / 2, b.y) : ctx.moveTo(b.c - b.w / 2, b.y)); for (let i = banks.length - 1; i >= 0; i--) ctx.lineTo(banks[i].c + banks[i].w / 2, banks[i].y); ctx.fill(); for (let i = 0; i < 20; i++) rr(ctx, (i * 67) % W, ((i * 131) + dist) % H, 18, 2, 1, 'rgba(255,255,255,.4)');
          rocks.forEach(r => { circ(ctx, r.x, r.y, r.r, '#57534e'); circ(ctx, r.x - r.r * .3, r.y - r.r * .3, r.r * .35, '#78716c'); }); flags.forEach(f => emoji(ctx, '🚩', f.x, f.y, 22)); ctx.save(); ctx.translate(bx, H - 120); ctx.rotate(clamp(bvx / 400, -0.5, 0.5)); emoji(ctx, '🛶', 0, 0, 38); ctx.restore();
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Жуки ---------- */
  Games.register({ id: 'bugs', title: 'Жуки', icon: '🪲', cat: 'arcade', desc: 'Жуки ползут к пирогу! Дави их, но не трогай божьих коровок', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 560, CX = W / 2, CY = H / 2; let bugs, score, pie, t, alive, splats;
      function reset() { bugs = []; score = 0; pie = 10; t = 0; alive = true; splats = []; a.hdr.set(0, 0); a.hdr.set(1, 10); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Раздавлено', value: 0 }, { label: '🥧', value: 10 }, { label: 'Рекорд', value: api.bestOf('bugs') || 0 }], hint: 'Тапайте по жукам. Божьи коровки 🐞 — друзья!',
        onDown: p => { if (!alive) return; const b = bugs.find(b => !b.dead && Math.hypot(b.x - p.x, b.y - p.y) < 26); if (!b) return; b.dead = true; splats.push({ x: b.x, y: b.y, t: 1.5 }); if (b.friend) { pie -= 2; a.hdr.set(1, Math.max(0, pie)); api.sound('bad'); api.vibrate(60); } else { score++; a.hdr.set(0, score); api.sound('tap'); if (score % 30 === 0) api.addCoins(3); } check(); },
        frame(dt, ctx) {
          if (alive) { t += dt; if (Math.random() < dt * (1.2 + t / 15)) { const ang = Math.random() * 6.28; bugs.push({ x: CX + Math.cos(ang) * 320, y: CY + Math.sin(ang) * 320, sp: 40 + Math.random() * 30 + t, friend: Math.random() < 0.15, wob: Math.random() * 6 }); }
            bugs.forEach(b => { if (b.dead) return; const dx = CX - b.x, dy = CY - b.y, d = Math.hypot(dx, dy); const ang = Math.atan2(dy, dx) + Math.sin(t * 5 + b.wob) * 0.6; b.x += Math.cos(ang) * b.sp * dt; b.y += Math.sin(ang) * b.sp * dt; b.a = ang; if (d < 30) { b.dead = true; if (!b.friend) { pie--; a.hdr.set(1, Math.max(0, pie)); api.sound('bad'); } check(); } }); bugs = bugs.filter(b => !b.dead); splats.forEach(s => s.t -= dt); splats = splats.filter(s => s.t > 0); }
          bg(ctx, W, H, '#fef3c7'); for (let y = 0; y < H; y += 40) for (let x = (y / 40) % 2 * 40; x < W; x += 80) rr(ctx, x, y, 40, 40, 0, '#fde68a'); splats.forEach(s => { ctx.globalAlpha = s.t / 1.5; circ(ctx, s.x, s.y, 14, '#65a30d'); }); ctx.globalAlpha = 1; emoji(ctx, '🥧', CX, CY, 56);
          bugs.forEach(b => { ctx.save(); ctx.translate(b.x, b.y); ctx.rotate((b.a || 0) + Math.PI / 2); emoji(ctx, b.friend ? '🐞' : '🪲', 0, 0, 30); ctx.restore(); });
        } });
      function check() { if (pie <= 0 && alive) { alive = false; over(api, 'bugs', score, 'Пирог съеден!', 5, reset); } }
      this.unmount = a.stop; reset();
    } });

  /* ---------- Кольцеброс ---------- */
  Games.register({ id: 'ringtoss', title: 'Кольцеброс', icon: '⭕', cat: 'arcade', desc: 'Смахни кольцо вверх, чтобы оно наделось на колышек. 10 бросков', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 560; let pegs, ring, throws, score, sp;
      function reset() { pegs = [[90, 170, 3], [180, 130, 5], [270, 170, 3], [130, 250, 2], [230, 250, 2], [180, 330, 1]].map(([x, y, v]) => ({ x, y, v, n: 0 })); throws = 10; score = 0; newRing(); a.hdr.set(0, 0); a.hdr.set(1, 10); }
      const newRing = () => { ring = { x: W / 2, y: H - 70, z: 0, vx: 0, vy: 0, vz: 0, fly: false }; };
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Очки', value: 0 }, { label: 'Бросков', value: 10 }, { label: 'Рекорд', value: api.bestOf('ringtoss') || 0 }], hint: 'Смахните кольцо вверх к колышку',
        onDown: p => { if (!ring.fly && throws > 0) sp = { p, t: performance.now() }; }, onUp: p => { if (!sp || p.x < 0) { sp = null; return; } const dt = Math.max(60, performance.now() - sp.t); const dx = p.x - sp.p.x, dy = p.y - sp.p.y; sp = null; if (dy > -30) return; const tx = ring.x + dx * 1.3, ty = ring.y + dy * 1.6 - 60 * (200 / dt); ring.fly = true; ring.t = 0; ring.T = 0.9; ring.sx = ring.x; ring.sy = ring.y; ring.tx = clamp(tx, 20, W - 20) + api.rand(-10, 10); ring.ty = clamp(ty, 60, H - 150) + api.rand(-10, 10); throws--; a.hdr.set(1, throws); api.sound('jump'); },
        frame(dt, ctx) {
          if (ring.fly) { ring.t += dt; const k = Math.min(1, ring.t / ring.T); ring.x = ring.sx + (ring.tx - ring.sx) * k; ring.y = ring.sy + (ring.ty - ring.sy) * k; ring.z = Math.sin(k * Math.PI) * 80; if (k >= 1) { ring.fly = false; const pg = pegs.find(p => Math.hypot(p.x - ring.x, (p.y - ring.y) * 1.5) < 18); if (pg) { pg.n++; score += pg.v; a.hdr.set(0, score); api.sound('good'); api.vibrate(20); } else api.sound('bad'); setTimeout(() => { if (throws > 0) newRing(); else { api.best('ringtoss', score); api.end({ title: 'Очки: ' + score, reward: Math.floor(score / 3), onAgain: reset }); } }, 500); } }
          bg(ctx, W, H, '#7c2d12'); ctx.fillStyle = '#9a3412'; for (let y = 0; y < H; y += 24) ctx.fillRect(0, y, W, 2); pegs.forEach(p => { ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(p.x, p.y, 16, 6, 0, 0, 7); ctx.fill(); rr(ctx, p.x - 4, p.y - 50, 8, 50, 3, '#fde68a'); text(ctx, p.v, p.x, p.y + 14, 13, '#fbbf24'); for (let k = 0; k < p.n; k++) { ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(p.x, p.y - 4 - k * 5, 16, 5, 0, 0, 7); ctx.stroke(); } });
          if (throws > 0 || ring.fly) { ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(ring.x, ring.y - ring.z, 18 + ring.z / 12, 7 + ring.z / 20, 0, 0, 7); ctx.stroke(); }
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Городки ---------- */
  Games.register({ id: 'gorodki', title: 'Городки', icon: '🪵', cat: 'arcade', desc: 'Русская народная игра: выбей битой все чурки фигуры из «города»', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 560, CITY = { x: 90, y: 60, w: 180, h: 120 }; const FIG = [['Пушка', [[0, 0, 1], [-1, 0, 0], [1, 0, 0], [0, 1, 1], [0, -1, 1]]], ['Колодец', [[-1, -1, 0], [1, -1, 0], [-1, 1, 0], [1, 1, 0], [0, -1, 1], [0, 1, 1], [-1, 0, 1], [1, 0, 1]]], ['Стрела', [[0, -2, 1], [0, -1, 1], [0, 0, 1], [-1, 1, 0], [1, 1, 0]]], ['Забор', [[-2, 0, 1], [-1, 0, 1], [0, 0, 1], [1, 0, 1], [2, 0, 1]]], ['Рак', [[0, 0, 1], [-1, -1, 0], [1, -1, 0], [-1, 1, 0], [1, 1, 0]]]];
      let fig, pieces, bat, bats, score, drag;
      function setFig() { const [n, ps] = FIG[fig]; pieces = ps.map(([x, y, vert]) => ({ x: W / 2 + x * 26, y: 120 + y * 26, vx: 0, vy: 0, a: vert ? Math.PI / 2 : 0, va: 0 })); a.hdr.set(0, n); }
      function reset() { fig = 0; bats = 12; score = 0; setFig(); newBat(); a.hdr.set(1, bats); }
      const newBat = () => { bat = { x: W / 2, y: H - 60, vx: 0, vy: 0, a: 0, va: 0, fly: false }; };
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Фигура', value: '' }, { label: 'Бит', value: 12 }, { label: 'Рекорд', value: api.bestOf('gorodki') || 0 }], hint: 'Смахните биту вверх в сторону «города»',
        onDown: p => { if (!bat.fly && bats > 0) drag = { p, t: performance.now() }; }, onUp: p => { if (!drag || p.x < 0) { drag = null; return; } const dt = Math.max(50, performance.now() - drag.t); const dx = p.x - drag.p.x, dy = p.y - drag.p.y; drag = null; if (dy > -30) return; const sp = clamp(Math.hypot(dx, dy) / dt * 900, 350, 900); const d = Math.hypot(dx, dy); bat.vx = dx / d * sp; bat.vy = dy / d * sp; bat.va = 10 * (Math.random() < 0.5 ? 1 : -1); bat.fly = true; bats--; a.hdr.set(1, bats); api.sound('jump'); },
        frame(dt, ctx) {
          if (bat.fly) { bat.x += bat.vx * dt; bat.y += bat.vy * dt; bat.a += bat.va * dt; bat.vx *= Math.pow(0.6, dt); bat.vy *= Math.pow(0.6, dt); pieces.forEach(pc => { if (Math.hypot(pc.x - bat.x, pc.y - bat.y) < 34) { const m = 0.7; pc.vx += bat.vx * m + api.rand(-80, 80); pc.vy += bat.vy * m + api.rand(-60, 60); pc.va += api.rand(-12, 12); api.sound('select'); } }); if (bat.y < -40 || bat.x < -40 || bat.x > W + 40 || Math.hypot(bat.vx, bat.vy) < 40) { bat.fly = false; setTimeout(settle, 700); } }
          pieces.forEach(pc => { pc.x += pc.vx * dt; pc.y += pc.vy * dt; pc.a += pc.va * dt; pc.vx *= Math.pow(0.15, dt); pc.vy *= Math.pow(0.15, dt); pc.va *= Math.pow(0.2, dt); });
          bg(ctx, W, H, '#65a30d'); rr(ctx, CITY.x, CITY.y, CITY.w, CITY.h, 0, '#a16207'); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.strokeRect(CITY.x, CITY.y, CITY.w, CITY.h); K.line(ctx, 0, H - 110, W, H - 110, '#fff', 3);
          pieces.forEach(pc => { ctx.save(); ctx.translate(pc.x, pc.y); ctx.rotate(pc.a); rr(ctx, -13, -6, 26, 12, 3, '#fde68a'); rr(ctx, -13, -6, 4, 12, 2, '#d97706'); rr(ctx, 9, -6, 4, 12, 2, '#d97706'); ctx.restore(); });
          if (bats > 0 || bat.fly) { ctx.save(); ctx.translate(bat.x, bat.y); ctx.rotate(bat.a); rr(ctx, -40, -5, 80, 10, 4, '#78350f'); ctx.restore(); }
        } });
      function settle() { const inCity = pc => pc.x > CITY.x && pc.x < CITY.x + CITY.w && pc.y > CITY.y && pc.y < CITY.y + CITY.h; const before = pieces.length; pieces = pieces.filter(inCity); score += before - pieces.length; if (!pieces.length) { score += 5; fig++; api.sound('win'); api.addCoins(3); if (fig >= FIG.length) { api.best('gorodki', score + bats * 2); api.end({ title: 'Все фигуры выбиты!', reward: 10 + bats * 2, text: 'Очки: ' + (score + bats * 2), onAgain: reset }); return; } setFig(); } if (bats <= 0) { api.best('gorodki', score); api.end({ win: false, title: 'Биты кончились', reward: Math.floor(score / 3), text: 'Очки: ' + score, onAgain: reset }); return; } newBat(); }
      this.unmount = a.stop; reset();
    } });
})();
