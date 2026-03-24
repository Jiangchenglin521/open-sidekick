#!/usr/bin/env python3
"""
Notebook管理器 - 创建、读取、更新Notebook
"""

import os
import json
import shutil
from pathlib import Path
from typing import List, Optional

class NotebookManager:
    """Notebook管理"""
    
    def __init__(self, kb_base_path: str = None):
        if kb_base_path is None:
            kb_base_path = os.path.expanduser("~/.openclaw/workspace/knowledge-base")
        self.kb_base_path = kb_base_path
        self.notebooks_path = os.path.join(kb_base_path, "notebooks")
        os.makedirs(self.notebooks_path, exist_ok=True)
    
    def create_notebook(self, name: str) -> str:
        """创建新notebook，返回路径"""
        # 清理名称
        name = self._sanitize_name(name)
        notebook_path = os.path.join(self.notebooks_path, name)
        
        if os.path.exists(notebook_path):
            # 名称已存在，添加序号
            base_name = name
            i = 1
            while os.path.exists(notebook_path):
                name = f"{base_name}_{i}"
                notebook_path = os.path.join(self.notebooks_path, name)
                i += 1
        
        # 创建目录结构
        os.makedirs(os.path.join(notebook_path, "documents"), exist_ok=True)
        
        return notebook_path
    
    def list_notebooks(self) -> List[str]:
        """列出所有notebook名称"""
        if not os.path.exists(self.notebooks_path):
            return []
        return sorted([d for d in os.listdir(self.notebooks_path) 
                      if os.path.isdir(os.path.join(self.notebooks_path, d))])
    
    def notebook_exists(self, name: str) -> bool:
        """检查notebook是否存在"""
        return os.path.exists(os.path.join(self.notebooks_path, name))
    
    def get_notebook_path(self, name: str) -> str:
        """获取notebook路径"""
        return os.path.join(self.notebooks_path, name)
    
    def get_documents_path(self, name: str) -> str:
        """获取notebook的文档目录"""
        return os.path.join(self.notebooks_path, name, "documents")
    
    def get_chunks_path(self, name: str) -> str:
        """获取notebook的chunks文件路径"""
        return os.path.join(self.notebooks_path, name, "chunks.jsonl")
    
    def get_index_path(self, name: str) -> str:
        """获取notebook的索引目录"""
        return os.path.join(self.notebooks_path, name, "index")
    
    def delete_notebook(self, name: str) -> bool:
        """删除notebook"""
        path = self.get_notebook_path(name)
        if os.path.exists(path):
            shutil.rmtree(path)
            return True
        return False
    
    def _sanitize_name(self, name: str) -> str:
        """清理notebook名称"""
        import re
        # 移除危险字符
        name = re.sub(r'[<>:"|?*]', '', name)
        # 替换斜杠和反斜杠
        name = name.replace('/', '-').replace('\\', '-')
        # 限制长度
        name = name[:50].strip()
        return name or "未命名"
    
    def get_stats(self, name: str) -> dict:
        """获取notebook统计信息"""
        path = self.get_notebook_path(name)
        if not os.path.exists(path):
            return {}
        
        docs_path = self.get_documents_path(name)
        chunks_path = self.get_chunks_path(name)
        index_path = self.get_index_path(name)
        
        doc_count = len([f for f in os.listdir(docs_path) 
                        if os.path.isfile(os.path.join(docs_path, f))]) if os.path.exists(docs_path) else 0
        
        chunk_count = 0
        if os.path.exists(chunks_path):
            with open(chunks_path, 'r', encoding='utf-8') as f:
                chunk_count = sum(1 for _ in f)
        
        has_index = os.path.exists(os.path.join(index_path, "embeddings.npy"))
        
        return {
            "name": name,
            "documents": doc_count,
            "chunks": chunk_count,
            "indexed": has_index
        }
    
    def get_all_stats(self) -> List[dict]:
        """获取所有notebook统计"""
        return [self.get_stats(name) for name in self.list_notebooks()]

# CLI入口
if __name__ == "__main__":
    import sys
    
    manager = NotebookManager()
    
    if len(sys.argv) < 2:
        # 列出所有notebook
        notebooks = manager.list_notebooks()
        if notebooks:
            print("📚 知识库中的Notebook:")
            for name in notebooks:
                stats = manager.get_stats(name)
                print(f"   📁 {name}")
                print(f"      文档: {stats['documents']}, 切片: {stats['chunks']}, 索引: {'✓' if stats['indexed'] else '✗'}")
        else:
            print("📭 知识库为空")
        sys.exit(0)
    
    cmd = sys.argv[1]
    
    if cmd == "create" and len(sys.argv) > 2:
        name = sys.argv[2]
        path = manager.create_notebook(name)
        print(f"✅ 创建Notebook: {os.path.basename(path)}")
        print(f"   路径: {path}")
    
    elif cmd == "delete" and len(sys.argv) > 2:
        name = sys.argv[2]
        if manager.delete_notebook(name):
            print(f"✅ 删除Notebook: {name}")
        else:
            print(f"❌ Notebook不存在: {name}")
    
    elif cmd == "list":
        for name in manager.list_notebooks():
            print(name)
    
    else:
        print("Usage: notebook_manager.py [create|delete|list] [name]")
