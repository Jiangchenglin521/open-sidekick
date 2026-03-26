---
name: imap-smtp-email
description: |
  邮件收发管理，支持IMAP收邮件、SMTP发邮件，支持Gmail、Outlook、163等主流邮箱。
  Use when: (1) 用户要求查看邮件, (2) 发送邮件或附件, (3) 搜索邮件内容, (4) 邮件提醒和通知, (5) 处理邮件中的待办事项。
---

# IMAP/SMTP Email Tool

Read, search, and manage email via IMAP protocol. Send email via SMTP. Supports Gmail, Outlook, 163.com, vip.163.com, 126.com, vip.126.com, 188.com, vip.188.com, and any standard IMAP/SMTP server.

## Configuration

统一配置路径：`~/.openclaw/workspace/.env`

```bash
# IMAP Configuration (receiving email)
IMAP_HOST=imap.gmail.com          # Server hostname
IMAP_PORT=993                     # Server port
IMAP_USER=your@email.com
IMAP_PASS=your_password
IMAP_TLS=true                     # Use TLS/SSL connection
IMAP_REJECT_UNAUTHORIZED=true     # Set to false for self-signed certs
IMAP_MAILBOX=INBOX                # Default mailbox

# SMTP Configuration (sending email)
SMTP_HOST=smtp.gmail.com          # SMTP server hostname
SMTP_PORT=587                     # SMTP port (587 for STARTTLS, 465 for SSL)
SMTP_SECURE=false                 # true for SSL (465), false for STARTTLS (587)
SMTP_USER=your@gmail.com          # Your email address
SMTP_PASS=your_password           # Your password or app password
SMTP_FROM=your@gmail.com          # Default sender email (optional)
SMTP_REJECT_UNAUTHORIZED=true     # Set to false for self-signed certs
```

**注意**：不再使用技能目录下的 `.env` 文件，请迁移到统一 `~/.openclaw/workspace/.env`。

> **提示**：执行任何邮件操作前，**先检查配置是否存在**！
> 
> ```bash
> # 检查配置是否存在
> grep "IMAP_HOST" ~/.openclaw/workspace/.env 2>/dev/null && echo "已配置" || echo "未配置"
> ```

## Common Email Servers

| Provider | IMAP Host | IMAP Port | SMTP Host | SMTP Port |
|----------|-----------|-----------|-----------|-----------|
| 163.com | imap.163.com | 993 | smtp.163.com | 465 |
| vip.163.com | imap.vip.163.com | 993 | smtp.vip.163.com | 465 |
| 126.com | imap.126.com | 993 | smtp.126.com | 465 |
| vip.126.com | imap.vip.126.com | 993 | smtp.vip.126.com | 465 |
| 188.com | imap.188.com | 993 | smtp.188.com | 465 |
| vip.188.com | imap.vip.188.com | 993 | smtp.vip.188.com | 465 |
| yeah.net | imap.yeah.net | 993 | smtp.yeah.net | 465 |
| Gmail | imap.gmail.com | 993 | smtp.gmail.com | 587 |
| Outlook | outlook.office365.com | 993 | smtp.office365.com | 587 |
| QQ Mail | imap.qq.com | 993 | smtp.qq.com | 587 |

**Important for 163.com:**
- Use **authorization code** (授权码), not account password
- Enable IMAP/SMTP in web settings first

## IMAP Commands (Receiving Email)

### check
Check for new/unread emails.

```bash
node scripts/imap.js check [--limit 10] [--mailbox INBOX] [--recent 2h]
```

Options:
- `--limit <n>`: Max results (default: 10)
- `--mailbox <name>`: Mailbox to check (default: INBOX)
- `--recent <time>`: Only show emails from last X time (e.g., 30m, 2h, 7d)

### fetch
Fetch full email content by UID.

```bash
node scripts/imap.js fetch <uid> [--mailbox INBOX]
```

### download
Download all attachments from an email, or a specific attachment.

```bash
node scripts/imap.js download <uid> [--mailbox INBOX] [--dir <path>] [--file <filename>]
```

Options:
- `--mailbox <name>`: Mailbox (default: INBOX)
- `--dir <path>`: Output directory (default: current directory)
- `--file <filename>`: Download only the specified attachment (default: download all)

### search
Search emails with filters.

```bash
node scripts/imap.js search [options]

Options:
  --unseen           Only unread messages
  --seen             Only read messages
  --from <email>     From address contains
  --subject <text>   Subject contains
  --recent <time>    From last X time (e.g., 30m, 2h, 7d)
  --since <date>     After date (YYYY-MM-DD)
  --before <date>    Before date (YYYY-MM-DD)
  --limit <n>        Max results (default: 20)
  --mailbox <name>   Mailbox to search (default: INBOX)
```

### mark-read / mark-unread
Mark message(s) as read or unread.

```bash
node scripts/imap.js mark-read <uid> [uid2 uid3...]
node scripts/imap.js mark-unread <uid> [uid2 uid3...]
```

### list-mailboxes
List all available mailboxes/folders.

```bash
node scripts/imap.js list-mailboxes
```

## SMTP Commands (Sending Email)

### send
Send email via SMTP.

```bash
node scripts/smtp.js send --to <email> --subject <text> [options]
```

**Required:**
- `--to <email>`: Recipient (comma-separated for multiple)
- `--subject <text>`: Email subject, or `--subject-file <file>`

**Optional:**
- `--body <text>`: Plain text body
- `--html`: Send body as HTML
- `--body-file <file>`: Read body from file
- `--html-file <file>`: Read HTML from file
- `--cc <email>`: CC recipients
- `--bcc <email>`: BCC recipients
- `--attach <file>`: Attachments (comma-separated)
- `--from <email>`: Override default sender

**Examples:**
```bash
# Simple text email
node scripts/smtp.js send --to recipient@example.com --subject "Hello" --body "World"

# HTML email
node scripts/smtp.js send --to recipient@example.com --subject "Newsletter" --html --body "<h1>Welcome</h1>"

# Email with attachment
node scripts/smtp.js send --to recipient@example.com --subject "Report" --body "Please find attached" --attach report.pdf

# Multiple recipients
node scripts/smtp.js send --to "a@example.com,b@example.com" --cc "c@example.com" --subject "Update" --body "Team update"
```

### test
Test SMTP connection by sending a test email to yourself.

```bash
node scripts/smtp.js test
```

## Dependencies

```bash
npm install
```

## Security Notes

- Store credentials in `.env` (add to `.gitignore`)
- For Gmail: use App Password if 2FA is enabled
- For 163.com: use authorization code (授权码), not account password

## Troubleshooting

**Connection timeout:**
- Verify server is running and accessible
- Check host/port configuration

**Authentication failed:**
- Verify username (usually full email address)
- Check password is correct
- For 163.com: use authorization code, not account password
- For Gmail: use App Password if 2FA enabled

**TLS/SSL errors:**
- Match `IMAP_TLS`/`SMTP_SECURE` setting to server requirements
- For self-signed certs: set `IMAP_REJECT_UNAUTHORIZED=false` or `SMTP_REJECT_UNAUTHORIZED=false`

---

## 📝 Agent 使用指南

### 执行前检查清单

1. **检查配置存在性**（必须先做！）
   ```bash
   cat ~/.openclaw/workspace/skills/imap-smtp-email/.env 2>/dev/null && echo "已配置" || echo "未配置"
   ```

2. **如已配置** → 直接使用，无需询问用户

3. **如未配置** → 询问用户邮箱账号和授权码

### 教训记录
- 不要默认用户未配置.env文件
- 先检查现状，再决定是否需要询问
- 避免重复询问已配置的信息
