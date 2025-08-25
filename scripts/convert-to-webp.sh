#!/bin/bash

# Script to convert PNG images to WebP format for all volumes

# Check if cwebp is installed
if ! command -v cwebp &> /dev/null; then
    echo "cwebp is not installed. Please install it first:"
    echo "brew install webp"
    exit 1
fi

# Process each volume
for volume in {2..7}; do
    echo "Processing Volume $volume..."
    
    # Create directories if they don't exist
    mkdir -p "public/volume-$volume/images-webp"
    mkdir -p "public/volume-$volume/images-thumbs"
    
    # Check if images directory exists
    if [ -d "volume-$volume/images" ]; then
        # Convert each PNG to WebP
        for png in volume-$volume/images/*.png; do
            if [ -f "$png" ]; then
                filename=$(basename "$png" .png)
                
                # Convert to full-size WebP
                echo "Converting $filename.png to WebP..."
                cwebp -q 85 "$png" -o "public/volume-$volume/images-webp/$filename.webp" 2>/dev/null
                
                # Create thumbnail (96x96)
                echo "Creating thumbnail for $filename..."
                cwebp -q 80 -resize 96 96 "$png" -o "public/volume-$volume/images-thumbs/$filename.webp" 2>/dev/null
            fi
        done
    else
        echo "Warning: volume-$volume/images directory not found"
    fi
done

echo "Conversion complete!"

# Count total converted files
total_webp=$(find public/volume-*/images-webp -name "*.webp" 2>/dev/null | wc -l)
total_thumbs=$(find public/volume-*/images-thumbs -name "*.webp" 2>/dev/null | wc -l)

echo "Total WebP images: $total_webp"
echo "Total thumbnails: $total_thumbs"