"""Reproduce the web slices from the generated illustration; no image generation."""
from pathlib import Path
import random
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "source" / "cover-art.png"
ASSETS = ROOT / "assets"
ASSETS.mkdir(parents=True, exist_ok=True)
image = Image.open(SOURCE).convert("RGB")
if image.width != image.height:
    raise ValueError(f"Expected square artwork, received {image.size}")
image = image.resize((1024, 1024), Image.Resampling.LANCZOS)
for name, top, bottom in (
    ("scene-top", 0, 320),
    ("scene-cats", 320, 800),
    ("scene-ground", 800, 1024),
):
    image.crop((0, top, 1024, bottom)).save(
        ASSETS / f"{name}.webp", quality=94, method=6
    )

rng = random.Random(4)
texture = Image.new("RGBA", (160, 160))
texture.putdata([
    (60, 47, 22, rng.randrange(0, 12)) if rng.random() < .48 else (255, 253, 239, rng.randrange(0, 42))
    for _ in range(160 * 160)
])
texture.save(ASSETS / "paper-grain.png", optimize=True)
print("Generated 3 contiguous artwork slices and a paper texture.")
