"""Report where the head sits on each Lily frame, so ears can follow it."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1] / "assets" / "lily"
frames = sorted(p for p in root.rglob("frame_*.png") if "_ear-preview" not in p.parts)

def crown(im: Image.Image):
    im = im.convert("RGBA")
    w, h = im.size
    pix = im.load()
    tops = []
    for y in range(h):
        for x in range(w):
            r, g, b, a = pix[x, y]
            if a < 16:
                continue
            # hair-like: blue leads, or very dark outline
            if max(r, g, b) < 48 or (b + 6 >= r and b + 6 >= g and b >= 40):
                tops.append((y, x))
        if len(tops) > 8:
            break
    if not tops:
        return None
    y0 = tops[0][0]
    xs = [x for y, x in tops if y <= y0 + 1]
    return w, h, y0, sum(xs) / len(xs)

rows = []
for p in frames:
    im = Image.open(p)
    c = crown(im)
    rel = p.relative_to(root).as_posix()
    if c is None:
        rows.append((rel, im.size, None))
    else:
        rows.append((rel, (c[0], c[1]), (c[2], round(c[3], 1))))

ys = [r[2][0] for r in rows if r[2]]
xs = [r[2][1] for r in rows if r[2]]
print(f"frames {len(rows)} crownY {min(ys)}..{max(ys)} crownX {min(xs):.1f}..{max(xs):.1f}")
odd = [r for r in rows if r[2] and (r[2][0] < 4 or r[2][0] > 14 or abs(r[2][1] - 64) > 8)]
print(f"odd {len(odd)}")
for rel, size, c in odd[:40]:
    print(f"  {rel} {size} {c}")
sizes = {}
for rel, size, c in rows:
    sizes[size] = sizes.get(size, 0) + 1
print("sizes", sizes)
