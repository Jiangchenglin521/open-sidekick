#!/usr/bin/env python3
"""
腾讯云语音识别 - 完整签名版
"""
import json
import base64
import hashlib
import hmac
import time
from datetime import datetime, timezone

def sign(key, msg):
    """HMAC-SHA256 签名"""
    return hmac.new(key.encode('utf-8'), msg.encode('utf-8'), hashlib.sha256).digest()

def get_signature_key(secret_key, date_stamp, region_name, service_name):
    """生成签名密钥"""
    k_date = sign('TC3' + secret_key, date_stamp)
    k_region = sign(k_date.hex(), region_name)
    k_service = sign(k_region.hex(), service_name)
    k_signing = sign(k_service.hex(), 'tc3_request')
    return k_signing

def tencent_asr(secret_id, secret_key, audio_file):
    """
    腾讯云一句话识别
    """
    # 服务配置
    service = "asr"
    host = "asr.tencentcloudapi.com"
    region = "ap-beijing"
    action = "SentenceRecognition"
    version = "2019-06-14"
    
    # 时间戳
    t = datetime.now(timezone.utc)
    date = t.strftime('%Y-%m-%d')
    timestamp = str(int(t.timestamp()))
    
    # 读取音频
    with open(audio_file, 'rb') as f:
        audio_data = f.read()
    
    # 构建请求体
    payload = {
        "EngSerViceType": "16k_zh",
        "SourceType": 1,
        "VoiceFormat": "ogg-opus",
        "Data": base64.b64encode(audio_data).decode('utf-8'),
        "DataLen": len(audio_data)
    }
    payload_json = json.dumps(payload)
    payload_hash = hashlib.sha256(payload_json.encode('utf-8')).hexdigest()
    
    # HTTP 头
    headers = {
        'content-type': 'application/json',
        'host': host,
        'x-tc-action': action.lower(),
        'x-tc-region': region,
        'x-tc-timestamp': timestamp,
        'x-tc-version': version
    }
    
    # Canonical Headers
    signed_headers = 'content-type;host;x-tc-action;x-tc-region;x-tc-timestamp;x-tc-version'
    canonical_headers = f"content-type:{headers['content-type']}\n" \
                       f"host:{host}\n" \
                       f"x-tc-action:{action.lower()}\n" \
                       f"x-tc-region:{region}\n" \
                       f"x-tc-timestamp:{timestamp}\n" \
                       f"x-tc-version:{version}\n"
    
    # Canonical Request
    http_request_method = "POST"
    canonical_uri = "/"
    canonical_querystring = ""
    
    canonical_request = f"{http_request_method}\n" \
                       f"{canonical_uri}\n" \
                       f"{canonical_querystring}\n" \
                       f"{canonical_headers}\n" \
                       f"{signed_headers}\n" \
                       f"{payload_hash}"
    
    # String to Sign
    algorithm = "TC3-HMAC-SHA256"
    credential_scope = f"{date}/{service}/tc3_request"
    canonical_request_hash = hashlib.sha256(canonical_request.encode('utf-8')).hexdigest()
    
    string_to_sign = f"{algorithm}\n" \
                    f"{timestamp}\n" \
                    f"{credential_scope}\n" \
                    f"{canonical_request_hash}"
    
    # 计算签名
    secret_date = sign("TC3" + secret_key, date)
    secret_service = sign(secret_date.hex(), service)
    secret_signing = sign(secret_service.hex(), "tc3_request")
    signature = hmac.new(secret_signing, string_to_sign.encode('utf-8'), hashlib.sha256).hexdigest()
    
    # Authorization
    authorization = f"{algorithm} " \
                   f"Credential={secret_id}/{credential_scope}, " \
                   f"SignedHeaders={signed_headers}, " \
                   f"Signature={signature}"
    
    # 发送请求
    import urllib.request
    
    req_headers = {
        'Authorization': authorization,
        'Content-Type': 'application/json',
        'Host': host,
        'X-TC-Action': action,
        'X-TC-Version': version,
        'X-TC-Timestamp': timestamp,
        'X-TC-Region': region
    }
    
    req = urllib.request.Request(
        f"https://{host}",
        data=payload_json.encode('utf-8'),
        headers=req_headers,
        method='POST'
    )
    
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return json.loads(e.read().decode('utf-8'))

if __name__ == "__main__":
    import sys
    
    SECRET_ID = os.environ.get("TENCENT_SECRET_ID", "YOUR_SECRET_ID_HERE")
    SECRET_KEY = os.environ.get("TENCENT_SECRET_KEY", "YOUR_SECRET_KEY_HERE")
    
    # 转录第一条语音
    result = tencent_asr(SECRET_ID, SECRET_KEY, 
        "/Users/jiangchenglin/.openclaw/media/inbound/7d897011-cd7a-43b7-b057-bb846e1e86ec.ogg")
    
    print("=" * 50)
    print("语音识别结果:")
    print("=" * 50)
    
    if 'Response' in result and 'Result' in result['Response']:
        print(result['Response']['Result'])
    else:
        print(json.dumps(result, indent=2, ensure_ascii=False))
