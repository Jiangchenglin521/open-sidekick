# RAG Knowledge Base - 使用指南

## 快速开始

### 1. 归档文档

```bash
# 自动分类归档
python scripts/ingest.py /path/to/document.pdf

# 指定归档位置
python scripts/ingest.py /path/to/document.pdf --notebook "智能家居"
```

### 2. 检索查询

```bash
# 全局检索
python scripts/retriever.py "小度如何控制智能家居"

# 指定notebook检索
python scripts/retriever.py "安装配置" --notebook "OpenClaw"
```

### 3. Notebook管理

```bash
# 列出所有notebook
python scripts/notebook_manager.py

# 创建notebook
python scripts/notebook_manager.py create "新项目"

# 删除notebook
python scripts/notebook_manager.py delete "旧项目"
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
5. 相似度<0.6 → 创建新项目

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
