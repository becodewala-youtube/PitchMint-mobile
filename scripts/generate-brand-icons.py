import os
import math
from PIL import Image, ImageDraw, ImageFilter

ASSETS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'assets'))
LOGO_PATH = os.path.join(ASSETS_DIR, 'logo.png')

def create_radial_glow(size, glow_color=(124, 58, 237), radius=350, max_alpha=120):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    center = size / 2.0
    for r in range(radius, 0, -2):
        factor = 1.0 - (r / radius)
        # Smooth cosine rolloff
        alpha = int(max_alpha * (math.sin(factor * math.pi / 2) ** 2))
        color = (*glow_color, alpha)
        draw = ImageDraw.Draw(img)
        bbox = [center - r, center - r, center + r, center + r]
        draw.ellipse(bbox, fill=color)
    return img.filter(ImageFilter.GaussianBlur(15))

def generate_icons():
    logo = Image.open(LOGO_PATH).convert('RGBA')
    lw, lh = logo.size
    print(f"Loaded logo: {lw}x{lh}")

    # 1. assets/icon.png (1024x1024)
    icon_size = 1024
    icon_bg = Image.new('RGBA', (icon_size, icon_size), (0, 0, 0, 255))
    glow = create_radial_glow(icon_size, glow_color=(94, 23, 235), radius=420, max_alpha=90)
    icon_bg = Image.alpha_composite(icon_bg, glow)

    # Logo scaled to ~680x680 inside 1024
    target_logo_h = 680
    target_logo_w = int(lw * (target_logo_h / lh))
    logo_resized = logo.resize((target_logo_w, target_logo_h), Image.Resampling.LANCZOS)
    pos_x = (icon_size - target_logo_w) // 2
    pos_y = (icon_size - target_logo_h) // 2
    icon_bg.paste(logo_resized, (pos_x, pos_y), logo_resized)
    icon_bg.save(os.path.join(ASSETS_DIR, 'icon.png'), 'PNG')
    print("Saved icon.png")

    # 2. assets/android-icon-background.png (1024x1024)
    bg_img = Image.new('RGBA', (icon_size, icon_size), (0, 0, 0, 255))
    bg_glow = create_radial_glow(icon_size, glow_color=(94, 23, 235), radius=380, max_alpha=80)
    bg_img = Image.alpha_composite(bg_img, bg_glow)
    bg_img.save(os.path.join(ASSETS_DIR, 'android-icon-background.png'), 'PNG')
    print("Saved android-icon-background.png")

    # 3. assets/android-icon-foreground.png (1024x1024)
    # Must fit strictly within Android's 66% safe zone (diameter ~676px).
    # We use 560px max dimension so margin is generous and safe across all OEM masks.
    fg_size = 1024
    fg_img = Image.new('RGBA', (fg_size, fg_size), (0, 0, 0, 0))
    target_fg_h = 560
    target_fg_w = int(lw * (target_fg_h / lh))
    fg_logo = logo.resize((target_fg_w, target_fg_h), Image.Resampling.LANCZOS)
    fg_pos_x = (fg_size - target_fg_w) // 2
    fg_pos_y = (fg_size - target_fg_h) // 2
    fg_img.paste(fg_logo, (fg_pos_x, fg_pos_y), fg_logo)
    fg_img.save(os.path.join(ASSETS_DIR, 'android-icon-foreground.png'), 'PNG')
    print("Saved android-icon-foreground.png")

    # 4. assets/android-icon-monochrome.png (1024x1024)
    mono_img = Image.new('RGBA', (fg_size, fg_size), (0, 0, 0, 0))
    # Create white silhouette based on foreground alpha
    r, g, b, a = fg_img.split()
    white_fill = Image.new('L', (fg_size, fg_size), 255)
    mono_result = Image.merge('RGBA', (white_fill, white_fill, white_fill, a))
    mono_result.save(os.path.join(ASSETS_DIR, 'android-icon-monochrome.png'), 'PNG')
    print("Saved android-icon-monochrome.png")

    # 5. assets/splash-icon.png (1024x1024)
    splash_img = Image.new('RGBA', (icon_size, icon_size), (0, 0, 0, 255))
    splash_glow = create_radial_glow(icon_size, glow_color=(94, 23, 235), radius=350, max_alpha=70)
    splash_img = Image.alpha_composite(splash_img, splash_glow)
    target_splash_h = 420
    target_splash_w = int(lw * (target_splash_h / lh))
    splash_logo = logo.resize((target_splash_w, target_splash_h), Image.Resampling.LANCZOS)
    s_x = (icon_size - target_splash_w) // 2
    s_y = (icon_size - target_splash_h) // 2
    splash_img.paste(splash_logo, (s_x, s_y), splash_logo)
    splash_img.save(os.path.join(ASSETS_DIR, 'splash-icon.png'), 'PNG')
    print("Saved splash-icon.png")

if __name__ == '__main__':
    generate_icons()
