"""Generate mino-pet animation frames from the Mino mascot icon.

Each clip gets a short loop of mascot frames with a per-clip motion
signature (breathe, wobble, bounce). Deterministic: no external assets.

Usage: python scripts/gen-pet-frames.py
Requires: Pillow. Reads packages/pet/assets/pet-manifest.json.
"""
import io
import json
import math
import os
import shutil

from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..")
PET_DIR = os.path.join(ROOT, "packages", "pet", "assets", "pet")
MANIFEST = os.path.join(ROOT, "packages", "pet", "assets", "pet-manifest.json")
MASCOT = os.path.join(
    ROOT, "..", "mino-agent", "apps", "desktop", "resources", "icon.png"
)

CANVAS = 344
MASCOT_SIZE = 280
FRAMES_PER_CLIP = 8

# Per-clip motion: (amplitude_deg, scale_pct, dy_px, extra)
CLIPS = {
    "idle":              (2, 0.03, 3, "breathe"),
    "idle_stretch":      (4, 0.08, 8, "breathe"),
    "idle_yawn":         (3, 0.05, 5, "breathe"),
    "working":           (6, 0.02, 4, "wobble"),
    "working_command":   (6, 0.02, 4, "wobble"),
    "working_search":    (8, 0.02, 6, "wobble"),
    "thinking":          (1, 0.04, 4, "breathe"),
    "waiting":           (1, 0.02, 2, "breathe"),
    "success":           (0, 0.10, 16, "bounce"),
    "error":             (0, 0.00, 0, "shake"),
    "eat_token":         (10, 0.04, 6, "wobble"),
    "head_pat":          (0, 0.12, 6, "squash"),
    "poke":              (8, 0.00, 0, "shake"),
    "dragging":          (12, 0.00, 0, "wobble"),
    "dragging_release":  (10, 0.06, 8, "bounce"),
    "tail":              (5, 0.03, 4, "wobble"),
}


def frame(mascot, clip, i, n):
    amp, scale_amp, dy_amp, mode = CLIPS[clip]
    t = math.sin(2 * math.pi * i / n)
    angle = amp * t
    scale = 1.0 + scale_amp * t
    dy = int(dy_amp * t)
    dx = 0
    if mode == "shake":
        dx = int(6 * math.sin(4 * math.pi * i / n))
    elif mode == "bounce":
        dy = -int(dy_amp * abs(t))
    elif mode == "squash":
        scale = 1.0 - scale_amp * abs(t)

    size = max(1, int(MASCOT_SIZE * scale))
    m = mascot.resize((size, size), Image.LANCZOS)
    if angle:
        m = m.rotate(angle, resample=Image.BICUBIC, expand=False)
    canvas = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    x = (CANVAS - size) // 2 + dx
    y = (CANVAS - size) // 2 + dy
    canvas.paste(m, (x, y), m)
    return canvas


def main():
    with io.open(MANIFEST, encoding="utf-8") as f:
        manifest = json.load(f)

    mascot = Image.open(MASCOT).convert("RGBA")

    for entry in os.listdir(PET_DIR):
        path = os.path.join(PET_DIR, entry)
        if os.path.isdir(path):
            shutil.rmtree(path)

    for clip in manifest["clips"]:
        out_dir = os.path.join(PET_DIR, clip)
        os.makedirs(out_dir, exist_ok=True)
        frames = []
        for i in range(FRAMES_PER_CLIP):
            name = f"{clip}/{clip}_{i + 1:03d}.webp"
            img = frame(mascot, clip, i, FRAMES_PER_CLIP)
            img.save(
                os.path.join(PET_DIR, name), "WEBP", quality=80, method=4
            )
            frames.append(name)
        manifest["clips"][clip]["frames"] = frames

    manifest["characterId"] = "mino"
    manifest["assetSource"] = {
        "description": "Mino mascot motion frames generated "
        "by scripts/gen-pet-frames.py"
    }

    with io.open(MANIFEST, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
        f.write("\n")

    total = sum(len(c["frames"]) for c in manifest["clips"].values())
    print(f"wrote {total} frames across {len(manifest['clips'])} clips")


if __name__ == "__main__":
    main()
