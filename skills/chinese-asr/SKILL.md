---
name: chinese-asr
description: 腾讯云语音识别 - 中文语音转文字
metadata:
  {
    "openclaw":
      {
        "emoji": "🎤",
      },
  }
---

# Chinese ASR - 腾讯云语音识别

将中文语音（ogg-opus格式）转换为文字。

## 配置

1. 创建 `config.json` 文件（已创建）：
```json
{
  "tencent_asr": {
    "secret_id": "你的SecretId",
    "secret_key": "你的SecretKey"
  }
}
```

2. 获取腾讯云 API Key：
   - 访问 https://console.cloud.tencent.com/cam/capi
   - 新建密钥获取 `SecretId` 和 `SecretKey`

## 使用方法

```bash
python3 tencent_asr_working.py <音频文件.ogg>
```

## 示例

```bash
python3 tencent_asr_working.py /path/to/voice.ogg
# 输出：帮我看看今天AI圈儿都发生了什么大事儿
```

## 支持的格式

- ogg-opus（飞书语音默认格式）
- 其他格式可先使用 audio-tools 技能转换

## 文件说明

- `tencent_asr_working.py` - 主脚本，从 config.json 读取配置
- `config.json` - API 密钥配置文件（已脱敏）
- `tencent_asr.py` - 旧版（硬编码，已废弃）
- `tencent_asr_full.py` - 旧版（硬编码，已废弃）
