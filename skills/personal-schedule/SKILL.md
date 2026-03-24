---
name: personal-schedule
description: Personal schedule management skill that handles todo extraction from multiple sources (user input, meeting minutes, emails), priority analysis, reminder scheduling, and chat-based CRUD operations. Use when user mentions schedule, todo, reminder, calendar, 日程, 待办, 提醒, 计划, or wants to create/modify/delete/query todos. Supports natural language input like "明天下午3点开会", "查看今天日程", "完成待办#1".
---

# Personal Schedule

Complete personal schedule management: extraction → priority analysis → reminder setup → chat-based management.

## Quick Start

### Create Todo from Natural Language
```
User: "明天下午3点跟王总开会讨论项目"
→ Extract todo → Analyze priority → Ask missing info → Set reminder → Confirm
```

### Query Schedule
```
User: "今天有什么安排"
→ Show today's todos grouped by priority

User: "本周日程"
→ Show weekly schedule

User: "待办列表"
→ Show all pending todos
```

### Modify Todo
```
User: "把开会改到后天"
→ Find matching todo → Update deadline → Update reminder → Confirm

User: "完成开会那个待办"
→ Mark complete → Update status

User: "删除买咖啡"
→ Search → Confirm → Delete
```

## Core Workflow

### Step 1: Extract & Analyze

For user input, use `extract-todos.js`:
```bash
node {baseDir}/scripts/extract-todos.js user "用户输入文本"
```

Returns:
```json
{
  "title": "会议标题",
  "deadline": "2026-03-21T15:00:00",
  "duration": 60,
  "location": "会议室A",
  "participants": ["王总"],
  "priority": "P1",
  "missingInfo": ["duration"]
}
```

### Step 2: Handle Missing Info

If `missingInfo` is not empty, ask user:
- `time` → "几点开始？"
- `duration` → "预计多久？"
- `location` → "在哪里？"

### Step 3: Priority Confirmation

Show analysis result and ask for confirmation:
```
📊 优先级分析：
- 涉及：客户（王总）
- 时间：明天
- 建议优先级：P1-高

确认吗？(是/否/调整为P0/P2)
```

### Step 4: Create & Remind

```bash
# Create todo
node {baseDir}/scripts/schedule-store.js create '{"title":"...","deadline":"...",...}'

# Set reminder (15 min before by default)
node {baseDir}/scripts/reminder-cron.js set {todoId} "{title}" "{deadline}" 15
```

## Commands Reference

### Query Commands
| User Input | Action | Script |
|------------|--------|--------|
| "今天有什么安排" | Show today | `query-schedule.js today` |
| "本周日程" | Show week | `query-schedule.js week` |
| "待办列表" | Show all pending | `query-schedule.js all` |
| "按优先级查看" | Group by priority | `query-schedule.js priority` |

### CRUD Commands
| User Input | Action | Script |
|------------|--------|--------|
| "添加待办: xxx" | Create | `extract-todos.js user` + `schedule-store.js create` |
| "完成xxx" | Complete | `schedule-store.js complete {id}` |
| "删除xxx" | Delete | `schedule-store.js delete {id}` |
| "把xxx改到yyy" | Update | `schedule-store.js update {id}` |

### Batch Import
| User Input | Action | Script |
|------------|--------|--------|
| "从会议纪要导入" | Import from meetings | `extract-todos.js scan-meetings` |
| "扫描邮件" | Scan emails | `extract-todos.js scan-emails` |

## Script Details

### schedule-store.js - CRUD Operations
```bash
# Create
node schedule-store.js create '{"title":"xxx","deadline":"xxx"}'

# Get
node schedule-store.js get {id}

# Update
node schedule-store.js update {id} '{"title":"new"}'

# Delete
node schedule-store.js delete {id}

# List with filters
node schedule-store.js list '{"status":"pending","priority":"P1"}'

# Today/Week
node schedule-store.js today
node schedule-store.js week

# Complete
node schedule-store.js complete {id}

# Search
node schedule-store.js search "keyword"
```

### priority-engine.js - Priority Analysis
```bash
# Full analysis
node priority-engine.js analyze "text content"

# Priority only
node priority-engine.js priority "text content" [deadline]

# Missing info check
node priority-engine.js missing "text content"
```

### reminder-cron.js - Reminder Management
```bash
# Set reminder
node reminder-cron.js set {todoId} "{title}" "{deadline}" [reminderMinutes]

# Cancel reminder
node reminder-cron.js cancel {todoId}

# Update reminder
node reminder-cron.js update {todoId} "{title}" "{deadline}" [reminderMinutes]

# List all reminders
node reminder-cron.js list

# Setup daily summary at 8am
node reminder-cron.js daily-setup
```

### query-schedule.js - Formatted Output
```bash
node query-schedule.js today
node query-schedule.js week
node query-schedule.js all '{"priority":"P0"}'
node query-schedule.js priority
```

### extract-todos.js - Multi-source Extraction
```bash
# From user input
node extract-todos.js user "用户输入"

# From meeting file
node extract-todos.js meeting /path/to/minutes.md

# From email
node extract-todos.js email /path/to/email.txt

# Scan all emails
node extract-todos.js scan-emails

# Scan meetings directory
node extract-todos.js scan-meetings /path/to/meetings/
```

## Data Storage

Location: `~/.openclaw/workspace/data/schedule/`

- `todos.jsonl` - All todos (JSONL format)
- `cron-map.json` - Reminder job ID mapping

Todo format:
```json
{
  "id": "unique-id",
  "title": "Todo title",
  "deadline": "2026-03-21T15:00:00",
  "duration": 60,
  "location": "Location",
  "participants": ["Person1"],
  "priority": "P1",
  "status": "pending|completed",
  "source": "user|meeting|email",
  "reminderCron": "cron-job-id",
  "createdAt": "2026-03-20T10:00:00",
  "updatedAt": "2026-03-20T10:00:00"
}
```

## Priority Levels

| Level | Emoji | Description | Weight |
|-------|-------|-------------|--------|
| P0 | 🔴 | 紧急 - 立即处理 | 8+ |
| P1 | 🟠 | 高 - 重要且有时间压力 | 5-7 |
| P2 | 🟡 | 中 - 正常优先级 | 2-4 |
| P3 | 🟢 | 低 - 可以延后 | 0-1 |

Priority keywords: 紧急/马上/立刻/asap → P0, deadline/截止/明天 → P1, 下周/稍后 → P2

## Auto Features

### Daily Email Scan
Automatically scan emails at 8am daily. Requires `imap-smtp-email` skill.

### Meeting Minutes Integration
Auto-extract action items when meeting minutes are generated.

### Smart Reminder
- Default: 15 minutes before deadline
- P0 todos: 30 minutes before
- Multi-day events: Day before + 15 min before

## Examples

**Create todo:**
```
User: "明天下午3点跟王总开会讨论项目"
AI: 📋 识别到待办：明天下午跟王总开会讨论项目
    ❓ 预计开多久？（默认1小时）
User: 2小时
AI: ❓ 在哪里？
User: 公司会议室A
AI: 📊 优先级分析：
    - 涉及：客户（王总）
    - 时间：明天
    - 建议优先级：P1-高
    确认吗？(是/否/调整为P0/P2)
User: 是
AI: ✅ 已创建日程！
    📅 明天(3/21) 15:00-17:00
    📍 公司会议室A 👤 王总
    🔔 14:30提醒
```

**Query today:**
```
User: "今天有什么安排"
AI: 📅 今日日程（3月21日 周五）
    ========================================
    
    📌 待完成 (2项)
    ⬜ 🔴 1. 提交紧急报告
       📅 3月21日 周五 09:00
    
    ⬜ 🟠 2. 跟王总开会讨论项目
       📅 3月21日 周五 15:00 (14:30提醒)
       📍 公司会议室A 👤 王总
    
    📊 0/2 已完成
```

**Modify todo:**
```
User: "把开会改到后天"
AI: 📋 找到待办：跟王总开会讨论项目
    当前时间：明天(3/21) 15:00
    改为后天(3/22) 15:00？
User: 是
AI: ✅ 已修改！提醒时间已同步更新为 3/22 14:30
```

## Dependencies

- `imap-smtp-email` skill - Email integration (optional)
- `meeting-minutes` skill - Meeting action items (optional)
- OpenClaw cron - Reminder scheduling

## Configuration

Edit `config.json`:
```json
{
  "defaultReminderMinutes": 15,
  "autoScanEmail": true,
  "scanTime": "08:00",
  "priorityWeights": {
    "urgent": 10,
    "deadline": 8,
    "client": 3,
    "boss": 4
  }
}
```
