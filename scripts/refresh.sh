#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Change to the root directory
cd "$ROOT_DIR" || exit

echo "🔄 Refreshing Ghost theme..."

# Update the theme
ghost theme update wave_petcom

# Restart Ghost in development mode
ghost restart --development

echo "✅ Theme refresh complete!" 