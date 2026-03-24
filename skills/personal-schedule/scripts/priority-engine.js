#!/usr/bin/env node
/**
 * 优先级分析引擎
 * 基于关键词和规则自动分析待办优先级
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '..', 'config.json');

// 加载配置
function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    return {
      priorityWeights: {
        urgent: 10, deadline: 8, today: 5, tomorrow: 5,
        thisWeek: 3, nextWeek: 2, client: 3, boss: 4, report: 3
      }
    };
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

// 优先级规则
const PRIORITY_RULES = {
  // P0 - 紧急（权重8+）
  P0: {
    keywords: ['紧急', '马上', '立刻', 'asap', '立即', '现在', '必须今天', '急'],
    weight: 10,
    description: '紧急 - 需要立即处理'
  },
  // P1 - 高（权重5-7）
  P1: {
    keywords: ['deadline', '截止', '到期', '明天', '今天', '本周', '客户', '老板', '汇报'],
    weight: 6,
    description: '高 - 重要且有时间压力'
  },
  // P2 - 中（权重3-4）
  P2: {
    keywords: ['下周', '下周', '稍后', '有空', '准备', '计划'],
    weight: 3,
    description: '中 - 正常优先级'
  },
  // P3 - 低（权重1-2）
  P3: {
    keywords: ['什么时候都行', '不着急', '随便', '有空再说'],
    weight: 1,
    description: '低 - 可以延后'
  }
};

// 计算优先级分数
function calculatePriority(text, deadline = null) {
  const config = loadConfig();
  const weights = config.priorityWeights || {};
  let score = 0;
  const matchedKeywords = [];
  const textLower = text.toLowerCase();
  
  // 检查关键词
  Object.entries(PRIORITY_RULES).forEach(([level, rule]) => {
    rule.keywords.forEach(keyword => {
      if (textLower.includes(keyword.toLowerCase())) {
        score += weights[Object.keys(weights).find(k => keyword.includes(k))] || rule.weight;
        matchedKeywords.push(keyword);
      }
    });
  });
  
  // 检查deadline紧急程度
  if (deadline) {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffHours = (deadlineDate - now) / (1000 * 60 * 60);
    
    if (diffHours <= 4) {
      score += 10; // 4小时内
      matchedKeywords.push('4小时内截止');
    } else if (diffHours <= 24) {
      score += 7; // 24小时内
      matchedKeywords.push('24小时内截止');
    } else if (diffHours <= 72) {
      score += 5; // 3天内
      matchedKeywords.push('3天内截止');
    } else if (diffHours <= 168) {
      score += 3; // 一周内
      matchedKeywords.push('一周内截止');
    }
  }
  
  // 映射到优先级
  let priority;
  if (score >= 8) priority = 'P0';
  else if (score >= 5) priority = 'P1';
  else if (score >= 2) priority = 'P2';
  else priority = 'P3';
  
  return {
    priority,
    score,
    matchedKeywords: [...new Set(matchedKeywords)],
    description: PRIORITY_RULES[priority].description
  };
}

// 分析文本提取待办结构
function analyzeTodo(text) {
  const result = {
    title: text,
    deadline: null,
    duration: null,
    location: null,
    participants: [],
    priority: null,
    missingInfo: []
  };
  
  // 提取时间
  const timePatterns = [
    // 今天/明天/后天 + 时间
    { regex: /(今天|明天|后天)\s*(早上|上午|中午|下午|晚上)?\s*(\d{1,2})[:点时](\d{1,2})?/, handler: (m) => {
      const dayMap = { '今天': 0, '明天': 1, '后天': 2 };
      const d = new Date();
      d.setDate(d.getDate() + dayMap[m[1]]);
      let hour = parseInt(m[3]);
      if (m[2] === '下午' && hour < 12) hour += 12;
      if (m[2] === '晚上' && hour < 18) hour += 12;
      d.setHours(hour, parseInt(m[4] || 0), 0, 0);
      return d.toISOString();
    }},
    // 具体日期
    { regex: /(\d{1,2})月(\d{1,2})日\s*(\d{1,2})[:点时]/, handler: (m) => {
      const d = new Date();
      d.setMonth(parseInt(m[1]) - 1, parseInt(m[2]));
      d.setHours(parseInt(m[3]), 0, 0, 0);
      return d.toISOString();
    }},
    // YYYY-MM-DD
    { regex: /(\d{4}-\d{2}-\d{2})/, handler: (m) => {
      return new Date(m[1]).toISOString();
    }}
  ];
  
  for (const pattern of timePatterns) {
    const match = text.match(pattern.regex);
    if (match) {
      result.deadline = pattern.handler(match);
      break;
    }
  }
  
  // 提取地点
  const locationPatterns = [
    /在\s*([^，,。]+)(会议室|办公室|公司|家里|@)/,
    /@\s*([^\s,，]+)/,
    /地点[:：]\s*([^，,。]+)/
  ];
  
  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match) {
      result.location = match[1] || match[0];
      break;
    }
  }
  
  // 提取参与人
  const participantPatterns = [
    /跟\s*([^，,。]+?)(讨论|开会|见面|聊)/,
    /和\s*([^，,。]+?)(一起|讨论|开会)/,
    /参与人[:：]\s*([^，,。]+)/,
    /@([^\s,，]+)/g
  ];
  
  for (const pattern of participantPatterns) {
    if (pattern.global) {
      const matches = [...text.matchAll(pattern)];
      matches.forEach(m => result.participants.push(m[1]));
    } else {
      const match = text.match(pattern);
      if (match) {
        result.participants.push(match[1]);
        break;
      }
    }
  }
  
  // 提取时长
  const durationPatterns = [
    /(\d+)\s*个?小时/,
    /(\d+)\s*分钟/,
    /开\s*([^，,。]+?)(会|讨论)/
  ];
  
  for (const pattern of durationPatterns) {
    const match = text.match(pattern);
    if (match) {
      if (match[0].includes('小时')) {
        result.duration = parseInt(match[1]) * 60;
      } else if (match[0].includes('分钟')) {
        result.duration = parseInt(match[1]);
      } else {
        result.duration = 60; // 默认1小时
      }
      break;
    }
  }
  
  // 检测缺失信息
  if (!result.deadline) {
    result.missingInfo.push('time');
  } else {
    // 有日期但可能没有具体时间
    const d = new Date(result.deadline);
    if (d.getHours() === 0 && d.getMinutes() === 0) {
      result.missingInfo.push('specific_time');
    }
  }
  if (!result.duration) result.missingInfo.push('duration');
  if (!result.location && text.includes('见面', '开会', '讨论')) {
    result.missingInfo.push('location');
  }
  
  // 计算优先级
  const priorityResult = calculatePriority(text, result.deadline);
  result.priority = priorityResult.priority;
  result.priorityAnalysis = priorityResult;
  
  return result;
}

// 格式化缺失信息提示
function formatMissingInfo(missing) {
  const map = {
    'time': '⏰ 时间（什么时候？）',
    'specific_time': '⏰ 具体时间（几点？）',
    'duration': '⏱️ 时长（多久？）',
    'location': '📍 地点（在哪里？）'
  };
  return missing.map(m => map[m] || m);
}

// CLI
const command = process.argv[2];
const text = process.argv[3];
const deadline = process.argv[4];

switch (command) {
  case 'analyze':
    console.log(JSON.stringify(analyzeTodo(text)));
    break;
  case 'priority':
    console.log(JSON.stringify(calculatePriority(text, deadline)));
    break;
  case 'missing':
    const analysis = analyzeTodo(text);
    console.log(JSON.stringify(formatMissingInfo(analysis.missingInfo)));
    break;
  default:
    console.error('Usage: node priority-engine.js <analyze|priority|missing> <text> [deadline]');
    process.exit(1);
}
