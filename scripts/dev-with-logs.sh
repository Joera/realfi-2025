#!/bin/bash
# Dev server with color output and log file
# No recursion - runs pnpm parallel command directly
# Usage: ./scripts/dev-with-logs.sh

set -e

# Create logs directory if it doesn't exist
mkdir -p logs

# Log file paths
LOGFILE="logs/dev.log"
PREVIOUS_LOG="logs/dev-previous.log"

# Rotate previous log if exists
if [ -f "$LOGFILE" ]; then
    mv "$LOGFILE" "$PREVIOUS_LOG"
    echo "Rotated previous log to $PREVIOUS_LOG"
fi

echo "Starting dev servers with logging..."
echo "Current log: $LOGFILE"
echo "Previous log: $PREVIOUS_LOG"
echo "Press Ctrl+C to stop all services"

echo "🧹 Checking for existing dev processes..."
# Pre-start cleanup to ensure ports are free
pkill -9 -f "node.*main\.ts" 2>/dev/null || true
pkill -9 -f "tsx watch" 2>/dev/null || true
pkill -9 -f "vite.*--mode.*dev" 2>/dev/null || true
pkill -9 -f "node.*vite.*bin" 2>/dev/null || true
pkill -9 -f "vite.*bin/vite.js" 2>/dev/null || true

# Free up commonly used ports
command -v fuser >/dev/null 2>&1 && {
    fuser -k 8081/tcp 2>/dev/null || true
    fuser -k 7783/tcp 2>/dev/null || true
    fuser -k 9999/tcp 2>/dev/null || true
}

sleep 1  # Give time for ports to be released

# Function to cleanup child processes on exit
cleanup() {
    echo -e "\n🧹 Cleaning up dev processes..."
    
    # Kill all processes in the process group
    kill -- -$$ 2>/dev/null || true
    
    # Aggressive cleanup of any remaining dev processes
    pkill -9 -f "node.*main\.ts" 2>/dev/null || true
    pkill -9 -f "tsx watch" 2>/dev/null || true
    pkill -9 -f "vite.*--mode.*dev" 2>/dev/null || true
    pkill -9 -f "node.*vite.*bin" 2>/dev/null || true
    pkill -9 -f "vite.*bin/vite.js" 2>/dev/null || true
    pkill -9 -f "node.*pnpm.*--parallel" 2>/dev/null || true
    
    # Free up ports using fuser if available
    command -v fuser >/dev/null 2>&1 && {
        fuser -k 8081/tcp 2>/dev/null || true
        fuser -k 7783/tcp 2>/dev/null || true
        fuser -k 9999/tcp 2>/dev/null || true
        fuser -k 7784/tcp 2>/dev/null || true
        fuser -k 10000/tcp 2>/dev/null || true
    }
    
    # Alternative port cleanup using ss/kill
    for port in 8081 7783 9999 7784 10000; do
        pid=$(ss -tlnp | grep ":$port" | grep -o "pid=[0-9]*" | cut -d= -f2 | head -1)
        if [ -n "$pid" ]; then
            kill -9 "$pid" 2>/dev/null || true
        fi
    done
    
    echo "✅ Dev servers fully stopped"
    exit 0
}

# Set up trap for interrupt and termination signals
trap cleanup SIGINT SIGTERM EXIT

# Start dev servers with color support
# Using FORCE_COLOR to preserve colors in piped output
# Running the actual pnpm parallel command directly (not via npm script)
cd /home/node/code

echo "Running: pnpm --parallel -F frontend-organiser -F frontend-respondents -F nillcc-backend dev"
FORCE_COLOR=1 pnpm --parallel -F frontend-organiser -F frontend-respondents -F nillcc-backend dev 2>&1 | tee "$LOGFILE"

# Exit with the same code as the pnpm command
exit ${PIPESTATUS[0]}