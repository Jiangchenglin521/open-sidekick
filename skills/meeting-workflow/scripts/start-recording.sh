#!/bin/bash
# Start real-time audio recording using ffmpeg with device warm-up detection
# Usage: start-recording.sh <date> <meeting-name>

set -e

DATE="${1:-$(date +%Y-%m-%d)}"
MEETING_NAME="${2:-meeting-$(date +%H%M%S)}"
WORKSPACE_DIR="${OPENCLAW_WORKSPACE:-$HOME/.openclaw/workspace}"
MEETING_DIR="$WORKSPACE_DIR/meetings/$DATE/$MEETING_NAME"
PID_FILE="$MEETING_DIR/.recording.pid"
SESSION_FILE="$MEETING_DIR/.session.json"

# Audio settings
AUDIO_FORMAT="ogg"
AUDIO_FILE="$MEETING_DIR/recording.$AUDIO_FORMAT"
SAMPLE_RATE=16000
CHANNELS=1
WARMUP_DURATION=10
SILENCE_THRESHOLD=-80  # dB

# Create directory
mkdir -p "$MEETING_DIR"

# Detect OS and set input device
OS=$(uname -s)
DEVICE_NAME=""
DEVICE_TYPE=""
DEVICE_INDEX=""

get_device_info() {
    local prefer_internal="${1:-false}"
    
    case "$OS" in
        Darwin)
            FFMPEG_SKILL_DIR="$HOME/.openclaw/workspace/skills/ffmpeg"
            if [ -f "$FFMPEG_SKILL_DIR/scripts/select-device.sh" ]; then
                if [ "$prefer_internal" = "true" ]; then
                    # 强制选择内置设备：从列表中找第一个内置设备
                    DEVICE_JSON=$("$FFMPEG_SKILL_DIR/scripts/select-device.sh" audio)
                    # 从 all_devices 中提取第一个 internal 设备
                    DEVICE_INDEX=$(echo "$DEVICE_JSON" | grep -o '"index": "[0-9]*"' | grep -A1 '"type": "internal"' | head -1 | cut -d'"' -f4)
                    DEVICE_NAME=$(echo "$DEVICE_JSON" | grep -o '"name": "[^"]*"' | grep -A1 '"type": "internal"' | head -1 | cut -d'"' -f4)
                    DEVICE_TYPE="internal"
                    # 如果没找到内置设备，使用默认选择
                    if [ -z "$DEVICE_INDEX" ]; then
                        DEVICE_INDEX=$(echo "$DEVICE_JSON" | grep -o '"index": "[^"]*"' | head -1 | cut -d'"' -f4)
                        DEVICE_NAME=$(echo "$DEVICE_JSON" | grep -o '"name": "[^"]*"' | head -1 | cut -d'"' -f4)
                        DEVICE_TYPE=$(echo "$DEVICE_JSON" | grep -o '"type": "[^"]*"' | head -1 | cut -d'"' -f4)
                    fi
                else
                    DEVICE_JSON=$("$FFMPEG_SKILL_DIR/scripts/select-device.sh" audio)
                    DEVICE_INDEX=$(echo "$DEVICE_JSON" | grep -o '"index": "[^"]*"' | head -1 | cut -d'"' -f4)
                    DEVICE_NAME=$(echo "$DEVICE_JSON" | grep -o '"name": "[^"]*"' | head -1 | cut -d'"' -f4)
                    DEVICE_TYPE=$(echo "$DEVICE_JSON" | grep -o '"type": "[^"]*"' | head -1 | cut -d'"' -f4)
                fi
                INPUT_DEVICE=":$DEVICE_INDEX"
            else
                INPUT_DEVICE=":0"
                DEVICE_NAME="Default"
                DEVICE_TYPE="unknown"
                DEVICE_INDEX="0"
            fi
            ;;
        Linux)
            if command -v pactl &> /dev/null; then
                INPUT_DEVICE="default"
            else
                INPUT_DEVICE="hw:0"
            fi
            DEVICE_NAME="Linux Audio"
            DEVICE_TYPE="unknown"
            DEVICE_INDEX="0"
            ;;
        *)
            INPUT_DEVICE="default"
            DEVICE_NAME="Default"
            DEVICE_TYPE="unknown"
            DEVICE_INDEX="0"
            ;;
    esac
}

# 检测音频音量
check_audio_volume() {
    local audio_file="$1"
    local mean_volume
    
    mean_volume=$(ffmpeg -i "$audio_file" -af "volumedetect" -f null - 2>&1 | grep "mean_volume" | awk -F': ' '{print $2}' | cut -d' ' -f1)
    echo "$mean_volume"
}

# 录制预热音频
record_warmup() {
    local output_file="$1"
    ffmpeg -f avfoundation -i "$INPUT_DEVICE" \
        -t $WARMUP_DURATION \
        -ar $SAMPLE_RATE \
        -ac $CHANNELS \
        -c:a libopus \
        -b:a 32k \
        -application voip \
        "$output_file" 2>/dev/null
}

# 启动长时间录制
start_long_recording() {
    local output_file="$1"
    
    ffmpeg -f avfoundation -i "$INPUT_DEVICE" \
        -ar $SAMPLE_RATE \
        -ac $CHANNELS \
        -c:a libopus \
        -b:a 32k \
        -application voip \
        "$output_file" \
        2>/dev/null &
    
    echo $!
}

# 主录制流程
main_recording() {
    local is_fallback="${1:-false}"
    
    # 获取设备信息
    get_device_info "$is_fallback"
    
    echo "🎤 Starting recording..."
    echo "   Meeting: $MEETING_NAME"
    echo "   Date: $DATE"
    echo "   Output: $AUDIO_FILE"
    
    # 显示设备信息
    if [ -n "$DEVICE_NAME" ] && [ "$OS" = "Darwin" ]; then
        if [ "$is_fallback" = "true" ]; then
            echo "   设备: 🎤 $DEVICE_NAME (内置-回退)"
        elif [ "$DEVICE_TYPE" = "external" ]; then
            echo "   设备: 🎧 $DEVICE_NAME (外置)"
        elif [ "$DEVICE_TYPE" = "internal" ]; then
            echo "   设备: 🎤 $DEVICE_NAME (内置)"
        else
            echo "   设备: $DEVICE_NAME"
        fi
    fi
    
    # 步骤1: 录制10秒预热音频
    echo "   预热检测中... (${WARMUP_DURATION}秒)"
    WARMUP_FILE="$MEETING_DIR/.warmup.ogg"
    record_warmup "$WARMUP_FILE"
    
    # 步骤2: 立即开启长时间录制（后台）
    LONG_RECORDING_FILE="$MEETING_DIR/.recording_long.ogg"
    FFMPEG_PID=$(start_long_recording "$LONG_RECORDING_FILE")
    echo $FFMPEG_PID > "$PID_FILE"
    
    echo "   长时间录制已启动 (PID: $FFMPEG_PID)"
    
    # 步骤3: 异步检测预热音频音量
    echo "   检测音频输入..."
    MEAN_VOLUME=$(check_audio_volume "$WARMUP_FILE")
    echo "   平均音量: ${MEAN_VOLUME}dB"
    
    # 步骤4: 判断音量是否达标
    # 使用 bc 比较浮点数
    IS_SILENT=$(echo "$MEAN_VOLUME < $SILENCE_THRESHOLD" | bc -l)
    
    if [ "$IS_SILENT" -eq 1 ]; then
        # 静音，需要回退
        echo "   ⚠️ 设备无音频输入，切换到内置设备..."
        
        # 停止长时间录制
        if kill -2 "$FFMPEG_PID" 2>/dev/null; then
            wait "$FFMPEG_PID" 2>/dev/null || true
        fi
        
        # 删除失败的录音文件
        rm -f "$WARMUP_FILE" "$LONG_RECORDING_FILE" "$PID_FILE"
        
        # 如果是已经回退过还是失败，报错退出
        if [ "$is_fallback" = "true" ]; then
            echo "   ❌ 内置设备也无法录制，请检查麦克风设置"
            exit 1
        fi
        
        # 使用内置设备重新录制
        echo ""
        main_recording "true"
        return
    fi
    
    # 步骤5: 音量正常，保留预热音频
    echo "   ✅ 音频检测通过"
    
    # 将预热音频复制为正式录音文件的开头
    cp "$WARMUP_FILE" "$AUDIO_FILE"
    rm -f "$WARMUP_FILE"
    
    # 更新session文件
    cat > "$SESSION_FILE" << EOF
{
  "id": "$(uuidgen 2>/dev/null || date +%s%N)",
  "startTime": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "mode": "recording",
  "meetingName": "$MEETING_NAME",
  "date": "$DATE",
  "audioPath": "$AUDIO_FILE",
  "longRecordingPath": "$LONG_RECORDING_FILE",
  "pid": $FFMPEG_PID,
  "deviceName": "$DEVICE_NAME",
  "deviceType": "$DEVICE_TYPE",
  "isFallback": $is_fallback,
  "preferences": {
    "noMindmap": false,
    "minutesOnly": false,
    "outputFormat": "markdown"
  }
}
EOF
    
    echo ""
    echo "✅ Recording started (PID: $FFMPEG_PID)"
    echo "   预热音频已保留 (${WARMUP_DURATION}秒)"
    echo "   长时间录制进行中..."
    echo "   To stop: stop-recording.sh $DATE $MEETING_NAME"
}

# 启动录制
main_recording