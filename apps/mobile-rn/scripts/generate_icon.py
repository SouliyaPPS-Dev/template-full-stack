#!/usr/bin/env python3
"""Generate Android launcher icons from the store logo in the live settings API.

Usage:
  python3 scripts/generate_icon.py [api_base]

Fetches `store_logo` from `GET {api_base}/settings`, then regenerates the
legacy mipmap launcher icons, adaptive icon foregrounds, and splash logo inside
apps/mobile-rn/android. If no logo is set, the existing icons are left untouched.
"""

import base64
import io
import json
import os
import re
import sys
import urllib.request

from PIL import Image, ImageOps

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MOBILE_DIR = os.path.dirname(SCRIPT_DIR)
RES_DIR = os.path.join(MOBILE_DIR, "android", "app", "src", "main", "res")

API_BASE = sys.argv[1] if len(sys.argv) > 1 else "https://souliya-template.hf.space/api/v1"
BACKGROUND = (255, 255, 255, 255)

# Legacy launcher icon sizes per density bucket.
LEGACY_SIZES = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}
# Adaptive foreground canvas is 108dp (66dp safe zone) per density.
FOREGROUND_SIZES = {"mdpi": 108, "hdpi": 162, "xhdpi": 216, "xxhdpi": 324, "xxxhdpi": 432}
# Expo splash logo is 288px base per density.
SPLASH_SIZES = {"mdpi": 288, "hdpi": 432, "xhdpi": 576, "xxhdpi": 864, "xxxhdpi": 1152}

LEGACY_PAD_RATIO = 0.12
FOREGROUND_FILL_RATIO = 0.60
SPLASH_PAD_RATIO = 0.15


def fetch_logo() -> bytes | None:
    url = f"{API_BASE}/settings"
    with urllib.request.urlopen(url, timeout=30) as resp:
        settings = json.loads(resp.read().decode("utf-8"))
    raw = next((s.get("value") or "" for s in settings if s.get("key") == "store_logo"), "")
    raw = raw.strip()
    if not raw:
        return None
    if raw.startswith("data:"):
        match = re.match(r"^data:[^;]+;base64,(.*)$", raw, re.S)
        if not match:
            return None
        return base64.b64decode(match.group(1))
    if raw.startswith("http://") or raw.startswith("https://"):
        with urllib.request.urlopen(raw, timeout=30) as resp:
            return resp.read()
    return None


def letterboxed(img: Image.Image, size: int, pad_ratio: float) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), BACKGROUND)
    box = int(size * (1 - 2 * pad_ratio))
    img = img.copy()
    img.thumbnail((box, box), Image.LANCZOS)
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    canvas.paste(img, ((size - img.width) // 2, (size - img.height) // 2), img)
    return canvas.convert("RGB")


def write_icon(img: Image.Image, rel_path: str) -> None:
    path = os.path.join(RES_DIR, rel_path)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, format="PNG")


def write_adaptive_xml() -> None:
    xml = (
        '<?xml version="1.0" encoding="utf-8"?>\n'
        '<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n'
        '  <background android:drawable="@color/ic_launcher_background"/>\n'
        '  <foreground android:drawable="@mipmap/ic_launcher_foreground"/>\n'
        "</adaptive-icon>\n"
    )
    out_dir = os.path.join(RES_DIR, "mipmap-anydpi-v26")
    os.makedirs(out_dir, exist_ok=True)
    for name in ("ic_launcher", "ic_launcher_round"):
        with open(os.path.join(out_dir, f"{name}.xml"), "w", encoding="utf-8") as f:
            f.write(xml)


def ensure_background_color() -> None:
    colors_path = os.path.join(RES_DIR, "values", "colors.xml")
    with open(colors_path, "r", encoding="utf-8") as f:
        content = f.read()
    if "ic_launcher_background" not in content:
        insert = '  <color name="ic_launcher_background">#FFFFFF</color>\n'
        content = content.replace("</resources>", f"{insert}</resources>")
        with open(colors_path, "w", encoding="utf-8") as f:
            f.write(content)


def main() -> int:
    try:
        data = fetch_logo()
    except Exception as exc:  # noqa: BLE001
        print(f"[icon] WARN: could not fetch settings ({exc}); keeping default icons")
        return 0

    if data is None:
        print("[icon] No store_logo set in settings; keeping default icons")
        return 0

    try:
        logo = Image.open(io.BytesIO(data)).convert("RGBA")
        logo = ImageOps.exif_transpose(logo)
    except Exception as exc:  # noqa: BLE001
        print(f"[icon] WARN: could not decode logo ({exc}); keeping default icons")
        return 0

    print(f"[icon] Generating Android icons from store logo ({logo.width}x{logo.height})")

    for density, size in LEGACY_SIZES.items():
        icon = letterboxed(logo, size, LEGACY_PAD_RATIO)
        for name in ("ic_launcher", "ic_launcher_round"):
            webp = os.path.join(RES_DIR, f"mipmap-{density}", f"{name}.webp")
            if os.path.exists(webp):
                os.remove(webp)
            write_icon(icon, f"mipmap-{density}/{name}.png")

    for density, size in FOREGROUND_SIZES.items():
        fg = letterboxed(logo, size, (1 - FOREGROUND_FILL_RATIO) / 2)
        write_icon(fg, f"mipmap-{density}/ic_launcher_foreground.png")

    for density, size in SPLASH_SIZES.items():
        splash = letterboxed(logo, size, SPLASH_PAD_RATIO)
        write_icon(splash, f"drawable-{density}/splashscreen_logo.png")

    write_adaptive_xml()
    ensure_background_color()
    print("[icon] Android icons updated")
    return 0


if __name__ == "__main__":
    sys.exit(main())
