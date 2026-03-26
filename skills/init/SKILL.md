---
name: init
description: OpenClaw 工作区初始化工具。检查必需技能是否安装，缺失的自动从 clawhub 安装；检查已安装技能的配置参数（API Key、OAuth 等），生成配置报告提醒用户补全。
---

# Init 技能

OpenClaw 工作区初始化工具，确保技能完整性和可用性。

## 功能概述

Init 技能提供两个核心功能：

1. **技能安装检查**
   - 读取 `config.json` 中定义的必需技能清单
   - 检查每个技能是否在本地 `skills/` 目录中存在
   - 缺失的技能自动从 clawhub 安装
   - 反馈安装成功/失败结果

2. **配置参数检查**
   - 检查已安装技能所需的配置参数（API Key、OAuth 授权等）
   - 支持环境变量检查和文件内容检查
   - 生成详细的配置报告
   - 提供每项缺失配置的设置指引

## 目录结构

```
init/
├── SKILL.md              # 本文档
├── config.json           # 配置文件（技能名单 + 配置要求）
└── scripts/
    ├── init.sh           # 主入口脚本
    ├── check-skills.sh   # 技能安装检查脚本
    └── check-configs.sh  # 配置参数检查脚本
```

## 使用方法

### 快速开始

运行完整初始化检查：

```bash
bash ~/.openclaw/workspace/skills/init/scripts/init.sh
```

### 命令行选项

```bash
# 完整检查并自动安装缺失技能（默认）
bash init.sh

# 仅检查，不安装缺失技能
bash init.sh --check-only

# 只检查技能安装，跳过配置参数检查
bash init.sh --skip-config

# 显示帮助
bash init.sh --help
```

### 单独运行子功能

```bash
# 仅检查技能安装
bash ~/.openclaw/workspace/skills/init/scripts/check-skills.sh

# 仅检查配置参数
bash ~/.openclaw/workspace/skills/init/scripts/check-configs.sh
```

## 配置文件说明

配置文件位于 `config.json`，包含两个主要部分：

### 1. requiredSkills - 必需技能名单

定义需要检查/安装的技能列表：

```json
{
  "requiredSkills": [
    "summarize-pro",
    "search",
    "tavily-search"
  ]
}
```

### 2. skillConfigs - 技能配置要求

定义各技能所需的配置参数：

```json
{
  "skillConfigs": {
    "skill-name": {
      "name": "显示名称",
      "description": "技能描述",
      "configs": [
        {
          "key": "配置键名",
          "name": "配置项名称",
          "description": "配置说明",
          "required": true,
          "checkType": "env|file",
          "filePath": "检查的文件路径（checkType=file时使用）",
          "pattern": "文件匹配模式（可选）",
          "setupCommand": "设置命令示例"
        }
      ]
    }
  }
}
```

### 配置项字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `key` | string | 是 | 配置的键名，用于标识 |
| `name` | string | 是 | 配置项显示名称 |
| `description` | string | 是 | 配置项详细说明 |
| `required` | boolean | 是 | 是否必需配置 |
| `checkType` | string | 是 | 检查类型：`env`（环境变量）或 `file`（文件） |
| `filePath` | string | 否 | 检查的文件路径（`checkType=file` 时必需） |
| `pattern` | string | 否 | 文件内容匹配模式（可选） |
| `setupCommand` | string | 是 | 设置该配置的命令示例 |

### 扩展示例

添加新技能的配置检查：

```json
{
  "skillConfigs": {
    "my-new-skill": {
      "name": "我的新技能",
      "description": "新技能描述",
      "configs": [
        {
          "key": "MY_API_KEY",
          "name": "My API Key",
          "description": "从 xxx.com 获取的 API Key",
          "required": true,
          "checkType": "env",
          "setupCommand": "export MY_API_KEY=your-key-here"
        },
        {
          "key": "config.json",
          "name": "配置文件",
          "description": "技能配置文件",
          "required": true,
          "checkType": "file",
          "filePath": "~/.openclaw/workspace/skills/my-new-skill/config.json",
          "pattern": "api_key",
          "setupCommand": "编辑 config.json 填入 api_key"
        }
      ]
    }
  }
}
```

## 输出示例

### 技能安装检查输出

```
════════════════════════════════════════════════════════════════
              技能安装检查工具
════════════════════════════════════════════════════════════════

📋 读取必需技能配置...
  发现 3 个必需技能

📋 必需技能清单：
  • summarize-pro
  • search
  • tavily-search

🔍 检查本地技能安装状态...
  ✓ summarize-pro
  ✗ search (缺失)
  ✗ tavily-search (缺失)

📥 发现 2 个缺失技能，开始从 clawhub 安装...

  正在安装: search...
  ✓ 安装成功: search

  正在安装: tavily-search...
  ✓ 安装成功: tavily-search

════════════════════════════════════════════════════════════════
                      安装结果汇总
════════════════════════════════════════════════════════════════

  统计摘要：
    必需技能总数: 3
    已安装: 3
    本次新安装: 2

✅ 所有必需技能检查完成！
```

### 配置参数检查输出

```
════════════════════════════════════════════════════════════════
              技能配置参数检查工具
════════════════════════════════════════════════════════════════

🔍 扫描已安装技能...
  发现 6 个已安装技能

🔐 检查各技能配置参数...

  ✓ summarize-pro (无需配置)
  ✓ search (配置完整)
  ⚠ tavily-search (缺少 1 项配置)
  ⚠ dueros-evokehome (缺少 1 项配置)

╔════════════════════════════════════════════════════════════════╗
║           ⚠️  以下技能需要配置参数才能正常使用              ║
╚════════════════════════════════════════════════════════════════╝

▶ Tavily 搜索

    • Tavily API Key
      说明: 用于 Tavily 搜索，可从 https://tavily.com 获取
      设置: export TAVILY_API_KEY=<your-key>

▶ DuerOS 智能家居

    • DuerOS Access Token
      说明: 小度智能家居访问令牌，需从小度官网获取
      设置: 编辑 ~/.openclaw/workspace/skills/dueros-evokehome/config/config.json 添加 accessToken

═══════════════════════════════════════════════════════════════
提示：配置完成后，相关技能即可正常使用。

════════════════════════════════════════════════════════════════
                      配置检查结果汇总
════════════════════════════════════════════════════════════════

  统计摘要：
    已安装技能总数: 6
    需要配置的技能: 4
    配置完整: 2
    缺少配置: 2

  配置完整的技能：
    ✓ 网络搜索
    ✓ summarize-pro

⚠️  注意：部分技能缺少配置参数，请根据上方提示进行设置。
```

## 退出状态码

| 退出码 | 含义 |
|--------|------|
| 0 | 所有检查通过 |
| 1 | 部分技能安装失败 |
| 2 | 部分技能缺少配置参数 |
| 3 | 技能安装和配置检查均存在问题 |

## 内置配置检查

当前内置以下技能的配置检查：

| 技能 | 配置项 | 检查方式 |
|------|--------|----------|
| search | BRAVE_API_KEY | 环境变量 |
| tavily-search | TAVILY_API_KEY | 环境变量 |
| super-websearch-realtime | BRAVE_API_KEY | 环境变量 |
| dueros-evokehome | accessToken | 配置文件 |
| chinese-asr | secret_id, secret_key | 配置文件 |
| imap-smtp-email | IMAP_HOST, IMAP_USER, IMAP_PASS | 环境变量文件 |
| feishu-im-read | FEISHU_OAUTH | OAuth 凭证文件 |
| feishu-bitable | FEISHU_OAUTH | OAuth 凭证文件 |
| feishu-calendar | FEISHU_OAUTH | OAuth 凭证文件 |
| feishu-task | FEISHU_OAUTH | OAuth 凭证文件 |

## 故障排查

### 技能安装失败

可能原因：
- 技能名称拼写错误
- 技能不在 clawhub 上
- 网络连接问题
- 技能被 VirusTotal 标记为可疑

解决方案：
1. 检查 `config.json` 中的技能名称
2. 访问 https://clawhub.com 确认技能存在
3. 检查网络连接
4. 如技能被标记可疑，手动审查后安装

### 配置检查不准确

- 确保 `checkType` 与实际情况匹配
- 检查 `filePath` 是否正确（注意 `~` 会自动展开为 `$HOME`）
- 检查 `pattern` 是否能在目标文件中匹配

## 依赖

- `bash` - 脚本执行环境
- `python3` - 用于解析 JSON 配置文件
- `npx` - 用于从 clawhub 安装技能
