import { processIntent } from './src/index.js';
const result = await processIntent('关闭台灯');
console.log(result.success ? '✅' : '❌', result.message);
