/* Флаппи: тапай, пролетай между трубами */
Games.register({
  id: 'flappy', title: 'Флаппи', icon: '🐤', cat: 'arcade', desc: 'Тапай и пролетай между трубами', bestLabel: 'Рекорд',
  mount(screen, api) {
    const { h } = api;
    const W = 360, H = 560, G = 1500, FLAP = -420, GAP = 150, PW = 60;
    let cv, ctx, by, bv, pipes, score, alive, started, raf, last, scoreEl, t = 0;
    screen.innerHTML = ''; scoreEl = h('b', null, 0);
    screen.append(h('div', { class: 'game-top' }, h('div', { class: 'stat' }, 'Счёт ', scoreEl), h('div', { class: 'stat' }, 'Рекорд ', h('b', null, api.bestOf('flappy') || 0))));
    const area = h('div', { class: 'game-area' }); screen.append(area, h('div', { class: 'hint-text' }, 'Тап — взмах'));
    cv = api.canvas(area, W, H); ctx = cv.ctx;
    function reset() { by = H / 2; bv = 0; pipes = []; score = 0; alive = true; started = false; scoreEl.textContent = 0; for (let i = 0; i < 3; i++) pipes.push({ x: W + 120 + i * 220, gy: api.rand(120, H - 120 - GAP), passed: false }); }
    function flap() { if (!alive) return; if (!started) started = true; bv = FLAP; api.sound('jump'); api.vibrate(6); }
    function update(dt) {
      if (!started) { by = H / 2 + Math.sin(t * 4) * 8; return; }
      bv += G * dt; by += bv * dt;
      for (const p of pipes) {
        p.x -= 170 * dt;
        if (!p.passed && p.x + PW < 80) { p.passed = true; score++; scoreEl.textContent = score; api.sound('select'); if (score % 5 === 0) api.addCoins(3); }
        if (p.x < -PW) { p.x += 220 * 3; p.gy = api.rand(120, H - 120 - GAP); p.passed = false; }
        if (80 + 16 > p.x && 80 - 16 < p.x + PW && (by - 14 < p.gy || by + 14 > p.gy + GAP)) return die();
      }
      if (by > H - 40 || by < 0) die();
    }
    function die() {
      if (!alive) return; alive = false; api.sound('boom'); api.vibrate([60, 40, 120]);
      const isBest = api.best('flappy', score); const reward = Math.floor(score / 2); if (reward) api.addCoins(reward);
      api.modal({ title: 'Упс!', reward, text: 'Счёт: ' + score + (isBest ? ' — новый рекорд!' : ''), buttons: [{ label: 'В меню', onClick: api.exit }, { label: 'Ещё', cls: 'primary', onClick: reset }] });
    }
    function draw() {
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1e1b4b'); g.addColorStop(1, '#312e81'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#34d399'; for (const p of pipes) { ctx.beginPath(); ctx.roundRect(p.x, -10, PW, p.gy + 10, 8); ctx.fill(); ctx.beginPath(); ctx.roundRect(p.x, p.gy + GAP, PW, H, 8); ctx.fill(); }
      ctx.fillStyle = '#065f46'; for (const p of pipes) { ctx.fillRect(p.x - 4, p.gy - 18, PW + 8, 18); ctx.fillRect(p.x - 4, p.gy + GAP, PW + 8, 18); }
      ctx.fillStyle = '#0f0f1a'; ctx.fillRect(0, H - 40, W, 40); ctx.fillStyle = '#6d28d9'; ctx.fillRect(0, H - 40, W, 4);
      ctx.save(); ctx.translate(80, by); ctx.rotate(Math.max(-0.5, Math.min(0.8, bv / 600)));
      ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.ellipse(0, 0, 18, 14, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.moveTo(14, -2); ctx.lineTo(26, 3); ctx.lineTo(14, 7); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(6, -5, 5, 0, 7); ctx.fill(); ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(7, -5, 2.5, 0, 7); ctx.fill();
      ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.ellipse(-6, 4, 9, 6, 0.4, 0, 7); ctx.fill(); ctx.restore();
      if (!started) { ctx.fillStyle = '#fff'; ctx.font = 'bold 24px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Тап — полёт', W / 2, H / 2 - 80); }
      ctx.fillStyle = '#fff'; ctx.font = 'bold 36px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(score, W / 2, 60);
    }
    function loop(ts) { raf = requestAnimationFrame(loop); const dt = Math.min(0.04, (ts - (last || ts)) / 1000); last = ts; t += dt; if (alive) update(dt); draw(); }
    cv.canvas.addEventListener('pointerdown', flap);
    const keyH = e => { if (e.key === ' ' || e.key === 'ArrowUp') flap(); }; window.addEventListener('keydown', keyH);
    this.unmount = () => { cancelAnimationFrame(raf); cv.destroy(); window.removeEventListener('keydown', keyH); };
    reset(); raf = requestAnimationFrame(loop);
  }
});
