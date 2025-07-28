#!/bin/bash

# Deployment script for Binaural Relaxation Mixer
# This script copies the built files to your Ghost theme assets directory

set -e

echo "🎵 Deploying Binaural Relaxation Mixer..."

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "dist" ]; then
    echo "❌ Error: Run this script from the realtime-ts-mixer directory"
    exit 1
fi

# Check if dist directory exists and has files
if [ ! -f "dist/index.js" ]; then
    echo "❌ Error: Built files not found. Run 'npm run build' first."
    exit 1
fi

# Define target directory (adjust this path to your Ghost theme assets)
ASSETS_DIR="../assets/js/realtime-ts-mixer"
CSS_DIR="../assets/css"

# Create target directories
echo "📁 Creating directories..."
mkdir -p "$ASSETS_DIR"
mkdir -p "$CSS_DIR"

# Copy JavaScript files
echo "📦 Copying JavaScript files..."
cp -r dist/*.js "$ASSETS_DIR/"
cp -r dist/*.js.map "$ASSETS_DIR/"

# Copy CSS file
echo "🎨 Copying CSS file..."
cp dist/styles.css "$CSS_DIR/realtime-ts-mixer.css"

# Copy TypeScript definitions (optional, for development)
cp -r dist/*.d.ts "$ASSETS_DIR/" 2>/dev/null || true

echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Add to your Ghost theme template (default.hbs or index.hbs):"
echo "   <link rel=\"stylesheet\" href=\"{{asset 'css/realtime-ts-mixer.css'}}\">"
echo "   <script type=\"module\" src=\"{{asset 'js/realtime-ts-mixer/index.js'}}\"></script>"
echo ""
echo "2. Create audio files in /audio/loops/ directory"
echo "3. Test with the included test.html file"
echo ""
echo "🎵 Ready to mix some binaural beats!"
