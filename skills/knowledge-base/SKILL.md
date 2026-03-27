---
name: knowledge-base
description: |
  知识库管理，支持文档自动归档、智能分类、混合检索和问答。
  Use when: (1) 用户上传文档时自动使用该技能进行归档(2) 基于知识库回答问题, (3) 查询已有文档内容, (4) 文档智能分类整理。
  **重要！！！：只要用户上传文档（PDF/Word/text/MD文本）四类文件，立即执行归档流程，无需等待用户明确说"归档"。**
---

# RAG Knowledge Base

本地RAG知识库系统，支持智能文档归档、混合检索和来源标注。

## 快速使用

### 文档自动归档

**触发条件**：用户上传、发送或引用任何文档时**自动执行**

```
用户上传PDF/Word/文本 → 立即自动归档
  ↓
检查重复 → 提取内容 → 智能分类 → 询问确认 → 归档并建立索引
```

**重复检测**：
- 归档前自动检查该文档是否已存在于知识库
- 如发现重复，提示用户并跳过归档
- 检测依据：文件名匹配

**无需等待用户说"归档"，看到文档就动手！**

### 知识库问答

```
用户提问 → 强制检索知识库 → 基于检索片段回答 → 标注来源
```

## 自动分类逻辑

1. 提取文档画像（标题/摘要/关键词/向量）
2. 匹配现有notebook相似度
3. 相似度≥0.6 → 建议归档到现有项目
4. 相似度<0.6 → **智能生成新项目名**（基于LLM理解内容，不再是简单截取标题）
5. 用户指定优先级最高

### 智能项目命名

当需要创建新项目时：
- **配置了 LLM API**：分析文档标题、摘要、关键词，调用 LLM 生成 3-15 字的简洁项目名
  - 例如 `"2024_Q1_产品需求文档_v3.pdf"` → 生成 `"产品需求"` 而不是 `"2024_Q1_产品需求"`
- **未配置 LLM**：直接使用标题截取作为项目名

### LLM配置（可选）

如需使用 LLM 智能命名，在 `~/.openclaw/workspace/.env` 中配置：

```bash
# RAG 知识库 LLM 配置（可选）
# 配置了则使用 LLM 智能命名，未配置则使用标题截取
RAG_API_KEY=sk-xxx  # OpenAI API Key
RAG_API_BASE=https://api.openai.com/v1
RAG_MODEL=gpt-3.5-turbo
RAG_TEMPERATURE=0.3
RAG_MAX_TOKENS=50
RAG_TIMEOUT=30
```

**配置项说明：**

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `RAG_API_KEY` | API密钥（配置了则启用 LLM 命名） | 空（标题截取） |
| `RAG_API_BASE` | API基础URL | `https://api.openai.com/v1` |
| `RAG_MODEL` | 模型名称 | `gpt-3.5-turbo` |
| `RAG_TEMPERATURE` | 生成温度 | `0.3` |
| `RAG_MAX_TOKENS` | 最大token数 | `50` |
| `RAG_TIMEOUT` | 请求超时（秒） | `30` |

**注意事项：**
- 不配置 `RAG_API_KEY` 时，自动使用标题截取作为项目名
- 支持任何 OpenAI 兼容的 API（如 Azure、本地模型等）

## 混合检索

- 向量检索：语义匹配，使用 all-MiniLM-L6-v2
- TF-IDF检索：关键词精确匹配
- RRF融合：Reciprocal Rank Fusion重排序
- Top-K片段注入上下文

## 兜底策略

知识库无命中时：
1. 自动联网搜索
2. 使用模型知识
3. 明确标注来源

## 脚本使用

技能自带虚拟环境 `.venv`，所有依赖已预装。使用方式：

```bash
# 使用虚拟环境的 Python 运行脚本
{baseDir}/.venv/bin/python {baseDir}/scripts/ingest.py <文件路径> [--notebook <项目名>]
{baseDir}/.venv/bin/python {baseDir}/scripts/retriever.py <查询> [--notebook <项目名>] [--top-k 5]
{baseDir}/.venv/bin/python {baseDir}/scripts/classifier.py <文件路径>
{baseDir}/.venv/bin/python {baseDir}/scripts/dependency_manager.py
```

**注意**：请勿直接使用系统 `python` 运行，必须使用技能目录下的虚拟环境。

## Notebook结构

```
docs-db/notebooks/{name}/
├── documents/
│   ├── raw/                # 原始文档（PDF、Word等）
│   │   └── {doc_id}_{filename}
│   └── text/               # Markdown格式的文本版本
│       └── {doc_id}_{filename}.md
├── chunks.jsonl            # 文本切片
└── index/
    ├── embeddings.npy      # 向量索引
    ├── tfidf_vectorizer.pkl
    ├── tfidf_matrix.npz
    └── metadata.jsonl
```

**说明：**
- `raw/` 目录存放原始上传的文档，保留原格式
- `text/` 目录存放转换后的Markdown格式，保留文档结构（标题、列表、表格等）
- 从PDF/Word提取时会自动转换为Markdown，保留页码、标题层级等信息
- 存储目录 `docs-db` 与技能名称 `knowledge-base` 分离，便于管理

## 自动依赖管理

技能已内置虚拟环境 `.venv`，所有依赖已预装。依赖管理脚本会自动使用虚拟环境。

### 依赖清单
- `sentence-transformers` - 文本向量化
- `scikit-learn` - TF-IDF计算
- `numpy` - 数值计算
- `scipy` - 稀疏矩阵
- `PyPDF2` - PDF解析
- `python-docx` - Word解析

### 依赖检查
如怀疑依赖损坏或缺失，运行：
```bash
{baseDir}/.venv/bin/python {baseDir}/scripts/dependency_manager.py
```

该脚本会：
1. **检查依赖**: 检测所需的Python包是否已安装
2. **自动安装**: 缺失的包自动调用pip安装
3. **镜像源切换**: 官方源失败时自动切换国内镜像
4. **失败汇报**: 所有安装失败都会明确告知用户

### 模型自动下载

Embedding模型（all-MiniLM-L6-v2，约80MB）首次使用时会自动下载：

```
📥 正在下载Embedding模型 (all-MiniLM-L6-v2)...
   模型大小: ~80MB，首次使用需要下载
   使用国内镜像源加速...
   ⏳ 请稍候...
   ✅ 模型下载完成！
   📁 缓存位置: ~/.cache/sentence-transformers
```

**镜像源**: 自动使用 `https://hf-mirror.com` 国内镜像加速

**手动下载**: 如果自动下载失败，可手动下载后放到缓存目录：
```bash
# 手动下载模型
https://hf-mirror.com/sentence-transformers/all-MiniLM-L6-v2
```

### 错误处理

所有自动修复失败时，会提供清晰的解决方案：

```
❌ 模型加载失败: <错误信息>
💡 可能的解决方案:
   1. 检查网络连接
   2. 手动下载: https://hf-mirror.com/sentence-transformers/all-MiniLM-L6-v2
   3. 将模型文件放入: ~/.cache/sentence-transformers
```

详见 [references/USAGE.md](references/USAGE.md)
