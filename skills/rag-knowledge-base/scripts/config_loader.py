#!/usr/bin/env python3
"""
统一配置加载模块 - 从 workspace/.env 读取配置
"""

import os
import re
from pathlib import Path

# 统一配置文件路径
WORKSPACE_ENV = Path.home() / ".openclaw" / "workspace" / ".env"


def parse_env_file(file_path):
    """解析 .env 文件"""
    config = {}
    if not file_path.exists():
        return config
    
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if '=' in line:
                key, value = line.split('=', 1)
                config[key.strip()] = value.strip()
    return config


def load_rag_config():
    """
    加载 RAG 知识库配置
    优先从 .env 读取，回退到 config.json
    """
    # 默认配置
    default_config = {
        "llm": {
            "provider": "openclaw",
            "api_key": "",
            "api_base": "https://api.openai.com/v1",
            "model": "gpt-3.5-turbo",
            "temperature": 0.3,
            "max_tokens": 50,
            "timeout": 30
        },
        "embedding": {
            "model": "all-MiniLM-L6-v2",
            "dimension": 384,
            "cache_dir": "~/.cache/sentence-transformers"
        },
        "chunk": {
            "size": 256,
            "overlap": 50
        },
        "classification": {
            "threshold": 0.6,
            "top_k_keywords": 10
        },
        "retrieval": {
            "top_k": 5,
            "rrf_k": 60
        }
    }
    
    # 从统一 .env 读取
    if WORKSPACE_ENV.exists():
        env = parse_env_file(WORKSPACE_ENV)
        
        # 覆盖 LLM 配置
        if env.get('RAG_LLM_PROVIDER'):
            default_config["llm"]["provider"] = env['RAG_LLM_PROVIDER']
        if env.get('RAG_API_KEY'):
            default_config["llm"]["api_key"] = env['RAG_API_KEY']
        if env.get('RAG_API_BASE'):
            default_config["llm"]["api_base"] = env['RAG_API_BASE']
        if env.get('RAG_MODEL'):
            default_config["llm"]["model"] = env['RAG_MODEL']
        if env.get('RAG_TEMPERATURE'):
            default_config["llm"]["temperature"] = float(env['RAG_TEMPERATURE'])
        if env.get('RAG_MAX_TOKENS'):
            default_config["llm"]["max_tokens"] = int(env['RAG_MAX_TOKENS'])
        if env.get('RAG_TIMEOUT'):
            default_config["llm"]["timeout"] = int(env['RAG_TIMEOUT'])
        
        # 覆盖 Embedding 配置
        if env.get('RAG_EMBEDDING_MODEL'):
            default_config["embedding"]["model"] = env['RAG_EMBEDDING_MODEL']
        if env.get('RAG_EMBEDDING_DIMENSION'):
            default_config["embedding"]["dimension"] = int(env['RAG_EMBEDDING_DIMENSION'])
        
        # 覆盖 Chunk 配置
        if env.get('RAG_CHUNK_SIZE'):
            default_config["chunk"]["size"] = int(env['RAG_CHUNK_SIZE'])
        if env.get('RAG_CHUNK_OVERLAP'):
            default_config["chunk"]["overlap"] = int(env['RAG_CHUNK_OVERLAP'])
        
        # 覆盖 Classification 配置
        if env.get('RAG_CLASSIFICATION_THRESHOLD'):
            default_config["classification"]["threshold"] = float(env['RAG_CLASSIFICATION_THRESHOLD'])
        if env.get('RAG_TOP_K_KEYWORDS'):
            default_config["classification"]["top_k_keywords"] = int(env['RAG_TOP_K_KEYWORDS'])
        
        # 覆盖 Retrieval 配置
        if env.get('RAG_RETRIEVAL_TOP_K'):
            default_config["retrieval"]["top_k"] = int(env['RAG_RETRIEVAL_TOP_K'])
        if env.get('RAG_RRF_K'):
            default_config["retrieval"]["rrf_k"] = int(env['RAG_RRF_K'])
        
        return default_config
    
    # 回退到 config.json
    config_path = Path(__file__).parent.parent / "config.json"
    if config_path.exists():
        try:
            import json
            with open(config_path, 'r', encoding='utf-8') as f:
                user_config = json.load(f)
                # 合并用户配置和默认配置
                for key, value in default_config.items():
                    if key in user_config:
                        if isinstance(value, dict) and isinstance(user_config[key], dict):
                            default_config[key].update(user_config[key])
                        else:
                            default_config[key] = user_config[key]
        except Exception as e:
            print(f"[警告] 读取 config.json 失败: {e}")
    
    return default_config


if __name__ == "__main__":
    # 测试配置加载
    config = load_rag_config()
    print(json.dumps(config, indent=2, ensure_ascii=False))
