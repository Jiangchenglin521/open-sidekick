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

def get_cache_dir():
    """获取模型缓存目录"""
    return os.path.expanduser("~/.cache/sentence-transformers")

def check_model_cached():
    """检查模型是否已下载到本地"""
    cache_dir = get_cache_dir()
    model_dir = os.path.join(cache_dir, "models--sentence-transformers--all-MiniLM-L6-v2")
    
    if not os.path.exists(model_dir):
        return False
    
    # 检查是否有实际的模型文件
    snapshots_dir = os.path.join(model_dir, "snapshots")
    if not os.path.exists(snapshots_dir):
        return False
    
    # 检查snapshots下是否有内容
    try:
        snapshots = os.listdir(snapshots_dir)
        if not snapshots:
            return False
        # 检查第一个snapshot下是否有模型文件
        first_snapshot = os.path.join(snapshots_dir, snapshots[0])
        if os.path.isdir(first_snapshot):
            files = os.listdir(first_snapshot)
            # 检查关键的模型文件
            has_model = any(f.endswith('.bin') or f == 'config.json' for f in files)
            return has_model
    except:
        pass
    
    return False

def get_model():
    """延迟加载模型，优先使用本地缓存"""
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        
        cache_dir = get_cache_dir()
        
        # 优先尝试本地路径加载
        local_model_path = os.path.join(
            cache_dir,
            "models--sentence-transformers--all-MiniLM-L6-v2",
            "snapshots"
        )
        
        if os.path.exists(local_model_path):
            try:
                snapshots = os.listdir(local_model_path)
                if snapshots:
                    local_path = os.path.join(local_model_path, snapshots[0])
                    _model = SentenceTransformer(local_path)
                    return _model
            except:
                pass
        
        # 本地加载失败，尝试在线下载
        print("📥 本地模型未找到，正在下载Embedding模型...")
        print("   模型大小: ~80MB")
        print("   ⏳ 请稍候...")
        
        # 使用国内镜像源
        os.environ.setdefault('HF_ENDPOINT', 'https://hf-mirror.com')
        
        try:
            model_name = "sentence-transformers/all-MiniLM-L6-v2"
            _model = SentenceTransformer(model_name, cache_folder=cache_dir)
            print("   ✅ 模型下载完成！")
            print(f"   📁 缓存位置: {cache_dir}")
        except Exception as e:
            print(f"   ❌ 模型加载失败: {e}")
            print("   💡 解决方案:")
            print("      1. 检查网络连接")
            print("      2. 手动下载: https://hf-mirror.com/sentence-transformers/all-MiniLM-L6-v2")
            print("      3. 将模型文件放入:", cache_dir)
            raise
    
    return _model

def encode(texts: Union[str, List[str]], normalize: bool = True, show_progress: bool = False) -> np.ndarray:
    """
    将文本编码为向量
    
    Args:
        texts: 单条文本或文本列表
        normalize: 是否L2归一化（方便余弦相似度计算）
        show_progress: 是否显示编码进度
    
    Returns:
        numpy数组 (N, 384)
    """
    model = get_model()
    
    if isinstance(texts, str):
        texts = [texts]
    
    if show_progress and len(texts) > 10:
        print(f"🔄 正在编码 {len(texts)} 条文本...")
    
    embeddings = model.encode(
        texts,
        convert_to_numpy=True,
        normalize_embeddings=normalize,
        show_progress_bar=show_progress and len(texts) > 10
    )
    
    if show_progress and len(texts) > 10:
        print(f"   ✅ 编码完成，输出维度: {embeddings.shape}")
    
    return embeddings

def encode_chunks(chunks: List[str], show_progress: bool = False) -> np.ndarray:
    """批量编码文本切片"""
    return encode(chunks, normalize=True, show_progress=show_progress)

def cosine_similarity(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    """计算余弦相似度（假设已归一化）"""
    return np.dot(a, b.T)

# 测试
if __name__ == "__main__":
    import sys
    
    print("🔍 检查模型状态...")
    if check_model_cached():
        print("   ✅ 模型已缓存")
    else:
        print("   ⚠️ 模型未下载，将自动下载")
    
    if len(sys.argv) > 1:
        text = sys.argv[1]
        vec = encode(text, show_progress=True)
        print(f"\n文本: {text}")
        print(f"向量维度: {vec.shape}")
        print(f"向量前5维: {vec[0, :5]}")
    else:
        # 批量测试
        texts = ["智能家居控制", "量子计算原理", "会议纪要模板"]
        print(f"\n批量编码: {len(texts)} 条文本")
        vecs = encode(texts, show_progress=True)
        print(f"输出形状: {vecs.shape}")
        # 计算相似度
        sim = cosine_similarity(vecs[0:1], vecs[1:])
        print(f"相似度矩阵: {sim}")
