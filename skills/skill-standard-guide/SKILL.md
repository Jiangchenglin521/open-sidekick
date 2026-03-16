---
name: skill-standard-guide
description: OpenClaw 技能设计规范指南。当用户要求创建新技能、设计技能结构或询问技能开发标准时使用。提供完整的技能目录结构、命名规范、内容组织原则、渐进式披露设计模式以及 SKILL.md 写作指南。
---

# OpenClaw 技能设计规范指南

本指南定义了创建符合 OpenClaw 标准的技能所需的全部规范。

## 技能结构

每个技能必须遵循以下目录结构：

```
skill-name/
├── SKILL.md                 # 必需 - 技能主文件
│   ├── YAML frontmatter     # 必需 - 元数据
│   └── Markdown 内容        # 必需 - 使用说明
├── scripts/                 # 可选 - 可执行脚本
├── references/              # 可选 - 参考文档
├── assets/                  # 可选 - 输出资源文件
├── _meta.json               # 可选 - 发布元数据
└── config.json              # 可选 - 配置文件
```

### 禁止创建的文件

技能应仅包含直接支持其功能的必要文件。**不要**创建以下辅助文档：

- README.md
- INSTALLATION_GUIDE.md
- QUICK_REFERENCE.md
- CHANGELOG.md
- 等其他说明性文档

## SKILL.md 格式规范

### Frontmatter (YAML 头部)

必须包含以下字段：

```yaml
---
name: skill-name              # 必需 - 技能名称
description: 描述内容          # 必需 - 触发机制描述
---
```

**name 规范：**
- 仅使用小写字母、数字和连字符
- 长度不超过 64 个字符
- 优先使用简短的动词开头短语
- 按工具命名空间化以提高清晰度 (如 `gh-address-comments`)
- 技能文件夹名称必须与技能名称完全一致

**description 规范：**
- 这是技能的主要触发机制
- 必须包含：技能功能 + 具体触发场景/上下文
- 所有"何时使用"信息必须放在 description 中，而非正文
- 示例：
  ```
  Comprehensive document creation, editing, and analysis with support for tracked changes, 
  comments, formatting preservation, and text extraction. Use when Codex needs to work with 
  professional documents (.docx files) for: (1) Creating new documents, (2) Modifying or editing 
  content, (3) Working with tracked changes, (4) Adding comments, or any other document tasks
  ```

**禁止在 frontmatter 中包含其他字段。**

### 正文 (Markdown)

- 始终使用**祈使/不定式**形式
- 保持简洁，默认假设 Codex 已经很聪明
- 挑战每条信息："Codex 真的需要这个解释吗？"
- 优先使用简洁示例而非冗长解释
- 目标：SKILL.md 正文控制在 500 行以内

## 核心设计原则

### 1. 简洁是关键

上下文窗口是公共资源。技能与系统提示、对话历史、其他技能元数据和实际用户请求共享上下文窗口。

**默认假设：Codex 已经很聪明。** 只添加 Codex 尚不了解的上下文。优先使用简洁示例而非冗长解释。

### 2. 设置适当的自由度

根据任务的脆弱性和可变性匹配合适的特定性级别：

| 自由度级别 | 适用场景 | 形式 |
|-----------|---------|------|
| **高自由度** | 多种方法有效、决策依赖上下文、启发式指导方法 | 基于文本的指令 |
| **中自由度** | 存在首选模式、可接受一些变化、配置影响行为 | 伪代码或带参数的脚本 |
| **低自由度** | 操作脆弱易错、一致性至关重要、必须遵循特定序列 | 特定脚本，少量参数 |

### 3. 渐进式披露设计

技能使用三级加载系统高效管理上下文：

1. **元数据 (name + description)** - 始终在上下文中 (~100 词)
2. **SKILL.md 正文** - 技能触发时加载 (<5k 词)
3. **捆绑资源** - Codex 按需加载 (无限制，因为脚本可无需读入上下文即可执行)

**关键原则：** 当技能支持多种变体、框架或选项时，仅在 SKILL.md 中保留核心工作流和选择指导。将变体特定细节移至单独的参考文件。

## 资源类型详解

### scripts/ - 可执行脚本

- **何时包含：** 当相同代码被重复重写或需要确定性可靠性时
- **示例：** `scripts/rotate_pdf.py` 用于 PDF 旋转任务
- **优点：** Token 高效、确定性、可能无需加载到上下文即可执行
- **注意：** 脚本可能仍需被 Codex 读取以进行修补或环境特定调整
- **必须实际运行测试**以确保没有 bug 且输出符合预期

### references/ - 参考文档

- **何时包含：** 供 Codex 工作时参考的文档
- **示例：** 
  - `references/finance.md` - 财务模式
  - `references/mnda.md` - 公司 NDA 模板
  - `references/policies.md` - 公司政策
  - `references/api_docs.md` - API 规范
- **用例：** 数据库模式、API 文档、领域知识、公司政策、详细工作流指南
- **优点：** 保持 SKILL.md 精简，仅在 Codex 确定需要时加载
- **最佳实践：** 如果文件较大 (>10k 词)，在 SKILL.md 中包含 grep 搜索模式
- **避免重复：** 信息应存在于 SKILL.md 或 references 文件中，而非两者。优先将详细信息放在 references 文件中 - 这保持 SKILL.md 精简，同时使信息可发现而不占用上下文窗口。

**渐进式披露模式：**

```markdown
# PDF 处理

## 快速开始
使用 pdfplumber 提取文本：
[代码示例]

## 高级功能
- **表单填写**：完整指南参见 [FORMS.md](references/FORMS.md)
- **API 参考**：所有方法参见 [REFERENCE.md](references/REFERENCE.md)
- **示例**：常见模式参见 [EXAMPLES.md](references/EXAMPLES.md)
```

**多领域组织示例：**

```
bigquery-skill/
├── SKILL.md (概览和导航)
└── references/
    ├── finance.md (收入、账单指标)
    ├── sales.md (机会、管道)
    ├── product.md (API 使用、功能)
    └── marketing.md (活动、归因)
```

**重要准则：**
- **避免深层嵌套引用** - 保持 references 距离 SKILL.md 仅一级。所有参考文件应直接从 SKILL.md 链接。
- **为较长的参考文件添加结构** - 对于超过 100 行的文件，在顶部包含目录以便 Codex 预览时能看到完整范围。

### assets/ - 资源文件

- **何时包含：** 当技能需要将在最终输出中使用的文件时
- **示例：**
  - `assets/logo.png` - 品牌资产
  - `assets/slides.pptx` - PowerPoint 模板
  - `assets/frontend-template/` - HTML/React 样板
  - `assets/font.ttf` - 字体
- **用例：** 模板、图像、图标、样板代码、字体、被复制或修改的示例文档
- **优点：** 将输出资源与文档分离，使 Codex 无需将文件加载到上下文即可使用

## 技能创建流程

必须按顺序执行以下步骤：

### 步骤 1：用具体例子理解技能

**不要跳过此步骤**，除非技能的使用模式已经清楚理解。

通过以下方式理解技能的具体使用示例：
- 询问用户功能需求
- 请用户提供使用示例
- 生成示例并与用户确认

示例问题：
- "这个技能应该支持什么功能？"
- "你能给我一些这个技能使用方式的示例吗？"
- "你认为用户会怎么问？"

### 步骤 2：规划可重用的技能内容

将具体示例转化为有效技能，通过：
1. 考虑如何从头开始执行示例
2. 确定哪些脚本、引用和资产在重复执行这些工作流时会有帮助

识别要包含的资源：scripts/、references/、assets/

### 步骤 3：初始化技能目录

创建目录结构：

```bash
mkdir -p ~/.openclaw/workspace/skills/{skill-name}/scripts
mkdir -p ~/.openclaw/workspace/skills/{skill-name}/references
mkdir -p ~/.openclaw/workspace/skills/{skill-name}/assets
```

### 步骤 4：编辑技能

#### 先实现可重用资源

从步骤 2 识别的可重用资源开始实现：`scripts/`、`references/`、`assets/` 文件。

**添加的脚本必须经过实际运行测试**，以确保没有 bug 且输出符合预期。如果有很多类似的脚本，只需测试有代表性的样本。

#### 更新 SKILL.md

**写作指南：** 始终使用**祈使/不定式**形式。

**Frontmatter：**
- `name`: 技能名称
- `description`: 这是技能的主要触发机制
  - 包含技能功能和何时使用的具体触发器/上下文
  - 将所有"何时使用"信息放在这里 - 不要在正文中

**正文：**
- 编写使用技能及其捆绑资源的说明
- 保持简洁，目标 500 行以内
- 链接到 references/ 文件，描述何时阅读它们

### 步骤 5：打包技能

创建分发的 .skill 文件：

```bash
# 验证并打包
cd ~/.openclaw/workspace/skills/{skill-name}
zip -r {skill-name}.skill .
```

打包过程将：
1. **验证**技能自动检查：
   - YAML frontmatter 格式和必需字段
   - 技能命名规范和目录结构
   - 描述完整性和质量
   - 文件组织和资源引用
2. **打包**技能创建 .skill 文件

**安全限制：** 如果存在任何符号链接，打包将失败。

### 步骤 6：根据实际使用迭代

**迭代工作流：**
1. 在实际任务上使用技能
2. 注意困难或低效之处
3. 确定应如何更新 SKILL.md 或捆绑资源
4. 实施更改并再次测试

## 检查清单

创建技能前，确认以下事项：

- [ ] 技能名称符合规范 (小写、数字、连字符，<64字符)
- [ ] description 包含功能和触发场景
- [ ] frontmatter 仅包含 name 和 description
- [ ] 正文使用祈使/不定式形式
- [ ] 正文控制在 500 行以内
- [ ] 需要时包含 scripts/、references/、assets/
- [ ] references 文件直接从 SKILL.md 链接
- [ ] 脚本经过实际测试
- [ ] 未创建 README.md 等辅助文档
- [ ] 不包含符号链接

## 命名示例

| 用户描述 | 技能名称 |
|---------|---------|
| 帮助处理 GitHub PR 评论 | `gh-address-comments` |
| Linear 问题处理 | `linear-address-issue` |
| PDF 编辑器 | `pdf-editor` |
| 计划模式 | `plan-mode` |
| 前端 Web 应用构建器 | `frontend-webapp-builder` |
| BigQuery 查询助手 | `bigquery-assistant` |

## 元数据文件 (可选)

### _meta.json

发布时使用：
```json
{
  "ownerId": "...",
  "slug": "skill-name",
  "version": "1.0.0",
  "publishedAt": 1768114920544
}
```

### config.json

技能配置：
```json
{
  "key": "value"
}
```

## 完整示例

### 最小技能

```markdown
---
name: hello-world
description: A simple hello world skill that greets users. Use when the user wants to be greeted or says hello.
---

# Hello World

Greet the user with a friendly message.

## Usage

Simply respond with a warm greeting when triggered.
```

### 复杂技能

```markdown
---
name: pdf-processor
description: PDF processing skill with text extraction, rotation, and form filling. Use when working with PDF files for: (1) Extracting text content, (2) Rotating pages, (3) Filling forms, (4) Merging/splitting documents.
---

# PDF Processor

Process PDF files with various operations.

## Text Extraction

Use `scripts/extract_text.py`:

```bash
python {baseDir}/scripts/extract_text.py input.pdf
```

## Page Rotation

Use `scripts/rotate.py`:

```bash
python {baseDir}/scripts/rotate.py input.pdf --pages 1,3 --angle 90
```

## Form Filling

See [references/FORMS.md](references/FORMS.md) for detailed form field mapping.
```
