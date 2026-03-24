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
4. 相似度<0.6 → 建议创建新项目
5. 用户指定优先级最高

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

```bash
# 归档文档
python {baseDir}/scripts/ingest.py <文件路径> [--notebook <项目名>]

# 检索
python {baseDir}/scripts/retriever.py <查询> [--notebook <项目名>] [--top-k 5]

# 分类测试
python {baseDir}/scripts/classifier.py <文件路径>
```

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

## ⚠️ 模型缓存路径

**实际路径**：
```
~/.cache/sentence-transformers/
└── models--sentence-transformers--all-MiniLM-L6-v2/
```

**检查命令**：
```bash
ls -la ~/.cache/sentence-transformers/models--sentence-transformers--all-MiniLM-L6-v2/
```

**配置位置**：`scripts/embedder.py` 中的 `cache_dir` 变量

详见 [references/USAGE.md](references/USAGE.md)
