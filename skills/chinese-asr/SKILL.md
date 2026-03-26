---
name: chinese-asr
description: 腾讯云语音识别 - 中文语音转文字。支持多种格式：ogg-opus、mp3、wav，实时转录，响应快速。需要配置 tencent_asr 密钥。
---

# Chinese ASR 🎤

腾讯云语音识别，支持中文语音转文字。

## 功能

- 🎯 中文语音转文字
- 🔊 支持多种格式：ogg-opus、mp3、wav
- ⚡ 实时转录，响应快速

## 配置

在统一配置文件 `~/.openclaw/workspace/.env` 中设置腾讯云密钥：

```bash
# 腾讯云语音识别配置
TENCENT_SECRET_ID=AKIDxxxxxxxx
TENCENT_SECRET_KEY=xxxxxxxx
```

获取密钥：https://console.cloud.tencent.com/cam/capi

**注意**：不再使用 `config.json`，请迁移到统一 `.env` 文件。

## 使用

### 命令行

```bash
python3 asr.py voice.ogg
```

### Python 导入

```python
from asr import transcribe
text = transcribe("voice.ogg")
print(text)
```

### 指定密钥（可选）

```python
from asr import transcribe
text = transcribe("voice.ogg", 
                  secret_id="AKIDxxx", 
                  secret_key="xxx")
```

## 文件说明

| 文件 | 说明 |
|------|------|
| `asr.py` | 主程序，语音转文字 |
| `~/.openclaw/workspace/.env` | **统一配置文件**（存放密钥） |
| `config.json` | ⚠️ 已弃用，请迁移到 .env |
| `config.example.json` | 配置示例 |
| `deprecated/` | 旧版本存档 |

## 安全提示

⚠️ 密钥存储在 `~/.openclaw/workspace/.env` 中，该文件已添加 `.gitignore` 保护，请勿手动提交到代码仓库。

## 许可证

MIT
