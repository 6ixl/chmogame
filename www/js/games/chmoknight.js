/* Чмонайт — рогалик в духе Soul Knight: процедурные подземелья, оружие, боссы */
Games.register({
  id: 'chmoknight', title: 'Чмонайт', icon: '🗡', cat: 'arcade', desc: 'Рогалик: случайные подземелья, 12 видов оружия, боссы, прокачка', bestLabel: 'Лучший этаж',
  mount(screen, api) {
    const { h } = api;
    const W = 360, H = 560, T = 32, RW = 11, RH = 9, CL = 3, G = 3; // размер плитки, комнаты, коридора, сетки комнат
    const COLS = G * RW + (G - 1) * CL, ROWS = G * RH + (G - 1) * CL;
    const WEAPONS = [
      { n: 'Пистолет', dmg: 1, rate: 0.35, spd: 420, cost: 0, spread: 0.05, col: '#e5e7eb', tier: 0 },
      { n: 'Дробовик', dmg: 1, rate: 0.8, spd: 380, cost: 3, spread: 0.35, pellets: 5, col: '#fbbf24', tier: 1 },
      { n: 'Автомат', dmg: 1, rate: 0.12, spd: 500, cost: 1, spread: 0.12, col: '#22d3ee', tier: 1 },
      { n: 'Лук', dmg: 3, rate: 0.6, spd: 600, cost: 2, spread: 0.02, pierce: true, col: '#34d399', tier: 1 },
      { n: 'Лазер', dmg: 2, rate: 0.5, spd: 900, cost: 4, spread: 0, pierce: true, col: '#f472b6', tier: 2 },
      { n: 'Ракетница', dmg: 4, rate: 0.9, spd: 300, cost: 6, spread: 0.03, splash: 70, col: '#f97316', tier: 2 },
      { n: 'Двойной пистолет', dmg: 1, rate: 0.18, spd: 450, cost: 1, spread: 0.1, pellets: 2, col: '#e5e7eb', tier: 1 },
      { n: 'Снайперка', dmg: 6, rate: 1.1, spd: 1000, cost: 5, spread: 0, pierce: true, col: '#a3e635', tier: 2 },
      { n: 'Огнемёт', dmg: 0.5, rate: 0.05, spd: 260, cost: 1, spread: 0.3, short: 0.35, col: '#f97316', tier: 2 },
      { n: 'Меч', dmg: 3, rate: 0.4, spd: 0, cost: 0, melee: 60, col: '#c4b5fd', tier: 1 },
      { n: 'Плазма', dmg: 3, rate: 0.3, spd: 350, cost: 3, spread: 0.08, splash: 40, col: '#c084fc', tier: 3 },
      { n: 'Бластер босса', dmg: 2, rate: 0.15, spd: 520, cost: 2, spread: 0.2, pellets: 3, pierce: true, col: '#ef4444', tier: 3 }
    ];
    const ENEMIES = {
      slime: { e: '🟢', hp: 3, spd: 70, r: 14, melee: 1 }, bat: { e: '🦇', hp: 2, spd: 150, r: 12, melee: 1, erratic: true }, shooter: { e: '👁', hp: 4, spd: 50, r: 14, shoot: 1.6, keep: 180 },
      knight: { e: '🛡', hp: 8, spd: 60, r: 16, melee: 2 }, mage: { e: '🧙', hp: 5, spd: 40, r: 14, shoot: 2.2, keep: 220, spread: 3 }, boss: { e: '👹', hp: 60, spd: 45, r: 30, shoot: 1.2, keep: 200, ring: true, melee: 2 }
    };
    let map, rooms, floor, p, enemies, bullets, ebullets, items, cam, alive, coins, run, effects, joy = null, fire = null, paused = false, buffs, kills, best = api.bestOf('chmoknight') || 0;
    let hdr;

    /* ---------- генерация этажа ---------- */
    function genFloor() {
      map = Array.from({ length: ROWS }, () => Array(COLS).fill(1));
      rooms = []; for (let gy = 0; gy < G; gy++) for (let gx = 0; gx < G; gx++) rooms.push({ gx, gy, x: gx * (RW + CL), y: gy * (RH + CL), links: [], type: 'normal', cleared: false, visited: false, doors: [] });
      // остовное дерево (случайный обход)
      const seen = new Set([4]); const st = [4];
      while (seen.size < rooms.length) { const i = st[st.length - 1]; const r = rooms[i]; const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => ({ gx: r.gx + dx, gy: r.gy + dy })).filter(q => q.gx >= 0 && q.gy >= 0 && q.gx < G && q.gy < G).map(q => q.gy * G + q.gx).filter(j => !seen.has(j)); if (!nb.length) { st.pop(); continue; } const j = nb[api.rand(0, nb.length - 1)]; r.links.push(j); rooms[j].links.push(i); seen.add(j); st.push(j); }
      // вырезаем комнаты
      rooms.forEach(r => { for (let y = 1; y < RH - 1; y++) for (let x = 1; x < RW - 1; x++) map[r.y + y][r.x + x] = 0; if (Math.random() < 0.5) { const px = api.rand(3, RW - 5), py = api.rand(3, RH - 4); map[r.y + py][r.x + px] = 1; map[r.y + py][r.x + px + 1] = 1; } });
      // коридоры
      rooms.forEach((r, i) => r.links.forEach(j => { if (j < i) return; const q = rooms[j]; if (q.gx > r.gx) { const y = r.y + Math.floor(RH / 2); for (let x = r.x + RW - 1; x <= q.x; x++) { map[y][x] = 0; map[y - 1][x] = 0; } r.doors.push([r.x + RW - 1, y - 1], [r.x + RW - 1, y]); q.doors.push([q.x, y - 1], [q.x, y]); } else { const x = r.x + Math.floor(RW / 2); for (let y = r.y + RH - 1; y <= q.y; y++) { map[y][x] = 0; map[y][x - 1] = 0; } r.doors.push([x - 1, r.y + RH - 1], [x, r.y + RH - 1]); q.doors.push([x - 1, q.y], [x, q.y]); } }));
      // типы комнат: старт — центр, босс — самая дальняя по дереву, сокровища — 1-2 случайные
      const dist = Array(9).fill(-1); dist[4] = 0; const q = [4]; while (q.length) { const i = q.shift(); rooms[i].links.forEach(j => { if (dist[j] < 0) { dist[j] = dist[i] + 1; q.push(j); } }); }
      const bossIdx = dist.indexOf(Math.max(...dist)); rooms[4].type = 'start'; rooms[4].cleared = true; rooms[bossIdx].type = 'boss';
      const others = api.shuffle(rooms.map((r, i) => i).filter(i => i !== 4 && i !== bossIdx)); rooms[others[0]].type = 'treasure'; if (others[1] != null && Math.random() < 0.5) rooms[others[1]].type = 'treasure';
      items = []; enemies = []; bullets = []; ebullets = []; effects = [];
      rooms.forEach(r => { if (r.type === 'treasure') { items.push({ t: 'chest', x: (r.x + RW / 2) * T, y: (r.y + RH / 2) * T }); r.cleared = true; } });
      const s = rooms[4]; p.x = (s.x + RW / 2) * T; p.y = (s.y + RH / 2) * T; cam = { x: p.x - W / 2, y: p.y - H / 2 };
    }
    function spawnRoom(r) {
      const n = 3 + Math.min(6, floor) + api.rand(0, 2); const types = ['slime', 'bat', 'shooter']; if (floor >= 2) types.push('knight'); if (floor >= 3) types.push('mage');
      if (r.type === 'boss') { mk('boss', r, 0); for (let i = 0; i < Math.min(4, floor); i++) mk(types[api.rand(0, types.length - 1)], r, i + 1); }
      else for (let i = 0; i < n; i++) mk(types[api.rand(0, types.length - 1)], r, i);
      r.locked = true;
    }
    function mk(type, r, i) { const d = ENEMIES[type]; let x, y, t = 0; do { x = api.rand(2, RW - 3); y = api.rand(2, RH - 3); t++; } while ((map[r.y + y][r.x + x] || Math.hypot((r.x + x) * T - p.x, (r.y + y) * T - p.y) < 120) && t < 30); const hpm = 1 + (floor - 1) * 0.35; enemies.push({ type, ...d, x: (r.x + x + .5) * T, y: (r.y + y + .5) * T, hp: Math.ceil(d.hp * hpm), maxhp: Math.ceil(d.hp * hpm), st: Math.random() * 2, room: r, vx: 0, vy: 0, hurt: 0 }); }
    const roomAt = (x, y) => rooms.find(r => x >= r.x * T && x < (r.x + RW) * T && y >= r.y * T && y < (r.y + RH) * T);
    const solid = (x, y) => { const tx = Math.floor(x / T), ty = Math.floor(y / T); if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return true; if (map[ty][tx]) return true; const r = rooms.find(r => r.locked && r.doors.some(([dx, dy]) => dx === tx && dy === ty)); return !!r; };
    function moveEnt(e, dx, dy) { const r = e.r || 12; if (!solid(e.x + dx + Math.sign(dx) * r, e.y - r * .6) && !solid(e.x + dx + Math.sign(dx) * r, e.y + r * .6)) e.x += dx; if (!solid(e.x - r * .6, e.y + dy + Math.sign(dy) * r) && !solid(e.x + r * .6, e.y + dy + Math.sign(dy) * r)) e.y += dy; }

    /* ---------- игрок и предметы ---------- */
    function newRun() { floor = 1; coins = 0; kills = 0; run = true; alive = true; buffs = { dmg: 1, spd: 1, maxhp: 6, maxen: 200, regen: 1 }; p = { x: 0, y: 0, r: 13, hp: 6, armor: 6, en: 200, weapons: [{ ...WEAPONS[0] }], wi: 0, cd: 0, hurt: 0, armorT: 0, a: 0 }; genFloor(); hdr.set(0, floor); hdr.set(1, 0); }
    function randomWeapon() { const maxTier = Math.min(3, Math.floor((floor + 1) / 2)); const pool = WEAPONS.filter(w => w.tier > 0 && w.tier <= maxTier && !p.weapons.some(x => x.n === w.n)); const w = pool.length ? pool[api.rand(0, pool.length - 1)] : WEAPONS[1]; return { ...w, dmg: w.dmg * (1 + Math.floor(floor / 3) * 0.5) }; }
    function shoot(w) {
      if (p.cd > 0) return; if (p.en < w.cost) { if (w.cost) { api.toast('Нет энергии'); p.cd = 0.4; return; } } p.en -= w.cost; p.cd = w.rate;
      const tgt = nearestEnemy(); const ang = tgt ? Math.atan2(tgt.y - p.y, tgt.x - p.x) : p.a; p.a = ang;
      if (w.melee) { effects.push({ t: 'slash', x: p.x, y: p.y, a: ang, life: 0.15 }); enemies.forEach(e => { if (Math.hypot(e.x - p.x, e.y - p.y) < w.melee + e.r && Math.abs(Math.atan2(e.y - p.y, e.x - p.x) - ang) < 1.2) hitEnemy(e, w.dmg * buffs.dmg); }); api.sound('select'); return; }
      const n = w.pellets || 1; for (let i = 0; i < n; i++) { const a2 = ang + (n > 1 ? (i - (n - 1) / 2) * w.spread : 0) + (Math.random() - .5) * w.spread; bullets.push({ x: p.x + Math.cos(a2) * 6, y: p.y + Math.sin(a2) * 6, vx: Math.cos(a2) * w.spd, vy: Math.sin(a2) * w.spd, dmg: w.dmg * buffs.dmg, col: w.col, pierce: w.pierce, splash: w.splash, life: w.short || 2, hit: new Set() }); }
      api.sound('tap'); api.vibrate(4);
    }
    const nearestEnemy = () => { let b = null, bd = 380; for (const e of enemies) { const d = Math.hypot(e.x - p.x, e.y - p.y); if (d < bd) { bd = d; b = e; } } return b; };
    function hitEnemy(e, dmg) { e.hp -= dmg; e.hurt = 0.12; if (e.hp <= 0 && !e.dead) { e.dead = true; kills++; const nc = e.type === 'boss' ? 25 : api.rand(0, 2); for (let i = 0; i < nc; i++) items.push({ t: 'coin', x: e.x + api.rand(-20, 20), y: e.y + api.rand(-20, 20) }); if (Math.random() < 0.12) items.push({ t: 'heart', x: e.x, y: e.y }); if (e.type === 'boss') { items.push({ t: 'chest', x: e.x, y: e.y }); items.push({ t: 'portal', x: (e.room.x + RW / 2) * T, y: (e.room.y + 2) * T }); api.sound('win'); api.vibrate([30, 50, 30, 50, 60]); } else api.sound('boom'); } }
    function hurtPlayer(n) { if (p.hurt > 0) return; p.hurt = 0.8; p.armorT = 4; api.vibrate(40); api.sound('bad'); while (n > 0) { if (p.armor > 0) p.armor--; else p.hp--; n--; } if (p.hp <= 0) die(); }
    function die() { alive = false; run = false; api.best('chmoknight', floor); api.addCoins(Math.floor(coins / 2) + floor * 5); api.end({ win: false, title: 'Чмонайт пал на этаже ' + floor, reward: 0, text: `Врагов убито: ${kills}. Монеты за забег: +${Math.floor(coins / 2) + floor * 5}`, onAgain: newRun }); }
    function nextFloor() { paused = true; const opts = api.shuffle([['❤ +2 макс. здоровья', () => { buffs.maxhp += 2; p.hp = Math.min(buffs.maxhp, p.hp + 2); }], ['⚔ Урон +25%', () => buffs.dmg += 0.25], ['⚡ +60 энергии', () => { buffs.maxen += 60; p.en = buffs.maxen; }], ['👟 Скорость +15%', () => buffs.spd += 0.15], ['💚 Полное лечение', () => { p.hp = buffs.maxhp; p.armor = 6; }], ['🔋 Регенерация энергии ×1.5', () => buffs.regen *= 1.5]]).slice(0, 3);
      const body = h('div', { class: 'row', style: 'flex-direction:column' }, opts.map(([n, f]) => h('button', { class: 'btn', style: 'width:100%', onclick: () => { f(); m.close(); floor++; hdr.set(0, floor); api.best('chmoknight', floor); api.addCoins(5); genFloor(); paused = false; api.sound('good'); } }, n)));
      const m = api.modal({ title: 'Этаж ' + floor + ' пройден!', text: 'Выбери усиление', body, buttons: [] });
    }

    /* ---------- цикл ---------- */
    function update(dt) {
      if (!alive || paused) return;
      p.cd -= dt; p.hurt -= dt; p.armorT -= dt; if (p.armorT <= 0 && p.armor < 6) { p.armor += dt * 0.8; if (p.armor > 6) p.armor = 6; } p.en = Math.min(buffs.maxen, p.en + dt * 10 * buffs.regen);
      if (joy) { const dx = joy.dx, dy = joy.dy; const d = Math.hypot(dx, dy); if (d > 6) { const sp = 170 * buffs.spd * Math.min(1, d / 50); moveEnt(p, dx / d * sp * dt, dy / d * sp * dt); p.a = Math.atan2(dy, dx); } }
      const w = p.weapons[p.wi]; if (fire) shoot(w);
      const room = roomAt(p.x, p.y); if (room && !room.visited) { room.visited = true; if (!room.cleared && room.type !== 'start') spawnRoom(room); }
      if (room && room.locked && !enemies.some(e => e.room === room)) { room.locked = false; room.cleared = true; api.sound('coin'); api.addCoins(0); if (room.type !== 'boss') api.toast('Комната зачищена'); }
      // пули игрока
      bullets.forEach(b => { b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt; if (solid(b.x, b.y) || b.life <= 0) { b.dead = true; if (b.splash) splash(b); return; } for (const e of enemies) { if (e.dead || b.hit.has(e)) continue; if (Math.hypot(e.x - b.x, e.y - b.y) < e.r + 4) { hitEnemy(e, b.dmg); b.hit.add(e); if (b.splash) { splash(b); b.dead = true; } else if (!b.pierce) { b.dead = true; } break; } } });
      bullets = bullets.filter(b => !b.dead);
      // враги
      enemies.forEach(e => { e.hurt -= dt; e.st -= dt; const dx = p.x - e.x, dy = p.y - e.y; const d = Math.hypot(dx, dy); if (d > 420) return; let mx = dx / d, my = dy / d; if (e.erratic) { e.vx = (e.vx || 0) + (Math.random() - .5) * 600 * dt; e.vy = (e.vy || 0) + (Math.random() - .5) * 600 * dt; mx = mx * .6 + e.vx / 200; my = my * .6 + e.vy / 200; } if (e.keep && d < e.keep) { mx *= -0.6; my *= -0.6; } moveEnt(e, mx * e.spd * dt, my * e.spd * dt);
        if (e.melee && d < e.r + p.r) hurtPlayer(e.melee);
        if (e.shoot && e.st <= 0) { e.st = e.shoot; const a = Math.atan2(dy, dx); if (e.ring && Math.random() < 0.4) { for (let i = 0; i < 12; i++) ebullets.push({ x: e.x, y: e.y, vx: Math.cos(i * Math.PI / 6) * 150, vy: Math.sin(i * Math.PI / 6) * 150, life: 3 }); } else { const n = e.spread || 1; for (let i = 0; i < n; i++) { const a2 = a + (i - (n - 1) / 2) * 0.25; ebullets.push({ x: e.x, y: e.y, vx: Math.cos(a2) * (200 + floor * 10), vy: Math.sin(a2) * (200 + floor * 10), life: 3 }); } } } });
      enemies = enemies.filter(e => !e.dead);
      ebullets.forEach(b => { b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt; if (solid(b.x, b.y) || b.life <= 0) b.dead = true; else if (Math.hypot(b.x - p.x, b.y - p.y) < p.r + 4) { b.dead = true; hurtPlayer(1); } }); ebullets = ebullets.filter(b => !b.dead);
      // предметы
      items.forEach(it => { const d = Math.hypot(it.x - p.x, it.y - p.y); if (it.t === 'coin' && d < 60) { it.x += (p.x - it.x) * dt * 8; it.y += (p.y - it.y) * dt * 8; } if (d < p.r + 10) { if (it.t === 'coin') { coins++; hdr.set(1, coins); it.dead = true; api.sound('coin'); } else if (it.t === 'heart') { p.hp = Math.min(buffs.maxhp, p.hp + 1); it.dead = true; api.sound('good'); } else if (it.t === 'chest') { it.dead = true; const w = randomWeapon(); items.push({ t: 'weapon', w, x: it.x, y: it.y + 30 }); api.sound('win'); api.toast('Сундук: ' + w.n); } else if (it.t === 'weapon' && (it.cool || 0) <= 0) { it.dead = true; if (p.weapons.length < 2) p.weapons.push(it.w); else { const old = p.weapons[p.wi]; p.weapons[p.wi] = it.w; items.push({ t: 'weapon', w: old, x: p.x, y: p.y, cool: 1.5 }); } p.wi = p.weapons.indexOf(it.w); api.sound('good'); api.toast('Взято: ' + it.w.n); } else if (it.t === 'portal') { it.dead = true; nextFloor(); } } if (it.cool) it.cool -= dt; }); items = items.filter(i => !i.dead);
      effects.forEach(f => f.life -= dt); effects = effects.filter(f => f.life > 0);
      cam.x += (p.x - W / 2 - cam.x) * Math.min(1, dt * 6); cam.y += (p.y - H / 2 - cam.y) * Math.min(1, dt * 6);
    }
    function splash(b) { effects.push({ t: 'boom', x: b.x, y: b.y, r: b.splash, life: 0.25 }); enemies.forEach(e => { if (Math.hypot(e.x - b.x, e.y - b.y) < b.splash + e.r) hitEnemy(e, b.dmg * 0.8); }); api.sound('boom'); }

    function draw(ctx) {
      ctx.fillStyle = '#0a0a14'; ctx.fillRect(0, 0, W, H); ctx.save(); ctx.translate(-Math.round(cam.x), -Math.round(cam.y));
      const x0 = Math.max(0, Math.floor(cam.x / T)), y0 = Math.max(0, Math.floor(cam.y / T)), x1 = Math.min(COLS - 1, Math.ceil((cam.x + W) / T)), y1 = Math.min(ROWS - 1, Math.ceil((cam.y + H) / T));
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { if (map[y][x]) { const open = (y + 1 < ROWS && !map[y + 1][x]); ctx.fillStyle = open ? '#3b3b6b' : '#22223a'; ctx.fillRect(x * T, y * T, T, T); } else { ctx.fillStyle = (x + y) % 2 ? '#1c1c30' : '#1e1e34'; ctx.fillRect(x * T, y * T, T, T); } }
      rooms.forEach(r => { if (r.locked) r.doors.forEach(([dx, dy]) => { ctx.fillStyle = '#7f1d1d'; ctx.fillRect(dx * T + 2, dy * T + 2, T - 4, T - 4); }); if (r.type === 'boss' && !r.visited) { ctx.fillStyle = '#7f1d1d'; ctx.font = '20px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('💀', (r.x + RW / 2) * T, (r.y + RH / 2) * T); } });
      ctx.font = '22px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      items.forEach(it => { if (it.t === 'coin') { ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(it.x, it.y, 5, 0, 7); ctx.fill(); } else if (it.t === 'weapon') { ctx.fillStyle = it.w.col; ctx.beginPath(); ctx.roundRect(it.x - 14, it.y - 5, 28, 10, 3); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '10px sans-serif'; ctx.fillText(it.w.n, it.x, it.y - 14); ctx.font = '22px sans-serif'; } else ctx.fillText({ chest: '🎁', heart: '❤️', portal: '🌀' }[it.t], it.x, it.y); });
      effects.forEach(f => { if (f.t === 'boom') { ctx.globalAlpha = f.life * 3; ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 7); ctx.fill(); ctx.globalAlpha = 1; } else { ctx.strokeStyle = '#c4b5fd'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(f.x, f.y, 55, f.a - 1, f.a + 1); ctx.stroke(); } });
      enemies.forEach(e => { ctx.font = (e.r * 1.6) + 'px sans-serif'; ctx.globalAlpha = e.hurt > 0 ? 0.4 : 1; ctx.fillText(e.e, e.x, e.y); ctx.globalAlpha = 1; if (e.hp < e.maxhp) { ctx.fillStyle = '#111'; ctx.fillRect(e.x - 16, e.y - e.r - 10, 32, 5); ctx.fillStyle = '#ef4444'; ctx.fillRect(e.x - 16, e.y - e.r - 10, 32 * e.hp / e.maxhp, 5); } });
      bullets.forEach(b => { ctx.fillStyle = b.col; ctx.beginPath(); ctx.arc(b.x, b.y, b.splash ? 6 : 4, 0, 7); ctx.fill(); }); ebullets.forEach(b => { ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(b.x, b.y, 5, 0, 7); ctx.fill(); ctx.fillStyle = '#fca5a5'; ctx.beginPath(); ctx.arc(b.x, b.y, 2, 0, 7); ctx.fill(); });
      // игрок
      ctx.globalAlpha = p.hurt > 0 && Math.floor(p.hurt * 20) % 2 ? 0.3 : 1; ctx.fillStyle = '#8b5cf6'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); ctx.fillStyle = '#c4b5fd'; ctx.beginPath(); ctx.arc(p.x, p.y - 4, 8, 0, 7); ctx.fill(); ctx.fillStyle = '#1e1b4b'; ctx.fillRect(p.x - 4 + Math.cos(p.a) * 3, p.y - 6, 2, 3); ctx.fillRect(p.x + 2 + Math.cos(p.a) * 3, p.y - 6, 2, 3);
      const w = p.weapons[p.wi]; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = w.col; ctx.fillRect(6, -3, w.melee ? 26 : 18, 6); ctx.restore(); ctx.globalAlpha = 1;
      ctx.restore();
      // HUD
      ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(0, 0, W, 54); ctx.font = '16px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      let hs = ''; for (let i = 0; i < buffs.maxhp; i++) hs += i < p.hp ? '❤️' : '🖤'; ctx.fillText(hs, 8, 14); let as = ''; for (let i = 0; i < 6; i++) as += i < Math.floor(p.armor) ? '🛡' : '·'; ctx.fillText(as, 8, 38);
      ctx.fillStyle = '#111'; ctx.fillRect(200, 8, 150, 10); ctx.fillStyle = '#22d3ee'; ctx.fillRect(200, 8, 150 * p.en / buffs.maxen, 10); ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.fillText('⚡ ' + Math.floor(p.en), 200, 30); ctx.fillText(w.n + (p.weapons.length > 1 ? ' (тап — сменить)' : ''), 200, 46);
      // мини-карта
      rooms.forEach((r, i) => { ctx.fillStyle = r === roomAt(p.x, p.y) ? '#8b5cf6' : r.visited ? (r.type === 'boss' ? '#ef4444' : r.type === 'treasure' ? '#fbbf24' : '#6b7280') : '#1f2937'; ctx.fillRect(W - 46 + r.gx * 13, 60 + r.gy * 13, 11, 11); });
      // джойстик и кнопка
      if (joy && !joy.kb) { ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(joy.x, joy.y, 50, 0, 7); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.beginPath(); ctx.arc(joy.x + Math.max(-50, Math.min(50, joy.dx)), joy.y + Math.max(-50, Math.min(50, joy.dy)), 20, 0, 7); ctx.fill(); }
      ctx.fillStyle = fire ? 'rgba(239,68,68,.6)' : 'rgba(239,68,68,.25)'; ctx.beginPath(); ctx.arc(W - 60, H - 70, 42, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('ОГОНЬ', W - 60, H - 70);
      ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.beginPath(); ctx.arc(W - 60, H - 150, 26, 0, 7); ctx.fill(); ctx.fillText('🔄', W - 60, H - 150);
    }

    /* ---------- ввод ---------- */
    const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Этаж', value: 1 }, { label: '●', value: 0 }, { label: 'Рекорд', value: best }], hint: 'Левая половина — джойстик · ОГОНЬ — стрельба с автоприцелом · 🔄 — сменить оружие',
      onDown: (pt, e) => { if (!alive) return; if (Math.hypot(pt.x - (W - 60), pt.y - (H - 150)) < 30 && p.weapons.length > 1) { p.wi = (p.wi + 1) % p.weapons.length; api.sound('tap'); return; } if (pt.x > W / 2 && pt.y > H / 2) { fire = { id: e.pointerId }; return; } if (pt.x <= W / 2 || pt.y <= H / 2) joy = { id: e.pointerId, x: pt.x, y: pt.y, dx: 0, dy: 0 }; },
      onMove: (pt, e) => { if (joy && e.pointerId === joy.id) { joy.dx = pt.x - joy.x; joy.dy = pt.y - joy.y; } },
      onUp: (pt, e) => { if (joy && e.pointerId === joy.id) joy = null; if (fire && e.pointerId === fire.id) fire = null; },
      onKey: e => { keys[e.key] = true; if (e.key === 'q') p.wi = (p.wi + 1) % p.weapons.length; },
      frame(dt, ctx) { if (!map) return; if (keys.ArrowLeft || keys.ArrowRight || keys.ArrowUp || keys.ArrowDown) { joy = { x: 0, y: 0, dx: (keys.ArrowRight ? 50 : 0) - (keys.ArrowLeft ? 50 : 0), dy: (keys.ArrowDown ? 50 : 0) - (keys.ArrowUp ? 50 : 0), kb: true }; } else if (joy && joy.kb) joy = null; if (keys[' ']) fire = fire || { kb: true }; else if (fire && fire.kb) fire = null; update(dt); draw(ctx); } });
    const keys = {}; window.addEventListener('keyup', a._ku = e => { keys[e.key] = false; }); hdr = a.hdr;
    this.unmount = () => { a.stop(); window.removeEventListener('keyup', a._ku); };
    window.__tp = i => { p.x = (rooms[i].x + RW / 2) * T; p.y = (rooms[i].y + RH / 2) * T; }; window.__ck = () => ({ b: bullets.length, fire, joy, keys: Object.keys(keys).filter(k => keys[k]), p: { x: p.x, y: p.y }, room: rooms.indexOf(roomAt(p.x, p.y)), links: rooms[4].links, en: enemies.length });
    newRun();
  }
});
