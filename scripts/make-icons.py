"""生成 App 图标（绿色渐变底 + 白色 “Việt” + 金色圆点）：python scripts/make-icons.py

输出：
  assets/icon.png                    1024  iOS / 通用
  assets/pwa/icon-192.png, 512       网页版添加到桌面
  assets/favicon.png                 48    浏览器标签页
  assets/android-icon-*.png                安卓自适应图标（前景 / 背景 / 单色）
"""
import os

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
A = os.path.join(ROOT, 'assets')
FONT = os.path.join(ROOT, 'node_modules', '@expo-google-fonts', 'be-vietnam-pro', '800ExtraBold', 'BeVietnamPro_800ExtraBold.ttf')
S = 2048  # 先画大图再缩小，边缘更平滑
GREEN_A = (43, 182, 115)
GREEN_B = (11, 138, 94)
GOLD = (247, 201, 72)


def gradient():
    """斜向绿色渐变（和首页今日目标卡片同色），左上角一团柔光"""
    g = Image.new('RGB', (S, S))
    px = g.load()
    for y in range(S):
        for x in range(S):
            t = (x + y) / (2 * S)
            px[x, y] = tuple(int(GREEN_A[i] + (GREEN_B[i] - GREEN_A[i]) * t) for i in range(3))
    layer = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    ImageDraw.Draw(layer).ellipse((-S * 0.3, -S * 0.3, S * 0.7, S * 0.6), fill=(255, 255, 255, 40))
    return Image.alpha_composite(g.convert('RGBA'), layer.filter(ImageFilter.GaussianBlur(S * 0.08)))


def mark(scale=1.0, color='white', dot=GOLD, shadow=True):
    """透明底上的 “Việt” + 圆点；scale 控制占画面的比例（安卓前景要缩小到安全区里）"""
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    font = ImageFont.truetype(FONT, int(S * 0.3 * scale))
    l, t, r, b = d.textbbox((0, 0), 'Việt', font=font)
    cy = S / 2 - S * 0.04 * scale
    pos = (S / 2 - (l + r) / 2, cy - (t + b) / 2)
    if shadow:
        d.text((pos[0], pos[1] + S * 0.012 * scale), 'Việt', font=font, fill=(0, 70, 45, 90))
    d.text(pos, 'Việt', font=font, fill=color)
    r_dot = S * 0.03 * scale
    y_dot = S / 2 + S * 0.25 * scale
    d.ellipse((S / 2 - r_dot, y_dot - r_dot, S / 2 + r_dot, y_dot + r_dot), fill=dot)
    return img


def save(img, path, size, mode='RGB'):
    img.convert(mode).resize((size, size), Image.LANCZOS).save(path, optimize=True)
    print('  ', os.path.relpath(path, ROOT), size)


bg = gradient()
full = Image.alpha_composite(bg, mark())
save(full, os.path.join(A, 'icon.png'), 1024)
os.makedirs(os.path.join(A, 'pwa'), exist_ok=True)
save(full, os.path.join(A, 'pwa', 'icon-192.png'), 192)
save(full, os.path.join(A, 'pwa', 'icon-512.png'), 512)
save(full, os.path.join(A, 'favicon.png'), 48)
# 安卓自适应图标：系统会把图标裁成圆形 / 圆角等形状，前景内容要在中间 66% 以内
save(bg, os.path.join(A, 'android-icon-background.png'), 512)
save(mark(scale=0.72), os.path.join(A, 'android-icon-foreground.png'), 512, 'RGBA')
save(mark(scale=0.72, color='white', dot='white', shadow=False), os.path.join(A, 'android-icon-monochrome.png'), 432, 'RGBA')
