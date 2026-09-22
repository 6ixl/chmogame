/* Аркады, часть 3 */
(function () {
  const rr = (ctx, x, y, w, h, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); };
  const circ = (ctx, x, y, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); };
  const text = (ctx, t, x, y, size, c, align) => { ctx.fillStyle = c || '#fff'; ctx.font = 'bold ' + size + 'px sans-serif'; ctx.textAlign = align || 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t, x, y); };
  const over = (api, id, score, title, div, reset) => { api.best(id, score); api.end({ win: false, title, reward: Math.floor(score / div), text: 'Счёт: ' + score, onAgain: reset }); };

  /* ---------- Захватчики ---------- */
  Games.register({ id: 'invaders', title: 'Захватчики', icon: '👾', cat: 'arcade', desc: 'Отбей волны пришельцев. Веди пальцем, стреляет само', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 560; let px, aliens, bullets, ebullets, dir, score, lives, alive, shotT, wave, speed;
      function spawn() { aliens = []; for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) aliens.push({ x: 40 + c * 42, y: 60 + r * 40, t: r }); dir = 1; speed = 30 + wave * 10; }
      function reset() { px = W / 2; bullets = []; ebullets = []; score = 0; lives = 3; alive = true; shotT = 0; wave = 1; spawn(); a.hdr.set(0, 0); a.hdr.set(1, 3); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Счёт', value: 0 }, { label: '❤', value: 3 }, { label: 'Рекорд', value: api.bestOf('invaders') || 0 }], hint: 'Веди пальцем — корабль следует', onDown: p => px = p.x, onMove: (p, e) => { if (e.buttons || e.pointerType === 'touch') px = p.x; }, onKey: e => { if (e.key === 'ArrowLeft') px -= 25; if (e.key === 'ArrowRight') px += 25; },
        frame(dt, ctx) {
          if (alive) {
            px = Math.max(20, Math.min(W - 20, px)); shotT -= dt; if (shotT <= 0) { shotT = 0.4; bullets.push({ x: px, y: H - 60 }); }
            let hitEdge = false; aliens.forEach(al => { al.x += dir * speed * dt; if (al.x < 20 || al.x > W - 20) hitEdge = true; }); if (hitEdge) { dir *= -1; aliens.forEach(al => { al.y += 14; al.x += dir * 2; }); }
            if (Math.random() < dt * (0.6 + wave * 0.2) && aliens.length) { const al = aliens[api.rand(0, aliens.length - 1)]; ebullets.push({ x: al.x, y: al.y }); }
            bullets.forEach(b => b.y -= 450 * dt); ebullets.forEach(b => b.y += 220 * dt);
            for (const b of bullets) for (const al of aliens) if (!al.dead && Math.abs(b.x - al.x) < 16 && Math.abs(b.y - al.y) < 14) { al.dead = true; b.y = -99; score += 10; api.sound('tap'); }
            for (const b of ebullets) if (Math.abs(b.x - px) < 16 && b.y > H - 60 && b.y < H - 30) { b.y = H + 99; lives--; a.hdr.set(1, lives); api.sound('boom'); api.vibrate(50); }
            aliens = aliens.filter(al => !al.dead); bullets = bullets.filter(b => b.y > -10); ebullets = ebullets.filter(b => b.y < H + 10); a.hdr.set(0, score);
            if (!aliens.length) { wave++; api.addCoins(5); api.toast('Волна ' + wave); spawn(); }
            if (lives <= 0 || aliens.some(al => al.y > H - 80)) { alive = false; api.sound('lose'); over(api, 'invaders', score, 'Земля захвачена', 20, reset); }
          }
          ctx.fillStyle = '#0b0b1a'; ctx.fillRect(0, 0, W, H); aliens.forEach(al => { ctx.font = '26px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(['👾', '👽', '🛸', '🤖'][al.t], al.x, al.y); });
          bullets.forEach(b => rr(ctx, b.x - 2, b.y - 8, 4, 12, 2, '#22d3ee')); ebullets.forEach(b => rr(ctx, b.x - 2, b.y - 8, 4, 12, 2, '#f87171'));
          ctx.fillStyle = '#34d399'; ctx.beginPath(); ctx.moveTo(px, H - 66); ctx.lineTo(px + 20, H - 30); ctx.lineTo(px - 20, H - 30); ctx.fill();
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Астероиды ---------- */
  Games.register({ id: 'asteroids', title: 'Астероиды', icon: '☄️', cat: 'arcade', desc: 'Поворачивай корабль, лети и разбивай астероиды', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 520; let ship, rocks, bullets, score, lives, alive, shotT, turn = 0, thrust = false;
      function spawnRocks(n) { for (let i = 0; i < n; i++) { let x, y; do { x = Math.random() * W; y = Math.random() * H; } while (Math.hypot(x - ship.x, y - ship.y) < 120); rocks.push({ x, y, vx: (Math.random() - .5) * 80, vy: (Math.random() - .5) * 80, r: 34 }); } }
      function reset() { ship = { x: W / 2, y: H / 2, a: -Math.PI / 2, vx: 0, vy: 0 }; rocks = []; bullets = []; score = 0; lives = 3; alive = true; shotT = 0; spawnRocks(4); a.hdr.set(0, 0); a.hdr.set(1, 3); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Счёт', value: 0 }, { label: '❤', value: 3 }, { label: 'Рекорд', value: api.bestOf('asteroids') || 0 }], hint: 'Держи слева/справа — поворот, центр — тяга. Стреляет само',
        onDown: p => { if (p.x < W / 3) turn = -1; else if (p.x > 2 * W / 3) turn = 1; else thrust = true; }, onUp: () => { turn = 0; thrust = false; }, onKey: e => { if (e.key === 'ArrowLeft') turn = -1; if (e.key === 'ArrowRight') turn = 1; if (e.key === 'ArrowUp') thrust = true; },
        frame(dt, ctx) {
          if (alive) {
            ship.a += turn * 3.5 * dt; if (thrust) { ship.vx += Math.cos(ship.a) * 300 * dt; ship.vy += Math.sin(ship.a) * 300 * dt; } ship.vx *= 0.99; ship.vy *= 0.99; ship.x = (ship.x + ship.vx * dt + W) % W; ship.y = (ship.y + ship.vy * dt + H) % H;
            shotT -= dt; if (shotT <= 0) { shotT = 0.3; bullets.push({ x: ship.x, y: ship.y, vx: Math.cos(ship.a) * 400 + ship.vx, vy: Math.sin(ship.a) * 400 + ship.vy, t: 1.2 }); }
            bullets.forEach(b => { b.x = (b.x + b.vx * dt + W) % W; b.y = (b.y + b.vy * dt + H) % H; b.t -= dt; }); bullets = bullets.filter(b => b.t > 0);
            rocks.forEach(r => { r.x = (r.x + r.vx * dt + W) % W; r.y = (r.y + r.vy * dt + H) % H; });
            const nr = []; for (const r of rocks) { let hit = false; for (const b of bullets) if (Math.hypot(b.x - r.x, b.y - r.y) < r.r) { hit = true; b.t = 0; break; } if (hit) { score += r.r > 20 ? 10 : 25; api.sound('tap'); if (r.r > 20) for (let k = 0; k < 2; k++) nr.push({ x: r.x, y: r.y, vx: (Math.random() - .5) * 140, vy: (Math.random() - .5) * 140, r: 16 }); } else nr.push(r); } rocks = nr;
            for (const r of rocks) if (Math.hypot(r.x - ship.x, r.y - ship.y) < r.r + 10) { lives--; a.hdr.set(1, lives); api.sound('boom'); api.vibrate(60); ship.x = W / 2; ship.y = H / 2; ship.vx = ship.vy = 0; rocks = rocks.filter(x => Math.hypot(x.x - W / 2, x.y - H / 2) > 100); if (lives <= 0) { alive = false; over(api, 'asteroids', score, 'Корабль разбит', 25, reset); } break; }
            if (!rocks.length) { api.addCoins(5); spawnRocks(4 + Math.floor(score / 200)); } a.hdr.set(0, score);
          }
          ctx.fillStyle = '#0b0b1a'; ctx.fillRect(0, 0, W, H); rocks.forEach(r => { ctx.strokeStyle = '#9ca3af'; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4; const rad = r.r * (0.8 + 0.2 * ((i * 7) % 3) / 2); ctx.lineTo(r.x + Math.cos(an) * rad, r.y + Math.sin(an) * rad); } ctx.closePath(); ctx.stroke(); });
          bullets.forEach(b => circ(ctx, b.x, b.y, 3, '#22d3ee')); ctx.save(); ctx.translate(ship.x, ship.y); ctx.rotate(ship.a); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-10, 9); ctx.lineTo(-6, 0); ctx.lineTo(-10, -9); ctx.closePath(); ctx.stroke(); if (thrust) { ctx.strokeStyle = '#f97316'; ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(-18 - Math.random() * 6, 0); ctx.stroke(); } ctx.restore();
        } });
      window.addEventListener('keyup', a._ku = () => { turn = 0; thrust = false; }); this.unmount = () => { a.stop(); window.removeEventListener('keyup', a._ku); }; reset();
    } });

  /* ---------- Пак-мен ---------- */
  Games.register({ id: 'pacman', title: 'Пожиратель', icon: '🟡', cat: 'arcade', desc: 'Съешь все точки в лабиринте, убегай от призраков', bestLabel: 'Рекорд',
    mount(screen, api) {
      const M = ['###################', '#........#........#', '#.##.###.#.###.##.#', '#o##.###.#.###.##o#', '#.................#', '#.##.#.#####.#.##.#', '#....#...#...#....#', '####.### # ###.####', '   #.#       #.#   ', '####.# ##-## #.####', '    .  #   #  .    ', '####.# ##### #.####', '   #.#       #.#   ', '####.# ##### #.####', '#........#........#', '#.##.###.#.###.##.#', '#o.#...........#.o#', '##.#.#.#####.#.#.##', '#....#...#...#....#', '#.######.#.######.#', '#.................#', '###################'];
      const COLS = 19, ROWS = M.length, CS = 20, W = COLS * CS, H = ROWS * CS; let grid, pac, ghosts, score, lives, alive, dots, want, power;
      const wall = (x, y) => { if (y < 0 || y >= ROWS) return true; if (x < 0 || x >= COLS) return false; return grid[y][x] === '#'; };
      function reset() { grid = M.map(r => r.split('')); dots = grid.flat().filter(c => c === '.' || c === 'o').length; pac = { x: 9, y: 16, dx: 0, dy: 0, t: 0 }; want = { dx: 0, dy: 0 }; ghosts = [{ x: 9, y: 10, c: '#f87171' }, { x: 8, y: 10, c: '#f472b6' }, { x: 10, y: 10, c: '#22d3ee' }].map(g => ({ ...g, dx: 0, dy: -1, t: 0 })); score = 0; lives = 3; alive = true; power = 0; a.hdr.set(0, 0); a.hdr.set(1, 3); }
      function step(e, isPac) {
        e.t += 1; if (isPac && !wall(pac.x + want.dx, pac.y + want.dy)) { e.dx = want.dx; e.dy = want.dy; }
        if (!isPac) { const opts = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => !wall(e.x + dx, e.y + dy) && !(dx === -e.dx && dy === -e.dy)); if (opts.length) { let best = opts[api.rand(0, opts.length - 1)]; if (Math.random() < (power ? 0.2 : 0.7)) best = opts.sort((p, q) => { const d = o => Math.hypot(e.x + o[0] - pac.x, e.y + o[1] - pac.y); return power ? d(q) - d(p) : d(p) - d(q); })[0]; e.dx = best[0]; e.dy = best[1]; } else { e.dx = -e.dx; e.dy = -e.dy; } }
        if (!wall(e.x + e.dx, e.y + e.dy)) { e.x = (e.x + e.dx + COLS) % COLS; e.y += e.dy; }
      }
      let acc = 0, gacc = 0;
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Счёт', value: 0 }, { label: '❤', value: 3 }, { label: 'Рекорд', value: api.bestOf('pacman') || 0 }], hint: 'Свайп — направление',
        onKey: e => { const m = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]; if (m) want = { dx: m[0], dy: m[1] }; },
        frame(dt, ctx) {
          if (alive) {
            acc += dt; gacc += dt; if (power > 0) power -= dt;
            if (acc > 0.14) { acc = 0; step(pac, true); const c = grid[pac.y][pac.x]; if (c === '.' || c === 'o') { grid[pac.y][pac.x] = ' '; dots--; score += c === 'o' ? 50 : 10; if (c === 'o') { power = 6; api.sound('good'); } else api.sound('select'); a.hdr.set(0, score); if (!dots) { alive = false; api.best('pacman', score); api.end({ title: 'Лабиринт очищен!', reward: 30 + Math.floor(score / 50), text: 'Счёт: ' + score, onAgain: reset }); } } }
            if (gacc > (power > 0 ? 0.26 : 0.17)) { gacc = 0; ghosts.forEach(g => step(g, false)); }
            for (const g of ghosts) if (g.x === pac.x && g.y === pac.y) { if (power > 0) { score += 200; g.x = 9; g.y = 10; api.sound('coin'); a.hdr.set(0, score); } else { lives--; a.hdr.set(1, lives); api.sound('boom'); api.vibrate(60); pac = { x: 9, y: 16, dx: 0, dy: 0, t: 0 }; want = { dx: 0, dy: 0 }; ghosts.forEach((gh, i) => { gh.x = 8 + i; gh.y = 10; }); if (lives <= 0) { alive = false; over(api, 'pacman', score, 'Поймали!', 30, reset); } break; } }
          }
          ctx.fillStyle = '#0b0b1a'; ctx.fillRect(0, 0, W, H); for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) { const c = grid[y][x]; if (c === '#') rr(ctx, x * CS + 1, y * CS + 1, CS - 2, CS - 2, 3, '#2a2a6a'); else if (c === '.') circ(ctx, x * CS + CS / 2, y * CS + CS / 2, 2.5, '#fde68a'); else if (c === 'o') circ(ctx, x * CS + CS / 2, y * CS + CS / 2, 6, '#fde68a'); }
          ghosts.forEach(g => { ctx.font = '18px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(power > 0 ? '👻' : '😈', g.x * CS + CS / 2, g.y * CS + CS / 2); });
          ctx.fillStyle = '#fbbf24'; ctx.beginPath(); const ang = Math.atan2(pac.dy, pac.dx || (pac.dy ? 0 : 1)); const m = (Math.sin(pac.t * 2) + 1) * 0.3; ctx.moveTo(pac.x * CS + CS / 2, pac.y * CS + CS / 2); ctx.arc(pac.x * CS + CS / 2, pac.y * CS + CS / 2, CS / 2 - 2, ang + m, ang + 2 * Math.PI - m); ctx.fill();
        } });
      api.swipe(a.cv.canvas, d => { const m = { l: [-1, 0], r: [1, 0], u: [0, -1], d: [0, 1] }[d]; if (m) want = { dx: m[0], dy: m[1] }; });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Бомбер ---------- */
  Games.register({ id: 'bomber', title: 'Бомбер', icon: '💣', cat: 'arcade', desc: 'Ставь бомбы, ломай стены, взрывай врагов', progress: api => 'Уровень ' + (api.level('bomber').lvl + 1),
    mount(screen, api) {
      const L = api.level('bomber'); const N = 11, CS = 32, W = N * CS, H = N * CS; let grid, px, py, bombs, fires, enemies, alive, moveT = 0, dir = null;
      function reset() { grid = []; for (let y = 0; y < N; y++) { grid.push([]); for (let x = 0; x < N; x++) grid[y].push(x === 0 || y === 0 || x === N - 1 || y === N - 1 || (x % 2 === 0 && y % 2 === 0) ? 2 : Math.random() < 0.45 && !(x <= 2 && y <= 2) ? 1 : 0); } px = 1; py = 1; bombs = []; fires = []; alive = true; enemies = []; const ne = 2 + Math.min(4, Math.floor(L.lvl / 3)); while (enemies.length < ne) { const x = api.rand(3, N - 2), y = api.rand(3, N - 2); if (!grid[y][x]) enemies.push({ x, y, t: 0 }); } }
      function bomb() { if (!alive || bombs.some(b => b.x === px && b.y === py) || bombs.length >= 2) return; bombs.push({ x: px, y: py, t: 2 }); api.sound('tap'); }
      function explode(b) { fires.push({ x: b.x, y: b.y, t: .5 }); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) for (let k = 1; k <= 2; k++) { const x = b.x + dx * k, y = b.y + dy * k; if (grid[y][x] === 2) break; fires.push({ x, y, t: .5 }); if (grid[y][x] === 1) { grid[y][x] = 0; break; } } api.sound('boom'); api.vibrate(40); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Уровень', value: L.lvl + 1 }, { label: 'Врагов', value: 0 }, { btn: '💣 Бомба', cls: 'primary', onClick: bomb }], hint: 'Свайп — движение · кнопка — бомба (взрыв через 2 с, радиус 2)',
        onKey: e => { const m = { ArrowLeft: 'l', ArrowRight: 'r', ArrowUp: 'u', ArrowDown: 'd' }[e.key]; if (m) go(m); if (e.key === ' ') bomb(); },
        frame(dt, ctx) {
          if (alive) {
            bombs.forEach(b => { b.t -= dt; if (b.t <= 0) { explode(b); b.dead = true; } }); bombs = bombs.filter(b => !b.dead); fires.forEach(f => f.t -= dt); fires = fires.filter(f => f.t > 0);
            enemies.forEach(e => { e.t += dt; if (e.t > 0.6) { e.t = 0; const o = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => !grid[e.y + dy][e.x + dx] && !bombs.some(b => b.x === e.x + dx && b.y === e.y + dy)); if (o.length) { const [dx, dy] = o[api.rand(0, o.length - 1)]; e.x += dx; e.y += dy; } } if (fires.some(f => f.x === e.x && f.y === e.y)) e.dead = true; });
            const before = enemies.length; enemies = enemies.filter(e => !e.dead); if (enemies.length < before) api.addCoins(2); a.hdr.set(1, enemies.length);
            if (fires.some(f => f.x === px && f.y === py) || enemies.some(e => e.x === px && e.y === py)) { alive = false; api.sound('lose'); api.end({ win: false, title: 'Взорвались!', onAgain: () => { reset(); } }); }
            else if (!enemies.length) { alive = false; L.done(); api.end({ title: 'Все враги уничтожены!', reward: 15 + L.lvl, again: 'Дальше', onAgain: reset }); }
          }
          ctx.fillStyle = '#14532d'; ctx.fillRect(0, 0, W, H); for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { if (grid[y][x] === 2) rr(ctx, x * CS, y * CS, CS, CS, 2, '#4b5563'); else if (grid[y][x] === 1) rr(ctx, x * CS + 1, y * CS + 1, CS - 2, CS - 2, 4, '#b45309'); }
          fires.forEach(f => rr(ctx, f.x * CS + 2, f.y * CS + 2, CS - 4, CS - 4, 6, '#f97316')); bombs.forEach(b => circ(ctx, b.x * CS + CS / 2, b.y * CS + CS / 2, 11 + Math.sin(b.t * 20) * 2, '#111'));
          ctx.font = '22px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; enemies.forEach(e => ctx.fillText('👾', e.x * CS + CS / 2, e.y * CS + CS / 2)); if (alive) ctx.fillText('🧑‍🚒', px * CS + CS / 2, py * CS + CS / 2);
        } });
      function go(d) { if (!alive) return; const [dx, dy] = { l: [-1, 0], r: [1, 0], u: [0, -1], d: [0, 1] }[d]; if (!grid[py + dy][px + dx] && !bombs.some(b => b.x === px + dx && b.y === py + dy)) { px += dx; py += dy; api.vibrate(4); } }
      api.swipe(a.cv.canvas, d => { if (d === 'tap') bomb(); else go(d); }); this.unmount = a.stop; reset();
    } });

  /* ---------- Танчики ---------- */
  Games.register({ id: 'tanks', title: 'Танчики', icon: '🪖', cat: 'arcade', desc: 'Танк едет к пальцу и стреляет во врагов', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 520; let t, enemies, shells, eshells, score, hp, alive, target, shotT, walls, spawnT;
      function reset() { t = { x: W / 2, y: H - 60, a: -Math.PI / 2 }; enemies = []; shells = []; eshells = []; score = 0; hp = 3; alive = true; target = null; shotT = 0; spawnT = 0; walls = Array.from({ length: 6 }, () => ({ x: api.rand(20, W - 80), y: api.rand(80, H - 160), w: api.rand(40, 80), h: 24 })); a.hdr.set(0, 0); a.hdr.set(1, 3); }
      const hitWall = (x, y) => walls.some(w => x > w.x - 8 && x < w.x + w.w + 8 && y > w.y - 8 && y < w.y + w.h + 8);
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Счёт', value: 0 }, { label: '❤', value: 3 }, { label: 'Рекорд', value: api.bestOf('tanks') || 0 }], hint: 'Тап — цель движения. Танк стреляет в ближайшего врага', onDown: p => target = p,
        frame(dt, ctx) {
          if (alive) {
            if (target) { const dx = target.x - t.x, dy = target.y - t.y; const d = Math.hypot(dx, dy); if (d > 4) { const nx = t.x + dx / d * 120 * dt, ny = t.y + dy / d * 120 * dt; if (!hitWall(nx, ny)) { t.x = nx; t.y = ny; } t.a = Math.atan2(dy, dx); } }
            spawnT -= dt; if (spawnT <= 0 && enemies.length < 4) { spawnT = 2.5; enemies.push({ x: api.rand(30, W - 30), y: 30, a: Math.PI / 2, st: 0 }); }
            enemies.forEach(e => { e.st -= dt; const dx = t.x - e.x, dy = t.y - e.y; const d = Math.hypot(dx, dy); e.a = Math.atan2(dy, dx); if (d > 150) { const nx = e.x + dx / d * 50 * dt, ny = e.y + dy / d * 50 * dt; if (!hitWall(nx, ny)) { e.x = nx; e.y = ny; } } if (e.st <= 0) { e.st = 1.8; eshells.push({ x: e.x, y: e.y, vx: Math.cos(e.a) * 220, vy: Math.sin(e.a) * 220 }); } });
            shotT -= dt; if (shotT <= 0 && enemies.length) { shotT = 0.9; const e = enemies.reduce((b, x) => Math.hypot(x.x - t.x, x.y - t.y) < Math.hypot(b.x - t.x, b.y - t.y) ? x : b); const an = Math.atan2(e.y - t.y, e.x - t.x); shells.push({ x: t.x, y: t.y, vx: Math.cos(an) * 320, vy: Math.sin(an) * 320 }); api.sound('tap'); }
            [...shells, ...eshells].forEach(s => { s.x += s.vx * dt; s.y += s.vy * dt; if (hitWall(s.x, s.y) || s.x < 0 || s.x > W || s.y < 0 || s.y > H) s.dead = true; });
            shells.forEach(s => enemies.forEach(e => { if (!s.dead && Math.hypot(s.x - e.x, s.y - e.y) < 18) { s.dead = true; e.dead = true; score += 10; api.sound('boom'); if (score % 50 === 0) api.addCoins(3); } }));
            eshells.forEach(s => { if (!s.dead && Math.hypot(s.x - t.x, s.y - t.y) < 18) { s.dead = true; hp--; a.hdr.set(1, hp); api.sound('bad'); api.vibrate(50); } });
            shells = shells.filter(s => !s.dead); eshells = eshells.filter(s => !s.dead); enemies = enemies.filter(e => !e.dead); a.hdr.set(0, score);
            if (hp <= 0) { alive = false; over(api, 'tanks', score, 'Танк подбит', 20, reset); }
          }
          ctx.fillStyle = '#3f6212'; ctx.fillRect(0, 0, W, H); walls.forEach(w => rr(ctx, w.x, w.y, w.w, w.h, 4, '#78350f'));
          const tank = (o, c) => { ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.a); rr(ctx, -16, -12, 32, 24, 5, c); rr(ctx, 0, -3, 24, 6, 2, '#111'); ctx.restore(); };
          enemies.forEach(e => tank(e, '#f87171')); if (alive) tank(t, '#22d3ee'); shells.forEach(s => circ(ctx, s.x, s.y, 4, '#fff')); eshells.forEach(s => circ(ctx, s.x, s.y, 4, '#fbbf24'));
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Ракетная защита ---------- */
  Games.register({ id: 'missile', title: 'Ракетная защита', icon: '🚀', cat: 'arcade', desc: 'Тапай в небе — взрыв сбивает падающие ракеты', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 520; let rockets, blasts, cities, score, alive, spawnT, speed;
      function reset() { rockets = []; blasts = []; cities = [60, 130, 230, 300].map(x => ({ x, ok: true })); score = 0; alive = true; spawnT = 0; speed = 40; a.hdr.set(0, 0); a.hdr.set(1, 4); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Счёт', value: 0 }, { label: 'Города', value: 4 }, { label: 'Рекорд', value: api.bestOf('missile') || 0 }], hint: 'Тап — взрыв в этой точке', onDown: p => { if (!alive) return; blasts.push({ x: p.x, y: p.y, r: 0 }); api.sound('tap'); },
        frame(dt, ctx) {
          if (alive) {
            spawnT -= dt; if (spawnT <= 0) { spawnT = Math.max(0.5, 1.6 - score / 300); const c = cities.filter(c => c.ok); if (c.length) { const tgt = c[api.rand(0, c.length - 1)]; const x0 = Math.random() * W; rockets.push({ x: x0, y: 0, tx: tgt.x, ty: H - 30, p: 0, x0 }); } }
            speed += dt; rockets.forEach(r => { r.p += dt * speed / Math.hypot(r.tx - r.x0, r.ty); r.x = r.x0 + (r.tx - r.x0) * r.p; r.y = r.ty * r.p; if (r.p >= 1) { r.dead = true; const c = cities.find(c => c.x === r.tx); if (c) { c.ok = false; api.sound('boom'); api.vibrate(60); a.hdr.set(1, cities.filter(c => c.ok).length); } } });
            blasts.forEach(b => { b.r += 120 * dt; if (b.r > 40) b.dead = true; rockets.forEach(r => { if (!r.dead && Math.hypot(r.x - b.x, r.y - b.y) < b.r) { r.dead = true; score += 10; api.sound('select'); if (score % 100 === 0) api.addCoins(3); } }); });
            rockets = rockets.filter(r => !r.dead); blasts = blasts.filter(b => !b.dead); a.hdr.set(0, score);
            if (!cities.some(c => c.ok)) { alive = false; over(api, 'missile', score, 'Города разрушены', 20, reset); }
          }
          const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b0b1a'); g.addColorStop(1, '#1e1b4b'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#374151'; ctx.fillRect(0, H - 30, W, 30);
          cities.forEach(c => { ctx.font = '26px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(c.ok ? '🏙️' : '🔥', c.x, H - 40); });
          rockets.forEach(r => { ctx.strokeStyle = '#f87171'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(r.x0, 0); ctx.lineTo(r.x, r.y); ctx.stroke(); circ(ctx, r.x, r.y, 4, '#fff'); });
          blasts.forEach(b => { ctx.globalAlpha = 1 - b.r / 40; circ(ctx, b.x, b.y, b.r, '#fbbf24'); ctx.globalAlpha = 1; });
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Трон ---------- */
  Games.register({ id: 'tron', title: 'Световые мотоциклы', icon: '🏍', cat: 'arcade', desc: 'Оставляй след, не врезайся. Загони компьютер в стену', bestLabel: 'Побед',
    mount(screen, api) {
      const COLS = 36, ROWS = 52, CS = 10, W = COLS * CS, H = ROWS * CS; let grid, me, ai, alive, acc, wins = api.load('tron_w', 0), started;
      function reset() { grid = Array(COLS * ROWS).fill(0); me = { x: 8, y: ROWS - 10, dx: 0, dy: -1 }; ai = { x: COLS - 9, y: 9, dx: 0, dy: 1 }; alive = true; acc = 0; started = false; }
      const free = (x, y) => x >= 0 && y >= 0 && x < COLS && y < ROWS && !grid[y * COLS + x];
      function aiThink() { const opts = [[ai.dx, ai.dy], [ai.dy, -ai.dx], [-ai.dy, ai.dx]].filter(([dx, dy]) => free(ai.x + dx, ai.y + dy)); if (!opts.length) return; const space = ([dx, dy]) => { let n = 0; let x = ai.x + dx, y = ai.y + dy; while (free(x, y) && n < 15) { n++; x += dx; y += dy; } return n; }; opts.sort((p, q) => space(q) - space(p) + (Math.random() - .5)); const [dx, dy] = opts[0]; ai.dx = dx; ai.dy = dy; }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Побед', value: wins }, { label: '', value: 'Вы — голубые' }], hint: 'Свайп — поворот',
        onKey: e => { const m = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]; if (m && !(m[0] === -me.dx && m[1] === -me.dy)) { me.dx = m[0]; me.dy = m[1]; started = true; } },
        frame(dt, ctx) {
          if (alive && started) { acc += dt; if (acc > 0.05) { acc = 0; aiThink(); grid[me.y * COLS + me.x] = 1; grid[ai.y * COLS + ai.x] = 2; me.x += me.dx; me.y += me.dy; ai.x += ai.dx; ai.y += ai.dy; const mOk = free(me.x, me.y), aOk = free(ai.x, ai.y) && !(ai.x === me.x && ai.y === me.y); if (!mOk || !aOk) { alive = false; if (mOk && !aOk) { wins++; api.store('tron_w', wins); api.best('tron', wins); api.end({ title: 'Победа!', reward: 20, onAgain: reset }); } else api.end({ win: false, title: mOk ? 'Ничья' : 'Врезались!', onAgain: reset }); } } }
          ctx.fillStyle = '#0b0b1a'; ctx.fillRect(0, 0, W, H); for (let i = 0; i < grid.length; i++) if (grid[i]) rr(ctx, (i % COLS) * CS, Math.floor(i / COLS) * CS, CS, CS, 2, grid[i] === 1 ? '#22d3ee' : '#f87171');
          rr(ctx, me.x * CS, me.y * CS, CS, CS, 3, '#fff'); rr(ctx, ai.x * CS, ai.y * CS, CS, CS, 3, '#fff');
          if (!started) text(ctx, 'Свайп — старт', W / 2, H / 2, 22);
        } });
      api.swipe(a.cv.canvas, d => { const m = { l: [-1, 0], r: [1, 0], u: [0, -1], d: [0, 1] }[d]; if (m && !(m[0] === -me.dx && m[1] === -me.dy)) { me.dx = m[0]; me.dy = m[1]; started = true; } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Джетпак ---------- */
  Games.register({ id: 'jetpack', title: 'Джетпак', icon: '🧑‍🚀', cat: 'arcade', desc: 'Держи — летишь вверх. Уворачивайся от лазеров, собирай монеты', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 480; let y, vy, hold, objs, dist, coins, alive, spawnT, started;
      function reset() { y = H - 60; vy = 0; hold = false; objs = []; dist = 0; coins = 0; alive = true; spawnT = 0; started = false; a.hdr.set(0, 0); a.hdr.set(1, 0); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Метры', value: 0 }, { label: '●', value: 0 }, { label: 'Рекорд', value: api.bestOf('jetpack') || 0 }], hint: 'Удерживай — подъём', onDown: () => { hold = true; started = true; }, onUp: () => hold = false, onKey: e => { if (e.key === ' ') { hold = true; started = true; } },
        frame(dt, ctx) {
          if (alive && started) {
            vy += (hold ? -1300 : 900) * dt; vy = Math.max(-320, Math.min(320, vy)); y += vy * dt; if (y < 20) { y = 20; vy = 0; } if (y > H - 40) { y = H - 40; vy = 0; }
            const sp = 220 + dist / 40; dist += sp * dt / 10; a.hdr.set(0, Math.floor(dist));
            spawnT -= dt; if (spawnT <= 0) { spawnT = 0.9; if (Math.random() < 0.5) { const yy = api.rand(40, H - 60); for (let i = 0; i < 5; i++) objs.push({ t: 'c', x: W + 20 + i * 26, y: yy }); } else { const vert = Math.random() < 0.5; objs.push({ t: 'l', x: W + 30, y: api.rand(30, H - 100), w: vert ? 8 : api.rand(60, 120), h: vert ? api.rand(60, 120) : 8 }); } }
            objs.forEach(o => o.x -= sp * dt); objs = objs.filter(o => o.x > -150);
            for (const o of objs) { if (o.t === 'c' && !o.hit && Math.abs(o.x - 70) < 18 && Math.abs(o.y - y) < 20) { o.hit = true; coins++; a.hdr.set(1, coins); api.sound('coin'); } if (o.t === 'l' && 70 + 12 > o.x && 70 - 12 < o.x + o.w && y + 16 > o.y && y - 16 < o.y + o.h) { alive = false; api.sound('boom'); api.vibrate([60, 40, 120]); const s = Math.floor(dist); api.best('jetpack', s); api.addCoins(Math.floor(coins / 2)); api.end({ win: false, title: 'Лазер!', reward: 0, text: `${s} м, монет ${coins} (+${Math.floor(coins / 2)})`, onAgain: reset }); } }
            objs = objs.filter(o => !o.hit);
          }
          ctx.fillStyle = '#1e1b4b'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#312e81'; for (let i = 0; i < 6; i++) ctx.fillRect(((i * 90 - dist * 3) % (W + 90) + W + 90) % (W + 90) - 90, 0, 40, H); ctx.fillStyle = '#0f0f1a'; ctx.fillRect(0, H - 20, W, 20);
          objs.forEach(o => { if (o.t === 'c') circ(ctx, o.x, o.y, 9, '#fbbf24'); else { rr(ctx, o.x, o.y, o.w, o.h, 4, '#f87171'); ctx.shadowColor = '#f87171'; } });
          ctx.font = '30px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🧑‍🚀', 70, y); if (hold && alive) { ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.moveTo(56, y + 12); ctx.lineTo(66, y + 12); ctx.lineTo(61, y + 26 + Math.random() * 8); ctx.fill(); }
          if (!started) text(ctx, 'Удерживай для старта', W / 2, H / 2, 20);
        } });
      window.addEventListener('keyup', a._ku = () => hold = false); this.unmount = () => { a.stop(); window.removeEventListener('keyup', a._ku); }; reset();
    } });

  /* ---------- Фруктовый ниндзя ---------- */
  Games.register({ id: 'ninja', title: 'Фруктовый ниндзя', icon: '🍉', cat: 'arcade', desc: 'Режь фрукты свайпами, не трогай бомбы', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 560; const FR = ['🍉', '🍎', '🍌', '🍊', '🍓', '🥝']; let items, score, lives, alive, spawnT, trail, halves;
      function reset() { items = []; score = 0; lives = 3; alive = true; spawnT = 0; trail = []; halves = []; a.hdr.set(0, 0); a.hdr.set(1, 3); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Счёт', value: 0 }, { label: '❤', value: 3 }, { label: 'Рекорд', value: api.bestOf('ninja') || 0 }], hint: 'Проводи пальцем по фруктам',
        onMove: (p, e) => { if (!(e.buttons || e.pointerType === 'touch') || !alive) return; trail.push({ x: p.x, y: p.y, t: 0.25 }); for (const it of items) if (!it.dead && Math.hypot(it.x - p.x, it.y - p.y) < 30) { it.dead = true; if (it.bomb) { lives = 0; api.sound('boom'); api.vibrate(100); } else { score++; api.sound('tap'); api.vibrate(5); halves.push({ x: it.x, y: it.y, vx: -80, vy: it.vy, e: it.e, t: 1 }, { x: it.x, y: it.y, vx: 80, vy: it.vy, e: it.e, t: 1 }); if (score % 20 === 0) api.addCoins(5); } } },
        frame(dt, ctx) {
          if (alive) {
            spawnT -= dt; if (spawnT <= 0) { spawnT = Math.max(0.35, 1 - score / 100); items.push({ x: api.rand(40, W - 40), y: H + 20, vx: api.rand(-80, 80), vy: -api.rand(520, 640), e: FR[api.rand(0, FR.length - 1)], bomb: Math.random() < 0.15 }); }
            items.forEach(it => { it.vy += 700 * dt; it.x += it.vx * dt; it.y += it.vy * dt; if (it.y > H + 40 && it.vy > 0) { it.dead = true; if (!it.bomb) { lives--; a.hdr.set(1, lives); api.sound('bad'); } } });
            items = items.filter(it => !it.dead); halves.forEach(hf => { hf.vy += 700 * dt; hf.x += hf.vx * dt; hf.y += hf.vy * dt; hf.t -= dt; }); halves = halves.filter(hf => hf.t > 0); trail.forEach(t => t.t -= dt); trail = trail.filter(t => t.t > 0); a.hdr.set(0, score);
            if (lives <= 0) { alive = false; over(api, 'ninja', score, 'Игра окончена', 5, reset); }
          }
          ctx.fillStyle = '#3b2f1e'; ctx.fillRect(0, 0, W, H); ctx.font = '40px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          items.forEach(it => ctx.fillText(it.bomb ? '💣' : it.e, it.x, it.y)); ctx.globalAlpha = .7; ctx.font = '28px sans-serif'; halves.forEach(hf => ctx.fillText(hf.e, hf.x, hf.y)); ctx.globalAlpha = 1;
          if (trail.length > 1) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); trail.forEach((t, i) => i ? ctx.lineTo(t.x, t.y) : ctx.moveTo(t.x, t.y)); ctx.stroke(); }
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Шарики ---------- */
  Games.register({ id: 'balloons', title: 'Шарики', icon: '🎈', cat: 'arcade', desc: 'Лопай шарики, пока не улетели. Чёрные — не трогать', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 560; let b, score, missed, alive, spawnT;
      function reset() { b = []; score = 0; missed = 0; alive = true; spawnT = 0; a.hdr.set(0, 0); a.hdr.set(1, 0); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Лопнуто', value: 0 }, { label: 'Улетело', value: '0/10' }, { label: 'Рекорд', value: api.bestOf('balloons') || 0 }], hint: 'Тап по шарику',
        onDown: p => { if (!alive) return; for (const x of b) if (!x.dead && Math.hypot(x.x - p.x, x.y - p.y) < x.r + 6) { x.dead = true; if (x.bad) { missed += 3; api.sound('boom'); api.vibrate(60); } else { score++; api.sound('tap'); api.vibrate(5); if (score % 25 === 0) api.addCoins(5); } a.hdr.set(0, score); a.hdr.set(1, missed + '/10'); return; } },
        frame(dt, ctx) {
          if (alive) { spawnT -= dt; if (spawnT <= 0) { spawnT = Math.max(0.3, 0.9 - score / 80); b.push({ x: api.rand(30, W - 30), y: H + 30, r: api.rand(18, 30), v: api.rand(60, 110) + score, c: `hsl(${api.rand(0, 360)},80%,60%)`, bad: Math.random() < 0.12, w: Math.random() * 6 }); } b.forEach(x => { x.y -= x.v * dt; x.x += Math.sin(x.y / 40 + x.w) * 30 * dt; if (x.y < -40) { x.dead = true; if (!x.bad) { missed++; a.hdr.set(1, missed + '/10'); } } }); b = b.filter(x => !x.dead); if (missed >= 10) { alive = false; over(api, 'balloons', score, 'Слишком много улетело', 5, reset); } }
          const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#38bdf8'); g.addColorStop(1, '#bae6fd'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
          b.forEach(x => { ctx.strokeStyle = '#555'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x.x, x.y + x.r); ctx.lineTo(x.x, x.y + x.r + 25); ctx.stroke(); ctx.fillStyle = x.bad ? '#111' : x.c; ctx.beginPath(); ctx.ellipse(x.x, x.y, x.r, x.r * 1.15, 0, 0, 7); ctx.fill(); circ(ctx, x.x - x.r / 3, x.y - x.r / 3, x.r / 5, 'rgba(255,255,255,.5)'); });
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Пузырьковый стрелок ---------- */
  Games.register({ id: 'bubbles', title: 'Пузырьковый стрелок', icon: '🔮', cat: 'arcade', desc: 'Стреляй пузырём в группу того же цвета (3+)', bestLabel: 'Рекорд',
    mount(screen, api) {
      const COLS = 10, R = 18, W = COLS * R * 2, H = 560; const COL = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#c084fc']; let grid, ball, cur, next, score, alive, shots;
      const pos = (r, c) => ({ x: c * R * 2 + R + (r % 2 ? R : 0), y: r * R * 1.75 + R });
      function reset() { grid = []; for (let r = 0; r < 6; r++) { grid.push([]); for (let c = 0; c < COLS - (r % 2); c++) grid[r].push(api.rand(0, 3)); } for (let r = 6; r < 16; r++) { grid.push([]); for (let c = 0; c < COLS - (r % 2); c++) grid[r].push(-1); } ball = null; cur = api.rand(0, 3); next = api.rand(0, 3); score = 0; alive = true; shots = 0; a.hdr.set(0, 0); }
      const nb = (r, c) => { const odd = r % 2; return [[r, c - 1], [r, c + 1], [r - 1, c - 1 + odd], [r - 1, c + odd], [r + 1, c - 1 + odd], [r + 1, c + odd]].filter(([rr, cc]) => rr >= 0 && rr < grid.length && cc >= 0 && cc < grid[rr].length); };
      function settle(x, y) { let best = null, bd = Infinity; for (let r = 0; r < grid.length; r++) for (let c = 0; c < grid[r].length; c++) { if (grid[r][c] >= 0) continue; const p = pos(r, c); const d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = [r, c]; } } if (!best) return; const [r, c] = best; grid[r][c] = cur; const same = []; const seen = new Set(); const st = [[r, c]]; while (st.length) { const [rr, cc] = st.pop(); const k = rr + ',' + cc; if (seen.has(k) || grid[rr][cc] !== cur) continue; seen.add(k); same.push([rr, cc]); nb(rr, cc).forEach(n => st.push(n)); } if (same.length >= 3) { same.forEach(([rr, cc]) => grid[rr][cc] = -1); score += same.length * 10; api.sound('good'); api.vibrate(10); if (same.length >= 5) api.addCoins(2); dropFloating(); } else api.sound('tap'); a.hdr.set(0, score); cur = next; next = api.rand(0, 4); shots++; if (shots % 8 === 0) { grid.unshift(Array.from({ length: COLS }, () => api.rand(0, 4))); grid.pop(); } if (grid[grid.length - 3].some(v => v >= 0)) { alive = false; over(api, 'bubbles', score, 'Пузыри дошли до низа', 30, reset); } if (grid.every(row => row.every(v => v < 0))) { api.addCoins(20); api.toast('Поле очищено! +20'); for (let r = 0; r < 4; r++) grid[r] = grid[r].map(() => api.rand(0, 4)); } }
      function dropFloating() { const keep = new Set(); const st = []; for (let c = 0; c < grid[0].length; c++) if (grid[0][c] >= 0) st.push([0, c]); while (st.length) { const [r, c] = st.pop(); const k = r + ',' + c; if (keep.has(k) || grid[r][c] < 0) continue; keep.add(k); nb(r, c).forEach(n => st.push(n)); } for (let r = 0; r < grid.length; r++) for (let c = 0; c < grid[r].length; c++) if (grid[r][c] >= 0 && !keep.has(r + ',' + c)) { grid[r][c] = -1; score += 20; } }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Счёт', value: 0 }, { label: 'Рекорд', value: api.bestOf('bubbles') || 0 }], hint: 'Тап — выстрел в сторону пальца',
        onDown: p => { if (ball || !alive) return; const an = Math.atan2(p.y - (H - 30), p.x - W / 2); if (an > -0.15) return; ball = { x: W / 2, y: H - 30, vx: Math.cos(an) * 520, vy: Math.sin(an) * 520 }; },
        frame(dt, ctx) {
          if (ball && alive) { ball.x += ball.vx * dt; ball.y += ball.vy * dt; if (ball.x < R) { ball.x = R; ball.vx *= -1; } if (ball.x > W - R) { ball.x = W - R; ball.vx *= -1; } let hit = ball.y < R; if (!hit) for (let r = 0; r < grid.length && !hit; r++) for (let c = 0; c < grid[r].length; c++) { if (grid[r][c] < 0) continue; const p = pos(r, c); if (Math.hypot(p.x - ball.x, p.y - ball.y) < R * 2 - 2) { hit = true; break; } } if (hit) { settle(ball.x, ball.y); ball = null; } }
          ctx.fillStyle = '#171728'; ctx.fillRect(0, 0, W, H); for (let r = 0; r < grid.length; r++) for (let c = 0; c < grid[r].length; c++) if (grid[r][c] >= 0) { const p = pos(r, c); circ(ctx, p.x, p.y, R - 1, COL[grid[r][c]]); circ(ctx, p.x - 5, p.y - 5, 4, 'rgba(255,255,255,.4)'); }
          ctx.strokeStyle = '#f87171'; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(0, pos(grid.length - 3, 0).y + R); ctx.lineTo(W, pos(grid.length - 3, 0).y + R); ctx.stroke(); ctx.setLineDash([]);
          if (ball) circ(ctx, ball.x, ball.y, R - 1, COL[cur]); else circ(ctx, W / 2, H - 30, R - 1, COL[cur]); circ(ctx, W / 2 + 50, H - 30, R - 6, COL[next]);
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Рыбалка ---------- */
  Games.register({ id: 'fishing', title: 'Рыбалка', icon: '🎣', cat: 'arcade', desc: 'Держи рыбу в зелёной зоне, пока шкала не заполнится', bestLabel: 'Поймано',
    mount(screen, api) {
      const W = 360, H = 480; let fishY, fishV, barY, hold, prog, caught, state, timer, size;
      function reset() { fishY = 200; fishV = 0; barY = 200; hold = false; prog = 0.3; state = 'wait'; timer = 1 + Math.random() * 3; caught = caught || 0; size = 1; }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Поймано', value: api.load('fish_n', 0) }, { label: 'Рекорд', value: api.bestOf('fishing') || 0 }], hint: 'Ждите поклёвки, затем удерживайте, чтобы поднимать зелёную зону', onDown: () => { if (state === 'bite') { state = 'reel'; api.sound('good'); } hold = true; }, onUp: () => hold = false, onKey: e => { if (e.key === ' ') { if (state === 'bite') state = 'reel'; hold = true; } },
        frame(dt, ctx) {
          if (state === 'wait') { timer -= dt; if (timer <= 0) { state = 'bite'; timer = 1.2; api.sound('coin'); api.vibrate([30, 30, 30]); size = api.rand(1, 5); } }
          else if (state === 'bite') { timer -= dt; if (timer <= 0) { state = 'wait'; timer = 2 + Math.random() * 3; api.toast('Сорвалась'); } }
          else if (state === 'reel') { fishV += (Math.random() - .5) * 900 * dt * size * 0.5; fishV *= 0.97; fishY += fishV * dt; if (fishY < 40) { fishY = 40; fishV = Math.abs(fishV); } if (fishY > 360) { fishY = 360; fishV = -Math.abs(fishV); } barY += (hold ? -260 : 260) * dt; barY = Math.max(40, Math.min(360, barY)); const inZone = Math.abs(fishY - barY) < 45; prog += (inZone ? 0.25 : -0.2) * dt; if (prog >= 1) { const n = api.load('fish_n', 0) + 1; api.store('fish_n', n); api.best('fishing', n); a.hdr.set(0, n); api.addCoins(size * 3); api.end({ title: '🐟 Поймана рыба размера ' + size + '!', reward: size * 3, again: 'Ещё', onAgain: reset }); state = 'done'; } if (prog <= 0) { api.sound('bad'); api.end({ win: false, title: 'Рыба ушла', onAgain: reset }); state = 'done'; } }
          const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0ea5e9'); g.addColorStop(1, '#0c4a6e'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
          if (state === 'reel' || state === 'done') { rr(ctx, W / 2 - 30, 30, 60, 350, 10, 'rgba(0,0,0,.35)'); rr(ctx, W / 2 - 28, barY - 45, 56, 90, 8, 'rgba(52,211,153,.7)'); ctx.font = '30px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🐟', W / 2, fishY); rr(ctx, W - 40, 30, 20, 350, 6, 'rgba(0,0,0,.35)'); rr(ctx, W - 40, 380 - 350 * prog, 20, 350 * prog, 6, '#fbbf24'); }
          else { ctx.font = '60px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(state === 'bite' ? '‼️' : '🎣', W / 2, H / 2 - 40); text(ctx, state === 'bite' ? 'КЛЮЁТ! Тап!' : 'Ждём поклёвку…', W / 2, H / 2 + 40, 24); }
        } });
      window.addEventListener('keyup', a._ku = () => hold = false); this.unmount = () => { a.stop(); window.removeEventListener('keyup', a._ku); }; reset();
    } });

  /* ---------- Лучник ---------- */
  Games.register({ id: 'archery', title: 'Лучник', icon: '🏹', cat: 'arcade', desc: 'Мишень движется, ветер сносит стрелу. 10 выстрелов', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 520; let ty, tv, wind, arrows, shots, score, flying;
      function reset() { ty = 150; tv = 80; wind = api.rand(-40, 40); arrows = []; shots = 10; score = 0; flying = null; a.hdr.set(0, 0); a.hdr.set(1, 10); a.hdr.set(2, (wind > 0 ? '→' : '←') + Math.abs(wind)); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Очки', value: 0 }, { label: 'Стрел', value: 10 }, { label: 'Ветер', value: 0 }], hint: 'Тап — выстрел вверх из лука. Учитывай ветер и движение мишени',
        onDown: () => { if (flying || shots <= 0) return; flying = { x: W / 2, y: H - 60, vx: 0, vy: -520 }; shots--; a.hdr.set(1, shots); api.sound('tap'); },
        frame(dt, ctx) {
          ty += tv * dt; if (ty < 80 || ty > 250) tv *= -1;
          if (flying) { flying.vx += wind * 2 * dt; flying.x += flying.vx * dt; flying.y += flying.vy * dt; if (flying.y < 80) { const d = Math.hypot(flying.x - W / 2, flying.y - ty); const pts = d < 10 ? 10 : d < 25 ? 7 : d < 45 ? 4 : d < 65 ? 1 : 0; score += pts; a.hdr.set(0, score); api.sound(pts >= 7 ? 'good' : pts ? 'select' : 'bad'); arrows.push({ x: flying.x, dy: flying.y - ty }); flying = null; wind = api.rand(-50, 50); a.hdr.set(2, (wind > 0 ? '→' : '←') + Math.abs(wind)); if (!shots) { api.best('archery', score); api.end({ title: 'Итог: ' + score + '/100', reward: Math.floor(score / 4), onAgain: reset }); } } }
          ctx.fillStyle = '#86efac'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#bae6fd'; ctx.fillRect(0, 0, W, 60);
          [65, 45, 25, 10].forEach((r, i) => circ(ctx, W / 2, ty, r, ['#fff', '#111', '#3b82f6', '#ef4444'][i]));
          arrows.forEach(ar => { ctx.font = '18px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('📍', ar.x, ty + ar.dy); });
          if (flying) rr(ctx, flying.x - 2, flying.y - 20, 4, 40, 2, '#78350f');
          ctx.font = '40px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🏹', W / 2, H - 50);
          text(ctx, 'Ветер ' + (wind > 0 ? '→' : '←') + ' ' + Math.abs(wind), W / 2, 30, 16, '#333');
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Баскетбол ---------- */
  Games.register({ id: 'basketball', title: 'Баскетбол', icon: '🏀', cat: 'arcade', desc: 'Свайп вверх — бросок. Попади в кольцо', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 560; let ball, hoop, score, shots, scored;
      function reset() { ball = { x: W / 2, y: H - 70, vx: 0, vy: 0, fly: false, r: 18 }; hoop = { x: api.rand(80, W - 80), y: 150 }; score = 0; shots = 10; scored = false; a.hdr.set(0, 0); a.hdr.set(1, 10); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Попаданий', value: 0 }, { label: 'Бросков', value: 10 }, { label: 'Рекорд', value: api.bestOf('basketball') || 0 }], hint: 'Свайп от мяча — сила и направление',
        frame(dt, ctx) {
          if (ball.fly) { ball.vy += 1100 * dt; ball.x += ball.vx * dt; ball.y += ball.vy * dt; if (ball.x < ball.r) { ball.x = ball.r; ball.vx *= -.7; } if (ball.x > W - ball.r) { ball.x = W - ball.r; ball.vx *= -.7; } if (ball.vy > 0 && Math.abs(ball.y - hoop.y) < 8 && Math.abs(ball.x - hoop.x) < 26 && !scored) { scored = true; score++; a.hdr.set(0, score); api.sound('good'); api.vibrate([10, 20, 10]); if (score % 3 === 0) api.addCoins(3); } if (Math.abs(ball.x - (hoop.x - 34)) < ball.r && Math.abs(ball.y - hoop.y) < ball.r) ball.vx = -Math.abs(ball.vx) * .6; if (Math.abs(ball.x - (hoop.x + 34)) < ball.r && Math.abs(ball.y - hoop.y) < ball.r) ball.vx = Math.abs(ball.vx) * .6; if (ball.y > H + 40) { ball = { x: W / 2, y: H - 70, vx: 0, vy: 0, fly: false, r: 18 }; scored = false; hoop.x = api.rand(80, W - 80); if (!shots) { api.best('basketball', score); api.end({ title: 'Итог: ' + score + '/10', reward: score * 2, onAgain: reset }); } } }
          ctx.fillStyle = '#1e1b4b'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#374151'; ctx.fillRect(0, H - 30, W, 30);
          rr(ctx, hoop.x - 50, hoop.y - 70, 100, 70, 6, '#e5e7eb'); rr(ctx, hoop.x - 22, hoop.y - 40, 44, 34, 3, '#9ca3af'); ctx.strokeStyle = '#f97316'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(hoop.x - 34, hoop.y); ctx.lineTo(hoop.x + 34, hoop.y); ctx.stroke(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(hoop.x + i * 10, hoop.y); ctx.lineTo(hoop.x + i * 7, hoop.y + 30); ctx.stroke(); }
          ctx.font = '36px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🏀', ball.x, ball.y);
        } });
      let sx, sy; a.cv.canvas.addEventListener('pointerdown', e => { const p = a.pos(e); sx = p.x; sy = p.y; }); a.cv.canvas.addEventListener('pointerup', e => { if (ball.fly || !shots) return; const p = a.pos(e); const dx = p.x - sx, dy = p.y - sy; if (dy > -30) return; ball.fly = true; ball.vx = dx * 2.2; ball.vy = Math.max(-1000, dy * 3); shots--; a.hdr.set(1, shots); api.sound('jump'); });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Пенальти ---------- */
  Games.register({ id: 'penalty', title: 'Пенальти', icon: '⚽', cat: 'arcade', desc: 'Выбери угол — вратарь угадывает. 5 ударов', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; let goals, shots, anim;
      function start() { goals = 0; shots = 5; render(); }
      function render(res) { screen.innerHTML = ''; api.header(screen, [{ label: 'Голы', value: goals }, { label: 'Ударов', value: shots }, { label: 'Рекорд', value: api.bestOf('penalty') || 0 }]); const goal = h('div', { class: 'goal' }); const zones = [['↖', 0], ['↑', 1], ['↗', 2], ['↙', 3], ['↓', 4], ['↘', 5]]; zones.forEach(([s, i]) => goal.append(h('div', { class: 'gz', onclick: () => kick(i) }, res && res.keeper === i ? '🧤' : res && res.shot === i ? '⚽' : s))); screen.append(h('div', { class: 'game-area', style: 'gap:16px' }, goal, h('div', { class: 'hint-text' }, res ? (res.goal ? 'ГОЛ!' : 'Вратарь взял!') : 'Тап по зоне ворот — удар'))); }
      function kick(i) { if (!shots) return; shots--; const keeper = Math.random() < 0.5 ? i : api.rand(0, 5); const goal = keeper !== i || Math.random() < 0.25; if (goal) { goals++; api.sound('good'); api.vibrate([10, 20, 10]); } else { api.sound('bad'); api.vibrate(40); } render({ shot: i, keeper, goal }); if (!shots) setTimeout(() => { api.best('penalty', goals); api.end({ title: 'Голов: ' + goals + '/5', reward: goals * 3, onAgain: start }); }, 800); }
      start();
    } });

  /* ---------- Боулинг ---------- */
  Games.register({ id: 'bowling', title: 'Боулинг', icon: '🎳', cat: 'arcade', desc: 'Свайп — бросок шара. 5 фреймов по 2 броска', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 560; let pins, ball, frame, roll, score, total;
      function setPins() { pins = []; for (let r = 0; r < 4; r++) for (let c = 0; c <= r; c++) pins.push({ x: W / 2 + (c - r / 2) * 30, y: 120 - r * 26, up: true }); }
      function reset() { setPins(); ball = null; frame = 1; roll = 1; total = 0; a.hdr.set(0, 0); a.hdr.set(1, '1/5'); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Очки', value: 0 }, { label: 'Фрейм', value: '1/5' }, { label: 'Рекорд', value: api.bestOf('bowling') || 0 }], hint: 'Свайп снизу вверх — направление и сила',
        frame(dt, ctx) {
          if (ball) { ball.x += ball.vx * dt; ball.y += ball.vy * dt; ball.vx *= 0.995; pins.forEach(p => { if (p.up && Math.hypot(p.x - ball.x, p.y - ball.y) < 24) { p.up = false; api.sound('tap'); ball.vx += (ball.x - p.x) * 3; pins.forEach(q => { if (q.up && q !== p && Math.hypot(q.x - p.x, q.y - p.y) < 40 && Math.random() < 0.5) q.up = false; }); } }); if (ball.y < 40 || ball.x < 0 || ball.x > W) { ball = null; const down = pins.filter(p => !p.up).length; a.hdr.set(0, total + down); if (roll === 1 && down < 10) { roll = 2; } else { total += down; if (down === 10 && roll === 1) { total += 5; api.toast('Страйк! +5'); api.addCoins(5); } frame++; roll = 1; setPins(); a.hdr.set(1, Math.min(frame, 5) + '/5'); if (frame > 5) { api.best('bowling', total); api.end({ title: 'Итог: ' + total, reward: Math.floor(total / 4), onAgain: reset }); } } a.hdr.set(0, total); } }
          ctx.fillStyle = '#78350f'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#a16207'; ctx.fillRect(40, 0, W - 80, H); ctx.fillStyle = '#292524'; ctx.fillRect(0, 0, 40, H); ctx.fillRect(W - 40, 0, 40, H);
          pins.forEach(p => { if (p.up) { ctx.font = '26px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🎳', p.x, p.y); } });
          if (ball) circ(ctx, ball.x, ball.y, 16, '#1e1b4b'); else circ(ctx, W / 2, H - 60, 16, '#1e1b4b');
        } });
      let sx, sy; a.cv.canvas.addEventListener('pointerdown', e => { const p = a.pos(e); sx = p.x; sy = p.y; }); a.cv.canvas.addEventListener('pointerup', e => { if (ball || frame > 5) return; const p = a.pos(e); const dx = p.x - sx, dy = p.y - sy; if (dy > -30) return; ball = { x: W / 2, y: H - 60, vx: dx * 1.5, vy: Math.max(-700, dy * 3) }; api.sound('jump'); });
      this.unmount = a.stop; reset();
    } });
})();
