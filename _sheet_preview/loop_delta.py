from PIL import Image
import numpy as np
from pathlib import Path

root = Path("Game engine/assets/lily")
# catalog frame groups: 4 frames listed consecutively after "frames"
import re
text = Path("Game engine/mechanics/lilyCatalog.ts").read_text(encoding="utf-8")
ids = re.findall(r'"id": "([^"]+)"', text)
blocks = re.findall(r'"frames": \[(.*?)\]', text, re.S)
print("clips", len(ids), "blocks", len(blocks))
rows = []
for cid, block in zip(ids, blocks):
    frames = re.findall(r'"([^"]+)"', block)
    if len(frames) < 2:
        continue
    a = np.array(Image.open(root / frames[0]).convert("RGBA"), dtype=np.int16)
    b = np.array(Image.open(root / frames[-1]).convert("RGBA"), dtype=np.int16)
    # difference on opaque pixels of either
    mask = (a[:, :, 3] > 16) | (b[:, :, 3] > 16)
    if mask.sum() == 0:
        delta = 0
    else:
        delta = np.abs(a - b).mean(axis=2)[mask].mean()
    rows.append((delta, cid, frames[0], frames[-1], a.shape))
rows.sort(reverse=True)
for delta, cid, f0, f1, shape in rows:
    flag = "ONESHOT" if delta > 12 else "loop"
    print(f"{delta:6.1f} {flag:8} {cid}")
