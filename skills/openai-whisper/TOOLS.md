# OpenAI Whisper 语音转文字工具

## 核心用法

```bash
# 基础转录
whisper audio.mp3 --model tiny --output_format txt

# 指定输出目录
whisper audio.mp3 --output_dir /tmp/transcripts

# 中文语音
whisper audio.mp3 --language zh --model base

# 翻译为英文
whisper audio.mp3 --task translate --model small
```

## 模型选择

| 模型 | 大小 | 速度 | 适合场景 |
|------|------|------|----------|
| tiny | 39MB | 最快 | 实时、测试 |
| base | 74MB | 快 | 日常使用 |
| small | 244MB | 中等 | 高精度 |
| medium | 769MB | 慢 | 专业用途 |

## OpenClaw 集成

收到语音文件时:
1. 转换为 MP3/WAV: `ffmpeg -i voice.ogg voice.mp3`
2. 转录: `whisper voice.mp3 --model tiny --output_format txt`
3. 读取结果: `cat voice.txt`

## 首次使用

模型会自动下载到 `~/.cache/whisper/`
