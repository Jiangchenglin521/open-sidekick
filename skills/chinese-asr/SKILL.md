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

## 安装

```bash
# 克隆到 skills 目录
cd ~/.openclaw/workspace/skills
git clone <repo-url> chinese-asr
```

## 配置

复制示例配置并填入密钥：

```bash
cp config.example.json config.json
# 编辑 config.json，填入你的腾讯云密钥
```

`config.json`:
```json
{
  "tencent_asr": {
    "secret_id": "AKIDxxxxxxxx",
    "secret_key": "xxxxxxxx"
  }
}
```

获取密钥：https://console.cloud.tencent.com/cam/capi

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
| `config.json` | 密钥配置文件（**勿提交到Git**） |
| `config.example.json` | 配置示例 |
| `deprecated/` | 旧版本存档 |

## 安全提示

⚠️ `config.json` 包含敏感密钥，已添加 `.gitignore` 保护，请勿手动提交到代码仓库。

## 许可证

MIT
