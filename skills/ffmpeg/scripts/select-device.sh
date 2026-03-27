#!/bin/bash
# select-device.sh - 智能选择 macOS AVFoundation 音频设备
# 优先选择外置设备，无外置时选择内置设备

set -e

# 获取参数
DEVICE_TYPE="${1:-audio}"  # audio 或 video

# 内置设备关键词（用于识别内置设备）
# 英文关键词 + 中文系统常见内置设备名
INTERNAL_KEYWORDS="FaceTime|Built-in|Internal|MacBook|iMac|Mac mini|Mac Studio|苹果|Built-in Microphone|Internal Microphone|Internal Mic|内置麦克风|板载麦克风"

# 外置设备关键词（用于识别外置设备）
EXTERNAL_KEYWORDS="USB Audio|USB Microphone|USB MIC|Headset|Headphones|Earphones|AirPods|Sony WH|Bose QC|Jabra|Logitech Headset|External|外置麦克风|外接麦克风|Line In|Yeti|Blue Snowball|Audio-Technica|Rode|Shure|HyperX|Razer Seiren|Elgato Wave|Scarlett|Focusrite|Behringer|PreSonus|M-Audio|Apollo|UR22|UR44|Steinberg|蓝牙|Bluetooth"

# 虚拟设备关键词（需要排除）
# 会议软件虚拟设备 + 虚拟音频驱动 + 系统/投屏输出设备
VIRTUAL_KEYWORDS="Cast Audio|Soundflower|BlackHole|Loopback|VB-Audio|Virtual|Infoflow|如流|Lark|飞书|DingTalk|钉钉|腾讯会议|VooV|ZoomAudioDevice|Zoom Audio Device|Microsoft Teams Audio Device|Teams Audio Device|Google Meet|Webex|Cisco Webex|全时会议|小鱼易连|华为云会议|网易会议|声网|Agora|iShowU Audio Capture|Audio Hijack|GroundControl|WDM|MME|HDMI Audio|Display Audio|AirPlay|隔空播放|Screen Audio|Digital Audio|S/PDIF|Null Audio|Dummy|Silent|No Device"

# 获取设备列表并解析
get_devices() {
    local type="$1"  # audio 或 video
    local ffmpeg_output
    
    # 运行 ffmpeg 获取设备列表
    ffmpeg_output=$(ffmpeg -f avfoundation -list_devices true -i "" 2>&1 || true)
    
    if [ "$type" = "audio" ]; then
        # 提取音频设备部分
        echo "$ffmpeg_output" | awk '/AVFoundation audio devices:/{found=1; next} /AVFoundation video devices:/{found=0} found'
    else
        # 提取视频设备部分
        echo "$ffmpeg_output" | awk '/AVFoundation video devices:/{found=1; next} /AVFoundation audio devices:/{found=0} found'
    fi
}

# 解析设备列表，返回设备和索引
parse_devices() {
    local device_section="$1"
    local devices=()
    
    # 解析格式：[index] Device Name
    while IFS= read -r line; do
        # 提取索引和设备名
        if [[ "$line" =~ \[([0-9]+)\][[:space:]]*(.+) ]]; then
            local idx="${BASH_REMATCH[1]}"
            local name="${BASH_REMATCH[2]}"
            # 去除可能的尾部括号内容
            name=$(echo "$name" | sed 's/[[:space:]]*(.*)$//')
            devices+=("$idx|$name")
        fi
    done <<< "$device_section"
    
    printf '%s\n' "${devices[@]}"
}

# 判断设备是否为内置设备
is_internal_device() {
    local name="$1"
    if echo "$name" | grep -iE "$INTERNAL_KEYWORDS" > /dev/null; then
        return 0  # 是内置设备
    else
        return 1  # 不是内置设备
    fi
}

# 判断设备是否为虚拟设备（需要排除）
is_virtual_device() {
    local name="$1"
    if echo "$name" | grep -iE "$VIRTUAL_KEYWORDS" > /dev/null; then
        return 0  # 是虚拟设备
    else
        return 1  # 不是虚拟设备
    fi
}

# 判断设备是否为外置设备
is_external_device() {
    local name="$1"
    if echo "$name" | grep -iE "$EXTERNAL_KEYWORDS" > /dev/null; then
        return 0  # 是外置设备
    else
        return 1  # 不是外置设备
    fi
}

# 主逻辑
main() {
    local device_section
    local devices_json="["
    local first=true
    
    # 获取设备列表
    device_section=$(get_devices "$DEVICE_TYPE")
    
    if [ -z "$device_section" ]; then
        echo '{"error":"No devices found","index":"0","name":"default","type":"unknown"}'
        exit 1
    fi
    
    # 解析所有设备
    local selected_external=""
    local selected_internal=""
    local selected_virtual=""
    local external_name=""
    local internal_name=""
    local virtual_name=""
    
    while IFS='|' read -r idx name; do
        [ -z "$idx" ] && continue
        
        # 添加到 JSON 数组
        if [ "$first" = true ]; then
            first=false
        else
            devices_json+=","
        fi
        
        # 判断设备类型
        if is_virtual_device "$name"; then
            # 虚拟设备 - 优先级最低，仅作为兜底
            devices_json+="{\"index\":\"$idx\",\"name\":\"$name\",\"type\":\"virtual\"}"
            if [ -z "$selected_virtual" ]; then
                selected_virtual="$idx"
                virtual_name="$name"
            fi
        elif is_internal_device "$name"; then
            devices_json+="{\"index\":\"$idx\",\"name\":\"$name\",\"type\":\"internal\"}"
            # 记录第一个内置设备作为备选
            if [ -z "$selected_internal" ]; then
                selected_internal="$idx"
                internal_name="$name"
            fi
        else
            devices_json+="{\"index\":\"$idx\",\"name\":\"$name\",\"type\":\"external\"}"
            # 记录第一个外置设备（优先选择）
            if [ -z "$selected_external" ]; then
                selected_external="$idx"
                external_name="$name"
            fi
        fi
    done <<< "$(parse_devices "$device_section")"
    
    devices_json+="]"
    
    # 决定使用哪个设备
    # 优先级：外置设备 > 内置设备 > 虚拟设备
    local final_index
    local final_name
    local final_type
    
    if [ -n "$selected_external" ]; then
        final_index="$selected_external"
        final_name="$external_name"
        final_type="external"
    elif [ -n "$selected_internal" ]; then
        final_index="$selected_internal"
        final_name="$internal_name"
        final_type="internal"
    elif [ -n "$selected_virtual" ]; then
        # 兜底：使用虚拟设备
        final_index="$selected_virtual"
        final_name="$virtual_name"
        final_type="virtual"
    else
        # 最终兜底方案
        final_index="0"
        final_name="default"
        final_type="unknown"
    fi
    
    # 输出 JSON
    cat << EOF
{
  "index": "$final_index",
  "name": "$final_name",
  "type": "$final_type",
  "device_type": "$DEVICE_TYPE",
  "all_devices": $devices_json
}
EOF
}

main
