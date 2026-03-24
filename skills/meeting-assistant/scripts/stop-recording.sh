#!/bin/bash
# Stop audio recording
# Usage: stop-recording.sh <date> <meeting-name>

set -e

DATE="${1:-$(date +%Y-%m-%d)}"
MEETING_NAME="${2:-meeting}"
WORKSPACE_DIR="${OPENCLAW_WORKSPACE:-$HOME/.openclaw/workspace}"
MEETING_DIR="$WORKSPACE_DIR/meetings/$DATE/$MEETING_NAME"
PID_FILE="$MEETING_DIR/.recording.pid"
SESSION_FILE="$MEETING_DIR/.session.json"

if [[ ! -f "$PID_FILE" ]]; then
    echo "❌ No active recording found for: $DATE/$MEETING_NAME"
    exit 1
fi

FFMPEG_PID=$(cat "$PID_FILE")

echo "🛑 Stopping recording (PID: $FFMPEG_PID)..."

# Gracefully stop ffmpeg
if kill -2 "$FFMPEG_PID" 2>/dev/null; then
    # Wait for ffmpeg to finish
    wait "$FFMPEG_PID" 2>/dev/null || true
    echo "✅ Recording stopped gracefully"
else
    echo "⚠️ Process not found, may have already stopped"
fi

# Update session file
if [[ -f "$SESSION_FILE" ]]; then
    END_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    TMP_FILE=$(mktemp)
    jq --arg endTime "$END_TIME" '.endTime = $endTime | .mode = "completed"' "$SESSION_FILE" > "$TMP_FILE"
    mv "$TMP_FILE" "$SESSION_FILE"
fi

# Clean up PID file
rm -f "$PID_FILE"

# Find the recorded file
AUDIO_FILE=$(find "$MEETING_DIR" -name "recording.*" -type f | head -1)

if [[ -f "$AUDIO_FILE" ]]; then
    FILE_SIZE=$(du -h "$AUDIO_FILE" | cut -f1)
    DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$AUDIO_FILE" 2>/dev/null | cut -d. -f1)
    echo "📁 Recording saved:"
    echo "   File: $AUDIO_FILE"
    echo "   Size: $FILE_SIZE"
    echo "   Duration: ${DURATION}s"
    echo "$AUDIO_FILE"
else
    echo "❌ Recording file not found"
    exit 1
fi
