/* Чмодаш — платформер в духе Geometry Dash: куб бежит сам, тап — прыжок, шипы, порталы гравитации, режим корабля */
Games.register({
  id: 'chmodash', title: 'Чмодаш', icon: '🟧', cat: 'arcade', desc: 'Geometry Dash: 12 уровней, шипы, порталы гравитации и корабль', progress: api => 'Пройдено ' + Object.keys(api.load('dash_done', {})).length + '/12',
  mount(screen, api) {
    const { h } = api;
    const W = 400, H = 300, GY = 240, S = 30; // земля, размер куба
    const LEVELS = [
      { n: 'Первый шаг', spd: 220, len: 60, seed: 11, hue: 200, d: 0.4 }, { n: 'Ступени', spd: 240, len: 70, seed: 22, hue: 280, d: 0.55 }, { n: 'Полёт', spd: 250, len: 80, seed: 33, hue: 140, d: 0.6, ship: true },
      { n: 'Переворот', spd: 260, len: 85, seed: 44, hue: 30, d: 0.7, grav: true }, { n: 'Лезвия', spd: 280, len: 90, seed: 55, hue: 340, d: 0.8 }, { n: 'Космос', spd: 290, len: 100, seed: 66, hue: 220, d: 0.85, ship: true, grav: true },
      { n: 'Бетон', spd: 300, len: 110, seed: 77, hue: 60, d: 0.9 }, { n: 'Небо', spd: 310, len: 120, seed: 88, hue: 180, d: 0.95, ship: true }, { n: 'Молот', spd: 330, len: 130, seed: 99, hue: 0, d: 1, grav: true },
      { n: 'Гроза', spd: 340, len: 140, seed: 111, hue: 260, d: 1.05, ship: true, grav: true }, { n: 'Демон', spd: 360, len: 150, seed: 123, hue: 320, d: 1.15, ship: true, grav: true }, { n: 'Чмо-финал', spd: 380, len: 170, seed: 999, hue: 45, d: 1.25, ship: true, grav: true }
    ];
    let done = api.load('dash_done', {}), bestPct = api.load('dash_best', {}), attempts = api.load('dash_att', {});
    let L, li, objs, px, py, vy, grav, ship, alive, camX, len, attempt, rot, particles, dead, holding, t = 0, finished, hdr, bg;

    /* ---------- генератор уровня (детерминированный по seed) ---------- */
    function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let x = Math.imul(s ^ (s >>> 15), 1 | s); x ^= x + Math.imul(x ^ (x >>> 7), 61 | x); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
    function gen(lv) {
      const r = rng(lv.seed); objs = []; let x = 500; len = lv.len * lv.spd; let mode = 'cube', gv = 1;
      const pushSpike = (x, y, n, flip) => { for (let i = 0; i < n; i++) objs.push({ t: 'spike', x: x + i * S, y, flip }); };
      const block = (x, y, w, hh) => objs.push({ t: 'block', x, y, w: w * S, h: hh * S });
      while (x < len - 600) {
        const roll = r(); const gap = 120 + r() * 160 * (1.4 - lv.d);
        if (mode === 'ship') {
          // коридор корабля: колонны сверху и снизу
          const cy = 90 + r() * 100; const gapH = 120 - lv.d * 20; block(x, 0, 2, Math.floor((cy - gapH / 2) / S)); block(x, cy + gapH / 2, 2, 10); if (r() < 0.4) objs.push({ t: 'spike', x: x + 2 * S, y: cy + gapH / 2 - S, flip: false }); x += 2 * S + 110 + r() * 60;
          if (r() < 0.12 && x > 1500) { objs.push({ t: 'portal', x, kind: 'cube' }); mode = 'cube'; x += 250; }
          continue;
        }
        if (roll < 0.35) { pushSpike(x, gv > 0 ? GY - S : 0, 1 + Math.floor(r() * (lv.d * 3)), gv < 0); x += S * 3 + gap; }
        else if (roll < 0.55) { const hgt = 1 + Math.floor(r() * 2); if (gv > 0) block(x, GY - hgt * S, 2 + Math.floor(r() * 3), hgt); else block(x, 0, 2 + Math.floor(r() * 3), hgt); x += 5 * S + gap; }
        else if (roll < 0.7) { // лестница
          const steps = 2 + Math.floor(r() * 2); for (let i = 0; i < steps; i++) { if (gv > 0) block(x + i * 2 * S, GY - (i + 1) * S, 2, i + 1); else block(x + i * 2 * S, 0, 2, i + 1); } x += steps * 2 * S; pushSpike(x, gv > 0 ? GY - S : 0, 1, gv < 0); x += S + gap;
        }
        else if (roll < 0.82) { // платформа в воздухе с шипами под ней
          const yy = gv > 0 ? GY - S * (2 + Math.floor(r() * 2)) : S * (2 + Math.floor(r() * 2)); block(x, yy, 3, 1); pushSpike(x, gv > 0 ? GY - S : 0, 3 + Math.floor(r() * 2), gv < 0); x += 5 * S + gap;
        }
        else if (roll < 0.9 && lv.grav && x > 1200) { objs.push({ t: 'portal', x, kind: 'grav' }); gv *= -1; x += 260; }
        else if (lv.ship && x > 1500 && r() < 0.5) { objs.push({ t: 'portal', x, kind: 'ship' }); mode = 'ship'; gv = 1; x += 200; }
        else { objs.push({ t: 'coin', x, y: gv > 0 ? GY - 70 : 70 }); x += 80 + gap; }
      }
      if (mode === 'ship') objs.push({ t: 'portal', x: len - 550, kind: 'cube' }); if (gv < 0) objs.push({ t: 'portal', x: len - 500, kind: 'grav' });
      objs.push({ t: 'finish', x: len - 100 });
    }
    function start(i) { li = i; L = LEVELS[i]; gen(L); attempt = (attempts[i] || 0) + 1; attempts[i] = attempt; api.store('dash_att', attempts); reset(); hdr.set(0, L.n); }
    function reset() { px = 100; py = GY - S; vy = 0; grav = 1; ship = false; alive = true; camX = 0; rot = 0; particles = []; dead = 0; finished = false; bg = L.hue; hdr.set(1, attempt); }
    function die() { if (!alive) return; alive = false; dead = 0.8; api.sound('boom'); api.vibrate(60); for (let i = 0; i < 20; i++) particles.push({ x: px + S / 2, y: py + S / 2, vx: (Math.random() - .5) * 500, vy: (Math.random() - .5) * 500, life: 0.7 }); const pct = Math.min(99, Math.floor(px / len * 100)); if ((bestPct[li] || 0) < pct) { bestPct[li] = pct; api.store('dash_best', bestPct); } }
    function finish() { finished = true; alive = false; done[li] = true; bestPct[li] = 100; api.store('dash_done', done); api.store('dash_best', bestPct); const first = !done['r' + li]; done['r' + li] = true; api.store('dash_done', done); api.end({ title: 'Уровень «' + L.n + '» пройден!', reward: first ? 20 + li * 5 : 5, text: 'Попыток: ' + attempt, again: li < LEVELS.length - 1 ? 'Следующий' : 'Меню', onAgain: () => li < LEVELS.length - 1 ? start(li + 1) : menu() }); }

    function update(dt) {
      if (finished) return;
      if (!alive) { dead -= dt; particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }); if (dead <= 0) { attempt++; attempts[li] = attempt; api.store('dash_att', attempts); reset(); } return; }
      px += L.spd * dt; camX = px - 120;
      const g = grav * (ship ? (holding ? -1400 : 1400) : 2600);
      if (ship) { vy += g * dt; vy = Math.max(-380, Math.min(380, vy)); }
      else { vy += g * dt; }
      const prevY = py; py += vy * dt; rot += (ship ? 0 : grav * 360 * dt * (Math.abs(vy) > 10 ? 1 : 0));
      const onGround = grav > 0 ? py + S >= GY : py <= 60;
      if (grav > 0 && py + S > GY) { py = GY - S; vy = 0; } if (grav < 0 && py < 60) { py = 60; vy = 0; }
      if (ship) { if (py + S > GY) { py = GY - S; vy = 0; } if (py < 60) { py = 60; vy = 0; } }
      let grounded = grav > 0 ? py + S >= GY - 0.5 : py <= 60.5;
      // коллизии
      for (const o of objs) {
        if (o.x > camX + W + 60 || (o.x + (o.w || S)) < camX - 60) continue;
        if (o.t === 'block') {
          const ox2 = o.x + o.w, oy2 = o.y + o.h; if (px + S - 4 > o.x && px + 4 < ox2 && py + S > o.y && py < oy2) {
            if (grav > 0 && prevY + S <= o.y + 6 && vy >= 0 && !ship) { py = o.y - S; vy = 0; grounded = true; }
            else if (grav < 0 && prevY >= oy2 - 6 && vy <= 0 && !ship) { py = oy2; vy = 0; grounded = true; }
            else if (ship && prevY + S <= o.y + 6 && vy > 0) { py = o.y - S; vy = 0; }
            else if (ship && prevY >= oy2 - 6 && vy < 0) { py = oy2; vy = 0; }
            else { die(); return; }
          }
        } else if (o.t === 'spike') { const cx = o.x + S / 2, cy = o.flip ? o.y + S * 0.4 : o.y + S * 0.6; if (px + S - 8 > o.x + 4 && px + 8 < o.x + S - 4 && Math.abs(py + S / 2 - cy) < S * 0.55) { die(); return; } }
        else if (o.t === 'portal' && !o.used && px + S / 2 > o.x && px + S / 2 < o.x + 40) { o.used = true; api.sound('good'); if (o.kind === 'grav') { grav *= -1; vy = 0; } else if (o.kind === 'ship') { ship = true; vy = 0; } else { ship = false; grav = 1; vy = 0; } }
        else if (o.t === 'coin' && !o.got && Math.hypot(o.x - px - S / 2, o.y - py - S / 2) < 34) { o.got = true; api.sound('coin'); api.addCoins(1); }
        else if (o.t === 'finish' && px > o.x) { finish(); return; }
      }
      if (!ship && grounded && holding) { vy = -grav * 760; grounded = false; api.sound('jump'); }
      if (grounded && !ship) rot = Math.round(rot / 90) * 90;
      if (grounded || ship) for (let i = 0; i < 2; i++) particles.push({ x: px, y: grav > 0 ? py + S - 2 : py + 2, vx: -L.spd * 0.6 + (Math.random() - .5) * 60, vy: (Math.random() - .5) * 60, life: 0.35 });
      particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }); particles = particles.filter(p => p.life > 0);
    }
    function draw(ctx) {
      const hue = L.hue + px / 40; ctx.fillStyle = `hsl(${hue},60%,${18}%)`; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 6; i++) { const bx = ((i * 140 - camX * 0.3) % (W + 140) + W + 140) % (W + 140) - 140; ctx.fillStyle = `hsla(${hue + 20},60%,30%,.5)`; ctx.fillRect(bx, 100 + (i % 3) * 30, 90, H); }
      ctx.save(); ctx.translate(-camX, 0);
      ctx.fillStyle = `hsl(${hue},50%,28%)`; ctx.fillRect(camX, GY, W, H - GY); ctx.fillStyle = `hsl(${hue},80%,65%)`; ctx.fillRect(camX, GY, W, 3); ctx.fillRect(camX, 60, W, 2);
      for (const o of objs) {
        if (o.x > camX + W + 60 || (o.x + (o.w || S)) < camX - 60) continue;
        if (o.t === 'block') { ctx.fillStyle = `hsl(${hue},40%,20%)`; ctx.fillRect(o.x, o.y, o.w, o.h); ctx.strokeStyle = `hsl(${hue},90%,70%)`; ctx.lineWidth = 2; ctx.strokeRect(o.x + 1, o.y + 1, o.w - 2, o.h - 2); for (let gx = o.x + S; gx < o.x + o.w; gx += S) { ctx.beginPath(); ctx.moveTo(gx, o.y); ctx.lineTo(gx, o.y + o.h); ctx.stroke(); } }
        else if (o.t === 'spike') { ctx.fillStyle = '#fff'; ctx.beginPath(); if (o.flip) { ctx.moveTo(o.x, o.y); ctx.lineTo(o.x + S, o.y); ctx.lineTo(o.x + S / 2, o.y + S); } else { ctx.moveTo(o.x, o.y + S); ctx.lineTo(o.x + S, o.y + S); ctx.lineTo(o.x + S / 2, o.y); } ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.stroke(); }
        else if (o.t === 'portal') { const col = o.kind === 'grav' ? '#fbbf24' : o.kind === 'ship' ? '#f472b6' : '#34d399'; ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.shadowColor = col; ctx.shadowBlur = 16; ctx.beginPath(); ctx.ellipse(o.x + 20, 150, 20, 90, 0, 0, 7); ctx.stroke(); ctx.shadowBlur = 0; ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(o.kind === 'grav' ? '⇅' : o.kind === 'ship' ? '🚀' : '⬛', o.x + 20, 150); }
        else if (o.t === 'coin' && !o.got) { ctx.fillStyle = '#fbbf24'; ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(o.x, o.y, 9, 0, 7); ctx.fill(); ctx.shadowBlur = 0; }
        else if (o.t === 'finish') { ctx.fillStyle = '#fff'; ctx.fillRect(o.x, 60, 6, GY - 60); for (let k = 0; k < 6; k++) { ctx.fillStyle = k % 2 ? '#111' : '#fff'; ctx.fillRect(o.x + 6, 60 + k * 15, 14, 15); } }
      }
      particles.forEach(p => { ctx.globalAlpha = Math.max(0, p.life * 2); ctx.fillStyle = alive ? `hsl(${hue + 60},90%,70%)` : '#f97316'; ctx.fillRect(p.x - 3, p.y - 3, 6, 6); }); ctx.globalAlpha = 1;
      if (alive) { ctx.save(); ctx.translate(px + S / 2, py + S / 2); if (ship) { ctx.rotate(Math.max(-0.5, Math.min(0.5, vy / 600)) * grav); ctx.fillStyle = '#f472b6'; ctx.beginPath(); ctx.moveTo(-18, -8); ctx.lineTo(18, 0); ctx.lineTo(-18, 8); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#fbbf24'; ctx.fillRect(-10, -10, 12, 12); } else { ctx.rotate(rot * Math.PI / 180); ctx.fillStyle = '#fbbf24'; ctx.fillRect(-S / 2, -S / 2, S, S); ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.strokeRect(-S / 2 + 1, -S / 2 + 1, S - 2, S - 2); ctx.fillStyle = '#22d3ee'; ctx.fillRect(-8, -8, 16, 16); ctx.fillStyle = '#111'; ctx.fillRect(-4, -4, 8, 8); } ctx.restore(); }
      ctx.restore();
      // прогресс
      const pct = Math.min(100, px / len * 100); ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(60, 8, W - 120, 10); ctx.fillStyle = '#34d399'; ctx.fillRect(60, 8, (W - 120) * pct / 100, 10); ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(Math.floor(pct) + '%', W / 2, 30);
      if (!alive && !finished) { ctx.font = 'bold 22px sans-serif'; ctx.fillText('Попытка ' + (attempt + 1), W / 2, H / 2); }
    }
    function menu() {
      finished = true; alive = false;
      const box = h('div', { style: 'display:grid;grid-template-columns:repeat(2,1fr);gap:8px;max-height:55vh;overflow:auto' });
      LEVELS.forEach((lv, i) => { const open = i === 0 || done[i - 1]; box.append(h('button', { class: 'btn ' + (done[i] ? '' : open ? 'primary' : ''), style: 'flex-direction:column;gap:2px;' + (open ? '' : 'opacity:.35'), onclick: () => { if (!open) { api.toast('Пройдите предыдущий уровень'); return; } m.close(); start(i); } }, h('b', null, (i + 1) + '. ' + lv.n), h('span', { style: 'font-size:11px;color:var(--muted)' }, (done[i] ? '✓ 100%' : (bestPct[i] || 0) + '%') + ' · ' + (lv.ship ? '🚀' : '') + (lv.grav ? '⇅' : '')))); });
      const m = api.modal({ title: '🟧 Чмодаш', text: 'Тап — прыжок. В режиме корабля удерживай, чтобы лететь вверх', body: box, buttons: [{ label: 'В меню', onClick: api.exit }] });
    }
    const a = api.arcade(screen, { w: W, h: H, stats: [{ label: '', value: '' }, { label: 'Попытка', value: 1 }, { btn: '☰ Уровни', onClick: menu }], hint: 'Тап / удержание — прыжок · корабль: удерживай для подъёма',
      onDown: () => { holding = true; }, onUp: () => { holding = false; }, onKey: e => { if (e.key === ' ' || e.key === 'ArrowUp') holding = true; },
      frame(dt, ctx) { if (!L) return; t += dt; update(dt); draw(ctx); } });
    window.addEventListener('keyup', a._ku = () => holding = false); hdr = a.hdr;
    this.unmount = () => { a.stop(); window.removeEventListener('keyup', a._ku); };
    window.__dash = () => ({ px, len, alive, attempt, li }); menu();
  }
});
