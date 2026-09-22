/* Дополнительные аркады, часть 2 */
(function () {
  const rr = (ctx, x, y, w, h, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); };
  const circ = (ctx, x, y, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); };
  const text = (ctx, t, x, y, size, c, align) => { ctx.fillStyle = c || '#fff'; ctx.font = 'bold ' + size + 'px sans-serif'; ctx.textAlign = align || 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t, x, y); };

  /* ---------- Тир ---------- */
  Games.register({
    id: 'whack', title: 'Тир', icon: '🎯', cat: 'arcade', desc: 'Бей по кротам, не трогай бомбы. 30 секунд', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; let score, timeLeft, timer, holes, hdr, tick;
      function start() { score = 0; timeLeft = 30; clearInterval(timer); clearInterval(tick); render(); timer = setInterval(() => { timeLeft--; hdr.set(1, timeLeft); if (timeLeft <= 0) finish(); }, 1000); tick = setInterval(pop, 650); }
      function render() {
        screen.innerHTML = ''; hdr = api.header(screen, [{ label: 'Счёт', value: 0 }, { label: '⏱', value: 30 }, { label: 'Рекорд', value: api.bestOf('whack') || 0 }]);
        const g = h('div', { style: 'display:grid;grid-template-columns:repeat(3,1fr);gap:12px;width:min(92vw,360px)' }); holes = [];
        for (let i = 0; i < 9; i++) { const el = h('div', { class: 'hole', onpointerdown: () => hit(i) }, ''); holes.push({ el, v: 0 }); g.append(el); }
        screen.append(h('div', { class: 'game-area' }, g));
      }
      function pop() { const free = holes.filter(x => !x.v); if (!free.length) return; const n = 1 + (timeLeft < 15 ? 1 : 0); for (let k = 0; k < n; k++) { const x = free[api.rand(0, free.length - 1)]; if (x.v) continue; x.v = Math.random() < .2 ? 2 : 1; x.el.textContent = x.v === 2 ? '💣' : '🐹'; x.el.classList.add('up'); setTimeout(() => { if (x.v) { x.v = 0; x.el.textContent = ''; x.el.classList.remove('up'); } }, 900 - Math.min(400, score * 10)); } }
      function hit(i) { const x = holes[i]; if (!x.v) return; if (x.v === 2) { score = Math.max(0, score - 5); api.sound('boom'); api.vibrate(60); } else { score++; api.sound('good'); api.vibrate(8); } x.v = 0; x.el.textContent = ''; x.el.classList.remove('up'); hdr.set(0, score); }
      function finish() { clearInterval(timer); clearInterval(tick); api.best('whack', score); api.end({ title: 'Время вышло', reward: Math.floor(score / 3), text: 'Попаданий: ' + score, onAgain: start }); }
      this.unmount = () => { clearInterval(timer); clearInterval(tick); };
      start();
    }
  });

  /* ---------- Ловля фруктов ---------- */
  Games.register({
    id: 'catch', title: 'Ловля фруктов', icon: '🧺', cat: 'arcade', desc: 'Лови фрукты корзиной, избегай бомб', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 560; const FR = ['🍎', '🍌', '🍇', '🍓', '🍒', '🍋']; let px, items, score, lives, alive, spawnT, speed;
      function reset() { px = W / 2; items = []; score = 0; lives = 3; alive = true; spawnT = 0; speed = 150; a.hdr.set(0, 0); a.hdr.set(1, 3); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Счёт', value: 0 }, { label: '❤', value: 3 }, { label: 'Рекорд', value: api.bestOf('catch') || 0 }], hint: 'Веди пальцем — корзина следует',
        onDown: p => px = p.x, onMove: (p, e) => { if (e.buttons || e.pointerType === 'touch') px = p.x; }, onKey: e => { if (e.key === 'ArrowLeft') px -= 30; if (e.key === 'ArrowRight') px += 30; },
        frame(dt, ctx) {
          if (alive) {
            px = Math.max(40, Math.min(W - 40, px)); spawnT -= dt; if (spawnT <= 0) { spawnT = Math.max(0.35, 0.9 - score / 200); items.push({ x: api.rand(20, W - 20), y: -20, v: speed + api.rand(0, 80), t: Math.random() < 0.18 ? '💣' : FR[api.rand(0, FR.length - 1)] }); }
            speed += dt * 3;
            for (const it of items) { it.y += it.v * dt; if (it.y > H - 60 && it.y < H - 20 && Math.abs(it.x - px) < 42) { it.dead = true; if (it.t === '💣') { lives--; api.sound('boom'); api.vibrate(60); } else { score++; api.sound('coin'); api.vibrate(6); if (score % 15 === 0) api.addCoins(3); } } else if (it.y > H + 20) { it.dead = true; if (it.t !== '💣') { lives--; api.sound('bad'); } } }
            items = items.filter(i => !i.dead); a.hdr.set(0, score); a.hdr.set(1, lives);
            if (lives <= 0) { alive = false; api.best('catch', score); api.end({ win: false, title: 'Игра окончена', reward: Math.floor(score / 5), text: 'Поймано: ' + score, onAgain: reset }); }
          }
          ctx.fillStyle = '#1e1b4b'; ctx.fillRect(0, 0, W, H); ctx.font = '32px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          items.forEach(it => ctx.fillText(it.t, it.x, it.y));
          rr(ctx, px - 40, H - 50, 80, 30, 8, '#b45309'); rr(ctx, px - 44, H - 54, 88, 8, 4, '#d97706');
        } });
      this.unmount = a.stop; reset();
    }
  });

  /* ---------- Жонглёр ---------- */
  Games.register({
    id: 'juggle', title: 'Жонглёр', icon: '⚽', cat: 'arcade', desc: 'Набивай мяч — тапай по нему, не роняй', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 520; let bx, by, vx, vy, score, alive, started;
      function reset() { bx = W / 2; by = H / 2; vx = 0; vy = 0; score = 0; alive = true; started = false; a.hdr.set(0, 0); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Набито', value: 0 }, { label: 'Рекорд', value: api.bestOf('juggle') || 0 }], hint: 'Тап по мячу — удар снизу',
        onDown: p => { if (!alive) return; if (Math.hypot(p.x - bx, p.y - by) < 45) { started = true; vy = -520 - Math.random() * 80; vx = (bx - p.x) * 12 + (Math.random() - .5) * 60; score++; a.hdr.set(0, score); api.sound('jump'); api.vibrate(8); if (score % 10 === 0) api.addCoins(3); } },
        frame(dt, ctx) {
          if (alive && started) { vy += 1000 * dt; bx += vx * dt; by += vy * dt; if (bx < 30) { bx = 30; vx = Math.abs(vx); } if (bx > W - 30) { bx = W - 30; vx = -Math.abs(vx); } if (by < 30) { by = 30; vy = Math.abs(vy) * .6; }
            if (by > H - 30) { alive = false; api.sound('bad'); api.best('juggle', score); api.end({ win: false, title: 'Мяч упал', reward: Math.floor(score / 5), text: 'Набито: ' + score, onAgain: reset }); } }
          ctx.fillStyle = '#14532d'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#166534'; ctx.fillRect(0, H - 30, W, 30);
          circ(ctx, bx, by, 30, '#fff'); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(bx, by, 30, 0, 7); ctx.stroke(); circ(ctx, bx, by, 9, '#111'); [0, 72, 144, 216, 288].forEach(d => { const r = d * Math.PI / 180; circ(ctx, bx + Math.cos(r) * 20, by + Math.sin(r) * 20, 5, '#111'); });
          if (!started) text(ctx, 'Тап по мячу', W / 2, H / 2 - 70, 22);
        } });
      this.unmount = a.stop; reset();
    }
  });

  /* ---------- Аэрохоккей ---------- */
  Games.register({
    id: 'airhockey', title: 'Аэрохоккей', icon: '🏒', cat: 'arcade', desc: 'До 7 голов против компьютера', bestLabel: 'Побед',
    mount(screen, api) {
      const W = 360, H = 600, R = 28, PR = 16; let me, ai, puck, sm, sa, over, wins = api.load('ah_w', 0);
      function reset() { me = { x: W / 2, y: H - 80 }; ai = { x: W / 2, y: 80 }; puck = { x: W / 2, y: H / 2 + 60, vx: 0, vy: 0 }; sm = 0; sa = 0; over = false; a.hdr.set(0, 0); a.hdr.set(1, 0); }
      function serve(toMe) { puck = { x: W / 2, y: toMe ? H / 2 + 60 : H / 2 - 60, vx: 0, vy: 0 }; }
      function collide(p, prevX, prevY) { const dx = puck.x - p.x, dy = puck.y - p.y; const d = Math.hypot(dx, dy); if (d < R + PR) { const nx = dx / d, ny = dy / d; const pvx = (p.x - prevX) * 60, pvy = (p.y - prevY) * 60; puck.x = p.x + nx * (R + PR + 1); puck.y = p.y + ny * (R + PR + 1); const dot = puck.vx * nx + puck.vy * ny; puck.vx = puck.vx - 2 * dot * nx + pvx * .6; puck.vy = puck.vy - 2 * dot * ny + pvy * .6; const sp = Math.hypot(puck.vx, puck.vy); if (sp > 900) { puck.vx *= 900 / sp; puck.vy *= 900 / sp; } if (sp < 150) { puck.vx = nx * 200; puck.vy = ny * 200; } api.sound('tap'); api.vibrate(5); } }
      let prevMe = { x: 0, y: 0 };
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Вы', value: 0 }, { label: 'ПК', value: 0 }, { label: 'Побед', value: wins }], hint: 'Веди пальцем свою биту (нижняя половина)',
        onDown: p => { me.x = p.x; me.y = Math.max(H / 2 + R, p.y); }, onMove: (p, e) => { if (e.buttons || e.pointerType === 'touch') { me.x = Math.max(R, Math.min(W - R, p.x)); me.y = Math.max(H / 2 + R, Math.min(H - R, p.y)); } },
        frame(dt, ctx) {
          if (!over) {
            const pa = { x: ai.x, y: ai.y }; const tx = puck.y < H / 2 ? puck.x : W / 2, ty = puck.y < H / 2 ? Math.min(puck.y - 10, H / 2 - R) : 80; ai.x += (tx - ai.x) * Math.min(1, dt * 5); ai.y += (ty - ai.y) * Math.min(1, dt * 4);
            puck.x += puck.vx * dt; puck.y += puck.vy * dt; puck.vx *= 0.995; puck.vy *= 0.995;
            if (puck.x < PR) { puck.x = PR; puck.vx = Math.abs(puck.vx); } if (puck.x > W - PR) { puck.x = W - PR; puck.vx = -Math.abs(puck.vx); }
            const inGoal = puck.x > W / 2 - 60 && puck.x < W / 2 + 60;
            if (puck.y < PR) { if (inGoal) { sm++; a.hdr.set(0, sm); api.sound('good'); serve(false); } else { puck.y = PR; puck.vy = Math.abs(puck.vy); } }
            if (puck.y > H - PR) { if (inGoal) { sa++; a.hdr.set(1, sa); api.sound('bad'); serve(true); } else { puck.y = H - PR; puck.vy = -Math.abs(puck.vy); } }
            collide(me, prevMe.x, prevMe.y); collide(ai, pa.x, pa.y); prevMe = { x: me.x, y: me.y };
            if (sm >= 7 || sa >= 7) { over = true; if (sm > sa) { wins++; api.store('ah_w', wins); api.best('airhockey', wins); api.end({ title: 'Победа 7:' + sa + '!', reward: 25, onAgain: reset }); } else api.end({ win: false, title: 'Поражение ' + sm + ':7', onAgain: reset }); }
          }
          ctx.fillStyle = '#1e1e33'; ctx.fillRect(0, 0, W, H); ctx.strokeStyle = '#3b3b6b'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke(); ctx.beginPath(); ctx.arc(W / 2, H / 2, 50, 0, 7); ctx.stroke();
          rr(ctx, W / 2 - 60, 0, 120, 6, 3, '#f87171'); rr(ctx, W / 2 - 60, H - 6, 120, 6, 3, '#22d3ee');
          circ(ctx, ai.x, ai.y, R, '#f87171'); circ(ctx, ai.x, ai.y, R - 10, '#b91c1c'); circ(ctx, me.x, me.y, R, '#22d3ee'); circ(ctx, me.x, me.y, R - 10, '#0e7490'); circ(ctx, puck.x, puck.y, PR, '#111'); circ(ctx, puck.x, puck.y, PR - 5, '#333');
        } });
      this.unmount = a.stop; reset();
    }
  });

  /* ---------- Цветной переключатель ---------- */
  Games.register({
    id: 'colorswitch', title: 'Цветной прыжок', icon: '🎡', cat: 'arcade', desc: 'Пролетай через кольца только своим цветом', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 600; const COLORS = ['#f87171', '#fbbf24', '#34d399', '#60a5fa']; let by, vy, color, rings, score, alive, camY, started, t = 0;
      function reset() { by = H - 100; vy = 0; color = 0; rings = []; score = 0; alive = true; camY = 0; started = false; for (let i = 0; i < 5; i++) rings.push({ y: H - 300 - i * 320, rot: 0, dir: i % 2 ? 1 : -1, sw: null, passed: false }); rings.forEach(r => r.sw = { y: r.y + 160, c: api.rand(0, 3), taken: false }); a.hdr.set(0, 0); }
      function flap() { if (!alive) return; started = true; vy = -400; api.sound('jump'); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Счёт', value: 0 }, { label: 'Рекорд', value: api.bestOf('colorswitch') || 0 }], hint: 'Тап — прыжок. Касайся кольца только своим цветом', onDown: flap, onKey: e => { if (e.key === ' ') flap(); },
        frame(dt, ctx) {
          t += dt;
          if (alive && started) {
            vy += 1100 * dt; by += vy * dt; if (by < H / 2) { camY += H / 2 - by; rings.forEach(r => { r.y += H / 2 - by; r.sw.y += H / 2 - by; }); by = H / 2; }
            if (by > H + 20) die();
            for (const r of rings) {
              r.rot += r.dir * dt * 1.2; const d = Math.abs(by - r.y); const R = 110;
              if (Math.abs(Math.hypot(W / 2 - W / 2, d) - R) < 14 + 8 && d < R + 20) { const ang = (Math.atan2(by - r.y, 0.001) - r.rot + Math.PI / 2 + Math.PI * 8) % (Math.PI * 2); const seg = Math.floor(ang / (Math.PI / 2)); if (seg !== color) die(); }
              if (!r.passed && by < r.y - R - 10) { r.passed = true; score++; a.hdr.set(0, score); api.sound('good'); if (score % 5 === 0) api.addCoins(3); }
              if (!r.sw.taken && Math.abs(by - r.sw.y) < 20) { r.sw.taken = true; color = r.sw.c; api.sound('coin'); }
            }
            rings = rings.filter(r => r.y < H + 200); while (rings.length < 5) { const top = Math.min(...rings.map(r => r.y)); const ny = top - 320; rings.push({ y: ny, rot: 0, dir: Math.random() < .5 ? 1 : -1, sw: { y: ny + 160, c: api.rand(0, 3), taken: false }, passed: false }); }
          }
          ctx.fillStyle = '#0f0f1a'; ctx.fillRect(0, 0, W, H);
          for (const r of rings) { for (let s = 0; s < 4; s++) { ctx.strokeStyle = COLORS[s]; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(W / 2, r.y, 110, r.rot + s * Math.PI / 2 - Math.PI / 2, r.rot + (s + 1) * Math.PI / 2 - Math.PI / 2); ctx.stroke(); } if (!r.sw.taken) { for (let s = 0; s < 4; s++) { ctx.fillStyle = COLORS[s]; ctx.beginPath(); ctx.moveTo(W / 2, r.sw.y); ctx.arc(W / 2, r.sw.y, 12, s * Math.PI / 2 + t * 3, (s + 1) * Math.PI / 2 + t * 3); ctx.fill(); } } }
          circ(ctx, W / 2, by, 12, COLORS[color]);
          if (!started) text(ctx, 'Тап — старт', W / 2, H / 2 - 40, 22);
        } });
      function die() { if (!alive) return; alive = false; api.sound('boom'); api.vibrate([60, 40, 120]); api.best('colorswitch', score); api.end({ win: false, title: 'Не тот цвет!', reward: Math.floor(score / 3), text: 'Счёт: ' + score, onAgain: reset }); }
      this.unmount = a.stop; reset();
    }
  });

  /* ---------- Пианино ---------- */
  Games.register({
    id: 'piano', title: 'Плитки', icon: '🎹', cat: 'arcade', desc: 'Нажимай только чёрные плитки, не пропускай', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 600, TH = 150; let rows, offset, speed, score, alive, started; const NOTES = [262, 294, 330, 349, 392, 440, 494, 523];
      function reset() { rows = []; for (let i = 0; i < 6; i++) rows.push({ col: api.rand(0, 3), hit: false }); offset = 0; speed = 220; score = 0; alive = true; started = false; a.hdr.set(0, 0); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Счёт', value: 0 }, { label: 'Рекорд', value: api.bestOf('piano') || 0 }], hint: 'Тапай чёрные плитки снизу вверх',
        onDown: p => { if (!alive) return; started = true; const col = Math.floor(p.x / (W / 4)); const idx = Math.floor((H - p.y + offset) / TH); const r = rows[idx]; if (!r) return; if (r.col === col && !r.hit) { if (idx > 0 && !rows[idx - 1].hit) { die(); return; } r.hit = true; score++; a.hdr.set(0, score); api.vibrate(5); try { const c = new (window.AudioContext || window.webkitAudioContext)(); const o = c.createOscillator(), g = c.createGain(); o.frequency.value = NOTES[score % 8]; g.gain.value = .08; o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + .15); } catch (e) {} if (score % 20 === 0) api.addCoins(3); } else if (!r.hit) die(); },
        frame(dt, ctx) {
          if (alive && started) { offset += speed * dt; speed += dt * 6; if (offset >= TH) { offset -= TH; const r = rows.shift(); if (!r.hit) { die(); } rows.push({ col: api.rand(0, 3), hit: false }); } }
          ctx.fillStyle = '#f8f8ff'; ctx.fillRect(0, 0, W, H); ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1; for (let c = 1; c < 4; c++) { ctx.beginPath(); ctx.moveTo(c * W / 4, 0); ctx.lineTo(c * W / 4, H); ctx.stroke(); }
          rows.forEach((r, i) => { const y = H - (i + 1) * TH + offset; ctx.fillStyle = r.hit ? '#a5b4fc' : '#1e1e33'; ctx.fillRect(r.col * W / 4 + 1, y + 1, W / 4 - 2, TH - 2); });
          if (!started) text(ctx, 'Тап по чёрной плитке', W / 2, H / 2, 20, '#333');
        } });
      function die() { alive = false; api.sound('bad'); api.vibrate(60); api.best('piano', score); api.end({ win: false, title: 'Мимо!', reward: Math.floor(score / 8), text: 'Счёт: ' + score, onAgain: reset }); }
      this.unmount = a.stop; reset();
    }
  });

  /* ---------- Кликер ---------- */
  Games.register({
    id: 'clicker', title: 'Монетный кликер', icon: '💰', cat: 'arcade', desc: 'Тапай по монете, покупай улучшения', bestLabel: 'Всего',
    mount(screen, api) {
      const { h } = api; let st = api.load('clicker', { total: 0, perTap: 1, auto: 0, bank: 0 }); let timer, bankEl, coinEl;
      const UPS = [['👆 +1 за тап', () => 30 * st.perTap, () => st.perTap++], ['🤖 Автоклик +1/с', () => 50 + st.auto * 40, () => st.auto++]];
      function render() {
        screen.innerHTML = ''; const hdr = api.header(screen, [{ label: 'За тап', value: st.perTap }, { label: 'В сек.', value: st.auto }, { label: 'Всего', value: st.total }]);
        bankEl = h('div', { style: 'font-size:32px;font-weight:800;color:var(--gold)' }, st.bank + ' ●');
        coinEl = h('div', { style: 'font-size:120px;line-height:1;transition:transform .08s;cursor:pointer', onpointerdown: () => { st.bank += st.perTap; st.total += st.perTap; coinEl.style.transform = 'scale(.9)'; setTimeout(() => coinEl.style.transform = '', 80); api.vibrate(4); upd(); hdr.set(2, st.total); } }, '🪙');
        const ups = h('div', { style: 'display:flex;flex-direction:column;gap:8px;width:100%;max-width:340px' }, UPS.map(([n, cost, act]) => h('button', { class: 'btn', style: 'justify-content:space-between', onclick: () => { if (st.bank >= cost()) { st.bank -= cost(); act(); api.sound('good'); render(); } else api.sound('bad'); } }, n, h('b', null, cost() + ' ●'))));
        screen.append(h('div', { class: 'game-area', style: 'gap:16px' }, bankEl, coinEl, ups, h('button', { class: 'btn gold', onclick: () => { if (st.bank < 100) { api.toast('Минимум 100 в банке'); return; } const n = Math.floor(st.bank / 100) * 10; st.bank -= n * 10; api.addCoins(n); api.best('clicker', st.total); upd(); } }, 'Обменять 100 → 10 монет'), h('div', { class: 'hint-text' }, 'Банк копится, пока вы играете в кликер')));
      }
      function upd() { bankEl.textContent = st.bank + ' ●'; api.store('clicker', st); }
      timer = setInterval(() => { if (st.auto) { st.bank += st.auto; st.total += st.auto; upd(); } }, 1000);
      this.unmount = () => clearInterval(timer);
      render();
    }
  });

  /* ---------- Цвета (Струп) ---------- */
  Games.register({
    id: 'stroop', title: 'Цвет слова', icon: '🌈', cat: 'brain', desc: 'Выбери цвет, которым написано слово, а не само слово', bestLabel: 'Рекорд',
    mount(screen, api) {
      const { h } = api; const C = [['КРАСНЫЙ', '#f87171'], ['ЗЕЛЁНЫЙ', '#34d399'], ['СИНИЙ', '#60a5fa'], ['ЖЁЛТЫЙ', '#fbbf24']]; let score, timeLeft, timer, hdr, ans;
      function start() { score = 0; timeLeft = 30; clearInterval(timer); timer = setInterval(() => { timeLeft--; hdr.set(1, timeLeft); if (timeLeft <= 0) finish(); }, 1000); next(); }
      function next() {
        const w = api.rand(0, 3); ans = api.rand(0, 3); screen.innerHTML = ''; hdr = api.header(screen, [{ label: 'Счёт', value: score }, { label: '⏱', value: timeLeft }, { label: 'Рекорд', value: api.bestOf('stroop') || 0 }]);
        screen.append(h('div', { class: 'game-area', style: 'gap:30px' }, h('div', { style: 'font-size:38px;font-weight:900;color:' + C[ans][1] }, C[w][0]), h('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:10px;width:min(90vw,320px)' }, C.map((c, i) => h('button', { class: 'btn', style: 'padding:22px;background:' + c[1], onclick: () => { if (i === ans) { score++; api.sound('good'); if (score % 10 === 0) api.addCoins(3); } else { api.sound('bad'); api.vibrate(40); timeLeft = Math.max(1, timeLeft - 2); } next(); } }, '')))));
      }
      function finish() { clearInterval(timer); api.best('stroop', score); api.end({ title: 'Время вышло', reward: Math.floor(score / 3), text: 'Верно: ' + score, onAgain: start }); }
      this.unmount = () => clearInterval(timer);
      start();
    }
  });

  /* ---------- Пинг-понг ---------- */
  Games.register({
    id: 'pong', title: 'Пинг-понг', icon: '🏓', cat: 'arcade', desc: 'До 7 очков против компьютера', bestLabel: 'Побед',
    mount(screen, api) {
      const W = 360, H = 560, PW = 80; let px, ax, ball, sm, sa, over, wins = api.load('pong_w', 0);
      function reset() { px = W / 2; ax = W / 2; sm = 0; sa = 0; over = false; serve(1); a.hdr.set(0, 0); a.hdr.set(1, 0); }
      function serve(d) { ball = { x: W / 2, y: H / 2, vx: (Math.random() - .5) * 200, vy: 300 * d }; }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Вы', value: 0 }, { label: 'ПК', value: 0 }, { label: 'Побед', value: wins }], hint: 'Веди пальцем — ракетка снизу',
        onDown: p => px = p.x, onMove: (p, e) => { if (e.buttons || e.pointerType === 'touch') px = p.x; }, onKey: e => { if (e.key === 'ArrowLeft') px -= 30; if (e.key === 'ArrowRight') px += 30; },
        frame(dt, ctx) {
          if (!over) {
            px = Math.max(PW / 2, Math.min(W - PW / 2, px)); ax += (ball.x - ax) * Math.min(1, dt * (2.5 + Math.min(3, (sm + sa) * .3))); ax = Math.max(PW / 2, Math.min(W - PW / 2, ax));
            ball.x += ball.vx * dt; ball.y += ball.vy * dt; if (ball.x < 8) { ball.x = 8; ball.vx *= -1; } if (ball.x > W - 8) { ball.x = W - 8; ball.vx *= -1; }
            if (ball.vy > 0 && ball.y > H - 40 && ball.y < H - 24 && Math.abs(ball.x - px) < PW / 2 + 8) { ball.vy = -Math.abs(ball.vy) * 1.05; ball.vx += (ball.x - px) * 5; api.sound('tap'); api.vibrate(5); }
            if (ball.vy < 0 && ball.y < 40 && ball.y > 24 && Math.abs(ball.x - ax) < PW / 2 + 8) { ball.vy = Math.abs(ball.vy) * 1.05; ball.vx += (ball.x - ax) * 5; api.sound('select'); }
            if (ball.y > H + 10) { sa++; a.hdr.set(1, sa); api.sound('bad'); serve(-1); } if (ball.y < -10) { sm++; a.hdr.set(0, sm); api.sound('good'); serve(1); }
            if (sm >= 7 || sa >= 7) { over = true; if (sm > sa) { wins++; api.store('pong_w', wins); api.best('pong', wins); api.end({ title: 'Победа 7:' + sa + '!', reward: 20, onAgain: reset }); } else api.end({ win: false, title: 'Поражение ' + sm + ':7', onAgain: reset }); }
          }
          ctx.fillStyle = '#171728'; ctx.fillRect(0, 0, W, H); ctx.strokeStyle = '#3b3b6b'; ctx.setLineDash([10, 10]); ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke(); ctx.setLineDash([]);
          rr(ctx, px - PW / 2, H - 36, PW, 12, 6, '#22d3ee'); rr(ctx, ax - PW / 2, 24, PW, 12, 6, '#f87171'); circ(ctx, ball.x, ball.y, 8, '#fff');
        } });
      this.unmount = a.stop; reset();
    }
  });

  /* ---------- Мини-гольф ---------- */
  Games.register({
    id: 'minigolf', title: 'Мини-гольф', icon: '⛳', cat: 'arcade', desc: 'Оттяни и отпусти — загони мяч в лунку', progress: api => 'Уровень ' + (api.level('minigolf').lvl + 1),
    mount(screen, api) {
      const W = 360, H = 560; const L = api.level('minigolf'); let ball, hole, walls, strokes, drag, dragP, done;
      function gen() { ball = { x: W / 2, y: H - 60, vx: 0, vy: 0 }; hole = { x: api.rand(50, W - 50), y: api.rand(60, 160) }; walls = []; const n = Math.min(6, 1 + Math.floor(L.lvl / 3)); for (let i = 0; i < n; i++) { const vert = Math.random() < .4; const w = vert ? 14 : api.rand(60, 160), hh = vert ? api.rand(60, 160) : 14; const x = api.rand(20, W - 20 - w), y = api.rand(200, H - 160 - hh); if (Math.hypot(x + w / 2 - hole.x, y + hh / 2 - hole.y) < 80) continue; walls.push({ x, y, w, h: hh }); } strokes = 0; done = false; drag = false; a.hdr.set(1, 0); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Уровень', value: L.lvl + 1 }, { label: 'Удары', value: 0 }], hint: 'Оттяни от мяча и отпусти',
        onDown: p => { if (done) return; if (Math.hypot(ball.vx, ball.vy) < 5) { drag = true; dragP = p; } }, onMove: p => { if (drag) dragP = p; },
        onUp: p => { if (!drag) return; drag = false; const dx = ball.x - p.x, dy = ball.y - p.y; const d = Math.min(150, Math.hypot(dx, dy)); if (d < 10) return; const s = d * 5; const ang = Math.atan2(dy, dx); ball.vx = Math.cos(ang) * s; ball.vy = Math.sin(ang) * s; strokes++; a.hdr.set(1, strokes); api.sound('tap'); api.vibrate(8); },
        frame(dt, ctx) {
          if (!done) {
            ball.x += ball.vx * dt; ball.y += ball.vy * dt; ball.vx *= Math.pow(0.35, dt); ball.vy *= Math.pow(0.35, dt); if (Math.hypot(ball.vx, ball.vy) < 5) { ball.vx = ball.vy = 0; }
            if (ball.x < 10) { ball.x = 10; ball.vx *= -.8; } if (ball.x > W - 10) { ball.x = W - 10; ball.vx *= -.8; } if (ball.y < 10) { ball.y = 10; ball.vy *= -.8; } if (ball.y > H - 10) { ball.y = H - 10; ball.vy *= -.8; }
            for (const w of walls) if (ball.x + 8 > w.x && ball.x - 8 < w.x + w.w && ball.y + 8 > w.y && ball.y - 8 < w.y + w.h) { const ox = Math.min(ball.x + 8 - w.x, w.x + w.w - ball.x + 8), oy = Math.min(ball.y + 8 - w.y, w.y + w.h - ball.y + 8); if (ox < oy) { ball.vx *= -.8; ball.x += ball.vx > 0 ? ox : -ox; } else { ball.vy *= -.8; ball.y += ball.vy > 0 ? oy : -oy; } }
            if (Math.hypot(ball.x - hole.x, ball.y - hole.y) < 14 && Math.hypot(ball.vx, ball.vy) < 350) { done = true; L.done(); api.end({ title: strokes === 1 ? 'Hole in one!' : 'В лунке!', reward: Math.max(3, 15 - strokes * 2) + (strokes === 1 ? 10 : 0), text: 'Ударов: ' + strokes, again: 'Дальше', onAgain: gen }); }
          }
          ctx.fillStyle = '#15803d'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#166534'; for (let y = 0; y < H; y += 40) ctx.fillRect(0, y, W, 20);
          walls.forEach(w => rr(ctx, w.x, w.y, w.w, w.h, 4, '#78350f')); circ(ctx, hole.x, hole.y, 14, '#111'); rr(ctx, hole.x - 1, hole.y - 40, 3, 40, 1, '#fff'); ctx.fillStyle = '#f87171'; ctx.beginPath(); ctx.moveTo(hole.x + 2, hole.y - 40); ctx.lineTo(hole.x + 22, hole.y - 32); ctx.lineTo(hole.x + 2, hole.y - 24); ctx.fill();
          if (drag) { const dx = ball.x - dragP.x, dy = ball.y - dragP.y; const d = Math.min(150, Math.hypot(dx, dy)); const ang = Math.atan2(dy, dx); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ball.x, ball.y); ctx.lineTo(ball.x + Math.cos(ang) * d, ball.y + Math.sin(ang) * d); ctx.stroke(); }
          circ(ctx, ball.x, ball.y, 8, '#fff');
        } });
      this.unmount = a.stop; gen();
    }
  });
})();
