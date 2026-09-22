from PIL import Image, ImageDraw, ImageFont
import math
S = 1024
img = Image.new('RGBA', (S, S), (0,0,0,0))
# gradient background
grad = Image.new('RGBA', (S, S))
px = grad.load()
c1 = (139, 92, 246); c2 = (34, 211, 238)
for y in range(S):
    for x in range(S):
        t = (x + y) / (2 * S)
        px[x, y] = tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3)) + (255,)
mask = Image.new('L', (S, S), 0)
ImageDraw.Draw(mask).rounded_rectangle([0, 0, S-1, S-1], radius=220, fill=255)
img.paste(grad, (0, 0), mask)
d = ImageDraw.Draw(img)
font = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 210)
small = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 120)
# 2x2 tiles
pad, gap = 120, 36
tw = (S - 2*pad - gap) // 2
tiles = [(pad, pad), (pad+tw+gap, pad), (pad, pad+tw+gap), (pad+tw+gap, pad+tw+gap)]
ov = Image.new('RGBA', (S, S), (0,0,0,0)); od = ImageDraw.Draw(ov)
for (x, y) in tiles:
    od.rounded_rectangle([x, y, x+tw, y+tw], radius=70, fill=(255,255,255,50), outline=(255,255,255,110), width=6)
img = Image.alpha_composite(img, ov); d = ImageDraw.Draw(img)
def center(x, y): return (x + tw/2, y + tw/2)
# 1: letter
cx, cy = center(*tiles[0]); d.text((cx, cy+8), 'Ч', font=font, fill='white', anchor='mm', stroke_width=10, stroke_fill=(60,20,120))
# 2: coin
cx, cy = center(*tiles[1]); r = 120
d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=(251,191,36), outline=(180,120,10), width=10)
d.ellipse([cx-r+28, cy-r+28, cx+r-28, cy+r-28], outline=(180,120,10), width=6)
d.text((cx, cy+4), '$', font=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 150), fill=(120,70,0), anchor='mm')
# 3: dice
cx, cy = center(*tiles[2]); r = 118
d.rounded_rectangle([cx-r, cy-r, cx+r, cy+r], radius=40, fill='white')
for (dx, dy) in [(-1,-1),(0,0),(1,1),(1,-1),(-1,1)]:
    d.ellipse([cx+dx*68-22, cy+dy*68-22, cx+dx*68+22, cy+dy*68+22], fill=(30,30,60))
# 4: tetris T block
cx, cy = center(*tiles[3]); b = 78; g = 8
cells = [(-1,-0.5),(0,-0.5),(1,-0.5),(0,0.5)]
for (ix, iy) in cells:
    x0 = cx + ix*(b+g) - b/2; y0 = cy + iy*(b+g) - b/2
    d.rounded_rectangle([x0, y0, x0+b, y0+b], radius=16, fill=(52,211,153), outline=(6,95,70), width=6)
img.save('assets/icon.png')
# foreground for adaptive icon (safe zone) & background
fg = Image.new('RGBA', (S, S), (0,0,0,0))
inner = img.resize((int(S*0.66), int(S*0.66)), Image.LANCZOS)
fg.paste(inner, ((S-inner.width)//2, (S-inner.height)//2), inner)
fg.save('assets/icon-foreground.png')
bg = Image.new('RGBA', (S, S), (15,15,26,255)); bg.save('assets/icon-background.png')
# splash 2732
sp = Image.new('RGBA', (2732, 2732), (15,15,26,255))
ic = img.resize((600, 600), Image.LANCZOS); sp.paste(ic, ((2732-600)//2, (2732-600)//2 - 120), ic)
ImageDraw.Draw(sp).text((2732/2, 2732/2 + 320), 'Чмогейм', font=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 160), fill='white', anchor='mm')
sp.save('assets/splash.png'); sp.save('assets/splash-dark.png')
print('ok')
