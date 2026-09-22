/* Арканоид */
Games.register({
  id: 'breakout', title: 'Арканоид', icon: '🏓', cat: 'arcade', desc: 'Разбей все кирпичи мячом', bestLabel: 'Рекорд',
  mount(screen, api) {
    const { h } = api;
    const W = 360, H = 560, PW = 80, PH = 12, BR = 7;
    let cv, ctx, px, ball, bricks, score, lives, level, alive, raf, last, launched, scoreEl, livesEl;
    screen.innerHTML = ''; scoreEl = h('b', null, 0); livesEl = h('b', null, 3);
    screen.append(h('div', { class: 'game-top' }, h('div', { class: 'stat' }, 'Счёт ', scoreEl), h('div', { class: 'stat' }, '❤ ', livesEl), h('div', { class: 'stat' }, 'Рекорд ', h('b', null, api.bestOf('breakout') || 0))));
    const area = h('div', { class: 'game-area' }); screen.append(area, h('div', { class: 'hint-text' }, 'Веди пальцем — ракетка · тап — запуск'));
    cv = api.canvas(area, W, H); ctx = cv.ctx;
    const PAL = ['#f87171', '#fb923c', '#fbbf24', '#34d399', '#22d3ee', '#a855f7'];
    function makeLevel() {
      bricks = []; const rows = 4 + Math.min(level, 4), cols = 8, bw = (W - 20) / cols, bh = 18;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        if (level > 1 && (r + c + level) % 5 === 0) continue;
        bricks.push({ x: 10 + c * bw, y: 50 + r * (bh + 4), w: bw - 4, h: bh, col: PAL[r % PAL.length], hp: r < 2 && level > 2 ? 2 : 1 });
      }
    }
    function serve() { ball = { x: px, y: H - 40 - BR, vx: 0, vy: 0 }; launched = false; }
    function reset() { score = 0; lives = 3; level = 1; alive = true; px = W / 2; makeLevel(); serve(); scoreEl.textContent = 0; livesEl.textContent = 3; }
    function launch() { if (launched || !alive) return; launched = true; const a = -Math.PI / 2 + (Math.random() - .5); const sp = 300 + level * 25; ball.vx = Math.cos(a) * sp; ball.vy = Math.sin(a) * sp; api.sound('tap'); }
    function update(dt) {
      if (!launched) { ball.x = px; return; }
      ball.x += ball.vx * dt; ball.y += ball.vy * dt;
      if (ball.x < BR) { ball.x = BR; ball.vx *= -1; } if (ball.x > W - BR) { ball.x = W - BR; ball.vx *= -1; } if (ball.y < BR) { ball.y = BR; ball.vy *= -1; }
      const py = H - 40;
      if (ball.vy > 0 && ball.y + BR >= py && ball.y + BR <= py + PH + 6 && Math.abs(ball.x - px) < PW / 2 + BR) {
        const rel = (ball.x - px) / (PW / 2); const sp = Math.hypot(ball.vx, ball.vy) * 1.01; const a = -Math.PI / 2 + rel * 1.1;
        ball.vx = Math.cos(a) * sp; ball.vy = Math.sin(a) * sp; ball.y = py - BR; api.sound('select'); api.vibrate(5);
      }
      for (const b of bricks) {
        if (b.hp <= 0) continue;
        if (ball.x + BR > b.x && ball.x - BR < b.x + b.w && ball.y + BR > b.y && ball.y - BR < b.y + b.h) {
          const ox = Math.min(ball.x + BR - b.x, b.x + b.w - ball.x + BR), oy = Math.min(ball.y + BR - b.y, b.y + b.h - ball.y + BR);
          if (ox < oy) ball.vx *= -1; else ball.vy *= -1;
          b.hp--; score += 10; scoreEl.textContent = score; api.sound('tap'); api.vibrate(6);
          if (b.hp <= 0 && score % 100 === 0) api.addCoins(3);
          break;
        }
      }
      if (bricks.every(b => b.hp <= 0)) { level++; api.sound('win'); api.addCoins(15); api.toast('Уровень ' + level + '!'); makeLevel(); serve(); return; }
      if (ball.y > H + BR) { lives--; livesEl.textContent = lives; api.sound('bad'); api.vibrate(40); if (lives <= 0) die(); else serve(); }
    }
    function die() {
      alive = false; api.sound('lose'); const isBest = api.best('breakout', score); const reward = Math.floor(score / 50); if (reward) api.addCoins(reward);
      api.modal({ title: 'Игра окончена', reward, text: 'Счёт: ' + score + (isBest ? ' — новый рекорд!' : ''), buttons: [{ label: 'В меню', onClick: api.exit }, { label: 'Ещё', cls: 'primary', onClick: reset }] });
    }
    function draw() {
      ctx.fillStyle = '#171728'; ctx.fillRect(0, 0, W, H);
      for (const b of bricks) if (b.hp > 0) { ctx.fillStyle = b.col; ctx.globalAlpha = b.hp > 1 ? 1 : 0.85; ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 4); ctx.fill(); if (b.hp > 1) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); } }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#8b5cf6'; ctx.beginPath(); ctx.roundRect(px - PW / 2, H - 40, PW, PH, 6); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ball.x, ball.y, BR, 0, 7); ctx.fill();
      if (!launched && alive) { ctx.fillStyle = '#9a9ab8'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Тап — запуск', W / 2, H / 2 + 40); }
    }
    function loop(t) { raf = requestAnimationFrame(loop); const dt = Math.min(0.03, (t - (last || t)) / 1000); last = t; if (alive) update(dt); draw(); }
    const toX = e => { const r = cv.canvas.getBoundingClientRect(); return (e.clientX - r.left) * W / r.width; };
    let down = false, moved = false;
    cv.canvas.addEventListener('pointerdown', e => { down = true; moved = false; cv.canvas.setPointerCapture(e.pointerId); px = Math.max(PW / 2, Math.min(W - PW / 2, toX(e))); });
    cv.canvas.addEventListener('pointermove', e => { if (!down) return; moved = true; px = Math.max(PW / 2, Math.min(W - PW / 2, toX(e))); });
    cv.canvas.addEventListener('pointerup', () => { down = false; if (!launched) launch(); });
    const keyH = e => { if (e.key === 'ArrowLeft') px = Math.max(PW / 2, px - 25); if (e.key === 'ArrowRight') px = Math.min(W - PW / 2, px + 25); if (e.key === ' ') launch(); };
    window.addEventListener('keydown', keyH);
    this.unmount = () => { cancelAnimationFrame(raf); cv.destroy(); window.removeEventListener('keydown', keyH); };
    reset(); raf = requestAnimationFrame(loop);
  }
});
