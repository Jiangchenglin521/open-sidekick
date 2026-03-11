import { processIntent } from './src/index.js';

// 使用新架构开启台灯
const result = await processIntent('开启台灯');

console.log(result.success ? '✅' : '❌', result.message);
if (result.data) {
  console.log('数据:', JSON.stringify(result.data, null, 2));
}
