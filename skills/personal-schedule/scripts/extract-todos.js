#!/usr/bin/env node
/**
 * 多源待办提取
 * 从用户输入、会议纪要、邮件中提取待办事项
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PRIORITY_SCRIPT = path.join(__dirname, 'priority-engine.js');

// 调用优先级引擎
function analyzeText(text) {
  try {
    const cmd = `node "${PRIORITY_SCRIPT}" analyze '${text.replace(/'/g, "'\"'\"'")}'`;
    const result = execSync(cmd, { encoding: 'utf8' });
    return JSON.parse(result);
  } catch (e) {
    return { title: text, priority: 'P2', missingInfo: ['time'] };
  }
}

// 从用户输入提取
function extractFromUserInput(text) {
  const analysis = analyzeText(text);
  return {
    id: null, // 创建时生成
    source: 'user',
    rawText: text,
    ...analysis
  };
}

// 从会议纪要提取
function extractFromMeetingMinutes(minutesPath) {
  if (!fs.existsSync(minutesPath)) {
    return [];
  }
  
  const content = fs.readFileSync(minutesPath, 'utf8');
  const todos = [];
  
  // 匹配常见的待办模式
  const patterns = [
    // ✅ 待办: 标题 - 负责人 - 截止时间
    /[✅\-]\s*([^：:]+)[：:]\s*([^\n]+)(?:\n|$)/g,
    // Action Item: xxx (Owner) - Due: date
    /[Aa]ction\s*[Ii]tem[：:]?\s*([^\n(]+)(?:\(([^)]+)\))?(?:.*[Dd]ue[：:]?\s*([^\n]+))?/g,
    // 行动项/待办事项 列表
    /(?:行动项|待办|TODO)[：:]?\s*([^\n]+)/g
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const text = match[1]?.trim();
      if (!text) continue;
      
      const analysis = analyzeText(text);
      todos.push({
        id: null,
        source: 'meeting',
        rawText: text,
        meetingSource: minutesPath,
        ...analysis
      });
    }
  }
  
  // 去重
  return todos.filter((t, i, arr) => 
    arr.findIndex(x => x.rawText === t.rawText) === i
  );
}

// 从邮件内容提取
function extractFromEmail(emailContent, subject = '') {
  const todos = [];
  const combined = subject + ' ' + emailContent;
  
  // 时间相关关键词
  const timeKeywords = ['截止', 'deadline', '到期', '之前完成', '本周内', '下周'];
  const actionKeywords = ['请', '麻烦', '需要', '务必', '尽快'];
  
  // 如果邮件包含时间关键词，整体作为待办
  if (timeKeywords.some(k => combined.includes(k))) {
    const analysis = analyzeText(subject || emailContent.slice(0, 100));
    todos.push({
      id: null,
      source: 'email',
      rawText: subject || emailContent.slice(0, 200),
      ...analysis
    });
  }
  
  // 提取邮件中明确的任务
  const lines = emailContent.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    // 检测任务模式
    if ((/^\d+[.、]/.test(trimmed) || /^[\-\*]/.test(trimmed)) && trimmed.length > 10) {
      if (timeKeywords.some(k => trimmed.includes(k)) || 
          actionKeywords.some(k => trimmed.includes(k))) {
        const analysis = analyzeText(trimmed);
        todos.push({
          id: null,
          source: 'email',
          rawText: trimmed,
          ...analysis
        });
      }
    }
  }
  
  return todos;
}

// 扫描邮件（调用imap-smtp-email技能）
function scanEmails() {
  try {
    // 检查是否安装了imap-smtp-email技能
    const skillPath = path.join(process.env.HOME, '.openclaw/workspace/skills/imap-smtp-email');
    if (!fs.existsSync(skillPath)) {
      return { error: '未安装imap-smtp-email技能' };
    }
    
    // 获取今日邮件
    const today = new Date().toISOString().split('T')[0];
    const cmd = `cd "${skillPath}" && node scripts/fetch-unread.js --since="${today}"`;
    
    try {
      const result = execSync(cmd, { encoding: 'utf8' });
      const emails = JSON.parse(result);
      
      const allTodos = [];
      for (const email of emails) {
        const todos = extractFromEmail(email.content, email.subject);
        allTodos.push(...todos);
      }
      
      return {
        scanned: emails.length,
        extracted: allTodos.length,
        todos: allTodos
      };
    } catch (e) {
      return { error: '邮件扫描失败: ' + e.message };
    }
  } catch (e) {
    return { error: e.message };
  }
}

// 批量处理会议纪要目录
function scanMeetingMinutes(dir) {
  if (!fs.existsSync(dir)) {
    return { error: '目录不存在' };
  }
  
  const files = fs.readdirSync(dir).filter(f => 
    f.endsWith('.md') && f.includes('minutes')
  );
  
  const allTodos = [];
  for (const file of files) {
    const todos = extractFromMeetingMinutes(path.join(dir, file));
    allTodos.push(...todos);
  }
  
  return {
    files: files.length,
    extracted: allTodos.length,
    todos: allTodos
  };
}

// CLI
const command = process.argv[2];
const input = process.argv[3];

switch (command) {
  case 'user':
    console.log(JSON.stringify(extractFromUserInput(input)));
    break;
  case 'meeting':
    console.log(JSON.stringify(extractFromMeetingMinutes(input)));
    break;
  case 'email':
    const content = fs.existsSync(input) ? fs.readFileSync(input, 'utf8') : input;
    console.log(JSON.stringify(extractFromEmail(content)));
    break;
  case 'scan-emails':
    console.log(JSON.stringify(scanEmails()));
    break;
  case 'scan-meetings':
    const meetingsDir = input || path.join(process.env.HOME, '.openclaw/workspace/meetings');
    console.log(JSON.stringify(scanMeetingMinutes(meetingsDir)));
    break;
  default:
    console.error('Usage: node extract-todos.js <user|meeting|email|scan-emails|scan-meetings> <input>');
    process.exit(1);
}
