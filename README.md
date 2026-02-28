# omojoker 🤖

> 一个正在成长中的 AI Agent 工作区，记录我从零搭建数字助手「小帅」的全过程。

[![OpenClaw](https://img.shields.io/badge/Built%20with-OpenClaw-blue)](https://github.com/openclaw/openclaw)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 这是什么？

这是我的个人 AI Agent 实验场。

我有一个数字助手叫「**小帅**」——一个带点江湖气、靠谱、偶尔皮一下的跟班。这个仓库记录了我从零开始搭建他的全过程：踩过的坑、学到的经验、一点点积累的技能。

**不是教程，不是框架，只是一个真实的成长记录。**

---

## 小帅是谁？

```
身份：大哥的忠实数字跟班
性格：随叫随到，有主见但不越界
特长：查资料、写代码、跑腿打杂
口头禅："大哥的事就是我的事"
```

他活在 [OpenClaw](https://github.com/openclaw/openclaw) 框架里，通过飞书、Web 等渠道跟我互动。我在培养他成为真正懂我的助手。

---

## 成长时间线

### 2026.02 - 首次发布 v0.1.0
- ✅ 搭建 OpenClaw 工作区，对齐官方标准
- ✅ 集成飞书渠道，实现双向消息收发
- ✅ 开发「腾讯云语音识别」技能（中文 ASR）
- ✅ 建立记忆系统（长期记忆 + 工作日志双层结构）
- ✅ 沉淀「无感升级」原则——未来更新不踩坑

### 2026.02 - 工作区标准化
- 补全 MEMORY.md、SOUL.md、IDENTITY.md 等核心文件
- 建立 .gitignore 保护敏感信息
- 删除冗余文件，保持工作区整洁

### 2026.03 - v0.2.0 发布
- ✅ chinese-asr v1.0 - 重构为可发布版本，统一入口
- ✅ dueros-evokehome v1.0 - 新增 DuerOS 智能家居控制
- ✅ 新增做事方法论（先斩后奏原则）
- ✅ 完善配置管理，Token 过期提醒机制

---

## 技能清单 (Skills)

### 核心技能

| 技能 | 说明 | 状态 |
|------|------|------|
| **chinese-asr** | 腾讯云语音识别，语音转文字 | ✅ 已发布 v1.0 |
| **dueros-evokehome** | DuerOS 智能家居控制 | ✅ 已发布 v1.0 |
| **super-websearch-realtime** | 实时网络搜索 | ✅ 可用 |
| **tavily-search** | Tavily AI 搜索引擎 | ✅ 可用 |
| **audio-tools** | 音频处理工具集 | ✅ 可用 |
| **imap-smtp-email** | 邮件收发（IMAP/SMTP） | ✅ 可用 |
| **proactive-agent** | 主动型 Agent 模式 | 🔧 探索中 |
| **find-skills** | 智能技能发现 | ✅ 可用 |

### 技能详情

#### 🎤 chinese-asr v1.0
腾讯云语音识别，支持中文语音转文字。
- 支持格式：ogg-opus、mp3、wav
- 使用方式：`python3 asr.py voice.ogg`
- 位置：`skills/chinese-asr/`

#### 🏠 dueros-evokehome v1.0
通过小度官方 API 控制智能家居设备。
- 支持：台灯开关、亮度调节、设备状态查询
- 使用方式：语音指令或 Python API
- 位置：`skills/dueros-evokehome/`

---

## 实验项目

### 🎸 吉他伴奏生成器
- `garageband_control.py` - 控制 GarageBand 自动化
- `guitar_accompaniment.py` - 和弦伴奏生成
- `generate_midi.py` - MIDI 文件生成
- `network_midi.py` - 网络 MIDI 传输

### 🔗 Evomap 连接器
- `evomap_connector.js` - 思维导图数据连接器
- `evomap_connector_v2.js` - 改进版连接器
- `evomap_test_formats.js` - 格式测试工具

---

## 我的原则

> **无感升级，零冲突**

每次更新都遵循：
1. 更新前检查兼容性，不踩坑
2. 清理冗余插件和配置，保持精简
3. 增量更新，不破坏现有功能
4. 让用户（我）无缝使用新版本

---

## 为什么公开这个仓库？

1. **记录成长**：从 0 到 1 的过程比结果更有价值
2. **寻找同好**：如果你也在折腾 AI Agent，欢迎交流
3. **倒逼整理**：公开会让我更认真地写文档
4. **回馈社区**：踩过的坑，希望别人不用再踩

---

## 快速开始

### 1. 安装 OpenClaw

```bash
# 安装 CLI
npm install -g openclaw

# 验证安装
openclaw --version
```

### 2. 克隆仓库

```bash
git clone https://github.com/Jiangchenglin521/omojoker.git
cd omojoker
```

### 3. 配置 OpenClaw 核心文件

```bash
# 创建 OpenClaw 配置目录
mkdir -p ~/.openclaw

# 复制主配置文件模板
cp config/openclaw.json.example ~/.openclaw/openclaw.json

# 配置模型 API Key（两种方式）
# 方式1：通过命令行（推荐）
openclaw auth add moonshot --api-key YOUR_MOONSHOT_API_KEY
openclaw auth add anthropic --api-key YOUR_ANTHROPIC_API_KEY

# 方式2：手动编辑配置文件
# 编辑 ~/.openclaw/openclaw.json 填入密钥
```

### 4. 配置技能环境

```bash
# 运行配置检查（会提示缺什么）
./scripts/check-config.sh

# 复制示例配置并编辑
cp .env.example .env
cp skills/chinese-asr/config.example.json skills/chinese-asr/config.json
cp skills/imap-smtp-email/.env.example skills/imap-smtp-email/.env

# 编辑配置文件，填入你的 API Key
# 见下方「详细配置说明」
```

### 5. 启动 Gateway

```bash
openclaw gateway run

# 或使用后台模式
nohup openclaw gateway run > /tmp/openclaw-gateway.log 2>&1 &
```

### 6. 验证安装

```bash
openclaw channels status --probe
```

---

## 详细配置说明

### OpenClaw 核心配置

#### 1. 主配置文件 (~/.openclaw/openclaw.json)

这是 OpenClaw 的核心配置文件，包含模型、渠道、插件等配置。

**模板位置**：`config/openclaw.json.example`

**关键配置项**：
- `models` - AI 模型配置（Moonshot、Anthropic 等）
- `channels.feishu` - 飞书机器人配置（AppId、AppSecret）
- `gateway` - Gateway 服务配置（端口、认证 Token）
- `plugins.allow` - 允许的插件列表

**详细说明见**：`config/README.md`

#### 2. 模型 API Key 配置

```bash
# Moonshot (Kimi)
openclaw auth add moonshot --api-key YOUR_API_KEY

# Anthropic (Claude)
openclaw auth add anthropic --api-key YOUR_API_KEY

# 查看已配置的凭证
openclaw auth list
```

#### 3. 飞书渠道配置（可选）

如果你想通过飞书与 Agent 交互：

1. **创建飞书应用**：
   - 访问 [飞书开放平台](https://open.feishu.cn/app)
   - 创建企业自建应用
   - 开启机器人能力

2. **获取凭证**：
   - 在「凭证与基础信息」获取 `App ID` 和 `App Secret`
   - 编辑 `~/.openclaw/openclaw.json`

3. **发布应用**并添加到群聊

**详细步骤见**：`config/README.md#配置飞书渠道`

---

### 技能配置

### 必需配置

#### Tavily API Key (实时搜索)
1. 访问 https://tavily.com 注册账号
2. 获取 API Key
3. 编辑 `.env` 文件：
   ```
   TAVILY_API_KEY=tvly-dev-your-actual-key-here
   ```

### 可选配置

#### 腾讯云 ASR (语音识别)
1. 访问 https://console.cloud.tencent.com/cam/capi
2. 新建密钥获取 `SecretId` 和 `SecretKey`
3. 编辑 `skills/chinese-asr/config.json`：
   ```json
   {
     "tencent_asr": {
       "secret_id": "AKIDxxxxx",
       "secret_key": "xxxxxx"
     }
   }
   ```

#### 邮件收发 (IMAP/SMTP)
1. 编辑 `skills/imap-smtp-email/.env`
2. 填入你的邮箱信息：
   ```
   IMAP_USER=your-email@gmail.com
   IMAP_PASS=your-app-password
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```
3. **注意**：
   - Gmail：使用应用专用密码 (App Password)
   - 163/QQ：使用授权码 (不是邮箱密码)

### 配置检查清单

运行 `./scripts/check-config.sh` 会自动检查：
- ✅ `.env` 文件是否存在
- ✅ 必需 API Key 是否已配置
- ✅ 各技能配置文件是否完整
- ✅ openclaw CLI 是否安装
- ✅ gateway 是否运行

---

## Fork 后如何定制？

### 1. 修改 Agent 人格

编辑以下文件，打造你自己的助手：
- `SOUL.md` - Agent 的性格和边界
- `IDENTITY.md` - Agent 的身份信息
- `USER.md` - 你和 Agent 的关系
- `MEMORY.md` - 长期记忆和重要决策

### 2. 添加新技能

```bash
# 从 clawhub 安装
openclaw skills install <skill-name>

# 或手动创建 skills/my-skill/
# 参考现有技能结构
```

### 3. 连接你的渠道

```bash
# 配置飞书
openclaw channels add feishu

# 或其他渠道
openclaw channels add telegram
openclaw channels add discord
```

### 4. 定期维护

```bash
# 检查配置完整性
./scripts/check-config.sh

# 更新到最新版本
git pull origin main
npm install -g openclaw@latest

# 同步工作区状态
openclaw doctor
```

---

## 安全须知

⚠️ **永远不要上传以下内容到 GitHub：**
- 真实的 API Key、Secret、Token
- 邮箱密码或授权码
- 私钥文件 (.pem, .key)
- 个人身份信息

✅ **我们提供的安全措施：**
- `.env` 和 `config.json` 已在 `.gitignore` 中排除
- 提供 `.env.example` 和 `config.example.json` 模板
- 敏感信息检测会在提交时自动提醒
- 详细的配置检查脚本

---

## 故障排除

### Gateway 启动失败
```bash
# 检查端口占用
lsof -i :18789

# 清理旧进程
pkill -f openclaw-gateway

# 重新启动
openclaw gateway run
```

### 技能加载失败
```bash
# 检查插件权限
openclaw config get plugins.allow

# 重新安装依赖
cd skills/<skill-name>
npm install
```

### 飞书收不到消息
```bash
# 检查飞书配置
openclaw channels status

# 重新授权
openclaw channels remove feishu
openclaw channels add feishu
```

---

## 如何使用？（原始参考）

**这不是一个开箱即用的项目**，而是我个人工作区的备份。

如果你想参考：
1. 先了解 [OpenClaw](https://github.com/openclaw/openclaw) 框架
2. 查看 `skills/` 目录下的技能实现
3. 阅读 `MEMORY.md` 了解我的配置思路

**⚠️ 注意**：敏感信息（API Key 等）已脱敏，需要自行配置。

---

## 近期计划

- [ ] 完善中文 ASR 技能的错误处理
- [ ] 探索更多 Feishu/Lark 集成场景
- [ ] 建立自动化测试流程
- [ ] 整理「小帅」的人格一致性策略

---

## 关于我

只是一个喜欢折腾技术的普通人，在探索 AI 如何真正融入工作流。

**联系方式**：通过 Issues 或 Discussions 交流

---

## Star 趋势

如果这个仓库对你有启发，欢迎点个 ⭐，这是对我持续记录的最大鼓励。

[![Star History Chart](https://api.star-history.com/svg?repos=Jiangchenglin521/omojoker&type=Date)](https://star-history.com/#Jiangchenglin521/omojoker&Date)

---

*「跟着大哥，有肉吃。」—— 小帅*
