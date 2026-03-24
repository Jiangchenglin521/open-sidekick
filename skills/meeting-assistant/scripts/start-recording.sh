#!/bin/bash
# Start real-time audio recording using ffmpeg
# Usage: start-recording.sh <date> <meeting-name>

set -e

DATE="${1:-$(date +%Y-%m-%d)}"
MEETING_NAME="${2:-meeting-$(date +%H%M%S)}"
WORKSPACE_DIR="${OPENCLAW_WORKSPACE:-$HOME/.openclaw/workspace}"
MEETING_DIR="$WORKSPACE_DIR/meetings/$DATE/$MEETING_NAME"
PID_FILE="$MEETING_DIR/.recording.pid"
SESSION_FILE="$MEETING_DIR/.session.json"

# Create directory
mkdir -p "$MEETING_DIR"

# Audio settings
AUDIO_FORMAT="ogg"
AUDIO_FILE="$MEETING_DIR/recording.$AUDIO_FORMAT"
SAMPLE_RATE=16000
CHANNELS=1

# Detect OS and set input device
OS=$(uname -s)
case "$OS" in
    Darwin)
        # macOS - use default audio input
        INPUT_DEVICE=":0"
        ;;
    Linux)
        # Linux - try pulseaudio or alsa
        if command -v pactl &> /dev/null; then
            INPUT_DEVICE="default"
        else
            INPUT_DEVICE="hw:0"
        fi
        ;;
    *)
        INPUT_DEVICE="default"
        ;;
esac

echo "🎤 Starting recording..."
echo "   Meeting: $MEETING_NAME"
echo "   Date: $DATE"
echo "   Output: $AUDIO_FILE"

# Start ffmpeg recording in background
ffmpeg -f avfoundation -i "$INPUT_DEVICE" \
    -ar $SAMPLE_RATE \
    -ac $CHANNELS \
    -c:a libopus \
    -b:a 32k \
    -application voip \
    "$AUDIO_FILE" \
    &

FFMPEG_PID=$!

# Save PID and session info
echo $FFMPEG_PID > "$PID_FILE"

cat > "$SESSION_FILE" << EOF
{
  "id": "$(uuidgen 2>/dev/null || date +%s%N)",
  "startTime": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "mode": "recording",
  "meetingName": "$MEETING_NAME",
  "date": "$DATE",
  "audioPath": "$AUDIO_FILE",
  "pid": $FFMPEG_PID,
  "preferences": {
    "noMindmap": false,
    "minutesOnly": false,
    "outputFormat": "markdown"
  }
}
EOF

echo "✅ Recording started (PID: $FFMPEG_PID)"
echo "   To stop: stop-recording.sh $DATE $MEETING_NAME"
