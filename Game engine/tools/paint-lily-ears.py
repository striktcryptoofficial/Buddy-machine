"""Stamp the approved ears onto every 128px Lily frame.

Reads the clean copies in Game engine/lily-plain so running it again
does not stack a second pair. Hands, marks, and food stay in front.
"""
from __future__ import annotations

import math
import shutil
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
LIVE = ROOT / "assets" / "lily"
PLAIN = ROOT / "lily-plain"
CHECK = ROOT / "ear-check"

# The numbers from the adjust page.
LEAN = -45
HOW_LOW = 9
APART = 14
LENGTH = 13
WIDE = 11

OUT = (18, 13, 43, 255)
FUR = (78, 75, 128, 255)
PINK = (236, 168, 186, 255)


def is_hair(r: int, g: int, b: int, a: int) -> bool:
    if a < 16:
        return False
    mx = max(r, g, b)
    mn = min(r, g, b)
    sat = 0 if mx == 0 else (mx - mn) / mx
    if mx < 36:
        return b > r + 8 and b > g + 8
    if sat < 0.18:
        return False
    return b + 6 >= r and b + 6 >= g and b >= 40


def fill_tri(pix, width, height, ax, ay, bx, by, cx, cy, color, allow) -> None:
    min_x = max(0, math.floor(min(ax, bx, cx)))
    max_x = min(width - 1, math.ceil(max(ax, bx, cx)))
    min_y = max(0, math.floor(min(ay, by, cy)))
    max_y = min(height - 1, math.ceil(max(ay, by, cy)))
    for y in range(min_y, max_y + 1):
        for x in range(min_x, max_x + 1):
            px = x + 0.5
            py = y + 0.5
            w0 = (bx - px) * (cy - py) - (cx - px) * (by - py)
            w1 = (cx - px) * (ay - py) - (ax - px) * (cy - py)
            w2 = (ax - px) * (by - py) - (bx - px) * (ay - py)
            inside = (w0 >= 0 and w1 >= 0 and w2 >= 0) or (w0 <= 0 and w1 <= 0 and w2 <= 0)
            if not inside or not allow(x, y):
                continue
            pix[x, y] = color


def ear(pix, width, height, base_x, side, lean, low, length, wide, allow) -> None:
    rad = lean * math.pi / 180
    tip_x = base_x + -side * math.sin(rad) * length
    tip_y = low - math.cos(rad) * length
    dx = tip_x - base_x
    dy = tip_y - low
    span = math.hypot(dx, dy) or 1
    px = -dy / span
    py = dx / span
    half = wide / 2
    outline = wide / 2 + 1.4
    fill_tri(
        pix, width, height,
        tip_x, tip_y,
        base_x + px * outline, low + py * outline,
        base_x - px * outline, low - py * outline,
        OUT, allow,
    )
    fill_tri(
        pix, width, height,
        tip_x, tip_y,
        base_x + px * half, low + py * half,
        base_x - px * half, low - py * half,
        FUR, allow,
    )
    inner_x = tip_x + (base_x - tip_x) * 0.42
    inner_y = tip_y + (low - tip_y) * 0.42
    fill_tri(
        pix, width, height,
        inner_x, inner_y,
        base_x + px * (half * 0.45), low + py * (half * 0.45),
        base_x - px * (half * 0.45), low - py * (half * 0.45),
        PINK, allow,
    )


def paint(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    width, height = im.size
    original = im.copy()
    src = original.load()
    out = im.copy()
    pix = out.load()

    def allow(x: int, y: int) -> bool:
        r, g, b, a = src[x, y]
        return a < 16 or is_hair(r, g, b, a)

    base_y = 8 + HOW_LOW
    ear(pix, width, height, 64 - APART, -1, LEAN, base_y, LENGTH, WIDE, allow)
    ear(pix, width, height, 64 + APART, 1, LEAN, base_y, LENGTH, WIDE, allow)
    return out


def main() -> None:
    frames = sorted(
        p for p in LIVE.rglob("frame_*.png")
        if "_ear-preview" not in p.parts and p.stat().st_size > 0
    )
    painted = 0
    skipped = 0
    for live in frames:
        rel = live.relative_to(LIVE)
        plain = PLAIN / rel
        plain.parent.mkdir(parents=True, exist_ok=True)
        if not plain.exists():
            shutil.copy2(live, plain)
        im = Image.open(plain)
        if im.size != (128, 128):
            skipped += 1
            continue
        paint(im).save(live)
        painted += 1
    print(f"painted {painted} skipped {skipped}")

    CHECK.mkdir(parents=True, exist_ok=True)
    picks = [
        "Idle/Uncrossed-Arms/idle-evil-smirk_frames/frame_04.png",
        "Nod/nod-firm_frames/frame_02.png",
        "Happy/cheer_frames/frame_03.png",
        "Confused/question-mark_frames/frame_02.png",
        "Waving/waving-two-hands_frames/frame_02.png",
        "Tired/sleepy_frames/frame_03.png",
        "Tired/yawn_frames/frame_02.png",
        "Eat/eat-cookie_frames/frame_02.png",
        "Cry/crying_frames/frame_02.png",
        "Facepalm/facepalm_frames/frame_02.png",
        "Flirt/flirt-lean-in_frames/frame_02.png",
        "Wink/wink_frames/frame_02.png",
    ]
    tiles = []
    for rel in picks:
        im = Image.open(LIVE / rel).convert("RGBA")
        tiles.append(im.resize((im.width * 3, im.height * 3), Image.Resampling.NEAREST))
    sheet = Image.new("RGBA", (3 * 128 * 3, 4 * 128 * 3), (0, 0, 0, 255))
    for i, tile in enumerate(tiles):
        sheet.paste(tile, ((i % 3) * 384, (i // 3) * 384))
    sheet.save(CHECK / "sheet.png")

    for name in ("frame_01.png", "frame_02.png", "frame_03.png", "frame_04.png"):
        src = LIVE / "Static" / "static_frames" / name
        if not src.exists():
            continue
        im = Image.open(src).convert("RGBA")
        im.resize((im.width * 8, im.height * 8), Image.Resampling.NEAREST).save(CHECK / f"static-{name}")


if __name__ == "__main__":
    main()
