"""Slice story-hall generated artwork into packaged webp assets; no image generation."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "source"
ASSETS = ROOT / "assets"
ASSETS.mkdir(parents=True, exist_ok=True)


# 1) 摸猫主视觉：整图转换
hero = Image.open(SRC / "pet-hero.jpg").convert("RGB")
hero.save(ASSETS / "pet-hero.webp", quality=90, method=6)

# 2) 摸到瞬间：7 组花色反应插画（v1.5 起按花色分组，整图缩放转换；
#    不再是按性格切三档的拼图）
REACT_W = 750
for stem in ("orange", "golden", "silver", "cow", "tabby", "calico", "white"):
    im = Image.open(SRC / f"react-{stem}.jpg").convert("RGB")
    w, h = im.size
    im = im.resize((REACT_W, round(h * REACT_W / w)), Image.LANCZOS)
    im.save(ASSETS / f"react-{stem}.webp", quality=80, method=6)
print("reactions: 7 coat illustrations (orange/golden/silver/cow/tabby/calico/white)")

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

print("Story assets: pet-hero, 7 coat reactions, avatars, stamp.")
