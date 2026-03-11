import { processIntent } from './src/index.js';

// 使用新架构调整色温到最高
const result = await processIntent('调整色温到最高');

console.log(result.success ? '✅' : '❌', result.message);
