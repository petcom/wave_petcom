#!/bin/bash

# Banner
echo "====================================================="
echo "           Wave Petcom Theme CLI"
echo "====================================================="

# Check for .env file and GHOST_LOCAL_PATH
if [ ! -f ".env" ]; then
    echo "Error: .env file not found. Please create a .env file in the project root with GHOST_LOCAL_PATH set."
    exit 1
fi

source .env

if [ -z "$GHOST_LOCAL_PATH" ]; then
    echo "Error: GHOST_LOCAL_PATH is not set in .env file."
    exit 1
fi

# Function to display help
function show_help {
    echo "Usage: ./app.sh [command]"
    echo "Commands:"
    echo "  start    - Start the local Ghost server"
    echo "  stop     - Stop the local Ghost server"
    echo "  restart  - Restart the local Ghost server"
    echo "  refresh  - Update theme and restart Ghost in development mode"
    echo "  view     - Open the local Ghost site in the browser"
    echo "  publish  - Zip the project into ../wave_petcom.zip"
    echo "  help     - Show this help message"
}

# Process command
case "$1" in
    start)
        ./scripts/start.sh
        ;;
    stop)
        ./scripts/stop.sh
        ;;
    restart)
        ./scripts/restart.sh
        ;;
    refresh)
        ./scripts/refresh.sh
        ;;
    view)
        ./scripts/launch.sh
        ;;
    publish)
        ./scripts/publish.sh
        ;;
    help|"")
        show_help
        ;;
    *)
        echo "Invalid command: $1"
        show_help
        ;;
esac 