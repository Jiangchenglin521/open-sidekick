# 学习笔记：语音转文字技能开发

## 目标
让 AI 助手能够听懂语音消息

## 探索过程

### 方案1: 本地 Whisper (当前)
- ✅ 优点: 免费、隐私好、不依赖网络
- ❌ 缺点: 需要安装 torch (2GB+)，首次很慢
- 📦 依赖: ffmpeg, python3, torch, whisper

### 方案2: OpenAI API (放弃)
- ✅ 优点: 快速、准确
- ❌ 缺点: 需要 API key，大哥没有

### 方案3: 其他本地方案 (备选)
- faster-whisper: 更快的本地推理
- sherpa-onnx: 轻量级本地 ASR
- 浏览器 API: 限浏览器环境

## 当前进展

✅ 已完成:
- ffmpeg 安装成功
- 语音文件格式转换 (ogg → mp3/wav)
- Skill 文件结构创建
- 使用文档编写

🔄 进行中:
- Whisper 模型安装 (torch 下载中...)

## 使用方法

```bash
# 转换语音格式
ffmpeg -i voice.ogg voice.mp3

# 转文字 (装好后)
whisper voice.mp3 --model tiny --output_format txt
```

## 经验总结

1. **依赖管理**: 本地 ML 模型依赖重，要考虑用户环境
2. **备选方案**: 主方案卡住时要有 Plan B
3. **文档先行**: 即使工具没装好，也要把使用方法写清楚
4. **持续学习**: 探索过程中学到了 ffmpeg、音频格式等知识

## 下一步

- 等待 torch 安装完成
- 测试实际转录效果
- 优化为 tiny 模型 (39MB，最快)
