import os
from PIL import Image

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ASSETS_DIR = os.path.join(BASE_DIR, 'assets')
RES_DIR = os.path.join(BASE_DIR, 'android', 'app', 'src', 'main', 'res')

DENSITIES = {
    'mipmap-mdpi': {'launcher': 48, 'adaptive': 108},
    'mipmap-hdpi': {'launcher': 72, 'adaptive': 162},
    'mipmap-xhdpi': {'launcher': 96, 'adaptive': 216},
    'mipmap-xxhdpi': {'launcher': 144, 'adaptive': 324},
    'mipmap-xxxhdpi': {'launcher': 192, 'adaptive': 432},
}

def generate_mipmaps():
    icon_img = Image.open(os.path.join(ASSETS_DIR, 'icon.png')).convert('RGBA')
    bg_img = Image.open(os.path.join(ASSETS_DIR, 'android-icon-background.png')).convert('RGBA')
    fg_img = Image.open(os.path.join(ASSETS_DIR, 'android-icon-foreground.png')).convert('RGBA')
    mono_img = Image.open(os.path.join(ASSETS_DIR, 'android-icon-monochrome.png')).convert('RGBA')

    for folder, sizes in DENSITIES.items():
        folder_path = os.path.join(RES_DIR, folder)
        os.makedirs(folder_path, exist_ok=True)
        l_size = sizes['launcher']
        a_size = sizes['adaptive']

        # 1. ic_launcher.webp (composed launcher icon)
        # Compose fg onto bg
        composed = Image.alpha_composite(bg_img, fg_img)
        l_img = composed.resize((l_size, l_size), Image.Resampling.LANCZOS)
        l_img.save(os.path.join(folder_path, 'ic_launcher.webp'), 'WEBP', quality=100)

        # 2. ic_launcher_round.webp (circular masked composed icon)
        round_mask = Image.new('L', (l_size, l_size), 0)
        from PIL import ImageDraw
        draw = ImageDraw.Draw(round_mask)
        draw.ellipse([0, 0, l_size - 1, l_size - 1], fill=255)
        round_img = Image.new('RGBA', (l_size, l_size), (0, 0, 0, 0))
        round_img.paste(l_img, (0, 0), round_mask)
        round_img.save(os.path.join(folder_path, 'ic_launcher_round.webp'), 'WEBP', quality=100)

        # 3. ic_launcher_foreground.webp
        fg_resized = fg_img.resize((a_size, a_size), Image.Resampling.LANCZOS)
        fg_resized.save(os.path.join(folder_path, 'ic_launcher_foreground.webp'), 'WEBP', quality=100)

        # 4. ic_launcher_background.webp
        bg_resized = bg_img.resize((a_size, a_size), Image.Resampling.LANCZOS)
        bg_resized.save(os.path.join(folder_path, 'ic_launcher_background.webp'), 'WEBP', quality=100)

        # 5. ic_launcher_monochrome.webp
        mono_resized = mono_img.resize((a_size, a_size), Image.Resampling.LANCZOS)
        mono_resized.save(os.path.join(folder_path, 'ic_launcher_monochrome.webp'), 'WEBP', quality=100)

        print(f"Updated {folder}: launcher={l_size}px, adaptive={a_size}px")

if __name__ == '__main__':
    generate_mipmaps()
