#!/usr/bin/env python3
"""
腾讯云语音识别 - 最稳定的国内方案
"""
import json
import base64

# 需要腾讯云 API Key
# 免费额度: 每月5000次

def transcribe_tencent(audio_file_path, secret_id, secret_key):
    """腾讯云一句话识别"""
    from tencentcloud.common import credential
    from tencentcloud.common.profile.client_profile import ClientProfile
    from tencentcloud.common.profile.http_profile import HttpProfile
    from tencentcloud.asr.v20190614 import asr_client, models
    
    # 读取音频
    with open(audio_file_path, 'rb') as f:
        audio_data = f.read()
    
    # 转 base64
    audio_base64 = base64.b64encode(audio_data).decode('utf-8')
    
    # 认证
    cred = credential.Credential(secret_id, secret_key)
    
    # HTTP 配置
    http_profile = HttpProfile()
    http_profile.endpoint = "asr.tencentcloudapi.com"
    
    client_profile = ClientProfile()
    client_profile.httpProfile = http_profile
    
    # 创建客户端
    client = asr_client.AsrClient(cred, "", client_profile)
    
    # 请求
    req = models.SentenceRecognitionRequest()
    req.EngSerViceType = "16k_zh"
    req.SourceType = 1
    req.VoiceFormat = "mp3"
    req.Data = audio_base64
    req.DataLen = len(audio_data)
    
    # 发送请求
    resp = client.SentenceRecognition(req)
    return resp.to_json_string()

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 4:
        print("Usage: tencent_asr.py <audio.mp3> <secret_id> <secret_key>")
        sys.exit(1)
    
    result = transcribe_tencent(sys.argv[1], sys.argv[2], sys.argv[3])
    print(result)
