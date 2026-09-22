p = 'www/js/games/luck.js'
s = open(p, encoding='utf-8').read()

# ---------- новая рулетка ----------
a = s.index("  /* ---------- Рулетка ---------- */")
b = s.index("  /* ---------- Плинко ---------- */")
roulette = r'''  /* ---------- Рулетка ---------- */
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

'''
s = s[:a] + roulette + s[b:]

# ---------- новые слоты ----------
a = s.index("  /* ---------- Слоты ---------- */")
b = s.index("  /* ---------- Рулетка ---------- */")
slots = r'''  /* ---------- Слоты ---------- */
  Games.register({ id: 'slots', title: 'Слоты', icon: '🎰', cat: 'luck', desc: 'Три барабана с прокруткой, джекпот и конфетти', bestLabel: 'Лучший выигрыш',
    mount(screen, api) {
      const { h } = api; const W = 360, H = 560; const SYM = ['🍒', '🍋', '🔔', '⭐', '7️⃣', '💎']; const PAY = [5, 8, 12, 20, 50, 100];
      const RH2 = 96, VIS = 3, N = SYM.length;
      let bet = 5, reels = [0, 1, 2].map(i => ({ pos: 0, vel: 0, stopAt: -1, spinning: false, res: 0 })), spinning = false, confetti = [], cross = 0, winFlash = 0, lastWin = 0, betsEl;
      const CX = W / 2, RY = 150, RW2 = 96;
      function spin() {
        if (spinning || !api.spend(bet)) return; a.hdr.set(0, api.coins); lastWin = 0; confetti = []; cross = 0;
        spinning = true; api.sound('tap'); api.vibrate(8);
        reels.forEach((r, i) => { r.spinning = true; r.vel = 26 + Math.random() * 6; r.stopAt = -1; r.res = api.rand(0, N - 1); setTimeout(() => { r.stopAt = r.res; }, 900 + i * 550); });
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
        onDown: p => { if (p.y > 330 && p.y < 400) spin(); },
        frame(dt, ctx) {
          // физика барабанов
          let allStopped = true;
          reels.forEach(r => {
            if (!r.spinning) return; allStopped = false;
            if (r.stopAt < 0) { r.pos += r.vel * dt; }
            else { // тормозим до нужного символа с лёгким отскоком
              const target = r.stopAt; let cur = r.pos % N; if (cur < 0) cur += N;
              let diff = (target - cur + N) % N; const dist = diff + (r.vel > 6 ? N : 0);
              r.vel = Math.max(2.2, Math.min(r.vel, dist * 3.2 + 1.4)); r.pos += r.vel * dt;
              cur = r.pos % N; if (cur < 0) cur += N; diff = (target - cur + N) % N;
              if (r.vel <= 3 && diff < 0.06) { r.pos = target; r.vel = 0; r.spinning = false; r.bounce = 0.18; api.sound('select'); api.vibrate(12); }
            }
          });
          reels.forEach(r => { if (r.bounce > 0) r.bounce -= dt; });
          if (spinning && allStopped) finishSpin();
          confetti.forEach(c => { c.x += c.vx * dt; c.y += c.vy * dt; c.vy += 240 * dt; c.rot += c.vr * dt; }); confetti = confetti.filter(c => c.y < H + 40);
          cross = Math.max(0, cross - dt); winFlash = Math.max(0, winFlash - dt * 0.8);
          // фон
          const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#3b0764'); g.addColorStop(1, '#1e1b4b'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
          for (let i = 0; i < 16; i++) { const on = (Math.floor(performance.now() / 300) + i) % 2 === 0; ctx.fillStyle = on ? '#fbbf24' : '#78350f'; ctx.beginPath(); ctx.arc(20 + i * 21, 24, 5, 0, 7); ctx.fill(); }
          // корпус автомата
          ctx.fillStyle = '#7f1d1d'; ctx.beginPath(); ctx.roundRect(18, 60, W - 36, 250, 18); ctx.fill();
          ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 5; ctx.beginPath(); ctx.roundRect(18, 60, W - 36, 250, 18); ctx.stroke();
          ctx.fillStyle = '#fff'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🎰 СЛОТЫ', W / 2, 84);
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
          ctx.fillStyle = spinning ? '#6b7280' : '#dc2626'; ctx.beginPath(); ctx.roundRect(W / 2 - 85, 332, 170, 60, 30); ctx.fill();
          ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(W / 2 - 85, 332, 170, 60, 30); ctx.stroke();
          ctx.fillStyle = '#fff'; ctx.font = 'bold 22px sans-serif'; ctx.fillText(spinning ? '…' : 'КРУТИТЬ ' + bet, W / 2, 362);
          // таблица выплат
          ctx.font = 'bold 13px sans-serif'; ctx.fillStyle = '#e5e7eb'; SYM.forEach((sym, i) => { const x = 40 + (i % 3) * 110, y = 420 + Math.floor(i / 3) * 30; ctx.textAlign = 'left'; ctx.fillText(sym + sym + sym + ' ×' + PAY[i], x, y); });
          ctx.textAlign = 'center'; ctx.fillStyle = '#9ca3af'; ctx.font = '12px sans-serif'; ctx.fillText('Два одинаковых — ×2', W / 2, 490);
          if (lastWin > 0 && !spinning) { ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 26px sans-serif'; ctx.fillText('ВЫИГРЫШ +' + lastWin, W / 2, 522); }
          if (winFlash > 0) { ctx.fillStyle = 'rgba(251,191,36,' + winFlash * 0.25 + ')'; ctx.fillRect(0, 0, W, H); }
          // конфетти поверх всего
          confetti.forEach(c => { ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rot); ctx.fillStyle = c.c; ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h); ctx.restore(); });
          // крестик при проигрыше
          if (cross > 0) { const k = Math.min(1, (1.4 - cross) * 3); ctx.strokeStyle = 'rgba(239,68,68,' + Math.min(1, cross * 1.6) + ')'; ctx.lineWidth = 16; ctx.lineCap = 'round'; const c0 = 70, cy2 = RY; ctx.beginPath(); ctx.moveTo(W / 2 - c0, cy2 - c0); ctx.lineTo(W / 2 - c0 + 2 * c0 * Math.min(1, k * 2), cy2 - c0 + 2 * c0 * Math.min(1, k * 2)); ctx.stroke(); if (k > 0.5) { ctx.beginPath(); ctx.moveTo(W / 2 + c0, cy2 - c0); ctx.lineTo(W / 2 + c0 - 2 * c0 * Math.min(1, (k - 0.5) * 2), cy2 - c0 + 2 * c0 * Math.min(1, (k - 0.5) * 2)); ctx.stroke(); } }
        } });
      betsEl = h('div', { class: 'bottom-bar' });
      function renderBets() { betsEl.innerHTML = ''; betsEl.append(h('div', { class: 'row' }, h('span', { class: 'hint-text' }, 'Ставка:'), [5, 10, 25, 50, 100].map(v => h('button', { class: 'btn small ' + (bet === v ? 'gold' : ''), onclick: () => { bet = v; renderBets(); api.sound('tap'); } }, v)))); }
      renderBets(); screen.append(betsEl);
      this.unmount = a.stop;
    } });

'''
s = s[:a] + slots + s[b:]
open(p, 'w', encoding='utf-8').write(s)
print('casino patched')
