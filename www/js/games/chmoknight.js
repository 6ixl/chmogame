/* Чмонайт — рогалик в духе Soul Knight: процедурные подземелья, оружие, боссы, сохранение */
Games.register({
  id: 'chmoknight', title: 'Клинок Бездны', icon: '🗡', cat: 'arcade', desc: 'Рогалик: случайные подземелья, 22 вида оружия, боссы, прокачка, сохранение', bestLabel: 'Лучший этаж',
  mount(screen, api) {
    const { h } = api;
    const W = 360, H = 560, T = 32, RW = 11, RH = 9, CL = 3;
    let G = 3, COLS, ROWS;
    const WEAPONS = [
      { n: 'Пистолет', dmg: 1, rate: 0.35, spd: 420, cost: 0, spread: 0.05, col: '#e5e7eb', tier: 0, ic: 129 },
      { n: 'Дробовик', dmg: 1, rate: 0.8, spd: 380, cost: 3, spread: 0.35, pellets: 5, col: '#fbbf24', tier: 1, ic: 117 },
      { n: 'Автомат', dmg: 1, rate: 0.12, spd: 500, cost: 1, spread: 0.12, col: '#22d3ee', tier: 1, ic: 130 },
      { n: 'Лук', dmg: 3, rate: 0.6, spd: 600, cost: 2, spread: 0.02, pierce: true, col: '#34d399', tier: 1, ic: 131 },
      { n: 'Двойной пистолет', dmg: 1, rate: 0.18, spd: 450, cost: 1, spread: 0.1, pellets: 2, col: '#e5e7eb', tier: 1, ic: 130 },
      { n: 'Меч', dmg: 3, rate: 0.4, spd: 0, cost: 0, melee: 60, col: '#c4b5fd', tier: 1, ic: 104 },
      { n: 'Кинжал', dmg: 2, rate: 0.2, spd: 0, cost: 0, melee: 45, col: '#e5e7eb', tier: 1, ic: 103 },
      { n: 'Узи', dmg: 0.7, rate: 0.07, spd: 480, cost: 1, spread: 0.2, col: '#a3e635', tier: 1, ic: 130 },
      { n: 'Арбалет', dmg: 5, rate: 0.9, spd: 700, cost: 3, spread: 0, pierce: true, col: '#34d399', tier: 2, ic: 131 },
      { n: 'Лазер', dmg: 2, rate: 0.5, spd: 900, cost: 4, spread: 0, pierce: true, col: '#f472b6', tier: 2, ic: 129 },
      { n: 'Ракетница', dmg: 4, rate: 0.9, spd: 300, cost: 6, spread: 0.03, splash: 70, col: '#f97316', tier: 2, ic: 118 },
      { n: 'Снайперка', dmg: 6, rate: 1.1, spd: 1000, cost: 5, spread: 0, pierce: true, col: '#a3e635', tier: 2, ic: 131 },
      { n: 'Огнемёт', dmg: 0.5, rate: 0.05, spd: 260, cost: 1, spread: 0.3, short: 0.35, col: '#f97316', tier: 2, ic: 119 },
      { n: 'Топор', dmg: 5, rate: 0.7, spd: 0, cost: 0, melee: 70, wide: 1.8, col: '#fbbf24', tier: 2, ic: 118 },
      { n: 'Копьё', dmg: 4, rate: 0.5, spd: 0, cost: 0, melee: 95, wide: 0.5, col: '#e5e7eb', tier: 2, ic: 106 },
      { n: 'Тройной лук', dmg: 2, rate: 0.7, spd: 600, cost: 3, spread: 0.18, pellets: 3, pierce: true, col: '#34d399', tier: 2, ic: 131 },
      { n: 'Гранатомёт', dmg: 3, rate: 0.6, spd: 320, cost: 4, spread: 0.1, pellets: 2, splash: 55, col: '#f97316', tier: 3, ic: 118 },
      { n: 'Плазма', dmg: 3, rate: 0.3, spd: 350, cost: 3, spread: 0.08, splash: 40, col: '#c084fc', tier: 3, ic: 129 },
      { n: 'Пулемёт', dmg: 1.2, rate: 0.06, spd: 560, cost: 1, spread: 0.15, col: '#fbbf24', tier: 3, ic: 130 },
      { n: 'Молния', dmg: 4, rate: 0.35, spd: 1400, cost: 4, spread: 0.05, pierce: true, col: '#a5f3fc', tier: 3, ic: 129 },
      { n: 'Молот', dmg: 9, rate: 1.0, spd: 0, cost: 0, melee: 75, wide: 2.2, col: '#9ca3af', tier: 3, ic: 117 },
      { n: 'Бластер босса', dmg: 2, rate: 0.15, spd: 520, cost: 2, spread: 0.2, pellets: 3, pierce: true, col: '#ef4444', tier: 3, ic: 107 }
    ];
    const ENEMIES = {
      slime: { s: 108, hp: 3, spd: 70, r: 14, melee: 1 }, bat: { s: 120, hp: 2, spd: 150, r: 12, melee: 1, erratic: true }, shooter: { s: 121, hp: 4, spd: 50, r: 14, shoot: 1.6, keep: 180 },
      rat: { s: 123, hp: 1, spd: 190, r: 10, melee: 1 }, spider: { s: 122, hp: 5, spd: 120, r: 14, melee: 1 }, wolf: { s: 124, hp: 7, spd: 140, r: 15, melee: 2 },
      knight: { s: 96, hp: 8, spd: 60, r: 16, melee: 2 }, mage: { s: 111, hp: 5, spd: 40, r: 14, shoot: 2.2, keep: 220, spread: 3 }, imp: { s: 110, hp: 4, spd: 90, r: 12, shoot: 1.4, keep: 140 },
      boss: { s: 110, hp: 60, spd: 45, r: 30, shoot: 1.2, keep: 200, ring: true, melee: 2, big: true }, mimic: { s: 92, hp: 80, spd: 110, r: 28, melee: 3, charge: true, big: true }, lich: { s: 111, hp: 55, spd: 35, r: 28, shoot: 0.9, keep: 240, spread: 5, summon: true, big: true }
    };
    const THEMES = [{ floors: [48, 48, 48, 49, 50, 51], face: 40, top: 36, tint: null }, { floors: [0, 0, 1, 2, 3, 0], face: 57, top: 38, tint: 'rgba(120,60,20,.12)' }, { floors: [48, 49, 50, 51, 52, 53], face: 58, top: 37, tint: 'rgba(30,60,160,.18)' }, { floors: [0, 1, 2, 3, 12, 24], face: 59, top: 39, tint: 'rgba(160,20,40,.16)' }];
    const SHEET = new Image(); SHEET.src = 'assets/tinydungeon.png'; const SC = 12;
    const tile = (ctx, i, x, y, w, hgt, flip) => { if (!SHEET.complete || !SHEET.naturalWidth) return; const sx = (i % SC) * 16, sy = Math.floor(i / SC) * 16; if (flip) { ctx.save(); ctx.translate(x + (w || T), y); ctx.scale(-1, 1); ctx.drawImage(SHEET, sx, sy, 16, 16, 0, 0, w || T, hgt || T); ctx.restore(); } else ctx.drawImage(SHEET, sx, sy, 16, 16, x, y, w || T, hgt || T); };
    const SPR = { player: 97, chest: 89, chestOpen: 90, heart: 115, coin: 101, portal: 32, doorLocked: 46, torch: 8, decor: [54, 55, 56, 12, 24, 42, 63, 41] };
    const hashXY = (x, y) => ((x * 73856093) ^ (y * 19349663)) >>> 0;
    let map, rooms, floor, p, enemies, bullets, ebullets, items, cam, alive, coins, effects, joy = null, fire = null, paused = false, buffs, kills, decor = [], theme, hdr, saveT = 0;
    let maxFloor = api.load('ck_max', 1);

    /* ---------- генерация этажа ---------- */
    function genFloor() {
      G = floor >= 5 ? 4 : 3; COLS = G * RW + (G - 1) * CL; ROWS = G * RH + (G - 1) * CL; theme = THEMES[Math.floor((floor - 1) / 3) % THEMES.length];
      map = Array.from({ length: ROWS }, () => Array(COLS).fill(1));
      rooms = []; for (let gy = 0; gy < G; gy++) for (let gx = 0; gx < G; gx++) rooms.push({ gx, gy, x: gx * (RW + CL), y: gy * (RH + CL), links: [], type: 'normal', cleared: false, visited: false, doors: [] });
      const startIdx = (G >> 1) * G + (G >> 1); const seen = new Set([startIdx]); const st = [startIdx];
      while (seen.size < rooms.length) { const i = st[st.length - 1]; const r = rooms[i]; const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => ({ gx: r.gx + dx, gy: r.gy + dy })).filter(q => q.gx >= 0 && q.gy >= 0 && q.gx < G && q.gy < G).map(q => q.gy * G + q.gx).filter(j => !seen.has(j)); if (!nb.length) { st.pop(); continue; } const j = nb[api.rand(0, nb.length - 1)]; r.links.push(j); rooms[j].links.push(i); seen.add(j); st.push(j); }
      rooms.forEach(r => { for (let y = 1; y < RH - 1; y++) for (let x = 1; x < RW - 1; x++) map[r.y + y][r.x + x] = 0; if (Math.random() < 0.5) { const px = api.rand(3, RW - 5), py = api.rand(3, RH - 4); map[r.y + py][r.x + px] = 1; map[r.y + py][r.x + px + 1] = 1; } });
      rooms.forEach((r, i) => r.links.forEach(j => { if (j < i) return; const q = rooms[j]; if (q.gx > r.gx) { const y = r.y + Math.floor(RH / 2); for (let x = r.x + RW - 1; x <= q.x; x++) { map[y][x] = 0; map[y - 1][x] = 0; } r.doors.push([r.x + RW - 1, y - 1], [r.x + RW - 1, y]); q.doors.push([q.x, y - 1], [q.x, y]); } else { const x = r.x + Math.floor(RW / 2); for (let y = r.y + RH - 1; y <= q.y; y++) { map[y][x] = 0; map[y][x - 1] = 0; } r.doors.push([x - 1, r.y + RH - 1], [x, r.y + RH - 1]); q.doors.push([x - 1, q.y], [x, q.y]); } }));
      const dist = Array(rooms.length).fill(-1); dist[startIdx] = 0; const q = [startIdx]; while (q.length) { const i = q.shift(); rooms[i].links.forEach(j => { if (dist[j] < 0) { dist[j] = dist[i] + 1; q.push(j); } }); }
      const bossIdx = dist.indexOf(Math.max(...dist)); rooms[startIdx].type = 'start'; rooms[startIdx].cleared = true; rooms[bossIdx].type = 'boss';
      const others = api.shuffle(rooms.map((r, i) => i).filter(i => i !== startIdx && i !== bossIdx)); const nt = G === 4 ? 2 : 1; for (let k = 0; k < nt; k++) if (others[k] != null) rooms[others[k]].type = 'treasure'; if (others[nt] != null && Math.random() < 0.5) rooms[others[nt]].type = 'treasure';
      items = []; enemies = []; bullets = []; ebullets = []; effects = []; decor = [];
      rooms.forEach(r => { const n = api.rand(1, 4); for (let k = 0; k < n; k++) { const dx = api.rand(1, RW - 2), dy = api.rand(1, RH - 2); if (!map[r.y + dy][r.x + dx] && Math.hypot(dx - RW / 2, dy - RH / 2) > 2.5) decor.push({ x: r.x + dx, y: r.y + dy, t: SPR.decor[api.rand(0, SPR.decor.length - 1)] }); } });
      rooms.forEach(r => { if (r.type === 'treasure') { items.push({ t: 'chest', x: (r.x + RW / 2) * T, y: (r.y + RH / 2) * T }); r.cleared = true; } });
      const s = rooms[startIdx]; p.x = (s.x + RW / 2) * T; p.y = (s.y + RH / 2) * T; cam = { x: p.x - W / 2, y: p.y - H / 2 };
      if (floor > maxFloor) { maxFloor = floor; api.store('ck_max', maxFloor); } api.best('chmoknight', floor); saveRun();
    }
    function spawnRoom(r) {
      const n = 3 + Math.min(7, floor) + api.rand(0, 2); const types = ['slime', 'bat', 'shooter', 'rat']; if (floor >= 2) types.push('knight', 'spider'); if (floor >= 3) types.push('mage'); if (floor >= 4) types.push('wolf', 'imp');
      if (r.type === 'boss') { mk(['boss', 'mimic', 'lich'][(floor - 1) % 3], r); for (let i = 0; i < Math.min(5, floor); i++) mk(types[api.rand(0, types.length - 1)], r); }
      else for (let i = 0; i < n; i++) mk(types[api.rand(0, types.length - 1)], r);
      r.locked = true;
    }
    function mk(type, r, nearX, nearY) { const d = ENEMIES[type]; let x, y, t = 0; do { x = api.rand(2, RW - 3); y = api.rand(2, RH - 3); t++; } while ((map[r.y + y][r.x + x] || Math.hypot((r.x + x) * T - p.x, (r.y + y) * T - p.y) < 120) && t < 30); const hpm = 1 + (floor - 1) * 0.4; const e = { type, ...d, x: nearX || (r.x + x + .5) * T, y: nearY || (r.y + y + .5) * T, hp: Math.ceil(d.hp * hpm), maxhp: Math.ceil(d.hp * hpm), st: Math.random() * 2, room: r, vx: 0, vy: 0, hurt: 0, ct: 0 }; enemies.push(e); return e; }
    const roomAt = (x, y) => rooms.find(r => x >= r.x * T && x < (r.x + RW) * T && y >= r.y * T && y < (r.y + RH) * T);
    const solid = (x, y) => { const tx = Math.floor(x / T), ty = Math.floor(y / T); if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return true; if (map[ty][tx]) return true; return rooms.some(r => r.locked && r.doors.some(([dx, dy]) => dx === tx && dy === ty)); };
    function moveEnt(e, dx, dy) { const r = e.r || 12; if (!solid(e.x + dx + Math.sign(dx) * r, e.y - r * .6) && !solid(e.x + dx + Math.sign(dx) * r, e.y + r * .6)) e.x += dx; if (!solid(e.x - r * .6, e.y + dy + Math.sign(dy) * r) && !solid(e.x + r * .6, e.y + dy + Math.sign(dy) * r)) e.y += dy; }

    /* ---------- сохранение ---------- */
    function saveRun() { if (!alive) return; api.store('ck_save', { floor, coins, kills, buffs, p: { hp: p.hp, armor: p.armor, en: p.en, wi: p.wi, weapons: p.weapons.map(w => ({ ...w })) } }); }
    function clearSave() { api.store('ck_save', null); }
    function newRun(startFloor, resume) {
      const sv = resume ? api.load('ck_save', null) : null;
      floor = sv ? sv.floor : (startFloor || 1); coins = sv ? sv.coins : 0; kills = sv ? sv.kills : 0; alive = true; paused = false;
      buffs = sv ? sv.buffs : { dmg: 1, spd: 1, maxhp: 6, maxen: 200, regen: 1 };
      p = { x: 0, y: 0, r: 13, hp: 6, armor: 6, en: 200, weapons: [{ ...WEAPONS[0] }], wi: 0, cd: 0, hurt: 0, armorT: 0, a: 0 };
      if (sv) Object.assign(p, sv.p);
      else if (floor > 1) { // старт с выбранного этажа: снаряжение под уровень
        for (let i = 1; i < floor; i++) { const b = api.rand(0, 3); if (b === 0) buffs.maxhp += 1; else if (b === 1) buffs.dmg += 0.15; else if (b === 2) buffs.maxen += 30; else buffs.spd += 0.05; } p.hp = buffs.maxhp; p.en = buffs.maxen; p.weapons.push(randomWeapon());
      }
      genFloor(); hdr.set(0, floor); hdr.set(1, coins);
    }
    function randomWeapon() { const maxTier = Math.min(3, Math.floor((floor + 1) / 2)); const pool = WEAPONS.filter(w => w.tier > 0 && w.tier <= maxTier && !p.weapons.some(x => x.n === w.n)); const w = pool.length ? pool[api.rand(0, pool.length - 1)] : WEAPONS[1]; return { ...w, dmg: +(w.dmg * (1 + Math.floor(floor / 3) * 0.5)).toFixed(2) }; }

    /* ---------- бой ---------- */
    const muzzle = () => { const mx = p.x + Math.cos(p.a) * 22, my = p.y + Math.sin(p.a) * 22; return solid(mx, my) ? { x: p.x, y: p.y } : { x: mx, y: my }; };
    function shoot(w) {
      if (p.cd > 0) return; if (p.en < w.cost) { if (w.cost) { api.toast('Нет энергии — смените оружие'); p.cd = 0.4; return; } } p.en -= w.cost; p.cd = w.rate;
      const tgt = nearestEnemy(); const ang = tgt ? Math.atan2(tgt.y - p.y, tgt.x - p.x) : p.a; p.a = ang;
      if (w.melee) { effects.push({ t: 'slash', x: p.x, y: p.y, a: ang, r: w.melee, wide: w.wide || 1.2, life: 0.15 }); enemies.forEach(e => { if (Math.hypot(e.x - p.x, e.y - p.y) < w.melee + e.r && Math.abs(angDiff(Math.atan2(e.y - p.y, e.x - p.x), ang)) < (w.wide || 1.2)) hitEnemy(e, w.dmg * buffs.dmg); }); api.sound('select'); api.vibrate(6); return; }
      const m = muzzle(); const n = w.pellets || 1;
      for (let i = 0; i < n; i++) { const a2 = ang + (n > 1 ? (i - (n - 1) / 2) * w.spread : 0) + (Math.random() - .5) * w.spread; bullets.push({ x: m.x, y: m.y, vx: Math.cos(a2) * w.spd, vy: Math.sin(a2) * w.spd, dmg: w.dmg * buffs.dmg, col: w.col, pierce: w.pierce, splash: w.splash, life: w.short || 2, hit: new Set() }); }
      effects.push({ t: 'flash', x: m.x, y: m.y, life: 0.06, col: w.col }); api.sound('tap'); api.vibrate(4);
    }
    const angDiff = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
    const nearestEnemy = () => { let b = null, bd = 400; for (const e of enemies) { const d = Math.hypot(e.x - p.x, e.y - p.y); if (d < bd) { bd = d; b = e; } } return b; };
    function hitEnemy(e, dmg) { e.hp -= dmg; e.hurt = 0.12; effects.push({ t: 'dmg', x: e.x + api.rand(-8, 8), y: e.y - e.r, v: Math.round(dmg * 10) / 10, life: 0.6 }); if (e.hp <= 0 && !e.dead) { e.dead = true; kills++; const nc = e.big ? 30 : api.rand(0, 2); for (let i = 0; i < nc; i++) items.push({ t: 'coin', x: e.x + api.rand(-20, 20), y: e.y + api.rand(-20, 20) }); if (Math.random() < 0.12) items.push({ t: 'heart', x: e.x, y: e.y }); for (let i = 0; i < 8; i++) effects.push({ t: 'part', x: e.x, y: e.y, vx: (Math.random() - .5) * 260, vy: (Math.random() - .5) * 260, life: 0.5, col: '#f87171' }); if (e.big) { items.push({ t: 'chest', x: e.x, y: e.y }); items.push({ t: 'portal', x: (e.room.x + RW / 2) * T, y: (e.room.y + 2) * T }); api.sound('win'); api.vibrate([30, 50, 30, 50, 60]); } else api.sound('boom'); } }
    function hurtPlayer(n) { if (p.hurt > 0) return; p.hurt = 0.8; p.armorT = 4; api.vibrate(40); api.sound('bad'); while (n > 0) { if (p.armor >= 1) p.armor--; else p.hp--; n--; } if (p.hp <= 0) die(); }
    function die() { alive = false; clearSave(); const reward = Math.floor(coins / 2) + floor * 5; api.addCoins(reward); api.end({ win: false, title: 'Герой пал на этаже ' + floor, text: `Врагов убито: ${kills}. Награда: +${reward} монет`, again: 'Заново', onAgain: menu }); }
    function nextFloor() { paused = true; const opts = api.shuffle([['❤ +2 макс. здоровья', () => { buffs.maxhp += 2; p.hp = Math.min(buffs.maxhp, p.hp + 2); }], ['⚔ Урон +25%', () => buffs.dmg += 0.25], ['⚡ +60 энергии', () => { buffs.maxen += 60; p.en = buffs.maxen; }], ['👟 Скорость +15%', () => buffs.spd += 0.15], ['💚 Полное лечение', () => { p.hp = buffs.maxhp; p.armor = 6; }], ['🔋 Регенерация энергии ×1.5', () => buffs.regen *= 1.5], ['🎁 Случайное оружие', () => { const w = randomWeapon(); if (p.weapons.length < 2) p.weapons.push(w); else p.weapons[p.wi] = w; }]]).slice(0, 3);
      const body = h('div', { class: 'row', style: 'flex-direction:column' }, opts.map(([n, f]) => h('button', { class: 'btn', style: 'width:100%', onclick: () => { f(); m.close(); floor++; hdr.set(0, floor); api.addCoins(5); genFloor(); paused = false; api.sound('good'); if (floor === 31) api.modal({ title: '🏆 30 этажей пройдено!', text: 'Вы прошли основную кампанию. Дальше — бесконечный режим.', buttons: [{ label: 'Вперёд', cls: 'primary' }] }); } }, n)));
      const m = api.modal({ title: 'Этаж ' + floor + ' пройден!', text: 'Выбери усиление', body, buttons: [] });
    }
    function menu() {
      paused = true; alive = false; const sv = api.load('ck_save', null);
      const body = h('div', { class: 'row', style: 'flex-direction:column' },
        sv ? h('button', { class: 'btn primary', style: 'width:100%', onclick: () => { m.close(); newRun(1, true); } }, '▶ Продолжить (этаж ' + sv.floor + ')') : null,
        h('button', { class: 'btn ' + (sv ? '' : 'primary'), style: 'width:100%', onclick: () => { m.close(); clearSave(); newRun(1); } }, '🆕 Новый забег'),
        h('button', { class: 'btn', style: 'width:100%', onclick: () => { m.close(); levelPick(); } }, '🗺 Выбор этажа (открыто ' + maxFloor + ')'));
      const m = api.modal({ title: '🗡 Клинок Бездны', text: 'Лучший этаж: ' + maxFloor + ' · Кампания: 30 этажей, далее бесконечно', body, buttons: [{ label: 'В меню', onClick: api.exit }] });
    }
    function levelPick() { const box = h('div', { class: 'levels', style: 'max-height:50vh;overflow:auto' }); for (let i = 1; i <= Math.max(maxFloor, 1); i++) box.append(h('div', { class: 'lvl ' + (i < maxFloor ? 'done' : 'cur'), onclick: () => { m.close(); clearSave(); newRun(i); } }, i)); const m = api.modal({ title: 'Выбор этажа', text: 'Старт с этажа даёт снаряжение под его уровень', body: box, buttons: [{ label: 'Назад', onClick: menu }] }); }

    /* ---------- цикл ---------- */
    function update(dt) {
      if (!alive || paused) return;
      p.cd -= dt; p.hurt -= dt; p.armorT -= dt; if (p.armorT <= 0 && p.armor < 6) p.armor = Math.min(6, p.armor + dt * 0.8); p.en = Math.min(buffs.maxen, p.en + dt * 10 * buffs.regen);
      saveT += dt; if (saveT > 5) { saveT = 0; saveRun(); }
      if (joy) { const dx = joy.dx, dy = joy.dy; const d = Math.hypot(dx, dy); if (d > 6) { const sp = 170 * buffs.spd * Math.min(1, d / 50); moveEnt(p, dx / d * sp * dt, dy / d * sp * dt); if (!nearestEnemy()) p.a = Math.atan2(dy, dx); } }
      const w = p.weapons[p.wi]; if (fire) shoot(w); else { const t = nearestEnemy(); if (t) p.a = Math.atan2(t.y - p.y, t.x - p.x); }
      const room = roomAt(p.x, p.y); if (room && !room.visited) { const inside = p.x > (room.x + 1.6) * T && p.x < (room.x + RW - 1.6) * T && p.y > (room.y + 1.6) * T && p.y < (room.y + RH - 1.6) * T; if (inside) { room.visited = true; if (!room.cleared && room.type !== 'start') spawnRoom(room); } }
      if (room && room.locked && !enemies.some(e => e.room === room)) { room.locked = false; room.cleared = true; api.sound('coin'); if (room.type !== 'boss') api.toast('Комната зачищена'); saveRun(); }
      bullets.forEach(b => { b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt; if (solid(b.x, b.y) || b.life <= 0) { b.dead = true; if (b.splash) splash(b); return; } for (const e of enemies) { if (e.dead || b.hit.has(e)) continue; if (Math.hypot(e.x - b.x, e.y - b.y) < e.r + 4) { hitEnemy(e, b.dmg); b.hit.add(e); if (b.splash) { splash(b); b.dead = true; } else if (!b.pierce) b.dead = true; break; } } });
      bullets = bullets.filter(b => !b.dead);
      enemies.forEach(e => { e.hurt -= dt; e.st -= dt; const dx = p.x - e.x, dy = p.y - e.y; const d = Math.hypot(dx, dy); if (d > 460) return; let mx = dx / d, my = dy / d, sp = e.spd;
        if (e.erratic) { e.vx += (Math.random() - .5) * 600 * dt; e.vy += (Math.random() - .5) * 600 * dt; mx = mx * .6 + e.vx / 200; my = my * .6 + e.vy / 200; }
        if (e.charge) { e.ct -= dt; if (e.ct <= 0) { e.ct = 2.5; e.cvx = mx * 420; e.cvy = my * 420; e.cT = 0.5; } if (e.cT > 0) { e.cT -= dt; mx = e.cvx / 420; my = e.cvy / 420; sp = 420; } else sp = e.spd * 0.5; }
        if (e.keep && d < e.keep) { mx *= -0.6; my *= -0.6; } moveEnt(e, mx * sp * dt, my * sp * dt);
        if (e.melee && d < e.r + p.r) hurtPlayer(e.melee);
        if (e.shoot && e.st <= 0) { e.st = e.shoot; const a = Math.atan2(dy, dx); if (e.ring && Math.random() < 0.4) { for (let i = 0; i < 12; i++) ebullets.push({ x: e.x, y: e.y, vx: Math.cos(i * Math.PI / 6) * 150, vy: Math.sin(i * Math.PI / 6) * 150, life: 3 }); } else { const n = e.spread || 1; for (let i = 0; i < n; i++) { const a2 = a + (i - (n - 1) / 2) * 0.25; ebullets.push({ x: e.x, y: e.y, vx: Math.cos(a2) * (200 + floor * 8), vy: Math.sin(a2) * (200 + floor * 8), life: 3 }); } } if (e.summon && enemies.length < 8 && Math.random() < 0.35) mk('rat', e.room, e.x + api.rand(-40, 40), e.y + api.rand(-40, 40)); } });
      enemies = enemies.filter(e => !e.dead);
      ebullets.forEach(b => { b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt; if (solid(b.x, b.y) || b.life <= 0) b.dead = true; else if (Math.hypot(b.x - p.x, b.y - p.y) < p.r + 4) { b.dead = true; hurtPlayer(1); } }); ebullets = ebullets.filter(b => !b.dead);
      items.forEach(it => { const d = Math.hypot(it.x - p.x, it.y - p.y); if (it.t === 'coin' && d < 70) { it.x += (p.x - it.x) * dt * 8; it.y += (p.y - it.y) * dt * 8; } if (it.cool) it.cool -= dt; if (d < p.r + 10) { if (it.t === 'coin') { coins++; hdr.set(1, coins); it.dead = true; api.sound('coin'); } else if (it.t === 'heart') { p.hp = Math.min(buffs.maxhp, p.hp + 1); it.dead = true; api.sound('good'); } else if (it.t === 'chest') { it.dead = true; decor.push({ x: Math.floor(it.x / T), y: Math.floor(it.y / T), t: SPR.chestOpen }); const w = randomWeapon(); items.push({ t: 'weapon', w, x: it.x, y: it.y + 34, cool: 0.5 }); api.sound('win'); api.toast('Сундук: ' + w.n); } else if (it.t === 'weapon' && (it.cool || 0) <= 0) { it.dead = true; if (p.weapons.length < 2) p.weapons.push(it.w); else { const old = p.weapons[p.wi]; p.weapons[p.wi] = it.w; items.push({ t: 'weapon', w: old, x: p.x, y: p.y, cool: 1.5 }); } p.wi = p.weapons.indexOf(it.w); api.sound('good'); api.toast('Взято: ' + it.w.n); saveRun(); } else if (it.t === 'portal') { it.dead = true; nextFloor(); } } }); items = items.filter(i => !i.dead);
      effects.forEach(f => { f.life -= dt; if (f.t === 'part') { f.x += f.vx * dt; f.y += f.vy * dt; } if (f.t === 'dmg') f.y -= 30 * dt; }); effects = effects.filter(f => f.life > 0);
      cam.x += (p.x - W / 2 - cam.x) * Math.min(1, dt * 6); cam.y += (p.y - H / 2 - cam.y) * Math.min(1, dt * 6);
    }
    function splash(b) { effects.push({ t: 'boom', x: b.x, y: b.y, r: b.splash, life: 0.25 }); enemies.forEach(e => { if (Math.hypot(e.x - b.x, e.y - b.y) < b.splash + e.r) hitEnemy(e, b.dmg * 0.8); }); api.sound('boom'); }

    function draw(ctx) {
      ctx.imageSmoothingEnabled = false; ctx.fillStyle = '#0a0a14'; ctx.fillRect(0, 0, W, H); ctx.save(); ctx.translate(-Math.round(cam.x), -Math.round(cam.y));
      const x0 = Math.max(0, Math.floor(cam.x / T)), y0 = Math.max(0, Math.floor(cam.y / T)), x1 = Math.min(COLS - 1, Math.ceil((cam.x + W) / T)), y1 = Math.min(ROWS - 1, Math.ceil((cam.y + H) / T));
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        if (!map[y][x]) { tile(ctx, theme.floors[hashXY(x, y) % theme.floors.length], x * T, y * T); continue; }
        const faceDown = y + 1 < ROWS && !map[y + 1][x]; const nearFloor = [[1, 0], [-1, 0], [0, -1], [0, 1], [1, 1], [-1, 1], [1, -1], [-1, -1]].some(([dx, dy]) => map[y + dy] && map[y + dy][x + dx] === 0);
        if (!nearFloor) { ctx.fillStyle = '#0a0a14'; ctx.fillRect(x * T, y * T, T, T); continue; }
        if (faceDown) tile(ctx, hashXY(x, y) % 9 === 0 ? SPR.torch : theme.face, x * T, y * T); else tile(ctx, theme.top, x * T, y * T);
      }
      decor.forEach(d => tile(ctx, d.t, d.x * T, d.y * T));
      rooms.forEach(r => { if (r.locked) r.doors.forEach(([dx, dy]) => tile(ctx, SPR.doorLocked, dx * T, dy * T)); });
      const shadow = (x, y, r) => { ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(x, y + r * 0.9, r * 0.9, r * 0.35, 0, 0, 7); ctx.fill(); };
      const tnow = performance.now() / 1000;
      items.forEach(it => { if (it.t === 'coin') { ctx.save(); ctx.translate(it.x, it.y + Math.sin(tnow * 6 + it.x) * 2); tile(ctx, SPR.coin, -8, -8, 16, 16); ctx.restore(); } else if (it.t === 'weapon') { shadow(it.x, it.y, 10); ctx.save(); ctx.translate(it.x, it.y + Math.sin(tnow * 4) * 3); tile(ctx, it.w.ic || 104, -14, -14, 28, 28); ctx.restore(); ctx.fillStyle = '#fff'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(it.w.n + ' · ' + ['', 'I', 'II', 'III'][it.w.tier], it.x, it.y - 22); } else if (it.t === 'portal') { ctx.fillStyle = 'rgba(52,211,153,' + (0.25 + Math.sin(tnow * 4) * 0.15) + ')'; ctx.beginPath(); ctx.arc(it.x, it.y, 26, 0, 7); ctx.fill(); tile(ctx, SPR.portal, it.x - 16, it.y - 16); } else { shadow(it.x, it.y, 12); tile(ctx, it.t === 'chest' ? SPR.chest : SPR.heart, it.x - 16, it.y - 16); } });
      enemies.forEach(e => { const sz = e.big ? 64 : 32; shadow(e.x, e.y, sz / 2 - 4); ctx.globalAlpha = e.hurt > 0 ? 0.5 : 1; const bob = Math.sin(tnow * 8 + e.x) * 1.5; tile(ctx, e.s, e.x - sz / 2, e.y - sz / 2 + bob, sz, sz, e.x > p.x); ctx.globalAlpha = 1; if (e.hp < e.maxhp) { ctx.fillStyle = '#111'; ctx.fillRect(e.x - 16, e.y - sz / 2 - 8, 32, 5); ctx.fillStyle = '#ef4444'; ctx.fillRect(e.x - 16, e.y - sz / 2 - 8, 32 * Math.max(0, e.hp) / e.maxhp, 5); } });
      bullets.forEach(b => { ctx.shadowColor = b.col; ctx.shadowBlur = 8; ctx.fillStyle = b.col; ctx.beginPath(); ctx.arc(b.x, b.y, b.splash ? 6 : 4, 0, 7); ctx.fill(); ctx.shadowBlur = 0; });
      ebullets.forEach(b => { ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 8; ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(b.x, b.y, 5, 0, 7); ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = '#fecaca'; ctx.beginPath(); ctx.arc(b.x, b.y, 2, 0, 7); ctx.fill(); });
      // игрок: тело по центру, оружие в направлении прицела, пули вылетают из ствола
      shadow(p.x, p.y, 14); ctx.globalAlpha = p.hurt > 0 && Math.floor(p.hurt * 20) % 2 ? 0.3 : 1; const moving = joy && Math.hypot(joy.dx, joy.dy) > 6; const pb = moving ? Math.abs(Math.sin(tnow * 12)) * 3 : 0; tile(ctx, SPR.player, p.x - 16, p.y - 16 - pb, 32, 32, Math.cos(p.a) < 0);
      const w = p.weapons[p.wi]; ctx.save(); ctx.translate(p.x + Math.cos(p.a) * 12, p.y + Math.sin(p.a) * 12); ctx.rotate(p.a + Math.PI / 4); tile(ctx, w.ic || 104, -6, -20, 24, 24); ctx.restore(); ctx.globalAlpha = 1;
      effects.forEach(f => { if (f.t === 'boom') { const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r); g.addColorStop(0, 'rgba(255,240,150,' + f.life * 3 + ')'); g.addColorStop(1, 'rgba(249,115,22,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 7); ctx.fill(); } else if (f.t === 'slash') { ctx.strokeStyle = 'rgba(196,181,253,' + f.life * 6 + ')'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(f.x, f.y, f.r - 8, f.a - f.wide, f.a + f.wide); ctx.stroke(); } else if (f.t === 'flash') { ctx.fillStyle = f.col; ctx.beginPath(); ctx.arc(f.x, f.y, 7, 0, 7); ctx.fill(); } else if (f.t === 'part') { ctx.globalAlpha = f.life * 2; ctx.fillStyle = f.col; ctx.fillRect(f.x - 2, f.y - 2, 4, 4); ctx.globalAlpha = 1; } else if (f.t === 'dmg') { ctx.globalAlpha = Math.min(1, f.life * 2); ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(f.v, f.x, f.y); ctx.globalAlpha = 1; } });
      ctx.restore();
      if (theme.tint) { ctx.fillStyle = theme.tint; ctx.fillRect(0, 0, W, H); }
      const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
      // HUD
      ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(0, 0, W, 54); ctx.font = '16px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      let hs = ''; for (let i = 0; i < buffs.maxhp; i++) hs += i < p.hp ? '❤️' : '🖤'; ctx.fillText(hs, 8, 14); ctx.fillStyle = '#111'; ctx.fillRect(8, 30, 120, 8); ctx.fillStyle = '#60a5fa'; ctx.fillRect(8, 30, 120 * p.armor / 6, 8); ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.fillText('🛡 броня', 8, 46);
      ctx.fillStyle = '#111'; ctx.fillRect(200, 8, 150, 10); ctx.fillStyle = '#22d3ee'; ctx.fillRect(200, 8, 150 * p.en / buffs.maxen, 10); ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.fillText('⚡ ' + Math.floor(p.en) + ' / ' + buffs.maxen, 200, 30); ctx.fillText(w.n + (w.cost ? ' · ' + w.cost + '⚡' : '') + (p.weapons.length > 1 ? ' · 🔄' : ''), 200, 46);
      rooms.forEach(r => { ctx.fillStyle = r === roomAt(p.x, p.y) ? '#8b5cf6' : r.visited ? (r.type === 'boss' ? '#ef4444' : r.type === 'treasure' ? '#fbbf24' : '#6b7280') : '#1f2937'; ctx.fillRect(W - 8 - (G - r.gx) * 12, 60 + r.gy * 12, 10, 10); });
      if (joy && !joy.kb) { ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(joy.x, joy.y, 50, 0, 7); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.beginPath(); ctx.arc(joy.x + Math.max(-50, Math.min(50, joy.dx)), joy.y + Math.max(-50, Math.min(50, joy.dy)), 20, 0, 7); ctx.fill(); }
      ctx.fillStyle = fire ? 'rgba(239,68,68,.6)' : 'rgba(239,68,68,.25)'; ctx.beginPath(); ctx.arc(W - 60, H - 70, 42, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('ОГОНЬ', W - 60, H - 70);
      ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.beginPath(); ctx.arc(W - 60, H - 150, 26, 0, 7); ctx.fill(); ctx.fillText('🔄', W - 60, H - 150);
    }

    const keys = {};
    const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Этаж', value: 1 }, { label: '●', value: 0 }, { btn: '☰', onClick: () => { saveRun(); menu(); } }], hint: 'Левая половина — джойстик · ОГОНЬ — стрельба с автоприцелом · 🔄 — сменить оружие',
      onDown: (pt, e) => { if (!alive || paused) return; if (Math.hypot(pt.x - (W - 60), pt.y - (H - 150)) < 30 && p.weapons.length > 1) { p.wi = (p.wi + 1) % p.weapons.length; api.sound('tap'); return; } if (pt.x > W / 2 && pt.y > H / 2) { fire = { id: e.pointerId }; return; } joy = { id: e.pointerId, x: pt.x, y: pt.y, dx: 0, dy: 0 }; },
      onMove: (pt, e) => { if (joy && e.pointerId === joy.id) { joy.dx = pt.x - joy.x; joy.dy = pt.y - joy.y; } },
      onUp: (pt, e) => { if (joy && e.pointerId === joy.id) joy = null; if (fire && e.pointerId === fire.id) fire = null; },
      onKey: e => { keys[e.key] = true; if (e.key === 'q' && p) p.wi = (p.wi + 1) % p.weapons.length; },
      frame(dt, ctx) { if (!map) return; if (keys.ArrowLeft || keys.ArrowRight || keys.ArrowUp || keys.ArrowDown) joy = { x: 0, y: 0, dx: (keys.ArrowRight ? 50 : 0) - (keys.ArrowLeft ? 50 : 0), dy: (keys.ArrowDown ? 50 : 0) - (keys.ArrowUp ? 50 : 0), kb: true }; else if (joy && joy.kb) joy = null; if (keys[' ']) fire = fire || { kb: true }; else if (fire && fire.kb) fire = null; update(dt); draw(ctx); } });
    window.addEventListener('keyup', a._ku = e => { keys[e.key] = false; }); hdr = a.hdr;
    this.unmount = () => { if (alive) saveRun(); a.stop(); window.removeEventListener('keyup', a._ku); };
    window.__tp = i => { p.x = (rooms[i].x + RW / 2) * T; p.y = (rooms[i].y + RH / 2) * T; }; window.__ck = () => ({ b: bullets.length, en: enemies.length, room: rooms.indexOf(roomAt(p.x, p.y)), links: rooms[(G >> 1) * G + (G >> 1)].links, floor, alive });
    if (api.load('ck_save', null)) menu(); else newRun(1);
  }
});
