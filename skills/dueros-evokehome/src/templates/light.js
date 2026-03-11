/**
 * 灯光设备模板 - 生成各类灯光控制脚本
 */

export const LightTemplates = {
  // 开灯
  turnOn: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

async function main() {
  try {
    const result = await exec('TurnOnRequest', DEVICE_ID, TOKEN);
    console.log(result.status === 0 ? '✅ ${device.name}已打开' : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`,

  // 关灯
  turnOff: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

async function main() {
  try {
    const result = await exec('TurnOffRequest', DEVICE_ID, TOKEN);
    console.log(result.status === 0 ? '✅ ${device.name}已关闭' : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`,

  // 设置亮度
  setBrightness: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

async function main() {
  const brightness = process.argv[2] || '50';
  const value = parseInt(brightness);
  
  if (isNaN(value) || value < 0 || value > 100) {
    console.error('❌ 亮度值需在 0-100 之间');
    process.exit(1);
  }
  
  try {
    const result = await exec('SetBrightnessPercentageRequest', DEVICE_ID, TOKEN, {
      brightness: { value },
      attribute: 'brightness',
      attributeValue: value
    });
    console.log(result.status === 0 ? '✅ ${device.name}亮度已调至 ' + value + '%' : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`,

  // 设置色温（Kelvin单位）
  setColorTemp: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

async function main() {
  const temp = process.argv[2] || '4000';
  const value = parseInt(temp);
  
  // 色温范围: 1000-10000 Kelvin
  // 2200K=暖色, 2700K=明亮, 4000K=白光, 5500K=日光, 7000K=冷白光, 10000K=最冷
  if (isNaN(value) || value < 1000 || value > 10000) {
    console.error('❌ 色温值需在 1000-10000 Kelvin 之间');
    console.error('   参考值: 2200K(暖色) 2700K(明亮) 4000K(白光) 5500K(日光) 7000K(冷白) 10000K(最冷)');
    process.exit(1);
  }
  
  try {
    const result = await exec('SetColorTemperatureRequest', DEVICE_ID, TOKEN, {
      colorTemperatureInKelvin: value
    });
    console.log(result.status === 0 ? '✅ ${device.name}色温已调至 ' + value + 'K' : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`,

  // 设置模式
  setMode: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';
const MODE_MAP = {
  'night': 'NIGHT', '夜间': 'NIGHT', '睡眠': 'NIGHT',
  'day': 'DAY', '日间': 'DAY', '白天': 'DAY',
  'reading': 'READING', '阅读': 'READING', '读书': 'READING',
  'relax': 'RELAX', '休闲': 'RELAX', '放松': 'RELAX'
};

async function main() {
  const modeInput = process.argv[2] || 'night';
  const mode = MODE_MAP[modeInput.toLowerCase()] || modeInput.toUpperCase();
  
  try {
    const result = await exec('SetModeRequest', DEVICE_ID, TOKEN, {
      mode: { value: mode }
    });
    console.log(result.status === 0 ? '✅ ${device.name}已切换到 ' + mode + ' 模式' : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`,

  // 增加亮度
  incrementBrightness: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

async function main() {
  const step = process.argv[2] || '10';
  
  try {
    const result = await exec('IncrementBrightnessRequest', DEVICE_ID, TOKEN, {
      deltaPercentage: { value: parseInt(step) }
    });
    console.log(result.status === 0 ? '✅ ${device.name}亮度已增加' : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`,

  // 降低亮度
  decrementBrightness: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

async function main() {
  const step = process.argv[2] || '10';
  
  try {
    const result = await exec('DecrementBrightnessRequest', DEVICE_ID, TOKEN, {
      deltaPercentage: { value: parseInt(step) }
    });
    console.log(result.status === 0 ? '✅ ${device.name}亮度已降低' : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`,

  // 增加色温（更冷）
  incrementColorTemp: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

async function main() {
  try {
    const result = await exec('IncrementColorTemperatureRequest', DEVICE_ID, TOKEN);
    console.log(result.status === 0 ? '✅ ${device.name}色温已提高（更冷）' : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`,

  // 降低色温（更暖）
  decrementColorTemp: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

async function main() {
  try {
    const result = await exec('DecrementColorTemperatureRequest', DEVICE_ID, TOKEN);
    console.log(result.status === 0 ? '✅ ${device.name}色温已降低（更暖）' : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`
};

export default LightTemplates;
