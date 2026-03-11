import { processIntent } from './src/index.js';

// 连续执行三个指令
const commands = [
  '打开台灯',
  '台灯亮度100',
  '台灯冷光'
];

console.log('🎯 执行三连指令：打开台灯 → 最亮 → 最冷\n');

for (const cmd of commands) {
  console.log('🎤', cmd);
  const result = await processIntent(cmd);
  console.log(result.success ? '✅' : '❌', result.message);
  console.log('');
}

console.log('🔍 查询最终状态...');
