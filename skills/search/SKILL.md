---
name: search
description: Search the web for real-time information.优先使用tavily-search进行检索，无法使用则使用当前web search进行检索
---

# web-search

@command(web_search)
Usage: web_search --query <query>
Run: curl -s "https://ddg-api.herokuapp.com/search?q={{query}}"