#!/usr/bin/env python3
"""
Whisper 语音转文字工具
当 whisper 命令不可用时，提供替代方案
"""
import sys
import subprocess
import os

def convert_audio(input_path, output_path):
    """转换音频格式"""
    cmd = [
        "ffmpeg", "-i", input_path,
        "-ar", "16000", "-ac", "1",
        output_path, "-y"
    ]
    subprocess.run(cmd, capture_output=True)
    return output_path

def transcribe_dummy(audio_path):
    """
    模拟转录 - 当 whisper 不可用时提示用户
    实际使用时替换为: whisper(audio_path, model="tiny")
    """
    return """
🎙️ 语音转录功能准备就绪！

检测到语音文件: {audio_path}

当前状态: 等待 Whisper 模型安装完成...

安装命令:
  pip3 install openai-whisper

安装后使用方法:
  whisper {audio_path} --model tiny --output_format txt
""".format(audio_path=audio_path)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: transcribe.py <audio_file>")
        sys.exit(1)
    
    audio_file = sys.argv[1]
    if not os.path.exists(audio_file):
        print(f"File not found: {audio_file}")
        sys.exit(1)
    
    print(transcribe_dummy(audio_file))
