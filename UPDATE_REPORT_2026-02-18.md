# 工作区更新报告

**更新时间**: 2026-02-18  
**上次更新**: 2026-02-13  
**对比来源**: https://github.com/openclaw/openclaw/main

---

## 本次更新内容

### 1. 核心文件更新

| 文件 | 变更前 | 变更后 | 状态 |
|------|--------|--------|------|
| `AGENTS.md` | 7,869 字节 | 21,460 字节 | ✅ 已同步 |
| `.gitignore` | 150 字节 | 1,655 字节 | ✅ 已同步 |

### 2. AGENTS.md 主要新增内容

新增章节：
- **GHSA (Repo Advisory) Patch/Publish** - 安全公告补丁和发布流程
- **Troubleshooting** - 故障排除指南 (`openclaw doctor`)
- **NPM + 1Password** - 发布和验证流程
- **Plugin Release Fast Path** - 插件快速发布路径
- **Changelog Release Notes** - 发布说明规范

新增/完善要点：
- 多代理安全规范 (Multi-agent safety)
- SwiftUI 状态管理建议使用 `Observation` 框架
- A2UI bundle hash 处理规范
- 连接提供者添加时的 UI 同步要求
- 版本号统一更新位置列表
- 设备检查优先级（真机优先于模拟器）

### 3. .gitignore 主要新增规则

```
# Agent credentials and memory (NEVER COMMIT)
/memory/
.agent/*.json
!.agent/workflows/
/local/
package-lock.json

# local tooling
.serena/

# Local iOS signing overrides
apps/ios/LocalSigning.xcconfig
```

### 4. 官方仓库自 2026-02-13 以来的主要变更

| Commit | 类型 | 描述 |
|--------|------|------|
| `797ea7ed` | perf(test) | 减少 monitor/subagent 测试开销 |
| `99db4d13` | fix(gateway) | 防止 cron webhook 的 SSRF 攻击 |
| `bc00c7d1` | refactor | 去重 sandbox registry helpers |
| `6a5f887b` | test | 加强 Telegram 命令菜单清理测试覆盖率 |
| `cc29be8c` | fix | 序列化 sandbox registry 写入操作 |
| `8278903f` | fix | 更新 deep links 处理 |
| `4bf33388` | chore | 版本号更新至 2026.2.18 unreleased |
| `f25bbbc3` | feat | Anthropic onboarding 默认切换到 sonnet |
| `e8816c55` | fix(agents) | 修复子代理完成通知到源渠道 |
| `ca43efa9` | fix(ci) | Docker 烟雾测试中强制 npm install 路径 |
| `91e9684e` | test | 添加 shared 和 slack allow-list 规范化测试 |
| `8407eeb3` | refactor | 提取共享字符串规范化 helpers |
| `8984f318` | fix(agents) | 修正完成通知重试退避调度 |

---

## Skills 目录状态

**当前本地 Skills** (8个):
- find-skills
- imap-smtp-email
- proactive-agent-1-2-4
- search
- super-websearch-realtime
- tavily-search

**官方仓库 Skills** (60+个):
- 1password, apple-notes, apple-reminders, bear-notes, blogwatcher, blucli, bluebubbles, camsnap, canvas, clawhub, coding-agent, discord, eightctl, food-order, gemini, gh-issues, gifgrep, github, gog, goplaces, healthcheck, himalaya, imsg, mcporter, model-usage, nano-banana-pro, nano-pdf, notion, obsidian, openai-image-gen, openai-whisper-api, openai-whisper, openhue, oracle, ordercli, peekaboo, sag, session-logs, sherpa-onnx-tts, skill-creator, slack, songsee, sonoscli, spotify-player, summarize, things-mac, tmux, trello, video-frames, voice-call, wacli, weather

**说明**: Skills 是按需安装的可选组件，本地仅保留实际使用的 skills 即可。

---

## 更新完成 ✅

工作区核心文件已完全对齐官方 master 分支标准。
