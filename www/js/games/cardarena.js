/* Карточная Арена — полный клон Clash Royale: 54 карты, арены, трофеи, бой с ботом или другом по Wi-Fi */
Games.register({
  id: 'cardarena', title: 'Карточная Арена', icon: '⚔️', cat: 'board', desc: '54 карты как в Clash Royale: войска, здания, заклинания, арены и трофеи', bestLabel: 'Трофеи',
  mount(screen, api) {
    const { h } = api;
    const W = 360, H = 620, LANE_L = 84, LANE_R = 276, MID = H / 2, RIVER = 22;
    const SHEET = new Image(); SHEET.src = 'assets/tinydungeon.png';
    const BSHEET = new Image(); BSHEET.src = 'assets/tinybattle.png';
    const tile = (ctx, i, x, y, s, flip) => { if (!SHEET.naturalWidth) return; const sx = (i % 12) * 16, sy = ((i / 12) | 0) * 16; if (flip) { ctx.save(); ctx.translate(x + s, y); ctx.scale(-1, 1); ctx.drawImage(SHEET, sx, sy, 16, 16, 0, 0, s, s); ctx.restore(); } else ctx.drawImage(SHEET, sx, sy, 16, 16, x, y, s, s); };
    const btile = (ctx, i, x, y, s) => { if (!BSHEET.naturalWidth) return; ctx.drawImage(BSHEET, (i % 18) * 16, ((i / 18) | 0) * 16, 16, 16, x, y, s, s); };

    /* ===== 54 карты ===== */
    const C = [
      { id: 'knight', nm: 'Рыцарь', cost: 3, rar: 0, sp: 96, hp: 690, dmg: 79, rate: 1.2, spd: 46, rng: 20, t: 'g', n: 1 },
      { id: 'archers', nm: 'Лучницы', cost: 3, rar: 0, sp: 99, hp: 125, dmg: 42, rate: 1.2, spd: 46, rng: 110, t: 'ga', n: 2 },
      { id: 'goblins', nm: 'Гоблины', cost: 2, rar: 0, sp: 112, hp: 80, dmg: 50, rate: 1.1, spd: 92, rng: 16, t: 'g', n: 3 },
      { id: 'skels', nm: 'Скелеты', cost: 1, rar: 0, sp: 86, hp: 32, dmg: 32, rate: 1.0, spd: 92, rng: 14, t: 'g', n: 3 },
      { id: 'spear', nm: 'Копейщики', cost: 2, rar: 0, sp: 112, hp: 52, dmg: 32, rate: 1.7, spd: 92, rng: 100, t: 'ga', n: 3 },
      { id: 'bomber', nm: 'Бомбер', cost: 2, rar: 0, sp: 86, hp: 220, dmg: 130, rate: 1.9, spd: 46, rng: 90, t: 'g', n: 1, splash: 34 },
      { id: 'barbs', nm: 'Варвары', cost: 5, rar: 0, sp: 87, hp: 500, dmg: 120, rate: 1.4, spd: 46, rng: 20, t: 'g', n: 4 },
      { id: 'minions', nm: 'Миньоны', cost: 3, rar: 0, sp: 120, hp: 190, dmg: 84, rate: 1.0, spd: 70, rng: 24, t: 'ga', n: 3, air: 1 },
      { id: 'horde', nm: 'Орда миньонов', cost: 5, rar: 0, sp: 120, hp: 190, dmg: 84, rate: 1.0, spd: 70, rng: 24, t: 'ga', n: 6, air: 1 },
      { id: 'giant', nm: 'Гигант', cost: 5, rar: 0, sp: 97, hp: 2000, dmg: 126, rate: 1.5, spd: 34, rng: 24, t: 'g', n: 1, only: 'b', big: 1.35 },
      { id: 'valk', nm: 'Валькирия', cost: 4, rar: 0, sp: 88, hp: 880, dmg: 120, rate: 1.5, spd: 46, rng: 22, t: 'g', n: 1, splash: 40 },
      { id: 'musk', nm: 'Мушкетёрша', cost: 4, rar: 0, sp: 99, hp: 340, dmg: 130, rate: 1.1, spd: 46, rng: 140, t: 'ga', n: 1 },
      { id: 'minipekka', nm: 'Мини-П.Е.К.К.А', cost: 4, rar: 0, sp: 98, hp: 600, dmg: 325, rate: 1.8, spd: 70, rng: 20, t: 'g', n: 1 },
      { id: 'knight3', nm: 'Три мушкетёрши', cost: 9, rar: 1, sp: 99, hp: 340, dmg: 130, rate: 1.1, spd: 46, rng: 140, t: 'ga', n: 3 },
      { id: 'skelarmy', nm: 'Армия скелетов', cost: 3, rar: 1, sp: 86, hp: 32, dmg: 32, rate: 1.0, spd: 92, rng: 14, t: 'g', n: 10 },
      { id: 'wizard', nm: 'Колдун', cost: 5, rar: 1, sp: 84, hp: 590, dmg: 130, rate: 1.4, spd: 46, rng: 130, t: 'ga', n: 1, splash: 36 },
      { id: 'witch', nm: 'Ведьма', cost: 5, rar: 1, sp: 111, hp: 480, dmg: 92, rate: 1.4, spd: 46, rng: 110, t: 'ga', n: 1, splash: 30, spawn: { id: 'skels', every: 5, n: 2 } },
      { id: 'prince', nm: 'Принц', cost: 5, rar: 1, sp: 100, hp: 1200, dmg: 200, rate: 1.4, spd: 46, rng: 24, t: 'g', n: 1, charge: 2 },
      { id: 'darkprince', nm: 'Тёмный принц', cost: 4, rar: 1, sp: 100, hp: 1100, dmg: 160, rate: 1.3, spd: 46, rng: 22, t: 'g', n: 1, charge: 2, splash: 34 },
      { id: 'babydragon', nm: 'Дракончик', cost: 4, rar: 1, sp: 110, hp: 800, dmg: 100, rate: 1.6, spd: 58, rng: 90, t: 'ga', n: 1, air: 1, splash: 32 },
      { id: 'hog', nm: 'Всадник на кабане', cost: 4, rar: 1, sp: 124, hp: 800, dmg: 160, rate: 1.6, spd: 92, rng: 22, t: 'g', n: 1, only: 'b', jump: 1 },
      { id: 'balloon', nm: 'Шар', cost: 5, rar: 1, sp: 121, hp: 1010, dmg: 400, rate: 3.0, spd: 46, rng: 20, t: 'g', n: 1, air: 1, only: 'b', death: 120 },
      { id: 'giantskel', nm: 'Гигантский скелет', cost: 6, rar: 1, sp: 86, hp: 2100, dmg: 200, rate: 1.5, spd: 46, rng: 22, t: 'g', n: 1, big: 1.4, death: 720 },
      { id: 'elitebarb', nm: 'Элитные варвары', cost: 6, rar: 1, sp: 85, hp: 1100, dmg: 200, rate: 1.5, spd: 70, rng: 20, t: 'g', n: 2 },
      { id: 'pekka', nm: 'П.Е.К.К.А', cost: 7, rar: 1, sp: 98, hp: 3200, dmg: 510, rate: 1.8, spd: 34, rng: 24, t: 'g', n: 1, big: 1.5 },
      { id: 'golem', nm: 'Голем', cost: 8, rar: 1, sp: 108, hp: 3800, dmg: 220, rate: 2.0, spd: 28, rng: 24, t: 'g', n: 1, only: 'b', big: 1.6, death: 320, split: 2 },
      { id: 'lavahound', nm: 'Лавовая гончая', cost: 7, rar: 2, sp: 110, hp: 3000, dmg: 50, rate: 1.3, spd: 34, rng: 40, t: 'b', n: 1, air: 1, only: 'b', big: 1.5, split: 6, splitId: 'minions' },
      { id: 'megaknight', nm: 'Мега-рыцарь', cost: 7, rar: 2, sp: 97, hp: 2700, dmg: 250, rate: 1.7, spd: 46, rng: 22, t: 'g', n: 1, big: 1.45, splash: 48, jump: 1 },
      { id: 'lumber', nm: 'Дровосек', cost: 4, rar: 2, sp: 87, hp: 1130, dmg: 160, rate: 1.1, spd: 92, rng: 20, t: 'g', n: 1, rageOnDeath: 1 },
      { id: 'icewiz', nm: 'Ледяной маг', cost: 3, rar: 2, sp: 84, hp: 590, dmg: 72, rate: 1.7, spd: 46, rng: 120, t: 'ga', n: 1, splash: 28, slow: 2 },
      { id: 'elecwiz', nm: 'Электро-маг', cost: 4, rar: 2, sp: 84, hp: 590, dmg: 100, rate: 1.8, spd: 46, rng: 120, t: 'ga', n: 1, stun: 0.5, chain: 2 },
      { id: 'princess', nm: 'Принцесса', cost: 3, rar: 2, sp: 99, hp: 216, dmg: 140, rate: 3.0, spd: 46, rng: 230, t: 'ga', n: 1, splash: 40 },
      { id: 'sparky', nm: 'Спарки', cost: 6, rar: 2, sp: 98, hp: 1200, dmg: 1100, rate: 4.5, spd: 34, rng: 110, t: 'g', n: 1, splash: 44, big: 1.3 },
      { id: 'infernod', nm: 'Инферно-дракон', cost: 4, rar: 2, sp: 110, hp: 1000, dmg: 40, rate: 0.4, spd: 58, rng: 110, t: 'ga', n: 1, air: 1, ramp: 1 },
      { id: 'bandit', nm: 'Бандитка', cost: 3, rar: 2, sp: 88, hp: 750, dmg: 160, rate: 1.0, spd: 92, rng: 20, t: 'g', n: 1, dash: 1 },
      { id: 'ghost', nm: 'Королевский призрак', cost: 3, rar: 2, sp: 108, hp: 1000, dmg: 218, rate: 1.8, spd: 70, rng: 22, t: 'g', n: 1, splash: 30 },
      { id: 'miner', nm: 'Шахтёр', cost: 3, rar: 2, sp: 85, hp: 1000, dmg: 160, rate: 1.2, spd: 92, rng: 20, t: 'g', n: 1, anywhere: 1 },
      // здания
      { id: 'cannon', nm: 'Пушка', cost: 3, rar: 0, bsp: 13, hp: 700, dmg: 110, rate: 0.9, spd: 0, rng: 140, t: 'g', n: 1, building: 1, life: 30 },
      { id: 'tesla', nm: 'Тесла', cost: 4, rar: 0, bsp: 13, hp: 900, dmg: 130, rate: 1.1, spd: 0, rng: 140, t: 'ga', n: 1, building: 1, life: 40 },
      { id: 'mortar', nm: 'Мортира', cost: 4, rar: 0, bsp: 12, hp: 800, dmg: 160, rate: 3.0, spd: 0, rng: 300, t: 'g', n: 1, building: 1, life: 30, splash: 40, minrng: 90 },
      { id: 'infernot', nm: 'Инферно-башня', cost: 5, rar: 1, bsp: 12, hp: 1200, dmg: 40, rate: 0.4, spd: 0, rng: 150, t: 'ga', n: 1, building: 1, life: 40, ramp: 1 },
      { id: 'gobhut', nm: 'Хижина гоблинов', cost: 5, rar: 0, bsp: 8, hp: 1000, dmg: 0, rate: 9, spd: 0, rng: 0, t: 'g', n: 1, building: 1, life: 50, spawn: { id: 'spear', every: 4.5, n: 1 } },
      { id: 'tombstone', nm: 'Надгробие', cost: 3, rar: 0, bsp: 8, hp: 450, dmg: 0, rate: 9, spd: 0, rng: 0, t: 'g', n: 1, building: 1, life: 30, spawn: { id: 'skels', every: 2.9, n: 1 }, death: 0, deathSpawn: 4 },
      // заклинания
      { id: 'zap', nm: 'Разряд', cost: 2, rar: 0, spell: 'zap', dmg: 159, radius: 46, stun: 0.5 },
      { id: 'arrows', nm: 'Стрелы', cost: 3, rar: 0, spell: 'arrows', dmg: 243, radius: 80 },
      { id: 'fire', nm: 'Огненный шар', cost: 4, rar: 0, spell: 'fire', dmg: 572, radius: 58 },
      { id: 'poison', nm: 'Яд', cost: 4, rar: 1, spell: 'poison', dmg: 100, radius: 70, dur: 8 },
      { id: 'rocket', nm: 'Ракета', cost: 6, rar: 1, spell: 'rocket', dmg: 1232, radius: 44 },
      { id: 'light', nm: 'Молния', cost: 6, rar: 1, spell: 'light', dmg: 864, radius: 120, targets: 3, stun: 0.5 },
      { id: 'freeze', nm: 'Заморозка', cost: 4, rar: 1, spell: 'freeze', radius: 60, dur: 4 },
      { id: 'rage', nm: 'Ярость', cost: 2, rar: 1, spell: 'rage', radius: 70, dur: 6 },
      { id: 'tornado', nm: 'Торнадо', cost: 3, rar: 2, spell: 'tornado', dmg: 80, radius: 100, dur: 2.5 },
      { id: 'log', nm: 'Бревно', cost: 2, rar: 2, spell: 'log', dmg: 240, radius: 40 },
      { id: 'graveyard', nm: 'Кладбище', cost: 5, rar: 2, spell: 'graveyard', radius: 70, dur: 9 }
    ];
    const RAR = ['#9ca3af', '#f59e0b', '#c084fc'];
    const byId = id => C.find(c => c.id === id);
    const DEF_DECK = ['knight', 'archers', 'goblins', 'musk', 'giant', 'fire', 'zap', 'cannon'];
    let deck = api.load('ca_deck', null); if (!Array.isArray(deck) || deck.length !== 8 || deck.some(id => !byId(id))) deck = DEF_DECK.slice();
    let stats = api.load('ca_st', { w: 0, l: 0, trophies: 0 }); if (stats.trophies == null) stats.trophies = 0;
    let arenaIdx = api.load('ca_arena', 0);

    const ARENAS = [
      { nm: 'Тренировочный лагерь', tr: 0, g1: '#4d7c0f', g2: '#3f6212', d: 0 },
      { nm: 'Костяная яма', tr: 200, g1: '#57534e', g2: '#44403c', d: 0 },
      { nm: 'Варварская лачуга', tr: 400, g1: '#7c5f2f', g2: '#6b4f24', d: 1 },
      { nm: 'Мастерская П.Е.К.К.А', tr: 600, g1: '#334155', g2: '#1e293b', d: 1 },
      { nm: 'Долина заклинаний', tr: 900, g1: '#5b21b6', g2: '#4c1d95', d: 1 },
      { nm: 'Арена строителя', tr: 1200, g1: '#0f766e', g2: '#115e59', d: 2 },
      { nm: 'Королевская арена', tr: 1600, g1: '#7f1d1d', g2: '#651c1c', d: 2 },
      { nm: 'Легендарная арена', tr: 2000, g1: '#1e1b4b', g2: '#312e81', d: 2 }
    ];
    const SKIP = 250;
    const arena = () => ARENAS[Math.max(0, Math.min(ARENAS.length - 1, arenaIdx))];

    let units, towers, elixir, eElixir, hand, nextCard, selCard, time, over, botDiff, mode, net = null, hdr, a, fx, auras, lastSync = 0, queue = [], overtime = false, dblElix = 1;
    const TOWERS = () => [
      { side: 0, kind: 'king', x: W / 2, y: 58, hp: 2400, max: 2400, dmg: 90, rate: 1.0, rng: 110, active: false },
      { side: 0, kind: 'side', x: LANE_L, y: 142, hp: 1400, max: 1400, dmg: 90, rate: 0.8, rng: 125, active: true },
      { side: 0, kind: 'side', x: LANE_R, y: 142, hp: 1400, max: 1400, dmg: 90, rate: 0.8, rng: 125, active: true },
      { side: 1, kind: 'king', x: W / 2, y: H - 58, hp: 2400, max: 2400, dmg: 90, rate: 1.0, rng: 110, active: false },
      { side: 1, kind: 'side', x: LANE_L, y: H - 142, hp: 1400, max: 1400, dmg: 90, rate: 0.8, rng: 125, active: true },
      { side: 1, kind: 'side', x: LANE_R, y: H - 142, hp: 1400, max: 1400, dmg: 90, rate: 0.8, rng: 125, active: true }
    ];
    function newBattle() {
      units = []; fx = []; auras = []; towers = TOWERS(); elixir = 5; eElixir = 5; time = 180; over = false; selCard = -1; overtime = false; dblElix = 1;
      const d = api.shuffle(deck.slice()); hand = d.slice(0, 4); nextCard = d[4]; queue = d.slice(5);
      hdr.set(0, '3:00');
    }
    const drawNext = i => { const old = hand[i]; hand[i] = nextCard; queue.push(old); nextCard = queue.shift(); };
    const dist = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);

    function mkUnit(c, side, x, y) {
      return { c, id: c.id, side, x: Math.max(16, Math.min(W - 16, x)), y: Math.max(16, Math.min(H - 16, y)), hp: c.hp, max: c.hp, cd: Math.random() * c.rate * 0.5, air: !!c.air, building: !!c.building, life: c.life, freeze: 0, stun: 0, slow: 0, rage: 0, ramp: 0, spawnT: c.spawn ? c.spawn.every : 0, chargeT: 0, t: 0, face: side === 1 };
    }
    function place(id, x, y, side) {
      const c = byId(id); if (!c) return;
      if (c.spell) return cast(c, x, y, side);
      const n = c.n || 1, cols = Math.min(n, 4);
      for (let i = 0; i < n; i++) units.push(mkUnit(c, side, x + ((i % cols) - (cols - 1) / 2) * 17, y + ((i / cols) | 0) * 16));
      api.sound('tap'); api.vibrate(5);
    }
    function cast(c, x, y, side) {
      api.sound(c.spell === 'freeze' || c.spell === 'rage' ? 'good' : 'boom'); api.vibrate(10);
      if (c.spell === 'log') return fx.push({ k: 'log', x, y, dir: side === 1 ? -1 : 1, life: 1.7, side, dmg: c.dmg });
      if (c.spell === 'graveyard') return auras.push({ k: 'graveyard', x, y, r: c.radius, life: c.dur, side, t: 0 });
      if (c.spell === 'poison') { auras.push({ k: 'poison', x, y, r: c.radius, life: c.dur, side, dmg: c.dmg }); return fx.push({ k: 'poison', x, y, r: c.radius, life: c.dur }); }
      if (c.spell === 'rage') { auras.push({ k: 'rage', x, y, r: c.radius, life: c.dur, side }); return fx.push({ k: 'rage', x, y, r: c.radius, life: c.dur }); }
      if (c.spell === 'tornado') { auras.push({ k: 'tornado', x, y, r: c.radius, life: c.dur, side, dmg: c.dmg }); return fx.push({ k: 'tornado', x, y, r: c.radius, life: c.dur }); }
      if (c.spell === 'freeze') { units.forEach(u => { if (u.side !== side && dist(u, { x, y }) < c.radius) u.freeze = c.dur; }); return fx.push({ k: 'freeze', x, y, r: c.radius, life: .8 }); }
      if (c.spell === 'light') {
        const pool = units.filter(u => u.side !== side && dist(u, { x, y }) < c.radius).sort((p, q) => q.hp - p.hp).slice(0, c.targets);
        pool.forEach(u => { hurt(u, c.dmg); u.stun = c.stun; fx.push({ k: 'bolt', x: u.x, y: u.y, life: .4 }); });
        towers.forEach(t => { if (t.side !== side && t.hp > 0 && Math.hypot(t.x - x, t.y - y) < c.radius && pool.length < c.targets) hurtTower(t, c.dmg); });
        return;
      }
      fx.push({ k: c.spell, x, y, r: c.radius, life: .5 });
      units.forEach(u => { if (u.side !== side && dist(u, { x, y }) < c.radius) { hurt(u, c.dmg); if (c.stun) u.stun = c.stun; } });
      towers.forEach(t => { if (t.side !== side && t.hp > 0 && Math.hypot(t.x - x, t.y - y) < c.radius) hurtTower(t, c.dmg * (c.spell === 'rocket' ? .4 : c.spell === 'fire' ? .3 : .15)); });
    }
    function hurt(u, d) {
      u.hp -= d; fx.push({ k: 'dmg', x: u.x + api.rand(-6, 6), y: u.y - 14, v: Math.round(d), life: .55 });
      if (u.hp > 0 || u.dead) return;
      u.dead = true; fx.push({ k: 'pop', x: u.x, y: u.y, life: .3 });
      if (u.c.death) { units.forEach(o => { if (!o.dead && o.side !== u.side && dist(o, u) < 60) hurt(o, u.c.death); }); towers.forEach(t => { if (t.side !== u.side && t.hp > 0 && Math.hypot(t.x - u.x, t.y - u.y) < 60) hurtTower(t, u.c.death * .4); }); fx.push({ k: 'fire', x: u.x, y: u.y, r: 60, life: .5 }); }
      if (u.c.rageOnDeath) auras.push({ k: 'rage', x: u.x, y: u.y, r: 70, life: 5, side: u.side });
      if (u.c.split) { const sc = u.c.splitId ? byId(u.c.splitId) : { ...byId('knight'), nm: 'Големит', hp: 500, dmg: 80, only: 'b', sp: 108, n: 1 }; for (let i = 0; i < u.c.split; i++) units.push(mkUnit(sc, u.side, u.x + api.rand(-20, 20), u.y + api.rand(-14, 14))); }
      if (u.c.deathSpawn) for (let i = 0; i < u.c.deathSpawn; i++) units.push(mkUnit(byId('skels'), u.side, u.x + api.rand(-16, 16), u.y + api.rand(-12, 12)));
    }
    function hurtTower(t, d) {
      t.hp -= d; if (t.hp > 0) return; t.hp = 0; api.sound('boom'); api.vibrate(60); fx.push({ k: 'fire', x: t.x, y: t.y, r: 46, life: .6 });
      if (t.kind === 'side') { const k = towers.find(z => z.side === t.side && z.kind === 'king'); if (k) k.active = true; }
      if (t.kind === 'king') endBattle(t.side === 1 ? 0 : 1);
    }

    /* ===== бот ===== */
    let botT = 0, deckBot = DEF_DECK.slice();
    function botTurn(dt) {
      botT -= dt; if (botT > 0) return;
      const think = [3.4, 2.1, 1.2][botDiff]; botT = think * (.6 + Math.random() * .8);
      const opts = deckBot.filter(id => byId(id).cost <= eElixir);
      if (!opts.length) return;
      const threats = units.filter(u => u.side === 1 && u.y < MID + 150 && !u.building);
      let pick = opts[api.rand(0, opts.length - 1)], px = (Math.random() < .5 ? LANE_L : LANE_R) + api.rand(-16, 16), py = 200;
      if (botDiff >= 1 && threats.length) {
        const big = threats.reduce((b, u) => u.hp > b.hp ? u : b);
        px = big.x + api.rand(-20, 20); py = Math.max(150, big.y - 80);
        if (botDiff === 2) {
          const grouped = threats.filter(u => dist(u, big) < 60).length;
          if (grouped >= 4) { const sp = opts.find(id => ['arrows', 'fire', 'log', 'zap', 'poison'].includes(id)); if (sp) { place(sp, big.x, big.y, 0); eElixir -= byId(sp).cost; return; } }
          const ctr = opts.filter(id => { const c = byId(id); return !c.spell && (big.air ? c.t.includes('a') : true); });
          if (ctr.length) pick = ctr.reduce((b, id) => byId(id).dmg > byId(b).dmg ? id : b);
        }
      } else if (botDiff === 2 && eElixir >= 8) {
        const tanks = opts.filter(id => !byId(id).spell && byId(id).cost >= 5); if (tanks.length) { pick = tanks[api.rand(0, tanks.length - 1)]; py = 120; }
      }
      const c = byId(pick); if (!c || c.cost > eElixir) return;
      if (c.spell) { const tg = units.filter(u => u.side === 1); if (!tg.length) return; place(pick, tg[0].x, tg[0].y, 0); }
      else place(pick, px, Math.min(MID - 30, py), 0);
      eElixir -= c.cost;
    }

    /* ===== симуляция ===== */
    function step(dt) {
      if (over) return;
      time -= dt;
      if (time <= 0) {
        const d0 = towers.filter(t => t.side === 0 && t.hp <= 0).length, d1 = towers.filter(t => t.side === 1 && t.hp <= 0).length;
        if (!overtime && d0 === d1) { overtime = true; time = 60; dblElix = 3; api.toast('Дополнительное время! Эликсир ×3'); }
        else { endBattle(null); return; }
      }
      if (time < 60 && !overtime) dblElix = 2;
      hdr.set(0, (overtime ? '+' : '') + Math.floor(Math.max(0, time) / 60) + ':' + String(Math.floor(Math.max(0, time) % 60)).padStart(2, '0'));
      const er = 0.357 * dblElix;
      elixir = Math.min(10, elixir + er * dt); if (mode !== 'guest') eElixir = Math.min(10, eElixir + er * dt);
      if (mode === 'bot') botTurn(dt);
      auras.forEach(au => {
        au.life -= dt; au.t = (au.t || 0) + dt;
        if (au.k === 'poison') units.forEach(u => { if (!u.dead && u.side !== au.side && dist(u, au) < au.r) hurt(u, au.dmg * dt); });
        if (au.k === 'tornado') units.forEach(u => { if (!u.dead && u.side !== au.side && dist(u, au) < au.r && !u.building) { const an = Math.atan2(au.y - u.y, au.x - u.x); u.x += Math.cos(an) * 70 * dt; u.y += Math.sin(an) * 70 * dt; hurt(u, au.dmg * dt / 2.5); } });
        if (au.k === 'graveyard' && au.t > .6) { au.t = 0; units.push(mkUnit(byId('skels'), au.side, au.x + api.rand(-au.r / 2, au.r / 2), au.y + api.rand(-au.r / 2, au.r / 2))); }
      });
      auras = auras.filter(au => au.life > 0);
      fx.filter(f => f.k === 'log').forEach(f => { f.y += f.dir * 230 * dt; units.forEach(u => { if (!u.dead && u.side !== f.side && !u.air && !u.logHit && Math.abs(u.y - f.y) < 22 && Math.abs(u.x - f.x) < 95) { u.logHit = 1; hurt(u, f.dmg); u.y += f.dir * 18; } }); });
      if (!fx.some(f => f.k === 'log')) units.forEach(u => u.logHit = 0);

      for (const u of units) {
        if (u.dead) continue; u.t += dt;
        if (u.stun > 0) { u.stun -= dt; continue; }
        if (u.freeze > 0) { u.freeze -= dt; continue; }
        if (u.slow > 0) u.slow -= dt;
        u.rage = auras.some(au => au.k === 'rage' && au.side === u.side && dist(u, au) < au.r) ? 1 : 0;
        if (u.life != null) { u.life -= dt; if (u.life <= 0) { u.dead = true; continue; } }
        if (u.c.spawn) { u.spawnT -= dt; if (u.spawnT <= 0) { u.spawnT = u.c.spawn.every; for (let i = 0; i < u.c.spawn.n; i++) units.push(mkUnit(byId(u.c.spawn.id), u.side, u.x + api.rand(-16, 16), u.y + (u.side === 1 ? -20 : 20))); } }
        const spdMul = (u.rage ? 1.35 : 1) * (u.slow > 0 ? .5 : 1) * (u.c.charge && u.chargeT > 1.2 ? 2 : 1);
        let tgt = null, td = Infinity;
        const canHit = o => o.air ? u.c.t.includes('a') : u.c.t.includes('g');
        if (u.c.only !== 'b' && u.c.t !== 'b') for (const o of units) { if (o.dead || o.side === u.side || !canHit(o)) continue; const d = dist(o, u); if (d < td && d < Math.max(u.c.rng + 70, 170)) { td = d; tgt = o; } }
        if (!tgt) for (const t of towers) { if (t.side === u.side || t.hp <= 0) continue; if (t.kind === 'king' && !t.active && towers.some(z => z.side === t.side && z.kind === 'side' && z.hp > 0)) continue; const d = Math.hypot(t.x - u.x, t.y - u.y); if (d < td) { td = d; tgt = t; } }
        if (!tgt) continue;
        const rng = u.c.rng + (tgt.kind ? 18 : 8);
        if (td > rng || (u.c.minrng && td < u.c.minrng && !tgt.kind)) {
          if (u.building) continue;
          let tx = tgt.x, ty = tgt.y;
          if (!u.air && !u.c.jump && Math.abs(u.y - MID) < 70 && Math.abs(u.x - LANE_L) > 30 && Math.abs(u.x - LANE_R) > 30) { tx = u.x < W / 2 ? LANE_L : LANE_R; ty = MID; }
          const an = Math.atan2(ty - u.y, tx - u.x), sp = u.c.spd * spdMul;
          u.x += Math.cos(an) * sp * dt; u.y += Math.sin(an) * sp * dt; u.face = Math.cos(an) < 0;
          if (u.c.charge || u.c.dash) u.chargeT += dt;
          for (const o of units) { if (o === u || o.dead || !!o.air !== !!u.air) continue; const d = dist(o, u); if (d > 0 && d < 14) { const pa = Math.atan2(u.y - o.y, u.x - o.x); u.x += Math.cos(pa) * (14 - d) * .5; u.y += Math.sin(pa) * (14 - d) * .5; } }
        } else {
          u.cd -= dt * (u.rage ? 1.35 : 1);
          if (u.cd <= 0) {
            u.cd = u.c.rate;
            let dmg = u.c.dmg * (u.c.charge && u.chargeT > 1.2 ? u.c.charge : 1);
            if (u.c.ramp) { u.ramp = Math.min(5, u.ramp + .4); dmg = u.c.dmg * (1 + u.ramp * 2); }
            u.chargeT = 0;
            if (u.c.rng > 45) fx.push({ k: 'shot', x: u.x, y: u.y, tx: tgt.x, ty: tgt.y, life: .22, side: u.side, ramp: !!u.c.ramp });
            if (tgt.kind) hurtTower(tgt, dmg);
            else {
              hurt(tgt, dmg);
              if (u.c.stun) tgt.stun = u.c.stun; if (u.c.slow) tgt.slow = u.c.slow;
              if (u.c.splash) units.forEach(o => { if (!o.dead && o.side !== u.side && o !== tgt && dist(o, tgt) < u.c.splash) hurt(o, dmg * .7); });
              if (u.c.chain) { let n = 0; units.forEach(o => { if (n < u.c.chain && !o.dead && o.side !== u.side && o !== tgt && dist(o, tgt) < 70) { hurt(o, dmg * .6); o.stun = u.c.stun || 0; n++; fx.push({ k: 'shot', x: tgt.x, y: tgt.y, tx: o.x, ty: o.y, life: .2, side: u.side }); } }); }
            }
            api.sound('select');
          }
        }
      }
      units = units.filter(u => !u.dead);
      for (const t of towers) {
        if (t.hp <= 0 || (t.kind === 'king' && !t.active)) continue;
        t.cd = (t.cd || 0) - dt; if (t.cd > 0) continue;
        let tgt = null, td = t.rng;
        for (const u of units) { if (u.side === t.side || u.dead) continue; const d = Math.hypot(u.x - t.x, u.y - t.y); if (d < td) { td = d; tgt = u; } }
        if (tgt) { t.cd = t.rate; hurt(tgt, t.dmg); fx.push({ k: 'shot', x: t.x, y: t.y, tx: tgt.x, ty: tgt.y, life: .2, side: t.side }); }
      }
      fx.forEach(f => f.life -= dt); fx = fx.filter(f => f.life > 0);
    }
    function endBattle(winner) {
      if (over) return; over = true;
      const d0 = towers.filter(t => t.side === 0 && t.hp <= 0).length, d1 = towers.filter(t => t.side === 1 && t.hp <= 0).length;
      const win = winner != null ? winner === 1 : d0 > d1 ? true : d0 < d1 ? false : null;
      const tr = win === true ? 30 : win === false ? -20 : 0;
      stats.trophies = Math.max(0, stats.trophies + tr);
      if (win === true) stats.w++; else if (win === false) stats.l++;
      api.store('ca_st', stats); api.best('cardarena', stats.trophies);
      while (arenaIdx < ARENAS.length - 1 && stats.trophies >= ARENAS[arenaIdx + 1].tr) { arenaIdx++; api.store('ca_arena', arenaIdx); api.toast('Открыта арена: ' + ARENAS[arenaIdx].nm); }
      const txt = `Снесено башен: ${d0} · у вас ${d1}` + (tr ? ` · трофеи ${tr > 0 ? '+' : ''}${tr} (всего ${stats.trophies})` : '');
      if (win === true) api.end({ title: '🏆 Победа!', reward: 30 + d0 * 15, text: txt, again: 'Ещё бой', onAgain: menu });
      else if (win === false) api.end({ win: false, title: 'Поражение', text: txt, again: 'Ещё бой', onAgain: menu });
      else api.end({ title: 'Ничья', reward: 10, text: txt, again: 'Ещё бой', onAgain: menu });
      if (net && mode === 'host') net.send({ t: 'end', win: win === true ? 'host' : win === false ? 'guest' : 'draw' });
    }

    /* ===== отрисовка ===== */
    function draw(ctx) {
      ctx.imageSmoothingEnabled = false; const ar = arena();
      ctx.fillStyle = ar.g1; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = ar.g2; for (let y = 0; y < H; y += 30) for (let x = 0; x < W; x += 30) if ((x / 30 + y / 30) % 2) ctx.fillRect(x, y, 30, 30);
      ctx.fillStyle = '#0ea5e9'; ctx.fillRect(0, MID - RIVER, W, RIVER * 2);
      ctx.fillStyle = 'rgba(255,255,255,.22)'; for (let i = 0; i < 12; i++) ctx.fillRect(((i * 34 + performance.now() / 40) % (W + 40)) - 20, MID - 14 + (i % 3) * 9, 16, 3);
      [LANE_L, LANE_R].forEach(x => { ctx.fillStyle = '#92400e'; ctx.fillRect(x - 26, MID - RIVER - 4, 52, RIVER * 2 + 8); ctx.fillStyle = '#78350f'; for (let i = 0; i < 6; i++) ctx.fillRect(x - 26, MID - RIVER - 4 + i * 9, 52, 3); });
      towers.forEach(t => {
        const s = t.kind === 'king' ? 56 : 46;
        if (t.hp <= 0) return btile(ctx, t.side === 0 ? 62 : 44, t.x - s / 2, t.y - s / 2, s);
        btile(ctx, t.kind === 'king' ? (t.side === 0 ? 68 : 50) : (t.side === 0 ? 67 : 49), t.x - s / 2, t.y - s / 2, s);
        ctx.fillStyle = '#111'; ctx.fillRect(t.x - s / 2, t.y - s / 2 - 9, s, 6);
        ctx.fillStyle = t.side === 1 ? '#22d3ee' : '#f87171'; ctx.fillRect(t.x - s / 2, t.y - s / 2 - 9, s * t.hp / t.max, 6);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(Math.ceil(t.hp), t.x, t.y - s / 2 - 12);
      });
      auras.forEach(au => { ctx.globalAlpha = .22; ctx.fillStyle = au.k === 'poison' ? '#84cc16' : au.k === 'rage' ? '#c026d3' : au.k === 'graveyard' ? '#6b21a8' : '#94a3b8'; ctx.beginPath(); ctx.arc(au.x, au.y, au.r, 0, 7); ctx.fill(); ctx.globalAlpha = 1; });
      units.forEach(u => {
        const s = u.c.big ? 34 * u.c.big : u.c.n > 3 ? 20 : 26;
        ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(u.x, u.y + s / 2 - 2, s / 3, s / 7, 0, 0, 7); ctx.fill();
        if (u.building) btile(ctx, u.c.bsp || 13, u.x - s / 2, u.y - s / 2, s); else tile(ctx, u.c.sp, u.x - s / 2, u.y - s / 2 + (u.air ? Math.sin(u.t * 6) * 3 : 0), s, u.face);
        ctx.strokeStyle = u.side === 1 ? 'rgba(34,211,238,.85)' : 'rgba(248,113,113,.85)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(u.x, u.y + s / 2 - 2, s / 3, s / 7, 0, 0, 7); ctx.stroke();
        if (u.hp < u.max) { ctx.fillStyle = '#111'; ctx.fillRect(u.x - 13, u.y - s / 2 - 7, 26, 4); ctx.fillStyle = u.side === 1 ? '#22d3ee' : '#f87171'; ctx.fillRect(u.x - 13, u.y - s / 2 - 7, 26 * Math.max(0, u.hp) / u.max, 4); }
        if (u.freeze > 0) { ctx.fillStyle = 'rgba(147,197,253,.55)'; ctx.beginPath(); ctx.arc(u.x, u.y, s / 2, 0, 7); ctx.fill(); }
        if (u.rage) { ctx.strokeStyle = 'rgba(192,38,211,.8)'; ctx.beginPath(); ctx.arc(u.x, u.y, s / 2 + 3, 0, 7); ctx.stroke(); }
      });
      fx.forEach(f => {
        if (f.k === 'shot') { ctx.strokeStyle = f.ramp ? 'rgba(249,115,22,.95)' : f.side === 1 ? 'rgba(34,211,238,.9)' : 'rgba(248,113,113,.9)'; ctx.lineWidth = f.ramp ? 4 : 2; ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(f.tx, f.ty); ctx.stroke(); }
        else if (f.k === 'fire' || f.k === 'rocket') { const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r); g.addColorStop(0, 'rgba(255,230,130,' + f.life * 2 + ')'); g.addColorStop(1, 'rgba(239,68,68,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 7); ctx.fill(); }
        else if (f.k === 'arrows') { ctx.strokeStyle = 'rgba(226,232,240,' + f.life * 2 + ')'; ctx.lineWidth = 2; for (let i = 0; i < 12; i++) { const an = i * .52; ctx.beginPath(); ctx.moveTo(f.x + Math.cos(an) * f.r * .4, f.y + Math.sin(an) * f.r * .4); ctx.lineTo(f.x + Math.cos(an) * f.r, f.y + Math.sin(an) * f.r); ctx.stroke(); } }
        else if (f.k === 'zap' || f.k === 'bolt') { ctx.strokeStyle = 'rgba(165,243,252,' + Math.min(1, f.life * 3) + ')'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(f.x, f.y - 60); ctx.lineTo(f.x + 12, f.y - 25); ctx.lineTo(f.x - 10, f.y - 5); ctx.lineTo(f.x, f.y); ctx.stroke(); if (f.r) { ctx.fillStyle = 'rgba(165,243,252,' + f.life + ')'; ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 7); ctx.fill(); } }
        else if (f.k === 'freeze') { ctx.fillStyle = 'rgba(147,197,253,' + f.life + ')'; ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 7); ctx.fill(); }
        else if (f.k === 'log') { ctx.fillStyle = '#92400e'; ctx.beginPath(); ctx.roundRect(f.x - 80, f.y - 11, 160, 22, 11); ctx.fill(); ctx.strokeStyle = '#78350f'; ctx.lineWidth = 2; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(f.x + i * 30, f.y - 11); ctx.lineTo(f.x + i * 30, f.y + 11); ctx.stroke(); } }
        else if (f.k === 'tornado') { ctx.strokeStyle = 'rgba(203,213,225,.7)'; ctx.lineWidth = 3; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (.3 + i * .22), performance.now() / 120 + i, performance.now() / 120 + i + 4); ctx.stroke(); } }
        else if (f.k === 'poison') { ctx.fillStyle = 'rgba(132,204,22,.18)'; ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 7); ctx.fill(); }
        else if (f.k === 'pop') { ctx.fillStyle = 'rgba(255,255,255,' + f.life * 3 + ')'; ctx.beginPath(); ctx.arc(f.x, f.y, 16 * (1 - f.life), 0, 7); ctx.fill(); }
        else if (f.k === 'dmg') { ctx.globalAlpha = Math.min(1, f.life * 2); ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(f.v, f.x, f.y - (.55 - f.life) * 26); ctx.globalAlpha = 1; }
      });
      if (selCard >= 0) {
        const c = byId(hand[selCard]); const full = c && (c.spell || c.anywhere);
        ctx.fillStyle = 'rgba(34,211,238,.12)'; ctx.fillRect(0, full ? 0 : MID + RIVER, W, full ? H : H - MID - RIVER);
        ctx.strokeStyle = 'rgba(34,211,238,.6)'; ctx.setLineDash([8, 8]); ctx.lineWidth = 2; ctx.strokeRect(2, (full ? 0 : MID + RIVER) + 2, W - 4, (full ? H : H - MID - RIVER) - 6); ctx.setLineDash([]);
      }
      if (dblElix > 1) { ctx.fillStyle = 'rgba(192,38,211,.75)'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('ЭЛИКСИР ×' + dblElix, W / 2, MID + 4); }
    }

    /* ===== UI боя ===== */
    let handEl, elixEl, lastElx = -1;
    function buildUI() {
      const bar = h('div', { class: 'ca-bar' });
      elixEl = h('div', { class: 'ca-elixir' }, h('div', { class: 'ca-elixir-fill' }), h('b', null, '0'));
      handEl = h('div', { class: 'ca-hand' }); bar.append(elixEl, handEl); screen.append(bar); renderHand();
    }
    function renderHand() {
      handEl.innerHTML = '';
      handEl.append(h('div', { class: 'ca-next' }, h('span', { style: 'font-size:9px;color:var(--muted)' }, 'Далее'), h('div', { class: 'ca-mini' }, art(byId(nextCard), 24))));
      hand.forEach((id, i) => { const c = byId(id); const can = elixir >= c.cost;
        handEl.append(h('div', { class: 'ca-card' + (selCard === i ? ' sel' : '') + (can ? '' : ' off'), style: 'border-color:' + RAR[c.rar], onclick: () => { if (!can) { api.toast('Мало эликсира'); return; } selCard = selCard === i ? -1 : i; renderHand(); api.sound('tap'); } },
          art(c, 36), h('span', { class: 'ca-nm' }, c.nm), h('div', { class: 'ca-cost' }, c.cost)));
      });
    }
    function art(c, size) {
      const s = size || 34, cv = h('canvas', { width: s, height: s, class: 'ca-art' }), cx = cv.getContext('2d'); cx.imageSmoothingEnabled = false;
      const paint = () => {
        cx.clearRect(0, 0, s, s);
        if (c.spell) { cx.fillStyle = { zap: '#a5f3fc', arrows: '#e2e8f0', fire: '#f97316', poison: '#84cc16', rocket: '#ef4444', light: '#a5f3fc', freeze: '#93c5fd', rage: '#c026d3', tornado: '#cbd5e1', log: '#92400e', graveyard: '#6b21a8' }[c.spell] || '#fff'; cx.beginPath(); cx.arc(s / 2, s / 2, s / 2 - 3, 0, 7); cx.fill(); cx.fillStyle = '#111'; cx.font = 'bold ' + (s * .42) + 'px sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText({ zap: '⚡', arrows: '↓', fire: '🔥', poison: '☠', rocket: '🚀', light: '⚡', freeze: '❄', rage: '💢', tornado: '🌀', log: '🪵', graveyard: '💀' }[c.spell] || '?', s / 2, s / 2 + 1); }
        else if (c.building) btile(cx, c.bsp || 13, 0, 0, s); else tile(cx, c.sp, 0, 0, s);
      };
      if (SHEET.complete && BSHEET.complete) paint(); else { SHEET.addEventListener('load', paint, { once: true }); BSHEET.addEventListener('load', paint, { once: true }); }
      return cv;
    }

    /* ===== сеть ===== */
    function makeNet(isHost, onMsg) {
      const pc = new RTCPeerConnection({ iceServers: [] }); let ch;
      const o = { pc, send: m => { try { if (ch && ch.readyState === 'open') ch.send(JSON.stringify(m)); } catch (e) {} }, close: () => { try { pc.close(); } catch (e) {} } };
      const setup = c => { ch = c; c.onmessage = e => { try { onMsg(JSON.parse(e.data)); } catch (err) {} }; c.onopen = () => o.onOpen && o.onOpen(); };
      if (isHost) setup(pc.createDataChannel('game', { ordered: true })); else pc.ondatachannel = e => setup(e.channel);
      o.gather = () => new Promise(res => { if (pc.iceGatheringState === 'complete') return res(); const ck = () => { if (pc.iceGatheringState === 'complete') { pc.removeEventListener('icegatheringstatechange', ck); res(); } }; pc.addEventListener('icegatheringstatechange', ck); setTimeout(res, 2500); });
      return o;
    }
    const enc = o => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/=+$/, '');
    const dec = s => JSON.parse(decodeURIComponent(escape(atob(s.trim()))));
    const copyBox = (code, hint) => { const ta = h('textarea', { readonly: 'true', style: 'width:100%;height:90px;font-size:9px;background:var(--bg2);color:var(--text);border:0;border-radius:10px;padding:8px' }); ta.value = code; return h('div', null, h('p', { class: 'hint-text', style: 'text-align:left' }, hint), ta, h('button', { class: 'btn primary', style: 'width:100%;margin-top:8px', onclick: () => { try { navigator.clipboard.writeText(code); api.toast('Код скопирован'); } catch (e) { ta.select(); } } }, '📋 Скопировать код')); };
    function hostFlow() {
      const n = makeNet(true, onNetMsg); net = n;
      n.pc.createOffer().then(o => n.pc.setLocalDescription(o)).then(() => n.gather()).then(() => {
        const ans = h('textarea', { placeholder: 'Вставьте ответный код друга', style: 'width:100%;height:70px;font-size:9px;background:var(--bg2);color:var(--text);border:0;border-radius:10px;padding:8px;margin-top:10px' });
        const m = api.modal({ title: '📡 Вы — хост', body: h('div', null, copyBox(enc({ s: n.pc.localDescription.sdp }), '1. Отправьте код другу (одна Wi-Fi или раздача). 2. Вставьте сюда его ответ.'), ans), buttons: [{ label: 'Отмена', onClick: menu }, { label: 'Подключить', cls: 'primary', onClick: () => { try { n.pc.setRemoteDescription({ type: 'answer', sdp: dec(ans.value).s }); api.toast('Соединяем…'); n.onOpen = () => { m.close(); startBattle('host'); }; } catch (e) { api.modal({ title: 'Неверный код', text: e.message, buttons: [{ label: 'ОК', onClick: hostFlow }] }); } } }] });
      });
    }
    function guestFlow() {
      const off = h('textarea', { placeholder: 'Вставьте код от хоста', style: 'width:100%;height:80px;font-size:9px;background:var(--bg2);color:var(--text);border:0;border-radius:10px;padding:8px' });
      const m = api.modal({ title: '📡 Подключение', text: 'Вставьте код хоста', body: off, buttons: [{ label: 'Отмена', onClick: menu }, { label: 'Далее', cls: 'primary', onClick: () => {
        try { const d = dec(off.value), n = makeNet(false, onNetMsg); net = n; let m2; n.onOpen = () => { if (m2) m2.close(); startBattle('guest'); };
          n.pc.setRemoteDescription({ type: 'offer', sdp: d.s }).then(() => n.pc.createAnswer()).then(x => n.pc.setLocalDescription(x)).then(() => n.gather()).then(() => { m2 = api.modal({ title: 'Ответный код', body: copyBox(enc({ s: n.pc.localDescription.sdp }), 'Отправьте код хосту и ждите боя.'), buttons: [{ label: 'Отмена', onClick: menu }] }); });
        } catch (e) { api.modal({ title: 'Неверный код', text: e.message, buttons: [{ label: 'ОК', onClick: guestFlow }] }); }
      } }] });
    }
    function onNetMsg(m) {
      if (m.t === 'place') { if (mode !== 'host') return; const c = byId(m.c); if (!c) return; eElixir = Math.max(0, eElixir - c.cost); place(m.c, W - m.x, H - m.y, 0); }
      else if (m.t === 'state' && mode === 'guest') {
        units = m.u.map(u => { const c = byId(u.id); return c && { c, id: u.id, side: 1 - u.side, x: W - u.x, y: H - u.y, hp: u.hp, max: u.max, face: !u.f, air: !!c.air, building: !!c.building, t: 0, freeze: 0, stun: 0, slow: 0, cd: 0 }; }).filter(Boolean);
        towers.forEach((t, i) => { const s = (i + 3) % 6; t.hp = m.tw[s]; t.active = m.ac[s]; }); time = m.time;
      } else if (m.t === 'end') { over = true; api.end({ win: m.win === 'guest' ? true : m.win === 'draw' ? undefined : false, title: m.win === 'guest' ? '🏆 Победа!' : m.win === 'draw' ? 'Ничья' : 'Поражение', reward: m.win === 'guest' ? 45 : m.win === 'draw' ? 10 : 0, again: 'В меню', onAgain: menu }); }
    }
    function netSync(dt) {
      if (!net || mode !== 'host') return; lastSync += dt; if (lastSync < .1) return; lastSync = 0;
      net.send({ t: 'state', u: units.map(u => ({ id: u.id, side: u.side, x: Math.round(u.x), y: Math.round(u.y), hp: Math.round(u.hp), max: u.max, f: u.face })), tw: towers.map(t => Math.round(t.hp)), ac: towers.map(t => t.active), time: Math.round(time) });
    }

    /* ===== экраны ===== */
    function menu() {
      const ar = arena();
      const body = h('div', { class: 'row', style: 'flex-direction:column' },
        h('div', { class: 'ca-arena cur' }, h('b', null, '🏟 ' + ar.nm), h('span', null, '🏆 ' + stats.trophies)),
        h('button', { class: 'btn primary', style: 'width:100%', onclick: () => { m.close(); api.difficulty('cardarena', d => { botDiff = d; deckBot = api.shuffle(C.filter(c => d > 0 || !c.spell).map(c => c.id)).slice(0, 8); startBattle('bot'); }); } }, '⚔️ Бой'),
        h('button', { class: 'btn', style: 'width:100%', onclick: () => { m.close(); friendMenu(); } }, '📡 Бой с другом (Wi-Fi)'),
        h('button', { class: 'btn', style: 'width:100%', onclick: () => { m.close(); deckScreen(); } }, '🃏 Колода · ' + C.length + ' карт'),
        h('button', { class: 'btn', style: 'width:100%', onclick: () => { m.close(); arenaScreen(); } }, '🏟 Арены · пропуск за монеты'));
      const m = api.modal({ title: '⚔️ Карточная Арена', text: `Побед: ${stats.w} · Поражений: ${stats.l}`, body, buttons: [{ label: 'В меню', onClick: api.exit }] });
    }
    let arenaModal = null;
    function arenaScreen() {
      if (arenaModal) arenaModal.close();
      const box = h('div', { style: 'display:flex;flex-direction:column;gap:6px;max-height:52vh;overflow:auto' });
      ARENAS.forEach((ar, i) => {
        const open = stats.trophies >= ar.tr || i <= arenaIdx, cur = i === arenaIdx;
        box.append(h('div', { class: 'ca-arena' + (cur ? ' cur' : '') + (open ? '' : ' lock'), onclick: () => {
          if (open) { arenaIdx = i; api.store('ca_arena', i); api.sound('tap'); arenaScreen(); return; }
          api.modal({ title: 'Пропустить арену?', text: `Открыть «${ar.nm}» сразу за ${SKIP} монет (обычно нужно ${ar.tr} трофеев).`, buttons: [{ label: 'Отмена', onClick: arenaScreen }, { label: 'Купить за ' + SKIP, cls: 'gold', onClick: () => { if (!api.spend(SKIP)) { arenaScreen(); return; } arenaIdx = i; stats.trophies = Math.max(stats.trophies, ar.tr); api.store('ca_arena', i); api.store('ca_st', stats); api.sound('win'); api.toast('Арена открыта!'); arenaScreen(); } }] });
        } }, h('b', null, (open ? '🏟 ' : '🔒 ') + ar.nm), h('span', null, open ? (cur ? 'выбрана' : 'открыта') : ar.tr + ' 🏆 или ' + SKIP + ' ●')));
      });
      arenaModal = api.modal({ title: '🏟 Арены', text: 'Трофеи: ' + stats.trophies + ' · арену можно открыть за монеты', body: box, buttons: [{ label: 'Назад', onClick: () => { arenaModal = null; menu(); } }] });
    }
    function friendMenu() {
      const body = h('div', { class: 'row', style: 'flex-direction:column' },
        h('button', { class: 'btn primary', style: 'width:100%', onclick: () => { m.close(); hostFlow(); } }, '🖥 Создать игру'),
        h('button', { class: 'btn', style: 'width:100%', onclick: () => { m.close(); guestFlow(); } }, '🔗 Подключиться'));
      const m = api.modal({ title: '📡 Игра по Wi-Fi', text: 'Оба телефона в одной сети (общий Wi-Fi или раздача). Интернет не нужен.', body, buttons: [{ label: 'Назад', onClick: menu }] });
    }
    function deckScreen() {
      const box = h('div', { style: 'display:grid;grid-template-columns:repeat(4,1fr);gap:5px;max-height:46vh;overflow:auto' });
      const info = h('p', { class: 'hint-text' });
      const upd = () => { info.textContent = 'Выбрано ' + deck.length + '/8 · средняя цена ' + (deck.reduce((s, id) => s + byId(id).cost, 0) / Math.max(1, deck.length)).toFixed(1); box.querySelectorAll('.ca-pick').forEach(el => el.style.borderColor = deck.includes(el.dataset.id) ? 'var(--green)' : 'transparent'); };
      C.forEach(c => box.append(h('div', { class: 'ca-pick', 'data-id': c.id, onclick: () => { const i = deck.indexOf(c.id); if (i >= 0) deck.splice(i, 1); else { if (deck.length >= 8) { api.toast('Уже 8 карт'); return; } deck.push(c.id); } api.store('ca_deck', deck); api.sound('tap'); upd(); } },
        art(c, 30), h('span', { style: 'font-size:8px;line-height:1.1' }, c.nm), h('b', { style: 'font-size:10px;color:' + RAR[c.rar] }, c.cost))));
      api.modal({ title: '🃏 Все ' + C.length + ' карт', body: h('div', null, info, box), buttons: [{ label: 'Готово', cls: 'primary', onClick: () => { if (deck.length !== 8) { deck = deck.concat(DEF_DECK.filter(x => !deck.includes(x))).slice(0, 8); api.store('ca_deck', deck); } menu(); } }] });
      upd();
    }
    function startBattle(m2) {
      mode = m2; screen.innerHTML = '';
      a = api.arcade(screen, { w: W, h: H, stats: [{ label: '⏱', value: '3:00' }, { btn: '☰', onClick: () => { if (net) { net.close(); net = null; } menu(); } }], hint: 'Выберите карту, затем тапните на своей половине',
        onDown: p => {
          if (over || selCard < 0 || !units) return;
          const c = byId(hand[selCard]);
          if (p.y < MID + RIVER && !c.spell && !c.anywhere) { api.toast('Только на своей половине'); return; }
          if (elixir < c.cost) return;
          elixir -= c.cost; place(hand[selCard], p.x, p.y, 1);
          if (net && mode === 'guest') net.send({ t: 'place', c: hand[selCard], x: Math.round(p.x), y: Math.round(p.y) });
          drawNext(selCard); selCard = -1; renderHand();
        },
        frame(dt, ctx) {
          if (!units || !towers) return;
          if (mode !== 'guest') { step(dt); netSync(dt); }
          else { fx.forEach(f => f.life -= dt); fx = fx.filter(f => f.life > 0); elixir = Math.min(10, elixir + .357 * dblElix * dt); hdr.set(0, Math.floor(Math.max(0, time) / 60) + ':' + String(Math.floor(Math.max(0, time) % 60)).padStart(2, '0')); }
          draw(ctx);
          elixEl.querySelector('.ca-elixir-fill').style.width = (elixir / 10 * 100) + '%';
          elixEl.querySelector('b').textContent = Math.floor(elixir);
          if (Math.floor(elixir) !== lastElx) { lastElx = Math.floor(elixir); renderHand(); }
        } });
      hdr = a.hdr; newBattle(); buildUI();
      window.__ca = () => ({ mode, units: units.length, elixir: Math.round(elixir), time: Math.round(time), cards: C.length, arena: arena().nm, trophies: stats.trophies });
    }
    hdr = { set: () => {} };
    this.unmount = () => { if (a) a.stop(); if (net) net.close(); };
    menu();
  }
});
