#!/bin/bash

# Save the original directory
ORIGINAL_DIR=$(pwd)

# Determine if we're in the scripts folder
if [[ $(basename "$(pwd)") != "scripts" ]]; then
    cd "$(dirname "$0")"
fi

# Function to display the script name in yellow and description in default color
echo -e "\e[33mstart\e[0m starting local Ghost server"

# Read GHOST_LOCAL_PATH from .env file
if [ -f "$ORIGINAL_DIR/.env" ]; then
    source "$ORIGINAL_DIR/.env"
else
    echo "Error: .env file not found. Please create a .env file in the project root with GHOST_LOCAL_PATH set."
    cd "$ORIGINAL_DIR"
    exit 1
fi

# Check if GHOST_LOCAL_PATH is set
if [ -z "$GHOST_LOCAL_PATH" ]; then
    echo "Error: GHOST_LOCAL_PATH is not set in .env file."
    cd "$ORIGINAL_DIR"
    exit 1
fi

# Start the local Ghost server
cd "$GHOST_LOCAL_PATH"
ghost start

# Change back to the original directory
cd "$ORIGINAL_DIR" 