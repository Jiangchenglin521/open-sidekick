---
name: ffmpeg
description: |
  音视频处理工具，支持转码、剪辑、合并、提取、滤镜、格式转换等操作。
  Use when: (1) 视频格式转换或压缩, (2) 音频提取或剪辑, (3) 音视频合并/分割, (4) 屏幕录制, (5) 视频截图或GIF生成。
metadata: {"clawdbot":{"emoji":"🎬","requires":{"bins":["ffmpeg"]},"os":["linux","darwin","win32"]}}
---

## Input Seeking (Major Difference)

- `-ss` BEFORE `-i`: fast seek, may be inaccurate—starts from nearest keyframe
- `-ss` AFTER `-i`: frame-accurate but slow—decodes from start
- Combine both: `-ss 00:30:00 -i input.mp4 -ss 00:00:05`—fast seek then accurate trim
- For cutting, add `-avoid_negative_ts make_zero` to fix timestamp issues

## Stream Selection

- Default: first video + first audio—may not be what you want
- Explicit selection: `-map 0:v:0 -map 0:a:1`—first video, second audio
- All streams of type: `-map 0:a`—all audio streams
- Copy specific: `-map 0 -c copy`—all streams, no re-encoding
- Exclude: `-map 0 -map -0:s`—all except subtitles

## Encoding Quality

- CRF (Constant Rate Factor): lower = better quality, larger file—18-23 typical for H.264
- `-preset`: ultrafast to veryslow—slower = smaller file at same quality
- Two-pass for target bitrate: first pass analyzes, second pass encodes
- `-crf` and `-b:v` mutually exclusive—use one or the other

## Container vs Codec

- Container (MP4, MKV, WebM): wrapper format holding streams
- Codec (H.264, VP9, AAC): compression algorithm for stream
- Not all codecs fit all containers—H.264 in MP4/MKV, not WebM; VP9 in WebM/MKV, not MP4
- Copy codec to new container: `-c copy`—fast, no quality loss

## Filter Syntax

- Simple: `-vf "scale=1280:720"`—single filter chain
- Complex: `-filter_complex "[0:v]scale=1280:720[scaled]"`—named outputs for routing
- Chain filters: `-vf "scale=1280:720,fps=30"`—comma-separated
- Filter order matters—scale before crop gives different result than crop before scale

## Common Filters

- Scale: `scale=1280:720` or `scale=-1:720` for auto-width maintaining aspect
- Crop: `crop=640:480:100:50`—width:height:x:y from top-left
- FPS: `fps=30`—change framerate
- Trim: `trim=start=10:end=20,setpts=PTS-STARTPTS`—setpts resets timestamps
- Overlay: `overlay=10:10`—position from top-left

## Audio Processing

- Sample rate: `-ar 48000`—standard for video
- Channels: `-ac 2`—stereo
- Audio codec: `-c:a aac -b:a 192k`—AAC at 192kbps
- Normalize: `-filter:a loudnorm`—EBU R128 loudness normalization
- Extract audio: `-vn -c:a copy output.m4a`—no video, copy audio

### Audio Format Conversion

Convert between common audio formats:

```bash
# OGG to MP3
ffmpeg -i input.ogg -c:a libmp3lame -q:a 2 output.mp3

# OGG to WAV
ffmpeg -i input.ogg output.wav

# MP3 to WAV
ffmpeg -i input.mp3 output.wav

# WAV to MP3
ffmpeg -i input.wav -c:a libmp3lame -b:a 192k output.mp3

# Any format to AAC
ffmpeg -i input.ogg -c:a aac -b:a 192k output.m4a
```

### Extract Audio from Video

```bash
# Copy audio stream without re-encoding (fast, no quality loss)
ffmpeg -i video.mp4 -vn -acodec copy output.aac

# Extract to MP3
ffmpeg -i video.mp4 -vn -c:a libmp3lame -q:a 2 output.mp3

# Extract to WAV (uncompressed)
ffmpeg -i video.mp4 -vn output.wav

# Extract specific audio stream (e.g., second audio track)
ffmpeg -i video.mp4 -map 0:a:1 -vn -c:a copy output.aac
```

### Audio Filter Examples

```bash
# Adjust volume (0.5 = half volume, 2.0 = double)
ffmpeg -i input.mp3 -filter:a "volume=1.5" output.mp3

# Fade in (first 3 seconds) and fade out (last 3 seconds)
ffmpeg -i input.mp3 -filter:a "afade=t=in:ss=0:d=3,afade=t=out:st=27:d=3" output.mp3

# Convert to mono
ffmpeg -i input.mp3 -ac 1 output.mp3

# Change sample rate
ffmpeg -i input.mp3 -ar 44100 output.mp3
```

## Concatenation

- Same codec/params: concat demuxer—`-f concat -safe 0 -i list.txt -c copy`
- Different formats: concat filter—`-filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1"`
- list.txt format: `file 'video1.mp4'` per line—escape special characters
- Different resolutions: scale/pad to match before concat filter

## Subtitles

- Burn-in (hardcode): `-vf "subtitles=subs.srt"`—cannot be turned off
- Mux as stream: `-c:s mov_text` (MP4) or `-c:s srt` (MKV)—user toggleable
- From input: `-map 0:s`—include subtitle streams
- Extract: `-map 0:s:0 subs.srt`—first subtitle to file

## Hardware Acceleration

- Decode: `-hwaccel cuda` or `-hwaccel videotoolbox` (macOS)
- Encode: `-c:v h264_nvenc` (NVIDIA), `-c:v h264_videotoolbox` (macOS)
- Not always faster—setup overhead; benefits show on long videos
- Quality may differ—software encoding often produces better quality

## Common Mistakes

- Forgetting `-c copy` when not re-encoding—defaults to re-encode, slow and lossy
- `-ss` after `-i` for long videos—takes forever seeking
- Audio desync after cutting—use `-async 1` or `-af aresample=async=1`
- Filter on stream copy—filters require re-encoding; `-c copy` + `-vf` = error
- Output extension doesn't set codec—`output.mp4` without `-c:v` uses default, may not be H.264

## macOS AVFoundation Device Selection

自动智能选择音频输入设备，优先使用外置设备。

### 使用脚本选择设备

```bash
# 获取推荐的音频设备
DEVICE_JSON=$(bash ~/.openclaw/workspace/skills/ffmpeg/scripts/select-device.sh audio)
DEVICE_INDEX=$(echo "$DEVICE_JSON" | grep -o '"index": "[^"]*"' | cut -d'"' -f4)
DEVICE_NAME=$(echo "$DEVICE_JSON" | grep -o '"name": "[^"]*"' | head -1 | cut -d'"' -f4)

# 使用选择的设备录音
ffmpeg -f avfoundation -i ":$DEVICE_INDEX" output.wav
```

### 选择逻辑

1. **外置设备优先** - 识别名称不含 FaceTime/Built-in/Internal 的设备
2. **内置设备兜底** - 无外置设备时选择 FaceTime/内置麦克风
3. **动态索引** - 不假设内置设备一定是索引 0

### 返回值格式

```json
{
  "index": "1",
  "name": "USB Audio Device",
  "type": "external",
  "device_type": "audio",
  "all_devices": [
    {"index": "0", "name": "Built-in Microphone", "type": "internal"},
    {"index": "1", "name": "USB Audio Device", "type": "external"}
  ]
}
```

### 内置设备识别规则

以下关键词被识别为内置设备：
- `FaceTime` - FaceTime HD Camera / FaceTime 麦克风
- `Built-in` - Built-in Microphone / Built-in Camera
- `Internal` - Internal Microphone

不含上述关键词的设备被视为外置设备，优先选择。
