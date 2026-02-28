#!/usr/bin/env python3
"""
腾讯云语音识别 Skill
Chinese ASR using Tencent Cloud
"""

from .asr import transcribe, load_config

__version__ = "1.0.0"
__all__ = ["transcribe", "load_config"]
