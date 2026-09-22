import io
def patch(path, pairs):
    s=open(path,encoding='utf-8').read()
    for a,b in pairs:
        assert s.count(a)==1, (path, a[:70], s.count(a))
        s=s.replace(a,b)
    open(path,'w',encoding='utf-8').write(s); print(path,'ok')

patch('www/js/games/arcade3.js', [
# airhockey
("const W = 360, H = 600, R = 28, PR = 16; let me, ai, puck, sm, sa, over, wins = api.load('ah_w', 0);","const W = 360, H = 600, R = 28, PR = 16; let me, ai, puck, sm, sa, over, wins = api.load('ah_w', 0), diff = 1;"),
("ai.x += (tx - ai.x) * Math.min(1, dt * 5); ai.y += (ty - ai.y) * Math.min(1, dt * 4);","const k = [2.2, 5, 9][diff]; ai.x += (tx - ai.x) * Math.min(1, dt * k); ai.y += (ty - ai.y) * Math.min(1, dt * k * 0.8);"),
("      this.unmount = a.stop; reset();\n    } });\n\n  /* ---------- Цветной переключатель ---------- */","      this.unmount = a.stop; reset(); over = true; api.difficulty('airhockey', d => { diff = d; reset(); });\n    } });\n\n  /* ---------- Цветной переключатель ---------- */"),
# pong
("const W = 360, H = 560, PW = 80; let px, ax, ball, sm, sa, over, wins = api.load('pong_w', 0);","const W = 360, H = 560, PW = 80; let px, ax, ball, sm, sa, over, wins = api.load('pong_w', 0), diff = 1;"),
("ax += (ball.x - ax) * Math.min(1, dt * (2.5 + Math.min(3, (sm + sa) * .3)));","const tgtX = diff === 2 && ball.vy < 0 ? ball.x + ball.vx * Math.max(0, (ball.y - 40) / -ball.vy) : ball.x; ax += (Math.max(PW / 2, Math.min(W - PW / 2, tgtX)) - ax) * Math.min(1, dt * [1.6, 2.5 + Math.min(3, (sm + sa) * .3), 8][diff]);"),
("      this.unmount = a.stop; reset();\n    } });\n\n  /* ---------- Мини-гольф ---------- */","      this.unmount = a.stop; reset(); over = true; api.difficulty('pong', d => { diff = d; reset(); });\n    } });\n\n  /* ---------- Мини-гольф ---------- */"),
])

patch('www/js/games/arcade4.js', [
# tron
("let grid, me, ai, alive, acc, wins = api.load('tron_w', 0), started;","let grid, me, ai, alive, acc, wins = api.load('tron_w', 0), started, diff = 1;"),
("const space = ([dx, dy]) => { let n = 0; let x = ai.x + dx, y = ai.y + dy; while (free(x, y) && n < 15) { n++; x += dx; y += dy; } return n; }; opts.sort((p, q) => space(q) - space(p) + (Math.random() - .5)); const [dx, dy] = opts[0];",
 "const space = ([dx, dy]) => { if (diff === 0) return Math.random() * 3; let n = 0; let x = ai.x + dx, y = ai.y + dy; const lim = diff === 2 ? 60 : 15; while (free(x, y) && n < lim) { n++; x += dx; y += dy; } if (diff === 2) { const side = [[dy, -dx], [-dy, dx]].reduce((s, [sx, sy]) => { let m = 0, xx = ai.x + dx + sx, yy = ai.y + dy + sy; while (free(xx, yy) && m < 20) { m++; xx += sx; yy += sy; } return s + m; }, 0); n += side * 0.3; } return n; }; opts.sort((p, q) => space(q) - space(p) + (diff === 2 ? 0 : Math.random() - .5)); const [dx, dy] = opts[0];"),
("      this.unmount = a.stop; reset();\n    } });\n\n  /* ---------- Джетпак ---------- */","      this.unmount = a.stop; reset(); api.difficulty('tron', d => { diff = d; reset(); });\n    } });\n\n  /* ---------- Джетпак ---------- */"),
])

patch('www/js/games/arcade5.js', [
# artillery
("let ground, me, ai, ang = 45, power = 55, shell, turn, hp, wins = api.load('art_w', 0), aiA = 45, aiP = 50, over2;","let ground, me, ai, ang = 45, power = 55, shell, turn, hp, wins = api.load('art_w', 0), aiA = 45, aiP = 50, over2, diff = 1;"),
("if (turn === 2) { aiP += miss > 0 ? 4 : -4; } next(); } }","if (turn === 2) { aiP += (miss > 0 ? 4 : -4) * (diff === 0 ? 0.5 : diff === 2 ? 1.6 : 1); } next(); } }"),
("if (turn === 2) setTimeout(() => { const an = aiA + api.rand(-3, 3), pw = aiP + api.rand(-3, 3);","if (turn === 2) setTimeout(() => { const noise = [9, 3, 1][diff]; const an = aiA + api.rand(-noise, noise), pw = aiP + api.rand(-noise, noise);"),
("      this.unmount = a.stop; reset();\n    } });\n\n  /* ---------- Утки ---------- */","      this.unmount = a.stop; reset(); api.difficulty('artillery', d => { diff = d; reset(); });\n    } });\n\n  /* ---------- Утки ---------- */"),
])

patch('www/js/games/tictactoe.js', [
("      const sel = h('select', { class: 'btn small', onchange: e => { ai = +e.target.value; start(); } },\n        ['Легко', 'Средне', 'Сложно'].map((n, i) => h('option', { value: i, ...(i === ai ? { selected: '' } : {}) }, n)));\n      screen.append(h('div', { class: 'game-top' }, statEl, sel));",
 "      screen.append(h('div', { class: 'game-top' }, statEl, h('button', { class: 'btn small', onclick: () => api.difficulty('ttt', d => { ai = d; start(); }) }, ['😊', '🙂', '😈'][ai] + ' Сложность')));"),
("    start();\n  }\n});","    api.difficulty('ttt', d => { ai = d; start(); });\n  }\n});"),
])

patch('www/js/games/words3.js', [
("const { h } = api; let chain, used, cur, curEl, listEl, hdr, need;","const { h } = api; let chain, used, cur, curEl, listEl, hdr, need, diff = 1;"),
("const a = ai[api.rand(0, Math.min(ai.length - 1, 40))]; chain.push(a);","let a; if (diff === 0) a = ai[api.rand(0, ai.length - 1)]; else if (diff === 1) a = ai[api.rand(0, Math.min(ai.length - 1, 40))]; else { const cntFor = ch => D.all.filter(x => x[0] === ch && !used.has(x)).length; a = ai.slice(0, 200).sort((x, y) => cntFor(lastLetter(x)) - cntFor(lastLetter(y)))[0]; } chain.push(a);"),
("      start();\n    } });\n\n  /* Слоги */","      api.difficulty('wordchain', d => { diff = d; start(); });\n    } });\n\n  /* Слоги */"),
])
