#!/usr/bin/env node
/**
 * 提醒定时任务管理
 * 对接OpenClaw cron系统设置提醒
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.env.HOME, '.openclaw/workspace/data/schedule');
const CRON_MAP_FILE = path.join(DATA_DIR, 'cron-map.json');

// 加载cron映射
function loadCronMap() {
  if (!fs.existsSync(CRON_MAP_FILE)) return {};
  return JSON.parse(fs.readFileSync(CRON_MAP_FILE, 'utf8'));
}

// 保存cron映射
function saveCronMap(map) {
  fs.writeFileSync(CRON_MAP_FILE, JSON.stringify(map, null, 2));
}

// 设置提醒
function setReminder(todoId, todoTitle, deadline, reminderMinutes = 15) {
  const deadlineDate = new Date(deadline);
  const reminderTime = new Date(deadlineDate.getTime() - reminderMinutes * 60 * 1000);
  
  // 检查是否已过期
  if (reminderTime < new Date()) {
    console.log(JSON.stringify({ 
      success: false, 
      error: '提醒时间已过期',
      todoId 
    }));
    return null;
  }
  
  // 构建提醒文本
  const reminderText = `⏰ 日程提醒\n\n${todoTitle}\n⏰ ${formatTime(deadlineDate)}`;
  
  // 调用openclaw cron命令
  const isoTime = reminderTime.toISOString();
  const command = `openclaw cron add --name "schedule-${todoId}" --at "${isoTime}" --message "${reminderText}"`;
  
  try {
    // 实际调用
    const result = execSync(command, { encoding: 'utf8' });
    
    // 解析结果获取jobId
    const jobMatch = result.match(/job[_-]?id[:\s]+(\S+)/i);
    const jobId = jobMatch ? jobMatch[1] : `schedule-${todoId}`;
    
    // 保存映射
    const map = loadCronMap();
    map[todoId] = {
      jobId,
      reminderTime: isoTime,
      reminderMinutes,
      createdAt: new Date().toISOString()
    };
    saveCronMap(map);
    
    return {
      success: true,
      jobId,
      reminderTime: isoTime,
      reminderMinutes,
      todoId
    };
  } catch (error) {
    console.error('设置提醒失败:', error.message);
    return {
      success: false,
      error: error.message,
      todoId
    };
  }
}

// 取消提醒
function cancelReminder(todoId) {
  const map = loadCronMap();
  const entry = map[todoId];
  
  if (!entry) {
    return { success: false, error: '未找到提醒任务' };
  }
  
  try {
    const command = `openclaw cron remove ${entry.jobId}`;
    execSync(command, { encoding: 'utf8' });
    
    delete map[todoId];
    saveCronMap(map);
    
    return { success: true, todoId };
  } catch (error) {
    console.error('取消提醒失败:', error.message);
    return { success: false, error: error.message, todoId };
  }
}

// 更新提醒（先取消再设置）
function updateReminder(todoId, todoTitle, newDeadline, reminderMinutes = 15) {
  cancelReminder(todoId);
  return setReminder(todoId, todoTitle, newDeadline, reminderMinutes);
}

// 格式化时间显示
function formatTime(date) {
  const d = new Date(date);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekday = weekdays[d.getDay()];
  return `${month}月${day}日 ${weekday} ${hours}:${minutes}`;
}

// 列出所有提醒
function listReminders() {
  return loadCronMap();
}

// 每日提醒任务设置（早上8点汇总当日日程）
function setupDailySummary() {
  const command = `openclaw cron add --name "daily-schedule-summary" --cron "0 8 * * *" --message "📅 今日日程汇总"`;
  
  try {
    const result = execSync(command, { encoding: 'utf8' });
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// CLI
const command = process.argv[2];
const args = process.argv.slice(3);

switch (command) {
  case 'set':
    // set <todoId> <title> <deadline> [reminderMinutes]
    console.log(JSON.stringify(setReminder(args[0], args[1], args[2], parseInt(args[3] || 15))));
    break;
  case 'cancel':
    console.log(JSON.stringify(cancelReminder(args[0])));
    break;
  case 'update':
    console.log(JSON.stringify(updateReminder(args[0], args[1], args[2], parseInt(args[3] || 15))));
    break;
  case 'list':
    console.log(JSON.stringify(listReminders()));
    break;
  case 'daily-setup':
    console.log(JSON.stringify(setupDailySummary()));
    break;
  default:
    console.error('Usage: node reminder-cron.js <set|cancel|update|list|daily-setup> [args...]');
    console.error('  set <todoId> <title> <deadline> [reminderMinutes]');
    console.error('  cancel <todoId>');
    console.error('  update <todoId> <title> <deadline> [reminderMinutes]');
    process.exit(1);
}
