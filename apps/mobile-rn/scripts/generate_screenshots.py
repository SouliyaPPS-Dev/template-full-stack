#!/usr/bin/env python3
"""Generate App Store screenshots for Template Full Stack."""
import os
from PIL import Image, ImageDraw, ImageFont

OUT_DIR = os.path.join(os.path.dirname(__file__), "builds", "screenshots")
os.makedirs(OUT_DIR, exist_ok=True)

# App Store required sizes
SIZES = {
    "iphone_6_5": (1242, 2688),  # 6.5" iPhone (XS Max / 11 Pro Max)
    "ipad_13":    (2048, 2732),  # 13" iPad Pro
}

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
PRIMARY = (37, 99, 235)       # blue-600
PRIMARY_DARK = (29, 78, 216)  # blue-700
BG_LIGHT = (243, 244, 246)    # gray-100
TEXT_DARK = (17, 24, 39)      # gray-900
TEXT_GRAY = (107, 114, 128)   # gray-500
GREEN = (34, 197, 94)
ORANGE = (249, 115, 22)
RED = (239, 68, 68)
BORDER = (229, 231, 235)

def get_font(size):
    """Try to load a system font, fallback to default."""
    paths = [
        "/System/Library/Fonts/SFPro-Bold.ttf",
        "/System/Library/Fonts/SFProDisplay-Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/SFNS.ttf",
    ]
    for p in paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except:
                pass
    return ImageFont.load_default()

def get_font_regular(size):
    paths = [
        "/System/Library/Fonts/SFPro-Regular.ttf",
        "/System/Library/Fonts/SFProText-Regular.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/SFNS.ttf",
    ]
    for p in paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except:
                pass
    return ImageFont.load_default()

def draw_rounded_rect(draw, xy, radius, fill):
    x0, y0, x1, y1 = xy
    draw.rectangle([x0 + radius, y0, x1 - radius, y1], fill=fill)
    draw.rectangle([x0, y0 + radius, x1, y1 - radius], fill=fill)
    draw.pieslice([x0, y0, x0 + 2*radius, y0 + 2*radius], 180, 270, fill=fill)
    draw.pieslice([x1 - 2*radius, y0, x1, y0 + 2*radius], 270, 360, fill=fill)
    draw.pieslice([x0, y1 - 2*radius, x0 + 2*radius, y1], 90, 180, fill=fill)
    draw.pieslice([x1 - 2*radius, y1 - 2*radius, x1, y1], 0, 90, fill=fill)

def draw_status_bar(draw, w, font_sm):
    """Draw a fake iOS status bar."""
    draw.text((60, 20), "9:41", fill=BLACK, font=font_sm)
    # Signal bars
    for i in range(4):
        x = w - 180 + i * 12
        h = 8 + i * 3
        draw.rectangle([x, 28, x + 8, 28 + h], fill=BLACK)
    # Battery
    draw.rectangle([w - 100, 24, w - 60, 40], outline=BLACK, width=2)
    draw.rectangle([w - 58, 28, w - 54, 36], fill=BLACK)
    draw.rectangle([w - 98, 26, w - 62, 38], fill=GREEN)

def draw_nav_bar(draw, w, title, font_md, bg=PRIMARY):
    draw.rectangle([0, 55, w, 130], fill=bg)
    draw.text((w // 2 - len(title) * 10, 75), title, fill=WHITE, font=font_md)

def draw_tab_bar(draw, w, h, font_xs, active=0):
    tabs = ["Home", "Products", "Cart", "Orders", "Profile"]
    icons = ["🏠", "📦", "🛒", "📋", "👤"]
    tab_w = w // len(tabs)
    draw.rectangle([0, h - 120, w, h], fill=WHITE)
    draw.line([0, h - 120, w, h - 120], fill=BORDER, width=2)
    for i, (tab, icon) in enumerate(zip(tabs, icons)):
        cx = tab_w * i + tab_w // 2
        color = PRIMARY if i == active else TEXT_GRAY
        # Simple circle icon placeholder
        draw.ellipse([cx - 18, h - 110, cx + 18, h - 74], fill=color)
        draw.text((cx - 15, h - 65), tab, fill=color, font=font_xs)

def generate_home_screen(w, h, scale):
    img = Image.new("RGB", (w, h), WHITE)
    draw = ImageDraw.Draw(img)

    f_lg = get_font(int(48 * scale))
    f_md = get_font(int(30 * scale))
    f_sm = get_font_regular(int(24 * scale))
    f_xs = get_font_regular(int(18 * scale))
    f_title = get_font(int(36 * scale))

    draw_status_bar(draw, w, f_xs)
    draw_nav_bar(draw, w, "Template Full Stack", f_md)
    draw_tab_bar(draw, w, h, f_xs, active=0)

    y = 150

    # Hero banner
    draw_rounded_rect(draw, (40, y, w - 40, y + int(300 * scale)), int(20 * scale), PRIMARY)
    draw.text((80, y + int(80 * scale)), "Welcome to", fill=WHITE, font=f_sm)
    draw.text((80, y + int(120 * scale)), "Template Full Stack", fill=WHITE, font=f_lg)
    draw.text((80, y + int(200 * scale)), "Shop Now →", fill=(219, 234, 254), font=f_md)
    y += int(340 * scale)

    # Categories
    draw.text((50, y), "Categories", fill=TEXT_DARK, font=f_title)
    y += int(60 * scale)
    cats = ["Electronics", "Clothing", "Home", "Sports"]
    cat_w = (w - 120) // 4
    for i, cat in enumerate(cats):
        cx = 40 + i * (cat_w + int(15 * scale))
        draw_rounded_rect(draw, (cx, y, cx + cat_w, y + cat_w), int(16 * scale), BG_LIGHT)
        draw.ellipse([cx + cat_w // 2 - 30, y + int(40 * scale), cx + cat_w // 2 + 30, y + int(100 * scale)], fill=PRIMARY)
        draw.text((cx + cat_w // 2 - len(cat) * 5, y + cat_w - int(50 * scale)), cat, fill=TEXT_DARK, font=f_xs)
    y += cat_w + int(40 * scale)

    # Featured products
    draw.text((50, y), "Featured Products", fill=TEXT_DARK, font=f_title)
    y += int(60 * scale)
    prod_w = (w - 120) // 2
    for i in range(4):
        col = i % 2
        row = i // 2
        px = 40 + col * (prod_w + int(20 * scale))
        py = y + row * (prod_w + int(20 * scale))
        draw_rounded_rect(draw, (px, py, px + prod_w, py + prod_w), int(16 * scale), BG_LIGHT)
        draw.rectangle([px + int(20 * scale), py + int(20 * scale), px + prod_w - int(20 * scale), py + int(180 * scale)], fill=WHITE)
        draw.ellipse([px + prod_w // 2 - 40, py + int(60 * scale), px + prod_w // 2 + 40, py + int(140 * scale)], fill=PRIMARY)
        draw.text((px + int(20 * scale), py + int(200 * scale)), f"Product {i + 1}", fill=TEXT_DARK, font=f_sm)
        draw.text((px + int(20 * scale), py + int(240 * scale)), f"$ {(i + 1) * 29}.99", fill=PRIMARY, font=f_md)

    return img

def generate_products_screen(w, h, scale):
    img = Image.new("RGB", (w, h), WHITE)
    draw = ImageDraw.Draw(img)

    f_lg = get_font(int(48 * scale))
    f_md = get_font(int(30 * scale))
    f_sm = get_font_regular(int(24 * scale))
    f_xs = get_font_regular(int(18 * scale))
    f_title = get_font(int(36 * scale))

    draw_status_bar(draw, w, f_xs)
    draw_nav_bar(draw, w, "Products", f_md)

    # Search bar
    y = 150
    draw_rounded_rect(draw, (40, y, w - 40, y + int(60 * scale)), int(12 * scale), BG_LIGHT)
    draw.text((70, y + int(15 * scale)), "🔍 Search products...", fill=TEXT_GRAY, font=f_sm)
    y += int(90 * scale)

    # Filter chips
    chips = ["All", "Electronics", "Clothing", "Home", "Sports"]
    chip_x = 40
    for i, chip in enumerate(chips):
        cw = len(chip) * int(14 * scale) + 40
        bg = PRIMARY if i == 0 else BG_LIGHT
        fc = WHITE if i == 0 else TEXT_DARK
        draw_rounded_rect(draw, (chip_x, y, chip_x + cw, y + int(45 * scale)), int(10 * scale), bg)
        draw.text((chip_x + 20, y + int(8 * scale)), chip, fill=fc, font=f_xs)
        chip_x += cw + int(12 * scale)
    y += int(70 * scale)

    # Product list
    for i in range(6):
        py = y + i * int(180 * scale)
        # Card
        draw_rounded_rect(draw, (40, py, w - 40, py + int(160 * scale)), int(12 * scale), BG_LIGHT)
        # Image placeholder
        draw.rectangle([60, py + int(15 * scale), int(200 * scale), py + int(145 * scale)], fill=WHITE)
        draw.ellipse([int(110 * scale), py + int(45 * scale), int(160 * scale), py + int(95 * scale)], fill=PRIMARY)
        # Text
        draw.text((int(220 * scale), py + int(20 * scale)), f"Product Name {i + 1}", fill=TEXT_DARK, font=f_sm)
        draw.text((int(220 * scale), py + int(55 * scale)), "Category", fill=TEXT_GRAY, font=f_xs)
        draw.text((int(220 * scale), py + int(95 * scale)), f"$ {(i + 1) * 19}.99", fill=PRIMARY, font=f_md)
        # Add to cart button
        draw_rounded_rect(draw, (w - int(180 * scale), py + int(90 * scale), w - 60, py + int(130 * scale)), int(8 * scale), PRIMARY)
        draw.text((w - int(150 * scale), py + int(95 * scale)), "Add to Cart", fill=WHITE, font=f_xs)

    draw_tab_bar(draw, w, h, f_xs, active=1)
    return img

def generate_cart_screen(w, h, scale):
    img = Image.new("RGB", (w, h), WHITE)
    draw = ImageDraw.Draw(img)

    f_lg = get_font(int(48 * scale))
    f_md = get_font(int(30 * scale))
    f_sm = get_font_regular(int(24 * scale))
    f_xs = get_font_regular(int(18 * scale))
    f_title = get_font(int(36 * scale))

    draw_status_bar(draw, w, f_xs)
    draw_nav_bar(draw, w, "Shopping Cart", f_md)
    draw_tab_bar(draw, w, h, f_xs, active=2)

    y = 150

    # Cart items
    for i in range(3):
        iy = y + i * int(160 * scale)
        draw_rounded_rect(draw, (40, iy, w - 40, iy + int(140 * scale)), int(12 * scale), BG_LIGHT)
        draw.rectangle([60, iy + int(15 * scale), int(180 * scale), iy + int(125 * scale)], fill=WHITE)
        draw.ellipse([int(100 * scale), iy + int(35 * scale), int(150 * scale), iy + int(85 * scale)], fill=ORANGE)
        draw.text((int(200 * scale), iy + int(20 * scale)), f"Item {i + 1}", fill=TEXT_DARK, font=f_sm)
        draw.text((int(200 * scale), iy + int(55 * scale)), f"$ {(i + 1) * 25}.00", fill=PRIMARY, font=f_md)
        # Quantity controls
        draw_rounded_rect(draw, (int(200 * scale), iy + int(90 * scale), int(240 * scale), iy + int(120 * scale)), int(6 * scale), BORDER)
        draw.text((int(210 * scale), iy + int(92 * scale)), "-", fill=TEXT_DARK, font=f_md)
        draw.text((int(250 * scale), iy + int(92 * scale)), "2", fill=TEXT_DARK, font=f_md)
        draw_rounded_rect(draw, (int(280 * scale), iy + int(90 * scale), int(320 * scale), iy + int(120 * scale)), int(6 * scale), BORDER)
        draw.text((int(290 * scale), iy + int(92 * scale)), "+", fill=TEXT_DARK, font=f_md)
        # Remove
        draw.text((w - int(150 * scale), iy + int(95 * scale)), "Remove", fill=RED, font=f_xs)

    y += 3 * int(160 * scale) + int(30 * scale)

    # Summary
    draw.line([40, y, w - 40, y], fill=BORDER, width=2)
    y += int(20 * scale)
    draw.text((50, y), "Subtotal:", fill=TEXT_GRAY, font=f_sm)
    draw.text((w - int(200 * scale), y), "$150.00", fill=TEXT_DARK, font=f_sm)
    y += int(45 * scale)
    draw.text((50, y), "Tax (7%):", fill=TEXT_GRAY, font=f_sm)
    draw.text((w - int(200 * scale), y), "$10.50", fill=TEXT_DARK, font=f_sm)
    y += int(45 * scale)
    draw.text((50, y), "Total:", fill=TEXT_DARK, font=f_title)
    draw.text((w - int(200 * scale), y), "$160.50", fill=PRIMARY, font=f_title)
    y += int(80 * scale)

    # Checkout button
    draw_rounded_rect(draw, (40, y, w - 40, y + int(70 * scale)), int(14 * scale), PRIMARY)
    draw.text((w // 2 - int(80 * scale), y + int(15 * scale)), "Checkout", fill=WHITE, font=f_md)

    return img

def generate_profile_screen(w, h, scale):
    img = Image.new("RGB", (w, h), WHITE)
    draw = ImageDraw.Draw(img)

    f_lg = get_font(int(48 * scale))
    f_md = get_font(int(30 * scale))
    f_sm = get_font_regular(int(24 * scale))
    f_xs = get_font_regular(int(18 * scale))
    f_title = get_font(int(36 * scale))

    draw_status_bar(draw, w, f_xs)
    draw_nav_bar(draw, w, "Profile", f_md)
    draw_tab_bar(draw, w, h, f_xs, active=4)

    y = 150

    # Avatar
    cx = w // 2
    draw.ellipse([cx - int(60 * scale), y, cx + int(60 * scale), y + int(120 * scale)], fill=PRIMARY)
    draw.text((cx - int(15 * scale), y + int(35 * scale)), "SP", fill=WHITE, font=f_lg)
    y += int(140 * scale)
    draw.text((cx - int(80 * scale), y), "Souliya Phoupaseuth", fill=TEXT_DARK, font=f_title)
    y += int(50 * scale)
    draw.text((cx - int(60 * scale), y), "souliyappsdev@gmail.com", fill=TEXT_GRAY, font=f_xs)
    y += int(60 * scale)

    # Menu items
    menus = [
        ("📦  My Orders", "View your order history"),
        ("📍  Shipping Address", "Manage your addresses"),
        ("💳  Payment Methods", "Manage payment options"),
        ("⚙️  Settings", "App preferences"),
        ("❓  Help & Support", "Get assistance"),
        ("📋  About", "Version 1.0.0"),
    ]
    for title, subtitle in menus:
        draw_rounded_rect(draw, (40, y, w - 40, y + int(90 * scale)), int(12 * scale), BG_LIGHT)
        draw.text((70, y + int(12 * scale)), title, fill=TEXT_DARK, font=f_sm)
        draw.text((70, y + int(50 * scale)), subtitle, fill=TEXT_GRAY, font=f_xs)
        draw.text((w - 80, y + int(30 * scale)), "→", fill=TEXT_GRAY, font=f_md)
        y += int(105 * scale)

    return img

def main():
    screens = {
        "01_home": generate_home_screen,
        "02_products": generate_products_screen,
        "03_cart": generate_cart_screen,
        "04_profile": generate_profile_screen,
    }

    for size_name, (w, h) in SIZES.items():
        scale = min(w, h) / 1242.0
        print(f"\n📐 Generating {size_name} ({w}x{h}) screenshots...")
        for name, gen_fn in screens.items():
            img = gen_fn(w, h, scale)
            path = os.path.join(OUT_DIR, f"{name}_{size_name}.png")
            img.save(path, "PNG")
            print(f"  ✅ {name} → {os.path.basename(path)}")

    print(f"\n🎉 All screenshots saved to: {OUT_DIR}")
    print(f"   Total: {len(screens) * len(SIZES)} images")

if __name__ == "__main__":
    main()
