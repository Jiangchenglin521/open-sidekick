#!/usr/bin/env python3
"""
腾讯云语音识别 - 中文语音转文字
Chinese ASR using Tencent Cloud

用法:
    python3 asr.py <音频文件>
    python3 -c "from asr import transcribe; print(transcribe('audio.ogg'))"
"""

import json
import base64
import hashlib
import hmac
import ssl
import urllib.request
import sys
import os
from datetime import datetime, timezone
from pathlib import Path

# 配置路径
CONFIG_PATH = Path(__file__).parent / "config.json"


def load_config():
    """加载配置"""
    if not CONFIG_PATH.exists():
        return None
    with open(CONFIG_PATH, 'r') as f:
        return json.load(f)


def get_signature(secret_id, secret_key, service, host, region, action, version, payload, timestamp, date):
    """TC3-HMAC-SHA256 签名"""
    def hmac_sha256(key, msg):
        return hmac.new(key, msg.encode('utf-8'), hashlib.sha256).digest()
    
    content_type = "application/json"
    signed_headers = "content-type;host;x-tc-action;x-tc-region;x-tc-timestamp;x-tc-version"
    canonical_headers = (
        f"content-type:{content_type}\nhost:{host}\nx-tc-action:{action.lower()}\n"
        f"x-tc-region:{region}\nx-tc-timestamp:{timestamp}\nx-tc-version:{version}\n"
    )
    payload_hash = hashlib.sha256(payload.encode('utf-8')).hexdigest()
    canonical_request = f"POST\n/\n\n{canonical_headers}\n{signed_headers}\n{payload_hash}"
    
    algorithm = "TC3-HMAC-SHA256"
    credential_scope = f"{date}/{service}/tc3_request"
    canonical_request_hash = hashlib.sha256(canonical_request.encode('utf-8')).hexdigest()
    string_to_sign = f"{algorithm}\n{timestamp}\n{credential_scope}\n{canonical_request_hash}"
    
    secret_date = hmac_sha256(("TC3" + secret_key).encode('utf-8'), date)
    secret_service = hmac_sha256(secret_date, service)
    secret_signing = hmac_sha256(secret_service, "tc3_request")
    signature = hmac.new(secret_signing, string_to_sign.encode('utf-8'), hashlib.sha256).hexdigest()
    
    return f"{algorithm} Credential={secret_id}/{credential_scope}, SignedHeaders={signed_headers}, Signature={signature}"


def transcribe(audio_path: str, secret_id: str = None, secret_key: str = None) -> str:
    """
    语音转文字
    
    参数:
        audio_path: 音频文件路径 (.ogg/.mp3/.wav)
        secret_id: 可选，腾讯云 SecretId
        secret_key: 可选，腾讯云 SecretKey
    
    返回:
        转录文字，失败返回错误信息
    """
    # 加载配置
    if not secret_id or not secret_key:
        config = load_config()
        if not config:
            return "[错误: 未找到 config.json，请先配置密钥]"
        secret_id = config.get('tencent_asr', {}).get('secret_id', '')
        secret_key = config.get('tencent_asr', {}).get('secret_key', '')
        if not secret_id or not secret_key:
            return "[错误: config.json 中缺少 secret_id 或 secret_key]"
    
    # 检查文件
    if not os.path.exists(audio_path):
        return f"[错误: 文件不存在 {audio_path}]"
    
    # 读取音频
    with open(audio_path, 'rb') as f:
        audio_data = f.read()
    
    audio_b64 = base64.b64encode(audio_data).decode('utf-8')
    audio_len = len(audio_data)
    
    # 判断格式
    if audio_path.endswith('.ogg'):
        voice_format = "ogg-opus"
    elif audio_path.endswith('.mp3'):
        voice_format = "mp3"
    elif audio_path.endswith('.wav'):
        voice_format = "wav"
    else:
        voice_format = "pcm"
    
    # 构建请求
    timestamp = int(datetime.now(timezone.utc).timestamp())
    date = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    
    payload = json.dumps({
        "EngSerViceType": "16k_zh",
        "SourceType": 1,
        "VoiceFormat": voice_format,
        "Data": audio_b64,
        "DataLen": audio_len
    })
    
    host = "asr.tencentcloudapi.com"
    service = "asr"
    region = "ap-beijing"
    action = "SentenceRecognition"
    version = "2019-06-14"
    
    authorization = get_signature(secret_id, secret_key, service, host, region, action, version, payload, timestamp, date)
    
    headers = {
        "Host": host,
        "X-TC-Action": action,
        "X-TC-Version": version,
        "X-TC-Timestamp": str(timestamp),
        "X-TC-Region": region,
        "Content-Type": "application/json",
        "Authorization": authorization
    }
    
    # 发送请求
    try:
        # 修复 macOS SSL 证书问题
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        
        request = urllib.request.Request(f"https://{host}", data=payload.encode('utf-8'), headers=headers, method='POST')
        with urllib.request.urlopen(request, context=ctx, timeout=30) as response:
            result = json.loads(response.read().decode('utf-8'))
            
            if 'Response' in result and 'Error' in result['Response']:
                error = result['Response']['Error']
                return f"[ASR错误: {error.get('Message', '未知错误')}]"
            
            text = result.get('Response', {}).get('Result', '')
            return text if text else "[无识别结果]"
            
    except Exception as e:
        return f"[请求错误: {str(e)}]"


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python3 asr.py <音频文件>")
        print("示例: python3 asr.py voice.ogg")
        sys.exit(1)
    
    result = transcribe(sys.argv[1])
    print(result)
