# 技能模板

复制以下内容作为新技能的起点。

## 目录结构模板

```
{skill-name}/
├── SKILL.md
├── scripts/           # (可选)
│   └── example.py
├── references/        # (可选)
│   └── advanced.md
└── assets/            # (可选)
    └── template.txt
```

## SKILL.md 模板

```markdown
---
name: {skill-name}
description: {技能功能的简短描述}。Use when {具体触发场景1}，{具体触发场景2}，or {具体触发场景3}。
---

# {技能标题}

{技能的简要概述 - 1-2句话}

## 核心功能

### {功能1}

{功能说明}

```bash
{命令示例}
```

### {功能2}

{功能说明}

```bash
{命令示例}
```

## 高级功能

- **{高级功能1}**：详见 [references/ADVANCED.md](references/ADVANCED.md)
- **{高级功能2}**：详见 [references/API.md](references/API.md)

## 注意事项

- {注意事项1}
- {注意事项2}
```

## 命名模板

| 类型 | 模式 | 示例 |
|-----|------|------|
| GitHub 相关 | `gh-{action}` | `gh-review-pr` |
| Linear 相关 | `linear-{action}` | `linear-create-issue` |
| 文件处理 | `{format}-processor` | `pdf-processor` |
| 通用工具 | `{verb}-{noun}` | `search-web` |
| 模板/样板 | `{domain}-template` | `react-template` |

## Description 模板

```
{一句话功能描述}。Use when {具体场景1} for: (1) {子场景A}，(2) {子场景B}，(3) {子场景C}，or any other {领域} tasks.
```

## 示例

### 简单技能

```markdown
---
name: text-formatter
description: Format and clean text content. Use when processing text for: (1) Removing extra whitespace, (2) Converting case, (3) Normalizing line endings.
---

# Text Formatter

Clean and format text content.

## Remove Extra Whitespace

Use `scripts/clean.py`:

```bash
python {baseDir}/scripts/clean.py input.txt
```

## Convert Case

- Uppercase: `python {baseDir}/scripts/case.py --upper input.txt`
- Lowercase: `python {baseDir}/scripts/case.py --lower input.txt`
```

### 复杂技能

```markdown
---
name: cloud-deploy
description: Deploy applications to cloud platforms. Use when deploying to: (1) AWS, (2) GCP, (3) Azure, or configuring cloud infrastructure.
---

# Cloud Deploy

Deploy applications to major cloud providers.

## Provider Selection

Choose the appropriate provider:
- **AWS**: See [references/aws.md](references/aws.md)
- **GCP**: See [references/gcp.md](references/gcp.md)
- **Azure**: See [references/azure.md](references/azure.md)

## Quick Deploy

For standard deployments:

```bash
bash {baseDir}/scripts/deploy.sh --provider aws --env production
```

## Configuration

Create `deploy.config.json`:

```json
{
  "provider": "aws",
  "region": "us-east-1",
  "instance_type": "t3.medium"
}
```
```

## 快速创建命令

```bash
# 1. 创建目录结构
mkdir -p ~/.openclaw/workspace/skills/{skill-name}/scripts
mkdir -p ~/.openclaw/workspace/skills/{skill-name}/references
mkdir -p ~/.openclaw/workspace/skills/{skill-name}/assets

# 2. 创建 SKILL.md
cat > ~/.openclaw/workspace/skills/{skill-name}/SKILL.md << 'EOF'
---
name: {skill-name}
description: 
---

# {Skill Title}

EOF

# 3. 编辑 SKILL.md 添加内容
# 4. 添加 scripts/、references/、assets/ 文件
# 5. 测试所有脚本
# 6. 完成！
```
