/**
 * 空调/温度设备模板
 */

export const ACTemplates = {
  turnOn: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

async function main() {
  try {
    const result = await exec('TurnOnRequest', DEVICE_ID, TOKEN);
    console.log(result.status === 0 ? '✅ ${device.name}已开启' : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`,

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

  setTemperature: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

async function main() {
  const temp = process.argv[2];
  if (!temp || isNaN(parseInt(temp))) {
    console.error('❌ 请指定温度值（如: 26）');
    process.exit(1);
  }
  
  const value = parseInt(temp);
  if (value < 16 || value > 30) {
    console.error('❌ 温度范围应在 16-30°C 之间');
    process.exit(1);
  }
  
  try {
    const result = await exec('SetTargetTemperatureRequest', DEVICE_ID, TOKEN, {
      targetTemperature: { value }
    });
    console.log(result.status === 0 ? '✅ ${device.name}温度已设为 ' + value + '°C' : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`,

  incrementTemp: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

async function main() {
  const delta = process.argv[2] || '1';
  
  try {
    const result = await exec('IncrementTargetTemperatureRequest', DEVICE_ID, TOKEN, {
      deltaTemperature: { value: parseInt(delta) }
    });
    console.log(result.status === 0 ? '✅ ${device.name}温度已升高' : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`,

  decrementTemp: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

async function main() {
  const delta = process.argv[2] || '1';
  
  try {
    const result = await exec('DecrementTargetTemperatureRequest', DEVICE_ID, TOKEN, {
      deltaTemperature: { value: parseInt(delta) }
    });
    console.log(result.status === 0 ? '✅ ${device.name}温度已降低' : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`,

  setMode: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

const MODE_MAP = {
  'cool': 'COOL', '制冷': 'COOL', '冷风': 'COOL',
  'heat': 'HEAT', '制热': 'HEAT', '暖风': 'HEAT', '热风': 'HEAT',
  'auto': 'AUTO', '自动': 'AUTO',
  'fan': 'FAN', '送风': 'FAN',
  'dry': 'DEHUMIDIFICATION', '除湿': 'DEHUMIDIFICATION'
};

async function main() {
  const modeInput = process.argv[2];
  if (!modeInput) {
    console.error('❌ 请指定模式: cool/heat/auto/fan/dry');
    process.exit(1);
  }
  
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

  setFanSpeed: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

async function main() {
  const speed = process.argv[2];
  if (!speed || isNaN(parseInt(speed))) {
    console.error('❌ 请指定风速值（0-100）');
    process.exit(1);
  }
  
  const value = parseInt(speed);
  
  try {
    const result = await exec('SetFanSpeedRequest', DEVICE_ID, TOKEN, {
      fanSpeed: { value }
    });
    console.log(result.status === 0 ? '✅ ${device.name}风速已设为 ' + value : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`
};

export default ACTemplates;
