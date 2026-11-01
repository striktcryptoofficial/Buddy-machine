from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

root = Path("Game engine/assets/lily")
out = Path("_sheet_preview")

clips = [
    "Idle/Crossed-Arms/idle-1_frames",
    "Idle/Crossed-Arms/idle-2_frames",
    "Idle/Crossed-Arms/idle-3_frames",
    "Idle/Crossed-Arms/idle-4_frames",
    "Idle/Uncrossed-Arms/idle-1_frames",
    "Idle/Uncrossed-Arms/idle-2_frames",
    "Tired/sleepy_frames",
    "Tired/yawn_frames",
    "Tired/sleepy-rubbing-eyes_frames",
    "Talk/talk-calm_frames",
    "Talk/talk-calm-2_frames",
    "Talk/talk-annoyed_frames",
    "Talk/talk-annoyed-2_frames",
    "Talk/talk-wave_frames",
    "Eat/eat-cookie_frames",
    "Eat/eat-onigiri_frames",
    "Transitions/transition-unfolding-arms_frames",
    "Transitions/transition-crossing-arms_frames",
    "Transitions/transition-neutral-to-crossing-arms_frames",
    "Angry/fists_frames",
    "Angry/fists-clenched_frames",
    "Disapprove/shake-head_frames",
    "Disapprove/disapprove-head-shake_frames",
    "Disapprove/disapprove-tsk_frames",
    "Happy/cheer_frames",
    "Idea/finger-up_frames",
    "Cry/crying-two-hands_frames",
    "Cry/crying_frames",
    "Cry/crying-wipe_frames",
    "Wink/wink_frames",
    "Static/static_frames",
    "Waving/waving-shy_frames",
    "Waving/waving-neutral_frames",
    "Nod/nod-firm_frames",
    "Threaten/threaten_frames",
    "Fish-Face/fish-face-pout_frames",
    "Blush/blush_frames",
    "Blush/blush-shy_frames",
]

scale = 2
cell = 128 * scale
label_h = 16
cols = 4
chunk = 8
for start in range(0, len(clips), chunk):
    part = clips[start:start + chunk]
    sheet = Image.new("RGBA", (cell * cols, (cell + label_h) * len(part)), (16, 16, 20, 255))
    draw = ImageDraw.Draw(sheet)
    for r, rel in enumerate(part):
        folder = root / rel
        frames = sorted(folder.glob("frame_*.png"))
        draw.text((4, r * (cell + label_h) + 1), rel, fill=(230, 220, 200, 255))
        for c, frame in enumerate(frames[:4]):
            im = Image.open(frame).convert("RGBA").resize((cell, cell), Image.NEAREST)
            sheet.paste(im, (c * cell, r * (cell + label_h) + label_h), im)
    path = out / f"lily_poses_{start // chunk}.png"
    sheet.save(path)
    print("saved", path, sheet.size)
