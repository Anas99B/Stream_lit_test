"""Build the approved avatar layers from the untouched source art.

Source (never modified):  brand/avatar-source/{1,2,3,4}.webp
Output (used by Remotion): public/avatar/*.png

Content of the source files, verified by pixel inspection (not by filename):
  1.webp  forward gaze          -> base body (always shown)
  2.webp  eyes closed           -> eye overlay "closed"
  3.webp  gaze toward IMAGE RIGHT -> eye overlay "image-right"
  4.webp  gaze toward IMAGE LEFT  -> eye overlay "image-left"

The four files are independently rendered variants: they are registered
(best body shift 0,0) but body pixels differ slightly (line wobble, texture
noise). Swapping whole images would make the body shimmer at every blink, so
we keep ONE fixed base and swap only feathered elliptical eye patches.

Usage:  python3 -I scripts/prepare_avatar.py [--qa OUT_DIR]
"""

import argparse
import json
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(ROOT, "brand", "avatar-source")
OUT = os.path.join(ROOT, "public", "avatar")

# Crop window applied to every layer (source canvas is 1024x1536; the
# character occupies x 249-749, y 15-1518). Same crop for all layers keeps
# them pixel-registered.
CROP = (232, 0, 768, 1536)  # left, top, right, bottom

# Eye ellipses in SOURCE coordinates: (cx, cy, rx, ry).
EYES = [(454, 194, 31, 25), (532, 191, 31, 25)]
FEATHER_SIGMA = 1.6
# Interior alpha in the WebP sources is 240-254 (lossy alpha). Snap it to 255
# so the body is not ~1-2% see-through. Antialiased edges (<240) are untouched.
ALPHA_SNAP = 240

STATES = {
    "closed": "2.webp",
    "image-right": "3.webp",
    "image-left": "4.webp",
}


def load(name):
    a = np.asarray(Image.open(os.path.join(SRC, name)).convert("RGBA")).astype(np.float32)
    a[..., 3] = np.where(a[..., 3] >= ALPHA_SNAP, 255.0, a[..., 3])
    return a


def eye_mask(shape):
    h, w = shape[:2]
    m = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(m)
    for cx, cy, rx, ry in EYES:
        d.ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=255)
    m = m.filter(ImageFilter.GaussianBlur(FEATHER_SIGMA))
    return np.asarray(m).astype(np.float32) / 255.0


def to_img(a):
    a = a.copy()
    a[a[..., 3] < 0.5] = 0  # no hidden colour under fully transparent pixels
    return Image.fromarray(np.clip(np.round(a), 0, 255).astype(np.uint8), "RGBA")


def premul(a):
    return np.concatenate([a[..., :3] * a[..., 3:4] / 255.0, a[..., 3:4]], axis=-1)


def crop(img):
    return img.crop(CROP)


def over(top, bottom):
    """Straight-alpha 'over' composite of float RGBA arrays (0-255)."""
    ta, ba = top[..., 3:4] / 255.0, bottom[..., 3:4] / 255.0
    oa = ta + ba * (1 - ta)
    rgb = np.where(oa > 0, (top[..., :3] * ta + bottom[..., :3] * ba * (1 - ta)) / np.maximum(oa, 1e-6), 0)
    return np.concatenate([rgb, oa * 255.0], axis=-1)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--qa", help="directory for QA contact sheets")
    args = ap.parse_args()
    os.makedirs(OUT, exist_ok=True)

    base = load("1.webp")
    mask = eye_mask(base.shape)
    crop(to_img(base)).save(os.path.join(OUT, "base.png"), optimize=True)

    report = {"crop": CROP, "eyes": EYES, "feather_sigma": FEATHER_SIGMA, "states": {}}
    composites = {"forward": base}
    for state, fname in STATES.items():
        var = load(fname)
        overlay = var.copy()
        overlay[..., 3] = var[..., 3] * mask
        crop(to_img(overlay)).save(os.path.join(OUT, f"eyes-{state}.png"), optimize=True)
        comp = over(overlay, base)
        composites[state] = comp
        core = mask > 0.98
        outside = mask < 0.002
        report["states"][state] = {
            "source": fname,
            # how faithfully the overlay reproduces the variant's eyes
            "core_max_abs_diff_vs_variant": float(np.abs(premul(comp) - premul(var))[core].max()),
            # must be 0: nothing outside the patch may change
            "outside_max_abs_diff_vs_base": float(np.abs(premul(comp) - premul(base))[outside].max()),
        }

    # Closed state must hide the base eyes completely (no bright eye-white left).
    lum = lambda a: 0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2]
    eye_box = np.zeros(mask.shape, bool)
    eye_box[160:225, 415:575] = True
    report["closed_leftover_white_px"] = int(((lum(composites["closed"]) > 225) & eye_box).sum())
    print(json.dumps(report, indent=2))

    if args.qa:
        os.makedirs(args.qa, exist_ok=True)
        # Eye-band zoom of each composite next to the original variant.
        rows = []
        for state, src in [("forward", "1.webp"), ("closed", "2.webp"), ("image-right", "3.webp"), ("image-left", "4.webp")]:
            box = (395, 140, 595, 240)
            a = to_img(composites[state]).crop(box).resize((600, 300), Image.NEAREST)
            b = to_img(load(src)).crop(box).resize((600, 300), Image.NEAREST)
            row = Image.new("RGBA", (1206, 300), (243, 245, 240, 255))
            row.alpha_composite(a, (0, 0))
            row.alpha_composite(b, (606, 0))
            rows.append(row)
        sheet = Image.new("RGBA", (1206, 306 * 4), (60, 60, 60, 255))
        for i, r in enumerate(rows):
            sheet.alpha_composite(r, (0, i * 306))
        sheet.convert("RGB").save(os.path.join(args.qa, "eyes_composite_vs_source.png"))

        # Full figure of each state on white, warm brand bg, mid gray and dark.
        bgs = [(255, 255, 255), (243, 245, 240), (128, 128, 128), (23, 28, 36)]
        figs = [crop(to_img(composites[s])) for s in ["forward", "closed", "image-right", "image-left"]]
        tw, th = figs[0].size[0] // 2, figs[0].size[1] // 2
        sheet = Image.new("RGB", (tw * 4, th * 4))
        for r, bg in enumerate(bgs):
            for c, f in enumerate(figs):
                tile = Image.new("RGBA", f.size, bg + (255,))
                tile.alpha_composite(f)
                sheet.paste(tile.convert("RGB").resize((tw, th), Image.LANCZOS), (c * tw, r * th))
        sheet.save(os.path.join(args.qa, "states_on_backgrounds.png"))

        # Edge zoom on dark background for halo inspection (hand + shoe).
        f = to_img(composites["forward"])
        for name, box in {"edge_hand": (240, 760, 420, 900), "edge_shoe": (560, 1380, 760, 1530)}.items():
            tile = Image.new("RGBA", f.size, (23, 28, 36, 255))
            tile.alpha_composite(f)
            z = tile.crop(box)
            z.resize((z.size[0] * 4, z.size[1] * 4), Image.NEAREST).convert("RGB").save(os.path.join(args.qa, f"{name}_dark.png"))


if __name__ == "__main__":
    main()
