import hashlib
import json
import math
import os
import shutil
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

ROOT = Path(r"c:\Users\conta\Documents\AntiGravity-Data\AtlasHub.SI-WebSite")
OUT_V2 = ROOT / "public" / "v2"
OUT_SCENES = OUT_V2 / "scenes"
OUT_MASCOTS = OUT_V2 / "mascots"
OUT_SCENES.mkdir(parents=True, exist_ok=True)
OUT_MASCOTS.mkdir(parents=True, exist_ok=True)

PACK_TEAM = Path(r"C:\Users\conta\Documents\AtlasHub_PackVisual_GLOBAL\PackVisual_AtlasHub\Team_AtlasHub")
PACK_CLARA = Path(r"C:\Users\conta\Documents\AtlasHub_PackVisual_GLOBAL\PackVisual_AtlasHub")
STUDIO_DIANA = Path(r"c:\Users\conta\Documents\AntiGravity-Data\Atlas_Studio_Media\01_AtlasHub\05_Arquivo\Avatar_Diana_GWD\Avatar_Diana (10).png")
GWD_MEDIA = Path(r"C:\Users\conta\Documents\GWD_GENESIS\atlas-si-website-v2\public\media\atlas-si\v2")
MASCOTS_SRC = Path(r"C:\Users\conta\Documents\GWD_GENESIS\atlas-si-website-v2\_reference\03_WEB_OPTIMIZED")

records = []


def sha256_file(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def save_webp(img: Image.Image, dest: Path, size=None, quality=86):
    im = img.copy()
    if size:
        im = im.resize(size, Image.Resampling.LANCZOS)
    im.save(dest, format="WEBP", quality=quality, method=6)
    records.append({
        "path": str(dest.relative_to(ROOT)).replace("\\", "/"),
        "width": im.width,
        "height": im.height,
        "bytes": dest.stat().st_size,
        "sha256": sha256_file(dest),
    })


def fit_cover(img: Image.Image, w: int, h: int) -> Image.Image:
    src_ratio = img.width / img.height
    dst_ratio = w / h
    if src_ratio > dst_ratio:
        new_w = int(img.height * dst_ratio)
        left = (img.width - new_w) // 2
        img = img.crop((left, 0, left + new_w, img.height))
    else:
        new_h = int(img.width / dst_ratio)
        top = max(0, (img.height - new_h) // 3)
        img = img.crop((0, top, img.width, top + new_h))
    return img.resize((w, h), Image.Resampling.LANCZOS)


# 1. Hero Earth & Cosmos
earth = Image.open(GWD_MEDIA / "earth.webp").convert("RGBA")
save_webp(earth, OUT_SCENES / "hero-earth.webp", quality=88)

cosmos = Image.open(GWD_MEDIA / "cosmos.webp").convert("RGB")
save_webp(fit_cover(cosmos, 1440, 810), OUT_SCENES / "hero-cosmos.webp", quality=84)

# 2. Portal 01 — AtlasHQ (Dark architectural studio + subtle cyan/graphite grade)
hq_src = Image.open(PACK_TEAM / "Atlas_Office_Real.png").convert("RGB")
hq = fit_cover(hq_src, 1200, 675)
arr = np.asarray(hq, dtype=np.float32)
# Cool mineral graphite tint while preserving warm interior task lights
arr[..., 0] *= 0.88
arr[..., 1] *= 0.96
arr[..., 2] = np.clip(arr[..., 2] * 1.04 + 4.0, 0, 255)
hq_graded = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
hq_graded = ImageEnhance.Contrast(hq_graded).enhance(1.08)
save_webp(hq_graded, OUT_SCENES / "portal-atlashq.webp", quality=86)
save_webp(hq_graded, OUT_SCENES / "portal-atlashq-640.webp", size=(640, 360), quality=82)

# 3. Portal 02 — AtlasBot Stage Backdrop (Deep midnight-indigo + cyan/violet bokeh glow rings)
W, H = 1200, 675
bot_base = fit_cover(cosmos, W, H).convert("RGBA")
# Perspective studio floor + volumetric glow rings
overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
od = ImageDraw.Draw(overlay)
# Horizon floor gradient
for y in range(410, H):
    t = (y - 410) / (H - 410)
    alpha = int(175 * t)
    od.line([(0, y), (W, y)], fill=(8, 18, 38, alpha))
# Soft glowing floor ellipses & volumetric rings
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
gd.ellipse([240, 120, 960, 580], fill=(19, 119, 223, 55))
gd.ellipse([370, 220, 830, 520], fill=(54, 189, 208, 65))
gd.ellipse([160, 80, 600, 400], fill=(139, 92, 246, 38))
gd.ellipse([640, 140, 1080, 480], fill=(34, 211, 238, 42))
# Bokeh lights
rng = np.random.default_rng(42)
for _ in range(34):
    bx = int(rng.integers(40, W - 40))
    by = int(rng.integers(40, 440))
    br = int(rng.integers(10, 44))
    col = [(54, 189, 208, 42), (129, 140, 248, 36), (205, 166, 108, 30)][int(rng.integers(0, 3))]
    gd.ellipse([bx - br, by - br, bx + br, by + br], fill=col)
glow = glow.filter(ImageFilter.GaussianBlur(28))
bot_stage = Image.alpha_composite(bot_base, glow)
bot_stage = Image.alpha_composite(bot_stage, overlay)
# Crisp subtle neon floor ring
ring = Image.new("RGBA", (W, H), (0, 0, 0, 0))
rd = ImageDraw.Draw(ring)
rd.ellipse([280, 435, 920, 610], outline=(54, 189, 208, 110), width=3)
rd.ellipse([340, 455, 860, 595], outline=(129, 140, 248, 80), width=2)
ring = ring.filter(ImageFilter.GaussianBlur(2))
bot_stage = Image.alpha_composite(bot_stage, ring).convert("RGB")
save_webp(bot_stage, OUT_SCENES / "portal-atlasbot-bg.webp", quality=86)
save_webp(bot_stage, OUT_SCENES / "portal-atlasbot-bg-640.webp", size=(640, 360), quality=82)

# Copy approved AtlasBot DEV mascots
for mfile in sorted(MASCOTS_SRC.glob("*.webp")):
    shutil.copy2(mfile, OUT_MASCOTS / mfile.name)
    im_m = Image.open(OUT_MASCOTS / mfile.name)
    records.append({
        "path": f"public/v2/mascots/{mfile.name}",
        "width": im_m.width,
        "height": im_m.height,
        "bytes": (OUT_MASCOTS / mfile.name).stat().st_size,
        "sha256": sha256_file(OUT_MASCOTS / mfile.name),
    })

# 4. Portal 03 — Club Atlas (Warm golden-hour library/studio grade)
club_src = Image.open(PACK_TEAM / "Team_Atlas_Reuniao.png").convert("RGB")
club = fit_cover(club_src, W, H)
ca = np.asarray(club, dtype=np.float32)
# Warm sunlit golden-hour amber-honey color lift
ca[..., 0] = np.clip(ca[..., 0] * 1.12 + 12.0, 0, 255)
ca[..., 1] = np.clip(ca[..., 1] * 1.03 + 4.0, 0, 255)
ca[..., 2] = np.clip(ca[..., 2] * 0.84, 0, 255)
club_warm = Image.fromarray(ca.astype(np.uint8)).convert("RGBA")
sunflare = Image.new("RGBA", (W, H), (0, 0, 0, 0))
sd = ImageDraw.Draw(sunflare)
sd.ellipse([700, -120, 1280, 360], fill=(245, 185, 85, 72))
sd.ellipse([180, 140, 620, 480], fill=(205, 166, 108, 32))
sunflare = sunflare.filter(ImageFilter.GaussianBlur(55))
club_final = Image.alpha_composite(club_warm, sunflare).convert("RGB")
save_webp(club_final, OUT_SCENES / "portal-clubatlas.webp", quality=86)
save_webp(club_final, OUT_SCENES / "portal-clubatlas-640.webp", size=(640, 360), quality=82)

laura_src = Image.open(PACK_TEAM / "Perfil_Laura_Escritorio.png").convert("RGB")
laura_warm = fit_cover(laura_src, 960, 540)
la = np.asarray(laura_warm, dtype=np.float32)
la[..., 0] = np.clip(la[..., 0] * 1.08 + 8.0, 0, 255)
la[..., 2] = np.clip(la[..., 2] * 0.88, 0, 255)
save_webp(Image.fromarray(la.astype(np.uint8)), OUT_SCENES / "club-learner.webp", quality=84)

# 5. Portal 04 — AtlasCortex (Procedural 3D Spiral Knowledge Galaxy Poster)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
cx, cy = W * 0.5, H * 0.48
dx = (xx - cx) / (W * 0.42)
dy = (yy - cy) / (H * 0.34)
r = np.sqrt(dx * dx + dy * dy) + 1e-5
theta = np.arctan2(dy, dx)

# Base deep obsidian cosmos
canvas = np.zeros((H, W, 3), dtype=np.float32)
canvas[..., 0] = 6.0
canvas[..., 1] = 12.0
canvas[..., 2] = 20.0

# Spiral galaxy nebula arms
spiral = np.cos(2.0 * theta - 6.2 * np.log(r + 0.14)) * 0.5 + 0.5
spiral2 = np.cos(3.0 * theta - 4.5 * np.log(r + 0.18) + 1.1) * 0.5 + 0.5
falloff = np.exp(-r * 2.1)
core_glow = np.exp(-(r ** 2) * 14.0)

# Petrol teal + cyan + cosmic violet arms
canvas[..., 0] += (spiral * 110.0 + spiral2 * 60.0) * falloff + core_glow * 140.0
canvas[..., 1] += (spiral * 135.0 + spiral2 * 95.0) * falloff + core_glow * 205.0
canvas[..., 2] += (spiral * 215.0 + spiral2 * 165.0) * falloff + core_glow * 240.0

# Outer violet halo ring
outer_ring = np.exp(-((r - 0.68) ** 2) * 18.0)
canvas[..., 0] += outer_ring * 75.0
canvas[..., 1] += outer_ring * 42.0
canvas[..., 2] += outer_ring * 135.0

cortex_img = Image.fromarray(np.clip(canvas, 0, 255).astype(np.uint8)).convert("RGBA")
c_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
cd = ImageDraw.Draw(c_layer)

# Subtle perspective orbital rings
for rx, ry, col in [
    (440, 170, (54, 189, 208, 45)),
    (320, 120, (167, 139, 250, 55)),
    (200, 75, (45, 212, 191, 65)),
]:
    cd.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], outline=col, width=2)

# Generate luminous knowledge nodes + synaptic filaments
rng_c = np.random.default_rng(108)
nodes = []
for i in range(42):
    ang = i * 0.58 + float(rng_c.uniform(-0.18, 0.18))
    rad = 65 + (i / 42.0) * 390
    nx = int(cx + math.cos(ang) * rad * 1.15)
    ny = int(cy + math.sin(ang) * rad * 0.44)
    if 60 < nx < W - 60 and 50 < ny < H - 50:
        nodes.append((nx, ny, i % 3))

# Synaptic filaments
for idx, (x1, y1, _) in enumerate(nodes):
    for j in range(idx + 1, min(idx + 5, len(nodes))):
        x2, y2, _ = nodes[j]
        dist = math.hypot(x2 - x1, y2 - y1)
        if dist < 240:
            cd.line([(x1, y1), (x2, y2)], fill=(95, 215, 235, 62), width=1)
    # Connect selective nodes to core
    if idx % 3 == 0:
        cd.line([(x1, y1), (int(cx), int(cy))], fill=(167, 139, 250, 48), width=1)

# Background stars
for _ in range(180):
    sx = int(rng_c.integers(10, W - 10))
    sy = int(rng_c.integers(10, H - 10))
    sa = int(rng_c.integers(60, 210))
    cd.ellipse([sx - 1, sy - 1, sx + 1, sy + 1], fill=(225, 245, 255, sa))

# Draw crisp glass node markers & crystal halos
node_glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ngd = ImageDraw.Draw(node_glow)
palette_nodes = [(54, 189, 208), (167, 139, 250), (45, 212, 191)]
for nx, ny, kind in nodes:
    r_col = palette_nodes[kind]
    ngd.ellipse([nx - 14, ny - 14, nx + 14, ny + 14], fill=(*r_col, 95))
    cd.ellipse([nx - 4, ny - 4, nx + 4, ny + 4], fill=(240, 252, 255, 235))
    # Tiny translucent doc prism card on major hubs
    if (nx + ny) % 5 == 0:
        cd.rounded_rectangle([nx - 18, ny - 26, nx + 18, ny + 10], radius=5, fill=(14, 24, 38, 165), outline=(*r_col, 190), width=1)
        cd.line([(nx - 10, ny - 15), (nx + 10, ny - 15)], fill=(220, 240, 250, 175), width=2)
        cd.line([(nx - 10, ny - 8), (nx + 6, ny - 8)], fill=(*r_col, 160), width=2)

node_glow = node_glow.filter(ImageFilter.GaussianBlur(7))
cortex_img = Image.alpha_composite(cortex_img, node_glow)
cortex_img = Image.alpha_composite(cortex_img, c_layer).convert("RGB")
save_webp(cortex_img, OUT_SCENES / "portal-atlascortex.webp", quality=88)
save_webp(cortex_img, OUT_SCENES / "portal-atlascortex-640.webp", size=(640, 360), quality=84)

# 6. Portal 05 — GWD (Champagne gold & cosmic navy architectural waterfront horizon)
HORIZON_Y = 435
gwd = np.zeros((H, W, 3), dtype=np.float32)
# Sky vertical gradient: deep midnight navy to warm champagne horizon
sky_t = np.clip(yy / HORIZON_Y, 0.0, 1.0)
gwd[..., 0] = 8.0 + (sky_t ** 2.6) * 145.0
gwd[..., 1] = 16.0 + (sky_t ** 2.4) * 108.0
gwd[..., 2] = 34.0 + (sky_t ** 1.5) * 42.0

# Water gradient below horizon
water_mask = yy >= HORIZON_Y
wt = np.clip((yy - HORIZON_Y) / (H - HORIZON_Y), 0.0, 1.0)
gwd[water_mask, 0] = 65.0 * (1.0 - wt[water_mask]) + 8.0
gwd[water_mask, 1] = 54.0 * (1.0 - wt[water_mask]) + 15.0
gwd[water_mask, 2] = 44.0 * (1.0 - wt[water_mask]) + 28.0

gwd_img = Image.fromarray(np.clip(gwd, 0, 255).astype(np.uint8)).convert("RGBA")

# Blend glowing Earth sphere rising gently behind skyline
earth_bg = earth.resize((780, 439), Image.Resampling.LANCZOS)
earth_bg_arr = np.asarray(earth_bg, dtype=np.float32)
earth_bg_arr[..., 3] *= 0.42
earth_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
earth_layer.paste(Image.fromarray(earth_bg_arr.astype(np.uint8)), (210, 65))
# Mask Earth below horizon
earth_mask = Image.new("L", (W, H), 255)
emd = ImageDraw.Draw(earth_mask)
emd.rectangle([0, HORIZON_Y, W, H], fill=0)
earth_layer.putalpha(Image.composite(earth_layer.getchannel("A"), Image.new("L", (W, H), 0), earth_mask))
gwd_img = Image.alpha_composite(gwd_img, earth_layer)

# Warm golden sun flare at horizon center-right
g_glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ggd = ImageDraw.Draw(g_glow)
ggd.ellipse([420, 280, 780, 520], fill=(229, 194, 135, 110))
ggd.ellipse([240, 385, 960, 485], fill=(205, 166, 108, 70))
g_glow = g_glow.filter(ImageFilter.GaussianBlur(36))
gwd_img = Image.alpha_composite(gwd_img, g_glow)

# Architectural skyline & circular futuristic pavilion silhouettes
arch = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ad = ImageDraw.Draw(arch)
towers = [
    (180, 320, 235), (248, 285, 290), (312, 345, 355),
    (560, 195, 608), (618, 240, 662), (674, 275, 725),
    (835, 295, 882), (898, 250, 945), (962, 315, 1015),
]
for x0, top, x1 in towers:
    ad.rectangle([x0, top, x1, HORIZON_Y], fill=(12, 20, 34, 240), outline=(205, 166, 108, 120), width=1)
    # Warm architectural window strips
    for wy in range(top + 14, HORIZON_Y - 12, 14):
        if (wy + x0) % 28 == 0:
            ad.line([(x0 + 5, wy), (x1 - 5, wy)], fill=(235, 200, 138, 135), width=2)

# Signature circular ring campus (echoing maquete GWD pavilion)
ad.ellipse([365, 360, 835, 455], fill=(16, 26, 42, 235), outline=(229, 194, 135, 210), width=3)
ad.ellipse([415, 378, 785, 444], fill=(10, 17, 29, 250), outline=(54, 189, 208, 135), width=2)

# Water mirror reflections (golden vertical shimmer streaks)
rng_g = np.random.default_rng(77)
for rx in range(160, 1040, 14):
    ry_len = int(rng_g.integers(25, 155))
    col = (229, 194, 135, int(rng_g.integers(28, 85))) if rx % 28 == 0 else (90, 165, 220, int(rng_g.integers(18, 52)))
    ad.line([(rx, HORIZON_Y + 4), (rx, min(H - 5, HORIZON_Y + ry_len))], fill=col, width=2)
# Subtle horizontal wave ripples across water
for wy in range(HORIZON_Y + 8, H - 10, 9):
    ad.line([(80, wy), (W - 80, wy)], fill=(12, 20, 34, 65), width=1)

gwd_final = Image.alpha_composite(gwd_img, arch).convert("RGB")
save_webp(gwd_final, OUT_SCENES / "portal-gwd.webp", quality=88)
save_webp(gwd_final, OUT_SCENES / "portal-gwd-640.webp", size=(640, 360), quality=84)

# 7. Clara & Diana portraits
clara_av = Image.open(PACK_CLARA / "Perfil_Clara.png").convert("RGB")
save_webp(fit_cover(clara_av, 256, 256), OUT_V2 / "clara-avatar.webp", quality=88)

clara_port = Image.open(PACK_CLARA / "Clara_Recepçao.png").convert("RGB")
w_p = 640
h_p = int(clara_port.height * (w_p / clara_port.width))
save_webp(clara_port, OUT_V2 / "clara-portrait.webp", size=(w_p, h_p), quality=86)

diana_src = Image.open(STUDIO_DIANA).convert("RGB")
save_webp(fit_cover(diana_src, 360, 460), OUT_V2 / "diana-avatar.webp", quality=88)

catalog_json = ROOT / "public" / "v2" / "asset-manifest.json"
catalog_json.write_text(json.dumps(records, indent=2), encoding="utf-8")
print(f"Generated {len(records)} assets cleanly into {OUT_V2}")
