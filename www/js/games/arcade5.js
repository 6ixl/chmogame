/* Аркады, часть 4 */
(function () {
  const rr = (ctx, x, y, w, h, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); };
  const circ = (ctx, x, y, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); };
  const text = (ctx, t, x, y, size, c, align) => { ctx.fillStyle = c || '#fff'; ctx.font = 'bold ' + size + 'px sans-serif'; ctx.textAlign = align || 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t, x, y); };
  const over = (api, id, score, title, div, reset) => { api.best(id, score); api.end({ win: false, title, reward: Math.floor(score / div), text: 'Счёт: ' + score, onAgain: reset }); };
  const emoji = (ctx, e, x, y, size) => { ctx.font = size + 'px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(e, x, y); };

  /* ---------- Дартс ---------- */
  Games.register({ id: 'darts', title: 'Дартс', icon: '🎯', cat: 'arcade', desc: 'Прицел плавает — тап останавливает. 10 дротиков', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 460; let cx, cy, t = 0, score, darts, hits, amp;
      function reset() { score = 0; darts = 10; hits = []; amp = 60; t = 0; a.hdr.set(0, 0); a.hdr.set(1, 10); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Очки', value: 0 }, { label: 'Дротиков', value: 10 }, { label: 'Рекорд', value: api.bestOf('darts') || 0 }], hint: 'Тап — бросок в текущую точку прицела',
        onDown: () => { if (!darts) return; darts--; const d = Math.hypot(cx - W / 2, cy - H / 2); const pts = d < 8 ? 50 : d < 18 ? 25 : d < 60 ? 10 : d < 100 ? 5 : d < 140 ? 1 : 0; score += pts; hits.push({ x: cx, y: cy }); amp += 15; api.sound(pts >= 25 ? 'good' : pts ? 'tap' : 'bad'); a.hdr.set(0, score); a.hdr.set(1, darts); if (!darts) { api.best('darts', score); api.end({ title: 'Итог: ' + score, reward: Math.floor(score / 10), onAgain: reset }); } },
        frame(dt, ctx) { t += dt; cx = W / 2 + Math.sin(t * 2.3) * amp + Math.sin(t * 5.1) * amp * .4; cy = H / 2 + Math.cos(t * 1.7) * amp + Math.cos(t * 4.3) * amp * .4; ctx.fillStyle = '#171728'; ctx.fillRect(0, 0, W, H); [140, 100, 60, 18, 8].forEach((r, i) => circ(ctx, W / 2, H / 2, r, ['#111', '#fff', '#ef4444', '#22c55e', '#ef4444'][i])); ctx.strokeStyle = '#555'; ctx.lineWidth = 1; for (let i = 0; i < 20; i++) { const an = i * Math.PI / 10; ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(an) * 18, H / 2 + Math.sin(an) * 18); ctx.lineTo(W / 2 + Math.cos(an) * 140, H / 2 + Math.sin(an) * 140); ctx.stroke(); } hits.forEach(hh => emoji(ctx, '🎯', hh.x, hh.y, 18)); ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, 14, 0, 7); ctx.moveTo(cx - 22, cy); ctx.lineTo(cx + 22, cy); ctx.moveTo(cx, cy - 22); ctx.lineTo(cx, cy + 22); ctx.stroke(); } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Бильярд ---------- */
  Games.register({ id: 'billiards', title: 'Бильярд', icon: '🎱', cat: 'arcade', desc: 'Оттяни от битка и отпусти — забей все шары', bestLabel: 'Меньше ударов',
    mount(screen, api) {
      const W = 360, H = 560, R = 11; let balls, drag, dragP, shots, done;
      const POCKETS = [[10, 10], [W - 10, 10], [10, H / 2], [W - 10, H / 2], [10, H - 10], [W - 10, H - 10]];
      function reset() { balls = [{ x: W / 2, y: H - 120, vx: 0, vy: 0, c: '#fff', cue: true }]; const cols = ['#fbbf24', '#3b82f6', '#ef4444', '#a855f7', '#f97316', '#22c55e', '#7f1d1d', '#111', '#eab308', '#1d4ed8']; let k = 0; for (let r = 0; r < 4; r++) for (let c = 0; c <= r; c++) balls.push({ x: W / 2 + (c - r / 2) * R * 2.1, y: 150 - r * R * 1.85, vx: 0, vy: 0, c: cols[k++ % cols.length] }); shots = 0; done = false; drag = false; a.hdr.set(0, 0); a.hdr.set(1, balls.length - 1); }
      const moving = () => balls.some(b => Math.hypot(b.vx, b.vy) > 2);
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Удары', value: 0 }, { label: 'Осталось', value: 10 }, { label: 'Рекорд', value: api.bestOf('billiards') || '—' }], hint: 'Оттяни от белого шара и отпусти',
        onDown: p => { if (moving() || done) return; drag = true; dragP = p; }, onMove: p => { if (drag) dragP = p; },
        onUp: p => { if (!drag) return; drag = false; const cue = balls.find(b => b.cue); const dx = cue.x - p.x, dy = cue.y - p.y; const d = Math.min(160, Math.hypot(dx, dy)); if (d < 10) return; cue.vx = dx / Math.hypot(dx, dy) * d * 6; cue.vy = dy / Math.hypot(dx, dy) * d * 6; shots++; a.hdr.set(0, shots); api.sound('tap'); },
        frame(dt, ctx) {
          for (let it = 0; it < 3; it++) { const sdt = dt / 3; balls.forEach(b => { b.x += b.vx * sdt; b.y += b.vy * sdt; b.vx *= Math.pow(0.4, sdt); b.vy *= Math.pow(0.4, sdt); if (Math.hypot(b.vx, b.vy) < 2) { b.vx = b.vy = 0; } if (b.x < R + 8) { b.x = R + 8; b.vx = Math.abs(b.vx) * .8; } if (b.x > W - R - 8) { b.x = W - R - 8; b.vx = -Math.abs(b.vx) * .8; } if (b.y < R + 8) { b.y = R + 8; b.vy = Math.abs(b.vy) * .8; } if (b.y > H - R - 8) { b.y = H - R - 8; b.vy = -Math.abs(b.vy) * .8; } });
            for (let i = 0; i < balls.length; i++) for (let j = i + 1; j < balls.length; j++) { const p = balls[i], q = balls[j]; const dx = q.x - p.x, dy = q.y - p.y; const d = Math.hypot(dx, dy); if (d < 2 * R && d > 0) { const nx = dx / d, ny = dy / d; const ov = 2 * R - d; p.x -= nx * ov / 2; p.y -= ny * ov / 2; q.x += nx * ov / 2; q.y += ny * ov / 2; const dv = (p.vx - q.vx) * nx + (p.vy - q.vy) * ny; if (dv > 0) { p.vx -= dv * nx; p.vy -= dv * ny; q.vx += dv * nx; q.vy += dv * ny; if (dv > 50) api.sound('select'); } } }
            balls.forEach(b => { for (const [px, py] of POCKETS) if (Math.hypot(b.x - px, b.y - py) < 18) { if (b.cue) { b.x = W / 2; b.y = H - 120; b.vx = b.vy = 0; api.sound('bad'); shots++; a.hdr.set(0, shots); } else { b.dead = true; api.sound('coin'); api.vibrate(10); api.addCoins(1); } } }); balls = balls.filter(b => !b.dead); }
          a.hdr.set(1, balls.length - 1); if (balls.length === 1 && !done) { done = true; api.best('billiards', shots, true); api.end({ title: 'Все шары забиты!', reward: Math.max(5, 40 - shots), text: shots + ' ударов', onAgain: reset }); }
          ctx.fillStyle = '#78350f'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#15803d'; ctx.fillRect(8, 8, W - 16, H - 16); POCKETS.forEach(([x, y]) => circ(ctx, x, y, 16, '#111'));
          balls.forEach(b => { circ(ctx, b.x, b.y, R, b.c); circ(ctx, b.x - 3, b.y - 3, 3, 'rgba(255,255,255,.5)'); });
          if (drag) { const cue = balls.find(b => b.cue); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(cue.x, cue.y); ctx.lineTo(cue.x + (cue.x - dragP.x), cue.y + (cue.y - dragP.y)); ctx.stroke(); ctx.setLineDash([]); }
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Падение ---------- */
  Games.register({ id: 'skydrop', title: 'Падение', icon: '🪂', cat: 'arcade', desc: 'Падай вниз через щели в платформах', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 560; let px, py, plats, score, alive, targetX, speed;
      function reset() { px = W / 2; py = 80; targetX = px; plats = []; for (let i = 0; i < 8; i++) plats.push({ y: 200 + i * 110, gap: api.rand(30, W - 110), gw: 80 }); score = 0; alive = true; speed = 100; a.hdr.set(0, 0); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Этаж', value: 0 }, { label: 'Рекорд', value: api.bestOf('skydrop') || 0 }], hint: 'Веди пальцем влево-вправо', onDown: p => targetX = p.x, onMove: (p, e) => { if (e.buttons || e.pointerType === 'touch') targetX = p.x; }, onKey: e => { if (e.key === 'ArrowLeft') targetX = px - 50; if (e.key === 'ArrowRight') targetX = px + 50; },
        frame(dt, ctx) {
          if (alive) { px += (Math.max(14, Math.min(W - 14, targetX)) - px) * Math.min(1, dt * 10); speed += dt * 4; const onPlat = plats.find(p => Math.abs(p.y - (py + 14)) < 6 && (px < p.gap || px > p.gap + p.gw)); if (!onPlat) py += 260 * dt; plats.forEach(p => p.y -= speed * dt); if (onPlat) py -= speed * dt; plats = plats.filter(p => p.y > -20); while (plats.length < 8) plats.push({ y: plats[plats.length - 1].y + 110, gap: api.rand(30, W - 110), gw: Math.max(44, 80 - score / 3) }); for (const p of plats) if (p.passed === undefined && p.y < py - 20) { p.passed = true; score++; a.hdr.set(0, score); api.sound('select'); if (score % 10 === 0) api.addCoins(3); } if (py < -20 || py > H + 20) { alive = false; api.sound('boom'); over(api, 'skydrop', score, py < 0 ? 'Раздавило!' : 'Упали!', 5, reset); } }
          ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#ef4444'; ctx.fillRect(0, 0, W, 14); plats.forEach(p => { rr(ctx, 0, p.y, p.gap, 14, 4, '#94a3b8'); rr(ctx, p.gap + p.gw, p.y, W - p.gap - p.gw, 14, 4, '#94a3b8'); }); circ(ctx, px, py, 14, '#fbbf24'); circ(ctx, px - 4, py - 3, 2.5, '#111'); circ(ctx, px + 4, py - 3, 2.5, '#111');
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Туннель ---------- */
  Games.register({ id: 'tunnel', title: 'Туннель', icon: '🕳', cat: 'arcade', desc: 'Лети по извилистому туннелю, не касаясь стен', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 560; let px, segs, dist, alive, targetX, speed;
      function reset() { px = W / 2; targetX = px; segs = []; let mid = W / 2; for (let i = 0; i < 40; i++) { mid += api.rand(-18, 18); mid = Math.max(90, Math.min(W - 90, mid)); segs.push({ y: H - i * 16, mid, w: 150 }); } dist = 0; alive = true; speed = 160; a.hdr.set(0, 0); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Дистанция', value: 0 }, { label: 'Рекорд', value: api.bestOf('tunnel') || 0 }], hint: 'Веди пальцем', onDown: p => targetX = p.x, onMove: (p, e) => { if (e.buttons || e.pointerType === 'touch') targetX = p.x; }, onKey: e => { if (e.key === 'ArrowLeft') targetX = px - 40; if (e.key === 'ArrowRight') targetX = px + 40; },
        frame(dt, ctx) {
          if (alive) { px += (targetX - px) * Math.min(1, dt * 12); speed += dt * 5; dist += speed * dt / 10; a.hdr.set(0, Math.floor(dist)); segs.forEach(s => s.y += speed * dt); segs = segs.filter(s => s.y < H + 20); while (segs.length < 40) { const last = segs[segs.length - 1]; let mid = last.mid + api.rand(-22, 22); mid = Math.max(70, Math.min(W - 70, mid)); segs.push({ y: last.y - 16, mid, w: Math.max(70, 150 - dist / 20) }); } const s = segs.find(s => Math.abs(s.y - (H - 100)) < 9); if (s && (px - 10 < s.mid - s.w / 2 || px + 10 > s.mid + s.w / 2)) { alive = false; api.sound('boom'); api.vibrate([60, 40, 120]); over(api, 'tunnel', Math.floor(dist), 'Врезались в стену', 15, reset); } }
          ctx.fillStyle = '#3b0764'; ctx.fillRect(0, 0, W, H); segs.forEach(s => { ctx.fillStyle = '#0f0f1a'; ctx.fillRect(s.mid - s.w / 2, s.y - 8, s.w, 17); }); circ(ctx, px, H - 100, 10, '#22d3ee');
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Шипы ---------- */
  Games.register({ id: 'spikes', title: 'Шипы', icon: '🔻', cat: 'arcade', desc: 'Тап — прыжок. Отскакивай от стен, избегай шипов', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 520; let x, y, vx, vy, spikes, score, alive, started;
      function newSpikes() { const n = 2 + Math.min(5, Math.floor(score / 4)); spikes = api.shuffle([...Array(10).keys()]).slice(0, n).map(i => 50 + i * 42); }
      function reset() { x = W / 2; y = H / 2; vx = 180; vy = 0; score = 0; alive = true; started = false; newSpikes(); a.hdr.set(0, 0); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Отскоков', value: 0 }, { label: 'Рекорд', value: api.bestOf('spikes') || 0 }], hint: 'Тап — прыжок', onDown: () => { if (!alive) return; started = true; vy = -380; api.sound('jump'); }, onKey: e => { if (e.key === ' ') { started = true; vy = -380; } },
        frame(dt, ctx) {
          if (alive && started) { vy += 1100 * dt; x += vx * dt; y += vy * dt; if (y > H - 20 || y < 20) { alive = false; api.sound('boom'); over(api, 'spikes', score, 'Упали!', 4, reset); } const side = vx > 0 ? W - 16 : 16; if ((vx > 0 && x >= side) || (vx < 0 && x <= side)) { if (spikes.some(s => Math.abs(s - y) < 24)) { alive = false; api.sound('boom'); api.vibrate([60, 40, 120]); over(api, 'spikes', score, 'На шип!', 4, reset); } else { vx *= -1; x = side; score++; a.hdr.set(0, score); api.sound('tap'); api.vibrate(5); if (score % 10 === 0) api.addCoins(3); newSpikes(); } } }
          ctx.fillStyle = '#1e1e33'; ctx.fillRect(0, 0, W, H); const side = vx > 0 ? W : 0; spikes.forEach(s => { ctx.fillStyle = '#f87171'; ctx.beginPath(); ctx.moveTo(side, s - 18); ctx.lineTo(side + (vx > 0 ? -26 : 26), s); ctx.lineTo(side, s + 18); ctx.fill(); }); ctx.fillStyle = '#374151'; ctx.fillRect(0, 0, W, 10); ctx.fillRect(0, H - 10, W, 10); circ(ctx, x, y, 12, '#fbbf24'); circ(ctx, x + (vx > 0 ? 4 : -4), y - 3, 3, '#111'); if (!started) text(ctx, 'Тап — старт', W / 2, H / 2 - 80, 22);
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Ножи ---------- */
  Games.register({ id: 'knives', title: 'Ножи', icon: '🔪', cat: 'arcade', desc: 'Кидай ножи в крутящееся бревно, не попадая в другие', progress: api => 'Уровень ' + (api.level('knives').lvl + 1),
    mount(screen, api) {
      const W = 360, H = 520; const L = api.level('knives'); let ang, spd, stuck, left, flying, done;
      function reset() { ang = 0; spd = 1.5 + L.lvl * 0.15; stuck = Array.from({ length: Math.min(4, Math.floor(L.lvl / 2)) }, () => Math.random() * Math.PI * 2); left = 6 + Math.floor(L.lvl / 3); flying = null; done = false; a.hdr.set(1, left); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Уровень', value: L.lvl + 1 }, { label: 'Ножей', value: 0 }], hint: 'Тап — бросок', onDown: () => { if (flying || done || !left) return; flying = { y: H - 60 }; api.sound('tap'); },
        frame(dt, ctx) {
          const cx = W / 2, cy = 190, R = 70; if (!done) ang += spd * dt * (1 + Math.sin(ang * 0.5) * 0.3);
          if (flying) { flying.y -= 900 * dt; if (flying.y <= cy + R + 20) { const hitAng = (Math.PI / 2 - ang) % (Math.PI * 2); const clash = stuck.some(s => { let d = Math.abs(((s - hitAng) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI); return d < 0.28; }); if (clash) { done = true; api.sound('boom'); api.vibrate([60, 40, 120]); api.end({ win: false, title: 'Нож в нож!', onAgain: reset }); } else { stuck.push(hitAng); left--; a.hdr.set(1, left); api.sound('good'); api.vibrate(8); if (!left) { done = true; L.done(); api.end({ title: 'Бревно побеждено!', reward: 8 + L.lvl, again: 'Дальше', onAgain: reset }); } } flying = null; } }
          ctx.fillStyle = '#171728'; ctx.fillRect(0, 0, W, H); ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang); circ(ctx, 0, 0, R, '#92400e'); circ(ctx, 0, 0, R - 12, '#b45309'); circ(ctx, 0, 0, 20, '#78350f'); stuck.forEach(s => { ctx.save(); ctx.rotate(s); rr(ctx, -4, R - 6, 8, 50, 2, '#e5e7eb'); rr(ctx, -5, R + 40, 10, 16, 2, '#111'); ctx.restore(); }); ctx.restore();
          if (flying) rr(ctx, cx - 4, flying.y, 8, 50, 2, '#e5e7eb'); else if (left && !done) { rr(ctx, cx - 4, H - 60, 8, 50, 2, '#e5e7eb'); rr(ctx, cx - 5, H - 14, 10, 14, 2, '#111'); }
          for (let i = 0; i < left; i++) rr(ctx, 20 + i * 14, H - 30, 6, 22, 2, '#9ca3af');
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Дровосек ---------- */
  Games.register({ id: 'timber', title: 'Дровосек', icon: '🪓', cat: 'arcade', desc: 'Руби слева или справа, уворачивайся от веток. Время тикает', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 520; let tree, side, score, time, alive, started;
      function reset() { tree = [0, 0, 0]; for (let i = 0; i < 8; i++) tree.push(nextSeg()); side = 0; score = 0; time = 5; alive = true; started = false; a.hdr.set(0, 0); }
      function nextSeg() { const last = tree[tree.length - 1]; if (last) return 0; return Math.random() < 0.55 ? api.rand(1, 2) : 0; }
      function chop(s) { if (!alive) return; started = true; side = s; tree.shift(); tree.push(nextSeg()); if (tree[0] === s + 1 || tree[0] === (s === 0 ? 1 : 2)) { alive = false; api.sound('boom'); api.vibrate([60, 40, 120]); over(api, 'timber', score, 'Ветка!', 5, reset); return; } score++; time = Math.min(6, time + 0.3); a.hdr.set(0, score); api.sound('tap'); api.vibrate(5); if (score % 25 === 0) api.addCoins(5); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Счёт', value: 0 }, { label: 'Рекорд', value: api.bestOf('timber') || 0 }], hint: 'Тап слева/справа от дерева', onDown: p => chop(p.x < W / 2 ? 0 : 1), onKey: e => { if (e.key === 'ArrowLeft') chop(0); if (e.key === 'ArrowRight') chop(1); },
        frame(dt, ctx) {
          if (alive && started) { time -= dt; if (time <= 0) { alive = false; over(api, 'timber', score, 'Время вышло', 5, reset); } }
          ctx.fillStyle = '#bae6fd'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#65a30d'; ctx.fillRect(0, H - 40, W, 40);
          tree.forEach((seg, i) => { const y = H - 80 - i * 50; rr(ctx, W / 2 - 30, y, 60, 50, 0, i % 2 ? '#92400e' : '#a16207'); if (seg === 1) rr(ctx, W / 2 - 110, y + 10, 80, 20, 8, '#15803d'); if (seg === 2) rr(ctx, W / 2 + 30, y + 10, 80, 20, 8, '#15803d'); });
          emoji(ctx, '🧔', side ? W / 2 + 70 : W / 2 - 70, H - 65, 44); emoji(ctx, '🪓', side ? W / 2 + 40 : W / 2 - 40, H - 80, 28);
          rr(ctx, 40, 20, W - 80, 14, 7, '#0f172a'); rr(ctx, 40, 20, (W - 80) * Math.max(0, time / 6), 14, 7, '#22c55e');
          if (!started) text(ctx, 'Тап — рубить', W / 2, H / 2, 24, '#1e1b4b');
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Слалом ---------- */
  Games.register({ id: 'ski', title: 'Слалом', icon: '⛷', cat: 'arcade', desc: 'Проезжай между флажками, объезжай деревья', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 560; let px, objs, dist, gates, alive, targetX, speed;
      function reset() { px = W / 2; targetX = px; objs = []; dist = 0; gates = 0; alive = true; speed = 200; for (let i = 0; i < 6; i++) spawn(H + i * 160); a.hdr.set(0, 0); }
      function spawn(y) { if (Math.random() < 0.6) { const gx = api.rand(70, W - 130); objs.push({ t: 'g', x: gx, y, w: 60 }); } else objs.push({ t: 't', x: api.rand(20, W - 20), y }); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Ворота', value: 0 }, { label: 'Рекорд', value: api.bestOf('ski') || 0 }], hint: 'Веди пальцем', onDown: p => targetX = p.x, onMove: (p, e) => { if (e.buttons || e.pointerType === 'touch') targetX = p.x; }, onKey: e => { if (e.key === 'ArrowLeft') targetX = px - 40; if (e.key === 'ArrowRight') targetX = px + 40; },
        frame(dt, ctx) {
          if (alive) { px += (targetX - px) * Math.min(1, dt * 8); speed += dt * 6; dist += speed * dt; objs.forEach(o => o.y -= speed * dt); objs = objs.filter(o => o.y > -60); while (objs.length < 6) spawn(objs[objs.length - 1].y + 160); for (const o of objs) { if (o.t === 'g' && !o.done && o.y < 120 && o.y > 100) { o.done = true; if (px > o.x && px < o.x + o.w) { gates++; a.hdr.set(0, gates); api.sound('good'); if (gates % 10 === 0) api.addCoins(3); } else { alive = false; api.sound('bad'); over(api, 'ski', gates, 'Пропустили ворота', 4, reset); } } if (o.t === 't' && Math.abs(o.x - px) < 18 && Math.abs(o.y - 110) < 22) { alive = false; api.sound('boom'); api.vibrate([60, 40, 120]); over(api, 'ski', gates, 'Врезались в дерево', 4, reset); } } }
          ctx.fillStyle = '#f8fafc'; ctx.fillRect(0, 0, W, H); objs.forEach(o => { if (o.t === 'g') { emoji(ctx, '🚩', o.x, o.y, 26); emoji(ctx, '🚩', o.x + o.w, o.y, 26); } else emoji(ctx, '🌲', o.x, o.y, 36); }); emoji(ctx, '⛷', px, 110, 36);
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Метеоры ---------- */
  Games.register({ id: 'meteors', title: 'Метеорный дождь', icon: '🌠', cat: 'arcade', desc: 'Тапай по метеорам, пока они не упали на землю', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 560; let m, score, hp, alive, spawnT;
      function reset() { m = []; score = 0; hp = 5; alive = true; spawnT = 0; a.hdr.set(0, 0); a.hdr.set(1, 5); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Сбито', value: 0 }, { label: 'Земля ❤', value: 5 }, { label: 'Рекорд', value: api.bestOf('meteors') || 0 }], hint: 'Тап по метеору',
        onDown: p => { if (!alive) return; for (const x of m) if (!x.dead && Math.hypot(x.x - p.x, x.y - p.y) < x.r + 12) { x.dead = true; score++; a.hdr.set(0, score); api.sound('tap'); api.vibrate(5); if (score % 20 === 0) api.addCoins(5); return; } },
        frame(dt, ctx) { if (alive) { spawnT -= dt; if (spawnT <= 0) { spawnT = Math.max(0.3, 1 - score / 60); m.push({ x: api.rand(20, W - 20), y: -30, r: api.rand(14, 26), v: api.rand(70, 130) + score * 2, dx: api.rand(-30, 30) }); } m.forEach(x => { x.y += x.v * dt; x.x += x.dx * dt; if (x.y > H - 30) { x.dead = true; hp--; a.hdr.set(1, hp); api.sound('boom'); api.vibrate(40); } }); m = m.filter(x => !x.dead); if (hp <= 0) { alive = false; over(api, 'meteors', score, 'Земля разрушена', 5, reset); } } ctx.fillStyle = '#0b0b1a'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#166534'; ctx.fillRect(0, H - 30, W, 30); m.forEach(x => { ctx.strokeStyle = 'rgba(251,146,60,.5)'; ctx.lineWidth = x.r; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x.x - x.dx * .3, x.y - 40); ctx.lineTo(x.x, x.y); ctx.stroke(); circ(ctx, x.x, x.y, x.r, '#78350f'); circ(ctx, x.x - x.r / 3, x.y - x.r / 3, x.r / 3, '#a16207'); }); } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Пушка ---------- */
  Games.register({ id: 'cannon', title: 'Пушка', icon: '💥', cat: 'arcade', desc: 'Подбери угол и силу — попади в мишень', progress: api => 'Уровень ' + (api.level('cannon').lvl + 1),
    mount(screen, api) {
      const W = 360, H = 400; const L = api.level('cannon'); let ang = 45, power = 60, ball, target, shots, wind;
      function reset() { target = { x: api.rand(180, W - 30), y: H - 40 - api.rand(0, 120 + L.lvl * 5), r: Math.max(12, 26 - L.lvl) }; ball = null; shots = 5; wind = L.lvl > 5 ? api.rand(-30, 30) : 0; hdr.set(1, 5); hdr.set(2, wind ? (wind > 0 ? '→' : '←') + Math.abs(wind) : '—'); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Уровень', value: L.lvl + 1 }, { label: 'Выстрелов', value: 5 }, { label: 'Ветер', value: '—' }],
        frame(dt, ctx) { if (ball) { ball.vy += 500 * dt; ball.vx += wind * dt; ball.x += ball.vx * dt; ball.y += ball.vy * dt; if (Math.hypot(ball.x - target.x, ball.y - target.y) < target.r + 6) { ball = null; L.done(); api.sound('good'); api.end({ title: 'Попадание!', reward: 6 + shots * 2 + L.lvl, again: 'Дальше', onAgain: reset }); } else if (ball.y > H - 20 || ball.x > W + 20) { ball = null; api.sound('bad'); if (!shots) api.end({ win: false, title: 'Снаряды кончились', onAgain: reset }); } } ctx.fillStyle = '#bae6fd'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#65a30d'; ctx.fillRect(0, H - 20, W, 20); ctx.save(); ctx.translate(40, H - 30); ctx.rotate(-ang * Math.PI / 180); rr(ctx, 0, -8, 50, 16, 6, '#334155'); ctx.restore(); circ(ctx, 40, H - 30, 16, '#1e293b'); circ(ctx, target.x, target.y, target.r, '#ef4444'); circ(ctx, target.x, target.y, target.r * .6, '#fff'); circ(ctx, target.x, target.y, target.r * .25, '#ef4444'); if (ball) circ(ctx, ball.x, ball.y, 6, '#111'); ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.setLineDash([3, 6]); ctx.beginPath(); let sx = 40, sy = H - 30, vx = Math.cos(ang * Math.PI / 180) * power * 5, vy = -Math.sin(ang * Math.PI / 180) * power * 5; ctx.moveTo(sx, sy); for (let t = 0; t < 0.5; t += 0.05) { vy += 500 * 0.05; sx += vx * 0.05; sy += vy * 0.05; ctx.lineTo(sx, sy); } ctx.stroke(); ctx.setLineDash([]); } });
      const hdr = a.hdr; const { h } = api;
      const ctl = (label, get, set) => { const v = h('b', null, get()); return h('div', { class: 'row', style: 'gap:6px' }, h('span', { class: 'hint-text' }, label), h('button', { class: 'btn small', onclick: () => { set(-5); v.textContent = get(); } }, '−'), v, h('button', { class: 'btn small', onclick: () => { set(5); v.textContent = get(); } }, '+')); };
      screen.append(h('div', { class: 'bottom-bar row' }, ctl('Угол', () => ang + '°', d => ang = Math.max(10, Math.min(85, ang + d))), ctl('Сила', () => power, d => power = Math.max(20, Math.min(100, power + d))), h('button', { class: 'btn primary', onclick: () => { if (ball || !shots) return; shots--; hdr.set(1, shots); ball = { x: 40, y: H - 30, vx: Math.cos(ang * Math.PI / 180) * power * 5, vy: -Math.sin(ang * Math.PI / 180) * power * 5 }; api.sound('boom'); api.vibrate(20); } }, '🔥 Огонь')));
      this.unmount = a.stop; reset();
    } });

  /* ---------- Артиллерия ---------- */
  Games.register({ id: 'artillery', title: 'Артиллерийская дуэль', icon: '🎯', cat: 'arcade', desc: 'По очереди с компьютером: подбери угол и силу', bestLabel: 'Побед',
    mount(screen, api) {
      const W = 360, H = 400; let ground, me, ai, ang = 45, power = 55, shell, turn, hp, wins = api.load('art_w', 0), aiA = 45, aiP = 50, over2;
      function reset() { ground = []; let y = H - 60; for (let x = 0; x <= W; x += 10) { y += api.rand(-12, 12); y = Math.max(H - 160, Math.min(H - 30, y)); ground.push(y); } me = { x: 40 }; ai = { x: W - 40 }; shell = null; turn = 1; hp = { me: 3, ai: 3 }; aiA = 45; aiP = 50; over2 = false; hdr.set(0, 3); hdr.set(1, 3); }
      const gy = x => ground[Math.max(0, Math.min(ground.length - 1, Math.round(x / 10)))];
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Вы ❤', value: 3 }, { label: 'ПК ❤', value: 3 }, { label: 'Побед', value: wins }],
        frame(dt, ctx) {
          if (shell) { shell.vy += 400 * dt; shell.x += shell.vx * dt; shell.y += shell.vy * dt; const tgt = shell.who === 1 ? ai : me; const tx = tgt.x, ty = gy(tgt.x) - 10; if (Math.hypot(shell.x - tx, shell.y - ty) < 22) { shell = null; if (turn === 1) hp.ai--; else hp.me--; hdr.set(0, hp.me); hdr.set(1, hp.ai); api.sound('boom'); api.vibrate(40); if (hp.ai <= 0 || hp.me <= 0) { over2 = true; if (hp.ai <= 0) { wins++; api.store('art_w', wins); api.best('artillery', wins); api.end({ title: 'Победа!', reward: 25, onAgain: reset }); } else api.end({ win: false, title: 'Вас подбили', onAgain: reset }); return; } next(); } else if (shell.y > gy(shell.x) || shell.x < 0 || shell.x > W) { const miss = shell.x - tx; shell = null; api.sound('bad'); if (turn === 2) { aiP += miss > 0 ? 4 : -4; } next(); } }
          ctx.fillStyle = '#bae6fd'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#65a30d'; ctx.beginPath(); ctx.moveTo(0, H); ground.forEach((y, i) => ctx.lineTo(i * 10, y)); ctx.lineTo(W, H); ctx.fill(); emoji(ctx, '🚜', me.x, gy(me.x) - 14, 30); emoji(ctx, '🚜', ai.x, gy(ai.x) - 14, 30); if (shell) circ(ctx, shell.x, shell.y, 5, '#111'); text(ctx, turn === 1 ? 'Ваш ход' : 'Ход компьютера', W / 2, 20, 16, '#1e293b');
        } });
      const hdr = a.hdr; const { h } = api;
      function next() { if (over2) return; turn = 3 - turn; if (turn === 2) setTimeout(() => { const an = aiA + api.rand(-3, 3), pw = aiP + api.rand(-3, 3); shell = { x: ai.x, y: gy(ai.x) - 10, vx: -Math.cos(an * Math.PI / 180) * pw * 5, vy: -Math.sin(an * Math.PI / 180) * pw * 5, who: 2 }; api.sound('boom'); }, 700); }
      const ctl = (label, get, set) => { const v = h('b', null, get()); return h('div', { class: 'row', style: 'gap:6px' }, h('span', { class: 'hint-text' }, label), h('button', { class: 'btn small', onclick: () => { set(-5); v.textContent = get(); } }, '−'), v, h('button', { class: 'btn small', onclick: () => { set(5); v.textContent = get(); } }, '+')); };
      screen.append(h('div', { class: 'bottom-bar row' }, ctl('Угол', () => ang + '°', d => ang = Math.max(10, Math.min(85, ang + d))), ctl('Сила', () => power, d => power = Math.max(20, Math.min(100, power + d))), h('button', { class: 'btn primary', onclick: () => { if (shell || turn !== 1 || over2) return; shell = { x: me.x, y: gy(me.x) - 10, vx: Math.cos(ang * Math.PI / 180) * power * 5, vy: -Math.sin(ang * Math.PI / 180) * power * 5, who: 1 }; api.sound('boom'); api.vibrate(20); } }, '🔥 Огонь')));
      this.unmount = a.stop; reset();
    } });

  /* ---------- Утки ---------- */
  Games.register({ id: 'ducks', title: 'Охота на уток', icon: '🦆', cat: 'arcade', desc: 'Тапай по летящим уткам. 3 патрона на волну', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 520; let ducks, score, ammo, wave, alive, missedWaves;
      function newWave() { ducks = Array.from({ length: 1 + Math.min(3, Math.floor(wave / 3)) }, () => ({ x: api.rand(30, W - 30), y: H - 60, vx: api.rand(-160, 160), vy: -api.rand(100, 180), t: 0 })); ammo = 3; wave++; a.hdr.set(1, ammo); }
      function reset() { score = 0; wave = 0; alive = true; missedWaves = 0; newWave(); a.hdr.set(0, 0); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Уток', value: 0 }, { label: 'Патроны', value: 3 }, { label: 'Рекорд', value: api.bestOf('ducks') || 0 }], hint: 'Тап — выстрел',
        onDown: p => { if (!alive || !ammo) return; ammo--; a.hdr.set(1, ammo); api.sound('boom'); api.vibrate(15); let hit = false; for (const d of ducks) if (!d.dead && Math.hypot(d.x - p.x, d.y - p.y) < 28) { d.dead = true; hit = true; score++; a.hdr.set(0, score); if (score % 10 === 0) api.addCoins(5); } if (hit) api.sound('good'); },
        frame(dt, ctx) { if (alive) { ducks.forEach(d => { if (d.dead) { d.y += 300 * dt; return; } d.t += dt; d.x += d.vx * dt; d.y += d.vy * dt; if (d.x < 20 || d.x > W - 20) d.vx *= -1; if (d.y < 40) d.vy = Math.abs(d.vy) * .5; if (d.y > H - 80) d.vy = -Math.abs(d.vy); if (Math.random() < dt * 0.8) d.vx = api.rand(-180, 180); if (d.t > 7) d.gone = true; }); const live = ducks.filter(d => !d.dead && !d.gone); if (!live.length || (!ammo && !ducks.some(d => d.dead && d.y < H))) { if (ducks.some(d => !d.dead)) { missedWaves++; if (missedWaves >= 3) { alive = false; over(api, 'ducks', score, 'Утки улетели', 4, reset); return; } } newWave(); } } const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#38bdf8'); g.addColorStop(1, '#e0f2fe'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#15803d'; ctx.fillRect(0, H - 50, W, 50); ducks.forEach(d => { if (d.y < H) emoji(ctx, d.dead ? '💫' : '🦆', d.x, d.y, 34); }); } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Перекрёсток ---------- */
  Games.register({ id: 'traffic', title: 'Перекрёсток', icon: '🚦', cat: 'arcade', desc: 'Тап по машине — остановить/поехать. Не допусти аварии', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 360; let cars, score, alive, spawnT;
      function reset() { cars = []; score = 0; alive = true; spawnT = 0; a.hdr.set(0, 0); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Проехало', value: 0 }, { label: 'Рекорд', value: api.bestOf('traffic') || 0 }], hint: 'Тап по машине — стоп / поехали',
        onDown: p => { for (const c of cars) if (Math.abs(c.x - p.x) < 24 && Math.abs(c.y - p.y) < 24) { c.stop = !c.stop; api.sound('tap'); return; } },
        frame(dt, ctx) {
          if (alive) { spawnT -= dt; if (spawnT <= 0) { spawnT = Math.max(0.6, 1.6 - score / 40); const h2 = Math.random() < 0.5; cars.push(h2 ? { x: -30, y: H / 2 + (Math.random() < .5 ? -22 : 22) * 0, vx: api.rand(70, 120), vy: 0, c: `hsl(${api.rand(0, 360)},70%,55%)` } : { x: W / 2, y: -30, vx: 0, vy: api.rand(70, 120), c: `hsl(${api.rand(0, 360)},70%,55%)` }); }
            cars.forEach(c => { const ahead = cars.find(o => o !== c && ((c.vx && o.vx && o.x > c.x && o.x - c.x < 50 && o.y === c.y) || (c.vy && o.vy && o.y > c.y && o.y - c.y < 50 && o.x === c.x))); if (!c.stop && !ahead) { c.x += c.vx * dt; c.y += c.vy * dt; } if (c.x > W + 30 || c.y > H + 30) { c.gone = true; score++; a.hdr.set(0, score); if (score % 20 === 0) api.addCoins(5); } });
            cars = cars.filter(c => !c.gone); for (let i = 0; i < cars.length; i++) for (let j = i + 1; j < cars.length; j++) { const p = cars[i], q = cars[j]; if (p.vx !== q.vx && Math.abs(p.x - q.x) < 28 && Math.abs(p.y - q.y) < 28) { alive = false; api.sound('boom'); api.vibrate([80, 40, 120]); over(api, 'traffic', score, 'Авария!', 5, reset); } } }
          ctx.fillStyle = '#166534'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#374151'; ctx.fillRect(0, H / 2 - 30, W, 60); ctx.fillRect(W / 2 - 30, 0, 60, H); ctx.strokeStyle = '#fbbf24'; ctx.setLineDash([12, 12]); ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke(); ctx.setLineDash([]);
          cars.forEach(c => { ctx.save(); ctx.translate(c.x, c.y); if (c.vy) ctx.rotate(Math.PI / 2); rr(ctx, -20, -12, 40, 24, 6, c.c); rr(ctx, -6, -9, 14, 18, 3, '#1e1e33'); if (c.stop) { ctx.restore(); circ(ctx, c.x, c.y - 22, 5, '#ef4444'); } else ctx.restore(); });
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Рогатка ---------- */
  Games.register({ id: 'slingshot', title: 'Рогатка', icon: '🐦', cat: 'arcade', desc: 'Оттяни птицу и сбей все башни из блоков', progress: api => 'Уровень ' + (api.level('slingshot').lvl + 1),
    mount(screen, api) {
      const W = 360, H = 420; const L = api.level('slingshot'); let bird, blocks, drag, dragP, birds, done;
      const SX = 60, SY = H - 90;
      function reset() { bird = { x: SX, y: SY, vx: 0, vy: 0, fly: false }; blocks = []; const towers = 1 + Math.min(3, Math.floor(L.lvl / 3)); for (let t = 0; t < towers; t++) { const bx = 200 + t * 45; const hgt = 2 + api.rand(0, 2 + Math.floor(L.lvl / 4)); for (let i = 0; i < hgt; i++) blocks.push({ x: bx, y: H - 40 - i * 26, w: 26, h: 26, pig: i === hgt - 1, hp: 1 }); } birds = 3 + Math.floor(L.lvl / 5); done = false; drag = false; a.hdr.set(1, birds); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Уровень', value: L.lvl + 1 }, { label: 'Птиц', value: 3 }], hint: 'Оттяни птицу назад и отпусти',
        onDown: p => { if (bird.fly || done) return; if (Math.hypot(p.x - bird.x, p.y - bird.y) < 40) { drag = true; dragP = p; } }, onMove: p => { if (drag) { dragP = p; bird.x = SX + Math.max(-90, Math.min(20, p.x - SX)); bird.y = SY + Math.max(-60, Math.min(60, p.y - SY)); } },
        onUp: () => { if (!drag) return; drag = false; bird.vx = (SX - bird.x) * 9; bird.vy = (SY - bird.y) * 9; if (Math.hypot(bird.vx, bird.vy) < 60) { bird.x = SX; bird.y = SY; return; } bird.fly = true; birds--; a.hdr.set(1, birds); api.sound('jump'); },
        frame(dt, ctx) {
          if (bird.fly) { bird.vy += 600 * dt; bird.x += bird.vx * dt; bird.y += bird.vy * dt; for (const b of blocks) if (!b.dead && bird.x + 14 > b.x && bird.x - 14 < b.x + b.w && bird.y + 14 > b.y && bird.y - 14 < b.y + b.h) { b.dead = true; bird.vx *= 0.6; api.sound(b.pig ? 'good' : 'tap'); api.vibrate(10); if (b.pig) api.addCoins(1); const above = blocks.filter(o => !o.dead && o.x === b.x && o.y < b.y); above.forEach(o => { o.fall = true; }); } blocks.forEach(b => { if (b.fall && !b.dead) { b.y += 300 * dt; if (b.y > H - 40) { b.dead = true; if (b.pig) { api.sound('good'); api.addCoins(1); } } } }); if (bird.y > H - 20 || bird.x > W + 20 || bird.x < -20) { bird = { x: SX, y: SY, vx: 0, vy: 0, fly: false }; const pigs = blocks.filter(b => b.pig && !b.dead).length; if (!pigs) { done = true; L.done(); api.end({ title: 'Все башни разрушены!', reward: 10 + L.lvl + birds * 2, again: 'Дальше', onAgain: reset }); } else if (!birds) { done = true; api.end({ win: false, title: 'Птицы кончились', text: 'Осталось целей: ' + pigs, onAgain: reset }); } } }
          ctx.fillStyle = '#bae6fd'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#65a30d'; ctx.fillRect(0, H - 40, W, 40); rr(ctx, SX - 5, SY, 10, 50, 3, '#78350f'); if (drag) { ctx.strokeStyle = '#78350f'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(SX - 8, SY - 10); ctx.lineTo(bird.x, bird.y); ctx.lineTo(SX + 8, SY - 10); ctx.stroke(); }
          blocks.forEach(b => { if (b.dead) return; if (b.pig) emoji(ctx, '🐷', b.x + 13, b.y + 13, 24); else rr(ctx, b.x, b.y, b.w, b.h, 3, '#a16207'); }); emoji(ctx, '🐦', bird.x, bird.y, 30);
        } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Колонны ---------- */
  Games.register({ id: 'columns', title: 'Колонны', icon: '🟪', cat: 'arcade', desc: 'Падают тройки камней — собирай 3+ в ряд по любой линии', bestLabel: 'Рекорд',
    mount(screen, api) {
      const COLS = 7, ROWS = 14, CS = 30, W = COLS * CS, H = ROWS * CS; const COL = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#c084fc']; let g, cur, score, alive, dropT, speed;
      function newPiece() { cur = { x: 3, y: 0, c: [0, 0, 0].map(() => api.rand(0, 4)) }; if (g[0][3] >= 0 || g[1][3] >= 0 || g[2][3] >= 0) { alive = false; over(api, 'columns', score, 'Стакан полон', 50, reset); } }
      function reset() { g = Array.from({ length: ROWS }, () => Array(COLS).fill(-1)); score = 0; alive = true; dropT = 0; speed = 0.5; newPiece(); a.hdr.set(0, 0); }
      const free = (x, y) => y < ROWS && x >= 0 && x < COLS && g[y][x] < 0;
      function lock() { for (let i = 0; i < 3; i++) if (cur.y + i < ROWS) g[cur.y + i][cur.x] = cur.c[i]; let chain = 0; while (true) { const m = new Set(); for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) { const v = g[y][x]; if (v < 0) continue; for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [1, -1]]) { let n = 1; while (y + dy * n >= 0 && y + dy * n < ROWS && x + dx * n < COLS && g[y + dy * n][x + dx * n] === v) n++; if (n >= 3) for (let k = 0; k < n; k++) m.add((y + dy * k) * COLS + x + dx * k); } } if (!m.size) break; chain++; m.forEach(k => g[Math.floor(k / COLS)][k % COLS] = -1); score += m.size * 10 * chain; api.sound('good'); if (chain > 1) api.addCoins(chain); for (let x = 0; x < COLS; x++) { const col = []; for (let y = ROWS - 1; y >= 0; y--) if (g[y][x] >= 0) col.push(g[y][x]); for (let y = ROWS - 1; y >= 0; y--) g[y][x] = col[ROWS - 1 - y] != null ? col[ROWS - 1 - y] : -1; } } a.hdr.set(0, score); speed = Math.max(0.12, 0.5 - score / 3000); newPiece(); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Счёт', value: 0 }, { label: 'Рекорд', value: api.bestOf('columns') || 0 }], hint: 'Свайп влево/вправо — сдвиг, тап — прокрутить цвета, вниз — сбросить',
        onKey: e => { if (e.key === 'ArrowLeft') move(-1); if (e.key === 'ArrowRight') move(1); if (e.key === 'ArrowUp') rot(); if (e.key === 'ArrowDown') drop(); },
        frame(dt, ctx) { if (alive) { dropT += dt; if (dropT > speed) { dropT = 0; if (free(cur.x, cur.y + 3)) cur.y++; else lock(); } } ctx.fillStyle = '#171728'; ctx.fillRect(0, 0, W, H); for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (g[y][x] >= 0) circ(ctx, x * CS + CS / 2, y * CS + CS / 2, CS / 2 - 2, COL[g[y][x]]); if (alive) for (let i = 0; i < 3; i++) circ(ctx, cur.x * CS + CS / 2, (cur.y + i) * CS + CS / 2, CS / 2 - 2, COL[cur.c[i]]); } });
      function move(d) { if (alive && free(cur.x + d, cur.y + 2) && free(cur.x + d, cur.y)) cur.x += d; }
      function rot() { if (alive) { cur.c.unshift(cur.c.pop()); api.sound('tap'); } }
      function drop() { if (!alive) return; while (free(cur.x, cur.y + 3)) cur.y++; lock(); }
      api.swipe(a.cv.canvas, d => { if (d === 'tap') rot(); else if (d === 'l') move(-1); else if (d === 'r') move(1); else if (d === 'd') drop(); });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Гравитация ---------- */
  Games.register({ id: 'gravity', title: 'Гравитация', icon: '🔃', cat: 'arcade', desc: 'Тап — перевернуть гравитацию. Беги по потолку и полу', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 400; let y, g, obs, dist, alive, speed, started, vy;
      function reset() { y = H - 50; vy = 0; g = 1; obs = []; dist = 0; alive = true; speed = 220; started = false; for (let i = 0; i < 4; i++) obs.push({ x: W + i * 200, top: Math.random() < .5 }); a.hdr.set(0, 0); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Дистанция', value: 0 }, { label: 'Рекорд', value: api.bestOf('gravity') || 0 }], hint: 'Тап — смена гравитации', onDown: () => { if (!alive) return; started = true; g *= -1; api.sound('jump'); api.vibrate(6); }, onKey: e => { if (e.key === ' ') { started = true; g *= -1; } },
        frame(dt, ctx) { if (alive && started) { vy += g * 1600 * dt; y += vy * dt; if (y > H - 50) { y = H - 50; vy = 0; } if (y < 50) { y = 50; vy = 0; } speed += dt * 8; dist += speed * dt / 10; a.hdr.set(0, Math.floor(dist)); obs.forEach(o => o.x -= speed * dt); obs = obs.filter(o => o.x > -40); while (obs.length < 4) obs.push({ x: obs[obs.length - 1].x + api.rand(160, 260), top: Math.random() < .5 }); for (const o of obs) { const oy = o.top ? 30 : H - 30; if (Math.abs(o.x - 80) < 22 && Math.abs(y - oy) < 36) { alive = false; api.sound('boom'); api.vibrate([60, 40, 120]); over(api, 'gravity', Math.floor(dist), 'Врезались!', 20, reset); } } } ctx.fillStyle = '#1e1b4b'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#4c1d95'; ctx.fillRect(0, 0, W, 30); ctx.fillRect(0, H - 30, W, 30); obs.forEach(o => rr(ctx, o.x - 12, o.top ? 30 : H - 70, 24, 40, 4, '#f87171')); ctx.save(); ctx.translate(80, y); if (g < 0) ctx.scale(1, -1); rr(ctx, -16, -20, 32, 40, 8, '#22d3ee'); circ(ctx, 6, -8, 4, '#111'); ctx.restore(); if (!started) text(ctx, 'Тап — старт', W / 2, H / 2, 22); } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Зигзаг ---------- */
  Games.register({ id: 'zigzag', title: 'Зигзаг', icon: '↗️', cat: 'arcade', desc: 'Шарик едет по дорожке — тап меняет направление', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 560; let path, bx, by, dir, score, alive, started, speed, camY;
      function reset() { path = []; let x = W / 2, y = H - 80; for (let i = 0; i < 60; i++) { path.push({ x, y, w: 60 }); const d = Math.random() < .5 ? -1 : 1; x += d * 40; y -= 40; x = Math.max(60, Math.min(W - 60, x)); } bx = W / 2; by = H - 80; dir = 1; score = 0; alive = true; started = false; speed = 130; camY = 0; a.hdr.set(0, 0); }
      const onPath = (x, y) => path.some(p => Math.abs(p.y - y) < 24 && Math.abs(p.x - x) < p.w / 2 + 8);
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Счёт', value: 0 }, { label: 'Рекорд', value: api.bestOf('zigzag') || 0 }], hint: 'Тап — поворот', onDown: () => { if (!alive) return; started = true; dir *= -1; api.sound('tap'); }, onKey: e => { if (e.key === ' ') { started = true; dir *= -1; } },
        frame(dt, ctx) { if (alive && started) { bx += dir * speed * dt; by -= speed * dt; speed += dt * 4; if (!onPath(bx, by)) { alive = false; api.sound('boom'); over(api, 'zigzag', score, 'Упали с дорожки', 5, reset); } const ns = Math.floor((H - 80 - by) / 40); if (ns > score) { score = ns; a.hdr.set(0, score); if (score % 20 === 0) api.addCoins(3); } camY = by - H * 0.6; while (path[path.length - 1].y > by - H) { const l = path[path.length - 1]; const d = Math.random() < .5 ? -1 : 1; let x = Math.max(60, Math.min(W - 60, l.x + d * 40)); path.push({ x, y: l.y - 40, w: Math.max(36, 60 - score / 5) }); } path = path.filter(p => p.y < by + H); } ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, W, H); path.forEach(p => rr(ctx, p.x - p.w / 2, p.y - camY - 20, p.w, 40, 6, '#334155')); circ(ctx, bx, by - camY, 12, '#fbbf24'); if (!started) text(ctx, 'Тап — старт', W / 2, H / 2 - 100, 22); } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Субмарина ---------- */
  Games.register({ id: 'submarine', title: 'Субмарина', icon: '🚢', cat: 'arcade', desc: 'Держи — погружение. Уворачивайся от мин, собирай сокровища', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 480; let y, vy, hold, objs, dist, gold, alive, spawnT;
      function reset() { y = H / 2; vy = 0; hold = false; objs = []; dist = 0; gold = 0; alive = true; spawnT = 0; a.hdr.set(0, 0); a.hdr.set(1, 0); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Метры', value: 0 }, { label: '💰', value: 0 }, { label: 'Рекорд', value: api.bestOf('submarine') || 0 }], hint: 'Удерживай — вниз, отпусти — вверх', onDown: () => hold = true, onUp: () => hold = false, onKey: e => { if (e.key === ' ') hold = true; },
        frame(dt, ctx) { if (alive) { vy += (hold ? 700 : -700) * dt; vy = Math.max(-220, Math.min(220, vy)); y += vy * dt; if (y < 40) { y = 40; vy = 0; } if (y > H - 40) { y = H - 40; vy = 0; } const sp = 160 + dist / 30; dist += sp * dt / 10; a.hdr.set(0, Math.floor(dist)); spawnT -= dt; if (spawnT <= 0) { spawnT = 0.8; objs.push({ x: W + 30, y: api.rand(40, H - 40), t: Math.random() < 0.3 ? 'g' : 'm' }); } objs.forEach(o => o.x -= sp * dt); objs = objs.filter(o => o.x > -40); for (const o of objs) if (Math.hypot(o.x - 70, o.y - y) < 30 && !o.hit) { o.hit = true; if (o.t === 'g') { gold++; a.hdr.set(1, gold); api.sound('coin'); } else { alive = false; api.sound('boom'); api.vibrate([80, 40, 120]); api.addCoins(gold); api.best('submarine', Math.floor(dist)); api.end({ win: false, title: 'Мина!', text: `${Math.floor(dist)} м, сокровищ ${gold} (+${gold})`, onAgain: reset }); } } objs = objs.filter(o => !(o.hit && o.t === 'g')); } const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0ea5e9'); g.addColorStop(1, '#082f49'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); objs.forEach(o => emoji(ctx, o.t === 'g' ? '💰' : '💣', o.x, o.y, 30)); ctx.save(); ctx.translate(70, y); rr(ctx, -30, -12, 60, 24, 12, '#fbbf24'); rr(ctx, -8, -24, 16, 14, 4, '#fbbf24'); circ(ctx, 12, 0, 5, '#0ea5e9'); ctx.restore(); } });
      window.addEventListener('keyup', a._ku = () => hold = false); this.unmount = () => { a.stop(); window.removeEventListener('keyup', a._ku); }; reset();
    } });

  /* ---------- Пожарные ---------- */
  Games.register({ id: 'firefighter', title: 'Пожарные', icon: '🧯', cat: 'arcade', desc: 'Лови прыгающих людей на батут и отбрасывай в машину', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 360, H = 480; let px, people, score, missed, alive, spawnT;
      function reset() { px = W / 2; people = []; score = 0; missed = 0; alive = true; spawnT = 1; a.hdr.set(0, 0); a.hdr.set(1, '0/3'); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Спасено', value: 0 }, { label: 'Упало', value: '0/3' }, { label: 'Рекорд', value: api.bestOf('firefighter') || 0 }], hint: 'Веди пальцем — батут. Каждый отскок — ближе к машине', onDown: p => px = p.x, onMove: (p, e) => { if (e.buttons || e.pointerType === 'touch') px = p.x; }, onKey: e => { if (e.key === 'ArrowLeft') px -= 30; if (e.key === 'ArrowRight') px += 30; },
        frame(dt, ctx) { if (alive) { px = Math.max(40, Math.min(W - 80, px)); spawnT -= dt; if (spawnT <= 0) { spawnT = Math.max(1, 2.5 - score / 20); people.push({ x: 40, y: 120, vx: api.rand(60, 120), vy: -100, b: 0 }); } people.forEach(p => { p.vy += 500 * dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.y > H - 60 && p.vy > 0) { if (Math.abs(p.x - px) < 40) { p.vy = -520; p.vx = 110 + p.b * 20; p.b++; api.sound('jump'); api.vibrate(5); } else if (p.y > H - 30) { p.dead = true; missed++; a.hdr.set(1, missed + '/3'); api.sound('bad'); } } if (p.x > W - 40 && p.y > H - 150) { p.dead = true; score++; a.hdr.set(0, score); api.sound('coin'); if (score % 10 === 0) api.addCoins(5); } }); people = people.filter(p => !p.dead); if (missed >= 3) { alive = false; over(api, 'firefighter', score, 'Слишком много упало', 3, reset); } } ctx.fillStyle = '#1e1b4b'; ctx.fillRect(0, 0, W, H); rr(ctx, 10, 60, 70, H - 60, 0, '#7f1d1d'); for (let i = 0; i < 4; i++) emoji(ctx, '🔥', 45, 90 + i * 90, 26); ctx.fillStyle = '#374151'; ctx.fillRect(0, H - 30, W, 30); emoji(ctx, '🚒', W - 40, H - 60, 50); rr(ctx, px - 40, H - 40, 80, 10, 5, '#fbbf24'); people.forEach(p => emoji(ctx, '🧑', p.x, p.y, 26)); } });
      this.unmount = a.stop; reset();
    } });

  /* ---------- Скакалка ---------- */
  Games.register({ id: 'jumprope', title: 'Скакалка', icon: '🪢', cat: 'arcade', desc: 'Тап в момент, когда верёвка внизу. Темп растёт', bestLabel: 'Рекорд',
    mount(screen, api) {
      const W = 300, H = 300; let ang, spd, jump, vy, score, alive, hitDone;
      function reset() { ang = 0; spd = 3; jump = 0; vy = 0; score = 0; alive = true; hitDone = false; a.hdr.set(0, 0); }
      const a = api.arcade(screen, { w: W, h: H, stats: [{ label: 'Прыжков', value: 0 }, { label: 'Рекорд', value: api.bestOf('jumprope') || 0 }], hint: 'Тап — прыжок', onDown: () => { if (alive && jump === 0) { vy = -330; api.sound('jump'); } }, onKey: e => { if (e.key === ' ' && jump === 0) vy = -330; },
        frame(dt, ctx) { if (alive) { ang += spd * dt; vy += 1000 * dt; jump += vy * dt; if (jump > 0) { jump = 0; vy = 0; } const ropeLow = Math.sin(ang) > 0.9; if (ropeLow && !hitDone) { hitDone = true; if (jump > -12) { alive = false; api.sound('bad'); api.vibrate(60); over(api, 'jumprope', score, 'Запутались!', 5, reset); } else { score++; a.hdr.set(0, score); spd += 0.08; api.sound('tap'); if (score % 20 === 0) api.addCoins(3); } } if (!ropeLow) hitDone = false; } ctx.fillStyle = '#fde68a'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#a16207'; ctx.fillRect(0, H - 30, W, 30); const ry = H - 30 + Math.sin(ang) * 100; ctx.strokeStyle = '#7c2d12'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(40, H - 100); ctx.quadraticCurveTo(W / 2, ry, W - 40, H - 100); ctx.stroke(); emoji(ctx, '🧍', W / 2, H - 60 + jump, 50); } });
      this.unmount = a.stop; reset();
    } });
})();
