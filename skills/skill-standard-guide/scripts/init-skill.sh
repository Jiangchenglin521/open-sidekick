#!/bin/bash
#
# 快速初始化 OpenClaw 技能目录结构
# 用法: ./init-skill.sh <skill-name>
#

set -e

SKILL_NAME="$1"

if [ -z "$SKILL_NAME" ]; then
    echo "错误: 请提供技能名称"
    echo "用法: $0 <skill-name>"
    echo "示例: $0 my-new-skill"
    exit 1
fi

# 验证技能名称格式
if [[ ! "$SKILL_NAME" =~ ^[a-z0-9-]+$ ]]; then
    echo "错误: 技能名称只能包含小写字母、数字和连字符"
    exit 1
fi

SKILL_DIR="$HOME/.openclaw/workspace/skills/$SKILL_NAME"

# 检查目录是否已存在
if [ -d "$SKILL_DIR" ]; then
    echo "错误: 技能目录已存在: $SKILL_DIR"
    exit 1
fi

# 创建目录结构
echo "创建技能目录: $SKILL_NAME"
mkdir -p "$SKILL_DIR/scripts"
mkdir -p "$SKILL_DIR/references"
mkdir -p "$SKILL_DIR/assets"

# 创建 SKILL.md 模板
cat > "$SKILL_DIR/SKILL.md" << 'EOF'
---
name: {skill-name}
description: {在此处添加技能描述 - 包含功能和触发场景}
---

# {技能标题}

{在此处添加技能的简要概述}

## 核心功能

### {功能1}

{功能说明}

```bash
# 示例命令
```

### {功能2}

{功能说明}

```bash
# 示例命令
```

## 高级功能

- **{功能3}**: 详见 [references/advanced.md](references/advanced.md)

## 注意事项

- {注意事项1}
- {注意事项2}
EOF

# 替换模板中的占位符
sed -i.bak "s/{skill-name}/$SKILL_NAME/g" "$SKILL_DIR/SKILL.md"
rm "$SKILL_DIR/SKILL.md.bak"

# 创建 .gitignore
cat > "$SKILL_DIR/.gitignore" << 'EOF'
*.log
.env
config.json
EOF

# 创建示例脚本
cat > "$SKILL_DIR/scripts/example.sh" << 'EOF'
#!/bin/bash
# 示例脚本 - 请根据需求修改

echo "Hello from {skill-name}!"
EOF

sed -i.bak "s/{skill-name}/$SKILL_NAME/g" "$SKILL_DIR/scripts/example.sh"
rm "$SKILL_DIR/scripts/example.sh.bak"
chmod +x "$SKILL_DIR/scripts/example.sh"

# 创建示例参考文件
cat > "$SKILL_DIR/references/advanced.md" << 'EOF'
# 高级功能

在此文件中添加高级功能的详细说明。
EOF

# 创建示例资源文件
cat > "$SKILL_DIR/assets/template.txt" << 'EOF'
在此目录中添加资源文件（模板、图片等）。
EOF

echo ""
echo "✅ 技能 '$SKILL_NAME' 创建成功！"
echo ""
echo "目录结构:"
find "$SKILL_DIR" -type f | head -20
echo ""
echo "下一步:"
echo "1. 编辑 $SKILL_DIR/SKILL.md 添加技能描述"
echo "2. 在 scripts/ 中添加可执行脚本"
echo "3. 在 references/ 中添加参考文档"
echo "4. 在 assets/ 中添加资源文件"
echo "5. 测试所有脚本"
echo ""
echo "参考: ~/.openclaw/workspace/skills/skill-standard-guide/SKILL.md"
