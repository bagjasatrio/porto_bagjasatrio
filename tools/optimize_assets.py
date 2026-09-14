"""Downscale + palette-quantize the generated artwork into tight pixel-art PNGs.

Source images come out of the image generator at 1024x1024. They need to be:
  1. cropped to the aspect ratio the layout actually uses,
  2. reduced to a genuine low pixel grid so `image-rendering: pixelated` reads as
     8-bit art rather than a blurry downscale,
  3. quantized onto the site's NES-ish palette so file size lands under budget.

Run from the repo root:  python tools/optimize_assets.py
"""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

ASSETS = Path(__file__).resolve().parent.parent / "assets"

# Site palette (light "Famicom Clean Studio" direction) + a few ramp steps so
# gradients in the source art do not band horribly after quantization.
PALETTE_HEX = [
    "#f4f5f0", "#ffffff", "#f0f2ea", "#eaece4", "#e2e6dc",
    "#c9ced6", "#9aa3ae", "#6d7a76", "#4a4f5c", "#2a2a38",
    "#1a1a24", "#12121c", "#000000",
    "#008a7a", "#00b39b", "#65d9c6", "#83f6e2", "#005047",
    "#c2185b", "#e01475", "#ffb1c6", "#8e0047",
    "#b36b00", "#f59e0b", "#fde68a", "#ffddb3", "#7f5300",
    "#1565c0", "#4a90d9", "#bcd8f5",
    "#39ff14", "#ffe0bd", "#e0a370", "#8d5524",
]


def build_palette() -> Image.Image:
    """A PIL palette image from PALETTE_HEX."""
    pal = Image.new("P", (1, 1))
    flat: list[int] = []
    for hx in PALETTE_HEX:
        h = hx.lstrip("#")
        flat.extend(int(h[i : i + 2], 16) for i in (0, 2, 4))
    # PIL palettes are 256*3 long; pad the tail by repeating the last colour.
    flat += flat[-3:] * (256 - len(PALETTE_HEX))
    pal.putpalette(flat)
    return pal


def pixelate(img: Image.Image, cols: int) -> Image.Image:
    """Snap the image onto a coarse `cols`-wide pixel grid, then scale back up.

    Nearest-neighbour in both directions is what gives the crisp blocky edges;
    a BOX/bilinear pass here would reintroduce smoothing.
    """
    w, h = img.size
    rows = max(1, round(cols * h / w))
    small = img.resize((cols, rows), Image.NEAREST)
    return small.resize((w, h), Image.NEAREST)


def process(name: str, *, cols: int = 0, crop: tuple[float, float, float, float] | None = None,
            out_size: tuple[int, int], quantize: bool = True,
            out_name: str | None = None, pixel_art: bool = True) -> tuple[str, int, int]:
    src = ASSETS / name
    if not src.exists():
        raise SystemExit(f"missing source asset: {src}")

    # Defaults to in-place, but a job may write to a separate file so that a raw
    # generator master is never destroyed by a pipeline run.
    dst = ASSETS / (out_name or name)

    img = Image.open(src).convert("RGB")

    if crop:
        w, h = img.size
        box = (int(crop[0] * w), int(crop[1] * h), int(crop[2] * w), int(crop[3] * h))
        img = img.crop(box)

    # Normalise to the target aspect before pixelating so the pixel grid is square.
    tw, th = out_size
    target_ratio = tw / th
    w, h = img.size
    if abs(w / h - target_ratio) > 0.01:
        if w / h > target_ratio:
            new_w = int(h * target_ratio)
            left = (w - new_w) // 2
            img = img.crop((left, 0, left + new_w, h))
        else:
            new_h = int(w / target_ratio)
            top = (h - new_h) // 2
            img = img.crop((0, top, w, top + new_h))

    if pixel_art:
        img = pixelate(img, cols)
        if quantize:
            img = img.quantize(palette=build_palette(), dither=Image.NONE)
        # Final exact resize to the requested dimensions, still nearest-neighbour.
        img = img.resize(out_size, Image.NEAREST)
    else:
        # Photographic source. Snapping to a coarse grid and a reduced palette is
        # exactly what made the profile photo look blurred and blocky, so a real
        # photo is downscaled with a high-quality resampler and keeps its tones.
        img = img.resize(out_size, Image.LANCZOS)
    img.save(dst, "PNG", optimize=True)

    return dst.name, out_size[0], out_size[1], dst.stat().st_size


def main() -> int:
    jobs = [
        # avatar: a real photograph, so it is deliberately NOT pixelated. The raw
        # generator master is read and a smooth 512x512 version is written, which
        # covers the 224px slot at 2x DPR. profile.png stays an untouched source.
        dict(name="profile.png", out_name="avatar.png", out_size=(512, 512), pixel_art=False),
        # project thumbs: 16:9 cards, ~4 columns wide on desktop
        dict(name="project-damkar.png", cols=160, out_size=(640, 360)),
        dict(name="project-discord-ai.png", cols=160, out_size=(640, 360)),
        dict(name="project-microservices.png", cols=160, out_size=(640, 360)),
        dict(name="project-ml-classifier.png", cols=160, out_size=(640, 360)),
        # og preview: 1200x630 social card, no quantization to keep text crisp-ish
        dict(name="og-preview.png", cols=200, out_size=(1200, 630), quantize=False),
    ]

    total = 0
    for job in jobs:
        name, w, h, size = process(**job)
        total += size
        print(f"{name:<28} {w}x{h:<6} {size/1024:7.1f} KB")
    print(f"{'TOTAL':<28} {'':<11} {total/1024:7.1f} KB")
    return 0


if __name__ == "__main__":
    sys.exit(main())

