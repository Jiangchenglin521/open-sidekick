#!/bin/bash
# Stop audio recording and merge warmup + long recording
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

# 获取长时间录音文件路径
LONG_RECORDING_FILE=""
if [[ -f "$SESSION_FILE" ]]; then
    LONG_RECORDING_FILE=$(cat "$SESSION_FILE" | grep -o '"longRecordingPath": "[^"]*"' | cut -d'"' -f4)
fi

# 获取主要录音文件路径
AUDIO_FILE=""
if [[ -f "$SESSION_FILE" ]]; then
    AUDIO_FILE=$(cat "$SESSION_FILE" | grep -o '"audioPath": "[^"]*"' | cut -d'"' -f4)
fi

# 停止 ffmpeg
if kill -2 "$FFMPEG_PID" 2>/dev/null; then
    wait "$FFMPEG_PID" 2>/dev/null || true
    echo "✅ Recording stopped gracefully"
else
    echo "⚠️ Process not found, may have already stopped"
fi

# 合并预热音频和长时间录音
if [[ -f "$AUDIO_FILE" && -f "$LONG_RECORDING_FILE" ]]; then
    echo "   合并录音文件..."
    
    # 创建合并列表文件
    CONCAT_LIST="$MEETING_DIR/.concat_list.txt"
    echo "file '$AUDIO_FILE'" > "$CONCAT_LIST"
    echo "file '$LONG_RECORDING_FILE'" >> "$CONCAT_LIST"
    
    # 合并音频
    MERGED_FILE="$MEETING_DIR/recording_merged.ogg"
    ffmpeg -f concat -safe 0 -i "$CONCAT_LIST" -c copy "$MERGED_FILE" 2>/dev/null
    
    # 替换原始文件
    mv "$MERGED_FILE" "$AUDIO_FILE"
    rm -f "$LONG_RECORDING_FILE" "$CONCAT_LIST"
    
    echo "   预热音频 + 长时间录音已合并"
fi

# Update session file
if [[ -f "$SESSION_FILE" ]]; then
    END_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    TMP_FILE=$(mktemp)
    jq --arg endTime "$END_TIME" '.endTime = $endTime | .mode = "completed" | del(.longRecordingPath)' "$SESSION_FILE" > "$TMP_FILE"
    mv "$TMP_FILE" "$SESSION_FILE"
fi

# Clean up PID file
rm -f "$PID_FILE"

# Find and report the recorded file
if [[ -f "$AUDIO_FILE" ]]; then
    FILE_SIZE=$(du -h "$AUDIO_FILE" | cut -f1)
    DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$AUDIO_FILE" 2>/dev/null | cut -d. -f1)
    echo "📁 Recording saved:"
    echo "   File: $AUDIO_FILE"
    echo "   Size: $FILE_SIZE"
    echo "   Duration: ${DURATION}s"
    echo "$AUDIO_FILE"
else
    # 尝试查找任何录音文件
    AUDIO_FILE=$(find "$MEETING_DIR" -name "*.ogg" -type f | head -1)
    if [[ -f "$AUDIO_FILE" ]]; then
        FILE_SIZE=$(du -h "$AUDIO_FILE" | cut -f1)
        DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$AUDIO_FILE" 2>/dev/null | cut -d. -f1 || echo "0")
        echo "📁 Recording saved:"
        echo "   File: $AUDIO_FILE"
        echo "   Size: $FILE_SIZE"
        echo "   Duration: ${DURATION}s"
        echo "$AUDIO_FILE"
    else
        echo "❌ Recording file not found"
        exit 1
    fi
fi