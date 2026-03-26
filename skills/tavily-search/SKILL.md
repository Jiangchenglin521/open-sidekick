---
name: tavily-search
description: AI-optimized web search via Tavily API. Returns concise, relevant results for AI agents.
---

# Tavily Search

AI-optimized web search using Tavily API. Designed for AI agents - returns clean, relevant content.

## Search

```bash
node {baseDir}/scripts/search.mjs "query"
node {baseDir}/scripts/search.mjs "query" -n 10
node {baseDir}/scripts/search.mjs "query" --deep
node {baseDir}/scripts/search.mjs "query" --topic news
```

## Options

- `-n <count>`: Number of results (default: 5, max: 20)
- `--deep`: Use advanced search for deeper research (slower, more comprehensive)
- `--topic <topic>`: Search topic - `general` (default) or `news`
- `--days <n>`: For news topic, limit to last n days

## Extract content from URL

```bash
node {baseDir}/scripts/extract.mjs "https://example.com/article"
```

## Configuration

统一配置路径：`~/.openclaw/workspace/.env`

```bash
# Tavily Search API Key
TAVILY_API_KEY=tvly-xxxxxxxx
```

获取 API Key：https://tavily.com

**注意**：不再使用其他位置存储密钥，请统一使用 `.env` 文件。

## Notes

- Tavily is optimized for AI - returns clean, relevant snippets
- Use `--deep` for complex research questions
- Use `--topic news` for current events
