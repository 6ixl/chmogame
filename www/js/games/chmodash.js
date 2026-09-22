/* Неон Дэш — платформер в духе Geometry Dash: 7 режимов (куб, корабль, шар, НЛО, волна, робот, паук) */
Games.register({
  id: 'chmodash', title: 'Неон Дэш', icon: '🟧', cat: 'arcade', desc: 'Geometry Dash: 14 уровней, 7 режимов — куб, корабль, шар, НЛО, волна, робот, паук', progress: api => 'Пройдено ' + Object.keys(api.load('dash_done', {})).filter(k => !k.startsWith('r')).length + '/14',
  mount(screen, api) {
    const { h } = api;
    const W = 400, H = 300, GY = 240, CY = 60, S = 30;
    const MODES = ['cube', 'ship', 'ball', 'ufo', 'wave', 'robot', 'spider'];
    const MODE_RU = { cube: 'Куб', ship: 'Корабль', ball: 'Шар', ufo: 'НЛО', wave: 'Волна', robot: 'Робот', spider: 'Паук' };
    const MODE_IC = { cube: '⬛', ship: '🚀', ball: '⚪', ufo: '🛸', wave: '〰', robot: '🤖', spider: '🕷' };
    const LEVELS = [
      { n: 'Первый шаг', spd: 220, len: 60, seed: 11, hue: 200, d: 0.4, modes: ['cube'] },
      { n: 'Ступени', spd: 240, len: 70, seed: 22, hue: 280, d: 0.55, modes: ['cube'] },
      { n: 'Полёт', spd: 250, len: 80, seed: 33, hue: 140, d: 0.6, modes: ['cube', 'ship'] },
      { n: 'Переворот', spd: 260, len: 85, seed: 44, hue: 30, d: 0.65, modes: ['cube'], grav: true },
      { n: 'Шарик', spd: 260, len: 90, seed: 55, hue: 340, d: 0.7, modes: ['cube', 'ball'], grav: true },
      { n: 'Тарелка', spd: 270, len: 95, seed: 66, hue: 220, d: 0.75, modes: ['cube', 'ufo'] },
      { n: 'Волна', spd: 280, len: 100, seed: 77, hue: 60, d: 0.8, modes: ['cube', 'wave'] },
      { n: 'Робот', spd: 290, len: 105, seed: 88, hue: 180, d: 0.85, modes: ['cube', 'robot'], grav: true },
      { n: 'Паутина', spd: 300, len: 110, seed: 99, hue: 0, d: 0.9, modes: ['cube', 'spider'], grav: true },
      { n: 'Смена формы', spd: 310, len: 120, seed: 111, hue: 260, d: 0.95, modes: ['cube', 'ship', 'ball', 'ufo'], grav: true },
      { n: 'Гроза', spd: 330, len: 130, seed: 123, hue: 310, d: 1.0, modes: ['cube', 'wave', 'robot', 'ship'], grav: true },
      { n: 'Хаос', spd: 340, len: 140, seed: 222, hue: 100, d: 1.1, modes: MODES, grav: true },
      { n: 'Демон', spd: 360, len: 150, seed: 333, hue: 320, d: 1.2, modes: MODES, grav: true },
      { n: 'Финал', spd: 380, len: 170, seed: 999, hue: 45, d: 1.3, modes: MODES, grav: true }
    ];
    let done = api.load('dash_done', {}), bestPct = api.load('dash_best', {}), attempts = api.load('dash_att', {});
    let L, li, objs, px, py, vy, grav, mode, alive, camX, len, attempt, rot, particles, dead, holding, tapped, t = 0, finished, hdr, trail;

    function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let x = Math.imul(s ^ (s >>> 15), 1 | s); x ^= x + Math.imul(x ^ (x >>> 7), 61 | x); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
    function gen(lv) {
      const r = rng(lv.seed); objs = []; let x = 500; len = lv.len * lv.spd; let m = 'cube', gv = 1;
      const spike = (x, y, n, flip) => { for (let i = 0; i < n; i++) objs.push({ t: 'spike', x: x + i * S, y, flip }); };
      const block = (x, y, w, hh) => objs.push({ t: 'block', x, y, w: w * S, h: hh * S });
      const corridor = (x, gapH, cy2) => { block(x, 0, 2, Math.max(0, Math.floor((cy2 - gapH / 2 - CY) / S)) + 2); block(x, cy2 + gapH / 2, 2, 10); };
      const other = () => { const pool = lv.modes.filter(z => z !== m); return pool.length ? pool[Math.floor(r() * pool.length)] : 'cube'; };
      while (x < len - 700) {
        const roll = r(); const gap = 120 + r() * 150 * (1.4 - lv.d);
        if (m === 'ship' || m === 'ufo' || m === 'wave') {
          const gapH = (m === 'wave' ? 130 : 120) - lv.d * 18; const cy2 = CY + 40 + r() * (GY - CY - 90);
          corridor(x, gapH, cy2); if (r() < 0.35) objs.push({ t: 'spike', x: x + 2 * S, y: cy2 + gapH / 2 - S, flip: false });
          if (r() < 0.25) objs.push({ t: 'coin', x: x + 70, y: cy2 });
          x += 2 * S + (m === 'wave' ? 95 : 115) + r() * 60;
          if (r() < 0.14 && x > 1600) { const nm = other(); objs.push({ t: 'portal', x, kind: nm }); m = nm; if (m === 'cube' || m === 'robot') gv = 1; x += 240; }
          continue;
        }
        // наземные режимы: cube, ball, robot, spider
        if (roll < 0.34) { spike(x, gv > 0 ? GY - S : CY, 1 + Math.floor(r() * (lv.d * 3)), gv < 0); x += S * 3 + gap; }
        else if (roll < 0.52) { const hgt = 1 + Math.floor(r() * 2); if (gv > 0) block(x, GY - hgt * S, 2 + Math.floor(r() * 3), hgt); else block(x, CY, 2 + Math.floor(r() * 3), hgt); x += 5 * S + gap; }
        else if (roll < 0.66) { const steps = 2 + Math.floor(r() * 2); for (let i = 0; i < steps; i++) { if (gv > 0) block(x + i * 2 * S, GY - (i + 1) * S, 2, i + 1); else block(x + i * 2 * S, CY, 2, i + 1); } x += steps * 2 * S; spike(x, gv > 0 ? GY - S : CY, 1, gv < 0); x += S + gap; }
        else if (roll < 0.78) { const yy = gv > 0 ? GY - S * (2 + Math.floor(r() * 2)) : CY + S * (1 + Math.floor(r() * 2)); block(x, yy, 3, 1); spike(x, gv > 0 ? GY - S : CY, 3 + Math.floor(r() * 2), gv < 0); x += 5 * S + gap; }
        else if (roll < 0.86 && lv.grav && x > 1200) { objs.push({ t: 'portal', x, kind: 'grav' }); gv *= -1; x += 250; }
        else if (roll < 0.94 && x > 1400 && lv.modes.length > 1) { const nm = other(); objs.push({ t: 'portal', x, kind: nm }); m = nm; x += 230; }
        else { objs.push({ t: 'coin', x, y: gv > 0 ? GY - 70 : CY + 70 }); x += 80 + gap; }
      }
      if (m !== 'cube') objs.push({ t: 'portal', x: len - 620, kind: 'cube' }); if (gv < 0) objs.push({ t: 'portal', x: len - 560, kind: 'grav' });
      objs.push({ t: 'finish', x: len - 120 });
    }
    function start(i) { li = i; L = LEVELS[i]; gen(L); attempt = (attempts[i] || 0) + 1; attempts[i] = attempt; api.store('dash_att', attempts); reset(); hdr.set(0, L.n); }
    function reset() { px = 100; py = GY - S; vy = 0; grav = 1; mode = 'cube'; alive = true; camX = 0; rot = 0; particles = []; trail = []; dead = 0; finished = false; hdr.set(1, attempt); }
    function die() { if (!alive) return; alive = false; dead = 0.7; api.sound('boom'); api.vibrate(60); for (let i = 0; i < 22; i++) particles.push({ x: px + S / 2, y: py + S / 2, vx: (Math.random() - .5) * 520, vy: (Math.random() - .5) * 520, life: 0.7 }); const pct = Math.min(99, Math.floor(px / len * 100)); if ((bestPct[li] || 0) < pct) { bestPct[li] = pct; api.store('dash_best', bestPct); } }
    function finish() { finished = true; alive = false; const first = !done[li]; done[li] = true; bestPct[li] = 100; api.store('dash_done', done); api.store('dash_best', bestPct); api.end({ title: 'Уровень «' + L.n + '» пройден!', reward: first ? 20 + li * 5 : 5, text: 'Попыток: ' + attempt, again: li < LEVELS.length - 1 ? 'Следующий' : 'Меню', onAgain: () => li < LEVELS.length - 1 ? start(li + 1) : menu() }); }

    const HB = { cube: 13, ball: 13, robot: 13, spider: 12, ship: 11, ufo: 12, wave: 7 };
    function update(dt) {
      if (finished) return;
      if (!alive) { dead -= dt; particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }); if (dead <= 0) { attempt++; attempts[li] = attempt; api.store('dash_att', attempts); reset(); } return; }
      px += L.spd * dt; camX = px - 120;
      const prevY = py; const air = mode === 'ship' || mode === 'ufo' || mode === 'wave';
      // физика по режимам
      if (mode === 'ship') { vy += grav * (holding ? -1500 : 1450) * dt; vy = Math.max(-400, Math.min(400, vy)); }
      else if (mode === 'ufo') { vy += grav * 2000 * dt; if (tapped) { vy = -grav * 560; api.sound('jump'); } vy = Math.max(-620, Math.min(620, vy)); }
      else if (mode === 'wave') { vy = (holding ? -1 : 1) * grav * L.spd * 0.95; }
      else vy += grav * 2600 * dt;
      py += vy * dt;
      // вращение/анимация
      if (mode === 'cube' || mode === 'robot') rot += grav * 380 * dt * (Math.abs(vy) > 10 ? 1 : 0);
      else if (mode === 'ball') rot += 420 * dt;
      else rot = 0;
      // границы
      if (py + S > GY) { py = GY - S; if (!air) vy = 0; else vy = 0; }
      if (py < CY) { py = CY; vy = 0; }
      let grounded = (grav > 0 && py + S >= GY - 0.5) || (grav < 0 && py <= CY + 0.5);
      let ceil = false;
      for (const o of objs) {
        if (o.x > camX + W + 80 || (o.x + (o.w || S)) < camX - 80) continue;
        if (o.t === 'block') {
          const ox2 = o.x + o.w, oy2 = o.y + o.h; const hb = HB[mode];
          if (px + S - (S - hb) / 2 > o.x && px + (S - hb) / 2 < ox2 && py + S > o.y + 1 && py < oy2 - 1) {
            if (prevY + S <= o.y + 8 && vy >= 0) { py = o.y - S; vy = 0; if (grav > 0) grounded = true; else ceil = true; }
            else if (prevY >= oy2 - 8 && vy <= 0) { py = oy2; vy = 0; if (grav < 0) grounded = true; else ceil = true; }
            else { die(); return; }
          }
        } else if (o.t === 'spike') { const cy2 = o.flip ? o.y + S * 0.42 : o.y + S * 0.58; if (px + S - 9 > o.x + 5 && px + 9 < o.x + S - 5 && Math.abs(py + S / 2 - cy2) < S * 0.5) { die(); return; } }
        else if (o.t === 'portal' && !o.used && px + S / 2 > o.x && px + S / 2 < o.x + 44) {
          o.used = true; api.sound('good'); api.vibrate(10);
          if (o.kind === 'grav') { grav *= -1; vy = 0; } else { mode = o.kind; vy = 0; if (mode === 'cube' || mode === 'robot' || mode === 'ball' || mode === 'spider') { /* сохраняем гравитацию */ } }
        }
        else if (o.t === 'coin' && !o.got && Math.hypot(o.x - px - S / 2, o.y - py - S / 2) < 34) { o.got = true; api.sound('coin'); api.addCoins(1); for (let i = 0; i < 6; i++) particles.push({ x: o.x, y: o.y, vx: (Math.random() - .5) * 200, vy: (Math.random() - .5) * 200, life: 0.4, gold: true }); }
        else if (o.t === 'finish' && px > o.x) { finish(); return; }
      }
      // управление наземными режимами
      if (mode === 'cube' && grounded && holding) { vy = -grav * 760; grounded = false; api.sound('jump'); }
      else if (mode === 'robot' && grounded && tapped) { vy = -grav * 560; robotBoost = 0.22; api.sound('jump'); }
      else if (mode === 'robot' && robotBoost > 0 && holding) { vy -= grav * 1500 * dt; robotBoost -= dt; }
      else if (mode === 'ball' && grounded && tapped) { grav *= -1; vy = 0; api.sound('jump'); }
      else if (mode === 'spider' && tapped) { // телепорт к противоположной поверхности
        let target = grav > 0 ? CY : GY - S;
        for (const o of objs) if (o.t === 'block' && px + S > o.x && px < o.x + o.w) { if (grav > 0 && o.y + o.h <= py) target = Math.max(target, o.y + o.h); else if (grav < 0 && o.y >= py + S) target = Math.min(target, o.y - S); }
        py = target; grav *= -1; vy = 0; api.sound('jump'); api.vibrate(8); for (let i = 0; i < 8; i++) particles.push({ x: px + S / 2, y: py + S / 2, vx: (Math.random() - .5) * 150, vy: (Math.random() - .5) * 150, life: 0.3 });
      }
      if (grounded && (mode === 'cube' || mode === 'robot')) rot = Math.round(rot / 90) * 90;
      tapped = false;
      // след и частицы
      if (mode === 'wave') { trail.push({ x: px + S / 2, y: py + S / 2 }); if (trail.length > 90) trail.shift(); } else trail.length = 0;
      if (grounded || air) for (let i = 0; i < 2; i++) particles.push({ x: px, y: air ? py + S / 2 : (grav > 0 ? py + S - 2 : py + 2), vx: -L.spd * 0.6 + (Math.random() - .5) * 60, vy: (Math.random() - .5) * 60, life: 0.35 });
      particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }); particles = particles.filter(p => p.life > 0);
    }
    let robotBoost = 0;

    function drawPlayer(ctx, hue) {
      ctx.save(); ctx.translate(px + S / 2, py + S / 2);
      if (mode === 'ship') { ctx.rotate(Math.max(-0.5, Math.min(0.5, vy / 700)) * grav); if (grav < 0) ctx.scale(1, -1); ctx.fillStyle = '#f472b6'; ctx.beginPath(); ctx.moveTo(-18, -9); ctx.lineTo(19, 0); ctx.lineTo(-18, 9); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#fbbf24'; ctx.fillRect(-11, -10, 13, 13); ctx.fillStyle = '#22d3ee'; ctx.fillRect(-8, -7, 7, 7); }
      else if (mode === 'ufo') { if (grav < 0) ctx.scale(1, -1); ctx.fillStyle = '#34d399'; ctx.beginPath(); ctx.ellipse(0, 4, 19, 7, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#a5f3fc'; ctx.beginPath(); ctx.ellipse(0, -3, 11, 9, 0, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#fbbf24'; [-10, 0, 10].forEach(x => { ctx.beginPath(); ctx.arc(x, 5, 2.5, 0, 7); ctx.fill(); }); }
      else if (mode === 'wave') { ctx.rotate(grav * (holding ? -0.78 : 0.78)); ctx.fillStyle = '#22d3ee'; ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-6, -7); ctx.lineTo(-6, 7); ctx.closePath(); ctx.fill(); }
      else if (mode === 'ball') { ctx.rotate(rot * Math.PI / 180); ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(0, 0, S / 2 - 1, 0, 7); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = '#22d3ee'; ctx.beginPath(); ctx.arc(0, 0, 7, 0, 7); ctx.fill(); ctx.fillStyle = '#111'; ctx.fillRect(-2, -S / 2 + 2, 4, 8); }
      else if (mode === 'robot') { if (grav < 0) ctx.scale(1, -1); ctx.fillStyle = '#a3e635'; ctx.fillRect(-S / 2, -S / 2, S, S * 0.65); ctx.fillStyle = '#65a30d'; ctx.fillRect(-S / 2 + 3, S / 2 - 12, 8, 12); ctx.fillRect(S / 2 - 11, S / 2 - 12, 8, 12); ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.strokeRect(-S / 2 + 1, -S / 2 + 1, S - 2, S * 0.65 - 2); ctx.fillStyle = '#111'; ctx.fillRect(-7, -8, 5, 5); ctx.fillRect(3, -8, 5, 5); }
      else if (mode === 'spider') { if (grav < 0) ctx.scale(1, -1); ctx.fillStyle = '#c084fc'; ctx.beginPath(); ctx.arc(0, 0, 11, 0, 7); ctx.fill(); ctx.strokeStyle = '#7e22ce'; ctx.lineWidth = 2.5; [-1, 1].forEach(s2 => [0, 1, 2].forEach(i => { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(s2 * 16, -6 + i * 8); ctx.stroke(); })); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-3, -3, 2.5, 0, 7); ctx.arc(3, -3, 2.5, 0, 7); ctx.fill(); }
      else { ctx.rotate(rot * Math.PI / 180); ctx.fillStyle = '#fbbf24'; ctx.fillRect(-S / 2, -S / 2, S, S); ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.strokeRect(-S / 2 + 1, -S / 2 + 1, S - 2, S - 2); ctx.fillStyle = '#22d3ee'; ctx.fillRect(-8, -8, 16, 16); ctx.fillStyle = '#111'; ctx.fillRect(-4, -4, 8, 8); }
      ctx.restore();
    }
    function draw(ctx) {
      const hue = L.hue + px / 40; ctx.fillStyle = `hsl(${hue},60%,16%)`; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 6; i++) { const bx = ((i * 140 - camX * 0.3) % (W + 140) + W + 140) % (W + 140) - 140; ctx.fillStyle = `hsla(${hue + 20},60%,28%,.5)`; ctx.fillRect(bx, 90 + (i % 3) * 30, 90, H); }
      ctx.save(); ctx.translate(-camX, 0);
      ctx.fillStyle = `hsl(${hue},50%,26%)`; ctx.fillRect(camX, GY, W, H - GY); ctx.fillRect(camX, 0, W, CY);
      ctx.fillStyle = `hsl(${hue},90%,68%)`; ctx.fillRect(camX, GY, W, 3); ctx.fillRect(camX, CY - 3, W, 3);
      for (const o of objs) {
        if (o.x > camX + W + 80 || (o.x + (o.w || S)) < camX - 80) continue;
        if (o.t === 'block') { ctx.fillStyle = `hsl(${hue},40%,18%)`; ctx.fillRect(o.x, o.y, o.w, o.h); ctx.strokeStyle = `hsl(${hue},90%,70%)`; ctx.lineWidth = 2; ctx.strokeRect(o.x + 1, o.y + 1, o.w - 2, o.h - 2); for (let gx = o.x + S; gx < o.x + o.w; gx += S) { ctx.beginPath(); ctx.moveTo(gx, o.y); ctx.lineTo(gx, o.y + o.h); ctx.stroke(); } }
        else if (o.t === 'spike') { ctx.fillStyle = '#fff'; ctx.beginPath(); if (o.flip) { ctx.moveTo(o.x, o.y); ctx.lineTo(o.x + S, o.y); ctx.lineTo(o.x + S / 2, o.y + S); } else { ctx.moveTo(o.x, o.y + S); ctx.lineTo(o.x + S, o.y + S); ctx.lineTo(o.x + S / 2, o.y); } ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.stroke(); }
        else if (o.t === 'portal') { const col = o.kind === 'grav' ? '#fbbf24' : { ship: '#f472b6', ufo: '#34d399', wave: '#22d3ee', ball: '#f59e0b', robot: '#a3e635', spider: '#c084fc', cube: '#e5e7eb' }[o.kind]; ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.shadowColor = col; ctx.shadowBlur = 18; ctx.beginPath(); ctx.ellipse(o.x + 22, 150, 22, 95, 0, 0, 7); ctx.stroke(); ctx.shadowBlur = 0; ctx.fillStyle = '#fff'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(o.kind === 'grav' ? '⇅' : MODE_IC[o.kind], o.x + 22, 150); }
        else if (o.t === 'coin' && !o.got) { ctx.fillStyle = '#fbbf24'; ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 12; ctx.beginPath(); ctx.arc(o.x, o.y, 9, 0, 7); ctx.fill(); ctx.shadowBlur = 0; }
        else if (o.t === 'finish') { ctx.fillStyle = '#fff'; ctx.fillRect(o.x, CY, 6, GY - CY); for (let k = 0; k < 12; k++) { ctx.fillStyle = k % 2 ? '#111' : '#fff'; ctx.fillRect(o.x + 6, CY + k * 15, 14, 15); } }
      }
      if (trail.length > 1) { ctx.strokeStyle = `hsla(190,90%,65%,.5)`; ctx.lineWidth = 8; ctx.lineJoin = 'round'; ctx.beginPath(); trail.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.stroke(); }
      particles.forEach(p => { ctx.globalAlpha = Math.max(0, p.life * 2); ctx.fillStyle = p.gold ? '#fbbf24' : alive ? `hsl(${hue + 60},90%,70%)` : '#f97316'; ctx.fillRect(p.x - 3, p.y - 3, 6, 6); }); ctx.globalAlpha = 1;
      if (alive) drawPlayer(ctx, hue);
      ctx.restore();
      const pct = Math.min(100, px / len * 100); ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(60, 8, W - 120, 12); ctx.fillStyle = '#34d399'; ctx.fillRect(60, 8, (W - 120) * pct / 100, 12); ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(Math.floor(pct) + '%', W / 2, 14);
      ctx.textAlign = 'left'; ctx.fillText(MODE_IC[mode] + ' ' + MODE_RU[mode], 8, 14);
      if (!alive && !finished) { ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Попытка ' + (attempt + 1), W / 2, H / 2); }
    }
    function menu() {
      finished = true; alive = false;
      const box = h('div', { style: 'display:grid;grid-template-columns:repeat(2,1fr);gap:8px;max-height:55vh;overflow:auto' });
      LEVELS.forEach((lv, i) => { const open = i === 0 || done[i - 1]; box.append(h('button', { class: 'btn ' + (done[i] ? '' : open ? 'primary' : ''), style: 'flex-direction:column;gap:2px;' + (open ? '' : 'opacity:.35'), onclick: () => { if (!open) { api.toast('Пройдите предыдущий уровень'); return; } m.close(); start(i); } }, h('b', null, (i + 1) + '. ' + lv.n), h('span', { style: 'font-size:11px;color:var(--muted)' }, (done[i] ? '✓ 100%' : (bestPct[i] || 0) + '%') + ' · ' + lv.modes.map(z => MODE_IC[z]).join('')))); });
      const m = api.modal({ title: '🟧 Неон Дэш', text: 'Тап — прыжок · корабль/волна — удерживай · НЛО, шар, паук — тап', body: box, buttons: [{ label: 'В меню', onClick: api.exit }] });
    }
    const a = api.arcade(screen, { w: W, h: H, stats: [{ label: '', value: '' }, { label: 'Попытка', value: 1 }, { btn: '☰ Уровни', onClick: menu }], hint: 'Куб/робот — прыжок · корабль, волна — удерживай · НЛО, шар, паук — тап',
      onDown: () => { holding = true; tapped = true; }, onUp: () => { holding = false; }, onKey: e => { if ((e.key === ' ' || e.key === 'ArrowUp') && !holding) { holding = true; tapped = true; } },
      frame(dt, ctx) { if (!L) return; t += dt; update(dt); draw(ctx); } });
    window.addEventListener('keyup', a._ku = () => holding = false); hdr = a.hdr;
    this.unmount = () => { a.stop(); window.removeEventListener('keyup', a._ku); };
    window.__dash = () => ({ px, len, alive, attempt, li, mode }); menu();
  }
});
