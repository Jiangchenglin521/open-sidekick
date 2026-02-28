#!/usr/bin/env python3
"""
OpenClaw SessionKey 生成器
用法: from session_key import get_session_key
"""

import hashlib
import uuid
from typing import Optional


def get_session_key(
    user_id: str,
    agent_id: str = "main",
    channel: str = "openai",
    conversation_id: Optional[str] = None,
    ensure_persistent: bool = True
) -> str:
    """
    生成标准的 OpenClaw sessionKey
    
    参数:
        user_id: 用户唯一标识（比如你的用户名、设备ID等）
        agent_id: Agent ID，默认 "main"
        channel: 渠道，默认 "openai"（可选：feishu, webchat, openai）
        conversation_id: 对话ID（可选，用于多会话隔离）
        ensure_persistent: 是否确保持久化（默认True，生成固定key）
    
    返回:
        标准 sessionKey 字符串
    
    示例:
        >>> get_session_key("jcl_fenshen01")
        'agent:main:openai:jcl_fenshen01'
        
        >>> get_session_key("jcl_fenshen01", channel="feishu")
        'agent:main:user:jcl_fenshen01:conv:chat_main'
    """
    
    if channel == "feishu":
        # 飞书渠道的规范格式
        if conversation_id:
            return f"agent:{agent_id}:user:{user_id}:conv:{conversation_id}"
        else:
            return f"agent:{agent_id}:user:{user_id}:conv:chat_main"
    
    elif channel == "openai":
        # OpenAI HTTP API 格式
        return f"agent:{agent_id}:openai:{user_id}"
    
    elif channel == "webchat":
        # Webchat 格式
        return f"agent:{agent_id}:webchat:{user_id}"
    
    else:
        # 通用格式
        return f"agent:{agent_id}:{channel}:{user_id}"


def get_isolated_session_key(
    prefix: str = "manual",
    agent_id: str = "main"
) -> str:
    """
    生成隔离的 sessionKey（每次调用都不同，适合一次性任务）
    
    参数:
        prefix: 前缀标识
        agent_id: Agent ID
    
    返回:
        带 UUID 的隔离 sessionKey
    """
    unique_id = uuid.uuid4().hex[:8]
    return f"agent:{agent_id}:{prefix}:{unique_id}"


def get_conversation_session_key(
    user_id: str,
    conversation_name: str = "default",
    agent_id: str = "main",
    channel: str = "openai"
) -> str:
    """
    为特定对话创建固定的 sessionKey（推荐用于多会话管理）
    
    参数:
        user_id: 用户ID
        conversation_name: 对话名称（如 "work", "personal", "coding"）
        agent_id: Agent ID
        channel: 渠道
    
    返回:
        固定格式的 sessionKey
    """
    return f"agent:{agent_id}:{channel}:{user_id}:conv:{conversation_name}"


# ============ 使用示例 ============

if __name__ == "__main__":
    # 示例1：基础用法 - 固定 sessionKey（推荐）
    USER_ID = "jcl_fenshen01"
    
    # OpenAI 渠道 - 每次请求用这个 key 就有历史
    session_key = get_session_key(USER_ID, channel="openai")
    print(f"OpenAI 渠道: {session_key}")
    # 输出: agent:main:openai:jcl_fenshen01
    
    # 示例2：飞书渠道 - 对话会显示在飞书
    feishu_key = get_session_key(USER_ID, channel="feishu")
    print(f"飞书渠道: {feishu_key}")
    # 输出: agent:main:user:jcl_fenshen01:conv:chat_main
    
    # 示例3：多会话隔离 - 工作/个人分开
    work_key = get_conversation_session_key(USER_ID, "work")
    personal_key = get_conversation_session_key(USER_ID, "personal")
    print(f"工作会话: {work_key}")
    print(f"个人会话: {personal_key}")
    
    # 示例4：隔离模式 - 每次不同（类似阿朗的 cron job）
    isolated_key = get_isolated_session_key("manual")
    print(f"隔离会话: {isolated_key}")
    
    # ============ HTTP 请求示例 ============
    print("\n" + "="*50)
    print("HTTP 请求示例:")
    print("="*50)
    
    import json
    
    request_body = {
        "sessionKey": get_session_key("jcl_fenshen01", channel="openai"),
        "channel": "openai",
        "message": "你好，小帅",
        "thinking": "low"
    }
    
    print(f"""
curl -X POST http://127.0.0.1:18789/agent \\
  -H "Content-Type: application/json" \\
  -d '{json.dumps(request_body, ensure_ascii=False, indent=2)}'
""")
    
    # ============ 持久化建议 ============
    print("\n" + "="*50)
    print("持久化建议 - 保存 sessionKey 到文件:")
    print("="*50)
    
    print("""
# 保存当前 sessionKey
with open(".session_key", "w") as f:
    f.write(session_key)

# 读取复用
with open(".session_key", "r") as f:
    session_key = f.read().strip()
""")
