#!/usr/bin/env python3
"""
Generate the standardized 1200x630 Open Graph (OG) preview image for Agent Skills Hub.
Brand: Dark cyber aesthetics, neon purple 'S' circuit glyph, and metadata pills.
"""

import math, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.dirname(SCRIPT_DIR)
PUBLIC_DIR = os.path.join(FRONTEND_DIR, 'public')
DIST_DIR = os.path.join(FRONTEND_DIR, 'dist')

W, H = 1200, 630

# 1. Base Dark Canvas (Deep space void #050608)
base = Image.new('RGBA', (W, H), (5, 6, 8, 255))

# 2. Ambient Cyber Atmosphere (Radial Blobs)
glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(glow)

# Deep purple ambient aura on the left
for r in range(480, 40, -20):
    a = int(32 * (1 - r / 480)**1.5)
    glow_draw.ellipse([290 - r, 315 - r, 290 + r, 315 + r], fill=(126, 34, 206, a))

# Vibrant violet/magenta core glow behind S logo
for r in range(280, 20, -15):
    a = int(48 * (1 - r / 280)**1.2)
    glow_draw.ellipse([290 - r, 315 - r, 290 + r, 315 + r], fill=(168, 85, 247, a))

# Warm golden glow around right node position
for r in range(200, 15, -12):
    a = int(38 * (1 - r / 200)**1.3)
    glow_draw.ellipse([395 - r, 315 - r, 395 + r, 315 + r], fill=(245, 158, 11, a))

# Subtle blue/indigo ambient glow in top-right
for r in range(350, 50, -25):
    a = int(16 * (1 - r / 350))
    glow_draw.ellipse([980 - r, 140 - r, 980 + r, 140 + r], fill=(59, 130, 246, a))

base = Image.alpha_composite(base, glow)

# 3. Delicate Cyber Grid
grid = Image.new('RGBA', (W, H), (0, 0, 0, 0))
grid_draw = ImageDraw.Draw(grid)
grid_spacing = 40

for x in range(0, W, grid_spacing):
    grid_draw.line([(x, 0), (x, H)], fill=(75, 85, 120, 26), width=1)
for y in range(0, H, grid_spacing):
    grid_draw.line([(0, y), (W, y)], fill=(75, 85, 120, 26), width=1)

for x in range(120, W - 60, 120):
    for y in range(75, H - 45, 120):
        grid_draw.line([(x - 3, y), (x + 3, y)], fill=(168, 85, 247, 70), width=1)
        grid_draw.line([(x, y - 3), (x, y + 3)], fill=(168, 85, 247, 70), width=1)

grid_arr = np.array(grid, dtype=np.float32)
Y, X = np.ogrid[:H, :W]
dist_from_center_x = np.abs(X - W/2) / (W/2)
dist_from_center_y = np.abs(Y - H/2) / (H/2)
edge_fade = 1.0 - np.clip(dist_from_center_x**2.5 + dist_from_center_y**2.5, 0, 1)
grid_arr[:, :, 3] = grid_arr[:, :, 3] * edge_fade
grid = Image.fromarray(grid_arr.astype(np.uint8))
base = Image.alpha_composite(base, grid)

# 4. Logo Placement using Lighter blend mode
logo_path = os.path.join(PUBLIC_DIR, 'icon-512x512.png')
logo = Image.open(logo_path).convert('RGBA')
logo_size = 460
logo_resized = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)

logo_layer = Image.new('RGBA', (W, H), (0, 0, 0, 255))
logo_layer.paste(logo_resized, (60, 85))

base_rgb = base.convert('RGB')
logo_rgb = logo_layer.convert('RGB')
blended_rgb = ImageChops.lighter(base_rgb, logo_rgb)
base = blended_rgb.convert('RGBA')

draw = ImageDraw.Draw(base)

# 5. Right Side Typography & Visuals
try:
    font_mono_sm = ImageFont.truetype('/System/Library/Fonts/SFNSMono.ttf', 13)
    font_title = ImageFont.truetype('/System/Library/Fonts/HelveticaNeue.ttc', 54, index=0)
    font_sub = ImageFont.truetype('/System/Library/Fonts/HelveticaNeue.ttc', 26, index=0)
    font_desc = ImageFont.truetype('/System/Library/Fonts/HelveticaNeue.ttc', 20, index=0)
    font_pill = ImageFont.truetype('/System/Library/Fonts/HelveticaNeue.ttc', 14, index=0)
except Exception as e:
    print('Font fallback:', e)
    font_mono_sm = font_title = font_sub = font_desc = font_pill = ImageFont.load_default()

tx = 535 # Text block start X

# Pill Tag at top
badge_text = 'SYSTEM INDEX // PRODUCTION MCP & AGENT TOOLS'
t_box = draw.textbbox((0, 0), badge_text, font=font_mono_sm)
bw = t_box[2] - t_box[0] + 32
bh = t_box[3] - t_box[1] + 14
by = 105

draw.rounded_rectangle([tx, by, tx + bw, by + bh], radius=6, 
                       fill=(26, 17, 48, 220), 
                       outline=(192, 132, 252, 140), width=1)
draw.ellipse([tx + 12, by + bh/2 - 3, tx + 18, by + bh/2 + 3], fill=(168, 85, 247, 255))
draw.text((tx + 26, by + 6), badge_text, font=font_mono_sm, fill=(216, 180, 254, 255))

# Main Title: Agent Skills Hub
ty = by + bh + 24
draw.text((tx, ty), 'Agent Skills Hub', font=font_title, fill=(255, 255, 255, 255))

# Subtitle: The AI Agent Skills Index
sub_y = ty + 68
draw.text((tx, sub_y), 'The AI Agent Skills Index', font=font_sub, fill=(192, 132, 252, 255))

# Sleek Bi-color Gradient Divider
div_y = sub_y + 45
div_len = 570
for i in range(div_len):
    pct = i / div_len
    if pct < 0.35:
        t = pct / 0.35
        r = int(168 * (1-t) + 232 * t)
        g = int(85 * (1-t) + 121 * t)
        b = int(247 * (1-t) + 249 * t)
        a = int(240 * min(1, pct * 4))
    elif pct < 0.7:
        t = (pct - 0.35) / 0.35
        r = int(232 * (1-t) + 245 * t)
        g = int(121 * (1-t) + 158 * t)
        b = int(249 * (1-t) + 11 * t)
        a = 240
    else:
        t = (pct - 0.7) / 0.3
        r, g, b = 245, 158, 11
        a = int(240 * (1 - t)**1.5)
    draw.line([(tx + i, div_y), (tx + i, div_y + 1)], fill=(r, g, b, a))

# Description (clean, crisp, slate-300)
desc_y = div_y + 26
line1 = 'Automated discovery, scoring, and compatibility for'
line2 = 'MCP servers, Claude skills & agent tools.'
draw.text((tx, desc_y), line1, font=font_desc, fill=(148, 163, 184, 255))
draw.text((tx, desc_y + 30), line2, font=font_desc, fill=(148, 163, 184, 255))

# Bottom Feature Pills: Updated badge from 205055.xyz to by postsoma-2050
badge_y = desc_y + 88
pills = [
    ('91,000+ INDEXED', (245, 158, 11), 'lightning'),
    ('AUTO COMPATIBILITY', (168, 85, 247), 'shield'),
    ('by postsoma-2050', (56, 189, 248), 'author')
]

bx = tx
for label, col, icon_type in pills:
    t_box = draw.textbbox((0, 0), label, font=font_pill)
    pw = t_box[2] - t_box[0] + 50
    ph = t_box[3] - t_box[1] + 16
    
    draw.rounded_rectangle([bx, badge_y, bx + pw, badge_y + ph], radius=8,
                           fill=(17, 19, 32, 230),
                           outline=(col[0], col[1], col[2], 130), width=1)
    
    ix = bx + 16
    iy = badge_y + ph/2
    if icon_type == 'lightning':
        pts = [(ix + 2, iy - 6), (ix - 3, iy), (ix + 1, iy), (ix - 2, iy + 6), (ix + 4, iy - 1), (ix, iy - 1)]
        draw.polygon(pts, fill=col)
    elif icon_type == 'shield':
        pts = [(ix - 4, iy - 5), (ix + 4, iy - 5), (ix + 4, iy), (ix, iy + 6), (ix - 4, iy)]
        draw.polygon(pts, fill=col)
    elif icon_type == 'author':
        # Clean user/author icon
        draw.ellipse([ix - 3, iy - 6, ix + 3, iy], fill=col)
        pts = [(ix - 5, iy + 6), (ix - 4, iy + 2), (ix + 4, iy + 2), (ix + 5, iy + 6)]
        draw.polygon(pts, fill=col)
    
    draw.text((bx + 30, badge_y + 8), label, font=font_pill, fill=(241, 245, 249, 255))
    bx += pw + 12

# Corner Technical Reticles
def draw_corner(cx, cy, dx, dy):
    L = 20
    draw.line([(cx, cy), (cx + dx * L, cy)], fill=(90, 100, 130, 140), width=1)
    draw.line([(cx, cy), (cx, cy + dy * L)], fill=(90, 100, 130, 140), width=1)

draw_corner(50, 45, 1, 1)
draw_corner(W - 50, 45, -1, 1)
draw_corner(50, H - 45, 1, -1)
draw_corner(W - 50, H - 45, -1, -1)

draw.text((50, H - 36), 'INDEX SYSTEM // postsoma-2050 · MIT OPEN-SOURCE', font=font_mono_sm, fill=(71, 85, 105, 150))
draw.text((W - 240, H - 36), 'LATENCY 12ms · STATUS NORMAL', font=font_mono_sm, fill=(71, 85, 105, 150))

# Save
dest_public = os.path.join(PUBLIC_DIR, 'og-image.png')
base.save(dest_public)
print(f'✅ Successfully saved to {dest_public}')

if os.path.isdir(DIST_DIR):
    dest_dist = os.path.join(DIST_DIR, 'og-image.png')
    base.save(dest_dist)
    print(f'✅ Successfully saved to {dest_dist}')
