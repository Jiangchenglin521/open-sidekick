#!/bin/bash
# split-audio.sh - 检查音频时长并分割长音频
# 用于处理超过腾讯云 ASR 限制（3分钟）的录音

set -e

# 配置
MAX_DURATION=180          # 腾讯云限制：3分钟 = 180秒
SEGMENT_DURATION=170      # 每段时长：2分50秒 = 170秒（留10秒缓冲）

# 获取参数
AUDIO_FILE="$1"
OUTPUT_DIR="${2:-$(dirname "$AUDIO_FILE")}"

# 检查参数
if [ -z "$AUDIO_FILE" ]; then
    echo '{"error":"Usage: split-audio.sh <audio-file> [output-dir]"}'
    exit 1
fi

if [ ! -f "$AUDIO_FILE" ]; then
    echo "{\"error\":\"File not found: $AUDIO_FILE\"}"
    exit 1
fi

# 获取音频时长（秒）
get_duration() {
    local file="$1"
    ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$file" 2>/dev/null | cut -d. -f1
}

# 分割音频
split_audio() {
    local input="$1"
    local output_dir="$2"
    local duration="$3"
    local basename=$(basename "$input" | sed 's/\.[^.]*$//')
    local ext="${input##*.}"
    
    # 创建分割输出目录
    local split_dir="$output_dir/${basename}_split"
    mkdir -p "$split_dir"
    
    # 计算分割段数
    local segments=$(( (duration + SEGMENT_DURATION - 1) / SEGMENT_DURATION ))
    
    local segment_files=()
    
    for i in $(seq 0 $((segments - 1))); do
        local start_time=$((i * SEGMENT_DURATION))
        local output_file="$split_dir/${basename}_part$(printf "%03d" $i).$ext"
        
        # 使用 ffmpeg 分割（重新编码确保精确切割）
        ffmpeg -y -i "$input" -ss "$start_time" -t "$SEGMENT_DURATION" -c:a libopus -b:a 32k -ar 16000 "$output_file" 2>/dev/null
        
        if [ -f "$output_file" ]; then
            segment_files+=("$output_file")
        fi
    done
    
    # 输出 JSON
    local files_json="["
    local first=true
    for f in "${segment_files[@]}"; do
        if [ "$first" = true ]; then
            first=false
        else
            files_json+=","
        fi
        files_json+="\"$f\""
    done
    files_json+="]"
    
    cat << EOF
{
  "split": true,
  "original_file": "$input",
  "split_dir": "$split_dir",
  "total_duration": $duration,
  "segment_duration": $SEGMENT_DURATION,
  "segment_count": ${#segment_files[@]},
  "segment_files": $files_json
}
EOF
}

# 主逻辑
main() {
    local duration
    duration=$(get_duration "$AUDIO_FILE")
    
    if [ -z "$duration" ] || [ "$duration" -eq 0 ]; then
        echo "{\"error\":\"Failed to get audio duration\"}"
        exit 1
    fi
    
    # 检查是否需要分割
    if [ "$duration" -le "$MAX_DURATION" ]; then
        # 不需要分割
        cat << EOF
{
  "split": false,
  "original_file": "$AUDIO_FILE",
  "duration": $duration,
  "message": "Audio duration within limit, no splitting needed"
}
EOF
    else
        # 需要分割
        split_audio "$AUDIO_FILE" "$OUTPUT_DIR" "$duration"
    fi
}

main
