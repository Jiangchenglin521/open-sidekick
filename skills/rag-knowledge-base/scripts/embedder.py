#!/usr/bin/env python3
"""
本地Embedding模块 - 使用 all-MiniLM-L6-v2
轻量、离线、384维向量
"""

import os
import numpy as np
from typing import List, Union

# 延迟加载sentence-transformers
_model = None

def get_model():
    """延迟加载模型，首次使用时下载"""
    global _model
    if _model is None:
        # 使用国内镜像源
        os.environ.setdefault('HF_ENDPOINT', 'https://hf-mirror.com')
        from sentence_transformers import SentenceTransformer
        model_name = "sentence-transformers/all-MiniLM-L6-v2"
        cache_dir = os.path.expanduser("~/.cache/sentence-transformers")
        _model = SentenceTransformer(model_name, cache_folder=cache_dir)
    return _model

def encode(texts: Union[str, List[str]], normalize: bool = True) -> np.ndarray:
    """
    将文本编码为向量
    
    Args:
        texts: 单条文本或文本列表
        normalize: 是否L2归一化（方便余弦相似度计算）
    
    Returns:
        numpy数组 (N, 384)
    """
    model = get_model()
    
    if isinstance(texts, str):
        texts = [texts]
    
    embeddings = model.encode(
        texts,
        convert_to_numpy=True,
        normalize_embeddings=normalize,
        show_progress_bar=False
    )
    
    return embeddings

def encode_chunks(chunks: List[str]) -> np.ndarray:
    """批量编码文本切片"""
    return encode(chunks, normalize=True)

def cosine_similarity(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    """计算余弦相似度（假设已归一化）"""
    return np.dot(a, b.T)

# 测试
if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        text = sys.argv[1]
        vec = encode(text)
        print(f"文本: {text}")
        print(f"向量维度: {vec.shape}")
        print(f"向量前5维: {vec[0, :5]}")
    else:
        # 批量测试
        texts = ["智能家居控制", "量子计算原理", "会议纪要模板"]
        vecs = encode(texts)
        print(f"批量编码: {len(texts)} 条文本")
        print(f"输出形状: {vecs.shape}")
        # 计算相似度
        sim = cosine_similarity(vecs[0:1], vecs[1:])
        print(f"相似度矩阵: {sim}")
