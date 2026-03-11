import { processIntent } from './src/index.js';
const result = await processIntent('台灯色温100');
console.log(result.success ? '✅' : '❌', result.message);
