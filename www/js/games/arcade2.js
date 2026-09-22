/* Дополнительные аркады, часть 1 */
(function () {
  const rr = (ctx, x, y, w, h, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); };
  const circ = (ctx, x, y, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); };
  const text = (ctx, t, x, y, size, c, align) => { ctx.fillStyle = c || '#fff'; ctx.font = 'bold ' + size + 'px sans-serif'; ctx.textAlign = align || 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t, x, y); };

  /* ---------- Прыгун (Doodle Jump) ---------- */
  Games.register({
    id: 'doodle', title: 'Прыгун', icon: '🦘', cat: 'arcade', desc: 'Прыгай по платформам всё выше', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 600; let px, py, vy, plats, score, alive, targetX, camY, started;
      function reset() { px = W / 2; py = H - 80; vy = 0; camY = 0; score = 0; alive = true; started = false; targetX = px; plats = []; for (let i = 0; i < 12; i++) plats.push({ x: api.rand(30, W - 90), y: H - 40 - i * 55, w: 60, m: i > 4 && Math.random() < .2, dx: 1 }); a.hdr.set(0, 0); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Высота', value: 0 }, { label: 'Рекорд', value: api.bestOf('doodle') || 0 }], hint: 'Веди пальцем — герой следует за ним',
        onDown: p => { started = true; targetX = p.x; }, onMove: (p, e) => { if (e.buttons || e.pointerType === 'touch') targetX = p.x; },
        onKey: e => { if (e.key === 'ArrowLeft') targetX = px - 60; if (e.key === 'ArrowRight') targetX = px + 60; started = true; },
        frame(dt, ctx) {
          if (alive && started) {
            px += (targetX - px) * Math.min(1, dt * 10); vy += 1400 * dt; py += vy * dt;
            if (vy > 0) for (const p of plats) if (px > p.x - 14 && px < p.x + p.w + 14 && py + 20 > p.y && py + 20 < p.y + 14 + vy * dt) { vy = -620; api.sound('jump'); api.vibrate(5); }
            for (const p of plats) if (p.m) { p.x += p.dx * 80 * dt; if (p.x < 10 || p.x > W - 70) p.dx *= -1; }
            if (py < H / 2) { const d = H / 2 - py; py = H / 2; camY += d; plats.forEach(p => p.y += d); score = Math.max(score, Math.floor(camY / 10)); a.hdr.set(0, score); }
            plats = plats.filter(p => p.y < H + 20); while (plats.length < 12) { const top = Math.min(...plats.map(p => p.y)); plats.push({ x: api.rand(30, W - 90), y: top - api.rand(45, 60 + Math.min(40, score / 20)), w: Math.max(36, 60 - score / 40), m: Math.random() < .2 + score / 3000, dx: 1 }); }
            if (py > H + 30) { alive = false; api.best('doodle', score); api.end({ win: false, title: 'Упали!', reward: Math.floor(score / 30), text: 'Высота: ' + score, onAgain: reset }); }
          }
          const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1e1b4b'); g.addColorStop(1, '#0f0f1a'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
          for (const p of plats) rr(ctx, p.x, p.y, p.w, 12, 6, p.m ? '#fbbf24' : '#34d399');
          rr(ctx, px - 16, py - 20, 32, 40, 10, '#8b5cf6'); circ(ctx, px - 6, py - 8, 3, '#fff'); circ(ctx, px + 6, py - 8, 3, '#fff');
          if (!started) text(ctx, 'Тап — старт', W / 2, H / 2 - 60, 24);
        } });
      this.unmount = a.stop; reset();
    }
  });

  /* ---------- Дорога (Crossy) ---------- */
  Games.register({
    id: 'crossy', title: 'Через дорогу', icon: '🐔', cat: 'arcade', desc: 'Перебеги дороги, не попав под машины', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 600, CS = 40; let lanes, px, py, score, alive, camY, best = 0;
      function mkLane(y) { const road = Math.random() < .6 && y < 0; return { y, road, dir: Math.random() < .5 ? 1 : -1, speed: api.rand(60, 140) + Math.abs(y) / 40, cars: road ? Array.from({ length: api.rand(1, 3) }, () => ({ x: api.rand(0, W), w: api.rand(50, 90) })) : [] }; }
      function reset() { px = 4; py = 0; score = 0; alive = true; camY = 0; lanes = {}; for (let i = -14; i <= 2; i++) lanes[i] = mkLane(i); lanes[0].road = false; lanes[0].cars = []; a.hdr.set(0, 0); }
      const laneOf = y => { if (!lanes[y]) lanes[y] = mkLane(y); return lanes[y]; };
      function move(dx, dy) { if (!alive) return; const nx = Math.max(0, Math.min(8, px + dx)), ny = py + dy; px = nx; py = ny; api.sound('jump'); api.vibrate(5); if (-py > score) { score = -py; a.hdr.set(0, score); if (score % 10 === 0) api.addCoins(2); } }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Счёт', value: 0 }, { label: 'Рекорд', value: api.bestOf('crossy') || 0 }], hint: 'Свайп или тап — шаг вперёд',
        onKey: e => ({ ArrowUp: () => move(0, -1), ArrowDown: () => move(0, 1), ArrowLeft: () => move(-1, 0), ArrowRight: () => move(1, 0) }[e.key] || (() => {}))(),
        frame(dt, ctx) {
          const targetCam = py * CS - H * 0.65; camY += (targetCam - camY) * Math.min(1, dt * 6);
          if (alive) {
            for (let y = py - 16; y <= py + 4; y++) { const l = laneOf(y); if (!l.road) continue; for (const c of l.cars) { c.x += l.dir * l.speed * dt; if (c.x > W + 100) c.x = -100; if (c.x < -100) c.x = W + 100; if (y === py) { const hx = px * CS + CS / 2; if (hx > c.x - 4 && hx < c.x + c.w + 4) die(); } } }
          }
          ctx.fillStyle = '#14532d'; ctx.fillRect(0, 0, W, H);
          for (let y = py - 16; y <= py + 6; y++) { const l = laneOf(y); const sy = y * CS - camY; if (l.road) { ctx.fillStyle = '#26264a'; ctx.fillRect(0, sy, W, CS); ctx.strokeStyle = '#55557a'; ctx.setLineDash([12, 12]); ctx.beginPath(); ctx.moveTo(0, sy + CS / 2); ctx.lineTo(W, sy + CS / 2); ctx.stroke(); ctx.setLineDash([]); for (const c of l.cars) rr(ctx, c.x, sy + 6, c.w, CS - 12, 6, l.dir > 0 ? '#f87171' : '#fbbf24'); } else if (y % 2) { ctx.fillStyle = '#166534'; ctx.fillRect(0, sy, W, CS); } }
          const hx = px * CS + CS / 2, hy = py * CS - camY + CS / 2; circ(ctx, hx, hy, 15, '#fde68a'); circ(ctx, hx + 5, hy - 4, 3, '#000'); rr(ctx, hx + 10, hy, 10, 6, 2, '#f97316');
        } });
      api.swipe(a.cv.canvas, d => { if (d === 'tap' || d === 'u') move(0, -1); else if (d === 'd') move(0, 1); else if (d === 'l') move(-1, 0); else if (d === 'r') move(1, 0); });
      function die() { alive = false; api.sound('boom'); api.vibrate([60, 40, 120]); api.best('crossy', score); api.end({ win: false, title: 'Сбила машина!', reward: Math.floor(score / 5), text: 'Счёт: ' + score, onAgain: reset }); }
      this.unmount = a.stop; reset();
    }
  });

  /* ---------- Космос (шутер) ---------- */
  Games.register({
    id: 'shooter', title: 'Космос', icon: '🚀', cat: 'arcade', desc: 'Уничтожай астероиды, корабль стреляет сам', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 600; let px, bullets, rocks, score, lives, alive, shotT, spawnT, stars, parts;
      function reset() { px = W / 2; bullets = []; rocks = []; parts = []; score = 0; lives = 3; alive = true; shotT = 0; spawnT = 0; stars = Array.from({ length: 60 }, () => ({ x: Math.random() * W, y: Math.random() * H, s: Math.random() * 2 + 1 })); a.hdr.set(0, 0); a.hdr.set(1, 3); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Счёт', value: 0 }, { label: '❤', value: 3 }, { label: 'Рекорд', value: api.bestOf('shooter') || 0 }], hint: 'Веди пальцем — корабль следует',
        onDown: p => px = p.x, onMove: (p, e) => { if (e.buttons || e.pointerType === 'touch') px = p.x; }, onKey: e => { if (e.key === 'ArrowLeft') px -= 25; if (e.key === 'ArrowRight') px += 25; },
        frame(dt, ctx) {
          if (alive) {
            px = Math.max(20, Math.min(W - 20, px)); shotT -= dt; if (shotT <= 0) { shotT = 0.22; bullets.push({ x: px, y: H - 70 }); }
            spawnT -= dt; if (spawnT <= 0) { spawnT = Math.max(0.35, 1 - score / 400); rocks.push({ x: api.rand(25, W - 25), y: -30, r: api.rand(14, 30), v: api.rand(60, 120) + score / 10, hp: 1 }); }
            bullets.forEach(b => b.y -= 500 * dt); bullets = bullets.filter(b => b.y > -10);
            for (const r of rocks) { r.y += r.v * dt; for (const b of bullets) if (Math.hypot(b.x - r.x, b.y - r.y) < r.r) { b.y = -99; r.hp--; if (r.hp <= 0) { r.dead = true; score += 10; api.sound('tap'); for (let i = 0; i < 8; i++) parts.push({ x: r.x, y: r.y, vx: (Math.random() - .5) * 300, vy: (Math.random() - .5) * 300, a: 1 }); if (score % 100 === 0) api.addCoins(3); } }
              if (!r.dead && Math.hypot(px - r.x, H - 50 - r.y) < r.r + 14) { r.dead = true; lives--; a.hdr.set(1, lives); api.sound('boom'); api.vibrate(50); if (lives <= 0) { alive = false; api.best('shooter', score); api.end({ win: false, title: 'Корабль уничтожен', reward: Math.floor(score / 40), text: 'Счёт: ' + score, onAgain: reset }); } }
              if (r.y > H + 30) r.dead = true; }
            rocks = rocks.filter(r => !r.dead); a.hdr.set(0, score);
            parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.a -= dt * 2; }); parts = parts.filter(p => p.a > 0);
            stars.forEach(s => { s.y += s.s * 40 * dt; if (s.y > H) s.y = 0; });
          }
          ctx.fillStyle = '#0b0b1a'; ctx.fillRect(0, 0, W, H); stars.forEach(s => circ(ctx, s.x, s.y, s.s / 2, '#fff'));
          rocks.forEach(r => { circ(ctx, r.x, r.y, r.r, '#6b7280'); circ(ctx, r.x - r.r / 3, r.y - r.r / 3, r.r / 4, '#4b5563'); });
          bullets.forEach(b => rr(ctx, b.x - 2, b.y - 8, 4, 14, 2, '#22d3ee'));
          parts.forEach(p => { ctx.globalAlpha = p.a; circ(ctx, p.x, p.y, 3, '#fbbf24'); }); ctx.globalAlpha = 1;
          ctx.fillStyle = '#8b5cf6'; ctx.beginPath(); ctx.moveTo(px, H - 75); ctx.lineTo(px + 18, H - 30); ctx.lineTo(px, H - 40); ctx.lineTo(px - 18, H - 30); ctx.closePath(); ctx.fill(); circ(ctx, px, H - 22 + Math.random() * 4, 6, '#f97316');
        } });
      this.unmount = a.stop; reset();
    }
  });

  /* ---------- Лунная посадка ---------- */
  Games.register({
    id: 'lander', title: 'Посадка', icon: '🌕', cat: 'arcade', desc: 'Мягко посади модуль на площадку', progress: api => 'Уровень ' + (api.level('lander').lvl + 1),
    mount(screen, api) {
      const W = 360, H = 560; const L = api.level('lander'); let x, y, vx, vy, fuel, thrust, tilt, pad, alive, ground, done;
      function reset() { x = api.rand(60, W - 60); y = 60; vx = api.rand(-30, 30); vy = 0; fuel = 100; thrust = false; tilt = 0; done = false; alive = true; const pw = Math.max(40, 90 - L.lvl * 3); pad = { x: api.rand(20, W - 20 - pw), w: pw }; ground = []; for (let gx = 0; gx <= W; gx += 20) ground.push(gx >= pad.x - 20 && gx <= pad.x + pad.w + 20 ? H - 40 : H - 40 - api.rand(0, 60 + L.lvl * 5)); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Уровень', value: L.lvl + 1 }, { label: 'Топливо', value: 100 }, { label: 'Скорость', value: 0 }], hint: 'Удерживай: слева — наклон влево, справа — вправо, центр — тяга',
        onDown: p => { thrust = true; tilt = p.x < W / 3 ? -1 : p.x > 2 * W / 3 ? 1 : 0; }, onUp: () => { thrust = false; tilt = 0; },
        onKey: e => { if (e.key === 'ArrowUp' || e.key === ' ') thrust = true; if (e.key === 'ArrowLeft') tilt = -1; if (e.key === 'ArrowRight') tilt = 1; },
        frame(dt, ctx) {
          if (alive && !done) {
            vy += 40 * dt; if (thrust && fuel > 0) { vy -= 90 * dt; vx += tilt * 60 * dt; fuel -= 12 * dt; a.hdr.set(1, Math.max(0, Math.round(fuel))); }
            x += vx * dt; y += vy * dt; if (x < 10) { x = 10; vx = 0; } if (x > W - 10) { x = W - 10; vx = 0; } a.hdr.set(2, Math.round(Math.hypot(vx, vy)));
            const gi = Math.floor(x / 20); const gy = ground[Math.max(0, Math.min(ground.length - 1, gi))];
            if (y + 14 >= gy) { done = true; const onPad = x > pad.x && x < pad.x + pad.w; const soft = Math.abs(vy) < 40 && Math.abs(vx) < 25; if (onPad && soft) { L.done(); api.end({ title: 'Мягкая посадка!', reward: 10 + Math.round(fuel / 10) + L.lvl, text: 'Осталось топлива: ' + Math.round(fuel), again: 'Дальше', onAgain: reset }); } else { api.sound('boom'); api.end({ win: false, title: onPad ? 'Слишком жёстко!' : 'Мимо площадки', text: 'Скорость: ' + Math.round(Math.hypot(vx, vy)), onAgain: reset }); } }
          }
          ctx.fillStyle = '#0b0b1a'; ctx.fillRect(0, 0, W, H);
          ctx.fillStyle = '#4b5563'; ctx.beginPath(); ctx.moveTo(0, H); ground.forEach((g, i) => ctx.lineTo(i * 20, g)); ctx.lineTo(W, H); ctx.fill();
          rr(ctx, pad.x, H - 44, pad.w, 6, 2, '#34d399');
          ctx.save(); ctx.translate(x, y); ctx.rotate(tilt * 0.2); rr(ctx, -12, -14, 24, 22, 6, '#e5e7eb'); ctx.strokeStyle = '#9ca3af'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-10, 8); ctx.lineTo(-16, 16); ctx.moveTo(10, 8); ctx.lineTo(16, 16); ctx.stroke(); if (thrust && fuel > 0 && !done) { ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.moveTo(-6, 10); ctx.lineTo(6, 10); ctx.lineTo(0, 24 + Math.random() * 10); ctx.fill(); } ctx.restore();
        } });
      window.addEventListener('keyup', a._ku = () => { thrust = false; tilt = 0; });
      this.unmount = () => { a.stop(); window.removeEventListener('keyup', a._ku); }; reset();
    }
  });

  /* ---------- Башня (Stack) ---------- */
  Games.register({
    id: 'stack', title: 'Башня', icon: '🏗', cat: 'arcade', desc: 'Ставь блоки ровно друг на друга', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 600, BH = 26; let blocks, cur, dir, speed, score, alive, camY;
      function reset() { blocks = [{ x: 80, w: 200 }]; cur = { x: 0, w: 200 }; dir = 1; speed = 160; score = 0; alive = true; camY = 0; a.hdr.set(0, 0); }
      function drop() {
        if (!alive) return; const top = blocks[blocks.length - 1]; const l = Math.max(cur.x, top.x), r = Math.min(cur.x + cur.w, top.x + top.w);
        if (r - l <= 4) { alive = false; api.sound('boom'); api.best('stack', score); api.end({ win: false, title: 'Промах!', reward: Math.floor(score / 4), text: 'Высота: ' + score, onAgain: reset }); return; }
        const perfect = Math.abs(cur.x - top.x) < 4; blocks.push({ x: perfect ? top.x : l, w: perfect ? top.w : r - l }); score++; a.hdr.set(0, score); api.sound(perfect ? 'good' : 'tap'); api.vibrate(perfect ? [10, 20, 10] : 6); if (perfect) api.addCoins(1);
        cur = { x: dir > 0 ? -blocks[blocks.length - 1].w : W, w: blocks[blocks.length - 1].w }; dir *= -1; speed = Math.min(400, 160 + score * 8);
      }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Высота', value: 0 }, { label: 'Рекорд', value: api.bestOf('stack') || 0 }], hint: 'Тап — поставить блок', onDown: drop, onKey: e => { if (e.key === ' ') drop(); },
        frame(dt, ctx) {
          if (alive) { cur.x += dir * speed * dt; if (cur.x > W) dir = -1; if (cur.x + cur.w < 0) dir = 1; }
          const target = Math.max(0, blocks.length * BH - H * 0.6); camY += (target - camY) * Math.min(1, dt * 5);
          ctx.fillStyle = '#171728'; ctx.fillRect(0, 0, W, H);
          blocks.forEach((b, i) => rr(ctx, b.x, H - 40 - (i + 1) * BH + camY, b.w, BH - 2, 4, `hsl(${(i * 12) % 360},70%,60%)`));
          if (alive) rr(ctx, cur.x, H - 40 - (blocks.length + 1) * BH + camY, cur.w, BH - 2, 4, `hsl(${(blocks.length * 12) % 360},70%,70%)`);
        } });
      this.unmount = a.stop; reset();
    }
  });

  /* ---------- Вертолёт ---------- */
  Games.register({
    id: 'copter', title: 'Вертолёт', icon: '🚁', cat: 'arcade', desc: 'Держи, чтобы подниматься, лети через пещеру', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 500; let y, vy, hold, cols, dist, alive, started, gap, mid;
      function reset() { y = H / 2; vy = 0; hold = false; cols = []; dist = 0; alive = true; started = false; gap = 220; mid = H / 2; for (let i = 0; i < 20; i++) addCol(i * 20); a.hdr.set(0, 0); }
      function addCol(x) { mid += api.rand(-25, 25); mid = Math.max(gap / 2 + 20, Math.min(H - gap / 2 - 20, mid)); cols.push({ x, top: mid - gap / 2, bot: mid + gap / 2, block: Math.random() < 0.06 ? api.rand(0, 1) : -1 }); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Дистанция', value: 0 }, { label: 'Рекорд', value: api.bestOf('copter') || 0 }], hint: 'Удерживай — вверх, отпусти — вниз',
        onDown: () => { hold = true; started = true; }, onUp: () => hold = false, onKey: e => { if (e.key === ' ') { hold = true; started = true; } },
        frame(dt, ctx) {
          if (alive && started) {
            vy += (hold ? -900 : 700) * dt; vy = Math.max(-260, Math.min(260, vy)); y += vy * dt; dist += 200 * dt; const sp = 200 + dist / 50;
            cols.forEach(c => c.x -= sp * dt); cols = cols.filter(c => c.x > -30); while (cols.length < 20) addCol(cols[cols.length - 1].x + 20);
            gap = Math.max(130, 220 - dist / 60);
            const c = cols.find(c => c.x <= 70 && c.x + 20 >= 50); if (c && (y - 10 < c.top || y + 10 > c.bot || (c.block >= 0 && ((c.block === 0 && y < c.top + 70) || (c.block === 1 && y > c.bot - 70))))) { alive = false; api.sound('boom'); api.vibrate([60, 40, 120]); const s = Math.floor(dist / 10); api.best('copter', s); api.end({ win: false, title: 'Крушение', reward: Math.floor(s / 20), text: 'Дистанция: ' + s, onAgain: reset }); }
            a.hdr.set(0, Math.floor(dist / 10));
          }
          ctx.fillStyle = '#0f0f1a'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#3b2f6d';
          cols.forEach(c => { ctx.fillRect(c.x, 0, 21, c.top); ctx.fillRect(c.x, c.bot, 21, H - c.bot); if (c.block === 0) ctx.fillRect(c.x, c.top, 21, 70); if (c.block === 1) ctx.fillRect(c.x, c.bot - 70, 21, 70); });
          rr(ctx, 40, y - 8, 36, 16, 6, '#fbbf24'); rr(ctx, 30, y - 14, 44, 3, 1, '#e5e7eb'); rr(ctx, 20, y - 4, 22, 5, 2, '#fbbf24');
          if (!started) text(ctx, 'Удерживай для старта', W / 2, H / 2 - 80, 20);
        } });
      window.addEventListener('keyup', a._ku = () => hold = false);
      this.unmount = () => { a.stop(); window.removeEventListener('keyup', a._ku); }; reset();
    }
  });

  /* ---------- Динозаврик ---------- */
  Games.register({
    id: 'dino', title: 'Динозаврик', icon: '🦖', cat: 'arcade', desc: 'Прыгай через кактусы, как в Chrome', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 400, H = 300, G = H - 50; let y, vy, obs, dist, alive, speed, started, duck;
      function reset() { y = 0; vy = 0; obs = []; dist = 0; alive = true; speed = 260; started = false; duck = false; a.hdr.set(0, 0); }
      function jump() { if (!alive) return; started = true; if (y === 0) { vy = -520; api.sound('jump'); api.vibrate(5); } }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Счёт', value: 0 }, { label: 'Рекорд', value: api.bestOf('dino') || 0 }], hint: 'Тап — прыжок', onDown: jump, onKey: e => { if (e.key === ' ' || e.key === 'ArrowUp') jump(); },
        frame(dt, ctx) {
          if (alive && started) {
            vy += 1500 * dt; y += vy * dt; if (y > 0) { y = 0; vy = 0; }
            dist += speed * dt; speed += dt * 6; a.hdr.set(0, Math.floor(dist / 10));
            if (!obs.length || obs[obs.length - 1].x < W - api.rand(220, 420)) obs.push({ x: W + 20, w: api.rand(14, 30), h: api.rand(30, 55), bird: dist > 2000 && Math.random() < .25 });
            obs.forEach(o => o.x -= speed * dt); obs = obs.filter(o => o.x > -40);
            for (const o of obs) { const oy = o.bird ? G - 75 : G - o.h; const oh = o.bird ? 20 : o.h; if (60 + 22 > o.x && 60 - 12 < o.x + o.w && G + y > oy && G + y - 40 < oy + oh) { alive = false; api.sound('boom'); api.vibrate([60, 40, 120]); const s = Math.floor(dist / 10); api.best('dino', s); api.end({ win: false, title: 'Ой!', reward: Math.floor(s / 30), text: 'Счёт: ' + s, onAgain: reset }); } }
            if (Math.floor(dist / 10) % 500 === 0 && dist > 10) api.addCoins(0);
          }
          ctx.fillStyle = '#171728'; ctx.fillRect(0, 0, W, H); ctx.strokeStyle = '#55557a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, G + 1); ctx.lineTo(W, G + 1); ctx.stroke();
          obs.forEach(o => { if (o.bird) { rr(ctx, o.x, G - 75, o.w + 10, 14, 6, '#c084fc'); } else rr(ctx, o.x, G - o.h, o.w, o.h, 5, '#34d399'); });
          const dy = G + y; rr(ctx, 48, dy - 40, 26, 40, 8, '#8b5cf6'); rr(ctx, 62, dy - 44, 22, 18, 6, '#8b5cf6'); circ(ctx, 76, dy - 37, 2.5, '#fff'); rr(ctx, 50, dy - 6, 8, 6, 2, '#6d28d9'); rr(ctx, 64, dy - 6, 8, 6, 2, '#6d28d9');
          if (!started) text(ctx, 'Тап — старт', W / 2, H / 2 - 40, 22);
        } });
      this.unmount = a.stop; reset();
    }
  });

  /* ---------- Гонки ---------- */
  Games.register({
    id: 'racing', title: 'Гонки', icon: '🏎', cat: 'arcade', desc: 'Обгоняй машины, веди пальцем', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 600; let px, cars, dist, alive, speed, spawnT, lineOff, targetX;
      function reset() { px = W / 2; targetX = px; cars = []; dist = 0; alive = true; speed = 250; spawnT = 0; lineOff = 0; a.hdr.set(0, 0); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Дистанция', value: 0 }, { label: 'Рекорд', value: api.bestOf('racing') || 0 }], hint: 'Веди пальцем влево-вправо',
        onDown: p => targetX = p.x, onMove: (p, e) => { if (e.buttons || e.pointerType === 'touch') targetX = p.x; }, onKey: e => { if (e.key === 'ArrowLeft') targetX = px - 60; if (e.key === 'ArrowRight') targetX = px + 60; },
        frame(dt, ctx) {
          if (alive) {
            px += (Math.max(50, Math.min(W - 50, targetX)) - px) * Math.min(1, dt * 8); dist += speed * dt; speed += dt * 8; lineOff = (lineOff + speed * dt) % 60; a.hdr.set(0, Math.floor(dist / 20));
            spawnT -= dt; if (spawnT <= 0) { spawnT = Math.max(0.4, 1.1 - dist / 20000); const lane = api.rand(0, 3); cars.push({ x: 45 + lane * 90, y: -80, v: speed * api.rand(35, 65) / 100, c: `hsl(${api.rand(0, 360)},70%,60%)` }); }
            cars.forEach(c => c.y += (speed - c.v) * dt); cars = cars.filter(c => c.y < H + 80);
            for (const c of cars) if (Math.abs(c.x - px) < 38 && Math.abs(c.y - (H - 90)) < 62) { alive = false; api.sound('boom'); api.vibrate([60, 40, 120]); const s = Math.floor(dist / 20); api.best('racing', s); api.end({ win: false, title: 'Авария!', reward: Math.floor(s / 25), text: 'Дистанция: ' + s, onAgain: reset }); }
          }
          ctx.fillStyle = '#14532d'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#26264a'; ctx.fillRect(10, 0, W - 20, H);
          ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 3; ctx.setLineDash([30, 30]); ctx.lineDashOffset = -lineOff; [90, 180, 270].forEach(x => { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }); ctx.setLineDash([]);
          const car = (x, y, c) => { rr(ctx, x - 20, y - 32, 40, 64, 10, c); rr(ctx, x - 14, y - 22, 28, 16, 4, '#1e1e33'); rr(ctx, x - 14, y + 8, 28, 12, 4, '#1e1e33'); };
          cars.forEach(c => car(c.x, c.y, c.c)); car(px, H - 90, '#22d3ee');
        } });
      this.unmount = a.stop; reset();
    }
  });
})();
