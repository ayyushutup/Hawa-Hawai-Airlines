
from PIL import Image
import sys

def add_background(input_path, output_path, hex_color):
    try:
        img = Image.open(input_path).convert("RGBA")
        
        # Parse hex color
        hex_color = hex_color.lstrip('#')
        rgb = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
        
        # Create solid background
        bg = Image.new("RGBA", img.size, rgb + (255,))
        
        # Composite
        combined = Image.alpha_composite(bg, img)
        
        # Save as PNG (or JPG)
        combined.save(output_path, "PNG")
        print(f"Successfully saved logo with background {hex_color} to {output_path}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python add_bg.py <input> <output> <hex_color>")
        # Default to correct purple if not provided
        add_background("/Users/ayushrthakur/Documents/hawa-hawai/frontend/public/assets/logo_transparent.png", "/Users/ayushrthakur/Documents/hawa-hawai/frontend/public/assets/logo_purple.png", "#2E004B")
    else:
        add_background(sys.argv[1], sys.argv[2], sys.argv[3])
