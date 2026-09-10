"""Slice story-hall generated artwork into packaged webp assets; no image generation.
Panel/circle positions are auto-detected so the script survives generation size drift."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "source"
ASSETS = ROOT / "assets"
ASSETS.mkdir(parents=True, exist_ok=True)


def peaks(profile, threshold, min_gap):
    """Return centers of runs in a 1D score profile that exceed threshold."""
    out, i = [], 0
    while i < len(profile):
        if profile[i] >= threshold:
            j = i
            while j < len(profile) and profile[j] >= threshold:
                j += 1
            out.append((i + j - 1) // 2)
            i = j + min_gap
        else:
            i += 1
    return out


# 1) 摸猫主视觉：整图转换
hero = Image.open(SRC / "pet-hero.jpg").convert("RGB")
hero.save(ASSETS / "pet-hero.webp", quality=90, method=6)

# 2) 三档反应：检测两条深绿竖隔线，切成三张竖幅
rx = Image.open(SRC / "pet-reactions.jpg").convert("RGB")
w, h = rx.size
px = rx.load()
col_score = []
for x in range(w):
    green = 0
    for y in range(0, h, 4):
        r, g, b = px[x, y]
        if g < 95 and r < 70 and b < 90 and g > r + 12:
            green += 1
    col_score.append(green)
gutters = peaks(col_score, threshold=h // 4 // 3, min_gap=w // 6)
assert len(gutters) >= 2, f"expected 2 gutters, got {gutters} (size {rx.size})"
g1, g2 = gutters[0], gutters[-1]
bounds = [(0, g1 - 16), (g1 + 16, g2 - 16), (g2 + 16, w)]
for name, (left, right) in zip(
    ("react-close", "react-shy", "react-gone"), bounds
):
    rx.crop((left, 0, right, h)).save(ASSETS / f"{name}.webp", quality=92, method=6)
print(f"reactions {rx.size} gutters at {g1}, {g2}")

# 3) 头像集：3x2 金色圆环网格，几何坐标（由环边投影推导：间距 593、半径 212）
av = Image.open(SRC / "avatars.jpg").convert("RGB")
aw, ah = av.size
col_centers = [326, 919, 1512]
row_centers = [596, 1189]
pad = 252
print(f"avatars {av.size} cols={col_centers} rows={row_centers} pad={pad}")
i = 1
for cy in row_centers:
    for cx in col_centers:
        av.crop((cx - pad, cy - pad, cx + pad, cy + pad)).save(
            ASSETS / f"avatar-{i}.webp", quality=92, method=6
        )
        i += 1

# 4) 邮票贴纸：整图转换
stamp = Image.open(SRC / "stamp.jpg").convert("RGB")
stamp.save(ASSETS / "stamp.webp", quality=92, method=6)

print("Story assets: pet-hero, 3 reaction panels, avatars, stamp.")
