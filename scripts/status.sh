#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Change to the root directory
cd "$ROOT_DIR" || exit

echo "📊 Checking Ghost status..."

# Check if Ghost is running
if ghost status > /dev/null 2>&1; then
    echo "✅ Ghost is running"
    
    # Get Ghost URL
    GHOST_URL=$(ghost config get url)
    echo "🌐 URL: $GHOST_URL"
    
    # Get Ghost installation path
    GHOST_PATH=$(ghost config get paths.contentPath)
    echo "📁 Installation path: $GHOST_PATH"
    
    # Get Ghost version
    GHOST_VERSION=$(ghost version)
    echo "📦 Version: $GHOST_VERSION"
else
    echo "❌ Ghost is not running"
fi 