#!/usr/bin/env python3
"""
自动分类器 - 智能匹配文档到Notebook
"""

import os
import sys
import json
from pathlib import Path
from typing import List, Tuple, Optional

# 检查是否使用虚拟环境的Python
script_dir = Path(__file__).parent
skill_dir = script_dir.parent
venv_python = skill_dir / '.venv' / 'bin' / 'python'

if sys.executable != str(venv_python) and venv_python.exists():
    print("⚠️  警告: 未使用虚拟环境的 Python")
    print(f"   当前: {sys.executable}")
    print(f"   应使用: {venv_python}")
    print("   请使用: ./.venv/bin/python scripts/classifier.py")
    print()

# 导入嵌入模块
sys.path.insert(0, os.path.dirname(__file__))

# 检查依赖
try:
    import numpy as np
    from embedder import encode, cosine_similarity
except ImportError as e:
    print(f"❌ 依赖缺失: {e}")
    print("💡 请使用虚拟环境的 Python:")
    print(f"   {venv_python} {__file__}")
    sys.exit(1)

from config_loader import load_rag_config

class AutoClassifier:
    """自动文档分类器"""
    
    def __init__(self, kb_base_path: str = None):
        if kb_base_path is None:
            kb_base_path = os.path.expanduser("~/.openclaw/workspace/knowledge-base")
        self.kb_base_path = kb_base_path
        self.notebooks_path = os.path.join(kb_base_path, "notebooks")
        self.config = load_rag_config()
    
    def _load_config(self) -> dict:
        """加载配置文件 - 现在由 config_loader 处理"""
        return load_rag_config()
        
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
            suggested_name = self._generate_notebook_name(doc_profile)
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
            suggested_name = self._generate_notebook_name(doc_profile)
            return suggested_name, "create_new", 0.0
        
        # 找最佳匹配
        best_match, best_score = max(similarities, key=lambda x: x[1])
        
        if best_score >= threshold:
            return best_match, "existing", best_score
        else:
            suggested_name = self._generate_notebook_name(doc_profile)
            return suggested_name, "create_new", best_score
    
    def _generate_notebook_name(self, doc_profile: dict) -> str:
        """
        智能生成notebook名称
        基于文档画像（标题+摘要+关键词），通过LLM理解内容生成合适的项目名
        """
        import re
        
        title = doc_profile.get("title", "")
        summary = doc_profile.get("summary", "")[:300]  # 限制长度
        keywords = doc_profile.get("keywords", [])
        
        # 构建prompt
        prompt = f"""基于以下文档信息，生成一个简洁的项目/分类名称（3-10字）：

标题：{title}
摘要：{summary}
关键词：{', '.join(keywords[:8])}

要求：
1. 准确概括文档主题
2. 简洁易懂，适合作为文件夹名称
3. 如果是技术文档，优先使用技术领域名称
4. 不要包含版本号、日期、特殊字符
5. 只返回项目名称，不要解释，不要加引号

项目名称："""
        
        try:
            # 调用LLM生成名称
            name = self._call_llm(prompt).strip()
            
            # 清理特殊字符，确保适合作为目录名
            name = re.sub(r'[<>:"/\\|?*\n\r]', '', name)
            name = name.strip()
            
            # 长度限制
            if len(name) > 15:
                name = name[:15]
            if len(name) < 2:
                # 回退到原标题截取
                name = title[:10].strip() if title else "新项目"
                name = re.sub(r'[<>:"/\\|?*]', '', name)
            
            return name or "新项目"
            
        except Exception as e:
            # LLM失败时回退到原标题截取
            print(f"⚠️  LLM命名失败，使用标题截取: {e}")
            name = title[:15].strip() if title else "新项目"
            name = re.sub(r'[<>:"/\\|?*]', '', name)
            return name or "新项目"
    
    def _call_llm(self, prompt: str) -> str:
        """调用LLM生成内容"""
        import subprocess
        import json
        
        llm_config = self.config.get("llm", {})
        provider = llm_config.get("provider", "openclaw")
        
        # 如果配置了外部API且不是openclaw，使用API方式
        if provider != "openclaw" and llm_config.get("api_key"):
            return self._call_llm_via_api(prompt, llm_config)
        
        # 尝试调用OpenClaw的agent功能
        try:
            # 使用openclaw命令行工具
            cmd = [
                "openclaw", "agent", "run",
                "--message", prompt,
                "--thinking", "low",
                "--format", "json"
            ]
            
            timeout = llm_config.get("timeout", 30)
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=timeout
            )
            
            if result.returncode == 0:
                # 尝试解析JSON
                try:
                    data = json.loads(result.stdout)
                    return data.get("content", result.stdout.strip())
                except:
                    return result.stdout.strip()
            else:
                # 失败时尝试API方式
                if llm_config.get("api_key"):
                    return self._call_llm_via_api(prompt, llm_config)
                raise RuntimeError(f"openclaw agent failed: {result.stderr}")
                
        except Exception:
            # 如果openclaw不可用，尝试API方式
            if llm_config.get("api_key"):
                return self._call_llm_via_api(prompt, llm_config)
            raise RuntimeError("No LLM available. Please configure LLM in config.json or ensure openclaw agent is available.")
    
    def _call_llm_via_api(self, prompt: str, llm_config: dict = None) -> str:
        """通过API调用LLM"""
        import urllib.request
        import json
        
        if llm_config is None:
            llm_config = self.config.get("llm", {})
        
        api_key = llm_config.get("api_key", "")
        api_base = llm_config.get("api_base", "https://api.openai.com/v1")
        model = llm_config.get("model", "gpt-3.5-turbo")
        temperature = llm_config.get("temperature", 0.3)
        max_tokens = llm_config.get("max_tokens", 50)
        timeout = llm_config.get("timeout", 30)
        
        if not api_key:
            raise RuntimeError("API key not configured. Please set api_key in config.json.")
        
        url = f"{api_base}/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        data = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode(),
            headers=headers,
            method="POST"
        )
        
        with urllib.request.urlopen(req, timeout=timeout) as response:
            result = json.loads(response.read().decode())
            return result["choices"][0]["message"]["content"]

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
