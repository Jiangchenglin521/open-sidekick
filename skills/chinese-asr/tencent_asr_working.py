#!/usr/bin/env python3
"""
腾讯云语音识别 - 完整可用版
使用方法: python3 tencent_asr_working.py <音频文件.ogg>
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

# 加载配置文件
CONFIG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'config.json')
if os.path.exists(CONFIG_FILE):
    with open(CONFIG_FILE, 'r') as f:
        config = json.load(f)
    SECRET_ID = config.get('tencent_asr', {}).get('secret_id', '')
    SECRET_KEY = config.get('tencent_asr', {}).get('secret_key', '')
else:
    SECRET_ID = ""
    SECRET_KEY = ""

HOST = "asr.tencentcloudapi.com"

def get_signature(secret_key, service, host, region, action, version, payload, timestamp, date):
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
    
    return f"{algorithm} Credential={SECRET_ID}/{credential_scope}, SignedHeaders={signed_headers}, Signature={signature}"

def transcribe(audio_file):
    """识别音频文件"""
    t = datetime.now(timezone.utc)
    date = t.strftime('%Y-%m-%d')
    timestamp = str(int(t.timestamp()))
    
    # 读取音频
    with open(audio_file, "rb") as f:
        audio_data = f.read()
    
    payload = {
        "EngSerViceType": "16k_zh",
        "SourceType": 1,
        "VoiceFormat": "ogg-opus",
        "Data": base64.b64encode(audio_data).decode('utf-8'),
        "DataLen": len(audio_data)
    }
    payload_json = json.dumps(payload)
    
    # 签名
    auth = get_signature(SECRET_KEY, "asr", HOST, "ap-beijing", 
                         "SentenceRecognition", "2019-06-14", payload_json, timestamp, date)
    
    # 请求头
    req_headers = {
        'Authorization': auth,
        'Content-Type': 'application/json',
        'Host': HOST,
        'X-TC-Action': 'SentenceRecognition',
        'X-TC-Version': '2019-06-14',
        'X-TC-Timestamp': timestamp,
        'X-TC-Region': 'ap-beijing'
    }
    
    # 发送请求
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    req = urllib.request.Request(f"https://{HOST}", data=payload_json.encode('utf-8'), 
                                 headers=req_headers, method='POST')
    
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=30) as response:
            result = json.loads(response.read().decode('utf-8'))
            if 'Response' in result and 'Result' in result['Response']:
                return result['Response']['Result']
            else:
                return json.dumps(result, indent=2, ensure_ascii=False)
    except urllib.error.HTTPError as e:
        return f"Error: {json.loads(e.read().decode('utf-8'))}"

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 tencent_asr_working.py <audio.ogg>")
        sys.exit(1)
    
    result = transcribe(sys.argv[1])
    print(result)
