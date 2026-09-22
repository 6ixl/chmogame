/* Игры на удачу — ставки монетами */
(function () {
  const rr = (ctx, x, y, w, h, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); };
  const circ = (ctx, x, y, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); };
  const betRow = (api, h, bets, cur, onPick) => h('div', { class: 'row' }, h('span', { class: 'hint-text' }, 'Ставка:'), bets.map(b => h('button', { class: 'btn small ' + (cur === b ? 'primary' : ''), onclick: () => onPick(b) }, b)));
  const payout = (api, id, bet, mult, title) => { const win = Math.round(bet * mult); if (win > 0) { api.best(id, win); api.addCoins(win); api.sound(mult >= 5 ? 'win' : 'good'); } else api.sound('bad'); api.toast(win > 0 ? `${title}: +${win}` : title); };

  /* ---------- Слоты ---------- */
  Games.register({ id: 'slots', title: 'Слоты', icon: '🎰', cat: 'luck', desc: 'Три барабана с прокруткой, джекпот и конфетти', bestLabel: 'Лучший выигрыш',
    mount(screen, api) {
      const { h } = api; const W = 360, H = 560; const SYM = ['🍒', '🍋', '🔔', '⭐', '7️⃣', '💎']; const PAY = [5, 8, 12, 20, 50, 100];
      const RH2 = 96, VIS = 3, N = SYM.length;
      let bet = 5, reels = [0, 1, 2].map(i => ({ pos: 0, vel: 0, stopAt: -1, spinning: false, res: 0 })), spinning = false, confetti = [], cross = 0, winFlash = 0, lastWin = 0, betsEl;
      const CX = W / 2, RY = 185, RW2 = 96;
      function spin() {
        if (spinning || !api.spend(bet)) return; a.hdr.set(0, api.coins); lastWin = 0; confetti = []; cross = 0;
        spinning = true; api.sound('tap'); api.vibrate(8);
        reels.forEach((r, i) => {
          r.spinning = true; r.res = api.rand(0, N - 1);
          r.t = 0; r.dur = 1.3 + i * 0.7;                       // барабаны останавливаются по очереди: 1 → 2 → 3
          r.from = r.pos;
          const turns = 6 + i * 2;                              // сколько полных оборотов прокрутится
          let cur = ((r.pos % N) + N) % N;
          r.to = r.pos + (N - cur) + turns * N + r.res;         // ровно на нужном символе
        });
      }
      function finishSpin() {
        spinning = false; const [x, y, z] = reels.map(r => r.res);
        let mult = 0; if (x === y && y === z) mult = PAY[x]; else if (x === y || y === z || x === z) mult = 2;
        const w = Math.round(bet * mult); lastWin = w;
        if (w > 0) { api.best('slots', w); api.addCoins(w); api.sound('win'); api.vibrate([20, 40, 20, 40, 60]); winFlash = 1;
          for (let i = 0; i < 140; i++) confetti.push({ x: Math.random() * W, y: -Math.random() * H, vx: (Math.random() - .5) * 120, vy: 120 + Math.random() * 260, rot: Math.random() * 7, vr: (Math.random() - .5) * 12, c: ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#c084fc', '#22d3ee', '#fff'][api.rand(0, 6)], w: 6 + Math.random() * 8, h: 8 + Math.random() * 10 });
        } else { api.sound('bad'); api.vibrate(60); cross = 1.4; }
        a.hdr.set(0, api.coins); renderBets();
      }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Монеты', value: api.coins }, { label: 'Рекорд', value: api.bestOf('slots') || 0 }], hint: 'Три одинаковых — джекпот, два — ×2',
        onDown: p => { if (p.y > 350 && p.y < 420) spin(); },
        frame(dt, ctx) {
          // физика барабанов: плавное торможение до заданного символа
          let allStopped = true;
          reels.forEach(r => {
            if (!r.spinning) return; allStopped = false;
            r.t += dt;
            const k = Math.min(1, r.t / r.dur);
            const ease = 1 - Math.pow(1 - k, 3);                 // быстро в начале, мягко в конце
            r.pos = r.from + (r.to - r.from) * ease;
            if (k >= 1) { r.pos = r.to; r.spinning = false; r.bounce = 0.18; api.sound('select'); api.vibrate(12); }
          });
          reels.forEach(r => { if (r.bounce > 0) r.bounce -= dt; });
          if (spinning && allStopped) finishSpin();
          confetti.forEach(c => { c.x += c.vx * dt; c.y += c.vy * dt; c.vy += 240 * dt; c.rot += c.vr * dt; }); confetti = confetti.filter(c => c.y < H + 40);
          cross = Math.max(0, cross - dt); winFlash = Math.max(0, winFlash - dt * 0.8);
          // фон
          const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#3b0764'); g.addColorStop(1, '#1e1b4b'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
          for (let i = 0; i < 16; i++) { const on = (Math.floor(performance.now() / 300) + i) % 2 === 0; ctx.fillStyle = on ? '#fbbf24' : '#78350f'; ctx.beginPath(); ctx.arc(20 + i * 21, 24, 5, 0, 7); ctx.fill(); }
          // корпус автомата
          ctx.fillStyle = '#7f1d1d'; ctx.beginPath(); ctx.roundRect(18, 60, W - 36, 275, 18); ctx.fill();
          ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 5; ctx.beginPath(); ctx.roundRect(18, 60, W - 36, 275, 18); ctx.stroke();
          ctx.fillStyle = '#fff'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🎰 СЛОТЫ', W / 2, 82);
          // барабаны с прокруткой
          reels.forEach((r, i) => {
            const x = 36 + i * 100; ctx.save(); ctx.beginPath(); ctx.roundRect(x, RY - RH2 / 2 - 24, RW2 - 8, RH2 + 48, 10); ctx.clip();
            ctx.fillStyle = '#f8fafc'; ctx.fillRect(x, RY - RH2 / 2 - 24, RW2 - 8, RH2 + 48);
            const bounceOff = r.bounce > 0 ? Math.sin(r.bounce * 30) * 6 : 0;
            const frac = ((r.pos % 1) + 1) % 1;
            for (let k = -2; k <= 2; k++) {
              const idx = ((Math.floor(r.pos) + k) % N + N) % N;
              const y = RY + (k - frac) * 52 + bounceOff;
              ctx.font = '40px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
              ctx.globalAlpha = Math.max(0, 1 - Math.abs(y - RY) / 70); ctx.fillText(SYM[idx], x + (RW2 - 8) / 2, y); ctx.globalAlpha = 1;
            }
            // блики стекла
            const gg = ctx.createLinearGradient(0, RY - 70, 0, RY + 70); gg.addColorStop(0, 'rgba(0,0,0,.45)'); gg.addColorStop(.5, 'rgba(255,255,255,0)'); gg.addColorStop(1, 'rgba(0,0,0,.45)'); ctx.fillStyle = gg; ctx.fillRect(x, RY - RH2 / 2 - 24, RW2 - 8, RH2 + 48);
            ctx.restore();
            ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(x, RY - RH2 / 2 - 24, RW2 - 8, RH2 + 48, 10); ctx.stroke();
          });
          // линия выплаты
          ctx.strokeStyle = 'rgba(239,68,68,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(30, RY); ctx.lineTo(W - 30, RY); ctx.stroke();
          // кнопка
          ctx.fillStyle = spinning ? '#6b7280' : '#dc2626'; ctx.beginPath(); ctx.roundRect(W / 2 - 85, 352, 170, 60, 30); ctx.fill();
          ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(W / 2 - 85, 352, 170, 60, 30); ctx.stroke();
          ctx.fillStyle = '#fff'; ctx.font = 'bold 22px sans-serif'; ctx.fillText(spinning ? '…' : 'КРУТИТЬ ' + bet, W / 2, 382);
          // таблица выплат
          ctx.font = 'bold 13px sans-serif'; ctx.fillStyle = '#e5e7eb'; SYM.forEach((sym, i) => { const x = 40 + (i % 3) * 110, y = 440 + Math.floor(i / 3) * 30; ctx.textAlign = 'left'; ctx.fillText(sym + sym + sym + ' ×' + PAY[i], x, y); });
          ctx.textAlign = 'center'; ctx.fillStyle = '#9ca3af'; ctx.font = '12px sans-serif'; ctx.fillText('Два одинаковых — ×2', W / 2, 508);
          if (lastWin > 0 && !spinning) { ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 26px sans-serif'; ctx.fillText('ВЫИГРЫШ +' + lastWin, W / 2, 536); }
          if (winFlash > 0) { ctx.fillStyle = 'rgba(251,191,36,' + winFlash * 0.25 + ')'; ctx.fillRect(0, 0, W, H); }
          // конфетти поверх всего
          confetti.forEach(c => { ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rot); ctx.fillStyle = c.c; ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h); ctx.restore(); });
          // крестик при проигрыше
          if (cross > 0) { const k = Math.min(1, (1.4 - cross) * 3); ctx.strokeStyle = 'rgba(239,68,68,' + Math.min(1, cross * 1.6) + ')'; ctx.lineWidth = 16; ctx.lineCap = 'round'; const c0 = 70, cy2 = RY; ctx.beginPath(); ctx.moveTo(W / 2 - c0, cy2 - c0); ctx.lineTo(W / 2 - c0 + 2 * c0 * Math.min(1, k * 2), cy2 - c0 + 2 * c0 * Math.min(1, k * 2)); ctx.stroke(); if (k > 0.5) { ctx.beginPath(); ctx.moveTo(W / 2 + c0, cy2 - c0); ctx.lineTo(W / 2 + c0 - 2 * c0 * Math.min(1, (k - 0.5) * 2), cy2 - c0 + 2 * c0 * Math.min(1, (k - 0.5) * 2)); ctx.stroke(); } }
        } });
      betsEl = h('div', { class: 'bottom-bar' });
      function renderBets() { betsEl.innerHTML = ''; betsEl.append(h('div', { class: 'row' }, h('span', { class: 'hint-text' }, 'Ставка:'), [5, 10, 25, 50, 100].map(v => h('button', { class: 'btn small ' + (bet === v ? 'gold' : ''), onclick: () => { bet = v; renderBets(); api.sound('tap'); } }, v)))); }
      renderBets(); screen.append(betsEl);
      window.__slots = () => ({ spinning, reels: reels.map(r => (r.spinning ? 'крутится' : 'стоп:' + SYM[r.res])), win: lastWin });
      this.unmount = a.stop;
    } });

  /* ---------- Рулетка ---------- */
  Games.register({ id: 'roulette', title: 'Рулетка', icon: '🎡', cat: 'luck', desc: 'Настоящее колесо с шариком: красное/чёрное, чёт/нечет, дюжины, число', bestLabel: 'Лучший выигрыш',
    mount(screen, api) {
      const { h } = api; const W = 360, H = 620;
      const ORDER = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
      const RED = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
      const KINDS = [['red', '🔴 Красное', 2], ['black', '⚫ Чёрное', 2], ['even', 'Чёт', 2], ['odd', 'Нечет', 2], ['low', '1–18', 2], ['high', '19–36', 2], ['d1', '1–12', 3], ['d2', '13–24', 3], ['d3', '25–36', 3], ['num', 'Число', 36]];
      let bet = 10, type = 'red', num = 7, spinning = false, ang = 0, vel = 0, ballA = 0, ballV = 0, ballR = 128, result = -1, settle = 0, history = api.load('roul_hist', []), flash = 0, betsEl;
      const CX = W / 2, CY = 215, R = 150;
      const slotAngle = n => ORDER.indexOf(n) * 2 * Math.PI / 37;
      function spin() {
        if (spinning) return; if (!api.spend(bet)) return; a.hdr.set(0, api.coins);
        spinning = true; result = -1; settle = 0; vel = 7 + Math.random() * 2.5; ballV = -(13 + Math.random() * 3); ballR = 128; api.sound('tap'); api.vibrate(10);
      }
      function land() {
        // определяем сектор под шариком
        const rel = ((ballA - ang) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        result = ORDER[Math.round(rel / (2 * Math.PI / 37)) % 37];
        const n = result; const win = (type === 'red' && RED.has(n)) || (type === 'black' && n > 0 && !RED.has(n)) || (type === 'even' && n > 0 && n % 2 === 0) || (type === 'odd' && n % 2 === 1) || (type === 'low' && n >= 1 && n <= 18) || (type === 'high' && n >= 19) || (type === 'd1' && n >= 1 && n <= 12) || (type === 'd2' && n >= 13 && n <= 24) || (type === 'd3' && n >= 25) || (type === 'num' && n === num);
        history.unshift(n); history = history.slice(0, 12); api.store('roul_hist', history);
        const mult = win ? KINDS.find(k => k[0] === type)[2] : 0; const w = Math.round(bet * mult);
        if (w > 0) { api.best('roulette', w); api.addCoins(w); api.sound('win'); api.vibrate([20, 40, 20]); flash = 1; } else { api.sound('bad'); api.vibrate(40); }
        api.toast(n + (win ? ' — выигрыш +' + w : ' — мимо')); a.hdr.set(0, api.coins); renderBets();
      }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Монеты', value: api.coins }, { label: 'Рекорд', value: api.bestOf('roulette') || 0 }], hint: 'Выберите ставку и крутите',
        onDown: p => { if (p.y > 380 && p.y < 430) spin(); },
        frame(dt, ctx) {
          if (spinning) {
            ang += vel * dt; vel *= Math.pow(0.55, dt); ballA += ballV * dt; ballV *= Math.pow(0.42, dt);
            if (Math.abs(ballV) < 2.4 && ballR > 104) { ballR -= 34 * dt; }
            if (Math.abs(ballV) < 1.2) { // шарик цепляется за сектор
              settle += dt; const rel = ((ballA - ang) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI); const step = 2 * Math.PI / 37;
              const target = Math.round(rel / step) * step; ballA += (target - rel) * Math.min(1, dt * 6) + (vel - ballV) * 0 ; ballV += (vel - ballV) * Math.min(1, dt * 3);
              if (settle > 1.1) { spinning = false; ballV = vel; land(); }
            }
            if (ballR > 104 && Math.abs(ballV) < 4) ballR -= 18 * dt;
          } else if (result >= 0) { ang += vel * dt; ballA += vel * dt; vel *= Math.pow(0.9, dt); }
          flash = Math.max(0, flash - dt * 1.2);
          // фон
          const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#14532d'); g.addColorStop(1, '#052e16'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
          // колесо
          ctx.save(); ctx.translate(CX, CY);
          ctx.fillStyle = '#3f2d16'; ctx.beginPath(); ctx.arc(0, 0, R + 18, 0, 7); ctx.fill();
          ctx.strokeStyle = '#a16207'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, R + 14, 0, 7); ctx.stroke();
          ctx.rotate(ang);
          for (let i = 0; i < 37; i++) {
            const n = ORDER[i]; const a1 = i * 2 * Math.PI / 37 - Math.PI / 37, a2 = a1 + 2 * Math.PI / 37;
            ctx.fillStyle = n === 0 ? '#15803d' : RED.has(n) ? '#dc2626' : '#111827';
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R, a1, a2); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = 'rgba(212,175,55,.5)'; ctx.lineWidth = 1; ctx.stroke();
            ctx.save(); ctx.rotate(i * 2 * Math.PI / 37); ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(n, R - 8, 0); ctx.restore();
          }
          ctx.fillStyle = '#7c2d12'; ctx.beginPath(); ctx.arc(0, 0, 52, 0, 7); ctx.fill();
          ctx.fillStyle = '#a16207'; ctx.beginPath(); ctx.arc(0, 0, 44, 0, 7); ctx.fill();
          for (let i = 0; i < 8; i++) { ctx.save(); ctx.rotate(i * Math.PI / 4); ctx.fillStyle = '#7c2d12'; ctx.fillRect(-3, -50, 6, 50); ctx.restore(); }
          ctx.restore();
          // шарик
          const bx = CX + Math.cos(ballA) * ballR, by = CY + Math.sin(ballA) * ballR;
          ctx.fillStyle = '#fff'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(bx, by, 8, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.arc(bx + 2, by + 2, 4, 0, 7); ctx.fill();
          // результат
          if (result >= 0 && !spinning) { ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(CX - 52, CY - 26, 104, 52); ctx.strokeStyle = result === 0 ? '#22c55e' : RED.has(result) ? '#dc2626' : '#fff'; ctx.lineWidth = 3; ctx.strokeRect(CX - 52, CY - 26, 104, 52); ctx.fillStyle = result === 0 ? '#22c55e' : RED.has(result) ? '#f87171' : '#fff'; ctx.font = 'bold 34px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(result, CX, CY); }
          // история
          ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          history.slice(0, 10).forEach((n, i) => { const x = 28 + i * 34; ctx.fillStyle = n === 0 ? '#15803d' : RED.has(n) ? '#dc2626' : '#111827'; ctx.beginPath(); ctx.roundRect(x - 13, 8, 26, 22, 5); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillText(n, x, 19); });
          // кнопка
          ctx.fillStyle = spinning ? 'rgba(120,120,120,.5)' : '#dc2626'; ctx.beginPath(); ctx.roundRect(W / 2 - 90, 380, 180, 50, 25); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.font = 'bold 20px sans-serif'; ctx.fillText(spinning ? 'КРУТИТСЯ…' : 'КРУТИТЬ', W / 2, 405);
          if (flash > 0) { ctx.fillStyle = 'rgba(251,191,36,' + flash * 0.35 + ')'; ctx.fillRect(0, 0, W, H); }
        } });
      // панель ставок под холстом
      betsEl = h('div', { class: 'bottom-bar', style: 'width:100%' });
      function renderBets() {
        betsEl.innerHTML = '';
        betsEl.append(h('div', { class: 'row', style: 'gap:6px' }, h('span', { class: 'hint-text' }, 'Ставка:'), [5, 10, 25, 50, 100].map(v => h('button', { class: 'btn small ' + (bet === v ? 'gold' : ''), onclick: () => { bet = v; renderBets(); api.sound('tap'); } }, v))));
        betsEl.append(h('div', { style: 'display:grid;grid-template-columns:repeat(5,1fr);gap:5px;padding-top:6px' }, KINDS.map(([k, n, m]) => h('button', { class: 'btn small ' + (type === k ? 'primary' : ''), style: 'font-size:11px;padding:8px 2px', onclick: () => { type = k; renderBets(); api.sound('tap'); } }, n.replace(/🔴 |⚫ /, '') + ' ×' + m))));
        if (type === 'num') betsEl.append(h('div', { class: 'row', style: 'padding-top:6px' }, h('button', { class: 'btn small', onclick: () => { num = (num + 36) % 37; renderBets(); } }, '−'), h('b', { style: 'font-size:20px;min-width:40px;text-align:center' }, num), h('button', { class: 'btn small', onclick: () => { num = (num + 1) % 37; renderBets(); } }, '+')));
      }
      renderBets(); screen.append(betsEl);
      this.unmount = a.stop;
    } });

  /* ---------- Плинко ---------- */
  Games.register({ id: 'plinko', title: 'Плинко', icon: '🔻', cat: 'luck', desc: 'Брось шарик сверху — куда он упадёт?', bestLabel: 'Лучший выигрыш',
    mount(screen, api) {
      const W = 360, H = 520, ROWS = 9; let balls = [], bet = 5, pegs = [], MULT = [10, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 10];
      for (let r = 0; r < ROWS; r++) for (let c = 0; c <= r + 1; c++) pegs.push({ x: W / 2 + (c - (r + 1) / 2) * 32, y: 80 + r * 42 });
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Монеты', value: api.coins }, { label: 'Ставка', value: bet }], hint: 'Тап по полю — бросить шарик (ставка списывается)',
        onDown: p => { if (p.y > H - 50) { bet = bet === 5 ? 10 : bet === 10 ? 25 : 5; a.hdr.set(1, bet); return; } if (!api.spend(bet)) return; a.hdr.set(0, api.coins); balls.push({ x: W / 2 + api.rand(-4, 4), y: 20, vx: 0, vy: 0, bet }); api.sound('tap'); },
        frame(dt, ctx) {
          for (const b of balls) { b.vy += 900 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.vx *= 0.995; for (const p of pegs) { const dx = b.x - p.x, dy = b.y - p.y; const d = Math.hypot(dx, dy); if (d < 12) { const nx = dx / d, ny = dy / d; b.x = p.x + nx * 12; b.y = p.y + ny * 12; const dot = b.vx * nx + b.vy * ny; b.vx = (b.vx - 2 * dot * nx) * 0.6 + (Math.random() - .5) * 60; b.vy = (b.vy - 2 * dot * ny) * 0.6; } } if (b.x < 8) { b.x = 8; b.vx = Math.abs(b.vx); } if (b.x > W - 8) { b.x = W - 8; b.vx = -Math.abs(b.vx); } if (b.y > H - 60) { b.done = true; const slot = Math.max(0, Math.min(10, Math.floor(b.x / (W / 11)))); payout(api, 'plinko', b.bet, MULT[slot], '×' + MULT[slot]); a.hdr.set(0, api.coins); } }
          balls = balls.filter(b => !b.done);
          ctx.fillStyle = '#171728'; ctx.fillRect(0, 0, W, H); pegs.forEach(p => circ(ctx, p.x, p.y, 4, '#9a9ab8'));
          MULT.forEach((m, i) => { rr(ctx, i * W / 11 + 2, H - 60, W / 11 - 4, 30, 4, m >= 3 ? '#b45309' : m >= 1 ? '#1f5c43' : '#3b3b6b'); ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('×' + m, i * W / 11 + W / 22, H - 45); });
          rr(ctx, 0, H - 26, W, 26, 0, '#26264a'); ctx.fillStyle = '#fff'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Ставка: ' + bet + ' (тап здесь — сменить)', W / 2, H - 13);
          balls.forEach(b => circ(ctx, b.x, b.y, 7, '#fbbf24'));
        } });
      this.unmount = a.stop;
    } });

  /* ---------- Колесо фортуны ---------- */
  Games.register({ id: 'wheel', title: 'Колесо фортуны', icon: '🎯', cat: 'luck', desc: 'Крути колесо раз в час бесплатно или за 10 монет', bestLabel: 'Лучший приз',
    mount(screen, api) {
      const W = 360, H = 400; const SEG = [5, 20, 0, 50, 10, 100, 0, 30, 15, 200, 5, 10]; let ang = 0, vel = 0, spinning = false, free = api.load('wheel_t', 0);
      const COL = ['#f87171', '#fbbf24', '#3b3b6b', '#34d399', '#60a5fa', '#c084fc', '#3b3b6b', '#22d3ee', '#fb923c', '#f472b6', '#a3e635', '#e879f9'];
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Монеты', value: api.coins }, { label: 'Рекорд', value: api.bestOf('wheel') || 0 }], hint: 'Тап — крутить',
        onDown: () => { if (spinning) return; const now = Date.now(); if (now - free > 3600e3) { free = now; api.store('wheel_t', free); api.toast('Бесплатный спин!'); } else if (!api.spend(10)) return; a.hdr.set(0, api.coins); spinning = true; vel = 12 + Math.random() * 10; api.sound('tap'); },
        frame(dt, ctx) {
          if (spinning) { ang += vel * dt; vel *= Math.pow(0.35, dt); if (vel < 0.15) { spinning = false; const n = SEG.length; const idx = Math.floor(((-ang % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) + Math.PI / n) / (2 * Math.PI / n)) % n; const prize = SEG[(idx + n) % n]; if (prize) { api.best('wheel', prize); api.addCoins(prize); api.sound('win'); api.vibrate([20, 30, 20]); } else { api.sound('bad'); api.toast('Пусто'); } a.hdr.set(0, api.coins); } }
          ctx.fillStyle = '#171728'; ctx.fillRect(0, 0, W, H); const cx = W / 2, cy = H / 2 + 10, R = 160; const n = SEG.length;
          SEG.forEach((s, i) => { ctx.fillStyle = COL[i]; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, ang + i * 2 * Math.PI / n - Math.PI / n, ang + (i + 1) * 2 * Math.PI / n - Math.PI / n); ctx.fill(); ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang + i * 2 * Math.PI / n); ctx.fillStyle = '#fff'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(s || '✕', R - 12, 0); ctx.restore(); });
          circ(ctx, cx, cy, 22, '#1e1e33'); ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.moveTo(cx + R + 18, cy); ctx.lineTo(cx + R - 10, cy - 12); ctx.lineTo(cx + R - 10, cy + 12); ctx.fill();
          ctx.fillStyle = '#9a9ab8'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(Date.now() - free > 3600e3 ? 'Бесплатный спин доступен' : 'Следующий бесплатный через ' + Math.ceil((3600e3 - (Date.now() - free)) / 60000) + ' мин · сейчас 10 монет', W / 2, 18);
        } });
      this.unmount = a.stop;
    } });

  /* ---------- Орёл или решка ---------- */
  Games.register({ id: 'coinflip', title: 'Орёл или решка', icon: '🪙', cat: 'luck', desc: 'Угадывай подряд — выигрыш удваивается. Забери вовремя', bestLabel: 'Рекорд серии',
    mount(screen, api) {
      const { h } = api; let streak, pot, bet = 5, coinEl, busy;
      function start() { streak = 0; pot = 0; render(); }
      function render() { screen.innerHTML = ''; api.header(screen, [{ label: 'Монеты', value: api.coins }, { label: 'Серия', value: streak }, { label: 'Банк', value: pot }]); coinEl = h('div', { style: 'font-size:100px;transition:transform .5s' }, '🪙'); screen.append(h('div', { class: 'game-area', style: 'gap:20px' }, coinEl, pot ? null : betRow(api, h, [5, 10, 25], bet, b => { bet = b; render(); }), h('div', { class: 'row' }, h('button', { class: 'btn primary', style: 'font-size:18px', onclick: () => flip(0) }, '🦅 Орёл'), h('button', { class: 'btn primary', style: 'font-size:18px', onclick: () => flip(1) }, '🔘 Решка')), pot ? h('button', { class: 'btn gold', onclick: () => { api.best('coinflip', streak); api.addCoins(pot); api.sound('win'); start(); } }, 'Забрать ' + pot) : null)); }
      function flip(g) { if (busy) return; if (!pot && !api.spend(bet)) return; busy = true; coinEl.style.transform = 'rotateY(1080deg)'; api.sound('tap'); setTimeout(() => { const r = api.rand(0, 1); coinEl.textContent = r ? '🔘' : '🦅'; coinEl.style.transform = ''; busy = false; if (r === g) { streak++; pot = pot ? pot * 2 : bet * 2; api.sound('good'); api.vibrate(10); render(); } else { api.sound('bad'); api.vibrate(50); api.end({ win: false, title: 'Не угадали', text: streak ? 'Сгорело ' + pot : '', onAgain: start }); } }, 500); }
      start();
    } });

  /* ---------- Крэпс ---------- */
  Games.register({ id: 'craps', title: 'Крэпс', icon: '🎲', cat: 'luck', desc: 'Два кубика: 7 или 11 — победа, 2, 3, 12 — проигрыш', bestLabel: 'Лучший выигрыш',
    mount(screen, api) {
      const { h } = api; let point = 0, bet = 10, diceEl, msg;
      function render() { screen.innerHTML = ''; api.header(screen, [{ label: 'Монеты', value: api.coins }, { label: 'Пойнт', value: point || '—' }]); diceEl = h('div', { style: 'font-size:80px' }, '⚀ ⚀'); msg = h('div', { class: 'hint-text', style: 'font-size:16px;min-height:24px' }, point ? 'Выбросьте ' + point + ' раньше семёрки' : 'Первый бросок: 7 или 11 — выигрыш, 2, 3, 12 — проигрыш, иначе — пойнт'); screen.append(h('div', { class: 'game-area', style: 'gap:20px' }, diceEl, msg, point ? null : betRow(api, h, [5, 10, 25, 50], bet, b => { bet = b; render(); }), h('button', { class: 'btn primary', style: 'font-size:20px;padding:14px 40px', onclick: roll }, '🎲 Бросить'))); }
      function roll() { if (!point && !api.spend(bet)) return; const a = api.rand(1, 6), b = api.rand(1, 6), s = a + b; diceEl.textContent = '⚀⚁⚂⚃⚄⚅'[a - 1] + ' ' + '⚀⚁⚂⚃⚄⚅'[b - 1]; api.sound('tap'); api.vibrate(10); if (!point) { if (s === 7 || s === 11) { payout(api, 'craps', bet, 2, 'Натурал ' + s + '!'); } else if (s === 2 || s === 3 || s === 12) { payout(api, 'craps', bet, 0, 'Крэпс ' + s); } else { point = s; api.toast('Пойнт: ' + s); } } else { if (s === point) { payout(api, 'craps', bet, 2, 'Пойнт выбит!'); point = 0; } else if (s === 7) { payout(api, 'craps', bet, 0, 'Семёрка — проигрыш'); point = 0; } } render(); diceEl.textContent = '⚀⚁⚂⚃⚄⚅'[a - 1] + ' ' + '⚀⚁⚂⚃⚄⚅'[b - 1]; }
      render();
    } });

  /* ---------- Баккара ---------- */
  Games.register({ id: 'baccarat', title: 'Баккара', icon: '🎴', cat: 'luck', desc: 'Ставь на игрока, банкира или ничью', bestLabel: 'Лучший выигрыш',
    mount(screen, api) {
      const { h } = api; let bet = 10, side = 'p', res;
      const val = c => c.v >= 10 && c.v <= 13 ? 0 : c.v === 14 ? 1 : c.v; const total = hd => hd.reduce((s, c) => s + val(c), 0) % 10;
      const deck = () => api.shuffle(['♠', '♥', '♦', '♣'].flatMap(s => ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'].map((r, v) => ({ r, s, v: v + 2 }))));
      const show = hd => h('div', { class: 'row' }, hd.map(c => h('div', { class: 'card-face', style: 'color:' + ('♥♦'.includes(c.s) ? '#f87171' : '#fff') }, c.r + c.s)));
      function render() { screen.innerHTML = ''; api.header(screen, [{ label: 'Монеты', value: api.coins }, { label: 'Рекорд', value: api.bestOf('baccarat') || 0 }]); screen.append(h('div', { class: 'game-area', style: 'gap:14px' }, res ? h('div', { style: 'display:flex;flex-direction:column;gap:10px;align-items:center' }, h('div', { class: 'hint-text' }, 'Игрок: ' + total(res.p)), show(res.p), h('div', { class: 'hint-text' }, 'Банкир: ' + total(res.b)), show(res.b)) : h('div', { style: 'font-size:60px' }, '🎴'), betRow(api, h, [5, 10, 25, 50], bet, b => { bet = b; render(); }), h('div', { class: 'row' }, [['p', 'Игрок ×2'], ['b', 'Банкир ×1.95'], ['t', 'Ничья ×8']].map(([k, n]) => h('button', { class: 'btn small ' + (side === k ? 'primary' : ''), onclick: () => { side = k; render(); } }, n))), h('button', { class: 'btn primary', style: 'font-size:18px', onclick: deal }, 'Сдать'))); }
      function deal() { if (!api.spend(bet)) return; const d = deck(); const p = [d.pop(), d.pop()], b = [d.pop(), d.pop()]; if (total(p) < 8 && total(b) < 8) { let p3 = null; if (total(p) <= 5) { p3 = d.pop(); p.push(p3); } const bt = total(b); if (!p3 ? bt <= 5 : (bt <= 2) || (bt === 3 && val(p3) !== 8) || (bt === 4 && val(p3) >= 2 && val(p3) <= 7) || (bt === 5 && val(p3) >= 4 && val(p3) <= 7) || (bt === 6 && (val(p3) === 6 || val(p3) === 7))) b.push(d.pop()); } res = { p, b }; const tp = total(p), tb = total(b); const w = tp > tb ? 'p' : tb > tp ? 'b' : 't'; const mult = w === side ? (side === 'p' ? 2 : side === 'b' ? 1.95 : 8) : (w === 't' && side !== 't' ? 1 : 0); payout(api, 'baccarat', bet, mult, w === 'p' ? 'Игрок' : w === 'b' ? 'Банкир' : 'Ничья'); render(); }
      render();
    } });

  /* ---------- Скретч-карта ---------- */
  Games.register({ id: 'scratch', title: 'Скретч-карта', icon: '🎫', cat: 'luck', desc: 'Сотри 9 полей: три одинаковых суммы — выигрыш', bestLabel: 'Лучший выигрыш',
    mount(screen, api) {
      const { h } = api; let cells, vals, opened, paid;
      function start() { if (!api.spend(10)) { api.toast('Нужно 10 монет'); api.exit(); return; } const pool = [0, 0, 5, 5, 10, 10, 20, 50, 100]; vals = Array.from({ length: 9 }, () => pool[api.rand(0, pool.length - 1)]); if (Math.random() < 0.35) { const v = [5, 10, 20, 50, 100][api.rand(0, 4)]; const idx = api.shuffle([...Array(9).keys()]).slice(0, 3); idx.forEach(i => vals[i] = v); } opened = 0; paid = false; render(); }
      function render() { screen.innerHTML = ''; api.header(screen, [{ label: 'Монеты', value: api.coins }, { label: 'Рекорд', value: api.bestOf('scratch') || 0 }]); const g = h('div', { style: 'display:grid;grid-template-columns:repeat(3,90px);gap:8px' }); cells = vals.map((v, i) => h('div', { class: 'scratch', onclick: e => { const el = e.currentTarget; if (el.classList.contains('open')) return; el.classList.add('open'); el.textContent = v ? v + ' ●' : '✕'; opened++; api.sound('tap'); api.vibrate(6); if (opened === 9) finish(); } }, '?')); g.append(...cells); screen.append(h('div', { class: 'game-area', style: 'gap:16px' }, h('div', { class: 'hint-text' }, 'Карта стоит 10 монет. Три одинаковых числа — выигрыш этой суммы'), g)); }
      function finish() { const cnt = {}; vals.forEach(v => { if (v) cnt[v] = (cnt[v] || 0) + 1; }); const w = Object.keys(cnt).filter(k => cnt[k] >= 3).map(Number).sort((a, b) => b - a)[0]; setTimeout(() => { if (w) { api.best('scratch', w); api.end({ title: 'Выигрыш!', reward: w, again: 'Ещё карту', onAgain: start }); } else api.end({ win: false, title: 'Не повезло', again: 'Ещё карту', onAgain: start }); }, 400); }
      start();
    } });

  /* ---------- Лотерея ---------- */
  Games.register({ id: 'lotto', title: 'Лотерея', icon: '🎱', cat: 'luck', desc: 'Выбери 5 чисел из 30. Угадай 2+ — приз', bestLabel: 'Лучший выигрыш',
    mount(screen, api) {
      const { h } = api; let picks = new Set(), drawn = [];
      function render() { screen.innerHTML = ''; api.header(screen, [{ label: 'Монеты', value: api.coins }, { label: 'Выбрано', value: picks.size + '/5' }]); const g = h('div', { style: 'display:grid;grid-template-columns:repeat(6,1fr);gap:6px;width:100%;max-width:340px' }); for (let n = 1; n <= 30; n++) g.append(h('div', { class: 'pz-cell round' + (picks.has(n) ? ' on' : ''), style: 'height:46px;font-size:16px;' + (drawn.includes(n) ? 'outline:3px solid var(--gold)' : ''), onclick: () => { if (picks.has(n)) picks.delete(n); else if (picks.size < 5) picks.add(n); api.sound('tap'); render(); } }, n)); screen.append(h('div', { class: 'game-area', style: 'gap:14px' }, g, drawn.length ? h('div', { class: 'hint-text' }, 'Выпали: ' + drawn.join(', ')) : null, h('button', { class: 'btn primary', style: 'font-size:18px', disabled: picks.size < 5, onclick: play }, 'Играть за 10'), h('div', { class: 'hint-text' }, '2 совпадения ×2 · 3 ×10 · 4 ×50 · 5 ×500'))); }
      function play() { if (!api.spend(10)) return; drawn = api.shuffle([...Array(30).keys()].map(i => i + 1)).slice(0, 5).sort((a, b) => a - b); const hit = drawn.filter(n => picks.has(n)).length; const mult = [0, 0, 2, 10, 50, 500][hit]; render(); payout(api, 'lotto', 10, mult, 'Совпадений: ' + hit); }
      render();
    } });

  /* ---------- Кости: больше или меньше ---------- */
  Games.register({ id: 'dicehilo', title: 'Кости: выше 7?', icon: '🎲', cat: 'luck', desc: 'Сумма двух кубиков выше, ниже или ровно 7?', bestLabel: 'Лучший выигрыш',
    mount(screen, api) {
      const { h } = api; let bet = 10, diceEl;
      function render() { screen.innerHTML = ''; api.header(screen, [{ label: 'Монеты', value: api.coins }, { label: 'Рекорд', value: api.bestOf('dicehilo') || 0 }]); diceEl = h('div', { style: 'font-size:80px' }, '⚀ ⚀'); screen.append(h('div', { class: 'game-area', style: 'gap:20px' }, diceEl, betRow(api, h, [5, 10, 25, 50], bet, b => { bet = b; render(); }), h('div', { class: 'row' }, h('button', { class: 'btn primary', onclick: () => roll('lo') }, '▼ Ниже 7 ×2'), h('button', { class: 'btn gold', onclick: () => roll('eq') }, '= 7 ×5'), h('button', { class: 'btn primary', onclick: () => roll('hi') }, '▲ Выше 7 ×2')))); }
      function roll(g) { if (!api.spend(bet)) return; const a = api.rand(1, 6), b = api.rand(1, 6), s = a + b; diceEl.textContent = '⚀⚁⚂⚃⚄⚅'[a - 1] + ' ' + '⚀⚁⚂⚃⚄⚅'[b - 1]; api.vibrate(10); const win = (g === 'lo' && s < 7) || (g === 'hi' && s > 7) || (g === 'eq' && s === 7); payout(api, 'dicehilo', bet, win ? (g === 'eq' ? 5 : 2) : 0, 'Сумма ' + s); render(); diceEl.textContent = '⚀⚁⚂⚃⚄⚅'[a - 1] + ' ' + '⚀⚁⚂⚃⚄⚅'[b - 1]; }
      render();
    } });
})();
