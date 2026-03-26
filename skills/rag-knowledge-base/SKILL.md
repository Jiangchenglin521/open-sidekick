---
name: rag-knowledge-base
description: >
  RAG知识库管理，支持文档自动归档、智能分类、混合检索和问答。
  Use when: (1) 用户上传或提及文档需要归档到知识库,
  (2) 用户提问需要基于知识库检索回答,
  (3) 用户查询"xxx相关内容",
  (4) 用户要求"查一下知识库",
  (5) 需要基于已有文档回答问题。
  自动归档支持智能分类到现有notebook或创建新项目。
---

# RAG Knowledge Base

本地RAG知识库系统，支持智能文档归档、混合检索和来源标注。

## 快速使用

### 文档归档

```
用户: "上传了xxx.pdf" 或 "uploads下有文件"
→ 自动提取内容 → 智能分类 → 询问确认 → 归档并建立索引
```

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

当需要创建新项目时，系统会：
- 分析文档标题、摘要、关键词
- 调用LLM生成3-15字的简洁项目名
- 例如 `"2024_Q1_产品需求文档_v3.pdf"` → 生成 `"产品需求"` 而不是 `"2024_Q1_产品需求"`
- 失败时回退到原标题截取

### LLM配置（统一 .env 文件）

配置文件路径：`~/.openclaw/workspace/.env`

```bash
# RAG 知识库 LLM 配置
RAG_LLM_PROVIDER=openclaw
RAG_API_KEY=
RAG_API_BASE=https://api.openai.com/v1
RAG_MODEL=gpt-3.5-turbo
RAG_TEMPERATURE=0.3
RAG_MAX_TOKENS=50
RAG_TIMEOUT=30
```

**注意**：不再使用 `config.json`，请迁移到统一 `.env` 文件。

**配置项说明：**

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `RAG_LLM_PROVIDER` | LLM提供商：`openclaw` 或 `openai` | `openclaw` |
| `RAG_API_KEY` | API密钥（使用外部LLM时必填） | 空 |
| `RAG_API_BASE` | API基础URL | `https://api.openai.com/v1` |
| `RAG_MODEL` | 模型名称 | `gpt-3.5-turbo` |
| `RAG_TEMPERATURE` | 生成温度 | `0.3` |
| `RAG_MAX_TOKENS` | 最大token数 | `50` |
| `RAG_TIMEOUT` | 请求超时（秒） | `30` |

**使用方式：**
- **方式1（默认）**：`RAG_LLM_PROVIDER=openclaw` - 使用OpenClaw内置agent，无需额外配置
- **方式2**：`RAG_LLM_PROVIDER=openai` + 填写 `RAG_API_KEY` - 使用OpenAI API或其他兼容API

**注意事项：**
- 不配置LLM时，智能命名功能自动回退到原标题截取
- 建议优先使用 `openclaw` 方式，无需额外API成本

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
knowledge-base/notebooks/{name}/
├── documents/          # 原始文档
├── chunks.jsonl        # 文本切片
└── index/
    ├── embeddings.npy      # 向量索引
    ├── tfidf_vectorizer.pkl
    ├── tfidf_matrix.npz
    └── metadata.jsonl
```

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
