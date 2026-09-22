from PIL import Image, ImageDraw, ImageFont, ImageFilter
S = 1024
# фон: диагональный градиент
grad = Image.new('RGBA', (S, S)); px = grad.load()
c1, c2 = (168, 85, 247), (34, 211, 238)
for y in range(S):
    for x in range(S):
        t = (x * 0.6 + y * 0.4) / S
        t = max(0.0, min(1.0, t))
        px[x, y] = tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3)) + (255,)
img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
mask = Image.new('L', (S, S), 0); ImageDraw.Draw(mask).rounded_rectangle([0, 0, S-1, S-1], radius=225, fill=255)
img.paste(grad, (0, 0), mask)
# мягкое свечение сверху
ov = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
d.ellipse([-120, -320, S + 120, 420], fill=(255, 255, 255, 34))
img = Image.alpha_composite(img, ov)
d = ImageDraw.Draw(img)
# буква Ч
font = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 620)
cx, cy = S / 2, S / 2 + 18
# тень
d.text((cx + 10, cy + 16), 'Ч', font=font, fill=(40, 10, 80, 110), anchor='mm')
d.text((cx, cy), 'Ч', font=font, fill='white', anchor='mm', stroke_width=14, stroke_fill=(70, 25, 130, 255))
img.save('assets/icon.png')
fg = Image.new('RGBA', (S, S), (0, 0, 0, 0)); inner = img.resize((int(S * 0.66), int(S * 0.66)), Image.LANCZOS)
fg.paste(inner, ((S - inner.width) // 2, (S - inner.height) // 2), inner); fg.save('assets/icon-foreground.png')
Image.new('RGBA', (S, S), (15, 15, 26, 255)).save('assets/icon-background.png')
sp = Image.new('RGBA', (2732, 2732), (15, 15, 26, 255))
ic = img.resize((620, 620), Image.LANCZOS); sp.paste(ic, ((2732 - 620) // 2, (2732 - 620) // 2 - 140), ic)
ImageDraw.Draw(sp).text((2732 / 2, 2732 / 2 + 340), 'Чмога', font=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 180), fill='white', anchor='mm')
sp.save('assets/splash.png'); sp.save('assets/splash-dark.png')
print('icon ok')
