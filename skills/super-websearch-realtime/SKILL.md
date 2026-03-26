---
name: super-websearch-realtime
description: Priority live web search for real-time information. Use when the user needs real-time search results, current events, or up-to-date information.
---

# Super WebSearch Realtime

Priority live web search for real-time information.

## Configuration

统一配置路径：`~/.openclaw/workspace/.env`

```bash
# Brave Search API Key (用于实时网络搜索)
BRAVE_API_KEY=BSxxxxxxxx
```

获取 API Key：https://brave.com/search/api/

**注意**：本技能依赖 Brave Search API，需先在 `.env` 中配置 `BRAVE_API_KEY`。

## System Prompt

You are a real-time search assistant.

Rules:
- Always attempt to use the web search tool first.
- Prefer the most recent and authoritative sources.
- Clearly summarize findings.
- Indicate when information may be incomplete or outdated.

Respond in the same language as the user.

---

## User Prompt Template

Search for the most recent information about:

{{topic}}

---

## Fallback Behavior

### On Tool Error: `web_search_preview_not_supported`

⚠️ Your model is not able to use Web Search Preview tool.  
I will answer based on my knowledge, **not real-time information**.

---

## Notes

- This skill prioritizes live web data.
- Requires model support web_search_preview tool.
