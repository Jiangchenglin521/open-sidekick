# OpenClaw 核心配置指南

> 本目录包含 OpenClaw 主配置文件的模板和说明。

---

## 文件说明

| 文件 | 用途 | 放置位置 |
|------|------|----------|
| `openclaw.json.example` | 主配置文件模板 | `~/.openclaw/openclaw.json` |

---

## 快速配置步骤

### 1. 创建配置目录

```bash
mkdir -p ~/.openclaw
```

### 2. 复制模板文件

```bash
cp config/openclaw.json.example ~/.openclaw/openclaw.json
```

### 3. 配置模型 API Key

```bash
# 配置 Moonshot (Kimi)
openclaw auth add moonshot --api-key YOUR_MOONSHOT_API_KEY

# 配置 Anthropic (Claude)
openclaw auth add anthropic --api-key YOUR_ANTHROPIC_API_KEY
```

### 4. 配置飞书渠道（可选）

如果你想通过飞书与 Agent 交互：

1. **创建飞书应用**：
   - 访问 [飞书开放平台](https://open.feishu.cn/app)
   - 创建企业自建应用
   - 开启机器人能力

2. **获取凭证**：
   - 在「凭证与基础信息」获取 `App ID` 和 `App Secret`
   - 编辑 `~/.openclaw/openclaw.json`：
   ```json
   "channels": {
     "feishu": {
       "appId": "cli_xxxxxxxxxx",
       "appSecret": "xxxxxxxxxx",
       "enabled": true,
       "connectionMode": "websocket"
     }
   }
   ```

3. **配置事件订阅**：
   - 在「事件订阅」添加：`message.im.message.receive_v1`
   - 使用 WebSocket 模式时不需要配置回调 URL

4. **发布应用**：
   - 在「版本管理与发布」创建版本并发布
   - 将机器人添加到群聊或发送私信

### 5. 配置工作区路径

编辑 `~/.openclaw/openclaw.json`，修改工作区路径：

```json
"agents": {
  "defaults": {
    "workspace": "/Users/YOUR_USERNAME/.openclaw/workspace"
  }
}
```

### 6. 安装插件

```bash
# 安装飞书插件
openclaw plugins install feishu

# 或手动安装到 extensions 目录
cd ~/.openclaw/extensions
git clone https://github.com/m1heng/clawdbot-feishu.git feishu
```

---

## 配置检查

配置完成后，运行：

```bash
# 检查配置文件语法
openclaw config validate

# 查看当前配置
openclaw config list

# 检查所有服务状态
openclaw channels status --probe
```

---

## 获取 API Key

### Moonshot (Kimi)
1. 访问 https://platform.moonshot.cn/
2. 注册账号
3. 在「API Key 管理」创建新密钥

### Anthropic (Claude)
1. 访问 https://console.anthropic.com/
2. 注册账号
3. 在「API Keys」创建新密钥

### Tavily (搜索)
1. 访问 https://tavily.com
2. 注册账号
3. 获取 API Key

---

## 安全提示

⚠️ **永远不要上传以下内容到 GitHub：**
- `~/.openclaw/openclaw.json`（包含所有密钥）
- `~/.openclaw/credentials/` 目录
- `~/.openclaw/extensions/` 中的真实密钥文件

✅ **敏感信息应该：**
- 通过 `openclaw auth` 命令配置
- 或手动编辑 `~/.openclaw/openclaw.json`
- 或使用系统钥匙串管理

---

## 故障排除

### 配置文件格式错误
```bash
# 验证 JSON 格式
jq . ~/.openclaw/openclaw.json

# 或使用 Python
python3 -m json.tool ~/.openclaw/openclaw.json
```

### Gateway 启动失败
```bash
# 检查端口占用
lsof -i :18789

# 查看详细日志
openclaw gateway run --verbose
```

### 模型调用失败
```bash
# 检查 API Key 是否配置
openclaw auth list

# 测试模型连接
openclaw models test moonshot/kimi-k2.5
```

---

## 参考

- [OpenClaw 官方文档](https://docs.openclaw.ai)
- [飞书机器人开发指南](https://open.feishu.cn/document/home/develop-a-bot-in-5-minutes/create-an-app)
