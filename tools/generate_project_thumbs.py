"""Generate pixel art thumbnails for portfolio projects.
Matches the retro arcade aesthetic and the 640x360 aspect ratio.
"""
from PIL import Image, ImageDraw, ImageFont
import os

ASSETS = os.path.join(os.path.dirname(__file__), "..", "assets")

PALETTE_HEX = [
    "#f4f5f0", "#ffffff", "#f0f2ea", "#eaece4", "#e2e6dc",
    "#c9ced6", "#9aa3ae", "#6d7a76", "#4a4f5c", "#2a2a38",
    "#1a1a24", "#12121c", "#000000",
    "#008a7a", "#00b39b", "#65d9c6", "#83f6e2", "#005047",
    "#c2185b", "#e01475", "#ffb1c6", "#8e0047",
    "#b36b00", "#f59e0b", "#fde68a", "#ffddb3", "#7f5300",
    "#1565c0", "#4a90d9", "#bcd8f5",
    "#39ff14", "#ffe0bd", "#e0a370", "#8d5524",
]

def build_palette():
    pal = Image.new("P", (1, 1))
    flat = []
    for hx in PALETTE_HEX:
        h = hx.lstrip("#")
        flat.extend(int(h[i : i + 2], 16) for i in (0, 2, 4))
    flat += flat[-3:] * (256 - len(PALETTE_HEX))
    pal.putpalette(flat)
    return pal

# Generate canvas at 160x90 (1:4 scale of 640x360)
def make_thumb(draw_fn, filename):
    im = Image.new("RGB", (160, 90), "#12121c")
    draw = ImageDraw.Draw(im)
    draw_fn(draw)
    
    # Scale up nearest-neighbor to 640x360
    scaled = im.resize((640, 360), Image.NEAREST)
    paletted = scaled.quantize(palette=build_palette(), dither=Image.NONE)
    out_path = os.path.join(ASSETS, filename)
    paletted.save(out_path, "PNG", optimize=True)
    print(f"Generated {filename}: {os.path.getsize(out_path)} bytes")

def draw_clipmax(d):
    # Desktop window
    d.rectangle([10, 8, 150, 82], outline="#2a2a38", fill="#1a1a24")
    d.rectangle([10, 8, 150, 18], fill="#2a2a38")
    d.rectangle([14, 11, 18, 15], fill="#e01475")
    d.rectangle([21, 11, 25, 15], fill="#f59e0b")
    d.rectangle([28, 11, 32, 15], fill="#00b39b")
    
    # 16:9 monitor view inside window
    d.rectangle([16, 23, 105, 68], fill="#12121c", outline="#4a4f5c")
    # Face silhouette inside video
    d.rectangle([54, 30, 68, 44], fill="#ffe0bd")
    d.rectangle([50, 45, 72, 65], fill="#1565c0")
    # Vertical crop box (9:16 target)
    d.rectangle([45, 25, 77, 66], outline="#39ff14", width=1)
    d.rectangle([43, 23, 47, 27], fill="#39ff14")
    d.rectangle([75, 23, 79, 27], fill="#39ff14")
    d.rectangle([43, 64, 47, 68], fill="#39ff14")
    d.rectangle([75, 64, 79, 68], fill="#39ff14")
    
    # Audio waveform at bottom of player
    for i in range(18, 104, 3):
        h = (i * 7) % 9 + 2
        d.line([i, 67 - h, i, 67], fill="#00ffcc")
        
    # Right panel: AI pipeline stats
    d.rectangle([110, 23, 144, 78], fill="#12121c", outline="#2a2a38")
    d.rectangle([114, 27, 140, 32], fill="#00b39b") # Status bar
    d.rectangle([114, 37, 136, 40], fill="#4a4f5c")
    d.rectangle([114, 44, 138, 47], fill="#4a4f5c")
    d.rectangle([114, 51, 130, 54], fill="#4a4f5c")
    d.rectangle([114, 60, 140, 66], fill="#e01475") # NVENC badge
    d.rectangle([114, 70, 132, 74], fill="#f59e0b")

def draw_clipmax_mobile(d):
    # Background grid subtle
    for x in range(0, 160, 16):
        d.line([x, 0, x, 90], fill="#1a1a24")
    for y in range(0, 90, 16):
        d.line([0, y, 160, y], fill="#1a1a24")
        
    # Phone frame in center
    d.rectangle([56, 6, 104, 84], outline="#4a90d9", fill="#12121c", width=2)
    d.rectangle([75, 9, 85, 11], fill="#4a4f5c") # Speaker
    
    # Screen inner (Reels / 9:16 video)
    d.rectangle([60, 15, 100, 75], fill="#1a1a24")
    # Video subject
    d.rectangle([74, 25, 86, 37], fill="#ffe0bd")
    d.rectangle([70, 38, 90, 55], fill="#c2185b")
    # Text overlay track on video
    d.rectangle([65, 42, 95, 48], fill="#f59e0b")
    # Audio waves on phone screen
    for i in range(62, 98, 3):
        h = (i * 11) % 6 + 1
        d.line([i, 60 - h, i, 60], fill="#39ff14")
        
    # Mobile HUD controls
    d.rectangle([63, 67, 72, 71], fill="#00ffcc")
    d.rectangle([76, 66, 84, 72], fill="#e01475")
    d.rectangle([88, 67, 97, 71], fill="#00ffcc")
    
    # Left & Right floating widgets
    d.rectangle([14, 25, 46, 65], fill="#1a1a24", outline="#008a7a")
    d.rectangle([18, 30, 42, 34], fill="#65d9c6")
    d.rectangle([18, 38, 38, 41], fill="#4a4f5c")
    d.rectangle([18, 44, 40, 47], fill="#4a4f5c")
    d.rectangle([18, 52, 42, 58], fill="#39ff14")
    
    d.rectangle([114, 25, 146, 65], fill="#1a1a24", outline="#b36b00")
    d.rectangle([118, 30, 142, 34], fill="#fde68a")
    d.rectangle([118, 38, 138, 41], fill="#4a4f5c")
    d.rectangle([118, 44, 140, 47], fill="#4a4f5c")
    d.rectangle([118, 52, 142, 58], fill="#f59e0b")

def draw_job_automation(d):
    # Split terminal / pipeline
    d.rectangle([8, 10, 80, 80], fill="#1a1a24", outline="#00b39b")
    d.rectangle([8, 10, 80, 19], fill="#005047")
    # Code lines
    colors = ["#00ffcc", "#39ff14", "#ffb1c6", "#fde68a", "#65d9c6", "#ffffff"]
    for idx, y in enumerate(range(24, 76, 5)):
        w = ((idx * 17) % 45) + 15
        d.line([14, y, 14 + w, y], fill=colors[idx % len(colors)], width=2)
        
    # Right panel: Match & Dispatch dashboard
    d.rectangle([86, 10, 152, 80], fill="#1a1a24", outline="#4a90d9")
    d.rectangle([86, 10, 152, 19], fill="#1565c0")
    
    # Match score gauge
    d.rectangle([94, 25, 144, 42], fill="#12121c", outline="#2a2a38")
    d.rectangle([98, 29, 130, 38], fill="#39ff14") # Score 85%+
    
    # Telegram Bot icon / message dispatch
    d.polygon([(96, 58), (142, 50), (115, 68)], fill="#4a90d9")
    d.polygon([(115, 68), (124, 60), (142, 50)], fill="#bcd8f5")
    
    # Status badges
    d.rectangle([94, 72, 118, 77], fill="#f59e0b")
    d.rectangle([122, 72, 144, 77], fill="#00b39b")

def draw_losari_jaya(d):
    # Warehouse grid background
    d.rectangle([10, 10, 150, 80], fill="#1a1a24", outline="#b36b00")
    d.rectangle([10, 10, 150, 18], fill="#7f5300")
    
    # Shelves with boxes
    # Shelf 1
    d.line([18, 48, 88, 48], fill="#9aa3ae", width=2)
    d.line([18, 72, 88, 72], fill="#9aa3ae", width=2)
    d.line([18, 25, 18, 75], fill="#9aa3ae", width=2)
    d.line([88, 25, 88, 75], fill="#9aa3ae", width=2)
    
    # Boxes
    box_colors = ["#f59e0b", "#e0a370", "#b36b00", "#fde68a"]
    d.rectangle([24, 32, 42, 47], fill="#f59e0b", outline="#8d5524")
    d.rectangle([46, 30, 66, 47], fill="#e0a370", outline="#8d5524")
    d.rectangle([68, 35, 84, 47], fill="#fde68a", outline="#8d5524")
    d.rectangle([24, 55, 50, 71], fill="#e0a370", outline="#8d5524")
    d.rectangle([54, 52, 82, 71], fill="#f59e0b", outline="#8d5524")
    
    # Right panel: POS & Stock monitor
    d.rectangle([96, 24, 144, 74], fill="#12121c", outline="#4a4f5c")
    # Barcode
    for idx, x in enumerate(range(102, 138, 3)):
        if idx % 3 != 1:
            d.line([x, 30, x, 42], fill="#ffffff", width=1 if idx % 2 == 0 else 2)
    # Red scanner line across barcode
    d.line([100, 36, 140, 36], fill="#e01475", width=1)
    
    # POS Total readout
    d.rectangle([102, 48, 138, 56], fill="#005047")
    d.rectangle([104, 51, 126, 53], fill="#39ff14")
    d.rectangle([102, 60, 138, 68], fill="#f59e0b")

def draw_starfall(d):
    # Arcade machine / store aesthetic
    d.rectangle([10, 10, 150, 80], fill="#1a1a24", outline="#e01475")
    d.rectangle([10, 10, 150, 18], fill="#8e0047")
    
    # Gamepad / Console on left
    d.rectangle([20, 30, 65, 65], fill="#2a2a38", outline="#4a4f5c")
    # D-pad
    d.rectangle([28, 42, 38, 52], fill="#6d7a76")
    d.rectangle([31, 39, 35, 55], fill="#6d7a76")
    # Action buttons
    d.rectangle([48, 41, 52, 45], fill="#00ffcc")
    d.rectangle([54, 46, 58, 50], fill="#e01475")
    d.rectangle([48, 51, 52, 55], fill="#f59e0b")
    d.rectangle([42, 46, 46, 50], fill="#39ff14")
    
    # Glowing electricity token (lightning) in center-right
    lightning = [(85, 28), (75, 48), (83, 48), (77, 68), (95, 44), (87, 44)]
    d.polygon(lightning, fill="#ffdd00")
    
    # Right side: Payment Gateway card & check
    d.rectangle([105, 26, 144, 72], fill="#12121c", outline="#00b39b")
    # Credit / QR badge
    d.rectangle([110, 32, 138, 48], fill="#1565c0")
    d.rectangle([114, 36, 122, 42], fill="#ffdd00") # Chip
    # Checkmark / instant transaction
    d.line([115, 60, 122, 66], fill="#39ff14", width=2)
    d.line([122, 66, 134, 54], fill="#39ff14", width=2)

if __name__ == "__main__":
    make_thumb(draw_clipmax, "project-clipmax.png")
    make_thumb(draw_clipmax_mobile, "project-clipmax-mobile.png")
    make_thumb(draw_job_automation, "project-job-automation.png")
    make_thumb(draw_losari_jaya, "project-losari-jaya.png")
    make_thumb(draw_starfall, "project-starfall.png")
