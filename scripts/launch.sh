#!/bin/bash

# Save the original directory
ORIGINAL_DIR=$(pwd)

# Determine if we're in the scripts folder
if [[ $(basename "$(pwd)") != "scripts" ]]; then
    cd "$(dirname "$0")"
fi

# Function to display the script name in yellow and description in default color
echo -e "\e[33mlaunch\e[0m opening local website in browser"

# detect the OS
if grep -qEi "(Microsoft|WSL)" /proc/version &> /dev/null; then # WSL on Windows
    explorer.exe "http://localhost:2368"
elif [[ "$OSTYPE" == "darwin"* ]]; then # macOS    
    xdg-open "http://localhost:2368"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then # Linux
    open "http://localhost:2368"
else # unknown
    echo "Unsupported OS. Please open http://localhost:2368 manually."
fi

# Change back to the original directory
cd "$ORIGINAL_DIR" 