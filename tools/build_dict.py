import re, json, random
random.seed(7)
nouns = set()
for w in open('tools/data/nouns.txt', encoding='utf-8'):
    w = w.strip().lower().replace('ё', 'е')
    if re.fullmatch(r'[а-я]{3,9}', w): nouns.add(w)
freq = {}
for i, line in enumerate(open('tools/data/freq.txt', encoding='utf-8')):
    w, c = line.split()
    w = w.replace('ё', 'е')
    if w in nouns and w not in freq: freq[w] = i
# rank by frequency
common = sorted(freq, key=freq.get)
print('common nouns', len(common))
# obvious junk / offensive filter (names in freq list are lowercase too)
bad = set('весь труп через знать стать перед плохо парня никто уда мар лан пак игил кап сан рожа отродье хер хуй пизда блядь ебать сука жопа дерьмо говно мудак сука хрен сиська член залупа'.split())
common = [w for w in common if w not in bad]
# свои слова (tools/custom_words.txt) — попадают во все словари и в уровни
custom = []
for w in open('tools/custom_words.txt', encoding='utf-8'):
    w = w.strip().lower().replace('ё', 'е')
    if re.fullmatch(r'[а-я]{3,12}', w) and w not in custom: custom.append(w)
common = custom + [w for w in common if w not in custom]
for w in custom: freq.setdefault(w, 0)
top = common[:9000]          # validation dictionary
core = common[:3500]         # words used as puzzle targets
core_set = set(core)
top_set = set(top)

from collections import Counter
def subwords(base, pool):
    bc = Counter(base); out = []
    for w in pool:
        if w == base or len(w) < 3: continue
        c = Counter(w)
        if all(bc[k] >= v for k, v in c.items()): out.append(w)
    return out

# WoW levels: base word 5-7 letters; choose 4-7 target words; layout crossword
def layout(words):
    words = sorted(words, key=len, reverse=True)
    grid = {}
    placed = []
    def can(w, r, c, d):
        cells = []
        for i, ch in enumerate(w):
            rr, cc = (r + i, c) if d else (r, c + i)
            g = grid.get((rr, cc))
            if g is not None and g != ch: return None
            if g is None:
                # neighbours perpendicular must be empty
                if d:
                    if (rr, cc-1) in grid or (rr, cc+1) in grid: return None
                else:
                    if (rr-1, cc) in grid or (rr+1, cc) in grid: return None
            cells.append((rr, cc, g is not None))
        # ends must be empty
        if d:
            if (r-1, c) in grid or (r+len(w), c) in grid: return None
        else:
            if (r, c-1) in grid or (r, c+len(w)) in grid: return None
        if grid and not any(x[2] for x in cells): return None
        return cells
    for idx, w in enumerate(words):
        if not grid:
            for i, ch in enumerate(w): grid[(0, i)] = ch
            placed.append((w, 0, 0, 0)); continue
        opts = []
        for (pr, pc, pd) in [(p[1], p[2], p[3]) for p in placed]:
            pass
        for (gr, gc), gch in list(grid.items()):
            for i, ch in enumerate(w):
                if ch != gch: continue
                for d in (0, 1):
                    r, c = (gr - i, gc) if d else (gr, gc - i)
                    cells = can(w, r, c, d)
                    if cells: opts.append((sum(x[2] for x in cells), r, c, d))
        if not opts: return None
        opts.sort(key=lambda o: (-o[0], random.random()))
        _, r, c, d = opts[0]
        for i, ch in enumerate(w):
            grid[(r + i, c) if d else (r, c + i)] = ch
        placed.append((w, r, c, d))
    rs = [k[0] for k in grid]; cs = [k[1] for k in grid]
    r0, c0 = min(rs), min(cs)
    return {'w': max(cs)-c0+1, 'h': max(rs)-r0+1,
            'words': [[w, r-r0, c-c0, d] for (w, r, c, d) in placed]}

levels = []
bases = [w for w in core if 5 <= len(w) <= 7]
random.shuffle(bases)
bases = [w for w in custom if 5 <= len(w) <= 10] + bases   # свои слова — первыми
used = set()
for b in bases:
    if len(levels) >= 420: break
    subs = subwords(b, core)
    subs = [s for s in subs if 3 <= len(s) <= 6]
    if len(subs) < 3: continue
    n = min(len(subs) + 1, random.choice([4, 5, 5, 6, 6, 7]))
    random.shuffle(subs)
    # prefer more frequent ones
    subs.sort(key=lambda s: freq[s] + random.randint(0, 800))
    words = [b] + subs[:n-1]
    lay = None
    for _ in range(6):
        random.shuffle(words)
        lay = layout(words)
        if lay and lay['w'] <= 9 and lay['h'] <= 9: break
        lay = None
    if not lay: continue
    letters = list(b); random.shuffle(letters)
    extra = [s for s in subwords(b, top) if s not in words]
    levels.append({'l': ''.join(letters), 'g': lay, 'x': extra[:60]})
# sort levels by difficulty (letter count then word count)
levels.sort(key=lambda L: (len(L['l']), len(L['g']['words'])))
print('wow levels', len(levels))

five = [w for w in core if len(w) == 5][:800]
fil = [w for w in core if 4 <= len(w) <= 7][:2500]

with open('www/data/words.js', 'w', encoding='utf-8') as f:
    f.write('window.DICT=' + json.dumps({'all': top, 'five': five, 'fil': fil}, ensure_ascii=False, separators=(',', ':')) + ';\n')
with open('www/data/wow.js', 'w', encoding='utf-8') as f:
    f.write('window.WOW_LEVELS=' + json.dumps(levels, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(levels[0]); print(levels[100]['l'], levels[100]['g']['words'])
