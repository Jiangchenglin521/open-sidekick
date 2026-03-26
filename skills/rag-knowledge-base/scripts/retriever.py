#!/usr/bin/env python3
"""
混合检索引擎 - 向量+TF-IDF+RRF融合
"""

import os
import sys
import json
import argparse
from typing import List, Tuple, Dict

# 添加脚本目录到路径
script_dir = os.path.dirname(__file__)
sys.path.insert(0, script_dir)

# 检查是否使用虚拟环境的Python
venv_python = os.path.join(os.path.dirname(script_dir), '.venv', 'bin', 'python')
if sys.executable != venv_python and os.path.exists(venv_python):
    print("⚠️  警告: 未使用虚拟环境的 Python")
    print(f"   当前: {sys.executable}")
    print(f"   应使用: {venv_python}")
    print("   请使用: ./.venv/bin/python scripts/retriever.py")
    print()

# 首先检查并安装依赖
try:
    from dependency_manager import ensure_deps
    if not ensure_deps():
        print("❌ 依赖安装失败，无法继续检索")
        print("💡 请尝试使用虚拟环境的 Python:")
        print(f"   {venv_python} {os.path.abspath(__file__)}")
        sys.exit(1)
except Exception as e:
    print(f"⚠️  依赖检查失败: {e}")
    print("   继续尝试执行...")

import numpy as np

from embedder import encode, cosine_similarity
from notebook_manager import NotebookManager

class HybridRetriever:
    """混合检索器"""
    
    def __init__(self, notebook: str = None, kb_base_path: str = None):
        if kb_base_path is None:
            kb_base_path = os.path.expanduser("~/.openclaw/workspace/knowledge-base")
        self.kb_base_path = kb_base_path
        self.manager = NotebookManager(kb_base_path)
        
        # 加载指定notebook或全局
        self.target_notebook = notebook
        self.embeddings = None
        self.tfidf_matrix = None
        self.tfidf_vectorizer = None
        self.chunks = []
        
        self._load_index()
    
    def _load_index(self):
        """加载索引"""
        if self.target_notebook:
            self._load_notebook_index(self.target_notebook)
        else:
            # 加载所有notebook
            self._load_all_notebooks()
    
    def _load_notebook_index(self, notebook: str):
        """加载单个notebook的索引"""
        index_path = self.manager.get_index_path(notebook)
        
        # 加载向量
        embeddings_file = os.path.join(index_path, "embeddings.npy")
        if os.path.exists(embeddings_file):
            if self.embeddings is None:
                self.embeddings = np.load(embeddings_file)
            else:
                self.embeddings = np.vstack([self.embeddings, np.load(embeddings_file)])
        
        # 加载TF-IDF
        import pickle
        from scipy import sparse
        
        tfidf_file = os.path.join(index_path, "tfidf_matrix.npz")
        if os.path.exists(tfidf_file):
            matrix = sparse.load_npz(tfidf_file)
            if self.tfidf_matrix is None:
                self.tfidf_matrix = matrix
            else:
                self.tfidf_matrix = sparse.vstack([self.tfidf_matrix, matrix])
        
        vectorizer_file = os.path.join(index_path, "tfidf_vectorizer.pkl")
        if os.path.exists(vectorizer_file):
            with open(vectorizer_file, 'rb') as f:
                # 只保留一个vectorizer（简化处理）
                self.tfidf_vectorizer = pickle.load(f)
        
        # 加载chunks
        chunks_file = self.manager.get_chunks_path(notebook)
        if os.path.exists(chunks_file):
            with open(chunks_file, 'r', encoding='utf-8') as f:
                for line in f:
                    self.chunks.append(json.loads(line))
    
    def _load_all_notebooks(self):
        """加载所有notebook的索引"""
        for notebook in self.manager.list_notebooks():
            self._load_notebook_index(notebook)
    
    def vector_search(self, query: str, top_k: int = 10) -> List[Tuple[int, float]]:
        """向量检索"""
        if self.embeddings is None or len(self.embeddings) == 0:
            return []
        
        query_vec = encode(query)
        scores = cosine_similarity(query_vec, self.embeddings)[0]
        
        # 取top-k
        top_indices = np.argsort(scores)[-top_k:][::-1]
        return [(int(idx), float(scores[idx])) for idx in top_indices]
    
    def tfidf_search(self, query: str, top_k: int = 10) -> List[Tuple[int, float]]:
        """TF-IDF检索"""
        if self.tfidf_matrix is None or self.tfidf_vectorizer is None:
            return []
        
        query_vec = self.tfidf_vectorizer.transform([query])
        from sklearn.metrics.pairwise import cosine_similarity as sk_cosine
        scores = sk_cosine(query_vec, self.tfidf_matrix)[0]
        
        # 取top-k
        top_indices = np.argsort(scores)[-top_k:][::-1]
        return [(int(idx), float(scores[idx])) for idx in top_indices]
    
    def rrf_fusion(self, vector_results: List[Tuple[int, float]], 
                   tfidf_results: List[Tuple[int, float]], 
                   k: int = 60) -> List[Tuple[int, float]]:
        """
        Reciprocal Rank Fusion融合
        
        score = Σ 1/(k + rank)
        """
        scores = {}
        
        # 向量检索打分
        for rank, (doc_id, _) in enumerate(vector_results):
            scores[doc_id] = scores.get(doc_id, 0) + 1.0 / (k + rank + 1)
        
        # TF-IDF检索打分
        for rank, (doc_id, _) in enumerate(tfidf_results):
            scores[doc_id] = scores.get(doc_id, 0) + 1.0 / (k + rank + 1)
        
        # 按总分排序
        sorted_results = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        return [(doc_id, score) for doc_id, score in sorted_results]
    
    def search(self, query: str, top_k: int = 5, use_rrf: bool = True) -> List[Dict]:
        """
        混合检索
        
        Returns:
            检索结果列表，包含text, source, score等信息
        """
        # 两种检索
        vector_results = self.vector_search(query, top_k=top_k * 2)
        tfidf_results = self.tfidf_search(query, top_k=top_k * 2)
        
        if use_rrf and vector_results and tfidf_results:
            # RRF融合
            fused = self.rrf_fusion(vector_results, tfidf_results)
        elif vector_results:
            fused = [(idx, score) for idx, score in vector_results]
        elif tfidf_results:
            fused = [(idx, score) for idx, score in tfidf_results]
        else:
            return []
        
        # 组装结果
        results = []
        for idx, score in fused[:top_k]:
            if 0 <= idx < len(self.chunks):
                chunk = self.chunks[idx]
                results.append({
                    "text": chunk["text"],
                    "source": chunk.get("source", "未知"),
                    "notebook": chunk.get("notebook", "default"),
                    "chunk_id": chunk.get("id", str(idx)),
                    "score": score,
                    "index": idx
                })
        
        return results
    
    def format_context(self, results: List[Dict], max_tokens: int = 2000) -> str:
        """格式化检索结果为上下文"""
        context_parts = []
        total_len = 0
        
        for i, result in enumerate(results):
            text = result["text"]
            source = result["source"]
            
            part = f"[片段{i+1}] 来源: {source}\n{text}\n\n"
            
            if total_len + len(part) > max_tokens:
                break
            
            context_parts.append(part)
            total_len += len(part)
        
        return "".join(context_parts)

# CLI入口
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="混合检索工具")
    parser.add_argument("query", help="查询内容")
    parser.add_argument("--notebook", "-n", help="指定notebook")
    parser.add_argument("--top-k", "-k", type=int, default=5, help="返回结果数量")
    
    args = parser.parse_args()
    
    retriever = HybridRetriever(notebook=args.notebook)
    results = retriever.search(args.query, top_k=args.top_k)
    
    if not results:
        print("🔍 未找到相关内容")
        sys.exit(0)
    
    print(f"🔍 检索结果 (Top {len(results)}):")
    print("=" * 60)
    
    for i, result in enumerate(results):
        print(f"\n[{i+1}] 来源: {result['source']} (Notebook: {result['notebook']})")
        print(f"    相关度: {result['score']:.3f}")
        print(f"    内容: {result['text'][:200]}...")
    
    print("\n" + "=" * 60)
    print("📚 格式化上下文:")
    print(retriever.format_context(results, max_tokens=1000))
