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
DEVICE_NAME=""
DEVICE_TYPE=""

case "$OS" in
    Darwin)
        # macOS - 使用智能设备选择
        FFMPEG_SKILL_DIR="$HOME/.openclaw/workspace/skills/ffmpeg-1.0.0"
        if [ -f "$FFMPEG_SKILL_DIR/scripts/select-device.sh" ]; then
            # 获取智能选择的设备
            DEVICE_JSON=$("$FFMPEG_SKILL_DIR/scripts/select-device.sh" audio)
            DEVICE_INDEX=$(echo "$DEVICE_JSON" | grep -o '"index": "[^"]*"' | cut -d'"' -f4)
            DEVICE_NAME=$(echo "$DEVICE_JSON" | grep -o '"name": "[^"]*"' | head -1 | cut -d'"' -f4)
            DEVICE_TYPE=$(echo "$DEVICE_JSON" | grep -o '"type": "[^"]*"' | head -1 | cut -d'"' -f4)
            INPUT_DEVICE=":$DEVICE_INDEX"
        else
            # 兜底方案：使用默认索引
            INPUT_DEVICE=":0"
            DEVICE_NAME="Default"
            DEVICE_TYPE="unknown"
        fi
        ;;
    Linux)
        # Linux - try pulseaudio or alsa
        if command -v pactl &> /dev/null; then
            INPUT_DEVICE="default"
        else
            INPUT_DEVICE="hw:0"
        fi
        DEVICE_NAME="Linux Audio"
        DEVICE_TYPE="unknown"
        ;;
    *)
        INPUT_DEVICE="default"
        DEVICE_NAME="Default"
        DEVICE_TYPE="unknown"
        ;;
esac

echo "🎤 Starting recording..."
echo "   Meeting: $MEETING_NAME"
echo "   Date: $DATE"
echo "   Output: $AUDIO_FILE"

# 显示设备信息
if [ -n "$DEVICE_NAME" ] && [ "$OS" = "Darwin" ]; then
    if [ "$DEVICE_TYPE" = "external" ]; then
        echo "   设备: 🎧 $DEVICE_NAME (外置)"
    elif [ "$DEVICE_TYPE" = "internal" ]; then
        echo "   设备: 🎤 $DEVICE_NAME (内置)"
    else
        echo "   设备: $DEVICE_NAME"
    fi
fi

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
