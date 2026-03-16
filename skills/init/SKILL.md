---
name: init
description: 初始化工作区，检查 config.json 中定义的技能并自动从 clawhub 安装缺失项。使用场景：(1) 首次设置 OpenClaw 工作区时，(2) 需要确保 config.json 中的技能都已安装时。
---

# Init 技能

初始化 OpenClaw 工作区，检查必需技能并自动从 clawhub 安装缺失项。

## 概述

此技能通过以下步骤确保工作区技能完整性：
1. 读取 `config.json` 中的必需技能清单
2. 检查每个必需技能是否在本地 `skills/` 目录中存在
3. 对缺失的技能，自动从 clawhub 安装
4. 报告安装结果

## 使用方法

运行初始化脚本：

```bash
bash {baseDir}/scripts/init.sh
```

## 配置说明

必需技能清单存储在 `{baseDir}/config.json` 中：

```json
{
  "requiredSkills": [
    "skill-name-1",
    "skill-name-2"
  ]
}
```

**用户自行编辑**：修改 `config.json` 中的 `requiredSkills` 数组来定义需要检查的技能。

## 工作原理

脚本执行以下步骤：
1. 读取 `config.json` 中的 `requiredSkills` 列表
2. 逐个检查技能目录 `~/.openclaw/workspace/skills/` 是否存在
3. 对缺失的技能，执行 `npx clawhub install <skill-name>` 进行安装
4. 输出检查报告和安装结果

## 安装失败处理

如果某些技能从 clawhub 安装失败：
- 该技能可能不在 clawhub 上
- 网络连接问题
- 脚本会列出所有安装失败的技能名称
