/* Карточная Арена — стратегия в духе Clash Royale: колода, эликсир, башни, бой с ботом или другом по Wi-Fi */
Games.register({
  id: 'cardarena', title: 'Карточная Арена', icon: '⚔️', cat: 'board', desc: 'Собери колоду, сноси башни. Бой с ботом или с другом по Wi-Fi', bestLabel: 'Побед',
  mount(screen, api) {
    const { h } = api;
    const W = 360, H = 620, LANE_L = 84, LANE_R = 276, MID = H / 2;
    const SHEET = new Image(); SHEET.src = 'assets/tinybattle.png'; const SC = 18;
    const tile = (ctx, i, x, y, s, flip) => { if (!SHEET.complete || !SHEET.naturalWidth) return; const sx = (i % SC) * 16, sy = Math.floor(i / SC) * 16; if (flip) { ctx.save(); ctx.translate(x + s, y); ctx.scale(-1, 1); ctx.drawImage(SHEET, sx, sy, 16, 16, 0, 0, s, s); ctx.restore(); } else ctx.drawImage(SHEET, sx, sy, 16, 16, x, y, s, s); };
    /* карты: sp — спрайт синей стороны (+18 = красная), hp, dmg, rate, spd, rng, air — летает, anti — бьёт воздух, n — количество */
    const CARDS = [
      { id: 'sold', name: 'Солдаты', cost: 3, sp: 142, hp: 120, dmg: 18, rate: 1.0, spd: 34, rng: 18, n: 3, anti: false },
      { id: 'shield', name: 'Щитоносцы', cost: 4, sp: 143, hp: 260, dmg: 22, rate: 1.2, spd: 26, rng: 18, n: 2, anti: false },
      { id: 'jeep', name: 'Джип', cost: 3, sp: 138, hp: 180, dmg: 26, rate: 0.8, spd: 58, rng: 20, n: 1, anti: true },
      { id: 'truck', name: 'Грузовик', cost: 4, sp: 131, hp: 420, dmg: 20, rate: 1.4, spd: 28, rng: 18, n: 1, anti: false },
      { id: 'tank', name: 'Танк', cost: 6, sp: 134, hp: 900, dmg: 70, rate: 1.6, spd: 20, rng: 26, n: 1, anti: false },
      { id: 'lighttank', name: 'Лёгкий танк', cost: 4, sp: 133, hp: 430, dmg: 42, rate: 1.3, spd: 30, rng: 24, n: 1, anti: false },
      { id: 'arty', name: 'Артиллерия', cost: 5, sp: 135, hp: 220, dmg: 60, rate: 2.0, spd: 18, rng: 120, n: 1, anti: false, splash: 30 },
      { id: 'plane', name: 'Штурмовик', cost: 4, sp: 136, hp: 200, dmg: 40, rate: 1.1, spd: 70, rng: 20, n: 1, air: true, anti: true },
      { id: 'heli', name: 'Вертолёт', cost: 5, sp: 137, hp: 300, dmg: 34, rate: 1.0, spd: 44, rng: 70, n: 1, air: true, anti: true },
      { id: 'aa', name: 'Зенитка', cost: 4, sp: 139, hp: 280, dmg: 46, rate: 0.9, spd: 0, rng: 110, n: 1, anti: true, building: true, life: 30 },
      { id: 'bunker', name: 'Бункер', cost: 5, sp: 140, hp: 700, dmg: 30, rate: 1.1, spd: 0, rng: 90, n: 1, anti: true, building: true, life: 35 },
      { id: 'swarm', name: 'Рой пехоты', cost: 5, sp: 142, hp: 90, dmg: 14, rate: 0.7, spd: 40, rng: 16, n: 6, anti: false },
      { id: 'rocket', name: 'Ракетчик', cost: 5, sp: 141, hp: 240, dmg: 55, rate: 1.8, spd: 24, rng: 100, n: 1, anti: true },
      { id: 'scout', name: 'Разведчик', cost: 2, sp: 132, hp: 130, dmg: 16, rate: 0.7, spd: 72, rng: 16, n: 1, anti: false },
      // заклинания
      { id: 'fire', name: 'Огненный шар', cost: 4, spell: 'fire', dmg: 160, radius: 52 },
      { id: 'bolt', name: 'Молния', cost: 5, spell: 'bolt', dmg: 300, radius: 34 },
      { id: 'freeze', name: 'Заморозка', cost: 3, spell: 'freeze', radius: 60, dur: 3.5 },
      { id: 'heal', name: 'Лечение', cost: 3, spell: 'heal', radius: 60, amount: 140 }
    ];
    const byId = id => CARDS.find(c => c.id === id);
    const DEF_DECK = ['sold', 'jeep', 'tank', 'arty', 'plane', 'aa', 'fire', 'scout'];
    let deck = api.load('ca_deck', DEF_DECK.slice()); if (!Array.isArray(deck) || deck.length !== 8) deck = DEF_DECK.slice();
    let stats = api.load('ca_st', { w: 0, l: 0 });

    /* ---------- состояние боя ---------- */
    let units, towers, elixir, eElixir, hand, nextCard, selCard, time, over, botDiff, mode, net = null, hdr, a, spells, lastSync = 0, seed = 1;
    const TOWER_DEF = () => [
      { side: 0, kind: 'king', x: W / 2, y: 60, hp: 1400, max: 1400, dmg: 50, rate: 1.2, rng: 100, active: false },
      { side: 0, kind: 'side', x: LANE_L, y: 140, hp: 800, max: 800, dmg: 40, rate: 1.0, rng: 110, active: true },
      { side: 0, kind: 'side', x: LANE_R, y: 140, hp: 800, max: 800, dmg: 40, rate: 1.0, rng: 110, active: true },
      { side: 1, kind: 'king', x: W / 2, y: H - 60, hp: 1400, max: 1400, dmg: 50, rate: 1.2, rng: 100, active: false },
      { side: 1, kind: 'side', x: LANE_L, y: H - 140, hp: 800, max: 800, dmg: 40, rate: 1.0, rng: 110, active: true },
      { side: 1, kind: 'side', x: LANE_R, y: H - 140, hp: 800, max: 800, dmg: 40, rate: 1.0, rng: 110, active: true }
    ];
    function newBattle() {
      units = []; spells = []; towers = TOWER_DEF(); elixir = 5; eElixir = 5; time = 180; over = false; selCard = -1;
      const d = api.shuffle(deck.slice()); hand = d.slice(0, 4); nextCard = d[4]; queue = d.slice(5).concat(d.slice(0, 4));
      hdr.set(0, '3:00');
    }
    let queue = [];
    function drawCard(i) { const old = hand[i]; hand[i] = nextCard; queue.push(old); nextCard = queue.shift(); }

    /* ---------- размещение ---------- */
    function place(cardId, x, y, side) {
      const c = byId(cardId); if (!c) return;
      if (c.spell) { spells.push({ kind: c.spell, x, y, r: c.radius, dmg: c.dmg, amount: c.amount, dur: c.dur, side, life: 0.6 }); applySpell(c, x, y, side); api.sound(c.spell === 'heal' ? 'good' : 'boom'); return; }
      const n = c.n || 1;
      for (let i = 0; i < n; i++) {
        const ox = (i - (n - 1) / 2) * 18, oy = (i % 2) * 14 - 7;
        units.push({ c, id: c.id, side, x: Math.max(20, Math.min(W - 20, x + ox)), y: Math.max(20, Math.min(H - 20, y + oy)), hp: c.hp, max: c.hp, cd: Math.random() * c.rate, air: !!c.air, anti: !!c.anti, building: !!c.building, life: c.life, freeze: 0, t: 0 });
      }
      api.sound('tap'); api.vibrate(6);
    }
    function applySpell(c, x, y, side) {
      if (c.spell === 'heal') { units.forEach(u => { if (u.side === side && Math.hypot(u.x - x, u.y - y) < c.radius) u.hp = Math.min(u.max, u.hp + c.amount); }); return; }
      if (c.spell === 'freeze') { units.forEach(u => { if (u.side !== side && Math.hypot(u.x - x, u.y - y) < c.radius) u.freeze = c.dur; }); return; }
      units.forEach(u => { if (u.side !== side && Math.hypot(u.x - x, u.y - y) < c.radius) damageUnit(u, c.dmg); });
      towers.forEach(t2 => { if (t2.side !== side && t2.hp > 0 && Math.hypot(t2.x - x, t2.y - y) < c.radius) damageTower(t2, c.dmg * 0.4); });
    }
    function damageUnit(u, d) { u.hp -= d; if (u.hp <= 0) { u.dead = true; spells.push({ kind: 'pop', x: u.x, y: u.y, life: 0.3, r: 14 }); } }
    function damageTower(t2, d) { t2.hp -= d; if (t2.hp <= 0) { t2.hp = 0; api.sound('boom'); api.vibrate(60); spells.push({ kind: 'fire', x: t2.x, y: t2.y, r: 40, life: 0.5 }); if (t2.kind === 'side') { const king = towers.find(k => k.side === t2.side && k.kind === 'king'); if (king) king.active = true; } if (t2.kind === 'king') endBattle(t2.side === 1 ? 0 : 1); } }

    /* ---------- ИИ ---------- */
    let botT = 0;
    function botTurn(dt) {
      botT -= dt; if (botT > 0) return;
      const think = [3.2, 2.0, 1.1][botDiff]; botT = think + Math.random() * think * 0.5;
      const options = deckBot.filter(id => byId(id).cost <= eElixir);
      if (!options.length) return;
      // выбор: на сложном — контрит самую опасную угрозу
      let pick = options[api.rand(0, options.length - 1)], lane = Math.random() < 0.5 ? LANE_L : LANE_R, y = 210;
      const threats = units.filter(u => u.side === 1 && u.y < MID + 120);
      if (botDiff >= 1 && threats.length) {
        const t2 = threats.reduce((b, u) => (u.hp > b.hp ? u : b));
        lane = t2.x < W / 2 ? LANE_L : LANE_R; y = Math.max(150, t2.y - 90);
        if (botDiff === 2) { const anti = options.filter(id => { const c = byId(id); return !c.spell && (t2.air ? c.anti : true); }); if (anti.length) pick = anti.reduce((b, id) => byId(id).cost > byId(b).cost ? id : b); const sp = options.find(id => byId(id).spell === 'fire' || byId(id).spell === 'bolt'); if (sp && threats.length >= 3) { place(sp, t2.x, t2.y, 0); eElixir -= byId(sp).cost; return; } }
      } else if (botDiff === 2) { const push = options.filter(id => !byId(id).spell).sort((x2, y2) => byId(y2).cost - byId(x2).cost); if (push.length && eElixir >= 7) pick = push[0]; }
      const c = byId(pick); if (c.cost > eElixir) return;
      if (c.spell) { const cluster = units.filter(u => u.side === 1); if (!cluster.length) return; const t2 = cluster[api.rand(0, cluster.length - 1)]; place(pick, t2.x, t2.y, 0); }
      else place(pick, lane + api.rand(-18, 18), y, 0);
      eElixir -= c.cost;
    }
    let deckBot = DEF_DECK.slice();

    /* ---------- симуляция ---------- */
    function step(dt) {
      if (over) return;
      time -= dt; if (time <= 0) { endBattle(null); return; }
      hdr.set(0, Math.floor(time / 60) + ':' + String(Math.floor(time % 60)).padStart(2, '0'));
      const rate = time < 60 ? 0.7 : 0.35; // ускорение эликсира в конце
      elixir = Math.min(10, elixir + rate * dt); if (mode !== 'guest') eElixir = Math.min(10, eElixir + rate * dt);
      if (mode === 'bot') botTurn(dt);
      // юниты
      for (const u of units) {
        if (u.dead) continue; u.t += dt; if (u.freeze > 0) { u.freeze -= dt; continue; }
        if (u.life != null) { u.life -= dt; if (u.life <= 0) { u.dead = true; continue; } }
        const dir = u.side === 1 ? -1 : 1;
        // ищем цель
        let tgt = null, td = Infinity;
        for (const o of units) { if (o.dead || o.side === u.side) continue; if (o.air && !u.anti) continue; const d = Math.hypot(o.x - u.x, o.y - u.y); if (d < td && d < Math.max(u.c.rng + 60, 150)) { td = d; tgt = o; } }
        if (!tgt) { for (const t2 of towers) { if (t2.side === u.side || t2.hp <= 0 || (t2.kind === 'king' && !t2.active && towers.some(s2 => s2.side === t2.side && s2.kind === 'side' && s2.hp > 0))) continue; const d = Math.hypot(t2.x - u.x, t2.y - u.y); if (d < td) { td = d; tgt = t2; } } }
        if (!tgt) continue;
        const rng = u.c.rng + (tgt.max > 600 ? 12 : 6);
        if (td > rng) {
          if (u.building) continue;
          let tx = tgt.x, ty = tgt.y;
          if (!u.air && Math.abs(u.y - MID) < 60 && Math.abs(u.x - LANE_L) > 40 && Math.abs(u.x - LANE_R) > 40) tx = u.x < W / 2 ? LANE_L : LANE_R; // мосты
          const ang = Math.atan2(ty - u.y, tx - u.x); u.x += Math.cos(ang) * u.c.spd * dt; u.y += Math.sin(ang) * u.c.spd * dt;
          u.face = Math.cos(ang) < 0;
        } else {
          u.cd -= dt; if (u.cd <= 0) { u.cd = u.c.rate;
            if (u.c.rng > 40) spells.push({ kind: 'shot', x: u.x, y: u.y, tx: tgt.x, ty: tgt.y, life: 0.25, side: u.side });
            if (tgt.max != null && tgt.kind) damageTower(tgt, u.c.dmg); else { damageUnit(tgt, u.c.dmg); if (u.c.splash) units.forEach(o => { if (!o.dead && o.side !== u.side && o !== tgt && Math.hypot(o.x - tgt.x, o.y - tgt.y) < u.c.splash) damageUnit(o, u.c.dmg * 0.6); }); }
            api.sound('select');
          }
        }
      }
      units = units.filter(u => !u.dead);
      // башни стреляют
      for (const t2 of towers) {
        if (t2.hp <= 0) continue; if (t2.kind === 'king' && !t2.active) continue;
        t2.cd = (t2.cd || 0) - dt; if (t2.cd > 0) continue;
        let tgt = null, td = t2.rng;
        for (const u of units) { if (u.side === t2.side || u.dead) continue; const d = Math.hypot(u.x - t2.x, u.y - t2.y); if (d < td) { td = d; tgt = u; } }
        if (tgt) { t2.cd = t2.rate; damageUnit(tgt, t2.dmg); spells.push({ kind: 'shot', x: t2.x, y: t2.y, tx: tgt.x, ty: tgt.y, life: 0.2, side: t2.side }); }
      }
      spells.forEach(s => s.life -= dt); spells = spells.filter(s => s.life > 0);
    }
    function endBattle(winner) {
      if (over) return; over = true;
      const my = towers.filter(t2 => t2.side === 0 && t2.hp <= 0).length, en = towers.filter(t2 => t2.side === 1 && t2.hp <= 0).length;
      let win = winner != null ? winner === 1 : my > en ? true : my < en ? false : null;
      if (win === true) { stats.w++; api.store('ca_st', stats); api.best('cardarena', stats.w); api.end({ title: '🏆 Победа!', reward: 30 + my * 10, text: 'Снесено башен: ' + my, again: 'Ещё бой', onAgain: menu }); }
      else if (win === false) { stats.l++; api.store('ca_st', stats); api.end({ win: false, title: 'Поражение', text: 'Соперник снёс ' + en + ' башен', again: 'Ещё бой', onAgain: menu }); }
      else api.end({ title: 'Ничья', reward: 10, again: 'Ещё бой', onAgain: menu });
      if (net && mode === 'host') net.send({ t: 'end', win: win === true ? 'host' : win === false ? 'guest' : 'draw' });
    }

    /* ---------- отрисовка ---------- */
    function draw(ctx) {
      ctx.imageSmoothingEnabled = false;
      // поле
      ctx.fillStyle = '#3f6212'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#4d7c0f'; for (let y = 0; y < H; y += 32) for (let x = 0; x < W; x += 32) if ((x / 32 + y / 32) % 2) ctx.fillRect(x, y, 32, 32);
      // река
      ctx.fillStyle = '#0ea5e9'; ctx.fillRect(0, MID - 22, W, 44); ctx.fillStyle = 'rgba(255,255,255,.25)'; for (let i = 0; i < 12; i++) ctx.fillRect((i * 34 + (performance.now() / 40) % 34), MID - 14 + (i % 3) * 9, 16, 3);
      // мосты
      ctx.fillStyle = '#92400e'; [LANE_L, LANE_R].forEach(x => { ctx.fillRect(x - 26, MID - 26, 52, 52); ctx.fillStyle = '#78350f'; for (let i = 0; i < 5; i++) ctx.fillRect(x - 26, MID - 26 + i * 11, 52, 3); ctx.fillStyle = '#92400e'; });
      // зона размещения
      ctx.fillStyle = 'rgba(34,211,238,.07)'; ctx.fillRect(0, MID + 22, W, H - MID - 22);
      // башни
      towers.forEach(t2 => {
        if (t2.hp <= 0) { tile(ctx, t2.side === 0 ? 62 : 44, t2.x - 22, t2.y - 22, 44); return; }
        const sp = t2.kind === 'king' ? (t2.side === 0 ? 68 : 50) : (t2.side === 0 ? 67 : 49);
        tile(ctx, sp, t2.x - (t2.kind === 'king' ? 28 : 22), t2.y - (t2.kind === 'king' ? 28 : 22), t2.kind === 'king' ? 56 : 44);
        const w2 = t2.kind === 'king' ? 56 : 44; ctx.fillStyle = '#111'; ctx.fillRect(t2.x - w2 / 2, t2.y - w2 / 2 - 9, w2, 6);
        ctx.fillStyle = t2.side === 1 ? '#22d3ee' : '#f87171'; ctx.fillRect(t2.x - w2 / 2, t2.y - w2 / 2 - 9, w2 * t2.hp / t2.max, 6);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(Math.ceil(t2.hp), t2.x, t2.y - w2 / 2 - 12);
      });
      // юниты
      units.forEach(u => {
        const s = u.c.n > 2 ? 22 : 28; const sp = u.c.sp + (u.side === 0 ? 18 : 0);
        ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(u.x, u.y + s / 2 - 2, s / 3, s / 7, 0, 0, 7); ctx.fill();
        const bob = u.air ? Math.sin(u.t * 6) * 3 : 0;
        tile(ctx, sp, u.x - s / 2, u.y - s / 2 + bob, s, u.face);
        if (u.hp < u.max) { ctx.fillStyle = '#111'; ctx.fillRect(u.x - 14, u.y - s / 2 - 7, 28, 4); ctx.fillStyle = u.side === 1 ? '#22d3ee' : '#f87171'; ctx.fillRect(u.x - 14, u.y - s / 2 - 7, 28 * Math.max(0, u.hp) / u.max, 4); }
        if (u.freeze > 0) { ctx.fillStyle = 'rgba(147,197,253,.5)'; ctx.beginPath(); ctx.arc(u.x, u.y, s / 2, 0, 7); ctx.fill(); }
      });
      // эффекты
      spells.forEach(s => {
        if (s.kind === 'shot') { ctx.strokeStyle = s.side === 1 ? 'rgba(34,211,238,.9)' : 'rgba(248,113,113,.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.tx, s.ty); ctx.stroke(); }
        else if (s.kind === 'fire') { const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r); g.addColorStop(0, 'rgba(255,220,120,' + s.life * 2 + ')'); g.addColorStop(1, 'rgba(239,68,68,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill(); }
        else if (s.kind === 'bolt') { ctx.strokeStyle = 'rgba(165,243,252,' + s.life * 2 + ')'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(s.x, 0); ctx.lineTo(s.x + 10, s.y / 2); ctx.lineTo(s.x - 8, s.y * 0.75); ctx.lineTo(s.x, s.y); ctx.stroke(); ctx.fillStyle = 'rgba(165,243,252,' + s.life + ')'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill(); }
        else if (s.kind === 'freeze') { ctx.fillStyle = 'rgba(147,197,253,' + s.life + ')'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill(); }
        else if (s.kind === 'heal') { ctx.fillStyle = 'rgba(52,211,153,' + s.life + ')'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill(); }
        else if (s.kind === 'pop') { ctx.fillStyle = 'rgba(255,255,255,' + s.life * 3 + ')'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r * (1 - s.life), 0, 7); ctx.fill(); }
      });
      // зона при выборе карты
      if (selCard >= 0) { ctx.fillStyle = 'rgba(34,211,238,.13)'; ctx.fillRect(0, MID + 22, W, H - MID - 22); ctx.strokeStyle = 'rgba(34,211,238,.6)'; ctx.setLineDash([8, 8]); ctx.lineWidth = 2; ctx.strokeRect(2, MID + 24, W - 4, H - MID - 28); ctx.setLineDash([]); }
    }

    /* ---------- интерфейс боя ---------- */
    let handEl, elixEl;
    function buildUI() {
      const bar = h('div', { class: 'ca-bar' });
      elixEl = h('div', { class: 'ca-elixir' }, h('div', { class: 'ca-elixir-fill' }), h('b', null, '0'));
      handEl = h('div', { class: 'ca-hand' });
      bar.append(elixEl, handEl);
      screen.append(bar);
      renderHand();
    }
    function renderHand() {
      handEl.innerHTML = '';
      handEl.append(h('div', { class: 'ca-next' }, h('span', { style: 'font-size:9px;color:var(--muted)' }, 'Далее'), cardMini(nextCard)));
      hand.forEach((id, i) => { const c = byId(id); const can = elixir >= c.cost;
        handEl.append(h('div', { class: 'ca-card' + (selCard === i ? ' sel' : '') + (can ? '' : ' off'), onclick: () => { if (!can) { api.toast('Мало эликсира'); return; } selCard = selCard === i ? -1 : i; renderHand(); api.sound('tap'); } }, cardArt(c), h('div', { class: 'ca-cost' }, c.cost)));
      });
    }
    function cardMini(id) { const c = byId(id); const d = h('div', { class: 'ca-mini' }, cardArt(c, 22)); return d; }
    function cardArt(c, size) {
      const s = size || 34;
      if (c.spell) return h('div', { class: 'ca-art', style: 'font-size:' + (s - 6) + 'px' }, { fire: '🔥', bolt: '⚡', freeze: '❄️', heal: '💚' }[c.spell]);
      const cv = h('canvas', { width: s, height: s, class: 'ca-art' }); const cx = cv.getContext('2d'); cx.imageSmoothingEnabled = false;
      const paint = () => tile(cx, c.sp + 18, 0, 0, s);
      if (SHEET.complete) paint(); else SHEET.addEventListener('load', paint, { once: true });
      return cv;
    }

    /* ---------- сеть (WebRTC, локальная сеть / раздача) ---------- */
    function makeNet(isHost, onMsg) {
      const pc = new RTCPeerConnection({ iceServers: [] });
      let ch;
      const obj = { pc, send: m => { try { if (ch && ch.readyState === 'open') ch.send(JSON.stringify(m)); } catch (e) {} }, close: () => { try { pc.close(); } catch (e) {} } };
      const setup = c => { ch = c; c.onmessage = e => { try { onMsg(JSON.parse(e.data)); } catch (err) {} }; c.onopen = () => obj.onOpen && obj.onOpen(); c.onclose = () => obj.onClose && obj.onClose(); };
      if (isHost) setup(pc.createDataChannel('game', { ordered: true })); else pc.ondatachannel = e => setup(e.channel);
      obj.gather = () => new Promise(res => { if (pc.iceGatheringState === 'complete') return res(); const check = () => { if (pc.iceGatheringState === 'complete') { pc.removeEventListener('icegatheringstatechange', check); res(); } }; pc.addEventListener('icegatheringstatechange', check); setTimeout(res, 2500); });
      return obj;
    }
    const enc = o => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/=+$/, '');
    const dec = s => JSON.parse(decodeURIComponent(escape(atob(s.trim()))));
    function copyBox(code, title, hint) {
      const ta = h('textarea', { readonly: 'true', style: 'width:100%;height:90px;font-size:9px;background:var(--bg2);color:var(--text);border:0;border-radius:10px;padding:8px' }); ta.value = code;
      const btn = h('button', { class: 'btn primary', style: 'width:100%;margin-top:8px', onclick: () => { try { navigator.clipboard.writeText(code); api.toast('Код скопирован'); } catch (e) { ta.select(); } } }, '📋 Скопировать код');
      return h('div', null, h('p', { class: 'hint-text', style: 'text-align:left' }, hint), ta, btn);
    }
    function hostFlow() {
      const n = makeNet(true, onNetMsg); net = n;
      n.pc.createOffer().then(o => n.pc.setLocalDescription(o)).then(() => n.gather()).then(() => {
        const code = enc({ t: 'o', s: n.pc.localDescription.sdp });
        const answerTa = h('textarea', { placeholder: 'Вставьте ответный код друга', style: 'width:100%;height:70px;font-size:9px;background:var(--bg2);color:var(--text);border:0;border-radius:10px;padding:8px;margin-top:10px' });
        const body = h('div', null, copyBox(code, 'Код', '1. Скопируйте код и отправьте другу (оба телефона в одной Wi-Fi или раздаче). 2. Вставьте сюда его ответный код.'), answerTa);
        const m = api.modal({ title: '📡 Вы — хост', body, buttons: [{ label: 'Отмена', onClick: menu }, { label: 'Подключить', cls: 'primary', onClick: () => { try { const d = dec(answerTa.value); n.pc.setRemoteDescription({ type: 'answer', sdp: d.s }); api.toast('Соединяем…'); n.onOpen = () => { m.close(); startBattle('host'); }; } catch (e) { api.modal({ title: 'Неверный код', text: e.message, buttons: [{ label: 'ОК', onClick: hostFlow }] }); } } }] });
      });
    }
    function guestFlow() {
      const offerTa = h('textarea', { placeholder: 'Вставьте код от хоста', style: 'width:100%;height:80px;font-size:9px;background:var(--bg2);color:var(--text);border:0;border-radius:10px;padding:8px' });
      const m = api.modal({ title: '📡 Подключение к другу', text: 'Вставьте код, который прислал хост', body: offerTa, buttons: [{ label: 'Отмена', onClick: menu }, { label: 'Далее', cls: 'primary', onClick: () => {
        try {
          const d = dec(offerTa.value); const n = makeNet(false, onNetMsg); net = n;
          n.onOpen = () => { m2 && m2.close(); startBattle('guest'); };
          let m2;
          n.pc.setRemoteDescription({ type: 'offer', sdp: d.s }).then(() => n.pc.createAnswer()).then(ans => n.pc.setLocalDescription(ans)).then(() => n.gather()).then(() => {
            const code = enc({ t: 'a', s: n.pc.localDescription.sdp });
            m2 = api.modal({ title: 'Ответный код', body: copyBox(code, 'Ответ', 'Отправьте этот код хосту и ждите начала боя.'), buttons: [{ label: 'Отмена', onClick: menu }] });
          });
        } catch (e) { api.modal({ title: 'Неверный код', text: e.message, buttons: [{ label: 'ОК', onClick: guestFlow }] }); }
      } }] });
    }
    function onNetMsg(m) {
      if (m.t === 'place') { if (mode !== 'host') return; const c = byId(m.c); if (!c) return; eElixir = Math.max(0, eElixir - c.cost); place(m.c, W - m.x, H - m.y, 0); }
      else if (m.t === 'state' && mode === 'guest') {
        // хост шлёт своё видение поля — зеркалим для гостя
        units = m.u.map(u => ({ c: byId(u.id), id: u.id, side: 1 - u.side, x: W - u.x, y: H - u.y, hp: u.hp, max: u.max, face: !u.f, air: u.air, t: 0, freeze: 0, cd: 0 })).filter(u => u.c);
        towers.forEach((t2, i) => { const src = (i + 3) % 6; t2.hp = m.tw[src]; t2.active = m.ac[src]; });
        time = m.time;
        if (m.tw.every((hp, i) => i % 3 !== 0 || true) && m.over) endBattle(m.win == null ? null : 1 - m.win);
      } else if (m.t === 'end') { over = true; api.end({ title: m.win === 'guest' ? '🏆 Победа!' : m.win === 'draw' ? 'Ничья' : 'Поражение', reward: m.win === 'guest' ? 40 : m.win === 'draw' ? 10 : 0, win: m.win === 'guest' ? true : m.win === 'draw' ? undefined : false, again: 'В меню', onAgain: menu }); }
    }
    function netSync(dt) {
      if (!net || mode !== 'host') return; lastSync += dt; if (lastSync < 0.1) return; lastSync = 0;
      net.send({ t: 'state', u: units.map(u => ({ id: u.id, side: u.side, x: Math.round(u.x), y: Math.round(u.y), hp: Math.round(u.hp), max: u.max, f: u.face, air: u.air })), tw: towers.map(t2 => Math.round(t2.hp)), ac: towers.map(t2 => t2.active), time: Math.round(time) });
    }

    /* ---------- экраны ---------- */
    function menu() {
      if (a) a.stop2 && a.stop2();
      const body = h('div', { class: 'row', style: 'flex-direction:column' },
        h('button', { class: 'btn primary', style: 'width:100%', onclick: () => { m.close(); api.difficulty('cardarena', d => { botDiff = d; deckBot = api.shuffle(CARDS.filter(c => !c.spell || d > 0).map(c => c.id)).slice(0, 8); startBattle('bot'); }); } }, '🤖 Бой с ботом'),
        h('button', { class: 'btn', style: 'width:100%', onclick: () => { m.close(); friendMenu(); } }, '📡 Бой с другом (Wi-Fi)'),
        h('button', { class: 'btn', style: 'width:100%', onclick: () => { m.close(); deckScreen(); } }, '🃏 Колода (8 карт)'));
      const m = api.modal({ title: '⚔️ Карточная Арена', text: `Побед: ${stats.w} · Поражений: ${stats.l}`, body, buttons: [{ label: 'В меню', onClick: api.exit }] });
    }
    function friendMenu() {
      const body = h('div', { class: 'row', style: 'flex-direction:column' },
        h('button', { class: 'btn primary', style: 'width:100%', onclick: () => { m.close(); hostFlow(); } }, '🖥 Создать игру (хост)'),
        h('button', { class: 'btn', style: 'width:100%', onclick: () => { m.close(); guestFlow(); } }, '🔗 Подключиться к другу'));
      const m = api.modal({ title: '📡 Игра по Wi-Fi', text: 'Оба телефона должны быть в одной сети: общий Wi-Fi или раздача с одного из них. Интернет не нужен.', body, buttons: [{ label: 'Назад', onClick: menu }] });
    }
    function deckScreen() {
      const box = h('div', { style: 'display:grid;grid-template-columns:repeat(4,1fr);gap:6px;max-height:52vh;overflow:auto' });
      const info = h('p', { class: 'hint-text' });
      function upd() { info.textContent = 'Выбрано ' + deck.length + '/8 · средняя цена ' + (deck.reduce((s, id) => s + byId(id).cost, 0) / Math.max(1, deck.length)).toFixed(1); box.querySelectorAll('.ca-pick').forEach(el => el.classList.toggle('on', deck.includes(el.dataset.id))); }
      CARDS.forEach(c => box.append(h('div', { class: 'ca-pick', 'data-id': c.id, onclick: () => { const i = deck.indexOf(c.id); if (i >= 0) deck.splice(i, 1); else { if (deck.length >= 8) { api.toast('Уже 8 карт'); return; } deck.push(c.id); } api.store('ca_deck', deck); api.sound('tap'); upd(); } }, cardArt(c, 30), h('span', { style: 'font-size:9px' }, c.name), h('b', { style: 'font-size:10px;color:#c084fc' }, c.cost))));
      const m = api.modal({ title: '🃏 Колода', body: h('div', null, info, box), buttons: [{ label: 'Готово', cls: 'primary', onClick: () => { if (deck.length !== 8) { deck = deck.concat(DEF_DECK.filter(x => !deck.includes(x))).slice(0, 8); api.store('ca_deck', deck); } menu(); } }] });
      upd();
    }
    function startBattle(m2) {
      mode = m2; screen.innerHTML = '';
      a = api.arcade(screen, { w: W, h: H, stats: [{ label: '⏱', value: '3:00' }, { btn: '☰', onClick: () => { if (net) { net.close(); net = null; } menu(); } }], hint: 'Выберите карту, затем тапните на своей половине поля',
        onDown: p => {
          if (over || selCard < 0) return;
          if (p.y < MID + 22) { api.toast('Только на своей половине'); return; }
          const c = byId(hand[selCard]); if (elixir < c.cost) return;
          elixir -= c.cost; place(hand[selCard], p.x, p.y, 1);
          if (net && mode === 'guest') net.send({ t: 'place', c: hand[selCard], x: Math.round(p.x), y: Math.round(p.y) });
          drawCard(selCard); selCard = -1; renderHand();
        },
        frame(dt, ctx) {
          if (!units || !towers) return;
          if (mode !== 'guest') { step(dt); netSync(dt); } else { spells.forEach(s => s.life -= dt); spells = spells.filter(s => s.life > 0); elixir = Math.min(10, elixir + (time < 60 ? 0.7 : 0.35) * dt); hdr.set(0, Math.floor(Math.max(0, time) / 60) + ':' + String(Math.floor(Math.max(0, time) % 60)).padStart(2, '0')); }
          draw(ctx);
          const f = elixEl.querySelector('.ca-elixir-fill'); f.style.width = (elixir / 10 * 100) + '%'; elixEl.querySelector('b').textContent = Math.floor(elixir);
          if (Math.floor(elixir) !== lastElx) { lastElx = Math.floor(elixir); renderHand(); }
        } });
      hdr = a.hdr; newBattle(); buildUI(); window.__ca = () => ({ mode, units: units.length, u: units.map(u => ({ id: u.id, s: u.side, x: Math.round(u.x), y: Math.round(u.y) })), elixir: Math.round(elixir), time: Math.round(time) });
    }
    let lastElx = -1;
    hdr = { set: () => {} };
    this.unmount = () => { if (a) a.stop(); if (net) net.close(); };
    menu();
  }
});
