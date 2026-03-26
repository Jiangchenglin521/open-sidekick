# RAG Knowledge Base - 使用指南

## 虚拟环境说明

技能已自带虚拟环境 `.venv`，所有依赖已预装。请**务必使用虚拟环境的 Python** 运行脚本：

```bash
# ✅ 正确方式：使用虚拟环境
./.venv/bin/python scripts/ingest.py /path/to/doc.pdf
./.venv/bin/python scripts/retriever.py "查询内容"

# ❌ 错误方式：直接使用系统 python
python scripts/ingest.py /path/to/doc.pdf  # 会报依赖缺失错误
```

虚拟环境位置：`{skillDir}/.venv/`

---

## 首次使用准备

### 依赖检查

如需验证依赖完整性，运行：
```bash
./.venv/bin/python scripts/dependency_manager.py
```

### 模型自动下载

Embedding模型（约80MB）首次使用时会自动下载：

```
📥 正在下载Embedding模型 (all-MiniLM-L6-v2)...
   模型大小: ~80MB，首次使用需要下载
   使用国内镜像源加速...
   ⏳ 请稍候...
   ✅ 模型下载完成！
   📁 缓存位置: ~/.cache/sentence-transformers
```

**手动安装**（如果自动安装失败）：
```bash
# 激活虚拟环境后安装
source .venv/bin/activate
pip install sentence-transformers==2.5.1 scikit-learn==1.4.0 numpy==1.26.4 scipy==1.12.0 PyPDF2 python-docx

# 或切换到国内镜像
pip install -i https://mirrors.aliyun.com/pypi/simple/ sentence-transformers==2.5.1 scikit-learn==1.4.0 numpy==1.26.4 scipy==1.12.0 PyPDF2 python-docx
```

## 快速开始

### 1. 归档文档

```bash
# 自动分类归档
./.venv/bin/python scripts/ingest.py /path/to/document.pdf

# 指定归档位置
./.venv/bin/python scripts/ingest.py /path/to/document.pdf --notebook "智能家居"
```

### 2. 检索查询

```bash
# 全局检索
./.venv/bin/python scripts/retriever.py "小度如何控制智能家居"

# 指定notebook检索
./.venv/bin/python scripts/retriever.py "安装配置" --notebook "OpenClaw"
```

### 3. Notebook管理

```bash
# 列出所有notebook
./.venv/bin/python scripts/notebook_manager.py

# 创建notebook
./.venv/bin/python scripts/notebook_manager.py create "新项目"

# 删除notebook
./.venv/bin/python scripts/notebook_manager.py delete "旧项目"
```

## 工作流程

### 场景1: HTTP上传后归档

用户: "我刚上传了smart-home-guide.pdf"

系统自动:
1. 解析文档内容
2. 提取标题/摘要/关键词
3. 与现有notebook匹配
4. 建议归档位置
5. 切分chunk并建立索引

### 场景2: Workspace文件归档

用户: "uploads目录有新产品需求.pdf"

系统执行ingest流程，自动归档

### 场景3: 知识库问答

用户: "小度怎么配网？"

系统:
1. 向量化查询
2. 混合检索（向量+TF-IDF）
3. RRF融合排序
4. 注入Top-K片段
5. 生成带来源标注的回答

## 目录结构

```
knowledge-base/
├── notebooks/
│   └── {notebook-name}/
│       ├── documents/          # 原始文档
│       ├── chunks.jsonl        # 文本切片
│       └── index/
│           ├── embeddings.npy      # 向量索引
│           ├── tfidf_vectorizer.pkl
│           ├── tfidf_matrix.npz
│           └── metadata.jsonl
```

## 配置参数

编辑 `config.json`:

```json
{
  "embedding_model": "all-MiniLM-L6-v2",
  "embedding_dim": 384,
  "chunk_size": 256,
  "chunk_overlap": 50,
  "classify_threshold": 0.6,
  "top_k_retrieval": 5,
  "rrf_k": 60
}
```

## 技术细节

### 自动分类算法

1. 提取文档画像（标题+摘要+关键词）
2. 向量化文档
3. 计算与每个notebook的向量相似度
4. 相似度≥0.6 → 归档到现有项目
5. 相似度<0.6 → **智能生成新项目名**（LLM基于内容理解生成，非简单标题截取）

### 智能命名示例

| 文档标题 | 智能生成的项目名 |
|----------|------------------|
| `2024_Q1_产品需求文档_v3.pdf` | `产品需求` |
| `小度音箱硬件规格说明书_内部版.docx` | `小度音箱` |
| `Git工作流与分支管理规范.md` | `Git规范` |
| `2025年度市场营销预算表.xlsx` | `营销预算` |

### LLM配置说明

如需使用外部LLM（如OpenAI）进行智能命名，编辑配置文件：

```bash
# 编辑配置文件
nano ~/.openclaw/workspace/skills/rag-knowledge-base/config.json
```

**配置示例（使用OpenAI）：**

```json
{
  "llm": {
    "provider": "openai",
    "api_key": "sk-xxxxxxxxxxxxxxxxxxxxxxxx",
    "api_base": "https://api.openai.com/v1",
    "model": "gpt-3.5-turbo",
    "temperature": 0.3,
    "max_tokens": 50
  }
}
```

**配置示例（使用兼容API，如Azure/代理）：**

```json
{
  "llm": {
    "provider": "openai",
    "api_key": "your-api-key",
    "api_base": "https://your-proxy.com/v1",
    "model": "gpt-4",
    "temperature": 0.3,
    "max_tokens": 50
  }
}
```

**不配置LLM时**，系统默认使用 `openclaw` provider，调用本地agent进行命名。

### 混合检索算法

1. 向量检索：语义相似度（all-MiniLM-L6-v2）
2. TF-IDF检索：关键词匹配
3. RRF融合：Reciprocal Rank Fusion
   - score = Σ 1/(k + rank)
4. 取Top-K结果

### Chunk切分策略

- 大小: 256字符
- 重叠: 50字符
- 边界: 优先在句子/段落边界切分
