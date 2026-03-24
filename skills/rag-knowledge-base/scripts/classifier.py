#!/usr/bin/env python3
"""
自动分类器 - 智能匹配文档到Notebook
"""

import os
import json
import numpy as np
from pathlib import Path
from typing import List, Tuple, Optional

# 导入嵌入模块
import sys
sys.path.insert(0, os.path.dirname(__file__))
from embedder import encode, cosine_similarity

class AutoClassifier:
    """自动文档分类器"""
    
    def __init__(self, kb_base_path: str = None):
        if kb_base_path is None:
            kb_base_path = os.path.expanduser("~/.openclaw/workspace/knowledge-base")
        self.kb_base_path = kb_base_path
        self.notebooks_path = os.path.join(kb_base_path, "notebooks")
        
    def list_notebooks(self) -> List[str]:
        """列出所有notebook"""
        if not os.path.exists(self.notebooks_path):
            return []
        return [d for d in os.listdir(self.notebooks_path) 
                if os.path.isdir(os.path.join(self.notebooks_path, d))]
    
    def get_notebook_vector(self, notebook_name: str) -> Optional[np.ndarray]:
        """获取notebook的代表向量（所有文档向量的平均）"""
        index_path = os.path.join(self.notebooks_path, notebook_name, "index")
        embeddings_path = os.path.join(index_path, "embeddings.npy")
        
        if not os.path.exists(embeddings_path):
            return None
        
        try:
            embeddings = np.load(embeddings_path)
            return np.mean(embeddings, axis=0)
        except Exception:
            return None
    
    def extract_document_profile(self, content: str, title: str = "") -> dict:
        """提取文档画像"""
        # 生成摘要（前200字）
        summary = content[:200].replace("\n", " ")
        if len(content) > 200:
            summary += "..."
        
        # 提取关键词（简单TF频率）
        words = self._extract_keywords(content, top_k=10)
        
        # 组合文本用于向量化
        combined_text = f"{title}. {summary}. {' '.join(words)}"
        doc_vector = encode(combined_text)[0]
        
        return {
            "title": title or "未命名文档",
            "summary": summary,
            "keywords": words,
            "vector": doc_vector
        }
    
    def _extract_keywords(self, text: str, top_k: int = 10) -> List[str]:
        """简单关键词提取"""
        import re
        from collections import Counter
        
        # 提取中文字符和英文单词
        chinese = re.findall(r'[\u4e00-\u9fa5]{2,}', text)
        english = re.findall(r'[a-zA-Z]{3,}', text.lower())
        
        # 简单停用词过滤
        stopwords = set(['这个', '那个', '什么', '可以', '进行', '使用', '通过', '基于'])
        words = [w for w in chinese if w not in stopwords] + english
        
        # 取高频词
        counter = Counter(words)
        return [w for w, _ in counter.most_common(top_k)]
    
    def classify(self, doc_profile: dict, threshold: float = 0.6) -> Tuple[str, str, float]:
        """
        分类文档
        
        Returns:
            (目标notebook, 决策类型, 相似度)
            决策类型: "existing" | "create_new"
        """
        notebooks = self.list_notebooks()
        
        if not notebooks:
            # 没有现有notebook，建议新建
            suggested_name = self._generate_notebook_name(doc_profile["title"])
            return suggested_name, "create_new", 0.0
        
        # 计算与每个notebook的相似度
        similarities = []
        doc_vector = doc_profile["vector"].reshape(1, -1)
        
        for nb_name in notebooks:
            nb_vector = self.get_notebook_vector(nb_name)
            if nb_vector is not None:
                nb_vector = nb_vector.reshape(1, -1)
                sim = cosine_similarity(doc_vector, nb_vector)[0, 0]
                similarities.append((nb_name, sim))
        
        if not similarities:
            suggested_name = self._generate_notebook_name(doc_profile["title"])
            return suggested_name, "create_new", 0.0
        
        # 找最佳匹配
        best_match, best_score = max(similarities, key=lambda x: x[1])
        
        if best_score >= threshold:
            return best_match, "existing", best_score
        else:
            suggested_name = self._generate_notebook_name(doc_profile["title"])
            return suggested_name, "create_new", best_score
    
    def _generate_notebook_name(self, title: str) -> str:
        """从标题生成notebook名称"""
        # 取标题前20个字符，过滤特殊字符
        name = title[:20].strip()
        # 移除不适合做目录名的字符
        import re
        name = re.sub(r'[<\u003e:"/\\|?*]', '', name)
        return name or "新项目"
    
    def get_all_similarities(self, doc_profile: dict) -> List[Tuple[str, float]]:
        """获取与所有notebook的相似度（用于展示）"""
        notebooks = self.list_notebooks()
        similarities = []
        doc_vector = doc_profile["vector"].reshape(1, -1)
        
        for nb_name in notebooks:
            nb_vector = self.get_notebook_vector(nb_name)
            if nb_vector is not None:
                nb_vector = nb_vector.reshape(1, -1)
                sim = cosine_similarity(doc_vector, nb_vector)[0, 0]
                similarities.append((nb_name, float(sim)))
        
        return sorted(similarities, key=lambda x: x[1], reverse=True)

# CLI入口
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: classifier.py <文档内容或文件路径> [标题]")
        sys.exit(1)
    
    input_path = sys.argv[1]
    title = sys.argv[2] if len(sys.argv) > 2 else ""
    
    # 读取内容
    if os.path.isfile(input_path):
        with open(input_path, 'r', encoding='utf-8') as f:
            content = f.read()
        title = title or os.path.basename(input_path)
    else:
        content = input_path
    
    # 分类
    classifier = AutoClassifier()
    profile = classifier.extract_document_profile(content, title)
    
    print(f"📄 文档分析:")
    print(f"   标题: {profile['title']}")
    print(f"   摘要: {profile['summary'][:100]}...")
    print(f"   关键词: {', '.join(profile['keywords'])}")
    print()
    
    target, decision, score = classifier.classify(profile)
    all_sims = classifier.get_all_similarities(profile)
    
    print("🔍 分类结果:")
    if all_sims:
        print("   相似度排名:")
        for nb, sim in all_sims[:5]:
            marker = "✓" if nb == target else " "
            print(f"   [{marker}] {nb}: {sim:.2%}")
    
    print()
    if decision == "existing":
        print(f"✅ 建议归档到现有项目「{target}」(相似度{score:.2%})")
    else:
        print(f"✨ 建议创建新项目「{target}」")
