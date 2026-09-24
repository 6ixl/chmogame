/* Аркады, часть A (пакет 200+) */
(function () {
  const K = window.Kit; const { rr, circ, text, emoji, bg, over, clamp } = K;
  const follow = (a) => ({ onDown: p => { a.tx = p.x; a.ty = p.y; a.down = true; }, onMove: (p, e) => { if (a.down || e.pointerType === 'mouse') { a.tx = p.x; a.ty = p.y; } }, onUp: () => { a.down = false; } });

  /* ---------- Пинбол ---------- */
  Games.register({ id: 'pinball', title: 'Пинбол', icon: '🪩', cat: 'arcade', desc: 'Флипперы, бамперы и 3 шарика. Тап слева/справа — удар флиппером', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 600, R = 9; let b, score, balls, L, Rf, bumpers, alive, launched;
      const fl = (x, y, dir) => ({ x, y, dir, a: 0.45, up: false });
      function reset() { score = 0; balls = 3; alive = true; bumpers = [[110, 170, 22, 0], [250, 170, 22, 0], [180, 250, 26, 0], [90, 330, 16, 0], [270, 330, 16, 0]]; L = fl(100, 520, 1); Rf = fl(260, 520, -1); newBall(); a.hdr.set(0, 0); a.hdr.set(1, '●●●'); }
      function newBall() { b = { x: W - 24, y: 520, vx: 0, vy: 0 }; launched = false; }
      const tip = f => ({ x: f.x + f.dir * Math.cos(f.up ? -0.45 : 0.45) * 70, y: f.y + Math.sin(f.up ? -0.45 : 0.45) * 70 });
      const segHit = (x1, y1, x2, y2, bounce, kick) => { const dx = x2 - x1, dy = y2 - y1; const t = clamp(((b.x - x1) * dx + (b.y - y1) * dy) / (dx * dx + dy * dy), 0, 1); const px = x1 + t * dx, py = y1 + t * dy; const d = Math.hypot(b.x - px, b.y - py); if (d < R + 4) { const nx = (b.x - px) / (d || 1), ny = (b.y - py) / (d || 1); const vn = b.vx * nx + b.vy * ny; if (vn < 0) { b.vx -= (1 + bounce) * vn * nx; b.vy -= (1 + bounce) * vn * ny; } b.x = px + nx * (R + 4); b.y = py + ny * (R + 4); if (kick) { b.vx += nx * kick * t; b.vy += ny * kick * t - kick * 0.3 * t; } return true; } return false; };
      const press = (side, v) => { if (side) Rf.up = v; else L.up = v; if (v && !launched) { launched = true; b.vy = -900; b.vx = -40; } if (v) api.sound('tap'); };
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Очки', value: 0 }, { label: 'Шары', value: '●●●' }, { label: 'Рекорд', value: api.bestOf('pinball') || 0 }], hint: 'Левая/правая половина экрана — флипперы. Первый тап — запуск',
        onDown: p => press(p.x > W / 2 ? 1 : 0, true), onUp: () => { L.up = false; Rf.up = false; }, onKey: e => { if (e.key === 'ArrowLeft' || e.key === 'z') press(0, true); if (e.key === 'ArrowRight' || e.key === '/') press(1, true); setTimeout(() => { L.up = Rf.up = false; }, 150); },
        frame(dt, ctx) {
          if (alive && launched) for (let s = 0; s < 4; s++) { const sd = dt / 4; b.vy += 700 * sd; b.x += b.vx * sd; b.y += b.vy * sd; const sp = Math.hypot(b.vx, b.vy); if (sp > 1300) { b.vx *= 1300 / sp; b.vy *= 1300 / sp; }
            if (b.x < 12 + R) { b.x = 12 + R; b.vx = Math.abs(b.vx) * 0.8; } if (b.x > W - 12 - R) { b.x = W - 12 - R; b.vx = -Math.abs(b.vx) * 0.8; } if (b.y < 12 + R) { b.y = 12 + R; b.vy = Math.abs(b.vy) * 0.8; }
            segHit(12, 60, 70, 12, 0.6); segHit(W - 12, 60, W - 70, 12, 0.6); segHit(12, 440, L.x, L.y, 0.3); segHit(W - 12, 440, Rf.x, Rf.y, 0.3);
            for (const f of [L, Rf]) { const t = tip(f); if (segHit(f.x, f.y, t.x, t.y, 0.4, f.up ? 520 : 0) && f.up) { b.vy = Math.min(b.vy, -700); } }
            for (const bu of bumpers) { const d = Math.hypot(b.x - bu[0], b.y - bu[1]); if (d < bu[2] + R) { const nx = (b.x - bu[0]) / d, ny = (b.y - bu[1]) / d; b.x = bu[0] + nx * (bu[2] + R); b.y = bu[1] + ny * (bu[2] + R); const vn = b.vx * nx + b.vy * ny; b.vx -= 2 * vn * nx; b.vy -= 2 * vn * ny; b.vx += nx * 250; b.vy += ny * 250; bu[3] = 0.2; score += 10; a.hdr.set(0, score); api.sound('select'); if (score % 500 === 0) api.addCoins(3); } }
            if (b.y > H + 20) { balls--; a.hdr.set(1, '●'.repeat(balls)); api.sound('bad'); if (balls <= 0) { alive = false; over(api, 'pinball', score, 'Шары закончились', 50, reset); } else newBall(); break; } }
          bg(ctx, W, H, '#1e1038'); ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(12, 440); ctx.lineTo(12, 60); ctx.lineTo(70, 12); ctx.lineTo(W - 70, 12); ctx.lineTo(W - 12, 60); ctx.lineTo(W - 12, 440); ctx.stroke(); K.line(ctx, 12, 440, L.x, L.y, '#a78bfa', 6); K.line(ctx, W - 12, 440, Rf.x, Rf.y, '#a78bfa', 6);
          bumpers.forEach(bu => { bu[3] = Math.max(0, bu[3] - dt); circ(ctx, bu[0], bu[1], bu[2] + (bu[3] ? 4 : 0), bu[3] ? '#fde047' : '#f472b6'); circ(ctx, bu[0], bu[1], bu[2] * .55, '#fff'); });
          for (const f of [L, Rf]) { const t = tip(f); K.line(ctx, f.x, f.y, t.x, t.y, '#22d3ee', 12); }
          circ(ctx, b.x, b.y, R, '#e5e7eb'); circ(ctx, b.x - 3, b.y - 3, 3, '#fff'); if (!launched && alive) text(ctx, 'Тап — запуск', W / 2, 400, 18, '#fbbf24');
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Две машинки ---------- */
  Games.register({ id: 'twocars', title: 'Две машинки', icon: '🚗', cat: 'arcade', desc: 'Управляй двумя машинками сразу: собирай кружки, избегай квадратов', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 600; let cars, objs, score, alive, speed, spawn;
      const laneX = l => W / 8 + l * W / 4;
      function reset() { cars = [{ lane: 0, x: laneX(0) }, { lane: 3, x: laneX(3) }]; objs = []; score = 0; alive = true; speed = 220; spawn = 0; a.hdr.set(0, 0); }
      const flip = side => { const c = cars[side]; c.lane = side ? (c.lane === 3 ? 2 : 3) : (c.lane === 0 ? 1 : 0); api.sound('tap'); };
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Счёт', value: 0 }, { label: 'Рекорд', value: api.bestOf('twocars') || 0 }], hint: 'Тап слева — красная машинка, справа — синяя',
        onDown: p => alive && flip(p.x > W / 2 ? 1 : 0), onKey: e => { if (e.key === 'ArrowLeft') flip(0); if (e.key === 'ArrowRight') flip(1); },
        frame(dt, ctx) {
          if (alive) { speed += dt * 4; spawn -= dt; if (spawn <= 0) { spawn = Math.max(0.35, 0.9 - score * 0.01); const side = api.rand(0, 1); const lane = side * 2 + api.rand(0, 1); objs.push({ lane, y: -30, good: Math.random() < 0.5, side }); } cars.forEach(c => c.x += (laneX(c.lane) - c.x) * Math.min(1, dt * 14));
            for (const o of objs) { o.y += speed * dt; const c = cars[o.side]; if (!o.done && Math.abs(o.y - (H - 90)) < 30 && Math.abs(laneX(o.lane) - c.x) < 30) { o.done = true; if (o.good) { score++; a.hdr.set(0, score); api.sound('coin'); if (score % 20 === 0) api.addCoins(3); } else { alive = false; api.sound('boom'); api.vibrate([60, 40, 120]); over(api, 'twocars', score, 'Авария!', 4, reset); } } if (!o.done && o.good && o.y > H - 40) { o.done = true; alive = false; api.sound('bad'); over(api, 'twocars', score, 'Пропущен кружок', 4, reset); } } objs = objs.filter(o => o.y < H + 40 && !(o.done && o.good)); }
          bg(ctx, W, H, '#1a1a40'); ctx.strokeStyle = '#3b3b7a'; ctx.lineWidth = 2; for (let i = 1; i < 4; i++) { ctx.setLineDash(i === 2 ? [] : [16, 16]); ctx.beginPath(); ctx.moveTo(i * W / 4, 0); ctx.lineTo(i * W / 4, H); ctx.stroke(); } ctx.setLineDash([]);
          objs.forEach(o => { const x = laneX(o.lane), col = o.side ? '#38bdf8' : '#f87171'; if (o.good) { K.ring(ctx, x, o.y, 16, col, 6); } else rr(ctx, x - 16, o.y - 16, 32, 32, 5, col); });
          cars.forEach((c, i) => { rr(ctx, c.x - 18, H - 120, 36, 56, 10, i ? '#38bdf8' : '#f87171'); rr(ctx, c.x - 13, H - 108, 26, 16, 4, 'rgba(255,255,255,.6)'); });
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Сороконожка ---------- */
  Games.register({ id: 'centipede', title: 'Сороконожка', icon: '🐛', cat: 'arcade', desc: 'Сбивай сороконожку среди грибов. Она делится при попадании', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 600, C = 20; let ship, shots, segs, mush, score, alive, cool, lvl;
      function wave() { segs = []; const n = 8 + lvl * 2; for (let i = 0; i < n; i++) segs.push({ x: (n - i) * C, y: C / 2, dir: 1, head: i === 0 }); }
      function reset() { ship = { x: W / 2, y: H - 40 }; a.tx = W / 2; a.ty = H - 40; shots = []; mush = []; for (let i = 0; i < 30; i++) mush.push({ x: api.rand(0, 17) * C + C / 2, y: api.rand(2, 22) * C + C / 2, hp: 3 }); score = 0; alive = true; cool = 0; lvl = 1; wave(); a.hdr.set(0, 0); }
      const a = { tx: W / 2, ty: H - 40 };
      Object.assign(a, api.arcade(screen, Object.assign({ w: W, h: H, stats: [{ label: 'Очки', value: 0 }, { label: 'Рекорд', value: api.bestOf('centipede') || 0 }], hint: 'Ведите пальцем — стрельба автоматическая',
        frame(dt, ctx) {
          if (alive) { ship.x += (clamp(a.tx, 12, W - 12) - ship.x) * Math.min(1, dt * 12); ship.y += (clamp(a.ty, H - 140, H - 20) - ship.y) * Math.min(1, dt * 12); cool -= dt; if (cool <= 0) { cool = 0.16; shots.push({ x: ship.x, y: ship.y - 14 }); }
            shots.forEach(s => s.y -= 700 * dt); const spd = (70 + lvl * 15) * dt;
            segs.forEach(s => { s.x += s.dir * spd * 2.2; const hitM = mush.find(m => Math.abs(m.x - s.x) < C * .8 && Math.abs(m.y - s.y) < C / 2); if (s.x < C / 2 || s.x > W - C / 2 || hitM) { s.x = clamp(s.x, C / 2, W - C / 2); if (hitM) s.x -= s.dir * spd * 2.2; s.dir *= -1; s.y += C; if (s.y > H - 20) s.y = H - 160; } if (Math.hypot(s.x - ship.x, s.y - ship.y) < 18) { alive = false; api.sound('boom'); over(api, 'centipede', score, 'Сороконожка добралась', 60, reset); } });
            for (const sh of shots) { if (sh.dead) continue; const m = mush.find(m => Math.abs(m.x - sh.x) < C / 2 && Math.abs(m.y - sh.y) < C / 2); if (m) { sh.dead = true; m.hp--; if (!m.hp) { score += 1; } continue; } const k = segs.findIndex(s => Math.abs(s.x - sh.x) < C / 2 + 2 && Math.abs(s.y - sh.y) < C / 2 + 2); if (k >= 0) { sh.dead = true; const s = segs[k]; score += s.head ? 100 : 10; mush.push({ x: Math.round((s.x - C / 2) / C) * C + C / 2, y: s.y, hp: 3 }); segs.splice(k, 1); if (segs[k]) segs[k].head = true; api.sound('select'); a.hdr.set(0, score); } }
            shots = shots.filter(s => !s.dead && s.y > 0); mush = mush.filter(m => m.hp > 0); if (!segs.length) { lvl++; api.addCoins(5); api.sound('win'); wave(); } }
          bg(ctx, W, H, '#0c0c1a'); mush.forEach(m => { circ(ctx, m.x, m.y - 2, C / 2 - 1, ['#7f1d1d', '#b91c1c', '#ef4444'][m.hp - 1]); rr(ctx, m.x - 3, m.y, 6, 8, 2, '#fde68a'); }); segs.forEach(s => { circ(ctx, s.x, s.y, C / 2 - 1, s.head ? '#fbbf24' : '#22c55e'); if (s.head) { circ(ctx, s.x + s.dir * 4, s.y - 3, 2, '#111'); } }); shots.forEach(s => rr(ctx, s.x - 2, s.y - 8, 4, 10, 2, '#22d3ee')); ctx.fillStyle = '#a78bfa'; ctx.beginPath(); ctx.moveTo(ship.x, ship.y - 14); ctx.lineTo(ship.x + 12, ship.y + 10); ctx.lineTo(ship.x - 12, ship.y + 10); ctx.fill();
        } }, follow(a))));
      this.unmount = a.stop; reset();
    } });

  /* ---------- Лягушка на реке ---------- */
  Games.register({ id: 'frogriver', title: 'Лягушка-путешественница', icon: '🐸', cat: 'arcade', desc: 'Перебирайся через дорогу и реку по брёвнам к кувшинкам', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, T = 30, ROWS = 15, H = ROWS * T + 20; let fx, fy, lanes, score, lives, homes, alive, best;
      function build() { lanes = []; for (let r = 0; r < ROWS; r++) { let type = 'safe'; if (r >= 1 && r <= 6) type = 'river'; if (r >= 8 && r <= 13) type = 'road'; const sp = (40 + api.rand(0, 60) + score * 2) * (r % 2 ? 1 : -1); const objs = []; if (type !== 'safe') { const len = type === 'river' ? api.rand(2, 4) * T : api.rand(1, 2) * T; const gap = type === 'river' ? api.rand(2, 3) * T : api.rand(3, 5) * T; for (let x = api.rand(0, 60); x < W + len; x += len + gap) objs.push({ x, w: len }); } lanes.push({ type, sp, objs, e: type === 'road' ? K.pick(['🚗', '🚕', '🚙', '🚌', '🚚']) : '' }); } }
      function respawn() { fx = W / 2 - T / 2; fy = ROWS - 1; best = ROWS - 1; }
      function reset() { score = 0; lives = 3; homes = [false, false, false, false, false]; alive = true; build(); respawn(); a.hdr.set(0, 0); a.hdr.set(1, '🐸🐸🐸'); }
      const die = t => { lives--; a.hdr.set(1, '🐸'.repeat(Math.max(0, lives))); api.sound('bad'); api.vibrate(60); if (lives <= 0) { alive = false; over(api, 'frogriver', score, t, 50, reset); } else respawn(); };
      const hop = (dx, dy) => { if (!alive) return; fx = clamp(fx + dx * T, 0, W - T); fy = clamp(fy + dy, 0, ROWS - 1); api.sound('jump'); if (fy < best) { best = fy; score += 10; a.hdr.set(0, score); } if (fy === 0) { const k = Math.round((fx + T / 2) / (W / 5) - 0.5); if (k >= 0 && k < 5 && !homes[k]) { homes[k] = true; score += 100; api.sound('good'); api.addCoins(2); if (homes.every(Boolean)) { homes = homes.map(() => false); score += 500; api.addCoins(10); build(); } respawn(); a.hdr.set(0, score); } else die('Мимо кувшинки'); } };
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Очки', value: 0 }, { label: 'Жизни', value: '🐸🐸🐸' }, { label: 'Рекорд', value: api.bestOf('frogriver') || 0 }], hint: 'Тап выше/ниже/сбоку лягушки — прыжок. Свайпы тоже работают',
        onDown: p => { a._s = p; }, onUp: p => { if (!a._s || p.x < 0) return; const dx = p.x - a._s.x, dy = p.y - a._s.y; const s = a._s; a._s = null; if (Math.max(Math.abs(dx), Math.abs(dy)) > 20) { if (Math.abs(dx) > Math.abs(dy)) hop(Math.sign(dx), 0); else hop(0, Math.sign(dy)); return; } const cx = fx + T / 2, cy = fy * T + T / 2 + 20; const ddx = s.x - cx, ddy = s.y - cy; if (Math.abs(ddx) > Math.abs(ddy)) hop(Math.sign(ddx), 0); else hop(0, Math.sign(ddy) || -1); },
        onKey: e => { const m = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]; if (m) hop(...m); },
        frame(dt, ctx) {
          lanes.forEach(l => l.objs.forEach(o => { o.x += l.sp * dt; const span = W + 200; if (l.sp > 0 && o.x > W + 20) o.x -= span + o.w; if (l.sp < 0 && o.x + o.w < -20) o.x += span + o.w; }));
          if (alive) { const l = lanes[fy]; const on = l.objs.find(o => fx + T * .7 > o.x && fx + T * .3 < o.x + o.w); if (l.type === 'road' && on) die('Сбила машина'); else if (l.type === 'river') { if (!on) die('Утонула'); else { fx += l.sp * dt; if (fx < -10 || fx > W - T + 10) die('Унесло течением'); } } }
          bg(ctx, W, H, '#0f172a'); lanes.forEach((l, r) => { const y = r * T + 20; ctx.fillStyle = l.type === 'river' ? '#1e40af' : l.type === 'road' ? '#374151' : r === 0 ? '#14532d' : '#4d7c0f'; ctx.fillRect(0, y, W, T); l.objs.forEach(o => { if (l.type === 'river') rr(ctx, o.x, y + 4, o.w, T - 8, 8, '#92400e'); else { ctx.save(); if (l.sp > 0) { ctx.translate(o.x + o.w / 2, y + T / 2); ctx.scale(-1, 1); emoji(ctx, l.e, 0, 0, 24); } else emoji(ctx, l.e, o.x + o.w / 2, y + T / 2, 24); ctx.restore(); } }); });
          for (let k = 0; k < 5; k++) { const cx = (k + .5) * W / 5; circ(ctx, cx, 20 + T / 2, 12, '#22c55e'); if (homes[k]) emoji(ctx, '🐸', cx, 20 + T / 2, 22); }
          emoji(ctx, '🐸', fx + T / 2, fy * T + 20 + T / 2, 26); text(ctx, 'Кувшинки', W / 2, 9, 11, '#9ca3af');
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Космический бой ---------- */
  Games.register({ id: 'shmup', title: 'Космический бой', icon: '🛸', cat: 'arcade', desc: 'Вертикальная стрелялка: волны врагов, бонусы и босс', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 600; let ship, shots, foes, eshots, pups, score, hp, alive, t, cool, power, boss, wave;
      function reset() { ship = { x: W / 2, y: H - 70 }; a.tx = W / 2; a.ty = H - 70; shots = []; foes = []; eshots = []; pups = []; score = 0; hp = 5; alive = true; t = 0; cool = 0; power = 1; boss = null; wave = 0; a.hdr.set(0, 0); a.hdr.set(1, '❤'.repeat(hp)); }
      const hurt = () => { hp--; a.hdr.set(1, '❤'.repeat(Math.max(0, hp))); api.sound('bad'); api.vibrate(40); power = Math.max(1, power - 1); if (hp <= 0) { alive = false; api.sound('boom'); over(api, 'shmup', score, 'Корабль сбит', 100, reset); } };
      const a = { tx: W / 2, ty: H - 70 };
      Object.assign(a, api.arcade(screen, Object.assign({ w: W, h: H, stats: [{ label: 'Очки', value: 0 }, { label: 'Корпус', value: '❤❤❤❤❤' }, { label: 'Рекорд', value: api.bestOf('shmup') || 0 }], hint: 'Ведите пальцем, стрельба автоматическая. ⚡ — усиление, ❤ — ремонт',
        frame(dt, ctx) {
          if (alive) { t += dt; ship.x += (clamp(a.tx, 16, W - 16) - ship.x) * Math.min(1, dt * 14); ship.y += (clamp(a.ty - 40, 80, H - 30) - ship.y) * Math.min(1, dt * 14); cool -= dt; if (cool <= 0) { cool = 0.18; for (let k = 0; k < power; k++) shots.push({ x: ship.x + (k - (power - 1) / 2) * 12, y: ship.y - 16, vx: (k - (power - 1) / 2) * 60 }); }
            if (!boss && Math.random() < dt * (1.2 + t / 40)) { const kind = api.rand(0, 2); foes.push({ x: api.rand(20, W - 20), y: -20, kind, hp: kind + 1, ph: Math.random() * 6, fire: api.rand(1, 3) }); }
            if (!boss && t > 45 * (wave + 1)) { wave++; boss = { x: W / 2, y: -60, hp: 60 + wave * 40, max: 60 + wave * 40, fire: 1 }; }
            shots.forEach(s => { s.y -= 650 * dt; s.x += s.vx * dt; }); eshots.forEach(s => { s.x += s.vx * dt; s.y += s.vy * dt; }); pups.forEach(p => p.y += 120 * dt);
            foes.forEach(f => { f.y += (60 + f.kind * 30) * dt; f.x += Math.sin(t * 2 + f.ph) * (f.kind === 1 ? 120 : 30) * dt; f.fire -= dt; if (f.fire <= 0 && f.kind === 2) { f.fire = 2; const d = Math.hypot(ship.x - f.x, ship.y - f.y); eshots.push({ x: f.x, y: f.y, vx: (ship.x - f.x) / d * 200, vy: (ship.y - f.y) / d * 200 }); } if (Math.hypot(f.x - ship.x, f.y - ship.y) < 24) { f.hp = 0; f.dead = true; hurt(); } });
            if (boss) { boss.y += (90 - boss.y) * dt; boss.x = W / 2 + Math.sin(t) * 110; boss.fire -= dt; if (boss.fire <= 0) { boss.fire = 0.9; for (let k = -2; k <= 2; k++) eshots.push({ x: boss.x, y: boss.y + 30, vx: k * 60, vy: 220 }); } }
            for (const s of shots) { for (const f of foes) if (!f.dead && Math.hypot(s.x - f.x, s.y - f.y) < 18) { s.dead = true; f.hp--; if (f.hp <= 0) { f.dead = true; score += 10 * (f.kind + 1); api.sound('select'); if (Math.random() < 0.08) pups.push({ x: f.x, y: f.y, k: Math.random() < 0.6 ? '⚡' : '❤' }); } break; } if (!s.dead && boss && Math.abs(s.x - boss.x) < 50 && Math.abs(s.y - boss.y) < 30) { s.dead = true; boss.hp--; if (boss.hp <= 0) { score += 500 * wave; api.addCoins(15); api.sound('win'); boss = null; pups.push({ x: W / 2, y: 100, k: '⚡' }); } } }
            eshots.forEach(s => { if (Math.hypot(s.x - ship.x, s.y - ship.y) < 12) { s.dead = true; hurt(); } }); pups.forEach(p => { if (Math.hypot(p.x - ship.x, p.y - ship.y) < 24) { p.dead = true; if (p.k === '⚡') power = Math.min(5, power + 1); else { hp = Math.min(5, hp + 1); a.hdr.set(1, '❤'.repeat(hp)); } api.sound('coin'); } });
            shots = shots.filter(s => !s.dead && s.y > -10); foes = foes.filter(f => !f.dead && f.y < H + 30); eshots = eshots.filter(s => !s.dead && s.y < H + 10 && s.y > -10 && s.x > -10 && s.x < W + 10); pups = pups.filter(p => !p.dead && p.y < H + 20); a.hdr.set(0, score); }
          bg(ctx, W, H, '#05051a'); for (let i = 0; i < 40; i++) circ(ctx, (i * 71) % W, ((i * 137) + (t || 0) * (40 + i % 3 * 40)) % H, i % 3 ? 1 : 1.8, '#94a3b8');
          pups.forEach(p => emoji(ctx, p.k, p.x, p.y, 22)); foes.forEach(f => emoji(ctx, ['👾', '🛸', '👽'][f.kind], f.x, f.y, 28)); if (boss) { emoji(ctx, '🐙', boss.x, boss.y, 70); rr(ctx, 40, 10, (W - 80) * boss.hp / boss.max, 8, 4, '#ef4444'); }
          shots.forEach(s => rr(ctx, s.x - 2, s.y - 8, 4, 12, 2, '#fde047')); eshots.forEach(s => circ(ctx, s.x, s.y, 5, '#f472b6')); emoji(ctx, '🚀', ship.x, ship.y, 32);
        } }, follow(a))));
      this.unmount = a.stop; reset();
    } });

  /* ---------- Клетка (agar) ---------- */
  Games.register({ id: 'agar', title: 'Клетка', icon: '🦠', cat: 'arcade', desc: 'Поглощай клетки меньше себя и убегай от больших', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 600, WW = 1400; let me, cells, food, alive, cam;
      function reset() { me = { x: WW / 2, y: WW / 2, r: 14 }; cells = []; food = []; for (let i = 0; i < 18; i++) cells.push(newCell()); for (let i = 0; i < 150; i++) food.push({ x: api.rand(0, WW), y: api.rand(0, WW), c: `hsl(${api.rand(0, 359)},80%,60%)` }); alive = true; a.tx = W / 2; a.ty = H / 2; }
      const newCell = () => { let x, y; do { x = api.rand(0, WW); y = api.rand(0, WW); } while (me && Math.hypot(x - me.x, y - me.y) < 300); return { x, y, r: api.rand(8, 30 + (me ? me.r : 14)), vx: 0, vy: 0, c: `hsl(${api.rand(0, 359)},70%,55%)`, t: 0 }; };
      const a = { tx: W / 2, ty: H / 2 };
      Object.assign(a, api.arcade(screen, Object.assign({ w: W, h: H, stats: [{ label: 'Размер', value: 14 }, { label: 'Рекорд', value: api.bestOf('agar') || 0 }], hint: 'Держите палец в стороне движения',
        frame(dt, ctx) {
          if (alive) { const dx = a.tx - W / 2, dy = a.ty - H / 2, d = Math.hypot(dx, dy); const sp = 160 * Math.pow(14 / me.r, 0.35); if (d > 8) { me.x += dx / d * sp * dt; me.y += dy / d * sp * dt; } me.x = clamp(me.x, me.r, WW - me.r); me.y = clamp(me.y, me.r, WW - me.r);
            food.forEach(f => { if (Math.hypot(f.x - me.x, f.y - me.y) < me.r) { me.r = Math.sqrt(me.r * me.r + 6); f.x = api.rand(0, WW); f.y = api.rand(0, WW); } });
            cells.forEach(c => { c.t -= dt; const dd = Math.hypot(me.x - c.x, me.y - c.y); if (c.t <= 0) { c.t = api.rand(1, 3); const ang = Math.random() * 6.28; c.vx = Math.cos(ang); c.vy = Math.sin(ang); } if (dd < 250) { const s = c.r > me.r * 1.1 ? 1 : c.r * 1.1 < me.r ? -1 : 0; if (s) { c.vx = (me.x - c.x) / dd * s; c.vy = (me.y - c.y) / dd * s; } } const cs = 120 * Math.pow(14 / c.r, 0.35); c.x = clamp(c.x + c.vx * cs * dt, c.r, WW - c.r); c.y = clamp(c.y + c.vy * cs * dt, c.r, WW - c.r); food.forEach(f => { if (Math.hypot(f.x - c.x, f.y - c.y) < c.r) { c.r = Math.sqrt(c.r * c.r + 4); f.x = api.rand(0, WW); f.y = api.rand(0, WW); } });
              if (dd < Math.max(me.r, c.r)) { if (me.r > c.r * 1.1) { me.r = Math.sqrt(me.r * me.r + c.r * c.r); c.dead = true; api.sound('good'); } else if (c.r > me.r * 1.1) { alive = false; api.sound('boom'); over(api, 'agar', Math.floor(me.r), 'Вас съели!', 5, reset); } } });
            cells = cells.filter(c => !c.dead); while (cells.length < 18) cells.push(newCell()); a.hdr.set(0, Math.floor(me.r)); api.best('agar', Math.floor(me.r)); if (me.r > 60 && Math.floor(me.r) % 20 === 0 && !a._c) { a._c = true; api.addCoins(5); } if (Math.floor(me.r) % 20) a._c = false; }
          const z = clamp(1.4 - me.r / 150, 0.5, 1.4); ctx.save(); bg(ctx, W, H, '#0f172a'); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-me.x, -me.y); ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1; for (let g = 0; g <= WW; g += 50) { ctx.beginPath(); ctx.moveTo(g, 0); ctx.lineTo(g, WW); ctx.moveTo(0, g); ctx.lineTo(WW, g); ctx.stroke(); } ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 4; ctx.strokeRect(0, 0, WW, WW);
          food.forEach(f => circ(ctx, f.x, f.y, 4, f.c)); cells.forEach(c => { circ(ctx, c.x, c.y, c.r, c.c); if (c.r > me.r * 1.1) K.ring(ctx, c.x, c.y, c.r, '#ef4444', 3); }); circ(ctx, me.x, me.y, me.r, '#22d3ee'); K.ring(ctx, me.x, me.y, me.r, '#fff', 3); ctx.restore();
        } }, follow(a))));
      this.unmount = a.stop; reset();
    } });

  /* ---------- Чёрная дыра ---------- */
  Games.register({ id: 'holeio', title: 'Чёрная дыра', icon: '🕳', cat: 'arcade', desc: 'Двигай дыру по городу и глотай всё, что в неё влезает, за 90 секунд', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 600, WW = 1000; let me, objs, time, score, alive;
      const TYPES = [['🌳', 12], ['🚗', 14], ['🧍', 8], ['🚲', 10], ['🏠', 30], ['🚌', 26], ['🏢', 48], ['🗼', 60], ['🌲', 18], ['⛲', 22], ['🚒', 28], ['🏬', 55]];
      function reset() { me = { x: WW / 2, y: WW / 2, r: 16 }; objs = []; for (let i = 0; i < 160; i++) { const t = TYPES[Math.min(TYPES.length - 1, Math.floor(Math.pow(Math.random(), 2.2) * TYPES.length))]; objs.push({ x: api.rand(20, WW - 20), y: api.rand(20, WW - 20), e: t[0], s: t[1], k: 1 }); } time = 90; score = 0; alive = true; a.tx = W / 2; a.ty = H / 2; }
      const a = { tx: W / 2, ty: H / 2 };
      Object.assign(a, api.arcade(screen, Object.assign({ w: W, h: H, stats: [{ label: 'Съедено', value: 0 }, { label: '⏱', value: 90 }, { label: 'Рекорд', value: api.bestOf('holeio') || 0 }], hint: 'Держите палец в сторону движения',
        frame(dt, ctx) {
          if (alive) { time -= dt; a.hdr.set(1, Math.ceil(time)); const dx = a.tx - W / 2, dy = a.ty - H / 2, d = Math.hypot(dx, dy); if (d > 8) { me.x += dx / d * 170 * dt; me.y += dy / d * 170 * dt; } me.x = clamp(me.x, 0, WW); me.y = clamp(me.y, 0, WW);
            objs.forEach(o => { const dd = Math.hypot(o.x - me.x, o.y - me.y); if (o.s < me.r * 0.95 && dd < me.r) { o.k -= dt * 4; o.x += (me.x - o.x) * dt * 6; o.y += (me.y - o.y) * dt * 6; if (o.k <= 0) { o.dead = true; score += o.s; me.r += o.s * 0.06; api.sound('tap'); a.hdr.set(0, score); } } }); objs = objs.filter(o => !o.dead); if (time <= 0) { alive = false; api.best('holeio', score); api.end({ title: 'Время вышло', reward: Math.floor(score / 60), text: 'Съедено на ' + score + ' очков', onAgain: reset }); } }
          const z = clamp(1.3 - me.r / 200, 0.45, 1.3); ctx.save(); bg(ctx, W, H, '#166534'); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-me.x, -me.y); ctx.fillStyle = '#4b5563'; for (let g = 0; g <= WW; g += 200) { ctx.fillRect(g - 12, 0, 24, WW); ctx.fillRect(0, g - 12, WW, 24); }
          circ(ctx, me.x, me.y, me.r, '#000'); K.ring(ctx, me.x, me.y, me.r, '#7c3aed', 3); objs.forEach(o => { ctx.globalAlpha = clamp(o.k, 0, 1); emoji(ctx, o.e, o.x, o.y, o.s * 1.3 * Math.max(0.3, o.k)); }); ctx.globalAlpha = 1; ctx.restore();
        } }, follow(a))));
      this.unmount = a.stop; reset();
    } });

  /* ---------- Сквозь кольца ---------- */
  Games.register({ id: 'helix', title: 'Спиральная башня', icon: '🌀', cat: 'arcade', desc: 'Мяч падает сквозь щели платформ. Крути башню, избегая красных секторов', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 600, GAP = 110; let rot, plats, by, vy, score, alive, drag, combo;
      const mk = i => { const n = 12; const gap = api.rand(0, n - 1); const gap2 = (gap + 1) % n; const bad = new Set(); const nb = Math.min(4, Math.floor(i / 4)); for (let k = 0; k < nb; k++) { const s = api.rand(0, n - 1); if (s !== gap && s !== gap2) bad.add(s); } return { y: 200 + i * GAP, gap, gap2, bad, n, i }; };
      function reset() { rot = 0; plats = []; for (let i = 0; i < 8; i++) plats.push(mk(i)); by = 120; vy = 0; score = 0; alive = true; combo = 0; a.hdr.set(0, 0); }
      const seg = (p, ang) => Math.floor((((ang - rot) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) / (Math.PI * 2 / p.n));
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Этажей', value: 0 }, { label: 'Рекорд', value: api.bestOf('helix') || 0 }], hint: 'Ведите пальцем влево-вправо — башня вращается',
        onDown: p => drag = p.x, onMove: (p) => { if (drag != null) { rot += (p.x - drag) * 0.02; drag = p.x; } }, onUp: () => drag = null, onKey: e => { if (e.key === 'ArrowLeft') rot -= 0.3; if (e.key === 'ArrowRight') rot += 0.3; },
        frame(dt, ctx) {
          const BX = W / 2, ANG = Math.PI / 2; if (alive) { vy += 1400 * dt; by += vy * dt; const cam = by - 200; for (const p of plats) { if (p.passed) continue; if (by + 10 >= p.y && by - vy * dt + 10 <= p.y + 4) { const s = seg(p, ANG); if (s === p.gap || s === p.gap2) { p.passed = true; score++; combo++; a.hdr.set(0, score); api.sound('select'); if (score % 15 === 0) api.addCoins(3); } else if (p.bad.has(s) && combo < 3) { alive = false; api.sound('boom'); api.vibrate([60, 40, 120]); over(api, 'helix', score, 'Красный сектор!', 3, reset); } else { if (combo >= 3) { p.passed = true; p.smash = true; score++; a.hdr.set(0, score); api.sound('boom'); } else { by = p.y - 10; vy = -520; api.sound('jump'); } combo = 0; } } } if (plats[0].y < cam - 100) { plats.shift(); plats.push(mk(plats[plats.length - 1].i + 1)); plats[plats.length - 1].y = plats[plats.length - 2].y + GAP; } }
          const cam = by - 200; bg(ctx, W, H, '#1e1b4b'); rr(ctx, W / 2 - 14, 0, 28, H, 6, '#312e81');
          plats.forEach(p => { if (p.smash) return; const y = p.y - cam; if (y < -20 || y > H + 20) return; for (let s = 0; s < p.n; s++) { if (s === p.gap || s === p.gap2) continue; const a0 = rot + s * Math.PI * 2 / p.n, a1 = a0 + Math.PI * 2 / p.n; const front = Math.sin((a0 + a1) / 2) > 0; ctx.fillStyle = p.bad.has(s) ? '#ef4444' : `hsl(${(p.i * 25) % 360},70%,${front ? 60 : 40}%)`; ctx.beginPath(); ctx.ellipse(W / 2, y, 140, 34, 0, a0, a1); ctx.ellipse(W / 2, y, 30, 8, 0, a1, a0, true); ctx.fill(); } });
          circ(ctx, BX, 200 + 34 - 30, 11, combo >= 3 ? '#fb923c' : '#fbbf24'); if (combo >= 3) K.ring(ctx, BX, 204, 16, '#fb923c', 3);
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Подъём от лавы ---------- */
  Games.register({ id: 'lavaclimb', title: 'Подъём от лавы', icon: '🌋', cat: 'arcade', desc: 'Лава поднимается! Прыгай по платформам вверх как можно выше', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 600; let p, plats, lava, cam, alive, score, hold;
      function reset() { p = { x: W / 2, y: H - 80, vx: 0, vy: 0, g: false }; plats = [{ x: 0, y: H - 50, w: W }]; for (let y = H - 140; y > -3000; y -= api.rand(70, 105)) plats.push({ x: api.rand(0, W - 90), y, w: api.rand(60, 110), m: Math.random() < 0.2 ? api.rand(40, 90) : 0, ph: Math.random() * 6 }); lava = H + 60; cam = 0; alive = true; score = 0; hold = 0; a.hdr.set(0, 0); }
      const jump = () => { if (!alive) return; if (p.g) { p.vy = -620; p.g = false; api.sound('jump'); } };
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Высота', value: 0 }, { label: 'Рекорд', value: api.bestOf('lavaclimb') || 0 }], hint: 'Тап слева/справа — прыжок в эту сторону',
        onDown: q => { hold = q.x < W / 2 ? -1 : 1; jump(); }, onUp: () => hold = 0, onKey: e => { if (e.key === 'ArrowLeft') { hold = -1; jump(); } if (e.key === 'ArrowRight') { hold = 1; jump(); } if (e.key === ' ') jump(); },
        frame(dt, ctx) {
          if (alive) { const t = performance.now() / 1000; plats.forEach(q => { if (q.m) { q.dx = Math.sin(t + q.ph) * q.m * dt; q.x += q.dx; } }); p.vx += (hold * 260 - p.vx) * Math.min(1, dt * 6); p.vy += 1500 * dt; const oy = p.y; p.x += p.vx * dt; p.y += p.vy * dt; if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10; p.g = false; if (p.vy > 0) for (const q of plats) if (p.x > q.x - 8 && p.x < q.x + q.w + 8 && oy <= q.y && p.y >= q.y) { p.y = q.y; p.vy = 0; p.g = true; if (q.dx) p.x += q.dx; } if (p.g && hold) { p.vy = -620; p.g = false; api.sound('jump'); }
            const h = Math.max(0, Math.floor((H - 80 - p.y) / 10)); if (h > score) { score = h; a.hdr.set(0, score); if (score % 100 === 0) api.addCoins(3); } lava -= (35 + score * 0.08) * dt; cam = Math.min(cam, p.y - H * 0.55); if (lava > cam + H + 60) lava = cam + H + 60; if (p.y > lava - 6) { alive = false; api.sound('boom'); over(api, 'lavaclimb', score, 'Сгорели в лаве', 30, reset); } const top = Math.min(...plats.map(q => q.y)); if (top > cam - 400) for (let y = top - api.rand(70, 105); y > cam - 1200; y -= api.rand(70, 110)) plats.push({ x: api.rand(0, W - 80), y, w: Math.max(45, api.rand(55, 110) - score / 30), m: Math.random() < 0.3 ? api.rand(40, 100) : 0, ph: Math.random() * 6 }); plats = plats.filter(q => q.y < lava + 50); }
          bg(ctx, W, H, '#1c1917'); ctx.save(); ctx.translate(0, -cam); plats.forEach(q => rr(ctx, q.x, q.y, q.w, 12, 5, q.m ? '#a78bfa' : '#78716c')); circ(ctx, p.x, p.y - 12, 12, '#22d3ee'); circ(ctx, p.x + (p.vx > 0 ? 4 : -4), p.y - 15, 2.5, '#111'); const g = ctx.createLinearGradient(0, lava, 0, lava + 80); g.addColorStop(0, '#f97316'); g.addColorStop(1, '#7f1d1d'); ctx.fillStyle = g; ctx.fillRect(0, lava, W, H * 2); for (let i = 0; i < 12; i++) circ(ctx, (i * 37 + performance.now() / 20) % W, lava + 4, 8, '#fdba74'); ctx.restore();
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Стрельба по тарелкам ---------- */
  Games.register({ id: 'skeet', title: 'Тарелочки', icon: '🥏', cat: 'arcade', desc: 'Тарелки летят по дуге — сбей как можно больше из 25', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 520; let discs, left, score, spawn, shells, flash, bits;
      function reset() { discs = []; left = 25; score = 0; spawn = 1; shells = 2; flash = null; bits = []; a.hdr.set(0, 0); a.hdr.set(1, 25); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Сбито', value: 0 }, { label: 'Осталось', value: 25 }, { label: 'Рекорд', value: api.bestOf('skeet') || 0 }], hint: 'Тап по тарелке — выстрел. 2 патрона на пару тарелок',
        onDown: p => { if (shells <= 0) { api.sound('bad'); return; } shells--; flash = { x: p.x, y: p.y, t: 0.15 }; api.sound('boom'); const d = discs.find(q => !q.hit && Math.hypot(q.x - p.x, q.y - p.y) < 28); if (d) { d.hit = true; score++; a.hdr.set(0, score); for (let i = 0; i < 8; i++) bits.push({ x: d.x, y: d.y, vx: api.rand(-150, 150), vy: api.rand(-150, 50), t: 0.8 }); } },
        frame(dt, ctx) {
          spawn -= dt; if (spawn <= 0 && left > 0 && !discs.length) { const n = left >= 2 && Math.random() < 0.5 ? 2 : 1; for (let k = 0; k < n; k++) { const fromL = Math.random() < 0.5; discs.push({ x: fromL ? -10 : W + 10, y: H - 60, vx: (fromL ? 1 : -1) * api.rand(150, 260), vy: -api.rand(380, 470) }); } left -= n; shells = 2; a.hdr.set(1, left); spawn = 1.2; }
          discs.forEach(d => { d.vy += 300 * dt; d.x += d.vx * dt; d.y += d.vy * dt; if (d.hit) d.gone = true; }); discs = discs.filter(d => !d.gone && d.y < H + 20 && d.x > -40 && d.x < W + 40); bits.forEach(b => { b.vy += 400 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.t -= dt; }); bits = bits.filter(b => b.t > 0);
          if (left <= 0 && !discs.length && spawn <= 0) { spawn = 99; api.best('skeet', score); api.end({ title: 'Сбито ' + score + ' из 25', reward: Math.floor(score / 2), onAgain: reset }); }
          const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#7dd3fc'); g.addColorStop(1, '#fef3c7'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#65a30d'; ctx.fillRect(0, H - 40, W, 40);
          discs.forEach(d => { ctx.fillStyle = '#ea580c'; ctx.beginPath(); ctx.ellipse(d.x, d.y, 16, 6, 0, 0, 7); ctx.fill(); }); bits.forEach(b => rr(ctx, b.x, b.y, 5, 3, 1, '#ea580c'));
          if (flash) { flash.t -= dt; circ(ctx, flash.x, flash.y, 20, 'rgba(255,255,255,.6)'); if (flash.t <= 0) flash = null; } for (let i = 0; i < shells; i++) rr(ctx, 12 + i * 14, H - 32, 8, 22, 2, '#dc2626');
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Щит ---------- */
  Games.register({ id: 'shield', title: 'Щит', icon: '🛡', cat: 'arcade', desc: 'Вращай щит вокруг ядра и отбивай летящие снаряды', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 520, CX = W / 2, CY = H / 2; let ang, target, shots, score, hp, spawn, alive, t;
      function reset() { ang = 0; target = 0; shots = []; score = 0; hp = 3; spawn = 1; alive = true; t = 0; a.hdr.set(0, 0); a.hdr.set(1, '❤❤❤'); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Отбито', value: 0 }, { label: 'Ядро', value: '❤❤❤' }, { label: 'Рекорд', value: api.bestOf('shield') || 0 }], hint: 'Касайтесь в той стороне, куда повернуть щит',
        onDown: p => target = Math.atan2(p.y - CY, p.x - CX), onMove: (p, e) => { if (e.buttons || e.pointerType === 'touch') target = Math.atan2(p.y - CY, p.x - CX); },
        frame(dt, ctx) {
          if (alive) { t += dt; let d = target - ang; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; ang += d * Math.min(1, dt * 16); spawn -= dt; if (spawn <= 0) { spawn = Math.max(0.35, 1.3 - t / 60); const aa = Math.random() * Math.PI * 2; shots.push({ a: aa, r: 300, sp: 110 + t * 2 + api.rand(0, 40), k: Math.random() < 0.15 ? 2 : 1 }); }
            shots.forEach(s => { s.r -= s.sp * dt; if (s.r < 70 && s.r > 50 && !s.done) { let dd = s.a - ang; while (dd > Math.PI) dd -= Math.PI * 2; while (dd < -Math.PI) dd += Math.PI * 2; if (Math.abs(dd) < 0.55) { s.done = true; score += s.k; a.hdr.set(0, score); api.sound('select'); if (score % 25 === 0) api.addCoins(3); } } if (s.r < 26 && !s.done) { s.done = true; hp--; a.hdr.set(1, '❤'.repeat(Math.max(0, hp))); api.sound('bad'); api.vibrate(50); if (hp <= 0) { alive = false; api.sound('boom'); over(api, 'shield', score, 'Ядро разрушено', 5, reset); } } }); shots = shots.filter(s => !s.done); }
          bg(ctx, W, H, '#0b1026'); K.ring(ctx, CX, CY, 60, '#1e293b', 2); circ(ctx, CX, CY, 24 + Math.sin(t * 4) * 2, '#22d3ee'); circ(ctx, CX, CY, 14, '#e0f2fe'); ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(CX, CY, 60, ang - 0.5, ang + 0.5); ctx.stroke();
          shots.forEach(s => circ(ctx, CX + Math.cos(s.a) * s.r, CY + Math.sin(s.a) * s.r, s.k === 2 ? 9 : 6, s.k === 2 ? '#f472b6' : '#ef4444'));
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Орбиты ---------- */
  Games.register({ id: 'orbits', title: 'Орбиты', icon: '🪐', cat: 'arcade', desc: 'Тап — перескок на другую орбиту. Собирай звёзды, избегай астероидов', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 520, CX = W / 2, CY = H / 2, RR = [70, 130, 190]; let orb, pr, pa, objs, score, alive, t, dir;
      function reset() { orb = 1; pr = RR[1]; pa = 0; objs = []; score = 0; alive = true; t = 0; dir = 1; a.hdr.set(0, 0); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Звёзды', value: 0 }, { label: 'Рекорд', value: api.bestOf('orbits') || 0 }], hint: 'Тап по внешней части — наружу, по центру — внутрь',
        onDown: p => { if (!alive) return; const d = Math.hypot(p.x - CX, p.y - CY); orb = clamp(orb + (d > RR[orb] ? 1 : -1), 0, 2); api.sound('tap'); }, onKey: e => { if (e.key === 'ArrowUp') orb = Math.min(2, orb + 1); if (e.key === 'ArrowDown') orb = Math.max(0, orb - 1); },
        frame(dt, ctx) {
          if (alive) { t += dt; pa += dir * (1.4 + t / 80) * dt * 130 / pr; pr += (RR[orb] - pr) * Math.min(1, dt * 10); if (Math.random() < dt * (1 + t / 30)) objs.push({ o: api.rand(0, 2), a: pa + dir * (1.6 + Math.random() * 3), star: Math.random() < 0.5, life: 6 });
            objs.forEach(o => { o.life -= dt; const x = CX + Math.cos(o.a) * RR[o.o], y = CY + Math.sin(o.a) * RR[o.o]; if (Math.hypot(x - (CX + Math.cos(pa) * pr), y - (CY + Math.sin(pa) * pr)) < 18) { o.life = 0; if (o.star) { score++; a.hdr.set(0, score); api.sound('coin'); if (score % 15 === 0) api.addCoins(3); } else { alive = false; api.sound('boom'); over(api, 'orbits', score, 'Столкновение', 3, reset); } } }); objs = objs.filter(o => o.life > 0); }
          bg(ctx, W, H, '#050514'); RR.forEach(r => K.ring(ctx, CX, CY, r, '#1e293b', 2)); emoji(ctx, '🌞', CX, CY, 44); objs.forEach(o => { ctx.globalAlpha = Math.min(1, o.life); emoji(ctx, o.star ? '⭐' : '🪨', CX + Math.cos(o.a) * RR[o.o], CY + Math.sin(o.a) * RR[o.o], 22); }); ctx.globalAlpha = 1; emoji(ctx, '🛰', CX + Math.cos(pa) * pr, CY + Math.sin(pa) * pr, 26);
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Сортировка на конвейере ---------- */
  Games.register({ id: 'colorsort', title: 'Конвейер', icon: '📦', cat: 'arcade', desc: 'Смахивай предметы влево или вправо в корзину нужного цвета', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 560; const CL = [['#ef4444', 'Красные'], ['#3b82f6', 'Синие']]; let items, score, lives, speed, spawn, alive, drag;
      function reset() { items = []; score = 0; lives = 3; speed = 110; spawn = 0; alive = true; a.hdr.set(0, 0); a.hdr.set(1, '❤❤❤'); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Счёт', value: 0 }, { label: '❤', value: '❤❤❤' }, { label: 'Рекорд', value: api.bestOf('colorsort') || 0 }], hint: 'Свайп по предмету влево — в красную, вправо — в синюю. Золотые — вниз',
        onDown: p => { drag = { p, it: items.filter(i => !i.dir).sort((x, y) => Math.abs(x.y - p.y) - Math.abs(y.y - p.y))[0] }; }, onUp: p => { if (!drag || p.x < 0) { drag = null; return; } const dx = p.x - drag.p.x; if (Math.abs(dx) > 25 && drag.it) drag.it.dir = Math.sign(dx); drag = null; }, onKey: e => { const it = items.filter(i => !i.dir).sort((x, y) => y.y - x.y)[0]; if (!it) return; if (e.key === 'ArrowLeft') it.dir = -1; if (e.key === 'ArrowRight') it.dir = 1; },
        frame(dt, ctx) {
          if (alive) { speed += dt * 3; spawn -= dt; if (spawn <= 0) { spawn = Math.max(0.45, 1.3 - score * 0.02); items.push({ x: W / 2, y: -20, c: Math.random() < 0.1 ? 2 : api.rand(0, 1), e: K.pick(['🍎', '📘', '🧃', '🎁', '🧸', '⚽']) }); }
            items.forEach(i => { if (i.dir) { i.x += i.dir * 600 * dt; if (i.x < 40 || i.x > W - 40) { i.done = true; const want = i.c === 2 ? 0 : i.c === 0 ? -1 : 1; if (i.dir === want) { score++; api.sound('good'); } else fail(); } } else { i.y += speed * dt; if (i.y > H - 60) { i.done = true; if (i.c === 2) { score += 5; api.sound('coin'); api.addCoins(1); } else fail(); } } a.hdr.set(0, score); }); items = items.filter(i => !i.done); }
          bg(ctx, W, H, '#1f2937'); rr(ctx, W / 2 - 60, 0, 120, H - 50, 0, '#374151'); for (let y = (performance.now() / 10) % 30 - 30; y < H; y += 30) rr(ctx, W / 2 - 60, y, 120, 3, 0, '#4b5563'); rr(ctx, 0, H / 2 - 70, 50, 140, 10, CL[0][0]); rr(ctx, W - 50, H / 2 - 70, 50, 140, 10, CL[1][0]); rr(ctx, W / 2 - 50, H - 50, 100, 50, 10, '#fbbf24'); text(ctx, '⬅', 25, H / 2, 22); text(ctx, '➡', W - 25, H / 2, 22);
          items.forEach(i => { rr(ctx, i.x - 26, i.y - 26, 52, 52, 12, i.c === 2 ? '#fbbf24' : CL[i.c][0]); emoji(ctx, i.e, i.x, i.y, 28); });
        } });
      function fail() { lives--; a.hdr.set(1, '❤'.repeat(Math.max(0, lives))); api.sound('bad'); api.vibrate(40); if (lives <= 0) { alive = false; over(api, 'colorsort', score, 'Брак на конвейере!', 5, reset); } }
      this.unmount = a.stop; reset();
    } });

  /* ---------- Воздушный шар ---------- */
  Games.register({ id: 'balloonrise', title: 'Воздушный шар', icon: '🎈', cat: 'arcade', desc: 'Шарик летит вверх. Защищай его щитом, расталкивая препятствия', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 600; let sx, sy, obs, score, alive, t;
      function reset() { sx = W / 2; sy = H - 260; a.tx = sx; a.ty = sy; obs = []; score = 0; alive = true; t = 0; a.hdr.set(0, 0); }
      const a = { tx: W / 2, ty: H - 260 };
      Object.assign(a, api.arcade(screen, Object.assign({ w: W, h: H, stats: [{ label: 'Высота', value: 0 }, { label: 'Рекорд', value: api.bestOf('balloonrise') || 0 }], hint: 'Двигайте щит (кружок) пальцем',
        frame(dt, ctx) {
          const bx = W / 2, by = H - 110; if (alive) { t += dt; score = Math.floor(t * 10); a.hdr.set(0, score); sx += (a.tx - sx) * Math.min(1, dt * 16); sy += (a.ty - 60 - sy) * Math.min(1, dt * 16); if (Math.random() < dt * (0.9 + t / 25)) { const kind = api.rand(0, 2); if (kind === 0) for (let k = 0; k < api.rand(3, 6); k++) obs.push({ x: api.rand(30, W - 30), y: -20 - k * 30, vx: 0, vy: 0, r: 13 }); else obs.push({ x: api.rand(40, W - 40), y: -30, vx: 0, vy: 0, r: api.rand(18, 30) }); }
            obs.forEach(o => { o.vy += 200 * dt; o.vy = Math.min(o.vy, 170 + t * 2); o.x += o.vx * dt; o.y += o.vy * dt; o.vx *= 0.99; const d = Math.hypot(o.x - sx, o.y - sy); if (d < o.r + 26) { const nx = (o.x - sx) / d, ny = (o.y - sy) / d; o.x = sx + nx * (o.r + 26); o.y = sy + ny * (o.r + 26); o.vx += nx * 400; o.vy = ny * 300; } for (const q of obs) if (q !== o) { const dd = Math.hypot(q.x - o.x, q.y - o.y); if (dd < q.r + o.r && dd > 0) { const nx = (q.x - o.x) / dd, ny = (q.y - o.y) / dd, ov = (q.r + o.r - dd) / 2; o.x -= nx * ov; o.y -= ny * ov; q.x += nx * ov; q.y += ny * ov; } } if (Math.hypot(o.x - bx, o.y - by) < o.r + 22) { alive = false; api.sound('boom'); api.vibrate([60, 40, 120]); over(api, 'balloonrise', score, 'Шарик лопнул!', 20, reset); } }); obs = obs.filter(o => o.y < H + 40 && o.x > -60 && o.x < W + 60); }
          const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0ea5e9'); g.addColorStop(1, '#bae6fd'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); for (let i = 0; i < 5; i++) emoji(ctx, '☁️', (i * 90 + 40) % W, ((i * 160 + (t || 0) * 60) % (H + 100)) - 50, 50);
          obs.forEach(o => { circ(ctx, o.x, o.y, o.r, '#475569'); circ(ctx, o.x - o.r * .3, o.y - o.r * .3, o.r * .3, '#64748b'); }); K.line(ctx, bx, by + 22, bx, by + 60, '#fff', 2); emoji(ctx, '🎈', bx, by, 52); circ(ctx, sx, sy, 26, 'rgba(255,255,255,.35)'); K.ring(ctx, sx, sy, 26, '#fff', 3);
        } }, follow(a))));
      this.unmount = a.stop; reset();
    } });

  /* ---------- Кёрлинг ---------- */
  Games.register({ id: 'curling', title: 'Кёрлинг', icon: '🥌', cat: 'arcade', desc: 'Запускай камни к «дому» против бота. 8 камней — у кого ближе к центру', bestLabel: 'Побед',
    mount(screen, api) {
      const W = 360, H = 600, R = 13, HX = W / 2, HY = 130; let stones, turn, thrown, drag, moving, st = K.stats(api, 'curling'), done, msg;
      function reset() { stones = []; turn = 0; thrown = 0; drag = null; moving = false; done = false; msg = 'Оттяните камень вниз и отпустите'; }
      const launch = (vx, vy, team) => { stones.push({ x: W / 2, y: H - 70, vx, vy, t: team }); moving = true; thrown++; api.sound('tap'); };
      function botThrow() { const target = stones.filter(s => s.t === 0).sort((a, b) => Math.hypot(a.x - HX, a.y - HY) - Math.hypot(b.x - HX, b.y - HY))[0]; let tx = HX + api.rand(-18, 18), ty = HY + api.rand(-18, 18); if (target && Math.hypot(target.x - HX, target.y - HY) < 50 && Math.random() < 0.6) { tx = target.x; ty = target.y + 10; } const dist = H - 70 - ty; const v = Math.sqrt(2 * 95 * dist) * (1 + api.rand(-4, 4) / 100) + (target && tx === target.x ? 120 : 0); const dx = tx - W / 2; const vy = -v * dist / Math.hypot(dx, dist), vx = v * dx / Math.hypot(dx, dist); launch(vx, vy, 1); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Камней', value: '0/8' }, { label: 'П · П', value: st.txt() }], hint: 'Тяните от своего камня вниз — чем дальше, тем сильнее',
        onDown: p => { if (moving || turn || done) return; drag = p; }, onMove: p => { if (drag) a.dp = p; }, onUp: p => { if (!drag || p.x < 0) { drag = null; return; } const dx = drag.x - p.x, dy = drag.y - p.y; drag = null; a.dp = null; if (dy > -10) return; const pw = Math.min(1, Math.hypot(dx, dy) / 200); const v = 280 + pw * 450; const n = Math.hypot(dx, dy); launch(dx / n * v * 0.6, dy / n * v, 0); },
        frame(dt, ctx) {
          if (moving) { let any = false; for (let it = 0; it < 3; it++) { const sdt = dt / 3; stones.forEach(s => { const sp = Math.hypot(s.vx, s.vy); if (sp > 1) { const dec = Math.max(0, sp - 95 * sdt) / sp; s.vx *= dec; s.vy *= dec; s.x += s.vx * sdt; s.y += s.vy * sdt; any = true; } else { s.vx = s.vy = 0; } if (s.x < R || s.x > W - R || s.y < -R) s.out = true; }); for (let i = 0; i < stones.length; i++) for (let j = i + 1; j < stones.length; j++) { const p = stones[i], q = stones[j]; const dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy); if (d < 2 * R && d > 0) { const nx = dx / d, ny = dy / d, ov = 2 * R - d; p.x -= nx * ov / 2; p.y -= ny * ov / 2; q.x += nx * ov / 2; q.y += ny * ov / 2; const dv = (p.vx - q.vx) * nx + (p.vy - q.vy) * ny; if (dv > 0) { p.vx -= dv * nx; p.vy -= dv * ny; q.vx += dv * nx; q.vy += dv * ny; api.sound('select'); } } } stones = stones.filter(s => !s.out); }
            if (!any) { moving = false; a.hdr.set(0, thrown + '/8'); if (thrown >= 8) finish(); else { turn = 1 - turn; if (turn) setTimeout(botThrow, 700); } } }
          bg(ctx, W, H, '#e0f2fe'); [[70, '#3b82f6'], [50, '#fff'], [30, '#ef4444'], [10, '#fff']].forEach(([r, c]) => circ(ctx, HX, HY, r, c)); K.line(ctx, 0, HY, W, HY, '#94a3b8', 1); K.line(ctx, 0, H - 110, W, H - 110, '#ef4444', 2);
          stones.forEach(s => { circ(ctx, s.x, s.y, R, '#6b7280'); circ(ctx, s.x, s.y, R - 4, s.t ? '#facc15' : '#dc2626'); }); if (!moving && !turn && !done) { circ(ctx, W / 2, H - 70, R, '#6b7280'); circ(ctx, W / 2, H - 70, R - 4, '#dc2626'); if (drag && a.dp) K.line(ctx, W / 2, H - 70, W / 2 + (drag.x - a.dp.x), H - 70 + (drag.y - a.dp.y), '#0f172a', 3); }
          text(ctx, msg, W / 2, H - 20, 14, '#0f172a');
        } });
      function finish() { done = true; const sorted = stones.map(s => ({ s, d: Math.hypot(s.x - HX, s.y - HY) })).filter(x => x.d < 70 + R).sort((a, b) => a.d - b.d); let pts = 0, who = -1; if (sorted.length) { who = sorted[0].s.t; const oppBest = (sorted.find(x => x.s.t !== who) || { d: 999 }).d; pts = sorted.filter(x => x.s.t === who && x.d < oppBest).length; } const win = who === 0; if (win) st.win(); else if (who === 1) st.lose(); a.hdr.set(1, st.txt()); setTimeout(() => api.end({ win: who !== 1, title: who < 0 ? 'Никто не в доме' : win ? 'Ваши очки: ' + pts : 'Бот набрал ' + pts, reward: win ? 5 + pts * 5 : 0, onAgain: () => { reset(); } }), 500); }
      this.unmount = a.stop; reset();
    } });
})();
