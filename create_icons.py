#!/usr/bin/env python3
"""
Create PNG icons from SVG for web app
Uses PIL to create simple rat icon if cairosvg is not available
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_rat_icon(size):
    """Create a simple rat racing icon"""
    # Create image with gold background
    img = Image.new('RGBA', (size, size), '#FFD700')
    draw = ImageDraw.Draw(img)

    # Scale factor for different sizes
    scale = size / 512

    # Draw rat body (brown ellipse)
    body_bounds = [
        int(136 * scale), int(210 * scale),
        int(376 * scale), int(390 * scale)
    ]
    draw.ellipse(body_bounds, fill='#8B4513')

    # Draw rat head (brown circle)
    head_bounds = [
        int(186 * scale), int(130 * scale),
        int(326 * scale), int(270 * scale)
    ]
    draw.ellipse(head_bounds, fill='#8B4513')

    # Draw ears
    left_ear = [
        int(195 * scale), int(145 * scale),
        int(245 * scale), int(195 * scale)
    ]
    right_ear = [
        int(267 * scale), int(145 * scale),
        int(317 * scale), int(195 * scale)
    ]
    draw.ellipse(left_ear, fill='#8B4513')
    draw.ellipse(right_ear, fill='#8B4513')

    # Inner ears (pink)
    left_inner = [
        int(205 * scale), int(155 * scale),
        int(235 * scale), int(185 * scale)
    ]
    right_inner = [
        int(277 * scale), int(155 * scale),
        int(307 * scale), int(185 * scale)
    ]
    draw.ellipse(left_inner, fill='#FFB6C1')
    draw.ellipse(right_inner, fill='#FFB6C1')

    # Draw eyes
    left_eye = [
        int(223 * scale), int(183 * scale),
        int(247 * scale), int(207 * scale)
    ]
    right_eye = [
        int(265 * scale), int(183 * scale),
        int(289 * scale), int(207 * scale)
    ]
    draw.ellipse(left_eye, fill='#000000')
    draw.ellipse(right_eye, fill='#000000')

    # Eye highlights
    left_highlight = [
        int(233 * scale), int(188 * scale),
        int(241 * scale), int(196 * scale)
    ]
    right_highlight = [
        int(275 * scale), int(188 * scale),
        int(283 * scale), int(196 * scale)
    ]
    draw.ellipse(left_highlight, fill='#FFFFFF')
    draw.ellipse(right_highlight, fill='#FFFFFF')

    # Draw nose (pink)
    nose_bounds = [
        int(248 * scale), int(212 * scale),
        int(264 * scale), int(228 * scale)
    ]
    draw.ellipse(nose_bounds, fill='#FF69B4')

    # Draw racing stripes
    stripe1 = [
        int(180 * scale), int(280 * scale),
        int(332 * scale), int(295 * scale)
    ]
    stripe2 = [
        int(180 * scale), int(305 * scale),
        int(332 * scale), int(320 * scale)
    ]
    draw.rectangle(stripe1, fill='#FF0000')
    draw.rectangle(stripe2, fill='#FFFFFF')

    # Draw "RACE" text at bottom
    try:
        # Try to use a bold font
        font_size = int(72 * scale)
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
    except:
        # Fallback to default font
        font = ImageFont.load_default()

    text = "RACE"
    # Get text size for centering
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    text_x = (size - text_width) // 2
    text_y = int(400 * scale)

    # Draw text with outline
    for dx in [-2, 0, 2]:
        for dy in [-2, 0, 2]:
            if dx != 0 or dy != 0:
                draw.text((text_x + dx, text_y + dy), text, font=font, fill='#FFFFFF')
    draw.text((text_x, text_y), text, font=font, fill='#000000')

    return img

# Create icons in different sizes
sizes = [192, 512]
for size in sizes:
    icon = create_rat_icon(size)
    filename = f'icon-{size}.png'
    icon.save(filename, 'PNG')
    print(f"Created {filename}")

# Also create Apple Touch icon
apple_icon = create_rat_icon(180)
apple_icon.save('apple-touch-icon.png', 'PNG')
print("Created apple-touch-icon.png")

print("\nIcons created successfully!")
print("Don't forget to commit and push these changes.")