/* Змейка */
Games.register({
  id: 'snake', title: 'Змейка', icon: '🐍', cat: 'arcade', desc: 'Собирай яблоки, не врезайся', bestLabel: 'Рекорд',
  mount(screen, api) {
    const { h } = api;
    const COLS = 18, ROWS = 28, CS = 20;
    let cv, snake, dir, nextDir, food, score, alive, raf, last, tick, scoreEl, paused = true;
    screen.innerHTML = ''; scoreEl = h('b', null, 0);
    screen.append(h('div', { class: 'game-top' }, h('div', { class: 'stat' }, 'Счёт ', scoreEl), h('div', { class: 'stat' }, 'Рекорд ', h('b', null, api.bestOf('snake') || 0))));
    const area = h('div', { class: 'game-area' }); screen.append(area, h('div', { class: 'hint-text' }, 'Свайп — поворот · тап — старт'));
    cv = api.canvas(area, COLS * CS, ROWS * CS); const ctx = cv.ctx;
    function reset() { snake = [{ x: 9, y: 14 }, { x: 9, y: 15 }, { x: 9, y: 16 }]; dir = { x: 0, y: -1 }; nextDir = dir; score = 0; alive = true; tick = 140; spawn(); scoreEl.textContent = 0; paused = true; draw(); }
    function spawn() { do { food = { x: api.rand(0, COLS - 1), y: api.rand(0, ROWS - 1) }; } while (snake.some(s => s.x === food.x && s.y === food.y)); }
    function step() {
      dir = nextDir; const hd = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if (hd.x < 0 || hd.y < 0 || hd.x >= COLS || hd.y >= ROWS || snake.some(s => s.x === hd.x && s.y === hd.y)) return die();
      snake.unshift(hd);
      if (hd.x === food.x && hd.y === food.y) { score++; scoreEl.textContent = score; api.sound('coin'); api.vibrate(10); if (score % 5 === 0) api.addCoins(2); tick = Math.max(60, 140 - score * 3); spawn(); }
      else snake.pop();
    }
    function die() {
      alive = false; api.sound('lose'); api.vibrate([50, 30, 80]); const isBest = api.best('snake', score); const reward = Math.floor(score / 2);
      if (reward) api.addCoins(reward);
      api.modal({ title: 'Врезались!', reward, text: 'Счёт: ' + score + (isBest ? ' — новый рекорд!' : ''), buttons: [{ label: 'В меню', onClick: api.exit }, { label: 'Ещё', cls: 'primary', onClick: reset }] });
    }
    function draw() {
      ctx.fillStyle = '#171728'; ctx.fillRect(0, 0, cv.w, cv.h);
      ctx.fillStyle = '#1e1e33'; for (let x = 0; x < COLS; x++) for (let y = 0; y < ROWS; y++) if ((x + y) % 2) ctx.fillRect(x * CS, y * CS, CS, CS);
      ctx.fillStyle = '#f87171'; ctx.beginPath(); ctx.arc(food.x * CS + CS / 2, food.y * CS + CS / 2, CS / 2 - 3, 0, 7); ctx.fill();
      snake.forEach((s, i) => { ctx.fillStyle = i ? '#22d3ee' : '#8b5cf6'; ctx.beginPath(); ctx.roundRect(s.x * CS + 1, s.y * CS + 1, CS - 2, CS - 2, 5); ctx.fill(); });
      if (paused) { ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(0, 0, cv.w, cv.h); ctx.fillStyle = '#fff'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Тап — старт', cv.w / 2, cv.h / 2); }
    }
    function loop(t) {
      raf = requestAnimationFrame(loop);
      if (paused || !alive) return;
      if (t - last > tick) { last = t; step(); draw(); }
    }
    let sx, sy;
    cv.canvas.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; });
    cv.canvas.addEventListener('pointerup', e => {
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (paused && alive) { paused = false; last = performance.now(); api.sound('tap'); return; }
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 15) return;
      const nd = Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) };
      if (nd.x !== -dir.x || nd.y !== -dir.y) nextDir = nd;
    });
    const keyH = e => { const m = { ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 }, ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 } }[e.key]; if (!m) return; if (paused) paused = false; if (m.x !== -dir.x || m.y !== -dir.y) nextDir = m; };
    window.addEventListener('keydown', keyH);
    this.unmount = () => { cancelAnimationFrame(raf); cv.destroy(); window.removeEventListener('keydown', keyH); };
    reset(); raf = requestAnimationFrame(loop);
  }
});
