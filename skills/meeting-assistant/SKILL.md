---
name: meeting-assistant
description: >
  Complete meeting workflow assistant that handles recording, transcription, minutes generation, and mindmap creation.
  Use when user says "我要开会了", "开始会议整理", "meeting assistant", or any meeting documentation task.
  Supports two modes: (1) real-time recording via ffmpeg when no file provided,
  (2) waiting for file upload when user indicates.
  Triggers on "会议结束" to stop recording and process.
  Generates meeting minutes, action items, and mindmap by default.
  Respects user custom requirements if specified before or during the workflow
  (e.g., "不需要思维导图", "只要待办事项").
---

# Meeting Assistant

Complete meeting documentation workflow: recording → transcription → minutes → mindmap.

## Workflow States

```
[Idle] → "开始会议" → [Recording/Waiting] → "会议结束" → [Processing] → [Complete]
```

## Starting a Meeting

When user says meeting start phrases:
- "我要开会了"
- "开始会议整理"
- "meeting assistant"
- "开始录音"

### Mode 1: Real-time Recording (Default)

If user provides **no audio file** and doesn't mention uploading:

```bash
{baseDir}/scripts/start-recording.sh {date} {meeting-name}
```

This starts ffmpeg recording from system microphone.

### Mode 2: Wait for Upload

If user says will upload file (e.g., "我会传录音", "稍后上传"):

Confirm and wait. Store metadata:
- Expected filename
- Meeting date
- User preferences (no mindmap, etc.)

## During Meeting

Track user preferences if mentioned:
- "不需要思维导图" → set `NO_MINDMAP=1`
- "只要纪要" → set `MINUTES_ONLY=1`
- "加急处理" → set `PRIORITY=1`

## Ending a Meeting

When user says ending phrases:
- "会议结束"
- "整理会议纪要"
- "生成会议记录"
- "stop recording"

### Stop Recording (Mode 1)

```bash
{baseDir}/scripts/stop-recording.sh {date} {meeting-name}
```

Returns: path to recorded audio file

### Process Workflow

```bash
{baseDir}/scripts/process-meeting.sh \
  --audio {audio-path} \
  --date {date} \
  --name {meeting-name} \
  [--no-mindmap] \
  [--output-format {markdown|text|json}]
```

## Output Structure

All files saved to:
```
{workspace}/meetings/{YYYY-MM-DD}/{meeting-name}/
├── recording.{ogg|mp3|wav}    # Original audio
├── transcript.txt              # ASR transcription
├── minutes.md                  # Meeting minutes
├── action-items.md             # Action items list
└── mindmap.png                 # Mindmap image (if requested)
```

## Processing Pipeline

1. **Audio to Text**: Send to chinese-asr skill
   ```bash
   # In skill script
   python {chinese-asr-dir}/asr.py {audio-file}
   ```

2. **Generate Minutes**: Use meeting-minutes skill
   - Generate structured minutes
   - Extract action items with owners/deadlines

3. **Generate Mindmap**: Use mindmap-generator skill (unless disabled)
   - Create Mermaid syntax from minutes
   - Render to PNG

## User Preference Handling

Check preferences stored during meeting:

```bash
# Read preferences
source {baseDir}/.meeting-session-{id}.env

# NO_MINDMAP=1 → Skip mindmap generation
# MINUTES_ONLY=1 → Only generate minutes, no action items
# OUTPUT_FORMAT=json → JSON output instead of markdown
```

## Return Format

Default output (all components):

```
🤝 会议: {meeting-name}
📅 时间: {datetime}

━━━━━━━━━━━━━━━━━━
📋 会议纪要
━━━━━━━━━━━━━━━━━━
{minutes content}

━━━━━━━━━━━━━━━━━━
✅ 待办事项
━━━━━━━━━━━━━━━━━━
{action items}

━━━━━━━━━━━━━━━━━━
🗺️ 思维导图
━━━━━━━━━━━━━━━━━━
[PNG image attached or path shown]

📁 文件保存位置: {path}
```

Customized output (respect user preferences):
- No mindmap → Omit mindmap section
- Minutes only → Only show minutes
- JSON format → Structured JSON response

## Error Handling

- Recording fails → Suggest manual upload
- ASR fails → Return audio file for manual processing
- Empty transcript → Report clearly, don't generate fake content

## Session Management

Store active session in:
```
{baseDir}/.active-session
```

Format:
```json
{
  "id": "uuid",
  "startTime": "ISO8601",
  "mode": "recording|waiting",
  "audioPath": "/path/to/recording",
  "preferences": {
    "noMindmap": false,
    "minutesOnly": false
  }
}
```

Clean up after processing complete.

## Dependencies

- ffmpeg: Real-time audio recording
- chinese-asr: Speech-to-text transcription
- meeting-minutes: Minutes and action items generation
- mindmap-generator: Mindmap visualization

## Examples

**Start with recording:**
```
User: "我要开会了，项目周会"
→ Start ffmpeg recording
→ Save session: mode=recording
```

**Start waiting for upload:**
```
User: "我要整理会议，稍后传录音，不需要思维导图"
→ Wait for file
→ Save session: mode=waiting, noMindmap=true
```

**End and process:**
```
User: "会议结束，整理一下"
→ Stop recording (if mode=recording)
→ Process through pipeline
→ Return minutes + actions + mindmap
```
