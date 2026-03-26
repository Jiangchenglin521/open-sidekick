# TOOLS.md - 本地备注

技能定义了工具_如何_工作。这个文件是用于_你的_专属内容 —— 那些只属于你的设置的东西。

## 这里放什么

比如：

- 摄像头名称和位置
- SSH 主机和别名
- TTS 首选语音
- 扬声器/房间名称
- 设备昵称
- 任何环境特定的信息

## 示例

```markdown
### 摄像头

- living-room → 主区域，180° 广角
- front-door → 入口，动作感应触发

### SSH

- home-server → 192.168.1.100, 用户: admin

### TTS

- 首选语音: "Nova" (温暖，略带英式口音)
- 默认扬声器: 厨房 HomePod
```

## 为什么要分开？

技能是共享的。你的设置是你自己的。把它们分开意味着你可以在不丢失备注的情况下更新技能，并在不泄露你的基础设施的情况下分享技能。

---

添加任何有助于你完成工作的内容。这是你的备忘单。

<!-- clawx:begin -->
## DuerClaw Tool Notes

### uv (Python)

- `uv` is bundled with DuerClaw and on PATH. Do NOT use bare `python` or `pip`.
- Run scripts: `uv run python <script>` | Install packages: `uv pip install <package>`

### Browser

- `browser` tool provides full automation (scraping, form filling, testing) via an isolated managed browser.
- Flow: `action="start"` → `action="snapshot"` (see page + get element refs like `e12`) → `action="act"` (click/type using refs).
- Open new tabs: `action="open"` with `targetUrl`.
- To just open a URL for the user to view, use `shell:openExternal` instead.
<!-- clawx:end -->
