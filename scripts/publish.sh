#!/bin/bash

# Save the original directory
ORIGINAL_DIR=$(pwd)

# Determine if we're in the scripts folder
if [[ $(basename "$(pwd)") != "scripts" ]]; then
    cd "$(dirname "$0")"
fi

# Function to display the script name in yellow and description in default color
echo -e "\e[33mpublish\e[0m zipping project into ../wave_petcom.zip"

# Change to the project root
cd "$ORIGINAL_DIR"

# Zip the project
zip -r ../wave_petcom.zip . -x "node_modules/*" ".git/*" "scripts/*"

# Change back to the original directory
cd "$ORIGINAL_DIR" 