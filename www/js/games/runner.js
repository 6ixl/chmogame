/* Бегун за монетами: три полосы, уворачивайся и собирай */
Games.register({
  id: 'runner', title: 'Монетный бег', icon: '🏃', cat: 'arcade', desc: 'Беги вперёд, собирай монеты, уворачивайся', bestLabel: 'Рекорд',
  mount(screen, api) {
    const { h } = api;
    const W = 360, H = 600, LANES = [60, 180, 300];
    let cv, ctx, lane, px, objs, speed, dist, coins, alive, raf, last, spawnT, scoreEl, coinEl, paused, dust;
    screen.innerHTML = ''; scoreEl = h('b', null, 0); coinEl = h('b', null, 0);
    screen.append(h('div', { class: 'game-top' }, h('div', { class: 'stat' }, 'Дистанция ', scoreEl), h('div', { class: 'stat' }, '● ', coinEl), h('div', { class: 'stat' }, 'Рекорд ', h('b', null, api.bestOf('runner') || 0))));
    const area = h('div', { class: 'game-area' }); screen.append(area, h('div', { class: 'hint-text' }, 'Тап слева/справа или свайп — смена полосы'));
    cv = api.canvas(area, W, H); ctx = cv.ctx;
    function reset() { lane = 1; px = LANES[1]; objs = []; speed = 260; dist = 0; coins = 0; alive = true; spawnT = 0; paused = true; dust = []; scoreEl.textContent = 0; coinEl.textContent = 0; draw(); }
    function spawn() {
      const r = Math.random();
      if (r < 0.45) { // ряд монет на полосе
        const l = api.rand(0, 2); for (let i = 0; i < 4; i++) objs.push({ t: 'c', l, y: -40 - i * 44 });
      } else if (r < 0.85) { // одно-два препятствия
        const ls = api.shuffle([0, 1, 2]).slice(0, Math.random() < 0.3 ? 2 : 1); ls.forEach(l => objs.push({ t: 'o', l, y: -50 }));
      } else objs.push({ t: 'g', l: api.rand(0, 2), y: -40 }); // самоцвет
    }
    function update(dt) {
      dist += speed * dt / 20; speed += dt * 6; scoreEl.textContent = Math.floor(dist);
      px += (LANES[lane] - px) * Math.min(1, dt * 14);
      spawnT -= dt; if (spawnT <= 0) { spawn(); spawnT = 0.55 + Math.random() * 0.5 - Math.min(0.3, speed / 3000); }
      for (const o of objs) o.y += speed * dt;
      const py = H - 110;
      for (const o of objs) {
        if (o.hit) continue;
        const ox = LANES[o.l]; if (Math.abs(o.y - py) < 34 && Math.abs(ox - px) < 34) {
          if (o.t === 'o') return die();
          o.hit = true; coins += o.t === 'g' ? 5 : 1; coinEl.textContent = coins; api.sound('coin'); api.vibrate(8);
          for (let i = 0; i < 6; i++) dust.push({ x: ox, y: o.y, vx: (Math.random() - .5) * 200, vy: (Math.random() - .5) * 200, a: 1 });
        }
      }
      objs = objs.filter(o => o.y < H + 60 && !o.hit);
      dust.forEach(d => { d.x += d.vx * dt; d.y += d.vy * dt; d.a -= dt * 2.5; }); dust = dust.filter(d => d.a > 0);
    }
    let roadOff = 0;
    function draw() {
      ctx.fillStyle = '#171728'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#1e1e33'; ctx.fillRect(20, 0, W - 40, H);
      ctx.strokeStyle = '#33335a'; ctx.lineWidth = 3; ctx.setLineDash([26, 26]); ctx.lineDashOffset = -roadOff;
      [120, 240].forEach(x => { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }); ctx.setLineDash([]);
      for (const o of objs) {
        const x = LANES[o.l];
        if (o.t === 'c') { ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(x, o.y, 14, 0, 7); ctx.fill(); ctx.fillStyle = '#b45309'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$', x, o.y + 1); }
        else if (o.t === 'g') { ctx.fillStyle = '#22d3ee'; ctx.beginPath(); ctx.moveTo(x, o.y - 18); ctx.lineTo(x + 16, o.y); ctx.lineTo(x, o.y + 18); ctx.lineTo(x - 16, o.y); ctx.closePath(); ctx.fill(); }
        else { ctx.fillStyle = '#f87171'; ctx.beginPath(); ctx.roundRect(x - 34, o.y - 22, 68, 44, 8); ctx.fill(); ctx.fillStyle = '#7f1d1d'; ctx.fillRect(x - 34, o.y - 4, 68, 8); }
      }
      dust.forEach(d => { ctx.globalAlpha = d.a; ctx.fillStyle = '#fbbf24'; ctx.fillRect(d.x - 3, d.y - 3, 6, 6); }); ctx.globalAlpha = 1;
      // игрок
      const py = H - 110;
      ctx.fillStyle = '#8b5cf6'; ctx.beginPath(); ctx.roundRect(px - 24, py - 30, 48, 60, 12); ctx.fill();
      ctx.fillStyle = '#c4b5fd'; ctx.beginPath(); ctx.arc(px, py - 12, 12, 0, 7); ctx.fill();
      ctx.fillStyle = '#1e1b4b'; ctx.fillRect(px - 6, py - 15, 3, 3); ctx.fillRect(px + 3, py - 15, 3, 3);
      if (paused) { ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#fff'; ctx.font = 'bold 24px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Тап — старт', W / 2, H / 2); }
    }
    function die() {
      alive = false; api.sound('boom'); api.vibrate([60, 40, 120]);
      const score = Math.floor(dist) + coins * 10; const isBest = api.best('runner', score); const reward = Math.floor(coins / 2) + Math.floor(dist / 500);
      if (reward) api.addCoins(reward);
      api.modal({ title: 'Столкновение!', reward, text: `Дистанция ${Math.floor(dist)} м, монет ${coins}` + (isBest ? ' — новый рекорд!' : ''), buttons: [{ label: 'В меню', onClick: api.exit }, { label: 'Ещё', cls: 'primary', onClick: reset }] });
    }
    function loop(t) {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
      if (!paused && alive) { update(dt); roadOff += speed * dt; }
      draw();
    }
    let sx;
    cv.canvas.addEventListener('pointerdown', e => { sx = e.clientX; });
    cv.canvas.addEventListener('pointerup', e => {
      if (!alive) return;
      if (paused) { paused = false; api.sound('tap'); return; }
      const dx = e.clientX - sx; const rect = cv.canvas.getBoundingClientRect();
      let d = Math.abs(dx) > 25 ? Math.sign(dx) : (e.clientX - rect.left < rect.width / 2 ? -1 : 1);
      lane = Math.max(0, Math.min(2, lane + d)); api.vibrate(6);
    });
    const keyH = e => { if (e.key === 'ArrowLeft') lane = Math.max(0, lane - 1); if (e.key === 'ArrowRight') lane = Math.min(2, lane + 1); if (e.key === ' ') paused = false; };
    window.addEventListener('keydown', keyH);
    this.unmount = () => { cancelAnimationFrame(raf); cv.destroy(); window.removeEventListener('keydown', keyH); };
    reset(); raf = requestAnimationFrame(loop);
  }
});
