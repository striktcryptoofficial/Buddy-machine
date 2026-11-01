from PIL import Image
from pathlib import Path

root = Path("Game engine/assets/lily")
out = Path("_sheet_preview")
groups = {
    "fists": [
        "Angry/fists/frame_01.png",
        "Angry/fists/frame_02.png",
        "Angry/fists/frame_03.png",
        "Angry/fists/frame_04.png",
    ],
    "fists2": [
        "Angry/fists-clenched_frames/frame_01.png",
        "Angry/fists-clenched_frames/frame_02.png",
        "Angry/fists-clenched_frames/frame_03.png",
        "Angry/fists-clenched_frames/frame_04.png",
    ],
    "idea": [f"Idea/finger-up_frames/frame_0{i}.png" for i in range(1, 5)],
    "shywave": [f"Waving/waving-shy_frames/frame_0{i}.png" for i in range(1, 5)],
    "head": [f"Disapprove/disapprove-head-shake_frames/frame_0{i}.png" for i in range(1, 5)],
    "cheer": [f"Happy/cheer_frames/frame_0{i}.png" for i in range(1, 5)],
    "tsk": [f"Disapprove/disapprove-tsk_frames/frame_0{i}.png" for i in range(1, 5)],
    "static": [f"Static/static_frames/frame_0{i}.png" for i in range(1, 5)],
    "idle3": [f"Idle/Crossed-Arms/idle-3_frames/frame_0{i}.png" for i in range(1, 5)],
    "idle1": [f"Idle/Crossed-Arms/idle-1_frames/frame_0{i}.png" for i in range(1, 5)],
}
for name, frames in groups.items():
    ims = [Image.open(root / f).convert("RGBA").resize((256, 256), Image.NEAREST) for f in frames]
    sheet = Image.new("RGBA", (256 * len(ims), 256), (0, 0, 0, 255))
    for i, im in enumerate(ims):
        sheet.paste(im, (i * 256, 0), im)
    sheet.save(out / f"row_{name}.png")
    print(name, "ok")
