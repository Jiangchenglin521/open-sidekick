import { processIntent } from './src/index.js';

// 测试不同说法
const tests = [
  '把台灯色温调到最高',
  '台灯色温100',
  '台灯冷光',
  '提高台灯色温'
];

for (const input of tests) {
  console.log('\n🎤 测试:', input);
  const result = await processIntent(input);
  console.log(result.success ? '✅' : '❌', result.message);
}
