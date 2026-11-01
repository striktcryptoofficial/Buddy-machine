import re
from pathlib import Path

root = Path("Game engine/assets/lily")
text = Path("Game engine/mechanics/lilyCatalog.ts").read_text(encoding="utf-8")
frames = re.findall(r'"([^"]+\.png)"', text)
missing = [f for f in frames if not (root / f).exists()]
print("png refs", len(frames), "missing", len(missing))
for m in missing[:40]:
    print(" MISSING", m)
gifs = re.findall(r'"([^"]+\.gif)"', text)
mg = [f for f in gifs if not (root / f).exists()]
print("gif refs", len(gifs), "missing", len(mg))
for m in mg[:20]:
    print(" MISSING", m)

# orphan frame folders not in catalog
catalog = set(frames)
orphans = []
for p in root.rglob("*.png"):
    rel = p.relative_to(root).as_posix()
    if rel not in catalog:
        orphans.append(rel)
print("orphan pngs", len(orphans))
for o in orphans[:40]:
    print(" ORPHAN", o)
