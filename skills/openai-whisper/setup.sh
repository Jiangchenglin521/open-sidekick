#!/bin/bash
# Whisper 本地语音转文字技能安装脚本
# 自动安装依赖并下载模型

set -e

echo "🎙️ 安装 OpenAI Whisper 本地语音识别..."

# 检查 ffmpeg
if ! command -v ffmpeg &> /dev/null; then
    echo "📦 安装 ffmpeg..."
    brew install ffmpeg
fi

# 安装 Python 包
echo "📦 安装 Python whisper..."
pip3 install openai-whisper

# 创建模型缓存目录
mkdir -p ~/.cache/whisper

echo "✅ Whisper 安装完成！"
echo ""
echo "使用方法:"
echo "  whisper /path/to/audio.mp3 --model tiny --output_format txt"
echo ""
echo "模型大小对比:"
echo "  tiny    - 39MB  (最快，适合实时)"
echo "  base    - 74MB  (平衡)"  
echo "  small   - 244MB (更准)"
echo "  medium  - 769MB (高精度)"
