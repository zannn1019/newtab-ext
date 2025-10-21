# Icon Placeholder

This directory should contain three icon files:

- `icon16.png` (16x16px)
- `icon48.png` (48x48px)
- `icon128.png` (128x128px)

## Design Guidelines

All icons should follow the monochrome aesthetic:

- Black background
- White geometric symbol (e.g., a minimalist "K" or abstract motion lines)
- Sharp, clean edges
- High contrast

## Tools for Creating Icons

- Figma: https://www.figma.com
- Adobe Illustrator
- Inkscape (free): https://inkscape.org

## Quick Placeholder

For development, you can use a simple SVG-to-PNG converter:

1. Create an SVG with a white shape on black background
2. Use ImageMagick to convert:
   ```bash
   convert -background black -size 16x16 icon.svg icon16.png
   convert -background black -size 48x48 icon.svg icon48.png
   convert -background black -size 128x128 icon.svg icon128.png
   ```

Or use an online tool like: https://cloudconvert.com/svg-to-png
