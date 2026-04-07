#!/usr/bin/env python3
"""
Generate Zakatemas app icons.
Design: Crescent moon + 5-pointed star, gold on dark background.
The hilal (crescent) & star is a classic Islamic symbol, culturally resonant
for this Malaysian zakat calculator.
"""

from PIL import Image, ImageDraw, ImageFilter
import math
import os

BG      = (13, 11, 8, 255)        # #0d0b08 — matches app bg
GOLD    = (212, 160, 23, 255)     # #d4a017 — primary gold
GOLD_HI = (242, 204, 76, 155)     # upper highlight, semi-transparent
GOLD_SH = (110, 72, 5, 185)       # drop shadow

OUT = '/Users/sulaiman/Workspace/zakatemas/public'


def star_pts(cx, cy, R, r, n=5):
    """Vertices of an n-pointed star, point facing up."""
    pts = []
    for i in range(n * 2):
        angle  = -math.pi / 2 + math.pi * i / n
        radius = R if i % 2 == 0 else r
        pts.append((cx + radius * math.cos(angle),
                    cy + radius * math.sin(angle)))
    return pts


def rounded_rect(draw, x0, y0, x1, y1, r, fill):
    """Rounded rectangle compatible with all Pillow versions."""
    r = min(r, (x1 - x0) // 2, (y1 - y0) // 2)
    draw.rectangle([x0 + r, y0,     x1 - r, y1    ], fill=fill)
    draw.rectangle([x0,     y0 + r, x1,     y1 - r], fill=fill)
    draw.ellipse([x0,          y0,          x0 + 2*r, y0 + 2*r], fill=fill)
    draw.ellipse([x1 - 2*r,    y0,          x1,       y0 + 2*r], fill=fill)
    draw.ellipse([x0,          y1 - 2*r,    x0 + 2*r, y1      ], fill=fill)
    draw.ellipse([x1 - 2*r,    y1 - 2*r,    x1,       y1      ], fill=fill)


def crescent_inner(cx, cy, R, tilt_deg):
    """Returns (R_inner, inner_cx, inner_cy) for a crescent at given tilt."""
    R_inner = R * 0.80
    offset  = R * 0.37
    tilt    = math.radians(tilt_deg)
    return R_inner, cx + offset * math.cos(tilt), cy + offset * math.sin(tilt)


def draw_crescent(draw, cx, cy, R, tilt_deg, fill, cut):
    """Crescent = filled outer circle with inner circle punched out."""
    R_i, icx, icy = crescent_inner(cx, cy, R, tilt_deg)
    draw.ellipse([cx  - R,   cy  - R,   cx  + R,   cy  + R  ], fill=fill)
    draw.ellipse([icx - R_i, icy - R_i, icx + R_i, icy + R_i], fill=cut)


def create_icon(size: int, maskable: bool = False) -> Image.Image:
    img  = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    if maskable:
        draw.rectangle([0, 0, size, size], fill=BG)
        scale = 0.295
    else:
        cr = max(2, int(size * 0.22))
        rounded_rect(draw, 0, 0, size, size, cr, BG)
        scale = 0.375

    cx, cy = size / 2.0, size / 2.0

    # Crescent center: nudged left-and-down so the star has room upper-right
    crx = cx - size * 0.055
    cry = cy + size * 0.035
    R   = size * scale

    # Opening angle: -28° → crescent opens toward upper-right
    TILT = -28

    # ── 1. Soft drop shadow ──────────────────────────────────────────
    if size >= 64:
        sh      = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        sh_draw = ImageDraw.Draw(sh)
        sh_off  = size * 0.024
        draw_crescent(sh_draw, crx + sh_off, cry + sh_off, R, TILT,
                      GOLD_SH, (0, 0, 0, 0))
        sh = sh.filter(ImageFilter.GaussianBlur(radius=max(2, int(size * 0.022))))
        img  = Image.alpha_composite(img, sh)
        draw = ImageDraw.Draw(img)

    # ── 2. Main crescent ─────────────────────────────────────────────
    draw_crescent(draw, crx, cry, R, TILT, GOLD, BG)

    # ── 3. Metallic highlight (upper-left rim) ────────────────────────
    if size >= 48:
        hi      = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        hi_draw = ImageDraw.Draw(hi)
        h_off   = -size * 0.011
        draw_crescent(hi_draw, crx + h_off, cry + h_off, R * 0.965, TILT,
                      GOLD_HI, (0, 0, 0, 0))
        img  = Image.alpha_composite(img, hi)
        draw = ImageDraw.Draw(img)

    # ── 4. 5-pointed star ────────────────────────────────────────────
    # Positioned in the crescent's cup (upper-right open area)
    star_cx = crx + R * 0.57
    star_cy = cry - R * 0.47
    star_R  = R * 0.235         # outer radius
    star_r  = star_R * 0.382   # inner radius (golden-ratio proportion)

    if star_R >= 2.0:
        # Star shadow
        if size >= 64:
            sh2      = Image.new('RGBA', (size, size), (0, 0, 0, 0))
            sh2_draw = ImageDraw.Draw(sh2)
            s2_off   = size * 0.017
            sh2_draw.polygon(
                star_pts(star_cx + s2_off, star_cy + s2_off, star_R, star_r),
                fill=GOLD_SH)
            sh2  = sh2.filter(ImageFilter.GaussianBlur(radius=max(1, int(size * 0.016))))
            img  = Image.alpha_composite(img, sh2)
            draw = ImageDraw.Draw(img)

        # Main star
        draw.polygon(star_pts(star_cx, star_cy, star_R, star_r), fill=GOLD)

        # Star highlight
        if size >= 48:
            hi2      = Image.new('RGBA', (size, size), (0, 0, 0, 0))
            hi2_draw = ImageDraw.Draw(hi2)
            h2_off   = -size * 0.009
            hi2_draw.polygon(
                star_pts(star_cx + h2_off, star_cy + h2_off,
                         star_R * 0.93, star_r * 0.93),
                fill=GOLD_HI)
            img  = Image.alpha_composite(img, hi2)
            draw = ImageDraw.Draw(img)

    return img


def save(img: Image.Image, path: str):
    img.save(path, 'PNG', optimize=True)
    print(f'  ✓  {os.path.basename(path):32s} ({img.width}×{img.height})')


def make_ico(path: str):
    sizes  = [48, 32, 16]
    imgs   = [create_icon(s).convert('RGBA') for s in sizes]
    imgs[0].save(path, format='ICO',
                 sizes=[(s, s) for s in sizes],
                 append_images=imgs[1:])
    print(f'  ✓  {os.path.basename(path):32s} (16, 32, 48 embedded)')


# ── Generate all icon files ─────────────────────────────────────────────────

print('\nGenerating Zakatemas icons  (crescent + star)…\n')

save(create_icon(16),  f'{OUT}/favicon-16x16.png')
save(create_icon(32),  f'{OUT}/favicon-32x32.png')
save(create_icon(64),  f'{OUT}/pwa-64x64.png')
save(create_icon(180), f'{OUT}/apple-touch-icon.png')
save(create_icon(192), f'{OUT}/pwa-192x192.png')
save(create_icon(512), f'{OUT}/pwa-512x512.png')

save(create_icon(192, maskable=True), f'{OUT}/maskable-192x192.png')
save(create_icon(512, maskable=True), f'{OUT}/maskable-512x512.png')

make_ico(f'{OUT}/favicon.ico')

print('\nDone.\n')
