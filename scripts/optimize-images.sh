#!/bin/bash

###############################################################################
# Image Optimization Script
# Optimizes images for web delivery (WebP, compression, responsive sizes)
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SOURCE_DIR="${1:-./frontend/public}"
OUTPUT_DIR="${2:-./frontend/public/optimized}"
QUALITY="${3:-85}"

echo -e "${GREEN}Starting image optimization...${NC}"
echo "Source: $SOURCE_DIR"
echo "Output: $OUTPUT_DIR"
echo "Quality: $QUALITY"

# Check for required tools
command -v convert >/dev/null 2>&1 || {
    echo -e "${RED}ImageMagick is required but not installed.${NC}"
    echo "Install with: brew install imagemagick"
    exit 1
}

command -v cwebp >/dev/null 2>&1 || {
    echo -e "${YELLOW}cwebp not found. WebP conversion will be skipped.${NC}"
    echo "Install with: brew install webp"
    SKIP_WEBP=true
}

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Statistics
total_files=0
optimized_files=0
original_size=0
optimized_size=0

# Find and optimize images
find "$SOURCE_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) | while read -r file; do
    filename=$(basename "$file")
    extension="${filename##*.}"
    basename="${filename%.*}"

    echo -e "\n${YELLOW}Processing: $filename${NC}"

    # Get original file size
    orig_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    original_size=$((original_size + orig_size))
    total_files=$((total_files + 1))

    # Optimize original format
    if [ "$extension" = "jpg" ] || [ "$extension" = "jpeg" ]; then
        # Optimize JPEG
        convert "$file" \
            -strip \
            -interlace Plane \
            -quality "$QUALITY" \
            "$OUTPUT_DIR/$filename"

        echo "  ✓ Optimized JPEG"
    elif [ "$extension" = "png" ]; then
        # Optimize PNG
        convert "$file" \
            -strip \
            -define png:compression-level=9 \
            "$OUTPUT_DIR/$filename"

        echo "  ✓ Optimized PNG"
    fi

    # Convert to WebP
    if [ -z "$SKIP_WEBP" ]; then
        cwebp -q "$QUALITY" "$file" -o "$OUTPUT_DIR/${basename}.webp" 2>/dev/null
        echo "  ✓ Created WebP"
    fi

    # Generate responsive sizes (for images > 1200px wide)
    width=$(identify -format "%w" "$file")

    if [ "$width" -gt 1200 ]; then
        # Generate common breakpoints
        for size in 320 640 768 1024 1280 1536; do
            if [ "$width" -gt "$size" ]; then
                output_file="$OUTPUT_DIR/${basename}-${size}w.$extension"
                convert "$file" \
                    -resize "${size}x" \
                    -strip \
                    -quality "$QUALITY" \
                    "$output_file"

                # WebP version
                if [ -z "$SKIP_WEBP" ]; then
                    cwebp -q "$QUALITY" "$output_file" -o "$OUTPUT_DIR/${basename}-${size}w.webp" 2>/dev/null
                fi
            fi
        done
        echo "  ✓ Generated responsive sizes"
    fi

    # Calculate savings
    new_size=$(stat -f%z "$OUTPUT_DIR/$filename" 2>/dev/null || stat -c%s "$OUTPUT_DIR/$filename" 2>/dev/null)
    optimized_size=$((optimized_size + new_size))
    optimized_files=$((optimized_files + 1))

    savings=$((100 - (new_size * 100 / orig_size)))
    echo -e "  ${GREEN}Saved: ${savings}% ($(numfmt --to=iec $orig_size) → $(numfmt --to=iec $new_size))${NC}"
done

# Print summary
echo -e "\n${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║       Optimization Complete!           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo "Files processed: $total_files"
echo "Files optimized: $optimized_files"
echo "Original size:   $(numfmt --to=iec $original_size)"
echo "Optimized size:  $(numfmt --to=iec $optimized_size)"
echo "Total savings:   $((100 - (optimized_size * 100 / original_size)))%"

# Create image manifest
cat > "$OUTPUT_DIR/manifest.json" <<EOF
{
  "optimized": $(date -u +"%Y-%m-%dT%H:%M:%SZ"),
  "totalFiles": $total_files,
  "originalSize": $original_size,
  "optimizedSize": $optimized_size,
  "savings": "$((100 - (optimized_size * 100 / original_size)))%"
}
EOF

echo -e "\n${GREEN}Manifest created: $OUTPUT_DIR/manifest.json${NC}"
