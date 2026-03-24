#!/usr/bin/env node
/**
 * 查询日程 - 格式化输出今日/本周/全部日程
 */

const { execSync } = require('child_process');
const path = require('path');

const STORE_SCRIPT = path.join(__dirname, 'schedule-store.js');

function runStore(command, args = {}) {
  const cmd = `node "${STORE_SCRIPT}" ${command} '${JSON.stringify(args)}'`;
  try {
    const result = execSync(cmd, { encoding: 'utf8' });
    return JSON.parse(result);
  } catch (error) {
    return [];
  }
}

// 格式化日期
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekday = weekdays[date.getDay()];
  return `${month}月${day}日 ${weekday}`;
}

function formatTime(dateStr) {
  const date = new Date(dateStr);
  return date.toTimeString().slice(0, 5);
}

// 格式化待办项
function formatTodo(todo, index = null) {
  const priorityEmoji = {
    'P0': '🔴',
    'P1': '🟠',
    'P2': '🟡',
    'P3': '🟢'
  };
  
  const statusEmoji = todo.status === 'completed' ? '✅' : '⬜';
  const idx = index !== null ? `${index + 1}. ` : '';
  
  let line = `${statusEmoji} ${priorityEmoji[todo.priority] || '⚪'} ${idx}${todo.title}`;
  
  if (todo.deadline) {
    line += `\n   📅 ${formatDate(todo.deadline)} ${formatTime(todo.deadline)}`;
  }
  
  if (todo.location) {
    line += ` 📍 ${todo.location}`;
  }
  
  if (todo.participants?.length > 0) {
    line += ` 👤 ${todo.participants.join(', ')}`;
  }
  
  return line;
}

// 查询今日
function queryToday() {
  const todos = runStore('today');
  const date = new Date();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  
  let output = `📅 今日日程（${month}月${day}日 ${weekdays[date.getDay()]}）\n`;
  output += '='.repeat(40) + '\n\n';
  
  if (todos.length === 0) {
    output += '🎉 今天没有安排！\n';
  } else {
    const pending = todos.filter(t => t.status === 'pending');
    const completed = todos.filter(t => t.status === 'completed');
    
    if (pending.length > 0) {
      output += `📌 待完成 (${pending.length}项)\n`;
      pending.forEach((todo, i) => {
        output += formatTodo(todo, i) + '\n\n';
      });
    }
    
    if (completed.length > 0) {
      output += `✅ 已完成 (${completed.length}项)\n`;
      completed.forEach((todo, i) => {
        output += formatTodo(todo, i) + '\n\n';
      });
    }
  }
  
  const stats = `${todos.filter(t => t.status === 'completed').length}/${todos.length} 已完成`;
  output += `\n📊 ${stats}`;
  
  return output;
}

// 查询本周
function queryWeek() {
  const todos = runStore('week');
  
  let output = `📅 本周日程\n`;
  output += '='.repeat(40) + '\n\n';
  
  if (todos.length === 0) {
    output += '🎉 本周没有安排！\n';
  } else {
    // 按日期分组
    const byDay = {};
    todos.forEach(todo => {
      const day = todo.deadline ? new Date(todo.deadline).toDateString() : '未安排时间';
      if (!byDay[day]) byDay[day] = [];
      byDay[day].push(todo);
    });
    
    Object.entries(byDay).forEach(([day, dayTodos]) => {
      if (day !== '未安排时间') {
        output += `📆 ${formatDate(day)}\n`;
      } else {
        output += `📆 未安排时间\n`;
      }
      dayTodos.forEach(todo => {
        output += formatTodo(todo) + '\n';
      });
      output += '\n';
    });
  }
  
  return output;
}

// 查询全部
function queryAll(options = {}) {
  const todos = runStore('list', options);
  
  let output = `📋 全部日程\n`;
  output += '='.repeat(40) + '\n\n';
  
  if (todos.length === 0) {
    output += '📭 暂无日程\n';
  } else {
    const pending = todos.filter(t => t.status === 'pending');
    const completed = todos.filter(t => t.status === 'completed');
    
    output += `📌 待完成 (${pending.length}项)\n`;
    if (pending.length > 0) {
      pending.forEach((todo, i) => {
        output += formatTodo(todo, i) + '\n\n';
      });
    } else {
      output += '   暂无\n';
    }
    
    output += `\n✅ 已完成 (${completed.length}项)\n`;
    if (completed.length > 0) {
      completed.slice(-5).forEach((todo, i) => {
        output += formatTodo(todo, i) + '\n\n';
      });
      if (completed.length > 5) {
        output += `   ... 还有 ${completed.length - 5} 项\n`;
      }
    }
  }
  
  return output;
}

// 查询优先级分组
function queryByPriority() {
  const todos = runStore('list', { status: 'pending' });
  
  let output = `📊 按优先级查看\n`;
  output += '='.repeat(40) + '\n\n';
  
  const byPriority = { 'P0': [], 'P1': [], 'P2': [], 'P3': [] };
  todos.forEach(t => {
    if (byPriority[t.priority]) {
      byPriority[t.priority].push(t);
    }
  });
  
  const priorityNames = {
    'P0': '🔴 P0-紧急',
    'P1': '🟠 P1-高',
    'P2': '🟡 P2-中',
    'P3': '🟢 P3-低'
  };
  
  Object.entries(byPriority).forEach(([p, items]) => {
    output += `${priorityNames[p]} (${items.length}项)\n`;
    if (items.length > 0) {
      items.forEach((todo, i) => {
        output += formatTodo(todo, i) + '\n\n';
      });
    } else {
      output += '   暂无\n';
    }
    output += '\n';
  });
  
  return output;
}

// CLI
const command = process.argv[2];
const args = process.argv[3] ? JSON.parse(process.argv[3]) : {};

switch (command) {
  case 'today':
    console.log(queryToday());
    break;
  case 'week':
    console.log(queryWeek());
    break;
  case 'all':
    console.log(queryAll(args));
    break;
  case 'priority':
    console.log(queryByPriority());
    break;
  default:
    console.error('Usage: node query-schedule.js <today|week|all|priority> [options]');
    process.exit(1);
}
