#!/usr/bin/env node
/**
 * 日程存储管理 - CRUD操作
 * 存储格式: JSONL (每行一个JSON对象)
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.env.HOME, '.openclaw/workspace/data/schedule');
const TODO_FILE = path.join(DATA_DIR, 'todos.jsonl');

// 确保目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 生成UUID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// 读取所有待办
function readTodos() {
  if (!fs.existsSync(TODO_FILE)) {
    return [];
  }
  const content = fs.readFileSync(TODO_FILE, 'utf8');
  return content
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

// 写入所有待办
function writeTodos(todos) {
  const content = todos.map(t => JSON.stringify(t)).join('\n') + '\n';
  fs.writeFileSync(TODO_FILE, content);
}

// 创建待办
function createTodo(data) {
  const todo = {
    id: generateId(),
    title: data.title,
    deadline: data.deadline || null,
    duration: data.duration || null,
    location: data.location || null,
    participants: data.participants || [],
    priority: data.priority || 'P2',
    status: 'pending',
    source: data.source || 'user',
    reminderCron: data.reminderCron || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const todos = readTodos();
  todos.push(todo);
  writeTodos(todos);
  
  return todo;
}

// 获取单个待办
function getTodo(id) {
  const todos = readTodos();
  return todos.find(t => t.id === id);
}

// 更新待办
function updateTodo(id, updates) {
  const todos = readTodos();
  const index = todos.findIndex(t => t.id === id);
  if (index === -1) return null;
  
  todos[index] = {
    ...todos[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  writeTodos(todos);
  return todos[index];
}

// 删除待办
function deleteTodo(id) {
  const todos = readTodos();
  const filtered = todos.filter(t => t.id !== id);
  if (filtered.length === todos.length) return false;
  writeTodos(filtered);
  return true;
}

// 列出待办（支持过滤）
function listTodos(options = {}) {
  let todos = readTodos();
  
  // 按状态过滤
  if (options.status) {
    todos = todos.filter(t => t.status === options.status);
  }
  
  // 按日期过滤
  if (options.date) {
    const targetDate = new Date(options.date).toDateString();
    todos = todos.filter(t => {
      if (!t.deadline) return false;
      return new Date(t.deadline).toDateString() === targetDate;
    });
  }
  
  // 按优先级过滤
  if (options.priority) {
    todos = todos.filter(t => t.priority === options.priority);
  }
  
  // 按来源过滤
  if (options.source) {
    todos = todos.filter(t => t.source === options.source);
  }
  
  // 排序：优先级 -> 截止时间
  const priorityOrder = { 'P0': 0, 'P1': 1, 'P2': 2, 'P3': 3 };
  todos.sort((a, b) => {
    const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (pDiff !== 0) return pDiff;
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline) - new Date(b.deadline);
  });
  
  return todos;
}

// 标记完成
function completeTodo(id) {
  return updateTodo(id, { status: 'completed', completedAt: new Date().toISOString() });
}

// 获取今日待办
function getTodayTodos() {
  return listTodos({ date: new Date().toISOString().split('T')[0] });
}

// 获取本周待办
function getWeekTodos() {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  const todos = readTodos().filter(t => {
    if (!t.deadline) return false;
    const d = new Date(t.deadline);
    return d >= startOfWeek && d <= endOfWeek;
  });
  
  const priorityOrder = { 'P0': 0, 'P1': 1, 'P2': 2, 'P3': 3 };
  return todos.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

// 搜索待办
function searchTodos(query) {
  const todos = readTodos();
  const q = query.toLowerCase();
  return todos.filter(t => 
    t.title.toLowerCase().includes(q) ||
    (t.location && t.location.toLowerCase().includes(q)) ||
    (t.participants && t.participants.some(p => p.toLowerCase().includes(q)))
  );
}

// CLI处理
const command = process.argv[2];
const args = process.argv.slice(3);

switch (command) {
  case 'create':
    const data = JSON.parse(args[0]);
    console.log(JSON.stringify(createTodo(data)));
    break;
  case 'get':
    console.log(JSON.stringify(getTodo(args[0]) || null));
    break;
  case 'update':
    const updates = JSON.parse(args[1]);
    console.log(JSON.stringify(updateTodo(args[0], updates)));
    break;
  case 'delete':
    console.log(deleteTodo(args[0]) ? 'true' : 'false');
    break;
  case 'list':
    const options = args[0] ? JSON.parse(args[0]) : {};
    console.log(JSON.stringify(listTodos(options)));
    break;
  case 'today':
    console.log(JSON.stringify(getTodayTodos()));
    break;
  case 'week':
    console.log(JSON.stringify(getWeekTodos()));
    break;
  case 'complete':
    console.log(JSON.stringify(completeTodo(args[0])));
    break;
  case 'search':
    console.log(JSON.stringify(searchTodos(args[0])));
    break;
  default:
    console.error('Usage: node schedule-store.js <create|get|update|delete|list|today|week|complete|search>');
    process.exit(1);
}
