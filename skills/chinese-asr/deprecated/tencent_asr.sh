#!/bin/bash
# 腾讯云语音识别 - curl 版

SECRET_ID="${TENCENT_SECRET_ID:-YOUR_SECRET_ID_HERE}"
SECRET_KEY="${TENCENT_SECRET_KEY:-YOUR_SECRET_KEY_HERE}"

# 读取音频文件
AUDIO_FILE="/Users/jiangchenglin/.openclaw/media/inbound/7d897011-cd7a-43b7-b057-bb846e1e86ec.ogg"
AUDIO_B64=$(base64 -i "$AUDIO_FILE" | tr -d '\n')
AUDIO_LEN=$(stat -f%z "$AUDIO_FILE")

# 时间戳
TIMESTAMP=$(date +%s)
DATE=$(date -u +%Y-%m-%d)

# 构建 JSON
JSON_DATA=$(cat <<EOF
{
  "EngSerViceType": "16k_zh",
  "SourceType": 1,
  "VoiceFormat": "ogg-opus",
  "Data": "${AUDIO_B64}",
  "DataLen": ${AUDIO_LEN}
}
EOF
)

# 发送请求
curl -s -k https://asr.tencentcloudapi.com \
  -H "Content-Type: application/json" \
  -H "X-TC-Action: SentenceRecognition" \
  -H "X-TC-Version: 2019-06-14" \
  -H "X-TC-Timestamp: $TIMESTAMP" \
  -H "X-TC-Region: ap-beijing" \
  -d "$JSON_DATA"
