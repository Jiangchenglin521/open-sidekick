#!/usr/bin/env python3
"""
文档摄入模块 - 完整流程：解析→分类→切片→索引
"""

import os
import sys
import json
import argparse
import hashlib
import shutil
from pathlib import Path
from datetime import datetime

# 添加脚本目录到路径
script_dir = os.path.dirname(__file__)
sys.path.insert(0, script_dir)

# 检查是否使用虚拟环境的Python
venv_python = os.path.join(os.path.dirname(script_dir), '.venv', 'bin', 'python')
if sys.executable != venv_python and os.path.exists(venv_python):
    print("⚠️  警告: 未使用虚拟环境的 Python")
    print(f"   当前: {sys.executable}")
    print(f"   应使用: {venv_python}")
    print("   请使用: ./.venv/bin/python scripts/ingest.py")
    print()

# 首先检查并安装依赖
try:
    from dependency_manager import ensure_deps
    if not ensure_deps():
        print("❌ 依赖安装失败，无法继续归档")
        print("💡 请尝试使用虚拟环境的 Python:")
        print(f"   {venv_python} {os.path.abspath(__file__)}")
        sys.exit(1)
except Exception as e:
    print(f"⚠️  依赖检查失败: {e}")
    print("   继续尝试执行...")

import numpy as np
from embedder import encode_chunks
from classifier import AutoClassifier
from notebook_manager import NotebookManager

class DocumentIngester:
    """文档摄入器"""
    
    def __init__(self, kb_base_path: str = None):
        if kb_base_path is None:
            kb_base_path = os.path.expanduser("~/.openclaw/workspace/knowledge-base")
        self.kb_base_path = kb_base_path
        self.classifier = AutoClassifier(kb_base_path)
        self.manager = NotebookManager(kb_base_path)
    
    def parse_document(self, file_path: str) -> tuple:
        """解析文档，返回(内容, 标题)"""
        file_path = os.path.expanduser(file_path)
        title = os.path.basename(file_path)
        ext = Path(file_path).suffix.lower()
        
        if ext == '.pdf':
            content = self._parse_pdf(file_path)
        elif ext in ['.docx', '.doc']:
            content = self._parse_docx(file_path)
        elif ext in ['.txt', '.md', '.markdown']:
            content = self._parse_text(file_path)
        else:
            # 尝试作为文本读取
            try:
                content = self._parse_text(file_path)
            except:
                raise ValueError(f"不支持的文件格式: {ext}")
        
        return content, title
    
    def _parse_pdf(self, file_path: str) -> str:
        """解析PDF"""
        try:
            from PyPDF2 import PdfReader
            reader = PdfReader(file_path)
            text_parts = []
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    text_parts.append(text)
            return "\n\n".join(text_parts)
        except ImportError:
            print("⚠️  PyPDF2未安装，尝试纯文本读取")
            return self._parse_text(file_path)
    
    def _parse_docx(self, file_path: str) -> str:
        """解析Word"""
        try:
            from docx import Document
            doc = Document(file_path)
            return "\n\n".join([para.text for para in doc.paragraphs if para.text])
        except ImportError:
            print("⚠️  python-docx未安装，尝试纯文本读取")
            return self._parse_text(file_path)
    
    def _parse_text(self, file_path: str) -> str:
        """解析文本文件"""
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()
    
    def chunk_text(self, text: str, chunk_size: int = 256, overlap: int = 50) -> list:
        """将文本切分为重叠的chunk"""
        chunks = []
        start = 0
        text_len = len(text)
        
        while start < text_len:
            end = start + chunk_size
            chunk = text[start:end]
            
            # 尽量在句子边界切分
            if end < text_len:
                # 向后找句号、换行或空格
                for i in range(min(50, len(chunk)), 0, -1):
                    if chunk[-i] in '。！？\n ':
                        chunk = chunk[:-i]
                        break
            
            if chunk.strip():
                chunks.append(chunk.strip())
            
            start += chunk_size - overlap
        
        return chunks
    
    def ingest(self, file_path: str, notebook: str = None, auto_classify: bool = True) -> dict:
        """
        摄入文档
        
        Args:
            file_path: 文档路径
            notebook: 指定notebook（None则自动分类）
            auto_classify: 是否自动分类
        
        Returns:
            摄入结果信息
        """
        print(f"📥 正在处理: {file_path}")
        
        # 1. 解析文档
        content, title = self.parse_document(file_path)
        print(f"📄 解析完成: {len(content)} 字符")
        
        # 2. 确定目标notebook
        if notebook:
            # 用户指定
            target_notebook = notebook
            decision = "user_specified"
            similarity = 1.0
            
            # 如果不存在则创建
            if not self.manager.notebook_exists(target_notebook):
                self.manager.create_notebook(target_notebook)
                print(f"✨ 创建新Notebook: {target_notebook}")
        elif auto_classify:
            # 自动分类
            profile = self.classifier.extract_document_profile(content, title)
            target_notebook, decision, similarity = self.classifier.classify(profile)
            
            if decision == "create_new":
                self.manager.create_notebook(target_notebook)
                print(f"✨ 创建新Notebook: {target_notebook}")
            
            # 打印分类详情
            all_sims = self.classifier.get_all_similarities(profile)
            if all_sims:
                print("🔍 相似度排名:")
                for nb, sim in all_sims[:3]:
                    print(f"   {'✓' if nb == target_notebook else ' '} {nb}: {sim:.1%}")
        else:
            target_notebook = "default"
            decision = "default"
            similarity = 0.0
            if not self.manager.notebook_exists(target_notebook):
                self.manager.create_notebook(target_notebook)
        
        # 3. 复制文档到notebook
        doc_id = hashlib.md5(f"{file_path}{datetime.now()}".encode()).hexdigest()[:8]
        ext = Path(file_path).suffix
        dest_filename = f"{doc_id}_{title}"
        dest_path = os.path.join(self.manager.get_documents_path(target_notebook), dest_filename)
        
        shutil.copy2(file_path, dest_path)
        
        # 4. 切分chunk
        chunks = self.chunk_text(content)
        print(f"✂️  切分为 {len(chunks)} 个chunk")
        
        # 5. 生成向量
        print("🔄 正在生成向量索引...")
        embeddings = encode_chunks(chunks, show_progress=True)
        
        # 6. 生成TF-IDF
        from sklearn.feature_extraction.text import TfidfVectorizer
        tfidf = TfidfVectorizer(max_features=5000)
        tfidf_matrix = tfidf.fit_transform(chunks)
        
        # 7. 保存索引
        index_path = self.manager.get_index_path(target_notebook)
        os.makedirs(index_path, exist_ok=True)
        
        # 保存chunks元数据
        chunks_data = []
        for i, chunk in enumerate(chunks):
            chunks_data.append({
                "id": f"{doc_id}_{i}",
                "text": chunk,
                "source": title,
                "doc_id": doc_id,
                "chunk_index": i,
                "notebook": target_notebook
            })
        
        # 追加或创建chunks.jsonl
        chunks_file = os.path.join(self.manager.get_notebook_path(target_notebook), "chunks.jsonl")
        with open(chunks_file, 'a', encoding='utf-8') as f:
            for item in chunks_data:
                f.write(json.dumps(item, ensure_ascii=False) + '\n')
        
        # 保存向量（追加模式）
        embeddings_file = os.path.join(index_path, "embeddings.npy")
        if os.path.exists(embeddings_file):
            existing = np.load(embeddings_file)
            all_embeddings = np.vstack([existing, embeddings])
        else:
            all_embeddings = embeddings
        np.save(embeddings_file, all_embeddings)
        
        # 保存TF-IDF（简化：每次重建）
        import pickle
        with open(os.path.join(index_path, "tfidf_vectorizer.pkl"), 'wb') as f:
            pickle.dump(tfidf, f)
        
        # 更新TF-IDF矩阵（追加）
        tfidf_file = os.path.join(index_path, "tfidf_matrix.npz")
        from scipy import sparse
        if os.path.exists(tfidf_file):
            existing_tfidf = sparse.load_npz(tfidf_file)
            all_tfidf = sparse.vstack([existing_tfidf, tfidf_matrix])
        else:
            all_tfidf = tfidf_matrix
        sparse.save_npz(tfidf_file, all_tfidf)
        
        print(f"✅ 归档完成!")
        print(f"   📁 Notebook: {target_notebook}")
        print(f"   📝 文档: {title}")
        print(f"   🧩 Chunks: {len(chunks)}")
        
        return {
            "doc_id": doc_id,
            "notebook": target_notebook,
            "decision": decision,
            "similarity": similarity,
            "chunks": len(chunks),
            "dest_path": dest_path
        }

# CLI入口
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="文档摄入工具")
    parser.add_argument("file", help="文档路径")
    parser.add_argument("--notebook", "-n", help="指定归档的notebook")
    parser.add_argument("--auto-classify", "-a", action="store_true", default=True, help="自动分类")
    
    args = parser.parse_args()
    
    ingester = DocumentIngester()
    result = ingester.ingest(args.file, args.notebook, args.auto_classify)
    
    print("\n📊 摄入结果:")
    print(json.dumps(result, ensure_ascii=False, indent=2))
