from PIL import Image, ImageDraw, ImageFont
S = 1024
img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
grad = Image.new('RGBA', (S, S)); px = grad.load()
c1, c2 = (139, 92, 246), (34, 211, 238)
for y in range(S):
    for x in range(S):
        t = (x + y) / (2 * S)
        px[x, y] = tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3)) + (255,)
mask = Image.new('L', (S, S), 0); ImageDraw.Draw(mask).rounded_rectangle([0, 0, S-1, S-1], radius=220, fill=255)
img.paste(grad, (0, 0), mask)
ov = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
# свечение
d.ellipse([160, 160, S-160, S-160], fill=(255, 255, 255, 26))
# геймпад
cx, cy = S/2, S/2 + 10
body_w, body_h = 560, 330
d.rounded_rectangle([cx-body_w/2, cy-body_h/2, cx+body_w/2, cy+body_h/2], radius=150, fill=(255,255,255,240))
# ручки
d.ellipse([cx-body_w/2-40, cy-40, cx-body_w/2+150, cy+body_h/2+70], fill=(255,255,255,240))
d.ellipse([cx+body_w/2-150, cy-40, cx+body_w/2+40, cy+body_h/2+70], fill=(255,255,255,240))
# крестовина
dx, dy = cx-150, cy-10; arm, th = 108, 40
d.rounded_rectangle([dx-arm/2, dy-th/2, dx+arm/2, dy+th/2], radius=14, fill=(60,40,120,255))
d.rounded_rectangle([dx-th/2, dy-arm/2, dx+th/2, dy+arm/2], radius=14, fill=(60,40,120,255))
# кнопки
bx, by, r = cx+150, cy-10, 34
d.ellipse([bx-r, by-r-46, bx+r, by+r-46], fill=(239,68,68,255))
d.ellipse([bx-r+56, by-r+10, bx+r+56, by+r+10], fill=(251,191,36,255))
d.ellipse([bx-r-56, by-r+10, bx+r-56, by+r+10], fill=(52,211,153,255))
d.ellipse([bx-r, by-r+66, bx+r, by+r+66], fill=(96,165,250,255))
img = Image.alpha_composite(img, ov)
img.save('assets/icon.png')
fg = Image.new('RGBA', (S, S), (0,0,0,0)); inner = img.resize((int(S*0.66), int(S*0.66)), Image.LANCZOS)
fg.paste(inner, ((S-inner.width)//2, (S-inner.height)//2), inner); fg.save('assets/icon-foreground.png')
Image.new('RGBA', (S, S), (15,15,26,255)).save('assets/icon-background.png')
sp = Image.new('RGBA', (2732, 2732), (15,15,26,255))
ic = img.resize((620, 620), Image.LANCZOS); sp.paste(ic, ((2732-620)//2, (2732-620)//2 - 140), ic)
ImageDraw.Draw(sp).text((2732/2, 2732/2 + 340), 'Аркадия', font=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 170), fill='white', anchor='mm')
sp.save('assets/splash.png'); sp.save('assets/splash-dark.png')
print('icon ok')
