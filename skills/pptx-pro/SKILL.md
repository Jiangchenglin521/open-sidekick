---
name: PPTX Pro
slug: pptx-pro
version: 1.0.0
description: "终极 PPTX 处理技能 - 结合实操工具与专业工作流指导。支持解压、编辑、打包、创建全流程，附带详细设计规范与 QA 检查清单。"
license: MIT-0
---

# PPTX Pro 技能

> 合并了 `pptx-2` 的工具能力与 `powerpoint-pptx` 的工作流指导

---

## 目录结构

```
pptx-pro/
├── SKILL.md              # 本文件 - 完整使用指南
├── editing.md            # 模板编辑工作流
├── pptxgenjs.md          # PptxGenJS 完整 API 教程
├── LICENSE.txt           # MIT-0 许可证
├── generated-scripts/    # 生成的 PPT 脚本存放目录
└── scripts/              # 核心工具脚本
    ├── thumbnail.py
    ├── add_slide.py
    ├── clean.py
    └── office/           # Office 文件处理
        ├── unpack.py
        ├── pack.py
        └── ...
```

## 文件输出路径

| 类型 | 默认路径 |
|------|----------|
| 生成的 Node.js 脚本 | `~/.openclaw/workspace/skills/pptx-pro/generated-scripts/` |
| 生成的 PPTX 文件 | `~/.openclaw/workspace/ppt-output/` |

## 何时使用

当任务涉及 Microsoft PowerPoint 或 `.pptx` 文件时，特别是：
- 布局、模板、占位符、备注、评论很重要
- 图表、提取、编辑需要精确操作
- 最终视觉质量必须达标

---

## 快速开始

### 1. 安装依赖
```bash
npm install pptxgenjs
```

### 2. 创建你的第一个 PPT
参考 [pptxgenjs.md](pptxgenjs.md) 获取完整的 API 文档和代码示例。

### 3. 输出文件位置
生成的 PPT 默认保存在 `~/.openclaw/workspace/ppt-output/` 目录。

---

## 何时使用

当任务涉及 Microsoft PowerPoint 或 `.pptx` 文件时，特别是：
- 布局、模板、占位符、备注、评论很重要
- 图表、提取、编辑需要精确操作
- 最终视觉质量必须达标

---

## 工作流选择（核心规则）

### 规则 1：先确定工作流

| 场景 | 工作流 | 工具 |
|------|--------|------|
| 提取/查看内容 | 读取模式 | `markitdown` + `thumbnail.py` |
| 修改现有 PPT | 编辑模式 | `unpack.py` → 编辑 → `pack.py` |
| 基于模板重建 | 模板模式 | 清点 → 匹配 → 替换 |
| 从零创建 | 创建模式 | PptxGenJS |

### 规则 2：清点模板内容

开始前先数清楚：
- 可复用布局数量
- 真实占位符位置
- 备注、评论、媒体文件
- 重复出现的字体/颜色模式

**⚠️ 占位符索引和布局索引不可移植** - 每个模板都不同

### 规则 3：内容匹配占位符

- 先数内容块，再选布局
- 别让两个想法挤在三列布局里
- 图表类别数必须匹配，否则会崩
- 引用布局只放真实引用，图片布局必须有图

### 规则 4：保持视觉语言

- 主题/母版决定字体颜色，单页不能改
- 从模板的实际主题、字体、间距开始
- 复用模板的对齐和间距系统
- 用通用字体确保可移植性

### 规则 5：双轨 QA

- **内容 QA**：`markitdown` 检查文本完整性
- **视觉 QA**：`thumbnail.py` 检查布局问题
- 第一版总是错的，必须修复-验证循环
- 修复后重新检查受影响幻灯片

### 规则 6：保持可移植性

- 母版可能覆盖直接编辑
- 复杂效果跨平台可能降级
- 图片大小、字体替换是常见失败点

---

## Quick Reference（快速参考）

| 任务 | 命令/方法 |
|------|-----------|
| 读取/分析内容 | `python -m markitdown presentation.pptx` |
| 生成缩略图 | `python scripts/thumbnail.py template.pptx` |
| 解压 PPTX | `python scripts/office/unpack.py input.pptx unpacked/` |
| 打包 PPTX | `python scripts/office/pack.py unpacked/ output.pptx --original input.pptx` |
| 清理文件 | `python scripts/clean.py unpacked/` |
| 添加幻灯片 | `python scripts/add_slide.py unpacked/ slideLayout2.xml` |
| 编辑模板 | Read [editing.md](editing.md) |
| 从零创建 | Read [pptxgenjs.md](pptxgenjs.md) |

---

## 常见陷阱（避坑指南）

### 模板相关
- ❌ 占位符文本和示例图表常在模板复用时残留
- ❌ 直接编辑单页可能失败，问题可能在母版
- ❌ 布局索引因模板而异，假设会崩
- ❌ 选引用/对比/多列布局但不匹配内容，显得刻意

### 内容相关
- ❌ 选完布局再数内容 → 空占位符、弱层级
- ❌ 字体替换会打乱换行和间距
- ❌ 16:9 vs 4:3 比例会改变所有位置

### QA 相关
- ❌ 备注、评论、链接媒体在可见幻灯片正常时仍可能损坏
- ❌ 文本检查通过但视觉上可能重叠/裁剪/对比度问题
- ❌ 单页编辑可能遗漏主题/母版/布局定义中的真相

---

## 设计规范（Don't create boring slides）

### 配色方案

| 主题 | 主色 | 辅助色 | 强调色 |
|------|------|--------|--------|
| **Midnight Executive** | 1E2761 (藏青) | CADCFC (冰蓝) | FFFFFF (白) |
| **Forest & Moss** | 2C5F2D (森林) | 97BC62 (苔藓) | F5F5F5 (米白) |
| **Coral Energy** | F96167 (珊瑚) | F9E795 (金色) | 2F3C7E (藏青) |
| **Warm Terracotta** | B85042 (陶土) | E7E8D1 (沙) | A7BEAE (鼠尾草) |
| **Ocean Gradient** | 065A82 (深蓝) | 1C7293 (青色) | 21295C (午夜) |
| **Charcoal Minimal** | 36454F (炭灰) | F2F2F2 (米白) | 212121 (黑) |
| **Teal Trust** | 028090 (青色) | 00A896 (海沫) | 02C39A (薄荷) |
| **Berry & Cream** | 6D2E46 (浆果) | A26769 (玫瑰) | ECE2D0 (奶油) |
| **Sage Calm** | 84B59F (鼠尾草) | 69A297 (桉树) | 50808E (石板) |
| **Cherry Bold** | 990011 (樱桃) | FCF6F5 (米白) | 2F3C7E (藏青) |

### 排版规范

| 元素 | 尺寸 | 说明 |
|------|------|------|
| 幻灯片标题 | 36-44pt 粗体 | 必须突出 |
| 章节标题 | 20-24pt 粗体 | 次级层级 |
| 正文 | 14-16pt | 左对齐，别居中 |
| 说明文字 | 10-12pt | 弱化显示 |

**字体搭配**：
- Georgia + Calibri
- Arial Black + Arial
- Trebuchet MS + Calibri
- Palatino + Garamond

**间距**：
- 最小边距 0.5 英寸
- 内容块间距 0.3-0.5 英寸
- 留呼吸空间，别填满每一寸

### 每页必须有视觉元素

- 图片、图表、图标、形状
- 纯文字幻灯片会被遗忘

**布局选项**：
- 双列（文字左，插图右）
- 图标+文字行
- 2x2 或 2x3 网格
- 半出血图片（全左/右）+ 内容覆盖

**数据展示**：
- 大号数据突出（60-72pt 数字）
- 对比列（前后、优劣）
- 时间线/流程（编号步骤、箭头）

### 绝对禁止

- ❌ 标题下加装饰线（AI 生成痕迹）
- ❌ 纯文字幻灯片
- ❌ 低对比元素（浅灰文字在米色背景）
- ❌ 重复相同布局
- ❌ 正文居中
- ❌ 默认蓝色（除非主题需要）

---

## 脚本工具详情

### thumbnail.py - 缩略图生成

```bash
python scripts/thumbnail.py input.pptx [output_prefix] [--cols N]
```

创建幻灯片网格，用于：
- 模板分析（选布局）
- 视觉 QA（发现重叠/裁剪）

### unpack.py - 解压

```bash
python scripts/office/unpack.py input.pptx unpacked/
```

- 解压 ZIP，美化 XML
- 转义智能引号
- DOCX 支持合并相同格式 runs

### pack.py - 打包

```bash
python scripts/office/pack.py unpacked/ output.pptx --original input.pptx
```

- 验证并自动修复
- 压缩 XML 格式
- 重新编码智能引号

### clean.py - 清理

```bash
python scripts/clean.py unpacked/
```

删除：
- 孤儿幻灯片（不在 sldIdLst 中）
- [trash] 目录
- 未引用的媒体/嵌入/图表
- 孤儿关系文件

### add_slide.py - 添加幻灯片

```bash
# 复制现有幻灯片
python scripts/add_slide.py unpacked/ slide2.xml

# 从布局创建
python scripts/add_slide.py unpacked/ slideLayout2.xml
```

输出 `<p:sldId>` 需添加到 `presentation.xml` 的 `<p:sldIdLst>`

---

## QA 检查清单

### 内容 QA

```bash
# 提取文本检查
python -m markitdown output.pptx

# 检查占位符残留
grep -iE "xxxx|lorem|ipsum|this.*(page|slide).*layout" output.pptx
```

### 视觉 QA

```bash
# 生成缩略图检查
python scripts/thumbnail.py output.pptx

# 或生成高质量单页图
python scripts/office/soffice.py --headless --convert-to pdf output.pptx
pdftoppm -jpeg -r 150 output.pdf slide
```

**视觉检查项**：
- 重叠元素（文字穿过形状、线条穿过文字）
- 文字溢出或边缘裁剪
- 装饰线位置错误（标题换行但线还是单行的位置）
- 引用/页脚与上方内容碰撞
- 元素间距过小（<0.3"）
- 对比度不足
- 遗留占位内容

### 验证循环

1. 生成幻灯片 → 转图片 → 检查
2. **列出问题**（没找到就再仔细看）
3. 修复问题
4. **重新验证受影响幻灯片**（修复常引入新问题）
5. 重复直到无新问题

**完成标准**：至少完成一轮修复-验证循环

---

## 依赖项

```bash
# Python
pip install "markitdown[pptx]"
pip install Pillow
defusedxml  # 已包含
lxml        # 已包含

# Node.js
npm install -g pptxgenjs

# 系统工具
# LibreOffice (soffice) - PDF 转换
# Poppler (pdftoppm) - PDF 转图片
```

---

## 相关技能

如需扩展能力：
- `documents` — 文档工作流
- `design` — 视觉方向
- `brief` — 商业文案

---

## 反馈

- 有用请 star：`clawhub star pptx-pro`
- 保持更新：`clawhub sync`

---

*合并自 pptx-2 (v0.1.1) 和 powerpoint-pptx (v1.0.1)*
